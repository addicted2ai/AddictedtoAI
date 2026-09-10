# SPEC REVIEW — arch-specfix-review-r1.md — VERDICT: REVISE

## Findings

### F1 — Breaker scenario `failed/done` excludes `discarded` that the body counts (blocking)

**Exact requirement quoted** — body `specs/loop/spec.md` in delta:

> `1. Repeated failure of the same **governing** job type — a failure is a job whose outcome is \`failed\` (gates or review rejected finished work) or \`discarded\` (rejected twice); ...`
> `**The window SHALL be drawn only from outcomes that are a failure or a \`done\`.**`
> `#### Scenario: Repeated failure stops the bleeding`
> `- **WHEN** three \`post\` jobs fail review twice each within the last five \`failed\`/\`done\` jobs of that governing type`

A job that “fails review twice” **is** `discarded` by the body’s own definition, but the window the scenario names (`failed`/`done`) read literally contains no `discarded` slot.

**Evidence — command and output:**

```
Select-String -Path "D:/addictedtoai-worktrees/fleet6-specfix/openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md" -Pattern "failure is a job|window SHALL be drawn|within the last five" | Select-Object LineNumber,Line
LineNumber Line
1456 1. Repeated failure ... a failure is a job whose
1471 **The window SHALL be drawn only from outcomes that are a failure or a `done`.**
1520 - **WHEN** three `post` jobs fail review twice each within the last five
```

Full body at `loop/spec.md:1456-1459` defines `failure = failed OR discarded`; scenario at `1520-1521` says `failed/done`.

**Severity:** blocking — an implementer holding only this text writes `outcome=='failed'||outcome=='done'` and drops `discarded` from the window, under-counting the exact case the scenario exemplifies.

**Fix in one sentence:** Change the scenario to `within the last five failure/done jobs (failure = failed or discarded)` so the window vocabulary matches the body.

### F2 — `One real run clears it` title is false under the window it now carries (blocking)

**Exact requirement quoted:**

> `#### Scenario: One real run clears it`
> `- **WHEN** a refused runner is repaired and its next run produces a diff`
> `- **THEN** that producing invocation replaces one window slot, the count falls, and the runner is selectable again once fewer than three of its last five invocations produced nothing, with no other action`

Sibling scenario in the same block:

> `#### Scenario: A healthy invocation between two dead ones does not clear the count`
> `- **WHEN** a runner's last four invocations in one role are empty, empty, producing, empty`
> `- **THEN** the runner is refused, because three of the last five produced nothing and the producing invocation between them does not reset the count`

One producing run does **not** clear it in general — the next scenario proves it — and the body itself conditions selectability on `<3 of last five empty`.

**Evidence — command and output:**

```
Select-String -Path ".../specs/loop/spec.md" -Pattern "One real run clears it|replaces one window slot|fewer than three of its last five|empty, empty" | Select-Object LineNumber,Line
2166 #### Scenario: One real run clears it
2169 - **THEN** that producing invocation replaces one window slot, the count falls,
2170   and the runner is selectable again once fewer than three of its last five
2175 - **WHEN** a runner's last four invocations in one role are empty, empty,
```

**Severity:** blocking — after archive the heading is law; a later reader believing the title rebuilds the old `streak=0 on one producing run` that the window was written to abolish (current `loop/lib/health.mjs:202-214` + `runner-health.test.mjs:151-152,528-533` still assert the old clear).

**Fix in one sentence:** Rename the scenario to a window-true heading such as `One real run moves the window` in the live spec and the delta together so `validate`’s no-drop rule is satisfied by a rename rather than a false title.

### F3 — `DIRECTIVES.md retires` leaves `pending` undefined and drops the priority tasks require (blocking)

**Exact requirement quoted** (`loop/spec.md:2476-2480`):

> `- \`DIRECTIVES.md\` retires: each pending line migrates into a routed bead carrying the same text, the file is deleted with \`loop/lib/directives.mjs\` and its call sites, and the three directive-prose harvesting bullets this requirement carried for that file are deleted with it rather than repointed.`

**Evidence — command and output:**

```
Select-String -Path ".../specs/loop/spec.md" -Pattern "DIRECTIVES|pending line|same text|priority" | Select-Object LineNumber,Line
2476 - `DIRECTIVES.md` retires: each pending line migrates into a routed bead
2477   carrying the same text, the file is deleted with `loop/lib/directives.mjs`
```

```
Get-Content .../tasks.md | Select-Object -Skip 2198 -First 15
- [ ] 89. Migrate `DIRECTIVES.md`: each pending line becomes a routed bead carrying
      the same text and a priority; ...
```

```
Get-Content -LiteralPath ".../DIRECTIVES.md" | Select-Object -First 40
**Completion marker.** When a directive's job completes, the loop appends
`[done <date> <job-id>]` to that line and skips it forever after. ...
- verify: ... [done 2026-08-29 j-20260829-02]
```

Spec says “same text” with no priority; tasks say “same text **and a priority**”; spec never defines `pending` while the file’s only finished-vs-live distinction is the `[done ...]` marker.

