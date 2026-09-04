---
slug: detect-self-overlapping-exclusive-aliases
type: machinery
date: 2026-09-04
origin: review of job j-20260904-06
noted_by: the reviewer of job j-20260904-06 (claude-code-opus)
proposed_by_job: j-20260904-06
proposed_by_type: entry
---
Add a build check for the alias shape this job's two reviews each had to find by hand: one entry declaring two `exclusive` aliases where the shorter is a whole-token substring of the longer. `lib/linker.mjs` rule 3 refuses overlapping candidates with no tie-break, "not even when they point at the same entry", so that pair makes the entry unlinkable on exactly the pages that use its long form — a silent zero-link outcome no gate reports. The same check is the natural home for the spec's currently unenforced MUST that single common words and bare brand tokens be `manual`.

## Evidence

`lib/aliases.mjs` fails the build only when two DIFFERENT entries claim one name as exclusive (line 59, `exclusives.length > 1`); a single entry claiming both "OpenAI Daybreak" and "Daybreak" as exclusive passes cleanly, and `npm run build` did pass on that state at commit 014120e. Pass 1 of this job measured the consequence (0 links on the sentence at content/blog/openai-gpt-6-astra-system-card.md:56) and required the demotion; on 2026-09-04 I re-ran the fixed state through the same linker over the whole post and got 1 link wrapping "OpenAI Daybreak", confirming both halves of the mechanism. Pass 1 noted this proposal in a `revise` record and it is absent from data/proposals/, so re-noting it here is the only way it survives the job.

## Origin

Transcribed by the loop from the verdict record for job j-20260904-06 (`j-20260904-06.pass2.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
