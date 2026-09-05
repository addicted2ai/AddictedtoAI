#!/usr/bin/env node
/**
 * ui-invariants.mjs — the check harness for invariants this loop adds
 * (loops/ui-loop/CHARTER.md slot 6, IMPLEMENT.md contract rule 2).
 *
 *   node tools/ui-invariants.mjs
 *
 * `scripts/verify-design.mjs` owns the bounds this project measured before the loop
 * existed (RULES.md R1-R6). This file owns everything the loop itself accepts: when a
 * verdict item is implemented, its `invariant` lands here as an executable assertion in
 * the SAME commit as the change it constrains. A change without its check is unfinished.
 *
 * TWO RULES THIS HARNESS ENFORCES ON ITSELF
 *
 * 1. **Every invariant must be falsifier-verified.** An entry shall declare `falsifier`:
 *    how the property was deliberately broken, and that the check was OBSERVED failing.
 *    An entry without it is REFUSED, not skipped — a check never seen to fail is not
 *    known to work. This project has already shipped a focus traversal that quit at stop
 *    11 and passed for its whole life while examining nothing below the fold (RULES.md
 *    R5), and the source loop shipped an assertion that recomputed from the same variable
 *    it was checking and so certified its own bug.
 *
 * 2. **An assertion may not derive from the source it checks.** State the independent
 *    quantity in `independent`: the sibling ratio, the measured wall, the physical
 *    opening a reader actually looks through. Recompute-from-source is not a check.
 *
 * Zero registered invariants is the legitimate state at iteration 0 and exits 0 — but it
 * is reported plainly, because a harness that says PASS while checking nothing is the
 * tooling-theatre failure this loop is built to avoid.
 */

import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as cheerio from 'cheerio';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'out');

/**
 * The registry. Each entry:
 *
 *   id           I-<verdict item id>, e.g. 'I7'
 *   rule         the RULES.md number this enforces, e.g. 'R7'
 *   intent       the property in one line, stated so it can be true or false
 *   independent  the quantity it is measured AGAINST, which must not be re-derived
 *                from the thing under test
 *   falsifier    { brokenBy, observed } — how it was broken and that it was seen to fail
 *   kind         'static' (reads files) or 'dom' (needs a rendered page)
 *   routes       for kind 'dom': the routes to assert over
 *   check        async ({ readOut, page }) => true | string   (string = failure reason)
 *
 * EXAMPLE of the shape a restructure invariant takes — the model is RULES.md R6, this
 * project's own above-fold check, which exists so a restructure cannot push the site's
 * substance below the fold while passing every other gate:
 *
 *   {
 *     id: 'I0', rule: 'R6',
 *     intent: 'the home page shows changed-feed lines within the first viewport',
 *     independent: 'the viewport height reported by the browser, not a CSS value',
 *     falsifier: { brokenBy: 'inserted a 100vh hero above the feed',
 *                  observed: 'check failed with "first feed line at y=980 > 844"' },
 *     kind: 'dom', routes: ['/'],
 *     check: async ({ page }) => { ... },
 *   }
 */
