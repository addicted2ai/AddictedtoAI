# SPEC REVIEW — arch-specfix-review-r2.md — VERDICT: REVISE

## Findings

### 1. (BLOCKING) Restated back-desk bound trigger names no key — untestable, no enumerable domain
**Exact requirement quoted** (`loop/spec.md:950-955`, repeated `2347-2355`, scenario `975-980`):
> `Once both desks exist — that is, once the declared data/config.json key for the restated bound is present — the bound ... SHALL be restated as the back desk's share of total effort`
> `WHEN the declared data/config.json key for the restated bound is present and the back desk's global share ... reaches its configured bound`

**Evidence** — command and output:
```
Get-Content -LiteralPath "D:/addictedtoai-worktrees/fleet6-specfix/data/config.json" | Out-String
# { "publish": false, "budget": { "bounds": { "upkeep_floor_pct":40, "new_writing_ceiling_pct":45, "machinery_ceiling_pct":30 }}, "job_caps_minutes": {...}, "degradation": {...} }
# No back-desk / share key exists, and neither delta paragraph nor tasks.md:79 names one:
Get-Content tasks.md | Select-Object -Skip 2080 -First 40
# "...a declared data/config.json key read against the effort both desks recorded..." — no key name
```
Two SHALL paragraphs plus one scenario turn on presence of a key the archived text never names. Two readers holding only this text cannot enumerate the domain ("which key?") and no test can fail on an unnamed key.

**Severity:** BLOCKING — an implementer must guess the key name; a wrong guess yields a bound that never fires or always fires while believing it followed the text.

**Fix in one sentence:** Name the exact key (e.g. `budget.back_desk_share_pct`) in both restatement bodies and the scenario WHEN.

### 2. (BLOCKING) Global share states no period / window — `over the same period` / `until the window rolls`
**Exact requirement quoted** (`loop/spec.md:954-955`, `2352-2354`, `978-979`):
> `whose share is measured globally: back-desk model-minutes divided by the model-minutes both desks recorded over the same period`
> `THEN no further back-desk work is selectable until the window rolls`

**Evidence:**
```
Get-Content loop/spec.md | Select-Object -Skip 950 -First 35  # shows "same period", no days
Get-Content loop/spec.md | Select-Object -Skip 2347 -First 15 # same, plus "(not per tier...)"
# Tier bounds in same file state rolling 30 days + warm-up explicitly (2273-2291, 2368-2391); global paragraphs do not.
```
"Same period" as each other is not a period; "the window" for a global cross-desk bound is not identified with the 30-day tier window, a since-desks-exist window, or something else, and the warm-up / floor rules are not scoped in or out.

**Severity:** BLOCKING — per-tier vs global implementers compute different denominators from the same text.

**Fix in one sentence:** State the rolling window for the global share (e.g. rolling 30 days, with or explicitly without warm-up) in both restatement paragraphs and replace `until the window rolls` with that named window.

### 3. (BLOCKING) Tier-separate rule contradicts global exception — internal contradiction
**Exact requirements quoted:**
> `Shares SHALL be computed within each tier separately ... and the bounds below SHALL hold in each tier independently (frontier shares of the frontier total; cheap shares of the cheap total)` (loop:2282-2285)
> `measured globally as back-desk model-minutes divided by the model-minutes both desks recorded over the same period (not per tier: the two desks partition kinds of work, not tiers...)` (loop:2352-2355, same at 954-955)

**Evidence:** `Get-Content loop/spec.md | Select-Object -Skip 2271 -First 90` shows both standing with no scoping clause; the first is universal, the second is an unscoped parenthetical exception.

**Severity:** BLOCKING — one reader follows the universal and computes per-tier, another follows the parenthetical and computes globally, both claiming compliance.

**Fix in one sentence:** Scope the tier rule once as `Except for the restated back-desk share bound, shares SHALL be computed within each tier separately...`.

