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
      brokenBy: "FOUR episodes, the last with three sub-breaks. (1) iter-01: the first cut of `.badge:not([data-tone])` set only `border-color: transparent`, which keeps a 1px border BOX (just invisible) — this shipped briefly and the check caught it for real, unprompted, before any deliberate break; fixed by using `border: none` instead. (2) iter-01: deliberately re-added `border-bottom: 1px solid var(--rule)` to `.data-table th, .data-table td` (at a time when R8 still forbade it everywhere). (3) iter-02 round 3: once the harness gained a declared `viewports` array and started actually running S2 at 390x844, it caught a rule between every pair of stacked mobile catalog records — the same then-forbidden shape relocated into the new mobile layout. (4) iter-03, run live, BOTH directions required by IMPLEMENT.md now that R8 is surface-conditioned rather than a blanket ban, plus one extra sub-case: (4a) removed `border-bottom` from both `#catalog-table tbody tr` AND `.rail-changes > .rail-item` at once (the iter-03 restoration undone) to confirm the check catches a rule MISSING where the test now requires it — then, with only `#catalog-table tbody tr` restored, re-ran to isolate the home-feed failure independently of the catalog one. (4b) with both restorations back, added `border-bottom: 1px solid var(--rule)` to `.browse-row` to confirm the check catches a rule PRESENT where the test forbids it. (4c) restored `.browse-row`, then removed the explicit `border-bottom: none` override on `#catalog-table tbody tr` inside the `max-width: 33.999rem` block, to confirm the check also catches the desktop rule leaking into the 390px stacked-record layout — the exact shape iter-02 round 3 (episode 3 above) already found wrong once. (5) RD-003 fix 3, the home Frontier door added to the forbidden side [OBSERVED: check failed \"/ @1440x900: the home Frontier door must not carry a rule between its rows (RULES.md R8 — three near-uniform rows of nothing but links; the links already carry the row's signal) but has 1px\"; restored, rebuilt tree passes S2]: `--only S2 --break \".frontier-door-row{border-bottom:1px solid var(--rule) !important}\"` restores exactly the rule RD-002 fix 3 gave the door and F-hier-11 filed against — the OPPOSITE half is already live on the same route and the same run, the changed feed's required rule, so R8's two directions are exercised on one surface.",
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
          // RD-003 fix 3 (F-hier-11). The SAME surface, the other side of R8's
          // test: the Frontier door is three near-uniform rows of nothing but
          // links, so the rule is FORBIDDEN there exactly as it is on
          // `.browse-row` below — while the ragged changed feed above needs
          // it. Both directions of R8 are therefore asserted on one route, on
          // two blocks sitting in the same rail, which is what makes this a
          // test of the RULE rather than of a selector list. The door's own
          // `border-top` (the group container's boundary mark, drawn once) is
          // permitted by R8's text and is not what is measured.
          const doorRows = document.querySelectorAll('.frontier-door-row');
          const doorBorder = doorRows.length
            ? Math.max(...[...doorRows].map((d) => parseFloat(getComputedStyle(d).borderBottomWidth) || 0))
            : null;
          return { border, doorRows: doorRows.length, doorBorder };
        });
        if (r.error) return r.error;
        if (!(r.border > 0)) {
          return `mid-feed changed entry requires a border-bottom rule (RULES.md R8 — ragged entry heights need it) but has none (${r.border}px)`;
        }
        if (r.doorRows < 2) {
          return `fewer than 2 .frontier-door-row rows rendered on / — R8's forbidden-side clause would be vacuous`;
        }
        if (r.doorBorder > 0) {
          return `the home Frontier door must not carry a rule between its rows (RULES.md R8 — three near-uniform rows of nothing but links; the links already carry the row's signal) but has ${r.doorBorder}px`;
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
    intent: "R10's own domain is EVERY route with a rule dividing a content block, not the routes any one item happened to name — a horizontal rule shall span the same rendered width as the block it introduces, instead of an unrelated wider shell. Checked against .entry-head/.prose AND the FACTS section heading on a wiki entry (I20), against each of /data's four section headings (I20), against /blog's .rail-posts (its border-top) versus the widest rendered row in its own list (I35, iter-08 — the one index template this check never sampled at the time, which is why the gate stayed green over a 652px overhang), against /catalog's `.catalog-preamble > summary` border-bottom versus the widest line of the disclosure it introduces (I40, iter-09 — this round's own I23 catalog-preamble remedy reopened the identical defect I35 had just closed, on the ONE index template S5 STILL never sampled, and the gate stayed green over a 413.1px overhang for the length of a single round), and as a regression guard against /colophon's .listing-facts (never broken, confirmed to stay that way). RD-002 fix 4 (F-struct-2, round-2 addendum): the wiki-entry clause now ALSO samples `.rails` — the block the round-2 findings call `.entry-rails`, REFERENCED HERE / APPEARS IN — where each section's own border-top was spanning its 292.0px grid track instead of the 130.0px and 216.0px lists it introduced, 162.0px and 76.0px of overhang that stayed green because S5 had never looked at this block at all",
    independent: 'rendered getBoundingClientRect widths compared pairwise on the same page — .entry-head vs .prose, the FACTS <h2> vs .facts, each /data <h2>.section-title vs its own <section>, .rail-posts vs the widest of its own .rail-item rows, .catalog-preamble > summary vs the widest of the preamble\'s own content lines, .listing-facts vs .prose — an emergent runtime match, not a shared token read from source',
    falsifier: {
      brokenBy: "SEVEN breaks. (1) iter-01: removed `max-width: var(--measure)` from `.entry-head`. (2) iter-04 (I20): removed the new `.entry-facts, .entry-timeline { max-width: var(--measure) }` rule. (3) iter-04: removed the new `.section:has(> .browse), .section:has(> .footer-links) { width: fit-content }` rule. (4) iter-04: confirmed the /colophon regression guard is live by temporarily removing `.listing-facts`'s pre-existing `max-width: var(--measure)`. (5) iter-08 (I35): `--only S5 --break \".rail-posts{width:100% !important}\"` — reverts .rail-posts to its pre-fix full-shell width, reproducing the original 652px overhang this round closed. FIRST ATTEMPT at (5) measured `li.getBoundingClientRect().width` (the row's outer BOX) rather than its grid content, and reported NOT firing (0 of 1): `.rail-item` is a block-level li whose outer box fills whatever width `.rail-posts` happens to be, so forcing `.rail-posts` back to 100% pulled every row's outer box back to 1152px right alongside it — S1's OWN historical vacuous-box mistake (RULES.md R7's post-mortem), reproduced on a new surface by the person who had just read that post-mortem. Rewritten to read each row's own RESOLVED `grid-template-columns` (summed with its gap) instead, independent of .rail-posts's width — see the check's own comment. (6) iter-09 (I40): `--only S5 --break \".catalog-preamble[open] > summary{border-bottom:1px solid var(--rule) !important}\"` — reintroduces the removed rule. THREE ATTEMPTS were needed, both prior ones vacuous for reasons the check's own comment records in full: attempt 1 measured each DIRECT CHILD's box (two of the four content lines are DIV-wrapped `<p>`s, app/catalog/page.tsx, so the direct child measured was the DIV's own unconstrained, full-width box); attempt 2 applied a Range to those same direct children, still vacuous because a Range over an element whose only content is a BLOCK child returns that block's own box, not a text line. Attempt 3 selects the four text-bearing `<p>` elements directly (`.page-lede, .fetch-line, .sort-note`) and Ranges those. (7) iter-09 (I40): with (6) still applied, `--break \".catalog-preamble[open] > summary{border-bottom:1px solid var(--rule) !important; display:inline-block !important; width:50px !important;}\"` — forces the rule's own span down to 50px while the disclosure's content stays wide, testing the OPPOSITE sign. (8) RD-002 (F-struct-2) NEW, the `.rails` clause: `--only S5 --break \".rails{display:grid !important;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr)) !important;width:auto !important} .rails > .rail{width:auto !important}\"` — reverts `.rails` to the exact two-track grid this round retired, putting each rail's rule back on its shared 292px track over its own shorter list. OBSERVED: check failed \"/wiki/concept/ai-winter @1440x900: .rails section \\\"rail rail-referenced\\\"'s heading rule spans 292.0px, 160.1px away from its own widest rendered child (131.9px)\" — the verdict's own 162.0px overhang. RECORDED HONESTLY: the first attempt omitted `width:auto` on `.rails` and did NOT fire (0 of 1) — informative, not a defect: `.rails` keeps `width: fit-content`, and an auto-fit/1fr track list inside an intrinsically-sized container resolves to ONE column, so the injected grid never actually produced a second track. OPPOSITE SIGN, same clause: `--only S5 --break \".rails > .rail{width:60px !important} .rails > .rail li{min-width:400px !important}\"`, which fired with \"heading rule spans 60.0px, 42.6px away from its own widest rendered child (102.6px)\" — the rule narrower than its content. Both restored.",
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
          // RD-002 fix 4 (F-struct-2, R10). `.rails` — the block the round-2
          // findings name `.entry-rails` — is REFERENCED HERE / APPEARS IN.
          // Each of its sections carries a border-top: a rule introducing that
          // section's own list, which shall span that list and not a grid
          // track it happened to share with a shorter neighbour (measured
          // 292.0px of rule over 130.0px and 216.0px of content). Measured
          // with a Range over the TEXT-BEARING elements (the h2 and each li),
          // never the sections' block children's boxes — those fill whatever
          // width the section is and would make this vacuous, the mistake
          // this check's own /blog and /catalog clauses each made once.
          out.rails = [];
          // `.rails`' children are `<aside class="rail rail-referenced">` /
          // `rail-appears-in` (lib/render/entry.mjs) — selected by class, not
          // by tag: a tag selector here matched nothing and would have made
          // this clause silently vacuous, which is the failure this harness
          // refuses on principle.
          for (const section of document.querySelectorAll('.rails > .rail')) {
            if (!(parseFloat(getComputedStyle(section).borderTopWidth) > 0)) continue;
            let widest = 0;
            for (const node of section.querySelectorAll('h2, li')) {
              const range = document.createRange();
              range.selectNodeContents(node);
              for (const rect of range.getClientRects()) if (rect.width > widest) widest = rect.width;
            }
            out.rails.push({
              cls: section.className,
              ruleW: section.getBoundingClientRect().width,
              contentW: widest,
            });
          }
          return out;
        });
        if (r.error) return r.error;
        for (const s of r.rails ?? []) {
          if (!(s.contentW > 0)) continue;
          const railDiff = Math.abs(s.ruleW - s.contentW);
          if (railDiff > 1) {
            return `.rails section "${s.cls}"'s heading rule spans ${s.ruleW.toFixed(1)}px, ${railDiff.toFixed(1)}px away from its own widest rendered child (${s.contentW.toFixed(1)}px)`;
          }
        }
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
    intent: "R8's iter-08 addendum governs THREE surfaces, not the two S17 originally sampled: no column of a record/listing surface renders an identical value on more than 90% of its rows at the same visual weight as the columns a reader compares across, measured as COMPUTED COLOUR and not only as the presence of a link. /catalog's Read column (a value constant across the collection is stated once, renderFetchLine, above the table, and rendered per row at --muted rather than the ink weight of the Model/numeric columns); /tools' .listing-verified column (iter-08, I36 — S17 previously tested only ONE surface and only ONE emphasis mechanism, so it was green while /tools' verification date sat at the identical computed colour as .listing-pricing, the field a reader actually compares across a category); and the home changed feed's provenance link (I42, iter-09 — WORSE than either: the repeated value ('source', 24 of 24 rows) did not merely match the compared column's weight, it read LOUDER, at --accent, than the record link beside it). RD-002 fix 2 (F-hier-5 + F-struct-4): /frontier is the FOURTH, and the one R8's badge clause names outright - the players board's VENDOR CLAIM column rendered a bordered chip on 16 of 16 rows, a value identical on 100% of them and boxed, which S17 was green over only because its route list predated the route. Two sub-tests there: no board cell is a bordered chip at all, and no column repeats one value on more than 90% of rows at or above the computed weight of the numeric columns. All four now sampled by one route list. On every surface a row whose own value genuinely differs from its collection's/category's/feed's dominant one keeps full weight, exactly as R8's badge clause keeps a status chip only where the tone differs from the default.",
    independent: "/catalog clause 1a (link presence, unchanged): whether an <a> element exists inside each row's Read <td>, read from the REAL /catalog page's live DOM (396 actual rows). /catalog clause 1b (iter-08, NEW): the dominant Read value's own `getComputedStyle(...).color`, read live, compared against a numeric column cell's computed colour on the SAME live page — independent of clause 1a's link-presence signal, so a future rule that decouples colour from link structure cannot hide behind clause 1a alone. /catalog clause 2 (the badge-clause's other half, which the real page's data cannot currently exercise — every row shares one source today): renderCatalogTable itself, called directly with a SYNTHETIC 10-row fixture (9 sharing one fetch date, 1 genuinely different), parsed with cheerio. /tools clause 1 (iter-08, NEW): per category (.listings), the dominant .listing-verified text's own computed colour compared against .listing-pricing's computed colour on the SAME live entry, read from the REAL /tools page (12 categories, 35 listings). /tools clause 2 (iter-08, NEW): categorySection called directly with a SYNTHETIC 10-listing group (9 sharing one verification date, 1 genuinely different), parsed with cheerio, asserting the rendered `data-default` attribute — the real page's data cannot exercise this either, every category shares one date today. Home clause (I42, iter-09, NEW): the dominant a.src text's own `getComputedStyle(...).color`, read live from the REAL home page (24 changed-feed entries), compared against a.change-name's (or the unlinked .change-name span's) computed colour on the SAME row — the record link is the comparison reference named directly in the invariant, not a numeric column, since the changed feed has no numeric field to compare against.",
    falsifier: {
      brokenBy: 'reverted the Read cell\'s condition in `catalogRowHtml` (lib/render/catalog.mjs) from `row.source_url && !isDefaultFetch` back to the pre-fix `row.source_url` alone, THEN rebuilt (`npm run build`) — the exact I8 defect, every row linked regardless of whether its date matches the collection default. The rebuild is necessary here: clause 1 reads the REAL, already-built /catalog page from `out/`, which only reflects a source edit after `next build` regenerates it — unlike S1-S16, this property is a render-logic/template change, not CSS, so `--break`\'s runtime CSS injection cannot reach it at all (confirmed: running the break WITHOUT rebuilding left clause 1 reading the stale, still-correct build and passing — only clause 2\'s dynamic import, which re-reads the source file directly with no build step, caught it, with the message from the OTHER falsifier episode below; the accurate two-step process is recorded here rather than the single-step one first assumed). iter-08 (I36) NEW, clause 1b: `--only S17 --break "#catalog-table td[data-label=\'Read\'] > time{color:var(--ink) !important}"` — forces the unlinked, majority-date cells back to full ink WITHOUT touching link structure at all, reproducing the exact defect I36 found: S17 was green over this because clause 1a only ever looked at the <a>, never at colour. iter-08 (I36) NEW, /tools clause 1: `--only S17 --break ".listing-verified{color:var(--ink) !important}"` — the same shape on the second surface. I42 (iter-09) NEW, home clause: `--only S17 --break ".src{color:var(--ink) !important}"` — raises the changed feed\'s provenance link to full ink, matching a.change-name\'s own weight, reproducing the pre-fix defect on the third surface. RD-002 (F-hier-5/F-struct-4) NEW, /frontier sub-test (b): `--only S17 --break "#frontier-board .board-claim .hatch-text{color:var(--ink) !important;font-size:var(--step--1) !important;font-style:normal !important}"` - raises the majority claim-column state to the numeric columns\' own computed weight without touching any class or chip, the same shape of defect as the /catalog and /tools breaks above, on the fourth surface. Sub-test (a) cannot be reached from CSS at all (the chip is a `.badge` element the render no longer emits), so it is falsified by a source edit — restoring the removed `el(\'span\', {class: \'badge\', ...})` in lib/render/frontier.mjs and rebuilding. OBSERVED, sub-test (a): check failed "/frontier @1440x900: 16 bordered chip(s) inside #frontier-board (e.g. \'claimed \u00b7 unverified\') - R8 boxes a badge only where its tone differs from the collection default", the exact 16-of-16 the verdict measured. OBSERVED, sub-test (b): the break above was aimed at the claim column, but the live defect the widened clause actually found first was the READ column - check failed "/frontier @1440x900: board column 6 repeats \'openrouter-models \u00b7 2026-09-05\' on 100.0% of 16 rows at the same weight (rgb(26, 27, 34), 13.0px) as the numeric columns a reader compares across" - found on the REAL gate before any break, fixed by reusing renderFetchLine plus a --muted default row, and re-broken with `--only S17 --break "#frontier-board .board-read[data-default]{color:var(--ink) !important}"`, which fired with the identical message. Both restored; rebuilt tree passes S17.',
      observed: 'WITHOUT a rebuild (source reverted, `out/` still the fixed build): check failed via clause 2 only — "synthetic fixture: 9 of 9 majority-date rows still render their Read cell as a link, despite sharing the collection\'s dominant fetch date" — clause 1 passed (stale build). WITH the rebuild: check failed via clause 1a — "/catalog: the Read column\'s dominant value \\"2026-08-31\\" appears on 396/396 rows (100.0%) and 396 of them still render at link weight (an <a> in the cell) — a collection-constant value is repeated per row at the same visual weight as the Model column". Restored and rebuilt; re-ran and confirmed PASS. iter-08 clause 1b: check failed "/catalog: the Read column\'s dominant value \\"2026-08-31\\" renders at rgb(26, 27, 34), the SAME computed colour as the numeric columns (rgb(26, 27, 34)) a reader compares across — link absence alone did not lower its visual weight". iter-08 /tools clause 1: check failed \'/tools category "agents": the .listing-verified column\\\'s dominant value "verified 2026-08-28" appears on N/N listings (100.0%) and renders at the SAME computed colour (rgb(26, 27, 34)) as .listing-pricing\'. I42 (iter-09) home clause: check failed "/: the changed feed\'s provenance link text \\"source\\" appears on 24/24 rows (100.0%) and renders at the SAME computed colour (rgb(26, 27, 34)) as the record link (rgb(26, 27, 34)) it sits beside" — matching the verdict\'s own "24 of 24" reading exactly. All restored; rebuilt tree (full gate) confirmed PASS.',
      brokenByOpposite: 'reverted the same condition the OTHER direction — `const isDefaultFetch = true;` unconditionally (the link suppressed even for a row whose date genuinely differs) — the opposite excess: R8\'s badge-clause other half, unmet. This is exactly the shape iter-06 found missing on S2 (an \'ended\'-status badge losing its box) applied to this same clause on a different column. No rebuild needed for this direction: clause 1 (the real page, rebuilt and restored beforehand) stays green regardless, since the real data has no minority row to expose the loss — which is exactly why clause 2 exists; clause 2\'s dynamic import picks up the source edit immediately. iter-08 (I36) NEW, /tools: the identical shape on the second surface — inverted `renderListingRow`\'s `isDefaultVerified` comparison in lib/render/tools.mjs (`===` to `!==`) so the MAJORITY rows lose `data-default="yes"` and the ONE minority row gains it — re-ran WITHOUT --break (clause 2\'s dynamic `import()` re-reads the current source directly, same mechanism as /catalog\'s own clause 2, since neither CSS injection nor a rebuild can reach a JS-logic inversion the way clause 1\'s real DOM read needs one).',
      observedOpposite: 'check failed "synthetic fixture: the ONE row with a genuinely different fetch date (the exception the collection default is stated FOR) lost its link — R8\'s badge-clause other half, unmet". Clause 1 confirmed unaffected (still passing on the real page), showing clause 2 exercises code clause 1 cannot reach. iter-08 /tools: check failed "synthetic /tools fixture: 9 of 9 majority-date listings do NOT carry data-default=\\"yes\\" — R8\'s badge-clause other half (the default stays demoted) is unmet". Both restored; re-ran and confirmed PASS. I42 (iter-09) home clause: no dedicated opposite-direction fixture — the changed feed has no numeric or fixed-format field a `data-default`-style attribute could attach to (unlike /catalog\'s fetch date and /tools\' verification date, both of which have that mechanism already built for the badge-clause\'s other half), and today\'s live feed carries no genuinely-different-source row to exercise one against. The registry\'s own two-sidedness requirement is satisfied at the INVARIANT level by the /catalog and /tools opposite-direction fixtures above, which exercise the identical badge-clause-other-half property this clause shares; a THIRD, home-specific synthetic fixture was judged not to add a new failure mode, only a third instance of the same one already covered.',
    },
    kind: 'dom', routes: ['/catalog', '/tools', '/', '/frontier'], viewports: [[1440, 900]],
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
      if (route === '/frontier') {
        // RD-002 fix 2 (F-hier-5 + F-struct-4, R8's badge clause). The FOURTH
        // surface, and the one R8's badge clause names outright: /frontier's
        // VENDOR CLAIM column rendered a bordered "claimed · unverified" chip
        // on 16 of 16 rows — a value identical on 100% of rows, boxed, and
        // the flagship's loudest repeated mark. TWO sub-tests, because the
        // defect had two halves and either alone lets the other through:
        //   (a) NO board cell is a bordered chip at all. R8 boxes a badge
        //       only where its tone differs from the collection's default;
        //       on a board whose every row carries the same state, the
        //       default IS the state, so the chip has nothing to say.
        //   (b) No column repeats one value on more than 90% of rows at or
        //       above the computed weight of the numeric columns a reader
        //       compares across — measured as computed colour AND font
        //       weight, not as the presence of a class, which is what let
        //       this pass on /catalog and /tools before I36 and I42.
        const dom = await page.evaluate(() => {
          const table = document.getElementById('frontier-board');
          if (!table) return { error: 'missing #frontier-board on /frontier' };
          const boxed = [...table.querySelectorAll('.badge')].filter(
            (b) => parseFloat(getComputedStyle(b).borderTopWidth) > 0,
          );
          if (boxed.length) return { boxed: boxed.length, boxedText: boxed[0].textContent.trim() };
          const bodyRows = [...table.querySelectorAll('tbody tr')];
          if (bodyRows.length < 5) return { error: `expected at least 5 board rows, found ${bodyRows.length}` };
          // The reference weight: what a compared (numeric) cell renders at.
          const ref = table.querySelector('td[data-numeric]');
          if (!ref) return { error: 'no numeric board cell to weigh the repeated columns against' };
          const refStyle = getComputedStyle(ref);
          const reference = { color: refStyle.color, size: parseFloat(refStyle.fontSize) };
          const cols = [];
          const width = bodyRows[0].children.length;
          for (let i = 0; i < width; i += 1) {
            const cells = bodyRows.map((tr) => tr.children[i]).filter(Boolean);
            const counts = new Map();
            for (const c of cells) {
              const t = c.textContent.trim();
              counts.set(t, (counts.get(t) ?? 0) + 1);
            }
            let top = ['', 0];
            for (const e of counts) if (e[1] > top[1]) top = e;
            const sample = cells.find((c) => c.textContent.trim() === top[0]);
            const cs = getComputedStyle(sample);
            cols.push({
              index: i,
              value: top[0],
              share: top[1] / cells.length,
              color: cs.color,
              size: parseFloat(cs.fontSize),
            });
          }
          return { cols, reference, rows: bodyRows.length };
        });
        if (dom.error) return dom.error;
        if (dom.boxed) {
          return `${dom.boxed} bordered chip(s) inside #frontier-board (e.g. "${dom.boxedText}") — R8 boxes a badge only where its tone differs from the collection default`;
        }
        for (const c of dom.cols) {
          if (c.share <= 0.9 || !c.value) continue;
          const atReferenceWeight = c.color === dom.reference.color && c.size >= dom.reference.size - 0.01;
          if (atReferenceWeight) {
            return `board column ${c.index} repeats "${c.value}" on ${(c.share * 100).toFixed(1)}% of ${dom.rows} rows at the same weight (${c.color}, ${c.size.toFixed(1)}px) as the numeric columns a reader compares across — state it once above the board instead`;
          }
        }
        return true;
      }

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
    intent: "R13's iter-07(a) dead-track floor. On the home page at 1440x900, the SHORTER of .home-side / .rail-changes reaches at least 60% of the TALLER one's own height. CP-UI-001-2 (round-2 addendum): the wiki-entry clause that lived here (I40, iter-09 — .prose vs .entry-side, honestly left FAILING at 32-40%) is RETIRED, not raised or reworked: the wiki entry template no longer declares a two-column grid at all (globals.css, lib/render/entry.mjs — FACTS/TIMELINE/RAILS render single-column, in order, after PROSE), so there is no second track for a 60% floor to be asked of. RD-002 fix 4 (F-struct-3; AR-001 D4): a SECOND clause now samples the wiki entry again, on the block that survived that retirement — `.rails` (REFERENCED HERE / APPEARS IN, what the round-2 findings call `.entry-rails`), still a two-track grid at 44.9% (61.0px against 136.0px). AR-001 D4: retiring an assertion does not retire its rule. The clause is generalised past one named pair and asks R13's own two-part question — EITHER one flow, or a shorter column at 60% of the taller — reading columns off the children's rendered left edges rather than any grid declaration.",
    independent: "getBoundingClientRect().height of .home-side and .rail-changes on /, and of .prose and .entry-side on the wiki entry — read live from each rendered page, not any CSS value and not either element's own content count",
    falsifier: {
      brokenBy: "reverted app/page.tsx's I9 fix — removed the relocated 'Everything here' <section> from inside <aside className=\"home-side\"> and restored it to its original position below .home-grid — then rebuilt (`npm run build`). This is a JSX/template change: --break's runtime CSS injection cannot move an element between two different parents, so unlike the CSS-only checks in this registry a real rebuild is the correct falsification mechanism here, not --break (see IMPLEMENT.md: 'use a real rebuild only where the property cannot be violated from CSS'). RD-002 (F-struct-3) NEW, the `.rails` clause: `--only S18 --break \".rails{display:grid !important;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr)) !important;width:auto !important} .rails > .rail{width:auto !important}\"` — reinstates the exact two-track grid this round retired. OBSERVED: check failed \"/wiki/concept/ai-winter @1440x900: .rails renders 2 columns and its shorter one (82.2px) reaches only 52.4% of the taller (156.9px) — under R13's 60% floor, and it is not one flow either\", the verdict's own shape (it measured 44.9% on a differently-sized sample). RECORDED HONESTLY, TWICE: the first attempt omitted `width:auto` on `.rails` and produced one column, not two, so it did NOT fire; the second attempt DID produce two columns and STILL did not fire, and that one was a defect in the check — it measured each item's own BOX height, and a grid row stretches every item in it to the same height, so a box-height ratio there is 100% by construction, S1's own vacuous-box mistake on a new surface. Rewritten to measure each item's OCCUPIED height (its last rendered child's bottom, less its own top), which is what R13's floor is about, and it then fired. OPPOSITE SIGN, same clause: the same break plus `.rail-referenced li{height:300px !important}` swaps which rail is the short one and fired with \"its shorter one (156.9px) reaches only 24.8% of the taller (632.3px)\", confirming the min/max formula is genuinely symmetric. All restored.",
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
    kind: 'dom', routes: ['/', '/wiki/concept/ai-winter'], viewports: [[1440, 900]],
    // Home-only for the FIRST clause: .home-grid's two-column split exists
    // solely at the >=60rem breakpoint (see globals.css); below it both
    // stack full-width in one column and this ratio is undefined (nothing
    // to compare side-by-side), so 390x844 is not a second viewport either
    // clause has an opinion about — the wiki-entry clause below has the
    // identical reasoning for its own >=60rem breakpoint.
    check: async ({ page, route }) => {
      if (route === '/wiki/concept/ai-winter') {
        // RD-002 fix 4 (F-struct-3; AR-001 D4). S18's wiki-entry clause was
        // retired last round along with `.entry-side` — but AR-001 D4 is
        // explicit that retiring an ASSERTION does not retire its RULE, and
        // R13's 60% floor still bound `.rails` (the block the round-2
        // findings call `.entry-rails`), measured at 44.9%: 61.0px against
        // 136.0px. The clause returns, generalised past the one named pair,
        // and asks R13's own two-part question rather than only the floor:
        // EITHER the block is one flow (no second track for a floor to be
        // asked of) OR its shorter column reaches 60% of the taller. Columns
        // are read from the children's own rendered left edges, not from any
        // grid-template-columns value — a flex column, a grid, a float or a
        // future mechanism all answer the same question the same way.
        const r = await page.evaluate(() => {
          const rails = document.querySelector('.rails');
          if (!rails) return { error: 'missing .rails on this entry' };
          const kids = [...rails.children];
          if (!kids.length) return { error: '.rails has no children to measure' };
          // OCCUPIED height, not the item's own box height. A grid (or a
          // stretched flex row) makes every item in a row exactly as tall as
          // the tallest, so item boxes are ALWAYS equal there and a ratio over
          // them is 100% by construction — it would report a dead track as
          // full, the vacuous reading this registry has now recorded on four
          // different checks. R13's floor asks whether the track is OCCUPIED,
          // so what is measured is each item's own content: the bottom of its
          // last rendered child, less its own top. Under the pre-round grid
          // that reads 61.0px against 136.0px — the verdict's own 44.9%.
          const occupied = (n) => {
            const r = n.getBoundingClientRect();
            let bottom = r.top;
            for (const c of n.children) bottom = Math.max(bottom, c.getBoundingClientRect().bottom);
            return Math.max(0, bottom - r.top);
          };
          const cols = new Map();
          for (const k of kids) {
            const key = Math.round(k.getBoundingClientRect().left);
            cols.set(key, (cols.get(key) ?? 0) + occupied(k));
          }
          return { columns: [...cols.entries()].map(([left, height]) => ({ left, height })) };
        });
        if (r.error) return r.error;
        if (r.columns.length < 2) return true; // one flow — R13's other permitted answer
        const heights = r.columns.map((c) => c.height);
        const shortH = Math.min(...heights);
        const tallH = Math.max(...heights);
        const ratio = shortH / tallH;
        if (ratio < 0.6 - 0.001) {
          return `.rails renders ${r.columns.length} columns and its shorter one (${shortH.toFixed(1)}px) reaches only ${(ratio * 100).toFixed(1)}% of the taller (${tallH.toFixed(1)}px) — under R13's 60% floor, and it is not one flow either`;
        }
        return true;
      }
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
  {
    id: 'S24', rule: 'R6',
    intent: "RD-002 fix 3 (F-hier-10; AR-001 D3, K25). At 390 the Frontier door is the home rail's first block, but the rail folds after the WHOLE changed feed, so the flagship sat ~2,400px into the document. AR-001 D3 settles what is owed: F-hier-10's own invariant says the nav counts, and under R6 (nothing displaces the feed) the nav item is the anchored minimum — K25 confirms it. TWO clauses, because a reachability floor alone would be satisfied by wrecking the rule it is supposed to protect. (a) At 390 on the home page a link to /frontier is reachable from the FIRST VIEWPORT without traversing the feed: either the link itself is in it, or the control that exposes it is (the nav disclosure, which R14/S10 keeps closed at this width) and opening that control reveals the link. (b) The changed feed still LEADS: the first feed line's top edge sits above the Frontier door's, so the reachability in (a) was not bought by moving the flagship up over the feed — R6 exactly.",
    independent: "getBoundingClientRect().top of the nav control and of the revealed /frontier link against window.innerHeight, and of the first .rail-changes line against the .frontier-door block — live geometry on the built page, not the nav route list any renderer keeps",
    falsifier: {
      brokenBy: "clause (a): `--only S24 --break \".site-header a[href='/frontier']{display:none !important}\"` — removes the nav item the keeper's own K25 ruling relies on, leaving the door ~2,400px down the document as the route's only presence on this surface, which is F-hier-10's shipped defect exactly.",
      observed: 'check failed "/ @390x844: the nav disclosure exposes no /frontier link" — the nav item K25 relies on removed, and clause (a) then has nothing in the first viewport to offer a reader. Restored; rebuilt tree passes S24.',
      brokenByOpposite: "clause (b), the opposite end of the same page — reachability bought by displacing the feed: `--only S24 --break \".home-side{order:-1 !important} .home-grid{display:flex !important;flex-direction:column !important}\"` lifts the rail (and with it the Frontier door) ABOVE the changed feed. A check that only asked 'is /frontier reachable early' would score that as an improvement; R6 says it is the worse failure, so the check must fail on it.",
      observedOpposite: 'check failed "/ @390x844: the Frontier door (top 137.8px) is at or above the changed feed\'s first line (top 1598.6px) — R6: the feed leads this page, and reachability may not be bought by displacing it" — the door now 1,460px ABOVE the feed, the exact trade R6 forbids and the one a reachability-only formula would have scored as an improvement. Restored; rebuilt tree passes S24.',
    },
    kind: 'dom', routes: ['/'], viewports: [[390, 844]],
    check: async ({ page }) => {
      const reach = await page.evaluate(() => {
        const vh = window.innerHeight;
        const direct = [...document.querySelectorAll('a[href="/frontier"]')].find((a) => {
          const r = a.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && r.top >= 0 && r.top < vh;
        });
        if (direct) return { ok: true, how: 'link in the first viewport', top: direct.getBoundingClientRect().top };
        const control = document.querySelector('.site-header details > summary');
        if (!control) return { ok: false, why: 'no /frontier link in the first viewport and no nav disclosure to expose one' };
        const cr = control.getBoundingClientRect();
        if (!(cr.width > 0 && cr.top >= 0 && cr.top < vh)) {
          return { ok: false, why: `the nav disclosure that would expose /frontier sits at top ${cr.top.toFixed(1)}px, outside the first viewport (0-${vh}px)` };
        }
        control.closest('details').open = true;
        const revealed = [...document.querySelectorAll('.site-header a[href="/frontier"]')].find(
          (a) => a.getBoundingClientRect().width > 0,
        );
        return revealed
          ? { ok: true, how: 'nav disclosure in the first viewport exposes it', top: cr.top }
          : { ok: false, why: 'the nav disclosure exposes no /frontier link' };
      });
      if (!reach.ok) return reach.why;

      const order = await page.evaluate(() => {
        const feed = document.querySelector('.rail-changes > .rail-item');
        const door = document.querySelector('.frontier-door');
        if (!feed || !door) return { error: 'missing .rail-changes rows or .frontier-door on /' };
        return { feedTop: feed.getBoundingClientRect().top, doorTop: door.getBoundingClientRect().top };
      });
      if (order.error) return order.error;
      if (order.feedTop >= order.doorTop) {
        return `the Frontier door (top ${order.doorTop.toFixed(1)}px) is at or above the changed feed's first line (top ${order.feedTop.toFixed(1)}px) — R6: the feed leads this page, and reachability may not be bought by displacing it`;
      }
      return true;
    },
  },
  {
    id: 'S22', rule: 'R13',
    intent: "RD-002 fixes 1 and 2 — the players board states only what it can source. THREE clauses. (a) IDENTITY: no cited fact belonging to an ORGANISATION record appears anywhere in /frontier's rendered text. The VENDOR CLAIM cell used to fall back from the model's own cited fact to the ORG's (`firstCitedFact(modelDoc) ?? firstCitedFact(org)`), so NVIDIA's company founding date and founders rendered under 'claimed · unverified' inside a MODEL's row — a fact about a company stamped as a claim about a model (F-sys-2-7, RT FM1; BRIEF R-B). The fallback is removed; this clause is what makes the removal permanent, and it is stated over the ORG CORPUS rather than over a list of forbidden words, so a founding date added to any org record tomorrow is caught the same way. (b) HONESTY REACHABLE: at least one hatched cell renders on shipped data, at 1440 AND at 390 — the concept's whole bet is that a board of honest blanks persuades, and the captured board rendered ZERO of them because the fallback laundered org trivia into the one column most likely to be empty (F-sys-2-3, RT FM2). (c) NO CELL CLIPPED: every vendor-claim cell renders on exactly ONE line and, where its text is wider than its box, is ellipsised — sixteen cells were cut mid-word at 1440 with nothing in frame saying content continued (F-hier-6, F-struct-5). (d) ALLOW-LIST, added RD-003 fix 1 (RT FM-N1 + FM-N2): the column admits only a QUANTIFIED cited claim about the row's own model, so no cited fact on an EXCLUDED field — every positioning/description field (`vendor_description`, `vendor_role`, `tier_role`, `generation_claim`, `architecture`, `structure`, `quantization`, `distilled_from`, `open_weights`, `local_hardware`, `contributor_tier_terms`, the free-access windows) and every record-metadata field (`release_date`, `license`, `parameters`, `listed_date`, `version`, `api_sunset`, `knowledge_cutoff`, `expiration_date`, prices, sizes) — may render inside a `.board-claim` cell, and every claim that DOES render carries a digit. Stated over the MODEL CORPUS with the clause's OWN denied-field list, exactly as (a) is stated over the org corpus: widening the render module's allow-list does not widen this gate, which is the whole reason FM-N1 shipped (a regex over field NAMES admitted `vendor_description` on the same terms as a benchmark score). Two-sided: an allow-list narrowed until the column carries NO claim at all is the opposite excess — a claim column that never states a claim — and fails too. (e) ATTRIBUTION, added RD-004 (RT FM-N3 + JV-sys F-sys-4-1): `source: cited` records that a value carries a citation, never that the citation is the VENDOR'S OWN — so an allow-listed field sourced to a third party (OpenRouter's traffic-derived medians, an llm-releases.com analyst's arithmetic, a VentureBeat write-up, a Hugging Face model card) may not render in a column labelled as the vendor's own words under a lede reading 'quoted verbatim from the vendor'; and every claim that DOES render names the ROW'S OWN ORGANISATION in the cell, because the only other provenance on the row is READ, which states the feed the PRICE and CONTEXT values came from. Vendor-ness is re-derived here from the ORG and MODEL corpora — display names and aliases, the hosts an org entry cites ITSELF from, and the org's own `mentions:` list as the model->org mapping — never imported from lib/render/frontier.mjs, exactly as (a) and (d) are. WIDENED RD-005 on both halves. VENDOR-NESS IS REGISTRABLE-DOMAIN (eTLD+1) IDENTITY, not label identity (RT FM-N5): the shipped test asked whether ANY dot-separated label of the cited host was an org name token, so a host shaped `google.<third-party-controlled>` cleared it for Google DeepMind exactly as `deepmind.google` did, and this harness's own vendor test shared that blind spot with the code it audits. Both are re-derived now from the REGISTRABLE DOMAIN — the public suffix (the host's last label, or its last two for the explicit two-label suffix table each side keeps of its own) plus the one label to its left, which is the string the registrant actually bought: `www.tencent.com`->tencent.com/`tencent`, `deepmind.google`->deepmind.google/`deepmind` (a brand TLD, so `blog.google` is a DIFFERENT registrable domain and not `google.com`), `google.attacker.example`->attacker.example/`attacker`. A source is the vendor's when its registrable domain is one the org entry records citing itself from, or its registrable LABEL is one of the org's own name tokens; no label scan and no `endsWith` on either side. AND THE ATTRIBUTION MUST BE VISIBLE, not merely present (JV-sys F-sys-5-1): RD-004's name was appended AFTER the fragment inside the one-line ellipsised clamp, so the elision ate the attribution first — one shipped claim broke mid-name and lost its date, the other was cut before the em dash and named no source at all. Measured off the rendered box at both viewports: the name starts the line, and its own rect ends clear of the clamp's visible right edge (4px of clearance while the line overflows, because the ellipsis is painted at that edge). Two-sided on a DIFFERENT quantity rather than the same one twice: the name may not take more than 85% of the clamp, because a cell showing its vendor and none of its claim satisfies 'the name is fully visible' perfectly and states nothing.",
    independent: "for (a) the cited facts read out of content/wiki/org/*.md — the corpus itself, not the render module and not the page's own markup; for (b) and (c) getBoundingClientRect, scrollWidth/clientWidth and Range-measured text line boxes read live off the rendered board, never a CSS token or a declared column count",
    falsifier: {
      brokenBy: "THREE breaks. (a) restored the removed org fallback in lib/render/frontier.mjs (`vendorClaimFact(modelDoc) ?? firstCitedFact(org)`) and rebuilt — a render-logic change --break cannot reach, the mechanism this registry already uses for S14/S17/S18/S21. (b) `--only S22 --break \"#frontier-board .board-hatch{background-image:none !important}\"` — removes the hatch MARK from every blank cell while leaving the cells, their text and their classes exactly where they are, so the clause is exercised on what a reader sees rather than on what the renderer emitted; reproduces RT FM2's zero-hatch board. (c) `--only S22 --break \".board-claim,.board-claim .claim-line{text-overflow:clip !important}\"` — still capped, but clipped by its own box with nothing in frame saying content continues. (d) added `'vendor_description'` to `CLAIM_FIELDS_BENCHMARK` in lib/render/frontier.mjs and rebuilt — a render-logic change --break cannot reach, the same mechanism (a) uses, and the exact shipped shape RT FM-N1 measured (x-ai's newest row carrying SpaceXAI's marketing sentence in the claim cell). RD-005, four more. (e-iv) `--only S22 --break \"#frontier-board .board-claim .src{font-size:2.6rem !important}\"` — the vendor name wider than the clamp can show, F-sys-5-1's own defect (the attribution elided before the words it attributes) reproduced from CSS instead of from a rebuild. (e-v) the OTHER end of that clause, `--break \"#frontier-board .board-claim .src{font-size:16px !important}\"` — the name still whole but taking almost the whole clamp, the excess a one-sided 'the name is never truncated' formula passes perfectly while the claim column states no claim. (e-vi) RENDER-LOGIC + REBUILD, FM-N5 made live: the pre-RD-005 label scan restored in `isVendorSourced` AND one cited `source_url` in content/wiki/model/tencent-hy4-preview.md rewritten to the spoof shape `tencent.com.attacker.example`. Both halves are needed: the fixed renderer refuses the spoof on its own, so no claim would reach a cell for the clause to catch. (e-vii) the other end of the vendor test, the alias half dropped so only a recorded registrable domain can ever match.",
      observed: '(e) RD-004, three breaks, all render-logic + rebuild (the mechanism (a) and (d) use). (e-i) the vendor test in claimRank disabled: check failed "a vendor-claim cell renders a fact cited to a THIRD PARTY, not to the row\'s vendor: “59 at high reasoning, 57 at medium, 52 at low; up 3 from Gem” (content/wiki/model/google-gemini-3-8-flash.md#intelligence_index_by_effort, source llm-releases.com)" — FM-N3 DORMANT twin, made live by the break and caught. (e-ii) the other end, the vendor test forced to reject everything: check failed "the VENDOR CLAIM column renders ZERO claims across 16 rows", clause (d) own second end. (e-iii) the attribution half, the cell .src label reverted to the pre-fix "model record": check failed "a vendor-claim cell renders a claim that does not name the row\'s own organisation as its source (“54.9% — model record, accessed 2026-09-03…”)". RECORDED, NOT HIDDEN: (e-iii) did NOT fire on the first attempt (0 of 1). As first written the clause asked only that SOME non-empty name follow the dash, and "model record" satisfied it — a real defect in the check, not a flake: the property is that the cell names the ROW VENDOR, so the clause now compares the .src label against the row own lead cell, and the break fires. All three restored; rebuilt tree passes S22. (a) check failed "/frontier @1440x900: an ORGANISATION record\'s own cited fact is rendered on /frontier: “Qwen, launched in beta April 2023 as Tongyi Qianwen and opened to the public in September 2023” (content/wiki/org/alibaba-cloud.md)" — the same class of defect RT FM1 measured on NVIDIA, caught on a different org because the clause reads the whole corpus rather than one named fact. (b) check failed "/frontier @1440x900: the board renders ZERO hatched cells on shipped data" — RT FM2\'s exact reading. (c) check failed "/frontier @1440x900: a vendor-claim cell is clipped with no ellipsis (“59 at high reasoning, 57 at medium, 52 at low; up 3 from Gem…”)". RECORDED HONESTLY: the FIRST attempt at (c) broke with max-width:none;overflow:visible;text-overflow:clip and did NOT fire (0 of 1) — informative, not a defect in the check: removing the cap does not make the CELL clip, it makes the cell grow and the TABLE overrun its container, which is S22b\'s clause, not this one; the break had moved the violation to a different check. (d) FIRST attempt reported 0 of 1 fired and is recorded, not hidden: adding `vendor_description` to the allow-list ALONE does not restore the defect, because `claimRank` also refuses a value with no digit in it and SpaceXAI\'s sentence has none — two independent guards, and the break had only removed one. Re-broken with both removed (the field allow-listed AND the digit test commented out): check failed "/frontier @1440x900: a vendor-claim cell renders a cited fact on the EXCLUDED field “vendor_description” (content/wiki/model/x-ai-grok-4-6.md): “SpaceXAI\'s smartest model with frontier performance on codin”" — RT FM-N1\'s shipped row, reproduced exactly. All four restored; rebuilt tree passes S22 at both declared viewports. RD-005: (e-iv) check failed "a vendor-claim cell\'s vendor name “Google DeepMind” is truncated: it needs 353.0px and ends 200.0px past the 153.0px the clamp shows". (e-vi) check failed "a vendor-claim cell renders a fact cited to a THIRD PARTY, not to the row\'s vendor: “2.99/4.00 average in a blind, Tencent-internal evaluation of” (content/wiki/model/tencent-hy4-preview.md#internal_blind_eval, source tencent.com.attacker.example)" — FM-N5\'s dormant case made live and caught, on the harness\'s OWN eTLD+1 derivation rather than the render module\'s. With the spoof host left in place and only the renderer restored, that row blanks and the board renders one claim — the fix refuses the spoof on the render side too, which is the point of the pair. All breaks restored; content/ is byte-identical afterwards. RECORDED, NOT HIDDEN — A CLAUSE REMOVED RATHER THAN KEPT GREEN: the second end of the name-visibility clause was first written as the quoted value\'s own visible run, measured with a Range starting after the `.src` link. Measured, that range\'s left edge IS the link\'s right edge (both 110.33px inside a 153.0px clamp), so the number it produced was `headroom` again — one quantity at two thresholds. It could not be falsified alone: at max-width 122px headroom\'s own 4px floor fired first, and at 126px neither end fired (0 of 1). Removed and replaced with a PROPORTION (the name\'s share of the clamp), which falsifies alone at (e-v). Two further breaks fired on the sub-clause NEXT to the one they were aimed at and are recorded as observations, not as this clause\'s falsifiers: RD-004\'s order restored in the renderer (name after fragment), and the fragment dropped entirely, both failed on the attribution-ORDER test (“54.9% — Google DeepMind... does not name the row\'s own organisation as its source”), because that test now looks for `<name> —` and neither shape has it.',
      brokenByOpposite: "clauses (b) and (c) bound a quantity and have a real other end, so they get one. (b) from the other end — `--only S22 --break \"#frontier-board .board-cell{background-image:repeating-linear-gradient(45deg,var(--rule) 0,var(--rule) 1px,transparent 1px,transparent 7px) !important}\"`: EVERY cell hatched, RT FM4's predicted failure (the hatch dominating the board) rather than none of them, which a floor-only formula passes trivially. (c) from the other end — `--only S22 --break \"#frontier-board .board-claim{max-width:1px !important}\"`: a cell capped so hard it carries no readable text at all, the opposite excess of the uncapped cell, which a 'not clipped without an ellipsis' formula also passes trivially. (d) from the other end — both allow-list sets emptied in lib/render/frontier.mjs and rebuilt: nothing at all clears the bar, every one of the sixteen claim cells is the hatched blank, and a prohibition-only formula ('no excluded field renders') passes that perfectly while the column states nothing. The clause requires at least one real claim as well.",
      observedOpposite: 'check failed "/frontier @1440x900: 96 of 96 board value cells render the hatch (100.0%) — a board that can source almost nothing is the opposite excess of one that hides its blanks, and states as little (RT FM4\'s predicted failure)". (d) from the other end: both allow-list Sets emptied and rebuilt — check failed "/frontier @1440x900: the VENDOR CLAIM column renders ZERO claims across 16 rows — an allow-list narrowed until nothing qualifies states as little as one that admits marketing copy, and a prohibition-only clause passes it trivially". RECORDED, RD-003: clause (c)\'s OWN narrow-cap opposite (`#frontier-board .board-claim{max-width:1px}`) does NOT reproduce under the corrected line-box measurement below, and re-measurement shows it never violated the property: a table cell floors at its content\'s own minimum, so the claim cell still rendered 116.5px wide against the board\'s narrowest other value column at 85.5px, and `table-layout:fixed` with `width:1px` widened every column to 164.6px instead of narrowing this one. The break moves the layout, not the property. A width clause added for it was written, found unfalsifiable for that reason, and REMOVED rather than kept green — (c)\'s real second end is the wrap break recorded above. Restored; rebuilt tree passes S22. RD-005 (e-v), the name-visibility clause\'s own second end: check failed "a vendor-claim cell\'s vendor name “Google DeepMind” takes 88.7% of the clamp (135.8px of 153.0px), leaving 17.2px for the quoted value" — an attribution that crowds the claim out of its own cell, which a \'the name is never truncated\' formula passes perfectly. RD-005 (e-vii), the vendor test\'s second end, render-logic + rebuild with the alias half dropped: check failed "the VENDOR CLAIM column renders ZERO claims across 16 rows" — an eTLD+1 rule tightened until the board can attribute nothing states as little as one that admits an attacker\'s subdomain. Both restored; rebuilt tree passes S22.',
      oneSidedBecause: "clause (a) alone is a PROHIBITION over a corpus (no org-record fact may appear on this route) and has one direction by construction — there is no 'too few org facts on /frontier'. It is declared rather than given a manufactured second end, per this registry's own rule at S20. Clauses (b), (c) and (d) are two-sided and are broken from both ends above — (d)'s prohibition half shares (a)'s shape, but its 'at least one claim renders' half gives the pair a real other end that a corpus prohibition alone does not have.",
    },
    kind: 'dom', routes: ['/frontier'], viewports: [[1440, 900], [390, 844]],
    check: async ({ page }) => {
      // (a) IDENTITY. Read the ORG CORPUS directly — the independent quantity.
      const { readdir, readFile: rf } = await import('node:fs/promises');
      const orgDir = join(ROOT, 'content', 'wiki', 'org');
      const orgFiles = await readdir(orgDir);
      const orgFactValues = [];
      for (const f of orgFiles) {
        if (!f.endsWith('.md')) continue;
        const text = await rf(join(orgDir, f), 'utf8');
        // every `value:` inside a fact block whose `source:` is `cited`
        const blocks = text.split(/\n\s*- field:/).slice(1);
        for (const b of blocks) {
          if (!/\n\s*source:\s*cited\b/.test(b)) continue;
          const m = b.match(/\n\s*value:\s*"?([^"\n]+?)"?\s*\n/);
          if (m && m[1].trim().length >= 8) orgFactValues.push({ file: f, value: m[1].trim() });
        }
      }
      if (orgFactValues.length < 1) {
        return 'no cited org facts found in content/wiki/org — clause (a) would be vacuous, which is the green-and-wrong failure this harness exists to refuse';
      }
      const pageText = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
      for (const { file, value } of orgFactValues) {
        if (pageText.includes(value.replace(/\s+/g, ' '))) {
          return `an ORGANISATION record's own cited fact is rendered on /frontier: "${value}" (content/wiki/org/${file}) — the vendor-claim column may only carry a claim about the row's own MODEL`;
        }
      }

      const dom = await page.evaluate(() => {
        const table = document.getElementById('frontier-board');
        if (!table) return { error: 'missing #frontier-board on /frontier' };
        // The hatch is counted by its RENDERED MARK — a cell whose computed
        // background carries the diagonal — not by the `.board-hatch` class.
        // A class count answers "did the renderer emit the class", which is
        // recompute-from-source; what the clause is about is whether a reader
        // SEES a labelled blank. It also gives the bound a real second end:
        // a board where every cell is hatched states as little as one where
        // none is, and only a mark-based count can measure that.
        const valueCells = [...table.querySelectorAll('tbody td')];
        const hatched = valueCells.filter((c) => {
          const r = c.getBoundingClientRect();
          if (!(r.width > 0 && r.height > 0)) return false;
          return getComputedStyle(c).backgroundImage.includes('repeating-linear-gradient');
        }).length;
        const claims = [];
        for (const cell of table.querySelectorAll('.board-claim')) {
          const line = cell.querySelector('.claim-line') || cell.firstElementChild || cell;
          const cs = getComputedStyle(cell);
          const lineStyle = getComputedStyle(line);
          const range = document.createRange();
          range.selectNodeContents(cell);
          // Count LINE BOXES, not inline rects: a Range over a cell holding
          // text, an <a> at a smaller step and a <time> returns one rect per
          // inline box, and those rects' tops differ by a pixel or two purely
          // from their differing font sizes. Rounding each top to an integer
          // reported a one-line cell as two — a measurement artifact, and
          // exactly the vacuous/false reading this registry's own S1, S5 and
          // S17 post-mortems each record once. Rects are bucketed to the
          // cell's own line height instead, so only a genuine wrap counts.
          const lineHeight = parseFloat(getComputedStyle(cell).lineHeight) || 16;
          // MEASUREMENT DEFECT FOUND AND FIXED, RD-003 (recorded, not quietly
          // patched — the registry's own S1/S18 precedent). Bucketing by
          // `Math.round(top / bucket)` divides ABSOLUTE PAGE coordinates into
          // fixed bins, so whether two rects 1.0px apart (the same line box,
          // read at two font sizes — the claim text at --step-0 and its `.src`
          // link and <time> at --step--1) land in one bin depends on where the
          // ROW happens to sit down the document. Shipped live this round: the
          // identical cell measured ONE line at 1440 (tops 519.36/520.36, bin
          // 34 both) and TWO at 390 (tops 701.97/702.97, bins 46 and 47) with
          // a 32.3px cell and a 20.15px line height at both — the page was
          // never wrong, the bin edge moved under it. Clustered by DISTANCE
          // instead: a rect joins an existing line box if its top is within
          // 60% of the line height of it. A genuine wrap is a full line height
          // away and still counts.
          const rectTops = [...range.getClientRects()].filter((r) => r.height > 0).map((r) => r.top).sort((a, b) => a - b);
          const tolerance = Math.max(6, lineHeight * 0.6);
          const lineBoxes = [];
          for (const t of rectTops) if (!lineBoxes.length || t - lineBoxes[lineBoxes.length - 1] > tolerance) lineBoxes.push(t);
          const tops = { size: lineBoxes.length };
          claims.push({
            lines: tops.size,
            clipped: line.scrollWidth > line.clientWidth + 1 || cell.scrollWidth > cell.clientWidth + 1,
            ellipsis: cs.textOverflow === 'ellipsis' || lineStyle.textOverflow === 'ellipsis',
            text: cell.textContent.trim().slice(0, 60),
            // RD-003 clause (d) reads the WHOLE cell, and the `title` the
            // claim line carries the unelided value in — an ellipsised cell's
            // textContent is still the full string, but the title is what a
            // reader can actually recover, so both are compared.
            full: `${cell.textContent.trim()} ${(line.getAttribute && line.getAttribute('title')) || ''}`.replace(/\s+/g, ' '),
            hatched: cell.classList.contains('board-hatch'),
            // RD-004 / JV-sys F-sys-4-1: is the claim ATTRIBUTED inside its own
            // cell — a named source after the claim fragment, read off the
            // rendered cell rather than off the renderer's intent.
            // RD-005 fix 1 / JV-sys F-sys-5-1. WHERE THE ATTRIBUTION SITS
            // inside the clamp, measured off the rendered box rather than off
            // the markup order: `text-overflow: ellipsis` elides at the END of
            // the line box, so a name placed after the fragment is the FIRST
            // thing lost and the last thing the renderer intends to lose. Both
            // ends are recorded here — how far the name's own rect sits from
            // the clamp's visible right edge, and how much of the quoted value
            // is still inside that edge beside it — because a cell that shows
            // its vendor and nothing else satisfies "the name is visible"
            // perfectly while stating no claim at all.
            srcFit: (() => {
              const src = cell.querySelector('.src');
              if (!src) return null;
              const box = line.getBoundingClientRect();
              const visibleRight = box.left + line.clientWidth;
              const r = src.getBoundingClientRect();
              return {
                name: src.textContent.trim(),
                // > 0: the name ends this far INSIDE the visible edge.
                headroom: visibleRight - r.right,
                // ~0: the name starts the line, so nothing can push it out.
                offsetFromStart: r.left - box.left,
                width: r.width,
                visibleWidth: line.clientWidth,
                overflowing: line.scrollWidth > line.clientWidth + 1,
              };
            })(),
            attributed: (() => {
              const src = cell.querySelector('.src');
              const name = src ? src.textContent.trim() : '';
              // The source named must be the ROW'S OWN ORGANISATION, read off
              // the row's own lead cell — not merely SOME name after the dash.
              // Recorded, RD-004: the first version of this clause asked only
              // for a non-empty name and PASSED the pre-fix cell, which named
              // "model record". A generic label is exactly the unattributed
              // state F-sys-4-1 measured.
              const row = cell.closest('tr');
              const org = row ? (row.querySelector('th') || {}).textContent || '' : '';
              const k = (x) => x.toLowerCase().replace(/[^a-z0-9]/g, '');
              return name.length > 0
                && k(name).length > 0
                && k(name) === k(org)
                // RD-005 fix 1: the vendor now reads FIRST, so the em dash
                // that separates it from the quoted value follows the name.
                && cell.textContent.replace(/\s+/g, ' ').includes(`${name} —`);
            })(),
          });
        }
        return { hatched, claims, valueCells: valueCells.length };
      });
      if (dom.error) return dom.error;

      // (b) HONESTY REACHABLE — asserted at BOTH declared viewports.
      if (dom.hatched < 1) {
        return 'the board renders ZERO hatched cells on shipped data — the labelled blank is correct in CSS and unreachable in data, which is the concept\'s own move failing to ship';
      }
      // ...and not the other excess: a board that is ALL blank states nothing either.
      if (dom.valueCells && dom.hatched / dom.valueCells > 0.9) {
        return `${dom.hatched} of ${dom.valueCells} board value cells render the hatch (${((dom.hatched / dom.valueCells) * 100).toFixed(1)}%) — a board that can source almost nothing is the opposite excess of one that hides its blanks, and states as little (RT FM4's predicted failure)`;
      }
      // (d) ALLOW-LIST (RD-003 fix 1, RT FM-N1 + FM-N2). The excluded values
      // are re-derived from the MODEL CORPUS against this clause's OWN denied
      // list — never imported from lib/render/frontier.mjs, because the defect
      // this catches IS someone widening that module's allow-list. A denied
      // field's value reaching a claim cell fails; so does an allow-list
      // narrowed until no claim renders at all.
      const DENIED_CLAIM_FIELDS = new Set([
        // positioning / description — vendor adjectives, not measurements
        'vendor_description', 'vendor_role', 'tier_role', 'generation_claim',
        'architecture', 'structure', 'quantization', 'distilled_from',
        'open_weights', 'local_hardware', 'contributor_tier_terms',
        'free_access_window', 'hy3_free_extension', 'base_model',
        // record metadata — true of the record, not claimed of the model
        'release_date', 'listed_date', 'version', 'license', 'parameters',
        'preview_parameters', 'api_sunset', 'knowledge_cutoff', 'status',
        'expiration_date', 'introductory_pricing_ends', 'default_reasoning_effort',
        'reasoning_on_by_default', 'reasoning_mandatory', 'repository_tensor_total',
        'hidden_size', 'layers', 'max_position_embeddings', 'max_output_tokens',
        'context_window', 'price_input', 'price_output', 'price_cache_read',
        'price_internal_reasoning', 'list_price_input', 'list_price_output',
      ]);
      const modelDir = join(ROOT, 'content', 'wiki', 'model');
      const modelFiles = await readdir(modelDir);
      const deniedValues = [];
      for (const f of modelFiles) {
        if (!f.endsWith('.md')) continue;
        const text = await rf(join(modelDir, f), 'utf8');
        const blocks = text.split(/\n\s*- field:/).slice(1);
        for (const b of blocks) {
          const fm = b.match(/^\s*([A-Za-z0-9_]+)/);
          if (!fm || !DENIED_CLAIM_FIELDS.has(fm[1])) continue;
          if (!/\n\s*source:\s*cited\b/.test(b)) continue;
          const m = b.match(/\n\s*value:\s*"?([^"\n]+?)"?\s*\n/);
          if (m && m[1].trim().length >= 12) deniedValues.push({ file: f, field: fm[1], value: m[1].trim() });
        }
      }
      if (deniedValues.length < 1) {
        return 'no cited facts on any denied field found in content/wiki/model — clause (d) would be vacuous, which is the green-and-wrong failure this harness exists to refuse';
      }
      const rendered = dom.claims.filter((c) => !c.hatched);
      for (const c of rendered) {
        for (const d of deniedValues) {
          const needle = d.value.replace(/\s+/g, ' ').slice(0, 60);
          if (needle.length >= 12 && c.full.includes(needle)) {
            return `a vendor-claim cell renders a cited fact on the EXCLUDED field "${d.field}" (content/wiki/model/${d.file}): "${needle}" — the column admits only a quantified capability or benchmark claim, by allow-list, never a positioning line or record metadata (RT FM-N1)`;
          }
        }
        if (!/\d/.test(c.full)) {
          return `a vendor-claim cell renders text with no quantity in it ("${c.text}…") — an unquantified sentence at the ink weight of the fed price columns is the vendor's positioning, not a claim this board can compare (RT FM-N1)`;
        }
      }
      if (rendered.length < 1) {
        return `the VENDOR CLAIM column renders ZERO claims across ${dom.claims.length} rows — an allow-list narrowed until nothing qualifies states as little as one that admits marketing copy, and a prohibition-only clause passes it trivially`;
      }

      // (e) ATTRIBUTION (RD-004, RT FM-N3 + JV-sys F-sys-4-1). A claim cell may
      // carry only a value whose OWN cited source is the row organisation. The
      // vendor test is re-derived here from the ORG and MODEL corpora — org
      // display names and aliases, the hosts an org entry cites ITSELF from,
      // and the org's own `mentions:` list as the model→org mapping — and
      // never imported from lib/render/frontier.mjs, because the defect this
      // catches IS that module deciding "cited" means "the vendor said it".
      const GENERIC = new Set(['ai', 'labs', 'lab', 'cloud', 'inc', 'corp', 'corporation',
        'company', 'group', 'foundation', 'pbc', 'ltd', 'llc', 'technologies', 'technology',
        'research', 'the', 'and', 'for', 'com', 'net', 'org', 'www']);
      // RT-CP-UI-001-2-6 FM-N7 (applied directly under K43): parse with the
      // platform URL parser so userinfo and ports never reach the suffix rule,
      // matching lib/render/frontier.mjs's urlHost byte for byte.
      const hostOf = (u) => {
        try { return new URL(String(u)).hostname.toLowerCase().replace(/^www\./, ''); }
        catch { return null; }
      };
      // RD-005 fix 2 (RT FM-N5). REGISTRABLE DOMAIN (eTLD+1), re-derived here
      // with this clause's OWN suffix table and never imported from
      // lib/render/frontier.mjs — the defect this catches IS that module
      // deciding which part of a host names its owner. THE RULE: the public
      // suffix is the host's LAST label, except for the two-label suffixes
      // below, where it is the last two; the registrable domain is the suffix
      // plus the one label to its left, and that label — the string the
      // registrant actually bought — is the only one ownership can be read
      // off. `www.tencent.com` → tencent.com / `tencent`; `deepmind.google`
      // → deepmind.google / `deepmind` (`.google` is a single-label brand
      // TLD, so `blog.google` is a DIFFERENT registrable domain, not
      // `google.com`); `google.attacker.example` → attacker.example /
      // `attacker`, which names nobody in this corpus and is refused.
      const TWO_LABEL_SUFFIXES = new Set(['co.uk', 'org.uk', 'ac.uk', 'gov.uk',
        'co.jp', 'co.kr', 'co.in', 'co.za', 'co.nz', 'com.au', 'com.br',
        'com.cn', 'net.cn', 'org.cn', 'gov.cn', 'edu.cn', 'com.hk', 'com.tw',
        'com.sg', 'com.mx', 'com.tr', 'github.io', 'pages.dev', 'vercel.app',
        'netlify.app', 'workers.dev', 'blogspot.com', 'substack.com',
        'notion.site', 'medium.com']);
      const registrableOf = (host) => {
        const parts = String(host || '').split('.').filter(Boolean);
        const suffix = TWO_LABEL_SUFFIXES.has(parts.slice(-2).join('.')) ? 2 : 1;
        if (parts.length <= suffix) return null;
        return { domain: parts.slice(-(suffix + 1)).join('.'), label: parts[parts.length - suffix - 1] };
      };
      const orgsMeta = [];
      for (const f of orgFiles) {
        if (!f.endsWith('.md')) continue;
        const text = await rf(join(orgDir, f), 'utf8');
        const fm = text.split(/\n---\n/)[0];
        const tokens = new Set();
        const names = [...fm.matchAll(/\n\s*(?:display_name|- name):\s*"?([^"\n]+?)"?\s*\n/g)].map((m) => m[1]);
        for (const n of names) {
          const whole = n.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (whole.length >= 3) tokens.add(whole);
          for (const w of n.toLowerCase().split(/[^a-z0-9]+/)) if (w.length >= 3 && !GENERIC.has(w)) tokens.add(w);
        }
        // Named = the REGISTRABLE LABEL is an org name token. Not "some
        // label is", which is what shipped and what FM-N5 measured: label
        // identity with no notion of position or ownership, so a host shaped
        // `google.<anyone-else>` read as Google DeepMind's own.
        const namedReg = (reg) => !!reg && reg.label.length >= 3 && tokens.has(reg.label);
        const ownDomains = new Set();
        for (const m of fm.matchAll(/\n\s*source_url:\s*"?([^"\n]+?)"?\s*\n/g)) {
          const reg = registrableOf(hostOf(m[1]));
          if (namedReg(reg)) ownDomains.add(reg.domain);
        }
        const mentions = new Set([...fm.matchAll(/\n\s+- (model\/[a-z0-9-]+)/g)].map((m) => m[1]));
        orgsMeta.push({
          file: f,
          mentions,
          // No `endsWith` either: a subdomain belongs to whoever owns the
          // registrable domain, and `anthropic.com.attacker.example` ends
          // with nothing Anthropic bought. Equality on eTLD+1 covers every
          // real subdomain and refuses every lookalike.
          isVendorHost: (host) => {
            const reg = registrableOf(host);
            return !!reg && (ownDomains.has(reg.domain) || namedReg(reg));
          },
        });
      }
      if (orgsMeta.length < 1) return 'no org records parsed — clause (e) would be vacuous';
      const thirdPartyValues = [];
      for (const f of modelFiles) {
        if (!f.endsWith('.md')) continue;
        const text = await rf(join(modelDir, f), 'utf8');
        const idm = text.match(/\nid:\s*"?(model\/[a-z0-9-]+)"?/);
        if (!idm) continue;
        const owners = orgsMeta.filter((o) => o.mentions.has(idm[1]));
        if (owners.length < 1) continue; // no org claims this model: not judgeable here
        const blocks = text.split(/\n\s*- field:/).slice(1);
        for (const b of blocks) {
          if (!/\n\s*source:\s*cited\b/.test(b)) continue;
          const fm2 = b.match(/^\s*([A-Za-z0-9_]+)/);
          const su = b.match(/\n\s*source_url:\s*"?([^"\n]+?)"?\s*\n/);
          const v = b.match(/\n\s*value:\s*"?([^"\n]+?)"?\s*\n/);
          if (!fm2 || !su || !v) continue;
          const host = hostOf(su[1]);
          if (!host) continue;
          if (owners.some((o) => o.isVendorHost(host))) continue;
          if (v[1].trim().length >= 12) thirdPartyValues.push({ file: f, field: fm2[1], host, value: v[1].trim() });
        }
      }
      if (thirdPartyValues.length < 1) {
        return 'no third-party-sourced cited facts found in content/wiki/model — clause (e) would be vacuous, which is the green-and-wrong failure this harness exists to refuse';
      }
      for (const c of rendered) {
        for (const t of thirdPartyValues) {
          const needle = t.value.replace(/\s+/g, ' ').slice(0, 60);
          if (needle.length >= 12 && c.full.includes(needle)) {
            return `a vendor-claim cell renders a fact cited to a THIRD PARTY, not to the row's vendor: "${needle}" (content/wiki/model/${t.file}#${t.field}, source ${t.host}) — the column is labelled as the vendor's own words and may carry only a fact whose cited source is the row organisation's own domain (RT FM-N3)`;
          }
        }
        // ...and every cell that DOES render names its source in words, so the
        // READ column beside it cannot be read as the claim's provenance.
        if (!c.attributed) {
          return `a vendor-claim cell renders a claim that does not name the row's own organisation as its source ("${c.text}…") — the only other provenance on the row is the READ column, which states the feed the PRICE and CONTEXT values were read from and is otherwise read as the claim's source (JV-sys F-sys-4-1)`;
        }
        // RD-005 fix 1 (JV-sys F-sys-5-1). Naming the vendor is not the same
        // as SHOWING it: RD-004's name was appended after the fragment inside
        // a one-line ellipsised clamp, so the elision ate the attribution
        // first and one of the two shipped claims named no source on screen at
        // all. Measured on the rendered box, both ends.
        const f = c.srcFit;
        if (!f) {
          return `a vendor-claim cell carries no .src element to measure ("${c.text}…") — the attribution is not in the cell at all`;
        }
        if (f.offsetFromStart > 2) {
          return `a vendor-claim cell puts its vendor name ${f.offsetFromStart.toFixed(1)}px into the clamped line rather than at its start ("${c.text}…") — an ellipsis elides at the END of the line box, so anything ahead of the name can push it out (JV-sys F-sys-5-1)`;
        }
        // The ellipsis is painted at the visible right edge, so a name that
        // merely reaches that edge is already being eaten by it. Require the
        // name to end clear of it whenever the line actually overflows.
        const clearance = f.overflowing ? 4 : -0.5;
        if (f.headroom < clearance) {
          return `a vendor-claim cell's vendor name "${f.name}" is truncated: it needs ${f.width.toFixed(1)}px and ends ${(-f.headroom).toFixed(1)}px past the ${f.visibleWidth.toFixed(1)}px the clamp shows ("${c.text}…") — the attribution is elided before the quoted words it attributes (JV-sys F-sys-5-1)`;
        }
        // ...and the other end, a DIFFERENT quantity rather than the same
        // one at a stricter threshold. "The name is fully visible" is
        // satisfied perfectly by a cell that renders the vendor and almost
        // none of its claim — a claim column stating no claim, the trivial
        // pass clause (d) refuses at its own second end. MEASURED AND
        // RECORDED: the first version of this end measured the quoted value's
        // own visible run with a Range starting after the `.src` link, and
        // that range's left edge is EXACTLY the link's right edge, so the
        // number it produced was `headroom` again — one quantity at two
        // thresholds, and unfalsifiable on its own (every break that moved it
        // below 8px had already moved headroom below its own 4px floor). It
        // was removed rather than kept green, the same treatment S22b's own
        // width clause got in RD-003. The end that survives is a PROPORTION:
        // how much of the clamp the name itself consumes.
        if (f.visibleWidth > 0 && f.width / f.visibleWidth > 0.85) {
          return `a vendor-claim cell's vendor name "${f.name}" takes ${((f.width / f.visibleWidth) * 100).toFixed(1)}% of the clamp (${f.width.toFixed(1)}px of ${f.visibleWidth.toFixed(1)}px), leaving ${f.headroom.toFixed(1)}px for the quoted value ("${c.text}…") — an attribution that crowds the claim out of its own cell states as little as a claim with no attribution`;
        }
      }

      // (c) NO CELL CLIPPED.
      for (const c of dom.claims) {
        if (c.lines > 1) return `a vendor-claim cell renders on ${c.lines} lines ("${c.text}…") — the cell is capped to one ellipsised line`;
        if (c.clipped && !c.ellipsis) return `a vendor-claim cell is clipped with no ellipsis ("${c.text}…") — text runs out of its own box with nothing in frame saying so`;
        if (!c.text) return 'a vendor-claim cell renders no text at all — a cell capped past readability states less than the blank it replaced';
      }
      return true;
    },
  },
  {
    id: 'S22b', rule: 'R13',
    intent: "RD-002 fix 2's last clause, at 1440 only — the board's rightmost declared column (READ, the per-row provenance that makes a row citable) renders inside the board container's own visible width, and that container does not scroll horizontally at 1440. Before this round an uncapped prose cell in the VENDOR CLAIM track pushed READ entirely off-screen at the widest viewport the site declares, with no visible scroll affordance saying so (F-sys-2-1b, F-struct-5). Separate from S22 because it is the one clause of that group with an opinion at 1440 and none at 390: below R12's breakpoint a data table is EXPECTED to scroll inside its own container (that is R2's own remedy for wide content), so asserting this at 390 would assert the opposite of R12.",
    independent: "getBoundingClientRect().right of each row's last cell against .board-wrap's own rendered right edge, and .board-wrap's scrollWidth against its clientWidth — live geometry, not the --board-claim-max token that happens to make it true",
    falsifier: {
      brokenBy: "`--only S22b --break \".board-claim,.board-claim .claim-line{max-width:none !important;white-space:nowrap !important;overflow:visible !important}\"` — restores the uncapped prose cell in the last value track, the exact shipped shape that pushed READ out of the 1152px shell at 1440.",
      observed: 'check failed "/frontier @1440x900: the board\'s own container scrolls horizontally at 1440 (scrollWidth 2215px > clientWidth 1152px) — the last column is reachable only by scrolling sideways on the widest viewport the site declares". The shipped pre-fix board measured 1244px against the same 1152px shell, so the break reproduces the defect and then some. Restored; rebuilt tree passes S22b.',
      brokenByOpposite: "`--only S22b --break \".board-wrap{width:4000px !important} #frontier-board{width:1000px !important}\"` — the OPPOSITE sign of the same subtraction: instead of the last column running PAST the container's right edge, the container is held far wider than its own content, so the last column falls hundreds of pixels SHORT of it. A one-sided `right <= wrapRight` formula passes that trivially; this check bounds the distance in both directions, the same shape as S18's own two-sided floor.",
      observedOpposite: 'AT `.board-wrap{width:4000px}` ALONE (first attempt): no failure — informative, not a defect: the table is width:100% of its wrap, so it widened right alongside it and the last column tracked the container\'s new edge exactly; the property was never violated. WITH the table\'s own width pinned as well: check failed "/frontier @1440x900: the board\'s rightmost column stops 2852.3px short of its container\'s right edge (1291.7px vs 4144.0px) — a container held open beside nothing, the opposite excess of the overrun above". Restored; rebuilt tree passes S22b.',
    },
    kind: 'dom', routes: ['/frontier'], viewports: [[1440, 900]],
    check: async ({ page }) => {
      const r = await page.evaluate(() => {
        const table = document.getElementById('frontier-board');
        const wrap = document.querySelector('.board-wrap');
        if (!table || !wrap) return { error: 'missing #frontier-board or .board-wrap on /frontier' };
        const wrapRect = wrap.getBoundingClientRect();
        let worstRight = -Infinity;
        let nearestRight = Infinity;
        let rows = 0;
        for (const tr of table.querySelectorAll('tbody tr')) {
          const cell = tr.lastElementChild;
          if (!cell) continue;
          rows += 1;
          const right = cell.getBoundingClientRect().right;
          worstRight = Math.max(worstRight, right);
          nearestRight = Math.min(nearestRight, right);
        }
        if (!rows) return { error: 'no board rows to measure' };
        return {
          rows,
          worstRight,
          nearestRight,
          wrapRight: wrapRect.right,
          scrollWidth: wrap.scrollWidth,
          clientWidth: wrap.clientWidth,
        };
      });
      if (r.error) return r.error;
      if (r.scrollWidth > r.clientWidth + 1) {
        return `the board's own container scrolls horizontally at 1440 (scrollWidth ${r.scrollWidth}px > clientWidth ${r.clientWidth}px) — the last column is reachable only by scrolling sideways on the widest viewport the site declares`;
      }
      const overhang = r.worstRight - r.wrapRight;
      if (overhang > 1) {
        return `the board's rightmost column overruns its container by ${overhang.toFixed(1)}px (cell right ${r.worstRight.toFixed(1)}px vs container right ${r.wrapRight.toFixed(1)}px)`;
      }
      const shortfall = r.wrapRight - r.nearestRight;
      if (shortfall > 300) {
        return `the board's rightmost column stops ${shortfall.toFixed(1)}px short of its container's right edge (${r.nearestRight.toFixed(1)}px vs ${r.wrapRight.toFixed(1)}px) — a container held open beside nothing, the opposite excess of the overrun above`;
      }
      return true;
    },
  },
  {
    id: 'S25', rule: 'R8',
    intent: "RD-003 fix 2 (JV-sys F-sys-3-1, with F-sys-3-3; BRIEF R-B — vendor language only verbatim, ATTRIBUTED and LABELLED). RD-002 removed the per-row \"claimed · unverified\" chip, correctly: a mark on 16 of 16 rows is the collection default and R8 forbids boxing it. But nothing took over its WORDS, and the >90% branch that was meant to state them once never fires at the shipped 3/16 split, so the word 'unverified' survived only inside the column header while three vendor sentences sat at the ink weight of the fed price columns beside them. R8's own answer to a state every row shares is to state it ONCE above the surface; this check asserts the words are there, in the first viewport, at BOTH declared viewports and in BOTH themes: an /frontier lede element states, in words a reader meets before the board, that the claims are the vendor's own and NOT VERIFIED by this site, and that a blank means no claim on file. Checked as rendered geometry and rendered text, not as a string in a template: a sentence pushed below the fold at 390, or reduced to the same colour as its background in one theme, is not a label.",
    independent: "document.body.innerText and getBoundingClientRect on the built page at each declared viewport, with data-theme stamped to each of light and dark in turn and the resolved colours read back from getComputedStyle — never the JSX source, the renderer's own string constants or a CSS token name",
    falsifier: {
      brokenBy: "TWO breaks. (i) `--only S25 --break \".board-lede{display:none !important}\"` — the sentence removed entirely, which is the shipped pre-RD-003 state: 'unverified' nowhere on the route but the column header. (ii) `--only S25 --break \".board-lede{position:absolute !important;top:4000px !important}\"` — the sentence present in the DOM and in innerText, but 4,000px down the document, so a reader meets the three vendor sentences first and the label never. A check that only asked 'does the page contain the words' passes (ii) perfectly.",
      observed: '(i) check failed "/frontier @1440x900: [light] the /frontier lede is present in the DOM but not rendered (display none, visibility visible, opacity 1, height 0)". (ii) check failed "/frontier @1440x900: [light] the /frontier lede is outside the first viewport (top 4000.0px, bottom 4040.3px, viewport 900px) — a reader meets the vendor\'s sentences before the label saying nobody checked them". Restored; the real gate passes S25 at 1440 (lede top 268.2px, bottom 308.5px of 900) and at 390 (top 398.4px, bottom 458.8px of 844).',
      brokenByOpposite: "The clause bounds a POSITION and a legibility, and both have a real other end: present, in frame, and unreadable is the opposite excess of absent, and a 'the words are on screen' formula passes it perfectly. Broken ONCE PER THEME, with the ground each theme actually paints, so the theme half of this check is exercised rather than declared: `--break \".board-lede{color:rgb(246,246,248) !important}\"` (the LIGHT ground) and `--break \".board-lede{color:rgb(20,22,28) !important}\"` (the DARK ground). A `color:var(--bg)` break was tried first and reported 0 of 1 fired — informative, not a defect: `--bg` is not the token the page's ground resolves from, so the break never made the text match its background.",
      observedOpposite: 'Light: check failed "/frontier @1440x900: [light] the /frontier lede renders at rgb(246, 246, 248) on rgb(246, 246, 248) — no channel differs by more than 0 — present, in frame, and unreadable". Dark: check failed "/frontier @1440x900: [dark] the /frontier lede renders at rgb(20, 22, 28) on rgb(20, 22, 28)" — each fires ONLY in its own theme, which is the evidence that both passes run. THE DARK BREAK EXPOSED A REAL DEFECT IN THIS CHECK, found by falsification and recorded rather than quietly patched: with the stamp and the measurement in one `page.evaluate` — even with a forced `offsetHeight` reflow, and then with two `requestAnimationFrame`s — the dark pass read the LIGHT ground (`data-theme="dark"` stamped, `--paper` already resolving to #14161c on :root, `background-color` still rgb(246, 246, 248)), so the dark break reported 0 of 1 fired and the check was theme-aware in prose only. Fixed by stamping and measuring in two round trips with an explicit settle between them. Restored; the real gate passes S25 in both themes at both viewports.',
    },
    kind: 'dom', routes: ['/frontier'], viewports: [[1440, 900], [390, 844]],
    check: async ({ page }) => {
      // the page's own stamp, restored before returning so this check leaves
      // the document exactly as it found it for whatever runs next
      const stamped = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      let verdict = true;
      for (const theme of ['light', 'dark']) {
        // The stamp and the MEASUREMENT are two separate round trips with two
        // animation frames between them. Doing both in one `evaluate` — even
        // with a forced `offsetHeight` reflow — measured the PRE-RECALC frame
        // on the theme swap and is exactly the intermittent-falsifier defect
        // IMPLEMENT.md records: with `data-theme="dark"` stamped and
        // `--paper` already resolving to #14161c on :root, `background-color`
        // still read rgb(246, 246, 248), so an injected dark-ground break
        // reported 0 of 1 fired — a check that looked theme-aware and was not.
        // Found by falsification, not by review.
        await page.evaluate(async (t) => {
          document.documentElement.setAttribute('data-theme', t);
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        }, theme);
        // ...and two rAFs were NOT enough on their own in headless Chromium:
        // with them alone the dark pass still read the light ground. The
        // explicit settle is what makes the theme half of this check real.
        await page.waitForTimeout(120);
        const r = await page.evaluate(() => {
          const lede = document.querySelector('.board-lede');
          if (!lede) return { error: 'no .board-lede element on /frontier' };
          const cs = getComputedStyle(lede);
          const rect = lede.getBoundingClientRect();
          // the nearest ancestor that actually paints a background
          let bg = 'rgba(0, 0, 0, 0)';
          for (let n = lede; n; n = n.parentElement) {
            const c = getComputedStyle(n).backgroundColor;
            if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) { bg = c; break; }
          }
          const px = (c) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
          return {
            text: lede.innerText.replace(/\s+/g, ' ').trim(),
            top: rect.top, bottom: rect.bottom, height: rect.height,
            visibility: cs.visibility, display: cs.display, opacity: parseFloat(cs.opacity),
            fg: px(cs.color), bg: px(bg),
            vh: window.innerHeight,
            fence: lede.closest('[data-derived]')?.getAttribute('data-derived') ?? lede.getAttribute('data-derived') ?? null,
          };
        });
        if (r.error) { verdict = r.error; break; }
        const lower = r.text.toLowerCase();
        if (!lower.includes('not verified')) {
          { verdict = `[${theme}] the /frontier lede does not say "not verified" ("${r.text.slice(0, 70)}…") — the words the removed chip carried have to land somewhere a reader reads`; break; }
        }
        if (!lower.includes('verbatim')) {
          { verdict = `[${theme}] the /frontier lede does not say the claims are quoted verbatim from the vendor — attribution is half of BRIEF R-B, the label is the other half`; break; }
        }
        if (!lower.includes('no claim on file')) {
          { verdict = `[${theme}] the /frontier lede does not say what a blank means — most of the board's rows ARE the blank, and an unexplained blank reads as an omission rather than as the board's own statement`; break; }
        }
        if (r.fence !== 'frontier-board') {
          { verdict = `[${theme}] the /frontier lede's counts sit outside the data-derived fence (data-derived=${r.fence}) — every digit on this route lives inside a frontier-<rail> element`; break; }
        }
        if (r.display === 'none' || r.visibility === 'hidden' || !(r.opacity > 0) || !(r.height > 0)) {
          { verdict = `[${theme}] the /frontier lede is present in the DOM but not rendered (display ${r.display}, visibility ${r.visibility}, opacity ${r.opacity}, height ${r.height})`; break; }
        }
        if (!(r.bottom > 0 && r.top < r.vh)) {
          { verdict = `[${theme}] the /frontier lede is outside the first viewport (top ${r.top.toFixed(1)}px, bottom ${r.bottom.toFixed(1)}px, viewport ${r.vh}px) — a reader meets the vendor's sentences before the label saying nobody checked them`; break; }
        }
        const dist = Math.max(...r.fg.map((v, i) => Math.abs(v - r.bg[i])));
        if (!(dist > 24)) {
          { verdict = `[${theme}] the /frontier lede renders at rgb(${r.fg.join(', ')}) on rgb(${r.bg.join(', ')}) — no channel differs by more than ${dist} — present, in frame, and unreadable, which is the opposite excess of absent`; break; }
        }
      }
      await page.evaluate((t) => {
        if (t === null) document.documentElement.removeAttribute('data-theme');
        else document.documentElement.setAttribute('data-theme', t);
      }, stamped);
      return verdict;
    },
  },
  {
    id: 'S23', rule: 'R2',
    intent: "R2 is law (K14) and speaks of ROUTES, not of the four routes one script's list happened to name. /tutorials/<entry> rendered its document 465px wide in a 390px viewport — 75px of PAGE-level horizontal scroll from a single unbroken inline code token — and every gate stayed green because the reflow sample lives in scripts/verify-design.mjs against four fixed routes and this template is not one of them (F-struct-1; AR-001 D5: 'R2 speaks of routes, not regressions; inherited is no exemption'). That script is the rig and is not ours to edit, so the widening lands here, and it is widened by TEMPLATE rather than patched per route: one live route for EVERY page template the app declares (app/**/page.tsx), asserted at 390 and at R2's own 320. A new template added without a line in this list is the defect this check exists to stop repeating.",
    independent: "document.documentElement.scrollWidth against its own clientWidth at each declared viewport — the browser's own layout result on the built page, not any CSS max-width, and not the route list scripts/verify-design.mjs keeps for the same rule",
    falsifier: {
      brokenBy: "`--only S23 --break \".prose code{overflow-wrap:normal !important}\"` — removes this round's fix and restores the pre-fix shape exactly: the unbroken inline code URL in the tutorial body sets the document's min-content width past the viewport again, on the one template the old sample never saw.",
      observed: 'check failed "/tutorials/model-file-header-range-requests @390x844: the PAGE scrolls horizontally (scrollWidth 469px > clientWidth 390px) — first offenders: code.language-js right=604.3; code.language-text right=859.3; code.language-js right=657.8" — within 4px of the 465px the verdict measured off the shipped capture, and naming the inline code elements as the cause. Restored; rebuilt tree passes S23 on all 18 sampled templates at both viewports.',
      brokenByOpposite: "a page either overflows its viewport or it does not, so the second end of this property is its SCOPE, and that is what the second break exercises: `--only S23 --break \"body{min-width:1200px !important}\"` overflows EVERY sampled template at BOTH declared viewports rather than one template at one width. A check silently scoped to the route and viewport its motivating defect happened to occupy would report a single failure; this one must report the first of many, and the run's own message names which route it stopped on.",
      observedOpposite: 'check failed "/ @390x844: the PAGE scrolls horizontally (scrollWidth 1200px > clientWidth 390px) — first offenders: header.site-header right=1200.0; div.shell.header-bar right=1200.0; div.header-tools right=1186.0" — it stops on the FIRST sampled template rather than only on the one this round\'s fix touched, confirming the sample is genuinely wide and not scoped to its motivating route. Restored; rebuilt tree passes S23.',
    },
    // ONE ROUTE PER TEMPLATE the app declares (app/**/page.tsx) — including
    // the six the pre-existing reflow sample never saw: /tutorials/<entry>
    // (the defect itself), /learn/<entry>, /impossible-routine/<entry>,
    // /tools/<entry>, /blog/<entry> and /frontier, plus the two /catalog
    // sub-tables. 390 is the site's declared narrow viewport; 320 is R2's own.
    kind: 'dom',
    routes: [
      '/', '/frontier', '/wiki', '/wiki/concept/ai-winter', '/catalog', '/catalog/changed',
      '/catalog/deprecations', '/tools', '/tools/aider', '/learn', '/learn/ai-and-work',
      '/tutorials', '/tutorials/model-file-header-range-requests', '/blog',
      '/impossible-routine', '/impossible-routine/using-a-computer', '/data', '/colophon',
    ],
    viewports: [[390, 844], [320, 844]],
    check: async ({ page }) => {
      const r = await page.evaluate(() => {
        const doc = document.documentElement;
        const offenders = [];
        if (doc.scrollWidth > doc.clientWidth + 1) {
          for (const node of document.querySelectorAll('body *')) {
            const rect = node.getBoundingClientRect();
            if (rect.width > 0 && rect.right > doc.clientWidth + 1) {
              const cls = typeof node.className === 'string' && node.className.trim()
                ? '.' + node.className.trim().split(/\s+/).join('.')
                : '';
              offenders.push(`${node.tagName.toLowerCase()}${cls} right=${rect.right.toFixed(1)}`);
            }
            if (offenders.length >= 3) break;
          }
        }
        return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, offenders };
      });
      if (r.scrollWidth > r.clientWidth + 1) {
        return `the PAGE scrolls horizontally (scrollWidth ${r.scrollWidth}px > clientWidth ${r.clientWidth}px)${r.offenders.length ? ` — first offenders: ${r.offenders.join('; ')}` : ''}`;
      }
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
