---
title: "Read what is actually inside a 4.9 GB model file by downloading 0.16% of it"
subjects:
  - tool/hugging-face-hub
  - tool/llama-cpp
  - technique/quantization
verified_against:
  tool/hugging-face-hub: "huggingface.co as served 2026-08-28; Accept-Ranges: bytes on resolve/ URLs"
  tool/llama-cpp: "GGUF version 3, general.quantization_version 2"
  technique/quantization: "bartowski/Meta-Llama-3.1-8B-Instruct-GGUF, repo sha bf5b95e96dac0462e2a09145ec66cae9a3f12067, lastModified 2024-12-01"
verified_on: "2026-08-28"
reverify_days: 60
mentions:
  - tool/hugging-face-hub
  - tool/llama-cpp
  - technique/quantization
---

Both formats the open-weights world ships in — GGUF and safetensors — put a
complete description of the model in a header at the front of the file. Hugging
Face serves those files with `Accept-Ranges: bytes`. So you can ask a 4.9 GB
file exactly what is in it, and pay for 7.8 MB.

Below, 62.9 MB of range requests describe 40.2 GB of quantized `Llama 3.1 8B` —
every tensor, every shape, and the real bits per weight of eight quants,
measured rather than looked up. Three of the results contradict what the
filenames say.

No account, no key, no `huggingface_hub`, no packages. Node's built-in `fetch`
and about 120 lines.

## 1. Find out what the server will let you do

```js
// probe.mjs
const FILES = [
  ['bartowski/Meta-Llama-3.1-8B-Instruct-GGUF', 'Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf'],
  ['NousResearch/Meta-Llama-3.1-8B-Instruct', 'model-00001-of-00004.safetensors'],
  ['meta-llama/Llama-3.1-8B-Instruct', 'model-00001-of-00004.safetensors'],
];

for (const [repo, file] of FILES) {
  const url = `https://huggingface.co/${repo}/resolve/main/${file}`;
  const head = await fetch(url, { method: 'HEAD' });
  console.log(`${repo}/${file}`);
  console.log(`   HEAD ${head.status}  accept-ranges: ${head.headers.get('accept-ranges') ?? '(none)'}` +
    `  content-length: ${head.headers.get('content-length') ?? '(none)'}`);
  const r = await fetch(url, { headers: { range: 'bytes=0-7' } });
  if (r.status === 206) {
    const b = new Uint8Array(await r.arrayBuffer());
    const hex = [...b].map((x) => x.toString(16).padStart(2, '0')).join(' ');
    const ascii = [...b].map((x) => (x >= 32 && x < 127 ? String.fromCharCode(x) : '.')).join('');
    console.log(`   GET  206  content-range: ${r.headers.get('content-range')}`);
    console.log(`   bytes 0-7: ${hex}   "${ascii}"`);
  } else {
    console.log(`   GET  ${r.status}  ${r.headers.get('x-error-message')}`);
  }
  console.log('');
}
```

```text
$ node probe.mjs
bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf
   HEAD 200  accept-ranges: bytes  content-length: 4920739232
   GET  206  content-range: bytes 0-7/4920739232
   bytes 0-7: 47 47 55 46 03 00 00 00   "GGUF...."

NousResearch/Meta-Llama-3.1-8B-Instruct/model-00001-of-00004.safetensors
   HEAD 200  accept-ranges: bytes  content-length: 4976698672
   GET  206  content-range: bytes 0-7/4976698672
   bytes 0-7: 28 25 00 00 00 00 00 00   "(%......"

meta-llama/Llama-3.1-8B-Instruct/model-00001-of-00004.safetensors
   HEAD 401  accept-ranges: (none)  content-length: 140
   GET  401  Access to model meta-llama/Llama-3.1-8B-Instruct is restricted. You must have access to it and be authenticated to access it. Please log in.
```

Three facts in nine lines.

`47 47 55 46` is `GGUF` followed by `03 00 00 00` — little-endian 3, the format
version. Safetensors has no magic number at all: its first eight bytes are a
little-endian `uint64` header length, here `0x2528` = 9,512. That difference
decides how much work each format is. Safetensors tells you the size of its
header before you have read any of it. GGUF makes you parse to find out.

The 401 is the third fact, and it is the one that will cost you an afternoon.
`meta-llama/Llama-3.1-8B-Instruct` is a **public repository with gated files**.
`https://huggingface.co/api/models/meta-llama/Llama-3.1-8B-Instruct` answers
`200` with `gated: "manual"` and lists all 17 filenames; the weights themselves
answer `401`. Every technique on this page works on the mirrors —
`NousResearch/...` and `unsloth/...` both answer `206` — and on the community
GGUF repos, none of which are gated.

## 2. Read a GGUF header without knowing how big it is

