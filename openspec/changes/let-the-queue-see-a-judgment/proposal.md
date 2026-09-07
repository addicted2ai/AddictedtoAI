# Let the queue see a judgment

## What was re-measured before designing anything

Both beads are older than the tree they describe — `addictedtoai-ccky` was
written 2026-08-31 and `addictedtoai-cct` on 2026-08-29, both last triaged
2026-09-04. Everything below was re-read or re-run in this worktree
(`D:/addictedtoai-worktrees/impl-spec-pulse`, cut from `main` at `e76fb30`) on
2026-09-06.

**Still true, and re-measured rather than assumed.**

- `pulse/lib/queue.mjs` contains the string `mismatched` **zero** times
  (`grep -c`), imports nothing from `lib/reviews.mjs`, and its `RANKS` table
  carries no review-state reason. The only file under `pulse/` that imports
  `lib/reviews.mjs` at all is `pulse/tests/domain-seeds.test.mjs:40` — a test.
- `lib/reviews.mjs` still exposes exactly one join (`reviewJoin`, `:489`) and one
  four-state vocabulary (`REVIEW_STATES`, `:243`: `recorded`, `mismatched`,
  `unbound`, `missing`), and `mismatchProblems` (`:533`) is still commented
  "MISMATCHED ONLY".
- `pulse/lib/corroboration.mjs`'s header still states "**It never adjudicates**"
  (`:22`) and the module still exports no acknowledgement, adjudication or
  suppression path — `normalise`, `magnitude`, `agree`, `resolveSide`,
  `declaredPairs`, `corroborationFindings`, and nothing else.
- `pulse/lib/queue.mjs` still ranks `corroboration` at 68, above every timer in
  the table, and mints one item per disagreeing pair on every run inside the
  `for (const c of corroborations)` loop. `QUEUE_CAP` is 50 (`:45`).
- **There are two corpora and they are not interchangeable**, re-read on
  2026-09-06 after a first draft of the design assumed one. `pulse/run.mjs:129`
  holds `readCorpus(root)` from `pulse/lib/corpus.mjs`, returning
  `{ entries, tutorials, listings, prose, unreadable }` (`:212`).
  `reviewablePieces(corpus)` reads `corpus.entry`, `.learn`, `.tutorial`,
  `.post`, `.delta`, `.claim` (`lib/reviews.mjs:298–307`) — the shape
  `lib/corpus.mjs`'s async `loadCorpus({ contentRoot, diags })` returns, which is
  what `scripts/verify-launch.mjs:823` and `lib/build-content.mjs:125` pass to
  `reviewJoin`. So the producer loads the build corpus rather than reusing the
  Pulse's, and that is what puts the queue on the gate's own input instead of an
  approximation of it (design D3).

**Changed since triage, in ways that matter.**

- `QUEUE_PRODUCIBLE_TYPES` is at `pulse/lib/queue.mjs:88` (triage said
  `:87–94`) and reads `education`, `entry`, `interpret`, `repair`, `scout`,
  `verify`. **`verify` is already on it**, so routing a stale approval to a
  `verify` job needs no amendment to `Which job types the queue may produce is a
  stated decision` and this change does not modify that requirement.
- **`mismatched` is no longer zero.** The triage note of 2026-09-04 recorded
  "recorded 33 / unbound 131 / mismatched 0 / missing 0 of 164". Re-measured on
  2026-09-06 over `data/reviews/` and the files those records name: 357 review
  records, 135 record→path bindings carrying a `reviewed:` hash across 65
  distinct paths, of which — under a newest-record-wins reading — 58 match the
  file's current reviewed hash and **7 do not**. That number is not the launch
  gate's own: the real join claims records greedily, honours `subject:` lists,
  and reports supersession, and this stream runs only the two spec checks and
  did not run `verify-launch`. It is enough for the only thing it is used for
  here — the condition `addictedtoai-ccky` describes is **reachable in the tree
  today with live candidates in it**, not a hypothetical that grows later. The
  bead predicted the surface would grow with every reviewed job; measured over
  five days, bound pairs went from 4 recorded (2026-08-31) to 135, and the
  distinct paths from a handful to 65.
- **No entry in the corpus declares a `corroborates` pair.** `grep -rl` over
  `content/` returns **0 files**. `addictedtoai-cct` argues that the mechanism is
  safe only on pairs that already agree and therefore useless on the pairs that
  motivated it; the corpus has since voted with its feet. The check runs on every
  Pulse run over an empty set.

## The findings

**They are the same defect twice, facing opposite ways.** The derived queue reads
the world (snapshots, links, timers) and the corpus's own declarations
(curricula, `feeds:`, `corroborates:`). It cannot read a **judgment** about
either. So:

- a judgment that has **stopped applying** — a review verdict bound to bytes that
  have since changed — fails the launch gate and cannot become work. The gate is
  correct, the finding is correct, and the only route to green is a person
  noticing and hand-writing a directive. `addictedtoai-ccky` names it as the same
  shape as `addictedtoai-2bo` one layer up: a correct finding with no route into
  work.
