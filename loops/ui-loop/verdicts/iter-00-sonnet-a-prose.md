# ui-loop — Judge verdict, iteration 0

**Overall: 7.7 — Competent. Verdict ladder: "Competent."**

This is iteration 0. There is no anchor and no baseline; every score below is scored
from scratch and should be treated as provisional, not as a delta from anything.

## Evidence used

- All 20 `--1440` captures (both themes × all ten labels: home, index-blog, article,
  table-catalog, index-wiki, wiki-entry, index-learn, index-tools, prose, data).
- The `--390` captures for home, table-catalog, index-wiki and article, both themes.
- Targeted crops of the above (via the project's own `sharp` dependency, since no
  ImageMagick/Python was available in-session) to read small type in the catalog table
  and the mobile header — same source PNGs, no new capture.
- `node scripts/verify-design.mjs`, run directly (not through a pipe) and completing
  cleanly: 45 checks, 0 failures. This did **not** hit the L1 sandboxed-`EACCES` failure
  mode described in the Known evidence lies — the run produced real numbers, which I use
  below for accessibility and payload.
- `data/launch.json` for the payload bound (150 KB gzipped).
- `app/globals.css` in full, and `app/layout.tsx` / `lib/render/entry.mjs` for the shell
  and template structure that findings I2 and I3 turn on.

## What this artifact gets right

The design system is not a template. The date-rail as the site's recurring shape, the
strict serif-for-prose/mono-for-record split, and the "impossible → routine" span motif
on the home page are a genuine, legible idea executed consistently — this is real
**visual distinctiveness** (scored 8, capped as a contributor per the rubric, but worth
saying plainly: this site would not be mistaken for a template). The catalog table at
1440 (`table-catalog--light--1440.png`, `table-catalog--dark--1440.png`) is close to the
Stripe benchmark cited in the rubric: tabular-nums, right-aligned numeric columns, a
sticky header, a hairline-only row separator, and filter controls that don't fight the
data for attention. Colour is disciplined exactly as the CSS comment promises — indigo
for "follow this," ember for "this ended," nothing else coloured — and it holds across
both themes without drift (compare `home--light--1440.png` / `home--dark--1440.png`
side by side; identical structure, correctly inverted tokens). `verify-design.mjs`
passed 45/45 checks including the full axe ruleset in both themes on four sampled
routes, reflow at 320px, and a keyboard traversal that explicitly asserts its own
coverage rather than stopping silently (the R5 post-mortem's whole point).

## Category-by-category

### 1. First-read hierarchy — 7.5
Home earns this on its own: the changed-feed rail is legible as the page's purpose
within the first screen, no hero, dated lines doing the work (`home--light--1440.png`,
`home--dark--1440.png`; also satisfies RULES.md R6, confirmed by `verify-design.mjs`'s
"content above the fold" check). Article and wiki-entry lose points because their
hierarchy is correct in isolation but the page reads as narrower than it is — see I2.
**Path to 8.5+:** close I2 so a wide viewport reads as one page's worth of hierarchy
rather than a narrow column adrift in a wide frame.

### 2. Chrome restraint — 7.5
Real restraint throughout: no shadows except the search-results flyout (an overlay,
where elevation is earned), one hairline-rule vocabulary, no cards. The one recurring
violation is the `.badge` box applied to the *default* lifecycle state — see I3.
**Path to 8.5+:** implement I3; reserve the bordered badge for the exception, not the
rule.

### 3. Information density — 7
Home, table-catalog, index-wiki and index-tools are all genuinely dense without
clutter — this is the site's strongest category when it's working
(`index-tools--light--1440.png` packs 35 listings across 12 categories behind a
jump-to index and stays scannable). But density is not **consistent between
templates**, which the rubric asks for explicitly: article, wiki-entry and prose sit at
roughly half the density per screen that home and catalog achieve, purely because of
unused shell width (I2), not because those templates have less to say — wiki-entry has
a facts table and two relation rails that currently run *below* the prose instead of
beside it.
**Path to 8.5+:** I2.

### 4. List and table craft — 5.5
This is the rubric's named primary-surface category, benchmarked against Stripe, and
at 1440 the catalog table meets that bar. At 390 it does not: I1 documents that the
table reduces to a single legible column (model name) with zero affordance that price,
provider, context or status exist off-screen. For a catalogue whose entire stated job is
"every model you can call today," a mobile reader cannot complete that job without
first discovering, unprompted, that the table scrolls sideways. `index-wiki` and
`data` (browse-row lists), by contrast, craft their 390px fallback deliberately — the
narrow breakpoint at `max-width: 26rem` in `globals.css` moves the kind/badge to a
second line instead of just clipping — which makes the catalog's flat clipping look like
an oversight rather than a decision.
**Path to 8.5+:** I1.

### 5. Typographic system — 8.5
Charter (serif) for reading, a system mono for records, one modular scale
(`--step--1` through `--step-4`), consistent line-height and letter-spacing rules for
headings, `font-variant-numeric: tabular-nums` used correctly wherever numbers appear in
a column. This meets the Vercel benchmark's mechanism — a face chosen for the domain
(a text serif for long-form reading, not a geometric sans-default) and a grid whose
rhythm (the `--step` scale, the `--gap`) stays visible from home through wiki-entry
through the catalog. At the ceiling for a system with no custom/self-hosted face
(a constraint the CSS comment explains is a build-time bound, not an oversight).

### 6. Colour discipline — 8.5
Two accents, both semantic, both re-derived correctly for `prefers-color-scheme: dark`
**and** for the explicit `data-theme="dark"` stamp — verified by reading the un-stamped
`--dark--` captures specifically, per this loop's evidence instructions, and by the CSS
itself defining the dark palette identically in both the media-query block and the
`[data-theme="dark"]` block. `verify-design.mjs` confirms zero axe violations (which
includes colour-contrast) in both themes on every sampled route. Held below 9 only by
I3's badge noise, which is a chrome problem more than a colour one (the badges are
correctly *uncoloured* by default; the finding is that they exist as boxes at all for
the default state).

