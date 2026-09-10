# stage0-specfix — three gated revision rounds against the spec deltas

Branch `stage0-specfix`, worktree `D:/addictedtoai-worktrees/fleet6-specfix`,
base `53779c3`, landed as `7629416`. Local dates 2026-09-09.

This is the correction pass on the change's own spec deltas, run after seven
review documents found defects in them. It is **not** a packet: no code changed,
and the deliverable is the two delta files.

## What each round was

| Round | Author | Verdict of its sealed review | Blocking |
|---|---|---|---|
| 1 | muse-spark via OpenRouter, xhigh | REVISE | 5 |
| 2 | muse-spark via OpenRouter, xhigh | REVISE | 4 |
| 3 | muse-spark via OpenRouter, xhigh | **DISPATCH** | 0 |

Reviews throughout: muse-spark via **opencode-go** at xhigh, plan agent.

## The routing decision, and the evidence for it is in this directory

`round1-brief-review-opencode-go.md` and `round1-brief-review-openrouter.md` are
the **same brief, same model, same variant, same document, same sha**, reviewed
through the two providers — the provider is the only variable. Both returned
REVISE. Both reproduced the same two blocking findings by **different evidence
paths**, which is stronger than agreement: it is two independent derivations of
one defect.

The decision that came out of it: **implementations route to OpenRouter,
reviews stay on opencode-go.** OpenRouter carries no 30-minute rate wall, which
suits a long implementation (round 3 ran 29 minutes); a review fits inside the
wall comfortably (round 3's took 1m50s).

**The one thing that route cannot do**, recorded because it constrains what may
be sent there: `--variant max` is REFUSED on OpenRouter (`Supported values:
[minimal, low, medium, high, xhigh]`) and **`opencode run` exits 0 on that
failure** — so a max dispatch there looks like a success and produces nothing.
xhigh is the ceiling. The standing max-for-everything rule is codex-Luna-only,
and that is precisely why this first OpenRouter implementation was spec TEXT
rather than production code.

## Two rulings of mine that were wrong, and how they were caught

Kept because the mechanism that caught them is worth more than the fixes.

1. **F5's unit** (round 2). I ruled the window was "the five most recently
   appended ledger entries for that runner in that role". Breaker 1 counts per
   **governing job type** (`:1462`); "that runner in that role" is the
   runner-health window's unit (`:2118`) — a different requirement. **The author
   caught it** and declined the ruling, saying so in its report.
2. **F2's threshold scenario** (round 2). I ruled "One real run clears it"
   should be scoped to a runner whose last five include exactly three empty
   ones. That is arithmetically false: a sliding window evicts the OLDEST slot,
   so `[producing, producing, empty, empty, empty]` plus a producing run still
   leaves three of five empty and stays refused. **The sealed review caught it.**
   The fix conditions on the evicted slot itself being empty.

Both were found by the same clause — every brief requires the author to report
where it disagreed with a ruling. That clause has now caught a wrong ruling in
two of three rounds, which is the strongest argument for keeping it.

## Still open — architect rulings, deliberately NOT made by the author

The round-3 author flagged both and refused to guess, which was right.

1. The warm-up bullets are **tier-framed** ("the tier's observed rolling
   total") and therefore do not say what denominator the **global** back-desk
   ceiling reads on a near-empty window.
2. "Tightest configured ceiling percentage" in the warm-up derivation will
   arguably start including `back_desk_ceiling_pct` from the moment that key
   exists — widening the warm-up window without any number being edited.

Both concern a bound whose key is not yet present in `data/config.json`, so no
implementation can contradict them yet.

## A process deviation, recorded rather than buried

The standing instruction is that **every brief is reviewed by a second model
before dispatch**. Round 1's brief was (twice — see the comparison above).
**Rounds 2 and 3 were linted but NOT second-model reviewed.** No harm is
visible — the linter refused each of them until fixed, and round 3 returned
DISPATCH with no blocking findings — but the rule was not followed for two
dispatches and the absence of harm is not the same as compliance.

## Verification, and why the method matters more than the result

`openspec validate <change> --type change --strict` is green, **re-run by the
architect** through a spawned `{ cwd: <worktree> }` script rather than read from
the author's report.

That is not ceremony. `openspec validate` takes **no path operand**; absent
`--store <id>` it resolves its root as `nearest`, walking **up from the current
working directory**. A bare run from anywhere else validates the MAIN tree and
prints the identical green sentence. Every brief in rounds 1 and 2 told the
author to run it "against your worktree", which named no path-taking mechanism —
those rounds survive only because the architect re-ran it independently both
times. Round 3's brief gives the script by absolute path instead.

`--strict` is load-bearing: it promotes warnings to failures
(`valid = errors === 0 && warnings === 0`), which turns missing SHALL/MUST
keywords from guidance into errors. Every green recorded here is the strict one.
