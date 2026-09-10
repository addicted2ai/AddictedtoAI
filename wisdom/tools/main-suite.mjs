// Run main's whole suite, holding the same lease the other session holds.
//
// TWO REASONS THIS IS NOT JUST `npm test`.
//
// 1. THE LOCK IS SYMMETRIC OR IT IS DECORATION. A2AI-Orch writes
//    D:/addictedtoai-coord/GATE-RUNNING as its first action so my guard can see
//    a run whose processes do not exist yet. A protocol only one party keeps is
//    a courtesy, not a mechanism, so this writes the same file in the same
//    shape. It is removed in a `finally` — a lock that survives a crash is worse
//    than no lock, because the next reader believes it.
// 2. THE COUNT IS THE POINT. Two merges landed real code on main after the last
//    green gate, and the ratchet's baseline was 1926 at c15e901. What the suite
//    counts NOW is a measurement somebody has to take before the number is
//    quoted anywhere.
import { execFileSync } from 'node:child_process';
import { writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';

const LOCK = 'D:/addictedtoai-coord/GATE-RUNNING';
const REPO = 'D:/AddictedtoAI';

if (existsSync(LOCK)) {
  console.log('REFUSED — the lock is already held:');
  console.log(readFileSync(LOCK, 'utf8'));
  process.exit(3);
}

const sha = execFileSync('git', ['-C', REPO, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
const started = new Date().toLocaleString('sv-SE').replace('T', ' ');
writeFileSync(LOCK, [
  `sha_intended\t${sha}`,
  `pid\t${process.pid}`,
  `started\t${started} MDT`,
  `rundir\t(none — npm test only, not a full gate)`,
  `writer\tA2AI-Fable-Arch`,
  '',
].join('\n'), 'utf8');
console.log(`lock written — sha ${sha}, started ${started}`);

let out = '';
let status = 0;
try {
  out = execFileSync('npm', ['--prefix', REPO, 'test'], { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024, shell: true });
} catch (err) {
  out = `${err.stdout ?? ''}${err.stderr ?? ''}`;
  status = err.status ?? 1;
} finally {
  rmSync(LOCK, { force: true });
  console.log(`lock removed — present: ${existsSync(LOCK)}`);
}

// The totals, read from the runner's own counters rather than from an
// impression of the tail. A truncated tail and a complete one look the same.
//
// THE FIRST VERSION OF THIS PARSER MATCHED `# tests N` AND THE RUNNER PRINTS
// `ℹ tests N`. It returned null for every counter, which read as "nothing was
// measured" — the right failure, and only because null was left visible instead
// of being defaulted to 0. A COUNTER THAT DEFAULTS TO ZERO ON A PARSE MISS
// REPORTS A GREEN SUITE OF NO TESTS AS A GREEN SUITE.
//
// Both shapes are accepted now: Node's default reporter prints `ℹ`, its TAP
// reporter prints `#`, and which one appears depends on whether stdout is a TTY
// — a distinction this script has no business depending on.
const grab = (name) => {
  const m = new RegExp(`^(?:#|\\u2139) ${name} (\\d+)$`, 'm').exec(out);
  return m ? Number(m[1]) : null;
};
console.log(`EXIT ${status}`);
console.log(`tests ${grab('tests')}  pass ${grab('pass')}  fail ${grab('fail')}  cancelled ${grab('cancelled')}  skipped ${grab('skipped')}  todo ${grab('todo')}`);
const failed = [...out.matchAll(/^not ok \d+ - (.+)$/gm)].map((m) => m[1]);
console.log(`failing subtests named: ${failed.length}`);
for (const f of failed.slice(0, 40)) console.log(`  ${f}`);
// The raw output is kept because the counters are parsed from it, and a parser
// repaired later must be re-run against THIS run's bytes rather than against a
// fresh run — re-running to fix a parser measures a different run to answer a
// question about this one.
const rawOut = process.env.ARCH_SCRATCH ? `${process.env.ARCH_SCRATCH}/main-suite-raw.txt` : `${REPO}/main-suite-raw.txt`;
writeFileSync(rawOut, out, 'utf8');
console.log(`raw output kept at ${rawOut}`);
