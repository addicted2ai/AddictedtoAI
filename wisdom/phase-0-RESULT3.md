> **PROVENANCE.** Round 3's author report and the close of Phase 0. Thirteen
> binds (66 to 79 tests), ONE deletion whose blast radius was measured as zero,
> and twenty-three records each carrying an owner and an expiry date.
>
> **THE RECORDS ARE THE OPEN EDGE, AND SAYING SO IS PART OF THE RECORD.** They
> live in this file, and a file is not a mechanism: nothing reads those expiry
> dates. Converting them into a check that refuses when an expiry has passed is
> filed work, not an assumption — until it exists, twenty-three dispositions are
> better-documented prose, not yet firing.

---

# WISDOM PHASE 0 ROUND 3 — RESULT3

Local date: 2026-09-10.

Authority: two-desks-work-orders-and-trains@a5e873b.

The round-2 sealed review returned `revise` with 46 attempted mutations, 34 of which left the suite 66/66 green. Three misses and one catch were re-applied independently and corroborated. This round is a disposition round: every arm gets BIND, DELETE, or RECORD, and the sweep terminates when every arm has a disposition, not when every arm has a test.

Note on naming in this report: the check at `scripts/brief-lint.mjs:259` is named only as check 6 and its twins are matched only on the tail `outside a prohibition line`. The guarded forms in the test file are assembled at runtime from character codes 99, 100 and 67, 68. This report never reproduces the guard line.

## 1. The two corrections owed to RESULT2 section 4

CORRECTION 1 — the short spaced phrase does not distinguish length from space. RESULT2 section 4 says the short spaced phrase (`*wrong words here*`, 16 inner chars, with a space) distinguishes the length requirement from the space requirement. It cannot. The phrase fails the `{20,}` collection pattern at `:340-341` before the `:342` filter is ever reached, so it is ignored for length regardless of spacing. Removing the space arm still turns that twin red, but only incidentally: every pointer vehicle embeds long backticked `scripts/...` paths with no space, which the space filter normally ignores and which become collected failures the moment it leaves. The space arm IS bound, but by accidental base-brief content, not by the short-phrase design. A base brief with short paths would silently unbind it. This round builds a deliberate control that binds the space arm on purpose (see section 3, spaceless long phrase with isolation fillers) and pins the length threshold at twenty with a 20/19 pair (see section 3). The length threshold had slack in both directions and moved freely between 17 and 29 without any fixture noticing; the new pair ends that.

CORRECTION 2 — the fragile cited-path control is now pinned. `scope: cited path without verb stays green` does control its property (mutation E8norem, no cited-path removal before the verb test, turns it red, 65/1 in round 2 and re-verified here in design). It controls it only because the example path `openspec/changes/two-desks-work-orders-and-trains/tasks.md` carries the word `changes` inside it, which is in EDIT_VERB at `:223`. Had the example cited `loop/run.mjs` (no verb-list word inside), the sentence would stay green with or without the removal and the twin would prove nothing. The choice is load-bearing. A comment now sits at the twin saying so, naming the word and the list, so a future edit swapping the example path for one without such a word cannot take the control away by accident.

The last line of RESULT2.md now points here. Both halves are done so the refuted claim cannot outlive its correction.

## 2. THE DISPOSITION TABLE — every arm in REVIEW1 section 4, plus any I found

