---
id: org/microsoft
kind: org
display_name: Microsoft
status: active
maintenance: living
aliases:
  - name: Microsoft
    class: exclusive
  - name: Microsoft AI
    class: manual
  - name: Microsoft Research
    class: manual
facts:
  - field: mai_family_announced
    source: cited
    value: "\"Today we are announcing a family of seven new models developed in-house at Microsoft AI. Beyond these models, we're building a superintelligence lab – a system and an approach we believe will define the next phase of AI.\" — Mustafa Suleyman, under the dateline \"June 2, 2026\" and the standfirst \"Updated as of June 8, 2026.\""
    source_url: "https://microsoft.ai/news/building-a-hillclimbing-machine-launching-seven-new-mai-models/"
    accessed: "2026-09-06"
    volatility: dated
  - field: mai_router_distribution
    source: cited
    value: "\"Alongside distribution on Foundry and optimization for our 1P products, our models are also going to be widely available for developers on OpenRouter, as well as Fireworks and Baseten. For the first time developers will be able to tune the weights of the model themselves.\""
    source_url: "https://microsoft.ai/news/building-a-hillclimbing-machine-launching-seven-new-mai-models/"
    accessed: "2026-09-06"
    volatility: dated
  - field: mai_no_distillation
    source: cited
    value: "\"We don't distill from other labs and we don't rely on opaque data. Our datasets are clean, traceable, and enterprise-grade.\""
    source_url: "https://microsoft.ai/news/building-a-hillclimbing-machine-launching-seven-new-mai-models/"
    accessed: "2026-09-06"
    volatility: dated
  - field: mai_line_today
    source: cited
    value: "seven cards — MAI-Transcribe-2, MAI-Thinking-1, MAI-Code-1.1-Flash, MAI-Image-2.6 and MAI-Voice-2 under \"Foundational model\", MAI-Cyber-1-Flash under the same label, and Microsoft Frontier Tuning under \"Custom\""
    source_url: "https://microsoft.ai/models/"
    accessed: "2026-09-06"
    volatility: slow
  - field: mai_versions_moved
    source: cited
    value: "the June announcement names MAI-Image-2.5, MAI-Code-1-Flash and \"MAI Transcribe-1.5\"; the model index today names MAI-Image-2.6, MAI-Code-1.1-Flash and MAI-Transcribe-2"
    source_url: "https://microsoft.ai/news/building-a-hillclimbing-machine-launching-seven-new-mai-models/"
    accessed: "2026-09-06"
    volatility: dated
  - field: mai_rows_on_this_router
    source: cited
    value: "none. Across all 431 rows the OpenRouter models API returns, the only ids or names matching `mai`, `microsoft`, `phi`, `maia` or `wizard` are microsoft/phi-4, microsoft/wizardlm-2-8x22b and an unrelated Venice fine-tune; there is no `mai` or `microsoft-ai` namespace"
    source_url: "https://openrouter.ai/api/v1/models"
    accessed: "2026-09-06"
    volatility: dated
  - field: azure_is_a_router_provider
    source: cited
    value: "\"Azure\", one of the 106 entries the OpenRouter providers API returns, carrying `privacy_policy_url` https://www.microsoft.com/en-us/privacy/privacystatement and `status_page_url` https://status.azure.com/"
    source_url: "https://openrouter.ai/api/v1/providers"
    accessed: "2026-09-06"
    volatility: dated
  - field: azure_serves_openai_only
    source: cited
    value: "34 rows list Azure as an endpoint provider and every one of them is in the `openai/` namespace, from openai/gpt-3.5-turbo-0613 to openai/gpt-6-astra-pro — measured by calling /api/v1/models/<id>/endpoints once for each of the 123 rows this list carries in the `openai/`, `microsoft/`, `meta-llama/` and `mistralai/` namespaces. Neither `microsoft/` row is among the 34"
    source_url: "https://openrouter.ai/api/v1/models"
    accessed: "2026-09-06"
    volatility: dated
  - field: azure_serves_gpt_6_astra
    source: cited
    value: "one endpoint named \"Azure | openai/gpt-6-astra\", tags `azure` and `azure/us` — the single-row spot check for the sweep above"
    source_url: "https://openrouter.ai/api/v1/models/openai/gpt-6-astra/endpoints"
    accessed: "2026-09-06"
    volatility: dated
  - field: phi_4_served_by
    source: cited
    value: "exactly one endpoint, \"DeepInfra | microsoft/phi-4\", quantization bf16"
    source_url: "https://openrouter.ai/api/v1/models/microsoft/phi-4/endpoints"
    accessed: "2026-09-06"
    volatility: dated
  - field: wizardlm_served_by
    source: cited
    value: "exactly one endpoint, \"Novita | microsoft/wizardlm-2-8x22b\", quantization bf16"
    source_url: "https://openrouter.ai/api/v1/models/microsoft/wizardlm-2-8x22b/endpoints"
    accessed: "2026-09-06"
    volatility: dated
  - field: wizardlm_router_description
    source: cited
    value: "\"WizardLM-2 8x22B is Microsoft AI's most advanced Wizard model. It demonstrates highly competitive performance compared to leading proprietary models, and it consistently outperforms all existing state-of-the-art opensource models.\" — OpenRouter's own catalog copy, not Microsoft's"
    source_url: "https://openrouter.ai/api/v1/models/microsoft/wizardlm-2-8x22b/endpoints"
    accessed: "2026-09-06"
    volatility: dated
  - field: wizardlm_repo_unreachable
    source: cited
    value: "HTTP 401 with the body {\"error\":\"Invalid username or password.\"}, for the repository id the OpenRouter row declares as its `hugging_face_id`. The repository page at https://huggingface.co/microsoft/WizardLM-2-8x22B answers 401 as well; so does microsoft/WizardLM-2-7B"
    source_url: "https://huggingface.co/api/models/microsoft/WizardLM-2-8x22B"
    accessed: "2026-09-06"
    volatility: dated
  - field: only_dead_upstream_in_the_catalog
    source: cited
    value: "the only one. 179 of the 431 rows this list returns declare a `hugging_face_id`; 178 of those ids answer HTTP 200 from https://huggingface.co/api/models/<id> and microsoft/WizardLM-2-8x22B alone does not — swept one id at a time on 2026-09-06"
    source_url: "https://openrouter.ai/api/v1/models"
    accessed: "2026-09-06"
    volatility: dated
  - field: no_microsoft_wizard_repos
    source: cited
    value: "an empty JSON array — Hugging Face lists no model repository at all under the `microsoft` author whose name matches \"wizard\""
    source_url: "https://huggingface.co/api/models?author=microsoft&search=wizard"
    accessed: "2026-09-06"
    volatility: dated
  - field: wizardlm_surviving_weights
    source: cited
    value: "alpindale/WizardLM-2-8x22B — author `alpindale`, createdAt 2024-04-16T02:36:59.000Z, license apache-2.0, 140,620,634,112 safetensors parameters in 59 shards, 416 likes"
    source_url: "https://huggingface.co/api/models/alpindale/WizardLM-2-8x22B"
    accessed: "2026-09-06"
    volatility: dated
  - field: wizardlm_mirror_provenance
    source: cited
    value: "\"url: https://huggingface.co/microsoft/WizardLM-2-8x22B\", \"branch: main\", \"download date: 2024-04-15 16:48:15\" — the first three lines of the mirror's huggingface-metadata.txt, above a sha256 for the repository and one for each of the 59 safetensors shards"
    source_url: "https://huggingface.co/alpindale/WizardLM-2-8x22B/raw/main/huggingface-metadata.txt"
    accessed: "2026-09-06"
    volatility: static
  - field: wizardlm_withdrawal_reported
    source: cited
    value: "\"Then it deleted the model from the internet a few hours later because, as The Information reported, it “accidentally missed” required “toxicity testing” before it was released.\" — 404 Media, 23 April 2024, reporting The Information; Microsoft \"declined to comment\""
    source_url: "https://www.404media.co/microsoft-deleted-its-llm-because-it-didnt-get-a-safety-test-but-now-its-everywhere/"
    accessed: "2026-09-06"
    volatility: dated
  - field: wizardlm_spread_reported
    source: cited
    value: "\"However, as first spotted by Memetica, in the short hours before it was taken down, several people downloaded the model and reuploaded it to Github and Hugging Face\" — 404 Media"
    source_url: "https://www.404media.co/microsoft-deleted-its-llm-because-it-didnt-get-a-safety-test-but-now-its-everywhere/"
    accessed: "2026-09-06"
    volatility: dated
  - field: wizardlm_announcement_still_standing
    source: cited
    value: "dated \"Apr 15, 2024\", still reading \"We introduce and opensource WizardLM-2\" and \"New family includes three cutting-edge models: WizardLM-2 8x22B, WizardLM-2 70B, and WizardLM-2 7B\", and still stating \"The License of WizardLM-2 8x22B and WizardLM-2 7B is Apache2.0\""
    source_url: "https://wizardlm.github.io/WizardLM2/"
    accessed: "2026-09-06"
    volatility: dated
  - field: phi_4_red_teaming
    source: cited
    value: "\"For qualitative safety evaluation, we collaborated with the independent AI Red Team (AIRT) at Microsoft to assess safety risks posed by `phi-4` in both average and adversarial user scenarios.\""
    source_url: "https://huggingface.co/microsoft/phi-4/raw/main/README.md"
    accessed: "2026-09-06"
    volatility: dated
  - field: phi_4_intended_use
    source: cited
    value: "\"Our model is designed to accelerate research on language models, for use as a building block for generative AI powered features.\""
    source_url: "https://huggingface.co/microsoft/phi-4/raw/main/README.md"
    accessed: "2026-09-06"
    volatility: dated
  - field: phi_4_training_run
    source: cited
    value: "\"1920 H100-80G\" GPUs, a \"21 days\" training time and \"9.8T tokens\" of training data, over the dates \"October 2024 – November 2024\", for a \"14B parameters, dense decoder-only Transformer model\""
    source_url: "https://huggingface.co/microsoft/phi-4/raw/main/README.md"
    accessed: "2026-09-06"
    volatility: static
  - field: phi_4_license
    source: cited
    value: "mit, the value `cardData.license` carries on the repository"
    source_url: "https://huggingface.co/api/models/microsoft/phi-4"
    accessed: "2026-09-06"
    volatility: static
  - field: phi_4_weights
    source: cited
    value: "14,659,507,200 safetensors parameters, all BF16"
    source_url: "https://huggingface.co/api/models/microsoft/phi-4"
    accessed: "2026-09-06"
    volatility: static
  - field: phi_4_still_tended
    source: cited
    value: "nine commits on main between 2024-12-11T11:47:29Z and 2026-07-14T14:22:25Z, the last of them \"Restore <|endoftext|> (100257) as a stop token in generation_config (#67)\" by `gugarosa`, who also made the first"
    source_url: "https://huggingface.co/api/models/microsoft/phi-4/commits/main"
    accessed: "2026-09-06"
    volatility: dated
  - field: phi_4_three_birthdays
    source: cited
    value: "repository initial commit 2024-12-11T11:47:29Z; the model card's stated \"Release date\" December 12, 2024; the OpenRouter row's `created` 1736489872, which is 2025-01-10T06:17:52Z"
    source_url: "https://openrouter.ai/api/v1/models/microsoft/phi-4/endpoints"
    accessed: "2026-09-06"
    volatility: dated
