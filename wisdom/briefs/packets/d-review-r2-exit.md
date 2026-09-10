Round 1's sealed review (REVIEW1.md) found two test gaps — changed lines
whose mutation stayed green: the three early returns' `topRanked: null`
(`select.mjs:158`, `:176`, `:190`) and the non-empty-string guard on
`escalates_to` (`runners.mjs:86-88`) — and no production defect; all six
author mutations and its own floor mutation went red. Round 2 is tests only,
in one file. That class of finding has no floor (packet B2's four reviews of
one diff each found new green mutants, none a production defect; packet E's
delta review carried two more), so the architect's exit condition in the
Stage 0 preamble applies: you APPROVE when (a) every named mutation of
REVIEW1's two findings — each of the three `null` → `{}` mutations, and the
guard disabled — goes RED under you against the current production code and
restores GREEN by hash; (b) the author's sweep lists every code line of the
round-1 diff with its covering arm or the reason none can, and your reading
of the diff finds no omitted line; (c) this round's diff is within its one
listed test file; (d) the standing properties hold; and (e) the author's
completed full suite on the final tip is green (1,790 or more, 0 failed). A
further green mutant you find is written into your review under "Carried,
non-blocking" and does NOT change the verdict — unless it exposes a
PRODUCTION defect (an arm that goes red against the unmutated code, or a
wrong world the requirement forbids), which remains a revise. Do not
manufacture a revise from the carried class; do not approve if any prior
named mutation stays green.
