---
id: concept/model-collapse
kind: concept
display_name: "Model collapse"
status: active
maintenance: stable
themes:
  - argument
aliases:
  - name: "Model collapse"
    class: shared
  - name: "The curse of recursion"
    class: shared
facts:
  - field: definition
    source: cited
    value: "\"use of model-generated content in training causes irreversible defects in the resulting models, where tails of the original content distribution disappear\""
    source_url: "https://arxiv.org/abs/2305.17493"
    accessed: "2026-08-28"
    volatility: static
  - field: journal_publication
    source: cited
    value: "Nature, volume 631, issue 8022, pages 755-759, published 24 July 2024"
    source_url: "https://api.crossref.org/works/10.1038/s41586-024-07566-y"
    accessed: "2026-08-28"
    volatility: static
  - field: experiment_setup
    source: cited
    value: "OPT-125m finetuned on wikitext2; each generation trained on 5-way beam-search continuations from the previous generation, in one arm with no original data retained and in another with 10% retained"
    source_url: "https://arxiv.org/abs/2305.17493"
    accessed: "2026-08-28"
    volatility: static
  - field: accumulation_result
    source: cited
    value: "\"accumulating the successive generations of synthetic data alongside the original real data avoids model collapse\"; test error acquires a finite upper bound independent of the number of iterations"
    source_url: "https://arxiv.org/abs/2404.01413"
    accessed: "2026-08-28"
    volatility: static
timeline:
  - date: "2023-05-27"
    event: "\"The Curse of Recursion\" posted, naming model collapse and demonstrating it in VAEs, Gaussian mixtures and language models"
    source_url: "https://arxiv.org/abs/2305.17493"
  - date: "2024-04-01"
    event: "accumulate-versus-replace shown to decide the outcome, with a proved finite error bound under accumulation"
    source_url: "https://arxiv.org/abs/2404.01413"
  - date: "2024-07-24"
    event: "published in Nature, after which the finding circulated as a claim about the future of web-scraped training data"
    source_url: "https://api.crossref.org/works/10.1038/s41586-024-07566-y"
mentions:
  - concept/scaling-laws
---

Ilia Shumailov and colleagues posted the result on 27 May 2023 and it reached
Nature on 24 July 2024, where it was read as a prediction about the open web: as
generated text fills the internet, models trained on it will degrade. The paper's
own definition is narrower and more precise — "use of model-generated content in
training causes irreversible defects in the resulting models, where tails of the
original content distribution disappear" — and the experiment that produced it
makes an assumption that the popular reading drops.

The language-model demonstration finetunes OPT-125m on wikitext2, then generates
a fresh corpus of the same size by asking the model to continue each training
sequence with 5-way beam search, then trains the next generation on that. Two
arms: one keeps none of the original data, one keeps a random tenth of it each
generation. The published sample is the readable part of the finding. A passage
about English Perpendicular Revival church architecture survives generation 0
roughly intact; by generation 1 it has drifted to basilicas and an invented claim
about Pope Innocent III; by generation 7 the model is enumerating "black-tailed
jackrabbits, white-tailed jackrabbits, blue-tailed jackrabbits, red-tailed
jackrabbits, yellow-". The tails go first — rare constructions, rare facts — and
what remains is the mode, repeated.

Why it happens needs no mystery: each generation samples finitely from its
predecessor, so low-probability events are sometimes not drawn at all, and what is
not drawn cannot be represented in the next fit. The error compounds because the
next model treats its own truncated sample as the target distribution.

The assumption to notice is *replacement*. Every generation in that setup trains
on its predecessor's output instead of on the original data. Matthias
Gerstgrasser and thirteen co-authors tested the alternative on 1 April 2024 and
stated the objection plainly: those studies "largely assumed that new data replace
old data over time, where an arguably more realistic assumption is that data
accumulate over time." They confirmed collapse under replacement, then showed that
"accumulating the successive generations of synthetic data alongside the original
real data avoids model collapse" — across model sizes, architectures and
hyperparameters, and in diffusion models for molecule conformations and
variational autoencoders for images. In the analytically tractable linear case
they proved it: under accumulation the test error has a finite upper bound
independent of the number of iterations.

That is the load-bearing distinction, and it is the one that goes missing when the
result is summarised. The web does not delete last year's pages when this year's
are published, and no lab discards its pre-2022 corpus. The demonstrated
catastrophe is real for a pipeline that trains only on its predecessor's output —
a closed self-training loop, a synthetic-data flywheel with no real anchor — and
is not demonstrated for a corpus that grows.
