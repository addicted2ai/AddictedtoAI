# Evidence — tutorial `model-file-header-range-requests`

Real-run transcripts backing every output shown in
`content/tutorials/model-file-header-range-requests.md`.

- **Date of run:** 2026-08-28
- **Where:** a scratch directory outside this repository
  (`…/scratchpad/fl-tut/gguf/`). No packages installed; the scripts use only
  Node built-ins and global `fetch`. Nothing was added to the site's
  `package.json`.
- **Machine:** Windows 10, Node `v24.13.0`.
- **Credentials:** none. Every request is unauthenticated.
- **Invocation note:** scripts were run by absolute path
  (`node <scratch>/gguf/header.mjs …`). They write their JSON output beside
  themselves via `import.meta.dirname`, so the absolute invocation and the
  `node header.mjs` form shown in the tutorial behave identically.

## 1. `probe.mjs` — what the server allows

```
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

A separate probe of `https://huggingface.co/api/models/meta-llama/Llama-3.1-8B-Instruct`
returned `200` with `gated:"manual"`, `private:false`, 17 siblings — the basis
for the tutorial's "public repository with gated files" claim. The same probe
returned `gated:false` for `NousResearch/…` and `unsloth/…`.

## 2. `header.mjs` — one file

```
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

**Self-consistency check performed on these numbers.**
`3,655,139,328 + 1,256,693,760 + 1,065,216 = 4,912,898,304`, and
`4,920,739,232 − 7,840,928 = 4,912,898,304`. The per-type byte sums account for
the file exactly, which is what licenses the tutorial's claim that tensors are
stored contiguously and that the measured bits-per-weight rates are not
approximations.

## 3. `quants.mjs` — eight quants

```
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

## 4. `policy.mjs` — the correction

The first draft of the tutorial asserted, from the `types (id:count)` column
alone, that `Q4_K_S` "keeps `attn_v` and `ffn_down` at Q5_K" and that `Q4_K_M`
"promotes those to Q6_K" — i.e. that the promotion applied to every layer. The
census counts (8 and 33, not 64 and 65) did not fit that story, so the check was
written and run:

```
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

The draft was wrong: the promotion is per layer, `Q4_K_S` touches only layers
0–3, and `Q4_K_M` touches 16 of 32 in an irregular pattern. The published text
reports the measured layer sets and deliberately makes no claim about the rule
that generates them, because no arithmetic stride reproduces the middle set and
none was verified against `llama.cpp` source.

## 5. `safetensors.mjs` and `compare.mjs`

```
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

```
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

`llama.rope.dimension_count` is 128 in the GGUF metadata above, and
`rope_freqs.weight` has 64 elements — half of it — which is the arithmetic
behind naming it as the rotary frequency table. The tutorial states that as the
identification of a named tensor with a known shape, not as a claim verified
against `llama.cpp` source.

## What was not executed

- No weights were downloaded and no model was loaded, so nothing here measures
  quality, perplexity or inference speed. Every statement is about file
  contents.
- Only one model family was read: Llama 3.1 8B, one GGUF repository
  (`bartowski/…`, repo sha `bf5b95e96dac0462e2a09145ec66cae9a3f12067`,
  lastModified 2024-12-01) and one safetensors mirror. No mixture-of-experts
  model, no multimodal projector, no other packager.
- The GGUF parser was not tested against a version other than 3, nor against a
  big-endian file, nor against a file using a `ggml_type` id outside the set
  seen here.
- `meta-llama`'s own repository was probed but never read; its 401 is recorded,
  its file contents are not known.
