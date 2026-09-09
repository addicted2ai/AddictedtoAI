# Stage 0 packet B1 ROUND 5 — VERDICT: revise

## Findings

1. `loop/tests/brief-excerpt-budget.test.mjs:390-395` does not pin the
   structural-overhead shortfall it claims to assert. The arm accepts any
   digits after `marker shortfall=`. I mutated `loop/lib/specs.mjs:346` from
   `floorMinimumTotal - maxChars` to `1`; the targeted suite stayed green at
   `23 tests, 23 pass, 0 fail`, even though the real fixture is
   `maxChars=800`, minimum `833`, shortfall `33`. Make the arm assert the
   expected relationship/value, including the cap and minimum, so a wrong
   diagnostic cannot pass.

2. The stated portability property covers `loop/`, `lib/`, `pulse/`,
   `scripts/`, `app/`, and `tools/`, including comments, strings, and test
   names, but the discoverable enforcement is narrower. In
   `loop/tests/portability.test.mjs:107-110`, model/provider/harness-name
   scanning covers only `loop/` and `data/config.json`; at `:127-132`, runner
   ID scanning covers only `loop/`, `pulse/`, `scripts/`, and config, omitting
   `app/`, `tools/`, and any repository-level `lib/` target. The test passes
   (`12/12`), but a forbidden registered name added under an omitted path
   would still pass. Extend the enforcement to the complete property (or make
   an explicit, authority-level exception and test that exception).

3. The new cap-related diagnostics are incomplete at
   `loop/tests/brief-excerpt-budget.test.mjs:357` and `:375`. The `chars`
   equality assertion uses the default `0 !== 23145` style message, and the
   separator assertion passes only the raw emitted text. If either assertion
   fails before the later cap assertion, the failure does not state both the
   emitted length and the cap as required by the packet. Give each arm an
   explicit message containing the emitted length and cap.

## The four obligations

1. `chars` is pinned by `:357` and `:377` with `ex.chars === ex.text.length`,
   while the cap checks use `ex.text.length`. Clean: `23 tests, 23 pass,
   0 fail`. With `loop/lib/specs.mjs:427` mutated from the emitted length to
   `chars: 0`: `23 tests, 21 pass, 2 fail`; the two failures were `0 !== 23145`
   and `0 !== 900`. The fixture states were reached. Restored; `specs.mjs`
   returned to SHA-256
   `513400FD3352BBC873F64813A8F46E76F2F1991972172E8161A0A59A9D158A53`.

2. Pending-chunk overhead is pinned by `:294-300`, especially the emitted
   length assertion at `:299` with cap `8600`. Clean: `23/23/0`. Removing
   `- overhead` from `loop/lib/specs.mjs:388` produced `23 tests, 22 pass,
   1 fail`: `pending excerpt emitted length 9069 exceeds cap 8600`. The
   pending fixture reached the state; this is a real red arm. Restored to the
   same `specs.mjs` hash above.

3. Structural overhead is pinned by `:390-396` at cap `800`, while the
   existing marker-only case remains at cap `1`. Clean: `23/23/0`. Replacing
   `floorOverhead` at `loop/lib/specs.mjs:342-343` with `0` produced `23
   tests, 21 pass, 2 fail`: the tight-cap arm reported `emitted length 1295
   exceeds cap 900`, and the new cap-800 arm reported `Missing expected
   exception`. The fixture reaches the between-minima state. The deliberate
   wrong-shortfall mutation described in Finding 1 stayed green, so the
   state is reached but the diagnostic number is not defended. Restored to
   the same `specs.mjs` hash.

4. The inter-chunk separator is pinned by `:375` in the three-chunk tight-cap
   fixture, expecting two `\n\n---\n\n` separators, while `:376` retains the
   emitted-length cap. Clean: `23/23/0`. Changing
   `loop/lib/specs.mjs:268` from `.join('\n\n---\n\n')` to `.join('')` produced
   `23 tests, 22 pass, 1 fail`: expected separator count `2`, actual `0`,
   with adjacent chunks visible in the failure text. Restored to the same
   `specs.mjs` hash.

## The diff as the list

