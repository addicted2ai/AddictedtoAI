#!/usr/bin/env node
/**
 * verify-analytics.mjs — proof that events actually arrive (task 5.2,
 * specs/analytics, design D8).
 *
 * **Read this before changing anything here.** The previous version of this
 * site had Google Analytics configured correctly, with the same measurement
 * ID, and received no events for months. Nobody noticed, because every check
 * it had confirmed the script tag was *present*. Presence was never the
 * problem. specs/analytics: *"A rendered script tag SHALL never be accepted as
 * evidence that analytics works."* So this script asserts on one thing only —
 * what the network did:
 *
 *   direct load     exactly ONE `/g/collect` hit carrying `en=page_view` per
 *                   full page load. Zero is the dead tag (a blocking CSP, a
 *                   typo'd ID, a script that never executed). Two is the
 *                   double-fire (gtag's automatic send AND the route tracker),
 *                   which corrupts the signal as surely as counting nothing.
 *   tid             the hit reports the configured property, not some other.
 *   status          the collector accepted it, 2xx.
 *   click-through   a click on an internal link that navigates client-side —
 *                   no document load — produces a FURTHER hit carrying the NEW
 *                   path. This is the assertion the previous site would have
 *                   failed: the App Router swaps pages without reloading, so a
 *                   tag that only fires on load records a reader of eight
 *                   pages as one single-page session.
 *   headers         any Content-Security-Policy observed is printed, and a CSP
 *                   that omits the GA origins is a failure. A CSP is the
 *                   root-cause hypothesis that fits the historical symptom
 *                   exactly: the tag renders perfectly, so every markup check
 *                   passes, while the browser silently refuses to run it.
 *
 * The reload probe deserves its own note. A full reload would *also* produce a
 * collect hit with the new path, so an assertion that only looked for the hit
 * would pass on a site with no client-side navigation at all, and would keep
 * passing on the day soft navigation broke. A sentinel is planted on `window`
 * before the click and read back after: it survives a soft navigation and is
 * destroyed by a document load.
 *
 * Usage:
 *   node scripts/verify-analytics.mjs                    # builds nothing; serves ./out itself
 *   node scripts/verify-analytics.mjs http://localhost:3000
 *   node scripts/verify-analytics.mjs https://www.addictedtoai.net
 *
 * With `NEXT_PUBLIC_GA_MEASUREMENT_ID` empty in the environment it checks the
 * third scenario instead — that a build made with the variable unset renders
 * no analytics markup and makes no analytics request. Both halves of that are
 * asserted, because a chunk that ships is not the same as a request that
 * fires. To exercise it:
 *
 *   NEXT_PUBLIC_GA_MEASUREMENT_ID= npm run build
 *   NEXT_PUBLIC_GA_MEASUREMENT_ID= node scripts/verify-analytics.mjs
 *
 * (an empty value in the environment wins over `.env.local` in both Next's
 * loader and this script's, because neither overrides what is already set).
 *
 * The measurement ID is read from the environment, with `.env.local` loaded
 * through `dotenv` because a bare node script does not get Next's automatic
 * loading. The file is never read wholesale or printed; only the one variable
 * is used, and a GA measurement ID is public by design (specs/analytics: it
 * "appears in the environment and in rendered HTML").
 *
 * Exits 0 only if every assertion passed.
 */

import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { chromium } from 'playwright';

import { ROOT } from '../lib/paths.mjs';
import {
  ENV_VAR,
  GA_CONNECT_HOSTS,
  GA_SCRIPT_HOST,
  NAV_PARAM,
  collectHits,
  cspAllowsGa,
  hitPath,
  isCollectUrl,
  measurementIdFrom,
} from '../lib/analytics.mjs';

const LAUNCH_FILE = join(ROOT, 'data', 'launch.json');

/** How long to wait for a hit, and how long to keep watching for a second. */
const HIT_TIMEOUT_MS = 20000;
const SETTLE_MS = 3000;