GGUF's layout is: a 24-byte prologue, then `kv_count` key/value pairs, then
`tensor_count` tensor descriptors, then padding, then the weights. Strings are
length-prefixed, arrays carry an element type and a count, and nothing
anywhere records where the metadata ends. You find the end by parsing to it.

So the reader fetches a chunk, parses until it runs out of bytes, fetches
another chunk, and keeps going.

```js
// lib.mjs
const CHUNK = 1 << 18; // 256 KiB per range request

class Reader {
  constructor(url) {
    this.url = url;
    this.buf = new Uint8Array(0);
    this.pos = 0;
    this.requests = 0;
    this.fetched = 0;
    this.total = 0;
  }

  async ensure(n) {
    while (this.buf.length < this.pos + n) {
      const start = this.buf.length;
      const end = start + Math.max(CHUNK, this.pos + n - start) - 1;
      const res = await fetch(this.url, { headers: { range: `bytes=${start}-${end}` } });
      if (res.status !== 206) {
        throw new Error(`${res.status} ${res.headers.get('x-error-message') ?? res.statusText}`);
      }
      this.total ||= Number(res.headers.get('content-range').split('/')[1]);
      const part = new Uint8Array(await res.arrayBuffer());
      const grown = new Uint8Array(this.buf.length + part.length);
      grown.set(this.buf);
      grown.set(part, this.buf.length);
      this.buf = grown;
      this.requests += 1;
      this.fetched += part.length;
    }
  }

  get v() { return new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength); }

  async u32() { await this.ensure(4); const x = this.v.getUint32(this.pos, true); this.pos += 4; return x; }
  async u64() { await this.ensure(8); const x = this.v.getBigUint64(this.pos, true); this.pos += 8; return Number(x); }
  async str() {
    const n = await this.u64();
    await this.ensure(n);
    const s = new TextDecoder().decode(this.buf.subarray(this.pos, this.pos + n));
    this.pos += n;
    return s;
  }
  async scalar(t) {
    const sizes = { 0: 1, 1: 1, 2: 2, 3: 2, 4: 4, 5: 4, 6: 4, 7: 1, 10: 8, 11: 8, 12: 8 };
    if (t === 8) return this.str();
    const n = sizes[t];
    if (!n) throw new Error(`unknown GGUF value type ${t}`);
    await this.ensure(n);
    const d = this.v; const p = this.pos; this.pos += n;
    switch (t) {
      case 0: return d.getUint8(p); case 1: return d.getInt8(p);
      case 2: return d.getUint16(p, true); case 3: return d.getInt16(p, true);
      case 4: return d.getUint32(p, true); case 5: return d.getInt32(p, true);
      case 6: return d.getFloat32(p, true); case 7: return d.getUint8(p) !== 0;
      case 10: return Number(d.getBigUint64(p, true)); case 11: return Number(d.getBigInt64(p, true));
      default: return d.getFloat64(p, true);
    }
  }
  async value(t) {
    if (t !== 9) return this.scalar(t);
    const inner = await this.u32();
    const count = await this.u64();
    const out = new Array(count);
    for (let i = 0; i < count; i += 1) out[i] = await this.value(inner);
    return out;
  }
}

export async function readGguf(url) {
  const r = new Reader(url);
  await r.ensure(24);
  const magic = new TextDecoder().decode(r.buf.subarray(0, 4));
  if (magic !== 'GGUF') throw new Error(`not a GGUF file: magic ${JSON.stringify(magic)}`);
  r.pos = 4;
  const version = await r.u32();
  const tensorCount = await r.u64();
  const kvCount = await r.u64();

  const kv = new Map();
  for (let i = 0; i < kvCount; i += 1) {
    const key = await r.str();
    kv.set(key, await r.value(await r.u32()));
  }
  const metadataEnd = r.pos;

  const tensors = [];
  for (let i = 0; i < tensorCount; i += 1) {
    const name = await r.str();
    const nDims = await r.u32();
    const dims = [];
    for (let d = 0; d < nDims; d += 1) dims.push(await r.u64());
    const type = await r.u32();
    const offset = await r.u64();
    tensors.push({ name, dims, type, offset, elems: dims.reduce((a, b) => a * b, 1) });
  }
  const headerEnd = r.pos;
  const alignment = kv.get('general.alignment') ?? 32;
  const dataStart = Math.ceil(headerEnd / alignment) * alignment;

  // Byte size of each tensor, measured from the gap to the next offset.
  tensors.sort((a, b) => a.offset - b.offset);
  for (let i = 0; i < tensors.length; i += 1) {
    const next = i + 1 < tensors.length ? tensors[i + 1].offset : r.total - dataStart;
    tensors[i].bytes = next - tensors[i].offset;
    tensors[i].bpw = (tensors[i].bytes * 8) / tensors[i].elems;
  }

  return {
    url, version, kv, tensors, alignment,
    metadataEnd, headerEnd, dataStart,
    total: r.total, requests: r.requests, fetched: r.fetched,
    params: tensors.reduce((a, t) => a + t.elems, 0),
  };
}

/** Tensor-type census with bits per weight measured from the offsets. */
export function census(g) {
  const by = new Map();
  for (const t of g.tensors) {
    const e = by.get(t.type) ?? { type: t.type, n: 0, elems: 0, bytes: 0 };
    e.n += 1; e.elems += t.elems; e.bytes += t.bytes;
    by.set(t.type, e);
  }
  return [...by.values()].sort((a, b) => b.elems - a.elems);
}
```

