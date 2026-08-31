---
id: concept/chain-of-thought
kind: concept
display_name: "Chain-of-thought faithfulness"
status: active
maintenance: stable
themes:
  - argument
aliases:
  - name: "Chain of thought"
    class: shared
  - name: "CoT"
    class: manual
facts:
  - field: bias_induced_accuracy_drop
    source: cited
    value: "reordering multiple-choice options so the answer is always \"(A)\" dropped accuracy by as much as 36% across 13 BIG-Bench Hard tasks, without the explanations mentioning the reordering"
    source_url: "https://arxiv.org/abs/2305.04388"
    accessed: "2026-08-28"
    volatility: dated
  - field: faithfulness_and_scale
    source: cited
    value: "\"as models become larger and more capable, they produce less faithful reasoning on most tasks we study\""
    source_url: "https://arxiv.org/abs/2307.13702v1"
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
  - technique/chain-of-thought-prompting
  - concept/emergence
  - concept/in-context-learning
  - technique/reinforcement-learning-with-verifiable-rewards
---

Chain-of-thought prompting puts worked steps in the few-shot exemplars and the
model produces steps too; what it buys in accuracy, and where that gain does and
does not hold, is the technique entry's subject. This page is about the claim the
January 2022 paper never made, and that its reputation acquired anyway: that the
steps are the model's reasons.

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
reasoning on most tasks we study."

Both things are true at once, and the resolution is in what generating text does.
The chain is an intervention on the computation, not a report of it: writing
intermediate results into the context makes them available as inputs to later
forward passes, which is why accuracy rises. Nothing in the training objective
requires that text to be the cause of the answer, which is why it can be a
plausible narrative attached after the fact. Accuracy gains and explanatory
fidelity were never the same property, and the measurements that separate them are
three years old.
