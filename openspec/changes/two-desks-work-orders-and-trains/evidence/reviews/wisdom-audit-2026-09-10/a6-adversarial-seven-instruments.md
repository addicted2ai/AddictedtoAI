# Reviewer A6 (sonnet, sealed, code-only — read no evidence/brief/board prose) — what each of the seven new instruments cannot see

## 1. `scripts/lint-deferrals.mjs`
**Wired where:** TEST-ONLY as an automated call. Repo-wide grep for "lint-deferrals" hits only the module, its test, and prose docs — no `.mjs` caller in `loop/`, `pulse/`, or `scripts/prebuild.mjs`'s STEPS. It's a manual CLI a human runs against a `bd list --json` dump.
**Escape hatch:** `SUBJECT_RE`/`REQUIREMENT_RE` (lines 106-142) match any `<root>/<path>` or `specs/<cap>` occurring *anywhere* in six prose fields — even a passing mention. The header admits this at lines 94-99 ("a vague deferral that drops a passing path reference reads as routable"); no test bounds how loosely the pointer must relate to the deferral.
**Silent-pass routes:** `isUnroutable` gates on `isOpen(issue)` (145-147), safe direction on missing status. No floor on issues scanned — a malformed/empty export looks identical to a fully-routed one.
**Red on same path:** yes — mutation A (test:335-356, filter→`()=>false`) and mutation B (test:358-386, spawns `bd`) each flip a real assertion red, both via file edit + revert-hash-verify.
**Concrete wrong world:** issue "Could be tidier / This should be fixed eventually, see `loop/lib/gates.mjs` for the pattern" — a genuinely vague deferral — reports as routed because `loop/` appears once, in passing.

## 2. Imperative reconciliation (2b), `loop/lib/brief.mjs`
**Wired where:** `brief.mjs:1034`, inside `assembleBrief`, live at `loop/run.mjs:1345` for every new-job dispatch (throws before `.job/brief.md` is written). NOT wired for `assembleRevisionBrief` (`brief.mjs:1096`, called `run.mjs:753`) or `resumeBrief` (`brief.mjs:1165`, called `run.mjs:1239`) — both rebuild text independently; stated as a limit at `brief.mjs:726-727`.
**Escape hatch:** `briefCarries` (806-812) needs only ≥50% of an imperative's significant tokens present *anywhere*, unordered — called out at 702-711 as "the loosest joint… where its next defect will be."
**Silent-pass routes:** `COMMAND_VERBS` (729-739) is a closed 60-word list; a verb like "purge" outside it, with no list marker or modal, is never extracted as an imperative at all.
**Red on same path:** yes — mutation A (test:208-218, list-only reconciliation) and mutation B (test:220-282, dead-coded refusal, order-mirrored write) both flip real assertions, reverted byte-identical.
**Concrete wrong world:** source sentence "Purge the orphaned worktree lock before the next scan runs" — unlisted, unmodal, off-verb-list — is silently dropped and never refused.

## 3. `scripts/tests/truncation-shape.test.mjs`
**Wired where:** collected by `npm test`. Also re-uses `findTruncatedEnumeration` from `scripts/output-shortener-guard.mjs`, independently wired as a live PreToolUse hook in `.claude/settings.json:24`.
**Escape hatch:** `NON_EXHAUSTIVE_MARKER` (guard.mjs:115) — any of several `#`-comment spellings anywhere admits the pipeline unconditionally; arm 2 (truncation-shape.test.mjs:112-123) shows presence, never truthfulness, is checked.
**Silent-pass routes:** `ENUMERATORS` (guard.mjs:81-88) is a closed command/subcommand set — `curl`, `python`, a captured variable, or PowerShell array slicing are structurally invisible (guard.mjs:63-67 states this is deliberate).
**Red on same path:** yes — arm 4 (test:142-153) strips the marker from the same line, flipping green→red.
**Concrete wrong world:** `OUT=$(git log --oneline); echo "$OUT" | head -5` — the enumerator's output is captured to a variable, then piped through `echo` (unlisted); real truncation, undetected. `git log -5` (flag-limited, no pipe) is equally invisible by construction.