let failures = 0;
const evidence = [];

function record(pass, label, detail) {
  if (!pass) failures += 1;
  const line = `  ${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`;
  evidence.push({ pass, label, detail });
  process.stdout.write(line + '\n');
  return pass;
}

function note(text) {
  process.stdout.write(`        ${text}\n`);
}

// ---------------------------------------------------------------------------
// the local server (next start refuses to run under output: 'export')
// ---------------------------------------------------------------------------

function startServer(out, port) {
  const child = spawn(
    process.execPath,
    [join(ROOT, 'scripts', 'serve-static.mjs'), out, String(port)],
    { stdio: ['ignore', 'pipe', 'ignore'] },
  );
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

// ---------------------------------------------------------------------------
// hit capture
// ---------------------------------------------------------------------------

/**
 * Every measurement-protocol request the browser makes, with the response
 * status attached when it arrives. Captured at the context level so a hit sent
 * from any frame or by `navigator.sendBeacon` is still seen.
 */
function watchCollect(context) {
  const hits = [];
  context.on('request', (req) => {
    if (!isCollectUrl(req.url())) return;
    const post = req.postData() ?? '';
    hits.push({
      req,
      url: req.url(),
      method: req.method(),
      events: collectHits(req.url(), post),
      status: null,
      failure: null,
      at: Date.now(),
    });
  });
  context.on('response', (res) => {
    const rec = hits.find((h) => h.req === res.request());
    if (rec) rec.status = res.status();
  });
  context.on('requestfailed', (req) => {
    const rec = hits.find((h) => h.req === req);
    if (rec) rec.failure = req.failure()?.errorText ?? 'request failed';
  });
  return hits;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Every `page_view` event across every captured hit. */
function pageViews(hits) {
  const out = [];
  for (const hit of hits) {
    for (const ev of hit.events) {
      if (ev.en === 'page_view') out.push({ ...ev, hit });
    }
  }
  return out;
}

async function waitForPageView(hits, predicate, timeout = HIT_TIMEOUT_MS) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const found = pageViews(hits).filter(predicate);
    if (found.length > 0) return found;
    await sleep(100);
  }
  return [];
}

/** Wait until every captured hit has a status (or failed), then give up. */
async function waitForStatuses(hits, timeout = 10000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (hits.every((h) => h.status !== null || h.failure !== null)) return;
    await sleep(100);
  }
}

// ---------------------------------------------------------------------------
// Content-Security-Policy
// ---------------------------------------------------------------------------

/**
 * A CSP that omits the GA origins is a failure whether or not this run
 * happened to observe a hit — it is the exact configuration that produced
 * months of silence on the previous site, and it can start blocking on any
 * browser version. The evaluation itself lives in `lib/analytics.mjs` so it
 * has unit tests; a guard nobody has ever seen fail is not a guard.
 */
function checkCsp(where, value) {
  if (!value) {
    return record(true, `no Content-Security-Policy on ${where}`, 'specs/analytics: none at launch');
  }
  note(`Content-Security-Policy on ${where}: ${value}`);
  const verdict = cspAllowsGa(value);
  return record(
    verdict.ok,
    `Content-Security-Policy on ${where} permits the GA origins`,
    `script-src ${verdict.script ? 'allows' : 'BLOCKS'} ${GA_SCRIPT_HOST}; ` +
      `connect-src ${verdict.connect ? 'allows' : 'BLOCKS'} ${GA_CONNECT_HOSTS.join(', ')}`,
  );
}

// ---------------------------------------------------------------------------
// the assertions
// ---------------------------------------------------------------------------

/**
 * What actually happened to one hit, stated so it cannot be misread.
 *
 * Both halves are printed on purpose. GA sends its hit with `keepalive`, and
 * Chromium routinely reports such a request as `net::ERR_ABORTED` *after* the
 * response has already arrived — the page moved on and stopped listening, not
 * the collector refusing. An earlier draft of this file printed only the
 * failure text and would have shown "FAILED" beside a passing 2xx assertion:
 * a line that reads like the opposite of what was measured is worse than no
 * line. The status code is the assertion; the transport note is context.
 */
