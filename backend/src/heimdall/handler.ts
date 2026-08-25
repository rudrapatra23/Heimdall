import { getPreferenceForAgent, recordInteractionEvent } from "./engine";
import { getEventHistory, listPreferences } from "./db";
import type { RawInteractionEvent } from "./types";

/**
 * Plain fetch-based router for plain Bun.serve setups (no Hono).
 * Call handleHeimdallRequest(req) from your existing index.ts fetch handler
 * for any path starting with /heimdall — see README for the exact wiring.
 */
export async function handleHeimdallRequest(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean); // e.g. ["heimdall", "preferences", "u1", "flights", "price"]

  if (parts[0] !== "heimdall") return null; // not ours, let index.ts fall through

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  // POST /heimdall/events
  if (req.method === "POST" && parts[1] === "events") {
    const body = (await req.json()) as RawInteractionEvent;
    if (!body.user_id || !body.domain || !body.preference_key || !body.event_type) {
      return json({ error: "user_id, domain, preference_key, event_type are required" }, 400);
    }
    const updated = await recordInteractionEvent(body);
    return json(updated);
  }

  // GET /heimdall/preferences/:userId/:domain/:key/history
  if (req.method === "GET" && parts[1] === "preferences" && parts.length === 6 && parts[5] === "history") {
    const userId = parts[2]!;
    const domain = parts[3]!;
    const key = parts[4]!;
    const rows = await getEventHistory(userId, domain, key);
    return json(rows);
  }

  // GET /heimdall/preferences/:userId/:domain/:key
  if (req.method === "GET" && parts[1] === "preferences" && parts.length === 5) {
    const userId = parts[2]!;
    const domain = parts[3]!;
    const key = parts[4]!;
    const contextSegment = url.searchParams.get("context_segment");
    const pref = await getPreferenceForAgent(userId, domain, key, contextSegment);
    if (!pref) return json({ found: false }, 404);
    return json({ found: true, ...pref });
  }

  // GET /heimdall/preferences/:userId?domain=...
  if (req.method === "GET" && parts[1] === "preferences" && parts.length === 3) {
    const userId = parts[2]!;
    const domain = url.searchParams.get("domain") ?? undefined;
    const rows = await listPreferences(userId, domain);
    return json(rows);
  }

  return json({ error: "not found" }, 404);
}
