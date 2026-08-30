---
title: Getting better answers out of a model
level: foundations
outcome: >-
  You can explain why showing examples beats describing what you want, what a
  system prompt does, and which popular prompt tricks have a mechanism behind
  them.
prerequisites:
  - how-a-language-model-works
  - why-context-is-not-memory
mentions:
  - concept/in-context-learning
  - concept/chain-of-thought
  - technique/chain-of-thought-prompting
---

Everything you can change about an answer, you change by writing text. There is
no dial marked accuracy and no setting for care. The weights stopped moving when
training ended, and the sequence is assembled fresh for every request. Between
those two facts sits the whole of what gets called prompting: one lever, pulled
in different directions.

That makes any piece of prompt advice answerable by one question. Does this text
change which token comes out most plausibly next, and does it change it in a
direction you wanted? Some popular advice has a clear answer. Some has never had
one and spread anyway.

## An example is already the thing

Ask for a product description in a warm, plain register with no exclamation
marks and you have handed over a description of a document that does not exist
yet. Your adjectives have to be
converted into a continuation. Paste two descriptions you liked and the document
exists: it sits in the sequence a few hundred positions back, where attention
can reach it, and carrying a pattern forward from one position to another is the
cheapest thing attention does.

That is why two decent examples routinely outperform a paragraph of
instructions. Format, length, register, how much the writing hedges, where it
stops: an example carries all of it exactly, because all of it is visible in it.
What an example cannot carry is a fact you needed and did not supply. It gives
the model a slot of the right shape, and the slot gets filled from somewhere.

The measured story is stranger than the folk version, and it has already moved
once. What examples in a prompt mainly supply is the shape of a task rather than
the correct answers inside it, and how far that holds turned out to depend on
the size of the model reading them. The behaviour has a name,
[in-context learning](/wiki/concept/in-context-learning), and the entry holds
the two experiments that disagree.

## Vague in, average out

A request describes a set of answers that would satisfy it, and "write a good
summary" describes an enormous one. The model does not pick a random member of
that set, and it does not pick the best one. It produces the continuation with
the most probability behind it, which lands near the middle of everything that
would have counted, because the middle is where the mass is.

So the flatness people complain about is rarely the model playing safe. It is
the honest centre of a set drawn too wide. Specificity works by exclusion, which
is why some constraints bite and others do not. "Professional" sits beside
almost any prose ever written and rules out nearly nothing. "Under 150 words,
addressed to someone who has already said no once, with no mention of price"
deletes most of the set in a line. Both are instructions. Only one is doing
arithmetic.

## Written-out steps are scratch space

One pass through the network produces one token, and the depth of that pass is
fixed. A hard question does not buy more layers than an easy one. The only way a
model gets more computation is
to produce more tokens, because each token it writes is appended to the sequence
the next pass reads. Working shown on the page is not a performance of effort.
It is the only storage the architecture has: a partial result written into the
output can be attended to on the way to the next one, while one computed
silently inside a pass dies with that pass.

Writing out the working has a name,
[chain-of-thought prompting](/wiki/technique/chain-of-thought-prompting), and
two measured things about it cut against its reputation. The gains concentrate
where the steps perform real symbol manipulation rather than wherever a question
merely feels hard. The second is sharper: the visible chain is not a log of what
produced the answer, because a model can state steps that had no part in its
output, and they read exactly like the steps that did. That is
[chain-of-thought faithfulness](/wiki/concept/chain-of-thought).

## The paragraph above your first word

A system prompt is text the product puts at the front of the same flat sequence
your message goes into. It is not a mode, a permission level or a separate
channel. It is early text, and whatever authority it has comes from position and
from being present in every request, never from rank.

Two predictions come free with that. Its grip loosens as a conversation grows,
because attention weights are normalised to sum to one and each position added
competes with every position already there, so a standing instruction at turn
fifty is not the instruction it was at turn one. And nothing in the architecture
protects it, which is why asking a model to reveal or override its instructions
is coherent to attempt at all. What stops that is training and filtering layered
around the model rather than a wall inside it.

## Arguing appends

A correction removes nothing. The wrong answer stays where it was, the
objection lands underneath, and by the fourth round of "no, not like that" the
strongest pattern in the document is the mistake, restated, with the model's own
agreement stacked on top. You are adding pages to a document that already argues
for the thing you want gone.

Editing the message that started the drift, or starting again carrying what you
learned, removes text. Nothing else available to you does.

## Politeness, tips and threats

Tone does change the reply, for a mundane reason. Rude text is followed, across
almost everything ever written, by different text than polite text. That effect
is real and has been measured: a 2024 study across three languages reported that
[impolite prompts often result in poor performance, while overly polite language
does not guarantee better outcomes, and the best politeness level differs by
language](https://arxiv.org/abs/2402.14531). Notice how little that resembles
the rule people repeat.

The stronger claims have been tested too. By 2025 the belief that offering a
model a tip improves its answers was widely traded, and threatening it had
picked up a public endorsement from a Google co-founder — models tend to do
better if you threaten them, he said. In August 2025 four researchers measured
both against two benchmarks and reported that [threatening or tipping a model
generally has no significant effect on benchmark
performance](https://arxiv.org/abs/2508.00614).

The same report carries the finding that explains why the advice exists at all.
Prompt variations can move performance a great deal on individual questions, and
it is hard to know in advance whether any given approach will help or hurt any
particular one. **A trick that does nothing on average still changes plenty of
single answers, and a single answer is all anyone ever checks.**

Personal experience cannot settle these questions either, and the obstacle is
the machinery rather than anyone's care. The last step of producing a token is a
sample drawn from a distribution, so the same prompt run twice gives different
text with
nothing added to it. Trying a trick once and liking the result is one
uncontrolled observation against a system with a known source of noise.
Instructions like "be accurate" fail for a plainer reason: nothing in the stack
consults a source or checks a claim against one, so the instruction reaches the
register and nothing else.

## What no phrasing reaches

Two things supply everything in a forward pass: the weights and the sequence.
Attention mixes what is present, and no step goes and looks anything up. A fact
that was never in the training text and is not in your input is unreachable by
any arrangement of words, and an answer arrives anyway, because emitting a next
token is not optional and no stage may withhold one. The confident empty answer
is not a refusal to try harder. It is the only thing the machinery can do with a
question it has nothing for.

A second class of failure sits below the level prompting operates on: the
letters inside a token were discarded before the first layer ran, so no phrasing
makes a model count them reliably — it can only recall having read about the
spelling.

Both boundaries have the same two exits, and neither is a better sentence.
Something missing has to go into the input, or the output has to be checked
outside the model. Those change what is present. Rephrasing changes only which
continuation of the same material is likeliest, a narrower power than it feels
like at three in the morning with an answer that is nearly right. Stop asking
what to say to the model. Ask what
document you are handing it to continue, and whether the answer you want is the
most ordinary thing that could come next in it.