**Severity:** blocking — an implementer with only the spec migrates `[done]` lines and/or emits beads with no priority, producing unroutable or resurrected work while believing they followed it.

**Fix in one sentence:** Define `pending` as lines without a `[done <date> <job-id>]` marker and state the priority each migrated bead carries.

### F4 — Back-desk share bound has no denominator and no observable trigger (blocking)

**Exact requirement quoted** (`loop/spec.md:948-954,966-972`):

> `- **Once both desks exist, the bound on the machine's work on itself SHALL be restated as the back desk's share of total effort**, a declared configuration bound whose starting value is taken from the measured drain, ...`
> `#### Scenario: The bound follows the work when the desks exist`
> `- **WHEN** both desks are running and the back desk's share of total effort reaches its configured bound`
> `- **THEN** ... the bound is read against the effort both desks recorded rather than against the back desk's own ledger alone`

Versus the only denominator the specs define (`loop/spec.md:2268`):

> `Shares SHALL be computed **within each tier separately**`

**Evidence — command and output:**

```
Select-String -Path ".../specs/loop/spec.md" -Pattern "within each tier separately|share of total effort|effort both desks recorded" | Select-Object LineNumber,Line
949   restated as the back desk's share of total effort**, ...
968 - **WHEN** both desks are running and the back desk's share of total effort reaches
971   bound is read against the effort both desks recorded ...
2268 Shares SHALL be computed **within each tier separately**: ...
```

`total effort` / `effort both desks recorded` never says per-tier or global, and `once both desks exist` / `both desks are running` names no observable predicate (config key present? task 79 done?).

**Severity:** blocking — two competent readers build different gates (global total vs per-tier), and neither can decide from the text when the old machinery ceiling stops applying.

**Fix in one sentence:** State whether the share is per-tier or global and give the observable predicate for “both desks exist” (e.g. the declared config key being present).

### F5 — Window forbids ledger ordering without naming any ordering (blocking)

**Exact requirement quoted** (`loop/spec.md:1460-1462`):

> `**The count SHALL be taken over a window of the last five jobs of that type that either failed or succeeded, tripping at three failures among them, and SHALL NOT depend on the ledger's ordering.**`

**Evidence — command and output:**

```
Select-String -Path ".../specs/loop/spec.md" -Pattern "SHALL NOT depend on the ledger|last five jobs" | Select-Object LineNumber,Line
1460    **The count SHALL be taken over a window of the last five jobs of that type
1462    SHALL NOT depend on the ledger's ordering.** ...
```

`last five` requires an order; the only recorded orders are ledger file order (append-as-you-finish, per the paragraph’s own example) and ledger timestamps / job-id sequence, and the text picks none — tasks `84(a)` says only “last N completed jobs”.

**Severity:** blocking — under concurrency start order (job-id sequence under the selection lock) and finish order (ledger append) differ, so two implementations both claiming “not ledger order” disagree on which five are last.

**Fix in one sentence:** Name the ordering key for “last five” (e.g. job-id sequence or completion timestamp) or define the window as order-independent.

### F6 — `would-cite-for` refusal reads as covering N=1 (non-blocking)

**Exact requirement quoted** (`review/spec.md:230-236`):

> `Where the merged subjects hold **more than one** prose piece, the record SHALL carry a \`would-cite-for\` **list of entries**, each naming its piece ..., and each piece among the merged subjects requires its own entry: a record-wide \`would-cite\` alone satisfies nothing for N>1. A piece among the merged subjects left with no entry is refused exactly as a blank \`would-cite\` is refused.`

The opening conditions the list on `>1`, but the final sentence drops the qualifier, read literally refusing an N=1 record-wide-only verdict that the same requirement (and `review/spec.md:332-335` grandfathering) calls complete.

**Severity:** non-blocking — careful reading scopes it to N>1, but a merge-gate author must guess.

**Fix in one sentence:** Qualify the final sentence with `where more than one prose piece is present`.

### F7 — `Desk` vs `desk` overload survives the lane/desk reservation (non-blocking)

**Exact requirement quoted** (`loop/spec.md:927-931`):

> `Work is divided by kind, into two desks that share one intake ...; a \`desk\` is a work partition, and the two words are never interchangeable.`

The reservation pins `lane` (provider set) vs `desk` (work partition) but not `Desk` (whole loop: `unit of Desk work`, `halt the Desk`, `STOP ... brake on the Desk`) vs `desk` (front/back partition), same word distinguished only by case/qualifier throughout the delta.

**Severity:** non-blocking — context usually disambiguates, but permanent text now uses one word for whole and part.

**Fix in one sentence:** Reserve `Desk` (capitalized, the loop) versus `desk` (lowercase, front/back partition) explicitly alongside the lane/desk sentence.

## Requirements with no discoverable enforcement

At authority (`53779c3`) no test/build/gate fails on the new rule; `tasks.md` plans most but the delta text itself does not admit it (no `Implemented by task X` in the spec):

