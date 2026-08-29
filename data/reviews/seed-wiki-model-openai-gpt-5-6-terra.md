---
job: seed-wiki-model-openai-gpt-5-6-terra
verdict: revise
reasons:
  - not-worth-reading
  - broken-reference
would-cite: >-
  Someone claiming a newer OpenAI model always costs more than the one it
  succeeds would be answered by Terra listing at 2e-7 against GPT-5.5's 5e-6
  while beating it on all three Artificial Analysis indices — but as written
  the page reads the two rows off a table and stops.
reviewer: r9-opus
date: 2026-08-28
---

Checklist: wiki model entry. Sources fetched 2026-08-28; catalog claims
measured against `data/sources/openrouter-models/latest.json` (2026-08-28,
388 rows).

**Verified by fetching:**

- github.blog changelog, 2026-07-09 — publication date matches
  `release_date`. Terra is described verbatim as "The balanced default. A
  strong all-round choice for everyday interactive and agentic coding."
- venturebeat.com — the 26 June 2026 preview to "approximately 20 total
  organizations" at the US government's request is supported verbatim.

**Defect 1 — a citation that does not support its claim.** The timeline entry
"generally available across ChatGPT, Codex, the OpenAI API and GitHub Copilot"
is sourced to the github.blog changelog, which mentions no surface outside
GitHub and does not name ChatGPT, Codex or the API at all. I re-fetched and
asked directly to be sure. The claim is true on other evidence — search
results confirm GA across all four on 9 July 2026 — but openai.com's own
announcement returned HTTP 403 to me, so the correction rests on secondary
coverage. Re-point the citation. Sol and Luna carry the identical defect.

**Verified by measurement — everything factual holds:**

- Intelligence 56.6 v 56.3, coding 76.7 v 74.9, agentic 50.2 v 47.4 against
  `openai/gpt-5.5`. All three favour Terra, as claimed.
- Price 2e-6 against 5e-6 = 0.4. "Well under half" is true.
- 2026-06-26 → 2026-07-09 is 13 days. Correct.
- All nine transclusions resolve.

**Defect 2 — the piece is thin, and half of it is shared.** Paragraph one
reads four transcluded numbers off two adjacent catalog rows and adds the
judgment "all three numbers favour this row", which is what the numbers
already show — the cut list's "restating in prose what an adjacent table or
transclusion already shows". Paragraph two is the government-preview story,
which also appears on `org/openai`, `model/openai-gpt-5-6-sol` and
`model/openai-gpt-5-6-luna`: four pages carrying one event, and here it is
half the page.

What is left that an enthusiast did not know is one sentence: a model two
minor versions newer beats its predecessor on every measured axis at 40% of
the price. That is a real observation, and it is the narrowest margin in the
batch — 56.6 against 56.3 on intelligence is 0.3 points, close enough that
"beats it on every axis" is one feed update from being false and the page
carries no as-of date. `org/openai` dates its comparable claims; this one
does not.

**The material that would fix it is in a source the page already cites.**
VentureBeat reports Terra outpacing "GPT-5.5's 83.4%" on TerminalBench and
reaching 91.84% on internal capture-the-flag testing. Neither is on this page,
and both are exactly the kind of specific, non-catalog fact that would turn a
two-row comparison into something worth linking — the Sol entry uses the same
article for precisely that. Add those, date the index comparison, cut the
duplicated preview paragraph to a clause, and re-point the GA citation.

Accurate throughout, but as it stands it is the weakest piece in my slice and
the closest to an accurate-and-empty page. It is worth saving and the fix is
concrete. Revise.
