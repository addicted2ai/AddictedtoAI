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
