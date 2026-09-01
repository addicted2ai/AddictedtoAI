---
date: 2026-09-01
slug: ibm-granite-42-open-reasoning-family
type: entry
status: declined
declined_by_job: j-20260901-07
failed_test: worth a stranger's attention (would-send)
---

# Declined: IBM's Granite 4.2 open reasoning family

## The story considered

The llm-releases feed items (fetched 2026-09-01,
https://llm-releases.com/models/granite-4-2-30b and the 3B/8B siblings):
IBM released Granite 4.2 in 3B, 8B and 30B sizes under Apache-2.0 — dense
decoder-only models with a thinking/non-thinking switch and low-effort
reasoning mode, ~15T tokens pre-training, multi-stage RL for agentic tool
use, ~57 on SWE-bench Verified for the 30B. Open weights on Hugging Face,
Ollama and GitHub; the 8B has a wiki stub in the data layer
(ibm-granite-granite-4-2-8b.md).

## Which test it failed, and why

**Worth a stranger's attention.** It is a solid, genuinely open (Apache-2.0)
release, but it is one of a crowded week of open-weights drops, the wiki
already carries the 8B in the data layer, and the sendable form — "IBM ships
an Apache-2.0 open reasoning family" — is a fact a reader would nod at and
forget. Nothing in the announcement is checkable-news rather than
vendor-reported benchmark, and the entry prose would be a recap.

## What would make it worth refiling

- An independent measurement of the 30B's reasoning/agentic claims, or a
  deployment story (a named organisation running Granite 4.2 in production)
  that makes the release matter.
- A licence or enterprise-terms angle — IBM models have a history of
  additional clauses (e.g. the old IBM Community License); if a follow-on
  model or the 4.2 family's terms change, the licence-lens story returns.
- The family being picked up as the base for a notable fine-tune or
  evaluation, which would give it a dated, checkable event.
