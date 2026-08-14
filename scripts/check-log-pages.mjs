#!/usr/bin/env node
// Assert the log pages together render every round in CHANGELOG.md exactly
// once. Run from the repository root against a server on $BASE.
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
// Since round 94 the current era is not two pages but many: /log renders
// the newest rounds its derived page-size block fits in full and the older
// current-era rounds each live on a permanent page at /log/rounds/<id>. A
// stub's target page is read from its own heading link, so the check does
// not need to know the URL scheme — it only needs every stub to point at a
// page that renders the round it names. The per-round pages also carry the
// AI disclosure, asserted here because scripts/check-routes.sh's disclosure
// walk names its routes statically and cannot.
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

const {
  getArchivedLog,
  getCurrentLog,
  getEarlyEraLog,
  getPagedLog,
  getBuildLog,
  estimateLogPageWeight,
} = await import(
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

// Every round that moved off /log renders in full on exactly one target page.
// The target is read from the stub's own heading link rather than assumed:
// a stub pointing at a page that does not render its round is a dead link
// that no HTTP check would catch, and a URL scheme change must not silently
// stop this check from checking.
function stubTargets(logHtml) {
  const targets = new Map();
  for (const tag of logHtml.matchAll(
    /<li class="log-stub" id="(round-[^"]+)">([\s\S]*?)<\/li>/g
  )) {
    const [, id, body] = tag;
    const href = body.match(/<a[^>]*class="log-round-link"[^>]*href="([^"]+)"/);
    const target = href?.[1] ? href[1].split("#")[0] : null;
    targets.set(id, target);
  }
  return targets;
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
  paged: getPagedLog(),
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
const partitionSum =
  parser.log.length + parser.early.length + parser.archive.length + parser.paged.length;
