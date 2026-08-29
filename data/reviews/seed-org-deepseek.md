---
job: seed-org-deepseek
verdict: approve
reasons: []
would-cite: >-
  Anyone pricing an agent workload cites the three-vendor comparison — a
  1.3-point intelligence-index spread against a 41x input-price spread in a
  single dated snapshot — plus the 13B-active-of-284B mechanism that makes
  the floor price structural rather than a subsidy; Willison's hedged
  one-liner is the quotable summary.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content); delta review by a separate fresh invocation (no authorship of the entry or its revision)
date: 2026-08-28
---

Checklist: wiki entry. Sources fetched, catalog claims measured against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows).

**Verified by fetching:**
- huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731 — exists, "This
  repository and the model weights are licensed under the MIT License."
- en.wikipedia.org/wiki/DeepSeek — confirms founded 2023-07-17, Hangzhou,
  High-Flyer ownership, MIT since January 2025, V4-Flash 284B / V4-Pro 1.6T
  with one-million-token windows, V4 preview 24 April 2026, V4-Pro released
  13 August.
- simonwillison.net/2026/Jul/31/deepseek-v4-flash-0731/ — fetched; see the
  required change below.

**Verified by measurement:**
- `deepseek/deepseek-v4-flash-0731` created 2026-07-31, input 0.00000006,
  II 51.8; `openai/gpt-5.4` II 53.1 at 0.0000025; `google/gemini-3.5-flash`
  II 52 at 0.0000015. Spread 1.3 points; price spread 41x input — "more
  than an order of magnitude" holds with room.
- The OpenRouter row description reads "284B total parameters and 13B
  activated parameters, supporting a 1M-token context window" — the body's
  paraphrase is exact.
- Preview rows `deepseek-v4-flash` and `deepseek-v4-pro` both created
  2026-04-24 — the preview date is in the catalog too.
- Transclusions resolve; volatile values feed-bound; aliases sane.

**Required change (the revise):**
1. `false-or-unsupported-claim` — the Simon Willison quotation. The body
   renders it as: called the release "currently the best
   value-per-intelligence model out there." The post's actual sentence is:
   "…means this **may currently be** the best value-per-intelligence model
   out there." The quotation drops the modal and turns a hedged assessment
   into a flat assertion attributed to a named person. Requote with the
   hedge intact ("may currently be the best value-per-intelligence model
   out there") or paraphrase without quotation marks.

One small note, not part of the verdict: the Pro release is dated 13 August
(per Wikipedia, correctly cited) while the catalog row `deepseek-v4-pro-0813`
was created 2026-08-12; the body's "for Pro on 13 August" rests on the cited
source, so it stands, but the one-day divergence between announcement date
and listing date is worth knowing if the sentence is ever re-anchored to the
catalog.

Otherwise a sharp piece that clears the bar: the price-floor framing is an
assembled comparison no single vendor page shows.

## Delta review (commit 6ba8b3b only) — approve

The one named finding is fixed. Fetched
https://simonwillison.net/2026/Jul/31/deepseek-v4-flash-0731/ and matched
the substring myself: the post's sentence reads "It's $0.14/million input
and $0.27/million output pricing means this may currently be the best
value-per-intelligence model out there." The entry now quotes "may currently
be the best value-per-intelligence model out there" — hedge intact — and its
lead-in ("wrote that the release's pricing means this") mirrors the source's
own construction instead of flattening a hedged assessment into a flat one.
Nothing else in the piece changed; no new claim was introduced.

## Recheck 2026-08-29 (wave addictedtoai-flh) — approve stands

Re-examined because this entry was approved in the earlier seed round, which
the 2026-08-29 seed wave never revisited, and because that round's one
demonstrated failure was a **licence claim** (`org/moonshot-ai` asserted a
"30% revenue share" clause that does not exist in the licence). This entry
makes a licence claim of exactly that shape, so it was checked against the
primary document rather than the model card or Wikipedia.

**The licence claim holds, checked against the licence itself.** Fetched
`https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731/raw/main/LICENSE`
— HTTP 200, **1,084 bytes**, the unmodified MIT License text, opening
`MIT License` / `Copyright (c) 2023 DeepSeek` and containing verbatim
"Permission is hereby granted, free of charge, to any person obtaining a copy
of this software ... to deal in the Software **without restriction**,
including without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or **sell** copies of the Software". Byte counts
over those 1,084 bytes: the `%` character appears **0 times**, and the strings
`revenue`, `Revenue`, `threshold`, `commercial`, `Commercial`, `monthly`,
`users` and `share` are each absent. The entry's "weights, commercial use, no
threshold clause" is therefore exactly right on all three counts. The model
card carries "This repository and the model weights are licensed under the MIT
License." verbatim, and the repo metadata names `licenseFilePath: "LICENSE"`,
so "weights" is anchored too.

**Everything else re-verified.** Wikipedia (fetched, 780,179 bytes) carries
verbatim: "Founded 17 July 2023"; "Headquarters Hangzhou , Zhejiang , China";
"Owner High-Flyer"; "In January 2025, DeepSeek released the DeepSeek-R1 model
under the MIT License"; "The model was made open-weights under the DeepSeek
License, which includes restrictions like open and responsible downstream
usage" and "source-available DeepSeek License" (the entry's "proprietary
DeepSeek License" is a defensible reading of a non-OSI, use-restricted
licence, not a defect); "On 24 April 2026, DeepSeek released a preview of its
V4 series, including the 284-billion parameter DeepSeek-V4-Flash and the
1.6-trillion parameter DeepSeek-V4-Pro. Both feature a one million token
context window , under the MIT License." and "The official versions of
DeepSeek V4-Flash and V4-Pro were released on 31 July and 13 August,
respectively." Every one of the five cited facts and both timeline rows are
supported.

Simon Willison's post re-fetched (18,125 bytes): "may currently be the best
value-per-intelligence model out there" matches as a raw substring, hedge
intact, exactly as the delta review recorded.

The OpenRouter row's own description, read out of the committed
`data/sources/openrouter-models/latest.json` (2026-08-29), reads "sparse
mixture-of-experts model from DeepSeek, with 13B active parameters out of 284B
total" — the body's paraphrase is exact.

The two prose claims that reason *over* feed-bound values were re-measured
against that same later snapshot, and both still hold with room:
`deepseek/deepseek-v4-flash-0731` II 51.8 at 0.045/Mtok input,
`openai/gpt-5.4` II 53.1 at 2.50, `google/gemini-3.5-flash` II 52.0 at 1.50 —
a 1.3-point spread ("within about a point and a half") against a 55.6x input
price spread ("more than an order of magnitude"). Note for a later pass: the
flash row's input price has moved from 0.06 to 0.045/Mtok since the round-one
measurement, which widens the price gap rather than narrowing it, so the prose
is not at risk from that direction.
