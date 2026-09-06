/**
 * claims.test.mjs — the claim record as a seventh content type
 * (`separate-a-claim-from-a-fact`, tasks 1-11).
 *
 * Every assertion is about what the build DOES when handed a real fixture
 * corpus, observed by running the real pipeline. The fixture at
 * `lib/fixtures/claims/` carries one org entry with a wikipedia-cited
 * `founded` fact — the exact shape that shipped as a "vendor claim" twice —
 * and five claim records covering all three verification states, a vendor
 * repeating itself, and a third party's measurement.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { buildFixture, buildFixtureExpectingFailure, fixtureRoot } from './test-helpers.mjs';
import { CONTENT_TYPES, ROUTED_CONTENT_TYPES, ROOT } from './paths.mjs';
import { loadCorpus, urlFor, claimFragment } from './corpus.mjs';
import { buildSearchIndex } from './search-index.mjs';
import { buildRouteTable } from './routes.mjs';
import { reviewablePieces } from './reviews.mjs';
import { MECHANICAL_FRONT_MATTER_KEYS } from './review-hash.mjs';
import { renderClaims, renderVerification } from './render/entry.mjs';
import { renderLlmsTxt } from './crawlers.mjs';
import {
  NON_PROSE_FIELDS,
  PROSE_FIELDS,
  classificationProblems,
  validateFrontMatter,
} from './schema.mjs';
import { isSubjectOwned } from './vendor-domain.mjs';

const claimsFixture = () => loadCorpus({ contentRoot: fixtureRoot('claims') });

/* ------------------------------------------------------------------ *
 * task 1 — the seventh content type, and content/claims/README.md
 * ------------------------------------------------------------------ */

test('1 claim is a content type living in content/claims, and its README is not content', async () => {
  assert.deepEqual(CONTENT_TYPES.claim, {
    dir: 'claims',
    glob: 'claims/**/*.md',
    routed: false,
  });
  // The real content directory carries a README and no records: which of the
  // corpus's cited facts are claims is editorial work through the review gate,
  // and the claim surface renders empty until records exist.
  const readme = readFileSync(join(ROOT, 'content', 'claims', 'README.md'), 'utf8');
  assert.match(readme, /vendor claim/i);
  const real = await loadCorpus({ checkReferences: false });
  assert.equal(real.claim.length, 0, 'the README is skipped exactly as content/wiki/README.md is');
});

test('1 the fixture corpus loads five claim records through the real loader', async () => {
  const corpus = await claimsFixture();
  assert.equal(corpus.diags.errors.length, 0, corpus.diags.errors.map((e) => e.message).join('\n'));
  assert.equal(corpus.claim.length, 5);
});

/* ------------------------------------------------------------------ *
 * tasks 2-4 — the schema
 * ------------------------------------------------------------------ */

test('2 verified: true fails the build, naming the file and what a confirmation carries', async () => {
  const err = await buildFixtureExpectingFailure('bad/claim-verified-true');
  assert.match(err.message, /claims[/\\]asserted\.md/, 'the message names the file');
  assert.match(err.message, /`by`/);
  assert.match(err.message, /`url`/);
  assert.match(err.message, /`date`/);
  assert.ok(
    !/expected false/.test(err.message),
    'a bare union rejection names the union and teaches nothing; this message must not be one',
  );
});

test('2 verified is tri-state: absent, false and a confirmation all validate', async () => {
  const corpus = await claimsFixture();
  const by = Object.fromEntries(corpus.claim.map((c) => [c.slug, c.data]));
  assert.equal('verified' in by.unlooked, false, 'absent stays absent — it is not defaulted to false');
  assert.equal(by['looked-and-failed'].verified, false);
  assert.deepEqual(by.confirmed.verified, {
    by: 'the reviewer of job j-demo',
    url: 'https://demovendor.example/evidence/speed-transcript',
    date: '2026-08-28',
  });
});

