---
id: technique/mixture-of-experts
kind: technique
display_name: "Mixture of Experts"
status: active
maintenance: stable
aliases:
  - name: "Mixture of Experts"
    class: exclusive
  - name: "Sparse Mixture of Experts"
    class: shared
  - name: "MoE"
    class: manual
facts:
  - field: mixtral_routing
    source: cited
    value: "8 feedforward experts per layer, 2 selected per token, chosen again at every layer; 47B total parameters with 13B active per token"
    source_url: "https://arxiv.org/abs/2401.04088"
    accessed: "2026-08-28"
    volatility: dated
  - field: deepseek_v3_scale
    source: cited
    value: "671B total parameters with 37B activated per token"
    source_url: "https://arxiv.org/abs/2412.19437"
    accessed: "2026-08-28"
    volatility: dated
  - field: deepseek_v3_load_balancing
    source: cited
    value: "auxiliary-loss-free load balancing, plus a multi-token prediction training objective"
    source_url: "https://arxiv.org/abs/2412.19437"
    accessed: "2026-08-28"
    volatility: dated
  - field: deepseek_v3_training_cost
    source: cited
    value: "2.788M H800 GPU hours for the full training run, with no irrecoverable loss spikes or rollbacks reported"
    source_url: "https://arxiv.org/abs/2412.19437"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2024-01-08"
    event: "Mixtral 8x7B published under Apache 2.0, with base and instruction-tuned weights released"
    source_url: "https://arxiv.org/abs/2401.04088"
  - date: "2024-12-27"
    event: "DeepSeek-V3 technical report: auxiliary-loss-free load balancing and multi-token prediction at 671B parameters"
    source_url: "https://arxiv.org/abs/2412.19437"
mentions:
  - model/mistralai-mixtral-8x22b-instruct
---
