/**
 * currency.test.mjs — task 2.10.
 *
 * A warning, never a failure. The test that matters as much as the detection
 * is the one below it: a correctly transcluded fact must not be warned about,
 * or the check trains authors to ignore it.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFixture } from './test-helpers.mjs';
import { findCurrencyLiterals } from './currency.mjs';

test('2.10 a hard-coded price produces a warning naming the file and the line', async () => {
  const site = await buildFixture('currency');
  const warnings = site.diags.warnings.filter((w) => w.rule === 'currency-literal');
  assert.ok(warnings.length > 0, 'at least one currency warning');

  const priced = warnings.find((w) => w.message.includes('$3.00'));
  assert.ok(priced, 'the hard-coded price is named');
  assert.match(priced.file, /blog[/\\]priced\.md$/);
  assert.equal(priced.field, 'line 7');
  assert.match(priced.message, /\{\{fact:<kind>\/<slug>#<field>\}\}/);
});

test('2.10 it is a warning, not a failure — the build still succeeds', async () => {
  const site = await buildFixture('currency');
  assert.equal(site.diags.errors.length, 0);
});

test('2.10 code blocks and inline code are exempt', async () => {
  const site = await buildFixture('currency');
  const texts = site.diags.warnings.map((w) => w.message).join('\n');
  assert.ok(!texts.includes('$9.99'), 'fenced code is not warned about');
  assert.ok(!texts.includes('128,000 tokens'), 'fenced code is not warned about');
  assert.ok(!texts.includes('$0.50'), 'inline code is not warned about');
});

test('2.10 a transcluded fact is never warned about', async () => {
  const site = await buildFixture('corpus');
  const warnings = site.diags.warnings.filter((w) => w.rule === 'currency-literal');
  assert.deepEqual(warnings, [], 'the corpus fixture transcludes and warns nothing');
});

test('2.10 the named shapes are detected', () => {
  const shapes = [
    ['It costs $3.00 today.', 'price'],
    ['A 128,000 tokens window.', 'tokens'],
    ['A 200K context window.', 'context'],
    ['It is $20/month.', 'price'],
    ['Shipped as v1.2.3 last week.', 'version'],
  ];
  for (const [text, rule] of shapes) {
    const hits = findCurrencyLiterals(text);
    assert.ok(hits.length > 0, `detects: ${text}`);
    assert.ok(hits.some((h) => h.rule === rule), `${text} -> ${rule}`);
  }
});

test('2.10 line numbers are file lines, not body lines', () => {
  const body = 'line one\nline two\nIt costs $5.00.\n';
  const hits = findCurrencyLiterals(body, 10); // body starts at file line 10
  assert.equal(hits[0].line, 12);
});

test('2.10 ordinary prose with no perishable literal produces nothing', () => {
  const body = 'Attention computes a weighted mixture of value vectors.\n';
  assert.deepEqual(findCurrencyLiterals(body), []);
});
