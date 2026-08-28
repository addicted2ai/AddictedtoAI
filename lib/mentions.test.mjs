/**
 * mentions.test.mjs — task 2.7.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFixture, buildFixtureExpectingFailure } from './test-helpers.mjs';
import { renderReferencedHere, renderAppearsIn } from './mentions.mjs';

test('2.7 "Referenced here" lists the page\'s own mentions', async () => {
  const site = await buildFixture('corpus');
  const post = site.corpus.post[0];
  const html = renderReferencedHere(post, site.corpus.byId);
  assert.match(html, /aria-label="Referenced here"/);
  assert.match(html, /<a href="\/wiki\/model\/demo-model">Demo Model<\/a>/);
  assert.match(html, /<a href="\/wiki\/tool\/demo-tool">DemoTool<\/a>/);
});

test('2.7 "Appears in" backlinks are computed, with no edit to the entry file', async () => {
  const site = await buildFixture('corpus');
  const back = site.backlinks.backlinks['model/demo-model'];
  assert.ok(back, 'the entry has backlinks');
  assert.deepEqual(back.map((b) => b.url), ['/blog/demo-post']);

  const html = renderAppearsIn('model/demo-model', site.backlinks);
  assert.match(html, /aria-label="Appears in"/);
  assert.match(html, /A post that transcludes instead of restating/);
});

test('2.7 backlinks cover every content type that mentions an entry', async () => {
  const site = await buildFixture('corpus');
  const tool = site.backlinks.backlinks['tool/demo-tool'].map((b) => b.type);
  assert.deepEqual(tool.sort(), ['post', 'tool', 'tutorial']);
  const concept = site.backlinks.backlinks['concept/demo-concept'].map((b) => b.type);
  // Two learn pages plus the entry that mentions it.
  assert.deepEqual(concept.sort(), ['entry', 'learn', 'learn']);
});

test('2.7 an unresolvable mention id fails the build', async () => {
  const err = await buildFixtureExpectingFailure('bad/mention');
  assert.match(err.message, /blog[/\\]bogus-mention\.md/);
  assert.match(err.message, /mentions\[0\]/);
  assert.match(err.message, /references entry "model\/does-not-exist", which does not exist/);
});

test('2.7 an entry with no backlinks renders no rail at all', async () => {
  const site = await buildFixture('corpus');
  assert.equal(renderAppearsIn('model/nothing-links-here', site.backlinks), '');
});

test('2.7 backlinks are deterministically ordered', async () => {
  const a = await buildFixture('corpus');
  const b = await buildFixture('corpus');
  assert.deepEqual(a.backlinks, b.backlinks);
});
