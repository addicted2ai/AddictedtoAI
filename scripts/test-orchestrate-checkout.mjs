#!/usr/bin/env node
// The shared-checkout guard in scripts/orchestrate-liveness.sh, exercised
// against a stub session API. The guard exists because the supervisor's
// per-iteration `git checkout main` used to switch the branch out from under
// nested review sessions that outlive their dispatching iteration (measured
// 16 August: two round-145 review sessions died that way). It must:
//
//   1. defer while a session this supervisor can attribute to itself is
//      still advancing, and proceed once that session goes quiet;
//   2. be bounded, so a session that never stops cannot halt the loop
//      permanently -- a bounded wrong tree is better than a permanent halt;
//   3. ignore sessions that predate the supervisor's own launch (the
//      maintainer's sessions, the supervising model's, an orchestrator
//      session that outlived its iteration), because such a session may
//      never stop on its own -- the current orchestrator session would
//      deadlock a deferral keyed on "any session advancing" forever.
//
// The real function is the one under test: the test sources the real
// scripts/orchestrate-liveness.sh and calls wait_for_checkout_free with a
// stubbed note() and a stub /session endpoint whose payload the test swaps
// between scenarios. The stub server binds an OS-assigned port, never a
// fixed one, and every probe run is asynchronous: a blocking child process
// would freeze the stub's event loop and make every probe look like a
// timeout.
//
//   node scripts/test-orchestrate-checkout.mjs

import { spawn, spawnSync } from "child_process";
import http from "http";

let failures = 0;
const ok = (m) => console.log(`ok    ${m}`);
const bad = (m) => {
  console.log(`FAIL  ${m}`);
  failures++;
};

// The probe matches session.directory against HELPER_REPO_WIN, so the fixture
// directory must be exactly what the liveness file computes for this repo on
// this platform. Ask the file itself instead of reimplementing cygpath.
const REPO_WIN = spawnSync("bash", ["-c", "source scripts/orchestrate-liveness.sh && printf '%s' \"$HELPER_REPO_WIN\""], {
  encoding: "utf8",
}).stdout.trim();
if (!REPO_WIN) {
  bad("could not resolve HELPER_REPO_WIN from scripts/orchestrate-liveness.sh");
  process.exit(1);
}

// --- stub session API -------------------------------------------------------

