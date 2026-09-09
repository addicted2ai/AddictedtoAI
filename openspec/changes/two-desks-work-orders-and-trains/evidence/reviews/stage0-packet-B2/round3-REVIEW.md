# Stage 0 packet B2 — round 3 (delta) — VERDICT: revise

## Sealing

I read `REVIEW2.md`, `RESULT3.md`, and `.agent-brief.md`. This is a delta
review, and I was not sealed from `REVIEW2.md`; its six findings were supplied
as review context. I also read the round-3 test diff, the merge-base production
diff, the named production/test files, `loop/tests/portability.test.mjs`, and
`scripts/no-change-dir-refs.test.mjs`.

## Findings

1. `loop/tests/brief.test.mjs:236-258` — same-constitution cited-section
   omission is still unarmed. The separator test checks only that the rendered
   result fits the cap and that `chars` agrees with its text. Mutating
   `loop/lib/specs.mjs:355-357` to append `.slice(0, 1)` made the implementation
   drop the second cited constitution heading, yet all 12 brief tests passed.
   Assert both requested headings (and their required order or exact heading
   set) in this test so that the mutation fails. CLASS: test coverage — cited
   requirement omission.

2. `loop/tests/brief.test.mjs:261-288` — the truncation arm does not prove that
   the excerpt cap binds. It asserts `truncated` and the reader notice, but not
   `excerpt.text.length === excerpt.chars <= maxChars`. Replacing the changed
   overhead calculation at `loop/lib/specs.mjs:421-429` with
   `const floorOverhead = 0` left the test green, despite allowing rendered
   chunk overhead outside the advertised cap. Assert the size invariant on the
   over-budget excerpt (and that the full fixture is larger) so this mutant
   goes red. CLASS: test coverage — excerpt-budget invariant.

3. `loop/tests/review.test.mjs:364-388` — C46 checks that the revision sections
   exist and that the ground-rule tail follows the excerpt marker, but it does
   not check the required order of DIFF under revision before Relevant spec
   excerpts. Moving the complete excerpt block before the diff block in
   `loop/lib/brief.mjs:798-812` left the focused C46 test green. Assert the
   section indexes in the required sequence (verdict, acceptance, diff,
   excerpts, ground rules, result protocol). CLASS: test coverage — revision
   brief section ordering.

4. `loop/lib/specs.mjs:169` — the `(preamble) is not a heading` rule is only
   documented by the new reviewer-template assertion; no citation gate test
   exercises it. Mutating the exclusion to `headings.add(section.heading)` left
   all five citation-focused review tests green, so a verdict citing
   `(preamble)` could be accepted. Add a fixture citation of `(preamble)` and
   assert `mergeGate` refuses it with `cites-unresolved` (and, if direct
   excerpt behavior is tested, that heading mode does not emit it). CLASS: test
   coverage — exact requirement-heading validation.

## The six arms, re-run

All six named arms went red under the current production code mutation and
green after immediate restoration. No arm went red against the unmutated code.
Finding 6 has the two named forwarding mutations.

1. Finding 1 — `loop/lib/specs.mjs:166`,
   `liveSpecCapabilities(repoRoot)` → `['loop']`.

   Command: `node --test --test-reporter=tap --test-name-pattern="cites from an outside capability" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs`

   RED: `1..1; # tests 1; # pass 0; # fail 1` (the outside constitution and
   pending headings were reported unresolved).

   Restored SHA-256 for `specs.mjs`:
   `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D`.
   GREEN with the same command: `1..1; # tests 1; # pass 1; # fail 0`.

2. Finding 2 — `loop/lib/specs.mjs:370-373`, heading-mode delta
   `candidates` → `[]`.

   Command: `node --test --test-reporter=tap --test-name-pattern="cited pending amendment follows" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs`

   RED: `1..1; # tests 1; # pass 0; # fail 1` (the pending marker no longer
   followed the constitution heading).

   Restored SHA-256 for `specs.mjs`:
   `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D`.
   GREEN with the same command: `1..1; # tests 1; # pass 1; # fail 0`.

3. Finding 3 — `loop/lib/specs.mjs:426`, internal separator charge → `0`.

   Command: `node --test --test-reporter=tap --test-name-pattern="charge the separator" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs`

   RED: `1..1; # tests 1; # pass 0; # fail 1`; the assertion reported
   `cap=427; text.length=429; chars=429`.

   Restored SHA-256 for `specs.mjs`:
   `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D`.
   GREEN with the same command: `1..1; # tests 1; # pass 1; # fail 0`.

