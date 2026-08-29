---
title: "Real work on a real desktop"
capability: "Completing multi-step tasks on a real computer — opening applications, clicking through interfaces, finishing the job."
impossible:
  date: "2024-04-11"
  what: "The OSWorld benchmark arrives and the best model completes 12.24% of its 369 real-computer tasks."
  source_url: "https://arxiv.org/abs/2404.07972"
  metric: "12.24% on OSWorld, the original 369-task set"
routine:
  date: "2026-08-03"
  what: "Qwen3.8-Max posts 86.1% on OSWorld-Verified, the repaired 2025 revision of the benchmark, with competing agents from two other labs already above 83%."
  source_url: "https://venturebeat.com/technology/qwen3-8-max-arrives-with-a-bold-claim-it-outperforms-gpt-5-6-sol-max-and-fable-5-on-agentic-computer-use"
  metric: "86.1% on OSWorld-Verified, the 2025 revision"
mentions:
  - model/qwen-qwen3-8-max
---

The two ends are scored on different versions of the same benchmark, and
the span crosses that boundary. End A is the original OSWorld. End B is
OSWorld-Verified, which the benchmark's maintainers released on 28 July
2025 after working through 300-plus community reports of broken tasks and
faulty evaluators, and which they ask people to compare against the new
results rather than the old ones. They say they changed the evaluators
rather than the tasks in order to preserve continuity, but they publish no
per-model before-and-after figure, so how much of any one score moved
because of the repair is not something this page can state.

The paper's human baseline of 72.36% is deliberately left out of the
comparison. It was measured on the original 369-task set in 2024 and has
not been re-run on OSWorld-Verified, so these two sources cannot show
agents passing humans at using a computer — only that agent scores went
from one task in eight to the high eighties, with three labs now clustered
above 83%.
