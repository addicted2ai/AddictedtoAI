/**
 * brief-lint-records.test.mjs — the expiry wall now refuses.
 *
 * Phase 0 round 3 left twenty-four RECORD dispositions in
 * wisdom/phase-0-RESULT3.md section 5, each with an owner and an expiry date,
 * and nothing read those dates. This file is the thing that reads them.
 *
 * Layout: the records live HERE, beside the check, not in the linter. The
 * linter file stays byte-identical (append-only ruling); the refusal lives
 * here so existing checks keep their verdicts on existing fixtures. Of the
 * two layout properties the brief allows, this chooses the second: deleting
 * an arm does NOT take its record with it — the anchor assertion below
 * notices and fails instead. Co-location would need edits scattered through
 * the linter, which the append-only ruling forbids.
 *
 * Anchoring: each record pins its arm by a content substring plus an expected
 * occurrence count, never by line number. Line pins went stale in under three
 * hours (all twenty-four moved when the change-root repair landed); content
 * survives renumbering and fails loudly when the arm text itself is edited or
 * removed, which is exactly when a re-decision is owed. Two arms share one
 * source span (instrument line, once line, check-6 line, revision lines), so
 * several records share one occurrence — the count is per anchor, and an edit
 * that breaks the span fails every record anchored on it, which is
 * conservative in the safe direction.
 *
 * Dates: bare ISO calendar dates, compared as strings (lexicographic equals
 * chronological for YYYY-MM-DD). The expiry day itself still passes; the day
 * after fails. Today is the machine local calendar date (local getters, never
 * UTC), matching the corpus convention. BRIEF_RECORDS_NOW pins the clock for
 * controls only; the gate runs without it and prints a notice whenever the
 * override is active, so a pinned pass can never read as a live pass.
 *
 * Count: twenty-four records. A future BIND or DELETE that retires a record
 * must update EXPECTED_COUNT in the same edit with its justification; a
 * silent deletion fails here first, which is the point.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');
const LINTER = resolve(REPO, 'scripts', 'brief-lint.mjs');
const SRC = readFileSync(LINTER, 'utf8');

const EXPECTED_COUNT = 24;

// Re-derived anchors (content substrings, never line numbers). Each was
// located in the current linter source by substring search; the expected
// count is the measured occurrence count there. See RESULT1.md section 4
// for the per-record derivation notes.
const RECORDS = [
  {
    id: 'B2',
    anchor: ".replace(/\\s*(\\.\\.\\.|…)$/, '')",
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "Only the leading strip has a twin. Trailing ellipsis (`> ... core`, `> core ...`) is symmetric and appears in real quoting (omission at either end). Removing the trailing strip would newly refuse trailing-ellipsis quotes that should stay green. Keep, revisit with a trailing-ellipsis twin if quoting style drifts.",
  },
  {
    id: 'B3',
    anchor: 'blob.length > 0',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-12-01',
    reason: "Real limit of the tree: no resolving empty task blob exists to cite without manufacturing history, and minting an empty-commit history would manufacture the world. Largely redundant (empty blob already fails via `bad >= 1` except the empty-quote edge where `blob.includes('')` holds vacuously). Keep as defence in depth; do not invent a fixture.",
  },
  {
    id: 'B6trim',
    anchor: "replace(/\\s+/g, ' ').trim()",
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "All verbatim fixtures are already trimmed. Padded quotes (leading/trailing spaces that normalise away) are plausible paste artifacts. Removing trim would newly refuse them. Keep.",
  },
  {
    id: 'C5i',
    anchor: '/enforced by|enforces/i',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "All fixtures lower-case. Upper-case enforcement sentences (`ENFORCED BY ...`) are plausible in headers and emphasis. Removing `i` would loosen (upper-case would pass uncaught). Keep.",
  },
  {
    id: 'C6lines',
    anchor: 'const instLines = prose.filter',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "All delegation fixtures are single-line. Delegation split across physical lines but one sentence (claim on one line, `find them and run them` on the next) is the wrapping defect already fixed once for this check; the sentence model is load-bearing. Changing prose to lines would reintroduce it. Keep.",
  },
  {
    id: 'C4',
    anchor: '(?:mjs|js|ps1|sh)',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "Fixtures use `.mjs` only. Enforcement claims naming existing non-`mjs` instruments (`.sh`, `.ps1`, `.js`) are plausible as the tree grows. Narrowing to `mjs` only would newly refuse them. Keep.",
  },
  {
    id: 'D5',
    anchor: '(?:—|-)',
    expect: 2,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "Fixtures use the em dash. Hyphen `-` is the ASCII fallback real briefs may type. Removing the hyphen arm would newly refuse hyphen bullets. Keep.",
  },
  {
    id: 'E2chg',
    anchor: 'change|changes',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "Only `Edit`/`Rewrite`/`Modify` have red twins. `Change ...` / `Changes ...` strays outside Files scope are plausible directives. Removing would loosen. Keep.",
  },
  {
    id: 'E3del',
    anchor: 'delete from',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "No twin uses `Delete ... from ...` (same holds for `add to\\|append to\\|write to\\|replace in\\|re-?pin`; each sampled arm survives, so the list as a whole is one-verb deep). Each names a plausible stray. Removing any would loosen. Keep; next sweep should sample another verb rather than all.",
  },
  {
    id: 'E5res',
    anchor: 'READ|reserved|leave',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "Only `Do not` is proven green (same holds for `must not\\|may not\\|forbidden\\|out of scope\\|read-only\\|READ\\|leave\\|without editing`; sampled arm survives). Each names a plausible prohibition sparing a stray. Removing would newly refuse such sparing. Keep; next sweep should sample another arm.",
  },
  {
    id: 'E7sfx',
    anchor: 'q.endsWith(p) || p.endsWith(q)',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "Fixtures are exact or fully distinct. Cited short path that is a suffix of a permitted long path (or vice versa) staying green is plausible (short cites of long permitted paths). Exact `q === p` would newly refuse them. Keep.",
  },
  {
    id: 'F3i',
    anchor: '/\\bonce\\b/i',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "No upper-case `ONCE` twin. Upper-case emphasis plausible. Removing `i` would loosen. Keep.",
  },
  {
    id: 'F4e',
    anchor: '/iteration|attempt/i',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "Fixtures lower-case. Upper-case exemption (`ITERATION`/`ATTEMPT`) plausible. Removing `i` would loosen (upper-case exemption would refuse). Keep.",
  },
  {
    id: 'F5b',
    anchor: '\\bonce\\b',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "No embedded-`once` green (letter-adjacent form). Removing boundaries would newly refuse embedded forms that should stay green. Keep.",
  },
  {
    id: 'F6lines',
    anchor: 'const onceBad = prose.filter',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "No wrap-split twin (`once` and qualifier on different physical lines). Wrapping is real; sentence model already fixed for this check. Keep.",
  },
  {
    id: 'G7hy',
    anchor: '[^A-Za-z0-9_-]',
    expect: 2,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "No hyphen-adjacent twin. Hyphen as part of word vs boundary is subtle; dropping hyphen from the class flips hyphen-adjacent outcomes. Keep.",
  },
  {
    id: 'G8sent',
    anchor: 'proseLines.filter((l) => /(^|',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "No wrapping twin for this check. Sentence normalisation vs physical lines matters where wrapping splits token context. Keep.",
  },
  {
    id: 'H2i',
    anchor: '/\\bsweep/i',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "No upper-case sweep twin (contrast the upper-case twin that binds the first pattern of check 6). Upper-case sweep plausible. Removing `i` would loosen. Keep.",
  },
  {
    id: 'H4dist',
    anchor: '{0,60}',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "No 60-char boundary twin (`every ... in this file` with exactly 60 chars between). Counting an exact 60-char gap is fiddly and low risk. Keep; boundary twin if the distance ever matters.",
  },
  {
    id: 'H6b',
    anchor: '\\bclass\\b',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "No embedded-`class` twin (e.g. `subclass` not satisfying the arm; sweep-only red does not isolate the boundary). Removing boundaries would newly treat embedded as satisfying (loosening). Keep.",
  },
  {
    id: 'I4star',
    anchor: 'RESULT\\d+',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "Bare still refused via `!bare`, so `\\\\d*` vs `\\\\d+` has no colour change. Binding needs a twin asserting `numbered=false` for the bare form, not just status. Low risk. Keep.",
  },
  {
    id: 'J2star',
    anchor: 'numberedReview = /\\bREVIEW\\d+',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "Same in the review branch via `!bareReview`. Needs detail assertion. Keep.",
  },
  {
    id: 'K5diff',
    anchor: '^[+-][^+-]',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "Packet diffs use single-`+` lines. Real diffs carry `+++`/`---` headers that must not count as changed lines. Removing the `[^+-]` exclusion would count headers (loosening thin diffs to green). Keep.",
  },
  {
    id: 'Nsplit',
    anchor: '(?<=[.;])',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "No semicolon-split delegation/qualifier twin. `;` does split sentences in real prose. Dropping `;` would join across it and change delegation/qualifier scope. Keep.",
  },
];

function localToday() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function pinnedNow() {
  const v = process.env.BRIEF_RECORDS_NOW;
  if (v && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return null;
}

function effectiveNow() {
  const p = pinnedNow();
  if (p) {
    console.log(`records check: pinned now ${p} (controls only; gate runs without override)`);
    return p;
  }
  return localToday();
}

function isExpired(rec, now) {
  return now > rec.expiry;
}

function countOccurrences(hay, needle) {
  if (!needle) return 0;
  let n = 0;
  let at = -1;
  while (true) {
    at = hay.indexOf(needle, at + 1);
    if (at < 0) break;
    n += 1;
  }
  return n;
}

function shapeErrors(rec, seen) {
  const errs = [];
  if (!rec.id || typeof rec.id !== 'string' || !rec.id.trim()) errs.push('id empty');
  else if (seen.has(rec.id)) errs.push(`duplicate id ${rec.id}`);
  if (!rec.anchor || typeof rec.anchor !== 'string' || rec.anchor.length === 0) errs.push(`anchor empty for ${rec.id}`);
  if (!Number.isInteger(rec.expect) || rec.expect < 1) errs.push(`expect bad for ${rec.id}`);
  if (!rec.owner || typeof rec.owner !== 'string' || !rec.owner.trim()) errs.push(`owner empty for ${rec.id}`);
  if (!rec.expiry || !/^\d{4}-\d{2}-\d{2}$/.test(rec.expiry)) errs.push(`expiry bad for ${rec.id}: ${rec.expiry}`);
  else {
    const parts = rec.expiry.split('-').map(Number);
    const dt = new Date(parts[0], parts[1] - 1, parts[2]);
    if (dt.getFullYear() !== parts[0] || dt.getMonth() + 1 !== parts[1] || dt.getDate() !== parts[2]) {
      errs.push(`expiry impossible for ${rec.id}: ${rec.expiry}`);
    }
  }
  if (!rec.reason || typeof rec.reason !== 'string' || !rec.reason.trim()) errs.push(`reason empty for ${rec.id}`);
  else if (!rec.reason.includes(' ')) errs.push(`reason single-token for ${rec.id}`);
  return errs;
}

/* Check A — anchors resolve. An edited, removed, or rewritten arm breaks its
   anchor count and fails here, which is when a re-decision is owed. */
