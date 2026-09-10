# RESULT2 — item 3 round 2: Files-list closure instrument (2026-09-10, local)

## 1. Baseline and post-mutation colour of every assertion

Direct run: `node --test D:/addictedtoai-worktrees/item3-closure/scripts/brief-closure.test.mjs`
gives `tests 8, pass 8, fail 0` (runner summary lines `tests 8` / `pass 8` / `fail 0`).
Baseline (before any mutation), each arm green as a test and the instrument colour as named:

- Arm 1 (B2 refuse): test PASS. Instrument RED (exit 1): `CANDIDATE loop/tests/review-blog-bar.test.mjs:269-280 enum-set cites-unresolved`.
- Arm 2 (E refuse): test PASS. Instrument RED (exit 1): `CANDIDATE loop/tests/breakers.test.mjs:172-178 shape:comparative brief_chars,gate_seconds,authority_sha` and `CANDIDATE loop/tests/gate-transport-retry.test.mjs:876-880 shape:exact brief_chars,gate_seconds,authority_sha`.
- Arm 3 (F pass with measured reason): test PASS. Instrument GREEN (exit 0): `CLOSURE OK` plus verbose `FOUND-INSIDE loop/tests/conformance.test.mjs:* shape *` (13 lines, e.g. :105, :121, :129, :130, :140, :147, :161, :179, :182, :196, :207, :208, :220, :238) and `FOUND-INSIDE loop/tests/runner-policy.test.mjs:* field enabled` (:209, :234, :298, :309).
- Arm 4 (corrected lists pass): test PASS. B2 list plus pin file GREEN; E list plus two pin files GREEN (`CLOSURE OK`).
- Arm 5 (escape holds): test PASS. E refusal output contains no `portability.test.mjs` (escape never reported).
- Arm 6 (mutation A): test PASS. Baseline E RED (exit 1, two candidates). Post-mutation E GREEN (exit 0, `CLOSURE OK`, zero candidates — the defect). Revert verified byte-identical by sha256 and restored E RED again.
- Arm 7 (mutation B): test PASS. Baseline F-minus-one RED (exit 1, `SCOPE loop/lib/select.mjs scope touched-but-unlisted`). Post-mutation F-minus-one GREEN (exit 0, `CLOSURE OK` — the defect). Revert verified byte-identical by sha256 and restored RED again.
- Arm 8 (liveness): test PASS. F-minus-one RED as scope (`SCOPE loop/lib/select.mjs`), proving the scope half live.

Property-to-arm map (reviewer runs each arm in `scripts/brief-closure.test.mjs`):
B2 exact-membership refusal → arm 1; E exact-vs-comparative shape refusal with three keys → arm 2;
F closure pass with verbose measured reason → arm 3; refusal follows the list (corrected variants) → arm 4;
self-fixture escape → arm 5; shape-pattern liveness under neutering → arm 6 (mutation A);
Files-parser liveness under weakening → arm 7 (mutation B); scope-half liveness → arm 8.

Sealed revise fix (after the 8/8 above): the first sealed review
returned revise with one finding — arm 6 hardcoded the author
worktree in `INSTRUMENT` while the fresh import used a relative
path, so a disposable copy mutated the author file and measured its
own (7/8 from a disposable path). Fixed in `5bb179f` by deriving
`HERE`/`INSTRUMENT`/`WORKTREE` from `import.meta.url` and the
re-import from the mutated constant via `pathToFileURL` (test-only
change, no instrument behaviour touched). Verified 8/8 from the
author worktree AND 8/8 from a fresh detached worktree (the exact
scenario that failed), then delta re-review approve. Suite-tool
counts for the suite below are the orchestrator's on the merge
target.

## 2. Which half of each control is wild and which is constructed

Controls are wild and banked in history, read from committed objects in this clone (never written out as new files):

