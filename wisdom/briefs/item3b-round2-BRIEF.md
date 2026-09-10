# WISDOM ITEM 3, ROUND 2 OF 2 — the brief's file list, reconciled against the merge-base diff

authority: two-desks-work-orders-and-trains@3da67cf

Round 1 refuses a brief that drops required source text. This round
refuses the other way a brief lies about its scope: a **Files list
treated as the whole closure over the merge-base diff** when the diff
touches behaviour a test outside the list pins exactly. Three packets
paid a full tests-only round plus re-gate for exactly this — B2's
`cites-unresolved` invalidating an exact seven-entry list the brief
never named, E's additive ledger keys invalidating two exact key-set
assertions the brief kept outside, F's nine-file list holding because
it enumerated the closure. *Discipline without a pins search did not
hold.*

This is the second of two rounds for item 3, and the split is the one
round 1's brief announced: source integrity was round 1's mechanism at
dispatch time; file-list closure is enforced at the review gate, which
is a different mechanism at a different point in the run with
different wiring. Items 5 and 6 follow with their own briefs; beyond
this sentence they are out of scope here.

## The one sentence this round exists for

**A review-gate instrument that reconciles a brief's Files list
against a merge-base diff — every file the diff touches is listed or
refused as scope, and every exact pin outside the list that the diff's
production changes invalidate is reported — so the reviewer runs a
sweep instead of trusting the list.**

## What "closure" and "pin" mean is the whole difficulty

Closure here is not "the diff's files are listed". The B2 and E briefs
listed every file their diffs touched and still missed the pins: the
invalidated assertions lived in files the diff never touched. Closure
is: every exact assertion the diff's production changes invalidate is
in a listed file, or named with a reason. Three pin classes, and the
instrument covers exactly these three — a fourth shape is a finding
about this brief, not an extension you make:

- **Enum-set pins.** An exported array/set literal gains or loses a
  member in the diff (B2: `cites-unresolved` joining `REISSUE_CODES`
  in `loop/lib/review.mjs`), and a test outside the list asserts the
  exact membership (`deepEqual` against a literal list, an exact
  `.length` beside the literal — B2: the seven-entry list at
  `loop/tests/review-blog-bar.test.mjs:269-280`).
- **Shape pins.** A builder's emitted object gains or loses keys in
  the diff (E: `brief_chars`, `gate_seconds`, `authority_sha` joining
  the ledger line in `loop/lib/ledger.mjs` and `loop/run.mjs`), and a
  test outside the list asserts the exact key set (`Object.keys`
  comparisons, exact key arrays, exact-shape `deepEqual` — E:
  `loop/tests/breakers.test.mjs:172-178`,
  `loop/tests/gate-transport-retry.test.mjs:876-880`).
- **Field pins.** A named field/record shape the diff changes, pinned
  exactly elsewhere (`LEDGER_FIELDS` and the keys outside it — E:
  `loop/tests/issues.test.mjs:243` pins the array itself, which is why
  it stays green when production is unchanged and is NOT a candidate).

What escapes, stated so the instrument cannot become a blanket ban
(the E review cleared exactly this): a test file that **builds its own
fixture line and pins its own construction** (E:
`loop/tests/portability.test.mjs:409`, an eight-key line the test
assembles itself) is never a candidate, whatever the diff changes.
An arm pins the escape.

Your comment must answer, each with a reason:

- What counts as listed: a backticked path in a bullet under the
  brief's `## Files`, including a read-only-with-a-reason list (F's
  shape has two: work-only plus read-only) and files named with a
  reason in a Properties-style section that the diff's sweep must run.
  A path named only in prose is not listed.
- Why the report file (`RESULT<n>.md`, always new and worktree-rooted)
  never counts as unlisted scope when the diff touches it.
- Why automatic merge-gate wiring is out of scope this round: the
  instrument reports candidates and the reviewer judges them, because
  the false-fire rate of an automatic refusal is unmeasured — round
  1's detected-not-dispatched precedent. Enforcement this round is
  reviewer-side, through the sealed review running the instrument.
- Why strictness here cannot false-fire on legitimate rewording the
  way a text search would: candidates are exact-shape assertions over
  identifiers the diff changes, never prose mentions.

## The control, wild and therefore banked in history

All three controls are wild history, read from committed objects —
no constructed fixture, because the packets already paid for real
ones. State in your report that the controls are wild and where each
object lives:

1. **B2 catch.** Brief
   `openspec/changes/two-desks-work-orders-and-trains/evidence/reviews/stage0-packet-B2/round1-agent-brief.md`
   against `de400f7..5fb9b2b` must be REFUSED, naming
   `loop/tests/review-blog-bar.test.mjs:269-280`. The diff adds
   `cites-unresolved` to `REISSUE_CODES`; the seven-entry exact list
   is outside the brief's list.
2. **E catch.** Brief
   `openspec/changes/two-desks-work-orders-and-trains/evidence/reviews/stage0-packet-E/round1-agent-brief.md`
   against `9c1d980..db10eac` must be REFUSED, naming
   `loop/tests/breakers.test.mjs:172-178` and
   `loop/tests/gate-transport-retry.test.mjs:876-880`. The diff adds
   the three ledger keys; both exact key-set assertions are outside
   the list.
