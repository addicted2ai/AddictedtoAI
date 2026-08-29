---
job: seed-wiki-model-meta-muse-glimmer-30b
verdict: revise
reasons:
  - false-or-unsupported-claim
  - overclaiming-summary
would-cite: >-
  Someone claiming Meta has fully returned to open weights would be answered
  here: what shipped Apache-2.0 in August 2026 was the ~29.6B distilled
  student, while the Muse Spark teacher it came from stayed proprietary —
  the open release and the flagship are not the same model.
reviewer: r8-opus
date: 2026-08-28
---

Checklist: model entry, two cited sources plus one cross-entry org fact.
All re-fetched 2026-08-28; feed checked against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows).

**Verified:**
- https://huggingface.co/meta-models/Muse-Glimmer-30B resolves. Licence
  "apache-2.0" ✓. Parameters "~29.6B" with a "~1.8B param ViT-G/14, 50
  layers, width 1536, patch size 14" perception encoder — the `parameters`
  fact ("about 29.6B, including a 1.8B vision encoder") is accurate, and
  29.6 − 1.8 = 27.8, so "closer to 28B" is right. "distilled from Muse Spark"
  ✓.
- https://en.wikipedia.org/wiki/Muse_Spark resolves and states verbatim that
  it "can be run entirely offline on a single 24 GB consumer GPU", which is
  the `local_hardware` fact word for word, and gives the 2026-08-10 release
  date matching `release_date`.
- Feed: meta/muse-glimmer-30b lists 0.00000035 input / 0.0000015 output over
  131072 context, so the "carries an OpenRouter price" paragraph is accurate.
- `{{fact:org/meta-superintelligence-labs#flagship_weights}}` resolves to a
  declared field ("closed; Meta says it hopes to open-source future versions
  of the model"). All 9 transclusions resolve.

**Defect 1 — "the model it was distilled from is not offered either way" is
false, and the next sentence contradicts it.**
The two "ways" the page has just established are renting by the token and
downloading the weights. Muse Spark is offered the first way, and the page's
own sources say so:
- Wikipedia (the page's own citation) lists Muse Spark as available "via the
  Meta Model API" and "through OpenRouter".
- `meta/muse-spark-1.2` is a row in *this catalog*, at 0.00000125 input /
  0.00000425 output over a 1,048,576 context — and this entry lists
  `model/meta-muse-spark-1-2` in its own `mentions`.
The following sentence, "The lab kept the larger model behind the API",
asserts the opposite of "not offered either way" within two sentences. The
intended claim is presumably "the weights are not offered"; as written it is
a checkable falsehood contradicted by the site's own feed.

**Defect 2 — the 24 GB reasoning is inverted, and overstates the source.**
The page argues that stripping the vision encoder leaves "closer to 28B,
small enough that [running offline on a 24 GB GPU] is the ordinary case for
this row rather than a stretch". Parameter count is not what makes it fit: a
~28B model at bf16 is roughly 56 GB of weights and does not go into 24 GB at
all. The model card is explicit that quantization is what does it —
"shrinking the language model to under 20 GB. This leaves enough headroom
for the model's KV cache, the perception encoder for image understanding,
and the speculative decoding drafter to run simultaneously within a 24 GB or
32 GB envelope." So the card's claim is conditional on quantization, and the
page recasts it as an unconditional consequence of model size. The
observation is salvageable — it is genuinely notable that a multimodal model
fits a single consumer card *once quantized* — but the causal explanation as
written is wrong.

**Defect 3 — source misattribution, visible in the front matter.**
The prose calls the 24 GB line "the card's other claim". The
`local_hardware` fact's own `source_url` is the Wikipedia Muse Spark article,
not the model card. Attribute it to Wikipedia, or cite the card's
quantization sentence instead — but not the card for Wikipedia's wording.

**Defect 4 — an unverified timeline claim.** The timeline entry "Meta's first
open-weight release since the Llama line ended" is sourced to the Hugging
Face card. I could not find that claim on the card, and Wikipedia does not
make it either. Not necessarily false — but currently unsupported by the URL
attached to it, and a "first since" superlative needs a source.

**Also recorded:** the `release_date` fact says 2026-08-10 (Wikipedia) while
the feed's `created` is 2026-08-09T19:06:34Z. A few hours apart across a
timezone boundary; not a defect, but the page should not be read as
precision-dating the announcement.

The premise — an open, multimodal, locally-runnable student whose teacher
stayed closed — is a real payload and the licence-and-hardware angle is the
right one for this row. But two of its three paragraphs contain a claim
contradicted by its own cited sources or its own catalog. Revise.
