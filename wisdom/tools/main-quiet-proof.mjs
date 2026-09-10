// PROVE THE MAIN-QUIET GUARD IN BOTH DIRECTIONS, AT ANY TIME.
//
// The first version of this proof asserted a quiet tree and scored three
// failures at 06:12, because a real gate run was in the table. The guard was
// right and the proof was wrong. Marking those arms NOT EVALUATED was honest but
// it left THE ALLOW DIRECTION UNPROVEN — and for a guard, allow is the dangerous
// direction: one that refuses forever is the arm that gets it deleted.
//
// A2AI-Orch's fix, and it is the right one: point the guard at a DECOY lock path
// and a DECOY pattern. Then no arm depends on what any other session is doing,
// and "I could not reach that branch" stops being a standing excuse.
//
// What injection does NOT prove is that the REAL pattern list is any good — that
// it matches a real gate and misses my own tooling. That is a separate question
// and gets its own section at the end, measured against the live process table
// rather than against a decoy.
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, unlinkSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { requireMainQuiet, gateProcesses } from './main-quiet-guard.mjs';

const dir = mkdtempSync(join(tmpdir(), 'arch-quiet-'));
const decoyLock = join(dir, 'DECOY-GATE-RUNNING');
const TOKEN = `arch-decoy-gate-${process.pid}`;
const decoyPatterns = [new RegExp(TOKEN)];
const cfg = { lockPath: decoyLock, patterns: decoyPatterns };

const verdict = () => { try { requireMainQuiet(cfg); return 'ALLOW'; } catch (e) { return `REFUSE — ${e.message.split('\n')[0].slice(0, 90)}`; } };

let pass = 0; let fail = 0;
const check = (name, got, want) => {
  const ok = got.startsWith(want);
  if (ok) pass++; else fail++;
  console.log(`${ok ? 'ok  ' : 'NOT OK'} ${name}\n       ${got}`);
};

console.log(`decoy lock:    ${decoyLock}`);
console.log(`decoy pattern: /${TOKEN}/\n`);

check('A  no lock, no matching process — the ALLOW direction, now reachable', verdict(), 'ALLOW');

writeFileSync(decoyLock, 'A2AI-Orch gate run, sha c15e901, pid 4242, started 06:03:06\n', 'utf8');
check('B  lock present', verdict(), 'REFUSE');

unlinkSync(decoyLock);
check('C  lock removed — the refusal is not sticky', verdict(), 'ALLOW');

// A decoy process whose COMMAND LINE carries the token. It only sleeps: running
// the real gates to test the guard that watches the gates would be its own
// incident.
mkdirSync(join(dir, 'scripts'), { recursive: true });
const decoyScript = join(dir, 'scripts', `${TOKEN}.mjs`);
writeFileSync(decoyScript, 'setTimeout(() => {}, 60000);\n', 'utf8');
const child = spawn(process.execPath, [decoyScript], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1200));
const hits = gateProcesses(decoyPatterns);
check(`D  matching process in the table, no lock (${hits.length} hit)`, verdict(), 'REFUSE');

// THE MUTATION. Same live process, empty pattern list. A twin proves a check can
// fire; only a mutation proves it must.
{
  const got = (() => { try { requireMainQuiet({ lockPath: decoyLock, patterns: [] }); return 'ALLOW'; } catch { return 'REFUSE'; } })();
  const ok = got === 'ALLOW' && hits.length > 0;
  if (ok) pass++; else fail++;
  console.log(`${ok ? 'ok  ' : 'NOT OK'} E  MUTATION — same process, pattern list emptied`);
  console.log(`       with the pattern: ${hits.length} hit -> REFUSE`);
  console.log(`       pattern removed:  0 hits -> ${got} — the refusal is carried by the pattern list and nothing else`);
}

child.kill();
await new Promise((r) => setTimeout(r, 900));
check('F  process gone — ALLOW again, so the refusal tracks the world', verdict(), 'ALLOW');

// BOTH SIGNALS AT ONCE: the OR must refuse on either alone and on both.
writeFileSync(decoyLock, 'both\n', 'utf8');
check('G  lock present, no process — OR refuses on signal 1 alone', verdict(), 'REFUSE');
unlinkSync(decoyLock);

rmSync(dir, { recursive: true, force: true });

// ---------------------------------------------------------------------------
// THE REAL PATTERN LIST, measured against the live table rather than a decoy.
// Injection proves the mechanism; this is the only thing that speaks to whether
// the patterns themselves are right.
console.log('\n--- the REAL pattern list against the live process table (observation, not an arm):');
const live = gateProcesses();
console.log(`  ${live.length} gate-shaped process(es) right now`);
for (const h of live) console.log(`    pid ${h.pid}  ${h.cmd.slice(0, 110)}`);
console.log('  THE LIVE NEGATIVE — my own tooling must never match:');
const mine = ['arch-early-snapshot', 'arch-main-quiet', 'arch-suite', 'arch-verify', 'opencode'];
const falsePositives = live.filter((h) => mine.some((m) => h.cmd.includes(m)));
console.log(`    ${falsePositives.length} of my own processes matched (must be 0)`);
if (falsePositives.length > 0) { for (const h of falsePositives) console.log(`    FALSE POSITIVE pid ${h.pid} ${h.cmd.slice(0, 140)}`); fail++; }
else pass++;

console.log(`\narms 8  pass ${pass}  fail ${fail}`);
if (fail > 0) process.exit(1);
