---
job: seed-wiki-model-x-ai-grok-4-6
verdict: reject
reasons:
  - false-or-unsupported-claim
  - not-worth-reading
would-cite: >-
  Someone dating the release where Grok stopped letting you turn reasoning off
  would be sent to the wrong model by this page — grok-4.5 already reads
  mandatory true at high effort a month before 4.6, so the page misidentifies
  the release it is written about.
reviewer: r9-opus
date: 2026-08-28
---

Checklist: wiki model entry. Sources fetched 2026-08-28; catalog claims
measured against `data/sources/openrouter-models/latest.json` (2026-08-28,
388 rows).

**Verified by fetching:**

- openrouter.ai/x-ai/grok-4.6 — listing date "August 12, 2026" matches the
  cited `listed_date`. The description reads "Grok 4.6 is SpaceXAI's smartest
  model with frontier performance on coding, knowledge work, and STEM"; the
  entry's `vendor_description` value is a verbatim substring. Both facts hold.

**Falsified by measurement — the piece's lede.** The body's organising claim
is that reasoning "went from optional to compulsory" at this row, comparing
`grok-4.3` directly against `grok-4.6` and concluding that "the catalog now
records both happening on **the same release**". Measured, the reasoning
objects read:

- `x-ai/grok-4.3` (2026-04-30): `mandatory: false`, `default_effort: "low"`
- `x-ai/grok-4.5` (2026-07-08): `mandatory: **true**`, `default_effort: "high"`
- `x-ai/grok-4.6` (2026-08-12): `mandatory: true`, `default_effort: "high"`

Mandatory reasoning at high effort arrived at **4.5**, a month before this
row. The only reasoning change at 4.6 is the addition of `xhigh` to
`supported_efforts`. The piece skips 4.5 entirely in all three paragraphs even
though it is in this entry's own `mentions` list, so the row that falsifies
the claim was already in hand.

**True, and checked:**

- "the setting 4.3 treated as its top tier" — `grok-4.3`'s
  `supported_efforts` is ["high","medium","low","none"], so "high" is indeed
  its ceiling, and "none" (the "skipping") existed. Exact and well observed.
- Index moves 4.3 → 4.6: agentic 24.2 → 58.7, coding 42.2 → 76.8,
  intelligence 37.9 → 60.9. All three rise. True.
- "three months" — 2026-04-30 → 2026-08-12 is 104 days. Fair.
- "the price increase" — input moved 1.25e-6 → 2e-6. True, though asserted in
  prose with no transclusion and no number.
- All ten transclusions resolve.

**Two further defects.** Paragraph two is the site talking about its own
records — "The org record for this lab already treats...", "Neither row states
that one change bought the other" — which is self-reference outside the
colophon, on the cut list. Paragraph three then re-runs `org/spacexai`'s third
paragraph, which already reports the intelligence index rising across these
releases alongside the input price; this body adds the coding and agentic
columns but makes the same point about the same rows. The claimed distinct
angle holds only for paragraph one, and paragraph one is the wrong one.

**Also inaccurate, minor:** "with a default effort of low **on the requests
that used it at all**" implies 4.3's reasoning was opt-in. Its
`default_enabled` is true — reasoning was already on by default at 4.3, just
not compulsory.

All three paragraphs are impaired: the first misidentifies which release made
the change it is named for, the second is self-referential, the third
duplicates an adjacent org page. What survives is one genuinely sharp
observation — that 4.3's ceiling became the later default while "none"
disappeared — which belongs on `model/x-ai-grok-4-5`, the row where it
actually happened. Reject.
