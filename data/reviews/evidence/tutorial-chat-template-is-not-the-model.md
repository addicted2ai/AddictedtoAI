# Evidence — tutorial `chat-template-is-not-the-model`

Real-run transcripts backing every output shown in
`content/tutorials/chat-template-is-not-the-model.md`.

- **Date of run:** 2026-08-28 (the session crossed UTC midnight; see note below)
- **Where:** a scratch directory outside this repository
  (`…/scratchpad/fl-tut/tmpl/`), with `@huggingface/transformers` `4.2.0`
  installed at `…/scratchpad/fl-tut/`. Nothing was added to the site's
  `package.json`. `templates.mjs` imports the GGUF range reader from
  `../gguf/lib.mjs`, the sibling scratch directory used by the
  `model-file-header-range-requests` tutorial.
- **Machine:** Windows 10, Node `v24.13.0`.
- **Credentials:** none.

**UTC note.** The `traps.mjs` transcript prints
`today, really: 2026-08-29` because `new Date().toISOString()` reports UTC and
the run happened after UTC midnight while the local date was still 2026-08-28.
The transcript is unedited. Nothing on the page depends on which of the two
dates is used: the template injects `26 Jul 2024` either way.

## 1. `templates.mjs`

```
$ node templates.mjs
200  NousResearch/Meta-Llama-3.1-8B-Instruct
     chat_template: 348 chars  sha256:b48c47f644389271
200  unsloth/Meta-Llama-3.1-8B-Instruct
     chat_template: 4614 chars  sha256:e10ca381b1ccc5cf
401  meta-llama/Llama-3.1-8B-Instruct
     Access to model meta-llama/Llama-3.1-8B-Instruct is restricted. You must have access to it and be authenticated to access it. Please log in.
GGUF bartowski/...-Q4_K_M.gguf
     chat_template: 4614 chars  sha256:e10ca381b1ccc5cf

-- do any two of these agree?
   NousResearch/Meta-Llama-3.1-8B-Instruct  vs  unsloth/Meta-Llama-3.1-8B-Instruct: different
   NousResearch/Meta-Llama-3.1-8B-Instruct  vs  bartowski GGUF: different
   unsloth/Meta-Llama-3.1-8B-Instruct  vs  bartowski GGUF: IDENTICAL

-- features present in each template
   NousResearch/Meta-Llama-3.1-8B-Instruct  Cutting Knowledge Date=false  custom_tools=false  ipython=false  date_string=false  tools_in_user_message=false
   unsloth/Meta-Llama-3.1-8B-Instruct       Cutting Knowledge Date=true  custom_tools=true  ipython=true  date_string=true  tools_in_user_message=true
   bartowski GGUF                           Cutting Knowledge Date=true  custom_tools=true  ipython=true  date_string=true  tools_in_user_message=true

-- the short one, in full
{% set loop_messages = messages %}{% for message in loop_messages %}{% set content = '<|start_header_id|>' + message['role'] + '<|end_header_id|>

'+ message['content'] | trim + '<|eot_id|>' %}{% if loop.index0 == 0 %}{% set content = bos_token + content %}{% endif %}{{ content }}{% endfor %}{{ '<|start_header_id|>assistant<|end_header_id|>

' }}
```

