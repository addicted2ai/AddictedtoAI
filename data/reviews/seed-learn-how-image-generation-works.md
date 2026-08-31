---
job: seed-learn-how-image-generation-works
verdict: approve
reasons: []
would-cite: >-
  Anyone asked for the hundredth time why an image generator keeps ruining
  hands, lettering and object counts — this page replaces the folklore with a
  scoring argument anyone can apply to a picture they have not generated yet:
  the training score sums error across pixels, a wrong relation between regions
  occupies no pixels at all, so whichever part of what you want carries almost
  no area is the part that will come out wrong.
reviewer: independent record reviewer, seven-page set (fresh context, no edit rights)
date: 2026-08-30
---

Checklist: education page (mechanics, Area A), against `openspec/curriculum/learn.md`
§2, §3 and the §4 entry, plus the `teach-the-whole-subject` delta for
`specs/education-static`. Eight paper citations; I fetched all eight to disk and
probed them by literal substring 2026-08-30.

**Sendable sentence, verbatim** — the page's bolded line:

> A sixth finger is wrong in a few hundred pixels, and pixels are the only
> thing the score has ever counted.

This is the strongest sendable sentence in my seven. It is not a summary of the
page; it is the compression of the page's whole argument into a clause a reader
can then apply to lettering, symmetry, cables, reflections and video drift —
which the page proceeds to do, and which is exactly the transfer §4 promised
("the reader leaves able to *predict* which images will come out wrong").

## What I verified at source

All eight, by literal substring against fetched bytes:

- arXiv 2006.11239 (DDPM) — "a function approximator intended to predict".
  This one is worth spelling out, because it is where a lazy check fails. The
  string is absent from the abstract; it is in the paper body, at equation 11,
  and the source sentence continues into LaTeX math ("intended to predict ϵ
  from x_t"). My first probe returned ABSENT for two compounding reasons — I
  had fetched the abstract page, and my own PDF extractor was swallowing image
  bytes. Against the rendered full text the span is present verbatim, and the
  page's truncation falls **exactly** where the mathematics begins, which is
  the correct way to quote that sentence. The page's count is right too: "a
  function approximator intended to predict" is six words.
- arXiv 1503.03585 — both quoted spans present ("systematically and slowly
  destroy structure in a data distribution through an iterative forward
  diffusion process"; "learn a reverse diffusion process that restores
  structure in data"). The page then does the honest thing and argues against
  the word it just quoted: "Restore is the word to be careful with."
- arXiv 2207.12598 — "a conditional and an unconditional diffusion model" and
  "to attain a trade-off between sample quality and diversity", both verbatim.
- arXiv 2205.11487 — "increasing the size of the language model" … "boosts both
  sample fidelity and image-text alignment much more than increasing the size
  of the image diffusion model", verbatim.
- arXiv 2212.10562 — "lack character-level input features, making it much
  harder to predict a word's visual makeup as a series of glyphs", present.
- arXiv 2108.01073 — "first adds noise to the input, then subsequently denoises
  the resulting image", verbatim.
- arXiv 2201.09865 — "we only alter the reverse diffusion iterations by
  sampling the unmasked regions using the given image information", verbatim.
- arXiv 2204.03458 — both "a natural extension of the standard image diffusion
  architecture" and "temporally coherent high fidelity video", verbatim.

Front matter matches §4: level, both prerequisites, outcome verbatim. All three
mentions and all six internal links resolve on disk. `concept/tokenization` is
an addition to §4's suggested list and the body earns it (the lettering section
turns on it), which §4 explicitly permits.

## Unearned assumptions

Closure is `the-kinds-of-models`, `how-machines-represent-meaning`,
`what-a-neural-network-is`, `learning-from-examples`, `what-a-model-is`,
`what-ai-actually-is`. Two outbound links go outside it and I checked both:

- `/learn/when-you-cannot-trust-your-eyes` — a deferral, and the page supplies
  the one-line version itself ("any tell good enough to publish has a short
  life"), so the paragraph stands without the click. Legal inline link under §5.
- The negation claim ("*A street with no cars* sits almost on top of a street
  with cars") leans on opposites embedding close together — which is a
  must-cover item of `how-machines-represent-meaning`, a **declared**
  prerequisite. Earned.

Every term of art is defined where it lands: noise level, seed ("the complete
list of tie-breaks"), the latent stand-in, image-to-image, inpainting,
tokenisation. Notably the page never names an architecture or a sampler, which
is §4's must-not, and it never once names a model.

## Rot

Clean, and clean in the hard place. The one product moment — "the release that
put image generation on ordinary home machines in 2022" — is dated, links the
wiki event entry, and conspicuously does **not** state a VRAM figure, which is
precisely the literal that would have rotted. No model names, no prices, no
benchmark scores, no version numbers. "Twenty or fifty rounds" is loose by
construction and not a spec claim.

## A judgment I want on the record

§4's must-not bans prompt tips, and the page ends on "the useful question,
before you type". I considered whether the area rule ("Find the part of what you
want that will occupy almost none of the finished picture") is a prompt tip
wearing a mechanism's coat. It is not: it predicts an outcome rather than
prescribing a phrasing, it is derived on the page from the loss rather than
asserted, and the page explicitly refuses the prompting move in the same breath
— "not how to describe the thing better". §4's own "beats the alternative by"
asks for exactly this. Bounds held.

## Taken on trust

The three wiki entries were confirmed to exist but not read for content. I did
not verify that classifier-free guidance was *first* introduced by 2207.12598
rather than by an earlier workshop version — the page says "The 2022 paper that
introduced this", and the arXiv posting is 2022; if the priority is disputed the
dispute is not visible in what I fetched.

Approve. Two structural choices lift this above every diffusion explainer I
know of: it establishes that the reverse process narrows a set rather than
uncovers a picture (and proves it by taking the one-step estimate and showing
the smear), and it derives the famous failures from the scoring function instead
of listing them. Both are things a reader can use on a system this page has
never seen.
