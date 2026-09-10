# REVIEW TARGET — spec delta corrections, round 3

authority: two-desks-work-orders-and-trains@12b4ea3

Worktree `D:/addictedtoai-worktrees/fleet6-specfix`, branch `stage0-specfix`,
base `53779c3`. Round 2 was sealed-reviewed (REVISE, four blocking); this is the
revision. Author muse-spark via OpenRouter at xhigh, 29 minutes wall clock,
exit 0.

## WHAT THE ARCHITECT VERIFIED INDEPENDENTLY — do not spend effort re-deriving these

Each of these was measured by me against the worktree after the run exited, not
read from the author's report. They are stated so the review can spend itself on
what is still open.

- **`openspec validate --strict` is green**, re-run by me through a spawned
  `{ cwd: <worktree> }` script whose output prints the cwd it used. This matters
  because the command is cwd-relative and resolves its root by walking up from
  the working directory (`nearest`); a bare run from anywhere else would have
  validated the MAIN tree and reported the same green sentence.
- **The `consecutive` reconciliation reproduces exactly.** The author reports 9
  matches and tabulates 9 line numbers; my own case-insensitive search returns 9
  lines at precisely those numbers (315, 398, 1481, 1495, 1550, 1558, 2243,
  2266, 2269). The table IS the raw count, one row per match — which is the
  structural repair of round 2's defect, where a sweep enumerated the
  requirements it read rather than the occurrences of the word and therefore
  missed four.
- **The closure holds.** `git status` in the worktree shows exactly two modified
  files — the two delta files the brief named — plus the untracked RESULT files.
  Nothing was created, edited or deleted outside the declared list, and the LIVE
  spec is unmodified.
- **F5's term conformance is complete where it counts.** Nine `success`/`succeed`
  occurrences survive in the file; I checked each, and **none is inside the
  breaker-window requirement**. The undefined term is gone from the requirement
  that defined the window, which is what the finding asked for.
- **The F1 trigger is dormant by design, as claimed.**
  `budget.bounds.back_desk_ceiling_pct` is genuinely ABSENT from
  `data/config.json` today (the bounds there are 40/45/30), so the existence
  condition is currently false and the restatement correctly does nothing yet.
- **No literal window survives.** No `rolling 30` or `30 days` remains anywhere
  in the loop delta; the period is named by key throughout.

## THE ARCHITECT'S POSITION ON THE AUTHOR'S DECLARED DEPARTURES

**Both extensions in §5(b) are accepted, and the reviewer should treat them as
ruled rather than as scope creep.** (i) Conforming `success` → `done` across the
requirement's narrative sentences and one scenario heading, when the ruling
named only two sentences, is the consistent reading of a ruling whose stated
option was "or use `done`" — leaving the undefined term in a heading while the
body says `done` would recreate the heading/body divergence that is this
change's most-repeated defect. (ii) Replacing the neighbouring tier rule's
literal "rolling 30 days" with `budget.window_days` is covered verbatim by the
ruling's own rationale ("the number is configuration and the spec should name
the key"). An author that extends a ruling to the sentence next door, says so,
and gives the reason is doing the thing I want.

**No ruling was disobeyed this round.** Rounds 1 and 2 each surfaced a wrong
ruling of mine through this clause; round 3 surfaced none. That is a fact about
this round, NOT evidence that the rulings were right — please read them as
adversarially as if the author had objected.

## WHAT IS ACTUALLY OPEN — spend the review here

1. **The two residuals the author flagged and deliberately did not fix (§5c).**
   The warm-up bullets are tier-framed ("the tier's observed rolling total") and
   therefore do not say what denominator the GLOBAL back-desk ceiling reads on a
   near-empty window; and "tightest configured ceiling percentage" in the warm-up
   derivation will arguably start including `back_desk_ceiling_pct` from the
   moment that key exists — on its first and every later evaluation, not after
   some number of attempts — widening the warm-up window without any number
   being edited. I regard
   both as MINE to rule, not as defects in the author's work — the author was
   right to flag rather than guess. **Tell me if you disagree that they are out
   of this round's scope, and tell me if there is a third consequence of the
   global/per-tier axis split that neither of us has named.**

2. **§5(d), and this is the claim I most want attacked.** Three surviving "until
   the window rolls" phrases (loop:2306, 2412, 2441) were left unchanged on the
   argument that each *inherits* the now-named `budget.window_days` window from a
   governing sentence two paragraphs up. That argument may well be right. It is
   also exactly the shape of claim that reads fine to someone who already knows
   the answer and implements wrong for someone who does not — an inheritance
   nobody wrote down. Is the inheritance actually unambiguous at each of the
   three sites, or does one of them sit under a different governing sentence?

3. **F4's arithmetic, checked rather than accepted.** The WHEN now reads "include
   exactly three empty ones, the oldest of the five being one of the empty ones".
   Verify the THEN is now unconditionally true under a sliding window that evicts
   the oldest slot. Round 2's version of this scenario was arithmetically false
   and I ruled it wrong; the sealed review caught me. Do that again.

4. **Whether the bound sweep in §3 is a real enumeration.** It claims to cover
   every bound, ceiling, floor and share in the loop delta, with a key, a period
   and a denominator for each, marking the ones whose keys the spec leaves
   unnamed as "as-is" rather than repairing them. Is anything missing from it,
   and is any row's stated period or denominator wrong?
