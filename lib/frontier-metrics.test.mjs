/**
 * frontier-metrics.test.mjs — the registry's `frontier` block as every consumer
 * reads it (`separate-a-claim-from-a-fact` task 22).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clearedMetricIds,
  frontierBlock,
  frontierMetrics,
  frontierMetricsReportStep,
  isCleared,
  isRowExcluded,
  metricsAwaitingDecision,
  rightsState,
} from './frontier-metrics.mjs';

const metric = (id, rights) => ({ id, field: id, path: `p.${id}`, source: 's', direction: 'higher', label: id, rights });
const cleared = { terms_url: 'u', checked_on: '2026-09-06', outcome: 'cleared', excerpt: 'you may' };

test('a registry with no frontier block reads as declaring nothing, not as an error', () => {
  assert.deepEqual(frontierBlock({}), { metrics: [], row_exclusions: [] });
  assert.deepEqual(frontierBlock(undefined), { metrics: [], row_exclusions: [] });
  assert.deepEqual(frontierMetrics({ frontier: { metrics: 'nope' } }), []);
});

test('rights are four states, because a boolean would collapse two of them', () => {
  // `refused` is an answer somebody paid for; `undeclared` is a question still
  // owed. They behave the same at the surface and differently on the ledger,
  // and a boolean cannot tell them apart (specs/pulse: "a missing field and a
  // cleared right SHALL NOT look the same").
  assert.equal(rightsState(metric('a', cleared)), 'cleared');
  assert.equal(rightsState(metric('b', { ...cleared, outcome: 'refused' })), 'refused');
  assert.equal(rightsState(metric('c', { ...cleared, outcome: 'unresolved' })), 'unresolved');
  assert.equal(rightsState(metric('d')), 'undeclared');
  assert.equal(rightsState(metric('e', null)), 'undeclared');

  assert.equal(isCleared(metric('a', cleared)), true);
  for (const state of ['refused', 'unresolved']) assert.equal(isCleared(metric('x', { ...cleared, outcome: state })), false, state);
  assert.equal(isCleared(metric('y')), false, 'an unanswered question does not read as a cleared one');
});

test('only cleared metrics reach the set a surface may print values from', () => {
  const registry = {
    frontier: {
      metrics: [metric('yes', cleared), metric('no', { ...cleared, outcome: 'unresolved' }), metric('silent')],
      row_exclusions: [],
    },
  };
  assert.deepEqual([...clearedMetricIds(registry)], ['yes']);
  assert.deepEqual(metricsAwaitingDecision(registry).map((m) => m.id), ['silent']);
});

test('a row is excluded only by a declared pattern, and a normal row id is not', () => {
  const exclusions = [
    { id_contains: ':', reason: 'service variant', decided_on: '2026-09-06', note: 'measured' },
    { id_prefix: 'openrouter/', reason: 'router pseudo-row', decided_on: '2026-09-06', note: 'measured' },
  ];
  assert.equal(isRowExcluded('anthropic/claude-opus-5:batch', exclusions), true);
  assert.equal(isRowExcluded('qwen/qwen3.8-max:free', exclusions), true);
  assert.equal(isRowExcluded('openrouter/auto', exclusions), true);
  // The half that keeps the check from being a filter that eats the board: a
  // distinct listed model matches neither pattern and stays eligible.
  assert.equal(isRowExcluded('anthropic/claude-opus-5', exclusions), false);
  assert.equal(isRowExcluded('qwen/qwen3.8-max', exclusions), false);
  // A prefix is a PREFIX, not a substring: a vendor whose name merely contains
  // the pattern is not the platform's own router.
  assert.equal(isRowExcluded('notopenrouter/model', exclusions), false);
  assert.equal(isRowExcluded('anything', []), false);
});

test('the build reports a metric with no republication decision, by name', async () => {
  const said = [];
  const write = (s) => said.push(s);

  await frontierMetricsReportStep({ registry: { frontier: { metrics: [], row_exclusions: [] } }, write });
  assert.match(said.at(-1), /no index metric is registered; no index value renders anywhere/);

  await frontierMetricsReportStep({ registry: { frontier: { metrics: [metric('a', cleared)] } }, write });
  assert.match(said.at(-1), /1 declared, 1 with republication rights cleared; every declared metric carries a decision/);

  await frontierMetricsReportStep({ registry: { frontier: { metrics: [metric('a', cleared), metric('owed')] } }, write });
  assert.match(said.at(-1), /2 declared, 1 with republication rights cleared/);
  assert.match(said.at(-1), /1 carry NO republication decision/);
  assert.match(said.at(-1), /not permitted by default \(owed\)/, 'the report names which metric owes an answer');
});
