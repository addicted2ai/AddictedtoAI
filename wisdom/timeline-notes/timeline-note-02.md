# TIMELINE CHUNK NOTE 02 of 08

## 1. SPAN

- First entry: `2026-09-08T10:04:43.551Z` — [A2AI-luna-boss (2/2, post-compaction)] batch-2 every-5 verdict (one P3 `4vjb`, `d1ki` self-correction).
- Last entry: `2026-09-08T13:33:22.668Z` — [A2AI-Orch] filed `xrsg`, routing lesson to memory.
- Work across span: ml25 (P1 post-merge third state) designed → implemented (`d30bb46`) → sealed revise (3 findings) → revised (`4b37d54`) → merged with q6xp as `2a9a83d` (1707 tests, six gates); q6xp ordering fix; jl09/la7n/mhsf triage; maintainer wakes ("backlog essentially has not moved!") → backlog measurement → fleet-vs-Desk lane split → scout-never-ran diagnosis → jqs alias collision → session death/handover to A2AI-Luna-Boss-2 → orphaned-workers false alarm → 4i2 implement/review/handover + yjb5 split → 4lrp re-derivation/implement/review-in-flight → 10 DIRECTIVES.md directives → vqbo repriced then deferred → 226f transclusion finding → bfn0/xrsg filings.

## 2. CLAIMS OPENED

