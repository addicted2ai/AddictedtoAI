#!/usr/bin/env node
// The docket/HOLD.md stop mechanism in scripts/orchestrate.sh, exercised by
// actually running the real script -- not by diffing a frozen span of its
// text. Run from the repository root:
//
//   node scripts/test-orchestrate-hold.mjs
//
// CHARTER.md rule 13a reserves "the stop mechanism" -- not, as first
// written, because it is how the maintainer intervenes in a running loop:
// `git log --all -- docket/HOLD.md` shows ten commits, five hold/release
// pairs, every one the orchestrator or a round halting itself. Nothing has
// run unattended since the supervisor died on 2026-08-18, so there is no
// live loop today for a human to reach into via this file at all -- the
// maintainer's actual intervention is starting each session by hand.
// `docket/HOLD.md` is the loop's own signal that it hit something a human
// must decide, and CHARTER.md's own preamble already says the intent is for
// runs to become scheduled; the day that happens, this file becomes a real
// remote brake. It is worth protecting now, before that day, for the same
// reason a brake is fitted before the car needs one -- but the realistic
// threat against it today is not an adversary evading a human's stop
// command, because no such command is currently in play. It is a future
// round breaking the mechanism by accident: a refactor that moves halt(), a
// rewrite that drops the check, a change that looks harmless.
//
// The check that first shipped alongside rule 13a,
// scripts/check-hold-mechanism.mjs, froze the three-line `if [ -s
// docket/HOLD.md ]; then halt ...; fi` block byte for byte. Adversarial
// review, posed against an adversarial threat model, defeated it three ways
// across three passes:
//
//   1. `: > docket/HOLD.md` inserted in the loop, above the frozen block:
//      truncates the file before `-s` ever tests it, every iteration.
//   2. Gutting halt() (defined elsewhere in the same file, out of the frozen
//      span): the frozen block still calls halt(), byte for byte, and
//      halting does nothing once inside it.
//   3. `( sleep 2; : > docket/HOLD.md ) &` inserted before the check: the
//      main loop still sees the file held, still halts, still logs the
//      correct line, and the orphaned background job clears the hold two
//      seconds later, after the observation already passed. This also
//      exposed a real, independent bug in this file, unrelated to the
//      threat-model question: `child.on("close")` waits for every process
//      holding the child's inherited stdio to finish, so with the
//      background job still running, `close` did not fire for two seconds
//      either. Fixed below regardless of threat model: `exit` (the direct
//      child's own termination) replaces `close`.
//
// IS THIS CONVERGENT? Posed once against an adversarial model (can a
// reviewer trying to defeat this test always construct a way to) and
// answered honestly rather than patched a fourth time on faith: no, not
// under that model -- any bounded-time observation of code the loop can
// edit can be defeated by code timed to behave correctly for exactly the
// length of the observation. That was the wrong model to test against,
// though, corrected mid-round once the git log above was actually read:
// bypasses 1-3 are all adversarial constructions, built by a reviewer
// trying to defeat a guard on purpose, and nothing in this project's
// history shows that shape of attacker. Posed again against the model the
// evidence supports -- an ordinary future round accidentally breaking the
// mechanism while refactoring something else -- the answer flips: yes, this
// converges. An accidental regression does not construct a bypass tuned to
// this test's observation window; it just breaks the check, in the
// straightforward way this file actually runs the script and watches, which
// is exactly what an accidental break looks like from the outside. Bypass 3
// specifically is not defended against here, on purpose, because building
// machinery against a threat this project's own record does not show is the
// same complexity-for-its-own-sake CHARTER.md rule 21 already warns against
// -- CHARTER.md rule 13a and this round's History name it as a known,
// understood, deliberately unguarded case rather than an oversight.
//
// So this test copies the real scripts/orchestrate.sh,
// scripts/orchestrate-liveness.sh and scripts/orchestrate-peak.sh into an
// isolated temporary directory -- deliberately without
// scripts/peak-window.mjs or policy.yml, so peak_guard (the next guard in
// the loop) fails closed and retries forever rather than ever reaching git
// or a real launch -- and actually runs `bash scripts/orchestrate.sh`
// against a controlled docket/HOLD.md, reading its own log for what it
// actually did. Never the real repository's own docket/HOLD.md or working
// tree.
//
// Scenarios 1-3 test the real, current file as it ships. Scenarios 4-5 are
// permanent regression guards for bypasses 1 and 2 -- both plausible as
// accidental regressions (a stray cleanup line, a refactored halt() that
// drops its exit), unlike bypass 3, which is not given a scenario here for
// the reason stated above.
//
// THE LIMIT THIS TEST DOES NOT CLOSE, STATED RATHER THAN IMPLIED: this
// proves the code in this repository halts when actually run, here, now,
// which is what it needs to prove against the threat it actually defends
// against -- accidental regression, not adversarial evasion. It cannot
// prove that the orchestrate.sh process actually running at any given
// moment, on whatever machine the maintainer started it on, is this code,
// unmodified -- that process runs outside CI, on a machine CI never sees.
// And it does not defend against a deliberately delayed or
// externally-triggered clearing (bypass 3) at all, by choice, not by gap
// nobody noticed. The same honesty CHARTER.md's preamble already applies to
// `enforce_admins: false` (a real, verified property of this repository,
// not a guarantee about what an admin does with their access) applies here.

