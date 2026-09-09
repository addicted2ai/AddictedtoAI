# Stage 0 packet B1 round 4 — VERDICT: revise

## Findings

1. `loop/lib/specs.mjs:427` returns the right value, but no test asserts the
   `chars` contract. I mutated `chars: renderExcerpt(plan, rendered).length`
   to `chars: 0`; the targeted suite still reported `tests 21`, `pass 21`,
   `fail 0`, exit 0. The two cap arms correctly assert `ex.text.length`, but
   that does not prove `chars` equals the emitted length. Add an assertion of
   `ex.chars === ex.text.length` while retaining the cap assertions on
   `ex.text.length`.

2. `loop/lib/specs.mjs:384-388` charges the heading/separator overhead of a
   pending chunk, but no arm reaches that accounting line. I mutated
   `const budget = maxChars - before.length - overhead` to omit `- overhead`;
   all `21` tests still passed. The binding fixture at
   `loop/tests/brief-excerpt-budget.test.mjs:275-281` only checks that the
   whole assembled brief is under `30000` and that a pending heading exists;
   it never checks the pending excerpt's emitted length against its cap. Add a
   pending-chunk fixture/arm whose failure message reports both emitted length
   and cap and which goes red when that overhead is removed.

3. `loop/tests/brief-excerpt-budget.test.mjs:359-364` uses `maxChars: 1` for
   the below-minimum test. That cap is below the marker-only minimum as well
   as the full emitted minimum, so it cannot prove that structural overhead is
   part of the loud-failure threshold. On a separately constructed
   three-capability corpus, clean `maxChars=800` raised
   `shortfall=3` with a computed minimum of `803`; after mutating
   `loop/lib/specs.mjs:342-345` to `floorOverhead = 0`, the same input returned
   green with `length=1180`, `chars=1180`. Add a cap between the marker-only
   and full emitted minima (the clean probe used `800`) and assert the error and
   shortfall.

4. `loop/lib/specs.mjs:268` emits the inter-chunk separator, but
   `loop/tests/brief-excerpt-budget.test.mjs:344-355` does not assert that it is
   present. Mutating `.join('\n\n---\n\n')` to `.join('')` left the full
   targeted suite green at `tests 21`, `pass 21`, `fail 0`. Assert the
   separator in a multi-chunk fixture, while keeping the emitted-length cap
   assertion.

5. The enforcement for the portability property is narrower than the
   property stated for this review. `loop/tests/portability.test.mjs:107-110`
   scans registered ids/providers/models/harnesses only under `loop/` and
   `data/config.json`; `:127-132` scans `loop/`, `pulse/`, and `scripts/` only
   for runner ids. It does not scan `lib/`, `app/`, or `tools/`, nor does the
   second check scan those paths for provider/model/harness names. A wrong
   world with a registered model/provider/harness name in `lib/`, `app/`, or
   `tools/` passes the current `12/12` portability suite. Make the check cover
   every directory and identity field named by the property, or explicitly
   revise the property before relying on this gate.

6. The change-directory enforcement is also narrower than the property. The
   allow-list in `scripts/no-change-dir-refs.test.mjs:33-47` accepts any
   matching line in `loop/lib/specs.mjs`, so the named unarchived path at
   `loop/lib/specs.mjs:23` passes the `3/3` check. The same broad exception
   covers the fixture path at `scripts/check-spec-deltas.test.mjs:76`, despite
   the property explicitly including test fixtures. The check must distinguish
   the unavoidable generic operational path construction from a named change
   path (and from fixture literals), or those references must be removed.

## The four obligations

1. `chars` and the ceiling: the clean floor arm at
   `loop/tests/brief-excerpt-budget.test.mjs:334-341` reported `tests 21`,
   `pass 21`, `fail 0`, and its deletion mutation reported
   `emitted length 23145 exceeds cap 0` with `20` pass and `1` fail. The cap
   arm reaches an emitted-text failure, but the separate `chars: 0` mutation
   stayed green, so the arm does not reach the `chars` part of the obligation.

