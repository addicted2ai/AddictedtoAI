---
id: technique/rotary-position-embedding
kind: technique
display_name: "Rotary Position Embedding"
status: active
maintenance: stable
aliases:
  - name: "Rotary Position Embedding"
    class: exclusive
  - name: "Rotary position embeddings"
    class: shared
  - name: "RoPE"
    class: manual
  - name: "Position Interpolation"
    class: shared
  - name: "YaRN"
    class: manual
themes:
  - argument
facts:
  - field: first_published
    source: cited
    value: "2021-04-20"
    source_url: "https://arxiv.org/abs/2104.09864"
    accessed: "2026-08-28"
    volatility: dated
  - field: mechanism
    source: cited
    value: "absolute position is encoded with a rotation matrix applied to the query and key vectors, which puts explicit relative position dependency into the self-attention formulation"
    source_url: "https://arxiv.org/abs/2104.09864"
    accessed: "2026-08-28"
    volatility: static
  - field: claimed_properties
    source: cited
    value: "the flexibility of sequence length, decaying inter-token dependency with increasing relative distances, and the capability of equipping linear self-attention with relative position encoding"
    source_url: "https://arxiv.org/abs/2104.09864"
    accessed: "2026-08-28"
    volatility: static
  - field: extrapolation_failure
    source: cited
    value: "extrapolating beyond the trained length may lead to catastrophically high attention scores that completely ruin the self-attention mechanism"
    source_url: "https://arxiv.org/abs/2306.15595"
    accessed: "2026-08-28"
    volatility: dated
  - field: interpolation_bound
    source: cited
    value: "the upper bound of interpolation is at least around 600x smaller than that of extrapolation"
    source_url: "https://arxiv.org/abs/2306.15595"
    accessed: "2026-08-28"
    volatility: dated
  - field: position_interpolation_result
    source: cited
    value: "LLaMA models from 7B to 65B stretched to 32768 positions within 1000 fine-tuning steps, with quality on short inputs relatively well preserved"
    source_url: "https://arxiv.org/abs/2306.15595"
    accessed: "2026-08-28"
    volatility: dated
  - field: generalisation_limit
    source: cited
    value: "these models fail to generalize past the sequence length they were trained on"
    source_url: "https://arxiv.org/abs/2309.00071"
    accessed: "2026-08-28"
    volatility: static
  - field: yarn_efficiency
    source: cited
    value: "10x fewer tokens and 2.5x fewer training steps than previous context-extension methods"
    source_url: "https://arxiv.org/abs/2309.00071"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2021-04-20"
    event: "RoPE published in RoFormer by Su, Lu, Pan, Murtadha, Wen and Liu"
    source_url: "https://arxiv.org/abs/2104.09864"
  - date: "2023-06-27"
    event: "Position Interpolation extends RoPE models by down-scaling position indices rather than extrapolating"
    source_url: "https://arxiv.org/abs/2306.15595"
  - date: "2023-08-31"
    event: "YaRN extends the same models at a fraction of the training cost"
    source_url: "https://arxiv.org/abs/2309.00071"
mentions:
  - concept/effective-context-length
  - concept/kv-cache
---

Position has to enter attention somehow, and the dot product between a query and a
key is indifferent to where either came from. RoPE's answer:
{{fact:technique/rotary-position-embedding#mechanism}}. Rotate the query at
position *m* and the key at position *n* by angles proportional to their indices,
and the angle between them depends on *m − n* alone. Nothing is added to the
residual stream, no parameters are learned, and the operation is a pairwise
rotation of adjacent channels — cheap enough to sit inside the attention kernel.

That is the design almost every open-weight decoder now ships, and it displaced
learned absolute embeddings for a specific reason: a learned table has a last row.

**What the paper claimed, in its own words.** RoPE offers
{{fact:technique/rotary-position-embedding#claimed_properties}}. The first of
those is the one that entered general belief, and it is the one that did not
survive contact with longer inputs.

**What was measured.** Chen and colleagues (2023-06-27) state the failure
directly: {{fact:technique/rotary-position-embedding#extrapolation_failure}}. Their
theoretical version of the same point is a ratio rather than an adjective —
{{fact:technique/rotary-position-embedding#interpolation_bound}}. Two months later
YaRN opens by asserting the general case:
{{fact:technique/rotary-position-embedding#generalisation_limit}}. The formula is
defined at every position; the model is not trained at every position, and a
rotation angle it has never seen produces a score distribution it has never seen.

**The fix inverted the claim.** Instead of running positions off the end of the
trained range, Position Interpolation linearly down-scales the position indices so
a longer input lands inside the range the model already knows — the sequence is
squeezed, not extended. It is cheap:
{{fact:technique/rotary-position-embedding#position_interpolation_result}}. YaRN
then treated the rotation frequencies separately rather than scaling them
uniformly, reporting {{fact:technique/rotary-position-embedding#yarn_efficiency}}
and, unlike plain interpolation, an ability to run past the length its own
fine-tuning data contained.

The distinction worth carrying away is between a definition and a behaviour. "Any
sequence length" was true of the equations from the first day and false of the
models for years afterwards, and every context-extension paper since has been an
attempt to close that gap by paying training compute for it. What such a model
does with the positions it gains is a separate measurement again.
