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
 * after fails. Today is the machine system local calendar date via a fresh
 * child whose environment carries no caller zone override, never UTC,
 * matching the corpus convention. BRIEF_RECORDS_NOW pins the clock for
 * controls only; the live expiry check ignores the pin entirely and always
 * reads the system local date, so a pinned pass can never green the live wall.
 * The pin stays available to the controls, which need day-independence. A
 * caller zone override cannot green the live wall at one stroke: the child
 * strips it, so the live verdict is a function of this file plus the machine
 * real calendar only. What remains in the source, said plainly as required:
 * the machine clock remains (allowed — time passing is the real calendar the
 * wall is a function of) and the machine system zone remains (local dates are
 * zone-dependent by corpus convention and UTC conversion is forbidden, so a
 * system zone change moves the wall; the repo-wide zone dependence is filed
 * separately and this file does not touch it).
 *
 * Round 2 ruling: a RECORD without a twin by its date is debt, not a
 * disposition. Anchors pin substrings but cannot pin behaviour (flags,
 * operators, added or dropped conjuncts, upstream definitions, sibling arms,
 * call sites that bypass a definition); do not lengthen them. The date is a
 * deadline for work (a behaviour twin), for deletion, or for a written
 * reason why neither happened — not a re-decision prompt. This round builds
 * one twin and binds the mechanism itself.
 *
 * Round 3: the class was restated wider as any outside state that changes a
 * verdict without this file being edited. The zone override is the floor.
 * The live wall now reads the system local date via a stripped child, so the
 * caller override is ignored. Two furniture controls are bound (local date
 * sanity via an independent read; duplicate detection via the shared shape
 * path). Field ties: identity to arm plus count is pinned by a second map;
 * owner presence stays checkable but owner suitability and reason prose have
 * no mechanisable tie and stay with review, said plainly below. Detail-line
 * twins bind the two star arms against the printed detail (status alone
 * cannot, since either conjunct alone refuses the same input); both bind, so
 * both RECORDs retire here with this justification, count 24 to 22.
 *
 * Count: see EXPECTED_COUNT; the number is not repeated here so it cannot drift. Retired I4star and J2star by detail-line twins
 * (see twin section): each twin asserts the printed detail for the bare form
 * (numbered false), and flipping its arm to the star form flips the detail to
 * true while status stays refusing, so the twin binds the arm and the RECORD
 * is debt paid. A future BIND or DELETE that retires a record must update
 * EXPECTED_COUNT and EXPECTED_IDS in the same edit with its justification; a
 * silent deletion fails here first, which is the point. Every refusal names
 * the record or records responsible, never only a count.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');
const LINTER = resolve(REPO, 'scripts', 'brief-lint.mjs');
const SRC = readFileSync(LINTER, 'utf8');

const EXPECTED_COUNT = 22;

// The identity of the wall. The count pin alone reports a number;
// the identity pin names the thing, so a deletion is accused rather than
// inferred. A future BIND or DELETE updates this list with its justification
// in the same edit that updates EXPECTED_COUNT. Round 3 retires I4star and
// J2star by detail-line twins (both bind, see twin section), 24 to 22 here.
const EXPECTED_IDS = [
  'B2', 'B3', 'B6trim', 'C5i', 'C6lines', 'C4', 'D5', 'E2chg', 'E3del',
  'E5res', 'E7sfx', 'F3i', 'F4e', 'F5b', 'F6lines', 'G7hy', 'G8sent',
  'H2i', 'H4dist', 'H6b', 'K5diff', 'Nsplit',
];

// The batch that shares one expiry. B3 is the outlier with its own later
// date. Pinning the batch identity lets the batch control name the absent
// record instead of listing survivors for inference.
const EXPECTED_BATCH_IDS = EXPECTED_IDS.filter((id) => id !== 'B3');

