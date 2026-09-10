// REFUSE TO COMMIT TO MAIN WHILE A GATE RUN IS MEASURING IT.
//
// Written 2026-09-10 06:10, immediately after doing exactly this. A2AI-Orch told
// me its gate run had started; I committed to main four minutes later without
// connecting the two. Measured afterwards: the run began 06:03:06 and my commit
// landed 06:04:07, SIXTY-ONE SECONDS IN, while `npm test` was executing. The run
// therefore attested to a tree that was 99b2112 for its first minute and
// c15e901 for the rest — neither sha describes what was measured, and Orch
// discarded ten minutes of gate time.
//
// The delta could not have moved a gate (one markdown file, 57 insertions, no
// code path). That is not a defence and Orch's answer is the right one:
// "THE CHANGE COULD NOT HAVE MATTERED" IS REASONING, AND THE GATE'S WHOLE JOB IS
// TO BE A MEASUREMENT.
//
// ---------------------------------------------------------------------------
// WHY THIS IS A DETECTOR AND NOT AN HONOUR SYSTEM.
//
// We agreed a rule — main stays quiet from the moment a run starts. A rule I
// have to remember is precisely the thing that just failed, and restating a
// preference after each failure is what this whole repository replaces with
// mechanism. So there are TWO signals, and the second is the one that matters:
//
//   1. A LOCK FILE the other session writes. Cheap, explicit, and it carries who
//      and since when. Its weakness is total: IT ONLY WORKS IF THE OTHER PARTY
//      SETS IT, and if they forget we are exactly where we were this morning.
//   2. THE RUNNING PROCESSES THEMSELVES. This needs nobody to remember anything.
//      A gate run is `next build`, `run-tests`, and the four `verify-*` scripts;
//      if one of those is in the process table, a gate is measuring this tree
//      whatever any flag says.
//
// I FIRST WROTE THAT SIGNAL 2 WAS THE INSTRUMENT AND SIGNAL 1 ONLY A COURTESY.
// THAT WAS REASONING, AND A2AI-Orch's RUN LOG DISPROVED IT WITHIN MINUTES:
//
//   06:03:06  harness starts, announces it is gating 99b2112
//   06:04:07  my commit lands
//   06:06:42  "=== 1-test starting ===" — the first moment run-tests.mjs EXISTS
//
// THERE IS A 3 MINUTE 36 SECOND WINDOW AT THE START OF EVERY RUN IN WHICH NO
// GATE PROCESS IS IN THE TABLE — pre-flight contention checks, the environment
// census, the pin loop, and a `du -sk` over 227 MB of .next. My commit landed 61
// seconds into it. THIS GUARD WOULD HAVE READ THE TABLE AND CORRECTLY REPORTED
// QUIET. It caught pid 18852 at 06:12 only because gate 1 had been running five
// minutes by then.
//
// So the general principle — a guard resting on a flag someone else sets has its
// subject list written by the party it guards against — is true and was the
// wrong tool for this decision. The automatic signal's blind window sits exactly
// where the incident happened.
//
//   AN AUTOMATIC SIGNAL IS NOT AUTOMATICALLY THE STRONGER ONE. ASK WHERE ITS
//   BLIND WINDOW IS, BECAUSE A DETECTOR THAT CAN ONLY SEE A PROCESS ONCE THE
//   PROCESS EXISTS IS BLIND FOR EXACTLY AS LONG AS THE SETUP TAKES — AND SETUP
//   IS WHEN A RUN LOOKS IDLE TO EVERYONE ELSE.
//
// Both signals, OR'd. Signal 1 covers the front window signal 2 cannot see;
// signal 2 covers the other session forgetting to write signal 1. Neither is
// sufficient and the insufficiency of each is now measured rather than argued.
//
// THE ASYMMETRY, deliberately the same one the worktree guard settled on: too
// broad REFUSES and too narrow only reports. A pattern that matches my own
// verifiers would block me constantly and get this file deleted within a day, so
// the patterns are narrow and specific, every match is PRINTED with its pid and
// command line, and a refusal is always diagnosable. If it matches nothing, it
// says so rather than implying the tree is safe.
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const LOCK = 'D:/addictedtoai-coord/GATE-RUNNING';

