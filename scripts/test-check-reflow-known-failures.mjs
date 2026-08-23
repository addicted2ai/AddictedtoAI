#!/usr/bin/env node
// Adversarial review (round 170, first pass) demonstrated live that
// scripts/check-reflow.mjs's first KNOWN_FAILURES shape keyed on the route
// name alone: it injected an unrelated +580px overflow on /log -- a route
// this file already excused a documented ~180px bug on -- and the check
// reported KNOWN rather than FAIL. A route-keyed exemption is not a
// documented exception; it is a standing bypass for that route.
//
// Second pass, against the fix for that: `.includes()` has no floor, so
// `snippets: [""]` (the empty string is a substring of everything in
// JavaScript) or a short, generic snippet reconstructs the same route-wide
// bypass -- verified directly against the shipped code. Cases 11-14 below
// are that regression test.
//
// This file is the regression test for both: classifyKnownFailure and
// checkKnownFailureBookkeeping, exercised directly with synthetic inputs
// modelled on the review's own demonstrations, so neither defect can come
// back silently. Case 3 in particular is cited by name in this round's
// changelog entry: a first draft of check-reflow.mjs's own comments claimed
// a smaller offender coexisting with a larger known one "would not appear
// as the widest" and "pass unnoticed" -- review's second pass tested that
// claim directly against this shipped code and found it false, contradicted
// by this exact case. Kept here, unchanged in substance, as the proof.
//
// Fixtures here are synthetic on purpose, not a copy of whatever
// KNOWN_FAILURES currently holds: round 170 shipped with the table empty
// (the one entry it had was fixed, incidentally, by an unrelated CSS
// change, before this test was written -- see the changelog entry), and a
// test asserting against "today's live entries" would have nothing left to
// assert the moment the queue is clean, which is the state this table is
// *supposed* to reach. The classifier's contract -- explain every offender
// or fail, bookkeeping catches a stale citation -- is what this test
// covers, independent of whether anything is currently listed.
//
// Imports the pure functions rather than spawning the real script, because
// these are genuinely pure (no I/O in classifyKnownFailure;
// checkKnownFailureBookkeeping takes its filesystem root as a parameter)
// and a browser round-trip would make this slow without testing anything
// the import doesn't already cover. Importing is safe here specifically
// because check-reflow.mjs guards its own `main()` behind an isMain check
// -- see that file's tail -- so importing it does not also launch a
// browser.
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import {
  classifyKnownFailure,
  checkKnownFailureBookkeeping,
} from "./check-reflow.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let failures = 0;
const ok = (m) => console.log(`ok    ${m}`);
const bad = (m) => {
  console.log(`FAIL  ${m}`);
  failures++;
};

// A synthetic entry, shaped like a real one, modelled on the actual /log
// bug this fix responds to (kept as the running example because it is the
// real case adversarial review demonstrated against).
const fixture = {
  docket: "docket/open/2026-08-22-log-note-nested-code-overflows-320px.md",
  expires: "2026-11-20",
  snippets: ["docket/reviews/d45a8c9a01c97f877004429cc4160de3c5e382f5.md"],
};

// --- classifyKnownFailure ---------------------------------------------------

// 1. The documented failure: one offender, its text contains the
//    documented snippet. Must be classified known.
{
  const result = {
    overflow: true,
    truncated: false,
    offenders: [
      {
        tag: "STRONG",
        cls: "",
        right: 500,
        text: `Two findings from independent review at \`d45a8c9\` (\`${fixture.snippets[0]}\`), fixed here rather than left in a clean draft:`,
      },
    ],
  };
  const verdict = classifyKnownFailure(fixture, result);
  if (verdict.known) ok("a documented signature (matching offender text) classifies as known");
  else bad(`documented signature classified as NOT known -- ${verdict.reason}`);
}

// 2. The review's own demonstration: a different offender, unrelated text,
//    a much larger overflow. Must FAIL, not be reported known -- this is
//    the exact defect adversarial review found.
{
  const result = {
    overflow: true,
    truncated: false,
    offenders: [
      {
        tag: "TABLE",
        cls: "some-unrelated-wide-table",
        right: 900,
        text: "a completely unrelated wide table with nothing to do with the documented bug",
      },
    ],
  };
  const verdict = classifyKnownFailure(fixture, result);
  if (!verdict.known) ok("an unrelated offender on the same route classifies as NOT known (the review's own demonstration)");
  else bad("an unrelated offender on the same route was classified as known -- this is the exact defect review found");
}

