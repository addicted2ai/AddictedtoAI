#!/usr/bin/env node
// scripts/orchestrate.sh's runner-preflight gate and harness-adapter launch,
// exercised by actually running the real script -- not by reading its text
// -- the same "drive the real thing in a sandbox" technique
// scripts/test-orchestrate-hold.mjs already uses for the HOLD.md stop
// mechanism. Run from the repository root:
//
//   node scripts/test-orchestrate-runner-launch.mjs
//
// WHY THIS EXISTS. scripts/runner-preflight.mjs is unit-tested on its own
// (scripts/test-runner-preflight.mjs) and proved able to fail seven ways by
// hand against the real local server (see CHANGELOG.md and
// docket/briefs/loop-meta-runner-config.md). Neither proves the WIRING: that
// scripts/orchestrate.sh actually calls it, actually reads HARNESS/
// PROVIDER/MODEL/VARIANT off its RUNNER_OK line, actually sources the named
// adapter, and actually calls that adapter's `launch` -- or that a failed
// preflight skips the pass (logged, not counted as a failure) rather than
// launching anyway. This file drives the real orchestrate.sh, in a sandbox,
// against a synthetic runner and a synthetic test-only harness adapter --
// never opencode, codex or claude, and never a real session of any kind.
//
// The sandbox needs a working peak_guard (unlike test-orchestrate-hold.mjs's
// sandbox, which deliberately omits policy.yml so peak_guard fails closed
// forever and the HOLD check is all that is exercised) -- this test's whole
// point is reaching the code *after* peak_guard, so a real policy.yml and
// scripts/peak-window.mjs are copied in too, with ORCHESTRATE_PEAK_NOW
// pinned to a fixed off-peak instant so the result cannot depend on the
// wall-clock moment this test happens to run.

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
const OFFPEAK_NOW = "2026-08-23T12:00:00Z"; // confirmed OFFPEAK against the real policy.yml this round

// A harness this repository does not otherwise define, so the sandbox's
// scripts/runners.yml and adapter are unambiguously test fixtures, never mistakably
// close to a real launch line.
const TEST_ADAPTER = `launch() {
  local provider="$1" model="$2" variant="$3" marker="$4" prompt_file="$5" log="$6"
  echo "TEST-LAUNCH provider=$provider model=$model variant=$variant marker=$marker" > "$log"
  ( sleep 3; echo "TEST-LAUNCH done" >> "$log" ) &
}
`;

function buildSandbox({ runnersYaml }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "runner-launch-test-"));
  fs.mkdirSync(path.join(dir, "scripts", "harness-adapters"), { recursive: true });
  fs.mkdirSync(path.join(dir, "docket"), { recursive: true });
  for (const file of [
    "scripts/orchestrate.sh",
    "scripts/orchestrate-liveness.sh",
    "scripts/orchestrate-peak.sh",
    "scripts/peak-window.mjs",
    "scripts/runner-preflight.mjs",
  ]) {
    let text = fs.readFileSync(path.join(ROOT, file), "utf8");
    if (file === "scripts/orchestrate.sh") {
      // Unlike scripts/test-orchestrate-hold.mjs's sandbox, this one needs a
      // WORKING peak_guard so execution actually reaches the code after it
      // -- which means it also reaches clear_orphans(), the next line in the
      // real loop. clear_orphans() kills whatever is LISTENING on ports
      // 3000/3250/3260/8101 on the real machine, by design (it exists to
      // clear a stale server from a previous round) -- it does not know or
      // care that this sandboxed orchestrate.sh is a copy. Measured this
      // round: running this test as part of scripts/check-routes.sh's own
      // suite killed the real `next start` server check-routes.sh itself was
      // mid-way through testing, on the genuine, shared port 3000 -- every
      // route check after that point failed with ECONNREFUSED, none of it a
      // real defect in the route being checked. Orphan cleanup is not what
      // this file tests, so it is neutralised in the copy, the same
      // "mutate the copy for a stated reason, run the real code otherwise"
      // technique scripts/test-orchestrate-hold.mjs already uses for its two
      // bypass regression guards.
      const before = text;
      text = text.replace(
        /clear_orphans\(\) \{[\s\S]*?\n\}/,
        "clear_orphans() {\n  : # neutralised in this sandbox -- see scripts/test-orchestrate-runner-launch.mjs\n}"
      );
      if (text === before) {
        throw new Error(
          "clear_orphans() no longer matches the expected shape in scripts/orchestrate.sh -- update this test's mutation before it silently stops neutralising the real port-killing behaviour"
        );
      }
    }
    fs.writeFileSync(path.join(dir, file), text);
  }
  fs.writeFileSync(path.join(dir, "policy.yml"), fs.readFileSync(path.join(ROOT, "policy.yml")));
  fs.writeFileSync(path.join(dir, "scripts", "runners.yml"), runnersYaml);
  fs.writeFileSync(path.join(dir, "scripts", "harness-adapters", "test-harness.sh"), TEST_ADAPTER);
  // scripts/peak-window.mjs and scripts/runner-preflight.mjs both `import
  // "js-yaml"` -- ESM resolves a bare specifier by walking up from the
  // importing file looking for node_modules, and a fresh os.tmpdir() sandbox
  // has none. A directory symlink makes the sandbox see the real
  // repository's install without copying it. "junction" on Windows: an
  // unprivileged directory link, unlike a plain symlink, which needs
  // Developer Mode or admin rights there. "dir" (an ordinary symlink) on
  // POSIX, which is what build-and-audit's ubuntu-latest runner is.
  fs.symlinkSync(
    path.join(ROOT, "node_modules"),
    path.join(dir, "node_modules"),
    process.platform === "win32" ? "junction" : "dir"
  );
  return dir;
}

