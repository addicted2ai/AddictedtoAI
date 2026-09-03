---
date: 2026-09-02
slug: context-window-transclusion-unit-doubling
type: repair
summary: >
  A repair job to sweep wiki entry prose that appends the literal word
  "tokens" (or a context-window label) directly after a `context_window`
  transclusion, which since the units feature landed renders with the unit
  already attached — so the haiku 4.5 page reads "it lists 200000 tokens
  ... tokens". Measured on the built pages of 2026-09-02: at least
  anthropic-claude-haiku-4-5.md (line 45), anthropic-claude-opus-4-8.md
  (line 74) and openai-gpt-5-6-luna.md (line 83) append "tokens" after a
  context_window transclusion; the same family may exist for other
  unit-carrying paths (max_output_tokens, price facts) and in other
  surfaces (learn pages, tutorials). The fix is prose-only: drop the
  literal after the transclusion or rephrase so the rendered unit reads
  once.
evidence: >
  Rendered pages fetched 2026-09-02 (built locally, out/): the haiku 4.5
  page's body reads "it lists 200000 tokens openrouter-models, last
  checked 2026-09-02 tokens, the same ceiling 200000 tokens ... carried
  on" — the "tokens" after the transclusion now doubles the unit the
  build renders for `openrouter-models|context_length` (lib/units.mjs).
  Source lines: content/wiki/model/anthropic-claude-haiku-4-5.md:45
  ("{{fact:...context_window}} tokens, the same"),
  content/wiki/model/anthropic-claude-opus-4-8.md:74, and
  content/wiki/model/openai-gpt-5-6-luna.md:83 ("...context_window}}
  tokens against Nano's"). All three bodies predate the units feature
  (beads/units.mjs history), so the doubling is a units-feature
  regression in reviewed prose, not author error at the time.
expires: 2026-10-02
proposed_by_job: j-20260902-24
proposed_by_type: entry
---

# The unit the build renders now doubles in prose that predates it

The units feature (lib/units.mjs, `openrouter-models|context_length` →
"tokens") made feed fact values render with their unit on the entry page
and inline in transclusions. Prose written before it exists that appended
the literal word "tokens" after a `{{fact:...#context_window}}`
transclusion now renders the unit twice:

- "it lists 200000 tokens ... tokens, the same ceiling 200000 tokens ...
  carried on" — anthropic-claude-haiku-4-5, built 2026-09-02
- "runs 200000 tokens ... tokens against Nano's" — openai-gpt-5-6-luna,
  built 2026-09-02

The pattern is greppable: a `context_window}}` transclusion followed by a
word-boundary "tokens". The repair is one-word edits in reviewed prose,
which means each edit invalidates the reviewed surface hash and needs a
fresh review pass under the normal flow — that is exactly what a `repair`
job is for.

## Why it matters

The doubled unit reads as a typo to a reader who is comparing two models'
windows side by side — the exact reader this site serves. It is a small
defect in a handful of pages, and the sweep needs the same "run the cheap
direct check" discipline the corpus applies everywhere: edit only the
lines the rendered page actually shows doubled, verify each by rebuilding,
and leave alone any prose where the literal after the transclusion is
still needed (e.g. "window" as a noun is fine; "tokens" after a fact that
renders a unit is not).

## What the job would do (done-when)

- Find every prose line (entry bodies first, then learn/tutorial surfaces)
  where a unit-rendering transclusion is directly followed by a literal
  that duplicates the rendered unit ("tokens" after `context_window` or
  `max_output_tokens`; "per token"/"per Mtok" after price facts).
- Fix each found line by removing the redundant literal or rephrasing so
  the rendered unit reads exactly once, changing nothing else.
- Rebuild and confirm each affected page reads clean; the diff lists the
  pages checked and the rendered sentence before/after for each.
- File any line the sweep judges NOT to be a doubling as a drop record
  naming the reading, so the sweep's coverage is auditable.

## Would-send test

A maintainer or reviewer hit with "the haiku page says 200000 tokens
tokens" would send the fix: "they fixed the doubled units, the diff is
one word per page." The audience is internal but the defect is on the
public site, and a repair here is cheaper than the next reader
misreading a window comparison.