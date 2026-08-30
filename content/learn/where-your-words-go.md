---
title: Where your words go
level: foundations
outcome: >-
  You can trace what happens to a message you send an AI product, name the
  places it can end up, and say which questions a privacy policy actually
  answers.
prerequisites:
  - what-a-model-is
mentions: []
---

Press send on a message to an AI chat and it leaves your device encrypted, the
same way your banking does. Nobody between you and the company can read it: not
the café wifi, not your internet provider. At the company's servers it is
decrypted, because what happens next is a computer the company operates
reading your words and computing a reply.

That one step separates this from every other question about private
messaging. A secure messaging app can promise end-to-end encryption, meaning
the message is readable only on the two phones at the ends, so the company in
the middle is a courier moving sealed envelopes. An AI chat cannot promise
that, because the company is not in the middle of your conversation. It is the
other end of it. The computer that writes the reply has to read your words.
Hardware tricks can shrink the set of people able to look over that computer's
shoulder; nothing can make the reading unnecessary.

The useful question is never whether the company's machines can see what you
type. They must. It is what happens to your words afterwards.

## More stops than the screen shows

Before the model sees your message, the product around it has work to do. It
fetches the earlier turns of your conversation from a database and sends them
along too, because [the model keeps nothing between
requests](/learn/what-a-model-is) and what looks like memory is re-reading.
Filters may scan the message on the way in and the reply on the way out. And
in many products, the company whose name is on the app runs no model at all.
It forwards your text to a second company that does and hands you back the
answer. Two companies, two sets of servers, two policies, one of which you
have probably never seen.

## One message, four destinations

Once the reply is on your screen, your message has four places it can end up.

**The reply.** The model read your words, computed from them, and kept
nothing. Its numbers are the same after your conversation as before it. **Of
everything your message passes through, the model is the only part built to
forget it.**

That is why the most common worry points at the wrong layer. "Now the AI knows
this about me" is false in the only sense the words have: the model cannot
retain what you typed. "The company now stores what I typed" is a different
claim, true or false product by product, and it is the one that matters. The
history in your sidebar is not the model remembering you. It is a record in an
ordinary database, which is why it follows you to a new phone. The real
privacy question about an AI chat turns out to be a boring one: the same
question you would ask of any cloud service, aimed at a database.

**The logs.** Apart from the history you can see, a service keeps records you
cannot: what was asked, what was answered, what failed, what tripped an abuse
filter. They exist for the reasons every online service keeps them: something
breaks and an engineer needs to see what happened, or someone abuses the
service and the company needs the trail. A privacy policy states how long they
are kept. The number differs between products and changes over time; what
lasts is the fact that a number exists and can be looked up. A second durable
fact: deleting a conversation removes it from your view; whether and when it
also leaves the company's systems is a separate question with its own answer
in the policy. And stored words are ordinary stored data. A legal
demand reaches a chat log the same way it reaches email.

**Human eyes.** Some conversations are read by people, for two standing
reasons. Safety systems flag conversations for review, and the automated
flagging is wrong in both directions often enough that a person has to check.
And improving a model requires grading its answers, which means paid raters
reading real transcripts and scoring them. The claim to look for is never "no
human reads your chats". The honest version says who may read, what triggers
it, and how the sample is drawn.

**The next model.** The model you are talking to cannot learn from your
conversation. Its training ended before you arrived. But stored chats can be
swept into the training of a future model — a separate job, run later,
producing new weights that someone then chooses to ship. "Used for training"
does not mean your conversation is filed away for that model to consult. It
becomes a small part of an enormous pile of text whose patterns nudge the new
numbers, and in that sense it mostly dissolves. Mostly. Text that is
distinctive, or duplicated across the pile, can occasionally be reproduced by
the finished model close to verbatim, which is why inclusion in a training set
is neither a lookup nor nothing. Real conversations are also exactly the data
a lab cannot buy anywhere else, which is why this destination comes with a
switch, usually labelled something like "improve the model for everyone".
Opt-out is the name for a switch whose default position is on.

## The default follows the contract

The same company routinely runs opposite defaults at the same time. On a free
personal account, conversations may feed future training unless that switch is
flipped. Under the same company's business contract, they are excluded in
writing, because firms whose lawyers read contracts would not sign otherwise.
Neither default reveals the company's character. Both reveal the deal: a free
service is paid for somehow, and usage data is one of the currencies. Any
claim about "what company X does with your chats" is unfinished until it says
which kind of account — and moving from a personal login to a workplace one
can change where your words go more than switching vendors does.

## The questions a policy answers

"Is it private?" has no mechanical content. The route above does, and it
produces the questions a privacy policy exists to answer:

- How long is my content kept?
- When I delete a conversation, what is actually deleted, and when?
- What causes a human being to read it?
- Does it go into training future models, and where does the default sit for
  my kind of account?
- Which other companies receive it along the way?

A policy that answers these has done its job. Notice when one spends its
length on easier questions instead.

One question no policy can answer, because it was never a policy question:
whether the model knows you. It cannot. The parts that can are the parts the
policy is for.

There is exactly one arrangement that removes the route instead of regulating
it: a model whose weights sit on your own computer, where your words never
have to leave at all.
