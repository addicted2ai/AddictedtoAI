# THE RECORD EXPIRY CHECK — REVIEW1

Local date: 2026-09-10.

Authority: two-desks-work-orders-and-trains@a5e873b.

## VERDICT
revise

## 0. What enforces the property, and what I ran

The property under review is that no arm of the linter can change behaviour while its record stays green. Nothing in the brief names the enforcer, so I found it: Check A in `scripts/brief-lint-records.test.mjs:310` (`records: every anchor resolves with its expected count`), which counts each anchor substring in `scripts/brief-lint.mjs` and refuses on drift, plus Check E (expiry) and Check S (shape plus count pin at 24).

What I ran, and nothing else except where noted:

- `node --test` on `scripts/brief-lint-records.test.mjs` for the baseline (9 pass, 0 fail) and after every mutation below, restoring between from an untouched copy under the OS temp area and re-running to confirm green again.
- Direct `node scripts/brief-lint.mjs <brief> <sha>` runs on minimal fixtures under the OS temp area to prove three sweep edits change linter verdicts (section 1 proofs).
- Temp helpers under the OS temp area for the sweep, the test-file mutations, the clock runs, and the count-pin runs. No whole-suite run, no build, no `verify-*`, no Pulse, no Desk.
- Gate reachability by reading only: `scripts/run-tests.mjs:54-57` walks `scripts` among its search roots and `IS_TEST` matches `*.test.mjs`, so the records file runs on every gate without anyone remembering it exists. I did not execute that script.

ALREADY VERIFIED BY THE COORDINATOR AND NOT REDONE: three-line insertion staying green, 24/24 anchor corruptions turning red, reasons verbatim.

## 1. THE SWEEP — for each of the 24, can the arm change while the anchor survives?

Method: for each record I read its reason, located the arm in `scripts/brief-lint.mjs`, constructed a behaviour-changing edit that leaves the anchor substring present at its expected count, applied it to my copy, ran `node --test` on `scripts/brief-lint-records.test.mjs`, recorded the colour, restored from `w3-linter-orig.mjs` under the OS temp area, and re-ran to confirm green again. Every restore was green again (9 pass, 0 fail). Linter hashes before and after the sweep match.

Result: 24 of 24 blind. Every behaviour-changing edit below leaves the suite green (9 pass, 0 fail). Zero sound. The anchor is narrower than the arm in every case: upstream definitions, surrounding logic, sibling arms of one alternation, flags neutralised by a second conjunct, thresholds gated by an added conjunct, call sites bypassing a definition, and conjuncts dropped from a report line.

Direct linter proofs (verdict flips while the records suite stays green) are given for E2chg, E7sfx, and F3i at the end of the table. The rest are argued from the edited truth table and the unchanged anchor count, which the suite run confirms.

