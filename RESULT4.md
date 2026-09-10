# THE PULSE LEASE, ROUND 4 — RESULT4

Measured 2026-09-10 (local). Suite 36 -> 39 tests, 39 pass, 0 fail (`node` on `pulse/tests/lease.test.mjs`). Removed none. Renamed one (see section 3). Added three: display edge at its value, renewal pair, stat-failed source pin with gap in name. Every mutation below was applied, the suite run, the edit restored from a post-repair copy held under the OS temp area, the suite run again. Hashes after the final restore match the pre-mutation baseline, so the tree is identical to the repaired state.

Post-repair baseline hashes (2026-09-10), post-restore identical:

- `pulse/lib/core.mjs` 0993153ca0c63a3b3bb6478bd2a96e62316ca59cf230fb6c4b7a1f117724f93d
- `pulse/run.mjs` 99c17b8dd5d4ce41e63afd734851c1ac27f0d7afb76b6ddc74c27a7f69db3404
- `pulse/tests/lease.test.mjs` f6a0c0bc3da98386ca02a6dc45e9f18853c73fc05f79b16c38205405dd40b154

Untouched copies were kept at `pulse-lease-r4-orig` (pre-round) and `pulse-lease-r4-post` (post-repair) under the OS temp area. All restores below are from the post-repair copy. The suite was green again after every restore; each row in section 8 states it.

Scope held: `pulse/tests/lease.test.mjs` (instrument, renamed check, three new trials), `pulse/run.mjs` (comments only: corrected claim and labelled constant; no logic change), `pulse/lib/core.mjs` (comments only: corrected claim). No change to the refuse/proceed decision, `LEASE_MAX_AGE_MS`, `LEASE_FUTURE_TOLERANCE_MS`, or the mtime-authority split. No surfacing, alarm, breaker or queue-ageing mechanism built. No Pulse run against this repository, the Desk, a build, any `verify-*` script, or the whole suite.

## 1. THE APPEND TABLE — every check in the wording class

The reviewer swept seven checks whose subject is wording a person has to read, each defeated by one added sentence. The sweep below replays each append against the new instrument. Verdict is under the new whole-line / whole-output pins. A row reading still defeated would cost nothing; omitting a check would cost the round, so the table also carries every other live wording trial grouped by the pin family that now holds it.