2. Headings, separators, and cap accounting: the tight arm at
   `:344-356` is clean at `21/21`. Removing the structural `floorOverhead`
   reserve made it red with the real diagnostic `emitted length 1295 exceeds
   cap 900` (`20` pass, `1` fail), so the floor-heading/separator accounting
   is reached. Removing the pending-chunk `overhead` stayed green (`21/21`),
   and removing the rendered inter-chunk separator also stayed green (`21/21`);
   those two paths do not reach the failing state.

3. Later-floor reserve: the same tight arm cleanly retained all three markers
   in priority order. Removing `- reserve` from the floor allocation made it
   red (`tests 21`, `pass 20`, `fail 1`) with the emitted first chunk showing
   no room for the later marker. This arm reaches the intended starvation
   failure and proves first-come allocation preserves later floors.

4. Loud failure on the full minimum: the permanent `maxChars=1` arm passes,
   but it remains green when structural overhead is removed. The independently
   constructed `maxChars=800` case is the arm that reaches the relevant state:
   clean output was
   `excerpt configuration error: marker shortfall=3; maxChars=800 is below
   the 803-character constitution marker, heading, and separator minimum`;
   the overhead mutation instead returned `cap=800 GREEN length=1180 chars=1180`.
   Therefore this obligation is not fully enforced by the committed fixture.

## The diff as the list

I derived the list from `git diff fbe1306..HEAD`, not from `main`. The
behavioral production functions changed since that merge base are:

- `loop/lib/specs.mjs:52-53` (`inFlightChanges` pending-root selection);
- `loop/lib/specs.mjs:72-76` (`deltaPaths` pending-root propagation);
- `loop/lib/specs.mjs:100-105` (`specSources` pending-root propagation);
- `loop/lib/specs.mjs:194-211` (`cutMarker`, `cutTo`, and `cutTail`);
- `loop/lib/specs.mjs:235-252` (`capabilityFromSubject` and
  `excerptOptions`);
- `loop/lib/specs.mjs:255-268` (`floorMinimum` and the new
  `renderExcerpt`);
- `loop/lib/specs.mjs:288-428` (`excerptsFor`, including floors, overhead,
  pending allocation, truncation, and `chars`);
- `loop/lib/config.mjs:304` (`BRIEF_EXCERPT_MAX_CHARS`);
- `loop/lib/brief.mjs:645-723` (`assembleBrief`, including the pending-root,
  subject, and truncation-message changes).

Comments and JSDoc-only hunks in `chunkHeading`/`scoredSections` and the
measurement comment in `config.mjs` were not behavioral functions. The fixture
helpers in the test file are test input construction, not runtime production
functions; the two changed cap assertions were mutated separately below.

Every production function above had at least one mutation. Each run used the
same absolute targeted command:

`node --test D:\addictedtoai-worktrees\fleet6-stage0-B1\loop\tests\brief-excerpt-budget.test.mjs`

The following are the real test counts and key diagnostics. `S`, `C`, `B`,
and `T` in the restoration column are the full SHA-256 values listed after the
table.

