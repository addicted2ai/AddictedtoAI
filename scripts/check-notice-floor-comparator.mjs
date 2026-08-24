#!/usr/bin/env node
// Health check for the notice-floor comparator behind /promise-vs-practice
// (docket/done/2026-08-22-vendor-notice-period-vs-practice.md, requirement
// 4: "A health check that fails if either data file's shape changes in a
// way that would silently break the comparison (a renamed field, a vendor
// row removed). ... Prove it can fail before you trust it."). Run from the
// repository root:
//
//   node scripts/check-notice-floor-comparator.mjs
//
// Four things this script asserts, in order:
//   A. RETIREMENT_COMMITMENTS shape — every entry has an own `minNoticeDays`
//      property (not merely `undefined` from a renamed field) whose value is
//      `null` or a finite positive number.
//   B. RETIREMENT_DATES shape — every entry still has non-empty vendor/
//      what/shutdown fields in the expected form.
//   C. Vendor coverage — every vendor RETIREMENT_DATES mentions (over the
//      FULL array, not just live rows, since a past row's vendor still
//      needs a matching commitments entry for the data to be internally
//      consistent) has a matching RETIREMENT_COMMITMENTS entry. This is the
//      actual enforcement behind "a vendor row removed" — app/lib/notice-floor-check.js's
//      own fallback for an unmatched vendor is deliberately silent (see its
//      header), so this is the check that makes a removal loud instead.
//   D. The comparator itself — run against synthetic fixtures (known
//      held/inside-window/no-floor/boundary/past-row cases) and against the
//      real, live data, asserting the output shape never drifts.
//
// Proved able to fail before being trusted (search "PROVING THE CHECK CAN
// FAIL" below): sections A and C are re-run against CLONED, deliberately
// mutated copies of the real data — a deleted `minNoticeDays` key, a
// corrupted value, a removed vendor entry, a deleted `shutdown` field — and
// each mutation is asserted to produce exactly the problem it should, never
// silently passing. This mirrors scripts/check-model-migration-chains.mjs's
// own proof pattern: mutate a clone, never the checked-in file, and assert
// the checker's response to the plant.

import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const { RETIREMENT_COMMITMENTS } = await import(
  pathToFileURL(path.join(root, "app", "lib", "retirement-commitments.js")).href
);
const { RETIREMENT_DATES } = await import(
  pathToFileURL(path.join(root, "app", "lib", "retirement-dates.js")).href
);
const { computeLiveNoticeFloorRows, summarizeCoverage, STATUS } = await import(
  pathToFileURL(path.join(root, "app", "lib", "notice-floor-check.js")).href
);

let failures = 0;
let checks = 0;
const ok = (m) => {
  checks++;
  console.log(`ok    ${m}`);
};
const bad = (m) => {
  checks++;
  failures++;
  console.log(`FAIL  ${m}`);
};

// --- A/B/C: shape + coverage assertion logic, reusable against real data
// and against mutated fixtures alike (the whole point of "prove it can
// fail" is running the SAME logic both ways) -------------------------------

// Returns an array of problem strings; empty means the shape is sound.
function checkCommitmentsShape(commitments) {
  const problems = [];
  const seenVendors = new Set();
  for (const entry of commitments) {
    const vendor = entry && entry.vendor;
    const label = typeof vendor === "string" && vendor ? vendor : "<unnamed entry>";
    if (typeof vendor !== "string" || !vendor.trim()) {
      problems.push(`entry has no usable "vendor" field: ${JSON.stringify(entry)}`);
      continue;
    }
    if (seenVendors.has(vendor)) {
      problems.push(`vendor "${vendor}" appears more than once in RETIREMENT_COMMITMENTS`);
    }
    seenVendors.add(vendor);
    if (!Object.prototype.hasOwnProperty.call(entry, "minNoticeDays")) {
      problems.push(`"${label}" has no "minNoticeDays" property at all (renamed or dropped field)`);
      continue;
    }
    const value = entry.minNoticeDays;
    const validNull = value === null;
    const validNumber = typeof value === "number" && Number.isFinite(value) && value > 0;
    if (!validNull && !validNumber) {
      problems.push(
        `"${label}".minNoticeDays is ${JSON.stringify(value)} — must be null or a finite positive number`
      );
    }
  }
  return problems;
}

function checkDatesShape(dates) {
  const problems = [];
  for (const row of dates) {
    const label = row && typeof row.what === "string" ? row.what : JSON.stringify(row);
    if (typeof row?.vendor !== "string" || !row.vendor.trim()) {
      problems.push(`row "${label}" has no usable "vendor" field`);
    }
    if (typeof row?.what !== "string" || !row.what.trim()) {
      problems.push(`row for vendor "${row?.vendor}" has no usable "what" field`);
    }
    if (typeof row?.shutdown !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(row.shutdown)) {
      problems.push(`row "${label}" has no usable YYYY-MM-DD "shutdown" field`);
    }
  }
  return problems;
}