// The identity-to-arm tie: for each identity, the pinned arm substring plus
// its expected count. Anchor counts alone cannot tell that a record still
// points at the arm its own identity claims: swapping two identities between
// two records of the same batch, or moving one anchor plus its count together
// to a different arm at the same count, keeps every count green while the
// record guards the wrong arm. This second map names the arm per identity, so
// such a move fails here. It duplicates the substrings on purpose (a second
// source, like the count and identity pins); it does not lengthen them.
// Owner and reason have no such tie, said plainly: owner presence is checked
// but no roster exists in the tree to judge suitability, and a tie between a
// record and its own prose is not mechanisable — filler with a space passes
// shape, and pretending otherwise would be worse than the gap. A reader is
// therefore trusting review for those two, and mechanism for this one.
const EXPECTED_ANCHOR_FOR_ID = {
  B2: { anchor: ".replace(/\\s*(\\.\\.\\.|…)$/, '')", expect: 1 },
  B3: { anchor: 'blob.length > 0', expect: 1 },
  B6trim: { anchor: "replace(/\\s+/g, ' ').trim()", expect: 1 },
  C5i: { anchor: '/enforced by|enforces/i', expect: 1 },
  C6lines: { anchor: 'const instClaims = claimSents.filter', expect: 1 },
  C4: { anchor: '(?:mjs|js|ps1|sh)', expect: 1 },
  D5: { anchor: '(?:—|-)', expect: 2 },
  E2chg: { anchor: 'change|changes', expect: 1 },
  E3del: { anchor: 'delete from', expect: 1 },
  E5res: { anchor: 'READ|reserved|leave', expect: 1 },
  E7sfx: { anchor: 'q.endsWith(p) || p.endsWith(q)', expect: 1 },
  F3i: { anchor: '/\\bonce\\b/i', expect: 1 },
  F4e: { anchor: '/iteration|attempt/i', expect: 1 },
  F5b: { anchor: '\\bonce\\b', expect: 1 },
  F6lines: { anchor: 'const onceBad = ownProse.filter', expect: 1 },
  G7hy: { anchor: '[^A-Za-z0-9_-]', expect: 2 },
  G8sent: { anchor: 'proseLines.filter((l) => /(^|', expect: 1 },
  H2i: { anchor: '/\\bsweep/i', expect: 1 },
  H4dist: { anchor: '{0,60}', expect: 1 },
  H6b: { anchor: '\\bclass\\b', expect: 1 },
  K5diff: { anchor: '^[+-][^+-]', expect: 1 },
  Nsplit: { anchor: '(?<=[.;])', expect: 1 },
};

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
    reason: "KEEP, re-decided 2026-09-10 against the current arm rather than the previous reason. The trigger still matches case-insensitively and the substantiation extension kept that exact spelling. The heading half of the old basis falls away on the new arm: headings no longer contribute claim sentences, so an upper-case trigger word in a heading can neither fire nor weld to the paragraph beneath it. The remaining basis is emphasis inside prose: an all-caps claim sentence (`ENFORCED BY ...`) is plausible emphasis, and dropping the flag would let such a claim pass uncaught, which is loosening. All fixtures lower-case. Keep.",
  },
  {
    id: 'C6lines',
    anchor: 'const instClaims = claimSents.filter',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "REWRITE, re-decided 2026-09-10 against the changed arm rather than the previous reason. The substantiation extension moved the arm: claim sentences are now built from non-claim-filtered lines (headings, quotes, fences, table rows and the authority line neither weld nor claim) instead of filtering the shared sentence array, so the old anchor no longer resolves and this record follows the arm to its new spelling. The sentence model itself is still load-bearing on the new arm and is the basis for keeping: paragraph lines still join before splitting, so a claim that wraps keeps its delegation across the line break, and reverting the source to physical lines would reintroduce the C1 wrapping defect this record was written to prevent. The 2026-09-10 incident is the complementary half, not a contradiction: headings are excluded from the sentence source rather than split by line, so the wrap repair and the weld repair coexist. Bound by the suite vehicle `wrapped delegation across two lines stays green`, which a physical-line model of the same source refuses. Keep on the new anchor.",
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
    anchor: 'const onceBad = ownProse.filter',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "REWRITE, re-decided 2026-09-10 against the changed arm rather than the previous reason (Stage-1 U1 check-5 hatch: Authority-source blockquotes, verbatim task rows the architect forbids rewording, drop out before sentence-splitting, so the filter reads `ownProse`). The wrap fix the old reason names survives the move — both arrays share the one `toSentences` spelling, which is also why the Nsplit anchor still resolves exactly once. The remaining basis is the refusal itself: a bare `once` in author prose still refuses, bound by the arms (quoted-once green, author-once red). Keep on the new anchor.",
  },
  {
    id: 'G7hy',
    anchor: '[^A-Za-z0-9_-]',
    expect: 2,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "KEEP. Deleting the hyphen from the class makes a hyphen a word boundary, so any kebab-case identifier carrying these two letters as a segment newly refuses, and it catches nothing real: a token flanked by hyphens is an identifier and not a command. Re-decided 2026-09-10 from the arm rather than from the previous reason.",
  },
  {
    id: 'G8sent',
    anchor: 'proseLines.filter((l) => /(^|',
    expect: 1,
    owner: 'orchestrator',
    expiry: '2026-10-10',
    reason: "KEEP. The cost sits in the exclusion, not the match. Evaluated per physical line, a prohibition that wraps between the excusing word and the token refuses falsely; evaluated per sentence, the false refusal goes and a `never` anywhere in a sentence excuses a token anywhere in it. A whitelist evaluated over a longer unit is a larger whitelist, so the tighter unit wins: a false refusal is visible and costs one edit, and the hole is invisible. Re-decided 2026-09-10.",
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
    console.log(`records check: pinned now ${p} (controls only; live wall ignores the pin)`);
    return p;
  }
  return localToday();
}

