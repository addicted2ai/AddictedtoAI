---
slug: source-quote-extractor-for-review
type: machinery
date: 2026-09-03
origin: review of job j-20260903-11
noted_by: the reviewer of job j-20260903-11 (claude-code-opus)
proposed_by_job: j-20260903-11
proposed_by_type: entry
---
A small shared utility (a script under scripts/, callable from a review or authoring run) that fetches a cited URL and emits its quotable text correctly: prose with script/style/svg stripped, plus every image alt, aria-label, figcaption and title, each parsed with a real HTML attribute parser rather than a regex. It would print, for a supplied fragment, whether the fragment appears and in which channel, so "the source does not say this" becomes a reproducible command instead of an ad-hoc script rewritten from scratch by every reviewer.

## Evidence

This review's pass 1 returned false-or-unsupported-claim on harveys_legal_agent_benchmark and would have discarded a correct job. The cause was an attribute-extraction artifact, and it is fully reproducible: on https://deepmind.google/models/gemini/flash/ (fetched 2026-09-03) the Harvey chart is written alt="Bar chart comparing AI performance on Harvey's Legal Agent Benchmark. Gemini 3.8 Flash leads with 10.0%, ..." — double quoted, containing a literal apostrophe — while the Vals chart beside it is written alt='A bar chart comparing performance on "Vals Finance Agent v2" tasks, showing Gemini 3.8 Flash leading at 61.4%, ...' — single quoted, containing literal double quotes. Any extractor using a [^"']* character class recovers one and truncates the other at exactly the point pass 1 reported ("Bar chart comparing AI performance on Harvey"), and the resulting asymmetry then reads as positive evidence that the number is absent. My own first pass hit the mirror image of the same bug and lost the Vals figures. Two reviewers, two different truncations, one afternoon.

## Origin

Transcribed by the loop from the verdict record for job j-20260903-11 (`j-20260903-11.pass2.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
