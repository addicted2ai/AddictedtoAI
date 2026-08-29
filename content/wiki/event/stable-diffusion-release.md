---
id: event/stable-diffusion-release
kind: event
display_name: "The Stable Diffusion Release"
status: dead
maintenance: dormant
themes:
  - history
  - culture
aliases:
  - name: "Stable Diffusion public release"
    class: exclusive
  - name: "Stable Diffusion"
    class: manual
facts:
  - field: license
    source: cited
    value: "CreativeML OpenRAIL-M"
    source_url: "http://stability.ai/news-updates/stable-diffusion-public-release"
    accessed: "2026-08-28"
    volatility: static
  - field: vram_at_release
    source: cited
    value: "6.9 GB"
    source_url: "http://stability.ai/news-updates/stable-diffusion-public-release"
    accessed: "2026-08-28"
    volatility: static
  - field: model_size
    source: cited
    value: "an 860M UNet and a 123M text encoder (frozen CLIP ViT-L/14)"
    source_url: "https://raw.githubusercontent.com/CompVis/stable-diffusion/main/README.md"
    accessed: "2026-08-28"
    volatility: static
  - field: training_data
    source: cited
    value: "512x512 images from subsets of LAION-5B, including the LAION-Aesthetics filtered subset"
    source_url: "http://stability.ai/news-updates/stable-diffusion-announcement"
    accessed: "2026-08-28"
    volatility: static
timeline:
  - date: "2021-12-20"
    event: "the latent diffusion paper behind Stable Diffusion is posted by Rombach, Blattmann, Lorenz, Esser and Ommer; it appears at CVPR 2022"
    source_url: "https://arxiv.org/abs/2112.10752"
  - date: "2022-08-10"
    event: "Stability AI announces Stable Diffusion, with access first for researchers"
    source_url: "http://stability.ai/news-updates/stable-diffusion-announcement"
  - date: "2022-08-22"
    event: "the weights are released publicly under the CreativeML OpenRAIL-M license"
    source_url: "http://stability.ai/news-updates/stable-diffusion-public-release"
  - date: "2022-08-29"
    event: "Simon Willison documents a first week of img2img tools, web UIs and plugins: an explosion of innovation around the open weights"
    source_url: "https://simonwillison.net/2022/Aug/29/stable-diffusion/"
mentions:
  - tool/hugging-face-hub
---

The event was not the model. Text-to-image generation already existed in
2022, behind interfaces. The event was a file: on 22 August 2022 Stability
AI published the trained weights of Stable Diffusion for anyone to
download — "It is our pleasure to announce the public release of stable
diffusion following our release for researchers," twelve days after the
10 August announcement had described the system and promised the release
was coming.

Simon Willison, writing a week later, put the distinction in one sentence:
"It's similar to models like Open AI's DALL-E, but with one crucial
difference: they released the whole thing." You could, he noted, download
and run the model on your own computer and use it for commercial and
non-commercial purposes. The license was not classical open source but a
new instrument, CreativeML OpenRAIL-M — weights free to use and
redistribute, with use-based restrictions written into the license itself.
The package shipped with "an AI-based Safety Classifier included by
default," and the announcement was upfront about what a local model means:
the classifier is part of the software, not a wall around a server.

The thing being handed out was small. Stable Diffusion is "a latent
text-to-image diffusion model" — the architecture from "High-Resolution
Image Synthesis with Latent Diffusion Models," posted by Robin Rombach,
Andreas Blattmann, Dominik Lorenz, Patrick Esser and Björn Ommer of the
CompVis group on 20 December 2021 and presented at CVPR 2022. It pairs an
860M-parameter UNet with a 123M-parameter frozen CLIP text encoder, and
was trained on 512x512 images from subsets of the LAION-5B dataset. Under
a billion parameters in the UNet: the image generator that changed the
internet's visual culture is smaller than GPT-2. At release, Stability
put the memory footprint at 6.9 GB of VRAM — which is the load-bearing
number, because it meant a consumer gaming GPU was enough. "Stable
Diffusion runs on under 10 GB of VRAM on consumer GPUs, generating images
at 512x512 pixels in a few seconds," as the August announcement put it.

What open weights buy is visible in the first week's record, which Simon
Willison compiled on 29 August: "In just a few days, there has been an
explosion of innovation around it." Web interfaces, a Photoshop plugin
demo, video-frame conversion, and above all img2img — feeding the model an
image plus a prompt instead of a prompt alone — turning a text toy into an
iterative illustration workflow, built by people who did not need
permission because there was no one to ask. The weights lived on Hugging
Face under the CompVis organization; the fine-tunes, forks and interfaces
that followed are the reason a "checkpoint" is now something hobbyists
trade.

The other half of the record is the argument the release started. Emad
Mostaque's launch line — "We are delighted to release the first in a
series of benchmark open source Stable Diffusion models that will enable
billions to be more creative, happy and communicative" — is a claim about
who should hold generative capability, and every objection to it arrived
on schedule: trained-on-scraped-art grievances, safety-filter removals,
and the question of what a license clause is worth once a file is on a
million disks. Those disputes have their own records. What belongs to this
event is the demonstration itself: the day image generation became
something you have, rather than something you visit, and the proof of how
much engineering a community will do in a week when the artifact is simply
given to them.
