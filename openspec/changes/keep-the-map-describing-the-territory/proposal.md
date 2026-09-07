# Keep the map describing the territory

## Why

Two education surfaces, two maps, and neither map is bound to the thing it
describes. The learn surface has a curriculum of record that the build enforces
in one direction only — a page may not publish undeclared — and nothing at all
enforces the other direction, so a page may quietly stop matching the entry that
declared it. The tutorial surface has no map at all, which is why nothing
anywhere can decide that a tutorial ought to exist.

`addictedtoai-c29` and `addictedtoai-kat1` are the two halves of that, and they
share a mechanism: a written enumeration of what a surface intends to publish,
kept true by something other than someone remembering to keep it true.

## What was re-measured before designing anything

Both beads were written on 2026-08-31 and triaged 2026-09-04. Every claim they
rest on was re-measured against the worktree on 2026-09-06. Everything they
claim still holds, and three things they do not claim were found.

**`addictedtoai-c29` — the four unamended deviations are all still unamended.**
Measured in `openspec/curriculum/learn.md`:

| clause | line | the deviation | measured in `content/learn/` |
|---|---|---|---|
| `who-builds-ai` must cover | 411 | "accelerator design concentrated in one company, fabrication in one region" — delivered by `the-hardware-that-runs-ai` as lithography supply plus packaging capacity, the rest handed to `who-builds-ai` | entry unamended |
| `where-ai-fails-people` must cover | 435 | canonical cases "hiring, credit, face recognition" as dated asides | `where-ai-fails-people.md` contains `hiring` **0 times** |
| `what-ai-is-used-for` must cover | 392 | "ranking, recommendation, fraud detection, …" | `what-ai-is-used-for.md` contains `recommend` **0 times** |
| `prompt-injection` must cover | 947 | "poisoning at training time, one paragraph" | entry unamended |

**The finding neither bead makes, and it is the mechanical root of all four.**
The word `curriculum` occurs **zero times** in `loop/` outside a single comment
in `loop/lib/gates.mjs` naming a test file. `ACCEPTANCE_BY_TYPE.education`
(`loop/lib/brief.mjs:160-164`) is three lines — no perishable literals, honest
prerequisites, beats the alternative — and `CHECKLISTS.education`
(`loop/lib/review.mjs:167-171`) is the same three. Neither names the curriculum
of record, neither hands the writer its entry, and neither asks the reviewer to
check the page against it. So the curriculum binds the **build**
(`checkCurriculumCoverage`, `lib/learn.mjs:83`) and the **queue**
(`curriculumGapItems`, `pulse/lib/queue.mjs:667`) and reaches **neither actor
who could amend it**. Three defensible deviations in one day is not a lapse of
diligence by three writers; it is the predictable output of a map that talks to
machines and not to authors. c29's own framing — *"What is missing is not
diligence … but the step where somebody holding the curriculum pen acts on what
they reported"* — is right, and the measurement locates the missing step
precisely: nobody was ever told they held the pen.

**A second route into a learn page, measured 2026-09-06 when this change was
reviewed, and it moved a task rather than a requirement.** The comparison this
change asks a reviewer to run would have been keyed on the job's **type**:
`CHECKLIST_FOR_TYPE` (`loop/lib/review.mjs:180-191`) selects the checklist, and
`CHECKLISTS.education` is three lines while `CHECKLISTS.tutorial` is four, with
no curriculum named in either. But a learn page is not edited only by
`education` jobs. Every carried finding becomes
`item('repair', 'carried-finding', …)` (`pulse/lib/queue.mjs:467` and `:471`),
and `repair` maps to the `directory` checklist, whose entire content is one line
— *"Spot-check the changed rows against their sources"* (`review.mjs:172`,
`:187`). So the route by which a reviewer's finding about a published learn page
becomes an edit to that page, and the route by which a finding whose subject is
the curriculum of record is drained, would both have been reviewed without the
comparison — the second being this change's own retirement path. The requirement
is written over **diffs touching a learn page**, not over job types, so the
mechanism is keyed the same way: `assembleReviewBrief` (the function's real
name, and it already receives `diffText`) appends the comparison block whenever
the diff touches either content surface or either map. No requirement moved; a
task did.

