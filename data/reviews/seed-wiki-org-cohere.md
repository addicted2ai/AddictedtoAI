---
job: seed-wiki-org-cohere
verdict: approve
reasons: []
would-cite: >-
  Arguing that a vendor's compliance posture shows up in public API metadata:
  91 of 388 OpenRouter rows carry is_moderated across eight prefixes, and of
  every vendor with five or more rows exactly two have it on all of them —
  Cohere and Amazon.
reviewer: rr3b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Every census re-run by
script against `data/sources/openrouter-models/latest.json` (2026-08-28, 388
rows); sources fetched 2026-08-29 and matched by literal substring against raw
bytes.

Recomputed, all exact:
- `command-r-plus-08-2024` (created 2024-08-30) and `command-a` (2025-03-13) both
  price 0.0000025 in / 0.00001 out — identical to the digit. 30 Aug 2024 to 13
  Mar 2025 is 195 days, "six and a half months". Context 128,000 to 256,000 is
  exactly double.
- 13 Mar 2025 to 17 Jun 2026 is 15 months and 4 days, with no Cohere row created
  in between — "fifteen months of nothing" holds.
- `north-mini-code:free` is the only Cohere row priced 0/0, the only coding
  model, and the only North row.
- **The moderation census, every clause of it.** Rows with
  `top_provider.is_moderated === true`: **91** of 388. Distinct provider prefixes
  among them: **8** — amazon, anthropic, cohere, meta, openai, writer,
  ~anthropic, ~openai. Vendors with five or more rows flagged on every single
  one: **exactly two** — cohere 5/5 and amazon 5/5. "The other is Amazon" is
  right. The ≥5 threshold does real work (~anthropic is 4/4 and writer 1/1, both
  excluded by it), but the entry states the threshold in the sentence, so it is
  a stated criterion rather than a hidden one.

Fetched and matched:
- en.wikipedia.org/wiki/Cohere — founders, Toronto HQ and the five markets all
  verbatim; "increasing its valuation to approximately $7 billion" in the
  September 2025 paragraph; "In February 2026, CNBC reported Cohere's revenue as
  $240 million", and the infobox literally carries `"revenue":"$240M (February
  2026)"`. **Trap checked rather than assumed:** the same page also says "In
  December 2024, Cohere received $240 million in public funding from the Canadian
  government" — a coincidental collision of the same number with a different
  meaning. The entry's `revenue` fact is not that figure. Also verbatim: "On
  April 24, Cohere and Aleph Alpha announced that a merger would go through",
  "an anonymous individual told New York Times it would make the combined
  companies worth $20 billion", and "$600 million in investment to Cohere from
  Schwarz Gruppe".
- huggingface.co/CohereLabs/North-Mini-Code-1.0 — "Developed by: Cohere and
  Cohere Labs", "License: Apache 2.0", "Model Size: 30B total; 3B active", and
  "The feed-forward block is an MoE block with 128 experts, of which 8 are
  activated per token".
- openrouter.ai/cohere/north-mini-code:free — "North Mini Code is Cohere's first
  agentic coding model and the debut of its North family. A sparse
  mixture-of-experts model with 30B total parameters and 3B active", which is
  where the entry's mixture-of-experts phrasing comes from, verbatim.
- openrouter.ai/cohere/command-a — "Command A is an open-weights 111B parameter
  model with a 256k context window".

**One false claim, and it needs correcting before anyone cites this page.**
"and, unlike its predecessor, came with downloadable weights". Command R+
08-2024 is itself an open-weights model. Its Hugging Face card states verbatim:
"Cohere Labs Command R+ 08-2024 is an open weights research release of a 104B
billion parameter model", tagged `license:cc-by-nc-4.0` with safetensors and a
Files-and-versions tab — hosted on the very `CohereForAI` account this entry
names two paragraphs later. The likely origin is that OpenRouter's row for
`cohere/command-r-plus-08-2024` has `hugging_face_id: null` while command-a's is
populated; an empty metadata field is not the absence of open weights. The
paragraph's closing tricolon inherits it, presenting "weights included" as the
differentiator when both models ship weights. **The fix is deleting three words,
"unlike its predecessor,"** — the rest of the sentence, and "weights included" as
a plain statement about Command A, are both true. The real deltas between the two
rows are 104B to 111B and 128k to 256k.

