done

# Stage 0 packet A — round 6

Local run date: `2026-09-08`.

## THE `now` DEFAULT-CLOCK ARM

Added `scripts/tests/verify-launch.test.mjs:148-167`. The arm calls
`checkBuild(true, ...)` without a `now` option, forces the build path, and
uses a five-millisecond child callback. It asserts that the returned result is
successful, that `durationMs` is positive, and that the observed duration
reaches the one-millisecond fixture floor comparison. It also asserts that no
floor failure was reported.

### Mutation H

Production mutation: `scripts/verify-launch.mjs:949`, `now = Date.now` changed
to `now = () => 0`.

Before hash:

```text
80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC
```

Real red run (`node --test scripts/tests/verify-launch.test.mjs`):

```text
✖ without an injected clock, checkBuild measures a positive build duration
ℹ tests 13
ℹ pass 12
ℹ fail 1
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
false !== true
at scripts/tests/verify-launch.test.mjs:163:10
```

Exactly 1 of 13 arms moved. The production line was restored to
`now = Date.now`. The restored hash was:

```text
80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC
```

The real green rerun was 13 tests, 13 pass, 0 fail. The restored hash is
byte-identical to the pre-mutation hash.

## DECLARATION

The `checkBuild` injected dependencies that are not armed on their production
defaults are:

| Seam and production default | Why it is not armed |
|---|---|
| `root = ROOT` (`scripts/verify-launch.mjs:947`) | The default is this real repository; the tests use temporary fixture trees so they do not inspect or modify the live tree. |
| `spawn = spawnSync` (`:948`) | The default would launch a real build process. Unit tests inject a deterministic child result and the sealed limits forbid a live build here. |
| `localNow = () => new Date()` (`:950`) | It only supplies the record timestamp. Fixture arms inject a fixed date so record bytes are deterministic; the new arm does not need the writer. |
| `write = out` (`:954`) | It is human-readable output. Fixture arms capture it to make assertions deterministic and avoid noisy output. |
| `report = record` (`:955`) | It is result collection/output plumbing. Fixture arms capture the report; the decision is asserted on the returned result. |
| `floors` (optional alias, `:953`) | It has no independent production default; `floors ?? floorSet` selects it only when explicitly supplied, while the test covers the default `floorSet`. |

The decision-carrying defaults are armed: `isCurrent = hasCurrentBuild` by the
existing reuse arm and `floorSet = GATE_FLOORS` by the existing omitted-floor
arm; this round adds the omitted-`now` arm. `runBuild` is the explicit control
argument, not an injected dependency option.

## MUTATION TABLE

Every line this round changed is either a ROW below or listed under
NON-BEHAVIOURAL with a reason. A changed line that is neither is an incomplete
table, not a tidy one.

| # | file:line | the mutation | the arm that must go red | red run: exit + the failing assertion | restored (hash) |
|---|-----------|--------------|--------------------------|----------------------------------------|-----------------|
| 1 | `scripts/tests/verify-launch.test.mjs:148-167` | `now = Date.now` → `now = () => 0` at `scripts/verify-launch.mjs:949` | `without an injected clock, checkBuild measures a positive build duration` | exit 1; `AssertionError: Expected values to be strictly equal: false !== true` at `:163` | `80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC` |

NON-BEHAVIOURAL (no mutation possible; say why):

- None. The single new test arm is behavioral; its fixture setup, injected
  seams, assertions, and callback all participate in the arm or its measured
  input.

## FULL SUITE

The required full suite was run once at the end:

```text
npm --prefix D:\addictedtoai-worktrees\fleet6-stage0-A test
```

Result: exit 0; 124 test files, 1730 tests, 1730 pass, 0 fail, 0 cancelled,
0 skipped, 0 todo.

## TREE FINDINGS

- Only `scripts/tests/verify-launch.test.mjs` changed this round.
- `loop/lib/gates.mjs`, `scripts/verify-launch.mjs`,
  `loop/tests/gates.test.mjs`, and `package.json` were not changed.
- The frozen task's enumeration omitted the optional `floors` alias; it is
  declared above. The task and brief otherwise matched the current signature.

# Stage 0, packet A — round 5