| id | anchor (expect) | arm it stands for | behaviour-changing edit tried (anchor untouched) | records suite | restored |
|---|---|---|---|---|---|
| B2 | `.replace(/\s*(\.\.\.\|…)$/, '')` (1) | trailing-strip core, `brief-lint.mjs:180` | `if (!blob.includes(core))` to `if (!blob.includes(q))`: trailing strip computed but never used, raw quote checked instead | green 9/0 blind | green 9/0 |
| B3 | `blob.length > 0` (1) | non-empty blob conjunct, `:183` | `bad === 0 && blob.length > 0` to `bad === 0 \|\| blob.length > 0`: empty blob with no other bad now passes | green 9/0 blind | green 9/0 |
| B6trim | `replace(/\s+/g, ' ').trim()` (1) | norm definition, `:78` | `quotes.push(norm(cur.join(' ')))` (guarded branch) to `quotes.push(cur.join(' '))`: quotes bypass norm, padded quotes unnormalised while the definition keeps its count | green 9/0 blind | green 9/0 |
| C5i | `/enforced by\|enforces/i` (1) | instrument filter flag, `:194` | append `&& /enforced by\|enforces/.test(l)` (no flag): upper-case enforcement must also match case-sensitive, flag neutralised, full anchor still 1 | green 9/0 blind | green 9/0 |
| C6lines | `const instLines = prose.filter` (1) | sentence model for instruments, `:194` | `const prose = proseLines.join('\n').replace(/\s+/g, ' ').split(/(?<=[.;])\s+/);` to `const prose = (proseLines.join('\n').replace(/\s+/g, ' ').split(/(?<=[.;])\s+/), proseLines);`: comma keeps the split text (so the Nsplit anchor still resolves) but the value is physical lines | green 9/0 blind | green 9/0 |
| C4 | `(?:mjs\|js\|ps1\|sh)` (1) | extension alternation, `:197` | `paths.filter((p) => existsSync(...) \|\| existsSync(p))` to `... && p.endsWith('.mjs')`: non-`mjs` instruments never count as existing, the exact narrowing the reason guards against, anchor still 1 | green 9/0 blind | green 9/0 |
| D5 | `(?:—\|-)` (2) | hyphen fallback in both files-scope matchers, `:217` and `:243` | `if (!m)` to `if (!m \|\| !m[0].includes('—'))` (em dash required): hyphen bullets newly refused, both regexes untouched so count stays 2 | green 9/0 blind | green 9/0 |
| E2chg | `change\|changes` (1) | edit-verb alternation, `:246` | remove `edit\|edits\|editing\|` from `EDIT_VERB`, keep `change\|changes`: `Edit ...` strays outside scope now pass. PROOF below: stray brief FAILs before, PASSes after | green 9/0 blind | green 9/0 |
| E3del | `delete from` (1) | sampled verb plus untested `add to\|append to\|write to\|replace in\|re-?pin`, `:246` | remove `add to\|` from `EDIT_VERB`, keep `delete from`: `add to` strays now pass while the sampled anchor holds | green 9/0 blind | green 9/0 |
| E5res | `READ\|reserved\|leave` (1) | prohibition list, `:247` | remove `must not\|` from `PROHIBIT`, keep `READ\|reserved\|leave`: `must not` no longer spares a stray (newly refuses sparing) | green 9/0 blind | green 9/0 |
| E7sfx | `q.endsWith(p) \|\| p.endsWith(q)` (1) | suffix allowance, `:261` | wrap to `(q.endsWith(p) \|\| p.endsWith(q)) && q.length > 1000`: suffix needs a 1000-char host, exact equality in practice. PROOF below: suffix brief PASSes before, FAILs after | green 9/0 blind | green 9/0 |
| F3i | `/\bonce\b/i` (1) | once flag, `:273` | add `&& l === l.toLowerCase()` to the `onceBad` predicate: upper-case `ONCE` without qualifier no longer matches. PROOF below: upper-case brief FAILs before, PASSes after. No new `\bonce\b` added so F5b count stays 1 | green 9/0 blind | green 9/0 |
| F4e | `/iteration\|attempt/i` (1) | exemption flag, `:273` | `&& !/iteration\|attempt/i.test(l)` to `&& !((/iteration\|attempt/i.test(l) && /iteration\|attempt/.test(l)))`: lower-case exemption still spares, upper-case exemption now refuses. Added case-sensitive form carries no flag so the full anchor stays 1 | green 9/0 blind | green 9/0 |
| F5b | `\bonce\b` (1) | once boundaries, `:273` | `(/\bonce\b/i.test(l) \|\| /once/i.test(l))`: embedded `once` now matches via the second arm, embedded forms newly refused. Second arm carries no boundary pair so the anchor stays 1 | green 9/0 blind | green 9/0 |
| F6lines | `const onceBad = prose.filter` (1) | sentence model for once, `:273` | same upstream comma edit as C6lines: value becomes physical lines, both use-site anchors still resolve | green 9/0 blind | green 9/0 |
| G7hy | `[^A-Za-z0-9_-]` (2) | boundary class with hyphen on the check-6 line, `:282` | `&& !/never\|token/i.test(l));` to `&& !/never/i.test(l));` (drop the `\|token` arm on the same line): exemption narrowed, tightening while the class still occurs twice. I never reproduce the guard line here; the tail `outside a prohibition line` is the refusals name | green 9/0 blind | green 9/0 |
| G8sent | `proseLines.filter((l) => /(^\|` (1) | lines-vs-sentences for check 6, `:282` | same line to `... && false);`: whole line dead, never refuses, anchor still 1 | green 9/0 blind | green 9/0 |
| H2i | `/\bsweep/i` (1) | sweep flag, `:288` | add `&& /\bsweep/.test(brief)` (no flag): upper-case sweep no longer satisfies. Added form carries no flag so the full anchor stays 1 | green 9/0 blind | green 9/0 |
| H4dist | `{0,60}` (1) | every-distance bound, `:287` | `/every [^\n]{0,60} in this file/i` to `... in this files/i` (extra `s`): phrase never matches, distance arm dead, bound text still present | green 9/0 blind | green 9/0 |
| H6b | `\bclass\b` (1) | class boundaries, `:287` | `(/\bclass\b/i.test(brief) \|\| /class/i.test(brief))`: embedded `subclass` now satisfies. Added form carries no boundary pair so the anchor stays 1 | green 9/0 blind | green 9/0 |
| I4star | `RESULT\d+` (1) | numbered-result matcher, `:299` | `report(pf(numbered && !bareResult), ...)` to `report(pf(numbered), ...)`: bare plus numbered now passes, matcher text untouched | green 9/0 blind | green 9/0 |
| J2star | `numberedReview = /\bREVIEW\d+` (1) | numbered-review matcher, `:317` | `report(pf(numberedReview && !bareReview && !bareResult), ...)` to `report(pf(numberedReview), ...)`: bare review now passes, assignment text untouched | green 9/0 blind | green 9/0 |
| K5diff | `^[+-][^+-]` (1) | diff-header exclusion, `:142` | add `\|\| /^\+\+\+/.test(l)` to the changed-line filter: `+++` headers now counted, thin diffs pass. Added pattern carries no exclusion core so the anchor stays 1 | green 9/0 blind | green 9/0 |
| Nsplit | `(?<=[.;])` (1) | sentence split on `;`, `:131` | `split(/(?<=[.;])\s+/)` to `split(/(?<=[.;])(?<!;)\s+/)`: semicolon no longer splits, lookbehind text still present once | green 9/0 blind | green 9/0 |

