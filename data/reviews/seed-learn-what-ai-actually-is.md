---
job: seed-learn-what-ai-actually-is
verdict: approve
reasons: []
would-cite: >-
  Someone in a procurement or product meeting holding a spec sheet with "AI"
  printed on it — this page hands them the one question that separates a
  trained system from a sticker ("what did this learn, and from what
  examples?") and, in the same breath, the difference between what AI claims
  in a headline (how the software was built) and what AGI claims (how much of
  what people do one system could cover).
reviewer: rec-o — background review job, fresh context, no edit rights on content
date: 2026-08-30
---

Orientation rung, depth 0, 1,088 body words. Read as it stands today, not as
the rung review found it.

**This is the only one of my seven pages that changed after
`review-orientation.md` was written**, and the change is unreviewed by anyone
until now. Measured, not assumed: `git diff 81da626 HEAD` over the seven shows
one file touched, six insertions and one deletion — the AGI passage added at
commit `3bbd945` (19:12), fifty-two minutes after the orientation review
landed (18:20). So the rung review describes this page minus two sentences,
and those two sentences are mine to judge.

## The AGI passage, judged against §4's own amendment

Curriculum §4 ("Amended 2026-08-30 (AGI)") asks for: what AGI names, in the
moving-label section, **two sentences, no section, no history of the term**,
no position on whether it arrives or what would count as arrival, and the
`outcome` string unchanged. Checked item by item against the added text:

- Two sentences. Counted: the definition sentence, then the headline-contrast
  sentence. No heading, no list, no history of the coinage. Conforms.
- Placement: inside "The label does not stay put", which is the section §4
  names as the only place on the surface that has earned it. It lands as the
  payoff of the receding-label argument the page has already made, not as a
  definition bolted on — which is precisely the distinction §4 drew.
- No position on arrival, timing or criteria. The page says what the word
  names and stops; the capstone keeps the weighing.
- Jargon before meaning: "Artificial general intelligence, or AGI, is the name
  for the destination that motion is measured against" gives the meaning in
  the sentence that introduces the term. Passes the term-of-art audit.
- `outcome` is byte-identical to §4, as the amendment required.

The second sentence is the better one and does real work: *"In a headline, AI
is a claim about how a piece of software was built, and AGI is a claim about
how much of what people do one system could cover."* That is a usable test, not
a gloss.

One observation, not a defect: the following paragraph still opens "So the map
above has a time axis", and that "So" now reaches back across the two AGI
sentences to the moving-label argument. It survives because the AGI sentences
are about the same motion, but it is the one seam the insertion left.

No AGI wiki entry exists (checked `content/wiki/concept/` — nothing matching
`general` or `agi`), so the page correctly links none; filing that stub is
wiki work, not this page's.

## The sendable sentence

> "AI did not arrive in your life on the day it started talking to you. That
> is just the day it stopped being easy to miss."

Named without charity, and the page has a second: "AI is the name software
carries while it still surprises us; afterwards it is called a spam filter, a
chess engine, or directions."

## Checked

- Front matter: exactly the five permitted keys; `outcome` verbatim from §4;
  `prerequisites: []` as §4 declares; `mentions` = `event/eliza`,
  `event/deep-blue-kasparov`, both resolving to real entries and both earned
  by the body (each is linked in prose). Script-checked, not eyeballed.
- Every must-cover beat present: rules-versus-examples as the live
  distinction; AI as umbrella over learned systems; the daily-life map (spam
  filter, feed ranking, speech-to-text, photo search, chatbot, image
  generator — all six); the moving label with chess, directions and
  autocomplete; AGI. Nothing from must-not: no history section, no mechanism
  past "learned from examples", no model families.
- Rot defence: no model name, price, context window, version number or
  benchmark score anywhere. Deep Blue and ELIZA are dated historical events
  carried by linked entries.
- ELIZA and Deep Blue facts spot-checked against the linked wiki entries:
  `event/eliza` carries the January 1966 CACM citation; `event/deep-blue-kasparov`
  carries the 1997 result. The page's "built in 1966" inherits the rung
  review's recorded nit (built 1964–66, described in the Jan 1966 paper) —
  still true as written, still worth one word.
- Notation sweep: clean, as the orientation admission test requires.

## Taken on trust

That phone chess engines now exceed Deep Blue, that route-finding was 1960s AI
research, and that autocomplete descends from a research frontier — all
universally attested, none re-fetched here. The wiki entries' own
`source_url`s were not audited; that is the wiki's review, not this one.

Approve. The page does the hardest job on the surface — it is the door — and
the AGI addition strengthened it rather than diluting it.
