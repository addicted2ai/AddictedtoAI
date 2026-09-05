#!/usr/bin/env node
/**
 * ui-evidence.mjs — the screenshot oracle for the `ui-loop` (loops/ui-loop/CHARTER.md,
 * evidence stack row 4).
 *
 * Captures every sampled route x theme x viewport from the REAL exported build, served
 * by this project's own static server on a port this run owns. Nothing here is derived
 * from what the CSS was meant to do; every artefact is a browser rendering `out/`.
 *
 *   node tools/ui-evidence.mjs                 capture into evidence/current/
 *   node tools/ui-evidence.mjs --baseline      capture into evidence/baseline/ instead
 *   node tools/ui-evidence.mjs --routes /,/catalog
 *
 * WHY THE IDENTITY CHECKS EXIST. The loop this descends from filed four invalid render
 * files out of twenty in one campaign: two showed a DIFFERENT product than their filename
 * claimed, and two were the blank artefact a freshly restarted host writes. Both classes
 * passed every "did it succeed?" test available at the time. So this script refuses to
 * file a capture it cannot prove is the page it asked for:
 *
 *   1. the browser's own location.pathname must match the requested route
 *   2. the document must have a non-empty <title> and a non-empty <main>
 *   3. the PNG must exceed MIN_PNG_BYTES (a blank frame is tiny)
 *   4. no two captures may share a SHA-256 — identical bytes across two different
 *      (route, theme, viewport) triples means one of them is filed under the wrong name
 *
 * Any failure is fatal for the whole run. Partial evidence is worse than none: a judge
 * cannot tell a missing capture from a page that renders nothing.
 */

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, rm, writeFile, readdir, stat, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'out');
const EVIDENCE = join(ROOT, 'loops', 'ui-loop', 'evidence');

const MIN_PNG_BYTES = 12_000;

// The build the capture campaign is supposed to be OF, read from the tree itself rather
// than from any page under test — otherwise the check is circular.
let TREE_STAMP = null;
let TREE_STAMP_FULL = '';
const NAV_TIMEOUT_MS = 20_000;

/** One representative route per page template. `null` slug entries resolve from `out/`. */
const ROUTE_PLAN = [
  { route: '/', label: 'home' },
  { route: '/blog', label: 'index-blog' },
  { route: null, label: 'article', from: 'blog' },
  { route: '/catalog', label: 'table-catalog' },
  { route: '/wiki', label: 'index-wiki' },
  { route: null, label: 'wiki-entry', from: 'wiki' },
  { route: '/learn', label: 'index-learn' },
  { route: '/tools', label: 'index-tools' },
  { route: '/colophon', label: 'prose' },
  { route: '/data', label: 'data' },
  // Added 2026-09-05 (revival round 0, closing evidence-fix I44a): templates the old rig never
  // captured in nine iterations — 54 of one round's 58 fixes landed on a route no judge had seen
  // — plus the model record, the wiki's most numerous template and a different surface from the
  // prose entry that `wiki-entry` resolves to.
  { route: '/tutorials', label: 'index-tutorials' },
  { route: null, label: 'tutorial', from: 'tutorials' },
  { route: '/impossible-routine', label: 'index-routine' },
  { route: null, label: 'routine', from: 'impossible-routine' },
  { route: null, label: 'wiki-model', from: 'wiki/model' },
];

/**
 * Themes. Both are the UN-STAMPED state — no `data-theme` attribute — because that is
 * what a viewer on the default "system" setting actually sees, and it is the state a
 * theme bug hides in. The stamped states are a keyboard-driven check, not a capture.
 */
const THEMES = [
  { id: 'light', scheme: 'light' },
  { id: 'dark', scheme: 'dark' },
];

const VIEWPORTS = [
  { id: '1440', width: 1440, height: 900 },
  { id: '390', width: 390, height: 844 },
  // Added 2026-09-05 (revival round 0, I44a): responsive integrity was scored at 768 for nine
  // iterations from captures that did not contain it.
  { id: '768', width: 768, height: 1024 },
];

function fail(msg) {
  console.error(`\nFAIL  ${msg}`);
  process.exitCode = 1;
}

/**
 * Resolve a real LEAF page under out/<dir>/ so the capture is a page and not a directory.
 *
 * Shallowest-first, because route depth varies per template: /blog/<slug> is one level
 * while /wiki/<kind>/<slug> is two. Returning the directory `/wiki/<kind>` is what
 * produced four 404s on this script's first run — a directory is not a page, and the
 * server correctly refused it.
 */
