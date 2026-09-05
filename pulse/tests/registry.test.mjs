/**
 * registry.test.mjs — task 3.1: the checked-in source registry.
 *
 * These assertions are about the real `data/sources/registry.json`, not a
 * fixture: the launch registry is a data artifact this change is responsible
 * for, and its shape is what the rest of the Pulse relies on.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadRegistry, findSource } from '../lib/registry.mjs';
import { cleanup, makeRoot } from './helpers.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

test('the launch registry parses and declares both launch sources', () => {
  const registry = loadRegistry(ROOT);
  const ids = registry.sources.map((s) => s.id).sort();
  assert.deepEqual(ids, ['llm-releases', 'openrouter-models']);
});

test('every source carries a dated verification result and a dated robots check', () => {
  const registry = loadRegistry(ROOT);
  for (const s of registry.sources) {
    assert.match(s.verification.date, /^\d{4}-\d{2}-\d{2}$/, `${s.id}: verification date`);
    assert.ok(s.verification.result, `${s.id}: verification result`);
    assert.ok(s.verification.detail, `${s.id}: what the verification actually observed`);
    assert.match(s.robots.checked_on, /^\d{4}-\d{2}-\d{2}$/, `${s.id}: robots check date`);
    assert.equal(s.robots.result, 'allowed', `${s.id}: robots/terms result`);
    assert.ok(s.row_id_field, `${s.id}: which field is the row id`);
    assert.ok(Number.isFinite(s.fetch_every_days), `${s.id}: fetch cadence`);
    assert.ok(Number.isFinite(s.expected_change_days), `${s.id}: expected change cadence`);
    assert.ok(Array.isArray(s.yields) && s.yields.length > 0, `${s.id}: what it yields`);
  }
});

test('exactly one launch source mints, and it mints models', () => {
  // Design D7: "One minting source, deliberately, so cross-source duplicate
  // stubs cannot arise at launch."
  const registry = loadRegistry(ROOT);
  const minting = registry.sources.filter((s) => s.mints);
  assert.equal(minting.length, 1);
  assert.equal(minting[0].id, 'openrouter-models');
  assert.equal(minting[0].mints.kind, 'model');
  assert.equal(findSource(registry, 'llm-releases').mints, null, 'the release tracker is non-minting');
});

test('the release tracker is marked as a rolling window and never reports removals', () => {
  // Its feed carries the most recent items only. Treating a rolled-off item
  // as a retirement would put a false lifecycle event on the changed feed.
  const s = findSource(loadRegistry(ROOT), 'llm-releases');
  assert.equal(s.rolling_window, true);
  assert.equal(s.emit_on_remove, false);
  assert.ok(s.seeds, 'and it is the source the launch feed is seeded from');
});

test('the registry guards reject an undeclared source, naming what is missing', () => {
  const complete = {
    id: 'x',
    url: 'https://x.invalid',
    format: 'json',
    rows_path: 'data',
    row_id_field: 'id',
    fetch_every_days: 1,
    expected_change_days: 3,
    robots: { checked_on: '2026-08-28', result: 'allowed' },
    verification: { date: '2026-08-28', result: 'live' },
  };

  const loadWith = (source) => {
    const root = makeRoot([source]);
    try {
      loadRegistry(root);
      return null;
    } catch (err) {
      return err.message;
    } finally {
      cleanup(root);
    }
  };

  assert.equal(loadWith(complete), null, 'a complete source loads');

  const cases = [
    ['robots', /missing "robots" check/],
    ['verification', /missing "verification"/],
    ['expected_change_days', /missing numeric "expected_change_days"/],
    ['row_id_field', /missing "row_id_field"/],
    ['rows_path', /json format needs "rows_path"/],
  ];
  for (const [field, pattern] of cases) {
    const broken = { ...complete };
    delete broken[field];
    const message = loadWith(broken);
    assert.ok(message, `removing ${field} must be rejected`);
    assert.match(message, pattern);
    assert.match(message, /source "x"/, 'and the error names the source');
  }

  const badMint = { ...complete, mints: { kind: 'model', slug_from: 'display_name' } };
  assert.match(loadWith(badMint), /must be "row_id"/, 'a slug derived from anything but the row id is refused');
});

test("OpenRouter's artificial_analysis block is recorded as seen and deliberately not carried", () => {
  // The third state `material_fields_note` does not cover: a path in neither
  // `material_fields` nor `declined_fields` is UNDECIDED, and from the outside
  // that is indistinguishable from a refusal. This asserts the decision exists
  // as data, not only as prose.
  const s = findSource(loadRegistry(ROOT), 'openrouter-models');
  const declined = (s.declined_fields ?? []).find((d) => d.path === 'benchmarks.artificial_analysis');
  assert.ok(declined, 'the block carries a recorded decision');
  assert.equal(declined.decision, 'not carried');
  assert.match(declined.decided_on, /^\d{4}-\d{2}-\d{2}$/, 'and the decision is dated');
  assert.ok(declined.note.length > 200, 'and the measurement behind it travels with it');

  // Seen, not overlooked: it is in the field inventory the spec calls
  // "what fields it yields", and out of every carrying list.
  assert.ok(
    s.yields.some((y) => y.startsWith('benchmarks.artificial_analysis.')),
    'the source is recorded as serving it',
  );
  for (const spec of s.material_fields) {
    assert.ok(!String(spec.path).startsWith('benchmarks'), `${spec.field} must not carry it as a column or a fact`);
  }
});

test('a field cannot be both declined and carried, and a refusal must carry a dated reason', () => {
  const base = {
    id: 'x',
    url: 'https://x.invalid',
    format: 'json',
    rows_path: 'data',
    row_id_field: 'id',
    fetch_every_days: 1,
    expected_change_days: 3,
    robots: { checked_on: '2026-08-28', result: 'allowed' },
    verification: { date: '2026-08-28', result: 'live' },
    material_fields: [{ field: 'score', path: 'benchmarks.artificial_analysis.coding_index' }],
  };
  const good = {
    path: 'benchmarks.design_arena',
    decision: 'not carried',
    decided_on: '2026-09-05',
    note: 'measured, and here is the measurement',
  };

  const loadWith = (declined_fields, source = base) => {
    const root = makeRoot([{ ...source, declined_fields }]);
    try {
      loadRegistry(root);
      return null;
    } catch (err) {
      return err.message;
    } finally {
      cleanup(root);
    }
  };

  assert.equal(loadWith([good]), null, 'a well-formed refusal of an uncarried path loads');

  // Attempt what the guard forbids: declare the carried path refused. Either
  // direction of prefix overlap is the same contradiction.
  const collide = { ...good, path: 'benchmarks.artificial_analysis' };
  assert.match(loadWith([collide]), /declined and also carried/, 'a parent of a carried path is refused');
  assert.match(loadWith([collide]), /source "x"/, 'and the error names the source');
  const exact = { ...good, path: 'benchmarks.artificial_analysis.coding_index' };
  assert.match(loadWith([exact]), /declined and also carried/, 'and so is the exact path');

  // A refusal recorded where it cannot be enacted is not a decision.
  assert.match(loadWith([{ ...good, decision: 'column' }]), /only legal value/, 'no verdict but "not carried"');
  assert.match(loadWith([{ ...good, decision: undefined }]), /only legal value/, 'and it is required');

  // A refusal with no dated measurement is the undecided state wearing a label.
  assert.match(loadWith([{ ...good, note: '  ' }]), /needs a "note"/);
  assert.match(loadWith([{ ...good, note: undefined }]), /needs a "note"/);
  assert.match(loadWith([{ ...good, decided_on: '5 September' }]), /needs a "decided_on"/);
  assert.match(loadWith([{ ...good, decided_on: undefined }]), /needs a "decided_on"/);

  assert.match(loadWith([{ ...good, path: '' }]), /missing a string "path"/);
  assert.match(loadWith([good, { ...good }]), /declares "benchmarks.design_arena" twice/);
  assert.match(loadWith({ 'benchmarks.design_arena': 'no' }), /"declined_fields" must be an array/);
});
