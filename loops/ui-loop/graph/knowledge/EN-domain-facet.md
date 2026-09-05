---
id: EN-domain-facet
version: 1
schema: loops/ui-loop/graph/schemas.md#evidence-note
depends_on: [frontier-plan.md, BRIEF-UI-001.v1]
status: draft
date: 2026-09-05
---

# EN-domain-facet — a closed cross-cutting `domain` vocabulary

Measured 2026-09-05 read-only; external claims cite a URL fetched that day.

## 0. Measured facts

- `content/wiki/model/*.md`: **446** entries; **437** carry
  `feeds.openrouter-models: <slug>`, 9 none. Of the 437, **431** resolve in
  `data/sources/openrouter-models/latest.json` (`row_count: 431`); 6 stale.
- Feed `architecture.input_modalities -> output_modalities`, 431 rows, **16**
  distinct combinations; largest four `text->text` 157 ·
  `file+image+text->text` 113 · `image+text->text` 52 · `image+text+video->text`
  42. Derived: image **input** 262, video input 79, audio input 46; image
  **output** 11, audio output 4, **video output 0**.
- `benchmarks` on 243/431; `artificial_analysis` on 181; `design_arena` on 243
  across 25 `arena/category` pairs in two arenas — `models/*` (website, gamedev,
  dataviz, 3d, svg, image, logo, …) and `agents/*` (fullstack, webapps,
  agenticgamedev, slides, …). `supported_parameters` has `tools` on **364/431**.
- Tool listings are `content/directory/tools/*.md` (**35** + README), not
  `content/wiki/tool/` (**38**). `category`: local 5 · inference 5 · training 3
  · retrieval 3 · observability 3 · data 3 · coding 3 · image 2 · frameworks 2 ·
  evaluation 2 · audio 2 · agents 2. Render `lib/render/tools.mjs:37,95,160`.

## 1. Recommended vocabulary (9 values, closed)

`domain` is a **set-valued, optional** facet on model / org / tool / technique /
frontier index; the empty set is legal and common.

| id | definition | include | exclude |
|---|---|---|---|
| `text` | general-purpose language understanding and generation | published claim is general reasoning/writing | merely *capable* of text I/O — §4.1 |
| `coding` | writing, editing, reviewing source code | code-specialised models, editors, CLIs | general models with no coding claim |
| `agents` | tool use and long-horizon autonomy, incl. GUI/computer use | agent frameworks, computer-use models, agentic indices | bare `tools` support (364/431) |
| `image` | still-image understanding or generation | image-in or image-out as published capability | PDF/file input |
| `video` | moving-image understanding or generation | video-in or video-out | image sequences |
| `audio` | speech and music, in or out | ASR, TTS, speech-to-speech, music gen | text-only "voice" products |
| `research` | retrieval-grounded search and synthesis over live sources | search / deep-research models, retrieval tooling | offline reasoning |
| `science-math` | formal, mathematical, scientific problem solving | published math/science eval claim | generic "smart" claims |
| `robotics` | embodied control and world models for physical systems | robot foundation models, sim/embodied stacks | agentic *software* autonomy |

