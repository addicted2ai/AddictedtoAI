/**
 * frontier.test.mjs — the two /frontier elements whose empty state must be a
 * LOOKUP that came back empty rather than a picture of one
 * (`separate-a-claim-from-a-fact` task 26).
 *
 * specs/pulse: "A test SHALL populate a cleared metric in a fixture and assert
 * the same renderer produces the value — an assertion that a renderer *is* empty
 * proves nothing about whether it can stop being empty."
 *
 * The defect this is written against shipped: a cell renderer that ignored both
 * its arguments and returned the same string, so no data could ever have filled
 * the board (`loops/ui-loop/graph/knowledge/implementer-ledger.md` row 6). Every
 * assertion below that the element is empty is paired with one that the SAME
 * function fills it from a fixture.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { renderIndexLeaders, renderLeadChangeStrip } from './frontier.mjs';

const METRIC = {
  id: 'fixture-index',
  field: 'fixture_index',
  label: 'Fixture Index',
  publisher: 'Fixture Analysis',
  publisher_url: 'https://fixture.invalid/',
  republisher: 'Fixture Router',
  source: 'models',
  path: 'benchmarks.idx',
  direction: 'higher',
  snapshot_date: '2026-09-05',
  leaders: [{ row_id: 'acme/three', entry_id: 'model/acme-three', display_name: 'Acme Three', value: 90 }],
  ranked: [
    { row_id: 'acme/three', entry_id: 'model/acme-three', display_name: 'Acme Three', value: 90 },
    { row_id: 'acme/one', entry_id: null, display_name: 'Acme One', value: 50 },
  ],
  counts: { rows_total: 5, rows_excluded: 2, rows_without_value: 0, rows_eligible: 2 },
};

const POPULATED = { snapshot_date: '2026-09-05', metrics: [METRIC] };
const EMPTY = { snapshot_date: '2026-09-05', metrics: [] };

test('the index element is empty when nothing is registered — and the file is still looked up', () => {
  assert.equal(renderIndexLeaders(EMPTY, new Set()), '');
  // The shapes a missing or half-written file can take. None of them is an
  // exception, and none of them is a placeholder string.
  assert.equal(renderIndexLeaders(undefined, new Set()), '');
  assert.equal(renderIndexLeaders({ snapshot_date: null, metrics: [] }, undefined), '');
});

test('a registered metric whose rights are NOT cleared prints no value', () => {
  // The data is there and the leader is computed; what is missing is the
  // permission. This is today's real state for both live candidates
  // (addictedtoai-ego8, addictedtoai-c563).
  const html = renderIndexLeaders(POPULATED, new Set());
  assert.equal(html, '', 'registered is not cleared, and only cleared may print');
  assert.equal(renderIndexLeaders(POPULATED, new Set(['some-other-metric'])), '', 'and the gate is per metric id');
});

test('THE SAME renderer produces the value once the fixture clears the metric', () => {
  // The assertion the requirement exists for: nothing about this call differs
  // from the one above except the registry's answer.
  const html = renderIndexLeaders(POPULATED, new Set(['fixture-index']));
  assert.notEqual(html, '', 'the empty state above was the result of the lookup, not a constant in the template');
  assert.match(html, /Fixture Index/, 'the metric label');
  assert.match(html, /Acme Three 90/, 'the leader and its value');
  // The strongest claim the data supports, and no stronger.
  assert.match(html, /published by Fixture Analysis/);
  assert.match(html, /republished by Fixture Router/);
  assert.match(html, /read in the snapshot of 2026-09-05/);
  assert.equal(/measured on|as of today|benchmark date/i.test(html), false, 'no measurement date the data does not carry');
  assert.match(html, /data-derived="frontier-index"/, 'every number sits inside the data-derived fence');
});

test('every tied row is a leader, and the surface says they are tied', () => {
  const tied = {
    ...POPULATED,
    metrics: [
      {
        ...METRIC,
        leaders: [
          { row_id: 'acme/one', display_name: 'Acme One', value: 90 },
          { row_id: 'acme/three', display_name: 'Acme Three', value: 90 },
        ],
      },
    ],
  };
  const html = renderIndexLeaders(tied, new Set(['fixture-index']));
  assert.match(html, /tied: Acme One 90, Acme Three 90/, 'no tie-break invents an order');
});

test('a metric with no leader at all contributes no element', () => {
  const barren = { ...POPULATED, metrics: [{ ...METRIC, leaders: [], ranked: [] }] };
  assert.equal(renderIndexLeaders(barren, new Set(['fixture-index'])), '', 'cleared rights over no data is still no value');
});

const LEAD_LINE = {
  key: 'models|aaaa|bbbb|fixture-index|lead-change',
  date: '2026-09-05',
  kind: 'lead-change',
  source: 'models',
  row_id: 'acme/three',
  display_name: 'Acme Three',
  metric: 'fixture-index',
  metric_label: 'Fixture Index',
  publisher: 'Fixture Analysis',
  cause: 'arrival',
  incoming: [{ row_id: 'acme/three', display_name: 'Acme Three', value: 90 }],
  outgoing: [{ row_id: 'acme/one', display_name: 'Acme One', value: 50 }],
};

test('the lead-change strip is empty only because no line exists', () => {
  const empty = renderLeadChangeStrip([]);
  assert.match(empty, /No lead change recorded yet/);
  // Lines of other kinds are not lead changes, so the empty state survives a
  // feed full of them — which is what makes the next test meaningful.
  assert.match(renderLeadChangeStrip([{ kind: 'arrival', date: '2026-09-05' }]), /No lead change recorded yet/);
});

test('THE SAME strip renders a real lead change, stating the event and no value', () => {
  const html = renderLeadChangeStrip([LEAD_LINE]);
  assert.equal(/No lead change recorded yet/.test(html), false);
  assert.match(html, /2026-09-05/, "the snapshot's own date");
  assert.match(html, /Acme Three/, 'the incoming leader, by its own name');
  assert.match(html, /lead changed on Fixture Index/, 'the event, named for the index it happened on');
  assert.match(html, /Fixture Analysis/, 'the publisher');

  // K24: no index VALUE renders until the metric is registered AND cleared —
  // and no metric is cleared here. The line CARRIES the values (recording is
  // not rendering); the strip prints none of them, no rank and no ratio.
  assert.equal(html.includes('90'), false, 'the incoming leader value is on the line and not on the page');
  assert.equal(html.includes('50'), false, 'nor the outgoing one');

  // It reads raw `changes.jsonl` lines, which is what the page hands it. This
  // is the regression the fix was for: `detail` and `title` exist only on a
  // resolved feed item, so the strip printed a bare date for a real line.
  assert.equal(LEAD_LINE.detail, undefined);
  assert.equal(LEAD_LINE.title, undefined);
});

test('a seeded lead change says it was recovered from the archive', () => {
  // specs/pulse: the record begins where observation began, and its limits are
  // stated on the surface rather than implied.
  assert.match(renderLeadChangeStrip([{ ...LEAD_LINE, seeded: true }]), /seeded from the archive/);
  assert.equal(/seeded from the archive/.test(renderLeadChangeStrip([LEAD_LINE])), false, 'and an observed one does not');
});

test('the strip shows the most recent lead changes first', () => {
  const older = { ...LEAD_LINE, key: 'k2', date: '2026-08-01', display_name: 'Acme One' };
  const html = renderLeadChangeStrip([older, LEAD_LINE]);
  assert.ok(html.indexOf('2026-09-05') < html.indexOf('2026-08-01'), 'newest first');
});
