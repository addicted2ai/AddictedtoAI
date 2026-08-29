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
 *   focus ring   a second traversal that does NOT stop at the header: every
 *                tab stop must show a focus indicator. The first one quits at
 *                stop 11, so nothing below the fold was ever checked.
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
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

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
 * a control of its own, it belongs here — that is what this rule is for
 * (tracked as its own issue rather than left in this comment).
 */
const A11Y_EXTRA_ROUTES = ['/tools'];

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
  const child = spawn(process.execPath, [join(ROOT, 'scripts', 'serve-static.mjs'), out, String(port)], {
    stdio: ['ignore', 'pipe', 'ignore'],
  });
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
      rej(new Error(`serve-static exited with ${code}`));
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

/** How far the focus sweep tabs before it stops and says so. */
const FOCUS_SWEEP_CAP = 150;

/**
 * Every tab stop shows a visible focus indicator (addictedtoai-9jj).
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
 *
 * Both numbers are reported. `/catalog` has more focusable elements than the
 * cap, and a truncated sweep printed as a clean one is indistinguishable from a
 * complete one — so the evidence line always says "n of m".
 */
async function checkFocusIndicators(page, base, route) {
  await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
  const total = await page.evaluate(
    () =>
      document.querySelectorAll(
        'a[href], button, input, select, textarea, summary, details > summary, [tabindex]:not([tabindex="-1"])',
      ).length,
  );
  await page.evaluate(() => document.body.focus());

  const unindicated = [];
  const tags = new Set();
  let stops = 0;
  for (let i = 0; i < FOCUS_SWEEP_CAP; i += 1) {
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

  // Two ways this sweep can end, and they mean opposite things. Tabbing back
  // round to the skip link means the WHOLE tab order was walked; hitting the
  // cap means it was not. Printing one number for both would make a truncated
  // sweep read exactly like a complete one.
  const capped = stops >= FOCUS_SWEEP_CAP;
  const scope = capped
    ? `${stops} of ${total} focusable element(s) — STOPPED AT THE ${FOCUS_SWEEP_CAP}-STOP CAP, the rest unswept`
    : `the complete tab order, ${stops} stop(s)` +
      (total > stops
        ? `; ${total} focusable element(s) in the DOM, ${total - stops} of them not currently ` +
          'tabbable (a closed <details> hides its links)'
        : '');
  record(
    unindicated.length === 0,
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

async function main() {
  const out = resolve(process.argv[2] ?? join(ROOT, 'out'));
  const port = Number.parseInt(process.argv[3] ?? '3111', 10);
  const base = `http://localhost:${port}`;

  SAMPLES[1].route = await pickEntry(out);
  const routes = [...SAMPLES.map((s) => s.route), ...A11Y_EXTRA_ROUTES];

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

await main();
