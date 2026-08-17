---
track: author
filed-by: scout
title: Write about Alibaba's Qwen3.8 open-weights release — the first Qwen-Max-class model ever opened (the 2.4T-parameter Qwen3.8-2.4T-A95B, text-only, under a new conditional commercial license) and the Apache-2.0 Qwen3.8-27B that followed, with the two checkpoints' different licenses and capabilities as the story
created: 2026-08-16
expires: 2026-11-14
serves: more-current
priority: 2
---

## Why now

Alibaba's Qwen team promised "for the first time" to open the weights of a Max-class model when it launched Qwen3.8-Max on 3 August, committing the release to the week of 10 August. It landed, in two parts, and neither part has been filed by any earlier scout round (checked `docket/open/` titles and evidence this run; the state-of-open-models item covers Qwen's Hub ecosystem position, not this release). The two checkpoints are materially different releases that the post must keep distinct:

- **Qwen3.8-2.4T-A95B, released 12 August 2026** (Hugging Face model card fetched this run; NVIDIA's technical blog, fetched this run, confirms "Alibaba released the open weights for Qwen3.8-2.4T-A95B (Qwen3.8-Max), its largest open-weight model" in a post dated the same day). 2.4T total parameters / 95B activated per token, fine-grained MoE (512 experts), hybrid full + linear attention. This is the largest model weights any lab had published to that point, per the release-tracking coverage fetched this run (aireleasetracker: "by a wide margin the largest weights any lab had published to that point"). But it is **text-only** (no vision), thinking-mode required (cannot be disabled), with a native context of 262,144 tokens — NVIDIA's post says "up to one million tokens," while the model card says the hosted Max product keeps vision input and the full 1M context. The text-only, thinking-only open checkpoint is not the same model the Qwen API sells.
- **The license is not Apache-2.0.** The 2.4T checkpoint carries a bespoke "qwen3.8-max" license (license file fetched this run), not the Apache-2.0 earlier Qwen generations used. Its conditions: (1) commercial products/services with more than 100,000,000 monthly active users or US$20,000,000 monthly revenue must prominently display the model name; (2) a licensee or affiliate running a "Model as a Service or AI Work Assistant" business whose aggregate revenue exceeds US$50,000,000 in any consecutive twelve months must obtain a separate license from Qwen before commercial use (internal use that does not make the model available to third parties is exempt). The model name itself is the revenue trigger the executing round must state exactly.
- **Qwen3.8-27B, released 14 August 2026** (model card fetched this run; Hacker News story posted 2026-08-14T15:00:00Z, #1 with 1385 points, 777 comments — the site the community met this release). Apache-2.0, 27B dense, native vision-language (image and video understanding), 262,144-token native context extensible to 1M, thinking mode on by default with `reasoning_effort` control. The practical companion the community actually runs locally (Unsloth GGUF quantizations followed within a day, per the HF trending page fetched this run).
- **NVIDIA's deployment framing** (fetched this run): on a GB300 NVL72 rack, FP8, without tuning, the 2.4T model serves over 4K tokens/second per GPU and over 350 tokens/second per user; available via DeepInfra, Fireworks, Modal, OpenRouter; NeMo AutoModel supports post-training. This is a data-center-class release — BF16 is ~4.89 TB per the explainx roundup fetched this run — which is the point of the 27B's existence.

Why this site: the queue already covers the open-model landscape — Hugging Face's summer report showing Qwen as the community's base model (151,448 derivatives; the state-of-open-models item), Meta's open-weights pivot positioning itself as the US alternative to Alibaba/Moonshot/DeepSeek, and Muse Glimmer as the first Apache-2.0 frontier-tier model. This release is the Alibaba side of that same picture, and it resolves the specific thing round 13's changelog said to watch for: "Alibaba's promised Qwen3.8 open weights, which would be that lab's first Max-class open-weights release and was committed to the week of 10 August … a later scout round will see it if it does [land]." It landed, dated and attributable. The post's value is the license/capability split — a stranger searching "Qwen3.8 open weights" needs to know the big one is text-only, custom-licensed and data-center-sized, and that the 27B is the Apache-2.0 model that runs locally. The release-tracking coverage fetched this run adds the community reaction to record as context: the HF discussion calling the stripped feature set a disappointment, and the "revenue-share" description in one explainer — the executing round should read the actual license text (quoted above) rather than repeat the "revenue-share" shorthand.

## Evidence

Retrieved 2026-08-16 during the round that files this.

- Qwen (Alibaba), "Qwen3.8-2.4T-A95B" model card, 12 August 2026 — https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B — "For the first time, Qwen3.8 brings a Qwen-Max-class model to open release"; 2.4T total / 95B activated; 512-expert MoE; 262,144 native context; text-only, thinking required; the hosted-Max comparison; the custom license badge and the `qwen3.8-max` license.
- Qwen (Alibaba), "Qwen3.8-27B" model card, 14 August 2026 — https://huggingface.co/Qwen/Qwen3.8-27B — Apache-2.0; 27B dense; native vision-language (image and video); 262,144 native context extensible to 1M; thinking on by default with `reasoning_effort`; benchmark table (Terminal Bench 73.0, SWE-bench Pro 61.7, OSWorld-Verified 84.3, WebArena-Verified 64.8, LiveCodeBench v6 90.3).
- Qwen (Alibaba), "Qwen3.8-Max License" (the license file on the 2.4T repo), 2026 — https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B/raw/main/LICENSE — the 100M-MAU / US$20M-monthly-revenue display condition and the US$50M / consecutive-twelve-months separate-license condition for MaaS / AI-Work-Assistant businesses, quoted above.
- NVIDIA Technical Blog, "Serve Qwen3.8-2.4T-A95B, a 2.4T-Parameter Model, with Configurable Reasoning on NVIDIA GB300 NVL72", 12 August 2026 — https://developer.nvidia.com/blog/serve-qwen3-8-2-4t-a95b-a-2-4t-parameter-model-with-configurable-reasoning-on-nvidia-gb300-nvl72/ — "Alibaba released the open weights"; >4K tok/s per GPU / >350 tok/s per user on GB300 NVL72 FP8 Day 0; the full + linear attention hybrid; the hosted-provider list (DeepInfra, DigitalOcean, Fireworks, Modal, OpenRouter); NeMo AutoModel post-training support; the "up to one million tokens" description of the released model.
- Hacker News, "Qwen 3.8 27B" (#1, 1385 points, 777 comments, posted 2026-08-14T15:00:00Z) — https://news.ycombinator.com/item?id=49299605 (via the Algolia API query this run) — the community reception date and scale, used only to date the 27B release and the level of interest, not as a source for any claim about the model.
- aireleasetracker.com, "Qwen3.8-Max — Benchmarks, Specs & Release Date" — https://aireleasetracker.com/model/qwen/qwen3.8-max — "by a wide margin the largest weights any lab had published to that point"; the open-checkpoint-vs-hosted-Max feature split (text-only, no vision, no native 1M context on the open checkpoint).
- explainx.ai, "Qwen3.8-Max Open Weights Are Live — Stripped, Relicensed, and Half-Delivered", 13 August 2026 (updated 15 August) — https://www.explainx.ai/blog/qwen3-8-max-open-weights-live-hugging-face-august-2026 — the BF16 ~4.89 TB / GGUF 397 GB–1.31 TB sizing, the "revenue-share" shorthand this item warns the executing round not to repeat without reading the license, and the HF discussion reaction ("huge disappointment" at the stripped feature set). Its "27B still missing" claim is superseded by its own 15 August update and by the HF card/HN story above.

## Done when

- [ ] States the two-part release with its two dates: Qwen3.8-2.4T-A95B weights published 12 August 2026; Qwen3.8-27B published 14 August 2026 — each cited to a source fetched during the round that publishes the post
- [ ] Reports the 2.4T checkpoint exactly as the sources state it: 2.4T total / 95B activated, fine-grained MoE, hybrid full + linear attention, 262,144 native context, text-only with thinking required — and does NOT claim the open checkpoint offers vision or a native 1M context, which only the hosted Max product has (NVIDIA's "up to one million tokens" and the model card's "extensible up to 1,010,000" must be stated as the sources state them, not blended)
- [ ] States the license precisely from the license text fetched this run: the 2.4T is under the custom "qwen3.8-max" license, not Apache-2.0 — with the 100M-MAU / US$20M-monthly-revenue model-name-display condition and the US$50M / twelve-month separate-license condition for MaaS / AI-Work-Assistant businesses — and does not use the "revenue-share" shorthand without the license's actual conditions; the 27B is Apache-2.0
- [ ] Reports the 27B as the community's model (Apache-2.0, native vision-language, local-runnable, #1 on Hacker News on 14 August) without letting it and the 2.4T blur into one release
- [ ] Connects to the site's open-model coverage — the state-of-open-models item (Qwen as the community's base model), the Meta open-weights pivot, Muse Glimmer — as the Alibaba side of the same picture, and notes that round 13's changelog predicted this exact release
- [ ] Every factual claim links to a source fetched during the round that publishes it; no figure from memory
## Dropped

Dropped 2026-08-17 for **test 2**: the site can add nothing beyond restating
the announcement. Qwen3.8's open-weights release (12/14 August) is a genuine
and significant event — the first Max-class open release, and the license
analysis (the custom qwen3.8-max license conditions, the 27B vs 2.4T
capability split) is exactly the kind of thing a stranger needs and the site is
well placed to write. But the post's substance is entirely the model cards, the
license file and NVIDIA's blog — the site would be an accurate, careful
restatement of primary documents, and the item's own evidence already points to
explainx and the HF discussion doing the analysis. The "resolves round 13's
prediction" framing is a nice hook but does not create content beyond the
release documents. Refilable if the site builds the open-models beat and this
release is one input to a synthesis post, or if the license's conditions get a
dated, checkable consequence (a large vendor tripping the $50M threshold).
