---
title: How a language model turns text into text
level: foundations
outcome: >-
  You can trace one word of output through tokenisation, attention and
  sampling, name the only operation in the stack that moves information
  between positions, and explain why a model cannot see the letters inside its
  own tokens.
prerequisites:
  - what-a-model-is
  - what-a-neural-network-is
  - how-machines-represent-meaning
mentions:
  - concept/tokenization
  - concept/embeddings
  - event/attention-is-all-you-need
  - concept/temperature-and-top-p
---

Watch a chatbot's answer arrive. It comes in a drip, a word or a piece of a
word at a time, like a typist who never goes back. Products could smooth that
over, and mostly they do not bother, because the drip is the machinery showing
through. A language model produces one small piece of text per run, and the
answer you watched assemble really was assembled in the order you watched.

One run does exactly one thing. Given everything so far, the model produces a
score for every piece of text it could add next, saying how plausible that
piece is as the continuation. Chat, code, translation, refusal: each is that
single act repeated, with the chosen piece glued on and the lengthened text
run again.

## The pieces are not words

The model never receives your words. Before anything else happens, the text is
chopped into pieces drawn from a fixed list. Common words survive whole, rare
words arrive as two or three fragments, and anything stranger arrives as
single characters. The pieces are called tokens, the chopping is called
[tokenisation](/wiki/concept/tokenization), and none of it is part of the
model's intelligence. The list was built before training, by counting which
chunks recur across a mountain of text, and it has been frozen ever since.
List and weights grew up together, and neither means anything without the
other.

A family of famous failures follows straight from the chopping. Ask a model how
many of some letter a word contains and you are asking about structure that
was discarded before the first layer ran. The word arrived as one token or
two, and the letters inside were never separate things it could count. It
often answers correctly anyway, because people write about spelling and [the
pile it learned from](/learn/learning-from-examples) contains their writing,
which is why it succeeds on common words and stumbles on rare ones. Numbers
are cut by the same logic of frequency rather than by place value, so two sums
that look equally hard to you can be one familiar pattern and one unseen one
to it. And a language the list serves badly gets chopped fine, into many small
fragments, so saying the same thing consumes several times the tokens, and
several times any fixed budget, for reasons that have nothing to do with
either language being harder.

## Handed one place at the door

You already know [where a machine keeps
meaning](/learn/how-machines-represent-meaning): things become long lists of
numbers, places on a map, positioned so that things used alike sit near each
other. A language model begins exactly there. For every token on its fixed
list it holds a stored list of numbers, learned during training like every
other weight. Reading your text means looking each token up, right at the
door of the network, and handing the arithmetic its place. The stored list is [an
embedding](/wiki/concept/embeddings), the same object the meaning page put in
your hands.

Now watch what a lookup cannot do. The table holds one entry per token. One
place for "bank", however the sentence around it leans, because the table was
consulted before anything had read the sentence. On the meaning page, a thing
earned its place from the company it keeps. At this door the company is
standing right there in the text, unconsulted. What the lookup hands over
describes the token, not yet the token's meaning here, and something deeper in
will have to do the actual reading.

Order is missing at the door too. [Multiply, add,
compare](/learn/what-a-neural-network-is) has no built-in sense of sequence,
so a record of where each token sits is worked into the arithmetic as well.
Call that slot a position, a place in the line this time rather than on the
map. The first token of your text occupies the first position, and a model
handed a thousand tokens works on a thousand positions at once.

## Where the sentence finally gets read

The body of the model is one design of layers repeated many times over, each
repeat with weights of its own. Most of what happens inside a repeat is
ordinary network arithmetic applied to each position separately. The rest is
one operation, and it is where the door's problem gets solved: each position
consults all the others and revises its own numbers by what it finds. The
operation is called attention, and in prose it runs like this. Each position,
from its current numbers, works out what it is looking for and what it has to
offer. Every position's looking-for is compared with every position's offer,
and each pairing gets a score for how well they match. The scores are scaled
into shares that sum to one, a fixed budget split across the whole input, and
then each position updates its own numbers with a blend of what the others
hold, in proportion to their shares. A soft lookup, learned rather than
written, run by every position over every other. Several such lookups run
side by side in each repeat, each free to track a different kind of
relationship.

This is what moves "bank". A token for "river" a few positions back offers
something that scores well, takes a large share, and what it contributes pulls
the numbers at "bank" across the map, toward the water. Repeat by repeat, the
description at each position stops being a token's table entry and becomes
this token, in this sentence, doing this work. The meaning the door could not
supply is assembled by consulting the company, which is the same rule the map
itself was built by.

One structural fact outranks every detail here: **attention is the only
operation in the stack that moves information between positions.** All the
rest of the arithmetic works on one position at a time, in isolation, blind to
the rest of the text. Whenever a model connects two separated things, a
pronoun with its owner, a question with the line that answers it, the
connection was made by attention, because there is nowhere else it could have
been made.

In a model built to generate, the comparisons are deliberately one-eyed. Each
position may consult only the positions before it, never after, because the
model's one job is to guess what comes next and a guesser allowed to peek
learns nothing. That is why output comes left to right, and why a token, once
emitted, is never revised: no operation in the architecture edits what is
already written. The whole design, lookup plus repeated block, is called a
transformer, and [the 2017 paper that introduced
it](/wiki/event/attention-is-all-you-need) titled itself after the operation
instead.

## The choosing happens outside

After the last repeat, the numbers at the final position are turned back into
scores, one for every token on the fixed list, and the scores are converted
into a spread of probabilities. [You already know](/learn/what-a-model-is)
that picking one token from the spread is a separate step, random by design,
because a text built by always taking the single most probable token comes out
repetitive and strangely flat. Drawing at random according to the spread is called sampling,
and the settings around the draw belong to the product, not to the model.

One dial reshapes the spread before the draw. Turned down, the probable tokens
absorb nearly everything and the output steadies. Turned up, the spread
flattens and unlikely tokens come into reach. The field calls the dial
temperature. Another setting cuts the tail off the spread entirely, so that
tokens that were each barely possible stop being possible at all. The tail
matters because it is enormous: thousands of barely possible tokens add up to
a real chance that one of them surfaces, and the one that surfaces is rarely
good. [The wiki entry holds both settings in
detail](/wiki/concept/temperature-and-top-p).

None of this is the model. The dial and the cutoff live in [the stack around
the weights](/learn/what-a-model-is), edited freely while weights ship rarely,
and the same weights under different settings feel like different products.
Worth remembering the next time a chatbot's personality changes overnight.

Then the loop closes. The chosen token is glued onto the input, and the whole
model runs again from the top, lookup to repeats to scores to draw, for one
more token. That loop is the drip you began this page watching, and it is why
a long answer costs more to produce than a short one. The machine ran once per
token, all the way through, every time.

## Always mid-sentence

Notice what the loop never contains. There is no draft. No version of your
answer existed before the version you received, and every token of it was
final the moment it was drawn. Halfway through an answer, the model is not
halfway through a plan it wrote down. It is facing the only problem it ever
faces, continue this text, and the text now includes everything it has already
said. A mistake three lines up is not a mistake to the loop. It is input, with
the same standing as your question, and the most plausible continuation of a
text containing an error is, uncomfortably often, more of the error.

What that means for correcting a model mid-conversation is [a page of its
own](/learn/why-context-is-not-memory). What it means here is smaller and
worth keeping. The model is never talking with you. It is continuing a
document that you are a character in, and it will keep continuing that
document, one plausible token at a time, whether or not the document has
started being wrong.
