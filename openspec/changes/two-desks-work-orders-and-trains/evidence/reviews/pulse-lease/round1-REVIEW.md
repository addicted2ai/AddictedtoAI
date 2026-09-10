# THE PULSE LEASE, FUTURE STATE — REVIEW1

## VERDICT
revise

## 1. Proceed-on-future — the alternatives, their costs, and my ruling

Property: the Pulse never rewrites tracked files while a live holder holds the lease.

Enforcement found in the tree (read, not assumed):

- `pulse/lib/core.mjs:63` defines `lease: join(root, 'GATE_LEASE')` beside STOP and HOLD, with a note that the writer lives outside this repository in session scratch and only touches the file while a gate run is active. The Pulse only reads.
- `pulse/lib/core.mjs:86` sets `LEASE_MAX_AGE_MS = 15 * 60 * 1000` with a note: gate run measured near seven minutes, holder touches while it runs, fifteen minutes is near twice that run.
- `pulse/lib/core.mjs:176-202` (`checkLease`): mtime is the authority, contents only name the holder for the log. `ENOENT` is absent (proceed silently); any other timing failure or non-numeric mtime is `stat-failed` (proceed loudly, never refuse); `future` when age is below negative tolerance; `stale` when age is past the max; else `fresh`.
- `pulse/run.mjs:80-83` STOP first. `pulse/run.mjs:96-116` lease immediately after STOP and before any network: `fresh` refuses with exit 0 and writes nothing; `stale` warns and proceeds; `future` warns and proceeds; `stat-failed` warns and proceeds; `absent` proceeds silently.
- Hazard stated in `pulse/tests/lease.test.mjs:1-20`: on 2026-09-10 the scheduled Pulse rewrote tracked files underneath a mid-flight gate run. HOLD was the wrong brake (publish only). STOP belongs to the maintainer alone. The lease exists so the Pulse refuses to rewrite under a live gate run.

What I ran to confirm the enforcement (2026-09-10, local):

- `node --test pulse/tests/lease.test.mjs` on the unmodified tree: 28 pass, 0 fail.
- Fresh trials refuse with `GATE_LEASE present ... refusing this run, nothing done`, exit 0, no `data/derived/queue.json` written. Stale and future trials warn with `disregarding it and proceeding` and then write the queue. STOP plus fresh shows only the STOP line. This is the same program the suite runs via `PULSE_ROOT` throwaway roots, so the refusal path is measured end to end, not assumed from names.
- Facts about writes and refreshes all come from those comments and the suite header. There is no writer in this tree to read. Touch interval, writer machine, writer clock discipline, and whether the writer and the Pulse share a clock are not stated anywhere I found.

Alternatives and their costs in both directions:

- A. Refuse on `future` as if held, under a distinct refuse line (not silent `fresh`). Cost of running when one should not: zero added overlap from skew. Cost of not running when one should: skew plus max of outage per dead file (about 16 min for 1 min ahead, 1.3 h for 1 h ahead, 24.3 h for 1 day ahead, 3650 days for ten years ahead, measured in the brief). Small skew costs about one skipped firing (four firings a day, hours apart). Large skew costs a long outage that needs a human to clear the file or fix the clock, but the refuse line names the holder and the ahead magnitude so the cause is visible.
- B. Hold `future` but bounded by the max from now (refuse for at most max, then proceed). Cost of running when one should not: overlap returns after the bound whenever the holder is still live and still touching with a skewed clock, because a live future touch and a dead future file look identical at any instant. A stateless mtime read alone cannot separate them. The bound only delays the overlap past a typical seven-minute gate run; it does not remove it. Cost of not running when one should: at most max plus tolerance, same as stale. Needs extra state to remember first sighting; without it, clamping alone never ages out.
- C. Shipped: proceed on `future` beyond 60 s. Cost of running when one should not: immediate overlap with a genuinely live holder whose clock is more than 60 s fast. The brief names five minutes fast as the case. That is the exact outcome the lease exists to prevent, and the 00:00:41 rewrite shows the harm is real. Cost of not running when one should: zero for large skew, at most 16 min for skew inside tolerance. Availability is optimal.
- D. Proceed only beyond a larger ahead amount that cannot be ordinary jitter (hours, not seconds). Cost of running when one should not: overlap only for live skew past that large line, which would itself be a severe misconfiguration likely noticed elsewhere. A five-minute-fast live holder stays safe. Cost of not running when one should: max plus the larger tolerance for dead files under the line (for example 30 min or 1.25 h), still at most one skipped firing on an hours-apart grid, while ten-year skew still proceeds at once. This dominates C on safety for negligible availability loss, given the firing grid.

