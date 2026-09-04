---
title: "Thomson Reuters says its $40M in-house model is 'on par with the latest frontier models'"
date: "2026-09-03"
covers:
  - key: "llm-releases|a61866b0b06d011a|68d9e4fb05fa6b60|574c56d8-1a40-41d1-bbe7-0d1a7be5e53f|$arrival"
    date: "2026-09-01"
---

Thomson Reuters announced Thomson on 24 August 2026 from Toronto: its first in-house large language model, built by "investing $40 million to train Thomson into the right intelligence for the jobs that matter most, covering talent and compute" and trained so far on "less than 10% of Thomson Reuters content". The same opening paragraph sets the comparison the company wants: "Frontier labs have typically spent billions of dollars on compute and years of infrastructure investment to reach the frontier." First deployment is inside Tabular Analysis in CoCounsel Legal, and a "small" version of the model is downloadable on Hugging Face.

The parity claim is CEO Steve Hasker's, quoted in the release: "our early evaluations put Thomson on par with the latest frontier models across a range of tasks." CTO Joel Hron is quoted on the economics: "Start with a strong foundation, specialize it deeply for the work that matters, and you can build intelligence that is highly capable, far more efficient and entirely under your control."

## The card the release does not link

The release leaves the base model, the size, the architecture and the context window unstated, and the llm-releases record that surfaced the story lists them as undisclosed. The Hugging Face repository, fetched 3 September 2026, discloses all four. `thomsonreuters/Thomson-1.0-Small` is a mixture-of-experts with 35B parameters and 3B active, 262,144 tokens of native context, "obtained by repurposing the open-weight Qwen3.6-35B-A3B model". The lineage is public end to end: Qwen3.6-35B-A3B (Apache-2.0), then Snowdon1.1-Small, a value-realigned checkpoint from the tri-fair-lab org (Apache-2.0), then Thomson-1.0-Small.

The card calls the result "a frontier Foundation Model" and puts its own numbers to the $40M: the full pipeline "consumed approximately 1.63 × 10²³ FLOP over 35,207 B200 GPU-hours". Its benchmark table averages 74.6 across the board, against 71.2 for Gemma 4-31B and 68.2 for Haiku 4.5. The table carries the bases too — Snowdon1.1-Small and Qwen3.6-35B-A3B, both Apache-2.0, both averaging 71.7 — so the $40M bought 2.9 points over the free base it repurposed. The headline legal rows go the other way: Stanford LegalBench 79.9 is last of the five columns in the card's own table, behind both bases (Qwen 80.3, Snowdon 80.9) and behind both competitors it beats on the overall average (Haiku 4.5's 80.7, Gemma's 83.1), and MBE Bar Exam 83.4 barely clears Snowdon's 83.1 against Gemma's 88.8.

## The report splits the $40M

The release says evaluations are "available in the technical report about the model's development" and links nothing. Its body carries one hyperlink, to the Fiduciary-Grade standards page. The report is public anyway: arXiv 2608.27147v1, "Thomson: Continual Learning of Frontier Models for SovereignAI", submitted 27 August 2026, and the PDF the model card links in the tri-fair-lab publications space. It covers two models, Thomson-1.0-Large on the Qwen3.5-397B base and the open Small, and it splits the $40M. The final training run for the Large, "measured in GPU costs over three weeks of training", "is conservatively estimated to be under USD 450,000". The "total cost of development (including staff, compute costs, domain expert compensation, and vendor partnerships) is estimated at approximately USD 40M", most of it "reusable research, infrastructure engineering & experimentation". The team: "not exceeding three dozen engineers and scientists", on "no more than 368 B200 GPUs".

The report's claim is bolder than the release's: continual learning took the base "broadly comparable to frontier performance in November 2025" to "surpassing recent flagship releases ranging from Sonnet 5 & GLM-5.2 (June 2026), GPT-5.5 & DeepSeek-V4 Pro (April 2026) to Gemini 3.1 Pro (February, 2026) on a wide range of tasks". Those scores are the authors' own. The release's independent evidence is two named academics: Jonathan H. Choi of Washington University School of Law, who preferred Thomson's responses "overall" to ChatGPT's and Claude's on his Corporate Tax questions, and Samuel Dahan of Queen's Conflict Analytics Lab and Cornell Legal AI Lab, who found "citation quality generally competitive with leading frontier models" on Canadian employment-law questions.

## "Academic" undersells the licence

