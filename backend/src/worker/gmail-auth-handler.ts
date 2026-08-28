import { getGoogleAuthUrl, handleGoogleCallback } from "./tools/gmail-oauth";

/**
 * Handles /auth/gmail/connect and /auth/gmail/callback.
 * Wire alongside handleHeimdallRequest and handleWorkerRequest in index.ts.
 */
export async function handleGmailAuthRequest(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean); // ["auth", "gmail", "connect" | "callback"]

  if (parts[0] !== "auth" || parts[1] !== "gmail") return null;

  // GET /auth/gmail/connect?userId=...
  // Redirects the browser to Google's consent screen.
  if (req.method === "GET" && parts[2] === "connect") {
    const userId = url.searchParams.get("userId");
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId query param is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const authUrl = getGoogleAuthUrl(userId);
    return Response.redirect(authUrl, 302);
  }

  // GET /auth/gmail/callback?code=...&state=<userId>
  // Google redirects here after the user grants (or denies) access.
  if (req.method === "GET" && parts[2] === "callback") {
    const code = url.searchParams.get("code");
    const userId = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      return new Response(`Gmail connection was cancelled: ${error}`, { status: 400 });
    }
    if (!code || !userId) {
      return new Response("Missing code or state in callback", { status: 400 });
    }

    try {
      await handleGoogleCallback(code, userId);
      // Replace this with a redirect to your actual frontend "connected!" page.
      return new Response("Gmail connected successfully. You can close this tab.", {
        headers: { "Content-Type": "text/plain" },
      });
    } catch (err) {
      return new Response(`Failed to connect Gmail: ${(err as Error).message}`, { status: 500 });
    }
  }

  return null;
}