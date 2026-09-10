// Prove the quiet-tree guard against a DECOY REPOSITORY I dirty on purpose.
//
// TWO REASONS THE PREVIOUS PROOF RUN WAS NOT WHAT IT SAID IT WAS, and both are
// mine:
//
// 1. THE TEST BED EXPIRED UNDER ME WITHOUT ANNOUNCING IT. I had been using
//    `w3-records` as "the dirty tree" because a worker was mid-write in it. That
//    worker committed at 2c3d026 between my runs, so every row I labelled "on a
//    dirty tree" was measured on a CLEAN one. The verdicts happened to stay
//    right — the universal-token check fires before the tree is read — but the
//    LABEL was false, and a proof's label is the part that gets relayed.
//    **A TEST WHOSE VALIDITY RESTS ON A LIVE THIRD PARTY'S UNCOMMITTED STATE
//    EXPIRES SILENTLY, AND NOTHING IN ITS OUTPUT SAYS SO.** Same shape as the
//    mtime anchors whose trustworthiness was session-only knowledge.
//
// 2. GIT BASH NEVER PASSED `/` TO NODE. Measured: argv arrived as
//    "C:/Program Files/Git/". The guard behaved correctly on the string it was
//    actually given, and its correct behaviour read as a hole. Third instance of
//    this trap tonight after `git show "rev:path"` (CLAUDE.md's own) and
//    `TZ=Pacific/Niue`. So the universal tokens are declared HERE, as literals in
//    a file, where no shell can touch them.
//
// The decoy is created, dirtied, measured and removed by this script, so it
// cannot expire and it cannot be a live tree somebody else is writing to.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { requireQuietTree } from './orch-require-quiet-tree.mjs';

const root = mkdtempSync(`${tmpdir()}/orch-decoy-`).replace(/\\/g, '/');
const git = (...a) => execFileSync('git', ['-C', root, ...a], { encoding: 'utf8', shell: false });

git('init', '-q');
git('config', 'user.email', 'decoy@example.invalid');
git('config', 'user.name', 'decoy');
writeFileSync(`${root}/tracked.txt`, 'one\n');
writeFileSync(`${root}/standing.txt`, 'two\n');
git('add', 'tracked.txt', 'standing.txt');
git('commit', '-qm', 'base');
// Now dirty it in two distinguishable ways: one file that is EXPECTED to stand,
// one that is not, plus an untracked file that must never refuse.
writeFileSync(`${root}/tracked.txt`, 'one changed\n');
writeFileSync(`${root}/standing.txt`, 'two changed\n');
writeFileSync(`${root}/untracked.txt`, 'three\n');

const porcelain = git('status', '--porcelain').trim().split('\n');
console.log(`DECOY ${root}`);
porcelain.forEach((l) => console.log(`  ${l}`));
console.log('');

// Each case runs in a CHILD, because the guard's refusal is process.exit(3) and a
// guard that exits is the correct design — a test that needed it to return would
// be testing a weaker guard than the one that ships.
const CASES = [
  ['no prefixes', []],
  ['standing.txt declared (the real exception)', ['standing.txt']],
  ['BOTH declared — nothing unexplained left', ['standing.txt', 'tracked.txt']],
  ['universal ""', ['']],
  ['universal "."', ['.']],
  ['universal "./"', ['./']],
  ['universal "/"  <- the one the shell ate last time', ['/']],
  ['universal "*"', ['*']],
  ['universal "**"', ['**']],
  ['good prefix with a universal APPENDED', ['standing.txt', '']],
  ['typo prefix that matches nothing', ['standingg.txt']],
];

const RUNNER = `${import.meta.dirname}/orch-quiet-tree-case.mjs`;
let allowed = 0, refused = 0;
for (const [label, expected] of CASES) {
  let code = 0, out = '';
  try {
    out = execFileSync(process.execPath, [RUNNER, root, JSON.stringify(expected)], {
      encoding: 'utf8', shell: false,
    });
  } catch (e) { code = e.status ?? 1; out = (e.stdout ?? '') + (e.stderr ?? ''); }
  const verdict = code === 0 ? 'ALLOW ' : `REFUSE(${code})`;
  code === 0 ? allowed++ : refused++;
  const detail = (out.match(/^ {2}(standing \(declared\).*|REFUSING:.*)$/m) || [''])[0].trim();
  console.log(`  ${verdict}  ${label.padEnd(44)} ${detail.slice(0, 96)}`);
}
console.log('');
console.log(`cases ${CASES.length}   allowed ${allowed}   refused ${refused}`);
// PREDICTION WRITTEN BEFORE THE RUN, AND IT WAS WRONG BY ONE. I first wrote
// "the two rows that declare every modified file" — there is exactly ONE. Row 2
// declares `standing.txt` and leaves `tracked.txt` unexplained, which is the
// whole point of that row. The guard was right and my expectation was sloppy,
// which is the harmless direction; the reason it is left recorded rather than
// quietly corrected is that a prediction edited to match the result stops being
// a prediction. Corrected: EXACTLY ONE.
console.log('Expected: ALLOW for exactly ONE row — the only one declaring every modified file.');
console.log('Anything else allowing is a hole. (First draft of this line said "two"; see the comment.)');

rmSync(root, { recursive: true, force: true });
console.log(`decoy removed: ${root}`);