// 3. A second, smaller, unrelated offender ALONGSIDE the documented one.
//    Every offender must be explained, not just the widest -- one
//    unmatched offender is enough to fail the whole route.
{
  const result = {
    overflow: true,
    truncated: false,
    offenders: [
      {
        tag: "STRONG",
        cls: "",
        right: 500,
        text: `Two findings from independent review at \`d45a8c9\` (\`${fixture.snippets[0]}\`), fixed here rather than left in a clean draft:`,
      },
      {
        tag: "SPAN",
        cls: "unrelated",
        right: 340,
        text: "a second, smaller, unrelated overflow that happens to sit beside the documented one",
      },
    ],
  };
  const verdict = classifyKnownFailure(fixture, result);
  if (!verdict.known) ok("a documented offender plus one unexplained offender still classifies as NOT known");
  else bad("an unexplained second offender was silently excused alongside the documented one");
}

// 4. Overflow true but no offender identified -- the shape
//    scripts/check-reflow.mjs's own REFLOW_PROBE returns for block-level
//    overflow it cannot attribute to a single element's bounding rect
//    (found verifying this fix; see the KNOWN_FAILURES comment). Must fail
//    closed, not pass open.
{
  const result = { overflow: true, truncated: false, offenders: [] };
  const verdict = classifyKnownFailure(fixture, result);
  if (!verdict.known) ok("overflow with zero identified offenders classifies as NOT known (fails closed)");
  else bad("overflow with zero identified offenders was classified as known");
}

// 5. Truncated offender list -- cannot verify every offender is
//    documented, so must not pass.
{
  const result = {
    overflow: true,
    truncated: true,
    offenders: [{ tag: "STRONG", cls: "", right: 500, text: fixture.snippets[0] }],
  };
  const verdict = classifyKnownFailure(fixture, result);
  if (!verdict.known) ok("a truncated offender list classifies as NOT known, even if the visible ones match");
  else bad("a truncated offender list was classified as known");
}

// --- checkKnownFailureBookkeeping -------------------------------------------

// 6. A citation to a real, currently-open docket item passes.
{
  const openItem = "docket/open/2026-08-22-changelog-fenced-code-blocks-unparsed.md";
  if (!fs.existsSync(path.join(ROOT, openItem))) {
    bad(`fixture docket item is missing from this checkout: ${openItem} (update the fixture, not this message)`);
  } else {
    const { problems } = checkKnownFailureBookkeeping(
      "/fictional-route",
      { docket: openItem, expires: "2099-01-01", snippets: ["a-fixture-snippet-for-this-test"] },
      { repoRoot: ROOT }
    );
    if (problems.length === 0) ok(`a citation to a real, open docket item passes bookkeeping (${openItem})`);
    else bad(`a real, open docket item's bookkeeping failed: ${problems.join("; ")}`);
  }
}

// 7. A citation to a docket item that does not exist -- an entry that
//    outlived its bug (closed, dropped, or renamed) must be caught, not
//    silently trusted forever.
{
  const staleEntry = {
    docket: "docket/open/1970-01-01-this-item-does-not-exist.md",
    expires: "2099-01-01",
    snippets: ["a-fixture-snippet-for-this-test"],
  };
  const { problems } = checkKnownFailureBookkeeping("/fictional-route", staleEntry, { repoRoot: ROOT });
  if (problems.length > 0) ok("a KNOWN_FAILURES entry citing a non-open docket item is caught");
  else bad("a KNOWN_FAILURES entry citing a non-existent docket item was not caught");
}

// 8. An entry citing a path outside docket/open/ (e.g. a closed item's old
//    path) must also be caught, not just a missing file -- the same
//    "outlived its bug" case, reached a different way.
{
  const doneEntry = {
    docket: "docket/done/2026-08-14-render-one-limit-count-from-sweep-output.md",
    expires: "2099-01-01",
    snippets: ["a-fixture-snippet-for-this-test"],
  };
  const { problems } = checkKnownFailureBookkeeping("/fictional-route", doneEntry, { repoRoot: ROOT });
  if (problems.length > 0) ok("a KNOWN_FAILURES entry citing a docket/done/ item (not open/) is caught");
  else bad("a KNOWN_FAILURES entry citing a closed docket item was not caught");
}

// 9. expires in the past prints a note, not a build failure; expires in
//    the future prints nothing. Uses a real open item so problems stays
//    empty and only the expires behaviour is under test.
{
  const anchor = "docket/open/2026-08-22-changelog-fenced-code-blocks-unparsed.md";
  const past = { docket: anchor, expires: "2020-01-01", snippets: ["a-fixture-snippet-for-this-test"] };
  const { problems, notes } = checkKnownFailureBookkeeping("/fictional-route", past, { repoRoot: ROOT });
  if (problems.length === 0 && notes.length > 0) ok("a past expires date produces a note, not a failure");
  else bad(`a past expires date should note (not fail): problems=${problems.length} notes=${notes.length}`);

  const future = { docket: anchor, expires: "2099-01-01", snippets: ["a-fixture-snippet-for-this-test"] };
  const { notes: futureNotes } = checkKnownFailureBookkeeping("/fictional-route", future, { repoRoot: ROOT });
  if (futureNotes.length === 0) ok("a future expires date produces no note");
  else bad("a future expires date incorrectly produced a note");
}

