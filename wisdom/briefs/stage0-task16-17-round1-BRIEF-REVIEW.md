# BRIEF REVIEW — arch-task16-17-brief.md — VERDICT: REVISE

## Findings
1. Check 1 — dropped paragraph from quoted standard. Brief quotes task 17 ending at `Tests task 16.` EVIDENCE: `git -C D:/AddictedtoAI show ad0a545:openspec/changes/two-desks-work-orders-and-trains/tasks.md | Select-String -Pattern "17\. .scripts.tests.lint-deferrals" -Context 0,30` printed the task continuing 12 more lines starting `**MUTATION B'S CHECK IS RED AT BASELINE AS WRITTEN, measured at c15e901,` through `Split the assertion: **B1**... **B2**... Do not repair this by loosening a check until it passes, and do not repair it by editing scripts/verify-issue-links.mjs.` Those lines are normative and contain the authority's own B1/B2 split and `specs/loop/spec.md:1688` citation, which the brief re-states in prose without the citation. Smallest change: extend the task-17 `>` block through `...editing scripts/verify-issue-links.mjs.`
2. Check 4/5 — false premise about consumers' fields. Brief says `The two existing consumers read title, description, notes, design, acceptance and context`. EVIDENCE: read `openspec/changes/two-desks-work-orders-and-trains/evidence/scripts/machinery-share.mjs:8-9` reads those six fields; read `.../evidence/scripts/open-by-day.mjs:1-11` reads only `status` lower-cased vs `closed` and `created_at/created`, no title/description/notes/design/acceptance/context. Both strip BOM at line 6 and assume top level. Smallest change: say machinery-share reads those six text fields while open-by-day reads status/created, and both strip BOM and assume an array.
3. Check 5/8 — B2 scope ambiguous and contradicts stated green baseline on one natural reading. Brief says `Nothing under lib/ and no step registered in the prebuild's STEPS array imports or spawns the tracker. Measured green at baseline`. EVIDENCE: `grep child_process|execFileSync|spawnSync in D:/addictedtoai-worktrees/stage0-deferrals/lib` found `lib/stamp.mjs:32 imports node:child_process` and `lib/stamp.mjs:58,71,111 spawns git`, plus `lib/facts.test.mjs:12, stamp.test.mjs:23` import it; `grep tracker/bd under lib/` found only gtag/beads-id mentions, no `bd` spawn — so tracker-specific B2 is green but generic child_process B2 is red. Smallest change: add one sentence that B2 forbids invoking `bd` (bd binary/entrypoint/BD_BIN), not git plumbing, so `lib/stamp.mjs` git spawns are out of scope.

## Checked and sound
- Check 2 closure: `grep lint-deferrals in D:/addictedtoai-worktrees/stage0-deferrals` found only tasks.md/design.md/evidence docs, no code pins; new standalone files turn no existing file red.
- Check 3 quantifiers: `every open` resolved as status lower-cased vs closed, `only under --strict` resolved as exit-code-only same-rows, `exactly one module` tied to task 69 `loop/lib/beads.mjs` via `Select-String Pattern 69\.|Stage 3`.
- Check 4 lines: `verify-issue-links.mjs:128 execFileSync` spawn and `96-102` spawn-shape header confirmed via `Select-Object LineNumber, Line` and `Select-Object -Skip 89 -First 20`; `loop/lib/beads.mjs` absent via `ls-files` empty; task 69 is `loop/lib/beads.mjs` Stage 3; `c15e901` exists via `log --oneline -1`.
- Check 6 instruments: shape refs exist and behave as claimed except finding 2; `brief-lint.mjs:25-29` LIMIT convention exists; required arms are new arms worker writes, explicitly stated.
- Check 7 mutations: A realisable and red, B1 realisable and red, B2 stays green under B because `scripts/` outside `lib/`/STEPS — verified via `ls-files scripts/tests/ lib/build-content.mjs`.
- Check 9 report: numbered `RESULT1.md`, sections in order, blocked-call/unfixed-finding instruction present.
- Check 10 ground rules: token prohibition, absolute-path plus `git -C`, no `npm test`/partial-total warning, read-only Files list, blocked-call rule present.

## What I ran
- `git -C D:/AddictedtoAI show ad0a545:openspec/changes/two-desks-work-orders-and-trains/tasks.md | Select-String -Pattern "^\s*-\s*\[\s*\]\s*16\.|^\s*-\s*\[\s*\]\s*17\." -Context 12,14`
- `git -C D:/AddictedtoAI show ad0a545:openspec/changes/two-desks-work-orders-and-trains/tasks.md | Select-String -Pattern "Split the assertion" -Context 8,8`
- `git -C D:/AddictedtoAI show ad0a545:openspec/changes/two-desks-work-orders-and-trains/tasks.md | rg -n "^\s*- \[ \] 1[67]\." -A 30` — failed, rg not recognized
- `git -C D:/AddictedtoAI show ad0a545:openspec/changes/two-desks-work-orders-and-trains/tasks.md | Select-String -Pattern "17\. .scripts.tests.lint-deferrals" -Context 0,30`
- `git -C D:/AddictedtoAI show ad0a545:openspec/changes/two-desks-work-orders-and-trains/tasks.md | Select-String -Pattern "16\. .scripts.lint-deferrals" -Context 0,20`
- `git -C D:/addictedtoai-worktrees/stage0-deferrals ls-files loop/lib/beads.mjs scripts/lint-deferrals.mjs scripts/tests/lint-deferrals.test.mjs; echo ---; git -C D:/AddictedtoAI show ad0a545:scripts/verify-issue-links.mjs | Select-String -Pattern "child_process|spawn|SKIP existence" | Select-Object -First 10`
- `git -C D:/AddictedtoAI show ad0a545:scripts/verify-issue-links.mjs | Select-String -Pattern "child_process|execFileSync|SKIP existence" -CaseSensitive:$false | ForEach-Object ...` — failed ParserError
- `git -C D:/AddictedtoAI show ad0a545:scripts/verify-issue-links.mjs | Select-String -Pattern "execFileSync|SKIP existence"`
- `git -C D:/AddictedtoAI show ad0a545:scripts/verify-issue-links.mjs | Select-String -Pattern "execFileSync|SKIP existence" | Select-Object LineNumber, Line`
- `git -C D:/AddictedtoAI show ad0a545:scripts/verify-issue-links.mjs | Select-Object -Skip 89 -First 20`
- `git -C D:/AddictedtoAI show ad0a545:openspec/changes/two-desks-work-orders-and-trains/tasks.md | Select-String -Pattern "69\.|Stage 3" | Select-Object -First 10`
- `git -C D:/AddictedtoAI cat-file -e c15e901^{commit} | Select-Object -First 5; git -C D:/AddictedtoAI log --oneline -1 c15e901` — first half parse error, second printed commit
- `git -C D:/addictedtoai-worktrees/stage0-deferrals ls-files scripts/tests/ lib/build-content.mjs lib/site-assets.mjs | Select-Object -First 20`
- Reads/greps (not counted as commands): machinery-share.mjs, open-by-day.mjs, brief-lint.mjs:1-80, prebuild.mjs:1-159, verify-issue-links.mjs:120-169, change specs/loop/spec.md:1675-1704, globs for machinery-share/open-by-day/spec.md, greps for child_process under lib/ and scripts/, lint-deferrals refs, tmpdir/mkdtemp convention.

## Out of scope, not pursued
- none

