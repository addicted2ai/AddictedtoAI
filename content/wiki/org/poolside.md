---
id: org/poolside
kind: org
display_name: Poolside
status: active
maintenance: living
aliases:
  - name: Poolside
    class: exclusive
facts:
  - field: self_description
    source: cited
    value: "\"We're building open-weight foundation models and the systems that refine and improve them.\""
    source_url: "https://poolside.ai/"
    accessed: "2026-09-06"
    volatility: slow
  - field: first_public_models
    source: cited
    value: "\"Today is the first time we're shipping models in public.\""
    source_url: "https://poolside.ai/blog/introducing-laguna-xs2-m1"
    accessed: "2026-09-06"
    volatility: dated
  - field: open_ecosystem_aim
    source: cited
    value: "\"The open-weight ecosystem in the West is still early in its development. We want to change that.\""
    source_url: "https://poolside.ai/blog/introducing-laguna-xs2-m1"
    accessed: "2026-09-06"
    volatility: dated
  - field: platform_pitch
    source: cited
    value: "\"For any team whose data is too sensitive, too regulated, or too strategic to send outside of their security boundary, the Poolside Platform puts AI within reach.\""
    source_url: "https://poolside.ai/blog/introducing-the-poolside-platform"
    accessed: "2026-09-06"
    volatility: dated
  - field: aws_partnership
    source: cited
    value: "\"Unveiling Poolside's first-party partnership with AWS\""
    source_url: "https://poolside.ai/blog/unveiling-our-partnership-with-aws"
    accessed: "2026-09-06"
    volatility: dated
  - field: laguna_xs_2_license
    source: cited
    value: "apache-2.0"
    source_url: "https://huggingface.co/api/models/poolside/Laguna-XS.2"
    accessed: "2026-09-06"
    volatility: static
  - field: laguna_m_1_license
    source: cited
    value: "apache-2.0"
    source_url: "https://huggingface.co/api/models/poolside/Laguna-M.1"
    accessed: "2026-09-06"
    volatility: static
  - field: laguna_xs_2_1_license
    source: cited
    value: "openmdw-1.1"
    source_url: "https://huggingface.co/api/models/poolside/Laguna-XS-2.1"
    accessed: "2026-09-06"
    volatility: static
  - field: laguna_s_2_1_license
    source: cited
    value: "openmdw-1.1"
    source_url: "https://huggingface.co/api/models/poolside/Laguna-S-2.1"
    accessed: "2026-09-06"
    volatility: static
  - field: license_change_rationale
    source: cited
    value: "\"We are making this change to support open model distribution for the community. OpenMDW-1.1 is fully permissive and designed for models and related artifacts, giving developers and organizations a more consistent framework for using, modifying and deploying open models.\" — the paragraph under the heading \"A more open license\""
    source_url: "https://poolside.ai/blog/introducing-laguna-xs-2-1"
    accessed: "2026-09-06"
    volatility: dated
  - field: xs_architecture_unchanged
    source: cited
    value: "\"It's the same architecture as XS.2, with a notable improvement on SWE-bench Multilingual and stronger performance on terminal-style tasks.\""
    source_url: "https://poolside.ai/blog/introducing-laguna-xs-2-1"
    accessed: "2026-09-06"
    volatility: static
  - field: xs_2_tensor_total
    source: cited
    value: "33,442,617,088, the safetensors parameter total the Hugging Face API reports for poolside/Laguna-XS.2"
    source_url: "https://huggingface.co/api/models/poolside/Laguna-XS.2"
    accessed: "2026-09-06"
    volatility: static
  - field: xs_2_1_tensor_total
    source: cited
    value: "33,442,617,088, the safetensors parameter total the Hugging Face API reports for poolside/Laguna-XS-2.1"
    source_url: "https://huggingface.co/api/models/poolside/Laguna-XS-2.1"
    accessed: "2026-09-06"
    volatility: static
  - field: weight_class_claim
    source: cited
    value: "\"the most capable agentic coding model in its weight class by a wide margin\", the vendor's own bolded comparison"
    source_url: "https://poolside.ai/blog/introducing-laguna-s-2-1"
    accessed: "2026-09-06"
    volatility: dated
  - field: laguna_s_2_1_size
    source: cited
    value: "\"Laguna S 2.1 is a 118B total parameter Mixture-of-Experts (MoE) model with 8B activated parameters per token\""
    source_url: "https://poolside.ai/blog/introducing-laguna-s-2-1"
    accessed: "2026-09-06"
    volatility: static
  - field: comparison_table_sizes
    source: cited
    value: "Tencent Hy3 295B-A21B, Nemotron 3 Ultra 550B-A55B, Inkling 975B-A41B, DeepSeek-V4-Pro Max 1.6T-A49B, Kimi K3 2.8T-A50B — and Qwen 3.7 Max, Muse Spark 1.1 and Claude Fable 5 carrying an em dash where a size would go"
    source_url: "https://poolside.ai/blog/introducing-laguna-s-2-1"
    accessed: "2026-09-06"
    volatility: dated
  - field: terminal_bench_scores
    source: cited
    value: "70.2 for Laguna S 2.1 (118B-A8B), behind Kimi K3 88.3, Claude Fable 5 88.0, Muse Spark 1.1 80, Qwen 3.7 Max 74.5 and Tencent Hy3 71.7 — five of the eight columns Poolside chose"
    source_url: "https://poolside.ai/blog/introducing-laguna-s-2-1"
    accessed: "2026-09-06"
    volatility: dated
  - field: swe_bench_multilingual_scores
    source: cited
    value: "78.5 for Laguna S 2.1, ahead of Qwen 3.7 Max 78.3, DeepSeek-V4-Pro Max 76.2, Tencent Hy3 75.8 and Nemotron 3 Ultra 67.7 — the other four columns are empty"
    source_url: "https://poolside.ai/blog/introducing-laguna-s-2-1"
    accessed: "2026-09-06"
    volatility: dated
  - field: benchmark_method
    source: cited
    value: "\"For all benchmarks we take the maximum of the vendor self-reported score, benchmark author leaderboard or third-party leaderboard (Artificial Analysis), except SWE Atlas (Codebase QnA) where we do not use third-party leaderboard figures.\""
    source_url: "https://poolside.ai/blog/introducing-laguna-s-2-1"
    accessed: "2026-09-06"
    volatility: dated
  - field: trajectory_release
    source: cited
    value: "\"For every benchmark score we publish today, we are releasing full trajectories for every trial in the final evaluation set at trajectories.poolside.ai.\""
    source_url: "https://poolside.ai/blog/introducing-laguna-s-2-1"
    accessed: "2026-09-06"
    volatility: dated
  - field: trajectory_archive
    source: cited
    value: "712 trial records in the Terminal-Bench 2.1 view's embedded payload, spanning 89 distinct task ids in `thinking` and `no-thinking` variants; each record carries its reward, step count, reasoning-character count and dollar cost"
    source_url: "https://trajectories.poolside.ai/"
    accessed: "2026-09-06"
    volatility: dated
  - field: nvidia_inference_work
    source: cited
    value: "\"NVIDIA helped optimize inference across its hardware, from TRT-LLM serving and NVFP4 on Blackwell systems down to a single NVIDIA DGX Spark.\""
    source_url: "https://poolside.ai/blog/introducing-laguna-s-2-1"
    accessed: "2026-09-06"
    volatility: dated
  - field: training_run
    source: cited
    value: "\"Laguna S 2.1 began pre-training on 4,096 NVIDIA H200 GPUs on May 22, 2026, 60 days ago.\""
    source_url: "https://poolside.ai/blog/introducing-laguna-s-2-1"
    accessed: "2026-09-06"
    volatility: static
  - field: router_created
    source: cited
    value: "poolside/laguna-xs-2.1 created 2026-07-02T14:27:09Z, poolside/laguna-s-2.1 created 2026-07-21T16:51:23Z"
    source_url: "https://openrouter.ai/api/v1/models"
    accessed: "2026-09-06"
    volatility: dated
  - field: laguna_s_2_1_reception
    source: cited
    value: "1,016 likes and 46,646 downloads on poolside/Laguna-S-2.1, against 240 and 42,728 for Laguna-XS-2.1, 320 and 30,523 for Laguna-XS.2, and 144 and 8,201 for Laguna-M.1"
    source_url: "https://huggingface.co/api/models/poolside/Laguna-S-2.1"
    accessed: "2026-09-06"
    volatility: dated
