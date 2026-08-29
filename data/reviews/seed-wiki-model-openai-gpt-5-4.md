---
job: seed-wiki-model-openai-gpt-5-4
verdict: approve
reasons: []
would-cite: >-
  Someone arguing that OpenAI's context-window increases roll out to a whole
  generation at once would be corrected by this page: the 5.4 jump to
  1,050,000 landed on the flagship and its Pro row and stopped there, with
  gpt-5.4-mini and gpt-5.4-nano shipping twelve days later still at 400,000.
reviewer: r9-opus
date: 2026-08-28
---

Checklist: wiki model entry. No external sources cited — the piece is entirely
catalog-internal, so every claim was verified by measurement against
`data/sources/openrouter-models/latest.json` (snapshot dated 2026-08-28,
row_count 388), read on 2026-08-28.

**Verified by measurement:**

- "GPT-5, 5.1, 5.2 and 5.3-Codex all cap at" one number — measured: all four
  rows read `context_length` 400000 exactly. True.
- "This row broke the plateau — more than double": `openai/gpt-5.4` reads
  1050000, a factor of 2.625 over 400000. "More than double" holds with a wide
  margin, so it will not rot on a small feed move.
- "every full-size GPT-5.x release since has kept that exact number" — I
  enumerated every `openai/gpt-5*` row rather than checking the four named.
  All flagship text rows created after 2026-03-05 read 1050000:
  `gpt-5.5`, `gpt-5.5-pro`, `gpt-5.6-sol`, `gpt-5.6-sol-pro`,
  `gpt-5.6-terra`, `gpt-5.6-terra-pro`, `gpt-5.6-luna`, `gpt-5.6-luna-pro`.
  True for every reasonable reading of "full-size".
- "mini and nano launched at the old ceiling": both read 400000, both created
  2026-03-17 — i.e. twelve days *after* the flagship, which makes the point
  sharper than the prose claims. True.
- "The Pro sibling did get the increase ... matching this row exactly":
  `gpt-5.4-pro` reads 1050000. True.
- All nine transclusions resolve to fields that exist on their target entries
  (checked programmatically against every `field:` key in `content/`). No
  typed literal stands in for a volatile value anywhere in the body.

**Recorded so a later pass does not "correct" a correct claim:** two rows sit
inside the stated window and do *not* read 400000 — `openai/gpt-5.2-chat`
(128000, created 2025-12-10) and `openai/gpt-5.4-image-2` (272000, created
2026-04-21). Neither falsifies the piece: it names its four rows explicitly and
scopes the second claim to "full-size" releases, which the following paragraph
defines by contrast with mini/nano. I checked both and judged them out of
scope, rather than missing them.

**Not independently verified:** nothing. There is no external source to fetch.

The payload is real and non-obvious: the context ceiling held flat across four
consecutive flagship releases and then broke *unevenly*, reaching the flagship
and the Pro row while the cheaper tiers launched afterwards at the old number.
The angle is also genuinely distinct from `org/openai`, which discusses the
5.6 naming scheme, the pre-release government gate, Luna's price/score ratio
and the Pro-premium oddity, but never mentions context windows at all — so
this is not restating an adjacent page. Every number is a transclusion and
every relation I re-measured is exact. Approve.
