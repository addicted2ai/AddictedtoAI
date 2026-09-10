# THE RECORD EXPIRY CHECK — RESULT3

Local date: 2026-09-10.

Authority: two-desks-work-orders-and-trains@a5e873b.

Count, stated first because it is a consequence and not a target: **22**. Both detail-line twins bind (section 5), so both RECORDs retire here with their justification in the file (header plus map comment), 24 to 22 in the same edit that updates EXPECTED_COUNT and EXPECTED_IDS. No other disposition, date or owner was changed except the two re-decided reasons transcribed in section 6. No anchor was lengthened or re-derived. The linter file is byte-identical (SHA-256 `6294C11533EE19E12283ED4F5AFCBCC75884ECC293F85D57D14418357EA15792`). The records file is 25 tests green (was 17) with clean hash `3E19242DA03B4FEAF23E2D9B3EBF290F52B88B6B323266C6B91B52BCB55AD31D` for this round.

## 1. THE SWEEP — every ambient input, and whether the file can refuse it

Method: grep for `process.` reads (only `BRIEF_RECORDS_NOW` explicit, plus `execPath`), plus `new Date`, `tmpdir`, `spawnSync`/`execFileSync`, plus direct probes running only `node --test` on this file and direct linter runs via the twin harness. Full logs observed without pipes or truncation. The zone row is the floor, not the list.

| input | changes a verdict | direction | refused now | or: why not |
|---|---|---|---|---|
| `BRIEF_RECORDS_NOW` pin | controls yes, live no | pinned far-future makes pinned view fully late (22 late) while live stays green; fail-closed for controls by design | live refuses (ignores) via `liveNow` never consulting the pin (kept from round 2); controls honor by design (need day-independence) | — |
| caller zone override (`TZ` in environment) | before repair yes, after repair no for live | before: greens an expired wall at one stroke (past to pass, unsafe); after: no change to live | live refuses (ignores) via stripped child (section 2) | system zone itself remains, see below |
| machine clock (`Date` now) | yes | time passing moves expiries pass to fail; fail-closed, safe | not refused, allowed — the verdict is a function of this file plus the machine real calendar, and this is that function working | — |
| machine system zone (OS setting) | yes | different system zone gives different local date; either direction (could green or red a boundary expiry) | not refused — cannot be made independent without UTC, and UTC conversion is forbidden by corpus convention; remains, said plainly in the source | repo-wide zone dependence filed separately; this file does not touch it |
| locale (`LANG`, `LC_ALL`, `LC_TIME`, etc.) | no | none measured | no flow to refuse — numeric getters plus lexicographic `YYYY-MM-DD` compare are locale-independent | verified: suite with `LANG`/`LC_ALL`/`LC_TIME` set to `fr_FR.UTF-8` still 25 pass 0 fail |
| temp location (`TMPDIR`/`TEMP`/`TMP` via `tmpdir`) | only red, never green | broken temp makes twin helper plus live helper throw (18 pass 7 fail measured with temp pointed at `/no/such/dir/xyz`); valid different dir: no change | cannot refuse the OS value, but safe direction — a broken clock/helper fails closed rather than passing silently | — |
| `PATH` (for `git`, `node` spawn) | only red, never green | broken path makes `linterHeadSha` plus `runLint` plus `systemToday` throw; fail-closed | cannot refuse, safe direction | — |
| working directory | no | none measured | no flow by construction — absolute paths from `import.meta.url`, `git -C REPO`, `tmpdir`; verified: suite run with cwd set to the OS temp area still 25 pass 0 fail | — |
| `argv` (runner filters, linter flags) | yes, by omission | filtering hides failures (full file 25 pass; `--test-name-pattern=identity stays tied` gives 1 pass 0 fail, hiding the other 24); direction greens by omission, unsafe | cannot refuse from inside the file — the runner controls filtering | mitigation is runner discipline: the gate runs the full file with no filter, same as the pin discipline |
| all other environment values | no | none measured | no flow — file reads only `BRIEF_RECORDS_NOW` explicitly and `TZ` implicitly via `Date`; verified: suite with `FOO_BAR_XYZ=hello` still 25 pass 0 fail | — |
| `process.execPath` (node binary) | no green | none measured; different binary still runs the same date logic | no refusal needed | — |
| linter source (`SRC` read from `scripts/brief-lint.mjs`) | yes, by design | edited/removed arm breaks its anchor count and fails (red, safe, naming the record) | refused — `checkAnchors` fails loudly with per-record counts | not ambient bypass; the guarded artefact the wall exists to watch |
| `git HEAD` (twin authority) | no | twins take `HEAD` for both vehicle and twin, so a move keeps both sides together | no refusal needed | — |