Behaviour proofs (direct linter runs, fixtures under the OS temp area, authority from the live change carrying `Stage 0 ships first and alone`, HEAD as argument):

- E2chg: brief scoping `scripts/run-tests.mjs` plus `Edit `loop/run.mjs` to fix the bug.` Before: `FAIL no instruction directs an edit at a file outside the Files scope`, exit 1. After removing the `edit` arms: `PASS no instruction directs an edit at a file outside the Files scope`, exit 0. Records suite green throughout.
- E7sfx: Files `loop/long/run.mjs` (new) plus `Edit `long/run.mjs` to fix the bug.` Before: `PASS`, exit 0 (suffix spared). After gating the allowance on `q.length > 1000`: `FAIL no instruction directs an edit at a file outside the Files scope`, exit 1. Records suite green throughout.
- F3i: brief carrying `Run ONCE to verify the fix.` with no qualifier. Before: `FAIL "once" always says iteration or attempt`, exit 1. After adding the lower-case conjunct: `PASS`, exit 0. Records suite green throughout.

Shared-span note: C6lines and F6lines share one upstream definition, so one comma edit blinds both while both anchors survive. G7hy and G8sent share the check-6 line, blinded by two different edits to that line. D5, G7hy carry expect 2 and both stay at 2 under my edits. F3i/F5b overlap (`\bonce\b` inside `/\bonce\b/i`): my F3i edit adds no new boundary pair so both counts hold; my F5b edit adds a no-boundary `once` so both counts hold.