The three lines to notice are the ones after the tensor loop.

Tensor descriptors carry an `offset` but **not a size**. The size of tensor *i*
is the distance to tensor *i+1*, and the size of the last one is whatever is
left in the file. That subtraction is the whole trick of this page: it makes
bits per weight a *measurement* taken from the file, not a number copied out of
a table of block layouts that may or may not describe the build you are
holding.

## 3. What one file says

```js
// header.mjs
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readGguf, census } from './lib.mjs';

const g = await readGguf(process.argv[2]);

console.log(`GGUF version ${g.version}  ${g.tensors.length} tensors  ${g.kv.size} metadata keys`);
console.log(`metadata ends at ${g.metadataEnd.toLocaleString()}; tensor index ends at ${g.headerEnd.toLocaleString()};` +
  ` alignment ${g.alignment}; weights start at ${g.dataStart.toLocaleString()}`);
console.log(`READ ${g.fetched.toLocaleString()} bytes in ${g.requests} range requests` +
  ` = ${((g.fetched / g.total) * 100).toFixed(4)}% of a ${g.total.toLocaleString()}-byte file`);

console.log('\n-- metadata');
for (const [k, v] of g.kv) {
  const shown = Array.isArray(v) ? `array[${v.length}]  e.g. ${JSON.stringify(v[0])}` : JSON.stringify(v);
  console.log(`   ${k.padEnd(38)} ${shown.length > 62 ? shown.slice(0, 59) + '...' : shown}`);
}

console.log('\n-- tensor types; bits per weight MEASURED from the gaps between offsets');
console.log('   type  tensors        parameters            bytes   bits/weight');
for (const e of census(g)) {
  console.log([
    String(e.type).padStart(7), String(e.n).padStart(8),
    e.elems.toLocaleString().padStart(18), e.bytes.toLocaleString().padStart(17),
    ((e.bytes * 8) / e.elems).toFixed(4).padStart(14),
  ].join(''));
}

const data = g.total - g.dataStart;
console.log(`\nparameters   ${g.params.toLocaleString()}`);
console.log(`weight bytes ${data.toLocaleString()} -> ${((data * 8) / g.params).toFixed(4)} bits per weight overall`);
console.log(`header       ${g.dataStart.toLocaleString()} bytes (${((g.dataStart / g.total) * 100).toFixed(3)}% of the file)`);

console.log('\n-- five largest tensors');
for (const t of [...g.tensors].sort((a, b) => b.bytes - a.bytes).slice(0, 5)) {
  console.log(`   ${t.name.padEnd(22)} ${JSON.stringify(t.dims).padEnd(18)} type ${String(t.type).padStart(2)}` +
    `  ${t.bytes.toLocaleString().padStart(13)} B  ${t.bpw.toFixed(4)} bpw`);
}

await writeFile(join(import.meta.dirname, 'gguf.json'),
  JSON.stringify({ tensors: g.tensors, params: g.params, total: g.total }));
```

