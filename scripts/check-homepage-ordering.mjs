#!/usr/bin/env node
// Homepage ordering guard
// (docket/open/2026-08-24-the-homepage-sells-the-loop-not-the-site.md,
// closed by round 199, loop/build/homepage-value-first).
//
// CHARTER.md's own direction states an ordering and says it is deliberate:
// "Build an AI hub good enough that a stranger would use it without caring
// how it was made — then let how it was made be the second surprise...
// That an AI built this is the hook, not the value." Before this round,
// app/page.js rendered that backwards: the item counted nine blocks of
// process narrative (the headline, six paragraphs, the stats panel, the
// mention counts, a call to action) ahead of "What it has built" — the
// first heading over a link a stranger could actually use. The item's
// second defect was narrower: the grid that heading introduces listed only
// /blog, /directory and /demos, omitting the three deprecation tools
// (/what-vendors-promise, /model-retirement-calendar,
// /model-deprecation-checker) even though they are three of the nine links
// in app/Nav.js and the most obviously useful things this site has built.
//
// This script asserts both fixes hold, against the rendered page:
//   1. The "What it has built" grid renders before the process narrative
//      (the paragraph beginning "A model wrote the first commit").
//   2. All six routes in app/lib/sections.js — including the three
//      deprecation tools — are linked from inside that grid, before the
//      narrative.
//
// Run from the repository root, against a server already listening on
// $BASE (or the argument):
//
//   node scripts/check-homepage-ordering.mjs [baseUrl]
//
// WHY THIS SCOPES TO <main id="main-content">...</main> INSTEAD OF
// SEARCHING THE WHOLE DOCUMENT — corrected by round 199's own adversarial
// review (docket/reviews/4f45ff53f9df0239a5f8485e1dd3cf49981af35e.md) after
// this file's first version gave a wrong reason for it.
//
// The wrong reason, stated here so the mistake stays visible rather than
// quietly vanishing: that Next.js's trailing flight-data script — real,
// confirmed by fetching the live page, and it does repeat page text after
// </main> — could make an unscoped search find a decoy match "at an
// earlier byte offset than the real grid." That is mathematically
// impossible: indexOf() returns the FIRST (leftmost) match, and anything
// positioned after </main> is, by construction, always at a HIGHER offset
// than real content already found inside <main>. Trailing content can
// never produce this failure mode, full stop.
//
// The real reason: app/Nav.js renders before <main> on every page load —
// not a rare or synthetic case — and its own `links` array names all six
// TOOL_LINKS routes below (/blog, /directory, /demos,
// /what-vendors-promise, /model-retirement-calendar,
// /model-deprecation-checker). An unscoped `html.indexOf('href="/blog"')`
// finds Nav's copy at a lower byte offset than the grid's copy inside
// <main> — on every correctly ordered page this site has ever served, not
// only a contrived one. Scoping to <main> excludes that occurrence before
// the search runs; searching the whole document instead would fail a
// correct page with "link renders before the grid starts", for all six
// routes, every time. selfTest() below proves this directly rather than
// asserting it: it runs the real scoped function AND a small unscoped
// comparison against the same fixture and shows the two disagree.
//
// PROVING THE CHECK CAN FAIL. selfTest() runs on every invocation, before
// the live fetch, against six constructed cases — each built from a page()
// helper whose <nav>, like the real app/Nav.js, always links every
// TOOL_LINKS route before <main>, so every fixture already carries the
// real hazard rather than a special-cased one:
//   1. a correctly ordered page (must pass)
//   2. the ordering inverted (must fail, naming "regressed")
//   3. a grid missing one tool link (must fail, naming that route)
//   4. a page with no process narrative at all (must fail)
//   5. a page with no <main id="main-content"> to scope to (must fail,
//      not pass silently)
//   6. the Nav hazard itself, made explicit: the same correctly ordered
//      page, evaluated twice — scoped (must pass) and, through a tiny
//      unscoped comparison built only for this test, unscoped (must
//      report every TOOL_LINKS route as "before the grid") — proving the
//      <main> scoping is load-bearing, not decorative.
//
// This was also run once against the real, correctly-ordered page (a
// production build, `npm run build && npm run start`) before this round's
// commit, in addition to the synthetic proof above: `ok    homepage:
// "What it has built" grid ... precedes the process narrative ...; all 6
// tool links reachable before it`. See this round's CHANGELOG.md entry for
// the exact output, and for the same output the review re-derived
// independently.

