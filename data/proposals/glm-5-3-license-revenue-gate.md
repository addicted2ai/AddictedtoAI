---
date: 2026-09-01
slug: glm-5-3-license-revenue-gate
type: post
summary: >
  A post reading the bespoke "GLM-5.3 License" that Z.ai shipped with the open
  weights of GLM-5.3 on Hugging Face: clause 2 makes commercial Model-as-a-Service
  use by any licensee (plus affiliates) whose aggregate revenue exceeds $10B over
  any consecutive 12 months conditional on passing Z.AI's security review, whose
  scope and method Z.AI determines. The model card frames the context: "as we
  scaled post-training, cyber capability developed faster than we expected," with
  GLM-5.3 state of the art on CyberGym for vulnerability discovery, its ExploitGym
  105/130 more than tripling GLM-5.2's 29/39 while standing third on the card's
  own row (behind Fable 5 (w/ fallback) and GPT-5.6 Sol). The post would quote the licence and
  the card, contrast the clause with MIT/Apache norms and with
  GLM-5.3-Flash's plain MIT, and test what the clause actually binds (who is over
  the revenue line, what "Model as a Service" excludes, whether the review can be
  refused).
evidence: >
  Hugging Face model card for zai-org/GLM-5.3, fetched 2026-09-01 —
  https://huggingface.co/zai-org/GLM-5.3 (License: glm-5.3; 753B params;
  arxiv 2602.15763; "Emergent Cyber Capability" note). Benchmark figures
  read from the card's own table, pinned to their rows: CyberGym 84.5
  (GLM-5.3) vs 77.2 (GLM-5.2), the single CyberGym row (card's footnote:
  unlimited timeout per task, single-run Pass@1 over 1,507 tasks);
  ExploitGym 105/130 (GLM-5.3) vs 29/39 (GLM-5.2), both pairs from the one
  "ExploitGym (2h / 6h)" row — first value the 2-hour budget, second the
  6-hour (card's footnote: single-run Pass@1 on 869 tasks; the two budgets are
  API inference time rescaled by per-model tokens-per-second — GLM-5.3 at 115
  TPS, Kimi K3 at 40 TPS, Qwen3.8 Max at 47 TPS, TPS sourced from Artificial
  Analysis — plus non-API overhead, so not wall-clock time). The footnote
  states its method for GLM-5.3, Kimi K3 and Qwen3.8 Max only — the GLM-5.2,
  Opus 4.8, Fable 5 (w/ fallback) and GPT-5.6 Sol figures on the same row carry no stated
  method, so the row is not a like-for-like leaderboard. The "(w/ fallback)"
  qualifier on Fable 5 appears only in that header, and the card states no
  meaning for it — no footnote, caption or prose says what fallback was
  enabled, to what, or for which runs. The licence text
  itself,
  fetched 2026-09-01 — https://huggingface.co/zai-org/GLM-5.3/raw/main/LICENSE
  (clause 2 verbatim: the $10B/12-month revenue threshold, the security-review
  condition, the MaaS definition excluding embedded features and "mere relaying
  of requests to models hosted by others", contact glmlicense@z.ai). The weights
  went public around 2026-08-28 after a two-week safety review, per the
  llm-releases.com feed item fetched 2026-09-01 — https://llm-releases.com/models/glm-5-3.
expires: 2026-09-08
proposed_by_job: j-20260901-07
proposed_by_type: scout
---

# GLM-5.3's revenue-gated licence

## Why now

The open weights of GLM-5.3 landed within the last week, and the licence that
ships with them is the interesting part of the release. "Open weights under a
bespoke licence" has become this site's home lane (see the Minimax H3
excluded-territories post); this one is a new shape: a permissive grant that
turns into a gate for a defined class of commercial users, with the gate's
operation left to the licensor's discretion. The vendor's own card ties the
condition to a capability the review is presumably about — cyber. That pairing
(release the weights, keep a review lever over the largest MaaS providers) is
novel enough that a reader who tracks model licensing would send it on with
"look at this".

## Would-send test

The would-SEND form: "Z.ai released GLM-5.3 weights under a licence where
companies over $10B revenue must pass Z.AI's security review to run it as
MaaS — and the model card says cyber capability 'developed faster than we
expected'." The recipient would click through because the licence is
quotable, primary, and four days old.

## What the job would produce (done-when)

- A post quoting clause 2 of the GLM-5.3 License (URL above) and the model
  card's cyber-capability note, with both documents named.
- An account of what the clause binds: who crosses the $10B line (any
  licensee and affiliates, any consecutive 12 months), what MaaS is and is
  not (embedded product features and plain relay of third-party-hosted
  models are excluded), and that the review's scope is Z.AI's to set.
- Contrast with GLM-5.3-Flash's plain MIT licence and with the Apache-2.0
  norm, citing zai-org/GLM-5.3-Flash.
- No claim about how the review actually operates — that is unpublished; the
  post says so rather than speculating.
- Facts carried with retrieval dates; the model card is the cited document
  for the benchmark figures (CyberGym, ExploitGym), and the licence file is
  the cited document for clause 2. The post reads the benchmark table
  itself and states the timeout row each figure comes from: CyberGym is a
  single row (unlimited timeout), and each ExploitGym value is the 2h / 6h
  pair from the one "ExploitGym (2h / 6h)" row.