### 4. (BLOCKING) `One real run clears it` scenario is arithmetically false under the window it claims
**Exact requirement quoted** — threshold bullet (loop:2118-2120) + scenario (loop:2180-2185):
> `After three such runs within that runner's last five invocations in that role, the loop SHALL refuse that runner...`
> `WHEN a refused runner whose last five invocations in that role include exactly three empty ones is repaired, and its next run produces a diff / THEN that producing invocation replaces one window slot, two of the last five remain empty, and the runner is selectable again`

**Evidence:** Window is last-five sliding (`2127-2135`: `count SHALL fall out of the window as producing invocations replace empty ones`). Old window `[a,b,c,d,e]` with exactly 3 empties + new producing `f` yields new window `[b,c,d,e,f]` with `3 - (1 if a empty else 0)` empties. Counterexample: old `[producing,producing,empty,empty,empty]` is refused (3 in 5); `f=producing` evicts a producing slot, new window still has 3 empties and still refuses — THEN's unconditional `two remain ... selectable again` is false and contradicts the SHALL.

**Severity:** BLOCKING — scenario does not demonstrate its requirement (check 7) and instructs the wrong trip/clear logic.

**Fix in one sentence:** Condition the WHEN on the evicted oldest slot being empty (or change THEN to the conditional `two remain where the evicted slot was empty, otherwise three remain and refusal stands`).

### 5. (non-blocking) Breaker window uses undefined `succeeded`/`success` and drops `evicted-at-train` from second exclusion
**Exact requirement quoted** (loop:1468-1487):
> `The count SHALL be taken over a window of the last five jobs of that type that either failed or succeeded... The last five are the five most recently appended done/failed/discarded ledger entries...`
> `A rule that walks the ledger backwards and stops at the first success...`
> `The window SHALL be drawn only from outcomes that are a failure or a done. blocked, interrupted, capacity and abandoned neither count...` — omits `evicted-at-train`, though line 1466 says `evicted-at-train outcomes never count`.

**Evidence:** `Get-Content loop/spec.md | Select-Object -Skip 1459 -First 75` shows `succeeded`/`success` never defined elsewhere; operative definition pins `done/failed/discarded`, so first-sentence looseness is rescued by the second sentence, and the slot-occupancy of `evicted-at-train` must be inferred from the first definition alone.

**Severity:** non-blocking minor.

**Fix in one sentence:** Replace `succeeded`/`success` with ``done`` throughout and add `evicted-at-train` to the neither-count-nor-occupy list.

### 6. (non-blocking) `parked line` undefined; live `streak` heading retained against window body
**Exact requirements quoted:**
> ``DIRECTIVES.md retires: each pending line — a list-item line carrying no [done <date> <job-id>] marker — ... and a parked line migrates with it once it is made live again`` (loop:2495-2498)
> `#### Scenario: A reviewer-only runner accumulates a streak / WHEN ... within its last five invocations ... / THEN three of the last five produced nothing...` (loop:2158-2164)

**Evidence:** `Get-Content DIRECTIVES.md` shows parked lines are non-list-items (`parseDirectives matches list items only`) but the delta never defines `parked`; `Select-String` on the delta shows `streak` surviving only in that live heading while the body correctly uses `no-output count` — author §2 proves validate's no-drop rule refuses a delta-only rename.

**Severity:** non-blocking — migration is one-time history after archiving; heading/body divergence is legacy, body governs, but a later reader sees adjacent terms for one mechanism (check 9).

**Fix in one sentence:** Define `parked` as `a non-list-item line in the parked section` or delete the clause, and add a parenthetical to the scenario that the heading word `streak` is legacy and the body's count governs.

