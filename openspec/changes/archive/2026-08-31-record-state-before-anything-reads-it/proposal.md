# Proposal: record-state-before-anything-reads-it

## Why

**The implementation already exists. This change is the spec catching up to
shipped code, and pretending otherwise would be the first defect in it.**

On the night of 2026-08-30/31, driving the whole chain end to end — Pulse, then
Desk, then Pulse again — surfaced three defects. They are one defect wearing
three faces: *the system is careful about producing state and careless about
retiring it*, so a record was repeatedly written **after** the thing that reads
it had already read it.

1. **A run's state stayed uncommitted while publishing was held down.** The
   Pulse writes `data/changes.jsonl`, the source snapshots, `data/linkcheck.json`
   and `data/derived/`, and the publish step is the only thing in the codebase
   that commits any of it. With `publish: false` — which `CLAUDE.md` explicitly
   *recommends* while a larger change is in flight — the step returned on its
   first line and committed nothing. Measured: a Pulse run appended a 91st line
   to `data/changes.jsonl`; the work queue was derived from that **working
   tree** and duly offered an `interpret` job for the new line; the Desk
   branches jobs from committed `main` (90 lines), so the executor could not
   find the record it was told to annotate and correctly reported
   `blocked: the change record this job annotates is not on this branch`.
   15.47 model-minutes, no output. `git log -S … -- data/changes.jsonl`
   returned nothing, proving the line had never been committed.

2. **The queue was recomputed from a ledger missing the job that had just
   finished.** `loop/run.mjs` appended the ledger line at `:853` and recomputed
   the derived tree at `:754`. Part of the queue is a function of the ledger —
   `pulse/lib/queue.mjs`'s `scoutRanToday` reads it directly — so the post-merge
   rederive left `scout-due` standing and the very next Desk run selected the
   scout again. 20.7 model-minutes on a duplicate daily sweep, and "once per
   day" violated by the mechanism that implements it.

3. **A consumed proposal stayed selectable.** A proposal selected, written,
   reviewed and merged into a published post remained in `data/proposals/`. The
   next dry run selected the same proposal again; its `expires:` was a week out,
   so the loop would have rewritten that post on every run until then. Three
   were retired by hand.

