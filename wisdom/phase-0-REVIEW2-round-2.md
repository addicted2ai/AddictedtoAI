> **PROVENANCE.** Round 2's sealed review — 46 mutations attempted, 12 caught,
> 34 missed, verdict `revise`. A sample was corroborated independently IN BOTH
> DIRECTIONS before it was acted on: three claimed misses stayed green and one
> claimed catch went red. A miss-only sample cannot distinguish a real hole from
> a suite that never ran.
>
> Its section 4 is the enumeration that round 3 dispositioned, and it also
> refuted a claim in the author's own round-2 report.

---

# WISDOM PHASE 0 ROUND 2 — REVIEW1

Local date: 2026-09-10.

## VERDICT
revise

## 1. What this suite still passes on

Method: untouched linter kept as `brief-lint.orig.mjs` under the OS temp area (`wis-r2`). Each mutation applied to `scripts/brief-lint.mjs` in this copy, suite run via `node --test` on `scripts/brief-lint.test.mjs` (full run saved under temp per id), then restored from the temp original. After every restore the suite was green again (66/66, status 0) before the next mutation. Restores verified by copy plus full green run; final state hash matches the original and the suite is 66/66 green.

Baseline (unmutated): 66 tests, 66 pass, 0 fail, status 0.

The six acceptance mutations (M3-M8) were not re-run except one spot check (upper-case stray, M4 equivalent) which was still caught (65/1). They are settled per the brief.

Counts below are `node --test` summaries. Caught = suite turns red (at least one fail). Miss = suite stays 66/66 green.

### Caught (10 new plus 1 crash-bound plus 1 settled spot check)

| id | mutation (`scripts/brief-lint.mjs`) | suite | twin that catches |
|---|---|---|---|
| A1 | `:139` drop `reachable` from `!!auth && reachable && sameSha` | 65/1 | `authority: same unreachable sha refuses` — all-zero brief and argument pass equality, fail reachability; without the reachability arm the authority line turns PASS and the assert on the authority FAIL line fails (overall still refused via the missing-file check) |
| A2 | `:139` drop equality, keep `!!auth && reachable` | 65/1 | `authority: mismatched reachable sha refuses` — parent sha vs HEAD, both reachable, prefixes asserted different; without equality the brief turns BRIEF OK and the assert on status 1 fails |
| E8norem | `:233` no cited-path removal before the verb test (`s.replace(CITE,' ')` to `s`) | 65/1 | `scope: cited path without verb stays green` — turns red. Confirms Q2 first twin controls its property (see section 2) |
| G5both | `:259` delete both boundary guards around the check-6 pattern | 65/1 | `check 6: embedded letters stay green` (`anecdote`) turns red. Confirms both guards together are bound (see section 2) |
| G6exi | `:259` drop `i` from the `never\|token` exemption | 65/1 | `check 6: never prohibition stays green` (capital `Never`) turns red. Exemption case-insensitivity is bound |
| G1firsti | `:259` drop `i` from the first pattern (settled M4 equivalent, spot check only) | 65/1 | `check 6: upper-case stray refuses` turns green-to-red the other way (upper stray becomes PASS). Still caught |
| L5sp | `:342` drop `p.includes(' ')` from the phrase filter | 63/3 | `pointers: live pointer with named phrase goes green`, `pointers: live backticked phrase goes green`, `pointers: short phrase ignored stays green` all turn red. Reason is incidental base paths (see section 2): every vehicle carries long backticked `scripts/...` paths with no space, which the space filter normally ignores; without it they are collected and absent from the blob. So the space arm IS bound, but not by the short-phrase twin |
| C1enf | `:171` drop `\|enforces` from the instrument alternation | 65/1 | `instruments: enforces form goes green` turns red. Second arm bound |
| F1att | `:250` drop `\|attempt` from the once exemption | 65/1 | `once: with attempt stays green` turns red. Attempt arm bound |
| F1iter | `:250` drop `iteration\|` from the once exemption | 65/1 | `once: with iteration stays green` turns red. Iteration arm bound |
| I2num | `:297` reduce `numbered && !bareResult` to `!bareResult` | 65/1 | `result name: no name refuses` (neither form) turns PASS. Numbered arm bound |
| E9nog | `:225` drop `g` from the cited-path pattern | 20 pass, 46 fail | Caught via crash, not via control: the pattern feeds `matchAll`, which requires the global flag, so every scope-adjacent trial throws. The interesting property (all paths in one sentence vs first only) remains unproven; no twin carries two stray paths in one sentence |