Round 1 (r6-fable) found: "anonymous sources valued the combined entity at twenty
billion dollars" pluralising a single source (`false-or-unsupported-claim`) —
**fixed**, now "one anonymous individual told the New York Times", matching
Wikipedia's wording; and a non-blocking note that the 2026-06-17 timeline entry
cited the Hugging Face card for "first free row and first agentic coding model",
which that card does not say — **fixed**, the entry now cites the OpenRouter
listing and claims only what that listing carries verbatim.

**A round-1 observation I now believe seeded the surviving error.** r6 wrote,
approvingly, "command-a carries HF id CohereForAI/c4ai-command-a-03-2025, the
predecessor none." That is a correct statement about the feed and an incorrect
basis for any claim about open weights, and nobody in round 1 checked the
predecessor's model card. I did; it is open-weights. Flagging this so the
correction is not reverted by a later pass reading the same null field.

**Which kind of failure this is: one fixable clause, not a failed claim.** The
entry's thesis — the list price did not move while the product did — survives
intact, as does everything in the second half, and the moderation census is the
most citable derived artifact I verified tonight: four separate numbers, all
exact. Binning that prose over three removable words would be the wrong trade, so
this approves with the correction recorded above in terms specific enough to
apply without re-deriving it.

---

## Recheck 2026-08-29 — the two-namespace contrast was false, corrected

Raised as `addictedtoai-sti` by an agent repointing citations on a neighbouring
entry. Its conclusion was right and its stated mechanism was not, so the
correction below rests on a direct measurement rather than on the report.

**What the entry said.** North-Mini-Code was published "at CohereLabs/… — a
different Hugging Face namespace from the `CohereForAI` account that still
hosts Command A", concluding that Cohere "re-entered the public catalog with a
free agentic coding model on a new account."

**The issue's mechanism, which does not hold.** It reported CohereLabs as
CohereForAI renamed, so that no two-account contrast exists. Measured, both org
pages return HTTP 200 and neither names the other:

    huggingface.co/CohereForAI   200   75,174 B   "CohereLabs"  x0
    huggingface.co/CohereLabs    200  490,177 B   "CohereForAI" x0

A renamed org serving a soft redirect would not answer with a page that never
mentions its new name. So "the same account renamed" is not established, and
rewriting the entry to say so would have replaced one unsupported claim with
another.

**What is measurable, and what actually falsifies the sentence.** The Hugging
Face API answers the ownership question directly:

    api/models?author=CohereForAI   count = 0
    api/models?author=CohereLabs    count = 49   (incl. Command A)
    CohereForAI/c4ai-command-a-03-2025 -> 307 -> /CohereLabs/c4ai-command-a-03-2025
    Command A card: "CohereLabs" x76 · "Cohere Labs" x22 · "CohereForAI" x0 · "formerly" x0

`CohereForAI` hosts **nothing**. The claim that it "still hosts Command A" is
false however the move is characterised, and both models the sentence contrasts
now live in one namespace — so the contrast is not available at all, and the
conclusion resting on it ("on a new account") goes with it.

**The correction.** The namespace clause now says CohereLabs is the same
namespace that carries Command A, which moved there from `CohereForAI` — the
observable fact, stated without asserting whether the move was a rename or a
migration, because that is not established and nothing in the paragraph needs
it. The closing phrase drops "on a new account" for "given away", which is what
the paragraph was actually about: a company selling into the enterprise market
publishing a free model.

The entry's thesis is untouched. Verdict stands.
