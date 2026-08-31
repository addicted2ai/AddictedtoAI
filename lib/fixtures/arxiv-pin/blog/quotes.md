---
title: "Quotations cited to a moving document"
date: "2026-08-20"
mentions: []
---

## The defect

The 2022 estimate concluded that ["the stock of high-quality language data will
be exhausted soon; likely before 2026"](https://arxiv.org/abs/2211.04325), a
sentence that is in that paper's v1 abstract and gone from its v2. The URL
serves whichever version is current, so the citation names a document that
moves out from under the quotation.

## Two quotations on one citation

The paper reports both ["a headline number that changed between
versions"](https://arxiv.org/abs/2310.20216) and "a second claim in the same
sentence", and each must be named so an author fixing one does not miss the
other.

## A quotation ending inside its own full stop still ends the sentence

The first paper says "one thing entirely, at some length, in its abstract."
[The second](https://arxiv.org/abs/2001.08361) is a bare reference and quotes
nothing at all, so it must NOT be flagged — a sentence boundary that is not
quote-aware would merge these two and report a defect that is not there.