**A third route into a learn page, measured 2026-09-06 in the fix round, and it
narrowed a sentence rather than a mechanism.** The author's-brief sentence had
been written as a universal over jobs that write or edit a learn page — *carry
that page's curriculum entry* — but not every such job names a page. `job.target`
is set in exactly one place, `loop/lib/queue.mjs:77`
(`target: it.target ?? it.path ?? null`), from a queue item; `loop/lib/
proposals.mjs` and `loop/lib/directives.mjs` contain the string `target` **zero
times each**, and `subjectLines` (`loop/lib/brief.mjs:476-477`) says so in its
own comment — *"directive, proposal and resumed jobs set these null"*. An
`education` job filed by the scout or by a `DIRECTIVES.md` line therefore has no
page to look an entry up by, and a sentence demanding one would be unsatisfiable
on that route rather than merely unimplemented. The sentence now states what the
system does on every route — the map's path and the obligation always, the entry
verbatim wherever the job names its page — and tasks 18, 19 and 23 carry both
halves. Nothing was weakened: the entry injection is unchanged for the routes
that have a target, and the type-keyed acceptance text is what reaches the ones
that do not.

**`addictedtoai-kat1` — still true, and the surrounding numbers are unchanged.**
`QUEUE_PRODUCIBLE_TYPES` (`pulse/lib/queue.mjs:88-95`) holds six types and
`tutorial` is not among them; its exclusion comment (lines 67-71) cites this
very bead. There is no `item('tutorial', …)` call anywhere in
`pulse/lib/queue.mjs`. `tutorial` **is** a runnable type
(`loop/lib/config.mjs:24-35`, ten types). `content/tutorials/` holds four
published tutorials plus its own `README.md`. The only tutorial-shaped queue
reasons are `tutorial-demoted` (rank 70) and `tutorial-stale` (rank 55), both
producing `verify` jobs about tutorials that already exist
(`pulse/lib/queue.mjs:820-826`).

**A discrepancy the beads do not mention, found while designing the interlock,
and it changes an implementation task rather than a requirement.**
`education-dynamic` already subordinates new tutorials to upkeep — *"A new
tutorial SHALL NOT be started while any existing tutorial stands demoted for
staleness, unless the demoted tutorial's subject is dead"* — so a tutorial
producer needs a mechanical reading of "demoted, subject not dead". Two
different definitions of `archived` exist today:

- `lib/tutorials.mjs:132` derives `archived` from the **subject entry's status**
  being `retired` or `dead`, and decides it **first**, so on the render side an
  archived tutorial is never also demoted (`STATES`, line 48).
- `pulse/lib/corpus.mjs:189` reads `archived: Boolean(f.data.archived)` from the
  tutorial's **own front matter**, and `pulse/lib/freshness.mjs:64-67` branches
  on that. On the Pulse side a dead-subject tutorial whose file does not declare
  `archived: true` is `demoted`.

So the interlock cannot be written as "not `state === 'demoted'`" and be correct.
The requirement is stated in the semantic terms `education-dynamic` already
uses, and aligning the Pulse's notion of `archived` with `lib/tutorials.mjs`'s is
a named task.

## The decision `addictedtoai-kat1` asks for, and it is a decision, not a finding

kat1 does not ask for an implementation. It asks whether the tutorial surface
should have a map of record at all, and gives both branches: write one and add a
producer, or record "no" as the decision in `QUEUE_PRODUCIBLE_TYPES` beside the
other four exclusions.

**The decision is yes**, and the reasoning is recorded in `design.md` beside the
alternative it rejects. In short: `education-dynamic` already legislates for
new tutorials competing with upkeep for a budget, so the specification assumes a
producer that does not exist; the declared-coverage derivation is a set
difference between two committed files, which is the cheapest producer shape in
the machinery and the only one that is falsifiable by reading two directory
listings; and the two hazards a tutorial producer actually carries — starving
upkeep, and queuing a walkthrough nobody can run — are both answerable
mechanically, which is what makes this a machinery decision after all.

