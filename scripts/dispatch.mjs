#!/usr/bin/env node
// Choose which track runs next. From the repository root:
//
//   node scripts/dispatch.mjs            # human-readable
//   node scripts/dispatch.mjs --github   # writes track= and reason= to $GITHUB_OUTPUT
//
// The model does not choose its own track. "What kind of work should I do?" is
// the lever that produced ten rounds of this site refining its own scaffolding:
// given the choice, a run picks work it can see, and what it can see is its own
// repository. So selection happens here, before the run starts, from the docket
// and the quotas in policy.yml.
//
// Order of precedence:
//
//   1. Preflight  — something is broken or rotting; that is the run
//   2. Audit floor — audit has not run enough this week
//   3. Quota      — the track most owed a run, among those that can run
//   4. Nothing    — no track has work; the run stops, which is rule 20
//
// Track history comes from CHANGELOG.md `- Track:` fields, so it counts
// *shipped* work. That is the right denominator: a meta run that found nothing
// to do did not consume meta's share of the site's changes.

import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { load as parseYaml } from "js-yaml";

const root = process.cwd();
const asGithub = process.argv.includes("--github");

const policy = parseYaml(fs.readFileSync(path.join(root, "policy.yml"), "utf8"));
const tracks = policy.tracks || {};

// --- inputs -----------------------------------------------------------------

function frontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return {};
  const fields = {};
  for (const line of match[1].split("\n")) {
    const colon = line.indexOf(":");
    if (colon > 0) fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return fields;
}

const openDir = path.join(root, "docket", "open");
const open = fs.existsSync(openDir)
  ? fs
      .readdirSync(openDir)
      .filter((f) => f.endsWith(".md"))
      .map((file) => frontmatter(fs.readFileSync(path.join(openDir, file), "utf8")))
  : [];

// An item blocked on something not yet done is not available work.
const doneDir = path.join(root, "docket", "done");
const done = new Set(
  fs.existsSync(doneDir) ? fs.readdirSync(doneDir).filter((f) => f.endsWith(".md")) : []
);
const ready = open.filter((item) =>
  (item["blocked-by"] || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .every((ref) => done.has(ref))
);

const changelog = fs.readFileSync(path.join(root, "CHANGELOG.md"), "utf8");
// Newest first, matching the file's order.
const history = [...changelog.matchAll(/^- Track:\s*(\S+)/gm)].map((m) =>
  m[1].toLowerCase()
);

const WINDOW = 20;
const recent = history.slice(0, WINDOW);

let preflight = { findings: [] };
try {
  preflight = JSON.parse(
    execFileSync("node", ["scripts/preflight.mjs", "--json"], { encoding: "utf8" })
  );
} catch (error) {
  // A broken preflight must not silently become "nothing is wrong". Surface it
  // and route to meta, which is the track that fixes broken machinery.
  preflight = {
    findings: [
      {
        urgency: 0,
        track: "meta",
        what: "preflight itself failed to run",
        detail: [String(error.message).split("\n")[0]],
        why: "The interrupt cannot be trusted until this is fixed.",
      },
    ],
  };
}

// --- selection --------------------------------------------------------------

function availability(track) {
  const cfg = tracks[track];
  if (!cfg) return { can: false, why: "not in policy.yml" };
  if (cfg.needs_docket_item) {
    const n = ready.filter((item) => item.track === track).length;
    if (n === 0) return { can: false, why: "no ready docket item" };
    return { can: true, why: `${n} ready item(s)` };
  }
  return { can: true, why: "does not need a queued item" };
}

function decide() {
  if (preflight.findings.length > 0) {
    const top = preflight.findings[0];
    return {
      track: top.track,
      reason: `preflight: ${top.what}`,
      preflight: top,
    };
  }

  // Audit is due when a gap has opened, rather than on a rate. A rate floor
  // ("N per week") fires on a cold start and forces consecutive audit runs
  // with nothing yet to audit; a gap can only open once other work has
  // shipped, which is also the only time auditing means anything.
  const gap = tracks.audit?.max_rounds_between_runs;
  if (gap) {
    const window = recent.slice(0, gap);
    const sinceAudit = window.filter((t) => t !== "audit").length;
    const auditInWindow = window.some((t) => t === "audit");
    if (!auditInWindow && sinceAudit >= gap && availability("audit").can) {
      return {
        track: "audit",
        reason: `audit due: ${sinceAudit} shipped round(s) since the last audit (max ${gap})`,
      };
    }
  }

  // Meta is capped by share of recent shipped rounds. It is the only track with
  // infinite available work, which is why it won for ten straight rounds.
  const metaCap = tracks.meta?.max_share_of_runs;
  const metaShare = recent.length
    ? recent.filter((t) => t === "meta").length / recent.length
    : 0;

  const candidates = Object.keys(tracks).filter((track) => {
    if (!availability(track).can) return false;
    if (track === "meta" && metaCap != null && metaShare >= metaCap) return false;
    return true;
  });

  if (candidates.length === 0) {
    return {
      track: null,
      reason: "no track has available work — this run stops (CHARTER.md rule 20)",
    };
  }

  // Most owed: largest gap between the share the policy asks for and the share
  // recently delivered. With no history every track is equally owed, so the
  // heaviest weight wins, which is the intended cold start.
  const totalWeight = candidates.reduce((n, t) => n + (tracks[t].weight || 0), 0);
  let best = null;
  for (const track of candidates) {
    const target = (tracks[track].weight || 0) / (totalWeight || 1);
    const actual = recent.length
      ? recent.filter((t) => t === track).length / recent.length
      : 0;
    const owed = target - actual;
    if (!best || owed > best.owed) best = { track, owed, target, actual };
  }

  return {
    track: best.track,
    reason:
      `quota: target ${(best.target * 100).toFixed(0)}%, ` +
      `recent ${(best.actual * 100).toFixed(0)}% over last ${recent.length} shipped round(s)`,
  };
}

const decision = decide();

// --- output -----------------------------------------------------------------

if (asGithub) {
  const out = process.env.GITHUB_OUTPUT;
  const lines = [
    `track=${decision.track || ""}`,
    `reason=${decision.reason.replace(/\n/g, " ")}`,
    `run=${decision.track ? "true" : "false"}`,
  ];
  if (out) fs.appendFileSync(out, lines.join("\n") + "\n");
  else process.stdout.write(lines.join("\n") + "\n");
} else {
  console.log(`track:  ${decision.track || "(none — stop)"}`);
  console.log(`reason: ${decision.reason}`);
  console.log();
  console.log(`ready docket items: ${ready.length} of ${open.length} open`);
  for (const track of Object.keys(tracks)) {
    const a = availability(track);
    const n = recent.filter((t) => t === track).length;
    console.log(
      `  ${track.padEnd(9)} ${a.can ? "available" : "blocked  "}  ` +
        `(${a.why}; ${n} of last ${recent.length} shipped)`
    );
  }
  if (decision.preflight) {
    console.log();
    console.log("preflight finding that decided this run:");
    for (const line of decision.preflight.detail) console.log(`  ${line}`);
  }
}
