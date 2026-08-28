---
id: technique/direct-preference-optimization
kind: technique
display_name: "Direct Preference Optimization"
status: active
maintenance: stable
aliases:
  - name: "Direct Preference Optimization"
    class: exclusive
  - name: "DPO"
    class: manual
themes:
  - argument
facts:
  - field: first_published
    source: cited
    value: "2023-05-29"
    source_url: "https://arxiv.org/abs/2305.18290"
    accessed: "2026-08-28"
    volatility: dated
  - field: training_signal
    source: cited
    value: "a classification loss over preference pairs; no reward model is trained and nothing is sampled from the model during fine-tuning"
    source_url: "https://arxiv.org/abs/2305.18290"
    accessed: "2026-08-28"
    volatility: static
  - field: zephyr_result
    source: cited
    value: "Zephyr-7B, trained with distilled DPO and no human annotation, surpassed Llama2-Chat-70B on MT-Bench"
    source_url: "https://arxiv.org/abs/2310.16944"
    accessed: "2026-08-28"
    volatility: dated
  - field: icml_2024_comparison
    source: cited
    value: "PPO surpassed other alignment methods in all tested cases and set state-of-the-art results on code competitions"
    source_url: "https://arxiv.org/abs/2404.10719"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2023-05-29"
    event: "introduced by Rafailov, Sharma, Mitchell, Ermon, Manning and Finn at Stanford"
    source_url: "https://arxiv.org/abs/2305.18290"
  - date: "2023-10-25"
    event: "Zephyr-7B demonstrates distilled DPO on AI-ranked preferences, with no human annotation"
    source_url: "https://arxiv.org/abs/2310.16944"
  - date: "2024-04-16"
    event: "ICML 2024 study finds DPO has fundamental limitations and PPO outperforms it across their testbeds"
    source_url: "https://arxiv.org/abs/2404.10719"
  - date: "2024-11-22"
    event: "Tulu 3 publishes a pipeline running supervised fine-tuning, then DPO, then RL against verifiable rewards"
    source_url: "https://arxiv.org/abs/2411.15124"
mentions:
  - technique/reinforcement-learning-with-verifiable-rewards
---

The paper's subtitle is the whole claim: *your language model is secretly a
reward model*. The substitution behind it is worth following once, because it
explains both why DPO spread so fast and where its limits are argued to be.

**The derivation.** RLHF maximizes a learned reward minus a term penalizing
divergence from the reference model. That constrained problem has a closed-form
optimum: the optimal policy is the reference policy reweighted by the exponential
of reward divided by the KL penalty coefficient, normalized by a partition
function nobody can compute. Rafailov and colleagues read the relation backwards.
If it holds, then any reward function can be written in terms of *its own*
optimal policy — reward equals that coefficient times the log-ratio of policy to
reference, plus a term in the same uncomputable partition function. Substitute that into the
Bradley-Terry likelihood of one completion being preferred over another for the
same prompt, and the partition function, identical for both completions, cancels.
What remains is a logistic loss over the difference of two log-ratios,
computable from four forward passes: the chosen and rejected completions under
the policy and under the frozen reference.

So the reward model is not eliminated. It is *reparameterized* as the policy
itself. Nothing is sampled during fine-tuning, no separate reward network is
trained or served, and no value network exists.

**Why it spread.** Hardware, mostly. PPO-style RLHF holds a policy, a reference,
a reward model and a value network in memory at once and runs a generation loop
inside training. DPO holds a policy and a frozen reference and reads a dataset of
pairs, which fits on the machines fine-tuners already had. The demonstration that
convinced the open-source side came five months after the paper: Zephyr-7B
(2023-10-25) used distilled DPO over preferences ranked by a teacher model, no
human annotation at all, and beat a 70B RLHF-trained chat model on MT-Bench after
a few hours of training.

**The argument.** Whether DPO is the better *algorithm*, as opposed to the
cheaper one, was tested directly and answered no. "Is DPO Superior to PPO for LLM
Alignment?" (Xu et al., 2024-04-16, ICML 2024) shows theoretically and
empirically that DPO "may have fundamental limitations", and reports PPO
surpassing every alternative in every testbed they ran, including state of the
art on code competitions. Read the scope carefully: that is a comparison of
carefully tuned pipelines on their benchmarks, not a claim about equal budgets.

The field's practice split along exactly that line rather than picking a winner.
Ai2's Tulu 3 (2024-11-22) runs supervised fine-tuning, then DPO, then RL
against verifiable rewards — DPO where a fixed set of human or model preferences
is the only signal, online RL where an answer can be checked by a program.
