---
slug: bind-the-efs-post-to-the-covered-models-entry
type: repair
date: 2026-09-06
origin: review of job j-20260906-16
noted_by: the reviewer of job j-20260906-16 (claude-code-opus)
proposed_by_job: j-20260906-16
proposed_by_type: entry
---
Now that concept/covered-models owns the Covered Models facts, rebind content/blog/anthropic-enterprise-frontier-safeguards.md to it instead of restating them. The post hard-codes slow-class values the entry now owns — the ZDR-unavailability sentence, the affected-organizations sentence, the fallback sentence and the interim-ZDR qualifiers — as literal quoted prose, which is the shape specs/wiki forbids once an owning entry exists ("Prose MUST NOT hard-code a volatile value as literal text"). The job would replace those literals with transclusions, add concept/covered-models to the post's mentions, and leave the post's argument, anchor and date alone: this is a binding repair, not a rewrite of a dated news note. It should explicitly decide, and write down, whether a published dated post is allowed to acquire transclusions at all — the answer governs every future note whose subject later gets an entry, and this is the first time the corpus has hit the case.

## Evidence

Measured in this worktree on 2026-09-06 while reviewing j-20260906-16. content/blog/anthropic-enterprise-frontier-safeguards.md quotes "Accordingly, zero data retention is not available in workspaces, Claude Enterprise organizations, or third-party platforms (e.g., Azure Subscriptions) where Covered Models can be accessed", the "organizations that have set up workspaces with zero data retention (ZDR) in Claude Console..." sentence, and "Customers who are eligible for zero data retention can continue to use prior Claude models under their existing settings and agreements" — all three are now facts on concept/covered-models (zero_data_retention, affected_organizations, fallback_for_zdr_customers), each carrying the same source_url. The post's section "The gap between the announcement's ZDR promise and the support page's" and the entry's fourth paragraph now carry the same three-qualifier analysis in near-identical words. The post's mentions list omits concept/covered-models, so the two pages do not link in either direction.

## Origin

Transcribed by the loop from the verdict record for job j-20260906-16 (`j-20260906-16.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
