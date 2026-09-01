#!/usr/bin/env node
/**
 * verify-surfaces.mjs — the checks that need the *exported* site, not the
 * fixtures (tasks 4.2, 4.8, 4.9, 4.10, 4.13).
 *
 * The unit tests in `lib/*.test.mjs` prove the renderers behave; this proves
 * the site those renderers actually produced behaves. The difference is not
 * academic: the page chrome, the framework's own tags, the metadata and the
 * generated static files exist only after `next build`, and three of the
 * five checks below can only fail there.
 *
 *   sort notes      every standing table and the tools listing states the
 *                   criterion it is ordered by (specs/directory)
 *   colophon        reachable, one page, and absent from primary navigation
 *                   (specs/site)
 *   citable assets  every feed parses with a third-party parser and exposes
 *                   a title, items and valid item dates; the dataset parses
 *                   and names its licence
 *   origins         no exported page references a network origin outside the
 *                   allowlist — the half of task 4.10 that content checking
 *                   cannot see
 *   contract        every machine-readable payload states its schema version and
 *                   points at /data#contract, that anchor exists and states both
 *                   halves of the rule, and vercel.json declares CORS for every
 *                   asset route (beads addictedtoai-k1j)
 *   crawler stance  robots.txt allows every crawler, carries no Disallow, names
 *                   the four AI crawlers a position was taken on, and ships its
 *                   reasoning; llms.txt's links all resolve in this export and
 *                   its counts match the dataset (beads addictedtoai-k1j)
 *   structured data every indexed page of the five described kinds carries the
 *                   right schema.org type, no `noindex` page carries any, every
 *                   `dateModified` equals that URL's `<lastmod>` in the sitemap,
 *                   and every quoted `description` is text the page itself
 *                   contains (beads addictedtoai-k1j)
 *   build stamp     the footer and /status.json carry the same stamp
 *
 * Usage:  node scripts/verify-surfaces.mjs [outDir]
 * Exits nonzero on any failure, printing one evidence line per assertion.
 */

import { readFile } from 'node:fs/promises';
import { join, resolve, relative } from 'node:path';
import fg from 'fast-glob';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';

import { scanExportedPages } from '../lib/origins.mjs';
import { SITE_HOSTS, SITE_URL } from '../lib/site-config.mjs';
import {
  FEED_ROUTES,
  DATASET_JSON_ROUTE,
  DATASET_CSV_ROUTES,
  DATASET_LICENSE,
  TABLE_JSON_ROUTES,
  SEARCH_INDEX_ROUTE,
  ROBOTS_ROUTE,
  LLMS_ROUTE,
  TABLE_SCHEMA_VERSION,
  DATASET_SCHEMA_VERSION,
  CONTRACT_ANCHOR,
} from '../lib/asset-routes.mjs';
import { AI_CRAWLERS } from '../lib/crawlers.mjs';
import { CORS_ROUTES, VERCEL_FILE } from '../lib/redirects.mjs';
import { absoluteUrl } from '../lib/site-config.mjs';

let failures = 0;

function ok(label, detail = '') {
  process.stdout.write(`  PASS  ${label}${detail ? ` — ${detail}` : ''}\n`);
}

