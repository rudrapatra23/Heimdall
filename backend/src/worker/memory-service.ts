import { extractMemoryFromMessage } from "./memory-extractor";
import { recordInteractionEvent } from "../heimdall/engine";
import {
  insertMemory,
  upsertTemporaryContext,
  listMemories,
  getActiveTemporaryContext,
  listPreferences,
} from "../heimdall/db";
import type { Domain, RawInteractionEvent } from "../heimdall/types";

const VALID_DOMAINS = new Set([
  "communication", "writing_style", "travel", "flights",
  "hotels", "scheduling", "food", "general",
]);

function safeDomain(d: string): Domain {
  return VALID_DOMAINS.has(d) ? (d as Domain) : "general";
}

/**
 * The top-level function called from the Telegram message handler.
 *
 * Extracts memory signals from the user's message, then routes each to the
 * appropriate store:
 *   - preference / habit  → engine (recordInteractionEvent → EMA + confidence + locked)
 *   - correction          → engine with weight=4 (overrides locked prefs)
 *   - fact / goal         → long_term_memories (permanent, free-form)
 *   - temp_context        → temporary_context (TTL = 4 h)
 *   - irrelevant          → nothing stored
 *
 * Returns a short human-readable description of what was stored, or null.
 */
export async function learnFromMessage(
  userId: string,
  message: string
): Promise<string | null> {
  const extracted = await extractMemoryFromMessage(message);
  if (!extracted) return null;

  const domain = safeDomain(extracted.domain);

  switch (extracted.category) {
    case "preference":
    case "habit": {
      if (!extracted.preference_key) break;
      const event: RawInteractionEvent = {
        user_id: userId,
        domain,
        preference_key: extracted.preference_key,
        event_type: "explicit_statement",
        raw_value: { value: extracted.value ?? extracted.content },
        source: "explicit",
        weight: 1,
      };
      await recordInteractionEvent(event);
      return `Noted your preference: ${extracted.content}`;
    }

    case "correction": {
      if (!extracted.preference_key) break;
      // weight 4 is the same as user_changed — overrides any locked preference
      const event: RawInteractionEvent = {
        user_id: userId,
        domain,
        preference_key: extracted.preference_key,
        event_type: "explicit_statement",
        raw_value: { value: extracted.value ?? extracted.content },
        source: "explicit",
        weight: 4,
      };
      await recordInteractionEvent(event);
      return `Updated your preference: ${extracted.content}`;
    }

    case "fact":
    case "goal": {
      await insertMemory({
        user_id: userId,
        content: extracted.content!,
        domain: extracted.domain ?? null,
        source: "explicit",
      });
      return `Got it: ${extracted.content}`;
    }

    case "temp_context": {
      await upsertTemporaryContext({
        user_id: userId,
        task_id: null,
        key: extracted.preference_key ?? "current_task",
        value: extracted.content,
        ttl_hours: 4,
      });
      return `Tracking current context: ${extracted.content}`;
    }
  }

  return null;
}

/**
 * Loads the user's current preferences, long-term memories, and active temporary
 * context, then formats them as a human-readable string for injection into the
 * Groq system prompt before every chat call.
 */
export async function buildUserContext(userId: string): Promise<string> {
  const [prefs, memories, tempCtx] = await Promise.all([
    listPreferences(userId).catch(() => []),
    listMemories(userId, undefined, 10).catch(() => []),
    getActiveTemporaryContext(userId).catch(() => []),
  ]);

  const parts: string[] = [];

  if (prefs.length > 0) {
    const prefLines = prefs.map(
      (p) =>
        `- [${p.domain}/${p.preference_key}] = ${JSON.stringify(p.value)} (confidence: ${p.confidence}, source: ${p.source})`
    );
    parts.push(`User preferences:\n${prefLines.join("\n")}`);
  }

  if (memories.length > 0) {
    const memLines = memories.map((m) => `- ${m.content}`);
    parts.push(`Known facts/goals about the user:\n${memLines.join("\n")}`);
  }

  if (tempCtx.length > 0) {
    const ctxLines = tempCtx.map((c) => `- ${c.key}: ${JSON.stringify(c.value)}`);
    parts.push(`Current context (temporary):\n${ctxLines.join("\n")}`);
  }

  return parts.length > 0
    ? parts.join("\n\n")
    : "No stored preferences or memories yet.";
}
