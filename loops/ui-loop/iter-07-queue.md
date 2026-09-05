# Iteration 7 — work queue

**Four items, sized to the gate.** Falsify with `--only <id> --break "<css>"` (~3s each),
not rebuilds (~106s). Batch your breaks; run the full gate once at the end.

**Scope.** `app/globals.css`, `app/layout.tsx`, and the `/catalog`, `/tools` and home page
templates. `RULES.md` and `tools/ui-invariants.mjs` are ALWAYS in scope.

---

## ITEM 0 — do this first. The gate is RED on two REAL defects.

`node tools/ui-invariants.mjs` fails S1 and S15. Both are genuine pre-existing artifact
defects that were invisible until iteration 6 made those checks two-sided:

- **S1** — `/data @1440x900: label "Impossible -> Routine — dated pairs with both sources"
  wraps across 2 lines — the label column has collapsed too narrow to hold it on one line`
- **S15** — `/blog @1440x900: title "Anthropic publishes one government exception to its
  usage policy. Weapons and domestic surveillance are not in it." wraps across 3 lines`

**Invariant.** A label/title track sizes to hold its own surface's longest entry within a
defensible number of lines at 1440x900, while still stopping short of the container's far
edge (R7). Those two clauses are the two ends of one property; satisfy both.

**This is a genuine tension, not a bug to paper over.** R7 caps the track so metadata sits
near its label; these entries exceed the cap. Widening the cap globally re-opens the
dead-air defect R7 exists to prevent. **The content strings are READ-ONLY — do not edit
content to fit the layout.** Consider a per-surface cap, a bounded-line allowance, or
another mechanism you can defend. Whatever you choose: amend R7 to state what the rule now
is, and make the check enforce both ends.

---

## I8 — impact 5 — app/catalog page template

**Problem (authoritative).** Unchanged and re-verified by me at 1440x900: the READ column renders the identical string '2026-08-31' on 396 of 396 rows — 1 unique value, 100% share — each one an underlined link carrying the same treatment as the discriminating MODEL column, occupying 105.2px of the table's 1152px. A full column of 396 identical underlined strings is chrome by another route: it consumes a ninth of the table's width and a full column of the reader's scan while carrying zero discriminating information, and it competes for attention with IN, OUT, CONTEXT and STATUS, which are what a reader crosses the row to compare. This is the same failure R8's badge clause already forbids for status chips — drawn on every row including the unexceptional ones, so the exceptional case has nothing left to say — applied to a link treatment rather than a border. Stripe's tables state a collection-level constant once above the table and reserve per-row cells for values that discriminate; the property of Stripe's content that makes that transfer is exactly this one's, a long list of records crossed to compare a few fields.

**Invariant.** No column of a record table renders an identical value on more than 90% of its rows at the same visual weight as the columns a reader compares across; a value constant across the collection is stated once for the collection, not once per row.

**Governing rule.** RULES.md R8 (badge clause, by analogy), RULES.md R9

**Prescription (hypothesis).** State the read date once in the table's own preamble — the page already says 'last checked 2026-08-31' above the filters — and render the READ cell per row only where it differs from that collection default, exactly as the badge clause treats status. If the per-row link target genuinely differs even when the date does not, move the link onto the model name's row-level affordance rather than onto a repeated date string. Assert it: no column may render one value on more than 90% of rows at link weight.

---

## I9 — impact 4 — app/page.tsx (home template)

**Problem (authoritative).** Unchanged and not worked. Re-measured by me at 1440x900: .home-side runs y=69.8 to 646.5 (576.7px) while .rail-changes runs y=103.7 to 1334.6 (1230.9px) on a 2559px page, so the rail reaches 46.9% of the feed's own height against the 60% the invariant asks — roughly 688px of empty right column beside the site's front-door content, with the grid still holding a 404.375px track open the whole way down. It is the same defect I33 describes on a template that HAS a second track and stops filling it halfway. Vercel's mechanism is a grid whose rhythm stays visible across every page; a column held open beside nothing for 688px is the rhythm visibly failing on the first page a reader sees.

**Invariant.** On the home page at 1440x900, the right rail's content extends to at least 60% of the changed feed's own height, or the feed reflows to use the full shell below the rail's end.

**Governing rule.** RULES.md R13

**Prescription (hypothesis).** Let the changed feed reflow into the full shell width once the rail ends, rather than holding a 404px column open beside nothing for 688px. Adding rail content is a content change and slot 1 forbids it, so the presentation-only remedy is the reflow. R6 constrains it: changed-feed lines must still be visible above the fold at both 1440x900 and 390x844 — verify-design currently reports 13 of 24 lines visible at 1440 with the first at 105px, and 5 of 24 at 390 with the first at 137px, so those are the numbers to hold.

---

## I11 — impact 5 — app/tools page template (.listing in app/globals.css)

**Problem (authoritative).** Unchanged and re-verified by me at 1440x900: every .listing child is display:block at x=144 with no grid on the listing or its container, and the four fields a reader arrives to compare — licence, pricing model, verified date and link — are still one run-on mono line separated by middots spanning the full 1152px shell. Six sampled .listing-line glyph right edges: 1134.3, 1004.8, 1294.2 (wrapping to 2 lines), 799.1, 867.7, 623.9. No field begins or ends at the same x on any two entries. This is the defect I17 fixed on .browse and I32 refined this iteration, surviving on the one /tools surface .browse does not cover — and it is the surface the page exists for. Stripe treats a comparison across records as a column problem and gives every field its own track shared down the list; the property of its content that makes that transfer is that a reader is crossing records to compare a small fixed field set, which is precisely what /tools is. Note the interaction with R8: because the fields are ragged the per-entry rule is required and is correctly present, but the rule is doing all the binding work a column structure should be sharing.

**Invariant.** On /tools, the licence, pricing, verification-date and link fields of every listing start at the same x within a category, sharing one set of grid tracks across all entries of that surface.

**Governing rule.** RULES.md R13

**Prescription (hypothesis).** Give .listing the same treatment .browse received at iteration 4: one shared grid track set across the entries of a category (subgrid on the entry, the track set declared on the category container), with the four facts as columns rather than an inline middot run. R13 is written about 'a row-based list surface' generally and has been applied to .browse and .rung; this is the third surface it names by its own terms. Keep the per-entry rule — R8's test still returns YES here once the entries are columnar, because the fields span a wide gap from their record name.

---

