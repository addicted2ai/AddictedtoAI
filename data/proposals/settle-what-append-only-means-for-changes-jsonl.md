---
slug: settle-what-append-only-means-for-changes-jsonl
type: machinery
date: 2026-09-04
origin: review of job j-20260904-32
noted_by: the reviewer of job j-20260904-32 (claude-code-opus)
proposed_by_job: j-20260904-32
proposed_by_type: repair
---
`openspec/specs/loop/spec.md:31` states, in the `interpret` bullet, that "`data/changes.jsonl` stays append-only: the annotation is a new line keyed to the change it interprets". Read as a property of the file, that forbids what two approved repair jobs did within twenty-four hours: rewrite an existing annotation line in place. Read as a constraint on `interpret` — an annotation must not mutate the mechanical row it comments on — both jobs are clean. A machinery job should make the spec say which of those it means, naming the permitted mutation explicitly (a `kind: "annotation"` line's own `text`, by a repair clearing a carried finding, with `key`, `date` and `job` untouched) and restating the prohibition that actually matters: no line produced by the Pulse from a source diff is ever edited or deleted. Without that, a future reviewer applying the sentence literally rejects correct work for `spec-violation`, and a future repair job declines a fix it should make.

## Evidence

This diff replaces the `text` of the annotation at data/changes.jsonl:164 in place (one `-`, one `+`); commit dffa630 ("job j-20260904-27 (repair): clear the 3 carried findings on the GLM 4.7 Flash successor annotation") did the same to the z-ai/glm-4.7-flash status annotation and was approved and merged on 2026-09-04. Meanwhile commit ed3f53a (j-20260904-25) corrected a different annotation by APPENDING a follow-up line, so merged practice already contains both shapes with no written rule separating them. The spec sentence is unchanged from the 2026-08-30 archive, i.e. it predates carried-finding repairs on annotations existing at all.

## Origin

Transcribed by the loop from the verdict record for job j-20260904-32 (`j-20260904-32.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
