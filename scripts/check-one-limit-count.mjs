#!/usr/bin/env node
// Guardrail for the blog's "one limit" count. Runs in two modes:
//
//   node scripts/check-one-limit-count.mjs                  (build time)
//   node scripts/check-one-limit-count.mjs --rendered <url> (route checks)
//
// The page renders its count of pull requests that merged over a failing
// `human-owned-paths` check from scripts/one-limit-count-sweep.json — the
// machine-readable output scripts/sweep-one-limit-count.mjs writes. That
// output is data, so it can be corrupted, and the page is code, so it can
// be edited back into hardcoding. Both drift directions get a guard here:
//
// Build time: the sweep output must be well-formed enough to be the number
// the page shows — count must equal the size of the failing set, the set
// must be a sorted list of distinct pull-request numbers, the documented
// #23 exception must not be in it, the sweep date must be real, and the
// rules that make the count mean anything must be stated in the file.
// Also, the page must actually import the reader — a page that stops
// rendering from the sweep output has failed its charge even if the number
// on it happens to be right.
//
// Rendered: fetch the live page and assert it shows exactly the count word
// and the failing set the sweep output records. This is the check that
// would catch the third drift mode — the number rendered by a page that
// was edited back to prose — and it runs wherever check-routes.sh runs:
// locally under `node scripts/round.mjs check` and in CI.
//
// The count word comes from app/lib/one-limit-count.js, the same module
// the page renders from — never a second copy of the number.

import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const SWEEP_FILE = path.join(process.cwd(), "scripts", "one-limit-count-sweep.json");
const PAGE_FILE = path.join(process.cwd(), "app", "blog", "page.js");
const EXCLUDED_PR = 23;

function fail(message) {
  console.error(`FAIL  ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`ok    ${message}`);
}

let sweep;
try {
  sweep = JSON.parse(fs.readFileSync(SWEEP_FILE, "utf8"));
} catch (error) {
  fail(`could not read scripts/one-limit-count-sweep.json — the sweep output is missing or unparseable (${error.message})`);
}

function assertNumber(value, name) {
  if (!Number.isInteger(value) || value < 0) {
    fail(`sweep output has no valid ${name} — the sweep script's output shape changed`);
  }
}

assertNumber(sweep.count, "count");
assertNumber(sweep.mergedCount, "mergedCount");
assertNumber(sweep.passingCount, "passingCount");
assertNumber(sweep.predatingCount, "predatingCount");

if (!Array.isArray(sweep.failing)) {
  fail("sweep output has no failing array — the sweep script's output shape changed");
}
const set = sweep.failing;
for (const n of set) {
  if (!Number.isInteger(n) || n < 1) {
    fail(`failing set contains "${n}", which is not a pull-request number`);
  }
}
if (new Set(set).size !== set.length) {
  fail("failing set contains duplicates — the count cannot be verified");
}
const sorted = [...set].sort((a, b) => a - b);
if (JSON.stringify(sorted) !== JSON.stringify(set)) {
  fail("failing set is not sorted — the sweep script's output shape changed");
}
if (set.length !== sweep.count) {
  fail(`sweep output counts ${sweep.count} but its failing set has ${set.length} members — count and set disagree, and the page would render both`);
}
if (set.includes(EXCLUDED_PR)) {
  fail(`failing set includes the documented exception #${EXCLUDED_PR} — the exclusion rule is not applied`);
}
if (typeof sweep.sweptAt !== "string" || Number.isNaN(Date.parse(sweep.sweptAt))) {
  fail(`sweep output has no valid sweptAt timestamp — the page's snapshot date cannot be stated`);
}
if (Date.parse(sweep.sweptAt) > Date.now() + 60_000) {
  fail(`sweep output is dated ${sweep.sweptAt}, in the future — the sweep output is not what was run`);
}
if (!Array.isArray(sweep.rules) || sweep.rules.length < 2 || !sweep.rules.every((r) => typeof r === "string" && r.length > 0)) {
  fail("sweep output does not state its rules — the #23 exclusion and the head-commit rule must be in the output, not just the script");
}
const rules = sweep.rules.join("\n");
if (!/head/i.test(rules) || !rules.includes(String(EXCLUDED_PR))) {
  fail(`sweep output's rules do not state both sharp edges (head commit, #${EXCLUDED_PR} exclusion) — criterion unfulfilled`);
}

const pageSource = fs.readFileSync(PAGE_FILE, "utf8");
const readerImport = pageSource.match(/import\s*\{[^}]*getOneLimitCount[^}]*\}\s*from\s*["']\.\.\/lib\/one-limit-count(?:\.js)?["']/);
if (!readerImport) {
  fail("app/blog/page.js does not import the sweep-output reader — the page must render the count from the checked-in output, not hardcode it");
}

ok(`sweep output is internally consistent: count ${sweep.count}, ${set.length} set member(s), swept ${sweep.sweptAt}`);

// --- rendered mode --------------------------------------------------------
//
// NOTE: after the fetch below, failures are recorded via process.exitCode
// rather than process.exit(). Exiting from inside an async callback while
// fetch sockets are still open trips a libuv assertion on Windows and
// reports a false failure — the same trap check-routes.sh documents for its
// inline node scripts.

if (process.argv.includes("--rendered")) {
  const urlIndex = process.argv.indexOf("--rendered");
  const url = process.argv[urlIndex + 1];
  if (!url) {
    fail("--rendered needs a URL, e.g. node scripts/check-one-limit-count.mjs --rendered http://localhost:3000/blog");
  }

  const { getOneLimitCount } = await import(pathToFileURL(path.join(process.cwd(), "app", "lib", "one-limit-count.js")).href);
  let rendered;
  try {
    rendered = await fetch(url).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.text();
    });
  } catch (error) {
    console.error(`FAIL  --rendered: could not fetch ${url} — ${error.message}`);
    process.exitCode = 1;
  }

  if (rendered !== undefined) {
    // The page renders the count sentence from the sweep output through the
    // same lib module this check imports, so the needle is the sentence
    // itself — including the sweep's own date, which appears nowhere else on
    // the page. A page hardcoded back to prose fails this even when its
    // numbers coincide with the historical narrative ("eight by nightfall"
    // is history, not the count).
    const limit = getOneLimitCount();
    if (rendered.includes(limit.countSentence)) {
      ok(`rendered page carries the sweep sentence: "${limit.countSentence}"`);
    } else {
      console.error(
        `FAIL  rendered page does not show the sweep sentence "${limit.countSentence}" — the page is not rendering the checked-in sweep output`
      );
      process.exitCode = 1;
    }
  }
}
