/**
 * surfaces.test.mjs — the page templates, checked against fixture corpora
 * (tasks 4.1, 4.3, 4.4, 4.5, 4.6, 4.7).
 *
 * Every fixture goes through the **real** pipeline: `buildFixture` calls
 * `buildSite` on a fixture content root, so what these assertions see is what
 * the content gates saw and what the React pages will place. A test that
 * hand-built a doc object would prove nothing about the build.
 *
 * The clock is pinned at 2026-08-28 (`test-helpers.mjs`), which is what makes
 * "stale" and "demoted" mean the same thing in November as they do today.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFixture, buildFixtureExpectingFailure, TODAY } from './test-helpers.mjs';
import { renderEntryPage, renderEntryRow } from './render/entry.mjs';
import { renderToolsIndex, renderToolPage } from './render/tools.mjs';
import { renderLadder, renderLearnPage } from './render/learn.mjs';
import { renderTutorialPage, renderTutorialsIndex } from './render/tutorial.mjs';
import { renderPostPage, renderBlogIndex } from './render/blog.mjs';
import { renderChangedFeed, renderLifecycleStrip, renderDoors } from './render/home.mjs';
import { renderDeltasIndex, renderDelta } from './render/delta.mjs';
import { tutorialStates } from './tutorials.mjs';
import { listingStates } from './listings.mjs';
import { ladder, checkPrerequisiteCycles } from './learn.mjs';
import { ceilingBreaches, warnPostCeiling, postsNewestFirst } from './posts.mjs';
import { deltasNewestFirst, spanBetween } from './deltas.mjs';
import { changedFeed } from './changes.mjs';
import { browsableEntries } from './indexability.mjs';
import { Diagnostics } from './errors.mjs';

/** One build of the surfaces fixture corpus, shared by everything below. */
let SITE;
async function site() {
  if (!SITE) SITE = await buildFixture('surfaces');
  return SITE;
}

const byId = (s, id) => s.corpus.byId.get(id);

/** The freshness states the Pulse would have computed for the tool fixtures. */
const FRESHNESS = {
  listings: [
    { slug: 'healthy-listing', state: 'ok', consecutive_failures: 0, since: '2026-08-27' },
    {
      slug: 'unverifiable-listing',
      state: 'could-not-verify',
      consecutive_failures: 2,
      since: '2026-07-14',
    },
    { slug: 'discontinued-listing', state: 'discontinued', discontinued: '2026-05-30' },
  ],
};

// ── 4.1 wiki entry pages ─────────────────────────────────────────────────

test('4.1 a full entry renders identity, facts with sources, timeline, body and both rails', async () => {
  const s = await site();
  const html = renderEntryPage(byId(s, 'model/full-entry'), s);

  assert.match(html, /<h1 class="entry-name">Full Entry<\/h1>/, 'display name');
  assert.match(html, /model · model\/full-entry/, 'kind and id');
  assert.match(html, /<span class="badge">active<\/span>/, 'status badge');
  assert.match(html, /class="alias"[^>]*>FE-1</, 'alias listed');
  assert.match(html, /<span class="badge" data-tone="theme">history<\/span>/, 'theme badge');

  // Facts, each with its source reachable — the rule facts.mjs exists to keep.
  assert.match(html, /<dt data-field="price_input">price input<\/dt>/);
  assert.match(html, /<dd data-state="feed">/, 'feed fact resolved from the data layer');
  assert.match(html, /0\.000003/, 'the feed value itself');
  assert.match(html, /<dd data-state="cited">/, 'cited fact');
  assert.match(html, /example\.org\/full-entry\/license/, 'cited source link');
  const facts = [...html.matchAll(/<dd data-state=/g)];
  const sources = [...html.matchAll(/class="fact-source"/g)];
  assert.equal(facts.length, 3);
  assert.ok(sources.length >= facts.length, 'every fact carries a source element');

  // Timeline, newest first, each event sourced.
  assert.match(html, /class="section entry-timeline"/);
  const dates = [...html.matchAll(/<time datetime="([^"]+)" class="rail-date"/g)].map((m) => m[1]);
  assert.deepEqual(dates, ['2026-06-01', '2026-01-10'], 'timeline is newest first');
  assert.match(html, /entry-timeline[\s\S]*full-entry\/context/);

  assert.match(html, /<div class="prose">/, 'prose body');
  assert.match(html, /Referenced here/, '"Referenced here" rail from mentions');
  assert.ok(!html.includes('data-notice="dormant"'), 'a living entry carries no dormant stamp');
});

