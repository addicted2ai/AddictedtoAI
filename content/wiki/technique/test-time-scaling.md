---
id: technique/test-time-scaling
kind: technique
display_name: "Test-time scaling"
status: active
maintenance: stable
aliases:
  - name: "Test-time scaling"
    class: shared
  - name: "Test-time compute"
    class: shared
  - name: "Inference-time scaling"
    class: shared
  - name: "Budget forcing"
    class: exclusive
themes:
  - argument
facts:
  - field: two_mechanisms
    source: cited
    value: "searching against dense process-based verifier reward models, and adaptively updating the model's own distribution over a response at test time"
    source_url: "https://arxiv.org/abs/2408.03314"
    accessed: "2026-08-28"
    volatility: static
  - field: compute_optimal_efficiency
    source: cited
    value: "allocating test-time compute per prompt according to difficulty improves the efficiency of test-time scaling by more than 4x compared with a best-of-N baseline"
    source_url: "https://arxiv.org/abs/2408.03314"
    accessed: "2026-08-28"
    volatility: dated
  - field: flops_matched_result
    source: cited
    value: "in a FLOPs-matched evaluation, on problems where a smaller base model attains somewhat non-trivial success rates, test-time compute can be used to outperform a 14x larger model"
    source_url: "https://arxiv.org/abs/2408.03314"
    accessed: "2026-08-28"
    volatility: dated
  - field: where_it_fails
    source: cited
    value: "on the most difficult questions no method makes much meaningful progress, and on those it is more effective to apply additional pretraining compute; where the inference-to-pretraining token ratio is much greater than one, pretraining is the more effective way to improve performance"
    source_url: "https://arxiv.org/abs/2408.03314"
    accessed: "2026-08-28"
    volatility: dated
  - field: budget_forcing
    source: cited
    value: "control test-time compute by forcefully terminating the model's thinking process, or lengthening it by appending \"Wait\" when the model tries to end, which often leads it to double-check and fix an incorrect step"
    source_url: "https://arxiv.org/abs/2501.19393"
    accessed: "2026-08-28"
    volatility: static
  - field: s1_result
    source: cited
    value: "after supervised finetuning of Qwen2.5-32B-Instruct on 1,000 curated questions, s1-32B exceeds o1-preview on competition maths questions by up to 27%"
    source_url: "https://arxiv.org/abs/2501.19393"
    accessed: "2026-08-28"
    volatility: dated
  - field: s1_extrapolation
    source: cited
    value: "budget forcing takes AIME24 from 50% to 57% beyond the model's performance without test-time intervention"
    source_url: "https://arxiv.org/abs/2501.19393"
    accessed: "2026-08-28"
    volatility: dated
  - field: s1_ceiling
    source: cited
    value: "the AIME24 gain from budget forcing eventually flattens out at six times, and suppressing the end-of-thinking delimiter too often can lead the model into repetitive loops instead of continued reasoning"
    source_url: "https://arxiv.org/abs/2501.19393"
    accessed: "2026-08-28"
    volatility: dated
  - field: data_efficiency
    source: cited
    value: "training on the full pool of 59K examples, a superset of the 1K selection, does not offer substantial gains over the 1K"
    source_url: "https://arxiv.org/abs/2501.19393"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2024-08-06"
    event: "Snell, Lee, Xu and Kumar measure compute-optimal test-time scaling against a FLOPs-matched larger model"
    source_url: "https://arxiv.org/abs/2408.03314"
  - date: "2025-01-31"
    event: "s1 reproduces test-time scaling from 1,000 examples and a repeated \"Wait\""
    source_url: "https://arxiv.org/abs/2501.19393"
mentions:
  - concept/scaling-laws
  - technique/chain-of-thought-prompting
  - technique/reinforcement-learning-with-verifiable-rewards
---

The proposition is a substitution: buy accuracy with inference compute instead of
with parameters. Snell and colleagues (2024-08-06) analysed
{{fact:technique/test-time-scaling#two_mechanisms}}, and found that which one wins
depends on how hard the question is — which is what makes allocation, rather than
volume, the lever. Spending adaptively per prompt gives
{{fact:technique/test-time-scaling#compute_optimal_efficiency}}.

The claim that travelled is the next one:
{{fact:technique/test-time-scaling#flops_matched_result}}. It is usually quoted
without its subordinate clause, and the clause is the finding. Test-time compute
overtakes parameters *on problems the smaller model can already sometimes solve*.

**Where the substitution stops.** The same paper is explicit:
{{fact:technique/test-time-scaling#where_it_fails}}. Both halves of that matter for
anyone budgeting. Hard questions are where extra thinking is intuitively most
valuable and empirically least effective — sampling more attempts at a problem the
model cannot reach does not reach it. And the ratio between tokens served and
tokens pretrained decides the economics: a research demo generating a few thousand
answers and a production system generating billions are on opposite sides of that
comparison, with the same model.

**The cheapest demonstration.** s1 (2025-01-31) is the version worth reading
because it removes almost everything. No reinforcement learning, no reward model,
no search: {{fact:technique/test-time-scaling#budget_forcing}}. Appending the word
"Wait" is the entire test-time mechanism. On the training side,
{{fact:technique/test-time-scaling#data_efficiency}} — a fifty-nine-fold larger
pool of the same data bought nothing over careful selection. The result was
{{fact:technique/test-time-scaling#s1_result}}, and the pure test-time effect,
holding the model fixed, was
{{fact:technique/test-time-scaling#s1_extrapolation}}.

**And its ceiling, measured in the same paper.**
{{fact:technique/test-time-scaling#s1_ceiling}}. That is a specific and unusually
useful failure: forcing more thinking works until the model has nothing further to
say, at which point the mechanism keeping it from stopping produces repetition
rather than reasoning. The gain is real, bounded, and reached quickly.

Read the two papers together and test-time scaling is a curve with a knee whose
position depends on the model, the question's difficulty, and how many tokens the
deployment will ever serve. Every headline multiple is one point on somebody's
curve.
