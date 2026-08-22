#!/usr/bin/env node
// Conditions that outrank the docket. Run from the repository root:
//
//   node scripts/preflight.mjs            # human-readable
//   node scripts/preflight.mjs --json     # for scripts/dispatch.mjs
//
// A docket makes a loop deliberate. Without an interrupt it would also make it
// unresponsive: a plan written three days ago is not a reason to ignore
// something that is broken now. Anything reported here becomes the run,
// whatever track was otherwise due.
//
// The staleness half is no longer thin: scripts/staleness-report.mjs covers
// every published artefact class against the windows in policy.yml, and
// anything it flags past its threshold becomes an interrupt here, outranking
// the docket (the `staleness-clocks` docket item, landed round 132). The
// deployment half is the same shape: scripts/check-deployments.mjs reads the
// GitHub deployments API, and a failed newest production deployment becomes
// an interrupt here, outranking the docket — production not matching main is
// now a signal this file can read (round 136). What is still absent — demo
// health checks — is filed as docket work when it has a shape this file can
// read.
//
// Findings are ordered most urgent first. Each names the track that should
// handle it, because an interrupt that does not say who fixes it is a to-do
// list, not a dispatcher input.

import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { load as parseYaml } from "js-yaml";
import { VISITOR_FACING } from "./visitor-facing-tracks.mjs";

// See the note in check-docket.mjs: CRLF makes the frontmatter regex match
// nothing, and `.gitattributes` only helps working copies created after it.
function readText(file) {
  return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
}

const root = process.cwd();
const json = process.argv.includes("--json");
const findings = [];

const policy = parseYaml(fs.readFileSync(path.join(root, "policy.yml"), "utf8"));

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

function readOpenItems() {
  const dir = path.join(root, "docket", "open");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => ({
      file,
      fields: frontmatter(readText(path.join(dir, file))),
    }));
}

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();
const open = readOpenItems();

// 1. Items far enough past expiry that the queue is rotting. Pruning is an
//    explicit action or it never happens, and a docket every future run has to
//    read past is a tax on every future run.
const pruneAfter = policy.docket?.prune_after_expiry_days ?? 14;
const rotten = open.filter((item) => {
  const expires = Date.parse(item.fields.expires);
  return !Number.isNaN(expires) && now - expires > pruneAfter * DAY;
});
if (rotten.length > 0) {
  findings.push({
    urgency: 2,
    track: "meta",
    what: `${rotten.length} docket item(s) more than ${pruneAfter} days past expiry`,
    detail: rotten.map((i) => i.file),
    why: "Prune or renew them. A queue nobody prunes stops being a plan.",
  });
}