Ruling: the shipped choice C is not defensible at 60 s. It converts a misdiagnosed hold (old code said `fresh` with age clamped to 0 s, so skew hid as a live lease) into immediate silent overlap, and the loud line does not make the overlap safe. The WARN line says it proceeded, but exit stays 0, the queue is written, later lines look like any ordinary run, and nothing tells the 04:00 reader whether a gate run was live at that moment. A visible refuse that stops derived writes is diagnosable; a proceed that writes looks normal. The author concedes the live-skew population is unknown (`RESULT2.md:7`: whether the harness ever writes from a machine more than tolerance ahead is unknown). A threshold chosen without that measurement, at seconds when minutes of drift are plausible across machines, assumes what it needed to show. Keep the distinct `future` state and the loud line, but refuse on it (A), or at minimum move the line to hours with a measured reason (D). Sixty seconds optimises refuse length, not safety.

## 2. THE SWEEP — every trial, fixture-from-constant or literal, and what would fail if the constant changed

Constants under test: `LEASE_MAX_AGE_MS = 15 * 60 * 1000` (900000), `LEASE_FUTURE_TOLERANCE_MS = 60 * 1000` (60000). Measured constant-change runs (each restored to hashes `1f25c8...` and `bbab7a...`, suite green again at 28/0 after every restore):

- Tolerance 61 s: 27 pass, 1 fail (ten-year output expects 60 s).
- Tolerance 600 s: 26 pass, 2 fail (90 s ahead refuses instead of future; ten-year output says 600 s).
- Tolerance 0: author-measured 25/3 (one-minute and 30 s ahead proceed as future; ten-year prints 0 s).
- Max 150 min (10x): 28 pass, 0 fail. Nothing pins max growth.
- Max shrink below 60 s would flip fresh 60 s literals to stale (not run to avoid thrash; follows from 60 > 30).

Per-trial enumeration (`pulse/tests/lease.test.mjs`):

