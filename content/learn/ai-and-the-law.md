---
title: The legal questions AI actually raises
level: mechanics
outcome: >-
  You can name the legal questions AI genuinely raises, say why training-data
  copyright is the load-bearing fight, and tell a settled rule from an open one.
prerequisites:
  - what-models-are-trained-on
  - the-kinds-of-models
  - where-ai-fails-people
mentions: []
---

In 1884 the Supreme Court of the United States was asked whether a photograph
could have an author. The argument against was that the camera does the work.
Once you allow for the lens, the plate and the chemistry, [the contention
ran](https://www.law.cornell.edu/supremecourt/text/111/53), "the remainder of
the process is merely mechanical, with no place for novelty, invention, or
originality." A machine made the picture. Nobody drew anything.

The Court held that photographs are protected "so far as they are
representatives of original intellectual conceptions of the author," and it
pointed at what the photographer had actually done: posing Oscar Wilde in front
of the camera, "selecting and arranging the costume, draperies, and other
various accessories," arranging the light and shade. The machine made the
image. The person made the choices, and the choices were the thing the law
could hold on to. About photographs taken without such choices the Court
declined to rule at all: "On the question as thus stated we decide nothing."

In January 2025 the United States Copyright Office published its analysis of
whether anything a generative model produces can be owned at all. It opens by
reaching for that same case: "More than a century ago, the Court analyzed the
nature of authorship in a case involving the then-new technology of the
camera."

That reach is not decoration. It is the mechanism by which this whole subject
is being decided.

## The boxes were built for other things

Copyright attaches to copies of expressive work. Product liability attaches to
defective products. Data protection law attaches to records about identifiable
people. Every one of those categories was drawn around something, by people
looking at that thing, and a trained model sits badly inside all three at once.

Building one requires copying on a scale that [the crawl makes
concrete](/learn/what-models-are-trained-on): a program follows links and saves
what it lands on, and almost nothing it saves was written to be saved that way.
The finished artifact is not a copy of any of it. It is an array of numbers
holding no retrievable record of the pages that shaped them. That artifact then
produces new material which is usually unlike anything in the pile and
occasionally reproduces a source almost whole, and nothing in the process
separates those two cases in advance.

Which questions apply at all depends on the family. [Sorting models by what
goes in and what comes out](/learn/the-kinds-of-models) turns out to sort the
legal questions too, without anyone intending it. A recogniser that puts a
label on your face raises no copyright question worth arguing and every
question about liability and personal data. A generator raises all of them
together, because it was assembled out of expressive work and it emits
expressive work. "Is AI legal" is not one question. It is four or five
different questions wearing a single label, and which of them are live depends
on what the system takes in and puts out.

When a technology fits no existing category, a legal system does not respond by
inventing one. Not at first, and often not for decades. It asks which existing
category the new thing most resembles, and that choice usually decides the
outcome before anyone examines the technology at all. **Nobody with the power
to decide is arguing about what these systems do. They are arguing about what
these systems count as, and every candidate answer was settled before any of
them existed.**

## The fight that sits upstream of the others

Training-data copyright carries more weight than the rest combined, and the
reason is structural rather than moral. The other questions redistribute
things. If output ownership goes one way, some people can register some works
and others cannot. If liability lands on the deployer instead of the vendor,
contracts get rewritten and insurance gets repriced.

Training is different because it is upstream of every model that already
exists. If building one from unlicensed work requires permission, then every
system now deployed was made by an act that needed a permission nobody
obtained, and the cost of making the next one changes by orders of magnitude
for everybody at once. No other question in this subject reaches backwards and
sideways like that.

In the United States the argument runs through fair use, a provision permitting
some unlicensed uses without asking anyone. [Section 107 of the Copyright
Act](https://www.law.cornell.edu/uscode/text/17/107) does not list permitted
uses. It lists four factors a court must weigh, among them "the purpose and
character of the use," "the amount and substantiality of the portion used," and
"the effect of the use upon the potential market for or value of the
copyrighted work."

The first factor acquired its modern shape in 1994, when the Supreme Court
[asked whether a use](https://www.law.cornell.edu/supremecourt/text/510/569)
"adds something new, with a further purpose or different character, altering
the first with new expression, meaning, or message," and named that quality
transformative. A use that transforms is not automatically lawful, but the more
transformative it is, the less the other factors weigh against it.

Both sides of the training fight are serious, and each is arguing a different
factor. The defence takes the first: reading a billion documents to adjust
weights serves no purpose any of those documents were written for, and nobody
consults a model in order to obtain the book. The claim takes the fourth, in
two versions that are often confused. The narrow one is lost sales and lost
licensing — sharpened by the fact that a market in training licences now
visibly exists, which makes it harder to argue that no licence was ever
available to buy. The broad one is dilution: outputs flooding the market the
originals sold into, cheaply and endlessly, so that the harm arrives without
any single output copying anything. The Copyright Office [names all
three](https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-3-Generative-AI-Training-Report-Pre-Publication-Version.pdf)
as the ways training can affect a market: "lost sales, market dilution, and
lost licensing opportunities."

## Two judges, one courthouse, two days apart

In June 2025 two federal judges in the Northern District of California decided
fair-use questions about training on books, on separate records, forty-eight
hours apart.

The first, [an order on fair
use](https://storage.courtlistener.com/recap/gov.uscourts.cand.434709/gov.uscourts.cand.434709.231.0.pdf)
filed 23 June, found that "the purpose and character of using copyrighted works
to train LLMs to generate new text was quintessentially transformative." It
then split the defendant's conduct apart and reached the opposite result on
another piece of it. In the order's own words: "Creating a permanent,
general-purpose library was not itself a fair use excusing Anthropic's piracy."
The dividing line ran through how the copies had been obtained, which is a
question about acquisition rather than about machine learning.

The second, [filed two days
later](https://storage.courtlistener.com/recap/gov.uscourts.cand.415175/gov.uscourts.cand.415175.598.0.pdf),
also declined to hold the training unlawful, and said something startling about
why. On whether copying protected work to train a model without permission is
illegal, that judge wrote: "Although the devil is in the details, in most cases
the answer will likely be yes." The plaintiffs lost anyway, and the order says
plainly that it "stands only for the proposition that these plaintiffs made the
wrong arguments and failed to develop a record in support of the right one."
The argument they had neglected was dilution.

Neither ruling is about artificial intelligence. One turns on how a library was
stocked. The other turns on what a legal team failed to put in the record.
Both were decided by trial courts, the lowest rung that decides anything, and a
trial court binds the parties in front of it and nobody else. Read either as
"the courts have decided that training is legal" and you have converted a
finding about two particular records into a claim about a technology.

There is a further reason the largest disputes here keep failing to produce
rules. A case that settles decides nothing. The parties get an outcome, the
question stays open, and the next company facing the same question inherits the
same uncertainty at the same price.

## The analogies on offer point different ways

Watch what each side reaches for and the fight gets easier to follow, because
none of the available comparisons is neutral.

The search index is the defence's preferred one. In October 2015 the Second
Circuit decided [Authors Guild v. Google,
Inc.](https://www.courtlistener.com/opinion/3124896/authors-guild-v-google-inc/),
804 F.3d 202, a case about the scanning of entire books to build a searchable
index, and an industry submission to the Copyright Office's inquiry cites it by
name. If training is that, then copying the whole corpus is a step towards a
tool serving a purpose the books never served, and the completeness of the
copying is a necessity rather than an aggravation.

Sampling points the other way. Dealing with copying from a sound recording, the
Sixth Circuit in Bridgeport Music, Inc. v. Dimension Films produced one of the
bluntest lines in American copyright: "Get a license or do not sample." If training is that, scale is no defence and
neither is transformation, because the rule attaches to the taking itself
rather than to what the taker did afterwards.

Photography, the third, is doing a different job from either. It is not about
whether copying is excused. It is the precedent for what happens when a machine
stands between a person and a finished work, and its answer is to go looking
for the human choices. That question comes back below in modern dress.

Nothing about the technology selects among these. They are three accounts of
what kind of act this is, and one gets adopted before any factor is weighed.

## Three systems that answered before the question arrived

The same facts produce different answers in different countries, and the reason
is not that judges disagree about what a model is. It is that copyright systems
have structurally different machinery for permitting things, built long ago for
unrelated reasons, and generative models fell into whatever machinery was
already there.

The American approach is an open-ended standard. Section 107 supplies factors,
not permissions. Any use can qualify and none is guaranteed, and the answer
arrives only after a court has weighed one specific record. Nobody can know in
advance, which is a feature if you value flexibility and a catastrophe if you
need to plan.

The European approach is an enumerated list: a use is lawful if it appears on
the list. [Article 4 of the 2019 copyright
directive](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32019L0790)
added text and data mining, meaning the automated analysis of large bodies of
material to extract patterns from it, and allowed reproductions of "lawfully
accessible works" for that purpose. Then it attached a switch. The exception
applies only on condition that the use "has not been expressly reserved by
their rightholders in an appropriate manner, such as machine-readable means in
the case of content made publicly available online." That changes the question
completely. It stops
being whether the use was fair and becomes whether a reservation was made and
whether it was made in a form a crawler could read, which is settled by file
formats and headers rather than by argument about purpose.

Japan drew the line somewhere else again. [Article 30-4 of its Copyright
Act](https://www.japaneselawtranslation.go.jp/en/laws/view/4207) carries the
heading "Exploitation without the Purpose of Enjoying the Thoughts or
Sentiments Expressed in a Work," and provides that "it is permissible to
exploit a work, in any way and to the extent considered necessary" where "it is
not a person's purpose to personally enjoy or cause another person to enjoy the
thoughts or sentiments expressed in that work," with data analysis named as one
such case, and subject to a proviso for uses that "would unreasonably prejudice
the interests of the copyright owner." The organising idea is neither fairness
nor a list. It is whether the use consumes the expression as expression.

None of these three was written about generative models. The Japanese category
asks about the purpose of a use in terms that have nothing to do with machine
learning. The European provision was adopted before the products that made this
a public argument existed. The American factors were codified in 1976 and
restate reasoning older still. A sentence about whether training on unlicensed
work is lawful is not yet a claim until it names a country, and a rule taken
from one of these systems and restated as a general fact about AI is not a
simplification. It is an error.

## The output raises two questions, not one

Ownership and infringement get argued as though they were the same topic. They
are independent; they can land in opposite directions on the same file.

Ownership asks whether there is anything to own and, if so, whose it is. The
Copyright Office [concluded in its January 2025
report](https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf)
that "prompts alone do not provide sufficient human control to make users of an
AI system the authors of the output," on the reasoning that prompts "essentially
function as instructions that convey unprotectible ideas." Note the qualifier
the Office wrote into its own sentence: this holds "given current generally
available technology." The test is the one from the photograph case, applied to
a new instrument. Did a person make enough of the expressive choices.

That question has a different default a few thousand miles away. [Section 9 of
the United Kingdom's 1988 copyright
act](https://www.legislation.gov.uk/ukpga/1988/48/section/9) says that "in the
case of a literary, dramatic, musical or artistic work which is
computer-generated, the author shall be taken to be the person by whom the
arrangements necessary for the creation of the work are undertaken." Written in
1988, for machines that did not yet exist. Two systems that agree about almost
everything else in copyright hold opposite starting positions here, because one
of them wrote a rule for machine-made works decades early and the other never
did.

Infringement is the separate question of whether a particular output reproduces
protected expression, and it does not depend on how the model was trained.
Training could be entirely lawful and a specific output still infringe.
The mechanism connecting the two is one [the training-data
page](/learn/what-models-are-trained-on) already supplies: deduplication is
imperfect, and a document sitting in the pile thousands of times is taught
thousands of times. What comes back nearly whole tends to be
what went in most often, which makes this a question about particular works
rather than about models in general.

## The gap, in legal clothes

[The accountability gap](/learn/where-ai-fails-people) restates itself almost
word for word in a courtroom: an error no single person made is an error no
single person can be asked to pay for. Liability needs a defendant.

The structure is always the same. A vendor sells a general-purpose system and
publishes its error rates. A deployer chooses it for a use the vendor never
selected. An operator acts on its output, following a policy as they understood
it. Each party stayed inside its own part, and the harm was produced by the
arrangement rather than by any one of them.

The categories available for sorting this out were built for simpler supply
chains. Whether a model counts as a product or a service is not a philosophical
question; it is a question about who pays. Product regimes can impose liability
on a maker without anyone proving carelessness, while service liability
generally requires showing that somebody fell below a standard. A model
delivered over an interface looks like a service in the ordinary sense and like
a component in the practical one, and which box it lands in changes the outcome
without changing anything about the model.

The honest description of where this is heading is uncomfortable. The gap is
not an oversight that better drafting will close. It is what happens when a
consequential decision is assembled from parts supplied by people who never
met. Whatever a legal system eventually settles on, it will be assigning
responsibility by rule, to the deployer or the seller or whoever could most
cheaply have prevented the harm, rather than discovering where responsibility
actually sat. That is a decision about who should bear a cost. It is being
argued in a vocabulary that makes it sound like a finding about causation.

## Regulation is a separate machine

Two shapes are competing, and they are not variations on each other.

The first sorts uses into bands by risk, in one law covering everything. The
European Union's [artificial intelligence
regulation](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024R1689),
adopted 13 June 2024, states that it follows a "risk-based approach": a short
list of prohibited practices, a defined set of high-risk uses carrying
substantial obligations, and comparatively little for everything else.
The band attaches to the use rather than to the technology, so one model is
lightly regulated in one deployment and high-risk in another.

The second writes no AI law at all. Each existing regulator applies the powers
it already holds inside its own domain, so a medical device authority asks its
device questions and a financial regulator asks its lending questions, about
systems that happen to be trained rather than written.

The trade between them is real. A banded law must define its subject in
advance, which means writing a definition of the regulated thing that will be
litigated for a decade. Sector rules never face that problem and instead leave
gaps between sectors, where a harmful use falls under nobody's authority
because it belongs to no established industry.

What neither approach does is settle the copyright question, and this is where
readers of the news are most often misled. A comprehensive AI statute does not
decide whether training on unlicensed work was lawful. The European regulation
requires providers of general-purpose models to identify and comply with "a
reservation of rights expressed pursuant to Article 4(3) of Directive (EU)
2019/790" and to publish "a sufficiently detailed summary about the content
used for training." It points back at the copyright directive and defers to it.
A country can have a thorough AI law and no answer whatsoever about training
data.

## Erasing yourself from something that keeps no records

Data protection law governs the handling of information about identifiable
people, and its rights do not switch off because the information was easy to
find. Publicly accessible and lawful to process are separate properties, and
conflating them is the most common error in popular writing on this. "It was on
the open web" answers a question about access. It does not answer the question
the law asks.

The sharpest collision is erasure. [Article 17 of the European data protection
regulation](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R0679),
headed "Right to erasure ('right to be forgotten')", gives a person "the right
to obtain from the controller the erasure of personal data concerning him or
her without undue delay." A right shaped like that assumes a record: a row, a
file, something that can be removed and afterwards be gone.

The crawl produced a pile, and the pile produced weights. There is no row. The
same fact that makes the copyright argument difficult, that the model retains
no retrievable copy of what shaped it, cuts the other way here and makes the
remedy undefined. Deleting a person from a trained model is not a defined
operation the way deleting a row is.

As of 2026-08 there is no settled account of what erasure requires from a
trained model, and the available answers are all unsatisfying in different
ways. Filtering outputs leaves the weights untouched and answers a question
about behaviour rather than about storage. Retraining without the data is
technically clean and, at frontier scale, expensive enough to be close to
theoretical. Holding that a model contains no personal data at all is a claim
about the artifact that the memorisation of repeated documents makes hard to
defend without qualification. Which of those a given system adopts is being
worked out now, and anybody who tells you it is resolved is describing one
regulator's current position rather than a rule.

## Telling a settled rule from an open one

Plenty here is genuinely settled, and it is worth being able to name. A
photograph can have an author. A use that serves a sharply different purpose
from the original weighs in favour of being excused. The European mining
exception covers lawfully accessible material unless rights were reserved in a
machine-readable form. These are texts and decisions you can point at, and none
of them is in serious doubt.

What is open is not the rules. It is which of them this falls under.

So four questions do most of the work on anything you read. Which country's law
is this about, because a claim with no jurisdiction in it is not yet a claim.
What was it actually filed under, since the analogy chosen at the start usually
decides the end. Who decided, and can they be overruled, remembering that a
trial court speaks to its own parties and a settlement speaks to nobody. And
which part of the subject is this about, the training or the output or the
deployment or the personal data, because those have different answers and get
reported as one.

The decision that eventually matters will not read as though it is about
artificial intelligence. It will be about a library, or a search index, or a
photograph of Oscar Wilde, and it will govern this because somebody persuaded a
court that this is one of those.