// 10. Whatever is ACTUALLY shipped in KNOWN_FAILURES right now must itself
//     pass bookkeeping -- if this table is non-empty when this test runs,
//     every entry's citation must be real. (Currently empty; this loop is
//     a no-op today and becomes live the moment a new entry is added.)
{
  const { KNOWN_FAILURES } = await import("./check-reflow.mjs");
  const entries = Object.entries(KNOWN_FAILURES);
  if (entries.length === 0) {
    ok("KNOWN_FAILURES is currently empty (the honest state when nothing is excused)");
  } else {
    for (const [route, entry] of entries) {
      const { problems } = checkKnownFailureBookkeeping(route, entry, { repoRoot: ROOT });
      if (problems.length === 0) ok(`shipped entry for ${route} passes bookkeeping (${entry.docket})`);
      else bad(`shipped entry for ${route} failed bookkeeping: ${problems.join("; ")}`);
    }
  }
}

// --- the snippet floor (review, second pass) --------------------------------

// 11. Review's second-pass demonstration, reproduced directly: `snippets: [""]`
//     against ANY offender text. `.includes("")` is true for every string in
//     JavaScript, so before the length floor this matched unconditionally --
//     the exact route-wide bypass the whole fix exists to close, just moved
//     one level down into a single careless entry. Must be rejected.
{
  const degenerateEntry = { ...fixture, snippets: [""] };
  const result = {
    overflow: true,
    truncated: false,
    offenders: [{ tag: "DIV", cls: "anything-at-all", right: 9999, text: "absolutely anything, this must not match" }],
  };
  const verdict = classifyKnownFailure(degenerateEntry, result);
  if (!verdict.known) ok('an empty-string snippet ("") does not match unconditionally -- rejected, not a wildcard');
  else bad('an empty-string snippet ("") matched an unrelated offender -- the route-wide bypass is back');
}

// 12. A short, generic snippet ("the") matching by accident -- the review's
//     other named example. Also must be rejected, even though it is not
//     technically empty.
{
  const genericEntry = { ...fixture, snippets: ["the"] };
  const result = {
    overflow: true,
    truncated: false,
    offenders: [{ tag: "DIV", cls: "", right: 9999, text: "the quick brown fox, nothing to do with the documented bug" }],
  };
  const verdict = classifyKnownFailure(genericEntry, result);
  if (!verdict.known) ok('a short, generic snippet ("the") is rejected rather than matching by accident');
  else bad('a short, generic snippet ("the") matched an unrelated offender');
}

// 13. The floor is a length, not a blanket rejection of short-looking
//     entries: a snippet at exactly MIN_SNIPPET_LENGTH (12 characters) that
//     genuinely matches the offender must still classify known. Proves 11
//     and 12 fail because they are too short/degenerate, not because
//     classifyKnownFailure rejects every entry now.
{
  const boundaryEntry = { ...fixture, snippets: ["twelve-chars"] }; // exactly 12
  const result = {
    overflow: true,
    truncated: false,
    offenders: [{ tag: "STRONG", cls: "", right: 500, text: "some prose containing twelve-chars right in the middle" }],
  };
  const verdict = classifyKnownFailure(boundaryEntry, result);
  if (verdict.known) ok("a 12-character snippet that genuinely matches still classifies known -- the floor doesn't overreach");
  else bad(`a 12-character genuine match was rejected -- ${verdict.reason}`);
}

// 14. checkKnownFailureBookkeeping enforces the same floor, independent of
//     classifyKnownFailure -- it runs on every entry unconditionally (see
//     that function's own comment for why: classifyKnownFailure only runs
//     when its route is actually overflowing, so a bad entry on a currently
//     clean route needs its own check).
{
  const emptySnippetEntry = {
    docket: "docket/open/2026-08-22-changelog-fenced-code-blocks-unparsed.md",
    expires: "2099-01-01",
    snippets: [""],
  };
  const { problems } = checkKnownFailureBookkeeping("/fictional-route", emptySnippetEntry, { repoRoot: ROOT });
  if (problems.length > 0) ok("checkKnownFailureBookkeeping also rejects an empty-string snippet, not only classifyKnownFailure");
  else bad("checkKnownFailureBookkeeping did not catch an empty-string snippet");
}

if (failures > 0) {
  console.log(`\n${failures} test(s) failed`);
  process.exit(1);
}
console.log("\nall check-reflow.mjs KNOWN_FAILURES tests passed");
