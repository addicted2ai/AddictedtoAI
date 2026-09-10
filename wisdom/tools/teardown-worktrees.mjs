// TEAR DOWN THE FIVE FINISHED PACKET WORKTREES, IN THE ONE ORDER THAT WORKS.
//
// The order is not a preference and it was measured at 03:20:
//
//   `pulse-lease` and `lease-review` carry a node_modules JUNCTION into the main
//   tree's node_modules. `git worktree remove` walks the tree, follows the
//   junction, and starts deleting the MAIN TREE'S dependencies. So for those
//   two: DELETE THE JUNCTION FIRST, then remove the worktree.
//
//   `w2-claims`, `w3-records` and `w3-review` have no junction. Re-measured
//   before this ran rather than trusted: `ls -ld` on each reported a link for
//   exactly the first two and nothing for the other three.
//
// THREE PROHIBITIONS, each of which has a reason and none of which is caution:
//   - NEVER `--force`. Force is what turns "you have uncommitted work here" from
//     a refusal into a silent deletion, and a refusal is the only thing standing
//     between a teardown and unmerged work.
//   - NEVER `git worktree prune`. It operates on the whole registry rather than
//     on what this script was asked to remove, so its blast radius is every
//     other session's worktree and not mine.
//   - NEVER delete a TRACKED file. Removing a worktree is not the same act as
//     deleting work, and the check below is what keeps them different.
//
// The refusal that matters: each worktree is checked for uncommitted tracked
// changes AND for whether its branch is merged into main. Either one unmet and
// that worktree is skipped with the reason printed. A teardown that removed four
// of five and said nothing about the fifth is the silence-reads-as-completeness
// defect this repository keeps producing.
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readdirSync, readFileSync, rmdirSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';

const REPO = 'D:/AddictedtoAI';
const apply = process.argv.includes('--apply');

// [directory, branch-or-null(detached), carries a node_modules junction]
const TARGETS = [
  ['D:/addictedtoai-worktrees/pulse-lease', 'pulse/lease', true],
  ['D:/addictedtoai-worktrees/lease-review', null, true],
  ['D:/addictedtoai-worktrees/w2-claims', 'wisdom/w2-claims', false],
  ['D:/addictedtoai-worktrees/w3-records', 'wisdom/w3-records', false],
  ['D:/addictedtoai-worktrees/w3-review', null, false],
];

const git = (args, opts = {}) => execFileSync('git', args, { encoding: 'utf8', ...opts });
const say = (s) => console.log(s);

const head = git(['-C', REPO, 'rev-parse', '--abbrev-ref', 'HEAD']).trim();
if (head !== 'main') throw new Error(`REFUSED: ${REPO} is on ${head}, not main.`);

