---
id: org/amazon
kind: org
display_name: Amazon
status: active
maintenance: stable
aliases:
  - name: Amazon
    class: exclusive
  - name: AWS
    class: shared
facts:
  - field: founded
    source: cited
    value: "5 July 1994, in Bellevue, Washington, by Jeff Bezos"
    source_url: "https://en.wikipedia.org/wiki/Amazon_(company)"
    accessed: "2026-09-06"
    volatility: static
  - field: nova_announced
    source: cited
    value: "3 December 2024 — Micro, Lite and Pro, \"available exclusively in Amazon Bedrock\""
    source_url: "https://aws.amazon.com/blogs/aws/introducing-amazon-nova-frontier-intelligence-and-industry-leading-price-performance/"
    accessed: "2026-09-06"
    volatility: dated
  - field: nova_1_top_model_promise
    source: cited
    value: "\"Amazon Nova Premier is still in training. We're targeting availability in early 2025.\""
    source_url: "https://aws.amazon.com/blogs/aws/introducing-amazon-nova-frontier-intelligence-and-industry-leading-price-performance/"
    accessed: "2026-09-06"
    volatility: dated
  - field: nova_premier_self_assessment
    source: cited
    value: "\"comparable to the best non-reasoning models in the industry and is equal or better on approximately half of these benchmarks when compared to other models in the same intelligence tier\", 30 April 2025"
    source_url: "https://aws.amazon.com/blogs/aws/amazon-nova-premier-our-most-capable-model-for-complex-tasks-and-teacher-for-model-distillation/"
    accessed: "2026-09-06"
    volatility: dated
  - field: nova_2_announced
    source: cited
    value: "2 December 2025 — Nova 2 Lite, with Nova 2 Sonic and Nova 2 Omni (preview) announced alongside it"
    source_url: "https://aws.amazon.com/blogs/aws/introducing-amazon-nova-2-lite-a-fast-cost-effective-reasoning-model/"
    accessed: "2026-09-06"
    volatility: dated
  - field: nova_2_thinking_control
    source: cited
    value: "extended thinking off by default, with three budget levels — low, medium or high"
    source_url: "https://aws.amazon.com/blogs/aws/introducing-amazon-nova-2-lite-a-fast-cost-effective-reasoning-model/"
    accessed: "2026-09-06"
    volatility: dated
  - field: current_model_menu
    source: cited
    value: "Nova 2 Lite, Nova 2 Sonic and Nova Multimodal Embeddings — the three tabs under \"Meet Nova 2 models\""
    source_url: "https://aws.amazon.com/nova/models/"
    accessed: "2026-09-06"
    volatility: slow
  - field: portfolio
    source: cited
    value: "\"Nova models\", \"Nova Forge\" and \"Nova Act\" — the vendor's own three-part description of Amazon Nova"
    source_url: "https://aws.amazon.com/ai/generative-ai/nova/"
    accessed: "2026-09-06"
    volatility: slow
  - field: internal_origin
    source: cited
    value: "\"built on AI technologies originally developed for Amazon's internal applications, such as Alexa+, Amazon Ads, Amazon Catalog System Services, AWS Marketplace, and Amazon Stores\""
    source_url: "https://aws.amazon.com/ai/generative-ai/nova/"
    accessed: "2026-09-06"
    volatility: slow
  - field: frontier_route
    source: cited
    value: "\"Nova Forge is the easiest and most cost-effective way to build your own frontier model\""
    source_url: "https://aws.amazon.com/blogs/aws/introducing-amazon-nova-forge-build-your-own-frontier-models-using-nova"
    accessed: "2026-09-06"
    volatility: dated
  - field: nova_forge_region
    source: cited
    value: "US East (N. Virginia), the only AWS Region named at launch"
    source_url: "https://aws.amazon.com/blogs/aws/introducing-amazon-nova-forge-build-your-own-frontier-models-using-nova"
    accessed: "2026-09-06"
    volatility: dated
  - field: customer_count
    source: cited
    value: "\"Over 50,000 customers use Amazon Nova models\", the vendor's own count"
    source_url: "https://aws.amazon.com/nova/models/"
    accessed: "2026-09-06"
    volatility: slow
  - field: bedrock_hosting_breadth
    source: cited
    value: "32 model slugs by nine authors on OpenRouter's Amazon Bedrock provider page, five of them Amazon's own"
    source_url: "https://openrouter.ai/provider/amazon-bedrock"
    accessed: "2026-09-06"
    volatility: dated
