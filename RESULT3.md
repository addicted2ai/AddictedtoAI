# THE PULSE LEASE, REFUSING ON FUTURE — RESULT3

Measured 2026-09-10. Suite: 36 tests, 36 pass, 0 fail (`node --test` on
`pulse/tests/lease.test.mjs`). Every mutation below was applied, the suite
run, the edit restored from a post-repair copy held under the OS temp area,
the suite run again. Hashes after the final restore match the pre-mutation
baseline, so the tree is identical to the repaired state.

Post-repair baseline hashes (2026-09-10), post-restore identical:

- `pulse/lib/core.mjs` e33989f279b80693436bee230f5dd1c6e59e7d71a2dc58f9e3bf421d4c8c4156
- `pulse/run.mjs` db59aebf277173b9a2966c6f00fb8c8519ef869d86e2e22e71bf70f674f3d83c
- `pulse/tests/lease.test.mjs` 6ee895961beaa33ccfaf1b2f921114be4e7d6bd82288e9ef44ac2717caf8c19c

Untouched copies were kept at `pulse-lease-r3-orig` (pre-round) and
`pulse-lease-r3-post` (post-repair) under the OS temp area. All restores
below are from the post-repair copy. The suite was green again after every
restore; each row states it.

## 1. THE SWEEP — every constant and deciding literal, and what pins its value

An edge fixture proves the comparison is strict (`MAX` against `MAX + 1` on
a pinned timepiece). A value pin proves the number has not drifted (a
literal naming the seconds). The two answer different questions and the file
needs both. The tolerance already had both; the maximum age had only the
first before this round.

| constant | value | fixture pinning the VALUE | fixture pinning only the EDGE | suite at ten times the value |
|---|---|---|---|---|
| `LEASE_MAX_AGE_MS` in `pulse/lib/core.mjs` | 900000ms (15 minutes) | stale line asserts `exceeds max 900s` literally; fixed `960000`ms-old lease expects stale without naming the constant | at-max fresh, one millisecond past it stale; newly written lease fresh at once, still fresh at max, stale one millisecond later | 33 pass, 3 fail: the stale `900s` literal, the value-pin `900s` literal, the fixed-960s stale lease (fresh again under a tenfold max, so it refuses instead of proceeding) |
| `LEASE_FUTURE_TOLERANCE_MS` in `pulse/lib/core.mjs` | 60000ms (60 seconds) | 90s future refusal asserts `mtime 90s ahead of now, beyond tolerance 60s` literally; ten-year refusal asserts `beyond tolerance 60s` literally; 30s within-tolerance refuses as fresh | at-tolerance fresh, one millisecond beyond it future | 31 pass, 5 fail: 90s, 100s, 150s future refusals (all inside a tenfold band, so they report fresh instead of future), ten-year tolerance literal (`600s` instead of `60s`), the remedy test (fresh line in place of the future line) |
| `LEASE_AHEAD_DISPLAY_THRESHOLD_S` in `pulse/run.mjs` (new, display only) | 120 seconds | 100s ahead renders `100s`; 150s ahead renders `2m 30s` | no edge comparison to pin: the two value fixtures straddle the threshold with 20s and 30s of margin, so the threshold is pinned from both sides at once | 35 pass, 1 fail: the 150s trial renders `150s` instead of `2m 30s` |
| holder truncation length in `pulse/lib/core.mjs` (`slice(0, 120)`, twice) | 120 chars | 5000-char JSON holder length 120; 5000-char plain-text first line length 120; thousand-line file still names the first line | no edge: truncation is log-only and never enters the decision, so there is no boundary where behavior must flip | 34 pass, 2 fail: the holder-length trial (length 1200), the line-count trial (long first line length 1200) |
| ms-to-s divisor `1000` in the `pulse/run.mjs` guard math (age, ahead, max, tolerance) | 1000 | stale `900s`, future `90s` / `60s`, hour `1h 0m`, day `1d 0h`, decade `10y 0d` literals | no edge: a conversion, not a comparison; the millisecond edges are pinned by injection (`MAX` vs `MAX + 1`, tolerance vs tolerance + 1) without passing through the divisor | 27 pass, 9 fail: every live trial asserting a rendered duration |

