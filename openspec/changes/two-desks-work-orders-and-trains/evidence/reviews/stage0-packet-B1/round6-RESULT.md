# Stage 0 packet B1, round 6

Date: 2026-09-08 (machine local date).

## Changed file

- `loop/tests/brief-excerpt-budget.test.mjs:357`: the `ex.chars` assertion now reports the emitted length and cap.
- `loop/tests/brief-excerpt-budget.test.mjs:375-379`: the separator-count assertion now reports the emitted length and cap instead of dumping the emitted text.
- `loop/tests/brief-excerpt-budget.test.mjs:395`: the full-constitution-floor arm now requires the fixture's exact diagnostic: shortfall `33`, cap `800`, and minimum `833`, plus all three marker names.

No production file changed. `loop/tests/portability.test.mjs` was not touched.

## Mutation evidence

All counts below are from the targeted test file in this worktree, using TAP output and the reported `tests`/`pass`/`fail` totals.

### Item 1 — exact shortfall, cap, and minimum

The clean fixture arm is `a cap below the full constitution minimum accounts for structural overhead`, with fixture-tree values: cap `800`, three-marker constitution minimum `833`, and shortfall `33`. The live tree's floor is a different value and is not used by this assertion.

Mutation: in `loop/lib/specs.mjs:346`, replace `const shortfall = floorMinimumTotal - maxChars;` with `const shortfall = 1;`.

RED: targeted run reported `tests 23`, `pass 22`, `fail 1`; the arm failed because the actual error was `marker shortfall=1; maxChars=800` below the fixture-tree `833` minimum, while the assertion requires the fixture-tree shortfall `33`, cap `800`, and minimum `833`.

Restoration: restored the original expression. `loop/lib/specs.mjs` SHA-256 after restoration is `513400FD3352BBC873F64813A8F46E76F2F1991972172E8161A0A59A9D158A53`, identical to its pre-mutation worktree hash.

### Item 2 — emitted length and cap in both diagnostics

The clean allocation-fixture arm emits length `23145` under cap `24000`. The clean tight-cap fixture arm emits length `900` under cap `900` and contains two separators.

Mutation A: in `loop/lib/specs.mjs:427`, replace `chars: renderExcerpt(plan, rendered).length` with `chars: 0`.

RED: targeted run reported `tests 23`, `pass 21`, `fail 2`. The first failure was the arm at `brief-excerpt-budget.test.mjs:357`, with `emitted length 23145, cap 24000; chars field mismatch` and `0 !== 23145`. The second failure was the existing later cap-related `ex.chars` assertion in the tight-cap arm; the new earlier diagnostic still carried both required numbers.

Restoration: restored the production expression. `loop/lib/specs.mjs` SHA-256 was again `513400FD3352BBC873F64813A8F46E76F2F1991972172E8161A0A59A9D158A53`, identical to the pre-mutation hash.

Mutation B: in `loop/lib/specs.mjs:268`, replace the separator join `\\n\\n---\\n\\n` with `\\n\\n---\\n`.

RED: targeted run reported `tests 23`, `pass 22`, `fail 1`. The tight-cap arm failed at `brief-excerpt-budget.test.mjs:375` with `emitted length 898, cap 900; expected two separators` and `0 !== 2`.

Restoration: restored the original separator join. `loop/lib/specs.mjs` SHA-256 remained `513400FD3352BBC873F64813A8F46E76F2F1991972172E8161A0A59A9D158A53`, identical to the pre-mutation hash.

## Restoration check

After all mutations were restored, the targeted file reported `tests 23`, `pass 23`, `fail 0`, duration `16988.6883 ms` (`16.989 s`). The production hash matched its pre-mutation SHA-256, and only the permitted test file plus this report are authored by this packet; pre-existing untracked review/brief files were left untouched.

## Full suite

`npm test` ran exactly once at the end. The wrapper discovered 122 test files and the full Node test run completed with `tests 1727`, `pass 1727`, `fail 0`, exit 0. Local wall-clock duration was `419285 ms` (`419.285 s`), from `2026-09-08 20:54:20` to `2026-09-08 21:01:19`. The count is asserted against the reported zero failure status; no timeout occurred.
