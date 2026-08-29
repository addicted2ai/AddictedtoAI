---
job: seed-wiki-technique-rotary-position-embedding
verdict: approve
reasons: []
would-cite: >-
  The person claiming a RoPE model handles "any sequence length" because the
  math is length-free gets the two-year paper trail against it: Chen et al.'s
  "catastrophically high attention scores that completely ruin the
  self-attention mechanism", the ~600x interpolation-vs-extrapolation bound,
  and YaRN's flat "fail to generalize past the sequence length they were
  trained on".
reviewer: r5-fable
date: 2026-08-28
---

Checklist: wiki technique entry. Sources fetched 2026-08-28.

- arxiv.org/abs/2104.09864 (v1: 20 Apr 2021, matching first_published;
  authors Su, Lu, Pan, Murtadha, Wen, Liu as the timeline names them):
  abstract verbatim — "encodes the absolute position with a rotation matrix
  and meanwhile incorporates the explicit relative position dependency in
  self-attention formulation", and the three claimed properties exactly:
  "flexibility of sequence length, decaying inter-token dependency with
  increasing relative distances, and the capability of equipping the linear
  self-attention with relative position encoding". Both facts exact.
- arxiv.org/abs/2306.15595 (fetched full text via ar5iv): "extrapolating
  beyond the trained context length which may lead to catastrophically high
  attention scores that completely ruin the self-attention mechanism" —
  verbatim; "the upper bound of interpolation is at least ~600x smaller than
  that of extrapolation" — verbatim; extension "to up to 32768 with minimal
  fine-tuning (within 1000 steps)" across "7B to 65B LLaMA models", with the
  extended models "preserve quality relatively well on tasks within its
  original context window" — the position_interpolation_result fact's "short
  inputs relatively well preserved" is a fair rendering.
- arxiv.org/abs/2309.00071 (v1: 31 Aug 2023, matching the timeline): abstract
  verbatim — "these models fail to generalize past the sequence length they
  were trained on", "requiring 10x less tokens and 2.5x less training steps
  than previous methods", and "the capability to extrapolate beyond the
  limited context of a fine-tuning dataset", which backs the piece's "unlike
  plain interpolation" contrast.
- Not independently verified: the one-sentence gloss of YaRN's mechanism
  (treating rotation frequencies separately rather than uniformly) is from
  the paper's body, not re-fetched; it is the uncontested description of
  NTK-by-parts scaling and carries no number.

The entry's spine — "true of the equations from the first day and false of
the models for years afterwards" — is exactly what the three sources say in
sequence, and picking "flexibility of sequence length" out of the original
claims as the one that failed is sharp, honest reading. Definition-versus-
behaviour is the distinction an enthusiast takes away. Approve.