function describe(hit) {
  const status = typeof hit.status === 'number' ? `HTTP ${hit.status}` : 'no response observed';
  const note = hit.failure ? ` [transport: ${hit.failure}]` : '';
  return `${hit.method} ${status}${note}`;
}

/**
 * A direct (full document) load: exactly one page_view, right tid, 2xx.
 */
async function checkDirectLoad(page, hits, base, route, expectedTid) {
  hits.length = 0;
  process.stdout.write(`\ndirect load ${route}\n`);

  const response = await page.goto(`${base}${route}`, { waitUntil: 'load' });

  // Markup, reported as context only. It is never the evidence — but a missing
  // loader tells you instantly which half of the system to look at.
  const markup = await page.evaluate(() => ({
    loader: document.querySelector('[data-analytics-loader]')?.getAttribute('data-analytics-loader') ?? null,
    config: !!document.querySelector('[data-analytics-config]'),
    metaCsp:
      document.querySelector('meta[http-equiv="Content-Security-Policy" i]')?.getAttribute('content') ?? null,
  }));
  record(
    markup.loader === expectedTid && markup.config,
    `${route} renders the gtag loader and bootstrap`,
    `loader id ${markup.loader ?? '(absent)'}, bootstrap ${markup.config ? 'present' : 'ABSENT'} ` +
      '(markup only — not evidence of delivery)',
  );

  const headers = response?.headers() ?? {};
  checkCsp(route, headers['content-security-policy']);
  if (headers['content-security-policy-report-only']) {
    note(`Content-Security-Policy-Report-Only on ${route}: ${headers['content-security-policy-report-only']}`);
  }
  if (markup.metaCsp) checkCsp(`${route} <meta http-equiv>`, markup.metaCsp);

  // Wait for the first page_view, then keep watching: a second one arriving a
  // beat later is the double-fire, and a check that stopped at the first would
  // never see it.
  await waitForPageView(hits, () => true);
  await sleep(SETTLE_MS);
  await waitForStatuses(hits);

  const views = pageViews(hits);
  const trackerSaw = await page.evaluate(() => window.__ataiPageViews ?? null);

  const one = record(
    views.length === 1,
    `${route} sends exactly one page_view`,
    views.length === 0
      ? 'ZERO collect hits — the dead-tag failure. ' +
        `Tracker recorded ${trackerSaw ? JSON.stringify(trackerSaw) : 'nothing'}; ` +
        `${trackerSaw?.length ? 'it fired and the request never left or never arrived' : 'it never fired'}.`
      : views.length === 1
        ? `1 collect hit — ${describe(views[0].hit)}, path ${hitPath(views[0])}, title ${JSON.stringify(views[0].dt ?? null)}`
        : `${views.length} collect hits — the double-fire failure (gtag auto-send AND the route tracker). ` +
          views.map((v) => `${hitPath(v)}@${v.hit.at}`).join(', '),
  );

  if (views.length > 0) {
    const tids = [...new Set(views.map((v) => v.tid))];
    record(
      tids.length === 1 && tids[0] === expectedTid,
      `${route} page_view reports the configured tid`,
      `tid ${tids.join(', ')} vs configured ${expectedTid}`,
    );
    const statuses = views.map((v) => v.hit.status);
    record(
      statuses.every((s) => typeof s === 'number' && s >= 200 && s < 300),
      `${route} collect response is 2xx`,
      views.map((v) => describe(v.hit)).join('; '),
    );
    record(
      views.some((v) => hitPath(v) === route),
      `${route} page_view carries this page's path`,
      `reported ${views.map((v) => hitPath(v)).join(', ')}`,
    );
    // Attribution: the one page_view on a full load must be this site's
    // tracker, which is also the proof that gtag's automatic send is off.
    record(
      views.some((v) => v.nav === 'load'),
      `${route} page_view came from this site's route tracker`,
      `${NAV_PARAM}=${views.map((v) => v.nav ?? '(unmarked)').join(', ')}` +
        (views.some((v) => v.nav === 'load')
          ? ''
          : " — an unmarked hit is gtag's own send or Enhanced Measurement, not the tracker"),
    );
  } else {
    // Without a hit there is nothing to assert tid or status on; say so rather
    // than silently reporting four fewer checks.
    record(false, `${route} page_view reports the configured tid`, 'no collect hit to inspect');
    record(false, `${route} collect response is 2xx`, 'no collect hit to inspect');
    record(false, `${route} page_view carries this page's path`, 'no collect hit to inspect');
    record(false, `${route} page_view came from this site's route tracker`, 'no collect hit to inspect');
  }

  return one;
}

