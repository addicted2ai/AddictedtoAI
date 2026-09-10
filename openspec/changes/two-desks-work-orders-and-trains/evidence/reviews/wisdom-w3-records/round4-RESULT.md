# THE RECORD EXPIRY CHECK — RESULT4

Local date: 2026-09-10.

Authority: two-desks-work-orders-and-trains@a5e873b.

Baseline before starting: 25 tests, 24 pass 1 fail. The one fail was the zone control (`live wall ignores the caller zone override`): direct read `2026-09-10` vs want not-equal `2026-09-10`. Niue shares the date here 19 of 24 hours, so the fixed instrument had no split to show. No edit in between; green at commit, red fifteen minutes later.

Baseline at end: 27 tests, 27 pass 0 fail. One old zone test removed, three new zone tests added (fixed-instant, selected-instrument live, forced refusal). Display name now computed from the constant; `ordered` removed from the identity comment; header number replaced by a pointer. No other disposition, date or owner changed. No anchor lengthened or re-derived.

Linter file byte-identical: SHA-256 `6294C11533EE19E12283ED4F5AFCBCC75884ECC293F85D57D14418357EA15792` before and after. Records file clean hash for this round: `D78FC912E42AC57B811359E12CEBF655C28C52A7194E298B14EE18DB9E61AB2D`.

## 1. THE DISPOSITION TABLE — every pair, and which of the three it got

Cost means what a careful edit must touch together to stay green. All edits in one diff, all visible for review. Review carries what mechanism cannot tell apart.