const MAIN_START = 'id="main-content"';
const MAIN_END = "</main>";
const GRID_MARKER = 'class="section-grid"';
const NARRATIVE_MARKER = "A model wrote the first commit";

// Kept in sync with app/lib/sections.js by hand, the same way
// scripts/check-routes.sh's other homepage assertions read fixed strings
// rather than importing app/ code (this script is meant to run against a
// server's rendered output, not the source tree). A route added to the
// grid without being added here would simply not be checked, which is
// exactly the gap this file exists to close for these six specifically —
// see the "Done when" item this round closes.
const TOOL_LINKS = [
  "/blog",
  "/directory",
  "/demos",
  "/what-vendors-promise",
  "/model-retirement-calendar",
  "/model-deprecation-checker",
];

// Pure and synchronous: takes a full HTML document string, returns a
// verdict. No network, no filesystem — so it can be proved against
// constructed input without a server, and the live check below is just
// this function fed a real fetch.
export function evaluateHomepageOrdering(html) {
  const mainStart = html.indexOf(MAIN_START);
  const mainEnd = mainStart === -1 ? -1 : html.indexOf(MAIN_END, mainStart);
  if (mainStart === -1 || mainEnd === -1) {
    return {
      ok: false,
      problems: [
        'renders no <main id="main-content">...</main> to scope this check to — cannot verify ordering',
      ],
      gridPos: -1,
      narrativePos: -1,
    };
  }
  // Scoped to <main>...</main> on purpose: app/Nav.js — outside <main> on
  // every page — links all six TOOL_LINKS routes before <main> even opens.
  // See the header comment above for why that, not the trailing
  // flight-data script, is the reason this matters.
  const main = html.slice(mainStart, mainEnd);

  const gridPos = main.indexOf(GRID_MARKER);
  const narrativePos = main.indexOf(NARRATIVE_MARKER);
  const problems = [];

  if (gridPos === -1) {
    problems.push('renders no "What it has built" grid (section-grid)');
  }
  if (narrativePos === -1) {
    problems.push(
      'renders no process narrative (missing the pinned "A model wrote the first commit" sentence)'
    );
  }
  if (gridPos !== -1 && narrativePos !== -1 && gridPos > narrativePos) {
    problems.push(
      `process narrative (offset ${narrativePos} inside <main>) precedes the "What it has built" grid (offset ${gridPos}) — the ordering has regressed`
    );
  }

  for (const href of TOOL_LINKS) {
    const marker = `href="${href}"`;
    const pos = main.indexOf(marker);
    if (pos === -1) {
      problems.push(`grid has no link to ${href}`);
      continue;
    }
    if (gridPos !== -1 && pos < gridPos) {
      problems.push(
        `link to ${href} renders before the grid starts (offset ${pos} < ${gridPos})`
      );
    } else if (narrativePos !== -1 && pos > narrativePos) {
      problems.push(
        `link to ${href} renders after the process narrative (offset ${pos} > ${narrativePos}) — not reachable before the making account`
      );
    }
  }

  return { ok: problems.length === 0, problems, gridPos, narrativePos };
}

// --- Synthetic fixtures, used only to prove the check can fail --------------

function grid(omitHref) {
  const links = TOOL_LINKS.filter((h) => h !== omitHref)
    .map((h) => `<a href="${h}">x</a>`)
    .join("");
  return `<h2>What it has built</h2><div class="section-grid">${links}</div>`;
}

function narrative(omit) {
  return omit
    ? `<h2>An AI builds this site.</h2><p>nothing pinned here</p>`
    : `<h2>An AI builds this site.</h2><p>${NARRATIVE_MARKER} — a Next.js skeleton — and everything since.</p>`;
}

// Mirrors real Next.js output shape closely enough to exercise the scoping
// logic: a pre-main JSON-LD script (layout.js does this for real) and a
// <nav> before <main> that — like the real app/Nav.js — links every one of
// TOOL_LINKS. That nav is not an optional trap dialled in for one test; it
// is what every fixture below actually contains, because it is what every
// real page load actually contains. A trailing flight-data script is
// included too, for shape only — it is provably inert under indexOf's
// leftmost-match behaviour (see the header comment) and is never the thing
// being tested.
function page(mainInner) {
  const navLinks = TOOL_LINKS.map((h) => `<a href="${h}">x</a>`).join("");
  return (
    `<html><body><script type="application/ld+json">{}</script>` +
    `<nav>${navLinks}</nav>` +
    `<main id="main-content">${mainInner}</main>` +
    `<script>self.__next_f.push([1,"trailing payload, provably inert -- see header comment"])</script>` +
    `</body></html>`
  );
}

