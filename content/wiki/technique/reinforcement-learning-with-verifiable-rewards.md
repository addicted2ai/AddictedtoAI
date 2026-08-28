---
id: technique/reinforcement-learning-with-verifiable-rewards
kind: technique
display_name: "Reinforcement Learning with Verifiable Rewards"
status: active
maintenance: stable
aliases:
  - name: "Reinforcement Learning with Verifiable Rewards"
    class: exclusive
  - name: "RLVR"
    class: manual
  - name: "Verifiable rewards"
    class: shared
themes:
  - argument
facts:
  - field: named_in
    source: cited
    value: "Tulu 3, 2024-11-22"
    source_url: "https://arxiv.org/abs/2411.15124"
    accessed: "2026-08-28"
    volatility: dated
  - field: grpo_origin
    source: cited
    value: "Group Relative Policy Optimization, introduced in DeepSeekMath as a PPO variant that removes the value network"
    source_url: "https://arxiv.org/abs/2402.03300"
    accessed: "2026-08-28"
    volatility: dated
  - field: deepseekmath_math_score
    source: cited
    value: "51.7% on MATH with no external toolkit and no voting; 60.9% with self-consistency over 64 samples"
    source_url: "https://arxiv.org/abs/2402.03300"
    accessed: "2026-08-28"
    volatility: dated
  - field: r1_peer_review
    source: cited
    value: "DeepSeek-R1 published in Nature volume 645, pages 633-638 (2025), DOI 10.1038/s41586-025-09422-z"
    source_url: "https://arxiv.org/abs/2501.12948"
    accessed: "2026-08-28"
    volatility: dated
  - field: pass_at_k_finding
    source: cited
    value: "RLVR-trained models beat their base models at small k, and the base models score higher at large k"
    source_url: "https://arxiv.org/abs/2504.13837"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2024-02-05"
    event: "GRPO introduced in DeepSeekMath, dropping PPO's critic network"
    source_url: "https://arxiv.org/abs/2402.03300"
  - date: "2024-11-22"
    event: "named Reinforcement Learning with Verifiable Rewards in Tulu 3"
    source_url: "https://arxiv.org/abs/2411.15124"
  - date: "2025-01-22"
    event: "DeepSeek-R1 preprint claims reasoning behaviour emerging from RL with no human-labelled reasoning traces"
    source_url: "https://arxiv.org/abs/2501.12948"
  - date: "2025-04-18"
    event: "pass@k study finds RLVR sharpens the base model's distribution rather than extending its reach"
    source_url: "https://arxiv.org/abs/2504.13837"
mentions:
  - technique/direct-preference-optimization
  - model/deepseek-deepseek-r1
---

RLVR replaces the learned reward model with a program. A maths answer is checked
against the gold answer; generated code is run against tests; a required output
format is validated. The reward is a number a verifier computed, so the policy
has nothing to hack except the verifier — the characteristic failure moves from
"the reward model likes this answer" to "the test suite was incomplete". Ai2's
Tulu 3 (2024-11-22) named it; the practice is older than the name.

**The algorithm that made it cheap.** DeepSeekMath (2024-02-05) introduced Group
Relative Policy Optimization: sample a group of completions for one prompt, score
them all, and use each completion's reward relative to its group — its own reward
minus the group mean, scaled by the group's spread — in place of a learned value
function. PPO's critic, a second network roughly the size of the policy,
disappears, and so does its memory. DeepSeekMath-7B reached 51.7% on MATH with no
tools and no voting.

**What R1 claimed.** DeepSeek's R1 preprint (2025-01-22) took the setup to its
limit: reasoning behaviour — self-reflection, verification, changing strategy
mid-solution — emerging from reinforcement learning alone, with no human-written
reasoning traces to imitate, and then distilled into smaller models. It then went
through journal peer review: the arXiv record carries the journal reference
Nature, volume 645, pages 633-638 (2025), and the
preprint was replaced by the peer-reviewed version on 2026-01-04, close to a year
after it first posted.

**The open dispute.** Yue and colleagues (2025-04-18, revised through 2025-11-24)
asked a different question of the same models: not how often a single sample is
correct, but whether the correct answer is reachable at all. Sample k answers per
problem, count a problem solved if any sample is right — pass@k — and sweep k
across model families, six RL algorithms, and maths, code and visual reasoning
benchmarks. At small k, RLVR models beat their base models, as advertised. At
large k, the base models win, and coverage analysis puts the RLVR models' solutions
inside the base model's reachable set. Their reading is that current RLVR
concentrates probability mass on solutions the base model could already produce.
In the same study, distillation from a stronger teacher did introduce reasoning
patterns the base model lacked.

Both halves of that are worth holding at once. Concentrating probability on
correct answers is exactly what a production system needs, and it is not evidence
of new capability. The measurement that separates the two claims is pass@k at
large k, which is why the number appears so rarely in launch posts.
