import type { DomainModule, RawInteractionEvent } from "./types";

/**
 * Domains that never move value on a passive "shown" event -- only real
 * user actions count. Shared by most domains below.
 */
const ACTION_EVENT_TYPES = new Set([
  "suggestion_selected",
  "suggestion_accepted",
  "suggestion_rejected",
  "user_edited",
  "user_changed",
  "user_cancelled",
  "explicit_statement",
  "explicit_feedback",
]);

function numericEMA(
  current: number | string | null,
  incoming: number,
  alpha: number,
  weight: number
): number {
  if (current === null || typeof current !== "number") return incoming;
  // weight > 1 effectively applies the update `weight` times in one step,
  // without literally looping (keeps a single audit-friendly update per event).
  const effectiveAlpha = 1 - Math.pow(1 - alpha, weight);
  return current * (1 - effectiveAlpha) + incoming * effectiveAlpha;
}

/**
 * For categorical preferences (e.g. preferred airline, preferred hotel chain)
 * we can't average strings, so we track a simple weighted "score" per category
 * *outside* this module (in a separate categorical table or JSONB map) --
 * for v1, keep categorical prefs as (value = mode of recent choices),
 * updated only when the mode changes with enough confidence. This helper
 * just returns the incoming category; the engine's confidence math still
 * grows/shrinks with repetition.
 */
function categoricalUpdate(
  _current: number | string | null,
  incoming: number | string
): number | string {
  return incoming;
}

export const communicationDomain: DomainModule = {
  domain: "communication",
  contextKeys: ["channel", "recipient_type"], // e.g. email vs slack, boss vs friend
  defaultDecayRate: 0.25,
  extractValue(event: RawInteractionEvent) {
    if (!ACTION_EVENT_TYPES.has(event.event_type)) return null;
    // raw_value expected shape: { tone_score: number } where e.g. 0 = very formal, 1 = very casual
    const v = event.raw_value as { tone_score?: number } | undefined;
    return typeof v?.tone_score === "number" ? v.tone_score : null;
  },
  updateValue: (current, incoming, alpha, weight) =>
    numericEMA(current, incoming as number, alpha, weight),
};

export const flightsDomain: DomainModule = {
  domain: "flights",
  contextKeys: ["trip_purpose", "days_advance_booked"],
  defaultDecayRate: 0.2,
  extractValue(event: RawInteractionEvent) {
    if (!ACTION_EVENT_TYPES.has(event.event_type)) return null;
    // raw_value expected shape: { price_delta_pct_from_cheapest: number, stops: number }
    const v = event.raw_value as { price_delta_pct_from_cheapest?: number } | undefined;
    return typeof v?.price_delta_pct_from_cheapest === "number"
      ? v.price_delta_pct_from_cheapest
      : null;
  },
  updateValue: (current, incoming, alpha, weight) =>
    numericEMA(current, incoming as number, alpha, weight),
};

export const hotelsDomain: DomainModule = {
  domain: "hotels",
  contextKeys: ["trip_purpose"],
  defaultDecayRate: 0.2,
  extractValue(event: RawInteractionEvent) {
    if (!ACTION_EVENT_TYPES.has(event.event_type)) return null;
    // raw_value expected shape: { priority: "price" | "location" | "rating" }
    const v = event.raw_value as { priority?: string } | undefined;
    return v?.priority ?? null;
  },
  updateValue: categoricalUpdate,
};

export const schedulingDomain: DomainModule = {
  domain: "scheduling",
  contextKeys: ["day_of_week", "meeting_type"],
  defaultDecayRate: 0.25,
  extractValue(event: RawInteractionEvent) {
    if (!ACTION_EVENT_TYPES.has(event.event_type)) return null;
    // raw_value expected shape: { duration_minutes: number } OR { preferred_start_hour: number }
    const v = event.raw_value as
      | { duration_minutes?: number; preferred_start_hour?: number }
      | undefined;
    if (typeof v?.duration_minutes === "number") return v.duration_minutes;
    if (typeof v?.preferred_start_hour === "number") return v.preferred_start_hour;
    return null;
  },
  updateValue: (current, incoming, alpha, weight) =>
    numericEMA(current, incoming as number, alpha, weight),
};

export const domainRegistry: Record<string, DomainModule> = {
  communication: communicationDomain,
  writing_style: communicationDomain, // reuse same shape unless you want to split later
  flights: flightsDomain,
  hotels: hotelsDomain,
  travel: hotelsDomain,
  scheduling: schedulingDomain,
};
