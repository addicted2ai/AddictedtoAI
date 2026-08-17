#!/usr/bin/env node
// Validate docket items. Run from the repository root:
//
//   node scripts/check-docket.mjs
//
// Exits non-zero on the first malformed item, printing what was wrong.
//
// The check that matters is the evidence rule: anything filed by scout must
// cite a source outside this project. Scout's charge is to bring back work the
// site could not have thought of by looking at itself, and its failure
// condition is that every item could have been written without leaving the
// repository. That is the failure which produced rounds 38-48, and it is the
// only one here that a well-meaning run would otherwise walk straight into.
//
// Frontmatter is parsed by hand rather than with a YAML dependency, matching
// how CHANGELOG.md is parsed. The format is deliberately flat so that stays
// honest -- no nesting, no lists, one `key: value` per line.

import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { load as parseYaml } from "js-yaml";

// Every regex below anchors on a bare newline. `.gitattributes` now forces LF
// on checkout, but a working copy created before that attribute existed still
// holds CRLF, and under CRLF the frontmatter block matches nothing at all --
// which is how the first scout run found every pre-existing docket item
// "malformed" in a repository where every committed blob was already LF.
// Reading through here makes the parser independent of how the file arrived.
function readText(file) {
  return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
}

const TRACKS = ["scout", "author", "build", "maintain", "audit", "meta"];
const FILERS = [...TRACKS, "maintainer"];
const SERVES = ["more-true", "more-checkable", "more-current", "floor"];
const SECTIONS = ["Why now", "Evidence", "Done when"];
const REQUIRED = ["track", "filed-by", "title", "created", "expires", "serves", "priority"];

// Advancing tracks must name which charter test they serve; defending tracks
// use `floor` and are exempt from the first test on purpose.
const DEFENDING = ["maintain", "audit"];

const root = process.cwd();
const dir = path.join(root, "docket");
const problems = [];
const seen = new Set();

function fail(file, message) {
  problems.push(`${file}: ${message}`);
}

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split("\n")) {
    if (!line.trim()) continue;
    const colon = line.indexOf(":");
    if (colon === -1) return null;
    fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return fields;
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

// A link is external if it leaves this project. Anything pointing at the
// repository or the site is this project citing itself, which CHARTER.md
// rule 2 forbids as evidence about the world.
function externalLinks(section) {
  return [...section.matchAll(/https?:\/\/[^\s)<>\]]+/g)]
    .map(([url]) => url)
    .filter((url) => !/addictedtoai\.net|github\.com\/addicted2ai/i.test(url));
}