The release describes the small version as "for academic and non-commercial use". The LICENSE file in the repository is the stock PolyForm Strict 1.0.0 text. Any noncommercial purpose is a permitted purpose, and so is use by "any charitable organization, educational institution, public research organization, public safety or health organization, environmental protection organization, or government institution", "regardless of the source of funding". Categories the release's gloss does not name.

The strict part is the grant. It covers everything "other than distributing the software or making changes or new works based on the software", and it forbids sublicensing. Read literally, the third-party conversions already on the platform sit outside that grant: bartowski's GGUF of Thomson-1.0-Small, latest update 26 August, has out-downloaded the source repo by roughly two orders of magnitude — both counts are Hugging Face's rolling 30-day figures, not cumulative totals (the source repo is recent enough, created 18 August, that its window spans its whole life). An "open-weight" release whose licence grants neither redistribution nor derivative works is not open in the sense of the platform's other releases. It is a display case for a model that stays closed.

## Who it lands on

CoCounsel Legal users, law firms and corporate legal departments, get nothing broken. CoCounsel "remains multi-model by design", and Thomson arrives in Tabular Analysis, the structured-review feature, "in the upcoming release", with no date given. What changes is structural: the company now owns a model in the loop instead of renting one, and it names "more sovereign AI options to follow".

Researchers get weights they may run and study, and the licence says so in plain text. What it does not grant is redistribution, derivative works, or any commercial use. The bet deserves its own sentence: a 175-year-old content company is claiming that proprietary data plus $40M of post-training on an open base reaches what frontier labs bought with billions. If it holds, every enterprise with a defensible corpus just got an economics argument for owning its model. The report's own numbers are its only evidence so far.

## Sources

All fetched 3 September 2026.

- Press release, "Thomson Reuters Leverages its World-Class Data Assets to Launch Its Own Frontier Model", Toronto, 24 August 2026 ([thomsonreuters.com](https://www.thomsonreuters.com/en/press-releases/2026/august/thomson-reuters-leverages-its-world-class-data-assets-to-launch-its-own-frontier-model))
- Fiduciary-Grade standards page, the release's only hyperlink ([thomsonreuters.com](https://www.thomsonreuters.com/en-us/posts/innovation/thomson-reuters-standard-for-high-stakes-ai/))
- LLM Releases entry for Thomson, which lists size, architecture and context window as undisclosed ([llm-releases.com/models/thomson](https://llm-releases.com/models/thomson))
- Model card, `thomsonreuters/Thomson-1.0-Small` ([huggingface.co/thomsonreuters/Thomson-1.0-Small](https://huggingface.co/thomsonreuters/Thomson-1.0-Small))
- Repository LICENSE (raw) ([huggingface.co/thomsonreuters/Thomson-1.0-Small/raw/main/LICENSE](https://huggingface.co/thomsonreuters/Thomson-1.0-Small/raw/main/LICENSE))
- Repository `config.json` (raw), `text_config.max_position_embeddings: 262144` ([huggingface.co/thomsonreuters/Thomson-1.0-Small/raw/main/config.json](https://huggingface.co/thomsonreuters/Thomson-1.0-Small/raw/main/config.json))
- Hugging Face API records for Thomson-1.0-Small ([huggingface.co/api/models/thomsonreuters/Thomson-1.0-Small](https://huggingface.co/api/models/thomsonreuters/Thomson-1.0-Small)), Snowdon1.1-Small ([huggingface.co/api/models/tri-fair-lab/Snowdon1.1-Small](https://huggingface.co/api/models/tri-fair-lab/Snowdon1.1-Small)), Qwen3.6-35B-A3B ([huggingface.co/api/models/Qwen/Qwen3.6-35B-A3B](https://huggingface.co/api/models/Qwen/Qwen3.6-35B-A3B)) and bartowski's GGUF conversion ([huggingface.co/api/models/bartowski/thomsonreuters_Thomson-1.0-Small-GGUF](https://huggingface.co/api/models/bartowski/thomsonreuters_Thomson-1.0-Small-GGUF))
- Technical report, arXiv 2608.27147v1, submitted 27 August 2026 ([arxiv.org/abs/2608.27147v1](https://arxiv.org/abs/2608.27147v1))
- Technical report PDF, tri-fair-lab publications space ([huggingface.co/spaces/tri-fair-lab/publications](https://huggingface.co/spaces/tri-fair-lab/publications/blob/main/Thomson_1_0_Technical_Report.pdf))
- PolyForm Strict License 1.0.0, canonical text ([polyformproject.org](https://polyformproject.org/licenses/strict/1.0.0))
- This site's change feed, which first recorded the event on 1 September 2026 (the declared anchor above) ([data/changes.jsonl](/data))