```text
$ node header.mjs https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf
GGUF version 3  292 tensors  33 metadata keys
metadata ends at 7,823,572; tensor index ends at 7,840,907; alignment 32; weights start at 7,840,928
READ 7,864,320 bytes in 30 range requests = 0.1598% of a 4,920,739,232-byte file

-- metadata
   general.architecture                   "llama"
   general.type                           "model"
   general.name                           "Meta Llama 3.1 8B Instruct"
   general.finetune                       "Instruct"
   general.basename                       "Meta-Llama-3.1"
   general.size_label                     "8B"
   general.license                        "llama3.1"
   general.tags                           array[6]  e.g. "facebook"
   general.languages                      array[8]  e.g. "en"
   llama.block_count                      32
   llama.context_length                   131072
   llama.embedding_length                 4096
   llama.feed_forward_length              14336
   llama.attention.head_count             32
   llama.attention.head_count_kv          8
   llama.rope.freq_base                   500000
   llama.attention.layer_norm_rms_epsilon 0.000009999999747378752
   general.file_type                      15
   llama.vocab_size                       128256
   llama.rope.dimension_count             128
   tokenizer.ggml.model                   "gpt2"
   tokenizer.ggml.pre                     "llama-bpe"
   tokenizer.ggml.tokens                  array[128256]  e.g. "!"
   tokenizer.ggml.token_type              array[128256]  e.g. 1
   tokenizer.ggml.merges                  array[280147]  e.g. "Ġ Ġ"
   tokenizer.ggml.bos_token_id            128000
   tokenizer.ggml.eos_token_id            128009
   tokenizer.chat_template                "{{- bos_token }}\n{%- if custom_tools is defined %}\n    {...
   general.quantization_version           2
   quantize.imatrix.file                  "/models_out/Meta-Llama-3.1-8B-Instruct-GGUF/Meta-Llama-3.1...
   quantize.imatrix.dataset               "/training_dir/calibration_datav3.txt"
   quantize.imatrix.entries_count         224
   quantize.imatrix.chunks_count          125

-- tensor types; bits per weight MEASURED from the gaps between offsets
   type  tensors        parameters            bytes   bits/weight
     12     193     6,498,025,472    3,655,139,328        4.5000
     14      33     1,531,969,536    1,256,693,760        6.5625
      0      66           266,304        1,065,216       32.0000

parameters   8,030,261,312
weight bytes 4,912,898,304 -> 4.8944 bits per weight overall
header       7,840,928 bytes (0.159% of the file)

-- five largest tensors
   output.weight          [4096,128256]      type 14    430,940,160 B  6.5625 bpw
   token_embd.weight      [4096,128256]      type 12    295,501,824 B  4.5000 bpw
   blk.0.ffn_down.weight  [14336,4096]       type 14     48,168,960 B  6.5625 bpw
   blk.1.ffn_down.weight  [14336,4096]       type 14     48,168,960 B  6.5625 bpw
   blk.2.ffn_down.weight  [14336,4096]       type 14     48,168,960 B  6.5625 bpw
```

**A "4-bit" quant is 4.8944 bits per weight.** Not approximately — the three
measured type rates are `4.5000`, `6.5625` and `32.0000`, and the sums are
exact: `3,655,139,328 + 1,256,693,760 + 1,065,216 = 4,912,898,304`, which is
`4,920,739,232 − 7,840,928` to the byte. Nothing is padded between tensors and
nothing is estimated. Those three rates are the block layouts of Q4_K (144
bytes per 256 weights), Q6_K (210 per 256) and F32 — recovered from the file
rather than assumed about it.

**The header is 7.8 MB, and 99.8% of it is a tokenizer.** `tokenizer.ggml.tokens`
is 128,256 strings and `tokenizer.ggml.merges` is 280,147 more. GGUF embeds the
whole tokenizer, so a GGUF is genuinely self-contained — and so you must read
past all of it to reach the tensor index, because there is no offset table to
skip with. Thirty round trips for what is conceptually a table of contents.

**The quantizer's filesystem is in there.** `quantize.imatrix.file` is
`/models_out/Meta-Llama-3.1-8B-Instruct-GGUF/…` and
`quantize.imatrix.dataset` is `/training_dir/calibration_datav3.txt` — absolute
paths from the machine that produced the file. They are also the only evidence
in the file that an importance matrix was used at all, which is the difference
between this quant and a plain one.

**`output.weight` is a bigger tensor than `token_embd.weight`** even though both
are `[4096, 128256]`. The output head is kept at Q6_K while the input embedding
is dropped to Q4_K. That asymmetry is what the letters after `Q4_K` mean, and
it is measurable.

## 4. Eight quants of the same model, measured

```js
// quants.mjs
import { readGguf, census } from './lib.mjs';

const REPO = 'bartowski/Meta-Llama-3.1-8B-Instruct-GGUF';
const NAMES = process.argv.slice(2);

const rows = [];
for (const n of NAMES) {
  const url = `https://huggingface.co/${REPO}/resolve/main/Meta-Llama-3.1-8B-Instruct-${n}.gguf`;
  const g = await readGguf(url);
  const data = g.total - g.dataStart;
  rows.push({ n, g, data, bpw: (data * 8) / g.params });
  console.error(`  read ${n}: ${g.fetched} B in ${g.requests} requests`);
}

console.log('quant      file bytes     GiB   file_type   params        bits/weight   types (id:count)');
for (const r of rows) {
  const types = census(r.g).map((e) => `${e.type}:${e.n}`).join(' ');
  console.log([
    r.n.padEnd(9), r.g.total.toLocaleString().padStart(14),
    (r.g.total / 2 ** 30).toFixed(2).padStart(8),
    String(r.g.kv.get('general.file_type')).padStart(10),
    r.g.params.toLocaleString().padStart(16),
    r.bpw.toFixed(4).padStart(12), '   ' + types,
  ].join(''));
}

