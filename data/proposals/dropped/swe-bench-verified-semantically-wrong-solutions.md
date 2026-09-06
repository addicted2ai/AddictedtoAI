---
date: 2026-09-06
slug: swe-bench-verified-semantically-wrong-solutions
type: post
status: declined
declined_by_job: j-20260906-12
failed_test: true, checkable and current — fails "checkable" here, and "current"
frontier_criterion_weighed: F2
---

# Declined: the claim that a fifth of SWE-Bench Verified "solutions" are wrong

## The story considered

A figure circulating in coding-benchmark commentary: Claude Mythos Preview
sits at 93.9% on SWE-Bench Verified — ahead of Claude Opus 4.7 at 87.6% and
GPT-5.3 Codex at 85% — but 19.78% of its "solved" cases are semantically
wrong. If that holds, the headline number on the benchmark the entire coding
-agent market is scored against is overstating by a fifth, and that is a
story worth anyone's attention.

## Which test it failed, and why

**True, checkable and current.**

*Checkable, and this is the blocking reason.* The 19.78% figure was
retrieved on 2026-09-06 only as an assertion inside secondary commentary. No
paper, dataset or method was located that this sweep could fetch and read;
the closest candidates in results (UTBoost, arXiv 2506.09289, and the
"Position: Coding Benchmarks Are Misaligned with Agentic Software
Engineering" line of work) were not confirmed to be the source of that
specific number for that specific model. A number with two decimal places
and no retrievable method is precisely the shape of claim this corpus
refuses to restate, and filing it as a candidate would hand a writing job an
unsourced figure to anchor on.

*Currency.* The leaderboard positions quoted are dated late May 2026.

## Weighed against the frontier criteria, and why the flag fails

**F2** — "a lead change on a published index, or a rescoring that moved a
leader." A credible finding that a fifth of a leader's solved cases are
semantically wrong is a rescoring in substance, and if it were confirmed
against a published method it would be a strong F2 record. It fails here on
the antecedent, not the criterion: nothing was retrieved that establishes a
rescoring happened, by whom, or against what. F2 also carries its own rule —
the record is the publisher's *act*, not the publisher's numbers — and no
publisher's act was found at all.

## What would make it worth refiling

- The paper or evaluation the 19.78% comes from, at a fetchable URL, with
  its method and its definition of "semantically wrong". That is the whole
  refile condition; everything else follows from it.
- SWE-Bench's own maintainers acting — a correction, a revised Verified
  split, a note on the leaderboard — which would be the publisher's act F2
  wants and would make the story current on the day it happened.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.
