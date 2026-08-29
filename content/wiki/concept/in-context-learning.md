---
id: concept/in-context-learning
kind: concept
display_name: "In-context learning"
status: active
maintenance: stable
themes:
  - argument
aliases:
  - name: "In-context learning"
    class: shared
  - name: "Few-shot prompting"
    class: shared
  - name: "ICL"
    class: manual
facts:
  - field: random_label_finding
    source: cited
    value: "randomly replacing the labels in demonstrations barely hurt performance, consistently over 12 models including GPT-3"
    source_url: "https://arxiv.org/abs/2202.12837"
    accessed: "2026-08-28"
    volatility: dated
  - field: what_demonstrations_supply
    source: cited
    value: "the label space, the distribution of the input text, and the overall format of the sequence"
    source_url: "https://arxiv.org/abs/2202.12837"
    accessed: "2026-08-28"
    volatility: static
  - field: flipped_label_scale_dependence
    source: cited
    value: "\"overriding semantic priors is an emergent ability of model scale\" — small models ignore flipped in-context labels, large models can follow them"
    source_url: "https://arxiv.org/abs/2303.03846"
    accessed: "2026-08-28"
    volatility: dated
  - field: induction_head_definition
    source: cited
    value: "a head showing prefix matching (attending back to tokens previously followed by the current token) and copying (raising the logit of the attended-to token)"
    source_url: "https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html"
    accessed: "2026-08-28"
    volatility: static
timeline:
  - date: "2022-02-25"
    event: "\"Rethinking the Role of Demonstrations\" posted, showing gold labels are largely dispensable"
    source_url: "https://arxiv.org/abs/2202.12837"
  - date: "2022-03-08"
    event: "induction heads identified, with a phase change visible as a bump in the training loss"
    source_url: "https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html"
  - date: "2023-03-07"
    event: "flipped-label experiments show the 2022 result is scale-dependent"
    source_url: "https://arxiv.org/abs/2303.03846"
mentions:
  - concept/emergence
  - concept/chain-of-thought
  - concept/scaling-laws
---

Put a few input-label pairs in the prompt and the model does better on the next
input, with no weight update. The obvious reading is that it learned the mapping
from the examples. That reading has been tested twice, with opposite-looking
results, and the pair is more informative than either alone.

Sewon Min and colleagues posted the first test on 25 February 2022. They replaced
the labels in the demonstrations with random ones — the pairing between input and
label deliberately destroyed — and measured what happened across classification
and multiple-choice tasks on twelve models including GPT-3. The answer:
"randomly replacing labels in the demonstrations barely hurts performance." What
did matter was three things the demonstrations still supplied even when
scrambled: the label space, the distribution of the input text, and the overall
format of the sequence. Show a model the shape of the task and it produces
answers of that shape; show it correct answers as well and, on those models, you
gained little.

Jerry Wei and co-authors ran the sharper version on 7 March 2023, using labels
flipped rather than randomised, so that following the demonstrations means
contradicting what pretraining says. Small models ignored the flip and answered
from their priors — which is exactly the behaviour Min's result predicts, and
which reads as "demonstrations don't teach the mapping." Large models followed the
flipped labels. Their conclusion is that "overriding semantic priors is an
emergent ability of model scale," and they push it further with semantically
unrelated labels (`foo`/`bar` in place of positive/negative), where nothing but
the in-context mapping can carry the task; large enough models perform even
linear classification that way.

So the widely circulated claim that in-context examples do not need correct labels
is a finding about a particular class of models, not a property of the mechanism.
It stopped holding as models grew.

On the mechanism itself, the account with a circuit attached to it is Olsson and
colleagues, 8 March 2022. An induction head is a specific two-part circuit: prefix matching
("the head attends back to previous tokens that were followed by the current
and/or recent tokens") and copying ("the head's output increases the logit
corresponding to the attended-to token"). Given `[A][B] … [A]`, it predicts `[B]`.
These heads form during a narrow window early in training that shows up as a
visible bump in the loss curve of every multi-layer model they trained, and
in-context learning improves sharply at the same moment. Their hypothesis is that
induction heads "might constitute the mechanism for the actual majority of all
in-context learning in large transformer models."

The two literatures answer different questions and are often merged into one
wrong summary. What demonstrations supply is a question about inputs; what
consumes them is a question about circuits. A copying circuit will happily copy a
wrong label, which is why scrambling labels can cost so little — and why, once a
model is large enough to prefer the in-context evidence over its priors,
scrambling starts to cost a great deal.