### 7. Family coherence — 7
Held down by the same defect as information density: two different ideas of what the
shell is for, depending on template (I2). Everything else — the rail pattern, the
`.section-title` treatment, the hairline rule vocabulary, radii (there are effectively
none, by design) — is genuinely one system across all ten labels and both themes.
**Path to 8.5+:** I2.

### 8. Responsive integrity — 6
`verify-design.mjs` confirms R2 holds everywhere sampled (no page-level horizontal
scroll at 320px, including on `/catalog`). But the rubric's own wording for this
category — "no collapsed hierarchy" — is exactly what I1 is: the catalog's column
hierarchy (name → provider → price → status) collapses to "name only" at 390 with no
signal to the reader. Home, index-wiki and article all reflow cleanly at 390
(`home--light--390.png`, `index-wiki--light--390.png`, `article--light--390.png`), which
is why this isn't lower — the defect is real but localized to one (critically important)
template.
**Path to 8.5+:** I1.

### 9. Accessibility — 10 *(hard-measured)*
Per the rubric's mapping: zero axe violations in both themes on every sampled route,
**and** every traversal in the `verify-design.mjs` output asserts its own coverage
against the page's actual focusable count rather than a bare PASS — home and
wiki-entry report "the complete tab order, N stop(s)"; `/tools` reports the complete
order plus the DOM's total focusable count and explains the gap (35 not tabbable inside
a closed `<details>`); `/catalog` is explicit about being capped ("150 of 817
focusable element(s) — STOPPED AT THE 150-STOP CAP, the rest unswept") rather than
silently passing on partial coverage (the exact L2 failure mode this loop's evidence
log warns about). That combination is the rubric's condition for a 10, not a 9.

### 10. Payload discipline — 9 *(hard-measured)*
Worst sampled page is `/catalog` at 122.3 KB gzipped against the 150 KB bound
(`data/launch.json`, confirmed live by `verify-design.mjs`) — 81.5% of budget, which is
≤85% and therefore a 9 by the rubric's table, not a 10 (which requires ≤60%, i.e.
≤90 KB; `/catalog` alone is over that threshold because of its 17.5 KB of inline JSON
for client-side filtering).