timeline:
  - date: "2024-04-15"
    event: "WizardLM-2 announced as three open models — 8x22B, 70B and 7B — on the project's own page"
    source_url: "https://wizardlm.github.io/WizardLM2/"
  - date: "2024-04-16"
    event: "alpindale/WizardLM-2-8x22B created on Hugging Face (createdAt 02:36:59Z), the copy of the 8x22B weights that is still public today"
    source_url: "https://huggingface.co/api/models/alpindale/WizardLM-2-8x22B"
  - date: "2024-04-16"
    event: "microsoft/wizardlm-2-8x22b appears on OpenRouter (row `created` 1713225600)"
    source_url: "https://openrouter.ai/api/v1/models/microsoft/wizardlm-2-8x22b/endpoints"
  - date: "2024-04-23"
    event: "404 Media reports that Microsoft deleted WizardLM-2 hours after release over missed toxicity testing, and that copies had already spread"
    source_url: "https://www.404media.co/microsoft-deleted-its-llm-because-it-didnt-get-a-safety-test-but-now-its-everywhere/"
  - date: "2024-12-11"
    event: "microsoft/phi-4 repository created on Hugging Face — initial commit 11:47:29Z, files uploaded six minutes later"
    source_url: "https://huggingface.co/api/models/microsoft/phi-4/commits/main"
  - date: "2025-01-08"
    event: "\"Add Phi-4 Technical Report Link (#10)\" committed to the phi-4 repository"
    source_url: "https://huggingface.co/api/models/microsoft/phi-4/commits/main"
  - date: "2025-01-10"
    event: "microsoft/phi-4 appears on OpenRouter (row `created` 1736489872)"
    source_url: "https://openrouter.ai/api/v1/models/microsoft/phi-4/endpoints"
  - date: "2026-06-02"
    event: "Microsoft AI announces seven in-house MAI models and names OpenRouter as a distribution channel for them"
    source_url: "https://microsoft.ai/news/building-a-hillclimbing-machine-launching-seven-new-mai-models/"
  - date: "2026-07-14"
    event: "Latest commit to the phi-4 repository, restoring a stop token in generation_config"
    source_url: "https://huggingface.co/api/models/microsoft/phi-4/commits/main"
