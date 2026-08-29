---
job: seed-what-a-model-is
verdict: approve
reasons: []
would-cite: >-
  Someone rebutting "ChatGPT learned from my conversation" or "the model got
  dumber on Tuesday" — the model / stack / product split gives the
  layer-by-layer rebuttal in one link.
reviewer: seed-review-6.5
date: 2026-08-28
---

Checklist: education page.

- **No perishable literals**: checked the full text — no model names, no
  vendors, no prices, no versions, no benchmark numbers anywhere. The page
  is built to survive a model generation unchanged.
- **Prerequisites and outcome honest**: prerequisites empty (orientation
  level — correct); the outcome statement ("point at any AI product and say
  which part is the model ... predict which changes need a new model") is
  exactly what the page teaches, no more.
- **Mechanism claims spot-checked**: the fixed-weights / re-read-history
  account of chat memory is correct; the determinism claim is properly
  qualified later by the page itself (batching perturbs floating-point
  arithmetic — a real effect, stated as such); the sampling-vs-weights
  distinction is accurate.
- **Beats the obvious alternative**: there is no Wikipedia article shaped
  like this. The reader's actual alternative is a vendor FAQ or a forum
  thread; the four-layer claim taxonomy at the end ("four different kinds of
  claim, four different kinds of evidence") is an organizing idea, not a
  restatement. The "a behaviour change on a Tuesday is far more likely to be
  a prompt, a filter, a routing rule" passage is the practical payoff.
- Cut list: no filler openers, no hedging, no self-reference. The prose is
  tight throughout.

Approve.

## Recheck 2026-08-29 (addictedtoai-flh) — holds, verdict unchanged

This pass hunts claims that a primary document would refute. **This page
cites nothing and names nothing**, so there is no citation to refute — I
re-read the full text and confirm round one's finding: no model name, no
vendor, no version, no price, no benchmark figure, no date. The defect class
that motivated the pass (a false claim sitting under an approved record
because it was checked against a secondary source) cannot occur here, because
there is no external claim to check.

What I did check is the mechanism claims, since an explanatory page's failure
mode is being confidently wrong rather than wrongly cited:

- "a model does not remember your conversation ... the whole visible history
  is fed in again from the beginning" — correct for a stateless deployed
  model; the page is careful to attribute apparent memory to re-reading
  rather than to weights.
- "Telling a model it is wrong changes the text it is reading ... It changes
  nothing about the model" — correct, and the page immediately gives the
  right exception shape ("Systems that improve from usage do so by storing
  data and running a separate training job later").
- The seven-item stack list (system prompt, decoding settings, tools,
  retrieval, filters, orchestration) is complete enough for the claim it
  supports and contains nothing that is actually part of the weights.
- "the order in which requests get grouped together on a server can perturb
  floating-point arithmetic" — correct, and the page is unusual in stating it
  as a qualification rather than claiming greedy decoding is exactly
  reproducible.
- A knowledge cutoff described as "not a policy, not a filter, just the fact
  that the text it learned from stopped" — accurate.

Nothing to correct. Recorded so a later pass does not spend a fetch budget
looking for sources this page never claimed to have.
