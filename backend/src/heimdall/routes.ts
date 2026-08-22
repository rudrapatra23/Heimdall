import { Hono } from "hono";
import { getPreferenceForAgent, recordInteractionEvent } from "./engine";
import { getEventHistory, listPreferences } from "./db";
import type { RawInteractionEvent } from "./types";

export const heimdallRoutes = new Hono();

// Execution agent calls this before acting on a task, e.g.
// GET /preferences/u123/flights/price_sensitivity
heimdallRoutes.get("/preferences/:userId/:domain/:key", async (c) => {
  const { userId, domain, key } = c.req.param();
  const contextSegment = c.req.query("context_segment") ?? null;
  const pref = await getPreferenceForAgent(userId, domain, key, contextSegment);
  if (!pref) return c.json({ found: false }, 404);
  return c.json({ found: true, ...pref });
});

// Bulk fetch, e.g. for the execution agent to warm-load a user's whole profile at task start.
heimdallRoutes.get("/preferences/:userId", async (c) => {
  const { userId } = c.req.param();
  const domain = c.req.query("domain");
  const rows = await listPreferences(userId, domain);
  return c.json(rows);
});

// Any part of the system (frontend button clicks, worker post-task callbacks,
// Telegram bot handlers) reports an interaction here.
heimdallRoutes.post("/events", async (c) => {
  const body = (await c.req.json()) as RawInteractionEvent;
  if (!body.user_id || !body.domain || !body.preference_key || !body.event_type) {
    return c.json({ error: "user_id, domain, preference_key, event_type are required" }, 400);
  }
  const updated = await recordInteractionEvent(body);
  return c.json(updated);
});

// Explainability: "why does Heimdall think I prefer X?"
heimdallRoutes.get("/preferences/:userId/:domain/:key/history", async (c) => {
  const { userId, domain, key } = c.req.param();
  const rows = await getEventHistory(userId, domain, key);
  return c.json(rows);
});