| Function / line | Mutation | Real result | Restored hash |
|---|---|---|---|
| `inFlightChanges:53` | ignored `pendingRoot` | `tests 21`, `pass 17`, `fail 4`, exit 1 | `S` |
| `deltaPaths:75` | built the path from the live root | `tests 21`, `pass 17`, `fail 4`, exit 1 | `S` |
| `specSources:104` | omitted `pendingRoot` when calling `deltaPaths` | `tests 21`, `pass 17`, `fail 4`, exit 1 | `S` |
| `cutMarker:194-199` | returned an empty marker | `tests 21`, `pass 17`, `fail 4`, exit 1 | `S` |
| `cutTo:202` | treated every nonnegative budget as full text | `tests 21`, `pass 17`, `fail 4`, exit 1 | `S` |
| `cutTail:208-211` | returned no tail marker | `tests 21`, `pass 20`, `fail 1`, exit 1; the binding fixture lost `PENDING AMENDMENT` | `S` |
| `capabilityFromSubject:243` | returned `null` for every subject | `tests 21`, `pass 20`, `fail 1`, exit 1; `/specs/site/` disappeared | `S` |
| `excerptOptions:248` | discarded array-form subjects | `tests 21`, `pass 20`, `fail 1`, exit 1; `/specs/site/` disappeared | `S` |
| `floorMinimum:256` | used full section length instead of marker/full minimum | `tests 21`, `pass 17`, `fail 4`, exit 1; the tight cap threw a `27511`-character minimum error | `S` |
| `renderExcerpt:264` | omitted chunk headings | `tests 21`, `pass 17`, `fail 4`, exit 1; marker/path assertions failed | `S` |
| `renderExcerpt:268` | omitted inter-chunk separators | `tests 21`, `pass 21`, `fail 0`, exit 0 | `S` — finding 4 |
| `excerptsFor:342-345` | set `floorOverhead = 0` | `tests 21`, `pass 20`, `fail 1`, exit 1; `emitted length 1295 exceeds cap 900` | `S` |
| `excerptsFor:368-371` | omitted later-floor `reserve` | `tests 21`, `pass 20`, `fail 1`, exit 1; the tight marker arm failed | `S` |
| `excerptsFor:384-388` | omitted pending-chunk `overhead` | `tests 21`, `pass 21`, `fail 0`, exit 0 | `S` — finding 2 |
| `excerptsFor:427` | returned `chars: 0` | `tests 21`, `pass 21`, `fail 0`, exit 0 | `S` — finding 1 |
| `assembleBrief:662-666` | passed `pendingRoot: null` | `tests 21`, `pass 20`, `fail 1`, exit 1; the binding fixture lost `PENDING AMENDMENT` | `B` |
| `assembleBrief:664` | passed `job.subjects` instead of `[]` | `tests 21`, `pass 20`, `fail 1`, exit 1; the Stage 0 no-fallback arm failed | `B` |
| `BRIEF_EXCERPT_MAX_CHARS:304` | changed `24000` to `14000` | `tests 21`, `pass 17`, `fail 4`, exit 1 | `C` |
| floor cap arm `brief-excerpt-budget.test.mjs:337` | changed the bound to `<= 0` | `tests 21`, `pass 20`, `fail 1`, exit 1; `emitted length 23145 exceeds cap 0` | `T` |
| tight cap arm `brief-excerpt-budget.test.mjs:355` | changed the bound to `<= 0` | `tests 21`, `pass 20`, `fail 1`, exit 1; `emitted length 900 exceeds cap 0` | `T` |

Full restoration hashes after every mutation were:

- `loop/lib/specs.mjs` (`S`):
  `513400FD3352BBC873F64813A8F46E76F2F1991972172E8161A0A59A9D158A53`
- `loop/lib/config.mjs` (`C`):
  `F54F4E28F1604A5DCD55FBED1DBC81191DCCA185D9B7AF6AC2B960D6ABC9303C`
- `loop/lib/brief.mjs` (`B`):
  `B3B1EA731CBDFD31C1903C364B70CF18F9F41FA564EC3A435F6401EB994B45FE`
- `loop/tests/brief-excerpt-budget.test.mjs` (`T`):
  `E0EA857C894730CC0680EF6B0A67C2C0405D44E553149DB79BE5D1294651E1C2`

One initial `cutMarker` patch context was rejected before changing a file. One
config restoration patch was malformed; it also changed nothing, and the
correct restoration was applied immediately before continuing. The final hashes
and zero tracked diff prove no mutation remained.

## The properties, and what I found enforced them

- Portability: `node --test D:\addictedtoai-worktrees\fleet6-stage0-B1\loop\tests\portability.test.mjs`
  ran `tests 12`, `pass 12`, `fail 0`. It enforces a narrower property than
  the one under review, as finding 5 explains.
- Change-directory references: `node --test D:\addictedtoai-worktrees\fleet6-stage0-B1\scripts\no-change-dir-refs.test.mjs`
  ran `tests 3`, `pass 3`, `fail 0`. It scans the named source directories,
  but its broad operational allow-list is narrower than the absolute property,
  as finding 6 explains.
- Permitted files: `git diff --name-status fbe1306..HEAD` showed only
  `RESULT4.md` plus the four permitted paths: `loop/lib/brief.mjs`,
  `loop/lib/config.mjs`, `loop/lib/specs.mjs`, and
  `loop/tests/brief-excerpt-budget.test.mjs`. `package.json` was unchanged,
  `loop/run.mjs` was absent, and no new test file was present.