test('4.1 a stub renders its data, is a stub, and is absent from the browse listing', async () => {
  const s = await site();
  const stub = byId(s, 'concept/stub-entry');
  assert.equal(stub.index.stub, true);
  assert.equal(stub.index.indexed, false, 'one fact, no timeline, no body: not indexed');

  const html = renderEntryPage(stub, s);
  assert.match(html, /<h1 class="entry-name">Stub Entry<\/h1>/);
  assert.match(html, /<dd data-state="cited">/, 'its one fact still renders with its source');
  assert.match(html, /Appears in/, 'backlinks reach a stub');
  assert.ok(!html.includes('<div class="prose">'), 'no body, so no prose region');

  const listing = browsableEntries(s.corpus.entry).map(renderEntryRow).join('');
  assert.ok(!listing.includes('concept/stub-entry'), 'stubs appear in no browse listing');
});

test('4.1 a dormant entry carries the build-injected record-as-of stamp', async () => {
  const s = await site();
  const html = renderEntryPage(byId(s, 'model/dormant-entry'), s);
  assert.match(html, /data-notice="dormant"/);
  // The date is derived from the entry's own latest recorded date — its
  // retirement event — not authored anywhere.
  assert.match(html, /A record as of 2026-04-18\. No longer actively maintained\./);
});

test('4.1 a retired entry is indexed by the obituary rule even with no body', async () => {
  const s = await site();
  const doc = byId(s, 'model/dormant-entry');
  assert.equal(doc.hasBody, false);
  assert.equal(doc.index.indexed, true);
  assert.ok(doc.index.reasons.includes('lifecycle-status'));
});

// ── 4.3 curated tool listings ────────────────────────────────────────────

test('4.3 healthy, unverifiable and discontinued listings render their specified markers', async () => {
  const s = await site();
  const states = listingStates(s.corpus, { freshness: FRESHNESS, today: TODAY });
  const by = Object.fromEntries(states.map((x) => [x.doc.slug, x]));

  assert.equal(by['healthy-listing'].state.state, 'ok');
  assert.equal(by['healthy-listing'].state.marker, null, 'a healthy listing is not marked');
  assert.equal(by['healthy-listing'].state.alive, true);

  assert.equal(by['unverifiable-listing'].state.state, 'could-not-verify');
  assert.equal(by['unverifiable-listing'].state.alive, false);
  assert.match(by['unverifiable-listing'].state.marker, /Could not verify since 2026-07-14/);

  assert.equal(by['discontinued-listing'].state.state, 'discontinued');
  assert.equal(by['discontinued-listing'].state.alive, false);
  assert.match(by['discontinued-listing'].state.marker, /Discontinued 2026-05-30/);

  const html = renderToolsIndex(states, s.corpus.byId);
  assert.match(html, /data-sort-note="name, A to Z"/, 'the page states its sort criterion');
  assert.match(html, /data-marker="could-not-verify" data-tone="dead"/);
  assert.match(html, /data-marker="discontinued" data-tone="dead"/);
  assert.equal((html.match(/data-alive="no"/g) ?? []).length, 2, 'both dead listings kept, marked');
  assert.match(html, /Healthy Listing/, 'and the healthy one is still there');

  const page = renderToolPage(by['discontinued-listing'], s);
  assert.match(page, /Discontinued 2026-05-30/);
  assert.match(page, /dead\.example\.org/, 'the canonical URL');
  assert.match(page, /was free/, 'the pricing model');
  assert.match(page, /Dead Subject/, 'the wiki entry link');
});

// ── 4.4 the learn ladder ─────────────────────────────────────────────────

test('4.4 the ladder is generated in level order, prerequisites before dependants', async () => {
  const s = await site();
  const rungs = ladder(s.corpus.learn);
  assert.deepEqual(
    rungs.map((r) => r.level),
    ['orientation', 'mechanics'],
    'levels in the ladder\'s own order, empty rungs dropped',
  );
  assert.deepEqual(
    rungs[1].pages.map((p) => p.slug),
    ['mechanics-shallow', 'mechanics-deep'],
    'the prerequisite sorts first, though its title sorts last alphabetically',
  );

  const html = renderLadder(rungs);
  assert.ok(
    html.indexOf('Zzz shapes and vocabulary') < html.indexOf('Attention, in detail'),
    'the rendered index preserves the dependency order',
  );
  assert.match(html, /be able to say what a language model is doing/, 'outcomes are on the index');
});

