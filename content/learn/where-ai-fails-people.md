---
title: Where AI fails people
level: orientation
outcome: >-
  You can name the ways a working AI system still hurts people, explain why its
  errors land unevenly, and ask the one question that matters about any
  consequential deployment.
prerequisites:
  - learning-from-examples
  - what-ai-is-used-for
mentions:
  - concept/hallucination
---

In January 2020, Detroit police arrested Robert Williams on his front lawn, in
front of his wife and their two young daughters, and held him for nearly thirty
hours. Face recognition software had matched him to a thief caught on a watch
shop's surveillance feed. During the interrogation an officer laid the
surveillance image in front of him. Williams held it up beside his own face. One
of the officers said, "The computer must have gotten it wrong." He was kept in
the cell for several more hours, and the charges were later dismissed, according
to [the account published by his
lawyers](https://www.aclu.org/news/privacy-technology/wrongfully-arrested-because-face-recognition-cant-tell-black-people-apart).

That the software was wrong is the least interesting part. Everything trained is
wrong sometimes. What should stop you is that the arrangement worked and it made
no difference. A person did look. A person did say out loud that the machine had
made a mistake. The man stayed in the cell.

Nothing here broke. This is a system working roughly as sold, whose errors fell
where nobody was counting, on someone with no way to make anyone count.

## The errors had already been counted

The month before that arrest, the United States government's own measurement
laboratory [tested 189 face recognition
algorithms](https://www.nist.gov/news-events/news/2019/12/nist-study-evaluates-effects-race-age-sex-face-recognition-software)
from 99 developers, most of the industry, and found that the majority do not
work equally well on everyone. Picking a face out of a database, they produced
false positives — declaring two photographs to be the same person when they are
not — at higher rates for African American women. The report said why that gap
mattered most. The consequences "could include false accusations."

So how does software end up worse at some faces than others, when nobody sat
down and made it so? Two years earlier, [a study of commercial face
software](https://proceedings.mlr.press/v81/buolamwini18a.html) had found part
of the answer in the exam papers. It took three systems that were on sale and
working, and began by measuring what the standard collections of photographs
used to grade such systems contained. Close to eight in ten of the faces in one
were light-skinned, nearer nine in ten in the other. Grade a system on those and
a weakness on the faces they are short of barely moves the mark. So the
researchers built a balanced set and ran the exam again. On the simpler job of
guessing whether a face belonged to a man or a woman, the worst error rate for
darker-skinned women was 34.7 per cent. For lighter-skinned men, 0.8.

You already have the mechanism. A trained system learns what its examples have
in common, and [the pile is the world](/learn/learning-from-examples) as far as
it is concerned. So is the pile it is graded on, which is where the number on
the box comes from. A collection four-fifths made of one kind of face describes
a world in which the other kinds are unusual, and the loop put its effort where
the score was. The score went down. Nothing in that is malice and nothing in it
is a defect. A single figure for how often software is right is an average, and
an average is ruled by whoever the pile had most of.
**An accuracy rate is a promise made to the people the examples had most of.**
Everyone else is inside that number too, averaged away.

None of which is fate, and the same report carries the evidence. Not all the
algorithms produced those high rates, and the ones that treated groups most
equally ranked among the most accurate, so nothing had to be traded away to get
there. On the report's other task, checking a photograph against one other
rather than against a whole database, algorithms developed in Asian countries
did not show the large gap between Asian and Caucasian faces that the
American-built ones did. Its authors were careful to say they had not studied
the cause, and named the training data as the obvious place to look.

## It never has to be told

Money shows the same structure with no faces in it. In 2019, four researchers
[measured what American lenders charge](https://www.nber.org/papers/w25943) and
found Latino and Black borrowers paying more for mortgages than equally risky
borrowers who are not. Lenders who price by algorithm did it too, 40 per cent
less than the ones where a person sits across a desk. Keep both halves. The
software discriminated less than the people it replaced, and it discriminated
without ever being handed anyone's race.

The researchers report the pattern as consistent with lenders charging more
where borrowers shop around less, and who has the time and the practice to shop
around is not evenly spread either. That is why leaving race off the form does
not work. Postcode, phone model, the hour the form was submitted, the school on
the application: a system does not need to be told your race when the world
hands it a hundred things that travel alongside it.

From inside a single decision none of this can be seen. A declined loan looks
like a declined loan. A rate looks like a rate. The pattern exists only across
thousands of cases, and the person it happened to has exactly one. Seeing the
shape takes the whole distribution, which is the one thing nobody on the
receiving end is ever given.

## Wrong for you, wrong about you

When a chatbot [invents a source](/wiki/concept/hallucination) and states it
with total composure, it is wrong for you. You asked it. You are sitting right
there. [An earlier page](/learn/what-ai-is-used-for) made you the second pass,
and a bad answer costs you the trouble of throwing it away. That is unpleasant
and occasionally expensive, and it remains something you entered and can leave.

Robert Williams was not the customer. He did not ask for the software, was not
told it had run, never saw what it compared, and found out a computer was
involved because an officer happened to say so in front of him. That account
notes that people identified this way are almost never told. Three things
separate his position from yours in front of a chatbot. The stakes were not his
to set. He agreed to none of it. And no version of arguing back existed for the
system to receive, because it was never addressing him. It was addressing
someone else, about him.

## What it costs to disagree

Put all of this to anyone running such a system and the answer comes back the
same. There is a human in the loop, reviewing the flagged case, the score, the
match. On paper that is the arrangement that lets an imperfect system do real
work.

Look at what it asks of the person. Agreeing with the system costs nothing and
leaves no trace. Disagreeing means recording that you overrode the software and
carrying the outcome alone if you turn out to be wrong. A reviewer who defers
and is wrong made an ordinary mistake. A reviewer who overrides and is wrong
made a personal one. The name for what follows is automation bias: trusting an
automated judgement further than its accuracy justifies. The better the system
usually is, the more sensible that trust feels.

So the check thins out precisely where it is needed. The system is right most of
the time, deference is reasonable most of the time, and the cases where
deference is catastrophic look, from inside, exactly like the cases where it is
fine.

Before Williams was arrested, the department built a photo lineup around his
driver's licence picture and showed it to a shop security guard who had not
witnessed the robbery. The lineup did not test the match. It was assembled out
of it.

Ask afterwards who decided and the question falls apart in your hands. The
vendor sold a tool and published its error rates. Departments say a match is
only an investigative lead and never grounds for an arrest by itself. The
officers followed that policy as they understood it. Everyone acted inside their
own part, and a man was taken off his lawn in front of his children on the
strength of a match that was wrong. An error no single person made is an error
no single person can be asked to undo.

## The question, in its harder form

That earlier page left you asking who catches a system when it is wrong. The
question gets harder here, because the person the error lands on did not buy the
software, and the person best placed to notice has the least to gain by saying
so.

What happens when it is wrong about someone, and who checks? A real answer names
the person who checks, says what it costs them to say no, and says how the one
it was wrong about ever finds out. "There is a human in the loop" is not an
answer. It is the claim the question exists to test.

You can also run it ahead of the news. Two things are knowable before any system
is switched on: who its examples had least of, and what disagreeing with it will
cost the person assigned to check it. Those answers tell you where the errors
will land and whether anyone will stop them, which is most of what the eventual
investigation will say, years earlier and for nothing.
