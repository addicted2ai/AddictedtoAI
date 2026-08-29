---
job: seed-impossible-routine-face-verification
verdict: revise
reasons: [overclaiming-summary]
would-cite: >-
  Nobody could safely cite it as it stands. The argument it looks equipped to
  settle — that phone face-unlock is the LFW photo-verification line arriving
  in consumers' hands — is the one thing it asserts rather than shows, because
  its routine end is a depth sensor doing a different job.
reviewer: r1-opus
date: 2026-08-28
---

Checklist: Impossible-to-Routine delta, end A a CVPR paper's publication page,
end B a product press release. Sources fetched 2026-08-28.

- https://research.facebook.com/publications/deepface-closing-the-gap-to-human-level-performance-in-face-verification/:
  resolves. Carries "Our method reaches an accuracy of 97.35% on the Labeled
  Faces in the Wild (LFW) dataset" and "reducing the error of the current state
  of the art by more than 27%", and gives CVPR, June 24, 2014 — matching the
  front-matter date. The delta's "cutting the state of the art's error by more
  than a quarter" is a fair and slightly conservative restatement of "more than
  27%". No factual defect at this end.
- https://www.apple.com/newsroom/2017/09/the-future-is-here-iphone-x/: resolves,
  dated September 12, 2017, matching the front matter. Carries "Face ID
  projects more than 30,000 invisible IR dots", "all of the processing is done
  on-device and not in the cloud", and "Face ID only unlocks iPhone X when
  customers look at it". Small imprecision worth fixing in passing: the metric
  says "30,000 infrared dots" where the source says "more than 30,000".
- **DEFECT — the two ends are not the same capability, so the delta's summary
  claims more than its receipts support.** The stated capability is "Verifying
  that two images show the same face." Face ID does not compare two images. By
  the same Apple release: "The IR image and dot pattern are pushed through
  neural networks to create a mathematical model of your face" — a
  structured-light depth-plus-infrared template, matched one-to-one against an
  enrolled model on dedicated sensor hardware. Its accuracy comes from the dot
  projector, not from the 2D face-embedding line that DeepFace belongs to. End
  B therefore does not show end A's capability becoming routine; it shows a
  different, sensor-dependent capability shipping. The author flagged this
  itself, and on re-checking both sources I think the flag is correct.
- **Second defect, which the author did not flag: end A is not a
  first-of-its-kind.** A 27% error reduction over an existing state of the art,
  on an existing benchmark, against a human ceiling of roughly 97.5% on that
  same benchmark, is an incremental step on a leaderboard — a convenient early
  example rather than the moment the thing became possible. Face verification
  from photographs was already deployed commercially before 2014. So the
  "impossible" end does not carry the weight the form puts on it, and the
  2014-2017 span is partly an artifact of which two points were chosen.
- Fix, if it is kept: pick one capability and date both ends to it. Either
  (a) keep image-to-image verification and replace end B with a genuine
  commodity milestone for it — a general-purpose face-verification API, or
  open models saturating LFW — or (b) restate the capability as unlocking a
  device with your face, and replace end A with the pre-Face-ID state of that,
  which is a real and well-documented span. Do not fix this by editing the
  capability sentence alone; the mismatch is between the two ends, not in how
  they are described.
- Not independently verified: nothing outstanding. Both cited pages resolve and
  say what the delta says they say. The defect is structural, not factual —
  every individual sentence here is true.

The author offered this as cuttable, and I reach the same place by a different
route: the problem is not that a claim is wrong, it is that the pair does not
demonstrate what the pair is for. An enthusiast reading it learns two facts
they probably knew and is invited to infer a lineage between them that does not
hold. Cutting it costs the surface nothing. Revise, and cutting is an
acceptable resolution of this record.
