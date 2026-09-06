/**
 * brief-excerpt-budget.test.mjs — the brief excerpt budget carries a normative
 * SHALL whole rather than cutting it mid-sentence (beads addictedtoai-ccs).
 *
 * THE DEFECT. `loop/lib/specs.mjs` `excerptsFor()` splits its `maxChars`
 * budget evenly across every source (a capability's constitution, plus one
 * per in-flight OpenSpec delta that touches it). Since the delta-quoting
 * repair doubled the source count for any capability under active amendment,
 * the 14,000-character default measurably cut normative `### Requirement:`
 * sections mid-sentence for several job types on the live tree — see
 * `loop/lib/config.mjs` `BRIEF_EXCERPT_MAX_CHARS` for the full measurement
 * and reasoning. `excerptsFor` already marks a cut with a `[... CUT ...]`
 * note, so the truncation was never silent; it was still a defect, because a
 * reader has to leave the brief to finish reading a rule they are judged
 * against.
 *
 * THE FIX. `assembleBrief` (`loop/lib/brief.mjs`) now passes
 * `BRIEF_EXCERPT_MAX_CHARS` (20,000) instead of `excerptsFor`'s own 14,000
 * default. These tests measure the actual, wired-together effect — not the
 * constant in isolation — because a constant that is defined but never passed
 * would satisfy a test on the constant alone while leaving every real brief
 * unchanged.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { assembleBrief } from '../lib/brief.mjs';
import { excerptsFor } from '../lib/specs.mjs';
import { BRIEF_EXCERPT_MAX_CHARS, JOB_TYPES } from '../lib/config.mjs';
import { DEFAULT_REPO_ROOT } from '../lib/paths.mjs';
import { makeRepo } from './helpers.mjs';

const CUT_MARKER = /\[\.\.\. CUT:/g;
const countCuts = (text) => (text.match(CUT_MARKER) || []).length;

function assembled(ctx, type) {
  return assembleBrief(ctx, {
    jobId: 'j-20260831-99',
    job: { type, source: 'queue', title: `a ${type} job`, detail: 'the stated outcome' },
    branch: 'job/j-20260831-99',
    capMinutes: 60,
  });
}

/* ---------------------------------------------------------------------------
 * A deterministic, self-contained fixture — independent of whatever
 * openspec/changes/ happens to hold on any given day. Two capabilities
 * (`editorial`, `review` — the pair `SPECS_FOR_TYPE.prune` names), each with
 * ONE requirement of 7,500 characters and nothing else to donate spare
 * budget to it. At the OLD 14,000-char default that is a 7,000-char share
 * each: both requirements exceed their share and BOTH are cut, and pass 2
 * (which restores a cut section from unspent spare elsewhere) has no spare to
 * give — every source already spent its whole share on the one section it
 * has. At the NEW 20,000-char budget the share is 10,000 each: 7,500 fits
 * whole, with room left over. This isolates the one variable under test —
 * the budget passed to `excerptsFor` — from the live tree's own content,
 * which changes as OpenSpec changes archive.
 * ------------------------------------------------------------------------ */
function bigRequirement(heading, chars) {
  const filler = 'This requirement text exists only to occupy space. ';
  let body = '';
  while (body.length < chars) body += filler;
  return `### Requirement: ${heading}\n\n${body.slice(0, chars)}\n`;
}

function twoSourceFixture() {
  const spec = (name) =>
    `# specs/${name}\n\nA short preamble.\n\n${bigRequirement(`${name} big rule`, 7500)}`;
  return makeRepo({
    files: {
      'openspec/specs/editorial/spec.md': spec('editorial'),
      'openspec/specs/review/spec.md': spec('review'),
    },
  });
}

test('ccs precondition: this fixture really does cut at the old 14,000-char default', () => {
  const ctx = twoSourceFixture();
  const ex = excerptsFor(ctx.repoRoot, 'prune', { maxChars: 14000 });
  assert.ok(countCuts(ex.text) >= 1, 'the fixture must exercise the defect, or the fix below proves nothing');
  ctx.cleanup();
});

test('ccs assembleBrief no longer cuts this fixture\'s requirements mid-sentence', () => {
  const ctx = twoSourceFixture();
  const text = assembled(ctx, 'prune');
  assert.equal(countCuts(text), 0, text);
  // And both full requirement bodies are actually present, not merely
  // "not truncated because they were dropped instead".
  assert.match(text, /editorial big rule/);
  assert.match(text, /review big rule/);
  assert.ok(text.includes('This requirement text exists only to occupy space. '.repeat(1).trim()));
  ctx.cleanup();
});

test('ccs assembleBrief passes BRIEF_EXCERPT_MAX_CHARS, not specs.mjs\'s own smaller default', () => {
  // Direct comparison: excerptsFor at the OLD default on this fixture cuts;
  // assembleBrief's actual output on the SAME fixture does not. If brief.mjs
  // ever reverts to calling excerptsFor with no options, this goes red.
  const ctx = twoSourceFixture();
  const atOldDefault = excerptsFor(ctx.repoRoot, 'prune');
  assert.ok(countCuts(atOldDefault.text) >= 1, 'precondition unchanged');
  assert.equal(countCuts(assembled(ctx, 'prune')), 0);
  ctx.cleanup();
});

test('ccs BRIEF_EXCERPT_MAX_CHARS is 56,000 — the measured number, not a placeholder', () => {
  // Re-measured 2026-08-31 when a third in-flight delta began amending `loop`
  // and the per-source share fell to a third of the budget: at 20,000 the
  // `scout` type cut two sections mid-requirement. That measurement gave a
  // floor of 21,500 and 24,000 was set for headroom.
  //
  // Re-measured again 2026-09-05, after job j-20260905-17 failed its own gates
  // on the live-tree test below while drafting an OpenSpec change — the third
  // in-flight change was its own output, sitting in its worktree when the gates
  // ran. Floors, by binary search against a temp copy of `openspec/` with
  // synthetic changes modelled on the real ones: 2 -> 23,090, 3 -> 39,085,
  // 4 -> 50,703, 5 -> 63,080. 24,000 was within 910 characters of its floor.
  // 56,000 is clean at four in-flight changes, one more than the planned peak.
  //
  // The growth is linear in in-flight changes, so this WILL be re-broken; see
  // `loop/lib/config.mjs` and addictedtoai-2sx8. Archiving a finished change is
  // what lowers it again.
  assert.equal(BRIEF_EXCERPT_MAX_CHARS, 56000);
});

/* ---------------------------------------------------------------------------
 * Measured against the LIVE tree, like `config.test.mjs`'s "the working
 * repository's own config satisfies every listed type" — the check that
 * would notice if the budget stopped being enough as more OpenSpec changes
 * land. This is the concrete regression addictedtoai-ccs was filed over:
 * 2026-08-30, three of these ten job types cut a requirement mid-sentence.
 * ------------------------------------------------------------------------ */
test('measured against the live tree: no job type\'s assembled brief cuts a requirement mid-sentence today', () => {
  const ctx = { repoRoot: DEFAULT_REPO_ROOT };
  const cutTypes = [];
  for (const type of JOB_TYPES) {
    const text = assembled(ctx, type);
    if (countCuts(text) > 0) cutTypes.push(type);
  }
  assert.deepEqual(
    cutTypes,
    [],
    'if this fails, the live openspec/ tree has grown enough in-flight deltas that ' +
      'BRIEF_EXCERPT_MAX_CHARS needs re-measuring (addictedtoai-ccs) — it is not a sign the test is wrong',
  );
});