// Narrow on purpose. These are the six gates plus the build they share. My own
// scripts are all `arch-*.mjs` and none of them match, which was checked rather
// than assumed — see arch-main-quiet-guard-proof.mjs.
const GATE_PATTERNS = [
  /scripts[\\/]run-tests\.mjs/i,
  /scripts[\\/]verify-launch\.mjs/i,
  /scripts[\\/]verify-design\.mjs/i,
  /scripts[\\/]verify-surfaces\.mjs/i,
  /scripts[\\/]verify-analytics\.mjs/i,
  /scripts[\\/]measure-payload\.mjs/i,
  /scripts[\\/]prebuild\.mjs/i,
  /next[\\/]dist[\\/]bin[\\/]next.*\bbuild\b/i,
];

// Both inputs are INJECTABLE, and that is Orch's point rather than a
// convenience. The ALLOW direction of this guard can only be exercised in a
// state where no lock exists and no gate runs — a state I can reach only between
// another session's runs, and testing it by deleting a live lock would prove the
// wrong thing. With a decoy lock path and a decoy pattern, both directions are
// reachable at any moment. The live defaults stay the live defaults; what the
// injection buys is that the UNPROVEN DIRECTION STOPS BEING THE ONE I CANNOT
// REACH, which is the direction that gets a guard deleted.
export function gateProcesses(patterns = GATE_PATTERNS) {
  let raw = '';
  try {
    raw = execFileSync('powershell.exe', ['-NoProfile', '-Command',
      "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ForEach-Object { \"$($_.ProcessId)`t$($_.CommandLine)\" }",
    ], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  } catch (err) {
    // A guard that cannot read the process table must not report "clear".
    throw new Error(`REFUSED: cannot read the process table, so I cannot tell whether a gate is running — ${err?.message ?? err}`);
  }
  const hits = [];
  for (const line of raw.split('\n')) {
    const tab = line.indexOf('\t');
    if (tab < 0) continue;
    const pid = line.slice(0, tab).trim();
    const cmd = line.slice(tab + 1).trim();
    if (!cmd) continue;
    const pat = patterns.find((p) => p.test(cmd));
    if (pat) hits.push({ pid, cmd, pat: String(pat) });
  }
  return hits;
}

export function requireMainQuiet({ lockPath = LOCK, patterns = GATE_PATTERNS } = {}) {
  const reasons = [];

  const locked = existsSync(lockPath);
  if (locked) {
    let body = '';
    try { body = readFileSync(lockPath, 'utf8').trim(); } catch { body = '(unreadable)'; }
    reasons.push(`the coordination lock ${lockPath} exists — ${body || '(empty)'}`);
  }

  const hits = gateProcesses(patterns);
  for (const h of hits) reasons.push(`pid ${h.pid} matches ${h.pat}\n      ${h.cmd.slice(0, 200)}`);

  console.error(`main-quiet check: lock ${locked ? 'PRESENT' : 'absent'}, ${hits.length} gate-shaped process(es) in the table`);

  if (reasons.length > 0) {
    throw new Error(
      'REFUSED: a gate run appears to be measuring main right now, so main must stay quiet.\n'
      + reasons.map((r) => `  - ${r}`).join('\n')
      + '\n\nA gate attests to a TREE. A commit landing mid-run means the run measured neither\n'
      + 'the sha it started at nor the sha it ended at, and the ten minutes are wasted.\n'
      + '"The change could not have mattered" is reasoning; the gate exists to be a measurement.\n'
      + 'Wait for the run to report, then commit.',
    );
  }
  return true;
}

if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  try {
    requireMainQuiet();
    console.log('main is quiet — no lock, no gate-shaped process. Safe to commit.');
    console.log('BOUND: this sees a lock the other session chose to write, and processes on THIS machine.');
    console.log('It cannot see a run that has not started yet but is about to.');
  } catch (err) {
    console.error(err.message);
    process.exit(7);
  }
}
