---
job: seed-learn-what-an-agent-is
verdict: approve
reasons: []
would-cite: >-
  Someone in an incident postmortem blaming "the model" for an agent that
  deleted a directory or drifted at step thirty — this page settles that the
  harness ran the deletion with its own permissions, and that per-step
  reliability raised to the step count, not model quality, is what failed.
reviewer: r7-fable
date: 2026-08-28
---

Checklist: education page (mechanics). Sources fetched 2026-08-28.

- This page cites no external URLs; its claims are architecture facts and
  arithmetic, both checked. 0.95^14 = 0.4877 — "worse than a coin flip after
  fourteen steps" is exact (0.95^13 = 0.513 is still above). The quadratic
  cost claim (each step re-sends the prefix, so run cost ~ square of length,
  "twice as many steps costs about four times as much") is correct arithmetic
  with the caching caveat stated.
- Internal links resolve: /wiki/concept/model-context-protocol and
  /wiki/concept/effective-context-length both exist. The MCP description
  ("standardises how a harness discovers tools and describes them... the
  descriptions arrive as tokens in the prompt") is accurate and makes no
  version or vendor claim.
- Constrained decoding described correctly: guarantees the call parses, says
  nothing about whether it was the right call.
- No perishable literals: read every line — no model, vendor, price or
  version anywhere.
- Prerequisites honest: how-a-language-model-works supplies sampling and the
  no-revision fact; why-context-is-not-memory supplies the append-only
  sequence and lossy compaction the page explicitly calls "the rung below".
  Graph checked acyclic across all ten learn pages.
- Not independently verified: "agents work better on software than on almost
  anything else" is asserted from the checker mechanism rather than a
  measurement; it is framed as an explanation, names no benchmark, and the
  mechanism itself (a checker ends the multiplication) is sound.

Clears the bar. The payload is predictive, not descriptive: the exponent
argument tells a reader where a long agent run fails before watching it fail,
and the three closing questions are a usable debugging order that no vendor
agent doc states. The "plan is text" section is the sharpest thing here — it
converts a vague worry into a mechanism. Approve.
