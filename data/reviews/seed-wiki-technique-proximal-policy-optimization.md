---
job: seed-wiki-technique-proximal-policy-optimization
verdict: approve
reasons: []
would-cite: >-
  The person claiming alignment training costs anything like pretraining gets
  the InstructGPT ledger: 60 versus 3,640 petaflops/s-days — under two per
  cent — and the actual scarce input, roughly 77k labeled prompts and a team
  of 40 contractors.
reviewer: r5-fable
date: 2026-08-28
---

Checklist: wiki technique entry. Sources fetched 2026-08-28.

- arxiv.org/abs/1707.06347 (v1: 20 Jul 2017, matching first_published):
  abstract verbatim — "a novel objective function that enables multiple epochs
  of minibatch updates", "have some of the benefits of trust region policy
  optimization (TRPO), but they are much simpler to implement", experiments on
  "simulated robotic locomotion and Atari game playing". The clipped_objective
  fact and the piece's opening claim about PPO's original domain both hold.
- arxiv.org/abs/2203.02155 (v1: 4 Mar 2022; fetched full text via ar5iv) —
  all eight sourced numbers verbatim: "outputs from the 1.3B parameter
  InstructGPT model are preferred to outputs from the 175B GPT-3, despite
  having 100x fewer parameters"; "preferred to 175B GPT-3 outputs 85 ± 3% of
  the time"; "a 21% vs. 41% hallucination rate" on closed-domain tasks, with
  the paper's own gloss "about half as often"; "about 25% fewer toxic outputs
  than GPT-3 when prompted to be respectful"; "a team of 40 contractors";
  SFT ~13k, RM 33k, PPO 31k training prompts; PPO-ptx as "mixing PPO updates
  with updates that increase the log likelihood of the pretraining
  distribution ... without compromising labeler preference scores"; "training
  our 175B PPO-ptx model requires 60 petaflops/s-days" against 3,640 for
  GPT-3 pretraining. The piece's "under two per cent" is 60/3,640 = 1.65% —
  arithmetic on the paper's numbers, correct.
- Not independently verified: the four-network inventory of the RLHF loop
  (policy, frozen reference, reward model, value network) is the standard
  account of PPO-based RLHF rather than a quoted claim; nothing numerical
  rests on it and it matches the InstructGPT method section's structure.

The closing section is the entry's reason to exist: the compute asymmetry and
the labeling ledger are in the paper and almost never quoted together, and
"usefulness was bought with a few tens of thousands of ranked comparisons" is
a reading the numbers support rather than a flourish. The alignment-tax
paragraph presents the regression honestly as engineered-around, not solved.
Approve.
