/**
 * corroboration.test.mjs — comparing a feed-bound fact against a cited one
 * (specs/pulse, harden-seed-wave-guardrails; `addictedtoai-473`).
 *
 * The case underneath every assertion here is real: an entry carried `284B`
 * parameters from OpenRouter while the checkpoint's own model card and an
 * independently cited post both said `304B`, and nothing in the engine
 * compared them, because nothing could — there was no way to say that two
 * differently-named facts measure the same quantity.
 *
 * The distinction the second test draws is the one worth stating twice: an
 * unresolvable side produces **no comparison**, which is not the same result as
 * an agreement. A check that silently reports "fine" when it could not run is
 * the failure mode this whole change exists to remove.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanup, makeRoot, paths, writeJson } from './helpers.mjs';
import {
  agree,
  corroborationFindings,
  declaredPairs,
  magnitude,
  normalise,
  resolveSide,
} from '../lib/corroboration.mjs';

/** An entry as `pulse/lib/corpus.mjs` reads it: front matter, already parsed. */
function entry({ feed = 'openrouter', rowId = 'deepseek/v4-flash', citedValue = '304B params', path = 'parameters' } = {}) {
  return {
    id: 'model/deepseek-v4-flash',
    path: 'content/wiki/model/deepseek-v4-flash.md',
    feeds: { [feed]: rowId },
    facts: [
      { field: 'parameters', source: 'feed', feed, path, volatility: 'slow' },
      {
        field: 'card_parameters',
        source: 'cited',
        value: citedValue,
        source_url: 'https://huggingface.co/example/card',
        accessed: '2026-08-28',
        volatility: 'static',
        corroborates: 'parameters',
      },
    ],
  };
}

function withSnapshot(root, rows, id = 'openrouter') {
  writeJson(paths.latest(root, id), {
    source: id,
    url: 'https://openrouter.invalid/api/models',
    date: '2026-08-28',
    body_hash: 'x',
    row_count: Object.keys(rows).length,
    rows,
  });
}

// ---- the normalisation and agreement rule (C30) ---------------------------

test('the observed case disagrees: 284B total against 304B params', () => {
  assert.equal(agree('284B total', '304B params'), false);
});

test('the same magnitude with different trailing words agrees', () => {
  assert.equal(agree('284B total', '284B params'), true);
  assert.equal(agree('  284b   TOTAL ', '284B total'), true, 'trim, collapse, case-fold');
});

test('formatting differences in a price do not become a finding', () => {
  assert.equal(agree('$3', '$3.00'), true);
  assert.equal(agree('$3', '$3.01'), false, 'and there is no tolerance');
});

test('values with no magnitude fall to the string comparison', () => {
  assert.equal(agree('active', 'deprecated'), false);
  assert.equal(agree('active', 'Active'), true);
});

test('a currency symbol is part of the magnitude, so $3 is not asserted to equal 3', () => {
  assert.equal(agree('$3', '3'), false);
});

test('the K/M/B/T suffix scales only when it belongs to the number', () => {
  assert.equal(magnitude('284b total').value, 284e9);
  assert.equal(magnitude('128k context').value, 128e3);
  // "2 tokens" must not become two trillion because a word begins with `t`.
  assert.equal(magnitude('2 tokens').value, 2);
  assert.equal(
    agree('2 tokens', '2000000000000 things'),
    false,
    'if a detached word scaled the number, these two would be declared the same quantity',
  );
  // An unrecognised compound unit yields the unscaled number rather than a guess.
  assert.equal(magnitude('1.5tb').value, 1.5);
});

test('digit group separators belong to the number, not to the text', () => {
  assert.equal(magnitude('1,000 tokens').value, 1000);
  assert.equal(agree('1,000 tokens', '1000 tokens'), true);
});

test('normalise does only what the spec names: trim, collapse, case-fold', () => {
  assert.equal(normalise('  A   B  '), 'a b');
  assert.equal(normalise('284B'), '284b');
});

// ---- resolution, and the difference between absence and disagreement ------

