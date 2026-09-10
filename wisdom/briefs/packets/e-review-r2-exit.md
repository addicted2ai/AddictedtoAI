Round 1's sealed review (REVIEW1.md) found three test gaps — assertions on
the SHAPE of a new ledger value where the property is its VALUE — and two
closure pins outside the round-1 Files list; no production defect. Round 2
is tests only. That class of finding has no floor (packet B2's four reviews
of one diff each found new green mutants, none a production defect), so the
architect's exit condition in the Stage 0 preamble applies: you APPROVE
when (a) every named mutation of REVIEW1's three findings — an unrelated
40-character `authority_sha` at `run.mjs:1486`, `brief_chars: 1` at
`run.mjs:1484`, `carried: 0` for every parsed verdict at `run.mjs:678` — goes
RED under you against the current production code and restores GREEN by
hash; (b) the two pins, reverted to their round-1 form, go red on this tip
and restore; (c) this round's diff is within its listed test files; (d) the
standing properties hold; and (e) the author's completed full suite on the
final tip is green (1,782 or more, 0 failed). A further green mutant you
find is written into your review under "Carried, non-blocking" and does NOT
change the verdict — unless it exposes a PRODUCTION defect (an arm that
goes red against the unmutated code, or a wrong world the requirement
forbids), which remains a revise. Do not manufacture a revise from the
carried class; do not approve if any prior named mutation stays green.