4. Finding 4 — `loop/lib/specs.mjs:501-502`, heading-mode truncation
   expression → `const truncated = false`.

   Command: `node --test --test-reporter=tap --test-name-pattern="heading-mode truncation" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs`

   RED: `1..1; # tests 1; # pass 0; # fail 1` (the over-budget fixture no
   longer reported truncation).

   Restored SHA-256 for `specs.mjs`:
   `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D`.
   GREEN with the same command: `1..1; # tests 1; # pass 1; # fail 0`.

5. Finding 5 — `loop/lib/brief.mjs:734`,
   `String(verdict.notes ?? '').trim()` → `''`.

   Command: `node --test --test-reporter=tap --test-name-pattern="revision verdict separates ordinary notes" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs`

   RED: `1..1; # tests 1; # pass 0; # fail 1` (the ordinary note was no
   longer under Free-form notes).

   Restored SHA-256 for `brief.mjs`:
   `7ADACA70377586875451BD81D9980FC84C2DEDB8AE105F1B3402DEEE5FCD83D2`.
   GREEN with the same command: `1..1; # tests 1; # pass 1; # fail 0`.

6. Finding 6a — `loop/run.mjs:741`, revision `findings` → `''`.

   Command: `node --test --test-reporter=tap --test-name-pattern="revision prompt carries the reviewer finding" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs`

   RED: `1..1; # tests 1; # pass 0; # fail 1` (the prompt lost the
   diff-measured refusal reason).

   Finding 6b — `loop/run.mjs:742`, revision `diffText` → `''`, with the same
   command.

   RED: `1..1; # tests 1; # pass 0; # fail 1` (the prompt lost the distinctive
   judged-diff content).

   Restored SHA-256 for `run.mjs`:
   `1E0B8769E6226D10921E928E1B10663B9841EA9468DAC06117E5689152B4E40F`.
   GREEN after each restoration with the same command: `1..1; # tests 1;
   # pass 1; # fail 0`.

## The sweep, checked

These are additional changed production regions not covered by the six new
finding arms. Every command used TAP and its test count was checked.

1. `loop/lib/brief.mjs:814-816`: removed the revision
   `${GROUND_RULES}` and `${RESULT_PROTOCOL_INSTRUCTION}` tail.

   Command: `node --test --test-reporter=tap --test-name-pattern="C46 the revision brief supersedes" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs`

   RED: `1..1; # tests 1; # pass 0; # fail 1` (the ground-rule-tail assertion
   failed). Restored SHA-256 for `brief.mjs`:
   `7ADACA70377586875451BD81D9980FC84C2DEDB8AE105F1B3402DEEE5FCD83D2`;
   restored GREEN: `1..1; # tests 1; # pass 1; # fail 0`.

2. `loop/lib/specs.mjs:408`: empty-plan `truncated` → `false`.

   Command: `node --test --test-reporter=tap --test-name-pattern="unresolved cited heading with no live sources" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs`

   RED: `1..1; # tests 1; # pass 0; # fail 1`. Restored SHA-256 for
   `specs.mjs`: `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D`;
   restored GREEN: `1..1; # tests 1; # pass 1; # fail 0`.

3. `loop/lib/specs.mjs:444`: zero-budget heading-mode `truncated` → `false`.

   Command: `node --test --test-reporter=tap --test-name-pattern="heading-mode zero budget" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs`

   RED: `1..1; # tests 1; # pass 0; # fail 1`. Restored SHA-256 for
   `specs.mjs`: `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D`;
   restored GREEN: `1..1; # tests 1; # pass 1; # fail 0`.

4. `loop/lib/specs.mjs:355-357`: constitution candidates →
   `constitutionSections.filter(...).slice(0, 1)`.

   Command: `node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs`

   GREEN MUTANT: `1..12; # tests 12; # pass 12; # fail 0`, although the
   two-heading fixture silently omitted one cited heading. Restored SHA-256 for
   `specs.mjs`: `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D`;
   restored GREEN: `1..12; # tests 12; # pass 12; # fail 0`.

5. `loop/lib/specs.mjs:421-429`: entire `floorOverhead` calculation →
   `0`.

   Command: `node --test --test-reporter=tap --test-name-pattern="heading-mode truncation" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs`

   GREEN MUTANT: `1..1; # tests 1; # pass 1; # fail 0`; the truncation test
   noticed a cut but did not notice the cap was no longer binding. Restored
   SHA-256 for `specs.mjs`:
   `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D2`;
   restored GREEN: `1..1; # tests 1; # pass 1; # fail 0`.