/**
 * The click-through: a real click on a real internal link, no reload, and a
 * further page_view carrying the new path.
 */
async function checkClickThrough(page, hits, base, expectedTid) {
  process.stdout.write('\nclient-side navigation (click an internal link from the home page)\n');

  await page.goto(`${base}/`, { waitUntil: 'load' });
  await waitForPageView(hits, () => true);
  await sleep(SETTLE_MS);

  const link = await page.evaluate(() => {
    const anchors = [...document.querySelectorAll('nav[aria-label="Primary"] a')];
    const here = window.location.pathname;
    const a = anchors.find((el) => {
      const href = el.getAttribute('href') ?? '';
      return href.startsWith('/') && !href.startsWith('//') && href !== here;
    });
    return a ? { href: a.getAttribute('href'), text: (a.textContent ?? '').trim() } : null;
  });

  if (!link) {
    return record(false, 'click-through: an internal link exists on the home page', 'no internal nav link found');
  }
  note(`clicking "${link.text}" → ${link.href}`);

  // The sentinel. A soft navigation keeps the JS context; a document load
  // destroys it. Without this, a site with no client-side navigation would
  // pass this assertion on the strength of the reload's own page_view.
  await page.evaluate(() => {
    window.__ataiReloadProbe = 'alive';
  });

  hits.length = 0; // only hits caused by the click count from here
  const before = page.url();
  await page.click(`nav[aria-label="Primary"] a[href="${link.href}"]`);
  try {
    await page.waitForURL((u) => u.pathname === link.href, { timeout: 10000 });
  } catch {
    /* reported by the assertions below */
  }

  const landed = new URL(page.url()).pathname;
  record(landed === link.href, 'click-through: the click navigated', `${new URL(before).pathname} → ${landed}`);

  const probe = await page.evaluate(() => window.__ataiReloadProbe ?? null);
  const soft = record(
    probe === 'alive',
    'click-through: the navigation was client-side (no document load)',
    probe === 'alive'
      ? 'the JS context survived the navigation'
      : 'the JS context was destroyed — this was a FULL PAGE LOAD, not a soft navigation, ' +
        'so the route-change tracker is untested and real soft navigation would go uncounted',
  );

  // Wait specifically for a hit this site's tracker sent. Waiting for "any hit
  // for the new path" would be satisfied by GA4 Enhanced Measurement's own
  // history-change page_view, which the property sends whether or not this
  // site has a route tracker at all.
  await waitForPageView(hits, (v) => hitPath(v) === link.href && v.nav === 'route');
  await sleep(SETTLE_MS);
  await waitForStatuses(hits);

  const views = pageViews(hits);
  const matching = views.filter((v) => hitPath(v) === link.href);
  const fromTracker = matching.filter((v) => v.nav === 'route');
  const trackerSaw = await page.evaluate(() => window.__ataiPageViews ?? null);

  const arrived = record(
    fromTracker.length >= 1,
    'click-through: a further page_view arrives carrying the new path',
    fromTracker.length > 0
      ? `${fromTracker.length} collect hit(s) for ${link.href} from the route tracker ` +
        `(${NAV_PARAM}=route) — ${describe(fromTracker[0].hit)}, title ${JSON.stringify(fromTracker[0].dt ?? null)}`
      : `NO route-tracker collect hit for ${link.href} after the click — this is the soft-navigation ` +
        'undercount: the visitor moved and this site did not count it. ' +
        `Captured ${views.length} page_view hit(s) in this window ` +
        `[${views.map((v) => `${hitPath(v)} ${NAV_PARAM}=${v.nav ?? '(unmarked)'}`).join(', ') || 'none'}]; ` +
        `the tracker's own record is ${trackerSaw ? JSON.stringify(trackerSaw) : 'empty'}` +
        (trackerSaw && trackerSaw.includes(link.href)
          ? ' (it fired, so the request was blocked or lost)'
          : ' (it never fired — the route-change tracker is not running)'),
  );

  // A soft navigation counted twice corrupts the signal exactly as badly as one
  // counted zero times, and there are two senders in play here (this tracker
  // and Enhanced Measurement). Assert the count, do not assume the dedupe.
  record(
    matching.length === 1,
    'click-through: the navigation is counted exactly once',
    `${matching.length} page_view hit(s) for ${link.href} ` +
      `[${matching.map((v) => `${NAV_PARAM}=${v.nav ?? '(unmarked)'}`).join(', ') || 'none'}]`,
  );

  if (fromTracker.length > 0) {
    record(
      fromTracker.every((v) => v.tid === expectedTid),
      'click-through: the page_view reports the configured tid',
      `tid ${[...new Set(fromTracker.map((v) => v.tid))].join(', ')} vs configured ${expectedTid}`,
    );
    record(
      fromTracker.every(
        (v) => typeof v.hit.status === 'number' && v.hit.status >= 200 && v.hit.status < 300,
      ),
      'click-through: the collect response is 2xx',
      fromTracker.map((v) => describe(v.hit)).join('; '),
    );
  } else {
    record(false, 'click-through: the page_view reports the configured tid', 'no collect hit to inspect');
    record(false, 'click-through: the collect response is 2xx', 'no collect hit to inspect');
  }

  return soft && arrived;
}

