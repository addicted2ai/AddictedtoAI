---
job: seed-org-openai
verdict: approve
reasons: []
would-cite: >-
  A developer arguing about what OpenAI's tier names mean — that Sol, Terra
  and Luna are durable tiers meant to outlive the generation number — would
  link this; so would someone claiming the June 2026 executive order changed
  how frontier releases stage, since the page pins the ~20-organisation
  preview to the GA date with primary sources, and the Luna-versus-5.4
  twelvefold price collapse at near-flat intelligence is the concrete number
  a cost-optimisation argument needs.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content)
date: 2026-08-28
---

Checklist: wiki entry. Sources fetched, catalog claims measured against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows).

**Verified by fetching:**
- venturebeat.com (gpt-5-6 article) — carries the exact quote "the number
  identifies a model's generation, while Sol, Terra, and Luna identify
  durable capability tiers", the ~20-organisation limited preview at the US
  government's request (dated 2026-06-26), the 2 June 2026 executive order
  reference, and OpenAI's "starting with a limited preview" statement.
- github.blog changelog 2026-07-09 — dated 9 July 2026; quotes confirmed
  verbatim: Sol "The highest reasoning ceiling in the family", Terra "The
  balanced default", Luna "A lightweight, cost-efficient variant".
- wilmerhale.com client alert — confirms the EO's voluntary up-to-30-days
  pre-release access for covered frontier models and "The EO does not
  mandate licensing or government approval of new models."
- en.wikipedia.org/wiki/OpenAI — confirms December 2015 founding, SF HQ,
  Foundation 26% / Microsoft 27%, US$852B post-money April 2026, and the
  2025-10-28 PBC adoption with both attorneys general named.

**Verified by measurement:**
- `gpt-5.6-luna` 0.0000002 input, II 52.3; `gpt-5.4` 0.0000025 input,
  II 53.1. Ratio 12.50 ("roughly a twelfth" — exact), gap 0.8 points
  ("within a point" — exact), created dates 2026-03-05 → 2026-07-09
  = 126 days, exactly as written.
- The pro-row oddity is real: sol-pro, terra-pro and luna-pro each list at
  precisely their base row's prices, while `gpt-5.2-pro` (0.000021 vs
  0.00000175, 12x) and `gpt-5.5-pro` (0.00003 vs 0.000005, 6x) listed at
  multiples. The body flags it as an observation with a date and offers the
  two readings without asserting either — the honest form.
- All transclusions resolve; volatile values feed-bound; aliases sane
  (Group PBC and Foundation as shared is right — they are distinct
  entities).

No cut-list violations; the closing paragraph's hedge ("the catalog is what
it is, dated") conveys a real epistemic state, not boilerplate. Approve.

## Recheck 2026-08-29 (wave addictedtoai-flh) — approve stands

Re-examined because this entry was approved in the earlier seed round, which
the 2026-08-29 seed wave never revisited. All four sources re-fetched; every
quotation re-matched literally, and the catalog arithmetic re-derived against
a *later* snapshot than the one it was written from.

- VentureBeat (200,731 bytes, byline "June 26, 2026") — "In this new naming
  system introduced with GPT‑5.6, **the number identifies a model's
  generation, while Sol, Terra, and Luna identify durable capability tiers**
  that can advance on their own"; "the models are being made available
  initially to a narrow set of **approximately 20 total organizations, after
  OpenAI shared the models and release plans with the U.S. government**"; "an
  executive order issued by President Donald J. Trump earlier this month on
  **June 2, 2026**"; and OpenAI's own words, "we previewed our plans and the
  models' capabilities ahead of today's launch. At [the U.S. government's]
  request, we are **starting with a limited preview** for a small group of
  trusted partners." The entry's framing that `mini` and `nano` "gave way" is
  the article's own: "the new naming scheme was designed to move away from the
  'nano' and 'mini' variants of GPT-5".
- GitHub Copilot changelog (105,739 bytes, dated "July 9, 2026") — "highest
  reasoning ceiling in the family", "balanced default", "lightweight,
  cost-efficient variant", all raw.
- WilmerHale client alert (61,976 bytes) — "to determine which systems qualify
  as 'covered frontier models' and to assess such models prior to public
  release. **Under this voluntary framework**, AI developers are invited to
  engage with the federal government … to **provide prerelease access for a
  period of up to 30 days**" and "the EO **stops short of imposing licensing
  requirements**, mandatory safety testing or any government veto over launch
  decisions." Every element of the entry's EO sentence, including the
  "voluntary by design" and "no licensing requirement" framing.
- Wikipedia (1,345,502 bytes) — "Founded December 8, 2015"; "OpenAI
  Headquarters in 1515 Third Street , San Francisco"; "The OpenAI Foundation
  holds a **26%** stake in the PBC, while Microsoft holds a **27%** stake";
  "In April 2026, the company announced that it closed a funding round of $122
  billion in committed capital at a **post-money valuation of $852 billion**";
  "On **October 28, 2025**, OpenAI announced that it had adopted the new PBC
  corporate structure after receiving approval from the **attorneys general of
  California and Delaware**." All five facts and the timeline row supported.

Re-measured against `data/sources/openrouter-models/latest.json` (2026-08-29):
`openai/gpt-5.6-luna` II 52.3 at 0.20/Mtok input, `openai/gpt-5.4` II 53.1 at
2.50 — gap 0.8 points ("within a point"), ratio exactly 12.50 ("roughly a
twelfth"), created 2026-03-05 → 2026-07-09 = **126 days**, as written. The pro
oddity also still reproduces on the later snapshot: `sol-pro` 2.00/10.00 =
`sol`; `terra-pro` 2.00/12.00 = `terra`; `luna-pro` 0.20/1.20 = `luna`; while
`gpt-5.2-pro` 21.00 against `gpt-5.2` 1.75 is 12x and `gpt-5.5-pro` 30.00
against `gpt-5.5` 5.00 is 6x. The entry dates that observation to 28 August
2026 and offers two readings without asserting either, which is still right.

One thing worth leaving on the record so a later pass does not mistake it for
a defect: VentureBeat's own pricing table lists GPT-5.6 Luna at $1.00/$6.00
per million, five times the OpenRouter row's 0.20 input. The entry does not
collide with that, because it says explicitly that Luna "lists at … **in the
OpenRouter catalog**" and reasons only over catalog rows. Nothing changed.
