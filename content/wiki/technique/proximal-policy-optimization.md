---
id: technique/proximal-policy-optimization
kind: technique
display_name: "Proximal Policy Optimization"
status: active
maintenance: stable
aliases:
  - name: "Proximal Policy Optimization"
    class: exclusive
  - name: "PPO"
    class: manual
  - name: "RLHF"
    class: manual
  - name: "Reinforcement learning from human feedback"
    class: shared
facts:
  - field: first_published
    source: cited
    value: "2017-07-20"
    source_url: "https://arxiv.org/abs/1707.06347"
    accessed: "2026-08-28"
    volatility: dated
  - field: clipped_objective
    source: cited
    value: "a surrogate objective that enables multiple epochs of minibatch updates per batch of sampled data, keeping some of the benefits of trust region policy optimization while being much simpler to implement"
    source_url: "https://arxiv.org/abs/1707.06347"
    accessed: "2026-08-28"
    volatility: static
  - field: instructgpt_published
    source: cited
    value: "2022-03-04"
    source_url: "https://arxiv.org/abs/2203.02155"
    accessed: "2026-08-28"
    volatility: dated
  - field: parameter_upset
    source: cited
    value: "outputs from the 1.3B InstructGPT model are preferred to outputs from the 175B GPT-3, despite having 100x fewer parameters"
    source_url: "https://arxiv.org/abs/2203.02155"
    accessed: "2026-08-28"
    volatility: dated
  - field: win_rate
    source: cited
    value: "175B InstructGPT outputs are preferred to 175B GPT-3 outputs 85 ± 3% of the time"
    source_url: "https://arxiv.org/abs/2203.02155"
    accessed: "2026-08-28"
    volatility: dated
  - field: hallucination_rate
    source: cited
    value: "21% against GPT-3's 41% on closed-domain tasks — making up information not present in the input about half as often"
    source_url: "https://arxiv.org/abs/2203.02155"
    accessed: "2026-08-28"
    volatility: dated
  - field: toxicity_reduction
    source: cited
    value: "about 25% fewer toxic outputs than GPT-3 when prompted to be respectful"
    source_url: "https://arxiv.org/abs/2203.02155"
    accessed: "2026-08-28"
    volatility: dated
  - field: labeling_effort
    source: cited
    value: "about 40 contractors; roughly 13k prompts for supervised fine-tuning, 33k for the reward model and 31k for the PPO stage"
    source_url: "https://arxiv.org/abs/2203.02155"
    accessed: "2026-08-28"
    volatility: dated
  - field: alignment_tax_fix
    source: cited
    value: "mixing PPO updates with updates that increase the log likelihood of the pretraining distribution, called PPO-ptx, substantially reduces regressions on public NLP datasets without compromising preference scores"
    source_url: "https://arxiv.org/abs/2203.02155"
    accessed: "2026-08-28"
    volatility: static
  - field: compute_asymmetry
    source: cited
    value: "training the 175B PPO-ptx model took 60 petaflops/s-days, against 3,640 petaflops/s-days for pretraining GPT-3"
    source_url: "https://arxiv.org/abs/2203.02155"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2017-07-20"
    event: "PPO published by Schulman, Wolski, Dhariwal, Radford and Klimov"
    source_url: "https://arxiv.org/abs/1707.06347"
  - date: "2022-03-04"
    event: "InstructGPT applies it to a 175B language model against a learned reward model"
    source_url: "https://arxiv.org/abs/2203.02155"
mentions:
  - technique/direct-preference-optimization
  - technique/reinforcement-learning-with-verifiable-rewards
  - org/openai
---

PPO was published for simulated robotic locomotion and Atari game playing, not for
language models. Its contribution is
{{fact:technique/proximal-policy-optimization#clipped_objective}}: the update is
clipped so that the new policy cannot move far from the one that produced the
samples, which is what makes reusing a batch safe.

That property is why it took over language-model alignment. In this setting a
sample is a full generation scored by a reward model — expensive to produce, and
worth several gradient epochs each. The loop holds four networks: the policy being
trained, a frozen reference the policy is penalised for drifting from, the reward
model standing in for a human, and a value network estimating what a partial
generation is worth. The reward model is the thing being optimised against, and it
is a model, so the pressure to exploit it is why the reference penalty is there at
all.

**What it bought, measured.** InstructGPT (2022-03-04) is the reference result.
The headline is a parameter upset:
{{fact:technique/proximal-policy-optimization#parameter_upset}}. At equal size the
margin is larger still —
{{fact:technique/proximal-policy-optimization#win_rate}} — and two of the
specifics matter more than the preference score, because they name behaviours
rather than tastes: {{fact:technique/proximal-policy-optimization#hallucination_rate}},
and {{fact:technique/proximal-policy-optimization#toxicity_reduction}}.

**The tax, named by the people who paid it.** Aligned models regressed on public
NLP benchmarks, and the paper does not hide the trade — it engineers around it:
{{fact:technique/proximal-policy-optimization#alignment_tax_fix}}. The fix is worth
looking at squarely. The reinforcement learning stage pulls the model away from
its pretraining distribution, and the repair is to pull it back with a term of the
original pretraining objective, mixed into the same updates.

**The number nobody quotes.** {{fact:technique/proximal-policy-optimization#compute_asymmetry}}
— under two per cent of the pretraining bill, for the step that turned a
completion engine into something people could give instructions to. The scarce
input was never compute: it was
{{fact:technique/proximal-policy-optimization#labeling_effort}}. Capability was
bought with a pretraining run. Usefulness was bought with a few tens of thousands
of ranked comparisons and a team small enough to fit in one room.
