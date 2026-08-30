# pulse — delta for make-the-blog-worth-sending

The Pulse gains one derivation: noteworthy events become expiring `post`
candidates in the derived queue. It gains no judgment: it never scores an
event's interest, never invokes a model, and the worthiness question stays
in the Desk job, where a `blocked: not worth a note` outcome is a success.

## ADDED Requirements

### Requirement: Noteworthy events become post candidates, and candidates expire

From the diff history's trailing 7 days, the Pulse SHALL derive **post
candidates**: deterministic groups of `data/changes.jsonl` event lines of
kinds `release`, `arrival`, `retirement`, and `field_change` on material
fields (price, licence, status). Grouping SHALL be a deterministic function
of recorded fields that puts same-day related events in one candidate
(several ids retired by one vendor on one day are one story, not several);
annotation lines are never candidates — they are Desk judgment, not world
events.

- A candidate SHALL be suppressed while any published post's declared
  coverage (`covers:` front matter — see `blog`) includes any of the
  group's lines, and SHALL leave the queue when covered or when its newest
  line ages past 7 days. An uncovered candidate expiring is a normal
  outcome, never a failure or a backlog: news the editorial bar declined
  decays instead of accumulating.
- Candidates SHALL enter the derived queue as items proposing `post` jobs,
  ranked below every repair and verify item — the site's truth outranks new
  writing — and each item SHALL carry the group's lines (dates, keys, old
  and new values, source URLs, excerpts) so the job begins with its
  evidence in hand.
- The derivation SHALL preserve the queue's standing properties: recomputed
  from current state every run, no identity, no history, byte-identical on
  unchanged state.

#### Scenario: A covered event stops being a candidate

- **WHEN** a note publishes declaring `covers:` for a retirement group's
  lines
- **THEN** the next Pulse run's queue contains no candidate for that group,
  with no close action by anyone

#### Scenario: Declined news decays

- **WHEN** an event group's newest line is 8 days old and no post covers it
- **THEN** the queue contains no candidate for it, and nothing anywhere
  records that as a failure

#### Scenario: Same-day related events are one story

- **WHEN** one vendor's three model ids show `retirement` lines on the same
  date from the same source
- **THEN** the queue holds exactly one post candidate carrying all three
  lines

#### Scenario: The Pulse still never judges

- **WHEN** the candidate derivation runs over any state
- **THEN** no model is invoked and no candidate carries any score or
  ranking beyond the fixed rank constant — which events are worth a note is
  decided by the job and the review gate, never here

## MODIFIED Requirements

### Requirement: The work queue is derived, never accumulated

The Pulse SHALL recompute the loop's work queue from current state on every
run: overdue facts, overdue tutorials, failed verifications, broken links,
want-demand eligible mints, suspect sources, refusing sources, vanished
feed rows, material changes on price/licence/status fields from the
trailing 14 days that lack an interpretation annotation (the source
`interpret` jobs draw from — see `loop`), and uncovered post candidates
from the trailing 7 days (see the post-candidates requirement). The queue
is a ranked snapshot (a generated file), not a ledger: nothing is ever
"filed" into it, it has no history, and it cannot backlog — an item leaves
the queue the moment the underlying state is fixed, and the queue's size is
bounded by the size of the site, not by time passing. Discovered work that
needs human judgment or does not map to site state (a bug, an idea, a
follow-up) goes to beads (`bd`) instead, filed by whoever discovers it —
the two never mirror each other.

#### Scenario: Fixing the state empties the queue

- **WHEN** an overdue fact is re-verified
- **THEN** the next Pulse run's queue no longer contains it, with no
  close/archive action by anyone

#### Scenario: The queue cannot grow monotonically

- **WHEN** the Pulse runs on a site whose state has not changed
- **THEN** the queue is identical to the previous run's — recomputation
  produces no accumulation
