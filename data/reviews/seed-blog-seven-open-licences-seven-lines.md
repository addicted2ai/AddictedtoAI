---
job: seed-blog-seven-open-licences-seven-lines
verdict: approve
reasons: []
would-cite: >-
  Someone drafting a compliance memo who assumes open-weights licences differ
  only in threshold size — this post reads the files and shows they bind
  different companies entirely: a coding-assistant vendor, a hyperscale
  reseller, any employee of a large employer, and a model trainer, from a
  US$20M/month cut-off to a US$10B security review.
reviewer: rr4b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Every licence fetched
to disk as raw bytes on 2026-08-29 and matched by literal substring; repository
dates read from the Hugging Face API, the method the post itself names.

**Licence texts — every operative clause PRESENT verbatim:**

- Kimi K3 (3,065 b): display clause at 100M MAU / US$20M monthly revenue; MaaS
  above "20 million US dollars … over any consecutive 12 months" must "enter into
  a separate agreement with Moonshot AI"; the carve-out for use "accessed through
  Moonshot AI's official products or certified inference partners". K2.5 and K2.6
  fetched too: both titled "Modified MIT License", both display-clause-only — so
  "the revenue gate appeared between April and June" is measured on the files.
- Qwen3.8-Max (3,390 b): "US$50,000,000"; "Model as a Service or AI Work
  Assistant"; and the definition quoted in full — "an independent AI-powered
  product primarily designed for AI-assisted coding or office productivity (e.g.,
  Qoder and QwenWork)" — with the three carve-outs the post describes (translation
  tool, shopping assistant, AI feature of a non-AI product).
- Qwen Community License 1.0 (3,235 b): same two categories, **no threshold** —
  confirmed by reading §2 in full, not by inference.
- GLM-5.3 (4,263 b): "10 billion US dollars"; "must pass Z.AI's security review
  before using the Software or its derivative works for any commercial purpose";
  "scope and method of the security review shall be reasonably determined by
  Z.AI". **US$10B ÷ US$20M = exactly 500** — "five hundred times Moonshot's" is
  arithmetic, not rhetoric.
- Mistral-Medium-3.5 (1,695 b): the authorization cut-off verbatim, "or that of
  your employer" included, remedy "at its sole discretion". **The sharpest catch
  re-confirmed independently:** the file says "This restriction in (b)" while
  numbering its conditions 1 and 2, with no "(b)" anywhere in the document.
- Grok 2 (5,467 b): "revocable"; the output clause verbatim including the
  parenthetical round 1 could not resolve — "(including generated data)";
  "AGGREGATE LIABILITY EXCEEDING $100"; "Tarrant County, Texas"; "Last Updated:
  November 4, 2025".
- Llama 4: "Llama 4 Version Effective Date: April 5, 2025"; §2 measures the 700M
  MAU test "on the Llama 4 version release date" — the "frozen in time" reading is
  exactly right; "Built with Llama"; the AUP "incorporated by reference".
- gpt-oss-120b USAGE_POLICY: the response body is **exactly 201 bytes**, and the
  post's full quotation matches it byte for byte. Two sentences.
- Control group: DeepSeek-V4-Flash-0731 **and** V4-Pro-0813 both stock MIT, both
  "Copyright (c) 2023 DeepSeek"; GLM-5.3-Flash stock MIT.

**Dates (HF API `createdAt`), every one exact:** Qwen3.8-27B 2026-08-05,
2.4T-A95B 2026-08-08, Flash-Next 2026-08-24 (05→24 = nineteen days); GLM-5.3 and
GLM-5.3-Flash **both** 2026-08-25, so "the flagship left MIT on the same day its
Flash sibling stayed" is literally true; GLM-5.2 2026-06-16 → 2026-08-25 = 70 days
= ten weeks; Kimi-K2.5 2026-01-01, K2.6 2026-04-14, K3 2026-06-13;
Mistral-Medium-3.5-128B 2026-03-31; newest `meta-llama` repo 2025-04-28; `xai-org`
holds 2 repos, newest `grok-2` 2025-08-22.

**Gemma — the post's strongest universal claim, and it holds.** Filtering strictly
on the generation prefix (not `*gemma-4b`, which is a size): **38 `gemma-4-*`
repos, all tagged `license:apache-2.0`, earliest 2026-03-02**; **27 `gemma-3-*`
repos, all tagged `license:gemma`**. Zero non-conforming in either set. The
Mistral-Large-3 line is `license:apache-2.0` throughout.

**The two absences hold.** All four Chinese-lab licences carry only a
comply-with-applicable-law line, never an incorporated AUP. Only xAI's restricts
what outputs may be used for — Llama 4 imposes a *naming* condition on training
with outputs, which is not the same thing, and the post does not claim otherwise.

Round 1 (r3-opus) found one defect: "one sentence long" against a two-sentence
policy — **fixed**; the text now reads "two sentences long — 201 bytes", and I
re-measured 201 from the response body, so r1's warning not to "correct" the byte
count is preserved. Round 1 explicitly left six things unverified; **I verified
all six** (Qwen3.8-27B's Apache-2.0, Mistral-Large-3's Apache-2.0, the Gemma 3→4
change, DeepSeek-V4-Pro-0813, the K2.5/K2.6 display-clause history, and the xAI
parenthetical) and every one matched the post.

Nothing was introduced by the fix. This is the most rigorously evidenced piece in
my slice and I could not falsify a single claim in it. Approve.
