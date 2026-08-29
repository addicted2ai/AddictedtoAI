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

## Recheck 2026-08-29 (addictedtoai-flh) — holds, verdict unchanged

**"Six RL algorithms" is the claim I tried hardest to break, and it survives
two independent tests — but my first search reported it absent, so record the
trap.** Searching `arxiv.org/abs/2504.13837` for the string `six RL
algorithms` returns ABSENT. The abstract writes it as "**six popular RLVR
algorithms** perform similarly and remain far from optimal in leveraging the
potential of the base model". That is a false absence created by my own
paraphrased needle, and it nearly became a false finding against a correct
entry.

I then verified the count independently of the abstract's adjective, by
enumerating the paper's own list in section 4.3: "We re-implement popular RL
algorithms using the VeRL framework ... including PPO ..., GRPO ...,
Reinforce++ ..., RLOO ..., ReMax ..., and DAPO". That is exactly **six**:
PPO, GRPO, Reinforce++, RLOO, ReMax, DAPO. Stated and enumerated agree.

The rest of the dispute paragraph, verbatim from the abstract: "while
RLVR-trained models outperform their base models at small k (e.g., k = 1),
the base models achieve a higher pass@k score when k is large"; "Coverage and
perplexity analyses show that the observed reasoning abilities originate from
and are bounded by the base model"; "distillation can introduce new reasoning
patterns from the teacher and genuinely expand the model's reasoning
capabilities"; and the scope "across various model families, RL algorithms,
and math, coding, and visual reasoning benchmarks". Dates: "[Submitted on
18 Apr 2025 ( v1 ), last revised 24 Nov 2025 (this version, v5)]" — the
entry's "revised through 2025-11-24" is exact.

DeepSeekMath (42,465 B, "[Submitted on 5 Feb 2024]"): "DeepSeekMath 7B has
achieved an impressive score of 51.7% on the competition-level MATH benchmark
without relying on external toolkits and voting techniques" and
"Self-consistency over 64 samples from DeepSeekMath 7B achieves 60.9% on
MATH" — both halves of `deepseekmath_math_score` verbatim, with the
no-tools/no-voting qualifier the entry preserves. The critic claim is the
paper's, not the entry's gloss: "GRPO foregoes the critic model, instead
estimating the baseline from group scores, significantly reducing training
resources", and "As the value function employed in PPO is typically another
model of comparable size as the policy model, it brings a substantial memory
and computational burden" — which is exactly "a second network roughly the
size of the policy, disappears, and so does its memory".

Tulu 3 (46,491 B, "[Submitted on 22 Nov 2024]"): "a novel method we call
Reinforcement Learning with Verifiable Rewards (RLVR)". The `named_in` fact
is exact, and the entry's "the practice is older than the name" is a claim
about naming, which the word "novel" here is about the method as packaged;
not contradicted.

R1 (75,710 B): the arXiv record carries "Journal reference: Nature volume
645, pages 633-638 (2025)" and "Related DOI : https://doi.org/10.1038/
s41586-025-09422-z" — the `r1_peer_review` fact reproduced field for field —
and "[Submitted on 22 Jan 2025 ( v1 ), last revised 4 Jan 2026 (this version,
v2)]", so "replaced by the peer-reviewed version on 2026-01-04, close to a
year after it first posted" is exact at 347 days.