// The system wall clock: machine system local date via a fresh child whose
// environment carries no caller zone override. A caller override cannot green
// the wall at one stroke because the child never sees it. The helper writes
// nothing into the working tree; each call uses a fresh area under the OS
// temp area and removes it after. Fail-closed: a helper failure throws, so a
// broken clock refuses rather than passing silently.
function systemToday() {
  const dir = mkdtempSync(join(tmpdir(), 'brief-live-'));
  try {
    const helper = join(dir, 'today.mjs');
    writeFileSync(helper, "const d=new Date();const p=(n)=>String(n).padStart(2,'0');console.log(`${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`);", 'utf8');
    const env = { ...process.env };
    delete env.TZ;
    const r = spawnSync(process.execPath, [helper], { encoding: 'utf8', env });
    if (r.status !== 0) throw new Error(`system date helper failed: ${(r.stderr || '').slice(0, 200)}`);
    const out = (r.stdout || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(out)) throw new Error(`system date helper bad output: ${out.slice(0, 100)}`);
    return out;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// The live wall clock. It always reads the machine system local date via
// systemToday and never consults the pin nor any caller zone override, so an
// outer environment value cannot green the wall at one stroke. Controls keep
// using effectiveNow; the live check uses this. What remains, said plainly in
// the source as required: the machine clock remains (allowed — the verdict is
// a function of this file plus the machine real calendar, and time passing
// moving expiries from pass to fail is that function working) and the machine
// system zone remains (local dates are zone-dependent by corpus convention
// and UTC conversion is forbidden, so a system zone change moves the wall;
// the repo-wide zone dependence is filed separately and untouched here).
// The caller zone override does NOT remain: it is stripped for the child.
function liveNow() {
  return systemToday();
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

// Shared anchor logic. Both the gate check and the binding controls call
// this, so a break inside it (a narrowed loop, a loosened comparison)
// turns a binding control red instead of passing silently.
function anchorBad(records, src) {
  const bad = [];
  for (const rec of records) {
    const got = countOccurrences(src, rec.anchor);
    if (got !== rec.expect) bad.push(`${rec.id}: anchor ${JSON.stringify(rec.anchor)} found ${got}x, want ${rec.expect}x`);
  }
  return bad;
}

function checkAnchors(records, src) {
  const bad = anchorBad(records, src);
  assert.equal(bad.length, 0, `stale anchors (arm moved, changed, or vanished — re-derive, re-decide):\n${bad.join('\n')}`);
}

// Shared identity-to-arm logic. Both the gate check and the binding controls
// call this, so a break inside it turns a binding control red. A swap of two
// identities between same-batch records, or a joint move of one anchor plus
// its count to a different arm at the same count, keeps anchorBad green while
// the record guards the wrong arm; this names the drift per identity.
function identityTieBad(records) {
  const bad = [];
  for (const rec of records) {
    const pinned = EXPECTED_ANCHOR_FOR_ID[rec.id];
    if (!pinned) {
      bad.push(`${rec.id}: no pinned arm (extra identity)`);
      continue;
    }
    if (rec.anchor !== pinned.anchor) bad.push(`${rec.id}: anchor drift (record points away from its pinned arm)`);
    if (rec.expect !== pinned.expect) bad.push(`${rec.id}: expect drift for ${rec.id}`);
  }
  return bad;
}

function checkIdentityTies(records) {
  const bad = identityTieBad(records);
  assert.equal(bad.length, 0, `identity to arm drift (record points away from the arm its identity claims):\n${bad.join('\n')}`);
}

// Shared expiry logic. The late list carries the full per-record line, so
// every refusal names the record or records responsible.
function expiryLate(records, now) {
  return records.filter((rec) => isExpired(rec, now)).map(
    (rec) => `${rec.id} owned by ${rec.owner} expired ${rec.expiry} (now ${now}): ${rec.reason.slice(0, 80)}…`,
  );
}

function checkExpiry(records, now) {
  const late = expiryLate(records, now);
  assert.equal(late.length, 0, `expired record judgements (re-sweep owed, new information required):\n${late.join('\n')}`);
}

// Shared count logic. Names the missing and the extra identities, so a
// deletion is accused rather than inferred from a bare number.
function countProblems(records) {
  const ids = records.map((r) => r.id);
  const missing = EXPECTED_IDS.filter((id) => !ids.includes(id));
  const extra = ids.filter((id) => !EXPECTED_IDS.includes(id));
  const problems = [];
  if (records.length !== EXPECTED_COUNT || missing.length > 0 || extra.length > 0) {
    problems.push(`record count ${records.length}, want ${EXPECTED_COUNT} (missing: ${missing.join(',') || 'none'}; extra: ${extra.join(',') || 'none'})`);
  }
  return { missing, extra, problems };
}

function shapeBad(records) {
  const seen = new Set();
  const bad = [];
  for (const rec of records) {
    for (const e of shapeErrors(rec, seen)) bad.push(e);
    if (rec.id) seen.add(rec.id);
  }
  return bad;
}

function checkShape(records) {
  const { problems } = countProblems(records);
  assert.equal(problems.length, 0, `retire with justification, never by silent deletion:\n${problems.join('\n')}`);
  const bad = shapeBad(records);
  assert.equal(bad.length, 0, `malformed records fail closed:\n${bad.join('\n')}`);
}

// Twin helpers: minimal briefs run through the linter directly. Nothing
// here writes into the working tree; each trial uses a fresh area under the
// OS temp area and removes it after.
function linterHeadSha() {
  return execFileSync('git', ['-C', REPO, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
}

function writeBriefTemp(text) {
  const dir = mkdtempSync(join(tmpdir(), 'brief-twin-'));
  const path = join(dir, 'brief.md');
  writeFileSync(path, text, 'utf8');
  return { dir, path };
}

function runLint(briefPath, sha, flags = []) {
  const res = spawnSync(process.execPath, [LINTER, briefPath, sha, ...flags], { encoding: 'utf8' });
  return { status: res.status, out: `${res.stdout || ''}${res.stderr || ''}` };
}

function twinBaseBrief(sha) {
  return [
    '# Twin brief — suffix allowance vehicle',
    '',
    `authority: two-desks-work-orders-and-trains@${sha}`,
    '',
    'The property is enforced by `scripts/run-tests.mjs`.',
    '',
    '## Files',
    '',
    '- `scripts/run-tests.mjs` — the test runner',
    '',
    'Your report is `RESULT2.md`.',
    '',
  ].join('\n');
}

function withBriefTemp(text, fn) {
  const { dir, path } = writeBriefTemp(text);
  try {
    return fn(path);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/* Check A — anchors resolve. An edited, removed, or rewritten arm breaks its
   anchor count and fails here, which is when a re-decision is owed. */
test('records: every anchor resolves with its expected count', () => {
  checkAnchors(RECORDS, SRC);
});

/* Check E — expiries refuse. Hard fail: exit non-zero, gate red, push bar
   holds. The expiry day passes; the day after refuses. The live wall always
   reads the system local date and ignores the pin and any caller zone
   override; the pin is for controls only. */
test('records: no record is expired', () => {
  checkExpiry(RECORDS, liveNow());
});

/* Check S — shape. Fail-closed: an unparsable record refuses rather than
   passing silently. Count is pinned with identity; retiring a record updates
   the count and the identity list in the same edit with justification. */
test(`records: shape holds and the count is ${EXPECTED_COUNT}`, () => {
  checkShape(RECORDS);
});

/* Check T — identity to arm. Each identity stays tied to the arm substring
   plus count it claims. A swap of two identities between same-batch records,
   or a joint move of one anchor plus its count to a different arm at the same
   count, keeps anchor counts green while guarding the wrong arm; this fails.
   Owner suitability and reason prose have no mechanisable tie and stay with
   review (see map comment). */
test('records: identity stays tied to its arm', () => {
  checkIdentityTies(RECORDS);
});

/* Controls, clock pinned. None of these read the live clock. */

test('records control: all green at pinned 2026-09-10', () => {
  const now = '2026-09-10';
  const late = RECORDS.filter((rec) => isExpired(rec, now));
  assert.equal(late.length, 0, `nothing expires before the batch date: ${late.map((r) => r.id).join(',')}`);
});

test('records control: batch expires at pinned 2026-10-11, outlier holds until 2026-12-02', () => {
  const batchAt = RECORDS.filter((rec) => isExpired(rec, '2026-10-11')).map((r) => r.id).sort();
  const batchMissing = EXPECTED_BATCH_IDS.filter((id) => !batchAt.includes(id)).sort();
  const batchExtra = batchAt.filter((id) => !EXPECTED_BATCH_IDS.includes(id)).sort();
  assert.equal(batchAt.length, 21, `want 21 expired at 2026-10-11, got ${batchAt.length} (expired: ${batchAt.join(',') || 'none'}; missing: ${batchMissing.join(',') || 'none'}; extra: ${batchExtra.join(',') || 'none'})`);
  assert.deepEqual(batchMissing, [], `batch absent records at 2026-10-11: ${batchMissing.join(',')}`);
  assert.deepEqual(batchExtra, [], `batch unexpected records at 2026-10-11: ${batchExtra.join(',')}`);
  assert.ok(!batchAt.includes('B3'), 'outlier B3 must not expire with the batch');
  const allAt = RECORDS.filter((rec) => isExpired(rec, '2026-12-02')).map((r) => r.id).sort();
  const allMissing = EXPECTED_IDS.filter((id) => !allAt.includes(id)).sort();
  const allExtra = allAt.filter((id) => !EXPECTED_IDS.includes(id)).sort();
  assert.equal(allAt.length, 22, `want 22 expired at 2026-12-02, got ${allAt.length} (expired: ${allAt.join(',') || 'none'}; missing: ${allMissing.join(',') || 'none'}; extra: ${allExtra.join(',') || 'none'})`);
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

test('records bind: later-record break refuses via shared anchor check', () => {
  const badLater = RECORDS.map((r, i) => (i === RECORDS.length - 1 ? { ...r, anchor: '__no_such_arm_xyz__' } : r));
  const bad = anchorBad(badLater, SRC);
  assert.ok(bad.some((m) => m.startsWith('Nsplit:')), `later-record break must name Nsplit, got: ${bad.join(';') || 'none'}`);
  assert.throws(() => checkAnchors(badLater, SRC), /stale anchors/, 'shared anchor check throws on later-record break');
  checkAnchors(RECORDS, SRC);
});

test('records bind: double occurrence refuses, strict inequality holds', () => {
  const one = [{ id: '__twin_double__', anchor: 'ab', expect: 1 }];
  assert.equal(countOccurrences('ab ab', 'ab'), 2, 'synthetic doubled source holds twice');
  const bad = anchorBad(one, 'ab ab');
  assert.equal(bad.length, 1, `doubled anchor must refuse: ${bad.join(';')}`);
  assert.throws(() => checkAnchors(one, 'ab ab'), /stale anchors/, 'shared anchor check throws on doubling');
  const two = [{ id: '__vehicle_double__', anchor: 'ab', expect: 2 }];
  assert.deepEqual(anchorBad(two, 'ab ab'), [], 'expecting twice holds');
});

test('records bind: expect zero refuses, one holds', () => {
  const vehicle = RECORDS[0];
  assert.deepEqual(shapeErrors({ ...vehicle, id: '__vehicle_expect_one__', expect: 1 }, new Set()), [], 'expect one holds');
  const zero = { ...vehicle, id: '__twin_expect_zero__', expect: 0 };
  assert.ok(shapeErrors(zero, new Set()).some((e) => e.includes('expect bad')), 'expect zero refuses');
  const wallZero = RECORDS.map((r) => (r.id === 'B2' ? { ...r, expect: 0 } : r));
  assert.throws(() => checkShape(wallZero), /malformed records fail closed/, 'shared shape check throws on expect zero');
});

test('records bind: shared expiry check throws on the expired wall', () => {
  assert.equal(expiryLate(RECORDS, '2026-09-10').length, 0, 'pre-batch wall holds no late');
  assert.equal(expiryLate(RECORDS, '2026-12-02').length, 22, 'full wall is late at the outlier day after');
  assert.throws(() => checkExpiry(RECORDS, '2026-12-02'), /expired record judgements/, 'shared expiry check throws when the wall is late');
  checkExpiry(RECORDS, '2026-09-10');
});

test('records bind: shared shape check throws on bad shape and names a short wall', () => {
  const badOwnerWall = RECORDS.map((r) => (r.id === 'B2' ? { ...r, owner: '  ' } : r));
  assert.ok(shapeBad(badOwnerWall).some((e) => e.includes('owner empty')), 'bad owner surfaces in shared shape detail');
  assert.throws(() => checkShape(badOwnerWall), /malformed records fail closed/, 'shared shape check throws on bad owner');
  const short = RECORDS.filter((r) => r.id !== 'Nsplit');
  const probs = countProblems(short);
  assert.ok(probs.missing.includes('Nsplit'), `short wall must name Nsplit as missing, got: ${probs.missing.join(',')}`);
  assert.equal(probs.problems.length, 1, 'short wall yields one count problem');
  assert.throws(() => checkShape(short), /Nsplit/, 'shared shape check names the absent record when it throws');
  checkShape(RECORDS);
});

test('records control: live wall ignores the pin while controls honor it', () => {
  const prev = process.env.BRIEF_RECORDS_NOW;
  try {
    process.env.BRIEF_RECORDS_NOW = '2026-12-02';
    assert.equal(effectiveNow(), '2026-12-02', 'controls honor the pin');
    assert.equal(liveNow(), systemToday(), 'live wall ignores the pin');
    assert.equal(expiryLate(RECORDS, liveNow()).length, 0, 'live wall stays green under a far-future pin');
    assert.equal(expiryLate(RECORDS, effectiveNow()).length, 22, 'pinned view is fully late at the far-future pin');
    checkExpiry(RECORDS, liveNow());
  } finally {
    if (prev === undefined) delete process.env.BRIEF_RECORDS_NOW;
    else process.env.BRIEF_RECORDS_NOW = prev;
  }
  assert.equal(effectiveNow(), localToday(), 'without override the local date rules');
});

test('twin E7sfx: suffix cite stays green (vehicle)', () => {
  const sha = linterHeadSha();
  const base = twinBaseBrief(sha).replace('- `scripts/run-tests.mjs` — the test runner', '- `loop/run.mjs` — the permitted scope');
  const text = `${base}\nEdit \`sub/loop/run.mjs\` to improve logging.\n`;
  withBriefTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, `suffix vehicle must pass:\n${r.out}`);
    assert.match(r.out, /PASS.*no instruction directs an edit/);
  });
});

test('twin E7sfx: distinct cite refuses (twin)', () => {
  const sha = linterHeadSha();
  const base = twinBaseBrief(sha).replace('- `scripts/run-tests.mjs` — the test runner', '- `loop/run.mjs` — the permitted scope');
  const text = `${base}\nEdit \`loop/other.mjs\` to improve logging.\n`;
  withBriefTemp(text, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, `distinct twin must refuse:\n${r.out}`);
    assert.match(r.out, /FAIL.*no instruction directs an edit/);
    assert.match(r.out, /loop\/other\.mjs/);
  });
});

/* Zone (a): an override reaches a direct read — separable, needs no live clock.
   Fixed instant 2026-01-01T06:30:00Z.
   WHY this pair differs at this instant, beside the constant so the next
   reader can tell choice from inheritance: America/Denver is UTC-7 (MST) on
   this date, so 06:30Z reads 23:30 on 2025-12-31 there; Pacific/Kiritimati is
   UTC+14, so the same instant reads 20:30 on 2026-01-01 there. The 21-hour gap
   crosses the date line, so the calendar dates differ. Deterministic at every
   hour of every day because the instant and the zones are fixed. */
const FIXED_INSTANT_MS = Date.parse('2026-01-01T06:30:00Z');
const FIXED_DENVER_WANT = '2025-12-31';
const FIXED_KIRITIMATI_WANT = '2026-01-01';

function fixedDateUnderZone(ms, zone) {
  const sysZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const prev = process.env.TZ;
  try {
    process.env.TZ = zone;
    const d = new Date(ms);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  } finally {
    if (sysZone) process.env.TZ = sysZone;
    if (prev === undefined) delete process.env.TZ;
    else process.env.TZ = prev;
  }
}

/* Zone (b/c) instruments ordered EASTWARD (most east first). From
   America/Denver (UTC-6 in summer, UTC-7 in winter) every wide instrument is
   east: Kiritimati UTC+14 (20.0h ahead), Apia UTC+13 (19.0h), Tokyo UTC+9
   (15.0h), against GMT+12 UTC-12 (6.0h), UTC 0 (6.0h), Niue UTC-11 (5.0h),
   Midway UTC-11 (5.0h), Honolulu UTC-10 (4.0h). Two sessions reached for the
   4-to-6h band and missed the 15-to-20h band because a different date gets
   searched as far away and far away reaches west. The pair below are
   complements, not alternatives: Kiritimati covers all but its own four-hour
   hole, Etc/GMT+12 covers exactly that hole. Measured across 144 ten-minute
   instants of 2026-09-10: 0 with no instrument, Kiritimati 120, GMT+12 24. */
const ZONE_CANDIDATES_EASTWARD = ['Pacific/Kiritimati', 'Etc/GMT+12'];

function dateInZoneNow(zone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/* Select the first candidate whose current date differs from the system date.
   Refuses (throws) when none differs — fail, never skip, because a skip reads
   as a pass. Shared by (b) and (c) so a break inside turns both red. */
function selectInstrument(candidates, systemDate, dateForZone) {
  for (const z of candidates) {
    if (dateForZone(z) !== systemDate) return z;
  }
  throw new Error(`no instrument: no candidate differs from system date ${systemDate} (fail, never skip)`);
}

test('records control: override reaches a direct read at a fixed instant (deterministic)', () => {
  assert.equal(fixedDateUnderZone(FIXED_INSTANT_MS, 'America/Denver'), FIXED_DENVER_WANT, 'fixed instant reads prior date in Denver');
  assert.equal(fixedDateUnderZone(FIXED_INSTANT_MS, 'Pacific/Kiritimati'), FIXED_KIRITIMATI_WANT, 'same instant reads next date in Kiritimati');
  assert.notEqual(FIXED_DENVER_WANT, FIXED_KIRITIMATI_WANT, 'zones differ at this instant, proving an override reaches a direct read without any live clock');
});

test('records control: live wall ignores the caller override via a selected instrument', () => {
  // This control establishes its own baseline (system) so it must not claim
  // clean live alone: clean alone with no tainted direct is an echo. A first
  // run cannot detect drift. It refuses to pass unless direct is shown tainted
  // alongside live clean, proving the instrument was active.
  const system = systemToday();
  const instrument = selectInstrument(ZONE_CANDIDATES_EASTWARD, system, dateInZoneNow);
  assert.ok(instrument, 'instrument selected (fail, never skip, when none differs)');
  const sysZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const prev = process.env.TZ;
  try {
    process.env.TZ = instrument;
    const direct = localToday();
    const systemUnder = systemToday();
    assert.notEqual(direct, system, 'direct is tainted, proving the instrument is active — without this, clean live would be an echo');
    assert.equal(systemUnder, system, 'system ignores the caller override');
    assert.equal(liveNow(), system, 'live still reads the system date under the override');
  } finally {
    if (sysZone) process.env.TZ = sysZone;
    if (prev === undefined) delete process.env.TZ;
    else process.env.TZ = prev;
  }
  assert.equal(localToday(), system, 'restore leaves direct clean again');
  assert.equal(systemToday(), system, 'restore leaves system clean');
});

test('records control: instrument selection refuses when no candidate differs (forced)', () => {
  // This branch cannot be reached by waiting: candidates spanning both
  // directions always leave one available (0 in 144 measured). It ships
  // unproved unless forced. Forcing with only the system zone (whose date
  // equals system by definition) must refuse, and does — shown firing here.
  const system = systemToday();
  const sysZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  assert.throws(() => selectInstrument([sysZone], system, dateInZoneNow), /no instrument/, 'candidate list with only the system zone must refuse');
});

/* Furniture 1: local date sanity via an independent read. Replacing localToday
   by a fixed past date leaves the live wall green (it reads the system date)
   and leaves pinned controls green (both arms read the same broken value), so
   this independent read is the binder. Under a caller override both reads are
   tainted the same way, so no false red there. */
test('records bind: localToday matches an independent date read', () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const direct = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  assert.equal(localToday(), direct, 'localToday must read the direct date; a fixed past stub must fail here');
});

/* Furniture 2: duplicate detection via the shared shape path. The malformed
   control exercises shapeErrors directly with its own external set and never
   goes through shapeBad, so moving the seen set inside the loop blinds
   duplicates silently. This exercises the shared path itself. */
test('records bind: duplicate ids refuse via shared shape path', () => {
  const tinyWall = [{ ...RECORDS[0], id: '__dupe_a__' }, { ...RECORDS[0], id: '__dupe_a__' }];
  assert.ok(shapeBad(tinyWall).some((e) => e.includes('duplicate')), 'duplicate via shared path must surface');
  const dupeWall = RECORDS.map((r, i) => (i === 1 ? { ...r, id: RECORDS[0].id } : r));
  assert.ok(shapeBad(dupeWall).some((e) => e.includes('duplicate')), 'duplicate in the wall must surface via shared path');
  assert.throws(() => checkShape(dupeWall), /retire with justification|malformed records fail closed/, 'shared shape check must throw on the duplicate wall');
  checkShape(RECORDS);
});

/* Field ties: identity to arm. Anchor counts alone stay green when two
   identities swap between same-batch records or when one anchor plus its
   count moves jointly to a different arm at the same count. */
test('records bind: swapped identities refuse via identity tie', () => {
  const swapped = RECORDS.map((r) => {
    if (r.id === 'B2') return { ...r, id: 'B6trim' };
    if (r.id === 'B6trim') return { ...r, id: 'B2' };
    return r;
  });
  assert.deepEqual(anchorBad(swapped, SRC), [], 'swapped wall keeps anchor counts green');
  const bad = identityTieBad(swapped);
  assert.ok(bad.some((m) => m.startsWith('B2:')) && bad.some((m) => m.startsWith('B6trim:')), `swap must name both drifted identities, got: ${bad.join(';') || 'none'}`);
  assert.throws(() => checkIdentityTies(swapped), /identity to arm drift/, 'shared identity check throws on swap');
  checkIdentityTies(RECORDS);
});

test('records bind: joint anchor move refuses via identity tie', () => {
  const b3 = RECORDS.find((r) => r.id === 'B3');
  const moved = RECORDS.map((r) => (r.id === 'B2' ? { ...r, anchor: b3.anchor, expect: b3.expect } : r));
  assert.deepEqual(anchorBad(moved, SRC), [], 'joint move keeps anchor counts green (same count, different arm)');
  const bad = identityTieBad(moved);
  assert.ok(bad.some((m) => m.startsWith('B2:')), `move must name B2 drift, got: ${bad.join(';') || 'none'}`);
  assert.throws(() => checkIdentityTies(moved), /B2/, 'shared identity check names the drifted record when it throws');
  checkIdentityTies(RECORDS);
});

/* Detail-line twins for the two retired star arms. Either conjunct alone
   refuses the same bare input, so status alone cannot bind them separately.
   The printed detail already distinguishes them: numbered false for the bare
   form, true when the arm is loosened to the star form. */
test('twin RESULT detail: bare form reports numbered false (vehicle plus twin)', () => {
  const sha = linterHeadSha();
  const numberedText = twinBaseBrief(sha).replace('`RESULT2.md`', '`RESULT9.md`');
  withBriefTemp(numberedText, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 0, `numbered vehicle must pass:\n${r.out}`);
    assert.match(r.out, /numbered=true bare=false/);
  });
  const bareText = twinBaseBrief(sha).replace('`RESULT2.md`', '`RESULT.md`');
  withBriefTemp(bareText, (p) => {
    const r = runLint(p, sha);
    assert.equal(r.status, 1, `bare twin must refuse:\n${r.out}`);
    assert.match(r.out, /FAIL.*report file is a numbered/);
    assert.match(r.out, /numbered=false bare=true/);
  });
});

test('twin REVIEW detail: bare form reports numbered false (vehicle plus twin)', () => {
  const sha = linterHeadSha();
  const base = twinBaseBrief(sha);
  const numberedText = `${base}\nYour review is \`REVIEW9.md\`.\n`;
  withBriefTemp(numberedText, (p) => {
    const r = runLint(p, sha, ['--review']);
    assert.equal(r.status, 0, `numbered review vehicle must pass:\n${r.out}`);
    assert.match(r.out, /review numbered=true/);
  });
  const bareText = `${base}\nYour review is \`REVIEW.md\`.\n`;
  withBriefTemp(bareText, (p) => {
    const r = runLint(p, sha, ['--review']);
    assert.equal(r.status, 1, `bare review twin must refuse:\n${r.out}`);
    assert.match(r.out, /FAIL.*review output is a numbered/);
    assert.match(r.out, /review numbered=false/);
  });
});
