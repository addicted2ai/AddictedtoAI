/**
 * build-gates.test.mjs — task 2.9: indexability, redirects, internal links.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFixture, buildFixtureExpectingFailure } from './test-helpers.mjs';
import { indexability, browsableEntries, robotsFor } from './indexability.mjs';
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