## 2. The zone, closed — what the live check now depends on, and what it does not

What it now depends on: this file's contents plus the machine real calendar read as the machine system local date via a fresh child whose environment carries no caller override. What it does not depend on: the pin (never consulted) nor any caller-supplied zone override (stripped for the child). UTC is not used anywhere.

How it works: `systemToday()` writes a tiny helper under the OS temp area, spawns `process.execPath` on it with `TZ` deleted from the child environment, requires exit 0 plus `YYYY-MM-DD` output, otherwise throws (fail-closed), and removes the area after. `liveNow()` returns `systemToday()`. In-process deletion alone does not work (measured: set `Pacific/Niue` then delete still reads `2026-09-09` with offset 660 in the same process), while a fresh stripped child does (measured: parent tainted `2026-09-09`, stripped child clean `2026-09-10`). Restoring in-process after a zone set needs an explicit set back to the system zone first (measured: Niue to `America/Denver` to unset leaves `2026-09-10` clean again); the zone control does exactly this in a `finally`, so later reads stay clean.

Reproduction of the brief's floor, then proof of closure. Before repair (round-2 file, `B6trim` moved to `2026-09-09` only, restored byte-identical after):

- no zone set: 12 pass 5 fail, live refuses as it should
- `TZ=Pacific/Niue`: 14 pass 3 fail, live passes (greens)
- `TZ=Pacific/Midway`: 14 pass 3 fail, live passes
- `TZ=Etc/GMT+12`: 14 pass 3 fail, live passes

After repair (this file, same one-record expiry move, restored byte-identical after):

- no zone set: 20 pass 5 fail, live refuses
- `TZ=Pacific/Niue`: 19 pass 6 fail, live still refuses
- `TZ=Pacific/Midway`: 19 pass 6 fail, live still refuses
- `TZ=Etc/GMT+12`: 19 pass 6 fail, live still refuses

The extra fail under an override is the zone control itself going red (direct versus system split, fail-closed, safe) — the live wall no longer greens. Restored green again (25 pass 0 fail) and byte-identical after each restore.

What remains, said plainly in the source as required: the machine clock remains (allowed) and the machine system zone remains (local dates are zone-dependent by corpus convention and UTC conversion is forbidden, so a system zone change moves the wall). The caller override does not remain.

## 3. The two furniture controls — bound, or why unbindable

Both are now bound. Neither is argued unbindable.

- `localToday` replaced by a fixed past date. Before: nothing reds (live passes because the fixed date precedes every expiry; live-ignores-pin passes because both arms read the same broken value when live read direct; pinned controls agree). After zone repair live reads system, so the old shared-arm cover is gone, and this round adds an explicit binder: `records bind: localToday matches an independent date read` recomputes the direct date via `new Date` in the test body and requires equality. Mutation `return '2000-01-01'` first: 23 pass 2 fail (sanity plus zone parent-agree, which also compares direct to system), restored 25 pass green again and byte-identical. Under a caller override both reads are tainted the same way, so no false red there.

