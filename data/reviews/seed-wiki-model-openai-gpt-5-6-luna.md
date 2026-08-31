---
job: seed-wiki-model-openai-gpt-5-6-luna
verdict: approve
reasons: []
would-cite: >-
  Someone budgeting a high-volume job who assumes the cheapest input rate buys a
  nano-class model: on the 28 August 2026 snapshot GPT-5.6 Luna meters input at
  the same rate as GPT-5.4 Nano while carrying a 1.05M context against Nano's
  400K, and undercuts its own Sol and Terra siblings tenfold.
reviewer: rr2b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Sources fetched
2026-08-29 and confirmed by literal substring match; catalog claims recomputed
against `data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows).

Verified by measurement:

- `openai/gpt-5.6-luna` prompt 0.0000002 and `openai/gpt-5.4-nano` prompt
  0.0000002 — identical to the digit. Context 1,050,000 against 400,000.
  Artificial Analysis indices: intelligence 52.3 v 39.7, coding 71.4 v 56.1,
  agentic 46.9 v 29.7. Every transcluded pair exact; all 13 distinct
  transclusions resolve to declared fields.
- Sol and Terra both prompt 0.000002, so "the same rate Terra charges too" holds
  and Sol / Luna is exactly 10. Sol intelligence 60.9 against Luna's 52.3, so the
  index gap (x0.86) is indeed far smaller in proportion than the price gap
  (x0.10). Both relations are anchored in the text to the 28 August 2026 reading,
  as the ratio rule requires.
- Six `gpt-5.6` rows exist, but luna-pro, sol-pro and terra-pro each describe
  themselves as "the same underlying model as [X], served with `reasoning.mode`
  set to `pro`", so "the three GPT-5.6 models" is fair, and the page names the
  luna-pro tie itself rather than being caught by it. Created timestamp
  2026-07-09 matches `release_date`.

Verified by fetching:

- developers.openai.com/api/docs/changelog, Jul 30 entry, verbatim: "Starting
  July 30, GPT-5.6 Luna costs 80% less, while GPT-5.6 Terra costs 20% less."
  Confirms both the size and the date of the cut.
- Same changelog, Jul 9 entry: badged `gpt-5.6-sol` `gpt-5.6-terra`
  `gpt-5.6-luna` `v1/responses` `v1/chat/completions` `v1/batch`, body "Released
  the GPT-5.6 model family ... GPT-5.6 Luna for efficient, high-volume
  workloads." The re-pointed timeline entry naming those three endpoints is
  carried by the page it now cites.
- venturebeat.com/...: "approximately 20 total organizations, after OpenAI shared
  the models and release plans with the U.S. government", byline "June 26, 2026".
- github.blog changelog for 2026-07-09 confirms the Copilot rollout, and now
  carries only that claim.

**Defect — one wrong number, and I traced where it came from.** "OpenAI cut
Luna's price by 80% on 30 July 2026, six weeks before that reading." The reading
is 28 August 2026. 30 July to 28 August is 29 days: four weeks and a day, not
six. Both dates sit in the same sentence, so the error is checkable without
leaving the page. It came from round one's record, which wrote "The match with
nano is six weeks old"; the fixer took the interval on trust. The substance is
sound — the cut is real, dated, and verified verbatim, and the price equality
genuinely is a post-cut artefact — only the arithmetic is wrong. Note also that
the opening "prices identically" is true of input alone (output is 0.0000012
against nano's 0.00000125); the next clause narrows to input, so it reads as a
loose topic sentence rather than a false claim.

Round 1 (r9-opus) found: (a) `broken-reference` — the timeline's "generally
available across ChatGPT, Codex, the OpenAI API and GitHub Copilot" was sourced
to a GitHub page naming no surface outside GitHub — **fixed**, and fixed
properly: split into two entries, each pointing at a page that carries its own
claim, both of which I re-verified. (b) undated derived relations, and "trails
Sol's by under nine points" having only 0.4 points of headroom — **fixed**: the
comparisons are now anchored to "28 August 2026" and the tight numeric claim was
replaced with a proportional one that cannot rot. (c) minor, the
cheapest-of-family claim being tied by luna-pro — **fixed**, the tie is now
stated. Nothing else was introduced. Round one's own "six weeks" is the one
finding I now believe was wrong, and it is the sole defect left standing.

It clears the bar as it now stands, and I say plainly which kind of piece this
is: one fixable word. The thesis — that a July 2026 model's input rate now equals
a March 2026 nano tier's, and that it undercuts its own siblings tenfold for a
fraction of the index gap — is exactly what a citer would paste this for, and it
verifies to the digit. The wrong interval sits in a subordinate clause and cuts
against the argument's own interest, since four weeks is more recent than six and
so strengthens the "recent rather than designed" point the sentence is making.
Change "six weeks" to "four weeks" and nothing else on the page needs touching.

## Superseded in part 2026-08-31 by `addictedtoai-sng` — annotated, not overwritten

**What this record said, on its date.** The second finding reads: *"Sol and Terra
both prompt 0.000002, so **'the same rate Terra charges too'** holds and Sol /
Luna is exactly 10."* It quotes prose that no longer exists in that form. The
closing paragraph also quotes the opening as *"prices identically"*, which has
likewise been reworded.

**What superseded it.** `addictedtoai-l6j` established that an OpenRouter
`pricing.prompt` is the **top listed provider's** rate for a row, re-chosen on a
rolling 30-second window — so "the same rate Terra *charges*" makes a company the
payee of a listing. This page carried two of the fifteen transclusions recorded
as debt in `data/price-attribution-debt.json`; `addictedtoai-sng` repaid them.

**The measurement above was re-derived live and held.** All 22 rows the four debt
files touch were fetched from
`https://openrouter.ai/api/v1/models/<row>/endpoints` on 2026-08-31 (all HTTP
200) and read per-provider rather than off the headline, because the ten-fold
Sol/Luna gap was one of the two claims suspected of being an *inversion* — two
different resellers topping two rows — rather than merely unhedged. **It is not.**
At OpenAI's own standard endpoint Sol is $2.00/M, Terra $2.00/M and Luna
$0.20/M, so the factor of ten and the Terra equality both hold at the vendor's
own rate, exactly as this record measured them off the snapshot. **Nothing was
withdrawn and no value changed.**