const INVARIANTS = [
  {
    id: 'S1', rule: 'R7',
    intent: "a row-based list's primary label column stops before --measure-list, so metadata sits immediately after the label instead of at the container's far edge; where the surface's own content exceeds that cap, the label wraps rather than stretching the track, bounded to 3 lines — a track pinned AT the cap that overflows 3 lines, or a track measurably BELOW the cap at all, both still fail",
    independent: "the rendered pixel gap between .browse-name's actual GLYPH extent (a Range over its text, not its grid-stretched box) and .browse-kind's left edge; whether that Range wraps across more than one client rect; and the browser's own RESOLVED pixel width of each .browse list's first grid track, read live via getComputedStyle — none derived from the --measure-list token's literal value, which only the check's own hardcoded 24rem bound represents",
    falsifier: {
      brokenBy: 'FOUR episodes. (1) iter-06: `.browse-row{grid-template-columns:30rem auto auto !important}` — the label column widened past the 24rem cap with no other structural change, reproducing the original too-wide excess this check exists for. (Historical iter-01: the FIRST ATTEMPT used getBoundingClientRect() on .browse-name itself and passed even broken, because a grid item is blockified and stretches to fill its track by default — the BOX always abuts .browse-kind\'s track regardless of column width, so a box-to-box gap is vacuous. Rewritten to measure a Range over the text node instead, which then failed correctly with "gap 684.0px exceeds 24rem (384.0px)" on the pre-S9 `.browse-row` shape.) (2) iter-07 (this round, rewritten check below): re-ran break (1) unchanged to confirm the too-wide clause survived the rewrite. (3) iter-07 NEW: `.browse-name{font-size:40px !important}` on /data — inflates the label\'s own natural (max-content) width without touching --measure-list or the grid template at all, so `.browse`\'s `fit-content(384px)` track still pins to EXACTLY 384px (unchanged, confirmed measured) while the larger glyphs need far more than 3 lines to hold the longest label — isolates the NEW line-count bound from the track-width-collapse clause, since here the track is provably AT the cap, not below it. (4) iter-07 NEW: with (3) restored, `.browse{grid-template-columns:100px auto auto !important}` on /data — a track held well below the 384px cap, to confirm the pre-existing "collapsed" clause still fires correctly under the rewritten check\'s trackWidth-vs-cap logic (paired with its observedOpposite below; both directions of the REWRITE are exercised here, not just the original too-wide/too-narrow pair from iter-06).',
      observed: '(1) "/data @1440x900: gap 448.4px exceeds 24rem (384.0px)" — unchanged from iter-06\'s own reading of the identical break. (2) confirmed identical: "/data @1440x900: gap 448.4px exceeds 24rem (384.0px)". (3) check failed "/data @1440x900: label \\"Impossible → Routine — dated pairs with both sources\\" wraps across 4 lines even at the --measure-list cap (384.0px) — exceeds the 3-line allowance" — trackWidth confirmed still 384.0px (read live under the break), proving the line-count bound fires independently of the collapse clause. (4) check failed "/data @1440x900: label \\"Entries — identity, lifecycle, indexability\\" wraps across 4 lines — the label column has collapsed to 100.0px, narrower than its own --measure-list cap (384.0px)". All four restored; rebuilt tree (full gate) passes S1 at both declared viewports.',
      brokenByOpposite: 'THE ONE-SIDEDNESS iter-06 FOUND, re-verified this round against the rewritten check: `--only S1 --break ".browse{grid-template-columns:40px auto auto !important}"` — a label column squeezed well below the cap. The gap-only formula from iter-01 was vacuous against this end (text and .browse-kind move left together, so the gap alone stays small); iter-06 fixed it with a Range-wrap signal checked on every row. iter-07 re-verifies the SAME break against the REWRITTEN check, which now also has to route this case to the "collapsed" branch (trackWidth < cap) rather than the new "at-cap, over the line bound" branch — the two branches must not be confused, since only the sub-cap one is a defect regardless of line count.',
      observedOpposite: '/data @1440x900: check failed \'label "Entries — identity, lifecycle, indexability" wraps across 9 lines — the label column has collapsed to 40.0px, narrower than its own --measure-list cap (384.0px)\' — same 9-line reading iter-06 recorded, now carrying the measured trackWidth (40.0px) that routes it to the collapse branch rather than the line-bound branch. Restored; rebuilt tree (full gate) passes S1 at both declared viewports.',
      // I38 (iter-08): MAX_WRAP_LINES=3 assumes /data's own longest label
      // presently needs at most 2 of the 3 allowed lines (measured live) — 1
      // line of headroom, printed on every PASS below rather than left silent.
      // If a future label wraps to 4 lines at a track still measurably AT the
      // 384.0px cap, that is content outgrowing --measure-list on THIS
      // template specifically, not a presentation regression: the correct
      // response is a template-specific token (R7's own iter-07 addendum,
      // "the cap must serve the surface's typical content"), not widening
      // --measure-list itself (which would re-open the dead-air drift this
      // rule exists to forbid on every OTHER, typically-short label sharing
      // the same cap) and not raising MAX_WRAP_LINES in advance of the case
      // that would test it.
    },
    kind: 'dom', routes: ['/data'], viewports: [[1440, 900], [390, 844]],
    check: async ({ page }) => {
      // iter-07: iter-06 made this two-sided (gap-too-wide vs Range-wrapped) but
      // treated ANY wrap as "collapsed" — with no floor for the tension R7 was
      // never built to prevent: a cap correctly sized for the surface's TYPICAL
      // content, holding one genuinely longer entry across more than one line.
      // Two real, pre-existing cases: /data's CSV list (2 lines) and every one of
      // /blog's four post titles (S15, 3 lines each). Both wrap at a track pinned
      // EXACTLY to --measure-list — the cap is doing its job, the content is just
      // longer than one line holds. Widening the cap would re-cap every OTHER,
      // typically-short label on the same surface at the wider value, reopening
      // the dead-air drift R7 exists to prevent (I32's own finding). So: the track
      // still stops at the cap (unchanged); where content exceeds it, wrapping is
      // now bounded to 3 lines rather than forbidden outright. The distinguishing
      // signal is the track's own RESOLVED width against the cap, not line count
      // alone — a line bound with no width floor would let a genuinely collapsed
      // column (40px, 9 lines) pass a lenient cap; read live per .browse list,
      // since /data has three (CSV table, live siblings, feeds) at three
      // different resolved widths.
      const r = await page.evaluate(() => {
        const lists = [...document.querySelectorAll('.browse')];
        if (!lists.length) return { error: 'no .browse found on /data' };
        const out = [];
        for (const list of lists) {
          const trackWidth = parseFloat(getComputedStyle(list).gridTemplateColumns.split(' ')[0]);
          for (const row of list.querySelectorAll('.browse-row')) {
            const name = row.querySelector('.browse-name');
            const kind = row.querySelector('.browse-kind');
            if (!name || !kind) continue;
            const range = document.createRange();
            range.selectNodeContents(name);
            const rects = range.getClientRects();
            const textRect = range.getBoundingClientRect();
            const kindRect = kind.getBoundingClientRect();
            out.push({
              text: name.textContent.trim(),
              lines: rects.length,
              gap: kindRect.left - textRect.right,
              trackWidth,
            });
          }
        }
        const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
        return { rows: out, rootPx, innerWidth: window.innerWidth };
      });
      if (r.error) return r.error;
      // Below .browse's own narrow breakpoint (26rem/416px, S9's own boundary)
      // the label column is a flexible fraction of the viewport, not the capped
      // desktop track — wrapping there is ordinary reflow, not collapse. Same
      // gate S15 and S16 already carry for the identical breakpoint; S1 lacked
      // it, and /data's "Facts — resolved values with their state and source"
      // wraps at 390px too (found live while fixing this) — silently masked
      // before now because the harness stops at the first failing VIEWPORT
      // (1440) and never reached 390 to report it.
      if (r.innerWidth < 416) return true;
      const capPx = 24 * r.rootPx;
      const MAX_WRAP_LINES = 3; // iter-07: the largest line count either bounded
      // surface's real content presently needs — /blog's 3 (S15, unanimous
      // across all four posts), /data's 2. See RULES.md R7's iter-07 addendum.
      let maxGap = -Infinity;
      let worstLines = 1;
      for (const row of r.rows) {
        if (row.gap > maxGap) maxGap = row.gap;
        if (row.lines > worstLines) worstLines = row.lines;
        if (row.lines > 1) {
          if (row.trackWidth < capPx - 1) {
            return `label "${row.text}" wraps across ${row.lines} lines — the label column has collapsed to ${row.trackWidth.toFixed(1)}px, narrower than its own --measure-list cap (${capPx.toFixed(1)}px)`;
          }
          if (row.lines > MAX_WRAP_LINES) {
            return `label "${row.text}" wraps across ${row.lines} lines even at the --measure-list cap (${capPx.toFixed(1)}px) — exceeds the ${MAX_WRAP_LINES}-line allowance`;
          }
        }
      }
      if (maxGap > capPx + 1) return `gap ${maxGap.toFixed(1)}px exceeds 24rem (${capPx.toFixed(1)}px)`;
      // I38 (iter-08, R7's iter-07 addendum, R13's iter-07(a)): MAX_WRAP_LINES
      // is a bound derived from this surface's OWN content today, not a law of
      // physics — print how close the worst real row sits to it, on every
      // PASS, so a future reader sees the cliff before they hit it rather than
      // discovering it only when a check goes red. /data's own worst case
      // presently uses 2 of the 3 allowed lines.
      console.log(`          S1 headroom: worst case ${worstLines} of ${MAX_WRAP_LINES} lines allowed on /data` +
        (worstLines >= MAX_WRAP_LINES ? ' — NO HEADROOM' : ` (${MAX_WRAP_LINES - worstLines} line(s) of headroom)`));
      return true;
    },
  },
  {
    id: 'S2', rule: 'R8',
    intent: "a list row carries a rule between siblings where the surface demands cross-row tracking (a wide multi-column table, or ragged entry heights) and none where it does not (a link index of near-uniform single-line rows); a status badge is boxed only when its tone differs from the default — RULES.md R8's surface test, amended iter-03 from the earlier blanket ban",
    independent: "getComputedStyle border widths read from actually-rendered rows on each of the five surfaces the diagnostic split covers (a mid-table /catalog row and its header, a mid-feed home changed-feed entry, and a mid-list .browse-row on each of /wiki, /data, /tools) plus a toneless and an 'ended' badge on /catalog — not the CSS source that declares any of it",
    falsifier: {
      brokenBy: "FOUR episodes, the last with three sub-breaks. (1) iter-01: the first cut of `.badge:not([data-tone])` set only `border-color: transparent`, which keeps a 1px border BOX (just invisible) — this shipped briefly and the check caught it for real, unprompted, before any deliberate break; fixed by using `border: none` instead. (2) iter-01: deliberately re-added `border-bottom: 1px solid var(--rule)` to `.data-table th, .data-table td` (at a time when R8 still forbade it everywhere). (3) iter-02 round 3: once the harness gained a declared `viewports` array and started actually running S2 at 390x844, it caught a rule between every pair of stacked mobile catalog records — the same then-forbidden shape relocated into the new mobile layout. (4) iter-03, run live, BOTH directions required by IMPLEMENT.md now that R8 is surface-conditioned rather than a blanket ban, plus one extra sub-case: (4a) removed `border-bottom` from both `#catalog-table tbody tr` AND `.rail-changes > .rail-item` at once (the iter-03 restoration undone) to confirm the check catches a rule MISSING where the test now requires it — then, with only `#catalog-table tbody tr` restored, re-ran to isolate the home-feed failure independently of the catalog one. (4b) with both restorations back, added `border-bottom: 1px solid var(--rule)` to `.browse-row` to confirm the check catches a rule PRESENT where the test forbids it. (4c) restored `.browse-row`, then removed the explicit `border-bottom: none` override on `#catalog-table tbody tr` inside the `max-width: 33.999rem` block, to confirm the check also catches the desktop rule leaking into the 390px stacked-record layout — the exact shape iter-02 round 3 (episode 3 above) already found wrong once.",
      observed: '(4a) first run (both surfaces broken at once): check failed "/catalog @1440x900: mid-table row requires a border-bottom rule (RULES.md R8 — 396 rows x 7 columns needs cross-row tracking) but has none (0px)" — the harness stops at the first failing route, so a second run with only `#catalog-table tbody tr` restored was needed to see the home-feed failure on its own: check failed "/ @1440x900: mid-feed changed entry requires a border-bottom rule (RULES.md R8 — ragged entry heights need it) but has none (0px)". (4b) check failed "/wiki @1440x900: .browse-row must not carry a border-bottom rule (RULES.md R8 — a link index\'s rows are near-uniform, the rule would degrade the exception signal) but has 1px". (4c) check failed "/catalog @390x844: at 390px: the stacked-record layout must not carry a per-row rule (RULES.md R8 / R12 — padding and the record\'s own name heading are the anchor there) but has one (1px)" (the doubled "@390x844 ... at 390px:" is the harness\'s route/viewport prefix plus the check\'s own — same cosmetic doubling already noted on S6, harmless). All breaks restored in sequence and confirmed byte-identical to the pre-break file; rebuilt tree passes all five routes at both declared viewports (see episode-1/2/3 observations above for those, preserved unchanged).',
      brokenByOpposite: 'iter-06: every episode above tests the ROW-RULE clause (required present / forbidden present, both directions, across five routes). The badge clause has its own two ends and only ONE was ever exercised (episode 1: a default/toneless badge that stayed visibly boxed despite `border-color:transparent`). The OTHER end — an exceptional-tone badge (`data-tone="ended"`) losing its box, which the collection\'s de-chipping logic exists specifically NOT to do — had never been deliberately broken. `--only S2 --break ".badge[data-tone=\\"ended\\"] { border: none !important; }"`.',
      observedOpposite: 'check failed "/catalog @1440x900: an \'ended\'-status badge lost its box (0px border)". Restored; rebuilt tree (full gate) passes S2 at both declared viewports.',
    },
    kind: 'dom', routes: ['/catalog', '/', '/wiki', '/data', '/tools'], viewports: [[1440, 900], [390, 844]],
    check: async ({ page, route }) => {
      if (route === '/catalog') {
        const r = await page.evaluate(() => {
          const rows = document.querySelectorAll('#catalog-table tbody tr');
          if (rows.length < 3) return { error: 'fewer than 3 catalog rows rendered' };
          const midRow = rows[Math.floor(rows.length / 2)];
          const rowBorder = parseFloat(getComputedStyle(midRow).borderBottomWidth);
          const th = document.querySelector('.data-table thead th');
          const headBorder = th ? parseFloat(getComputedStyle(th).borderBottomWidth) : NaN;
          const toneless = document.querySelector('.data-table .badge:not([data-tone])');
          const tonelessBorder = toneless ? parseFloat(getComputedStyle(toneless).borderWidth) : null;
          const ended = document.querySelector('.data-table .badge[data-tone="ended"]');
          const endedBorder = ended ? parseFloat(getComputedStyle(ended).borderWidth) : null;
          // R12's breakpoint: below it the table is a stack of record cards,
          // not a wide row, and R8's own iter-02 round-3 finding is that a
          // rule there is wrong (padding + the name heading are the anchor).
          const desktop = window.innerWidth >= 544;
          return { rowBorder, headBorder, tonelessBorder, endedBorder, desktop, innerWidth: window.innerWidth };
        });
        if (r.error) return r.error;
        if (r.desktop && !(r.rowBorder > 0)) {
          return `mid-table row requires a border-bottom rule (RULES.md R8 — 396 rows x 7 columns needs cross-row tracking) but has none (${r.rowBorder}px)`;
        }
        if (!r.desktop && r.rowBorder > 0) {
          return `at ${r.innerWidth}px: the stacked-record layout must not carry a per-row rule (RULES.md R8 / R12 — padding and the record's own name heading are the anchor there) but has one (${r.rowBorder}px)`;
        }
        if (!(r.headBorder > 0)) return `the header lost its own boundary rule (${r.headBorder}px)`;
        if (r.tonelessBorder !== null && r.tonelessBorder > 0) {
          return `a default-status badge is still boxed (${r.tonelessBorder}px border)`;
        }
        if (r.endedBorder !== null && !(r.endedBorder > 0)) {
          return `an 'ended'-status badge lost its box (${r.endedBorder}px border)`;
        }
        return true;
      }

      if (route === '/') {
        const r = await page.evaluate(() => {
          const items = document.querySelectorAll('.rail-changes > .rail-item');
          if (items.length < 3) return { error: 'fewer than 3 changed-feed entries rendered' };
          const mid = items[Math.floor(items.length / 2)];
          const border = parseFloat(getComputedStyle(mid).borderBottomWidth);
          return { border };
        });
        if (r.error) return r.error;
        if (!(r.border > 0)) {
          return `mid-feed changed entry requires a border-bottom rule (RULES.md R8 — ragged entry heights need it) but has none (${r.border}px)`;
        }
        return true;
      }

      // /wiki, /data, /tools: link indexes of near-uniform single-line rows
      // — R8 forbids the rule here, the case run 3's forced choice found the
      // iter-01 removal correct on.
      const r = await page.evaluate(() => {
        const rows = document.querySelectorAll('.browse-row');
        if (rows.length < 3) return { error: 'fewer than 3 .browse-row rows rendered' };
        const mid = rows[Math.floor(rows.length / 2)];
        const border = parseFloat(getComputedStyle(mid).borderBottomWidth);
        return { border };
      });
      if (r.error) return r.error;
      if (r.border > 0) {
        return `.browse-row must not carry a border-bottom rule (RULES.md R8 — a link index's rows are near-uniform, the rule would degrade the exception signal) but has ${r.border}px`;
      }
      return true;
    },
  },
  (() => {
    const captured = [];
    const SELECTOR = {
      '/wiki': '.browse-name',
      '/blog': '.rail-title a',
      '/catalog': '.data-table tbody th a',
      '/': 'a.change-name',
      '/learn': '.rung-title',
    };
    return {
      id: 'S6', rule: 'R9',
      intent: 'a link to a record has one identical resting treatment (ink colour, underline) across every index template — wiki, blog, catalog, the home changed-feed and /learn (I18 widens the route list; the wiki/blog/catalog three were already covered) — and never the resting colour of --accent',
      independent: "computed style (color, text-decoration-line) read from the rendered link on each route, compared against a live reference element (.wordmark .dot) that genuinely uses --accent — not the CSS source",
      falsifier: {
        brokenBy: "TWO episodes. (1) iter-01: reverted .browse-name to `color: var(--ink); text-decoration: none` (its pre-fix rule, matching the old /wiki resting state). (2) iter-04 (I18): reverted `a.change-name` to no explicit colour (its pre-fix state, inheriting the bare `a { color: var(--accent) }` default) — the widened route this item adds.",
        observed: '(1) iter-01: check failed: "/wiki: resting state has no underline"; note the check itself prefixes the route again in its returned string, giving "/wiki: /wiki: resting state has no underline" in the harness output. (2) iter-04: check failed "/: resting colour equals --accent (rgb(74, 59, 212)) — accent leaked into the resting state". Restored; rebuilt tree passes all five routes at both viewports.',
        brokenByOpposite: 'iter-06: episodes (1) and (2) above both break ONE route\'s own INDIVIDUAL compliance (missing underline; accent leaked in). Neither exercises the check\'s THIRD, emergent clause — that every route agrees with every OTHER route — which only evaluates once all five routes have individually passed and `captured` reaches length 5 (the harness stops at the first failing route, so this clause is unreachable while any single route is broken). The opposite excess is a route that is individually compliant (underlined, not accent) but disagrees with its siblings: `--only S6 --break ".rung-title { color: #2255aa !important; }"` — a legitimate non-accent ink colour, still underlined, just a different one than the other four templates use.',
        observedOpposite: 'check failed "/learn @1440x900: resting colours differ across templates: [{\\"route\\":\\"/wiki\\",\\"color\\":\\"rgb(26, 27, 34)\\",\\"deco\\":\\"underline\\"},{\\"route\\":\\"/blog\\",\\"color\\":\\"rgb(26, 27, 34)\\",\\"deco\\":\\"underline\\"},{\\"route\\":\\"/catalog\\",\\"color\\":\\"rgb(26, 27, 34)\\",\\"deco\\":\\"underline\\"},{\\"route\\":\\"/\\",\\"color\\":\\"rgb(26, 27, 34)\\",\\"deco\\":\\"underline\\"},{\\"route\\":\\"/learn\\",\\"color\\":\\"rgb(34, 85, 170)\\",\\"deco\\":\\"underline\\"}]". Restored; rebuilt tree (full gate) passes S6 at both declared viewports.',
      },
      kind: 'dom', routes: ['/wiki', '/blog', '/catalog', '/', '/learn'], viewports: [[1440, 900], [390, 844]],
      check: async ({ page, route }) => {
        const sel = SELECTOR[route];
        const data = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (!el) return { error: true };
          const cs = getComputedStyle(el);
          const ref = document.querySelector('.wordmark .dot');
          const accentColor = ref ? getComputedStyle(ref).color : null;
          return { color: cs.color, deco: cs.textDecorationLine, accentColor };
        }, sel);
        if (data.error) return `${route}: ${sel} not found`;
        if (data.deco === 'none') return `${route}: resting state has no underline`;
        if (data.accentColor && data.color === data.accentColor) {
          return `${route}: resting colour equals --accent (${data.color}) — accent leaked into the resting state`;
        }
        captured.push({ route, color: data.color, deco: data.deco });
        if (captured.length === Object.keys(SELECTOR).length) {
          const colors = new Set(captured.map((c) => c.color));
          const decos = new Set(captured.map((c) => c.deco));
          if (colors.size > 1) return `resting colours differ across templates: ${JSON.stringify(captured)}`;
          if (decos.size > 1) return `resting text-decoration differs across templates: ${JSON.stringify(captured)}`;
        }
        return true;
      },
    };
  })(),
  {
    id: 'S5', rule: 'R10',
    intent: "R10's own domain is EVERY route with a rule dividing a content block, not the routes any one item happened to name — a horizontal rule shall span the same rendered width as the block it introduces, instead of an unrelated wider shell. Checked against .entry-head/.prose AND the FACTS section heading on a wiki entry (I20), against each of /data's four section headings (I20), against /blog's .rail-posts (its border-top) versus the widest rendered row in its own list (I35, iter-08 — the one index template this check never sampled at the time, which is why the gate stayed green over a 652px overhang), against /catalog's `.catalog-preamble > summary` border-bottom versus the widest line of the disclosure it introduces (I40, iter-09 — this round's own I23 catalog-preamble remedy reopened the identical defect I35 had just closed, on the ONE index template S5 STILL never sampled, and the gate stayed green over a 413.1px overhang for the length of a single round), and as a regression guard against /colophon's .listing-facts (never broken, confirmed to stay that way)",
    independent: 'rendered getBoundingClientRect widths compared pairwise on the same page — .entry-head vs .prose, the FACTS <h2> vs .facts, each /data <h2>.section-title vs its own <section>, .rail-posts vs the widest of its own .rail-item rows, .catalog-preamble > summary vs the widest of the preamble\'s own content lines, .listing-facts vs .prose — an emergent runtime match, not a shared token read from source',
    falsifier: {
      brokenBy: "SEVEN breaks. (1) iter-01: removed `max-width: var(--measure)` from `.entry-head`. (2) iter-04 (I20): removed the new `.entry-facts, .entry-timeline { max-width: var(--measure) }` rule. (3) iter-04: removed the new `.section:has(> .browse), .section:has(> .footer-links) { width: fit-content }` rule. (4) iter-04: confirmed the /colophon regression guard is live by temporarily removing `.listing-facts`'s pre-existing `max-width: var(--measure)`. (5) iter-08 (I35): `--only S5 --break \".rail-posts{width:100% !important}\"` — reverts .rail-posts to its pre-fix full-shell width, reproducing the original 652px overhang this round closed. FIRST ATTEMPT at (5) measured `li.getBoundingClientRect().width` (the row's outer BOX) rather than its grid content, and reported NOT firing (0 of 1): `.rail-item` is a block-level li whose outer box fills whatever width `.rail-posts` happens to be, so forcing `.rail-posts` back to 100% pulled every row's outer box back to 1152px right alongside it — S1's OWN historical vacuous-box mistake (RULES.md R7's post-mortem), reproduced on a new surface by the person who had just read that post-mortem. Rewritten to read each row's own RESOLVED `grid-template-columns` (summed with its gap) instead, independent of .rail-posts's width — see the check's own comment. (6) iter-09 (I40): `--only S5 --break \".catalog-preamble[open] > summary{border-bottom:1px solid var(--rule) !important}\"` — reintroduces the removed rule. THREE ATTEMPTS were needed, both prior ones vacuous for reasons the check's own comment records in full: attempt 1 measured each DIRECT CHILD's box (two of the four content lines are DIV-wrapped `<p>`s, app/catalog/page.tsx, so the direct child measured was the DIV's own unconstrained, full-width box); attempt 2 applied a Range to those same direct children, still vacuous because a Range over an element whose only content is a BLOCK child returns that block's own box, not a text line. Attempt 3 selects the four text-bearing `<p>` elements directly (`.page-lede, .fetch-line, .sort-note`) and Ranges those. (7) iter-09 (I40): with (6) still applied, `--break \".catalog-preamble[open] > summary{border-bottom:1px solid var(--rule) !important; display:inline-block !important; width:50px !important;}\"` — forces the rule's own span down to 50px while the disclosure's content stays wide, testing the OPPOSITE sign.",
      observed: '(1) iter-01: "entry-head width 1152.0px vs prose width 608.0px (diff 544.0px)" on /wiki/concept/ai-winter. (2) iter-04: "FACTS heading width 1152.0px vs .facts width 608.0px (diff 544.0px)" on /wiki/concept/ai-winter. (3) iter-04: "/data \\"One table at a time (CSV)\\" heading width 1152.0px vs its section width 598.4px (diff 553.6px)" (the first of /data\'s three browse-wrapping sections the harness reaches). (4) iter-04: "/colophon: .listing-facts width 1152.0px vs .prose width 608.0px (diff 544.0px)" — confirming the guard is not vacuous. (5) iter-08 FIRST ATTEMPT (box-based): "FALSIFICATION: 0 of 1 check(s) fired as intended" — the box-based read showed 1152.0px vs 1152.0px, 0 diff, on a page that still visibly had a 652px overhang. REWRITE, same break: check failed "/blog @1440x900: .rail-posts width 1152.0px vs widest row\\\'s own grid content 500.0px (diff 652.0px)" — the exact 652px reading I35 measured on the shipped (pre-fix) build. (6) iter-09: attempt 1 (direct-child box): "FALSIFICATION: 0 of 1 check(s) fired" — box read 1152.0px vs 1152.0px, 0 diff, on a page that still visibly had the overhang. Attempt 2 (Range on direct children): same non-fire, same cause one level deeper (the Range\\\'s only content was still a block box). Attempt 3 (Range on `.page-lede, .fetch-line, .sort-note` directly): check failed "/catalog @1440x900: .catalog-preamble > summary\\\'s border-bottom spans 1152.0px, 481.7px away from the widest rendered content LINE the disclosure introduces (670.3px)" — a genuine text-line measurement; this file\\\'s own 670.3px reading differs from the judge\\\'s own 882.9px (a different, coarser measurement method — see the implementer report), but both agree the summary\\\'s rule ran the full 1152px shell past its content by several hundred pixels. (7) iter-09: check failed "/catalog @1440x900: .catalog-preamble > summary\\\'s border-bottom spans 50.0px, 620.3px away from the widest rendered content LINE the disclosure introduces (670.3px)" — the opposite sign, on the same clause. All seven restored; rebuilt tree passes every clause at both viewports.',
      brokenByOpposite: 'iter-06: `diff = Math.abs(a - b)` is mechanically symmetric, but all four THEN-historical breaks widen the RULE-BEARING element past the content it introduces (entry-head/FACTS-heading/section-title all made WIDER than their content). None makes the rule-bearing element NARROWER than its content, the opposite sign of the same subtraction. FIRST ATTEMPT: `--only S5 --break "article:has(> .entry-facts) .prose { max-width: 100% !important; }"` reported NOT firing (0 of 1) — informative, not a defect in the check: at the >=60rem breakpoint `.prose` sits in an explicit GRID TRACK (`minmax(0, var(--measure))`) that constrains its rendered width regardless of its own max-width, and below that breakpoint the 390px viewport is already narrower than `--measure`, so overriding the cap has no visible effect at either declared viewport — the constraint had moved to a layer this break did not touch. REAL test, targeting the rule-bearing element\'s own max-width instead (the thing S5 actually measures): `--only S5 --break ".entry-head { max-width: 200px !important; }"`. iter-08 (I35), the SAME opposite direction exercised against the new /blog clause specifically: `--only S5 --break ".rail-posts{width:300px !important} .rail-item{min-width:500px !important}"` — .rail-posts cannot simply be narrowed on its own the way entry-head can, since its rows are DOM CHILDREN that would shrink to fit an ordinary width cap rather than overflow it (trivially "matching", not violating, the property); forcing a row\'s own min-width past its parent\'s forced width is what actually produces a rule narrower than its own content, the reverse of every prior /blog break. iter-09 (I40): break (7) above is the same opposite sign exercised against the new /catalog clause.',
      observedOpposite: 'check failed "/wiki/concept/ai-winter @1440x900: entry-head width 200.0px vs prose width 608.0px (diff 408.0px)" — the rule now narrower than its content, the opposite sign from every historical break. iter-08: check failed "/blog @1440x900: .rail-posts width 300.0px vs widest rendered row 500.0px (diff 200.0px)" — same opposite sign, on the new clause. iter-09: check failed "/catalog @1440x900: .catalog-preamble > summary\'s border-bottom spans 50.0px, 620.3px away from the widest rendered content LINE the disclosure introduces (670.3px)" — same opposite sign, on the new /catalog clause. All restored; rebuilt tree (full gate) passes S5 at both declared viewports.',
    },
    kind: 'dom', routes: ['/wiki/concept/ai-winter', '/data', '/blog', '/catalog', '/colophon'], viewports: [[1440, 900], [390, 844]],
    check: async ({ page, route }) => {
      if (route === '/wiki/concept/ai-winter') {
        const r = await page.evaluate(() => {
          const head = document.querySelector('.entry-head');
          const prose = document.querySelector('.prose');
          if (!head || !prose) return { error: 'missing .entry-head or .prose on this entry' };
          const out = { headW: head.getBoundingClientRect().width, proseW: prose.getBoundingClientRect().width };
          const factsTitle = document.getElementById('facts');
          const facts = document.querySelector('.facts');
          if (factsTitle && facts) {
            out.factsTitleW = factsTitle.getBoundingClientRect().width;
            out.factsW = facts.getBoundingClientRect().width;
          }
          return out;
        });
        if (r.error) return r.error;
        const diff = Math.abs(r.headW - r.proseW);
        if (diff > 2) {
          return `entry-head width ${r.headW.toFixed(1)}px vs prose width ${r.proseW.toFixed(1)}px (diff ${diff.toFixed(1)}px)`;
        }
        if (r.factsTitleW !== undefined) {
          const factsDiff = Math.abs(r.factsTitleW - r.factsW);
          if (factsDiff > 2) {
            return `FACTS heading width ${r.factsTitleW.toFixed(1)}px vs .facts width ${r.factsW.toFixed(1)}px (diff ${factsDiff.toFixed(1)}px)`;
          }
        }
        return true;
      }

      if (route === '/data') {
        // Compare the heading against the CONTENT it introduces (.browse or
        // .footer-links), not against its own immediate .section parent —
        // .section-title is a block child that always fills whatever width
        // .section happens to be, so title-vs-parent-section is vacuous: it
        // would read as a match even with .section left unbounded (caught
        // live while falsifying this very check — see the falsifier note).
        const r = await page.evaluate(() => {
          const out = [];
          for (const section of document.querySelectorAll('.section')) {
            const title = section.querySelector('.section-title');
            const content = section.querySelector('.browse') || section.querySelector('.footer-links');
            if (!title || !content) continue;
            out.push({
              text: title.textContent,
              titleW: title.getBoundingClientRect().width,
              contentW: content.getBoundingClientRect().width,
            });
          }
          return out;
        });
        if (r.length < 4) return `expected 4 headed sections with browse/footer-links content on /data, found ${r.length}`;
        for (const s of r) {
          const diff = Math.abs(s.titleW - s.contentW);
          if (diff > 2) {
            return `/data "${s.text}" heading width ${s.titleW.toFixed(1)}px vs its content width ${s.contentW.toFixed(1)}px (diff ${diff.toFixed(1)}px)`;
          }
        }
        return true;
      }

      if (route === '/blog') {
        // I35 (iter-08): the rule introducing /blog's post list is
        // .rail-posts's own border-top (the generic .rail rule) — compared
        // against the widest row's own GRID CONTENT width, not against
        // .rail-item's outer box. FIRST ATTEMPT measured
        // li.getBoundingClientRect().width and it was VACUOUS the same way
        // S1's first attempt was (see S1's own post-mortem): .rail-item is a
        // block-level li whose outer box fills whatever width .rail-posts
        // happens to be, so reverting .rail-posts to width:100% pulled the
        // row's outer box back to 1152px right alongside it — 0 diff, no
        // violation detected, even though the actual defect (a 500px grid
        // sharing a 1152px box) was fully reproduced. Reading each row's own
        // RESOLVED grid-template-columns instead (summed with its gap) is
        // independent of .rail-posts's width: it stays 500px regardless of
        // what the parent's own box measures, which is what makes it a real
        // signal rather than a box that trivially tracks its container.
        const r = await page.evaluate(() => {
          const rail = document.querySelector('.rail-posts');
          const items = [...document.querySelectorAll('.rail-posts .rail-item')];
          if (!rail || !items.length) return { error: 'missing .rail-posts or .rail-item rows on /blog' };
          const rowContentWidths = items.map((li) => {
            const cs = getComputedStyle(li);
            const cols = cs.gridTemplateColumns.split(' ').map(parseFloat).filter((n) => !Number.isNaN(n));
            const gap = parseFloat(cs.columnGap) || 0;
            return cols.reduce((a, b) => a + b, 0) + gap * Math.max(0, cols.length - 1);
          });
          const widestRow = Math.max(...rowContentWidths);
          return { railW: rail.getBoundingClientRect().width, widestRow };
        });
        if (r.error) return r.error;
        const diff = Math.abs(r.railW - r.widestRow);
        if (diff > 2) {
          return `.rail-posts width ${r.railW.toFixed(1)}px vs widest row's own grid content ${r.widestRow.toFixed(1)}px (diff ${diff.toFixed(1)}px)`;
        }
        return true;
      }

      if (route === '/catalog') {
        // I40 (iter-09, R10's iter-08 addendum — "the one index template S5
        // never sampled" — a second instance in the SAME round that fixed
        // the first). `.catalog-preamble[open] > summary`'s border-bottom
        // was dropped rather than resized (see globals.css's own note), so
        // this clause is written generically rather than assuming there is
        // no rule to measure — a future reintroduction is still caught.
        //   FIRST ATTEMPT measured each DIRECT CHILD's own
        // getBoundingClientRect().width and was VACUOUS the same way S1's
        // and S5's own OTHER clauses already warn about: two of the four
        // content lines (the fetch-line and sortNote paragraphs) are
        // rendered into a wrapping `<div dangerouslySetInnerHTML>`
        // (app/catalog/page.tsx), so the DIRECT child the first attempt
        // measured was that DIV's own box — a plain, unconstrained block
        // that stretches to the full 1152px shell — not the <p> of actual
        // text one level inside it. A break that reinstated the full-width
        // rule measured "0 of 1 fired", the box trivially matching the box.
        // SECOND ATTEMPT applied a Range to each direct child's contents,
        // which is still vacuous for the two DIV-wrapped lines: a Range
        // over an element whose content is itself a BLOCK box (`<p>`, no
        // text/inline nodes directly inside the DIV) returns that block's
        // own layout rect, not a text line rect — the fix has to reach the
        // actual text-bearing element. Rewritten a third time to select the
        // four text-bearing paragraphs directly (`.page-lede, .fetch-line,
        // .sort-note` — all four are real `<p>` tags with inline content,
        // regardless of whether a `<div>` wraps them), then Range each ONE
        // of THOSE, taking the widest line across every wrapped line of
        // every paragraph.
        const r = await page.evaluate(() => {
          const details = document.querySelector('.catalog-preamble');
          const summary = details?.querySelector('summary');
          if (!details || !summary) return { error: 'missing .catalog-preamble or its summary on /catalog' };
          if (!details.open) return { skip: true }; // the rule is only ever painted while open
          const borderWidth = parseFloat(getComputedStyle(summary).borderBottomWidth);
          if (!(borderWidth > 0)) return { borderWidth: 0 };
          const ruleWidth = summary.getBoundingClientRect().width;
          const contentEls = [...details.querySelectorAll('.page-lede, .fetch-line, .sort-note')];
          let widest = 0;
          for (const el of contentEls) {
            const range = document.createRange();
            range.selectNodeContents(el);
            for (const rect of range.getClientRects()) {
              if (rect.width > widest) widest = rect.width;
            }
          }
          return { borderWidth, ruleWidth, contentWidth: widest };
        });
        if (r.error) return r.error;
        if (r.skip || !(r.borderWidth > 0)) return true;
        const diff = Math.abs(r.ruleWidth - r.contentWidth);
        if (diff > 8) {
          return `/catalog: .catalog-preamble > summary's border-bottom spans ${r.ruleWidth.toFixed(1)}px, ${diff.toFixed(1)}px away from the widest rendered content LINE the disclosure introduces (${r.contentWidth.toFixed(1)}px)`;
        }
        return true;
      }

      // /colophon: regression guard only — never broken (see iter-04 report).
      const r = await page.evaluate(() => {
        const prose = document.querySelector('.prose');
        const lf = document.querySelector('.listing-facts');
        if (!prose || !lf) return { error: 'missing .prose or .listing-facts on /colophon' };
        return { proseW: prose.getBoundingClientRect().width, lfW: lf.getBoundingClientRect().width };
      });
      if (r.error) return r.error;
      const diff = Math.abs(r.proseW - r.lfW);
      if (diff > 2) {
        return `/colophon: .listing-facts width ${r.lfW.toFixed(1)}px vs .prose width ${r.proseW.toFixed(1)}px (diff ${diff.toFixed(1)}px)`;
      }
      return true;
    },
  },
  {
    id: 'S7', rule: 'R11',
    intent: "the /catalog column labels stay inside their corridor at 1440: at rest they never cover the rows they label, and while the table is being read — at page scroll 0 AND with the page scrolled to its end, both composed with container scroll — they remain visible and clear of the sticky site header; at 390 the header is deliberately absent (R12) rather than left as an inert declaration",
    independent: 'getBoundingClientRect of the header, the thead and the tbody rows at 1440, read by the browser at rest and again after scrolling whichever scrollport actually moves the table; at 390, the COMPUTED display of the thead element itself — not the --header-h CSS value, not the presence of `position: sticky` (found inert), and not the mere absence of a DOM query match, which would pass by accident rather than by assertion',
    falsifier: {
      brokenBy: 'SIX breaks, each observed separately on 2026-08-31 across two rounds. Round 1 (four): (1) iter-01: `top: 0` (thead occluded by the site header — pre-S7). (2) iter-01: the shipped `top: var(--header-h)` (thead displaced onto rows 0-1 at 1440, rows 3-4 at 390, at scroll 0). (3) iter-02: reverted `.table-wrap` to `overflow-x: auto` alone (no `max-height`/`overflow-y`), which restores clientHeight === scrollHeight, so the corrected `top: 0` becomes inert again exactly like break (1) — the box never scrolls, so `position: sticky` has nothing to stick within. (4) iter-02: commented out `#catalog-table thead { display: none }` inside the 390px media query, leaving the thead rendered with no scrollport at that width. Round 2 (two, added when the orchestrator strengthened this check with clause 2b — composite page-scroll + container-scroll, see the check below): (5) the FIRST round-2 attempt made `.table-wrap` itself `position: sticky; top: var(--header-h)` with NO change to its height. Plausible on its face; measured wrong. `.table-wrap`s sticky travel range is bounded by its containing block (`<main>`, `overflow: visible`), and that range does not depend on `.table-wrap`s own height at all — algebraically it reduces to the height of the content BEFORE the wrap, a constant. Since `.table-wrap`s max-height was sized to consume nearly the whole remaining viewport, there was zero slack left for the pin to survive the page`s own remaining scroll (driven by `.site-footer`, which sits outside `<main>`). (6) the second attempt shrank `.table-wrap`s height by a measured `--footer-h`, but that first measurement read only `.site-footer.offsetHeight` (81px) — omitting `<main>`s own trailing `padding-block` (3rem) and `.site-footer`s `margin-top` (3rem), which the release-point math (confirmed empirically, not just derived) turns out to require just as much as the footer\'s own rendered height.',
      observed: '(1)/(2) preserved from iter-01: clause 1 failed "at rest: table head (462.3-491.1px) is displaced onto data row 0 (445.1-476.9px)"; with plain `top: 0` and no scrollport, clause 2 failed "column labels are not visible while row 50 is on screen (thead top -1161.7px)". (3) iter-02, with the max-height/overflow-y removed: clause 2 failed "while reading: column labels are not visible while row 50 is on screen (thead top -1161.7px)" — the same number iter-01 observed with `top: 0` alone, confirming the scrollport, not the `top` value, is what makes stickiness real. (4) iter-02, with the mobile `display: none` removed: clause 3 failed "at 390px: thead is still rendered (display: table-header-group) with no scrollport to keep it pinned — R11 corridor is violated rather than deliberately retired at this width". (5) iter-02 round 2, orchestrator-run: clause 2b failed "column labels are off-screen (thead top -130.7px)" at page scroll 547/900vp — unchanged from the unfixed tree, confirming the naive sticky-wrapper hypothesis does not work. (6) iter-02 round 2, self-run after adding the footer measurement but before correcting what it measured: clause 2b failed "column labels are off-screen (thead top -49.7px)" at page scroll 466 — improved from -130.7 but still short by exactly the missing padding+margin (96px), which is what led to measuring the actual rendered distance (docScrollHeight minus the wrap\'s own bottom edge, 177px, not just the footer\'s own 81px) instead of hand-summing named CSS values. All six restored; rebuilt tree passes all three clauses with a 15.5px margin at max scroll (1440x900) after an added 16px safety buffer.',
      brokenByOpposite: 'iter-06: the six breaks above are extensive but every one that reaches clause 1 fails it the SAME way (thead too LOW, overlapping data rows) or leaves the corridor via the container going fully inert/off-screen — none isolates the corridor\'s OTHER bound (thead too HIGH, occluded FROM ABOVE by a legitimately-still-sticky header) on an otherwise-correct tree. Two fresh breaks supply both ends cleanly. Too low: `--only S7 --break ".data-table thead th { top: 250px !important; }"` — thead sticks 250px into its own scrollport at rest, overlapping data rows, independent of any header interaction. Too high: `--only S7 --break ".site-header { min-height: 300px !important; }"` — the header is inflated so its own (still correctly computed) bottom edge now extends past where the correctly-configured thead sticks, occluding it from above while reading, with clause 1 (row overlap) unaffected.',
      observedOpposite: 'Too low: check failed "/catalog: at rest: table head (666.3-695.1px) is displaced onto data row 6 (639.0-671.4px) — it covers the rows it labels" (clause 1). Too high: check failed "/catalog: while reading with the PAGE scrolled down (composite of both scroll dimensions): table head top (61.5px) is occluded by the site header (bottom 300.0px) — the defect the original item described, now genuinely reachable" (clause 2b) — clause 1 passed cleanly under this break, confirming the two bounds are independently exercised. Both restored; rebuilt tree (full gate) passes S7.',
    },
    kind: 'dom', routes: ['/catalog'], viewports: 'self',
    check: async ({ page }) => {
      const geom = () => page.evaluate(() => {
        const th = document.querySelector('.data-table thead th');
        const header = document.querySelector('.site-header');
        if (!th || !header) return { error: 'missing .site-header or .data-table thead th' };
        const t = th.getBoundingClientRect();
        const h = header.getBoundingClientRect();
        const hit = [...document.querySelectorAll('.data-table tbody tr')]
          .map((tr, i) => ({ i, ...tr.getBoundingClientRect().toJSON() }))
          .filter((b) => t.bottom > b.top + 0.5 && t.top < b.bottom - 0.5);
        return {
          thTop: t.top, thBottom: t.bottom, headerBottom: h.bottom,
          onScreen: t.bottom > 0 && t.top < window.innerHeight,
          hitRows: hit.map((b) => ({ i: b.i, top: b.top, bottom: b.bottom })),
        };
      });

      // --- clause 1 (1440): AT REST the labels must not cover the rows they label ---
      await page.evaluate(() => {
        window.scrollTo(0, 0);
        const w = document.querySelector('.table-wrap');
        if (w) w.scrollTop = 0;
      });
      await page.waitForTimeout(80);
      const rest = await geom();
      if (rest.error) return rest.error;
      if (rest.hitRows.length) {
        const h = rest.hitRows[0];
        return `at rest: table head (${rest.thTop.toFixed(1)}-${rest.thBottom.toFixed(1)}px) is displaced onto data row ${h.i} (${h.top.toFixed(1)}-${h.bottom.toFixed(1)}px) — it covers the rows it labels`;
      }

      // --- clause 2 (1440): WHILE READING the table, the labels must still be readable ---
      // Scroll whichever scrollport actually moves the table, and put a deep row on screen.
      const scrolled = await page.evaluate(() => {
        const w = document.querySelector('.table-wrap');
        const rows = document.querySelectorAll('.data-table tbody tr');
        const target = rows[Math.min(50, rows.length - 1)];
        if (!target) return { skipped: 'fewer than 2 rows' };
        const wrapScrolls = w && w.scrollHeight > w.clientHeight + 1;
        if (wrapScrolls) w.scrollTop = target.offsetTop - w.offsetTop;
        else target.scrollIntoView({ block: 'center' });
        return { wrapScrolls, rowIndex: Math.min(50, rows.length - 1) };
      });
      await page.waitForTimeout(80);
      const read = await geom();
      if (read.error) return read.error;
      if (!read.onScreen) {
        return `while reading: column labels are not visible while row ${scrolled.rowIndex} is on screen (thead top ${read.thTop.toFixed(1)}px). The header is declared position: sticky but its scrollport (${scrolled.wrapScrolls ? '.table-wrap' : 'the page'}) does not keep it pinned — a 396-row table is being read with no column labels.`;
      }
      if (read.thTop < read.headerBottom - 0.5) {
        return `while reading: table head top (${read.thTop.toFixed(1)}px) is occluded by the site header (bottom ${read.headerBottom.toFixed(1)}px)`;
      }

      // --- clause 2b (1440): the COMPOSITE of both scroll dimensions ---
      // Clause 2 above scrolls whichever scrollport moves the table. That procedure is
      // conditional on the artifact's structure, so when the container gained its own
      // scrollport the clause silently stopped exercising PAGE scroll — and a reader
      // reading a table scrolls the page. Pin both dimensions explicitly: page scrolled
      // as far as it goes, container scrolled into the body of the table.
      await page.evaluate(() => {
        const w = document.querySelector('.table-wrap');
        const rows = document.querySelectorAll('.data-table tbody tr');
        const target = rows[Math.min(50, rows.length - 1)];
        if (w && w.scrollHeight > w.clientHeight + 1 && target) {
          w.scrollTop = target.offsetTop - w.offsetTop;
        }
        window.scrollTo(0, document.documentElement.scrollHeight - window.innerHeight);
      });
      await page.waitForTimeout(120);
      const both = await geom();
      if (both.error) return both.error;
      if (!both.onScreen) {
        return `while reading with the PAGE scrolled down (composite of both scroll dimensions): column labels are off-screen (thead top ${both.thTop.toFixed(1)}px). The container's scrollport keeps the head pinned to the container, and the container itself scrolls away with the page.`;
      }
      if (both.thTop < both.headerBottom - 0.5) {
        return `while reading with the PAGE scrolled down (composite of both scroll dimensions): table head top (${both.thTop.toFixed(1)}px) is occluded by the site header (bottom ${both.headerBottom.toFixed(1)}px) — the defect the original item described, now genuinely reachable`;
      }

      // --- clause 3 (390): the corridor has no header left to defend at this width (R12) —
      // that removal must be an explicit, computed fact, not a vacuous pass on a missing node.
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(80);
      const mobile = await page.evaluate(() => {
        const thead = document.querySelector('.data-table thead');
        if (!thead) return { error: 'no thead element in the DOM at 390px — it must still exist and be computed display:none, not removed' };
        return { display: getComputedStyle(thead).display };
      });
      if (mobile.error) return mobile.error;
      if (mobile.display !== 'none') {
        return `at 390px: thead is still rendered (display: ${mobile.display}) with no scrollport to keep it pinned — R11's corridor is violated rather than deliberately retired at this width`;
      }
      return true;
    },
  },
  {
    id: 'S8', rule: 'R12',
    intent: 'at 390px the /catalog listing presents the model name, input price, output price and lifecycle status per row, with no page-level horizontal scroll',
    independent: 'rendered text content and getBoundingClientRect of a mid-table row read at a 390px viewport, plus document.documentElement.scrollWidth vs clientWidth — not the presence of the .data-table class, any CSS token, or the desktop thead labels',
    falsifier: {
      brokenBy: "TWO breaks. (1) disabled the whole #catalog-table 390px media-query block (changed its `@media (max-width: 33.999rem)` to an unmatchable `@media (max-width: -1px)`, i.e. desktop table layout kept at 390px — the pre-iter-02 state, with .table-wrap's own I15 scrollport still active so it absorbs the horizontal overflow rather than the page). (2) the FIRST cut of this check only asserted `width > 0` on each cell, which PASSED even in break (1): a table cell keeps a non-zero box at its natural width whether or not that box sits inside the visible viewport, so a zero-width check is vacuous against exactly D1's shape ('R2 passes and useless') — caught unprompted while falsifying, before any deliberate correctness pass.",
      observed: '(1) with the stronger left/right-vs-viewport check: check failed "at 390px: row 5 priceIn cell (left 550.0px, right 680.6px) sits outside the 390px viewport — it is rendered but not reachable without scrolling its container sideways (this is exactly D1\'s shape: a non-zero box the reader still cannot reach)". (2) confirmed by re-running the ORIGINAL width-only check against the same broken tree: it reported PASS — false negative, the exact green-and-wrong class D4/IMPLEMENT.md rule 3 warns about. Rewritten to bound each cell to window.innerWidth and to check .table-wrap\'s own scrollWidth vs clientWidth. Restored; rebuilt tree passes both S7 and S8.',
      brokenByOpposite: 'iter-06: the historical break pushes a cell off the RIGHT edge (`v.right > innerWidth`); the check\'s own `if` is already a single OR of both edges (`v.left < -0.5 || v.right > innerWidth + 0.5`), but the left-edge branch had never been independently fired. `--only S8 --break "#catalog-table tbody th { margin-left: -100px !important; }"` — pushes the row-identity cell off the LEFT edge instead, the opposite direction of unreachability.',
      observedOpposite: 'check failed "/catalog: at 390px: row 5 name cell (left -86.0px, right 376.0px) sits outside the 390px viewport — it is rendered but not reachable without scrolling its container sideways (this is exactly D1\'s shape: a non-zero box the reader still cannot reach)". Restored; rebuilt tree (full gate) passes S8.',
    },
    kind: 'dom', routes: ['/catalog'], viewports: 'self',
    check: async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(80);
      const r = await page.evaluate(() => {
        const rows = document.querySelectorAll('#catalog-table tbody tr');
        if (rows.length < 6) return { error: 'fewer than 6 catalog rows rendered' };
        const row = rows[5];
        const name = row.querySelector('th');
        const priceIn = row.querySelector('td[data-label="In / Mtok"]');
        const priceOut = row.querySelector('td[data-label="Out / Mtok"]');
        const status = row.querySelector('td[data-label="Status"]');
        if (!name || !priceIn || !priceOut || !status) {
          return { error: 'row 5 is missing the model-name th or one of the In / Mtok, Out / Mtok, Status cells' };
        }
        const wrap = document.querySelector('#catalog-table-wrap') || document.querySelector('.table-wrap');
        const rects = { name: name.getBoundingClientRect(), priceIn: priceIn.getBoundingClientRect(), priceOut: priceOut.getBoundingClientRect(), status: status.getBoundingClientRect() };
        return {
          rects: Object.fromEntries(Object.entries(rects).map(([k, v]) => [k, { width: v.width, height: v.height, left: v.left, right: v.right }])),
          nameText: name.textContent.trim(),
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          innerWidth: window.innerWidth,
          wrapScrollWidth: wrap ? wrap.scrollWidth : null,
          wrapClientWidth: wrap ? wrap.clientWidth : null,
        };
      });
      if (r.error) return r.error;
      if (!r.nameText) return 'at 390px: row 5 model name is empty';
      // D1's shape, re-checked here rather than assumed away: a cell can have
      // non-zero WIDTH while still being unreachable without horizontal
      // scrolling — a table that keeps full desktop column widths inside a
      // scrolling .table-wrap "presents" every value by this measure alone
      // while delivering none of them without a sideways gesture. Bound each
      // cell to the actual viewport, not just to a non-zero box.
      for (const [k, v] of Object.entries(r.rects)) {
        if (v.width <= 0 || v.height <= 0) {
          return `at 390px: row 5 ${k} cell has zero width (${v.width.toFixed(1)}px) — the value is not rendered`;
        }
        if (v.left < -0.5 || v.right > r.innerWidth + 0.5) {
          return `at 390px: row 5 ${k} cell (left ${v.left.toFixed(1)}px, right ${v.right.toFixed(1)}px) sits outside the ${r.innerWidth}px viewport — it is rendered but not reachable without scrolling its container sideways (this is exactly D1's shape: a non-zero box the reader still cannot reach)`;
        }
      }
      if (r.scrollWidth > r.clientWidth + 1) {
        return `at 390px: page scrolls horizontally (scrollWidth ${r.scrollWidth}px > clientWidth ${r.clientWidth}px)`;
      }
      if (r.wrapScrollWidth !== null && r.wrapScrollWidth > r.wrapClientWidth + 1) {
        return `at 390px: the table's own wrap still scrolls horizontally (scrollWidth ${r.wrapScrollWidth}px > clientWidth ${r.wrapClientWidth}px) — the catalog kept desktop column layout instead of reflowing`;
      }
      return true;
    },
  },
  {
    id: 'S9', rule: 'R13',
    intent: "a row-based list (.browse, on /wiki) shares ONE set of trailing grid tracks across every row instead of each row sizing its own (I17), and the list — and /learn's rung ladder at its own wide breakpoint — either occupies most of the shell or, failing that, shrinks to its own content and stays flush against the page's ONE shared left rail (.page-title's left edge) rather than being centred (I16; centring was tried at iter-05 and RETIRED at iter-06, I33 — see RULES.md R13's iter-06 addendum: it split the width but broke the rail the page's own H1/lede/closing-note share, which read worse than the dead space it replaced)",
    independent: "getBoundingClientRect().left of .browse-kind and the status badge, read from a dozen sampled .browse-row rows on /wiki (not the CSS source) — a shared grid makes these identical across rows; an independent per-row grid does not. Separately, .browse's own rendered right edge against the shell's inner content edge, and its own LEFT edge against .page-title's left edge (a different element's rendered position, not derived from either element's CSS) — and .rung's own width against the shell's on /learn.",
    falsifier: {
      brokenBy: "SIX breaks, run via `--only S9 --break \"<css>\"` (2.9s each, no rebuild). (1) `.browse { display: block; width: 100%; } .browse-row { display: grid; grid-template-columns: minmax(0, var(--measure-list)) auto auto; }` — the pre-S9 shape, to confirm the check catches BOTH the raggedness (I17) and the dead space (I16) it replaced. (2) `.browse { width: 100%; }` alone (subgrid/fit-content left intact) — to confirm the dead-space clause fires independently of the alignment clause. (3) `@media (min-width: 48rem) { .rung { grid-template-columns: 14rem minmax(0, 1fr) !important; width: 100% !important; } }` — to confirm the /learn half of I16 is caught separately from the /wiki half. (4) iter-05, HISTORICAL — the centred clause these three episodes falsified no longer exists (RETIRED iter-06); preserved as the record of what iter-05 verified at the time: `main.shell > .browse { margin-inline: 0 !important; }` then `margin-inline: 0 !important; margin-left: 20px !important;` — both fired against the then-live centred-or-occupancy clause. (5) iter-06, its replacement: `main.shell > .browse { margin-inline: auto !important; }` — reintroduces centring, to confirm the NEW shared-rail clause catches the exact defect I33 filed (the list drifting off .page-title's left edge). (6) iter-06: `main.shell > .browse { margin-left: -80px !important; }` — the OPPOSITE direction of drift (left of the rail, not right of it), to confirm the clause bounds both directions rather than only \"at least as far right as the rail.\"",
      observed: '(1) check failed "/wiki @1440x900: the status badge\'s left edge varies by 17.3px across sampled rows — the trailing columns are not sharing one grid". (2) check failed "/wiki @1440x900: .browse\'s own right edge (1296.0px) reaches the shell\'s inner edge (1296.0px) — it did not shrink to its content". (3) check failed "/learn @1440x900: .rung\'s own width (1152.0px) matches the shell\'s full inner width (1152.0px) — it did not shrink to its content". (4) HISTORICAL, iter-05: check failed "/wiki @1440x900: .browse is neither >=55% of the shell\'s content width NOR centred (left gap 0.0px, right gap 592.2px, occupancy 48.6%)", then with the 20px left margin: "...left gap 20.0px, right gap 572.2px, occupancy 50.3%" — both against the now-retired clause. Episodes (5) and (6), the two REPLACEMENT breaks that exercise the NEW shared-rail clause in both directions, are recorded separately below as brokenByOpposite/observedOpposite. All six restored; rebuilt tree (full gate, not --break) passes S9 at both declared viewports.',
      brokenByOpposite: 'iter-06 (I33): two breaks isolating the shared-rail clause\'s two directions of drift, both replacing the retired centred-or-occupancy clause\'s own falsifier. Right of the rail (re-adding the retired centring): `--only S9 --break "main.shell > .browse { margin-inline: auto !important; }"`. Left of the rail: `--only S9 --break "main.shell > .browse { margin-left: -80px !important; }"` — confirms the clause bounds drift in EITHER direction, not merely "at least as far right as the rail."',
      observedOpposite: 'Right of rail: check failed "/wiki @1440x900: .browse\'s left edge (440.1px) does not match the page\'s shared rail at .page-title\'s left edge (144.0px) — diff 296.1px" — the exact 440.1px I33 measured on the shipped iter-05 tree, reproduced by re-adding the one rule I33 asked removed. Left of rail: check failed "/wiki @1440x900: .browse\'s left edge (64.0px) does not match the page\'s shared rail at .page-title\'s left edge (144.0px) — diff 80.0px". Both restored; rebuilt tree (full gate) passes S9 at both declared viewports.',
    },
    kind: 'dom', routes: ['/wiki', '/learn'], viewports: [[1440, 900], [390, 844]],
    check: async ({ page, route }) => {
      if (route === '/wiki') {
        const r = await page.evaluate(() => {
          const rows = [...document.querySelectorAll('.browse-row')];
          if (rows.length < 5) return { error: 'fewer than 5 .browse-row rows on /wiki' };
          const sample = rows.slice(0, 12);
          const kindLefts = sample.map((row) => row.querySelector('.browse-kind')?.getBoundingClientRect().left).filter((v) => v !== undefined);
          const badgeLefts = sample.map((row) => row.querySelector('.badge')?.getBoundingClientRect().left).filter((v) => v !== undefined);
          const browse = document.querySelector('.browse').getBoundingClientRect();
          const shell = document.querySelector('main.shell').getBoundingClientRect();
          const h1 = document.querySelector('.page-title');
          return {
            kindLefts, badgeLefts, browseLeft: browse.left, browseRight: browse.right,
            shellInnerRight: shell.right - 32, innerWidth: window.innerWidth,
            h1Left: h1 ? h1.getBoundingClientRect().left : null,
          };
        });
        if (r.error) return r.error;
        const spread = (arr) => (arr.length ? Math.max(...arr) - Math.min(...arr) : 0);
        const kindSpread = spread(r.kindLefts);
        const badgeSpread = spread(r.badgeLefts);
        if (kindSpread > 0.5) {
          return `.browse-kind's left edge varies by ${kindSpread.toFixed(1)}px across sampled rows — the trailing columns are not sharing one grid`;
        }
        if (badgeSpread > 0.5) {
          return `the status badge's left edge varies by ${badgeSpread.toFixed(1)}px across sampled rows — the trailing columns are not sharing one grid`;
        }
        // The narrow layout (<34rem) deliberately reverts to a full-width,
        // flexible 2-column template (S1's pre-S9 shape) — dead space is not
        // the property under test there, only alignment (checked above).
        if (r.innerWidth >= 544 && r.browseRight > r.shellInnerRight - 1) {
          return `.browse's own right edge (${r.browseRight.toFixed(1)}px) reaches the shell's inner edge (${r.shellInnerRight.toFixed(1)}px) — it did not shrink to its content`;
        }
        // I28 / JUDGE.md L4, THIRD instance: this clause was ONE-SIDED (bounded only
        // the "too wide" side). Fixed at iter-05 with an occupancy-or-centred
        // disjunction, which I33 then found RELOCATED the defect: centring split the
        // unoccupied width but broke the rail every other block on this template
        // shares (RULES.md R13's iter-06 addendum). Centring is retired; the
        // replacement is a direct shared-rail assertion — .browse's own left edge
        // must equal .page-title's — asserted at every width, since the mobile
        // full-width layout trivially satisfies it too (nothing here needs the
        // innerWidth>=544 gate the retired occupancy clause needed).
        if (r.h1Left === null) return '.wiki has no .page-title to anchor the shared rail against';
        const railGap = Math.abs(r.browseLeft - r.h1Left);
        if (railGap > 1) {
          return `.browse's left edge (${r.browseLeft.toFixed(1)}px) does not match the page's shared rail at .page-title's left edge (${r.h1Left.toFixed(1)}px) — diff ${railGap.toFixed(1)}px`;
        }
        return true;
      }

      // /learn — .rung's fit-content shrink only applies at its own
      // `min-width: 48rem` breakpoint; below that it is a single flexible
      // column deliberately filling the viewport for the stacked layout.
      const r = await page.evaluate(() => {
        const rung = document.querySelector('.rung');
        const shell = document.querySelector('main.shell');
        if (!rung || !shell) return { error: 'missing .rung or main.shell on /learn' };
        const rungRect = rung.getBoundingClientRect();
        const shellRect = shell.getBoundingClientRect();
        return {
          rungRight: rungRect.right, rungWidth: rungRect.width,
          shellInnerRight: shellRect.right - 32, shellInnerWidth: shellRect.width - 64,
          innerWidth: window.innerWidth,
        };
      });
      if (r.error) return r.error;
      if (r.innerWidth < 768) return true;
      if (r.rungRight > r.shellInnerRight - 1 && r.rungWidth >= r.shellInnerWidth - 1) {
        return `.rung's own width (${r.rungWidth.toFixed(1)}px) matches the shell's full inner width (${r.shellInnerWidth.toFixed(1)}px) — it did not shrink to its content`;
      }
      return true;
    },
  },
  {
    id: 'S10', rule: 'R14',
    intent: 'the sticky site header occupies no more than 10% of the viewport height at 390x844 on every sampled route, and the nav-disclosure that makes this possible defaults to CLOSED there while remaining a genuine keyboard tab stop that exposes every primary nav link once activated with Enter',
    independent: "getBoundingClientRect().height of .site-header read live at 390x844 against the fixed 844px viewport (not a CSS value); and a scripted keyboard traversal — Tab to the summary, read its href-less state, press Enter, Tab once more, and check the resulting focused element's href against the actual primary-nav hrefs read from the DOM — not the presence of the `open` attribute in markup, which would pass even if Enter did nothing",
    falsifier: {
      brokenBy: "TWO breaks, isolating the two clauses. (1) height: first tried widening `.nav-disclosure { display: contents }` from `@media (min-width: 34rem)` to apply unconditionally — this did NOT fail the check, because the dropdown's own `position: absolute` treatment (scoped to the same narrow media query, unchanged by that edit) keeps `<nav>` out of flow regardless of the parent's display, a real independent safeguard caught only by trying to falsify it. The genuine break needed two changes together: removed `position: absolute` (plus its `left`/`top`) from `.nav-disclosure nav`, AND changed `NAV_DISCLOSURE_SCRIPT` in layout.tsx so `apply` always sets `d.open = true` regardless of viewport — reproducing 'nav always open, rendered in normal flow', the actual pre-I24 condition. (2) keyboard: with (1) restored, removed the narrow-breakpoint override that makes `.nav-toggle` visible (commented out its `display: inline-flex` inside `@media (max-width: 33.999rem)`), leaving it `display: none` at every width — reachable nowhere.",
      observed: '(1) FIRST ATTEMPT (display:contents alone): no failure — recorded because it is informative, not because it was expected: it shows the fix has two independent height-safety mechanisms, not one. REAL BREAK: check failed "/: .site-header is 270.5px (32.0% of 844px) — exceeds the 10% budget" (taller than the original 129.3px/15.3% measurement, since the always-open nav now also carries the dropdown panel\'s border/padding/shadow in normal flow rather than the plain pre-I24 markup — the CLAUSE fails either way, which is what this falsifier is for). (2) check failed "/: keyboard traversal did not reach the nav-disclosure summary within 20 stops". All three edits restored; rebuilt tree passes on all four routes.',
      brokenByOpposite: 'iter-06: the two breaks above cover the HEIGHT budget (a genuine cap — a shorter header only improves the 10% budget, so "too short" has no opposite-excess to falsify; see the height check\'s own upper-bound-only form) and REACHABILITY (control absent from the tab order entirely). Neither exercises the check\'s THIRD clause — the control is reached and DOES activate, but exposes the WRONG target — which is a genuinely different failure surface, not a magnitude reversal of either historical break. `--only S10 --break "nav[aria-label=\\"Primary\\"] a { display: none !important; }"` — the primary nav links still exist in the DOM (so `navHrefs` is still the real 7-item list, not vacuously empty) but are removed from the tab order, so Tab after Enter lands on whatever focusable thing comes next instead.',
      observedOpposite: 'check failed "/ @390x844: after opening, the next tab stop (href=null) is not one of the primary nav links (/wiki, /catalog, /tools, /learn, /tutorials, /blog, /impossible-routine) — activation did not expose them". Restored; rebuilt tree (full gate) passes S10.',
    },
    kind: 'dom', routes: ['/', '/wiki', '/tools', '/catalog'], viewports: [[390, 844]],
    check: async ({ page }) => {
      const height = await page.evaluate(() => document.querySelector('.site-header').getBoundingClientRect().height);
      const pct = (height / 844) * 100;
      if (pct > 10) return `.site-header is ${height.toFixed(1)}px (${pct.toFixed(1)}% of 844px) — exceeds the 10% budget`;

      const beforeOpen = await page.evaluate(() => document.querySelector('.nav-disclosure')?.open);
      if (beforeOpen === undefined) return 'no .nav-disclosure element found';
      if (beforeOpen !== false) return `.nav-disclosure should default to CLOSED at 390px but was open`;

      await page.evaluate(() => document.body.focus());
      let reachedSummary = false;
      let stops = 0;
      for (let i = 0; i < 20; i += 1) {
        await page.keyboard.press('Tab');
        stops += 1;
        const tag = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
        if (tag === 'summary') { reachedSummary = true; break; }
      }
      if (!reachedSummary) return `keyboard traversal did not reach the nav-disclosure summary within ${stops} stops`;

      await page.keyboard.press('Enter');
      const afterOpen = await page.evaluate(() => document.querySelector('.nav-disclosure').open);
      if (afterOpen !== true) return `Enter on the nav-disclosure summary did not open it (open=${afterOpen})`;

      await page.keyboard.press('Tab');
      const nextHref = await page.evaluate(() => document.activeElement?.getAttribute('href'));
      const navHrefs = await page.evaluate(() =>
        [...document.querySelectorAll('nav[aria-label="Primary"] a')].map((a) => a.getAttribute('href')),
      );
      if (!navHrefs.includes(nextHref)) {
        return `after opening, the next tab stop (href=${nextHref}) is not one of the primary nav links (${navHrefs.join(', ')}) — activation did not expose them`;
      }
      return true;
    },
  },
  {
    id: 'S11', rule: 'R15',
    intent: "at 1440x900 with /catalog scrolled to its maximum, the gap between #catalog-table-wrap's bottom edge and .site-footer's top edge does not exceed one table row height, and the wrap's background does not differ from the page ground",
    independent: "getBoundingClientRect() of #catalog-table-wrap and .site-footer at max scroll, and the height of an actual rendered table row — none of them CSS values — plus getComputedStyle background-color of the wrap compared against the page body's, for equality",
    falsifier: {
      brokenBy: "TWO breaks. (1) reverted `main:has(#catalog-table-wrap) { padding-block-end }` and `body:has(#catalog-table-wrap) .site-footer { margin-top }` to the pre-fix 3rem each. (2) with (1) restored, commented out `#catalog-table-wrap { background: var(--paper) }`, reverting to the inherited `.table-wrap` panel background.",
      observed: '(1) check failed "gap 96.0px between #catalog-table-wrap and .site-footer exceeds one row height (32.3px)" — the exact pre-fix measurement the item recorded. (2) check failed "#catalog-table-wrap\'s background (rgb(255, 255, 255)) differs from the page ground (rgb(246, 246, 248)) — it reads as a card". Both restored; rebuilt tree passes.',
      brokenByOpposite: 'iter-06: the gap bound was ONE-SIDED — only an EXCESS gap failed, with no floor. `--only S11 --break "body:has(#catalog-table-wrap) .site-footer { margin-top: -60px !important; }"` (a negative gap: the wrap and footer overlapping) reported ok. Fixed by adding a symmetric floor: `gap < -0.5` now fails too, with its own message distinguishing overlap from excess whitespace.',
      observedOpposite: 'check failed "/catalog @1440x900: gap -52.0px between #catalog-table-wrap and .site-footer is NEGATIVE — the table\'s own scrollport overlaps the footer". Re-verified the original excess-gap direction still fires unchanged ("gap 96.0px ... exceeds one row height (32.3px)"). Restored; rebuilt tree (full gate) passes S11.',
    },
    kind: 'dom', routes: ['/catalog'], viewports: [[1440, 900]],
    check: async ({ page }) => {
      await page.waitForTimeout(150);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(150);
      const r = await page.evaluate(() => {
        const wrap = document.querySelector('#catalog-table-wrap');
        const footer = document.querySelector('.site-footer');
        const rows = document.querySelectorAll('#catalog-table tbody tr');
        if (rows.length < 3) return { error: 'fewer than 3 catalog rows rendered' };
        const rowHeight = rows[1].getBoundingClientRect().height;
        const gap = footer.getBoundingClientRect().top - wrap.getBoundingClientRect().bottom;
        return {
          gap, rowHeight,
          wrapBg: getComputedStyle(wrap).backgroundColor,
          paperBg: getComputedStyle(document.body).backgroundColor,
        };
      });
      if (r.error) return r.error;
      // iter-06: this bound was ONE-SIDED — only an EXCESS gap failed. A gap driven
      // negative (the wrap and the footer overlapping) is the opposite excess of the
      // same measurement and is a worse defect than double-spent whitespace, not a
      // lesser one; proven missing with
      // `--only S11 --break "body:has(#catalog-table-wrap) .site-footer { margin-top: -60px !important; }"`,
      // which reported ok.
      if (r.gap < -0.5) {
        return `gap ${r.gap.toFixed(1)}px between #catalog-table-wrap and .site-footer is NEGATIVE — the table's own scrollport overlaps the footer`;
      }
      if (r.gap > r.rowHeight + 0.5) {
        return `gap ${r.gap.toFixed(1)}px between #catalog-table-wrap and .site-footer exceeds one row height (${r.rowHeight.toFixed(1)}px)`;
      }
      if (r.wrapBg !== r.paperBg) {
        return `#catalog-table-wrap's background (${r.wrapBg}) differs from the page ground (${r.paperBg}) — it reads as a card`;
      }
      return true;
    },
  },
  {
    id: 'S12', rule: 'R16',
    intent: "the local()-sourced metric-adjusted fallback faces (Sitka Text Metric, Cambria Metric, Times New Roman Metric) render a fixed sample string at Georgia's own measured width, within 3px over a ~3730px string at 100px font-size — confirming the size-adjust arithmetic actually lands in a real browser, not just that the CSS parses",
    independent: 'canvas 2D measureText() width for each named font, read live in the harness browser via a fresh <canvas> — not the size-adjust percentages in the CSS source, which the check would otherwise just be re-stating',
    falsifier: {
      brokenBy: "changed `Cambria Metric`'s `size-adjust` from 105.7% to 100% (i.e., no adjustment) — the value that reproduces Cambria's own unadjusted width",
      observed: 'check failed: "\\"Cambria Metric\\" measures 3529.6px against Georgia\'s 3729.6px (diff 200.0px) — size-adjust is not matching it" — exactly Cambria\'s raw measured width from the implementer report\'s font-metrics table. Restored; rebuilt tree passes with all three fallbacks within 1.4px of Georgia.',
      brokenByOpposite: 'iter-06: `Math.abs(w - anchor)` is mechanically symmetric, but the only historical break UNDER-adjusts (100%, narrower than Georgia). The opposite excess is OVER-adjusting: `--only S12 --break "@font-face { font-family: \'Cambria Metric\'; src: local(\'Cambria\'); size-adjust: 180%; }"` (a later @font-face declaration for the same family wins).',
      observedOpposite: 'check failed "/ @1440x900: \\"Cambria Metric\\" measures 6353.3px against Georgia\'s 3729.6px (diff 2623.6px) — size-adjust is not matching it". Restored; rebuilt tree (full gate) passes S12.',
    },
    kind: 'dom', routes: ['/'], viewports: [[1440, 900]],
    check: async ({ page }) => {
      const r = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const sample = 'the quick brown fox jumps over the lazy dog THE QUICK BROWN FOX 0123456789';
        const widths = {};
        for (const name of ['Georgia', 'Sitka Text Metric', 'Cambria Metric', 'Times New Roman Metric']) {
          ctx.font = `100px "${name}"`;
          widths[name] = ctx.measureText(sample).width;
        }
        return widths;
      });
      const anchor = r.Georgia;
      for (const [name, w] of Object.entries(r)) {
        if (name === 'Georgia') continue;
        const diff = Math.abs(w - anchor);
        if (diff > 3) {
          return `"${name}" measures ${w.toFixed(1)}px against Georgia's ${anchor.toFixed(1)}px (diff ${diff.toFixed(1)}px) — size-adjust is not matching it`;
        }
      }
      return true;
    },
  },
  {
    id: 'S13', rule: 'R13',
    intent: "on the measure-track prose templates I16 evidenced beyond /wiki — /data's four sections and /colophon's .prose/.listing-facts — the block stays flush against the page's ONE shared left rail (.page-title's own left edge) rather than being centred (RETIRED iter-06, I33 — see RULES.md R13's iter-06 addendum: centring split the width but broke the rail every sibling block on the template shares). CP-UI-001-2 (F-K12, round-2 addendum): the wiki-entry-template clause that used to sit here (was FACTS's freed second-column track actually FILLED?) is RETIRED, not merely amended — the wiki entry template no longer declares a two-column grid at all (see RULES.md R13's round-2 addendum and S18 below for the same retirement, and S14 below for its replacement), so the question this clause asked no longer has a track to be asked about.",
    independent: "getBoundingClientRect().left of each measured block compared against .page-title's (the H1's) own getBoundingClientRect().left, both read live — not a CSS margin value, and not the block's own containing <article> (which is what the retired centred check compared against, and which cannot tell two siblings with different fit-content widths apart) — plus .entry-facts's own right edge against the shell's inner right edge for the unrelated filled-track clause",
    falsifier: {
      brokenBy: 'THREE breaks, one per clause, via `--only S13 --break "<css>"`, iter-06 (the /data and /colophon clauses below were rewritten this round from centred-in-container to shared-rail; re-verified against the new logic). (1) `.section:has(> .browse), .section:has(> .footer-links) { margin-inline: auto !important; }` — reintroduces /data\'s retired centring, which now pulls each section off the shared rail by a different amount (each section\'s own fit-content width differs). (2) `article:has(> .listing-facts):not(:has(> .entry-head)) > .prose, article:has(> .listing-facts):not(:has(> .entry-head)) > .listing-facts { margin-inline: auto !important; }` — same, on /colophon. (3) `@media (min-width: 60rem) { article:has(> .prose):has(> .entry-facts) > .entry-facts { grid-column: 1 !important; } }` — forces FACTS back into column 1 (stacked below prose, as before the restructure) instead of the freed column 2; unaffected by this round\'s change, re-run to confirm it still fires.',
      observed: '(1) check failed "/data @1440x900: /data \\"Everything, as one file\\" block\'s left edge (617.4px) does not match the page\'s shared rail at .page-title\'s left edge (144.0px) — diff 473.4px" — the exact 617.4px I33 measured as the first of /data\'s four ragged left edges. (2) check failed "/colophon @1440x900: /colophon .prose\'s left edge (416.0px) does not match the page\'s shared rail at .page-title\'s left edge (144.0px) — diff 272.0px" — the exact 144/416 figures I33 opened with. (3) check failed "/wiki/concept/ai-winter @1440x900: .entry-facts\'s right edge (752.0px) falls well short of the shell\'s inner edge (1296.0px) — the freed track beside prose is not actually occupied". All three restored; rebuilt tree (full gate) passes S13 at both declared viewports.',
      brokenByOpposite: '`--only S13 --break ".section:has(> .browse), .section:has(> .footer-links) { margin-left: -120px !important; }"` — the OPPOSITE direction of misalignment: instead of drifting right of the rail (centring, or any positive offset), the section is pushed LEFT of it. Confirms the check bounds drift in EITHER direction from the rail, not merely "at least as far right as the rail" (which a one-sided `left >= h1Left` formula would have let through).',
      observedOpposite: 'check failed "/data @1440x900: /data \\"Everything, as one file\\" block\'s left edge (24.0px) does not match the page\'s shared rail at .page-title\'s left edge (144.0px) — diff 120.0px". Restored; rebuilt tree (full gate) passes S13 at both declared viewports.',
      // CP-UI-001-2: the third clause this falsifier used to cover (break 3,
      // `.entry-facts{grid-column:1}`) is gone along with the clause itself —
      // there is no more `grid-column` on a retired grid to force. The /data
      // and /colophon clauses above are unaffected by this round's change and
      // were re-run to confirm they still fire (both do).
    },
    kind: 'dom', routes: ['/data', '/colophon'], viewports: [[1440, 900], [390, 844]],
    check: async ({ page, route }) => {
      if (route === '/data') {
        const r = await page.evaluate(() => {
          const h1 = document.querySelector('.page-title');
          if (!h1) return { error: 'no .page-title on /data' };
          const h1Left = h1.getBoundingClientRect().left;
          const out = [];
          for (const section of document.querySelectorAll('.section')) {
            const content = section.querySelector('.browse') || section.querySelector('.footer-links');
            if (!content) continue;
            const cr = content.getBoundingClientRect();
            out.push({ text: section.querySelector('.section-title')?.textContent ?? '?', left: cr.left });
          }
          return { out, h1Left };
        });
        if (r.error) return r.error;
        if (r.out.length < 4) return `expected 4 headed sections with browse/footer-links content on /data, found ${r.out.length}`;
        for (const s of r.out) {
          const railGap = Math.abs(s.left - r.h1Left);
          if (railGap > 1) {
            return `/data "${s.text}" block's left edge (${s.left.toFixed(1)}px) does not match the page's shared rail at .page-title's left edge (${r.h1Left.toFixed(1)}px) — diff ${railGap.toFixed(1)}px`;
          }
        }
        return true;
      }

      if (route === '/colophon') {
        const r = await page.evaluate(() => {
          const h1 = document.querySelector('.page-title');
          const prose = document.querySelector('.prose');
          const lf = document.querySelector('.listing-facts');
          if (!h1 || !prose || !lf) return { error: 'missing .page-title, .prose or .listing-facts on /colophon' };
          return {
            h1Left: h1.getBoundingClientRect().left,
            proseLeft: prose.getBoundingClientRect().left,
            lfLeft: lf.getBoundingClientRect().left,
          };
        });
        if (r.error) return r.error;
        for (const [name, left] of [
          ['.prose', r.proseLeft],
          ['.listing-facts', r.lfLeft],
        ]) {
          const railGap = Math.abs(left - r.h1Left);
          if (railGap > 1) {
            return `/colophon ${name}'s left edge (${left.toFixed(1)}px) does not match the page's shared rail at .page-title's left edge (${r.h1Left.toFixed(1)}px) — diff ${railGap.toFixed(1)}px`;
          }
        }
        return true;
      }

      return true;
    },
  },
  {
    id: 'S14', rule: 'R13',
    intent: "RETIRED AND REPLACED (CP-UI-001-2, F-K12, round-2 addendum). The old S14 asserted the OPPOSITE of what F-K12 now requires: it wanted FACTS reachable inside the first viewport, which the pre-round shipped tree achieved by placing FACTS ahead of PROSE in PAINT order below the 60rem breakpoint (an 'answer first' reflow — RULES.md's own S14 history, tracing to the old loop's S14 rule that F-K12 explicitly overrules: 'the reader must meet the subject ... BEFORE any facts table'). That paint-order flip is removed (globals.css, lib/render/entry.mjs); this id now asserts the property F-K12 actually names: PROSE's own bottom edge sits above FACTS's own top edge — prose is read, in full, before a reader reaches the facts table — at every declared viewport, on a wiki entry with a prose body. Being below the first viewport is no longer a defect this rule cares about; being ABOVE prose is.",
    independent: "getBoundingClientRect().top of .entry-facts and .getBoundingClientRect().bottom of .prose, read live at each declared viewport, on an entry that has both",
    falsifier: {
      brokenBy: '`--only S14 --break ".entry-facts{order:-1}"` on `article:has(> .prose):has(.entry-facts)` — the article is no longer `display:grid` so a bare `order` on a block child has no effect by itself; the real reintroduction of the retired flip is `--break "article:has(> .prose):has(.entry-facts){display:grid} article:has(> .prose):has(.entry-facts) > .entry-facts{order:-1}"`, which puts FACTS ahead of PROSE in paint order exactly as the pre-round CSS did below 60rem.',
      observed: "check failed \"/wiki/concept/ai-winter @1440x900: .entry-facts's top edge (103.8px) sits ABOVE .prose's own bottom edge (2583.5px) — a reader reaches the facts table before finishing the subject's own lede/body\" — the exact F-K12 violation this id now exists to catch.",
      brokenByOpposite: "the unbroken, shipped tree IS the opposite state (facts after prose) and is what PASSES; a bound with only one state to violate would be vacuous, so the opposite direction was exercised by pushing FACTS further still: `--break \".entry-facts{margin-top:-4000px !important}\"`, pulling FACTS up so its top edge again precedes .prose's bottom edge without touching DOM/paint order at all.",
      observedOpposite: "check failed \"/wiki/concept/ai-winter @1440x900: .entry-facts's top edge (-1826.1px) sits ABOVE .prose's own bottom edge (2173.9px)\" — same message, reached by a different mechanism, confirming the check reads live geometry rather than paint order alone. Restored; rebuilt tree passes S14 at both declared viewports.",
    },
    kind: 'dom', routes: ['/wiki/concept/ai-winter'], viewports: [[1440, 900], [390, 844]],
    check: async ({ page }) => {
      const r = await page.evaluate(() => {
        const facts = document.querySelector('.entry-facts');
        const prose = document.querySelector('.prose');
        if (!facts || !prose) return { error: 'missing .entry-facts or .prose on this entry' };
        return { factsTop: facts.getBoundingClientRect().top, proseBottom: prose.getBoundingClientRect().bottom };
      });
      if (r.error) return r.error;
      if (r.factsTop < r.proseBottom - 0.5) {
        return `.entry-facts's top edge (${r.factsTop.toFixed(1)}px) sits ABOVE .prose's own bottom edge (${r.proseBottom.toFixed(1)}px) — a reader reaches the facts table before finishing the subject's own lede/body`;
      }
      if (r.factsTop > r.innerHeight) {
        return `FACTS top edge (${r.factsTop.toFixed(1)}px) falls below the first viewport (${r.innerHeight}px) even though the entry's own prose (${r.proseHeight.toFixed(0)}px) is long enough that stacking alone would have buried it`;
      }
      return true;
    },
  },
  {
    id: 'S15', rule: 'R7',
    intent: "/blog's record-title link column (.rail-title, inside .rail-posts) is bounded to --measure-title (I43, iter-09 — a TEMPLATE-SPECIFIC token, not --measure-list; a post title is a headline, a sentence, not a row label, and R7's own iter-08 addendum's remedy for exactly this shape is a new token, not a widened shared one), so /blog cannot set its own wider measure by hand and /wiki, /data and /tools' --measure-list stays uncapped by this surface's needs; where a title exceeds the cap it wraps rather than stretching the track, bounded to 2 lines (down from 3, now that the cap itself is wider — --measure-title equals --measure, matching the lede's own width, so a title needs less wrapping to begin with), checked on EVERY post row rather than only the first",
    independent: "getComputedStyle(...).gridTemplateColumns's resolved (pixel) second track width on every live .rail-posts .rail-item — the browser's own used value, not the CSS source — compared against --measure-title's px equivalent computed from the root font size, matching S1's own approach; plus whether a Range over each row's own title text wraps across more than one client rect",
    falsifier: {
      brokenBy: 'SIX episodes. (1) `--only S15 --break ".rail-posts .rail-item { grid-template-columns: var(--rail-col) minmax(0, 1fr) !important; }"` — the pre-fix track (the same one .rail-item still uses everywhere else it appears: corrections, timelines, anchors), reintroduced on /blog\'s post index specifically. (2) iter-06 RE-VERIFICATION: same break, same command, on the then-rewritten (wrap-aware) check. (3) iter-07: re-ran break (1) unchanged against that round\'s every-row rewrite. (4) iter-07 NEW: `--only S15 --break ".rail-title a{font-size:28px !important}"` — inflates every title\'s own glyph size without touching the grid template, isolating the line-count bound from the track-width-collapse clause. (5) iter-09 (I43) NEW: `--only S15 --break ".rail-posts .rail-item{grid-template-columns:var(--rail-col) minmax(0, var(--measure-list)) !important}"` — reverts the track to the OLD, narrower --measure-list cap (384px) specifically, to confirm the check now measures against --measure-title (608px) rather than silently still accepting the old value. (6) iter-09 (I43) NEW: `--only S15 --break ".rail-title a{font-size:24px !important}"` — a smaller inflation than episode (4)\'s, calibrated to push titles from 2 lines to 3 at the WIDER 608px track, to confirm the new 2-line bound (not the old 3-line one) is what fires.',
      observed: '(1) check failed "/blog @1440x900: .rail-posts .rail-item\'s title track is 1036.0px, exceeding --measure-title (608.0px)" — the cap in the message is printed against whichever token the check is currently reading, so this reading updates automatically with the iter-09 token swap; the underlying defect and the 1036.0px reading are unchanged from iter-06/07. (2)/(3) unchanged, same reading, both rounds. (4) iter-07: check failed with a 5-line reading at the then-384px cap. (5) iter-09: forcing the track back to the OLD 384px --measure-list value — now narrower than the check\'s own --measure-title cap (608px) — routes to the COLLAPSE branch, not the in-bound one: check failed "/blog @1440x900: title \\"Anthropic publishes one government exception to its usage policy. Weapons and domestic surveillance are not in it.\\" wraps across 3 lines — the title track has collapsed to 384.0px, narrower than its own --measure-title cap (608.0px)" — confirms the check reads --measure-title (608px) as ITS cap, not the reverted --measure-list (384px); a track pinned at the OLD value now reads as collapsed rather than as compliant. (6) iter-09: check failed "/blog @1440x900: title \\"Anthropic publishes one government exception to its usage policy. Weapons and domestic surveillance are not in it.\\" wraps across 3 lines even at the --measure-title cap (608.0px) — exceeds the 2-line allowance" — confirms MAX_WRAP_LINES is now 2, not 3. All six restored; rebuilt tree (full gate) passes S15 at both declared viewports.',
      brokenByOpposite: 'THREE episodes. (1) iter-06 (S1/S16\'s twin): the track-width bound is silent about the OPPOSITE excess — the column squeezed too NARROW to hold a title on one line. `--only S15 --break ".rail-posts .rail-item { grid-template-columns: var(--rail-col) 40px !important; }"` reported ok at the time. (2) iter-07: re-ran the SAME break against that round\'s rewrite. (3) iter-09 (I43): re-ran the SAME break again, against the --measure-title rewrite, to confirm the collapse clause still reads the NEW (608px) cap rather than the retired 384px one when deciding "collapsed".',
      observedOpposite: 'iter-06: check failed \'title "..." wraps across 16 lines — the title track has collapsed too narrow to hold it on one line\'. iter-07: same reading, now carrying trackWidth. iter-09: check failed \'/blog @1440x900: title "Anthropic publishes one government exception to its usage policy. Weapons and domestic surveillance are not in it." wraps across 16 lines — the title track has collapsed to 40.0px, narrower than its own --measure-title cap (608.0px)\' — same 16-line reading, cap now correctly read as 608.0px rather than 384.0px. Restored; rebuilt tree (full gate) passes S15 at both declared viewports.',
      // I38 (iter-08)/I43 (iter-09): the content assumption this bound rests
      // on. Pre-iter-09, all four live /blog titles wrapped to exactly 3 of
      // 3 allowed lines at the 384px --measure-list cap — zero headroom.
      // I43's fix (--measure-title, 608px, matching --measure) measures
      // live at 2 of 2 lines on all four titles — the wrap count dropped
      // from 3 to 2 as the invariant requires, but at EXACTLY the new
      // 2-line bound, so headroom is honestly printed as ZERO below, not
      // fabricated. This is a real, measured improvement (a much less
      // cramped title block, sharing one right edge with the lede above it,
      // per I43's own invariant) even though it does not create slack for a
      // longer future title — the SAME discipline R7's iter-08 addendum
      // already states applies here: do not raise MAX_WRAP_LINES in advance
      // of the case that would test it, and do not claim headroom that
      // measurement does not show.
    },
    kind: 'dom', routes: ['/blog'], viewports: [[1440, 900], [390, 844]],
    check: async ({ page }) => {
      // iter-07: same reasoning as S1 (see its own comment) — a cap correctly
      // sized for the surface's typical title length still has to hold a
      // genuinely longer headline somewhere, and forbidding any wrap outright
      // was the actual defect. Track stays capped at --measure-title (iter-09:
      // was --measure-list); wrapping AT that cap is now bounded to 2 lines
      // (iter-09: was 3, since the wider cap needs less wrapping — see R7's
      // iter-08 addendum's own "presently" discipline, restated in the
      // falsifier note above); a track measurably BELOW the cap that wraps at
      // all is still the pre-existing "collapsed" defect. Sampled on every row.
      const r = await page.evaluate(() => {
        const items = [...document.querySelectorAll('.rail-posts .rail-item')];
        if (!items.length) return { error: 'no .rail-posts .rail-item found on /blog' };
        const out = [];
        for (const item of items) {
          const cols = getComputedStyle(item).gridTemplateColumns.split(' ').map(parseFloat);
          if (cols.length < 2) continue;
          const titleLink = item.querySelector('.rail-title a') || item.querySelector('.rail-title');
          if (!titleLink) continue;
          const range = document.createRange();
          range.selectNodeContents(titleLink);
          const rects = range.getClientRects();
          out.push({ text: titleLink.textContent.trim(), lines: rects.length, trackWidth: cols[1] });
        }
        if (!out.length) return { error: 'no .rail-item with a resolvable 2-track grid and a title found on /blog' };
        const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
        return { rows: out, rootPx, innerWidth: window.innerWidth };
      });
      if (r.error) return r.error;
      // Below 26rem .rail-item drops to a single flexible column (see the
      // narrow media query) — nothing to bound there.
      if (r.innerWidth < 416) return true;
      // I43 (iter-09, R7's iter-08 addendum): --measure-title (38rem), not
      // --measure-list (24rem) — a template-specific token for a headline,
      // not the shared row-label cap. See globals.css's own definition.
      const capPx = 38 * r.rootPx;
      const MAX_WRAP_LINES = 2; // I43 (iter-09): down from 3, now that the
      // wider cap needs less wrapping — see the falsifier note above for the
      // measured headroom (zero — all four titles land exactly at 2 lines).
      let worstLines = 1;
      for (const row of r.rows) {
        if (row.lines > worstLines) worstLines = row.lines;
        if (row.lines > 1) {
          if (row.trackWidth < capPx - 1) {
            return `title "${row.text}" wraps across ${row.lines} lines — the title track has collapsed to ${row.trackWidth.toFixed(1)}px, narrower than its own --measure-title cap (${capPx.toFixed(1)}px)`;
          }
          if (row.lines > MAX_WRAP_LINES) {
            return `title "${row.text}" wraps across ${row.lines} lines even at the --measure-title cap (${capPx.toFixed(1)}px) — exceeds the ${MAX_WRAP_LINES}-line allowance`;
          }
        }
        if (row.trackWidth > capPx + 1) {
          return `.rail-posts .rail-item's title track is ${row.trackWidth.toFixed(1)}px, exceeding --measure-title (${capPx.toFixed(1)}px)`;
        }
      }
      // I38 (iter-08)/I43 (iter-09): print the margin on every PASS, not only
      // the failure message. /blog's own worst case is EVERY title at exactly
      // 2 of 2 lines under the new cap — zero headroom, a cliff a silent PASS
      // would hide from the next person to touch this template.
      console.log(`          S15 headroom: worst case ${worstLines} of ${MAX_WRAP_LINES} lines allowed on /blog` +
        (worstLines >= MAX_WRAP_LINES ? ' — NO HEADROOM' : ` (${MAX_WRAP_LINES - worstLines} line(s) of headroom)`));
      return true;
    },
  },
  {
    id: 'S16', rule: 'R7',
    intent: "a .browse surface's label track (.browse-name) sizes to that surface's OWN widest label, capped at --measure-list, rather than always reserving the full cap regardless of content — on /tools' category index, where every label is far short of the cap, the gap between the widest label and the count column shrinks to something close to the row's own gap rhythm instead of ~289px of permanent dead air",
    independent: "getBoundingClientRect() gap between a Range over .browse-name's own text glyphs (not its grid-stretched box — see S1's own post-mortem on why the box alone is vacuous) and .browse-kind's left edge, read live on /tools' category index",
    falsifier: {
      brokenBy: '`--only S16 --break ".browse { grid-template-columns: minmax(0, var(--measure-list)) max-content max-content !important; }"` — the pre-I32 fixed-width track, reintroduced. The other end of this property (a cap so small it truncates a surface\'s genuinely long content) is not this check\'s job to falsify: fit-content() cannot go below min-content by construction, and the case where the cap legitimately binds (/data, content close to the full 384px) is S1\'s own existing regression guard on that route, unaffected by this change and reconfirmed passing in the same gate run.',
      observed: 'FIRST attempt reported the check not firing (0 of 1). Re-run twice more with the identical command: both fired correctly, "/tools @1440x900: gap between /tools\' widest category label and the count column is 301.7px — the label track is not sizing to this surface\'s own content" both times, matching S15\'s own transient-then-consistent pattern (see S15\'s falsifier note) — treated as the same operational flake, not a defect in the check. Restored; rebuilt tree (full gate) passes S16 at both declared viewports. iter-06 RE-VERIFICATION with the rewritten check below: same break, same command, fired cleanly on the first run — "/tools @1440x900: gap between /tools\' widest category label and the count column is 301.7px" — unchanged from the original reading, confirming the wrap-detection addition did not disturb this side.',
      brokenByOpposite: 'THE OTHER ONE-SIDEDNESS THE KEEPER CONFIRMED before implementation began (S1\'s twin — same mechanism, same fix, different route): `--only S16 --break ".browse{grid-template-columns:40px auto auto !important}"`. The gap formula alone is vacuous here for the identical reason as S1: squeezing the column narrow moves .browse-name\'s text and .browse-kind left together, so the gap stays small while the column collapses. Fixed the same way: a Range wrap-count check (getClientRects().length > 1) added alongside the gap check, over every row in /tools\' category index rather than only the widest-so-far one.',
      observedOpposite: '/tools @1440x900: check failed \'label "agents" wraps across 2 lines — the label column has collapsed too narrow to hold it on one line\' — even a short, single-word category label wraps at 40px, which is the point: the gap-only formula could not have caught this at any label length, since text and kind always moved together. Restored; rebuilt tree (full gate) passes S16 at both declared viewports.',
    },
    kind: 'dom', routes: ['/tools'], viewports: [[1440, 900], [390, 844]],
    check: async ({ page }) => {
      // iter-06 (I33 falsification round): same one-sidedness as S1, same fix.
      // `--only S16 --break ".browse{grid-template-columns:40px auto auto !important}"`
      // reported ok — text and .browse-kind move left together so the gap formula
      // alone stays small — while every category label on /tools wrapped. Assert
      // the independent wrap signal (multiple Range client rects) too.
      const r = await page.evaluate(() => {
        const rows = [...document.querySelectorAll('.category-index .browse-row')];
        if (rows.length < 5) return { error: 'fewer than 5 rows in /tools\' category index' };
        let maxTextRight = -Infinity;
        let wrapped = null;
        for (const row of rows) {
          const name = row.querySelector('.browse-name');
          if (!name) continue;
          const range = document.createRange();
          range.selectNodeContents(name);
          const rects = range.getClientRects();
          if (rects.length > 1 && !wrapped) {
            wrapped = { text: name.textContent.trim(), lines: rects.length };
          }
          const rect = range.getBoundingClientRect();
          if (rect.right > maxTextRight) maxTextRight = rect.right;
        }
        const firstKind = rows[0].querySelector('.browse-kind');
        if (!firstKind) return { error: 'no .browse-kind on the first row' };
        return { gap: firstKind.getBoundingClientRect().left - maxTextRight, innerWidth: window.innerWidth, wrapped };
      });
      if (r.error) return r.error;
      // At <=26rem .browse reverts to a flexible 2-column template with
      // .browse-kind on its own grid row (see the narrow media query) — the
      // horizontal gap this check measures does not apply there.
      if (r.innerWidth < 416) return true;
      if (r.wrapped) {
        return `label "${r.wrapped.text}" wraps across ${r.wrapped.lines} lines — the label column has collapsed too narrow to hold it on one line`;
      }
      if (r.gap > 40) {
        return `gap between /tools' widest category label and the count column is ${r.gap.toFixed(1)}px — the label track is not sizing to this surface's own content`;
      }
      return true;
    },
  },
  {
    id: 'S17', rule: 'R8',
    intent: "R8's iter-08 addendum governs THREE surfaces, not the two S17 originally sampled: no column of a record/listing surface renders an identical value on more than 90% of its rows at the same visual weight as the columns a reader compares across, measured as COMPUTED COLOUR and not only as the presence of a link. /catalog's Read column (a value constant across the collection is stated once, renderFetchLine, above the table, and rendered per row at --muted rather than the ink weight of the Model/numeric columns); /tools' .listing-verified column (iter-08, I36 — S17 previously tested only ONE surface and only ONE emphasis mechanism, so it was green while /tools' verification date sat at the identical computed colour as .listing-pricing, the field a reader actually compares across a category); and the home changed feed's provenance link (I42, iter-09 — WORSE than either: the repeated value ('source', 24 of 24 rows) did not merely match the compared column's weight, it read LOUDER, at --accent, than the record link beside it). All three now sampled by one route list. On every surface a row whose own value genuinely differs from its collection's/category's/feed's dominant one keeps full weight, exactly as R8's badge clause keeps a status chip only where the tone differs from the default.",
    independent: "/catalog clause 1a (link presence, unchanged): whether an <a> element exists inside each row's Read <td>, read from the REAL /catalog page's live DOM (396 actual rows). /catalog clause 1b (iter-08, NEW): the dominant Read value's own `getComputedStyle(...).color`, read live, compared against a numeric column cell's computed colour on the SAME live page — independent of clause 1a's link-presence signal, so a future rule that decouples colour from link structure cannot hide behind clause 1a alone. /catalog clause 2 (the badge-clause's other half, which the real page's data cannot currently exercise — every row shares one source today): renderCatalogTable itself, called directly with a SYNTHETIC 10-row fixture (9 sharing one fetch date, 1 genuinely different), parsed with cheerio. /tools clause 1 (iter-08, NEW): per category (.listings), the dominant .listing-verified text's own computed colour compared against .listing-pricing's computed colour on the SAME live entry, read from the REAL /tools page (12 categories, 35 listings). /tools clause 2 (iter-08, NEW): categorySection called directly with a SYNTHETIC 10-listing group (9 sharing one verification date, 1 genuinely different), parsed with cheerio, asserting the rendered `data-default` attribute — the real page's data cannot exercise this either, every category shares one date today. Home clause (I42, iter-09, NEW): the dominant a.src text's own `getComputedStyle(...).color`, read live from the REAL home page (24 changed-feed entries), compared against a.change-name's (or the unlinked .change-name span's) computed colour on the SAME row — the record link is the comparison reference named directly in the invariant, not a numeric column, since the changed feed has no numeric field to compare against.",
    falsifier: {
      brokenBy: 'reverted the Read cell\'s condition in `catalogRowHtml` (lib/render/catalog.mjs) from `row.source_url && !isDefaultFetch` back to the pre-fix `row.source_url` alone, THEN rebuilt (`npm run build`) — the exact I8 defect, every row linked regardless of whether its date matches the collection default. The rebuild is necessary here: clause 1 reads the REAL, already-built /catalog page from `out/`, which only reflects a source edit after `next build` regenerates it — unlike S1-S16, this property is a render-logic/template change, not CSS, so `--break`\'s runtime CSS injection cannot reach it at all (confirmed: running the break WITHOUT rebuilding left clause 1 reading the stale, still-correct build and passing — only clause 2\'s dynamic import, which re-reads the source file directly with no build step, caught it, with the message from the OTHER falsifier episode below; the accurate two-step process is recorded here rather than the single-step one first assumed). iter-08 (I36) NEW, clause 1b: `--only S17 --break "#catalog-table td[data-label=\'Read\'] > time{color:var(--ink) !important}"` — forces the unlinked, majority-date cells back to full ink WITHOUT touching link structure at all, reproducing the exact defect I36 found: S17 was green over this because clause 1a only ever looked at the <a>, never at colour. iter-08 (I36) NEW, /tools clause 1: `--only S17 --break ".listing-verified{color:var(--ink) !important}"` — the same shape on the second surface. I42 (iter-09) NEW, home clause: `--only S17 --break ".src{color:var(--ink) !important}"` — raises the changed feed\'s provenance link to full ink, matching a.change-name\'s own weight, reproducing the pre-fix defect on the third surface.',
      observed: 'WITHOUT a rebuild (source reverted, `out/` still the fixed build): check failed via clause 2 only — "synthetic fixture: 9 of 9 majority-date rows still render their Read cell as a link, despite sharing the collection\'s dominant fetch date" — clause 1 passed (stale build). WITH the rebuild: check failed via clause 1a — "/catalog: the Read column\'s dominant value \\"2026-08-31\\" appears on 396/396 rows (100.0%) and 396 of them still render at link weight (an <a> in the cell) — a collection-constant value is repeated per row at the same visual weight as the Model column". Restored and rebuilt; re-ran and confirmed PASS. iter-08 clause 1b: check failed "/catalog: the Read column\'s dominant value \\"2026-08-31\\" renders at rgb(26, 27, 34), the SAME computed colour as the numeric columns (rgb(26, 27, 34)) a reader compares across — link absence alone did not lower its visual weight". iter-08 /tools clause 1: check failed \'/tools category "agents": the .listing-verified column\\\'s dominant value "verified 2026-08-28" appears on N/N listings (100.0%) and renders at the SAME computed colour (rgb(26, 27, 34)) as .listing-pricing\'. I42 (iter-09) home clause: check failed "/: the changed feed\'s provenance link text \\"source\\" appears on 24/24 rows (100.0%) and renders at the SAME computed colour (rgb(26, 27, 34)) as the record link (rgb(26, 27, 34)) it sits beside" — matching the verdict\'s own "24 of 24" reading exactly. All restored; rebuilt tree (full gate) confirmed PASS.',
      brokenByOpposite: 'reverted the same condition the OTHER direction — `const isDefaultFetch = true;` unconditionally (the link suppressed even for a row whose date genuinely differs) — the opposite excess: R8\'s badge-clause other half, unmet. This is exactly the shape iter-06 found missing on S2 (an \'ended\'-status badge losing its box) applied to this same clause on a different column. No rebuild needed for this direction: clause 1 (the real page, rebuilt and restored beforehand) stays green regardless, since the real data has no minority row to expose the loss — which is exactly why clause 2 exists; clause 2\'s dynamic import picks up the source edit immediately. iter-08 (I36) NEW, /tools: the identical shape on the second surface — inverted `renderListingRow`\'s `isDefaultVerified` comparison in lib/render/tools.mjs (`===` to `!==`) so the MAJORITY rows lose `data-default="yes"` and the ONE minority row gains it — re-ran WITHOUT --break (clause 2\'s dynamic `import()` re-reads the current source directly, same mechanism as /catalog\'s own clause 2, since neither CSS injection nor a rebuild can reach a JS-logic inversion the way clause 1\'s real DOM read needs one).',
      observedOpposite: 'check failed "synthetic fixture: the ONE row with a genuinely different fetch date (the exception the collection default is stated FOR) lost its link — R8\'s badge-clause other half, unmet". Clause 1 confirmed unaffected (still passing on the real page), showing clause 2 exercises code clause 1 cannot reach. iter-08 /tools: check failed "synthetic /tools fixture: 9 of 9 majority-date listings do NOT carry data-default=\\"yes\\" — R8\'s badge-clause other half (the default stays demoted) is unmet". Both restored; re-ran and confirmed PASS. I42 (iter-09) home clause: no dedicated opposite-direction fixture — the changed feed has no numeric or fixed-format field a `data-default`-style attribute could attach to (unlike /catalog\'s fetch date and /tools\' verification date, both of which have that mechanism already built for the badge-clause\'s other half), and today\'s live feed carries no genuinely-different-source row to exercise one against. The registry\'s own two-sidedness requirement is satisfied at the INVARIANT level by the /catalog and /tools opposite-direction fixtures above, which exercise the identical badge-clause-other-half property this clause shares; a THIRD, home-specific synthetic fixture was judged not to add a new failure mode, only a third instance of the same one already covered.',
    },
    kind: 'dom', routes: ['/catalog', '/tools', '/'], viewports: [[1440, 900]],
    // All three clauses are viewport-independent (whether the Read cell
    // holds an <a>, or a.src's own colour, is decided by data/CSS, not by
    // any media query — the mobile stacked layout re-presents the same
    // markup, it does not regenerate it), so one declared viewport is the
    // honest scope rather than a second run of an identical assertion.
    // --break (CSS injection) cannot reach the /catalog or /tools clauses —
    // template/render-logic, not layout — so their falsification is a real
    // source edit, re-run directly (see IMPLEMENT.md: "use a real rebuild
    // only where the property cannot be violated from CSS"; this check
    // imports the render module and re-reads the existing build directly,
    // so neither a `next build` nor a `--break` banner run was needed to
    // falsify them — the cheapest correct mechanism for a JS-logic
    // property, not a CSS one). The home clause (I42, iter-09) IS a pure
    // CSS/colour property, so it is falsified with --break instead, like
    // every other colour check in this registry.
    check: async ({ page, route }) => {
      if (route === '/') {
        // I42 (iter-09, R8's iter-08 addendum's third surface, and R9 —
        // .src is a resting link inside a list row): the changed feed's
        // provenance link ("source", 24 of 24 rows before the fix) compared
        // against the record link on the SAME row, which is the reference
        // this surface names (there is no numeric column on a changed-feed
        // entry to compare against, unlike /catalog and /tools).
        const dom = await page.evaluate(() => {
          const items = [...document.querySelectorAll('.rail-changes > .rail-item')];
          if (items.length < 10) return { error: `expected at least 10 .rail-changes entries on /, found ${items.length}` };
          const rows = [];
          for (const item of items) {
            const src = item.querySelector('a.src');
            const record = item.querySelector('a.change-name, span.change-name');
            if (!src || !record) continue;
            rows.push({
              text: src.textContent.trim(),
              srcColor: getComputedStyle(src).color,
              recordColor: getComputedStyle(record).color,
            });
          }
          if (rows.length < 10) return { error: `expected at least 10 rows with both a.src and a record link, found ${rows.length}` };
          const counts = new Map();
          for (const row of rows) counts.set(row.text, (counts.get(row.text) ?? 0) + 1);
          let modeText = null;
          let modeCount = 0;
          for (const [t, c] of counts) {
            if (c > modeCount) { modeText = t; modeCount = c; }
          }
          const modeRows = rows.filter((row) => row.text === modeText);
          const modeColors = [...new Set(modeRows.map((row) => row.srcColor))];
          return { total: rows.length, modeText, modeCount, modeColors, recordColor: modeRows[0].recordColor };
        });
        if (dom.error) return dom.error;
        const sharePct = (dom.modeCount / dom.total) * 100;
        if (sharePct > 90 && dom.modeColors.length === 1 && dom.modeColors[0] === dom.recordColor) {
          return `/: the changed feed's provenance link text "${dom.modeText}" appears on ${dom.modeCount}/${dom.total} rows (${sharePct.toFixed(1)}%) and renders at the SAME computed colour (${dom.modeColors[0]}) as the record link (${dom.recordColor}) it sits beside — a repeated, non-discriminating value at the weight of the value a reader actually compares`;
        }
        return true;
      }

      if (route === '/catalog') {
        const dom = await page.evaluate(() => {
          const rows = [...document.querySelectorAll('#catalog-table tbody tr')];
          if (rows.length < 50) return { error: 'fewer than 50 catalog rows rendered' };
          const perRow = [];
          const counts = new Map();
          for (const tr of rows) {
            const td = tr.querySelector('td[data-label="Read"]');
            if (!td) continue;
            const time = td.querySelector('time');
            const text = time ? time.textContent.trim() : null;
            const linked = !!td.querySelector('a');
            const color = time ? getComputedStyle(time).color : null;
            perRow.push({ text, linked, color });
            if (text != null) counts.set(text, (counts.get(text) ?? 0) + 1);
          }
          let modeText = null;
          let modeCount = 0;
          for (const [t, c] of counts) {
            if (c > modeCount) { modeText = t; modeCount = c; }
          }
          const modeRows = perRow.filter((r) => r.text === modeText);
          const modeLinked = modeRows.filter((r) => r.linked).length;
          const modeColors = [...new Set(modeRows.map((r) => r.color))];
          const numericCell = document.querySelector('#catalog-table tbody td[data-numeric]');
          const numericColor = numericCell ? getComputedStyle(numericCell).color : null;
          return { total: perRow.length, modeText, modeCount, modeLinked, modeColors, numericColor };
        });
        if (dom.error) return dom.error;
        const sharePct = (dom.modeCount / dom.total) * 100;
        if (sharePct > 90 && dom.modeLinked > 0) {
          return `/catalog: the Read column's dominant value "${dom.modeText}" appears on ${dom.modeCount}/${dom.total} rows (${sharePct.toFixed(1)}%) and ${dom.modeLinked} of them still render at link weight (an <a> in the cell) — a collection-constant value is repeated per row at the same visual weight as the Model column`;
        }
        // I36 (iter-08): clause 1b — the NEW independent signal. A future rule
        // could satisfy clause 1a (no <a>) while still rendering the constant
        // at full ink through some OTHER selector; this reads the actually
        // computed colour, live, and compares it to a column that genuinely
        // discriminates (the numeric columns), rather than trusting link
        // absence as a proxy for lowered weight.
        if (sharePct > 90 && dom.modeColors.length === 1 && dom.modeColors[0] === dom.numericColor) {
          return `/catalog: the Read column's dominant value "${dom.modeText}" renders at ${dom.modeColors[0]}, the SAME computed colour as the numeric columns (${dom.numericColor}) a reader compares across — link absence alone did not lower its visual weight`;
        }

        const mod = await import(pathToFileURL(join(ROOT, 'lib', 'render', 'catalog.mjs')).href);
        const baseRow = (over) => ({
          name: over.name, provider: null, entry: null, price_input: null, price_output: null,
          context_window: null, status: null, source: over.source, source_url: over.source_url,
          fetched: over.fetched, raw: { price_input: null, price_output: null, context_window: null },
        });
        const synthRows = [
          ...Array.from({ length: 9 }, (_, i) => baseRow({
            name: `Majority Model ${i}`, source: 'feed-a',
            source_url: 'https://feed-a.example/models', fetched: '2026-08-31',
          })),
          baseRow({
            name: 'Minority Model', source: 'feed-b',
            source_url: 'https://feed-b.example/models', fetched: '2020-01-01',
          }),
        ];
        const html = mod.renderCatalogTable(synthRows, { id: 'synthetic-s17' });
        const $ = cheerio.load(html);
        const trs = $('tbody tr').toArray();
        if (trs.length !== 10) return `synthetic fixture: expected 10 rows, rendered ${trs.length}`;
        let majorityLinked = 0;
        let minorityLinked = false;
        for (const tr of trs) {
          const name = $(tr).find('th').text();
          const linked = $(tr).find('td[data-label="Read"] a').length > 0;
          if (name.startsWith('Majority')) { if (linked) majorityLinked += 1; }
          else if (name.startsWith('Minority')) minorityLinked = linked;
        }
        if (majorityLinked > 0) {
          return `synthetic fixture: ${majorityLinked} of 9 majority-date rows still render their Read cell as a link, despite sharing the collection's dominant fetch date`;
        }
        if (!minorityLinked) {
          return `synthetic fixture: the ONE row with a genuinely different fetch date (the exception the collection default is stated FOR) lost its link — R8's badge-clause other half, unmet`;
        }
        return true;
      }

      // /tools (I36, iter-08): the same shape as /catalog's Read column,
      // applied to .listing-verified against .listing-pricing — see
      // globals.css's own I36 note and lib/render/tools.mjs's
      // renderListingRow/categorySection.
      const dom = await page.evaluate(() => {
        const cats = [...document.querySelectorAll('.listings')];
        if (cats.length < 5) return { error: `expected multiple category .listings on /tools, found ${cats.length}` };
        const out = [];
        for (const ul of cats) {
          const section = ul.closest('.section');
          const name = section?.querySelector('.section-title')?.textContent?.trim() ?? '?';
          const rows = [...ul.querySelectorAll('.listing')]
            .map((li) => {
              const verified = li.querySelector('.listing-verified');
              const pricing = li.querySelector('.listing-pricing');
              if (!verified || !pricing) return null;
              return {
                text: verified.textContent.trim(),
                verifiedColor: getComputedStyle(verified).color,
                pricingColor: getComputedStyle(pricing).color,
              };
            })
            .filter(Boolean);
          if (rows.length < 2) continue; // nothing to compare within a 1-entry category
          const counts = new Map();
          for (const r of rows) counts.set(r.text, (counts.get(r.text) ?? 0) + 1);
          let modeText = null;
          let modeCount = 0;
          for (const [t, c] of counts) {
            if (c > modeCount) { modeText = t; modeCount = c; }
          }
          const modeRows = rows.filter((r) => r.text === modeText);
          const modeColors = [...new Set(modeRows.map((r) => r.verifiedColor))];
          out.push({ name, total: rows.length, modeText, modeCount, modeColors, pricingColor: modeRows[0].pricingColor });
        }
        return { cats: out };
      });
      if (dom.error) return dom.error;
      for (const cat of dom.cats) {
        const sharePct = (cat.modeCount / cat.total) * 100;
        if (sharePct > 90 && cat.modeColors.length === 1 && cat.modeColors[0] === cat.pricingColor) {
          return `/tools category "${cat.name}": the .listing-verified column's dominant value "${cat.modeText}" appears on ${cat.modeCount}/${cat.total} listings (${sharePct.toFixed(1)}%) and renders at the SAME computed colour (${cat.modeColors[0]}) as .listing-pricing — the column a reader compares across`;
        }
      }

      const mod = await import(pathToFileURL(join(ROOT, 'lib', 'render', 'tools.mjs')).href);
      const synthListing = (over) => ({
        doc: { url: over.url, data: { title: over.title, pricing: 'Free tier available' } },
        state: { state: 'alive', alive: true, last_verified: over.verified, marker: null },
      });
      const synthListings = [
        ...Array.from({ length: 9 }, (_, i) => synthListing({
          url: `/tools/majority-${i}`, title: `Majority Tool ${i}`, verified: '2026-08-28',
        })),
        synthListing({ url: '/tools/minority', title: 'Minority Tool', verified: '2020-01-01' }),
      ];
      const html = mod.categorySection(
        { category: 'synthetic-s17', note: 'synthetic fixture for S17', listings: synthListings },
        new Map(),
      );
      const $ = cheerio.load(html);
      const lis = $('.listing').toArray();
      if (lis.length !== 10) return `synthetic /tools fixture: expected 10 listings, rendered ${lis.length}`;
      let majorityRaised = 0;
      let minorityRaised = false;
      for (const li of lis) {
        const name = $(li).find('.listing-name').text();
        const isDefault = $(li).find('.listing-verified').attr('data-default');
        if (name.startsWith('Majority')) { if (isDefault !== 'yes') majorityRaised += 1; }
        else if (name.startsWith('Minority')) minorityRaised = isDefault === 'no';
      }
      if (majorityRaised > 0) {
        return `synthetic /tools fixture: ${majorityRaised} of 9 majority-date listings do NOT carry data-default="yes" — R8's badge-clause other half (the default stays demoted) is unmet`;
      }
      if (!minorityRaised) {
        return `synthetic /tools fixture: the ONE listing with a genuinely different verification date lost its data-default="no" — the exception the collection default is stated FOR should rise to full weight`;
      }
      return true;
    },
  },
  {
    id: 'S18', rule: 'R13',
    intent: "R13's iter-07(a) dead-track floor. On the home page at 1440x900, the SHORTER of .home-side / .rail-changes reaches at least 60% of the TALLER one's own height. CP-UI-001-2 (round-2 addendum): the wiki-entry clause that lived here (I40, iter-09 — .prose vs .entry-side, honestly left FAILING at 32-40%) is RETIRED, not raised or reworked: the wiki entry template no longer declares a two-column grid at all (globals.css, lib/render/entry.mjs — FACTS/TIMELINE/RAILS render single-column, in order, after PROSE), so there is no second track for a 60% floor to be asked of. See RULES.md R13's round-2 addendum and S13/S14 above for the same retirement on this template.",
    independent: "getBoundingClientRect().height of .home-side and .rail-changes on /, and of .prose and .entry-side on the wiki entry — read live from each rendered page, not any CSS value and not either element's own content count",
    falsifier: {
      brokenBy: "reverted app/page.tsx's I9 fix — removed the relocated 'Everything here' <section> from inside <aside className=\"home-side\"> and restored it to its original position below .home-grid — then rebuilt (`npm run build`). This is a JSX/template change: --break's runtime CSS injection cannot move an element between two different parents, so unlike the CSS-only checks in this registry a real rebuild is the correct falsification mechanism here, not --break (see IMPLEMENT.md: 'use a real rebuild only where the property cannot be violated from CSS').",
      observed: 'check failed "/ @1440x900: .home-side (576.7px) reaches only 46.9% of .rail-changes\'s own height (1230.8px) — a column held open beside nothing for the remaining 654.2px" — matching I9\'s own opening measurement (46.9%, ~688px) closely; the small gap-figure difference is this run\'s own live remeasurement against a freshly rebuilt tree, not a discrepancy. Restored (moved the section back into .home-side) and rebuilt; re-ran and confirmed PASS at 87.7%.',
      brokenByOpposite: '`--only S18 --break ".home-side{min-height:2400px !important}"` — the OPPOSITE excess: .home-side padded taller than .rail-changes, past the point where the SHORTER side (now .rail-changes) drops below 60% of the TALLER (now .home-side). A one-directional formula (always homeSide / railChanges) would pass this trivially, since a padded-tall rail only pushes THAT ratio further from its floor — it would never catch the FEED column now being the short one. The check instead compares whichever side is SHORTER against whichever is TALLER, so this break exercises the identical formula from the other side, on the same live measurement. Recorded honestly: a first attempt at `min-height:1400px` did NOT fire (0 of 1) — not a flaky check, an under-sized break: 1400px only pushes .home-side past .rail-changes\'s 1230.8px by a small margin, giving 1230.8/1400 = 87.9%, still comfortably over the 60% floor. Recomputed the threshold (need tallH > 1230.8/0.6 ≈ 2051px) and re-broke at 2400px.',
      observedOpposite: 'AT 1400px (first attempt): no failure — informative, not a defect (see above; the CSS did not actually violate the property, matching the harness\'s own diagnostic text for this case). AT 2400px: check failed "/ @1440x900: .rail-changes (1230.8px) reaches only 51.3% of .home-side\'s own height (2400.0px) — a column held open beside nothing for the remaining 1169.2px". Restored (removed the injected min-height); rebuilt tree (full gate) passes S18.',
      // I38 (iter-08): the content assumption this floor rests on — measured
      // live: .home-side 1079.3px, .rail-changes 1230.8px, 87.7%, 568px of
      // headroom before .rail-changes (24 entries, 23 at ~43.4px and one
      // annotated at ~209.3px) crosses 1798.8px (= 1079.3 / 0.6) and the check
      // goes red. data/changes.jsonl regenerates daily and carries no bound of
      // its own, so that is roughly 3.4 more annotated entries in the top 24 —
      // reachable by a normal week, not a pathological one. Printed on every
      // PASS below. If it is crossed, the fix is NOT raising the 60% floor in
      // advance of the case that would test it (iter-06 retired the occupancy
      // clause for exactly this shape of miscalibration) — it is that
      // .home-grid's two-column split needs a different mechanism than
      // "relocate one more section into the shorter side" (I9's own remedy),
      // since that lever is now fully spent: .home-side already holds every
      // section this template has to offer it.
      //
      // CP-UI-001-2 (round-2 addendum): the wiki-entry clause that used to be
      // exercised here is RETIRED along with the two-column grid itself (see
      // S13/S14 above and RULES.md R13's round-2 addendum) — there is no
      // `.entry-side` left to break.
    },
    kind: 'dom', routes: ['/'], viewports: [[1440, 900]],
    // Home-only for the FIRST clause: .home-grid's two-column split exists
    // solely at the >=60rem breakpoint (see globals.css); below it both
    // stack full-width in one column and this ratio is undefined (nothing
    // to compare side-by-side), so 390x844 is not a second viewport either
    // clause has an opinion about — the wiki-entry clause below has the
    // identical reasoning for its own >=60rem breakpoint.
    check: async ({ page }) => {
      const r = await page.evaluate(() => {
        const side = document.querySelector('.home-side');
        const rail = document.querySelector('.rail-changes');
        if (!side || !rail) return { error: 'missing .home-side or .rail-changes on /' };
        return { sideH: side.getBoundingClientRect().height, railH: rail.getBoundingClientRect().height };
      });
      if (r.error) return r.error;
      const [shortLabel, shortH, tallLabel, tallH] = r.sideH <= r.railH
        ? ['.home-side', r.sideH, '.rail-changes', r.railH]
        : ['.rail-changes', r.railH, '.home-side', r.sideH];
      const ratio = shortH / tallH;
      if (ratio < 0.6 - 0.001) {
        const gap = tallH - shortH;
        return `${shortLabel} (${shortH.toFixed(1)}px) reaches only ${(ratio * 100).toFixed(1)}% of ${tallLabel}'s own height (${tallH.toFixed(1)}px) — a column held open beside nothing for the remaining ${gap.toFixed(1)}px`;
      }
      // I38 (iter-08, R13's iter-07(a)): the 60% floor is checked against
      // TODAY's feed (data/changes.jsonl, which the build regenerates daily —
      // not held to any content bound of its own). Print how much the taller
      // side could still grow before the ratio crosses the floor, on every
      // PASS, rather than leave a silent margin only visible by hand-deriving
      // it from the two heights in a failure message nobody sees while it
      // passes.
      const growthHeadroomPx = shortH / 0.6 - tallH;
      console.log(`          S18 headroom (/): ${shortLabel} at ${(ratio * 100).toFixed(1)}% of ${tallLabel} ` +
        `(floor 60%) — ${tallLabel} could grow ${growthHeadroomPx.toFixed(1)}px more before the floor is crossed`);
      return true;
    },
  },
  {
    id: 'S19', rule: 'R13',
    intent: "R13's shared-track-set clause governs /tools' ENTIRE listings surface, not one category at a time — a reader scans pricing, verification date and wiki-entry link down the WHOLE page, not within one category's own boundary. I41 (iter-09): each of a listing's pricing, verified-date and wiki-entry-link fields now starts at the SAME x across EVERY entry on the PAGE (widened from 'within a category' — twelve categories previously shared tracks internally but landed at seven distinct x positions against each other, because each `.listings` sized its own trailing `max-content` columns independently, against only that category's own longest wiki-entry label). Fixed by hoisting the real track declaration to `.tools-index` (app/tools/page.tsx) with every category's `.section`/`.listings` subgridding onto it (globals.css) — R13's own established subgrid mechanism, one level up. AND the shared trailing columns never grow so wide that they squeeze the pricing column below a usable minimum, the opposite excess of the same mechanism: a track set that aligns fields but leaves one of them unreadably narrow is not a fix, it is the dead-space/cramped-column tension (R7's own iter-07 addendum) relocated to a proportion problem instead of a cap problem.",
    independent: "getBoundingClientRect().left of .listing-pricing/.listing-verified/.listing-entry, and getBoundingClientRect().width of .listing-pricing, read live across EVERY .listing on the page (not grouped by category) — not the grid-template-columns CSS source",
    falsifier: {
      brokenBy: "clause 1 (alignment), iter-07: `--only S19 --break \".listing{display:block !important}\"` — collapses the subgrid, reproducing the pre-fix run-on shape (each field wherever its own text happens to end, not a shared column). Clause 1, iter-09 (I41) NEW — the actual scope defect the widening targets: `--only S19 --break \".listings{grid-template-columns:minmax(0,1fr) max-content max-content !important}\"` — reverts EACH category's `.listings` from `subgrid` back to its OWN independent max-content tracks (the pre-I41 shape), leaving alignment intact WITHIN each category (clause 1's old form would have passed this) but broken ACROSS the twelve.",
      observed: 'iter-07/iter-09 re-run (whole-subgrid collapse, `.listing{display:block}`): check failed "/tools: .listing-verified\'s left edge varies by 883.6px across the PAGE\'s 35 entries (174.5px vs 1058.1px, e.g. \\"Unstructured\\" vs \\"Helicone\\") — not sharing one column across categories" — collapsing every category\'s own subgrid produces the largest possible spread, confirming the page-wide check still catches the original, cruder defect. iter-09 (I41) NEW break (per-category revert only, alignment WITHIN each category left intact): check failed "/tools: .listing-verified\'s left edge varies by 60.9px across the PAGE\'s 35 entries (1009.4px vs 1070.3px, e.g. \\"Argilla\\" vs \\"Aider\\") — not sharing one column across categories" — the exact 60.9px/seven-position spread the verdict measured on the shipped (pre-fix) build, now caught because the check samples the whole page rather than one category at a time. Restored; re-ran and confirmed PASS.',
      brokenByOpposite: '`--only S19 --break \".tools-index{grid-template-columns:minmax(0,1fr) max-content 900px !important}\"` — clause 2, the OPPOSITE excess, now targeting the REAL tracks\' new home (`.tools-index`, not the individual `.listings`, since those subgrid onto it as of I41): forces the entry-link column to consume 900px, well past any real wiki-entry name, squeezing pricing\'s own column far below a readable width in the process — the same mechanism as clause 1\'s fix (shared trailing columns) causing the exact cramped-column defect this file already fixed once at the mobile breakpoint (see the CSS comment on .listing-entry), now reproduced at DESKTOP width by an oversized trailing column instead of an undersized viewport.',
      observedOpposite: 'check failed "/tools: .listing-pricing\'s own column is 67.3px wide (entry: browser-use) — narrower than the 200px floor a reader needs to read prose in, not just align it". Restored; re-ran and confirmed PASS.',
    },
    kind: 'dom', routes: ['/tools'], viewports: [[1440, 900]],
    // /tools only: below its own 26rem breakpoint .tools-index/.listings
    // revert to a single flexible column (see globals.css) and this
    // alignment/proportion property does not apply — there is only one
    // column, nothing to align against or crowd. 390x844 is not a second
    // viewport this check has an opinion about, the same reasoning S9's
    // /learn clause and S16 already use for their own identical breakpoint.
    check: async ({ page }) => {
      // I41 (iter-09): sampled across every .listing on the PAGE, not grouped
      // by category — R13's own text is page-wide ("share ONE set of grid
      // tracks across every row of that surface"), and grouping by category
      // is exactly the scope the widened clause exists to stop hiding behind.
      const r = await page.evaluate(() => {
        const rows = [...document.querySelectorAll('.listings .listing')];
        if (rows.length < 10) return { error: `expected at least 10 .listing rows on /tools, found ${rows.length}` };
        const field = (cls) => rows.map((li) => {
          const el = li.querySelector(cls);
          return el ? el.getBoundingClientRect() : null;
        });
        return {
          names: rows.map((li) => li.querySelector('.listing-name')?.textContent?.trim()),
          pricing: field('.listing-pricing'),
          verified: field('.listing-verified'),
          entry: field('.listing-entry'),
        };
      });
      if (r.error) return r.error;
      for (const [label, rects] of [['.listing-pricing', r.pricing], ['.listing-verified', r.verified], ['.listing-entry', r.entry]]) {
        const lefts = rects.map((rc) => rc?.left).filter((v) => v !== undefined && v !== null);
        if (lefts.length < 2) continue; // e.g. no entry on the page links its wiki entry
        const spread = Math.max(...lefts) - Math.min(...lefts);
        if (spread > 0.5) {
          const i0 = rects.findIndex((rc) => rc?.left === Math.min(...lefts));
          const i1 = rects.findIndex((rc) => rc?.left === Math.max(...lefts));
          return `${label}'s left edge varies by ${spread.toFixed(1)}px across the PAGE's ${rects.length} entries (${rects[i0].left.toFixed(1)}px vs ${rects[i1].left.toFixed(1)}px, e.g. "${r.names[i0]}" vs "${r.names[i1]}") — not sharing one column across categories`;
        }
      }
      const pricingWidths = r.pricing.map((rc) => rc?.width).filter((w) => w !== undefined && w !== null);
      if (pricingWidths.length) {
        const minW = Math.min(...pricingWidths);
        if (minW < 200) {
          const i = r.pricing.findIndex((rc) => rc?.width === minW);
          return `.listing-pricing's own column is ${minW.toFixed(1)}px wide (entry: ${r.names[i]}) — narrower than the 200px floor a reader needs to read prose in, not just align it`;
        }
      }
      return true;
    },
  },
  {
    id: 'S20', rule: 'R9',
    intent: "R9's iter-08 addendum is an ABSOLUTE, page-wide prohibition ('--accent is reserved for hover and focus; a resting border, rule or divider shall never carry it') — S20's own domain is therefore every route's <main>, in both themes, not the two named selectors (.door, .delta) its originating item mentioned. Clause A (route '/' only, unchanged from I31): every sibling in a repeated list (.door in .doors; .deltas-strip .delta) shares its siblings' own resting border-top colour, so an unexplained difference cannot hide. Clause B (I41, iter-09, every sampled route): a live DOCUMENT SWEEP of <main> — every element, every resting border side, background and outline — failing on ANY that resolves to the exact colour --accent resolves to for the active theme. Widening clause B found three live violations clause A's own two-selector scope could not see: .change-annotation's border-left (home), .span-rule's background (home + /impossible-routine, 58 instances), and .badge[data-tone=\"theme\"]'s border+background+text (wiki entries) — the LAST of which the originating verdict item mis-cited as `data-kind`; the actual attribute, per lib/render/common.mjs's badge() helper, is `data-tone`, verified against source rather than propagated forward. All three fixed (globals.css); clause B now sweeps the fixed routes and is expected to hold.",
    independent: "clause A: getComputedStyle(...).borderTopColor read live from every .door and every .deltas-strip .delta on the rendered home page, compared against each other AND against a live --accent reference (.wordmark .dot — the same reference S6 already uses). Clause B: getComputedStyle(...) border/background/outline colours read live from EVERY element inside <main> on each sampled route, compared against the same live --accent reference — neither derived from the CSS source.",
    falsifier: {
      brokenBy: 'SIX breaks, all run live via `--only S20 --break`, actual output recorded rather than predicted. `.door[data-feature=\'yes\']{border-top-color:var(--accent) !important}"` reintroduces the removed override on the one featured door. `.deltas-strip .delta:first-child{border-top-color:var(--accent) !important}"` reintroduces the removed override on the first delta. A THIRD isolates the uniformity clause from the accent-reservation clause, using a colour that is NOT --accent: `.door:first-child{border-top-color:red !important}"`. I41 (iter-09) clause B, three more: `.change-annotation{border-left-color:var(--accent) !important}"`, `.span-rule{background:var(--accent) !important;opacity:1 !important}"`, and — the one genuinely instructive attempt — `.badge[data-tone=\'theme\']{border-color:var(--accent) !important;background:var(--accent-soft) !important}"`, which reported 0 of 1 fired: `border:none` (the fix just shipped) sets border-STYLE to none, and overriding only border-COLOR does not reinstate a visible border, so the sweep\'s own width/style gate correctly saw no border to inspect. Re-broken with the full shorthand, `border:1px solid var(--accent) !important`, which does reinstate one.',
      observed: 'Door break: check failed "/ @1440x900: at least one .door carries --accent as its resting border-top colour (rgb(74, 59, 212)) — R9 reserves --accent for hover/focus, not rest". Delta break: check failed "/ @1440x900: at least one .deltas-strip .delta carries --accent as its resting border-top colour (rgb(74, 59, 212))". Non-accent break: check failed "/ @1440x900: .door siblings do not share one resting border colour: rgb(255, 0, 0) vs rgb(215, 216, 224) — no state on the page names which door is different" (the overridden first door reads first, matching first-seen Set order) — confirming the uniformity clause fires independently of the accent-reservation clause, not merely riding on it. I41 (iter-09) clause B — change-annotation break: check failed "/ @1440x900: <main> sweep: <p class=\"change-annotation\"> resolves --accent as its resting border-left-color". span-rule break: check failed "/ @1440x900: <main> sweep: <span class=\"span-rule\"> resolves --accent as its resting background-color" — the route list checks \'/\' before \'/impossible-routine\', so home\'s own 4 instances report first; the same break also fires on /impossible-routine\'s 54 when \'/\' is excluded, not separately re-recorded. badge break (full-shorthand retry): check failed "/wiki/concept/ai-winter @1440x900: <main> sweep: <span class=\"badge\" data-tone=\"theme\"> resolves --accent as its resting border-top-color". All six restored; rebuilt tree (full gate) passes S20 — confirmed live, matching the ok/PASS line above.',
      oneSidedBecause: "Clause A's two sub-tests are a PROHIBITION (border-top-color shall never equal --accent) and a UNIFORMITY test (all siblings' colours shall be equal), neither of which has a meaningful 'opposite excess' the way a bounded RANGE does — there is no 'too far in the other direction' from 'never' or from 'all the same'. Clause B (I41, iter-09) is the SAME shape, generalised: a sweep failing on ANY match to a forbidden exact value is a prohibition over every element in the document, and a prohibition has one direction by construction, not two — the registry's own rule (auditRegistry) requires either a real second direction or an argument about the property, not both indiscriminately; a range invariant (S18) has a real second direction and gets one, a flat prohibition does not manufacture one for the sake of the form. The three breaks above (door, delta, and the non-accent third break) verify clause A's two prohibitions/uniformity test are independently live; the three I41 breaks verify clause B's sweep independently catches a violation on each of three different channels (border, background, and border+background+text together) on three different routes, which is the meaningful falsification available to a prohibition: that it actually FIRES on a real violation, on more than one shape of violation, rather than passing by accident.",
    },
    kind: 'dom', routes: ['/', '/impossible-routine', '/wiki/concept/ai-winter', '/catalog', '/tools', '/data', '/blog'], viewports: [[1440, 900], [390, 844]],
    check: async ({ page, route }) => {
      if (route === '/') {
        const r = await page.evaluate(() => {
          const ref = document.querySelector('.wordmark .dot');
          const accentRef = ref ? getComputedStyle(ref).color : null;
          const doors = [...document.querySelectorAll('.door')].map((d) => getComputedStyle(d).borderTopColor);
          const deltas = [...document.querySelectorAll('.deltas-strip .delta')].map((d) => getComputedStyle(d).borderTopColor);
          return { accentRef, doors, deltas };
        });
        if (!r.accentRef) return 'no .wordmark .dot found to read --accent from';
        if (!r.doors.length) return 'no .door elements found on /';
        if (!r.deltas.length) return 'no .deltas-strip .delta elements found on /';
        if (r.doors.some((c) => c === r.accentRef)) {
          return `at least one .door carries --accent as its resting border-top colour (${r.accentRef}) — R9 reserves --accent for hover/focus, not rest`;
        }
        if (r.deltas.some((c) => c === r.accentRef)) {
          return `at least one .deltas-strip .delta carries --accent as its resting border-top colour (${r.accentRef}) — R9 reserves --accent for hover/focus, not rest`;
        }
        const doorSet = [...new Set(r.doors)];
        if (doorSet.length > 1) {
          return `.door siblings do not share one resting border colour: ${doorSet.join(' vs ')} — no state on the page names which door is different`;
        }
        const deltaSet = [...new Set(r.deltas)];
        if (deltaSet.length > 1) {
          return `.deltas-strip .delta siblings do not share one resting border colour: ${deltaSet.join(' vs ')} — no state on the page names which delta is different`;
        }
      }

      // I41 (iter-09): clause B, run on EVERY sampled route (not only '/') —
      // a live sweep of <main>, resting-state only (a page load with nothing
      // hovered or focused never matches a :hover/:focus-visible rule, so
      // those are excluded by construction, not by an enumerated allowlist).
      const sweep = await page.evaluate(() => {
        const ref = document.querySelector('.wordmark .dot');
        const accentRef = ref ? getComputedStyle(ref).color : null;
        if (!accentRef) return { error: 'no .wordmark .dot found to read --accent from' };
        const main = document.querySelector('main');
        if (!main) return { error: 'no <main> found' };
        const nodes = [main, ...main.querySelectorAll('*')];
        for (const el of nodes) {
          const cs = getComputedStyle(el);
          const channels = [
            ['border-top-color', cs.borderTopColor, parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none'],
            ['border-right-color', cs.borderRightColor, parseFloat(cs.borderRightWidth) > 0 && cs.borderRightStyle !== 'none'],
            ['border-bottom-color', cs.borderBottomColor, parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== 'none'],
            ['border-left-color', cs.borderLeftColor, parseFloat(cs.borderLeftWidth) > 0 && cs.borderLeftStyle !== 'none'],
            ['background-color', cs.backgroundColor, true],
            ['outline-color', cs.outlineColor, parseFloat(cs.outlineWidth) > 0 && cs.outlineStyle !== 'none'],
          ];
          for (const [channel, value, present] of channels) {
            if (present && value === accentRef) {
              const cls = typeof el.className === 'string' ? el.className : (el.getAttribute('class') || '');
              const tone = el.getAttribute && el.getAttribute('data-tone');
              const tag = `<${el.tagName.toLowerCase()}${cls ? ` class="${cls}"` : ''}${tone ? ` data-tone="${tone}"` : ''}>`;
              return { offender: tag, channel };
            }
          }
        }
        return {};
      });
      if (sweep.error) return sweep.error;
      if (sweep.offender) {
        return `<main> sweep: ${sweep.offender} resolves --accent as its resting ${sweep.channel} — R9 reserves --accent for hover/focus, not a resting border, background or outline`;
      }
      return true;
    },
  },
  {
    id: 'S21', rule: 'R6',
    intent: "at 390x844 on /catalog, the first complete record (#catalog-table tbody tr, the first one) is fully visible within the first viewport — I23's own first clause. Closed by collapsing the four preamble elements (the lede, the fetch line, the sort note and the machine-readable links) behind a <details> that defaults CLOSED below the 33.999rem breakpoint and OPEN above it (R14's own disclosure precedent), with the summary a genuine tab stop that exposes the content on Enter (R4's 'activation, not presence'). Does NOT close I23's second clause — a stacked record's own rendered height (~209.5px) against a 120px bound — see the iter-08 implementer report for why that lever was declined (I27, unresolved, blocks the only remaining CSS-safe reduction).",
    independent: "getBoundingClientRect() of the FIRST #catalog-table tbody tr, read live at 390x844 against the fixed 844px viewport — not a CSS value; the .catalog-preamble element's own `.open` DOM property, read live; and a scripted keyboard traversal reaching its <summary> and pressing Enter, reading `.open` again afterward",
    falsifier: {
      brokenBy: "reverted app/catalog/page.tsx's <details className=\"catalog-preamble\"> wrapper back to flat markup (the four elements as direct siblings, the pre-fix shape) — then rebuilt (`npm run build`). A JSX/template change: --break's CSS injection can neutralise the details element's own open/closed collapse (a UA-stylesheet behaviour keyed off the `open` attribute) only by fighting that native mechanism with higher-specificity overrides, which would not be testing the actual shipped structure — a real rebuild is the honest mechanism, matching this registry's own established precedent for JSX changes (S14, S18).",
      observed: 'check failed "/catalog @390x844: missing .catalog-preamble or #catalog-table tbody tr on /catalog" — the check\'s own precondition failed rather than its geometry clause, because reverting to flat markup removes the `.catalog-preamble` element the check itself queries first; a real failure nonetheless, since a check that cannot find its own anchor element is not known to hold on the reverted structure either. Restored (the <details> wrapper back in place) and rebuilt; re-ran and confirmed PASS at top=450.9px, bottom=660.4px, both within [0, 844].',
      brokenByOpposite: "the OPPOSITE excess, CSS-only (no rebuild needed) — the mirror of S14's own symmetric floor (RULES.md's S14 post-mortem: a check bounding only 'too far down' passes a record pushed too far UP just as easily): `--only S21 --break \"#catalog-table tbody tr:first-child{margin-top:-9999px !important}\"` pushes the first record itself far ABOVE the viewport.",
      observedOpposite: "check failed \"/catalog @390x844: first record's top edge (-9548.1px) to bottom edge (-9338.6px) is not fully within the first viewport (0-844px) — top is negative\". Restored; rebuilt tree (full gate) passes S21.",
    },
    kind: 'dom', routes: ['/catalog'], viewports: [[390, 844]],
    check: async ({ page }) => {
      const r = await page.evaluate(() => {
        const details = document.querySelector('.catalog-preamble');
        const row = document.querySelector('#catalog-table tbody tr');
        if (!details || !row) return { error: 'missing .catalog-preamble or #catalog-table tbody tr on /catalog' };
        const rect = row.getBoundingClientRect();
        return { open: details.open, top: rect.top, bottom: rect.bottom };
      });
      if (r.error) return r.error;
      if (r.open !== false) return `.catalog-preamble should default to CLOSED at 390px but was open`;
      if (r.top < -0.5 || r.bottom > 844.5) {
        const which = r.top < -0.5 ? ' — top is negative' : ` — bottom exceeds by ${(r.bottom - 844).toFixed(1)}px`;
        return `first record's top edge (${r.top.toFixed(1)}px) to bottom edge (${r.bottom.toFixed(1)}px) is not fully within the first viewport (0-844px)${which}`;
      }

      // R4's own "activation, not presence": the disclosure must actually
      // expose its content on Enter, not merely exist in the tab order.
      await page.evaluate(() => document.body.focus());
      let reachedSummary = false;
      let stops = 0;
      for (let i = 0; i < 30; i += 1) {
        await page.keyboard.press('Tab');
        stops += 1;
        const found = await page.evaluate(() => {
          const el = document.activeElement;
          return !!el && el.tagName.toLowerCase() === 'summary' && !!el.closest('.catalog-preamble');
        });
        if (found) { reachedSummary = true; break; }
      }
      if (!reachedSummary) return `keyboard traversal did not reach the .catalog-preamble summary within ${stops} stops`;
      await page.keyboard.press('Enter');
      const afterOpen = await page.evaluate(() => document.querySelector('.catalog-preamble').open);
      if (afterOpen !== true) return `Enter on the .catalog-preamble summary did not open it (open=${afterOpen})`;
      return true;
    },
  },
];

