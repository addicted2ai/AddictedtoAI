# SEALED REVIEW — Stage 0, packet F (tasks 21 and 22: the appending conformance record, the history-reading gate, and runner enablement). Round 1. NO EDIT RIGHTS.

authority: two-desks-work-orders-and-trains@ddbfd52

You are the REVIEWER of one change, reviewing it ALONE. You fix nothing; you
judge and show your evidence. You have NO EDIT RIGHTS to any tracked file:
do not commit, do not push, do not modify the implementation or its tests
except as a MUTATION you restore immediately and prove restored by hash.

The worktree, and the only place you may write:

    D:/addictedtoai-worktrees/fleet6-stage0-F

Branch `stage0/f-history-enablement`, tip **`df448970490c7fe496317182417364a281c216ed`**, merge base
**`ddbfd52ca16ccf5cff92633d0b571e1a4ce69c91`** (`git -C D:/addictedtoai-worktrees/fleet6-stage0-F merge-base main HEAD`).
The author's brief is at `<worktree>/.agent-brief.md` and its report at
`<worktree>/RESULT1.md`.

## Sealing

This is the FIRST review of packet F. No `REVIEW*.md` exists in this worktree
and no earlier round's report exists, so there is nothing to be sealed from
except the architect's own reasoning, which you do not have and do not need.
`.agent-brief.md` and `RESULT1.md` are the author's round-1 files and are in
scope. If you find a `REVIEW*.md` here, say so — its presence would be a
fact about the machine, not about this packet.

State in your report, in a section headed "Sealing", whether you opened any
earlier `REVIEW*.md` file or any earlier round's report, and which.

## Known state at dispatch

- The branch carries ONE author commit, `df44897`, over the merge base:
  nine files, +486/-49. The merge base is the authority commit itself, so
  every changed line is this packet's.
- `main` is not moving under you: no commit freeze is in force and the
  architect is not committing to the tracked tree while this round runs.
- THE REGISTRY IS UNCHANGED. `runners.yml` declares `enabled` on no entry,
  so every registered runner is enabled today and this packet must change no
  existing selection outcome. The three `enabled: false` lines named in the
  author's report section 5 are the orchestrator's edit at the handover.
- THE RECORD IS STILL LEGACY. `data/conformance.json` in the shipped tree is
  one object per runner — NINE runners, four checks each, zero arrays. The
  first appended entry appears the next time a conformance run records, which
  will not happen during this round. (`CLAUDE.md` says seven and is stale by
  the two Luna rungs task 19 added; the JSON is the authority, as that file
  itself says.)
- Packet D is already merged and pushed: escalation exists in the loop
  (`escalates_to`, `topRanked`, `escalationTarget`) and the registry's
  `escalates_to: codex-gpt-luna` on `codex-gpt-luna-medium` is live. Task 22
  interacts with it through the disabled-destination rule.
- A FACT, NOT A VERDICT: at the branch tip the architect ran the eight
  affected test files (`conformance`, `runner-policy`, `selector-rules`,
  `portability`, `no-change-dir-refs`, `issues`, `gate-transport-retry`,
  `runner-health`) and got 137 tests, 137 pass, 0 fail in 74 s. Green tests
  are the beginning of your work, not the end of it.
- ANOTHER PROJECT IS USING THIS MACHINE. A `codex` process whose `-C`
  directory is outside `D:/addictedtoai-worktrees/` belongs to someone else:
  never kill it, never stop it, never wait on it, and do not report it as
  contention.

## What you judge against, in this order

1. THE REQUIREMENT, read from the authority commit, read-only: in the loop
   delta, the conformance bullets of *Runner selection is a declared policy*
   (the record is a history, a FAIL stands until the same check passes a
   stated number of consecutive later times, and a reader confirms how many
   records it loaded before trusting any verdict) and the enablement bullet
   (*A registered entry SHALL be able to say it is named for nothing*).

       git -C D:/AddictedtoAI show ddbfd52:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md

2. THE TASK TEXT — tasks 21 and 22, quoted verbatim below, including their
   bold "Resolved before F's freeze" paragraphs, which are the architect's
   resolution of every quantifier and are the standard.
3. The tree.

Never write anything under `D:/AddictedtoAI` — it is the shared checkout.