timeline:
  - date: "2024-12-03"
    event: "Amazon Nova announced at re:Invent — Micro, Lite and Pro, plus Canvas and Reel, \"available exclusively in Amazon Bedrock\""
    source_url: "https://aws.amazon.com/blogs/aws/introducing-amazon-nova-frontier-intelligence-and-industry-leading-price-performance/"
  - date: "2024-12-05"
    event: "amazon/nova-micro-v1 listed on OpenRouter, two days after the announcement"
    source_url: "https://openrouter.ai/amazon/nova-micro-v1"
  - date: "2024-12-05"
    event: "amazon/nova-lite-v1 listed on OpenRouter"
    source_url: "https://openrouter.ai/amazon/nova-lite-v1"
  - date: "2024-12-05"
    event: "amazon/nova-pro-v1 listed on OpenRouter"
    source_url: "https://openrouter.ai/amazon/nova-pro-v1"
  - date: "2025-04-30"
    event: "Nova Premier joins the Nova understanding models on Amazon Bedrock, four months after the \"early 2025\" target"
    source_url: "https://aws.amazon.com/blogs/aws/amazon-nova-premier-our-most-capable-model-for-complex-tasks-and-teacher-for-model-distillation/"
  - date: "2025-10-31"
    event: "amazon/nova-premier-v1 listed on OpenRouter, six months after it reached Bedrock"
    source_url: "https://openrouter.ai/amazon/nova-premier-v1"
  - date: "2025-12-02"
    event: "Nova Forge announced — a service to build your own frontier model from early Nova checkpoints"
    source_url: "https://aws.amazon.com/blogs/aws/introducing-amazon-nova-forge-build-your-own-frontier-models-using-nova"
  - date: "2025-12-02"
    event: "amazon/nova-2-lite-v1 listed on OpenRouter the same day Nova 2 Lite was announced"
    source_url: "https://openrouter.ai/amazon/nova-2-lite-v1"
mentions:
  - model/amazon-nova-micro-v1
  - model/amazon-nova-lite-v1
  - model/amazon-nova-pro-v1
  - model/amazon-nova-premier-v1
  - model/amazon-nova-2-lite-v1
  - org/anthropic
  - org/openai
---

Amazon occupies two columns of OpenRouter's data and they are not the same
size. One is the author prefix `amazon`, which carries five rows in the
catalog as observed on 5 September 2026. The other is a serving provider called
[Amazon Bedrock](https://openrouter.ai/provider/amazon-bedrock), whose page
names 32 model slugs across nine authors — 14 Anthropic, seven OpenAI, and one
each from Meta, Moonshot AI, Qwen, Writer, xAI and Z.ai, alongside Amazon's own
handful. Bedrock is also the only endpoint OpenRouter lists behind each Nova
row, so on this router Amazon is both the author and the host of its own
models, and the host of 27 more that belong to other people. A catalog built
from the models feed sees none of that half: a row names its author in its id
and carries a `top_provider` block holding a context length, a moderation flag
and a completion cap — and no provider name anywhere. The company that serves
Claude
and GPT is invisible to the table; the company that ships Nova gets a column.

One of those rows is current and the rest are not. Micro, Lite and Pro were
listed on 5 December 2024, two days after re:Invent, and still declare a
knowledge cutoff of 31 October 2024. Premier reached Bedrock on 30 April 2025
and the router on 31 October 2025 — six months of general availability before a
listing. Only `amazon/nova-2-lite-v1`, listed on 2 December 2025, advertises
`reasoning` and `tool_choice`; the others advertise neither, and that is the
unusual position, not the ordinary one — as observed on 5 September 2026, 304
of the 431 models OpenRouter carried support `reasoning`. Amazon said as much
itself when Premier shipped, and the sentence is worth reading twice for a
flagship launch: its own most capable model was "comparable to the best
non-reasoning models in the industry and is equal or better on approximately
half of these benchmarks when compared to other models in the same intelligence
tier."

The generational reset went further than a version bump. Amazon's
[current model page](https://aws.amazon.com/nova/models/) lists three things
under "Meet Nova 2 models": Nova 2 Lite, Nova 2 Sonic and Nova Multimodal
Embeddings. The strings *Nova Micro*, *Nova Pro*, *Nova Premier*, *Nova Canvas*
and *Nova Reel* do not occur on that page at all. So most of what a router user
can call from Amazon belongs to a generation the vendor's own menu no longer
acknowledges, and the generation that replaced it contains exactly one
general-purpose text model. Its name is Lite, and its window is
{{fact:model/amazon-nova-2-lite-v1#context_window}} against
{{fact:model/amazon-nova-lite-v1#context_window}} on the row whose name it
takes over.

There is no Nova 2 Pro and no Nova 2 Premier, and Amazon's answer to where the
top of the line went is not a model. On 2 December 2025, the same day as Nova 2
Lite, AWS announced
[Nova Forge](https://aws.amazon.com/blogs/aws/introducing-amazon-nova-forge-build-your-own-frontier-models-using-nova):
customers start "from early model checkpoints" across "pre-training,
mid-training, and post-training phases", blend proprietary data with
Nova-curated data to blunt catastrophic forgetting, run reinforcement learning
against their own environments and orchestrators, and import the result into
Bedrock as a private model. The Nova 2 Lite post makes the referral explicit —
"For organizations who need AI that truly understands their domain, Nova 2 Lite
is the best model to use with Nova Forge to build their own frontier
intelligence." A year earlier the same blog had introduced Nova as models that
"deliver frontier intelligence". Now the frontier is a programme the customer
runs, starting from the entry-tier checkpoint, and at launch it was available
in one AWS Region. Nova Act, the agent service, points the same way: it
automates browser workflows on "a custom Nova 2 Lite model" rather than on
anything larger, because there is nothing larger to point at.

That is the shape a price-and-context table cannot show, and the reason the
`amazon` column reads thin. Amazon's Nova is a portfolio in which the models
are one part of three — the vendor's own summary names "Nova models", "Nova
Forge" and "Nova Act" — built, on its own account, out of technologies
"originally developed for Amazon's internal applications, such as Alexa+,
Amazon Ads, Amazon Catalog System Services, AWS Marketplace, and Amazon
Stores". A router can list the first part. The other two are services, and the
one the company points customers at for frontier work has no row anywhere.
