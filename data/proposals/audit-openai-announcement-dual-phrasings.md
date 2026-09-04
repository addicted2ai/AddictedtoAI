---
slug: audit-openai-announcement-dual-phrasings
type: verify
date: 2026-09-04
origin: review of job j-20260904-10
noted_by: the reviewer of job j-20260904-10 (claude-code-opus)
proposed_by_job: j-20260904-10
proposed_by_type: repair
---
OpenAI's announcement pages routinely state the same claim twice in different words — once in the intro summary bullets and once in the body prose — and the corpus has already spent a carried finding, a whole verify job (j-20260904-07, with two evidence files) and part of this repair job adjudicating one instance of it. A verify job should sweep the OpenAI announcement URLs the corpus currently cites, and for each quoted or closely-paraphrased passage record which of the two renderings the corpus took, so the next reviewer who retrieves a page and finds wording that differs from the corpus has an existing answer rather than a fresh finding.

## Evidence

Measured by direct fetch during this review, 2026-09-04, both HTTP 200. openai.com/index/daybreak-for-frontline-defenders/ carries "More than 35 enterprise products and partner-operated services through the Daybreak Defense Network" in its "The initiative includes:" bullet list and "more than 35 partner products and partner-operated services" in the MS-ISAC body paragraph — each exactly once. Independently, openai.com/index/path-to-astra/ carries "Advanced cybersecurity work will initially be available to a group of testers, with access through Daybreak Blue following to expand defensive use" near the top and "Access to Astra for advanced cybersecurity workflows will initially be available to a small group of alpha testers, with access through Daybreak Blue expanding afterward to support defensive use" in the safeguards section. The corpus quotes the body rendering in both cases (correctly and verbatim), but nothing records that a second rendering exists, which is exactly the gap that produced carry j-20260904-03-carry-1's overstated "every independent retrieval" premise.

## Origin

Transcribed by the loop from the verdict record for job j-20260904-10 (`j-20260904-10.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