function bad(label, detail) {
  failures += 1;
  process.stdout.write(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}\n`);
}

function check(cond, label, detail) {
  if (cond) ok(label, detail);
  else bad(label, detail);
  return cond;
}

const read = (out, route) =>
  readFile(join(out, route.replace(/^\//, '') || 'index.html'), 'utf8');

const page = async (out, route) => {
  const file = route === '/' ? 'index.html' : `${route.replace(/^\/+|\/+$/g, '')}.html`;
  return cheerio.load(await readFile(join(out, file), 'utf8'));
};

async function checkSortNotes(out) {
  process.stdout.write('\nsort criteria (specs/directory: ordering is stated, never sold)\n');
  const pages = [
    ['/catalog', 'the full catalog'],
    ['/catalog/deprecations', 'deprecations and retirements'],
    ['/catalog/changed', 'changed in 30 days'],
    ['/tools', 'the tools listing'],
    ['/impossible-routine', 'the showpiece'],
  ];
  for (const [route, label] of pages) {
    const $ = await page(out, route);
    const note = $('[data-sort-note]').first();
    check(
      note.length > 0 && note.attr('data-sort-note').length > 0,
      `${route} states its sort criterion`,
      note.attr('data-sort-note') ?? 'no [data-sort-note] element',
    );
  }

  // Each standing table's machine-readable sibling: it must parse, carry its
  // rows, and state the same sort criterion the page does — a JSON sibling
  // ordered differently from the page it mirrors is a trap, not a service.
  for (const [route, pageRoute] of Object.entries(TABLE_JSON_ROUTES).map(([name, r]) => [
    r,
    { catalog: '/catalog', deprecations: '/catalog/deprecations', changed: '/catalog/changed' }[name],
  ])) {
    try {
      const payload = JSON.parse(await read(out, route));
      const $ = await page(out, pageRoute);
      check(
        Array.isArray(payload.rows) &&
          payload.row_count === payload.rows.length &&
          payload.sort_criterion === $('[data-sort-note]').first().attr('data-sort-note'),
        `${route} parses and matches ${pageRoute}`,
        `${payload.row_count} row(s), sorted by ${payload.sort_criterion}`,
      );
    } catch (err) {
      bad(`${route} parses`, err.message);
    }
  }
}

async function checkColophon(out) {
  process.stdout.write('\ncolophon (specs/site: one page, out of primary navigation)\n');
  const $ = await page(out, '/colophon');
  check($('h1').length === 1, 'the colophon renders', $('h1').first().text());
  check(
    $('body').text().includes('No human has written a character of it'),
    'it states that an AI writes and maintains the site',
  );
  check(
    /commit history/i.test($('body').text()),
    'it points at the public commit history as the record',
  );

  const navHrefs = $('nav[aria-label="Primary"] a')
    .map((_, e) => $(e).attr('href'))
    .get();
  check(navHrefs.length > 0, 'the primary nav exists', navHrefs.join(' '));
  check(
    !navHrefs.some((h) => h.startsWith('/colophon')),
    'no primary-nav link points at the colophon',
  );
  check(
    $('.footer-links a[href="/colophon"]').length === 1,
    'it is reachable, from the footer',
  );

  // Every other page must keep the same nav — the rule is site-wide.
  for (const route of ['/', '/wiki', '/catalog', '/blog']) {
    const p = await page(out, route);
    const hrefs = p('nav[aria-label="Primary"] a').map((_, e) => p(e).attr('href')).get();
    if (hrefs.some((h) => h.startsWith('/colophon'))) {
      bad(`${route} keeps the colophon out of the nav`, hrefs.join(' '));
      return;
    }
  }
  ok('every sampled page keeps the colophon out of the nav');
}

async function checkFeeds(out) {
  process.stdout.write('\ncitable assets (specs/site)\n');
  const parser = new Parser();
  for (const [name, route] of Object.entries(FEED_ROUTES)) {
    try {
      const parsed = await parser.parseString(await read(out, route));
      const badDate = parsed.items.find((i) => !i.isoDate || Number.isNaN(Date.parse(i.isoDate)));
      check(
        Boolean(parsed.title) && !badDate,
        `${route} parses with rss-parser`,
        `title "${parsed.title}", ${parsed.items.length} item(s)` +
          (badDate ? `, BAD DATE on "${badDate.title}"` : ''),
      );
    } catch (err) {
      bad(`${route} parses with rss-parser`, err.message);
    }
  }

  try {
    const dataset = JSON.parse(await read(out, DATASET_JSON_ROUTE));
    check(
      dataset.license === DATASET_LICENSE,
      `${DATASET_JSON_ROUTE} names its licence in the payload`,
      dataset.license,
    );
    check(
      Array.isArray(dataset.entries) && dataset.entries.length > 0,
      'the dataset carries the structured layer',
      Object.entries(dataset.counts).map(([k, v]) => `${v} ${k}`).join(', '),
    );
  } catch (err) {
    bad(`${DATASET_JSON_ROUTE} parses`, err.message);
  }

  for (const route of Object.values(DATASET_CSV_ROUTES)) {
    try {
      const text = await read(out, route);
      const [header, ...rows] = text.trim().split('\n');
      const licensed = rows.length === 0 || rows.every((r) => r.includes(DATASET_LICENSE));
      check(
        header.includes('license') && licensed,
        `${route} states its licence in every row`,
        `${rows.length} row(s)`,
      );
    } catch (err) {
      bad(`${route} exists`, err.message);
    }
  }

  try {
    const sitemap = await read(out, '/sitemap.xml');
    const count = (sitemap.match(/<loc>/g) ?? []).length;
    check(count > 0, '/sitemap.xml lists URLs', `${count} URL(s)`);
  } catch (err) {
    bad('/sitemap.xml exists', err.message);
  }

  // The search index is served, not only written to data/derived/ — the
  // browser can only fetch what is in the export.
  try {
    const index = JSON.parse(await read(out, SEARCH_INDEX_ROUTE));
    const stubs = index.docs.filter((d) => d.b).length;
    check(
      index.count === index.docs.length && index.count > 0,
      `${SEARCH_INDEX_ROUTE} is served and covers the corpus`,
      `${index.count} page(s), ${stubs} of them stubs`,
    );
  } catch (err) {
    bad(`${SEARCH_INDEX_ROUTE} parses`, err.message);
  }

  const $ = await page(out, '/');
  check(
    $('meta[property="og:title"]').length > 0 && $('meta[property="og:type"]').length > 0,
    'generic Open Graph metadata is present',
    $('meta[property="og:title"]').attr('content') ?? '',
  );
  check(
    $('meta[name="twitter:site"]').length === 0 && $('meta[property="og:site"]').length === 0,
    'and carries no social handles',
  );
}

async function checkOrigins(out) {
  process.stdout.write('\nthird-party origins (task 4.10 — the exported half)\n');
  const files = await fg(join(out, '**/*.html').split('\\').join('/'), { onlyFiles: true });
  const pages = [];
  for (const file of files) {
    pages.push({ path: '/' + relative(out, file).split('\\').join('/'), html: await readFile(file, 'utf8') });
  }
  const violations = scanExportedPages(pages, SITE_HOSTS);
  check(
    violations.length === 0,
    `${pages.length} exported page(s) reference no origin outside the allowlist`,
    violations.length === 0
      ? ''
      : violations.slice(0, 5).map((v) => `${v.page} ${v.where} ${v.origin}`).join('; '),
  );
}

/**
 * ---------------------------------------------------------------------------
 * THE PUBLISHED CONTRACT (beads addictedtoai-k1j)
 *
 * `/catalog.json` and its siblings are advertised as something other people
 * can build on. This checks the three things that claim rests on: that every
 * payload states its version, that every payload points at the page where the
 * rule is written, and that the page is actually there under the anchor those
 * payloads name — a `contract:` URL landing on a missing anchor is worse than
 * no field, because it is a promise with a broken address.
 *
 * THE CORS ASSERTION IS DELIBERATELY NARROW, AND SAYS SO IN ITS OWN LABEL.
 * Under `output: 'export'` there is no server here, and no exported byte
 * records a response header: the host applies `vercel.json`. So this asserts
 * the DECLARATION, not the served header. Confirming the header itself needs a
 * request to the deployed site, which is the deploy poll's job and not this
 * script's, and pretending otherwise would be exactly the "reason from what a
 * change was meant to do rather than measure what it does" error.
 * ---------------------------------------------------------------------------
 */
async function checkContract(out) {
  process.stdout.write('\npublished contract (specs/site — a contract you publish is one you keep)\n');

  const contractUrl = absoluteUrl(CONTRACT_ANCHOR);
  const payloads = [
    ...Object.values(TABLE_JSON_ROUTES).map((r) => [r, TABLE_SCHEMA_VERSION]),
    [DATASET_JSON_ROUTE, DATASET_SCHEMA_VERSION],
  ];
  for (const [route, version] of payloads) {
    try {
      const payload = JSON.parse(await read(out, route));
      check(
        payload.schema_version === version && payload.contract === contractUrl,
        `${route} states its schema version and points at the contract`,
        `schema_version ${JSON.stringify(payload.schema_version)}, contract ${JSON.stringify(payload.contract)}`,
      );
    } catch (err) {
      bad(`${route} carries the contract fields`, err.message);
    }
  }

  // The anchor those payloads publish must exist, and the page must state both
  // halves of the rule. "What is stable" alone is the half that makes a
  // contract unkeepable.
  const $ = await page(out, '/data');
  const section = $('#contract');
  const text = section.closest('section').text();
  check(section.length === 1, `${CONTRACT_ANCHOR} resolves to exactly one anchor on /data`, String(section.length));
  check(
    /What is stable/i.test(text) && /What is not/i.test(text),
    '/data states what is stable AND what is not',
  );
  check(
    /renamed or removed/i.test(text),
    '/data says what a version change means',
  );

  try {
    const vercel = JSON.parse(await readFile(VERCEL_FILE, 'utf8'));
    const declared = new Map(
      (vercel.headers ?? []).map((h) => [
        h.source,
        (h.headers ?? []).find((x) => x.key === 'Access-Control-Allow-Origin')?.value,
      ]),
    );
    const uncovered = CORS_ROUTES.filter((r) => declared.get(r) !== '*');
    check(
      uncovered.length === 0,
      `vercel.json declares CORS for all ${CORS_ROUTES.length} machine-readable route(s)`,
      uncovered.length === 0
        ? 'the DECLARATION only — the host applies it, and no exported byte records a response header'
        : `uncovered: ${uncovered.slice(0, 5).join(', ')}`,
    );
  } catch (err) {
    bad('vercel.json declares CORS', err.message);
  }
}

/**
 * ---------------------------------------------------------------------------
 * THE CRAWLER STANCE AND llms.txt (beads addictedtoai-k1j)
 *
 * `lib/crawlers.test.mjs` proves the renderers produce the right text. This
 * proves the EXPORT carries it, which is a different claim now that
 * `robots.txt` comes from `public/` rather than from `app/robots.ts`: a
 * `STATIC_ASSET_ROUTES` entry that stopped being written would leave the site
 * with no `robots.txt` at all, and the only place that shows is the export.
 *
 * The `Disallow` assertion is the one that protects behaviour rather than
 * documentation. Every `noindex` on this site is a per-page meta tag, and a
 * crawler that is disallowed never fetches the page and so never reads the
 * tag — a `Disallow` added here in good faith would silently break the
 * indexability rules the whole wiki depends on.
 *
 * `llms.txt`'s links are resolved against the exported tree, and its counts
 * against the exported dataset. A pointer file whose pointers 404, or whose
 * numbers disagree with the payload they claim to describe, is worse than no
 * pointer file: it is confidently wrong.
 * ---------------------------------------------------------------------------
 */
async function checkCrawlerFiles(out) {
  process.stdout.write('\ncrawler stance (specs/site — allowed by choice, not by default)\n');

  let robots = '';
  try {
    robots = await read(out, ROBOTS_ROUTE);
  } catch (err) {
    bad(`${ROBOTS_ROUTE} is served`, err.message);
    return;
  }
  check(/^User-agent: \*$/m.test(robots) && /^Allow: \/$/m.test(robots), `${ROBOTS_ROUTE} allows every crawler`);
  check(
    !/^\s*Disallow:/m.test(robots),
    `${ROBOTS_ROUTE} carries no Disallow`,
    'a Disallow would stop a crawler reading the per-page noindex this site relies on',
  );
  const unnamed = AI_CRAWLERS.filter((b) => !new RegExp(`^User-agent: ${b.agent}$`, 'm').test(robots));
  check(
    unnamed.length === 0,
    `${ROBOTS_ROUTE} names every AI crawler a position was taken on`,
    unnamed.length === 0 ? AI_CRAWLERS.map((b) => `${b.agent} ${b.rule}`).join(', ') : unnamed.map((b) => b.agent).join(', '),
  );
  check(
    robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`),
    `${ROBOTS_ROUTE} points at the sitemap`,
  );
  check(
    robots.split('\n').filter((l) => l.startsWith('#')).length >= 15,
    `${ROBOTS_ROUTE} carries its reasoning, in the served file`,
    `${robots.split('\n').filter((l) => l.startsWith('#')).length} comment line(s)`,
  );

  let llms = '';
  try {
    llms = await read(out, LLMS_ROUTE);
  } catch (err) {
    bad(`${LLMS_ROUTE} is served`, err.message);
    return;
  }
  // Every link it advertises must exist in this export. `llms.txt` is read by
  // machines that will not shrug at a 404.
  const links = [...llms.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]);
  const broken = [];
  for (const url of links) {
    if (!url.startsWith(SITE_URL)) {
      // An off-site URL here would be a licence link, which is not ours to serve.
      if (!/creativecommons\.org/.test(url)) broken.push(`${url} (off-site)`);
      continue;
    }
    const route = url.slice(SITE_URL.length) || '/';
    // Three shapes, because `llms.txt` advertises both static files and pages:
    // `/catalog.json` is a file, `/wiki` is `out/wiki.html` under this
    // exporter, and `/` is `out/index.html`.
    const candidates =
      route === '/' ? ['index.html'] : [route.slice(1), `${route.slice(1)}.html`, `${route.slice(1)}/index.html`];
    let found = false;
    for (const candidate of candidates) {
      try {
        await readFile(join(out, candidate), 'utf8');
        found = true;
        break;
      } catch {
        /* try the next shape */
      }
    }
    if (!found) broken.push(route);
  }
  check(
    broken.length > 0 ? false : links.length > 0,
    `${LLMS_ROUTE} advertises ${links.length} URL(s), all of which this export serves`,
    broken.length === 0 ? '' : `missing: ${broken.slice(0, 5).join(', ')}`,
  );

  try {
    const counts = JSON.parse(await read(out, DATASET_JSON_ROUTE)).counts ?? {};
    const wrong = Object.entries(counts).filter(([, v]) => !llms.includes(`**${v} `));
    check(
      wrong.length === 0,
      `${LLMS_ROUTE} states the same counts as ${DATASET_JSON_ROUTE}`,
      wrong.length === 0
        ? Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ')
        : `disagrees on: ${wrong.map(([k, v]) => `${k}=${v}`).join(', ')}`,
    );
  } catch (err) {
    bad(`${LLMS_ROUTE} counts check`, err.message);
  }
}

