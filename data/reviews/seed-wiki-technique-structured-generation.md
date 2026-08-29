---
job: seed-wiki-technique-structured-generation
verdict: approve
reasons: []
would-cite: >-
  The person citing "Let Me Speak Freely" as proof that JSON breaks reasoning
  gets the full picture in one place: Tam's own Table 2 counterexample where
  the structured-output API beats natural language on Last Letter, dottxt's
  same-prompt reanalysis, and the JSON-mode-versus-constrained-decoding
  distinction the whole dispute turns on.
reviewer: r5-fable
date: 2026-08-28
---

Checklist: wiki technique entry. Sources fetched 2026-08-28.

- arxiv.org/abs/2307.09702 (v1: 19 Jul 2023, matching the timeline; fetched
  full text via ar5iv): FSM reformulation and vocabulary index are in the
  abstract; the complexity claim is in Section 1 — "a fixed O(N) cost for
  each token generated, where N is the size of the LLM's vocabulary" versus
  "an algorithm that costs O(1) on average" — and N=50,257 appears in
  Section 3.2's comparison ("must iterate over the LLM's vocabulary
  (N=50,257) on each step"). The indexed_masking_cost fact is exact,
  including its "in the paper's comparison" framing of the 50,257.
- developers.openai.com/api/docs/guides/structured-outputs: all three facts
  verbatim — "ensures the model will always generate responses that adhere
  to your supplied JSON Schema, so you don't need to worry about the model
  omitting a required key, or hallucinating an invalid enum value"; "The
  first request you make with any schema will have additional latency as our
  API processes the schema, but subsequent requests with the same schema
  will not"; "Structured Outputs can still contain mistakes", unrelated input
  "can result in hallucinations", and safety refusals arrive in a separate
  refusal field.
- arxiv.org/abs/2408.02442 (v1: 5 Aug 2024; fetched latest HTML): Table 1
  schema-constraint rows match all eight numbers — GPT-3.5-Turbo 75.99 to
  49.25, Claude-3-Haiku 86.51 to 23.44, LLaMA-3-8B 75.13 to 48.90,
  Gemini-1.5-Flash 89.33 to 89.21. The counterexample is Table 2
  (gpt-4o-mini-2024-07-18): NL 94.57 vs JSON-Schema 91.71 on GSM8K, NL 83.11
  vs JSON-Schema 86.07 on Last Letter — and JSON-Schema is the paper's label
  for the structured-output API condition, so the fact's "structured-output
  API results" framing is the paper's own distinction, correctly drawn.
- blog.dottxt.ai/say-what-you-mean.html: Llama-3-8B-Instruct confirmed;
  structured/unstructured pairs exact — GSM8K 0.78 vs 0.77, Last Letter 0.77
  vs 0.73, Shuffle Object 0.44 vs 0.41; and both attributed criticisms are
  the post's actual arguments — different prompts per condition, and
  "Structured generation is not the same thing as JSON-mode".

The entry does the hardest thing in this slice: it presents a live dispute
without flattening it, and every number on both sides re-fetched exact. The
closing distinction — a schema with no field to reason in changes the prompt,
not the masking — is the piece's own synthesis and it is the correct
resolution of the two results it just quoted. Approve.