// The actual "vendor row removed" enforcement: every vendor RETIREMENT_DATES
// mentions, over the FULL array (not filtered to live rows — a past row's
// vendor still has to resolve for the data to be internally consistent, and
// gating this on today's live set would make the check's power depend on
// which rows happen to be live when it runs), must have a matching entry in
// RETIREMENT_COMMITMENTS.
function checkVendorCoverage(dates, commitments) {
  const known = new Set(commitments.map((c) => c.vendor));
  const problems = [];
  const missing = new Set();
  for (const row of dates) {
    if (row?.vendor && !known.has(row.vendor) && !missing.has(row.vendor)) {
      missing.add(row.vendor);
      problems.push(
        `vendor "${row.vendor}" appears in RETIREMENT_DATES but has no matching RETIREMENT_COMMITMENTS entry`
      );
    }
  }
  return problems;
}

// --- A/B/C run against the REAL, checked-in data --------------------------

const realCommitmentsProblems = checkCommitmentsShape(RETIREMENT_COMMITMENTS);
if (realCommitmentsProblems.length === 0) {
  ok(`RETIREMENT_COMMITMENTS: all ${RETIREMENT_COMMITMENTS.length} vendor(s) carry a valid minNoticeDays (null or a positive number)`);
} else {
  for (const p of realCommitmentsProblems) bad(`RETIREMENT_COMMITMENTS shape: ${p}`);
}

const realDatesProblems = checkDatesShape(RETIREMENT_DATES);
if (realDatesProblems.length === 0) {
  ok(`RETIREMENT_DATES: all ${RETIREMENT_DATES.length} row(s) carry usable vendor/what/shutdown fields`);
} else {
  for (const p of realDatesProblems) bad(`RETIREMENT_DATES shape: ${p}`);
}

const realCoverageProblems = checkVendorCoverage(RETIREMENT_DATES, RETIREMENT_COMMITMENTS);
if (realCoverageProblems.length === 0) {
  const vendorsInDates = new Set(RETIREMENT_DATES.map((r) => r.vendor)).size;
  ok(`vendor coverage: all ${vendorsInDates} vendor(s) referenced in RETIREMENT_DATES have a matching RETIREMENT_COMMITMENTS entry`);
} else {
  for (const p of realCoverageProblems) bad(`vendor coverage: ${p}`);
}

// --- D: the comparator itself, against synthetic fixtures -----------------
//
// Deterministic, known-answer cases the real live data cannot guarantee on
// any given day (today's real data currently has zero live rows for the one
// vendor with a non-null floor — see this round's CHANGELOG entry — so
// these fixtures are what actually exercises HELD and INSIDE_WINDOW).

const FIXTURE_TODAY = "2026-08-24";
const fixtureCommitments = [
  { vendor: "Fixture Vendor A", minNoticeDays: 60 },
  { vendor: "Fixture Vendor B", minNoticeDays: null },
];
const fixtureDates = [
  // 90 days out, 60-day floor -> held, comfortably.
  { vendor: "Fixture Vendor A", what: "held-case", shutdown: "2026-11-22", replacement: null, href: "https://example.invalid", verified: FIXTURE_TODAY },
  // exactly 60 days out, 60-day floor -> held (">= is inclusive").
  { vendor: "Fixture Vendor A", what: "boundary-held-case", shutdown: "2026-10-23", replacement: null, href: "https://example.invalid", verified: FIXTURE_TODAY },
  // 59 days out, 60-day floor -> inside-window (one day short).
  { vendor: "Fixture Vendor A", what: "boundary-violation-case", shutdown: "2026-10-22", replacement: null, href: "https://example.invalid", verified: FIXTURE_TODAY },
  // 5 days out, 60-day floor -> clearly inside-window.
  { vendor: "Fixture Vendor A", what: "violation-case", shutdown: "2026-08-29", replacement: null, href: "https://example.invalid", verified: FIXTURE_TODAY },
  // null floor, 0 days out (the most "violating"-looking case possible) ->
  // must still report no-comparable-floor, never held or inside-window.
  { vendor: "Fixture Vendor B", what: "no-floor-case", shutdown: FIXTURE_TODAY, replacement: null, href: "https://example.invalid", verified: FIXTURE_TODAY },
  // already past -> excluded entirely, even though it would "violate" if it
  // were compared (proves the live-only filter, not just the status logic).
  { vendor: "Fixture Vendor A", what: "past-case", shutdown: "2026-01-01", replacement: null, href: "https://example.invalid", verified: FIXTURE_TODAY },
];

