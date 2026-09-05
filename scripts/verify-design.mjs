#!/usr/bin/env node
/**
 * verify-design.mjs — the design bar, measured (tasks 4.7 and 4.11,
 * specs/site).
 *
 * *"Fast loads are a measured bound, not a sentiment."* Everything here is a
 * measurement against a real browser rendering the real exported build; not
 * one assertion is derived from what the CSS was meant to do.
 *
 *   contrast     axe-core, in both themes, on every route in A11Y_ROUTES.
 *                Zero violations required, and the whole axe ruleset runs,
 *                not only colour-contrast — a keyboard trap or an unlabelled
 *                control is the same failure.
 *   reflow       no horizontal page scroll at 320px on those routes. Wide
 *                content scrolls inside its own container; the page never
 *                does.
 *   payload      first-load JavaScript, gzipped, against the 150 KB bound,
 *                recorded in data/launch.json under `js_payload`.
 *   keyboard     a scripted Tab traversal that reaches AND activates the nav
 *                links, the search box and the theme toggle on those routes.
 *   focus ring   a second traversal that does NOT stop at the header, and
 *                does NOT stop early at all (addictedtoai-t6d): it walks to
 *                the end of the page's real tab order and every stop must
 *                show a focus indicator. A fixed 150-stop cap used to
 *                truncate this on /catalog's 817 stops and still print PASS;
 *                MEASURED cost of walking all 817 was ~4-6s against a
 *                ~31s baseline run, so the cap bought speed nobody needed and
 *                cost coverage everybody assumed they had.
 *   coverage     a static, no-browser sweep of every EXPORTED route
 *                (addictedtoai-0qs): fails when a route outside the sampled
 *                set renders a focusable element type no sampled route
 *                renders, so a route that grows a control (like /tools did)
 *                no longer needs a human reading a diff to notice.
 *   above fold   the home page shows real content — changed-feed lines — at
 *                1440x900 and 390x844, with no full-viewport hero.
 *
 * It starts its own server (`scripts/serve-static.mjs`, because `next start`
 * refuses to run under `output: 'export'`) and stops it on the way out.
 *
 * Usage:  node scripts/verify-design.mjs [outDir] [port]
 */

import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import fg from 'fast-glob';
import * as cheerio from 'cheerio';

import { measureRoute, formatMeasurement, BUDGET_BYTES } from './measure-payload.mjs';
import { ROOT } from '../lib/paths.mjs';
// The build's own LOCAL `YYYY-MM-DD`, imported rather than reimplemented: the
// dates this script records into data/launch.json are CALENDAR DATES in a
// corpus whose stated rule is "every date is the LOCAL date of the machine
// that wrote it". They were `new Date().toISOString().slice(0, 10)` — UTC — so
// on this UTC-6 machine every run after 18:00 local stamped TOMORROW onto a
// measurement (addictedtoai-nmr). Same fix and same shape as
// `pulse/lib/core.mjs` `today()` (addictedtoai-4ih) and `lib/facts.mjs`
// `todayIso()` (addictedtoai-aw6); a third implementation is how two
// conventions get back into one repository.
import { todayIso } from '../lib/facts.mjs';

const LAUNCH_FILE = join(ROOT, 'data', 'launch.json');

/**
 * The three pages specs/site names for the **payload** bound. This list is not
 * a route sample — it is the specified set, and adding a fourth page to it
 * would invent a budget nobody wrote down.
 */
const SAMPLES = [
  { route: '/', label: 'home' },
  { route: null, label: 'entry' }, // filled in from the corpus below
  { route: '/catalog', label: 'table' },
];