/**
 * ---------------------------------------------------------------------------
 * STRUCTURED DATA (beads addictedtoai-k1j)
 *
 * `lib/jsonld.test.mjs` proves the builders produce the right objects. This
 * proves the site actually *ships* them, and it is the half that can rot
 * silently: a graph is read by machines only, so a page that quietly stopped
 * emitting one, or that emits one contradicting its own markup, looks
 * completely normal to every human who ever opens it.
 *
 * Four assertions, each a measurement rather than a restatement of intent:
 *
 *  1. COVERAGE. Every exported page of a described kind that is *indexable*
 *     carries a graph of the expected type. Read off the export, not off the
 *     site model, because "the renderer would have produced one" is exactly
 *     the claim in question.
 *  2. THE CONTRADICTION CHECK. A page carrying `noindex` carries no graph at
 *     all. Structured data on a page we ask crawlers to skip is a
 *     disagreement shipped in two files, and a `noindex` stub or a
 *     discontinued listing is the case that would produce it.
 *  3. `dateModified` == `<lastmod>`. The graph and the sitemap must answer
 *     "when did this page last materially change" with the same day. This is
 *     the anti-rot gate the whole design rests on: it is what stops anyone
 *     later reaching for a build clock, an mtime or a git date here, because
 *     any of those would move `dateModified` off the sitemap's value on the
 *     first build and fail loudly.
 *  4. A `description` IS A QUOTATION. Every description must be text the page
 *     itself contains — its body, or its own `<meta name="description">`.
 *     Nothing here can check that a summary is fair, so no summary is allowed.
 * ---------------------------------------------------------------------------
 */

