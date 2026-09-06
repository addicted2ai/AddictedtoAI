---
date: 2026-09-06
slug: deepmind-aletheia-erdos-problems
type: post
status: declined
declined_by_job: j-20260906-12
failed_test: true, checkable and current — fails "current"
frontier_criterion_weighed: F1
---

# Declined: Aletheia's autonomous solutions to open Erdős problems

## The story considered

Aletheia, a mathematics research agent Google DeepMind built on Gemini Deep
Think, was run over the 700 problems still marked "Open" in Bloom's Erdős
problems database and produced autonomous solutions to a small number of
them — Erdős-652 and Erdős-1051 are named, with Erdős-1051 leading to a
generalisation reported in a paper — and separately solved 6 of 10
research-level problems on the FirstProof challenge by majority expert
assessment. This sweep looked at the science-math domain specifically
because the frontier question is asked of every domain on every run, and
this is what the domain returned.

## Which test it failed, and why

**True, checkable and current — it fails on currency, decisively.** The
Aletheia run is dated 2 to 9 December 2025; the write-up circulating is
dated 16 March 2026 (`math.berkeley.edu/~fengt/Aletheia.pdf`, seen in
results retrieved 2026-09-06). Six to nine months old. Nothing retrieved on
2026-09-06 shows a new result, a new run, or a new artifact.

## Weighed against the frontier criteria, and why the flag fails

**F1** — "a capability shown for the first time, with an artifact anyone can
check." On the artifact half it is unusually strong: formal proofs are the
one domain where the artifact is fully checkable. It fails on "first time"
as of today — this was first shown nine months ago and has already been
absorbed. It also fails the test the criteria state as their real test:
what every other AI news site already showed, months ago, does not qualify.
Worth recording that the researchers themselves declined the overclaim, on
the record — the autonomous results are described as milestones for AI and
explicitly not as major advances for mathematics, since many of the problems
proved elementary despite standing open for decades.

## What would make it worth refiling

- A new dated run with a new artifact — a problem of acknowledged
  difficulty, a formally verified proof, or an expert panel's assessment
  published with the proofs.
- A result where the mathematics community's own judgment is that the
  advance is substantive, rather than the milestone being about the agent.
  That distinction is the one this story's own authors drew, and a post that
  ignored it would be overclaiming against its sources.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.
