---
job: seed-learn-when-you-cannot-trust-your-eyes
verdict: approve
reasons: []
would-cite: >-
  Anyone about to publish a spot-the-fake checklist for their newsroom or
  moderation team — this page stops them, because a published tell is a
  specification that every deceiver has already filtered against, and teaching
  distrust is the resource the liar spends.
reviewer: rec-f — foundations learn reviewer (fresh context, no edit rights, no authorship stake)
date: 2026-08-30
---

**Sendable sentence, verbatim, as the page sets it in bold:**

> **Any tell good enough to teach is good enough to train against.**

## The change since the last review, verified against the paper

One sentence changed, at `79466a8`, repairing the rung review's finding 6. The
page had quoted the blink paper as "training datasets do not contain faces with
eyes closed" while introducing it as "the reason in a line" — a verbatim
contiguous span, but one that dropped the authors' own qualifier and thereby
absolutised what they had hedged. The quote now reads "most training datasets do
not contain faces with eyes closed."

I re-fetched `https://ar5iv.labs.arxiv.org/html/1806.02877` (83,078 bytes) and
matched the repaired quotation as a literal substring including the restored
word. **Present, exact.** The repair is the one-word fix the review specified,
and the page's framing ("gives the reason in a line") is now honest because the
line it quotes now contains the qualifier.

## What else I checked

- **The back-reference into `learning-from-examples` is verbatim, and it
  matters.** Page: a detector "[learns what its examples have in
  common](/learn/learning-from-examples), and its examples are the generators
  that existed when it was trained." That page's own bolded sentence is "A
  trained system learns what its examples have in common, not what you meant
  them to have in common." The page borrows the exact clause and spends it on a
  new object. Neither `learning-from-examples` nor `the-kinds-of-models` was
  touched after the rung review, so this page's joins were stable — unlike
  several of its rung-mates.
- **Unearned assumptions: none.** Single declared prerequisite
  `the-kinds-of-models`, whose computed closure supplies `learning-from-examples`
  along with `what-a-neural-network-is`, `what-a-model-is` and
  `what-ai-actually-is`. No learn link falls outside it. The page's heaviest lean
  — the recogniser/generator asymmetry it replays in "A test is a training
  signal" — comes straight from its declared prerequisite, which teaches exactly
  that ("punishing every difference from the single stored example punishes good
  guesses along with bad").
- **Front matter**: five keys, `outcome` verbatim from §4, one prerequisite at
  the same rung, nothing pointing up.
- **No notation or equations**: zero on a character-class sweep. Worth noting
  because the GAN paragraph could easily have reached for one and instead says
  "the point where the judge does no better than a coin flip".
- **Term-of-art audit passes.** "Deepfake" is glossed in the sentence that
  introduces it ("a deepfake being a video in which someone's face or voice has
  been replaced by a machine's"), watermark, provenance and chain of custody are
  each given their meaning where they land. Nothing arrives bare.
- **No currency literals**: zero model names, prices, versions or scores. Every
  dated thing is a dated event (2018, 2014, 2019, 2022, 2023).
- **Mention resolves**: `event/stable-diffusion-release`.
- **Must-nots respected, and this is the page where that is the whole point.**
  It gives no spot-the-fake tips and says so out loud — "Which is why this page
  has given you none and will not" — and it earns the refusal from the liar's
  dividend rather than merely asserting it.

## Findings

None blocking, and none I would call a defect. Two observations.

**It is the longest of my seven at 1,679 words.** I am recording that only to
say I checked it against §3's actual test rather than against a number. §3 is
explicit that length is not evidence of a defect and that the two real failures
are two ideas sharing a file and survey prose that lists rather than argues.
Neither is present: there is one argument — the artifact stopped being able to
answer the question, so the question has to move to the chain of custody — and
every section is a step in it. The watermark and provenance sections are the
ones that would look like a survey from outside, and they are not, because each
is spent establishing a specific limit the closing section then uses. The length
is the answer, not the problem.

**The strongest structural move is one the entry did not ask for.** §4 required
the tells-die argument, the asymmetry, watermarking, provenance and the
destination. The page adds the filtering argument — "Anyone setting out to
deceive you makes many images and sends one… So the generated pictures that
actually reach you have already been filtered by every tell their maker knows"
— which needs no engineering at all and is the sharpest paragraph on the page.
It also does the honest thing about forensics rather than overclaiming the
collapse: "A laboratory with the original file, the camera it is claimed to come
from and a month to spend is not doing what you do squinting at a phone. What
ended is the amateur version." That precision is what keeps the page from being
the doom piece its subject invites.

## What I verified versus trusted

Re-fetched and matched by literal substring myself: the blink paper's qualified
sentence — the one claim that changed since any review saw this page.

**Taken on trust and named plainly:** the other six external claims. The
Scientific American scoping quote ("the early generations of deepfake videos"),
the 2014 GAN paper's coin-flip solution, the liar's-dividend sentence from the
California Law Review ("flows, perversely, in proportion to success in educating
the public about the dangers of deep fakes"), the 2023 regeneration-attack result
and its semantic-watermark caveat, and both C2PA quotations including the
watermark-fallback answer in the FAQ. The foundations rung review re-fetched all
of these against the sources' own bytes — through a mid-phrase line wrap in the
Scientific American case — and found them verbatim, and none was touched by the
one-word edit since. I did not duplicate that work and this record is not a
second independent confirmation of it.

## Judgment

The page tells the reader the uncomfortable structural truth every detection
listicle avoids, and then refuses to sell the consolation prize. "The eye lost,
and the fix is not a better eye" would be a cheap line if the page had not spent
four sections earning it mechanically, and it has. The closing observation —
that photography made the chain-of-custody question so easy for so long that we
stopped noticing it was ever the job — reframes the whole subject as a return
rather than a crisis, which is both truer and more useful. Approve.