for (const [dir, branch, hasJunction] of TARGETS) {
  say(`${dir}`);
  if (!existsSync(dir)) { say('  already gone\n'); continue; }

  // 1. Uncommitted TRACKED changes refuse. Untracked files do not — a job
  //    envelope (.agent-brief.md) is scratch by contract and is not work.
  const porcelain = git(['-C', dir, 'status', '--porcelain']);
  const trackedDirty = porcelain.split('\n').filter((l) => l.trim() && !l.startsWith('??'));
  if (trackedDirty.length > 0) {
    say(`  SKIPPED — ${trackedDirty.length} uncommitted tracked change(s):`);
    for (const l of trackedDirty) say(`    ${l}`);
    say('');
    continue;
  }
  // UNTRACKED IS NOT THE SAME AS NOT-WORK, AND THE FIRST VERSION OF THIS SCRIPT
  // SAID IT WAS. It printed "N untracked file(s), not work" and moved on — but
  // the dry run listed `REVIEW3.md` in two worktrees and `RESULT3/RESULT4.md` in
  // a third, and those are sealed reviews and round reports, which are exactly
  // the work this whole night produced. They happen to be safe to delete because
  // each was relocated into the evidence tree minutes earlier. THAT IS A FACT
  // ABOUT THIS MOMENT, NOT A PROPERTY OF UNTRACKED FILES, so it is now measured
  // per file instead of assumed: an untracked file is deletable only if some
  // committed file in the evidence tree has its exact bytes. Anything else stops
  // the teardown of that worktree and says which file and why.
  const untracked = porcelain.split('\n').filter((l) => l.startsWith('??')).map((l) => l.slice(3).trim());
  if (untracked.length > 0) {
    const evidence = `${REPO}/openspec/changes/two-desks-work-orders-and-trains/evidence/reviews`;
    const committed = new Map();
    const walk = (d) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const full = `${d}/${e.name}`;
        if (e.isDirectory()) walk(full);
        else committed.set(createHash('sha256').update(readFileSync(full)).digest('hex'), full);
      }
    };
    if (existsSync(evidence)) walk(evidence);
    const orphans = [];
    for (const rel of untracked) {
      const p = `${dir}/${rel}`;
      if (!existsSync(p) || lstatSync(p).isDirectory()) { say(`  untracked ${rel} — a directory, not checked`); continue; }
      const h = createHash('sha256').update(readFileSync(p)).digest('hex');
      const twin = committed.get(h);
      if (twin) say(`  untracked ${rel} — byte-identical to ${twin.replace(`${REPO}/`, '')}, so its content survives this deletion`);
      else orphans.push(rel);
    }
    // Git refuses to remove a worktree holding untracked files and tells you to
    // use --force. THAT IS THE ONE THING THIS SCRIPT WILL NOT DO: --force is a
    // blanket instruction to delete whatever is there, including the modified
    // tracked file the refusal above exists to catch. The narrow act is to
    // delete the SPECIFIC files just proven to have committed twins, one at a
    // time, and then let git's own refusal stand guard over everything else. A
    // guardrail is not loosened by satisfying the condition it checks for.
    if (orphans.length === 0 && untracked.length > 0 && apply) {
      for (const rel of untracked) {
        const p = `${dir}/${rel}`;
        if (existsSync(p) && !lstatSync(p).isDirectory()) { unlinkSync(p); say(`  deleted ${rel} (twin committed)`); }
      }
    }
    if (orphans.length > 0) {
      say(`  SKIPPED — ${orphans.length} untracked file(s) with NO committed twin; deleting them would lose the only copy:`);
      for (const o of orphans) say(`    ${o}`);
      say('');
      continue;
    }
  }

  // 2. The branch must be merged into main. A detached worktree has no branch to
  //    check, and says so rather than passing quietly.
  if (branch) {
    const merged = git(['-C', REPO, 'branch', '--merged', 'main']).split('\n').map((l) => l.replace(/^[*+ ]+/, '').trim());
    if (!merged.includes(branch)) { say(`  SKIPPED — ${branch} is NOT merged into main\n`); continue; }
    say(`  ${branch} is merged into main`);
  } else {
    const sha = git(['-C', dir, 'rev-parse', 'HEAD']).trim();
    const contains = git(['-C', REPO, 'branch', '--contains', sha]).split('\n').map((l) => l.replace(/^[*+ ]+/, '').trim());
    if (!contains.includes('main')) { say(`  SKIPPED — detached at ${sha.slice(0, 7)}, which main does not contain\n`); continue; }
    say(`  detached at ${sha.slice(0, 7)}, contained in main`);
  }

  // 3. The junction goes FIRST, and only if it really is a link.
  const nm = `${dir}/node_modules`;
  if (existsSync(nm)) {
    const isLink = lstatSync(nm).isSymbolicLink();
    if (!isLink) { say(`  SKIPPED — ${nm} is a REAL DIRECTORY, not a junction. Removing the worktree would delete it, and this script does not delete real dependency trees.\n`); continue; }
    if (!hasJunction) say('  NOTE: a junction is present that the plan did not declare — the world wins, and it is removed first');
    // `rmSync(..., { recursive: false })` throws ERR_FS_EISDIR here: Windows
    // reports a directory junction as a directory, so the non-recursive unlink
    // path refuses it. `recursive: true` would be the obvious next thing to
    // reach for AND IT IS THE DANGEROUS ONE — it is the call that could walk
    // through the reparse point into the main tree's dependencies, which is the
    // entire hazard this ordering exists to avoid. `rmdirSync` removes the
    // reparse point itself and cannot recurse, so it is the only correct call.
    //
    // Belt and braces, because "cannot recurse" is a claim about an API on a
    // platform: the main tree's node_modules is counted before and after, and a
    // drop of even one entry stops the whole teardown.
    const mainNm = `${REPO}/node_modules`;
    const before = existsSync(mainNm) ? readdirSync(mainNm).length : null;
    say(`  junction present -> removing the reparse point first${apply ? '' : ' (dry run)'}${before === null ? '' : `; main node_modules holds ${before} entries`}`);
    if (apply) {
      rmdirSync(nm);
      const after = existsSync(mainNm) ? readdirSync(mainNm).length : null;
      if (before !== null && (after === null || after < before)) {
        throw new Error(`STOPPED: removing ${nm} changed the MAIN tree's node_modules from ${before} to ${after}. The junction was followed. Nothing further is removed.`);
      }
      say(`  junction gone; main node_modules still holds ${after} entries`);
    }
  } else if (hasJunction) {
    say('  NOTE: the plan declared a junction and there is none — already removed, nothing to do');
  }

  say(`  git worktree remove ${dir}${apply ? '' : '   (dry run)'}`);
  if (apply) {
    try {
      git(['-C', REPO, 'worktree', 'remove', dir]);
      say('  removed');
    } catch (err) {
      say(`  REFUSED BY GIT — left standing, and NOT forced: ${String(err.message).split('\n')[0]}`);
    }
  }
  say('');
}

say(apply ? 'done — no --force used, no prune run' : 'DRY RUN — pass --apply');
