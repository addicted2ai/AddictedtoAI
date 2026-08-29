---
job: seed-impossible-routine-google-proof-questions
verdict: approve
reasons: []
would-cite: >-
  Someone claiming benchmark gains are just contamination from a searchable
  web: GPQA was built so that skilled non-experts with unrestricted search got
  34%, and a downloadable-weights model still went from GPT-4's 39% to 71.5%
  on the hardest split in fourteen months.
reviewer: r2-opus
date: 2026-08-28
---

Checklist: Impossible-to-Routine delta, both ends primary preprints.
Sources fetched 2026-08-28.

- https://arxiv.org/abs/2311.12022: all three of the delta's end-A numbers are
  the paper's own abstract figures — domain expert PhDs 65%, skilled
  non-experts with full web access 34% after 30+ minutes of search, strongest
  GPT-4 baseline 39%. 448 questions across biology, physics and chemistry.
  Submission history gives v1 Mon, 20 Nov 2023 — front-matter date exact.
- https://arxiv.org/html/2501.12948v1: DeepSeek-R1 at 71.5% pass@1 on GPQA
  Diamond, confirmed in Table 4; the metric name pass@1 matches the delta's
  metric field. Open weights confirmed verbatim in the abstract: "we
  open-source DeepSeek-R1-Zero, DeepSeek-R1, and six dense models (1.5B, 7B,
  8B, 14B, 32B, 70B)". v1 dated 22 Jan 2025, matching the front matter.
- Split mismatch checked directly, because it decides the verdict. End A's
  39% is the abstract's headline for the full set; end B is Diamond. Fetched
  the paper's Table 5 to see whether that inflates the span: GPT-4 few-shot
  CoT scores 39.7% on the main set, 38.8% on Diamond, 38.7% extended. The
  model-to-model span the delta is actually about is therefore effectively
  Diamond-to-Diamond (38.8% to 71.5%) and is not an artifact of the split.
- Caveat recorded so a later pass does not misread the layout: Table 5 gives
  expert accuracy on Diamond as 81.2%, not 65%, so the adjacency of "PhD
  experts 65%" and "71.5%" in the metric fields invites a "beats PhDs"
  inference that Diamond does not support. Not charged as a defect — the paper
  itself asterisks 81.2% for selection effects, since Diamond is defined as
  questions experts answered correctly, which makes the full-set 65% the more
  honest human baseline to quote. The delta also labels Diamond "the
  benchmark's hardest split" in prose, so the difference is disclosed.

Clears the bar. The payload is the construction of the benchmark rather than
the score: 34% for skilled humans *with* the web is the number that makes
"Google-proof" a measurement instead of a slogan, and it is the fact most
people repeating the GPQA headline cannot cite. Approve.
