/**
 * frontier-metrics.test.mjs — the registry's `frontier` block as every consumer
 * reads it (`separate-a-claim-from-a-fact` task 22).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  clearedMetricIds,
  frontierBlock,
  frontierMetrics,
  frontierMetricsReport,
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

test('the build reports a metric with no republication decision, by name', () => {
  const said = [];
  const write = (s) => said.push(s);

  frontierMetricsReport({ frontier: { metrics: [], row_exclusions: [] } }, write);
  assert.match(said.at(-1), /no index metric is registered; no index value renders anywhere/);

  frontierMetricsReport({ frontier: { metrics: [metric('a', cleared)] } }, write);
  assert.match(said.at(-1), /1 declared, 1 with republication rights cleared; every declared metric carries a decision/);

  frontierMetricsReport({ frontier: { metrics: [metric('a', cleared), metric('owed')] } }, write);
  assert.match(said.at(-1), /2 declared, 1 with republication rights cleared/);
  assert.match(said.at(-1), /1 carry NO republication decision/);
  assert.match(said.at(-1), /not permitted by default \(owed\)/, 'the report names which metric owes an answer');
});

test('the report names the standing exposure the registry gate does NOT cover', () => {
  /*
   * The narrowing, said out loud. "No index value SHALL render on any surface
   * until its metric is registered and its republication decision records the
   * right as cleared" is true of the surfaces that read THIS registry, and false
   * of the corpus: model entries bind `benchmarks.artificial_analysis.*` as
   * `source: feed` facts and print those numbers in prose while Artificial
   * Analysis's rights are unanswered (addictedtoai-ego8). That path is measured
   * and ratcheted by `lib/declined-fields.mjs`; what was missing was the join, so
   * a reader of the requirement was entitled to believe the site prints no
   * unregistered index value anywhere.
   */
  const said = [];
  const write = (s) => said.push(s);

  frontierMetricsReport({ frontier: { metrics: [] } }, write, { bindings: 48, files: 29, issue: 'addictedtoai-226f' });
  assert.match(said.at(-1), /standing exposure: 48 fact binding\(s\) across 29 entry file\(s\)/);
  assert.match(said.at(-1), /binds surfaces that READ THE REGISTRY/, 'the sentence says what the gate covers, not only that a gap exists');
  assert.match(said.at(-1), /addictedtoai-226f/, 'and names the record the debt is tracked on');

  // THE CLEAN CASE IS STATED TOO, so "nothing binds a declined index path" is a
  // measurement this build made rather than an alarm that failed to sound —
  // without this the assertion above would pass on a report that printed the
  // exposure sentence unconditionally.
  frontierMetricsReport({ frontier: { metrics: [] } }, write, { bindings: 0, files: 0, issue: null });
  assert.equal(
    said.at(-1),
    'prebuild: frontier-metrics — standing exposure: no content file binds an index path the registry declines\n',
  );

  // And with no exposure measured at all the report says nothing about one,
  // rather than inventing a zero it did not measure.
  const before = said.length;
  frontierMetricsReport({ frontier: { metrics: [] } }, write);
  assert.equal(said.length - before, 1, 'one line, the metric count; no exposure sentence is fabricated');
});

test('the prebuild registers the report as a step, and hands it the measured exposure', () => {
  // Same reason as `change-kinds`: the requirement is about the BUILD. Deleting
  // this STEPS entry leaves the whole suite green, so the registration is
  // asserted as one fact — the name bound to the function that runs it.
  const prebuild = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'prebuild.mjs'), 'utf8');
  assert.match(
    prebuild,
    /name:\s*'frontier-metrics',\s*run:[^}]*frontierMetricsReport/,
    "the STEPS entry binds the name 'frontier-metrics' to frontierMetricsReport",
  );
  assert.match(
    prebuild,
    /frontierMetricsReport\([^)]*\)?[^;]*debtExposure/,
    'and passes the measured declined-binding debt, so the report names the exposure its own gate does not cover',
  );
});
