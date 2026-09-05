# Iteration 4 — implementer report

Scope: `app/globals.css`, `app/layout.tsx`, `loops/ui-loop/RULES.md`,
`tools/ui-invariants.mjs`. Seven items (I16, I17, I18, I24, I25, I20, I10), all shared-
design-system defects feeding information density, family coherence and typographic
system. All seven implemented; none declined outright. One prescription (I10's
self-hosted-face half) declined with cause in favour of the item's own stated
alternative. New rules R13–R16 added to `RULES.md`; new invariants S9–S12 added to
`tools/ui-invariants.mjs`; S5 and S6 widened in place (same ids, wider route lists).

Every measurement below was taken live against the built `out/` via Playwright, before
writing the corresponding CSS — this is a premise-verification pass in every case, not
narration after the fact. Two premises turned out partially or wholly false; both are
called out explicitly.

---

## I16 + I17 — worked together, as instructed

**Premise check.** Confirmed live, before any change, at 1440x900:

- `/wiki`: `.browse-kind`'s left edge was already constant (540px) across sampled rows
  — R7/S1 (iter-01) already fixed the label column. The STATUS badge's left edge was
  NOT constant: it ranged 574.9–605.3px (spread 30.5px) because each `.browse-row` was
  its own independent grid and the kind column's `auto` track sized to that row's own
  word length ("event" vs "concept" vs "technique"). This is I17 exactly.
- Same page: `.browse`'s own `border-top` (the group's boundary rule, kept under R8)
  ran to the shell's inner edge (1296px) while the widest row content stopped well
  short of it. This is I16.
- `/learn`: `.rung`'s grid track for the value column was `minmax(0, 1fr)` — a flexible
  track that filled the remaining 1152px shell even though `.rung-outcome`/`.rung-title`
  inside were already capped to `var(--measure)` (608px). Same defect, different
  mechanism.

**Fix.** One mechanism for both surfaces, matching the invariant's "at most two declared
tracks" framing:

- `.browse` becomes the grid container (`grid-template-columns: minmax(0,
  var(--measure-list)) max-content max-content`) instead of each `.browse-row`
  declaring its own; rows now use `grid-template-columns: subgrid; grid-column: 1 / -1`.
  Subgrid means the trailing two columns size to the WIDEST cell in that column across
  the whole list, not to one row's own content — this is what makes the status column
  align. `.browse` also gets `width: fit-content; max-width: 100%`, so the list (and its
  border-top) stops at its own content's width instead of the shell's.
- The existing `@media (max-width: 26rem)` narrow override is preserved in shape (S1's
  pre-fix 2-column layout for the stacked mobile row) but now also declared on `.browse`
  itself (`grid-template-columns: minmax(0, 1fr) auto; width: 100%`) so the shared/fit-
  content behaviour is desktop-only; `.browse-row` stays `subgrid` against that 2-column
  parent rather than reverting to an independent grid.
- `/learn`'s `.rung` at its `min-width: 48rem` breakpoint: value column changed from
  `minmax(0, 1fr)` to `minmax(0, var(--measure))` (a fixed cap, not a flexible fill),
  plus `width: fit-content; max-width: 100%` on `.rung` itself. Below 48rem, untouched —
  the single-column stacked layout should still fill the viewport.

**Measured after.** `/wiki`: `.browse-kind` left edge constant at 540px across 12 sampled
rows (spread 0); badge left edge NOW constant at 620.6px (spread 0, was 30.5px). `.browse`
right edge 703.8px (was 1296px). `/learn`: `.rung` width 864px (was 1152px), right edge
1008px — which happens to land almost exactly on the ~1005px the judge's own problem
statement cited for `/learn`'s content edge, though arrived at by shrink-wrapping the
row's own tracks rather than by picking a shell-width number.

**Not done, and why:** column-start alignment ACROSS different templates (e.g. making
`/wiki`'s status column and `/learn`'s value column share one absolute x) remains out of
scope per DC1, which this iteration does not reopen — each surface's own trailing
columns now share one track; no claim is made about alignment between surfaces with
different label-column widths.

