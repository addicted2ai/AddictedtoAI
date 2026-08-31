---
date: 2026-08-31
slug: qwen38-max-revenue-share-licence
type: post
status: declined
declined_by_job: j-20260831-01
failed_test: true, checkable and current
---

# Declined: Qwen3.8-Max's reported revenue-share licence

## The story considered

A search-result summary retrieved on 2026-08-31 stated that Alibaba's
Qwen3.8-Max weights landed on Hugging Face on **2026-08-12 with a new
revenue-share licence**, described as a shift from simpler prior terms. A
revenue-share clause on a major open-weight release would be a genuinely new
licensing form — thresholds and branding obligations are common, a share of
revenue is not — and it would have been a strong candidate.

## Which test it failed, and why

**True, checkable and current — it fails on checkable, at this moment.**

Two retrieved secondary sources conflict, and I did not reach the primary.

- The claim, from a search-engine summary of explainx.ai coverage
  (https://www.explainx.ai/blog/qwen3-8-max-open-weights-live-hugging-face-august-2026),
  retrieved 2026-08-31.
- Against it: digitalapplied's licence audit of 30 models across 17
  organisations, published 2026-08-16 and retrieved 2026-08-31
  (https://www.digitalapplied.com/blog/open-weight-model-licence-audit-2026),
  which states it found **no explicit revenue-sharing arrangements** anywhere in
  its dataset — only mandatory licensing, branding requirements and approval
  gates triggered by financial thresholds. The same audit separately lists
  GLM-5.3 and Qwen3.8-Max as "not actually available", which if accurate makes
  the 2026-08-12 weights-landed claim doubtful as well.

The audit postdates the reported release by four days, so it is not simply
out of date. One of the two is wrong and I could not determine which within this
run: I did not fetch the Qwen3.8-Max licence file itself.

Publishing either version would have been a plausible invention — the one
unrecoverable failure named in this job's ground rules. It is recorded here
rather than filed, and it is deliberately excluded from
`data/proposals/minimax-h3-excluded-territories.md`, which would otherwise have
been tempted to use it as a second data point.

## What would make it worth refiling

**One fetch settles it.** Retrieve the licence file from the Qwen3.8-Max
repository on Hugging Face directly and read the clauses:

- If it contains a genuine revenue-share clause, the story is both true and
  materially novel — the most thorough public audit of 2026 open-weight licences
  says no such clause exists in 30 models, so a first instance is news on its own
  terms and refiles immediately at high rank.
- If it contains only a threshold or branding trigger, the claim was loose
  reporting of an ordinary term, and this stays declined.
- If the weights are genuinely not available, that is a third story — a release
  announced and not shipped — and it needs its own evidence.

Whoever refiles this should note that the same caution applies to the audit's
"not actually available" line about GLM-5.3, which this run also did not verify.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing, and the refile condition here is a single retrieval away.
