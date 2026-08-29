---
job: seed-wiki-model-openai-gpt-5-5
verdict: revise
reasons:
  - false-or-unsupported-claim
would-cite: >-
  Someone arguing that OpenAI's "Pro" label has always meant a fixed compute
  premium would be answered by the exact sequence 12.000x, 12.000x, 6.000x,
  1.000x — GPT-5.5 is the row where the multiplier first broke, and by 5.6 the
  Pro rows bill at the base rate.
reviewer: r9-opus
date: 2026-08-28
---

Checklist: wiki model entry. No external sources cited; every claim measured
against `data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows),
read on 2026-08-28.

**Verified by measurement — the core finding is exact:**

- `gpt-5.2-pro` 2.1e-5 / `gpt-5.2` 1.75e-6 = **12.000**
- `gpt-5.4-pro` 3e-5 / `gpt-5.4` 2.5e-6 = **12.000**
- `gpt-5.5-pro` 3e-5 / `gpt-5.5` 5e-6 = **6.000**
- `gpt-5.6-sol-pro` / `gpt-5.6-sol` = **1.000**

I checked the claim the piece makes about all three 5.6 variants rather than
the one it transcludes, because "each of the three" is falsified by a single
exception: `gpt-5.6-terra-pro` and `gpt-5.6-luna-pro` both exist and both
match their base row to the digit (2e-6 and 2e-7 respectively). The claim
holds for all three.

- `reasoning.default_enabled` reads true on `gpt-5.5` and false on `gpt-5.4`.
  The stated contrast is correct.
- All nine transclusions resolve.

**Defect 1 — "across four consecutive minors" is false.** The four cited rows
are 5.2, 5.4, 5.5 and 5.6. There is no plain `openai/gpt-5.3` in the catalog
(only `gpt-5.3-codex`, which has no Pro sibling), so 5.2 → 5.4 skips a minor
and the sequence is not consecutive. Worse, the hedge costs the piece its own
best evidence: `openai/gpt-5-pro` 1.5e-5 / `openai/gpt-5` 1.25e-6 is **also
exactly 12.000**, so the twelve-times ratio held across *three* generations
before it broke, not two. Say "across four releases that shipped a Pro row"
and add GPT-5 itself — the pattern is longer and more striking than claimed.

**Defect 2 — a volatile value is typed rather than transcluded.** "where
GPT-5.4 carried `false`" is a literal in prose for a feed-bound field of
`slow` volatility. It is correct today, and it could not have been transcluded
because `content/wiki/model/openai-gpt-5-4.md` carries no
`reasoning_on_by_default` fact — I checked every `field:` key on that entry.
The fix is to add the fact to the GPT-5.4 entry and transclude it, which is
the house rule ("volatile values are bound, never typed").

**Defect 3 — no as-of anchor.** Every ratio here is derived from `fast`
pricing fields, and the body states them as timeless ("Twelve times, twelve
times, six times, one time"). The inputs are transcluded and safe; the
*relations* are not, and nothing on the page dates them. `org/openai` handles
the identical observation correctly — "One oddity in the catalog, as observed
on 28 August 2026". Note also that the 5.6 prices in this snapshot are
post-cut: OpenAI reduced Luna by 80% and Terra by 20% on 30 July 2026, which
does not disturb the ratios (base and Pro moved together) but does mean these
are not launch prices.

**Overlap check.** `org/openai`'s closing paragraph already reports that each
5.6 Pro row matches its base while 5.2-pro and 5.5-pro billed several times
theirs. This body is the more quantified version and legitimately owns the
angle — it is the row where the ratio broke, and it adds the 5.4-pro data
point and the exact multipliers the org page lacks. But `model/openai-gpt-5-6-sol`
makes the same point a third time; one of those two should drop it, and it
should not be this one.

The reasoning-default paragraph is a genuine third finding and not restated
anywhere. The payload is strong and the arithmetic is exact to three decimals.
Fix the "consecutive" claim, bind the `false` literal, and date the ratios.
Revise.