test('4.4 a learn page renders its level, its outcome and its prerequisite links', async () => {
  const s = await site();
  const doc = s.corpus.learn.find((d) => d.slug === 'mechanics-deep');
  const html = renderLearnPage(doc, s);
  assert.match(html, /learn · mechanics/, 'level');
  assert.match(html, /data-outcome=""/, 'outcome, in its own hook');
  assert.match(html, /After this page you will .*follow the arithmetic of one attention head/);
  assert.match(html, /data-prerequisites=""/);
  assert.match(html, /<a href="\/learn\/mechanics-shallow">Zzz shapes and vocabulary<\/a>/);
});

test('4.4 a prerequisite cycle fails the build naming the ring', async () => {
  const diags = new Diagnostics();
  const learn = [
    { slug: 'a', file: 'learn/a.md', data: { prerequisites: ['b'], title: 'A', level: 'orientation' } },
    { slug: 'b', file: 'learn/b.md', data: { prerequisites: ['a'], title: 'B', level: 'orientation' } },
  ];
  checkPrerequisiteCycles(learn, diags);
  assert.equal(diags.ok, false);
  assert.match(diags.errors[0].message, /prerequisite cycle: a -> b -> a/);
});

// ── 4.5 tutorials ────────────────────────────────────────────────────────

