---
job: seed-concept-effective-context-length
verdict: approve
reasons: []
would-cite: >-
  The rebuttal link for every "this model has a million-token context"
  thread: two named benchmarks with dates, the structural flaw in
  needle-in-a-haystack, and the finding that advertised length measures
  addressable positions while semantic retrieval collapses by 32K — with
  GPT-4o's 99.3-to-69.7 drop as the concrete number.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content)
date: 2026-08-28
---

Checklist: wiki entry. Both papers fetched.

**Verified by fetching:**
- arxiv.org/abs/2404.06654 (RULER, submitted 9 Apr 2024) — "evaluate 17
  long-context LMs with 13 representative tasks" (the body's "Seventeen
  models, thirteen tasks" exact); "Despite achieving nearly perfect
  accuracy in the vanilla NIAH test, almost all models exhibit large
  performance drops as the context length increases. While these models
  all claim context sizes of 32K tokens or greater, only half of them can
  maintain satisfactory performance at the length of 32K" — supports the
  ruler_finding fact as written; "Our analysis of Yi-34B, which supports
  context length of 200K, reveals large room for improvement" — the body's
  quoted phrase is the abstract's own.
- arxiv.org/abs/2502.05167 (NoLiMa, submitted 7 Feb 2025) — "We evaluate
  13 popular LLMs that claim to support contexts of at least 128K tokens";
  "At 32K, for instance, 11 models drop below 50% of their strong
  short-length baselines" — the 13/11 figures in fact and body are exact;
  "Even GPT-4o ... experiences a reduction from an almost-perfect baseline
  of 99.3% to 69.7%" — exact; and the abstract attributes the decline to
  the attention mechanism's difficulty "when literal matches are absent",
  which is precisely the body's closing diagnosis (retrieval a keyword
  search would solve survives; retrieval requiring a semantic hop does
  not).

**Also checked:** the mention of concept/kv-cache resolves; no volatile
literals (both findings are dated study results, correctly marked dated);
aliases sane; the multi-hop tracing / aggregation description of RULER's
added categories matches the paper.

The piece assembles two studies into one claim with a practical
consequence — "a claim about usable length needs a named benchmark, a
length, and a date" — which is a usable standard, not a summary.
Approve.