## Requirements with no discoverable enforcement
- Breaker-1 window (`last five ... three failures`, ledger-append order): no live instrument — `loop/lib/breakers.mjs:checkConsecutiveFailures` + `budget.mjs:consecutiveFailures` still walk backwards consecutively; text does not admit non-enforcement, but `tasks.md` (breaker-1 re-derivation with mutation restoring the consecutive walk) is the named future instrument — acceptable forward reference, not drift, provided tasks land before archive.
- Runner-health window (`three within last five`, `any-capacity` lane pause, backoff `run of capacity`): no live instrument — `loop/lib/health.mjs:202-214 noOutputStreak` is `for(...; else break)` consecutive (verified), contradicting the new window today; same forward-reference cover via tasks (interleaved test, `capacity,done,capacity` test); the `Implemented by ... measured by G8A` pointers are stale today but will be true after tasks — do not treat as permanent falsehood.
- Back-desk share bound + `DIRECTIVES.md` migration + intake desk routing: no live code/test (config has no key; `directives.mjs` still exists); tasks 79/80/89 name the instruments — list here so archive checks them, not as a verdict driver.
- All other new SHALLs (work-order bounds double-enforcement, train prefix/seal/manifest, `would-cite-for` per-piece refusal, `rederived:` block, reservations/locks) name their gate (`merge SHALL refuse`, `train SHALL fail`, source check) — enforceable as written.

## Checked and sound
- F1 `discarded` in breaker body-count: `failure/done (failure = failed or discarded)` + `done/failed/discarded` ordering now agrees with governing-type body; second scenario (`failed,failed,done,failed` append order) already agreed — sound.
- F5 unit rejection: architect's concession accepted and correct — breaker counts per **governing job type** (loop:1464), `that runner in that role` is the runner-health unit (loop:2118); author's `for jobs of that governing type` follows the requirement body, not a cross-requirement slip — sound, no finding.
- F6 `would-cite-for` N=1: double qualifier (`alone satisfies nothing for N>1` + em-dash `where more than one prose piece is present`) plus N=3 refusal scenario closes the over-read — sound.
- F7 `Desk`/`desk` + `lane` reservation in place (loop:931-933); chain `lane pause` vs `desk` partition are distinct concepts, no overload — sound.
- F3 priority-without-value: author is right — `tasks.md:89` requires `a priority` with no value, band mapping lives only in uncommitted evidence; stating priority-existence without inventing a band agrees exactly as far as the record goes — sound, no value to pin.
- F2b window conformance + clearing/interleaved scenarios, gate-retry/chain/capacity sweeps (`breaker 1`, `breaker-1 count`, `run of capacity`), 30% machinery scenario matching `data/config.json:machinery_ceiling_pct:30` with drain narrative + revert condition — sound.
- Machinery rule (check 8): `Select-String` for model/provider/harness names over both delta specs returns empty; chain bullet's registry-only rule enforces it — sound.
- REMOVED blocks (check 6): `One job is one outcome...` / `Work comes from three sources...` carry every clause into ADDED replacements; only archived-history hits reference old headings, no live code/test/requirement depends on them — sound.
- Already-true (check 4): 30% codifies the live config value but text explicitly marks it a deliberate loosening with revert/supersession accounting — acknowledged codification, not a silent no-op — sound.

## What an implementer would still guess
Holding only this archived text, the implementer must invent the restated bound's key name, its rolling period, and whether warm-up/floor arithmetic applies — the most likely build is a selector reading a guessed key (or the old `machinery_ceiling_pct`) over a guessed 30-day per-tier window, believing it implemented "global share" while the bound never fires as law intended and no test in the text can prove otherwise.

## What I ran
- `Get-Content loop/spec.md` slices at 823/925/1459/1625/2347 + `review/spec.md` full + `openspec/specs/loop/spec.md` + `openspec/specs/review/spec.md` live comparisons
- `Get-Content data/config.json` (no back-desk key; bounds 40/45/30)
- `Get-Content tasks.md | Select -Skip 2080 -First 40` (task 79: declared key, unnamed) + `Select -Skip 2195 -First 30` (task 89: `same text and a priority`)
- `Get-Content DIRECTIVES.md` (list-item vs parked shape) + `Get-Content loop/lib/health.mjs -Skip 180 -First 70` (`else break` consecutive) + `Get-Content loop/lib/breakers.mjs` (consecutive) + `Get-ChildItem loop -Recurse`
- `Select-String` scans for model names (empty), `pending|parked|priority|globally|governing type|lane|desk`, and old-heading dependents (archive-only hits)
- All commands read-only; no edits, no builds/tests, no subagents, no worktree changes
