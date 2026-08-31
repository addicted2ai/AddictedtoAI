# Review: record-state-before-anything-reads-it

Reviewed 2026-08-31, sealed method: findings were formed and written from the
change artifacts and the shipped tree first; `specs-reconcile-2026-08-31.patch`
was read only afterwards and reconciled at the end of this record.

## Verdict

**Yes, with three conditions — and it must not be archived until all three are
fixed.** All three are edits to this change's own delta text; none touches
code, none requires re-testing, and none disturbs the ADDED/MODIFIED shape,
which is correct as it stands.

## What was measured rather than trusted

- `openspec validate record-state-before-anything-reads-it --type change
  --strict` → **valid** (re-run, not read off tasks.md).
- `node --test pulse/tests/publish.test.mjs` → **23/23**;
  `proposal-consumed` + `ledger-order` → **11/11**; full `npm test` →
  **672 pass / 0 fail**, exactly the claimed 668 + 4.
- `94e747d` is on `main`, **12 files / 1190 insertions** as claimed, and its
  commit body **does** disclose the spec contradiction and the refused
  classifier edit, in its own words ("THE SPEC CHANGE THIS NEEDS IS NOT IN THIS
  COMMIT, and that is deliberate"). The framing claims were checked against the
  actual commit, not the proposal's account of it.
- Every test title in the section-4 traceability table was grepped and found
  under exactly the claimed name, across all four test files.
- The collision claim was re-derived from the deltas, not taken from
  `design.md`: `make-the-blog-worth-sending` carries `MODIFIED` blocks for
  **four** `loop` headings (the two the draft patch would have amended, plus
  the budget and degradation requirements) and one `pulse` heading ("The work
  queue is derived, never accumulated"); this change modifies only "The Pulse
  publishes what it builds", which nothing else touches.
- There are **three** live changes, not two: `group-tool-listings-by-category`
  is also unarchived. I checked its delta myself — it touches `specs/directory/`
  only, so the no-collision conclusion survives, but tasks.md 3.4's
  enumeration of "the other unarchived changes" was incomplete (see
  non-blocking).
- The working tree holds only the two modified test files and the untracked
  change directory + patch; `openspec/specs/` is untouched.
- Code claims spot-verified in the tree, not the tasks table: the phase-1/
  phase-2 split and the absence of any early return before phase 1
  (`pulse/lib/publish.mjs`); `recordOutcome()` at `loop/run.mjs:850`
  immediately before `rederiveStep` at `:851`, with `rederiveStep` called
  nowhere else; the idempotence guard; `consumeProposal` inside the
  `merged.ok` branch only; `.job/source.json` written at selection and
  `git rm`'d at `:762`; `consumedPaths` concatenated after the `existsSync`
  filter at `:1007`; `readCommittedJobSource` via `execFile` git;
  `lib/stamp.mjs` writing `git rev-parse --short=12 HEAD` at build time
  (so the 1ml deploy-check rewording describes the real hazard);
  `loop/lib/publish.mjs` passing no `owned` (the Desk really is the
  undeclared caller).
- Not re-measured: the 3.5 build claim (615 pages). The change is text plus
  two test files, the suite is green, and the top commit on `main` is a Pulse
  publish that passed its own gates; I state this as inference, not
  measurement, and it is not load-bearing for the verdict.

## Findings per requirement

### pulse — "The Pulse publishes what it builds" (MODIFIED)

**Earns its `SHALL`s, and MODIFIED is the only honest form.** The old
`publish: false` bullet ("SHALL skip the publish step entirely") is flatly
contradicted by shipped, tested behaviour; an added requirement cannot repeal
a `SHALL` in another one, and this heading collides with no other live change.
Sentence-by-sentence against the code: the push-nothing/no-verification/
exactly-one-line bullet matches phase 2's `!effective` return, which sits
before `fetchLiveStamp` and before the `held` and `commitBlocked` checks — so
the disabled line prints even on a run that refused something else, exactly as
the delta claims and as the foreign-content fall-through comment documents.
The deploy-check rewording (stamp names *the commit this run pushed*, read
after the commit exists, never from local `status.json`, no any-change
fallback) is true of `stampMatchesCommit` and of the deliberate absence of a
local-stamp reader — and including it is right, because a MODIFIED block
replaces the whole body and re-asserting the old "advanced to the just-built
value" sentence would re-canonize the exact defect `addictedtoai-1ml` fixed.

### pulse — "A run's computed state is committed whether or not it is published" (ADDED)

**Earns a requirement — this is the strongest candidate of the four.** It is a
cross-component contract, not an implementation detail: the Desk branches from
committed `main`, so the queue a Pulse run derives is only honest if the state
it describes is committed. The bullets pinning *absences* (undeclared caller,
hold-suspends-push-only, build gate first) are the load-bearing part, for the
reason `design.md` D3 gives and the code's own history confirms
(`addictedtoai-ps3` is real and cited in the module).

Two sentence-level defects, one blocking:

- **(Blocking — condition 2.)** "An uncommitted file under `content/` that the
  run did not write SHALL stop **both** the commit and the push, naming the
  files" is **unscoped and false of the tree** for the undeclared caller on a
  publishing run. `pulse/lib/publish.mjs`'s wholesale branch *warns and
  commits it*: `publish-verify.test.mjs` ("undeclared: the wholesale branch
  still stages and pushes for real — the Desk reaches it") asserts the remote
  commit carries `content/seed.md` and that the warning text is "publish will
  commit content/seed.md, **which this run did not write**" — the code itself
  asserts the foreign-ness and pushes anyway, deliberately, and the change's
  own traceability table cites that test as "the other half of the asymmetry".
  The refusal is armed only for a caller that declared `owned`. As written,
  the constitution would claim a refusal the machine measurably does not make.
  Fix: scope the bullet (and the "Unfinished prose stops both halves"
  scenario) to a caller that declared its writes, and either state the
  undeclared warn-and-commit behaviour or stay silent about it — but do not
  claim the refusal unscoped.
- (Non-blocking.) The preamble's "the publish step is the only thing that
  commits any of it" is true of the Pulse pipeline but not of the repository:
  `loop/run.mjs` commits the rederived `data/derived/` itself. The sentence's
  subject is "A Pulse run", so it stands, barely.

### loop — "A job's ledger line is written before anything recomputes the queue from it" (ADDED)

**Earns spec text — this was the one I weighed hardest, both ways.** Taken
alone, "append A before calling B" is implementation ordering, and pinning it
risks calcifying a detail. What tips it: the requirement also states the
outcome (the recomputed queue does not re-advertise finished work), and its
third bullet forbids the tempting alternative — teaching the derivation about
an in-flight job — which is a genuine design decision about there being one
notion of "what happened". A refactor that reordered two adjacent lines would
silently reintroduce a measured 20.7-model-minute defect, and an ordering
invariant is precisely the kind of absence-shaped rule that dies in cleanup
without a requirement behind it. Keep it.

**One blocking defect (condition 1): the third bullet's "pure function of
committed state" is false of the tree — and provably so by this change's own
test.** The ledger line is appended to the *working-tree file* at
`loop/run.mjs:850` and only committed at `:1012`, after the rederive at
`:851`; `scoutRanToday` reads `data/ledger.jsonl` from disk. If the
derivation were a pure function of **committed** state, the ordering this
requirement mandates would accomplish nothing — the rederive would not see
the just-appended line at all. `ledger-order.test.mjs`'s own witness comment
says it plainly: "the point of the witness is what is on DISK when the
derivation runs." Using "committed" wrongly *here*, in the change whose fix 1
exists to keep committed-vs-working-tree straight, is the one word this change
cannot afford to get wrong. Fix: "a pure function of recorded state" (or "of
the ledger file and the clock") — one word, and tasks.md's matching
traceability row should follow it.

### loop — "A proposal a merged job consumed is retired" (ADDED)

**Earns it without argument**: it changes the observable lifecycle of work
source 3 and creates a directory (`consumed/`) with normative record-never-
block semantics. Every bullet checked against the code holds: merge-only
consumption (call site inside `merged.ok`, deliberate absence in the
`discarded` branch), queue/directive jobs retiring nothing (`proposalOrigin`
set only for `source === 'proposal'`), mechanical retirement (fs-only),
selection recorded as data with a repo-relative POSIX path and removed before
merge, resumption reading it back, both halves of the move staged together
after the `existsSync` filter. The "as data rather than as prose" bullet
pins mechanism-shape without pinning a filename, which is the right altitude
given the resumption-door defect. The `consumed/`-is-a-record clause is
measured as behaviour (test 2.4), not as words in a note — the change's own
upgrade over its pre-existing test, and the right instinct.

One boundary case, not blocking: `.job/source.json` is written only at fresh
selection, so a proposal job whose branch predates `94e747d` and resumes after
it merges without retiring. Transient by construction and self-healing; not
worth a sentence.

### The miss both the patch and the change share (condition 3)

The pipeline enumeration in **"The Pulse runs to completion with zero model
access"** still reads "… site rebuild, and — **when publishing is enabled** —
publish (the deploy step defined below)". This change repeals the
skip-the-step-entirely sentence in one requirement while leaving the pipeline
enumeration that encodes the same model of the world in another. A literal
implementer of that requirement builds a pipeline with no commit step and a
publish step that does not run at all when the flag is down — the exact
behaviour fix 1 removed. `design.md` D2's own principle ("a spec that says two
incompatible things and leaves a later reader to guess") applies to this pair.
No live change modifies that heading, so a MODIFIED block is collision-free
and costs one clause — e.g. "… site rebuild, and the commit-and-publish step
(defined below), whose push half runs only when publishing is enabled."

## The ADDED-vs-MODIFIED judgment

**ADDED is honest here, on both loop requirements — I checked the suspicion
and it does not hold up.** The test for "amendment wearing a costume" is
whether the new text changes what an existing requirement governs, leaving two
overlapping rules. It does not:

- "One job is one outcome with one merge or discard" governs what a job *is*
  (unit, cap, branch, merge/discard, closed type list). When the ledger line
  is written relative to the rederive is absent from it entirely; the ordering
  requirement neither restates nor contradicts any sentence of it.
- "Work comes from three sources and cannot self-amplify" governs where work
  comes *from* — selection-side. Retirement-after-merge is consumption-side
  lifecycle the existing body never touches. The one overlap-shaped sentence
  ("unlike `data/proposals/rejected/`, which is still auto-discarded") is a
  cross-reference to the existing rule, restated compatibly, not a second rule.
- On `pulse`, the change correctly refuses the same trick where it would have
  been dishonest: the old `SHALL` had to be repealed, so the requirement is
  MODIFIED in full (D2), and the commit behaviour is split into its own ADDED
  requirement with an explicit cross-reference from the modified body — the
  two cannot be read as contradicting because each names the other's
  jurisdiction.

One residue worth a clause, not a restructure: make-the-blog's modified
work-sources body says a proposal on a discarded branch "dies with the branch;
ideas do not outlive the rejection of the work that produced them", while this
change says "a discarded job's proposal SHALL remain selectable: what the
reviewer rejected was the work, not the idea." Both are true — one is about a
proposal the job *produced*, the other about the proposal it was *selected
from* — but the two sentences rhyme in opposite directions and will sit in the
same file once both archive. The change's requirement heading and scenarios do
disambiguate; a reader who stops at the two aphorisms will not. Non-blocking.

## Archive-order result

**Safe in either order, verified by construction rather than taken from
tasks 3.4** — and against all **three** live changes, not the one tasks.md
names. `MODIFIED` replaces whole bodies by heading; `ADDED` inserts new
headings. The full touched-heading sets:

- this change: MODIFIED `pulse`/"The Pulse publishes what it builds"; ADDED
  one `pulse` and two `loop` headings.
- make-the-blog-worth-sending: MODIFIED `loop` × 4 ("One job…", "Work comes
  from three sources…", "Spending is budgeted…", "Capacity exhaustion…"),
  MODIFIED `pulse`/"The work queue is derived…", plus `review`/`editorial`/
  `blog`; ADDED the two scout headings.
- group-tool-listings-by-category: `directory` only.

The sets are pairwise disjoint, including ADDED-heading collisions. No
ordering loses a sentence. One cosmetic order-dependence: this change's
retirement requirement says "on the same terms as `data/proposals/dropped/`",
whose record-never-block semantics enter the constitution only when
make-the-blog archives — a this-first archive leaves a forward reference for a
while. The sentence defines its own rule inline, so nothing is ambiguous in
the interim.

## Where I disagree with the drafting work

Read after my findings were sealed, per the method:

1. **The change's two blocking text defects are its own, not the patch's.**
   The draft patch contains neither the "pure function of committed state"
   sentence nor the unscoped foreign-content `SHALL` — both entered while the
   change enriched the draft's paragraphs into bullet-level requirements. The
   enrichment was the right instinct (the patch's versions were thinner and
   pinned less); the two sentences it minted are wrong of the tree.
2. **What the patch let pass, the change let pass too**: the stale pipeline
   enumeration in the zero-model requirement (condition 3). Neither document
   noticed that repealing "skip the publish step entirely" leaves its echo one
   requirement up.
3. **tasks.md 3.4 under-enumerates**: "the other unarchived changes" names
   only make-the-blog; `group-tool-listings-by-category` was also live. The
   conclusion survives my re-check, but a collision check that misses a live
   change is a collision check by luck. Fix the sentence when touching tasks.md
   for condition 1.
4. Where the change *rewrote* the patch, it improved it every time I checked:
   the retirement note gains the merge commit (matching the code); the ledger
   rationale is phrased generically instead of leaning on the not-yet-archived
   scout requirement; D1's ADDED shape replaces two guaranteed silent
   archive collisions. I confirm the patch's `MODIFIED` placement would have
   been last-writer-wins against make-the-blog with nothing to catch it.

Nothing in the change should be dropped. All four requirements earn their
place; the argument is only over three sentences.

## Blocking items — fix before archive, in this order

1. **Loop delta, ledger requirement, bullet 3**: replace "a pure function of
   committed state" with "a pure function of recorded state" (or "of the
   ledger file and the clock"). Update the matching row in tasks.md section 4.
   While in tasks.md, fix 3.4's enumeration (disagreement 3).
2. **Pulse delta, ADDED requirement, foreign-content bullet + its scenario**:
   scope the refusal to a caller that declared its writes (the Pulse always
   does; the Desk never does), so the constitution does not claim a refusal
   the measured wholesale branch deliberately does not make.
3. **Pulse delta**: add a MODIFIED block for "The Pulse runs to completion
   with zero model access" amending the pipeline enumeration's "and — when
   publishing is enabled — publish" clause to name the commit-and-publish step
   with only its push half flag-gated. Collision-free (verified against both
   other live changes). Re-run `openspec validate --strict` after all three.

## Non-blocking items

- The discarded/consumed aphorism rhyme (one clarifying clause, e.g. "the
  proposal it was selected from", would inoculate the future combined file).
- The `dropped/` forward reference if this archives before make-the-blog.
- "the publish step is the only thing that commits any of it" — true only
  inside a Pulse run; acceptable in context.
- Pre-`94e747d` resumed branches carry no `.job/source.json` and merge without
  retiring; transient, self-healing.
- The change directory carries no `.openspec.yaml` (make-the-blog has one);
  `openspec list` shows the change as Complete and validate passes, so this
  appears optional — worth a glance at archive time, not before.
- Page-count drift between records (619 in `94e747d`'s message, 615 in
  tasks 3.5) — different days, date-dependent derived pages; not a
  discrepancy.

## What the change gets right

Stated as plainly as the defects. The framing is honest all the way down: the
proposal's first sentence is the unusual order, the commit message it cites
really does disclose the same thing, and the refused classifier edit is
reported as the guardrail working — verified, not taken on trust. The
ADDED/MODIFIED reasoning is correct on both sides and correctly asymmetric:
added where addition is honest, modified where only modification can repeal a
`SHALL`. The traceability discipline is real, not decorative — all four new
tests exist, discriminate (each has a control that fails the opposite way,
including the out-of-suite `exit 0` control for 2.3), and the suite's 672/672
is reproducible. The measurement instinct shows in the details: the
consumed-is-a-record claim upgraded from words-in-a-note to planted-file
behaviour; the ledger-order witness standing inside the production seam
instead of reimplementing the decision; the tasks file citing symbols read in
the tree rather than the commit that claimed them. And the three requirements
themselves record the right lesson — the system was careful producing state
and careless retiring it — at the right altitude, pinning absences a cleanup
would otherwise eat while leaving phase names, log strings and file layouts
free to change. Fix three sentences and archive it.
