# Reviewer A1 (sonnet, sealed) — Stage 0 tasks 16/17 and wisdom item 2b

**P0 — Tests mutate the live dispatch module in place, not a disposable copy.** `loop/tests/brief-reconcile.test.mjs:55` sets `const BRIEF_LIB = resolve(HERE, '..', 'lib', 'brief.mjs')` — the real, tracked `D:/AddictedtoAI/loop/lib/brief.mjs`, imported by `loop/run.mjs:28` and invoked at `loop/run.mjs:1345` for every job the Desk dispatches. Arm 1b (`:167` `writeFileSync(BRIEF_LIB, dropped, 'utf8')`, restored `:176`) and mutation B (`:249`/`:265`) both overwrite this file on disk, run a probe, then restore it in a `try/finally`. `finally` does not run on SIGKILL, OOM-kill, or a hard crash — if the `node --test` process dies between the write and the restore, the working tree is left with a broken `loop/lib/brief.mjs` (missing the detail embed, or with the refusal check dead), and the next unattended `node loop/run.mjs` run would import it. The identical pattern exists in `scripts/tests/lint-deferrals.test.mjs` against `REPORTER` (`scripts/lint-deferrals.mjs`, lines 342/351, 370/378, 397/405) — lower blast radius since that script is standalone, not import-time-loaded into the dispatch loop.

**P1 — Dropping `push` from `COMMAND_VERBS` creates a real, if disclosed, blind spot.** `loop/lib/brief.mjs` (commit `f1e75c2`) removes `'push', ` from the verb set with an in-place comment giving the reason (portability/publish guards forbid the literal token in `loop/`). Effect: a source imperative opening "Push the branch once gates pass." — unlisted, no modal — is no longer classified as an imperative at all, so `reconcileBriefImperatives` can't flag its absence from a brief. The exclusion is documented beside the constant as required, and the risk is stated rather than hidden, but it is a genuine under-count.

**P1 — Token-coverage carrying-check has no polarity/negation awareness (disclosed, verified concrete).** `round1-REVIEW.md` point 6 states this outright: "a brief explicitly declining the fourth passes." Concrete wrong world: a brief containing "We will NOT record the free-memory figure at the moment of a spawn failure" shares ≥50% of the fourth imperative's significant tokens (`record`, `free-memory`, `figure`, `moment`, `spawn`, `failure`) via `briefCarries` (`loop/lib/brief.mjs`), so the refusal never fires even though the brief affirmatively contradicts the instruction.

**P1 — (discrepancy in the REVIEW BRIEF, not the code) "`loop/run.mjs` (8 added lines)" does not belong to 2b.** None of the nine commits (`130852a…f1e75c2`) touch `loop/run.mjs`; its most recent commit is `e0d7839` (wisdom 5). The wiring verified — `assembleBrief(...)` at `:1345`, `writeFileSync(...'.job','brief.md'...)` at `:1412` — is pre-existing, unchanged code.

**P2 — "No-id `--strict` fix" is a visibility fix, not an exit-code fix.** `scripts/lint-deferrals.mjs`'s exit line is `if (strict && unroutable.length > 0) process.exitCode = 1;` — it already counted id-less unroutable issues before this change; only the `if (skippedNoId > 0) process.stderr.write(...)` line is new. `round1-RESULT.md` itself says "exit behavior unchanged," so this isn't overclaimed. Arm 5b (`lint-deferrals.test.mjs:317`) asserts the stderr line and both exit codes directly (not via an applied/reverted mutation like the other arms).

**P2 — Truncation-shape's escape hatch is validated in a sibling file, not the new one.** `scripts/tests/truncation-shape.test.mjs` arm 2 only shows the marker admits a peek; the negative case ("a bare comment is not a declaration") lives in the pre-existing `scripts/output-shortener-guard.test.mjs:166`, reused because both share `findTruncatedEnumeration`. Coverage exists but is cross-file.

**P3 — Could not corroborate or refute the "split-token gaming version" admission.** `git log --all --oneline -S"'pu' + 'sh'"` and `-S"'p' + 'ush'"` returned nothing. Consistent with "never committed", but the actual pattern was not identified, so this is a weak negative.

**One wrong world per instrument:**
- `lint-deferrals.mjs`: an issue whose real defect is unlocated prose, but which mentions a path in passing ("see also `lib/stamp.mjs` for the pattern") — `SUBJECT_RE` matches, the issue is reported routable, and it is not. The tool's own documented limit.
- `brief.mjs` reconciler: the negation case above.
- truncation sweep / `output-shortener-guard.mjs`: `curl https://api/issues | head -20` — `curl` is deliberately excluded from `ENUMERATORS`, so a truncated list response from an HTTP endpoint is invisible to both 2a and the sweep.

## Verified OK
- Task 16/17 text (from `9aaf6fe`'s tasks.md diff) matches what `scripts/lint-deferrals.mjs` implements: JSON-path arg, `--strict`-only exit change, no `child_process`/tracker import.
- B1/B2 split honored exactly as task 17 specifies: B1 red under mutation B (`lint-deferrals.test.mjs:358`), B2 green baseline and under mutation, explicitly named not-the-witness (`:388`).
- Task ticks in `9aaf6fe` cite the real merge (`358e00d`/`130852a`) and match the merged content.
- Arm counts verified with `Grep -c 'test\('` (filtering `.test(regex)` calls): `lint-deferrals.test.mjs` = 12 ("12/12"), `brief-reconcile.test.mjs` = 7 ("7/7"), `truncation-shape.test.mjs` = 5 ("5/5").
- 2b is wired into live dispatch: `loop/run.mjs:1345 briefText = assembleBrief(...)`, `:1412 writeFileSync(...'.job/brief.md'...)` runs only after that returns — matching `round1-REVIEW.md`'s cited line numbers.
- `wisdom/HANDOFF.md` §3 (line 149, 2b "BRIEFED, NOT BUILT") and §4 (lines 208–219) match the pre-state these commits then resolved.
- `wisdom/README.md:276-289` (item 2b description, x2jl wild control) matches what was built.

**Not checked:** whether `assembleBrief`'s thrown error is caught further up `loop/run.mjs` (no immediate try/catch at the call site); full history search for the split-token pattern.