/**
 * The third scenario in specs/analytics: *"the site is built with the variable
 * unset ... no page contains any analytics markup or makes any analytics
 * request."*
 *
 * Worth checking behaviorally rather than by grepping the output, for the same
 * reason as everything else here: the absence of a `<script>` tag in the HTML
 * is not the absence of a request. The markup assertion and the request
 * assertion are both made, and both have to hold.
 */
async function checkSilence(page, hits, base, route) {
  process.stdout.write(`\nsilence with ${ENV_VAR} unset — ${route}\n`);
  hits.length = 0;
  const gaRequests = [];
  const listener = (req) => {
    if (/googletagmanager\.com|google-analytics\.com|analytics\.google\.com/.test(req.url())) {
      gaRequests.push(req.url());
    }
  };
  page.context().on('request', listener);

  await page.goto(`${base}${route}`, { waitUntil: 'load' });
  await sleep(SETTLE_MS);

  const markup = await page.evaluate(() => ({
    loader: !!document.querySelector('[data-analytics-loader]'),
    config: !!document.querySelector('[data-analytics-config]'),
    anyGtag: [...document.querySelectorAll('script')].some((s) =>
      (s.src || s.textContent || '').includes('googletagmanager.com'),
    ),
    gtagFn: typeof window.gtag,
    tracker: window.__ataiPageViews ?? null,
  }));

  record(
    !markup.loader && !markup.config && !markup.anyGtag,
    `${route} renders no analytics markup`,
    `loader ${markup.loader}, bootstrap ${markup.config}, any gtag script ${markup.anyGtag}`,
  );
  record(
    gaRequests.length === 0,
    `${route} makes no request to any analytics origin`,
    gaRequests.length === 0
      ? `0 requests; window.gtag is ${markup.gtagFn}, tracker record ${JSON.stringify(markup.tracker)}`
      : gaRequests.slice(0, 3).join('; '),
  );

  page.context().off('request', listener);
}

