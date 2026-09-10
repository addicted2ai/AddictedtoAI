/**
 * Behavioural test for the revert guard's DERIVED-PATH branch, in a throwaway
 * repository under the OS temp directory. It never touches D:/AddictedtoAI.
 *
 * WHY THIS EXISTS RATHER THAN A RUN AGAINST REAL HISTORY: my first attempt at a
 * red case ran the guard over b98b823..HEAD and got "0 reverts, 0
 * recomputations" -- which is not a passing test, it is a test that NEVER
 * REACHED THE CODE. A green result from a case that cannot fail proves the
 * author's mental model and nothing else, and I nearly recorded it as a proof.
 *
 * THE PROPERTY UNDER TEST, both directions on the same input path:
 *   a derived path restored by a PULSE commit      -> recomputation, exit 0
 *   the same derived path restored by ANY OTHER    -> REVERT, exit 1
 * The second is the one that matters: if the fix were an exemption for
 * data/derived/ it would blind the guard to addictedtoai-lvba's own shape, a
 * JOB restoring derived state to a stale baseline, which lives under exactly
 * this prefix.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const GUARD = 'C:/Users/BadBitch/AppData/Local/Temp/claude/D--AddictedtoAI/b0a0272b-5058-41e7-ac66-431922257ff6/scratchpad/orch-revert-guard.mjs';
let fails = 0;
const check = (name, expected, actual) => {
  if (expected === actual) console.log(`  PASS  ${name}`);
  else { console.log(`  FAIL  ${name}: expected [${expected}] got [${actual}]`); fails++; }
};

function build(restoringSubject) {
  const dir = mkdtempSync(join(tmpdir(), 'rg-'));
  const git = (...a) => execFileSync('git', ['-C', dir, ...a], { encoding: 'utf8' });
  git('init', '-q', '-b', 'main');
  git('config', 'user.email', 't@example.com');
  git('config', 'user.name', 'T');
  mkdirSync(join(dir, 'data', 'derived'), { recursive: true });
  const p = join(dir, 'data', 'derived', 'freshness.json');

  writeFileSync(p, '{"checked":1}\n');                       // A
  git('add', '-A'); git('commit', '-qm', 'pulse: first run');

  writeFileSync(p, '{"checked":0}\n');                       // B, superseding A
  git('add', '-A'); git('commit', '-qm', 'job j-1: records (done)');
  const mainSha = git('rev-parse', 'HEAD').trim();

  git('checkout', '-qb', 'work');
  writeFileSync(p, '{"checked":1}\n');                       // back to A's content
  git('add', '-A'); git('commit', '-qm', restoringSubject);
  return { dir, mainSha };
}

function run(dir, branch, main) {
  try {
    // ORCH_REVERT_GUARD_REPO, not cwd: the guard passes an ABSOLUTE `-C` to git,
    // so a working directory does not redirect it. Setting cwd alone is what
    // made the first version of this test unable to fail.
    const out = execFileSync(process.execPath, [GUARD, branch, main], {
      cwd: dir, encoding: 'utf8', env: { ...process.env, ORCH_REVERT_GUARD_REPO: dir },
    });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? -1, out: (e.stdout ?? '') + (e.stderr ?? '') };
  }
}

console.log('== 1. GREEN: a Pulse commit restoring a derived value is a RECOMPUTATION ==');
{
  const { dir, mainSha } = build('pulse: 2026-09-08 data and content update');
  const r = run(dir, 'work', mainSha);
  // DID THE GUARD ACTUALLY LOOK AT THE FIXTURE? Asserted before anything else,
  // because the previous version of this test passed its cwd and not the repo
  // and therefore reported on D:/AddictedtoAI while appearing to pass. One
  // changed path is the fixture's signature; the real repository would report
  // twenty-five.
  check('the guard consulted the FIXTURE repo (1 path changed)', true, /paths changed \.+ 1/.test(r.out));
  check('exit 0', 0, r.code);
  check('counted as a recomputation', true, /derived recomputations \.+ 1/.test(r.out));
  check('zero reverts', true, /REVERTS \.+ 0/.test(r.out));
  check('names the Pulse as last writer', true, /last writer on the branch is a Pulse run/.test(r.out));
  rmSync(dir, { recursive: true, force: true });
}

console.log('== 2. RED: a JOB commit restoring the SAME value still REFUSES ==');
{
  const { dir, mainSha } = build('job j-2: repair from baseline');
  const r = run(dir, 'work', mainSha);
  check('exit 1', 1, r.code);
  check('counted as a revert', true, /REVERTS \.+ 1/.test(r.out));
  check('zero recomputations', true, /derived recomputations \.+ 0/.test(r.out));
  check('says why it is not exempt', true, /last writer on the branch is NOT a Pulse run/.test(r.out));
  check('refuses the push', true, /REFUSE THE PUSH/.test(r.out));
  rmSync(dir, { recursive: true, force: true });
}

console.log('== 3. RED: a non-derived path is untouched by the new branch ==');
{
  const dir = mkdtempSync(join(tmpdir(), 'rg-'));
  const git = (...a) => execFileSync('git', ['-C', dir, ...a], { encoding: 'utf8' });
  git('init', '-q', '-b', 'main');
  git('config', 'user.email', 't@example.com'); git('config', 'user.name', 'T');
  const p = join(dir, 'launch.json');
  writeFileSync(p, '{"v":1}\n'); git('add', '-A'); git('commit', '-qm', 'pulse: first');
  writeFileSync(p, '{"v":2}\n'); git('add', '-A'); git('commit', '-qm', 'later work');
  const mainSha = git('rev-parse', 'HEAD').trim();
  git('checkout', '-qb', 'work');
  writeFileSync(p, '{"v":1}\n'); git('add', '-A'); git('commit', '-qm', 'pulse: 2026-09-08 data');
  const r = run(dir, 'work', mainSha);
  check('a PULSE subject does NOT excuse a non-derived path', 1, r.code);
  check('counted as a revert', true, /REVERTS \.+ 1/.test(r.out));
  rmSync(dir, { recursive: true, force: true });
}

console.log('');
console.log(fails === 0 ? 'ALL REVERT-GUARD CHECKS PASS' : `${fails} CHECK(S) FAILED`);
process.exit(fails === 0 ? 0 : 1);