**The current text.**

- was: Sol's Y — **the same rate Terra charges too** — by a factor of ten
  now: Sol's Y — **the number Terra's row lists too** — by a factor of ten
- was: **Luna prices identically to** a much smaller, much older tier
  now: **Luna's row lists identically to** a much smaller, much older tier

plus the house hedge: "Both of those rates are the top listed provider's for
their row rather than necessarily OpenAI's own, and two rows need not be headed
by the same provider, so the ten-fold gap is one between listings."

**The defect this record left standing is still standing, and is now filed.**
"six weeks" where 30 July to 28 August is 29 days remains in the page. `sng`
did not fix it inline — it is not a price-attribution defect and would have
muddied that diff — so it is now `addictedtoai-kdw`, carrying this record's own
diagnosis and its one-word remedy. It had lived only inside this approved review
since 2026-08-29, which is precisely the shape CLAUDE.md warns goes unread.

**Also recorded:** the headline is one *service tier* among several the same
provider lists for a row — OpenAI lists Luna at $0.10/M (`openai/flex`), $0.20/M
(`openai`) and $0.40/M (`openai/fast`). Note this bears on round 2's own quotation
of the 21 August changelog, *"GPT-5.6 Sol now costs $4 per million input
tokens"*: $4.00/M is Sol's `openai/fast` tier, while its standard tier is
$2.00/M — so a vendor changelog figure and a headline figure need not name the
same tier. Filed as `addictedtoai-pfc`.