The divisor row is why the table says "deciding literal" and not only
"named constant": changing it tenfold moves every printed duration while no
comparison changes, and the nine literal asserts fail together.

## 2. The future arm, refusing — the line, quoted, and how it differs from the fresh refusal

Template (`pulse/run.mjs`, future arm):

`pulse: GATE_LEASE future at ${lease.path} (mtime ${aheadText} ahead of now, beyond tolerance ${tolS}s, holder ${who}) — a gate run with a fast writer clock may hold the tree, refusing this run, nothing done. Delete the file only when no gate run is active, or correct the writer clock.`

Observed live 2026-09-10 (holder `gate-harness-probe-1`):

- 90s ahead: `pulse: GATE_LEASE future at C:\Users\BadBitch\AppData\Local\Temp\pulse-fixture-H8T0y1\GATE_LEASE (mtime 90s ahead of now, beyond tolerance 60s, holder gate-harness-probe-1) — a gate run with a fast writer clock may hold the tree, refusing this run, nothing done. Delete the file only when no gate run is active, or correct the writer clock.`
- 1h ahead: `... (mtime 1h 0m ahead of now, beyond tolerance 60s, holder gate-harness-probe-1) — ...`
- 10y ahead: `... (mtime 10y 0d ahead of now, beyond tolerance 60s, holder gate-harness-probe-1) — ...`

All three exit 0, write nothing (no `queue` line, no `queue.json`), leave the
lease file in place. The 90s / 1h / 1d / 10y trials assert exactly that.

The fresh refusal, unchanged:

`pulse: GATE_LEASE present at ${lease.path} (age ${ageS}s, holder ${who}) — a gate run holds the tree, refusing this run, nothing done.`

How they differ: `future` against `present` in the head; a measured `mtime
... ahead of now` against a measured `age`; the tolerance named on the
future line and the max named on the stale line, neither on the fresh line.
Shared `refusing this run, nothing done` marks both as refusals with the
same shape (exit 0, nothing written); distinct heads keep a hurried reader
from mistaking skew for age. The defect round 2 repaired — the two printing
the same sentence with the age held at zero — is what the distinct head
protects. STOP stays first: the STOP-plus-fresh-lease trial still shows the
STOP line with no lease line at all.

The line carries the path, the holder, the ahead magnitude, the tolerance,
and the word refusing. The remedy is conditional — delete the file only
when no gate run is active, or correct the writer timepiece — and it never
suggests raising the tolerance. A dedicated trial asserts the absence of
`rais`, `widen` and `increas` in the refusal output. AN ERROR MESSAGE THAT
SUGGESTS A REMEDY IS PRESCRIBING, AND A GUARD THAT PRESCRIBES THE EDIT THAT
SILENCES IT IS WORSE THAN ONE THAT SIMPLY REFUSES. Deleting an abandoned
advisory file when nothing holds the tree is maintenance; widening the band
until the guard stops speaking is not.

## 3. The magnitude rendering — the rule, its threshold, and the fixtures either side

`mtime 315360000s ahead` scans as noise. The rule, stated in the source
above the helper: below `LEASE_AHEAD_DISPLAY_THRESHOLD_S` the line prints
whole seconds (`90s`); at or above it the line prints the two largest whole
units (`2m 30s`, `1h 0m`, `1d 0h`, `10y 0d`). The comment adds that the
threshold is display-only, a round number picked for readability in the
small hours rather than measured, so a later reader does not go looking for
the measurement behind it.

Threshold: 120 seconds.

Fixtures:

- Below, 100s ahead refuses with `mtime 100s ahead of now` (plus the 90s
  small-magnitude trial with `mtime 90s ahead of now`).
- Above, 150s ahead refuses with `mtime 2m 30s ahead of now`.
- Further up the same rule: 1h renders `1h 0m`, 1d renders `1d 0h`, ten
  years renders `10y 0d` instead of `315360000s`.

