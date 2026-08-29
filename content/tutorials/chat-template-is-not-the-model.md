---
title: "Two mirrors of Llama 3.1 ship identical weights and different prompts, and one tells the model it is July 2024"
subjects:
  - tool/hugging-face-hub
  - tool/transformers-js
  - tool/llama-cpp
verified_against:
  tool/hugging-face-hub: "tokenizer_config.json for NousResearch/, unsloth/ and meta-llama/ Llama-3.1-8B-Instruct as served 2026-08-28"
  tool/transformers-js: "4.2.0"
  tool/llama-cpp: "GGUF version 3; tokenizer.chat_template in bartowski/Meta-Llama-3.1-8B-Instruct-GGUF"
verified_on: "2026-08-28"
reverify_days: 60
mentions:
  - tool/hugging-face-hub
  - tool/transformers-js
  - tool/llama-cpp
---

The weights decide what a model can do. A Jinja template in
`tokenizer_config.json` decides what it is actually shown. The two travel
separately, and the second one is edited by whoever repackaged the repository
you downloaded from.

Two popular ungated mirrors of `Llama 3.1 8B Instruct` ship byte-identical
weight headers and chat templates of 348 and 4,614 characters. Sending the same
four-message conversation through them produces prompts of `42` and `62` tokens,
and only one of the two tells the model what today's date is — incorrectly.

Everything below runs unauthenticated, with one npm package, and never loads a
model.

## 1. Find out which template you actually have

```js
// templates.mjs
import { createHash } from 'node:crypto';
import { readGguf } from '../gguf/lib.mjs';

const sha = (s) => createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 16);

const REPOS = [
  'NousResearch/Meta-Llama-3.1-8B-Instruct',
  'unsloth/Meta-Llama-3.1-8B-Instruct',
  'meta-llama/Llama-3.1-8B-Instruct',
];
const found = [];
for (const r of REPOS) {
  const res = await fetch(`https://huggingface.co/${r}/resolve/main/tokenizer_config.json`);
  if (!res.ok) {
    console.log(`${res.status}  ${r}\n     ${res.headers.get('x-error-message')}`);
    continue;
  }
  const t = String((await res.json()).chat_template);
  console.log(`${res.status}  ${r}\n     chat_template: ${t.length} chars  sha256:${sha(t)}`);
  found.push([r, t]);
}

const g = await readGguf('https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF' +
  '/resolve/main/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf');
const gt = g.kv.get('tokenizer.chat_template');
console.log(`GGUF bartowski/...-Q4_K_M.gguf\n     chat_template: ${gt.length} chars  sha256:${sha(gt)}`);
found.push(['bartowski GGUF', gt]);

console.log('\n-- do any two of these agree?');
for (let i = 0; i < found.length; i += 1) for (let j = i + 1; j < found.length; j += 1) {
  console.log(`   ${found[i][0]}  vs  ${found[j][0]}: ${found[i][1] === found[j][1] ? 'IDENTICAL' : 'different'}`);
}

console.log('\n-- features present in each template');
const MARK = ['Cutting Knowledge Date', 'custom_tools', 'ipython', 'date_string', 'tools_in_user_message'];
for (const [name, t] of found) {
  console.log(`   ${name.padEnd(40)} ${MARK.map((m) => `${m}=${t.includes(m)}`).join('  ')}`);
}

console.log('\n-- the short one, in full');
console.log(found.find(([n]) => n.startsWith('NousResearch'))[1]);
```

`readGguf` is the range-request GGUF header reader from
[the model-file header tutorial](/tutorials/model-file-header-range-requests) —
a GGUF carries its chat template in metadata, so the same question can be asked
of a quantized file without downloading it.

```text
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

The 348-character template is the whole prompt format of one of these
downloads. It has no branch for tool definitions, no `ipython` role for tool
results, and no knowledge-cutoff block. It is not a corrupted copy — it is a
correct, simple Llama-3-style template that renders a plain chat. It is just
not the same one the model was tuned with.