let payload = "[]";
const server = http.createServer((req, res) => {
  if (req.url === "/session") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(payload);
  } else {
    res.writeHead(404);
    res.end();
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const PORT = server.address().port;
const API = `http://127.0.0.1:${PORT}`;
const setPayload = (sessions) => {
  payload = JSON.stringify(sessions);
};

const ses = (id, createdMs, updatedMs) => ({
  directory: REPO_WIN,
  id,
  title: `test-${id}`,
  time: { created: createdMs, updated: updatedMs },
});

// --- driving the real function ----------------------------------------------

const SCRIPT = `
source scripts/orchestrate-liveness.sh
note() { echo "note: $*"; }
wait_for_checkout_free
echo "rc=$?"
`;

function runAsync(env) {
  const t0 = performance.now();
  return new Promise((resolve) => {
    const child = spawn("bash", ["-c", SCRIPT], {
      env: { ...process.env, ORCHESTRATE_SERVER: API, ...env },
    });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    // A regression that made the wait unbounded must fail the test, not hang
    // CI. The bound is what scenario 2 proves; the timer enforces that it
    // stays provable.
    const killTimer = setTimeout(() => {
      out += "\nKILLED: wait did not return within 15000ms\n";
      child.kill();
    }, 15000);
    child.on("close", (code) => {
      clearTimeout(killTimer);
      resolve({ out, code, ms: performance.now() - t0 });
    });
  });
}

// wait_for_checkout_free's return value is echoed as "rc=<n>"; the bash
// process itself always exits 0 (the last command is the echo), so the
// decision is read from the output, never from the child's exit code.
const rc = (r) => Number((r.out.match(/rc=(\d+)/) || [])[1]);

// The launch floor is fixed before the call, exactly as the supervisor fixes
// it once at startup. These scenarios place it two minutes in the past; the
// floor is passed as CHECKOUT_FLOOR, the variable wait_for_checkout_free
// reads (the supervisor derives it from its own launch time).
const FLOOR = Math.floor(Date.now() / 1000) - 120;
const common = { CHECKOUT_FLOOR: String(FLOOR), TICK_SECONDS: "1" };

// --- 1. probe boundary: what counts as attributable --------------------------

setPayload([ses("ses-old", Date.now() - 3600 * 1000, Date.now() - 1000)]);
const pre = await runAsync({ ...common });
if (rc(pre) === 0 && !/still busy/.test(pre.out)) {
  ok("a session created before the launch floor is not attributed -- the probe ignores it");
} else {
  bad(`a pre-launch session blocked the checkout: ${pre.out.trim()}`);
}

setPayload([ses("ses-new", Date.now() - 60 * 1000, Date.now() - 1000)]);
const post = await runAsync({ ...common, CHECKOUT_WAIT_SECONDS: "4", CHECKOUT_IDLE_SECONDS: "60" });
if (rc(post) === 1 && /still busy/.test(post.out)) {
  ok("a session created after the launch floor is attributed -- the checkout defers while it advances");
} else {
  bad(`a post-launch live session did not defer the checkout: ${post.out.trim()}`);
}

// --- 2. never-stopping session: deferral is bounded, not a halt ---------------

setPayload([ses("ses-zombie", Date.now() - 60 * 1000, Date.now() - 1000)]);
const zombie = await runAsync({ ...common, CHECKOUT_WAIT_SECONDS: "4", CHECKOUT_IDLE_SECONDS: "60" });
if (rc(zombie) === 1 && /still busy/.test(zombie.out) && zombie.ms >= 3500) {
  ok(`a session that never stops does not halt the loop -- the wait returns busy after the bound (${zombie.ms.toFixed(0)}ms)`);
} else {
  bad(`never-stopping session not bounded (rc=${rc(zombie)}, ${zombie.ms.toFixed(0)}ms): ${zombie.out.trim()}`);
}

// --- 3. session stops mid-wait: the deferral ends when it goes quiet ----------

setPayload([ses("ses-stopping", Date.now() - 60 * 1000, Date.now() - 1000)]);
const swapTimer = setTimeout(() => {
  setPayload([ses("ses-stopping", Date.now() - 60 * 1000, Date.now() - 600 * 1000)]);
}, 1500);
const stopped = await runAsync({ ...common, CHECKOUT_WAIT_SECONDS: "8", CHECKOUT_IDLE_SECONDS: "5" });
clearTimeout(swapTimer);
if (rc(stopped) === 0 && /checkout free after/.test(stopped.out) && stopped.ms < 8000) {
  ok(`checkout proceeds once the attributed session stops advancing (waited ${stopped.ms.toFixed(0)}ms)`);
} else {
  bad(`checkout did not proceed after the session stopped (rc=${rc(stopped)}, ${stopped.ms.toFixed(0)}ms): ${stopped.out.trim()}`);
}

// --- 4. already quiet: proceeds immediately -----------------------------------

setPayload([ses("ses-done", Date.now() - 60 * 1000, Date.now() - 600 * 1000)]);
const quiet = await runAsync({ ...common, CHECKOUT_WAIT_SECONDS: "4", CHECKOUT_IDLE_SECONDS: "60" });
if (rc(quiet) === 0 && quiet.ms < 3000) {
  ok(`a session last active long ago does not delay the checkout (${quiet.ms.toFixed(0)}ms)`);
} else {
  bad(`a quiet session delayed the checkout (rc=${rc(quiet)}, ${quiet.ms.toFixed(0)}ms): ${quiet.out.trim()}`);
}

// --- 5. the attached-session trap ---------------------------------------------

// The shared store holds sessions this supervisor did not start -- an
// orchestrator session that outlived its iteration is still there, advancing,
// when the supervisor starts. A deferral keyed on it would deadlock the loop
// on a session that never stops on its own. This is the load-bearing boundary.
setPayload([ses("ses-orchestrator", Date.now() - 3600 * 1000, Date.now() - 1000)]);
const trap = await runAsync({ ...common, CHECKOUT_WAIT_SECONDS: "4", CHECKOUT_IDLE_SECONDS: "60" });
if (rc(trap) === 0 && trap.ms < 3000) {
  ok(`an advancing session that predates the supervisor never blocks the checkout (${trap.ms.toFixed(0)}ms)`);
} else {
  bad(`the attached-session trap deadlocked the loop (rc=${rc(trap)}, ${trap.ms.toFixed(0)}ms): ${trap.out.trim()}`);
}

// The exclusion is per-session, not "ignore everything once a foreign session
// exists": an attributed session still defers even with the trap in the store.
setPayload([
  ses("ses-orchestrator", Date.now() - 3600 * 1000, Date.now() - 1000),
  ses("ses-live", Date.now() - 60 * 1000, Date.now() - 1000),
]);
const mixed = await runAsync({ ...common, CHECKOUT_WAIT_SECONDS: "4", CHECKOUT_IDLE_SECONDS: "60" });
if (rc(mixed) === 1 && /still busy/.test(mixed.out)) {
  ok("the trap does not mask an attributed session that is still advancing");
} else {
  bad(`attributed session masked by the trap (rc=${rc(mixed)}): ${mixed.out.trim()}`);
}

// --- 6. no signal means proceed ------------------------------------------------

// The liveness philosophy: a probe that fails yields no signal, never a stop.
// If the API is unreachable the guard cannot see sessions, so the checkout
// proceeds as it always did rather than halting on a probe failure.
server.close();
const down = await runAsync({ ...common, CHECKOUT_WAIT_SECONDS: "4", CHECKOUT_IDLE_SECONDS: "60" });
if (rc(down) === 0 && down.ms < 3000) {
  ok(`an unreachable session API yields no signal -- the checkout proceeds (${down.ms.toFixed(0)}ms)`);
} else {
  bad(`an unreachable API stopped the checkout (rc=${rc(down)}, ${down.ms.toFixed(0)}ms): ${down.out.trim()}`);
}

console.log(failures === 0 ? "all checkout-guard checks passed" : `${failures} check(s) failed`);
process.exitCode = failures === 0 ? 0 : 1;