/** `out/wiki/concept/x.html` -> `/wiki/concept/x`; `out/index.html` -> `/`. */
function routeOfFile(out, file) {
  const rel = relative(out, file).split('\\').join('/').replace(/\.html$/, '');
  if (rel === 'index') return '/';
  return `/${rel.replace(/\/index$/, '')}`;
}

/** `<loc>` -> the date part of `<lastmod>`, for every URL the sitemap lists. */
function sitemapLastmods(xml) {
  const map = new Map();
  for (const block of String(xml).matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = /<loc>([^<]+)<\/loc>/.exec(block[1])?.[1];
    const mod = /<lastmod>([^<]+)<\/lastmod>/.exec(block[1])?.[1];
    if (loc) map.set(loc.trim(), mod ? mod.trim().slice(0, 10) : undefined);
  }
  return map;
}

/** Whitespace-normalised, so a line break in the markup is not a mismatch. */
const flat = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

/**
 * Which schema.org type each described route family must carry.
 *
 * `/wiki/concept/**` and `/wiki/technique/**` only: `lib/jsonld.mjs` describes
 * those two kinds and deliberately describes no other, so listing the other
 * six here would assert coverage the design does not promise.
 */
const EXPECTED_TYPE = [
  [/^\/wiki\/(concept|technique)\/[^/]+$/, 'DefinedTerm'],
  [/^\/tools\/[^/]+$/, 'SoftwareApplication'],
  [/^\/blog\/[^/]+$/, 'Article'],
  [/^\/impossible-routine\/[^/]+$/, 'Article'],
];

