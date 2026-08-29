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

## Citation repointed 2026-08-29 (b6-citations) — `addictedtoai-qhm` closed

The recheck above filed this rather than fixing it, because it is a front-matter
edit and that pass could not run a build. Same constraint here, so the edit was
kept to a value and not a shape: **one `timeline[].source_url` string changed,
nothing added, nothing removed.** The `date:` and `event:` on that entry are
untouched, and no front-matter key was introduced anywhere on the entry.

**The absence re-verified independently, not taken on trust.** The 9to5google
article re-fetched at **192,560 bytes** — the same size the recheck recorded.
Probing raw bytes *and* a tag-stripped rendering (4,851 chars) defeats the two
ways a naive search invents absence, tag interruption and newline wrap. Every
plausible spelling of the date is absent from both: `July 21`, `Jul 21`,
`July 21st`, `21 July`, `21st July`, `2026-07-21`, `20260721`, `07-21` — all
**0/0**. The decisive one is broader than any spelling: **the bare string `July`
occurs 0 times in the entire article, raw and stripped.** No rendering of a July
date can be present in a document that never says July. The prior finding is
confirmed, and confirmed by a stronger check than the one that produced it.

**What the article does support, which is why the body's link stays.** `three
weeks` occurs 3 times in the stripped text and `3.6 Flash` 3 times. The body's
inline link is anchored on the words "three weeks apart", and that claim is
carried by this article. Only the timeline's *date* was uncarried. The body was
therefore left alone — the citation there is correctly scoped to the claim it is
attached to, and the defect was one line of front matter, not a page-wide
sourcing problem.

**The replacement carries the date in visible text.** New `source_url`:
`https://openrouter.ai/google/gemini-3.6-flash` (629,823 B, HTTP 200, no
redirect). It has an FAQ section whose visible heading is **"When was Gemini 3.6
Flash released?"** and whose answer reads, verbatim: **"Gemini 3.6 Flash was
released on July 21, 2026."** — 1 occurrence in the tag-stripped visible text,
4 in raw bytes, mirrored again in the page's `schema.org` `FAQPage` block. The
page also carries `2026-07-21` 61 times in raw bytes and the permaslug
`google/gemini-3.6-flash-20260721` 223 times. This is a citation that states the
claim in prose a reader can see, not one a reader has to take on faith.

**Cross-checked against the committed feed, which is where the date came from.**
`data/sources/openrouter-models/latest.json` (2026-08-29 snapshot, 396 rows) has
`rows["google/gemini-3.6-flash"].created` = `1784646733` = `2026-07-21T15:12:13Z`,
and `canonical_slug` = `google/gemini-3.6-flash-20260721`, which spells the date
into the row id itself. Feed and cited page agree, so the repointed URL and the
underlying feed value are two independent carriers of the same date.

**Why the URL and not a bound fact.** The obvious "bind it to the feed" fix is
not available: `timelineEvent` in `lib/schema.mjs` is `.strict()` over exactly
`{date, event, source_url}` with `source_url` a required `httpUrl`. A timeline
row has no `source`/`feed`/`path` variant, so there is no way to express a
feed-bound timeline date without a schema change. Repointing to a page that
states the date is the correct fix inside the schema as it stands; a bound
timeline date would be a spec change, and is filed rather than smuggled in.