if (partitionSum !== parserTotal) {
  fail(`parser partition ${parser.log.length}+${parser.early.length}+${parser.archive.length}+${parser.paged.length} != total ${parserTotal}`);
} else {
  ok(`parser splits the record as ${parser.log.length} / ${parser.early.length} / ${parser.archive.length} / ${parser.paged.length}`);
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

// 4. Every stub's own link opens the round in full, and the per-round pages
//    render exactly the round they name. A target may be a collection page
//    (the archive renders 47 rounds) or a single-round page, so the
//    assertion is membership, not a count of one. Stubs are grouped by
//    target so a collection page is fetched once, not once per round it
//    holds; the per-round pages also carry the AI disclosure, asserted here
//    because scripts/check-routes.sh's disclosure walk names its routes
//    statically and cannot.
const targets = stubTargets(logHtml);
let dangling = 0;
let disclosureFailures = 0;
const pagedRendered = new Set();
const byTarget = new Map();
for (const [id, target] of targets) {
  if (!target) {
    fail(`stub ${id} on /log links to no target page`);
    dangling++;
    continue;
  }
  if (!byTarget.has(target)) byTarget.set(target, new Set());
  byTarget.get(target).add(id);
}
for (const [target, ids] of byTarget) {
  const url = /^https?:\/\//.test(target) ? target : `${base}${target}`;
  let body;
  try {
    body = await fetchText(url);
  } catch (error) {
    for (const id of ids) {
      fail(`stub ${id} points at ${url}, which returned ${error.message}`);
      dangling++;
    }
    continue;
  }
  const rendered = new Set(collect(body, "log-entry"));
  const elsewhere = new Set([...full.early, ...full.archive]);
  for (const id of ids) {
    if (rendered.has(id)) {
      ok(`stub ${id} -> ${url} renders the round in full`);
      // A round read on /log/early or /log/archive is already counted in
      // that page's own bucket; only rounds on pages of their own belong to
      // the per-round bucket, or the partition below double-counts.
      if (!elsewhere.has(id)) pagedRendered.add(id);
    } else {
      fail(`stub ${id} points at ${url}, which does not render it in full`);
      dangling++;
    }
  }
  if (body.includes("data-ai-disclosure")) {
    ok(`${url} carries the AI disclosure`);
  } else {
    fail(`${url} renders no AI disclosure`);
    disclosureFailures++;
  }
}

// 5. The pages together render every round in full exactly once: /log's
//    block, the early log, the archive, and the per-round pages.
const union = new Set([...full.log, ...full.early, ...full.archive, ...pagedRendered]);
const totalFull = full.log.length + full.early.length + full.archive.length + pagedRendered.size;
if (union.size !== expected || totalFull !== union.size) {
  fail(
    `full entries across all pages are not a clean partition of ${expected} rounds ` +
      `(${totalFull} rendered, ${union.size} unique) — a round is on two pages or on none`
  );
} else {
  ok(`all pages together render ${union.size} rounds in full, once each`);
}

// 6. Every round not rendered in full on /log keeps a stub there, and no
//    stub dangles. Nothing on /log without a stub, nothing elsewhere that
//    should have one.
const logFullIds = new Set(full.log);
const logStubIds = new Set(stubsOnLog);
// The rounds that moved off /log: the early and archived eras (rendered) plus
// the current-era rounds on per-round pages (rendered, collected above).
const movedIds = new Set([...full.early, ...full.archive, ...pagedRendered]);
if (logStubIds.size !== stubsOnLog.length) {
  fail(`/log repeats a stub anchor (${stubsOnLog.length} stubs, ${logStubIds.size} unique)`);
} else if (logStubIds.size !== movedIds.size) {
  fail(
    `/log carries ${logStubIds.size} stubs for ${movedIds.size} rounds that moved — ` +
      "a stub is missing or a round is stubbed twice"
  );
} else {
  let mismatched = false;
  for (const id of movedIds) {
    if (!logStubIds.has(id)) {
      fail(`round ${id} moved to another page but has no stub on /log`);
      mismatched = true;
    }
  }
  if (!mismatched) {
    ok(`all ${logStubIds.size} moved rounds keep a stub on /log`);
  }
}

// 7. Every round has an anchor on /log (full or stub), so every feed link
//    `/log#round-...` still resolves.
const onLog = new Set([...full.log, ...stubsOnLog]);
if (onLog.size !== expected) {
  fail(`/log resolves ${onLog.size} anchors, expected all ${expected} rounds`);
} else {
  ok(`every one of the ${onLog.size} rounds has a resolving anchor on /log`);
}

// 8. Nothing fetched above dangled, and every per-round page disclosed.
if (dangling > 0 || disclosureFailures > 0) {
  fail(`${dangling} dangling stub(s), ${disclosureFailures} page(s) without disclosure`);
} else {
  ok(`every stub opens its round in full, every per-round page discloses`);
}

// 9. The derivation that picks the full block keeps its own promise, and
//    rebalances as entries accumulate. The derivation reads the budget from
//    lighthouserc.json and estimates each entry's weight from its gzipped
//    text, so it can be asserted against without a server — and it must be,
//    because it is the mechanism that keeps the wall from returning. Three
//    properties: the real entries yield exactly the block /log renders;
//    the estimate stays under the ceiling; and fattening the newest entry
//    rebalances the block smaller instead of growing the page toward the
//    wall.
const era = getBuildLog().filter(
  (entry) => entry.declaredOrigin && entry.number > 70
);
const real = estimateLogPageWeight(era);
if (real.size !== parser.log.length) {
  fail(`the derivation yields a block of ${real.size}, but /log renders ${parser.log.length}`);
} else {
  ok(`the derivation picks exactly the ${real.size} rounds /log renders`);
}
if (real.estimatedWeight > real.ceiling) {
  fail(
    `the derived page is estimated at ${real.estimatedWeight} bytes, over the ceiling of ${real.ceiling}`
  );
} else {
  ok(`the derived page is estimated at ${real.estimatedWeight} of ${real.ceiling} bytes`);
}
// A synthetic fattened newest entry — roughly five times the measured
// average entry weight — must shrink the full block, not grow the page.
// Repetitive text would gzip to nothing, so the filler is non-repeating.
const filler = Array.from({ length: 12000 }, (_, i) => `word${i}`).join(" ");
const grown = {
  ...era[0],
  intro: `${era[0].intro || ""} ${filler}`,
};
const sim = estimateLogPageWeight([grown, ...era.slice(1)]);
if (sim.size >= real.size) {
  fail(
    `fattening the newest entry kept the block at ${sim.size} — the derivation does not rebalance`
  );
} else {
  ok(`fattening the newest entry rebalances the block from ${real.size} to ${sim.size}`);
}
if (sim.estimatedWeight > sim.ceiling) {
  fail(`the rebalanced page is estimated at ${sim.estimatedWeight}, over its ceiling`);
} else {
  ok(`the rebalanced page still fits its ceiling`);
}

// exitCode, not process.exit(): exiting from inside this top-level await
// while fetch sockets are still open trips a libuv assertion on Windows and
// reports a false failure. check-routes.sh carries the same note for its
// inline fetch scripts.
if (failures > 0) {
  console.log(`\n${failures} log-page check(s) failed`);
  process.exitCode = 1;
} else {
  console.log("ok    the log pages partition the record, and /log keeps every anchor");
  process.exitCode = 0;
}
