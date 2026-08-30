# loop — delta for make-the-blog-worth-sending

One requirement is modified: work source 3 — proposals, "the only
model-originated source" — gains its producing side, which the founding
change specified as three MAYs and never tasked (`addictedtoai-6ov`: the
consuming side is complete and tested; `loop/lib/proposals.mjs` exports
four functions and all four are readers). The additions are the last
paragraph of the requirement and its two new scenarios; everything above
them is restated unchanged.

## MODIFIED Requirements

### Requirement: Work comes from three sources and cannot self-amplify

Jobs are selected from, in priority order:

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
   kind of work), a one-paragraph summary, and the evidence that prompted
   it. Proposals come into existence three ways: a Desk run MAY end by
   writing at most one proposal as a side-output of whatever it noticed; a
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

- Every brief the loop assembles SHALL state that the job MAY end by
  writing at most one proposal file to `data/proposals/`, restating the
  front-matter contract above — a self-contained brief is the only channel
  a job has, so an untold job cannot know.
- The review brief SHALL ask the reviewer to note a proposal where its
  review surfaced one, and the loop SHALL transcribe a noted proposal into
  `data/proposals/` as a well-formed proposal file naming the reviewing
  job as its origin.
- "At most one" SHALL be a mechanism: where a job's merged branch adds
  more than one proposal file, the loop SHALL keep exactly one,
  deterministically chosen, and discard the rest with a note naming them —
  never by asking. A proposal on a branch that is discarded dies with the
  branch: ideas do not outlive the rejection of the work that produced
  them.
- At merge, the loop SHALL stamp the proposing job's type onto each kept
  proposal, overwriting any value the executor wrote, and a proposal whose
  stamped origin type equals the type it proposes SHALL be auto-discarded
  on the same terms as a rejected-slug duplicate — with a pointer to this
  rule, spending no inference. Cross-type noticing (an `interpret` job
  proposing a synthesis `post`) is the designed path; a job proposing more
  of its own kind is this requirement's title, violated. The maintainer's
  route is untouched: a file he drops in has no proposing job, so the rule
  cannot apply to it.

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
  synthesis `post`, with slug, summary and evidence
- **THEN** the proposal is stamped with the interpret job's type, lands in
  `data/proposals/`, and is selectable once it has cooled 3 days

#### Scenario: A job cannot propose more of itself

- **WHEN** a `post` job's merged branch includes a proposal whose type is
  `post`
- **THEN** the proposal is auto-discarded with a pointer to the
  self-amplification rule, spending no inference, and the job's merge is
  otherwise unaffected
