#!/usr/bin/env node
// Run one round locally, without remembering any of it.
//
//   node scripts/round.mjs start [--track X] [--agent Y]
//   node scripts/round.mjs check
//   node scripts/round.mjs ship
//
// Everything here was previously tacit knowledge: which port the checks
// expect, which env var makes them exercise the round badges instead of
// skipping them, what the branch has to be called, which checks to run and in
// what order, and that the run must request auto-merge rather than merge.
// Every one of those has already gone wrong once. A round should not depend on
// the operator remembering them.
//
// Agent-agnostic on purpose: Claude Code, Codex and the GitHub workflow all
// drive the same three commands, so a round behaves the same whoever started
// it. See .claude/skills/local-loop/SKILL.md and AGENTS.md.

import { execFileSync, execSync, spawn } from "child_process";
import fs from "fs";
import net from "net";

const PORT = 3000; // The sitemap is built with this. Serving elsewhere fails
                   // seven route checks for reasons that have nothing to do
                   // with the round.
const BASE = `http://localhost:${PORT}`;

// npm is a .cmd shim on Windows, which execFile cannot spawn (EINVAL), while
// passing an args array through a shell is deprecated. Running the whole thing
// as one shell string sidesteps both. These are fixed strings, never anything
// a round supplies.
function npm(script, opts = {}) {
  try {
    return { ok: true, out: execSync(`npm run ${script}`, { encoding: "utf8", stdio: "pipe", ...opts }) };
  } catch (error) {
    return { ok: false, out: `${error.stdout || ""}${error.stderr || ""}` || error.message };
  }
}

const [, , rawCmd = "start", ...rest] = process.argv;
const cmd = rawCmd.replace(/^--/, "");
function arg(name, fallback = null) {
  const i = rest.indexOf(`--${name}`);
  return i !== -1 && rest[i + 1] ? rest[i + 1] : fallback;
}

const ok = (m) => console.log(`  ok    ${m}`);
const bad = (m) => console.log(`  FAIL  ${m}`);
const head = (m) => console.log(`\n=== ${m} ===`);

function run(command, args, opts = {}) {
  return execFileSync(command, args, { encoding: "utf8", stdio: "pipe", ...opts });
}
function tryRun(command, args, opts = {}) {
  try {
    return { ok: true, out: run(command, args, opts) };
  } catch (error) {
    return { ok: false, out: `${error.stdout || ""}${error.stderr || ""}` || error.message };
  }
}

function branch() {
  return run("git", ["rev-parse", "--abbrev-ref", "HEAD"]).trim();
}

function portFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => server.close(() => resolve(true)));
    server.listen(port, "127.0.0.1");
  });
}

