import { serve } from 'bun';
import index from './index.html';

const server = serve({
  routes: {
    // Serve SPA for all routes (including /auth/callback)
    '/*': index,
  },

  development: process.env.NODE_ENV !== 'production' && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Frontend running at ${server.url}`);
