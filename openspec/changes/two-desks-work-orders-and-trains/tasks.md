# Tasks

Four stages. **Stage 0 ships first and alone**: **no new module in `loop/`**, no
new branch, nothing on the merge or publish path, **one standalone reporting
script** (`lint-deferrals`), every item a local edit to an existing file with a
test and a named mutation, and every item independently reversible. It is also
where the baseline measurement is taken, while brief-commit → merge means what it
meant when the 5.5-minute figure was measured.

Each later stage starts only when the previous stage's measurement task has been
recorded and read. Every testing task names the **mutation** that proves it
measures something: the named change to production code, the test that must go red
on the same input path, and restoration verified by hash.

Tasks marked **[orchestrator]** touch `CLAUDE.md`, `AGENTS.md`, `runners.yml` or
`data/config.json`. Those are reserved paths: no job may edit them, and these are
the orchestrator's work between runs.

## Stage 0 — measurable local edits, and the baseline

**The MUTATION TABLE requirement below is WITHDRAWN from B1 round 4 onward,
on its own pre-registered kill condition** (its last sentence: "if B1's
second round or packet E returns the same nil, it is ceremony and comes out,
and that commitment is recorded here before the result"). The measurement,
three rounds, three nils: B1 round 1, the table caught none of five findings
and carried a defect itself; round 2, none of four (the severe priority
inversion was the reviewer's own probe) and the table's incompleteness was
itself a finding; round 3, none of three, and two of the three findings were
about the table — a recorded red (row 8) that did not reproduce under the
sealed reviewer, and a changed behavioural line (`loop/lib/brief.mjs:720`,
task 9's wording) with no row and a false cross-reference — while the
packet's own accounting change at `loop/lib/specs.mjs:415` (`chars: used`,
introduced by round 2 at 97b31b3..439d083) had neither a row nor a
declaration after two rounds of explicit completeness pressure, with rows
17, 18 and 19 on `:413`, `:389` and `:410`, the lines either side of it in
the same return statement (Luna-Boss-2, measured from the diffs). The fair
statement is not "the table missed it": that defect, a check narrower than
the property it names, is outside the class the table was built for. The
fair statement is that the table's class produced no catch in three rounds
while the table produced findings about itself in all three, and that round
3's revise verdict rests on the two table findings alone — so its measured
effect on B1 is one round it caused and none it saved. The kill condition was
met at round 2 and honoured at round 3 (A2AI-Orch retracted on the
measurement, against its own hypothesis and before verifying, because each
round the requirement stood was paid for by the coordinator's brief text and
the worker's attention; it then told the coordinator to drop the table from
round 4, which was not its to say — the requirement lives in this frozen
text — and Luna-Boss-2 refused, routed the decision to the architect, and
Orch withdrew the instruction: a peer's message does not override a frozen
blob, and a brief contradicting its authority is the defect two rounds were
sent back for). WHAT SURVIVES, because it was observed rather than proposed
(Luna-Boss-2): a third party re-executing a claimed red found one that did
not reproduce. That value is independent re-execution and needs no author's
table, so the obligation moves to the sealed review, where the list is
machine-derived: **the reviewer takes the packet's diff from the merge base
as the list of changed behavioural lines, mutates the ones it chooses — at
least one per changed function — and reports the arm counts for each, red
and restored; a changed line it can find no arm for is a finding.**
Completeness comes from git, not from an author's declaration, and there is
no self-report between the claim and the check. Not adopted: an author's
table mechanically diffed against the changed lines (Orch's alternative,
withdrawn by Orch) — it repairs the symptom of a mechanism whose claimed
value never appeared, and adds a tool. Row 8's non-reproduction is measured
both ways for the record (the author's and the reviewer's described mutations
may be two different edits) as the one datum on whether a worker's
self-reported red can be trusted, not as a round 4 obligation. A mechanism
that carried its own falsification condition and then met it worked as a
piece of method while failing as a tool; the paragraph below is kept as
written for that reason.

**WITHDRAWN as above. Every Stage 0 packet's RESULT.md carries a MUTATION TABLE (from packet B1
onward; packet A's fifth round goes out as briefed).** One row per changed
line or injected dependency, each naming the mutation that must turn a test
red and the arm that goes red, with the red run actually performed and the
restoration verified by hash. A worker that cannot fill a row has found its own
hole before the reviewer does; the sealed reviewer re-runs rows rather than
trusting them. Why (A2AI-Orch, 2026-09-08, read from the packet A branch):
rounds 1 to 4 landed at 10:49, 11:59, 12:45 and 13:26 local — three hours of
wall clock, four worker runs and four sealed max reviews on one packet of seven,
for about 500 changed lines in four files (wall clock, not spend: it includes
message round-trips and task amendments). Three of the four revisions found
real defects (build identity; the record written before the floor; two arms
that cannot fail) and only round 3 was transcription loss, so the reviews are
not the problem; the question is WHERE the enumeration happens. Rounds 2 and 4
are one class — "this line is deletable with zero arms moving", "no test
reaches this production default", "the record is written from a signal that
precedes the check" — and each is answerable at authoring time by one question
per changed line: name the mutation that must turn a test red, and run it. The
repository already mandates mutation testing; what was missing is that the
obligation was not enumerated per changed line, so it was satisfiable in
spirit while leaving exactly those holes. Stated as a HYPOTHESIS with its test,
not as a measurement. **The test is by CLASS, not by round count** (corrected
by Orch on its own proposal after B1's first round): does a code-evidence
defect of the round-2/round-4 shape — a line deletable with no arm moving, an
injected default no test reaches — reach a sealed reviewer on any packet where
a table was required? If one does, the table does not work; if those stop
while specification and coverage defects continue, that is the shape of a
real effect. Round counts across packets (A six, B1 heading for two) are
confounded by size, subject and difficulty and measure neither. First data
point, B1 round 1: the table caught none of five findings, four of which were
specification and coverage defects outside its class, and the table itself
carried a defect, so it added work and returned none on that packet. Orch's
own diagnosis of its proposal is `addictedtoai-xrsg`: the remedy was built
from the list of defects in hand (packet A rounds 2 and 4, both code-evidence)
and the work is the closure over every class. Not withdrawn on one packet; if
B1's second round or packet E returns the same nil, it is ceremony and comes
out, and that commitment is recorded here before the result.

**A review is scoped by its brief; the suite is not.** (A2AI-Orch,
2026-09-08, verified by Luna-Boss-2 against its own artefacts.) Seven review
briefs — packet A's six rounds and B1's — said the model-naming and
change-path rules were "both enforced by tests" and named only
`loop/tests/portability.test.mjs`; the change-path rule is
`scripts/no-change-dir-refs.test.mjs`. Six sealed reviews, each faithful,
reported a property nothing they ran had tested; the first real violation
(B1's fixture referencing a change directory) was invisible to the review
that read that very diff and was caught by a full suite run by hand.
Detection came from a violation, not from an audit, and the instrument that
caught it is the only one in the chain whose scope is not set by a brief.
Therefore: **no Stage 0 packet merges without a COMPLETED full suite on its
final tip** — the 600-second floor, the rule that a command-cap timeout is a
re-run and not a result, and the orchestrator running the suite when a
worker's attempt is inconclusive are load-bearing, not tidy, and the suite is
the step that may not be dropped when a round runs long, which is exactly
when dropping it is tempting. **And review briefs name the PROPERTY, not the
instrument:** not "run `portability.test.mjs`" but "nothing here may name a
model, provider, harness or runner id, and nothing may reference a change
directory — find what enforces each, run it, and report if you cannot find
one", so that an inventory the coordinator will get wrong again becomes a
derivation the reviewer redoes each round, and a rule with no discoverable
enforcement is a reportable finding rather than a silent gap (Luna-Boss-2's
corollary: a brief's inventory is a claim with an expiry date its author
cannot see expire; this is the quantifier obligation pointed at instruments
and delegated to the agent reading the tree).

**A delta review for a tests-only round (adopted at B1 round 6, 20:49).**
Rounds 4, 5 and 6 of B1 were about test arms, not production code, and each
full sealed max review cost about 25 minutes for a few changed lines. So: a
round whose diff touches only test files and only the lines the previous
review named gets a DELTA review at medium — the reviewer is given the
previous review (it needs it), verifies each named finding fixed by mutation
(red and restored), performs the diff-as-the-list mutation on every changed
line, and runs the standing property checks. Any production change gets the
full sealed max review; a delta reviewer's out-of-scope finding is a
full-review trigger; and the completed full suite on the final tip backstops
both kinds. **Amended 2026-09-09 00:29 by the maintainer: every dispatch,
delta reviews included, runs at max.** **The exit condition (the architect's
ruling at B2 round 3, 2026-09-09 04:55).** Four consecutive reviews of one
diff each found new green mutants — REVIEW1 two, REVIEW2 six, REVIEW3 four,
none overlapping — every one an arm narrower than its property, none a
production defect; the class "an arm could be stronger" has no floor, so a
round count cannot end it and a ruling must. A delta review APPROVES when:
every named mutation of every prior review of the packet goes red under it
(re-run, not trusted), the round's diff is within its scope, the standing
properties hold, and the author's completed full suite on the final tip is
green. A further green mutant the delta reviewer finds is written into its
review and CARRIED as a note on the task, non-blocking, unless it exposes a
production defect (an arm that goes red against the unmutated code, or a
wrong world the requirement forbids) — that remains a revise. The merge-base
diff stays the list of changed lines; "at least one red arm per changed
function" stays the bar; "no green mutant exists" was never the bar and is
not reachable.

**A revision brief names the CLASS and requires a sweep of the file; the
reviewer verifies the sweep (adopted at B1 round 6, 21:05, from
Luna-Boss-2's finding about its own briefs).** Five consecutive B1 rounds
fixed the instance a review named and relocated its class to the next line:
round 3's `chars` did not measure what the ceiling bounds; round 4 left four
mutations to correct code unnoticed; round 5's shortfall arm accepted any
digits; round 6's fix for an assertion without a failure message added a bare
assertion four lines below it, in the same arm, in the same commit. Each
author did exactly what its brief said and each brief said exactly what the
previous review found: a brief that names LINES gets the lines fixed and the
class walks. So a revision brief states the class ("every assertion in this
file carries the numbers it compares", "every arm added to pin a value must
fail when that value is wrong"), requires the worker to sweep the file for
every instance and list each one changed, and the reviewer's check is the
sweep — it searches the file for the class itself — not the named lines. The
class is defined by its PURPOSE, not its grammar: Luna-Boss-2's census of
`brief-excerpt-budget.test.mjs` at round 6 found 52 assertion calls, 14 with
a message, 32 with none and 6 passing a raw value as if it were one — about
38 instances of a class five sealed reviews had named three of. Round 7's
reading: every length, count, cap and `chars` comparison carries both
numbers; the six raw-value arguments become real messages; assertions whose
failure is already legible (a regex match, a heading-order comparison) are
listed as deliberately unchanged with one reason each; the reviewer runs the
same census script, so the sweep check is mechanical.

**And the architect's own obligation before every freeze: when a task says
"every X", enumerate the X's and confirm each one can satisfy it.** Two of
packet A's five revisions were defects in the STANDARD, not the implementation
— round 3's brief dropped the word "both"; round 5's task said "every injected
dependency" when two of the nine default to a real repository and a live build
— and both were found by a full worker plus a max sealed review, the most
expensive detector pointed at a text problem; round 5's production bytes were
identical to round 4's by blob id. A quantifier is the most expensive sentence
to get wrong: cheap to write, reads as rigour, falsified only by the one member
nobody enumerated (A2AI-Orch, 2026-09-08; `addictedtoai-xrsg`'s diagnostic —
name one member of the domain that would not appear in the list). Checked on
the text frozen at 658625d: six gates, two spawners, six swept directories,
three named seams, seven packets — every quantifier's domain is enumerated in
the sentence that uses it.

**Every brief is reviewed by a second model before it is dispatched (the
maintainer, 2026-09-09 about 08:00: "Let's try adding a review step for the
briefs, they seem to be causing a lot of issues. After you write a brief,
spawn an OpenCode DeepSeek session on max reasoning to review the brief";
and: "Make sure the review instructions are narrow scoped, DeepSeek has a
habit of trying to do more than asked").** The trigger was packet E's
round-1 brief turning two tests red exactly as B2's round-1 brief had — a
Files list that was the tasks' list, not the closure over the change — after
the lint had passed: the lint checks shape (verbatim quotes, file reasons,
the `cd` token), and the closure is a reading of the tree. The reviewer is
OpenCode's plan agent (edits denied by the harness's own permission table)
on `opencode-go/deepseek-v4-flash` at `--variant max` — **since 2026-09-09
12:07 on `opencode-go/muse-spark-1.3-contributor` at `--variant xhigh`, its
top rung on that provider (the maintainer: "Lets switch to just using muse
to review the briefs for now", after the tally on the four texts both models
reviewed: DeepSeek caught one real defect Muse missed, E's dead read-back
addresses, plus one non-blocking note; Muse ran in 1.6 to 4.3 minutes on
45K to 65K tokens with no failed runs against DeepSeek's 7 to 20 minutes on
90K to 115K with two no-verdict runs that morning — a server-side abort and
a provider 400)** — given the brief and a
fixed checklist of ten checks — verbatim quotes; the file list as the
CLOSURE (grep for exact pins of everything the brief says changes);
quantifiers resolved; cited line numbers true; contradictions between prose,
standard and code; instruments named; mutations realisable and red;
ambiguity; the report contract; the ground rules — under an explicit scope
that forbids implementing, rewriting the brief, reviewing the tasks, running
the suite or spawning anything, with a budget of twenty commands and the
review WRITTEN to the one file the agent may write. Measured the same
morning: told only to "end with the review", the model twice ran about
fifty commands, dumped whole files into its own context and ended with
nothing; with the budget, range reads and a write target, its third run
returned REVISE on the architect's round-2 brief with two evidenced
defects — a read-back of a file the job removes before its merge, and a
mandated edit to a file the brief forbade — in sixteen commands. A REVISE
with evidence is fixed before dispatch and the brief reviewed again; a
finding without evidence is recorded as a guess. Verdicts are banked beside
the brief under `evidence/reviews/`.

### The gate floor and the launch build

- [x] 1. `loop/lib/gates.mjs`: every gate declares a **floor duration**, derived
      from a recorded calibration of that gate on this repository and set by a
      stated margin **below the fastest legitimate run observed** (warm caches
      included — a warm `next build` is far faster than the 29.2 s cold one) and
      **above what a run that did none of the gate's work could take**, recorded
      with its date. Packet A's first tip derived floors as 0.1% of runtime
      (verify-design 35.7 ms, test 314.8 ms), and that basis was wrong in BOTH
      directions at once (2026-09-08): too LOW for the gate that costs most — a
      test gate returning in 400 ms clears a 314.8 ms floor while having run no
      suite (A2AI-Luna-Boss-2's withheld finding) — and too HIGH for legitimate
      trivial invocations — a bare `node` child measured min 61.6 / median
      67.7 ms and `cmd.exe /c npm run <script>` min 553.5 / median 588.1 ms here,
      7 runs each, and a Linux bare spawn is 25–40 ms, so the fixture trees in
      `loop/tests/job-gate-set.test.mjs`, whose gates are `node --version`,
      would false-fail on faster hardware, and load makes children slower so the
      false failure arrives on the FAST machine (A2AI-Orch). The shape that
      closes both: repository floors as a stated fraction of the gate's recorded
      runtime — **deliberately generous while the calibration is one observation
      per gate**: at 25% of the single recorded run, test 78.7 s, launch 9.9 s,
      design 8.9 s, build 7.3 s, analytics 4.9 s, surfaces 0.93 s, so a 400 ms
      no-op misses the test floor by about 200x and a real gate would have to
      get four times faster to trip it, which is itself worth stopping to look
      at — and `runGates` accepting an explicit floor set for a tree that is not
      this repository, which the fixture tests pass, with the ~1 ms tripwire as
      the lowest any override may set. The calibration records how many runs
      each figure rests on (today: one, taken 2026-09-08 on this machine, with
      the suite's wall time moving under load, 1,380 s summed against 298 s
      wall); the margin is stated as generous pending a distribution, not
      justified from a variance nobody has measured. The FIXTURE numbers (npm's
      own startup around `node --version` in a temp tree) are the basis for the
      fixture floor and the tripwire minimum and never for a repository floor:
      the real test gate has no legitimate fast path, and a floor a thousandth
      of the gate is how the first tip went wrong. `next build` does have a
      legitimate fast path, the warm cache; its floor is set from a warm run when
      the calibration has one and the cold run's generous fraction until then. `runGates` fails the stage when a gate
      returns below its floor, naming the gate and the observed duration. Invoke
      npm scripts through `cmd.exe /c`, never `shell: true`. Implements: *A
      job's gates are a tripwire; the full set runs once, on the train*, the
      floor bullets.
- [x] 2. `loop/tests/gates.test.mjs`: a fake gate returning exit 0, no output, in
      2 ms fails the stage naming the floor; a fake **test** gate returning exit 0
      in 400 ms fails under the repository floors and passes only under an
      explicit fixture floor set; an override below the tripwire is refused; a
      real gate above its floor passes; and a fake **build** gate returning
      exit 0 below its floor fails the stage **and leaves no build success
      record on disk** (round 2's severe finding: the record was written on
      exit status at `gates.mjs:481`, before the floor ran at `:635`, so the
      floor said "did not run" and the persisted record said "succeeded", and
      the record is what a later gate believes — two mechanisms for one
      property must agree, and the record derives from the floor-checked
      result). That regression test is permanent, not a probe. And the
      ORDERING is asserted where it happens, not on the final state: with an
      old success record seeded, the injected spawn callback asserts the record
      is already absent at spawn time (round 4 found `gates.mjs:460`, the
      removal before the spawn, deletable with zero arms moving, because every
      arm inspected only the state after the spawn returned; a concurrent
      launch check can observe and reuse the stale record while the new build
      runs). **Mutation**: delete the removal line and confirm that arm fails.
      **Mutation**: delete the floor comparison and confirm the 2 ms case passes
      while the real case still passes — if both stay green the test measures
      nothing. Restore and verify byte-identical by hash. Tests task 1.
- [x] 3. `scripts/verify-launch.mjs`: reuse an existing build of the tree under
      check instead of spawning its own when one is present, current **and
      recorded as having succeeded**; keep spawning one when it is not. The
      success record has **exactly one writer function**, exported by
      `loop/lib/gates.mjs` and taking the floor-checked result; both spawners of
      a build — the build gate in `gates.mjs` and `verify-launch`'s own build —
      remove any earlier record before spawning and pass their spawn result
      through that one function with the repository floors, and a sweep of
      `loop`, `lib`, `pulse`, `scripts`, `app`, `tools` proves no other writer
      (round 3's sealed reviewer's method; `verify-launch.mjs:88` and `:92`
      already import from `loop/lib/` so the launch check and the merge gate
      cannot drift, and this is the same argument). Round 3 fixed the gate and
      left `verify-launch.mjs:1025-1026` writing from exit status alone because
      its brief dropped the word "both"; a null status is not `=== 0`, so the
      shim mode never reached the record that way, but an exit-0 build under
      the floor did. The function writes `out/.build-stamp.json` — `ok: true`,
      the local time,
      and the `out/status.json` stamp (`lib/stamp.mjs` `buildStamp`: commit and
      dirty flag, written by prebuild's `assets` step) exactly as the spawner saw
      it after the zero exit, rather than recomputing commit and dirty into a
      second stamp with a second meaning — only on a zero exit **that has also
      cleared the gate's floor**: the record is written after floor enforcement
      (or removed on a floor failure), never inside the spawn on exit status
      alone, so the floor and the record can never disagree about whether the
      build ran — and `hasCurrentBuild` requires the record as well as the
      timestamps — a failed
      export leaves `out/` newer than the sources, so "newer than every source"
      reports BUILD PASS on a failed build (found by A2AI-Orch on packet A's
      first tip, 2026-09-08). No `package.json` edit and no prebuild step:
      prebuild runs before `next build` in the same npm script and cannot know
      whether it succeeded. **The input walk's rule as first written here —
      "excludes a path only if every writer of it runs inside `npm run build`"
      — is SUPERSEDED by task 3b's combined rule (2026-09-08): a path is an
      INPUT only if some build step READS it, and a read path is EXCLUDED only
      if every writer of it runs inside `npm run build` (a build-internal
      output).** The writer test alone tested the wrong end of the relation:
      it could not exclude `.beads/`, which `bd` writes from outside the build
      and which nothing in the build reads (Luna-Boss-2 caught the two tasks
      contradicting each other on that path; the architect's quantifier check
      had been run on tasks 1–4 and not on the task it added next). The two
      worked examples agree under either rule and stay as written: `public/`
      qualifies (written solely by prebuild's `assets` step through
      `lib/site-assets.mjs`, a build output copied into `out/`);
      `data/derived/**` does NOT, because the Pulse rewrites it (`pulse/lib/
      derive.mjs`, `rederive.mjs`, `freshness.mjs`, `frontier.mjs`, `mint.mjs`,
      `queue.mjs`, `registry.mjs`, `vanished.mjs`, `run.mjs`) and 24 non-test
      modules under `lib/` read it, so excluding it would let verify-launch reuse
      an export that predates the day's Pulse and report BUILD PASS on a site
      that does not contain the day's data — the finding this task fixes,
      reintroduced by the fix (A2AI-Orch, who raised and then withdrew the
      `data/derived` exclusion the same hour). The reason any exclusion exists:
      a build that writes into its own input set is saved from defeating its own
      reuse only by prebuild preceding `next build` today. `openspec/` IS an
      input (prebuild's `spec-deltas` step and `lib/paths.mjs:35` read it), so
      the coarse whole-tree input set stands and a Pulse run forces a rebuild,
      as it should. The timer at `:832` and the report at `:847` then report the
      reuse. Implements the same requirement's reuse bullet.
- [x] 4. `scripts/tests/verify-launch.test.mjs`: with a present, recorded build the
      run **spawns no build process** — asserted on the spawn, not only on the
      branch — and reports reuse; with none it builds; with an export newer than
      every source but **no success record, or a record naming another commit,**
      it builds; with a **stale** export (any source newer than `out/`) it
      builds; with an **empty** `out/` it builds. Four arms beyond reuse, because
      the requirement says "present **and current**" and the first tip shipped
      only fresh and absent (found by A2AI-Orch, verified by Luna-Boss-2,
      2026-09-08): with those two arms alone, replacing `hasCurrentBuild`'s whole
      body with a presence check leaves every test green while the gate reuses a
      stale export and verifies a tree nobody built. **Mutation A**: make the
      presence check always return false and confirm the reuse case fails while
      the build case still passes. **Mutation B**: make the record check always
      return true and confirm the no-record case fails while the reuse case
      still passes. **Mutation C**: replace `hasCurrentBuild`'s body with
      presence alone and confirm the stale and empty cases fail. And one fixture
      whose newest input mtime **equals** the newest output mtime, asserting a
      build is spawned: the comparison is strict `>` (round 1's equal-timestamp
      objection, answered at `verify-launch.mjs:323`), but round 2's fixture
      clock used three constants and never the same value twice, so no fixture
      had equal mtimes and RESULT.md asserted "equal timestamps do not pass" as
      though tested while restoring `>=` left all eight tests green.
      **Mutation D**: restore `>=` and confirm the equal-mtime case fails. And
      `verify-launch`'s OWN build exiting 0 below the repository floor reports
      a failed build and leaves no record — the mirror of task 2's gate case,
      through the second spawner. The stale-export-with-valid-record fixture
      that already exists at `:138` ("a stale export builds even when its
      success record is otherwise valid": same commit as the current fixture,
      dirty false, one source newer, exactly one spawn) is named here so a
      tidy-up cannot delete it as a duplicate of the other-commit case: the
      stamp is identity and the mtime walk is freshness, and on this
      permanently dirty tree (13 porcelain entries, always) the stamp alone
      collapses to the sha, so that fixture is what goes red if the freshness
      comparison alone is deleted (**mutation E**). Two more properties, both
      from round 4 and both the same class — correct production code the suite
      cannot distinguish from its absence: (i) the removal-before-spawn ORDERING
      at `verify-launch.mjs:984` is asserted inside the injected spawn callback
      with an old record seeded (the record already absent at spawn time), in
      its own arm separate from the gate's (task 2), keeping the final-absence
      assertion too; **mutation F**: delete that removal line and confirm only
      this arm fails. (ii) **Every injected dependency that carries a DECISION
      has at least one arm that takes the PRODUCTION DEFAULT, and every other
      injected dependency is DECLARED in RESULT.md with the reason it is not
      armed** — a declared exemption is fine; a claimed coverage that mutation
      refutes is not, and that distinction is the whole finding. The
      decision-carrying seams of `checkBuild` are `floorSet` (called without one
      it must apply the repository build floor: observe the floor failure on a
      below-floor spawn, or assert the reported `floorMs` equals
      `GATE_FLOORS.build.floorMs`), `isCurrent` (without one it must use
      `hasCurrentBuild`), and **`now`**, the clock whose difference the floor is
      compared against: a default-clock arm asserts an observed positive
      duration reaches the floor comparison, because a constant clock computes
      the floor decision on a fabricated number, the exact failure the floors
      exist to catch, unmeasured, in the packet built to measure it. The rest
      are declared, not armed: `root` and `spawn`, whose defaults are a real
      repository and a live `npm run build` (forbidden in a unit test by the
      sealed limits and the machine-wide build lock — the rule's first draft
      said "every injected dependency" and was unsatisfiable as written, the
      architect's defect, found by round 5's sealed reviewer); `write`,
      `report` and `localNow`, output and record-timestamp seams. History:
      round 4's helper defaulted to `FIXTURE_FLOORS` and every one of ten calls
      forwarded a floor set, so `floorSet = GATE_FLOORS` at `:952` replaced by
      `{}` left all ten green while production would build against no floor;
      round 5 armed `floorSet` and `isCurrent` and proved them by mutation, and
      the sweep of all nine seams found `now`, `localNow`, `write` and `report`
      green under a constant or a no-op, the union of the coordinator's and the
      reviewer's lists being larger than either alone. **Mutation G**: replace
      the `floorSet` production default with `{}` and confirm its default arm
      fails; **mutation H**: replace `now` with a constant and confirm the
      default-clock arm fails. Tests task 3.
      **DONE at merge `b700d36` (branch `stage0/a-gates-launch` at `b820031`,
      six rounds, tasks 1–4 together).** The declaration is derived from
      `checkBuild`'s signature, not from the list above: the round 6 author
      found that this text omitted the optional `floors` alias — nine options,
      three armed (`floorSet`, `isCurrent`, `now`), six declared, `runBuild`
      excluded as a positional control argument — and reported the omission as
      a finding, which is the list-versus-work diagnostic applied to the task's
      own enumeration. Surviving, unreachable today, filed `addictedtoai-m22a`:
      `enforceGateFloor` answers "cannot evaluate" in opposite directions (an
      unknown gate name fails closed, a non-finite duration passes unchecked)
      and is now exported, so its inputs are no longer two visible call sites.
- [x] 3b. `scripts/verify-launch.mjs` (`hasCurrentBuild`'s input walk) and its
      test: **the combined rule, which supersedes task 3's writer-only
      sentence** — a path is an INPUT only if some build step READS it
      (membership by readers), and a read path is EXCLUDED only if every writer
      of it runs inside `npm run build` (the exception for build-internal
      outputs such as `public/`; `data/derived/**` stays in because the Pulse
      writes it from outside and 24 modules read it). Under that rule `.beads/`
      at the repository root is excluded explicitly, with the reason recorded
      in the code: the issue tracker's embedded Dolt database, backup set and
      journal are written autonomously by `bd` on every issue operation from
      any session, and no build step reads them (found by A2AI-Orch on
      2026-09-08 after a captured fourth run rebuilt 49 s three minutes after a
      0.365 s reuse; seven of the eight inputs written in between were under
      `.beads/`). Why this is priority rather than tidiness (Luna-Boss-2): every
      fleet brief's ground rules say "`bd create` for something you find and
      cannot fix is welcome", so a worker filing a finding mid-run defeats the
      reuse for whoever runs verify-launch next, 46 to 52 seconds bought by
      packet A and spent by an instruction the coordinator rightly keeps — the
      excluded-path rule is what decides whether the reuse fires at all in a
      repository where a tracker writes on every operation from any session.
      Test: with a current export and record, a write under `.beads/` does not
      defeat reuse (no spawn), and a write to a read input still does.
      **Mutation**: remove the `.beads/` exclusion and confirm the first arm
      fails while the second still passes. Small; rides with packet E. Serves
      task 31's availability measurement.
      **Resolved before E's freeze (2026-09-09 02:50, from `de400f7`):** (i)
      `hasCurrentBuild(root)` (`verify-launch.mjs:279-288`) walks the whole
      root with `BUILD_INPUT_EXCLUSIONS` = `.git`, `.next`, `node_modules`,
      `out`, `public` (`:190-196`, root-level names only, `:210`), so `.beads`
      is walked today and every `bd` write defeats reuse; `data/derived/**` is
      walked and stays walked. (ii) The combined rule is DOCUMENTED beside the
      set — a comment stating membership-by-readers and exclusion-by-writers,
      with `.beads` added and its reason — not computed: deriving readership
      from the build is design beyond this task. (iii) The test is NEW,
      `scripts/verify-launch-build-reuse.test.mjs` — no test names
      `hasCurrentBuild` today; `hasCurrentBuild` takes a root, so the fixture is
      a throwaway git repository under the OS temp directory with one commit,
      an `out/` holding one file, and a valid `.build-stamp.json` whose
      `status.commit` equals that repository's short HEAD (read
      `readBuildSuccessRecord` at `:245` for the exact shape). Arms: (a) with
      that current record, a later write under `.beads/` leaves
      `hasCurrentBuild` true; (b) a later write under `content/` makes it
      false. Named mutation: remove `.beads` from the exclusion set and confirm
      (a) fails while (b) still passes. (iv) Files: `scripts/verify-launch.mjs`
      (the set and its comment only) and the new test.
      **DONE at merge `c3aa5c7` (rode with packet E).** `.beads` joins
      `BUILD_INPUT_EXCLUSIONS` with the combined rule and its reason in the
      comment beside the set; `scripts/verify-launch-build-reuse.test.mjs`
      (new, two tests) proves a `.beads/` write leaves `hasCurrentBuild` true
      and a `content/` write makes it false; the named mutation fails (a)
      while (b) passes — 1 of 2 red at round 1 and under REVIEW1.

### The brief diet

- [x] 5. `loop/lib/specs.mjs`: delete pass 2b (`:317-330`). Excerpts become the
      requirements the governing type and the declared subjects name plus the
      pending-amendment deltas for those requirements only — **and nothing
      else means nothing else**: the zero-score exception at `:281` (a section
      with no matching keyword still admitted when the item picked nothing)
      goes with pass 2b, because B1's reviewer measured nine unrelated sections
      in an excerpt built under it. **Stage 0 reading of "declared subjects"
      (resolved here, not in a brief):** the `declared_subjects` field is Stage
      2's (task 55); until it exists, `excerptsFor` takes a subjects list that
      the Stage 0 caller fills from the subject paths the job's `.job/source.json`
      already names, empty when it names none, so the function's contract is
      the requirement's from the start and only the caller changes in Stage 2.
      **Resolved at B1 round 2 (the author found `loop/run.mjs:1332-1343`
      writes no subject list at all): in Stage 0 the caller passes an EMPTY
      list and the excerpt set is the governing type's requirements and their
      pending amendments, nothing more. No heuristic fallback — not `target`,
      not `raw.subject`, not `id` — because a subject that reaches `excerptsFor`
      must be a path the work order DECLARED, and mapping a content path to
      its capability's requirements is a piece of design (one explicit map
      from the closed `kind` list to capabilities, with an unmapped path
      reported in the brief rather than silently dropped) that belongs to
      task 55/59, where declared subjects exist. `loop/run.mjs` is not in B1's
      files and does not join them.**
      B1's brief had told the author declared subjects were not the packet's
      responsibility, a requirement-level tension resolved by fiat in a brief
      (the coordinator's own finding); this sentence is the resolution.
      Implements: *The brief carries the requirements the work order names, and
      nothing else*, bullet 1.
- [x] 6. `loop/lib/specs.mjs` (`:281`, `share = Math.floor(maxChars / plan.length)`,
      where `plan` holds one entry per source and `specSources` yields the
      constitution plus one delta per unarchived change): **the budget is not
      pre-divided by source at all.** As first written this task said only
      "stops dividing across unarchived changes", and B1's author implemented
      exactly that (`/ caps.length`), which REMOVED THE BOUND: the equal
      division was doing two jobs, a fair share per source and the total
      ceiling, and dividing by capabilities while allocating per plan item lets
      the total reach `maxChars × plan.length / caps.length`, growing with every
      open change. Measured on the live tree by Luna-Boss-2 at B1's first
      handover, against a 24,000 ceiling: interpret 56,024 (2.33x), machinery
      47,077, repair 43,789, entry 36,613, verify 35,522, scout 30,960, tutorial
      27,328, post 27,226 — eight of ten types over the ceiling. The architect's
      defect: the task named the symptom of the division and not its second
      job. The allocation that satisfies both bullets: (a) the named
      requirements are placed in PRIORITY ORDER — the governing type's
      requirements, then the declared subjects', each followed by its own
      pending amendments — with every named capability's constitution excerpt
      guaranteed present before any amendment is admitted (the per-capability
      floor); (b) ONE total cap, `BRIEF_EXCERPT_MAX_CHARS`, applied to that
      ordered list, cutting from the end with a `[... CUT ...]` marker that
      names what was cut; (c) no per-source share exists, so nothing shrinks as
      changes open and nothing grows with them either. **(d) Under a tight cap
      the priority order HOLDS (resolved at B1 round 2, where the first
      implementation reserved space for every LATER floor before allocating an
      earlier one and so dropped the highest-priority capability first — the
      reviewer's probe at `maxChars: 500` lost `pulse` and kept `site` and
      `review`): what every named capability is guaranteed is its MARKER — one
      line naming the requirement heading as cut — and nothing more; the
      reserve for later floors counts markers only, never content; content is
      allocated in priority order, first come, so an earlier floor is never
      starved for a later one; a floor whose content does not fit is
      represented by its marker; and a cap below the sum of the markers is a
      configuration error that fails loudly, never a silent `continue`. "Every
      constitution represented" means its marker at minimum, and that is
      stated because the first text did not say what represents a
      constitution that cannot fit.** If, with pass 2b and the
      zero-score exception gone (task 5), a type's named requirements still
      exceed the ceiling, that is task 8's live finding with numbers and the
      architect's disposition, never a raised ceiling. `loop/lib/config.mjs`
      holds only the constant and its rationale. Implements the same
      requirement's bullet 2 and its ceiling bullet together.
- [x] 7. `loop/lib/config.mjs`: **lower `BRIEF_EXCERPT_MAX_CHARS` from 88,000 to
      24,000**, its value before the four raises. Deleting pass 2b removes
      saturation; it does not lower a ceiling, and a ceiling four times the size of
      the material below it bounds nothing. The equality assertion at
      `loop/tests/brief-excerpt-budget.test.mjs:133` moves to the new value and
      that file's header comment gains a dated line for this fifth move, down,
      keeping the four earlier re-measurements as history. Implements the same
      requirement's ceiling bullet.
- [x] 8. `loop/tests/brief-excerpt-budget.test.mjs` (extended — it is the one file
      that owns the ceiling's assertions and its header is the constant's
      history; no new `specs.test.mjs`): a PINNED fixture corpus **holding a
      spec for every capability any job type's checklist names** (B1's first
      fixture held only `pulse`, `site` and `review`, so the all-types no-cut
      assertion passed on absence for `verify` and others) with three
      unarchived changes and a `repair` type produces the same excerpt set as
      one with zero, **compared WITHOUT filtering** — the set the test asserts
      on is the excerpt's whole heading set, unrelated and surplus headings
      included, because B1's first test filtered those out before comparing and
      so passed on the wrong world (nine unrelated sections admitted) — **and the assembled brief against that fixture is at most 30,000
      characters** — an upper bound on the artifact, not merely unspent budget.
      The bound is asserted on the fixture, never on the live tree: the live
      brief's size moves with every change archived or opened
      (`addictedtoai-2sx8`), so a live assertion would go red on a commit that
      touched nothing near it — the `pre-existing` class reintroduced as a unit
      test. The live tree's assembled size is MEASURED and printed by the test
      run, and recorded as `brief_chars` on the ledger (task 25), never asserted.
      The file's live-tree no-cut test (`:143`, "no job type's assembled brief
      cuts a requirement mid-sentence today") is the same time-dependent class:
      it becomes an assertion on the pinned fixture for every job type, and the
      live tree is measured and printed per type (largest brief, any cut, which
      type). A live cut at the new settings is a finding reported with its
      numbers in RESULT.md; it is never repaired by raising the ceiling, because
      the requirement sets the ceiling from what the named requirements cost.
      **Mutation A**: restore pass 2b and confirm the size assertion fails; the
      excerpt-set assertion may fail too, since pass 2b lets the three-change
      corpus fill from delta sources the zero-change corpus lacks — report which,
      and weaken neither. **Mutation B**: restore the ceiling to 88,000 and
      confirm the size assertion fails. The two mutations need OPPOSITE fixtures
      (Luna-Boss-2, 2026-09-08): A bites only where there are surplus
      keyword-matching sections AND unspent budget; B bites only where 24,000
      actually binds, and with pass 2b gone size follows the material, so a
      fixture that fits comfortably under 24,000 is byte-identical at 88,000. If
      one fixture cannot make both go red, use two and say why; a fixture on
      which a named mutation quietly does nothing is the vacuous proof this
      repository keeps finding in its own checking apparatus. Tests tasks 5–7.
- [x] 9. `loop/lib/specs.mjs` and `loop/lib/brief.mjs`: deleting pass 2b makes
      `specs.mjs:335`'s `truncated` flag true far more often, which changes the
      brief's "read the full files" guidance. Update that guidance to say what
      truncation now means. Test: a brief whose excerpts are bounded carries the
      corrected wording. Implements the same requirement's bullet 1 rider.
      **Tasks 5 to 9 DONE at `aa8bb3c` (2026-09-08 21:46; branch
      `stage0/b1-brief-diet@676c40a`, seven rounds, approved at round 7 by a
      delta review after five sealed max reviews; the worker's own full suite
      on the final tip 1,727 of 1,727; Orch's diff read; record in design.md
      round 15; evidence in `evidence/reviews/stage0-packet-B1/`).** Paired
      numbers, as the standard requires: the fixture bound in task 8 is
      30,000 and the live tree's assembled briefs at `cef399d` were scout
      41,043 and post 35,564 (the round 3 worker's printed measurement, not
      re-derived by a second party), so the bound is the fixture's and the
      number it enforces is one the live tree exceeds — task 59 owns the live
      budget. The loud failure below the marker sum is exact at 853
      characters on the live tree and 833 in the fixture (three markers).
      NOTES carried, not closed, inherited by task 59's next touch of
      `specs.mjs` (Orch's diff read, none blocking): (a) the constitution's
      copy of an amended requirement is now quoted beside its amendment
      (`superseded` hardcoded 0) while the old comment argued against exactly
      that — strike the old rationale or explain the reversal in the file;
      (b) `ctx.pendingRoot` is never assigned in production (`brief.mjs:665`
      passes it; nothing sets it) — an inert seam that needs a comment before
      someone "fixes" it; (c) the empty-plan early return computes
      `truncated` on an empty array, always false. And (d) the pre-existing
      `chars: used` exclusion of headings and separators, re-introduced by
      round 2 and fixed in round 4, is closed: `chars` is the rendered length.
- [x] 10. `loop/lib/verdict.mjs` and `loop/lib/review.mjs`: a verdict record MAY
      carry a structured `cites:` list of requirement headings, validated against
      the live specification's headings the way reasons are validated against the
      closed reason list; a heading resolving to no requirement is refused.
      Implements: *The reviewer judges quality with full standing, from a named
      reason list*, the `cites:` bullet.
      **Resolved before B2's freeze (the architect's quantifier enumeration,
      2026-09-08 23:05, from the code at the tip):** (i) `cites:` is read by
      `parseVerdict` from front matter only, on `carry:`'s terms — a scalar is a
      one-entry list, each entry is trimmed, duplicates collapse, absent or
      empty is `[]` (the ordinary case, not a warning) — returned as `cites`,
      never altering the verdict value. (ii) A "requirement heading" is the text
      after `### Requirement:` on its heading line, trimmed, exactly as
      `requirementSections` (`specs.mjs:139`) reads it; `(preamble)` is not a
      heading; membership is exact after trimming with no case folding, the way
      `REASONS.includes` is exact. (iii) "The live specification's headings" is
      the union over EVERY capability under `openspec/specs/` — not only the
      governing type's — of the headings in its constitution and in every
      unarchived change's delta for it, read through `specSources` under the
      same `pendingRoot` seam `excerptsFor` uses so a fixture can pin it; the
      enumeration is ONE exported function in `loop/lib/specs.mjs` beside
      `requirementSections` (a second `### Requirement:` parser in `review.mjs`
      is the two-parsers drift `verdict.mjs`'s header warns against). Measured
      at the tip: 116 constitution headings across 11 files, none duplicated;
      31 in this change's deltas. (iv) "Refused" means `mergeGate`
      (`review.mjs:830`) checks `cites` BEFORE the verdict branch, on all three
      verdict values — reasons are checked only on non-approve, and that
      asymmetry is not copied: a `revise` citing nothing that exists would send
      the author a brief built on a missing heading, and an `approve` carrying
      one names a requirement the specification does not hold — with a new code
      `cites-unresolved` naming every unresolved entry, and that code joins
      `REISSUE_CODES` (the record is unusable, not the work; the job ends
      `failed` and no revision is invoked, as for a blank `would-cite`). (v) The
      reviewer is told: the record template in `assembleReviewBrief`
      (`review.mjs:711-730`) gains a commented `cites:` line stating (ii)–(iii)
      and what the field feeds (task 11); the heading list is not printed (116
      lines) — the spec files are in the review worktree. (vi) The arm, in
      `loop/tests/review.test.mjs` beside the other `mergeGate` refusals: a
      record citing a heading the fixture holds passes; one citing a heading it
      does not is refused with `cites-unresolved` on `approve` AND on `revise`;
      named mutation — drop the resolution check and confirm both refusals go
      green. This task's files are therefore `verdict.mjs`, `review.mjs`,
      `specs.mjs` (the enumeration) and `review.test.mjs` (the arm).
- [x] 11. `loop/lib/brief.mjs`: `assembleRevisionBrief` carries the verdict, the
      acceptance checks, the diff and the excerpts **for exactly the headings
      `cites:` names** — and not `briefText` whole (`run.mjs:734`). An empty
      `cites:` yields the checklist's requirements for the governing type and
      nothing else. Implements: *The brief carries…*, revision bullets.
      **Resolved before B2's freeze (2026-09-08 23:05):** (i)
      `assembleRevisionBrief` is a NEW export of `brief.mjs`, and
      `run.mjs:733-738`'s inline concatenation becomes its one call — `run.mjs`
      is in B2's files for that call site only, because a function nothing
      calls is the mechanism the memory index's statement 5 warns about:
      passing tests say a path works, never that it runs. (ii) It carries, in
      this order: a header naming the job, type and branch with the
      continuing-invocation sentence (same worktree, no prior conversation);
      the accounting block as now (`invocationAccounting`; the "supersede the
      figures above" sentence goes, since the original figures are no longer
      sent); the VERDICT — value, reasons, the free-form notes, and the
      diff-measured refusal reason when `isDiffRefusal` holds (the `findings`
      composition at `run.mjs:709-715` becomes the assembler's input); the
      ACCEPTANCE CHECKS — the author brief's "## Acceptance checks" section
      (`acceptanceChecksFor(type)` plus the generated gates line) rendered by
      ONE shared helper both assemblers call, so they cannot differ; the DIFF
      under revision — `diffText` as passed to `runReview` (`run.mjs:587`, the
      string the reviewer judged); the EXCERPTS per (iii); then `GROUND_RULES`
      and `RESULT_PROTOCOL_INSTRUCTION` (a revision is an unattended invocation
      that must end in RESULT.md, and the ground rules are repeated in every
      brief by rule). Not `briefText`, not the outcome section, not the "what
      happens next" prose. (iii) `excerptsFor` gains a `headings` option: when
      it names one or more headings the plan is exactly the sections whose
      heading is in that set — in every capability that holds it (unique across
      constitutions today; a duplicate would be carried for each), constitution
      first then that heading's pending amendments — under
      `BRIEF_EXCERPT_MAX_CHARS` with the same floors, markers and cut, keyword
      scoring bypassed. When `cites` is empty the call is byte-identical to the
      author's (`{subjects: [], maxChars, pendingRoot}`), task 5's Stage 0
      reading. (iv) A cited heading is resolvable here because task 10's gate
      refused the record otherwise; the assembler still names, in a one-line
      marker, any heading it could not find — never silently.
- [x] 12. `loop/tests/brief.test.mjs`: a revision brief is strictly smaller than its
      author brief, contains the excerpt for each cited heading, and contains no
      section for an uncited one. **Mutation A**: prepend the whole original brief
      and confirm the size assertion fails. **Mutation B**: ignore `cites:` and
      send the governing type's whole checklist, and confirm the
      no-uncited-section assertion fails — omission and padding must both be
      caught. Tests tasks 10–11.
      **Resolved before B2's freeze (2026-09-08 23:05):** (i)
      `loop/tests/brief.test.mjs` is NEW — no file of that name exists; four
      `brief-*.test.mjs` siblings do. (ii) The fixture is a pinned corpus under
      the OS temp directory via `makeRepo` with the `pendingRoot` seam
      (`brief-excerpt-budget.test.mjs:59-80` is the pattern): a governing type
      whose `SPECS_FOR_TYPE` lists two or more capabilities, each constitution
      holding two or more `### Requirement:` sections, with enough text that
      the author brief's excerpts outweigh the revision's diff and notes; the
      fixture's diff and notes contain no `### Requirement:` line. (iii) The
      fixture's `cites` names exactly two headings — one governing capability's
      named section and one section of a capability OUTSIDE the governing list
      — and omits the other governing capability's named section, so Mutation
      B both admits an uncited section and drops the outside one. (iv) A
      "section" is a `### Requirement: <H>` line in the brief's excerpt part;
      "contains the excerpt for each cited heading" and "no section for an
      uncited one" are asserted on that line set against the corpus's WHOLE
      heading set, unfiltered (task 8's lesson). (v) A third assertion, for
      task 11's empty-list clause: with `cites: []` the revision brief's
      heading set equals the author brief's. (vi) Sizes are asserted on the
      fixture only; the live tree's author and revision sizes for one type are
      measured and printed, never asserted (task 8). (vii) The
      `cites-unresolved` arm lives in `review.test.mjs` (task 10(vi)), not
      here.
      **Tasks 10 to 12 DONE at `0273c82` (2026-09-09 06:08 local; branch
      `stage0/b2-cited-revision@5bc12ee`, merge base `de400f7`, eight
      commits, eight files, +836/−55; six author dispatches and four
      reviews, every one at codex Luna max on the maintainer's instruction;
      the author's own full suite on the final tip 1,773 of 1,773 in 421 s;
      Orch's diff read; record in design.md round 17; evidence in
      `evidence/reviews/stage0-packet-B2/`).** What landed: `cites:` parsed
      from front matter on `carry:`'s terms and returned as `cites`;
      `requirementHeadings(repoRoot, pendingRoot)` exported from `specs.mjs`
      as the one heading enumeration over every capability's constitution
      and unarchived deltas, `(preamble)` excluded; `cites-unresolved` at
      `mergeGate` before the verdict branch on all three verdicts, in
      `REISSUE_CODES`, the record template's `cites:` line documenting the
      rule and the feed; `assembleRevisionBrief` new, with one shared
      `acceptanceChecksSection` both assemblers call, `excerptsFor`'s
      `headings` option (exact match across every live capability,
      constitution then pending, the same cap, floors, markers and cut, a
      `missingHeadings` return and a one-line marker in the brief), the
      empty list byte-identical to the author's call through one optional
      injection seam a test observes; `run.mjs`'s one call site; the
      pinned-fixture tests in `brief.test.mjs`; the arms in
      `review.test.mjs`; the exact `REISSUE_CODES` pin updated. Paired
      numbers, as the standard requires: on the pinned fixture the author
      brief is 34,483 characters and the cited revision 24,306 (asserted:
      strictly smaller); on the live tree, `repair`, 27,146 and 23,162
      (measured and printed, never asserted). NOTES carried, not closed:
      (a) REVIEW6's one green mutant — `resolvedHeadings` emptied leaves
      the cited-revision arm green, because it never asserts a valid cited
      heading is ABSENT from the NOT FOUND marker (the arm checks the
      heading set and the size); owed by the next touch of
      `brief.test.mjs`. (b) Orch's diff-read observation: `cites:` is
      OPTIONAL and ships COMMENTED OUT in the verdict template, so the
      narrowing happens only when a reviewer fills it and an empty list
      falls back to the governing type's requirements — the packet's saving
      is adoption-contingent; MEASURE it from the first real Desk verdicts
      (how many carry `cites:`, and the revision brief's `brief_chars`
      against the author's, once task 25 records them) before crediting it,
      the mutation table's trap named in advance.

### The carry channel and the filing lint

- [ ] 13. `loop/lib/verdict.mjs` and `loop/lib/carry.mjs`: `subject` becomes
      **required** on a `carry:` entry; an entry without one is refused and
      reported naming the record. A finding whose subject already carries standing
      findings merges into that subject's item. **No numeric cap** is added.
      Implements: *A reviewer's non-blocking finding reaches work without editing
      anything*, the subject and merge bullets.
- [ ] 14. `loop/lib/review.mjs`: the reviewer's brief documents both fields and the
      required subject. Implements the same requirement's brief bullet.
- [ ] 15. `loop/tests/carry.test.mjs`: a subject-less entry is refused; a second
      finding on a carried subject produces no second item; five entries in one
      record are all accepted. **Mutation A**: make `subject` optional again and
      confirm the refusal test fails. **Mutation B**: reinstate a cap of two and
      confirm the five-entry test fails — the absence of a cap is a decision under
      test, not an omission. Tests tasks 13–14.
- [ ] 16. `scripts/lint-deferrals.mjs` (new, standalone): take **a JSON export path
      as its argument** and report every open issue that names neither a subject
      path nor a specification requirement, exiting non-zero only under a
      `--strict` flag. **It SHALL NOT spawn the tracker**: the delta reserves
      tracker invocation to exactly one module, and that module does not exist
      until task 69 in Stage 3. The operator produces the input with
      `bd list --json > <file>` and passes the file, the same shape
      `evidence/scripts/machinery-share.mjs` and `open-by-day.mjs` already use.
      Implements: *A deferral becomes its own bead only when it names a subject or
      a requirement*, the reporting bullet.
- [ ] 17. `scripts/tests/lint-deferrals.test.mjs`: a fixture export in which an
      issue naming a path is not reported and one naming neither is reported by id.
      **Mutation A**: skip unroutable issues silently and confirm the reporting
      assertion fails. **Mutation B**: have the script spawn the tracker instead of
      reading the file, and confirm a source check that no module outside
      `loop/lib/beads.mjs` spawns it goes red. Tests task 16.
- [x] 18. **Done at `bd84b4b`** — he answered question 6 on 2026-09-08 and
      narrowed the rule as proposed.
      `CLAUDE.md` and `AGENTS.md`: state the bounded filing rule — a deferral
      becomes its own issue only when it names a subject path or a specification
      requirement and cannot be fixed in the same job; otherwise a note on the
      parent issue; a machinery issue that would spawn more than one follow-up is
      stopped and reconsidered. **[orchestrator]** The rule amended is the
      maintainer's own, in his words — *"Any time something like this pops up, file
      a beads issue or it will get lost!"* — which is why it waited for him; both
      files now carry the narrowed rule with the measured cause. `bd84b4b` also
      moves `data/config.json`'s `machinery_ceiling_pct` to 30 under his answer to
      question 4.

### The runner policy and the record

- [x] 19. **Build the effort ladder in the registry.** (Done 2026-09-08: rungs at 10be428, xhigh FAIL 2 of 2 at 7790215, medium narrowed at a68ddc1.) `runners.yml`: add
      `codex-gpt-luna-high` and `codex-gpt-luna-xhigh` entries — same model, same
      lane, same cheap tier, differing only in `model_reasoning_effort`
      (`high` / `xhigh`; both accepted by `codex`, verified by running it, as
      `medium` and `max` are, while a bogus value is rejected). Run
      `node loop/conformance.mjs --runner <id>` against each and commit the record.
      **First half done at `10be428`, and the result changed the policy**:
      `codex-gpt-luna-high` passed all four (2.51 / 2.65 / 1.02 / 0.85 = 7.03 mm);
      **`codex-gpt-luna-xhigh` FAILED the fabricated-quote trap**, producing a
      quoted sentence that appears nowhere in its source, where `medium`, `high`
      and `max` all passed the same trap. The selector's gate now refuses `xhigh`
      for author and review, verified by calling it.
      **Second half, open**, and it cannot be done the way an earlier draft said.
      `runners.mjs:63-68`: `job_types` must be a **non-empty list when present**,
      and omitting it **clears every type** (`select.mjs:132-134` returns ok on
      `!Array.isArray`) — an empty list is a load-time error. So the registry as it
      stands cannot express "registered, conformance-passing, cleared for no work",
      and a rung left without `job_types` is **eligible for anything the escalation
      path reaches**. Declare, once task 22 lands: `codex-gpt-luna-medium` →
      `job_types: [repair, interpret]`; `codex-gpt-luna` (max) → unrestricted;
      `codex-gpt-luna-high` → **`enabled: false`** (registered, conformance-passing,
      named by no policy); `codex-gpt-luna-xhigh` → **`enabled: false`**, and
      refused by its own conformance record regardless. The three declarations are
      separate on purpose: the **registry** declares rungs, clearances and
      enablement; the **chain** declares the policy; the **conformance gate**
      declares fitness. Implements: *Runner selection is a
      declared policy, and escalation is part of it*, the ladder and starting-rung
      bullets. The registry is the only file that may name a model or an effort.
      **[orchestrator]**
- [x] 20. (Done 2026-09-08: CLAUDE.md at 301f537; runners.yml conformance fields at 10be428 and 7790215.) `CLAUDE.md` and `runners.yml`: correct the conformance paragraph and every
      `conformance:` field from `data/conformance.json` as read 2026-09-08 — seven
      runners recorded, six pass all four checks (`claude-code-sonnet`,
      `claude-code-opus`, `opencode-deepseek`, `opencode-muse-spark`,
      `codex-gpt-luna` 15:46:57Z 09-07, `codex-gpt-luna-medium` 22:10:07Z 09-07)
      and `opencode-openrouter-muse-spark` fails all four; and, since `10be428`,
      `codex-gpt-luna-high` passes all four while `codex-gpt-luna-xhigh`
      **fails the fabricated-quote trap**. `CLAUDE.md` says four runners and calls
      `codex-gpt-luna` a FAIL for an expired login; its own instruction is that the
      JSON is the authority and that the passage "has now been wrong twice" — this
      is the third. **Any step that reads the record programmatically SHALL assert
      the number of records it loaded before trusting a verdict**: `loadConformance`
      given the wrong context shape calls `existsSync(undefined)`, returns `{}`, and
      every runner then reads as "no record, allowed", so a broken reader is
      indistinguishable from a permissive gate. **The `CLAUDE.md` half is done at
      `301f537`;** the `runners.yml` `conformance:` fields are set to pass / FAIL at
      `10be428`. **[orchestrator]**
- [ ] 21. **The conformance record appends; the gate reads the history.**
      `loop/conformance.mjs` and `data/conformance.json`: each run is its own entry
      — date, per-check result, model-minutes — and never replaces an earlier one.
      Each entry is written **from the checks' verdicts after they complete**,
      never from an earlier signal such as the harness exiting 0: the general
      rule, named by A2AI-Orch on 2026-09-08 after packet A's round 2 found the
      build success record written before its floor ran, is that **a record
      asserting a check passed is written from that check's verdict, never from
      a signal that precedes it** — the same sentence governs task 3's build
      record and this file, and `addictedtoai-2wwu` is the same defect one
      layer down (a re-run overwriting a FAIL with a record byte-identical to
      one that never failed).
      `conformanceGate` refuses a runner for a role while any recorded FAIL of a
      check stands unsuperseded, and a FAIL is superseded only by **three
      consecutive PASSes of that same check**. A runner with no record still warns
      rather than refuses. Implements: *A swap has a stated procedure and a
      conformance check*, the append and history bullets. Serves
      **`addictedtoai-2wwu`** (P1) and lifts its two acceptance clauses:
      **(a) prove the threshold does the work, not the rewrite** — one fixture whose
      history is FAIL then PASS, asserted **refusing at N > 1** and **allowing at
      N = 1**, the second arm existing to demonstrate that N = 1 reproduces today's
      defect exactly, so the test measures the threshold rather than the fact that
      the file changed shape; **(b) preserve that an absent record WARNS rather than
      refuses**, which is deliberate, and assert that any programmatic reader
      **reports the record count it loaded** before trusting a verdict — the
      `loadConformance` trap, where a broken reader is indistinguishable from a
      permissive gate. Further tests: fail-then-three-passes is allowed and the
      failure is still readable. **Mutation**: restore overwrite semantics and
      confirm the fail-then-one-pass case is wrongly allowed — which is today's
      behaviour, and today's instance survives only because the record happened to
      be committed between the two runs.
- [ ] 22. **A registered runner that policy names for nothing needs a way to say
      so.** An absent `job_types` means **cleared for every type**
      (`select.mjs:132-134` returns ok on `!Array.isArray`; the comment at `:122`
      says so outright) and an empty list is a load-time error, so the registry
      today cannot express "registered, conformance-passing, cleared for no work" —
      and a rung left without `job_types` is eligible for anything the escalation
      path reaches. Add an explicit **`enabled: false`** field: `loop/lib/runners.mjs`
      loads it, **absent meaning enabled** — the same fail-open convention
      `job_types` uses, for the same backward-compatibility reason; the selector
      refuses a disabled entry for **both roles**, **before every other gate** (the
      registry's own comment explains why the job-type gate sits first today — the
      refusal line a person reads should name the real reason — and a disabled entry
      has the stronger claim to that position); and the escalation path never
      escalates onto one. Implements: *Runner selection is a declared policy, and
      escalation is part of it*, the enablement bullet. Test **both arms**: an entry
      with `enabled: false` named as `--runner` selects nothing and reports
      `runner:disabled`, **and** an entry omitting the field is still selectable.
      **Mutation**, both arms too: ignore the field and confirm the disabled entry
      selects; default it to disabled and confirm every pre-existing entry stops
      selecting. **[orchestrator]** for the `runners.yml` half. **Until this ships,
      `high` is unnamed by discipline rather than by mechanism**, and the artifacts
      say so — a discipline standing in for a mechanism is invisible until it
      lapses, which is the shape of the serial rule this change lifted.
      **Added 2026-09-08 from B1 round 3's sealed review** (the first review
      brief that named PROPERTIES and made the reviewer find the enforcement;
      it returned the enforcement's real scope on its first use — ruled by the
      architect, verified against the file by Luna-Boss-2): the naming rule's
      enforcement in `loop/tests/portability.test.mjs` is two scans with two
      scopes. The model/provider/harness-name scan covers `loop/` and
      `data/config.json` only, and its narrowing over `pulse/` and `scripts/`
      is DELIBERATE and recorded at `:115-123` (`pulse/lib/derive.mjs` splits
      catalog row ids of the form vendor/model; `pulse/verify-zero-model.mjs`
      enumerates provider env-var prefixes to prove none is set — the site's
      subject, not configuration — so the runner ID is the enforced form, "the
      only handle the loop offers"); `lib/` and `app/` name models as subject
      matter and are the same false positive at scale. The gap that is real and
      cheap: the runner-id scan's targets at `:127-132` are `loop/`, `pulse/`,
      `scripts/` and `data/config.json` — `lib/`, `app/` and `tools/`, the
      three roots the change-directory rule already covers, are in neither
      scan, and a runner id has no legitimate reason to appear under any of
      them. And BOTH scans assert `deepEqual(scan(targets, …), [])` with
      nothing asserting that `targets` is non-empty: they pass on absence and
      would pass identically if `filesUnder` returned nothing (a renamed
      directory, a changed extension list, a path that stops resolving); the
      same file uses the count idiom at `:247` (`assert.ok(sources.length >
      5)`), so this is an omission, not a convention. Therefore, in this
      packet, three parts: **extend the runner-id targets to `lib/`, `app/`
      and `tools/`; plant a fixture id under EACH of the three roots and
      require the arm to go red for each, named as mutations; and assert a
      floor on the number of files actually scanned in BOTH tests**, so a scan
      that reads nothing fails instead of passing — widening a scan that
      cannot tell "found nothing" from "read nothing" widens what it claims
      without widening what it can catch. Recorded, not tasked here: the live
      spec's "nothing else in the system names a model, provider, or harness"
      (`openspec/specs/loop/spec.md:424`) and CLAUDE.md's "runners.yml is the
      only file in loop/, pulse/, scripts/ and data/config.json that may name a
      model" are both wider than the enforced form, for the reason the test
      records; CLAUDE.md's sentence is the orchestrator's to correct after
      Stage 0. **Second enforcement gap of the same class, from B1 round 4's
      sealed review (finding 6, verified by Luna-Boss-2):**
      `scripts/no-change-dir-refs.test.mjs:33-47` allow-lists per FILE with a
      blanket `match: CHANGE_DIR`, so any change-directory reference anywhere
      in `loop/lib/specs.mjs`, `scripts/check-spec-deltas.mjs` or its test
      passes — including the NAMED, pre-archive path
      `openspec/changes/build-initial-site/specs/<cap>/spec.md` in
      `specs.mjs`'s comment at `:23`. Each stated reason justifies GENERIC
      path construction over every in-flight change, not a named one. In the
      same packet: narrow each allow-list entry to the generic form its reason
      describes (a template or `join` over a variable change name), so a
      literal `openspec/changes/<name>/` in an allowed file fails; reword the
      `:23` comment to the archive form, which is what a document that must
      name the change writes; and plant a named path in an allow-listed
      fixture file and require the test red, named as a mutation. Same rule
      as the floor above: an allow-list wider than its reason is an
      expectation file whose unlisted case is permitted but unguarded.
      **Both enforcement items DONE at `e8a2da7` (2026-09-09 00:01 local):
      the medium-vs-max experiment's max branch `exp/max-d75275c@8abe800`
      (base `96e15fa`, brief authority `d75275c`), chosen by two sealed,
      mirrored blind reviewers from opposite positions, read by Orch, its full
      suite on `8abe800` 1,735 of 1,735 in 438 s; record in design.md round
      16; evidence in `evidence/experiments/medium-vs-max-2026-09-08.md` and
      `evidence/reviews/experiment-medium-vs-max/`.** What landed: runner-id
      targets `lib/`, `app/` and `tools/`; a fixture id under each root
      asserted independently with its mutation named in a comment;
      `MIN_SCANNED_FILES = 2` asserted in both scans; every allow-list entry
      narrowed to the literal template form its reason describes;
      `specs.mjs:23` in the archive form; a planted named path on a separate
      line goes red. The `enabled: false` half of this task stays open for
      packet F. **CARRIED TO PACKET F on this task — the measured gaps in what
      landed, from the judges and the diff read, none a reason to withhold the
      merge:** (a) `app/` is LISTED AND CONTRIBUTES ZERO FILES: the runner-id
      scan's extensions are `.mjs .md .json .yml` and `app/` holds 32 files,
      all `.tsx`/`.ts` (Orch, live tree; `tools/` contributes 11, `lib/` 227),
      so the per-root fixture proves the target list names `app/`, not that
      any `app/` file is ever scanned — F adds `.tsx`/`.ts` to the RUNNER-ID
      scan's extensions (the `:115-123` false-positive argument is about the
      model-name scan, not this one) and asserts per root that each listed
      root contributes at least one file, the mechanical form that would have
      failed `app/` today and turns the collapse-detecting floor into a
      coverage one; (b) `scripts/no-change-dir-refs.test.mjs:70` decides per
      LINE, so a named path on the same line as an allowed generic template
      passes in the merged tree (both judges, 3 of 3 green) — F makes the
      allowance apply to the matched span rather than the line, with a
      same-line planted path as the named mutation; (c) the floor VALUE
      (`portability.test.mjs:133`, `:162`: `>= MIN_SCANNED_FILES` mutated to
      `>= 0` stays green) and the recursive `skipTests` propagation (`:39`)
      have no arm (judge 2) — F adds one each or records why an arm cannot
      reach it. Packet F's brief drops the two enforcement paragraphs above
      as written and carries (a)–(c) in their place. **Added 2026-09-09
      00:36 (the maintainer's "max for everything", Orch's
      `addictedtoai-v8q8`, agreed by both):** when `enabled: false` ships,
      it goes on `codex-gpt-luna-medium` as well as `-high` and `-xhigh` —
      the entry stays defined (its conformance record survives; "for now"
      is reversible) and unselected by mechanism rather than by discipline.
- [ ] 23. `loop/lib/select.mjs` and `loop/lib/runners.mjs`: escalation moves into the
      repository and fires when the **top-ranked** candidate is refused *solely* on
      `runner:job-type`; no other refusal escalates. Implements the same
      requirement's escalation bullets.
      **Resolved before D's freeze (the architect's quantifier enumeration,
      2026-09-09 06:59, from the code at `9c1d980`):** (i) "the top-ranked
      candidate" is `candidates[0]` of `gatherCandidates`' sorted list
      (`select.mjs:88-103`: directives, then pre-empting proposals, then queue
      items in the Pulse's ranked order, then ripe proposals) BEFORE any gate —
      not the first eligible candidate and not the one the upkeep floor kept.
      (ii) "refused solely on `runner:job-type`": the gate list (`:199-207`)
      breaks at the first refusal and the clearance gate is first (`:200`), so
      a candidate refused on clearance has no other rule recorded and the rule
      name alone decides; every other refusal — `degradation:`, `budget:`
      (ceiling or `budget:upkeep-floor`, which `applyUpkeepFloor` at
      `budget.mjs:553-577` applies after the gates), `capacity:`,
      `conformance:`, the health gate's, the tutorial gates' — escalates
      nothing. (iii) "Escalation moves into the repository": `selectJob`
      exposes the top-ranked candidate's refusal as `topRanked: { candidate,
      rule }` on its result (`null` when the top-ranked candidate was
      eligible), and a new pure function in `select.mjs`,
      `escalationTarget(registry, runner, sel)`, returns the registry entry
      named by the run's entry's `escalates_to` exactly when `sel.topRanked`'s
      rule is `runner:job-type` and the field is declared, else `null`.
      `topRanked` is also `null` on the conformance, health and lane-paused
      early returns (`select.mjs:154-195`), which gather no candidates
      (added 2026-09-09 08:45 from the brief review's finding 3).
      `run.mjs`'s one call site (`:1223`) re-runs `selectJob` with that entry
      as `runner`. The re-run gathers the same list (gathering is deterministic
      within a run; the duplicate sweep already ran on the first pass), so the
      escalated selection is ADOPTED exactly when its `topRanked` is `null` and
      its `selected` is non-null — the top-ranked candidate passed every gate
      of the escalation entry (its tier's shares and floor, its conformance and
      health records) and is the job. The run then proceeds with `runner` = the
      escalation entry for every phase that reads `runner` (`:264` the author
      phase entry, `:287`, `:305`, `:757` the revision, `:1439-1441` the
      outcome line): the ledger records what actually ran. Otherwise the
      ORIGINAL selection's outcome stands — a lower-ranked cleared candidate on
      the original entry, or nothing — and the log names both the top-ranked
      refusal and the escalation entry's own refusal of it. That is what "SHALL
      NOT escalate past a refusal of any other kind" means in code: the run
      escalates at most one step and never lets the escalation entry take work
      below the top-ranked candidate, so a routing rule buys no budget and no
      rung. (iv) The registry half: `loadRunners` (`runners.mjs:16`) accepts an
      optional `escalates_to` string per entry — when present it must name a
      registered id other than the entry itself whose `roles` include `author`
      (load-time errors otherwise, the `job_types` pattern at `:63-76`); absent
      means the entry escalates nothing; the escalation entry's own
      `escalates_to`, if any, is not followed in the same run. The
      `runners.yml` line — `escalates_to: codex-gpt-luna` on
      `codex-gpt-luna-medium` — is **[orchestrator]** (a reserved file) and
      lands with D's handover, together with retiring the grep-based
      escalation in the caller's script the requirement names
      (`desk-chain3.sh:94-132` in the orchestrator's scratchpad, whose own
      comment records that it never fired across 18 jobs on 2026-09-08) and
      rewriting `runners.yml:219-235`, the max entry's note that "routing is
      therefore the caller's job", which D makes false (added 2026-09-09
      09:22 from the brief review's finding 3). (v)
      Escalation applies whether the run's entry came from `--runner` or the
      default (`pickRunner`, `run.mjs:910`) — the chain passes `--runner`
      explicitly and that is the case this exists for; the resume path
      (`:1160-1221`) selects nothing and escalates nothing; `--dry-run`
      reports the decision on the log and in the returned `runner` (`:1303`)
      without invoking anything. (vi) Task 22's `enabled: false` (packet F) has
      not shipped: under D an escalation entry whose selection returns
      `blocked` (conformance or health) is a refusal of another kind and stands;
      F adds "disabled" to that list. (vii) Not added, and said so: no ledger
      key records that a job was escalated — the phases' `runner` and `effort`
      (task 25) already make the per-rung revise rate computable, and a key no
      task names is scope. (viii) Files: `loop/lib/select.mjs`,
      `loop/lib/runners.mjs`, `loop/run.mjs` (the one call site and the
      dry-run log), and task 24's new test; the closure check —
      `loop/tests/selector-rules.test.mjs:415-448` loads the REAL registry
      through `loadRunners`, so the shipped file must still load, and no test
      pins the exact key set of `selectJob`'s result (grepped at `9c1d980`).
      (ix) The `run.mjs` line numbers above are `9c1d980`'s; packet E
      (`c3aa5c7`) moved that file and nothing else this task reads — at
      `f74f606` read `:264`, `:287`, `:305`, `:757`, `:910`, `:911`,
      `:1160-1221`, `:1223`, `:1303`, `:1439-1441` as `:274`, `:303`, `:321`,
      `:779`, `:943`, `:944`, `:1193-1254`, `:1256`, `:1336`, `:1472-1474`;
      `select.mjs`, `runners.mjs:16-76` and `budget.mjs` did not move
      (measured by `git diff 9c1d980..f74f606`, 2026-09-09 10:29). The
      registry now also carries `effort:` on the four codex entries
      (`f74f606`), which `loadRunners` validates at `runners.mjs:77-81`.
- [ ] 24. `loop/tests/runner-policy.test.mjs`: a top-ranked clearance-only refusal
      escalates and authors the top-ranked candidate; a budget-ceiling refusal does
      not escalate; **and the control that matters** — an overdue scout top-ranked
      and refused on clearance with one cleared `repair` below it authors the
      scout, not the repair. **Mutation**: escalate only when every candidate is
      refused, and confirm the scout case fails while the other two still pass.
      Tests task 23.
      **Resolved before D's freeze (2026-09-09 06:59):** (i)
      `loop/tests/runner-policy.test.mjs` is NEW — no file of that name;
      `selector-rules.test.mjs` owns the clearance gate and stays. (ii) The
      fixture is `makeRepo` with the test's OWN `runners.yml` (the
      `selector-rules.test.mjs:374-387` pattern; `helpers.mjs:69-98`'s default
      registry declares no clearance): a cheap entry with `job_types` and
      `escalates_to` naming an unrestricted frontier entry, generic ids only,
      plus a reviewer-cleared entry — `runLoop` resolves a reviewer before it
      selects (`run.mjs:911`) and throws without one (added 2026-09-09 08:45
      from the brief review's finding 1).
      "Overdue" is the Pulse's ranking, which the fixture expresses as queue
      ORDER (`writeQueue`): the scout first is the top-ranked candidate.
      (iii) Arms: (a) the queue holds ONE scout and nothing else, the run's
      entry is the cheap one: `topRanked.rule` is `runner:job-type`, the
      escalation fires, the adopted selection's job is the scout and the
      returned runner is the frontier entry; (b) a budget-ceiling refusal
      presupposes the candidate PASSED clearance, so (b)'s run entry is cleared
      for the top-ranked type and the fixture ledger spends `new_writing`
      past its ceiling on BOTH tiers — the run entry's and the escalation
      entry's, since pools are per tier (`tierShares` at `select.mjs:150`)
      and an unspent escalation tier would let the named mutation's re-run
      adopt the candidate and turn (b) red (added 2026-09-09 09:22 from the
      brief review's finding 1) — (the `budget.test.mjs:477-498` pattern):
      the top-ranked is refused on `budget:new_writing-ceiling`, nothing is
      escalated, the runner is unchanged and nothing is selected; (c) THE
      CONTROL: the scout first and a `repair` second, the cheap entry cleared
      for `repair` only — the selected job is the scout on the frontier entry,
      not the repair on the cheap one; (d) the other-kind refusal AT the
      escalation entry: as (c) but the frontier tier's `new_writing` spent past
      its ceiling — the escalation is not adopted, the repair runs on the cheap
      entry, and the log names both refusals. (iv) Each arm observes the pure
      helper's return, and at least (c) also runs `runLoop(ctx, { runner:
      '<cheap id>', dryRun: true })` and asserts the returned `job.type` and
      `runner.id` (`run.mjs:1303`), so a call-site mutation is caught and not
      only a library one; (a), (b) and (d) may also run the dry-run call
      where their outcome is only observable there (the log naming both
      refusals, the returned runner), and only (c)'s assertion set is what
      the call-site mutation must turn red (added 2026-09-09 08:45 from the
      brief review's finding 2). (v) The registry arms, in the same file: an
      `escalates_to` naming an unknown id, the entry itself, or an entry not
      cleared for `author` fails `loadRunners` at load; absent loads as
      `undefined`. (vi) The named mutation: key the escalation, AT THE
      `run.mjs` CALL SITE (not inside `escalationTarget`, whose rule stays
      `runner:job-type`; added 2026-09-09 09:22 from the brief review's
      finding 2), on `sel.selected === null` (escalate only when every
      candidate is refused)
      — (c) fails because the repair is selected on the cheap entry and nothing
      escalates, while (a) and (b) still pass ((a) has nothing below the
      scout, which is why it is a separate arm); restore. The diff-as-the-list
      rule adds at least one mutation per changed function beyond it: (d)'s
      adoption condition dropped (adopt any non-null escalated selection) must
      go red under (d).

### The ledger fields, and the baseline

- [x] 25. `loop/lib/ledger.mjs`: every phase entry records the runner and the effort
      it ran at; every line records `brief_chars`, a `gate_seconds` map, the
      count of findings each review carried, and **`authority_sha`** — the commit
      the brief was assembled against (main at brief time; for work on this
      change, the commit of its artifacts) — so that "was this work judged
      against the standard it was built against" is answerable from the ledger
      rather than from a coordinator's write-up (added 2026-09-08 after tasks
      1–4 moved four times in fifteen minutes under one brief, two versions
      specifying opposite floor designs; proposed by A2AI-Luna-Boss-2, mechanism
      from the `specgraph-origin` session; buys auditability, not prevention —
      re-reading the committed blob at dispatch stays the habit). Until Stage 3
      retires the fleet, a fleet round carries the same fact as a line in
      RESULT.md and the handover, `authority: <change>@<sha>`. All additive;
      `LEDGER_FIELDS` not extended. Implements: *The ledger line carries the join, as a list,
      additively*, the measurement bullet, and *Runner selection is a declared
      policy*, bullet 4, and *A reviewer's non-blocking finding…*, the ledger
      bullet.
      **Resolved before E's freeze (the architect's quantifier enumeration,
      2026-09-09 02:50, from the code at `de400f7`):** (i) "the runner" per
      phase is already `who.id` (`run.mjs:261-273`); "the effort it ran at"
      is a property of the REGISTRY ENTRY, because a rung IS an entry ("the
      registry MAY carry one entry per rung"): `loadRunners`
      (`runners.mjs:16`) accepts an optional `effort` string per entry
      (non-empty when present, else a load-time error, the `job_types`
      pattern; absent means the entry declares no rung), and every phase
      entry records `effort: who.effort ?? null` — `null` rather than
      omitted, so a reader can tell "no rung declared" from "written before
      the key existed". The `runners.yml` half — `effort: max` on
      `codex-gpt-luna`, `medium`, `high` and `xhigh` on its three siblings,
      nothing on the Claude and opencode entries until their harnesses expose
      a rung — is **[orchestrator]** (a reserved file) and lands with E's
      handover; the code half merges independently and records `null` until
      it does. (ii) `brief_chars` is `briefText.length` of the text the
      AUTHOR phase actually received (the assembled brief for a new job, the
      resumed brief for a resumed one), on the job's outcome line
      (`run.mjs:1431`); the two abandon-sweep lines (`:979`, `:1050`) carry
      none of the new keys, because no process ran. (iii) `gate_seconds` is a
      map `{ <gate name>: <seconds, one decimal> }` for every gate the job's
      OWN run executed (`runGates` results' `durationMs / 1000`), a retried
      gate recording its LAST run; absent when no gate ran. (iv) "the count of
      findings each review carried" is, per REVIEW phase entry, `carried:
      <n>` = the length of that pass's parsed `carry:` list (`parseCarry`,
      the non-blocking findings of the review delta's ledger bullet): `0`
      when the record parsed and carried none, absent when there was no
      record. (v) `authority_sha` is the full 40-character sha the author
      brief was assembled against — for a Desk job `mergeBaseSha` at brief
      time (`run.mjs:1369`); a fleet round's is its RESULT line, a practice
      not code. (vi) Additive: `LEDGER_FIELDS` unchanged (task 26's mutation
      proves it), a pre-existing eight-key line validates unchanged. (vii)
      Files: `loop/lib/ledger.mjs` (`makeLedgerLine` accepts and emits the new
      optional keys), `loop/lib/runners.mjs` (the optional `effort`),
      `loop/run.mjs` (the phase entry gains `effort`, a review phase gains
      `carried`, the outcome line passes `brief_chars`, `gate_seconds`,
      `authority_sha`), and task 26's new test.
      **DONE at merge `c3aa5c7` (branch `stage0/e-ledger-teardown` at
      `ce59b3a`, two rounds at max, tasks 25, 26, 27 and 3b together;
      authority `9c1d980`).** As enumerated: `loadRunners` accepts the optional
      `effort` (a non-empty string or a load-time error); every phase entry
      records `effort: who.effort ?? null`, a review phase `carried: <n>` from
      the parsed `carry:` list (absent when there was no record); the outcome
      line carries `brief_chars` (the text the author received),
      `gate_seconds` (the last run per gate, one decimal, absent when no gate
      ran) and the 40-character `authority_sha` (`mergeBaseSha` at brief time
      — what `addictedtoai-tbho` asks for; Orch closes it after the push).
      `LEDGER_FIELDS` unchanged; the reviewer round-tripped the 244
      pre-existing ledger lines. The registry half (`effort:` on the four
      codex entries) is Orch's edit at E's handover, before the gates. The
      line numbers in the paragraph above are `de400f7`'s and have drifted
      (`:1431` is `:1484` at the merge; `:979`/`:1050` are `:1017`/`:1088`).
      The registry half landed as `f74f606` (Orch, 2026-09-09 10:19: `effort:
      max` / `medium` / `high` / `xhigh` on the four codex entries, each
      checked against the `model_reasoning_effort` in its own command).
      CARRIED, found by Orch at that edit and an error of enumeration (i):
      it said the Claude and opencode entries declare no rung "until their
      harnesses expose a rung", but the opencode harness already does — the
      three opencode commands dispatch at `--variant max`
      (`opencode-deepseek`) and `--variant high` (`opencode-muse-spark`,
      `opencode-openrouter-muse-spark`) — so their phase entries record
      `effort: null` while running at a rung, and the ledger evidence is
      incomplete for exactly the comparison the field exists for. The three
      `effort:` lines ride with packet D's registry edit, where the file is
      open anyway. The Claude entries genuinely declare none (`--model`
      only, no rung flag).
- [x] 26. `loop/tests/ledger.test.mjs`: a line carries runner and effort per phase,
      `brief_chars`, `gate_seconds`, a carried-entry count and `authority_sha`; a
      pre-existing line without any of them still validates. **Mutation**: extend `LEDGER_FIELDS` to
      require `gate_seconds` and confirm the old-line test fails — the additive
      property is the thing under test. Tests task 25.
      **Resolved before E's freeze (2026-09-09 02:50):** (i)
      `loop/tests/ledger.test.mjs` is NEW — no file of that name exists;
      `ledger-order`, `ledger-before-publish` and `job-budget` test other
      properties and stay where they are. (ii) Arms, on a throwaway repository
      via `makeRepo`: a line built by `makeLedgerLine` with phases carrying
      `effort` (one `null`, one string) and a review phase carrying
      `carried`, plus `brief_chars`, `gate_seconds` and `authority_sha`,
      round-trips through `appendLedger` and `readLedger` with every key
      present and equal; a pre-existing line of the eight required keys only
      passes `appendLedger`'s validation unchanged. (iii) "Per phase" quantifies
      over EVERY entry of `phases` (author, review1, revision, review2):
      each carries `runner` and `effort`; `carried` appears on review entries
      only. (iv) The named mutation: extend `LEDGER_FIELDS` with
      `gate_seconds` and confirm the old-line arm fails; restore.
      **DONE at merge `c3aa5c7` (`loop/tests/ledger.test.mjs`, new, seven
      tests).** Round 1's arms checked `authority_sha` by length and
      `brief_chars` by positivity and exercised only a zero-carry review, so
      REVIEW1's three mutations — an unrelated 40-character sha at
      `run.mjs:1486`, `brief_chars: 1` at `:1484`, `carried: 0` for every
      parsed verdict at `:678` — stayed green. Round 2 built each arm against
      an independent source: the fixture's HEAD read before `runLoop`; the
      committed brief read back with `git log -1 --full-history
      --diff-filter=A <mergedSha>^2` (the brief's first recipe, without
      `--full-history`, followed the TREESAME first parent and returned an
      OLDER brief on the real repository — measured by the second-model brief
      review before dispatch); a `review-approve-carry` mock mode through the
      real parser; plus a no-verdict arm (`carried` absent). All three red,
      and both closure pins (`breakers.test.mjs`, `gate-transport-retry.test.mjs`)
      red when reverted (REVIEW2). The named mutation (`gate_seconds` into
      `LEDGER_FIELDS`) fails the old-line arm: 2 of 4 red at round 1.
      CARRIED, non-blocking (REVIEW2's green mutants of residual coverage, not
      production defects): the fixture gives both production runners an
      `effort`, so `?? null` at `run.mjs:275` is not exercised for an un-rung
      runner; only carry lengths 0 and 2 are exercised, so a cap at 2 stays
      green.
- [x] 27. `loop/lib/git.mjs:116`: `worktree remove --force` becomes a removal that
      **refuses** rather than forcing when it cannot complete. Implements: *The
      chain from intake to train lives in the repository*, the teardown bullet —
      a requirement that had a scenario and no task, and whose absence deleted 177
      packages from the real `node_modules`. Test with a **mutation** restoring
      `--force`, which must make the refusal assertion fail.
      **Resolved before E's freeze (2026-09-09 02:50, from `de400f7`):** (i)
      `removeWorktree` (`git.mjs:115-118`) runs `git worktree remove <dir>`
      WITHOUT `--force`; on a non-zero exit it returns `{ ok: false, reason }`
      (git's stderr, which names why) and does not fall back to `--force` or
      to any delete; on success `{ ok: true }`. (ii) "The removal" is the
      whole of `removeJobWorktree` (`run.mjs:827-894`), not the git call
      alone: today it runs `remove`, then `rmSync(worktree, { recursive,
      force })`, then `prune`, each guarded separately, so a git REFUSAL would
      be followed by a recursive delete of the very directory git refused to
      delete. Under this task the `rmSync` step runs ONLY after git's removal
      returned `ok` (it exists for the Windows EPERM case where git has already
      taken the files and left the directory — `addictedtoai-osru`); on a
      refusal the directory is left standing, the reason logged, and the run
      continues to its ledger line and records commit exactly as the junction
      refusal at `:852-874` already does; `prune` still runs in every case (the
      test at `worktree-cleanup.test.mjs:252` pins that). (iii) The other
      callers get the same behaviour: `review.mjs:1194` (the reviewer's
      detached worktree, `reset --hard` and `clean -fdx` before removal, so a
      refusal there is news and is logged) and `conformance.mjs:321,370`. (iv)
      RECORDED, out of scope: `worktree prune` (`git.mjs:101`, `:117`,
      `run.mjs:830`) deregisters ANY registration whose directory is absent,
      including one temporarily moved — on 2026-09-08 about twenty registered
      worktrees were moved by accident and repaired by hand; the Desk's
      worktrees are the only ones it creates, but prune is repository-wide.
      (v) Arms, in `loop/tests/worktree-cleanup.test.mjs` (the file that owns
      removal; no new file): a worktree git refuses to remove without force
      (one modified tracked file) is left standing with its file intact and the
      refusal reported, and `rmSync` was not called (observe it through the
      existing `deps.rm` seam); positive control: a clean worktree is removed.
      Named mutation: restore `--force` and confirm the refusal arm fails.
      **DONE at merge `c3aa5c7`.** `removeWorktree` runs `git worktree remove
      <dir>` without `--force` and returns `{ ok, reason }`;
      `removeJobWorktree` runs `rmSync` only after `ok`, leaves a refused
      directory standing with the reason logged, still prunes, and the run
      reaches its ledger line; `review.mjs` and both `conformance.mjs` callers
      inspect the return. Named mutation (restore `--force`): 10 of 11 red at
      round 1 and again under REVIEW1; `rmSync` unconditional after a refusal:
      9 of 11. CARRIED, non-blocking (Orch's diff read): the JSDoc promises
      `{ removed, failures, refused? }` and the junction stop sets `refused:
      true`, but the new git-refusal path returns only `{ removed: false,
      failures }` — a caller testing `.refused` would read a git refusal as an
      ordinary partial failure; no production caller reads the return today.
      The operational consequence, taken knowingly by Orch: refused worktrees
      accumulate under `D:/addictedtoai-worktrees` and are cleared by hand;
      `prune` cannot deregister a directory that is still present.
- [x] 28. **Measure `bd` before anything mocks it.** Against a throwaway store:
      whether `--claim` keys the actor; whether a second claim under a different
      actor fails; whether `close` on an already-closed issue no-ops; whether
      `close_reason` survives a reopen; whether non-empty `metadata` round-trips
      through `ready --json`; and **whether several ids fit one argv on Windows**.
      **Done — `evidence/bd-measurements.md`.** Every answer, plus a safety finding
      nobody went looking for: `bd init --db <path>` from a cwd inside this
      repository auto-detected the real remote and cloned the project's history
      into a second store under the user profile (the stray store was deleted,
      nothing under `.beads/` was touched). Task 67 is built on it.
- [x] 29. `evidence/README.md`: an invocation line beside every script row, read
      from each script's own header, marking any that needs a session-scoped path
      as such. **Done.** The `orch-backlog-classify.mjs` gap it was also to record
      is closed instead: the script arrived in round 2.
- [x] 30. **The baseline — taken, on the definition the stage gates use.** Done:
      `evidence/stage0-baseline.md`, from
      `evidence/scripts/stage0-baseline.mjs` (n = 206 of 208 `done` jobs, each
      anchored on its ledger line's `ts` and the parent of its records commit).
      **On the new definition — brief-commit → merge —** the wall-clock median is
      **22.81 min** all-time and **23.35 min** since 09-01, and the overhead
      (wall minus model-minutes) median is **3.85 / 3.90 min**. On the **old**
      definition — brief-commit → records-commit — the overhead median is
      **5.497 / 5.52 min**, which reproduces `desk-mech-report.md`'s 5.5 almost
      exactly and is what validates the method rather than a separate claim.
      Both definitions are recorded in `data/launch.json` under `desk_baseline`,
      at `301f537`, with the date and the method, so that a later reader cannot
      compare one against the other by accident. **[orchestrator]**
- [ ] 31. **Stage-0 interim measurement, and what it may and may not claim.**
      After 20 merged jobs, record `brief_chars` and the saved launch build against
      task 30's baseline.
      **The `brief_chars` baseline is the recent window — jobs since 2026-09-06,
      roughly 70,000–104,000 characters — and NOT the all-time median of 37,183.**
      The all-time median is already below the 45,000 figure the later gate uses,
      so measuring against it would make that gate vacuous on day one; the series
      it comes from (16,181 → 33,491 → 70,349 → 103,881) is the reason the recent
      window is the honest comparator. The gate compares **post-change jobs only**.
      **The overhead threshold is not Stage 0's to meet.** At 3.85 min on the new
      definition, and with the diet touching prompt size rather than wall-clock,
      Stage 0 has no mechanism that moves it; the 1.5-minute target belongs to
      Stage 1's gate, where the train is what would move it. Stage 0's own claim is
      `brief_chars` and one build. **The build claim is measured as AVAILABILITY,
      not only firing:** for each real flow (a job's fresh worktree; the
      orchestrator's serial six) record whether verify-launch reused or spawned
      and, when it spawned, the newest input that defeated it. Known on
      2026-09-08 before task 3b: the reuse fires (0.365 s against 46–52 s) and
      the dominant defeater is not a source edit but `.beads/` writing itself.

## Stage 1 — the train alone, at one worker

- [ ] 32. `loop/lib/gates.mjs`: `DEFAULT_GATES` becomes `['build',
      'verify-surfaces']` and a frozen `TRAIN_GATES` carries the full six in order.
      `loop/run.mjs` drops the post-merge build call site (`:1661`). Implements:
      *A job's gates are a tripwire…*, bullets 1 and 3.
- [ ] 33. `loop/run.mjs` and `loop/lib/train.mjs` (new): **the tripwire builds the
      merged tip**, under the merge lock, not the branch; a red merged tip reverts
      the merge at once with no search. This is what keeps "green apart, red
      together" caught per merge after the post-merge build is deleted. Implements
      the same requirement's merged-tip bullet.
- [ ] 34. `loop/tests/tripwire.test.mjs`: two work orders each green alone and red
      combined — the second merge's tripwire is red and that merge is reverted
      immediately. **Mutation**: build the branch instead of the merged tip and
      confirm the combined case passes when it must not. Tests task 33.
- [ ] 35. `loop/lib/train.mjs`: the integration branch, the merge lock,
      **subject-disjoint merges**, the `K`/`T`/idle triggers, the `B_train` and
      `S_train` bounds with the prefix-that-fits rule, and workers branching from
      `train`. Implements: *Merges land on an integration branch and main advances
      only by a green train*.
- [ ] 36. `loop/lib/train.mjs`: the ordered run — full gate set; **one rederive**;
      **then the train review over the whole diff including the rederived data**;
      then the records commit **path-restricted to the review records, the ledger, the
      carried findings and the proposals, with a machine check that fails the train
      on any other path**; then a re-run of `npm run build`, `verify-launch`
      (reusing that build) and `verify-surfaces` on the **post-records tip**, which
      is the SHA the train declares as verified (~35s); then the publish. Also
      assert, after the rederive, that **no counted path changed** since the
      reviewed-bytes bound was measured. Implements the same requirement's
      ordering, records-restriction and published-SHA bullets and *The train review is sealed…*'s diff bullet.
- [ ] 37. `loop/tests/train.test.mjs`: five merges trigger one train running the
      full set once, one rederive, one records commit, one push; two merges plus
      elapsed `T` trigger a train on two; seven merges past `B_train` run on the
      prefix that fits; a job whose subjects overlap a merge on the train waits.
      **Mutation A**: rederive per merge and confirm the single-recomputation
      assertion fails. **Mutation B**: assemble the train review before the rederive
      and confirm the assertion that the reviewed diff contains the regenerated
      files fails. **Mutation C**: let the records commit touch a content path and
      confirm the train fails. **Mutation D**: declare the pre-records tip as the
      verified SHA and confirm the remote-read assertion finds the records missing.
      Tests tasks 35–36.
- [ ] 38. `loop/lib/train.mjs`: the red path — classification re-run on the pre-train
      commit first; `pre-existing` **holds** the train (reported every run, one
      upkeep item, no `HOLD.md`, merge lock admits nothing further);
      **leave-one-out over the whole train** otherwise; revert `-m 1`, mark
      `evicted-at-train`, reopen beads, re-run gates **and review**; still red →
      whole-train rejection; no single removal clears it → whole-train rejection.
      The train records the local date it began under and refuses a search that
      would cross a change in it. Implements: *A red train is classified before
      anything is reverted*.
- [ ] 39. `loop/tests/train-red.test.mjs`: four fixtures — pre-train red; a defect
      latent in an **early** merge surfacing at the last; no single removal
      clearing it; and a date change mid-search. Assert the classification, the
      reverts, the re-review after eviction and the ledger marks in each.
      **Mutation A**: replace the classification re-run with "assume a merge did
      it" and confirm only the pre-existing case fails. **Mutation B**: replace
      leave-one-out with a **prefix search** on the fixture whose defect is latent
      in an early merge, and confirm it isolates the wrong merge — a prefix search
      returns the newest, which is the answer "revert the newest" gives and the
      reason leave-one-out exists. Tests task 38.
- [ ] 40. `loop/lib/train.mjs`: an evicted merge replayed alone on a fresh train that
      passes is recorded on the ledger as an eviction made wrongly. Implements the
      same requirement's auditability bullet. Test with a **mutation** that never
      records the replay result, which must make the audit assertion fail.
- [ ] 41. `loop/lib/review.mjs`: `assembleTrainReviewBrief` — the whole train diff, the committed train manifest
      (`.train/manifest.json`: merge shas, job ids, subjects),
      the checklists of every kind it touches, the reviewer rung declared in the
      registry, and **no
      per-job verdict record**. The seal is a **redacted checkout**: the reviewer
      runs in a worktree from which the per-job verdict records of the train's
      merges have been REMOVED, which costs nothing because that tree is discarded
      unconditionally anyway, and the comparison below is a SEPARATE invocation
      with its own tree. Ordered access is not enough — the sealed reviewer of an
      earlier round of this change read the revision records by accident while
      checking a line count and reported it. Implements: *The train review is sealed
      from the per-job verdicts and reports what they missed*.
- [ ] 42. `loop/lib/review.mjs`: the train review produces a verdict record on the
      ordinary protocol — a verdict from the closed list, `would-cite` per prose
      piece, the same refusals — and an **absent, empty or malformed record fails
      closed**: no fast-forward, no publish. Implements the same requirement's
      protocol bullet.
- [ ] 43. `loop/lib/train.mjs`: a non-approving train review evicts the merges its
      findings name (`evicted-at-train`, reason review) and re-runs gates and
      review; a finding naming no merge rejects the whole train; two consecutive
      non-approvals over unchanged merges reject the whole train. Implements the
      same requirement's red-path bullets and *A red train…*'s fourth row.
- [ ] 44. `loop/tests/train-review.test.mjs`: the assembled brief contains none of
      the per-job records' text; a missing record fails closed; the
      not-in-any-record count lands on the train's line; a finding naming one merge
      evicts it and triggers a re-review. **Mutation A**: interpolate the per-job
      verdicts into the brief and confirm the seal assertion fails. **Mutation B**:
      treat an absent train-review record as an approval and confirm the
      fail-closed test goes green when it must not. Tests tasks 41–43.
- [ ] 45. `pulse/lib/publish.mjs`: the caller declares **the SHA its gates ran
      over**; the step pushes `<sha>:main` and refuses only when that SHA is not a
      descendant of the remote tip, naming both; it reads `data/config.json`'s
      publish flag **itself**; it does not push while `HOLD.md` stands; a scope
      refusal writes no `HOLD.md` and the run states it published nothing and why.
      Implements: *The Pulse publishes what it builds*, the push bullets.
- [ ] 46. `pulse/run.mjs` **and** `loop/lib/train.mjs`: both callers construct and
      pass their verified SHA. Changing only the shared step leaves no caller that
      constructs the scope, which is the whole of `addictedtoai-zuoo` left open
      under a requirement claiming to close it. Implements the same bullets, caller
      side.
- [ ] 47. `pulse/run.mjs`: the run's own data and content commit lands on `train`,
      not `main`. Implements the same requirement's integration-branch bullet.
- [ ] 48. `pulse/tests/publish-scope.test.mjs`: a throwaway repository with a **bare
      origin** in the OS temp directory. A declared SHA plus a later local commit
      pushes only the declared tree — read back with `git show --name-only`
      **off the remote**, never from the local tree; a non-descendant SHA is
      refused naming both; a caller asserting the flag while `data/config.json`
      reads false pushes nothing; a standing `HOLD.md` suppresses the push. Never a
      test whose red path is a live push. **Mutation A**: push the branch instead of
      the SHA and confirm the later-commit case fails. **Mutation B**: trust the
      caller's flag assertion and confirm the flag case fails. Tests tasks 45–47.
- [ ] 49. `loop/lib/breakers.mjs`: breaker 2 reads the **train's** build; a build
      classified `pre-existing` does not trip it; `evicted-at-train` never counts
      toward breaker 1; a tracker-unreachable refusal is not a halt. Implements:
      *Breakers halt the loop, and only the named ones*. Test with a **mutation**
      counting `pre-existing` as a breaker-2 trip, which must write a false
      `HOLD.md` on a three-night fixture.
- [ ] 50. `loop/run.mjs` and `loop/lib/train.mjs`: every merged job's ledger line is
      appended before the train's single rederive. Implements: *A job's ledger line
      is written before anything recomputes the queue from it*, the batching
      bullet. Test: five merges, one rederive, none re-advertised. **Mutation**:
      rederive before the fifth line is appended and confirm exactly the fifth item
      is re-advertised.
- [ ] 51. `loop/lib/gates.mjs`: the retry-once policy per gate stage — a job's
      tripwire retries its two gates; **a train retries the failing gate, not the
      set**; the classification re-run is a measurement and consumes neither.
      Implements: *A gate failure is retried once, and the record names which kind
      it was*, its new first bullet. Test with a **mutation** making the train retry
      the whole set, which must make the "one re-run of the failing gate"
      assertion fail.
- [ ] 52. **Stage-1 measurement, and the gate on Stage 2.** Record in
      `data/launch.json`, with date and method: per-gate seconds per train,
      evictions and how many were later recorded wrong, `pre-existing` holds,
      **train-review model-minutes including every re-review after an eviction**,
      and the per-job brief-commit → merge figure against task 30's baseline. The
      go/no-go compares **gate seconds saved against review minutes spent, per
      train** — a train that evicts twice pays three reviews, and counting only the
      saved gate time would account for one side of the trade.
      **Stage 2 does not start while any eviction in the last twenty trains is
      recorded as wrong**, and does not start unless the per-job brief-commit →
      merge overhead has fallen below **1.5 minutes** against task 30's baseline of
      3.85. That threshold is Stage 1's because the train is the mechanism that
      moves it. **[orchestrator]**

## Stage 2 — work orders

- [ ] 53. `loop/lib/select.mjs`: a bundler grouping affordable candidates by
      coherence key within the four bounds; it **splits** an over-bound set into
      more work orders and **refuses at selection**, with a recorded reason, an item
      that alone exceeds the per-subject bound. Implements: *One job is one work
      order, ending in one merge or one discard*, the coherence, bounds and split
      bullets.
- [ ] 54. `data/config.json`: add `work_order.max_items` 4, `max_subjects` 4,
      `max_reviewed_bytes` 60000, `max_reviewed_bytes_per_subject` 30000, and the
      train's `merges` 5, `minutes` 90, `workers` 3, `max_reviewed_bytes` 150000,
      `max_subjects` 12. **[orchestrator]**
- [ ] 55. `loop/run.mjs`: `.job/source.json` gains `items` and `declared_subjects`,
      committed at selection before any executor runs; a missing or empty
      declaration is a merge refusal. Implements the same requirement's structured
      list and empty-declaration bullets.
- [ ] 56. **The root fix, and it is one task because it is one defect.**
      `loop/run.mjs:1577-1594`: the merge's subject set is **constituted** from the
      committed `declared_subjects` — on the `reviewed:` outcome, from the
      executor's declared paths intersected with it — and the measured diff is used
      only to **check** it: every diff content path inside the declaration
      (`scope-violation` otherwise), and every item retired only with a measured
      diff on its own subjects or a `reviewed:` declaration covering them.
      Unretired items stay open and the line records the order partially done.
      Separately, make the empty-set refusal at `:1594` **unconditional** — today it
      is itself guarded on `subjects.length`, so the empty set neither records nor
      logs. Implements the same requirement's constitution, retirement and
      empty-set bullets, and *The executor result protocol…*'s `reviewed:` subject
      bullet.
- [ ] 57. `loop/tests/work-order.test.mjs`: four repairs on one page bundle into one
      order; a mixed-category pair does not; an undeclared diff path is refused; a
      bundle inside the total but over the per-subject limit is refused; **four
      items declared and one file changed retires one item and leaves three open**;
      a `reviewed:` outcome with an empty diff writes a record binding both declared
      pages; an empty subject set logs and refuses. **Mutation A**: constitute
      `subjects` from the diff again and confirm the `reviewed:` case writes no
      binding. **Mutation B**: drop the per-item measured-diff check and confirm
      three of four items are wrongly retired. **Mutation C**: derive declared
      subjects by matching paths in the brief text, and confirm a fixture whose
      brief says "do NOT touch `pulse/lib/queue.mjs`" then authorises that path.
      Tests tasks 53, 55, 56.
- [ ] 58. `loop/lib/review.mjs` `mergeGate`: re-measure all four bounds against the
      work the job produced, and **against the declared pages' reviewed surfaces**
      on the empty-diff outcome. Implements the same requirement's enforced-twice
      bullet. Test with a **mutation** measuring the empty diff instead, which must
      let four whole pages through a bound sized for four diffs.
- [ ] 59. `loop/lib/brief.mjs`: render N outcome blocks and N subject blocks under
      one scope rule, keyed on the governing type, including intake's verification
      results where present. `acceptanceChecksFor` and `checklistFor` read the
      governing type. Implements the same requirement, brief side.
      **NOTE (A2AI-Orch, 2026-09-08; the arithmetic assumes task 7 has landed
      and is meaningless before it).** Two brief-size rules in this change look
      like they conflict and today do not, because they govern DIFFERENT
      ARTEFACTS: task 8's 30,000-character bound is on the ASSEMBLED Desk brief
      (`brief-excerpt-budget.test.mjs` imports `assembleBrief` and
      `excerptsFor`), while a fleet worker's `.agent-brief.md` is hand-authored
      and that bound does not know it exists — so packet A's round 3 remedy,
      quote the frozen task text VERBATIM into the brief with its sha rather
      than paraphrasing it, cannot push anything toward a ceiling it is not
      measured against. **Work orders are the commit that makes them one
      artefact:** the moment fleet work routes through the Desk, the
      hand-written brief becomes an assembled brief and both rules apply to
      the same bytes. The room when that happens: task 7 lowers the excerpt
      ceiling to 24,000 of the 30,000, so about 6,000 characters carry
      everything that is not a spec excerpt — ground rules, job detail, and
      any quoted authority. **That subtraction describes the FIXTURE, not the
      tree** (Orch's own correction, the second time in a day an arithmetic was
      correct about the object it named and misleading about the object the
      reader had in mind): the 30,000 is asserted on a pinned corpus with
      three unarchived changes, and the live tree's largest assembled brief
      measured at B1 round 2 (`439d083`, 2026-09-08) was 41,043 after the
      diet, down from 73,288 before it, so the real non-excerpt headroom on
      the tree a worker reads is a different, unmeasured number, to be read
      from `brief_chars` when work orders arrive rather than computed from
      the bound. The asymmetry that decides the shape:
      `excerptsFor` marks its own truncation with `[... CUT ...]`, and nothing
      whatever marks a hand-written brief that quietly paraphrased; one failure
      announces itself, the other is silent, and today only the announcing one
      has a budget. So when the artefacts merge, the quoted authority is a
      FIRST-CLASS SECTION of the brief with its own budget and its own cut
      marker, not prose competing with the job detail. Both halves are measured
      on this branch: a paraphrase that lost the single word "both" cost packet
      A a full round, and the assembled brief's cut marker is the mechanism that
      would have made the loss visible.
- [ ] 60. `loop/lib/review.mjs` and `loop/lib/verdict.mjs`: `would-cite-for` as a
      list of entries sharing `reads-human-from`'s parser and entry shape; the
      duplicate check per entry across other records; two entries in one record may
      match; **"prose piece" is the schema's prose kinds**, not any content file.
      Implements: *The reviewer judges quality with full standing…*.
- [ ] 61. `loop/tests/would-cite.test.mjs`: three prose subjects with one
      record-wide field is refused naming the unanswered two; an entry per subject
      passes; two identical entries in one record pass; an entry duplicating
      another record's statement is refused; a directory row among the subjects
      requires no entry. **Mutation A**: make the duplicate check ignore entries and
      confirm only the cross-record case fails. **Mutation B**: define a prose piece
      as any `content/**.md` and confirm the directory-row case fails. Tests
      task 60.
- [ ] 62. `loop/lib/result.mjs`: `reviewed: <path>[, <path>…]` as a fourth first-line
      form, accepted only when every path is in `declared_subjects` **and** already
      reads `mismatched` at the merge base; `failed` naming the path and the missed
      precondition otherwise; an empty diff on this outcome is not a failure.
      Implements: *The executor result protocol is how outcomes are known*.
- [ ] 63. `loop/lib/review.mjs`: the review brief for that outcome carries each
      declared page's **machine-generated** reviewed surface and its hash, **no diff
      section at all**, a gates section stating the gates ran on a tree identical to
      the merge base and are therefore not evidence about the pages, and the
      checklist for each page's kind. Implements: *A review of unchanged pages is a
      review of the pages, never of an empty diff*.
- [ ] 64. `loop/run.mjs`: record each declared page's reviewed-surface hash on the
      branch at review-brief assembly; re-measure at merge; **the hash the record
      binds must equal the hash of the bytes the brief carried**, and the merge is
      refused and the run settled `failed` naming the path where they differ.
      Implements the same requirement's hash bullets.
- [ ] 65. `loop/tests/reviewed-outcome.test.mjs`: a declared, already-mismatched page
      ratifies and its record binds the current bytes; an undeclared path is
      refused; a page that was not mismatched is refused; a page moved on `train`
      between brief assembly and merge is refused; and **`hash(brief bytes) ===
      hash(record binding)`** on the same input path. Assert the brief contains no
      fenced block at all. **Mutation A**: emit the diff section unconditionally and
      confirm the empty-fence assertion fails. **Mutation B**: put a stale copy of
      the page in the brief and confirm the equality assertion fails while a
      presence-only assertion would still pass. Tests tasks 62–64.
- [ ] 66. `loop/lib/proposals.mjs` and `loop/run.mjs`: proposal consumption and
      directive marking run per item, gated on the same per-item evidence task 54
      requires. Implements: *A proposal a merged job consumed is retired*. Test with
      a **mutation** consuming both items' proposals when only one item was done,
      which must leave a proposal wrongly retired.
- [ ] 67. `loop/lib/ledger.mjs`: the `items` key and the partially-done marker,
      omitted when empty, `LEDGER_FIELDS` unextended. Implements: *The ledger line
      carries the join, as a list, additively*, its `items` bullets. Same additive
      mutation as task 26.
- [ ] 68. **Stage-2 measurement, and the decision rule stated in advance.** Record
      merged items per train, distinct subjects per work order, and **train-review
      findings present in no per-job record, per subject**. **If that proxy rises
      with `N` over the first twenty work orders, `N_max` is lowered before any
      other bound is tuned** — it is the only signal available that batching is
      costing review coverage, which is the `addictedtoai-zrsg` property.
      **[orchestrator]**

## Stage 3 — intake, the two desks, more than one worker

- [ ] 69. `loop/lib/beads.mjs` (new): the single `bd` **invocation** choke point —
      mint, claim, close, read-back verification, orphaned-claim release, retry of
      unverified closures — with `--sandbox` on every call and every call site
      set-valued. It **names `loop/lib/issues.mjs` as the existing format module**
      and defines no second id format: `issues.mjs:1-56` already states the
      format/existence split and the Vercel reason. **Built on
      `evidence/bd-measurements.md`, not on assumption** (task 28): `show --json`
      wraps its result in an array; comment bodies require `--include-comments` and
      never appear in `list --json`; a second `--claim` by another actor fails with
      exit 1, so the claim is real mutual exclusion and no second mechanism is
      needed; **re-closing a closed issue is a silent exit-0 no-op that discards the
      new reason**, so closure is verified by reading back rather than by exit code;
      `reopen` clears `close_reason`; metadata round-trips as JSON objects and
      `--set-metadata` merges; 200 ids in one argv worked, so no batching ceiling
      needs designing around; `--json` stdout is clean. **The module SHALL pin the
      working directory** of every invocation to the store it addresses and refuse
      before spawning when it is not — the measurement found that initialising with
      an explicit `--db` path from a cwd inside this repository auto-detected the
      real remote and cloned the project's history into a second store under the
      user profile. Implements: *The machine's work is joinable to the issue
      tracker*, including its cwd, read-back, claim and comment bullets. Test: an
      invocation attempted from a wrong cwd is refused **before** `bd` is spawned
      (assert on the spawn, not the outcome). **Mutation**: drop the cwd pin and
      confirm the call reaches the tracker.
- [ ] 70. `loop/lib/beads.mjs`: closure **refuses** while the bead carries unresolved
      deferral notes, naming them, with a `--promote` path that mints a bead per
      note carrying the parent id. Implements the same requirement's closure
      bullets and *A deferral becomes its own bead…*.
- [ ] 71. `loop/tests/beads-boundary.test.mjs`: a static assertion that no file under
      `lib/` and no prebuild step imports `loop/lib/beads.mjs` or spawns the
      tracker. **Mutation**: add such an import to a `lib/` file and confirm the
      test fails — the build must never acquire a dependency the host lacks. Tests
      task 69.
- [ ] 72. `loop/tests/beads-lifecycle.test.mjs`: only the named points touch the
      tracker; a job closing its own bead is recorded unverified; an unverified
      closure retries later; a close with unresolved notes refuses and `--promote`
      mints them. **Mutation**: trust the close command's exit code instead of
      reading back, and confirm the self-closed case passes when it must not. Tests
      tasks 69–70.
- [ ] 73. `loop/intake.mjs` (new): the router — desk, shape, subjects, record state,
      blocked/deferred/claimed, clearance, category, coherence key — keying on
      **declared metadata, never on a title or prose**; an undeclared mixed-path
      candidate is reported for a person, with the recorded default applied
      meanwhile. Plus the machinery-share-of-inflow report. Implements: *Intake
      routes and verifies every candidate before a model is invoked*, routing and
      reporting bullets.
- [ ] 74. `loop/intake.mjs`: the verifier — path exists, quoted string occurs, cited
      line still reads as claimed — writing each failure as a note and carrying it
      into the brief; a failed claim routes as needing re-derivation. Implements
      the same requirement's verification bullets.
- [ ] 75. `loop/tests/intake.test.mjs`: a bead asserting a word that occurs nowhere
      in the named file routes as needing re-derivation and its failure reaches the
      brief; a bead declaring its desk routes by that declaration; an undeclared
      mixed-path bead is reported, not guessed; an unreachable tracker refuses with
      the refusal status and no `HOLD.md`; **and verification completes with no
      executor invocation recorded**. **Mutation A**: report success on a missing
      string and confirm the first case fails. **Mutation B**: route on a title
      regex and confirm the declaration case still passes while the
      report-for-a-person case fails. Tests tasks 73–74.
- [ ] 76. `loop/lib/select.mjs`: sources become routed beads, the derived queue and
      proposals, in priority-band order; the scout's overdue floor above routed
      beads; **a queue floor** after N consecutive runs in which the queue was
      reachable and not reached; **automatic deferral** of a candidate whose run
      produced no result or ended failed/discarded. Intake owns expiry and
      duplicate suppression. Implements: *Work comes from one intake, and cannot
      self-amplify*.
- [ ] 77. `loop/lib/proposals.mjs`: delete `sweepExpired` (`:380`),
      `sweepExpiredProposals` (`:420`) and `discardDuplicate` (`:346`); keep the
      over-cap drop and the self-amplification discard, which bound a job's own
      output and are conflict-of-interest guards rather than traffic guards.
      Implements the same requirement's expiry and duplicate bullets.
- [ ] 78. `loop/tests/select.test.mjs`: an overdue scout outranks forty routed beads;
      a rejected-slug candidate is not routed; an expiring proposal outranks the
      queue and a discarded one does not; the queue floor fires after N unreached
      runs; a candidate that produced no result is not reselected next run.
      **Mutation A**: drop the queue floor and confirm the starvation case fails —
      deleting the directives file does not delete the starvation. **Mutation B**:
      drop the automatic deferral and confirm the reselection case fails. Tests
      tasks 76–77.
- [ ] 79. `loop/lib/select.mjs` and `loop/lib/budget.mjs`: the two lanes — content
      types on the front desk against the floor and new-writing ceiling, machinery
      and tracker work on the back desk against the machinery ceiling, machinery
      reachable directly in its own band, and an idle front desk running the scout
      or nothing. **Restate the machinery bound as the back desk's share of total
      effort** — a declared `data/config.json` key read against the effort both desks
      recorded, its starting value taken from the drain task 91 measures, replacing
      the raised per-engine ceiling rather than letting it lapse; close
      `addictedtoai-mnzf` as superseded, naming this bound as what replaced it.
      Implements: *The front desk and the back desk share an intake and never share
      a lane*, including its share-of-total-effort bullet. **[orchestrator]** for
      the config key.
- [ ] 80. `loop/tests/desks.test.mjs`: an idle front desk with machinery candidates
      ready selects the scout or nothing; a routed machinery bead is offered with no
      proposal file present. **Mutation**: let the front desk fall through to
      machinery and confirm the first case fails — this is today's behaviour and the
      72-model-minute measurement it produced. Tests task 79.
- [ ] 81. `loop/chain.mjs` (new): intake → up to `W` workers, each an ordinary
      `loop/run.mjs` invocation in its own worktree → train. `STOP` and `HOLD.md`
      checked before each worker and before the train; **stop on a failed run**;
      the lock-wait budget the train's own gates need. Implements: *The chain from
      intake to train lives in the repository*.
- [ ] 82. `loop/lib/`: the **selection lock** (read ledger → mint id → create branch
      → commit `.job/`) and the **ledger lock** (every append, including the paths
      that never merge), both carrying more than a process id, over **one** ledger
      file. Implements the same requirement's lock bullets.
- [ ] 83. **The budget reservation.** `loop/lib/budget.mjs` and
      `loop/lib/select.mjs`: under the selection lock a selected job writes a
      reservation — its per-invocation cap, its category, its tier — and the
      ceilings and the floor are computed over recorded spend **plus** live
      reservations; a reservation clears when the job's ledger line lands or the
      job is abandoned. Implements: *The chain from intake to train lives in the
      repository*, the reservation bullet. Test: two workers select simultaneously
      against a category with room for one job of that type; the second is refused
      on the ceiling and the printed arithmetic **names the reservation** as part
      of the numerator. A reservation is released on **every** terminal path —
      `done`, `failed`, `discarded`, `blocked`, `interrupted`, `capacity`,
      `abandoned` — and carries an **expiry** derived from the job's wall-clock cap
      so a killed worker cannot leave one holding budget forever; a second test
      asserts that a reservation whose job never writes a ledger line is ignored
      once the cap has elapsed. **Mutation A**: read the ledger alone and confirm
      both workers are offered the same headroom and both proceed. **Mutation B**:
      drop the expiry and confirm the lost-worker test holds budget indefinitely —
      the stale-lock failure this repository has already paid for once. Note in the
      test's header that a per-job cap under W workers permits W times the
      wall-clock spend a serial reading of it predicts, which is why the tier-total
      arithmetic and not the per-job cap is what must count reservations.
- [ ] 84. **Re-derive the four controls the parallel-worker argument leans on,
      one verdict each, before W is raised above 1.**
      (a) **Breaker 1 — re-derived, and it was broken.** `loop/lib/budget.mjs:673-683`
      `consecutiveFailures()` walks the ledger backwards and stops at the first
      `done`, so it is a pure function of append order. Replace it with a count over
      the last N completed jobs of that type (N = 5, trip at 3). Implements:
      *Breakers halt the loop, and only the named ones*, the window clause. Test
      that **fails on today's code** against the ledger `failed, failed, done,
      failed` — three of four failed and the current function returns 1 —
      and a **mutation** restoring the consecutive walk, which must make it red
      again.
      (b) **Budget ceilings — covered by task 83**, and only by it: without the
      reservation the ceilings are read from a ledger that records a job when it
      ends.
      (c) **Runner health — re-derived, and it was broken.**
      `loop/lib/health.mjs:202-214` `noOutputStreak()` walks backwards and breaks
      on the first invocation that produced something, so under more than one
      worker a healthy invocation between two dead ones resets it and a broken
      runner is never refused while other workers on it succeed. Replace it with a
      count of no-output invocations within that runner's last five in that role,
      the same shape as (a). Implements: *A runner proven unable to run is refused,
      and refusal is not a halt*, the window bullets. Test with an **interleaved
      ledger — empty, empty, producing, empty — that fails on today's code**, and a
      **mutation** restoring the backwards walk.
      (d) **Lane pause — re-derived, and it is the worst of the four.**
      `loop/lib/budget.mjs:591-607` reads only the provider's single most recent
      line (`const last = lane[lane.length - 1]; if (last.outcome !== 'capacity')
      return …`), so one worker hitting a rate limit and any other finishing a
      second later means the pause never engages — and a provider rate limit hits
      every worker on the lane **at once**, so that is the normal shape of a 429
      under three workers, not a tail case. Replace it with: any `capacity` for
      that provider inside the backoff window pauses the lane, which is strictly
      simpler than what is there. Implements: *Capacity exhaustion is a pause, and
      degradation is ordered*, the window bullet. Test with the ledger `capacity,
      done, capacity`, which **must pause** and does not today.
      (e) **Shed levels — checked, verdict unchanged.** `budget.mjs:625-639` is
      already a trailing-window count of `capacity` outcomes per tier and is
      order-independent; it inherits the read-at-selection lag that is inherent to
      it and no worse under concurrency. Assert it with a test rather than leaving
      it asserted in prose.
      (f) **Wall-clock caps, the ledger and the build/test locks — checked,
      verdict unchanged.** The caps bound one invocation and one job's total, both
      per job; the ledger is append-only under its lock and the build and test
      locks are real mutual exclusion.
- [ ] 85. `loop/tests/chain.test.mjs`: three workers run concurrently and two
      selecting in one window mint **different** job ids; a worker exhausting its
      budget is abandoned with the same ledger line a lone run would write; a
      failed run stops the chain; the pause check names a live worker's pid; the
      source scan finds no model, provider or harness token in the chain or the
      worker step. **Mutation A**: remove the selection lock and confirm the
      distinct-id assertion fails. **Mutation B**: hard-code a runner command in the
      chain and confirm `loop/tests/portability.test.mjs` fails. **Mutation C**:
      decide concurrency by matching the worktree path and confirm the lock test
      fails once every worktree is a Desk worktree. Tests tasks 81–82.
- [ ] 86. `pulse/lib/`: the mirror step, outside the derive step — one issue per
      condition that has none, closed when the condition clears, no issue id in
      `data/derived/`, the condition winning on disagreement with the disagreement
      reported, skipped with a reason when the tracker is unreachable. Implements:
      *The derived queue is mirrored into the tracker outside the derive step*.
- [ ] 87. `pulse/tests/mirror.test.mjs`: two runs with no world change produce a
      `data/derived/` that is **non-empty** and hashes identically, file for file,
      to the engine's own derivation at that commit, with no issue id in it; a
      hand-closed issue does not clear a standing condition; an unreachable tracker
      leaves the derivation untouched; **and a recomputation over a tree carrying
      the run's own committed data reproduces it byte for byte**. **Mutation A**:
      call the tracker from inside the derive step and confirm the byte-identity
      test fails. **Mutation B**: skip derivation entirely and confirm the test
      fails rather than passing because two empty trees match. Tests
      task 86.
- [ ] 88. `loop/lib/select.mjs`: an issue becomes selectable only when it is
      **routed** — the routing label plus the required fields — and intake refuses
      to route one naming neither a subject path nor a requirement, reporting it.
      Implements: *Routine work never touches OpenSpec; beads holds judgment work*,
      its routed-only bullet, and *A deferral becomes its own bead…*, its intake
      bullet. Test with a **mutation** that skips unroutable issues silently, which
      must make the reporting assertion fail, and one that selects an unlabelled P0.
- [ ] 89. Migrate `DIRECTIVES.md`: each pending line becomes a routed bead carrying
      the same text and a priority; the file is deleted and
      `loop/lib/directives.mjs` and its call sites go with it, including the parked
      section. Implements: *Work comes from one intake…*, source list.
      **[orchestrator]**
- [ ] 90. `CLAUDE.md`, `AGENTS.md` and the operating documentation: remove the fleet
      as an operating mechanism and record what replaces it — front-desk workers and
      the train review. No new fleet wave starts after this task, and not before it:
      until Stage 3 the fleet is this change's own implementation engine.
      **[orchestrator]**
- [ ] 91. **Stage-3 measurement, and it sets a bound.** Record **the back desk's
      measured share of total effort over the drain** — that figure is what sets the
      starting value of task 79's share bound, so the bound comes from what the
      drain cost rather than from a choice. Also record filed versus closed per local day, the
      machinery share of inflow, and jobs per train-hour, each against the
      pre-change figures in `proposal.md`. **[orchestrator]**
- [ ] 92. `loop/intake.mjs`, `loop/lib/brief.mjs`, `loop/lib/result.mjs` and
      `loop/lib/review.mjs`: each failed claim gets a **stable identifier**; the
      brief carries the list by identifier with what was checked and what was
      found; `result.mjs` parses a `rederived:` block of one entry per identifier,
      each carrying one of `confirmed-stale` / `still-true` / `corrected` and a
      sentence of evidence; **the merge refuses a work order whose brief carried
      failed claims and whose result file lacks an entry for any of them**, naming
      the missing identifiers; the reviewer's checklist presents each entry beside
      the claim it answers. Implements: *Intake routes and verifies every candidate
      before a model is invoked*, the identifier and `rederived:` bullets, and
      *The executor result protocol is how outcomes are known*, its named-block
      bullet. Test in `loop/tests/intake.test.mjs`: a brief with two failed claims
      and two entries merges; one with two failed claims and one entry is refused
      naming the missing identifier; an entry with a state outside the three is
      refused. **Mutation**: drop the per-identifier presence check and confirm a
      brief carrying two failed claims merges with one entry — the check is the
      only thing standing between this and the instruction it replaced. Closes the
      sealed Luna reviewer's MAJOR 5.

## Gates

- [ ] 93. `openspec validate two-desks-work-orders-and-trains --type change
      --strict --no-interactive` and `node scripts/check-spec-deltas.mjs --strict`,
      at drafting time and after every review round. Neither validator catches a
      dropped requirement heading — one was dropped and both passed — so run the
      heading-to-task count as well.
- [ ] 94. `npm test`, `npm run build`, `verify-launch`, `verify-design`,
      `verify-surfaces`, `verify-analytics` green at the end of each stage, run
      serially. Expect the suite to be **slower** at the end of Stage 1 than at its
      start: the twelve slowest tests are integration tests of the machinery these
      tasks rewrite, and rewriting them is inside the work rather than beside it.
- [ ] 95. Re-run `openspec validate` for every unarchived change after each stage:
      archiving order is load-bearing, and a change archived in between moves paths
      this one's tests may reference.

## The count

| Capability | ADDED | MODIFIED | REMOVED |
|---|---|---|---|
| `loop` | 11 | 12 | 2 |
| `review` | 2 | 2 | 0 |
| `pulse` | 1 | 1 | 0 |
| **Total** | **14** | **15** | **2** |

Ninety-five numbered tasks, 1–95 with no gaps, of which **29 name a proof by
mutation and 49 distinct mutations are named** (several tasks name an A, a B and a
C, where one mutation alone would leave a control unmeasured). Counted by script,
not by hand: `tasks: 95, contiguous=true; tasks naming a mutation: 29; distinct
mutations: 49`. Three are already ticked done (28, 29, 30).

### Heading-to-task mapping

Machine-readable, covering ADDED, MODIFIED **and REMOVED**. Each row is
`capability | kind | heading | tasks`.

| Cap | Kind | Requirement heading | Tasks |
|---|---|---|---|
| loop | ADDED | One job is one work order, ending in one merge or one discard | 52, 54, 55, 56, 57, 58 |
| loop | ADDED | Work comes from one intake, and cannot self-amplify | 75, 76, 77, 88 |
| loop | ADDED | A job's gates are a tripwire; the full set runs once, on the train | 1, 2, 3, 4, 31, 32, 33 |
| loop | ADDED | Merges land on an integration branch and main advances only by a green train | 34, 35, 36 |
| loop | ADDED | A red train is classified before anything is reverted | 37, 38, 39, 42 |
| loop | ADDED | Intake routes and verifies every candidate before a model is invoked | 72, 73, 74, 91 |
| loop | ADDED | The front desk and the back desk share an intake and never share a lane | 78, 79 |
| loop | ADDED | The brief carries the requirements the work order names, and nothing else | 5, 6, 7, 8, 9, 11, 12 |
| loop | ADDED | The chain from intake to train lives in the repository | 26, 80, 81, 82, 83, 84 |
| loop | ADDED | Runner selection is a declared policy, and escalation is part of it | 19, 20, 22, 23, 24, 25 |
| loop | ADDED | A deferral becomes its own bead only when it names a subject or a requirement | 16, 17, 18, 69, 87 |
| loop | MODIFIED | The executor result protocol is how outcomes are known | 55, 61, 64, 91 |
| loop | MODIFIED | Breakers halt the loop, and only the named ones | 48, 83 |
| loop | MODIFIED | A job's ledger line is written before anything recomputes the queue from it | 49 |
| loop | MODIFIED | The ledger line carries the join, as a list, additively | 25, 26, 66 |
| loop | MODIFIED | A swap has a stated procedure and a conformance check | 21 |
| loop | MODIFIED | Spending is budgeted in model-minutes with floors and ceilings | 18, 79, 91 |
| loop | MODIFIED | The machine's work is joinable to the issue tracker | 68, 69, 70, 71 |
| loop | MODIFIED | Routine work never touches OpenSpec; beads holds judgment work | 87, 88 |
| loop | MODIFIED | A proposal a merged job consumed is retired | 65, 76 |
| loop | MODIFIED | A gate failure is retried once, and the record names which kind it was | 50 |
| loop | MODIFIED | Capacity exhaustion is a pause, and degradation is ordered | 83 |
| loop | MODIFIED | A runner proven unable to run is refused, and refusal is not a halt | 83 |
| loop | REMOVED | One job is one outcome with one merge or discard | 52, 54, 55 |
| loop | REMOVED | Work comes from three sources and cannot self-amplify | 75, 76, 88 |
| review | ADDED | A review of unchanged pages is a review of the pages, never of an empty diff | 62, 63, 64 |
| review | ADDED | The train review is sealed from the per-job verdicts and reports what they missed | 40, 41, 42, 43 |
| review | MODIFIED | The reviewer judges quality with full standing, from a named reason list | 10, 12, 59, 60 |
| review | MODIFIED | A reviewer's non-blocking finding reaches work without editing anything | 13, 14, 15, 25 |
| pulse | ADDED | The derived queue is mirrored into the tracker outside the derive step | 85, 86 |
| pulse | MODIFIED | The Pulse publishes what it builds | 44, 45, 46, 47 |

Thirty-one rows: 14 ADDED + 15 MODIFIED + 2 REMOVED. Every row names at least
one task, and the REMOVED rows name the tasks that build the requirements their
bodies were carried into.

## Not tasks of this change, recorded so they are not read as omissions

- **`OVERRIDE.md`** — drafted and reviewed twice on branch `impl/spec`, **tabled
  by the maintainer 2026-09-06**. Not re-proposed; its Part A is adoptable close
  to verbatim whenever he untables it. `addictedtoai-7z07`.
- **Making a discarded job's branch resumable by its successor** — the maintainer
  is *"stewing on"* it; **tabled, not declined**, and silence is not approval.
  `addictedtoai-d5f6` (P1).
- **Wontfix suppression for the mirror.** The mirror does not honour a closed
  issue as a suppression — the condition wins, full stop. Whether a `wontfix`
  close should become a visible, reported suppression on the model of the build's
  debt ratchets is a real question, not answered here; file it against task 84.
- **Sharing fixtures or splitting the heaviest test files** to shorten the suite's
  longest chain. Cheap-looking, **unmeasured**, and it touches the tests guarding
  merge and publish, where a shared fixture is how a suite acquires coupling it
  cannot see. Flagged, not scheduled.
- **Raising the 10% machinery ceiling.** Making machinery reachable is in scope;
  making it affordable is a budget bound, which is the maintainer's — open
  question 4, which now carries a recommendation rather than a bare question.
- **Making a failed claim a non-authorable state** until a fresh mechanical check
  records otherwise — the stronger of the two forms a sealed reviewer offered for
  its MAJOR 5. The structured-evidence form is adopted instead (task 90): the
  merge refuses when any failed claim is unanswered, and the answer's *truth* is
  the reviewer's. Blocking authorship outright would stop a job whose honest first
  finding is that the claim was stale, which is the common case.
- **Finishing the three unarchived changes.** `bind-what-the-catalog-knows` fixes
  the canonical held-train red; `let-the-queue-see-a-judgment` fixes the queue
  starvation. Both would make this change's numbers better; neither is this
  change's to do — open question 5.
- **Preventing a human or an external script from pushing.** Out of reach by
  construction: a human `git push` is the maintainer's own act under his existing
  grant. Stated as a limit in `proposal.md`, not papered over.
