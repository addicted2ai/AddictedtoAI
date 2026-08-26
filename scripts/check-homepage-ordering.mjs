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
// PROVING THE CHECK CAN FAIL. selfTest() below runs on every invocation,
// before the live fetch, against six synthetic fixtures: a correctly
// ordered page (must pass), the ordering inverted (must fail, naming
// "regressed"), a grid missing one tool link (must fail, naming that
// route), a page with no process narrative at all (must fail), a page with
// no <main id="main-content"> to scope the check to (must fail, not pass
// silently), and — the one this project has been bitten by before,
// see scripts/check-routes.sh's own comment on /log's "</ol>" scoping and
// the RSC payload that "repeats every entry" after it — a correctly
// ordered page whose trailing Next.js flight-data script (appended after
// </main> in real output) contains an out-of-order decoy copy of the
// narrative sentence. A version of evaluateHomepageOrdering() that searched
// the whole document instead of scoping to <main>...</main> would find the
// decoy at an earlier byte offset than the real grid and report a correct
// page as broken; the fixture proves the scoping actually holds, not just
// that it was written.
//
// This was also run once against the real, correctly-ordered page (a
// production build, `npm run build && npm run start`) before this round's
// commit, in addition to the synthetic proof above: `ok    homepage:
// "What it has built" grid ... precedes the process narrative ...; all 6
// tool links reachable before it`. See this round's CHANGELOG.md entry for
// the exact output.

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
  // Scoped to <main>...</main> on purpose: everything outside it (Nav, the
  // layout's own JSON-LD script, and — in real Next.js output — the
  // trailing flight-data script) can legitimately contain any of these
  // strings without being the rendered page content this check is about.
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
// logic: a pre-main JSON-LD script (layout.js does this for real), Nav
// outside <main>, and a trailing flight-data script after </main> that can
// carry a decoy copy of any string on the page.
function page(mainInner, { decoyBeforeMain = false } = {}) {
  const decoy = decoyBeforeMain
    ? `<script>self.__next_f.push([1,"decoy: ${NARRATIVE_MARKER}"])</script>`
    : "";
  return (
    `<html><body><script type="application/ld+json">{}</script>${decoy}` +
    `<nav><a href="/model-deprecation-checker">Deprecation checker</a></nav>` +
    `<main id="main-content">${mainInner}</main>` +
    `<script>self.__next_f.push([1,"trailing payload, ignored"])</script>` +
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

  const good = evaluateHomepageOrdering(page(grid() + narrative()));
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

  // The trap: correct order inside <main>, but a decoy copy of the
  // narrative sentence sits earlier in the document, outside <main> — the
  // shape a real trailing/leading flight-data script can take. Must still
  // pass: a version of evaluateHomepageOrdering() that forgot to scope to
  // <main>...</main> would find the decoy's offset (before mainStart, so
  // before the real grid too) and wrongly report this correct page broken.
  const rscTrap = evaluateHomepageOrdering(
    page(grid() + narrative(), { decoyBeforeMain: true })
  );
  expect(
    "correctly ordered fixture with a pre-main decoy still passes (RSC-payload scoping holds)",
    rscTrap.ok,
    JSON.stringify(rscTrap)
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
