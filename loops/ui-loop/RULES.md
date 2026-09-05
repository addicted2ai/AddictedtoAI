# ui-loop — rules

The normative source for the `ui-loop`. Rules are numbered R1 onward and cited by number
(`RULES.md R4`) from verdict items, implementer reports and `tools/ui-invariants.mjs`.

**Rule numbers are an API.** Never renumber, never resequence, never reuse a retired
number — citations break silently. A retired rule stays as a one-line tombstone.

**How this file grows.** It is seeded below with the bounds this project already measured
and already treats as binding. Everything after R6 arrives the same way: an accepted
verdict item's `invariant` becomes a numbered rule here, in the same commit as the change
that satisfies it and the assertion that enforces it. A rule with no executable form is a
keeper-verified rule and says so.

RFC 2119 language: **shall** is an absolute requirement; **should** is a strong
recommendation whose deviation needs a stated reason; **may** is genuinely optional.

---

## Seeded rules — transcribed from `scripts/verify-design.mjs`

These were binding before this loop existed. The script is their executable form; this
file is where they are cited from.

**R1 — Contrast and the whole axe ruleset.** Every sampled route shall produce zero
axe-core violations in **both** themes. The whole ruleset runs, not only colour-contrast:
a keyboard trap or an unlabelled control is the same failure. This is the loop's domain
sanity floor and outranks every prescription in a verdict.

**R2 — Reflow.** No sampled route shall scroll horizontally at 320px. Wide content —
tables, code, diagrams — shall scroll inside its own container; the page shall not.

**R3 — Payload.** First-load JavaScript, gzipped, shall stay under the 150 KB bound
recorded in `data/launch.json` as `js_payload`.

**R4 — Keyboard reachability.** A scripted Tab traversal shall reach **and activate** the
nav links, the search box and the theme toggle on every sampled route. Reaching a control
is not the same as being able to use it.

**R5 — Focus visibility.** Every tab stop shall show a focus indicator, on the whole page.

> *Post-mortem, preserved.* The first implementation of this check quit at stop 11 — the
> end of the header — so nothing below the fold was ever examined, and it passed for as
> long as it existed. A check that stops early passes for the wrong reason. Any traversal
> added under this rule shall assert the number of stops it visited, and that count shall
> be compared against the page's actual focusable count, not assumed.

**R6 — Above the fold.** The home page shall show real content — changed-feed lines — at
both 1440x900 and 390x844, with no full-viewport hero. This is an **intent-preservation**
rule: it exists so a restructure cannot quietly push the site's substance below the fold
while passing every other check. It is the model every new restructure invariant follows.

---

## Rules added by this loop

Each entry below shall carry: the rule text, the verdict item it came from, the commit
that landed it, and either the assertion in `tools/ui-invariants.mjs` that enforces it or
an explicit note that it is keeper-verified.

**R7 — List-row measure.** A row-based list surface (`.browse-row` and its kin) shall
bound its primary label column to a list measure token (`--measure-list`), not `--shell`,
so a row's metadata sits immediately after its label rather than at the container's far
edge. From iter-01 S1 (`iter-00-a` I1 / `iter-00-b` I4, filed independently by both
judges). Enforced by `tools/ui-invariants.mjs` id `S1`.