test('records: every anchor resolves with its expected count', () => {
  const bad = [];
  for (const rec of RECORDS) {
    const got = countOccurrences(SRC, rec.anchor);
    if (got !== rec.expect) bad.push(`${rec.id}: anchor ${JSON.stringify(rec.anchor)} found ${got}x, want ${rec.expect}x`);
  }
  assert.equal(bad.length, 0, `stale anchors (arm moved, changed, or vanished — re-derive, re-decide):\n${bad.join('\n')}`);
});

/* Check E — expiries refuse. Hard fail: exit non-zero, gate red, push bar
   holds. The expiry day passes; the day after refuses. */
test('records: no record is expired', () => {
  const now = effectiveNow();
  const late = RECORDS.filter((rec) => isExpired(rec, now)).map(
    (rec) => `${rec.id} owned by ${rec.owner} expired ${rec.expiry} (now ${now}): ${rec.reason.slice(0, 80)}…`,
  );
  assert.equal(late.length, 0, `expired record judgements (re-sweep owed, new information required):\n${late.join('\n')}`);
});

/* Check S — shape. Fail-closed: an unparsable record refuses rather than
   passing silently. Count is pinned; retiring a record updates the count in
   the same edit with justification. */
test('records: shape holds and the count is twenty-four', () => {
  assert.equal(RECORDS.length, EXPECTED_COUNT, `record count ${RECORDS.length}, want ${EXPECTED_COUNT} (retire with justification, never by silent deletion)`);
  const seen = new Set();
  const bad = [];
  for (const rec of RECORDS) {
    for (const e of shapeErrors(rec, seen)) bad.push(e);
    if (rec.id) seen.add(rec.id);
  }
  assert.equal(bad.length, 0, `malformed records fail closed:\n${bad.join('\n')}`);
});

