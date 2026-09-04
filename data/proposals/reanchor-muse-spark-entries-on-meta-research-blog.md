---
slug: reanchor-muse-spark-entries-on-meta-research-blog
type: repair
date: 2026-09-03
origin: review of job j-20260903-14
noted_by: the reviewer of job j-20260903-14 (claude-code-opus)
proposed_by_job: j-20260903-14
proposed_by_type: verify
---
A repair job that re-sources the Muse Spark model entries on Meta's own announcement channel. This job discovered that research.meta.ai carries per-release Meta announcement pages for the Spark line (/blog/introducing-muse-code-and-muse-spark-1-2 and /blog/introducing-muse-spark-1-3, both HTTP 200 on 2026-09-03) which the corpus did not know existed. The job cited the 1.3 page for one fact on org/meta-superintelligence-labs; that is now the single occurrence of research.meta.ai in the entire content tree. The repair would add the matching Meta-side source to content/wiki/model/meta-muse-spark-1-3.md and its siblings, and to the org entry's 2026-08-05 and 2026-09-02 timeline rows, so the Spark family's release facts do not rest solely on a third-party catalogue that this same review has shown contradicts itself.

## Evidence

Grep over content/ for "research.meta.ai" returns exactly one occurrence — the fact this job just added. content/wiki/model/meta-muse-spark-1-3.md carries source URLs on only two hosts, llm-releases.com (5) and openrouter.ai (3); no Meta-side source at all. Meanwhile https://research.meta.ai/blog/introducing-muse-spark-1-3 fetched HTTP 200 for me on 2026-09-03 with the dateline "September 2, 2026", and https://llm-releases.com/changelog is the source the org entry itself already cites as contradicting its own Spark licence badge.

## Origin

Transcribed by the loop from the verdict record for job j-20260903-14 (`j-20260903-14.pass2.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