- [luna-boss 10:04:43] Batch-2 every-5: one P3 cross-change interaction `addictedtoai-4vjb` (`{"calls":2,"submissions":[1,1]}`), no regressions, no common-mode defect; batch1-vs-batch2 3-vs-1 attributed to batch-2 briefs carrying narrow-check diagnostic.
- [luna-boss 10:04:43] `d1ki` overstated: removing wiring does NOT leave `npm test` in "complete silence" — `run-tests.mjs` prints `run-tests: waited Ns` from separate branch; corrected to P3, loss is contemporaneous holder-naming vs retrospective duration.
- [Orch 10:05:02] ml25 is P1, reason chain had to stop before every merge window, design escalated to Orch.
- [Orch 10:08:30] ml25 design: phase-1 commit inside `publishStep` is no-op on did-not-run path because `commitJobRecords` (:1888) already commits same `staged` set passed as `owned` (:1928); minimal change preserves red path, adds third state `publishAfterRecords = !buildDidNotRun`.
- [Orch 10:10:16] Publication observable: `publishStep` is only route to push, so whether it is *entered* settles publication question with publishing enabled and nothing pushed.
- [Orch 10:11:16] All-five-fail cause: `makeRepo` does `o.config ?? DEFAULT_CONFIG` so `{publish:true}` replaces whole config; must spread `DEFAULT_CONFIG`.
- [Orch 10:12:33] `/publish/i` detector matched own "PUBLISHED" diagnostic — fourth instance of instrument-matching-thing-it-distinguishes; fix by anchoring `^publish: `.
- [Orch 10:14:48] ml25 mutation-proved: revert-third-state CAUGHT (2 tests); round-4 fix (suppress halt but publish) CAUGHT by publication test; `run.mjs` sha `7AAA8A83CA116747` identical; 68/68 neighbours.
- [Orch 10:17:13] ml25 merged-candidate `d30bb46`; next-run semantics: unverified merge held until a later green post-merge build carries it; no re-gate queue needed.
- [luna-boss 10:29:41/10:30:04] jl09 already fixed: `removeJobWorktree` before `deleteBranch`, boolean inspected, 0 of 38 branches merged vs finding 113 merged-undeleted.
- [luna-boss 10:31:24/10:31:51] la7n + mhsf same defect same lock `9740ab9a79701c3bdac0044788ee02bc.atai-build.lock`, pid reuse; mhsf stronger; la7n adds second occurrence 5 weeks earlier turning "accepted residual" into recurrence (600s + refused gate, then hour wedge).
- [Orch 10:38:46] q6xp done `dd773d6`: phase write above environmental return; mutation defect-reintroduced 29/1, restore 30/0, sha `ACC399D75C915787` identical; assertions in existing test read ledger not log.
- [luna-boss 10:44:04] ml25 revise, 3 findings all test-side, production sound; Finding1 `PUBLISH_ENTERED=/^publish: /` matches only fallback (`publishStep` temp fixture has no shared step; real path logs `publish — …` via `say()`); Finding2 ledger `outcome:done` vacuous (broken world also `{"outcome":"done","hold":true}`, mutation 3/5 while test passed); Finding3 cap unobservable because `opts.gates(ctx,ctx.repoRoot)` passes no options. Withheld-questions answers: phase-1 second-net caveat (unmatched-pathspec `tqpq` trap); predicate disjoint-evidence so impossible-by-construction.
- [Orch 10:52:45/10:53:18] Green-control timeout cause: shared step pushes then polls SITE_URL with 10-min budget; `publish.test.mjs` injects `pollBudgetMs` but runLoop never forwards it, so any real publish via runLoop costs 10 min; must forward `pollBudgetMs`.
- [Orch 11:05:43] Under mutation2 (round-4 fix) HOLD.md test also failed → `pulse/lib/publish.mjs` writes HOLD.md itself `deploy-hold:` when push succeeds but site doesn't serve commit; round-4 fix publishes unverified merge then halts anyway later/confusingly.
- [luna-boss 11:11:50/11:12:50] `makeContext` returns explicit literal, no spread of opts; production passes only repoRoot/worktreeRoot; test-only budgets unreachable by construction; ml25 cleared no second round; residual: inertness depends on never spreading, `pollBudgetMs` has no floor vs `confirmBudgetMs` floored 3× poll; HOLD.md has THREE jobs (breaker + publish gate + deploy-confirm writer).
- [Orch 11:36:50] Both P1s merged+pushed `2a9a83d`: `npm test` 1707/1707, build, verify-launch 15, verify-design 46, verify-surfaces, verify-analytics 20; 1702→1707; no longer must stop chain before window.
- [Orch 12:06–12:08] jl09 closed on production evidence (38 present, 0 merged vs 107–113); la7n superseded by mhsf not as duplicate (rate is finding); ml25 shrank mhsf blast radius without touching it.
- [Orch 12:17:08] Status: batches 1+2 complete; gates 5 rounds/5 reviews stopped on net-negative-risk (rounds 4+5 introduced new defects); HOLD.md 07:19Z genuine date-roll; live-site `data/launch.json` revert (`lvba`); memory 58→1 index + FULL-MEM-LOG ~127KB.
- [Orch 12:21:42] Backlog measured: CLOSED 7, FILED 9 (7 open), NET +0; open 97 (90 predate), ready 87.
- [Orch 12:22:25] 81/97 site-facing; oldest 29–31 Aug (9 days); every closure machinery; gates 1-in-4-out.
- [luna-boss 12:24:17] `verify-launch.mjs`: MISMATCHED fails; UNBOUND/MISSING fail nothing → creates safe, reviewed-edits blocked by vqbo.
- [Orch 12:25:43] Desk: 18 jobs (13 done, 2 failed both Orch unrunnable directive, 2 blocked, 1 discarded; 14 repair/3 entry/1 interpret; 331 model-min); queue ~6→1, last is scout medium not cleared; Desk queue vs beads backlog distinct; Desk will idle; 20 editorial beads to route.
- [luna-boss 12:26:37] Fleet cannot produce review record, only Desk can: Desk moves site work, fleet moves code; vqbo repriced as gate; dispatchable 3 (jqs,4i2,4lrp), 4lrp flagged though pulse/ implementation.
- [Orch 12:27:06] Verified: no `rlhf.md`, learn pages 2 records each, `verify-launch.mjs:531` missing/unbound fail nothing.
- [luna-boss 12:28:35 / Orch 12:31:38] `proximal-policy-optimization.md:12` already claims `RLHF` (+`Reinforcement learning from human feedback`), 4 records; Orch adds TWO entries touch term.
- [Orch 12:28:51] `codex-gpt-luna` NO job_types clearance ("Scout should be max effort"); medium withholds scout+post; escalation runner passed all night yet scout never ran.
- [Orch 12:29:22] Escalation never fired: guard `grep runner:job-type && ! grep -qE degradation|capacity|budget` per-log not per-candidate; unrelated `[degradation:shed] education:` suppressed `[runner:job-type] scout:`.
- [Orch 12:30:54] Second worse finding: escalation gated on `! grep ^selected:` — selector refuses scout then picks lower-priority candidate, run succeeds, scout skipped silently forever.
- [luna-boss 12:31:25] jqs NOT create-shaped: per `lib/aliases.mjs` linkable only if exactly one entry declares at all and exclusive; second declaration → ambiguous, linker silent; creating rlhf.md no-op with commit; needs create+alias-removal in one Desk run; RLHF pipeline vs PPO algorithm ("baking"/"oven"); batch3 TWO not three; message-to-`addictedtoai-73` failed (renamed) → bead-first rule.
- [luna-boss 12:32:15] Linker splits render-tree text nodes, byte-identical assertion, never touches source → linkable entry wires itself at build, no edit/rebind.
- [Orch 12:37:38] Claimed 4 codex alive, 2 started 06:35 = orphaned 4i2/4lrp implementers + 2 from 9/7 14:04 wedged; `fleet5/4i2` exists; j-20260908-13 mid-review unaffected. (Later retracted.)
- [Luna-Boss-2 12:53:03] Counter-claim: only PIDs 38088 (yesterday leftover) + 6764 (Desk reviewer 06:50:22); 3264/22192 absent; no 4lrp worktree ever; no dispatch log; no `.agent-brief.md` in fleet5-4i2; nothing dispatched, 06:35 = Desk j-20260908-13 author chain.
- [Luna-Boss-2 12:50:59] 4i2 tree claims: 11 event entries, none chatbot launch, "ChatGPT" only prose no alias declaration.
- [Luna-Boss-2 12:55:24] 4lrp re-derivation: retirements `new:null` + `String(change.new ?? 'unknown')` → naive widening writes literal "unknown" schema-valid silent; KIND.SUBSTITUTION separate from RETIREMENT, bead never names it.
- [Luna-Boss-2 12:55:41] `review-hash.mjs` header exempts `timeline` precisely because Pulse appends mechanically → 4lrp safe.
- [Orch 12:56:45/12:57:18] Concedes orphan claim wrong: inference not measurement; `Name -like '*codex*'` too loose; PID+time cannot identify fleet worker, must match command line `*\fleet*`.
- [Luna-Boss-2 13:02:37] Inherited 4i2 brief defects: clause cut mid-sentence; inversion on openai.com 403 ("do not spend task fighting" vs bead "itself the interesting part" + fetch-strategy-or-secondary); stale commit trailer; worker 3.6m one new file 61 lines.
- [Luna-Boss-2 13:12:24/13:12:59] 4i2 reviewer revise: learn page says "one of these systems was put behind a text box" never writes name; verified "ChatGPT" zero times in all `content/learn/`; `where-ai-came-from.md` has record so naming is Desk-only; `eliza.md:104` body prose gives one real inbound link; follow-up `addictedtoai-yjb5` (P2); no revision round because fix out of fleet reach.
- [Orch 13:08–13:13] Directives: 4 then 10 live verified from blob via loop parser (`jqs,5xc,bc0,ckn,h8i,o9d,9bu,88x,k6c,f7l`); `47w` excluded truncated/unverified; ledger `issues` harvest overstatement fixed (fc8, kwj references); queue exactly 1 (scout); chain run1 72-min machinery because no queue/directives; vqbo ~400 lines/5 modules deferred per no-machinery-not-on-path rule.
- [Luna-Boss-2 13:17:36/13:18:48] Inbound count settled at 5 floor not ceiling: 8 files contain ChatGPT, 5 body prose (4 blog + eliza), 3 front-matter only uncounted because `lib/markdown.mjs:43` body coverage measured, front-matter path not; blog surface links on merge, learn links nothing.
- [Luna-Boss-2 13:21:25] 4lrp withheld finding verified: `materialValue` null when missing (`diff.mjs:204`), `deriveStatus` null for absent field path (`:196`) → status field_change CAN carry `new:null`; author `String(change.new)` writes literal "null" where old `?? 'unknown'` guarded; reviewer dispatched blind to grade it.
- [Orch 13:23:06] Triage 98 open finds NO untapped create-shaped (jqs flags MIXED as control); backlog essentially all edit → vqbo is reason fleet can't touch ~81/97, everything via serial ~70-min queue; handed to fleet as code.
- [Orch 13:25:53/13:26:37] Scout unreachable whenever ANY directive pending (directives outrank derived queue, no `--type` flag) → filed `bfn0` (P2) second independent cause, self-inflicted by 10 directives.
- [Orch 13:27–13:31] 226f (P1 since 09-06) mispriced: option-a unbind 48 facts/29 files breaks 33 transclusions → 12 files build-break, 4 with NO declined binding (deepseek, google-deepmind, openai, spacexai) absent from `declined-binding-debt.json` (bindings≠transclusion closure); `openai-gpt-5-6-sol.md:115-120` comparative argument destroyed; third option feed→cited with as-of; Artificial Analysis Intelligence Index versioned "v4.3" explains 165/179 rows (147 down 0 up) as rebasing not decline; cited number must carry version; coding/agentic absence NOT concluded (client-rendered).
- [Luna-Boss-2 13:30:56] vqbo mechanism: bytes-bound record → mismatched fails gate → clears only via new record → Desk writes record only for changed pages → empty diff `run.mjs:390` = failed → likely-answer cannot clear, directive reselects, 3× trips HOLD.md breaker; fleet-parallel fix = security-critical laundering risk; cheap experiment (fleet drafts directive body, Desk applies+reviews) avoids trust boundary; handed o9d,f7l,88x (+226f ahead of 88x).
- [Luna-Boss-2 13:32:46] New pattern proposal: list enumerating one thing read as list of another (3 instances in day); offered to file as bead.
- [Orch 13:33:22] Filed `xrsg` (pattern bead).

