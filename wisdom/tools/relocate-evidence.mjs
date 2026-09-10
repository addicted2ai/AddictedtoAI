// RELOCATE A PACKET'S ARTIFACTS INTO THE EVIDENCE TREE AT MERGE TIME.
//
// The convention, MEASURED from the tree rather than remembered:
//   openspec/changes/two-desks-work-orders-and-trains/evidence/reviews/
//     <packet>/round<N>-RESULT.md
//     <packet>/round<N>-REVIEW.md
// (read off stage0-packet-A, which carries round1..round6 of both kinds.)
//
// Two reasons this is a script written BEFORE the merge rather than a sequence
// of commands typed during one. It encodes a convention I measured while I had
// time to measure it; and a relocation improvised at the end of a long night is
// how a report ends up at the repository root for the fourth time.
//
// A ONE-SHOT REPAIR SCRIPT IS A LOADED GUN THE MOMENT ITS JOB IS DONE (§7k), and
// this one moves files, so it carries the refusals that rule demands:
//
//   * it REFUSES if a destination already exists — never overwrites, so a second
//     run cannot quietly redo or undo the first;
//   * it REFUSES if a named source is missing, rather than skipping it, because
//     a skip and a success look identical in a summary;
//   * it REFUSES unless the tree is on the branch the caller names, so it cannot
//     run against the wrong checkout;
//   * it does NOTHING without --apply, and the dry run prints every move.
//
// It does not commit. The caller stages and commits, because a script that
// commits its own work is a script whose mistakes are already in history.
import { existsSync, mkdirSync, statSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname } from 'node:path';

const REPO = 'D:/AddictedtoAI';
const EVIDENCE = `${REPO}/openspec/changes/two-desks-work-orders-and-trains/evidence/reviews`;
// THE SESSION SCRATCHPAD DIES WITH ITS SESSION, and this constant used to be a
// hard-coded path into one — which is exactly why these tools were nearly lost
// at handoff. Point ARCH_SCRATCH at the directory holding the banked reports.
// The refusal is deliberate and there is no default: an empty or wrong
// directory would be scanned, find nothing unmapped, and report a COMPLETE
// PLAN. That is the silence-reads-as-completeness defect this file exists to
// refuse, so it must not be reintroduced by its own configuration.
const SCRATCH = process.env.ARCH_SCRATCH;
if (!SCRATCH) {
  throw new Error(
    'REFUSED: set ARCH_SCRATCH to the directory holding the banked reports.\n'
    + 'There is no safe default — an empty directory reads as a complete plan.',
  );
}