## What I checked that was sound

- `HEAD` was `0e6b455`; `git merge-base main HEAD` was
  `fbe13066d1458effcc76451dbea0ac6157fcd995`. I used the merge-base diff,
  never `main..HEAD`.
- The frozen authority was read read-only from `D:\AddictedtoAI` at `4d86826`,
  including the task text and the loop requirement. The brief's four requested
  changes match that authority.
- The clean excerpt suite ran `tests 21`, `pass 21`, `fail 0`. It exercised all
  job-type capability markers, pending-change stability, priority order, the
  configured cap arms, and the current live measurement.
- The live-tree probe reproduced the report: `cap=12000 chars=12000
  length=12000`; `cap=800` raised `marker shortfall=53` with minimum `853`;
  `cap=40000 chars=29612 length=29612`.
- The independently constructed below-minimum probe produced
  `cap=1 ERROR ... shortfall=538 ... minimum ... 539`, and the same corpus at
  `cap=900` produced `length=539 chars=539`.
- The tight reserve mutation went red, and the cap-arm deletion mutations went
  red with diagnostics containing both emitted length and cap. Every mutation
  was restored immediately and the final permitted-file diff was zero.
- The author report's targeted `21/21` result and live numbers reproduced. Its
  claimed full `npm test` result was not independently verified because this
  sealed review forbids the full suite, build, verification scripts, and Pulse.

## Was the brief faithful to the task and the requirement?

Yes. The brief accurately states the four requested accounting changes, the
preserved marker/priority/loud-failure behavior, the emitted-text assertion
requirement, and the permitted-file scope. The report built from that brief is
not accepted as proof where the independent green mutations above contradict
its coverage claims.

## Did you read REVIEW.md, REVIEW2.md or REVIEW3.md?

- `REVIEW.md`: no — not opened, before or after writing these findings.
- `REVIEW2.md`: no — not opened, before or after writing these findings.
- `REVIEW3.md`: no — not opened, before or after writing these findings.

## What I ran

Identity and scope:

- `git -C D:\addictedtoai-worktrees\fleet6-stage0-B1 rev-parse --short HEAD`
  → `0e6b455`.
- `git -C D:\addictedtoai-worktrees\fleet6-stage0-B1 merge-base main HEAD`
  → `fbe13066d1458effcc76451dbea0ac6157fcd995`.
- `git -C D:\addictedtoai-worktrees\fleet6-stage0-B1 diff --name-status fbe1306..HEAD`
  → `A RESULT4.md`, and modifications to the four permitted files listed
  above.
- `git -C D:\AddictedToAI show 4d86826:openspec/changes/two-desks-work-orders-and-trains/tasks.md`
  and the corresponding `specs/loop/spec.md` command → read successfully,
  with no write under `D:\AddictedToAI`.
- `Get-FileHash -Algorithm SHA256` on all four permitted files → the four
  final hashes listed above.
- Final `git diff --quiet HEAD --` over the four permitted paths → exit `0`;
  final status showed only the pre-existing untracked `.agent-brief.md`,
  `REVIEW.md`, `REVIEW2.md`, and `REVIEW3.md`. No review probe remained.

Targeted checks:

- `node --test D:\addictedtoai-worktrees\fleet6-stage0-B1\loop\tests\brief-excerpt-budget.test.mjs`
  → `tests 21`, `pass 21`, `fail 0`, `duration_ms 15941.0773` on the final
  clean run.
- `node --test D:\addictedtoai-worktrees\fleet6-stage0-B1\loop\tests\portability.test.mjs`
  → `tests 12`, `pass 12`, `fail 0`.
- `node --test D:\addictedtoai-worktrees\fleet6-stage0-B1\scripts\no-change-dir-refs.test.mjs`
  → `tests 3`, `pass 3`, `fail 0`.
- The mutation runs used the same absolute `node --test` command and are
  enumerated with their real counts and diagnostics in “The diff as the list”.
- Temporary `.review-r4-*.mjs` probes were created with `apply_patch`, run by
  absolute path, and deleted. No probe file remained.

I did not run `npm run build`, full `npm test`, any `verify-*` script, or the
Pulse, as required by the sealed-review limits.
