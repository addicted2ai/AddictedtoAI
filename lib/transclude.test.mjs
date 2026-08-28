/**
 * transclude.test.mjs — tasks 2.4 (transclusion) and 2.8 (wants).
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFixture, buildFixtureExpectingFailure } from './test-helpers.mjs';

test('2.4 a resolvable transclusion renders the fact with its source', async () => {
  const site = await buildFixture('corpus');
  const post = site.corpus.post[0];
  assert.match(post.html, /class="fact fact-inline"/);
  assert.match(post.html, /data-entry="model\/demo-model"/);
  assert.match(post.html, /<span class="fact-value">Apache-2\.0<\/span>/);
  // The feed-bound one resolves through the data layer in the same sentence.
  assert.match(post.html, /<span class="fact-value">0\.000003<\/span>/);
  assert.ok(!post.html.includes('{{fact:'), 'no marker survives into the HTML');
  assert.deepEqual(post.transcluded.facts, [
    'model/demo-model#license',
    'model/demo-model#price_input',
  ]);
});

test('2.4 an unresolvable transclusion fails the build naming the file and the reference', async () => {
  const err = await buildFixtureExpectingFailure('bad/transclusion');
  assert.match(err.message, /blog[/\\]broken\.md/);
  assert.match(err.message, /\{\{fact:model\/alpha#price_input\}\}/);
  assert.match(err.message, /entry "model\/alpha" has no fact "price_input"/);
  assert.match(err.message, /\{\{fact:model\/nope#license\}\}/);
  assert.match(err.message, /references entry "model\/nope", which does not exist/);
});

test('2.4 a transcluded value is not alias-linked inside its own markup', async () => {
  const site = await buildFixture('corpus');
  const post = site.corpus.post[0];
  // "Demo Model" is an exclusive alias; the prose occurrence is linked, but
  // nothing inside the data-nolink fact span is.
  const factSpan = post.html.match(/<span class="fact fact-inline"[\s\S]*?<\/span><\/span>/)[0];
  assert.ok(!factSpan.includes('wiki-link'));
  assert.match(post.html, /data-nolink=""/);
});

test('2.8 two pages wanting one name give a count of 2 with both page paths listed', async () => {
  const site = await buildFixture('wants');
  const vllm = site.wants.wants.find((w) => w.name === 'vLLM');
  assert.ok(vllm, 'vLLM is recorded');
  assert.equal(vllm.count, 2);
  assert.deepEqual(vllm.pages, [
    'lib/fixtures/wants/blog/first-page.md',
    'lib/fixtures/wants/blog/second-page.md',
  ]);
});

test('2.8 the count is of distinct referring pages, not of markers', async () => {
  const site = await buildFixture('wants');
  // second-page.md contains {{want:vLLM}} twice; it still counts once.
  const vllm = site.wants.wants.find((w) => w.name === 'vLLM');
  assert.equal(vllm.pages.length, 2);
  const ray = site.wants.wants.find((w) => w.name === 'Ray Serve');
  assert.equal(ray.count, 1);
});

test('2.8 a want renders as the plain text Name and nothing else', async () => {
  const site = await buildFixture('wants');
  const first = site.corpus.post.find((d) => d.slug === 'first-page');
  assert.match(first.html, /and\nvLLM is the name that keeps coming up/);
  assert.ok(!first.html.includes('{{want:'));
  assert.ok(!/vLLM<\/a>/.test(first.html), 'a want is never a link');
});

test('2.8 nothing is recorded for a name that carries no want marker', async () => {
  const site = await buildFixture('corpus');
  // The corpus fixture's prose names things freely and uses no want markers.
  assert.deepEqual(site.wants.wants, []);
});

test('2.4 a malformed marker fails the build rather than shipping braces to a page', async () => {
  const site = await buildFixture('corpus');
  const { renderMarkdown } = await import('./markdown.mjs');
  const { Diagnostics } = await import('./errors.mjs');
  const diags = new Diagnostics();
  renderMarkdown('A typo: {{fact:model/demo-model#no-such-shape}} here.', {
    file: 'x.md',
    byId: site.corpus.byId,
    diags,
    wants: new Map(),
    renderFact: () => '',
    aliases: [],
  });
  assert.equal(diags.errors.length, 1);
  assert.match(diags.errors[0].message, /unrecognized marker/);
});

test('2.4 a marker inside a code fence is left alone, not resolved', async () => {
  const site = await buildFixture('corpus');
  const { renderMarkdown } = await import('./markdown.mjs');
  const { Diagnostics } = await import('./errors.mjs');
  const diags = new Diagnostics();
  const out = renderMarkdown(
    'Documenting the syntax:\n\n```text\n{{fact:model/nope#price}}\n```\n',
    { file: 'x.md', byId: site.corpus.byId, diags, wants: new Map(), renderFact: () => '', aliases: [] },
  );
  assert.equal(diags.errors.length, 0, 'a marker in a code fence is not resolved');
  assert.match(out.html, /\{\{fact:model\/nope#price\}\}/);
});