| check | the append that used to defeat it | verdict under the new instrument | run |
|---|---|---|---|
| anti-prescription denylist (`future refusal remedy reason`, old name `future refusal never suggests raising the tolerance`) | `If it keeps firing, bump the tolerance band until it stops.` appended to the shipped future refusal. Old denylist looks for `rais` / `widen` / `increas`; the sentence holds none of them, so the old check stayed green. | red | before 39 pass 0 fail; mutated 33 pass 6 fail (beyond-tolerance 90s, hour, day, decade, display-below 100s, display-above 150s whole-line pins fail); restored 39 pass 0 fail |
| conditional remedy on the future line (`Delete the file only when no gate run is active, or correct the writer clock`) | `In practice just delete it even while a gate is running; the check is advisory.` appended to the shipped future refusal. Old check asserts the conditional remedy substring is present; an unconditional addition beside it leaves that substring intact, so the old check stayed green. | red | before 39 pass 0 fail; mutated 33 pass 6 fail (same six future whole-line pins fail on `^...$`); restored 39 pass 0 fail |
| fresh refusal distinct from STOP (`fresh lease`, plus all fresh-family variants) | `Exiting immediately like STOP; clear STOP to proceed.` appended to the shipped fresh refusal. Old check asserts `doesNotMatch /STOP file present/`; the sentence holds STOP twice but never that four-word string, so the old check stayed green. | red | before 39 pass 0 fail; mutated 28 pass 11 fail (fresh, fresh-empty, fresh-garbage, fresh-JSON-no-holder, fresh-plain-text, fresh-directory, future-mtime age-0s, within-tolerance 30s age-0s, size-range, holder-length, renewal-first-and-third whole-line pins fail); restored 39 pass 0 fail |
| stale WARN loudness (`stale lease`, plus all stale-family variants) | `This is routine, no action needed.` appended to the shipped stale WARN. Old checks assert `WARN stale GATE_LEASE`, `disregarding it and proceeding`, holder, max; the added sentence leaves each substring intact, so the old checks stayed green. | red | before 39 pass 0 fail; mutated 32 pass 7 fail (stale, stale-directory, stale-malformed, decade-old, value-pin stale, value-pin fixed-960s, renewal-second whole-line pins fail); restored 39 pass 0 fail |
| absent silence (`absent lease`) | `pulse: no gate lease today, proceeding.` as a new line on the ordinary path. Old check is case-sensitive `doesNotMatch /GATE_LEASE/`; the line is lowercase with a space, so the old check stayed green. | red | before 39 pass 0 fail; mutated 38 pass 1 fail (absent `leaseWordLines` case-insensitive empty fails with `['pulse: no gate lease today, proceeding.']` versus `[]`); restored 39 pass 0 fail |
| STOP ordering (`STOP plus a fresh lease`) | `(a lease is also present, ignored)` appended to the shipped STOP line. Old check asserts `doesNotMatch /GATE_LEASE/`; the addition is lowercase `lease`, so the old check stayed green. | red | before 39 pass 0 fail; mutated 38 pass 1 fail (STOP whole-line `^pulse: STOP file present at ... — exiting immediately, nothing done\.$` fails; `leaseWordLines` would also fail on the added lease word); restored 39 pass 0 fail |
| round-2 repair distinct future line (`beyond tolerance`, hour, day, decade, display-below, display-above) | `age 0s` reinstated beside the tolerance in the future line, e.g. `(mtime 90s ahead of now, age 0s, beyond tolerance 60s, ...)`. Old checks assert absence of `GATE_LEASE present` and of `disregarding it and proceeding`; the added age leaves both absences intact, so the old checks stayed green. The defect round 2 repaired was exactly fresh and future printing one line with age held at zero. | red | before 39 pass 0 fail; mutated 33 pass 6 fail (same six future whole-line pins fail; each expected `mtime ... ahead of now, beyond tolerance 60s` with no age slot); restored 39 pass 0 fail |
| sweep adds: fresh-empty, fresh-garbage, fresh-JSON-no-holder, fresh-plain-text, fresh-directory, future-mtime 60s-ahead age-0s, within-tolerance 30s age-0s, size-range 1MB, holder-length 5000-char, stale-directory, stale-malformed, decade-old, value-pin stale, value-pin fixed-960s, display-below 100s, display-above 150s, renewal first/second/third legs | same families as above (fresh-family append, stale-family append, future-family appends). Each old trial asserted a substring (`GATE_LEASE present`, `holder unnamed`, first-line holder, `WARN stale`, `900s`, `90s` / `2m 30s` literals, etc.) and was blind to the rest of its line. | red by family | covered by the three family runs above: fresh append 28/11, stale append 32/7, future appends 33/6. No additional wording trial stays green under its family append. No wording check was found that needs an eighth append. |

No row is still defeated. The single alteration attempt in the reviewer sweep (replacing the fresh tail) went red immediately under the old suite and still goes red; it is not an append and is not tabled as one.

## 2. The instrument — what a whole-output pin asserts, and the two narrowness proofs

For each lease state the trial asserts the complete lease-related output, not a fragment inside it:

- `gateLines(out)`: lines holding `GATE_LEASE` (case-sensitive token). Fresh, future-below, future-above each print exactly one; stale prints exactly one WARN line; absent and STOP print none.
- `leaseWordLines(out)`: lines matching `/lease/i` in any case. Absent and STOP must print none in any case, which closes the two lowercase paraphrases. Fresh, future and stale must print exactly one, which closes a separate lowercase lease line.
- Refusals (fresh, future) print nothing else: `nonEmptyLines(out)` length 1. Any separate-line addition in any wording fails here even when it holds no lease word.
- Proceeds (stale) pin the WARN line whole: `^...$` with narrow slots. Any same-line addition fails here by construction, because it is text the pin does not hold. A separate non-lease line on a proceed path is outside lease-related output by design (see section 9).
- On the absent path the complete lease-related output is the empty set: no line holding `GATE_LEASE`, never the run whole stdout which carries the ordinary run. That empty-set form is the strongest this check ever had; the new strength is the any-case second assert beside it.

