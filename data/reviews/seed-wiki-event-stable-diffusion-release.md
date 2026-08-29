---
job: seed-wiki-event-stable-diffusion-release
verdict: approve
reasons: []
would-cite: >-
  Someone arguing open weights only matter at frontier scale — this entry
  pins the artifact that changed image generation at a 860M UNet running in
  6.9 GB of VRAM, and dates the week of img2img tooling that followed it.
reviewer: r3-opus
date: 2026-08-28
---

Checklist: wiki entry (event). Sources fetched 2026-08-28.

- stability.ai/news-updates/stable-diffusion-public-release: resolves today
  (the http:// form in the fact block upgrades and lands on the post; not a
  broken link). Verbatim: "It is our pleasure to announce the public release
  of stable diffusion following our release for researchers". The CreativeML
  OpenRAIL-M licence, the "6.9 Gb of VRAM" figure and the "AI-based Safety
  Classifier included by default" are all on the page as the entry has them,
  and the post is dated 22 August.
- stability.ai/news-updates/stable-diffusion-announcement: resolves, dated
  10 August. Verbatim: "Stable Diffusion runs on under 10 GB of VRAM on
  consumer GPUs, generating images at 512x512 pixels in a few seconds." And
  Mostaque's launch line in full: "We are delighted to release the first in a
  series of benchmark open source Stable Diffusion models that will enable
  billions to be more creative, happy and communicative." Training data
  described as LAION-Aesthetics, a filtered subset of LAION-5B, matching the
  fact block.
- raw.githubusercontent.com/CompVis/stable-diffusion/main/README.md:
  resolves. "a latent text-to-image diffusion model" is verbatim; "With its
  860M UNet and 123M text encoder, the model is relatively lightweight"
  carries both parameter counts; and "this model uses a frozen CLIP ViT-L/14
  text encoder" carries the encoder identification. All three match.
- simonwillison.net/2022/Aug/29/stable-diffusion/: resolves, dated 29 August
  2022. Verbatim: "It's similar to models like Open AI's DALL-E, but with one
  crucial difference"; "they released the whole thing"; "there has been an
  explosion of innovation around it". The post does list, in that first week,
  img2img, a browser web UI, a Photoshop plugin and frame-by-frame video
  conversion — the four things the entry names, not a generic gesture at
  "tools".
- Arithmetic checked rather than assumed: 10 August to 22 August is the
  "twelve days" the entry claims; 22 to 29 August is Willison's "a week
  later". The "smaller than GPT-2" comparison holds — 860M + 123M is under
  GPT-2's 1542M — and the entry states it in the conservative form ("Under a
  billion parameters in the UNet") rather than overreaching.
- Not independently verified: arxiv.org/abs/2112.10752 was not opened; the
  20 December 2021 posting date, the five CompVis authors and the CVPR 2022
  venue are standard and consistent with everything else checked here.

Clears the bar. The payload is the load-bearing number an enthusiast rarely
has to hand — that the release-day memory footprint was 6.9 GB, which is why
a consumer gaming card was enough, and therefore why the week of tooling
happened at all. The piece is specific about which file, which day and which
licence, keeps the argument about scraped art in the "belongs elsewhere"
bucket rather than gesturing at it, and would settle a dispute about what
actually changed on 22 August 2022. Approve.
