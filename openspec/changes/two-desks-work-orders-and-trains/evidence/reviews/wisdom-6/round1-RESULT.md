# RESULT1 — 2026-09-10 — item 6 round 1: 13/14 green; liveness red with six named live restatements (all reported, none edited)

Worktree `D:/addictedtoai-worktrees/item6-figures`, branch `wisdom/item6-figures`
at `3f6914f` (not rebased). One new file: `scripts/figure-provenance.test.mjs`.
Everything else byte-identical. All dates below are machine-local; today is
2026-09-10. No part of the brief was left out and no scope was narrowed: the
red liveness arm and the six findings are the instrument working, reported
through the brief's own scope-decision path.

REVISION 2026-09-10 (S5 ONLY, HEAD b05a903, this file untracked and
uncommitted — commit covers scripts/figure-provenance.test.mjs alone):
an EXEMPTIONS list with one exact-text entry (FULL-MEM-LOG.md:3440,
new-writing-ceiling) plus a tamper-proof arm. New colours in §1, new S5
disposition in §4, brief-fix note in §5. Every other section stands as
written; the S1–S4/S6 record is NOT softened — S1–S4 still fire on THIS
worktree's older docs (main has since fixed them; this worktree predates
those fixes, which is exactly why the still-red A14 proves the exemption
did not weaken the rule).

REVISION 2 2026-09-10 (key-path fix, HEAD a777067, this file untracked and
uncommitted — commit covers scripts/figure-provenance.test.mjs alone):
key-path spans never supply captured values (identifier-dot-identifier
shapes inside backticks blanked before prose-pattern match; pointers still
read from the unmasked window; captured number must sit outside backticks).
New colours in §1 (worktree-tree still red-with-5, main-docs probe green
empty), fix plus residual plus S5 per-line boundary plus publish-flag
reason fix in §4, revision note in §5. S5 exemption unchanged.

## 1. Colour of every assertion: baseline, post-Mutation-A, post-Mutation-B

Counts are read from the runner's own summary lines (`node --test` on the new
file by absolute path; the worktree carries no `node_modules`, so `npm test`
was never run there; no build was run at all).

- Baseline: `tests 14 / pass 13 / fail 1` (the 1 is liveness, §1.3).
- Post-Mutation-A: `tests 14 / pass 11 / fail 3`.
- Post-Mutation-B: `tests 14 / pass 12 / fail 2`.
- Revision (S5 exemption, 2026-09-10): `tests 15 / pass 14 / fail 1` — the 1
  is liveness (A14 naming exactly S1, S2, S3, S4: AGENTS.md:94
  budget-window; data/README.md:43 budget-window; data/README.md:45
  machinery-ceiling stale + upkeep + new-writing; S5 gone via the
  documented exemption). New arm A15 (exemption exact-text: restored
  exempt, tampered fires) green; all other arms green.
- Revision 2 (key-path fix, 2026-09-10): worktree-tree `tests 15 / pass 14
  / fail 1` — the 1 is liveness A14 red-with-5, byte-identical list to the
  S5 revision (S1–S4 fire on prose values, proving no gutting); main-docs
  probe (main data/README.md + AGENTS.md copied over the worktree copies,
  run, restored with `git checkout --` + hash-verify clean) `tests 15 /
  pass 15 / fail 0` — A14 GREEN with empty violations (value-plus-key-path
  passing shape passes). Both runs by absolute path `node --test`; no `npm
  test`, no builds; arms run sequentially in one file so no lock was needed. No new mutations
  in the revision — the tamper arm is an in-file mechanism proof, not a
  file mutation. The `04DBF4DF…` byte-identical hash in the paragraph
  below is the round-1 record and no longer applies: the revision
  intentionally changed the one file it was allowed to change.

Property-to-arm map (P1–P10 are the enforced properties; A1–A14 the arms):