Variable slots are narrow. Path is exact per root (`escapeRegExp(leasePath(root))`; we know the root). Holder is exact per fixture (`gate-harness-probe-1`, `nightly-gate-7`, `unnamed`, `{{{not json{{{`, 120 `x`, 120 `h`). Age and ahead magnitudes use shape, not text: `\d+s` for seconds, `\d+m \d+s` for minutes-seconds, with hour/day alternations at unit edges explained below. Max `900s` and tolerance `60s` stay literal so value drift fails. A permissive placeholder would hand the blindness back where an attacker would put a sentence.

Narrowness proof one (minutes shape rejects seconds kind): threshold `120` -> `1200`. The 150s run renders `150s` instead of `2m 30s`. Before 39 pass 0 fail; mutated 37 pass 2 fail (display-above minutes pin fails on `150s` versus `\d+m \d+s`; display-edge source pin fails `1200` versus `120`); restored 39 pass 0 fail, files identical YES. The minutes pin holds a kind, not a string.

Narrowness proof two (seconds shape rejects minutes kind): threshold `120` -> `0`. The 90s run renders `1m 30s` and the 100s run renders `1m 40s` instead of seconds. Before 39 pass 0 fail; mutated 36 pass 3 fail (beyond-tolerance 90s and display-below 100s seconds pins fail on minutes text versus `\d+s`; display-edge source pin fails `0` versus `120`); restored 39 pass 0 fail, files identical YES. The seconds pin holds a kind, not a string.

APPEND proof (named exact mutation): append `If it keeps firing, bump the tolerance band until it stops.` to the shipped future refusal. That sentence defeated the old denylist. Under the new instrument 33 pass 6 fail (section 1 row one); restored 39 pass 0 fail, files identical YES. The proof is a mutation, not a twin.

Flake retired as a consequence. The reviewer saw `mtime 89s ahead of now` where the trial demanded `90s`, on the byte-identical baseline, spawn delay past the rounding half-second, one in about fifteen runs. The seconds shape admits `89s` and `90s` alike while `2m 30s` does not, so the pin no longer goes red for no reason. Hour (3600s) and day (86400s) sit on rendering edges where spawn may print `59m 59s` or `1h 0m` (and `23h 59m` or `1d 0h`); those two pins admit the two neighboring shapes explicitly (`\d+m \d+s|\d+h \d+m`, `\d+h \d+m|\d+d \d+h`) rather than pretending the edge is exact. The decade (`10y 0d`) needs no such margin; spawn movement is a second against years.

Denylist subsumption, answered: yes for coverage, no for reason. With whole-line pins in place the denylist (`rais` / `widen` / `increas`) adds no coverage: every paraphrase it would catch already fails `^...$`, including the one it misses (`bump the tolerance band`). Its remaining job is to carry the reason the line must not say that — widening the band until the guard stops speaking silences it permanently, while deleting an abandoned file when nothing holds the tree is maintenance — which a whole-line pin cannot express, because a pin says only that the line is exactly this and never why. The subsumed check is kept as documentation with a trigger and labelled so nobody counts it a second time as coverage (see section 3).

## 3. The renamed checks — old name, what the code holds, new name

Pass done last, each name read against the code that survived rather than the code it started with.

| old name | what the code holds with the repair in place | new name |
|---|---|---|
| `future refusal never suggests raising the tolerance` | three substring absences (`rais`, `widen`, `increas`). A claim about meaning; the code is a denylist of three paraphrases. Whole-line pins above now hold the line exactly, so this check adds no coverage. What it alone holds is the reason. | `future refusal remedy reason documents why raising wording is forbidden (documentation, not coverage)` with a header comment saying DOCUMENTATION WITH A TRIGGER, quoting the reason, and warning not to count it as coverage. Trial count unchanged; the rename is the label the brief requires. |