// THE DESTINATION IS NAMED BY THE ROUND, NOT BY THE REPORT'S OWN NUMBER, and a
// later reader will trip on this because the two disagree on purpose:
// `REVIEW2.md` is the SECOND review and it reviews ROUND THREE, so it lands at
// `round3-REVIEW.md`. The round is the thing the evidence tree is organised by;
// the report's own serial is an artifact of how many reviews happened to run.
// Every entry below therefore carries its round EXPLICITLY rather than having it
// parsed out of the filename.
//
// [packet, expectedBranch, [[sourcePath, round, kind], ...]]
// Sources are the BANKED copies, not the worktrees: a worktree is torn down and
// a banked copy is what survives. Where a RESULT is also committed at the branch
// root, the merge should `git rm` that copy — named here so it is not forgotten,
// and NOT removed by this script, because deleting a tracked file is the
// caller's call and not a script's.
// THE INVENTORY, MEASURED 05:48 AND RECORDED SO IT IS NOT RE-DERIVED AT MERGE.
// Two source kinds, and which one applies is not a preference:
//
//   RESULT — the author's report. COMMITTED at the branch root for the rounds
//     that merged, so the branch is authoritative and a banked copy is only my
//     convenience. Written `{ branch: 'RESULT1.md' }` and read with `git show`.
//   REVIEW — the sealed reviewer's report. Reviewers work in DETACHED worktrees
//     and are told not to commit, so a review exists ONLY as a banked copy.
//     There is no authoritative alternative and losing the bank loses the review.
//
// Banked, measured:
//   w3     RESULT2 19046   RESULT3 20686   REVIEW1 27019   REVIEW2 23223   REVIEW3 34065
//   lease  RESULT3 16299   RESULT4 29708   REVIEW1 20609   REVIEW2 23080
// Committed at branch root:
//   wisdom/w3-records  RESULT1 RESULT2          (round 3's RESULT3 was never committed —
//                                                round 3 committed the test file alone)
//   pulse/lease        RESULT1 RESULT2 RESULT3
//
// THE PLAN BELOW IS DELIBERATELY INCOMPLETE AND THE SCRIPT REFUSES BECAUSE OF
// IT. Round 4 of both packets is in flight as this is written, and the
// round-to-review correspondence for the middle rounds is NOT something to guess
// at 05:50 — `REVIEW2.md` reviews round 3, so the serials and the rounds do not
// line up and the mapping has to be read off the reports themselves. The
// refusal is the reminder, and a refusing script is the correct state for a
// plan that cannot yet be completed. Complete it at merge, when every round
// exists and each report can be opened to see which round it is about.
const PLAN = {
  'wisdom-w3-records': {
    branch: 'wisdom/w3-records',
    rootFilesToRemoveByHand: ['RESULT1.md', 'RESULT2.md'],
    // Declared exclusions. A round or a banked artifact that is deliberately not
    // relocated must be NAMED HERE WITH A REASON; anything neither mapped nor
    // named refuses. See the completeness check below for why.
    ignore: {
      'arch-w3-REVIEW3-EARLY-SNAPSHOT.md': 'the deliberate early anchor (731 bytes, 05:16:47), not a report — it is evidence ABOUT the report and belongs with the ordering note, not in the rounds tree',
      'arch-w3-RESULT2-round-2.md': 'my convenience copy of a report that is COMMITTED at the branch root. The branch is authoritative and is what gets relocated; banking it twice would put a copy in the tree whose provenance is me rather than the commit',
      'arch-w3-RESULT4-EARLY-SNAPSHOT.md': 'the early anchor for round 4, and it is the one that FAILED usefully: first sighting was 21,327 bytes, byte-identical to the finished report, because this author wrote its report in a single write at the end. So there is no ordering evidence for round 4 and the instrument says so. Evidence about a report, not a report',
    },
    files: [
      [{ branch: 'RESULT1.md' }, 1, 'RESULT'],
      [`${SCRATCH}/arch-w3-REVIEW1-round-1.md`, 1, 'REVIEW'],
      [{ branch: 'RESULT2.md' }, 2, 'RESULT'],
      [`${SCRATCH}/arch-w3-REVIEW2-round-2.md`, 2, 'REVIEW'],
      // Round 3 committed the test file ALONE, so its RESULT was never committed
      // and the banked copy is the only one that exists.
      [`${SCRATCH}/arch-w3-RESULT3-round-3.md`, 3, 'RESULT'],
      [`${SCRATCH}/arch-w3-REVIEW3-round-3.md`, 3, 'REVIEW'],
      // Round 4 was the last and had no sealed review — it was a disposition
      // round, so there is a RESULT and deliberately no REVIEW beside it.
      [`${SCRATCH}/arch-w3-RESULT4-round-4.md`, 4, 'RESULT'],
    ],
  },
  'pulse-lease': {
    branch: 'pulse/lease',
    rootFilesToRemoveByHand: ['RESULT1.md', 'RESULT2.md', 'RESULT3.md'],
    ignore: {
      'arch-lease-REVIEW2-PARTIAL-copied-mid-write.md': 'the 18,309-byte copy I banked as final at 04:33 when the finished file was 23,080 with section 6 still a placeholder. Kept under a name that carries its own defect, and deliberately NOT relocated — the evidence tree holds the finished review, and this belongs to the wisdom record about it (7m)',
      'arch-lease-REVIEW3-EARLY-SNAPSHOT.md': 'the deliberate early anchor for round 4\'s sealed review (940 bytes, 05:31:33 — verdict TBD, section 1 complete). Evidence ABOUT a report, not a report; it belongs with the ordering note (7m/7s), not in the rounds tree. THIS ONE VERIFIED: section 1 byte-identical against the finished 17,432 bytes',
      'arch-lease-RESULT3-round-3.md': 'my convenience copy of a report COMMITTED at the branch root. The branch is authoritative; relocating the bank instead would put a file in the tree whose provenance is me rather than the commit',
      'arch-lease-RESULT4-round-4.md': 'same — a convenience copy of the report committed at the branch root, compared byte-for-byte (sha256 387cafb5…) before being excluded rather than assumed identical',
      'arch-lease-RESULT5-round-5.md': 'same — a convenience copy of the report committed at the branch root, compared byte-for-byte (sha256 1e98e60a…) before being excluded rather than assumed identical',
      'arch-lease-RESULT5-EARLY-SNAPSHOT.md': 'the deliberate early anchor for round 5. Evidence ABOUT a report rather than a report, so it belongs with the ordering note (7m/7s) and not in the rounds tree',
    },
    files: [
      [{ branch: 'RESULT1.md' }, 1, 'RESULT'],
      [`${SCRATCH}/arch-lease-REVIEW1-round-1.md`, 1, 'REVIEW'],
      // Round 2 has a RESULT and no REVIEW. That is not an omission: the reviews
      // on this packet are less frequent than the rounds, which is exactly why
      // the destination is named by the round and not by the report's serial.
      [{ branch: 'RESULT2.md' }, 2, 'RESULT'],
      [{ branch: 'RESULT3.md' }, 3, 'RESULT'],
      [`${SCRATCH}/arch-lease-REVIEW2-round-3.md`, 3, 'REVIEW'],
      // Rounds 4 and 5 are COMMITTED at the branch root, like rounds 1-3, and
      // are read from the branch for the same reason: the commit is the
      // provenance. My banked copies were compared byte-for-byte first (sha256
      // equal for both) and are declared as exclusions below rather than used.
      [{ branch: 'RESULT4.md' }, 4, 'RESULT'],
      [`${SCRATCH}/arch-lease-REVIEW3-round-4.md`, 4, 'REVIEW'],
      // Round 5 is what the `revise` verdict bought, and it is a disposition
      // round: a RESULT and deliberately no REVIEW, the same shape as W3's
      // round 4. Verified independently before this mapping was written —
      // three hashes matched, five consecutive baselines 39/39, and the raised
      // writes-nothing instrument red at 38/1 on the fresh-refusal trial.
      [{ branch: 'RESULT5.md' }, 5, 'RESULT'],
    ],
  },
  'wisdom-w2-claims': {
    branch: 'wisdom/w2-claims',
    rootFilesToRemoveByHand: ['RESULT1.md'],
    ignore: {
      'arch-w2-RESULT1-round-1.md': 'my convenience copy of a report COMMITTED at the branch root. The branch is authoritative and is what gets relocated; banking it twice would put a file in the tree whose provenance is me rather than the commit',
      'arch-w2-RESULT1-EARLY-SNAPSHOT.md': 'the deliberate early anchor for round 1. Evidence ABOUT a report rather than a report, so it belongs with the ordering note (7m/7s) and not in the rounds tree',
    },
    files: [
      // ONE ROUND, AND NO SEALED REVIEW — said out loud because an absent review
      // and an unrelocated one look identical in a directory listing. W2 was
      // verified by me directly against the tree (95/95 and 27/27 counted from
      // outside the run, and the wild control fired on the packet's own brief),
      // which is a different instrument from a sealed peer review and is not a
      // substitute for one.
      [{ branch: 'RESULT1.md' }, 1, 'RESULT'],
    ],
  },
};