- a judgment that has **already been made** — two sources compared, adjudicated,
  the difference explained — cannot be recorded, so the item returns at rank 68
  on every run for ever. `pulse/lib/queue.mjs`'s own reference-drift comment says
  that a permanent top-of-queue item is what halted the loop on
  `addictedtoai-5hn`, and that reference-drift was ranked below the dead-resource
  repairs specifically to avoid becoming it.

Both fixes are the same shape and it is a shape this spec has already used twice:
**a committed record the recomputation reads**, so that nothing accumulates in
the queue itself. `A carried finding is queue state, and its file is the state`
and `A withdrawn feed row is recorded once and retires when the site answers it`
are the precedents, and the second one is also the warning — it exists because
retiring the wrong class by the wrong mechanism makes a finding immortal.

## The decision

**One producer for `mismatched`, and no store behind it.** The Pulse derives one
`verify` item per piece whose review state is `mismatched`, reading the state
from the one join in `lib/reviews.mjs` and computing no second hash. It retires
by recomputation: a newer record whose hash matches removes it. It needs no
durable record because — unlike a withdrawn feed row, whose cause is the world's
continuing absence and therefore permanent — its cause is a difference between
two files in this repository, and the job that fixes it changes one of them.
Three of `addictedtoai-ccky`'s four open questions are settled in the delta with
their reasons; the fourth is settled here.

- **Job type: `verify`.** The work is establishing that an approved surface still
  says what was approved — a check against a record, not an authoring pass. It is
  already a producible type. `entry` would land it in the authoring budget
  category and shed it with authoring, on a condition that blocks every publish.
- **Rank: 69 — above the corroboration disagreement (68), below the two findings
  about a page that is already visibly wrong (`tutorial-demoted` 70,
  `reference-drift` 72), and below every dead-resource finding
  (`listing-could-not-verify` 75 and up).** Re-measured in `pulse/lib/queue.mjs`
  on 2026-09-06: those four constants are 68, 70, 72 and 75, so the band between
  "above corroboration" and "below dead resources" is **not** empty and naming
  only its two outer edges would let an implementer pick 73 and invert an
  ordering the table already declares. A lapsed approval is worse than two
  sources disagreeing about a number and less urgent than a page whose reader can
  see the defect or a resource that is gone.
- **`unbound` produces nothing, and the `no` is written into the spec**, which is
  what the bead asked for. 135 bound pairs today against a corpus of hundreds of
  records: minting an item per unbound record would consume the whole 50-item cap
  with work nobody asked for, on a state that fails nothing.
- **`missing` is not addressed here.** It is the opposite finding — unreviewed
  rather than reviewed-then-changed — and inventing its producer inside this
  change would be scope no bead asked for.

**An adjudication record for a declared corroboration, pinning both values.** A
disagreement may be settled by a reviewed job that writes a record naming the
pair, the date, the resolution in its own words, **and both resolved values as
they stood**. The Pulse suppresses the item exactly when the record's pinned
values equal today's resolved ones, and produces it again — naming the
adjudication it supersedes — the moment either moves. The engine writes no such
record and deletes none: it still never adjudicates.

**Suppression is of the item, never of the finding.** An adjudicated pair stays
in the run's computed corroboration output, marked, with both pinned and both
current values. A disagreement that vanishes from the data the moment somebody
explains it cannot be audited, and the explanation is the part most worth
auditing.

## What this change deliberately does not do

- **It does not add a front-matter field.** `addictedtoai-cct` sketches an
  optional `corroboration_note:` on the fact as one option. It is refused for a
  measurable reason: the pinned value on the **feed-bound** side is not the
  entry's to hold — it comes from a snapshot — so a note in front matter either
  omits half the pin or duplicates feed data into the corpus, which is the exact
  rot `Volatile values are bound, never typed` exists to prevent. The record
  lives under the data root, with the other durable queue state. No change to
  `lib/schema.mjs` and no delta on `specs/wiki`.
- **It does not open the catalog-row disclosure question** that `cct` inherited
  from `addictedtoai-473` — making a known price/parameter split visible on a
  catalog row. That needs an optional note on a **cited fact**, which is the
  schema decision this change just declined to take. It stays open on `cct`.
- **It does not amend `Which job types the queue may produce is a stated
  decision`.** `verify` is already on the list; re-measured above.
- **It does not touch `specs/review`.** Nothing here changes how a review record
  is written, hashed, or what `reviewedSurface` covers. The queue becomes a
  *reader* of the join, and readers are not the join's owner.
- **It does not declare any `corroborates` pair.** Declaring the DeepSeek pair
  `addictedtoai-473` asked about is content work, and `cct`'s second and
  independent reason not to declare that particular one — a tensor total is not a
  parameter count — is unaffected by anything here.
- **It does not decide whether content edits made outside the Desk should be
  possible at all.** `addictedtoai-ccky`'s closing note raises it and says it
  belongs in its own issue; this change fixes the consequence, not the cause.

## Beads this change serves

- `addictedtoai-ccky` — the queue producer for `mismatched`, with all four of its
  open questions answered in writing.
- `addictedtoai-cct` — the adjudication record, the automatic revival on a moved
  value, and the visibility rule that keeps suppression from being erasure.