- `shapeBad` seen set moved inside the loop. Before: nothing reds because the duplicate control exercises `shapeErrors` directly with its own external set and never goes through the shared path. After: `records bind: duplicate ids refuse via shared shape path` exercises `shapeBad` itself on a two-record tiny wall with one duplicated identity plus a full-wall duplicate. Mutation moving `const seen = new Set()` inside the loop: 24 pass 1 fail (duplicate bind), restored 25 pass green again and byte-identical.

## 4. The record's fields — ties built, ties judged impossible, what a reader trusts instead

Review swept all six and found only anchor to expect tied; the rest survived substitution at 17 pass. Verified here before building: owner rewritten (`orchestrator` to `someone-else`, non-empty) still 25 pass; reason replaced with plausible filler (with a space) still 25 pass.

Built (mechanisable): identity to arm plus count. `EXPECTED_ANCHOR_FOR_ID` pins per identity the exact arm substring plus its count (a second source, like the count and identity pins; it duplicates but does not lengthen). `Check T` (`records: identity stays tied to its arm`) enforces it via shared `identityTieBad`/`checkIdentityTies`, so a break inside the helper turns the binds red.

- Swap: `B2` and `B6trim` identities exchanged between same-batch records. `anchorBad` stays green (same substrings, same counts); `identityTieBad` names both drifts and `checkIdentityTies` throws. Full-wall swap now refuses (22 pass 3 fail, gate reds) where it survived before.
- Joint move: `B2` anchor plus expect moved together to `B3` arm at the same count (1). `anchorBad` stays green (new anchor found once); identity names `B2` drift and throws.

Judged impossible (said plainly, with what a reader trusts instead):

- Owner suitability: presence is checked (`owner empty` refuses), but no roster exists in the tree to judge whether a name holds a role; inventing one creates a second source about team membership that rots. A rewrite to any non-empty value still passes (measured 25 pass). A reader trusts review for suitability, mechanism only for presence.
- Reason prose: a tie between a record and its own prose is not mechanisable; filler with a space passes shape, and pretending otherwise would be worse than the gap. A rewrite to plausible filler still passes (measured 25 pass). A reader trusts review for substance, mechanism only for non-emptiness.
- Expiry intra-batch swaps are invisible because the values are identical (no verdict change to catch); the outlier swap is already tied by the batch control (missing/extra by name, `B3` must not expire with the batch).

## 5. I4star and J2star — the detail-line twins, and what the count became

Two conjuncts that refuse the same bare input cannot be bound separately by a twin that asserts status, because the status is identical with either one alone. Both star arms are of this form: loosening `+` to `*` keeps status refusing while flipping the printed detail. The detail is already printed, so both twins are built against it.

- `RESULT` arm: bare `RESULT.md` brief gives `FAIL … numbered=false bare=true`; numbered `RESULT9.md` vehicle gives `PASS … numbered=true bare=false`. Loosening the arm to the star form flips the bare detail to `numbered=true bare=true` while status stays `FAIL`.
- `REVIEW` arm (live matcher `numberedReview = /\bREVIEW\d+`, not the comment that quotes the old pattern): bare `REVIEW.md` under `--review` gives `FAIL … review numbered=false bare=true; bare RESULT=false`; numbered `REVIEW9.md` gives `PASS … review numbered=true`. Loosening only the live arm flips the bare detail to `review numbered=true` while status stays `FAIL`. Replacing only the first comment occurrence does not flip (measured), which is why the anchor spans the assignment.

Both twins bind (section 7 rows: each star mutation gives 24 pass 1 fail on its twin, restored 25 pass with both files byte-identical). Both RECORDs therefore retire here with this justification, in the same edit that updates the count and the identity list plus the batch/expiry pins that count the wall (21 batch at `2026-10-11`, 22 full at `2026-12-02`). The count is a consequence of that work and not a target. The twins remain in the file as guards for the loosened arms; the RECORDs do not.

## 6. The two re-decided reasons, transcribed