- B2 catch: wild brief `openspec/changes/two-desks-work-orders-and-trains/evidence/reviews/stage0-packet-B2/round1-agent-brief.md` read from the main checkout against wild diff `de400f7..5fb9b2b` with wild pin `loop/tests/review-blog-bar.test.mjs:269-280` read at tip `5fb9b2b` via `git show`. The corrected-list variant (B2 list plus that pin file) is constructed by this round and stated in arm 4.
- E catch: wild brief `.../stage0-packet-E/round1-agent-brief.md` against wild diff `9c1d980..db10eac` with wild pins `loop/tests/breakers.test.mjs:172-178` and `loop/tests/gate-transport-retry.test.mjs:876-880` read at tip `db10eac` via `git show`. The corrected-list variant (E list plus both pin files) is constructed and stated in arm 4.
- F pass: wild brief `.../stage0-packet-F/round1-agent-brief.md` against wild diff `ddbfd52..df448970490c7fe496317182417364a281c216ed`, passing with verbose pins found inside listed files. The minus-one shape (F brief minus `loop/lib/select.mjs`) used for liveness and mutation B is constructed and stated in arms 7–8.

No wild corrected list or wild minus-one exists for the constructed halves because history holds only the as-shipped briefs (which refuse or pass as recorded); a corrected list and a scope-miss shape were never committed, so proving that refusal follows the list and that scope is live requires building those shapes.

## 3. Pin-class comment, quoted from `scripts/brief-closure.mjs`

```
// brief-closure.mjs — review-gate sweep: a brief Files list vs a merge-base diff.
//
// PIN CLASSES (exact-shape assertions over identifiers the diff changes, never prose mentions):
// - enum-set: an exported array/set literal gains or loses a member (REISSUE_CODES plus
//   cites-unresolved; runner-id scan targets; change-dir allow-list) pinned by exact membership
//   (deepEqual against a literal list, deepEqual(scan(...), []), floor counts). A prose mention
//   of the identifier is not a pin.
// - shape: a builder emitted object gains or loses keys (ledger line plus brief_chars,
//   gate_seconds, authority_sha; conformance record plus history, entries, passesToSupersede)
//   pinned by exact key-set (Object.keys filter against a literal key array, exact-shape deepEqual)
//   or comparative shape (Object.keys equality between two live lines plus per-field value equality).
//   Ledger comparative pins stay red through per-throwaway uniqueness (authority_sha), not a literal.
// - field: a named field or record shape the diff changes (LEDGER_FIELDS; runner registry enabled)
//   pinned exactly elsewhere (deepEqual against a literal array; includes; selection and refusal arms).
//   LEDGER_FIELDS unchanged means issues-style pins stay green: TRUE-BUT-UNTOUCHED, never candidates.
//
// WHAT COUNTS AS LISTED: a backticked file path in the brief own ## Files section (work-only bullets
// plus the read-only-with-reason paragraph: F carries both) and backticked file paths in ## Properties
// that the sweep must run (selector-rules, budget, expiring-proposal-precedence, runner-health,
// exit-code-refusal, issues, gate-transport-retry, helpers). A path named only in prose elsewhere is
// not listed: prose names many files without taking responsibility for closure, and counting those
// would let a brief claim a closure it never enumerates.
// WHY THE REPORT FILE NEVER COUNTS: RESULT<n>.md at the worktree root is always new and left untracked
// (this round leaves RESULT2.md uncommitted); the merge-base diff of committed work never names it, and
// even a committed one is the reviewer own record, not behaviour the brief scopes. Counting it as
// unlisted scope would refuse every brief for its own report.
// WHY REVIEWER-SIDE, NOT AUTOMATIC: the instrument reports candidates and the reviewer judges them,
// because the false-fire rate of an automatic refusal is unmeasured (round 1 detected-not-dispatched
// precedent). The sealed review running the instrument with a revise verdict naming unlisted true pins
// IS the gate refusing a file list that misses a pin (what the bead asks for). The automatic form (the
// merge step refusing on instrument output with nobody judging) is a recorded follow-up owned by the
// orchestrator, due when the false-fire rate has been measured over real reviews; that measurement is a
// later attempt under its own brief, not a promise this round makes.
// WHY NO FALSE-FIRE ON REWORDING: candidates are exact-shape assertions (deepEqual against a literal,
// Object.keys comparisons, includes against a literal, gate and history deepEqual) over identifiers the
// diff changes. Rewording prose or comments changes no asserted shape and matches no pattern, unlike a
// text search for the identifier which would fire on every mention.
```

## 4. Sweep enumeration (class treated as whole closure over the merge-base diff)