The 90s / 100s side keeps 20–30s of margin from the 120s threshold and 30s
or more from the 60s tolerance, so ordinary spawn delay (fractions of a
second between setting the mtime and reading it) cannot flip either the
state or the rendering. An exact-threshold live trial (119s vs 120s) was
deliberately not used: with one second of margin a slow spawn would round
across the line and the trial would be timing, not logic.

## 4. The four surviving mutations — each now caught, or dissolved with the reason

Baseline for every row: 36 pass, 0 fail. Restore green means 36 pass,
0 fail again with hashes identical to the baseline above.

- Finite half of the timing guard (`pulse/lib/core.mjs`, the
  `Number.isFinite` half of the mtime check). Mutation: drop the finite
  half, leaving `if (typeof mtimeMs !== 'number')`. Before 36/0; mutated
  35/1, failing `non-finite mtime never decides: positive and negative
  infinity read as stat-failed`; restored 36/0, identical YES. The code was
  already correct; the fixture was missing and is now present.
- `path` on the `future` return (`pulse/lib/core.mjs`, the future arm).
  Mutation: return `{ state: 'future', ageMs, holder }` with no path.
  Before 36/0; mutated 34/2, failing `beyond tolerance: 90s ahead refuses
  as future under its own line` (its path assert) and `future return
  carries the lease path for its own line`; restored 36/0, identical YES.
  Deleting the field used to leave the suite green while the guard printed
  an undefined value into its own line; the path assert closes that.
- Sign on the ahead magnitude (`pulse/run.mjs`, `-lease.ageMs`).
  Mutation: drop the sign. Before 36/0; mutated 30/6, failing the 90s, 1h,
  1d, ten-year, 100s and 150s future trials (every trial asserting a
  rendered magnitude; the dropped sign prints `0s` everywhere); restored
  36/0, identical YES. The 90s literal (`mtime 90s ahead of now`) is the
  precise tripwire the brief required; the hour/day/decade renderings catch
  it as well now that they assert magnitudes literally, which the old
  proceed-line trials did not.
- Branch swap in `pulse/lib/core.mjs` (future arm against stale arm).
  Mutated 36/0, restored 36/0: the two conditions are disjoint (negative
  age against age past the max), so order is void. Proven equivalent, and
  nothing is owed. Recorded here as dissolved rather than fixed.

The non-finite timepiece finding is dissolved the same way and still gets
its fixture: NaN nowMs lands on fresh (refuses) and negative-infinite nowMs
lands on future (refuses), pinned by `non-finite injected timepiece
refuses: NaN lands on fresh`. Positive-infinite nowMs reads as stale, but
no shipped path meets it (`Date.now` never returns it); the source comment
says the refusal is the safe direction and not a measurement.

## 5. The mutations — one per arm added or changed

| arm | mutation | before | mutated | restored | files identical |
|---|---|---|---|---|---|
| future refusal arm in `pulse/run.mjs` (`else if (lease.state === 'future')` with its own refusal line) | condition to `lease.state === 'future-never'` so the arm can never fire; a future state falls through silently and the run proceeds to the queue | 36 pass, 0 fail | 29 pass, 7 fail: the 90s, 1h, 1d, ten-year, 100s and 150s future trials plus the no-tolerance-prescription trial (future proceeds with no future line) | 36 pass, 0 fail, green YES | YES — hashes above match |
| ahead-magnitude rendering in `pulse/run.mjs` (`LEASE_AHEAD_DISPLAY_THRESHOLD_S = 120`) | value to `1200` | 36 pass, 0 fail | 35 pass, 1 fail: the 150s trial renders `150s` instead of `2m 30s` | 36 pass, 0 fail, green YES | YES — hashes above match |

Unchanged arms needed no new mutation: `absent` still proceeds silently,
`fresh` still refuses under its line, `stale` still proceeds loudly, STOP
still first (the STOP-plus-fresh trial), `stat-failed` still proceeds loudly
for the reason that still holds (a timing read that fails will usually fail
again, so refusing on it would refuse forever).

## 6. What refusing on future costs, measured rather than argued