test('4 source_host must equal the host parsed from source_url, and the message names both', async () => {
  const err = await buildFixtureExpectingFailure('bad/claim-host-mismatch');
  assert.match(err.message, /claims[/\\]wrong-host\.md/);
  assert.match(err.message, /"demovendor\.example"/);
  assert.match(err.message, /"openrouter\.ai"/);
});

test('3 every string field of the claim schema is classified, and the gate is live for claims', () => {
  assert.deepEqual(classificationProblems(), [], 'the real schemas classify every string field');
  // The gate FIRES for this type — asserted by taking one path away rather than
  // by trusting that a passing gate was running. `quote` is the path chosen
  // because it is the one that must never drift into PROSE_FIELDS.
  const withoutQuote = Object.fromEntries(
    Object.entries(NON_PROSE_FIELDS.claim).filter(([k]) => k !== 'quote'),
  );
  const problems = classificationProblems({
    nonProse: { ...NON_PROSE_FIELDS, claim: withoutQuote },
  });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /^claim\.quote is a string-valued schema field classified in neither/);
});

test('3 quote is NOT author prose — it is the data layer, transcribed', () => {
  assert.deepEqual([...PROSE_FIELDS.claim], []);
  assert.match(NON_PROSE_FIELDS.claim.quote, /verbatim/);
  assert.match(
    NON_PROSE_FIELDS.claim.quote,
    /accessed/,
    'the reason must record the mechanical exemption too: lib/currency.mjs forgives a value with a sibling date, and this record carries one by construction',
  );
});

/* ------------------------------------------------------------------ *
 * tasks 12 and 15 — publishes_from
 * ------------------------------------------------------------------ */

test('12 publishes_from is accepted on an entry — entrySchema is .strict(), so it had to be added', async () => {
  const corpus = await claimsFixture();
  assert.deepEqual(corpus.byId.get('org/demo-vendor').data.publishes_from, ['demobrand.example']);
  const rejected = validateFrontMatter('entry', {
    id: 'org/x',
    kind: 'org',
    display_name: 'X',
    status: 'active',
    maintenance: 'stable',
    aliases: [{ name: 'X', class: 'exclusive' }],
    publishes_hosts: ['x.example'],
  });
  assert.equal(rejected.ok, false, 'a near-miss key is still rejected by .strict()');
});

test('15 a publishes_from value that is not its own registrable reduction fails, naming all three', async () => {
  const err = await buildFixtureExpectingFailure('bad/publishes-from-host');
  assert.match(err.message, /wiki[/\\]org[/\\]demo-vendor\.md/, 'the entry');
  assert.match(err.message, /"platform\.demobrand\.example"/, 'the value');
  assert.match(err.message, /"demobrand\.example"/, 'the reduction to declare instead');
});

test('16 the declared brand domain is what makes the fixture vendor claim the subject\'s own', async () => {
  const corpus = await claimsFixture();
  const org = corpus.byId.get('org/demo-vendor').data;
  const bySlug = Object.fromEntries(corpus.claim.map((c) => [c.slug, c.data]));
  // branch 1: declared
  assert.equal(isSubjectOwned(bySlug.unlooked.source_host, org), true);
  // branch 3: name token
  assert.equal(isSubjectOwned(bySlug['looked-and-failed'].source_host, org), true);
  // neither: a router's measurement of the vendor's product is the router's
  // statement, whatever the field is called (ledger row 10, RT FM-N3).
  assert.equal(bySlug['third-party'].field, 'observed_throughput_p50');
  assert.equal(isSubjectOwned(bySlug['third-party'].source_host, org), false);
  // and the entry's own founded fact cites an encyclopaedia, which is nobody's
  // vendor domain — the source test blanks it before any claim rule is reached.
  assert.equal(isSubjectOwned('en.wikipedia.org', org), false);
});

/* ------------------------------------------------------------------ *
 * task 5 — the URL decision, recorded in the code
 * ------------------------------------------------------------------ */

