---
title: What a model is, and what it is not
level: orientation
outcome: >-
  You can point at any AI product and say which part of it is the model and
  which part is not, and predict which changes need a new model and which do
  not.
prerequisites: [what-ai-actually-is]
mentions: []
---

Somewhere in a recent chat, you have probably corrected an AI. It got a name
wrong, or a date, and you told it so. It apologised, restated the point with
your fix folded in, and carried on as though it had known all along. Then you
opened a fresh conversation the next day, asked about the same thing, and the
old mistake was back, wearing the old confidence.

Nothing broke overnight, and nothing was forgotten either, because nothing was
ever learned. Seeing why means prying apart three things the phrase "the AI"
mashes together: the model, the software that runs it, and the product wrapped
around both. Almost every argument about AI that goes nowhere is an argument
in which two people are talking about different ones of these.

## The model is a fixed collection of numbers

What training leaves behind, once all the examples have been shown, is the
model: an enormous collection of numbers, millions upon millions of them,
together with a fixed recipe for the arithmetic to perform on them. The
numbers are called weights, and sometimes parameters. That is the entire
object. There is no diary inside, no log of past conversations, no compartment
where things it picks up from you are kept, because it picks nothing up. Given
the same input and the same settings it produces the same output, and it is
exactly the same object afterwards as before. It does not accumulate. It
cannot.

This has a consequence people find genuinely hard to believe: a model does not
remember your conversation. When a chat product appears to remember what you
said twenty messages ago, the earlier text was stored elsewhere, by the
product, and quietly sent in again along with your new message. Every turn,
the whole visible conversation is fed to the model from the beginning, and it
reads it all fresh, every time. **What looks like memory is re-reading.**

Your correction worked the same way. Telling the model it was wrong put a new
sentence into the text it was reading, and text containing "no, that's wrong"
tends to continue with a fix. The model itself changed by nothing at all. The
next person to use it started from the identical numbers, and so did you, in
that fresh conversation, which is why the mistake was waiting where you left
it.

## The product is a stack, and most of it is not the model

The thing you actually type into is a product, and the model sits at the
bottom of it, under a pile of ordinary software. The pile even has a name in
the trade: the stack.

Before your message ever reaches the weights, the product has usually placed
its own instructions ahead of it, a page of invisible text telling the model
what kind of assistant to be, what to refuse, how to shape a reply. That page
is called a system prompt. Settings you never see decide how the next word
gets picked from what the model offers. The product may fetch documents, from
the web or from your files, and paste them into the input beside your message,
which is called retrieval. It may hand the model tools, a live search or a
calculator or a database to consult. Filters on both sides can block or
rewrite what goes in and what comes out. And a coordinating layer may quietly
run the model several times to build the one reply you see.

Every part of that stack can change without the weights changing. Hold onto
that for the day you read that a product "got worse" or "got smarter"
overnight, because the explanation is almost never a new model. Weights are
enormously expensive to produce and are replaced rarely. The stack around them
is edited continuously, the way any software is. A behaviour change on a
random Tuesday is a new prompt, a new filter, or a new piece of plumbing far
more often than it is new numbers.

It cuts the other way too. Two products can run the identical weights and
behave nothing alike, one cautious and curt, the other warm and expansive, and
neither is misrepresenting what is underneath. The difference is the stack.

## Training happened once, in the past

A model's numbers are the residue of a training run that ended on a particular
date. That is all a knowledge cutoff is: not a policy, not a filter, just the
fact that the text it learned from stops somewhere, so anything that happened
later left no trace in the numbers. When a model appears to know about last
week, the knowledge came in through the input, from a fetched document, a tool
result, or something you typed yourself.

For a model already out in a product, "it learned from our conversation" is
almost always false. Companies whose systems improve with use improve them by
storing data and running a fresh training job later. That run produces a
different set of numbers, and someone then chooses to switch the product over
to them. The learning is real. It happens later, somewhere else, to what is
honestly a different model.

## Same question, different answer

Ask a model the same thing twice and you can get two different answers. That
is usually not a malfunction. It is a setting, and it was chosen on purpose.

The model's real output is not a sentence. It is a ranked list of every piece
of text that could come next, each with a score for how likely that piece is.
Picking one from the list is a separate, final step, and the step is
deliberately a little random, because a model that always takes the top choice
writes repetitive, oddly flat text. The picking step is called sampling, and
its randomness is why the second answer can differ from the first.

Turn the randomness off and repeated runs mostly settle on one answer.
Mostly, because computers round tiny fractions whenever they do arithmetic,
and the order in which a busy service groups the requests it is juggling can
change which way a rounding falls, now and then by just enough to tip a close
call between two words.

This is why "I asked again and got something different" is weak evidence that
anything changed, and why a screenshot of one answer is weak evidence of
nearly anything at all.

## Ask which layer

When a claim is made about "the AI", ask which layer it is about. The weights,
the stack, the input, or the sampling step: four kinds of claim, four kinds of
evidence, and only the first requires anyone to train anything.

The question sorts most of what you will hear. "It remembers me" is a claim
about the stack, where the remembering actually lives. "It got worse this
week" is nearly always about the stack too. "It answered my colleague
differently" may be nothing but sampling. The model is the one part that
cannot change without a training run, so nearly everything you will ever
notice changing is everything else.