| file:line | arm | BIND / DELETE / RECORD | evidence, or owner + expiry |
|---|---|---|---|
| scripts/brief-lint.mjs:138 | prefix (7-char either-side) versus full equality (A3full) | BIND | `authority: short argument stays green` + full `===` mutation turns it red (77 pass, 2 fail) |
| scripts/brief-lint.mjs:133 | authority sha length lower bound `{7,40}` (A4a) | BIND | `authority: seven-char sha stays green` + `{7,40}` to `{8,40}` mutation turns it red (78 pass, 1 fail) |
| scripts/brief-lint.mjs:200 | empty scope block `n > 0` (D4) | BIND | `files: empty scope block refuses` + `n > 0 &&` removal turns it green (78 pass, 1 fail) |
| scripts/brief-lint.mjs:274 | own-lines quote exclusion for report names (I3own) | BIND | `result name: quoted-only bare stays green` + filter removal turns it red with numbered=true bare=true (78 pass, 1 fail) |
| scripts/brief-lint.mjs:225 | cited-path global flag, property not crash (E9nog) | BIND | `scope: two paths one sentence second stray refuses` (first permitted, second stray) + first-only mutation turns it green (78 pass, 1 fail) |
| scripts/brief-lint.mjs:259 | leading boundary guard alone (G3lead) | BIND | `check 6: leading-adjacent stays green` (letter left, boundary right) + leading-guard-only deletion turns it red (78 pass, 1 fail) |
| scripts/brief-lint.mjs:259 | trailing boundary guard alone (G4trail) | BIND | `check 6: trailing-adjacent stays green` (boundary left, letter right) + trailing-guard-only deletion turns it red (78 pass, 1 fail) |
| scripts/brief-lint.mjs:338 | pointer six-line window `at - 6` (L3win) | BIND | `pointers: distant phrase at six refuses` (inside 6, outside 3) + `at - 6` to `at - 3` mutation turns it green; `at seven stays green` shows outside by design (78 pass, 1 fail) |
| scripts/brief-lint.mjs:342 | `git `-prefix exclusion (L4git) | BIND | `pointers: git-prefixed phrase ignored stays green` (live plus long spaced backticked phrase beginning with `git `, isolated by fillers) + exclusion deletion turns it red with its own phrase (78 pass, 1 fail) |
| scripts/brief-lint.mjs:342 | space filter, deliberate control (floor 7; REVIEW1 section 2 fragile) | BIND | `pointers: spaceless long phrase ignored stays green` (base pushed outside window, only long spaceless phrase in range is the control) + space-filter deletion turns it red with `scripts/does-not-exist-xyz.mjs` (74 pass, 5 fail; deliberate fails on its own phrase, rest on base paths) |
| scripts/brief-lint.mjs:340-341 | phrase-length threshold `{20,}` (L6thr) | BIND | `pointers: twenty-char absent refuses` (20 with space, absent, red) + `{20,}` to `{21,}` turns it green; `pointers: nineteen-char absent stays green` (19 with space, absent, green) + `{20,}` to `{19,}` turns it red with its own phrase (each 78 pass, 1 fail; pair pins boundary at twenty) |
| scripts/brief-lint.mjs:171 | third instrument alternation `what enforces` (C2) | DELETE | redundant with `enforces` (every `what enforces` sentence already carries `enforces`); removal leaves suite 79/79 green; no test bound, so none removed; nothing changes colour (see section 4) |
| scripts/brief-lint.mjs:157 | trailing `...` strip (B2) | RECORD | orchestrator, 2026-10-10 — trailing ellipsis rare but symmetric with bound leading strip; removing would newly refuse trailing-ellipsis quotes (tightening), not decoration |
| scripts/brief-lint.mjs:160 | `blob.length > 0` (B3) | RECORD | orchestrator, 2026-12-01 — real limit of the tree (no resolving empty task blob to cite without manufacturing history) with redundancy note (empty blob already fails via `bad >= 1` except empty-quote edge); keep as defence in depth |
| scripts/brief-lint.mjs:58 | `norm` trim (B6trim) | RECORD | orchestrator, 2026-10-10 — padded quotes never appear in fixtures but trim is hygiene; removing would newly refuse padded quotes (tightening), not decoration |
| scripts/brief-lint.mjs:171 | instrument sentence filter case-insensitivity (C5i) | RECORD | orchestrator, 2026-10-10 — all fixtures lower-case but upper-case enforcement sentences are plausible; removing `i` would loosen (upper-case would pass uncaught) |
| scripts/brief-lint.mjs:171 | sentences-vs-lines for instruments (C6lines) | RECORD | orchestrator, 2026-10-10 — wrap-split delegation (claim on one line, delegation on next) never appears in fixtures but wrapping is real; changing prose to lines would alter the prose model, not decoration |
| scripts/brief-lint.mjs:174 | non-`mjs` instrument extensions (C4) | RECORD | orchestrator, 2026-10-10 — fixtures use `.mjs` only but `.sh`/`.ps1`/`.js` instruments exist in principle; narrowing to `mjs` only would newly refuse them (tightening loosens nothing) |
| scripts/brief-lint.mjs:194 | hyphen bullet-reason arm (D5) | RECORD | orchestrator, 2026-10-10 — fixtures use the em dash but hyphen `-` is the ASCII fallback real briefs may use; removing would newly refuse hyphen bullets (tightening) |
| scripts/brief-lint.mjs:223 | `change\|changes` verb arm (E2chg) | RECORD | orchestrator, 2026-10-10 — only `Edit`/`Rewrite`/`Modify` have red twins but `Change`/`Changes` strays are plausible; removing would loosen (such strays would pass) |
| scripts/brief-lint.mjs:223 | `delete from` verb arm plus other untested verbs `add to\|append to\|write to\|replace in\|re-?pin` (E3del) | RECORD | orchestrator, 2026-10-10 — sampled arm survives, list as a whole is one-verb deep; each names a plausible stray; removing any would loosen |
| scripts/brief-lint.mjs:224 | `reserved` prohibition arm plus other untested arms `must not\|may not\|forbidden\|out of scope\|read-only\|READ\|leave\|without editing` (E5res) | RECORD | orchestrator, 2026-10-10 — only `Do not` is proven green; sampled arm survives; each names a plausible prohibition; removing would newly refuse such sparing (tightening) |
| scripts/brief-lint.mjs:238 | permitted-suffix allowance `q.endsWith(p) \|\| p.endsWith(q)` (E7sfx) | RECORD | orchestrator, 2026-10-10 — fixtures are exact or fully distinct but short/long path forms (suffix of permitted) are plausible; removing to exact `q === p` would newly refuse suffix cites (tightening) |
| scripts/brief-lint.mjs:250 | `once` case-insensitivity (F3i) | RECORD | orchestrator, 2026-10-10 — no upper-case `ONCE` twin but upper-case emphasis is plausible; removing `i` would loosen |
| scripts/brief-lint.mjs:250 | exemption case-insensitivity `iteration\|attempt` (F4e) | RECORD | orchestrator, 2026-10-10 — fixtures lower-case only; upper-case exemption plausible; removing `i` would loosen (upper-case exemption would refuse) |
| scripts/brief-lint.mjs:250 | `once` word boundaries (F5b) | RECORD | orchestrator, 2026-10-10 — no embedded-`once` green (e.g. letter-adjacent form); removing boundaries would newly refuse embedded forms that should stay green (tightening with false positives) |
| scripts/brief-lint.mjs:250 | sentences-vs-lines for once (F6lines) | RECORD | orchestrator, 2026-10-10 — wrap-split qualifier (`once` and qualifier on different physical lines) never appears but wrapping is real; changing prose to lines alters model |
| scripts/brief-lint.mjs:259 | hyphen in the boundary class (G7hy) | RECORD | orchestrator, 2026-10-10 — no hyphen-adjacent twin; hyphen handling (part of word vs boundary) is subtle; removing hyphen from class would flip hyphen-adjacent outcomes (tightening/loosening by case), not decoration |
| scripts/brief-lint.mjs:259 | physical-lines-vs-sentences for check 6 (G8sent) | RECORD | orchestrator, 2026-10-10 — no wrapping twin for this check; sentence normalisation vs physical lines matters where wrapping splits the token context; changing alters model |
| scripts/brief-lint.mjs:265 | sweep case-insensitivity (H2i) | RECORD | orchestrator, 2026-10-10 — fixtures lower-case; upper-case sweep plausible; removing `i` would loosen |
| scripts/brief-lint.mjs:264 | `every`-distance `{0,60}` boundary (H4dist) | RECORD | orchestrator, 2026-10-10 — no 60-char boundary twin; exact-distance vehicle fiddly (counting 60 chars between); low risk, revisit by expiry |
| scripts/brief-lint.mjs:264 | `class` word boundaries (H6b) | RECORD | orchestrator, 2026-10-10 — no embedded-`class` twin (e.g. `subclass` not satisfying the arm); removing boundaries would newly treat embedded as satisfying (loosening) |
| scripts/brief-lint.mjs:276 | RESULT zero-digits acceptance (I4star) | RECORD | orchestrator, 2026-10-10 — bare still refused via `!bare`, so `\\d*` vs `\\d+` has no colour change; needs a twin asserting `numbered=false` for the bare form, not just status; low risk, revisit |
| scripts/brief-lint.mjs:294 | REVIEW zero-digits acceptance (J2star) | RECORD | orchestrator, 2026-10-10 — same as above in the review branch (`!bareReview` still refuses); needs detail assertion; low risk |
| scripts/brief-lint.mjs:122 | diff `++`/`--` header exclusion `^[+-][^+-]` (K5diff) | RECORD | orchestrator, 2026-10-10 — packet diffs use single-`+` lines but real diffs carry `+++`/`---` headers; removing exclusion would count headers as changed (loosening thin diffs to green) |
| scripts/brief-lint.mjs:111 | sentence split on `;` (Nsplit) | RECORD | orchestrator, 2026-10-10 — no semicolon-split delegation/qualifier twin; `;` does split sentences in real prose; dropping `;` would join across it and alter delegation/qualifier scope |

