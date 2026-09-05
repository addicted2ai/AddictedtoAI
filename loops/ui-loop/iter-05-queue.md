# Iteration 5 — work queue

**Four items, deliberately sized to the gate.** One full gate cycle costs ~106s; iteration 4 ran seven items with serial falsification and took 69 minutes. Falsify with the harness --break mode (see IMPLEMENT.md) — 2.9s instead of ~212s per falsifier.

**Scope.** app/globals.css, app/layout.tsx, and the /wiki entry, /blog, /tools page templates. RULES.md and tools/ui-invariants.mjs are ALWAYS in scope.

**THE GATE IS CURRENTLY RED.** tools/ui-invariants.mjs S9 fails: `.browse occupies 48.6% of the shell content width`. That is I16, unresolved. The check was one-sided and passed until it was fixed; it is correct now. **Do not weaken it — make it pass honestly.**

---

## I16 — impact 7 — shared design system (app/globals.css - .shell, .browse, and the measure-track prose templates)

**Problem (authoritative).** Four of the ten sampled templates leave roughly half the viewport unoccupied down their entire height, and this iteration changed the number by one scanline. Measured by scanning each capture for the rightmost non-background pixel on every scanline, excluding the header band and the footer: /wiki carries ink past 55% of the 1440 viewport on 26 of 3383 scanlines (0.8%); /data 0 of 1031; /colophon 0 of 1043; /wiki/concept/ai-winter 0 of 2794. For contrast, on the same measurement / reads 555 of 2379, /tools 399 of 4403 and /learn 777 of 3672. The same scan over evidence/iter-01/index-wiki--light--1440.png reads 27 of 3383 and over evidence/baseline/index-wiki--light--1440.png reads 1874 of 3444. I17's subgrid half landed and is resolved; the width: fit-content half of the same item did not recover any of the width iteration 1 gave up - it made the list narrower, which moves AWAY from R13's second clause. The item was scoped as one job with I17 and only half of it was done, and the check registered for it cannot distinguish the two halves (see I28).

**Invariant.** On every sampled route at 1440x900, either the rendered content inside <main> carries ink on at least 25% of the scanlines falling in the right half of the shell, or the occupied track is centred within the shell so that the unoccupied width is split rather than pooled entirely on one side.

**Governing rule.** RULES.md R13

**Prescription (hypothesis).** Two different remedies, because there are two different causes. For /wiki and /data, restore a genuine second column - kind and status right-aligned toward the shell's inner edge as at baseline. The reason iteration 1 removed it was that values drifted from their labels across ~1140px; subgrid now holds them in one track set, so the alignment objection no longer applies and the width can come back without the defect that motivated capping it. For the measure-track prose templates (/wiki/[kind]/[slug], /colophon, /blog/[slug]), centre the measure track in the shell, or move the FACTS block into the freed track - which would also address I5. Do not satisfy this by widening the prose measure itself; the measure is correct.

---

## I5 — impact 5 — app/wiki entry page template

**Problem (authoritative).** Unchanged and not worked. The wiki entry is the site's answer surface and still puts its answer last: on /wiki/concept/ai-winter the FACTS block - the dated, sourced, machine-checked values that are the reason this record exists - begins past y=2100 of a 2974px page, after every word of prose. current/wiki-entry--light--1440.png shows prose from y=240 to roughly y=2100 in a 605px measure with the shell's right 576px empty throughout, then FACTS, then REFERENCED HERE and APPEARS IN. A reader who arrives from search wanting the Lighthill report's date reads an essay to find it.

**Invariant.** On a wiki entry at 1440x900, the FACTS block's top edge falls within the first viewport, or the block is placed in a track beside the prose rather than after it.

**Governing rule.** RULES.md R13

**Prescription (hypothesis).** Put FACTS in the shell track the prose is not using - the same 576px that I16 reports empty on this exact template. That places the answer in the first viewport, uses the dead track, and satisfies R13 and this item with one change. This is presentation only: the <dl> markup in app/wiki/[kind]/[slug]/page.tsx does not need to change, only where the block is placed. Note that DC1 retired column-start alignment between the facts grid and the prose - this prescription does not reopen it, because a facts block in its own track need not align to anything.

---

## I30 — impact 4 — app/blog index template, against app/wiki and app/learn

**Problem (authoritative).** The same object - a record-title link on an index - is set at two incompatible measures on the same property. In current/index-blog--light--1440.png the four post titles run from x=259 to x=1278, a 1019px measure, and the third wraps at 1130px; the intro paragraph on that same page is bounded at roughly 605px, so the page contradicts itself. In current/index-wiki--light--1440.png the same object is bounded to a 384px track, and in current/index-learn--light--1440.png to roughly 608px. Three index templates, three measures, one object. A 1019px line of 20px serif is past any reading measure, and it is the widest line of running type anywhere on the property. This is a family-coherence defect, not a taste preference: R7 exists precisely to bound a list's primary label column, and /blog is a list surface that R7's executable form (S1) does not reach because it is not built from .browse-row.

**Invariant.** A record-title link on an index template is bounded to the same measure token on every index template of the property; no index sets one past --measure.

**Governing rule.** RULES.md R7, RULES.md R9

**Prescription (hypothesis).** Bound the /blog index's title column to --measure-list, the token R7 names, and extend S1's route list to cover /blog so the bound is asserted rather than assumed. If /blog's titles are genuinely too long for --measure-list - three of the four run past 900px - that is an argument for a wider shared token applied to all three indexes, not for one template setting its own; changing the token is in scope for globals.css and changing one template's measure alone is what produced this.

---

## I32 — impact 4 — shared design system (app/globals.css, .browse-name's track), as it renders on the /tools category index

**Problem (authoritative).** R7's --measure-list is a cap, not a fit, and on a surface whose labels are far shorter than the cap it manufactures the drift R8 exists to prevent. Measured at 1440x900: on /tools' category index .browse-name occupies x=144 to x=528 - the full 384px track - on every row, while the longest label rendered is 'observability' ending near x=239. .browse-kind, which holds a single digit, starts at x=540. So roughly 289px of the list's 415.6px total width is permanently empty, the count sits ~300px from the label it belongs to, and this is a surface classed NO for cross-row tracking, so it correctly has no rule to bind the two. current/index-tools--light--1440.png shows the result: thirteen one-word categories on the left, thirteen single digits floating three hundred pixels away. On /wiki and /data the cap binds against real content and the same track is correct; the defect is that the track does not respond to the surface it is on.

**Invariant.** A .browse surface's label track sizes to that surface's own max-content bounded above by --measure-list, so the gap between the widest rendered label on the surface and the start of the trailing track does not exceed the row gap.

**Governing rule.** RULES.md R7, RULES.md R13

**Prescription (hypothesis).** Size the first track as minmax(0, min(max-content, var(--measure-list))) rather than minmax(0, var(--measure-list)). This does not conflict with R13: the track set is still shared across every row of the surface, which is what R13 requires - it is the surface's own content that sets it rather than a global token. Check /data at the same time: its longest label ends at x=436 inside the same 384px-capped track, so /data is the case where the cap correctly binds and must not be loosened.

---

