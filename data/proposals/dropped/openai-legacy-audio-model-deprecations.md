---
date: 2026-09-06
slug: openai-legacy-audio-model-deprecations
type: post
status: declined
declined_by_job: j-20260906-12
failed_test: worth a stranger's attention (would-send); also fails "current"
frontier_criterion_weighed: F5
---

# Declined: OpenAI's scheduled audio and transcription deprecations

## The story considered

OpenAI's deprecations page carries two dated notices: on 20 July 2026,
legacy audio, realtime and transcription model families and snapshots
scheduled for removal from the API on 20 January 2027; and on 26 August
2026, `whisper-1`, `gpt-4o-transcribe`, `gpt-4o-mini-transcribe` and
`gpt-4o-transcribe-diarize` scheduled for removal on 26 February 2027. The
angle considered was the retirement of the Whisper API lineage — Whisper is
the model that made open speech recognition ordinary, and its hosted
endpoint being given a removal date is a small end of an era.

## Which test it failed, and why

**Worth a stranger's attention.** A deprecation notice with a six-month
runway is exactly the material this site's data layer exists to carry
without asking a reader for anything: a scheduled removal is a bindable,
dated fact on a model record, not a piece of prose. The editorial split is
explicit — breadth lives in the structured layer and the bar applies to
pages that ask to be read. Prose here would be a restatement of a table.

It also fails **currency**: both notices are dated weeks before this sweep
(20 July and 26 August 2026), and neither is news today.

## Weighed against the frontier criteria, and why the flag fails

**F5** — "a material change in access: a frontier model withdrawn, gated, or
opened." A withdrawal is the right shape but the wrong subject. `whisper-1`
and the `gpt-4o-transcribe` family are legacy models being retired on
schedule in favour of successors that are already available; none is a
frontier model, and nothing about anyone's access to frontier capability
changes. F5 is about the frontier moving behind or out from behind a gate,
not about ordinary lifecycle management, and reading it otherwise would make
every deprecation page a frontier event.

## What would make it worth refiling

- The open-weights Whisper models themselves being withdrawn or relicensed —
  that is a change to something people actually depend on and cannot
  replace by switching an endpoint.
- A removal date arriving with no successor for a documented capability,
  particularly diarization, which is the one item on the list without an
  obvious drop-in replacement.
- Evidence that the January or February 2027 dates moved.

Better handled as data: the deprecation dates belong on the relevant model
records as bound facts, which is a `pulse`/`entry` question rather than a
post.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.
