---
job: seed-technique-reinforcement-learning-with-verifiable-rewards
verdict: approve
reasons: []
would-cite: >-
  Anyone arguing about whether RL actually creates new reasoning capability
  would cite the pass@k section — sharpening versus extending, the
  measurement (pass@k at large k) that separates the two claims, and the
  pointed observation of why that number rarely appears in launch posts.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content)
date: 2026-08-28
---

Checklist: wiki entry. All four cited papers fetched.

**Verified by fetching:**
- arxiv.org/abs/2411.15124 (Tulu 3, submitted 22 Nov 2024) — "a novel
  method we call Reinforcement Learning with Verifiable Rewards (RLVR)" —
  the naming fact is exact.
- arxiv.org/abs/2402.03300 (DeepSeekMath, submitted 5 Feb 2024) — GRPO
  introduced as "a variant of Proximal Policy Optimization (PPO) ...
  concurrently optimizing the memory usage of PPO"; "51.7% on the
  competition-level MATH benchmark without relying on external toolkits
  and voting techniques"; "Self-consistency over 64 samples ... achieves
  60.9%". All three figures and the no-tools/no-voting qualifiers exact.
  The body's description of the group-relative advantage (own reward minus
  group mean, scaled by group spread, replacing the value function) is the
  paper's algorithm.
- arxiv.org/abs/2501.12948 (DeepSeek-R1, submitted 22 Jan 2025) — the
  arXiv record carries the journal reference "Nature volume 645, pages
  633-638 (2025)" and DOI 10.1038/s41586-025-09422-z, exactly as the
  r1_peer_review fact states; the submission history shows "[v2] Sun, 4
  Jan 2026" — the body's "the preprint was replaced by the peer-reviewed
  version on 2026-01-04, close to a year after it first posted" is
  verified to the day, which I did not expect to be able to say. The
  abstract's claim — reasoning incentivized through pure RL "obviating the
  need for human-labeled reasoning trajectories", then distilled into
  smaller models — matches the body.
- arxiv.org/abs/2504.13837 (Yue et al., submitted 18 Apr 2025, v5 dated
  24 Nov 2025 — the body's "revised through 2025-11-24" is exact) —
  "RLVR-trained models outperform their base models at small k ... the
  base models achieve a higher pass@k score when k is large"; "Coverage
  and perplexity analyses show that the observed reasoning abilities
  originate from and are bounded by the base model"; scope is math, coding
  and visual reasoning across "six popular RLVR algorithms" (the body's
  "six RL algorithms" exact); "distillation can introduce new reasoning
  patterns from the teacher and genuinely expand the model's reasoning
  capabilities". Every element of the dispute paragraph is in the
  abstract.

**Also checked:** transclusion-free body; mentions resolve; aliases sane
(RLVR manual, Verifiable rewards shared). The opening reframe — "the
characteristic failure moves from 'the reward model likes this answer' to
'the test suite was incomplete'" — is analysis, not a sourced claim, and
it is correct analysis.

The final paragraph holds both halves of a live dispute without flattening
either, and names the discriminating measurement. That is exactly the
prose-adds-something standard. Approve.
