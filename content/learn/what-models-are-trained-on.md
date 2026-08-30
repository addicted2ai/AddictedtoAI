---
title: What models are trained on
level: foundations
outcome: >-
  You can say where training data actually comes from, what gets filtered out
  and by whom, and why the data sets the ceiling on what any model can learn.
prerequisites:
  - learning-from-examples
  - why-models-are-confidently-wrong
mentions:
  - concept/model-collapse
  - event/gpt-2-staged-release
---

Nobody has read a model's training data. Most of it is a copy of the public
web, gathered by a program that follows links and saves whatever it lands on,
and there is far too much of it for anyone to look through. What is documented
is not the pile but the chain of decisions that produced it, and that chain is
the shape of the finished model.

## What the crawl can reach

Text has to be written down rather than said, and to sit somewhere a crawler
can reach, which rules out anything behind a login, a paywall, an app, or a
company's own systems. Anything older than the web exists only where somebody
troubled to scan it. Each of those bars removes a population, and none removes
a random one.

A [2021 study of one widely used collection of scraped
pages](https://arxiv.org/abs/2104.08758) found just over half of them hosted in
the United States, while the countries with the next-largest English-speaking
populations, India, Pakistan, Nigeria and the Philippines, supplied at most 3.4
per cent as many URLs as the United States and in two cases under a tenth of
one per cent. That is the geography of a single language inside a pile meant to
carry it.

The same lopsidedness runs through everything else the web is uneven about.
Public argument leaves enormous text behind; ordinary competence leaves almost
none, because nobody writes down what everyone already knows. A trade practised
by a million people can leave less behind than a controversy followed by a
thousand.

Register skews the same way, and the shape of it is stranger than it sounds.
The most represented single site in that collection was not a news outlet or an
encyclopedia but Google Patents, and patent text on that site arrives partly
machine-translated from other languages. A pile gathered to teach a machine how
people write is substantially filled with patent prose, some of it put into
English by another machine.

## Most of the work is throwing text away

Collecting the crawl is the cheap part. The 2020 paper describing GPT-3
[reports the ratio without ceremony](https://arxiv.org/abs/2005.14165): 45TB of
compressed plaintext before filtering, 570GB after. About one part in eighty
survived, and the choosing was done by software.

Two jobs account for most of that. One is removing duplicates. The same text
sits on the web thousands of times over, in syndicated articles, mirrored
pages, template boilerplate and scraped copies of scraped copies, and a pile
holding one document ten thousand times teaches that document ten thousand
times. A [2021 paper on
deduplication](https://arxiv.org/abs/2107.06499) reports finding, in the same
collection studied above, a single 61-word English sentence repeated over
60,000 times.

The other is deciding what counts as good writing, and this is where a filter
acquires an author. The method the GPT-3 paper describes is to train a small
classifier to tell a reference collection of good text apart from raw crawl,
then keep crawl documents according to how closely they resemble the reference.
That collection was built around WebText, and WebText in turn was built by
scraping [every outbound link from Reddit that had earned at least three
karma](/wiki/event/gpt-2-staged-release), on the reasoning that other people
had already voted it worth reading.

**A quality filter does not measure quality. It measures resemblance to text
that somebody already decided was good.**

That was a real problem solved cheaply, and the paper presents the result as an
improvement, which it plausibly was. The point is not that anyone cheated. It
is that "high quality" had become an operational definition with a pedigree,
and good writing unlike that pedigree scores low with nothing to appeal to.

A second filter in that study makes the point with sharper edges: the
collection had also been cleaned by deleting any document containing a word
from a list of banned terms. Documents in African American English and
Hispanic-aligned English were removed at rates of 42 and 32 per cent, against
6.2 and 7.2 per cent for white-aligned and other English, and identity terms
such as lesbian and gay were among those most likely to trigger the filter. The
list was meant to keep obscenity out of a model's output. It also thinned whole
dialects and whole subjects, and nothing in the process could notice the
difference.

The survivors are then mixed, and not in proportion to their size: the GPT-3
paper sampled the collections it judged higher quality two or three times each,
the crawl itself less than once. A pile's composition is a set of dials, and
somebody set them.

## The smaller pile, written to order

Everything above produces something that continues text. The thing people
actually use, which answers a question and declines a request and has a manner,
is bought with a second pile, far smaller and written by hand.

The [2022 paper describing how OpenAI turned GPT-3 into an
instruction-follower](https://arxiv.org/abs/2203.02155) says who wrote it:
about forty contractors hired on Upwork and through Scale AI, put through a
screening test, mostly English-speaking people living in the United States or
Southeast Asia. They wrote example answers and chose between pairs of model
outputs, guided by labelling instructions the researchers wrote. The paper is
frank about what follows: the model's manner is shaped to those labellers'
preferences, and through the instructions to the researchers' own. The
labellers agreed with each other only about 73% of the time.

That is one project, disclosed at a level that is rare. What the work looks
like now, at what scale and on what terms, is not in the published record, so
treat any confident general claim about that workforce, admiring or damning, as
needing the sourcing this paragraph has.

## Bought text, and text the machine wrote

Two newer layers sit on top of the crawl. The first is text that was paid for:
the Associated Press and OpenAI announced an agreement in July 2023 under
which, [in AP's own
words](https://www.ap.org/media-center/press-releases/2023/ap-open-ai-agree-to-share-select-news-content-and-technology-in-new-collaboration/),
OpenAI licenses part of AP's text archive. One deal proves one thing, and it is
the thing that matters: a market in permission now exists beside the crawl,
where before there was only the crawl. Whether the scraped layer underneath
ever needed permission is being fought over in courts in several countries and
is settled nowhere.

The second is text a model wrote. It is cheap and can be aimed at gaps, and it
carries a documented hazard called [model
collapse](/wiki/concept/model-collapse): train each generation only on the last
one's output and the rare things go first, then more, until what comes out is a
few patterns repeated. The demonstration replaced the real data every round,
and a later result found that accumulating synthetic text alongside the
original avoids the collapse. So the open question is whether the real anchor
stays in, and no lab publishes that.

## Six chances to be thinned out

[Why a model is confidently wrong](/learn/why-models-are-confidently-wrong)
describes the failure from outside: the error rate tracks how often something
was written down, not how difficult it is. The chain above is the supply side
of that sentence. To be in the pile at all, a thing must be typed, published
where a crawler can reach it, spared by the deduplicator, missed by the word
list, scored as resembling text somebody approved of, and then weighted into
the mix. Six chances to be thinned out — none of them applied by anything that
could tell rare from unimportant.

That yields predictions you can check. A model will be stronger on subjects
with a large public written culture than on equally hard subjects that are
mostly practised and seldom described. It will be more reliable in English than
in the other languages it speaks fluently, because fluency and coverage are
different properties and only one of them is audible.

More examples help, because volume kills coincidences. Nothing about volume
decides which coincidences get the chance to die. Nobody can read the pile, but
nearly every rule that built it was published by the people who applied it, and
not one of those rules was written by somebody asking what a stranger would one
day need to know.
