---
slug: derived-batch-vs-sync-price-view
type: machinery
date: 2026-08-31
origin: review of job j-20260831-01
noted_by: the reviewer of job j-20260831-01 (claude-code-opus)
proposed_by_job: j-20260831-01
proposed_by_type: scout
---
Build a derived view in the data layer comparing each model's synchronous price against its `:batch` variant, across every provider the openrouter source carries. The scout's own drop record identifies this as the thing that would clear the editorial bar where prose about batch pricing does not — "a live view nobody else shows" — names it as a machinery or entry job rather than a post, and then does not file it, because filing non-post work is outside what a scout run produces. The inputs already exist: `pricing.prompt` and `pricing.completion` are carried per row in `data/changes.jsonl`, and the `:batch` rows are separate rows on the same source, so the comparison is computable from committed state with no new feed.

## Evidence

data/proposals/dropped/batch-lane-half-price-pricing.md in this diff, third refile condition. Corroborated externally: digitalapplied, "LLM Batch APIs: The Half-Price Lane Nobody Budgets", https://www.digitalapplied.com/blog/llm-batch-api-pricing-landscape-2026, published 2026-08-14, which I fetched on 2026-08-31 and which states "Google, OpenAI and Anthropic each run an asynchronous batch lane at 50% of their synchronous rate" — i.e. the prose observation is commodity and the derived view is the part nobody has. Eleven distinct `:batch` rows appear in this run's own assembled feed context.

## Origin

Transcribed by the loop from the verdict record for job j-20260831-01 (`j-20260831-01.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