| Arm | Property | Baseline | Post-A | Post-B |
|---|---|---|---|---|
| A1 stale bound without pointer refused | P1 restated-bound fires | green | RED (fixture goes green — the defect) | green (stale still caught on value) |
| A2 live bound with pointer passes | P2 sourced citation passes | green | green | green |
| A3 live bound without pointer refused | P3 correctness is not sourcing | green | RED (patterns gone) | RED (noun phrase counts — the defect) |
| A4 count without producer refused | P4 counts carry producers | green | green | green |
| A5 count with producer passes | P4 | green | green | green |
| A6 rounded total exact unsourced refused | P5 totals carry producer+rounding | green | green | green |
| A7 rounded total with producer+rounding passes | P5 | green | green | green |
| A8 removal with undisclosed blind spot refused | P6 misses are disclosed | green | green | green |
| A9 removal disclosed with producer passes | P6 | green | green | green |
| A10 sourceless label refused | P7 labels carry read+source | green | green | green |
| A11 label with read time and source passes | P7 | green | green | green |
| A12 stamped-record escape (2 asserts) | P8 Luna bound pinned | green | green (vacuous for the machinery half — no patterns, no match; honestly noted, not claimed) | green |
| A13 bare numbers never candidates | P9 no blocklist behaviour | green | green | green |
| A14 live sweep asserted | P10 sweep executes, result named | RED, 6 violations named | RED, 5 named (machinery :45 gone) | RED, 1 named (only stale machinery :45 survives; all 5 correct-value findings go green — the defect) |
| A15 exemption exact-text (restored exempt, tampered fires) | P10 exemption cannot go stale silently | n/a (new in revision — green) | n/a (not re-run; mechanism proof, not a mutation target) | n/a (ditto) |

Revision reading of A14: RED, 5 violations named — S1 (`data/README.md:45`
machinery-ceiling stale 10 vs live 30), S2 twice (`data/README.md:45`
upkeep 40 and new-writing 45, correct but unsourced), S3
(`data/README.md:43` window_days 30), S4 (`AGENTS.md:94` 30-day budget).
S5 (`FULL-MEM-LOG.md:3440`) is gone — skipped by the documented
exact-text exemption, whose own arm (A15) proves the skip is text-bound:
`45%`→`46%` re-fires, restored text is exempt. The rule is unweakened:
every still-present restatement on this tree still fires.

