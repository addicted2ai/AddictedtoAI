---
id: event/attention-is-all-you-need
kind: event
display_name: "Attention Is All You Need"
status: dead
maintenance: dormant
themes:
  - history
  - argument
aliases:
  - name: "Attention Is All You Need"
    class: shared
  - name: "the Transformer paper"
    class: shared
facts:
  - field: arxiv_id
    source: cited
    value: "arXiv:1706.03762"
    source_url: "https://arxiv.org/abs/1706.03762"
    accessed: "2026-08-28"
    volatility: static
  - field: authors
    source: cited
    value: 8
    source_url: "https://arxiv.org/abs/1706.03762"
    accessed: "2026-08-28"
    volatility: static
  - field: training_hardware
    source: cited
    value: "one machine with 8 NVIDIA P100 GPUs"
    source_url: "https://ar5iv.labs.arxiv.org/html/1706.03762"
    accessed: "2026-08-28"
    volatility: static
  - field: training_flops_big
    source: cited
    value: "2.3e19"
    source_url: "https://ar5iv.labs.arxiv.org/html/1706.03762"
    accessed: "2026-08-28"
    volatility: static
  - field: latest_arxiv_version
    source: cited
    value: "v7, 2 August 2023"
    source_url: "https://arxiv.org/abs/1706.03762"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2017-06-12"
    event: "first arXiv version posted"
    source_url: "https://arxiv.org/abs/1706.03762"
  - date: "2020-02-12"
    event: "Xiong et al. show the paper's layer-norm placement is why warm-up is needed"
    source_url: "https://arxiv.org/abs/2002.04745"
  - date: "2023-08-02"
    event: "seventh arXiv version posted, six years after the first"
    source_url: "https://arxiv.org/abs/1706.03762"
mentions:
  - concept/scaling-laws
---

The paper that removed recurrence from sequence modelling was posted to arXiv
on 12 June 2017 by Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit,
Llion Jones, Aidan N. Gomez, Lukasz Kaiser and Illia Polosukhin, under a
first-page footnote that opens: "Equal contribution. Listing order is random."

That is where the quotation almost always stops. The footnote does not. It
runs on for six more sentences apportioning the work by name — "Jakob proposed
replacing RNNs with self-attention and started the effort to evaluate this
idea", "Noam proposed scaled dot-product attention, multi-head attention and
the parameter-free position representation", and four more like them. The
paper declines to rank its eight authors and then records, in the same
breath, exactly what each of them did. The half that gets quoted is the half
that says less.

Three things about it are consistently misremembered.

**It is a machine-translation paper.** The results section reports 28.4 BLEU
on the WMT 2014 English-to-German task and a single-model score of 41.8 on
English-to-French. The only evidence offered that the architecture is good for
anything else is section 6.3, which opens: "To evaluate if the Transformer can
generalize to other tasks we performed experiments on English constituency
parsing." That is the entire generality argument in the original — one parsing
experiment. The conclusion's forward look is about modality, not scale: "We
plan to extend the Transformer to problems involving input and output
modalities other than text and to investigate local, restricted attention
mechanisms to efficiently handle large inputs and outputs such as images,
audio and video." Nobody in it is predicting a chatbot.

**It ran on one machine.** From section 5.2: "We trained our models on one machine
with 8 NVIDIA P100 GPUs." The base model took 100,000 steps, about twelve
hours. The big model took 300,000 steps, 3.5 days. Table 2 puts the training
cost at 3.3 × 10^18 floating-point operations for the base model and
2.3 × 10^19 for the big one. That is the whole budget of the experiment that
introduced the architecture: a single eight-GPU box, run for under four days.
Three years later GPT-3 used the same architecture with 175 billion parameters
over 300 billion tokens.

**The architecture as published is not the one that got used.** In section 3.1
the paper specifies that "the output of each sub-layer is LayerNorm(x + Sublayer(x))" —
normalisation applied after the residual addition, now called post-LN. On
12 February 2020 Xiong et al. proved with mean-field analysis why that
placement makes the notorious learning-rate warm-up stage necessary: at
initialisation, expected gradients near the output layer are large, so a large
learning rate destabilises training and warm-up is the workaround. Move the
normalisation inside the residual block — pre-LN — and "the gradients are
well-behaved at initialization," and the warm-up stage can be dropped. Pre-LN
is what large models are actually built from. The diagram in Figure 1 is a
diagram of a variant that was superseded within three years.

One further detail visible only from the record itself: arXiv shows seven
versions, the most recent posted 2 August 2023. The canonical paper of the era
was still being edited six years after publication, which is why a quotation
from it can be checked and still not match the reader's copy.