The GGUF template is read out of `tokenizer.chat_template` in the file's
metadata over HTTP range requests — 7,864,320 bytes read from a 4.9 GB file, no
download. The two `sha256:e10ca381b1ccc5cf` values are the same 4,614-character
string arriving by two unrelated routes (unsloth's `tokenizer_config.json` and
bartowski's quantized GGUF).

**What this does and does not establish.** `meta-llama`'s own repository
returns 401, so upstream's template was never read. The tutorial says the
official template is "inferred from two independent repackagers agreeing", not
that it was verified against Meta's repository.

## 2. `weights.mjs`

```
$ node weights.mjs
NousResearch/Meta-Llama-3.1-8B-Instruct
   model-00001-of-00004.safetensors  file   4,976,698,672 B  header   9512 B  sha256:b858d3d845fa68f9
   model-00002-of-00004.safetensors  file   4,999,802,720 B  header  12120 B  sha256:f7e07271e0434668
   model-00003-of-00004.safetensors  file   4,915,916,176 B  header  11656 B  sha256:66a34736c569ccab
   model-00004-of-00004.safetensors  file   1,168,138,808 B  header    560 B  sha256:bed1eb708f106718
unsloth/Meta-Llama-3.1-8B-Instruct
   model-00001-of-00004.safetensors  file   4,976,698,672 B  header   9512 B  sha256:b858d3d845fa68f9
   model-00002-of-00004.safetensors  file   4,999,802,720 B  header  12120 B  sha256:f7e07271e0434668
   model-00003-of-00004.safetensors  file   4,915,916,176 B  header  11656 B  sha256:66a34736c569ccab
   model-00004-of-00004.safetensors  file   1,168,138,808 B  header    560 B  sha256:bed1eb708f106718

shard-by-shard, do the two mirrors match?
   model-00001-of-00004.safetensors  size same   header same
   model-00002-of-00004.safetensors  size same   header same
   model-00003-of-00004.safetensors  size same   header same
   model-00004-of-00004.safetensors  size same   header same
```

Sixteen range requests, 67,760 bytes read: an 8-byte length probe plus the
header itself, per shard, per mirror — 8 x 8 probe bytes plus
2 x (9,512 + 12,120 + 11,656 + 560) header bytes. This hashes the tensor index,
not the weights. The tutorial states
that limit explicitly: it is proof the two repositories describe the same model
laid out identically, not that all 16 GB of weight bytes are equal.

## 3. `render.mjs`

```
$ node render.mjs

########## NousResearch/Meta-Llama-3.1-8B-Instruct
"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\nYou are terse.<|eot_id|><|start_header_id|>user<|end_header_id|>\n\nName one river.<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\nThe Loire.<|eot_id|><|start_header_id|>user<|end_header_id|>\n\nAnd one more?<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"
   encode(rendered)                       42 tokens   first 4 ids 128000,128000,128006,9125
   encode(rendered, no special tokens)    41 tokens   first 4 ids 128000,128006,9125,128007
   first three decoded: ["<|begin_of_text|>","<|begin_of_text|>","<|start_header_id|>"]
   message text alone                     13 tokens
   scaffolding                            28 tokens (68% of the prompt)
   encode() adds a token the template already emitted: YES

########## unsloth/Meta-Llama-3.1-8B-Instruct
"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\nCutting Knowledge Date: December 2023\nToday Date: 26 Jul 2024\n\nYou are terse.<|eot_id|><|start_header_id|>user<|end_header_id|>\n\nName one river.<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\nThe Loire.<|eot_id|><|start_header_id|>user<|end_header_id|>\n\nAnd one more?<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"
   encode(rendered)                       62 tokens   first 4 ids 128000,128000,128006,9125
   encode(rendered, no special tokens)    61 tokens   first 4 ids 128000,128006,9125,128007
   first three decoded: ["<|begin_of_text|>","<|begin_of_text|>","<|start_header_id|>"]
   message text alone                     13 tokens
   scaffolding                            48 tokens (79% of the prompt)
   encode() adds a token the template already emitted: YES

########## Qwen/Qwen3-8B
"<|im_start|>system\nYou are terse.<|im_end|>\n<|im_start|>user\nName one river.<|im_end|>\n<|im_start|>assistant\nThe Loire.<|im_end|>\n<|im_start|>user\nAnd one more?<|im_end|>\n<|im_start|>assistant\n"
   encode(rendered)                       39 tokens   first 4 ids 151644,8948,198,2610
   encode(rendered, no special tokens)    39 tokens   first 4 ids 151644,8948,198,2610
   first three decoded: ["<|im_start|>","system","\n"]
   message text alone                     13 tokens
   scaffolding                            26 tokens (67% of the prompt)
   encode() adds a token the template already emitted: no

########## mistralai/Mistral-7B-Instruct-v0.3
"<s>[INST] Name one river.[/INST] The Loire.</s>[INST] You are terse.\n\nAnd one more?[/INST]"
   encode(rendered)                       26 tokens   first 4 ids 1,1,3,7388
   encode(rendered, no special tokens)    25 tokens   first 4 ids 1,3,7388,1392
   first three decoded: ["<s>","<s>","[INST]"]
   message text alone                     17 tokens
   scaffolding                             8 tokens (32% of the prompt)
   encode() adds a token the template already emitted: YES
```

The doubled BOS is visible three ways in the same transcript: the id pair
(`128000,128000` / `1,1`), the decoded first three tokens, and the one-token
gap between `encode(rendered)` and `encode(rendered, {add_special_tokens:
false})`. Qwen shows the opposite on all three.

## 4. `traps.mjs`

```
$ node traps.mjs
=== 1. the date the model is told, with no date passed
"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\nCutting Knowledge Date: December 2023\nToday Date: 26 Jul 2024\n\n<|eot_id|><|start_header_id|>user<|end_header_id|>\n\nHi.<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"
   today, really: 2026-08-29
   with date_string passed explicitly:
   "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\nCutting Knowledge Date: December 2023\nToday Date: 28 Aug 2026\n\n<|eot_id|><|start_header_id|>user<|end_header_id|>\n\nHi.<|e ...

=== 2. what Mistral does with a system message
   in:  ["system:SYSTEM-MARKER","user:FIRST-USER","assistant:ASSISTANT","user:LAST-USER"]
   out: "<s>[INST] FIRST-USER[/INST] ASSISTANT</s>[INST] SYSTEM-MARKER\n\nLAST-USER[/INST]"

=== 3. the floor: what an empty user turn costs before you write anything
   llama-3.1 (official tmpl)   35 tokens
   qwen3                        8 tokens
   mistral-v0.3                 4 tokens

=== 4. add_generation_prompt, on and off
   llama-3.1      adds "<|start_header_id|>assistant<|end_header_id|>\n\n"
   qwen3          adds "<|im_start|>assistant\n"
   mistral-v0.3   adds ""
```

The date result is a two-arm comparison: the same messages rendered with no
`date_string` (`26 Jul 2024`) and with one (`28 Aug 2026`). That is what
licenses calling it "a parameter with a stale default" rather than a hardcoded
constant.

The Mistral relocation uses unique marker strings so the move is unambiguous in
the output rather than inferred from position.

## A draft claim that running the code corrected

The first probe of this subject was written expecting Llama 3.1's template to
call `strftime_now` and inject the *real* current date, and the plan was to
report that a chat template makes a prompt non-reproducible day to day. Two
things falsified that in one run: the template searched contains no
`strftime_now` at all (the five-marker table above does not test for it —
searching each fetched template for the string directly returns `false` on
both), and the repository first reached for,
`NousResearch/…`, has no date block whatsoever — it ships a 348-character
template with no knowledge-cutoff line, no tool support and no `date_string`.
The real finding — two mirrors of one model shipping different prompt formats,
and the official one defaulting to a two-year-old date — is the opposite of the
drafted one and was only reachable by fetching the templates.

## What was not executed

- **No model was run.** Nothing here measures what a model does with a doubled
  BOS, a relocated system message, or a wrong date — only what tokens it would
  receive.
- Only `@huggingface/transformers`' Jinja implementation rendered these
  templates. Python `transformers`, `llama.cpp` and inference servers ship
  their own renderers; agreement between them was not tested.
- Only three model families were examined (Llama 3.1 8B Instruct, Qwen3 8B,
  Mistral 7B Instruct v0.3), and upstream `meta-llama` is gated and was never
  read.
- The per-request "floor" arithmetic in the tutorial (35 million tokens against
  4 million over a million calls) is multiplication of the measured floor, not
  a measurement of any real workload.
