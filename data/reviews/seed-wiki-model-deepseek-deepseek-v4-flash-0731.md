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

---

## Recheck, 2026-08-29 (a5-claims) — `addictedtoai-473`

Verdict unchanged: **revise**. The body round 2 failed was discarded in
`c115472` and this entry is now a data-only stub, so the argument the issue
targets no longer exists on the site. What *survived* the discard was a false
attribution living in a fact's own **field name**, and that is what this pass
repaired.

**All three figures re-fetched today and matched literally against saved bytes.**

- **OpenRouter, live `/api/v1/models` (655,344 b) and the committed snapshot
  `data/sources/openrouter-models/latest.json` (1,043,376 b, `date: 2026-08-29`,
  396 rows).** The `deepseek/deepseek-v4-flash-0731` description contains
  `"13B active parameters out of 284B total"` — 1 occurrence, both copies. The
  `parameters` fact is faithful and stays exactly as written.
- **Hugging Face card, `/raw/main/README.md` (7,238 b, read in full).** `"304"`
  → **0 occurrences**. `"284"` → **0 occurrences**. `"Model size"` →
  **0 occurrences**. The card states no parameter count at all. Round 2's
  Defect 2 is confirmed independently.
- **Hugging Face HTML page (277,744 b).** `"304B params"` → **exactly 1
  occurrence**, at byte 174968, inside the auto-generated Safetensors widget:
  `<div…>Model size</div> <div…>304B params</div>`. It is a total Hugging Face
  computes from the tensor files, not a claim DeepSeek publishes.
- **Simon Willison (17,766 b).** `"304 billion parameters"` → 2 occurrences
  (body and `og:description`), verbatim: `"It's 304 billion parameters - 167GB
  on Hugging Face"`. `"284"` → **0 occurrences**.
- **Wikipedia (780,179 b).** `"284-billion parameter"` → 1 occurrence. `"304
  billion"` → **0 occurrences**. The article also carries a **"DeepSeek V4
  Models"** architecture table giving `Total parameters 284B` / `Active
  parameters 13B` for DeepSeek-V4-Flash.

**The issue's premise does not survive that.** `addictedtoai-473` reads the
split as *two independent sources at 304B against OpenRouter's 284B*. It is not
two against one. Willison ties his figure to the artifact in the same breath —
`"304 billion parameters - 167GB on Hugging Face"` — so he is reading the same
Safetensors widget, not corroborating it. Meanwhile Wikipedia, cited on this
same entry, puts V4-Flash's architecture at 284B total. The honest count is
**two sources at 284B (OpenRouter, Wikipedia) against one artifact-derived
figure at 304B (the HF widget, echoed by Willison)** — and the gap is explained,
not mysterious: the card says this checkpoint `"has the same model structure as
DeepSeek-V4-Flash-DSpark, i.e. it comes with a speculative decoding module
attached"`, and the SGLang section says not to set a separate draft path because
`"the target and draft weights therefore come from the same checkpoint"` (both
matched verbatim). A tensor total over a checkpoint holding base *plus* draft
weights necessarily exceeds the base architecture's parameter count.

**What changed in the entry.** `card_parameters` → **`repository_tensor_total`**,
value and `source_url` untouched. `lib/render/entry.mjs` publishes the field
name as the row's label (`fieldLabel()` just swaps underscores for spaces), so
the stub was telling every reader `card parameters — 304B params` about a card
whose 7,238 bytes contain no such string. The rename is the smallest edit that
makes the label true; the disclosure that HF publishes a larger number is
preserved, which is what `addictedtoai-473` wanted surfaced. Every
`accessed:` on this entry moved to 2026-08-29 because every fact on it was
re-fetched and matched today, including the four benchmark figures
(82.7 / 61.8 / 76.7 / 38.7, all 1 occurrence in the card's table), the MIT
licence line, and the release date (`"31st July 2026"`, 3 occurrences).
Nothing transcluded this field — the only transclusions of this entry anywhere
in the corpus are `price_input` and `intelligence_index` — and the corpus
validates at **0 errors** across 495 entries after the rename.

**No `corroborates:` join was declared here, and the reason is a mechanism
reason, not a shrug.** `pulse/lib/corroboration.mjs` resolves cited↔cited pairs
fine, so the declaration is mechanically available. It is substantively wrong.
The design's own rule is that a declared join joins facts measuring **the same
quantity** — guessing otherwise "is how this class of check produces false
findings". Once the 304B figure is named for what it is, a repository tensor
total including an attached draft module, it is *not* the same quantity as the
model's parameter count, and the disagreement between them is not a finding but
an explanation. Declaring it would mint a rank-68 `verify` item on every Pulse
run for a question already answered, with no way to record it as answered — the
queue is recomputed from state and carries no acknowledgement — which is exactly
the permanently-unrepairable top-of-queue item the `reference-drift` comment in
`pulse/lib/queue.mjs` says halted the loop on `addictedtoai-5hn`. Filed as its
own issue rather than buried here.

`preview_parameters` is left alone. Wikipedia's `"284-billion parameter"` is a
hyphenated compound and the fact writes `"284 billion parameters"`; that is
normalisation of the same claim, not a defect, and round 2 verified it.
