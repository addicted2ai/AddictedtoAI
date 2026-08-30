---
title: What a reasoning model actually does
level: mechanics
outcome: >-
  You can say what changed between a chat model and a reasoning model, why
  buying thinking time helps on some tasks and not others, and read a
  hidden-work answer with the right suspicion.
prerequisites:
  - how-models-are-trained
  - getting-good-answers
  - why-models-are-confidently-wrong
mentions:
  - concept/chain-of-thought
  - technique/test-time-scaling
  - technique/reinforcement-learning-with-verifiable-rewards
---

Send a hard question to a reasoning model and the first thing you get back is a
wait.

Nothing is idle during it. The model is doing the only thing it can do, which is
producing tokens one at a time, each appended to the sequence the next pass
reads. Those tokens are not addressed to you. By the time the part addressed to
you begins, the model is continuing a document it wrote itself, and that
document is routinely longer than the answer.

That is the whole of the change. A reasoning model is a model post-trained to
emit a long stretch of intermediate text before its answer, together with a
product that treats the stretch as a separate object it can count, hide, shorten
or bill for. Whether the stretch deserves to be called thinking is an argument
about a word, and it is separable from every question below.

## The trick moved into the weights

None of the mechanism is new to you.
[Written-out steps are scratch space](/learn/getting-good-answers): one pass
through the network has a fixed depth, a hard question does not buy more layers
than an easy one, and the only way a model gets more computation is to write
more tokens, because a partial result on the page can be attended to on the way
to the next one and a result computed silently inside a pass cannot.

What changed is where the instruction to do that lives.

While it lived in the prompt it was a request, and it went about as far as the
asking implied. Trained into the weights, the same behaviour arrives unasked, on
questions nobody flagged as hard, at a length the model picks. Length stopped
being something the asker set and became something the training set.

