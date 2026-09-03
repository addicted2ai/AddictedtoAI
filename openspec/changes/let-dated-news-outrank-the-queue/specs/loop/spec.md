# loop — delta for let-dated-news-outrank-the-queue

The three work sources are unchanged, and so is every rule about how a
proposal comes into existence, cools, is suppressed or is swept. What changes
is one precedence: an expiring proposal is reached before the derived queue.

Measured 2026-09-02 (addictedtoai-mtnk). On 2026-09-01 twenty-three jobs ran
and not one was a `post`; the derived queue never emptied, and news is source
3. Reviewers file roughly one carried finding per job into source 2 — 37 filed
and 35 retired over three days, 76% of them landing on a file already carried
— so source 2 replenishes itself and source 3 is reached only in the gaps. At
the time of writing, three `post` proposals carrying expiry dates of
2026-09-08 and 2026-09-09 are selectable and losing to that queue. If they are
not written by those dates they are swept to `dropped/` unwritten, which is
how an ordering preference becomes deleted news on a clock.

## MODIFIED Requirements

### Requirement: Work comes from three sources and cannot self-amplify

Jobs are selected from, in priority order — with one stated exception,
below, for evidence that expires:

1. **The maintainer's directives** — a plain file (`DIRECTIVES.md`) the
   maintainer edits; always selectable first. Completion semantics: on
   completing a directive's job, the loop SHALL append a
   `[done <date> <job-id>]` marker to that directive's line and SHALL skip
   directives carrying one; removing finished lines is the maintainer's,
   at leisure. A directive is never silently re-run.
2. **The derived queue** — the Pulse's recomputed snapshot of what the site
   currently needs (see `pulse`). This source cannot backlog by construction.
3. **Proposals** — the only model-originated source. A proposal is one
   markdown file in `data/proposals/`, with front matter declaring: a date,
   a kebab-case `slug` naming the idea, the job type it proposes (from the
   closed list — a proposal proposes a job of an existing type, never a new
   kind of work), a one-paragraph summary, the evidence that prompted
   it, and optionally an `expires:` date for evidence that decays.
   Proposals come into existence three ways: a Desk run MAY end by
   writing at most one proposal as a side-output of whatever it noticed
   (the `scout` job is the exception: filing candidates is its outcome,
   governed by its own requirement and its own mechanical cap); a
   reviewer MAY note one in its verdict record (the loop transcribes it);
   the maintainer MAY drop one in directly. A proposal SHALL cool for at
   least 3 days (file age) before selection. A rejected proposal moves to
   `data/proposals/rejected/` with the rejection reason appended — that
   directory is the rejection index. Duplicate suppression is deterministic
   and exact: a new proposal whose `slug` equals a rejected proposal's
   `slug` SHALL be auto-discarded with a pointer to the earlier reason,
   spending no inference. That is the whole automatic mechanism —
   differently-worded resubmissions of a rejected idea are caught by the
   reviewer (the rejection index travels in the review checklist), not by
   fuzzy matching, because fuzzy matching is guessing.

"No qualifying job — do nothing" is a normal, healthy outcome and SHALL be
treated as such: a run that finds nothing worth doing ends without
manufacturing work.

**The producing side of source 3 is wired, not merely permitted:**

- Every brief the loop assembles SHALL state the proposal rule that binds
  its job — at most one, or the scout's own — restating the front-matter
  contract above, because a self-contained brief is the only channel a job
  has and an untold job cannot know.
- The review brief SHALL ask the reviewer to note a proposal where its
  review surfaced one, and the loop SHALL transcribe a noted proposal into
  `data/proposals/` as a well-formed proposal file naming the reviewing
  job as its origin.
- The caps SHALL be mechanisms: where a merged branch adds more proposal
  files than its job's rule allows, the loop SHALL keep the allowed number
  — by the job's own stated ranking where one exists, else by filename —
  and discard the rest with a note naming them. A proposal on a branch
  that is discarded dies with the branch: ideas do not outlive the
  rejection of the work that produced them.
