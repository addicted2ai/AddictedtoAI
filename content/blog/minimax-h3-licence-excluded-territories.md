---
title: "MiniMax H3's licence excludes the EU, the UK, South Korea and the US"
date: "2026-08-31"
frontier: true
frontier_reason: "F5"
domains:
  - "video"
---

MiniMax H3 is a video generation model, open-weight and downloadable on Hugging Face since 3 August 2026. Its community licence, effective 2 August 2026, defines the model's "Applicable Territory" as worldwide excluding the European Union, the United Kingdom, the Republic of Korea and the United States of America. Hugging Face's own count stood at **5,362,365 downloads in the 30 days to 31 August 2026**.

## The clause, verbatim

The two definitions sit at the top of the MiniMax H3 Community License Agreement, fetched raw from the repository's LICENSE file on 31 August 2026:

> "Applicable Territory" means worldwide, excluding the Excluded Territories.

> "Excluded Territories" means the European Union, the United Kingdom, the Republic of Korea and the United States of America.

The same file dates itself: "MiniMax H3 release date/License date: August 2, 2026." The model card carries no publication date for the weights. The repository's commit history does: the first commit, "Init MiniMaxAI/MiniMax-H3", is dated 3 August 2026, one day after the licence. Hugging Face's tag for the repository reads `other`, with the licence named `minimax-h3-community-license-agreement`, the platform's marker for a licence that is not one of its standard texts.

## The clause meets a download you already made

The grant itself is territorial. Section II of the licence opens: "Solely within the Applicable Territory, we grant you a non-exclusive, non-transferable, royalty-free, limited license to use, reproduce, distribute, create derivative works (including Model Derivatives), and modify the Materials."

Section V.4 states the other side:

> You may not use, reproduce, modify, distribute, or display the MiniMax H3 Works or any of their Outputs or results outside the Applicable Territory. Any such use outside the Applicable Territory is not authorized by this Agreement.

That sentence is the one that lands on an existing download. The agreement takes effect on acceptance, which the preamble defines as clicking accept, or using, reproducing, modifying, distributing, running or displaying any part of the model. A reader in the EU, the UK, South Korea or the US who already pulled the weights and ran them is using the model outside the territory the grant covers, and the licence says that use is not authorized.

It does say what happens next. Section VIII.2: "If you breach any term or condition of this Agreement, we have the right to terminate this Agreement. Upon termination, you must immediately cease accessing, using, and distributing the MiniMax H3 Works; delete or destroy all copies within your possession or control; and notify each downstream recipient that your authorization has ended." Territorial use is a breach by two routes: Section V.4, quoted above, and Exhibit A, whose first prohibition is "Use outside the Applicable Territory" and which Section V.1 incorporates into the agreement by reference. The licence grants no audit right, and nothing in the record shows MiniMax invoking termination against anyone. What the document does say about the excluded territories is the offer in Section II, which follows.

## The route out, in the licence's own words

Section V.4 is also the door. Section II continues:

> We will continuously evaluate the applicable laws, regulations and compliance requirements for the Excluded Territories. In the meantime, should any person in such Excluded Territories be interested in deploying our models, you are welcome to contact us about obtaining a license, which will be granted based on robust controls and guardrails for purposes of complying with the laws, regulations and compliance requirements of the Excluded Territories.

The model card's licence section carries an "Application form (only for USA/EU/UK/South Korea)" linking [platform.minimax.io/h3-license](https://platform.minimax.io/h3-license). The licence Q&A in the same repository, `docs/QA-about-License.md`, says organizations in the restricted regions "can apply for a formal license", with MiniMax reviewing the deployment scenario and the compliance controls before it "may authorize usage". The Q&A also says the API stays globally available, so the hosted route through MiniMax's own infrastructure is not territorial.

Distribution is territorial as well. Section III allows redistribution only within the Applicable Territory and requires handing each recipient a copy of the agreement, so a team that already shipped H3 downstream has a second clause to think about, not just its own use.

One clause applies everywhere, excluded territories or not. Section IV.1 requires "a separate, prior written authorization from MiniMax by contacting api@minimax.io" for commercial products and services generating more than 20 million US dollars in yearly revenue. MiniMax's Q&A commits to announcing any future change to the scope rather than making a silent update, and gives no date for one.

## MiniMax's explanation, and the coincidence it does not explain

The licence itself states no reason for the line. The Q&A does, in MiniMax's words:

> The current territory scope is not about excluding specific countries or regions, but about recognizing that video generation models are facing a more complex and rapidly evolving regulatory environment compared with text or code models.

The Q&A then names what it means. The EU AI Act "has started enforcement, while practical requirements for models capable of generating video and likeness-related content are still evolving". There is regulatory uncertainty in the UK and South Korea. In the US, it cites "a rapidly changing landscape" plus copyright-related legal proceedings concerning generative video AI that MiniMax says it is involved in. It closes that section with "The current limitation means 'not yet', not 'not ever.'"

The licence is dated the same day the EU AI Act's GPAI enforcement powers became exercisable, 2 August 2026 (the Commission's first enforcement requests went out 27 days later). The excluded list also covers the United States and South Korea, which the Act does not reach, and MiniMax's own stated reason for the US is litigation, not the Act. MiniMax's Q&A invokes the Act as one evolving requirement among several and dates none of its reasoning. The two dates coincide. Nothing in the record connects them, and the coincidence is left as a coincidence.

## The census that found no trend

Two weeks to the day after the licence took effect, on 16 August 2026, Digital Applied published "We Read the Licences on 2026 Open-Weight Models", a census of 30 models across 17 organisations with every non-standard licence text read in full. Its split: 17 of 30 permissive, meaning unmodified Apache-2.0 or MIT or a verified equivalent. 11 of 30 under a restricted bespoke licence. 2 of 30 with no vendor-org repository found at all.

Geographic exclusion is not among the restriction shapes the census enumerates. The restricted bucket is thresholds, branding and gates: revenue or user levels, mandatory UI branding, non-commercial grants, approval gates. Its only geographic case is historical. Tencent's Hy3 shipped as a preview under a bespoke community licence that press accounts describe as excluding the EU, the UK and South Korea, and the final July 2026 release switched to unmodified Apache-2.0 with no geographic limitation. The census calls it "the only row in this dataset where a licence became more permissive between preview and final release". The tag reads apache-2.0 on a direct check of the repository on 31 August 2026.

H3 is not in the census's 30 rows, and the census reports nothing about its licence. The census read two other MiniMax models, M3 and Music3, and scored both restricted, with written authorization required above 20 million US dollars in yearly revenue. Its selection was a core list fixed before research began plus releases surfaced during it, and H3, public since 3 August, was not among them. A model absent from a defined sample is not a finding about the model. The finding is what the 30 rows show: territorial exclusion is not a current pattern, and the one case on record was withdrawn. H3's licence is the live exception the census did not see.

## Sources

All retrieved on 31 August 2026. The licence quotations are copied from the raw file, and the download figures are Hugging Face's own API counts (5,362,365 in the last 30 days, 5,373,837 all-time).

- MiniMax H3 Community License Agreement, raw file — [huggingface.co/MiniMaxAI/MiniMax-H3/raw/main/LICENSE](https://huggingface.co/MiniMaxAI/MiniMax-H3/raw/main/LICENSE)
- Model card — [huggingface.co/MiniMaxAI/MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- Repository commit history — [huggingface.co/api/models/MiniMaxAI/MiniMax-H3/commits/main](https://huggingface.co/api/models/MiniMaxAI/MiniMax-H3/commits/main)
- Hugging Face model API record for MiniMax-H3 — [huggingface.co/api/models/MiniMaxAI/MiniMax-H3](https://huggingface.co/api/models/MiniMaxAI/MiniMax-H3)
- Licence Q&A, `docs/QA-about-License.md` — [huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/docs/QA-about-License.md](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/docs/QA-about-License.md)
- Application form — [platform.minimax.io/h3-license](https://platform.minimax.io/h3-license)
- Digital Applied, "We Read the Licences on 2026 Open-Weight Models", published 16 August 2026, data as of mid-August 2026 — [digitalapplied.com](https://www.digitalapplied.com/blog/open-weight-model-licence-audit-2026)
- Hugging Face model API record for tencent/Hy3 — [huggingface.co/api/models/tencent/Hy3](https://huggingface.co/api/models/tencent/Hy3)
- This site's post of 31 August 2026 on the first AI Act enforcement requests, which records the Commission-sourced date of 2 August 2026 for the GPAI enforcement powers — [eu-ai-office-first-enforcement-rfis](/blog/eu-ai-office-first-enforcement-rfis)