async function checkStructuredData(out) {
  process.stdout.write('\nstructured data (specs/site — the machine-readable surface)\n');

  const lastmods = sitemapLastmods(await read(out, '/sitemap.xml'));
  const files = await fg(join(out, '**/*.html').split('\\').join('/'), { onlyFiles: true });

  const counts = new Map();
  const missing = [];
  const onNoindex = [];
  const dateMismatch = [];
  const unquoted = [];
  const malformed = [];
  let graphs = 0;

  for (const file of files.sort()) {
    const route = routeOfFile(out, file);
    const $ = cheerio.load(await readFile(file, 'utf8'));
    const blocks = $('script[type="application/ld+json"]')
      .map((_, e) => $(e).text())
      .get();
    const noindex = /noindex/i.test($('meta[name="robots"]').attr('content') ?? '');
    const metaDescription = flat($('meta[name="description"]').attr('content'));
    // Scripts stripped first, and that is the whole check: `<body>.text()`
    // includes the JSON-LD block itself, so a description would be "found in
    // the page" by virtue of being in the graph. Assertion 4 would have passed
    // on every input, including a fabricated summary, which is exactly the
    // vacuous-check failure this project keeps writing rules about.
    const bodyText = flat($('body').clone().find('script, style').remove().end().text());

    if (noindex && blocks.length > 0) onNoindex.push(route);

    const seen = new Set();
    for (const raw of blocks) {
      let graph;
      try {
        graph = JSON.parse(raw);
      } catch (err) {
        malformed.push(`${route}: ${err.message}`);
        continue;
      }
      graphs += 1;
      if (graph['@context'] !== 'https://schema.org' || !graph['@type']) {
        malformed.push(`${route}: @context ${JSON.stringify(graph['@context'])}, @type ${JSON.stringify(graph['@type'])}`);
        continue;
      }
      seen.add(graph['@type']);
      counts.set(graph['@type'], (counts.get(graph['@type']) ?? 0) + 1);

      if (graph.dateModified) {
        // The page's own URL, however the graph states it — a Dataset names
        // the page in `url`, an application names the tool there and the page
        // in `mainEntityOfPage`.
        const pageUrl = graph.mainEntityOfPage ?? graph.url;
        const expected = lastmods.get(pageUrl);
        if (expected !== graph.dateModified) {
          dateMismatch.push(`${route}: graph ${graph.dateModified} vs sitemap ${expected ?? '(none)'}`);
        }
      }

      if (graph.description) {
        const d = flat(graph.description);
        if (!bodyText.includes(d) && d !== metaDescription) {
          unquoted.push(`${route}: ${d.slice(0, 60)}…`);
        }
      }
    }

    for (const [pattern, type] of EXPECTED_TYPE) {
      if (!pattern.test(route) || noindex) continue;
      if (!seen.has(type)) missing.push(`${route} (expected ${type})`);
    }
  }

  check(
    malformed.length === 0,
    `${graphs} JSON-LD block(s) parse and declare schema.org`,
    malformed.slice(0, 5).join('; '),
  );
  check(
    missing.length === 0,
    'every indexable page of a described kind carries its graph',
    missing.length === 0
      ? [...counts].sort().map(([t, n]) => `${n} ${t}`).join(', ')
      : `${missing.length} missing: ${missing.slice(0, 5).join('; ')}`,
  );
  check(
    onNoindex.length === 0,
    'no noindex page carries structured data',
    onNoindex.length === 0 ? '' : `${onNoindex.length}: ${onNoindex.slice(0, 5).join(', ')}`,
  );
  check(
    dateMismatch.length === 0,
    'every dateModified equals that URL\'s <lastmod> in sitemap.xml',
    dateMismatch.length === 0
      ? 'one definition of "changed" (addictedtoai-8ho), two surfaces'
      : `${dateMismatch.length}: ${dateMismatch.slice(0, 5).join('; ')}`,
  );
  check(
    unquoted.length === 0,
    'every description is text the page itself carries',
    unquoted.length === 0 ? '' : `${unquoted.length}: ${unquoted.slice(0, 3).join('; ')}`,
  );

  // The two index-level graphs, named rather than counted: each is one page
  // and a silent zero would otherwise read the same as a pass.
  check((counts.get('Dataset') ?? 0) === 1, '/data carries exactly one Dataset', String(counts.get('Dataset') ?? 0));
  check(
    (counts.get('DefinedTermSet') ?? 0) === 1,
    '/wiki carries exactly one DefinedTermSet',
    String(counts.get('DefinedTermSet') ?? 0),
  );
}

async function checkStamp(out) {
  process.stdout.write('\nbuild stamp (specs/site)\n');
  const status = JSON.parse(await read(out, '/status.json'));
  check(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(status.built_at) && status.commit.length > 0,
    '/status.json carries a UTC timestamp and a commit',
    status.stamp,
  );
  for (const route of ['/', '/wiki', '/catalog']) {
    const $ = await page(out, route);
    const footer = $('[data-build-stamp]').attr('data-build-stamp');
    check(footer === status.stamp, `${route} footer matches /status.json`, footer ?? '(absent)');
  }
}

async function main() {
  const out = resolve(process.argv[2] ?? 'out');
  process.stdout.write(`verify-surfaces: ${out}\n`);
  await checkSortNotes(out);
  await checkColophon(out);
  await checkFeeds(out);
  await checkOrigins(out);
  await checkContract(out);
  await checkCrawlerFiles(out);
  await checkStructuredData(out);
  await checkStamp(out);

  process.stdout.write(
    failures === 0 ? '\nverify-surfaces: all checks passed\n' : `\nverify-surfaces: ${failures} FAILED\n`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

await main();