/* Controls, clock pinned. None of these read the live clock. */

test('records control: all green at pinned 2026-09-10', () => {
  const now = '2026-09-10';
  const late = RECORDS.filter((rec) => isExpired(rec, now));
  assert.equal(late.length, 0, `nothing expires before the batch date: ${late.map((r) => r.id).join(',')}`);
});

test('records control: batch expires at pinned 2026-10-11, outlier holds until 2026-12-02', () => {
  const batchAt = RECORDS.filter((rec) => isExpired(rec, '2026-10-11')).map((r) => r.id).sort();
  assert.equal(batchAt.length, 23, `want 23 expired at 2026-10-11, got ${batchAt.length}: ${batchAt.join(',')}`);
  assert.ok(!batchAt.includes('B3'), 'outlier B3 must not expire with the batch');
  const allAt = RECORDS.filter((rec) => isExpired(rec, '2026-12-02')).map((r) => r.id);
  assert.equal(allAt.length, 24, `want 24 expired at 2026-12-02, got ${allAt.length}`);
});

test('records control: expiry boundary day passes, next day refuses', () => {
  const sample = RECORDS.find((r) => r.id === 'B6trim');
  assert.equal(isExpired(sample, '2026-10-10'), false, 'expiry day itself passes');
  assert.equal(isExpired(sample, '2026-10-11'), true, 'day after refuses');
  const outlier = RECORDS.find((r) => r.id === 'B3');
  assert.equal(isExpired(outlier, '2026-12-01'), false, 'outlier expiry day passes');
  assert.equal(isExpired(outlier, '2026-12-02'), true, 'outlier day after refuses');
});

