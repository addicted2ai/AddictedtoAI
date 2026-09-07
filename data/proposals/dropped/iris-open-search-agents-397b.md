---
date: 2026-09-07
slug: iris-open-search-agents-397b
type: post
status: declined
declined_by_job: j-20260907-05
failed_test: true, checkable and current — fails "checkable"; and F1, weighed and failed on the artifact requirement
---

# Declined: Iris-mini and Iris-pro, open search agents claiming the search frontier

## The story considered

arXiv:2609.04304v1, "Iris: Climbing to the Search Frontier", submitted
2026-09-03 — two search agents trained at the 35B-A3B and 397B-A17B scales,
claiming BrowseComp 82.2% / 88.6%, BrowseComp-ZH 84.8% / 85.1%, DeepSearchQA
86.9% / 92.9% and HLE 52.3% / 56.4% with inference-time context management
enabled, and describing these as "the strongest overall results among
open-source search agents" in their parameter ranges.

Noticed via the registered arXiv cs.AI RSS listing and confirmed on the
abstract page, both fetched 2026-09-07 — https://rss.arxiv.org/rss/cs.AI and
https://arxiv.org/abs/2609.04304.

## Which frontier criterion it was weighed against, and why it failed

**F1** — "a capability shown for the first time, with an artifact anyone can
check (executed transcript, paper with code, public demo)." The paper is
half of that and the half that does not count on its own. On the abstract page
read during this run, the authors state an **intention** to "release the model
weights together with the complete recipe for data construction, training, and
evaluation"; no release is confirmed, no repository is linked from the abstract
page, and no leaderboard entry is pointed at. F1's parenthesis is not
decoration — it is the whole difference between a first showing and a first
claim, and an unreleased checkpoint reported by its own authors is a claim.

It is not F2 either: BrowseComp and HLE are published measures, but a
self-reported number on an author's own evaluation run is not a lead change *on
an index*, and no index was shown to have moved.

## Which of the two tests it failed

**True, checkable and current — it fails "checkable".** Every headline number
here is self-reported by an author group whose affiliations the abstract page
does not carry, on benchmarks where inference-time scaffolding ("context
management enabled", in their own framing) moves scores substantially. Nothing
in this run could verify any of it, and a post that reported 88.6% on
BrowseComp would be reporting a number this site cannot stand behind.

## What would make it worth refiling

- **The weights actually landing** on a public hub with the recipe, as the paper
  says they will. That converts the claim into an artifact and makes it a live
  F1 candidate.
- An entry on a third-party search-agent leaderboard that reproduces any of the
  four numbers, which would be F2.
- Named affiliations appearing on a later version, which would at least tell a
  reader whose claim this is.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.
