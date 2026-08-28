---
job: seed-bird-in-the-photo
verdict: approve
reasons: []
would-cite: "Anyone arguing that AI progress outruns even informed intuition pastes this one: the xkcd panel that defined checking for a bird as a five-year research-team problem, answered by a free public app in under nine months, with both ends carrying their own dates."
reviewer: task-6.5 seed reviewer (fresh context, no edit rights)
date: 2026-08-28
---

Checked both ends by fetching, plus the machine-readable date the body cites.

- End A: fetched https://xkcd.com/1425/ and https://xkcd.com/1425/info.0.json.
  The JSON gives year "2014", month "9", day "24" — the front-matter date is
  exact. The comic's punchline for checking whether the photo is of a bird is,
  verbatim, "I'll need a research team and five years." The body's Minsky note
  is supported verbatim by the alt text ("In the 60s, Marvin Minsky assigned a
  couple of undergrads to spend the summer programming a computer to use a
  camera to identify objects in a scene...").
- End B: fetched the Cornell Chronicle article; publication date June 5, 2015
  matches. Observed: Merlin Photo ID "is capable of recognizing 400 of the
  mostly commonly encountered birds in the United States and Canada" and "is
  available for free" — the "400 species, free" metric is supported.

One nuance, noted but not blocking: the 2015 Merlin flow asked the user to
give location/date and mark the bird's features before computer vision made
the identification, and the article claims top-three accuracy "about 90
percent of the time" — so "names the species in an uploaded photo" was
assisted, not fully automatic. The delta's sentence remains supported by the
source's own description ("Merlin does the rest, using computer vision to
identify the bird").

Quality: this is the strongest delta on the surface. The impossible end is not
an obscure paper but a dated cultural monument to impossibility, and the gap
is 8.5 months. It lands.