The 4,614-character template appears twice, from two unrelated packagers, with
matching `sha256`. Convergence from independent repackagers is the best
available evidence of which one is upstream, given that upstream itself answers
401.

## 2. Confirm the weights really are the same

A different prompt format would be unremarkable if these were different models.

```js
// weights.mjs
import { createHash } from 'node:crypto';

const sha = (b) => createHash('sha256').update(b).digest('hex').slice(0, 16);
const MIRRORS = ['NousResearch/Meta-Llama-3.1-8B-Instruct', 'unsloth/Meta-Llama-3.1-8B-Instruct'];
const SHARDS = ['model-00001-of-00004.safetensors', 'model-00002-of-00004.safetensors',
  'model-00003-of-00004.safetensors', 'model-00004-of-00004.safetensors'];

const out = new Map();
for (const repo of MIRRORS) {
  const rows = [];
  for (const f of SHARDS) {
    const url = `https://huggingface.co/${repo}/resolve/main/${f}`;
    const a = await fetch(url, { headers: { range: 'bytes=0-7' } });
    const size = Number(a.headers.get('content-range').split('/')[1]);
    const n = Number(new DataView(await a.arrayBuffer()).getBigUint64(0, true));
    const b = await fetch(url, { headers: { range: `bytes=8-${8 + n - 1}` } });
    const header = await b.text();
    rows.push({ f, size, n, sha: sha(header) });
  }
  out.set(repo, rows);
  console.log(repo);
  for (const r of rows) {
    console.log(`   ${r.f}  file ${r.size.toLocaleString().padStart(15)} B` +
      `  header ${String(r.n).padStart(6)} B  sha256:${r.sha}`);
  }
}

const [a, b] = MIRRORS.map((m) => out.get(m));
console.log('\nshard-by-shard, do the two mirrors match?');
for (let i = 0; i < SHARDS.length; i += 1) {
  console.log(`   ${SHARDS[i]}  size ${a[i].size === b[i].size ? 'same' : 'DIFFER'}` +
    `   header ${a[i].sha === b[i].sha ? 'same' : 'DIFFER'}`);
}
```

```text
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

Sixteen range requests, 67,760 bytes read — eight per mirror, an 8-byte length
probe and then the header itself for each of four shards. All four shards agree
on file size to the byte and on the `sha256` of the tensor index — same
tensors, same shapes, same dtypes, same byte offsets. This does not hash 16 GB
of weights, so it is not proof that every weight is equal; it is proof that the
two repositories describe the same model laid out identically, which is as far
as anyone gets without downloading both.

The difference between the two downloads is in a JSON field.

## 3. Render the same conversation through each

```js
// render.mjs
import { AutoTokenizer } from '@huggingface/transformers';

const MSGS = [
  { role: 'system', content: 'You are terse.' },
  { role: 'user', content: 'Name one river.' },
  { role: 'assistant', content: 'The Loire.' },
  { role: 'user', content: 'And one more?' },
];
const CONTENT = MSGS.map((m) => m.content).join('');

const REPOS = [
  'NousResearch/Meta-Llama-3.1-8B-Instruct',
  'unsloth/Meta-Llama-3.1-8B-Instruct',
  'Qwen/Qwen3-8B',
  'mistralai/Mistral-7B-Instruct-v0.3',
];

for (const repo of REPOS) {
  const t = await AutoTokenizer.from_pretrained(repo);
  console.log(`\n########## ${repo}`);
  let s;
  try {
    s = t.apply_chat_template(MSGS, { tokenize: false, add_generation_prompt: true });
  } catch (e) {
    console.log(`   THREW ${e.constructor.name}: ${e.message}`);
    continue;
  }
  console.log(JSON.stringify(s));
  const withSpecial = t.encode(s);
  const noSpecial = t.encode(s, { add_special_tokens: false });
  const contentOnly = t.encode(CONTENT, { add_special_tokens: false });
  console.log(`   encode(rendered)                     ${String(withSpecial.length).padStart(4)} tokens` +
    `   first 4 ids ${withSpecial.slice(0, 4)}`);
  console.log(`   encode(rendered, no special tokens)  ${String(noSpecial.length).padStart(4)} tokens` +
    `   first 4 ids ${noSpecial.slice(0, 4)}`);
  console.log(`   first three decoded: ${JSON.stringify(withSpecial.slice(0, 3).map((i) => t.decode([i])))}`);
  console.log(`   message text alone                   ${String(contentOnly.length).padStart(4)} tokens`);
  console.log(`   scaffolding                          ${String(noSpecial.length - contentOnly.length).padStart(4)} tokens` +
    ` (${(((noSpecial.length - contentOnly.length) / noSpecial.length) * 100).toFixed(0)}% of the prompt)`);
  const dup = withSpecial.length > noSpecial.length;
  console.log(`   encode() adds a token the template already emitted: ${dup ? 'YES' : 'no'}`);
}
```

```text
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