Local run date: `2026-09-08 14:06:38`.

The production code was not changed. The two test files now make the two
pre-spawn removals observable and make the repository floor default reachable.

## Item 1 — ordering at the two spawners

Changed:

- `loop/tests/gates.test.mjs:113-148` adds the gate ordering arm. It seeds an
  old success record, checks inside the injected spawn callback that the record
  is already absent, and retains the post-run absence assertion.
- `scripts/tests/verify-launch.test.mjs:222-252` adds the separate launch
  ordering arm with the same seeded-record and callback-time checks.

Focused green tests after restoration:

```text
loop/tests/gates.test.mjs
ℹ tests 8
ℹ pass 8
ℹ fail 0

scripts/tests/verify-launch.test.mjs
ℹ tests 12
ℹ pass 12
ℹ fail 0
```

### Gate ordering mutation

Mutation: delete `loop/lib/gates.mjs:460`, the removal immediately before the
gate spawn.

Before hash:

```text
0F3928004A1367BE818F6D7FD79D0E8E0546A18A53BD9AA5F91468DEE01A99FD
```

Real red output:

```text
✖ the build gate removes an old record before the injected spawn
ℹ tests 8
ℹ pass 7
ℹ fail 1
AssertionError [ERR_ASSERTION]: the old success record is absent when the build child starts
true !== false
at loop/tests/gates.test.mjs:136:14
```

Only 1 of 8 gate arms moved. The line was restored; the after hash was exactly
the before hash:

```text
0F3928004A1367BE818F6D7FD79D0E8E0546A18A53BD9AA5F91468DEE01A99FD
```

Real green output after restoration:

```text
ℹ tests 8
ℹ pass 8
ℹ fail 0
```

## Item 2 — production-default arms

Changed:

- `scripts/tests/verify-launch.test.mjs:118-146` calls `checkBuild` without
  `floorSet` or `floors`, forces the spawn path, and asserts
  `checked.floorMs === GATE_FLOORS.build.floorMs`, floor failure, and no
  success record.
- `scripts/tests/verify-launch.test.mjs:107-116` is the existing current-build
  reuse arm, now named to expose that it omits `isCurrent` and therefore uses
  the production `hasCurrentBuild` default. It proves reuse by asserting zero
  spawns.

### Production-default inventory

The `checkBuild` option defaults at `scripts/verify-launch.mjs:946-956` are:

- `root = ROOT`: fixture arms inject a temporary root deliberately; omitting it
  would inspect this worktree rather than a fixture.
- `spawn = spawnSync`: the deterministic spawn-path arms inject a child result
  callback. This is a test transport seam, not a build-reuse decision.
- `now = Date.now`: the direct failed-spawn arm omits it; successful fixture
  arms inject a deterministic clock so floor assertions do not depend on wall
  time.
- `localNow = () => new Date()`: successful fixture arms inject a fixed local
  clock for deterministic record bytes; failure arms do not invoke the writer.
- `isCurrent = hasCurrentBuild`: covered by the no-injected-`isCurrent` arm at
  `scripts/tests/verify-launch.test.mjs:107-116`.
- `floorSet = GATE_FLOORS`: covered by the no-injected-floor arm at
  `scripts/tests/verify-launch.test.mjs:118-146`.
- `floors`: has no independent production default; it is the optional alias
  selected before `floorSet`.
- `write = out` and `report = record`: these are output/report seams. The
  fixture helper injects them to capture deterministic reports; the direct
  failure path omits `write` and exercises the production output function.

The measured production decision defaults are therefore reachable: the current
build decision uses `hasCurrentBuild`, and the build floor uses `GATE_FLOORS`.

### Mutation G

Mutation: replace `scripts/verify-launch.mjs:952`, `floorSet = GATE_FLOORS`,
with `floorSet = {}`.

Before hash:

```text
80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC
```

Real red output:

```text
✖ without an injected floor set, checkBuild applies the repository build floor
ℹ tests 12
ℹ pass 11
ℹ fail 1
AssertionError [ERR_ASSERTION]: the omitted floor set uses the repository build floor
actual undefined
expected 7300
at scripts/tests/verify-launch.test.mjs:139:10
```

