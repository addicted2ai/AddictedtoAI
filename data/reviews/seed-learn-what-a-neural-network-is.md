---
job: seed-learn-what-a-neural-network-is
verdict: approve
reasons: []
would-cite: >-
  Someone pushing back on "nobody knows how AI works" and wanting to be
  precise rather than merely contrary — this page splits the sentence in two,
  showing that every multiply and threshold is ordinary and checkable by hand
  while nothing explains why the particular settings training found produce
  the behaviour they produce, and that the unreadability is not untidiness but
  the same property that makes the thing work at all.
reviewer: rec-o — background review job, fresh context, no edit rights on content
date: 2026-08-30
---

Foundations rung, depth 2, 1,157 body words. Unchanged since
`review-foundations.md`; read fresh. One check on this page could not have
been done by that review, and it is the most valuable thing in this record —
see below.

## The sendable sentence

> "A neural network is unreadable for the same reason it works: everything it
> knows is stored across the same weights as everything else it knows."

Bolded by the page. A second candidate carries the closing section: "The
sentence is false about the machinery and true about what the machinery has
come to hold."

## The check the earlier review could not have run

`review-foundations.md` (committed 18:31) verified this page's back-references
into `what-a-model-is` and found them true. **`what-a-model-is` was then
rewritten wholesale at 19:18** — commit `3d61355`, 189 lines changed, the
largest edit to any page in my set's neighbourhood. Every verification of a
cross-page reference into that file was invalidated by an edit that landed
forty-seven minutes later, and this page makes two such references. Nobody has
checked them against the page that now exists. I did:

1. The page opens its second paragraph: "A model, you already know, is a fixed
   array of numbers plus a description of the arithmetic to run on them."
   Rewritten `what-a-model-is`, section heading "The model is a fixed
   collection of numbers", body: "an enormous collection of numbers, millions
   upon millions of them, together with a fixed recipe for the arithmetic to
   perform on them." **Holds** — both halves, near word for word.
2. "the millions of adjustable dials from the training loop, which the model
   page called weights in passing." Rewritten `what-a-model-is`: "The numbers
   are called weights, and sometimes parameters." **Holds**, and "in passing"
   is an accurate description of how that page treats it — one clause.

The third back-reference, to the filing cabinet in `learning-from-examples`
("store every example, look each one up on demand, score perfectly, generalise
not at all"), points at a file that has not changed, and the cabinet is there.

So: no breakage. The rewrite of the hub page preserved what its dependents
quote, which is what curriculum §4 demands of anyone editing a load-bearing
page. Recording the pass rather than the absence of a failure, because the
check was worth running and its result is not inferable from either review.

## Checked

- Front matter: five keys exactly; `outcome` verbatim from §4; prerequisites
  `[learning-from-examples, what-a-model-is]` as declared, both on an earlier
  rung so the edge points down; the single mention `concept/emergence`
  resolves and is earned — the body links it on a real dispute rather than
  listing it.
- Transitive closure: `learning-from-examples`, `what-a-model-is`,
  `what-ai-actually-is`. Nothing on the page leans outside it. The one link
  beyond the closure, to `/learn/looking-inside-a-model`, is an inline pointer
  ("a research field exists to run exactly those experiments"); the sentence
  stands unfollowed, and the target file exists, so no unresolved reference.
- Term-of-art audit, the check that rejected this page's rung-mate. Every term
  is given its meaning where it lands: *weight* ("Each weight sets how much
  weight one incoming signal carries in the total"), *neuron* ("because it
  began as a deliberate cartoon of a brain cell"), *layer* ("Neurons are
  stacked in layers. The first layer reads the input itself"), and *gradient
  descent* ("the gradient being the slope of the wrongness under each weight,
  the descent being what the weights do on it") — all in the introducing
  sentence. `emergence` is deliberately never used as a word; the page says
  "a live argument" and links. Passes cleanly.
- Notation sweep by character class: no equations, no notation, no bare
  variables. The rung forbids them and the page has none.
- Must-cover, all five beats: from a fixed array of numbers to what they do
  (multiply, add, compare); layers as re-description, with the honesty caveat
  that the story is tidier in the telling than in any real network; training
  as blame assignment with gradient descent named and not derived; why nobody
  can read the numbers, seeding `looking-inside-a-model`; why scale changed
  kind rather than degree.
- Must-not: no calculus; no backpropagation mechanics — the page describes
  what the procedure delivers ("for every weight at once, it can be worked out
  whether up or down would have helped, and by how much") without ever
  naming or deriving it; no transformer specifics.

## Two claims I pressed on and cleared

- *"There is no trial and error anywhere in this."* Strong, and correct as
  scoped: the sentence denies that the update *direction* is found by trying,
  which is the point the section makes ("Not found by trying. Because
  everything between input and guess is arithmetic, the question has an exact
  answer"). It is not a claim that training involves no randomness, and the
  page does not need one.
- *"None of these was a target of training."* True of the training objective,
  which is what "target" means here; translation and code are in the data but
  were not what the loop scored. The page makes this claim without having
  taught next-token prediction, and correctly does not lean on it — the claim
  is about outcomes, and the mechanism belongs to `how-a-language-model-works`
  a rung further on.

The threshold unit ("passes the total onward if it is big enough. Otherwise it
passes nothing") is a simplification of real activation functions. §4 asked for
"weighted sums and thresholds" in as many words, so this is the entry's
instruction executed, not a defect.

## Taken on trust

`concept/emergence` was not audited against its sources — the page defers the
gradual-versus-jumps dispute to the entry rather than adjudicating it, which is
the correct move and puts the verification burden on the wiki's own review.
This page cites no external URL; its factual load is architecture and one
linked dispute, so there was nothing here to fetch.

Approve. It is the bridge the whole mechanism spine stands on and it crosses it
with zero notation, which is the thing §4 said the textbook version and the pop
version each fail in opposite directions.
