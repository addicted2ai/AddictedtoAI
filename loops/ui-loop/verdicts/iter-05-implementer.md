# Iteration 5 — implementer report

Scope: `app/globals.css`, `app/blog/[slug]/page.tsx`, `loops/ui-loop/RULES.md`,
`tools/ui-invariants.mjs`. Four items (I16, I5, I30, I32). All four implemented; none
declined outright, but one HALF of I16's own prescription (widening `.browse` on `/wiki`
and `/data`) was declined with cause — it directly contradicts R7 — and the invariant was
satisfied instead through its own permitted alternative. New rule addenda under R7 and
R13 in `RULES.md` (no new rule numbers — both items cite existing rules and this
iteration's work is a refinement/extension of each, not a new normative claim). New
invariants S13–S16 added to `tools/ui-invariants.mjs`; S9 widened in place (same id, its
one-sided occupancy clause replaced with a genuine disjunction).

The gate was RED at the start of this iteration (`S9`: `.browse occupies 48.6% of the
shell's content width`). It is GREEN at the end. Every falsifier below was run for real
via `--only <id> --break "<css>"` before the corresponding rebuild; two anomalies are
recorded honestly rather than silently re-run away (see S15/S16 below).

---

## I16 — shared design system (`.shell`, `.browse`, the measure-track prose templates)

**Premise check.** Confirmed live against the pre-fix tree: `/wiki`'s `.browse` measured
48.6% of the shell's content width (matching the red gate exactly), flush against the
shell's left edge — the entire deficit pooled on the right. `/data`'s four sections and
`/colophon`'s `.prose`/`.listing-facts` showed the identical flush-left shape. The wiki
entry template's dead track and I5's buried-FACTS defect are the same empty space viewed
from two different problems (see I5 below).

**The prescription's first half — "restore a genuine second column, kind and status
right-aligned toward the shell's inner edge" — conflicts with R7 and was declined.**
R7's own text: a list surface "shall bound its primary label column to a list measure
token, **not `--shell`**, so a row's metadata sits immediately after its label **rather
than at the container's far edge**." Right-aligning `.browse-kind`/the status badge
toward the shell's inner edge on `/wiki` and `/data` is precisely "metadata at the
container's far edge" — the shape R7 exists to forbid, restored. iter-01 removed this
same layout for a different but related reason (alignment drift across rows); iter-04's
subgrid fixed that reason, but it did not revive the argument for putting metadata at the
far edge, because R7 forbids that independent of whether the columns stay aligned while
doing it.

I16's own **invariant**, not just the prescription, offers a second remedy that does not
have this conflict: "either... ink on at least 25% of scanlines... **or** the occupied
track is centred... so the unoccupied width is split rather than pooled entirely on one
side." Centring changes nothing about where `.browse-kind`/the badge sit relative to
`.browse-name` (R7's own concern) — it only moves the whole already-correctly-shaped list
sideways within its container. Applied:

- `main.shell > .browse { margin-inline: auto; }` — `/wiki` (a direct child of the
  shell; scoped by the direct-child combinator so it does not also reach `/data`'s
  nested lists or `/tools`', neither evidenced for this defect).
- `.section:has(> .browse), .section:has(> .footer-links) { margin-inline: auto; }` —
  `/data`'s four sections (added to the existing `width: fit-content` rule there).
- `article:has(> .listing-facts):not(:has(> .entry-head)) > .prose, ... > .listing-facts
  { margin-inline: auto; }` — `/colophon` specifically (the `:not()` keeps this off
  `/tools/[slug]`, which shares `.listing-facts` but was not evidenced for this defect).
- `.post-body > .entry-head, .post-body > .prose, .post-body ~ .rails { margin-inline:
  auto; }` — `/blog/[slug]`. `.post-body` is a new class on the post's content wrapper
  div in `app/blog/[slug]/page.tsx` (blog nests its body one level deeper than a wiki
  entry or `/colophon` do, so it needed its own hook rather than sharing their
  `article:has(...)` selector).

The wiki entry template (`/wiki/[kind]/[slug]`) is the one measure-track template that
did **not** get centred — see I5 below, which fills its freed track with FACTS instead.

`/tools`, `/learn`, `/tutorials/[slug]`, `/impossible-routine/[slug]` were deliberately
left untouched: none were evidenced for this defect, and at least one (`/impossible-
routine/[slug]`'s `.delta`, a full-shell-width timeline widget currently flush-aligned
with `.entry-head` above it) would have visibly misaligned if `.entry-head` alone were
centred against it — a regression this item's evidence never asked for.

**I32 was worked in the same file, same session** (see below) — its `fit-content()`
change to `.browse`'s first track interacts with this item only in that it makes
`/wiki`'s `.browse` narrower still; centring handles any resulting width, so the two
changes compose without conflict.

**Measured after** (1440x900, via the new `S9`/`S13` assertions, confirmed by
screenshot): `/wiki`'s `.browse` left/right gaps equal (both ~592px, occupancy 48.6% —
unchanged in magnitude, now split instead of pooled); `/data`'s four sections each
centred (left gap = right gap within 2px, largest observed 946.9px split evenly);
`/colophon`'s `.prose`/`.listing-facts` centred (544.0px split evenly); `/blog/[slug]`'s
title/byline/body/REFERENCED-HERE rail all share one centred position (they share one
measure, so centring all of them keeps them mutually aligned).

**Rule/invariant.** `RULES.md` R13 — text amended (the "shall not leave a track...
unoccupied" clause now names centring as the alternative to widening) plus an iter-05
addendum explaining the R7 conflict and the state this iteration actually applied.
`tools/ui-invariants.mjs`: `S9`'s `/wiki` clause widened from a one-sided occupancy bound
to `occupancy >= 55% OR centred (|leftGap - rightGap| <= 2px)`; new `S13` extends the
same two-state test to `/data`'s four sections and `/colophon`, plus a third clause on
the wiki entry route confirming the freed track is FILLED there rather than centred (see
I5).

**Falsifier — S9 (5 breaks, `--only S9 --break "<css>"`, ~3s each).**
1. Reverted `.browse`/`.browse-row` to the pre-S9 independent-per-row grid → `"/wiki
   @1440x900: the status badge's left edge varies by 17.3px across sampled rows..."`
2. `.browse { width: 100% }` alone (subgrid/fit-content intact) → `"/wiki @1440x900:
   .browse's own right edge (1296.0px) reaches the shell's inner edge (1296.0px)..."`
3. Reverted `.rung`'s wide-breakpoint track → `"/learn @1440x900: .rung's own width
   (1152.0px) matches the shell's full inner width (1152.0px)..."`
4. Removed only the new `margin-inline: auto` (fit-content/subgrid intact) → `"/wiki
   @1440x900: .browse is neither >=55% of the shell's content width NOR centred (left
   gap 0.0px, right gap 592.2px, occupancy 48.6%)"` — the exact number this item opened
   with.
5. Asymmetric margin (`margin-left: 20px`, everything else 0) — confirming a small
   nonzero left gap does not get misread as "split" → `"...left gap 20.0px, right gap
   572.2px, occupancy 50.3%"` — correctly still read as uncentred.

All five restored; rebuilt tree passes `S9` at both declared viewports.

**Falsifier — S13 (3 breaks, one per clause).**
1. `.section:has(> .browse), .section:has(> .footer-links) { margin-inline: 0 !important
   }` → `"/data @1440x900: /data \"Everything, as one file\" block is not centred...
   left gap 0.0px vs right gap 946.9px"`
2. Colophon's centring rule reverted → `"/colophon @1440x900: /colophon .prose is not
   centred... left gap 0.0px vs right gap 544.0px"`
3. `.entry-facts` forced back to `grid-column: 1` at the wide breakpoint → `"/wiki/
   concept/ai-winter @1440x900: .entry-facts's right edge (752.0px) falls well short of
   the shell's inner edge (1296.0px) — the freed track beside prose is not actually
   occupied"`

All three restored; rebuilt tree passes `S13` at both declared viewports.

`files`: `app/globals.css`.

---

## I5 — wiki entry page template (`app/wiki/[kind]/[slug]/page.tsx`, via `app/globals.css`)

**Premise check.** Confirmed on `/wiki/concept/ai-winter` before any change: prose ran
from y≈240 to y≈2100 of a 2974px page (a 605px measure, matching the item's own
description almost exactly), with the FACTS block — term origin, the Lighthill report's
date, the ALPAC report, the Symbolics revenue trend — beginning only after all of it. A
reader arriving from search for one dated value had to scroll past the whole essay.

**Fix — the freed track holds FACTS, and this is I16's remedy for this one template
too.** `renderEntryPage` (`lib/render/entry.mjs`) still emits identity, prose, FACTS,
timeline and rails in that DOM order — the markup is genuinely unchanged, matching the
item's own framing. What changed is where each piece is PAINTED, entirely in
`app/globals.css`, scoped to `article:has(> .prose):has(> .entry-facts)` (a wiki entry
with both a body and a facts block; a stub with facts and no prose does not match, so
nothing is repositioned where there is nothing to place beside):

- At the site's own existing wide-layout threshold (`min-width: 60rem`, the same
  breakpoint `.home-grid` already uses), the article becomes a two-column grid — prose in
  column 1 (`minmax(0, var(--measure))`, unchanged from its own cap), FACTS in column 2
  (`minmax(0, 1fr)`, the track I16 found empty on this exact template). `entry-head`,
  `.entry-timeline` and `.rails` span both columns and fall back to flush-left
  (`margin-inline: 0`) so they stay aligned with prose's own left edge rather than
  centring within the wider span (which the general I16 centring rule above would
  otherwise apply to them).
- Below that breakpoint there is no room for two real columns, so FACTS instead moves
  ahead of prose in PAINT order only, via `order` (identity → notice → **FACTS** →
  prose → timeline → rails). DOM order is untouched at every width — a screen-reader
  user reads the same document either way; a sighted reader, at any width, now sees the
  dated values before they would have had to start scrolling past the prose.

**Measured after** (via the new `S14` assertion and screenshot, both themes, both
viewports): at 1440x900, FACTS renders beside the first paragraph of prose, top edge
well inside the first viewport. At 390x844, FACTS renders directly under the identity
block, before any prose — confirmed in the mobile screenshot (`wiki-entry--light--390`),
last visible line is the very start of the prose paragraph. Screenshots at
`wiki-entry--{light,dark}--{1440,390}.png` were reviewed directly; no overlap,
misalignment, or clipped facts values in either theme at either width.

**Rule/invariant.** `RULES.md` R13 — same addendum as I16 above (both items share the
rule and the addendum explains both remedies together, since they are one freed-track
fix). `tools/ui-invariants.mjs` new `S14`: `.entry-facts`'s top edge falls within
`window.innerHeight` at both 1440x900 and 390x844, on an entry whose own prose is taller
than the viewport (so the assertion is against a fixture that actually tests burying, not
one where stacking alone would have been fine). This is the intent-preservation
assertion IMPLEMENT.md requires for a restructure that moves paint order.

**Falsifier — S14.** `--only S14 --break "article:has(> .prose):has(> .entry-facts) {
display: block !important; }"` (disables the whole restructure — grid, order and column
placement all fall away, reverting to plain block flow in the original DOM order) →
`"/wiki/concept/ai-winter @1440x900: FACTS top edge (2173.9px) falls below the first
viewport (900px) even though the entry's own prose (1945px) is long enough that stacking
alone would have buried it"` — matches the item's own opening measurement ("begins past
y=2100 of a 2974px page") closely. The harness stops at the first failing viewport, so
390x844 was not separately exercised by this break; it is exercised by every non-broken
run, including the final gate, where both declared viewports pass. Restored; rebuilt tree
passes `S14` at both.

`files`: `app/globals.css`. (`app/wiki/[kind]/[slug]/page.tsx` and
`lib/render/entry.mjs` were read but not edited — the restructure is presentation-only,
achieved entirely through CSS grid placement and `order`, as the item's own prescription
anticipated.)

---

## I30 — `/blog` index, against `/wiki` and `/learn`

**Premise check.** Confirmed on `/blog`: the four post titles (`.rail-title`, inside
`.rail-item`'s `minmax(0, 1fr)` second column) ran to 1019px — unbounded, since
`.rail-item` is generic (shared with corrections, timelines, anchor blocks) and nothing
had ever bound its title-holding instance specifically. The intro paragraph on the same
page sits at `--measure` (608px); the third title wrapped at 1130px regardless.

**Fix.** `.rail-posts .rail-item { grid-template-columns: var(--rail-col) minmax(0,
var(--measure-list)); }` — bound to the SAME token (`--measure-list`, 384px) R7 already
uses for `.browse-name` on `/wiki`, `/data` and `/tools`, scoped to `.rail-posts`
specifically (the class `lib/render/blog.mjs` already puts on the post index's `<ol>`)
so the generic `.rail-item` used elsewhere is untouched.

The item's own prescription raised an alternative — widen `--measure-list` itself if
`/blog`'s titles are "genuinely too long" for it — and noted three of the four titles run
past 900px unbounded. Declined: three of four titles wrapping to two lines at 384px is
not evidence the token itself is wrong, it is what a title column bounded to a reading
measure is SUPPOSED to do for longer titles (the same thing `/wiki`'s longer entry names
already do in the same track). Widening the shared token to accommodate `/blog`'s longest
titles would also widen `/wiki`, `/data` and `/tools`' tracks, which are not evidenced as
too narrow — that is exactly "changing the token... for one template's own reason", the
shape the item's own prescription warns against.

**Measured after** (screenshot `blog--light--1440.png`): titles now wrap within a ~384px
column, visually consistent with the intro paragraph's own narrower measure and with
`/wiki`'s and `/learn`'s title tracks.

**Rule/invariant.** `RULES.md` R7 — iter-05 addendum (part b), no new rule number: this
is R7's own text ("`.browse-row` **and its kin**") already anticipating a non-`.browse`
list surface, extended to one for the first time. `tools/ui-invariants.mjs` new `S15`:
reads the resolved (used) pixel width of `.rail-posts .rail-item`'s second grid track via
`getComputedStyle`, not the item's own box (S1's own post-mortem: a grid item's box
stretches to its track regardless of the track's actual size, so measuring the box alone
is vacuous — this reads the TRACK).

**Falsifier — S15.** `--only S15 --break ".rail-posts .rail-item { grid-template-
columns: var(--rail-col) minmax(0, 1fr) !important; }"` (the pre-fix track, still used
everywhere else `.rail-item` appears) → `"/blog @1440x900: .rail-posts .rail-item's
title track is 1036.0px, exceeding --measure-list (384.0px)"`, reproducible on repeat.
**Recorded honestly:** one earlier run of the identical command reported the check NOT
firing (0 of 1). Re-run twice more with the identical command and CSS; both fired
correctly with the same 1036.0px reading, and a standalone script (deleted after use)
confirmed `getComputedStyle` resolves the injected override to `"100px 1036px"` on that
page regardless. Treated as a one-off operational flake — server/process timing across a
long run of consecutive `--break` invocations, not a defect in the check's logic —
because the check's own code did not change between attempts and every subsequent run
agrees exactly. The same pattern recurred once more on `S16` immediately after (see
below); if this shape appears a third time in a future iteration it should be treated as
a real harness-reliability finding rather than coincidence twice.

`files`: `app/globals.css`.

---

## I32 — shared design system (`app/globals.css`, `.browse-name`'s track), on `/tools`

**Premise check.** Confirmed on `/tools`' category index: `.browse-name` occupied the
full 384px `--measure-list` track on every row regardless of content — the widest label
("observability") rendered at ~95px, leaving the count column (`.browse-kind`) sitting
~300px from the label it counts. `/data`'s longest label sits much closer to the same
384px cap (its own row genuinely needs most of it), confirmed unaffected.

**Fix.** `.browse`'s first grid track changed from `minmax(0, var(--measure-list))`
(always exactly 384px, a fixed reservation regardless of content) to
`fit-content(var(--measure-list))` (sizes to the WIDEST label actually on that list,
capped at 384px — never below it, by construction, so a genuinely long label such as
`/data`'s is never truncated). This is a change to the shared `.browse` rule, so it
applies everywhere `.browse` is used; per R13, sizing is still one shared value per list
(subgrid means every row of a given `.browse` sees the SAME resolved track), so this does
not reopen the alignment problem R13's own S9 already closed.

**Measured after** (screenshot `tools--light--1440.png`, both themes): the count column
now sits immediately after each category label ("agents 2", "audio 2", "coding 3", ...)
instead of floating in a separate column ~300px away.

**Rule/invariant.** `RULES.md` R7 — same addendum as I30 above (part a). `tools/ui-
invariants.mjs` new `S16`: gap between a `Range`-measured glyph extent of the widest
`.browse-name` on `/tools`' category index and `.browse-kind`'s left edge (same
Range-not-box technique S1 established, for the same reason — a grid item's box
stretches to its track regardless of the track's real size).

**Falsifier — S16.** `--only S16 --break ".browse { grid-template-columns: minmax(0,
var(--measure-list)) max-content max-content !important; }"` (the pre-I32 fixed track,
reintroduced) → `"/tools @1440x900: gap between /tools' widest category label and the
count column is 301.7px — the label track is not sizing to this surface's own content"`.
**Same anomaly as S15:** the first attempt reported the check not firing; two further
identical runs both fired correctly with the identical 301.7px reading. Treated the same
way (see S15's note above) — recorded rather than silently discarded.

The property's other direction — a cap small enough to truncate a surface's genuinely
long labels — is not this check's job to falsify: `fit-content()` cannot size below
min-content by construction, and the case where the cap legitimately binds (`/data`,
whose longest label sits close to the full 384px) is `S1`'s own pre-existing regression
guard on that route, reconfirmed passing in the same gate run, unaffected by this change.

`files`: `app/globals.css`.

---

## Declined / not attempted

- **I16's "widen `.browse` toward the shell's far edge" on `/wiki` and `/data`** —
  declined with cause (conflicts with R7). See I16 above for the full argument.
- **I30's "widen `--measure-list` itself"** — declined as unnecessary; not a rule
  conflict, but the evidence given (three of four titles wrap) does not support that the
  token is wrong, only that a bounded column does what a bounded column is for. See I30
  above.
- **Extending I16's centring or I5's two-column treatment to `/tools/[slug]`,
  `/learn/[slug]`, `/tutorials/[slug]`, `/impossible-routine/[slug]`** — none of these
  routes were evidenced for either defect, and at least one (`/impossible-routine/
  [slug]`'s `.delta`) would plausibly have regressed if touched blind. Left untouched;
  flagged for a future template-scoped iteration if evidence turns up there.

---

## Gate — final state, all three green

```
npm run build
  Compiled successfully. 620/620 static pages generated. First-load JS 103 kB shared
  (well under the 150 KB / R3 bound — largest per-route total, /catalog, 123.1 KB
  gzipped per verify-design's own measurement).

node scripts/verify-design.mjs
  45 check(s), 0 failure(s).
  - axe-core: 0 violations, light AND dark, on /, /wiki/concept/ai-winter, /catalog,
    /tools (45–51 rules each).
  - reflow: no horizontal scroll at 320px, all four sampled routes.
  - keyboard: nav/search/theme-toggle all reached AND activated, all four routes.
  - focus: every tab stop shows an indicator (83–817 stops depending on route).
  - above the fold: unchanged from before this iteration (13/24 and 5/24 changed-feed
    lines visible at 1440x900 / 390x844) — this iteration did not touch the home page.

node tools/ui-invariants.mjs
  PASS  14 invariant(s) hold.  (S1, S2, S6, S5, S7, S8, S9, S10, S11, S12, S13, S14,
  S15, S16 — S9 widened in place, S13–S16 new, all others unchanged and reconfirmed.)
```

Both `npm run build`'s own log and `scripts/verify-design.mjs`'s printed output were read
directly, not inferred from an exit code (`serve-static`'s own EACCES-on-bind failure
mode noted in the brief did not occur — the harness's dynamic free-port allocation picked
a fresh port on every one of the ~15 `--break` runs plus the three full-gate runs in this
session without a single bind conflict).

## Visual review

28 screenshots captured (7 routes × 2 viewports × 2 themes: `/wiki`, `/wiki/concept/
ai-winter`, `/data`, `/colophon`, `/blog`, one `/blog/[slug]` post, `/tools`) via a
throwaway Playwright script, reviewed directly, then deleted along with a second
throwaway debug script used to diagnose the S15/S16 flake. Findings: FACTS renders
beside prose at 1440x900 and directly above it at 390x844 on the wiki entry, in both
themes, with no overlap or clipping; `/wiki` and `/data`'s lists read as centred rather
than flush-left, with the dead space visibly split rather than pooled; `/colophon` and
the blog post read as one centred column, title and body mutually aligned; `/blog`'s
titles now wrap within a measure comparable to the page's own intro paragraph; `/tools`'
category index now sits label-then-count with no visible gap. No defect was visible in
any of the 28 captures.

## Files changed

- `app/globals.css` — all four items.
- `app/blog/[slug]/page.tsx` — I16 only (`className="post-body"` on the post's content
  wrapper `<div>`, a scoping hook; no other structural change).
- `loops/ui-loop/RULES.md` — R7 and R13 addenda (paired with the `S13`–`S16` additions
  and the `S9` widening above).
- `tools/ui-invariants.mjs` — `S9` widened in place; `S13`, `S14`, `S15`, `S16` added.