Self-hosting row: this brief own Files list (`scripts/brief-closure.mjs`, `scripts/brief-closure.test.mjs`)
against own diff `3da67cf..HEAD` (`8ab6b43`, two files). Instrument says `CLOSURE OK` (scope covered,
zero pin candidates). Production diff is empty (both touched paths are the instrument itself, excluded
from production signals), so no changed identifier touches any pin. Stop rule applied: the sweep ends
when every candidate has a disposition, not when no further candidate can be imagined; with zero
candidates the enumeration below records every seen true pin as untouched plus the one delete, and no
scope decision was declined.

- `loop/tests/review-blog-bar.test.mjs:269-280` enum-set `cites-unresolved` — TRUE-BUT-UNTOUCHED (true pin; own diff never touches REISSUE_CODES).
- `loop/tests/breakers.test.mjs:172-178` shape:comparative `brief_chars,gate_seconds,authority_sha` — TRUE-BUT-UNTOUCHED (true pin; own diff adds no ledger keys).
- `loop/tests/gate-transport-retry.test.mjs:876-880` shape:exact `brief_chars,gate_seconds,authority_sha` — TRUE-BUT-UNTOUCHED (same reason).
- `loop/tests/issues.test.mjs:243` field `LEDGER_FIELDS` — TRUE-BUT-UNTOUCHED (true pin over the required array; own diff leaves LEDGER_FIELDS alone).
- `loop/tests/conformance.test.mjs` shape `conformanceGate/conformanceHistory/passesToSupersede/recordConformance` (e.g. :105, :121, :129–130, :140, :207) — TRUE-BUT-UNTOUCHED (true pins; own diff never touches conformance history or threshold).
- `loop/tests/runner-policy.test.mjs` field `enabled` (e.g. :209, :234, :298) — TRUE-BUT-UNTOUCHED (true pins; own diff never touches the registry field).
- `loop/tests/portability.test.mjs:409` ledger self-pin via `ledgerSchemaLine` — DELETE (not a true pin: the file builds its own line and pins its own construction, so it is never a candidate whatever the diff changes).
- No BIND rows: no touched pin lives in a listed file because the diff touches no pin identifier; scope itself is bound (both touched files listed).

Out-of-scope disposition: automatic merge-gate wiring (the merge step refusing on instrument output with
nobody judging) is out of scope this round. Enforcement stays reviewer-side (the sealed review runs the
instrument and a revise verdict naming unlisted true pins is the refusal). The automatic form is a
recorded follow-up owned by the orchestrator, due when the false-fire rate has been measured over real
reviews under its own brief.

## 5. Items 5 and 6

Items 5 and 6 follow with their own briefs; beyond this sentence they are out of scope here.

## 6. What this brief got wrong

F comment false-fire (found while making F pass): `loop/lib/ledger.mjs` at `df44897` adds a comment
naming `authority_sha` (auditability note) without emitting any key. A plain added-string rule for
ledger keys would treat that mention as an emitted-key change and wrongly refuse F via
`loop/tests/breakers.test.mjs` comparative shape. The instrument therefore counts only code-like added
lines (skipping `*`, `//`, `#` comment lines) for `brief_chars` / `gate_seconds` / `authority_sha`.
The brief defines shape pins as emitted-object key changes but never states that comment mentions do
not count; without that guard the F pass control fails.

Coverage stretch for the measured pass reason (also a brief defect): read strictly around the B2/E
examples, the three classes name REISSUE_CODES, ledger keys, and LEDGER_FIELDS, while the F verbose
reason the brief demands (`FOUND-INSIDE` naming pins found inside) has nothing to show — F listed
files hold no REISSUE_CODES pin, no unescaped ledger Object.keys pin, and no touched LEDGER_FIELDS pin
(portability :409 is the escape). The instrument maps the conformance record (history, entries,
passesToSupersede) to shape as a builder emitted object with exact-shape deepEqual, and the runner
registry `enabled` flag to field as a named field with selection and refusal arms, with per-file
evidence in arm 3. That mapping stays inside the class wording but goes past the examples; under the
narrow example reading, arm 3 is unsatisfiable and the pass would be vacuous. A fourth shape was not
added (per the brief bar); this stretch is recorded here as the finding.

Smaller wording slip: the field-pin note says `loop/tests/issues.test.mjs:243` stays green when
production is unchanged. E production did change (three additive keys) and the pin still stays green
because LEDGER_FIELDS itself is unchanged. The operative reason is LEDGER_FIELDS untouched, not
production untouched.

Nothing was left out. No part was blocked.
