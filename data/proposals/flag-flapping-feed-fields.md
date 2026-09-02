---
slug: flag-flapping-feed-fields
type: machinery
date: 2026-09-02
origin: review of job j-20260902-02
noted_by: the reviewer of job j-20260902-02 (claude-code-opus)
proposed_by_job: j-20260902-02
proposed_by_type: interpret
---
Teach the Pulse's diff step to recognise when a material field returns to a value it already held inside a short trailing window, and mark that change record as a flap (a boolean, or the date of the prior opposite change) rather than emitting it as an ordinary field_change. The derived queue would then rank a flapping signal below a first-time one, and the changed feed could render "reverted to its 2026-08-29 value" instead of presenting the round trip as two independent events. Nothing about the derivation rule changes; only the record gains the fact that it has seen this transition before.

## Evidence

Verified while reviewing this diff: data/changes.jsonl:86 records z-ai/glm-4.5v moving deprecated -> active on 2026-08-29, line 90 annotates it as "a metadata correction on an otherwise unchanged row", and line 152 records the same row moving active -> deprecated on 2026-09-02 from the same expiration_date field returning to 2026-12-31 (confirmed against data/sources/openrouter-models/{previous,latest}.json: null on 2026-09-01, "2026-12-31" on 2026-09-02). Two interpret jobs have now been spent on one oscillating field on one row, and neither change record carries any hint that the other exists — the connection survives only because a human author happened to go looking for it.

## Origin

Transcribed by the loop from the verdict record for job j-20260902-02 (`j-20260902-02.pass2.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
