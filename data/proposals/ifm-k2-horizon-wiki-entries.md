---
date: 2026-09-04
slug: ifm-k2-horizon-wiki-entries
type: entry
summary: >
  Wiki entries for IFM (the Institute of Foundation Models at MBZUAI) and the
  K2 Horizon fleet: an org entry naming the institute, and model entries for
  the six released sizes (375B-A23B, 36B-A4B, 32B, 7B, 3.7B, 0.9B) with their
  architectures, licence (Apache 2.0), the announced benchmark figures, and
  the reward-hacking audit results, each fact tied to the announcement page.
  The corpus currently has no entry for IFM, for MBZUAI, or for any K2
  Horizon model, so no surface links this release into the site's identity
  layer.
evidence: >
  IFM announcement "Introducing K2 Horizon: Frontier Performance, Radically
  Open", fetched 2026-09-04 — https://ifm.ai/blog/k2/ (dated 3 September
  2026; fleet of six models under Apache 2.0; TerminalBench 2.1 audit 70.2%
  to 66.9%; 0.9B "AIME 2026 score above 48"; MoVA and Uno; xLLM; day-zero
  vLLM/SGLang/Ollama support). Hugging Face collection, fetched 2026-09-04 —
  https://huggingface.co/collections/IFM/k2-horizon (all six models live,
  plus Uno and GGUF/FP8 variants and the training datasets). GitHub
  organisation ifm-ai, fetched 2026-09-04 — https://github.com/ifm-ai
  (`uno`, `xllm`, `horizon-post-train`, all Apache-2.0).
---

# IFM and the K2 Horizon fleet have no wiki entries

Writing the j-20260904-05 post on K2 Horizon, I found no identity layer to
link to: `content/wiki/` has no org entry for IFM or MBZUAI and no model
entries for any of the six released sizes. The post therefore had to carry
identity prose (institute full name, licence, fleet composition) that a wiki
entry would normally hold, and every other surface on the site has nothing
to link this release to either.

What the entry job would produce:

- `content/wiki/org/ifm.md`: the Institute of Foundation Models, an
  institute of Mohamed bin Zayed University of Artificial Intelligence
  (MBZUAI), with the LLM360 fully-open lineage (2023 paper) and this
  release, each claim tied to the announcement page.
- Model entries for the six sizes with architecture, active-parameter
  counts, Apache 2.0, the announced evaluation figures (0.9B AIME 2026
  above 48; the 70.2% → 66.9% TerminalBench 2.1 audit on the 375B-A23B;
  the 7B's withdrawn SWE-bench 82), and the artifact URLs (Hugging Face
  collection, GitHub).

The volatility rules apply: benchmark figures are vendor-reported and dated,
so they belong as dated facts with the announcement as source, not as
timeless prose. The reward-hacking audit numbers in particular are the kind
of value a reader will look up again, and the entry layer is where that
lookup should land.