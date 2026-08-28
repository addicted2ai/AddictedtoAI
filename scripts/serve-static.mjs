#!/usr/bin/env node
/**
 * serve-static.mjs — a dependency-free static file server for the exported
 * build (task 1.1, design D1).
 *
 *   node scripts/serve-static.mjs [root] [port]
 *   node scripts/serve-static.mjs out 3000        (the defaults)
 *
 * Why this exists: the site is built with `output: 'export'`, and
 * `next start` refuses to run under static export. Every local verification
 * in this change — the analytics script (5.2), the axe/contrast and
 * payload checks (4.11), the launch check (6.6), the final integrated run
 * (8.4) — serves `out/` with this script instead.
 *
 * Resolution order for a request path P (mirroring how a static host serves
 * a Next.js export):
 *   1. out/P                    (exact file)
 *   2. out/P.html               (default export: /about -> about.html)
 *   3. out/P/index.html         (trailingSlash-style export)
 *   4. out/404.html             (served with status 404)
 *
 * It refuses to serve anything outside the root, prints one line per
 * request to stderr, and exits nonzero if the root does not exist.
 */

import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve, join, sep, extname } from 'node:path';

const ROOT = resolve(process.argv[2] ?? 'out');
const PORT = Number.parseInt(process.argv[3] ?? '3000', 10);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

/** Resolve a URL path to a file inside ROOT, or null. */
async function resolveFile(urlPath) {
  // Decode, strip the query/hash, and normalize away any traversal.
  let p;
  try {
    p = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  } catch {
    return null;
  }
  if (p.endsWith('/')) p += 'index.html';
  const candidates = [p, `${p}.html`, join(p, 'index.html')];
  for (const c of candidates) {
    const abs = resolve(join(ROOT, c));
    // Containment check: must be ROOT itself or below it.
    if (abs !== ROOT && !abs.startsWith(ROOT + sep)) continue;
    try {
      const s = await stat(abs);
      if (s.isFile()) return abs;
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

function send(res, status, file, method) {
  const type = TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream';
  res.writeHead(status, {
    'content-type': type,
    'cache-control': 'no-store',
  });
  if (method === 'HEAD') return void res.end();
  createReadStream(file).pipe(res);
}

const server = createServer(async (req, res) => {
  const method = req.method ?? 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' });
    return void res.end('method not allowed\n');
  }

  const file = await resolveFile(req.url ?? '/');
  if (file) {
    process.stderr.write(`200 ${method} ${req.url}\n`);
    return void send(res, 200, file, method);
  }

  const notFound = await resolveFile('/404.html');
  process.stderr.write(`404 ${method} ${req.url}\n`);
  if (notFound) return void send(res, 404, notFound, method);
  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('404 not found\n');
});

try {
  const s = await stat(ROOT);
  if (!s.isDirectory()) throw new Error('not a directory');
} catch {
  process.stderr.write(
    `serve-static: root "${ROOT}" does not exist. Run \`npm run build\` first.\n`,
  );
  process.exit(1);
}

server.listen(PORT, '127.0.0.1', () => {
  process.stdout.write(`serving ${ROOT} at http://localhost:${PORT}/\n`);
});

// Make the server killable by a parent verification script.
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => server.close(() => process.exit(0)));
}
