import postgres from "postgres";
import type { PreferenceRow, RawInteractionEvent } from "./types";

const sql = postgres(process.env.DATABASE_URL!, { max: 10 });

export async function getPreference(
  userId: string,
  domain: string,
  preferenceKey: string,
  contextSegment: string | null
): Promise<PreferenceRow | null> {
  const rows = await sql<PreferenceRow[]>`
    select * from preferences
    where user_id = ${userId}
      and domain = ${domain}
      and preference_key = ${preferenceKey}
      and context_segment is not distinct from ${contextSegment}
    limit 1
  `;
  return rows[0] ?? null;
}

export async function upsertPreference(pref: {
  user_id: string;
  domain: string;
  preference_key: string;
  context_segment: string | null;
  value: unknown;
  confidence: number;
  source: "explicit" | "inferred";
  locked: boolean;
  evidence_count: number;
  decay_rate: number;
}): Promise<PreferenceRow> {
  const rows = await sql<PreferenceRow[]>`
    insert into preferences (
      user_id, domain, preference_key, context_segment,
      value, confidence, source, locked, evidence_count, decay_rate, last_updated
    ) values (
      ${pref.user_id}, ${pref.domain}, ${pref.preference_key}, ${pref.context_segment},
      ${sql.json(pref.value as any)}, ${pref.confidence}, ${pref.source}, ${pref.locked},
      ${pref.evidence_count}, ${pref.decay_rate}, now()
    )
    on conflict (user_id, domain, preference_key, context_segment)
    do update set
      value = excluded.value,
      confidence = excluded.confidence,
      source = excluded.source,
      locked = excluded.locked,
      evidence_count = excluded.evidence_count,
      decay_rate = excluded.decay_rate,
      last_updated = now()
    returning *
  `;
  return rows[0];
}

export async function insertEvent(
  event: RawInteractionEvent,
  contextSegment: string | null,
  resultedValue: unknown,
  resultedConfidence: number | null
) {
  await sql`
    insert into preference_events (
      user_id, domain, preference_key, context_segment, event_type,
      raw_value, context, source, weight, resulted_value, resulted_confidence
    ) values (
      ${event.user_id}, ${event.domain}, ${event.preference_key}, ${contextSegment}, ${event.event_type},
      ${sql.json((event.raw_value ?? null) as any)}, ${sql.json((event.context ?? {}) as any)},
      ${event.source}, ${event.weight ?? 1.0},
      ${sql.json((resultedValue ?? null) as any)}, ${resultedConfidence}
    )
  `;
}

/** Full history for one preference -- proves *why* a value/confidence is what it is. */
export async function getEventHistory(
  userId: string,
  domain: string,
  preferenceKey: string,
  limit = 100
) {
  return sql`
    select * from preference_events
    where user_id = ${userId} and domain = ${domain} and preference_key = ${preferenceKey}
    order by created_at desc
    limit ${limit}
  `;
}

export async function listPreferences(userId: string, domain?: string) {
  if (domain) {
    return sql<PreferenceRow[]>`
      select * from preferences where user_id = ${userId} and domain = ${domain}
    `;
  }
  return sql<PreferenceRow[]>`select * from preferences where user_id = ${userId}`;
}

export { sql };
