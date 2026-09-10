Rounds 4 and 5 each STOPPED without a commit when an arm went red against
the unmutated code; the architect read both and ruled both ARMS wrong (one
expected `### Requirement:` lines at a marker-only cap, one matched a heading
inside the fenced diff), so `RESULT4.md` and `RESULT5.md` in the tree are
stop reports, not rounds to re-verify; round 6's `RESULT6.md` carries the
four arms to completion (findings 1-2 mutation-tested in round 5, 3-4 in
round 6). Four reviews and two stopped rounds of this diff have each found new green mutants (REVIEW1 two,
REVIEW2 six, REVIEW3 four, none overlapping), every one an arm narrower than
its property and none a production defect. That class has no floor, so the
architect has ruled the exit condition, now in the Stage 0 preamble at the
authority commit's successor: you APPROVE when (a) every named mutation of
every prior review of this packet — REVIEW1's two, REVIEW2's six, REVIEW3's
four, each at the line it names — goes RED under you against the current
production code and restores GREEN by hash; (b) this round's diff is within
its two test files; (c) the standing properties hold; and (d) the author's
completed full suite on the final tip is green (1,769 or more, 0 failed).
A further green mutant you find is written into your review under a heading
"Carried, non-blocking" and does NOT change the verdict — unless it exposes
a PRODUCTION defect (an arm that goes red against the unmutated code, or a
wrong world the requirement forbids), which remains a revise. Do not
manufacture a revise from the carried class; do not approve if any prior
named mutation stays green.