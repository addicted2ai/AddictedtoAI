#!/usr/bin/env node
// Report the staleness of every published artefact against the windows in
// policy.yml. Run from the repository root:
//
//   node scripts/staleness-report.mjs            # human-readable
//   node scripts/staleness-report.mjs --json     # machine-readable, for the
//                                                # preflight
//
// One report, every class of published artefact with a per-claim
// verification date:
//
//   - Directory entries           app/lib/tool-categories.js
//   - retirement-commitment rows  app/lib/retirement-commitments.js
//   - retirement-calendar rows    app/lib/retirement-dates.js
//   - blog posts                  app/lib/posts.js
//   - demos                       app/lib/demos.js
//
// This script is the consolidation of scripts/check-tool-staleness.mjs and
// scripts/check-retirement-staleness.mjs, which it replaces (round 132).
// The two were the same mechanism parsing the same files with the same
// policy lookups, and the staleness-clocks item adds two more artefact
// classes (posts, demos) — a third per-class checker would have been a
// third parser for one rule. One report, one parser, one policy lookup:
// the failure mode this project keeps shipping is a second copy of a
// threshold or a rule that drifts from the first.
//
// It fails the build (via prebuild, before every `next build`) when
// anything is past its window or missing a date, and
// scripts/preflight.mjs reads the --json output so published content past
// its staleness threshold becomes an interrupt that outranks the docket.
//
// The windows are read from policy.yml, never copied: a threshold restated
// in a second file drifts from the one a run is told to honour.
// preflight.mjs and dispatch.mjs already parse policy.yml the same way.
//
// The retirement-commitment rows are judged against the Directory's own
// window (staleness_days.directory_entry, 45 days), not a dedicated key:
// the page's claims are the same staleness class as the Directory's —
// vendor policy text that changes rarely, with the `verified` date as the
// checkable part — and a shared key cannot drift from a dedicated one. A
// dedicated window, with a number nobody has argued for, is filed and
// argued by the track that owns policy.yml if one is wanted; adding the
// key is not in build scope (CHARTER.md rule 11).
//
// The retirement-calendar rows read staleness_days.retirement_calendar, a
// key the meta track owns. Until it exists this report enforces an interim
// window and says loudly, every run, that it is doing so — a missing key
// must not be able to make this report pass forever. A key that exists but
// is not an integer is a real error and fails the build. See
// docket/open/2026-08-14-retirement-calendar-staleness-window.md.
//
// A retirement-commitment row whose vendor page was unreachable carries
// `verified: null`. A null row is never treated as fresh:
//   - no `verified` and no `unverifiedSince` record   -> FAIL, naming the
//     row and the remedy: re-verify the vendor's page and set a `verified`
//     date, or record why the row stays unverified by adding a dated
//     `unverifiedSince` and renewing it within the window
//   - `unverifiedSince` not a real date               -> FAIL
//   - `unverifiedSince` past the window               -> FAIL: the record
//     that the row stays unverified has itself gone stale
//   - `unverifiedSince` within the window             -> loud WARN on every
//     run, naming the row, when its record expires, and the remedy
// A recorded null can therefore keep the build green for at most the
// window, never forever.
//
// All the data files are ESM in a CommonJS project, so instead of importing
// them this script reads the files and matches blocks. The regexes fail
// loudly if a file stops matching them, because a parser that silently
// finds nothing is how a guardrail goes green forever.
//
// Output channels: with --json the machine-readable report is the only
// thing on stdout (in both the pass and the fail state), and every
// human-readable line goes to stderr, so the preflight can read one
// without parsing the other. Without --json the report is human-readable
// on stdout. Exit code 0 when nothing is past its window, 1 otherwise and
// whenever the report cannot be produced at all.

import fs from "fs";
import path from "path";
import { load as parseYaml } from "js-yaml";

const root = process.cwd();
const DAY = 24 * 60 * 60 * 1000;
const json = process.argv.includes("--json");

const policy = parseYaml(fs.readFileSync(path.join(root, "policy.yml"), "utf8"));
const now = Date.now();

