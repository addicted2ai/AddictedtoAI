#!/usr/bin/env node
// scripts/peak-window.mjs and the peak_guard() decision it feeds in
// scripts/orchestrate-peak.sh, exercised at the boundaries the item names:
// 00:59, 01:00, 03:59, 04:00, 05:59, 06:00, 09:59, 10:00 UTC. Both windows
// are half-open [start, end) -- the boundary minute itself is off-peak --
// and an off-by-one there is exactly the bug this guard is most likely to
// ship with, so the boundaries are what get asserted, not the interiors.
//
// The second half drives the real shell function scripts/orchestrate.sh
// calls, peak_guard(), the same way scripts/test-orchestrate-checkout.mjs
// drives wait_for_checkout_free(): source the real file, stub note(), read
// its return code and its log lines back. This is what produces the
// acceptance-bar evidence -- a skipped iteration at a peak boundary and an
// authorised one inside the same window -- as real supervisor-log-shaped
// output rather than a description of what the code should do.
//
//   node scripts/test-peak-window.mjs

import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

let failures = 0;
const ok = (m) => console.log(`ok    ${m}`);
const bad = (m) => {
  console.log(`FAIL  ${m}`);
  failures++;
};

// --- 1. peak-window.mjs at every configured boundary -------------------------

const DATE = "2026-08-22";
const boundaries = [
  ["00:59", "OFFPEAK"],
  ["01:00", "PEAK"],
  ["03:59", "PEAK"],
  ["04:00", "OFFPEAK"],
  ["05:59", "OFFPEAK"],
  ["06:00", "PEAK"],
  ["09:59", "PEAK"],
  ["10:00", "OFFPEAK"],
];

console.log("--- peak-window.mjs boundaries ---");
for (const [hhmm, want] of boundaries) {
  const iso = `${DATE}T${hhmm}:00Z`;
  const r = spawnSync("node", ["scripts/peak-window.mjs", iso], { encoding: "utf8" });
  const line = (r.stdout || "").trim();
  // A PEAK line must also carry this repository's real rate figures, read
  // from policy.yml rather than a literal in peak-window.mjs -- the
  // rate-passthrough test below proves the "read, not hardcoded" half with a
  // scratch policy.yml; this just confirms the real one renders correctly.
  const wantsRate = want === "PEAK";
  const hasRate = /peakRate=0\.44\/1\.32 offPeakRate=0\.22\/0\.66/.test(line);
  if (r.status === 0 && line.startsWith(want + " ") && (!wantsRate || hasRate)) {
    ok(`${iso} -> ${line}`);
  } else {
    bad(`${iso} -> expected ${want}${wantsRate ? " with rate figures from policy.yml" : ""}, got "${line}" (exit ${r.status}, stderr: ${r.stderr.trim()})`);
  }
}

// A bad timestamp must not crash silently or be misread as a verdict.
const badTs = spawnSync("node", ["scripts/peak-window.mjs", "not-a-timestamp"], { encoding: "utf8" });
const badLine = (badTs.stdout || "").trim();
if (badTs.status !== 0 && badLine.startsWith("ERROR ")) {
  ok(`an unparseable timestamp reports an error rather than a verdict: "${badLine}"`);
} else {
  bad(`an unparseable timestamp did not fail cleanly (exit ${badTs.status}): "${badLine}"`);
}

// --- scratch policy.yml helpers ----------------------------------------------
//
// Never touch the real repository policy.yml: write a scratch copy into a
// temp directory and run peak-window.mjs with that directory as its cwd,
// since it resolves policy.yml from process.cwd(). This is what lets the
// next two sections prove things the real policy.yml can't -- that the rate
// figures are actually read, not hardcoded, and that a backwards window is
// rejected rather than silently read as OFFPEAK forever.

const SCRIPT_ABS = path.resolve("scripts/peak-window.mjs");

