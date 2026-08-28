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
import { SITE_HOSTS } from '../lib/site-config.mjs';
import {
  FEED_ROUTES,
  DATASET_JSON_ROUTE,
  DATASET_CSV_ROUTES,
  DATASET_LICENSE,
  TABLE_JSON_ROUTES,
  SEARCH_INDEX_ROUTE,
} from '../lib/asset-routes.mjs';

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
  await checkStamp(out);

  process.stdout.write(
    failures === 0 ? '\nverify-surfaces: all checks passed\n' : `\nverify-surfaces: ${failures} FAILED\n`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

await main();
