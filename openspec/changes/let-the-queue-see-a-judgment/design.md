# Design

Four choices here are not derivable from the requirement text, and two of them
are refusals of the obvious option. They are recorded so the next reader does not
take the obvious option by default.

## D1. Why the review-mismatch item needs no durable record, when a withdrawn row does

`A withdrawn feed row is recorded once and retires when the site answers it` was
written because a finding computed directly from a permanent condition can never
retire: the row's absence from the snapshot continues for ever, so deleting the
record re-derives it on the next run, and at a high rank an immortal item starves
everything beneath it.

A review mismatch is the opposite in the one property that matters. Its condition
is a **difference between two files in this repository** — a hash recorded in
`data/reviews/` against a hash computed from `content/` — and the job that fixes
it writes a new record. The next recomputation reads a matching pair and the item
is simply gone. There is no world to wait on, no state that persists after the
fix, and therefore nothing to move into an answered store.

Building one anyway would be actively harmful: it would introduce a second place
where "this piece's review is fine" is asserted, and the launch gate would read
one while the queue read the other. The gate and the queue must be unable to
disagree, which is also why the delta forbids a second hash and a second join.

The test that separates the two classes, for whoever writes the next queue
producer: **can the job that takes the item make the condition false by editing
this repository?** If yes, derive it and let recomputation retire it. If no, the
finding needs a record of the *answer* and the fixing job's diff has to move it.

## D2. Why `verify` and not `entry` or `repair`

`addictedtoai-ccky` says the type drives budget category, wall-clock cap and
shedding, and asks for a decision with a reason.

- `entry` is the type a hand-written directive would use, and it is wrong for
  exactly the reason the bead suspects: the work is not authoring. It is
  re-establishing that an approved surface still says what was approved, which
  begins by reading a record and a diff rather than by writing prose. Typed as
  `entry` it draws on the authoring budget and sheds when authoring sheds — on a
  condition that reddens the launch gate and therefore blocks every publish,
  including the ones that would drain the rest of the queue.
- `repair` is closer but describes a broken artifact — a dead link, a refusing
  source — and nothing here is broken. The page renders correctly; what has
  lapsed is its approval.
- `verify` is what the work is, is already on `QUEUE_PRODUCIBLE_TYPES`, and
  therefore needs no amendment to the closed-list requirement. Re-measured
  2026-09-06: `pulse/lib/queue.mjs:88` lists `education`, `entry`, `interpret`,
  `repair`, `scout`, `verify`.

## D3. Where the mismatch is computed, and why not inside `computeQueue`

`computeQueue(root, { freshness, changesFile, wants, corroborations, registry, at })`
is already a function over **already-computed** findings: `corroborationFindings`
runs in `pulse/run.mjs:270` and `pulse/lib/rederive.mjs:73` and its result is
passed in. The review state follows the same route — computed beside the
corroboration findings and passed to `computeQueue` as one more named option —
for three reasons that are properties of the code rather than preferences:

1. **`reviewJoin` cannot read the corpus the Pulse already holds, so this
   producer must load `lib`'s.** The two corpora are different shapes and it is
   not a detail: `pulse/run.mjs:129` holds `readCorpus(root)` from
   `pulse/lib/corpus.mjs`, which returns `{ entries, tutorials, listings, prose,
   unreadable }` (`pulse/lib/corpus.mjs:212`), while `reviewablePieces(corpus)`
   reads `corpus.entry`, `.learn`, `.tutorial`, `.post`, `.delta` and `.claim`
   (`lib/reviews.mjs:298–307`) — the build corpus that `lib/corpus.mjs`'s async
   `loadCorpus({ contentRoot, diags })` returns. So the producer loads the build
   corpus itself, with the same loader `scripts/verify-launch.mjs:823` and
   `lib/build-content.mjs:125` pass to `reviewJoin`. That is a second **read**,
   and deliberately not a second **join**: the one-join invariant is that
   `reviewJoin` over `lib`'s corpus is the only resolution of pieces to records
   and the only reviewed hash anywhere, and it is precisely by loading the gate's
   own input rather than approximating it from the Pulse's that the gate and the
   queue are made unable to disagree. Loading it inside `computeQueue` instead
   would put a filesystem read behind a pure function, which is what reasons 2
   and 3 forbid.
2. `computeQueue` stays a function of its arguments, which is what lets
   `pulse/tests/queue.test.mjs` run it on fixtures with no repository behind it.
3. `rederive.mjs` exists to reproduce the derived tree byte-identically; a
   producer that reached out to the filesystem from inside `computeQueue` would
   have to be reproduced there separately, and the two would drift.

## D4. Why the adjudication pins values instead of living in front matter

`addictedtoai-cct` offers two sketches: an optional `corroboration_note:` on the
fact, or an acknowledgement record under `data/`. The record wins, and the reason
is measurable rather than aesthetic.

An adjudication has to pin **both** sides, because the rule that makes it safe is
that the item returns when either value moves. One of those sides is feed-bound:
its value comes from the latest snapshot through the entry's declared row id.
Writing it into the entry's front matter would either

- pin only the cited side, which cannot detect a moved feed value — the more
  likely of the two to move, since it moves whenever the vendor edits a row —
  or
- copy a snapshot value into the corpus, which is precisely the typed volatile
  value that `Volatile values are bound, never typed` exists to forbid, and it
  would rot silently the first time the feed changed.

A record under the data root holds both pins beside each other, is committed like
the rest of the durable queue state, and needs no change to `lib/schema.mjs` and
no delta on `specs/wiki`.

**And the engine must not be able to write one.** Suppression is the power to
silence a finding; an engine that could grant itself that power is an engine that
adjudicates, which is the one thing `pulse/lib/corroboration.mjs`'s header has
always said it does not do. The record is a fixing job's own diff, under the
review gate like any other content, which is what puts a reviewer between a
disagreement and its disappearance.

## D5. Why suppression is of the item and not of the finding

The cheap implementation drops an adjudicated pair before it reaches the report.
It is refused. The run's corroboration output is where an auditor can see what
this mechanism is doing; a pair that disappears from it the moment somebody wrote
an explanation is a mechanism nobody can check, and the explanation is the part
most worth checking. Marked-and-present costs one field.