const apply = process.argv.includes('--apply');
const packet = process.argv.find((a) => !a.startsWith('--') && PLAN[a]);
if (!packet) {
  console.log(`usage: node arch-relocate-evidence.mjs <${Object.keys(PLAN).join('|')}> [--apply]`);
  process.exit(2);
}
const plan = PLAN[packet];

const head = execFileSync('git', ['-C', REPO, 'rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' }).trim();
if (head !== 'main') {
  throw new Error(`REFUSED: ${REPO} is on ${head}, not main. Relocation happens on the merge target, never on the packet branch.`);
}

// ---------------------------------------------------------------------------
// THE PLAN IS AN INPUT TO THIS SCRIPT AND UNTIL 05:41 IT WAS THE ONLY INPUT
// NOTHING CHECKED.
//
// The refusals above are all about EXECUTION — a source that vanished, a
// destination already written, the wrong branch. Every one of them presumes the
// list is right. But the list is a parameter, it lives in the same file, it is
// read in the same breath as the refusals, and it inherits their credibility
// without ever having earned any. That is 7p, in a script I wrote after
// committing 7p.
//
// The dry run found it: the W3 plan mapped rounds 2 and 3, while ROUND 1 sits at
// the branch root unmentioned and round 4 is being written as this runs. A
// missing source refuses loudly. AN UNLISTED ONE IS SILENT, AND SILENCE HERE
// READS EXACTLY LIKE COMPLETENESS — the summary prints "4 file(s)" either way.
//
// So both populations get enumerated from the world rather than from the plan,
// and anything found that the plan neither maps nor NAMES AS IGNORED WITH A
// REASON refuses. The asymmetry is the same one the worktree guard settled on:
// declaring is cheap and explicit, and the undeclared direction fails safe.
const ignore = plan.ignore ?? {};

