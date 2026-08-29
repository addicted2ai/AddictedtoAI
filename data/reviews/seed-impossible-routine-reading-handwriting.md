---
job: seed-impossible-routine-reading-handwriting
verdict: approve
reasons: []
would-cite: >-
  Someone arguing that handwriting recognition was essentially solved before
  deep learning and that the neural-network era only polished it: the 1989
  system needed digits pre-segmented and one at a time, and still refused to
  answer on 9% of them, against joined-up cursive in 20 scripts read offline on
  a phone.
reviewer: r1-opus
date: 2026-08-28
---

Checklist: Impossible-to-Routine delta, end A a NeurIPS proceedings paper, end
B a Google Research blog post announcing a shipped Android app. Sources fetched
2026-08-28.

- https://proceedings.neurips.cc/paper/1989/hash/53c3bce66e43be4f209556518c2fcb54-Abstract.html:
  resolves to "Handwritten Digit Recognition with a Back-Propagation Network",
  LeCun, Boser, Denker, Henderson, Howard, Hubbard and Jackel, in Advances in
  Neural Information Processing Systems 2. The abstract carries the numbers
  verbatim — "1 % error rate and about a 9% reject rate on zipcode digits
  provided by the U.S. Postal Service" — and describes the input as "normalized
  images of isolated digits". Every element of the delta's end A, including the
  metric's "isolated digits", is the abstract's own wording. The qualifier
  matters and I checked it deliberately: an author wanting a bigger span would
  have dropped "isolated", and this one kept it.
- Date: the body note dates end A to the opening day of NIPS 1989, given as
  November 27-30 in Denver. Confirmed those conference dates independently;
  the proceedings volume is NIPS 2 (1989), Denver, 27-30 November. The note
  discloses that the date is the conference opening rather than a publication
  date, which is the right thing to do given the paper itself carries no day.
- https://research.google/blog/google-handwriting-input-in-82-languages-on-your-android-mobile-device/:
  resolves, dated "April 15, 2015", matching the front matter. Verified each
  routine-end claim against the post's own strings: "82 languages in 20
  distinct scripts" (the metric's "82 languages, 20 scripts" exactly), "works
  with both printed and cursive writing input", and "Google Handwriting Input
  works with or without an Internet connection" — which is what the delta's
  "with or without an internet connection" is drawn from, and it is the
  load-bearing clause, since offline operation is what makes it a phone
  capability rather than a server one.
- Not independently verified: nothing material. Both ends are primary sources
  from the people who did the work, and every figure the delta states appears
  in them in the same unit and meaning.

Clears the bar. The payload is the shape of the 1989 result rather than its
existence: an enthusiast who knows LeCun read zip codes with a convolutional
net usually does not know the system was handed pre-segmented single digits and
was still allowed to decline 9% of them. Placing that next to unconstrained
cursive in 20 scripts, offline, on consumer hardware, makes the 26-year span a
widening of the same capability rather than a speed-up of it — and both ends
are the same kind of claim, measured the same way, which is why the span is
real. Approve.
