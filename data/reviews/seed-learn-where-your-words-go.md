---
job: seed-learn-where-your-words-go
verdict: approve
reasons: []
would-cite: >-
  Anyone in a procurement or IT thread where somebody has said "we can't use it,
  the AI will learn our data" — this page separates the false claim from the
  true one, because the model cannot retain what you typed and the company
  storing your chats is a different question with a different answer per account
  type.
reviewer: rec-f — foundations learn reviewer (fresh context, no edit rights, no authorship stake)
date: 2026-08-30
---

**Sendable sentence, verbatim, as the page sets it in bold:**

> **Of everything your message passes through, the model is the only part built
> to forget it.**

A second one people will send: "Opt-out is the name for a switch whose default
position is on."

## Correcting my own brief's premise

My brief said all seven of my pages had been edited since the rung reviews. For
this page that is **false**. `git log` shows a single commit, `fb6ccb5`, and
`git diff 8a7731d HEAD -- content/learn/where-your-words-go.md` prints nothing.
The page is byte-identical to what the foundations rung review read and passed
with no findings. I record that rather than implying a fresh pass I did not run.

## The join that did need checking

The page's whole pivot rests on one prerequisite, and that prerequisite was
**rewritten after** the rung review, at `83ee6af`. No prior review has checked
this join.

Page: "It fetches the earlier turns of your conversation from a database and
sends them along too, because [the model keeps nothing between
requests](/learn/what-a-model-is) and what looks like memory is re-reading."

The rewritten `what-a-model-is` still carries, in bold, "**What looks like memory
is re-reading.**" — and around it "There is no diary inside, no log of past
conversations, no compartment where things it picks up from you are kept" and
"Every turn, the whole visible conversation is fed to the model from the
beginning". **The join survives intact**, and the rewrite evidently preserved the
sentence its dependents quote.

The page's second lean on the same prerequisite — "'Now the AI knows this about
me' is false in the only sense the words have: the model cannot retain what you
typed" — is likewise supported: "it is exactly the same object afterwards as
before. It does not accumulate. It cannot."

## Mechanical checks

- Front matter is the five permitted keys; `outcome` verbatim from §4; one
  prerequisite, orientation under a foundations page, nothing pointing up.
- **Unearned assumptions: none.** Computed closure is `what-a-model-is` and
  `what-ai-actually-is`; the page has no learn links outside it and no wiki
  links at all.
- No notation or equations: zero on a character-class sweep.
- **No currency literals, and this page was the most exposed to them** — a
  privacy page invites naming providers and quoting retention periods. It names
  none. The retention treatment is deliberately structural: "The number differs
  between products and changes over time; what lasts is the fact that a number
  exists and can be looked up." That is better than the dated aside §4 would
  have permitted, because it cannot rot at all.
- `mentions: []` matches §4 ("none required"), and the prose earns none — every
  concept it teaches is product architecture rather than a wiki-shaped term.

## §4 coverage

All must-covers present: the journey of one message, including the two-company
case most readers have never considered; the four destinations, each with its
own heading-level treatment; the load-bearing `what-a-model-is` distinction
applied ("the model remembers me" false, "the company stores my chats"
separately true or false); enterprise versus consumer defaults as structure
rather than as anyone's policy; the local alternative in exactly one closing
sentence.

Must-nots respected: no provider-by-provider table, no legal or purchasing
advice, and — the hard one on this topic — neither alarm nor reassurance. The
page states "The useful question is never whether the company's machines can see
what you type. They must" without either dramatising it or soothing it.

## Findings

None blocking, and one worth naming that no review has recorded.

**The one unsourced empirical claim.** "Text that is distinctive, or duplicated
across the pile, can occasionally be reproduced by the finished model close to
verbatim, which is why inclusion in a training set is neither a lookup nor
nothing." This is the only sentence on the page making a claim about measured
model behaviour rather than about system architecture, and it carries no source
and no wiki deferral. It is well established in the memorisation and extraction
literature and I believe it is true; I did not re-verify it, and I am flagging it
because it is doing real work — it is the sentence that stops the "it mostly
dissolves" paragraph from being falsely reassuring, which is exactly the failure
mode §4 told this page to avoid. A wiki deferral would strengthen it. That is a
suggestion, not a defect I am rejecting on.

## What I verified versus trusted

Verified locally: both back-references against the current rewritten text of
`what-a-model-is`; the closure by computation; front matter against §4; the
notation, currency and mentions sweeps.

Nothing on this page cites an external URL, so there was nothing to re-fetch.
The memorisation sentence above is the one claim I am taking on trust, and it is
named rather than buried.

## Judgment

The D8 worry that this page's durable core would prove too thin did not
materialise, and the reason it did not is the structural move: it refuses to
answer "is it private?" and instead converts the question into five things a
policy either answers or does not. That converts an anxiety topic into a
checkable one, which is the same trick the best pages on this surface pull.
Approve.
