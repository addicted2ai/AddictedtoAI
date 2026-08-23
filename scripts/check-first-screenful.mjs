#!/usr/bin/env node
// First-screenful content density: how many enumerable content units --
// `tr` or `li` elements -- intersect the first 800px of a 1280-wide
// viewport, on a real render.
//
// docket/open/2026-08-22-first-screenful-density.md (closed by this round,
// loop/build/first-screenful-density) found this site showing zero such
// units on five of seven pages (/, /directory, /blog, /blog/*, /charter),
// against a 15-site reference corpus that showed a median of 11, and found
// /model-retirement-calendar specifically putting 672px of prose between
// its <h1> and its first data row -- 0 of 87 rows visible before
// scrolling. The docket item's own "Why now" names the trap this file
// exists not to repeat: "the design rubric that preceded this work got two
// separate numbers wrong by computing them from CSS instead of rendering
// them." This measures a real render over CDP, via scripts/lib/cdp-browser.mjs
// -- the same technique scripts/check-reflow.mjs already uses for a
// different measurement (document-width overflow) -- not a computation
// from the stylesheet.
//
// WHAT THIS DOES NOT CLAIM. "Content unit" is the docket item's own
// definition, not a general readability score: a `<tr>` or `<li>` element,
// full stop. A page that packs its first screenful with dense, useful
// prose and no list or table earns 0 here regardless of how good that
// prose is -- this file cannot and does not judge prose. It also does not
// judge WHICH content units are above the fold, only how many; a page
// could pass this check by moving irrelevant list items above relevant
// prose, and nothing here would notice. That editorial judgement is the
// docket item's own "Done when" #1 and #3 (a decision recorded, the
// tradeoff stated) -- see CHANGELOG.md's entry for this round for what was
// actually decided on each of the seven pages this item named.
//
// SCOPE OF THE BLOCKING ASSERTION. Only one route carries a hard, blocking
// minimum: /model-retirement-calendar, the item's own worst case (0 of 87
// rows visible) and the one page this round actually restructured. A
// regression there -- new prose pushing the tables back down -- is exactly
// the defect this round closes, so it is guarded. The other six routes are
// measured and printed every run, the same "loud, not silently skipped"
// convention scripts/check-reflow.mjs's KNOWN_FAILURES table already uses,
// but are NOT asserted against a minimum: four of them (/, /blog, /blog/*,
// /charter) were deliberately left as prose-first pages this round, by an
// explicit editorial decision recorded in CHANGELOG.md, not a defect
// pending a fix -- turning their current count into a floor would make a
// future legitimate content edit fail a build for a reason nobody reading
// this file's blocking list would understand. Baking in every measured
// number as a floor is the over-claiming this project's own house style
// (CLAUDE.md, scripts/check-frame.mjs) exists to avoid.
import {
  launchBrowser,
  stopBrowser,
  measurePage,
} from "./lib/cdp-browser.mjs";

const VIEWPORT_WIDTH = 1280;
const FOLD_PX = 800;

// route -> minimum content-unit count required, or null for "measure and
// print only". Keep this list short and each entry defensible on its own;
// see the file header for why the other six routes this round examined are
// not here.
export const ROUTES = {
  "/model-retirement-calendar": 1,
  "/": null,
  "/directory": null,
  "/blog": null,
  "/blog/frontier-cyber": null,
  "/charter": null,
  "/what-vendors-promise": null,
};

// Pure and synchronous -- stringified and sent to the page via
// Runtime.evaluate, so it must not close over anything outside its own
// arguments. Excludes elements smaller than a few pixels in either
// dimension so an accessibility "visually hidden" element (this
// repository's own `.visually-hidden`: `width: 1px; height: 1px; clip:
// rect(0,0,0,0)`) is not counted as visible content a reader would
// actually see above the fold.
export function FIRST_SCREENFUL_PROBE(foldPx) {
  const nodes = [...document.querySelectorAll("li, tr")];
  const units = nodes
    .map((el) => ({ el, r: el.getBoundingClientRect() }))
    .filter(({ r }) => r.width > 2 && r.height > 2 && r.top < foldPx && r.bottom > 0);
  return {
    count: units.length,
    sample: units.slice(0, 5).map(({ el, r }) => ({
      tag: el.tagName.toLowerCase(),
      top: Math.round(r.top),
      text: (el.textContent || "").trim().slice(0, 60),
    })),
  };
}

const BASE = process.argv[2] || process.env.BASE || "http://localhost:3000";

async function main() {
  let failures = 0;
  let browser;
  try {
    browser = await launchBrowser();
  } catch (error) {
    console.log(`FAIL  ${error.message}`);
    process.exit(1);
  }
  console.log(`      using ${browser.bin}`);
  console.log(`      viewport ${VIEWPORT_WIDTH}x${FOLD_PX}, fold at ${FOLD_PX}px, counting <li>/<tr> only`);

  try {
    for (const [route, minCount] of Object.entries(ROUTES)) {
      let result;
      try {
        result = await measurePage(
          browser.port,
          `${BASE}${route}`,
          {
            width: VIEWPORT_WIDTH,
            height: FOLD_PX,
            deviceScaleFactor: 1,
            mobile: false,
          },
          FIRST_SCREENFUL_PROBE.toString(),
          String(FOLD_PX)
        );
      } catch (error) {
        console.log(`FAIL  ${route} -> could not measure (${String(error.message || error).slice(0, 200)})`);
        failures++;
        continue;
      }

      const sampleText =
        result.sample.length > 0
          ? " -- " + result.sample.map((s) => `<${s.tag}> top ${s.top}px "${s.text}"`).join("; ")
          : "";

      if (minCount === null) {
        console.log(`measured ${route}  ${result.count} content unit(s) above ${FOLD_PX}px${sampleText}`);
      } else if (result.count >= minCount) {
        console.log(`ok    ${route}  ${result.count} content unit(s) above ${FOLD_PX}px (>= ${minCount} required)${sampleText}`);
      } else {
        console.log(
          `FAIL  ${route}  ${result.count} content unit(s) above ${FOLD_PX}px, need >= ${minCount}${sampleText}`
        );
        failures++;
      }
    }
  } finally {
    await stopBrowser(browser);
  }

  if (failures > 0) {
    console.log(`${failures} first-screenful problem(s)`);
    process.exit(1);
  }
  console.log("first-screenful check passed");
}

import path from "node:path";
import { fileURLToPath } from "node:url";
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
