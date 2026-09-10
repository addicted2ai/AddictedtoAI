# VERIFY OR REFUTE: an independent audit of a code review

You are a flagship model being asked to do one thing well: take a set of review findings about a batch of merges in the repository `D:/AddictedtoAI`, and for each one, **establish from the files themselves whether it is true, false, or partly true** — then say what the reviewers missed. You are not being asked to redo the review, fix anything, or improve anything. You are the check on the checkers.

Be adversarial in both directions. The merged work was done by an autonomous agent under time pressure and may have real defects; the review of it was done by six smaller models working in parallel and may contain errors, overreach, or claims that sound precise and are not. Neither side gets the benefit of the doubt. A finding is confirmed when you have read the cited lines and they say what the finding says; it is refuted when you can quote the lines that contradict it. Your opinion without a quote is worth nothing here, and you should treat the reviewers' opinions the same way.

---

## 1. The setting

`D:/AddictedtoAI` is a Next.js static-export site that an autonomous AI loop (the "Desk", under `loop/`) builds and maintains. It runs on Windows. Git Bash and PowerShell are both available. The repository has a written specification system under `openspec/` and an issue tracker called beads (`bd`), whose data lives in `.beads/issues.jsonl`.

The project keeps a long document, `wisdom/README.md` (~2,600 lines), whose §7 is a numbered catalogue of defect classes learned from real failures of its own verification, and whose §8 is a plan to convert those classes into working mechanisms — guards, tripwires, tests — before the next stage of a larger change begins. That conversion is called "the wisdom work". On 2026-09-10 between 09:27 and 14:26 local (Mountain Daylight Time, UTC−6), a session named **A2AI-Spark** (Muse Spark 1.3 running on opencode-go, with the board at `D:/addictedtoai-coord/A2AI-Spark.md`) took over from two ending Claude sessions and merged the remaining wisdom items plus two Stage 0 tasks: **39 commits, `72bc5cb..1334b9b` on `main`, pushed in five gated pushes, and the site deployed from `1334b9b` at 20:26:45Z.**