### Missed (suite stays 66/66 green) — the findings

For each miss the needed twin is named. All were restored to green (66/66) before the next.

| id | mutation | suite | twin that should have caught it (missing) |
|---|---|---|---|
| A3full | `:138` prefix equality to full `===` | 66/66 | Short-argument vehicle: base brief with full HEAD, run with 7-char prefix argument. Under prefix logic both PASS; under full logic the short run FAILs on authority. No such twin exists. See section 3.1 |
| A4a | `:133` authority sha length `{7,40}` to `{8,40}` | 66/66 | Brief with a 7-char sha in the authority line (sha-shaped, reachable via short form). All fixtures use 40-char shas |
| B2 | `:157` delete the trailing `...` strip, keep the leading strip | 66/66 | Trailing-ellipsis twin: `> Stage 0 ships first and alone ...` stays green (needs the strip); without it the core keeps the dots and leaves the blob. Only the prefix form has a twin |
| B3 | `:160` delete `&& blob.length > 0` | 66/66 | No resolving empty blob exists in this tree to cite (author claim 3, judged real limit with redundancy note in 3.3) |
| B6trim | `:58` `norm` without `.trim()` | 66/66 | Quote with leading/trailing spaces that normalise away. All verbatim fixtures are already trimmed |
| C2 | `:171` delete `\|what enforces` | 66/66 | Sentence using the third alternation form (`what enforces ...` with an existing path) going green. Only the first two forms have green twins |
| C4 | `:174` path extensions `(?:mjs\|js\|ps1\|sh)` to `mjs` only | 66/66 | Enforcement claim naming an existing non-`mjs` instrument (e.g. a `.sh` or `.ps1` path that exists in the tree) going green. All fixtures use `.mjs` |
| C5i | `:171` drop `i` from the instrument sentence filter | 66/66 | Upper-case instrument sentence (e.g. `ENFORCED BY ...`) going green/refusing correctly. All fixtures are lower-case |
| C6lines | `:171` `prose.filter` to `lines.filter` for instruments | 66/66 | Delegation split across physical lines but one sentence (e.g. claim on one line, `Find them and run them.` on the next) that passes on sentences and fails on lines. All delegation fixtures are single-line |
| D4 | `:200` `n > 0 && bad === 0` to `bad === 0` | 66/66 | Empty scope block: `## Files` header with zero bullets. Under correct FAILs (`0 files`); under mutated PASSes. Trivially buildable; see 3.4 |
| D5 | `:194` bullet reason `(?:—\|-)` to `(?:—)` only | 66/66 | Bullet with hyphen reason (`- path - reason`) going green. All fixtures use the em dash |
| E2chg | `:223` delete `change\|changes\|` from the edit-verb list | 66/66 | Stray instruction using `Change ...` or `Changes ...` outside Files scope refusing. Only `Edit`, `Rewrite`, `Modify` have red twins |
| E3del | `:223` delete `delete from\|` | 66/66 | Stray `Delete ... from ...` refusing. No twin uses that verb |
| E5res | `:224` delete `\|reserved\|` from the prohibition list | 66/66 | `Reserved ...` prohibition sparing a stray path staying green. Only `Do not` is proven green |
| E7sfx | `:238` suffix allowance `q.endsWith(p) \|\| p.endsWith(q)` to exact `q === p` | 66/66 | Cited short path that is a suffix of a permitted long path (or vice versa) staying green. All scope fixtures are exact or fully distinct |
| F3i | `:250` drop `i` from the `once` pattern | 66/66 | Upper-case `ONCE` refusing. No upper-case twin |
| F4e | `:250` drop `i` from the `iteration\|attempt` exemption | 66/66 | Upper-case exemption (`ITERATION`/`ATTEMPT`) staying green. All fixtures lower-case |
| F5b | `:250` `\\bonce\\b` to `once` (no boundaries) | 66/66 | Embedded `once` (e.g. `runonce` or similar letter-adjacent form) staying green. No boundary twin |
| F6lines | `:250` `prose.filter` to `proseLines.filter` for once | 66/66 | `once` and its qualifier split across a wrap (e.g. `once as an` / `iteration ...` on the next line) staying green on sentences, refusing on lines. All once fixtures single-line |
| G3lead | `:259` delete the leading boundary guard only | 66/66 | Token preceded by a letter but followed by a boundary (e.g. letter-adjacent on the left, space on the right) staying green under correct and turning red without the leading guard. `anecdote` (letters both sides) stays blocked by the trailing guard, so it cannot catch a one-sided deletion. See section 2 |
| G4trail | `:259` delete the trailing boundary guard only | 66/66 | Mirror of G3lead (boundary on the left, letter on the right). Same reason |
| G7hy | `:259` boundary class `[^A-Za-z0-9_-]` to `[^A-Za-z0-9_]` (drop hyphen) | 66/66 | Token adjacent to a hyphen staying green/refusing correctly. No hyphen-adjacent twin |
| G8sent | `:259` `proseLines.filter` to `prose.filter` | 66/66 | Token split or rejoined across sentence normalisation staying green/refusing correctly. No wrapping twin for this check |
| H2i | `:265` drop `i` from the sweep pattern | 66/66 | Upper-case sweep sentence going green. All sweep fixtures lower-case |
| H4dist | `:264` `every ...` distance `{0,60}` to `{0,59}` | 66/66 | `every ... in this file` with exactly 60 chars between going green (boundary). No distance-boundary twin |
| H6b | `:264` `\\bclass\\b` to `class` (no boundaries) | 66/66 | Embedded `class` (e.g. `subclass`) not satisfying the class arm. No boundary twin; the sweep-only red does not isolate the boundary |
| I3own | `:274` own-lines quote exclusion removed (`proseLines.filter(...)` to `proseLines`) | 66/66 | Bare name appearing ONLY inside a `>` quote staying green (the quoted Desk protocol the comment at `:269-271` describes). No such twin; every bare-name twin places the bare name in own prose. See finding |
| I4star | `:276` `RESULT\\d+\\.md` to `RESULT\\d*\\.md` | 66/66 | Bare `RESULT.md` matching the numbered pattern (zero digits plus empty suffix) yet still refused via `!bare`. Under the mutation the bare-only red still FAILs (via `!bare`), so no colour change. Needs a twin asserting `numbered=false` for the bare form, not just status |
| J2star | `:294` `REVIEW\\d+[\\w-]*\\.md` to `REVIEW\\d*[\\w-]*\\.md` | 66/66 | Same as I4star for the review branch: bare `REVIEW.md` matches numbered with zero digits yet still refused via `!bareReview`. No colour change |
| L3win | `:338` six-line window `at - 6` to `at - 3` | 66/66 | Wrong phrase at distance 4-6 from the pointer (inside 6, outside 3). All pointer phrases sit immediately above the pointer. Author-deferred as buildable; confirmed |
| L4git | `:342` delete `&& !p.startsWith('git ')` | 66/66 | Long spaced backticked phrase beginning with `git ` absent from the blob staying green (ignored) under correct, turning red without the exclusion. Author-deferred as buildable; confirmed. Example phrase shape in section 3.2 |
| L6thr | `:340-341` phrase length `{20,}` to `{21,}` | 66/66 | Phrase with exactly 20 inner chars (boundary) going green/refusing correctly. Live phrases are ~29, the short phrase is 16, so the threshold moves freely between 17 and 29 |
| K5diff | `:122` diff counting `^[+-][^+-]` to `^[+-]` | 66/66 | Diff with `+++`/`---` header lines counted as changed lines. All packet diffs use single-`+` added lines |
| Nsplit | `:111` sentence split `(?<=[.;])` to `(?<=\\.)` (drop `;`) | 66/66 | Delegation or qualifier split across `;` (e.g. `...; find them ...` / `...; iteration ...`) that passes on sentences and fails on lines. The report notes `;` splits sentences; no twin uses it |