/**
 * Routes the contrast, reflow and keyboard checks run against — a different
 * question from the payload budget, and now a separate list (addictedtoai-9jj).
 *
 * ## The decision, written down because it had never been made
 *
 * These three checks had quietly INHERITED the payload's route list. Nobody
 * chose it for them: the payload bound is specified for three named pages, and
 * accessibility rode along. But contrast, focus and 320px overflow are
 * properties of a LAYOUT, not of a budget, so the list that serves them is
 * "one route per distinct layout", and the two lists have no reason to be the
 * same one.
 *
 * The bound on growth is runtime, and it is real: each route costs two axe
 * runs, a 320px reflow pass, and a keyboard traversal that types into the
 * search box and follows a result. So a layout earns a place here when it
 * renders interactive or structural markup the existing routes do not.
 *
 * `/tools` is the first addition on that rule. It stopped being a flat `<ul>`:
 * it now renders a `<nav>` of jump links, twelve `<h2 class="section-title">`
 * anchors, a `<p class="category-note">` per category, and a
 * `<details>`/`<summary>` disclosure — `<summary>` being a natively focusable
 * element the site had never shipped before, so whether it picks up the site's
 * focus-visible treatment was untested by anything. `lib/listings.test.mjs`
 * asserts that markup exists, which is a different claim from "it is reachable
 * and readable".
 *
 * NOT added here, and deliberately: `/learn`, `/tutorials`, `/blog`,
 * `/impossible-routine` and `/data`. Each is a heading-and-links layout built
 * from the same components already covered by `/` and `/catalog`, so each would
 * buy a fraction of what `/tools` buys at the same cost. When one of them grows
 * a control of its own, it belongs here — and now something besides a human
 * reading a diff notices: `findUnsampledFocusableTags` below runs over EVERY
 * exported route (not a sample — it costs a cheerio parse, not a browser round
 * trip) and fails the build the day an unsampled route renders a focusable
 * element type no route in this list, or in SAMPLES, renders. That is exactly
 * how `/tools`'s `<summary>` would have been caught before a person found it
 * (addictedtoai-0qs).
 */
const A11Y_EXTRA_ROUTES = ['/tools'];

/**
 * The single definition of "focusable" shared by the browser sweep
 * (`checkFocusIndicators`) and the static route-coverage scan
 * (`findUnsampledFocusableTags`) below, so the two mechanisms can never
 * quietly drift onto different questions. Verified against cheerio directly
 * (its selector engine is `css-select`, which handles `:not([attr="v"])`
 * correctly) rather than assumed.
 */
const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, summary, details > summary, [tabindex]:not([tabindex="-1"])';

let failures = 0;
const evidence = [];

function record(pass, label, detail) {
  if (!pass) failures += 1;
  const line = `  ${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`;
  evidence.push(line);
  process.stdout.write(line + '\n');
  return pass;
}

