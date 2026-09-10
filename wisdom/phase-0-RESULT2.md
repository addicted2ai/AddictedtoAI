> **PROVENANCE.** Round 2's author report: 28 tests to 66, the linter's digest
> unmoved. All eight named mutations were independently confirmed to turn the
> suite red, applied against the author's own file and restored by hash between.
> **Its section 4 was later refuted by the round-2 sealed review** — see the
> correction line at the end of this file.

---

# WISDOM PHASE 0 — RESULT2

Local date: 2026-09-10.

Authority: two-desks-work-orders-and-trains@a5e873b.

The linter was not edited. All work is in `scripts/brief-lint.test.mjs`. Fixtures are files under the OS temp area, one fresh area per trial, removed after. No fixture was written into the repository. Only `node --test` on the test file was run. No build, no whole suite, no verify script, no Pulse, no Desk. No commits. The untouched linter was kept under the OS temp area as `brief-lint.orig.mjs` and every mutation was restored from it before the next.

Note on evidence below: the check-6 guard names its guarded two-letter token in its own PASS/FAIL line. This report never reproduces those lines. Check-6 twins are matched on the tail `outside a prohibition line` and described without quoting the guard line, the same method as round 1. The test file assembles the guarded forms at runtime from character codes 99, 100 (lower form) and 67, 68 (upper form) and never spells either.

## 1. The six mutations, before and after

Before: each mutation on the round-1 suite stayed 28/28 green. After: the suite is 66 tests. Each row was applied, run, recorded, then restored from the temp original and confirmed green again.

| mutation | suite before | suite after | the twin that now catches it |
|---|---|---|---|
| M3 `:223` — remove `rewrite\|` from `EDIT_VERB` | 28/28 green | 66 tests, 65 pass, 1 fail | `scope: Rewrite stray refuses` — a `Rewrite` stray that was FAIL becomes PASS when the verb leaves the list, so the assert on status 1 fails |
| M4 `:259` — remove the `i` flag from the first `/i.test` on that line | 28/28 green | 66 tests, 65 pass, 1 fail | `check 6: upper-case stray refuses (assembled at runtime)` — the upper-case stray that was FAIL becomes PASS when the first pattern turns case-sensitive |
| M5 `:259` — delete ` && !/never\|token/i.test(l)` | 28/28 green | 66 tests, 64 pass, 2 fail | `check 6: never prohibition stays green` and `check 6: token-word prohibition stays green` — both greens become FAIL when the exemption leaves |
| M6 `:124` — `changed >= 5` becomes `changed >= 3` | 28/28 green | 66 tests, 65 pass, 1 fail | `packet: four changed lines refuses` — 4 changed lines is FAIL under `>= 5` and PASS under `>= 3`, so the assert on status 1 fails |
| M7 `:264` — reduce `hasClass` to only `/\bclass\b/i` | 28/28 green | 66 tests, 65 pass, 1 fail | `revision: every-form without class word goes green` — the `every ... in this file` green without the word `class` becomes FAIL when the second arm leaves |
| M8 `:297` — `pf(numbered && !bareResult)` becomes `pf(numbered)` | 28/28 green | 66 tests, 65 pass, 1 fail | `result name: numbered plus bare refuses` — numbered plus bare is FAIL under the conjunction and PASS under `numbered` alone |

Still caught afterwards, as required:

- Check 5 emptied to a constant at `:250` (`const onceBad = [];`): 66 tests, 65 pass, 1 fail — `once: bare once refuses` becomes PASS, so its assert fails. Still caught.
- Exit status no longer carried at `:60` (`fails += 1` replaced): 66 tests, 31 pass, 35 fail — every red twin reports its FAIL line yet exits 0, so every assert on status 1 fails. Still caught.

## 2. Every twin added, and the red observed for each

F1 — scope verbs are one verb deep. Two reds:

- `scope: Rewrite stray refuses` — `Rewrite `loop/run.mjs`` outside Files scope. Unmutated: exit 1, `FAIL no instruction directs an edit`. Under M3: exit 0, `BRIEF OK`, assert fails.
- `scope: Modify stray refuses` — `Modify `loop/run.mjs`` outside Files scope. Unmutated: exit 1, `FAIL no instruction directs an edit`. Stays red under M3 (the `modify` arm remains), proving the two verbs are independent arms.

F2 — check 6 has no upper-case twin. One red:

- `check 6: upper-case stray refuses (assembled at runtime)` — upper form assembled from codes 67, 68 in `Run <upper> /tmp to inspect.` Unmutated: exit 1, FAIL tail `outside a prohibition line`. Under M4: exit 0, PASS tail, assert fails.

F3 — check 6 exemption has no passing twin. Two greens:

- `check 6: never prohibition stays green (assembled at runtime)` — `Never run <lower> /tmp; it is forbidden.` Uses `never`, not the word `token`. Unmutated: exit 0, PASS tail. Under M5: exit 1, FAIL tail.
- `check 6: token-word prohibition stays green (assembled at runtime)` — `The <lower> token is forbidden here.` Uses the word `token`, not `never`. Unmutated: exit 0, PASS tail. Under M5: exit 1, FAIL tail.

F4 — packet diff threshold has no boundary twin. Two:

- `packet: five changed lines goes green` — 5 changed, 22 header lines. Unmutated: exit 0, `PASS packet carries the author report`.
- `packet: four changed lines refuses` — 4 changed, 22 header lines. Unmutated: exit 1, `FAIL packet carries the author report` with `changed-lines=4`. Under M6: exit 0, `BRIEF OK`.

F5 — packet header threshold has the same gap, on the header own prose-line count. Two:

- `packet: twenty header lines goes green` — 6 changed, 20 header lines. Unmutated: exit 0, `PASS packet header is substantive` with `20 header lines`.
- `packet: nineteen header lines refuses` — 6 changed, 19 header lines. Unmutated: exit 1, `FAIL packet header is substantive` with `19 header lines`.

F6 — revision second arm has no twin. One green:

- `revision: every-form without class word goes green` — `Every check in this file is covered.` plus `Do a sweep of all files.`, run with `--revision`, carrying no `class` word. Unmutated: exit 0, `PASS revision brief names a CLASS` with `class=true sweep=true` via the second arm. Under M7: exit 1, `FAIL revision brief names a CLASS` with `class=false sweep=true`.

F7 — result-name conjunction has no twin. One red:

- `result name: numbered plus bare refuses` — base plus ``RESULT.md`` alongside the base ``RESULT1.md``. Unmutated: exit 1, `FAIL report file is a numbered` with `numbered=true bare=true`. Under M8: exit 0, `BRIEF OK` with `numbered=true bare=true`.

F8 — round-1 shared-logic argument was convenient, not sound. Two reds:

- `packet: bare name in header refuses` — sealed packet (6 changed, 22 header lines) with ``RESULT.md`` inserted into the header before the report marker. Run with `--packet`. Unmutated: exit 1, `FAIL packet header names no bare` with `bare RESULT in header=true`; the carry and substantive checks still PASS, so this is the header-only input with no numbered requirement, a different branch from the normal result check.
- `instruments: zero claims under review refuses` — base with the enforcement sentence replaced by `The property holds for this edit.` plus ``REVIEW1.md``, run with `--review`. Unmutated: exit 1, `FAIL enforcement claims` with `a review brief must name a property`; the review-name check still PASSes, so this is `instLines.length === 0`, a different branch from the proven `instBad > 0`.

## 3. The unmutated suite, final counts, verbatim and untruncated

Command (only command run against the suite, repeated per mutation with restore between):

`node --test "D:\addictedtoai-worktrees\wisdom-w1\scripts\brief-lint.test.mjs"`

Full output, verbatim and untruncated (green run after final restore, saved to the OS temp area as `final-green.txt` and reproduced here):

