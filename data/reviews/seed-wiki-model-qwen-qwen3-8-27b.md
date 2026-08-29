---
job: seed-wiki-model-qwen-qwen3-8-27b
verdict: reject
reasons:
  - false-or-unsupported-claim
  - overclaiming-summary
would-cite: >-
  Someone arguing that Alibaba's open Qwen releases trail its closed flagship
  on capability needs the open Qwen3.8-2.4T-A95B row scoring 57.7 against
  Max's 58.1 — and this page, which omits that row entirely, would lose them
  the argument rather than settle it.
reviewer: r9-opus
date: 2026-08-28
---

Checklist: wiki model entry. Sources fetched 2026-08-28; catalog claims
measured against `data/sources/openrouter-models/latest.json` (2026-08-28,
388 rows).

**Verified by fetching:**

- huggingface.co/Qwen/Qwen3.8-27B — license reads "apache-2.0" and the card
  states "27B". Both cited facts supported.
- The quoted self-description appears verbatim, but **not about this model**.
  The full sentence is: "Following the widespread community adoption of the
  Qwen3.5 and Qwen3.6 series, we are pleased to introduce **Qwen3.8, the most
  capable generation in the Qwen open-model family to date**." The subject of
  the superlative is the *generation*, not the 27B row.

**The load-bearing defect.** The body converts that generation-level claim
into a row-level one: "the open model **Alibaba calls its most capable open
release**". Alibaba does not call this row that. The card's claim is about
Qwen3.8 as a generation, and the piece's closing verdict — that the model
Alibaba calls its most capable open release is not the one that tops the
scoreboard — is an argument against a claim the source never made.

**The omitted row that decides the question.** The piece frames the tension as
open-versus-closed: this open row scores 52.0, the closed `qwen/qwen3.8-max`
scores 58.1, so the open model does not top the family. But the same snapshot
holds `qwen/qwen3.8-2.4t-a95b` — created 2026-08-12, `hugging_face_id`
"Qwen/Qwen3.8-2.4T-A95B", intelligence index **57.7**. It is open by the very
test this piece applies to Max, it is in the same generation, and it beats
this row by 5.7 points. Under either reading the piece fails: read at row
level, the card's superlative is falsified by an open sibling the piece never
mentions; read at generation level, the open/closed gap is 0.4 points and the
piece's whole framing evaporates. `content/wiki/org/alibaba-cloud.md` already
describes that row at length as "the open-weight variant of Qwen3.8 Max", so
the decisive fact was one adjacent page away.

**Verified and true:**

- "Eleven days earlier" — `qwen3.8-max` created 2026-08-03, this row
  2026-08-14. Exactly 11 days.
- "`qwen/qwen3.8-max` ... carries no Hugging Face listing in the catalog's
  feed at all" — measured, `hugging_face_id` is null. True.
- Prices 4.25e-7 against Max's 2e-6; index gap 6.1 points ("a handful"). True.
- Apache-2.0 carrying "no field-of-use or user-count clause" — correct.
- `org/alibaba-cloud#weights_license` resolves; all nine transclusions resolve.

**Not independently verified:** whether `qwen3.8-2.4t-a95b`'s weights are
actually published under a permissive licence — I confirmed only that the feed
carries a Hugging Face id for it, which is the same evidence the piece itself
uses to classify rows as open or closed.

The piece is accurate about prices and dates and wrong about the only thing it
exists to argue. Fixing it means dropping the misattributed superlative,
adding the open row that outscores this one, and inverting the conclusion —
the honest version of this page says Alibaba's open flagship variant lands
within half a point of its closed one, which is a better story and a different
page. Reject.
