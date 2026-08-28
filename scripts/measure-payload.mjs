#!/usr/bin/env node
/**
 * measure-payload.mjs — first-load JavaScript, measured rather than assumed
 * (task 4.11, specs/site: "first-load JavaScript SHALL be at most 150 KB
 * gzipped per page").
 *
 * Reads an exported page out of `out/`, finds every script the browser must
 * fetch or execute before the page is interactive, and gzips each one at the
 * level a CDN uses. Three figures, kept separate on purpose because they fail
 * for different reasons and a single blended number hides which:
 *
 *   chunks   `<script src>` files a modern browser downloads. Next's own
 *            "First Load JS" figure. `nomodule` polyfills are excluded —
 *            a module-supporting browser never fetches them.
 *   inline   `<script>` bodies in the HTML. Almost all of it is the App
 *            Router's flight payload (`self.__next_f.push(...)`), which is
 *            the server-rendered tree serialised for hydration. It scales
 *            with page content, not with the design system, so a 400-row
 *            table moves this number and nothing else.
 *   total    chunks + inline, gzipped together — the honest ceiling: every
 *            byte inside a <script> tag on the page.
 *
 * The budget is checked against `total`. Measuring only `chunks` would let a
 * page ship a megabyte of inline flight payload and still report 100 KB.
 *
 * Usage:  node scripts/measure-payload.mjs [outDir] [route ...]
 *         node scripts/measure-payload.mjs out / /wiki/model/x /catalog
 */

import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { join, resolve } from 'node:path';

/** The budget from specs/site, in bytes. */
export const BUDGET_BYTES = 150 * 1024;

const SCRIPT_RE = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

function attr(tag, name) {
  const m = new RegExp(`${name}\\s*=\\s*"([^"]*)"`, 'i').exec(tag);
  if (m) return m[1];
  return new RegExp(`(?:^|\\s)${name}(?=\\s|$)`, 'i').test(tag) ? '' : null;
}

/** The exported file a route's HTML lives in. */
export function htmlPathFor(outDir, route) {
  const clean = route.replace(/^\/+|\/+$/g, '');
  return clean === '' ? join(outDir, 'index.html') : join(outDir, `${clean}.html`);
}

export async function measureRoute(outDir, route) {
  const html = await readFile(htmlPathFor(outDir, route), 'utf8');

  const srcs = [];
  const inline = [];
  for (const m of html.matchAll(SCRIPT_RE)) {
    const [, tag, body] = m;
    // `nomodule` scripts are fetched only by browsers without module support.
    if (attr(tag, 'nomodule') !== null) continue;
    const src = attr(tag, 'src');
    if (src) srcs.push(src);
    else if (body.trim()) inline.push(body);
  }

  const files = [];
  let chunkRaw = Buffer.alloc(0);
  for (const src of srcs) {
    if (!src.startsWith('/')) continue; // no external origins (task 4.10 forbids them)
    const buf = await readFile(join(outDir, src.replace(/^\//, '')));
    files.push({ src, bytes: buf.length, gzip: gzipSync(buf, { level: 9 }).length });
    chunkRaw = Buffer.concat([chunkRaw, buf]);
  }

  const inlineRaw = Buffer.from(inline.join('\n'), 'utf8');
  const allRaw = Buffer.concat([chunkRaw, inlineRaw]);

  return {
    route,
    files,
    chunks: { bytes: chunkRaw.length, gzip: gzipSync(chunkRaw, { level: 9 }).length },
    inline: { bytes: inlineRaw.length, gzip: gzipSync(inlineRaw, { level: 9 }).length },
    total: { bytes: allRaw.length, gzip: gzipSync(allRaw, { level: 9 }).length },
    html_bytes: Buffer.byteLength(html),
    html_gzip: gzipSync(Buffer.from(html), { level: 9 }).length,
  };
}

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

export function formatMeasurement(m) {
  const verdict = m.total.gzip <= BUDGET_BYTES ? 'OK' : 'OVER BUDGET';
  return (
    `${m.route}\n` +
    `  chunks   ${kb(m.chunks.gzip)} gzipped (${m.files.length} file(s), ${kb(m.chunks.bytes)} raw)\n` +
    `  inline   ${kb(m.inline.gzip)} gzipped (${kb(m.inline.bytes)} raw)\n` +
    `  total    ${kb(m.total.gzip)} gzipped  — budget ${kb(BUDGET_BYTES)} — ${verdict}\n` +
    `  html     ${kb(m.html_gzip)} gzipped (${kb(m.html_bytes)} raw)`
  );
}

async function main(argv) {
  const outDir = resolve(argv[0] ?? 'out');
  const routes = argv.slice(1);
  if (routes.length === 0) routes.push('/');

  let over = 0;
  const results = [];
  for (const route of routes) {
    const m = await measureRoute(outDir, route);
    results.push(m);
    process.stdout.write(formatMeasurement(m) + '\n');
    if (m.total.gzip > BUDGET_BYTES) over += 1;
  }

  if (argv.includes('--json')) {
    process.stdout.write(JSON.stringify(results, null, 2) + '\n');
  }
  process.exit(over === 0 ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1].split('\\').join('/')}` ||
    process.argv[1]?.endsWith('measure-payload.mjs')) {
  await main(process.argv.slice(2));
}
