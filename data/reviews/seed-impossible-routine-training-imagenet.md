---
job: seed-impossible-routine-training-imagenet
verdict: revise
reasons: [false-or-unsupported-claim]
would-cite: >-
  Someone arguing that training costs fell because hardware got faster: the
  same benchmark went from five to six days on two consumer GPUs to 18 minutes
  and about $40 of rented cloud, with the software work named at both ends —
  once the accuracy figure matches the paper it links to.
reviewer: r1-opus
date: 2026-08-28
---

Checklist: Impossible-to-Routine delta, end A the AlexNet NeurIPS PDF, end B a
fast.ai post. Sources fetched 2026-08-28.

- https://www.fast.ai/posts/2018-08-10-fastai-diu-imagenet.html: resolves,
  dated "August 10, 2018", matching the front matter. All four routine-end
  claims are the post's own words: "train Imagenet to 93% accuracy in just 18
  minutes", "using 16 public AWS cloud instances, each with 8 NVIDIA V100
  GPUs", and "costs around $40 to run". No defect at this end.
- https://papers.nips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf:
  resolves. WebFetch's extractor could not read this PDF's text on two
  attempts, so rather than assume, I inflated the PDF's FlateDecode content
  streams with a local script and searched the resulting 688,949 characters
  directly. How I verified matters here, so a later pass can repeat it:
  the extraction drops inter-word spaces, so needles must be searched without
  them ("GTX580", "sixdays"), while digits survive intact.
- VERIFIED verbatim in that PDF: "Our network takes between five and six days
  to train on two GTX 580 3GB GPUs." The delta's training time, its "two GTX
  580 GPUs", and the metric "five to six days on two consumer GPUs" are all
  exactly right.
- **DEFECT — the accuracy figure is not in the cited source.** The string
  "18.9" does not occur anywhere in the linked PDF. What the PDF's abstract
  states is "we achieved top-1 and top-5 error rates of 37.5% and 17.0%" on
  "the ImageNet LSVRC-2010 contest", and later in the same abstract: "We also
  entered a variant of this model in the ILSVRC-2012 competition and achieved a
  winning top-5 test error rate of 15.3%, compared to 26.2% achieved by the
  second-best entry." The delta's "18.9% top-5 error" contradicts the document
  it cites.
- Where 18.9% came from, recorded so this is not re-broken later: the number is
  not invented. papers.nips.cc's **HTML abstract landing page** for the same
  paper carries an earlier version of the abstract, giving "39.7%" and "18.9%"
  and "1.3 million" images, where the camera-ready PDF at the cited URL gives
  37.5%, 17.0% and "1.2 million". The author quoted the landing page and linked
  the PDF. Anyone re-checking against the landing page will find 18.9% and
  conclude the delta is fine; it is the PDF that is cited, and the PDF says
  otherwise.
- Fix: use **15.3% top-5 error**, the ILSVRC-2012 winning entry — it is
  verbatim in the cited PDF, it is the figure that actually means
  "state-of-the-art on ImageNet", and it is measured on the ILSVRC-2012 data
  the routine end's benchmark descends from. 17.0% is the alternative if
  LSVRC-2010 is what was meant, but then the two ends are scored on different
  datasets and the delta should say so.
- Second, smaller thing to fix in the same pass: the routine end says "93%
  accuracy" without saying top-5, mirroring the fast.ai post, which never says
  either — I searched it for "top-5" and the string does not appear. As
  written, the delta pairs a top-5 error at one end with an unspecified
  accuracy at the other. Naming the metric at both ends costs one word.
- Date: the body note dates end A to the opening day of NIPS 2012, given as
  December 3-8 in Lake Tahoe. Confirmed those conference dates independently.
  The note discloses the convention, which is correct practice.

Worth saving, and the fix is one number. The payload is real and survives the
correction: five to six days on two GPUs somebody could buy, against 18 minutes
for about $40, with both ends dated and priced — that is a specific answer to
the common claim that the collapse was purely hardware, since the routine end
is a software result run on rented commodity instances. But the delta's whole
form is a dated pair with a receipt at each end, and a reader who clicks the
receipt and cannot find the number is exactly the reader this surface is for.
Revise.
