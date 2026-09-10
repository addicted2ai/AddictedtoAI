# WISDOM ITEM 6 — figure provenance, narrowed: a figure a later decision reads carries its source

authority: two-desks-work-orders-and-trains@3f6914f

Luna's objection stands and bounds this round: structured provenance
belongs on machine-consumed measurements, not every historical
sentence — a broad check would encourage fake provenance, precise
sourcing statements manufactured to satisfy a pattern. The ruling
narrowed rather than picked a winner: the check applies to a figure
that **a later decision reads** — a count that gates something, a
measurement recorded as authority — and not to every historical
sentence in a log. Item 5 drew the other half of the boundary from
the far side: lineage answers which computation over which bytes;
**which source the bytes came from is provenance, and this round owns
it.**

The host is a new `scripts/` test, not the extension the derivation
sketched onto `scripts/mem-log-integrity.test.mjs` — stated reason:
that file guards memory-entry structure (manifest subset, floor
against silent emptying), a different population under a different
strictness direction. Gating figures live in config, code and the
operating documents; the narrowed scope is a different population,
so it gets its own instrument rather than a clause in a guard about
something else.

Item 5 is banked and live; nothing follows this item except Stage 1.
Beyond this sentence Stage 1 is out of scope here.

## The one sentence this round exists for

**Every figure a later decision reads is declared with its canonical
source, and any restatement of a declared figure outside its source
carries an explicit source pointer — an unsourced restatement is
refused, because the measured cost is a confident computation built
on a stale copy.**

## What "a figure a later decision reads" means is the whole difficulty

Not every number. Three shapes, and the sweep enumerates exactly
these — a fourth shape is a finding about this brief, not an
extension you make:

- **Gating bounds.** Figures a computation reads to decide something:
  budget bounds feeding `warmUpJobs` arithmetic (`100 /
  tightestCeilingPct`), gate floors, thresholds. The decisive
  instance: `AGENTS.md` restating the machinery ceiling as 10% while
  `data/config.json` read 30 — a wrong copy producing confident,
  correct-looking arithmetic about a live denominator, because
  `loop/lib/budget.mjs` reads those bounds by pattern.
- **Gating counts.** Counts that open or close a gate: suite ratchets,
  floors, pin counts a merge decision reads.
- **Measurements recorded as authority.** A measured value later runs
  cite as the reason something holds: durations, byte counts, counts
  of records.

