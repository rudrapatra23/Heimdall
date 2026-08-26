import {
  pgTable,
  pgSchema,
  uuid,
  text,
  timestamp,
  integer,
  numeric,
  boolean,
  jsonb,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ──────────────────────────────────────────────────────────
// auth.users stub
// Not managed by Drizzle (owned by Supabase Auth) — declared only
// so FKs from our tables can reference it. schemaFilter: ['public']
// in drizzle.config.ts already keeps push from touching the auth schema.
// ──────────────────────────────────────────────────────────
const authSchema = pgSchema('auth');
export const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

// ──────────────────────────────────────────────────────────
// profiles
// One row per Supabase auth.users entry (1:1 mapping).
// id = auth.users.id — the canonical user identity.
// ──────────────────────────────────────────────────────────
export const profiles = pgTable('profiles', {
  // Must match auth.users.id exactly — set by the DB trigger on sign-up.
  id:               uuid('id').primaryKey(),
  email:            text('email').notNull(),
  full_name:        text('full_name'),
  // Contact phone — NOT OTP-verified. Stored in E.164 format where possible.
  phone_number:     text('phone_number'),
  // Stable Telegram numeric user ID. Prefer this over telegram_username.
  telegram_user_id: text('telegram_user_id').unique(),
  telegram_username:  text('telegram_username'),
  telegram_linked_at: timestamp('telegram_linked_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ──────────────────────────────────────────────────────────
// telegram_link_tokens
// Single-use, 15-minute TTL tokens for Telegram deep-link
// account linking. Only the SHA-256 hash is stored.
// ──────────────────────────────────────────────────────────
export const telegramLinkTokens = pgTable(
  'telegram_link_tokens',
  {
    id:         uuid('id').primaryKey().defaultRandom(),
    user_id:    uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    // SHA-256 hex of the raw token. Raw token is never stored.
    token_hash: text('token_hash').notNull().unique(),
    expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
    // Non-null once consumed (linked or intentionally invalidated).
    used_at:    timestamp('used_at', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_telegram_link_tokens_user_id').on(table.user_id),
  ]
);

// ──────────────────────────────────────────────────────────
// gmail_credentials
// Future: Gmail OAuth tokens per user.
// Schema prepared now; NOT used in current phase.
// NEVER expose these columns to the frontend.
// ──────────────────────────────────────────────────────────
export const gmailCredentials = pgTable('gmail_credentials', {
  id:            uuid('id').primaryKey().defaultRandom(),
  user_id:       uuid('user_id').notNull().unique().references(() => profiles.id, { onDelete: 'cascade' }),
  access_token:  text('access_token'),   // Short-lived; refresh before use.
  refresh_token: text('refresh_token'),  // Long-lived; store securely.
  token_expiry:  timestamp('token_expiry', { withTimezone: true }),
  scope:         text('scope'),          // Comma-separated OAuth scopes granted.
  created_at:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at:    timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ──────────────────────────────────────────────────────────
// early_access_applications
// Applications submitted via the "Get Early Access" form.
// Used to verify users before they can sign in.
// ──────────────────────────────────────────────────────────
export const earlyAccessApplications = pgTable(
  'early_access_applications',
  {
    id:               uuid('id').primaryKey().defaultRandom(),
    name:             text('name').notNull(),
    email:            text('email').notNull().unique(),
    how_did_you_know: text('how_did_you_know').notNull(),
    status:           text('status').notNull().default('pending'), // pending, approved, rejected
    created_at:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at:       timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_early_access_applications_email').on(table.email),
    index('idx_early_access_applications_status').on(table.status),
  ]
);

// ──────────────────────────────────────────────────────────
// preferences
// Current, derived state — what the engine believes NOW.
// ──────────────────────────────────────────────────────────
export const preferences = pgTable(
  'preferences',
  {
    id:              uuid('id').primaryKey().defaultRandom(),
    user_id:         uuid('user_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),

    domain:          text('domain').notNull(),
    preference_key:  text('preference_key').notNull(),
    context_segment: text('context_segment'),

    value:           jsonb('value').notNull(),
    confidence:      numeric('confidence', { precision: 4, scale: 3 }).notNull().default('0.0'),

    source:          text('source').notNull(),
    locked:          boolean('locked').notNull().default(false),

    evidence_count:  integer('evidence_count').notNull().default(0),
    decay_rate:      numeric('decay_rate', { precision: 4, scale: 3 }).notNull().default('0.200'),

    last_updated:    timestamp('last_updated', { withTimezone: true }).notNull().defaultNow(),
    created_at:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('preferences_user_id_domain_preference_key_context_segment_key')
      .on(table.user_id, table.domain, table.preference_key, table.context_segment),
    index('idx_preferences_user_domain').on(table.user_id, table.domain),
    check('preferences_confidence_check', sql`${table.confidence} >= 0 and ${table.confidence} <= 1`),
    check('preferences_source_check', sql`${table.source} in ('explicit', 'inferred')`),
  ]
);

// ──────────────────────────────────────────────────────────
// preference_events
// Raw, append-only, immutable interaction log — source of truth
// that `preferences` is always reproducible from.
// ──────────────────────────────────────────────────────────
export const preferenceEvents = pgTable(
  'preference_events',
  {
    id:              uuid('id').primaryKey().defaultRandom(),
    user_id:         uuid('user_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),

    domain:          text('domain').notNull(),
    preference_key:  text('preference_key').notNull(),
    context_segment: text('context_segment'),

    event_type:      text('event_type').notNull(),

    raw_value:       jsonb('raw_value'),
    context:         jsonb('context'),

    source:          text('source').notNull(),
    weight:          numeric('weight', { precision: 4, scale: 2 }).notNull().default('1.00'),

    resulted_value:      jsonb('resulted_value'),
    resulted_confidence: numeric('resulted_confidence', { precision: 4, scale: 3 }),

    created_at:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_events_user_domain_key').on(table.user_id, table.domain, table.preference_key, table.created_at),
    check('preference_events_event_type_check', sql`${table.event_type} in (
      'suggestion_shown', 'suggestion_selected', 'suggestion_accepted', 'suggestion_rejected',
      'user_edited', 'user_changed', 'user_cancelled', 'explicit_statement', 'explicit_feedback'
    )`),
    check('preference_events_source_check', sql`${table.source} in ('explicit', 'inferred')`),
  ]
);

// ──────────────────────────────────────────────────────────
// temporary_context
// Task-scoped, expires — never influences long-term preferences.
// ──────────────────────────────────────────────────────────
export const temporaryContext = pgTable(
  'temporary_context',
  {
    id:         uuid('id').primaryKey().defaultRandom(),
    user_id:    uuid('user_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
    task_id:    text('task_id'),
    key:        text('key').notNull(),
    value:      jsonb('value').notNull(),
    expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_temp_context_user_expiry').on(table.user_id, table.expires_at),
  ]
);

// ──────────────────────────────────────────────────────────
// long_term_memories
// Free-form facts, not preference values.
// ──────────────────────────────────────────────────────────
export const longTermMemories = pgTable(
  'long_term_memories',
  {
    id:         uuid('id').primaryKey().defaultRandom(),
    user_id:    uuid('user_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
    content:    text('content').notNull(),
    domain:     text('domain'),
    source:     text('source').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_memories_user').on(table.user_id),
    check('long_term_memories_source_check', sql`${table.source} in ('explicit', 'inferred')`),
  ]
);

// Exported type helpers — inferred directly from schema
export type Profile                  = typeof profiles.$inferSelect;
export type NewProfile               = typeof profiles.$inferInsert;
export type TelegramLinkToken        = typeof telegramLinkTokens.$inferSelect;
export type NewTelegramLinkToken     = typeof telegramLinkTokens.$inferInsert;
export type GmailCredential          = typeof gmailCredentials.$inferSelect;
export type EarlyAccessApplication   = typeof earlyAccessApplications.$inferSelect;
export type NewEarlyAccessApplication = typeof earlyAccessApplications.$inferInsert;
export type Preference               = typeof preferences.$inferSelect;
export type NewPreference            = typeof preferences.$inferInsert;
export type PreferenceEvent          = typeof preferenceEvents.$inferSelect;
export type NewPreferenceEvent       = typeof preferenceEvents.$inferInsert;
export type TemporaryContext         = typeof temporaryContext.$inferSelect;
export type NewTemporaryContext      = typeof temporaryContext.$inferInsert;
export type LongTermMemory           = typeof longTermMemories.$inferSelect;
export type NewLongTermMemory        = typeof longTermMemories.$inferInsert;