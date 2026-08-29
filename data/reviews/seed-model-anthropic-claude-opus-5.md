---
job: seed-model-anthropic-claude-opus-5
verdict: approve
reasons: []
would-cite: >-
  An engineer explaining a cost regression after upgrading to Opus 5 would
  cite the default-reasoning boolean flip — same effort ladder, different
  default, different bill for a request that says nothing; and the 200x
  price span from a cached batch read to fast-mode output is the page to
  link in any "what does a token from this model actually cost" argument.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content)
date: 2026-08-28
---

Checklist: wiki entry. Sources fetched, catalog claims measured against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows).

**Verified by fetching (anthropic.com/news/claude-opus-5):**
- Release 24 July 2026 ("Claude Opus 5 is available today", dated Jul 24,
  2026).
- "greatly improved performance for the same cost as its predecessor,
  Opus 4.8" — supports the timeline entry.
- Fast mode: "runs around 2.5 times the default speed", "available at twice
  Opus 5's base price" — supports the fast_mode_speed fact verbatim.
- "at max effort, the model performs within 0.5% of Fable 5's peak score,
  but at half the cost per task" (Cursor benchmark) — quoted accurately.
- "surpassing Fable 5's best result at just over a third of the cost"
  (OSWorld) — quoted accurately.
- "it remains behind Mythos 5 on cybersecurity tasks" — quoted accurately.

**Verified by measurement:**
- `reasoning.default_enabled`: opus-5 true; opus-4.7 and opus-4.8 both
  false. The quiet boolean is real.
- Effort ladder identical across 4.7, 4.8 and 5: supported_efforts
  [max, xhigh, high, medium, low], default high — "the effort ladder itself
  is unchanged" is measured, not assumed.
- Prices: opus-5 0.000005/0.000025, cache read 0.0000005; opus-5-fast
  0.00001/0.00005 (exactly 2x base); opus-5:batch 0.0000025/0.0000125
  (exactly half), batch cache read 0.00000025. Cached batch read
  0.00000025 to fast output 0.00005 = 200x — "more than two orders of
  magnitude" holds.
- II: opus-5 63.1 vs fable-5 62.1 at 0.00001 input — "the premium tier is
  behind the flagship and ahead of it on the invoice" is exact.
- Transclusions resolve (including cross-entry ones to opus-5-fast and
  fable-5); every volatile value is feed-bound; aliases sane.

The prose earns its place beyond the data row: the default-flip reading,
the exchange-rate framing of the fast/batch/cache spread, and the closing
"top of the purchasable stack rather than the top of the stack" all say
things the table cannot. Approve.

## Recheck 2026-08-29 (addictedtoai-flh) — holds, verdict unchanged

Launch post re-fetched (354,386 B). The three quotations are verbatim, with
their surrounding context, which matters because two of them name a
benchmark the entry paraphrases:

- "On CursorBench 3.2 , at max effort, the model performs **within 0.5% of
  Fable 5's peak score**, but at half the cost per task" — the entry's
  "Cursor's coding benchmark" is CursorBench 3.2.
- "On OSWorld 2.0 , a computer use benchmark, Opus 5 outperforms every other
  model at any given cost, surpassing Fable 5's best result **at just over a
  third of the cost**."
- "Opus 5 is the new state-of-the-art, though **it remains behind Mythos 5 on
  cybersecurity tasks**."

**A false absence worth recording.** Searching the post for `2.5x` and for
`twice the base price` both return ABSENT. The post says: "It's also offered
in Fast mode, where it runs **around 2.5 times the default speed**. As with
Opus 4.8, Fast mode is available at **twice Opus 5's base price**." The
`fast_mode_speed` fact is exact; the `x` notation is the entry's. Release
date: the post is stamped "Jul 24, 2026" ("2026-07-24" is ABSENT as a
string).

**The one claim the cited source does not support, and where it does come
from.** The body says Mythos 5 "returned from a June 2026 suspension only
after US government approval". `suspension` and `suspend` are both ABSENT
from the launch post — the post says only that evaluations were "conducted
alongside private-sector and government partners". I traced it to two other
Anthropic primary pages, both of which carry it plainly:

- `anthropic.com/news/claude-fable-5-mythos-5` — "Claude Mythos 5 and Fable 5
  access unavailable Jun 12, 2026 We are suspending access to Claude Fable 5
  and Claude Mythos 5." and, in the page payload, "On Friday, June 12, the US
  government applied export controls to our newest models, Claude Fable 5 and
  Claude Mythos 5."
- `anthropic.com/claude/mythos` — "Claude Mythos 5 export controls have been
  lifted Jul 1, 2026 We have restored access to Mythos 5 for a set of US
  organizations, **following the US government's approval**."

So the claim is true and primary-sourced; it is simply sourced elsewhere in
the corpus (content/wiki/org/anthropic.md carries both URLs) rather than by
this entry. Recorded here so a later pass checking this entry against its own
citations does not conclude the sentence is unsupported.

Catalog arithmetic re-measured against the committed 2026-08-28 snapshot
(388 rows) rather than assumed:

- `reasoning.default_enabled` — opus-5 **true**; opus-4.7 **false**;
  opus-4.8 **false**. The quiet boolean is real, and 4.6 is false too.
- opus-5 in 0.000005 / out 0.000025 / cache read 0.0000005;
  opus-5-fast 0.00001 / 0.00005 (exactly 2x, matching the post's "twice");
  opus-5:batch 0.0000025 / 0.0000125 (exactly half — "halves the price"),
  batch cache read 0.00000025.
- **"more than two orders of magnitude"**: cached batch read 0.00000025 to
  fast-mode output 0.00005 is 200x. 200 > 100, so "more than two" is right
  and "three" would have been wrong. Checked rather than repeated, because
  this is the arithmetic-across-rows class that inverts if one operand moves.
- II: opus-5 **63.1** vs fable-5 **62.1**, with fable-5 input 0.00001 against
  opus-5's 0.000005. Both halves of "behind the flagship and ahead of it on
  the invoice" hold, and the margin is 1.0 index points — small, so worth
  re-measuring, and it survives.
- Timeline "same price as the preceding Opus release": the post says "(the
  same as Opus 4.8)", and opus-4.8 lists at 0.000005 input, identical.
