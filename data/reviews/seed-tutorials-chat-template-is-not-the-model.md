---
job: seed-tutorials-chat-template-is-not-the-model
verdict: approve
reasons: []
would-cite: >-
  Someone who cannot explain why their local Llama 3.1 insists the date is July
  2024: the official chat template hardcodes `date_string = "26 Jul 2024"` as
  the default it uses when the caller passes none, and the ungated mirror that
  omits the block ships the same weights header-for-header.
reviewer: rr5b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. I re-executed
sections 1 and 2 against huggingface.co on 2026-08-29 with my own scripts and
reproduced the published transcripts exactly; every string below is a literal
match against fetched bytes.

- `tokenizer_config.json`: NousResearch/Meta-Llama-3.1-8B-Instruct
  `chat_template` = 348 chars, sha256 prefix b48c47f644389271. unsloth/... =
  4614 chars, e10ca381b1ccc5cf. meta-llama/Llama-3.1-8B-Instruct = HTTP 401
  with the exact `x-error-message` the page quotes. The feature table
  reproduced row for row: Cutting Knowledge Date / custom_tools / ipython /
  date_string / tools_in_user_message all false on NousResearch, all true on
  unsloth. The 348-char template quoted "in full" matches the fetched bytes
  character for character.
- **The GGUF claim, which round 1 could not check, I checked.** I wrote my own
  range-request GGUF metadata reader rather than reuse the site's: the bartowski
  Q4_K_M file is GGUF version 3, 292 tensors, and its
  `tokenizer.chat_template` is 4614 chars, sha256 e10ca381b1ccc5cf, testing
  `=== unsloth` **true** and `=== NousResearch` **false** by byte equality. The
  "two unrelated packagers converge, and that is the best evidence of upstream"
  argument stands on a measurement, not on the transcript.
- Section 2 re-run end to end: all four shard sizes (4,976,698,672 /
  4,999,802,720 / 4,915,916,176 / 1,168,138,808 B), all four header sizes
  (9512 / 12120 / 11656 / 560) and all four header sha256 prefixes identical
  across both mirrors, matching every figure printed. My run made **exactly 16
  range requests and read exactly 67,760 bytes** — the corrected sentence is
  right by measurement, not by arithmetic on the page.
- **Mechanisms confirmed in template source, not inferred from behaviour.** The
  official template literally contains `{%- if not date_string is defined %}` /
  `{%- set date_string = "26 Jul 2024" %}` and emits "Cutting Knowledge Date:
  December 2023\n" + "Today Date: " + date_string — so "a parameter with a
  stale default, not a bug" is exactly the right characterisation. The Mistral
  v0.3 template contains `{%- if loop.last and system_message is defined %}
  {{- "[INST] " + system_message + "\n\n" + message["content"] + "[/INST]" }}`,
  which relocates the system message to the head of the *last* user turn;
  hand-applying it to the page's four messages reproduces the printed string
  character for character. It never references `add_generation_prompt`, so the
  no-op claim follows. The Qwen3 template contains no `bos_token`, so "its
  template emits no BOS, so the default is harmless" is confirmed, while both
  Llamas and Mistral do emit it.
- The UTC-midnight disclosure is not just honest but checkable: this machine is
  UTC-6, so a local 2026-08-28 evening run does print `2026-08-29` from
  `toISOString()`. My own clock now reads local 2026-08-29.
- Not re-run, and standing on the transcript: the token integers
  (42/62/41/61/13/28/48/26/39 and the 35/8/4 floors) and the rendered strings in
  sections 3–4, because `@huggingface/transformers` is not installed in this
  tree and installing it would change the dependency set. Their arithmetic is
  internally consistent (41+1=42, 61−41=20, 28/41=68%, 48/61=79%, 35/4=8.75),
  and everything I *could* re-run reproduced to the byte, which is strong
  evidence the transcripts were executed rather than composed.

Round 1 (r7-fable) found: "Eight range requests, 33,856 bytes read" was false by
the page's own code — fixed to "Sixteen range requests, 67,760 bytes read", and
I did not accept that on reading, I measured it. And "a two-token sequence it
never saw in training", a claim about an unpublished training corpus — fixed to
"a two-token opening that neither the template nor `encode()` produces on its
own", which keeps the point and drops the unknowable. I also checked whether the
fix was carried through: `data/reviews/evidence/` no longer contains "33,856" or
"never saw in training" either, so the correction was applied completely rather
than only where the reviewer pointed.

The strongest piece in my slice, and it clears the bar on all three counts. Its
one blemish is presentational: the introduction says "42 and 62 tokens" while
the body says 41 and 61. Both are correct under their stated conditions — with
and without the doubled BOS — and the piece explains the difference, but the two
pairs sit far enough apart that a reader could take them for a contradiction.
Not remotely worth the body.