| trial | fixture | literal or from constant | what fails if the constant changes |
|---|---|---|---|
| absent lease | no file | neither (no mtime) | nothing; still absent |
| fresh lease | 60 s old via `60 * 1000` | literal | max shrink under 60 s flips it stale; tolerance change no effect (age positive) |
| stale lease | `LEASE_MAX_AGE_MS + 60 * 1000` | from max | moves with max, stays stale by itself; max 10x growth caught by nothing anywhere (finding) |
| fresh empty (empty text, 60 s old) | 60 s literal | literal | same as fresh |
| fresh garbage (60 s old) | 60 s literal | literal | same as fresh |
| fresh JSON without holder (60 s old) | 60 s literal | literal | same as fresh |
| fresh plain text (60 s old) | 60 s literal | literal | same as fresh |
| fresh directory (mkdir, mtime now) | now, literal | literal | robust; age near 0 stays fresh under wide max and tolerance moves |
| stale directory (`LEASE_MAX_AGE_MS + 60 * 1000` on dir) | from max | from max | moves with max, stays stale by itself |
| stale malformed (`LEASE_MAX_AGE_MS + 60 * 1000`) | from max | from max | moves with max |
| future 1 min ahead (`-60 * 1000`) | literal -60 s, at tolerance | literal | tolerance shrink to 0 flips it future (fails fresh expect); tolerance growth keeps it fresh |
| STOP plus fresh (STOP file + 60 s lease) | literal + STOP | literal | same as fresh; order proved (STOP line only) |
| boundary max (pinned `nowMs`, `MAX` and `MAX + 1`) | from max | from max | moves with max, stays green; pins strict `>` but not the value |
| timing read fails (injected throw, `{}`) | no mtime shape | neither | nothing; pre-branch `stat-failed` path |
| holder naming matrix | pure string function | neither | nothing |
| lease path beside STOP and HOLD | path join | neither | nothing |
| shipped guard on fresh fixture (60 s old, checks `ageMs` in range) | 60 s literal | literal | max shrink under 60 s fails the range check |
| within tolerance 30 s ahead (`-30 * 1000`) | literal -30 s | literal | tolerance shrink to 0 flips it future; growth keeps it fresh; brackets the low side |
| beyond tolerance 90 s ahead (`-90 * 1000`) | literal -90 s | literal | tolerance growth to 600 s flips it fresh (measured 26/2); brackets the high side |
| one hour ahead (`-3600 * 1000`) | literal | literal | only very large tolerance growth past 1 h flips it; otherwise robust |
| one day ahead (`-24 * 3600 * 1000`) | literal | literal | only huge tolerance growth flips it |
| ten years ahead (literal `-10y`, asserts `/beyond tolerance 60s/`) | fixture literal, output literal 60 s | literal + literal pin | fixture robust; output literal is the one exact pin on tolerance value (61 s fails it); tolerance growth also fails via 90 s trial |
| tolerance edge (`TOL` and `TOL + 1` on pinned clock) | from tolerance | from tolerance | moves with tolerance, stays green by itself; this is the floor instance the brief names |
| newly written lease (0, then `nowMs + MAX`, `+ MAX + 1`) | from max | from max | moves with max; pins strictness, not value |
| ten years old (`tenYearsMs + LEASE_MAX_AGE_MS`) | from max | from max | moves with max, stays stale; proves old never turns future |
| size 1 MB garbage (fresh timing) | 60 s literal + long text | literal | same as fresh; size never enters decision |
| holder 5000 chars (fresh timing, length 120 checks) | 60 s literal | literal | same as fresh for timing; length pin is on truncation, not on lease timing |
| line count 1000 lines (pure holder function) | no mtime | neither | nothing |

Summary for the question asked: tolerance-edge and max-boundary fixtures built from the constant pin where the edge is relative to the constant, not what the constant is. For tolerance, other trials do pin the value: 30 s and 90 s literals bracket it for large moves, and the ten-year `/beyond tolerance 60s/` output literal pins it exactly (61 s already fails). For max, nothing pins the value: every stale fixture is `MAX + ...`, every boundary fixture is `MAX` or `MAX + 1`, fresh fixtures are 60 s literals that stay fresh under growth, and no output assert names the max seconds (stale tests check `WARN stale` and `disregarding` but not `exceeds max 900s`). Max 10x stays 28/0. That asymmetry is the finding.

General question: should a value like this be pinned by a literal somewhere, and what keeps that literal from rotting into the stale-copy hazard this project has measured? Yes, pin it, but pin it as a failing tripwire in the test, not as a restated number in prose. A prose copy reads like a measurement and stays green when it drifts; a test literal fails when it drifts and forces a conscious update. Keep the computed edge fixtures for exactness and keep the bracketing literals (30 s, 90 s) plus the output literal (60 s) for value. Add the missing max pins: assert the stale line's max seconds literally and add a literal stale age just past the old max (for example a fixed sixteen-minute age) so max growth must face a literal. That literal will need updating if the constant ever intentionally moves, which is the point: the update becomes a reviewed decision, not silent drift.

## 3. The equivalent-mutant claim — proven, refuted, or undetermined

Proven equivalent on the shipped constants.

What I ran (2026-09-10, script `lease-q3.mjs` under the OS temp area, plus live suite):

- Pure-order model over 27 ages: 0, plus/minus 1, plus/minus 0.5, `MAX`, `MAX` plus/minus 1 and 0.5, `-TOL`, `-TOL` plus/minus 1 and 0.5, -30 s, -60 s, -90 s, -1 h, -1 day, -10 y, +10 y, +10 y plus max, `MAX_SAFE_INTEGER` both signs, plus/minus `Infinity`, `NaN`. Both orders agreed on all 27 (0 mismatches). Edges hold: age equal to `-TOL` is fresh, one millisecond beyond is future; age equal to `MAX` is fresh, one past is stale.
- Same `checkLease` the program calls with injected timing: at-tolerance fresh, past-tolerance future, at-max fresh, past-max stale, -90 s future, +60 s fresh. `NaN` age (from `NaN` now) returns fresh under both orders; `Infinity` age returns stale under both. Non-numeric or missing mtime returns `stat-failed` before either branch, so unexpected `statSync` shapes never reach the order.
- Live mutation: swapped the two branches in `pulse/lib/core.mjs:200-201`, ran `node --test pulse/tests/lease.test.mjs`: 28 pass, 0 fail, identical to baseline. Restored from the temp original (hash `1f25c8...` again), suite green again at 28/0.

