---
job: seed-learn-why-context-is-not-memory
verdict: approve
reasons: []
would-cite: >-
  Someone in a support thread telling a user to keep arguing with a chatbot
  that repeats a corrected mistake — this page settles that a correction
  appends rather than deletes, so edit-and-resend or a fresh conversation is
  the only true retraction.
reviewer: r7-fable
date: 2026-08-28
---

Checklist: education page (foundations). Sources fetched 2026-08-28.

- https://arxiv.org/abs/2307.03172: fetched; abstract says "performance is
  often highest when relevant information occurs at the beginning or end of
  the input context" and "significantly degrades when models must access
  relevant information in the middle of long contexts", "even for explicitly
  long-context models" — the page's summary, including the long-context
  clause, is verbatim-faithful.
- Internal links resolve: /wiki/concept/effective-context-length,
  /wiki/concept/kv-cache and /learn/how-inference-is-served all exist.
- Mechanism claims checked: attention weights normalised to sum to one (the
  dilution argument is stated as structural expectation, separate from the
  measured Lost-in-the-Middle result — correctly not conflated); KV-cache
  reuse requiring a byte-identical prefix and the append-cheap/edit-dear
  asymmetry are accurate; the date-at-top-of-prompt cache example follows.
- No perishable literals: read every line — no model names, no advertised
  window sizes, no products named. "Memory" features and prompt injection are
  described mechanically without naming a vendor.
- Prerequisite honest: everything used (flat token sequence, attention as the
  only cross-position operation, no revision of emitted text) is taught in
  how-a-language-model-works.
- Not independently verified: "retrieval that a keyword search would also
  solve survives long inputs" — a summary of the effective-context-length
  wiki page's benchmarks, delegated there by link rather than restated with
  numbers, which is the site's intended division of labour.

Clears the bar. On the most written-about topic in the ladder, the payload is
operational: you cannot un-say anything; a summary becomes the record
one-way; a memory feature is a file arriving in the same channel as your
message — which is also why prompt injection exists. Each section ends in
something the reader can predict with. Approve.
