#!/usr/bin/env node
// docket/open/2026-08-22-article-p-line-length.md: `article p` ran 100-103
// characters per full rendered line at the median, up to 122 at the max,
// across five long-form pages -- measured by walking each paragraph's text
// character by character and grouping by rendered line (each character's
// Range.getClientRects()[0].top), not by computing a character count from
// `ch` units. The item's own evidence names this exact trap: a design
// rubric computed `68ch` as "takes the site to ~68 characters" when it
// actually rendered at 81, because `1ch` is the `0` glyph's width, ~18%
// wider than this font's mean character advance. This script repeats the
// item's own measurement method on a real render over CDP
// (scripts/lib/cdp-browser.mjs), not the stylesheet.
//
// "Full lines" excludes each paragraph's last (typically shorter,
// non-wrapped) line -- the convention that reproduces the docket item's own
// 100-103 baseline figure; counting every line including each paragraph's
// last dragged the median down to the high 70s/80s in this round's own
// baseline re-measurement (CHANGELOG.md has both numbers).
//
// WHAT THIS ASSERTS AND WHY THE CEILING IS 107, NOT A ROUNDER NUMBER. This
// round capped `article p` at `80ch` (app/globals.css), which rendered
// (this round's own measurement, CHANGELOG.md) to a per-page full-line max
// of 96-105 characters across the five named pages. The same five pages'
// PRE-fix max (no cap, `main`'s 780px alone) was 108-124. 107 sits strictly
// between the highest post-fix max (105) and the lowest pre-fix max (108)
// across every one of the five pages measured, so it fails if the `80ch`
// rule is ever removed or loosened past this specific boundary, on any of
// the five pages, and does not fail on the fixed state with margin to
// spare. It is not a general readability judgement -- a future round
// choosing a deliberately wider or narrower value should update this
// number and say why, the same as app/globals.css's own comment on the
// rule does for the choice of 80ch itself.
//
// THE MARGIN IS NARROW, NAMED HERE RATHER THAN LEFT IMPLICIT. 107 is only
// 2 characters above the tightest page's post-fix max (105, /blog) and
// only 1 below the loosest pre-fix max (108, /model-retirement-calendar).
// Adversarial review flagged this as fragile against an unrelated future
// content edit on /blog specifically -- a longer word or a new inline
// link there could push its max past 107 with the 80ch rule still fully
// intact, which would read as a regression this check did not cause. That
// is a real limit of a ceiling reverse-engineered from one round's content
// rather than derived from the rule itself, and is not something this
// check can distinguish from an actual loosening of the `80ch` cap.
import {
  launchBrowser,
  stopBrowser,
  measurePage,
} from "./lib/cdp-browser.mjs";

const MAX_FULL_LINE_CHARS = 107;

// route -> required, per this round's own measurement (see header).
export const ROUTES = [
  "/model-retirement-calendar",
  "/what-vendors-promise",
  "/blog",
  "/blog/chatgpt-ads",
  "/model-deprecation-checker",
];

// Pure and synchronous -- stringified and sent to the page via
// Runtime.evaluate, so it must not close over anything outside its own
// arguments.
export function LINE_LENGTH_PROBE() {
  const paragraphs = [...document.querySelectorAll("article p")];
  const fullLines = [];
  for (const p of paragraphs) {
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    const lineMap = new Map();
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent;
      for (let i = 0; i < text.length; i++) {
        const range = document.createRange();
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const rects = range.getClientRects();
        if (rects.length === 0) continue; // collapsed whitespace at a wrap point
        const top = Math.round(rects[0].top);
        lineMap.set(top, (lineMap.get(top) || 0) + 1);
      }
    }
    const tops = [...lineMap.keys()].sort((a, b) => a - b);
    // Every line but the paragraph's last -- see this file's header.
    tops.slice(0, -1).forEach((top) => fullLines.push(lineMap.get(top)));
  }
  fullLines.sort((a, b) => a - b);
  const median =
    fullLines.length === 0
      ? null
      : fullLines.length % 2 === 1
      ? fullLines[(fullLines.length - 1) / 2]
      : Math.round((fullLines[fullLines.length / 2 - 1] + fullLines[fullLines.length / 2]) / 2);
  return {
    paragraphCount: paragraphs.length,
    fullLineCount: fullLines.length,
    median,
    max: fullLines.length ? fullLines[fullLines.length - 1] : null,
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
  console.log(`      measuring full (wrapped, non-final) lines in article p; ceiling ${MAX_FULL_LINE_CHARS} chars`);

  try {
    for (const route of ROUTES) {
      let result;
      try {
        result = await measurePage(
          browser.port,
          `${BASE}${route}`,
          { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false },
          LINE_LENGTH_PROBE.toString()
        );
      } catch (error) {
        console.log(`FAIL  ${route} -> could not measure (${String(error.message || error).slice(0, 200)})`);
        failures++;
        continue;
      }

      if (result.fullLineCount === 0) {
        console.log(`FAIL  ${route} -> no full (wrapped) lines found in article p -- cannot verify`);
        failures++;
        continue;
      }

      if (result.max <= MAX_FULL_LINE_CHARS) {
        console.log(
          `ok    ${route}  median ${result.median}, max ${result.max} chars/line over ${result.fullLineCount} full line(s) (<= ${MAX_FULL_LINE_CHARS} required)`
        );
      } else {
        console.log(
          `FAIL  ${route}  max ${result.max} chars/line exceeds ${MAX_FULL_LINE_CHARS} (median ${result.median} over ${result.fullLineCount} full line(s))`
        );
        failures++;
      }
    }
  } finally {
    await stopBrowser(browser);
  }

  if (failures > 0) {
    console.log(`${failures} article-line-length problem(s)`);
    process.exit(1);
  }
  console.log("article-line-length check passed");
}

import path from "node:path";
import { fileURLToPath } from "node:url";
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