Revision 2 reading of A14. Worktree-tree (this branch, older docs):
RED, 5 violations, exact list — AGENTS.md:94 budget-window captured 30
live 30 unsourced; data/README.md:43 budget-window captured 30 live 30
unsourced; data/README.md:45 machinery-ceiling captured 10 live 30 stale;
data/README.md:45 new-writing-ceiling captured 45 live 45 unsourced;
data/README.md:45 upkeep-floor captured 40 live 40 unsourced (S1–S4 fire
on prose values — the stale 10 and the unsourced prose numbers — proving
the key-path fix did not gut detection). Main-docs probe (main
data/README.md + AGENTS.md over the worktree copies): GREEN, empty
violations `[]` — the value-plus-key-path passing shape
(`window_days`: 30 with `data/config.json` `budget.window_days`; upkeep
floor 40% / new-writing 45% / machinery 30% each with its
`budget.bounds.*` key path; 30-day budget with `data/config.json`
`budget.window_days`) passes; the pre-fix false-fire
(data/README.md:47 upkeep-floor captured 45 vs live 40; :48
new-writing captured 30 vs live 45, pattern matching inside the backticked
key path and spanning to the next figure's number) is gone.

Reading the colours: a "green fixture" means the sentence is allowed to stand;
a "red arm" means the test asserting refusal fails. Mutation A (declaration
neutered: machinery-ceiling patterns dropped to `[]`) turns the stale
fixture green — allowed to stand — which is the defect the two red arms
report. Mutation B (pointer escape neutered: any noun phrase counts as a
pointer) turns the sourceless live-value fixture green and, on the live
tree, blesses 5 of the 6 real findings while the stale one survives on the
value rule — defence in depth, and the reason the value check and the
pointer check are separate clauses.

Mutations touched only `scripts/figure-provenance.test.mjs`, which no other
file's tests rewrite; say so in one line as required — done — and the arms
run sequentially in one file so no lock was needed. Revision likewise:
one file, sequential arms, no lock, no `npm test`, no builds. Both mutations were
applied, run by re-execution (`node --test`, the file is self-contained), and
reverted; both reverts verified byte-identical by SHA256 (`04DBF4DF…` at
baseline, after revert A, and after revert B — same hash all three times).

## 2. Which half of each control is wild, which is constructed, and why no runnable wild fixture exists

For all five controls the wild half is prose history and the constructed half
is a declared fixture in the new test file. No runnable wild fixture exists
for any of them: the wild halves are transient observations whose bytes are
gone (repaired passages, vanished counts, counters that kept incrementing, a
trim since re-run, a push message since superseded). Re-stating them verbatim
as fixtures would assert vanished numbers as live claims — the exact defect
class under test — so each arm names its incident and uses a stand-in whose
live value is read from `data/config.json` where the shape allows it.

1. Restated bound — wild: `AGENTS.md` "machinery ceiling 10%" against live 30
   (`addictedtoai-mrld`, banked 2026-09-09, since repaired to key-names-only).
   Constructed: "The machinery ceiling is 10%." (fail) / "... is 30%
   (`data/config.json`)." (pass) / "... is 30%." unsourced (fail) — both
   directions plus the correctness-is-not-sourcing arm.
2. Count over a moving population — wild: F round-2 report said 56 tests;
   actual 55 (20+16+15+4), caught by a sealed reviewer adding its own count.
   Constructed: "The suite counts 55 tests." with and without a producer. The
   fail fixture deliberately uses the RIGHT number (55) so the refusal isolates
   sourcing rather than leaning on the wild wrong number (56).
3. Total read mid-change — wild: 182.4M read while three counters
   incremented, corrected to 182,873,547. Constructed: "uses exactly 182.4M
   tokens" (fail) vs the full total with producer and stated rounding (pass).
4. Removal count with a blind spot — wild: 205 vs 219 removed, 14 tilde
   entries missed by the repair regex. Constructed: 219 with a real producer
   but no disclosure (fail — isolates the disclosure clause) vs 219 with the
   14-tilde miss disclosed (pass).
5. Sourceless label — wild: push message "as of 10:31" for a reading taken at
   10:28:37, making the site look staler. Constructed: "12 commits behind"
   with no read (fail) vs "2 commits behind" with read time and source (pass).
6. Stamped-record escape — no wild half; a principle arm pinning Luna's bound.
   It doubles as the carrier for stale-inside-past-record shapes (a 10%
   bound quote inside a dated "said" record, a 219 count inside a dated
   "removed" record): both must never fail.

## 3. The provenance comment, quoted from the file

From `scripts/figure-provenance.test.mjs`, lines 4–47, verbatim:

> PROVENANCE — why this check exists and why it is shaped this way.
>
> A figure a later decision reads carries its source. The measured cost of the
> opposite is a confident computation built on a stale copy: AGENTS.md restated
> the machinery ceiling as 10% while data/config.json read 30, and the
> orchestrator computed a correct threefold warm-up widening from the wrong
> denominator, because loop/lib/budget.mjs reads those bounds by pattern
> (addictedtoai-mrld, since repaired to key-names-only in AGENTS.md).
>
> What counts as a source pointer, and why a bare number is never one: a
> transclusion ({{fact:<kind>/<slug>#<field>}}), an explicit reference to the
> canonical file (data/config.json) or the figure's full key path
> (budget.bounds.machinery_ceiling_pct), or — for constructed counts — a named
> producer command whose output IS the figure. A bare number beside a vague
> noun ("the ceiling is 10%") is never a pointer because it resolves to nothing
> a later reader can check: no file, no command, no transclusion — agreement
> with it is coincidence and disagreement with it is undetectable. A pointer
> that resolves to the wrong source is likewise no pointer for a
> config-resident value: specs/loop still tables the ceiling at 10%, so a
> citation "from specs/loop" confirms the stale copy instead of checking it.
>
> Why the declared set is enumerated by the sweep rather than fixed in advance:
> the tree's gating figures are found, not assumed. A fixed list would go stale
> exactly like the restatements it polices — a second source that reads like a
> measurement. The declaration lives in this test beside the patterns and reads
> the live config at run time, so a bound edited in data/config.json moves the
> expectation with it instead of silently disagreeing with it.
>
> Why this check cannot false-fire on legitimate prose the way a
> number-blocklist would: candidacy is a match against a DECLARED figure's
> patterns — a named figure beside a value — never a bare number. 10, 30, 55
> and 56 appear all over the tree and mean nothing until a pattern says which
> figure they restate. Dated past-tense records are exempt by the tense test
> (they make no claim about a current value, and forcing pointers onto them
> would get true records deleted to earn a green — Luna's bound, which is why
> this round exists in narrowed form). Hypotheticals ("at a 10% ceiling")
> state scenarios, not values. Fixture worlds in test files construct their
> numbers in-file and are declared where used. The arms below prove each
> exemption with a fixture that must stay green.
>
> Why a sourced re-statement passes rather than being deleted: the operating
> documents legitimately cite live figures — citing was never the defect. The
> defect was citing without a pointer a later reader could check. Deleting
> every citation would trade stale copies for missing context and teach authors
> to hide figures instead of sourcing them. The passing shape is
> value-plus-pointer; data/README.md's own "Read the file for the live
> numbers: as of ..." is the in-tree model of it.

Revision note: the quote above is the round-1 text of lines 4–47. The
revision appended one sentence to that comment naming the EXEMPTIONS list
and its exact-text staleness discipline; nothing else in the quoted
passage changed.

## 4. Sweep enumeration: the class, every disposition, and the stop rule

Class: *a figure a later decision reads, restated without its source*.
Canonical source for bound values is `data/config.json` (live today:
machinery 30, new-writing 45, upkeep 40, window 30 — read at run time, never
pinned). Match window is one line each side with the matched line; exemptions:
tense test (date stamp or unambiguous narrative past — present-passive rule
language such as "are computed" deliberately does not exempt), hypothetical
framing on the matched line, figure-specific pointer (canonical file, full
key path, or transclusion). Patterns match within one line. Revision 2 fix:
key-path spans never supply captured values — backticked
identifier-dot-identifier shapes are blanked before prose-pattern match
(pointers still read from the unmasked window) and the captured number must
sit outside backticks, so prose numbers outside backticks are still
captured. Residual: a restatement written ENTIRELY in backticks with no
prose number escapes capture (accepted because pointers themselves are
backticked and the value rule needs a prose number; the reviewer judges).
S5 exemption unchanged and per-line: the identical line under altered
surrounding text stays exempt, while line-number shift and line-text drift
re-fire.

BIND (declared in the test, swept live):

- B1 `budget.bounds.machinery_ceiling_pct` — live restatements: (a)
  `data/README.md:45` "machinery ceiling 10%", STALE, window carries
  `specs/loop` — a pointer to the stale law, not the live config — SCOPE
  DECISION S1, reported, not edited. Exempt, correctly standing:
  `AGENTS.md:271` (dated "said" record of the repaired incident),
  `loop/lib/budget.mjs:236` ("It was the literal 10" — narrative past),
  `:293` ("At a 10% ceiling" — hypothetical), timeline-note-03:79
  ("committed" record), `FULL-MEM-LOG.md:3439` ("raised" record).
  Fixture worlds (`loop/tests/*`, gate logs) excluded as constructed.
- B2 `budget.bounds.new_writing_ceiling_pct` — live restatement:
  `data/README.md:45` "new-writing ceiling 45%", correct value, NO pointer —
  SCOPE DECISION S2. `FULL-MEM-LOG.md:3440` "new-writing ceiling stays 45%",
  correct value, no pointer — SCOPE DECISION S5 (revision: now carried as
  the documented exact-text exemption — see S5 below; the sweep skips it
  only while the line reads exactly as recorded).
- B3 `budget.bounds.upkeep_floor_pct` — live restatement: `data/README.md:45`
  "upkeep floor 40%", correct value, no pointer — SCOPE DECISION S2. Known
  blind spot, stated not hidden: the matching "upkeep floor / stays 40%"
  split across `FULL-MEM-LOG.md:3439–3440` escapes single-line matching and
  is reported here rather than silently missed.
- B4 `budget.window_days` — live restatements: `data/README.md:43`
  "(`window_days`: 30)", correct value, no pointer — SCOPE DECISION S3;
  `AGENTS.md:94` "the 30-day budget", correct value, no pointer — SCOPE
  DECISION S4 (the repaired key-names-only passage's own principle, restated
  170 lines below it). A first-draft window pattern firing on the 7-day
  anchor windows (`lib/anchors.mjs:32`, `lib/schema.mjs:496`) was measured,
  diagnosed as the blocklist failure in miniature, and repaired to
  budget-tied patterns — those two lines are the standing control that the
  declaration names figures rather than numbers.

DELETE (considered, not declared, with the reason in each case):

- Per-type wall-clock caps (120/60): operating prose states relationships
  ("twice its per-type cap", "up to four invocations") without values, or
  defers with read time ("Read the file for the live numbers: as of
  2026-08-30 ...") — the passing shape, not a violation. Code comments
  illustrate derivations; no present-tense unsourced live-value claim found.
- Degradation thresholds (trailing 48h, shed 1/2/3): stated with spec
  pointers ("Read those from the spec" — the spec is canonical for these by
  task 1.3) or as bare durations without figure names, which the declaration
  does not claim.
- Lane backoff (1h, doubling, 6h max), cooling 3 days, branch age 14 days,
  queue cap 50, job-total multiple 2, minimum invocation 15 minutes:
  spec-canonical with an explicit pointer (`data/README.md:70-76`).
- Publish flag: meaning stated; the only value mention is `publish: false`
  in a conditional describing the shared step's no-remote behaviour
  (data/README.md:36), not a live claim a later decision would read from
  prose rather than config — clean, config remains the source.
- Suite counts, ratchets, floors, pin counts: moving populations; a static
  declaration would go stale like the restatements it polices (the brief's
  own reason against fixed lists). Fixture counts are declared in-file where
  used.
- Authority measurements (durations, byte counts, record counts in logs,
  gate output, timeline notes): dated past-tense records — tense-test
  DELETE as a class, executed over `FULL-MEM-LOG.md` and all eight timeline
  notes, not merely asserted.
- Spec law (`openspec/specs/loop` 10% table) and in-flight legislation
  (unarchived delta, evidence work-papers): not restatements — the former is
  normative rule whose divergence from config is owned by the revert bead,
  the latter are drafts on a reserved path. Observed and reported, not
  swept: the evidence report still states "machinery ceiling 10%" WITH its
  `data/config.json` pointer (desk-mech-report.md:207-208) — sourced but
  stale, fix belongs to the change author (SCOPE OBSERVATION S6).
- Bare numbers everywhere (10/30/55/56/48/120/60): never candidates — arm
  A13 proves it.
- Historical records about the defect itself (the repaired AGENTS.md
  passage, the wisdom/README incident record): tense-exempt records, not
  restatements.

Stop rule: the sweep terminates when every figure found has a disposition,
not when no further figure can be imagined. That condition holds: every
figure above carries BIND or DELETE, every live match carries violation,
exemption, or scope exclusion with its reason, and the two known blind
spots (cross-line values; the tests/ fixture exclusion) are named above.
No figure was declined without a disposition; the six fixes the sweep calls
for need files outside the Files list and are stated below as scope
decisions, not taken.

Scope decisions (citing-file fixes outside the new test file — reported with
disposition, file and reason; none edited in this diff):

- S1 `data/README.md:45` machinery ceiling 10% — STALE vs live 30; pointer
  resolves to the wrong source. Suggested: key-names-only per the mrld
  repair, or value with `data/config.json` pointer.
- S2 `data/README.md:45` upkeep 40 / new-writing 45 — correct but unsourced.
- S3 `data/README.md:43` window_days 30 — correct but unsourced (the change's
  own specfix direction says name the key, not the number).
- S4 `AGENTS.md:94` "30-day budget" — correct but unsourced.
- S5 `FULL-MEM-LOG.md:3440` new-writing "stays 45%" — correct but unsourced;
  TEST-CARRIED LIVE-VERIFIED EXEMPTION (revision 2026-09-10, the round's
  only change): EXEMPTIONS entry {file FULL-MEM-LOG.md, line 3440, figure
  new-writing-ceiling, exactLineText "stays 40% and the new-writing ceiling
  stays 45%; because the bounds share one", reason: dated decision
  narrative under the dated section
  two-desks-work-orders-and-trains-2026-09-08 (the bd84b4b drain record),
  values checkable via the bead refs and the in-situ arithmetic 40 + 30 in
  the passage, passage editing refused per Luna's bound}. The sweep skips
  the match ONLY while the line text still equals the recorded
  exactLineText; arm A15 proves both directions live (recorded text still
  matches the pattern and would fire absent the exemption; `45%`→`46%`
  tamper re-fires despite the entry; restored text is exempt). The passage
  was not rewritten; the rule was not weakened — A14 still names S1–S4 on
  this tree.
- S6 (observation, excluded scope) evidence report stale-with-pointer,
  desk-mech-report.md:207-208 — fix belongs to the change author.

## 5. What the brief got wrong (three measured defects)

- D1. "The tree is clean today (verified at briefing...)" is false. The
  briefing verified one instance — the `AGENTS.md` restatement repaired to
  key-names-only — while the same 10-vs-30 shape stands live in
  `data/README.md:45` and five correct-but-unsourced siblings stand in
  `data/README.md:43`, `AGENTS.md:94` and `FULL-MEM-LOG.md:3440`. The
  expected passing sweep does not obtain; the round proceeded down the
  brief's own reporting path instead (red liveness arm with names + scope
  decisions S1–S6, no edits outside the one new file).
- D2. "The four wild controls are prose history" (Files-adjacent §,
  "The control" section) — the brief then enumerates FIVE (restated bound,
  count, total, removal count, sourceless label). Four should read five;
  the arm count (five control arms plus escape, mutations and liveness)
  follows the enumeration, not the headline number.
- D3. The Files section still carries the pre-reconciliation sentence
  ("fix the RESTATEMENT only where the sweep's disposition puts it"), while
  the brief's own reconciled rule — "this list" means the Files bullets, so
  citing-file fixes outside the new test are REPORTED, never edited —
  governs. This round followed the reconciliation (S1–S6 reported, tree
  otherwise byte-identical); the stale sentence should be struck so a
  future reader does not take it as permission.

Nothing was left out and no verdict was softened to get there: all five
controls run both directions, the escape, the two mutations with
byte-identical reverts, and the executed (not described) sweep are above,
with colours, names, and hashes.

Revision note 2026-09-10: brief defects D1–D3 above are fixed on main
(the brief now reads clean — lint is BRIEF OK — and `data/README.md`
bounds+window sourcing plus the `AGENTS.md` 30-day pointer fix the S1–S4
shapes there), together with this S5-only revision (test-carried
live-verified exemption with the A15 tamper proof). This worktree
predates those main fixes, so A14 still names S1–S4 here — stated
plainly, not softened: the instrument firing on the older docs is the
proof the S5 exemption weakened nothing. S6 stays an observation for the
change author, unchanged.

Revision 2 note 2026-09-10 (key-path fix): the sealed review's one
load-bearing finding — value-plus-key-path (the brief's passing shape)
false-fired when the prose pattern matched inside the backticked key path
and spanned to the next figure's number (pre-fix probe: data/README.md:47
upkeep-floor captured 45 vs live 40; :48 new-writing captured 30 vs live
45) — is fixed test-file-only by blanking key-path spans before capture
while prose numbers outside backticks are still captured; worktree-tree
A14 still red-with-5 (S1–S4 on prose values) and main-docs probe A14
green empty, both stated in §1. Notes closed: S5 per-line boundary stated
in §4 and in-file (identical line under altered surround stays exempt;
shift and drift re-fire); publish-flag DELETE reason corrected in §4
(`publish: false` conditional is not a live claim) with disposition
unchanged. No brief edit needed.
