---
job: seed-model-moonshotai-kimi-k2-5
verdict: approve
reasons: []
would-cite: >-
  Anyone arguing about model longevity would cite the 216-day vendor-hosted
  life of a trillion-parameter flagship; and the closing distinction — an
  open-weight sunset withdraws one company's hosting while a closed one
  withdraws the artefact from everyone — is the paragraph to paste into any
  deprecation-risk argument about building on closed APIs.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content)
date: 2026-08-28
---

Checklist: wiki entry. Sources fetched, catalog claims measured against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows).

**Verified by fetching:**
- platform.kimi.ai/docs/models — the body's quotation is verbatim on the
  page: "Following the Kimi K3 launch, kimi-k2.5 and the moonshot-v1 series
  are no longer available to newly registered users (full platform sunset
  on August 31)", with migration pointed at kimi-k3.
- huggingface.co/moonshotai/Kimi-K2.5 — "Both the code repository and the
  model weights are released under the Modified MIT License"; Total
  Parameters 1T, Activated Parameters 32B. License and parameters facts
  both supported.
- siliconangle.com 2026/01/27 — confirms the 27 January 2026 release, the
  1T-parameter MoE, training on 15 trillion tokens including multimodal
  data, and "achieved the highest score on HLE-Full" — supporting "topped
  the HLE-Full evaluation on the day it launched".

**Verified by measurement:**
- The census claim is exact: 388 rows in the snapshot, and exactly eight
  carry a non-null expiration_date (listed: dots-studio preview,
  kimi-k2.5, and six z-ai rows). "Almost none do" is measured.
- `kimi-k2.5` expiration_date 2026-08-31 — transcluded from the feed, not a
  literal.
- Date arithmetic checked by hand: 2026-01-27 → 2026-08-31 is 216 days;
  2026-01-27 → 2026-07-16 (`kimi-k3` created, in the snapshot) is 170 days.
  Both figures exact.
- Transclusions resolve; status deprecated with a living feed binding is
  the right shape for a sunsetting row; aliases sane.

The piece passes the prose-beyond-data test cleanly: the row shows a date,
and the body explains what kind of death that date is — which no field in
the row says. Approve.

## Recheck 2026-08-29 (addictedtoai-flh) — one superlative corrected

**Corrected: "topped the HLE-Full evaluation on the day it launched" →
"topped the tool-using HLE-Full evaluation — though not the plain one — on
the day it launched".**

Round one verified this against siliconangle.com and stopped. Re-fetched
that page (176,052 bytes); what it actually says is:

> The company says that its model achieved the highest score on HLE-Full,
> one of the industry's most difficult LLM evaluations.

"The company says" — a secondary source reporting a vendor assertion, which
is precisely the sourcing shape this pass was told to distrust. So I went to
the vendor's own document. Fetched the model card
(https://huggingface.co/moonshotai/Kimi-K2.5, 660,324 bytes); its Evaluation
Results table has two HLE rows, and they do not say the same thing:

| Benchmark | Kimi K2.5 (Thinking) | GPT-5.2 (xhigh) | Claude 4.5 Opus | Gemini 3 Pro | DeepSeek V3.2 |
|---|---|---|---|---|---|
| HLE-Full | **30.1** | 34.5 | 30.8 | **37.5** | 25.1† |
| HLE-Full (w/ tools) | **50.2** | 45.5 | 43.2 | 45.8 | 40.8† |

On plain HLE-Full, Kimi K2.5 is **fourth of the five models the vendor chose
to compare itself against**. It leads only the tool-using row.

The obvious objection is that the card may have been revised since launch,
which would make a current card no evidence about a launch-day claim. Ruled
out by reading the commit history and fetching the README at the last
launch-day revision, `9659d5d` (27 Jan 2026, 34,104 bytes): the table is
byte-identical on both rows — `HLE-Full` 30.1 / 34.5 / 30.8 / 37.5 / 25.1†
and `HLE-Full(w/ tools)` 50.2 / 45.5 / 43.2 / 45.8 / 40.8†. The claim was
wrong on the day, not overtaken later.

**The licence claim — the one this pass was most worried about — holds, and
holds against the primary document rather than a card summary.** Fetched
https://huggingface.co/moonshotai/Kimi-K2.5/raw/main/LICENSE (1,465 bytes)
and read the whole file. Its first line is literally `Modified MIT License`;
it is MIT verbatim plus one added paragraph:

> Our only modification part is that, if the Software (or any derivative
> works thereof) is used for any of your commercial products or services
> that have more than 100 million monthly active users, or more than 20
> million US dollars (or equivalent in other currencies) in monthly revenue,
> you shall prominently display "Kimi K2.5" on the user interface of such
> product or service.

An attribution trigger, not a revenue share — worth stating explicitly,
because the sibling entry `org/moonshot-ai` is what put this whole pass on
the calendar by asserting a "30% revenue share" that appears nowhere in the
K3 licence. This one got it right. The card's own sentence, "Both the code
repository and the model weights are released under the Modified MIT
License", matched literally at offset 70,360 of the rendered page, so
"code and weights" in the fact is supported too.

**Other claims re-verified:**
- Model card: "approximately 15 trillion mixed visual and text tokens" (the
  body's "15 trillion tokens of mixed image and text"); "Total Parameters
  1T", "Activated Parameters 32B" (the `parameters` fact).
- platform.kimi.ai/docs/models (261,334 bytes): the body's block quote is
  verbatim — "Following the Kimi K3 launch, kimi-k2.5 and the moonshot-v1
  series are no longer available to newly registered users (full platform
  sunset on August 31)" — and `kimi-k3` is the named migration target.
- Date arithmetic re-measured, not re-copied: 2026-01-27 → 2026-08-31 = 216
  days; 2026-01-27 → 2026-07-16 = 170 days. Both exact. `kimi-k3`'s created
  timestamp in the snapshot resolves to 2026-07-16.

**One thing the body will need watching, filed rather than corrected.** The
census sentence — "Of the 388 rows in the OpenRouter snapshot of 28 August
2026, eight carry a non-null `expiration_date`" — is exactly true of the
snapshot it names: `data/sources/openrouter-models/previous.json` is dated
2026-08-28, has `row_count` 388, and holds exactly eight non-null
`expiration_date` rows (dots-studio preview, kimi-k2.5, and six z-ai). But
the live snapshot has already moved past it: `latest.json` is dated
2026-08-29 with 396 rows and **seven** such rows — `z-ai/glm-4.5v` left the
catalog overnight. The sentence is not wrong, because it binds itself to a
dated snapshot; it is a hand-typed census of a feed that changes daily, and
it will read as stale long before it reads as false. Not corrected here
because correcting it to today's numbers just restarts the same clock; filed
as its own issue for a durable fix.
