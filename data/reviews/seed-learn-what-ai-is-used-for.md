---
job: seed-learn-what-ai-is-used-for
verdict: approve
reasons: []
would-cite: >-
  Anyone shown a launch video and asked whether the thing is ready to buy —
  this is the page that reframes the question from "can it do the task" to
  "what is built to survive it being wrong", and gives the reader the
  card-reader, the compiler and the protein-structure exam as three worked
  cases of a deployment being duller than its demo and worth more.
reviewer: rec-o — background review job, fresh context, no edit rights on content
date: 2026-08-30
---

Orientation rung, depth 1, 1,148 body words. Unchanged since the rung review
(`git diff 81da626 HEAD` does not list it); read fresh.

## The sendable sentence

> "The AI you never notice is not the AI that stopped making mistakes. It is
> the AI whose mistakes stopped being yours."

Bolded by the page. The runner-up is the one a reader would actually deploy in
an argument: "A demo is the software. A deployment is the software plus
everything built to survive it being wrong."

## Checked

- Front matter: five keys exactly; `outcome` verbatim from §4;
  `prerequisites: [what-ai-actually-is]` as declared; `mentions` =
  `event/alphafold-casp14` and `event/stable-diffusion-release`, both
  resolving and both linked in the body.
- Must-not held cleanly: no product recommendations, no tool list, no
  mechanism, no vendor praise. Worth naming as a positive — AlphaFold does the
  work of a whole section without the page ever typing the name, which is the
  rot defence practiced rather than obeyed.
- AlphaFold claims checked against `event/alphafold-casp14`: the entry carries
  "CASP is a blind exam. Every two years since 1994", the 30 November 2020
  results date, and — decisively — the organiser attribution, "the organisers
  recognise AlphaFold as a solution to the structure-prediction grand
  challenge". The page says "its organisers announced that a fifty-year-old
  problem in biology had been solved". Attributing the claim to the organisers
  rather than asserting it in the page's own voice is exactly right, and it is
  the difference between reporting and overclaiming.
- Stable Diffusion: `event/stable-diffusion-release` carries the 22 August 2022
  weights publication and a first-week record of unplanned tools built on it.
  The page's "In August 2022 … within a week strangers had built things with
  it nobody had planned" is supported.
- Every internal link resolves; the one learn link
  (`/learn/what-ai-actually-is`) is a declared prerequisite. The two
  back-references into it — the spam filter and the feed on the map of an
  ordinary day, and "You are the second pass" — are both true of the current
  text of that page, which I re-read because it was edited today.
- Rot defence: no model names, prices, context windows, versions or benchmark
  scores. Every current fact is a dated aside or an entry link.

## A must-cover beat the rung review did not audit

§4 lists the invisible deployments as "ranking, recommendation, fraud
detection, translation, transcription, computational photography". Five of the
six are explicit and each gets its own treatment. **Recommendation is never
named**, and is folded into the ranking section ("Nobody can say which post
should have been third"). The rung review's "every must-cover beat present"
verdict on this page did not test that item; I did, by grep.

I do not treat it as a rejection ground, and the reasoning is the curriculum's
own. Ranking and recommendation are the same mechanism under the same
"no right answer available" argument the section is built on, and §3's failure
mode 5 ("the pile" — enumeration without judgment) actively penalises listing a
sixth domain that adds no new claim. The page chose depth over coverage in the
way §3 asks. It is recorded here so the omission is visible rather than
discovered later, and so anyone re-reading §4 against the page does not read
the gap as a fabrication.

## Taken on trust

Not independently verified: that machine translation and transcription
routinely route high-stakes output to a human editor; that computational
photography merges and sharpens multiple frames; that programming assistants
went into professional use quickly because compilers and tests already existed.
All three are stated as structure rather than as measurements, none carries a
number, and each is the kind of claim the page frames as an explanation of the
deployment pattern rather than as a finding of its own. The customer-service
chatbot passage is explicitly generic and names nobody.

The wiki entries' own `source_url`s were not audited — that is the wiki's
review.

Approve. The where-do-the-mistakes-go frame is an organising idea §4 did not
ask for, and it is what makes the demo/deployment distinction land as
mechanism instead of as advice.