| pair | disposition | what it now costs to defeat | ran |
|---|---|---|---|
| P1 Careful deletion: remove a record, update COUNT, identity list, map entry and batch/controls together | RECORD, owner orchestrator, expires 2026-10-10. Cost is many edits, review carries it. Code cannot tell legitimate retirement from evasion. | Must touch RECORDS plus EXPECTED_COUNT plus EXPECTED_IDS plus EXPECTED_ANCHOR_FOR_ID plus batch/full numbers (21/20, 22/21 in four controls) together. All visible in the diff. | Single-side (Nsplit removed only): 19 pass 8 fail, Check S names `record count 21, want 22 (missing: Nsplit)`. Double-side (H6b removed plus COUNT 22 to 21 plus IDS/MAP minus H6b plus controls 21 to 20 and 22 to 21): 27 pass, stays green. Display name followed automatically to 21, proving deriving. Restored green again. |
| P2 Careful anchor substitution: replace one record anchor with another record anchor in both the map and the records | RAISE THE COST, kept from round 3. Second map stays even though second source, because it lifts one place to two (three to stay fully green, see ran). | Single-side (RECORDS only) must also touch MAP to silence Check T, so 2 places. Double-side (both) keeps gates green but breaks one bind that assumes the old map, so to stay fully green must also touch that bind fixture, so 3 places. All visible. | Single-side file edit (B2 to B3 arm in RECORDS only): 24 pass 3 fail, Check T names `B2: anchor drift`. Double-side file edit (B2 to B3 arm in both RECORDS and MAP): gates green (Check A, Check T pass, counts agree twice as predicted), one bind red (`joint anchor move` expects drift, got none): 26 pass 1 fail. To stay fully green must touch the bind too. Restored green again. |
| P3 Order is furniture: identity list called ordered, compared with includes never by order | DELETE. No real edit exercises order, nothing binds it, nobody names a use. Decoration reading as coverage. | Nothing. Word removed. Order never mattered for any verdict. | Reorder IDS (swap B2/B6trim positions): 27 pass, stays green, proving furniture. Deletion leaves 27 pass. Sweep shows `ordered identity` 0, remaining `ordered` 1 is the candidate list (first differing wins, order load-bearing there, correctly claimed). |
| P4a Narration display name vs COUNT | RAISE THE COST by deriving. Name computed from the constant cannot drift. Strictly better than pinning where available. | Cannot drift. No second place. | After fix: `test(`records: shape holds and the count is ${EXPECTED_COUNT}`)`, 27 pass. Sweep: `twenty-two` 0. Before, a word change stayed green (names never bind); after, no word to change. |
| P4b Header comment count vs COUNT | DELETE the number. Comments never run. | Nothing. Pointer replaces number: `Count: see EXPECTED_COUNT; the number is not repeated here so it cannot drift.` | 27 pass after. Sweep: `twenty-two` 0. Remaining `twenty-four` 2 and `24 to 22` 2 are history (round 3 left 24, retired to 22), not current facts to keep in step. |
| P5a Helper source to local-getter vs universal-getter form | RECORD, owner orchestrator, expires 2026-10-10. Cost is one edit, review carries it. | One edit (helper to universal getters) stays green on days local and universal agree (2026-09-10 both give the same date here), review carries it. | Helper to universal getters: 27 pass, stays green. Restored green again. File holds zero universal getters (`getUTC` 0, `Date.UTC` 0, `toISOString` 0, `toUTCString` 0, `getTimezoneOffset` 0 in the test file). |
| P5b Helper source to a fixed past date | RAISE THE COST, already bound via restore agreement and forced selection. Measured, correcting the enumeration claim that both pass. | Must also touch restore checks plus forced selection to stay green (3 plus places). Fixed past breaks clean-state agreement and makes the system zone look like an instrument. | Helper to `return '2000-01-01'` first: 25 pass 2 fail (selected-instrument restore `2026-09-10` vs `2000-01-01`; forced selection finds the system zone differing from fixed past, throws-miss). Restored green again. UTC passes, fixed-past fails; reported as measured. |
| P6 Owner suitability (any non-empty value passes) | RECORD, owner orchestrator, expires 2026-10-10. Presence checked, roster absent in tree by design (inventing one rots the same way). Cost is one edit, review carries suitability. | One edit (orchestrator to someone-else, non-empty) stays green, review judges suitability. | Owner rewritten: 27 pass, stays green. Restored green again. |
| P7 Reason prose (filler with a space passes) | RECORD, owner orchestrator, expires 2026-10-10. Non-emptiness checked, tie to own prose not mechanisable (pretending otherwise worse than gap). Cost is one edit, review carries substance. | One edit (reason to plausible filler with a space) stays green, review judges substance. Paper twin still paper. | Reason replaced with filler: 27 pass, stays green. Restored green again. |
| P8 Sweep add: MAP keys vs IDS list (which identities) | RECORD, owner orchestrator, expires 2026-10-10. Same cost as P1, same visibility. | Must touch both together (plus RECORDS/COUNT/controls for full green), visible. | Covered by P1 single-side red and double-side green. |
| P9 Sweep add: control hardcoded numbers (21/20 batch, 22/21 full) vs COUNT/IDS | RAISE THE COST, kept pinned on purpose. Deriving them from the constants would make deletion echo (both sides move together). Pinned numbers catch deletion by failing. | Must touch controls plus pins together (see P1 cost). | Covered by P1: single-side deletion breaks batch (`want 21 got 20, missing Nsplit`) and full (`21 vs 22`) plus live-pin view; double-side needs control updates to stay green. |

Unowned prose is not used. Every RECORD row names owner orchestrator and expiry 2026-10-10 (with the wall batch, so re-swept together). Every BOUND claim names the failing test and the counts.

## 2. The zone control — the two halves, and the forced refusal

Platform correction first, measured not argued. Windows Node honours the zone override correctly here, node v24.13.0, 05:21 local, system zone America/Denver:

- no override: getters 2026-09-10 offset 360
- fixed instant under America/Denver: 2025-12-31 offset 420 (winter UTC-7)
- fixed instant under Pacific/Kiritimati: 2026-01-01 offset 840 (UTC+14)
- fixed instant under Pacific/Apia: 2026-01-01 offset 780
- fixed instant under Asia/Tokyo: 2026-01-01 offset 540
- fixed instant under Etc/GMT+12: 2025-12-31 offset 720 behind

Niue sharing the date here is a working override, not a broken one. The review had one observation and two causes; the first (time window) explains it completely. A false finding that a guard is unnecessary is the most expensive kind. Section 7 of the review holds; section 3 platform claim does not. Fixed pair below chosen for the gap, not inherited.