## 2. My ruling on content substrings as anchors

Substrings are the wrong anchor for the stated property and the right tripwire for a weaker one. The sweep is the evidence: 24 of 24 behaviour changes survive untouched. The gap is structural, not a matter of choosing longer substrings. Behaviour lives in flags, surrounding logic (`&&` vs `\|\|`, added conjuncts, dropped conjuncts), upstream definitions (`prose` becoming lines), sibling arms of one alternation, call sites bypassing a definition, and thresholds gated elsewhere. A substring pins none of those unless it spans them, and spanning them is the whole linter quoted back, which then fails on any formatting.

Keep substrings for what they do well: they survive renumbering (the measured 0/24 line-pin failure is genuinely closed), they catch deletion, removal, and rewrite of the arm text at zero fixture cost, and they fail with the safe sign on formatting. That is a tripwire, and the authors section 7 over-fail paragraphs describe it honestly.

Do not keep them as the sole anchor for `arm edited but anchor still matches`, which the author marks closed and which this sweep reopens 24 times. The better anchor is a behaviour twin per arm: a minimal brief (or pair) that the linter runs and whose verdict flips when the arm flips, of the kind Phase 0 already built for the 11 BINDs. Cost, stated plainly: 24 distinguishing fixtures to author and keep, several fiddly (the 60-char gap needs exact counting, the empty-blob vehicle does not exist in the tree and must stay unmanufactured, hyphen-adjacent and embedded forms need runtime assembly so the report never spells the guarded forms). That cost is real and recurring. The alternative cost of staying with substrings alone is measured above: a mechanism that reads as present and does nothing on exactly the edit class it was built to close, drifting into decoration one silent behaviour change at a time.

Narrow recommendation: keep the nine-test file as the tripwire and expiry clock, but require each RECORD to grow its behaviour twin by its expiry (or retire with justification). A RECORD without a twin by its date is debt, not a disposition. That preserves the cheap detection today and closes the blind class on a schedule, instead of re-stamping dates over a gap that never narrows.

## 3. The clock override — mechanism or convention, and what I would do

`BRIEF_RECORDS_NOW` moves the clock. What reads it: only `pinnedNow()` / `effectiveNow()` in `scripts/brief-lint-records.test.mjs:257-270`, plus the control that sets and restores it (`:368-378`). Nothing else in the tree reads it (content search for the name returns only that file and the authors report describing it). A gate run can carry it: `loop/lib/gates.mjs:467` and `:559` spawn children with `env: { ...process.env, ...env }` and never clear it, so an outer value flows into `npm test` and into the records check. Nothing outside the suite refuses when it is set.

The printed notice (`records check: pinned now ... (controls only; gate runs without override)`) is visible in captured test output, which the gate does capture per script, but the gate summary keeps only the last 6000 characters per script (`loop/lib/gates.mjs:655`). With a thousand-plus tests printing a line each, one notice line is buried, and a passing gate records no failure note in the ledger. At the scheduled hour nobody watches a terminal. That is visibility into a log, not a refusal. `The runner will not set it` is a convention, in those words. The authors section 7 already concedes the suite cannot enforce the runners environment from inside, which is the right way to say it.

Measured clock runs (`node --test` on the records file, local date 2026-09-10):

- no override: 9 pass, 0 fail, one pinned notice from the control itself.
- `BRIEF_RECORDS_NOW=2026-09-10` (pre-batch): 9 pass, 0 fail. Live check obeys the pin.
- `BRIEF_RECORDS_NOW=2026-10-11` (batch date): 7 pass, 2 fail (live expiry refuses; the override-honoured control fails on restore because the outer pin is still present).
- malformed or empty value: ignored, 9 pass, 0 fail (falls back to the live local date).

