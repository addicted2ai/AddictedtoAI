# FULL REVIEW AT MAX — Stage 0, packet F (tasks 21 and 22: the appending conformance record, the history-reading gate, and runner enablement). Round 2. NO EDIT RIGHTS.

authority: two-desks-work-orders-and-trains@ddbfd52ca16ccf5cff92633d0b571e1a4ce69c91

You are the REVIEWER, working ALONE and unattended with NO EDIT RIGHTS: do not
commit, do not push, do not modify any tracked file except as a MUTATION you
restore immediately and prove restored by SHA-256.

The worktree, and the only place you may write:

    D:/addictedtoai-worktrees/fleet6-stage0-F

Branch `stage0/f-history-enablement`, tip **`952de9fbb83a26dc1c0cbe446476425a9fc54fdb`**, merge base
**`ddbfd52ca16ccf5cff92633d0b571e1a4ce69c91`**. Round 1's tip was **`df448970490c7fe496317182417364a281c216ed`**. `node_modules` is a
junction to the main checkout — do not run `npm install`.

## WHY THIS IS A FULL REVIEW AND NOT A DELTA REVIEW — read this first

The Stage 0 preamble grants a cheaper DELTA review to a round "whose diff
touches only test files", and adds: "Any production change gets the full sealed
max review." Round 2's diff includes `loop/lib/select.mjs`, which is production
code. So this is the full review, at max, over the WHOLE merge-base diff
`ddbfd52ca16ccf5cff92633d0b571e1a4ce69c91..952de9fbb83a26dc1c0cbe446476425a9fc54fdb` — nine files — and not merely over round 2's own five.

## Sealing — and this round is DELIBERATELY NOT sealed from round 1

`<worktree>/REVIEW1.md` is round 1's sealed review and you ARE GIVEN IT, on
purpose: the exit condition below requires you to RE-RUN every mutation it
named, which you cannot do without reading it. `<worktree>/RESULT1.md` and
`<worktree>/RESULT2.md` are the author's two reports and `.agent-brief.md` is
the round-2 author brief; all are in scope as HYPOTHESES, never as evidence.

State in a section headed "Sealing" exactly which of those files you opened.
The one thing you are sealed from is the architect's reasoning, which you do
not have and do not need.

## The exit condition (the architect's ruling, quoted from the Stage 0 preamble)

> A delta review APPROVES when: every named mutation of every prior review of
> the packet goes red under it (re-run, not trusted), the round's diff is
> within its scope, the standing properties hold, and the author's completed
> full suite on the final tip is green. A further green mutant the delta
> reviewer finds is written into its review and CARRIED as a note on the task,
> non-blocking, unless it exposes a production defect (an arm that goes red
> against the unmutated code, or a wrong world the requirement forbids) — that
> remains a revise. The merge-base diff stays the list of changed lines; "at
> least one red arm per changed function" stays the bar; "no green mutant
> exists" was never the bar and is not reachable.

That ruling exists because four consecutive reviews of one B2 diff each found
NEW green mutants — two, six, four, none overlapping, every one an arm narrower
than its property and NONE a production defect. The class "an arm could be
stronger" has no floor. So: a further green mutant you find is a NOTE, not a
revise, unless it exposes a production defect. Apply that faithfully in BOTH
directions — do not withhold a production defect because it feels small, and
do not escalate a narrow arm to `revise` because it feels unfinished.

## What you judge, in this order

1. **ROUND 1'S FIVE NAMED MUTATIONS, RE-RUN BY YOU.** `REVIEW1.md` names a
   mutation for each of its five findings. Perform each one yourself against
   the CURRENT production code, at the line it names, and record the arm RED
   with its `# pass` / `# fail` counts, then restore and prove restoration by
   SHA-256 and record GREEN. A mutation the author claims red that stays GREEN
   under you is a finding. An arm that goes red against the UNMUTATED code is a
   production defect.
   ONE OF THE FIVE IS DIFFERENT AND YOU MUST NOT MISJUDGE IT. Round 1's finding
   1 named the mutation "replace the conformance refusal `reason` with a
   generic string". That mutation STAYS GREEN after the correct fix, by design:
   the round moved the entry count into its own returned field, so the refusal
   STRING no longer has to carry it. The red mutation for that finding is
   DROPPING OR CORRUPTING THE COUNT FIELD — remove `conformanceEntries` from
   one of the four post-gate return sites, or return it as `0` or `undefined`.
   Run BOTH: confirm the generic-string swap is green and say so, and confirm a
   count-field mutation is red. A review that reports the generic-string swap
   as a failed fix has misread this paragraph.
2. **EVERY COUNT IN `RESULT2.md`, RE-DERIVED.** Do not accept a single number
   in that report. Re-run what it claims and compare. Quote both figures
   wherever yours differs from the report's, however small the gap — a number
   in a record that does not match its instrument is a finding in this project
   even when the underlying work is correct, and you are the instrument.
3. **THE MERGE-BASE DIFF AS THE LIST.** `git -C <worktree> diff ddbfd52ca16ccf5cff92633d0b571e1a4ce69c91..HEAD`
   is the complete list of changed behavioural lines across BOTH rounds, nine
   files. The author was required to sweep every line round 2 changed and name
   the arm behind each. Read the diff yourself. Pick at least THREE changed
   lines the sweep does not name as armed — from EITHER round — mutate each and
   run. A green one is a note under the exit condition unless it exposes a
   production defect.