(a) Override reaches a direct read, no clock. Fixed instant `2026-01-01T06:30:00Z` (`FIXED_INSTANT_MS`). WHY beside the constant in the file: Denver UTC-7 (MST) so 06:30Z is 23:30 on 2025-12-31 there; Kiritimati UTC+14 so same instant is 20:30 on 2026-01-01 there; 21-hour gap crosses the date line. Test sets the override to each zone in turn and reads the fixed instant via local getters, expects `2025-12-31` and `2026-01-01`, asserts they differ. Deterministic every hour because instant and zones fixed. Mutation `FIXED_DENVER_WANT` to the wrong date: 26 pass 1 fail (fixed-instant test, actual `2025-12-31` vs wrong). Restored green again.

(b) Live wall ignores the override, needs a real now. Selects at run time the first candidate whose current date differs from the system date; refuses (throws) when none differs, fail never skip (a skip reads as a pass). Candidate list ordered EASTWARD, east first: `['Pacific/Kiritimati', 'Etc/GMT+12']`. Comment in file carries the full band that two sessions missed: Kiritimati 20.0h, Apia 19.0h, Tokyo 15.0h, against GMT+12 6.0h, UTC 6.0h, Niue 5.0h, Midway 5.0h, Honolulu 4.0h. The two are complements not alternatives: Kiritimati covers all but its own four-hour hole, GMT+12 covers exactly that hole. Walked all 144 ten-minute instants of 2026-09-10 via a temp helper (`r4-walk-day.mjs`): 0 with no instrument, Kiritimati 120, GMT+12 24, `noneAt=[]`. Test then sets the override to the selected instrument and shows both arms: direct tainted (`notEqual` direct vs system) plus system clean plus live clean. Echo guard in the file: this control establishes its own baseline (system) so it refuses to pass on clean live alone; clean alone with no tainted direct is an echo; first run cannot detect drift. Without the tainted-direct assertion the test would be an echo. Mutations: `!==` to `===` in selection: 25 pass 2 fail (selected-instrument throws no-instrument here where both differ, forced throws-miss); `liveNow` to direct: 26 pass 1 fail (live `2026-09-11` vs system `2026-09-10` under Kiritimati); strip removal (`delete env.TZ` removed): 26 pass 1 fail (system `2026-09-11` vs `2026-09-10`). All restored green again.

(c) Forced refusal. Cannot be reached by waiting: spanning both directions always leaves one available (0 in 144). Ships unproved unless forced. Forced with only the system zone (whose date equals system by definition): `selectInstrument([sysZone], system, dateInZoneNow)` must throw `/no instrument/`, and does. Clean suite shows it firing (forced test passes). Mutation `selectInstrument` to `return candidates[0]` (never throw): 26 pass 1 fail (forced throws-miss, selected-instrument still passes on Kiritimati today, proving the refusal branch is the one that must fire). Restored green again.

No date read converted to universal form. Wall still reads the machine system local date via a stripped child, never universal. System-zone dependence unchanged (file says plainly: machine clock allowed, system zone remains by corpus convention, universal conversion forbidden, repo-wide zone filed separately).

## 3. What I derived rather than pinned, and what could not be derived

Derived (no second place, cannot drift):

- Display name from `EXPECTED_COUNT`: `` `records: shape holds and the count is ${EXPECTED_COUNT}` ``. After careful deletion test it read `21` automatically with no separate edit. Sweep `twenty-two` 0.
- Header number deleted to a pointer (`see EXPECTED_COUNT`). Comments never run; a number there is a second source with zero binding.
- `EXPECTED_BATCH_IDS` already derived (`filter` minus B3), kept. No second place.

Could not be derived (pinning kept to raise cost; deriving would destroy power):

- MAP from RECORDS: deriving would compare a record to itself (echo). Second map kept even though second source, because it lifts one place to two (three for full green). Single-side red, double-side gates green plus one bind red.
- COUNT from IDS, control numbers (21/20, 22/21) from COUNT/IDS: deriving would make deletion echo (both sides move together, still agree). Pinned numbers catch deletion by failing (single-side names Nsplit, batch missing/extra by name). Kept pinned; legitimate retirement updates them together with justification, visible.
- Helper source pin: a second copy would lift one to two, but legitimate helper maintenance (temp handling) would break the pin with safe-sign false positives, and universal-form hole needs a source assertion while fixed-past is already bound via restore plus forced. Chose RECORD (one edit, review carries) as the complete honest answer over a pin that buys little.
- Owner/reason ties: no roster in tree, no mechanisable prose tie (filler with a space passes). Presence/non-emptiness checked; suitability/substance stay with review.