So the override satisfies every record at once without re-deciding anything by pinning to a pre-expiry date after the wall has passed: today that changes nothing because today is already pre-batch, after 2026-10-11 a pinned 2026-09-10 keeps the live check green while the wall stands. That is word for word the class this packet was built to close, sitting inside the mechanism that closes it.

Ruling: constrain, not leave and not remove. Leave keeps a convention where a mechanism is needed. Remove has a real cost the controls genuinely need: the pinned controls (`all green at pinned 2026-09-10`, batch/outlier populations, boundary day) must not depend on the day they run, and the override-honoured control proves the pin the others rely on. The narrow fix is to make the live check ignore the pin and read the local date always, leaving the pin to the controls only (or, equivalently, fail closed when the pin is present at process start). Then a gate-time pin cannot green a red wall, the controls stay deterministic, and the one control that sets its own pin still passes because it sets and restores itself. Cost of my side: one-line change plus re-verifying the twins, and the live check loses its manual backdate lever for debugging, which is minor.

## 4. What the suite still passes on

Method as ordered: untouched copy under the OS temp area, each mutation applied to my copy, `node --test` on the records file, restore from the copy between mutations, re-run to confirm green again. Every restore below was green again (9 pass, 0 fail).

| mutation | before | mutated | restored | caught |
|---|---|---|---|---|
| `>` to `>=` in `isExpired` (boundary tightening) | 9 pass, 0 fail | 8 pass, 1 fail (`expiry boundary day passes` turns red) | 9 pass, 0 fail, green again | caught |
| `rec.expect < 1` to `rec.expect < 0` (threshold moved, zero now allowed) | 9 pass, 0 fail | 9 pass, 0 fail | 9 pass, 0 fail, green again | MISSED: `expect: 0` would now pass shape with no twin covering it |
| Check A loop to `RECORDS.slice(0, 1)` (loop stops after first) | 9 pass, 0 fail | 9 pass, 0 fail | 9 pass, 0 fail, green again | MISSED: only B2 checked, other 23 could rot green |
| Check S second assert to `assert.equal(0, 0, ...)` (error collected but never asserted) | 9 pass, 0 fail | 9 pass, 0 fail | 9 pass, 0 fail, green again | MISSED: malformed records pass Check S; only the direct `shapeErrors` control still guards, and it tests only owner, date, reason, anchor, dupe, never `expect` or impossible dates |
| Check A assert to `assert.equal(bad.length, bad.length, ...)` (count compared against itself) | 9 pass, 0 fail | 9 pass, 0 fail | 9 pass, 0 fail, green again | MISSED: Check A dead, always green |
| Check E `late` to `[]` with the filter computed and discarded | 9 pass, 0 fail | 9 pass, 0 fail | 9 pass, 0 fail, green again | MISSED: live expiry dead; pinned controls use literal dates and still pass, so nothing notices |
| `RECORDS.length` vs `EXPECTED_COUNT` to `RECORDS.length` vs `RECORDS.length` (count pin self-compare) | 9 pass, 0 fail | 9 pass, 0 fail | 9 pass, 0 fail, green again | MISSED: silent deletion passes this line; batch controls still catch today (section 5), but this line is dead |
| `got !== rec.expect` to `got < rec.expect` (conjunction narrowed) | 9 pass, 0 fail | 9 pass, 0 fail | 9 pass, 0 fail, green again | MISSED on current file and on additions: an anchor appearing twice (formatting duplicate, pasted copy) still passes; only drops are caught |
| `EXPECTED_COUNT = 24` to `= 25` (threshold moved by one up) | 9 pass, 0 fail | 8 pass, 1 fail (shape count turns red) | 9 pass, 0 fail, green again | caught |