### 11. Visual distinctiveness — 8 *(capped contributor)*
Scored honestly and high: the date-rail motif, the impossible→routine span, and the
serif/mono split are a real point of view, not a default template with a new palette —
this is the site's strongest category, benchmarked against nothing generic. Per the
rubric this cannot be the reason the overall is held down, and no item above is filed
against it — I1, I2 and I3 are all named against uncapped categories (list/table craft,
information density/family coherence, chrome restraint) with distinctiveness untouched.

## Benchmarks, with mechanism

- **Linear** (density without clutter, structure from type/space not boxes): the
  catalog at 1440 and the wiki index both hit this — hairline rules, no per-row cards,
  tabular alignment doing the scanning work. The badge-on-every-row pattern (I3) is
  exactly what Linear's mechanism argues against: a bordered box is a claim of
  importance, and applying it to the default state spends that claim on nothing,
  diluting it for the rows that actually need it (retired/dead/deprecated).
- **Stripe** (structured tabular presentation as a first-class surface): met at 1440
  (`table-catalog--light--1440.png`) — right-aligned numerics, sticky header, a caption
  line stating provenance. Not met at 390 (I1): Stripe's own responsive tables degrade
  by re-flowing the row into a card-like key/value stack or by freezing the row label
  column, never by silently clipping every column but the first with no affordance —
  that's the specific mechanism this artifact is missing, not just "less polished."
- **Vercel** (a domain-appropriate face, a grid whose rhythm holds everywhere): met —
  the `--step` scale and `--gap` rhythm are legible from `home--light--1440.png` through
  `wiki-entry--light--1440.png` through `data--light--1440.png` without drift. Where the
  artifact falls short of this benchmark's *other* half — a grid that holds everywhere —
  is I2: the shell's rhythm is present but its width isn't spent the same way twice.

## Items filed

Three `ui-fixable` items, ordered by impact:

- **I1** (impact 9) — `/catalog` at 390px shows only the model-name column with no
  affordance that the table scrolls; the site's primary surface fails its stated job
  ("every model you can call today") for a mobile reader. Governing rule checked:
  RULES.md R2 (satisfied — this is a gap R2 doesn't reach, not a violation).
- **I2** (impact 7) — wiki-entry, article and prose templates leave roughly a third to
  a half of the 1440 shell empty for their full scroll length, while home and
  table-catalog use the same shell fully; this is both an information-density and a
  family-coherence defect. No governing rule found in RULES.md R1–R6.
- **I3** (impact 5) — the bordered `.badge` treatment is applied to the default/active
  lifecycle state on nearly every row of the wiki index and the catalog's STATUS
  column, diluting the badge's value for the states that actually need it
  (retired/dead/deprecated). No governing rule found.

No `keeper-gate` items were filed — everything found here is closable by a presentation
change within this loop's scope, and I did not encounter a finding whose only remedy
was a content or copy change. No item's only symptom is "looks generic"; the capped
category (visual distinctiveness) was scored honestly at 8 and held no findings.

## Item counts by tag

- `ui-fixable`: 3 (I1, I2, I3)
- `evidence-fix`: 0
- `keeper-gate`: 0

## Why "Competent" and not higher

The design system itself — typography, colour, the date-rail idea, payload discipline,
accessibility — is well past "Competent" in isolation; several of those categories score
8.5–10. What holds the overall down is that the site's single most important surface,
the model catalog, breaks at the mobile breakpoint for its core reader task (I1), and
that break sits inside a broader pattern of the same shell meaning different things on
different templates (I2). A reference site that is beautifully typeset but hides its own
prices from a mobile reader has not yet earned "Well-designed reference site" — that
tier should mean the primary surfaces work everywhere they're measured, not just at
1440. Close I1 and I2 and this artifact is a strong candidate for that tier on the next
pass.
