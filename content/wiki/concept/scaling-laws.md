---
id: concept/scaling-laws
kind: concept
display_name: Scaling laws
status: active
maintenance: stable
themes:
  - argument
  - history
aliases:
  - name: neural scaling laws
    class: exclusive
  - name: scaling laws
    class: shared
  - name: Chinchilla scaling
    class: shared
facts:
  - field: kaplan_paper
    source: cited
    value: "Kaplan et al., Scaling Laws for Neural Language Models, 23 January 2020"
    source_url: "https://arxiv.org/abs/2001.08361"
    accessed: "2026-08-28"
    volatility: static
  - field: hoffmann_paper
    source: cited
    value: "Hoffmann et al., Training Compute-Optimal Large Language Models, 29 March 2022"
    source_url: "https://arxiv.org/abs/2203.15556"
    accessed: "2026-08-28"
    volatility: static
  - field: chinchilla_rule
    source: cited
    value: "for every doubling of model size the number of training tokens should also be doubled"
    source_url: "https://arxiv.org/abs/2203.15556"
    accessed: "2026-08-28"
    volatility: static
  - field: chinchilla_models_trained
    source: cited
    value: "over 400 language models, 70 million to over 16 billion parameters"
    source_url: "https://arxiv.org/abs/2203.15556"
    accessed: "2026-08-28"
    volatility: static
  - field: replication_finding
    source: cited
    value: "the reported confidence intervals would require roughly 600,000 training runs; the authors likely had 400 to 500 data points"
    source_url: "https://arxiv.org/abs/2404.10102"
    accessed: "2026-08-28"
    volatility: static
timeline:
  - date: "2020-01-23"
    event: "Kaplan et al. publish power-law scaling and the large-model, modest-data prescription"
    source_url: "https://arxiv.org/abs/2001.08361"
  - date: "2022-03-29"
    event: "Hoffmann et al. find current models significantly undertrained and propose equal scaling"
    source_url: "https://arxiv.org/abs/2203.15556"
  - date: "2023-02-27"
    event: "LLaMA trains past the compute-optimal point on purpose, optimising inference cost instead"
    source_url: "https://arxiv.org/abs/2302.13971"
  - date: "2024-04-15"
    event: "Besiroglu et al. fail to replicate Hoffmann's third estimation method"
    source_url: "https://arxiv.org/abs/2404.10102"
  - date: "2024-06-27"
    event: "Porian et al. reproduce Kaplan's law and trace the disagreement to three engineering choices"
    source_url: "https://arxiv.org/abs/2406.19146"
mentions:
  - concept/the-bitter-lesson
  - event/attention-is-all-you-need
---

A scaling law is a fitted curve plus a decision about what is being held
fixed. The curves have been good. The decisions have been revised twice, and
the second revision was forced by an arithmetic error in the paper everyone
was quoting.

**2020: spend it on parameters.** Kaplan et al., published 23 January 2020,
found that cross-entropy loss "scales as a power-law with model size, dataset
size, and the amount of compute used for training, with some trends spanning
more than seven orders of magnitude," and drew the operational conclusion that
"optimally compute-efficient training involves training very large models on a
relatively modest amount of data and stopping significantly before
convergence." GPT-3 is that sentence executed: 175 billion parameters, 300
billion tokens. The GPT-3 paper says so in the caption of its own scaling
figure — "Based on the analysis in Scaling Laws For Neural Language Models we
train much larger models on many fewer tokens than is typical."

**2022: no, spend it equally.** Hoffmann et al., 29 March 2022, trained "over
400 language models ranging from 70 million to over 16 billion parameters on 5
to 500 billion tokens" and concluded that "for compute-optimal training, the
model size and the number of training tokens should be scaled equally: for
every doubling of model size the number of training tokens should also be
doubled." The demonstration was Chinchilla — 70 billion parameters, four times
Gopher's data, the same compute budget — beating Gopher at 280 billion,
GPT-3 at 175 billion, Jurassic-1 at 178 billion and Megatron-Turing NLG at 530
billion — four models each larger than the one that beat them.

**2024: the disagreement was engineering, and one of the fits was broken.**
Two papers took the pair apart in the same year.

Besiroglu, Erdil, Barnett and You (15 April 2024) tried to replicate
Hoffmann's third estimation method and could not. The published confidence
intervals were too narrow to be possible: reproducing them "would need to have
access to the results from nearly 240×2116=600,000 training runs," where the
authors "likely had between 400 and 500 data points." After the replication
appeared, a lead author of the Chinchilla paper supplied the cause — the
minimiser was averaging Huber loss values over examples instead of summing
them, which raised the loss scale and terminated L-BFGS-B early during both
the fit and the bootstrap, leaving the bootstrapped parameters near their
initialisation. The headline rule survived; the third method's error bars did
not.

Porian, Wortsman, Jitsev, Schmidt and Carmon (27 June 2024) went after the
other end and reproduced Kaplan's law on two datasets, then removed the
disagreement with three corrections: counting the decoding layer's compute
(Hoffmann did, Kaplan did not), shortening a fixed-length warm-up that was too
long for small models and inflated their optimal token counts, and tuning
learning rate, batch size and the AdamW β₂ parameter per model size. With
those fixed, Kaplan's setup agrees with Chinchilla. The two laws were never
measuring different worlds; they were measuring the same world with different
training defaults.

**And the objective moved.** LLaMA, 27 February 2023, trained deliberately
past the compute-optimal point — the smallest model on a trillion tokens, the
largest on 1.4 trillion — with the reasoning stated plainly: "Although it may
be cheaper to train a large model to reach a certain level of performance, a
smaller one trained longer will ultimately be cheaper at inference." Chinchilla
optimality answers "what is the best model I can train for this compute." A
model that will be served answers a different question, and the optimum moves.

The useful reading is that "the scaling law" is three separable things: an
empirical power law, which has held; a fit, which was wrong in a checkable way
and got corrected; and a choice of objective, which is a business decision and
has changed at least once. Arguments that cite the first to settle the third
are skipping two steps.
