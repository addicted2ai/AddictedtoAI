# Packet F — tasks 21 and 22 of `two-desks-work-orders-and-trains` (author brief, round 2: revision)

authority: two-desks-work-orders-and-trains@ddbfd52ca16ccf5cff92633d0b571e1a4ce69c91

You are a codex worker, alone and unattended, in the git worktree
`D:/addictedtoai-worktrees/fleet6-stage0-F` on branch
`stage0/f-history-enablement`, whose tip is `df448970490c7fe496317182417364a281c216ed` (one commit on top
of `ddbfd52ca16ccf5cff92633d0b571e1a4ce69c91`, by the round-1 author: "two-desks: append conformance history and
enforce runner enablement"). `node_modules` is a junction to the main checkout
— do not run `npm install`. This brief is everything you have: no prior
conversation. The round-1 report is at `<worktree>/RESULT1.md` and the sealed
review that judged it at `<worktree>/REVIEW1.md`; read both, but THE STANDARD
IS the quoted task text below and the five findings in "## What this round
fixes", not either report.

## Ground rules (non-negotiable)

- Never use the token `cd` anywhere — not in a command, a comment, or a
  script: the approval guard matches the token and refuses the call. Run
  everything by absolute path; git is
  `git -C D:/addictedtoai-worktrees/fleet6-stage0-F ...`.
- Keep shell commands short; put anything multi-step in a `.mjs` file under
  `D:/addictedtoai-worktrees/fleet6-stage0-F/.job/` and run that. Delete the
  probe files you create and say so in your report.
- Do NOT run `npm run build`, any `scripts/verify-*.mjs` as a whole, the
  Pulse, the Desk, `git push`, `gh`, or `bd close`/`bd update`. Do not edit
  `package.json`, `runners.yml` (RESERVED — the three `enabled: false` lines
  are the orchestrator's and land at the handover), `data/config.json`,
  `CLAUDE.md`, `AGENTS.md`, anything under `data/`, or any file outside the
  "## Files" list below.
- NEVER run `node loop/conformance.mjs` against a real repository: it spawns a
  runner and WRITES `data/conformance.json`, which is reserved. Exercise
  `recordConformance` on a throwaway context under the OS temp directory.
- Never `git worktree remove` and never delete a `node_modules`: a forced
  removal follows the junction and in a single attempt deleted 177 packages on this machine.
- A blocked or refused command is REPORTED in your report, not routed around.
- Every date you write is this machine's LOCAL date, read from
  `node -p "new Date().toLocaleString('sv-SE')"`.
- Never name a model, provider or harness in any file under `loop/`, `pulse/`,
  `scripts/`, `lib/`, `app/` or `tools/` — `runners.yml` is the only file that
  may, and you are not editing it. This includes test fixtures: the
  portability scan reads test files too.

## What this round fixes

The sealed review returned `revise` on FIVE findings. FOUR of them are the same
class — AN EXPECTATION DERIVED FROM THE THING IT IS SUPPOSED TO CHECK, which
makes the arm pass no matter what the code does. Each of those four is stated
with the mutation the reviewer performed that STAYED GREEN, and your round is
green only when that mutation goes RED.

FINDING 2 IS NOT ONE OF THOSE FOUR AND IS NOT A DEFECT IN YOUR WORK. Round 1
implemented task 21(vi)(b) exactly as that task is written; the gap is in the
task text, which is the architect's, and the sealed review's original account of
it was itself wrong on two points that have since been measured and corrected.
It is stated below with what is actually true, including the instruction it
withdraws. Read it as a small forward-looking tightening, not as a rebuke.

**FINDING 1 — the exported selector never surfaces the conformance entry count
to a programmatic caller.** CLASS: count-surface and test coverage.
`loop/lib/select.mjs:146-272` is `selectJob`, the exported programmatic reader.
It calls `conformanceGate` at `:170`, trusts `conformance.ok`, and returns
without carrying `conformance.entries`; the documented return shape at
`:107-112` names no count. Task 21(b) requires that a programmatic reader
**report the record count it loaded before trusting a verdict** — the
`loadConformance` trap, where a reader that loaded ZERO records because the file
was unreadable is indistinguishable from one that loaded many and found no FAIL.
Both return `ok: true`. The refusal reason already ends with the count; the
ALLOWED path is where the trap actually bites, and it carries nothing.
THE REVIEWER'S MUTATION THAT STAYED GREEN: replacing `reason: conformance.reason`
with the generic string `conformance failure` — 19/19 still passed, so nothing
pins the count surface outside the refusal reason.

WHAT MAKES IT RIGHT, and THE SEAM IS FIXED — do not choose:
`selectJob` carries the count in its own returned object. `loop/run.mjs` is
READ-ONLY this round and needs no edit: it already logs the count at
`:979-983`, and that log is not the thing missing.
`selectJob` has exactly FIVE return sites — `:157`, `:172`, `:190`, `:204`,
`:261`. FOUR of them (`:172`, `:190`, `:204`, `:261`) execute after the gate at
`:170` has been consulted, and each must carry the count. The fifth, `:157`, is
the `enabled: false` early return, which fires BEFORE the gate is consulted: it
loaded nothing and trusted no verdict, so it owes no count. Do not invent one
there, and do not move the gate above it to manufacture one — the ordering at
`:151` is task 22's requirement.
Update the `@returns` block at `:107-112` to name the field. Add arms asserting
the count on the ALLOWED path, on the UNRECORDED path, and on the refusal path.

AND THE MUTATION YOU REPORT IS NOT THE ONE ABOVE. The reviewer's generic-reason
swap stays GREEN even after you fix this correctly, and that is by design: with
the count in its own field, the refusal *string* no longer has to carry
it, so swapping the string moves nothing. Reporting that swap as your red
mutation would put a mutation in the table that the fix does not make red —
exactly the defect this round exists to close. THE POST-FIX RED MUTATION IS
DROPPING THE COUNT FIELD: delete it from one of the four return sites, or return
it as `0` or `undefined`, and show the arm for that path going red. Do that for
each of the three arms you add, and put those rows in the table.

**FINDING 2 — the change-directory check no longer catches a TERMINAL
reference.** CLASS: forward-looking enforcement gap. READ THE NEXT PARAGRAPH
BEFORE THE FINDING: it is not a defect in your round-1 work.

ROUND 1 IMPLEMENTED THE STANDARD AS WRITTEN, AND THE STANDARD IS MINE.
Task 21(vi)(b) says in as many words that `BAD_REFERENCE` "captures only the
prefix today, so the recorded `v.reference` is the bare `openspec/changes/` for
every hit and carries nothing the allow-list regexes could test", and directs
that F "widens the capture to run through the segment that follows and its
closing `/`", with `isAllowed` testing the entry's regex against that span.
That is precisely what `scripts/no-change-dir-refs.test.mjs:19` now does, and
the narrowing of `isAllowed` from `v.text` (the whole LINE) to `v.reference`
(the matched SPAN) is a real tightening with its own arm. None of that is being
undone. The gap below is a consequence my task text did not foresee.

THE GAP. Requiring the segment to end in `/` means a TERMINAL reference —
`openspec/changes/<name>` with nothing after the name — is now permitted where
it was refused. Measured on literals:

    "openspec/changes/foo"                shipped 0 matches   proposed 1
    "openspec/changes/foo/bar.md"         shipped 1 match     proposed 1 (same span)
    "openspec/changes/archive/x/y.md"     shipped 0           proposed 0

A terminal reference is exactly what archiving moves, so this is the case the
rule exists for.

IT IS NOT LIVE, AND THE EARLIER CLAIM THAT IT WAS IS WITHDRAWN. Scanning all
302 tracked `.mjs`, `.js`, `.ts` and `.tsx` files under `lib`, `loop`, `pulse`,
`scripts`, `app` and `tools` for a terminal reference the shipped pattern misses
returns **ZERO**. One line does differ between the old and new patterns —
`loop/lib/specs.mjs:43`, "the directories under `openspec/changes/`" — but that
is the BARE PREFIX naming no change at all. Archiving never moves
`openspec/changes/` itself, so the new pattern is RIGHT to ignore it, and
deleting its now-unmatchable allow-list entry was correct. **Do not restore that
entry.** It cannot be restored even in principle: its regex `/openspec\/changes\/\x60/`
tests for a backtick, `isAllowed` now tests the matched SPAN rather than the
line, and no span ever contains the backtick — so a restored entry would fail
the `every allow-list entry has a reason and is still live` test at `:111` and
turn the suite red.

WHAT MAKES IT RIGHT — one character, plus arms. Make the closing slash
OPTIONAL, so the span runs through the segment and takes the `/` when there is
one:

    const BAD_REFERENCE = new RegExp(`${CHANGE_DIR}(?!archive/)[^\\s/'"\\x60]+/?`, 'g');

Measured consequences, all of them, so nothing surprises you:
- the terminal form is caught again;
- the path form's span is BYTE-IDENTICAL, so both existing `ALLOWED` entries
  still match `v.reference` and the "still live" test at `:111` stays green;
- the archive path form is still ignored;
- the bare prefix is still ignored;
- over all 302 files the violation set is UNCHANGED — 3 raw hits before, 3
  after, zero added, zero lost. This fix cannot turn the suite red today; it
  only refuses a reference nobody has written yet.
- ONE case does change on literals and there are zero instances of it in the
  tree: a terminal `openspec/changes/archive` — the archive PARENT with no
  trailing slash — is now flagged. Leave that as it stands; do not add a
  lookahead to carve it out. If it ever appears it is allow-listable, and
  machinery should be reading the live spec rather than naming that directory
  either.

ARMS REQUIRED — four, because the deleted allow-list entry took a recorded
reason with it and an arm is a stronger record than a comment:
(a) the terminal form `openspec/changes/<name>` is FLAGGED;
(b) the path form `openspec/changes/<name>/<file>` is flagged and its span is
    the segment plus its slash, asserted as an exact string;
(c) the archive path form is IGNORED;
(d) the BARE PREFIX `openspec/changes/` followed by a backtick — the
    `loop/lib/specs.mjs:43` shape — is IGNORED, with a comment naming why it is
    deliberate: it designates no change, so archiving never moves it.
Arm (d) is the replacement for the deleted entry's reason, and it is the point
of this finding as much as the pattern is.

**FINDING 3 — no fixture carries TWO distinct failed check names with divergent
later histories.** CLASS: test coverage, per-check history.
`loop/tests/conformance.test.mjs:116-201`. The gate at
`loop/lib/runners.mjs:195-247` is meant to track every failed check
INDEPENDENTLY; the name collector is `:200-210` and the per-name history walk
is `:212-229`.
THE REVIEWER'S MUTATION THAT STAYED GREEN: changing the name collector at
`:204` from `seen.has(check.name)` to `seen.size > 0`, so only the FIRST failed
name is ever tracked — 14/14 still passed. In that wrong world a runner whose
check A is superseded but whose check B still stands is ALLOWED to author.
WHAT MAKES IT RIGHT: a history with at least two distinct failing check names
whose later sequences DIVERGE (one superseded by three consecutive passes, one
not), asserting the COMPLETE `failed` set and the refusal.

**FINDING 4 — the omission arm empties the whole `checks` array instead of
omitting the failed check while another check is present.** CLASS: test
coverage, absent-check shape.
`loop/tests/conformance.test.mjs:228-243`. The per-name lookup at
`loop/lib/runners.mjs:217` (`(entry?.checks ?? []).find(...)`) therefore has no
arm against falling back to a DIFFERENT check's result.
THE REVIEWER'S MUTATION THAT STAYED GREEN: making that lookup use the first
available check when the named check is absent — 14/14 still passed. In that
wrong world check A has a standing FAIL, a later entry omits A but carries
B = PASS, and B's PASS counts toward A's run of passes. That is the exact
inverse of the "ABSENCE IS NOT A PASS" clause this arm exists for.
WHAT MAKES IT RIGHT: a fixture where the failed check is OMITTED from an entry
that CONTAINS A DIFFERENT CHECK, asserting the run of passes resets; keep the
existing whole-array-empty case as the control.

**FINDING 5 — `loop/tests/portability.test.mjs` derives its expected per-root
set from the same list it builds the scan from.** CLASS: test coverage,
expectation scope.
`:32` and `:162-165`. The external fixture only covers `lib/`, `app/` and
`tools/`.
THE REVIEWER'S MUTATION THAT STAYED GREEN: removing `loop` from
`RUNNER_SCAN_ROOTS` — 15/15 still passed, because the root vanishes from the
scan AND from its own expectation together, leaving the machinery's most
relevant root silently unscanned.
WHAT MAKES IT RIGHT: an INDEPENDENT expected set of the six roots, written out
rather than derived, asserting that the scan's output contains files
contributed by every one of them; plant independent fixtures for all six roots
if that is what it takes.

## What you must NOT do

- Do not restate or re-litigate round 1's design. Its production behaviour was
  judged sound apart from finding 1; you are closing coverage gaps and one
  regression.
- Do not widen scope. If you believe a finding is wrong, say so in your report
  with evidence and implement it anyway, flagging the disagreement.
- Do not leave any mutation applied. Every mutation you perform is restored
  before you commit and PROVED restored by SHA-256 in your report.

## The standard (verbatim, `tasks.md` at the authority commit)

Tasks 21 and 22:

> - [ ] 21. **The conformance record appends; the gate reads the history.**
>       `loop/conformance.mjs` and `data/conformance.json`: each run is its own entry
>       — date, per-check result, model-minutes — and never replaces an earlier one.
>       Each entry is written **from the checks' verdicts after they complete**,
>       never from an earlier signal such as the harness exiting 0: the general
>       rule, named by A2AI-Orch on 2026-09-08 after packet A's round 2 found the
>       build success record written before its floor ran, is that **a record
>       asserting a check passed is written from that check's verdict, never from
>       a signal that precedes it** — the same sentence governs task 3's build
>       record and this file, and `addictedtoai-2wwu` is the same defect one
>       layer down (a re-run overwriting a FAIL with a record byte-identical to
>       one that never failed).
>       `conformanceGate` refuses a runner for a role while any recorded FAIL of a
>       check stands unsuperseded, and a FAIL is superseded only by **three
>       consecutive PASSes of that same check**. A runner with no record still warns
>       rather than refuses. Implements: *A swap has a stated procedure and a
>       conformance check*, the append and history bullets. Serves
>       **`addictedtoai-2wwu`** (P1) and lifts its two acceptance clauses:
>       **(a) prove the threshold does the work, not the rewrite** — one fixture whose
>       history is FAIL then PASS, asserted **refusing at N > 1** and **allowing at
>       N = 1**, the second arm existing to demonstrate that N = 1 reproduces today's
>       defect exactly, so the test measures the threshold rather than the fact that
>       the file changed shape; **(b) preserve that an absent record WARNS rather than
>       refuses**, which is deliberate, and assert that any programmatic reader
>       **reports the record count it loaded** before trusting a verdict — the
>       `loadConformance` trap, where a broken reader is indistinguishable from a
>       permissive gate. Further tests: fail-then-three-passes is allowed and the
>       failure is still readable. **Mutation**: restore overwrite semantics and
>       confirm the fail-then-one-pass case is wrongly allowed — which is today's
>       behaviour, and today's instance survives only because the record happened to
>       be committed between the two runs.
>       **Resolved before F's freeze (the architect's quantifier enumeration,
>       2026-09-09 13:35, from the code at `dc54da0`):** (i) THE RECORD TODAY:
>       `data/conformance.json` is `{ [runnerId]: { runner, date, pass,
>       checks: [{ name, result, evidence, mm, condition }] } }`, one object
>       per runner, nine runners recorded, OVERWRITTEN by `recordConformance`
>       (`loop/conformance.mjs:406-419`: `all[record.runner] = record`); the
>       four check names are fixed by `CHECKS` in the same file; each check
>       already carries its `mm`. (ii) THE SHAPE AFTER F: `records[runnerId]`
>       is an ARRAY of run entries, oldest first, each entry today's record
>       object unchanged (`{ runner, date, pass, checks }`); `recordConformance`
>       APPENDS and rewrites nothing else in the file. MIGRATION IS BY
>       NORMALISATION, NOT BY EDIT: a new exported
>       `conformanceHistory(records, runnerId)` in `loop/lib/runners.mjs`
>       returns `[]` for an absent runner, `[record]` for today's single-object
>       form (the object has `checks`) and the array as-is for the new form —
>       so the committed `data/conformance.json` (reserved: no job edits
>       `data/`) needs no hand migration, the first F-era run appends to a
>       one-entry history, and every earlier failure stays readable. Both
>       `recordConformance` and `conformanceGate` go through it. (iii) THE GATE:
>       `conformanceGate(records, runnerId, { passesToSupersede = 3 } = {})`
>       (`runners.mjs:172-187` today) reads the history per CHECK NAME: walking
>       the entries oldest to newest, a FAIL of a check stands until that same
>       check records PASS in `passesToSupersede` CONSECUTIVE later entries; an
>       entry in which the check is absent or not `PASS` breaks the run of
>       passes (absence is not a pass), so FAIL, PASS, PASS, FAIL, PASS refuses
>       and FAIL, PASS, PASS, PASS allows. The entry-level `pass` boolean is no
>       longer read by the gate (it stays on the entry as the run's own
>       verdict). The threshold is a PARAMETER because the spec calls three "a
>       value rather than a principle" and because task 21(a) needs the gate
>       called at 1 to show N = 1 reproduces today's defect; the default is 3
>       and nothing in the tree passes another value. The refusal `reason`
>       names each unsuperseded check, the date of its standing FAIL and the
>       passes since, and ends with the count of entries read. (iv) THE COUNT —
>       task 21(b) and the requirement's "confirm how many records it loaded
>       before trusting any verdict": the gate's return carries `entries: <n>`
>       (0 with `unrecorded: true` for no record), and BOTH programmatic
>       readers print it before acting — `run.mjs:969-977` logs the record
>       count for the runner on the line before the refusal or the unrecorded
>       note, and the selector's early-return reason (`select.mjs:154-167`) is
>       the gate's reason, which already ends with the count. `loadConformance`'s
>       return shape does not change. (v) WRITTEN FROM THE VERDICTS: already
>       true by construction — `main` (`conformance.mjs:437-470`) records only
>       after `runConformance` has resolved with all four results and the exit
>       code is computed from the record; F adds no mechanism for it and the
>       brief says so; the existing arm at `conformance.test.mjs:147-166` (a run
>       killed mid-check) is the evidence and stays. (vi) TESTS, in
>       `loop/tests/conformance.test.mjs` (which already owns the gate arm at
>       `:73-103` and imports `recordConformance`): (a) a history of FAIL then
>       PASS on the fabrication check — refused at the default (3) AND at 2,
>       allowed at `passesToSupersede: 1`, the second assertion existing to show
>       N = 1 is today's defect; (b) an absent runner gives `ok`, `unrecorded`,
>       `entries 0`, and a dry-run `runLoop` on it logs the note and the count
>       0; a two-entry history gives `entries 2` before any verdict; (c) FAIL
>       then three PASSes — allowed, `entries 4`, the FAIL still present in the
>       file; (d) FAIL, PASS, PASS, FAIL, PASS — refused (the run of passes
>       reset); (e) the legacy single-object record gives `entries 1`, and a
>       legacy FAIL still refuses; (f) `recordConformance` twice gives two
>       entries, the first byte-equal to what it was; (g) ABSENCE IS NOT A PASS,
>       which needs its own fixture because no other arm contains an absent
>       check: FAIL, PASS, an entry whose `checks` omits that check entirely,
>       PASS, PASS — refused, because the omission breaks the run and only two
>       consecutive passes follow the FAIL. MUTATIONS (perform, red, restore):
>       the overwrite restored (`all[record.runner] = record`) turns (c)'s
>       "still present" and (f) red, and the fail-then-one-pass fixture is
>       wrongly allowed under a re-run — today's behaviour, task 21's named
>       mutation; the default threshold 3 to 1 turns (a)'s refusal at the
>       default red; an absent check treated as PASS turns (g) red and ONLY
>       (g) — it leaves (d) green, since (d) carries no absent entry, which is
>       why (g) exists.
>       (vii) CLOSURE (grepped at `dc54da0`): readers of the record are
>       `select.mjs:154` and `run.mjs:970` only; tests that WRITE the legacy
>       shape and must stay green through normalisation, UNEDITED —
>       `exit-code-refusal.test.mjs:81-95` (a legacy FAIL exits 2) and
>       `runner-policy.test.mjs:111-131` (packet D's conformance arm);
>       `conformance.test.mjs:94` parses the file and hands it to the gate, so
>       the gate must accept the file's array form;
>       `pulse/tests/publish.test.mjs:731` names the path only; no test pins the
>       file's whole shape by `deepEqual`. Documentation that reads the record —
>       `CLAUDE.md`'s conformance paragraph and `runners.yml`'s `conformance:`
>       fields — is the orchestrator's and says "record" per runner; the JSON
>       stays the authority. Files: `loop/conformance.mjs`,
>       `loop/lib/runners.mjs`, `loop/run.mjs` (the count line only),
>       `loop/tests/conformance.test.mjs`.
> - [ ] 22. **A registered runner that policy names for nothing needs a way to say
>       so.** An absent `job_types` means **cleared for every type**
>       (`select.mjs:132-134` returns ok on `!Array.isArray`; the comment at `:122`
>       says so outright) and an empty list is a load-time error, so the registry
>       today cannot express "registered, conformance-passing, cleared for no work" —
>       and a rung left without `job_types` is eligible for anything the escalation
>       path reaches. Add an explicit **`enabled: false`** field: `loop/lib/runners.mjs`
>       loads it, **absent meaning enabled** — the same fail-open convention
>       `job_types` uses, for the same backward-compatibility reason; the selector
>       refuses a disabled entry for **both roles**, **before every other gate** (the
>       registry's own comment explains why the job-type gate sits first today — the
>       refusal line a person reads should name the real reason — and a disabled entry
>       has the stronger claim to that position); and the escalation path never
>       escalates onto one. Implements: *Runner selection is a declared policy, and
>       escalation is part of it*, the enablement bullet. Test **both arms**: an entry
>       with `enabled: false` named as `--runner` selects nothing and reports
>       `runner:disabled`, **and** an entry omitting the field is still selectable.
>       **Mutation**, both arms too: ignore the field and confirm the disabled entry
>       selects; default it to disabled and confirm every pre-existing entry stops
>       selecting. **[orchestrator]** for the `runners.yml` half. **Until this ships,
>       `high` is unnamed by discipline rather than by mechanism**, and the artifacts
>       say so — a discipline standing in for a mechanism is invisible until it
>       lapses, which is the shape of the serial rule this change lifted.
>       **Added 2026-09-08 from B1 round 3's sealed review** (the first review
>       brief that named PROPERTIES and made the reviewer find the enforcement;
>       it returned the enforcement's real scope on its first use — ruled by the
>       architect, verified against the file by Luna-Boss-2): the naming rule's
>       enforcement in `loop/tests/portability.test.mjs` is two scans with two
>       scopes. The model/provider/harness-name scan covers `loop/` and
>       `data/config.json` only, and its narrowing over `pulse/` and `scripts/`
>       is DELIBERATE and recorded at `:115-123` (`pulse/lib/derive.mjs` splits
>       catalog row ids of the form vendor/model; `pulse/verify-zero-model.mjs`
>       enumerates provider env-var prefixes to prove none is set — the site's
>       subject, not configuration — so the runner ID is the enforced form, "the
>       only handle the loop offers"); `lib/` and `app/` name models as subject
>       matter and are the same false positive at scale. The gap that is real and
>       cheap: the runner-id scan's targets at `:127-132` are `loop/`, `pulse/`,
>       `scripts/` and `data/config.json` — `lib/`, `app/` and `tools/`, the
>       three roots the change-directory rule already covers, are in neither
>       scan, and a runner id has no legitimate reason to appear under any of
>       them. And BOTH scans assert `deepEqual(scan(targets, …), [])` with
>       nothing asserting that `targets` is non-empty: they pass on absence and
>       would pass identically if `filesUnder` returned nothing (a renamed
>       directory, a changed extension list, a path that stops resolving); the
>       same file uses the count idiom at `:247` (`assert.ok(sources.length >
>       5)`), so this is an omission, not a convention. Therefore, in this
>       packet, three parts: **extend the runner-id targets to `lib/`, `app/`
>       and `tools/`; plant a fixture id under EACH of the three roots and
>       require the arm to go red for each, named as mutations; and assert a
>       floor on the number of files actually scanned in BOTH tests**, so a scan
>       that reads nothing fails instead of passing — widening a scan that
>       cannot tell "found nothing" from "read nothing" widens what it claims
>       without widening what it can catch. Recorded, not tasked here: the live
>       spec's "nothing else in the system names a model, provider, or harness"
>       (`openspec/specs/loop/spec.md:424`) and CLAUDE.md's "runners.yml is the
>       only file in loop/, pulse/, scripts/ and data/config.json that may name a
>       model" are both wider than the enforced form, for the reason the test
>       records; CLAUDE.md's sentence is the orchestrator's to correct after
>       Stage 0. **Second enforcement gap of the same class, from B1 round 4's
>       sealed review (finding 6, verified by Luna-Boss-2):**
>       `scripts/no-change-dir-refs.test.mjs:33-47` allow-lists per FILE with a
>       blanket `match: CHANGE_DIR`, so any change-directory reference anywhere
>       in `loop/lib/specs.mjs`, `scripts/check-spec-deltas.mjs` or its test
>       passes — including the NAMED, pre-archive path
>       `openspec/changes/build-initial-site/specs/<cap>/spec.md` in
>       `specs.mjs`'s comment at `:23`. Each stated reason justifies GENERIC
>       path construction over every in-flight change, not a named one. In the
>       same packet: narrow each allow-list entry to the generic form its reason
>       describes (a template or `join` over a variable change name), so a
>       literal `openspec/changes/<name>/` in an allowed file fails; reword the
>       `:23` comment to the archive form, which is what a document that must
>       name the change writes; and plant a named path in an allow-listed
>       fixture file and require the test red, named as a mutation. Same rule
>       as the floor above: an allow-list wider than its reason is an
>       expectation file whose unlisted case is permitted but unguarded.
>       **Both enforcement items DONE at `e8a2da7` (2026-09-09 00:01 local):
>       the medium-vs-max experiment's max branch `exp/max-d75275c@8abe800`
>       (base `96e15fa`, brief authority `d75275c`), chosen by two sealed,
>       mirrored blind reviewers from opposite positions, read by Orch, its full
>       suite on `8abe800` 1,735 of 1,735 in 438 s; record in design.md round
>       16; evidence in `evidence/experiments/medium-vs-max-2026-09-08.md` and
>       `evidence/reviews/experiment-medium-vs-max/`.** What landed: runner-id
>       targets `lib/`, `app/` and `tools/`; a fixture id under each root
>       asserted independently with its mutation named in a comment;
>       `MIN_SCANNED_FILES = 2` asserted in both scans; every allow-list entry
>       narrowed to the literal template form its reason describes;
>       `specs.mjs:23` in the archive form; a planted named path on a separate
>       line goes red. The `enabled: false` half of this task stays open for
>       packet F. **CARRIED TO PACKET F on this task — the measured gaps in what
>       landed, from the judges and the diff read, none a reason to withhold the
>       merge:** (a) `app/` is LISTED AND CONTRIBUTES ZERO FILES: the runner-id
>       scan's extensions are `.mjs .md .json .yml` and `app/` holds 32 files,
>       all `.tsx`/`.ts` (Orch, live tree; `tools/` contributes 11, `lib/` 227),
>       so the per-root fixture proves the target list names `app/`, not that
>       any `app/` file is ever scanned — F adds `.tsx`/`.ts` to the RUNNER-ID
>       scan's extensions (the `:115-123` false-positive argument is about the
>       model-name scan, not this one) and asserts per root that each listed
>       root contributes at least one file, the mechanical form that would have
>       failed `app/` today and turns the collapse-detecting floor into a
>       coverage one; (b) `scripts/no-change-dir-refs.test.mjs:70` decides per
>       LINE, so a named path on the same line as an allowed generic template
>       passes in the merged tree (both judges, 3 of 3 green) — F makes the
>       allowance apply to the matched span rather than the line, with a
>       same-line planted path as the named mutation; (c) the floor VALUE
>       (`portability.test.mjs:133`, `:162`: `>= MIN_SCANNED_FILES` mutated to
>       `>= 0` stays green) and the recursive `skipTests` propagation (`:39`)
>       have no arm (judge 2) — F adds one each or records why an arm cannot
>       reach it. Packet F's brief drops the two enforcement paragraphs above
>       as written and carries (a)–(c) in their place. **Added 2026-09-09
>       00:36 (the maintainer's "max for everything", Orch's
>       `addictedtoai-v8q8`, agreed by both):** when `enabled: false` ships,
>       it goes on `codex-gpt-luna-medium` as well as `-high` and `-xhigh` —
>       the entry stays defined (its conformance record survives; "for now"
>       is reversible) and unselected by mechanism rather than by discipline.
>       **Resolved before F's freeze (the architect's quantifier enumeration,
>       2026-09-09 13:35, from the code at `dc54da0`; the registry at
>       `08ae8b0`):** (i) THE FIELD: `loadRunners` (`runners.mjs:34-97`, which
>       validates known keys and ignores unknown ones, so the field is purely
>       additive) accepts an optional `enabled`; when present it must be a
>       boolean (a load-time error otherwise, the `effort` pattern at
>       `:80-82`); absent means enabled. (ii) WHERE THE REFUSAL LIVES — "both
>       roles, before every other gate" — is three places with one rule: (1)
>       `run.mjs`, immediately after the two `pickRunner` calls (`:943-944`)
>       and before the conformance gate at `:970` and the health loop at
>       `:1125-1136`, a loop over both roles that on `who.enabled === false`
>       logs a `runner:disabled` refusal and returns `{ started: true,
>       selected: null, refused, rule: 'runner:disabled' }` — the shape the
>       health loop returns; (2) `selectJob` (`select.mjs:146-256`), a FOURTH
>       early return placed BEFORE the conformance return at `:154`, in the
>       shape of the three at `:156-198` (`selected: null, topRanked: null`, one
>       refusal with rule `runner:disabled`, `blocked`), so the pure selector
>       refuses a disabled entry on its own, the escalation re-run refuses one,
>       and packet D's early-return contract (`topRanked` null) gains its fourth
>       member; (3) `escalationTarget` (`select.mjs:265-269`) returns `null`
>       when the declared target has `enabled === false` — "never escalates onto
>       one" decided by the pure helper and confirmed by (2). (iii) `pickRunner`
>       (`runners.mjs:124-142`) does NOT throw on a disabled explicit id — it
>       returns the entry so the run can REPORT the refusal (task 22's arm says
>       "selects nothing and reports `runner:disabled`", not "crashes") — and
>       its default and alternate searches (`:137-141`) skip disabled entries,
>       so a disabled default cannot make every unflagged run refuse; the
>       shipped default is enabled, so this is a rule with no live case.
>       (iv) TESTS, in `loop/tests/runner-policy.test.mjs` (packet D's file,
>       which owns the policy registry and the escalation fixtures): (a) the
>       cheap entry with `enabled: false` named as `--runner`: `selection()`
>       returns `selected` null, `topRanked` null, the first refusal's rule
>       `runner:disabled`, `blocked` set; and the dry-run `runLoop` on it
>       returns `refused` with that rule and the log names it; (b) an entry
>       OMITTING the field loads with `enabled === undefined` and is selectable
>       — asserted explicitly, not left to the other arms; (c) a disabled
>       REVIEWER whose ledger also makes it produce nothing: the run is refused
>       for the reviewer role with rule `runner:disabled`, not the health rule —
>       the proof of "before every other gate"; (d) the scout fixture of arm (a)
>       with the FRONTIER entry `enabled: false`: `escalationTarget` returns
>       `null`, the run keeps the original outcome and the log names the
>       disabled target; (e) a non-boolean `enabled` fails `loadRunners` with
>       the exact message; (f) a registry whose `default:` is disabled and no
>       `--runner`: `pickRunner` returns the first enabled author-capable entry.
>       MUTATIONS, task 22's two by name: ignore the field (drop (ii)(1) and
>       (ii)(2)) turns (a), (c) and (d) red; default it to disabled (`enabled
>       !== true`) turns (b) red and every pre-existing selection arm in the
>       file red; plus, per changed function: the `escalationTarget` check
>       dropped turns (d) red, and `pickRunner`'s skip dropped turns (f) red.
>       (v) THE REGISTRY HALF, **[orchestrator]** (`runners.yml`): `enabled:
>       false` on the three Luna rungs the 00:36 paragraph names; at `08ae8b0`
>       the medium entry also carries `escalates_to`, which is inert on a
>       disabled entry and stays. CLOSURE:
>       `selector-rules.test.mjs:415-448` loads the REAL registry and exercises
>       `runnerJobTypeGate` per entry — a pure call, unaffected by `enabled`;
>       `runner-policy.test.mjs:184-237` and packet D's arms use their own
>       registries; `data/conformance.json` keeps the three entries' records,
>       untouched. (vi) THE CARRIED GAPS (a)–(c): (a)
>       `loop/tests/portability.test.mjs:97-105` `runnerTargets()`: the
>       extension list of the RUNNER-ID scan gains `.ts` and `.tsx` on every
>       root, and the runner-id test asserts PER ROOT that each of the SIX
>       directories `runnerTargets()` lists (`loop/`, `pulse/`, `scripts/`,
>       `lib/`, `app/`, `tools/` — NOT the three of `RUNNER_FIXTURE_ROOTS` at
>       `:32`, which is a different, fixture-planting test) contributed at least
>       one scanned file, obtained by calling `filesUnder(<root>, <the extension
>       list>, [], { skipTests: true })` per root rather than by changing what
>       `scan` returns; that is the mechanical form that
>       would have failed `app/` at 32 files and 0 scanned; `MIN_SCANNED_FILES`
>       stays as the collapse floor. TWO MEASURED CORRECTIONS to the carried
>       paragraph above, made here because the brief quotes it verbatim and a
>       worker must not act on a wrong count (counted in the worktree,
>       2026-09-09 13:58): `app/` holds 32 files but NOT "all `.tsx`/`.ts`" — it
>       is 27 `.tsx`, ONE `.ts` (`app/sitemap.ts`, a real source), three `.mjs`
>       and one `.css`; and the scan contributes ZERO not because `app/` holds
>       no `.mjs` but because all three of its `.mjs` files are `*.test.mjs`
>       (`app/frontier/page.test.mjs`, `app/index-route-jsonld.test.mjs`,
>       `app/sitemap.test.mjs`) and `runnerTargets()` passes
>       `{ skipTests: true }`, which `filesUnder` applies at `:40`. The carried
>       paragraph's `:115-123` citation has also drifted: the deliberate-narrowing
>       comment now reads at `:146-155`, and `:115-123` is the model scan's name
>       collection. The model-name scan (`:91`) is NOT widened
>       — its narrowing is deliberate (`:146-155`). Mutation: `.tsx` dropped
>       from the list leaves `app/sitemap.ts` scanned and the assertion GREEN,
>       so the one-extension mutation measures nothing: BOTH `.ts` and `.tsx`
>       must be dropped for the `app/` per-root assertion to go red, and that is
>       the mutation. (b)
>       `scripts/no-change-dir-refs.test.mjs:69-71` `isAllowed` tests the
>       allow-list regex against the whole LINE (`entry.match.test(v.text)`);
>       F tests it against the matched SPAN. `BAD_REFERENCE` (`:19`) captures
>       only the prefix today, so the recorded `v.reference` is the bare
>       `openspec/changes/` for every hit and carries nothing the allow-list
>       regexes could test; F widens the capture to run through the segment that
>       follows and its closing `/`, and `isAllowed` tests the entry's regex
>       against that span — so a named path on the same line as an allowed
>       template fails on the named one, and the allow-list's own "still live"
>       test at `:87` keeps passing. Mutation: plant a named change path on the
>       same line as an allowed template in an allow-listed file and the test
>       goes red; remove the plant. (c) the floor VALUE and `skipTests`: extract
>       the floor into an exported helper used at `:133` and `:162`, with an arm
>       that hands it a one-file result and asserts false (mutation: the minimum
>       compared as `>= 0` turns it red); and an arm on `filesUnder(dir, exts,
>       [], { skipTests: true })` over a throwaway tree whose test file sits one
>       directory down, asserting it is excluded with the flag and included
>       without (mutation: the flag not propagated at `:39` turns it red).
>       (vii) FROM BEAD `addictedtoai-tbho` (the orchestrator's; its criteria 3
>       and 4 are cheap and homeless): a comment beside `authority_sha` in
>       `loop/lib/ledger.mjs` stating the two limits, which the bead words as
>       follows and which are quoted here so the brief carries them and no
>       worker has to invent the wording — **"1. IT BUYS AUDITABILITY, NOT
>       PREVENTION. Nothing about recording a sha stops the text moving under a
>       run. What caught the churn on 2026-09-08 was a HABIT — re-reading the
>       committed blob immediately before dispatch — and that habit stays and is
>       not replaced by this field. A freeze agreed between sessions is what
>       holds the text for the duration of a run; this records which text that
>       was. 2. THE FLEET HAS NO LEDGER LINE. The hand-driven codex worker
>       pipeline that is implementing Stage 0 writes no ledger entry at all, so
>       until Stage 3 retires the fleet its form of this field is a line in
>       RESULT.md and in the handover: `authority: <change>@<sha>`, adopted from
>       packet A round 3 onward."** The comment may compress that prose but
>       SHALL state both limits and SHALL NOT name a model, provider or harness;
>       no test pins its wording. And the MUTATION performed in the worktree and recorded in
>       the report, not committed: `LEDGER_FIELDS` extended to require
>       `authority_sha` turns THREE assertions red, and a run that finds only
>       two has not found them all — `issues.test.mjs:242-243` (the field is
>       not in `LEDGER_FIELDS`), `portability.test.mjs:409` (a minimal line's
>       keys equal `LEDGER_FIELDS`), and
>       `gate-transport-retry.test.mjs:878-882`, which packet E left asserting
>       that the keys OUTSIDE `LEDGER_FIELDS` are exactly
>       `['authority_sha', 'brief_chars', 'phases']` — moving the field inside
>       makes that list `['brief_chars', 'phases']`. The third was missed by
>       this enumeration until the brief review found it; it is named here
>       because a mutation whose red list is short reads as a partial failure
>       to the worker who runs it. Files for F, the closure over the
>       change: `loop/conformance.mjs`, `loop/lib/runners.mjs`,
>       `loop/lib/select.mjs`, `loop/run.mjs`, `loop/lib/ledger.mjs` (the
>       comment only), `loop/tests/conformance.test.mjs`,
>       `loop/tests/runner-policy.test.mjs`, `loop/tests/portability.test.mjs`,
>       `scripts/no-change-dir-refs.test.mjs`. Read-only:
>       `loop/tests/helpers.mjs`, `loop/tests/exit-code-refusal.test.mjs`,
>       `loop/tests/selector-rules.test.mjs`, `loop/tests/issues.test.mjs`.
>       Reserved: `runners.yml`, `data/`.