Totals: 46 mutations attempted (45 new plus 1 settled spot check). Caught 12 (10 clean new controls plus 1 crash-bound plus 1 settled confirmation). Missed 34 (suite stays 66/66 green).

## 2. Twins that do not control their own property

### `scope: cited path without verb stays green` — controls its property, fragile by construction

Author note verified. `scripts/brief-lint.mjs:223` lists `change|changes` among the edit verbs. The twin sentence is `See ...tasks.md for context.` The verb `See` is not in that list (checked against `:223`), so the only verb candidate is the word `changes` inside the cited path `openspec/changes/two-desks-work-orders-and-trains/tasks.md`. The verb test at `:233` runs on the sentence with cited paths removed. Mutation E8norem (no removal) turns this green to red (65/1), proving the removal is what keeps it green.

Fragility, not failure: the control depends on this particular path containing a verb-list word. Had the example cited `loop/run.mjs` (no verb-list word inside), the sentence would stay green with or without the removal and the twin would prove nothing. The choice is load-bearing and is documented by the author, so the twin is a valid control, but a future edit swapping the example path for one without an embedded verb word would silently unbind the removal. Worth a comment at the twin pinning why this path was chosen.

### `check 6: embedded letters stay green` — proves the conjunction, not each guard

Sentence `The anecdote about the test is noted.` verified: no `never`/`token` exemption word, so the exemption at `:259` is not what keeps it green; the only candidate is the boundary guard pair. Mutation G5both (both guards deleted) turns it red (65/1), so the guard pair as a whole is bound.