const fixtureRows = computeLiveNoticeFloorRows(fixtureDates, fixtureCommitments, FIXTURE_TODAY);
const byWhat = new Map(fixtureRows.map((r) => [r.what, r]));

function assertStatus(what, expectedStatus, expectedRemaining) {
  const row = byWhat.get(what);
  if (!row) {
    bad(`fixture "${what}" is missing from computeLiveNoticeFloorRows output entirely`);
    return;
  }
  if (row.status !== expectedStatus) {
    bad(`fixture "${what}" expected status "${expectedStatus}", got "${row.status}"`);
    return;
  }
  if (expectedRemaining !== undefined && row.remainingDays !== expectedRemaining) {
    bad(`fixture "${what}" expected remainingDays ${expectedRemaining}, got ${row.remainingDays}`);
    return;
  }
  ok(`fixture "${what}" -> ${row.status}${expectedRemaining !== undefined ? ` (${row.remainingDays} days remaining)` : ""}`);
}

assertStatus("held-case", STATUS.HELD, 90);
assertStatus("boundary-held-case", STATUS.HELD, 60);
assertStatus("boundary-violation-case", STATUS.INSIDE_WINDOW, 59);
assertStatus("violation-case", STATUS.INSIDE_WINDOW, 5);
assertStatus("no-floor-case", STATUS.NO_FLOOR, 0);

if (byWhat.has("past-case")) {
  bad('fixture "past-case" (shutdown before today) should be excluded entirely and was not');
} else {
  ok('fixture "past-case" (shutdown before today) is correctly excluded — only LIVE rows are compared');
}

// --- D continued: the comparator against the REAL, live data --------------

const realTodayIso = new Date().toISOString().slice(0, 10);
let realRows;
try {
  realRows = computeLiveNoticeFloorRows(RETIREMENT_DATES, RETIREMENT_COMMITMENTS, realTodayIso);
  ok(`computeLiveNoticeFloorRows ran against the real data without throwing (today ${realTodayIso})`);
} catch (error) {
  bad(`computeLiveNoticeFloorRows threw against the real data: ${error.message}`);
  realRows = [];
}

const validStatuses = new Set(Object.values(STATUS));
let shapeOk = true;
for (const row of realRows) {
  if (!validStatuses.has(row.status)) {
    shapeOk = false;
    bad(`real row "${row.vendor}: ${row.what}" has an unrecognized status "${row.status}"`);
  }
  if (!Number.isInteger(row.remainingDays) || row.remainingDays < 0) {
    shapeOk = false;
    bad(`real row "${row.vendor}: ${row.what}" has a non-sensical remainingDays ${row.remainingDays}`);
  }
  if (row.status === STATUS.NO_FLOOR && row.minNoticeDays !== null) {
    shapeOk = false;
    bad(`real row "${row.vendor}: ${row.what}" is no-comparable-floor but carries a non-null minNoticeDays ${row.minNoticeDays}`);
  }
  if (row.status !== STATUS.NO_FLOOR && typeof row.minNoticeDays !== "number") {
    shapeOk = false;
    bad(`real row "${row.vendor}: ${row.what}" has status "${row.status}" but no numeric minNoticeDays`);
  }
}
if (shapeOk) {
  const held = realRows.filter((r) => r.status === STATUS.HELD).length;
  const violating = realRows.filter((r) => r.status === STATUS.INSIDE_WINDOW).length;
  const noFloor = realRows.filter((r) => r.status === STATUS.NO_FLOOR).length;
  ok(`real data: ${realRows.length} live row(s) — ${held} held, ${violating} inside the notice window, ${noFloor} with no comparable floor`);
}

const coverage = summarizeCoverage(RETIREMENT_DATES, RETIREMENT_COMMITMENTS, realTodayIso);
if (coverage.length === RETIREMENT_COMMITMENTS.length) {
  ok(`summarizeCoverage returns exactly ${coverage.length} vendor(s), matching RETIREMENT_COMMITMENTS`);
} else {
  bad(`summarizeCoverage returned ${coverage.length} vendor(s), RETIREMENT_COMMITMENTS has ${RETIREMENT_COMMITMENTS.length}`);
}

// --- PROVING THE CHECK CAN FAIL --------------------------------------------
//
// Every mutation below is applied to a CLONE, never to the imported arrays
// themselves, and reverted nowhere because nothing was ever written to disk.
// requirement 4 names two shapes by name: "a renamed field, a vendor row
// removed". Both are here, plus a RETIREMENT_DATES-side field removal for
// the same discipline check-model-migration-chains.mjs applies to its own
// data file.

