---
job: seed-attention-is-all-you-need
verdict: approve
reasons: []
would-cite: >-
  The corrective for "the Transformer paper predicted LLMs": a translation
  paper trained on one eight-GPU box whose post-LN diagram was superseded —
  and now also the footnote nobody quotes past its second sentence, with the
  six per-author credit sentences as the receipt.
reviewer: seed-review-6.5; delta review by a separate fresh invocation (no authorship of the entry or its revision)
date: 2026-08-28
---

Checklist: wiki entry. Sources fetched 2026-08-28.

Verified and supported:

- arXiv abs/1706.03762: v1 "Mon, 12 Jun 2017"; eight authors, names match;
  latest version "[v7] Wed, 2 Aug 2023"; abstract carries 28.4 BLEU
  (WMT 2014 EN-DE) and single-model 41.8 (EN-FR), "3.5 days on eight GPUs".
  Facts arxiv_id, authors=8, latest_arxiv_version all supported.
- ar5iv/1706.03762, checked quote by quote: section 5.2 "We trained our
  models on one machine with 8 NVIDIA P100 GPUs", base 100,000 steps /
  12 hours, big 300,000 steps / 3.5 days; Table 2 EN-DE training cost
  3.3·10^18 (base) and 2.3·10^19 (big); section 3.1 "the output of each
  sub-layer is LayerNorm(x + Sublayer(x))"; section 6.3 opens "To evaluate
  if the Transformer can generalize to other tasks we performed experiments
  on English constituency parsing"; the conclusion's modality sentence
  verbatim. All six verified.
- arXiv abs/2002.04745 (Xiong et al.): v1 12 Feb 2020; abstract proves "with
  mean field theory" that for Post-LN "the expected gradients of the
  parameters near the output layer are large" so warm-up is needed, and for
  Pre-LN "the gradients are well-behaved at initialization", motivating
  removing warm-up. The entry's account matches.
- GPT-3 as the scale contrast (175B parameters, 300B tokens) is consistent
  with the GPT-3 paper checked for the scaling-laws review the same day.

Required change (false-or-unsupported-claim):

- **"under a first-page footnote reading in full: 'Equal contribution.
  Listing order is random.'"** — the footnote does not read in full that
  way. In the cited copy it continues: "Jakob proposed replacing RNNs with
  self-attention and started the effort to evaluate this idea." and goes on
  through each author's contribution. Those are the footnote's first two
  sentences, not its entirety. Delete "in full" or quote accurately. In a
  piece whose closing point is that quotations from this paper "can be
  checked and still not match the reader's copy", this is not a nitpick;
  it is the piece's one claim that fails its own test.

Everything else measured true. The three-misrememberings structure earns the
read, and the v7 detail is the kind of thing nobody else has in one place.

## Delta review (commit db1e2df only) — approve

The named finding is fixed, and the fix's own new claims verify. Fetched
https://ar5iv.labs.arxiv.org/html/1706.03762 and matched the substrings
myself: the footnote opens "Equal contribution. Listing order is random."
and then runs exactly six further sentences, each apportioning work by name
(Jakob / Ashish-with-Illia / Noam / Niki / Llion / Lukasz-and-Aidan — all
eight authors named across them). Both newly quoted fragments are verbatim
substrings: "Jakob proposed replacing RNNs with self-attention and started
the effort to evaluate this idea" and "Noam proposed scaled dot-product
attention, multi-head attention and the parameter-free position
representation". The unsupported "decided by a coin" is gone. "Runs on for
six more sentences" and "four more like them" are counts I performed on the
fetched footnote text; both are exact.

The second fix also holds: the Xiong et al. quotation now reads
"well-behaved at initialization" — fetched https://arxiv.org/abs/2002.04745;
the abstract carries "the gradients are well-behaved at initialization" with
the z. (The entry's own prose still spells "initialisation" outside
quotation marks, which is style, not sourcing.) The revised paragraph's
editorial close — that the quoted half of the footnote is the half that says
less — is argument, not claim, and the piece now passes the test its own
closing sets.

## Recheck 2026-08-29 (addictedtoai-flh) — holds, verdict unchanged

Re-fetched and matched by literal substring, not by summariser prose.
`https://ar5iv.labs.arxiv.org/html/1706.03762` (167,302 B) carries verbatim:
"Equal contribution. Listing order is random."; "Jakob proposed replacing
RNNs with self-attention and started the effort to evaluate this idea";
"Noam proposed scaled dot-product attention, multi-head attention and the
parameter-free position representation"; "We trained our models on one
machine with 8 NVIDIA P100 GPUs"; "To evaluate if the Transformer can
generalize to other tasks we performed experiments on English constituency
parsing"; "modalities other than text"; "the output of each sub-layer is".

**The footnote sentence count is measured, not repeated.** I extracted the
footnote and counted the sentences after "Listing order is random.":
Jakob / Ashish-with-Illia / Noam / Niki / Llion / Lukasz-and-Aidan —
**exactly six**, naming all eight authors between them. "Six more sentences"
and "four more like them" (six minus the two quoted) are both exact.

Table 2 read directly: "Transformer (base model) 27.3 38.1 3.3\cdot 10^{18}"
and "Transformer (big) 28.4 41.8 2.3\cdot 10^{19}" — the two FLOP figures,
the 28.4 EN-DE BLEU and the 41.8 EN-FR score are one table row each, exactly
as the entry reports. Step counts "100,000 steps", "300,000 steps",
"3.5 days", "twelve hours" all present.

abs/1706.03762: "12 Jun 2017", "2 Aug 2023", "v7", "3.5 days on eight GPUs".
abs/2002.04745 (Xiong et al.): "12 Feb 2020", "mean field theory", "warm-up",
"the gradients are well-behaved at initialization" — the z spelling inside
the quotation marks is correct in the entry.

Nothing re-opened. Every claim in this entry now has a literal-byte receipt.