> *iter-05 addendum, two extensions to the same rule.* **(a)** `--measure-list` is a CAP,
> not a fit: a surface whose labels sit far short of the cap (the /tools category index —
> longest label ~95px against a 384px track) still had the FULL cap reserved regardless,
> putting ~289px of dead air between a label and its own count — the exact metadata-drift
> R7 exists to forbid, just produced by a track too generous instead of one too narrow.
> `.browse`'s first track is now `fit-content(var(--measure-list))`: it sizes to the
> WIDEST label actually on that surface (still one shared track via `.browse-row`'s
> subgrid, so R13's own requirement is undisturbed), never exceeding the cap. `/data`'s
> longest label sits close to the cap already, so the cap still binds there, unloosened —
> confirmed by S1, unchanged. **(b)** `.rail-title` (the record-title link on /blog's
> index) is "a row-based list surface... and its kin" by the rule's own text, but the
> object had never been bound to `--measure-list` at all — 1019px, past any of the three
> other index templates' own measures on the same kind of link (`iter-05` I30). Bound via
> `.rail-posts .rail-item`'s own trailing track. Both enforced by `tools/ui-invariants.mjs`
> id `S16` (a) and `S15` (b).

> *iter-07 addendum — THE CAP AND THE WRAP ARE TWO DIFFERENT FAILURES, and the check had
> conflated them.* iter-06 made S1/S15/S16 two-sided by adding a wrap-detection clause (a
> `Range` over the label/title text returning more than one client rect) beside the
> existing gap/track-width clause — necessary, because a too-narrow column and a too-wide
> one are different excesses of the SAME property and the gap-only formula was blind to
> the first (RULES.md's own iter-06 record). But the wrap clause as shipped treated ANY
> wrap as "the column collapsed," with no floor for the case this rule was never built to
> prevent: a cap correctly sized for the surface's typical content, holding one genuinely
> longer entry across more than one line. Two real, pre-existing cases, both invisible
> until the two-sided check could see them and both confirmed by direct inspection at
> 1440x900 and 390x844, both themes: `/data`'s CSV list ("Impossible → Routine — dated
> pairs with both sources," 2 lines) and every one of `/blog`'s four post titles (3 lines
> each — measured uniformly across all four, not one outlier). Both wrap at a track pinned
> EXACTLY to `--measure-list` (measured live: `/data`'s `.browse` `fit-content(384px)`
> column resolves to 384.0px on the row that wraps; `/blog`'s `.rail-item`
> `minmax(0, 384px)` column resolves to 384.0px on every sampled row) — the cap is doing
> exactly its job, stopping the track at 24rem rather than stretching past it, and the
> content is simply longer than one line holds at that width.
>
> **Widening the cap to fit these two entries — the change that would make the check pass
> without touching its logic — was rejected.** `--measure-list` is shared by every row on
> the surface (`.browse`'s own `fit-content`, per the iter-05 addendum above); raising it
> would re-cap every OTHER, typically-short label at the wider value too, reopening the
> exact dead-air drift this rule exists to forbid (I32's own finding, restated: the cap
> must serve the surface's typical content, not its longest outlier). Content is read-only
> to this loop in any case, so neither side of that trade was implementable by shortening
> the strings.
>
> **The rule, stated precisely, is now two clauses on the same property rather than one.**
> The label/title track shall stop at `--measure-list` — unchanged, still the "too wide"
> bound, still the container-far-edge defect this rule opened with. Where a surface's own
> content exceeds that cap, the track shall hold it WRAPPED rather than stretched, bounded
> to 3 lines — the largest line count either bounded surface's real content presently
> needs (`/blog`'s 3, unanimous across all four posts; `/data`'s 2). A track pinned AT the
> cap that wraps past 3 lines, or a track measurably BELOW the cap that wraps at all
> (collapsed, not merely tensioned), both still fail exactly as before. The distinguishing
> signal is the track's own browser-resolved pixel width against the cap, not the line
> count alone: a line bound with no width floor would let a genuinely collapsed column
> (S1's own historical 40px break, 9 lines) pass a lenient cap just as easily as it would
> pass a strict one. Falsified in both directions per surface: at-cap-but-over-the-bound
> (S1: `.browse-name{font-size:40px}`, 4 lines; S15: `.rail-title a{font-size:28px}`, 5
> lines) and genuinely-collapsed (S1: track forced to 100px and to 40px, 4 and 9 lines;
> S15: track forced to 40px, 16 lines) — all four routed to the message their own branch
> predicts, none crossing into the other's.
>
> **A second, narrower fix rides with this one.** `.browse`'s and `.rail-item`'s shared
> narrow breakpoint (26rem / 416px, S9's own boundary) drops the desktop cap entirely —
> below it the label/title column is a flexible fraction of the viewport, and wrapping
> there is ordinary reflow, not collapse. S15 and S16 already gated their checks on this
> breakpoint; S1 did not, and `/data`'s "Facts — resolved values with their state and
> source" also wraps at 390px under the pre-fix check — a second, independent failure the
> old single-viewport-order harness never reported, because it stops at the first failing
> VIEWPORT (1440) and never reached 390 to say so. S1 now carries the same gate. S15 is
> separately widened from sampling only the FIRST `.rail-posts .rail-item` to every row,
> matching S1's own "checked across every row" precedent from iter-06 — necessary now that
> a wrap is not automatically a failure, so a genuinely too-long title elsewhere in the
> list can no longer hide behind an earlier, shorter sample. Enforced by
> `tools/ui-invariants.mjs` ids `S1` and `S15`, both rewritten this round.

> *iter-08 addendum (I38) — a bound derived from the artifact's own content shall print
> its margin, not only its verdict.* The 3-line allowance above is fitted to what `/data`
> and `/blog` presently need (2 and 3 lines respectively) — sound, but with no declared
> headroom, a PASS gave no signal of how close either surface sat to the cliff. `/blog`'s
> own four titles all land on EXACTLY 3 of 3 lines: one title one character longer than
> today's longest (117 characters) turns S15 red with no permitted lever left to pull
> (widening `--measure-list` re-caps `/data`'s own typically-short label too, reopening
> I32's dead-air drift; shortening the title is a content edit, out of this loop's
> charter). `S1` and `S15` now print, on every PASS, the worst-case line count against the
> 3-line bound and the remaining margin — `/data`: 2 of 3 (1 line of headroom); `/blog`: 3
> of 3 (NO HEADROOM) — so a future reader sees the cliff before a build finds it for them.
> This does NOT loosen either bound: a loosened bound is a bound relaxed in advance of the
> case that would test it, which iter-06 already retired once (R13's own iter-06
> addendum). Where the bound is later exceeded, the fix is a template-specific token (the
> cap has outgrown a token shared with surfaces that do not need the wider value), not a
> raised `MAX_WRAP_LINES`. See RULES.md R13's own iter-08 addendum for the same treatment
> applied to S18's occupancy floor.

> *iter-09 addendum (I43) — the cliff named above was reached, and the remedy this rule's
> own text already prescribed for it ("the fix is a template-specific token") is now
> applied.* `/blog`'s four post titles were not approaching the 3-line/384px cap, they had
> BEEN at it since iter-08 with zero headroom — the trigger, on reflection, should have been
> the surface's TYPICAL content sitting at the bound (3 of 3 lines on 4 of 4 rows), not only
> a bound actually exceeded. The underlying defect: `--measure-list` (24rem) was sized for a
> row LABEL (a name, a term, a category) and reused, unexamined, for `.rail-posts`' own
> second track — but a post title is a HEADLINE, a full sentence, a different object class
> from the thing the token was built for. Measured on the shipped iter-08 build: the list's
> total width sat at 500px inside a 1152px shell (796px of empty page beside it), while the
> descriptive paragraph directly above the list — secondary prose — was bounded to
> `--measure` (38rem / 608px), 224px WIDER than the titles below it: a hierarchy inversion,
> the page's primary objects narrower than its own secondary explanatory text. A new token,
> **`--measure-title` (38rem, equal to `--measure`)**, now bounds `.rail-posts .rail-item`'s
> title track specifically; `--measure-list` is untouched (still 24rem, still binding
> unloosened on `/wiki`, `/data` and `/tools`, so I32's dead-air drift cannot reopen there).
> Headlines and the lede above them now share one right edge, and the page reads as one
> column rather than a column of prose and a narrower column of broken titles.
>   The wrap bound falls from 3 lines to 2 as a direct consequence (a wider track needs less
> wrapping for the same content) — **measured live, not assumed**: all four titles now land
> on exactly 2 of 2 lines, zero headroom, the identical cliff shape as before at a different
> line count. This is recorded plainly rather than oversold as "real headroom" — the same
> discipline the iter-08 addendum above already states applies here without exception.
> `S15` is enforced against `--measure-title`, `MAX_WRAP_LINES` is now 2, and `S5`'s own
> `/blog` clause (R10) was re-verified rather than assumed to still hold: `.rail-posts` is
> `width: fit-content` (R10's iter-08 addendum), so its border-top's span tracks the wider
> title column automatically — confirmed live (724.0px, matching `rail-col` + gap +
> `--measure-title`'s resolved 608px), not re-derived from either token's literal value.

**R8 — Row rules are surface-conditioned; default-state badges are not.** Whether a list
surface's sibling rows carry a rule between every pair is decided by what the surface
demands of its reader, not by one global policy. **The test:** does the reader have to
track a value ACROSS a row or ACROSS an entry — a row wide enough, or with enough
columns, that a value can drift from the row it belongs to; or entries whose rendered
height is ragged (an optional line, a wrapped one) so that where one entry ends and the
next begins is otherwise ambiguous? If yes, the rule is **required** — row rhythm and the
group container's own boundary mark, drawn once, are not enough to hold the reader's place
that far down the surface. If no — an index of near-uniform single-line rows where nearly
every row is itself a link, so the link already carries the row's signal — the rule is
**forbidden**: drawn on every row including the unexceptional ones, it is chrome the
surface does not need and dilutes what a rule elsewhere is doing real work to say. A
status badge shall render as a bordered chip only when its tone differs from the
collection's default state — unconditionally; this half of R8 was never in question and
is unchanged. From iter-01 S2 (`iter-00-a` I3 / `iter-00-b` I2, filed independently by
both judges); the row-rule half amended iter-03. Applied by the test above: `/catalog`'s
table rows (396 rows x 7 columns) and the home changed-feed entries (ragged heights from
an optional annotation line and a wrapped `source` line) carry the rule; `.browse-row` on
`/wiki`, `/data` and `/tools` — link indexes of near-uniform single-line rows — does not.
Enforced by `tools/ui-invariants.mjs` id `S2`.

> *Post-mortem, preserved.* R8 originally read as an unconditional ban: "A list surface's
> sibling rows shall not carry a rule between every pair." A mirror-validated blind
> forced-choice comparison (`state.md`, "DIAGNOSTIC — FINAL RESULT (three runs)" — 5/5
> mirror-consistent with sides alternating, both control arms clean) found that ban wrong
> on two of the five surfaces it governed: `/catalog` and the home changed feed both read
> WORSE without the rule, while `/wiki`, `/data` and `/tools` read better without it, for
> exactly the reason the original rule gave. **The defect was never the removal itself; it
> was stating the removal as a single policy for every surface.** The judge rubric
> category this rule traces to (`chrome_restraint`) is one GLOBAL category scoring a
> property whose correct value is surface-dependent, so a change that helped three
> surfaces and hurt two still landed as net progress in the aggregate score — `5.0 ->
> 7.5` — because the scale itself cannot express a distinction that varies by surface. Three
> independent assessors read the same wrong scale and none caught it; only a forced choice
> between the two states, per surface, surfaced the split. iter-03 rewrote R8 to the test
> above and restored the rule on the two surfaces the comparison found it missing from. Any
> surface added to either list in future shall be justified against the test, not by
> analogy to whichever list it superficially resembles — "it's a list of records" is not
> the test; "does a value drift from its row, or does an entry's end become ambiguous" is.

> *iter-07 addendum — the default-state clause generalises past badges, to any conditional
> VISUAL WEIGHT on a repeated value, not only a border.* I8: `/catalog`'s Read column
> rendered the identical fetch date (and identical source link) on 396 of 396 rows at LINK
> weight — ink-plus-underline, the same treatment R9 gives the Model column a reader
> actually crosses the row to compare. A non-discriminating value competing for attention
> at a discriminating column's own weight is the badge clause's forbidden shape (chrome
> drawn on every row, including the unexceptional ones, leaving the exception nothing to
> say) with the visual signal swapped from a border to a link. The fix mirrors the badge
> clause exactly rather than inventing a parallel one: the value itself is unconditional
> (every row still shows its own fetch date — `specs/directory`'s own per-row requirement,
> `lib/catalog.mjs`'s `catalogRow` doc comment, is untouched, since the DATA layer was not
> changed, only the render layer's treatment of it), and only the link/underline is
> conditional, on whether a row's date differs from the table's own dominant one (the same
> value `renderFetchLine` already states once, in the page's preamble, above the table).
> **The clause now reads generally: a repeated, non-discriminating value shall not carry
> the SAME visual weight as a column a reader compares across — bordered or linked or
> otherwise emphasised — unless its own value differs from the collection's stated
> default.** Enforced by `tools/ui-invariants.mjs` id `S17`, in `lib/render/catalog.mjs`.

> *iter-08 addendum (I36) — the clause's own text ("bordered or linked or otherwise
> emphasised") was broader than what `S17` actually tested, on BOTH surfaces it should
> govern.* (a) `/catalog`'s Read column: I8's fix (above) made the LINK conditional but
> left the unlinked, unexceptional value at full ink — byte-identical to the numeric
> columns a reader compares across — because removing a link is not the same as lowering
> weight, and `S17` only ever checked for the `<a>`. Demoted to `--muted`, the same
> treatment the STATUS column's own default-tone badge already uses. (b) `/tools`'
> `.listing-verified`: I11 (iter-07, R13) gave the verification date its own aligned
> column, which made a pre-existing repetition (every listing in a category sharing one
> date) far more legible — a page-long band of one repeated string — without changing its
> weight at all; it stayed at `.listing-line`'s own inherited `--muted`, identical to
> `.listing-pricing`, the field a reader actually arrives to compare. `.listing-pricing`
> is now explicit ink (the compared field earns the weight the numeric columns already
> have on `/catalog`); `.listing-verified` carries a `data-default` attribute, computed
> per category in `lib/render/tools.mjs` (mirroring `catalogRowHtml`'s `isDefaultFetch`),
> and only a listing whose own date differs from its category's dominant one rises to ink.
> **The clause's own text is now what `S17` tests: computed COLOUR, not merely the
> presence of a link — on both surfaces.** Enforced by `tools/ui-invariants.mjs` id `S17`,
> in `lib/render/catalog.mjs` and `lib/render/tools.mjs`.

> *iter-09 addendum (I42) — the clause's own THIRD surface, worse than either of the first
> two.* `S17` had by iter-08 covered two of the three surfaces R8's iter-07 addendum
> actually governs; the home changed feed was the third, and its own violation was not
> merely equal to the case the clause forbids, it exceeded it — `a.src` (the per-row
> provenance link, text always "source", 24 of 24 changed-feed rows) rendered at the bare
> `a { color: var(--accent) }` default, no rule of its own having ever been written for it,
> while `a.change-name` on the same row — the record link, the value a reader is actually
> scanning the feed for — rendered at `--ink`. The repeated, non-discriminating value was
> not just AT the compared column's weight, it was LOUDER: R9's own accent-reservation
> clause is engaged at the same time as R8's badge clause, on the same element, since a
> resting link carrying `--accent` is R9's forbidden shape regardless of R8's. `.src`
> (globals.css) now carries its own resting treatment — `--muted`, underlined, `--accent`
> only on hover/focus — the same rest/hover pair every other record link on this site
> already uses, at a weight BELOW `a.change-name`'s ink rather than merely equal to it. The
> higher-specificity `.data-table a` rule (R9, /catalog's own exceptional-row treatment)
> is unaffected, so a catalog row whose fetch date genuinely differs from the collection
> default still rises to ink, unchanged. Enforced by `tools/ui-invariants.mjs` id `S17`,
> route list extended to `/`, comparison reference the record link on the same row (there
> is no numeric column on a changed-feed entry, unlike the other two surfaces).

**R9 — One record-link treatment.** A link to a record (a row-title link on an index
template) shall use one identical resting treatment — ink colour with an underline —
across every index template; `--accent` marks hover and focus, not the resting state of a
list or table row. This is the achievable half of iter-01 S3's grid-and-link invariant
(`iter-00-b` I3) plus S4 (`iter-00-a` I4) and S6 (`iter-00-b` I6) — three items converging
on one fix. Enforced by `tools/ui-invariants.mjs` id `S6`.

> *iter-08 addendum (I31) — the same reservation, applied to borders and rules, not only
> link colour.* `.door[data-feature="yes"]` (the home page's door grid) and
> `.deltas-strip .delta:first-child` (the Impossible -> Routine strip, also home) each
> carried a full-strength `--accent` border-top at REST while their structurally identical
> siblings carried the neutral `--rule`/`--rule-strong` token — the same excess R9 already
> forbids on link colour, on a different visual channel. Neither instance encoded a state
> the page named anywhere else ("nothing else on the page says what 'featured' means or
> why the first pair is marked and the second is not" — the verdict's own finding, held
> unresolved since before this loop had an anchor). Both overrides removed; every sibling
> in each list now reads as one family at rest, matching R9's own general principle
> restated here: **--accent is reserved for hover and focus; a resting border, rule or
> divider shall never carry it, and a sibling in a repeated list carries a border colour
> different from its own siblings only where that difference encodes a state the page
> names elsewhere.** Enforced by `tools/ui-invariants.mjs` id `S20` (a new entry rather
> than an extension of `S6`, since `S6`'s own check machinery — the `SELECTOR`/`captured`
> closure comparing ONE link per route across FIVE routes — has no natural place for a
> per-page, per-sibling-list border comparison; the two checks enforce the same PRINCIPLE
> through different mechanisms rather than sharing one).

> *iter-09 addendum (I41) — the SAME scope defect this iteration's own queue names: a check
> registered to close I31 inherited I31's scope (two named selectors, one page) rather than
> the rule's own text, which is absolute and page-wide.* Reproduced in the very round that
> wrote the rule. Falsified by inspection rather than assumption: `--only S20 --break
> ".door{border-top-color:var(--accent)}"` fired; `--break ".change-annotation{border-left-
> color:var(--accent)}"` and `--break ".span-rule{background:var(--accent);opacity:1}"`
> both left `S20` green. Three live violations found this way, all outside `S20`'s old
> two-selector reach: **(a)** `.change-annotation`'s `border-left`, home page, 2px, opacity
> 1, on the changed feed's own most prominent entry — an editorial annotation whose
> presence a paragraph of prose already makes unmissable, needing no colour to say so
> again. **(b)** `.span-rule`'s `background`, opacity 0.45 — 4 instances on home, 54 on
> `/impossible-routine`, 58 resting accent hairlines flanking duration labels across two
> templates, both themes. **(c)** `.badge[data-tone="theme"]` on wiki entries — 1px accent
> border, an accent-tinted background, accent text — sitting on the same identity line as
> the entry's status and maintenance badges, which read as plain muted text whenever their
> own tone is the collection default. The verdict item that named this instance cited the
> attribute as `data-kind`; verified against `lib/render/common.mjs`'s `badge()` helper
> before implementation, which writes `data-tone` — the field name propagated no further.
>   **Disposition.** (a) takes `--rule-strong`. (b) takes `--rule` at opacity 1. (c) is
> folded into the SAME unboxed treatment `.badge:not([data-tone])` already uses (a topic
> tag is a category, not an exceptional state the way `ended`/`early` are, and every entry
> with themes carries one — boxing it at rest was marking the norm as the exception). Two
> further, adjacent instances were found by the same sweep and fixed though never evidenced
> by any route today (`grep`-confirmed zero live occurrences in `out/`): `.badge[data-tone=
> "early"]` and `.notice[data-tone="warn"]` both spent `--accent` on a REST state — `early`
> is a genuine exception (preview/announced) and keeps its box, now on the base `.badge`
> styling rather than a hue this palette has no third colour for; `warn` is `notice()`'s own
> DEFAULT tone, so colouring it at rest was marking the norm as the exception on a second
> element, the identical shape R8's badge clause already forbids — both left dormant rather
> than left as landmines.
>   `S20` is now two clauses: clause A (route `/`, unchanged, the door/delta sibling-
> uniformity test) and clause B — a live sweep of every sampled route's `<main>`, every
> element, every resting border side plus background plus outline, failing on any exact
> match to `--accent`'s own resolved value for the active theme. A resting-state sweep
> naturally excludes every `:hover`/`:focus-visible` rule without an enumerated allowlist,
> since neither pseudo-class is engaged by an unfocused, untouched page load. Sampled
> routes: `/`, `/impossible-routine`, a wiki entry, `/catalog`, `/tools`, `/data`, `/blog` —
> a representative set, not yet all fourteen; see the iter-09 implementer report for what
> remains unsampled. Enforced by `tools/ui-invariants.mjs` id `S20`.

**R10 — Rule width matches content width.** A horizontal rule dividing a content block
shall span that block's own rendered width, not an unrelated wider container. From
iter-01 S5 (`iter-00-a` I2). Enforced by `tools/ui-invariants.mjs` id `S5`. This rule
covers block-width matching only; column-start alignment between a label/value grid (the
facts block, the date rail) and unlabelled prose is not required by it — see the iter-01
implementer report for why that half of S5's invariant was not attempted.

> *iter-08 addendum (I35) — the one index template `S5` never sampled.* `.rail-posts`
> (`/blog`'s post index) carried this exact defect since before this loop had an anchor —
> its own border-top (via the generic `.rail` rule) spanned the full 1152px shell while
> the widest rendered row inside it spanned 500px, a 652px overhang, invisible because no
> `S5` clause ever looked at `/blog`. `.rail-posts` now takes `width: fit-content`, the
> same mechanism `.browse` already uses (R7's iter-05 addendum) — each `.rail-item`'s
> second track is a fixed-length `minmax(0, --measure-list)`, so every row resolves to the
> identical 500px regardless of its own title's length, and `fit-content` on the list
> resolves to that same figure. `/tutorials` and `/learn` were checked for the same shape
> and do not have it: `/tutorials`' `.listings` uses a genuinely flexible `minmax(0, 1fr)`
> first track sized to prose (R7's iter-07(b) addendum), so its per-row rule is SUPPOSED
> to span the full row; `/learn`'s `.rung` already carries `width: fit-content` of its own
> (R13's iter-04 record). **Falsifying this clause found a real instrument bug, worth
> recording because the shape recurs:** the first attempt measured `.rail-item`'s own
> `getBoundingClientRect()` and did not fire under `--break ".rail-posts{width:100%
> !important}"` — a grid item is a block-level box that fills whatever width its parent
> happens to be, so reverting `.rail-posts` to 100% pulled every row's OUTER BOX back to
> 1152px right alongside it, 0 diff, even though the actual defect (a 500px grid sharing a
> 1152px box) was fully reproduced. This is `S1`'s own historical mistake (this rule's own
> R7 post-mortem, "a grid item... stretches to fill its track by default... a box-to-box
> gap is vacuous"), reproduced on a new surface by an implementer who had just read that
> post-mortem — read it, and still wrote the same shape of vacuous check on the first
> pass. Rewritten to read each row's own resolved `grid-template-columns` (summed with its
> gap), independent of the parent's width. Enforced by `tools/ui-invariants.mjs` id `S5`,
> route list extended to `/blog`.

> *iter-09 addendum (I40) — the SAME defect the iter-08 addendum above closed, reopened by
> this round's own I23 remedy, on the ONE index template `S5` STILL had not sampled.*
> `.catalog-preamble[open] > summary`'s `border-bottom` — added this round to give the
> collapsible preamble disclosure a visible closing edge — spanned the full 1152px shell
> while the widest rendered line inside the disclosure it introduces reached 670.3px (this
> implementer's own Range-based measurement; the verdict's own coarser box-based reading
> was 882.9px — both agree on a several-hundred-pixel overhang, immediately under the H1,
> in the page's opening read). Dropped rather than resized: this control exists to solve a
> 390px problem (R6/R14, I23), and the rule was only ever painted at 1440px, where there was
> none. `.nav-disclosure` and `/tools`' `.listings-az` — the site's other two disclosures —
> already carry no such rule; the summary's own mono/muted register and its margin below
> already carry the separation, matching both.
>   **Falsifying this clause found the identical instrument mistake the iter-08 addendum
> above already named, TWICE, on the way to a working check** — worth recording because the
> shape keeps recurring on new surfaces regardless of the post-mortem being read first.
> Attempt 1 measured each of the preamble's DIRECT children's own `getBoundingClientRect()`:
> two of its four content lines (the fetch-line and sort-note paragraphs) are rendered into
> a wrapping `<div dangerouslySetInnerHTML>` (`app/catalog/page.tsx`), so the box measured
> was the DIV's own — a plain, unconstrained block that stretches to the full shell
> regardless of how short its actual text is. A break reinstating the full-width rule
> measured "0 of 1 fired". Attempt 2 applied a `Range` to those same direct children — S1's
> own established fix for a box-vs-text mismatch — and was STILL vacuous: a `Range` over an
> element whose only content is itself a BLOCK box (no text/inline nodes directly inside the
> DIV) returns that block's own layout rect, not a text line rect. The fix has to reach the
> actual text-bearing element, not merely stop measuring its outer box. Attempt 3 selects
> the four text-bearing `<p>` elements directly (`.page-lede, .fetch-line, .sort-note`,
> present regardless of which ancestor wraps them) and Ranges those. Enforced by
> `tools/ui-invariants.mjs` id `S5`, route list extended to `/catalog`.

**R11 — Sticky stacking, two-sided.** A secondary sticky element (a table's column
headers) shall stay inside its corridor: neither occluded by a primary sticky element
above it, nor displaced downward onto the content it labels; where no such corridor can
be built without losing table layout entirely (a narrow viewport, R12), the header shall
be removed outright and its absence asserted as deliberate, not left as a decorative
sticky declaration that does nothing. From iter-01 S7 (`iter-00-b` I7); disposition
amended iter-02 (I15). Enforced by `tools/ui-invariants.mjs` id `S7`.

> *Post-mortem, preserved.* R11's first form bounded ONE side — "remain fully visible
> beneath the site header" — and its assertion tested only `thTop >= headerBottom`. The
> shipped remedy pushed the table head DOWN onto its own first data rows at scroll 0, on
> the site's 396-row flagship table, in both themes at both viewports. That makes `thTop`
> larger, so the assertion passed, the build passed, axe passed, and a severe visible
> defect shipped with every gate green. Two lessons, both binding on any future rule:
> **(a)** an invariant of the form "A must not collide with B" shall bound the corridor,
> not the single edge; **(b)** S7's originating premise — that `.site-header` and the
> thead share one scroll context — was FALSE. `.table-wrap` declares `overflow-x: auto`,
> and per CSS the visible cross-axis coerces to `auto`, so `.table-wrap` is itself the
> thead's sticky containing block and the collision the offset defended against could not
> occur. **A remedy inherits its premise's falsity. Verify the premise, not only the
> prescription.** See JUDGE.md L4.

> *iter-02 addendum.* The "premise was false" finding above was itself only half the
> story: `.table-wrap` coerces to `overflow-y: auto` per CSS, but with unconstrained
> height it never actually scrolled — `clientHeight === scrollHeight` — so `position:
> sticky` on the thead had a scrolling ancestor that never moved, and was inert under
> EVERY variant tried, including the original pre-S7 `top: 0`. The working remedy caps
> `.table-wrap`'s height (`max-height: calc(100vh - var(--header-h)); overflow-y: auto`)
> so it becomes a genuine scrollport, with `top: 0` on the thead now correct because it
> sticks to that box's own top rather than the page. At 390px the table instead drops out
> of table layout entirely (R12), and the corridor this rule describes has no header left
> to bound — R11 is satisfied there by the header's deliberate absence, asserted
> explicitly rather than passing by accident on a missing element.

> *iter-02 round-2 addendum — the fix above was still incomplete, and the check that
> certified it was the reason.* Capping `.table-wrap` gave the thead a scrollport to stick
> WITHIN, but that scrollport is an ordinary block in page flow: as the PAGE scrolls, the
> container scrolls away carrying its internally-pinned head with it. Measured at
> 1440x900 against a 547px page: thead top 16.3px at page scroll 400 (occluded by the site
> header, bottom 45.8px) and -130.7px at maximum scroll (off-screen). **The original I7
> defect, impossible before, made genuinely reachable by its own remedy.**
>
> `.table-wrap { position: sticky; top: var(--header-h) }` was tried and MEASURED, not
> assumed, and it fails: sticky travel is bounded by the containing block, which reduces
> here to `contentBeforeWrap - headerOffset` = 370.5 - 45.8 ≈ 372px against a 547px page.
> The element detaches at 372px and scrolls away, landing at the same -130.7px. Adding
> trailing padding inside `<main>` does not help — the padding term cancels out of the
> governing inequality.
>
> **The governing inequality, which is the durable result:**
> `viewport >= headerOffset + wrapHeight + footerHeight`. At 900 / 46 / 854 / 81 that
> reads `900 >= 981` — false. The box's own sizing accounted for what sits ABOVE it and
> never for what must fit BELOW it. The fix supplies the missing term via a measured
> `--footer-h`, mirroring `--header-h`: `max-height: calc(100vh - var(--header-h) -
> var(--footer-h))`. Verified by the orchestrator at page scroll 0, 178 and 355 (the new
> maximum): labels on-screen and unoccluded throughout, `thTop 61.3px` vs `headerBottom
> 45.8px` at the worst case.
>
> **Why the gate missed it, recorded because the shape recurs:** S7's clause 2 scrolled
> "whichever scrollport actually moves the table" — a procedure CONDITIONAL on the
> artifact's structure. While the container did not scroll it exercised page scroll; once
> the remedy gave the container a scrollport it switched branches and silently stopped
> exercising page scroll, permanently. **A remedy flips exactly the condition a defensive
> check branches on, because the branch and the fix concern the same structural property.**
> Clause 2b now pins both dimensions explicitly. See state.md D8.

**R12 — Table reflow at narrow viewports.** Below the 33.999rem breakpoint, a data table
whose desktop form does not fit shall present, without horizontal scrolling, its record
identity AND its highest-priority fields per row — for `/catalog`: the model name, input
price, output price and lifecycle status. A table satisfying this by dropping table
layout for a stacked record-per-row form shall not reintroduce a displaced or occluding
header (R11); if it removes the header outright, that removal shall be asserted as
deliberate rather than left to pass by the header's mere absence. From iter-02 I1
(unresolved since iteration 0). Enforced by `tools/ui-invariants.mjs` id `S8`.

**R13 — Track discipline.** A page template shall place its primary content column
against one of at most two declared grid tracks (a text/list measure, or the wide shell
reserved for a table or a two-column grid). Where that column's own content is narrower
than the track and widening it would itself violate another rule, the column shall shrink
to its own content width (`fit-content`) rather than stretch to fill the track, and shall
stay flush against the SAME left edge every other block on that template uses — the
page's one shared rail — so the width the column does not need pools on the trailing side
rather than being centred to split it. (Centring was tried at iter-05 and RETIRED at
iter-06 — see the addendum below; it is no longer a permitted remedy.) A row-based list
surface's trailing columns (the columns after the primary label) shall share ONE set of
grid tracks across every row of that surface, not size independently per row. From
iter-04 I16 and I17, worked together per the orchestrator's
own framing: I16 is the dead space left when a row's label column was capped without
capping the row itself; I17 is the trailing columns going ragged because each row was its
own independent grid; a shared track set (CSS Grid subgrid on the row, `width:
fit-content` on the list) addresses both at once. Applied at iter-04 to `.browse` (the
row-based list used by `/wiki`, `/data` and the `/tools` category index) and to
`/learn`'s `.rung` ladder at its own `min-width: 48rem` breakpoint. Column-start alignment
ACROSS different templates remains out of scope per DC1 — this rule governs one surface's
own trailing columns and one surface's own dead space, not cross-template alignment.
Enforced by `tools/ui-invariants.mjs` id `S9`.

> *iter-05 addendum — the "occupy most of it" half was only ever HALF-satisfied, and this
> closes it.* iter-04 landed I17's subgrid half (the trailing-columns clause above) but
> not I16's own width half: `width: fit-content` on `.browse` stopped the list from
> bleeding to the shell's far edge, but nothing then put anything back INTO the freed
> space — `.browse` measured 48.6% of the shell's content width on `/wiki`, all of the
> remaining 51.4% pooled on the right, and the check registered for I16/I17 together
> (`S9`) only ever sampled `/wiki`, so it could not see that `/data`, `/colophon` and the
> wiki entry template had the identical shape. **The widening this rule's own text
> prescribes is not always available**: on `/wiki` and `/data`, dragging `.browse-kind`/
> the status badge out toward the shell's far edge is exactly what R7 forbids ("metadata
> sits immediately after its label rather than at the container's far edge") — the two
> rules would contradict on the same surface. So the remedy actually applied is this
> rule's OTHER permitted state, now written into its text above: centring, so the
> unoccupied width is split rather than pooled. Applied to `main.shell > .browse` (`/wiki`)
> and to `.section:has(> .browse), .section:has(> .footer-links)` (`/data`'s four
> sections), and — for the measure-track prose templates R10 already bounds to
> `--measure` (`.entry-head`, `.prose`, `.entry-timeline`, `.rails`, `.listing-facts`) —
> to `/colophon` and `/blog/[slug]` specifically. `S9`'s occupancy clause is now a
> disjunction (`occupancy >= 55% OR centred`, both measured, neither assumed) and a new
> `S13` extends the same two-state test to `/data` and `/colophon`.
>
> **The wiki entry template (I5) took a third state, not centring**: its FACTS block —
> the dated, sourced record this page exists for — rendered after the entire prose body,
> so a reader had to scroll past an essay to reach the one value they came for (measured:
> FACTS began at y>2100 of a 2974px page). The freed track beside prose (I16's own dead
> space on this exact template) is where FACTS now goes instead of staying empty: a real
> two-column grid at the site's own existing `min-width: 60rem` breakpoint (`.home-grid`'s
> threshold), with FACTS moved ahead of prose in paint order only (`order`) below it so a
> narrow viewport gets the same answer-first sequence without a second column to put it
> in. DOM order is unchanged in both cases — this is presentation only, same as the rest
> of this rule. The intent-preservation assertion IMPLEMENT.md requires for a restructure
> is `S14`: FACTS's top edge falls within the first viewport at both 1440x900 and 390x844.
> `S13` additionally confirms the freed track is actually FILLED on this template, not
> merely balanced.

> *iter-06 addendum (I33) — CENTRING RETIRED: it relocated I16's defect instead of
> closing it, and the rule's own text above is now amended to reflect that.* Centring each
> block independently to ITS OWN fit-content width, per iter-05, means blocks with
> different natural widths land at different left edges once centred. Measured on the
> shipped iter-05 tree: `/data`'s four sibling section headings sat at 617.4 / 420.8 /
> 471.2 / 580.5px — 196.6px of raggedness — while the H1 above them stayed at 144px;
> `/wiki`'s index sat at 440.1px while its own title, lede and closing note stayed at
> 144px; `/colophon`'s title stayed at 144px over a body centred to 416px. **The remedy
> traded a defect the rubric could name (dead space pooling on one side) for one it
> apparently could not (a shared rail breaking across a template's own siblings) — and the
> second reads worse.**
>
> **The controlled comparison that grounds the amendment.** `/learn`'s `.rung` ladder was
> never touched by the centring remedy — S9's own `/learn` clause (above) has never
> checked occupancy or centring, only that `.rung` shrinks to its content — and it sits
> flush left at ~75% occupancy, reading fine. The judge separately observed `/tools`'
> category index (nested inside `<nav>/<details>`, never in scope for `main.shell >
> .browse`, hence never centred) failing R13's occupancy clause at well under 55% while
> still reading fine. **Two surfaces the centring remedy never reached both fail R13's own
> occupancy-or-centred test and both read correctly** — direct evidence that occupancy
> percentage was never the load-bearing property. What made `/data` and `/wiki` read badly
> after iter-05 was not that space went unoccupied; it was that the occupied part stopped
> sharing a rail with the rest of the page.
>
> **Disposition.** `main.shell > .browse` (`/wiki`), `.section:has(> .browse),
> .section:has(> .footer-links)` (`/data`'s four sections), the /colophon
> `article:has(> .listing-facts):not(:has(> .entry-head))` pair, and `.post-body`'s three
> selectors (`/blog`) all drop `margin-inline: auto` and revert to flush-left — `width:
> fit-content` is kept everywhere it was already load-bearing (it is what stops a
> `border-top`/rule from running past the content it introduces, R10's own concern). `S9`'s
> `/wiki` clause and `S13`'s `/data` and `/colophon` clauses are rewritten from
> occupancy-or-centred to a direct shared-rail assertion: the block's own rendered left
> edge equals `.page-title`'s (the H1's) left edge, read live, not derived from either
> element's CSS. `S9`'s `/learn` clause and `S13`'s wiki-entry-facts-fill clause are
> unrelated to centring and unchanged. The occupancy branch is retired outright rather than
> kept as a fallback — the evidence above shows occupancy alone never distinguished a
> reads-fine surface from a reads-badly one, so keeping it as an alternative would let a
> future surface satisfy the letter of the rule by the same miscalibrated measure this
> addendum just retired.

> *iter-07 addendum (a) — a track held open VERTICALLY, not just horizontally.* I9: the
> home page's two-column `.home-grid` split its content by CSS alone (`align-items: start`,
> no shared row height), so `.home-side`'s own box stopped at its content's height while
> `.rail-changes` (the changed feed) continued for another 654px beside a track holding
> nothing — I33's dead-space defect on the vertical axis instead of the horizontal one this
> rule's text was written against. The remedy is not a CSS reflow: the only pure-CSS
> mechanism that lets later content widen into a shorter sibling's freed space is `float`,
> and floats only wrap content that comes AFTER them in DOM order — which would require
> moving `.home-side` (a secondary "today's shape" widget) before `.home-lead` (the page's
> own H1 and its primary content), contradicting this page's own stated design ("No hero.
> The first thing under the header is the first dated line of the changed feed") for any
> reader not relying on CSS layout to reorder it back. Instead, `.home-side`'s own content
> was grown by relocating the page's existing "Everything here" (doors) section into it —
> unchanged, not duplicated, a JSX position change rather than new copy — bringing it to
> 87.7% of the feed's height. The rule's occupancy language ("the column shall shrink to
> its own content width... rather than stretch to fill the track") is restated here on the
> vertical axis: **neither `.home-grid` sibling shall hold its wide track open beside the
> other for more than 40% of its own height with nothing in it**, checked symmetrically
> (whichever side is shorter must reach 60% of whichever is taller) so the check is not
> vacuous against a rail padded artificially tall. Enforced by `tools/ui-invariants.mjs` id
> `S18`.

> *iter-07 addendum (b) — R13's shared-track-set treatment, extended to a third row-based
> list surface.* I11: `/tools`' `.listing` rows (pricing, verification date, wiki-entry
> link) were still one run-on mono line per entry, joined by middot separators, ragged at a
> different x on every listing within the same category — six sampled `.listing-line`
> right edges with no field starting or ending at the same x on any two entries. The same
> defect this rule already named and fixed on `.browse-row` (subgrid on the entry, the
> track set declared on the category container). One material difference from `.browse`:
> the pricing field here is genuine PROSE (measured up to 148 characters across the 35 live
> listings), not a short token like a status or a count, so it keeps a flexible
> `minmax(0, 1fr)` column rather than `.browse-name`'s own capped `fit-content` track —
> capping prose to a label's own measure would force severe wrapping on every long listing,
> reproducing R7's iter-07 tension at a much worse scale. The verified date and the
> wiki-entry link, both genuinely short fixed-format tokens, DO get `max-content` trailing
> columns, matching R13's own established treatment for `.browse-row`'s kind/status. Below
> `.listings`' own narrow breakpoint (26rem/416px, the same one `.browse`/`.rail-item`
> already use) the fields stack full width instead — found live at 390x844 during review,
> where the wide layout's fixed trailing columns left pricing a sliver of the available
> width, forcing single-word line wrapping worse than the pre-fix run-on line it replaced.
> Enforced by `tools/ui-invariants.mjs` id `S19`, which also asserts the mirror excess: the
> shared trailing columns must not themselves grow so wide that they squeeze pricing below
> a usable minimum — the same cramped-column tension relocated from an undersized viewport
> to an oversized trailing column.

> *iter-08 addendum (I38) — the same headroom-printing requirement as R7's own iter-08
> addendum, applied to the iter-07(a) 60% floor above.* The floor is checked against
> TODAY's changed feed (`data/changes.jsonl`, regenerated daily, no content bound of its
> own): measured live, `.home-side` 1079.3px against `.rail-changes` 1230.8px, 87.7%,
> 568px of headroom before `.rail-changes` crosses 1798.8px (= 1079.3 / 0.6) and `S18`
> goes red — roughly 3.4 more annotated entries in the top 24, reachable by an ordinary
> week rather than a pathological one. `S18` now prints this margin on every PASS. **Do
> not raise the 60% floor in advance of the case that would test it** — the same
> discipline R7's addendum states, for the same reason (iter-06 already retired the
> occupancy clause for exactly this shape of miscalibration). If the floor is later
> crossed, the diagnosis is content growth against a fully-spent structural lever (I9
> already relocated every section `.home-side` has to offer it), not a presentation
> regression — the fix is a different mechanism for `.home-grid`'s split, not more rail
> content and not a lowered floor.

> *iter-09 addendum (I40) — the 60% dead-track floor's own text ("A page template shall...")
> was enforced on ONE template. It is widened here to the site's most numerous surface, and
> the result is left HONESTLY FAILING — recorded as the deliverable, not a defect to paper
> over.* The wiki entry template's two-column grid (R13's own iter-05 addendum) split
> FACTS from prose the same way `.home-grid` splits `.home-side` from `.rail-changes`, but
> no check ever measured whether FACTS held its own track open. Measured on the shipped
> iter-08 build at 1440x900: `/wiki/concept/ai-winter` — `.entry-facts` 451.9px against
> `.prose` 1945.1px, 23.2%; `/wiki/event/attention-is-all-you-need` — 294.4px against
> 1733.1px, 17.0%. Both far under the 60% floor `.home-grid` already meets, and the track
> was not merely under-filled, it was EMPTY: 1493px of blank column on the first entry,
> beside the page's entire prose body — while `.rails` (REFERENCED HERE / APPEARS IN, the
> content that actually belongs in that freed track) sat stacked BELOW the whole two-column
> block, full width, at the page's far edge, in the narrow single-column shape it inherited
> from before the grid existed.
>   **Lever 1, applied: relocate `.rails` and `.entry-timeline` into the same column as
> FACTS** — the identical move I9 already made once on the home page (relocate existing
> content into a shorter sibling's freed track; no new copy, a position change only).
> **The naive version of this move was tried FIRST and measured WRONG, and the failure is
> worth recording because it is a CSS Grid mechanic, not a one-off mistake:** placing
> `.entry-facts`, `.entry-timeline` and `.rails` as three INDEPENDENT `<article>` children,
> each given `grid-column: 2`, does not make them share one box — CSS Grid auto-placement
> puts FACTS into the same implicit ROW as PROSE (both unplaced on the row axis), and that
> row's height is set by its tallest occupant, PROSE, at ~1945px; RAILS, needing its own row
> because FACTS already holds row 2's column-2 cell, lands in row 3 — which cannot BEGIN
> until row 2's full 1945px is spent. Measured on that attempt: FACTS 226.9-678.8px, RAILS
> 2203.9-2360.9px — an UNCHANGED 1493px gap, merely narrowed from 1152px wide to 524px wide
> rather than closed. **A grid row's height is driven by whichever single item is CONFINED
> to it; the fix has to put the freed track's content in as ONE item, not several, so their
> COMBINED height — not the tall sibling's — sets the short column's own extent.** The
> working fix wraps FACTS, TIMELINE and RAILS in one `.entry-side` container
> (`lib/render/entry.mjs`) — the same role `.home-side` already plays on the home page — a
> real box at the >=60rem breakpoint (`display: contents` below it, so the existing mobile
> `order`-based facts-before-prose reflow is untouched: this is presentation only, DOM/
> reading order is unchanged in both states, matching every other restructure this rule
> already covers). Measured after the fix: `ai-winter` — `.entry-side` 640.9px against
> `.prose` 1945.1px, **32.9%**; `attention-is-all-you-need` — 697.4px against 1733.1px,
> **40.2%**. Real, verified progress (roughly 1.4x-2.4x the pre-fix ratio) — **still short
> of the 60% floor on both sampled entries.**
>   **Lever 2, NOT attempted, with cause.** The judge's own item anticipated this shortfall
> and named a second lever: below some facts-to-prose ratio, fall back to the single-column
> order `S14` already validates rather than using the two-column form at all. This was
> examined and declined for this round: the only two mechanisms available without a content
> edit are (a) a hand-tuned text-length heuristic (word/character counts as a proxy for
> rendered height) with no way to validate its threshold against real font metrics across
> 495 entries without a much larger measurement pass, and this loop's own registry already
> refuses a check it cannot falsify both ways with confidence — a wrong heuristic (flipping
> a genuinely-balanced entry to single-column, or failing to flip a genuinely lopsided one)
> is a worse outcome than an honest, documented shortfall; or (b) widening PROSE's own
> column past `--measure` to shrink its rendered height, which optimises the ratio at the
> direct expense of the property `--measure` protects (line-length readability) — exactly
> the "check the prescription optimises the right quantity" trap IMPLEMENT.md names. Neither
> was judged safe to ship this round.
>   **`S18` is widened rather than left at its old scope**, per this round's own governing
> instruction that an accurate red is the deliverable: its route list now includes
> `/wiki/concept/ai-winter`, using the identical symmetric shorter/taller formula and 60%
> floor as the home clause, and it is LEFT FAILING (32.9%) rather than satisfied by a
> loosened floor, a scope narrowed back down, or a fabricated pass. The next lever, if
> pursued, is a validated content-length heuristic or a different `.home-grid`-style
> mechanism for this template specifically — not a raised floor, per this rule's own
> standing discipline (iter-06, iter-08 addenda above) against loosening a bound in advance
> of the case that tests it. Enforced by `tools/ui-invariants.mjs` id `S18`.

> *iter-09 addendum (I41) — R13's shared-track-set clause, cited from its ORIGINAL text
> above ("share ONE set of grid tracks across every row of that surface, not size
> independently per row"), applied at the wrong GRAIN.* `/tools`' twelve categories each
> declared `.listings`' trailing two tracks independently (iter-07(b)'s own remedy for
> `.listing`'s ragged fields) — a shared track set WITHIN a category, correctly, but each
> category's own `max-content` columns sized against only that category's own longest
> wiki-entry label, so the SAME field landed at a different x from one category to the
> next. Measured on the shipped build: `.listing-verified` at seven distinct x positions
> across the twelve categories (1009.4 to 1070.3px, 60.9px of spread) and `.listing-entry`
> correspondingly ragged — a reader scanning the page top to bottom for pricing or a
> verification date re-acquires the column at every category heading, visible as the
> "verified" band stepping left and right down the page. The rule's own text was never
> scoped to "within a category" — that was the CHECK's scope (`S19`), inherited from the
> item that closed it, not the rule's.
>   Fixed the same way this rule already fixes a ragged trailing column ONE level lower
> (`.listing` subgridding onto `.listings`): the real track declaration is hoisted to
> `.tools-index`, the element wrapping every category on the page (`app/tools/page.tsx`,
> given this class), and each category's `.section` and its own `.listings` now subgrid
> onto it in turn rather than declaring independent tracks. `max-content` on the trailing
> two tracks is therefore computed once, from EVERY listing on the page, not one category's
> own — the identical subgrid mechanism this rule already established, moved up one level.
> Verified live: `.listing-verified` and `.listing-entry` now resolve to exactly ONE x each
> across all 35 listings in all twelve categories (0px spread, both). `S19` is widened from
> "the same x within a category" to "the same x across the page", sampling every `.listing`
> directly rather than grouping by category first; its own mirror clause (the shared
> trailing columns must not squeeze `.listing-pricing` below a 200px usable floor, R7's own
> iter-07 tension relocated to a proportion problem) is unchanged in substance, re-targeted
> at `.tools-index` rather than the individual `.listings` since that is where the real
> tracks now live. Enforced by `tools/ui-invariants.mjs` id `S19`.

**R14 — Persistent chrome budget.** The sticky site header shall occupy no more than 10%
of the viewport height at 390x844 on every route. A control collapsed to stay under this
budget shall remain a genuine tab stop that exposes what it collapsed on activation (R4's
"activation, not presence"), and shall default to its collapsed state without requiring
script to have run first only where the uncollapsed default is itself the safe fallback
(R4's own floor: nothing may be removed from the tab order, only deferred behind a
control). From iter-04 I24: the header measured 129.3px / 15.3% of the viewport,
permanently, on every route, because the seven-item primary nav wrapped to its own line
below the wordmark. Enforced by `tools/ui-invariants.mjs` id `S10`.

**R15 — No double-spent trailing whitespace.** Where a route's scrollport height budget
subtracts a measured trailing distance (R11's `--footer-h` pattern), that distance shall
not also be held open a second time as ordinary page whitespace below the content it was
measured from: the gap between the scrollport's own bottom edge and the next landmark
below it shall not exceed one row height of the content inside the scrollport. A
container whose separation from its surroundings is otherwise sufficient (row rules, a
group boundary rule — R8) shall not additionally carry a background that differs from
the page ground, which reads as a card around what is the page's own primary content
rather than as needed separation. From iter-04 I25: `#catalog-table-wrap`'s trailing
padding and `.site-footer`'s margin-top were both counted once as the page's own
whitespace and a second time as headroom subtracted from the table's scrollport,
producing a 96px gap (three table rows) against a measured 32.3px row height, with the
table also reading as a bounded panel rather than the page's own content field. Enforced
by `tools/ui-invariants.mjs` id `S11`.

**R16 — Cross-platform type rhythm.** The body face shall resolve to a consistent
rendered rhythm (average character width, hence line length and vertical rhythm) across
the platforms a reader is likely to be on, either by self-hosting one subset face, or by
metric-adjusting the stack's own fallbacks via `size-adjust`/`ascent-override`/
`descent-override` so that whichever fallback a given platform actually resolves to
renders at a consistent width. From iter-04 I10: the declared stack (Charter, Bitstream
Charter, Sitka Text, Cambria, Georgia, Times New Roman, serif) had no metric-matching at
all — MEASURED on the implementation platform (a browser lacking Charter and Bitstream
Charter): the stack resolved to Sitka Text, ~10% wider per character than Georgia, one
step further down the same stack. Self-hosting was declined with cause (see the iter-04
implementer report for the R3 payload arithmetic and the reasoning); the fallbacks that
were empirically confirmed present (Sitka Text, Cambria, Times New Roman) are
metric-adjusted against Georgia via `size-adjust` on a `local()`-sourced synthetic face.
This is a NARROWING of the defect, not a closure of it — Charter and Bitstream Charter
themselves are unadjusted (no authoritative metrics were available to adjust them
against), and no claim is made about platforms this implementation could not render on.
Enforced by `tools/ui-invariants.mjs` id `S12`, which checks the mechanism (the adjusted
fallbacks measurably match the anchor) rather than the unverifiable cross-platform claim
itself.

## Tombstones

*None yet.*