// The window for one class, read from policy.yml. `interim` is the
// retirement-calendar stand-in: while its policy key is absent the report
// enforces the interim window and warns loudly every run, because a missing
// key must not be able to make the report pass forever.
function windowFor(key, interim = null) {
  const days = policy.staleness_days?.[key];
  if (days === undefined || days === null) {
    if (interim) {
      console.error(
        `WARN  policy.yml has no staleness_days.${key} to enforce — using the interim ` +
          `${interim}-day window, which this report CAN fail on`
      );
      console.error(
        "      the key is owned by the meta track; adding it is filed as " +
          "docket/open/2026-08-14-retirement-calendar-staleness-window.md"
      );
      return interim;
    }
    console.error(`FAIL  policy.yml has no staleness_days.${key} to enforce`);
    process.exit(1);
  }
  if (!Number.isInteger(days)) {
    console.error(`FAIL  policy.yml staleness_days.${key} is not an integer to enforce`);
    process.exit(1);
  }
  return days;
}

// One match per artefact block: `{ marker: ..., ..., verified: "YYYY-MM-DD" }`.
// Multi-line objects (the Directory, commitments, posts, demos) are matched
// greedily to the first closing `},` on its own line, so a description
// string can never end a block early. The retirement-calendar rows are one
// object per line, so their pattern stops at the first `},` anywhere.
function blocksOf(file, marker, label, singleLine = false) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const pattern = singleLine
    ? new RegExp(`\\{\\s*${marker}[\\s\\S]*?\\},`, "g")
    : new RegExp(`\\{\\s*${marker}[\\s\\S]*?\\n\\s*\\},`, "g");
  const blocks = [...source.matchAll(pattern)].map((m) => m[0]);
  if (blocks.length === 0) {
    console.error(`FAIL  no ${label} matched in ${file}`);
    console.error("      the parser regex no longer matches the file — fix it, don't ignore it");
    process.exit(1);
  }
  return blocks;
}

function field(block, name) {
  const match = block.match(new RegExp(`${name}:\\s*"([^"]*)"`));
  return match ? match[1] : null;
}

function realDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

// Every class of published artefact, in report order. `windowDays` is
// resolved once per class up front, so an interim-window warning prints
// once rather than once per row.
const CLASSES = [
  {
    name: "Directory",
    file: "app/lib/tool-categories.js",
    marker: "href:",
    label: "tool entries",
    windowDays: windowFor("directory_entry"),
    display: (block) => field(block, "name") || field(block, "href"),
    // Every Directory entry must carry a verified date.
    nullPolicy: "required",
  },
  {
    name: "retirement commitments",
    file: "app/lib/retirement-commitments.js",
    marker: "vendor:",
    label: "retirement-commitment rows",
    windowDays: windowFor("directory_entry"),
    display: (block) => field(block, "vendor") || field(block, "href"),
    // A row whose vendor page was unreachable may record `verified: null`
    // with a dated `unverifiedSince`; that record expires like a date.
    nullPolicy: "recorded",
  },
  {
    name: "retirement-calendar rows",
    file: "app/lib/retirement-dates.js",
    marker: "vendor:",
    label: "retirement-calendar rows",
    windowDays: windowFor("retirement_calendar", 30),
    display: (block) => field(block, "what") || field(block, "vendor"),
    nullPolicy: "required",
    singleLine: true,
  },
  {
    name: "blog posts",
    file: "app/lib/posts.js",
    marker: "path:",
    label: "blog posts",
    windowDays: windowFor("blog_post"),
    display: (block) => field(block, "path"),
    nullPolicy: "required",
  },
  {
    name: "demos",
    file: "app/lib/demos.js",
    marker: "slug:",
    label: "demos",
    windowDays: windowFor("demo"),
    display: (block) => field(block, "slug"),
    nullPolicy: "required",
  },
];

