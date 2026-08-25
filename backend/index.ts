import { handleGetProfile, handlePostProfile } from './src/routes/profile.ts';
import { handleTelegramLinkStart, handleTelegramWebhook } from './src/routes/telegram.ts';
import { handleStoreGmailCredentials } from './src/routes/gmail.ts';
import { handleGetHeardOptions, handleGetApplicationStatus, handleCreateEarlyAccess } from './src/routes/earlyAccess.ts';
import { bot } from "./src/telegram/bot.ts";
import { handleHeimdallRequest } from "./src/heimdall/handler";
import { handleWorkerRequest } from "./src/worker/handler";
import { handleGmailAuthRequest } from "./src/worker/gmail-auth-handler";
import { startTunnel } from "untun"
const PORT = parseInt(process.env.PORT ?? '4000');
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';
const tunnel = await startTunnel({ port: 4000 });
const webhookUrl = tunnel ? await tunnel.getURL() : undefined;
function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';
  // Allow frontend origin and in development any localhost
  const allowedOrigin = origin.includes('localhost') || origin === FRONTEND_URL
    ? origin
    : FRONTEND_URL;
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const method = req.method.toUpperCase();
    const heimdallRes = await handleHeimdallRequest(req);
    if (heimdallRes) return heimdallRes;

    const workerRes = await handleWorkerRequest(req);
    if (workerRes) return workerRes;

    const gmailAuthRes = await handleGmailAuthRequest(req);
    if (gmailAuthRes) return gmailAuthRes;
    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(req) });
    }

    function json(data: unknown, status = 200) {
      return Response.json(data, { status, headers: corsHeaders(req) });
    }

    async function route(handler: () => Promise<Response>): Promise<Response> {
      const res = await handler();
      // Add CORS headers to all responses
      const headers = new Headers(res.headers);
      const cors = corsHeaders(req);
      for (const [k, v] of Object.entries(cors)) {
        headers.set(k, v);
      }
      return new Response(res.body, { status: res.status, headers });
    }

    try {
      // Health check
      if (url.pathname === '/api/health' && method === 'GET') {
        return json({ status: 'ok', timestamp: new Date().toISOString() });
      }
      if (url.pathname === '/api/gmail/store-credentials' && method === 'POST') {
  return route(() => handleStoreGmailCredentials(req));
}
      // Profile routes
      if (url.pathname === '/api/profile') {
        if (method === 'GET') return route(() => handleGetProfile(req));
        if (method === 'POST') return route(() => handlePostProfile(req));
      }

      // Telegram routes
      if (url.pathname === '/api/telegram/link/start' && method === 'POST') {
        return route(() => handleTelegramLinkStart(req));
      }
      if (url.pathname === '/api/telegram/webhook' && method === 'POST') {
        return route(() => handleTelegramWebhook(req));
      }

      // Early Access routes
      if (url.pathname === '/api/early-access/heard-options' && method === 'GET') {
        return route(() => handleGetHeardOptions());
      }
      if (url.pathname === '/api/early-access/status' && method === 'GET') {
        return route(() => handleGetApplicationStatus(req));
      }
      if (url.pathname === '/api/early-access/apply' && method === 'POST') {
        return route(() => handleCreateEarlyAccess(req));
      }

      return json({ error: 'Not found' }, 404);
    } catch (err) {
      console.error('Unhandled error:', err);
      return json({ error: 'Internal server error' }, 500);
    }
  },
});
//  bot start — long-polling mode (dev).
// Gramio polls Telegram's getUpdates API directly; no public URL needed.
// For production webhook mode: bot.start({ webhook: { url: `${webhookUrl}/api/telegram/webhook` } })
bot.start();

// Prevents from 409 conflict
process.on("SIGINT", async () => {
  await bot.stop();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await bot.stop();
  process.exit(0);
});
console.log(`🚀 Backend API running at ${server.url}`);