## What changes

**`specs/education-static`, added.** A learn page is written to its curriculum
entry's clauses, and a job that judges a clause wrong amends the entry in the
same diff. A departure disclosed only in a `RESULT.md`, a commit message or a
verdict record's prose does not satisfy that — each of those is a finished
document, and this repository's own rule is that a note inside something
finished is already lost. Review checks the page against its entry clause by
clause and rejects `spec-violation`, naming the clause, when the diff departs
and does not amend. Where the departure implies a change to a **neighbouring**
entry, the reviewer carries a finding whose subject is the curriculum of record.
Both actors are told: the education brief carries the entry, the education
checklist carries the check.

**`specs/education-dynamic`, added.** The tutorial surface gets a curriculum of
record at `openspec/curriculum/tutorials.md`, enumerating each intended
walkthrough with its subjects, outcome, coverage bounds and re-verification
interval, under an admission test that refuses to enumerate a tutorial whose
steps cannot be executed here. That test names its actor and its outcome —
review rejects a diff adding an entry that fails it as `spec-violation` naming
the test — because a rule written only into the map it governs has nobody asked
to apply it. The same publish gate the learn surface has, the same build error,
and the same departure discipline.

**`specs/pulse`, modified — two requirements.** *"A surface's unmet declared
coverage is queue input"* proposes the job type that writes the surface rather
than always `education`, and grows the upkeep interlock: no gap item for the
tutorial surface while a published tutorial stands demoted for staleness with a
live subject. *"Which job types the queue may produce is a stated decision"*
moves `tutorial` from the exclusion list to the producible list, and records why
the condition its exclusion rested on no longer holds.

## What was deliberately not done

- **The four standing deviations are not amended here.** They are
  `addictedtoai-f7l` / `-4wm` (hiring), `-88x` (recommendation), `-mfm`
  (poisoning) and c29's own hardware instance, each a one-line edit to
  `openspec/curriculum/learn.md` or to a page, and each needing an editorial
  judgment about which side of the deviation was right. Amending a curriculum
  entry is content work under the review gate, not spec drafting. c29's triage
  says exactly this — *"the instances are each a one-line edit, and the
  mechanism … is what stops the count rising"* — and the mechanism is what is
  drafted here. **The backfill is separate work and the four beads carry it.**
- **The tutorial map's contents are not written here.** Its required shape and
  its admission test are a requirement; which walkthroughs the site should
  publish is an editorial enumeration, and a task rather than a spec clause.
  The map must enumerate the four published tutorials before the publish gate
  can pass, which is a task and is ordered ahead of the gate.
- **No new queue reason and no new rank.** A missing tutorial is the same event
  as a missing learn page — a declared intention unmet — so it carries the same
  reason `curriculum-gap` at the same rank 28. A second reason for the same
  event would need a second justification for its position in a rank table that
  argues every row.
- **No new store for deviations.** A departure that reaches beyond the page's
  own entry becomes a **carried finding**, which is the mechanism `specs/review`
  and `specs/pulse` already define, already measure, and already retire by
  deletion of a file. Inventing a parallel `data/curriculum-deviations/` would
  duplicate a mechanism whose retirement semantics took a documented failure to
  get right.
- **`tutorial-demoted` and `tutorial-stale` are untouched.** The Pulse's
  `archived` discrepancy is corrected only as far as the interlock needs; whether
  a dead-subject tutorial should stop producing a `verify` job asking for
  re-verification is a separate question about a separate requirement.
- **`post`, `prune` and `machinery` stay off the producible list**, on exactly
  the reasoning already recorded for them. Nothing here weakens that: the
  condition `tutorial` was excluded under was the absence of a map, and a map is
  precisely what the other three cannot have — "the corpus is due a post" and
  "the machinery is deficient" are not enumerations of anything.

## The beads this serves

- `addictedtoai-c29` — the mechanism behind the reporting step. Its four linked
  instances (`-4wm`, `-88x`, `-mfm`, `-f7l`) are backfill and are not served
  here.
- `addictedtoai-kat1` — the tutorial surface's producer, and the decision it
  asks for.
