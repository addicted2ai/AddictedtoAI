# Design

Two decisions needed recording. Everything else follows from mechanisms this
repository already has.

## D1 — The tutorial surface gets a map of record

`addictedtoai-kat1` names both branches and refuses to pick one on the grounds
that picking is editorial. It is the right refusal for a *machinery* change to
make, and it is the wrong refusal for an OpenSpec change: the venue for a
decision of record is exactly this artifact, and leaving it open a second time
would be the third pass over the same question.

**Chosen: yes.** Three reasons, in the order they carry weight.

**1. The specification already assumes the producer.** `education-dynamic`
carries *"Re-verification … SHALL take priority over writing new tutorials
whenever both compete for the same budget"* and *"A new tutorial SHALL NOT be
started while any existing tutorial stands demoted for staleness."* Two
normative sentences legislate the relationship between new tutorials and upkeep.
Measured 2026-09-06, nothing in the machinery can ever start a new tutorial
except a proposal a human or a scout writes by hand, so both sentences govern an
event that has never occurred and cannot be triggered. A specification whose
requirements arbitrate a competition one side cannot enter is not stable — the
next reader either builds the producer or deletes the requirements, and deleting
them is worse.

**2. The producer shape is the cheapest one available, and it is falsifiable.**
`curriculumGapItems` is a set difference between the slugs a committed map
enumerates and the files a committed directory holds. It scores nothing, ranks
nothing and judges nothing; anyone can check its output by reading two
listings. Every other candidate trigger for tutorial growth — "this tool is
popular", "this subject has no walkthrough and should" — is a model scoring the
world against a rubric, which is the exact shape `prune` and `machinery` are
excluded for. The map converts an editorial judgment made **once, in writing,
reviewably** into a mechanical trigger, which is what the learn surface already
demonstrates.

**3. Both hazards are answerable mechanically, which is what makes it a
machinery decision after all.** The hazards a tutorial producer carries are
specific:

- *It starves upkeep.* Answered by the interlock, which is not new policy: it is
  `education-dynamic`'s existing sentence made computable. No gap item exists
  while a published tutorial stands demoted with a live subject.
- *It queues a walkthrough nobody can run.* A tutorial is verified by executing
  its steps; a tutorial about a service behind a paid account is a job that can
  only end blocked. Answered by the map's admission test, which refuses to
  enumerate such an entry unless it names in advance which steps will go
  unexecuted and why — the same disclosure `education-dynamic` already demands
  of the published page.

**The branch rejected, stated so the rejection is not re-litigated as an
oversight.** Recording "no" in `QUEUE_PRODUCIBLE_TYPES` would have been honest
and cheap, and it is what the constant's comment says today. It was rejected
because the reason written there — *"no curriculum of record exists for that
surface"* — is not a reason for the surface not to have one. It is a statement
that nobody has written it. Recording that as a permanent decision would make an
absence into a policy, which is precisely the failure `addictedtoai-3zf` named
when it asked for the exclusions to be stated at all.

**What "yes" costs, named up front.** Someone must write the map, and the map
must enumerate the four published tutorials before the publish gate can pass.
That ordering is a task and it is ordered ahead of the gate.

## D2 — A departure carries a blocking amendment, and only a *neighbouring* departure carries a finding

Two mechanisms are available for `addictedtoai-c29` and they answer different
halves of it. Using one for both is what makes the design tempting and wrong.

**The page's own entry: blocking.** A job that departs from its page's entry can
edit that entry — the file is not reserved, the job is already writing in the
same commit, and the curriculum's own §0.5 already says to. Nothing stands
between the writer and the amendment except not knowing it was theirs to make.
So the correct mechanism is the strongest one: review refuses the diff. There is
no queue item, no file, no follow-up job and no backlog, because there is nothing
to defer — the fix is one paragraph in a file the job already has open. This
matches how the repository treats every other departure it can name: the
guardrail is a refusal, not a reminder.

**A neighbouring entry: a carried finding.** c29's own instance is the case that
forces this. `the-hardware-that-runs-ai` departed by handing industrial
structure to `who-builds-ai`, and the reviewer judged that a *better division of
labour*. Making that amendment properly means editing **two** entries and
possibly re-scoping a published page — work outside the diff under review, which
the review gate refuses on scope grounds elsewhere and would refuse here. A
blocking rule applied to it produces one of two bad outcomes: the job expands
until it is a curriculum redesign, or the reviewer approves and says nothing,
which is the state c29 describes.

The carried finding is the mechanism for exactly this and needs nothing built:
`specs/review` gives the reviewer a `carry:` block precisely because *"its
worktree is discarded, as a mechanism"*, and `specs/pulse` turns each entry into
a queue item whose file is its state and whose retirement is the fixing job's own
deletion. Subject the finding on the curriculum of record and every deviation
against it batches into one item, because carried findings group by subject —
which is the "place the curriculum owner is obliged to read" c29 asks for, built
out of parts that already exist and already retire correctly.

**Why not a new `data/curriculum-deviations/` store.** It would need its own
queue reason, its own rank argued against a table that argues every row, and its
own retirement semantics. Retirement is the part that matters: `specs/pulse`
records that a retirement depending on a separate bookkeeping step is how a
high-rank item becomes permanently un-retirable, *"and that failure has happened
here and is not to be repeated."* A second store would be a second chance to
repeat it, in exchange for nothing the carried-finding path does not already do.

**Why the brief and the checklist are normative rather than left to
implementation.** Measured 2026-09-06: `curriculum` appears zero times in
`loop/` outside one comment in a test. A Desk job is one written prompt in and
files out — it has no session and no memory — so a writer that is not handed its
entry cannot be written to it, and a reviewer that is not asked to compare
cannot reject. The obligation and the telling are one mechanism; separating them
gives a rule with no actor, which is the state that produced three deviations in
one day.

## D3 — One reason, one rank, two surfaces

A missing tutorial and a missing learn page are the same event: the site
enumerated an intention and has not met it. They therefore share the reason
`curriculum-gap` and its rank of 28, and differ only in the job type the item
proposes. The alternative — a `tutorial-gap` reason — would need its own
argument for its position among `want-eligible-mint` (30) and `carried-finding`
(25), and the argument would be identical to the one already written for
`curriculum-gap`. Two rows in a rank table justified by one argument is the
drift the table's own comments work to prevent.
