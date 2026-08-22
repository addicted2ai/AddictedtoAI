#!/usr/bin/env node
// Turn a timestamp into a peak/off-peak verdict for opencode-go/deepseek-v4-flash,
// reading the windows and rates from the single source of truth in policy.yml
// (deepseek_peak_pricing). This is the only code that decides peak/off-peak --
// scripts/orchestrate-peak.sh calls it before every iteration start, and
// scripts/test-peak-window.mjs calls it directly with fixed timestamps so the
// boundary behaviour can be demonstrated without waiting for real UTC clock time.
//
//   node scripts/peak-window.mjs                        # verdict for now
//   node scripts/peak-window.mjs 2026-08-22T01:00:00Z    # verdict for a given instant
//
// Run from the repository root (reads ./policy.yml).
//
// Prints exactly one line to stdout and exits 0 on success:
//
//   PEAK now=<iso> window=01:00-04:00 windowStart=<iso> resumesAt=<iso>
//   OFFPEAK now=<iso>
//
// On a bad timestamp or an unparseable/missing policy, prints one line
// starting "ERROR " to stdout and exits 1. This script does not decide what a
// caller should do about an error -- that is a policy question (see the
// fail-closed note in scripts/orchestrate-peak.sh) -- it only ever reports
// what it found, cleanly parseable either way.

import fs from "fs";
import path from "path";
import { load as parseYaml } from "js-yaml";

function fail(message) {
  console.log(`ERROR ${message}`);
  process.exit(1);
}

const root = process.cwd();
let policy;
try {
  policy = parseYaml(fs.readFileSync(path.join(root, "policy.yml"), "utf8"));
} catch (error) {
  fail(`could not read or parse policy.yml: ${error.message}`);
}

const config = policy && policy.deepseek_peak_pricing;
const windows = config && Array.isArray(config.windows) ? config.windows : null;
if (!windows || windows.length === 0) {
  fail("policy.yml has no deepseek_peak_pricing.windows to read");
}

function parseHHMM(value, label) {
  const match = typeof value === "string" && value.match(/^(\d{2}):(\d{2})$/);
  if (!match) fail(`policy.yml window ${label}="${value}" is not HH:MM`);
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) fail(`policy.yml window ${label}="${value}" is out of range`);
  return h * 60 + m;
}

const parsedWindows = windows.map((w, i) => ({
  startMin: parseHHMM(w.start, `[${i}].start`),
  endMin: parseHHMM(w.end, `[${i}].end`),
  label: `${w.start}-${w.end}`,
}));

const rawNow = process.argv[2];
let now;
if (!rawNow) {
  now = new Date();
} else if (/^\d+$/.test(rawNow)) {
  // Bare integer: epoch seconds, matching the convention this repository's
  // other test-driven scripts use (e.g. CHECKOUT_FLOOR in orchestrate.sh).
  now = new Date(Number(rawNow) * 1000);
} else {
  now = new Date(rawNow);
}
if (Number.isNaN(now.getTime())) {
  fail(`"${rawNow}" is not a valid timestamp (want ISO-8601 or epoch seconds)`);
}

const nowMin = now.getUTCHours() * 60 + now.getUTCMinutes() + now.getUTCSeconds() / 60;

// Half-open [start, end): the boundary minute itself is off-peak. Both
// configured windows are same-day (neither crosses midnight UTC), so the
// window's start/end land on the same UTC calendar date as `now`.
const atUTC = (minutes) =>
  new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      Math.floor(minutes / 60),
      minutes % 60,
      0
    )
  ).toISOString();

const hit = parsedWindows.find((w) => nowMin >= w.startMin && nowMin < w.endMin);

if (hit) {
  console.log(
    `PEAK now=${now.toISOString()} window=${hit.label} windowStart=${atUTC(hit.startMin)} resumesAt=${atUTC(hit.endMin)}`
  );
} else {
  console.log(`OFFPEAK now=${now.toISOString()}`);
}
