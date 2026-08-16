#!/usr/bin/env node
// Whether the newest production deployment actually reached the site.
//
// On 15 August 2026 the site stopped publishing twice in one day — a prebuild
// check reading git history Vercel's checkout does not have — and the loop
// never noticed, because nothing in it reads deployment state. CI builds the
// full clone green, the local check builds the same tree green, and the site
// froze while ten merged pull requests and then seven more never reached a
// visitor. The gap is not the cause (filed and fixed separately); it is that
// no signal carried the failure to anything the loop reads.
//
// This script is that signal. It reads the GitHub deployments API through
// `gh` — the same CLI round.mjs uses — and answers one question: is the
// newest production deployment successful? Vercel records a deployment per
// push to main, so that single fact is "is main live".
//
// It fails closed: only state=success is green. A failed or errored deploy is
// red; an in-flight deploy (in_progress/queued/pending) is green only while
// it is younger than DEPLOY_GRACE_MINUTES and red once it has hung past it; a
// deployment the API cannot answer for at all is red, because not knowing is
// the exact condition that let 15 August happen. The failure is a signal, not
// a judgement of the code: a deploy can fail while the code is perfect, and
// the site then shows the previous successful tree, which is precisely what
// must be noticed.
//
// Wired in two places, both read by the loop itself:
//   - scripts/preflight.mjs — every dispatch reads it, so a failed deploy
//     reroutes the next round to build before the docket is even consulted
//   - scripts/orchestrate.sh — the supervisor logs it every iteration, so the
//     failure is on the one log that is always being written
//
// Usage:
//   node scripts/check-deployments.mjs            # one-line verdict + exit code
//   node scripts/check-deployments.mjs --json     # machine-readable, for preflight
//
// Environment:
//   DEPLOY_REPO            owner/name, default addicted2ai/AddictedtoAI
//   DEPLOY_GRACE_MINUTES   how long an in-flight deploy may take before it
//                          counts as stuck, default 30

import { execFileSync } from "child_process";

const REPO = process.env.DEPLOY_REPO || "addicted2ai/AddictedtoAI";
const GRACE_MINUTES = Number(process.env.DEPLOY_GRACE_MINUTES) || 30;

// The two API calls, wrapped so any failure becomes a verdict rather than a
// crash. Empty output, bad JSON and a non-zero exit all mean "no signal",
// which is a red verdict, never a green one.
//
// `gh` is tried first: it carries the local token, so the supervisor's
// continuous polling stays well under the unauthenticated rate limit. When
// gh cannot answer — CI's GITHUB_TOKEN has no deployments scope, so
// `gh api` fails there with 403 even though the endpoints are public — the
// query falls back to an unauthenticated fetch, which serves the same data
// for this public repository. Only when both fail is the signal unreadable.
async function ghJson(path) {
  try {
    const out = execFileSync("gh", ["api", path], {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 30000,
    });
    return JSON.parse(out);
  } catch (ghError) {
    const response = await fetch(`https://api.github.com/${path}`, {
      headers: { accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      const e = new Error(`HTTP ${response.status} via gh and unauthenticated fetch`);
      e.stderr = String(ghError.stderr || ghError.message);
      throw e;
    }
    return await response.json();
  }
}

async function newestProductionDeployment() {
  const list = await ghJson(
    `repos/${REPO}/deployments?environment=Production&per_page=1`
  );
  return Array.isArray(list) && list.length > 0 ? list[0] : null;
}

async function newestStatus(deploymentId) {
  const list = await ghJson(`repos/${REPO}/deployments/${deploymentId}/statuses`);
  return Array.isArray(list) && list.length > 0 ? list[0] : null;
}

// The verdict, pure so the test can feed it any record the API has produced.
// `now` is epoch seconds, injected so the grace rule is testable.
export function verdict(deployment, status, now = Math.floor(Date.now() / 1000)) {
  if (!deployment) {
    return {
      ok: false,
      state: null,
      reason: "no production deployment recorded",
    };
  }
  const state = status && status.state;
  if (!state) {
    return {
      ok: false,
      state: null,
      reason: `deployment ${deployment.id} has no recorded status`,
    };
  }
  if (state === "success") {
    return { ok: true, state, reason: "" };
  }
  if (state === "in_progress" || state === "queued" || state === "pending") {
    const posted = Date.parse(status.created_at || "") / 1000;
    const age = Number.isFinite(posted) ? Math.floor(now - posted) : 0;
    if (age < GRACE_MINUTES * 60) {
      return {
        ok: true,
        state,
        reason: `deploy in flight (${state}, ${Math.max(0, Math.floor(age / 60))}m old, grace ${GRACE_MINUTES}m)`,
      };
    }
    return {
      ok: false,
      state,
      reason: `deployment stuck ${state} for ${Math.max(0, Math.floor(age / 60))}m (grace ${GRACE_MINUTES}m)`,
    };
  }
  return { ok: false, state, reason: `state ${state}` };
}

const json = process.argv.includes("--json");

let result;
try {
  const deployment = await newestProductionDeployment();
  const status = deployment ? await newestStatus(deployment.id) : null;
  const v = verdict(deployment, status);
  const detail = deployment
    ? `${deployment.sha} deployed ${deployment.created_at} (deployment ${deployment.id}), ${v.state || "no status"}`
    : v.reason;
  result = {
    ok: v.ok,
    state: v.state,
    reason: v.reason,
    deployment: deployment
      ? { sha: deployment.sha, created_at: deployment.created_at, id: deployment.id }
      : null,
    what: v.ok
      ? ""
      : v.state === null
        ? "the deployment signal could not be read"
        : "the newest production deployment failed — the site is not publishing main",
    detail,
  };
} catch (error) {
  const message = String(error.stderr || error.stdout || error.message || error)
    .split("\n")
    .filter(Boolean)
    .pop();
  result = {
    ok: false,
    state: null,
    reason: "",
    deployment: null,
    what: "the deployment signal could not be read",
    detail: message || "gh api failed",
  };
}

const short = (sha) => (sha ? sha.slice(0, 7) : "???????");
const shown = (d) =>
  d ? `newest production deployment ${short(d.sha)} (${d.created_at}) state=${result.state}` : result.what;

if (json) {
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
} else if (result.ok) {
  console.log(`ok    ${shown(result.deployment)}${result.state !== "success" ? ` — ${result.reason}` : ""}`);
} else if (result.state === null) {
  console.log(`FAIL  ${result.what}: ${result.detail}`);
} else {
  console.log(`FAIL  ${shown(result.deployment)} — ${result.what}`);
}

process.exitCode = result.ok ? 0 : 1;
