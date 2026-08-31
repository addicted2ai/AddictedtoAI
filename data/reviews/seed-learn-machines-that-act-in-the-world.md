---
job: seed-learn-machines-that-act-in-the-world
verdict: approve
reasons: []
would-cite: >-
  Anyone watching a robot demo video and arguing about when it ships — this page
  hands them the supply-side reason to predict that it will not, which is that
  every other family's training examples were lying somewhere waiting to be
  collected and this family's have to be performed one at a time at the speed of
  the world.
reviewer: rec-f — foundations learn reviewer (fresh context, no edit rights, no authorship stake)
date: 2026-08-30
---

The only page of my seven that has never been reviewed by anyone. It was
created at `df395f6` and nothing has touched it since, so this is its first
pass. It got the most attention accordingly, and everything below is measured
rather than recalled.

**Sendable sentence, verbatim, as the page sets it in bold:**

> **Every other family's pile was lying somewhere, waiting to be collected.
> This family's has to be performed, one example at a time, at the speed of the
> world.**

That is a real structural surprise and it is the page's argument rather than a
decoration on it: the whole second half is that sentence being spent.

## What I checked mechanically

- **Front matter** is exactly the five permitted keys. The `outcome` string is
  byte-identical to curriculum §4. `prerequisites` match §4 exactly
  (`the-kinds-of-models`, `why-models-are-confidently-wrong`,
  `what-ai-is-used-for`); levels are foundations, orientation, orientation, so
  no prerequisite points up the ladder.
- **Unearned assumptions: none.** I computed the transitive closure rather than
  eyeballing it — `what-ai-is-used-for`, `what-ai-actually-is`,
  `why-models-are-confidently-wrong`, `what-a-model-is`, `the-kinds-of-models`,
  `what-a-neural-network-is`, `learning-from-examples`. Every learn page the
  body leans on is inside it. The two links outside the closure
  (`ai-and-work`, `where-ai-fails-people`) are the one-sentence acknowledgements
  §4 explicitly permits, and both sit *earlier* in the generated reading order
  (8 and 12 against this page's 18), so the reader has actually met them.
- **Notation and equations: zero.** Character-class sweep, no hits.
- **Currency literals: zero.** No model name, price, version or benchmark score
  anywhere on the page.
- **`mentions: []` is correct, and I verified the claim behind it** rather than
  taking §4's word. There is no wiki entry serving embodiment: the concept,
  event and technique directories were listed in full, and a case-insensitive
  sweep for robot/driverless/autonomous/self-driving/embodi/drone/vehicle
  across `content/wiki` returns four files, none of which is an embodiment
  entry (`concept/ai-winter` and `event/lighthill-report` mention robotics
  historically; `org/perplexity` and `technique/proximal-policy-optimization`
  incidentally). Nothing here to resolve to.
- **The §4 title-lever prediction checks out.** I replicated the ladder sort
  (rung, then prerequisite depth, then `localeCompare` on title) by script. The
  page lands at position 18, depth 4, directly behind
  `how-a-language-model-works` — exactly the seat §4 said the title was chosen
  to buy.

## Back-references, which is where this page was most exposed

This page was written at `df395f6`. `why-models-are-confidently-wrong` — one of
its three prerequisites — was **rewritten afterwards**, at `83ee6af`. So the
page's central second-half hinge was written against a version of its
prerequisite that no longer exists, and no prior review could have checked the
join. I checked it:

- Page: "A model's answer arrives [unchecked by anything in the process that
  made it](/learn/why-models-are-confidently-wrong)." The rewritten page still
  carries, in bold, "Nothing in the process that produces an answer checks the
  answer." **Survives.**
- Page: "a deployment is the software plus everything built to survive its
  being wrong", attributed to `what-ai-is-used-for`. That page says "A demo is
  the software. A deployment is the software plus everything built to survive
  it being wrong." **Survives, near-verbatim.**
- Page: "The first page of this surface said there are two ways to make
  software, write the rules by hand or let behaviour be learned from examples."
  Two claims, both true. `what-ai-actually-is` opens "There are two ways to make
  a piece of software do something. A person can write out the rules for it to
  follow, or a person can collect examples of the job done right and let the
  software work out its own rules." And it really is the first page — computed,
  not assumed: it is the only page with no prerequisites, so depth 0 seats it
  first.
- Page: "A [trained system learns the pattern in its pile, including the
  pattern nobody meant to put there](/learn/learning-from-examples)." Source
  page, in bold: "A trained system learns what its examples have in common, not
  what you meant them to have in common." **Faithful paraphrase.**
