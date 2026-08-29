---
job: seed-org-google-deepmind
verdict: approve
reasons: []
would-cite: >-
  Anyone arguing "just use Flash, the Pro row is stale" would cite this — it
  shows Google's cheap tier scoring above its expensive one on the same
  index at less than half the price, with listing dates; and anyone warning
  that a screenshot of today's Gemini price sheet expires on 2027-01-01 has
  the sourced introductory-pricing end date here.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content)
date: 2026-08-28
---

Checklist: wiki entry. Sources fetched, catalog claims measured against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows).

**Verified by fetching:**
- blog.google (introducing-gemini-3-7-flash) — confirms 13 August 2026,
  "$0.75/1M input tokens and $3.75/1M output tokens" introductory pricing,
  the footnote "Introductory pricing expires on December 31, 2026. Starting
  January 1, 2027, $1.50/1M input tokens and $7.50/1M output tokens will
  apply", DeepSWE v1.1 65.3% vs 49.0%, FrontierCode 1.1 Main 43.6% vs
  34.4%. All four figures exact.
- 9to5google.com 2026/08/13 — confirms the 13 August launch and "Just three
  weeks after the last release", linking the 2026-07-21 Gemini 3.6 Flash
  launch article.
- en.wikipedia.org/wiki/Google_DeepMind — confirms 15 November 2010
  founding, London HQ, April 2023 DeepMind + Google Brain merger, and the
  26 January 2014 acquisition.

**Verified by measurement:**
- `gemini-3.1-pro-preview` created 2026-02-19, II 47.7, input 0.000002.
- `gemini-3.5-flash` 2026-05-19 (II 52, input 0.0000015);
  `gemini-3.6-flash` 2026-07-21 (II 51.6, input 0.00000075);
  `gemini-3.7-flash` 2026-08-13 (II 56, input 0.00000075).
- The inversion is exact: 3.7 Flash beats the Pro preview by 8.3 index
  points at 37.5% of its input price. The 3.6 dip (51.6 vs 52 at half the
  price) and the 23-day gap to 3.7 both hold.
- Catalog price 0.00000075/0.00000375 per token matches the announced
  $0.75/$3.75 per million — the introductory price is what the feed serves.
- Transclusions resolve; volatile values feed-bound; the introductory-price
  fact is a dated literal with its end date inside the value, which is the
  right shape for a price with a published expiry.

**One observation, not blocking:** "the newest Gemini row on the Pro line
is google/gemini-3.1-pro-preview" — the snapshot also holds
`gemini-3.1-pro-preview-customtools` (2026-02-25, a variant of the same
preview) and `gemini-3-pro-image` (2026-06-18, an image-generation model).
Read as "the Pro language-model line" the sentence is true; a pedant could
quibble. Not worth a pass.

The closing paragraph — a price sheet that is "wrong from 1 January 2027
onward, and says nothing about it" — is the kind of sentence this site
exists for. Approve.

## Recheck 2026-08-29 (addictedtoai-flh) — holds, one citation filed

The four vendor-page figures were the priority here, because "figures
attributed to a vendor page" is a named high-yield class. All four are one
sentence in the Google post (416,830 B), quoted whole:

> "It also achieves higher first-pass code accuracy and has improved
> performance in generating production-ready code as seen in **FrontierCode
> 1.1 Main (43.6% vs 34.4%)** and **DeepSWE v1.1 (65.3% vs 49.0%)**."

The entry says those are "against ... the previous Flash". The post never
labels the second number, so I checked the framing: every comparison in it is
against 3.6 Flash by name ("significantly outperforms 3.6 Flash on the
GDP.pdf benchmark (34.0% vs 22.0%)", "surpasses 3.6 Flash in
AutomationBench", "outperforms 3.6 Flash on Arena.ai's WebDev Arena"). The
baseline is 3.6 Flash. Independently corroborated: the 9to5google article
states it explicitly — "the DeepSWE v1.1 benchmark goes from 49.0% to 65.3%,
while it's 34.4% to 43.6% on FrontierCode 1.1 Main."

Pricing fact verbatim, both halves: "3.7 Flash is available through the end
of the year at an introductory price of **$0.75/1M input tokens and $3.75/1M
output tokens**" and the footnote "**Introductory pricing expires on December
31, 2026. Starting January 1, 2027, $1.50/1M input tokens and $7.50/1M output
tokens will apply.**" The body's "double the introductory one on both input
and output" is arithmetic on those: 1.50 = 2 x 0.75 and 7.50 = 2 x 3.75. Both
check.

Catalog claims re-measured against the committed 2026-08-28 snapshot:
`gemini-3.1-pro-preview` created 2026-02-19, II 47.7, input 0.000002;
`gemini-3.5-flash` 2026-05-19, II 52, input 0.0000015; `gemini-3.6-flash`
2026-07-21, II 51.6, input 0.00000075; `gemini-3.7-flash` 2026-08-13, II 56,
input 0.00000075. So: the inversion holds (56 > 47.7 at 0.75 against 2.00);
"fractionally below" holds (51.6 vs 52); "half its listed input price" is
exact (0.00000075 = 0.0000015 / 2); "twenty-three days later" is exact
(21 July to 13 August). The catalog's 0.00000075/0.00000375 per token is the
announced $0.75/$3.75 per million — the feed serves the introductory price.

**Filed, not corrected: addictedtoai-qhm.** The timeline entry
"2026-07-21 / Gemini 3.6 Flash released" cites the 9to5google 3.7 article,
and that article does not state the date — `July 21` and `Jul 21` are both
ABSENT from its 192,560 bytes. Its headline supports the *body's* link text
exactly ("Gemini 3.7 Flash launches three weeks after last model"), but not
the timeline's date. The date is nonetheless correct: `google/gemini-3.6-flash`
carries `created` = 2026-07-21 in the committed snapshot and in a live fetch
today. A true claim on a citation that does not carry it — worth repointing,
but it is a front-matter edit and this pass could not run a build.

The round-one "one observation, not blocking" about
`gemini-3.1-pro-preview-customtools` (2026-02-25) and `gemini-3-pro-image`
(2026-06-18) reproduces in my own enumeration and I reach the same verdict:
read as the Pro language-model line, the sentence is true.

Wikipedia facts re-fetched (1,068,555 B): "15 November 2010 ... (official
launch)", "London", "On 26 January 2014, Google confirmed its acquisition of
DeepMind", "merged with Google AI's Google Brain division to become Google
DeepMind in April 2023". All four supported. The infobox also carries a
distinct incorporation date of 23 September 2010; the entry uses the launch
date and says "(as DeepMind)", which is the defensible choice.