```text
✔ authority: passing vehicle goes green (280.3096ms)
✔ authority: unknown sha refuses (289.4163ms)
✔ quotes: verbatim block goes green (284.3215ms)
✔ quotes: one changed word refuses (269.3165ms)
✔ instruments: existing instrument goes green (270.3184ms)
✔ instruments: missing instrument refuses (280.4375ms)
✔ files: scoped bullet with reason goes green (269.6078ms)
✔ files: bullet without reason refuses (268.9505ms)
✔ scope: no stray edit instruction goes green (285.2729ms)
✔ scope: stray edit instruction refuses (270.0406ms)
✔ once: clean vehicle goes green (273.0156ms)
✔ once: bare once refuses (269.4467ms)
✔ check 6: clean vehicle goes green (269.7494ms)
✔ check 6: stray token refuses (assembled at runtime) (274.4318ms)
✔ revision: class plus sweep goes green (270.7898ms)
✔ revision: missing sweep refuses (281.8643ms)
✔ result name: numbered report goes green (278.9042ms)
✔ result name: bare report refuses (274.8162ms)
✔ review name: numbered review goes green (272.4291ms)
✔ review name: bare review refuses (278.4326ms)
✔ pointers: live pointer with named phrase goes green (351.1487ms)
✔ pointers: synthetic paraphrase refuses (one word) (347.297ms)
✔ pointers: wild banked brief refuses on the ninth check (297.2386ms)
✔ packet: sealed vehicle with diff goes green (294.179ms)
✔ packet: thin diff refuses (287.3278ms)
✔ packet: thin header refuses (300.8686ms)
✔ tasks file: unknown change refuses with path named (347.853ms)
✔ move: no hard-coded root or task path remains (0.7283ms)
✔ scope: Rewrite stray refuses (475.4446ms)
✔ scope: Modify stray refuses (306.9868ms)
✔ check 6: upper-case stray refuses (assembled at runtime) (284.667ms)
✔ check 6: never prohibition stays green (assembled at runtime) (277.0457ms)
✔ check 6: token-word prohibition stays green (assembled at runtime) (279.1702ms)
✔ packet: five changed lines goes green (285.2672ms)
✔ packet: four changed lines refuses (283.2223ms)
✔ packet: twenty header lines goes green (272.2345ms)
✔ packet: nineteen header lines refuses (268.6628ms)
✔ revision: every-form without class word goes green (270.3733ms)
✔ result name: numbered plus bare refuses (269.9961ms)
✔ packet: bare name in header refuses (269.9659ms)
✔ instruments: zero claims under review refuses (281.2702ms)
✔ once: with iteration stays green (272.2022ms)
✔ once: with attempt stays green (270.1236ms)
✔ files: missing path refuses (270.1785ms)
✔ files: missing path marked new stays green (271.305ms)
✔ files: Work only in block goes green (271.2299ms)
✔ instruments: missing path with find stays green (269.9331ms)
✔ instruments: enforces form goes green (270.9768ms)
✔ scope: prohibition spares stray path (269.3247ms)
✔ scope: cited path without verb stays green (269.8788ms)
✔ revision: sweep without class refuses (270.1293ms)
✔ result name: no name refuses (269.5302ms)
✔ review name: no review name refuses (271.0775ms)
✔ review name: numbered plus bare refuses (273.2091ms)
✔ review name: bare result under review refuses (269.4917ms)
✔ review name: suffixed numbered review goes green (272.592ms)
✔ packet: missing report marker refuses (275.3209ms)
✔ packet: reversed markers refuses (268.0467ms)
✔ quotes: ellipsis prefix stays green (280.0093ms)
✔ authority: mismatched reachable sha refuses (335.2654ms)
✔ authority: same unreachable sha refuses (197.4788ms)
✔ check 6: embedded letters stay green (270.7259ms)
✔ pointers: live backticked phrase goes green (343.5039ms)
✔ pointers: synthetic backticked paraphrase refuses (345.5173ms)
✔ pointers: second phrase still checked refuses (347.3559ms)
✔ pointers: short phrase ignored stays green (337.5747ms)
ℹ tests 66
ℹ suites 0
ℹ pass 66
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 18733.3404
```

## 4. The two unsettled questions (prefix equality; the phrase filter)

Authority 7-character prefix equality (`brief-lint.mjs:138`):

- The code implements prefix equality, not full equality: `auth[2].startsWith(authority.slice(0, 7)) || authority.startsWith(auth[2].slice(0, 7))`. Either side matching on its first 7 characters suffices.
- The twin does not distinguish prefix from full equality. The unknown-sha twin (all-zero brief sha versus real HEAD argument) fails under either reading, because the 7-character prefixes differ and the full values differ. The two new authority twins split reachability from equality but not prefix from full: mismatched reachable (parent brief sha versus HEAD argument, prefixes asserted different) fails under either reading; same unreachable (all-zero in both brief and argument, prefixes identical) passes the equality arm under either reading and fails only on reachability. A same-prefix-different-sha pair cannot be built from this tree without inventing history, so no fixture inventing a collision was added, per the brief.

Pointer 20-character phrase filter (`:339-342`):

- Backtick-only shapes can be made to refuse, and now do. `pointers: live backticked phrase goes green` (backticked `Stage 0 ships first and alone` with a live pointer) goes green; `pointers: synthetic backticked paraphrase refuses` (same shape with `lonely`) refuses with `does not contain`. The backtick arm of the phrase union is therefore bound in both directions.
- Multi-phrase shapes can be made to refuse, and now do. `pointers: second phrase still checked refuses` carries one verbatim italic phrase and one paraphrased italic phrase before one pointer and refuses on the second. A check that stopped after the first phrase would stay green, so this binds the loop over all phrases.
- The 20-character plus space filter itself is bound by `pointers: short phrase ignored stays green`: `*wrong words here*` (16 inner characters, with a space) before a live pointer stays green because the inner text is shorter than 20 and is never collected. Deleting the length filter would turn this green red. The space requirement (`p.includes(' ')`) and the length requirement are therefore distinguished: a short spaced phrase is ignored for length, not for spacing.

## 5. Other twins I found carrying the same class, beyond the eight

For each check I asked which sub-expression the twin exercises and added the missing side. All are in the 66-test run above.

