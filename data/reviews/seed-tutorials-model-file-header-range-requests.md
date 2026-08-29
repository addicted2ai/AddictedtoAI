---
job: seed-tutorials-model-file-header-range-requests
verdict: approve
reasons: []
would-cite: >-
  Someone choosing between Q4_K_M and Q4_K_L on a VRAM budget — this page
  settles that the 390 MB gap is exactly the embedding and output head moving
  to Q8_0 and nothing else, measured from headers without downloading a byte
  of weights.
reviewer: r7-fable
date: 2026-08-28
---

Checklist: executed tutorial; evidence transcript at
data/reviews/evidence/tutorial-model-file-header-range-requests.md read in
full. Sources re-fetched 2026-08-28 (my own fetches).

- All eight quant files re-fetched by HEAD today: content-lengths match the
  table to the byte (IQ2_M 2,948,285,856 ... Q8_0 8,540,775,840), and
  accept-ranges: bytes holds on every one.
- https://huggingface.co/api/models/meta-llama/Llama-3.1-8B-Instruct:
  re-fetched — gated:"manual", private:false, 17 siblings; the weights answer
  401 with the exact quoted message. "Public repository with gated files"
  verified.
- api/models/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF: re-fetched — repo sha
  bf5b95e96dac0462e2a09145ec66cae9a3f12067, lastModified 2024-12-01, exactly
  as the front matter and the closing caveat record.
- Safetensors: shard-1 and shard-4 headers re-fetched from both mirrors —
  first 8 bytes decode to header lengths 9512 / 560 and header sha prefixes
  b858d3d845fa68f9 / bed1eb708f106718, matching the transcript; total size
  4,976,698,672 confirms the 0x2528=9,512 worked example.
- Arithmetic re-done independently: per-type byte sums equal file minus
  header exactly (3,655,139,328 + 1,256,693,760 + 1,065,216 = 4,912,898,304 =
  4,920,739,232 − 7,840,928); measured rates equal the known block layouts
  (144×8/256 = 4.5000, 210×8/256 = 6.5625, Q8_0 34 B/32 w = 8.5); overall
  4.8944 bpw checks; the eight quant file sizes sum to 40,207,183,104 and
  12 × 7,864,320 = 94,371,840, so even the page's own traffic accounting is
  right. 8,030,261,312 − 8,030,261,248 = 64 = rope dimension 128/2.
- Executed/not-executed boundary: exemplary. No model loaded, and the page
  says so; "whether it is any good is a different question and not one this
  page measures" (IQ2_M) is the discipline the brief asks for. The
  contiguity assumption is named and then *checked* by the byte-sum identity
  rather than asserted. The evidence file documents a wrong draft claim (the
  promotion applied to every layer) that policy.mjs was written to falsify —
  the correction is in the published text as the measured layer sets, with
  the generating rule explicitly left unclaimed.
- Not independently verified: the GGUF metadata listing and tensor census
  rest on the transcript (re-deriving them needs the 126-line parser against
  7.8 MB per file); the rope_freqs identification is arithmetic-supported but
  not checked against llama.cpp source, and the evidence file says so.

Clears the bar with room to spare. The payload stack is deep: a "4-bit" file
measured at 4.8944 bpw; two quants indistinguishable by their own
general.file_type field; the irregular sixteen-layer promotion set no stride
generates; the quantizer's own filesystem paths sitting in the metadata. The
strongest piece in this slice — every number re-checked today reproduced.
Approve.
