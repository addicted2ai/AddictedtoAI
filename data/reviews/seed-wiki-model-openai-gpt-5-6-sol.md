---
job: seed-wiki-model-openai-gpt-5-6-sol
verdict: approve
reasons: []
would-cite: >-
  Someone quoting Sol's 91.91% TerminalBench score in a leaderboard argument:
  this page pins the mode split (91.91% ultra thinking against 88.76% max)
  and the 13-day government-requested preview window that the GA
  announcements do not mention.
reviewer: rr3
date: 2026-08-28
---

Round 2, sealed. Findings written before opening round 1. Catalog claims
recomputed by script (rr3-census.mjs) against
data/sources/openrouter-models/latest.json (2026-08-28, 388 rows); sources
fetched 2026-08-28 and confirmed by literal substring match (VentureBeat
returned 429 twice and yielded on the third attempt).

- Snapshot: sol, terra and luna all created 2026-07-09 ("same-day siblings",
  "one launch day"); coding_index 77.4 / 76.7 / 71.4 and agentic_index
  57.8 / 50.2 / 46.9 — both orderings run Sol > Terra > Luna exactly as the
  prose states, direction-only, values transcluded.
- github.blog changelog: "Release July 9, 2026"; "GPT-5.6 Sol: The highest
  reasoning ceiling in the family." verbatim (tier_role).
- developers.openai.com/api/docs/changelog: "Jul 9 ... gpt-5.6-sol
  gpt-5.6-terra gpt-5.6-luna v1/responses v1/chat/completions v1/batch
  Released the GPT-5.6 model family" — the timeline's three endpoints are the
  changelog's, verbatim.
- venturebeat.com: dateline "June 26, 2026"; "approximately 20 total
  organizations"; "Sol used the new ultra thinking mode to achieve a
  record-high score of 91.91% on the benchmark, and the max mode achieved
  88.76%" on TerminalBench 2.1; "internal capture-the-flag testing, with Sol
  reaching 96.7%". The quoted phrase "at the US government's request" is
  genuine — VB quotes OpenAI's blog: "At [the U.S. government's] request, we
  are starting with a limited preview for a small group of trusted partners"
  (the piece normalizes the bracketed insertion and U.S.→US). Note for later
  passes: a narrow grep for "government's request" scores zero because of the
  bracket; the phrase is present.
- 2026-06-26 → 2026-07-09 = 13 days, exact. All transclusion targets and all
  six mention files exist.
- One word stands beyond its source, recorded: the closer's
  "government-picked first audience". The source supports government-
  *requested* (the preview structure) with the partners being OpenAI's
  "trusted partners"; who picked the twenty is unstated. The piece's own
  first sentence states it correctly, so this is a trimmable flourish, not a
  load-bearing claim.

Round 1 (r9-opus) found: the TerminalBench fact dropped the ultra/max mode
qualifier — fixed, both modes now recorded and verbatim against the article;
the CTF fact dropped "internal" — fixed; the GA claim ("ChatGPT, Codex, the
API and GitHub Copilot") cited to a changelog that names none of them —
fixed by narrowing to what sources carry (the API release now cites OpenAI's
own changelog, which I byte-verified; ChatGPT/Codex dropped); the restated
Pro-premium paragraph — cut as asked. The fix's one new blemish is the
"government-picked" word above.

Clears the bar: the mode-split benchmark pair and the preview-to-GA timeline
are assembled nowhere else on the site, every number is verbatim-sourced or
transcluded, and the ordering test of the vendor's own tier label is a real
derived view. Publish.
