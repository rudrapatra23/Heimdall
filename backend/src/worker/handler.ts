import { runEmailTask } from "./agent";
import { getValidAccessToken } from "./tools/token";
import { listUnreadEmails } from "./tools/gmail";

/**
 * Plain fetch-based handler for triggering the worker agent manually,
 * for plain Bun.serve setups. Wire alongside handleHeimdallRequest in index.ts.
 */
export async function handleWorkerRequest(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);

  if (parts[0] !== "worker") return null;

  // GET /worker/test-gmail-read/:userId
  // Quick sanity check: does the token flow work and can we actually read Gmail?
  // No Groq/agent involved -- isolates the Gmail connection from the LLM loop.
  if (req.method === "GET" && parts[1] === "test-gmail-read" && parts[2]) {
    const userId = parts[2]!;
    try {
      const accessToken = await getValidAccessToken(userId);
      const emails = await listUnreadEmails(accessToken, 5);
      return new Response(JSON.stringify({ ok: true, count: emails.length, emails }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error: (err as Error).message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "POST" && parts[1] === "test-email-task") {
    const body = (await req.json()) as { userId: string; instruction: string };
    try {
      const accessToken = await getValidAccessToken(body.userId);
      const result = await runEmailTask(body.userId, accessToken, body.instruction);
      return new Response(JSON.stringify({ ok: true, result }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error: (err as Error).message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ error: "not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}