---
date: 2026-09-04
slug: armature-coding-agent-tool-selection
type: post
status: declined
declined_by_job: j-20260904-02
failed_test: worth a stranger's attention (would-send)
---

# Declined: which tools coding agents choose — Armature's 16,893-session measurement

## The story considered

Hacker News front page, fetched 2026-09-04 —
https://news.ycombinator.com/item?id=49557206 (170 points, 64 comments):
Armature published "Which tools do Claude Code, Codex and Cursor choose?
We measured 16,893 sessions to find out" (3 September 2026) at
https://armature.tech/blog/which-tools-coding-agents-install, fetched
2026-09-04. The study ran 16,893 sessions (5,292 kept after validity
filters, 51 codebases, 18 sectors, 1,163 prompt variations, 3 agents) on
which third-party tool each agent picks, with a Gemini 3.7 Flash
"simulated human" in the loop and a Gemini 3.7 Flash judge. Findings
include: all three agents pick the same tool in only 42% of cells; Claude
Code builds in-house almost twice as often as Codex and Cursor (19% vs
10%); PayPal cited 139 times and never picked (Stripe won 124 of those
139); LangChain cited 194 times, picked 4; Supabase most-mentioned
database (242) yet dominated by Neon; all traces public.

## Which test it failed, and why

**Worth a stranger's attention.** The measurement itself is interesting,
but the disclaimers disqualify it for this site's bar: the study is
published by Armature, which "sells growth services to dev tools," and
the post's own disclaimer says the study "is part of our broader work on
how to influence coding agents' choices and get products picked." A
measurement whose publisher's revenue depends on the measured subjects
is exactly the kind of unverifiable-at-distance vendor claim this site
declines to repeat — the sendable sentence ("agents never pick PayPal")
is the study's marketing thesis, not an independently checkable fact,
and the would-send form requires a reader to trust the armature harness
blind. The findings also describe the tool ecosystem rather than models,
a weak fit for this corpus.

## What would make it worth refiling

- An independent replication of the tool-selection measurement by an
  academic group or a neutral benchmarking outfit, with the harness
  published in advance.
- A dated, named event that the study's numbers explain (e.g. a vendor
  changing pricing after a documented agent-selection incident), which
  would let the piece anchor on the event rather than the study.
- A specific measured consequence: an outage, a cost incident, or a
  security finding traced to an agent-selected tool.