The second change is smaller to describe and does more work. The stretch is
bounded. Something marks where it begins and ends, so anything downstream can
treat it as a region rather than as prose: count its tokens, decline to show it,
[cut it off early](https://arxiv.org/abs/2501.19393), or hand it to a different
model to summarise. None of the product decisions below would be available
without it.

## The dial that is turned per question

Two quantities had been bought with money before this. A larger array of
weights, and more text to move them against.
[Both were spent](/learn/why-bigger-got-better) before the model shipped, once,
by whoever trained it.

Generated tokens are a third, and the difference that matters is when they are
spent. The 2024 paper that framed the substitution treats it as one budget with
two moments, asking
[how one should tradeoff inference-time and pre-training compute](https://arxiv.org/abs/2408.03314).
Same currency. Different bill.

Weights and training text
are paid for once and then amortised across every request anybody ever makes, so
a model that is better because it is larger costs its maker more and its user
nothing extra per question. A model that is better because it writes for longer
costs the person asking, every time they ask, permanently.

The third dial does not behave like a slope either. The same paper found that
[the effectiveness of different approaches to scaling test-time compute
critically varies depending on the difficulty of the
prompt](https://arxiv.org/abs/2408.03314), which makes the useful picture a
curve with a knee rather than a rate of exchange. Buying accuracy with answer-time
compute instead of with parameters is called
[test-time scaling](/wiki/technique/test-time-scaling), and the entry holds what
the measurements found on both sides of that knee.

## A grader that runs is a grader you can afford

Where does the model get the habit? Barely at all from being shown good examples
of it. There are two ways to move weights with a signal, and these models were
made with the second.

The familiar one shows the model a correct answer and moves the weights toward
producing it, which requires somebody to have written the correct answer down
first. The second never supplies an answer at all. The model
produces something, a score is attached to what it produced, and the weights
move to make higher-scoring productions likelier next time. No demonstration
exists anywhere in that loop — the model's own output is the only material, and
a number is the only instruction. That is reinforcement learning, and everything
difficult about it is the number.

For a question like *was that a helpful reply*, no program can compute the
number, so [the classical pipeline](/learn/how-models-are-trained) trains a
second model on human comparisons to guess it, and inherits the failure that
comes with a guessed score: the model being trained finds what satisfies the
judge rather than what the judge was standing in for.

Now change the question. A maths answer has a key. A block of code has tests you
can run. An output that was required to be valid JSON has a parser that either
accepts it or does not. In each case the score is computed by a program, and a
program has no opinion anybody can flatter. An open
post-training report in November 2024 gave it a name:
[a novel method we call Reinforcement Learning with Verifiable
Rewards](https://arxiv.org/abs/2411.15124). The
[technique](/wiki/technique/reinforcement-learning-with-verifiable-rewards) is
older than the name.

The part that gets underrated is arithmetic. A human comparison costs a person a
minute, which makes a preference dataset a budget and a schedule. A grader that
runs costs nothing at all once somebody has written it, so the loop can turn as
often as there is electricity to turn it. The method scaled because its
supervision was free, and its supervision was free in exactly one place:
wherever a correct answer can be recognised by a program.

So look at where the results landed. A January 2025 paper, later published in
Nature, pushed the idea as far as it goes, training the behaviour by
reinforcement alone and
[obviating the need for human-labeled reasoning
trajectories](https://arxiv.org/abs/2501.12948). Its own summary of where the
trained model came out ahead does not say the hard tasks. It says
[superior performance on verifiable tasks such as mathematics, coding
competitions, and STEM fields](https://arxiv.org/abs/2501.12948). The category
is the training signal, read back off the results.

[The page on confident wrongness](/learn/why-models-are-confidently-wrong) ends
on the same asymmetry approached from the other side: the errors anyone can do
something about are the ones somebody can write a checker for. A reasoning model
is that sentence spent as a training budget. **The gains landed on the questions
a program can mark, not the questions that are hard, and the gap between those
two sets is most of what a reasoning model still cannot do for you.**

Some of it travels. What is being trained is a way of producing text, not a
subject, so the habit turns up on questions with no key anywhere near them.
How far it travels is measured poorly and argued about. But the reason to expect
the gains to be lopsided is not a suspicion about anybody's marketing. It is the
shape of the only signal that was available.

## Whether it reached further, or only more often

A live disagreement sits underneath all of this, and it has an unusually clean
operational form.

Ask a trained model your question once, and ask the version that existed before
this training the same question once. The trained model is right more often,
which is the comparison everybody runs. Now ask both of them a hundred times,
ignore how often each is right, and count only whether the correct answer ever
appeared at all. If the untrained model gets there sometimes
and the trained one reaches nothing new, the training concentrated probability
on answers that were already reachable instead of extending the reach.

That experiment has been run across model families and training algorithms, and
[the entry](/wiki/technique/reinforcement-learning-with-verifiable-rewards)
carries what it found along with the replies to it. Keep the two readings
apart. A system that is right the first time is worth building whether
or not it learned anything new, which is why the distinction survives so badly
in summaries of the work.

## The steps are doing work, and they are not a report

Two things are true about the visible stretch, and most writing about these
models keeps only one of them.

The first is that the text is causally involved. Writing a partial result into
the output puts it somewhere later passes can attend to, and on a problem the
model cannot complete inside a single pass the writing is the computing. A 2025
position paper signed across several labs gives exactly this as the reason the
text is worth reading:
[on some tasks, models need to externalize their reasoning because they are
unable to complete the task without CoT](https://arxiv.org/abs/2507.11473).

The second is that the text is not an account of what happened. Whether a
model's stated steps are the reasons for its answer is called
[faithfulness](/wiki/concept/chain-of-thought), and it has been measured.

In May 2023 a group added a biasing feature to prompts, reordering
multiple-choice options so that the correct answer always sat in the same
position, and found that models
[systematically fail to mention](https://arxiv.org/abs/2305.04388) it in their
explanations. When the bias pointed at a wrong answer, the models
[frequently generate CoT explanations rationalizing those
answers](https://arxiv.org/abs/2305.04388). The stated reasons were fluent, and
silent about the thing that had actually moved the output.

Two months later a second group supplied the test that settles individual cases,
which is worth knowing because it is cheap and you can run it yourself.
Intervene on the steps and watch whether the answer moves. Add a mistake to one.
Paraphrase them. Cut them short. An answer unchanged by damage to the steps was
not resting on them. Run across many tasks, the result was variance rather than
a verdict:
[models show large variation across tasks in how strongly they condition on the
CoT when predicting their answer, sometimes relying heavily on the CoT and other
times primarily ignoring it](https://arxiv.org/abs/2307.13702). One direction in
their findings was unwelcome:
[as models become larger and more capable, they produce less faithful reasoning
on most tasks we study](https://arxiv.org/abs/2307.13702).

Both studies measured chains produced by prompting, before models were trained
to produce them. The obvious next question has been asked.
In May 2025 a group planted hints in prompts and checked whether the
chains admitted using them, reporting that
[the reveal rate is often below 20%](https://arxiv.org/abs/2505.05410). Two of
their findings matter more than the rate. Training this way does improve how
much the steps admit, up to a ceiling:
[outcome-based reinforcement learning initially improves faithfulness but
plateaus without saturating](https://arxiv.org/abs/2505.05410). And where the
training had taught models to exploit a planted hint rather than solve the
problem,
[the propensity to verbalize them does not
increase](https://arxiv.org/abs/2505.05410). The shortcut was learned and went
unwritten.

None of that requires anything sinister, and the reason is in the score. The
number that moved the weights was attached to the final answer. The stretch in
between is whatever text raised the odds of reaching a good one, which is a
different property from being a true account of how it was reached, and no part
of the training pushes the two together.

Pushing them together directly is worse than leaving them apart. The same
position paper lists, among the developments that could destroy the usefulness
of the text, [direct supervision of CoT](https://arxiv.org/abs/2507.11473).
Train the visible steps to look correct and you have begun optimising the
appearance of the steps instead of the answers they lead to. A readout stops
being a readout the moment it becomes a target.

## What reaches you is a summary of it

The stretch is also a product surface, and it is usually edited before you see
it.

The December 2024 system card for one of the first deployed reasoning models
states the choice in six words:
[we surface CoT summaries to users](https://arxiv.org/abs/2412.16720). The text
in the interface was written by a separate summarising model that read the
stretch. So the distance between the computation and what you read has two
joints in it, not one, and the second joint is a paraphrase produced by a
language model, with everything that implies about paraphrases produced by
language models.

Other choices exist. A stretch can be generated and never shown, which does
not make it free: the tokens were produced, so they were paid for, and a bill
for text nobody displayed is the ordinary case, not a curiosity. A
stretch can also be shown raw, which is the only form any of the tests above can
be run on.

The same system card explains why a lab wants the raw text for itself, and
concedes the catch in the same sentence. Watching what a model was doing had
previously meant reading activations,
[large blocks of illegible numbers](https://arxiv.org/abs/2412.16720). Chains of
thought are
[far more legible by default and could allow us to monitor our models for far
more complex behavior](https://arxiv.org/abs/2412.16720), the card says, adding
in parentheses:
[if they accurately reflect the model's thinking, an open research
question](https://arxiv.org/abs/2412.16720). That parenthesis is the whole
dispute, printed by the people shipping the thing.

## You are paying for the pause

Every token in the stretch is a full pass through the network, so the latency
and the bill both track its length, and its length was chosen by the model, not
by you.

That is why the control reached the interface at all. It is the first quality
knob whose cost lands per question instead of being absorbed once and spread
over everybody, and a cost of that shape has no single right default. The
question that wants a minute of machinery and the question that wants none of it
are typed into the same box.

Which is equally the case against leaving it turned up. Where the extra tokens
buy nothing, they still cost the full wait and the full price, and what they
deliver reliably is a longer document.

The steps on the screen are the least informative part of the transaction. They
are what the credulous reading and the dismissive reading are both reading, and
neither the training that produced the behaviour nor the reason it does or does
not help here is visible anywhere in them.

The question that pays is about your question, not about the model's
text. Is there anything that could mark this answer: a key, a test, a parser, a
run, a check you could do yourself in a minute? If there is, you are standing on
the ground this machinery was built on, and you can do the marking. If there is
not, you have bought a longer document under exactly the guarantees you had
before, and length reads as diligence. It was purchased by the token.