timeline:
  - date: "2024-12-04"
    event: "Poolside announces a first-party partnership with AWS"
    source_url: "https://poolside.ai/blog/unveiling-our-partnership-with-aws"
  - date: "2025-11-18"
    event: "Poolside acquires Fern Labs, a London company behind the Bridge multi-agent orchestration layer"
    source_url: "https://poolside.ai/blog/fern-labs-acquisition"
  - date: "2026-04-23"
    event: "poolside/Laguna-XS.2 repository created on Hugging Face (createdAt), licensed apache-2.0"
    source_url: "https://huggingface.co/api/models/poolside/Laguna-XS.2"
  - date: "2026-04-28"
    event: "Laguna XS.2 and Laguna M.1 announced — Poolside's first models shipped in public"
    source_url: "https://poolside.ai/blog/introducing-laguna-xs2-m1"
  - date: "2026-05-05"
    event: "The Poolside Platform announced, for teams that will not send data outside their own security boundary"
    source_url: "https://poolside.ai/blog/introducing-the-poolside-platform"
  - date: "2026-06-15"
    event: "poolside/Laguna-M.1 repository created on Hugging Face (createdAt), still apache-2.0"
    source_url: "https://huggingface.co/api/models/poolside/Laguna-M.1"
  - date: "2026-06-20"
    event: "poolside/Laguna-XS-2.1 repository created on Hugging Face (createdAt), the first Laguna licensed openmdw-1.1"
    source_url: "https://huggingface.co/api/models/poolside/Laguna-XS-2.1"
  - date: "2026-07-02"
    event: "Laguna XS 2.1 announced, the licence change explained under the heading \"A more open license\""
    source_url: "https://poolside.ai/blog/introducing-laguna-xs-2-1"
  - date: "2026-07-13"
    event: "poolside/Laguna-S-2.1 repository created on Hugging Face (createdAt), licensed openmdw-1.1"
    source_url: "https://huggingface.co/api/models/poolside/Laguna-S-2.1"
  - date: "2026-07-21"
    event: "Laguna S 2.1 announced with full evaluation trajectories published alongside the scores"
    source_url: "https://poolside.ai/blog/introducing-laguna-s-2-1"