async function firstEntry(dir, maxDepth = 3) {
  const walk = async (rel, depth) => {
    const base = join(OUT, rel);
    if (!existsSync(base)) return null;
    const ents = (await readdir(base, { withFileTypes: true })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    for (const e of ents) {
      if (e.isFile() && e.name.endsWith('.html') && e.name !== 'index.html') {
        return `/${rel}/${e.name.replace(/\.html$/, '')}`;
      }
    }
    if (depth >= maxDepth) return null;
    for (const e of ents) {
      if (!e.isDirectory()) continue;
      const found = await walk(`${rel}/${e.name}`, depth + 1);
      if (found) return found;
    }
    return null;
  };
  return walk(dir, 0);
}

/**
 * Content identity of an export that does NOT move when only the build does (L6, I48). The old
 * freshness rule compared wall-clock build stamps, so the mandated rebuild before every capture
 * guaranteed a "fatal" mismatch on identical content. This hashes the PRESENTATION of every HTML
 * and CSS file under the export: two builds of one tree agree, any presentation change disagrees.
 * Recorded in manifest.json as `contentHash`; `node tools/ui-evidence.mjs --hash [dir]` recomputes
 * it for the export you are about to judge (default out/). Equal -> the filed evidence is current.
 *
 * MEASURED 2026-09-05 (revival round 0), by diffing two consecutive exports of one tree: they
 * differ in (1) the build stamp (attribute, visible footer text, and each piece repeated as its own
 * string in the flight payload), (2) Next's per-build id, present as an HTML comment and as "b" in
 * the flight payload, and (3) the ORDER of the inline self.__next_f.push chunks, which is not
 * deterministic. None of the three is presentation. So: every <script> and every HTML comment is
 * dropped, the stamp's pieces are scrubbed, and the visible stamp element is blanked. What remains
 * is the static HTML (the JSX structure the judges see) and the CSS (content-hashed by the bundler).
 */
async function treeContentHash(root = OUT) {
  const files = [];
  const walk = async (dir) => {
    const ents = (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
    for (const e of ents) {
      const full = join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (/\.(html|css)$/.test(e.name)) files.push(full);
    }
  };
  await walk(root);
  const index = await readFile(join(root, 'index.html'), 'utf8');
  const stampFull = (index.match(/data-build-stamp="([^"]*)"/) || [])[1] || '';
  const pieces = stampFull.split(/[\s+]+/).filter((t) => t.length >= 7);
  const tokens = [...new Set([stampFull, ...pieces, '+dirty'].filter(Boolean))];
  const h = createHash('sha256');
  for (const f of files) {
    let text = await readFile(f, 'utf8');
    text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<!--[\s\S]*?-->/g, '');
    for (const t of tokens) text = text.split(t).join('');
    text = text.replace(/<p class="build-stamp"[^>]*>[\s\S]*?<\/p>/g, '<p class="build-stamp"></p>');
    h.update(f.slice(root.length).replace(/\\/g, '/')).update('\0').update(text).update('\0');
  }
  return { hash: h.digest('hex'), files: files.length };
}

async function freePort() {
  const net = await import('node:net');
  return new Promise((res, rej) => {
    const srv = net.createServer();
    srv.on('error', rej);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => res(port));
    });
  });
}

