---
date: 2026-08-31
slug: open-weight-territorial-lockout-trend
type: post
status: declined
declined_by_job: j-20260831-01
failed_test: true, checkable and current
---

# Declined: "open weights are being geofenced" as a trend piece

## The story considered

The framing that presented itself first, once MiniMax H3's Excluded Territories
clause turned up: 2026 is the year open-weight releases started locking out
regulated markets. The supporting cast was to be MiniMax H3 (EU, UK, Republic of
Korea, USA excluded, licence effective 2026-08-02), Tencent's Hy3 preview
(EU, UK, South Korea), and a reported Qwen3.8-Max revenue-share licence — read
together as a drift away from unrestricted open weights, timed against the EU AI
Act's 2026-08-02 applicability date.

## Which test it failed, and why

**True, checkable and current — it fails on true.** The trend does not exist, and
the evidence against it came from the same sweep that produced the hook.

digitalapplied's licence audit, published 2026-08-16 and retrieved 2026-08-31
(https://www.digitalapplied.com/blog/open-weight-model-licence-audit-2026),
read the licences of 30 models across 17 organisations. It found **one** model
with geographic restrictions: Tencent's Hy3 — and Hy3's final July 2026 release
switched to **unmodified Apache-2.0 with no geographic limitation**. The one
prominent territorial exclusion of 2026 was tried and withdrawn. That is the
opposite of a drift.

The audit's other findings dissolve the rest of the framing. What it actually
found across those 30 models were **revenue and MAU thresholds**, not territorial
locks: Kimi K2.5 and K3 (branding obligations at $20M monthly revenue or 100M+
MAU), MiniMax M3 and MiniMax-Music3 ($20M yearly), LTX-2.3 ($10M annually),
LFM2.5-8B-A1B ($10M yearly), Llama 4 Scout and Maverick (700M MAU approval
trigger). Thresholds gating the largest commercial users are a different
phenomenon from excluding whole jurisdictions, and merging them into one arc
would have been the piece's central dishonesty. The audit further states it found
**no** explicit revenue-sharing arrangements at all, which directly contradicts
the third leg of the trend.

The EU AI Act timing is likewise not evidence. H3's licence took effect on the
same date the Act's GPAI enforcement powers became applicable, but the Excluded
Territories also cover the United States and South Korea, which the Act does not
reach. Absent a statement from MiniMax, that is a coincidence of dates.

The salvageable, true version was filed instead as
`data/proposals/minimax-h3-excluded-territories.md`, which reports the single live
exception, quotes the clause, and carries the audit's contrary finding as a
required element rather than an omission.

## What would make it worth refiling

- **A second currently-live open-weight release ships territorial exclusions.**
  One instance is an exception; two live instances is a pattern and the trend
  piece becomes true. Tencent's reverted preview does not count toward this.
- A vendor states a jurisdictional rationale for an exclusion on the record —
  that converts the AI Act connection from speculation into a sourced claim.
- A licence audit of comparable breadth to the 2026-08-16 one re-runs later in
  the year and finds the count rising.

`data/proposals/dropped/` is a record, never a block. If a second live exclusion
appears, this refiles without suppression.