3. **F pass.** Brief
   `openspec/changes/two-desks-work-orders-and-trains/evidence/reviews/stage0-packet-F/round1-agent-brief.md`
   against `ddbfd52..df448970490c7fe496317182417364a281c216ed`
   must PASS. Nine files plus read-only-with-reason plus
   Properties-named closure files: the list IS the closure, which is
   what makes it the pass control rather than a third catch.

The corrected-list variants (B2/E lists plus the missing pin files)
are constructed by you and you say so: they must pass, proving the
refusal follows the list and not the diff.

## The refusal, and where it sits

A `scripts/` instrument, `scripts/brief-closure.mjs`, run by absolute
path: `node scripts/brief-closure.mjs --brief <brief> --base <sha>
[--tip <sha>] [--root <dir>]`. It prints `CLOSURE OK` and exits 0 when
every file the diff touches is listed and no pin-search candidate
lives outside the list; otherwise it prints one line per candidate
(file, line, pin class, changed identifier) and exits 1. A candidate
is a tripwire the reviewer judges, not an automatic verdict — the
brief that ships this instrument passes it on its own Files list over
its own diff (self-hosting, re-run by the reviewer), which is the
sweep's first row.

## Files

- `scripts/brief-closure.mjs` — (new) the instrument with the reason it reports and the reason it stays reviewer-side.
- `scripts/brief-closure.test.mjs` — (new) this round's arms.

Everything else is read-only for this round. Do not edit `loop/`,
`pulse/`, anything under `openspec/changes/`,
`scripts/brief-lint.mjs`, `data/config.json`, `runners.yml` or
`package.json` — the review-gate wiring question is dispositioned
above as out of scope, and a measurement you edited is not a
measurement.

## Tests

Fixtures are the three wild brief-plus-diff pairs above (read from the
repository's own objects at the shas named, never copied into the
test) plus corrected-list variants you construct and declare. Required
arms, each with its baseline colour recorded **before** any mutation:

1. The B2 shape is **refused**, naming the review-blog-bar pin with
   its line range and the changed identifier.
2. The E shape is **refused**, naming both key-set pins with lines
   and the three added keys.
3. The F shape **passes** — and the arm asserts the pass is for the
   closure reason (every pin file listed or reasoned), not because the
   search found nothing: it names the pin files the search did find
   inside the list.
4. The corrected-list variants (B2/E lists plus the missing pin
   files, constructed and stated) **pass**.
5. The portability-style escape holds: a file building its own
   fixture line and pinning its own construction is **never
   reported**, whatever the diff changes.
6. **Mutation A** — a pin class neutered (drop the `Object.keys`
   shape pattern from the search). The E arm must go green, and that
   green is the defect. Show it as a file mutation observed through a
   fresh import where the instrument is imported, else by re-execution
   against the neutering, and revert byte-identical.
7. **Mutation B** — the Files-list parser weakened so an unlisted
   touched file passes (or, equivalently, the F brief minus one
   listed file still passes). The scope finding must go green, and
   that green is the defect. Show it and revert byte-identical.
8. Liveness: a brief whose list omits a file the diff touches is
   refused as scope — the F-brief-minus-one shape proves the scope
   half live rather than dead text beside the pin search.

Every mutation is applied, run, and reverted, and the revert is
verified byte-identical. State collected/pass/fail for the baseline
and for each mutation. Node caches modules: re-import under a
cache-busting query for mutation observations, documented in the test
— measuring the old code and calling it the mutation is the failure
round 2b recorded. Node runs test FILES in parallel subprocesses: if
your tests rewrite a tree file and revert it, hold the
`loop/tests/lib-mutate.mjs` lock from the pre-mutation read to the
reverted byte-identical assert — the cross-file race it exists for
was measured on round 1's merge gate.

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
and run it. Name each property and its arm in `RESULT2.md`.

## The sweep (the class+sweep discipline, and the stop rule)

Name the class — *a brief's Files list treated as the whole closure
over the merge-base diff* — and sweep it: run the instrument over this
brief's own Files list against your own diff (the self-hosting row),
and enumerate every pin-class instance your patterns cover in the
current tree, dispositioning each as BIND (covered: in a listed file,
or the corrected-list variant you construct) or DELETE (not a true
pin, with the reason stated). The enumeration comes back in your
report. The sweep terminates when every candidate has a disposition,
not when no candidate can be imagined — that is the stop rule, and a
candidate you decline to sweep is a scope decision for me, stated, not
taken.

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

Write it to `RESULT2.md` at the root of your worktree, carrying in this
order: the baseline and post-mutation colour of every assertion; which
half of each control is wild and which is constructed (with the reason
no wild one exists for the constructed half); the pin-class comment
you wrote, quoted from the file; the sweep enumeration with every
disposition; the sentence saying items 5 and 6 follow with their own
briefs; and anything you found that this brief got wrong.

That last one is not a courtesy. The three briefs before this one each
carried defects their reviews caught. Assume this brief carries
something similar and look for it.

If any part is blocked, finish every part that is not, and say plainly
what you left out and why. Do not narrow the scope on your own
judgement; a scope decision is mine, and an unstated one is a defect on
every attempt.
