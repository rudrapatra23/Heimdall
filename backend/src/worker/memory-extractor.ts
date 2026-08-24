import { groqChat } from "./groq-client";

/**
 * Categories of information we want to extract.
 * 'irrelevant' = no memory should be stored.
 */
export type MemoryCategory =
  | "fact"         // factual info about the user: "I'm a backend engineer"
  | "preference"   // stated preferences: "I prefer concise responses"
  | "habit"        // recurring patterns: "I usually work at night"
  | "goal"         // aspirations: "I want to become a backend engineer"
  | "temp_context" // current in-progress context: "I'm debugging Gmail OAuth right now"
  | "correction"   // supersedes a previous preference: "I used to prefer Python, now I prefer Go"
  | "irrelevant";  // transient chitchat: "I'm eating pizza"

export interface ExtractedMemory {
  category: MemoryCategory;
  /** Human-readable normalized statement, null if irrelevant */
  content: string | null;
  /** Domain from the existing Domain union */
  domain: string;
  /** preference_key if this maps to the preference engine (snake_case) */
  preference_key: string | null;
  /** The value to store if this is a preference/habit/goal */
  value: string | null;
  /** True if this supersedes/updates a previous preference */
  is_correction: boolean;
  /** What was the old value if is_correction=true */
  old_value: string | null;
}

const EXTRACTION_SYSTEM_PROMPT = `You are a memory extraction assistant for a personal AI assistant called Heimdall.

Analyze the user's message and extract any information that would be useful to remember for future conversations.

KEY PRINCIPLE: Extract opportunistically from ALL messages — not just explicit "I prefer..." statements.
Any message can signal a preference, habit, fact, goal, or context. Look for:
- Feedback or complaints    → preference  (e.g. "too short" → prefers detailed; "stop using bullets" → prefers prose)
- Descriptions of activity  → temp_context (e.g. "been stuck on this OAuth bug" → current task)
- Casual routine mentions   → habit        (e.g. "I'm always up late" → works nights)
- Projects or learning      → goal         (e.g. "trying to break into backend" → career goal)
- Personal facts in passing → fact         (e.g. "I've been coding for 10 years" → experienced dev)

Respond ONLY with a valid JSON object matching this exact shape:
{
  "category": "fact" | "preference" | "habit" | "goal" | "temp_context" | "correction" | "irrelevant",
  "content": string | null,
  "domain": "general" | "communication" | "writing_style" | "travel" | "flights" | "hotels" | "scheduling" | "food",
  "preference_key": string | null,
  "value": string | null,
  "is_correction": boolean,
  "old_value": string | null
}

Category rules:
- "irrelevant"  : no durable learning value — transient physical states (eating, hunger), greetings, pure questions with no personal signal, or filler. Set content=null.
- "fact"        : stable personal info revealed in any way — job, skills, location, family, experience level.
- "preference"  : the message reveals what the user likes/dislikes/wants — stated directly ("I prefer X") OR implied through feedback, complaints, or requests ("too short", "stop using bullet points", "explain properly next time", "I hate long intros").
- "habit"       : a recurring pattern or routine — "I usually", "I always", "I tend to", "I'm always up late", or behavioral patterns implied by description.
- "goal"        : aspiration, ongoing project, or learning intent — "trying to", "working on", "want to become", "learning X", "breaking into".
- "temp_context": current in-progress task, focus, or situation — "been stuck on", "working on right now", "just started", "in the middle of", "debugging X".
- "correction"  : explicitly signals a change from a previous preference or state ("I used to ... now I ...", "switched from ... to ..."). Set is_correction=true and old_value.

preference_key guidelines (snake_case):
- Response length/detail     → "response_style"    (values: "concise", "detailed", "verbose")
- Response format            → "response_format"   (values: "prose", "bullets", "structured")
- Programming language       → "programming_language"
- Work timing                → "work_schedule"     (values: "nights", "mornings", "afternoons")
- Current task               → "current_task"      (for temp_context)

- domain "communication"  : response tone, length, format preferences.
- domain "general"        : personal facts, goals, habits about the user.
- domain "scheduling"     : work hours, meeting times, routines.
- domain "food"           : food preferences.
- value: simple normalized string (e.g. "detailed", "Go", "nights", "backend engineer").
- content: a clean sentence summarizing what was learned.

Do NOT add markdown, explanations, or any text outside the JSON object.`;

/**
 * Extracts memory signals from a single user message using a lightweight Groq call.
 * Returns null if Groq fails or the message has no learnable content (irrelevant).
 */
export async function extractMemoryFromMessage(
  message: string
): Promise<ExtractedMemory | null> {
  try {
    const response = await groqChat([
      { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
      { role: "user", content: message },
    ]);

    const raw = response.choices[0]?.message?.content;
    if (!raw) return null;

    // Strip markdown code fences if the model adds them
    const cleaned = raw.replace(/^```(?:json)?\n?|\n?```$/g, "").trim();
    const parsed = JSON.parse(cleaned) as ExtractedMemory;

    // Safety: nothing to store for irrelevant messages or missing content
    if (parsed.category === "irrelevant") return null;
    if (!parsed.content) return null;

    return parsed;
  } catch (err) {
    console.warn("[memory-extractor] Failed to extract memory:", err);
    return null;
  }
}
