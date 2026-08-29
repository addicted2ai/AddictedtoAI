---
job: seed-human-parity-speech-recognition
verdict: approve
reasons: []
would-cite: "Useful to anyone measuring the lab-to-commodity lag: the transcription result Microsoft billed as a historic milestone in 2016 became weights anyone could download and run six years later."
reviewer: task-6.5 seed reviewer (fresh context, no edit rights)
date: 2026-08-28
---

Checked both ends by fetching.

- End A: fetched the Microsoft blog post; publication date October 18, 2016
  matches. Observed: 5.9 percent word error rate on the Switchboard task,
  "about equal to that of people who were asked to transcribe the same
  conversation," under the headline "Historic milestone: Microsoft
  researchers achieve human parity in conversational speech recognition" —
  the "first human-parity error rate" claim and the 5.9% metric are
  supported.
- End B: fetched https://arxiv.org/abs/2212.04356. Submission history shows
  "[v1] Tue, 6 Dec 2022" — front-matter date exact. Abstract states
  verbatim: "We are releasing models and inference code to serve as a
  foundation for further work on robust speech processing," mentions scaling
  to "680,000 hours of multilingual and multitask supervision," and says the
  models "approach their accuracy and robustness" when compared to humans.
  Every clause of the delta's end-B sentence and metric is supported.

One nuance, noted but not blocking: OpenAI's public Whisper release actually
preceded this paper by about ten weeks (September 2022). Dating end B to the
cited paper is self-consistent and conservative — it shortens no gap in the
site's favor.

Quality: research first to open commodity in six years is a solid, honestly
told instance of the surface's pattern, though the pairing (parity as end A,
"approaching" humans as end B) asks the reader to see openness rather than a
score as the delta. Approve, mid-pack.

## Recheck 2026-08-29 (addictedtoai-flh) — holds, verdict unchanged

**The format-variant trap is live on this one and a later pass should not
fall into it.** The Microsoft blog (128,275 B) does not contain the string
`5.9%` anywhere. It contains "The researchers reported a word error rate
(WER) of **5.9 percent**, down from the 6.3 percent WER the team reported
just last month." A byte search for the delta's `5.9%` returns ABSENT and
means nothing.

The superlative was the thing worth testing, since `first` is the class of
claim a secondary source most often overstates. The page carries three
independent supports and I quote all three so this does not get re-opened:
the headline "Historic milestone: Microsoft researchers achieve human parity
in conversational speech recognition"; "The 5.9 percent error rate is about
equal to that of people who were asked to transcribe the same conversation";
and "it's **the lowest ever recorded** against the industry standard
Switchboard speech recognition task". Achieving parity, at the lowest rate
ever recorded, billed as a historic milestone — "the first human-parity error
rate on the standard Switchboard task" is supported. Note the string
"first time" is itself ABSENT; the support is the three sentences above, not
that phrase.

End B re-fetched, `arxiv.org/abs/2212.04356` (40,046 B): "[Submitted on
6 Dec 2022]"; "When scaled to 680,000 hours of multilingual and multitask
supervision"; "When compared to humans, the models approach their accuracy
and robustness"; "We are releasing models and inference code". Every clause
of the routine end holds.

The round-one nuance about Whisper's September 2022 release preceding the
paper still stands and is still not blocking, for the reason given then.