`HEAD` and `origin/main` are both `1334b9b53f9a6f7f2c0632489f192cdff0783da1`. The working tree carries pre-existing dirt that is NOT part of this review: eleven ` D .agents/skills/...` deletions and `?? .agents/unused_skills/` (the maintainer's own), and ` M data/launch.json` (finding P1-6 below).

The 42 files in the range:

```
M  AGENTS.md
M  data/README.md
M  loop/lib/brief.mjs                    (2b: imperative reconciliation; 3a: required-text tripwire)
M  loop/lib/ledger.mjs                   (5: optional lineage passthrough)
A  loop/lib/lineage.mjs                  (5)
M  loop/lib/review.mjs                   (5: corroboration section in the review brief)
M  loop/run.mjs                          (5: job.lineage threading)
A  loop/tests/brief-reconcile.test.mjs   (2b)
A  loop/tests/brief-required.test.mjs    (3a)
A  loop/tests/lib-mutate.mjs             (gate repair 88d4144: cross-file mutation lock)
A  loop/tests/lineage.test.mjs           (5)
A  openspec/changes/two-desks-work-orders-and-trains/evidence/reviews/{stage0-deferrals,wisdom-2b,wisdom-3a,wisdom-3b,wisdom-5,wisdom-6}/round*-{BRIEF,RESULT,REVIEW}.md
A  openspec/changes/two-desks-work-orders-and-trains/evidence/wisdom-5-6/03e2207-banked.md
M  openspec/changes/two-desks-work-orders-and-trains/tasks.md   (ticks 16, 17)
A  scripts/brief-closure.mjs             (3b)
A  scripts/brief-closure.test.mjs        (3b)
A  scripts/figure-provenance.test.mjs    (6)
A  scripts/lint-deferrals.mjs            (Stage 0 tasks 16/17)
M  scripts/no-change-dir-refs.test.mjs   (gate repair 03d1f87: allow-list entry)
A  scripts/tests/lint-deferrals.test.mjs (16/17)
A  scripts/tests/truncation-shape.test.mjs (2b)
M  wisdom/briefs/item2b-round1-BRIEF.md
A  wisdom/briefs/item{3a-round1,3b-round2,5-round1,6-round1}-BRIEF.md
```

The commits, oldest first (`git -C D:/AddictedtoAI log --format='%h %ad %s' --date=format:'%H:%M' 72bc5cb..HEAD` gives the same list with subjects):

```
130852a 09:33  two-desks stage0 16/17: deferral reporter and its test
358e00d 09:34  two-desks stage0 16/17: merge
9aaf6fe 09:34  two-desks stage0 16/17: evidence and task ticks
696a9c1 09:36  wisdom 2b: re-pin brief authority to current HEAD
183abd7 09:47  wisdom 2b: brief revise fixes
59f9fe0 10:03  wisdom 2b: reconcile brief against every imperative, refuse before write; truncation sweep
afaf194 10:03  wisdom 2b: merge
b435bb7 10:03  wisdom 2b: evidence
f1e75c2 10:12  wisdom 2b: drop send-to-remote verb from COMMAND_VERBS        <- push 1 (16/17 + 2b)
b5308d1 10:42  wisdom 3a: brief
44ee775 11:02  wisdom 3a: required-text completeness tripwire + tests
6302dd5 11:07  wisdom 3a: amend brief arm-3 to detected-reported-unwired (measured 35-red)
0452a2c 11:11  wisdom 3a: header comment matches amended brief
224e31f 11:11  wisdom 3a: merge
e9598e1 11:12  wisdom 3a: evidence
88d4144 11:23  gate red repair: serialize same-file brief.mjs mutations (lib-mutate.mjs lock)   <- push 2
cbefe2b 11:49  wisdom 3b: brief
798ec4c 11:56  wisdom 3b: revise brief per second-model review
539d014 11:56  wisdom 3b: lint-green fixes
3da67cf 11:48  wisdom 5/6 unblocked: bank the 03e2207 wild control
8ab6b43 12:13  wisdom item3 round2: brief Files-list closure instrument
5bb179f 12:30  wisdom 3b: location-independent test paths
bcbe26e 12:37  wisdom 3b: merge
9ceb5ae 12:38  wisdom 3b: evidence
03d1f87 12:48  gate red repair: allow-list the closure test's banked-evidence reads               <- push 3
da1b72e 13:04  wisdom 5: brief
7f38724 13:07  wisdom 5: revise brief
ba7b801 13:07  wisdom 5: lint
e0d7839 13:17  wisdom 5 round 1: measurement lineage plus corroboration question
bdf0c56 13:22  wisdom 5: merge
3f6914f 13:23  wisdom 5: evidence                                                                 <- push 4
73c7520 13:37  wisdom 6: brief
6560a98 13:39  wisdom 6: second-model wording fixes
b05a903 13:54  wisdom 6 round 1: figure provenance test with live sweep (13/14)
b2abfaa 13:59  wisdom 6: brief defects D1-D3 fixed + live restatements S1-S4 sourced
a777067 14:01  wisdom 6 revision: exact-text exemption for FULL-MEM-LOG.md:3440 (S5)
3936ae8 14:11  wisdom 6 revision 2: key-path spans, per-line exemption boundary, residual noted
d319a31 14:15  wisdom 6: merge
1334b9b 14:15  wisdom 6: evidence                                                                 <- push 5
```

Documents you will need, all at `HEAD`:
- `wisdom/README.md` §7 (defect classes) and §8 (the plan; per-item text for 2b at roughly `:276-289`, item 3 at roughly `:298-300`). Grep for headings; do not read it end to end.
- `wisdom/HANDOFF.md` — the pre-merge handover written by the previous session. Its §3 table (`:149-153`), §4 and §5 describe the state BEFORE these 39 commits.
- `wisdom/HANDOFF-orch.md` — the other previous session's half: the gate harness, the ratchet, the pre-push checks, and §5 (a finding called `6dpj` about `data/launch.json` moving between gate runs).
- `wisdom/HANDOVER-PROMPT.md` — the prompt A2AI-Spark was started with.
- `D:/addictedtoai-coord/A2AI-Spark.md` — the successor's own board (76 lines).
- `FULL-MEM-LOG.md` at the repository root — the full text behind the project's memory index. Line `:1782` and `:1767-1775` are cited below.
- `CLAUDE.md` — the working and verification rules.
- The evidence directory named in the file list, and `wisdom/briefs/`.
- `.beads/issues.jsonl` — the issue tracker's data. `bd show <id>` also works; never pipe it into a shortener (see rules).

---

## 1a. A brief history of the wisdom work — why it exists and how it was completed

**The larger change.** `two-desks-work-orders-and-trains` (beads epic `addictedtoai-douz`) redesigns the Desk for throughput: batch coherent work orders, route content and machinery to two desks, run the full gates once per release train, let ledger evidence rather than habit set runner effort and concurrency. Its Stage 0 was implemented across 2026-09-08 to 2026-09-10 as gated packets (A through F, C1/C2, W2, the lease rounds) by two Claude sessions — an architect (`A2AI-Fable-Arch`, briefs, worktrees, workers, reviewers) and an orchestrator (`A2AI-Orch`, gates, remote, push, ratchet, reserved files) — with implementation dispatched to external runners: codex Luna at max effort, then, from the maintainer's routing of 2026-09-09 23:28, Muse Spark 1.3 at `xhigh` on `opencode-go`, which spends no Anthropic quota.

**Why the wisdom work exists.** During those packets the repository's own verification kept failing in patterned ways, and each failure cost a round: briefs written from `bd show <id> | head -N` that lost the acceptance section at the bottom; a verifier that passed on a wrong world because it compared two things descending from one computation; a fixer that reinstalled the bug it had been superseded for; mutation tests that corrupted a shared checkout; five green runs read as proof an intermittent was gone; a sha treated as a summary of a tree; a cleanup step that deleted the evidence; a `false` toggle whose reason lived only in a session. The architect audited the session timelines (`wisdom/timeline-notes/`, eight files) and wrote `wisdom/README.md`: §7 names about twenty-five defect classes (7a–7y), each with a measured instance and a line-number citation into the timeline notes; §8 orders them into a plan that turns each class into a mechanism — a guard, a tripwire, a test that can go red.

**The maintainer's instruction** was that the analysis becomes working mechanism **before Stage 1 begins** — not a document. The first thing built was a host, because two of the four hosts the analysis named did not exist in the repository (`scripts/brief-lint.mjs` and its suite; "Phase 0").

**What was done before the handover** (the two Claude sessions, ending the morning of 2026-09-10): Phase 0 (the brief linter and its suite); item 1, the negative-control contract (a machinery change is proved only by an instrument that can go red; raised the linter's suite 80→95, `b7c6b1f`, with the wild control firing on the packet's own brief); item 2a, the output-shortener guard (`c4abfe5`, live as a `PreToolUse` hook in `.claude/settings.json`, 20 tests, three mutations red). Items 4 (build-record writer and immutable gate evidence) and 7 were struck as already shipped by Stage 0 tasks. Item 2b was briefed, peer-reviewed and lint-green in a ready worktree but not dispatched. Stage 0 tasks 16/17 (a deferral reporter) were implemented by Muse in a worktree but not verified or merged.

**Why there was a handover.** The account's seven-day Anthropic rate window reached 95% with three days to the reset. The maintainer had the sessions consolidate everything into a handover packet — `wisdom/HANDOFF.md`, `wisdom/HANDOFF-orch.md`, `wisdom/HANDOVER-PROMPT.md`, the rescued instruments under `wisdom/tools/`, the timeline notes and the in-flight briefs — gated, pushed at `72bc5cb`, and handed the remainder to a harness that spends no Anthropic quota.

**How the successor completed it** (09:27–14:26 the same day). `A2AI-Spark` — Muse Spark 1.3 on `opencode-go`, running as both orchestrator and architect with no peer session alive — took the four remaining items in the plan's order plus the unverified 16/17, one round each: write the brief quoting the authority verbatim → second-model review of the brief (revise until dispatch) → lint → implement in a dedicated worktree → the author's `RESULT` → a sealed `REVIEW` (approve, or revise then approve) → merge → commit the brief, result and review under `openspec/changes/two-desks-work-orders-and-trains/evidence/reviews/<item>/` → the six gates → push → verify the deploy from the live `status.json` → tear down the worktree → close the bead. Two first-run gate reds were repaired on the way (`88d4144`, a lock for two tests that mutate the same file; `03d1f87`, an allow-list entry in a guard that fired on the new test's evidence reads). The test ratchet was reported climbing 2000→2024→2033→2041→2051→2066 across the five pushes. The successor's board says the wisdom conversion is complete and that the only remaining Stage 0 task (31, twenty post-change Desk jobs) is an accrual condition no single session can finish.

**The standard every round was held to**, from the handover: verify with an instrument that can go red, and mutate then restore byte-identical; take counts from outside the run, because a report's "39/39" is the author's arithmetic; when something is unexplained, write that it is unexplained rather than the most plausible story; and remember that a check is usually narrower than the property it is named for, and the remedy for a defect routinely commits the same defect. The findings below are, in large part, that last sentence applied to the mechanisms that were built to enforce it.

---

## 2. Rules — every one of these has cost a real run here, and they bind you too

1. **Read-only.** Do not edit, create, delete, move or rename any file under `D:/AddictedtoAI`, `D:/addictedtoai-coord` or `D:/addictedtoai-worktrees`. No `git add/commit/checkout/stash/reset/clean/worktree/branch`. No `bd create/update/close/remember`, and never `bd edit` (it opens an editor and hangs). If you want to write notes, write them under your own scratch directory outside those three trees.
2. **Do not run `npm test`, `npm run build`, or any `scripts/verify-*.mjs` or `measure-payload.mjs`.** They take a machine-wide build lock, some take ten minutes, and two of them rewrite `data/launch.json`. Do not run two builds concurrently ever.
3. **Do not run `node --test` on any of the new test files in the main tree.** Three of them overwrite a tracked source file in place and restore it in `try/finally` — that is finding P0-1 below, and running them is not how you verify it. If you decide a run is necessary, copy the repository to a disposable directory outside the three trees first (`git -C D:/AddictedtoAI worktree add` is forbidden; use `git clone D:/AddictedtoAI <scratch>` — a local clone is cheap), run there, and say in your report that you did.
4. **Never write the two-letter directory-changing shell token** anywhere — in a command, a comment, a function name, or prose you intend to paste into a shell. A `PreToolUse` hook in this repository's Claude Code configuration refuses any call containing it. Use `git -C D:/AddictedtoAI …`, `npm --prefix …`, and absolute paths. (If you are not running inside Claude Code the hook will not fire, and the rule still stands: it is in `CLAUDE.md`.)
5. **Never pipe an enumerating or counting command into `head`, `tail`, `more` or `Select-Object -First`.** A second hook refuses it (`scripts/output-shortener-guard.mjs`, merged the same morning). Truncated output is indistinguishable from complete output: `bd show` keeps the acceptance section at the BOTTOM, and four briefs were written from `bd show <id> | head -N` and shipped missing requirements. Read whole results; if a result is large, redirect it to a file in your scratch directory and read that. If a read is deliberately partial, put the literal comment `# non-exhaustive` in the command — the hook allows it and the disclosure is the point.
6. **Never manipulate or print credentials**, including partial tokens. An auth failure is a finding, not an obstacle.
7. **Read the clock as its own command** (`date` or `Get-Date`) whenever you write a time; never infer it. Every date in this repository is the LOCAL date of this machine (MDT, UTC−6), never UTC. Finding P1-7 is about exactly this.
8. **Prefer dedicated file tools** (Read/Grep/Glob or their equivalents) over `cat`/`sed -i`/`grep -r` in a shell where you have the choice. `node -e` is blocked in Claude Code; write a `.mjs` in your scratch directory if you need a script.
9. **If a tool call is blocked, report it and rewrite it.** Never route around a denial, and never edit a permission or settings file to clear your own path.
10. **Rate limits.** If you are running on the maintainer's Anthropic account, your own usage is readable at `C:/Users/BadBitch/.claude/usage/<your-session-id>.json` (UTF-8 with BOM). At the time this prompt was written the seven-day window was at 95% used, resetting Sunday 2026-09-13 16:00 local. Read it before you start. Do not open with a broad survey of the 2,600-line documents; go to the cited lines.

---

## 3. How to verify each kind of claim

The findings below make a small number of claim types. Use the matching method, and show the command and the result for each verdict.

| Claim type | Method |
|---|---|
| "X is called nowhere in production" / "zero production callers" / "hand-run only" | `grep -rn "<exported name>" D:/AddictedtoAI/loop D:/AddictedtoAI/scripts D:/AddictedtoAI/lib D:/AddictedtoAI/pulse --include=*.mjs` and list EVERY hit, classifying each as definition / test / live call. A hit in a `.test.mjs` or under `tests/` is not production. |
| "The deferral is recorded nowhere" | grep `.beads/issues.jsonl` AND the evidence directory AND `wisdom/README.md` for the subject words (e.g. `contradict`, `polarity`, `brief-closure`, `job.lineage`, `selector`). Report every hit. A hit inside a RESULT/REVIEW/BRIEF file counts as "recorded in finished evidence", which is what the finding says is insufficient — say which kind of hit you found. |
| "File:line says …" | Open exactly that line range (`sed -n 'A,Bp' <abs path>` is fine) and quote it. If the line numbers have drifted, find the text and give the real lines. |
| "Rule R exists at FULL-MEM-LOG.md:N / CLAUDE.md" | Open it and quote the rule. Then say whether the code actually violates the rule as written, not as paraphrased. |
| "Commit S did X" | `git -C D:/AddictedtoAI show S -- <path>` and quote the hunk. For "S was before/after T", `git -C D:/AddictedtoAI log --format='%h %ci %s' -1 S` for each. |
| "Count is N" | `grep -c "^test(" <file>` (leading-anchor to exclude `.test(regex)` calls) and compare with the RESULT file's claim. |
| "No evidence exists for the gate runs" | Look for a directory or file that records the six gate exit codes for each pushed sha — the previous convention is `openspec/changes/two-desks-work-orders-and-trains/evidence/gate-run-<date>-<sha>/summary.txt`. Also search for `orch-gate-runs` under `%TEMP%`, `/tmp`, `D:/addictedtoai-coord`, and read `wisdom/tools/orch/README.md` for where the harness writes. If you find a record the reviewers missed, that refutes the finding — quote it. |
| "The board timestamp is wrong" | Decode the `HH:MM:SSZ` in the same board line to local (subtract 6 h), compare to the entry's stamp, and cross-check against `git -C D:/AddictedtoAI log --format='%h %ci' -1 <sha>` for the cited commit. |
| "The tree/launch.json is in state S" | `git -C D:/AddictedtoAI status --porcelain` and `git -C D:/AddictedtoAI diff -- data/launch.json`, read whole. |
| "A test restores the file byte-identical on the happy path" | Do not run it in the main tree (rule 3). Either accept the prior serial measurement stated in the finding, or run it in a disposable clone with `git status --porcelain` before and after, and say which you did. |

For every verdict, the evidence column must contain something you produced in this run. A verdict whose evidence is a restatement of the finding is not a verdict.

---

## 4. The findings

Each finding carries: the claim; the evidence the reviewers cited; which of the six sealed reviewers found it (A1 = Stage 0 16/17 and 2b; A2 = 3a/3b and the two gate repairs; A3 = items 5 and 6; A4 = documents, tasks, beads; A5 = gate protocol and serial test re-runs; A6 = an adversarial code-only pass over the seven new instruments, which read no evidence, briefs or boards); and what it would take to refute it. Where the coordinating session already checked or corrected something, it says `[ARCH: …]` — verify those lines too; they are not exempt.

### P0-1. Tests overwrite the live dispatch module in place. (A1, A2; happy-path restore measured by A5)

**Claim.** `loop/tests/brief-reconcile.test.mjs:55` resolves `BRIEF_LIB` to the tracked `D:/AddictedtoAI/loop/lib/brief.mjs`. Arms at `:167` (`writeFileSync(BRIEF_LIB, dropped, 'utf8')`, restored at `:176`) and `:249/:265` overwrite that file on disk, run a probe, and restore it in a `try/finally`. `loop/tests/brief-required.test.mjs` mutations A (`:205-234`) and B (`:236-302`) do the same to the same file. `scripts/tests/lint-deferrals.test.mjs` does the same to `scripts/lint-deferrals.mjs` at `:342/351`, `:370/378`, `:397/405`. `loop/run.mjs:28` imports `brief.mjs` for every job the Desk dispatches. A `finally` block does not run on SIGKILL, an OOM kill, or the test runner's hard timeout, so a kill inside the write→restore window leaves the tracked source corrupted in the working tree, and the next unattended `node loop/run.mjs` imports it. `FULL-MEM-LOG.md:1782` states: "NEVER MUTATE A FILE IN THE SHARED CHECKOUT AT ALL. A git worktree is the right tool and this repository already uses them for exactly this reason," written after a measured incident on 2026-08-31 (`:1767-1775`) in which an agent committed during someone else's mutation window and shipped a broken line with every test green and `git status` clean. Commit `88d4144` added `loop/tests/lib-mutate.mjs`, a cross-process `mkdir` lock with a 120-second stale reclaim, because two of these test files raced over the same file under `node --test`'s parallel workers (gate red 2032/2033). The lock fixes the race between two mutators; it does not change the fact that the mutation is of the shared checkout, and only the lock directory has a stale reclaim — the mutated file has none. A5 ran all eight new test files serially in the main tree and found the tree byte-identical after each, and the lock directory `%TEMP%\atai-brief-lib-mutation-lock` absent before and after — which establishes the happy path only.

**To refute** you would need to show either that the tests write to a copy rather than the tracked path (quote the path resolution), or that there is a restore mechanism that survives a process kill (a `process.on('exit')` does not survive SIGKILL either — say what would), or that `FULL-MEM-LOG.md:1782` does not say what is quoted, or that the rule has been superseded somewhere with authority (quote where).

### P0-2. Item 5's judgment engine has zero production callers. (A3, A6)

**Claim.** `classifyClaim`, `recordMeasurement` and `createLineageStore` in `loop/lib/lineage.mjs:144-354` — the code that decides whether two agreeing measurements are independent or descend from one computation — are called only from `loop/tests/lineage.test.mjs`. `loop/run.mjs:1518-1520` reads: `const jobLineage = job.lineage ?? undefined;` with the comment "No selector sets one today, so this is absent in practice… this changes nothing until a job arrives carrying one." `loop/lib/ledger.mjs:152` adds `if (lineage !== undefined) line.lineage = lineage;` — an optional passthrough that today is always undefined. What DOES reach the live path is `corroborationSection()` (`lineage.mjs:88-96`, or `:118-146` per A3 — reconcile the two), interpolated into every sealed review brief at `loop/lib/review.mjs:440,448` (A3) or `:47,577` (A6) — a static question posed to the reviewer model, with nothing checking the answer. So item 5's mechanism exists, is tested 10/10, and never runs on a real measurement. The brief for item 5 is described by A3 as honest about the reader question being "judgment by design"; the question is whether the plan (`wisdom/README.md` item 5) promised a mechanism or a prompt.

**To refute** you would need a production call site for any of the three functions, or a selector that sets `job.lineage`, or text in `wisdom/README.md` §8 item 5 showing that a prompt-only delivery was the plan.

### P0-3. Item 3a's contradiction refusal was narrowed after the code shipped, and the deferral is filed nowhere. (A2, A6)

**Claim.** `wisdom/README.md` (about `:298-300`) specifies for item 3: "Refuses: dispatch on a brief whose required source text is missing, truncated or contradicted." The item-3a brief at `b5308d1` required all three (arm 3: "must be refused as contradicted"). The implementation `44ee775` (11:02) shipped contradiction as "computed, tested and returned… but deliberately NOT wired" — `loop/lib/brief.mjs:1043-1052` throws on `missing`/`truncated` only, with a comment giving the reason: wiring `contradicted` false-fires on the template's own negating sentences (35 red, measured). The brief was then amended at `6302dd5` (11:07) to "detected-reported-unwired" — after the code, to match what had shipped. `round1-RESULT.md` and `round1-REVIEW.md` (`e9598e1`) defer the polarity question to "round 3b's question… judging polarity needs a review-time reader," but the 3b brief (`wisdom/briefs/item3b-round2-BRIEF.md`) and its instrument (`scripts/brief-closure.mjs`) are entirely about Files-list closure and never mention contradiction or polarity. `grep -n "contradict\|polarity\|review-time reader\|wisdom-3a\|item3a\|unwired" .beads/issues.jsonl` returns nothing. The repository's rule since 2026-09-08 (`CLAUDE.md`, "If you defer something…"): a deferral that names a subject and cannot be fixed in the same job becomes its own issue, otherwise a note on the parent, and a parent with unresolved notes may not be closed. Bead `addictedtoai-8des` (item 3) is closed with no notes. Net: a brief that inverts a required sentence assembles and dispatches today — `loop/tests/brief-required.test.mjs:174-203` (arm 5) pins exactly that behaviour as expected.

**To refute** you would need to show the 35-red measurement makes wiring genuinely impossible rather than deferred (that changes the severity, not the deferral finding), or find the deferral recorded in beads or as a note on `8des`, or show the plan text does not require refusal on contradiction.

### P1-4. Zero deferrals recorded by the successor. (A4, with A2/A3/A6 supplying the deferrals)

**Claim.** A4 grepped `bd list --json` for `2026-09-10` and found 14 beads, all with `created_at` between 03:17Z and 10:55Z — local 21:17 on 2026-09-09 through 04:55 on 2026-09-10, all before A2AI-Spark's 09:27 takeover. The successor created no beads and added no notes to the four it closed (`qvf0`, `8des`, `58pk`, `uv8u`; each close reason names a merge sha that exists). Follow-ups that exist only inside finished evidence files: (a) contradiction wiring (P0-3); (b) `brief-closure.mjs`'s automatic merge-gate wiring, described in `cbefe2b`/`798ec4c` as "owned by the orchestrator" and a "wiring follow-up"; (c) a selector that populates `job.lineage` (P0-2). Beads grep for `brief-closure|automatic merge-gate|false-fire rate` also returned nothing (A2).

**To refute:** find a bead created or annotated during 09:27–14:26 local on 2026-09-10, or a note on any of the four closed beads.

### P1-5. No gate evidence outside the board for any of the five pushes; the ratchet value exists only in prose. (A5)

**Claim.** The previous sessions committed gate evidence per push at `openspec/changes/two-desks-work-orders-and-trains/evidence/gate-run-<date>-<sha>/summary.txt` (present for `0ed3448`, `f74f606`, `08ae8b0`, quoting all six exit codes). No such directory exists for `f1e75c2`, `88d4144`, `03d1f87`, `3f6914f` or `1334b9b`. The board's sentences ("six gates green 2066/2066, ratchet 2051→2066", "launch 15/15, design 46/46, surfaces all, analytics 20/20") are the only record. The tracked ratchet seed `wisdom/tools/orch/baselines/test-count-history.tsv` was committed once at `8823d2d` (before the range) and ends at `2026-09-10 07:00:40  c15e901  1926`; `wisdom/tools/orch/README.md` says the harness appends live state under `$ORCH_RUNS` (default `${TMPDIR:-/tmp}/orch-gate-runs`); A5 searched `%LOCALAPPDATA%/Temp`, `/tmp` and `D:/addictedtoai-coord` and found no such directory. For the two repairs, the board's "16/16 x3 then full green" and "full green" cannot distinguish a full six-gate re-run from a re-run of the failing file. Note the live site does serve `1334b9b` (`https://www.addictedtoai.net/status.json`: `built_at 2026-09-10T20:26:45Z`), so the deploy happened; the finding is about the absence of a durable gate record, not about whether the site is up.

**To refute:** find a run directory, log, or committed file that records the six exit codes for any of the five shas. Check `wisdom/tools/orch/orch-gates-only.sh` for where it writes and whether that location survives. If the harness legitimately writes nowhere durable, say so — that is a finding about the harness, and the board sentence remains a claim.

### P1-6. `data/launch.json` drift: protocol is record-then-revert; the successor did neither, and the drift is larger than the board says. (A5)

**Claim.** `wisdom/HANDOFF-orch.md` §5 (finding `6dpj`): every drift sample is recorded and then reverted; "a revert without the record is an observation with nothing durable to show." The board's `holds:` line says the drift was "left local… uncommitted (measured_on roll + 110.7→110.6, known 6dpj shape)". The actual `git diff -- data/launch.json` shows FOUR numeric moves (home `total_kb_gzipped` 110.7→110.6; catalog `inline_kb_gzipped` 18.8→18.9, `total_kb_gzipped` 123.6→123.7, `html_kb_gzipped` 35.8→35.9) plus three date fields rolled to 2026-09-10. HANDOFF-orch.md describes a 3+-field move as the "sample eight/nine" anomaly, distinct from the two-state case. The file is still dirty (mtime 14:26:18 local). The hysteresis rule inside the file ("retain each prior value unless the raw gzip measurement moves by more than 62 bytes") makes a 0.1 KB move nominally a legitimate advance — but `6dpj` is precisely the finding that the sub-62-byte determinism assumption is broken.

**To refute:** show that HANDOFF-orch.md §5 prescribes something other than record-then-revert, or that the board's description covers the actual diff, or that a record of this sample exists somewhere.

### P1-7. The successor's board timestamps were invented, not read. (A4, A5)

**Claim.** Each board log line pairs a local stamp with a UTC deploy time. Decoding the Z-times at UTC−6 and cross-checking the cited commits' own `%ci`:

| board stamp | sha | commit `%ci` local | deploy Z | deploy local | stamp error |
|---|---|---|---|---|---|
| 10:45 | f1e75c2 | 10:12:55 | 16:32:34Z | 10:32:34 | +13 min |
| 11:40 | 88d4144 | 11:23:41 | 17:34:47Z | 11:34:47 | +6 min |
| 12:05 | 03d1f87 | 12:48:52 | 19:00:55Z | 13:00:55 | −55 min |
| 12:35 | 3f6914f | 13:23:02 | 19:35:23Z | 13:35:23 | −60 min |
| 12:50 | 1334b9b | 14:15:57 | 20:26:45Z | 14:26:45 | −96 min |

The board header `updated: 2026-09-10 12:50` therefore understates the true time of its last event by about 96 minutes. `data/launch.json`'s mtime (14:26:18) corroborates the decoded deploy time. The substance of each entry (shas, merges, bead closures) is correct; the clock is not.

**To refute:** show a different UTC offset applies (it does not — the final commit's `%cI` is `2026-09-10T14:15:57-06:00`), or that the Z-times are wrong rather than the stamps.

### P1-8. The three handover documents now assert a state that no longer exists. (A4)

**Claim.** `wisdom/HANDOFF.md`, `wisdom/HANDOVER-PROMPT.md`, `wisdom/README.md` and `wisdom/tools/README.md` are all unchanged in `72bc5cb..HEAD`. `HANDOFF.md:149-153` (§3 table) says item 2b "BRIEFED, NOT BUILT" and items 3, 5, 6 "NOT STARTED"; all four are merged and their beads closed. `HANDOFF.md:202-206, :227-228` and `HANDOVER-PROMPT.md:48-59` ("first five actions" 3 and 4) send a successor to `D:/addictedtoai-worktrees/stage0-deferrals` and `D:/addictedtoai-worktrees/item2-imperatives`; both directories are gone and the work in them is merged (`tasks.md:982` and `:992` now `[x] 16` / `[x] 17`, "merged 358e00d"). `wisdom/README.md` §8 per-item statuses are unchanged. `wisdom/tools/README.md` does not reference the deleted worktrees (verified OK).

**To refute:** show any of those lines was updated, or that a successor is told elsewhere to disregard them.

### P1-9. Two instruments are hand-run only, and two tripwires skip two of three dispatch paths. (A6, A2)

**Claim.** `scripts/brief-closure.mjs:27-33` describes itself as "reviewer-side, not automatic"; grep across `loop/` finds no caller; nothing in the merge path consumes its output. `scripts/lint-deferrals.mjs` likewise has no automated caller (it is a CLI by the task's design — the finding is that "wired" would mean something invoked it; check task 16/17's text in `tasks.md` around `:982-992` to see whether a CLI was the requirement). The 2b reconciliation and 3a tripwire run inside `assembleBrief` (`loop/lib/brief.mjs:1034`, `:1053-1062`), which `loop/run.mjs:1345` calls for a NEW job and which throws before `.job/brief.md` is written at `:1412`. `assembleRevisionBrief` (`brief.mjs:1096`, called from `run.mjs:753`) and `resumeBrief` (`brief.mjs:1165`, called from `run.mjs:1239`) rebuild their text independently and run neither check; `brief.mjs:726-727` states this as a known limit.

**To refute:** find a live caller of `brief-closure.mjs`, or show the revision/resume paths do run the reconciliation.

### P1-10. `push` was dropped from `COMMAND_VERBS`. (A1)

**Claim.** `f1e75c2` removes `'push', ` from the verb list in `loop/lib/brief.mjs` because a portability/publish guard forbids that literal token inside `loop/`. Consequence: a source imperative such as "Push the branch once gates pass." — unlisted, no modal — is no longer classified as an imperative and its absence from a brief cannot be flagged. The exclusion is documented beside the constant with its reason. The commit message admits "a split-token gaming version existed for one minute and never ran"; A1 searched `git log --all -S` for two guessed split forms and found nothing, which is consistent with "never committed" but not proof.

**To refute:** show `push` imperatives are caught by another route (a modal, a list marker, a different verb), or that the guard does not actually forbid the token so the exclusion was unnecessary.

### P1-11. `scripts/figure-provenance.test.mjs` blind spots. (A3, A6)

**Claim.** (a) The live-sweep test (`'live sweep: every declared figure is sourced where the tree restates it'`, near `:404`) asserts only `deepEqual(violations, [])`; `sweepLiveRestatements()` loops `for (const figure of DECLARED)`, so an empty `DECLARED`, or one whose every `patterns` array is emptied, passes; nothing asserts `DECLARED.length > 0` or a floor on figures/candidates scanned. The RESULT's mutation A emptied ONE figure's patterns and stayed red because the other three fired, so the all-empty case was never exercised. (b) `DECLARED` (`:108-156`) hand-enumerates exactly four `data/config.json` bounds. (c) `sweepFiles` (`:408-414`) excludes `openspec/**`, `wisdom/briefs/**`, `data/**` except `data/README.md`, and every `tests/` directory. (d) `pointerFor` (`:211-214`) accepts a literal `data/config.json` or the key-path string anywhere within a 3-line window, not a pointer about this number. (e) The machinery-ceiling patterns (`:116-118`) require the order machinery→ceiling→N% or N%→machinery→ceiling; "The machinery has a 10% ceiling" places the number between the anchors and matches neither — and that phrasing is the incident class (`addictedtoai-mrld`) the instrument was built for. Verified OK by A3: the S5 exemption is keyed on `file`+`line`+`figure`+`exactLineText` and arm A15 shows a 45%→46% tamper re-fires; the `3936ae8` residual is recorded in the test's comment, RESULT1 §1/§4, and the REVIEW.

**To refute:** for (a) show a floor assertion; for (e) show the pattern set matches that sentence; for (c) show the exclusions are justified in the brief.

### P1-12. `briefCarries` is negation-blind. (A1, A2, A6; disclosed in `round1-REVIEW.md` point 6)

**Claim.** `loop/lib/brief.mjs:806-812`: an imperative is "carried" when ≥50% of its significant tokens appear anywhere in the brief, unordered. "We will NOT record the free-memory figure at the moment of a spawn failure" carries the imperative it negates. Separately, the 3a contradiction detector's `NEGATIONS` list is closed, so "is prohibited from restoring the floor" escapes it. `brief.mjs:702-711` itself calls `briefCarries` "the loosest joint… where its next defect will be."

**To refute:** show polarity handling in `briefCarries` or a broader negation set.

### P2 (verify each in one line)

- **P2-13.** `scripts/brief-closure.test.mjs:20` still hardcodes `const MAIN = 'D:/AddictedtoAI';` after `5bb179f` "location-independent test paths"; `INSTRUMENT`/`WORKTREE` are derived from `import.meta.url`. Nine other tests hardcode the same path. (A2)
- **P2-14.** The "no-id `--strict` fix" in `scripts/lint-deferrals.mjs` is a new stderr line (`if (skippedNoId > 0) process.stderr.write(...)`); the exit line `if (strict && unroutable.length > 0) process.exitCode = 1;` already counted id-less issues. `round1-RESULT.md` says "exit behavior unchanged"; arm 5b (`lint-deferrals.test.mjs:317`) asserts the stderr line and both exit codes. Not overclaimed. (A1)
- **P2-15.** `scripts/tests/truncation-shape.test.mjs` arm 2 shows the `# non-exhaustive` marker admits a peek; the negative case ("a bare comment is not a declaration") lives in the pre-existing `scripts/output-shortener-guard.test.mjs:166`, shared via `findTruncatedEnumeration`. (A1)
- **P2-16.** `scripts/lint-deferrals.mjs` `SUBJECT_RE`/`REQUIREMENT_RE` (`:106-142`) route an issue on any passing path mention; the header admits it at `:94-99`; no floor on issues scanned. (A1, A6)
- **P2-17.** `curl … | head -20` and `OUT=$(git log --oneline); echo "$OUT" | head -5` are invisible to both the hook and the sweep because `ENUMERATORS` is a closed set (`output-shortener-guard.mjs:63-67` says this is deliberate). (A1, A6)
- **P2-18.** `scripts/brief-closure.mjs` `collectPins` (`:193-325`) matches five hardcoded pin shapes; `isProductionFile` (`:103-115`) is a fixed root list; "listed" is checked against path, never content — a listed test file whose diff deletes an assertion prints `CLOSURE OK`. (A2, A6)

### Verified OK by the reviewers — confirm or dispute these too

- **V-1.** 70/70 across the eight test files run serially in the main tree (12, 7, 5, 9, 8, 10, 15, 4), tree byte-identical after each, mutation lock dir absent before and after. (A5) — do not re-run in the main tree; see rule 3.
- **V-2.** Arm counts match every RESULT claim; the board's "16/16" is 7 (2b) + 9 (3a) run together. (A1, A2, A3, A5)
- **V-3.** `03d1f87`'s allow-list entry in `scripts/no-change-dir-refs.test.mjs:44-48` is one file, one change-name, with a reason, and the pre-existing generic arm at `:123-132` ("every allow-list entry has a reason and is still live") goes red when the pattern stops matching. A2 calls this a cause fix, not a detector loosening, because copying the fixture would reintroduce the lossy-copy class item 3 targets. Decide whether you agree.
- **V-4.** `loop/tests/lib-mutate.mjs` is a real cross-process lock (atomic `mkdir`, `EEXIST` loses, 120 s stale reclaim). (A2)
- **V-5.** `openspec/.../evidence/wisdom-5-6/03e2207-banked.md` is accurate: `git cat-file -t 03e2207` fails; `9c272f4` is `HEAD:data/launch.json`'s blob. (A3)
- **V-6.** `AGENTS.md` changed one line (a pointer to `data/config.json` `budget.window_days`); `data/README.md` gained `budget.bounds.*` pointers and a 10%→30% correction matching the live config; no rule text changed. (A3)
- **V-7.** `tasks.md` ticks 16 and 17 cite `358e00d`, which exists; task 31 (`:1888`) untouched; beads `qvf0/8des/58pk/uv8u` closed naming existing shas; `douz` in progress. (A4)
- **V-8.** `wisdom/briefs/item2b-round1-BRIEF.md:3` reads `authority: …@696a9c1`, and that sha exists. `[ARCH: A4 reported that 696a9c1 itself changed the line @113996c→@696a9c1, "self-referential". Measured: 696a9c1 changed it @113996c→@9aaf6fe; 183abd7 (09:47) then changed it to @696a9c1. Confirm.]`
- **V-9.** 2b and 3a ARE live for new-job dispatch (`run.mjs:1345`, throws before `:1412` writes the brief). (A1, A6)
- **V-10.** Task 17's B1/B2 witness split is honoured: B1 red under mutation B (`lint-deferrals.test.mjs:358`), B2 green either way and named not-the-witness (`:388`). (A1)
- **V-11.** Live site serves `1334b9b`, `built_at 2026-09-10T20:26:45Z`, dirty paths only `package-lock.json` and `vercel.json` (the Vercel builder's usual). Main `node_modules` has 177 entries after the successor's worktree teardowns. No `GATE-RUNNING`. (coordinator)

### Environment notes (verify if cheap, otherwise skip)
A `node …/scripts/shell-token-guard.mjs` process started 07:46 on 2026-09-10 is still alive (a hung hook). `claude --resume A2AI-mem-cond` from 2026-09-09 is a live process with a board (`D:/addictedtoai-coord/A2AI-mem-cond.md`) stale since 13:47 that day. `opencode serve --port 4096` is alive.

### Known errors in the coordinator's own review briefs
The reviewers were told "`loop/run.mjs` (8 added lines)" belonged to 2b; it belongs to wisdom 5 (`e0d7839`). The reviewers were told to expect "16/16" for 3a; that was the board's combined figure for two files. Neither error propagated into a finding, but if you see a trace of either in the findings above, say so.

---

## 5. What the six reviewers could not see — look here for missed findings

The six were sonnet-class models with bounded scopes and no test execution (one exception, serial). Places their seats did not reach:

- **Cross-item interaction.** Do the 2b reconciliation and the 3a tripwire agree on what an "imperative" and a "required sentence" are, or can a sentence be an imperative to one and required text to the other with different outcomes? Both live in `loop/lib/brief.mjs`.
- **The gate itself.** `scripts/run-tests.mjs` collects every `*.test.mjs`. Do the new tests' in-place mutations interact with any OTHER test that imports `loop/lib/brief.mjs` or `scripts/lint-deferrals.mjs` while the mutation is live? The lock only serializes files that opt into `lib-mutate.mjs`. List every test file that imports either module and does not take the lock.
- **The sweep's own file list.** `figure-provenance.test.mjs`'s `sweepFiles` — walk it and say what the sweep actually covers today, by count.
- **`no-change-dir-refs.test.mjs`'s generic liveness arm** (`:123-132`): read it and confirm it would go red on the day the change is archived and the allow-listed path moves to `openspec/changes/archive/…`.
- **The successor's board vs the evidence files.** The board says "sealed revise → delta → delta-approve" for item 6 and "sealed approve 15/15" for item 5. Are those REVIEW files actually sealed (written before the author's RESULT was visible to the reviewer)? The files may say; the commit order (`git log` times) is the only independent signal.
- **Anything in the 39 commits the six did not name.** `3da67cf`, `ba7b801`, `539d014`, `0452a2c` were mentioned only in passing.

---

## 6. What to produce

Your final message is the deliverable. Use exactly this shape and nothing else — no preamble, no restating of the findings.

```
# VERIFICATION — <model, effort> — <local date/time read from the clock>

## Per-finding verdicts
| id | verdict | evidence produced in this run (command → file:line + quote) | note |
| P0-1 | CONFIRMED / DISPUTED / PARTIAL / UNDETERMINED | … | … |
| P0-2 | … |
… one row for every id P0-1 … P2-18 and V-1 … V-11, in order …

## Severity re-ranking
For each P0: do you agree it is P0 (lets a wrong world through, corrupts the tree, or ships a false claim)? If not, what and why. One line each.

## Findings the six missed
- file:line — one sentence — why it is material. Only defects, unwired instruments, unrecorded deferrals, or false claims in a record. Nothing stylistic.

## Disputes, argued
For every DISPUTED or PARTIAL row: the contradicting evidence, quoted, in two to six sentences.

## What I could not check and why

REVIEW-VERDICT: <n> confirmed, <m> disputed, <k> partial, <j> undetermined; <x> missed findings
```

Verdict meanings: **CONFIRMED** — you read the cited lines and the claim is true as stated. **DISPUTED** — the cited lines do not support it, or other lines contradict it; quote them. **PARTIAL** — the core is true, a stated detail is wrong; say which detail. **UNDETERMINED** — could not check within the rules; say what you would need.

Do not soften a dispute to be polite and do not confirm to be quick. The people reading this will act on it: a confirmed P0 gets fixed before the next stage begins, a disputed one gets dropped. Both cost something if you are wrong.

Report to the maintainer only through this document. He does not read progress updates.
