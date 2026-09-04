---
slug: verify-meta-spark-weights-pending-status
type: verify
date: 2026-09-03
expires: 2026-10-15
origin: review of job j-20260903-12
noted_by: the reviewer of job j-20260903-12 (claude-code-opus)
proposed_by_job: j-20260903-12
proposed_by_type: entry
---
A verify job that re-checks, against Meta's own channels rather than a third-party catalogue, whether the Muse Spark flagship weights have moved from "pending". Specifically: Meta's newsroom/announcement pages for Spark 1.2 and 1.3, the huggingface.co/meta-models org listing, and any Meta license text named by "Meta license (weights pending)" — then update org/meta-superintelligence-labs' flagship_weights and flagship_weights_listing facts to whichever state the primary sources support, or record that Meta has said nothing since April 2026.

## Evidence

Reviewing this job, the corpus's description of Meta's flagship licensing now rests on one third-party badge. Fetched 2026-09-03: llm-releases.com/models/muse-spark-1-2 and /muse-spark-1-3 both read "License Open weights · Meta license (weights pending) / Weights Not released", while llm-releases.com/changelog's Aug 10 item calls Glimmer "its first open-weight model after the closed Muse Spark line" — the same source contradicting itself. about.fb.com/news/2026/04/introducing-muse- spark-meta-superintelligence-labs/ (fetched 2026-09-03) contains no occurrence of the word "weights" at all; its only relevant sentence is "we hope to open-source future versions of the model". No Meta-side source in the corpus confirms or denies the pending state.

## Origin

Transcribed by the loop from the verdict record for job j-20260903-12 (`j-20260903-12.pass2.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.


---

## Consumed: this candidate produced merged work

- date: 2026-09-03
- job: j-20260903-14 (verify)
- merged as: `442d9f6eb182aa57fae07d73c1754ab73ef1c189`
- produced: `content/wiki/org/meta-superintelligence-labs.md`
- was: `verify-meta-spark-weights-pending-status.md` (slug `verify-meta-spark-weights-pending-status`)

A proposal that has been written, reviewed and merged is finished work. It was left selectable, and the run after the first post selected it again — which would have rewritten the same piece on every run until its `expires:` arrived. Retiring it is mechanical: no model was invoked and no inference was spent.

`data/proposals/consumed/` is a record, never a block. This slug does not feed the rejection index, so the subject may be proposed again — being written about once is not a reason it may never be written about again.
