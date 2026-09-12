---
id: technique/rlhf
kind: technique
display_name: "Reinforcement Learning from Human Feedback"
status: active
maintenance: stable
aliases:
  - name: "Reinforcement Learning from Human Feedback"
    class: exclusive
  - name: "Reinforcement learning from human feedback"
    class: exclusive
  - name: "RLHF"
    class: exclusive
facts:
  - field: pipeline_stages
    source: cited
    value: "preference comparisons, then a reward model fitted to them, then policy optimisation against that model constrained to stay near the starting policy"
    source_url: "https://arxiv.org/abs/2305.18290"
    accessed: "2026-09-11"
    volatility: static
  - field: origin_2017
    source: cited
    value: "Christiano, Leike and colleagues define goals as (non-expert) human preferences between pairs of trajectory segments and solve Atari games and simulated robot locomotion with no access to the reward function, training novel behaviors on about an hour of human time"
    source_url: "https://arxiv.org/abs/1706.03741"
    accessed: "2026-09-11"
    volatility: dated
  - field: instructgpt_result
    source: cited
    value: "outputs from the 1.3B parameter InstructGPT model are preferred to outputs from the 175B GPT-3, despite having 100x fewer parameters, with improvements in truthfulness and reductions in toxic outputs at minimal regressions on public NLP datasets"
    source_url: "https://arxiv.org/abs/2203.02155"
    accessed: "2026-09-11"
    volatility: dated
  - field: dpo_substitution
    source: cited
    value: "Direct Preference Optimization solves the standard RLHF problem with a classification loss — no reward model trained, no sampling from the model during fine-tuning — exceeding PPO-based RLHF at sentiment control and matching or improving it on summarization and single-turn dialogue"
    source_url: "https://arxiv.org/abs/2305.18290"
    accessed: "2026-09-11"
    volatility: dated
timeline:
  - date: "2017-06-12"
    event: "Christiano, Leike and colleagues train Atari and locomotion policies from human preferences between trajectory segments, with no reward function"
    source_url: "https://arxiv.org/abs/1706.03741"
  - date: "2022-03-04"
    event: "InstructGPT assembles supervised fine-tuning, preference collection and RLHF end to end on GPT-3; the 1.3B model is preferred to the 175B base"
    source_url: "https://arxiv.org/abs/2203.02155"
  - date: "2023-05-29"
    event: "Direct Preference Optimization solves the same RLHF problem with a classification loss, making the policy optimiser an interchangeable part"
    source_url: "https://arxiv.org/abs/2305.18290"
mentions:
  - technique/proximal-policy-optimization
  - technique/direct-preference-optimization
---

RLHF is a pipeline with three stages, and the name belongs to all three
together rather than to any one of them:
{{fact:technique/rlhf#pipeline_stages}}. Each stage exists because the
previous one ran out: demonstrations show one good answer but cannot say
which of two acceptable answers is better, so comparisons are collected
instead; raters are too slow to consult during training, so a reward model
stands in for them; and showing correct outputs is impossible where nobody
can write the right answer down, so the policy is scored rather than shown.

None of this began with language models. In June 2017 the same pipeline ran
on simulated robots and Atari —
{{fact:technique/rlhf#origin_2017}}. What made it the default for assistants
came five years later, when InstructGPT walked the full staircase on GPT-3:
supervised fine-tuning on demonstrations first, then the preference-to-reward-to-policy
loop — and {{fact:technique/rlhf#instructgpt_result}}.

**The distinction this entry exists to hold.** PPO is the algorithm most
often filling the pipeline's third slot, not a synonym for the pipeline.
[Proximal Policy Optimization](/wiki/technique/proximal-policy-optimization)
is one way to optimise a policy against a reward model; the proof that the
slot is interchangeable is that it has been replaced without touching the
other two stages: {{fact:technique/rlhf#dpo_substitution}}. See
[Direct Preference Optimization](/wiki/technique/direct-preference-optimization)
for the substitution worked through. A reader who meets "RLHF" and lands on
one optimiser has been sent to a part; the pipeline is the thing the word
means.