Only 1 of 12 launch arms moved. The default was restored; the after hash was
exactly the before hash:

```text
80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC
```

Real green output after restoration:

```text
ℹ tests 12
ℹ pass 12
ℹ fail 0
```

## The two ordering arms

The gate arm is independently named at
`loop/tests/gates.test.mjs:113-148`; the launch arm is independently named at
`scripts/tests/verify-launch.test.mjs:222-252`. Each seeds a real old record,
asserts absence inside its own injected spawn callback, and keeps the final
absence assertion.

For mutation F — deleting `scripts/verify-launch.mjs:984` — **only its own
launch ordering arm moved**: 1 of 12 launch arms failed and the other 11
remained green. The gate ordering arm is in a separate suite and is not used to
make the launch mutation pass or fail.

## Mutation F

Mutation: delete `scripts/verify-launch.mjs:984`, the launch removal immediately
before its spawn.

Before hash:

```text
80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC
```

Real red output:

```text
✖ verify-launch removes an old record before the injected spawn
ℹ tests 12
ℹ pass 11
ℹ fail 1
AssertionError [ERR_ASSERTION]: the old success record is absent when the build child starts
true !== false
at scripts/tests/verify-launch.test.mjs:240:14
```

Only 1 of 12 arms moved, and it was only the launch ordering arm. The line was
restored; the after hash was exactly the before hash:

```text
80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC
```

Real green output after restoration:

```text
ℹ tests 12
ℹ pass 12
ℹ fail 0
```

## Invented mutation

I targeted the remaining current-build decision seam: replace
`isCurrent = hasCurrentBuild` at `scripts/verify-launch.mjs:951` with
`isCurrent = () => false`.

Before hash:

```text
80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC
```

Real red output:

```text
✖ checkBuild uses hasCurrentBuild by default for a present recorded build
ℹ tests 12
ℹ pass 11
ℹ fail 1
AssertionError [ERR_ASSERTION]: reuse is proved by the spawn count
1 !== 0
at scripts/tests/verify-launch.test.mjs:112:10
```

Only the default-reuse arm moved. The mutation was restored; the after hash was
exactly the before hash:

```text
80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC
```

Real green output after restoration:

```text
ℹ tests 12
ℹ pass 12
ℹ fail 0
```

## Record-writer sweep

The sweep over `loop`, `lib`, `pulse`, `scripts`, `app`, and `tools` found one
production writer definition and two production call sites:

- `loop/lib/gates.mjs:146` — the sole exported writer;
- `loop/lib/gates.mjs:637` — the gate call after floor enforcement;
- `scripts/verify-launch.mjs:1004` — the launch call after floor enforcement.

The matching removal plumbing is `loop/lib/gates.mjs:460,638` and
`scripts/verify-launch.mjs:984,1005`. Fixture-only writes are in the two test
files. No writer or record match occurred under `lib`, `pulse`, `app`, or
`tools` beyond the explicit empty result of that sweep.

## Full suite

The one mandated full run was:

```text
npm --prefix D:\addictedtoai-worktrees\fleet6-stage0-A test
```

It ran 124 test files and reported:

```text
ℹ tests 1729
ℹ pass 1729
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

No build command was run.

## Frozen authority and tree findings

- Tasks 1–4 and the loop floor/reuse requirement were read from the frozen
  `99de120` blob in `D:/AddictedToAI`; the stale local `openspec/` tree was not
  used as authority.
- The frozen task text and this brief matched the current tree for the three
  required mutation locations. All three initially stayed green as reported;
  the new arms now make them red for the named assertion.
- The four-file scope was respected. Only
  `loop/tests/gates.test.mjs` and `scripts/tests/verify-launch.test.mjs` are
  modified. `loop/lib/gates.mjs` and `scripts/verify-launch.mjs` are restored
  byte-identically to their round-4 hashes above, and `package.json` is
  untouched.
- Existing untracked review materials (`.agent-brief.md`, `REVIEW.md`,
  `REVIEW2.md`, `REVIEW3.md`, `REVIEW4.md`) were preserved. `RESULT.md` is
  intentionally uncommitted.