// 2. Blocked-by chains pointing at items that are neither open nor done. A run
//    waiting on one of these waits forever, and it will not be obvious why.
const known = new Set([
  ...open.map((i) => i.file),
  ...(fs.existsSync(path.join(root, "docket", "done"))
    ? fs.readdirSync(path.join(root, "docket", "done")).filter((f) => f.endsWith(".md"))
    : []),
]);
const dangling = open.filter((item) =>
  (item.fields["blocked-by"] || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .some((ref) => !known.has(ref))
);
if (dangling.length > 0) {
  findings.push({
    urgency: 1,
    track: "meta",
    what: `${dangling.length} docket item(s) blocked on something that does not exist`,
    detail: dangling.map((i) => i.file),
    why: "These can never become ready. Fix the reference or drop the item.",
  });
}

// 3. Nothing queued for any track that needs a queue. Not an error -- scout
//    and maintain can always run -- but the dispatcher should know, because
//    the answer is a scout run rather than inventing work.
const needsQueue = Object.entries(policy.tracks || {})
  .filter(([, cfg]) => cfg.needs_docket_item)
  .map(([name]) => name);
const starved = needsQueue.filter(
  (track) => !open.some((item) => item.fields.track === track)
);
if (starved.length === needsQueue.length && needsQueue.length > 0) {
  findings.push({
    urgency: 3,
    track: "scout",
    what: "no queued work for any track that requires it",
    detail: starved,
    why: "The queue is empty. Refill it by looking outward, not by tidying.",
  });
}

// 4. Published artefacts past their staleness window — the clock the
//    `staleness-clocks` item was filed to build. The report reads every
//    class's window from policy.yml, and anything it flags is an interrupt:
//    published content past its staleness threshold outranks the docket, and
//    the maintain track re-verifies it. The report prints its JSON on stdout
//    in both the pass and the fail state, so an exit-1 is read as a finding
//    rather than as a broken preflight; only a report that cannot produce
//    JSON at all (a missing window key, a file the parser no longer matches)
//    is machinery failure and routes to meta.
let staleness;
try {
  staleness = JSON.parse(
    execFileSync("node", ["scripts/staleness-report.mjs", "--json"], { encoding: "utf8" })
  );
} catch (error) {
  staleness = {
    ok: false,
    stale: null,
    broken: String(error.stdout || error.message || "").trim(),
  };
}
if (staleness.ok === false) {
  if (Array.isArray(staleness.stale) && staleness.stale.length > 0) {
    findings.push({
      urgency: 0.5,
      track: "maintain",
      what: `${staleness.stale.length} published artefact(s) past their staleness window`,
      detail: staleness.stale.map(
        (s) =>
          `${s.class} ${s.name}: verified ${s.verified} — ${s.ageDays} days ago, window ${s.windowDays} days`
      ),
      why: "Published content past its staleness threshold outranks the docket. Re-verify the facts and renew the dates.",
    });
  } else {
    findings.push({
      urgency: 0,
      track: "meta",
      what: "the staleness report failed to run",
      detail: [staleness.broken || "no output"],
      why: "Without the report, nothing knows whether published content is past its staleness window.",
    });
  }
}

// 5. Production not matching main. The GitHub deployments API records a
//    production deployment per push to main and its newest status, so a
//    failed newest deployment is a frozen site — the condition that let ten
//    hours of merges vanish on 15 August while every check stayed green.
//    scripts/check-deployments.mjs reads it through `gh` and prints JSON on
//    stdout in both the pass and the fail state — but exits 1 on a failed
//    deploy, so execFileSync throws and the JSON is in the error's stdout,
//    not a parseable child result. Both paths are read below: a non-zero
//    exit with JSON on stdout is a verdict, and only an exit with no JSON is
//    machinery failure. A real failed deploy routes to build (get the deploy
//    green again); a signal that cannot be read at all routes to meta (fix
//    the signal) — the same split the staleness report uses, so a dead probe
//    is never mistaken for a healthy site.
let deployments;
try {
  const out = execFileSync("node", ["scripts/check-deployments.mjs", "--json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  deployments = JSON.parse(out);
} catch (error) {
  try {
    deployments = JSON.parse(String(error.stdout || ""));
  } catch {
    deployments = {
      ok: false,
      state: null,
      what: "the deployment signal could not be read",
      detail: String(error.stderr || error.message || "").trim(),
    };
  }
}
if (deployments.ok !== true) {
  const brokenSignal = deployments.state === null;
  findings.push({
    urgency: 0,
    track: brokenSignal ? "meta" : "build",
    what: deployments.what || "the deployment signal could not be read",
    detail: [deployments.detail || deployments.what],
    why: brokenSignal
      ? "Without the signal nothing knows whether the site is publishing main — the silence that let 15 August's merges vanish."
      : "Production not matching main outranks the docket. The build track must get the deploy green again; until it is, the record is not being published.",
  });
}

// 6. CHARTER.md rule 22: the site stops demonstrating anything when it stops
//    changing for the people who visit it. Reads git history directly rather
//    than adding a second parser of CHANGELOG.md: every file under
//    `docket/done/` carrying `serves: worth-a-visit` under a VISITOR_FACING
//    track (scripts/visitor-facing-tracks.mjs -- the same list check-docket.mjs
//    and generative-push.mjs already trust) has a real commit that added it,
//    and every shipped round touches CHANGELOG.md (rule 8), so "shipped
//    rounds since the newest one closed" is the count of commits after that
//    one which touch CHANGELOG.md -- no round-number bookkeeping to keep in
//    sync, no dependency on CHANGELOG.md's prose shape.
const gapLimit = policy.max_rounds_between_visitor_facing;
if (typeof gapLimit === "number") {
  try {
    const doneDir = path.join(root, "docket", "done");
    const doneFiles = fs.existsSync(doneDir)
      ? fs.readdirSync(doneDir).filter((f) => f.endsWith(".md"))
      : [];
    const generative = doneFiles.filter((file) => {
      const fields = frontmatter(readText(path.join(doneDir, file)));
      return fields.serves === "worth-a-visit" && VISITOR_FACING.includes(fields.track);
    });

    let sinceRounds;
    let detail;
    if (generative.length === 0) {
      // Nothing has ever closed -- every shipped round there has been counts.
      sinceRounds = execFileSync(
        "git",
        ["log", "--oneline", "HEAD", "--", "CHANGELOG.md"],
        { encoding: "utf8" }
      )
        .split("\n")
        .filter(Boolean).length;
      detail = "no worth-a-visit item has ever closed";
    } else {
      // The newest closure: the commit that ADDED the file under docket/done/,
      // by commit date, across every worth-a-visit item that has ever closed.
      let newest = null;
      for (const file of generative) {
        const sha = execFileSync(
          "git",
          ["log", "--diff-filter=A", "--format=%H", "-1", "--", `docket/done/${file}`],
          { encoding: "utf8" }
        ).trim();
        if (!sha) continue;
        const date = execFileSync("git", ["show", "-s", "--format=%cI", sha], {
          encoding: "utf8",
        }).trim();
        if (!newest || date > newest.date) newest = { sha, date, file };
      }
      if (!newest) throw new Error("no docket/done/ file resolved to an add commit");
      sinceRounds = execFileSync(
        "git",
        ["log", "--oneline", `${newest.sha}..HEAD`, "--", "CHANGELOG.md"],
        { encoding: "utf8" }
      )
        .split("\n")
        .filter(Boolean).length;
      detail = `last closed: ${newest.file} (${newest.sha.slice(0, 8)}, ${newest.date})`;
    }

    if (sinceRounds > gapLimit) {
      findings.push({
        urgency: 4,
        track: "build",
        what: `${sinceRounds} shipped round(s) since a worth-a-visit item last closed (limit ${gapLimit})`,
        detail: [detail],
        why: "CHARTER.md rule 22: not a merge blocker -- ship what is actually broken first -- but never silent.",
      });
    }
  } catch (error) {
    findings.push({
      urgency: 0,
      track: "meta",
      what: "the visitor-facing gap could not be measured",
      detail: [String(error.message || error).split("\n")[0]],
      why: "Without this signal nothing knows whether the site has stopped changing for visitors (CHARTER.md rule 22).",
    });
  }
}

findings.sort((a, b) => a.urgency - b.urgency);

if (json) {
  process.stdout.write(JSON.stringify({ findings }, null, 2));
} else if (findings.length === 0) {
  console.log("ok    preflight clear — nothing outranks the docket");
} else {
  for (const finding of findings) {
    console.log(`!     [${finding.track}] ${finding.what}`);
    for (const line of finding.detail) console.log(`        ${line}`);
    console.log(`        ${finding.why}`);
  }
}