async function waitFor(url, ms = 60000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    try {
      await fetch(url);
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return false;
}

function killTree(pid) {
  try {
    if (process.platform === "win32") {
      execFileSync("taskkill", ["/pid", String(pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      process.kill(-pid, "SIGKILL");
    }
  } catch {
    /* already gone */
  }
}

// --- start ------------------------------------------------------------------

const TOOL_SCOPE = {
  scout: "Read, Grep, Glob, WebSearch, WebFetch, Write, Bash — NO Edit. You file work; you do not do it.",
  meta: "No web access. What blocks the other tracks is inside this repository.",
};

function start() {
  const forced = arg("track");
  const agent = arg("agent", "unknown");

  const dispatch = tryRun("node", ["scripts/dispatch.mjs"]);
  if (!dispatch.ok) {
    bad("dispatcher failed:");
    console.log(dispatch.out);
    process.exit(1);
  }
  const track = forced || (dispatch.out.match(/^track:\s+(\S+)/m) || [])[1];
  const reason = forced
    ? "forced by hand"
    : (dispatch.out.match(/^reason:\s+(.+)$/m) || [])[1] || "dispatcher";

  if (!track || track === "(none") {
    console.log("The dispatcher selected no track. Nothing to run — that is a");
    console.log("valid outcome (CHARTER.md rule 20), not an error.");
    process.exit(0);
  }

  const prompt = run("node", [
    "scripts/build-prompt.mjs",
    "--track",
    track,
    "--origin",
    "supervised",
    "--agent",
    agent,
    "--reason",
    reason,
  ]);

  head(`Round: ${track}`);
  console.log(`  why:    ${reason}`);
  console.log(`  branch: loop/${track}/<slug>   (CI reads the track from this)`);
  console.log(`  agent:  ${agent}`);
  if (TOOL_SCOPE[track]) {
    console.log(`\n  Tool scope for this track, which nothing local enforces:`);
    console.log(`    ${TOOL_SCOPE[track]}`);
  }
  head("Prompt");
  console.log(prompt);
  head("Then");
  console.log("  node scripts/round.mjs check     # every check, right port, no setup");
  console.log("  node scripts/round.mjs ship      # push, open PR, request auto-merge");
}

// --- check ------------------------------------------------------------------

async function check() {
  let failures = 0;
  const step = (name, result) => {
    if (result.ok) ok(name);
    else {
      bad(name);
      console.log(result.out.split("\n").slice(-12).join("\n"));
      failures++;
    }
  };

  head("Static checks");
  step("npm run lint", npm("lint"));
  step("docket valid", tryRun("node", ["scripts/check-docket.mjs"]));

  const current = branch();
  if (/^loop\//.test(current)) {
    step(
      `track scope for ${current}`,
      tryRun("node", ["scripts/check-track-scope.mjs", "main", current])
    );
  } else {
    console.log(`  skip  track scope — on '${current}', not a loop/<track>/<slug> branch`);
    console.log("        a round must branch before shipping, or CI will reject it");
  }

  head("Build and serve");
  // NEXT_PUBLIC_REPO_URL is what makes the badge assertions run instead of
  // skipping. A local build without it verifies nothing about round links,
  // which is how a check came to pass against markup containing no badges.
  const env = {
    ...process.env,
    NEXT_PUBLIC_REPO_URL:
      process.env.NEXT_PUBLIC_REPO_URL || "https://github.com/addicted2ai/AddictedtoAI",
  };
  step("npm run build", npm("build", { env }));

  if (!(await portFree(PORT))) {
    bad(`port ${PORT} is already in use`);
    console.log(`        the route checks expect ${BASE}; stop whatever is there first`);
    process.exit(1);
  }

  // Same reasoning: one shell string, no args array.
  const server = spawn("npm run start", {
    shell: true,
    env,
    detached: process.platform !== "win32",
    stdio: "ignore",
  });
  let served = false;
  try {
    served = await waitFor(BASE);
    if (!served) {
      bad("server did not come up");
      failures++;
    } else {
      head("Route checks");
      const routes = tryRun("bash", ["scripts/check-routes.sh"], {
        env: { ...env, BASE },
      });
      const tail = routes.out.split("\n").filter(Boolean).slice(-3).join("\n");
      if (routes.ok && !/SKIPPED/.test(routes.out)) {
        ok("all route checks passed");
      } else if (routes.ok) {
        bad("route checks passed but SKIPPED a group — see below");
        console.log(tail);
        failures++;
      } else {
        bad("route checks failed");
        console.log(routes.out.split("\n").filter((l) => /^FAIL/.test(l)).join("\n") || tail);
        failures++;
      }
    }
  } finally {
    killTree(server.pid);
  }

  head(failures === 0 ? "Ready to ship" : `${failures} problem(s)`);
  if (failures === 0) console.log("  node scripts/round.mjs ship");
  process.exit(failures === 0 ? 0 : 1);
}

// --- ship -------------------------------------------------------------------

function ship() {
  const current = branch();
  head("Shipping");

  if (!/^loop\/[a-z]+\/.+/.test(current)) {
    bad(`branch '${current}' is not loop/<track>/<slug>`);
    console.log("        CI reads the track from the branch name and will reject it");
    process.exit(1);
  }
  if (run("git", ["status", "--porcelain"]).trim()) {
    bad("working tree is dirty — commit before shipping");
    process.exit(1);
  }

  const push = tryRun("git", ["push", "-u", "origin", current]);
  if (!push.ok) {
    bad("push failed");
    console.log(push.out);
    process.exit(1);
  }
  ok(`pushed ${current}`);

  const existing = tryRun("gh", ["pr", "view", "--json", "number", "-q", ".number"]);
  if (!existing.ok) {
    const created = tryRun("gh", ["pr", "create", "--fill"]);
    if (!created.ok) {
      bad("could not open a pull request");
      console.log(created.out);
      process.exit(1);
    }
    ok("pull request opened");
  } else {
    ok(`pull request #${existing.out.trim()} already open`);
  }

  // Requested, never performed. A run that polls for green and merges itself
  // is both applicant and judge, and can merge over a failing check.
  const auto = tryRun("gh", ["pr", "merge", "--auto", "--squash"]);
  if (auto.ok) ok("auto-merge requested — GitHub merges it if the checks pass");
  else {
    bad("could not request auto-merge");
    console.log(auto.out);
    process.exit(1);
  }

  console.log("\n  Do not merge it yourself. Watch it with:");
  console.log("    gh pr checks");
  console.log("    node scripts/loop-history.mjs");
}

// --- dispatch ---------------------------------------------------------------

if (!fs.existsSync("CHARTER.md")) {
  console.error("run this from the repository root");
  process.exit(1);
}

if (cmd === "start") start();
else if (cmd === "check") await check();
else if (cmd === "ship") ship();
else {
  console.error(`unknown command: ${cmd}`);
  console.error("usage: node scripts/round.mjs [start|check|ship]");
  process.exit(1);
}