`G7hy` — replace the reason with: **"KEEP. Deleting the hyphen from the class makes a hyphen a word boundary, so any kebab-case identifier carrying these two letters as a segment newly refuses, and it catches nothing real: a token flanked by hyphens is an identifier and not a command. Re-decided 2026-09-10 from the arm rather than from the previous reason."**

`G8sent` — replace the reason with: **"KEEP. The cost sits in the exclusion, not the match. Evaluated per physical line, a prohibition that wraps between the excusing word and the token refuses falsely; evaluated per sentence, the false refusal goes and a `never` anywhere in a sentence excuses a token anywhere in it. A whitelist evaluated over a longer unit is a larger whitelist, so the tighter unit wins: a false refusal is visible and costs one edit, and the hole is invisible. Re-decided 2026-09-10."**

Verified present byte-exact in the file.

## 7. The mutations — one per check added or changed

Baseline before each row: 25 pass 0 fail. Untouched round-3 clean copy at `C:\Users\BadBitch\AppData\Local\Temp\opencode\r3-round3-clean.mjs` (plus linter clean at `r3-linter-clean.mjs` for the two linter rows). Each mutation applied, suite run, restored from the clean copy (linter rows restore both files), suite run again. Own test file green again after every restore. No pipes, no truncation.

| check | mutation | before | mutated | restored | files identical |
|---|---|---|---|---|---|
| zone isolation strips the caller override | remove `delete env.TZ` in `systemToday` | 25 pass | 24 pass 1 fail (zone control) | 25 pass green again | yes (`3E1924…AD31D`) |
| live reads system, not direct | `liveNow` return `systemToday` to `localToday` | 25 pass | 24 pass 1 fail (zone control) | 25 pass green again | yes |
| zone closed on an expired wall (data move, not logic) | `B6trim` expiry `2026-10-10` to `2026-09-09`, run under four zone values | 25 pass | 20 pass 5 fail (unset, live refuses) / 19 pass 6 fail (each override, live still refuses) | 25 pass green again | yes |
| furniture local date sanity | `localToday` to `return '2000-01-01'` first | 25 pass | 23 pass 2 fail (sanity plus zone parent-agree) | 25 pass green again | yes |
| furniture duplicate shared path | `seen` set moved inside the loop | 25 pass | 24 pass 1 fail (duplicate bind) | 25 pass green again | yes |
| identity tie helper | `identityTieBad` to `return []` first | 25 pass | 23 pass 2 fail (swap plus joint-move binds) | 25 pass green again | yes |
| identity gate assert | `bad.length, 0` to `bad.length, bad.length` | 25 pass | 23 pass 2 fail (both throws-miss) | 25 pass green again | yes |
| count pin still must fire (22) | `problems.length, 0` to `problems.length, problems.length` in `checkShape` | 25 pass | 24 pass 1 fail (short-wall throws-miss) | 25 pass green again | yes |
| expiry still must fire (22) | filter computed then `return []` in `expiryLate` | 25 pass | 23 pass 2 fail (shared-expiry plus live-pin pinned view) | 25 pass green again | yes |
| `RESULT` detail twin (linter arm, anchor left present) | `RESULT\d+` to `RESULT\d*` | 25 pass (vehicle passes) | 24 pass 1 fail (bare detail flips to `numbered=true` while status stays refusing) | 25 pass green again | yes (records `3E1924…AD31D`, linter `6294C1…EA15792`) |
| `REVIEW` detail twin (live arm only) | `numberedReview = /\bREVIEW\d+` to `\d*` | 25 pass | 24 pass 1 fail (bare detail flips to `review numbered=true` while status stays refusing) | 25 pass green again | yes (both hashes) |

A twin proves a check can fire; only a mutation proves it must. Each row shows the twin failing for the check's own logic.

## 8. What the mechanism still does NOT catch, said plainly