function cloneCommitments() {
  return RETIREMENT_COMMITMENTS.map((c) => ({ ...c }));
}
function cloneDates() {
  return RETIREMENT_DATES.map((r) => ({ ...r }));
}

// Plant 1: a renamed field. Delete minNoticeDays from one entry entirely —
// the exact shape a find-and-replace typo would produce.
{
  const mutated = cloneCommitments();
  const targetIndex = mutated.findIndex((c) => c.vendor === "Anthropic");
  delete mutated[targetIndex].minNoticeDays;
  const problems = checkCommitmentsShape(mutated);
  const flagged = problems.some((p) => p.includes("Anthropic") && p.includes("no \"minNoticeDays\" property"));
  if (flagged) {
    ok('planted a renamed/deleted "minNoticeDays" field on Anthropic\'s entry, and the shape check correctly flagged it — the check CAN fail');
  } else {
    bad(`planted a deleted minNoticeDays field and the shape check did NOT flag it: ${JSON.stringify(problems)}`);
  }
}

// Plant 2: a corrupted value (string instead of number) — the shape a bad
// merge or a copy-paste of the wrong field could produce without deleting
// the key at all.
{
  const mutated = cloneCommitments();
  const targetIndex = mutated.findIndex((c) => c.vendor === "Anthropic");
  mutated[targetIndex].minNoticeDays = "60 days";
  const problems = checkCommitmentsShape(mutated);
  const flagged = problems.some((p) => p.includes("Anthropic") && p.includes("must be null or a finite positive number"));
  if (flagged) {
    ok('planted a corrupted (string) "minNoticeDays" value on Anthropic\'s entry, and the shape check correctly flagged it');
  } else {
    bad(`planted a corrupted minNoticeDays value and the shape check did NOT flag it: ${JSON.stringify(problems)}`);
  }
}

// Plant 3: "a vendor row removed" — Anthropic's whole RETIREMENT_COMMITMENTS
// entry deleted, while RETIREMENT_DATES (the real, unmutated array) still
// references "Anthropic". This is the exact silent-break shape requirement
// 4 names: without this check, notice-floor-check.js's graceful fallback
// would just report every Anthropic row as "no-comparable-floor" and nobody
// would notice the vendor had vanished from the promises data entirely.
{
  const mutated = cloneCommitments().filter((c) => c.vendor !== "Anthropic");
  const problems = checkVendorCoverage(RETIREMENT_DATES, mutated);
  const flagged = problems.some((p) => p.includes('"Anthropic"'));
  if (flagged) {
    ok('planted a removed Anthropic entry (vendor row removed) while RETIREMENT_DATES still references it, and vendor coverage correctly flagged it');
  } else {
    bad(`planted a removed Anthropic entry and vendor coverage did NOT flag it: ${JSON.stringify(problems)}`);
  }
}

// Plant 4: a renamed field on the RETIREMENT_DATES side — delete `shutdown`
// from one row.
{
  const mutated = cloneDates();
  delete mutated[0].shutdown;
  const problems = checkDatesShape(mutated);
  const flagged = problems.some((p) => p.includes('"shutdown"'));
  if (flagged) {
    ok('planted a deleted "shutdown" field on a RETIREMENT_DATES row, and the shape check correctly flagged it');
  } else {
    bad(`planted a deleted shutdown field and the shape check did NOT flag it: ${JSON.stringify(problems)}`);
  }
}

// Plant 5: the inverse case, proving the checks above are not vacuously
// true because everything reports a problem regardless of input — an
// UNMUTATED clone must report zero problems on every axis.
{
  const problems = [
    ...checkCommitmentsShape(cloneCommitments()),
    ...checkDatesShape(cloneDates()),
    ...checkVendorCoverage(cloneDates(), cloneCommitments()),
  ];
  if (problems.length === 0) {
    ok("an unmutated clone of the real data reports zero problems on every axis — the checks above are not vacuously true");
  } else {
    bad(`an unmutated clone reported ${problems.length} problem(s) that should not exist: ${JSON.stringify(problems)}`);
  }
}

console.log();
if (failures > 0) {
  console.log(`${failures} of ${checks} check(s) failed`);
  process.exit(1);
}
console.log(
  `all ${checks} checks passed -- RETIREMENT_COMMITMENTS' minNoticeDays field and RETIREMENT_DATES' shape are ` +
    "both sound, every vendor RETIREMENT_DATES references resolves in RETIREMENT_COMMITMENTS, the comparator " +
    "produces the correct held/inside-window/no-comparable-floor verdict on six synthetic fixtures (including " +
    "an inclusive boundary and a past-row exclusion) and runs cleanly against the real live data, and the shape " +
    "and coverage checks were each proved able to fail on five planted defects, including the two requirement 4 " +
    "names by name: a renamed field and a removed vendor row"
);
