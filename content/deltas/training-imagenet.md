---
title: "Training ImageNet"
capability: "Training an image classifier to state-of-the-art accuracy on ImageNet."
impossible:
  date: "2012-12-03"
  what: "AlexNet wins ILSVRC-2012 with a 15.3% top-5 test error, against 26.2% for the runner-up, after five to six days of training on two GTX 580 GPUs."
  source_url: "https://papers.nips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf"
  metric: "five to six days on two consumer GPUs"
routine:
  date: "2018-08-10"
  what: "fast.ai trains ImageNet to 93% accuracy in 18 minutes on 16 rented public cloud instances, for about $40."
  source_url: "https://www.fast.ai/posts/2018-08-10-fastai-diu-imagenet.html"
  metric: "18 minutes, about $40"
mentions:
  - event/imagenet-2012
---

The impossible end is dated to the opening day of NIPS 2012 (December
3–8, Lake Tahoe), where the AlexNet paper was presented.

Two notes on reading the receipts. The cited PDF gives two results, and
this end quotes the second: 37.5% top-1 and 17.0% top-5 error on
LSVRC-2010, and then "a winning top-5 test error rate of 15.3%, compared
to 26.2% achieved by the second-best entry" for the ILSVRC-2012
competition the routine end's benchmark descends from. The NeurIPS HTML
landing page for the same paper still serves an earlier draft of the
abstract, giving 39.7% and 18.9% against 1.3 million images where the
camera-ready PDF gives 37.5%, 17.0% and 1.2 million; the figures here are
the PDF's, which is the version linked.

The two ends measure time and cost, not accuracy, and that is deliberate.
The fast.ai post reports "93% accuracy" without saying whether it means
top-1 or top-5, so the two accuracy figures are not directly comparable
and no comparison between them is claimed.
