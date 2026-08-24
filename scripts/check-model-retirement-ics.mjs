#!/usr/bin/env node
// Health check for the model retirement calendar feed
// (app/model-retirement-calendar.ics/route.js,
// docket/open/2026-08-22-model-shutdown-ics-feed.md). Run from the
// repository root:
//
//   node scripts/check-model-retirement-ics.mjs
//
// Two things this asserts, neither by eyeballing the text:
//
// 1. The generated document is well-formed iCalendar (RFC 5545), checked by
//    handing it to ical.js -- a real, independent RFC 5545 parser (used by
//    Thunderbird/Lightning), not a hand-rolled regex that could only ever
//    confirm this file's own assumptions about the format. A malformed
//    document makes ICAL.parse() throw; that throw is this check's failure,
//    not a caught-and-ignored edge case.
// 2. The feed contains exactly one VEVENT per RETIREMENT_DATES row -- built
//    from the SAME live import scripts/check-model-deprecation-parser.mjs
//    uses, so a future row added to or removed from the table is reflected
//    automatically (the feed is regenerated at every build, not a checked-in
//    snapshot) -- what this guards against is a bug in the *transform*
//    (app/lib/retirement-ics.js) that drops, duplicates, or mangles a row
//    even though the row count it was given was correct. Proved able to
//    fail: this round temporarily broke buildRetirementIcsFeed (dropped the
//    last row via .slice(0, -1)) with this check running, watched it report
//    "76 VEVENT(s), expected 77" and FAIL, then reverted -- see this round's
//    CHANGELOG entry for the transcript.

import path from "path";
import { pathToFileURL } from "url";
import ICAL from "ical.js";