## 4. Required-text completeness (3a), `loop/lib/brief.mjs:828-957`
**Wired where:** `brief.mjs:1053-1062`, same dispatch path as item 2 (`run.mjs:1345`). Same revision/resume gap as item 2.
**Escape hatch — the headline finding:** `CONTRADICTED` is fully computed and tested (`reconcileRequiredCoverage`, 921-957) but explicitly NOT wired to the dispatch throw (1043-1052): only `missing`/`truncated` refuse. The comment names the reason (35 false-fires on the template's own negating sentences) as a deliberate, disclosed gap. Arm 5 (brief-required.test.mjs:174-203) pins it: a brief that inverts its own source requirement assembles and ships.
**Silent-pass routes:** negation needs ≥2 shared tokens with a negation marker *in the same brief sentence* (908-913); a negation elsewhere in the paragraph escapes (disclosed at 863-867).
**Red on same path:** yes — mutation A (test:205-234) and mutation B (236-302), both real-file, revert-verified.
**Concrete wrong world:** source requires "refuse unroutable candidates loudly rather than skipping them silently"; assembled brief states "unroutable candidates are skipped silently, never refused loudly" — `contradicted` fires internally, `assembleBrief` returns normally anyway.

## 5. `scripts/brief-closure.mjs`
**Wired where:** TEST-ONLY. Grep across `loop/` and `scripts/` finds only the module, its test, and an unrelated docs-boundary test. It's a CLI (`--brief --base --tip --root --verbose`) run by hand.
**Escape hatch:** by design — header lines 27-33 state the instrument is "reviewer-side, not automatic": it reports candidates and names full automation as an unbuilt follow-up. No merge step consumes its output.
**Silent-pass routes:** `collectPins` (193-325) pattern-matches five hardcoded, identifier-tied pin shapes; any new kind of load-bearing assertion is invisible until hand-added. `isProductionFile` (103-115) is a fixed root list, so the pin-based CANDIDATE half never reaches `content/`/`data/`/`openspec/` diffs.
**Red on same path:** yes — mutation A (test:129-154) and mutation B (156-177), both against real wild briefs (B2/E/F), revert-verified.
**Concrete wrong world:** a brief lists every touched file (so `scopeMisses` is empty) while its diff quietly deletes the `LEDGER_FIELDS` assertion inside an already-listed test file — "listed" is never checked against content, only against the path.

## 6. `loop/lib/lineage.mjs` + `ledger.mjs`/`review.mjs`/`run.mjs` diffs
**Wired where:** two live prompt/passthrough seams, one dead judging seam. `corroborationSection()` (lineage.mjs:88-96) is interpolated into every sealed review brief via `review.mjs:47,577` — live, but pure prompt text. `lineage` rides `ledger.mjs:152` and `run.mjs:1547` as an optional passthrough. `recordMeasurement`/`classifyClaim`/`createLineageStore` (144-354) — the actual independence logic — have **zero production callers**; `run.mjs:1518-1520` states outright "No selector sets one today… this changes nothing until a job arrives carrying one."
**Escape hatch:** since no selector populates `job.lineage`, every real measurement today is lineage-less, and `classifyClaim` refuses lineage-less claims rather than judging them — the mechanism never fires on anything real.
**Silent-pass routes:** the reader half is a question posed to an LLM reviewer with no check that it's answered correctly.
**Red on same path:** strong in isolation — arms 7-8 (lineage.test.mjs:306-385) mutate producer-attachment and the agreement/corroboration label, both revert-verified — but these exercise a module nothing in production calls.
**Concrete wrong world:** a Desk job computes one figure twice via the same helper under different variable names; no code path ever calls `recordMeasurement`/`classifyClaim` on it, so only the unenforced review-prompt question stands between this and a shipped false-corroboration claim.

## 7. `scripts/figure-provenance.test.mjs`
**Wired where:** a `*.test.mjs` gated by `npm test`, which the push gate requires — real enforcement, but only for its declared scope.
**Escape hatch:** `DECLARED` (108-156) hand-enumerates exactly four config bounds. Any other config.json figure restated stale elsewhere is unpoliced. `openspec/**` (the actual specs/change docs), `wisdom/briefs/**`, `data/**` except README, and all `tests/` dirs are excluded from the sweep (`sweepFiles`, 408-414).
**Silent-pass routes:** `pointerFor` (211-214) only checks that `data/config.json` or the keyPath string appears *literally anywhere* in a 3-line window — not that the mention is about this number.
**Red on same path:** extensive — 10 paired refused/pass arms (288-341), a tense-exemption arm, a documented-exemption liveness arm (462-476) proving drift re-fires.
**Concrete wrong world:** the machinery-ceiling patterns require literal order machinery→ceiling→N% or N%→machinery→ceiling (116-118). "The machinery has a 10% ceiling, well under what pulse actually spends" places the number *between* the anchors and matches neither — the exact incident class this instrument exists for (addictedtoai-mrld) sails through.

## Three most consequential blind spots
1. **Lineage's actual judging logic is inert in production** — `loop/run.mjs:1518-1520` admits no selector ever sets `job.lineage`, so `classifyClaim`/`recordMeasurement` (`loop/lib/lineage.mjs:144-354`) never run on a real measurement; only an unenforced review-prompt question stands in.
2. **Detected-but-undispatched contradiction** — `loop/lib/brief.mjs:1043-1052` computes `contradicted` and never refuses on it, so a brief can ship an instruction that flatly negates its own source requirement.
3. **Closure checking is opt-in** — `scripts/brief-closure.mjs:27-33` is reviewer-run-by-hand with no automatic gate, so an entire Files-list-completeness check depends on a human remembering to invoke a CLI.
