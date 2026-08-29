---
job: seed-wiki-model-x-ai-grok-4-6
verdict: approve
reasons: []
would-cite: >-
  Someone dating the end of optional reasoning on Grok to the 4.6 release:
  grok-4.5 already reads mandatory true at high effort five weeks earlier, and
  the only reasoning change at 4.6 is an added xhigh tier — this page now makes
  that correction its subject instead of its error.
reviewer: rr5b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Claims re-derived
2026-08-29 from `data/sources/openrouter-models/latest.json` (2026-08-28, 388
rows), with every x-ai row enumerated.

- The opening comparison, anchored in the page to the 28 August 2026 snapshot:
  grok-4.5 and grok-4.6 both list `context_length` 500000, `pricing.prompt`
  0.000002 and `pricing.completion` 0.000006. Identical on all three, so "moved
  the scoreboard without moving anything a buyer pays for" holds. Their
  `max_completion_tokens` also match at 450000.
- Intelligence index 55.8 → 60.9; this row's coding index 76.8 and agentic
  index 58.7. grok-4.5 created 2026-07-08, grok-4.6 2026-08-12 — 35 days, so
  "five weeks later" is exact.
- grok-4.3: `context_length` 1000000, `pricing.prompt` 0.00000125,
  `reasoning.mandatory` false, `default_effort` "low". This row: true, "high".
  All four transclude correctly.
- "The only reasoning difference left between the two is an extra `xhigh`
  effort tier": I compared the full reasoning objects. 4.5 is
  `{default_effort:"high", default_enabled:true, mandatory:true,
  supported_efforts:["high","medium","low"]}`; 4.6 is identical but for
  `supported_efforts:["xhigh","high","medium","low"]`. The claim is exact, and
  correctly scoped to reasoning — the rows also differ in `supported_parameters`
  (4.6 adds `stop` and `top_k`), which the sentence does not claim otherwise.
- "Grok 4.5 is where that flipped": along the mainline the order reads 4.20
  false → 4.3 false → 4.5 true → 4.6 true, so the flip is at 4.5 and "a month
  late" is right (35 days). grok-4.20-multi-agent and grok-build-0.1 read
  mandatory true earlier, but they are a variant and a separate line, and 4.3
  post-dates the former with optional reasoning intact — the mainline claim
  survives them.
- The ratio rule is handled correctly: "the halved window" sits inside the
  clause "in the same snapshot it already carries this row's pair", and "the
  raised price" states direction only. `vendor_description` is a verbatim
  substring of the row's description. All seventeen transclusions resolve.

Round 1 (r9-opus) rejected this on three grounds. The lede dated mandatory
reasoning to 4.6 when the feed puts it at 4.5 — fixed, and fixed in the
strongest available way: the falsified claim is now the correction the page
exists to make, and it belongs here, because the reader liable to misdate the
change is the one looking up 4.6. Paragraph two referred to the site's own org
record, self-reference outside the colophon — gone; what remains describes the
catalog's rows, which is this site's subject rather than itself. Paragraph
three duplicated `org/spacexai`'s index-and-price paragraph — now a two-row
comparison at constant price and window, which is a different claim from the
org page's four-release arc where the index rose *alongside* the price; I read
both pages to check. They share numbers, as two pages over one catalog must,
but no longer share a point. The minor "on the requests that used it at all",
which implied 4.3's reasoning was opt-in when `default_enabled` is true, is
also gone.

It clears the bar now. A reject was right in round one — the page was named for
a change that happened elsewhere — and the rewrite did not paper over that; it
inverted it into the page's payload and added the constant-price framing that
makes the index move mean something. Nothing in it now rests on trust: every
figure came out of the snapshot under my own script.