Section 2 is the acceptance criterion. Every arm in REVIEW1 section 4 appears above (leading and trailing as separate rows). The space deliberate control (floor 7, REVIEW1 section 2 fragile) is the extra row this round found and bound.

## 3. Binds — vehicle, twin, and the mutation that proves the twin must fire

Each row was applied, run, recorded, then restored from the work copy under the OS temp area and confirmed green again (79 pass, 0 fail after every restore). Restores verified by copy plus full green run; final hash matches the work copy. Before in every row is the work state (79 tests). Digest identical means the post-restore hash equals the work hash.

| check | mutation | before | mutated | restored | digest identical |
|---|---|---|---|---|---|
| :138 prefix equality | prefix logic to full `===` (`auth[2] === authority`) | 79 pass, 0 fail | 77 pass, 2 fail (`authority: short argument stays green`, `authority: seven-char sha stays green` both turn red) | 79 pass, 0 fail, green again | yes |
| :133 sha lower bound | `{7,40}` to `{8,40}` on the `auth` line only | 79 pass, 0 fail | 78 pass, 1 fail (`authority: seven-char sha stays green` turns red with no authority line; short-argument stays green, proving the split) | 79 pass, 0 fail, green again | yes |
| :200 empty scope | `n > 0 && bad === 0` to `bad === 0` | 79 pass, 0 fail | 78 pass, 1 fail (`files: empty scope block refuses` turns green with 0 files, so its assert on status 1 fails) | 79 pass, 0 fail, green again | yes |
| :274 quote exclusion | `proseLines.filter(...)` to `proseLines` (include quotes in own lines) | 79 pass, 0 fail | 78 pass, 1 fail (`result name: quoted-only bare stays green` turns red with numbered=true bare=true) | 79 pass, 0 fail, green again | yes |
| :225 all-paths property | `for (const c of s.matchAll(CITE))` to `for (const c of [...s.matchAll(CITE)].slice(0, 1))` (first only; dropping `g` alone throws and proves only the crash) | 79 pass, 0 fail | 78 pass, 1 fail (`scope: two paths one sentence second stray refuses` with first permitted and second stray turns green, so its assert fails) | 79 pass, 0 fail, green again | yes |
| :259 leading guard | delete the leading boundary guard only | 79 pass, 0 fail | 78 pass, 1 fail (`check 6: leading-adjacent stays green` with letter left and boundary right turns red; trailing-adjacent stays green, proving the split) | 79 pass, 0 fail, green again | yes |
| :259 trailing guard | delete the trailing boundary guard only | 79 pass, 0 fail | 78 pass, 1 fail (`check 6: trailing-adjacent stays green` with boundary left and letter right turns red; leading-adjacent stays green) | 79 pass, 0 fail, green again | yes |
| :338 six-line window | `at - 6` to `at - 3` | 79 pass, 0 fail | 78 pass, 1 fail (`pointers: distant phrase at six refuses` at distance 6 turns green; `at seven stays green` stays green, showing outside by design) | 79 pass, 0 fail, green again | yes |
| :342 `git ` exclusion | delete `&& !p.startsWith('git ')` (keep space requirement) | 79 pass, 0 fail | 78 pass, 1 fail (`pointers: git-prefixed phrase ignored stays green` turns red with its own `git status shows nothing here yet today` phrase) | 79 pass, 0 fail, green again | yes |
| :342 space filter, deliberate | delete `p.includes(' ') &&` (keep `!p.startsWith('git ')`) | 79 pass, 0 fail | 74 pass, 5 fail (deliberate `pointers: spaceless long phrase ignored stays green` turns red with its own `scripts/does-not-exist-xyz.mjs`; three older pointer greens plus the nineteen-char green turn red incidentally via base `scripts/run-tests.mjs`, which is the accidental binding documented in section 1) | 79 pass, 0 fail, green again | yes |
| :340-341 length 20 | `{20,}` to `{21,}` on both phrase patterns | 79 pass, 0 fail | 78 pass, 1 fail (`pointers: twenty-char absent refuses` with exactly 20 inner chars and a space turns green) | 79 pass, 0 fail, green again | yes |
| :340-341 length 19 | `{20,}` to `{19,}` on both phrase patterns | 79 pass, 0 fail | 78 pass, 1 fail (`pointers: nineteen-char absent stays green` with 19 inner chars turns red with its own `aaaaaaaaa bbbbbbbbb` phrase) | 79 pass, 0 fail, green again | yes |