import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

let failures = 0;
const ok = (m) => console.log(`ok    ${m}`);
const bad = (m) => {
  console.log(`FAIL  ${m}`);
  failures++;
};

const ROOT = process.cwd();
const SOURCE_FILES = [
  "scripts/orchestrate.sh",
  "scripts/orchestrate-liveness.sh",
  "scripts/orchestrate-peak.sh",
];

// The line peak_guard's fail-closed default case logs when
// scripts/peak-window.mjs cannot be read -- deliberately absent from the
// sandbox, so this line is the "we got past the HOLD.md check and reached
// the next guard" signal, and it repeats every ORCHESTRATE_GAP seconds
// forever, since nothing else in the sandbox can ever satisfy it.
const PAST_HOLD_CHECK = /peak-window check did not return a verdict/;
const HALTED = /HALT: docket\/HOLD\.md is present/;

function buildSandbox(mutate) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hold-guard-test-"));
  fs.mkdirSync(path.join(dir, "scripts"), { recursive: true });
  fs.mkdirSync(path.join(dir, "docket"), { recursive: true });
  for (const file of SOURCE_FILES) {
    let text = fs.readFileSync(path.join(ROOT, file), "utf8");
    if (mutate && file === "scripts/orchestrate.sh") text = mutate(text);
    fs.writeFileSync(path.join(dir, file), text);
  }
  return dir;
}

function setHold(dir, content) {
  const holdPath = path.join(dir, "docket", "HOLD.md");
  if (content === undefined) {
    if (fs.existsSync(holdPath)) fs.rmSync(holdPath);
  } else {
    fs.writeFileSync(holdPath, content);
  }
}

// Runs the sandboxed orchestrate.sh and resolves as soon as either `pattern`
// appears in its combined stdout/stderr or the bash process itself exits,
// whichever is first; force-kills it either way once resolved, and
// force-kills it on `timeoutMs` if neither ever happens (a regression that
// makes the loop neither halt nor reach the retry marker must fail this
// test, not hang CI).
//
// Listens for `exit`, not `close`. `close` fires only once every stdio
// stream is released by every process holding it, including an orphaned
// background job the script spawned and never waited on -- a real bug
// found by adversarial review (see bypass 3 below): `( sleep 2; ... ) &`
// inherits the child's stdout/stderr, so `close` did not fire until that
// background job also exited two seconds later, and by then the file it
// touched had already changed. `exit` fires the instant bash's own process
// ends, independent of what any backgrounded descendant is still holding.
function run(dir, { pattern, timeoutMs = 8000 } = {}) {
  const logDir = fs.mkdtempSync(path.join(os.tmpdir(), "hold-guard-log-"));
  const scriptPath = path.join(dir, "scripts", "orchestrate.sh");
  return new Promise((resolve) => {
    const t0 = performance.now();
    const child = spawn("bash", [scriptPath], {
      cwd: dir,
      env: { ...process.env, ORCHESTRATE_LOG_DIR: logDir, ORCHESTRATE_GAP: "1" },
    });
    let out = "";
    let done = false;
    const finish = (note, exitedOnOwn) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try {
        child.kill("SIGKILL");
      } catch {}
      resolve({ out: out + note, exitedOnOwn: !!exitedOnOwn, ms: performance.now() - t0 });
    };
    const onData = (d) => {
      out += d;
      if (pattern && pattern.test(out)) finish("", false);
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.on("exit", () => finish("\n[process exited on its own]\n", true));
    const timer = setTimeout(
      () => finish("\nKILLED: timed out waiting for a stop signal\n", false),
      timeoutMs
    );
  });
}

// --- 1-3: the real, current file --------------------------------------------