function startServer(out, port) {
  // stderr was 'ignore' here, so EVERY failure of this child — a port collision, a crash,
  // a missing file, a syntax error — surfaced as the single string `serve-static exited
  // with N`. JUDGE.md L1 tells judges that exact string means EACCES and must not be
  // debugged. **A documented known-lie had therefore become a blanket excuse capable of
  // hiding any real failure**, and a judge hit it twice with the sandbox off and could not
  // tell that the gate had not run at all. Capture stderr and put the real cause in the
  // error, so L1 can identify EACCES specifically instead of standing in for everything.
  const child = spawn(process.execPath, [join(ROOT, 'scripts', 'serve-static.mjs'), out, String(port)], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderr = '';
  child.stderr.on('data', (buf) => { stderr += String(buf); });
  return new Promise((res, rej) => {
    const timer = setTimeout(() => rej(new Error('serve-static did not start in 15s')), 15000);
    child.stdout.on('data', (buf) => {
      if (String(buf).includes('serving')) {
        clearTimeout(timer);
        res(child);
      }
    });
    child.on('exit', (code) => {
      clearTimeout(timer);
      const tail = stderr.trim().split(/\r?\n/).slice(-6).join(' | ');
      const eacces = /EACCES|EPERM/.test(stderr);
      rej(new Error(
        `serve-static exited with ${code}` +
        (eacces
          ? ` — EACCES/EPERM binding the socket: this IS the sandbox case JUDGE.md L1 describes; re-run outside the sandbox. stderr: ${tail}`
          : tail
            ? ` — NOT the L1 sandbox case. Real cause follows, debug it: ${tail}`
            : ' — no stderr captured; do not assume L1, investigate'),
      ));
    });
  });
}

/** An entry that exists in this build — the sample must not be hard-coded. */
async function pickEntry(out) {
  const index = JSON.parse(await readFile(join(out, 'search-index.json'), 'utf8'));
  const entry = index.docs.find((d) => d.k === 'entry');
  return entry?.u ?? '/wiki';
}

async function checkAxe(page, base, route, theme) {
  await page.emulateMedia({ colorScheme: theme });
  await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
  const results = await new AxeBuilder({ page }).analyze();
  const detail =
    results.violations.length === 0
      ? `${results.passes.length} rule(s) passed`
      : results.violations
          .map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.failureSummary?.split('\n')[0] ?? ''}`)
          .join(' | ');
  record(results.violations.length === 0, `axe ${theme.padEnd(5)} ${route}`, detail);
}

async function checkReflow(page, base, route) {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
  const { scrollWidth, clientWidth, offenders } = await page.evaluate(() => {
    const doc = document.documentElement;
    const offenders = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      // An element wider than the viewport is fine if it lives inside its own
      // scroll container; only one that pushes the page is a failure.
      if (r.right > doc.clientWidth + 1 && getComputedStyle(el.parentElement ?? el).overflowX !== 'auto') {
        offenders.push(`${el.tagName.toLowerCase()}.${el.className || '(no class)'} → ${Math.round(r.right)}px`);
      }
    }
    return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, offenders: offenders.slice(0, 4) };
  });
  record(
    scrollWidth <= clientWidth + 1,
    `no horizontal scroll at 320px ${route}`,
    `scrollWidth ${scrollWidth} vs clientWidth ${clientWidth}${offenders.length ? ` — ${offenders.join('; ')}` : ''}`,
  );
  await page.setViewportSize({ width: 1440, height: 900 });
}

/**
 * Keyboard traversal. Tabbing from the top of the document must reach the
 * skip link, every nav link, the search field and the theme toggle, and
 * activating the toggle with the keyboard must actually change the theme.
 */
async function checkKeyboard(page, base, route) {
  await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.body.focus());

  const navCount = await page.locator('nav[aria-label="Primary"] a').count();
  const seen = [];
  let searchAt = -1;
  let toggleAt = -1;

  for (let i = 0; i < 40; i += 1) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id,
        href: el.getAttribute('href'),
        toggle: el.hasAttribute('data-theme-toggle'),
        visible: el.getBoundingClientRect().width > 0,
      };
    });
    if (!info) break;
    seen.push(info);
    if (info.id === 'site-search' && searchAt === -1) searchAt = i;
    if (info.toggle && toggleAt === -1) toggleAt = i;
    if (searchAt !== -1 && toggleAt !== -1) break;
  }

  const navHrefs = await page
    .locator('nav[aria-label="Primary"] a')
    .evaluateAll((els) => els.map((e) => e.getAttribute('href')));
  const reached = new Set(seen.filter((s) => s.tag === 'a').map((s) => s.href));
  const missed = navHrefs.filter((h) => !reached.has(h));
  record(
    missed.length === 0,
    `keyboard reaches every nav link ${route}`,
    `${navHrefs.length - missed.length} of ${navCount} in ${seen.length} tab stops` +
      (missed.length ? `; missed ${missed.join(', ')}` : ''),
  );
  record(searchAt !== -1, `keyboard reaches the search box ${route}`, `tab stop ${searchAt + 1}`);
  record(toggleAt !== -1, `keyboard reaches the theme toggle ${route}`, `tab stop ${toggleAt + 1}`);

  // Activation, not only focus: Enter on the focused toggle must change the theme.
  if (toggleAt !== -1) {
    const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    await page.keyboard.press('Enter');
    const after = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    record(before !== after, `keyboard activates the theme toggle ${route}`, `${before} → ${after}`);
  }

  // The search box must accept typing and produce results without a mouse.
  await page.locator('#site-search').focus();
  await page.keyboard.type('a');
  await page.waitForTimeout(400);
  const results = await page.locator('.search-results li').count();
  record(results > 0, `keyboard-only search returns results ${route}`, `${results} result row(s)`);

  // Enter on the selected result navigates. The wait is explicit: a
  // `location.href` assignment starts navigating asynchronously, so reading
  // `page.url()` straight after the keypress would report the old page and
  // call a working feature broken.
  await page.keyboard.press('ArrowDown');
  const target = await page.locator('.search-results li[aria-selected="true"] a').getAttribute('href');
  await page.keyboard.press('Enter');
  let landed = new URL(page.url()).pathname;
  try {
    await page.waitForURL((u) => u.pathname !== route, { timeout: 5000 });
    landed = new URL(page.url()).pathname;
  } catch {
    /* reported below */
  }
  record(
    landed === target,
    `Enter opens the selected result ${route}`,
    `selected ${target}, landed on ${landed}`,
  );
}

/**
 * The loop below no longer stops at a fixed prefix (addictedtoai-t6d). It
 * used to: a 150-stop cap swept `/catalog`'s first 150 of 817 tab stops — 18%
 * — and still printed PASS, because "n of m" read as thorough even though
 * five sixths were never touched. That was chosen on an ASSUMED cost: "817
 * stops is roughly 1600 round trips, a large addition to a gate that already
 * drives a browser over four routes."  That assumption was never measured.
 *
 * MEASURED 2026-08-31, against this build's real `/catalog` (817 focusable
 * elements) on a warm local server: walking every stop with the exact
 * per-stop `page.evaluate` this function runs took 3.9-6.4s across two runs.
 * The whole `verify-design.mjs` run (four routes, axe in two themes, reflow,
 * keyboard, the old capped focus sweep, above-the-fold) took ~31s BEFORE this
 * change. Uncapping the sweep — the only route it changes materially is
 * `/catalog`, since every other sampled route's tab order is already under
 * 150 stops — adds single-digit seconds to a ~31s run. That is "affordable,"
 * not "the gate now takes twenty minutes."
 *
 * The rejected alternative was signature-based sampling: group focusable
 * elements by tagName+className and tab to one representative of each
 * distinct signature rather than to all of them. It was rejected for two
 * reasons, not one:
 *   1. It bought nothing once exhaustive traversal was shown to be cheap —
 *      the whole point of sampling is to avoid a cost that, measured, isn't
 *      there.
 *   2. Its own mechanics were unresolved: reaching a chosen representative
 *      still means COUNTING stops to it (Tab is the only way to move focus
 *      that also updates `:focus-visible`), so the walk happens either way —
 *      unless the check calls `.focus()` directly and accepts that
 *      `:focus-visible` after `.focus()` is a Chromium heuristic keyed on
 *      the last input modality, which the issue that proposed this flagged
 *      as needing verification BEFORE relying on it. Exhaustive traversal
 *      sidesteps that unverified assumption entirely rather than resting on
 *      it.
 *
 * So instead of a fixed cap, the loop bound is DERIVED from the page's own
 * counted focusable-element total, generously past it. Under normal
 * operation `stops` never approaches that bound — it exists as a safety
 * valve against a genuine non-terminating sweep (a focus trap, or a tab
 * order that never returns focus to `document.body`), not as a coverage
 * limit. Hitting it is treated as a FAILURE and reported as an anomaly, never
 * as a quiet truncation.
 */
const FOCUS_SWEEP_SAFETY_MARGIN = 25;

/** Pure: the loop bound for a page counting `total` focusable elements. */
export function focusSweepBound(total) {
  return total + FOCUS_SWEEP_SAFETY_MARGIN;
}

/**
 * Pure: the human-readable scope of a completed sweep, and whether it should
 * be treated as a pass. Split out from `checkFocusIndicators` so the
 * scope-reporting logic — the exact thing addictedtoai-t6d is about — is
 * unit-testable without a browser.
 */
export function describeFocusSweep({ stops, total, safetyBoundHit }) {
  if (safetyBoundHit) {
    return {
      ok: false,
      scope:
        `${stops} stop(s) and STILL GOING past ${total} counted focusable element(s) plus a ` +
        `${FOCUS_SWEEP_SAFETY_MARGIN}-stop safety margin — the sweep was stopped rather than trusted; ` +
        'this usually means a focus trap or a tab order that never returns focus to <body>',
    };
  }
  return {
    ok: true,
    scope:
      `the complete tab order, ${stops} stop(s)` +
      (total > stops
        ? `; ${total} focusable element(s) in the DOM, ${total - stops} of them not currently ` +
          'tabbable (a closed <details> hides its links)'
        : ''),
  };
}

/**
 * Every tab stop shows a visible focus indicator (addictedtoai-9jj), and now
 * every stop means EVERY stop (addictedtoai-t6d) — see FOCUS_SWEEP_SAFETY_MARGIN
 * above for why an exhaustive walk is affordable here.
 *
 * `checkKeyboard` above stops as soon as it has found the search box and the
 * theme toggle — stop 11 on every route — so it only ever exercised the header.
 * MEASURED on `/tools`: the `<details>`/`<summary>` disclosure is tab stop 24,
 * fourteen stops past where that traversal quits. Adding a route to the sample
 * list therefore did NOT test the one element the route was added for, and a
 * check that cannot reach the thing it was extended to cover is the failure
 * this repository keeps writing down: a guardrail is what it does when
 * measured, not what it was built to do.
 *
 * The assertion is deliberately about PRESENCE, not colour: `:focus-visible`
 * must match and the element must carry either an outline with real width or a
 * box-shadow. Contrast of the ring is axe's job and axe already runs on both
 * themes; this runs in one, because whether an indicator EXISTS does not vary
 * with the palette.
 */
async function checkFocusIndicators(page, base, route) {
  await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
  const total = await page.evaluate((sel) => document.querySelectorAll(sel).length, FOCUSABLE_SELECTOR);
  await page.evaluate(() => document.body.focus());

  const bound = focusSweepBound(total);
  const unindicated = [];
  const tags = new Set();
  let stops = 0;
  for (let i = 0; i < bound; i += 1) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body || el === document.documentElement) return null;
      const c = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        cls: el.className || '',
        // A ring the browser draws but the page overrides to `outline: none`
        // with nothing in its place is the defect; either mechanism counts.
        indicated:
          el.matches(':focus-visible') &&
          ((c.outlineStyle !== 'none' && Number.parseFloat(c.outlineWidth) > 0) || c.boxShadow !== 'none'),
        outline: `${c.outlineStyle} ${c.outlineWidth}`,
        wrapped: el.classList.contains('skip'),
      };
    });
    if (!info) break;
    if (stops > 0 && info.wrapped) break; // tabbed off the end and back to the skip link
    stops += 1;
    tags.add(info.tag);
    if (!info.indicated) unindicated.push(`${info.tag}.${info.cls || '(no class)'} — outline ${info.outline}`);
  }

  const safetyBoundHit = stops >= bound;
  const { ok: sweepOk, scope } = describeFocusSweep({ stops, total, safetyBoundHit });
  record(
    unindicated.length === 0 && sweepOk,
    `every tab stop shows a focus indicator ${route}`,
    `${scope}; element types ${[...tags].sort().join(', ')}` +
      (unindicated.length ? ` — ${unindicated.slice(0, 4).join('; ')}` : ''),
  );
}

/** Content above the fold: a changed-feed line must be inside the viewport. */
async function checkAboveFold(page, base, size, label) {
  await page.setViewportSize(size);
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
  const found = await page.evaluate((h) => {
    const items = [...document.querySelectorAll('.rail-changes .rail-item')];
    const visible = items.filter((el) => el.getBoundingClientRect().bottom <= h);
    const first = items[0]?.getBoundingClientRect();
    // A full-viewport hero would push the first record below the fold; this
    // measures the actual geometry rather than asserting the absence of one.
    return { count: visible.length, firstTop: first ? Math.round(first.top) : null, total: items.length };
  }, size.height);
  record(
    found.count > 0,
    `content above the fold at ${label}`,
    `${found.count} of ${found.total} changed-feed lines fully visible; first line starts ${found.firstTop}px down`,
  );
}

/**
 * Static half of the coverage gap (addictedtoai-0qs). Parses every exported
 * route with cheerio — no browser, no server — and returns each route's set
 * of focusable-element TAG NAMES, using the exact same `FOCUSABLE_SELECTOR`
 * the browser sweep uses, so the two mechanisms can never answer a subtly
 * different question. MEASURED over this build's 616 exported HTML files:
 * 1.4s. Cheap enough to run over EVERY route rather than a sample, which is
 * the whole point — it is what the browser checks above cannot afford to do.
 */
export async function scanFocusableTagsByRoute(out) {
  const files = await fg(`${out.split('\\').join('/')}/**/*.html`, { onlyFiles: true });
  const routeTags = new Map();
  for (const file of files) {
    const rel = relative(out, file).split('\\').join('/');
    const route = rel === 'index.html' ? '/' : '/' + rel.replace(/\.html$/, '');
    const $ = cheerio.load(await readFile(file, 'utf8'));
    const tags = new Set($(FOCUSABLE_SELECTOR).map((_, el) => (el.tagName || el.name || '').toLowerCase()).get());
    routeTags.set(route, tags);
  }
  return routeTags;
}

/**
 * Pure: given every route's focusable-tag set and the routes the browser
 * checks actually sample, finds each focusable TAG that appears only outside
 * the sample — the trigger addictedtoai-0qs asked for. Grouped by tag rather
 * than listed per route: if a shared template change put a new tag on
 * hundreds of routes at once, that is one finding ("this tag is unsampled"),
 * not hundreds of identical lines burying the one that matters.
 *
 * This is deliberately coarser than the browser sweep: it asks "does any
 * unsampled route use an element TYPE the sample has never seen", not "is
 * every unsampled route itself accessible" — the latter is what earns a route
 * a place in A11Y_EXTRA_ROUTES, a judgment call this keeps a mechanism for
 * triggering, not a mechanism for making automatically.
 */
export function findUnsampledFocusableTags(routeTags, sampledRoutes) {
  const sampled = new Set(sampledRoutes);
  const union = new Set();
  for (const route of sampled) for (const t of routeTags.get(route) ?? []) union.add(t);

  const byTag = new Map();
  for (const [route, tags] of routeTags) {
    if (sampled.has(route)) continue;
    for (const tag of tags) {
      if (union.has(tag)) continue;
      const entry = byTag.get(tag) ?? { tag, firstRoute: route, count: 0 };
      entry.count += 1;
      byTag.set(tag, entry);
    }
  }
  return [...byTag.values()].sort((a, b) => a.tag.localeCompare(b.tag));
}

async function main() {
  const out = resolve(process.argv[2] ?? join(ROOT, 'out'));
  const port = Number.parseInt(process.argv[3] ?? '3111', 10);
  const base = `http://localhost:${port}`;

  SAMPLES[1].route = await pickEntry(out);
  const routes = [...SAMPLES.map((s) => s.route), ...A11Y_EXTRA_ROUTES];

  // ---- route coverage, static, no browser (addictedtoai-0qs) -------------
  process.stdout.write('\nunsampled-route coverage (static, every exported route)\n');
  const routeTags = await scanFocusableTagsByRoute(out);
  const gaps = findUnsampledFocusableTags(routeTags, routes);
  record(
    gaps.length === 0,
    `every exported route's focusable element types are covered by the ${routes.length}-route sample`,
    gaps.length === 0
      ? `${routeTags.size} route(s) checked`
      : gaps
          .map((g) => `<${g.tag}> appears on ${g.count} unsampled route(s), e.g. ${g.firstRoute}`)
          .join('; '),
  );

  // ---- payload, from the files themselves --------------------------------
  process.stdout.write('\nfirst-load JavaScript (specs/site: at most 150 KB gzipped)\n');
  const measurements = [];
  for (const { route, label } of SAMPLES) {
    const m = await measureRoute(out, route);
    measurements.push({ ...m, label });
    process.stdout.write(formatMeasurement(m) + '\n');
    record(
      m.total.gzip <= BUDGET_BYTES,
      `first-load JS within budget ${route}`,
      `${(m.total.gzip / 1024).toFixed(1)} KB gzipped of ${(BUDGET_BYTES / 1024).toFixed(0)} KB`,
    );
  }

  const server = await startServer(out, port);
  const browser = await chromium.launch();
  try {
    // `@axe-core/playwright` requires a page created from an explicit context.
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    process.stdout.write('\ncontrast and accessibility (axe-core, both themes)\n');
    for (const route of routes) {
      for (const theme of ['light', 'dark']) await checkAxe(page, base, route, theme);
    }

    process.stdout.write('\nreflow at 320px\n');
    await page.emulateMedia({ colorScheme: 'light' });
    for (const route of routes) await checkReflow(page, base, route);

    process.stdout.write('\nkeyboard traversal\n');
    for (const route of routes) await checkKeyboard(page, base, route);

    process.stdout.write('\nfocus indicators, past the header (addictedtoai-9jj)\n');
    for (const route of routes) await checkFocusIndicators(page, base, route);

    process.stdout.write('\ncontent above the fold (task 4.7)\n');
    await checkAboveFold(page, base, { width: 1440, height: 900 }, '1440x900');
    await checkAboveFold(page, base, { width: 390, height: 844 }, '390x844');
  } finally {
    await browser.close();
    server.kill();
  }

  // ---- record the measurement -------------------------------------------
  let launch = {};
  try {
    launch = JSON.parse(await readFile(LAUNCH_FILE, 'utf8'));
  } catch {
    /* first run */
  }
  launch.js_payload = {
    measured_on: todayIso(),
    budget_kb_gzipped: BUDGET_BYTES / 1024,
    method:
      'gzip -9 over every <script src> a modern browser fetches (nomodule excluded) plus every ' +
      'inline <script> body, measured on the exported build in out/',
    pages: Object.fromEntries(
      measurements.map((m) => [
        m.route,
        {
          label: m.label,
          chunks_kb_gzipped: Number((m.chunks.gzip / 1024).toFixed(1)),
          inline_kb_gzipped: Number((m.inline.gzip / 1024).toFixed(1)),
          total_kb_gzipped: Number((m.total.gzip / 1024).toFixed(1)),
          html_kb_gzipped: Number((m.html_gzip / 1024).toFixed(1)),
        },
      ]),
    ),
  };
  launch.design_verification = {
    date: todayIso(),
    pass: failures === 0,
    failures,
    checks: evidence.length,
  };
  await writeFile(LAUNCH_FILE, JSON.stringify(launch, null, 2) + '\n', 'utf8');

  process.stdout.write(
    `\nverify-design: ${evidence.length} check(s), ${failures} failure(s); recorded in data/launch.json\n`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

/* ── standalone ──────────────────────────────────────────────────────────── */
//
// Guarded so `verify-design.test.mjs` can import the pure functions above
// (focusSweepBound, describeFocusSweep, scanFocusableTagsByRoute,
// findUnsampledFocusableTags) without `main()` spawning a server, launching a
// browser and calling `process.exit()` as a side effect of the import.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
