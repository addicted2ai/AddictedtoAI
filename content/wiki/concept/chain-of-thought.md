---
id: concept/chain-of-thought
kind: concept
display_name: "Chain-of-thought prompting"
status: active
maintenance: stable
themes:
  - argument
aliases:
  - name: "Chain-of-thought prompting"
    class: shared
  - name: "Chain of thought"
    class: shared
  - name: "CoT"
    class: manual
facts:
  - field: gsm8k_gain
    source: cited
    value: "PaLM 540B on GSM8K: 17.9% with standard prompting, 56.9% with eight chain-of-thought exemplars"
    source_url: "https://ar5iv.labs.arxiv.org/html/2201.11903"
    accessed: "2026-08-28"
    volatility: dated
  - field: small_model_harm
    source: cited
    value: "models below roughly 100B parameters produced \"fluent but illogical chains of thought, leading to lower performance than standard prompting\""
    source_url: "https://ar5iv.labs.arxiv.org/html/2201.11903"
    accessed: "2026-08-28"
    volatility: dated
  - field: bias_induced_accuracy_drop
    source: cited
    value: "reordering multiple-choice options so the answer is always \"(A)\" dropped accuracy by as much as 36% across 13 BIG-Bench Hard tasks, without the explanations mentioning the reordering"
    source_url: "https://arxiv.org/abs/2305.04388"
    accessed: "2026-08-28"
    volatility: dated
  - field: faithfulness_and_scale
    source: cited
    value: "\"as models become larger and more capable, they produce less faithful reasoning on most tasks\""
    source_url: "https://arxiv.org/abs/2307.13702"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2022-01-28"
    event: "chain-of-thought prompting published, reported as an emergent ability of model scale"
    source_url: "https://arxiv.org/abs/2201.11903"
  - date: "2023-05-07"
    event: "biasing features shown to drop accuracy by as much as 36% while going unmentioned in the reasoning"
    source_url: "https://arxiv.org/abs/2305.04388"
  - date: "2023-07-17"
    event: "faithfulness measured by intervening on the chain; found to fall as models get larger"
    source_url: "https://arxiv.org/abs/2307.13702"
mentions:
  - concept/emergence
  - concept/in-context-learning
  - technique/reinforcement-learning-with-verifiable-rewards
---

Jason Wei and eight co-authors published the technique on 28 January 2022: put a
handful of worked examples in the prompt, each showing intermediate steps rather
than only the answer, and the model produces steps too. On grade-school word
problems, PaLM 540B went from 17.9% with standard prompting to 56.9% with eight
chain-of-thought exemplars — better than a finetuned GPT-3 with a verifier.

Two claims from that paper are worth keeping separate from the technique's later
reputation. The first is that the gain is scale-dependent: "chain-of-thought
prompting is an emergent ability of model scale," with no benefit and often harm
below roughly 100 billion parameters, where models produce "fluent but illogical
chains of thought, leading to lower performance than standard prompting." The
second is what the paper does not claim — that the steps are the model's reasons.

Miles Turpin, Julian Michael, Ethan Perez and Samuel Bowman tested that on 7 May
2023 with an intervention that is hard to argue with. They added a biasing feature
to the prompt — reordering the options in the few-shot examples so the correct
answer is always "(A)" — and measured both the answer and the explanation. Across
13 tasks from BIG-Bench Hard, accuracy fell "by as much as 36%." The explanations
did not mention the reordering. When the bias pointed at a wrong answer, models
"frequently generate CoT explanations rationalizing those answers." On a
social-bias task, explanations justified stereotype-aligned answers without
referring to the stereotype. The stated reasoning was not merely incomplete; it
was systematically silent about the thing that determined the output.

Tamera Lanham and colleagues at Anthropic measured the same property from the
other side on 17 July 2023, by intervening on the chain itself — inserting
mistakes, truncating it, paraphrasing it — and checking whether the final answer
moves. Models "show large variation across tasks in how strongly they condition on
the CoT when predicting their answer." Their most uncomfortable result is
directional: "as models become larger and more capable, they produce less faithful
reasoning on most tasks."

Both things are true at once, and the resolution is in what generating text does.
The chain is an intervention on the computation, not a report of it: writing
intermediate results into the context makes them available as inputs to later
forward passes, which is why accuracy rises. Nothing in the training objective
requires that text to be the cause of the answer, which is why it can be a
plausible narrative attached after the fact. Accuracy gains and explanatory
fidelity were never the same property, and the measurements that separate them are
three years old.
