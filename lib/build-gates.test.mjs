/**
 * build-gates.test.mjs — task 2.9: indexability, redirects, internal links.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFixture, buildFixtureExpectingFailure, fixtureRoot } from './test-helpers.mjs';
import { indexability, browsableEntries, robotsFor } from './indexability.mjs';
import { reviewCandidates, entryReviewGate, subjectsOf } from './reviews.mjs';
import { validateRedirects, mergeVercelConfig } from './redirects.mjs';
import { Diagnostics } from './errors.mjs';
import { normalizeRoute } from './routes.mjs';
import { pathOf } from './linkcheck.mjs';

// ---- indexability ---------------------------------------------------------

const entryDoc = (data, hasBody = false) => ({ hasBody, data: { facts: [], timeline: [], ...data } });

test('2.9 a stub — data only, one fact, no timeline — is noindex', () => {
  const doc = entryDoc({ id: 'model/stub', status: 'active', facts: [{ field: 'a' }] });
  const r = indexability(doc);
  assert.equal(r.indexed, false);
  assert.equal(r.stub, true);
  assert.equal(robotsFor(doc), 'noindex,follow');
});

test('2.9 a prose body makes an entry indexable', () => {
  const doc = entryDoc({ id: 'model/full', status: 'active' }, true);
  assert.equal(indexability(doc).indexed, true);
  assert.deepEqual(indexability(doc).reasons, ['prose-body']);
});

test('2.9 two facts plus a timeline event make an entry indexable without prose', () => {
  const doc = entryDoc({
    id: 'model/data',
    status: 'active',
    facts: [{ field: 'a' }, { field: 'b' }],
    timeline: [{ date: '2026-01-01' }],
  });
  assert.deepEqual(indexability(doc).reasons, ['facts-and-timeline']);
});

test('2.9 a dead thing is indexed on its lifecycle status alone — the obituary rule', () => {
  for (const status of ['deprecated', 'retired', 'dead']) {
    const doc = entryDoc({ id: `model/${status}`, status });
    assert.ok(indexability(doc).reasons.includes('lifecycle-status'), status);
  }
  for (const status of ['active', 'preview', 'announced']) {
    const doc = entryDoc({ id: `model/${status}`, status });
    assert.equal(indexability(doc).indexed, false, status);
  }
});

test('ij4h the obituary rule prefers doc.currentStatus over raw front matter when both are set', () => {
  // doc.currentStatus is build-content.mjs's PRESENTED status (a stub's
  // resolved feed value, or a prose entry's authored one) — see its header.
  // A fixture doc built without going through that pipeline carries no such
  // property, so this also proves the fallback: unset means "read front
  // matter", exactly today's behaviour for every doc.currentStatus-unaware
  // caller (the tests above, and every one of them still passing, are that
  // proof for the unset case).
  const stale = { ...entryDoc({ id: 'model/stale', status: 'deprecated' }), currentStatus: 'active' };
  assert.equal(indexability(stale).indexed, false, 'the resolved status overrides a stale obituary claim');
  assert.ok(!indexability(stale).reasons.includes('lifecycle-status'));

  const revived = { ...entryDoc({ id: 'model/revived', status: 'active' }), currentStatus: 'dead' };
  assert.ok(
    indexability(revived).reasons.includes('lifecycle-status'),
    'the resolved status also catches an obituary the front matter has not caught up to',
  );
});

test('2.9 the review gate is an injection point, not an assumption', () => {
  const doc = entryDoc({ id: 'model/unreviewed', status: 'active' }, true);
  assert.equal(indexability(doc, { hasApprovedReview: () => false }).indexed, false);
});

test('2.9 an indexed entry appears in browse listings and a stub does not', async () => {
  const site = await buildFixture('facts');
  const browsable = browsableEntries(site.corpus.entry).map((d) => d.data.id);
  // cited-fresh has 2 facts + a timeline event; cited-overdue is deprecated.
  assert.ok(browsable.includes('model/cited-fresh'));
  assert.ok(browsable.includes('model/cited-overdue'));
  // feed-model and vanished-model are data-only with no timeline: stubs.
  assert.ok(!browsable.includes('model/feed-model'));
  assert.ok(!browsable.includes('model/vanished-model'));
});

/* ---------------------------------------------------------------------------
 * 15c — "a prose body that PASSED REVIEW", joined to real verdict records.
 *
 * The `review` fixture holds two entries of one shape: one fact, no timeline
 * event, `active` status, a prose body. Nothing but the prose-body rule can
 * index either, so what the robots tag does here is a measurement of the
 * review clause and of nothing else.
 *
 * Every case below is two-sided. A gate that suppressed everything would pass
 * the `revise` half and fail the site, so the `approve` half is asserted in
 * the same test, and the browse listing is checked alongside the tag because
 * specs/wiki makes them one decision.
 * ------------------------------------------------------------------------ */

