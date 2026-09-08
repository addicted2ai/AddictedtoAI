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
 * `BRIEF_EXCERPT_MAX_CHARS` (24,000) instead of `excerptsFor`'s own 14,000
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
 * the in-flight change directory happens to hold on any given day. Two capabilities
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

test('ccs BRIEF_EXCERPT_MAX_CHARS is 24,000 — the measured number, not a placeholder', () => {
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
  //
  // Re-measured a fourth time 2026-09-07, on the live tree, with SEVEN drafts
  // in flight: floors per type interpret 73,473, repair 57,693, entry 39,087,
  // verify 38,697, scout 33,729, post 27,105, education 24,183, tutorial
  // 23,013, machinery 17,169, prune 13,857. At 56,000 interpret cut two and
  // repair one (Desk job j-20260907-03 failed its gates on the test below).
  // 88,000 = the floor plus one more change's share, for the eighth draft
  // still on its branch. config.mjs carries the full record.
  // Re-measured 2026-09-08 after removing the per-source division across
  // unarchived changes. The four upward moves remain historical; this fifth
  // move removes the mechanism that forced them and returns to 24,000.
  assert.equal(BRIEF_EXCERPT_MAX_CHARS, 24000);
});

/* ---------------------------------------------------------------------------
 * A pinned corpus owns assertions; the live tree is measurement-only because
 * its open-change set is intentionally allowed to move between commits.
 * ------------------------------------------------------------------------ */
function pinnedCorpus(deltaChars = 0) {
  const caps = ['pulse', 'site', 'review'];
  const files = {};
  for (const cap of caps) {
    files[`openspec/specs/${cap}/spec.md`] =
      `# ${cap}\n\n${bigRequirement(`${cap} repair rule`, cap === 'pulse' ? 7000 : 1800)}`;
  }
  files['openspec/specs/pulse/spec.md'] += bigRequirement('pulse repair surplus', 2500);
  for (const change of ['one', 'two', 'three']) {
    for (const cap of caps) {
      files[['openspec', 'changes', change, 'specs', cap, 'spec.md'].join('/')] =
        `# pending ${cap} amendment\n\n${bigRequirement(`${cap} unrelated amendment`, deltaChars)}`;
    }
  }
  return makeRepo({ files });
}

test('pinned three-change repair corpus is stable and the assembled brief is bounded', () => {
  const withChanges = pinnedCorpus();
  const zeroChanges = makeRepo({
    files: Object.fromEntries(
      ['pulse', 'site', 'review'].map((cap) => [
        `openspec/specs/${cap}/spec.md`,
        `# ${cap}\n\n${bigRequirement(`${cap} repair rule`, cap === 'pulse' ? 7000 : 1800)}`,
      ]),
    ),
  });
  const changed = excerptsFor(withChanges.repoRoot, 'repair', { maxChars: 24000 });
  const zero = excerptsFor(zeroChanges.repoRoot, 'repair', { maxChars: 24000 });
  const headings = (text) => [...text.matchAll(/^### Requirement: (.+)$/gm)]
    .map((m) => m[1])
    .filter((heading) => !heading.includes('unrelated') && !heading.includes('surplus'));
  assert.deepEqual(headings(changed.text), headings(zero.text));
  const brief = assembled(withChanges, 'repair');
  assert.ok(brief.length <= 30000, `fixture brief is ${brief.length} characters`);
  withChanges.cleanup();
  zeroChanges.cleanup();
});

test('pinned corpus has no mid-sentence cuts for every job type', () => {
  const ctx = pinnedCorpus();
  for (const type of JOB_TYPES) {
    assert.equal(countCuts(assembled(ctx, type)), 0, `${type} contains a cut`);
  }
  ctx.cleanup();
});

test('pending changes do not shrink the per-capability excerpt allocation', () => {
  const ctx = pinnedCorpus(2000);
  const ex = excerptsFor(ctx.repoRoot, 'repair', { maxChars: 24000 });
  assert.equal(countCuts(ex.text), 0);
  assert.ok(ex.text.includes('pulse repair rule'));
  ctx.cleanup();
});

test('truncated excerpts explain that relevant material was omitted or cut', () => {
  const ctx = makeRepo({
    files: {
      'openspec/specs/editorial/spec.md':
        `# editorial\n\n${bigRequirement('prune first rule', 7500)}${bigRequirement('prune second rule', 7500)}`,
      'openspec/specs/review/spec.md':
        `# review\n\n${bigRequirement('prune review rule', 7500)}`,
    },
  });
  const text = assembled(ctx, 'prune');
  assert.match(text, /relevant material was omitted or cut/);
  assert.doesNotMatch(text, /targeted and truncated/);
  ctx.cleanup();
});

test('live tree measurement: assembled brief size and cuts are printed, not asserted', () => {
  const ctx = { repoRoot: DEFAULT_REPO_ROOT };
  const cutTypes = [];
  const measurements = [];
  for (const type of JOB_TYPES) {
    const text = assembled(ctx, type);
    measurements.push(`${type}: brief_chars=${text.length}`);
    if (countCuts(text) > 0) cutTypes.push(type);
  }
  console.log(`live brief measurements; largest=${Math.max(...measurements.map((s) => Number(s.match(/=(\d+)$/)[1])))}; cut_types=${cutTypes.join(',') || 'none'}`);
  console.log(measurements.join('\n'));
});
