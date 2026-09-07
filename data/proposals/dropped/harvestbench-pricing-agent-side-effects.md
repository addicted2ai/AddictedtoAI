---
date: 2026-09-07
slug: harvestbench-pricing-agent-side-effects
type: post
status: declined
declined_by_job: j-20260907-05
failed_test: true, checkable and current — fails "checkable"; and F1/F2, weighed and failed
---

# Declined: HarvestBench, a benchmark that puts a price on an agent's side effects

## The story considered

arXiv:2609.04444, "HarvestBench: Measuring Whether LLM Agents Will Pay to Avoid
Killing Animals", listed on the registered arXiv cs.AI RSS feed and fetched
2026-09-07 — https://rss.arxiv.org/rss/cs.AI. From the listing's abstract
opening: "Benchmarks for the side effects an agent causes on the way to a goal
already exist, but HarvestBench is the first to put a price on avoiding the side
effect and to name that side effect as a living creature."

It was considered because it is genuinely novel in construction — most agent
side-effect benchmarks measure whether harm happens, and this one measures what
an agent will *pay* not to cause it, which is a different and more interesting
question — and because `agents` is a domain the vocabulary carries.

## Which frontier criteria it was weighed against, and why it failed

**F1** — "a capability shown for the first time, with an artifact anyone can
check." A benchmark is not a capability. Nothing here shows a model doing
something new; it shows a new way of asking.

**F2** — "a lead change on a published index, or a rescoring that moved a
leader." A brand-new benchmark has no published index yet and therefore no
leader to move. This is the case the non-qualifying list has in mind with "a
benchmark post with no new artifact": a first-run benchmark's own numbers are
the authors' numbers, and until somebody else runs it there is no index.

## Which of the two tests it failed

**True, checkable and current — it fails "checkable".** This run read the
listing entry, not the paper; whatever results it reports are self-reported by
the benchmark's own authors on their own construction, three days after
submission, with no independent run. A post reporting which models pay and
which do not would be reporting an unreplicated preprint's ranking as though it
were a finding.

## What would make it worth refiling

- A **second party** running HarvestBench and publishing results, which would
  make the ranking checkable and could make it F2.
- A frontier lab citing it in a system card or a safety framework — this corpus
  already tracks system-card measurement claims
  (`content/blog/openai-gpt-6-astra-system-card.md`), and a benchmark crossing
  into that surface is a different and stronger story.
- Adoption into an existing agent-evaluation suite.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.
