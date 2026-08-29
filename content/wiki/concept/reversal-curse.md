---
id: concept/reversal-curse
kind: concept
display_name: "The reversal curse"
status: active
maintenance: stable
themes:
  - argument
aliases:
  - name: "The Reversal Curse"
    class: shared
  - name: "Reversal curse"
    class: shared
facts:
  - field: celebrity_asymmetry
    source: cited
    value: "GPT-4 answered \"Who is Tom Cruise's mother?\" correctly 79% of the time and the reverse, \"Who is Mary Lee Pfeiffer's son?\", 33% of the time"
    source_url: "https://arxiv.org/abs/2309.12288"
    accessed: "2026-08-28"
    volatility: dated
  - field: likelihood_claim
    source: cited
    value: "after finetuning on \"A is B\", the likelihood of the correct answer to the reversed question is not higher than for a random name"
    source_url: "https://arxiv.org/abs/2309.12288"
    accessed: "2026-08-28"
    volatility: static
  - field: robustness
    source: cited
    value: "\"robust across model sizes and model families and is not alleviated by data augmentation\""
    source_url: "https://arxiv.org/abs/2309.12288"
    accessed: "2026-08-28"
    volatility: static
  - field: in_context_exception
    source: cited
    value: "\"if 'A is B' appears in-context, models can deduce the reverse relationship\""
    source_url: "https://arxiv.org/abs/2309.12288"
    accessed: "2026-08-28"
    volatility: static
timeline:
  - date: "2023-09-21"
    event: "\"The Reversal Curse\" posted, with finetuning experiments on GPT-3 and Llama-1 and celebrity-relation evaluations of GPT-4"
    source_url: "https://arxiv.org/abs/2309.12288"
mentions:
  - concept/in-context-learning
  - concept/hallucination
---

Lukas Berglund and six co-authors posted a result on 21 September 2023 that is
easy to state and hard to explain away: a model finetuned on "A is B" does not
thereby learn "B is A."

The experiment is synthetic on purpose. They finetuned GPT-3 and Llama-1 on
invented statements — "Uriah Hawthorne is the composer of Abyssal Melodies" — so
that no pretraining knowledge could leak in, then asked "Who composed Abyssal
Melodies?" The models fail. The measurement that makes this more than an anecdote
about decoding is the likelihood check: the correct answer's probability "will not
be higher than for a random name." The model has not learned the fact weakly, or
learned it and lost it at sampling time. In the reversed direction the fact is
absent.

The effect is "robust across model sizes and model families and is not alleviated
by data augmentation," and it survives outside the synthetic setting. On
real-world celebrity relations, GPT-4 answered "Who is Tom Cruise's mother?"
correctly 79% of the time and "Who is Mary Lee Pfeiffer's son?" 33% of the time —
the same fact, the same model, the ordering being the only difference.

The mechanism is the training objective, and it is worth being exact about which
part. Gradient descent on next-token prediction updates weights to raise the
probability of what followed, given what preceded. A sequence in which "Abyssal
Melodies" follows "Uriah Hawthorne is the composer of" produces no gradient on
any sequence in which the two are ordered the other way; those are different
inputs. The corpus overwhelmingly supports the meta-pattern that if "A is B"
occurs then "B is A" is more likely to occur — the paper's own framing — and the
model does not induce it. Logical symmetry is not something next-token training
gets for free; it has to appear in the data in both orders.

The exception in the abstract is the part usually dropped when the result is
quoted, and it locates the failure precisely: "if 'A is B' appears in-context,
models can deduce the reverse relationship." The forward pass can do the
inversion. What cannot do it is the process that writes facts into weights. That
distinction is why retrieval-augmented setups sidestep the curse — they put the
statement back in the context window — and why the curse says nothing about a
model's reasoning capacity, only about the shape of what pretraining stored.