Reason: `-60000 < 900000`, so `age < -TOL` and `age > MAX` are disjoint over the whole domain including infinities, and `NaN` fails both comparisons the same way in either order. Neither branch has side effects between the tests. A surviving equivalent mutant is a defect in the mutation set, not in the tests, and this one is that case.

Note: `NaN` now (only reachable by injecting `nowMs`, no caller in `pulse/` passes `opts`) returning fresh rather than `stat-failed` is odd but identical in both orders, so it does not affect equivalence. Listed under findings.

## 4. What the suite still passes on

Baseline before every mutation: 28 pass, 0 fail. Restored state after every mutation: 28 pass, 0 fail (hashes `1f25c8...` for `core.mjs` and `bbab7a...` for `run.mjs` after each restore). Untouched copies kept as `core.orig.mjs` and `run.orig.mjs` under the OS temp area; every mutated run was followed by a copy-back restore and a green re-run before the next mutation.

| mutation | before | mutated | restored | caught |
|---|---|---|---|---|
| swap `future` / `stale` branch order (`core.mjs:200-201`) | 28/0 | 28/0 | 28/0 | missed (equivalent, see section 3) |
| future `<` to `<=` (`ageMs <= -TOL`) | 28/0 | 27/1 (tolerance edge: at-tolerance reads future) | 28/0 | caught |
| stale `>` to `>=` (`ageMs >= MAX`) | 28/0 | 26/2 (max boundary + newly-written at-max read stale) | 28/0 | caught |
| sign dropped (`ageMs < TOL` instead of `< -TOL`) | 28/0 | 23/5 (fresh dir, 1-min future, 30 s, tolerance edge, newly-written read future) | 28/0 | caught |
| tolerance `60 * 1000` to `61 * 1000` | 28/0 | 27/1 (ten-year output says 61 s, expects 60 s) | 28/0 | caught (only via output literal) |
| tolerance `60 * 1000` to `600 * 1000` | 28/0 | 26/2 (90 s ahead refuses; ten-year says 600 s) | 28/0 | caught |
| max `15 * 60 * 1000` to `150 * 60 * 1000` | 28/0 | 28/0 | 28/0 | missed (max value unpinned) |
| drop `!Number.isFinite` half (`typeof mtimeMs !== 'number'` alone, `core.mjs:190`) | 28/0 | 28/0 | 28/0 | missed (`Infinity` mtime would flow to future/stale instead of `stat-failed`; suite only tries `{}` and throws) |
| delete `path` from `future` return (`core.mjs:200`) | 28/0 | 28/0 | 28/0 | missed (no trial checks `path`; guard prints `undefined` and still matches) |
| future threshold uses max (`ageMs < -LEASE_MAX_AGE_MS`) | 28/0 | 26/2 (90 s ahead refuses; tolerance-plus-one reads fresh) | 28/0 | caught |
| run warning sign dropped (`lease.ageMs` instead of `-lease.ageMs`, `run.mjs:109`) | 28/0 | 28/0 | 28/0 | missed (ahead magnitude never asserted; ten-year still prints `0s ahead` and passes) |
| remove stale branch entirely | 28/0 | 22/6 (all stale shapes refuse as fresh) | 28/0 | caught |

A twin proves a check can fire; the missed rows prove what must still be added: a max-value pin, an `Infinity`-mtime case, a `path` presence check or removal of the field, and an ahead-magnitude assert.

## 5. The warning, read cold

Shipped future line (`pulse/run.mjs:112`):

