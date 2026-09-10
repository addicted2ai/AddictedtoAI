# RESULT1 — Wisdom item 3, round 1 of 2: required text carried completely

Date (local): 2026-09-10. Files: `loop/lib/brief.mjs` (existing: pure
`reconcileRequiredCoverage` returning `{missing,truncated,contradicted}`
plus the missing+truncated refusal inside `assembleBrief` before the
return), `loop/tests/brief-required.test.mjs` (new, 9 arms). Nothing
else touched — `loop/run.mjs`, `loop/lib/review.mjs`,
`scripts/brief-lint.mjs` stay read-only. Run by absolute path with
`node --test`. `npm test` was not run here (no `node_modules` in this
worktree); the whole-suite total is the orchestrator's on the merge
target.

File-list closure against the merge-base diff follows in round 2 with
its own brief; beyond this sentence that half is out of scope here.

## 1. Baseline colour and post-mutation colour of every assertion

`loop/tests/brief-required.test.mjs` (9 tests, all GREEN at baseline):

| Assertion | Baseline | Under mutation | After revert |
|---|---|---|---|
| arm 1 — cut before the boundary refused as missing, naming ACCEPTANCE | GREEN | n/a | GREEN |
| arm 2 — mid-sentence cut refused as truncated (marker line + sentence); complete passes | GREEN | n/a | GREEN |
| arm 3 — negated required sentence refused as contradicted (detector level) | GREEN | n/a | GREEN |
| arm 3b — contracted negations (`wont`, `doesnt`) detected; no dead arms in the negation list | GREEN | n/a | GREEN |
| arm 4 — required text with no content sentences passes by asserted choice | GREEN | n/a | GREEN |
| arm 5 — contradiction detected but NOT wired to dispatch (pins the non-wiring; asserts contradicted non-empty) | GREEN | n/a | GREEN |
| Mutation A — completeness reduced to any-token presence (FILE mutation, fresh import) turns truncated green (defect shown on the wire) | GREEN (defect) | GREEN-under-mutation | GREEN |
| Mutation B — dead check lets dropped-detail assembly through to a write (defect shown); correct-half calls LIVE `assembleBrief` on the identical pair and refuses | GREEN (defect) | GREEN-under-mutation | GREEN |
| Liveness — detail-drop makes assembly throw | GREEN | n/a | GREEN |

## 2. Suite totals, read from the runner's own summary lines

Orchestrator-verified from outside with `wisdom/tools/suite.mjs`:
`{tests:9, pass:9, fail:0}` (expectTests:9). Direct `node --test`
agrees. Related suites re-run in-worktree after the change:
brief-acceptance + excerpt-budget + reconcile + brief = 72/72, zero
false fires.

## 3. Mutations of my own (beyond the brief's A and B)

1. Strictness collapsed to 2b-loose (`briefCarries` gate first): arms
   2, 3 and A go red — the strict instrument is load-bearing and
   distinct from 2b's coverage. Reverted byte-identical (hash
   `5a81a2c…` before and after).
2. Mutation A as specified is a real FILE mutation, not a simulation:
   the single line `if (hits.length === sig.length) continue;`
   becomes `if (hits.length > 0) continue;`, observed through a fresh
   import (Node caches modules — the static binding would measure the
   old code), the truncated arm goes green, reverted byte-identical,
   and the real check refuses the same input afterwards.
3. Mutation B's correct-half calls the live `assembleBrief` on the
   IDENTICAL dropped-detail pair the dead check let through — not a
   hand-rolled mirror — and refuses with nothing written. Reverted
   byte-identical.

## 4. Control provenance

CONSTRUCTED AND STATED: an authority fixture (three numbered
requirements + ACCEPTANCE block after a marked boundary). No wild
generated-brief instance of this class exists on record — B2/E/F
round-1 briefs quoted their tasks faithfully, which is why the wild
controls belong to round 2.

## 5. The enumeration-and-exclusions comment, quoted from the file

From `loop/lib/brief.mjs`, the `3a required-text coverage` block:
required = title+detail; complete = EVERY significant token present
(strict, never 2b's coverage); missing = opening content word never
arrives; truncated = leading ordered run present with tail gone
(scattered middles count as missing); contradicted = brief sentence
with negation sharing ≥2 required tokens (floor stated; hedges,
double negatives and "not only" escape, stated); empty passes by
asserted choice; tripwire rationale with mutation-proof requirement.
(Full text in the file.)

## 6. Anything the brief got wrong

One load-bearing deviation, measured, not argued:

Whole-brief contradiction wiring is unshippable as specified. With
the detector wired to refuse, 35 existing tests go red
(brief-acceptance, excerpt-budget, reconcile arm 1b): the template's
own scope sentence ("Do not widen it: a diff that exceeds the stated
outcome…") negates work vocabulary, so ordinary titles sharing two
content words false-fire. The detector ships fully tested
(function-level red/green + mutation proofs); the dispatch wires
missing+truncated only; arm 5 pins the non-wiring; the existing
suite passing is the standing proof it stays safe. Contradiction at
dispatch needs a review-time reader to judge polarity — that is round
3b's question (and README §4's "second reader" observation), not this
round's. The brief invited exactly this finding.

Two smaller corrections folded into the arms without scope change:
the truncation cut genuinely truncates TWO required lines (marker +
sentence), asserted as such rather than as one; and the bag-check
mutation uses any-token (not every-token) semantics, which is what
makes the green-a-defect demonstration true.

## 7. Revise-verdict fixes folded in (no scope change)

The sealed review returned revise with four findings; all are
addressed in the implementation commit `44ee775`:

1. Simulation-not-mutation (finding 1): mutation A rewritten as a
   real file mutation observed through a fresh import; mutation B's
   correct-half calls live `assembleBrief` on the identical
   dropped-detail pair. A simulation would prove nothing about the
   wire — both arms now touch the file.
2. Dead arm in the negation list (finding 2): the `n't` contraction
   arm never fired because `squashed` strips apostrophes before
   matching. Fixed by normalizing contractions to their stems
   (`dont`→`dont` stem list, `cant`, `wont`, `isnt`, `arent`,
   `wasnt`, `werent`, `havent`, `hasnt`, `hadnt`, `couldnt`,
   `shouldnt`, `wouldnt`, `mustnt`, `neednt`, `doesnt`, `didnt`)
   BEFORE squashing, and arm 3b pins a contracted negation going
   red→green. No arm in the list is untested.
3. Placeholder reasons (finding 3): the CONTRADICTED comment's
   "reasons" were three copies of the same sentence. Replaced with
   three distinct real reasons (polarity needs a reader, ≥2-token
   overlap false-fires on template scope language, measured 35-red).
4. Arm-5 mirror drift (finding 4): arm 5 asserted refusal from a
   hand-rolled mirror while the wire could stay dead. It now
   additionally asserts the detector is live at assembly level
   (`contradicted` non-empty on the assembled text, flagging the
   title-overlapping template sentences) — so the non-wiring is a
   measured decision about a live detector, never silence about a
   dead one.

The brief's own arm-3 disposition (contradiction
detected-reported-unwired pending the review-time reader, with the
35-red measurement) is the orchestrator's amendment follow-up, not
this implementation's to make.
