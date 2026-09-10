# TEXT REVIEW — arch-specfix-brief-r1.md — VERDICT: REVISE

## Findings

**1. The pinned lane-line expectation contradicts the mandated reserving sentence. (High)**
Exact claims quoted: "Expected after your edit: **10 lines**." and "Then add ONE sentence to that requirement reserving the word: `lane` is the provider set, `desk` is the work partition, and the two are never interchangeable."
Evidence — the baseline counts hold, and the four removals are four distinct lines:
`Select-String -Pattern lane (loop delta)` returned 14 lines (925, 927, 943, 950, 1034, 1153, 1394, 1415, 2012, 2014, 2018, 2025, 2055, 2060); `(... | ForEach-Object { $_.Matches.Count } | Measure-Object -Sum)` returned 15; reads of :925–:950 confirmed all four quoted desk-sense texts land exactly. Arithmetic: 14 − 4 removed + 1 added sentence containing "`lane`" = **11** counted lines, never 10, under the brief's own `grep -c lane` method. Any sentence satisfying the gloss contains the substring `lane` and re-adds a counted line; appending it to an already-counted line still leaves 11.
Severity: high — the worker must either omit a mandated sentence to hit 10 or hit 11 and file a forced "omission" under the RESULT honesty clause.
Fix in one sentence: Change the expectation to 11 lines (14 − 4 + 1 for the reserving sentence), or specify exactly how the reserving sentence avoids adding a counted line.

**2. The verify step orders a worktree-targeted validation that its own ground rules make unexecutable. (High)**
Exact claims quoted: "Run, by absolute path, against your worktree: `openspec validate two-desks-work-orders-and-trains --type change --strict --no-interactive`" and "**Never `cd`.**"
Evidence — the command has no path parameter to aim at the worktree: `openspec validate --help` shows `Usage: openspec validate [options] [item-name]` with only `--type/--strict/--no-interactive/--store`, no cwd/path operand; `Test-Path D:/addictedtoai-worktrees/fleet6-specfix` is True (a separate tree from `D:/AddictedtoAI`), and the brief itself makes validating the wrong tree load-bearing ("a green that means something other than what it says is worse than a red"). With `cd` forbidden and no `--store` registration given, there is no documented way to run the stated bare command "against" the worktree.
Severity: high — the most likely outcome is a worker running the bare command from the harness default cwd, validating the main tree (or failing), and reporting a green that means the wrong thing.
Fix in one sentence: Give the exact worktree-targeting invocation (registered `--store` id or the single approved directory mechanism for this one command) instead of a bare command plus a `cd` ban.

**3. The verify commands assume a Unix shell on a win32/pwsh machine. (Medium)**
Exact claims quoted: "`grep -c lane <worktree>/openspec/changes/...`" and "`grep -o lane <worktree>/openspec/changes/... | wc -l`".
Evidence: tool environment is `OS: win32, Shell: pwsh`; `grep -o … | wc -l` and `<worktree>/…` input-redirection are not pwsh, while the brief's own ground rules say "Prefer file tools over shell equivalents … They handle Windows paths". (I verified the counts with `Select-String`/`Measure-Object` instead.)
Severity: medium — a worker pasting the commands as given gets failures unrelated to the work, then must improvise the translation whose exact equivalence (e.g. `lanes` substring, case-sensitivity) is the point of the check.
Fix in one sentence: Provide the pwsh equivalents (`Select-String` line-count and match-count) alongside the grep forms, or name the shell the grep forms require.

**4. `RESULT1.md` is not new. (Low)**
Exact claim quoted: "`RESULT1.md` — (new)".
Evidence: `Get-Item -LiteralPath D:/addictedtoai-worktrees/fleet6-specfix/RESULT1.md` returned an existing file (`Length 6083, LastWriteTime 9/9/2026 7:28:03 PM`).
Severity: low — a worker following "That list is the closure … nothing else may be edited, created or deleted" plus "(new)" may fail or blindly overwrite in-progress content.
Fix in one sentence: Reword to "create or overwrite (read the existing file first)".

**5. Coverage of the out-of-scope code pointers is asserted, not evidenced. (Low)**
Exact claim quoted: "It is a real finding, it is about CODE rather than spec text, and it is already covered by tasks 89–90."
Evidence: both pointers are real — `loop/lib/proposals.mjs:1000` reads `- rule: specs/loop, "Work comes from three sources and cannot self-amplify" …` and `loop/lib/brief.mjs:393` reads `* The proposal rule, stated in every brief (specs/loop, "Work comes from three sources and cannot self-amplify" …` — but task 89 (migrate `DIRECTIVES.md`, delete the file and `loop/lib/directives.mjs`) and task 90 (`CLAUDE.md`/`AGENTS.md` fleet-removal docs), read at tasks.md:2220–2229, name neither literal.
Severity: low — out of scope either way, but a reader is told the code is handled when the cited tasks do not say so on their face.
Fix in one sentence: Cite the exact task bullets that update the two literals, or soften to "tracked under tasks 89–90, exact bullets to be confirmed".

## Checked and sound

