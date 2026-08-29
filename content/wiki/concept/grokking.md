---
id: concept/grokking
kind: concept
display_name: "Grokking"
status: active
maintenance: stable
themes:
  - argument
aliases:
  - name: "Grokking"
    class: shared
  - name: "Delayed generalization"
    class: shared
facts:
  - field: delay_magnitude
    source: cited
    value: "\"Training accuracy becomes close to perfect at <10^3 optimization steps, but it takes close to 10^6 steps for validation accuracy to reach that level\""
    source_url: "https://ar5iv.labs.arxiv.org/html/2201.02177"
    accessed: "2026-08-28"
    volatility: static
  - field: weight_decay_effect
    source: cited
    value: "weight decay \"has a very large effect on data efficiency, more than halving the amount of samples needed compared to most other interventions\""
    source_url: "https://ar5iv.labs.arxiv.org/html/2201.02177"
    accessed: "2026-08-28"
    volatility: static
  - field: learned_algorithm
    source: cited
    value: "the modular-addition network was reverse-engineered as discrete Fourier transforms and trigonometric identities converting addition to rotation about a circle"
    source_url: "https://arxiv.org/abs/2301.05217"
    accessed: "2026-08-28"
    volatility: static
  - field: three_phases
    source: cited
    value: "memorization, circuit formation, cleanup — \"grokking, rather than being a sudden shift, arises from the gradual amplification of structured mechanisms encoded in the weights\""
    source_url: "https://arxiv.org/abs/2301.05217"
    accessed: "2026-08-28"
    volatility: static
timeline:
  - date: "2022-01-06"
    event: "grokking reported on small algorithmic datasets, with generalization arriving long past the overfitting point"
    source_url: "https://arxiv.org/abs/2201.02177"
  - date: "2023-01-12"
    event: "the grokked modular-addition circuit fully reverse-engineered, and the phase change shown to be gradual underneath"
    source_url: "https://arxiv.org/abs/2301.05217"
mentions:
  - concept/emergence
---

Alethea Power, Yuri Burda, Harri Edwards, Igor Babuschkin and Vedant Misra
reported on 6 January 2022 that a small transformer trained on a modular
arithmetic table can sit at perfect training accuracy and chance validation
accuracy for a very long time, and then, without any change to the setup,
generalize completely.

The scale of the delay is the whole reason the result is interesting. In their
words: "Training accuracy becomes close to perfect at <10^3 optimization steps,
but it takes close to 10^6 steps for validation accuracy to reach that level" —
"validation accuracy starts increasing beyond chance level only after 1000 times
more optimization steps than are required for training accuracy." The tasks are
deliberately tiny and complete: binary operation tables for addition,
subtraction, division and x²+y² modulo a prime, and composition on the symmetric
group on five elements. There is no test-set distribution shift, no data
augmentation, no curriculum. The network holds a full memorization of the
training half and, kept training on a loss it has already minimized, arrives at
the rule.

The finding that carries beyond the toy setting is about what governs the delay.
Weight
decay "has a very large effect on data efficiency, more than halving the amount
of samples needed compared to most other interventions," and decay toward the
origin beats decay toward the network's initialization. Grokking is not a curious
accident of long training; it is what happens when a regularizer keeps pressing
on a network that has already fit its data, and the memorizing solution is more
expensive to hold than the general one.

Neel Nanda, Lawrence Chan, Tom Lieberum, Jess Smith and Jacob Steinhardt then
opened the network, on 12 January 2023. They fully reverse-engineered the
algorithm a grokked modular-addition transformer implements, and it is not an
approximation of arithmetic: the model uses "discrete Fourier transforms and
trigonometric identities to convert addition to rotation about a circle,"
confirmed by reading the weights and by ablating in Fourier space. Having a
description of the mechanism let them define progress measures that a loss curve
does not show, and those measures split training into three continuous phases:
memorization, circuit formation, cleanup. Their conclusion states the correction:
"grokking, rather than being a sudden shift, arises from the gradual amplification
of structured mechanisms encoded in the weights, followed by the later removal of
memorizing components."

The generalizing circuit is being built throughout the plateau. Validation
accuracy stays flat because the memorizing components are still carrying the
output, and it jumps when they are removed — so the discontinuity is in what the
metric can see, not in what the network is doing. That is the same relationship
that separates emergent abilities from the smooth curves underneath them, arrived
at from the opposite direction: there by changing the metric, here by finding the
hidden variable the metric was hiding.