function selfTest() {
  let failures = 0;
  const expect = (label, condition, detail) => {
    if (condition) {
      console.log(`ok    self-test: ${label}`);
    } else {
      console.log(`FAIL  self-test: ${label} — ${detail}`);
      failures++;
    }
  };

  const goodHtml = page(grid() + narrative());
  const good = evaluateHomepageOrdering(goodHtml);
  expect(
    "correctly ordered fixture passes",
    good.ok,
    JSON.stringify(good.problems)
  );

  const inverted = evaluateHomepageOrdering(page(narrative() + grid()));
  expect(
    "inverted-order fixture fails, naming the regression",
    !inverted.ok && inverted.problems.some((p) => p.includes("regressed")),
    JSON.stringify(inverted)
  );

  const missingLink = evaluateHomepageOrdering(
    page(grid("/model-deprecation-checker") + narrative())
  );
  expect(
    "missing-tool-link fixture fails, naming the route",
    !missingLink.ok &&
      missingLink.problems.some((p) => p.includes("/model-deprecation-checker")),
    JSON.stringify(missingLink)
  );

  const missingNarrative = evaluateHomepageOrdering(
    page(grid() + narrative(true))
  );
  expect(
    "missing-narrative fixture fails",
    !missingNarrative.ok,
    JSON.stringify(missingNarrative)
  );

  const noMain = evaluateHomepageOrdering(
    `<html><body>${grid()}${narrative()}</body></html>`
  );
  expect(
    'fixture with no <main id="main-content"> fails rather than passing silently',
    !noMain.ok,
    JSON.stringify(noMain)
  );

  // The real hazard, made explicit and proved, not just asserted around.
  // goodHtml already contains Nav's own copy of every TOOL_LINKS href
  // before <main> — the same shape app/Nav.js renders on every real page.
  // unscopedProblems() below is a deliberately naive re-implementation of
  // the tool-link check with the <main> scoping removed, built only to
  // demonstrate the counterfactual this header comment describes: run it
  // against the exact same correctly-ordered fixture the first assertion
  // above already passed, scoped, and show it disagrees.
  function unscopedProblems(html) {
    const gridPos = html.indexOf(GRID_MARKER);
    const problems = [];
    for (const href of TOOL_LINKS) {
      const pos = html.indexOf(`href="${href}"`);
      if (pos !== -1 && gridPos !== -1 && pos < gridPos) {
        problems.push(`link to ${href} renders before the grid starts`);
      }
    }
    return problems;
  }
  const scopedVerdict = evaluateHomepageOrdering(goodHtml);
  const unscopedVerdict = unscopedProblems(goodHtml);
  expect(
    "<main> scoping is load-bearing: the same correctly-ordered page passes scoped and would wrongly fail unscoped, on Nav's own pre-<main> tool-link hrefs",
    scopedVerdict.ok && unscopedVerdict.length === TOOL_LINKS.length,
    `scoped=${JSON.stringify(scopedVerdict)} unscoped=${JSON.stringify(unscopedVerdict)}`
  );

  return failures;
}

const BASE = process.argv[2] || process.env.BASE || "http://localhost:3000";

async function main() {
  let failures = selfTest();

  let html;
  try {
    html = await (await fetch(`${BASE}/`)).text();
  } catch (error) {
    console.log(`FAIL  could not fetch ${BASE}/ — ${error.message}`);
    process.exit(1);
  }

  const result = evaluateHomepageOrdering(html);
  if (result.ok) {
    console.log(
      `ok    homepage: "What it has built" grid (offset ${result.gridPos}) precedes the process narrative (offset ${result.narrativePos}); all ${TOOL_LINKS.length} tool links reachable before it`
    );
  } else {
    for (const problem of result.problems) console.log(`FAIL  homepage ${problem}`);
    failures += result.problems.length;
  }

  if (failures > 0) {
    console.log(`${failures} homepage-ordering problem(s)`);
    process.exit(1);
  }
  console.log("homepage ordering check passed");
}

import path from "node:path";
import { fileURLToPath } from "node:url";
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
