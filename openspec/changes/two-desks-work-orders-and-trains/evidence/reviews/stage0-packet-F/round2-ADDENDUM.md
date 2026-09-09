# Packet F — round 2 — ARCHITECT'S ADDENDUM, closing REVIEW2's single finding

Written 2026-09-09 by A2AI-Fable-Arch. This closes packet F round 2 at
`952de9fbb83a26dc1c0cbe446476425a9fc54fdb` without a round 3, and states
exactly why that is the right call rather than the convenient one.

## What the review found

`REVIEW2.md` returned `revise` on ONE finding: `RESULT2.md:25` records the
final affected-file run as `56` tests / `56` pass / `0` fail. It is `55`.

The reviewer is right. The correct figures, which it re-derived and which I had
measured independently before dispatching it:

    loop/tests/runner-policy.test.mjs      20
    loop/tests/conformance.test.mjs        16
    loop/tests/portability.test.mjs        15
    scripts/no-change-dir-refs.test.mjs     4
                                          ---
                                           55 tests, 55 pass, 0 fail

**THE RECORD IS CORRECTED HERE: the round-2 affected-file run is 55/55/0, not
56/56/0.** Every other number in `RESULT2.md` was re-derived and holds,
including all five restoration hashes and the mutation table's red counts. The
error is arithmetic in one prose sentence — the report's own mutation table
carries 20, 16, 15 and 4, which sum to 55. No instrument was miscounted.

## Why this closes rather than opening a round 3

The exit condition (Stage 0 preamble, the architect's ruling at B2 round 3)
approves when four things hold. All four hold:

1. **Every named mutation of every prior review goes red under the reviewer,
   re-run rather than trusted.** All five of round 1's did. The reviewer also
   handled the one that must NOT go red correctly: round 1's finding-1 mutation
   (the generic refusal string) stays green BY DESIGN once the entry count is
   its own returned field, and the reviewer reported it as green-by-design and
   non-blocking while showing the count-field mutation red. That distinction
   was the thing most likely to be misjudged this round.
2. **The round's diff is within its scope.** Exactly the five permitted tracked
   files from `df44897`, exactly the nine-file merge-base list from `ddbfd52`.
   No `runners.yml`, no `data/` path.
3. **The standing properties hold.** The reviewer found each instrument itself
   and ran it: `portability.test.mjs` 15/15, `no-change-dir-refs.test.mjs` 4/4.
4. **The author's completed full suite on the final tip is green** — 1,817 of
   1,817, arithmetically consistent with round 1's 1,814 plus three net tests.

Beyond those, the reviewer mutated THREE changed lines the author's sweep did
not name, and all three went red: `loop/conformance.mjs:415` (append replaced
by overwrite) 13/3, `loop/lib/runners.mjs:179` (array history normalised to
empty) 6/10, `loop/lib/select.mjs:289` (a disabled escalation target returned
instead of `null`) 19/1. **No green mutant was found.**

The single finding is a defect in the PROSE of a file that is never committed.
`RESULT2.md` is banked as evidence and is not part of the merge. A round 3
would spend a dispatch at max to change one digit in an uncommitted report,
while the tree it describes is already correct and independently verified. The
count rule that makes it a must-fix is satisfied by correcting the count — and
it is corrected above, on the record, where a later reader finds it beside the
report rather than in a conversation.

This is the same shape as packet D's round 2, which returned `revise` on report
completeness only and was closed by an addendum.

## The one thing worth carrying forward

I found this discrepancy myself before dispatching the review, and I
deliberately did NOT declare it in the review brief — the brief instead
required every count in `RESULT2.md` to be re-derived, with both figures quoted
wherever they differed, "however small the gap". The reviewer found it
unprompted and its four per-file numbers match mine exactly. So this is an
independent confirmation rather than a relayed measurement, and it is also a
measurement OF THE REVIEWER: the instruction to re-derive was followed rather
than performed.

That matters because the same defect class — a number in a record that does not
match its instrument — was found the same day in merged packet G, whose task 27
reports "10 of 11 red" where the banked tables show 1 of 10. There the wrong
number went unchallenged into the committed record. Here it was caught twice
before merge.
