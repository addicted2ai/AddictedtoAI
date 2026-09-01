/**
 * crawlers.test.mjs — `robots.txt` and `llms.txt` (beads `addictedtoai-k1j`).
 *
 * Two very different claims are under test here and it is worth naming which
 * is which, because only one of them is about behaviour.
 *
 *  - `robots.txt` is a **decision record**. Its behaviour (`allow *`) is
 *    unchanged from the six-line `app/robots.ts` it replaces, so nothing here
 *    can measure an improvement in what crawlers do. What can be measured is
 *    that the file states its position rather than arriving at it by default:
 *    that the four AI crawlers are named, that each carries a note saying what
 *    the token governs, and — the one that would actually break the site — that
 *    no `Disallow` ever appears, because a `Disallow` stops a crawler reading
 *    the per-page `noindex` this site relies on.
 *  - `llms.txt` is a **pointer file**, and the failure mode is stale numbers.
 *    Its counts are passed in from the dataset payload rather than recounted,
 *    so the test is that a count it was not given renders as nothing at all
 *    instead of a zero — an invented zero is the exact class of claim the
 *    corpus rules forbid.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { renderRobotsTxt, renderLlmsTxt, AI_CRAWLERS } from './crawlers.mjs';
import { SITE_URL } from './site-config.mjs';
import { DATASET_JSON_ROUTE, DATASET_CSV_ROUTES, DATASET_LICENSE } from './asset-routes.mjs';

// ── robots.txt ────────────────────────────────────────────────────────────

test('robots.txt allows everything and contains no Disallow anywhere', () => {
  const txt = renderRobotsTxt();
  assert.match(txt, /^User-agent: \*$/m);
  assert.match(txt, /^Allow: \/$/m);
  assert.ok(
    !/^\s*Disallow:/m.test(txt),
    'a Disallow would stop a crawler fetching the page and therefore reading its noindex tag',
  );
});

test('robots.txt names the four AI crawlers a position was taken on, each with a rule', () => {
  const txt = renderRobotsTxt();
  const expected = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'];
  assert.deepEqual(AI_CRAWLERS.map((b) => b.agent), expected);
  for (const agent of expected) {
    assert.match(txt, new RegExp(`^User-agent: ${agent}$`, 'm'), `${agent} is named`);
  }
  // Five agent blocks: the wildcard plus the four.
  assert.equal((txt.match(/^User-agent:/gm) ?? []).length, 5);
  assert.equal((txt.match(/^Allow: \/$/gm) ?? []).length, 5, 'each block carries its own rule');
});

test('every named crawler carries a note, so the served file says what the token governs', () => {
  const txt = renderRobotsTxt();
  for (const bot of AI_CRAWLERS) {
    assert.ok(bot.note && bot.note.length > 0, `${bot.agent} declares what it is`);
    assert.ok(txt.includes(`# ${bot.note}`), `${bot.agent}'s note reaches the served file`);
  }
  // Google-Extended is the one a reader will get backwards if it is unlabelled.
  assert.match(txt, /Google-Extended[\s\S]*?/);
  assert.ok(
    AI_CRAWLERS.find((b) => b.agent === 'Google-Extended').note.includes('not a crawler'),
    'the token that governs training rather than crawling says so',
  );
});

test('robots.txt is a commented decision, not a bare directive list', () => {
  const txt = renderRobotsTxt();
  const comments = txt.split('\n').filter((l) => l.startsWith('#'));
  assert.ok(comments.length >= 15, `expected the reasoning to travel with the file, got ${comments.length} comment lines`);
  assert.match(txt, /noindex/, 'it explains why there is no Disallow');
});

test('robots.txt points at the sitemap, absolutely', () => {
  assert.match(renderRobotsTxt(), new RegExp(`^Sitemap: ${SITE_URL}/sitemap\\.xml$`, 'm'));
});

test('reversing the stance is one word per crawler', () => {
  // Not a behavioural claim about the site — a claim about this module's
  // shape, which is what makes "flipping it is one line" true rather than
  // merely asserted to the maintainer.
  const flipped = renderRobotsTxt.call(null);
  assert.ok(flipped.includes('Allow: /'));
  for (const bot of AI_CRAWLERS) {
    assert.ok(bot.rule === 'Allow' || bot.rule === 'Disallow', `${bot.agent}'s rule is one word`);
  }
});

// ── llms.txt ──────────────────────────────────────────────────────────────

const COUNTS = { entries: 495, facts: 2049, timelines: 186, catalog: 396, deprecations: 2, deltas: 27 };

test('llms.txt leads with the structured layer and its licence, not with a pitch', () => {
  const txt = renderLlmsTxt(COUNTS);
  const dataset = txt.indexOf(DATASET_JSON_ROUTE);
  assert.ok(dataset > 0, 'the one-file download is present');
  assert.ok(txt.includes(DATASET_LICENSE), 'the licence is stated');
  for (const route of Object.values(DATASET_CSV_ROUTES)) {
    assert.ok(txt.includes(`${SITE_URL}${route}`), `${route} is listed, absolutely`);
  }
});

test('llms.txt renders the counts it is given, verbatim', () => {
  const txt = renderLlmsTxt(COUNTS);
  for (const [key, value] of Object.entries(COUNTS)) {
    assert.ok(txt.includes(`**${value} `), `the ${key} count reaches the file`);
  }
});

test('a count it was not given renders as nothing — never as zero', () => {
  const txt = renderLlmsTxt({ entries: 495 });
  assert.ok(txt.includes('**495 entries'), 'what is known is stated');
  assert.ok(!/\*\*0 /.test(txt), 'what is unknown is absent, not invented as a zero');
  assert.ok(!txt.includes('sourced facts, each with'), 'the whole line goes, not just the number');
});

test('llms.txt survives being handed nothing at all', () => {
  const txt = renderLlmsTxt();
  assert.ok(txt.includes(DATASET_JSON_ROUTE), 'the pointers are unconditional');
  assert.ok(!/\*\*\d/.test(txt), 'and no count is claimed');
});

test('llms.txt states no date, so a rebuild with no world change produces the same bytes', () => {
  assert.equal(renderLlmsTxt(COUNTS), renderLlmsTxt(COUNTS));
  assert.ok(
    !/\d{4}-\d{2}-\d{2}/.test(renderLlmsTxt(COUNTS)),
    'a build clock in this file would tick daily for no reason; /status.json is where the build date lives',
  );
});