## Files

Work only in these:

- `loop/lib/select.mjs` — finding 1 only: carry the conformance entry count on the four return sites that follow the gate, and name it in the `@returns` block
- `loop/tests/runner-policy.test.mjs` — finding 1's arms
- `loop/tests/conformance.test.mjs` — findings 3 and 4
- `loop/tests/portability.test.mjs` — finding 5
- `scripts/no-change-dir-refs.test.mjs` — finding 2: the one-character pattern fix and its four arms. The allow-list is NOT touched — finding 2 withdraws the instruction to restore the deleted entry and says why
- `RESULT2.md` — (new) your report, at the worktree root, uncommitted

`loop/conformance.mjs`, `loop/lib/runners.mjs`, `loop/lib/ledger.mjs` and
`loop/run.mjs` were correct in round 1 and are READ-ONLY this round. There is no
escape hatch on `loop/run.mjs`: finding 1 is satisfied entirely inside
`loop/lib/select.mjs`, and `run.mjs` already logs the count at `:979-983`. If
you believe you need to edit a read-only file, stop and say so in your report
rather than editing it.

## How to work

1. Read `REVIEW1.md`. For findings 1, 3, 4 and 5, reproduce the mutation the
   reviewer describes and confirm for yourself that it stays green today. A
   finding you cannot reproduce is a finding you report rather than implement
   blindly. Finding 2 carries no such mutation — it is a pattern gap, and the
   measurements stated in it are the evidence; re-measure them if you doubt
   them, and report a disagreement rather than acting on it silently.
2. Fix each, smallest change first.
3. Re-run each mutation and show it now goes RED, then restore and show green.
4. Run the affected files together, then one completed `npm test` iteration at
   your final tip, and quote the totals.
5. THE SWEEP. Before you write the report, walk EVERY line your round changed
   and name, for each, the arm that would go red if that line were wrong. A
   changed line with no arm behind it is the defect this round exists to close,
   so a line you cannot name an arm for is reported as such rather than left
   silent. The sweep is a section of the report, not a claim in prose.

## Report — write to `D:/addictedtoai-worktrees/fleet6-stage0-F/RESULT2.md`

    # Packet F — round 2 report

    ## 1. Commits
    ## 2. What changed, per file, per finding
    ## 3. Tests run (counts quoted, TAP totals)
    ## 4. Mutation table — one row per finding: the mutation, GREEN before,
    ##    RED after, restored with SHA-256
    ## 5. Findings I could not reproduce, if any
    ## 6. Blocked or refused calls
    ## 7. Findings not fixed

First line of the file is exactly `done` or `blocked: <one-line reason>`.
