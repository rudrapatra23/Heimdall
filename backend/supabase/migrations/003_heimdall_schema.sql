-- Heimdall core schema
-- Assumes Supabase Auth's auth.users table already exists (user_id references it).
-- All tables are per-user; nothing here trains a per-user model, only stores per-user state.

create extension if not exists "pgcrypto";

-- 1. PREFERENCES (current, derived state — what the engine believes NOW)

create table if not exists preferences (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,

  domain            text not null,          -- 'communication' | 'writing_style' | 'travel' | 'flights'
                                              -- | 'hotels' | 'scheduling' | 'food' | 'general'
  preference_key    text not null,          -- 'tone', 'flight_price_sensitivity', 'meeting_duration_minutes', ...

  -- optional context segmentation, e.g. 'time_of_day=morning'. NULL = aggregate/global value.
  context_segment   text,

  value             jsonb not null,         -- flexible: number, string, {min,max}, enum, etc.
  confidence        numeric(4,3) not null default 0.0 check (confidence >= 0 and confidence <= 1),

  source            text not null check (source in ('explicit', 'inferred')),
  locked            boolean not null default false,  -- true for explicit prefs: inferred updates may not overwrite

  evidence_count    integer not null default 0,
  decay_rate        numeric(4,3) not null default 0.200, -- alpha for EMA, overridable per preference

  last_updated      timestamptz not null default now(),
  created_at        timestamptz not null default now(),

  unique (user_id, domain, preference_key, context_segment)
);

create index if not exists idx_preferences_user_domain
  on preferences (user_id, domain);


-- 2. PREFERENCE_EVENTS (raw, append-only, immutable interaction log)
--    This is the source of truth. `preferences` is always reproducible from this table.

create table if not exists preference_events (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,

  domain             text not null,
  preference_key     text not null,
  context_segment    text,

  event_type         text not null check (event_type in (
                        'suggestion_shown',
                        'suggestion_selected',
                        'suggestion_accepted',
                        'suggestion_rejected',
                        'user_edited',
                        'user_changed',
                        'user_cancelled',
                        'explicit_statement',
                        'explicit_feedback'
                      )),

  raw_value          jsonb,              -- the observed value, e.g. { "price_delta_pct": 12 } or { "duration_min": 30 }
  context             jsonb,              -- feature dict at time of event, e.g. { "time_of_day": "morning", "trip_purpose": "work" }

  source             text not null check (source in ('explicit', 'inferred')),
  weight             numeric(4,2) not null default 1.00,  -- corrections get 3-5x, passive accepts get 1.0

  -- snapshot of the preference AFTER this event was applied — makes learning reproducible/explainable
  resulted_value       jsonb,
  resulted_confidence   numeric(4,3),

  created_at         timestamptz not null default now()
);

create index if not exists idx_events_user_domain_key
  on preference_events (user_id, domain, preference_key, created_at desc);


-- 3. TEMPORARY CONTEXT (task-scoped, expires — never influences long-term preferences)

create table if not exists temporary_context (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  task_id     text,                 -- id of whatever task/session this belongs to
  key         text not null,
  value       jsonb not null,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_temp_context_user_expiry
  on temporary_context (user_id, expires_at);


-- 4. LONG-TERM MEMORIES (free-form facts, not preference values)
--    e.g. "user's daughter's name is Priya", "user works at Acme Corp"

create table if not exists long_term_memories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  content     text not null,
  domain      text,                 -- optional grouping, reuses same domain vocabulary
  source      text not null check (source in ('explicit', 'inferred')),
  created_at  timestamptz not null default now()
);

create index if not exists idx_memories_user
  on long_term_memories (user_id);
