---
date: 2026-09-07
slug: microsoft-vibevoice-asr-streaming-7b
type: post
status: declined
declined_by_job: j-20260907-05
failed_test: worth a stranger's attention — and F1/F3, weighed and failed
---

# Declined: Microsoft VibeVoice-ASR-Streaming-7B, and the `audio` domain generally

## The story considered

`microsoft/VibeVoice-ASR-Streaming-7B`, created 2026-09-02, MIT licence,
`automatic-speech-recognition`, 1,144 downloads and 130 likes at the time of
this sweep. Retrieved 2026-09-07 from the registered `hf-hub-models` radar feed
— `https://huggingface.co/api/models?sort=trendingScore&direction=-1&limit=50...`
(rank 26).

This is recorded because **`audio` is a domain in the closed vocabulary in
which this site has published nothing**, and this was the only candidate in it
on the whole sweep. The frontier question is asked of every domain on every run
precisely so that a domain nobody swept does not go quiet without anybody
deciding it should. It was swept. Nothing qualified, and that is the finding.

The other audio-adjacent items seen and not pursued: `BreezeBlue/Breeze-TTS-2`
(2026-08-25, a fortnight old) and `facebook/mms-300m` (2023), both from the same
listing; and arXiv:2609.04561, "Reducing Hallucinated Transcripts in Whisper",
an incremental fix to a four-year-old model.

## Which frontier criteria it was weighed against, and why it failed

**F1** — "a capability shown for the first time, with an artifact anyone can
check." The weights are the artifact and they are public under MIT, so the
artifact half holds. The capability half does not: streaming ASR is not shown
for the first time by anything here, and this run found no claim that it is. An
open checkpoint doing a thing many checkpoints already do is not a first
showing.

**F3** — "a release by a covered organisation of a model it positions as its
frontier, or an open-weights release matching a covered lab's frontier on a
published measure." Microsoft is a covered organisation, but nothing positions
a 7B streaming ASR model as its frontier, and this run found no published
measure on which it matches one. The non-qualifying list's "a new checkpoint"
covers it exactly.

**The domain stays quiet.** Flagging this to give `audio` a record would be the
failure the criteria name in as many words.

## Which of the two tests it failed

**Worth a stranger's attention.** 1,144 downloads five days after release, and
a would-send form — "Microsoft put a 7B streaming ASR model on the hub" — that
nobody sends to anybody.

## What would make it worth refiling

- A published word-error-rate result putting it at or above the closed ASR
  leaders on a third-party benchmark, which would be F2 or F3.
- A licence or access change on a widely used speech model, which would be F5.
- A first-shown audio capability with a public demo — real-time simultaneous
  translation, speaker-attributed diarisation at frontier accuracy — which is
  what an F1 in this domain would actually look like.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.