THE AUTHOR'S BRIEF IS EVIDENCE, NOT THE STANDARD. If the brief contradicts
the requirement or the task, the brief is the defect: report it against the
brief, and note that an author who did what a wrong brief said did its job.
Of the twenty-seven review rounds this change has run, most were caused by
the specification, not the workers — and packets B2 and E each lost a round
to a brief whose file list was the tasks' files rather than the closure over
the change. Check the closure yourself: every reader of the conformance
record's SHAPE (not merely of the gate's verdict), every reader of the
gate's return object, and every construction of a runner entry in a test
fixture or a real registry. Does an exact pin on any of those live in a file
the author's list did not reach? Name what you searched and how.

RESULT1.md IS A HYPOTHESIS. Every claim in it is unverified until you
verify it.

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

The author was permitted exactly these; a diff touching any other path is a
scope finding. Judge each against the reason it was in scope.

- `loop/conformance.mjs` — `recordConformance` appends rather than overwrites (task 21)
- `loop/lib/runners.mjs` — `conformanceHistory`, the history-reading `conformanceGate` with its `passesToSupersede` parameter and `entries` count, the optional boolean `enabled` validated at load, and `pickRunner`'s treatment of a disabled entry (tasks 21, 22)
- `loop/lib/select.mjs` — `selectJob`'s refusal of a disabled runner before any other gate, and `escalationTarget` declining a disabled destination (task 22)
- `loop/run.mjs` — the refusal of a disabled author or reviewer after the runner picks, the logged entry count, and the escalation log (tasks 21, 22)
- `loop/lib/ledger.mjs` — THE COMMENT ONLY, stating both of the bead's limits on `authority_sha` (task 22)
- `loop/tests/conformance.test.mjs` — the gate and record arms (task 21)
- `loop/tests/runner-policy.test.mjs` — the enablement arms (task 22)
- `loop/tests/portability.test.mjs` — the runner-id scan's roots, extensions and floor (task 22)
- `scripts/no-change-dir-refs.test.mjs` — the reference regex and the allow-list's matched span (task 22)
- `RESULT1.md` — (new) the author's report, uncommitted, in the worktree root
- `.agent-brief.md` — (new) the author's brief, uncommitted, in the worktree root

`runners.yml` and everything under `data/` are RESERVED: the three
`enabled: false` lines are the orchestrator's and land at the handover, not
in this branch. A diff touching either is a scope finding; their ABSENCE
from the diff is correct. Until those lines land, `enabled` is absent
everywhere and every entry is enabled, so this packet must change no
existing selection outcome. Verify that claim; do not accept it.

## What to check

1. DOES IT DO WHAT THE REQUIREMENT SAYS? Ask of every threshold, assertion
   and fixture: WHAT WRONG WORLD WOULD THIS STILL PASS ON? Construct it.
   In particular:
   - the gate reads the history PER CHECK NAME, oldest to newest, and a FAIL
     of one check stands until THAT SAME check records `passesToSupersede`
     CONSECUTIVE later PASSes — not any three passes, not the entry-level
     verdict, not the newest entry alone;
   - an ABSENT check is NOT a pass: an entry whose `checks` omits the failed
     check breaks the run rather than continuing it. This has its own fixture
     because no other arm contains an absent check. Read the code path and
     say what value the comparison actually sees;
   - a later FAIL resets the run of passes;
   - the legacy single-object record still refuses on a FAIL and reads as one
     entry;
   - `recordConformance` APPENDS: the earlier entry survives byte-equal, and
     a legacy object normalises rather than being discarded.
2. THE COUNT IS A REQUIREMENT, NOT A LOG LINE. The gate's return carries
   `entries: <n>` on every path (0 with `unrecorded: true` when there is no
   record), and BOTH programmatic readers surface it before acting on the
   verdict. Find both readers yourself and check each; a reader that acts on
   a verdict without the count is a finding.
3. ENABLEMENT, all four positions: absent means enabled (entries written
   before the field existed stay selectable); a present non-boolean is a load
   error; a disabled entry is refused for the `author` and `reviewer` roles
   BEFORE any other gate has an opinion about it — construct a runner that is
   both disabled AND health-refused AND conformance-refused and show which
   refusal wins; nothing escalates onto a disabled entry; and the default and
   alternate searches skip disabled entries while an explicitly named
   disabled id still resolves for reporting.
   Find what enforces that ordering claim in `loop/tests/runner-policy.test.mjs` and run it, or report that nothing does and it is true only by where the code sits.