**The double BOS is right there in the ids.** `128000,128000` on both Llamas;
`1,1` on Mistral. The template emits the beginning-of-text token itself, and
`encode()` adds another by default, so the model receives a two-token opening
that neither the template nor `encode()` produces on its own. Qwen is
unaffected — its template emits no BOS, so the default is harmless. That is why
this bug is silent: it depends on which model you are using, and nothing warns
you. The fix is one argument,
`add_special_tokens: false`, and the reason to check rather than to always pass
it is that on a template which does *not* emit BOS, passing it would remove a
token the model needs.

**The same four messages are `41` tokens on one mirror and `61` on the other.** The
extra twenty are `Cutting Knowledge Date: December 2023\nToday Date: 26 Jul 2024`,
which the official template inserts into the system block and the short template
does not.

**Two thirds to four fifths of that prompt is scaffolding.** `13` tokens of
actual message against `28`, `48` and `26` tokens of format. The ratio improves with
longer messages, which is exactly why it is invisible in benchmarks with long
inputs and expensive in a product that sends many short turns.

**Mistral has quietly rewritten the conversation.** The rendered string is
`[INST] Name one river.[/INST] The Loire.</s>[INST] You are terse.\n\nAnd one
more?[/INST]` — the system message is gone from the front and has reappeared
glued to the front of the *last* user turn.

## 4. Four things the template does that you did not ask for

```js
// traps.mjs
import { AutoTokenizer } from '@huggingface/transformers';

const llama = await AutoTokenizer.from_pretrained('unsloth/Meta-Llama-3.1-8B-Instruct');
const mistral = await AutoTokenizer.from_pretrained('mistralai/Mistral-7B-Instruct-v0.3');
const qwen = await AutoTokenizer.from_pretrained('Qwen/Qwen3-8B');

console.log('=== 1. the date the model is told, with no date passed');
const one = [{ role: 'user', content: 'Hi.' }];
const rendered = llama.apply_chat_template(one, { tokenize: false, add_generation_prompt: true });
console.log(JSON.stringify(rendered));
console.log(`   today, really: ${new Date().toISOString().slice(0, 10)}`);
console.log(`   with date_string passed explicitly:`);
console.log('   ' + JSON.stringify(llama.apply_chat_template(one,
  { tokenize: false, add_generation_prompt: true, date_string: '28 Aug 2026' })).slice(0, 190) + ' ...');

console.log('\n=== 2. what Mistral does with a system message');
const withSys = [
  { role: 'system', content: 'SYSTEM-MARKER' },
  { role: 'user', content: 'FIRST-USER' },
  { role: 'assistant', content: 'ASSISTANT' },
  { role: 'user', content: 'LAST-USER' },
];
console.log('   in:  ' + JSON.stringify(withSys.map((m) => `${m.role}:${m.content}`)));
console.log('   out: ' + JSON.stringify(mistral.apply_chat_template(withSys, { tokenize: false, add_generation_prompt: true })));

console.log('\n=== 3. the floor: what an empty user turn costs before you write anything');
for (const [name, t] of [['llama-3.1 (official tmpl)', llama], ['qwen3', qwen], ['mistral-v0.3', mistral]]) {
  const s = t.apply_chat_template([{ role: 'user', content: '' }], { tokenize: false, add_generation_prompt: true });
  console.log(`   ${name.padEnd(26)} ${String(t.encode(s, { add_special_tokens: false }).length).padStart(3)} tokens`);
}

console.log('\n=== 4. add_generation_prompt, on and off');
for (const [name, t] of [['llama-3.1', llama], ['qwen3', qwen], ['mistral-v0.3', mistral]]) {
  const on = t.apply_chat_template(one, { tokenize: false, add_generation_prompt: true });
  const off = t.apply_chat_template(one, { tokenize: false, add_generation_prompt: false });
  console.log(`   ${name.padEnd(14)} adds ${JSON.stringify(on.slice(off.length))}`);
}
```

