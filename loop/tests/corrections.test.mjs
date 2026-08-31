/**
 * corrections.test.mjs — beads addictedtoai-4fo: is a review record's front
 * matter append-only history, or a live claim?
 *
 * Decided: HISTORY. `would-cite` is a dated, own-words answer a reviewer gives
 * once; nothing in this repository re-checks it against later facts (measured:
 * `mergeGate` and `scripts/verify-launch.mjs` both check it only for
 * emptiness and exact-duplicate text against OTHER records, never against the
 * world). What was missing was a correctable path that does not destroy what
 * was originally approved. `corrections:` is that path — the exact
 * `[{date, text}]` shape `lib/schema.mjs` already uses for `post.corrections`,
 * reused here rather than reinvented, so the site has one rule for "a dated
 * claim was later found wrong," not two that can drift apart.
 *
 * Three things are tested, mirroring carry.test.mjs's structure for the
 * sibling mechanism:
 *
 *  1. `parseCorrections` / `parseVerdict` read `corrections:` correctly, and
 *     reject a malformed entry rather than guessing what it meant.
 *  2. The merge gate refuses a record whose `corrections:` is malformed
 *     (`corrections-malformed`, a reissue code — the author's work is not at
 *     fault) and is silent about a well-formed one, in either direction.
 *  3. A well-formed `corrections:` block never rescues an otherwise-invalid
 *     record (a blank `would-cite` still refuses) and never breaks an
 *     otherwise-valid one.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';

import { parseCorrections, parseVerdict } from '../lib/verdict.mjs';
import { mergeGate, verdictPath, isReissueRefusal } from '../lib/review.mjs';
import { makeRepo } from './helpers.mjs';

const NOW = new Date('2026-08-31T12:00:00.000Z');

// ---------------------------------------------------------------------------
// parseCorrections — the pure parser
// ---------------------------------------------------------------------------

test('parseCorrections: absent or empty corrections: is legal and produces nothing, not a warning', () => {
  assert.deepEqual(parseCorrections({}), { corrections: [], correctionWarnings: [] });
  assert.deepEqual(parseCorrections({ corrections: null }), { corrections: [], correctionWarnings: [] });
  assert.deepEqual(parseCorrections({ corrections: [] }), { corrections: [], correctionWarnings: [] });
});

test('parseCorrections: a well-formed entry is read whole', () => {
  const { corrections, correctionWarnings } = parseCorrections({
    corrections: [{ date: '2026-08-31', text: 'The would-cite above is stale; see the recheck below.' }],
  });
  assert.deepEqual(correctionWarnings, []);
  assert.equal(corrections.length, 1);
  assert.equal(corrections[0].date, '2026-08-31');
  assert.equal(corrections[0].text, 'The would-cite above is stale; see the recheck below.');
});

test('parseCorrections: a single mapping (not a list) is accepted the same way a list of one would be', () => {
  const { corrections } = parseCorrections({ corrections: { date: '2026-08-31', text: 'one entry' } });
  assert.equal(corrections.length, 1);
  assert.equal(corrections[0].text, 'one entry');
});

test('parseCorrections: a non-ISO or missing date is skipped and warned about, never falls back to today', () => {
  for (const bad of ['', 'August 31 2026', '2026/08/31', '2026-8-31']) {
    const { corrections, correctionWarnings } = parseCorrections({ corrections: [{ date: bad, text: 'x' }] });
    assert.deepEqual(corrections, [], `date ${JSON.stringify(bad)} should be rejected`);
    assert.match(correctionWarnings[0], /not an ISO date/);
  }
});

test('parseCorrections: a missing or empty text is skipped and warned about', () => {
  const { corrections, correctionWarnings } = parseCorrections({ corrections: [{ date: '2026-08-31' }] });
  assert.deepEqual(corrections, []);
  assert.match(correctionWarnings[0], /2026-08-31/);
  assert.match(correctionWarnings[0], /no non-empty `text`/);
});

test('parseCorrections: one bad entry among good ones is skipped without discarding the rest', () => {
  const { corrections, correctionWarnings } = parseCorrections({
    corrections: [
      { date: '2026-08-30', text: 'good one' },
      { date: 'not-a-date', text: 'bad one' },
      { date: '2026-08-31', text: 'also good' },
    ],
  });
  assert.deepEqual(corrections.map((c) => c.text), ['good one', 'also good']);
  assert.equal(correctionWarnings.length, 1);
});

test('parseCorrections: a non-mapping entry (a bare string) is skipped and warned about', () => {
  const { corrections, correctionWarnings } = parseCorrections({ corrections: ['just a string, not a mapping'] });
  assert.deepEqual(corrections, []);
  assert.match(correctionWarnings[0], /not a mapping/);
});

// ---------------------------------------------------------------------------
// parseVerdict — the whole record, front matter only (no plain-text fallback,
// same restriction as carry: and for the same reason)
// ---------------------------------------------------------------------------

test('parseVerdict carries corrections: and correctionWarnings alongside the existing fields, and leaves would-cite untouched', () => {
  const text =
    '---\nverdict: approve\nwould-cite: "the original, unedited sentence"\ncorrections:\n' +
    '  - date: "2026-08-31"\n    text: "the figure above is now known wrong"\n---\n\nnotes\n';
  const v = parseVerdict(text);
  assert.equal(v.verdict, 'approve');
  assert.equal(v.wouldCite, 'the original, unedited sentence', 'the field itself is never rewritten');
  assert.equal(v.corrections.length, 1);
  assert.equal(v.corrections[0].date, '2026-08-31');
  assert.deepEqual(v.correctionWarnings, []);
});

test('parseVerdict: a record with no corrections: key at all parses with an empty list, same as before this field existed', () => {
  const v = parseVerdict('---\nverdict: approve\nwould-cite: "someone"\n---\n\nnotes\n');
  assert.deepEqual(v.corrections, []);
  assert.deepEqual(v.correctionWarnings, []);
});

test('parseVerdict: the plain-text fallback (no front matter) never invents a corrections list', () => {
  const v = parseVerdict('Verdict: approve\nwould-cite: someone\ncorrections: something\n');
  assert.equal(v.verdict, 'approve');
  assert.deepEqual(v.corrections, []);
});

// ---------------------------------------------------------------------------
// mergeGate — corrections: must never rescue an invalid record, and a
// malformed one refuses on its own, as a reissue code
// ---------------------------------------------------------------------------

function writeRecordAt(ctx, jobId, front, notes = 'reviewer notes\n') {
  mkdirSync(ctx.reviewsDir, { recursive: true });
  const p = verdictPath(ctx, jobId, 1);
  writeFileSync(p, `---\njob: ${jobId}\n${front}---\n\n${notes}`, 'utf8');
  return p;
}

test('a well-formed corrections: block does not affect the merge gate, in either direction', () => {
  const ctx = makeRepo({ now: () => NOW });

  writeRecordAt(
    ctx,
    'j-corr-ok',
    'verdict: approve\nwould-cite: "someone arguing X"\ncorrections:\n  - date: "2026-08-31"\n    text: "amended"\n',
  );
  assert.equal(mergeGate(ctx, { jobId: 'j-corr-ok', type: 'machinery' }).ok, true);

  // A blank would-cite still refuses, corrections: block or not — the field
  // cannot rescue an otherwise-invalid record.
  writeRecordAt(
    ctx,
    'j-corr-blank-cite',
    'verdict: approve\nwould-cite: ""\ncorrections:\n  - date: "2026-08-31"\n    text: "amended"\n',
  );
  const g = mergeGate(ctx, { jobId: 'j-corr-blank-cite', type: 'post' });
  assert.equal(g.ok, false);
  assert.equal(g.code, 'would-cite-empty');

  ctx.cleanup();
});

test('a malformed corrections: entry refuses the merge with a reissue code, naming the problem', () => {
  const ctx = makeRepo({ now: () => NOW });
  writeRecordAt(
    ctx,
    'j-corr-bad',
    'verdict: approve\nwould-cite: "fine"\ncorrections:\n  - date: "not a date"\n    text: "amended"\n',
  );
  const g = mergeGate(ctx, { jobId: 'j-corr-bad', type: 'machinery' });
  assert.equal(g.ok, false);
  assert.equal(g.code, 'corrections-malformed');
  assert.match(g.reason, /not an ISO date/);
  assert.equal(isReissueRefusal(g.code), true, 'a reviewer clerical slip, not a defect in the work under review');
  ctx.cleanup();
});