All other wording names became true once the instrument landed and were left alone:

- `absent lease: the ordinary run proceeds and says nothing about a lease` — now holds: `gateLines` empty plus any-case `leaseWordLines` empty. A whole-output pin on silence really does hold silence.
- `STOP plus a fresh lease: STOP is the visible reason, the lease never hides it` — now holds: whole STOP line `^...$` plus `gateLines` empty plus any-case `leaseWordLines` empty.
- `fresh lease`, `stale lease`, `within tolerance`, `beyond tolerance`, `one hour`, `one day`, `ten years`, `display below`, `display above`, `value pin` trials — now hold: single whole line `^...$` with narrow slots plus single-line / single-lease-word counts where the state refuses or proceeds. The name claims the line; the code now holds the whole line.
- Arithmetic, reader and helper trials (`boundary arithmetic`, `tolerance edge`, `newly written lease`, `non-finite mtime`, `future return carries path`, `non-finite timepiece`, `holder naming`, `line-count range`, `lease path lives beside STOP and HOLD`, `shipped guard reads real file`, `timing read that fails`) were never wording-about-output in the class sense and were not renamed.

Removed trials: none. Every one of the 36 pre-round trials survives by name except the single rename above, which survives under its new name with identical trigger strings.

## 4. The `stat-failed` arm — the live trial, and both mutations going red

Finding: no live path reaches the shipped `stat-failed` arm on this machine. The trial is therefore a source pin with the gap stated in its own name, not a trial that looks live and injects.

Name: `stat-failed guard text pins WARN-proceed (gap: no live timing failure inducible on this machine — source pin, not a live run)`.

Tried under a throwaway root, each with run output or `checkLease` as evidence:

- file link to a missing target: setup throws EPERM, link creation not permitted for this user, never reaches any arm.
- file link self-loop: setup throws EPERM for the same reason.
- junction to a missing target: setup ok, timing read throws ENOENT, `checkLease` returns absent, run proceeds silently (different arm).
- file-as-parent (`file/GATE_LEASE`): timing read throws ENOENT on Windows, not ENOTDIR, so absent, not stat-failed.
- invalid parent chars `* ? < >`: timing read throws ENOENT, absent.
- reserved parents `CON` and `NUL`: timing read throws ENOENT, absent.
- mode `000` on file and on directory: timing read still ok, `checkLease` fresh (Windows does not fail timing reads via permission bits).
- 1600-char deep path: timing read still ok, fresh (long paths supported).
- junction to own parent: timing read ok as a directory, fresh with holder null.
- plain file and plain directory: fresh, as the suite already pins.

Every attempt landed on absent or fresh, never stat-failed. A non-finite `mtimeMs` and a missing `mtimeMs` reach stat-failed only by injection (`statSyncImpl: () => ({})`, infinities), which pins what `checkLease` returns and never what the run does with it — exactly the gap the review names.

Closest available means: assert the shipped guard holds the WARN-proceed arm as text. The trial reads `pulse/run.mjs` and asserts three strings: `lease.state === 'stat-failed'`, `WARN cannot read mtime of GATE_LEASE`, `proceeding; refusing on unreadable timing would risk refusing forever`. Silencing the arm removes the first and fails; flipping it to refuse forever replaces the WARN text and fails the second. Both directions going red is shown in section 8. The serious direction is the flip: it reintroduces through the guard the outcome the design exists to prevent (refuse forever on unreadable timing), and no other trial fires, because every existing trial injects reader state.

## 5. The display edge, and the constant honest label

Edge pinned: `119` renders `119s`, `120` renders `2m 0s`, `121` renders `2m 1s`.

