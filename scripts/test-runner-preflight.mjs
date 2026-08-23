#!/usr/bin/env node
// scripts/runner-preflight.mjs, exercised against a stub /provider endpoint
// and synthetic runners.yml fixtures -- never the real repository's
// runners.yml, the real OpenCode server, or a real binary on PATH beyond
// `node` itself (already required to run this test at all). The same stub
// approach scripts/test-orchestrate-checkout.mjs already uses for the
// session API: an OS-assigned port, never a fixed one, so this test cannot
// collide with a real server and needs no network access beyond loopback.
//
//   node scripts/test-runner-preflight.mjs
//
// WHY THIS EXISTS. Round loop/meta/runner-config's own preflight check
// (scripts/runner-preflight.mjs) was proved able to fail seven ways by
// hand against the real local OpenCode server and the real runners.yml --
// construct, capture, revert, confirm clean -- and that proof is recorded
// in CHANGELOG.md and docket/briefs/loop-meta-runner-config.md. It is not
// repeatable in CI: CI has no OpenCode server, no opencode/codex/claude
// binaries on PATH, and must not depend on this machine's live credential
// state. This file is the CI-safe version of the same seven proofs,
// deterministic anywhere `node` runs -- the same "stub it, don't depend on
// a live service" choice this repository already made for the session API
// (scripts/test-orchestrate-checkout.mjs) and for clock boundaries
// (scripts/test-peak-window.mjs).

import { spawn } from "child_process";
import fs from "fs";
import http from "http";
import os from "os";
import path from "path";
import { dump as dumpYaml } from "js-yaml";

let failures = 0;
const ok = (m) => console.log(`ok    ${m}`);
const bad = (m) => {
  console.log(`FAIL  ${m}`);
  failures++;
};

const ROOT = process.cwd();
const SCRIPT = path.join(ROOT, "scripts", "runner-preflight.mjs");

// --- stub /provider server ---------------------------------------------------

let providerPayload = null; // null = connection refused (server not listening)
let serveNonJson = false;

const server = http.createServer((req, res) => {
  if (req.url === "/provider" && serveNonJson) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<html>the SPA shell, not a real catalogue</html>");
    return;
  }
  if (req.url === "/provider" && providerPayload !== null) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(providerPayload));
    return;
  }
  res.writeHead(404);
  res.end();
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const PORT = server.address().port;
const LIVE_URL = `http://127.0.0.1:${PORT}`;
// A port nothing listens on -- fetch fails fast with connection refused
// rather than waiting out the script's own 4s timeout, so this test stays
// quick without needing a shorter timeout knob in the real script.
const DEAD_URL = "http://127.0.0.1:1";

// --- fixture builder ----------------------------------------------------------

function writeFixture(overrides = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "runner-preflight-test-"));
  const base = {
    default_runner: "r1",
    runners: {
      r1: { harness: "h1", provider: "p1", model: "m1", variant: "max" },
    },
    excluded_model_patterns: [{ pattern: "-free$", reason: "test fixture exclusion" }],
    harnesses: {
      h1: {
        presence_check: "node", // always resolvable: this test itself requires node
        needs_server: true,
        server_url: LIVE_URL,
      },
    },
  };
  const merged = { ...base, ...overrides };
  fs.writeFileSync(path.join(dir, "runners.yml"), dumpYaml(merged));
  return dir;
}