// Population 1: the rounds that actually exist on the branch, read from git.
const rootEntries = execFileSync('git', ['-C', REPO, 'ls-tree', '--name-only', plan.branch], { encoding: 'utf8' })
  .split('\n').map((l) => l.trim()).filter(Boolean);
const branchRounds = rootEntries
  .map((n) => /^RESULT(\d+)\.md$/.exec(n))
  .filter(Boolean)
  .map((m) => Number(m[1]));
const mappedResultRounds = new Set(plan.files.filter(([, , k]) => k === 'RESULT').map(([, r]) => r));
const unmappedRounds = branchRounds.filter((r) => !mappedResultRounds.has(r) && !ignore[`RESULT${r}.md`]);

// Population 2: the banked reports on disk, read from the directory.
// The banked-file prefix belongs to the packet, so it is DECLARED per packet
// rather than derived by a conditional that has to be edited every time a packet
// is added. The old form was `packet === 'pulse-lease' ? … : 'arch-w3-'`, whose
// else-branch silently claimed every future packet was W3: adding W2 would have
// scanned W3's banked files, found them all mapped, and reported a complete plan
// for a packet whose own reports it never looked at. A DEFAULT BRANCH THAT NAMES
// A REAL SUBJECT IS WORSE THAN ONE THAT THROWS.
const PREFIX = { 'pulse-lease': 'arch-lease-', 'wisdom-w3-records': 'arch-w3-', 'wisdom-w2-claims': 'arch-w2-' };
const REPORT_SHAPE = /^arch-(?:w2|w3|lease)-(?:RESULT|REVIEW)\d+.*\.md$/;
const prefix = PREFIX[packet];
if (!prefix) throw new Error(`REFUSED: no banked-file prefix declared for packet ${packet}. Add one to PREFIX; guessing would scan another packet's reports and call the plan complete.`);
const mappedSources = new Set(plan.files.filter(([s]) => typeof s === 'string').map(([s]) => s.slice(s.lastIndexOf('/') + 1)));
const banked = readdirSync(SCRATCH).filter((n) => n.startsWith(prefix) && REPORT_SHAPE.test(n));
const unmappedBanked = banked.filter((n) => !mappedSources.has(n) && !ignore[n]);

if (unmappedRounds.length > 0 || unmappedBanked.length > 0) {
  const lines = ['REFUSED: the plan does not account for everything that exists.', ''];
  if (unmappedRounds.length > 0) {
    lines.push(`  ${unmappedRounds.length} round(s) present at the root of ${plan.branch} with no RESULT mapping and no declared reason:`);
    for (const r of unmappedRounds.sort((a, b) => a - b)) lines.push(`    RESULT${r}.md  (round ${r})`);
  }
  if (unmappedBanked.length > 0) {
    lines.push(`  ${unmappedBanked.length} banked report(s) matching this packet, neither mapped nor ignored:`);
    for (const n of unmappedBanked.sort()) lines.push(`    ${n}`);
  }
  lines.push('');
  lines.push('Map each one, or name it in the plan\'s `ignore` with the reason it stays out.');
  lines.push('A round that is silently absent looks identical to a round that was relocated.');
  throw new Error(lines.join('\n'));
}
console.log(`plan checked: ${branchRounds.length} round(s) on ${plan.branch} (${branchRounds.sort((a, b) => a - b).join(', ')}), ${banked.length} banked report(s) on disk, ${Object.keys(ignore).length} declared exclusion(s) — all accounted for`);
for (const [n, why] of Object.entries(ignore)) console.log(`  excluded ${n}\n    because ${why}`);
console.log('');

