import { serve } from 'bun';
import path from 'path';
import index from './index.html';

const publicDir = path.join(import.meta.dir, '../public');
const assetsDir = path.join(import.meta.dir, 'assets');

const mp4File = Bun.file(path.join(publicDir, 'heimdall-phone.mp4'));
const webmFile = Bun.file(path.join(publicDir, 'heimdall-phone.webm'));

const server = serve({
  static: {
    '/heimdall-phone.mp4': mp4File,
    '/heimdall-phone.webm': webmFile,
    '/assets/heimdall-phone.mp4': Bun.file(path.join(assetsDir, 'heimdall-phone.mp4')),
    '/assets/heimdall-phone.webm': Bun.file(path.join(assetsDir, 'heimdall-phone.webm')),
  },
  routes: {
    '/heimdall-phone.mp4': () => new Response(mp4File, {
      headers: {
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000',
      },
    }),
    '/heimdall-phone.webm': () => new Response(webmFile, {
      headers: {
        'Content-Type': 'video/webm',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000',
      },
    }),
    '/*': index,
  },
  development: process.env.NODE_ENV !== 'production' && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Frontend running at ${server.url}`);