async function startServer(port) {
  const proc = spawn(process.execPath, [join(ROOT, 'scripts', 'serve-static.mjs'), 'out', String(port)], {
    cwd: ROOT,
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/`);
      if (r.ok) return proc;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  proc.kill();
  throw new Error(`static server did not come up on port ${port}`);
}

async function main() {
  // Establish the tree's build identity BEFORE capturing anything.
  {
    const html = await readFile(join(OUT, 'index.html'), 'utf8');
    TREE_STAMP_FULL = (html.match(/data-build-stamp="([^"]*)"/) || [])[1] || '';
    TREE_STAMP = TREE_STAMP_FULL.split(' ')[0] || null;
    if (!TREE_STAMP) {
      console.error('REFUSED: out/index.html exposes no data-build-stamp — freshness cannot be established, so no capture here could be proved current.');
      process.exit(1);
    }
    console.log(`ui-evidence — tree build ${TREE_STAMP}`);
  }
  const args = process.argv.slice(2);
  if (args.includes('--hash')) {
    const next = args[args.indexOf('--hash') + 1];
    const root = next && !next.startsWith('--') ? resolve(next) : OUT;
    const { hash, files } = await treeContentHash(root);
    console.log(`contentHash ${hash}  (${files} html/css files under ${root.replace(ROOT, '.')}; scripts, comments and build stamp normalised away)`);
    return;
  }
  const isBaseline = args.includes('--baseline');
  const routeArg = args.indexOf('--routes');
  const only = routeArg >= 0 ? args[routeArg + 1].split(',') : null;

  if (!existsSync(OUT)) {
    fail(`out/ does not exist. Run \`npm run build\` first and read its LOG, not its exit code.`);
    return;
  }

  // Resolve the plan into concrete routes.
  const plan = [];
  for (const p of ROUTE_PLAN) {
    let route = p.route;
    if (route === null) route = await firstEntry(p.from);
    if (!route) {
      fail(`could not resolve a real entry under out/${p.from}/ for label "${p.label}"`);
      return;
    }
    if (only && !only.includes(route)) continue;
    plan.push({ route, label: p.label });
  }
  if (!plan.length) {
    fail('zero routes selected — nothing to observe, so a pass here would mean nothing.');
    return;
  }

  const dest = join(EVIDENCE, isBaseline ? 'baseline' : 'current');
  await rm(dest, { recursive: true, force: true });
  await mkdir(dest, { recursive: true });

  const port = await freePort();
  const server = await startServer(port);
  const browser = await chromium.launch();
  const seen = new Map();
  const manifest = [];
  let failures = 0;

  try {
    for (const theme of THEMES) {
      for (const vp of VIEWPORTS) {
        const ctx = await browser.newContext({
          colorScheme: theme.scheme,
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: 1,
          reducedMotion: 'reduce',
        });
        const page = await ctx.newPage();

        for (const { route, label } of plan) {
          const name = `${label}--${theme.id}--${vp.id}.png`;
          const file = join(dest, name);
          const url = `http://127.0.0.1:${port}${route}`;

          try {
            const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS });
            if (!resp || !resp.ok()) throw new Error(`HTTP ${resp ? resp.status() : 'no response'}`);

            const identity = await page.evaluate(() => ({
              path: location.pathname,
              title: document.title.trim(),
              mainText: (document.querySelector('main')?.innerText || '').trim().length,
              // Recorded so staleness is DETECTABLE later. A capture is fresh when
              // taken and goes stale when the tree is rebuilt underneath it. Iteration 2
              // was judged on evidence that went stale exactly that way, and the identity
              // checks below could not see it: they verify route, title and <main> length,
              // none of which changes when the build does.
              // Read the STRUCTURED stamp, never prose. The first cut of this scraped
              // `body.innerText.match(/built\s+(\S+)/)` and matched the home page's own
              // tagline "built not to rot", recording buildStamp "not" on 4 captures and
              // "to" on another 4 — 20% of the set — which a judge caught. A regex over
              // rendered prose is not an extraction; it is a coincidence that usually holds.
              buildStamp: (document.querySelector('.build-stamp')?.dataset.buildStamp || '').split(' ')[0] || null,
            }));

            const wantPath = route.replace(/\/$/, '') || '/';
            const gotPath = identity.path.replace(/(\.html)?\/?$/, '') || '/';
            if (gotPath !== wantPath) {
              throw new Error(`served ${identity.path}, expected ${route} — capture would be filed under the wrong name`);
            }
            if (!identity.title) throw new Error('document has an empty <title>');
            if (identity.mainText < 40) throw new Error(`<main> holds ${identity.mainText} chars — page rendered empty`);

            // Freshness, and it is FATAL like every other identity check here. Recording a
            // stamp without asserting on it is not a check: iteration 2 was judged on stale
            // evidence while a stamp sat unread in the manifest. Two conditions — the stamp
            // must BE a stamp (a prose match is not), and it must agree with the tree the
            // capture is supposed to be of.
            if (!identity.buildStamp || !/^\d{4}-\d{2}-\d{2}T/.test(identity.buildStamp)) {
              throw new Error(`build stamp is ${JSON.stringify(identity.buildStamp)}, not an ISO timestamp — the page did not expose data-build-stamp and this capture cannot be proved current`);
            }
            if (TREE_STAMP && identity.buildStamp !== TREE_STAMP) {
              throw new Error(`served build ${identity.buildStamp} but the tree is ${TREE_STAMP} — capture would be filed as current while showing a different build`);
            }

            // --- iter-02 evidence-fix (judge I22) ---------------------------------
            // `fullPage: true` MISRENDERS a page whose layout is viewport-coupled: a
            // sticky, capped scroll container (max-height in vh) paints at the wrong
            // height because fullPage re-composites at the document height while the DOM
            // geometry stays correct. Observed on /catalog @1440: the wrap measured
            // 661.3px live and painted ~350px (10 rows of 396) inside a correctly-sized
            // 1440x1255 PNG, ~360px blank below the footer. The image lied while every
            // geometric assertion about it passed.
            //
            // A full-page image of such a page is not a well-defined artifact, so do not
            // produce one. Capture the viewport and SAY SO in the manifest — a labelled
            // partial view beats a whole view that is wrong.
            const coupled = await page.evaluate(() => {
              // Broadened after a judge noted the first cut keyed on ONE css signature.
              // The condition that matters: the element's SIZE depends on the viewport AND
              // it either sticks or scrolls — those are the layouts a capture mode that
              // resizes or re-composites the viewport will paint wrongly.
              const src = [...document.styleSheets].flatMap((sh) => {
                try { return [...sh.cssRules].map((r) => r.cssText); } catch { return []; }
              }).join(' ');
              const VP_UNIT = /[0-9.]+(vh|vw|vmin|vmax|dvh|svh|lvh)[^a-z]/;
              for (const el of document.querySelectorAll('*')) {
                const cs = getComputedStyle(el);
                const sticky = cs.position === 'sticky' || cs.position === 'fixed';
                const scrolls = el.scrollHeight > el.clientHeight + 1 &&
                  ['auto', 'scroll'].includes(cs.overflowY);
                if (!sticky && !scrolls) continue;
                // Computed styles resolve viewport units to px, so inspect the AUTHORED
                // declaration instead: find this element's own selector in the stylesheet.
                const sel = el.id
                  ? '#' + el.id
                  : (typeof el.className === 'string' && el.className.trim()
                      ? '.' + el.className.trim().split(/\s+/)[0]
                      : null);
                if (!sel) continue;
                const esc = sel.replace(/[.#]/g, '\$&');
                const blocks = src.match(new RegExp(esc + '[^{]*\{[^}]*\}', 'g')) || [];
                if (VP_UNIT.test(blocks.join(' '))) {
                  return {
                    selector: sel,
                    maxHeight: cs.maxHeight,
                    why: sticky
                      ? 'sticky/fixed with viewport-relative sizing'
                      : 'scroll container with viewport-relative sizing',
                  };
                }
              }
              return null;
            });
            const buf = await page.screenshot({ path: file, fullPage: !coupled, animations: 'disabled' });
            if (buf.length < MIN_PNG_BYTES) {
              throw new Error(`PNG is ${buf.length} bytes, under the ${MIN_PNG_BYTES} floor — blank frame`);
            }
            const hash = createHash('sha256').update(buf).digest('hex');
            if (seen.has(hash)) {
              throw new Error(`byte-identical to ${seen.get(hash)} — one of the two is filed under the wrong name`);
            }
            seen.set(hash, name);

            manifest.push({
              file: name, route, label, theme: theme.id, viewport: vp.id,
              bytes: buf.length, sha256: hash.slice(0, 16), title: identity.title,
              capture: coupled ? 'viewport' : 'fullPage',
              ...(coupled ? { captureReason: `viewport-coupled sticky scroll container (${coupled.selector}, max-height ${coupled.maxHeight}) — fullPage misrenders it; this image shows the first viewport only` } : {}),
              buildStamp: identity.buildStamp,
            });
            process.stdout.write(`  ok   ${name}${coupled ? '   [viewport only — ' + coupled.selector + ' is viewport-coupled]' : ''}\n`);
          } catch (err) {
            failures++;
            process.stdout.write(`  FAIL ${name}  ${err.message}\n`);
          }
        }
        await ctx.close();
      }
    }
  } finally {
    await browser.close();
    server.kill();
  }

  await writeFile(
    join(dest, 'manifest.json'),
    JSON.stringify({ captured: new Date().toISOString(), baseline: isBaseline, treeStamp: TREE_STAMP, contentHash: (await treeContentHash()).hash, viewports: VIEWPORTS.map((v) => v.id), routes: plan.length, images: manifest.length, entries: manifest }, null, 2),
  );

  const expected = plan.length * THEMES.length * VIEWPORTS.length;
  console.log(`\nui-evidence — ${manifest.length}/${expected} captures into ${dest.replace(ROOT, '.')}`);

  if (failures) {
    fail(`${failures} capture(s) failed identity or size checks. Partial evidence is not filed as usable: a judge cannot distinguish a missing capture from a page that renders nothing. Fix the cause and re-run.`);
    return;
  }
  if (!manifest.length) {
    fail('zero captures produced.');
    return;
  }
  console.log('PASS  every capture proved its own identity; no duplicates.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
