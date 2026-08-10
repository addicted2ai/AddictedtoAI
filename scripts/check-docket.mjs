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
const expired = open.filter(
  (i) => isDate(i.fields.expires) && Date.parse(i.fields.expires) < Date.now()
);

if (problems.length > 0) {
  for (const problem of problems) console.log(`FAIL  ${problem}`);
  console.log(`\n${problems.length} docket problem(s)`);
  process.exit(1);
}

console.log(`ok    ${items.length} docket item(s) valid (${open.length} open)`);
for (const track of TRACKS) {
  const n = open.filter((i) => i.fields.track === track).length;
  if (n > 0) console.log(`      ${track}: ${n} open`);
}
// Expiry is a prompt to prune, not a build failure: an item going stale is
// normal, and failing CI over it would mean the queue could break the site.
if (expired.length > 0) {
  console.log(`\nnote  ${expired.length} open item(s) past their expiry — prune or renew:`);
  for (const item of expired) console.log(`      ${item.file} (expired ${item.fields.expires})`);
}