function runWithScratchPolicy(yamlText, args) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "peak-window-test-"));
  try {
    fs.writeFileSync(path.join(dir, "policy.yml"), yamlText);
    return spawnSync("node", [SCRIPT_ABS, ...args], { encoding: "utf8", cwd: dir });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// --- rates are read from policy.yml, not hardcoded ---------------------------
//
// scripts/orchestrate-peak.sh used to log a literal "$0.44/$1.32" -- a second
// copy of the rate card, in the one file the item requires have exactly one.
// The fix makes peak-window.mjs carry the rate on the PEAK line, read from
// policy.yml, and orchestrate-peak.sh only ever quotes that. Proof it is
// actually *read* rather than still hardcoded somewhere: point the script at
// a scratch policy.yml with rate figures that appear nowhere in this
// repository's real config or code, and confirm they come back unchanged.

console.log("\n--- rates come from policy.yml, not a literal in the script ---");
const scratchRates = runWithScratchPolicy(
  `deepseek_peak_pricing:
  windows:
    - start: "01:00"
      end: "04:00"
  rate_per_1m_usd:
    off_peak: { input: 9.99, output: 8.88 }
    peak: { input: 7.77, output: 6.66 }
`,
  ["2026-08-22T01:30:00Z"]
);
const scratchLine = (scratchRates.stdout || "").trim();
if (
  scratchRates.status === 0 &&
  scratchLine.startsWith("PEAK ") &&
  /peakRate=7\.77\/6\.66 offPeakRate=9\.99\/8\.88/.test(scratchLine)
) {
  ok(`a scratch policy.yml's made-up rates round-trip unchanged: ${scratchLine}`);
} else {
  bad(`rates did not round-trip from a scratch policy.yml: "${scratchLine}" (exit ${scratchRates.status})`);
}

// --- a backwards or empty window fails closed, not OFFPEAK forever -----------
//
// window.find(w => now >= start && now < end) is never true when start is
// not before end -- read naively, a swapped-fields typo in policy.yml makes
// that window permanently unreachable, so the guard would report OFFPEAK and
// exit 0 forever: a fail-*open* hole in code whose entire design principle is
// failing closed. peak-window.mjs now validates start < end while parsing,
// before any timestamp comparison, so this is rejected regardless of what
// "now" is asked about.

console.log("\n--- a backwards or empty window is rejected, not silently OFFPEAK ---");
const badWindowCases = [
  { label: "start after end (swapped)", start: "04:00", end: "01:00" },
  { label: "start equals end (empty)", start: "01:00", end: "01:00" },
];
for (const { label, start, end } of badWindowCases) {
  const r = runWithScratchPolicy(
    `deepseek_peak_pricing:
  windows:
    - start: "${start}"
      end: "${end}"
  rate_per_1m_usd:
    off_peak: { input: 0.22, output: 0.66 }
    peak: { input: 0.44, output: 1.32 }
`,
    ["2026-08-22T02:00:00Z"]
  );
  const line = (r.stdout || "").trim();
  if (r.status !== 0 && line.startsWith("ERROR ") && !line.startsWith("OFFPEAK")) {
    ok(`${label}: rejected with an error, not read as OFFPEAK -- "${line}"`);
  } else {
    bad(`${label}: fail-open hole reopened -- exit ${r.status}, "${line}"`);
  }
}

// --- 2. peak_guard(): the real decision scripts/orchestrate.sh calls ---------

function runGuard(env) {
  const script = `
REPO="$(pwd)"
source scripts/orchestrate-peak.sh
note() { echo "note: $*"; }
peak_guard
echo "rc=$?"
`;
  const r = spawnSync("bash", ["-c", script], {
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
  return (r.stdout || "") + (r.stderr || "");
}

const rc = (out) => Number((out.match(/rc=(\d+)/) || [])[1]);

console.log("\n--- peak_guard(): skipped at a peak boundary, unauthorised ---");
const skipped = runGuard({ ORCHESTRATE_PEAK_NOW: "2026-08-22T01:00:00Z" });
console.log(skipped.trim());
if (
  rc(skipped) === 1 &&
  /PEAK WINDOW 01:00-04:00 UTC/.test(skipped) &&
  /no matching authorisation is set/.test(skipped) &&
  /resuming automatically at 2026-08-22T04:00:00\.000Z UTC/.test(skipped) &&
  /\$0\.44\/1\.32 per 1M vs \$0\.22\/0\.66 off-peak, from policy\.yml/.test(skipped)
) {
  ok("iteration skipped at the 01:00 boundary: window, reason, resume time and the policy.yml-sourced rates are all logged");
} else {
  bad(`expected a logged skip with window/reason/resume; got: ${skipped.trim()}`);
}

console.log("\n--- peak_guard(): authorised inside the same window ---");
const authorised = runGuard({
  ORCHESTRATE_PEAK_NOW: "2026-08-22T01:00:00Z",
  ORCHESTRATE_PEAK_AUTH: "2026-08-22T01:00:00.000Z",
  ORCHESTRATE_PEAK_REASON: "demonstration for docket/open/2026-08-17-deepseek-peak-hour-pricing.md",
});
console.log(authorised.trim());
if (
  rc(authorised) === 0 &&
  /authorised/.test(authorised) &&
  /demonstration for docket/.test(authorised) &&
  /\$0\.44\/1\.32 per 1M vs \$0\.22\/0\.66 off-peak, from policy\.yml/.test(authorised)
) {
  ok("iteration authorised inside the same 01:00 window: the reason and the policy.yml-sourced rates are logged and the guard proceeds");
} else {
  bad(`expected a logged, authorised proceed; got: ${authorised.trim()}`);
}

console.log("\n--- peak_guard(): a mismatched authorisation does not carry over ---");
// The authorisation is bound to this window's exact start. An authorisation
// left over from the *other* daily window (06:00) must not authorise 01:00 --
// this is what makes ORCHESTRATE_PEAK_AUTH self-expiring rather than a flag
// that, once set, silently covers every later window too.
const mismatched = runGuard({
  ORCHESTRATE_PEAK_NOW: "2026-08-22T01:00:00Z",
  ORCHESTRATE_PEAK_AUTH: "2026-08-22T06:00:00.000Z",
});
if (rc(mismatched) === 1 && /no matching authorisation is set/.test(mismatched)) {
  ok("an authorisation scoped to the 06:00 window does not authorise the 01:00 window");
} else {
  bad(`a mismatched authorisation was accepted: ${mismatched.trim()}`);
}

console.log("\n--- peak_guard(): off-peak proceeds quietly ---");
const offpeak = runGuard({ ORCHESTRATE_PEAK_NOW: "2026-08-22T04:00:00Z" });
if (rc(offpeak) === 0 && !/note:/.test(offpeak)) {
  ok("off-peak (04:00, the boundary minute) proceeds with no pause and no note");
} else {
  bad(`off-peak did not proceed quietly: ${offpeak.trim()}`);
}

console.log("\n--- peak_guard(): fails closed when the verdict cannot be read ---");
const errored = runGuard({ ORCHESTRATE_PEAK_NOW: "not-a-timestamp" });
if (rc(errored) === 1 && /treating this as an unauthorised peak window/.test(errored)) {
  ok("an unreadable verdict is treated as an unauthorised peak window, not as a silent proceed");
} else {
  bad(`an unreadable verdict did not fail closed: ${errored.trim()}`);
}

console.log();
console.log(failures === 0 ? "all peak-window checks passed" : `${failures} check(s) failed`);
process.exitCode = failures === 0 ? 0 : 1;
