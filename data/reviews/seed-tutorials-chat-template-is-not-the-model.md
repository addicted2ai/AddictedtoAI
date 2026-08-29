---
job: seed-tutorials-chat-template-is-not-the-model
verdict: revise
reasons: [false-or-unsupported-claim]
would-cite: >-
  Someone debugging why their local Llama 3.1 insists it is July 2024, or why
  two "identical" mirrors of one model behave differently — this page settles
  that the weight headers match hash-for-hash and the 348- vs 4,614-character
  chat template is the entire difference.
reviewer: r7-fable
date: 2026-08-28
---

Checklist: executed tutorial; evidence transcript at
data/reviews/evidence/tutorial-chat-template-is-not-the-model.md read in
full. Sources re-fetched 2026-08-28 (my own fetches, not the author's).

- https://huggingface.co/NousResearch/Meta-Llama-3.1-8B-Instruct (tokenizer_config.json):
  re-fetched today — chat_template is 348 chars, sha256 prefix
  b48c47f644389271, contains no "Cutting Knowledge Date", no date_string, no
  strftime_now. Matches the page exactly.
- unsloth/Meta-Llama-3.1-8B-Instruct: re-fetched — 4,614 chars, sha256 prefix
  e10ca381b1ccc5cf, contains "26 Jul 2024" and "Cutting Knowledge Date".
  Matches, including the stale-default-date finding.
- meta-llama/Llama-3.1-8B-Instruct: re-fetched — HTTP 401 with the exact
  quoted x-error-message. The page's "inferred from two independent
  repackagers agreeing" hedge is honest and necessary.
- Safetensors headers, shards 1 and 4, both mirrors: re-fetched — sizes
  4,976,698,672 / 1,168,138,808 B and header sha prefixes b858d3d845fa68f9 /
  bed1eb708f106718, identical across mirrors, matching the transcript.
- Executed/not-executed boundary: checked every claim against it. No model
  was loaded and no sentence measures model behaviour; "why a local Llama 3.1
  is confident about the wrong year... worth checking before the weights are
  blamed" stays on the right side by framing a hypothesis, and the boundary
  section names exactly what would need inference. The UTC-midnight
  discrepancy (transcript prints 2026-08-29, front matter says 2026-08-28) is
  disclosed explicitly in both the page and the evidence file, with the
  correct observation that nothing depends on which date is used. Honest, not
  confusing.
- Not independently verified: the GGUF-embedded template (4,614 chars, same
  sha) rests on the transcript — re-checking it needs the GGUF parser; the
  unsloth config match makes it credible. The render/traps token counts rest
  on the transcript; their internal arithmetic (41+1=42, 61−41=20 date-block
  tokens, 28/41=68%) is consistent throughout.

Two defects, one of which blocks:

1. **"Eight range requests, 33,856 bytes read" (after the weights.mjs
   transcript) is false by the page's own code.** weights.mjs loops 2 mirrors
   × 4 shards × 2 fetches = 16 range requests, and the bytes are 8×8 probe
   bytes + 2×(9512+12120+11656+560) header bytes = 67,760. No reading of the
   code produces 8 requests or 33,856 bytes (one mirror would be 8 requests,
   33,880 bytes). The evidence file repeats the error and its own
   parenthetical ("8 bytes + header, per shard, per mirror") contradicts its
   own total. Incidental to the finding, but it is a hand-written claim about
   what was executed, in a page whose authority is that everything was
   executed. Fix: "Sixteen range requests, 67,760 bytes read."
2. Minor, fix while in there: "the model receives a two-token sequence it
   never saw in training" asserts a fact about an unpublished training corpus.
   "a two-token opening no chat template is designed to produce" (or similar)
   keeps the point without the unverifiable claim.

Everything else on the page re-verified cleanly today, the transcripts
include the falsified draft claim (the strftime_now expectation the run
overturned — I confirmed strftime_now is genuinely absent from both fetched
templates), and the payload is real: mirrors ship different prompts around
identical weights, and the official template tells the model it is July 2024
unless told otherwise. One sentence of arithmetic stands between this and
approve. Revise.