Vehicles (all pass unmutated, all fixtures under the OS temp area, one fresh area per trial, removed after):

- Short argument: base brief with full HEAD, run with 7-char prefix argument. Under prefix logic both PASS; under full `===` the short run FAILs on authority.
- Seven-char sha: base brief with 7-char prefix in the authority line, run with full HEAD argument. Reachable via short form, prefix-equal, so PASS; under `{8,40}` the authority line no longer matches and FAILs.
- Empty scope: `## Files` header with zero bullets then `## Next`. Under `n > 0` FAILs with 0 files; under `bad === 0` alone PASSes.
- Quoted-only bare: base plus `> **WITHDRAWN as above. Every Stage 0 packet's RESULT.md carries a MUTATION TABLE (from packet B1` (verbatim against the tasks blob at the authority sha, so quotes PASS 1/1). Bare appears only inside the quote, so own-lines exclusion keeps `numbered=true bare=false` and PASSes; without exclusion `bare=true` and FAILs.
- Two paths one sentence: `Edit `scripts/run-tests.mjs` and `loop/run.mjs` to fix the bug.` First path permitted (in Files), second stray. Under all-paths FAILs naming the second; under first-only PASSes.
- Leading-adjacent: letter on the left and boundary on the right (assembled at runtime). Trailing-adjacent is the mirror. The existing both-sides green proves the conjunction only; each new green proves one side.
- Distant six: wrong italic phrase of 20+ chars with a space (`*Stage 0 ships first and lonely*`, absent) at lead distance 6 (five filler lines between phrase and pointer). Inside the 6-line window it refuses; under a 3-line window it is outside and stays green. Distant seven (six fillers, distance 7) stays green by design under both.
- Git-prefixed: live italic present phrase plus long spaced backticked phrase beginning with `git ` and absent (`` `git status shows nothing here yet today` ``, 39 inner chars), isolated from the base by four fillers so the six-line window holds only the two new phrases. Under correct ignored and green; without the exclusion collected and red.
- Spaceless deliberate: live italic present phrase plus long spaceless backticked phrase absent (`` `scripts/does-not-exist-xyz.mjs` ``, 30 inner chars, no space), isolated the same way so the base cannot contribute. Under correct ignored for spacing and green; without the space filter collected and red on its own phrase.
- Twenty-char: `*aaaaaaaaaa bbbbbbbbb*` (10 + 1 + 9 = 20 inner chars with a space, absent) before a live pointer refuses; under 21 ignored and green. Nineteen-char `*aaaaaaaaa bbbbbbbbb*` (9 + 1 + 9 = 19, absent) stays green; under 19 collected and red. Together they pin the boundary at twenty. Both use `a`/`b` only so no longer word can smuggle the guarded token inside.