## 4. The mutations — every one, including those that changed nothing

Baseline before each row: 27 pass 0 fail, except where noted as data move. Untouched clean copy at `C:\Users\BadBitch\AppData\Local\Temp\opencode\r4-clean.mjs` (test) plus `r4-linter-orig.mjs` (linter). Each mutation applied, suite run, restored from clean, suite run again. Own file green again after every restore. Full logs observed without pipes or truncation; counts plus failing names below.

| arm | mutation | before | mutated | restored | went red |
|---|---|---|---|---|---|
| zone (a) fixed want | `FIXED_DENVER_WANT` to `2026-01-01` | 27 pass | 26 pass 1 fail (fixed-instant, actual `2025-12-31` vs wrong) | 27 pass green again | yes |
| zone (b/c) shared selection | `!==` to `===` in `selectInstrument` | 27 pass | 25 pass 2 fail (selected-instrument throws no-instrument; forced throws-miss) | 27 pass green again | yes |
| zone (b) live reads system | `liveNow` return `systemToday` to `localToday` | 27 pass | 26 pass 1 fail (selected-instrument live `2026-09-11` vs system `2026-09-10`) | 27 pass green again | yes |
| zone (c) refusal must fire | `selectInstrument` to `return candidates[0]` (never throw) | 27 pass | 26 pass 1 fail (forced throws-miss) | 27 pass green again | yes |
| zone isolation strips caller override | remove `delete env.TZ` in `systemToday` | 27 pass | 26 pass 1 fail (selected-instrument system `2026-09-11` vs `2026-09-10`) | 27 pass green again | yes |
| careful deletion single-side | remove Nsplit record only, pins kept | 27 pass | 19 pass 8 fail (Check S `record count 21, want 22 (missing: Nsplit)`; batch `want 21 got 20 missing Nsplit`; full plus live-pin plus short-wall plus later-record cascade) | 27 pass green again | yes |
| careful deletion double-side | remove H6b plus COUNT 22 to 21 plus IDS/MAP minus H6b plus controls 21 to 20 and 22 to 21 | 27 pass | 27 pass, stays green (display name auto 21) | 27 pass green again | no, stays green by design, review carries it |
| anchor substitution single-side in file | B2 anchor to B3 arm in RECORDS only, MAP kept | 27 pass | 24 pass 3 fail (Check T `B2: anchor drift`; swap/joint binds vehicle miss) | 27 pass green again | yes |
| anchor substitution double-side in file | B2 anchor to B3 arm in both RECORDS and MAP | 27 pass | 26 pass 1 fail (gates green, counts agree twice; `joint anchor move` expects drift got none) | 27 pass green again | yes, via bind (gates green, full suite red; third place needed for full green) |
| order furniture | swap B2/B6trim positions in EXPECTED_IDS | 27 pass | 27 pass, stays green | 27 pass green again | no, proves furniture, DELETE justified |
| helper to universal getters | helper `getFullYear/getMonth/getDate` to `getUTCFullYear/getUTCMonth/getUTCDate` | 27 pass | 27 pass, stays green (local and universal share 2026-09-10 here) | 27 pass green again | no, hole, review carries it |
| helper to fixed past | `systemToday` to `return '2000-01-01'` first | 27 pass | 25 pass 2 fail (selected-instrument restore `2026-09-10` vs `2000-01-01`; forced finds system zone differing from fixed past, throws-miss) | 27 pass green again | yes, bound, correcting enumeration claim both pass |
| twin E7sfx linter arm, anchor left present | allowance line plus `&& false` | 27 pass vehicle passes | 26 pass 1 fail (vehicle flips to FAIL naming suffix path; Check A stays green) | 27 pass green again, both files identical | yes |
| owner presence only | B2 owner to `someone-else`, non-empty | 27 pass | 27 pass, stays green | 27 pass green again | no, suitability with review |
| reason substance | B2 reason to filler with a space | 27 pass | 27 pass, stays green | 27 pass green again | no, substance with review |

