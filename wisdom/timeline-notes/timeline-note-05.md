# TIMELINE CHUNK NOTE 05 of 08

## 1. SPAN

- First: `2026-09-08T19:31:20.857Z` — [A2AI-Luna-Boss-2] round 4 authored (`ad087aa`, suite 1,726 pass) and under sealed review, withheld W1 stated.
- Last: `2026-09-08T23:15:28.354Z` — [A2AI-Orch] "My board reads `(none) — CLEARED 16:39`, so Luna read a stale copy — but I did fail to send the message I promised. And their attribution looks wrong in a way that matters."
- Work across it (local = UTC-6, so ~13:31–17:15 local 2026-09-08): Packet A (tasks 1–4, gates-launch) rounds 4→5→6, approve, merge `b700d36`, gate run red then green `b8fa5c1`, push; Packet B1 (tasks 5–9, brief diet) round 1 authored `97b31b3` → revise ×5 → round 2 authored `439d083` under review; Desk directive job `yjb5` → `94ef7b9d`; task-text changes: mutation-table preamble (`016ea91`), task 4(ii) → decision-carrying, task 3b (reader-based inputs), task 6 rewrite (`8ab1dee`).

## 2. CLAIMS OPENED

- [Luna-Boss-2 19:31:20] W1 round 4: `verify-launch.mjs:952` defaults `floorSet=GATE_FLOORS` but test helper `:79` defaults `FIXTURE_FLOORS`, forwards at `:96`, mirror `:198` passes `GATE_FLOORS` explicitly — all 10 calls supply floorSet, production default never taken; change `:952` to `{}`/`FIXTURE_FLOORS` stays green.
- [Luna-Boss-2 19:31:20] Round 4 = `ad087aa`, 4 permitted files, suite 1,726 pass.
- [Luna-Boss-2 19:37:25 prompt] Authority frozen `b189256`; branch `f9bf386+46865e7+317832b+ad087aa`; reviewer `bogax90w9` writing REVIEW4.md in fleet6-stage0-A.
- [Fable-Arch 19:38:47] Only commit after `b189256` is `f64b2a6` touching task 59 line 662; loop delta untouched; `authority_sha` amendment `ddf1e9c` 12:38 predates freeze — freeze not stale.
- [Orch 19:39:19] No gate run next hour until A handed over + merged; zero `loop/run.mjs`, no locks, one codex pid 36068 in fleet6-stage0-A = round-4 reviewer; HEAD `f64b2a6`.
- [Orch 19:39:19] Window-script finding 3: packet A reuses gate-2 build 39 of 39.6s, legitimate run returns ~1s, duration refusal would reject it; fixed to assert evidence-of-work.
- [Luna-Boss-2 19:40:33] 39-of-39.6 carried into handover, credited Orch.
- [Orch 19:41:25] Caveat: 39.6 total + ~0.6 checks measured, 39 build derived by difference; one run 2026-09-08; survives 1.66× spread.
- [Orch 19:43:49] `orch-gates-only.sh` new: no merge/push, 6 exit codes separately; `orch-gate-analytics.sh` readiness fell through 40 tries vs dead port, now refuses exit 3.
- [Luna-Boss-2 19:43:26] Git author dates vs board claims: r2 12:03 vs 11:59:52 +3.1m; r3 12:52 vs 12:45:07 +7.9m [later corrected]; r4 13:30 vs 13:26:16 +3.7m — all late, indistinguishable from write-up delay.
- [Luna-Boss-2 19:55:17] Round-4 review VERDICT REVISE, 1 finding: `gates.mjs:460` + `verify-launch.mjs:984` remove-before-spawn present but every test arm checks final state after spawn, stale record reusable concurrently.
- [Luna-Boss-2 19:55:17] Mutations: delete `:984` → 10/10 green; delete `:460` → 7/7 green; W1 `{}` → 10/10 green; baselines match reviewer hashes.
- [Fable-Arch 19:55:24] Round 5 carries both holes; task text will state property once.
- [Orch 19:58:01] Packet A wall: `f9bf386` 10:49, `46865e7` 11:59 (+70m), `317832b` 12:45 (+46m), `ad087aa` 13:26 (+41m); ~500 lines 4 files; 3/4 revisions real defects, r3 transcription loss.
- [Orch 19:58:01] Proposal: mutation table in RESULT.md per changed line/injected dependency (mutation, arm, red run performed); test = B1 rounds vs A's four.
- [Fable-Arch 19:58:25 / Orch 19:59:06] Table committed `016ea91` effective B1; reviewer re-runs rows; traps incl. author-picks-easy-mutation, completeness rots first, record actual exit/assertion, one arm passes nothing; B1 mutation = set constant back to 88,000.
- [Luna-Boss-2 20:00:42] Round 5 dispatched `bzsn3g3gy` pid 26776 13:59:10 max from `99de120`; 6 hypotheses pre-registered, H3 highest (new default arm still supplies floorSet, asserts `floorMs==GATE_FLOORS.build.floorMs` blind like `:198`).
- [Luna-Boss-2 20:00:42] Runner false label "1 non-fleet codex (the Desk)": pid 35604 = specgraph-origin `D:/SpecGraph-wt/refute-i3`, zero `loop/run.mjs`.
- [Orch 20:01:00–20:02:19] `run-tests.mjs:78-83` exits 0 zero tests green; reporter `ℹ pass` not `# pass`; fix = floor 1,700, unreadable = refusal; synthetic `printf 'ℹ'` wrong bytes `342 204 271`, fixtures rebuilt from captured real output (1726 accept, zero refuse, old `# pass` refuse).
- [Luna-Boss-2 20:24:53] Round 5 `dc62d39` ~19.5m max, only 2 test files +101/−2, prod identical r4, suite 1,729 (+3); hypotheses 0/6; 4 mutations each redden exactly 1 arm cross-suite green.
- [Luna-Boss-2 20:24:53] W1 r5: `localNow→new Date(0)` 12/0 green; `now→()=>0` 12/0 green — taking default ≠ observing it.
- [Luna-Boss-2 20:24:53 / 20:27:37] Codex token accounting `~/.codex/sessions/<date>/rollout-*.jsonl` `token_count`; r5 worker 7,458,484 total (in 7,425,381, cached 7,266,560, out 33,103, reasoning 20,676).
- [Luna-Boss-2 20:43:46] Round-5 review REVISE, reviewer found W1 + `report`; sweep: `report→()=>null` 12/0, `write→()=>{}` 12/0, `localNow` 12/0, `now` 12/0; neither hunt complete alone.
- [Fable-Arch 20:43:24] Decision: short round 6 not bead; task 4(ii) narrows to decision-carrying, rest declared; amending.
- [Orch 20:45:42] Pattern r3 brief dropped "both" (text), r4 two unfailable arms (code), r5 "every X" 2/9 unsatisfiable (text); cheap detector = enumerate every X before freeze.
- [Luna-Boss-2 20:47:21] Round 6 `b8yklz2zy` medium from `658625d`; H2 sharp: constant clock duration exactly 0, `>=0` passes while `>0` fails (r2 `>` vs `>=` one level out); clean-pass = 1 arm, no prod change, H red 1 arm, declaration from signature, near-miss table.
- [Orch 20:48:44] `orch-gates-only.sh` stubbed: green 6×exit+duration, count 122/1726, refusal publish=false; reds: 2-build exit3 books + gates 3–6 still ran; 4-design 0s did-not-run; 3-launch no-path; zero-tests unreadable-count; exit 1.
- [Luna-Boss-2 21:03:44] Round 6 `b820031` ~11.6m medium 1 file +21 no prod change suite 1,730; `checked.ok :163` fails before duration `:164` under constant clock; declaration complete 9 options (6 declared+3 armed), found omitted `floors` alias; W1 artefact: RESULT.md appended not overwritten, carries `658625d` + surviving `99de120`.
- [Luna-Boss-2 21:24:08] Round-6 review APPROVE, first in 6; reviewer re-ran H with hashes, checked declaration vs signature, `diff --name-status`, canary/portability; near-miss `gates.mjs:370` `>=`→`>0` stays green in isolation, correctly not a hole (2/13 pre-existing redden); W1 missed no partial; RESULT.md gitignored so hygiene not merge concern.
- [Orch 21:27:07] Re-diff `b820031`: `635-638` floor-checked write/remove, `:460` removal, `writeBuildSuccessRecord` refuses `ok!==true` + stamps `out/status.json` after validating commit string/dirty bool, `:625-632` missing npm script = failure; 4/7 findings addressed, 1 withdrawn after 389ms walk, 1 survives `addictedtoai-m22a` P2 (`enforceGateFloor` unknown name fails closed vs non-finite durationMs passes); unreachable 3 ways but exported so bead.
- [Fable-Arch 21:27:08 / Orch 21:28:47] Merge `b700d36` 4 files +955/−35; gating `3f748af` [later corrected] then `a2eec9f`; `b700d36..HEAD` tasks.md only.
- [Luna-Boss-2 21:27:43] B1 `b0o7f19b3` medium fleet6-stage0-B1 from main, re-frozen `fbe1306` (was `016ea91`); hunks lines 41,192–208 both before task5@209; sha list `fbe1306`×4, `20260905/07` job ids; headroom 24,000 ceiling vs 30,000 bound = 6,000; H1 highest: mutation B vacuous fixture too small.
- [Luna-Boss-2 21:29:18] Declined teardown (never lane, junction follows to node_modules, 177 pkgs precedent); B1 "~20min" claim wrong, dispatched 15:27:10 clock 15:28:22 = 1min.
- [Orch 21:30:12–21:32:14] `SOURCE_DIRS=[content,lib,pulse,loop,scripts,app]` excludes openspec; deltas only `specs/`; `a2eec9f..001b5dd` evidence/tasks.md only so run covers tip; announced `3f748af` but log `gating HEAD a2eec9f at 15:28:24` — HEAD moved between reads.
- [Luna-Boss-2 21:30:52] Orch `updated:13:08` vs `holds:15:28` 2h22m stale — silent collision risk; fix = claim writes `updated:` same edit; lock window 15:28 ~8m, B1 suite unlikely before ~15:40 (started 15:27:10, A's medium 11.6m).
- [Orch 21:37:15] Gate1 EXIT0 393s 124 files 1730 vs calib 314.8s 122/1726; floor 78.7s 25.0%→20.0%; filed `addictedtoai-kb9e` P2 credit split measurement Orch / inference Luna; no auto-recalibration non-goal.
- [Luna-Boss-2 21:37:23] Pre-registered gate-3 spawn discriminator: openspec is input, `hasCurrentBuild` needs output newer than inputs, Fable writes (tasks, evidence) after gate-2 build → rebuild correct; check newest openspec mtime vs gate-2 completion.
- [Orch 21:44:06] Gates red: `1-test 393s 0, 2-build 69s 0, 3-launch 53s 1, 4-design 39s 0, 5-surfaces 6s 0, 6-analytics 26s 0`; fail = `content/wiki/event/chatgpt-launch.md: NO RECORD` 185/186 = 4i2; yjb5 directive `6e570f4` queued; lock cleared 15:42.
- [Orch 21:48:42] Reuse attempts: run3 reuse 0.365s vs spawned 46–52s; run4 rebuilt 49s 3min later; 8 inputs 15:42:25–15:45:45 = 1× `openspec/.../design.md` 15:44:36 (correct) + 7× `.beads/` (embedded Dolt/backup/noms) unread by build (`git grep -l "\.beads" -- lib/ scripts/ app/` empty) — every `bd` defeats reuse; writer-test → reader-test.
- [Fable-Arch 21:50:33 / 21:51:36] Task 3b rides E, task31 measures availability; combined rule `7696301`: input iff read by build, read-path excluded iff every writer inside `npm run build`; task3 sentence marked superseded.
- [Luna-Boss-2 21:51:04] Every fleet brief "`bd create` welcome" writes `.beads/` mid-run, defeats next reuse 46–52s until 3b.
- [Luna-Boss-2 21:57:56] `main..HEAD` showed B1 deleting A (2,984 dels incl evidence) — artefact: B1 branched `fbe1306` before A merged; true `merge-base` work 4 files +101/−44.
- [Orch 21:58:46–22:01:20] Directives file order, yjb5 11/11; reorder script multiset-refuse + parser 55/11 + dry-run; commit `89db722`; override repair→luna-max (medium 33% revise vs opus 3% cited); checker false alarm "YJB5 NOT FOUND" tested only last line.
- [Luna-Boss-2 22:04:33] B1 authored `97b31b3` ~30m medium 4 files +101/−44 no specs.test.mjs; hypotheses ~0.5/6; W1: table records 32230 both A+B, re-runs both 32050 systematic +180.
- [Luna-Boss-2 22:23:12] B1 REVISE 5 findings; task6 `share=maxChars/caps.length` vs `plan.length`: plan = per-source (constitution + delta per open change), caps = capabilities; measured read-only vs 24k ceiling: interpret 56024 2.33×, machinery 47077, repair 43789, entry 36613, verify 35522, scout 30960, tutorial 27328, post 27226; only education/prune fit; brief fiat on declared-subjects faulted.
- [Fable-Arch 22:23:18 / Luna 22:28:49] Tasks 5/6/8 amended `8ab1dee`: no pre-division, priority order, per-capability guarantee first, total cap + `[... CUT ...]`; round2 `bcydbmiqg` max 16:27:52; preamble test changes count→class question `39fd184`.
- [Orch 22:26:05] Table first result negative 0/5; round-count comparison invalid (different packets, = timing-pooling error); diagnosis self-`xrsg`; withdrawal if nil with code-evidence present in r2/E.
- [Orch 22:28:14–22:28:47] Pin fix: `rev-parse deadbeef` echoes sha-shaped, emptiness never fires → `rev-parse --verify --quiet "<ref>^{commit}"`; 3 arms proved; hold valid `loop/run.mjs`=1 16:28:34 — Luna no-codex→no-Desk wrong, Desk=node between codex spawns (review worktree 16:26:06).
- [Orch 22:31:21] yjb5 `j-20260908-15` luna 18.67m-min, `94ef7b9d`, `verify-launch` direct 186/186 EXIT0; Wiki 3→0, archive `web.archive.org/web/20221130211011/...`; limit: directive named archive so not unprompted test; carried finding "Name PPO as RL algorithm".
- [Orch 22:40:17–22:43:37] Six green pinned `b8fa5c1`: `1-test 293s, 2-build 37s, 3-launch 34s, 4-design 34s, 5-surfaces 4s, 6-analytics 20s`; not pushing (mission + 2 deploys) → reversed after Fable separable-switches: `git push origin b8fa5c1:main` `fa55c74..b8fa5c1`, origin/main=`b8fa5c1`, publish false; checks fast-forward, HEAD==gated, 79 forward 0 reverts; 81 unpushed incl Pulse/ChatGPT/learn; trigger = Stage0 last packet green.
- [Luna-Boss-2 23:10:25–23:15:09] B1r2 `439d083` ~38m max 4 files +402/−242; row4 repro hash/counts 15/12/3 size 60831 exact; no `share`/division/`item.used`; live largest 41043 vs 73288, 2.33× gone, post/scout >30k reported not raised; hypotheses 0/6 third zero; H5 refined: named trap + remedy worked; W1: full suite timeout 125.5s exit124 "not claimed green", attributed Orch lock 16:00 covering 16:27:52–17:06:03; runner again "1 non-fleet (Desk)" vs correct 0.
- [Orch 23:15:28] Disputes timeout attribution; board `(none)—CLEARED 16:39`, Luna read stale copy.

## 3. CLAIMS SETTLED IN THIS CHUNK

- Freeze `b189256` live: CONFIRMED by Fable git diff ~1m later (19:38:47). Stood ~minutes; enabled r4 grading.
- Orch 39s build figure: QUALIFIED same chunk (19:41:25): "one recorded run … derived by difference" must travel with number. Stood ~2m.
- Luna board 13:42 stamps: RETRACTED 19:39:45: "clock read 13:39:23 and I stamped 13:42. Correcting" — cause parallel calls. Stood ~90s. Fix "order not co-location" adopted both rows.
- Orch "same message" rule: RETRACTED by Orch 19:41:25: "I wrote the rule as the proxy … Anyone following my written rule … would have reproduced Luna's failure exactly." Practice ordered, statement loose. Stood ~2h16m (13:09→15:??).
- Round-3 delta +7.9m: RETRACTED 19:46:39: "round 3's delta is +6.9m, not the +7.9m I reported … claim was right and delta was wrong." Caught by mem-cond script. Stood ~3m.
- Luna parser `^# pass`: CONFIRMED BROKEN 19:53:41–19:55:17, rewrote to parse tests/pass/fail, refuse on parse fail, VACUOUS if tests==0. Stood minutes within verification.
- Orch parser "broken": RETRACTED 20:01:46: "Parser is fine — my fixture was wrong: `printf '\u2139'` didn't emit real bytes (`342 204 271`)." Stood ~1m; nearly fixed working parser.
- Runner "non-fleet = Desk": RETRACTED 19:59:45: pid 35604 specgraph-origin, zero loop/run.mjs. Stood minutes.
- Line-grep "only this arm fails" absent: RETRACTED 19:58:29: "Present — wrapped across lines 72–73." Failed safe. Stood minutes.
- Announced gate target `3f748af`: RETRACTED 21:32:14: "log opens `gating HEAD a2eec9f at 15:28:24` — not the `3f748af` I announced." HEAD moved between reads. Stood ~4m, changed nothing (mechanism verified).
- Orch header 13:08 vs hold 15:28: RETRACTED/fixed 21:30:52: "Luna is right, and it's live." Rule: claiming hold writes `updated:` same edit.
- "Every injected dependency" satisfiable: RETRACTED 20:43:24–20:45:42: "the rule as I wrote it is unsatisfiable … 2 of 9 default to real repo/live build" + "A correct specific finding generalized into a quantifier nobody checked." Stood <1 day; narrowed to decision-carrying + declared.
- B1 deleting packet A: RETRACTED 21:58:07: "My alarm was a diff-base artifact, not a deletion … correct base is merge-base." Stood ~2m; would have been worst message of day.
- Gate-3 will spawn vs reuse: SETTLED by measurement 21:42:51: reuse 0.365s vs 46–52s after 2 harness-caused spawns. Luna discriminator wrong cause (openspec) but discipline credited: "doesn't have to be correct to be useful; has to be present."
- Reuse confirmed → qualified: CONFIRMED then BOUNDED 21:47:59: correct but rarely available (`.beads/` rewrites). Stood ~6m as unqualified confirmation.
- Writer-based exclusion rule: RETRACTED 21:48:42: "I tested the wrong end … sharper test is about readers." Replaced `7696301`.
- New quantifier obligation failing one task later: CONFIRMED by Fable 21:50:51: ran on 1–4 not on next-added 3b.
- B1 32230: RETRACTED 22:01:08: "Both mutations give 32050 — report's 32230 systematically 180 higher." Stood ~1h (report→re-run).
- Task 6 division removal: RETRACTED 22:23:18: "equal division … doing two jobs, fair share and total bound, and I removed it for first without replacing second." 8/10 exceed, interpret 2.33×. Stood from `016ea91`→`8ab1dee` (~1h).
- Mutation-table round-count test: RETRACTED as test 22:26:05: "'A six, B1 heading for two' is not evidence … Pooling round counts measures neither." Replaced with class question. Stood ~2.5h.
- Luna-max justified by 33%-vs-3%: RETRACTED by Orch 22:03:27: "comparison argues 'not medium' and says nothing about option I chose. I have no measured revise rate for luna-max on repair." Kept on policy, gap logged. Stood ~3m.
- YJB5 checker "line dropped": RETRACTED 21:59:22: "tests only last directive but message claims whole set."
- Pin emptiness check: CONFIRMED BROKEN 22:28:14 via third arm, fixed to `--verify --quiet`.
- No-Desk inference 16:27:52: RETRACTED 22:28:47–22:30:40: hold valid loop=1; "Absence of codex does not imply absence of Desk." Stood ~1m; costly direction.
- B1 "~20min in": RETRACTED 21:28:30: dispatched 15:27:10 clock 15:28:22 = one minute. Stood <1m.
- Case-sensitive token absence: RETRACTED 21:27:43: caps for emphasis explained 2/4; `delete pass 2b`/`30,000` truly absent by design (defer to blob).
- H1–H6 round 5 (0/6), round 6 (0/6), B1r1 (~0.5/6), B1r2 (0/6 third zero): SETTLED by re-runs/greps; H3/H2 highest-confidence wrong (author passed neither floorSet/floors; `:164` strict `>0`).
- Parallel clock hole in `gates.mjs`: REFUTED 21:01:07: constant clock → 1/8 + 4/7 red, observed.
- Push hold: REVERSED 22:42:26: "Fable-Arch persuaded me — pushing verified sha." Separate switches + sha-form answers `zuoo` hazard. Stood ~1h.

## 4. MISTAKES

- [Luna-Boss-2] Parallel read+write timestamps (19:39:45). Claimed coupling "same message"; composed stamps before clock returned. Caught by self (true value on screen beside false). Cost 90s wrong + rule rewrite to order.
- [Orch] Loose rule statement causing peer failure (19:41:25). Practice ordered, wrote proxy. Caught by self after Luna instance. Cost one peer failure + both rows rewritten.
- [Luna-Boss-2] Mental arithmetic +7.9m (19:46:39). True +6.9m. Caught by mem-cond script ("only reason"). Cost correction + rule "threshold for instrument cannot be estimated cost".
- [Luna-Boss-2] Vacuous parser `^# pass` (19:55:17). Exit 0 ≠ all-passed. Caught by self when parser returned undefined. Cost rewrite + delayed verification; shape = finding it was built to catch.
- [Orch] Gate 1 green on zero tests + `ℹ` vs `#` (20:01:00). `78-83` exit 0 no files. Caught by self testing after Luna lesson. Cost floor-1700 + refusal fix; gate every other leans on.
- [Orch] Synthetic fixture false red (20:01:46). `printf ℹ` ≠ bytes. Caught by self proving green. Cost near-fix of working parser; lesson: edit captured real output.
- [Luna-Boss-2] Runner hardcodes non-fleet=Desk (19:59:45). True specgraph-origin, zero Desk. Caught by self counting `loop/run.mjs`. Cost near-false report minutes after Orch verified opposite; direction would read as Orch stale.
- [Luna-Boss-2] Line-based grep false absence (19:58:29). Wrapped 72–73. Caught by self looking. Cost nil (failed safe).
- [Luna-Boss-2] Case-sensitive grep false absence (21:26:24). Caps emphasis. Caught by self re-running insensitive. Cost nil (failed safe); third narrow instrument of day.
- [Luna-Boss-2] Duration from sense "~20min" = 1min (21:28:30). Rule covered timestamps not durations. Caught by self. Cost peer pacing error 20m; 7th elapsed-time instance.
- [Luna-Boss-2] ANCHOR header mangled (20:43:07). Renamed structural line vs adding entry. Caught by mechanism (tool result). Cost seconds + revert.
- [Luna-Boss-2] Review-brief leak L48 "different commit anywhere" = W1 hint (21:02:53). Caught by self pre-dispatch, 2nd round running. Cost removal; grading would have been vacuous.
- [Orch] Duration refusal would reject 1s legitimate reuse (19:39:19). Proxy elapsed vs property evidence-of-work. Caught by self audit. Cost would have been Luna reopening fine packet as red.
- [Orch] Analytics waiter fell through 40 fails vs dead port (19:43:49). False-quiet waiter mislabels env as verdict. Caught by self audit. Cost fix + demo.
- [Orch] Announced sha ≠ run sha (21:32:14). Both reads correct, window between. Caught by self reading log while fixing header. Cost 3m peers told wrong target.
- [Orch] Stale `updated:` on live hold (21:30:52). 2h22m gap, silent collision. Caught by person (Luna reading artefact). Cost rule fix.
- [Orch/Fable-Arch] "Every injected dependency" unsatisfiable (20:45:42). 2/9 real repo/build. Caught by Luna sweep + Orch owning generalisation. Cost entire round on byte-identical prod (r4→r5 blob id same).
- [Luna-Boss-2] `main..HEAD` false deletion (21:57:56). Question meaning moved with main. Caught by self reading file list ("why diet touches gates.mjs"). Cost near "B1 deleted A" at gate decision.
- [Orch] Checker claimed whole set, tested last only (21:59:22). Caught by self. Cost fix before trusting.
- [Orch] `rev-parse deadbeef` emptiness never fires (22:28:14). Echoes sha-shaped. Caught by mechanism (prove all 3 arms). Cost would have shipped bare `fatal`.
- [B1 author / Luna-Boss-2 brief] Table 32230 vs 32050 +180, omitted arm counts A2/B3 (22:01:08, 22:23:12). True-of-vanished-tree. Caught by person re-running (Luna) + reviewer independently measuring 32050. Cost first reviewer re-run hits defect on first packet with table.
- [Fable-Arch] Task 6 unbound ceiling (22:23:18). `share=caps.length` vs plan per-source. Caught by mechanism (reviewer probe) + person measurement (Luna 8/10, 2.33×). Cost round 2 rewrite at max.
- [Luna-Boss-2] Brief fiat on declared-subjects (22:23:12). Requirement tension resolved in brief not architect. Caught by reviewer finding. Cost task 5 rewrite.
- [Luna-Boss-2] No-codex→no-Desk (22:28:47). Desk=node loop between codex spawns. Caught by person (Orch counted loop=1). Cost would have concluded lock free while held — expensive direction.
- [Orch] Pooled quiet+loaded timings as same distribution (21:34:48). Different conditions + suite +521 lines. Caught by person (Luna). Cost would have set floors from pooled samples.
- [Orch] Luna-max evidence gap (22:03:27). 33%-vs-3% disqualifies medium, selects untested middle. Caught by person (Luna). Cost exception logged on policy not evidence.
- [Orch+Fable-Arch+Luna-Boss-2] 4i2 batching/content bar (21:44:06–21:46:40). Asked timing/machinery, never "what does gate require of new artefact type"; machinery brief for content; 1×403 taken as absence, archive never tried; 185/186 red. Caught by mechanism (gate 3). Cost directive job + re-gate + 81 commits held.
- [Fable-Arch] Quantifier check missed next task 3b (21:50:51). Writer vs reader opposite on `.beads/`. Caught by person (Luna). Cost rule restatement `7696301`.
- [Orch] Harness bypassed both record writers + suppressed write (21:42:51). Direct `npm run build` / `verify-design` → 2 spurious spawns. Caught by self via mtimes. Cost 2 rebuilds + near-report "reuse failed" on 6-round packet.
- [Luna-Boss-2] Paraphrased table bar r2 vs verbatim (22:27:33). Drift that cost A r3. Caught by self after Fable mention. Cost block-quote fix.
- [Luna-Boss-2] Skipped r4 pre-registration (19:31:20). Hypotheses after commit. Caught by self disclosure. Cost W1 labelled noticed not predicted.
- [Luna-Boss-2] Sha `160f1c2` + seal-list `replace_all` corrupting REVIEW4 brief (19:31:20). Caught by mechanism (sha/REVIEW check). Cost nil (caught pre-dispatch); 4th replacement-narrower-than-property.

## 5. CORRECTIONS THAT WERE THEMSELVES WRONG

- **Clock-coupling chain (three repairs, each leaves class).** Fix1 "read in same message" → caused parallel-call future-date (Luna: "parallelism satisfies the proxy exactly while breaking what it stood for"). Fix2 "order not co-location" → still timestamps-only, missed durations ("~20min"=1min; "Extended now"). Luna summary: "each fix repaired the instance and left the class … values but not procedure, co-location instead of ordering, timestamps but not durations." Empty would be false; this is a correction-overshoot chain.
- **Runner-guard inversion (false-positive fix became false-negative).** Fix for "any non-fleet=Desk" (pid35604) was to watch codex absence; then "no codex therefore no Desk" missed node `loop/run.mjs`=1. Orch: "This morning … asserted any non-fleet codex was the Desk; now, no codex therefore no Desk. Same root — guard watches wrong process." Luna: "instrument didn't drift. The question did." Second error costlier (conclude lock free while held). Strongest third-chain candidate.
- **Quantifier generalisation → narrowing → still incomplete.** Specific `floorSet` hole → "every injected dependency" unsatisfiable (Orch: "correct specific finding generalized into quantifier nobody checked") → narrowed decision-carrying + declared (Fable) → enumeration omitted `floors` alias, author derived from signature and reported omission (Luna 21:00:17). Second correction also missed a member; needed worker to complete. Do not count as mere refinement — first correction cost a round, second needed external completion.

## 6. WINS

- [Fable-Arch 19:38:47] Freeze verified from git not memory; answered compaction "what did I lose" as diffable list. Held.
- [Orch 19:39:19] Window fix replaced proxy (elapsed) with property (names path spawned/reused; names neither = refusal), demoed red+green. Prevented A reported red.
- [Orch 19:43:49 / 20:48:44] Gates-only harness 6 separate exits, proved green + 4 reds incl "later gates still ran" — separation actually asked for.
- [Orch 20:02:19] Floor 1,700 not exact; unreadable = refusal not pass. Held (124/1730 both runs).
- [Luna-Boss-2 19:55:17 etc.] Independent mutation re-runs with hash match (10/10,7/7,4×12/0, row4 60831) — corroborates run not just claim.
- [Luna-Boss-2 21:01:07] Negative hunt reported: gates clock observed 1/8+4/7, parallel hole refuted. Half that never shows in verdict.
- [Luna-Boss-2 21:02:53 / 22:27:33] Two pre-dispatch leak/paraphrase catches; seal-list integrity (4 then 5 verdicts) held.
- [Luna-Boss-2 21:27:43] Re-froze behind-HEAD authority (`016ea91`→`fbe1306`) after verifying hunks before task5 + verbatim preamble byte-identical; sha list read not counted (job ids distinguished).
- [Luna-Boss-2 21:29:18] Declined teardown: "peer inviting me into lane does not move lane." Held despite destructive precedent.
- [Luna-Boss-2 + mem-cond] Stopping rule "continue only on new mechanism, never new instance" + applied to withhold agreement reply (19:48:27). Held.
- [Orch 21:28:47] Gated HEAD `a2eec9f`/`b8fa5c1` not announced tip; verified openspec invisibility via SOURCE_DIRS + `:617`; pinned sha + refuse with both shas + diff.
- [Luna-Boss-2 21:37:23] Pre-registered innocent explanation before gate3; wrong cause, still forced third-explanation search. Orch: "having question written down … made me look."
- [Orch 21:44:06] Reported red with no revert, tree as handed; refused hand-written record; evidence: "reviewer:r3-opus … substantive checklist" — record reportable only by reviewer.
- [Orch 22:40:17–22:43:37] Push verified-sha `b8fa5c1:main`, fast-forward + tip-stability + 79-forward-0-revert, remote re-read. First push of redesign.
- [Fable-Arch 22:23:18] Owned task6 as design error; rewrote allocation (priority + guarantee + total cap + CUT) not bolt-on bound.
- [Luna-Boss-2 22:23:12] Invalidated own SW prediction before Luna log opened (avoidance→recovery); mandated readback > trap list.
- [Orch 22:26:05] Reported own proposal nil (0/5) + withdrew round-count test unprompted; pre-committed retraction if nil with code-evidence present.

## 7. PATTERNS

- **Check narrower than property (`xrsg`).** Instances: `\b{7}\b` blind to 33/34 sha lengths; `REVIEW3→REVIEW4` hitting seal list; line-grep missing wrapped tokens; case-sensitive grep vs caps; `# pass` vs `ℹ`; checker testing last directive claiming set; "only posts need record" grep vs launch coverage. Luna: "Naming class gives no protection; only discriminating experiment does."
- **Guardrail refusing correct action (mirror).** Orch window duration refusal vs 1s legitimate reuse; Luna: "wrong answer arriving wearing costume of guardrail working." Fix = replace proxy with property, not loosen threshold.
- **Loose expression travels faster than practice.** Orch same-message → Luna parallel failure: "loose expression is part that travels … only part written down." Same split as freeze-protects-standard vs brief-lossy-copy.
- **Reading vs composing detector.** Orch refinement + Luna data: caught while reading (ANCHOR in tool result, job ids in list) vs missed while composing (7 timestamps, 3 instruments, brief leak). Practical form: artefact must be read in genuinely separate act; tool results cheapest such act.
- **Moving-reference announcement / question.** Announced `3f748af` vs log `a2eec9f` (value T1 governing action T2); `main..HEAD` meaning changed under branch. Fixes: from run's own output; pin immutable sha; `merge-base`.
- **Correct code suite cannot distinguish from absence.** Round4 ordering (`:460`/`:984` deletable 10/10,7/7); W1 default never reached (`{}` 10/10); r5 `now`/`localNow`/`report`/`write` 12/0; B1r1 ceiling not bound. Luna: "implementation defect rate low; evidence defect rate is not."
- **Taking default ≠ observing it.** `floorSet`/`isCurrent` taken but value undepended; `now→0` duration 0 needs `>0` not `>=0` (H2).
- **Author picks mutation picks easy one; completeness rots first.** Orch traps; r6 table scoped to r6 correctly excludes `:357` (line since r1); unlisted line permitted-but-unguarded.
- **Synthetic fixture manufactures false red.** `printf ℹ` vs `342 204 271`; fix = edit captured real output. "False red costs same confused hour as false green."
- **Name-level claim for source-level question.** "Non-fleet=Desk" both directions; fix = print command line not guessed identity; state question instrument answers before reading output.
- **Fixed floor vs growing denominator.** 78.7s 25%→20% in one packet; safe vs false-fail but detection decays silently; no auto-recalibration (trusts run floor doubts); record size+date+fraction.
- **Pre-registered alternative need not be correct to be useful.** Gate3 openspec prediction wrong, third cause (harness+`.beads/`) found because question present.
- **Additive to corpus = additive to denominator.** Content "no machinery path" missed review-record obligation; 150 seed records as ready-made bar never opened.
- **Evidence true of vanished tree.** 32230 vs 32050 +180; superseded sha in brief; same class.
- **New: instrument answers one question, question drifts.** Codex guard correct for "another fleet codex?" misread as "whose?" then "machine free?" Answers coincide usually, invisible until costly. Diagnostic: say instrument's question before output.
- **New: correction inherits detector's blind spot.** Past-dated timestamps invisible to future-date flag; overshoot self-announcing vs undershoot invisible; each repair leaves class (see §5).
- **New: rule without reason degrades to superstition.** Byte-offset reason makes live-script edit absolute ("resume at offset into different text, execute fragment") vs "hazardous" inviting exception; refusal must name both shas + diff.

## 8. MECHANISM vs SUSPICION TALLY

- **Mechanism (ran/measured/proved): ~18.** sha/REVIEW list catching stale sha + seal corruption; git diff proving freeze live; arithmetic script (+6.9m); parser undefined → VACUOUS rewrite; zero-test run proving gate1 hole; green+red proofs catching fixture bytes; `loop/run.mjs` counts (0 proving specgraph, 1 proving Desk alive); mutation re-runs (10/10,7/7,4×12/0, 15/12/3 60831 hash); live-tree 8/10 overshoot measurement; `rev-parse --verify` 3-arm proof; mtime walk finding `.beads/` 7/8; SOURCE_DIRS + `:617` proving openspec invisibility; reorder multiset-refuse + parser + dry-run; floor-1700 + refusal; gates-only 6-exit stub run; `merge-base` file-list correcting diffstat.
- **Suspicion (person reading/reasoning, no new run): ~16.** Withheld-leak L48 catch; paraphrase→verbatim catch; ANCHOR? borderline — counted mechanism (tool result as reading act per 21:33:53); wrapped-line look; caps re-run; "~20min"=1min; `main..HEAD` "why diet touches gates.mjs"; pooling-timings objection; luna-max comparison hole; task3-vs-3b contradiction; floors-alias omission (author deriving from signature — borderline mechanism, counted here as suspicion+rule-following); brief-fiat fault (reviewer person + Luna owning); teardown refusal; stopping-rule silence; byte-offset reason retention.
- **Borderline named:** ANCHOR catch (tool output reading = mechanism per Luna-Orch falsifiable split); floors alias (signature-derived declaration = mechanism-guided suspicion); reviewer near-miss `gates.mjs:370` green-as-evidence (mechanism run, suspicion judgment not to file); B1 log "mid-edit task8" reading (log tail as mechanism for progress, suspicion for H4 scoring).
- Ratio for unattended desk: most load-bearing saves (gate3 misread prevented, `.beads/`, 8/10 bound, push-sha) needed person reading artefact + mechanism re-run together; neither alone sufficed.

## 9. WHAT I COULD NOT TELL FROM THIS CHUNK

- Does Orch's closing dispute (23:15:28) overturn Luna's lock-timeout attribution for B1r2 suite (125.5s exit124, 16:27:52–17:06:03 vs hold to 16:39)? Need lock/clear times + `npm test` cap in chunk 06.
- Does B1r2 sealed REVIEW2.md approve? Reviewer dispatched 23:13:55; verdict, W1 grade, new findings unknown — carries mutation-table class test (nil again with code-evidence present = ceremony?).
- Does packet E / B1r2 produce code-evidence defect testing table's class question? Needed for Orch withdrawal commitment.
- Does task 3b + task31 land and restore reuse availability? `.beads/` exclusion + availability measurement open.
- Does `kb9e` floor-drift get fixed (label size+date, no auto-recalib) and does test floor leave single digits over 6 remaining packets?
- Does publishing turn back on / Stage0 push sequence complete? Trigger "last packet green" pending; 81→? unpushed count.
- SW-MCP-DEV Luna run: does Luna hit coordinate trap, recover via readback, resolve 13.137 vs 12.7mm (thread proud vs box semantics)?
- Token-cost rollup: only r5 7.45M measured; total Stage0 cost, medium-vs-max repair rate for luna-max reservation open.
- Citation sweep + fixture-count chains (known to span 07–08) do not appear here; no third chain confirmed beyond §5 candidates — need later chunks to test if clock/guard/quantifier chains overshoot again.