## 4. Deletions — what I removed, what now passes that did not before

| arm removed | tests removed with it | what now passes that did not |
|---|---|---|
| `:171` third instrument alternation `\|what enforces` (pattern is now `/enforced by\|enforces/i`) | none — no test was ever bound to it, which is why it is decoration | nothing — the arm is strictly redundant: every sentence carrying `what enforces` already carries `enforces`, so the second arm already matches it. Verified by direct run: `What enforces the property in `scripts/run-tests.mjs` is the suite.` stays green before and after the deletion, and the full suite stays 79/79 green after. A deletion whose blast radius was never measured would be hope; this one was measured and is zero because there is nothing for it to catch that the surviving arm does not already catch. |

No other arm was deleted. Every other unbound arm guards a plausible real brief (upper-case, hyphen fallback, other verbs and prohibitions, suffix forms, embedded forms, wrap splits, distance boundaries, diff headers, semicolon splits) or is structural (sentences vs lines, window, filters). Deleting any of those would loosen a catcher (more strays pass) or tighten an allowance (more false refuses), not remove decoration. Those judgements are recorded in section 5 with owner and expiry rather than silently widened.

## 4b. THE COUNT — passing tests before, passing tests after, difference

- Before: `node --test` on `scripts/brief-lint.test.mjs` reports 66 tests, 66 pass, 0 fail.
- After: `node --test` on the same file reports 79 tests, 79 pass, 0 fail.
- Difference: +13 passing tests (13 new twins added: short argument, seven-char sha, empty scope, quoted-only bare, two-paths second-stray, leading-adjacent, trailing-adjacent, distant six, distant seven, git-prefixed, spaceless deliberate, twenty-char, nineteen-char).
- Deleted tests: none. The one deleted arm (`what enforces`) had no bound test, so no test left with it. Stating this plainly because the gate harness carries a ratchet on the passing-test number: a correct deletion that removed bound tests would lower the count legitimately and look like a broken collection. Here the count rises by exactly the binds and falls by nothing, so no exception line for removed tests is needed beyond this paragraph.