// Judge one row. Returns { status: "ok"|"warn"|"fail", name, verified,
// windowDays, ageDays, problem }. `recordedNullAllowed` is the
// retirement-commitments policy: a `verified: null` row passes for at most
// the window, and only with a dated `unverifiedSince` record; otherwise it
// fails now, naming the remedy.
function judgeBlock(block, klass) {
  const name = klass.display(block) || "(unnamed)";
  const verified = field(block, "verified");
  if (!verified) {
    if (klass.nullPolicy !== "recorded") {
      return {
        status: "fail",
        name,
        verified: null,
        windowDays: klass.windowDays,
        ageDays: null,
        problem: "no verified date — every artefact must carry one",
      };
    }
    const since = field(block, "unverifiedSince");
    if (!since) {
      return {
        status: "fail",
        name,
        verified: null,
        windowDays: klass.windowDays,
        ageDays: null,
        problem:
          "verified: null with no unverifiedSince record — " +
          "re-verify the vendor's page and set a verified date, or record why " +
          'it stays unverified by adding unverifiedSince: "YYYY-MM-DD" and ' +
          "renewing it within the window",
      };
    }
    if (!realDate(since)) {
      return {
        status: "fail",
        name,
        verified: null,
        windowDays: klass.windowDays,
        ageDays: null,
        problem: `unverifiedSince "${since}" is not a real date`,
      };
    }
    const ageDays = Math.floor((now - Date.parse(since)) / DAY);
    if (ageDays > klass.windowDays) {
      return {
        status: "fail",
        name,
        verified: null,
        windowDays: klass.windowDays,
        ageDays,
        problem:
          `verified: null — the record that it stays unverified ` +
          `(unverifiedSince ${since}) is ${ageDays} days old, past the ` +
          `${klass.windowDays}-day window; re-verify the vendor's page and set a ` +
          "verified date, or renew the record",
      };
    }
    return {
      status: "warn",
      name,
      verified: null,
      windowDays: klass.windowDays,
      ageDays,
      problem:
        `unverified — last re-checked ${since} (unverifiedSince); ` +
        `this report will fail once that record is past the ${klass.windowDays}-day ` +
        "window unless the vendor's page is re-verified or the record is renewed",
    };
  }
  if (!realDate(verified)) {
    return {
      status: "fail",
      name,
      verified,
      windowDays: klass.windowDays,
      ageDays: null,
      problem: `verified "${verified}" is not a real date`,
    };
  }
  const ageDays = Math.floor((now - Date.parse(verified)) / DAY);
  if (ageDays > klass.windowDays) {
    return {
      status: "fail",
      name,
      verified,
      windowDays: klass.windowDays,
      ageDays,
      problem: `verified ${verified} — ${ageDays} days ago, past the ${klass.windowDays}-day window`,
    };
  }
  return { status: "ok", name, verified, windowDays: klass.windowDays, ageDays, problem: null };
}

const rows = [];
for (const klass of CLASSES) {
  const blocks = blocksOf(klass.file, klass.marker, klass.label, klass.singleLine);
  for (const block of blocks) {
    rows.push({ klass: klass.name, ...judgeBlock(block, klass) });
  }
}

const stale = rows.filter((r) => r.status === "fail");
const warnings = rows.filter((r) => r.status === "warn");

if (json) {
  // Pure JSON on stdout in both states; the preflight parses it from the
  // exit-1 failure too. Everything human went to stderr already.
  process.stdout.write(
    JSON.stringify(
      {
        ok: stale.length === 0,
        artefacts: rows.length,
        stale: stale.map((r) => ({
          class: r.klass,
          name: r.name,
          verified: r.verified,
          windowDays: r.windowDays,
          ageDays: r.ageDays,
        })),
      },
      null,
      2
    )
  );
} else {
  let current = null;
  for (const row of rows) {
    if (row.klass !== current) {
      current = row.klass;
      console.log(`${current} (window ${row.windowDays} days)`);
    }
    if (row.status === "ok") {
      console.log(`  ok    ${row.name}  verified ${row.verified} (${row.ageDays} days ago)`);
    } else if (row.status === "warn") {
      console.log(`  WARN  ${row.name}  ${row.problem}`);
    } else {
      console.log(`  FAIL  ${row.name}  ${row.problem}`);
    }
  }
  console.log(
    `\n${rows.length} published artefacts judged: ${rows.length - stale.length - warnings.length} within window, ` +
      `${warnings.length} recorded-unverified within window, ${stale.length} stale or missing a date`
  );
  if (stale.length > 0) {
    console.log("      re-verify the source's page and update its verified date");
    process.exit(1);
  }
}
