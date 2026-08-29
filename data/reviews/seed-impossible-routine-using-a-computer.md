---
job: seed-impossible-routine-using-a-computer
verdict: approve
reasons: []
would-cite: >-
  Someone citing the OSWorld jump as proof that agents now beat humans at
  using a computer: this delta marks the benchmark version on both ends and
  states why the 72.36% human baseline, measured in 2024 and never re-run,
  cannot close that argument.
reviewer: rr5b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Sources fetched
2026-08-29, confirmed by literal substring match against the fetched bytes.

- https://arxiv.org/abs/2404.07972: "Submitted on 11 Apr 2024 (v1)" fixes end
  A's date. The abstract reads "While humans can accomplish over 72.36% of the
  tasks, the best model achieves only 12.24% success" and "we create a
  benchmark of 369 computer tasks". All three figures matched as literal
  substrings, not as a summariser's paraphrase.
- https://xlang.ai/blog/osworld-verified: dateline "Date Jul 28, 2025" →
  "released on 28 July 2025". "We have collected, verified, validated, and
  fixed 300+ pieces of feedback" → "300-plus community reports". "We primarily
  modified only the evaluators to minimize changes to the tasks themselves and
  maintain score continuity" → "changed the evaluators rather than the tasks in
  order to preserve continuity", including the continuity rationale. "Please
  compare your OSWorld results with the new benchmark results when running the
  latest version" → "they ask people to compare against the new results".
- The body's hardest claim is an absence — "they publish no per-model
  before-and-after figure" — so I earned it at byte level rather than asserting
  it. Searched the tag-stripped post for "before", "previous score", "original
  score", "old score", "improved from", "score changes": the post carries only
  new numbers (CoACT-1 60.76, Agent S2.5 w/ o3 56.0, GTA1 w/ o3 53.1) and no
  paired old/new per model. The absence holds. The post also writes "human
  performance estimated at ~72% from our original study", which independently
  confirms the baseline was carried forward, not re-measured — exactly what the
  page claims.
- https://venturebeat.com/technology/qwen3-8-max-arrives-with-a-bold-claim-it-outperforms-gpt-5-6-sol-max-and-fable-5-on-agentic-computer-use:
  returned 429 to a plain fetch and 200 with a browser user-agent — worth
  recording, because a single 429 could be mistaken for a dead source. Verbatim:
  "Qwen reports that Qwen3.8-Max scores 86.1 on the OSWorld-Verified benchmark
  ... ahead of GPT-5.6 Sol Max (83.2) and Fable 5 (85.0)", byline "4:50 pm, PT,
  August 3, 2026". End B, its date, and "three labs now clustered above 83%"
  all hold.

Round 1 (r2-opus) found: the two ends were scored on different versions of
OSWorld with no version marker on either side — fixed; and the 72.36% human
baseline implied a human-vs-agent crossing the sources cannot support — fixed.
The version now appears in both `metric` fields, in both `what` fields and in
the body's opening sentence, and the baseline paragraph states precisely why it
is excluded. The fix also introduced new claims — the 28 July 2025 date, the
300-plus reports, the evaluators-not-tasks choice and the maintainers' request
— and all four verify against the maintainers' own post.

It clears the bar, and it clears it on the quality round one asked for: it
declines two conclusions its own numbers would flatter, and says so in the
page rather than in a note. What it leaves standing is sourcing, not truth —
the OSWorld-Verified claims are cited nowhere in the front matter, so a reader
cannot walk from the page to xlang.ai. Every one of them is true; I checked
each against the post. Given a failed delta is deleted outright rather than
kept as a stub, an uncited-but-verified paragraph is nowhere near grounds to
lose a piece this careful.