**Rule/invariant:** `RULES.md` R13 (new). `tools/ui-invariants.mjs` `S9` (new), routes
`/wiki` and `/learn`, both viewports. Falsifier: three breaks — reverted `.browse` to
the pre-fix independent-per-row grid (caught: "the status badge's left edge varies by
30.5px"); with alignment restored, reverted only the fit-content half (caught: "`.browse`'s
own right edge (1296.0px) reaches the shell's inner edge"); reverted `.rung`'s track/fit-
content (caught: "`.rung`'s own width (1152.0px) matches the shell's full inner width").
All three restored and reconfirmed passing.

`files`: `app/globals.css`.

---

## I20 — section-heading rule width (R10)

**Premise check — one route confirmed, one route found NOT broken.**

- `/wiki/concept/ai-winter`: confirmed. `.section-title#facts`'s rendered width was
  1152px (144–1296px) against `.facts`'s 608px (144–752px) — the exact shape the item
  described, matching its cited numbers almost exactly (1152 vs the item's 1295−145).
- `/data`: confirmed. Each of the four `<h2 class="section-title">` headings ran to the
  shell's edge while their content (a `.browse` list, or a single link inside
  `.footer-links`) was far narrower.
- **`/colophon`: NOT broken.** Measured `.listing-facts` (the page's only rule-bearing
  element besides `.prose`) at 608px — already exactly matching `.prose`'s 608px. This
  was S5/R10's own iter-01 fix (`.listing-facts { max-width: var(--measure) }`), already
  in place. `/colophon` has no `.section-title` element at all. The item's claim of "now
  confirmed on a third template" does not hold for `/colophon` as evidenced — filed here
  per the standing instruction to verify premises rather than carry them forward
  unchecked (D6). Added to S5 anyway, as a regression guard rather than a fix.

**Fix.** `.section-title` has no width of its own — it is a block child that fills
whatever contains it — so the fix binds the INTRODUCING BLOCK, not the heading:

```css
.entry-facts,
.entry-timeline {
  max-width: var(--measure);
}

.section:has(> .browse),
.section:has(> .footer-links) {
  width: fit-content;
  max-width: 100%;
}
```

The `:has()` selectors are deliberately narrow — they match `/data`'s four sections
(three wrap `.browse`, one wraps `.footer-links`) and nothing else: `/tools`' category
sections wrap `.listings`, not `.browse`; the real site footer's own `.footer-links` is
not inside a `.section`. `.section` on its own (home, blog's Primary evidence/
Corrections, `/tools`' category groups) is untouched — not evidenced for this item, and
several of those legitimately use more of the shell; widening there is a template-scoped
question, not this shared-system one.

**A vacuous-check catch, caught while falsifying (recorded because it is the exact D4
shape).** The first cut of the `/data` clause in `S5` compared the heading's width
against its own immediate `.section` PARENT's width — which are always equal regardless
of whether `.section` is actually bounded, because `.section-title` is a block child that
fills `.section` whatever `.section`'s width happens to be. Falsifying the
`.section:has(...)` rule (removing it) did NOT fail the check — a vacuous pass, caught
before it shipped. Rewritten to compare the heading against the actual CONTENT element
(`.browse` or `.footer-links`), which is what R10 actually asks about; re-falsified, and
this version does fail correctly (below).

**Rule/invariant:** `RULES.md` R10 (existing — this item is R10 not yet being true, no
new rule). `tools/ui-invariants.mjs` `S5` widened in place: routes now
`['/wiki/concept/ai-winter', '/data', '/colophon']`. Falsifier: four breaks — removed
`.entry-head`'s pre-existing `max-width` (caught, iter-01's own falsifier, reconfirmed);
removed the new `.entry-facts, .entry-timeline` rule (caught: "FACTS heading width
1152.0px vs .facts width 608.0px"); removed the new `.section:has()` rule (caught, after
the vacuous-check fix above: "`/data` \"One table at a time (CSV)\" heading width 1152.0px
vs its content width 598.4px"); removed `/colophon`'s pre-existing `.listing-facts`
bound (caught: "`.listing-facts` width 1152.0px vs `.prose` width 608.0px" — confirming
the regression guard is not itself vacuous). All four restored and reconfirmed passing.

`files`: `app/globals.css`, `tools/ui-invariants.mjs`.

---

## I18 — one record-link treatment (R9)

**Premise check.** Confirmed live: `a.change-name` (home changed-feed) computed to
`rgb(74, 59, 212)` (== `--accent`, confirmed against `.wordmark .dot` as the live
reference) with underline; `.latest-card h3 a` (home "Latest post"/"Latest tutorial")
had no colour rule at all, inheriting the same bare `a { color: var(--accent) }`
default, no underline at rest; `.rung-title` (`/learn`) was `color: var(--ink);
text-decoration: none` — ink, but no underline, the third pattern the item names.

**Fix.** Same rest/hover pair already established for `.browse-name`/`.rail-title a`/
`.data-table a`, applied to the three selectors above:

```css
a.change-name { color: var(--ink); text-decoration: underline;
  text-decoration-color: var(--rule-strong); text-underline-offset: 0.16em; }
a.change-name:hover, a.change-name:focus-visible { color: var(--accent);
  text-decoration-color: currentColor; }
/* same pair for .latest-card h3 a and .rung-title */
```

`a.change-name` (not bare `.change-name`) deliberately: `lib/render/home.mjs` renders
`.change-name` as a `<span>` when a changed-feed line has no linkable entry, and an
underline on that span would claim it is clickable when it is not.

**Widened beyond the item's literal wording, and why.** The item names the home
changed-feed and `/learn`; I also fixed `.delta-title a` (the Impossible → Routine
showpiece headline), which was the identical ink-no-underline defect, present on the
SAME home page the item is fixing (the showpiece sits directly below the changed feed).
Leaving it would have produced a home page with two of three link groups fixed and one
still wrong — a worse, more visibly inconsistent outcome than finishing the pattern.
This is IMPLEMENT.md's "satisfy the invariant, not the wording" clause: R9's own text
("every index template") does not exclude `/impossible-routine`, which is exactly what
`.delta-title` is.

**Not done, flagged for a future iteration:** `.listing-name a` (`/tools`' listing
titles) has the identical ink-no-underline pattern. Not evidenced by this item, not on
the routes I18 names, and `/tools` is template-scoped work — left alone rather than
expanding scope unbidden. Worth a future item.

**Rule/invariant:** `RULES.md` R9 (existing). `tools/ui-invariants.mjs` `S6` widened in
place: `SELECTOR` map and `routes` both gained `'/': 'a.change-name'` and
`'/learn': '.rung-title'`. Falsifier: reverted `a.change-name` to no explicit colour
(caught: "`/`: resting colour equals --accent (rgb(74, 59, 212)) — accent leaked into
the resting state"). Restored and reconfirmed passing.

`files`: `app/globals.css`, `tools/ui-invariants.mjs`.

---

## I24 — mobile header budget (R6, R4)

**Premise check.** Confirmed: `.site-header` measured 129.28px at 390x844 on all four
routes tested (`/`, `/wiki`, `/tools`, `/catalog`) — 15.3% of the viewport, matching the
item's own number closely.

**Premise correction on the mechanism, not the measurement.** The item frames this as
chrome that "persists" through scroll. It does — but the fix I built doesn't rely on
scroll behaviour at all: at 390px the header is now compact (77.9px, 9.2%) AT REST,
before any scrolling, on every route, every time. The 10% budget is cleared with room
to spare rather than merely "on average."

**Fix — option (a) from the prescription: a keyboard-operable disclosure.** The seven
nav destinations move into a `<details class="nav-disclosure">`/`<summary
class="icon-btn nav-toggle">` pair — the same native disclosure primitive `/tools`
already uses for its A–Z listing, not a new interaction vocabulary. Server-rendered
markup carries `open` UNCONDITIONALLY, so with no script (or before any script runs)
every nav link is exposed and tabbable exactly as before this change — nothing is
removed from the tab order, only deferred behind a control below the breakpoint, which
is a genuine tab stop that opens on Enter.

At `min-width: 34rem` (desktop): `.nav-disclosure { display: contents }` removes the
details element's own box, so `.nav-toggle` (hidden) and `<nav>` become direct flex
children of `.header-bar` in the same position `<nav>` occupied before — desktop layout
is pixel-for-pixel unchanged (confirmed: `verify-design.mjs`'s keyboard check, which
only runs at 1440x900, reports the identical "7 of 7 in 11 tab stops" before and after).

At `max-width: 33.999rem`: `.nav-toggle` becomes visible (icon + "menu" label, styled via
the existing `.icon-btn` class — reused, not a new visual vocabulary); `.nav-disclosure
nav` becomes a floating dropdown (`position: absolute`, matching `.search-results`'s own
existing shadow/border/radius treatment almost verbatim) so the open/closed state never
affects the header's own rendered height.

`NAV_DISCLOSURE_SCRIPT` (layout.tsx, same placement pattern as `HEADER_HEIGHT_SCRIPT`)
sets the default open/closed state to match the viewport at load, and re-applies only on
`matchMedia(...).addEventListener('change', ...)` — the breakpoint's truth value
crossing, NOT a raw `resize` listener. This distinction is deliberate: `resize` fires
during ordinary mobile scrolling (the address bar showing/hiding), and a naive resize
listener would re-collapse a reader's own opened menu mid-interaction.

**Measured after.** Header height at 390x844: 77.9px / 9.23% on all four routes (was
129.3px / 15.3%) — under budget with a 6.5-point margin, not a photo finish. R6's own
above-fold count rose as a side effect, exactly as the governing rule predicted it
could only do: 4→5 of 24 changed-feed lines visible at 390x844 (measured by
`verify-design.mjs`, unprompted — this is the harness's own existing check, not one I
added). Live keyboard simulation confirmed the mechanism, not just its markup: Tab
reaches the summary, Enter opens it, and the immediately following Tab stop lands on
`href="/wiki"` — the first primary nav link.

**Rule/invariant:** `RULES.md` R14 (new). `tools/ui-invariants.mjs` `S10` (new), routes
`['/', '/wiki', '/tools', '/catalog']` at 390x844. Falsifier, two clauses: (1) height —
first attempt (widening the `display: contents` breakpoint to apply unconditionally)
did NOT fail the check, an informative non-result: the dropdown's own `position:
absolute` treatment is an independent second safeguard that keeps `<nav>` out of flow
regardless. The genuine break required removing `position: absolute` from the dropdown
AND forcing the script's `open` state to always be `true` together — reproducing "nav
always open, in normal flow," the real pre-fix condition. Caught: "`.site-header` is
270.5px (32.0% of 844px)". (2) keyboard — hid `.nav-toggle` at every width; caught:
"keyboard traversal did not reach the nav-disclosure summary within 20 stops." Both
restored, all edits reconfirmed byte-identical to the pre-break files, tree passes.

`files`: `app/globals.css`, `app/layout.tsx`, `tools/ui-invariants.mjs`.

---

## I25 — catalog trailing whitespace and card reading (R11, R8)

**Premise check.** Confirmed exactly: gap between `#catalog-table-wrap`'s bottom edge and
`.site-footer`'s top edge at 1440x900, max scroll: 96.0px, exactly `<main>`'s
`padding-block-end` (3rem/48px) plus `.site-footer`'s `margin-top` (3rem/48px). Measured
row height: 32.33px (five sampled rows, identical). The "card" reading was confirmed
separately: `#catalog-table-wrap`'s background (`--panel`, white) differed from the page
ground (`--paper`).

**Fix, gap.** Scoped to the catalog route only, via `:has()` — this whitespace is a
genuine editorial choice on every other template, and none of them pay this corridor
tax, so a global change would be an unrelated, unevidenced visual shift elsewhere:

```css
main:has(#catalog-table-wrap) { padding-block-end: 0.5rem; }
body:has(#catalog-table-wrap) .site-footer { margin-top: 1rem; }
```

Chosen to sum to 24px, comfortably under the measured 32.33px row-height bound (an
~8px margin, not a photo finish). `--footer-h` is not hand-tuned — S7's own falsifier
record already found that fails — it re-measures itself automatically
(`FOOTER_HEIGHT_SCRIPT`, unchanged) once these two source values shrink.

**Fix, card reading.** The cheaper test the item suggested — drop `--panel` to `--paper`
and check whether the row rules and thead rule are enough separation — was run and
found sufficient:

```css
#catalog-table-wrap { background: var(--paper); }
```

Scoped by id, not the shared `.table-wrap` class: `/catalog/deprecations` and
`/catalog/changed` keep the panel background, since their surface (no per-row rule,
per R8's surface test) is still exactly what S2's original card-avoidance reasoning
describes — only `#catalog-table`'s own surface (396 rows, a per-row rule restored by
R8 in iter-03, plus the thead's own border-bottom) was confirmed to have enough
separation without it.

**Measured after.** Gap: 24.0px (was 96.0px), well under the 32.33px row-height bound.
`--footer-h` re-measured itself to 120.67px (was 192.67px) with no script change needed.
Wrap background now equals page background exactly (`rgb(246, 246, 248)` both). thead
still clear of the site header at max scroll (61.3px vs 45.8px) — R11's corridor
unaffected. Screenshot at max scroll confirms the table now reads as the page's own
content field, ending close to the footer rather than floating above 96px of dead
ground.

**Rule/invariant:** `RULES.md` R15 (new). `tools/ui-invariants.mjs` `S11` (new), route
`/catalog` at 1440x900. Falsifier, two breaks: reverted both spacing values to their
pre-fix 3rem (caught: "gap 96.0px ... exceeds one row height (32.3px)" — the exact
pre-fix measurement); with that restored, commented out the background override (caught:
"`#catalog-table-wrap`'s background (rgb(255, 255, 255)) differs from the page ground
... it reads as a card"). Both restored, tree passes.

`files`: `app/globals.css`, `tools/ui-invariants.mjs`.

---

## I10 — cross-platform type rhythm (R3, R16)

**Premise check.** Confirmed: no `@font-face`, no `next/font`, no bundled face anywhere
in `app/` before this change. `--serif` was a bare fallback chain.

**The payload reading, stated explicitly as the item asks.** `data/launch.json`:
worst route (`/catalog`) measures 123.0 KB gzipped of a 150 KB budget — 27.0 KB
headroom. `scripts/measure-payload.mjs` (the script `R3`/`verify-design.mjs` actually
runs) sums `<script src>` and inline `<script>` bodies only; it does not touch CSS or
font files at all. **R3 as written would not have charged a self-hosted woff2 against
the budget.** This reading was verified by reading `measure-payload.mjs` directly, not
assumed.

**Declined with cause: self-hosting a subset woff2.** Not because of R3 — R3 has
headroom and, as read above, would not even count it. Declined because this
environment cannot responsibly produce one: no verified network fetch for a licensed
font binary is available to this implementer, and no subsetting toolchain
(`fonttools`/`pyftsubset` or equivalent) is present in the project's own dependencies to
turn a fetched file into a correctly-subset, correctly-licensed woff2. Shipping an
unverified or improperly-subset binary — or one whose license terms were not actually
checked — would be a worse outcome than the honest gap this item names. The item itself
offers a second mechanism as fully valid, not a fallback of last resort: "or keep the
stack and add size-adjust / ascent-override per named fallback." That path is taken
instead.

**Fix.** `size-adjust`-only `@font-face` overrides (no `ascent-override`/
`descent-override` — those govern vertical-metric CLS when a LATER-loading webfont
swaps in; nothing here loads over the network, so there is no swap to protect against,
and adding them without real ascent/descent data would be guessing at a property this
mechanism does not need). Three `local()`-sourced synthetic faces, normalized to
Georgia's own measured width:

```css
@font-face { font-family: 'Sitka Text Metric'; src: local('Sitka Text'); size-adjust: 96.2%; }
@font-face { font-family: 'Cambria Metric'; src: local('Cambria'); size-adjust: 105.7%; }
@font-face { font-family: 'Times New Roman Metric'; src: local('Times New Roman'); size-adjust: 106.5%; }
```

**Where the numbers came from — measured, not invented.** `ctx.measureText()` over a
fixed sample string (a pangram plus digits) at 100px, live in Chromium, for every named
font in the stack:

| font | measured width (100px) |
|---|---|
| Charter | 3502.34px |
| Bitstream Charter | 3502.34px |
| Sitka Text | 3878.40px |
| Cambria | 3529.59px |
| Georgia | 3729.64px |
| Times New Roman | 3502.34px |

`Charter` and `Bitstream Charter` measured IDENTICALLY to the browser's own
last-resort generic-serif fallback — this is how their absence on the implementation
platform was confirmed empirically rather than assumed. `Sitka Text` IS installed
(Windows ships it) and measured ~10.4% wider than Georgia — meaning on THIS platform,
before this fix, the stack actually resolved three entries down to Sitka Text at a
visibly different width than a platform that reaches Georgia or Cambria instead. This
is the defect, reproduced and measured rather than inferred.

Georgia is the anchor (own face untouched, no override): it is already the stack's
deliberate 5th choice, its metrics are published (unitsPerEm 2048, ascent 1878, descent
−449 — [Georgia font family - Typography, learn.microsoft.com](https://learn.microsoft.com/en-us/typography/font-list/georgia)),
and it is, not incidentally, also a Matthew Carter design, same as Charter.
`size-adjust` for each other fallback = Georgia's measured width ÷ that font's own
measured width.

**Measured after (canvas, same method):** Sitka Text Metric 3731.02px, Cambria Metric
3730.78px, Times New Roman Metric 3730.00px — all within 1.4px of Georgia's 3729.64px
(≤0.04% residual). `getComputedStyle(document.body).fontFamily` confirms the new stack
is applied.

**What this does and does not claim.** This narrows, and does not close, the defect the
item names. It is verified on exactly one real platform (this implementation
environment) for exactly three fallback names; it says nothing about Charter's or
Bitstream Charter's own metrics (unavailable), nothing about Linux/Android's generic
`serif` resolution (the bare keyword cannot be `local()`-targeted), and nothing about
any platform this implementer could not render on. Recorded as a real, measured,
partial improvement rather than either an unverifiable full claim or no action.

**Rule/invariant:** `RULES.md` R16 (new). `tools/ui-invariants.mjs` `S12` (new), route
`/`, checks the MECHANISM (canvas-measured widths of the three adjusted fallbacks
against Georgia, live in the harness browser) rather than the unfalsifiable
cross-platform claim itself. Falsifier: set `Cambria Metric`'s `size-adjust` back to
100% (no adjustment); caught: "`Cambria Metric` measures 3529.6px against Georgia's
3729.6px (diff 200.0px)" — exactly Cambria's raw unadjusted width from the table above.
Restored, tree passes.

`files`: `app/globals.css`, `tools/ui-invariants.mjs`.

---

## Sources consulted for I10

- [CSS size-adjust for @font-face — web.dev](https://web.dev/articles/css-size-adjust)
- [Fixing layout shifts caused by web fonts — Vincent Bernat](https://vincent.bernat.ch/en/blog/2024-cls-webfonts)
- [Georgia font family - Typography — learn.microsoft.com](https://learn.microsoft.com/en-us/typography/font-list/georgia)
- [ascent-override — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@font-face/ascent-override)

---

## Falsifier summary

Thirteen deliberate breaks across the six new/widened checks (S5, S6, S9, S10, S11,
S12), every one observed failing with the expected message and every one restored and
reconfirmed passing before moving to the next. One break (S5's `/data` clause, first
cut) turned out to be checking a vacuous property — caught DURING falsification, before
it shipped, and rewritten to check the real one; the rewritten version was then
falsified for real. One break (S10's height clause, first attempt) did not fail at
all, which was itself informative rather than a bug: it showed the fix has two
independent safety mechanisms rather than one, and the genuine two-part break that
followed confirmed the property properly.

## Gates, final state

All three run fresh, in order, from a clean rebuild, output read (not exit-code-judged):

- `npm run build` — clean. `Compiled successfully`, all 620 routes generated, export
  clean, first-load JS unchanged at 103 KB shared.
- `node scripts/verify-design.mjs` — **45 check(s), 0 failure(s)**. Payload: home 109.9
  KB, entry 109.6 KB, catalog 123.1 KB (all under the 150 KB budget; catalog's headroom
  essentially unchanged — the new `@font-face` rules are CSS text, not JS, and are not
  counted by this script's own method, consistent with the R3 reading stated above).
  Axe: 0 violations, both themes, all four sampled routes (`/`, `/wiki/concept/
  ai-winter`, `/catalog`, `/tools`). Reflow: clean at 320px, all four routes. Keyboard:
  every nav link/search/toggle reached and activated, all four routes, unchanged tab-stop
  counts from before this iteration. Focus indicators: complete or explained-partial
  sweeps on all four routes, no unindicated stops. Above the fold: 13 of 24 changed-feed
  lines at 1440x900 (was un-measured this precisely before), 5 of 24 at 390x844 (was 4 —
  a direct, predicted side effect of I24).
- `node tools/ui-invariants.mjs` — **10 invariant(s) hold** (S1, S2, S5, S6, S7, S8, S9,
  S10, S11, S12). Registry audit clean: every entry carries `falsifier.brokenBy` and
  `falsifier.observed`, every `dom` entry declares `viewports`.

No throwaway scripts remain in the project tree — all premise-check and post-check
Playwright scripts were written to the session scratchpad or copied in and deleted
immediately after each use (`_tmp_*.mjs`, removed via `rm -f` in the same turn).

## Files changed

- `app/globals.css` — all seven items.
- `app/layout.tsx` — I24 only (nav-disclosure markup, `NAV_DISCLOSURE_SCRIPT`).
- `loops/ui-loop/RULES.md` — R13, R14, R15, R16 added.
- `tools/ui-invariants.mjs` — S9, S10, S11, S12 added; S5, S6 widened in place.