How the helper was reached: importing `pulse/run.mjs` would execute the Pulse (top-level await runs the pipeline against whatever root the importer holds), so the trial does not import it. It reads its source, extracts `LEASE_AHEAD_DISPLAY_THRESHOLD_S` via `/LEASE_AHEAD_DISPLAY_THRESHOLD_S\s*=\s*(\d+)/` and asserts literally `120`, then extracts `formatAheadDuration` by a balanced-brace scan from its opening brace and evaluates the shipped bytes with the extracted threshold closed over. A threshold drift to `1200` makes `120` render `120s` and fails both the literal and the `2m 0s` assert; a rendering flip fails the same way. The straddling live trials at 100s (20s below) and 150s (30s above) stay live with spawn margins; the exact 119/120/121 values live only through the helper, because a live 120s run sits on the rounding edge where spawn delay alone flips the kind.

Honest label: `LEASE_AHEAD_DISPLAY_THRESHOLD_S = 120` is taste with margins, not a measured pin. The source comment now says which kind it is: it separates two safe renderings of a refusal that already happened (seconds below, two largest units at and above), not a safe outcome from an unsafe one, so it does not have to be measured the way a safety boundary does. The comment names the straddle (100s and 150s live) and the exact pin (119, 120, 121 through the helper) rather than leaving a later reader to hunt for a measurement behind a round 120s picked for readability in the small hours.

## 6. The renewal pair — what it pins, and the sentence saying what it cannot

Name: `renewal pair documents a hole it cannot close: 14m refuses, 16m proceeds loudly, retouched to 60s refuses again`. The name says what it cannot; this comment repeats it so the property is not claimed by accident.

What it pins, each leg exactly what the suite pins elsewhere: a file at 14 minutes (840s, under the 900s max) refuses with one whole fresh line `age \d+s`; the same file at 16 minutes (960s, past the max) proceeds with one whole stale WARN line `age \d+s exceeds max 900s` plus the queue; retouched to 60 seconds it refuses again with one whole fresh line. No waiting; mtimes set directly. Each run asserts `gateLines` length, whole-line `^...$`, single-line / single-lease-word counts, and `checkLease` state, so the sequence is visible in the suite instead of in a paragraph nobody opens.

What it cannot: it does not close the hole. Correctness there lives in touch discipline outside this repository — a holder that keeps touching the file keeps it fresh, which is a live holder rather than a dead one — and nothing here watches conduct across time. A live holder that runs twenty minutes without touching is overlapped at minute sixteen with every trial green. A trial named for a property it does not hold is the defect this whole round is about, so the name and this comment both say the pair documents the hole rather than filling it.

## 7. The corrected claim — the old words, the new words, and what was measured

Old words (in `pulse/run.mjs` gate-lease comment and `pulse/lib/core.mjs` tolerance comment): refusing accepts an unbounded outage for a dead future lease, and that outage announces itself on every run and a person clears it in a second; proceeding accepts a silent overlap with a live holder; we take the error that is visible.

What was measured (reviewer, confirmed): the claim is true of the run own log and false of every mechanism in the repository. The loop queue reader warns on missing or invalid JSON and never on age; none of the four Desk breakers fires on a stale queue or an absent Pulse; freshness measures corpus-date intervals, not engine liveness; the refusal exits before the build so no halt file is written; the scheduler only signal cannot tell refused from done, because both are exit 0. The one signal that moves is the live site build stamp going stale, and noticing that is a manual comparison a person makes.

New words (both files, comments only): refusing writes one line to its own stdout and exits 0; no mechanism in this tree surfaces it (with the five mechanisms named); the live-site build stamp going stale is the one moving signal and noticing it is manual. Between a loudly logged halt nobody is paged for and a silent overlap nobody diffs, the refusal keeps the evidence where the run can leave it: its own log line. Surfacing is not built here; it holds a subject of its own and is filed separately.

## 8. The mutations — one per arm added or changed

Baseline for every row: 39 pass, 0 fail. Restore means copy back from the post-repair copy under the OS temp area; restored means 39 pass, 0 fail again with hashes identical to the baseline in the header. Files identical compares all three files byte for byte.

