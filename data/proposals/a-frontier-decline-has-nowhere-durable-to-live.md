---
date: 2026-09-06
slug: a-frontier-decline-has-nowhere-durable-to-live
type: machinery
summary: >
  Give a frontier decline a machine-readable home with a refile condition, the
  way a reviewer's small finding already gets one in `data/carried/`. Today a
  post judged against F1-F5 and declined leaves its reasoning in whatever
  evidence file the judging job happened to write, and nothing ever revisits it.
  The job would define the record (post path, criterion considered, why it
  failed, and the condition that would change the answer), have the backfill's
  ten declines transcribed into it, and teach `pulse/lib/queue.mjs` to raise a
  queue item when a stated condition clears - starting with the one condition
  that is already mechanically checkable, "this post declined F3 only because
  its organisation has no `content/wiki/org/` entry, and now it has one".
evidence: >
  Measured in this repository on 2026-09-06 while doing the DESK-ORDER-001 §1
  backfill (job j-20260906-17, directive line 114, beads addictedtoai-9c9t).
  Ten of the sixteen posts under `content/blog/` were declined; the reasoning
  for all ten now lives only in
  `data/reviews/evidence/verify-frontier-backfill-blog-posts.md`, which is a
  merged job's evidence file. One of them is not a permanent decline:
  `content/blog/ifm-k2-horizon-open-fleet.md` fails F3's first branch solely
  because the Institute of Foundation Models has no `content/wiki/org/` entry -
  confirmed by `tools/check-frontier-backfill.mjs`, which reads the 24 entries
  present, and by `grep -ric "mbzuai\|ifm-ai\|\"ifm\"\|k2-horizon"` over
  `data/derived/` and `content/wiki/`, whose only hit is this post indexing
  itself in `search-index.json`. That entry is already proposed
  (`data/proposals/ifm-k2-horizon-wiki-entries.md`, filed 2026-09-04 by
  j-20260904-05), so the precondition is expected to clear - and when it does,
  nothing in the machinery will notice that a decline was made under an
  assumption that no longer holds. DESK-ORDER-001 §1 already asks the SCOUT for
  a declines record ("the scout's 'why passed' record shows frontier candidates
  declined"); there is no equivalent for a post that already exists.
proposed_by_job: j-20260906-17
proposed_by_type: verify
---

# A frontier decline is a judgment with an expiry, filed where nothing can read it

The frontier flag is a judgment about a post, and this repository already knows
what happens to a judgment with no durable home: `CLAUDE.md` states it as a test
— *if this thought exists only inside something that is finished, it is already
lost* — and names a closed issue, a merged commit and a sent report as three
things that are finished. A merged job's evidence file is a fourth.

That is where the ten declines from the DESK-ORDER-001 §1 backfill sit today.
They are written out in full, each with the criterion it failed and why, because
the directive asked for them by name. They are also, structurally, a dead end:
nothing loads that file, nothing indexes it, and no future run will be told that
`content/blog/ifm-k2-horizon-open-fleet.md` was declined for a reason with a
known expiry date.

## The distinction that makes this worth machinery

Nine of the ten declines are permanent. An RFI does not become an access change;
a court filing does not become a capability; a $1B subsidy does not become a new
ability. Those need no mechanism — they need a record a human can read, which
they have.

The tenth is different in kind. K2 Horizon fails F3's first branch on **one
fact about this repository**, not one fact about the world: the site does not
yet cover IFM. K21 makes that fact editorial and changeable, §2 of the same
order makes changing it a priority, and a proposal to change it has been sitting
in `data/proposals/` since 2026-09-04. The decline is correct today and will
quietly stop being correct, with nobody watching.

That is the class this proposal is about — a decline whose stated condition is
checkable by the machinery that already runs every day.

## What the job would do

1. **Define the record.** A small file per decline, loaded like `data/carried/`
   is: the post path, the criterion considered, the sentence explaining the
   failure, and an optional `refile_when` naming a condition. No new content
   kind, no route, nothing rendered — this is a work-queue input, not a
   surface.
2. **Transcribe the ten.** The backfill's declines, verbatim, so the first
   population of the store is the one that already exists rather than a
   fixture.
3. **Teach the queue one condition.** `pulse/lib/queue.mjs` already reads
   `data/carried/` into the derived queue; the one condition worth implementing
   first is the one that is a directory listing —
   `org_entry_exists: <slug>` — because the check is `existsSync` and its truth
   value is not a matter of opinion. A condition the Pulse cannot evaluate
   deterministically should not be expressible: this store must not become a
   place where a model re-judges a decline on a hunch.
4. **Leave the judgment where it belongs.** Raising a queue item is not
   re-flagging a post. The item's outcome is a fresh editorial pass through
   review, exactly as this backfill was, because tagging a post is a review
   event (`specs/blog`) and no mechanism may buy its way past that.

## Why it is not the scout's declines record

DESK-ORDER-001 §1 already requires the scout to show frontier candidates it
declined. That covers stories that never became posts. This covers **posts that
exist**, judged after the fact, which is the whole shape of a backfill — and
backfills recur: every widening of `content/wiki/org/` under §2 changes who
counts as a covered organisation, which is an input to F3 on every post already
published.

## The honest case against

Ten records and one checkable condition is a small return for a new store, and
the alternative is cheap: a human re-runs the backfill judgment when coverage
widens. That alternative is exactly the one this repository has watched fail
before — the deferral that lives in a finished artefact and is found by someone
who already suspected it existed. The counter-argument is real and is recorded
here so the reviewer of this proposal can weigh it rather than reconstruct it.
