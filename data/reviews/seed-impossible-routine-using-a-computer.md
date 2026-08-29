---
job: seed-impossible-routine-using-a-computer
verdict: revise
reasons:
  - overclaiming-summary
would-cite: >-
  Someone arguing computer-use agents went from useless to superhuman in two
  years: this is the delta that should settle it, but only once it discloses
  that the 12.24% and the 86.1% were measured on different versions of
  OSWorld.
reviewer: r2-opus
date: 2026-08-28
---

Checklist: Impossible-to-Routine delta, primary preprint at end A, trade press
at end B. Sources fetched 2026-08-28.

- https://arxiv.org/abs/2404.07972: confirmed. 369 computer tasks, best model
  12.24%, humans 72.36%. v1 submitted April 11, 2024, matching the front
  matter. End A is accurately reported.
- https://venturebeat.com/technology/qwen3-8-max-arrives-with-a-bold-claim-it-outperforms-gpt-5-6-sol-max-and-fable-5-on-agentic-computer-use:
  resolves, dated August 3, 2026. Observed verbatim: "Qwen reports that
  Qwen3.8-Max scores 86.1 on the OSWorld-Verified benchmark measuring how well
  agents can use a computer operating system and applications on it, ahead of
  GPT-5.6 Sol Max (83.2) and Fable 5 (85.0)." The 86.1 figure is correct, and
  the delta's "competing agents from two other labs already above 83%" is
  supported — 85.0 and 83.2, from two labs other than Qwen's.
- The defect, verified against the benchmark's own maintainers rather than
  inferred: end A is **OSWorld**, end B is **OSWorld-Verified**, and these are
  not the same test set. Fetched https://github.com/xlang-ai/OSWorld, which
  records a 2025-07-28 update — "We have made major updates, fixed several
  issues reported by the community... making the benchmark signals more
  effective" — and instructs "Please compare your OSWorld results with the new
  benchmark results when running the latest version." The maintainers are
  explicitly telling readers that pre- and post-verification scores are not
  directly comparable, which is precisely what the metric fields do: they
  render "12.24% success; humans 72.36%" against "86.1% success" as one
  continuous progression with no version marker on either side.
- Consequence, stated plainly: a reader takes from this that agents now beat
  the 72.36% human baseline. That comparison crosses the revision too — the
  human number was measured on the original 369-task set in 2024 and has not
  been re-measured on OSWorld-Verified, so "agents now beat humans at using a
  computer" is not established by these two sources.
- Not independently verified: the size of the score shift attributable to the
  repair itself. The repo announces the fix and disclaims comparability but
  publishes no before/after delta per model, and I found no primary source
  quantifying it. So I can state that the span is confounded; I cannot state
  by how much, and this record does not.

What saves it, concretely. First, mark the version on both ends: end A's
metric should read as OSWorld (original 369-task set, April 2024) and end B's
as OSWorld-Verified, noting the 2025-07-28 revision that repaired broken
tasks. Second, either drop the 72.36% human baseline from the metric field or
state that it was measured on the original set and not re-run on
OSWorld-Verified, so the page stops implying a human-vs-agent crossing it
cannot support.

Worth saving rather than rejecting: the underlying story is real and large.
Going from one task in eight to the high eighties is not an artifact of a
task-set repair, and three labs clustered above 83% is a genuinely
interesting fact an enthusiast would not have assembled. The piece fails only
on disclosure, and the disclosure is two clauses. Revise.