Single sides are not: G3lead (leading guard deleted) stays 66/66 green and G4trail (trailing guard deleted) stays 66/66 green, because the surviving guard still blocks the letters-both-sides case. The twin therefore proves `leading AND trailing` but neither disjunct. This is the round-1 defect class (one twin for a conjunction) in miniature. Two further greens would bind each side: leading-only-adjacent (letter on the left, boundary on the right) and trailing-only-adjacent (boundary on the left, letter on the right). Without them the suite still passes on either one-sided deletion.

### `pointers: short phrase ignored stays green` — does not prove what section 4 claims

`RESULT2.md` section 4 says the short spaced phrase (`*wrong words here*`, 16 inner chars) distinguishes the length requirement from the space requirement. It cannot: the phrase fails the `{20,}` collection pattern at `:340-341` before the `:342` filter is ever reached, so it is ignored for length regardless of spacing. Removing the space arm (L5sp) still turns this twin red (63/3), but only incidentally: every pointer vehicle embeds long spaceless backticked paths from the base brief (`scripts/...`, 20+ chars, no space), which the space filter normally ignores and which become collected failures once the filter leaves. The space arm IS bound (L5sp caught), but by accidental base-brief content, not by the short-phrase design. A base brief with short paths would silently unbind it. The length threshold itself has slack (L6thr miss): live phrases (~29) and the short phrase (16) leave the boundary free to move between 17 and 29.

## 3. The four could-not-bind claims — real limit or unbuilt fixture

### 3.1 Authority prefix versus full equality — unbuilt, not a real limit

`scripts/brief-lint.mjs:138` implements 7-char prefix equality. A3full (full `===`) stays 66/66 green, confirming no current twin distinguishes them. But the claim that no same-prefix-different-sha pair exists to cite is true only for full-vs-full. The linter accepts 7-40 hex chars (`:133`), and the authority argument is a free CLI string. Short-argument vehicle, verified by direct run in this copy: base brief with full HEAD sha, run once with the full sha argument (authority PASS, status 0) and once with its 7-char prefix argument (authority PASS under prefix logic, status 0; would FAIL under full `===`). No history is invented; the pair is full-vs-prefix of one existing object. The suite lacks this twin, so the mutation survives. The standing principle quoted (inventing a collision would manufacture the domain) is sound in general and correctly refuses a synthetic collision hunt, but it does not apply here because no invention is needed. Verdict: convenient, not sound as applied. Buildable vehicle as above; the review-name/review-numbered style (one green pair differing only in the argument) is the template.

Reachability versus equality, by contrast, IS bound (A1 via `authority: same unreachable sha refuses`, A2 via `authority: mismatched reachable sha refuses`), so only the prefix-vs-full slice is unbound.

