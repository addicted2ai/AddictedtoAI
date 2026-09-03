---
title: "GLM-5.3's licence: above $10B in revenue, Model-as-a-Service use waits on Z.AI's security review"
date: "2026-09-02"
anchor:
  url: "https://huggingface.co/zai-org/GLM-5.3"
  date: "2026-08-27"
mentions:
  - org/z-ai
  - model/z-ai-glm-5-3
  - model/z-ai-glm-5-3-flash
---

Z.ai published the open weights of GLM-5.3 on Hugging Face on 27 August 2026, and the licence that ships with them is the part of the release worth reading twice. The GLM-5.3 License reads like MIT until clause 2, which makes commercial use by any licensee running Model-as-a-Service conditional on passing Z.AI's security review once the licensee's aggregate revenue with its affiliates passes **$10B** in any consecutive 12 months. The review's scope and method are Z.AI's to set. Everyone below that line gets the permissive grant unchanged.

## Clause 2, verbatim

The definition and the condition, fetched from the repository's LICENSE file on 2 September 2026:

> "Model as a Service" means giving a third party access to language model inference or fine-tuning (e.g., via API) in a manner that allows such third party to exercise meaningful control over the inputs, parameters, or training data. This does not include (a) end-user products with model capabilities solely embedded within specific features or harnesses, or (b) mere relaying of requests to models hosted by others.
>
> If the Licensee or any of its affiliates operates a Model as a Service business, and the aggregate revenue of the Licensee and its affiliates exceeds 10 billion US dollars (or the equivalent in other currencies) in total over any consecutive 12 months, the Licensee must pass Z.AI's security review before using the Software or its derivative works for any commercial purpose. The scope and method of the security review shall be reasonably determined by Z.AI.

The rest of the file is clause 1 (the MIT-style grant, the notice condition, and a requirement that use comply with applicable laws), clause 3 (a standard as-is warranty), and a contact address, glmlicense@z.ai. Hugging Face tags the licence `glm-5.3`, the platform's `other` marker for a text that is not one of its standards.

## The condition attaches to all commercial use, not just MaaS

Three parts of clause 2 do the work. The revenue line is aggregate, over the licensee and its affiliates together, and over any consecutive 12 months, so a fiscal year is the wrong window to check against. The trigger is operating a MaaS business, and the definition excludes two shapes: end-user products whose model capabilities are embedded in specific features, and plain relays of requests to models hosted by others. A company over the line that never serves inference to third parties is untouched by the clause.

Once the trigger fires, though, the review precondition attaches to any commercial purpose, not only MaaS. The sentence reads "before using the Software or its derivative works for any commercial purpose": fine-tunes, internal deployments, product features are all inside the condition, and the grant is made subject to the conditions. Until the review is passed, commercial use by a triggered licensee is outside the licence as written.

The review itself is two sentences of the file and nothing more. The licence names no criteria, no timeline, no fee, no appeal, and no mechanism by which Z.AI learns a licensee crossed the line: no audit right, no attestation, no reporting. Z.AI has published nothing about how the review operates beyond those two sentences.

## The card's numbers, row by row

The model card's release note does not mention the licence, and the licence does not mention the card. The card states its own context for the model's capability:

> As we scaled post-training, cyber capability developed faster than we expected. GLM-5.3 is state of the art on CyberGym for vulnerability discovery, and its gains are largest further up the exploitation chain, where it more than doubles GLM-5.2 on exploitation benchmarks.

The benchmark table next to that sentence, read with its footnotes, gives the numbers. CyberGym is one row with unlimited timeout, single-run Pass@1 over 1,507 tasks: GLM-5.3 at 84.5 tops the row, and the nearest scores are Fable 5 (w/ fallback) at 83.8 and GPT-5.6 Sol at 83.6, with GLM-5.2 at 77.2. ExploitGym is the 2h / 6h pair, single-run Pass@1 on 869 tasks under each budget: GLM-5.3 scores 105/130 against GLM-5.2's 29/39, more than triple on both budgets, and still third on its own row behind Fable 5 (w/ fallback) at 181/247 and GPT-5.6 Sol at 216/293.

## The same week, two licences

GLM-5.3-Flash, released the same week with a first commit dated 25 August 2026, carries an unmodified MIT licence (fetched from its LICENSE file on 2 September 2026). GLM-5.3's own first commit, "Initial commit 0828", is dated 27 August 2026 17:16 UTC. One release gets the standard permissive text, the flagship gets the review gate. The Apache-2.0 norm both sit beside has no revenue threshold and no approval step either: its conditions are the notice, the patent grant, and the redistribution terms. Revenue thresholds and approval gates are a known shape in this market's bespoke licences, as this site's reading of the MiniMax H3 licence noted from the Digital Applied census. The $10B line is the new part.

## Who it lands on

If you run hosted inference on GLM-5.3 and your group's revenue over any trailing 12 months is $10B or more, clause 2 makes your commercial use conditional on a review whose operation Z.AI has not published. What to do about it: the licence's own answer is its contact address, glmlicense@z.ai. Below the line, nothing changes, and the same is true of embedded-product use and relays, which the definition excludes.

## Sources

All retrieved on 2 September 2026.

- GLM-5.3 License, raw file: [huggingface.co/zai-org/GLM-5.3/raw/main/LICENSE](https://huggingface.co/zai-org/GLM-5.3/raw/main/LICENSE)
- Model card: [huggingface.co/zai-org/GLM-5.3](https://huggingface.co/zai-org/GLM-5.3) (the anchor above, dated to the repository's first commit, "Initial commit 0828", 27 August 2026 17:16 UTC)
- Repository commit history: [huggingface.co/api/models/zai-org/GLM-5.3/commits/main](https://huggingface.co/api/models/zai-org/GLM-5.3/commits/main)
- Hugging Face model API record: [huggingface.co/api/models/zai-org/GLM-5.3](https://huggingface.co/api/models/zai-org/GLM-5.3)
- GLM-5.3-Flash LICENSE (MIT), raw file: [huggingface.co/zai-org/GLM-5.3-Flash/raw/main/LICENSE](https://huggingface.co/zai-org/GLM-5.3-Flash/raw/main/LICENSE)
- GLM-5.3-Flash commit history: [huggingface.co/api/models/zai-org/GLM-5.3-Flash/commits/main](https://huggingface.co/api/models/zai-org/GLM-5.3-Flash/commits/main)
- Apache-2.0 text: [apache.org/licenses/LICENSE-2.0.txt](https://www.apache.org/licenses/LICENSE-2.0.txt)
- Z.ai's GLM-5.3 announcement, dated 14 August 2026: [z.ai/blog/glm-5.3](https://z.ai/blog/glm-5.3)
- Z.ai's GLM-5 repository README: [github.com/zai-org/GLM-5](https://github.com/zai-org/GLM-5)
- This site's MiniMax H3 licence post, which covers the census's restricted-licence shapes: [minimax-h3-licence-excluded-territories](/blog/minimax-h3-licence-excluded-territories)