---
title: Where AI already does real work
level: orientation
outcome: >-
  You can name the places AI already does real work, say which kind of system
  sits under each, and tell a demo from a deployment.
prerequisites:
  - what-ai-actually-is
mentions:
  - event/alphafold-casp14
  - event/stable-diffusion-release
---

Between your card touching the reader and the terminal saying yes, something
decides whether the payment is really yours. It takes about a second and no
person is involved. Software that learned from an enormous record of past
payments, and how each turned out, scores this one, and the score settles it:
approve, decline, or ask.

That software is wrong in both directions every day. It declines people buying
their own groceries and it waves through some theft. It has been in service
anyway, for years, almost everywhere. What keeps it there is not that its error
rate is small. It is that the bank knows what to do about the errors: a text
message asking whether that was you, a queue where the expensive cases go to a
person.

Look anywhere AI does real work and you find that arrangement. What differs is
the answer to one question: what happens when it is wrong?

## Where the mistakes go

Ranking got in early, and it cheated on that question to do it. Nobody can say
which post should have been third. There is no right answer to be wrong about,
only a guess that holds attention slightly better or worse than the last one.
Software with no wrong answers available to it can go into service the moment
it works.

Most work is not so forgiving, and the next cheapest arrangement is an undo.
Your camera runs on one. The picture you took was not really taken, it was
computed: several frames merged and sharpened by software trained on what
photographs are supposed to look like. It survives being wrong because a
failure costs one bad picture and a retake. Nobody compares a photograph
against the light that fell on the sensor.

Where a mistake is expensive, the arrangement gets expensive too, and what it
buys is usually a second pass. Machine translation moves an enormous volume of
text every day, and the translations that carry weight go to a person who edits
rather than writes. Transcription works the same way: the subtitles, the
doctor's dictation. In none of these is the machine's job to be right. Its job
is to be close enough that checking it is cheaper than doing it.

An [earlier page](/learn/what-ai-actually-is) put the spam filter and the feed
on your map of an ordinary day. This is the other half of that map: the same
kind of software working on your behalf in places you have no reason to look,
and the reason you have no reason is the point. **The AI you never notice is
not the AI that stopped making mistakes. It is the AI whose mistakes stopped
being yours.**

## The ones that hand you the mistake

Every system above judges, sorts or converts, and what comes out is small: a
score, an order, a line of text, a picture nobody will audit. The ones that
arrived loudly make things instead. A chatbot's answer, a generated image, a
suggested block of code, a voice reading a paragraph aloud. Each is a finished
object made for one person on request, with no queue behind it and no second
pass. You are the second pass. That is why these landed as products you sit in
front of, not machinery humming somewhere.

Code is the case that shows the rule working. A programming assistant is wrong
constantly, and it went into daily professional use fast, because programming
already had the checking built. The code compiles or it does not. The tests
pass or they do not. Somebody reads it before it ships. A craft that spent
decades building machinery to catch human mistakes turned out to own machinery
that catches a machine's mistakes just as well. Where that kind of checking is
thin, the uptake is thin with it.

Image generation sits at the same end for a cruder reason. In August 2022 the
trained settings of an image generator were [published for anyone to
download](/wiki/event/stable-diffusion-release), and within a week strangers
had built things with it nobody had planned. A bad picture costs one more press
of the button, the cheapest second pass there is.

## A prediction somebody could check

The strongest thing that can catch a mistake is an experiment, which is why the
clearest case of AI doing scientific work happened in a field that already knew
how to find out.

Every two years since 1994, protein scientists have run a blind exam. Groups
are handed nothing but the chain of chemical units a protein is built from, and
asked what shape it folds into. Their answers are scored against a shape some
laboratory has already established and not yet published. In November 2020 a
trained system entered [that exam](/wiki/event/alphafold-casp14), and its
organisers announced that a fifty-year-old problem in biology had been solved.

What made the predictions usable was not that they were always right. A
predicted shape is a hypothesis, and biology had spent a century building ways
to test one. They went into the ordinary work of laboratories that could check
them. That is what real scientific use looks like, and it looks very little
like a machine making discoveries.

## What a launch video leaves out

A demo is the software. A deployment is the software plus everything built to
survive it being wrong.

A launch video shows the system succeeding, which is compatible with any
failure rate at all. It does not show who is standing behind the system: the
operator watching remotely, the queue, the older and duller thing that quietly
takes over. And it does not show the conditions. Demos run on chosen inputs, in
good light, on the route somebody drove twenty times last week.

You have met this gap from the other side. Every customer-service chatbot that
cannot find your order was once a transcript in an announcement, handling a
refund beautifully. Nothing was faked. The transcript was real, the thing in
front of you is real, and between them lie all the customers who asked in ways
nobody rehearsed.

The gap runs the other way too. A deployment is usually duller than the demo
that preceded it and worth far more. The score at the card reader was never
going to be a launch event.

So there is one question, and it is not the headline's. The headline asks
whether the software can do the thing. The useful question is who catches it
when it cannot. Where something real catches it — a test that fails, an
experiment that settles it, an undo that costs a second — the work can be
deployed, and probably has been for longer than you noticed. Where nothing
catches it, you are looking at a demo, however well it performs. And where the
thing catching it is a person who did not choose to be standing there, the
question has stopped being an engineering question.