6. `loop/lib/brief.mjs:798-812`: moved the complete Relevant spec excerpts
   block before the Diff under revision block.

   Command: `node --test --test-reporter=tap --test-name-pattern="C46 the revision brief supersedes" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs`

   GREEN MUTANT: `1..1; # tests 1; # pass 1; # fail 0`; section presence and
   tail assertions did not detect the order violation. Restored SHA-256 for
   `brief.mjs`: `7ADACA70377586875451BD81D9980FC84C2DEDB8AE105F1B3402DEEE5FCD83D2`;
   restored GREEN: `1..1; # tests 1; # pass 1; # fail 0`.

7. `loop/lib/specs.mjs:169`: included `(preamble)` in the live heading set.

   Command: `node --test --test-reporter=tap --test-name-pattern="cites|unresolved cites" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs`

   GREEN MUTANT: `1..5; # tests 5; # pass 5; # fail 0`; no existing citation
   test cites the preamble. Restored SHA-256 for `specs.mjs`:
   `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D`;
   restored GREEN: `1..5; # tests 5; # pass 5; # fail 0`.

## What I checked that was sound

- `git diff --name-status 6502b98..HEAD` contains only
  `loop/tests/brief.test.mjs` and `loop/tests/review.test.mjs`; the round has no
  tracked scope violation.
- The outside-capability arm covers both a constitution and a pending heading,
  on both approve and revise. The pending-body arm uses a sentinel absent from
  the constitution and checks its position after the pending marker.
- The ordinary-note arm distinguishes the Free-form notes section from the
  diff-measured refusal section, and the C46 integration arm captures the real
  revision prompt, including the reviewer finding and judged diff.
- The author’s final committed-tip full-suite evidence in `RESULT3.md` is a
  completed iteration after `e413ebe`: `tests 1769`, `pass 1769`, `fail 0`,
  `cancelled 0`, `skipped 0`, `todo 0`. This reviewer did not run the full suite
  because the review hard limit forbids it.
- `loop/tests/portability.test.mjs` enforces the no-model/provider/harness and
  no-machinery-runner-id properties. `scripts/no-change-dir-refs.test.mjs`
  enforces the no-unarchived-change-directory-reference property. Both passed.
- The final targeted review/brief run passed 45/45, and `git diff --check`
  produced no output. After restoration the four production hashes were
  `specs.mjs` `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D`,
  `brief.mjs` `7ADACA70377586875451BD81D9980FC84C2DEDB8AE105F1B3402DEEE5FCD83D2`,
  `review.mjs` `C71DF868483C018390D5045C198F0427438580584B6C4714AD1034C9C56DE798`,
  and `run.mjs` `1E0B8769E6226D10921E928E1B10663B9841EA9468DAC06117E5689152B4E40F`.

## What I ran

All test commands below were run with `--test-reporter=tap`; the reported
`1..N` and `# tests N` counts were checked, not inferred from exit status.

```text
git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 status --short --branch
Output: ## stage0/b2-cited-revision; only the supplied untracked review
artifacts were present.

git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 log --oneline --decorate -6
Output: e413ebe at HEAD, followed by 7999203, a5de24b, 6502b98, 9630614,
5fb9b2b.

git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 diff --stat 6502b98..HEAD
git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 diff --name-status 6502b98..HEAD
Output: 213 insertions, 3 deletions; exactly the two permitted test paths.

node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs
Final output: 1..45; # tests 45; # pass 45; # fail 0; # cancelled 0;
# skipped 0; # todo 0.

node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/portability.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-B2/scripts/no-change-dir-refs.test.mjs
Output: 1..16; # tests 16; # pass 16; # fail 0; # cancelled 0;
# skipped 0; # todo 0.

git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 diff --check
Output: no output, exit 0.

git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 rev-parse HEAD
Output: e413ebe5d6e30ea35a5f37cf48cde6a9d2be30fb

git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 merge-base HEAD de400f7
Output: de400f7da552b3c298f3cb9ec189c012a9de0ed7

Get-FileHash -Algorithm SHA256 D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/lib/specs.mjs
Get-FileHash -Algorithm SHA256 D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/lib/brief.mjs
Get-FileHash -Algorithm SHA256 D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/lib/review.mjs
Get-FileHash -Algorithm SHA256 D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/run.mjs
Output: the four hashes listed above in “What I checked that was sound”.
```

The full suite, build, verify scripts, Pulse, and Desk were not run, per the
review hard limits. No git/beads state was changed, and no temporary probe file
was created.