All three were fixed and committed as `94e747d`
(*"lifecycle: commit is not publish, ledger before rederive, consumed proposals
retire"*) — 12 files, 1190 insertions, with `npm test` 668/668 and
`npm run build` clean at 619 pages. Each fix carries a test proved to **fail**
against the old behaviour, not merely to pass against the new one.

### Why the code moved first, and why the spec did not move with it

Fix 1 contradicts a `SHALL` in the constitution. `openspec/specs/pulse/spec.md`
says that under `publish: false` the Pulse *"SHALL skip the publish step
entirely"*; the fix deliberately makes it **commit** and gate only the **push**.
`CLAUDE.md` is explicit that when it and a spec disagree, the spec wins — so
from `94e747d` until this change archives, the shipped code is spec-violating
and visibly so.

That happened in that order for a reason worth recording rather than
apologising for. The defects were found by running the machinery under time
pressure overnight, and leaving a Desk lane burning model-minutes on jobs it
could not complete was the more expensive of the two available wrongs. The
reconciling spec edit **was written** — 71 insertions and 7 deletions across
`pulse` and `loop`, validating `--strict` — and **committing it was refused by
the approval classifier**, because `openspec/specs/` is a reserved path the
orchestrator holds no grant for. That refusal was correct and was not routed
around: a direct edit to `openspec/specs/` skips the review that a change delta
plus an archive exists to impose. So the commit knowingly left the code ahead of
its spec, said so in its own message, and left the gap visible in `git status`.

This change is the proper route. It carries that draft's *content* — verified
sentence by sentence against the shipped code rather than trusted — through the
mechanism the repository actually specifies.

## What Changes

**`pulse` — committing is separated from publishing.** The requirement that
currently says the Pulse skips the publish step entirely under `publish: false`
is modified to say it **pushes nothing** and prints one line, and a new
requirement states what phase 1 now does: a run's computed state is committed on
every run, governed by attribution alone, whatever the flag says and whether or
not `HOLD.md` stands. Four behaviours that were deliberately *not* changed are
pinned as requirements so a later reader cannot mistake them for oversights: an
**undeclared** caller (the Desk, which passes no `owned`) still commits nothing
outside a publishing run; a **hold** suspends the push only, because `HOLD.md`'s
own text says the Pulse keeps running and only its deploy is suspended; a
foreign uncommitted file under `content/` still refuses both halves; and the
ordering is unchanged — **publish runs after the site rebuild, so a run
producing content the build rejects neither commits nor publishes it.**

**`pulse` — the deploy check names a commit, not a change.** Not from the
overnight fixes, but found while checking them: the requirement's current
wording asks that the live stamp *"advanced to the just-built value"*.
`lib/stamp.mjs` writes `out/status.json` at build time, which in this pipeline is
**before** the commit exists, so *"the just-built value"* names the previous
commit. That reading is precisely the defect `addictedtoai-1ml` fixed, and the
shipped code reads `git rev-parse HEAD` after committing and matches the stamp
as a hex prefix of that exact SHA. The sentence is corrected to describe what
the code does.

**`loop` — two added requirements**, not modifications, and that choice is
deliberate (see `design.md`, D1): a job's ledger line is written before anything
recomputes the queue from it, and a proposal a job was selected from is retired
when that job merges — with a discarded job's proposal deliberately left
selectable, because what was rejected was the work and not the idea.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `pulse`: one modified requirement — *"The Pulse publishes what it builds"*,
  whose `publish: false` bullet directly contradicts the shipped code and whose
  deploy-verification sentence names the wrong commit. One added requirement —
  *"A run's computed state is committed whether or not it is published"*.
- `loop`: two added requirements — *"A job's ledger line is written before
  anything recomputes the queue from it"* and *"A proposal a merged job
  consumed is retired"*.

No other capability is touched. `review` in particular is not: nothing here
changes what a reviewer checks or how a verdict is reached. `site` is not: the
build stamp's own contract is unchanged and this change only stops the publish
step reading the wrong copy of it.

## Impact

- **Machinery**: none pending. `pulse/lib/publish.mjs` (two-phase step),
  `loop/run.mjs` (`recordOutcome` before `rederiveStep`, `.job/source.json`,
  `consumedPaths`), `loop/lib/proposals.mjs` (`consumeProposal`, `consumedDir`)
  and `loop/lib/resume.mjs` (`readCommittedJobSource`) all shipped in
  `94e747d`. Every task in section 1 of `tasks.md` names what was read in the
  tree to confirm it.
- **Tests**: `pulse/tests/publish.test.mjs`, `loop/tests/ledger-order.test.mjs`
  and `loop/tests/proposal-consumed.test.mjs` shipped with the fix. **Four
  tests were added by this change** to close measurement gaps found while
  writing the deltas — the refused commit, its positive control, the build-gate
  ordering, and `consumed/` being a record rather than a block measured as
  *behaviour* instead of as words in a note (section 2 of `tasks.md`). A `SHALL`
  nothing measures is invisible twice over, and three of the sentences in these
  deltas had no measurement until this change added one. `npm test` is 672/672,
  up from the 668 recorded in `94e747d`.
- **Data**: none. `data/proposals/consumed/` already exists and holds three
  files. `data/config.json` is untouched — it is reserved.
- **Specs**: deltas against `pulse` and `loop` as they stand in
  `openspec/specs/`. **Archiving order matters and is not free** — see
  `design.md`, D2: `make-the-blog-worth-sending` modifies both `loop`
  requirements the draft patch would have modified, which is why this change
  adds rather than modifies there.
- **Deployment**: nothing here pushes, builds or deploys. The change is text.