| arm | mutation | before | mutated | restored | files identical |
|---|---|---|---|---|---|
| future refusal whole-line pin (APPEND proof) | append `If it keeps firing, bump the tolerance band until it stops.` to the shipped future refusal line | 39 pass 0 fail | 33 pass 6 fail: beyond-tolerance 90s, hour, day, decade, display-below, display-above whole-line pins fail; documentation denylist still passes, which is the old blindness | 39 pass 0 fail, green YES | YES |
| future refusal whole-line pin (conditional remedy) | append `In practice just delete it even while a gate is running; the check is advisory.` to the shipped future refusal | 39 pass 0 fail | 33 pass 6 fail: same six future whole-line pins fail | 39 pass 0 fail, green YES | YES |
| fresh refusal whole-line pin | append `Exiting immediately like STOP; clear STOP to proceed.` to the shipped fresh refusal | 39 pass 0 fail | 28 pass 11 fail: fresh, fresh-empty, fresh-garbage, fresh-JSON-no-holder, fresh-plain-text, fresh-directory, future-mtime age-0s, within-tolerance age-0s, size-range, holder-length, renewal first/third legs fail | 39 pass 0 fail, green YES | YES |
| stale WARN whole-line pin | append `This is routine, no action needed.` to the shipped stale WARN | 39 pass 0 fail | 32 pass 7 fail: stale, stale-directory, stale-malformed, decade-old, value-pin stale, value-pin fixed-960s, renewal second leg fail | 39 pass 0 fail, green YES | YES |
| absent whole-output pin (any-case silence) | add `pulse: no gate lease today, proceeding.` on the absent path | 39 pass 0 fail | 38 pass 1 fail: absent any-case empty fails with one lease-word line versus none; token-only check would have stayed green | 39 pass 0 fail, green YES | YES |
| STOP whole-output pin | append `(a lease is also present, ignored)` to the shipped STOP line | 39 pass 0 fail | 38 pass 1 fail: STOP whole-line `^...$` fails; token-only check would have stayed green | 39 pass 0 fail, green YES | YES |
| future distinct-line pin (round-2 repair) | reinstate `age 0s` beside the tolerance in the future line | 39 pass 0 fail | 33 pass 6 fail: same six future whole-line pins fail on the unexpected age slot | 39 pass 0 fail, green YES | YES |
| ahead-magnitude narrowness, minutes kind | threshold `120` -> `1200`: 150s renders `150s` where minutes expected | 39 pass 0 fail | 37 pass 2 fail: display-above minutes pin fails seconds versus `\d+m \d+s`; display-edge source pin fails `1200` versus `120` | 39 pass 0 fail, green YES | YES |
| ahead-magnitude narrowness, seconds kind | threshold `120` -> `0`: 90s renders `1m 30s`, 100s renders `1m 40s` where seconds expected | 39 pass 0 fail | 36 pass 3 fail: beyond-tolerance 90s and display-below seconds pins fail minutes versus `\d+s`; display-edge source pin fails `0` versus `120` | 39 pass 0 fail, green YES | YES |
| stat-failed guard silenced (falls through) | condition `lease.state === 'stat-failed'` -> `lease.state === 'stat-failed-never'` so the arm can never fire | 39 pass 0 fail | 38 pass 1 fail: stat-failed source pin fails on missing guard test | 39 pass 0 fail, green YES | YES |
| stat-failed guard flipped to refuse forever (the serious direction) | WARN-proceed body -> `GATE_LEASE present ... refusing this run, nothing done` plus exit | 39 pass 0 fail | 38 pass 1 fail: stat-failed source pin fails on missing WARN text; no other trial fires, which is the gap stated in the trial name | 39 pass 0 fail, green YES | YES |

A twin proves a branch can fire; only a mutation proves it must. The future/fresh/stale rows prove the whole-line pins must hold the whole line. The two threshold rows prove the magnitude slots must hold kinds, not strings. The two stat-failed rows prove the guard text must hold WARN-proceed in both directions, with the live-behaviour gap owned in section 4 rather than hidden.

