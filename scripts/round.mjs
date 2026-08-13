#!/usr/bin/env node
// Run one round locally, without remembering any of it.
//
//   node scripts/round.mjs start [--track X] [--agent Y] [--force]
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
import path from "path";

const PORT = 3000; // The sitemap is built with this. Serving elsewhere fails
                   // seven route checks for reasons that have nothing to do
                   // with the round.
const BASE = `http://localhost:${PORT}`;
// Windows can have both WSL Bash and Git-for-Windows Bash installed. WSL
// cannot see the Windows localhost listener that this local check starts,
// while Git Bash shares the host network and has Node on PATH. Prefer it
// when present; Linux keeps using its normal Bash.
const WINDOWS_GIT_BASH = process.env.ProgramFiles
  ? process.env.ProgramFiles + "\\Git\\bin\\bash.exe"
  : "C:\\Program Files\\Git\\bin\\bash.exe";
const ROUTE_CHECK_SHELL =
  process.platform === "win32" && fs.existsSync(WINDOWS_GIT_BASH)
    ? WINDOWS_GIT_BASH
    : "bash";

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
function flag(name) {
  return rest.includes(`--${name}`);
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

// --- guards -----------------------------------------------------------------

function ghJson(args) {
  const result = tryRun("gh", args);
  if (!result.ok) return { ok: false, out: result.out };
  try {
    return { ok: true, data: JSON.parse(result.out) };
  } catch {
    return { ok: false, out: result.out };
  }
}

const BUSY_RUN_STATES = new Set([
  "queued",
  "in_progress",
  "requested",
  "waiting",
  "pending",
]);

// Is a round already in flight anywhere?
//
// GitHub is the only state the remote workflow, a local Claude Code run and a
// local Codex run can all three see, so it is where this gets answered.
// loop.yml already serialises remote runs with `concurrency: group: loop`;
// this makes a local round join that same queue instead of being invisible
// to it.
//
// Serialisation is not mainly about merge conflicts. dispatch.mjs computes
// each track's share from *shipped* rounds, so two rounds running at once each
// read a history that excludes the other and can both pick the same track --
// blowing the meta cap, or double-spending the audit gap. The quota arithmetic
// is only correct while rounds are serial.
//
// The open pull request doubles as the docket claim. There is no separate
// claimed/ directory and no lock file, so there is no stale lock to clear.
function roundInFlight() {
  const blockers = [];
  let checked = true;

  const runs = ghJson([
    "run", "list", "--workflow", "loop.yml",
    "--limit", "20", "--json", "status,url",
  ]);
  if (runs.ok) {
    for (const entry of runs.data) {
      if (BUSY_RUN_STATES.has(entry.status)) {
        blockers.push(`remote run ${entry.status}: ${entry.url}`);
      }
    }
  } else checked = false;

  const prs = ghJson([
    "pr", "list", "--state", "open", "--json", "number,headRefName",
  ]);
  if (prs.ok) {
    for (const pr of prs.data) {
      if (pr.headRefName.startsWith("loop/")) {
        blockers.push(`open round PR #${pr.number} (${pr.headRefName})`);
      }
    }
  } else checked = false;

  return { blockers, checked };
}

// Put HEAD on origin/main, so whatever branch the round creates is based on
// what actually shipped.
//
// Squash merge is why this matters. When a round's pull request lands, GitHub
// replaces its commits with a single new commit carrying a different SHA, so
// the originals become permanent orphans. That is harmless for a branch you
// delete -- and corrosive the moment a round has also committed to local main,
// because main then diverges forever and the *next* round inherits the stray
// commits and conflicts on CHANGELOG.md.
//
// That is not hypothetical: local main sat "ahead 2, behind 1" after a build
// round committed to it and its pull request squash-merged. No concurrency was
// involved. One round committing to main was enough.
function syncBase() {
  const fetched = tryRun("git", ["fetch", "origin", "main"]);
  if (!fetched.ok) {
    bad("could not fetch origin/main — the base for this round cannot be verified");
    console.log(fetched.out.trim());
    process.exit(1);
  }

  if (run("git", ["status", "--porcelain"]).trim()) {
    bad("working tree is dirty");
    console.log("        commit, stash or discard before starting a round");
    process.exit(1);
  }

  const origin = run("git", ["rev-parse", "origin/main"]).trim();
  if (run("git", ["rev-parse", "HEAD"]).trim() === origin) {
    ok(`on origin/main (${origin.slice(0, 7)})`);
    return;
  }

  // Refuse to move off a branch that still holds work nobody else has.
  //
  // Measured against the branch's own upstream, not against origin/main. After
  // a squash merge a merged branch permanently has commits origin/main does not
  // -- that is what squashing does -- so comparing to origin/main would flag
  // every finished round's branch as unshipped. Unpushed commits are the thing
  // that would actually be lost.
  const current = branch();
  if (/^loop\//.test(current)) {
    const upstream = tryRun("git", ["rev-parse", "--abbrev-ref", "@{u}"]);
    const unpushed = upstream.ok
      ? run("git", ["rev-list", "--count", "@{u}..HEAD"]).trim()
      : run("git", ["rev-list", "--count", "origin/main..HEAD"]).trim();
    if (unpushed !== "0") {
      bad(`'${current}' has ${unpushed} commit(s) that are not pushed anywhere`);
      console.log("        that is an unshipped round. Ship it, or delete the branch.");
      process.exit(1);
    }
  }

  const checkout = tryRun("git", ["checkout", "main"]);
  if (!checkout.ok) {
    bad("could not check out main");
    console.log(checkout.out.trim());
    process.exit(1);
  }

  // Assert the end state rather than trusting the exit code. `merge --ff-only`
  // reports success when local main is merely *ahead* of origin/main, because
  // origin/main is then already an ancestor and there is nothing to fast
  // forward -- so a round that had committed to main would pass this check
  // right up until something else merged and made main diverge for real.
  const ff = tryRun("git", ["merge", "--ff-only", "origin/main"]);
  if (!ff.ok || run("git", ["rev-parse", "HEAD"]).trim() !== origin) {
    bad("local main is not origin/main and cannot be fast-forwarded to it");
    const extra = tryRun("git", ["log", "--oneline", "origin/main..main"]);
    if (extra.ok) {
      for (const line of extra.out.split("\n").filter(Boolean)) {
        console.log(`          ${line}`);
      }
    }
    console.log("\n        A round committed to main rather than to its own branch. If its");
    console.log("        pull request has since squash-merged, that content is already on");
    console.log("        origin/main under a different SHA and these commits are orphans.");
    console.log("        Confirm that before discarding them:");
    console.log("          git log --oneline origin/main..main");
    console.log("          git checkout main && git reset --hard origin/main");
    process.exit(1);
  }
  ok(`main fast-forwarded to origin/main (${origin.slice(0, 7)})`);
}

// --- start ------------------------------------------------------------------

const TOOL_SCOPE = {
  scout: "Read, Grep, Glob, WebSearch, WebFetch, Write, Bash — NO Edit. You file work; you do not do it.",
  meta: "No web access. What blocks the other tracks is inside this repository.",
};

function start() {
  const forced = arg("track");
  const agent = arg("agent", "unknown");
  const force = flag("force");

  head("Before starting");
  const flight = roundInFlight();
  if (!flight.checked) {
    console.log("  WARN  could not reach GitHub — the in-flight guard did not run.");
    console.log("        That is not the same as 'no round is in flight'. A check");
    console.log("        that was skipped has not passed.");
  }
  if (flight.blockers.length > 0) {
    for (const blocker of flight.blockers) console.log(`        ${blocker}`);
    if (!force) {
      bad("a round is already in flight");
      console.log("\n        Rounds are serial on purpose: dispatch.mjs computes each");
      console.log("        track's share from shipped rounds, so two at once can both");
      console.log("        pick the same track. Wait for it, or pass --force.");
      process.exit(1);
    }
    bad("OVERRIDE: --force, starting while a round is in flight");
    console.log("        Record this override in the round's changelog entry.");
  } else if (flight.checked) {
    ok("no round in flight");
  }

  syncBase();

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
  console.log(`          HEAD is already on origin/main — branch from here, and`);
  console.log(`          never commit to main itself.`);
  console.log(`  agent:  ${agent}`);
  if (TOOL_SCOPE[track]) {
    console.log(`\n  Tool scope for this track, which nothing local enforces:`);
    console.log(`    ${TOOL_SCOPE[track]}`);
  }
  head("Prompt");
  console.log(prompt);
  head("Then");
  console.log("  node scripts/round.mjs check     # every check, right port, no setup");
  console.log("  node scripts/round.mjs ship      # push, open PR, arm auto-merge by Origin");
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
    // origin/main, not main. CI diffs against origin/<base_ref>, and a local
    // main that is stale or diverged would check a different set of files
    // than the one the pull request actually changes -- the same wrong-base
    // class of bug that syncBase() exists to prevent.
    tryRun("git", ["fetch", "origin", "main"]);
    step(
      `track scope for ${current}`,
      tryRun("node", ["scripts/check-track-scope.mjs", "origin/main", current])
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
      const routes = tryRun(ROUTE_CHECK_SHELL, ["scripts/check-routes.sh"], {
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

// Auto-merge is requested, never performed: `gh pr merge --auto --squash`
// queues a merge that GitHub performs only when the required checks pass. A
// run that polls for green and merges itself is both applicant and judge, and
// can merge over a failing check.
//
// But the merge has to be *earned* by the round's own Origin. A round's Origin
// is a published claim about what read the work before it landed, and
// auto-merge performs the merge at the earliest legal moment — which can be
// before the reading that Origin promises. Round 85 is the instance: it
// declared `Origin: delegated` ("reviewed and merged it") and auto-merged at
// 01:36 while its review session was still running, with zero reviews on the
// pull request. The work proved sound, but the record claimed an oversight
// step that had not happened yet, and it happened to be vindicated afterwards.
// A gate that only matters when the work is bad is not a gate.
//
// So `ship` arms auto-merge only when the round's own Origin permits merging
// without anything having read the work, and it opens the pull request
// WITHOUT auto-merge otherwise, saying so. The Origin is read through the same
// parser the site builds from (app/lib/build-log.js) — a second parser for one
// field is the disagreement this project keeps shipping. Which values gate is
// decided in scripts/automerge-origin.mjs, next to the gate itself.
async function ship() {
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
  let prNumber = null;
  if (!existing.ok) {
    const created = tryRun("gh", ["pr", "create", "--fill"]);
    if (!created.ok) {
      bad("could not open a pull request");
      console.log(created.out);
      process.exit(1);
    }
    ok("pull request opened");
    const found = tryRun("gh", ["pr", "view", "--json", "number", "-q", ".number"]);
    prNumber = found.ok ? found.out.trim() : null;
  } else {
    prNumber = existing.out.trim();
    ok(`pull request #${prNumber} already open`);
  }

  // Read the round's own Origin from the entry it just wrote, with the same
  // parser the site builds from — never a second parser. The newest entry is
  // the round's own *only if it wrote one*: ship runs after the round commits,
  // and a round that ships without touching CHANGELOG.md leaves the previous
  // round's entry on top, which would make this gate judge the wrong round.
  // The round's charge is to add an entry at the top of the log (rule 5 makes
  // the record append-only), so if the branch changes no changelog entry there
  // is no round of its own to judge — fail closed rather than arm or withhold
  // on somebody else's Origin.
  const logChanged = tryRun("git", ["diff", "--name-only", "origin/main...HEAD", "--", "CHANGELOG.md"]);
  if (!logChanged.ok || !logChanged.out.trim()) {
    bad("this branch changes no changelog entry — auto-merge withheld");
    console.log("        the gate reads the round's Origin from the entry it wrote; a");
    console.log("        round with no entry has no Origin to judge. Write the entry,");
    console.log("        commit, push, and run ship again (or arm by hand after review):");
    console.log("          gh pr merge --auto --squash");
    process.exit(1);
  }
  const { getBuildLog } = await import(
    `file://${path.join(process.cwd(), "app", "lib", "build-log.js").replace(/\\/g, "/")}`
  );
  const { originAllowsAutomerge } = await import(
    `file://${path.join(process.cwd(), "scripts", "automerge-origin.mjs").replace(/\\/g, "/")}`
  );

  let entry;
  try {
    entry = getBuildLog()[0];
  } catch (error) {
    bad("could not parse CHANGELOG.md — auto-merge withheld");
    console.log(`        ${error.message}`);
    console.log("\n  The pull request is open but nothing will merge it. This is a");
    console.log("  fail-closed default: a record that cannot be read cannot vouch");
    console.log("  for what read the work. Fix the entry, then arm the merge:");
    console.log("    gh pr merge --auto --squash");
    process.exit(1);
  }

  const origin = entry && entry.declaredOrigin ? entry.origin : "";

  // A delegated round claims an orchestrating model reviewed it before merge.
  // That claim is only true if a covering review artifact exists. The
  // review-artifact CI job is a visible check, not a required one — it is not
  // in the branch-protection required list — so GitHub's auto-merge would
  // ignore it. The gate is here, in arming, which is the one place this loop
  // controls the merge: `ship` runs the same checker CI runs
  // (scripts/check-review-artifact.mjs — the same rule, no second
  // implementation, no second parser) and refuses to arm a delegated round
  // unless a file at docket/reviews/<sha>.md approves and covers the merged
  // tree.
  let shouldArm = originAllowsAutomerge(entry);
  let withheldReason = "";
  if (origin === "delegated") {
    const artifact = tryRun("node", ["scripts/check-review-artifact.mjs", "origin/main"]);
    if (!artifact.ok) {
      withheldReason =
        "Origin 'delegated' has no covering approve review artifact — ship ran the same " +
        "check CI runs and it failed; the output above says why";
      console.log(artifact.out.trim());
    } else {
      shouldArm = true;
    }
  }

  if (shouldArm) {
    // Requested, never performed. A run that polls for green and merges itself
    // is both applicant and judge, and can merge over a failing check.
    const auto = tryRun("gh", ["pr", "merge", "--auto", "--squash"]);
    if (auto.ok) ok("auto-merge requested — GitHub merges it if the checks pass");
    else {
      bad("could not request auto-merge");
      console.log(auto.out);
      process.exit(1);
    }
  } else {
    if (!origin) {
      bad("auto-merge withheld — this round's entry declares no Origin");
      console.log("        a round that does not state what read its work must not merge");
      console.log("        itself. The build rejects such an entry anyway (check-routes.sh");
      console.log("        pins the undeclared count at 47). Fix the entry, then arm it:");
      console.log("          gh pr merge --auto --squash");
      process.exit(1);
    }
    bad(
      `auto-merge withheld — ${withheldReason || `Origin '${origin}' means this round was reviewed before merge`}`
    );
    console.log("\n  The pull request is open and waits for that review. When the review");
    console.log("  is done, arm the merge yourself:");
    console.log(`    gh pr merge --auto --squash ${prNumber || "<N>"}`);
    console.log("\n  Do not merge it yourself. Watch it with:");
    console.log("    gh pr checks");
    console.log("    node scripts/loop-history.mjs");
    return;
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
else if (cmd === "ship") await ship();
else {
  console.error(`unknown command: ${cmd}`);
  console.error("usage: node scripts/round.mjs [start|check|ship]");
  process.exit(1);
}
