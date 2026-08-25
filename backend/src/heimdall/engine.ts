import { domainRegistry } from "./domains";
import type { PreferenceRow, RawInteractionEvent } from "./types";
import { getPreference, insertEvent, upsertPreference } from "./db";

/**
 * Confidence growth: asymptotically approaches 1 as evidence_count grows,
 * using the same alpha as the value's EMA (more evidence = more confidence,
 * diminishing returns). Corrections (weight > 1) grow confidence faster,
 * but a single event can never jump confidence to a high value alone.
 */
function nextConfidence(currentConfidence: number, alpha: number, weight: number): number {
  const c = Number(currentConfidence);
  const a = Number(alpha);
  const safeConfidence = Number.isFinite(c) ? c : 0;
  const safeAlpha = Number.isFinite(a) ? a : 0.25;

  const effectiveAlpha = 1 - Math.pow(1 - safeAlpha, weight);
  const next = safeConfidence + (1 - safeConfidence) * effectiveAlpha * 0.5;
  return Math.min(1, Math.round(next * 1000) / 1000);
}

export async function recordInteractionEvent(event: RawInteractionEvent): Promise<PreferenceRow> {
  const domainModule = domainRegistry[event.domain];
  if (!domainModule) {
    throw new Error(`No domain module registered for "${event.domain}"`);
  }

  const contextSegment = deriveContextSegment(event, domainModule.contextKeys);
  const existing = await getPreference(
    event.user_id,
    event.domain,
    event.preference_key,
    contextSegment
  );

  const fallbackAlpha = domainModule.defaultDecayRate ?? 0.25;
  const rawDecayRate = existing?.decay_rate ?? fallbackAlpha;
  const alpha = Number.isFinite(Number(rawDecayRate)) ? Number(rawDecayRate) : fallbackAlpha;

  // Explicit statements always write straight through and lock the preference.
  if (event.event_type === "explicit_statement") {
    const value = domainModule.extractValue(event);
    const updated = await upsertPreference({
      user_id: event.user_id,
      domain: event.domain,
      preference_key: event.preference_key,
      context_segment: contextSegment,
      value: value ?? event.raw_value,
      confidence: 1.0,
      source: "explicit",
      locked: true,
      evidence_count: (existing?.evidence_count ?? 0) + 1,
      decay_rate: alpha,
    });
    await insertEvent(event, contextSegment, updated.value, updated.confidence);
    return updated;
  }

  // Inferred events never overwrite a locked (explicit) preference's value.
  if (existing?.locked) {
    await insertEvent(event, contextSegment, existing.value, existing.confidence);
    return existing;
  }

  const extracted = domainModule.extractValue(event);
  if (extracted === null) {
    await insertEvent(event, contextSegment, existing?.value ?? null, existing?.confidence ?? 0);
    return existing as PreferenceRow;
  }

  const weight = event.weight ?? defaultWeightFor(event.event_type);

  const updateFn = domainModule.updateValue ?? ((_c, incoming) => incoming);
  const newValue = updateFn(
    (existing?.value as number | string | null) ?? null,
    extracted,
    alpha,
    weight
  );
  
  const rawConfidence = existing?.confidence ?? 0;
  const currentConfidence = Number.isFinite(Number(rawConfidence)) ? Number(rawConfidence) : 0;
  const newConfidence = nextConfidence(currentConfidence, alpha, weight);

  const updated = await upsertPreference({
    user_id: event.user_id,
    domain: event.domain,
    preference_key: event.preference_key,
    context_segment: contextSegment,
    value: newValue,
    confidence: newConfidence,
    source: "inferred",
    locked: false,
    evidence_count: (existing?.evidence_count ?? 0) + 1,
    decay_rate: alpha,
  });

  await insertEvent(event, contextSegment, updated.value, updated.confidence);
  return updated;
}

/** Passive signals get weight 1; explicit corrections get more say. */
function defaultWeightFor(eventType: RawInteractionEvent["event_type"]): number {
  switch (eventType) {
    case "user_edited":
    case "user_changed":
    case "user_cancelled":
    case "explicit_feedback":
      return 4;
    case "suggestion_rejected":
      return 3;
    case "suggestion_accepted":
    case "suggestion_selected":
      return 1;
    default:
      return 1;
  }
}

/**
 * v1: only segment by context if the event explicitly carries a single
 * relevant context key with a value. Otherwise store as the aggregate (null segment).
 */
function deriveContextSegment(
  event: RawInteractionEvent,
  contextKeys: string[]
): string | null {
  if (!event.context) return null;
  for (const key of contextKeys) {
    if (event.context[key] !== undefined) {
      return `${key}=${event.context[key]}`;
    }
  }
  return null;
}

/**
 * What the execution agent calls before acting: give it the value it needs
 * plus enough metadata to decide whether to trust it or ask the user.
 */
export async function getPreferenceForAgent(
  userId: string,
  domain: string,
  preferenceKey: string,
  contextSegment: string | null = null
) {
  const pref = await getPreference(userId, domain, preferenceKey, contextSegment);
  if (!pref) return null;
  return {
    value: pref.value,
    confidence: pref.confidence,
    source: pref.source,
    evidence_count: pref.evidence_count,
    last_updated: pref.last_updated,
    locked: pref.locked,
  };
}