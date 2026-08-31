# Tasks: write-the-constitution-in-timeless-voice

**This change ships no code.** Its whole deliverable is six `MODIFIED` blocks
that a later `openspec archive` merges into `openspec/specs/`. So the tasks
below are not implementation steps — they are the checks that decide whether the
blocks are safe to merge, and every one of them was run on 2026-08-31 with its
result recorded here. A tick means measured, never intended.

## 1. Find the defect with the repository's own instrument

- [x] **1.1 — Re-measured, not inherited.** `addictedtoai-n2g` listed seven
  `grep` lines. Re-measured by running
  `scripts/check-spec-deltas.mjs`'s exported `parseSpecRequirements()` and
  `narrationHits()` over every `openspec/specs/*/spec.md` — the same functions
  that guard unarchived deltas, so the fix and the guardrail cannot describe
  different defects. Result: **8 marker hits in 6 requirement bodies across 3
  specs**, and all seven of the issue's lines fall inside those six bodies.
- [x] **1.2 — The count reconciles.** Seven lines, six bodies, eight hits.
  `loop/spec.md:426` and `:452` sit inside one body (starting at line 417), which
  is why six < seven; `:452` — *"drafted in this change's `design.md`"* — trips
  both `this-change` and `bare-change-artifact`, which is why eight > seven.
  Nothing in the issue's list is unaccounted for and nothing was added to it.
- [x] **1.3 — No eighth body.** All eleven live specs were scanned, not the
  three known to be affected. `pulse`, `wiki`, `site`, `blog`, `editorial`,
  `directory`, `education-dynamic` and `analytics` are clean.

## 2. Confirm no other change is touching these requirements

- [x] **2.1 — Every unarchived change's touched headings enumerated** from its
  parsed delta via `readLiveChanges()`, not by reading prose.
  `group-tool-listings-by-category` touches 3 `directory` headings;
  `make-the-blog-worth-sending` touches 17 headings across `blog`, `editorial`,
  `loop`, `pulse` and `review`.
- [x] **2.2 — Intersection with this change's six headings is empty.**
  `make-the-blog-worth-sending` modifies four `loop` requirements and two
  `review` requirements, and none is one of the six here. Shared capability,
  disjoint requirements. See `design.md` D6 for the full enumeration.
- [x] **2.3 — Archive order is therefore unconstrained** between the three live
  changes, and `check-spec-deltas.mjs` reports no `collision` and no
  `archive-order` finding across the merged set.

## 3. Write six blocks that reproduce six whole bodies

- [x] **3.1 — `education-static`: The surface is grown against a written map of
  the whole subject.** One scenario's WHEN. Its heading is preserved verbatim:
  `openspec validate --strict` refuses a `MODIFIED` block that renames a
  scenario, since the archive cannot distinguish a rename from a deletion. Found
  by running the gate on the first draft, which did rename it. See `design.md`
  D3.
- [x] **3.2 — `loop`: A runner proven unable to run is refused, and refusal is
  not a halt.** Opening paragraph and the last bullet's closing clause.
- [x] **3.3 — `loop`: A budget refusal states the arithmetic it refused on.**
  Framing paragraph, two clauses.
- [x] **3.4 — `loop`: A job's total spend is measured, and the cap is named for
  what it is.** Framing paragraph, three clauses.
- [x] **3.5 — `review`: A review record names the bytes it reviewed.** Closing
  paragraph, one clause.
- [x] **3.6 — `review`: Missing, unbound, and mismatched are three findings, not
  one.** The **Unbound** bullet's justifying clause.

## 4. Prove each block reproduces its body — the check that matters

A `MODIFIED` block replaces the **whole** requirement body. A bullet dropped by
accident deletes a requirement and the archive reports success. Reading the
blocks does not catch that; diffing them does.

- [x] **4.1 — Mechanical line diff, block against live body.** Each `MODIFIED`
  block was parsed out of this change's deltas with `parseDeltaSpec()` and each
  live body with `parseSpecRequirements()` — the same parsers the archive's own
  boundary is read from — and the two compared line by line.
- [x] **4.2 — Every differing line is one this change names.** No requirement
  loses a bullet, a scenario, a WHEN or a THEN. Verified as: 6 blocks, and the
  total set of changed lines matches the edits enumerated in §3 and in each
  delta's preamble, with **no removed bullet and no removed scenario** in any
  block.
- [x] **4.3 — Scenario count preserved per requirement.** 2, 3, 2, 2, 3, 3 —
  identical in block and live body for all six.

## 5. Run the gates this change can run

- [x] **5.1 — `openspec validate write-the-constitution-in-timeless-voice
  --type change --strict`** → valid.
- [x] **5.2 — `node scripts/check-spec-deltas.mjs --strict`** over the whole
  tree, which promotes `collision`, `archive-order` and `narration` to refusals:
  **0 errors**. This change's own blocks introduce no narration, which is the
  self-consistency the fix requires — a narration cleanup that narrated itself
  would be the defect twice.
- [x] **5.2a — Three `stale-id` warnings, all advisory and all inherited.**
  `openspec/curriculum/learn.md`, `loop/lib/health.mjs` and
  `content/wiki/org/moonshot-ai.md` are reported as appearing nowhere under the
  source directories. **All three files exist** (`Test-Path` → True for each,
  2026-08-31), and all three tokens are reproduced verbatim from the live bodies
  — this change introduces none of them. The check searches file *contents*, so
  a real file that no other file's text names reads as absent, and `openspec/`
  is not in the haystack at all. `stale-id` is advisory in both modes by the
  originating issue's own instruction, and it does not fail this change.
- [x] **5.3 — Not run, deliberately: `npm test` and `npm run build`.** A Desk
  job and another agent were live in this tree, and *"never run two builds
  concurrently"* is a standing rule here — two `next build` processes race over
  one `.next/`. This change touches no code, no content and no data, so neither
  gate reads anything it alters; `check-spec-deltas.mjs`, the one prebuild step
  that does read these files, was run directly and standalone in 5.2.

## 6. Hand off — what is deliberately NOT done here

- [x] **6.1 — Not archived, and not this job's to archive.** Merging a delta
  into `openspec/specs/` is a one-way door into a reserved path. This change ends
  as a validated directory awaiting the orchestrator.
- [x] **6.2 — The adjacent defect is filed, not folded in.** Four bodies open by
  diagnosing the pre-change world in the present tense (*"A verdict record today
  names a piece"*, *"today the check cannot tell it from the other two"*). Not
  change-relative, so no detector catches them and no reader is left hunting a
  directory — but they read as false against the system the requirement below
  them creates. Filed as `addictedtoai-sut` with the measured list. Rationale
  for the split is in `design.md` D4; the short version is that folding them in
  would have destroyed 4.2, the property that makes this change checkable.
- [x] **6.3 — The three open questions keep their pointers.** `addictedtoai-pfv`,
  `addictedtoai-tr8` and `addictedtoai-o5t` replace the three `design.md`
  references. Each was confirmed **open** before being cited, and each is a
  reference only — no SHALL depends on reading one.