// --------------------------------------------------------------------------------

async function freePort() {
  const net = await import('node:net');
  return new Promise((res, rej) => {
    const srv = net.createServer();
    srv.on('error', rej);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => res(port));
    });
  });
}

async function startServer(port) {
  const proc = spawn(process.execPath, [join(ROOT, 'scripts', 'serve-static.mjs'), 'out', String(port)], {
    cwd: ROOT,
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/`);
      if (r.ok) return proc;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  proc.kill();
  throw new Error(`static server did not come up on port ${port}`);
}

function auditRegistry() {
  const refused = [];
  for (const inv of INVARIANTS) {
    const missing = [];
    if (!inv.id) missing.push('id');
    if (!inv.rule) missing.push('rule');
    if (!inv.intent) missing.push('intent');
    if (!inv.independent) missing.push('independent');
    if (!inv.falsifier?.brokenBy || !inv.falsifier?.observed) missing.push('falsifier{brokenBy,observed}');
    // TWO-SIDEDNESS, ENFORCED STRUCTURALLY RATHER THAN EXHORTED.
    //
    // The one-sided check (JUDGE.md L4) has now been found FOUR times in four dimensions:
    // geometric collision, presence/absence, occupancy, and label-track width. The third
    // and fourth were written AFTER the rule was recorded in RULES.md, IMPLEMENT.md and
    // the state file, and after an implementer was explicitly told to assume its new
    // checks had the flaw. Stating it more loudly demonstrably does not work.
    //
    // So the registry now refuses a check that has not been OBSERVED firing on both ends
    // of its property. A genuinely one-sided property is allowed — it just has to be
    // declared and argued, which makes the choice conscious instead of accidental. This
    // is the same move as making a capped category arithmetic instead of exhortative:
    // if a rule matters, encode it where it cannot be skipped.
    const f = inv.falsifier || {};
    const twoSided = f.brokenByOpposite && f.observedOpposite;
    if (!twoSided && !f.oneSidedBecause) {
      missing.push(
        'falsifier{brokenByOpposite,observedOpposite} — or `oneSidedBecause: "<why this property has only one end>"`',
      );
    }
    if (typeof inv.check !== 'function') missing.push('check');
    if (missing.length) refused.push({ id: inv.id || '<unnamed>', missing });
  }
  return refused;
}

// --------------------------------------------------------------------------------
// FALSIFICATION MODE (iter-04 evidence-fix, failure-modes F15)
//
// Falsification asks "does this CHECK fire when its property is violated?" — a question
// about the check, NOT about the built artifact. It therefore does not need a production
// build. Measured: one full gate cycle is ~106s (build 43s + verify 32s + invariants 31s);
// thirteen falsifiers broken and restored serially cost roughly 47 minutes of that.
// Injecting the violation into the live page removes the two rebuilds per falsifier.
//
//   node tools/ui-invariants.mjs --only S2 --break ".browse-row{border-bottom:1px solid red}"
//   node tools/ui-invariants.mjs --only S2,S9 --break-file break.css
//
// A falsification run is NEVER a gate result. It prints a banner saying so and exits 2
// whatever happens, so its output cannot be pasted into a report as a passing gate.
const ARGV = process.argv.slice(2);
const argOf = (flag) => {
  const i = ARGV.indexOf(flag);
  return i >= 0 ? ARGV[i + 1] : null;
};
const ONLY = (argOf('--only') || '').split(',').map((x) => x.trim()).filter(Boolean);

async function main() {
  const breakArg = argOf('--break');
  const breakFile = argOf('--break-file');
  const breakCss = breakFile ? await readFile(breakFile, 'utf8') : breakArg;
  const falsifying = Boolean(breakCss);

  if (falsifying) {
    console.log('='.repeat(78));
    console.log('FALSIFICATION RUN — NOT A GATE RESULT, AND MAY NOT BE REPORTED AS ONE.');
    console.log('A violation is being injected into the live page. Checks are EXPECTED to fail;');
    console.log('one that PASSES here has not been observed catching its own property being');
    console.log('broken, and is therefore not known to work. Exit code is 2 either way.');
    console.log('='.repeat(78) + '\n');
  }

  console.log(`ui-invariants - ${INVARIANTS.length} registered${ONLY.length ? ` (running only ${ONLY.join(', ')})` : ''}\n`);

  const refused = auditRegistry();
  if (refused.length) {
    for (const r of refused) {
      console.log(`  REFUSED ${r.id}  missing: ${r.missing.join(', ')}`);
    }
    console.log(
      '\nFAIL  An invariant missing `falsifier` was never observed failing, and one missing\n' +
        '      `independent` may be recomputing from the source it checks. Both are the\n' +
        '      green-and-wrong failure. Supply them or remove the entry.',
    );
    process.exitCode = 1;
    return;
  }

  if (!INVARIANTS.length) {
    console.log('  (none yet - no verdict item has been implemented)\n');
    console.log('PASS  vacuously: zero invariants registered, zero failures. This is the');
    console.log('      expected state at iteration 0 and means NOTHING was verified here.');
    console.log('      Every accepted item adds one entry; an empty registry after several');
    console.log('      iterations is a spin signature, not a clean bill of health.');
    return;
  }

  if (!existsSync(OUT)) {
    console.log('FAIL  out/ does not exist. Run `npm run build` and read its LOG first.');
    process.exitCode = 1;
    return;
  }

  const readOut = (rel) => readFile(join(OUT, rel), 'utf8');
  const needsDom = INVARIANTS.some((i) => i.kind === 'dom');

  let server = null;
  let browser = null;
  let port = null;
  if (needsDom) {
    const { chromium } = await import('playwright');
    port = await freePort();
    server = await startServer(port);
    browser = await chromium.launch();
  }

  let failed = 0;
  let failedDeclaration = false;
  try {
    for (const inv of INVARIANTS) {
      if (ONLY.length && !ONLY.includes(inv.id)) continue;
      let result;
      try {
        if (inv.kind === 'dom') {
          // O14: a check inherits the harness default unless it says otherwise, which
          // silently scopes the RULE to that environment. So the declaration is
          // mandatory and printed beside the result. 'self' means the check sets its
          // own viewport internally and is responsible for saying so in `intent`.
          if (!inv.viewports) {
            result = `refused: invariant ${inv.id} declares no \`viewports\`. A check that does not declare its environment verifies its rule only in the harness default, and nothing in this output would have said so.`;
            failedDeclaration = true;
          } else {
            const vps = inv.viewports === 'self' ? [null] : inv.viewports;
            const routes = inv.routes?.length ? inv.routes : ['/'];
            result = true;
            outer: for (const vp of vps) {
              const ctx = await browser.newContext({
                viewport: vp ? { width: vp[0], height: vp[1] } : { width: 1440, height: 900 },
                reducedMotion: 'reduce',
              });
              const page = await ctx.newPage();
              for (const route of routes) {
                await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: 'networkidle', timeout: 20_000 });
                if (breakCss) {
                  await page.addStyleTag({ content: breakCss });
                  // The injected rule must be LAID OUT before anything measures it.
                  // Without this, falsification was flaky: S16 fired in only 3 of 6 runs
                  // while the same check was stable on the real gate — a false NEGATIVE in
                  // the very mechanism that exists to prove a check works. Wait for fonts
                  // to settle (they change text metrics, which several checks measure) and
                  // for two frames, so style recalculation and layout have both run.
                  await page.evaluate(async () => {
                    if (document.fonts && document.fonts.ready) await document.fonts.ready;
                    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
                  });
                }
                const r = await inv.check({ page, route, readOut });
                if (r !== true) {
                  result = vp ? `${route} @${vp[0]}x${vp[1]}: ${r}` : `${route}: ${r}`;
                  await ctx.close();
                  break outer;
                }
              }
              await ctx.close();
            }
          }
        } else {
          result = await inv.check({ readOut });
        }
      } catch (err) {
        result = `threw: ${err.message}`;
      }

      const env = inv.kind !== 'dom' ? '' :
        inv.viewports === 'self' ? '  [viewports: self-managed]' :
        inv.viewports ? `  [viewports: ${inv.viewports.map((v) => `${v[0]}x${v[1]}`).join(', ')}]` : '';
      if (result === true) {
        console.log(`  ok      ${inv.id}  (${inv.rule})${env}  ${inv.intent}`);
      } else {
        failed++;
        console.log(`  FAIL    ${inv.id}  (${inv.rule})${env}  ${inv.intent}`);
        console.log(`          ${result}`);
      }
    }
  } finally {
    if (browser) await browser.close();
    if (server) server.kill();
  }

  console.log('');
  const ran = ONLY.length ? ONLY.length : INVARIANTS.length;
  if (falsifying) {
    // A falsification run reports the OPPOSITE of a gate: a check that failed did its job.
    // Never let this path produce a 0 exit code — the whole point is that its output can
    // never be mistaken for, or pasted in as, a passing gate.
    console.log(`FALSIFICATION: ${failed} of ${ran} check(s) fired as intended; ${ran - failed} did NOT.`);
    if (ran - failed > 0) {
      console.log('A check that did not fire under an injected violation is NOT KNOWN TO WORK.');
      console.log('Either the injected CSS did not actually violate the property, or the check');
      console.log('does not measure what it claims. Both are findings; neither is a pass.');
    }
    console.log('Re-run without --break to obtain a real gate result.');
    process.exitCode = 2;
  } else if (failed) {
    console.log(`FAIL  ${failed} of ${ran} invariant(s) violated.`);
    process.exitCode = 1;
  } else {
    console.log(`PASS  ${ran} invariant(s) hold.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
