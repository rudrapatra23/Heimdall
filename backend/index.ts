import { handleGetProfile, handlePostProfile } from './src/routes/profile.ts';
import { handleTelegramLinkStart, handleTelegramWebhook } from './src/routes/telegram.ts';

const PORT = parseInt(process.env.PORT ?? '4000');
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';

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

      return json({ error: 'Not found' }, 404);
    } catch (err) {
      console.error('Unhandled error:', err);
      return json({ error: 'Internal server error' }, 500);
    }
  },
});

console.log(`🚀 Backend API running at ${server.url}`);