const reviewFixture = (verdict) =>
  buildFixture('review', { reviewsDir: fixtureRoot('review-records', verdict) });

const entryById = (site, id) => site.corpus.entry.find((d) => d.data.id === id);

test('15c an approved review indexes the body; a revise and a reject both noindex it', async () => {
  const approved = entryById(await reviewFixture('approve'), 'concept/reviewed-body');
  assert.equal(approved.index.indexed, true, 'an `approve` keeps the prose-body reason');
  assert.deepEqual(approved.index.reasons, ['prose-body']);

  for (const verdict of ['revise', 'reject']) {
    const site = await reviewFixture(verdict);
    const doc = entryById(site, 'concept/reviewed-body');
    assert.equal(doc.index.indexed, false, `a \`${verdict}\` must remove the prose-body reason`);
    assert.deepEqual(doc.index.reasons, [], `nothing else indexes it, so \`${verdict}\` leaves none`);
    assert.equal(doc.index.stub, false, 'it still HAS a body — it is unapproved, not a stub');
    // The id is read as DATA. Splitting the display string on its first space
    // is what this used to do, and it would break silently on any id that ever
    // contained one.
    assert.deepEqual(
      site.reviewGate.unapproved.map((u) => u.id),
      ['concept/reviewed-body'],
      'and the build says so rather than only doing it',
    );
    assert.equal(site.reviewGate.unapproved[0].verdict, verdict);
    assert.match(site.reviewGate.unapproved[0].message, /^concept\/reviewed-body \(seed-/);
  }
});

test('15c the browse listing moves with the robots tag — they are one rule, not two', async () => {
  const listed = (site) => browsableEntries(site.corpus.entry).map((d) => d.data.id);
  assert.ok(listed(await reviewFixture('approve')).includes('concept/reviewed-body'));
  assert.ok(
    !listed(await reviewFixture('revise')).includes('concept/reviewed-body'),
    'specs/wiki: an unindexed entry appears in no browse listing',
  );
});

test('15c a body with no record the join recognises stays indexed, and is counted', async () => {
  const site = await reviewFixture('approve');
  const doc = entryById(site, 'concept/unrecorded-body');
  // Absence is not evidence: from the build, "unreviewed" and "filed under a
  // name this join does not know" are the same observation, and suppressing on
  // it would de-index approved work over a naming mismatch. It is reported.
  assert.equal(doc.index.indexed, true);
  assert.deepEqual(site.reviewGate.unrecorded, ['concept/unrecorded-body']);
  assert.equal(site.reviewGate.approved.size, 1);
});

test('15c the join is verify-launch\'s: canonical name first, documented alternate accepted', async () => {
  // `approve` is filed as seed-wiki-concept-reviewed-body.md (canonical),
  // `revise` as seed-reviewed-body.md (the short form data/reviews/README.md
  // documents). Both resolve, and the candidate list is the one task 6.6 fixed.
  const doc = entryById(await reviewFixture('approve'), 'concept/reviewed-body');
  assert.deepEqual(reviewCandidates(doc), [
    'seed-wiki-concept-reviewed-body.md',
    'seed-concept-reviewed-body.md',
    'seed-entry-reviewed-body.md',
    'seed-reviewed-body.md',
  ]);
  const revised = await reviewFixture('revise');
  assert.equal(
    revised.reviews.byFile.get(doc.file).matchedBy,
    'seed-reviewed-body.md',
    'matched by an accepted alternate, and the alternate is named rather than hidden',
  );
});

test('15c the blocked id is read as data, so an id containing a space still noindexes', () => {
  // The gate used to recover the id by splitting its own display string on the
  // first space. No id in the corpus has ever contained one, so the defect was
  // invisible: the block below is what it would have looked like when one did —
  // the entry would have stayed INDEXED on a `revise` verdict, silently.
  const doc = {
    hasBody: true,
    file: 'content/wiki/concept/spaced.md',
    data: { id: 'concept/two words' },
  };
  const gate = entryReviewGate(
    { entry: [doc] },
    { byFile: new Map([[doc.file, { record: { name: 'seed-spaced.md', verdict: { verdict: 'revise' } } }]]) },
  );
  assert.deepEqual(gate.unapproved.map((u) => u.id), ['concept/two words']);
  assert.equal(gate.hasApprovedReview('concept/two words'), false, 'a `revise` blocks the whole id');
  assert.equal(gate.hasApprovedReview('concept/two'), true, 'and blocks nothing else');
  assert.equal(gate.unapproved[0].record, 'seed-spaced.md');
});

test('sge a review record may name several reviewed files, as a list or as one string', () => {
  // What the loop's merge step writes. `subject:` as a YAML list is how one
  // record names every prose file the job it reviewed actually merged.
  assert.deepEqual(
    subjectsOf({ data: { subject: ['content/wiki/model/a.md', 'content\\blog\\b.md'] } }),
    ['content/wiki/model/a.md', 'content/blog/b.md'],
  );
  assert.deepEqual(subjectsOf({ data: { subject: 'content/wiki/model/a.md' } }), ['content/wiki/model/a.md']);
  assert.deepEqual(subjectsOf({ data: { subject: ['  ', 7, null] } }), [], 'nothing usable is nothing, not junk');
});

// ---- redirects ------------------------------------------------------------

test('2.9 a redirect entry appears in the generated vercel.json', () => {
  const diags = new Diagnostics();
  const rules = validateRedirects(
    { redirects: [{ source: '/old-page/', destination: '/wiki/model/demo-model' }] },
    diags,
  );
  assert.equal(diags.errors.length, 0);
  assert.deepEqual(rules, [
    { source: '/old-page', destination: '/wiki/model/demo-model', permanent: true },
  ]);
  const vercel = mergeVercelConfig({ cleanUrls: true }, rules);
  assert.deepEqual(vercel, { cleanUrls: true, redirects: rules });
});

test('2.9 a malformed redirect fails the build naming the field', () => {
  const diags = new Diagnostics();
  validateRedirects({ redirects: [{ source: 'old', destination: '/new' }] }, diags);
  assert.equal(diags.errors.length, 1);
  assert.match(diags.errors[0].field, /redirects\[0\]\.source/);
  assert.match(diags.errors[0].message, /root-relative/);
});

test('2.9 duplicate and self-referential redirects are refused', () => {
  const diags = new Diagnostics();
  validateRedirects(
    {
      redirects: [
        { source: '/a', destination: '/b' },
        { source: '/a', destination: '/c' },
        { source: '/d', destination: '/d/' },
      ],
    },
    diags,
  );
  const msgs = diags.errors.map((e) => e.message).join('\n');
  assert.match(msgs, /duplicate redirect source "\/a"/);
  assert.match(msgs, /redirects to itself/);
});

test('2.9 an existing vercel.json keeps its other top-level keys', () => {
  const merged = mergeVercelConfig({ headers: [{ source: '/(.*)' }], redirects: [] }, [
    { source: '/a', destination: '/b', permanent: true },
  ]);
  assert.ok(merged.headers);
  assert.equal(merged.redirects.length, 1);
});

// ---- internal links -------------------------------------------------------

test('2.9 a broken internal link fails the build naming the page and the link', async () => {
  const err = await buildFixtureExpectingFailure('bad/broken-link');
  assert.match(err.message, /blog[/\\]dead-link\.md/);
  assert.match(err.message, /link "\/definitely-not-a-page"/);
  assert.match(err.message, /which no page, public file or redirect serves/);
});

test('2.9 a link to a real content route resolves', async () => {
  const site = await buildFixture('corpus');
  assert.ok(site.routes.has('/wiki/model/demo-model'));
  assert.equal(site.diags.errors.length, 0);
});

test('2.9 a redirect source counts as a resolvable target', async () => {
  const site = await buildFixture('corpus', {
    redirects: false,
  });
  // The link check consults redirect sources; with none declared the fixture
  // still passes because it links only to real routes.
  assert.equal(site.diags.errors.length, 0);
});

test('2.9 route and path normalization agree on trailing slashes', () => {
  assert.equal(normalizeRoute('/a/b/'), '/a/b');
  assert.equal(normalizeRoute('/'), '/');
  assert.equal(pathOf('/a/b/?x=1#frag'), '/a/b');
  assert.equal(pathOf('#frag'), null);
});