A twin proves a check can fire; only a mutation proves it must. Each red row fails for its own logic. Each green row is a priced hole, not a miss.

## 5. What this file still does NOT catch, said plainly

- Careful deletion with every pin plus controls updated together stays green (27 pass with COUNT 21). The diff is the guard: RECORDS plus COUNT plus IDS plus MAP plus four control numbers, all in one edit with justification. Review is what stands behind it.
- Double-side anchor substitution keeps gate checks green (counts agree twice, ties agree). It breaks one bind (`joint anchor move` got none), so full suite still reds; to stay fully green must also touch that bind fixture. Cost is three places, all visible, review carries the rest. The arm first claimed stands unguarded while the second stands guarded twice until review looks.
- Helper to universal getters stays green on days local and universal share the date (2026-09-10 here). One edit, review carries it. Fixed past is bound (restore plus forced red), universal is not.
- Owner to any non-empty value stays green; reason to filler with a space stays green. Mechanism checks presence/non-emptiness only. Suitability and substance stay with review. Paper twin still paper.
- Control hardcoded numbers (21/20, 22/21) plus messages drift unless updated with pins. Messages do not affect verdicts; a careful edit that updates logic but leaves messages misleading stays green with stale words. Review must read words, not just colours.
- System zone remains (local dates zone-dependent by corpus convention, universal conversion forbidden). System clock remains (allowed; time passing moving expiries pass to fail is the function working). Caller override closed via stripped child; system setting itself not inside the suite to enforce.
- Runner name filter hides failures by omission (full file 27 pass; filtered single test hides 26). Gate must run the full file with no filter, same as pin discipline.
- Broken temp/path fail closed (helper throws, suite reds), never green. Safe sign, not coverage.
- Local vs universal midnight boundary on agreeing days not forced apart by any fixture here; universal rewrite staying green is that boundary unpinned, owned above.

## 6. What I could not determine

- True total for remaining anchor-only twins from samples in hand. Flag arms cheaper; counting, hyphen-adjacent and wrapping cost more; B3 history arm may need no fixture by design. Any total from E7sfx plus two detail twins alone stays a guess.
- Whether the stripped-child system date behaves identically on every platform and harness this tree runs on. Measured here via plain Node only (no shell, no universal read), harness-neutral by construction, exercised only on this machine (America/Denver, 2026-09-10).
- Whether any environment value besides the zone override moves Date getters on some Node build. Swept via code search (only pin explicit, zone implicit) plus locale and junk probes from round 3 (still valid; file reads only pin explicitly and zone implicitly via Date), but exhaustiveness across builds cannot be proved from here.
- Whether any resolving empty task blob exists anywhere in history (B3 deeper question). Not searched beyond working tree; B3 keeps its date.
- Whether hyphen bullets, padded quotes, upper-case emphasis or semicolon-split delegation appear in real briefs outside this worktree. Judged plausible as transcribed; expiries are the re-check.
- Whether a paper twin can be refused by mechanism rather than review. Bar used here (vehicle plus minimally different twin plus arm mutation flipping twin while anchors stay green) is the pattern; enforcing it in code is review work.
- Whether Apia/Tokyo would cover the hole if the two complements changed. Walk proves 0/120/24 for this pair on this date; other pairs not walked here.

## 7. Blocked or refused calls

None. No command blocked or refused. No credential handled or printed. Ran only `node --test` on `scripts/brief-lint-records.test.mjs`, direct linter runs via the twin harness (spawned `node scripts/brief-lint.mjs` on temp briefs), temp helpers under the OS temp area for fixed-instant checks, day walk, number sweeps and word sweeps, `Copy-Item`, `Get-FileHash`, and reads. No whole-suite run, no build, no `verify-*`, no Pulse, no Desk. No push, no `gh`, no `bd` writes, no commits. Every mutation restored from the untouched copy before the next, own file green again (27 pass) after every restore, final hashes match clean hashes (linter `6294C1…EA15792`, records `D78FC9…E61AB2D`). Every date in this report is this machine local date.