I used `fbe1306..HEAD`, not `main..HEAD`. HEAD is `bcea121`; the confirmed
merge base is `fbe13066d1458effcc76451dbea0ac6157fcd995`. The round-5 own diff
is only `RESULT5.md` and `loop/tests/brief-excerpt-budget.test.mjs`; the
production functions below are the earlier behavioral changes included in the
packet diff from the merge base.

The changed production functions and isolated mutation results were:

- `inFlightChanges` (`loop/lib/specs.mjs:52-63`): ignoring `pendingRoot`
  produced `23/18/5`, including missing pending amendments and wrong file
  counts. Restored to the clean hash.
- `deltaPaths` (`:72-79`): dropping the alternate root from its
  `inFlightChanges` call produced `23/18/5`. Restored to the clean hash.
- `specSources` (`:100-107`): dropping `pendingRoot` when calling
  `deltaPaths` produced `23/18/5`. Restored to the clean hash.
- `cutMarker` (`:194-198`): replacing the heading with `"wrong heading"`
  produced `23/21/2`; binding and tight-cap marker assertions failed.
- `cutTo` (`:201-205`): slicing to `budget` before appending the marker
  produced `23/22/1`; the tight-cap cut count became `1` instead of `3`.
- `cutTail` (`:208-210`): returning an empty string instead of a fitting
  marker produced `23/21/2`; pending amendment output disappeared.
- `capabilityFromSubject` (`:235-244`): rejecting an exact capability name
  produced `23/22/1`; the declared-subject test lost `specs/site`.
- `excerptOptions` (`:246-253`): discarding object options produced
  `23/11/12`; cap, pending-root, and subject-option tests failed.
- `floorMinimum` (`:255-257`): changing `Math.min` to `Math.max` produced
  `23/19/4`; ordinary and tight-cap fixtures failed with false shortfalls.
- `renderExcerpt` (`:259-268`): the separator mutation above produced
  `23/22/1`.
- `excerptsFor` (`:288-428`): its cap accounting, floors, rendering, result
  count, pending-root, subject, and truncation behavior are exercised by the
  arms listed above and by tests 5–22. The wrong-shortfall mutation at `:346`
  is the one changed behavior that stayed green and is Finding 1.
- `assembleBrief` (`loop/lib/brief.mjs:645-666`): forcing
  `pendingRoot: null` produced `23/22/1` (the binding fixture lost its
  pending amendment); using `job.subjects` instead of the required empty
  Stage-0 list produced `23/22/1` (the fallback test admitted `specs/site`).
- `assembleBrief` guidance (`loop/lib/brief.mjs:719-720`): restoring the old
  `targeted and truncated` wording produced `23/22/1`; test 21 failed.
- `BRIEF_EXCERPT_MAX_CHARS` (`loop/lib/config.mjs:304`): changing `24000`
  to `88000` produced `23/20/3`, including the exact ceiling assertion.

`chunkHeading` and `scoredSections` have comment-only changes in this diff;
their executable behavior did not change. `RESULT5.md` is a report, not
runtime behavior. The changed test helpers and assertions were exercised by
the same 23-test target; the diagnostic weakness in the new structural arm is
reported above rather than treated as a green proof.

## The properties, and what I found enforced them

- Model/provider/harness/runner portability: the discoverable check is
  `loop/tests/portability.test.mjs`. I ran it and got `12 tests, 12 pass,
  0 fail`. Its loop/config name scan and machinery runner-ID scan are
  explicitly narrower than the property stated in this packet; that gap is
  Finding 2. I did not treat a passing narrower scan as proof of the larger
  universal claim.

- Change-directory references: `scripts/no-change-dir-refs.test.mjs` scans
  `lib`, `loop`, `pulse`, `scripts`, `app`, and `tools` source files and has a
  fixture for bad versus archived literals. I ran it: `3 tests, 3 pass,
  0 fail`. The excerpt fixture uses `fixture-amendments`, not
  `openspec/changes/<name>/`; the operational discovery paths are the
  check's justified allow-list. I found no unallowed current reference.

