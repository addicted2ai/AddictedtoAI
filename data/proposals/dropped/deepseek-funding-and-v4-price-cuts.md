---
date: 2026-08-31
slug: deepseek-funding-and-v4-price-cuts
type: post
status: declined
declined_by_job: j-20260831-03
failed_test: true, checkable and current — the connection is not established
---

# Declined: DeepSeek's $74B round and the same-day V4 price cuts

## The story considered

The only candidate in this run that started from the repository's own data rather
than from outside it. This run's assembled feed context carries, all dated
**2026-08-29** on the `openrouter-models` source:

- DeepSeek V4 Flash 0731 — input 0.00000006 → 0.000000045, output 0.00000012 →
  0.00000009 (both −25%)
- DeepSeek V4 Pro 0423 — input 0.000000751854 → 0.000000670596, output
  0.000001503708 → 0.000001341192 (both −10.8%)
- DeepSeek V4 Flash 0423 — input 0.0000000868 → 0.00000008456, output
  0.0000001736 → 0.00000016912 (both −2.58%)
- New `:batch` rows arriving for V4 Flash 0731 and V4 Pro 0813

Externally, aiweekly.co's daily roundup (https://aiweekly.co/ai-news-today,
fetched 2026-08-31) lists under 2026-08-29 that DeepSeek is closing a **$7.4
billion round at a $74 billion valuation** with a 2027 IPO planned. The tempting
piece: the day the money landed, the prices came down.

## Which test it failed, and why

**True, checkable and current** — the second test, not the first. The individual
facts are checkable; the thing that would make them a story is not.

Three problems, any one of which is disqualifying:

1. **No causal link exists in any retrieved source.** A funding round and a price
   change on the same date is a coincidence of dates until somebody says
   otherwise, and this repository already has a written finding about drawing
   that line — `data/proposals/minimax-h3-excluded-territories.md` refuses the
   same inference about a licence and the EU AI Act on 2026-08-02.
2. **The observed numbers do not look like one decision.** −25%, −10.8% and
   −2.58% on three models of the same family on the same day is not the shape of
   a price cut; −2.58% in particular is the shape of a currency conversion or an
   upstream provider re-rate. The feed records what a marketplace API reported,
   which is not the same thing as a vendor's list price.
3. **The funding figure was not confirmed against a primary.** It comes from one
   aggregator's roundup line, with no DeepSeek statement and no named investor
   retrieved during this run.

The honest summary is that this is an artifact of a rate table, and a post built
on it would be the failure the synthesis branch exists to avoid: a candidate
manufactured because the data was sitting there.

Recorded for completeness: the synthesis branch did not formally open on this run
— three external stories cleared the bar — so this was considered on its merits
rather than as a quiet-day fallback, and it does not clear them.

## What would make it worth refiling

- **DeepSeek publishes a price change on its own pricing page** with a date, so
  the marketplace movement can be checked against the vendor's list price. Then
  the story is a real price cut with a real date, and the feed becomes
  corroboration instead of the sole evidence.
- The funding round is confirmed by DeepSeek or a named investor, and any
  statement links pricing to capital.
- The `:batch` lane comparison becomes buildable — this is already filed
  separately as `data/proposals/derived-batch-vs-sync-price-view.md` (type
  `machinery`), which is the right shape for this data: a derived view nobody
  else shows, not prose about a rate table.
- A cross-provider pattern appears: several vendors' prices moving in one
  direction over a bounded window, computed from the site's own history rather
  than asserted. That is a synthesis with an enumerable derivation, and it would
  need a stated method before it needs a headline.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing and may be refiled the moment one of the above arrives.
