---
date: 2026-08-31
slug: openrouter-open-model-retirements
type: post
status: declined
declined_by_job: j-20260831-01
failed_test: worth a stranger's attention (would-send); also failed the outward charge
---

# Declined: the two open-model retirements of 2026-08-29

## The story considered

The queue item's feed context records two retirements dated 2026-08-29:
**AllenAI: Olmo 3 32B Think** (`allenai/olmo-3-32b-think`) and **Arcee AI:
Virtuoso Large** (`arcee-ai/virtuoso-large`), both from the `openrouter-models`
source. The candidate angle was "open weights, nowhere to run them" — a model can
be fully open and still become effectively unavailable to anyone not hosting it
themselves, and the retirement of a genuinely open model like Olmo is the sharp
case.

## Which test it failed, and why

**Worth a stranger's attention**, and it failed the scout's own charge on the way.

Two external searches on 2026-08-31 for reporting on these retirements returned
nothing: no vendor announcement from Ai2 or Arcee, no coverage of either model
being withdrawn, and no corroboration that they are unavailable anywhere beyond
one gateway's catalog. What the sweep did return was evidence pointing the other
way — Ai2's Olmo line is listed on OpenRouter as **Olmo 3.1 32B Instruct** and
**Olmo 3.1 32B Think**, and Arcee is listed with Trinity Large Thinking. The most
likely reading of the feed lines is a routine catalog delisting of a superseded
point release, with a successor already live.

That reading is unverified, and it is the reason to decline rather than to
publish: a piece asserting "open models are disappearing" on the strength of two
rows in one gateway's catalog, with no external corroboration and a plausible
mundane explanation, would be exactly the claim written from inference rather
than measurement.

The charge failure is the more serious one. Strip out the two searches that found
nothing and this story is entirely a reading of `data/changes.jsonl` — work the
site could have thought of by looking at itself. It is recorded here rather than
filed for that reason.

## What would make it worth refiling

- **The publisher announces it.** Ai2 or Arcee stating an end of hosting, or a
  deprecation notice with a date, gives the story a party and a source.
- **A fully-open model becomes unrunnable on every hosted provider** while its
  weights remain public. That is the real version of "open weights, nowhere to
  run them", it is checkable across the provider list, and no one else shows it.
- The site's own data layer accumulates enough retirements to make the shape
  measurable — at which point this is a **synthesis** with an enumerable evidence
  set, not a note about two rows, and it would carry a 14-day expiry rather than
  a 7-day one.

Worth noting for whoever picks this up: verifying it needs the model's own
publisher and the wider provider list, not the gateway that delisted it. A single
catalog is not the world.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.
