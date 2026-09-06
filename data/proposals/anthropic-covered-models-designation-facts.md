---
date: 2026-09-06
slug: anthropic-covered-models-designation-facts
type: entry
summary: >
  Bind Anthropic's "Covered Models" designation to the corpus as dated facts
  rather than leaving it as prose in one blog post. Anthropic maintains a
  support page that is, in effect, a versioned policy register: a table of
  model, designation date, status and availability, plus the retention and
  review policies that attach to a designation. It currently lists Claude
  Mythos 5 and Fable 5 (designated 9 June 2026) and Mythos 5.1 and Fable 5.1
  (designated 31 August 2026). The proposed job would add the designation date
  and the retention posture as facts on the four `model/anthropic-claude-*`
  entries that already exist, and a `concept/` entry for the designation itself
  — the thing a covered designation does to a customer, which is remove the
  zero-data-retention option on every surface the model is offered on. The
  values that rot (rollout status, which models are currently designated) then
  live where a transclusion can carry them instead of in a dated narrative.
evidence: >
  Externally retrieved 2026-09-06 while writing
  content/blog/anthropic-enterprise-frontier-safeguards.md; every sentence
  below was confirmed present in the fetched bytes of the page named, not in a
  summariser's rendering of it.
  https://support.claude.com/en/articles/15425695-covered-models (retrieved
  2026-09-06; embedded dateModified metadata 2026-09-01T17:59:45Z) — carries
  the designation table (Claude Mythos 5.1 and Claude Fable 5.1, 31 August
  2026; Claude Mythos 5 and Claude Fable 5, 9 June 2026, with status and
  availability columns) and the policy that follows from a designation:
  "Accordingly, zero data retention is not available in workspaces, Claude
  Enterprise organizations, or third-party platforms (e.g., Azure
  Subscriptions) where Covered Models can be accessed."
  https://support.claude.com/en/articles/15425996-data-retention-practices-for-covered-models
  (retrieved 2026-09-06; embedded dateModified metadata 2026-09-05T00:32:46Z) —
  "This policy, described below, goes into effect on June 9, 2026", and the
  scope sentence naming exactly which organisations it lands on.
  The corpus today has no entry, fact or alias for any of this: grep for
  "zero data retention", "ZDR", "30-day" or "data retention" across content/
  on 2026-09-06 returned one incidental hit in an unrelated post.
expires: 2026-09-20
---

The blog note this came out of deliberately did not create these facts, because
creating them would have widened a `post` diff past its stated outcome. That is
the right call for the note and the wrong end state for the corpus, so it is
filed here rather than buried in the note's own record.

The case for entries rather than prose is that the underlying values are
exactly the kind this repository binds instead of typing. Which models are
designated is a list Anthropic says it will change — "We will update this list
as new models are designated or as existing designations change" — and the page
has already changed once in the three months it has existed. A designation is
also the load-bearing fact for a reader: it is not a label, it is the
mechanism that removes the zero-data-retention option, and it follows the model
across Claude Platform, Amazon Bedrock, Google Cloud Agent Platform and
Microsoft Foundry alike, which is why the support page says "These policies
follow the model."

Four model entries already exist and would take a designation date and a
retention posture directly: `model/anthropic-claude-fable-5`,
`model/anthropic-claude-fable-5-1`, and the Mythos 5 and 5.1 entries if the
corpus carries them. The concept entry is the piece with no home at all today —
the corpus can currently describe what Fable 5.1 costs and scores but not what
buying it does to a regulated customer's data-retention settings.

One caution for whoever takes this. The two support pages disagree in emphasis
with Anthropic's own news page on the interim ZDR arrangement, and the entry
should carry the support pages' narrower wording, not the announcement's: the
news page says eligible customers "will receive ZDR on Fable 5 and Fable 5.1
until EFS is ready", while the Covered Models page says they receive "the
option to use ZDR with Fable 5 and Fable 5.1 for their own internal business
applications", "available for a limited time". An entry written from the
announcement alone would state a commitment broader than the terms page
supports.