- Front/back desk `SHALL`s — reachable-directly, idle-front-desk, gated-identically, restated share bound (`loop:939-954`): no `desks.test.mjs` at authority; tasks 79–80 plan it; text does not admit future enforcement.
- Breaker window (`loop:1460-1477,1520-1521`): `loop/tests/breakers.test.mjs` asserts consecutive (`three consecutive post jobs`, `consecutiveFailures`), contradicting the window; task 84(a) plans the window test; spec does not admit.
- Runner-health window (`loop:2107-2124,2157-2171,2175-2178`): `loop/lib/health.mjs:202-214` + `runner-health.test.mjs:151-152,528-533` assert backwards-walk clear (`count 0` after one producing run); task 84(c) plans the window; spec does not admit.
- `would-cite-for` per-piece refusal (`review:230-236`): `loop/tests/review.test.mjs` covers only record-wide blank/duplicate; tasks 60–61 plan per-piece tests; spec does not admit.
- `DIRECTIVES.md retires` migration (`loop:2476-2480`): no test names priority, pending, or “no harvest rule replaces them”; task 89 migrates the file for a different requirement’s source list and never tests the harvest-absence; text does not admit.
- Admitted non-enforcement (fine): `Capacity` pause predicate honesty, `reads-human`/`would-cite` limits (“no mechanical check can compel judgment”), every-runner-refused tracked as `addictedtoai-8wm0` — text says so.

## Checked and sound

- Machinery rule: delta carries no model/provider/harness token (`claude|gpt|openai|anthropic|deepseek|gemini|opus|sonnet|haiku` → no hits); chain requirement correctly centralises names in `runners.yml` with token-by-token source check.
- Lane/desk fixes 1a–1d: title, intro reservation, `A desk decides…`, `body of work exists…` are provider-safe; remaining 12 lines / 13 matches are all provider sense (`929,1037,1156,1397,1418,2016,2018,2022,2029,2059,2064,2439`), including carried resumption bullet’s `lane is not paused`.
- 10%→30% scenario (`loop:2382`): correct against `data/config.json:machinery_ceiling_pct 30` and delta table `≤30%`; live `10%` table/scenario confirmed as the defect.
- Malformed-verdict window wording (`loop:2153-2159`): correctly states producing-invocation rather than streak-clear, coherent with window bullets.
- MODIFIED coherence: `Jobs have identities…` carries all live clauses/scenarios with only `three sources→one intake` rephrasing; `issue id…` carries format/malformed clauses verbatim and replaces only the three harvest bullets; REMOVED reasons correctly state every clause carried into `One job is one work order…` / `Work comes from one intake…`.
- `openspec validate two-desks-work-orders-and-trains --type change --strict --no-interactive` → `Change 'two-desks-work-orders-and-trains' is valid`.
- No live code/test depends on the removed headings’ counts; `DIRECTIVES.md` + `loop/lib/directives.mjs` + `run.mjs` call sites still exist at authority, so task 89’s migration is the correct live-dependent handler rather than a silent drop.

## What an implementer would still guess

With only this text, the single most likely wrong-but-faithful build is the breaker filter for F1: writing `outcome=='failed'||outcome=='done'` because the scenario says `failed/done`, thereby excluding `discarded` (rejected twice) even though the body counts it as failure and the scenario’s own example is a twice-rejected job — the gate then under-counts discards and never halts on the exact pattern the scenario names.

## What I ran

- `git -C D:/addictedtoai-worktrees/fleet6-specfix rev-parse HEAD` → `53779c3...` (authority); `status --short` → `M specs/loop/spec.md, M specs/review/spec.md`
- `openspec validate two-desks-work-orders-and-trains --type change --strict --no-interactive` (worktree) → `Change 'two-desks-work-orders-and-trains' is valid`
- `(Select-String -Path '.../specs/loop/spec.md' -Pattern 'lane' -CaseSensitive).Count` → `12` lines / `13` matches; line numbers `929,1037,1156,1397,1418,2016,2018,2022,2029,2059,2064,2439`
- `Select-String ... -Pattern 'failure is a job|window SHALL be drawn|within the last five'`; `Select-String ... -Pattern 'One real run clears it|replaces one window slot|fewer than three|empty, empty'`; `Select-String ... -Pattern 'within each tier separately|share of total effort|effort both desks recorded'`; `Select-String ... -Pattern 'SHALL NOT depend on the ledger|last five jobs'`; `Select-String ... -Pattern 'DIRECTIVES|pending line|same text|priority'`
- Reads: delta `specs/loop/spec.md:925-979,1456-1545,2107-2178,2257-2285,2428-2503`, delta `specs/review/spec.md:228-236`, live `openspec/specs/loop/spec.md:60-92,263-366,367-394,563-592,592-688,1152-1178`, live `openspec/specs/review/spec.md`, `loop/tests/breakers.test.mjs`, `runner-health.test.mjs`, `budget.test.mjs`, `review.test.mjs`, `loop/lib/health.mjs`, `data/config.json`, `DIRECTIVES.md`, `tasks.md:84,89,79-80,60-61`

