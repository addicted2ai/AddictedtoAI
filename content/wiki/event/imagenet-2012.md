---
id: event/imagenet-2012
kind: event
display_name: ILSVRC 2012
status: dead
maintenance: dormant
themes:
  - history
aliases:
  - name: ILSVRC 2012
    class: exclusive
  - name: ImageNet 2012
    class: exclusive
  - name: SuperVision
    class: shared
  - name: AlexNet
    class: manual
facts:
  - field: winning_team
    source: cited
    value: "SuperVision"
    source_url: "https://www.image-net.org/challenges/LSVRC/2012/results.html"
    accessed: "2026-08-28"
    volatility: static
  - field: top5_error_winner
    source: cited
    value: "0.15315 (with extra ImageNet Fall 2011 training data)"
    source_url: "https://www.image-net.org/challenges/LSVRC/2012/results.html"
    accessed: "2026-08-28"
    volatility: static
  - field: top5_error_supplied_data_only
    source: cited
    value: "0.16422"
    source_url: "https://www.image-net.org/challenges/LSVRC/2012/results.html"
    accessed: "2026-08-28"
    volatility: static
  - field: top5_error_runner_up
    source: cited
    value: "0.26172 (ISI)"
    source_url: "https://www.image-net.org/challenges/LSVRC/2012/results.html"
    accessed: "2026-08-28"
    volatility: static
  - field: localization_error_winner
    source: cited
    value: "0.335463"
    source_url: "https://www.image-net.org/challenges/LSVRC/2012/results.html"
    accessed: "2026-08-28"
    volatility: static
  - field: parameters
    source: cited
    value: "60 million"
    source_url: "https://papers.nips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf"
    accessed: "2026-08-28"
    volatility: static
timeline:
  - date: "2025-03-20"
    event: "the Computer History Museum releases the original source code with Google"
    source_url: "https://computerhistory.org/press-releases/chm-makes-alexnet-source-code-available-to-the-public/"
mentions:
  - concept/the-bitter-lesson
  - concept/ai-winter
---

The official scoreboard is still up, and it is more interesting than the
retelling. Two details go missing every time this contest is described.

**The team was called SuperVision.** "AlexNet" is a name the field applied
afterwards; the entry on the results page reads SuperVision, from the
University of Toronto.

**There were two entries, and the famous number is the one with extra data.**
SuperVision's best classification submission missed the correct label in its
top five guesses on 15.315% of test images, and the results page annotates it:
"Using extra training data from ImageNet Fall 2011 release." The companion
submission, marked "Using only supplied training data," scored 16.422%. The
number in circulation is the first one. The like-for-like number is the
second, and it makes no difference to the outcome, which is the point worth
keeping.

The reason it makes no difference is the shape of the rest of the table. The
next four classification submissions, from ISI, come in at 26.172%, 26.602%,
26.646% and 26.952%. Then OXFORD_VGG at 26.979%, then XRCE/INRIA at 27.058%,
then more OXFORD_VGG at 27.079% and 27.302%. Every serious non-neural system
in the world that year finished within about one percentage point of every
other one — and then there is a gap of ten points before the winner. This was
not a close contest narrowly won. It was two different regimes printed on the
same page.

The localisation task shows the same discontinuity more starkly: SuperVision
at 0.335463 and 0.341905 error, and the next entry, from OXFORD_VGG, at
0.500342.

The system behind those rows is described in Krizhevsky, Sutskever and
Hinton's NIPS 2012 paper: five convolutional layers with max-pooling, two
fully connected layers, a thousand-way softmax, and 60 million parameters,
trained — per the Computer History Museum's account — "on a computer with two
NVIDIA cards."

The code did not become public for another twelve years. On
20 March 2025 the Computer History Museum released the original source in
partnership with Google, after "a Google team led by David Bieber worked with
CHM for five years to secure its release to the public." The negotiation to
publish it took longer than the interval between the contest and the
transformer paper.