console.log('\n-- how the S / M / L variants differ: type of each named tensor');
const NAMED = ['token_embd.weight', 'output.weight', 'blk.0.attn_v.weight', 'blk.0.ffn_down.weight', 'blk.0.attn_q.weight'];
console.log('tensor'.padEnd(24) + rows.map((r) => r.n.padStart(9)).join(''));
for (const name of NAMED) {
  const cells = rows.map((r) => {
    const t = r.g.tensors.find((x) => x.name === name);
    return (t ? `${t.type}(${t.bpw.toFixed(2)})` : '-').padStart(9);
  });
  console.log(name.padEnd(24) + cells.join(''));
}

console.log('\n-- bits per weight measured for every distinct type id seen');
const seen = new Map();
for (const r of rows) for (const e of census(r.g)) {
  const bpw = ((e.bytes * 8) / e.elems).toFixed(4);
  (seen.get(e.type) ?? seen.set(e.type, new Set()).get(e.type)).add(bpw);
}
for (const [type, set] of [...seen].sort((a, b) => a[0] - b[0])) {
  console.log(`   type ${String(type).padStart(2)}  ${[...set].join(', ')}`);
}

const total = rows.reduce((a, r) => a + r.g.fetched, 0);
const onDisk = rows.reduce((a, r) => a + r.g.total, 0);
console.log(`\nread ${total.toLocaleString()} bytes to describe ${onDisk.toLocaleString()} bytes of model files` +
  ` (${((total / onDisk) * 100).toFixed(4)}%)`);
```

```text
$ node quants.mjs IQ2_M Q2_K Q3_K_M Q4_K_S Q4_K_M Q4_K_L Q6_K Q8_0
  read IQ2_M: 7864320 B in 30 requests
  read Q2_K: 7864320 B in 30 requests
  read Q3_K_M: 7864320 B in 30 requests
  read Q4_K_S: 7864320 B in 30 requests
  read Q4_K_M: 7864320 B in 30 requests
  read Q4_K_L: 7864320 B in 30 requests
  read Q6_K: 7864320 B in 30 requests
  read Q8_0: 7864320 B in 30 requests
quant      file bytes     GiB   file_type   params        bits/weight   types (id:count)
IQ2_M     2,948,285,856    2.75        29   8,030,261,312      2.9294   22:156 21:37 13:1 12:32 0:66
Q2_K      3,179,136,416    2.96        10   8,030,261,312      3.1593   10:129 11:64 14:1 12:32 0:66
Q3_K_M    4,018,922,912    3.74        12   8,030,261,312      3.9960   11:129 12:92 14:1 13:4 0:66
Q4_K_S    4,692,673,952    4.37        14   8,030,261,312      4.6672   12:217 14:1 13:8 0:66
Q4_K_M    4,920,739,232    4.58        15   8,030,261,312      4.8944   12:193 14:33 0:66
Q4_K_L    5,310,637,472    4.95        15   8,030,261,312      5.2828   12:192 8:2 14:32 0:66
Q6_K      6,596,011,424    6.14        18   8,030,261,312      6.5633   14:226 0:66
Q8_0      8,540,775,840    7.95         7   8,030,261,312      8.5008   8:226 0:66

-- how the S / M / L variants differ: type of each named tensor
tensor                      IQ2_M     Q2_K   Q3_K_M   Q4_K_S   Q4_K_M   Q4_K_L     Q6_K     Q8_0
token_embd.weight        21(3.44) 10(2.63) 11(3.44) 12(4.50) 12(4.50)  8(8.50) 14(6.56)  8(8.50)
output.weight            13(5.50) 14(6.56) 14(6.56) 14(6.56) 14(6.56)  8(8.50) 14(6.56)  8(8.50)
blk.0.attn_v.weight      12(4.50) 12(4.50) 13(5.50) 13(5.50) 14(6.56) 14(6.56) 14(6.56)  8(8.50)
blk.0.ffn_down.weight    21(3.44) 11(3.44) 13(5.50) 13(5.50) 14(6.56) 14(6.56) 14(6.56)  8(8.50)
blk.0.attn_q.weight      22(2.56) 10(2.63) 11(3.44) 12(4.50) 12(4.50) 12(4.50) 14(6.56)  8(8.50)

-- bits per weight measured for every distinct type id seen
   type  0  32.0000
   type  8  8.5000
   type 10  2.6250
   type 11  3.4375
   type 12  4.5000
   type 13  5.5000
   type 14  6.5625
   type 21  3.4375
   type 22  2.5625

read 62,914,560 bytes to describe 40,207,183,104 bytes of model files (0.1565%)
```

**Q4_K_L and Q4_K_M both report `general.file_type` 15.** The metadata cannot
tell them apart; they differ by 390 MB and by which tensors got promoted. If
you are cataloguing quants, the filename is more informative than the file's own
declared type, which is an uncomfortable thing to build on and the reason the
per-tensor census exists.

**Even Q2_K refuses to squeeze the output head.** Its `attn_q` is 2.63 bits per
weight, and its `output.weight` is 6.56. The most aggressive K-quant in this
list spends 2.5x its own average on the last layer.

**No quant is uniform**, and the `types (id:count)` column says how far from
uniform. `Q4_K_S` has 8 tensors that are not Q4_K; `Q4_K_M` has 33. Which
eight, and which thirty-three, is the whole difference between them — so ask.

```js
// policy.mjs — exactly which tensors are NOT the majority type.
import { readGguf, census } from './lib.mjs';