test('records control: pinned-now override is honored and visible', () => {
  const prev = process.env.BRIEF_RECORDS_NOW;
  try {
    process.env.BRIEF_RECORDS_NOW = '2026-10-11';
    assert.equal(effectiveNow(), '2026-10-11', 'override pins the clock');
  } finally {
    if (prev === undefined) delete process.env.BRIEF_RECORDS_NOW;
    else process.env.BRIEF_RECORDS_NOW = prev;
  }
  assert.equal(effectiveNow(), localToday(), 'without override the live local date rules');
});

test('records control: bogus anchor would refuse while real anchors hold', () => {
  const bogus = '__no_such_arm_xyz__';
  assert.equal(countOccurrences(SRC, bogus), 0, 'bogus anchor is absent, so its check would refuse');
  const sample = RECORDS.find((r) => r.id === 'E7sfx');
  assert.equal(countOccurrences(SRC, sample.anchor), sample.expect, 'real anchor holds its count');
});

test('records control: malformed twins fail shape while the vehicle holds', () => {
  const seen = new Set(RECORDS.map((r) => r.id));
  const vehicle = RECORDS[0];
  assert.deepEqual(shapeErrors({ ...vehicle, id: '__vehicle_ok__' }, new Set()), [], 'well-formed vehicle holds');
  const noOwner = { ...vehicle, id: '__twin_no_owner__', owner: '  ' };
  assert.ok(shapeErrors(noOwner, new Set()).some((e) => e.includes('owner empty')), 'empty owner refuses');
  const badDate = { ...vehicle, id: '__twin_bad_date__', expiry: '10 Oct 2026' };
  assert.ok(shapeErrors(badDate, new Set()).some((e) => e.includes('expiry bad')), 'unparsable expiry refuses');
  const noReason = { ...vehicle, id: '__twin_no_reason__', reason: '   ' };
  assert.ok(shapeErrors(noReason, new Set()).some((e) => e.includes('reason empty')), 'reason without content refuses');
  const noAnchor = { ...vehicle, id: '__twin_no_anchor__', anchor: '' };
  assert.ok(shapeErrors(noAnchor, new Set()).some((e) => e.includes('anchor empty')), 'anchor without content refuses');
  const dupe = { ...vehicle };
  assert.ok(shapeErrors(dupe, seen).some((e) => e.includes('duplicate id')), 'duplicate id refuses');
});