## 5. Records — each with a named owner and a date it expires

Owner is the orchestrator throughout unless noted; expiry is the date by which the judgement must be re-swept (a recorded judgement with an owner and a date is a disposition; an unowned note is not). DELETE was considered for each and rejected for the reason given; loosening a check to make a fixture pass was never done.

- B2 trailing `...` strip (`:157`): orchestrator, expires 2026-10-10. Only the leading strip has a twin. Trailing ellipsis (`> ... core`, `> core ...`) is symmetric and appears in real quoting (omission at either end). Removing the trailing strip would newly refuse trailing-ellipsis quotes that should stay green. Keep, revisit with a trailing-ellipsis twin if quoting style drifts.
- B3 `blob.length > 0` (`:160`): orchestrator, expires 2026-12-01. Real limit of the tree: no resolving empty task blob exists to cite without manufacturing history, and minting an empty-commit history would manufacture the world. Largely redundant (empty blob already fails via `bad >= 1` except the empty-quote edge where `blob.includes('')` holds vacuously). Keep as defence in depth; do not invent a fixture.
- B6trim `norm` trim (`:58`): orchestrator, expires 2026-10-10. All verbatim fixtures are already trimmed. Padded quotes (leading/trailing spaces that normalise away) are plausible paste artifacts. Removing trim would newly refuse them. Keep.
- C5i instrument case-insensitivity (`:171`): orchestrator, expires 2026-10-10. All fixtures lower-case. Upper-case enforcement sentences (`ENFORCED BY ...`) are plausible in headers and emphasis. Removing `i` would loosen (upper-case would pass uncaught). Keep.
- C6lines sentences-vs-lines for instruments (`:171`): orchestrator, expires 2026-10-10. All delegation fixtures are single-line. Delegation split across physical lines but one sentence (claim on one line, `find them and run them` on the next) is the wrapping defect already fixed once for this check; the sentence model is load-bearing. Changing prose to lines would reintroduce it. Keep.
- C4 non-`mjs` extensions (`:174`): orchestrator, expires 2026-10-10. Fixtures use `.mjs` only. Enforcement claims naming existing non-`mjs` instruments (`.sh`, `.ps1`, `.js`) are plausible as the tree grows. Narrowing to `mjs` only would newly refuse them. Keep.
- D5 hyphen bullet-reason (`:194`): orchestrator, expires 2026-10-10. Fixtures use the em dash. Hyphen `-` is the ASCII fallback real briefs may type. Removing the hyphen arm would newly refuse hyphen bullets. Keep.
- E2chg `change\|changes` verb (`:223`): orchestrator, expires 2026-10-10. Only `Edit`/`Rewrite`/`Modify` have red twins. `Change ...` / `Changes ...` strays outside Files scope are plausible directives. Removing would loosen. Keep.
- E3del `delete from` plus untested verbs (`:223`): orchestrator, expires 2026-10-10. No twin uses `Delete ... from ...` (same holds for `add to\|append to\|write to\|replace in\|re-?pin`; each sampled arm survives, so the list as a whole is one-verb deep). Each names a plausible stray. Removing any would loosen. Keep; next sweep should sample another verb rather than all.
- E5res `reserved` plus untested prohibitions (`:224`): orchestrator, expires 2026-10-10. Only `Do not` is proven green (same holds for `must not\|may not\|forbidden\|out of scope\|read-only\|READ\|leave\|without editing`; sampled arm survives). Each names a plausible prohibition sparing a stray. Removing would newly refuse such sparing. Keep; next sweep should sample another arm.
- E7sfx suffix allowance (`:238`): orchestrator, expires 2026-10-10. Fixtures are exact or fully distinct. Cited short path that is a suffix of a permitted long path (or vice versa) staying green is plausible (short cites of long permitted paths). Exact `q === p` would newly refuse them. Keep.
- F3i `once` case-insensitivity (`:250`): orchestrator, expires 2026-10-10. No upper-case `ONCE` twin. Upper-case emphasis plausible. Removing `i` would loosen. Keep.
- F4e exemption case-insensitivity (`:250`): orchestrator, expires 2026-10-10. Fixtures lower-case. Upper-case exemption (`ITERATION`/`ATTEMPT`) plausible. Removing `i` would loosen (upper-case exemption would refuse). Keep.
- F5b `once` boundaries (`:250`): orchestrator, expires 2026-10-10. No embedded-`once` green (letter-adjacent form). Removing boundaries would newly refuse embedded forms that should stay green. Keep.
- F6lines sentences-vs-lines for once (`:250`): orchestrator, expires 2026-10-10. No wrap-split twin (`once` and qualifier on different physical lines). Wrapping is real; sentence model already fixed for this check. Keep.
- G7hy hyphen in boundary class (`:259`): orchestrator, expires 2026-10-10. No hyphen-adjacent twin. Hyphen as part of word vs boundary is subtle; dropping hyphen from the class flips hyphen-adjacent outcomes. Keep.
- G8sent lines-vs-sentences for check 6 (`:259`): orchestrator, expires 2026-10-10. No wrapping twin for this check. Sentence normalisation vs physical lines matters where wrapping splits token context. Keep.
- H2i sweep case-insensitivity (`:265`): orchestrator, expires 2026-10-10. No upper-case sweep twin (contrast the upper-case twin that binds the first pattern of check 6). Upper-case sweep plausible. Removing `i` would loosen. Keep.
- H4dist `every`-distance `{0,60}` (`:264`): orchestrator, expires 2026-10-10. No 60-char boundary twin (`every ... in this file` with exactly 60 chars between). Counting an exact 60-char gap is fiddly and low risk. Keep; boundary twin if the distance ever matters.
- H6b `class` boundaries (`:264`): orchestrator, expires 2026-10-10. No embedded-`class` twin (e.g. `subclass` not satisfying the arm; sweep-only red does not isolate the boundary). Removing boundaries would newly treat embedded as satisfying (loosening). Keep.
- I4star RESULT zero-digits (`:276`): orchestrator, expires 2026-10-10. Bare still refused via `!bare`, so `\\d*` vs `\\d+` has no colour change. Binding needs a twin asserting `numbered=false` for the bare form, not just status. Low risk. Keep.
- J2star REVIEW zero-digits (`:294`): orchestrator, expires 2026-10-10. Same in the review branch via `!bareReview`. Needs detail assertion. Keep.
- K5diff diff headers (`:122`): orchestrator, expires 2026-10-10. Packet diffs use single-`+` lines. Real diffs carry `+++`/`---` headers that must not count as changed lines. Removing the `[^+-]` exclusion would count headers (loosening thin diffs to green). Keep.
- Nsplit sentence split on `;` (`:111`): orchestrator, expires 2026-10-10. No semicolon-split delegation/qualifier twin. `;` does split sentences in real prose. Dropping `;` would join across it and change delegation/qualifier scope. Keep.

