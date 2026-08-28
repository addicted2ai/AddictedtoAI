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