- `git -C D:/AddictedtoAI diff 6ab1925 53779c3 -- openspec/changes/two-desks-work-orders-and-trains/specs/` measured 0 lines, and `diff 53779c3 12b4ea3 -- <same path>` also 0 — the byte-identical claim holds, and my checks at 12b4ea3 apply to the 53779c3 authority for `specs/`.
- Lane audit: 14 lines / 15 matches confirmed; the ten provider lines (1034, 1153, 1394, 1415, 2012, 2014, 2018, 2025, 2055, 2060) all read as provider-sense in context; line 2012 carries two occurrences ("provider's lane" + "A lane is"), which is the entire lines-vs-matches difference.
- Live-law and code pins: `openspec/specs/loop/spec.md:373` is the "`A lane is the set of runners sharing a `provider``" definition line; `loop/lib/budget.mjs:591` is exactly `export function lanePause(ledger, provider, now) {`.
- Desk-sense texts all land verbatim (:925 title, :927 "into two lanes", :943–944 "A lane decides which work is reached", :950 "while a lane exists that the ledger cannot see"); the :950 call-out that `desk` would be wrong is correct — the sentence is about ledger-invisible work.
- Breaker contradiction is real: norm :1457–1459 (window of last five, "SHALL NOT depend on the ledger's ordering") vs scenario :1517 ("WHEN three consecutive `post` jobs fail").
- Runner-health tension is real: norm :2112 (window, not a backwards walk) vs scenarios :2153 ("streak is cleared") and :2164 ("streak is zero"); nuance: scenario :2167–2172 ("does not reset the count") is consistent with the window, so the summary is accurate but incomplete — the attachment must carry that distinction.
- Ceiling contradiction is real: table :2271 (`machinery` ceiling ≤ 30%) vs scenario :2376 ("reaches 10%"); `data/config.json` contains `"machinery_ceiling_pct": 30`, so the table side matches live configuration.
- `would-cite-for` contradiction is real: norm :330–333 ("reported rather than failed" for record-wide-only on multi-piece subjects) vs scenario :357–363 ("the merge refuses, naming the pieces left unanswered").
- Removal dependents are real: live :69 ("before consulting the three work sources") and :84 ("before considering directives, the queue, or proposals"); live :1168–1178 (harvest ids from `DIRECTIVES.md` text, three bullets); delta REMOVED :2431–2437 retires "three sources" and `DIRECTIVES.md` claiming full carryover.
- tasks.md citation is exact at the brief's authority: `git show 53779c3:…/tasks.md` line 2205 (1-based) is `- [ ] 89. Migrate DIRECTIVES.md…`; at 12b4ea3 it reads 2220–2224 because 12b4ea3 itself edited tasks.md — drift explained, not a brief defect.
- Validate flags exist (`--type/--strict/--no-interactive` all in `openspec validate --help`); `scripts/check-spec-deltas.mjs` exists and `npm test` (`node scripts/run-tests.mjs`) discovers every `*.test.mjs` under `scripts/` etc., which includes `check-spec-deltas.test.mjs` — the "reads these delta files" rationale is fair.
- The change holds three delta files (loop, pulse, review); scoping edits to loop + review (+RESULT1.md) is consistent with all seven findings; forbidden list (`openspec/specs/**`, tasks.md, loop/, scripts/, data/) matches the tree.
- Authority hashes 53779c3, 6ab1925, 12b4ea3, f879ec9 all resolve; packet-F stat touches select/runners/run as claimed. The "other 38 findings" count and the attached-findings' which-side-is-correct assignments could not be verified (attachments are not in the tree) and are therefore neither confirmed nor disputed.

## What a worker would still guess

The validate invocation: a competent worker, forbidden to `cd` and given a pathless `openspec validate <change>` command, will most likely run it from wherever the harness spawns the shell — plausibly the main tree or the scratchpad — see a pass, and report it as the worktree's green. That is the brief's own nightmare case (a green meaning the wrong tree) produced by the brief's own ground rules, and it is more likely than any prose-level mistake in the seven edits.

## What I ran

Read-only only; no file was written (per the read-only instruction, the required output file at `C:/Users/BadBitch/.local/share/opencode/plans/brief-review-arch-specfix-brief-r1-muse.md` was intentionally not created — this message is the review).
Commands: `git -C D:/AddictedtoAI log --oneline -15`; `git diff 6ab1925 53779c3 -- …/specs/ | Measure-Object -Line` (0); same for 53779c3→12b4ea3 (0); `Select-String -Pattern lane` line table (14) and match-sum (15); reads of loop delta :202–261, :920–969, :1025–1064, :1145–1169, :1385–1424, :1448–1547, :2005–2177, :2370–2437; reads of review delta :220–379, :378–511; reads of live spec :60–89, :365–384, :1160–1184; `Select-String` on tasks.md (89/90, DIRECTIVES), proposals.mjs:1000, brief.mjs:393/695, select/runners/run neighborhoods; `git show 53779c3:…/tasks.md` (task-89 line check); `git show --stat f879ec9` and `12b4ea3`; `openspec validate --help`; `Get-Content package.json` + `Get-ChildItem scripts/` + `Get-Content scripts/run-tests.mjs` (test-discovery check); `Test-Path` worktree files + `Get-Item …/RESULT1.md` (exists, 6083 bytes).