test('5 urlFor throws for a claim and says where the rule is; the pass resolves the fragment', async () => {
  assert.throws(
    () => urlFor('claim', { slug: 'x' }),
    /resolveClaimUrls/,
    'the seventh type must not silently mint a route, and the throw must say where the rule lives',
  );
  const corpus = await claimsFixture();
  const unlooked = corpus.claim.find((c) => c.slug === 'unlooked');
  assert.equal(claimFragment(unlooked), 'claim-unlooked');
  assert.equal(unlooked.url, '/wiki/org/demo-vendor#claim-unlooked');
});

test('5 a claim whose subject does not resolve gets NO url rather than an invented one', async () => {
  const corpus = await loadCorpus({ contentRoot: fixtureRoot('bad', 'claim-unresolved-subject') });
  assert.equal(corpus.claim.length, 1);
  assert.equal(corpus.claim[0].url, undefined);
});

/* ------------------------------------------------------------------ *
 * task 6 — the carve-outs, one test per surface
 * ------------------------------------------------------------------ */

test('6 SEARCH INDEX — a claim is not a document and gets no row', async () => {
  const corpus = await claimsFixture();
  const index = buildSearchIndex(corpus);
  assert.equal(index.count, corpus.documents.length);
  assert.equal(index.count, corpus.all.length - corpus.claim.length);
  assert.ok(index.count > 0, 'the assertion above must not pass by both sides being empty');
  assert.ok(
    !index.docs.some((d) => String(d.u).includes('#claim-')),
    'no row may carry a fragment URL',
  );
  // The subject entry IS indexed — a claim is findable through the page it
  // renders on, which is the whole reason it needs no row of its own.
  assert.ok(index.docs.some((d) => d.u === '/wiki/org/demo-vendor'));
});

test('6 ROUTE TABLE — a claim adds no literal path the site is expected to serve', async () => {
  const corpus = await claimsFixture();
  const routes = await buildRouteTable(corpus, { appDir: fixtureRoot('claims', 'no-app') });
  assert.ok(routes.has('/wiki/org/demo-vendor'));
  assert.ok(![...routes].some((r) => r.includes('#')), 'a fragment is not a route');
  for (const claim of corpus.claim) assert.ok(!routes.has(claim.url));
});