mentions:
  - model/microsoft-phi-4
  - model/microsoft-wizardlm-2-8x22b
  - org/openai
---

Microsoft's own model index lists {{fact:org/microsoft#mai_line_today}}. This
catalog's `microsoft/` namespace lists two rows, and neither is one of them.
That is not a lag in the feed. On 2 June 2026 Mustafa Suleyman wrote
{{fact:org/microsoft#mai_family_announced}}, and named the shelf this catalog
reads from: {{fact:org/microsoft#mai_router_distribution}}. Three months and
four days later, {{fact:org/microsoft#mai_rows_on_this_router}}. The line
itself has not stood still in the interval —
{{fact:org/microsoft#mai_versions_moved}} — so what has not arrived is the
distribution, not the models.

Microsoft is on this router, though, at scale, under a different name.
{{fact:org/microsoft#azure_is_a_router_provider}}. Sweep the endpoints and the
shape is unambiguous: {{fact:org/microsoft#azure_serves_openai_only}}. Its own
two rows are served by strangers —
{{fact:org/microsoft#phi_4_served_by}} and
{{fact:org/microsoft#wizardlm_served_by}}. In the `microsoft/` namespace
Microsoft is the vendor of record and nothing else; the compute belongs to
DeepInfra and Novita, and the compute Microsoft does sell here runs somebody
else's weights.

The older of the two rows is odder than being old. Follow its declared
`hugging_face_id` and you get {{fact:org/microsoft#wizardlm_repo_unreachable}}.
Ask Hugging Face for every Microsoft repository whose name matches "wizard" and
you get {{fact:org/microsoft#no_microsoft_wizard_repos}}. This is not a common
kind of rot, either. Check the same pointer on every row that declares one and
this is {{fact:org/microsoft#only_dead_upstream_in_the_catalog}}. The weights a
buyer is actually renting exist in public as
{{fact:org/microsoft#wizardlm_surviving_weights}} — a copy, on a stranger's
account, under a licence Microsoft chose but on a repository Microsoft does not
control. It even carries its own receipt:
{{fact:org/microsoft#wizardlm_mirror_provenance}}.

That timestamp is the interesting artefact, because it is the takedown's
negative. 404 Media reported at the time that
{{fact:org/microsoft#wizardlm_withdrawal_reported}}, and that
{{fact:org/microsoft#wizardlm_spread_reported}}. The mirror's metadata file
pins that "short hours" phrase to a minute and signs it: a shard-by-shard
checksum of what Microsoft published before it decided it should not have.
Twenty-eight months on, the announcement page carries no notice of any of it:
{{fact:org/microsoft#wizardlm_announcement_still_standing}} — offering, in the
present tense, a licence for two repositories that no longer answer. OpenRouter's
catalog copy still tells buyers
{{fact:org/microsoft#wizardlm_router_description}}, which was arguable in April
2024 and is now a sentence about a model its author has withdrawn.

Eight months after that, the next Microsoft weights to reach this catalog
arrived with the omission answered in the open. The phi-4 card does not claim
safety work in the abstract; it names the team and the scenarios:
{{fact:org/microsoft#phi_4_red_teaming}}. Read the two rows in order and the
second one's model card is visibly the first one's post-mortem — which is the
only part of this pair a buyer can check, since the process failure itself was
reported by a trade publication and never described by Microsoft. The rest of
that card is unusually forthcoming about cost, too:
{{fact:org/microsoft#phi_4_training_run}}, released
{{fact:org/microsoft#phi_4_license}} at
{{fact:org/microsoft#phi_4_weights}}.

Two small things are worth having before you spend on either row. phi-4 is not
abandonware despite the date on it: {{fact:org/microsoft#phi_4_still_tended}} —
a maintained artefact, not a parked one. And its age depends entirely on which
record you believe, because it has three birthdays:
{{fact:org/microsoft#phi_4_three_birthdays}}. A month separates the day the
weights went up from the day this catalog began counting, and the board's
"newest model" column reads the last of the three.