A twin proves a check can fire; only a mutation proves it must. Seven of my nine mutations must not and do not: the suite is thin on its own logic. The authors three mutations (expiry operator, counting return, owner-always-accuse) all catch, which is consistent with mine: the checks that have twins must fire, the ones without twins need not.

## 5. The count pin — what fails, what names the missing record

Delete one record and leave the count at 24: fails, and the failure reports a number, not a name. Deleting B2 (representative; same shape for any single deletion) gives 7 pass, 2 fail: Check S `record count 23, want 24 (retire with justification, never by silent deletion)` and the batch control `want 23 expired at 2026-10-11, got 22: ...`. The anchor check still passes (fewer anchors, all remaining hold). Neither failure names the missing record: the count line gives only the number, the batch line lists the survivors (B2 inferred by absence, not accused). Restored green again 9/0.

Delete one record and set the count to match (23): the shape number stops noticing, but the pinned controls still notice, so review is not yet the only detector. Deleting batch member B2 (or F5b) with count 23 gives 8 pass, 1 fail on the batch control (`want 23 expired at 2026-10-11, got 22`). Deleting outlier B3 with count 23 gives 7 pass, 2 fail: the `allAt 24` half (`want 24 expired at 2026-12-02, got 23`) and the boundary control (its `find` for B3 no longer resolves). Restored green again 9/0 in each case.

Review becomes the only remaining detector once the actor also updates the pinned literals in the same edit, which the file invites by keeping them together. Deleting B2, setting count 23, and moving the batch literals 23 to 22 and 24 to 23 in the same edit: 9 pass, 0 fail. Anchors hold (deleted anchor gone with its record), shape holds (counts agree), pinned controls hold (literals agree). The three edits are visible in the diff, and that visibility is the entire guard. So: the claimed half holds (silent deletion fails, with a number, not a name); the conceded half holds precisely (count-plus-literals edit passes; genuinely review as backstop, stated as a designed boundary where code raises the bar from one number to three, not as a phrase ending inquiry).

## 6. The reasons, read cold by someone re-deciding

I read eight diverse reasons with no memory of tonight, asking only what the expiry-day reader needs: what the arm guards, what removing it would cost, why DELETE was rejected, and what twin would bind it.

Good enough to re-decide: B2 (leading twin named, symmetric trailing-ellipsis cost, revisit with a trailing twin if style drifts); B3 (empty-blob limit, redundancy via `bad >= 1` except the vacuous empty-quote edge, do not manufacture history, longer date owned as a considered judgement); E5res (sampled prohibition plus the untested list named, sparing cost, next sweep samples another arm); H4dist (no boundary twin named as the exact 60-char gap, fiddly and low risk, boundary twin if distance ever matters); K5diff (single-`+` vs `+++`/`---` headers, loosening thin diffs to green); Nsplit (`;` split scope cost, no twin named as the delegation/qualifier case to build).

Thin, recognisable but not re-decidable: G8sent (`No wrapping twin for this check. Sentence normalisation vs physical lines matters where wrapping splits token context. Keep.` — names the model but not the cost direction, no twin sketch, no DELETE reason beyond absence); G7hy (hyphen subtlety noted, flips outcomes, but no hyphen-adjacent twin sketch and no direction per case); I4star/J2star (`Bare still refused via !bare, so no colour change. Binding needs a twin asserting numbered=false for the bare form, not just status.` — honest about no colour change today, but a reader asking `if no colour change, why not DELETE` finds only `low risk, keep`, not what DELETE would lose beyond a future detail test).

A record that can be re-read but not re-decided is a note with a date on it. Most of the 24 clear that bar; the check-6 pair and the zero-digits pair sit closest to it. Since the wall forces all 23 to be re-decided on one morning, the thin ones are where a rubber stamp will be easiest and least visible.

## 7. Findings, each with file and line

