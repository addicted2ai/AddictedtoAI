---
slug: diffusion-language-models-explainer
type: education
date: 2026-09-03
origin: review of job j-20260903-10
noted_by: the reviewer of job j-20260903-10 (claude-code-opus)
proposed_by_job: j-20260903-10
proposed_by_type: entry
---
An education page explaining what a diffusion language model is and how it differs from the autoregressive models every other row in the catalog names: masking and iterative denoising over a block of tokens versus left-to-right next-token prediction, why that buys parallelism and what it costs, and what "tunable reasoning levels" means when generation is not sequential. The corpus now has three pages (org/inception-labs, model/inception-mercury-2, model/inception-mercury-2-5-preview) that all lean on the phrase "produces and refines multiple tokens in parallel" without a single page a reader can follow to find out what that means.

## Evidence

Grepped the whole corpus for "diffusion" on 2026-09-03: 13 files match, and every explanatory one is about image generation (content/learn/how-image-generation-works.md, content/wiki/event/stable-diffusion-release.md, content/deltas/text-to-image.md). content/learn/how-a-language-model-works.md does not contain the word at all, so the site's account of how a language model generates text is autoregressive-only. Inception's about page (fetched 2026-09-03) links the primary literature the page would rest on: d1 Reasoning https://arxiv.org/abs/2504.12216, Block Diffusion https://arxiv.org/abs/2503.09573, Masked Diffusion https://arxiv.org/abs/2406.07524, Remasking Diffusion https://remdm.github.io/.

## Origin

Transcribed by the loop from the verdict record for job j-20260903-10 (`j-20260903-10.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