- It does not pin behaviour beyond its twins. Three arms now carry detail/behaviour twins (`E7sfx` plus the two retired star arms, whose twins remain as guards without RECORDs). The other twenty-one remaining RECORDs are anchor-only until their dates. A RECORD without a twin is debt with a deadline.
- It does not survive its own deletion. Removing this test file removes all refusals at once; the missing file in the gate log is the alarm.
- It does not distinguish legitimate retirement from evasion. Removing a record plus updating `EXPECTED_COUNT`, `EXPECTED_IDS`, the identity-to-arm map and the batch/expiry pins with justification passes; the edits are visible in review, and that visibility is the entire guard.
- It does not judge. A reworded reason without re-check passes; a genuine re-check that keeps old wording passes with a moved date; owner suitability and reason substance stay with review (section 4). A paper twin (a fixture that asserts nothing load-bearing) is still paper; review must refuse it.
- It does not unblock. One expired record stops every push until worked, deleted, or explained in writing. That freeze is intentional pressure.
- It over-fails on formatting that touches an anchor substring, and a shared-span edit fails every record on that span. Accepted false positives with the safe sign. The identity map adds one more second source to keep in step when an arm legitimately moves.
- It trusts the machine clock and the tree beyond the pin and the caller override. The pin stroke is closed; the caller zone stroke is closed; the system date, system zone, a rewritten linter, and a deleted file are not inside the suite to enforce. The system zone remains by corpus convention (UTC forbidden).
- It trusts the runner about argv. Filtering hides failures by omission (1 pass hiding 24); the gate must run the full file with no name filter.
- Broken temp/path fail closed (measured 18 pass 7 fail on broken temp), never green. That is the safe sign, not coverage.
- The midnight boundary between system and caller zones is now pinned by the zone control (direct tainted `2026-09-09` versus system clean `2026-09-10` on this date). The boundary between local and UTC remains pinned by convention and one control, not by a fixture forcing the two dates apart.

## 9. What I could not determine

- The true total for the remaining twenty-one anchor-only twins from the samples in hand. Flag arms will cost less; counting, hyphen-adjacent subtlety and wrapping twins will cost more. Any total extrapolated from `E7sfx` plus the two detail twins alone would be a guess.
- Whether the stripped-child system date works identically on every platform and harness this repository runs on. Measured here via plain Node only (no shell, no UTC read), harness-neutral by construction, but only exercised on this machine (`America/Denver`, `2026-09-10`).
- Whether any environment value besides `TZ` can move `Date` getters on some Node build. Swept via code grep (only `BRIEF_RECORDS_NOW` explicit, `TZ` implicit) plus `LANG`/`LC_ALL`/`LC_TIME` and `FOO_BAR_XYZ` probes (still 25 pass), but exhaustiveness across builds cannot be proved from here.
- Whether any resolving empty task blob exists anywhere in history (`B3` deeper question). Not searched beyond the working tree; `B3` keeps its date.
- Whether hyphen bullets, padded quotes, upper-case emphasis, or semicolon-split delegation appear in real briefs outside this worktree. Judged plausible as transcribed; the expiries are the re-check.
- Whether a paper twin can be refused by mechanism rather than review. The bar used here (vehicle plus minimally-different twin plus arm mutation that flips the twin while leaving anchors green) is the pattern; enforcing it in code is review work.

## 10. Blocked or refused calls

None. No command was blocked or refused. No credential was handled or printed. Ran only `node --test` on `scripts/brief-lint-records.test.mjs`, direct linter runs via the twin harness (spawned `node scripts/brief-lint.mjs` on temp briefs), temp helpers under the OS temp area for sweep/probes/mutations, `Get-FileHash`-equivalent hashing via Node `crypto`, and `git -C <dir> rev-parse` via the harness. No whole-suite run, no build, no `verify-*`, no Pulse, no Desk. No `git push`, no `gh`, no `bd` writes, no commits. Every mutation was restored from the untouched copy before the next, the own test file was green again (25 pass 0 fail) after every restore, and the final hashes match the clean hashes. Every date in this report is this machine local date.