Live 2026-09-10, holder `gate-harness-probe-1`, all with `--no-build
--no-mint --offline`:

- Dead lease one hour ahead: exit 0, future line (`1h 0m ahead of now`),
  no queue line, no `queue.json`. Refuse duration: unbounded — every firing
  refuses until a person acts. At four firings a day that is every one of
  them, starting with the next.
- Dead lease one day ahead: exit 0, future line (`1d 0h ahead of now`),
  nothing written. Same unbounded refuse.
- Dead lease ten years ahead: exit 0, future line (`10y 0d ahead of now`),
  nothing written. Same unbounded refuse.

What a person has to do to clear it: delete the file when no gate run is
active, or correct the writer timepiece — the line's own conditional
remedy. Deleting restores the absent path, which the absent trial proves
proceeds silently to the queue; the act is a single file removal taking a
second. The outage announces itself on every run (the future line names the
path, the holder, the magnitude and the tolerance), which is the visible
error chosen in the source: refusing accepts this unbounded-but-announced
outage for a dead future lease over a silent overlap with a live holder
whose writer timepiece runs fast, where the harm is a tree rewritten under
a running gate that nothing announces and nobody diffs.

## 7. What the suite still does NOT catch, said plainly

- Holder conduct, as opposed to file state. A holder that keeps touching
  the file keeps it fresh, which is a live holder by definition. The suite
  pins every fixed mtime (a newly written lease is stale one millisecond
  past the max; a future mtime beyond tolerance refuses until cleared) but
  never watches a holder touch across time — proving renewal would need
  waiting, against the no-waiting rule for timing cases.
- Symlink chains at the lease path (round 1, rows 21–22, still dismissed).
  The timing read follows the link to its target, so depth collapses to a
  state already covered (absent when the link dangles, target age when it
  lands). Setup needs privileges on some machines for a result identical to
  rows already covered; nothing new learned.
- A live permission-bit timing failure. The denied-timing shape is proved
  by injection and the shipped path is identical, but on this machine
  timing reads do not fail reliably under permission bits, so there is no
  live-run variant. Same dismissal as round 1.
- Positive-infinite injected `nowMs`, which reads as stale (proceeds).
  `Date.now` never returns it, so no shipped path meets it; it is pinned
  only by the comment, not by a refusal fixture. If a future reader finds
  that disturbing, the honest repair is to reject non-finite timepieces
  explicitly in code, not to add a third live trial.
- Rendering past the decade. Ten years renders `10y 0d`; a century would
  render `100y ...` by the same arithmetic, but no live fixture goes past
  ten years and the helper has no unit test of its own (it is not
  exported; every rendering assert goes through a live run).
- Sub-second live skew. The millisecond edges are pinned by injection
  (max vs max + 1ms, tolerance vs tolerance + 1ms); live runs use
  second-scale margins (30s inside, 90s/100s/150s outside) so spawn delay
  cannot flip them. A live 61s trial would sit one second past the
  tolerance with zero margin and prove nothing reliably.
- The human half of the remedy. The suite proves the line prints the path,
  the holder, the magnitude, the tolerance and the conditional remedy on
  every refused run. It does not prove a person reads it at four in the
  morning, nor that the file they delete is really abandoned.

## 8. What I could not determine

- The live skew distribution: whether any writer timepiece today runs more
  than the tolerance fast, and by how far. Under refusal the tolerance
  decides only which diagnostic line prints, so the unknown no longer
  carries a safety cost the way it did under proceed — but the population
  size is still unknown until the future line fires in production.
- Whether 120 seconds is the most readable display threshold. It is taste
  with margins, not a measurement; 90s against 150s straddles it, and any
  nearby round number would read as well.
- Whether the gate harness will ever leave a dead future lease behind in
  practice (restored virtual machine, corrected timepiece, hand-set
  timestamp). The refusal path is measured; the frequency is not.
- Link-creation privileges on some machines (round 1 dismissal): nothing
  new learned.

## 9. Blocked or refused calls

None. No command was blocked or refused, and nothing was routed around.