4. THE DIFF FROM THE MERGE BASE IS THE LIST OF CHANGED BEHAVIOURAL LINES.
   Mutate lines you choose — at least one per changed function — run the
   affected tests, report the arm counts red and restored; a changed line
   with no arm is a finding; a mutation that stays GREEN is the finding.
   Restore by SHA-256. Re-run a sample of the author's fourteen named
   mutations rather than trusting the table, then at least one of your own
   against the weakest link.
5. THIS PACKET EDITS THE ENFORCEMENT CHECKS THEMSELVES, which is the reason
   to be hardest on it. `loop/tests/portability.test.mjs` and
   `scripts/no-change-dir-refs.test.mjs` are two of the properties that guard
   the whole machinery. For each: is the changed check STRICTLY STRONGER than
   what it replaced, or does some input the old form caught now pass? Name a
   concrete string or file for each check that the OLD form flagged and the
   NEW form does not, or state that none exists and show how you searched.
   If the change removed an allow-list entry, decide whether that entry was
   genuinely made stale by the new form or whether its case is now silently
   unguarded.
6. THE PROPERTIES — find what enforces each and run it: the machinery names
   no model, provider, harness or runner id; no source references an
   unarchived change directory; every clearance the shipped registry declares
   is still enforced and the shipped registry still loads
   (`selector-rules.test.mjs` reads the real `runners.yml`); the selector's
   other refusals are unchanged (`budget`, `expiring-proposal-precedence`,
   `runner-health`, `exit-code-refusal` tests).
7. THE LEDGER COMMENT: it states BOTH limits the task quotes, names no model,
   provider or harness, and no test pins its wording. Extending
   `LEDGER_FIELDS` to require `authority_sha` must turn THREE assertions red,
   in three different files; a run that finds two has not found them all.
8. THE FULL SUITE: one completed author iteration on the final tip, counts
   quoted (1,797 or more, 0 failed); a cut-off, a red or an earlier commit's
   counts is a finding. Do not run it yourself.
9. WHEN YOU PARSE TEST OUTPUT, ASSERT THE TEST COUNT (`--test-reporter=tap`).

## Hard limits

- NEVER run `npm run build`, NEVER the full `npm test`, never any `verify-*`
  script as a whole (importing a function from one in a test is fine), the
  Pulse or the Desk against the real repository. Targeted
  `node --test <absolute path>` only.
- NEVER run `node loop/conformance.mjs` against the real repository: it
  spawns a runner and WRITES `data/conformance.json`, which is reserved.
  Exercise `recordConformance` on a throwaway context under the OS temp
  directory instead.
- Never use the token `cd` anywhere in a command, including in a comment — a
  guard blocks the string. Absolute paths and `git -C <dir>`.
- A blocked or refused command is REPORTED, not routed around.
- NEVER `git worktree remove`, and never delete a `node_modules`: a forced
  removal follows the junction and, on this machine, deleted 177 packages in
  a single attempt. Probes use throwaway repositories under the OS temp
  directory.
- Keep commands short; write a `.mjs` under `<worktree>/.job/` and run it
  rather than `node -e`. Delete any probe file you create and say so.
- Every date you write is this machine's LOCAL date, read from
  `node -p "new Date().toLocaleString('sv-SE')"`.
- DO NOT RUN `bd close`, and do not run `bd update` on any bead.
- No `git push`, `git merge`, `git commit`, or `gh`.

## Output — write to `D:/addictedtoai-worktrees/fleet6-stage0-F/REVIEW1.md`

This exact numbered name, never the bare un-numbered one.

    # Stage 0 packet F — round 1 — VERDICT: approve | revise

    ## Sealing
    ## Findings
    (if revise: NUMBERED must-fix items, each with file and line, what is
     wrong, which requirement or task clause it violates, what would make it
     right, and its CLASS)
    ## The mutations I ran
    ## The mutation table, judged
    ## The two enforcement checks, judged against their old form
    ## What I checked that was sound
    ## Was the brief faithful to the tasks and the requirement? (and the closure)
    ## What I ran

Be adversarial about correctness and fair about scope. Approve work that is
right and narrow; a small, correct packet deserves `approve`; inventing a
finding to justify `revise` is as much a failure as missing a real one.