test('4.5 the five tutorial states each get exactly their specified treatment', async () => {
  const s = await site();
  const states = tutorialStates(s.corpus, { dataLayer: s.dataLayer, today: TODAY });
  const by = Object.fromEntries(states.map((x) => [x.doc.slug, x]));

  assert.deepEqual(
    Object.fromEntries(Object.entries(by).map(([k, v]) => [k, v.state.state])),
    {
      'fresh-tutorial': 'fresh',
      'stale-tutorial': 'stale',
      'moved-on-tutorial': 'moved-on',
      'demoted-tutorial': 'demoted',
      'archived-tutorial': 'archived',
    },
  );

  // fresh: the stamp, no banner.
  const fresh = renderTutorialPage(by['fresh-tutorial'].doc, by['fresh-tutorial'].state);
  assert.match(fresh, /data-verification-stamp="fresh"/);
  assert.match(fresh, /Verified against .*Fresh Subject.*0\.32.*on.*2026-08-21/s);
  assert.ok(!fresh.includes('class="notice"'), 'a fresh tutorial carries no banner');

  // stale: the stamp, and a banner naming the date and the interval.
  const stale = renderTutorialPage(by['stale-tutorial'].doc, by['stale-tutorial'].state);
  assert.match(stale, /data-notice="stale"/);
  assert.match(stale, /Not re-verified since 2026-05-01 \(119 days, interval 60\)/);
  assert.equal(by['stale-tutorial'].state.indexed, true, 'stale is still indexed');

  // moved-on: names both versions and links the subject's entry.
  const moved = renderTutorialPage(by['moved-on-tutorial'].doc, by['moved-on-tutorial'].state);
  assert.match(moved, /data-notice="moved-on"/);
  assert.match(moved, /Moved Subject was verified at 0\.32 and is now at 0\.45/);
  assert.match(moved, /<a href="\/wiki\/tool\/moved-subject">Moved Subject — current state<\/a>/);

  // demoted: noindex, delisted, full-width notice, URL still resolves.
  const demotedState = by['demoted-tutorial'].state;
  assert.equal(demotedState.indexed, false);
  assert.equal(demotedState.listed, false);
  const demoted = renderTutorialPage(by['demoted-tutorial'].doc, demotedState);
  assert.match(demoted, /data-notice="demoted"[^>]*role="alert"|role="alert"[^>]*data-notice="demoted"/);
  assert.match(demoted, /more than twice this tutorial&#39;s 60-day interval/);
  assert.match(demoted, /This URL keeps resolving/);

  // archived: the subject is dead, so archived beats demoted.
  const archivedState = by['archived-tutorial'].state;
  assert.equal(archivedState.listed, false);
  const archived = renderTutorialPage(by['archived-tutorial'].doc, archivedState);
  assert.match(archived, /data-notice="archived"/);
  assert.match(archived, /Dead Subject \(dead\)/);

  // Every state renders the stamp — there is no branch without it.
  for (const { doc, state } of states) {
    assert.match(
      renderTutorialPage(doc, state),
      /class="verification-stamp"/,
      `${doc.slug} renders its verification stamp`,
    );
  }
});

test('4.5 the tutorials index lists only standing tutorials and says how many are delisted', async () => {
  const s = await site();
  const states = tutorialStates(s.corpus, { dataLayer: s.dataLayer, today: TODAY });
  const html = renderTutorialsIndex(states);
  assert.match(html, /A tutorial verified last week/);
  assert.match(html, /A tutorial past its interval/);
  assert.ok(!html.includes('A tutorial nobody re-ran'), 'the demoted one is delisted');
  assert.ok(!html.includes('shut down'), 'the archived one is delisted');
  assert.match(html, /data-delisted="2"/);
  assert.match(html, /no published URL on this site ever 404s/);
});

// ── 4.6 blog ─────────────────────────────────────────────────────────────

test('4.6 a corrected post renders the original body and the dated corrections after it', async () => {
  const s = await site();
  const doc = s.corpus.post.find((d) => d.slug === 'corrected-post');
  const html = renderPostPage(doc);

  assert.match(html, /data-post-date="2026-07-02"/, 'the publication date is visible');
  assert.match(html, /data-corrections="2"/);
  assert.match(html, /data-notice="has-corrections"/, 'and flagged before the body');
  assert.match(html, /The body is unchanged\./);

  const bodyAt = html.indexOf('<div class="prose">');
  const correctionsAt = html.indexOf('class="section corrections"');
  assert.ok(bodyAt > 0 && correctionsAt > bodyAt, 'corrections are appended after the body');

  const dates = [...html.matchAll(/<time datetime="([^"]+)" class="rail-date"/g)].map((m) => m[1]);
  assert.deepEqual(dates, ['2026-07-09', '2026-08-02'], 'corrections are in date order');
  assert.match(html, /the preview figure, not the shipped one/);

  const plain = renderPostPage(s.corpus.post.find((d) => d.slug === 'plain-post'));
  assert.ok(!plain.includes('data-corrections'), 'a post with no corrections renders no block');
});

test('4.6 four posts inside one seven-day window produce the warning naming the dates', async () => {
  const s = await buildFixture('blog-ceiling');
  const breaches = ceilingBreaches(s.corpus.post);
  assert.equal(breaches.length, 1, 'one window is over the ceiling');
  assert.equal(breaches[0].count, 4);
  assert.deepEqual(breaches[0].dates, ['2026-08-10', '2026-08-12', '2026-08-14', '2026-08-16']);

  const diags = new Diagnostics();
  warnPostCeiling(s.corpus.post, diags);
  assert.equal(diags.errors.length, 0, 'a warning, never a failure');
  assert.equal(diags.warnings.length, 1);
  assert.match(diags.warnings[0].message, /4 published posts carry dates within 7 days/);
  assert.match(diags.warnings[0].message, /2026-08-10, 2026-08-12, 2026-08-14, 2026-08-16/);
  assert.ok(
    !diags.warnings[0].message.includes('2026-08-25'),
    'the post outside the window is not named',
  );
});

test('4.6 three posts in seven days is at the ceiling, not over it', async () => {
  const s = await buildFixture('blog-ceiling');
  const three = s.corpus.post.filter((p) => p.slug !== 'burst-four');
  assert.deepEqual(ceilingBreaches(three), []);
});

test('4.6 the blog index is newest first', async () => {
  const s = await site();
  const html = renderBlogIndex(postsNewestFirst(s.corpus.post));
  assert.ok(html.indexOf('2026-08-14') < html.indexOf('2026-07-02'));
});

// ── 4.7 home ─────────────────────────────────────────────────────────────

test('4.7 the changed feed renders dated lines that link entries and carry sources', async () => {
  const s = await site();
  const lines = changedFeed(
    [
      {
        date: '2026-08-20',
        key: 'k1',
        kind: 'price',
        field: 'price_input',
        old: '0.000002',
        new: '0.000003',
        display_name: 'Full Entry',
        row_id: 'vendor/demo-model',
        source: 'demo-source',
        source_url: 'https://example.org/demo/changed',
      },
      {
        kind: 'annotation',
        annotates: 'k1',
        date: '2026-08-21',
        job: 'j-20260821-01',
        text: 'A 50% input-price rise, the first since launch.',
      },
      {
        date: '2026-08-02',
        key: 'k2',
        kind: 'release',
        display_name: 'Something with no entry',
        row_id: 'vendor/unknown',
        source: 'demo-source',
        source_url: 'https://example.org/demo/release',
      },
    ],
    { entries: s.corpus.entry },
  );

  assert.equal(lines.length, 2, 'the annotation is attached, not listed as its own change');
  assert.equal(lines[0].key, 'k1', 'newest first');
  assert.deepEqual(lines[0].entry, {
    id: 'model/full-entry',
    url: '/wiki/model/full-entry',
    name: 'Full Entry',
  });
  assert.equal(lines[0].detail, 'input price 0.000002 → 0.000003');
  assert.equal(lines[1].entry, null, 'a row no entry declares still renders');

  const html = renderChangedFeed(lines);
  assert.match(html, /data-changed-feed="2"/);
  assert.match(html, /<time datetime="2026-08-20" class="rail-date">/);
  assert.match(html, /<a href="\/wiki\/model\/full-entry" class="change-name">Full Entry<\/a>/);
  assert.match(html, /example\.org\/demo\/changed/, 'the source is on the line');
  assert.match(html, /data-annotation=""/, 'the interpret annotation renders with its change');
  assert.match(html, /A 50% input-price rise/);
});

test('4.7 the lifecycle strip and the doors render from the corpus', async () => {
  const s = await site();
  const strip = renderLifecycleStrip([
    { name: 'Dormant Entry', status: 'retired', entry: { url: '/wiki/model/dormant-entry' } },
  ]);
  assert.match(strip, /data-lifecycle-strip="1"/);
  assert.match(strip, /data-tone="ended">retired</);

  // `renderDoors` takes the assembled site model (lib/site.mjs), not the raw
  // build result, so the counts come from the same views the pages render.
  const doors = renderDoors({
    entries: s.corpus.entry,
    catalog: [],
    tools: [],
    tutorials: [],
    posts: s.corpus.post,
    deltas: deltasNewestFirst(s.corpus.delta),
    corpus: s.corpus,
  });
  assert.match(doors, /data-doors="7"/);
  assert.match(doors, /Impossible → Routine/);
  assert.match(doors, /2 dated pairs/, 'the door states what is behind it');
});

// ── 4.14 the showpiece ───────────────────────────────────────────────────

test('4.14 deltas render newest-first with both dated, sourced ends and a measured span', async () => {
  const s = await site();
  const views = deltasNewestFirst(s.corpus.delta);
  assert.deepEqual(views.map((v) => v.slug), ['newer-delta', 'older-delta'], 'newest routine end first');
  assert.equal(views[1].span.text, '6 years, 4 months');

  const html = renderDeltasIndex(views);
  assert.match(html, /data-delta-count="2"/);
  assert.match(html, /data-sort-note="the date it became routine, newest first"/);

  const one = renderDelta(views[1]);
  assert.match(one, /data-end="impossible"[\s\S]*datetime="2012-10-13"/);
  assert.match(one, /data-end="routine"[\s\S]*datetime="2019-03-04"/);
  assert.match(one, /data-span="6 years, 4 months"/);
  assert.match(one, /example\.org\/deltas\/older\/paper/, 'end A source, one click away');
  assert.match(one, /example\.org\/deltas\/older\/product/, 'end B source, one click away');
  assert.match(one, /one result, weeks of GPU time/, 'the optional metric at end A');

  // "no item relies on an intensifier in place of a date" — the shape has
  // nowhere to put one, and the renderer adds none of its own.
  for (const word of ['incredible', 'amazing', 'staggering', 'revolutionary', 'unbelievable']) {
    assert.ok(!html.toLowerCase().includes(word), `the surface adds no intensifier ("${word}")`);
  }
});

test('4.14 span arithmetic', () => {
  assert.equal(spanBetween('2016-03-15', '2016-03-15').text, '0 days');
  assert.equal(spanBetween('2016-01-31', '2016-03-01').text, '1 month');
  assert.equal(spanBetween('1997-05-11', '2016-03-09').text, '18 years, 9 months');
  assert.equal(spanBetween('2020-01-01', '2019-01-01').text, '', 'a reversed pair measures nothing');
});

test('4.14 a delta whose end B has a date but no source fails the build naming the file', async () => {
  const err = await buildFixtureExpectingFailure('delta-unsourced');
  assert.match(err.message, /deltas\/no-receipt\.md/);
  assert.match(err.message, /routine\.source_url/);
  assert.match(err.message, /required field is missing/);
});

test('4.14 a delta dated backwards fails the build', async () => {
  const { validateFrontMatter } = await import('./schema.mjs');
  const res = validateFrontMatter('delta', {
    title: 'Backwards',
    capability: 'A capability.',
    impossible: { date: '2024-01-01', what: 'later', source_url: 'https://example.org/a' },
    routine: { date: '2014-01-01', what: 'earlier', source_url: 'https://example.org/b' },
  });
  assert.equal(res.ok, false);
  assert.match(res.issues[0].message, /runs from research result to commodity, not the other way/);
});