// A source is either a banked path (a string) or `{ branch: '<root file>' }`,
// read out of the branch with `git show`. CLAUDE.md's Windows note applies and
// is why this is execFileSync and not a shell: `git show "rev:path"` in Git Bash
// silently returns ZERO BYTES with exit 0, because MSYS mangles the rev:path
// argument. A zero-byte relocation that reports success is precisely the failure
// this whole script is shaped against, so git.exe is spawned directly.
const readSource = (src) => {
  if (typeof src === 'string') {
    if (!existsSync(src)) throw new Error(`REFUSED: source missing — ${src}\nA skipped file and a moved one look the same in a summary, so this refuses rather than skipping.`);
    return { bytes: statSync(src).size, label: src, read: () => readFileSync(src) };
  }
  const spec = `${plan.branch}:${src.branch}`;
  let buf;
  try {
    buf = execFileSync('git', ['-C', REPO, 'show', spec], { maxBuffer: 64 * 1024 * 1024 });
  } catch (err) {
    throw new Error(`REFUSED: cannot read ${spec} — ${err?.message ?? err}`);
  }
  if (buf.length === 0) throw new Error(`REFUSED: ${spec} read as ZERO BYTES. That is the MSYS rev:path mangling signature, and an empty relocation reporting success is the failure this script exists to prevent.`);
  return { bytes: buf.length, label: spec, read: () => buf };
};

const moves = [];
for (const [src, round, kind] of plan.files) {
  const s = readSource(src);
  const dest = `${EVIDENCE}/${packet}/round${round}-${kind}.md`;
  if (existsSync(dest)) throw new Error(`REFUSED: destination already exists — ${dest}\nThis script never overwrites; a second run must not be able to redo or undo the first.`);
  moves.push({ src: s, dest, bytes: s.bytes });
}

console.log(`packet ${packet} (branch ${plan.branch}), ${moves.length} file(s), ${apply ? 'APPLYING' : 'DRY RUN — pass --apply to write'}`);
for (const m of moves) console.log(`  ${m.bytes.toString().padStart(7)} bytes  ->  ${m.dest.replace(`${REPO}/`, '')}`);
console.log('');
console.log('Still yours to do by hand, deliberately not automated:');
// THE REMOVAL LIST IS DERIVED FROM THE BRANCH, NOT HAND-WRITTEN — the same
// repair the mapping got, applied to the half that had kept the old defect.
// `rootFilesToRemoveByHand` was a second, hand-maintained list of the same
// population, and it went stale the moment rounds 4 and 5 were committed: the
// script happily printed a complete plan for eight files while naming only three
// of the five to remove. A LIST MAINTAINED BESIDE THE THING IT DESCRIBES IS A
// SECOND SOURCE, AND THE SECOND SOURCE IS THE ONE THAT ROTS. It is kept in the
// plan only as a cross-check: a disagreement is printed rather than resolved,
// because I do not know which side is wrong without looking.
const toRemove = rootEntries.filter((n) => /^RESULT\d+\.md$/.test(n)).sort();
for (const f of toRemove) console.log(`  git -C ${REPO} rm ${f}      (tracked at the branch root; deleting a tracked file is not a script's call)`);
const declared = new Set(plan.rootFilesToRemoveByHand ?? []);
const drift = [...toRemove.filter((f) => !declared.has(f)), ...[...declared].filter((f) => !toRemove.includes(f))];
if (drift.length > 0) console.log(`  NOTE: the plan's hand-written removal list disagrees with the branch on ${drift.length} file(s): ${drift.join(', ')} — the branch is what this list now follows`);
console.log(`  git -C ${REPO} add openspec/changes/two-desks-work-orders-and-trains/evidence/reviews/${packet}`);

if (!apply) process.exit(0);
for (const m of moves) {
  mkdirSync(dirname(m.dest), { recursive: true });
  writeFileSync(m.dest, m.src.read());
}
console.log('');
console.log(`copied ${moves.length} file(s). Nothing staged, nothing committed — that is yours.`);
