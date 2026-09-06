/**
 * change-kinds.test.mjs — the write-side refusal, and what a `lead-change` line
 * does NOT do (`separate-a-claim-from-a-fact` tasks 19 and 21).
 *
 * specs/pulse: "The Pulse SHALL **refuse to append** a line whose kind is not a
 * member, naming the kind and the caller. This is the point the mistake is
 * made, and a refusal there costs a failing test rather than a corrupt
 * history." And: "`lead-change` lines SHALL NOT produce `interpret` work ...
 * This SHALL be asserted by a test rather than left true by the current
 * filter's incidental shape."
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { cleanup, makeRoot, paths, readJson, readLines, runPulse } from './helpers.mjs';
import { appendChanges } from '../lib/diff.mjs';

const ARGS = ['--no-build', '--no-mint', '--offline'];
const NOW = { PULSE_NOW: '2026-08-28' };

function line(extra) {
  return {
    key: 'k',
    date: '2026-08-25',
    source: 'models',
    source_url: 'https://fixture.invalid/m',
    row_id: 'acme/one',
    field: null,
    old: null,
    new: null,
    ...extra,
  };
}

test('appendChanges refuses an undeclared kind, naming it, and writes nothing', (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  const file = paths.changes(root);

  assert.throws(
    () =>
      appendChanges(file, [
        line({ key: 'good', kind: 'arrival' }),
        line({ key: 'bad', kind: 'leadchange' }),
      ]),
    (err) => {
      assert.match(err.message, /"leadchange"/, 'the message names the kind that was refused');
      assert.match(err.message, /"bad"/, 'and the key, which is what identifies the candidate that carried it');
      assert.match(err.message, /"models"/, 'and the source, which is what identifies the caller');
      assert.match(err.message, /lead-change/, 'and the closed list, so the reader sees the near miss');
      return true;
    },
  );

  // Nothing at all is written — not even the well-formed candidate ahead of the
  // bad one. A partial append would leave the run reporting success over a
  // history that is missing a line nobody will look for again.
  assert.equal(existsSync(file) ? readFileSync(file, 'utf8') : '', '', 'the refusal appends nothing');
});

test('appendChanges accepts lead-change, because it is a declared member', (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  const file = paths.changes(root);
  const written = appendChanges(file, [line({ key: 'lc', kind: 'lead-change', metric: 'm' })]);
  assert.equal(written.length, 1);
  assert.equal(readLines(file)[0].kind, 'lead-change');
});

test('a lead-change line inside the trailing window produces no interpret item', async (t) => {
  // True today by the shape of `uninterpretedChanges`' filter (`kind !==
  // 'field_change'`), which is exactly why the spec asks for the assertion: a
  // filter's incidental shape is not a decision until something measures it.
  // The control line is what proves the fixture is inside the window and the
  // queue is producing interpret work at all — an assertion that a lead change
  // files nothing would otherwise pass on a queue that files nothing ever.
  const root = makeRoot([]);
  t.after(() => cleanup(root));

  const lines = [
    {
      key: 'lead|a|b|aa-intelligence|lead-change',
      date: '2026-08-25',
      kind: 'lead-change',
      source: 'models',
      source_url: 'https://fixture.invalid/m',
      row_id: 'acme/two',
      metric: 'aa-intelligence',
      metric_label: 'Intelligence Index',
      publisher: 'Fixture Analysis',
      cause: 'arrival',
      field: null,
      old: null,
      new: null,
    },
    {
      key: 'control',
      date: '2026-08-25',
      kind: 'field_change',
      source: 'models',
      source_url: 'https://fixture.invalid/m',
      row_id: 'acme/one',
      field: 'price_input',
      old: '1',
      new: '2',
    },
  ];
  writeFileSync(paths.changes(root), lines.map((l) => JSON.stringify(l)).join('\n') + '\n', 'utf8');

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const items = readJson(paths.queue(root)).items.filter((i) => i.type === 'interpret');
  assert.deepEqual(
    items.map((i) => i.subject),
    ['control'],
    'the price change is interpreted; the lead change is an event the site states outright, not a movement needing one',
  );
});