### 3.2 Pointer six-line window and `git `-prefix exclusion — unbuilt, honestly disclosed

Both confirmed unbound (L3win and L4git stay 66/66 green) and both buildable, as the author states. This is disclosure, not excuse, unlike round 1. Vehicles precise enough to build:

- Window: one wrong italic phrase of 20+ chars with a space (e.g. the existing `*Stage 0 ships first and lonely*`) placed at lead distance 6 versus 7. Construction: pointer line at index `at`; phrase line at `at-6` with five filler lines between (phrase inside `lines.slice(at-6,at)`) versus phrase at `at-7` with six fillers (outside). Under the 6-line window the first refuses and the second stays green by design; under a 3-line window the first turns green, so the pair binds the window.
- Prefix exclusion: one long spaced backticked phrase beginning with `git ` and absent from the blob (e.g. `` `git status shows nothing here yet today` ``, ~39 chars, contains spaces, starts with `git `) placed immediately above a live pointer. Under correct it is ignored (stays green); without the `:342` exclusion it is collected and absent, turning red. That green binds the exclusion.

### 3.3 Quotes `blob.length > 0` versus the missing-task-file case — real limit, with a redundancy note

B3 stays 66/66 green, confirming unbound. No resolving empty task blob exists in this tree to cite, and minting an empty-commit history to create one would manufacture the world, so the limit claim is honest. Note the check is also largely redundant: an empty blob cannot include any non-empty quote core, so any quoted vehicle over an empty blob already FAILs via `bad >= 1` with or without the length conjunct. The conjunct only changes the empty-quote edge (a `>` block whose normalised core is empty, where `blob.includes('')` holds vacuously). No such fixture exists and none is needed. Verdict: real limit of the tree; keep the conjunct as defence in depth, do not invent a fixture for it.

### 3.4 Files `n > 0` — unbuilt, not a real limit

D4 stays 66/66 green, confirming unbound. Vehicle is trivial and needs no invention: `## Files` header (or `Work only in:`) followed by zero bullet lines, then the next section. Under `n > 0 && bad === 0` (`:200`) this FAILs (`0 files`); under `bad === 0` alone it PASSes. The author discloses it as noted-not-proven rather than claiming coverage, which is honest reporting, but the `malformed, no brief attempted` framing understates it: an empty scope block is one deleted line from the existing green vehicle, not a contrivance. Verdict: unbuilt fixture, buildable in one line.

On the asymmetry principle: sound as a general rule (do not manufacture the domain to prove the guard), correctly applied in 3.3, misapplied in 3.1, inapplicable in 3.4.

## 4. Findings, each with file and line

All lines are `scripts/brief-lint.mjs` in this copy (byte-identical to round 1 per the brief).

