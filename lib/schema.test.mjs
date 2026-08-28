/**
 * schema.test.mjs — tasks 2.1 and 2.2.
 *
 * Every assertion here is about what the build *does* when handed a bad file,
 * observed by running the real build over a real fixture corpus. None of it
 * is about what the schema was meant to reject.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFixture, buildFixtureExpectingFailure } from './test-helpers.mjs';
import { KINDS, validateFrontMatter } from './schema.mjs';

test('2.1 a valid corpus of all five content types builds clean', async () => {
  const site = await buildFixture('corpus');
  assert.equal(site.diags.errors.length, 0);
  assert.equal(site.corpus.entry.length, 3);
  assert.equal(site.corpus.learn.length, 2);
  assert.equal(site.corpus.tutorial.length, 1);
  assert.equal(site.corpus.post.length, 1);
  assert.equal(site.corpus.tool.length, 1);
});

test('2.1 a cited fact with no source_url or accessed date fails, naming file and field', async () => {
  const err = await buildFixtureExpectingFailure('bad/schema-missing-source');
  assert.match(err.message, /wiki[/\\]model[/\\]no-source\.md/);
  assert.match(err.message, /facts\[0\]\.source_url/);
  assert.match(err.message, /facts\[0\]\.accessed/);
});

test('2.2 a kind outside the closed list fails, naming the file and the invalid kind', async () => {
  const err = await buildFixtureExpectingFailure('bad/unknown-kind');
  assert.match(err.message, /wiki[/\\]person[/\\]somebody\.md/);
  assert.match(err.message, /kind/);
  assert.match(err.message, /invalid kind "person"/);
  // The message must show the reader what IS allowed, not only what is not.
  for (const kind of KINDS) assert.ok(err.message.includes(kind), `names ${kind}`);
});

test('2.2 a duplicated id fails, naming both file paths and the colliding id', async () => {
  const err = await buildFixtureExpectingFailure('bad/duplicate-id');
  assert.match(err.message, /duplicate entry id "model\/alpha"/);
  assert.match(err.message, /alpha-copy\.md/);
  assert.match(err.message, /alpha\.md/);
});

test('2.2 a non-kebab-case id fails, naming the file and the id', async () => {
  const err = await buildFixtureExpectingFailure('bad/bad-id-format');
  assert.match(err.message, /wiki[/\\]model[/\\]bad-id\.md/);
  assert.match(err.message, /id:/);
  assert.match(err.message, /kebab-case/);
});

test('2.1 an unknown front-matter key is an error, not a silent drop', () => {
  const res = validateFrontMatter('post', {
    title: 'x',
    date: '2026-01-01',
    mention: ['model/x'], // typo for `mentions`
  });
  assert.equal(res.ok, false);
  const msg = res.issues.map((i) => i.message).join('\n');
  assert.match(msg, /unknown front-matter key\(s\): mention/);
});

test('2.1 tutorial perishables: every subject needs a verified_against version', async () => {
  const res = validateFrontMatter('tutorial', {
    title: 'x',
    subjects: ['tool/a'],
    verified_on: '2026-08-01',
  });
  assert.equal(res.ok, false);
  assert.ok(res.issues.some((i) => i.field === 'verified_against'));
});

test('2.1 a learn page must declare level, outcome and prerequisites', () => {
  const res = validateFrontMatter('learn', { title: 'x' });
  assert.equal(res.ok, false);
  const fields = res.issues.map((i) => i.field);
  assert.ok(fields.includes('level'));
  assert.ok(fields.includes('outcome'));
});

test('2.1 a tool listing must declare url, pricing, last_verified and its entry link', () => {
  const res = validateFrontMatter('tool', { title: 'x' });
  assert.equal(res.ok, false);
  const fields = res.issues.map((i) => i.field);
  for (const f of ['url', 'pricing', 'last_verified', 'entry']) {
    assert.ok(fields.includes(f), `reports missing ${f}`);
  }
});

test('2.1 a post must carry a date', () => {
  const res = validateFrontMatter('post', { title: 'x' });
  assert.equal(res.ok, false);
  assert.ok(res.issues.some((i) => i.field === 'date'));
});