- Permitted files: `git diff --name-status 0e6b455..HEAD` reported only
  `A RESULT5.md` and `M loop/tests/brief-excerpt-budget.test.mjs`. The round-5
  diff contains no `package.json`, `loop/run.mjs`, or production-file change.
  The final hashes of every temporarily mutated tracked file match their
  pre-mutation values.

## What I checked that was sound

- The pinned corpus has all job-type capabilities, compares the whole heading
  set without filtering, keeps unrelated sections out, and exercises three
  pending amendments. Those tests passed.
- The four requested fixtures genuinely reach their claimed states: every
  named production mutation went red, and the wrong-shortfall mutation was the
  explicit exception that stayed green.
- An independent below-minimum probe, built outside the test file, returned:
  `Error: excerpt configuration error: marker shortfall=33; maxChars=800 is
  below the 833-character constitution marker, heading, and separator minimum
  for "pulse governing rule", "site governing rule", "review governing rule"`.
  It failed loudly as an error, not a warning or degraded result. I deleted
  `.review5-below-minimum.mjs` immediately; `Test-Path` confirmed `False`.
- The final clean targeted run was `23 tests, 23 pass, 0 fail`. It also
  measured the live tree as largest `41043`, with cuts in `post,repair,prune`;
  this is measurement, not a live-tree assertion.
- No build, full `npm test`, verify-* script, Pulse, merge, push, or bead
  operation was run.

## Was the brief faithful to the task and the requirement?

Mostly yes. It correctly made round 5 test-only, required the four named
mutations, retained the fixture/live-tree distinction, required TAP counts and
hash restoration, and prohibited an author mutation table in this round. The
implementation is narrow and the four primary arms are real. It does not,
however, make the shortfall diagnostic exact, and the repository-wide
portability property named for review is not fully enforced by the discovered
test.

## Did you read REVIEW.md, REVIEW2.md, REVIEW3.md or REVIEW4.md?

- `REVIEW.md`: no — not before or after writing these findings.
- `REVIEW2.md`: no — not before or after writing these findings.
- `REVIEW3.md`: no — not before or after writing these findings.
- `REVIEW4.md`: no — not before or after writing these findings.

## What I ran

All targeted test commands used absolute paths and the TAP reporter:

- `git -C D:/addictedtoai-worktrees/fleet6-stage0-B1 rev-parse --short HEAD`
  → `bcea121`.
- `git -C D:/addictedtoai-worktrees/fleet6-stage0-B1 merge-base main HEAD`
  → `fbe13066d1458effcc76451dbea0ac6157fcd995`.
- `node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-B1/loop/tests/brief-excerpt-budget.test.mjs`
  → final clean `tests 23`, `pass 23`, `fail 0`; the four required red runs
  were `21/2`, `22/1`, `21/2`, and `22/1` respectively.
- `node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-B1/loop/tests/portability.test.mjs`
  → `tests 12`, `pass 12`, `fail 0`.
- `node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-B1/scripts/no-change-dir-refs.test.mjs`
  → `tests 3`, `pass 3`, `fail 0`.
- `node D:/addictedtoai-worktrees/fleet6-stage0-B1/.review5-below-minimum.mjs`
  → the exact shortfall error quoted above; the probe was then deleted.
- `Get-FileHash -Algorithm SHA256` after every restoration returned:
  `specs.mjs 513400FD3352BBC873F64813A8F46E76F2F1991972172E8161A0A59A9D158A53`,
  `brief.mjs B3B1EA731CBDFD31C1903C364B70CF18F9F41FA564EC3A435F6401EB994B45FE`,
  `config.mjs F54F4E28F1604A5DCD55FBED1DBC81191DCCA185D9B7AF6AC2B960D6ABC9303C`,
  and `brief-excerpt-budget.test.mjs 17C52642C09E57902D6718B73622C17008604A492D4740372725F5FECE0DA694`.
- `git status --short` after review showed only the pre-existing untracked
  `.agent-brief.md` and `REVIEW.md`–`REVIEW4.md`; `REVIEW5.md` is this file.
- `git diff --check 0e6b455..HEAD` reported only the intentional Markdown
  hard-break spaces on RESULT5 lines 3–5.