4. **THE NEW ARMS AS BEHAVIOUR.** A test arm is itself behaviour. For each arm
   round 2 added, ask what WRONG WORLD it still passes on: an assertion on
   presence rather than value; a count asserted where any number would do; a
   fixture whose expectation is derived from the same list that builds it —
   that last one was FOUR of round 1's five findings, so look for it first.
5. **THE FULL SUITE.** The author must have run ONE completed iteration on the
   final tip and quoted its counts. A cut-off run, a red, or counts from an
   earlier commit is a finding. You do NOT re-run the full suite yourself.
6. **THE STANDING PROPERTIES — find what enforces each and run it.** The
   machinery names no model, provider, harness or runner id anywhere under
   `loop/`, `pulse/`, `scripts/`, `lib/`, `app/` or `tools/`, test fixtures
   included; and no source references an unarchived change directory. If you
   cannot find the enforcement for one, that is itself reportable.
7. **WHEN YOU PARSE TEST OUTPUT, ASSERT THE TEST COUNT** using
   `--test-reporter=tap`. A suite that silently ran zero tests prints a
   success.

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

Round 2 was permitted exactly these; anything else in `df448970490c7fe496317182417364a281c216ed..HEAD` is a
scope finding:

- `loop/lib/select.mjs` — the only production file of round 2: the entry count carried on the four post-gate returns
- `loop/tests/runner-policy.test.mjs` — reason: the count arms for finding 1
- `loop/tests/conformance.test.mjs` — reason: the divergent-history and omitted-check fixtures for findings 3 and 4
- `loop/tests/portability.test.mjs` — reason: the independent six-root expectation for finding 5
- `scripts/no-change-dir-refs.test.mjs` — reason: the optional-slash detector and its four arms for finding 2
- `RESULT2.md` — (new) reason: the author's report, uncommitted, at the worktree root

Round 1 additionally changed `loop/conformance.mjs`, `loop/lib/runners.mjs`,
`loop/run.mjs` and `loop/lib/ledger.mjs`. Those are IN SCOPE for your reading
of the merge-base diff and were READ-ONLY to the round-2 author.

`runners.yml` is RESERVED and is the orchestrator's: the three `enabled: false`
lines land at the handover, NOT in this branch. Their absence is correct and is
not a finding.

## Known state at dispatch

- Round 1 was judged `revise` on five findings. Four were the same class — an
  expectation derived from the thing it checks — and one was a change-directory
  detector that had been weakened relative to the check it replaced.
- The detector question was re-measured by the architect and the earlier claim
  that its weakening was LIVE was WITHDRAWN: a terminal-form reference the
  shipped pattern missed is ZERO across 302 tracked machinery files. The fix in
  round 2 is forward-looking. Do not re-litigate that; do check that the four
  arms it added actually pin what they claim.
- The allow-list in `scripts/no-change-dir-refs.test.mjs` was deliberately NOT
  restored. An entry deleted in round 1 cannot be expressed under the current
  `isAllowed`, which tests the matched SPAN rather than the line. Its reason now
  lives as a test arm instead. That is intended.

## Hard limits

- NEVER run `npm run build`, NEVER the full `npm test`, never any `verify-*`
  script, never the Pulse or the Desk. Targeted `node --test <absolute path>`
  only.
- NEVER run `node loop/conformance.mjs` against a real repository: it spawns a
  runner and WRITES `data/conformance.json`, which is reserved.
- Never use the token `cd` anywhere — not in a command, a comment or a script.
  The approval guard matches the token, not the intent. Absolute paths, and
  `git -C D:/addictedtoai-worktrees/fleet6-stage0-F`.
- Keep commands short; write a `.mjs` under `<worktree>/.job/` and run it by
  absolute path rather than using `node -e`. Delete every probe file you create
  and say so in your report.
- A blocked or refused command is REPORTED in your report, not routed around.
- NEVER `git worktree remove`, and never delete a `node_modules`: a forced
  removal follows the junction and in a single attempt deleted 177 packages on
  this machine.
- Every date you write is this machine's LOCAL date, read from
  `node -p "new Date().toLocaleString('sv-SE')"`.
- Do NOT run `bd close` or `bd update`. No `git push`, `git merge`,
  `git commit`, or `gh`.

## Output — write to `D:/addictedtoai-worktrees/fleet6-stage0-F/REVIEW2.md`

This exact numbered name, never the bare un-numbered one.

    # Stage 0 packet F — round 2 — VERDICT: approve | revise

    ## Sealing
    (which of REVIEW1.md, RESULT1.md, RESULT2.md, .agent-brief.md you opened)

    ## Findings
    (if revise: NUMBERED must-fix items, each with file, line, what is wrong,
     what would make it right, and its CLASS. A production defect only.)

    ## Notes carried, non-blocking
    (green mutants that are narrow arms rather than production defects — the
     exit condition says these are carried, not revised)

    ## Round 1's five mutations, re-run
    (per finding: the mutation, the command, red counts, restoration hash,
     green counts; and for finding 1 BOTH the green-by-design string swap and
     the red count-field mutation)

    ## Every count in RESULT2.md, re-derived
    (the report's figure beside yours, per claim)

    ## The sweep, checked
    (the three or more unswept lines you mutated, each red or green)

    ## The standing properties
    (the instrument you FOUND for each by searching the tree, the command you
     ran, and its output — or that you could not find one, which is reportable)

    ## What I checked that was sound

    ## What I ran
    (exact commands and their real output)

Approve work that is right and narrow. A small correct round deserves
`approve`, and inventing a finding to justify `revise` is as much a failure as
missing a real one.