- At merge, the loop SHALL stamp the proposing job's type onto each kept
  proposal, overwriting any value the executor wrote, and a proposal whose
  stamped origin type equals the type it proposes SHALL be auto-discarded
  on the same terms as a rejected-slug duplicate — with a pointer to this
  rule, spending no inference. The guard closes the tight loop, not every
  loop: a two-type cycle (`post` → `interpret` → `post`) remains possible,
  bounded by cooling at each hop and caught, where it is a re-tread, by
  the reviewer holding the rejection index. Cross-type noticing — an
  `interpret` job that has read three weeks of licence churn proposing a
  synthesis `post` — is the designed path. The maintainer's route is
  untouched: a file he drops in has no proposing job, so the rule cannot
  apply to it.
- A proposal declaring `expires:` SHALL be selectable without the 3-day
  cooling and SHALL NOT be selectable after its expiry; at expiry, an
  unselected expiring proposal SHALL be swept to `data/proposals/dropped/`
  mechanically, with a note naming the expiry. Cooling filters ideas by
  whether they survive three days; an expiry filters evidence by the date
  it stops being news — both are time-based honesty checks, and a
  candidate carries whichever one fits its evidence. No backlog carries
  forward: the sweep is what keeps the candidate directory from becoming
  the ten-weeks-of-backlog queue the predecessor's author track named as
  its own bottleneck.
- An expiring proposal SHALL outrank the derived queue: it is selected
  before source 2 and after the maintainer's directives. The reason is that
  an expiry is a **deadline the site set itself**, and source 2 has none —
  the derived queue is recomputed from current state, so an item it drops
  today it recomputes tomorrow, while expiring evidence that is not written
  before its date is swept and gone. Ordering the deadline-free source ahead
  of the deadline-bearing one spends the only thing that cannot be recovered.
  This SHALL NOT extend to proposals generally: a proposal with no `expires:`
  stays at source 3, behind the queue, because without a deadline there is
  nothing to preempt for. The upkeep floor and the new-writing ceiling are
  unchanged and still bind, so this reorders **which** work is reached first
  and never how much of each kind may run — an expiring proposal that would
  breach the new-writing ceiling is still refused.

- `data/proposals/dropped/` is a **record, never a block**: unlike
  `rejected/`, it SHALL NOT feed automatic slug suppression, so a story
  declined today may be refiled when its stated refile condition arrives.

#### Scenario: An empty run is not a failure

- **WHEN** the directives file is empty, the derived queue has no item above
  its floor, and no proposal is ripe
- **THEN** the run records "nothing qualified" and ends, and nothing anywhere
  treats that as an error

#### Scenario: A rejected idea stays rejected

- **WHEN** a new proposal file carries the same `slug` as a proposal in
  `data/proposals/rejected/`
- **THEN** it is discarded automatically with a pointer to the recorded
  rejection reason, spending no inference

#### Scenario: A job's noticing becomes ripe work

- **WHEN** an `interpret` job's merged branch includes one proposal for a
  synthesis `post`, with slug, summary and evidence and no `expires:`
- **THEN** the proposal is stamped with the interpret job's type, lands in
  `data/proposals/`, and is selectable once it has cooled 3 days

#### Scenario: A job cannot propose more of itself

- **WHEN** a `post` job's merged branch includes a proposal whose type is
  `post`
- **THEN** the proposal is auto-discarded with a pointer to the
  self-amplification rule, spending no inference, and the job's merge is
  otherwise unaffected

#### Scenario: Expired news is swept, not queued

- **WHEN** a scout-filed candidate's `expires:` date passes with the
  candidate unselected
- **THEN** the next run sweeps it to `data/proposals/dropped/` with a note
  naming the expiry, and nothing anywhere treats that as a failure

#### Scenario: Dated news is written before routine upkeep

- **WHEN** the derived queue holds a repair item and a ripe proposal carrying
  an `expires:` date is also selectable
- **THEN** the expiring proposal is selected first, and the queue item is
  selected on a later run — the queue recomputes it, the expiry does not

#### Scenario: A proposal without an expiry does not jump the queue

- **WHEN** the derived queue holds a repair item and a ripe proposal carrying
  no `expires:` is also selectable
- **THEN** the queue item is selected first, exactly as before
