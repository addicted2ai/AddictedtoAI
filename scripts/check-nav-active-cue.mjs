#!/usr/bin/env node
// docket/open/2026-08-22-nav-active-colour-only-indicator.md: `.nav-active`
// used to mark the current page by colour alone, at a measured 2.20:1
// contrast against the eight inactive links -- failing SC 1.4.1 (Use of
// Color: no non-colour cue existed) and SC 1.4.11 (Non-text Contrast:
// 2.20:1 is under the 3:1 floor for a UI-state indicator). This checks the
// fix on a real render over CDP (scripts/lib/cdp-browser.mjs), the same
// technique scripts/check-reflow.mjs and scripts/check-first-screenful.mjs
// already use, not a computation from the stylesheet.
//
// TWO SEPARATE ASSERTIONS, matching the item's own two "Done when" boxes:
//
// 1.4.1 -- at least one property OTHER than color distinguishes the active
// link's computed style from an inactive one: border-bottom-width,
// font-weight, or text-decoration-line. If none differ, the cue is still
// colour-only regardless of what CSS class names imply.
//
// 1.4.11 -- the property that supplies the non-colour cue must itself carry
// >= 3:1 contrast against the page background it sits on. This project's
// own `--border-interactive` token documents the same reading of 1.4.11
// (app/globals.css: "For borders that are the *only* thing marking a
// control as a control ... WCAG 1.4.11 asks for 3:1 there", measured
// against `--bg`) -- this check applies that same convention to the nav.
//
// WHAT THIS DOES NOT ASSERT. It does not require the active link's text
// colour and the inactive link's text colour to be 3:1 apart from each
// other. That pairing (--accent vs --muted) is mathematically unreachable
// here without a tradeoff this round declined: darkening --muted enough to
// close the gap would drop the inactive links' own contrast against --bg
// below 4.5:1, the SC 1.4.3 floor for body text (measured margin: pushing
// --muted to exactly the 4.5:1 edge only reaches ~2.93:1 against --accent,
// still short of 3:1); lightening --accent enough would mean abandoning the
// brand teal for something close to white. CHANGELOG.md's entry for this
// round (loop/build/nav-cue-and-line-length) has the arithmetic. This check
// asserts the criterion at the locus this codebase already uses elsewhere
// -- the indicator against its background -- not that specific pairing.
import { launchBrowser, stopBrowser, measurePage } from "./lib/cdp-browser.mjs";

const BASE = process.argv[2] || process.env.BASE || "http://localhost:3000";
const MIN_CONTRAST = 3.0;

