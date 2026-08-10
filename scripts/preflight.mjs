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
// This is currently thin, and honestly so. Most of what belongs here -- demo
// health checks, published claims past their staleness window, production not
// matching main -- needs per-artefact verification dates that do not exist
// yet. That is the `staleness-clocks` docket item, and until it lands the
// preflight can only see what the repository already knows.
//
// Findings are ordered most urgent first. Each names the track that should
// handle it, because an interrupt that does not say who fixes it is a to-do
// list, not a dispatcher input.

import fs from "fs";
import path from "path";
import { load as parseYaml } from "js-yaml";

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
      fields: frontmatter(fs.readFileSync(path.join(dir, file), "utf8")),
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