const root = process.cwd();
const { RETIREMENT_DATES } = await import(
  pathToFileURL(path.join(root, "app", "lib", "retirement-dates.js")).href
);
const { buildRetirementIcsFeed } = await import(
  pathToFileURL(path.join(root, "app", "lib", "retirement-ics.js")).href
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

if (typeof buildRetirementIcsFeed !== "function") {
  console.log(
    "FAIL  app/lib/retirement-ics.js does not export a usable buildRetirementIcsFeed -- cannot generate the feed to validate"
  );
  process.exit(1);
}
if (!Array.isArray(RETIREMENT_DATES) || RETIREMENT_DATES.length === 0) {
  console.log(
    "FAIL  app/lib/retirement-dates.js RETIREMENT_DATES is empty or not an array -- nothing to check against"
  );
  process.exit(1);
}

console.log(`checking a feed built from ${RETIREMENT_DATES.length} RETIREMENT_DATES row(s)\n`);

const ics = buildRetirementIcsFeed(RETIREMENT_DATES);

// --- 1. Real RFC 5545 parser -------------------------------------------
let calendar;
try {
  const jcal = ICAL.parse(ics);
  calendar = new ICAL.Component(jcal);
  ok("ical.js (RFC 5545) parses the generated document without error");
} catch (err) {
  bad(`ical.js failed to parse the generated document as iCalendar: ${err.message}`);
  console.log(`\n${failures} of ${checks} check(s) failed`);
  process.exit(1); // Nothing below is meaningful against an unparseable document.
}

if (calendar.name === "vcalendar") {
  ok('root component is VCALENDAR');
} else {
  bad(`root component is "${calendar.name}", expected "vcalendar"`);
}

const version = calendar.getFirstPropertyValue("version");
if (version === "2.0") {
  ok("VERSION:2.0 present");
} else {
  bad(`VERSION is "${version}", expected "2.0"`);
}

const prodid = calendar.getFirstPropertyValue("prodid");
if (typeof prodid === "string" && prodid.length > 0) {
  ok(`PRODID present ("${prodid}")`);
} else {
  bad("PRODID missing or empty");
}

// --- 2. Exactly one VEVENT per row --------------------------------------
const events = calendar.getAllSubcomponents("vevent");
if (events.length === RETIREMENT_DATES.length) {
  ok(`feed contains exactly ${events.length} VEVENT(s), matching RETIREMENT_DATES.length`);
} else {
  bad(
    `feed contains ${events.length} VEVENT(s), RETIREMENT_DATES has ${RETIREMENT_DATES.length} row(s) -- desynced`
  );
}

// UIDs must be unique -- a calendar client keys updates on UID, so a
// collision would make one row's event silently overwrite another's on
// import.
const uids = events.map((e) => e.getFirstPropertyValue("uid"));
const uniqueUids = new Set(uids);
if (uniqueUids.size === events.length && events.every((_, i) => !!uids[i])) {
  ok(`all ${events.length} VEVENT UIDs are present and unique`);
} else {
  bad(
    `${events.length - uniqueUids.size} duplicate or missing UID(s) among ${events.length} VEVENT(s)`
  );
}

// --- 3. Every row's own data survives the transform, in order ----------
// Generation order matches RETIREMENT_DATES order 1:1 (buildRetirementIcsFeed
// iterates the array once, pushing one event per row) -- asserted directly
// rather than assumed, since a future reorder/filter/sort inside the
// transform would break this pairing silently otherwise.
if (events.length === RETIREMENT_DATES.length) {
  let rowMismatches = 0;
  RETIREMENT_DATES.forEach((row, index) => {
    const event = events[index];
    const summary = event.getFirstPropertyValue("summary") || "";
    const description = event.getFirstPropertyValue("description") || "";
    const url = event.getFirstPropertyValue("url") || "";
    const dtstart = event.getFirstPropertyValue("dtstart");
    const dtend = event.getFirstPropertyValue("dtend");
    const replacementText = row.replacement ? row.replacement : "none named";

    const problems = [];
    if (!summary.includes(row.vendor)) problems.push("SUMMARY missing vendor");
    if (!summary.includes(row.what)) problems.push("SUMMARY missing identifier");
    if (!description.includes(row.vendor)) problems.push("DESCRIPTION missing vendor");
    if (!description.includes(row.what)) problems.push("DESCRIPTION missing identifier");
    if (!description.includes(replacementText)) {
      problems.push(`DESCRIPTION missing replacement ("${replacementText}")`);
    }
    if (!description.includes(row.href)) problems.push("DESCRIPTION missing source link");
    if (url !== row.href) problems.push(`URL is "${url}", expected "${row.href}"`);
    if (!dtstart || !dtstart.isDate) problems.push("DTSTART is missing or is not a DATE value");
    if (dtstart && dtstart.toString() !== row.shutdown) {
      problems.push(`DTSTART is "${dtstart.toString()}", expected "${row.shutdown}"`);
    }
    if (!dtend || !dtend.isDate) problems.push("DTEND is missing or is not a DATE value");
    if (dtstart && dtend) {
      const diffDays = dtend.subtractDate(dtstart).toSeconds() / 86400;
      if (diffDays !== 1) problems.push(`DTEND is ${diffDays} day(s) after DTSTART, expected 1`);
    }

    if (problems.length > 0) {
      rowMismatches++;
      bad(`row ${index} ("${row.vendor}: ${row.what}"): ${problems.join("; ")}`);
    }
  });
  if (rowMismatches === 0) {
    ok(
      `every one of ${RETIREMENT_DATES.length} row(s) carries its vendor, identifier, replacement (or "none named"), source link, and a correct one-day DTSTART/DTEND pair`
    );
  }
} else {
  bad("skipped per-row field checks: event count did not match row count above, pairing by index would be meaningless");
}

console.log();
if (failures > 0) {
  console.log(`${failures} of ${checks} check(s) failed`);
  process.exit(1);
}
console.log(
  `all ${checks} checks passed -- the feed is well-formed iCalendar (RFC 5545, verified with ical.js) and carries exactly one VEVENT per RETIREMENT_DATES row (${RETIREMENT_DATES.length})`
);
