---
title: Open weights, closed weights
level: foundations
outcome: >-
  You can say what is actually released when a model is called open, what a
  licence can and cannot control afterwards, and why open and closed releases
  fail differently.
prerequisites:
  - what-a-model-is
mentions:
  - event/gpt-2-staged-release
  - org/deepseek
  - org/mistral-ai
---

Download a model that everybody calls open and you get one enormous file of
numbers. Not the text it learned from. Not the program that did the learning,
and not the record of what was thrown away. You have the finished product of a
process you were never shown, and for most releases called open, that file is
the whole of what changed hands.

The gap between the file and the process is the entire argument about the word.

## Four places a release can stop

Open and closed are the ends of a range rather than two options, and the useful
question about any release is how far along that range the company went.

A lab can publish a paper and ship nothing, leaving you to rebuild it yourself
if you have a warehouse of the right chips and a year. Or it can keep the model
on its own servers and rent you access through an interface, so the numbers
never leave the building. That second arrangement is what most people mean when
they say they use AI.

It can publish the weights, which are the numbers themselves. Now anyone can
download them, run them on hardware they own, and modify them.

Or it can publish the weights along with the data, the code and the settings,
so another lab could run the whole thing again. That last step is rare at the
frontier, and the licences show it. The agreement covering the last frontier
Llama release, effective in its own text on 5 April 2025, defines what is
distributed as the model code, the trained weights, and the code for running
the model and for training it further. The data is not on the list.

## The recipe does not come back

Software has a word for an artifact you can run but not read. Source code is
what a person writes. Before it runs, a translator turns it into the dense
machine instructions a processor executes, and that output is called a binary.
You cannot read a binary in any useful sense, and you cannot recover the source
from it. Shipping binaries while keeping the source is ordinary commercial
practice, and nobody calls it open source.

Weights sit in roughly that position. The data, the code and the settings are
the recipe. The weights are what running the recipe produced. The comparison
breaks in one place: a binary is a deterministic translation of its source,
while weights are the residue of a process so large and so random that nobody
could repeat it exactly even holding every input. What survives is the
direction. Given the recipe you could produce the weights. Given the weights
you cannot get the recipe back.

That is why the naming is contested rather than merely sloppy. The
[Open Source Initiative's Open Source AI Definition](https://opensource.org/ai/open-source-ai-definition),
at version 1.0, asks for three things: "Data Information" detailed enough that
"a skilled person can build a substantially equivalent system", the "complete
source code used to train and run the system", and the "Parameters", meaning
the weights. A release that stops at the weights has supplied one of the three.

Whether such a release should still be called open source is a live argument
with serious organisations on both sides, and this page does not settle it. It
says open weights, a phrase that describes the file rather than the dispute.

## The terms are stapled to the file

Weights arrive with terms attached, and the terms are where the surprises are.

That Llama agreement grants a "non-exclusive, worldwide, non-transferable and
royalty-free limited license" to use, modify and redistribute. It also does
three things a reader who heard the word open would not expect. Any company
whose products had more than "700 million monthly active users in the preceding
calendar month" must "request a license from Meta, which Meta may grant to you
in its sole discretion". Anyone distributing it must display "Built with Llama"
and put "Llama" at the front of the name of anything trained from it. And
adherence to a separate acceptable-use policy — a list of things you promise
not to do — becomes a condition of the licence by pointing at a web page and
declaring it "hereby incorporated by reference into this Agreement".

That third mechanism is the one people miss. Part of what you agreed to lives
at an address the licensor controls, and you have probably not read it. In its
own definitions, the same agreement calls the thing it is licensing "Meta's
proprietary Llama 4".

Other labs publish under the plain permissive licences software has used for
decades, unmodified, with no user threshold, no naming clause and no usage
policy folded into the grant. Mistral AI's most capable model carries
{{fact:org/mistral-ai#flagship_license}}.
[DeepSeek](/wiki/org/deepseek) moved onto one of the same standard licences,
and its entry records both that licence and the proprietary one it used before.

Underneath the variety sits one fact common to all of them. A restriction in a
weights licence is a promise about what somebody will do alone, on hardware
nobody else can see, with no account and nothing reporting back. Nothing
watches it happen. In the closed case the rule is enforced by the server declining to
answer, every time. One is a wall. The other is a term you could be sued over
years later, if anyone found out.

## Two ways for a release to go wrong

The argument has a first instance. In 2019 OpenAI announced a language model,
withheld most of it citing misuse, then released the rest across
[nine months of staged releases](/wiki/event/gpt-2-staged-release). Its own
report on the decision conceded the objection critics had been making:
withholding cannot keep a capability scarce when motivated people can replicate
the result anyway.

Both postures fail, and the failures are not mirror images.

A closed model fails by moving. It gets deprecated, or the stack around it is
edited, or the company folds, and the thing you built on is gone or is quietly
no longer the thing you tested. It also cannot be studied. What anyone knows
about one from outside is inferred from its behaviour, which is why so many
confident claims about closed models can never be settled either way.

An open model fails by staying. Released weights cannot be recalled. If a set of
numbers turns out to carry a property nobody wanted, there is no patch, no
deprecation notice and no server to switch off, because copies sit on disks in
places nobody has a list of. Refusal behaviour is part of the weights, so
whoever holds them can train it back out, which is
[what safety training installed](/learn/what-safety-training-changes) run
backwards.

**A closed model can be switched off. An open one can only be regretted.**

That is the best argument for closed release and the best argument for open
release at once, which is why the fight does not resolve. The permanence that
makes a bad release unfixable makes a good one unkillable. A model on your own
disk cannot be retired out from under you or changed between Tuesday and
Wednesday, and what you type into it
[never leaves the machine](/learn/where-your-words-go). Researchers can take it
apart, which is the only way anybody checks a claim about a model instead of
trusting it.

So when a release is announced as open, the answer worth having is not yes or
no. It is a layer and a licence: which of the three parts was actually
published, and what got folded into the terms attached to the part you got.
Those two answers tell you what you can build with it and what happens if the
company changes its mind. The word open tells you none of it.