- `once`: the base green carries no `once`, so the `iteration|attempt` exemption is untouched. Added `once: with iteration stays green` and `once: with attempt stays green`. Each binds one arm of the exemption; deleting the exemption turns both red.
- `files`: the red proves the reason half; the existence half is untouched. Added `files: missing path refuses` (nonexistent path with reason refuses with `PATH MISSING`) and `files: missing path marked new stays green` (same path marked `(new)` stays green, binding the `(new)` exemption). Added `files: Work only in block goes green` (same bullets under `Work only in:` instead of `## Files`), binding the second header alternative.
- `instruments`: no green proves delegation. Added `instruments: missing path with find stays green` (missing path plus `and find them and run them` in the same sentence stays green; the sentence break matters — a `;` splits sentences and loses the delegation, so the vehicle uses `and`). Added `instruments: enforces form goes green` (`The suite enforces the property in ...` with an existing path), binding the `enforces` alternative alongside the proven `enforced by`.
- `scope`: no green proves the prohibition exemption. Added `scope: prohibition spares stray path` (`Do not edit `loop/run.mjs`.` stays green). Added `scope: cited path without verb stays green` (`See `openspec/changes/two-desks-work-orders-and-trains/tasks.md` for context.` stays green), binding the cited-path removal before the verb test: without the removal the word `changes` inside the path reads as a verb and the uncited tasks path reads as stray.
- `revision`: no red proves the `hasClass` requirement itself (both existing twins carry the `CLASS` word). Added `revision: sweep without class refuses` (sweep sentence alone under `--revision` refuses with `class=false sweep=true`).
- `result name`: no red proves the `numbered` requirement itself (the bare-only red fails on both arms). Added `result name: no name refuses` (neither form refuses with `numbered=false bare=false`).
- `review name` (`--review` branch `numberedReview && !bareReview && !bareResult`): only one red for three arms. Added `review name: no review name refuses` (neither review form, binding `numberedReview`), `review name: numbered plus bare refuses` (both review forms, binding `!bareReview`), `review name: bare result under review refuses` (numbered review plus bare result, binding `!bareResult` in this branch), and `review name: suffixed numbered review goes green` (``REVIEW1-muse.md`` stays green, binding the widened `REVIEW\d+[\w-]*\.md` suffix allowance).
- `packet` order (`reportIdx > 0 && diffIdx > reportIdx && changed >= 5`): only the `changed` arm was red. Added `packet: missing report marker refuses` (diff without the report marker) and `packet: reversed markers refuses` (diff marker before report marker), binding the first two arms.
- `quotes`: the leading/trailing `...` strip has no twin. Added `quotes: ellipsis prefix stays green` (`> ... Stage 0 ships first and alone` stays green; without the strip the core keeps the dots and leaves the blob).
- `authority`: the red fails on reachability and equality together. Added `authority: mismatched reachable sha refuses` (parent sha in the brief versus HEAD argument, both reachable, prefixes asserted different — fails on equality alone) and `authority: same unreachable sha refuses` (all-zero in both brief and argument — passes equality, fails on reachability alone).
- Check-6 boundaries: no green proves the word-boundary guards. Added `check 6: embedded letters stay green` (the word `anecdote` stays green: its inner two letters sit between alphanumerics, so the boundary guard correctly ignores them; deleting the boundaries would turn this green red).
- `pointers` beyond the brief two shapes: added the backtick pair, the multi-phrase red, and the short-phrase green described in section 4.

## 6. Any check I could NOT bind, and why

- Authority prefix versus full equality: not distinguished, and not bound here. Same-prefix-different-sha history does not exist in this tree to cite, and inventing a collision would manufacture the domain that would make the claim true. Reported as a limit, not a fixture.
- Pointer six-line window (`lines.slice(Math.max(0, at - 6), at)`) and the `git `-prefix exclusion (`!p.startsWith('git ')`): no twins added this round. Both are real filters of the same class (a distant or self-describing phrase is silently unchecked), but binding the window needs a vehicle that places an identical wrong phrase at distance 6 versus 7 from the pointer, and binding the prefix needs a long spaced phrase beginning with the word `git` that is absent from the blob. Either vehicle is buildable and neither was needed for the six acceptance mutations; they are recorded here as the next sweep, not as contrived fixtures.
- Quotes `blob.length > 0` and the `tasksMissing` versus empty-blob distinction: not separately bound. An empty but resolving task blob does not occur in this tree, so a vehicle for it would invent its world rather than cite it.
- Files `n > 0` (a Files block with zero bullets): no red added. An empty scope block is malformed in a way no brief in this round attempted; the arm is noted, not proven.

No other check was left unbound that a fixture in this tree could bind without contrivance.

## 7. Blocked or refused calls

None. No command was blocked or refused. No credential was handled or printed. No `npm run build`, whole `npm test`, verify script, Pulse, or Desk was run.

CORRECTION 2026-09-10: section 4's claim about the short phrase is refuted; see RESULT3.md section 1.
