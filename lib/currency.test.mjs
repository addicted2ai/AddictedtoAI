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
import { findCurrencyLiterals, findFrontMatterLiterals } from './currency.mjs';
import { PROSE_FIELDS } from './schema.mjs';

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

// ---------------------------------------------------------------------------
// beads addictedtoai-48r — the scan was BODY-ONLY, and deltas are almost
// entirely front matter, so it was vacuous on 23 of 29 of them. What follows
// measures the two halves of the fix: the scan reaches declared author-prose
// front-matter fields, and a dated observation stays legal.
// ---------------------------------------------------------------------------

const proseFixture = () => buildFixture('prose-fields');
const currencyWarnings = (site) => site.diags.warnings.filter((w) => w.rule === 'currency-literal');

test('48r (a) an undated front-matter literal warns, naming file, field, literal and rule', async () => {
  const site = await proseFixture();
  const onOutcome = currencyWarnings(site).filter((w) => w.field === 'outcome');
  assert.ok(onOutcome.length > 0, `outcome is scanned: ${JSON.stringify(currencyWarnings(site))}`);
  for (const w of onOutcome) {
    assert.ok(/learn[/\\]priced-outcome\.md$/.test(w.file), w.file);
    assert.equal(w.field, 'outcome', 'the FIELD, not a body line number');
    assert.match(w.message, /\{\{fact:<kind>\/<slug>#<field>\}\}/, 'and what to do instead');
  }
  // `$20/month` trips two rules and both are reported, exactly as they are in a
  // body: the author is told what tripped, not merely that something did.
  const said = onOutcome.map((w) => w.message).join('\n');
  assert.match(said, /"\$20" \(price\)/);
  assert.match(said, /"20\/month" \(per-month\)/);
});

test('48r (b)(c) a dated observation stays legal — end metrics, corrections, pricing', async () => {
  const site = await proseFixture();
  const fields = currencyWarnings(site).map((w) => `${w.file}:${w.field}`);

  // A delta end carries a required ISO `date`, so both ends are exempt. These
  // are the files the originating report would have had a fixer "fix".
  assert.ok(!fields.some((f) => /impossible|routine/.test(f)), `delta ends exempt: ${fields}`);
  assert.ok(!fields.some((f) => /corrections/.test(f)), 'a blog correction carries its own date');
  assert.ok(!fields.some((f) => f.endsWith(':pricing')), 'a tool listing carries last_verified');

  // The exemption is mechanical, not a blessed-field list: the same literal in
  // a field with NO dated sibling is warned about, in the same run.
  assert.ok(fields.some((f) => f.endsWith(':outcome')));
});

test('48r (d) a front-matter hit is a WARNING — the build still succeeds', async () => {
  const site = await proseFixture();
  assert.ok(currencyWarnings(site).length > 0, 'something was warned about');
  assert.equal(site.diags.errors.length, 0, 'and nothing failed');
});

test('48r the coverage counts say how many documents were really scanned', async () => {
  const site = await proseFixture();
  // Two learn pages, both with a scannable `outcome`; three posts, none with a
  // scannable field. Before this the two numbers were indistinguishable, which
  // is how a check stayed vacuous on 23 of 29 documents for a whole seed wave.
  assert.deepEqual(site.proseCoverage.learn, { scanned: 2, none: 0 });
  assert.deepEqual(site.proseCoverage.post, { scanned: 0, none: 3 });
  assert.deepEqual(site.proseCoverage.delta, { scanned: 1, none: 0 }, 'capability is scanned');
  assert.deepEqual(site.proseCoverage.tool, { scanned: 0, none: 1 }, 'pricing is dated, so exempt');
  assert.deepEqual(site.proseCoverage.entry, { scanned: 0, none: 1 }, 'entries declare no prose field');
});

test('48r the scan is over the DECLARED classification, and resolves nested paths', () => {
  const delta = {
    capability: 'Serving a model for $3.00 per million tokens.',
    impossible: { date: '2020-01-01', what: 'cost $60.00', metric: '$60.00' },
    routine: { what: 'costs $0.30', metric: '$0.30' },
  };
  const { hits, scanned } = findFrontMatterLiterals(delta, PROSE_FIELDS.delta);
  // `impossible` has a date sibling and is exempt; `routine` here does not, so
  // both of its fields are scanned. The schema makes that shape impossible in
  // real content, which is exactly why the exemption is measured, not assumed.
  assert.deepEqual(scanned.sort(), ['capability', 'routine.metric', 'routine.what']);
  assert.ok(hits.every((h) => !h.field.startsWith('impossible')));
  assert.ok(hits.some((h) => h.field === 'capability' && h.rule === 'price'));

  // Indexed array paths are reported by index, so the author can find the item.
  const post = { date: '2026-01-01', corrections: [{ text: 'was $9.99' }] };
  const c = findFrontMatterLiterals(post, PROSE_FIELDS.post);
  assert.deepEqual(c.scanned, ['corrections[0].text']);
  assert.equal(c.hits[0].field, 'corrections[0].text');
});