mentions:
  - model/poolside-laguna-s-2-1
  - model/poolside-laguna-s-2-1-free
  - model/poolside-laguna-xs-2-1
  - model/poolside-laguna-xs-2-1-free
  - org/amazon
  - org/nvidia
---

A row on a public router is the thing Poolside's public record argued
against. Read its blog backwards from May 2026 and it is an enterprise sales
record: the AWS announcement of December 2024 —
{{fact:org/poolside#aws_partnership}} — a
[Redpanda tie-up](https://poolside.ai/blog/partnering-with-redpanda), the
acquisition of London's Fern Labs, a
[Dell configuration](https://poolside.ai/blog/poolside-on-dell), and in May
the Poolside Platform,
sold on the premise that {{fact:org/poolside#platform_pitch}}. Seven days
before that Platform post, on 28 April 2026, the same blog said
{{fact:org/poolside#first_public_models}}. Every row this catalog carries is
newer than that sentence, and the homepage now opens with
{{fact:org/poolside#self_description}}.

The interesting part is what happened to the licence in the twelve weeks
after. The first two public models were the most permissive thing on offer:
Laguna XS.2's repository went up on 23 April 2026 as
{{fact:org/poolside#laguna_xs_2_license}}, Laguna M.1's on 15 June as
{{fact:org/poolside#laguna_m_1_license}}. The next two did not. Laguna XS 2.1
(20 June) is {{fact:org/poolside#laguna_xs_2_1_license}} and Laguna S 2.1
(13 July) is {{fact:org/poolside#laguna_s_2_1_license}} — the
[Linux Foundation's model-specific licence](https://openmdw.ai/) rather than
the one every developer already knows. Poolside filed the switch under a
heading reading "A more open license":
{{fact:org/poolside#license_change_rationale}}.

Whether that is more open is arguable; that it is a change is not, and the
cleanest place to see it is the pair where nothing else moved. Poolside says
XS 2.1 is a refresh, not a redesign —
{{fact:org/poolside#xs_architecture_unchanged}} — and the weights agree to the
parameter: the API reports {{fact:org/poolside#xs_2_tensor_total}} and
{{fact:org/poolside#xs_2_1_tensor_total}}. Same architecture, same size, new
terms. Both of this catalog's Laguna models sit on the OpenMDW side of that
line; neither Apache release ever got a row here.

The headline claim is bounded more tightly than it first reads. Poolside calls
Laguna S 2.1 {{fact:org/poolside#weight_class_claim}}, and "in its weight
class" is carrying the sentence. Not one of the eight rivals in its own
comparison table is in that class:
{{fact:org/poolside#comparison_table_sizes}} — against
{{fact:org/poolside#laguna_s_2_1_size}}. On Terminal-Bench 2.1, the first
benchmark in that table, most of it beats Poolside —
{{fact:org/poolside#terminal_bench_scores}}. On SWE-Bench Multilingual it
leads every cell that is filled: {{fact:org/poolside#swe_bench_multilingual_scores}}.
And the methodology note is generous to everyone else in the room:
{{fact:org/poolside#benchmark_method}}. Each competitor is scored at its best
published number, and Poolside printed the rows it loses anyway.

Then it published the evidence.
{{fact:org/poolside#trajectory_release}} — and the archive is live. The
Terminal-Bench view alone holds
{{fact:org/poolside#trajectory_archive}}. A reader who doubts the score can
open the runs behind it, including the ones that failed, and see what each
attempt cost. Publishing a number invites trust; publishing the transcripts
invites contradiction.

That model came out of a short run by the standards of the sizes it is
measured against — {{fact:org/poolside#training_run}} — with NVIDIA credited
for the inference work behind it:
{{fact:org/poolside#nvidia_inference_work}}. The reception was lopsided in
its favour: {{fact:org/poolside#laguna_s_2_1_reception}}.

The catalog rows themselves conceal an asymmetry worth knowing before you
spend a request on the free tier. `poolside/laguna-s-2.1` serves
{{fact:model/poolside-laguna-s-2-1#context_window}} and
`poolside/laguna-s-2.1:free` serves
{{fact:model/poolside-laguna-s-2-1-free#context_window}}; the XS pair are
identical on both tiers. The long context is the paid product. And Poolside is
not treating the router as a shelf of last resort:
{{fact:org/poolside#router_created}} — each timestamp lands on the same UTC day
as the post that announced the model.