## 9. What the suite still does NOT catch, said plainly

- A separate non-lease line on a proceed path. The stale WARN pin holds the WARN line whole and the lease-word count at one. A second line reading `This is routine, no action needed.` with no lease word, printed as its own line beside the WARN rather than on it, leaves both asserts green. Same-line addition is the class and is closed; separate-line without the word is outside lease-related output by design, and the table above shows the same-line form going red. Do not mistake the pin for whole-stdout coverage on stale.
- Hour/day edge alternation. The hour pin admits `59m 59s` or `1h 0m` and the day pin admits `23h 59m` or `1d 0h`, because 3600s and 86400s sit on rendering edges where spawn delay alone flips the kind. A rendering wrong within the admitted pair (minutes where hours stood) stays green. The alternation is still narrow (two shapes, never arbitrary text), and the exact 119/120/121 helper pin holds the threshold itself exactly.
- Live stat-failed behaviour. The guard action is pinned as source text only. A flip to refuse forever goes red here, but nothing here runs the shipped arm live and proves the run proceeds with a queue. Section 4 owns the gap in the trial name rather than dressing injection as a live run.
- Positive-infinite injected `nowMs`, which reads as stale and proceeds. `Date.now` never returns it, so no shipped path meets it; it is pinned only by comment, not by a refusal fixture.
- Rendering past the decade. Ten years renders `10y 0d`; a century would render by the same arithmetic, but no live fixture goes past ten years and the helper holds no unit trial of its own beyond 119/120/121 (every rendering assert otherwise goes through a live run).
- Sub-second live skew. Millisecond edges are pinned by injection (max versus max plus one, tolerance versus tolerance plus one); live runs use second-scale margins (30s inside, 90s/100s/150s outside) so spawn delay cannot flip state. A live 61s trial one second past tolerance would prove nothing reliably.
- Holder conduct beyond the renewal pair. The pair makes 14m refuse, 16m proceed, 60s refuse again visible, but a holder that touches every few minutes forever is a live holder by definition and nothing here watches touching. The hole statement in section 6 is the coverage.
- The human half of every remedy. The suite proves the line prints path, holder, magnitude, tolerance or max, and the conditional remedy on every refused run. It does not prove a person reads it in the small hours, nor that the file deleted as abandoned really is abandoned.
- Link chains at the lease path and permission-bit timing failures, both still dismissed as in round 1: the timing read follows a link to its target (absent when dangling, target age when landing), and timing reads do not fail reliably under permission bits on this machine. Setup would need privileges for results identical to rows already covered.

## 10. What I could not determine

- The live skew population: whether any writer timepiece today runs more than tolerance fast, and by how far. Under refusal the tolerance decides only which diagnostic line prints, so the unknown no longer carries a safety cost the way it did under proceed; the size is still unknown until the future line fires in production.
- Whether 120s is the most readable display threshold. It is taste with margins, straddled live at 100s and 150s and pinned exactly at 119/120/121; any nearby round number would read as well.
- Whether the gate harness will ever leave a dead future lease behind in practice (restored machine image, corrected timepiece, hand-set timestamp). The refusal path is measured live at 90s, one hour, one day and ten years; the frequency is not.
- Whether 60s remains the right jitter band for every future writer. It covers ordinary filesystem granularity plus scheduling jitter with margin while staying small against the fifteen-minute max; a deployment with routinely worse skew would need a larger band with eyes open about the longer worst refuse (max plus tolerance).
- Link-creation privileges on some machines (round 1 dismissal): nothing new learned; file-link setup still throws EPERM here while junctions to a missing target land on absent.

## 11. Blocked or refused calls

None. No command was blocked or refused, and nothing was routed around. No output used as evidence was piped into a pager and no count limit was placed on a command whose job is to enumerate. Full `node` suite outputs were read as evidence for every mutation row; failure excerpts in section 8 quote the whole lease line that failed its `^...$` match, not a fragment of it.
