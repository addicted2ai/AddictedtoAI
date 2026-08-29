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

## Recheck 2026-08-29 (addictedtoai-flh) — holds, no change

Every number in this entry is a figure attributed to a paper, so all four
were re-matched literally against bytes on disk.

- arxiv.org/abs/2404.06654 (43,155 bytes): "[Submitted on 9 Apr 2024";
  "evaluate 17 long-context LMs with 13 representative tasks"; "only half of
  them can maintain satisfactory performance at the length of 32K"; "Our
  analysis of Yi-34B, which supports context length of 200K, reveals large
  room for improvement". The `ruler_finding` fact and the body's "Seventeen
  models, thirteen tasks" are exact.
- arxiv.org/abs/2502.05167 (43,460 bytes): "[Submitted on 7 Feb 2025";
  "13 popular LLMs that claim to support contexts of at least 128K tokens";
  "11 models drop below 50% of their strong short-length baselines"; and
  "Even GPT-4o, one of the top-performing exceptions, experiences a
  reduction from an almost-perfect baseline of 99.3% to 69.7%" — both
  literals 99.3 and 69.7 matched in place, so `nolima_gpt4o` is exact.

Nothing here rests on a vendor page or a secondary source; both figures come
from the papers themselves. No correction required.
