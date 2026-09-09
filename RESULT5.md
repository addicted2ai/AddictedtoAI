# Stage 0, packet B1, Round 5

Author worktree: `D:/addictedtoai-worktrees/fleet6-stage0-B1`  
Branch: `stage0/b1-brief-diet`  
Merge base: `fbe1306`  
Authority was read read-only from `D:/AddictedToAI` at `4d86826`.

No production change was needed. The only code/test change is in
`loop/tests/brief-excerpt-budget.test.mjs`. The temporary probe file
`.brief-budget-probe.mjs` was deleted after measurement.

## Changes

- `loop/tests/brief-excerpt-budget.test.mjs:130-136`: added
  `pendingChunkCorpus`, with a constitution chunk and a pending chunk sized to
  bind the pending-chunk overhead calculation.
- `loop/tests/brief-excerpt-budget.test.mjs:286-300`: added a pending-chunk
  arm whose failure names both emitted length and cap; also checked the
  existing binding fixture's excerpt length against its 24,000-character cap.
  The 24,000-character value is the fixture/test configuration cap, not the
  live-tree floor.
- `loop/tests/brief-excerpt-budget.test.mjs:357`: asserted
  `ex.chars === ex.text.length` while retaining the existing emitted-length
  cap assertion. The observed 23,145-character value is from the allocation
  fixture tree.
- `loop/tests/brief-excerpt-budget.test.mjs:375-377`: asserted the two
  `\n\n---\n\n` separators in the three-chunk tight-cap fixture and retained the
  900-character emitted-length cap assertion. The 900-character value is from
  the fixture tree.
- `loop/tests/brief-excerpt-budget.test.mjs:390-397`: added an 800-character
  cap arm asserting the structural-overhead shortfall. The fixture tree's
  three-marker minimum is 833 characters; 800 is below that full minimum and
  above the marker-only minimum.

## Mutation proofs

Each clean targeted run was the real output of
`node --test --test-reporter=tap loop/tests/brief-excerpt-budget.test.mjs`:
23 tests, 23 pass, 0 fail.

1. `chars: 0`

   The clean cap arms passed with 23 tests, 23 pass, 0 fail. The named
   mutation was applied at `loop/lib/specs.mjs`, changing the returned value
   to `chars: 0`.

   RED output: 23 tests, 21 pass, 2 fail. Both failures were the new
   `ex.chars` assertions: `0 !== 23145` in the allocation fixture tree and
   `0 !== 900` in the tight-cap fixture tree.

   The production expression was restored. SHA-256 after restoration:
   `513400FD3352BBC873F64813A8F46E76F2F1991972172E8161A0A59A9D158A53`.

2. Omitted pending-chunk overhead

   The clean pending-chunk arm passed with 23 tests, 23 pass, 0 fail. The
   named mutation removed `- overhead` from
   `const budget = maxChars - before.length - overhead` in
   `loop/lib/specs.mjs`.

   RED output: 23 tests, 22 pass, 1 fail. The pending-chunk arm reported:
   `pending excerpt emitted length 9069 exceeds cap 8600`.
   The 8,600-character cap and 9,069-character emitted result are from the
   pending-chunk fixture tree.

   The production expression was restored. SHA-256 after restoration:
   `513400FD3352BBC873F64813A8F46E76F2F1991972172E8161A0A59A9D158A53`.

3. `floorOverhead = 0`

   The clean structural-overhead arm passed with 23 tests, 23 pass, 0 fail.
   The named mutation replaced the `floorOverhead` calculation in
   `loop/lib/specs.mjs` with `0`.

   RED output: 23 tests, 21 pass, 2 fail. The tight-cap fixture arm reported
   `emitted length 1295 exceeds cap 900`; the new 800-character arm reported
   `Missing expected exception`. The fixture tree's three-marker minimum is
   833 characters; the 800-character cap is explicitly from that fixture
   tree, not from the live tree. The live-tree floor cited by the task is 853
   characters.

   The production calculation was restored. SHA-256 after restoration:
   `513400FD3352BBC873F64813A8F46E76F2F1991972172E8161A0A59A9D158A53`.

4. `.join('')`

   The clean multi-chunk arm passed with 23 tests, 23 pass, 0 fail. The named
   mutation changed `.join('\n\n---\n\n')` to `.join('')` in
   `loop/lib/specs.mjs`.

   RED output: 23 tests, 22 pass, 1 fail. The multi-chunk fixture arm reported
   expected separator count `2` and actual count `0`, and included the
   emitted text showing adjacent chunks without separators.

   The production join expression was restored. SHA-256 after restoration:
   `513400FD3352BBC873F64813A8F46E76F2F1991972172E8161A0A59A9D158A53`.

## Full suite

The single completed full-suite attempt was:

```text
npm test
tests 1727
pass 1727
fail 0
duration_ms 460661.7674
local wall-clock duration_ms 461308
```

No build, verify-* command, Pulse, push, merge, or bead close/update was run.