`pulse: WARN future GATE_LEASE at <path> (mtime <ahead>s ahead of now, beyond tolerance <tol>s) — disregarding it and proceeding; holder <who> looks skewed, check the writer clock.`

Observed live (ten years ahead): `mtime 315360000s ahead of now, beyond tolerance 60s ... holder gate-harness-probe-1 looks skewed, check the writer clock.`

It does name the holder, the magnitude, and the decision (`disregarding it and proceeding`), so it is not an observation without a decision. Three gaps remain for the 04:00 reader:

- Magnitude in raw seconds does not read: `315360000s` is ten years but scans as noise. Stale prints age and max in the same unit so the comparison is easy; future prints ahead and tolerance the same way, which is consistent, but large skew needs a human unit (days or years) to triage.
- `check the writer clock` names no writer location. The writer lives outside this tree by design, and nothing in the line says where that scratch area is, which clock to compare, or what good looks like. A holder name without a place to look is half an instruction.
- It does not state the risk it just accepted. `Stale` says the holder may have died; `future` says the writer looks skewed. Neither says overlap is now possible, what was overwritten, or how to confirm no gate run was live (no gate identity beyond the holder string, no hint that the queue was just written). The decision is stated; the consequence is not.

## 6. Findings, each with file and line

- Proceed-on-future at 60 s is unargued and too eager: `pulse/lib/core.mjs:107` (tolerance value and comment), `pulse/lib/core.mjs:200` (future arm), `pulse/run.mjs:108-112` (proceed arm). Live five-minute-fast holder overlaps; larger tolerance or refuse would keep it safe for at most one skipped firing.
- Max value unpinned by any literal: `pulse/tests/lease.test.mjs:56` (`MAX + 60s`), `:183`, `:442`, `:241-254`, `:415-436` (all computed from max); `pulse/run.mjs:105` (max printed but never asserted). Max 10x stays 28/0.
- `isFinite` half of timing guard untested: `pulse/lib/core.mjs:190`. Dropping it stays 28/0. Add an `Infinity` (and `-Infinity`) mtime case expecting `stat-failed`.
- Returned `path` untested: `pulse/lib/core.mjs:200` (and `:201`). Deleting it stays 28/0 while the guard prints `undefined`. Assert presence or stop returning it.
- Warning ahead magnitude untested and unreadable at scale: `pulse/run.mjs:109`. Sign drop stays 28/0; ten-year prints `315360000s`. Assert a small magnitude literally and render large skew in larger units.
- `NaN` clock reads fresh: `pulse/lib/core.mjs:176-202`. Injected `nowMs: NaN` yields fresh (refuse) under both orders. No caller passes `opts` today, so unreachable in production, but a defensive `stat-failed` on non-finite now would be safer than a refuse.
- Old misdiagnosis worth keeping in the record: before the change, future printed the fresh refuse with age clamped by `Math.max(0, ...)` in `pulse/run.mjs:98`, so ten-year skew read as `age 0s` live. Any alternative that refuses on future must use a distinct refuse line naming ahead magnitude, not fall back to the fresh line.

## 7. What I could not determine

- Where the gate harness runs and how its clock relates to the Pulse machine (same host or not), its touch interval, and the real distribution of live skew. Without that, no tolerance number is measured; 60 s, 5 min, and 1 h are all guesses with different safety costs.
- Whether any live holder today is more than 60 s ahead. The repair makes it loud when it happens; until it fires, the size of that population is unknown (also noted in `RESULT2.md:7`).
- The best larger tolerance if proceeding is kept. Hours feel safe against jitter and still cost at most one firing, but picking the number needs the missing clock data, not another guess.
- Whether monitoring would catch a proceed-during-live overlap (queue written, exit 0, ordinary later lines) versus a refuse (no queue, freshness goes stale). I did not run the full engine or any status surface to check.

## 8. Blocked or refused calls

None. No command was blocked or refused, and nothing was routed around. Only `node --test` on `pulse/tests/lease.test.mjs`, small throwaway scripts under the OS temp area calling `checkLease` directly, file copies between the worktree and the OS temp originals, and read-only inspection were used. No Pulse, Desk, build, whole suite, or `verify-*` run. No push, no issue writes, no commits. Local date throughout: 2026-09-10.