const REPO = 'bartowski/Meta-Llama-3.1-8B-Instruct-GGUF';
for (const n of process.argv.slice(2)) {
  const url = `https://huggingface.co/${REPO}/resolve/main/Meta-Llama-3.1-8B-Instruct-${n}.gguf`;
  const g = await readGguf(url);
  const c = census(g);
  const majority = c.reduce((a, b) => (a.n > b.n ? a : b)).type;
  console.log(`\n=== ${n}  majority type ${majority}  (${c.map((e) => `${e.type}:${e.n}`).join(' ')})`);
  const odd = g.tensors.filter((t) => t.type !== majority && t.type !== 0);
  const byType = new Map();
  for (const t of odd) {
    if (!byType.has(t.type)) byType.set(t.type, []);
    byType.get(t.type).push(t.name);
  }
  for (const [type, names] of [...byType].sort((a, b) => a[0] - b[0])) {
    const groups = new Map();
    for (const nm of names) {
      const m = nm.match(/^blk\.(\d+)\.(.+)$/);
      const k = m ? m[2] : nm;
      if (!groups.has(k)) groups.set(k, []);
      if (m) groups.get(k).push(Number(m[1]));
    }
    console.log(`  type ${type} (${names.length} tensors)`);
    for (const [k, layers] of groups) {
      console.log(`     ${k.padEnd(22)} ${layers.length ? `layers ${layers.sort((a, b) => a - b).join(',')}` : '(not per-layer)'}`);
    }
  }
}
```

```text
$ node policy.mjs Q4_K_S Q4_K_M Q4_K_L

=== Q4_K_S  majority type 12  (12:217 14:1 13:8 0:66)
  type 13 (8 tensors)
     ffn_down.weight        layers 0,1,2,3
     attn_v.weight          layers 0,1,2,3
  type 14 (1 tensors)
     output.weight          (not per-layer)

=== Q4_K_M  majority type 12  (12:193 14:33 0:66)
  type 14 (33 tensors)
     ffn_down.weight        layers 0,1,2,3,6,10,13,16,19,21,24,27,28,29,30,31
     attn_v.weight          layers 0,1,2,3,6,10,13,16,19,21,24,27,28,29,30,31
     output.weight          (not per-layer)

=== Q4_K_L  majority type 12  (12:192 8:2 14:32 0:66)
  type 8 (2 tensors)
     token_embd.weight      (not per-layer)
     output.weight          (not per-layer)
  type 14 (32 tensors)
     ffn_down.weight        layers 0,1,2,3,6,10,13,16,19,21,24,27,28,29,30,31
     attn_v.weight          layers 0,1,2,3,6,10,13,16,19,21,24,27,28,29,30,31
```

**The promotion is per layer, and the layers are not evenly spaced.** Exactly
two tensor kinds are ever spared — `ffn_down` and `attn_v` — and in `Q4_K_M`
they are spared on `0,1,2,3, 6,10,13,16,19,21,24,27, 28,29,30,31`: the first
four layers, the last four, and eight scattered through the middle. Sixteen of
thirty-two, and no arithmetic stride generates that middle set. `Q4_K_S` keeps
the same two tensor kinds but only on layers 0–3, and only to Q5_K rather than
Q6_K.

So the three `Q4_K_*` files are one policy with three settings, and the settings
are: how many layers get the better treatment, and what happens to the two
vocabulary-sized tensors. `Q4_K_L` is `Q4_K_M` with `token_embd` and
`output` moved to Q8_0 — 390 MB for those two tensors and nothing else changed.
Anyone choosing between `_M` and `_L` on a memory budget is deciding about the
embedding and the output head, not about the body of the model.

**Q8_0 is 8.5 bits per weight, so the file is bigger than the parameter count in
bytes** — 8,540,775,840 bytes for 8,030,261,312 parameters. Every 32 weights
carry a 16-bit scale, which is the 0.5.

**`IQ2_M` fits an 8B model in 2.75 GiB at 2.93 bits per weight.** Its bulk type
measures 2.5625 bpw. Whether it is any good is a different question and not one
this page measures — but the file exists and its shape is exactly this.

Two rates are worth staring at: type 11 and type 21 both measure `3.4375`, and
they are different quantization schemes that happen to land on the same size.
Bits per weight identifies a size, not a method.

## 5. Do the GGUF and the original weights agree?

Safetensors is the easy one: eight bytes give you the header length, the header
is JSON, and every tensor declares `data_offsets`.

```js
// safetensors.mjs
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const REPO = process.argv[2];

