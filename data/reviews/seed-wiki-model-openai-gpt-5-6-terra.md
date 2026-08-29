---
job: seed-wiki-model-openai-gpt-5-6-terra
verdict: approve
reasons: []
would-cite: >-
  Someone told the mid-tier model is the compromise choice: OpenAI calls Terra
  "the balanced default", yet on 28 August 2026 it takes all three Artificial
  Analysis indices off GPT-5.5 at $2 against $5 input, and cleared the same
  "High" cyber bar at 91.84% on internal capture-the-flag testing.
reviewer: rr3b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Catalog claims
recomputed by script against `data/sources/openrouter-models/latest.json`
(2026-08-28, 388 rows); sources fetched 2026-08-29 and matched by literal
substring against raw bytes.

- github.blog changelog: `vendor_role` is verbatim — "GPT-5.6 Terra: The balanced
  default. A strong all-round choice for everyday interactive and agentic
  coding."
- "on every axis Artificial Analysis measures" is exactly right, and the scoping
  is the impressive part. I enumerated the `artificial_analysis` keys across the
  whole snapshot: there are three and only three — `agentic_index`,
  `coding_index`, `intelligence_index` (present on 156 rows). Terra takes all
  three: 56.6/56.3, 76.7/74.9, 50.2/47.4. Note that GPT-5.5 also carries a large
  `design_arena` record while Terra's is empty, so the broader claim "every
  benchmark" would have been false. Restricting to Artificial Analysis is not
  hedging; it is the only true version of the sentence.
- "a fraction of a point" = 56.6 - 56.3 = 0.3. Correct.
- "the price margin is not" states direction only, with both prices transcluded
  and no ratio asserted — the ratio rule is respected, where round 1's version
  had carried "well under half".
- venturebeat.com: `capture_the_flag_score` verbatim, in "all three GPT-5.6
  models crossed its &quot;High&quot; cyber threshold on internal
  capture-the-flag testing, with Sol reaching 96.7%, Terra reaching 91.84% and
  Luna reaching 85.19%."
- `terminalbench_comparison` is correctly attributed, which I checked
  specifically because it would be easy to get wrong. The article reads "both the
  flagship Sol model and the mid-tier Terra outpace the previous GPT-5.5
  benchmark, though notably Sol used the new ultra thinking mode to achieve a
  record-high score of 91.91% ... and the max mode achieved 88.76% — ahead of
  both GPT-5.5's 83.4%". The 91.91% and 88.76% are Sol's; the entry claims
  neither for Terra, asserting only that Terra outpaced GPT-5.5's 83.4%, which
  the source states directly.
- "approximately 20 total organizations, after OpenAI shared the models and
  release plans with the U.S. government" verbatim; article dated 2026-06-26;
  26 June to 9 July is 13 days.
- The 2026-07-30 timeline entry is verbatim in the OpenAI changelog — "Starting
  July 30, GPT-5.6 Luna costs 80% less, while GPT-5.6 Terra costs 20% less" — and
  independently corroborated by arithmetic: VentureBeat lists Terra at $2.50/$15
  on 26 June, and $2.50/$15 less 20% is $2.00/$12.00, which is what both OpenAI's
  own price sheet and the OpenRouter feed now carry.
- All twelve transclusions and all four mentions resolve.

**One defect.** "enough to put the mid-tier model across the same 'High' cyber
threshold all three siblings crossed" miscounts. The source says "all three
GPT-5.6 models", and Terra is one of them; Terra has **two** siblings, Sol and
Luna. The reword also makes the sentence eat itself — it credits Terra's score
with clearing a bar its siblings are said to have already all cleared. "all three
models" is the fix and restores the source's meaning exactly. The underlying
facts are true: Terra scored 91.84%, and all three GPT-5.6 models crossed "High".

Not a defect, noted only: "the pricier release right before it" is not strictly
unique, since `openai/gpt-chat-latest` (created 2026-05-05, $5/$30) sits between
gpt-5.5 (2026-04-24) and the 5.6 family (2026-07-09). The sentence names
`openai/gpt-5.5` explicitly, so no reader is misled.

Round 1 (r9-opus) found: a timeline entry claiming GA "across ChatGPT, Codex, the
OpenAI API and GitHub Copilot" cited to a GitHub changelog that names no surface
but GitHub (`broken-reference`) — **fixed, and better than asked**: it is now two
entries, the API one pointed at OpenAI's changelog, whose Jul 9 entry tags
`gpt-5.6-terra` with `v1/responses v1/chat/completions v1/batch` and reads
"Released the GPT-5.6 model family", which carries the claim precisely; and
`not-worth-reading` — a first paragraph restating what the transclusions show, a
second paragraph duplicating the preview story from three other pages, and an
undated "beats it on every axis" one feed update from being false — **fixed**:
the comparison now carries "As observed on 28 August 2026", the TerminalBench and
capture-the-flag facts r9 pointed at are in, and the preview story is cut to a
closing clause. The one thing the fix introduced is the "all three siblings"
miscount above.

It clears the bar as it stands. The page now does something the catalog cannot do
alone — set the vendor's own "balanced default" positioning against three indices
that contradict it, then add two off-catalog numbers from the preview reporting —
and every figure on it is exact. This is one wrong word in a page whose claims all
hold, not a page whose claim fails, so I am not sending its prose to the bin for
"siblings".