- `:133` authority sha length lower bound `{7,40}` unbound (A4a). No 7-char authority twin.
- `:138` prefix (7-char either-side) versus full equality unbound (A3full). Missing short-argument twin; see 3.1.
- `:157` trailing `...` strip unbound (B2). Only the leading strip has a twin (`quotes: ellipsis prefix stays green`).
- `:160` `blob.length > 0` unbound (B3). Real limit with redundancy; see 3.3.
- `:58` `norm` trailing/leading trim unbound (B6trim). No padded-quote twin.
- `:171` third instrument alternation `what enforces` unbound (C2). Only the first two forms have green twins.
- `:171` instrument sentence filter case-insensitivity unbound (C5i). No upper-case twin.
- `:171` sentences-vs-lines for instruments unbound (C6lines). No wrap-split delegation twin.
- `:174` non-`mjs` instrument extensions unbound (C4). All fixtures use `.mjs`.
- `:194` hyphen bullet-reason arm unbound (D5). All fixtures use the em dash.
- `:200` empty scope block `n > 0` unbound (D4). Missing zero-bullet red; see 3.4.
- `:223` `change|changes` verb arm unbound (E2chg). Only `Edit`/`Rewrite`/`Modify` have red twins.
- `:223` `delete from` verb arm unbound (E3del). No twin uses it (same holds for the other untested verbs `add to|append to|write to|replace in|re-?pin`; each sampled arm survives, so the list as a whole is one-verb deep).
- `:224` `reserved` prohibition arm unbound (E5res). Only `Do not` is proven green (same holds for the other untested arms `must not|may not|forbidden|out of scope|read-only|READ|leave|without editing`; sampled arm survives).
- `:238` permitted-suffix allowance unbound (E7sfx). No suffix twin.
- `:225` cited-path global flag crash-binds (E9nog): removal throws in `matchAll`, so the flag is load-bearing for execution, but multi-path-in-one-sentence (loop over all vs first only) has no twin. Needs a sentence with two stray paths refusing.
- `:250` `once` case-insensitivity unbound (F3i). No upper-case twin.
- `:250` exemption case-insensitivity unbound (F4e). All fixtures lower-case.
- `:250` `once` word boundaries unbound (F5b). No embedded-`once` green.
- `:250` sentences-vs-lines for once unbound (F6lines). No wrap-split twin.
- `:259` leading-only and trailing-only boundary deletions unbound (G3lead, G4trail). The `anecdote` green proves the conjunction only; see section 2.
- `:259` hyphen in the boundary class unbound (G7hy). No hyphen-adjacent twin.
- `:259` physical-lines-vs-sentences for this check unbound (G8sent). No wrapping twin.
- `:265` sweep case-insensitivity unbound (H2i). No upper-case sweep twin (contrast the upper-case twin that binds this check's first pattern).
- `:264` `every`-distance `{0,60}` boundary unbound (H4dist). No 60-char boundary twin.
- `:264` `class` word boundaries unbound (H6b). No embedded-`class` twin.
- `:274` own-lines quote exclusion for report names unbound (I3own). No quoted-only bare-name green, despite the comment at `:269-271` stating the exclusion exists for exactly that case.
- `:276` `RESULT` zero-digits acceptance (`\\d*` vs `\\d+`) unbound (I4star). Bare still refused via `!bare`, so no colour change; needs a twin asserting `numbered=false` for the bare form.
- `:294` same zero-digits issue for `REVIEW` (J2star). Same remedy in the review branch.
- `:338` pointer six-line window unbound (L3win). Buildable; see 3.2.
- `:342` `git `-prefix exclusion unbound (L4git). Buildable; see 3.2.
- `:340-341` phrase-length threshold slack (L6thr). Boundary free between 17 and 29; needs an exactly-20-char phrase pair.
- `:122` diff `++`/`--` header exclusion unbound (K5diff). All packet diffs use single-`+` lines.
- `:111` sentence split on `;` unbound (Nsplit). No semicolon-split delegation/qualifier twin.

Bound and worth recording so the next sweep does not re-prove them: reachability vs equality split (`:139`, A1/A2), cited-path removal (`:233`, E8norem), both-guards-together (`:259`, G5both), exemption case-insensitivity (`:259`, G6exi), `enforces` second arm (`:171`, C1enf), once exemption arms (`:250`, F1att/F1iter), numbered arm (`:297`, I2num), pointer space arm (`:342`, L5sp, bound incidentally via base paths — see section 2).

## 5. What I could not determine

- Whether any resolving empty task blob exists anywhere in history (would settle 3.3 as citable rather than manufactured). Searched only the working tree and the authority sha, not full history.
- Whether the coordinator would accept a short-sha authority argument as a valid twin (3.1). The linter accepts 7-40 chars and `git show` resolves short shas, and the direct run above PASSes, but the suite convention has always passed full shas.
- Whether packet trivial distinctions (`reportIdx > 0` vs `>= 0`, `diffIdx > reportIdx` vs `>=`) matter. No fixture places a marker at index 0 or both markers on one line, so those mutations survive, but they are degenerate inputs rather than meaningful checks; not counted among the findings above.
- Whether `SHOW` sha length `{7,40}` (`:320`) short forms resolve in `git show` the same way authority shorts do. Not mutated beyond the authority analogue.

## 6. Blocked or refused calls

None. No command was blocked or refused. No credential was handled or printed. Ran only `node --test` on the test file, direct `node scripts/brief-lint.mjs` runs via a temp helper for the short-argument check, and temp mutation/runner helpers under the OS temp area. No `npm install`, `npm test`, build, `verify-*`, Pulse, or Desk.