const VALID_RUNNERS_YML = `
default_runner: test-runner
runners:
  test-runner:
    harness: test-harness
    provider: test-provider
    model: test-model
    variant: max
excluded_model_patterns: []
harnesses:
  test-harness:
    adapter: scripts/harness-adapters/test-harness.sh
    presence_check: node
    needs_server: false
`;

const BROKEN_RUNNERS_YML = `
default_runner: does-not-exist
runners: {}
excluded_model_patterns: []
harnesses: {}
`;

function run(dir, { pattern, timeoutMs = 15000 } = {}) {
  const logDir = fs.mkdtempSync(path.join(os.tmpdir(), "runner-launch-log-"));
  const scriptPath = path.join(dir, "scripts", "orchestrate.sh");
  return new Promise((resolve) => {
    const t0 = performance.now();
    const child = spawn("bash", [scriptPath], {
      cwd: dir,
      env: {
        ...process.env,
        ORCHESTRATE_LOG_DIR: logDir,
        ORCHESTRATE_GAP: "1",
        ORCHESTRATE_PEAK_NOW: OFFPEAK_NOW,
      },
    });
    let out = "";
    let done = false;
    const finish = (note) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try {
        child.kill("SIGKILL");
      } catch {}
      resolve({ out: out + note, ms: performance.now() - t0, logDir });
    };
    const onData = (d) => {
      out += d;
      if (pattern && pattern.test(out)) finish("");
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.on("exit", () => finish("\n[process exited on its own]\n"));
    const timer = setTimeout(() => finish("\nKILLED: timed out waiting for the expected signal\n"), timeoutMs);
  });
}

// --- 1. a valid runner reaches the adapter's launch() -------------------------

{
  const dir = buildSandbox({ runnersYaml: VALID_RUNNERS_YML });
  // Match on "iteration child msys pid", not "runner preflight ok" -- the
  // latter fires before `launch` is even called (clear_orphans, the
  // checkout wait, `git checkout`/`git pull` against a directory with no
  // .git, and the deployment check all still run between them), so killing
  // the process on that earlier line raced the write this test exists to
  // observe and reported a false failure the first time this was written.
  // The child-pid line is noted immediately after `launch` returns.
  const r = await run(dir, { pattern: /iteration child msys pid/ });
  // Give the backgrounded `launch` a moment to write its log line, then read
  // the iteration log the sandboxed supervisor itself created.
  await new Promise((res) => setTimeout(res, 1500));
  const supervisorOk = /runner preflight ok: RUNNER_OK harness=test-harness provider=test-provider model=test-model variant=max/.test(
    r.out
  );
  let launchedContent = "";
  try {
    const files = fs.readdirSync(r.logDir).filter((f) => f.startsWith("orchestrator-"));
    if (files.length > 0) {
      launchedContent = fs.readFileSync(path.join(r.logDir, files[0]), "utf8");
    }
  } catch {
    /* leave empty */
  }
  if (supervisorOk && /TEST-LAUNCH provider=test-provider model=test-model variant=max/.test(launchedContent)) {
    ok("a valid runner is resolved by name, sourced from its adapter, and actually launched -- the adapter's own log line proves `launch` ran with the right arguments");
  } else {
    bad(
      `valid-runner launch was not observed (supervisorOk=${supervisorOk}, launch log=${JSON.stringify(launchedContent)}): ${r.out.trim()}`
    );
  }
}

// --- 2. a broken runner never reaches a launch, and is not counted a failure --

{
  const dir = buildSandbox({ runnersYaml: BROKEN_RUNNERS_YML });
  const r = await run(dir, { pattern: /runner unavailable/, timeoutMs: 8000 });
  if (
    /runner unavailable -- not starting an iteration this pass/.test(r.out) &&
    !/iteration starting/.test(r.out) &&
    !/TEST-LAUNCH/.test(r.out)
  ) {
    ok("an unresolvable runner logs 'runner unavailable' and the pass is skipped before anything is launched or logged as an iteration");
  } else {
    bad(`broken-runner case did not skip cleanly: ${r.out.trim()}`);
  }
}

// --- 3. ORCHESTRATE_COMMAND still bypasses the runner system entirely --------

{
  const dir = buildSandbox({ runnersYaml: BROKEN_RUNNERS_YML }); // even a broken scripts/runners.yml must not matter here
  const logDir = fs.mkdtempSync(path.join(os.tmpdir(), "runner-launch-log-"));
  const scriptPath = path.join(dir, "scripts", "orchestrate.sh");
  const r = await new Promise((resolve) => {
    const child = spawn("bash", [scriptPath], {
      cwd: dir,
      env: {
        ...process.env,
        ORCHESTRATE_LOG_DIR: logDir,
        ORCHESTRATE_GAP: "1",
        ORCHESTRATE_PEAK_NOW: OFFPEAK_NOW,
        ORCHESTRATE_COMMAND: "echo stub-command-ran",
      },
    });
    let out = "";
    const timer = setTimeout(() => {
      try {
        child.kill("SIGKILL");
      } catch {}
      resolve({ out });
    }, 6000);
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    child.on("exit", () => {
      clearTimeout(timer);
      resolve({ out });
    });
  });
  if (/iteration starting/.test(r.out) && !/runner unavailable/.test(r.out) && !/runner preflight ok/.test(r.out)) {
    ok("ORCHESTRATE_COMMAND still bypasses the runner-preflight gate entirely, even against a broken scripts/runners.yml -- the stub-testing path this variable exists for is unaffected");
  } else {
    bad(`ORCHESTRATE_COMMAND path was gated by the runner system: ${r.out.trim()}`);
  }
}

console.log(failures === 0 ? "all runner-launch wiring checks passed" : `${failures} check(s) failed`);
process.exitCode = failures === 0 ? 0 : 1;