const idxUrl = `https://huggingface.co/${REPO}/resolve/main/model.safetensors.index.json`;
const idxRes = await fetch(idxUrl);
let files;
let indexBytes = 0;
if (idxRes.ok) {
  const text = await idxRes.text();
  indexBytes = text.length;
  const idx = JSON.parse(text);
  files = [...new Set(Object.values(idx.weight_map))].sort();
  console.log(`index ${idxRes.status}: ${files.length} shards, ${Object.keys(idx.weight_map).length} tensors named`);
  if (idx.metadata) console.log(`index metadata: ${JSON.stringify(idx.metadata)}`);
} else {
  files = ['model.safetensors'];
  console.log(`no index (${idxRes.status}) — assuming a single ${files[0]}`);
}

let fetched = indexBytes;
let requests = 1;
let fileBytes = 0;
const tensors = [];

for (const f of files) {
  const url = `https://huggingface.co/${REPO}/resolve/main/${f}`;
  const a = await fetch(url, { headers: { range: 'bytes=0-7' } });
  if (a.status !== 206) throw new Error(`${f}: ${a.status} ${await a.text()}`);
  requests += 1; fetched += 8;
  fileBytes += Number(a.headers.get('content-range').split('/')[1]);
  const n = Number(new DataView(await a.arrayBuffer()).getBigUint64(0, true));
  const b = await fetch(url, { headers: { range: `bytes=8-${8 + n - 1}` } });
  requests += 1; fetched += n;
  const json = JSON.parse(await b.text());
  const count = Object.keys(json).length - ('__metadata__' in json ? 1 : 0);
  console.log(`${f.padEnd(34)} header ${String(n).padStart(8)} B declares ${String(count).padStart(4)} tensors`);
  for (const [name, t] of Object.entries(json)) {
    if (name === '__metadata__') continue;
    tensors.push({ name, ...t, elems: t.shape.reduce((x, y) => x * y, 1),
      bytes: t.data_offsets[1] - t.data_offsets[0] });
  }
}

const byDtype = new Map();
for (const t of tensors) {
  const e = byDtype.get(t.dtype) ?? { n: 0, elems: 0, bytes: 0 };
  e.n += 1; e.elems += t.elems; e.bytes += t.bytes;
  byDtype.set(t.dtype, e);
}
console.log('\n   dtype  tensors        parameters           bytes  bits/weight (measured)');
for (const [d, e] of [...byDtype].sort((a, b) => b[1].elems - a[1].elems)) {
  console.log([d.padStart(8), String(e.n).padStart(9), e.elems.toLocaleString().padStart(18),
    e.bytes.toLocaleString().padStart(16), ((e.bytes * 8) / e.elems).toFixed(4).padStart(12)].join(''));
}

const params = tensors.reduce((a, t) => a + t.elems, 0);
console.log(`\nparameters ${params.toLocaleString()}`);
console.log(`shard bytes on disk ${fileBytes.toLocaleString()}`);
console.log(`READ ${fetched.toLocaleString()} bytes in ${requests} requests = ${((fetched / fileBytes) * 100).toFixed(5)}% of the weights`);

await writeFile(join(import.meta.dirname, 'st.json'), JSON.stringify({ tensors, params, fileBytes }));
```

```text
$ node safetensors.mjs NousResearch/Meta-Llama-3.1-8B-Instruct
index 200: 4 shards, 291 tensors named
index metadata: {"total_size":16060522496}
model-00001-of-00004.safetensors   header     9512 B declares   82 tensors
model-00002-of-00004.safetensors   header    12120 B declares  104 tensors
model-00003-of-00004.safetensors   header    11656 B declares  100 tensors
model-00004-of-00004.safetensors   header      560 B declares    5 tensors

   dtype  tensors        parameters           bytes  bits/weight (measured)
    BF16      291     8,030,261,248  16,060,522,496     16.0000

parameters 8,030,261,248
shard bytes on disk 16,060,556,376
READ 57,830 bytes in 9 requests = 0.00036% of the weights
```

57,830 bytes to fully describe 16 GB. Now put the two side by side. GGUF writes
dimensions in the opposite order from PyTorch — `[4096, 128256]` against
`[128256, 4096]` — so the comparison sorts each shape before matching.

```js
// compare.mjs
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const here = (f) => join(import.meta.dirname, f);
const g = JSON.parse(await readFile(here('gguf.json'), 'utf8'));
const s = JSON.parse(await readFile(here('st.json'), 'utf8'));

const key = (d) => [...d].sort((a, b) => a - b).join(' x ');
const bag = (list, dimsOf) => {
  const m = new Map();
  for (const t of list) {
    const k = key(dimsOf(t));
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(t.name);
  }
  return m;
};

const G = bag(g.tensors, (t) => t.dims);
const S = bag(s.tensors, (t) => t.shape);

