---
title: The kinds of models, beyond chat
level: foundations
outcome: >-
  You can name the major families of model beyond language models, say what
  each takes in and puts out, and work out which family sits under a product
  you are looking at.
prerequisites:
  - what-a-neural-network-is
mentions:
  - concept/embeddings
  - event/imagenet-2012
  - event/stable-diffusion-release
---

Your photo app finds the beach without ever being told what a beach is. Your
phone unlocks at your face and turns a voice note into text. A
feed picks what you see next, and a chatbot drafts the letter you have been
putting off. Behaviours this different look like different inventions. Under
every one of them runs [the machine you have already
met](/learn/what-a-neural-network-is): weighted sums stacked in layers,
trained by computed blame. That page ended on the recipe refusing to change
with size. It refuses to change with job, too. Whatever makes a photo sorter
a different kind of thing from a chatbot, it is not the machinery.

It is the examples. [Training](/learn/learning-from-examples) turns a pile of
solved cases into behaviour, and every pile you have met shared a shape
worth naming: each was a pile of pairs. A message beside its junk
verdict. A photo beside its tag. Something on the left, and the right answer
for it on the right. A finished model is a machine for turning left-column
things into right-column things, and that one fact organises the whole zoo.
You never need to see inside a model to say what kind it is, which is lucky,
since nobody can read the inside anyway. You watch what goes in and what
comes out.

## Judging, and carrying across

The oldest families boil something large down to a verdict. Image in, label
out: the photo sorter, the face unlock, the system that flags a tumour on a
scan. Mail in, junk-or-not out. These are recognisers, classifiers in the
field's own word, and their signature is that the output is a choice from a
menu fixed before training began. The menu is also a wall. A sorter trained
without a sunset label cannot find you a sunset, however orange the sky.

Transcribers and translators are gentler with the input: sequence in,
sequence out. Speech goes in and written words come out. A sentence enters in
one language and leaves in another. Nothing is judged and nothing is boiled
away. The content crosses a border and changes its clothes. Their piles hold
recordings beside transcripts, sentences beside their translations, and the
output is assembled to fit the input rather than picked from a menu.

## The pile that writes itself

The most consequential family is the one the label has nearly slid off.
History in, ranking out: what you and millions of people like you watched,
tapped, skipped, bought and abandoned goes in, and out comes an ordering of
what to show next. Every feed is one of these, and so are the shop's
suggestions, the queued songs, the video that plays next.
They are called recommenders, and what sets them apart is where their pile
comes from.

A recogniser's photographs had to be tagged by people paid to tag them. A
transcriber's recordings needed every word typed out by hand. A recommender's
pile writes itself: every tap is a solved case saying more of this, every
skip one saying less, supplied free, in the ordinary run of using the
product, by everyone at once. No other family gets its examples at that
price. That is why recommenders arrived everywhere first and drew so little
notice doing it, why fresh versions are retrained from the swelling pile as
routine, and why the word AI slid off the family years
ago, the way the label always slides off software that works. The software
that chooses what billions of people will look at next is the software the
word no longer points at.

One further family does quiet work underneath several of the others and
needs only a sentence here: an embedder takes anything at all — a word, a
photo, a song — and puts out coordinates, a position on a learned map where
similar things sit near each other, the trick called
[embeddings](/wiki/concept/embeddings) that serves inside search and
recommendation alike.

## The same pile, read backwards

Then the family everyone now means by the word. A generator takes a request
typed in words, called a prompt, and puts out a thing that did not exist
before: a paragraph, a picture, a voice, a video clip. Small in, large out,
the recognisers' arrow reversed. And the reversal goes further than size,
because nothing about a pile of pairs says which column is the question.
**Pictures paired with descriptions, read in one direction, train a machine
that names what it sees. Read in the other direction, the same pairs train a
machine that paints what it is told.** What look like different species of AI
are one trick pointed opposite ways.

The backward direction is harder, and the training loop you know says why. A
guessed label can be scored against the one right answer stored in the pile.
A guessed picture cannot, because a description has countless faithful
pictures, and punishing every difference from the single stored example
punishes good guesses along with bad. Machines that name what they see won [their famous
exam in 2012](/wiki/event/imagenet-2012). A machine that paints what it is
told became [something anyone could download and run in
2022](/wiki/event/stable-diffusion-release). Same pairs, opposite direction,
ten years between them.

The chatbot belongs to this family, and the frame holds even there. A
language model's pile is text itself, every stretch of it paired with the
word that came next, and [a page of its own](/learn/how-a-language-model-works)
traces what reading that pile forward builds.

## Walls that were never load-bearing

The newest development is not another family. It is the walls between
families coming down. By the first layer everything is numbers anyway: the
photo a grid of brightness values, the sound and the sentence encodings of
their own. So nothing stops one model being trained on
several kinds of pair at once, and a model trained that way is called
multimodal. Show one a photo of your fridge and ask it, in words, what to
cook. On this page's map it is a recogniser and a generator wearing one skin.
The families were never different machines, only different piles, and piles
can be mixed.

## Reading a product from outside

What you actually use is [a stack](/learn/what-a-model-is), and the stack
usually holds a small coalition of families. Ask a voice assistant for
tomorrow's weather and your question travels a relay: a transcriber turns
your speech into text, a generator writes the reply, and a third model reads
the reply aloud in a manufactured voice. No single link in the relay is the
AI. The product is the coalition, plus plumbing.

An [earlier page](/learn/what-ai-actually-is) gave you a question that always
has an answer: what did it learn, and from what? You now hold the sharper
version. What was paired with what? Products you have never seen
will keep arriving, wearing labels that tell you nothing. The pairs will
place every one of them.
