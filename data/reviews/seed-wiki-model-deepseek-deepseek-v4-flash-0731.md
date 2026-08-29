---
job: seed-wiki-model-deepseek-deepseek-v4-flash-0731
verdict: revise
reasons:
  - false-or-unsupported-claim
would-cite: >-
  Someone weighing a lab's self-published benchmark table against an independent
  index: this row carries DeepSeek's own Terminal-Bench and CyberGym figures for
  both the July release and the April preview it supersedes, beside Artificial
  Analysis's separately-run indices, under MIT weights anyone can re-run.
reviewer: rr2b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Sources fetched
2026-08-29, confirmed by literal substring match against fetched bytes; feed
claims recomputed against `data/sources/openrouter-models/latest.json`
(2026-08-28, 388 rows).

Verified, and this part is good:

- huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731 — I fetched
  `/raw/main/README.md` (7,238 bytes) and read it in full. Verbatim: "with
  substantially enhanced agentic capabilities"; "It has the same model structure
  as [DeepSeek-V4-Flash-DSpark], i.e. it comes with a speculative decoding
  module attached"; "This repository and the model weights are licensed under
  the MIT License", with `license: mit` in the front matter. The benchmark table
  gives "Terminal Bench 2.1 | 82.7 | 61.8" and "Cybergym | 76.7 | 38.7". All
  four figures exact. 61.8 -> 82.7 is +33.8% ("roughly a third"); 38.7 -> 76.7
  is x1.98 ("very nearly doubled").
- en.wikipedia.org/wiki/DeepSeek — verbatim "On 24 April 2026, DeepSeek released
  a preview of its V4 series, including the 284-billion parameter
  DeepSeek-V4-Flash". Supports `preview_parameters` and the timeline.
- simonwillison.net/2026/Jul/31/deepseek-v4-flash-0731/ — dated "31st July
  2026", supporting `release_date`.
- Feed: context 1,048,576 (April row) -> 1,310,720 (this row);
  `benchmarks.artificial_analysis` present with intelligence 51.8 and coding
  69.1, so the independently-scored framing is accurate to provenance. All 13
  transclusions resolve to declared fields.

**Defect 1 — false, and I disproved it byte-level.** The entry states "OpenRouter
publishes the identical sentence on the April preview's row". It does not. The
two descriptions in the snapshot are:

  April: "DeepSeek V4 Flash is an efficiency-optimized Mixture-of-Experts model
  from DeepSeek with 284B total parameters and 13B activated parameters,
  supporting a 1M-token context window."
  July:  "DeepSeek V4 Flash 0731 is a sparse mixture-of-experts model from
  DeepSeek, with 13B active parameters out of 284B total. This re-post-trained
  revision is suited for coding, reasoning, and agent workflows."

Tested by exact string equality and containment in both directions: not
identical, and sharing no substring beyond "284B total". The July copy is freshly
written, which is the opposite of what the paragraph needs it to be — a
copy-pasted stale row.

**Defect 2 — misattribution.** "this checkpoint's own card says {{card_parameters}}"
(= "304B params"). The string "304" appears nowhere in the card: I read the whole
README and it contains no parameter count at all. "304B params" comes only from
Hugging Face's auto-generated Safetensors widget on the HTML page ("Safetensors
Model size 304B params Tensor type BF16 . I64 . F32 . F8_E4M3 . I8") — a total
HF computes from the tensor files, not a claim DeepSeek makes. Of the two "other
sources" the entry credits with the larger figure, only Simon Willison actually
asserts it ("It's 304 billion parameters - 167GB on Hugging Face").

**Defect 3 — the conclusion is unsupported, and the page's own evidence points
the other way.** "The feed value is reproduced faithfully; it is the feed that is
a version behind" is stated as settled. But the card this entry quotes says the
checkpoint "comes with a speculative decoding module attached", and its SGLang
section says to set no separate draft path because "the target and draft weights
therefore come from the same checkpoint". So the repo holds base weights *plus*
the DSpark draft module, and HF's 304B tensor total legitimately exceeds a 284B
base without anything being stale. OpenRouter's July row points the same way: it
calls this a "re-post-trained revision", i.e. the same weights post-trained
again. The entry had the refuting sentence in hand — it transcludes it two
paragraphs earlier as `structure` — and reached past it for the weaker reading.
Minor, same paragraph: "transcribed exactly as OpenRouter publishes it" is wrong
too; the fact reads "13B active per token", OpenRouter publishes "13B active
parameters out of 284B total".

Round 1 (r8-opus) found: (1) "re-post-trained revision" is in none of the cited
sources — **wrong**: OpenRouter's own description for this row says verbatim
"This re-post-trained revision is suited for coding, reasoning, and agent
workflows", so the characterisation was sourced to the feed the corpus is built
on. r8-opus checked Wikipedia, the card and Willison but not the row itself, and
the fixer deleted a correct characterisation on a false premise. (2) "Nothing
about the architecture changed in between" is contradicted by the sources —
**real, and fixed well**: the entry now names the structural change, the context
growth, and warns against the post-training inference. (3) the `parameters` fact
is wrong for this checkpoint and the prose welds it to a claim about downloadable
weights — the welding is **fixed** (the closing paragraph no longer attaches a
parameter figure to the licence point), but the reasoning r8-opus supplied for it
was itself unsound: r8-opus wrote that "the *identical* text appears on the
`deepseek/deepseek-v4-flash` preview row", and that "the card says 'Model size:
304B params'". Both are wrong, per Defects 1 and 2 above, and the fixer built a
new paragraph on both.

It does not clear the bar as it now stands, and I want to be plain about which
kind of failure this is, because it decides whether the body survives. This is
not one fixable sentence. The end of paragraph two and the whole of paragraph
three — offered as the page's second lesson, "a caution about trusting any single
catalog" — rest on a claim I disproved against the bytes and reach a conclusion
the entry's own quoted card argues against. Cutting the false clause would leave
the paragraph with no evidence at all. That said, the failure is inherited rather
than invented: round one handed the fixer both false premises, and the fixer
implemented them faithfully. Paragraphs one, four and five verify exactly and are
genuinely worth reading. If this is ever rebuilt, do not re-import the "identical
sentence" premise, do not attribute HF's Safetensors total to DeepSeek's card,
and note that the 20B gap is most simply explained by the attached DSpark module
whose weights the card says ship in the same checkpoint.
