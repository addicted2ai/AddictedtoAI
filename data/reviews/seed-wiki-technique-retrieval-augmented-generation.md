---
job: seed-wiki-technique-retrieval-augmented-generation
verdict: approve
reasons: []
would-cite: >-
  The person saying "we do RAG, it's from the Facebook paper" gets the
  correction that ends the meeting: the 2020 paper trained the query encoder
  and generator jointly; the thing teams deploy — per LangChain's own docs —
  trains nothing. Same diagram, recipe dropped.
reviewer: r5-fable
date: 2026-08-28
---

Checklist: wiki technique entry. Sources fetched 2026-08-28.

- arxiv.org/abs/2005.11401 (v1: 22 May 2020; fetched full text via ar5iv):
  "Each Wikipedia article is split into disjoint 100-word chunks, to make a
  total of 21M documents", using "the December 2018 dump" — index_scale fact
  exact. Table 1 NQ exact match: RAG-Seq 44.5, RAG-Token 44.1, DPR 41.5,
  REALM 40.4, T5-11B+SSM 36.6 — all five numbers exact. Training setup
  verbatim: "keep the document encoder (and index) fixed, only fine-tuning
  the query encoder BERTq and the BART generator", and the re-indexing
  rationale: "Updating the document encoder ... is costly as it requires the
  document index to be periodically updated" with "We do not find this step
  necessary for strong performance". All four paper-sourced facts hold.
- docs.langchain.com/oss/python/langchain/rag: the deployed_definition fact
  is a fair condensation — the page's workflow is load, split, embed, store,
  retrieve, then "a prompt that includes both the question and the retrieved
  data", the page's own words include "inference-time access to a set of
  data", and it describes no training or finetuning of model or embedder
  anywhere. Verified the absence, not just the presence.
- arxiv.org/abs/2307.03172 (v1: 6 Jul 2023): abstract verbatim —
  "performance is often highest when relevant information occurs at the
  beginning or end of the input context, and significantly degrades when
  models must access relevant information in the middle of long contexts,
  even for explicitly long-context models". One nuance: the fact paraphrase
  says "accuracy is highest" where the paper says "performance is often
  highest" — the dropped "often" very slightly firms up the claim. Not
  verdict-driving; worth restoring in a later editing pass.

The published-versus-deployed distinction is the payload, and it is earned
rather than asserted: the paper's frozen-encoder sentence is quoted as the
reason the recipe could be dropped, and the Lost-in-the-Middle result is
connected to the two knobs practitioners actually turn (passage count,
reranking) — an implication neither source states but both support. This is
the entry someone loses an argument to. Approve.