## 6. The linter's SHA-256 before and after

Digest here means the SHA-256 of the file bytes: `Get-FileHash -Algorithm SHA256 <path>`, recorded in full. Not `git hash-object`.

- Before: AFC716D431B3D1716126CE6828E3B611CD820D27F52A5A31B73013621FBCC300 (`scripts/brief-lint.mjs` prior to this round).
- After: 7F37BC117266A3B26AF7BAE1DE2950E07B595352DB5AC1E2FB3C3039523F180E (`scripts/brief-lint.mjs` with the `|what enforces` deletion; all mutation trials restored, final hash equals the work copy).

The digest moves this round because of the deletion. The count moves because of the binds (+13, no removals).

## 7. What I could not determine

- Whether any resolving empty task blob exists anywhere in history (would settle B3 as citable rather than manufactured). Searched only the working tree and the authority sha, not full history. Recorded with the longer expiry above.
- Whether the coordinator would accept a short-sha authority argument as a valid twin convention. The linter accepts 7-40 chars and `git show` resolves short shas, and the direct runs above PASS, but the suite convention has always passed full shas. The new short-argument twin makes the convention explicit; coordinator acceptance is above this round.
- Whether packet trivial distinctions (`reportIdx > 0` vs `>= 0`, `diffIdx > reportIdx` vs `>=`) matter. No fixture places a marker at index 0 or both markers on one line; those mutations survive but are degenerate inputs rather than meaningful checks. Not counted among dispositions.
- Whether `SHOW` sha length `{7,40}` (`:320`) short forms resolve in `git show` the same way authority shorts do. Mutated only the authority analogue; the pointer `SHOW` pattern was not mutated beyond the length-threshold and window work.
- Whether hyphen bullets or padded quotes or semicolon-split delegation appear in any real brief outside this worktree. Judged plausible and kept; the expiry dates above are the re-check.

