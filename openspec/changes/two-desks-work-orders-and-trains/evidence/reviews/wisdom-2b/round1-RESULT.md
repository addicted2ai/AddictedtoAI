# RESULT1 — Wisdom item 2b: the requirement that never left the issue

Date (local): 2026-09-10. Files: `loop/lib/brief.mjs` (existing: pure
`extractImperatives` / `briefCarries` / `reconcileBriefImperatives` plus
the refusal throw inside `assembleBrief` before the return),
`loop/tests/brief-reconcile.test.mjs` (new, 2b's arms),
`scripts/tests/truncation-shape.test.mjs` (new, the secondary host).
Nothing else touched — `loop/run.mjs` stays read-only per the brief;
the refusal propagates through the unedited caller before
`.job/brief.md` is written. Run by absolute path with `node --test`.
`npm test` was not run here (no `node_modules` in this worktree); the
whole-suite total is the orchestrator's on the merge target.

Item 2 does NOT fully ship this round, because 2a is held.

## 1. Baseline colour and post-mutation colour of every assertion

`loop/tests/brief-reconcile.test.mjs` (7 tests):

| Assertion | Baseline | Under mutation | After revert |
|---|---|---|---|
| arm 1 — three-numbered brief missing the prose fourth refused, naming it | GREEN | n/a | GREEN |
| arm 1b — refusal fires inside `assembleBrief` before return (detail-drop makes it throw) | GREEN | n/a | GREEN |
| arm 2 — fourth accounted for passes | GREEN | n/a | GREEN |
| arm 3 — reworded imperative still carried (not substring equality) | GREEN | n/a | GREEN |
| arm 4 — no-imperative source passes by documented choice | GREEN | n/a | GREEN |
| Mutation A — enumerated-list-only reconciliation goes green (the defect, shown) | GREEN (defect shown) | n/a | GREEN |
| Mutation B — reconcile-after-return never fires; order-harness writes the incomplete brief (red shown) | GREEN (defect shown) | n/a | GREEN |

`scripts/tests/truncation-shape.test.mjs` (5 tests): sweep 165 files
zero violations GREEN; marker-carrying diagnostic GREEN; unmarked
enumeration RED naming enumerator; exemption-drop mutation RED;
self-membership GREEN. All green at baseline and after reverts.

## 2. Suite totals, read from the runner's own summary lines

Orchestrator-verified from outside the run with
`wisdom/tools/suite.mjs`:

- reconcile: `{tests:7, pass:7, fail:0}` (expectTests:7)
- sweep: `{tests:5, pass:5, fail:0}` (expectTests:5)

Direct `node --test` agrees on both files (7/7 and 5/5).

## 3. Mutations of my own (beyond the brief's A and B)

1. `COMMAND_VERBS` minus `record`: arms 1, A-check and B-check go red
   (the wild fourth is no longer extracted — 0 missing where 1
   expected). The verb arm is load-bearing for the prose imperative.
   Reverted byte-identical (hash `87fd4e67…` before and after).
2. Template detail-drop (arm 1b's liveness probe): assembly throws
   `/brief refuses/`, proving the throw reachable rather than dead
   code. Reverted byte-identical.
3. Exemption-drop in the sweep (arm 4): the marker line goes red.
   Reverted byte-identical.

A fourth finding while mutating: neutralizing only the `const
missing` line (leaving the `if` below) crashes with ReferenceError
instead of demonstrating the silent pass — so mutation B moves the
whole check block dead, not one line. Recorded here so the next
reader does not repeat the shape.

A fifth: Node caches modules, so rewriting `brief.mjs` on disk
changes nothing for the already-imported binding — mutation tests
re-import under a cache-busting query, documented in the test file.
Without that, every mutation arm measures the old code.

## 4. Control provenance

HALF WILD: the x2jl requirement structure (three numbered + prose
fourth glued to item 3, fourth quoted in full with its parenthetical
per the review fix). HALF CONSTRUCTED: the fixture brief, which
exists nowhere.

## 5. The enumeration-and-exclusions comment, quoted from the file

From `loop/lib/brief.mjs`, the `2b reconciliation` block: a sentence
is an imperative when listed, modal-bearing (SHALL/MUST/should/must/
needs-to/required-to), or opening with a COMMAND_VERBS bare verb;
could/would/can/may/might excluded as suggestion language; quoted and
fenced text counts; another system's actions count (over-counts, the
safe direction); "carries" is ≥50% significant-token coverage
(length 4+, lowercased, outside STOPWORDS) — the loosest joint,
stated; zero-significant-token imperatives count as carried;
no-imperative sources pass by asserted choice; refusal throws inside
`assembleBrief` before the return; revision/resume briefs out of
scope as a stated limit. (Full text in the file.)

## 6. Anything the brief got wrong

Three findings, all verified against the authority and repaired in
the brief before building (second-model review verdict: revise):

1. The brief's quotation of the fourth imperative stopped before the
   authority's parenthetical `(the loop could print os.freemem()
   beside any spawn failure for exactly this)` — the only concrete
   operationalization, and the exact defect class the brief warns
   about. Fixed: full quote, no silent elision.
2. The brief called the fourth "a closing paragraph"; in `bd show`
   output it is glued to item 3 with no blank line. Fixed: true
   layout stated, which is the ambiguity the classifier handles.
3. Mutation B as specified was unimplementable with `run.mjs`
   read-only (no write exists in `brief.mjs` to move the check
   after). Fixed: mutation B defined as moving the whole check
   block dead, with a test-only harness mirroring production order.
4. The brief mislocated 2a's hold (repo `.claude/settings.json` is
   tracked wiring; the hold is the maintainer's
   `~/.claude/settings.json`). Fixed: both named, hold placed.

Nothing was left out. No part was blocked. Scope was not narrowed:
revision/resume coverage is the brief's own stated limit, and the
secondary host was checked against the existing guard test for
duplication (mechanism-only, no sweep — built, not duplicated).
