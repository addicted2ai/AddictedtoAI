// Computes whether a live (not-yet-passed) RETIREMENT_DATES shutdown still
// has at least as much runway left as the vendor's own promised minimum
// notice floor — RETIREMENT_COMMITMENTS[].minNoticeDays
// (docket/done/2026-08-22-vendor-notice-period-vs-practice.md). Pure
// functions of their inputs (the two data arrays and a `todayIso` string):
// no Date.now() inside, no fetch, matching rule 16 the same way
// app/lib/retirement-ics.js's own header argues for the .ics feed. Both
// app/promise-vs-practice/page.js and
// scripts/check-notice-floor-comparator.mjs call this exact code against
// different inputs, so a bug here fails loud in the health check rather than
// only ever showing up as a wrong word on the page.
//
// THE CENTRAL RISK this file exists to avoid: a false claim that a named
// vendor is not honouring its own promise. Two disciplines follow from that,
// and scripts/check-notice-floor-comparator.mjs enforces both rather than
// trusting them by inspection:
//   1. A vendor whose minNoticeDays is null (or absent, or unmatched between
//      the two files) is NEVER compared — it always reports
//      "no-comparable-floor", never "held" or "inside-window". Nothing here
//      coerces null/undefined into 0 or Infinity to manufacture a verdict.
//   2. Only LIVE rows (shutdown on or after `todayIso`) are compared. A
//      shutdown that has already passed is kept visible on
//      /model-retirement-calendar for a different reason — so the page can
//      be checked against what it said — not so this file can make a
//      retroactive "was proper notice given" claim it was never asked to
//      make and cannot support (that would need the announcement date,
//      which this site does not have; see the docket item's own correction
//      of its first, unbuildable framing).

export const STATUS = Object.freeze({
  HELD: "held",
  INSIDE_WINDOW: "inside-window",
  NO_FLOOR: "no-comparable-floor",
});

function daysBetween(fromIso, toIso) {
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);
  return Math.round((to - from) / 86400000);
}

function floorFor(vendor, commitmentByVendor) {
  const commitment = commitmentByVendor.get(vendor);
  const raw = commitment ? commitment.minNoticeDays : null;
  return typeof raw === "number" && Number.isFinite(raw) ? raw : null;
}

// One row per LIVE RETIREMENT_DATES entry (shutdown >= todayIso), sorted
// earliest-first, each carrying `remainingDays` (shutdown minus today),
// `minNoticeDays` (the vendor's floor, or null), and `status`: "held" when
// remainingDays is at or above the floor, "inside-window" when it is below,
// "no-comparable-floor" when the vendor has no (or an unmatched) floor.
// Vendor matching is an EXACT string comparison between the two files'
// `vendor` fields, never fuzzy — a vendor present in `dates` but absent from
// `commitments` degrades to "no-comparable-floor" here (never a thrown
// error, never a guessed number), which is why
// scripts/check-notice-floor-comparator.mjs separately asserts, over the
// FULL (not just live) data, that every vendor `dates` mentions has a
// matching `commitments` entry — that is the actual data-integrity check;
// this function's graceful fallback is the last line of defence, not the
// enforcement.
export function computeLiveNoticeFloorRows(dates, commitments, todayIso) {
  const commitmentByVendor = new Map(commitments.map((c) => [c.vendor, c]));
  return dates
    .filter((row) => row.shutdown >= todayIso)
    .map((row) => {
      const minNoticeDays = floorFor(row.vendor, commitmentByVendor);
      const remainingDays = daysBetween(todayIso, row.shutdown);
      const status =
        minNoticeDays === null
          ? STATUS.NO_FLOOR
          : remainingDays >= minNoticeDays
            ? STATUS.HELD
            : STATUS.INSIDE_WINDOW;
      return { ...row, remainingDays, minNoticeDays, status };
    })
    .sort((a, b) => a.shutdown.localeCompare(b.shutdown));
}

// Per-vendor coverage summary for the "which vendors this can even check"
// section: every RETIREMENT_COMMITMENTS vendor, its floor (or null), and
// whether it currently has at least one LIVE row in `dates` — so the page
// can state plainly when a vendor has a clean floor but nothing live to
// apply it to (Anthropic, as of round 182), rather than leaving that silent.
export function summarizeCoverage(dates, commitments, todayIso) {
  const liveVendors = new Set(
    dates.filter((row) => row.shutdown >= todayIso).map((row) => row.vendor)
  );
  return commitments.map((c) => ({
    vendor: c.vendor,
    minNoticeDays: typeof c.minNoticeDays === "number" && Number.isFinite(c.minNoticeDays)
      ? c.minNoticeDays
      : null,
    hasLiveRow: liveVendors.has(c.vendor),
  }));
}