Repo examples (paths verified): `text`, `coding` —
`content/wiki/model/openai-gpt-5-6-sol.md` (binds `intelligence_index`,
`coding_index`); `content/wiki/org/cohere.md` ("North Mini Code … optimized for
agentic software engineering"); `content/wiki/tool/aider.md`. `agents` — tool
category `agents`; `design_arena[].arena == "agents"`. `image`/`video` —
`content/wiki/org/z-ai.md` ("glm-5.3-flash … takes text, images and video"),
`content/wiki/org/alibaba-cloud.md`. `audio` — tool category `audio`.
`research` — `content/wiki/org/perplexity.md` ("Citation tokens … from running
searches"). `science-math` — `content/wiki/org/anthropic.md` ("cybersecurity,
and soon, biology research"). `robotics` — **no repo entry**; editorial per K21.

Comparable published measures. **AA** = Artificial Analysis,
https://artificialanalysis.ai/methodology; **Arena** (ex-LMArena) =
https://arena.ai/leaderboard, human pairwise Elo; **Epoch** =
https://epoch.ai/benchmarks. Republication **UNVERIFIED** for AA (terms URL
404'd on fetch) and Arena; Epoch is **CC BY** — "free to use, distribute, and
reproduce provided the source and authors are credited" (https://epoch.ai/data).

| domain | index(es) |
|---|---|
| text | AA Intelligence Index; Arena Text |
| coding | AA Coding Index, Coding Agents; Arena WebDev, Image-to-WebDev |
| agents | AA Agentic Index, AA-AgentPerf; Arena Agent; Epoch "Agent capabilities" |
| image | AA Text to Image; Arena Text to Image, Image Edit, Vision |
| video | AA Video Generation; Arena Text to Video, Image to Video, Video Edit |
| audio | AA Speech to Text, Text to Speech, Speech to Speech, Music Generation |
| research | AA Search API eval; Arena Search |
| science-math | Epoch FrontierMath, SimpleQA Verified, Mathematics + Science areas |
| robotics | **none found** |

Only the AA indices reach the site today, via
`benchmarks.artificial_analysis.*` in the feed (frontier-plan §0.1).

## 2. How leading taxonomies carve it, and where they disagree

- **AA** (https://artificialanalysis.ai/methodology): language intelligence
  (Intelligence Index, capability indices, small-model index, endpoint accuracy,
  Coding Agents) · multimodal (speech-to-text, text-to-speech, speech-to-speech,
  text-to-image, video generation, music generation) · performance (API
  performance, System Load Test, AA-AgentPerf) · Openness Index · Search API
  eval. "Agentic" is a **capability index over language models**, not a
  modality; math and science are benchmarks *inside* the Intelligence Index.
- **Arena / LMArena** (https://arena.ai/leaderboard; lmarena.ai 301s here):
  Agent, Text, WebDev, Image-to-WebDev, Text to Image, Image Edit, Text to
  Video, Image to Video, Video Edit, Vision, Document, Search. "Agent" **is**
  top-level, as is Search; coding appears only as WebDev; no math or science.
- **Hugging Face tasks** (https://huggingface.co/tasks): Multimodal · NLP ·
  Computer Vision · Audio · Tabular · Reinforcement Learning — carved by
  **input→output signature** (`Image-Text-to-Text`, `Any-to-Any`). No agentic,
  no coding, no math/science; embodiment only as Reinforcement Learning.
- **OpenRouter feed** (on disk, §0): modalities only, no capability axis.
- **Stanford AI Index 2025** (https://hai.stanford.edu/ai-index/2025-ai-index-report):
  ch.1 R&D · 2 Technical Performance · 3 Responsible AI · 4 Economy · 5 Science
  and Medicine · 6 Policy · 7 Education · 8 Public Opinion. "Science" is a
  **sector**; agentic/computer use are benchmarks inside ch.2.
- **Epoch AI** (https://epoch.ai/benchmarks): Mathematics · Agent capabilities ·
  Software engineering · Games · World knowledge · Science · Multimodal ·
  Long context · Writing & creativity · Conceptual reasoning. The only surveyed
  scheme making math and science **first-class**; collapses all modalities into
  one area.

Disagreement: modality-first schemes (HF, OpenRouter) cannot express agentic or
coding; capability-first schemes (Epoch, AA) cannot express image/video/audio as
peers; Arena mixes both and is the closest analogue to §1. No scheme names
"computer use" at top level — it sits inside Agent/Agentic.

## 3. Seeding from the repo

Auto-taggable from the feed, no judgement (§0): `image` 262/431 (60.8%) ·
`video` 79 — **input only**, so generative video can never be feed-seeded ·
`audio` 46 · `text` all 431, hence §4.1. Partial: `coding`/`agents` from
`benchmarks.artificial_analysis.{coding,agentic}_index` (181) and `design_arena`
`agents/*`. `supported_parameters: tools` (364) is **not** evidence of an agent
domain.

**Coverage**: of 446 model entries, **431 (96.6%)** take modality domains
mechanically; **181 (40.6%)** additionally take `coding`/`agents` from the AA
indices; `research`/`science-math`/`robotics` are **0%**; the 9 feed-less
entries + 6 stale slugs (15, 3.4%) are 0% for anything.

**Tool category → domain** (category stays "the job it is for"; domain is
orthogonal): coding(3)→`coding` · agents(2)→`agents` · image(2)→`image` ·
audio(2)→`audio` · retrieval(3)→`research` · local, inference, training,
observability, data, frameworks, evaluation → **none**. **28 of 35 listings map
to no domain** — different axes, so `domain` must be optional on tools.

**Orgs — domains stated *in the entry only*** (`content/wiki/org/`):
alibaba-cloud `text,image,video` · anthropic `text,science-math` ("cybersecurity,
and soon, biology research") · cohere `text,coding,agents` ("agentic software
engineering") · perplexity `research` · z-ai `text,image,video` · deepseek,
google-deepmind, meta-superintelligence-labs, mistral-ai, moonshot-ai, nvidia,
spacexai, tencent, thinking-machines-lab `text` only · inception-labs and
**openai: not in entry** (no capability statement in either). Anything unlisted
is "not in entry"; deepseek/nvidia/spacexai state only parameter counts and
context windows, so even their `text` is a weak read.

## 4. Edge cases and traps

1. **`text` is near-universal, so near-useless as a filter.** 431/431 rows take
   text. Rule: `text` = *published as a general-purpose reasoning/writing
   model*, editorial, never derived from `input_modalities`. For a purely
   mechanical facet, drop `text` and let absence mean "general".
2. **Multimodal models take several domains.** Set-valued: a Gemini-class row is
   `text,image,video,audio`. No `multimodal` value — that is the union, not a
   member.
3. **"Agentic" vs "computer use" vs "coding agents"** — three names, one domain.
   `design_arena` carries both `models/gamedev` and `agents/agenticgamedev` for
   one task. One `agents` domain; computer use is a `content/wiki/technique/`
   entry tagged `agents`, not a domain.
4. **`research` and `science-math` are capability claims, not modalities.** Only
   Epoch treats them as areas. They exist because the board needs rows for
   search/deep-research products and math frontier claims, and no modality axis
   holds them. Both 100% editorial, thin index coverage.
5. **Audio vs music.** AA separates text-to-speech from music generation; two
   values exceed what the corpus supports (2 audio listings, 0 music entries).
   Keep one `audio`; revisit when music entries appear.
6. **Robotics** has no repo entry and no comparable index found. Include only
   because K21 makes membership editorial and the keeper named robotics groups
   as coverage; a zero-member value is otherwise a defect, not a facet.
7. **"Open weights" is NOT a domain — recommend against.** A property of a
   release, orthogonal to what a thing is *for*, and already a fact field:
   `open_weight_release` on `content/wiki/org/meta-superintelligence-labs.md`
   and `content/wiki/org/tencent.md`; AA publishes a separate Openness Index.
   Admitting it makes `domain` two axes at once and breaks the
   many-to-many-across-kinds property that justifies the facet.
8. **Ordering.** `domain` inherits `openspec/specs/directory/spec.md` ("No
   placement is ever sold") verbatim: the closed list lives in the build's
   schema, and any surface grouping by domain sorts by
   **domain name** — never declaration order, member count, or index score. A
   board ordered by "how important the domain is" is exactly the placement
   decision the spec forbids selling. Order sections by domain id, rows within a
   section by the published index value, each criterion stated on the page.

## 5. Alternatives, then a recommendation

**A. Modality-only** — `text, image, video, audio, file` (5). Derived 100%
mechanically for 431/431 rows: zero editorial cost, zero drift, matches HF and
OpenRouter. But it cannot express coding, agents, research, science or robotics,
so /frontier loses the three indices the site has on disk and 28 of 35 tool
listings plus every technique entry stay untagged. It answers "what goes in and
out", not "what is this for".

**B. Modality + capability** — the nine in §1. Costs editorial judgement on
`text`, `coding`, `agents`, `research`, `science-math`, `robotics`, and buys the
only arrangement where all three existing indices, the domain-bearing tool
categories, and the keeper's named coverage (labs without APIs, open-weights
groups, image/video/audio, robotics, research groups) fit one facet. Weakness:
two axes in one field, so a model is `text` and `coding` for different kinds of
reason and the facet cannot say which.

**C. Capability-only** — `general, coding, agents, creative, research,
science-math, robotics` (7), following Epoch. Cleanest for a frontier board,
since every published index is a capability measure. But it discards what the
repo computes for free (262 image / 79 video / 46 audio auto-tags), makes all
446 entries editorial, and collapses image/video/audio into a "creative" bucket
no external index matches — leaving image and video sections nothing citable.

**Recommendation: B.** (i) Only option the data on disk seeds — ~97% partially,
41% fully; (ii) maps close to 1:1 onto Arena's arenas, giving every domain but
`robotics` a citable comparator; (iii) keeps `open weights` and tool `category`
as separate axes, preserving the directory spec's ordering guarantee;
(iv) degrades safely — an empty domain renders as an empty section with a
stated reason, not a wrong claim.

## 6. Open questions for the keeper

1. Keep `text`, or make "general" the unmarked default (absence)?
2. Ship `robotics` with zero members, or hold for a first entry?
3. One `audio`, or split `speech` and `music` as AA does?
4. `science-math` as one value or two, as Epoch splits them?
5. Does `domain` live in wiki front matter or a separate derived map?
6. Tool `category` independent of `domain`, given 28/35 map to nothing?
7. May the site republish AA index values on /frontier — terms unverified?
8. Is `computer use` a technique tagged `agents`, or its own domain?
9. Do the 15 feed-less/stale entries get editorial domains, or stay untagged?
10. Is alphabetical domain ordering on /frontier acceptable?