// ---------------------------------------------------------------------------

/** A real content page from this build, never a hard-coded slug. */
async function pickContentRoute(base) {
  try {
    const res = await fetch(`${base}/search-index.json`);
    const index = await res.json();
    const entry = index.docs?.find((d) => d.k === 'entry' && d.u && d.u !== '/');
    if (entry) return entry.u;
  } catch {
    /* fall through */
  }
  return '/wiki';
}

async function main() {
  loadEnv({ path: join(ROOT, '.env.local'), quiet: true });

  let expectedTid;
  try {
    expectedTid = measurementIdFrom(process.env);
  } catch (err) {
    process.stderr.write(`verify-analytics: ${err.message}\n`);
    process.exit(2);
  }
  // argv[2] is either a base URL to test (nothing is served locally) or an
  // export directory to serve; argv[3] is the port for the local server.
  const arg = process.argv[2];
  const externalBase = arg && /^https?:\/\//i.test(arg) ? arg.replace(/\/+$/, '') : null;
  const out = resolve(externalBase || !arg ? join(ROOT, 'out') : arg);
  const port = Number.parseInt(process.argv[3] ?? '3212', 10);
  const base = externalBase ?? `http://localhost:${port}`;

  process.stdout.write(`verify-analytics: ${base}\n`);
  process.stdout.write(
    expectedTid
      ? `  property under test: ${expectedTid} (a GA measurement ID is public by design)\n`
      : `  ${ENV_VAR} is unset — checking the third scenario instead: that the build is silent\n`,
  );
  if (!externalBase) process.stdout.write(`  serving ${out} with scripts/serve-static.mjs\n`);

  const server = externalBase ? null : await startServer(out, port);
  const browser = await chromium.launch();
  let contentRoute = '/wiki';
  try {
    contentRoute = await pickContentRoute(base);
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const hits = watchCollect(context);
    const page = await context.newPage();

    if (expectedTid) {
      await checkDirectLoad(page, hits, base, '/', expectedTid);
      await checkDirectLoad(page, hits, base, contentRoute, expectedTid);
      await checkClickThrough(page, hits, base, expectedTid);
    } else {
      await checkSilence(page, hits, base, '/');
      await checkSilence(page, hits, base, contentRoute);
    }
  } finally {
    await browser.close();
    server?.kill();
  }

  // task 5.3 — record the local result. A run against the live site is the
  // launch checklist's job (9.3) and does not overwrite the local record, and
  // a silence run is not the launch record either.
  if (!externalBase && expectedTid) {
    let launch = {};
    try {
      launch = JSON.parse(await readFile(LAUNCH_FILE, 'utf8'));
    } catch {
      /* first run */
    }
    launch.analytics_local = {
      date: new Date().toISOString().slice(0, 10),
      base,
      measurement_id: expectedTid,
      pages_tested: ['/', contentRoute, `click-through / → nav link`],
      assertions: evidence.length,
      failures,
      pass: failures === 0,
      method:
        'Playwright/Chromium against the exported build served by scripts/serve-static.mjs; ' +
        'assertions are on captured /g/collect requests and their response status, never on markup',
    };
    await writeFile(LAUNCH_FILE, JSON.stringify(launch, null, 2) + '\n', 'utf8');
  }

  process.stdout.write(
    `\nverify-analytics: ${evidence.length} assertion(s), ${failures} failure(s)\n`,
  );
  if (failures > 0) {
    process.stdout.write('failed assertions:\n');
    for (const e of evidence.filter((x) => !x.pass)) {
      process.stdout.write(`  - ${e.label}${e.detail ? ` — ${e.detail}` : ''}\n`);
    }
  }
  process.exit(failures === 0 ? 0 : 1);
}

await main();
