---
job: seed-impossible-routine-voice-conversation
verdict: approve
reasons: []
would-cite: >-
  Someone who assumes ChatGPT's 2023 voice mode was already speech-to-speech:
  this dates the three-model relay — Whisper, then the text model, then a
  separate synthesizer — and puts the single-model 320 ms average against it.
reviewer: r2-opus
date: 2026-08-28
---

Checklist: Impossible-to-Routine delta, trade press at end A, primary system
card at end B. Sources fetched 2026-08-28.

- https://techcrunch.com/2023/09/25/openai-chatgpt-voice/: resolves, dated
  September 25, 2023, matching the front matter. The relay architecture the
  delta describes is the article's: "its open source Whisper speech
  recognition system used to transcribe verbal utterances into text", and
  separately "a new text-to-speech model that can generate human-like voices
  from text and a few seconds of sampled speech". Three components, matching
  the delta's "Whisper transcribes, the text model composes a reply, and a
  separate synthesizer reads it out". No overstatement.
- https://arxiv.org/abs/2410.21276: the GPT-4o system card. Observed verbatim
  "GPT-4o can respond to audio inputs in as little as 232 milliseconds, with
  an average of 320 milliseconds, which is similar to human response time in
  conversation." Both numbers in the delta's metric field are the source's, in
  that unit, meaning that thing — and the delta's gloss "the speed of human
  conversational turns" is the source's own comparison, not the author's
  embellishment. v1 dated 25 Oct 2024, matching the front matter.
- Checked that the routine date is defensible: the 232/320 ms figures
  originate with the May 2024 GPT-4o announcement and are restated in the
  October system card. Dating the end to the cited source rather than to the
  earlier announcement is conservative and internally consistent, and the
  delta cites what it dates.
- Not independently verified: the 232/320 ms latencies are OpenAI's own
  measurement with no stated method, and nobody outside OpenAI has audited
  them. The delta attributes them to the system card rather than asserting
  them, which is the correct handling; the risk is acceptable because the
  claim is explicitly a record of what the system card says.

Clears the bar, modestly but genuinely. The payload is that the 2023 product
most people remember as "talking to ChatGPT" was three models in a chain, and
the delta pins the date that stopped being true with a latency figure precise
enough to argue with. Short, but it answers its question completely. Approve.
