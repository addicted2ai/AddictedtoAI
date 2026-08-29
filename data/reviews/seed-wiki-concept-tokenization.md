---
job: seed-wiki-concept-tokenization
verdict: approve
reasons: []
would-cite: >-
  Someone posting a count-the-letters screenshot as proof models are stupid —
  this page settles that the character count is absent from the model's input
  by construction (the DeepSeek-V3 ten-trial citation), and gives the
  glitch-token mechanism, vocabulary slots trained on almost nothing, for the
  weirder failures.
reviewer: r4-fable
date: 2026-08-28
---

Checklist: wiki concept entry. Sources fetched 2026-08-28.

- arxiv.org/abs/1508.07909 + ar5iv — abstract verbatim: "subword models
  improve over a back-off dictionary baseline for the WMT 15 translation
  tasks English-German and English-Russian by 1.1 and 1.3 BLEU,
  respectively"; segmentation "based on the byte pair encoding compression
  algorithm"; the paper attributes BPE to Gage (1994), supporting the
  timeline's "a 1994 compression algorithm"; authors Sennrich, Haddow,
  Birch; v1 Mon, 31 Aug 2015, matching the timeline.
- greaterwrong.com/posts/aPeJE8bSo6rAFoLqg (SolidGoldMagikarp) — published
  5 Feb 2023, matching the timeline; 141 candidate anomalous tokens found by
  prompting over all 50,257 vocabulary entries, matching the fact; asked to
  repeat " SolidGoldMagikarp", davinci-instruct-beta returned "distribute";
  " StreamerBot" produced "You're a jerk." (the piece's "produced insults");
  nondeterminism at temperature zero is the post's own observation; the
  scraped-origins sentence verbatim ("look like they may have been scraped
  from backends of e-commerce sites, Reddit threads, log files from online
  gaming platforms"); the r/counting username origin confirmed.
- aclanthology.org/2024.emnlp-main.649 — both quotes verbatim: "The
  disconnect between tokenizer creation and model training in language
  models allows for specific inputs, such as the infamous SolidGoldMagikarp
  token, to induce unwanted model behaviour" and "'glitch tokens', tokens
  present in the tokenizer vocabulary but that are nearly or entirely absent
  during model training"; Land and Bartolo, EMNLP 2024.
- arxiv.org/abs/2405.05417 — same paper's preprint; v1 Wed, 8 May 2024,
  matching the timeline's automated-detection entry.
- arxiv.org/abs/2509.04664 — DeepSeek-V3 "returned '2' or '3' in ten
  independent trials" on how many Ds are in DEEPSEEK, verbatim in the paper.
- Not independently verified: nothing material; every decisive string was
  re-fetched today.

On the value shared with concept/hallucination (the DeepSeek-V3 letter
count): both entries bind the same primary-source fact for different
arguments and cross-mention each other — a deliberate cross-reference, not
restating; no change needed. The entry's frame — the vocabulary is a
frequency table frozen before the first gradient step, by a program that
never sees what the model will be asked to do — is the mechanism that makes
glitch tokens and letter-blindness one story instead of two curiosities, and
"the repair is deleting the entry" is a detail even close followers miss.
Approve.