test('a declared pair whose values disagree produces exactly one finding', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  withSnapshot(root, { 'deepseek/v4-flash': { id: 'deepseek/v4-flash', parameters: '284B total' } });

  const findings = corroborationFindings(root, { entries: [entry()] });
  assert.equal(findings.length, 1);
  const f = findings[0];
  assert.equal(f.entry_id, 'model/deepseek-v4-flash');
  assert.equal(f.a.field, 'card_parameters', 'the declaring fact is named first');
  assert.equal(f.a.value, '304B params');
  assert.equal(f.a.kind, 'cited');
  assert.equal(f.a.source, 'https://huggingface.co/example/card');
  assert.equal(f.b.field, 'parameters');
  assert.equal(f.b.value, '284B total');
  assert.equal(f.b.kind, 'feed');
  assert.equal(f.b.source, 'openrouter', 'the feed side names its registry id');
});

test('a vanished declared row produces no comparison at all — not an agreement', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  // The snapshot exists; the declared row is simply not in it any more.
  withSnapshot(root, { 'someone/else': { id: 'someone/else', parameters: '284B total' } });

  const e = entry();
  const side = resolveSide(root, e, e.facts[0]);
  assert.equal(side.resolved, false, 'the feed side does not resolve');
  assert.match(side.why, /absent from the latest snapshot/);

  assert.deepEqual(
    corroborationFindings(root, { entries: [e] }),
    [],
    'and no finding is produced — the vanished-row repair item already reports this state',
  );
});

test('a field path the row does not carry produces no comparison', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  withSnapshot(root, { 'deepseek/v4-flash': { id: 'deepseek/v4-flash', context_length: 128000 } });

  const e = entry();
  const side = resolveSide(root, e, e.facts[0]);
  assert.equal(side.resolved, false);
  assert.match(side.why, /no value at "parameters"/);
  assert.deepEqual(corroborationFindings(root, { entries: [e] }), []);
});

test('no snapshot yet produces no comparison, so a new source never fires this check', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));

  const e = entry();
  const side = resolveSide(root, e, e.facts[0]);
  assert.equal(side.resolved, false);
  assert.match(side.why, /no snapshot yet/);
  assert.deepEqual(corroborationFindings(root, { entries: [e] }), []);
});

test('an entry with no feeds binding for the fact’s source produces no comparison', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  withSnapshot(root, { 'deepseek/v4-flash': { id: 'deepseek/v4-flash', parameters: '284B total' } });

  const e = entry();
  e.feeds = {};
  const side = resolveSide(root, e, e.facts[0]);
  assert.equal(side.resolved, false);
  assert.match(side.why, /declares no feeds binding/);
  assert.deepEqual(corroborationFindings(root, { entries: [e] }), []);
});

test('agreement produces no finding', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  withSnapshot(root, { 'deepseek/v4-flash': { id: 'deepseek/v4-flash', parameters: '304B total' } });

  assert.deepEqual(corroborationFindings(root, { entries: [entry()] }), []);
});

// ---- the join itself ------------------------------------------------------

test('the join is declared: two facts measuring the same thing are not paired by name', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  withSnapshot(root, { 'deepseek/v4-flash': { id: 'deepseek/v4-flash', parameters: '284B total' } });

  const e = entry();
  delete e.facts[1].corroborates;
  assert.deepEqual(declaredPairs(e), [], 'similar names are not a declaration');
  assert.deepEqual(corroborationFindings(root, { entries: [e] }), []);
});

test('a pair declared from both ends is one pair, not two', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  withSnapshot(root, { 'deepseek/v4-flash': { id: 'deepseek/v4-flash', parameters: '284B total' } });

  const e = entry();
  e.facts[0].corroborates = 'card_parameters';
  assert.equal(declaredPairs(e).length, 1);
  assert.equal(corroborationFindings(root, { entries: [e] }).length, 1);
});

test('a corroborates naming nothing is not a pair here — that failure belongs to the build', () => {
  const e = entry();
  e.facts[1].corroborates = 'nothing_declares_this';
  assert.deepEqual(declaredPairs(e), []);
});
