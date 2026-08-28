---
job: seed-browser-embeddings-no-server
verdict: approve
reasons: []
would-cite: >-
  A developer arguing semantic search can run entirely client-side — a
  walkthrough with measured payload sizes, the import-map fix, and the one
  line that decides whether jsdelivr appears in your CSP.
reviewer: seed-review-6.5
date: 2026-08-28
---

Checklist: tutorial. Evidence transcript at
data/reviews/evidence/tutorial-browser-embeddings-no-server.md, compared
block by block against the published page, plus independent live checks.

- **Execution evidence**: the transcript is a real-run record, and every
  output block in the tutorial matches it exactly — the npm install line
  ("added 49 packages in 14s", 382 MB), the vendoring output and all five
  file sizes (1,099,109 / 12,942,611 / 14,555,814 / 23,567,050 /
  26,101,073), the import-map failure text, the full section-6 page output
  including all six similarity scores in order (0.540 / 0.265 / 0.186 /
  0.181 / 0.092 / -0.025), crossOriginIsolated=true, hardwareConcurrency=6,
  the MIME-type fallback console errors, and the wasmPaths origin
  comparison. Nothing shown is unbacked; the evidence even records that the
  vendor script originally copied 8 files and gained the ninth after the
  import-map failure — the transcript has the texture of a real session.
- **Author's drafted-wrong-claims corrected**: the evidence records that a
  draft claimed browsers refuse a wrong wasm MIME type; the measurement
  showed warn-and-fall-back, and the published text carries the measured
  version (two console errors, ArrayBuffer instantiation, identical
  output). Confirmed: the tutorial states the measured behavior, not the
  guess.
- **Independent re-checks run today (2026-08-28)**: npm registry —
  @huggingface/transformers latest is 4.2.0 and its dependencies pin
  onnxruntime-web 1.26.0-dev.20260416-b7804b056c exactly as claimed;
  onnxruntime-web dist-tags show latest 1.29.0, matching the "trails
  latest" claim. Hugging Face API — Xenova/all-MiniLM-L6-v2 main sha is
  751bff37182d3f1213fa05d7196b954e230abad9 (matches the pinned-commit
  claim), lastModified 2025-07-22 (matches verified_against), and
  onnx/model_quantized.onnx is HTTP 200 at exactly 22,972,370 bytes, among
  exactly the eight ONNX variants the tutorial lists. 22,972,370 / 1,048,576
  = 21.9 — the MB reconciliation is right.
- **Front matter complete and honest**: subjects (tool/transformers-js,
  tool/onnx-runtime-web, model/all-minilm-l6-v2 — all resolve to wiki
  entries), verified_against per subject with exact versions,
  verified_on 2026-08-28 (the transcript's date — honest), reverify_days 30
  (right for a fast-moving library).
- **Unexecuted steps disclosed**: WebGPU path, other browsers, timing
  variance — all named in a visible section, with the useful admission that
  no number describes GPU performance.
- The "what will break this first" section names the actual perishables.
  This is what a tutorial built against silent staleness looks like.

Approve.