- F1 (load-bearing): every anchor is narrower than its arm. 24 blind edits, all green, restores green. Mechanism `scripts/brief-lint-records.test.mjs:310-317` (Check A counts substrings); arms in `scripts/brief-lint.mjs` per-row in section 1 (`:78`, `:131`, `:142`, `:180-183`, `:194`, `:197`, `:217`, `:243`, `:246-247`, `:261`, `:273`, `:282`, `:287-288`, `:299`, `:317`). The authors `RESULT1.md:53` `Closed by precise anchors` does not hold.
- F2 (load-bearing): the clock override satisfies the wall without re-decision. Reader `scripts/brief-lint-records.test.mjs:257-270`; flow into gates via `loop/lib/gates.mjs:467` and `:559` (`...process.env` inherited, never cleared); notice `scripts/brief-lint-records.test.mjs:266` buried under `loop/lib/gates.mjs:655` truncation on a passing gate. Convention, not mechanism.
- F3: the nine-test suite survives seven of nine logic mutations (section 4 table). Files `scripts/brief-lint-records.test.mjs:272-274` (`isExpired`), `:276-286` (`countOccurrences`), `:288-306` (`shapeErrors`), `:310-317` (Check A assert), `:321-327` (Check E filter), `:332-341` (Check S asserts), `:49` (`EXPECTED_COUNT`). No twin covers `expect: 0`, first-only loops, self-compares, discarded filters, or `<` for `!==`.
- F4: the count pin reports a number, not a name. `scripts/brief-lint-records.test.mjs:333` count assert; batch literals `:352-356` and boundary samples `:359-366` catch count-matched deletions until they are edited in the same file, after which 9/0 green (section 5 triple edit).
- F5: three reasons are thin for re-decision (section 6: G8sent, G7hy, I4star/J2star). File `scripts/brief-lint-records.test.mjs:177-231` (records array reasons).
- F6 (positive, stated so the sweep is not misread as total failure): renumbering immunity, corruption sensitivity, and transcription honesty stand as claimed. I did not re-run the coordinators three proofs per instruction, and my sweep is a different class (anchor intact, behaviour changed). Deletion of an arm still fails via count drift; the tripwire works.
- F7: gate reachability is inherited as claimed. `scripts/run-tests.mjs:54-57` search roots include `scripts`; `:57` `IS_TEST` matches the records file. Read, not executed.

## 8. What I could not determine

- Whether any of my 24 blind edits also break a host proof in `scripts/brief-lint.test.mjs` (79 tests) in a way that would alert a gate even while the records file stays green. I ran only the records file per scope; the host suite is the backstop the author cites for several arms and I did not measure it.
- Whether the scheduled runner clears the environment before gates. I read `loop/lib/gates.mjs` inheritance and the absence of any clearing or refusal; runner discipline outside the tree is above this review.
- Whether hyphen bullets, padded quotes, upper-case emphasis, semicolon-split delegation, or 60-char gaps appear in real briefs outside this worktree. Judged plausible as transcribed; the expiries are the re-check, as the author states.
- Whether a behaviour-twin programme (section 2 recommendation) fits the 30-day budget and queue order. That is a scheduling judgement, not a review finding.
- Whether the triple-edit deletion (record plus count plus batch literals) would trip the passing-test ratchet or any log-diff alarm outside the suite. The suite itself is green; wider alarms are above this file.

## 9. Blocked or refused calls

None. No command was blocked or refused. No credential was handled or printed. Ran only `node --test` on `scripts/brief-lint-records.test.mjs`, direct `node scripts/brief-lint.mjs` runs on temp fixtures, temp helpers under the OS temp area for the sweep/mutations/clock/count proofs, hash reads, and `git -C <dir>` reads (`rev-parse`, `status`). No whole-suite run, no build, no `verify-*`, no Pulse, no Desk. No push, no `gh`, no `bd` writes, no commits. Every mutation was restored from the untouched copy before the next; the records file was green again (9 pass, 0 fail) after every restore; final hashes match the pre-review hashes. Every date in this report is this machine local date.