export function NAV_CUE_PROBE() {
  function parseColor(str) {
    const m = str.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    if (!m) return null;
    return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] === undefined ? 1 : Number(m[4]) };
  }
  function relLum({ r, g, b }) {
    const lin = (c) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  }
  function contrast(hexA, hexB) {
    const a = parseColor(hexA);
    const b = parseColor(hexB);
    if (!a || !b) return null;
    const la = relLum(a);
    const lb = relLum(b);
    const [hi, lo] = la > lb ? [la, lb] : [lb, la];
    return (hi + 0.05) / (lo + 0.05);
  }

  const active = document.querySelector(".nav a.nav-active, .nav a[aria-current='page']");
  const inactiveLinks = [...document.querySelectorAll(".nav a")].filter((a) => a !== active);
  if (!active || inactiveLinks.length === 0) {
    return { error: "could not find both an active and an inactive nav link", activeFound: !!active, inactiveCount: inactiveLinks.length };
  }
  const bodyBg = getComputedStyle(document.body).backgroundColor;
  const aStyle = getComputedStyle(active);

  // A border can differ in COLOR ALONE (a hue swap on an always-solid line)
  // -- that is exactly the colour-only failure this check exists to catch,
  // so it must not itself count as the non-colour cue. But a border can
  // also be reserved at a fixed width/style on every link precisely to
  // avoid a layout shift, and toggled between transparent (invisible --
  // functionally no line, whatever is behind it shows through unchanged)
  // and an opaque colour (a real, perceivable line) by colour alone in the
  // CSS sense while remaining a structural presence/absence difference in
  // the perceptual sense 1.4.1 actually cares about: a border whose colour
  // has no contrast against its background does not read as a line to
  // anyone, sighted or not. So "does this element show a visible line" --
  // non-zero width AND a colour with real contrast against the page
  // background -- is the property compared, not the raw width/style/color
  // strings.
  function hasVisibleBorder(style) {
    const widthPx = parseFloat(style.borderBottomWidth);
    if (!(widthPx > 0) || style.borderBottomStyle === "none") return false;
    const c = parseColor(style.borderBottomColor);
    if (!c || c.a === 0) return false;
    const bg = parseColor(bodyBg);
    if (!bg) return c.a > 0; // can't compare -- fall back to "has any opacity"
    return contrast(style.borderBottomColor, bodyBg) > 1.1; // more than noise
  }

  const activeHasBorder = hasVisibleBorder(aStyle);

  const nonColourDiffs = [];
  for (const inactive of inactiveLinks) {
    const iStyle = getComputedStyle(inactive);
    const diffs = [];
    if (activeHasBorder !== hasVisibleBorder(iStyle)) diffs.push("border-bottom (visible/not)");
    if (aStyle.fontWeight !== iStyle.fontWeight) diffs.push("font-weight");
    if (aStyle.textDecorationLine !== iStyle.textDecorationLine) diffs.push("text-decoration");
    nonColourDiffs.push({ href: inactive.getAttribute("href"), diffs });
  }
  const allHaveNonColourDiff = nonColourDiffs.every((d) => d.diffs.length > 0);

  // The 1.4.11 contrast target: whichever non-colour property differs and
  // itself carries a colour (a border), measured against the page
  // background it sits against.
  let indicatorContrast = null;
  let indicatorSource = null;
  if (activeHasBorder) {
    indicatorContrast = contrast(aStyle.borderBottomColor, bodyBg);
    indicatorSource = "border-bottom-color vs body background";
  }

  return {
    activeHref: active.getAttribute("href"),
    inactiveCount: inactiveLinks.length,
    nonColourDiffs,
    allHaveNonColourDiff,
    activeStyle: {
      color: aStyle.color,
      fontWeight: aStyle.fontWeight,
      borderBottomWidth: aStyle.borderBottomWidth,
      borderBottomColor: aStyle.borderBottomColor,
      textDecorationLine: aStyle.textDecorationLine,
    },
    bodyBg,
    indicatorContrast,
    indicatorSource,
  };
}

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

  try {
    const result = await measurePage(
      browser.port,
      `${BASE}/`,
      { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false },
      NAV_CUE_PROBE.toString()
    );

    if (result.error) {
      console.log(`FAIL  ${result.error} (activeFound=${result.activeFound}, inactiveCount=${result.inactiveCount})`);
      failures++;
    } else {
      console.log(`      active link ${result.activeHref}, ${result.inactiveCount} inactive link(s) compared`);

      // SC 1.4.1: every inactive link must differ from the active one by at
      // least one non-colour property.
      if (result.allHaveNonColourDiff) {
        console.log(`ok    SC 1.4.1: every inactive nav link differs from the active one by a non-colour cue (${result.nonColourDiffs[0].diffs.join(", ")})`);
      } else {
        const bad = result.nonColourDiffs.filter((d) => d.diffs.length === 0);
        console.log(`FAIL  SC 1.4.1: ${bad.length} inactive link(s) differ from the active one by colour only: ${bad.map((d) => d.href).join(", ")}`);
        failures++;
      }

      // SC 1.4.11: the non-colour indicator itself must carry >= 3:1
      // contrast against its background.
      if (result.indicatorContrast === null) {
        console.log(`FAIL  SC 1.4.11: no coloured border indicator found to measure (active border-bottom-width ${result.activeStyle.borderBottomWidth}) -- cannot verify 3:1`);
        failures++;
      } else if (result.indicatorContrast >= MIN_CONTRAST) {
        console.log(`ok    SC 1.4.11: ${result.indicatorSource} contrast ${result.indicatorContrast.toFixed(2)}:1 (>= ${MIN_CONTRAST}:1)`);
      } else {
        console.log(`FAIL  SC 1.4.11: ${result.indicatorSource} contrast ${result.indicatorContrast.toFixed(2)}:1, need >= ${MIN_CONTRAST}:1`);
        failures++;
      }

      console.log(`      informational only, not asserted (see this file's header): active text ${result.activeStyle.color} vs body bg ${result.bodyBg}`);
    }
  } catch (error) {
    console.log(`FAIL  could not measure -- ${String(error.message || error).slice(0, 300)}`);
    failures++;
  } finally {
    await stopBrowser(browser);
  }

  if (failures > 0) {
    console.log(`${failures} nav-active-cue problem(s)`);
    process.exit(1);
  }
  console.log("nav-active-cue check passed");
}

import path from "node:path";
import { fileURLToPath } from "node:url";
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
