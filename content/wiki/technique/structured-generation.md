---
id: technique/structured-generation
kind: technique
display_name: "Structured generation"
status: active
maintenance: stable
aliases:
  - name: "Structured generation"
    class: shared
  - name: "Constrained decoding"
    class: shared
  - name: "Guided generation"
    class: shared
  - name: "Structured Outputs"
    class: shared
  - name: "JSON mode"
    class: shared
themes:
  - argument
facts:
  - field: indexed_masking_cost
    source: cited
    value: "an index over the vocabulary, built from the finite-state machine of the regex or grammar, costs O(1) on average per token, against a fixed O(N) cost per generated token for a vocabulary of size N — 50,257 in the paper's comparison"
    source_url: "https://arxiv.org/abs/2307.09702"
    accessed: "2026-08-28"
    volatility: static
  - field: schema_guarantee
    source: cited
    value: "ensures the model will always generate responses that adhere to your supplied JSON Schema, so you don't need to worry about the model omitting a required key, or hallucinating an invalid enum value"
    source_url: "https://developers.openai.com/api/docs/guides/structured-outputs"
    accessed: "2026-08-28"
    volatility: slow
  - field: first_request_latency
    source: cited
    value: "the first request made with any schema has additional latency while the API processes the schema, and subsequent requests with the same schema do not"
    source_url: "https://developers.openai.com/api/docs/guides/structured-outputs"
    accessed: "2026-08-28"
    volatility: slow
  - field: guarantee_limits
    source: cited
    value: "structured outputs can still contain mistakes, input unrelated to the schema can still produce hallucinations, and a safety refusal comes back in a separate refusal field rather than being forced into the schema"
    source_url: "https://developers.openai.com/api/docs/guides/structured-outputs"
    accessed: "2026-08-28"
    volatility: slow
  - field: format_restriction_study
    source: cited
    value: "GSM8K accuracy from natural language to JSON with a schema: GPT-3.5-Turbo 75.99% to 49.25%, Claude-3-Haiku 86.51% to 23.44%, LLaMA-3-8B 75.13% to 48.90% — and Gemini-1.5-Flash 89.33% to 89.21%"
    source_url: "https://arxiv.org/abs/2408.02442"
    accessed: "2026-08-28"
    volatility: dated
  - field: same_study_counterexample
    source: cited
    value: "in the same paper's structured-output API results, GPT-4o-mini goes 94.57% to 91.71% on GSM8K and 83.11% to 86.07% on Last Letter Concatenation"
    source_url: "https://arxiv.org/abs/2408.02442"
    accessed: "2026-08-28"
    volatility: dated
  - field: reanalysis
    source: cited
    value: "a reanalysis on Llama-3-8B-Instruct reports structured generation at or above unstructured — GSM8K 0.78 against 0.77, Last Letter 0.77 against 0.73, Shuffle Object 0.44 against 0.41 — and attributes the original gap to a different prompt per condition and to conflating JSON mode with constrained decoding"
    source_url: "https://blog.dottxt.ai/say-what-you-mean.html"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2023-07-19"
    event: "Outlines reformulates guided generation as transitions between states of a finite-state machine, with an index over the vocabulary"
    source_url: "https://arxiv.org/abs/2307.09702"
  - date: "2024-08-05"
    event: "a study reports large reasoning drops under format restriction"
    source_url: "https://arxiv.org/abs/2408.02442"
mentions:
  - technique/chain-of-thought-prompting
  - org/openai
---

At every decoding step, some tokens cannot begin a valid continuation of the
output format. Structured generation masks those tokens out of the distribution
before sampling, so an invalid string is not merely unlikely — it is unreachable.
Nothing about the model changes; the constraint lives entirely in the sampler.

**Why it is nearly free, and where the cost went.** The obvious implementation
tests every token in the vocabulary against the partial output at every step.
Willard and Louf (2023-07-19) reformulated the problem as transitions between the
states of a finite-state machine compiled from the regex or grammar, and built an
index mapping each state to the tokens that may follow it:
{{fact:technique/structured-generation#indexed_masking_cost}}. The cost did not
disappear — it moved to compile time, once per schema.

That relocation is visible from outside, in a commercial API's documentation. On
OpenAI's structured outputs,
{{fact:technique/structured-generation#first_request_latency}}. What that sentence
describes is an index being built and cached.

**What the guarantee covers.** The vendor claim is unusually absolute —
{{fact:technique/structured-generation#schema_guarantee}} — and it is a claim about
shape alone, which the same page is explicit about:
{{fact:technique/structured-generation#guarantee_limits}}. A validator that cannot
fail is not a fact-checker; it removes an entire class of parsing bug and no class
of wrong answer.

**The open dispute about the cost to reasoning.** Tam and colleagues (2024-08-05)
reported that format restriction damages reasoning, and the drops are not subtle:
{{fact:technique/structured-generation#format_restriction_study}}. Two things
complicate the headline. The first is inside the same paper —
{{fact:technique/structured-generation#same_study_counterexample}} — so the effect
is not uniform across models or across how the format is imposed. The second is a
direct reproduction attempt: {{fact:technique/structured-generation#reanalysis}}.

The distinction the argument turns on is worth keeping even if you take no side.
*JSON mode* is a request for JSON-shaped output that the model must satisfy by
itself; *constrained decoding* is a mask that makes any other output impossible.
The first competes with the model's reasoning for the same generated text; the
second does not, unless the schema itself leaves no field to reason in. A schema
whose only property is the answer forbids working out loud, and that is a change
to the prompt, not an artifact of masking.