test('6 SITEMAP — app/sitemap.ts iterates six named sets and never corpus.all', () => {
  // GREPPED, then pinned. The sitemap is a Next.js module this test cannot
  // execute, and `app/sitemap.test.mjs` already establishes source pinning as
  // this file's checking mechanism. What is pinned is the PROPERTY that keeps
  // a route-less type out by construction: the file enumerates the sets it
  // wants rather than walking every doc.
  const src = readFileSync(join(ROOT, 'app', 'sitemap.ts'), 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  for (const set of [
    'site.browsable',
    'site.tools',
    'site.corpus.learn',
    'site.tutorials',
    'site.posts',
    'site.deltas',
  ]) {
    assert.ok(code.includes(set), `the sitemap must still iterate ${set}`);
  }
  assert.ok(
    !/corpus\.all|corpus\.claim|site\.corpus\.claim/.test(code),
    'the sitemap must never walk every doc: that is how a route-less type ships a fragment URL',
  );
});

test('6 LLMS.TXT — no claim route and no claim count reach the crawler brief', async () => {
  const corpus = await claimsFixture();
  // The counts llms.txt prints come from the dataset, whose rows are built from
  // `corpus.entry` — a claim contributes to none of them. Asserted on the
  // rendered text rather than on the call, because the text is what ships.
  const text = renderLlmsTxt({ entries: corpus.entry.length, facts: 1, timelines: 0 });
  assert.ok(!text.includes('/claims'), 'no claim route');
  assert.ok(!/#claim-/.test(text), 'no claim fragment');
  assert.ok(!/\bclaim records?\b/i.test(text), 'no claim count line');
  assert.ok(text.includes('/wiki'), 'the subject entries it renders on are still listed');
});

test('6 corpus.all still holds claims — validation and the review join apply to them', async () => {
  const corpus = await claimsFixture();
  assert.equal(corpus.all.length, corpus.documents.length + corpus.claim.length);
  assert.ok(corpus.all.some((d) => d.type === 'claim'));
  assert.ok(!corpus.documents.some((d) => d.type === 'claim'));
  assert.ok(!ROUTED_CONTENT_TYPES.includes('claim'));
});

/* ------------------------------------------------------------------ *
 * tasks 7-8 — the joins
 * ------------------------------------------------------------------ */

test('7 a subject naming no entry fails the build, naming the file and the id', async () => {
  const err = await buildFixtureExpectingFailure('bad/claim-unresolved-subject');
  assert.match(err.message, /claims[/\\]orphan\.md/);
  assert.match(err.message, /subject/);
  assert.match(err.message, /org\/nobody-here/);
});

test('8 two records sharing subject, field, source_url AND accessed fail, naming both files', async () => {
  const err = await buildFixtureExpectingFailure('bad/claim-duplicate');
  assert.match(err.message, /claims[/\\]second\.md/);
  assert.match(err.message, /claims[/\\]first\.md/);
});

test('8 two records sharing only subject and field are LEGAL — a vendor repeating itself is real', async () => {
  const corpus = await claimsFixture();
  const repeated = corpus.claim.filter(
    (c) => c.data.subject === 'org/demo-vendor' && c.data.field === 'agentic_task_completion',
  );
  assert.equal(repeated.length, 2, 'the fixture must actually contain the legal case');
  assert.equal(corpus.diags.errors.length, 0);
});

/* ------------------------------------------------------------------ *
 * tasks 9-10 — review
 * ------------------------------------------------------------------ */

test('9 claims are appended to reviewablePieces, at the end, without moving anything else', async () => {
  const corpus = await claimsFixture();
  const pieces = reviewablePieces(corpus);
  const tail = pieces.slice(-corpus.claim.length);
  assert.deepEqual(
    tail.map((d) => d.type),
    corpus.claim.map(() => 'claim'),
    'appended at the end: the order is part of the join, so an insertion anywhere else would move which piece claims an ambiguously-named record',
  );
});

test('10 neither `verified` nor `claims` is a MECHANICAL_FRONT_MATTER_KEY', () => {
  assert.deepEqual(
    [...MECHANICAL_FRONT_MATTER_KEYS],
    ['timeline'],
    'the exemption list is matched by key NAME across every content kind (lib/review-hash.mjs:99-102), ' +
      'so exempting `verified` would exempt any key of that name on any kind — and a verification ' +
      'is a judgment, which publishes through review. `claims` is absent for the same reason and ' +
      'because there is no `claims` key: the record sits BESIDE the entry, not on it.',
  );
  assert.ok(!MECHANICAL_FRONT_MATTER_KEYS.includes('verified'));
  assert.ok(!MECHANICAL_FRONT_MATTER_KEYS.includes('claims'));
});

/* ------------------------------------------------------------------ *
 * task 11 — rendering
 * ------------------------------------------------------------------ */

const subjectOf = async () => {
  const corpus = await claimsFixture();
  return { corpus, doc: corpus.byId.get('org/demo-vendor') };
};

test('11 a subject with cited facts and NO claim records renders no claim block at all', async () => {
  const { doc } = await subjectOf();
  // The same renderer, the same subject, an empty claim collection: it looks
  // the records up and finds none. The next test populates the collection and
  // the same call renders — which is what separates an empty state from a
  // picture of one (implementer ledger row 6).
  const html = renderClaims(doc, { corpus: { claim: [] } });
  assert.equal(html, '');
  // And the entry's own wikipedia-cited `founded` fact renders NOWHERE here.
  assert.ok(doc.data.facts.some((f) => f.field === 'founded'));
  assert.ok(!html.includes('2019'));
});

test('11 the populated fixture makes the SAME renderer produce the claims', async () => {
  const { corpus, doc } = await subjectOf();
  const html = renderClaims(doc, { corpus });
  assert.ok(html.includes('claim-unlooked'), 'the stable fragment is the item id');
  assert.ok(html.includes('multi-step engineering tasks'));
});

test('11 the attributing party renders BEFORE the fragment it attributes (F-sys-5-1)', async () => {
  const { corpus, doc } = await subjectOf();
  const html = renderClaims(doc, { corpus });
  const party = html.indexOf('Demo Vendor');
  const quote = html.indexOf('multi-step engineering tasks');
  assert.ok(party >= 0 && quote >= 0);
  assert.ok(party < quote, 'truncation happens at the end of a line box, so the name goes first');
});

test('11 the label rides on the claim, not on the heading (F-sys-3-1)', async () => {
  const { corpus, doc } = await subjectOf();
  const html = renderClaims(doc, { corpus });
  const items = html.split('<li').slice(1);
  assert.equal(items.length, 5);
  for (const item of items) {
    assert.match(item, /class="badge[^"]*"[^>]*>claim</, 'every item carries the label itself');
  }
});

test('11 three verification states render as three different things', async () => {
  assert.equal(renderVerification(undefined), '', 'absent renders NOTHING — not "unverified"');
  const no = renderVerification(false);
  assert.match(no, /not verified/);
  const yes = renderVerification({ by: 'a reviewer', url: 'https://e.example/x', date: '2026-08-28' });
  assert.match(yes, /verified by a reviewer/);
  assert.match(yes, /https:\/\/e\.example\/x/);
  assert.notEqual(no, yes);
  assert.notEqual(no, '');
});

test('11 absent and false are not collapsed in either direction, in the rendered page', async () => {
  const { corpus, doc } = await subjectOf();
  const html = renderClaims(doc, { corpus });
  const item = (slug) => html.split('<li').find((s) => s.includes(`claim-${slug}`)) ?? '';
  assert.ok(!/verified/i.test(item('unlooked')), 'the unlooked-at claim says nothing about verification');
  assert.match(item('looked-and-failed'), /not verified/);
  assert.match(item('confirmed'), /verified by/);
});

test('11 a claim renders its source and its accessed date, reachable from the page', async () => {
  const { corpus, doc } = await subjectOf();
  const html = renderClaims(doc, { corpus });
  assert.ok(html.includes('https://platform.demobrand.example/blog/launch'));
  assert.ok(html.includes('2026-08-27'));
});

test('11 claims order newest first by accessed, within each list', async () => {
  const { corpus, doc } = await subjectOf();
  const html = renderClaims(doc, { corpus });
  // Two lists, because attribution is two different answers (see below); the
  // ordering rule is the same inside each and is asserted on each, not on the
  // concatenation — where it would pass by the accident of the third party's
  // record also being the oldest.
  assert.deepEqual(slugsIn(listOf(html, 'claims')), [
    'said-again',
    'unlooked',
    'looked-and-failed',
    'confirmed',
  ]);
  assert.deepEqual(slugsIn(listOf(html, 'claims-elsewhere')), ['third-party']);
});

/* ------------------------------------------------------------------ *
 * task 11 × task 16 — the surface RUNS the vendor test
 *
 * The seam these two tasks meet at. Task 16 built the attribution function;
 * this is the one surface in the change that renders a claim, and a surface
 * that attributes every record filed against an entry to that entry's
 * display_name is a SUBJECT test standing in for a SOURCE test — the same
 * substitution as the field-name allow-list that admitted OpenRouter's rolling
 * median as a vendor claim (implementer ledger row 10, red-team FM-N3).
 * ------------------------------------------------------------------ */

/** The one `<section>` whose heading carries `id`, or '' — lists are siblings. */
const listOf = (html, id) => {
  const parts = html.split('<section').map((s) => `<section${s}`);
  return parts.find((s) => s.includes(`id="${id}"`)) ?? '';
};
const slugsIn = (chunk) => [...chunk.matchAll(/id="claim-([a-z-]+)"/g)].map((m) => m[1]);
const itemOf = (html, slug) =>
  html.split('<li').find((s) => s.includes(`claim-${slug}`)) ?? '';

test('11×16 a third party\'s measurement is NOT attributed to the subject', async () => {
  const { corpus, doc } = await subjectOf();
  const html = renderClaims(doc, { corpus });
  const item = itemOf(html, 'third-party');
  assert.ok(item, 'the third party\'s record still renders — it validates and it is still a claim');
  const src = /<span class="claim-src">([^<]*)<\/span>/.exec(item);
  assert.equal(src?.[1], 'openrouter.ai', 'attributed to the REGISTRABLE DOMAIN of its own source');
  assert.notEqual(
    src?.[1],
    'Demo Vendor',
    'openrouter.ai is not the subject\'s domain — specs/wiki: "it renders attributed to whoever ' +
      'does own the domain, never to the subject"',
  );
  // The subject's name DOES appear inside the quotation, because the router
  // wrote it there; what must not happen is the site putting it in the
  // attribution slot. So the assertion is on the slot, never on the item's
  // whole text — a whole-text check would forbid a verbatim quote from naming
  // the company it is about, which every real one does.
  assert.ok(item.includes('Demo Vendor&#39;s model reaches'), 'the quote is still verbatim');
});

test('11×16 a failing claim renders under a heading that does not say the subject said it', async () => {
  const { corpus, doc } = await subjectOf();
  const html = renderClaims(doc, { corpus });
  const elsewhere = listOf(html, 'claims-elsewhere');
  assert.ok(elsewhere.includes('claim-third-party'));
  assert.ok(
    !/says about itself/.test(elsewhere),
    'a heading asserting the subject said it is the label doing the lying instead of the cell',
  );
  // and the vendor-sourced records are NOT in it
  for (const slug of ['unlooked', 'said-again', 'confirmed', 'looked-and-failed']) {
    assert.ok(!elsewhere.includes(`claim-${slug}`), `${slug} is vendor-sourced`);
  }
});

test('11×16 a vendor-sourced claim IS attributed to the subject, by all three admission paths', async () => {
  const { corpus, doc } = await subjectOf();
  const html = renderClaims(doc, { corpus });
  // `unlooked` is admitted by `publishes_from` (platform.demobrand.example ->
  // demobrand.example); `looked-and-failed` by a name token (demovendor).
  for (const slug of ['unlooked', 'looked-and-failed']) {
    const src = /<span class="claim-src">([^<]*)<\/span>/.exec(itemOf(html, slug));
    assert.equal(src?.[1], 'Demo Vendor', `${slug} is the vendor's own words`);
  }
});

test('11×16 removing publishes_from moves the record out of the vendor list, not just off it', async () => {
  // The control that separates "runs the test" from "hard-codes the split":
  // the SAME renderer, the same records, one declaration withdrawn.
  const { corpus, doc } = await subjectOf();
  const stripped = { ...doc, data: { ...doc.data, publishes_from: [] } };
  const html = renderClaims(stripped, { corpus });
  const src = /<span class="claim-src">([^<]*)<\/span>/.exec(itemOf(html, 'unlooked'));
  assert.equal(
    src?.[1],
    'demobrand.example',
    'undeclared, the brand domain is a stranger\'s — FM-N6, and the reason publishes_from is ' +
      'not optional paperwork',
  );
  // `looked-and-failed` cites demovendor.example, a name token, so it stays.
  const kept = /<span class="claim-src">([^<]*)<\/span>/.exec(itemOf(html, 'looked-and-failed'));
  assert.equal(kept?.[1], 'Demo Vendor');
});