## 8. Anything I learned about the reviewer-side harness, which I did not build

Not built, per scope. Notes for the packet that covers generating controls from a merge-base diff:

- Backticked collection joins the six lead lines with spaces before matching, so two short backticked spans on different lines can pair across lines into a spurious long phrase. Observed directly: a short `RESULT1.md` span pairing with a later `git ...` span across a 40+ char italic sentence, producing a 60+ char collected phrase that is absent and fails a vehicle that should stay green. Isolation fillers that push the base outside the window end the pairing. A harness generating pointer controls must either isolate the window with fillers or forbid short backticked spans inside it; sampling harder without that will manufacture reds that prove the join, not the filter.
- The space filter is bound to the base brief, not to the check, until isolated. A base with short paths silently unbinds it. Generated controls for filters of this shape (ignore-if) should assert, for each, which phrase in range is the one doing the binding, and fail the generation if the answer is incidental base content.
- Colour-only twins miss zero-digits acceptance (`\\d*` vs `\\d+`): both refuse via the bare conjunct, so no status change. A harness that only watches exit status will call that arm bound when it is not. Detail assertions (`numbered=false` for the bare form) are the control.
- The first-only vs all-paths distinction for cited paths needs a first-permitted second-stray sentence in one sentence. A harness that generates single-path strays will never separate a loop over all from a loop over the first. The same holds for the leading/trailing pair: a both-sides green proves the conjunction only; one-sided greens are the controls.

## 9. Blocked or refused calls

None. No command was blocked or refused. No credential was handled or printed. Ran only `node --test` on `scripts/brief-lint.test.mjs`, direct `node scripts/brief-lint.mjs` runs via temp helpers for design probes and the deletion redundancy check, temp mutation helpers under the OS temp area, `Get-FileHash`, `Get-Date`, and `git -C <dir>` reads (`rev-parse`, `cat-file` via the linter, `show`, `status`). No `npm install`, no `npm test`, no build, no `verify-*` script, no Pulse, no Desk. No `git push`, no `gh`, no `bd` write commands, no commits. Every mutation was restored from the work copy before the next, and the suite was green again (79 pass, 0 fail) after every restore. Every date in this report is this machine local date.