console.log('shape                gguf  safetensors');
for (const k of [...new Set([...G.keys(), ...S.keys()])].sort()) {
  const a = G.get(k)?.length ?? 0;
  const b = S.get(k)?.length ?? 0;
  console.log(`${k.padEnd(20)} ${String(a).padStart(4)} ${String(b).padStart(12)}${a === b ? '' : '   <-- differ'}`);
  if (a !== b) {
    console.log(`     only in gguf:        ${(G.get(k) ?? ['(none)']).join(', ')}`);
    console.log(`     only in safetensors: ${(S.get(k) ?? ['(none)']).join(', ')}`);
  }
}

const gp = g.tensors.reduce((a, t) => a + t.elems, 0);
const sp = s.tensors.reduce((a, t) => a + t.elems, 0);
console.log(`\ngguf        ${g.tensors.length} tensors  ${gp.toLocaleString()} parameters`);
console.log(`safetensors ${s.tensors.length} tensors  ${sp.toLocaleString()} parameters`);
console.log(`difference  ${g.tensors.length - s.tensors.length} tensor, ${gp - sp} parameters`);
console.log(`\nbf16 on disk ${s.fileBytes.toLocaleString()} B; Q4_K_M on disk ${g.total.toLocaleString()} B` +
  `  -> ${(s.fileBytes / g.total).toFixed(2)}x smaller`);
```

```text
$ node compare.mjs
shape                gguf  safetensors
1024 x 4096            64           64
4096                   65           65
4096 x 128256           2            2
4096 x 14336           96           96
4096 x 4096            64           64
64                      1            0   <-- differ
     only in gguf:        rope_freqs.weight
     only in safetensors: (none)

gguf        292 tensors  8,030,261,312 parameters
safetensors 291 tensors  8,030,261,248 parameters
difference  1 tensor, 64 parameters

bf16 on disk 16,060,556,376 B; Q4_K_M on disk 4,920,739,232 B  -> 3.26x smaller
```

**The GGUF has 64 parameters the original does not.** One tensor,
`rope_freqs.weight`, 64 floats — the rotary position frequencies, which
PyTorch computes at load time from `rope_theta` and the head dimension, and
which the conversion bakes into the file. `llama.rope.dimension_count` is 128,
and half of 128 is 64. Everything else matches exactly, tensor for tensor.

The rest of the comparison is the part people quote: **`Llama 3.1 8B` is
8,030,261,248 parameters.** And `4096 x 128256` appears twice on both sides —
this model does not tie its input embedding to its output head, which is why
those two tensors alone are 2.1 GB of the bf16 checkpoint and why every quant
in the table above treats them as a special case.

## What was executed, and what was not

Every command and every output above was run on 2026-08-28 against
huggingface.co, unauthenticated, on Windows 10 with Node `v24.13.0`. No model
weights were downloaded and no packages were installed. Across the four
programs the total traffic was 94,371,840 bytes of GGUF header (twelve file
reads at 7,864,320 bytes each — eight in `quants.mjs`, three in `policy.mjs`,
one in `header.mjs`), 57,830 bytes of safetensors header, and one 401.

Not executed: nothing here loads a model or runs inference, so no statement
above is about quality, perplexity or speed — only about what is in the files.
The tensor byte sizes are derived from the gaps between offsets, which assumes
tensors are stored contiguously; that assumption is checked, not asserted, by
the per-type rates landing on exact block sizes and by the per-type byte sums
equalling the file size minus the header to the byte. Only one model family was
read (`Llama 3.1 8B`, one repository of quants by one packager). A
mixture-of-experts model, a multimodal projector, or a repository built by a
different quantizer will have tensor names and policies this page has not seen.

## What will break this first

- **`Accept-Ranges: bytes` is a serving decision, not a promise.** Everything
  here dies if the CDN in front of `resolve/` stops honouring `Range`, and the
  failure is a full 4.9 GB download rather than an error.
- **Gating is per-repository and changes.** `meta-llama/Llama-3.1-8B-Instruct`
  answers 401 today; a mirror that answers 206 today can be taken down
  tomorrow. Check the status code, never assume it.
- **GGUF is at version 3 and the quantization version is 2.** A version 4 could
  change the prologue or the tensor descriptor, and this parser has no
  compatibility path — it would fail on the first `unknown GGUF value type`.
- **Type ids are `ggml_type` enum values, and enums grow.** The ids seen here
  (8, 10–14, 21, 22) are stable in practice because files in the wild depend on
  them, but a file using an id this page has never seen will still parse
  correctly — the measured bits per weight does not need to know the name.
- **`bartowski/Meta-Llama-3.1-8B-Instruct-GGUF` was last modified 2024-12-01**
  at repo sha `bf5b95e96dac0462e2a09145ec66cae9a3f12067`. Re-quantized files
  under the same names would change every byte count on this page.
