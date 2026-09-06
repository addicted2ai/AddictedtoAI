---
id: model/google-gemini-3-8-flash
kind: model
display_name: "Google: Gemini 3.8 Flash"
status: active
maintenance: living
aliases:
  - name: "Google: Gemini 3.8 Flash"
    class: manual
  - name: "Gemini 3.8 Flash"
    class: exclusive
  - name: "google/gemini-3.8-flash"
    class: exclusive
feeds:
  openrouter-models: google/gemini-3.8-flash
facts:
  - field: price_input
    source: feed
    feed: openrouter-models
    path: pricing.prompt
    volatility: fast
  - field: price_output
    source: feed
    feed: openrouter-models
    path: pricing.completion
    volatility: fast
  - field: context_window
    source: feed
    feed: openrouter-models
    path: context_length
    volatility: fast
  - field: max_output_tokens
    source: feed
    feed: openrouter-models
    path: top_provider.max_completion_tokens
    volatility: fast
  - field: intelligence_index
    source: feed
    feed: openrouter-models
    path: benchmarks.artificial_analysis.intelligence_index
    volatility: fast
  - field: status
    source: feed
    feed: openrouter-models
    path: $status
    volatility: fast
  - field: release_date
    source: cited
    value: "2026-09-02"
    source_url: "https://openrouter.ai/google/gemini-3.8-flash"
    accessed: "2026-09-03"
    volatility: dated
  - field: introductory_pricing_ends
    source: cited
    value: "2026-12-31; US$1.50/US$7.50 standard rate applies from 2027-01-01"
    source_url: "https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/"
    accessed: "2026-09-03"
    volatility: dated
  - field: intelligence_index_by_effort
    source: cited
    value: "59 at high reasoning, 57 at medium, 52 at low; up 3 from Gemini 3.7 Flash at high, level with sub-maximum efforts of GPT-5.6 Sol and Grok 4.6"
    source_url: "https://llm-releases.com/models/gemini-3-8-flash"
    accessed: "2026-09-03"
    volatility: dated
  - field: hle_verified
    source: cited
    value: "54.9%"
    source_url: "https://deepmind.google/models/gemini/flash/"
    accessed: "2026-09-03"
    volatility: dated
  - field: vals_finance_agent_v2
    source: cited
    value: "61.4%, against 59.0% for Gemini 3.7 Flash"
    source_url: "https://deepmind.google/models/gemini/flash/"
    accessed: "2026-09-03"
    volatility: dated
  - field: harveys_legal_agent_benchmark
    source: cited
    value: "10.0%, against 8.8% for Gemini 3.7 Flash"
    source_url: "https://deepmind.google/models/gemini/flash/"
    accessed: "2026-09-03"
    volatility: dated
  - field: deepswe_v1_1
    source: cited
    value: "outperforms most larger frontier models at a fraction of the cost"
    source_url: "https://deepmind.google/models/gemini/flash/"
    accessed: "2026-09-03"
    volatility: dated
  - field: output_tokens_per_task
    source: cited
    value: "~48k"
    source_url: "https://llm-releases.com/models/gemini-3-8-flash"
    accessed: "2026-09-03"
    volatility: dated
  - field: cost_per_task
    source: cited
    value: "~$0.58"
    source_url: "https://llm-releases.com/models/gemini-3-8-flash"
    accessed: "2026-09-03"
    volatility: dated
  - field: knowledge_cutoff
    source: cited
    value: "March 2026 for some domains; January 2025 for others"
    source_url: "https://9to5google.com/2026/09/02/gemini-3-8-flash-launch/"
    accessed: "2026-09-03"
    volatility: dated
timeline:
  - date: "2026-09-02"
    event: "released with introductory pricing declared to run through 2026-12-31"
    source_url: "https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/"
mentions:
  - org/google-deepmind
  - model/google-gemini-3-7-flash
  - model/google-gemini-3-6-flash
---

Right now, this row costs exactly what its predecessor does: it lists at
{{fact:model/google-gemini-3-8-flash#price_input}} input and
{{fact:model/google-gemini-3-8-flash#price_output}} output, the same figures
3.6 and 3.7 carry, because Google carried the introductory window across the
release. The launch post dates the window plainly:
{{fact:model/google-gemini-3-8-flash#introductory_pricing_ends}}.

What changed is the invoice per task. Google's release note credits the gains
to "a core design choice: 3.8 Flash works harder" — extra reasoning steps,
iterative tool calls, and at higher effort levels, more tokens spent. An
independent reading of the release, [llm-releases](https://llm-releases.com/models/gemini-3-8-flash),
turns that sentence into arithmetic: average output tokens per task rose
~30%, to {{fact:model/google-gemini-3-8-flash#output_tokens_per_task}},
lifting cost per task to {{fact:model/google-gemini-3-8-flash#cost_per_task}}
at high reasoning despite the unchanged per-token price. Buyers of this row
are paying the same rate and a larger bill.

Google's own launch numbers for the row are vendor-reported and dated to the
release: HLE-Verified at {{fact:model/google-gemini-3-8-flash#hle_verified}},
Vals Finance Agent v2 at {{fact:model/google-gemini-3-8-flash#vals_finance_agent_v2}},
Harvey's Legal Agent Benchmark at {{fact:model/google-gemini-3-8-flash#harveys_legal_agent_benchmark}},
and on DeepSWE v1.1, 3.8 Flash {{fact:model/google-gemini-3-8-flash#deepswe_v1_1}}. The row keeps the
family-standard {{fact:model/google-gemini-3-8-flash#context_window}} input
window with {{fact:model/google-gemini-3-8-flash#max_output_tokens}} output,
and Google dates its knowledge cutoff to
{{fact:model/google-gemini-3-8-flash#knowledge_cutoff}}.

The by-effort split recorded below is a pre-rebase reading. It was read from
llm-releases on 3 September 2026, on the Artificial Analysis intelligence index
as it then stood; the index has since been rebased to
[v4.2](https://artificialanalysis.ai/methodology/intelligence-benchmarking),
which moved this row's score down along with every other row that kept a score
through it. Those effort numbers and the
{{fact:model/google-gemini-3-8-flash#intelligence_index}} the catalog carries
today are not on the same scale.

The same launch carried a second model. 3.8 Flash Cyber is the
cybersecurity-tuned sibling, available only to trusted defenders — [named by
llm-releases as government authorities, critical-infrastructure operators and
software maintainers](https://llm-releases.com/models/gemini-3-8-flash-cyber)
— through Google's new Fairwind Program, and it is not publicly token-billed.
Google's claims for it, all vendor-reported, are in the
[launch post](https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/):
frontier-level performance on the CyberGym vulnerability-discovery benchmark,
surpassing 3.5 Flash Cyber and much larger frontier models; a success rate
exceeding 70% on an internal real-world benchmark spanning 20 programming
languages; 47.2% pass@1 on CWE-Bench, on the Pareto frontier against a
leading frontier model's 47.8% at far lower cost. The deployment numbers are
Google's too: Chrome Security reports 2.6 times more correct patches than
the best commercial models that are much larger; Wiz measured +7.5-9.7%
higher recall on its internal penetration-testing benchmark at 2.3-5.2x
lower cost than other leading frontier models; and Cloud Vulnerability
Research used the model to find a critical foundational vulnerability in
under two hours, where the same discovery usually takes months.