export type Source = "explicit" | "inferred";

export type EventType =
  | "suggestion_shown"
  | "suggestion_selected"
  | "suggestion_accepted"
  | "suggestion_rejected"
  | "user_edited"
  | "user_changed"
  | "user_cancelled"
  | "explicit_statement"
  | "explicit_feedback";

export type Domain =
  | "communication"
  | "writing_style"
  | "travel"
  | "flights"
  | "hotels"
  | "scheduling"
  | "food"
  | "general";

export interface PreferenceRow {
  id: string;
  user_id: string;
  domain: Domain;
  preference_key: string;
  context_segment: string | null;
  value: unknown;
  confidence: number;
  source: Source;
  locked: boolean;
  evidence_count: number;
  decay_rate: number;
  last_updated: string;
  created_at: string;
}

export interface RawInteractionEvent {
  user_id: string;
  domain: Domain;
  preference_key: string;
  event_type: EventType;
  raw_value: unknown; // whatever the domain module knows how to extract a comparable value from
  context?: Record<string, unknown>;
  source: Source;
  weight?: number; // default 1.0, corrections should pass 3-5
}

/**
 * Every domain implements this. The engine core knows nothing about
 * flights vs. emails vs. meetings -- only these three functions.
 */
export interface DomainModule {
  domain: Domain;

  /** context keys this domain cares about, for optional segmentation later */
  contextKeys: string[];

  /** default EMA decay rate (alpha) for this domain, 0 < alpha <= 1. Higher = faster to shift. */
  defaultDecayRate: number;

  /**
   * Turn a raw event's raw_value into a plain number or comparable value
   * the EMA update can work with. Return null if this event shouldn't move the value
   * (e.g. a "suggestion_shown" with no user action yet).
   */
  extractValue(event: RawInteractionEvent): number | string | null;

  /**
   * Combine the current value with a newly extracted value.
   * Default engine implementation does numeric EMA; override only if a domain
   * needs custom logic (e.g. categorical "preferred airline" = most frequent weighted value).
   */
  updateValue?(
    current: number | string | null,
    incoming: number | string,
    alpha: number,
    weight: number
  ): number | string;
}
