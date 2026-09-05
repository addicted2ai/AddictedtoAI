---
date: 2026-09-04
slug: retire-carried-findings-satisfied-by-downstream-work
type: machinery
summary: >
  A carried finding retires only when the fixing job's own diff deletes the
  file that names it — `pulse/lib/queue.mjs` says so in its own comment on the
  `carried-finding` rank: "there is no automatic way to tell a fixed carried
  finding from an unfixed one". That holds when the fixing job is the repair
  job dispatched for the finding. It fails whenever the remedy lands in some
  OTHER job's diff, because that job is never told the carry file exists and
  has no reason to delete it. The finding then survives its own fix and is
  dispatched later as a repair whose work is already done. The job would make
  a carried finding whose subject is a proposal check the proposal's outcome
  before dispatching: a proposal in `data/proposals/consumed/` records the
  artefact it produced, so the queue can name that artefact in the brief, or
  state that the finding may already be satisfied there and that confirming so
  is the repair. It is deliberately NOT auto-retirement — deciding a finding is
  satisfied is a judgment about prose that belongs to a job with a reviewer,
  not to the model-free engine.
evidence: >
  Measured on this branch (`job/j-20260904-46`), whose whole outcome was two
  carried findings that were already fixed before the repair job for them
  started. `data/carried/j-20260904-02-carry-1.md` and `-carry-2.md` were
  written by `3dda1b9 job j-20260904-02: records (done)` against the proposal
  `data/proposals/gpt-6-astra-release-system-card.md`. The next job on that
  docket, `9d81816 job j-20260904-04: post`, satisfied both in the post it
  produced: `content/blog/openai-gpt-6-astra-system-card.md:17` quotes the
  closing sentence of `content/blog/openai-astra-critical-designation.md:58`
  in full, and `:44` prints "FrontierMath Tier 4 (v2) is 97.6%, while the
  page's prose says Astra 'saturates FrontierMath Tier 4 with a 98% score'".
  That job's own reviewer recorded both as handled
  (`data/reviews/j-20260904-04.md:31-33` and `:186-188`), and a later job's
  reviewer confirmed 97.6% is a genuine `<table>` row by parsing the release
  page's table elements (`data/reviews/j-20260904-13.md:67`). Neither carry
  file was deleted by that diff, so both items stayed in
  `data/derived/queue.json` and were dispatched as this repair. The adjacent
  proposal `resolve-moved-subjects-when-a-carried-finding-becomes-a-job`
  (2026-09-02) covers the neighbouring half of this — the brief naming a path
  that moved to `consumed/` — and is not the same remedy: resolving the path
  alone still hands the runner a docket to re-read rather than the produced
  artefact to check.
---

# A finding can outlive its own fix

The queue's rank comment for `carried-finding` is honest about the mechanism
and about its one blind spot:

> Ranked deliberately LOW ... because there is no automatic way to tell a
> fixed carried finding from an unfixed one (the fixing job's own diff has to
> delete the file that names it).

The low rank protects against a *stuck* finding dominating the queue. It does
nothing about a *satisfied* one, and satisfied-but-standing is the more
expensive case, because it does not look stuck. It looks like ordinary work.
It is dispatched, a runner is paid for an invocation, and the finding is
retired by a diff that changes no content at all — which is also the diff
shape hardest for a reviewer to distinguish from clearing a guardrail without
fixing anything.

The blind spot is structural, not accidental. A finding carried against a
proposal is a constraint on the post that proposal will produce — both of
these said so in their own words, "before the post prints either" and "any
post written from this docket should quote the whole sentence". The job that
can satisfy such a finding is therefore never the job the finding is filed
against, and is never told the file exists.

## What the job would change

When `carriedFindingItems` surfaces a finding whose `subject:` is a path under
`data/proposals/`, resolve the proposal's current state before the item
becomes a brief:

- **Consumed** — the archive footer already records `produced:` and the merge
  sha. Put that artefact in the brief as the thing to check, and say plainly
  that the finding may already be satisfied there, so confirming it and
  retiring the file is a legitimate and expected outcome rather than something
  the runner has to talk itself into.
- **Dropped or rejected** — the docket will never produce a post, so the
  finding's premise is gone. Say that in the brief.
- **Still live** — today's behaviour, unchanged.

The engine must not decide satisfaction itself. Reading a post and judging
whether it quotes a sentence completely enough is exactly the prose judgment
the Pulse is forbidden to make, and the wrong answer here silently deletes a
real finding. Naming the artefact is mechanical; judging it is the job's.