- Page: "One page taught you to ask what a system learned, and from what.
  Another sharpened it: what was paired with what?" Both are exact:
  `what-ai-actually-is` ends on "What did it learn, and from what?" and
  `the-kinds-of-models` ends on "What was paired with what?"

## Curriculum §4 coverage

All six must-cover beats are present and none is merely gestured at: the family
whose output is a movement rather than an artifact; the machinery being
unchanged and only the landing place differing; the examples having to be
performed, anchored to the recommender at the far end of the same axis ("No
family pays more"); the payoff that the abundance which made scale the winning
move does not transfer; simulation and the practice-world gap in one paragraph
with no taxonomy; the output as event rather than proposal, with the capped
speed, the unlearned fence and the stop; and the demo–deployment gap closing on
"At what rate is it wrong, over how much exposure was that rate measured, and
who chose the conditions?"

Every must-not is respected. No survey of robots, vehicles or companies — not
one company is named. No autonomy levels. No forecast and no verdict on how
close anything is: "improves on a different clock" is carefully a statement
about supply, and the page says so in the next sentence. No control, planning or
sensor nomenclature; reinforcement learning is never named even where the
simulation paragraph is plainly describing it, which is the right call for the
altitude. The labour and accountability questions each get exactly one sentence
and a pointer.

## Defects found — none blocking, all previously unnamed

**1. The opening pair of illustrations is the weakest link, and it is
load-bearing.** The page's second paragraph: "So the car holding its lane is
exactly as much AI as the chatbot. Underneath is the machinery you know,
weighted sums stacked in layers, trained by computed blame, and none of it
changed on the way to the steering wheel." The two devices it spends — a robot
vacuum rounding a chair leg, and lane-keep assist — are the two cases in this
family *least* likely to be learned end to end. Vacuum obstacle avoidance is
classically bump and infrared sensing with a state machine; in production
lane-keeping the lane *detection* is typically a network but the steering
*control* is typically a hand-written controller. "None of it changed on the way
to the steering wheel" overstates for exactly the examples chosen to carry it.
The page half-concedes the shape of this later — "hard limits that were never
learned from anything, written the old way, rule by rule" — but frames those as
guardrails around the model rather than as the controller itself. This is the
same defect class as the foundations review's finding 4 on
`how-machines-represent-meaning` ("every image generator"), which that review
recorded as a pass with an accuracy finding rather than a rejection, and I am
judging it identically for consistency. A one-clause repair fixes it and the
argument survives untouched.

**2. "No family pays more" is a superlative scoped to the page's own
enumeration.** It is true across the six families `the-kinds-of-models` lists,
which is what the surrounding sentence means by "that same axis". A foundations
reader will hear it as universal, and there are piles that cost more per example
than a teleoperated demonstration. Three words, one clause of scope.

**3. "Ten years of the internet's text can be read in an afternoon of
computing."** True under the page's own sense of "read" — streaming a corpus,
which the preceding sentence sets up with "copied in a millisecond and read by a
thousand machines at once." But it sits two sentences after "The text a language
model reads was written by people over decades", and a reader on this rung may
hear "read" as "trained on", where an afternoon is false by orders of magnitude.
The contrast with "Ten years of driving takes ten years" is the right contrast;
the verb is doing two jobs.

## What I verified versus what I trusted

**This page cites no external sources at all.** That is appropriate — it makes
no empirical claim that needs one, and its argument is mechanism and supply
rather than measurement. It also means there was nothing here to re-fetch, and
nothing on the page is independently checkable by a reader. Everything I
checked was internal: front matter against §4, the closure by computation, the
ladder sort by replicating it, the back-references by literal substring against
the current prerequisite files, and the empty `mentions` against a full listing
of the wiki.

Not independently verified, and stated so rather than waved past: the
engineering generalisations in "An event, not a proposal" — that the capped
speed, the unlearned fence and the stop are what most of a safety-relevant
machine consists of, and that "there is always a stop". These are asserted from
the mechanism rather than measured, they are consistent with how such systems
are actually built, and the one that would be least defensible if flat
("motionless is safe") is correctly hedged to "almost always safe". I read them
as sound but did not source them.

## Judgment

This clears the bar and is the best of my seven. It does the thing §4 asked for
that is genuinely hard: it refuses both the showreel and the ethics essay and
hands the reader a supply-side mechanism that predicts which demonstration will
not become a product. The final question — rate, exposure, and who chose the
conditions — is a tool the reader keeps, and the last two sentences land it
without a recap. Approve, with the three findings above recorded because they
are real and because nobody has recorded them before.