function sectionBody(text, heading) {
  const start = text.indexOf(`## ${heading}`);
  if (start === -1) return null;
  const after = text.slice(start + heading.length + 3);
  const next = after.search(/\n## /);
  return next === -1 ? after : after.slice(0, next);
}

function checkItem(status, file, text) {
  const label = `docket/${status}/${file}`;

  if (!/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md$/.test(file)) {
    fail(label, "filename must be YYYY-MM-DD-slug.md");
    return;
  }
  if (seen.has(file)) fail(label, "duplicate filename in another status directory");
  seen.add(file);

  const fields = parseFrontmatter(text);
  if (!fields) {
    fail(label, "missing or malformed frontmatter block");
    return;
  }

  for (const key of REQUIRED) {
    if (!fields[key]) fail(label, `missing required field: ${key}`);
  }
  if (fields.track && !TRACKS.includes(fields.track)) {
    fail(label, `track "${fields.track}" is not one of: ${TRACKS.join(", ")}`);
  }
  if (fields["filed-by"] && !FILERS.includes(fields["filed-by"])) {
    fail(label, `filed-by "${fields["filed-by"]}" is not one of: ${FILERS.join(", ")}`);
  }
  if (fields.serves && !SERVES.includes(fields.serves)) {
    fail(label, `serves "${fields.serves}" is not one of: ${SERVES.join(", ")}`);
  }
  if (fields.track && fields.serves) {
    const defending = DEFENDING.includes(fields.track);
    if (defending && fields.serves !== "floor") {
      fail(label, `${fields.track} is a defending track and must use serves: floor`);
    }
    if (!defending && fields.serves === "floor") {
      fail(label, `${fields.track} advances the site and must name which test it serves`);
    }
  }
  for (const key of ["created", "expires"]) {
    if (fields[key] && !isDate(fields[key])) fail(label, `${key} must be YYYY-MM-DD`);
  }
  if (fields.created && fields.expires && isDate(fields.created) && isDate(fields.expires)) {
    if (Date.parse(fields.expires) <= Date.parse(fields.created)) {
      fail(label, "expires must be after created");
    }
  }
  if (fields.priority && !["1", "2", "3"].includes(fields.priority)) {
    fail(label, `priority "${fields.priority}" must be 1, 2 or 3`);
  }
  // blocked-on is an optional escape from the capacity counts and from `ready`
  // in the dispatcher. Its only accepted value is `maintainer`, which means:
  // this item is real, and no round can close it. Rejecting every other value
  // stops the field from becoming a free-text hatch that empties the queue.
  // The field escapes capacity, not growth — the filing gate still counts a
  // blocked item when measuring whether the track's total grew.
  if (fields["blocked-on"] && fields["blocked-on"] !== "maintainer") {
    fail(label, `blocked-on "${fields["blocked-on"]}" — the only accepted value is "maintainer"`);
  }

  for (const heading of SECTIONS) {
    const body = sectionBody(text, heading);
    if (body === null) fail(label, `missing section: ## ${heading}`);
    else if (!body.trim()) fail(label, `section ## ${heading} is empty`);
  }

  const done = sectionBody(text, "Done when");
  if (done && !/^\s*- \[[ x]\]/m.test(done)) {
    fail(label, "## Done when must be a checklist, so the item can be finished");
  }

  if (fields["filed-by"] === "scout") {
    const evidence = sectionBody(text, "Evidence") || "";
    if (externalLinks(evidence).length === 0) {
      fail(
        label,
        "filed by scout with no external citation — an item that could have been " +
          "written without leaving the repository is scout's failure condition"
      );
    }
  }

  if (status === "dropped" && sectionBody(text, "Dropped") === null) {
    fail(label, "dropped items must say why in a ## Dropped section");
  }

  return fields;
}

const statuses = ["open", "done", "dropped"];
const items = [];

for (const status of statuses) {
  const statusDir = path.join(dir, status);
  if (!fs.existsSync(statusDir)) {
    problems.push(`docket/${status}/ is missing`);
    continue;
  }
  for (const file of fs.readdirSync(statusDir).filter((f) => f.endsWith(".md"))) {
    const text = readText(path.join(statusDir, file));
    const fields = checkItem(status, file, text);
    if (fields) items.push({ status, file, fields });
  }
}

// blocked-by has to point at something. A chain of items is how work spans
// runs, and a dangling reference means a run waits forever on nothing.
const known = new Set(items.map((i) => i.file));
for (const { status, file, fields } of items) {
  if (!fields["blocked-by"]) continue;
  for (const ref of fields["blocked-by"].split(",").map((s) => s.trim()).filter(Boolean)) {
    if (!known.has(ref)) {
      fail(`docket/${status}/${file}`, `blocked-by references unknown item: ${ref}`);
    }
  }
}

const open = items.filter((i) => i.status === "open");
// Items blocked on the maintainer are real, open, and uncountable: no round
// can close them, so including them in capacity counts would consume budget
// the loop can never free. They are excluded from the capacity counts below
// and reported on their own line so they stay visible. They are NOT excluded
// from growth: an item nobody counts is an item anyone can add, so the filing
// gate measures growth on the total including them (see below).
const counted = open.filter((i) => !i.fields["blocked-on"]);
const blocked = open.filter((i) => i.fields["blocked-on"]);
const expired = counted.filter(
  (i) => isDate(i.fields.expires) && Date.parse(i.fields.expires) < Date.now()
);

// --- the filing gate ----------------------------------------------------------
//
// Nothing here is about the shape of an item: it is about the capacity of the
// track receiving it. A track's budget is `queue_budget` in policy.yml — the
// stock it can actually spend. The gate forbids *growth* on top of it, and the
// two questions are measured separately on purpose:
//
//     FAIL if head_total > base_total AND head_counted > budget
//
// Growth is the total open count for the track, including items carrying
// `blocked-on` — filing anything into an over-budget track fails, whatever
// frontmatter it carries. Capacity (whether the track is over budget at all)
// is the counted total, excluding `blocked-on` items — that is the field's
// whole purpose: two items no round can ever close should not consume budget
// the loop cannot free. Review found the first shipped shape walkable because
// it measured growth on the counted total too: a new item carrying
// `blocked-on` changed no count, so the hatch was open to anything. It is
// closed by this split.
//
// The overage that already exists on main is tolerated (author holds ~30
// against a budget of 6); only the next item is impossible.
//
// The base is read from origin/main, never from the working copy, and the
// budgets are read from policy.yml on origin/main as well as from the branch.
// A gate that read only the branch's own tree could be walked around in one
// commit — raise the budget, file against the new number, every check green.
// That is the round-78 hole check-track-scope.mjs records in its own header,
// and it is closed here twice: the filing gate judges head against the base
// budget, and the budget-raise rule below fails any branch that raises a
// budget AND grows that track's count in the same diff — CHARTER.md rule 11
// made mechanical for this gate.
//
// Where origin/main cannot be resolved the gate is skipped with a WARN and the
// check still exits 0 for it — a single-branch clone has no remote ref, and a
// check that cannot read its baseline must not invent one or take the build
// down with it. This is the guard count-changelog-rounds.mjs carries after
// PR #90: two production outages on 15 August came from prebuild checks that
// shelled out to git for a ref the deployment clone did not have.

function countRef(list) {
  const out = {};
  for (const item of list) {
    const track = item.fields.track;
    if (track) out[track] = (out[track] || 0) + 1;
  }
  return out;
}

function budgetsFrom(policy) {
  const out = {};
  for (const [track, cfg] of Object.entries(policy.tracks || {})) {
    if (cfg && typeof cfg.queue_budget === "number" && cfg.queue_budget >= 0) {
      out[track] = cfg.queue_budget;
    }
  }
  return out;
}

function readBase() {
  const ls = execFileSync(
    "git",
    ["ls-tree", "-r", "--name-only", "origin/main", "--", "docket/open"],
    { encoding: "utf8" }
  );
  const baseItems = [];
  for (const file of ls.split("\n").map((s) => s.trim()).filter(Boolean)) {
    if (!file.endsWith(".md")) continue;
    const text = execFileSync("git", ["show", `origin/main:${file}`], {
      encoding: "utf8",
    }).replace(/\r\n/g, "\n");
    const fields = parseFrontmatter(text);
    if (fields) baseItems.push({ file, fields });
  }
  const policy = parseYaml(
    execFileSync("git", ["show", "origin/main:policy.yml"], { encoding: "utf8" })
  );
  return { baseItems, policy };
}

const gateFailures = [];

let base = null;
try {
  execFileSync("git", ["rev-parse", "--verify", "--quiet", "origin/main^{commit}"], {
    stdio: "ignore",
  });
  base = readBase();
} catch (error) {
  console.error(
    "WARN  origin/main is not in this checkout — the filing gate cannot read its baseline and is skipped"
  );
  console.error(
    "      a single-branch or shallow clone has no remote ref; the docket is still validated, only the gate is off"
  );
}

const headPolicy = parseYaml(fs.readFileSync(path.join(root, "policy.yml"), "utf8"));
const headCounted = countRef(counted);
const headTotals = countRef(open);
const headBudgets = budgetsFrom(headPolicy);

if (base) {
  const baseCounted = countRef(base.baseItems.filter((i) => !i.fields["blocked-on"]));
  const baseTotals = countRef(base.baseItems);
  const baseBudgets = budgetsFrom(base.policy);
  const gated = new Set([...Object.keys(baseBudgets), ...Object.keys(headBudgets)]);

  const lines = [];
  for (const track of TRACKS) {
    const budget = baseBudgets[track] ?? headBudgets[track];
    if (budget == null) continue;
    lines.push(
      `      ${track.padEnd(9)} base ${String(baseTotals[track] || 0).padStart(2)}` +
        ` -> head ${String(headTotals[track] || 0).padStart(2)}  (queue budget ${budget})`
    );
  }
  base.gateLines = lines;

  for (const track of gated) {
    const baseTotal = baseTotals[track] || 0;
    const headTotal = headTotals[track] || 0;
    const budget = baseBudgets[track] ?? headBudgets[track];
    if (budget == null) continue;
    if (headTotal > baseTotal && (headCounted[track] || 0) > budget) {
      gateFailures.push(
        `filing gate: ${track} open count grew ${baseTotal} -> ${headTotal}` +
          ` while over its queue budget (${budget})`
      );
    }
    if ((headBudgets[track] ?? 0) > (baseBudgets[track] ?? 0) && headTotal > baseTotal) {
      gateFailures.push(
        `budget-raise rule: ${track}'s queue_budget was raised` +
          ` ${baseBudgets[track] ?? "none"} -> ${headBudgets[track]}` +
          ` and its open count grew ${baseTotal} -> ${headTotal} in the same diff`
      );
    }
  }
}

if (problems.length > 0) {
  for (const problem of problems) console.log(`FAIL  ${problem}`);
  console.log(`\n${problems.length} docket problem(s)`);
  process.exit(1);
}

console.log(`ok    ${items.length} docket item(s) valid (${open.length} open)`);
for (const track of TRACKS) {
  const n = counted.filter((i) => i.fields.track === track).length;
  if (n > 0) console.log(`      ${track}: ${n} open`);
}
if (blocked.length > 0) {
  console.log("      blocked on maintainer (excluded from capacity counts; still counted for growth):");
  for (const { file, fields } of blocked) {
    console.log(`        ${file}  (${fields.track})`);
  }
}
// Expiry is a prompt to prune, not a build failure: an item going stale is
// normal, and failing CI over it would mean the queue could break the site.
if (expired.length > 0) {
  console.log(`\nnote  ${expired.length} open item(s) past their expiry — prune or renew:`);
  for (const item of expired) console.log(`      ${item.file} (expired ${item.fields.expires})`);
}

if (base && base.gateLines.length > 0) {
  console.log("gate  filing gate — base read from origin/main, head from this tree");
  for (const line of base.gateLines) console.log(line);
}

if (gateFailures.length > 0) {
  console.log();
  for (const failure of gateFailures) console.log(`FAIL  ${failure}`);
  console.log(`\n${gateFailures.length} filing-gate failure(s)`);
  process.exit(1);
}