What escapes, stated so the check cannot become fake-provenance
encouragement (Luna's objection, which bounds this round): ordinary
historical sentences in logs and records — dated, past-tense, making
no claim about a current value — are never candidates. A check that
refused them would force true records to be deleted to earn a green,
which is a guardrail producing false statements. The tense test from
the §7 Orch caveat applies (past-tense dated records exempt; the
third restatement correctly declined): present-tense claims about live
figures are candidates; stamped records are not.

Your comment must answer, each with a reason:

- What counts as a source pointer: a transclusion
  (`{{fact:<kind>/<slug>#<field>}}`), an explicit path reference to
  the canonical file, or a named command whose output is the figure —
  and why a bare number beside a vague noun ("the ceiling is 10%")
  is never a pointer.
- Why the declared set is enumerated by the sweep rather than fixed
  in advance: the tree's gating figures are found, not assumed, and
  a fixed list would go stale exactly like the restatements it
  polices. The declaration lives in the test beside the patterns.
- Why this check cannot false-fire on legitimate prose the way a
  number-blocklist would: candidates are restatements of DECLARED
  figures matching the declaration's patterns, never bare numbers —
  10, 30, 55 and 56 appear all over the tree and mean nothing until
  a pattern says which figure they restate.
- Why a sourced re-statement passes rather than being deleted: the
  operating documents legitimately cite live figures; the defect was
  never citing, it was citing without a pointer that a later reader
  could check.

## The control, wild incidents with constructed fixtures

The five wild controls are prose history — they cannot be re-executed,
and history's bytes are gone — so each arm builds a constructed
fixture MODELED on one, declares it as such, and the fixture must
fail until sourced while the sourced re-statement passes:

1. **Restated bound (the 10-vs-30 shape).** A present-tense
   restatement of a declared bound with a stale value and no pointer
   must FAIL; the same sentence with the live value and a pointer to
   the canonical file must PASS. (Wild, as banked 2026-09-09 and
   since repaired to key-names-only: `AGENTS.md` "machinery ceiling
   10%" against live 30. The arms are constructed fixtures, not live
   claims.)
2. **Count over a moving population (the 56-vs-55 shape).** A count
   asserted without the command or file that produced it must FAIL;
   the same count carrying its producer must PASS. (Wild: 56-test
   prose over 20+16+15+4=55, caught by a sealed reviewer.)
3. **Total read mid-change (the 182.4M shape).** A rounded total
   stated as exact with no source must FAIL; stated with its producer
   and its rounding must PASS. (Wild: 182.4M read while three
   counters incremented, corrected to 182,873,547.)
4. **Removal count with a blind spot (the 205-vs-219 shape).** A
   removal count whose stated method demonstrably misses entries must
   FAIL; with the miss disclosed and the producer named must PASS.
   (Wild: 205 vs 219 removed, 14 tilde entries missed by the repair
   regex.)
5. **Sourceless label (the invented-push-label shape).** A label
   asserting a state (e.g. how stale the site is) with no read behind
   it must FAIL; the same label carrying its read time and source
   must PASS. (Wild: invented push label vs actual read time.)

Plus the live sweep: the current tree's declared figures
dispositioned (below). If the sweep finds a live unsourced
restatement, the round reports it with disposition, file and reason
as a scope decision — "this list" throughout this brief means the
Files bullets below, so a citing-file fix outside the new test file
is reported, not edited in this diff. This round's shippable work is
the declaration, the fixtures, and the sweep enumeration; the tree
may or may not be clean — the briefing verified one instance only
(the `AGENTS.md` restatement repaired to key-names-only), so a red
liveness arm with named findings travels the reporting path below
instead of failing the round. The expected path is a passing sweep
with the declaration named; the honest path, if the sweep finds live
restatements, is names plus scope decisions, no edits outside the one
new file.

## The refusal, and where it sits

A self-contained `scripts/` test, run by the suite like every other
`scripts/*.test.mjs` file: declared figures with their canonical
sources and restatement patterns beside them; each control fixture
failing until sourced; the sweep's declaration failing on any live
unsourced restatement. No new host — the suite auto-enrolls the new
test file, which is the cheap host the derivation's own tiering
names.

## Files

- `scripts/figure-provenance.test.mjs` — (new) the declared set, the five control fixtures, and the live-sweep assertion, with the reason each exists.

Everything else is read-only for this round. Do not edit `loop/`,
`pulse/`, anything under `openspec/changes/`,
`scripts/brief-lint.mjs`, `scripts/brief-closure.mjs`,
`data/config.json`, `runners.yml` or `package.json` — "this list"
means the Files bullets above, so a citing-file fix outside the new
test file is REPORTED with disposition, file and reason, never edited
in this diff. A fix needing a file outside this list is a scope
decision for me, stated with the file and the reason, not taken.

## Tests

Fixtures are constructed-and-declared (no wild fixture exists for
shapes 1–5 that can run — the wild halves are prose incidents, and
the arms name the incident each models). Required arms, each with its
baseline colour recorded **before** any mutation:

1. Restated bound: stale value without pointer FAILS; live value
   with pointer PASSES. Both directions — a rule that only ever
   fires one way is untested the other way.
2. Count without producer FAILS; with producer PASSES.
3. Rounded total stated exact without source FAILS; with producer
   and rounding PASSES.
4. Removal count with undisclosed blind spot FAILS; with disclosed
   miss and producer PASSES.
5. Sourceless label FAILS; label with read time and source PASSES.
6. Stamped-record escape: a dated past-tense record stating a figure
   (the tense test) NEVER fails, whatever patterns exist — pinning
   the Luna bound so this check cannot become record-deletion.
7. **Mutation A** — a declaration neutered (drop one figure's
   patterns). Its stale-restatement fixture must go green, and that
   green is the defect. File mutation, fresh-import observation where
   imported else re-execution, byte-identical revert.
8. **Mutation B** — the pointer escape neutered (any noun phrase
   counts as a pointer). A sourceless re-statement must go green,
   and that green is the defect. Same discipline.
9. Liveness: the live sweep over the tree's declared figures runs
   and its result is asserted (pass with the declaration named, or
   the fixed restatements named) — the sweep is executed, not
   described.

Every mutation is applied, run, and reverted, and the revert is
verified byte-identical. State collected/pass/fail for the baseline
and for each mutation. Your mutations here touch only your own new
file, which no other file's tests rewrite; say so in one line and
move on.

## Verification

Run your own files by absolute path with `node --test`. **Do not run
`npm test` here** — this worktree will carry no `node_modules`, so the
full suite cannot collect, and a total from a run that could not
collect every file is a measurement of a different suite. The
whole-suite total is mine to take on the merge target.

Read counts from the runner's own summary lines. It prints `ℹ tests N`
when stdout is not a terminal and `# tests N` when it is; if your
parse returns nothing, report **nothing was measured** rather than
zero.

Every property above is enforced by an arm you are writing rather than
by an instrument that already exists, so a reviewer must find each arm
and run it. Name each property and its arm in `RESULT1.md`.

## The sweep (the class+sweep discipline, and the stop rule)

Name the class — *a figure a later decision reads, restated without
its source* — and sweep it: enumerate every gating bound, gating
count and authority-measurement in the tree (config, code, operating
documents — found, not assumed), dispositioning each as BIND
(declared with canonical source in the test; any live restatement
fixed in this diff with pointer and value) or DELETE (not read by a
later decision, with the reason stated — and past-tense stamped
records are DELETE by the tense test, never candidates). The
enumeration comes back in your report. The sweep terminates when
every figure has a disposition, not when no further figure can be
imagined — that is the stop rule, and a figure you decline is a scope
decision for me, stated, not taken.

## Ground rules — these apply to you and are not inherited by working here

- **Never use the token `cd`**, in a command, in a comment, or as a shell function
  name; the approval classifier matches the token and not the intent. Run scripts
  by absolute path and use `git -C D:/AddictedtoAI` for git.
- Keep command strings short. A step needing more than a couple of operations goes
  into a file that you then run.
- Prefer the file tools over shell equivalents for reading, writing, editing and
  searching.
- **Never manipulate or print a credential**, including a partial token. An
  authentication failure is a finding you report, not an obstacle to route around.
- **If a tool call is blocked, report it and stop.** Do not route around a denial
  and do not edit a permission or settings file to clear your own path.
- Never edit `package.json`. Never run two builds at the same time.
- Every date you write is the local date of this machine.

## Your report

Write it to `RESULT1.md` at the root of your worktree, carrying in this
order: the baseline and post-mutation colour of every assertion; which
half of each control is wild and which is constructed (with the reason
no wild one exists for the constructed half); the provenance comment
you wrote, quoted from the file; the sweep enumeration with every
disposition; and anything you found that this brief got wrong.

That last one is not a courtesy. The five briefs before this one each
carried defects their reviews caught. Assume this brief carries
something similar and look for it.

If any part is blocked, finish every part that is not, and say plainly
what you left out and why. Do not narrow the scope on your own
judgement; a scope decision is mine, and an unstated one is a defect on
every attempt.