// Spawned asynchronously (`spawn` + a Promise resolved on `close`), never
// with `spawnSync`, and via `bash -c "node ..."`, never `node` directly.
// Both measured this round, each independently necessary: a synchronous
// child (`spawnSync`, any command) could not reach a server bound in this
// same process at all -- a real DOMException TimeoutError from fetch, not a
// fast connection refusal, reproducible even with `curl` in place of
// `node`, so it is not fetch-specific -- while the async form succeeded
// every time in an 8-attempt loop. Separately, a `node`/`curl` process
// spawned directly (bypassing bash) also failed; wrapping it in `bash -c`
// fixed that half on its own. Whatever grants loopback network access in
// this environment, it is scoped to processes bash itself launches, and it
// does not survive a blocking synchronous spawn either -- matching
// scripts/test-orchestrate-checkout.mjs's own working pattern, which uses
// async `spawn` throughout and never `spawnSync` for the process under
// test.
function run(dir, runnerId) {
  const scriptArg = SCRIPT.replace(/\\/g, "/");
  const idArg = (runnerId ?? "").replace(/'/g, `'\\''`);
  return new Promise((resolve) => {
    const child = spawn("bash", ["-c", `node '${scriptArg}' '${idArg}'`], {
      cwd: dir,
      env: process.env,
    });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    // A hung child must fail this test loudly rather than hang CI.
    const killTimer = setTimeout(() => {
      out += "\nKILLED: did not close within 10000ms\n";
      child.kill();
    }, 10000);
    child.on("close", (code) => {
      clearTimeout(killTimer);
      resolve({ out, code });
    });
  });
}

// --- 1. unknown runner id -----------------------------------------------------

{
  providerPayload = { connected: [], all: [] };
  const dir = writeFixture();
  const r = await run(dir, "does-not-exist");
  if (r.code === 1 && /FAIL\s+runner known/.test(r.out) && /RUNNER_FAIL does-not-exist/.test(r.out)) {
    ok("unknown runner id fails 'runner known' and exits 1, never printing a RUNNER_OK line");
  } else {
    bad(`unknown runner id was not reported correctly: ${r.out}`);
  }
}

// --- 2. runner names an unknown harness ---------------------------------------

{
  const dir = writeFixture({
    runners: { r1: { harness: "no-such-harness", provider: "p1", model: "m1", variant: "max" } },
  });
  const r = await run(dir, "r1");
  if (r.code === 1 && /FAIL\s+harness known/.test(r.out)) {
    ok("a runner naming an unknown harness fails 'harness known'");
  } else {
    bad(`unknown harness was not caught: ${r.out}`);
  }
}

// --- 3. harness not present on PATH -------------------------------------------

{
  providerPayload = { connected: ["p1"], all: [{ id: "p1", models: { m1: {} } }] };
  const dir = writeFixture({
    harnesses: {
      h1: { presence_check: "definitely-not-a-real-binary-xyz123", needs_server: true, server_url: LIVE_URL },
    },
  });
  const r = await run(dir, "r1");
  if (r.code === 1 && /FAIL\s+harness present/.test(r.out)) {
    ok("a harness binary absent from PATH fails 'harness present' (PATH lookup only -- nothing was executed)");
  } else {
    bad(`missing-binary case was not caught: ${r.out}`);
  }
}

// --- 4. excluded model pattern -------------------------------------------------

{
  const dir = writeFixture({
    runners: { r1: { harness: "h1", provider: "p1", model: "deepseek-v4-flash-free", variant: "max" } },
  });
  const r = await run(dir, "r1");
  if (r.code === 1 && /FAIL\s+model not excluded/.test(r.out)) {
    ok("a model matching an excluded pattern fails 'model not excluded'");
  } else {
    bad(`excluded model was not caught: ${r.out}`);
  }
}

// --- 5. harness server unreachable --------------------------------------------

{
  const dir = writeFixture({ harnesses: { h1: { presence_check: "node", needs_server: true, server_url: DEAD_URL } } });
  const r = await run(dir, "r1");
  if (
    r.code === 1 &&
    /FAIL\s+harness server reachable/.test(r.out) &&
    (r.out.match(/UNVERIFIED/g) || []).length === 2
  ) {
    ok("an unreachable harness server fails 'harness server reachable' and reports the two downstream checks UNVERIFIED, not a guessed PASS");
  } else {
    bad(`unreachable server case was not caught: ${r.out}`);
  }
}

// --- 6. the SPA-shell guard: a 200 that is not JSON is not trusted -----------

{
  serveNonJson = true;
  const dir = writeFixture();
  const r = await run(dir, "r1");
  serveNonJson = false;
  if (r.code === 1 && /FAIL\s+harness server reachable/.test(r.out)) {
    ok("a 200 response whose content-type is not application/json is treated as unreachable, not trusted as a catalogue");
  } else {
    bad(`non-JSON 200 was wrongly trusted: ${r.out}`);
  }
}

// --- 7. provider not connected -------------------------------------------------

{
  providerPayload = { connected: ["someone-else"], all: [{ id: "p1", models: { m1: {} } }] };
  const dir = writeFixture();
  const r = await run(dir, "r1");
  if (r.code === 1 && /FAIL\s+provider authenticated/.test(r.out)) {
    ok("a provider absent from the server's connected list fails 'provider authenticated'");
  } else {
    bad(`unauthenticated provider was not caught: ${r.out}`);
  }
}

// --- 8. model not in the provider's catalogue ----------------------------------

{
  providerPayload = { connected: ["p1"], all: [{ id: "p1", models: { "some-other-model": {} } }] };
  const dir = writeFixture();
  const r = await run(dir, "r1");
  if (r.code === 1 && /FAIL\s+model in catalogue/.test(r.out)) {
    ok("a model absent from the provider's live catalogue fails 'model in catalogue'");
  } else {
    bad(`out-of-catalogue model was not caught: ${r.out}`);
  }
}

// --- 9. a harness with no live catalogue endpoint reports UNVERIFIED, not FAIL,
//        and UNVERIFIED alone does not block the overall verdict -----------------

{
  const dir = writeFixture({
    harnesses: { h1: { presence_check: "node", needs_server: false } },
  });
  const r = await run(dir, "r1");
  if (
    r.code === 0 &&
    (r.out.match(/UNVERIFIED/g) || []).length === 2 &&
    /RUNNER_OK harness=h1 provider=p1 model=m1 variant=max/.test(r.out)
  ) {
    ok("a harness with no local catalogue/auth endpoint reports both checks UNVERIFIED and still passes overall -- 'cannot tell' is not 'broken'");
  } else {
    bad(`needs_server:false case was not handled correctly: ${r.out}`);
  }
}

// --- 10. everything checkable passes -> RUNNER_OK carries the right fields -----

{
  providerPayload = { connected: ["p1"], all: [{ id: "p1", models: { m1: {}, other: {} } }] };
  const dir = writeFixture();
  const r = await run(dir, "r1");
  if (r.code === 0 && /RUNNER_OK harness=h1 provider=p1 model=m1 variant=max/.test(r.out) && !/FAIL/.test(r.out)) {
    ok("a fully valid runner passes every check and emits the exact RUNNER_OK line scripts/orchestrate.sh parses");
  } else {
    bad(`the valid case did not pass cleanly: ${r.out}`);
  }
}

server.close();

console.log(failures === 0 ? "all runner-preflight checks passed" : `${failures} check(s) failed`);
process.exitCode = failures === 0 ? 0 : 1;