## 3. CLAIMS SETTLED IN THIS CHUNK

- Batch-2 every-5 = 1 P3 + no common-mode: opened 10:04:43, stands (no retraction in chunk; Orch accepts "nothing to merge").
- d1ki "complete silence": opened earlier (outside chunk), RETRACTED 10:04:43 within ~minutes of restatement: "False for any wait over a second: `run-tests.mjs` prints its own `run-tests: waited Ns for the test lock` from a separate branch that never touches the lock's `log` hook. I verified the code and corrected the bead to P3."
- ml25 entered-detector (`publishStep` entered, `/publish/i` → `^publish: `): opened 10:10–10:12, RETRACTED 10:44:04 by sealed reviewer + Orch self-verify: "`PUBLISH_ENTERED = /^publish: /` matches only the *fallback* branch's lines... The detector works inside the fixture and could never see a real publish." Rebuilt as bare-origin read-off-remote. Stood ~30 min.
- ml25 ledger `outcome:done` test: opened ~10:10, RETRACTED 10:44:04: "The ledger test asserts `outcome: done` — but the original defect *also* produced `outcome: done`... The assertion was already true in the broken world." Deleted. Orch admits: "finding 2 was visible in my own mutation output... I had the evidence and didn't read it." Stood ~35 min.
- ml25 cap unobservable: opened implicitly by passing suite, CONFIRMED as gap 10:44–10:57: hook never received options; fixed by passing options; mutation-proved.
- `pollBudgetMs` forward safety: Orch "no production caller sets it" → STRENGTHENED 11:11:50 by luna-boss to by-construction (`makeContext` literal, no spread), then qualified with residual (future spread + no floor shortens deploy-confirm). Stood as strengthened+residual.
- HOLD.md two jobs → THREE jobs: opened as two-job rule, CORRECTED 11:05–11:12: "writes `HOLD.md` *itself* with a `deploy-hold:` marker when a push succeeds but the site doesn't serve that commit... trades one halt for a halt plus a deploy." Promoted to primary ml25 argument.
- ml25+q6xp merged `2a9a83d` six gates green: claimed 11:36:50, stands (no counter-evidence in chunk).
- jl09 fixed: claimed 10:30:04, CONFIRMED independently 12:06:45 by Orch (`removeJobWorktree` :1902 before `deleteBranch` :1922, 38/0 vs 113), closed 12:08:08.
- la7n/mhsf same defect: claimed 10:31:24, CONFIRMED 12:08:08, la7n superseded (not duplicate, rate preserved).
- Backlog net-zero + all-machinery: claimed 12:21:42, CONFIRMED by luna-boss re-derivation 12:26:37 ("net +0... every closure machinery") and Orch fuller correction (fleet structurally cannot move site work).
- Desk 18-job accounting: opened 12:25:43, stands (luna-boss accepts correction 12:25:55).
- verify-launch MISMATCHED-only: claimed 12:24:17, CONFIRMED 12:27:06 by Orch from blob + own observation ("I watched `mismatched 1` fail it tonight").
- jqs create-shaped: claimed 12:26–12:27 (both sessions, filename check), RETRACTED 12:28:35–12:32:20: "That changes jqs's premise... `technique/proximal-policy-optimization.md` — four review records — already claims `"RLHF"`... So creating `rlhf.md`... leaves the term with two declarations, still unlinkable." Orch: "I ran an existence check on the wrong artifact and a negative on a nearby path manufactured confidence." Stood ~1 hr. Yields exception rule (alias-grep not filename).
- Scout clearance: Orch "medium isn't cleared so needs escalation" → CORRECTED by maintainer ("Luna was cleared for scout, as long as max") + registry quote; Orch concedes tooling bug. Stood ~3 min.
- Escalation per-log guard: claimed as fix, PARTIALLY QUALIFIED 12:30:54: controls pass but "empty 'real logs'... every run last night did select something" so per-type fix alone wouldn't help; second independent cause (selects-something gate). Same chunk.
- Linker wrap-only build-time wiring: claimed 12:31–12:32, stands.
- Orphaned 4i2/4lrp workers: claimed 12:37:38 (pids 3264/22192), RETRACTED 12:53:03–12:57:18 by Luna-Boss-2 five negative checks + Orch verify: "there were no orphaned workers... I inferred identity from a count and a coincidence of timing." Stood ~15–20 min. Cost: handover + compaction prompt contaminated (Sections A2/L0 rewritten twice).
- 4i2 brief inversion: inherited brief "do not spend the task fighting" vs bead "itself the interesting part": CONFIRMED 12:57:18, fixed before dispatch.
- 4i2 learn-links premise ("learn page already carries prose"): opened in brief, RETRACTED 13:12:24–13:15:03 by sealed reviewer + independent verify ("ChatGPT appears zero times in all of `content/learn/`... The linker is wrap-only; it can't add a name"). Luna-Boss-2: "Diffing a brief against its issue tests whether the brief is faithful; it does not test whether the brief's assertions about the tree are true."
- 4i2 inbound count 1 vs 1–8 range: SETTLED 13:17–13:18 at 5 floor (8 files, 5 body, 3 front-matter uncounted).
- 4lrp "unknown" trap: predicted 12:55:24, CONFIRMED in implementation (author avoided it on retirement path) but NEW regression opened on status path (`String(change.new)` → literal "null"): verified 13:21:25 via `diff.mjs:204/:196`, held to grade reviewer. Open at chunk end (reviewer running).
- Directives outrank queue → scout starved: claimed 13:21:54, CONFIRMED 13:25:36 (no `--type` flag), filed bfn0.
- vqbo blocks backlog: opened as P1-first, QUALIFIED 13:02:14 (only empty-diff case; 10 directives unblocked) then REPRICED 13:23:06 (no create-shaped among 98 → single reason fleet can't touch ~81/97) then DEFERRED by agreement to cheap experiment. Decision recorded on bead for maintainer overrule — open.
- "RLHF resolves to PPO": claimed by Orch, RETRACTED 13:23:06: "It doesn't, and never has — PPO declares it `manual`, and `lib/aliases.mjs:69` makes a name linkable only when exactly one entry declares it *and* that declaration is `exclusive`."

## 4. MISTAKES

- [A2AI-Orch, 10:12:33] Publication detector matched own diagnostic. Claimed anchored check; true: `/publish/i` went red on "...and NOT PUBLISHED" line the change itself added. Caught by person (Orch reading failure). Cost: re-anchor + later full rebuild; self-counted as 4th instance of night's shape.
- [A2AI-Orch, ~10:10–10:44] `^publish: ` anchor landed on wrong side. Claimed publication proof; true: regex matched only fallback branch, could never see real publish. Caught by sealed reviewer (mechanism: independent max review) + Orch self-verify. Cost: revision round, `pollBudgetMs` forward, ~70s suite, bare-remote rebuild.
- [A2AI-Orch, ~10:10–10:44] Vacuous ledger test (`outcome:done`). Claimed regression guard; true: broken world also produced done+hold. Caught by reviewer; disproof was in Orch's own mutation list ("ledger test wasn't among them") unread. Cost: deleted test + second miss of same reading failure (census arithmetic).
- [A2AI-Orch, 10:10–10:44] Cap untestable. Claimed 5/5 mutation-proved; true: hook signature `(ctx,dir)` never received options so cap deletion left suite green. Caught by reviewer. Cost: production signature change + new tests.
- [A2AI-Orch, stated 11:10:43] Reading for wrong question twice. Claimed "CAUGHT" from headline; true: which-tests list disproved coverage. Caught by person (self + coordinator generalisation). Cost: two vacuous proofs shipped to review.
- [A2AI-luna-boss (pre-chunk, corrected 10:04:43)] d1ki "complete silence." Claimed silence; true: separate branch prints wait duration, only holder-naming lost. Caught by sealed every-5 reviewer going one measurement further (mechanism). Cost: bead corrected P3, lesson on measure-consequence-from-run.
- [A2AI-Orch, 12:25:43→12:27:43] Conflated Desk queue with beads backlog. Claimed backlog didn't move because fleet did machinery; true: Desk drained 6→1 (13 jobs) while beads net-zero, and fleet cannot move site work. Caught by luna-boss constraint + Orch verify. Cost: misdiagnosis corrected within ~2 min, redirect rewritten.
- [A2AI-Orch + A2AI-luna-boss, 12:26–12:31] Filename-for-alias check. Claimed jqs create-shaped from `ls .../rlhf.md` absent + 554 wiki files; true: PPO claimed RLHF alias + 4 records, second declaration = silent unlinkable. Caught by luna-boss one grep (person suspicious) then Orch verify. Cost: batch 3 cut 3→2, jqs rerouted to Desk; new exception rule.
- [A2AI-Orch, 12:29:22–12:30:54] Escalation guard wrong scope + wrong gate. Claimed escalation would fix scout; true: (1) per-log not per-type suppressed 18/18, (2) gated on selecting nothing so any lower-priority pick hides refusal forever. Caught by person (Orch proving new guard on real logs found empty section). Cost: all-night scout starvation; fix only half-effective; direct-run + bfn0 needed.
- [A2AI-Orch, 12:37:38] Orphaned-workers inference. Claimed pids 3264/22192 = dispatched 4i2/4lrp; true: nothing dispatched, no 4lrp worktree/log/`.agent-brief.md`, Desk j-20260908-13 chain. Caught by Luna-Boss-2 five negative checks (person). Cost: false handover to maintainer + contaminated compaction prompt (A2/L0), corrected ~20 min later; also loose `Name -like '*codex*'` query.
- [A2AI-luna-boss (predecessor), inherited] 4i2 brief inversion + truncation + stale trailer. Claimed brief faithful; true: "do not spend task fighting" inverted bead's "itself the interesting part." Caught by Luna-Boss-2 imperative-diff audit (person). Cost: brief corrected pre-dispatch.
- [A2AI-Luna-Boss-2, 12:50–13:12] Brief-faithful-but-false. Claimed audit complete after 3 fixes; true: load-bearing premise "learn page already carries prose" false (name zero times in learn/). Caught by sealed reviewer (mechanism) + self-verify. Cost: no revision round (correctly refused as out-of-fleet-reach), split to yjb5; new two-pass rule (faithfulness vs truth).
- [A2AI-Luna-Boss-2, initially] Inbound count "one." Claimed 1; true: 5 floor (missed 4 blog body hits, correctly excluded 3 front-matter). Caught by self re-measurement after Orch range (person). Cost: bead correction.
- [Fleet 4lrp author, via Luna-Boss-2 13:21:25] Dropped `?? 'unknown'` on status path. Claimed handling all three kinds + avoiding "unknown"; true: status field_change can be null → writes literal "null" schema-valid silent. Caught by coordinator pre-review diff suspicion (person). Cost: held to grade reviewer / revision round pending.
- [A2AI-Orch, 13:23:06] "RLHF resolves to PPO." Claimed live harm; true: manual ≠ exclusive so never resolved. Caught by self (person). Cost: directive correction.
- [A2AI-Orch, 13:11–13:27] Routed 10 P2/P3 before reading P0/P1. Claimed priority order; true: P1 226f (since 09-06) outranked all routed. Caught by self (person). Cost: admitted wrong order; 226f analysis after the fact.
- [A2AI-Orch, 13:21–13:25] Directives starve scout. Claimed 10 directives fix backlog; true: directives outrank queue with no `--type`, scout now unreachable by chain. Caught by self (person). Cost: bfn0 filed, scout must run by hand.

## 5. CORRECTIONS THAT WERE THEMSELVES WRONG

- **The `^publish: ` anchor (Orch 10:12:33 → retracted 10:44:04).** Original error: `/publish/i` matched own NOT-PUBLISHED diagnostic. Correction: anchor to `^publish: `. Correction wrong: that shape is exactly the fallback branch's lines; real path logs `publish — …`. Orch: "The anchoring was the right response to the wrong problem — I re-tuned a false red without understanding *why* it was red, and got a working regex by luck." / "landing on the wrong side of its own fix." Required second correction (bare origin + read off remote + `pollBudgetMs` forward). This is the chunk's clearest correction-itself-wrong chain and matches the prompt's hardest category in miniature.
- **The per-type escalation fix (Orch 12:29:37 → qualified 12:30:54).** Original error: per-log guard suppressed escalation. Correction: per-type guard, proved on 4 controls. Correction incomplete/wrong as sufficient remedy: same chunk shows block gated on selecting nothing, so "fix alone wouldn't have helped... skipped silently, every run." Fix correct but answers half the failure; filed as second cause rather than reopening fix.
- **The "fleet does site work" redirect (Orch 12:22:59 → corrected 12:26–12:27).** Original error: night spent on machinery. Correction: batch 3 = five site beads to fleet. Correction wrong in scope: fleet structurally cannot finish reviewed-edits; site moves via DIRECTIVES.md (Orch lane). Replaced within ~5 min by 3→2→Desk routing + alias exception. Included because self-correction overshot in same motion (fleet→site) before landing (Desk→site).
- Empty otherwise: no evidence in chunk for third full chain of the citation-sweep / fixture-count kind; those span other chunks per instructions.

## 6. WINS

- Sealed ml25 review withheld from author's two doubts, judged production sound + 3 test gaps; coordinator: "since it had no idea they were candidates, that's real evidence rather than steered agreement" (11:12:50 clearance, no second round after `makeContext` by-construction verify).
- Deploy-hold discovery via chasing unexpected second HOLD.md failure under mutation2; promoted to primary ml25 argument; HOLD.md two→three jobs, both sessions agree with code cites.
- Bare-origin publication proof (read off remote, import-graph file set, control genuinely pushes) replacing log-regex; `NOTHING REACHES THE REMOTE` in gate.
- `pollBudgetMs` forward flagged for review not slipped in; dependent named at `makeContext`; residual (no floor) recorded on bead.
- q6xp mutation against defect itself (return moved back exactly as shipped), ledger-reading assertions in existing test.
- jl09/la7n/mhsf triage without dispatch: re-derived before selecting, closed/superseded with production counts (38/0) and rate-preservation.
- Withheld-findings grading: 4lrp "null" held back to test reviewer; 4i2 archive-mirror held (reviewer missed it, proving grading works both ways); explicit seal hygiene (no bead notes during review, `neutralise`, f5 generator for content).
- Refusal to pad batch 3 (three→two; declining 2ok0/eexr/rnqa/226f as membership/source-path).
- No-merge-while-`publish:true` Desk job holds (4i2 reviewed but held; monitor armed on pid+creation-time after self-match lesson; 4-arm liveness proof red+green).
- Blob-verified directives (loop's own parser, one harvested id each, harvest-overstatement fixes) + `47w` exclusion as unverified.
- 226f restraint: measured blast radius (508 transclusions, 33 unresolved, 12 builds, 4 unlisted orgs), proposed third option, verified version "v4.3" mechanism, refused to conclude coding/agentic absence from single method, left three-way call to maintainer.
- vqbo deferral to cheap experiment (fleet drafts body, Desk applies+reviews) with Rule-1 prior (worse than gates) and trust-boundary pricing; recorded on bead for overrule.

## 7. PATTERNS

- **Check-narrower-than-property (named in file).** Instances: ledger `outcome:done` true in broken world; `PUBLISH_ENTERED` verifies bookkeeping not remote; cap test green with cap deleted; filename check for alias question; debt file enumerates bindings not transclusion closure (226f); brief faithful (imperatives present) vs true (premises hold).
- **Vacuous proof where most careful.** Orch: "Three of the four were in checking apparatus, written while being most careful" (revert guard clean-on-known-revert, MUTATION `[]:[]`, self-matching process query, publication detector matching own diagnostic) + `^publish: ` fallback-only + ledger test + cap hook.
- **Reading for the wrong question.** Coordinator generalisation 11:12:50, adopted by Orch: "'did the mutation get caught' rather than 'which tests caught it.' A passing count answers the first and conceals the second"; also census arithmetic (twice disproof on screen unread).
- **Re-tuning false red without understanding gets right regex by luck** (Orch 11:10:43, quoted).
- **When correct check expensive, incorrect gets written** (Orch 11:10:43: 10-min poll → log line instead of remote).
- **Shape read as scope.** PID+timestamp read as fleet identity (orphans); filename read as alias absence (jqs); `Name -like '*codex*'` looser than question; grep/count as dispatch proof absent logs/`.agent-brief.md`.
- **List-of-X read as list-of-Y (new, proposed by Luna-Boss-2 13:32:46).** Three in-day instances: brief "carries prose" (claim not name); `declined-binding-debt.json` (bindings not transclusion closure); 4i2 "one inbound" (counted file not body-prose hits). Offered as `xrsg`.
- **Guard shown only green asserts author's model.** Orch monitor 13:14:44: "proving the liveness check can return both answers on the same code path"; escalation controls red+green.
- **Property nothing can observe nothing can hold** (cap hook, quoted 10:57:39).
- **Message dies, bead doesn't.** Send to `addictedtoai-73` failed mid-send on rename (12:30:35, 12:31:25); findings moved to beads; vqbo decision put "on the open bead, not in a message."
- **Beads as side channel around seal** (cited in compaction prompt; applied: withheld findings to disk not bead notes during review).
- **Second net / invisible-at-decision-site.** Phase-1 second attempt under commit failure; HOLD.md triple-job in different module from suppressor; `pollBudgetMs` no-floor dependent at `makeContext`.
- **Committed-task outlives input** (vqbo half: `.job/source.json` resume regardless of DIRECTIVES.md; branch must be torn down).
- **Do-not-loosen-guardrail-that-refuses-you + direction-of-strictness** (cited in prompt; applied in vqbo laundering analysis).

## 8. MECHANISM vs SUSPICION TALLY

- **Mechanism (sealed/independent review or executed proof): 7**
  1. Every-5 reviewer re-finding `d1ki` + going one measurement further.
  2. ml25 sealed reviewer finding all 3 test gaps (F1 fallback-only, F2 vacuous ledger, F3 cap).
  3. Mutation runs catching revert + round-4-fix (post-rebuild, 3/3).
  4. q6xp defect-reintroduced mutation (29/1 intended-only).
  5. Escalation 4-control proof (red where should escalate, green where not).
  6. Monitor 4-arm liveness proof (live-pid-wrong-time reads dead).
  7. 4i2 sealed reviewer finding learn-name gap coordinator missed (11.5 min max).
- **Person being suspicious (re-derivation, re-grep, reading output): ~14**
  1. Orch self-reading `/publish/i` vs own diagnostic.
  2. Luna-boss verifying F1 in code (fallback vs `say()`).
  3. Orch verifying F1 + vacuous ledger from own mutation list.
  4. Luna-boss strengthening `makeContext` to by-construction + residual.
  5. Orch chasing extra HOLD.md failure → deploy-hold.
  6. Orch + luna-boss verifying MISMATCHED/UNBOUND/MISSING from code.
  7. Luna-boss one-grep PPO alias killing jqs premise.
  8. Orch proving new guard on real logs → discovering selects-something gate.
  9. Luna-Boss-2 five negative checks killing orphan claim.
  10. Luna-Boss-2 imperative-diff catching brief inversion.
  11. Luna-Boss-2 `diff.mjs:204/:196` verifying "null" regression.
  12. Orch blob-parser verification catching harvest overstatements (fc8/kwj).
  13. Orch 226f transclusion + version "v4.3" measurement.
  14. Luna-Boss-2 settling inbound 5 + front-matter exclusion.
- **Borderline:** 4lrp "unknown"/substitution re-derivation (person reading code, but becomes brief constraint a worker then satisfies); backlog net-zero count (mechanised `bd`/scripts but interpreted by person); 38-branches-0-merged (command output read by person). For unattended-desk ratio: in this chunk persons still catch roughly twice what mechanisms catch, and two mechanism catches (reviewers) were themselves graded by withheld person findings — the loop's safety currently rests on suspicion, not gates.

## 9. WHAT I COULD NOT TELL FROM THIS CHUNK

- 4lrp sealed verdict: reviewer running at 13:33:22; does it independently find the held-back `"null"` regression, and is a revision round ordered?
- 4i2 merge: held for `publish:true` Desk job + chain exit; does window run six gates green, and does yjb5 directive get written on merge as planned?
- Do the 10 directives convert (Desk ~70 min/job ≈ 10 hr runway) or stall on breaker/vqbo empty-diff, and does the cheap experiment (o9d/f7l/88x/226f bodies) actually shorten jobs?
- Maintainer rulings left open: serial-scope, memory triage, OpenRouter 18+, vqbo cheap-first vs now vs never, 226f three-way (unbind vs decline vs feed→cited+version).
- Scout: run directly on `codex-gpt-luna` max between chains as ordered, or starved again by directives (bfn0)?
- Residuals: pid 38088 (~16 hr leftover) wedged or alive; `fleet5/4lrp` worktree/brief state at cutoff; `d1ki`, `mhsf`, `4vjb`, `bfn0`, `xrsg`, `yjb5` dispositions — all filed/open here, outcomes in later chunks.
- Pre-chunk context for cited history (gates rounds, census arithmetic, HOLD.md 07:19Z, live-site revert, 22s self-close, `regex::Escape` double-escape) and post-chunk fate of every claim marked stands/handed-over here.

