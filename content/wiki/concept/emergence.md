---
id: concept/emergence
kind: concept
display_name: "Emergent abilities"
status: active
maintenance: stable
themes:
  - argument
aliases:
  - name: "Emergent abilities"
    class: shared
  - name: "Emergent abilities of large language models"
    class: shared
  - name: "Emergence"
    class: manual
facts:
  - field: original_definition
    source: cited
    value: "\"We consider an ability to be emergent if it is not present in smaller models but is present in larger models.\""
    source_url: "https://arxiv.org/abs/2206.07682"
    accessed: "2026-08-28"
    volatility: static
  - field: metric_concentration
    source: cited
    value: "2 metrics account for more than 92% of claimed emergent abilities on BIG-Bench: Multiple Choice Grade and Exact String Match"
    source_url: "https://arxiv.org/abs/2304.15004"
    accessed: "2026-08-28"
    volatility: dated
  - field: metrics_showing_emergence
    source: cited
    value: "emergent abilities appear under 4 of 39 hand-annotated BIG-Bench metrics"
    source_url: "https://arxiv.org/abs/2304.15004"
    accessed: "2026-08-28"
    volatility: dated
  - field: induced_in_vision
    source: cited
    value: "emergence induced by metric choice in fully connected, convolutional and self-attentional networks — autoencoders on CIFAR100, a LeNet on MNIST, autoregressive transformers on Omniglot"
    source_url: "https://arxiv.org/abs/2304.15004"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2022-06-15"
    event: "\"Emergent Abilities of Large Language Models\" posted, defining emergence by presence-in-large, absence-in-small"
    source_url: "https://arxiv.org/abs/2206.07682"
  - date: "2023-04-28"
    event: "\"Are Emergent Abilities of Large Language Models a Mirage?\" posted, attributing sharpness to metric choice"
    source_url: "https://arxiv.org/abs/2304.15004"
mentions:
  - concept/scaling-laws
  - concept/grokking
  - concept/chain-of-thought
  - concept/in-context-learning
---

The claim that made emergence interesting was never "big models are better." It
was that some abilities arrive discontinuously and at an unforeseeable size. Wei
and fifteen co-authors set the definition on 15 June 2022: "We consider an ability
to be emergent if it is not present in smaller models but is present in larger
models. Thus, emergent abilities cannot be predicted simply by extrapolating the
performance of smaller models." Both halves of the appeal are in that sentence —
sharpness and unpredictability — and both are properties of a plotted curve.

Rylan Schaeffer, Brando Miranda and Sanmi Koyejo pointed out on 28 April 2023
what else that curve depends on. Fix the model outputs; change only the scoring
function. Exact String Match awards nothing for a fifty-character answer with one
character wrong, so a model steadily improving its per-character accuracy scores
zero, zero, zero, then suddenly non-zero. Token edit distance on the same outputs
rises smoothly the whole way. Their claim is narrow and testable: "nonlinear or
discontinuous metrics produce apparent emergent abilities, whereas linear or
continuous metrics produce smooth, continuous predictable changes in model
performance."

The supporting evidence is what makes the paper hard to wave away. A meta-analysis
of BIG-Bench found emergence under 4 of 39 hand-annotated metrics, and that two
metrics — Multiple Choice Grade and Exact String Match — "account for >92% of
claimed emergent abilities." Then, having predicted the effect, they manufactured
it: never-before-reported emergent abilities produced on demand in convolutional,
fully connected and self-attentional networks, including a LeNet on MNIST
digits, shallow autoencoders reconstructing CIFAR100, and autoregressive
transformers classifying Omniglot characters. No language model, no new scale
frontier, no new training run. Only a metric swapped for a discontinuous one.

What survives is worth stating precisely, because the paper is often cited as
having shown emergence is fake. It did not. It showed that the sharpness and the
unpredictability — the two properties that made the concept load-bearing — are
properties of the researcher's choice of metric for a fixed set of model outputs.
Capabilities still improve with scale, and the underlying improvement is smooth
and, on continuous measures, extrapolable. What evaporates is the discontinuity.

The practical consequence is a question to ask of any emergence claim: on what
metric, and does the same data plotted with a continuous one still have a kink in
it? The same question separates grokking's apparent phase change from the gradual
circuit formation underneath it, and the two literatures are the same finding
about different objects — a jump in a plot is not evidence of a jump in a network.