```text
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

**`Today Date: 26 Jul 2024`, with no system message and no date argument.** The
official template hardcodes a default `date_string` — the model's release week
— and uses it whenever the caller supplies none. Pass `date_string` and the
value changes, so the mechanism is a parameter with a stale default, not a
bug. The consequence is not stale: every request from every caller who does not
know the parameter exists opens with a system block asserting a date more than
two years in the past. If you have ever wondered why a local `Llama 3.1` is
confident about the wrong year, this line is worth checking before the weights
are blamed.

**The system message is not guaranteed to stay where you put it.** `Mistral v0.3`
has no system role at all; the template relocates the content to the head of
the final user turn. Anything written on the assumption that a system prompt is
positionally privileged, or that later user turns cannot override it, is
describing a different template. Nothing errors and nothing warns — the marker
strings above are the only way to see it.

**The per-request floor is `35`, `8` and `4` tokens.** Same empty conversation, three
templates, an 8.75x spread. At a million short requests that is 35 million
tokens against 4 million before anyone types a word — arithmetic on the
measured floor, not a benchmark.

**`add_generation_prompt` is a no-op on `Mistral v0.3`.** It adds the assistant
header on Llama and Qwen and the empty string on Mistral, because `[/INST]` has
already ended the user turn. Code that treats the flag as a universal "your turn
now" signal is right twice and inert once.

## What was executed, and what was not

Every command and every output above was run on 2026-08-28 on Windows 10 with
Node `v24.13.0` and `@huggingface/transformers` `4.2.0`, unauthenticated,
against huggingface.co. The session crossed UTC midnight, which is why
`new Date().toISOString()` prints `2026-08-29` in the traps transcript while
the local date was still 2026-08-28; the injected `26 Jul 2024` is wrong by
more than two years under either reading.

Not executed: **no model was ever run.** Nothing here measures what a model
*does* with a doubled BOS token, a relocated system message, or a wrong date —
only what string and what token ids it would receive. Those are different
claims and the second one needs inference to support it.

Also not executed: the templates were rendered only by `@huggingface/transformers`'
Jinja implementation. Python `transformers`, `llama.cpp`'s own template engine
and every inference server ship their own renderers, and a template that
renders identically in all of them is an assumption this page does not test.
Only `Llama 3.1 8B Instruct`, `Qwen3 8B` and `Mistral 7B Instruct v0.3` were
examined, and `meta-llama`'s own repository is gated, so upstream's template is
inferred from two independent repackagers agreeing rather than read directly.

## What will break this first

- **A mirror can be re-uploaded.** The 348-character template is a fact about
  `NousResearch/Meta-Llama-3.1-8B-Instruct` on 2026-08-28, not a permanent
  property. Re-run `templates.mjs` rather than quoting the hash.
- **`chat_template` may be a list, not a string.** Some repositories ship
  multiple named templates (`default`, `tool_use`); the code above stringifies
  whatever it finds, which is right for these four repositories and wrong for
  that shape.
- **Default `date_string` values move with each model generation**, and a
  future template may call a now-function instead of hardcoding a date, at
  which point the failure mode inverts: the date becomes right and the prompt
  stops being reproducible.
- **`add_special_tokens` defaults are library-level**, not model-level. The
  doubled BOS shown here is a property of this API's default combined with this
  template; a different client may already pass `false`.