{
  const dir = buildSandbox();
  setHold(dir, "The maintainer hit something that needs a decision.\n");
  const r = await run(dir, { timeoutMs: 8000 });
  if (r.exitedOnOwn && HALTED.test(r.out) && !PAST_HOLD_CHECK.test(r.out)) {
    ok(`a present, non-empty docket/HOLD.md halts the loop (exited on its own, ${r.ms.toFixed(0)}ms)`);
  } else {
    bad(`a present, non-empty docket/HOLD.md did not halt the loop: ${r.out.trim()}`);
  }
}

{
  const dir = buildSandbox();
  setHold(dir, undefined);
  const r = await run(dir, { pattern: PAST_HOLD_CHECK, timeoutMs: 8000 });
  if (PAST_HOLD_CHECK.test(r.out) && !HALTED.test(r.out)) {
    ok(`an absent docket/HOLD.md does not halt the loop -- it reaches the next guard (${r.ms.toFixed(0)}ms)`);
  } else {
    bad(`an absent docket/HOLD.md did not reach the next guard: ${r.out.trim()}`);
  }
}

{
  const dir = buildSandbox();
  setHold(dir, "");
  const r = await run(dir, { pattern: PAST_HOLD_CHECK, timeoutMs: 8000 });
  if (PAST_HOLD_CHECK.test(r.out) && !HALTED.test(r.out)) {
    ok(`an empty (0-byte) docket/HOLD.md does not halt the loop, matching bash's own -s test (${r.ms.toFixed(0)}ms)`);
  } else {
    bad(`an empty docket/HOLD.md halted the loop, which is not what -s tests: ${r.out.trim()}`);
  }
}

// --- 4-5: regression guards for the two bypasses adversarial review found ---

{
  // Bypass 1: truncate the file every iteration, immediately above the
  // frozen block, so `-s` never sees content regardless of what is written.
  const mutate = (text) =>
    text.replace(
      "  if [ -s docket/HOLD.md ]; then",
      "  : > docket/HOLD.md\n  if [ -s docket/HOLD.md ]; then"
    );
  const before = fs.readFileSync(path.join(ROOT, "scripts/orchestrate.sh"), "utf8");
  if (mutate(before) === before) {
    bad("bypass-1 regression guard: the truncation line was not inserted -- orchestrate.sh's HOLD block no longer matches the expected shape, update this test");
  } else {
    const dir = buildSandbox(mutate);
    setHold(dir, "The maintainer hit something that needs a decision.\n");
    const r = await run(dir, { pattern: PAST_HOLD_CHECK, timeoutMs: 8000 });
    if (PAST_HOLD_CHECK.test(r.out) && !HALTED.test(r.out)) {
      ok("bypass-1 regression guard: a copy with the file-truncation line inserted does NOT halt on a held docket/HOLD.md -- this harness catches it (the frozen-text check would not have)");
    } else {
      bad(`bypass-1 regression guard did not catch the reintroduced bypass: ${r.out.trim()}`);
    }
  }
}

{
  // Bypass 2: gut halt() so it logs but no longer exits. The frozen block
  // still calls it, byte for byte.
  const mutate = (text) =>
    text.replace('halt() {\n  note "HALT: $1"\n  exit "${2:-0}"\n}', 'halt() {\n  note "HALT: $1"\n}');
  const before = fs.readFileSync(path.join(ROOT, "scripts/orchestrate.sh"), "utf8");
  if (mutate(before) === before) {
    bad("bypass-2 regression guard: halt() was not matched for gutting -- it no longer matches the expected shape, update this test");
  } else {
    const dir = buildSandbox(mutate);
    setHold(dir, "The maintainer hit something that needs a decision.\n");
    const r = await run(dir, { pattern: PAST_HOLD_CHECK, timeoutMs: 8000 });
    if (!r.exitedOnOwn && HALTED.test(r.out) && PAST_HOLD_CHECK.test(r.out)) {
      ok("bypass-2 regression guard: a copy with halt() gutted logs HALT but keeps running past it -- this harness catches it (the frozen-text check would not have)");
    } else {
      bad(`bypass-2 regression guard did not catch the reintroduced bypass: ${r.out.trim()}`);
    }
  }
}

// Bypass 3 (a detached background job that clears the hold after this
// script's own exit) gets no scenario here, on purpose -- see this file's
// header for why: it is an adversarial construction this project's own
// record gives no reason to build machinery against, and CHARTER.md rule
// 13a and this round's History name it as a known, deliberately unguarded
// case rather than an oversight.

console.log(failures === 0 ? "all stop-mechanism behavioural checks passed" : `${failures} check(s) failed`);
process.exitCode = failures === 0 ? 0 : 1;
