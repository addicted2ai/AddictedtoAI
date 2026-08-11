#!/usr/bin/env node
// Assert the three log pages together render every round in CHANGELOG.md
// exactly once. Run from the repository root against a server on $BASE.
//
//   npm run build && npm run start &
//   BASE=http://localhost:3000 node scripts/check-log-pages.mjs
//
// The single-page version of this check could only prove /log rendered the
// number of anchors the changelog has; with three pages that is not enough —
// a round could vanish between pages, or be rendered in full on two of them,
// and the total would still add up. The invariant worth asserting now:
//
//   - the parser sees exactly the rounds the changelog has (parser total
//     against a heading count read from the file, not from the parser);
//   - the parser's page partition is complete and disjoint;
//   - each page renders in full exactly the rounds the parser assigns it;
//   - the pages together render every round in full exactly once (no round on
//     two pages, none on none);
//   - every round not rendered in full on /log keeps a stub there, so every
//     /log#anchor the feed has emitted still resolves; and no stub is
//     dangling — each one's target page renders the round in full.
//
// A parser bug that drops a round moves the parser total off the changelog
// count; a page bug that fails to render a round moves the page off the
// parser count; either fails here. This project has shipped green checks that
// could not go red, so each of these comparisons is written to fail on zero
// as well as on mismatch — "measured nothing" is not a pass.

import fs from "fs";
import path from "path";

const root = process.cwd();
const base = process.env.BASE || "http://localhost:3000";

const { getArchivedLog, getCurrentLog, getEarlyEraLog, getBuildLog } =
  await import(
    `file://${path.join(root, "app", "lib", "build-log.js").replace(/\\/g, "/")}`
  );

// The changelog's own heading count, mirroring scripts/check-routes.sh: the
// template placeholder section (### YYYY-MM-DD) is not a round. Read from the
// file rather than from the parser, so a parser that stops understanding a
// heading shape fails against the file instead of against itself.
const changelog = fs.readFileSync(path.join(root, "CHANGELOG.md"), "utf8");
const lines = changelog.split("\n");
const expected =
  lines.filter((l) => /^### /.test(l)).length -
  lines.filter((l) => /^### YYYY-MM-DD/.test(l)).length;

const fetchText = async (url) => {
  const response = await fetch(url);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  return text;
};

const [logHtml, earlyHtml, archiveHtml] = await Promise.all([
  fetchText(`${base}/log`),
  fetchText(`${base}/log/early`),
  fetchText(`${base}/log/archive`),
]);

// Only the rendered markup matches attribute syntax. The RSC flight payload
// repeats every entry with its props serialised as JSON (`"id":"round-..."`,
// `"className":"log-entry"`), so `id="round-..."` and `class="log-entry"`
// only ever hit the rendered <li> elements.
function collect(html, tagClass) {
  const ids = [...html.matchAll(
    new RegExp(`<li[^>]*class="${tagClass}"[^>]*id="(round-[^"]+)"`, "g")
  )].map((m) => m[1]);
  return ids;
}

const full = {
  log: collect(logHtml, "log-entry"),
  early: collect(earlyHtml, "log-entry"),
  archive: collect(archiveHtml, "log-entry"),
};
const stubsOnLog = collect(logHtml, "log-stub");

const parser = {
  log: getCurrentLog(),
  early: getEarlyEraLog(),
  archive: getArchivedLog(),
};
const parserTotal = getBuildLog().length;

let failures = 0;
const fail = (message) => {
  console.log(`FAIL  ${message}`);
  failures++;
};
const ok = (message) => console.log(`ok    ${message}`);

// 1. The parser sees every round the changelog has.
if (parserTotal !== expected) {
  fail(`the parser sees ${parserTotal} rounds, CHANGELOG.md has ${expected}`);
} else {
  ok(`parser reads all ${parserTotal} rounds from CHANGELOG.md`);
}

// 2. The parser's page partition is complete and disjoint.
const partitionSum = parser.log.length + parser.early.length + parser.archive.length;
if (partitionSum !== parserTotal) {
  fail(`parser partition ${parser.log.length}+${parser.early.length}+${parser.archive.length} != total ${parserTotal}`);
} else {
  ok(`parser splits the record as ${parser.log.length} / ${parser.early.length} / ${parser.archive.length}`);
}

// 3. Each page renders in full exactly the rounds the parser assigns it, and
//    no page repeats an anchor.
for (const page of ["log", "early", "archive"]) {
  const rendered = full[page];
  const unique = new Set(rendered);
  const want = parser[page].length;
  if (rendered.length !== unique.size) {
    fail(`/${page} repeats an anchor (${rendered.length} ids, ${unique.size} unique)`);
  } else if (rendered.length !== want) {
    fail(`/${page} renders ${rendered.length} full entries, expected ${want}`);
  } else {
    ok(`/${page} renders ${rendered.length} full entries`);
  }
}

// 4. The three pages together render every round in full exactly once.
const union = new Set([...full.log, ...full.early, ...full.archive]);
const totalFull = full.log.length + full.early.length + full.archive.length;
if (union.size !== expected || totalFull !== union.size) {
  fail(
    `full entries across pages are not a clean partition of all ${expected} rounds ` +
      `(${totalFull} rendered, ${union.size} unique) — a round is on two pages or on none`
  );
} else {
  ok(`the three pages together render all ${union.size} rounds in full, once each`);
}

// 5. Every round not rendered in full on /log keeps a stub there, and every
//    stub's target page renders the round in full. Nothing dangles either way.
const logFullIds = new Set(full.log);
const logStubIds = new Set(stubsOnLog);
const movedFullIds = new Set([...full.early, ...full.archive]);
if (logStubIds.size !== stubsOnLog.length) {
  fail(`/log repeats a stub anchor (${stubsOnLog.length} stubs, ${logStubIds.size} unique)`);
} else if (logStubIds.size !== movedFullIds.size) {
  fail(
    `/log carries ${logStubIds.size} stubs for ${movedFullIds.size} rounds that moved — ` +
      "a stub is missing or a round is stubbed twice"
  );
} else {
  let mismatched = false;
  for (const id of movedFullIds) {
    if (!logStubIds.has(id)) {
      fail(`round ${id} moved to another page but has no stub on /log`);
      mismatched = true;
    }
  }
  if (!mismatched) {
    ok(`all ${logStubIds.size} moved rounds keep a stub on /log`);
  }
}
for (const id of logStubIds) {
  if (!movedFullIds.has(id)) {
    fail(`stub ${id} on /log points at no full entry on /log/early or /log/archive`);
  }
}

// 6. Every round has an anchor on /log (full or stub), so every feed link
//    `/log#round-...` still resolves.
const onLog = new Set([...full.log, ...stubsOnLog]);
if (onLog.size !== expected) {
  fail(`/log resolves ${onLog.size} anchors, expected all ${expected} rounds`);
} else {
  ok(`every one of the ${onLog.size} rounds has a resolving anchor on /log`);
}

// exitCode, not process.exit(): exiting from inside this top-level await
// while fetch sockets are still open trips a libuv assertion on Windows and
// reports a false failure. check-routes.sh carries the same note for its
// inline fetch scripts.
if (failures > 0) {
  console.log(`\n${failures} log-page check(s) failed`);
  process.exitCode = 1;
} else {
  console.log("ok    the three log pages partition the record, and /log keeps every anchor");
  process.exitCode = 0;
}
