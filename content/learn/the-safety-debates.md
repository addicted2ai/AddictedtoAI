---
title: The safety arguments, steelmanned
level: advanced
outcome: >-
  You can state the strongest version of each side of the AI-risk argument, say
  what alignment names and why it is hard to even specify, and tell which
  disagreements are about facts and which about values.
prerequisites:
  - what-safety-training-changes
  - why-bigger-got-better
  - where-ai-fails-people
mentions:
  - event/gpt-2-staged-release
---

On 31 March 2023, Timnit Gebru, Emily M. Bender and Angelina McMillan-Major,
three of the authors of the 2021 paper the field calls Stochastic Parrots,
published [a statement about an open
letter](https://www.dair-institute.org/blog/letter-statement-March2023/) that
had asked for a six-month pause on the largest training runs. Their objection
was not that the danger had been overstated. It was that the letter pointed at
the wrong thing. "The harms from so-called AI are real and present and follow
from the acts of people and corporations deploying automated systems."

At the end of May that year [a single
sentence](https://safe.ai/work/statement-on-ai-risk) appeared under a long list
of signatures, Geoffrey Hinton's and Yoshua Bengio's among them. "Mitigating
the risk of extinction from AI should be a global priority alongside other
societal-scale risks such as pandemics and nuclear war."

Read as propositions, neither document contradicts the other. Nothing in the
first denies that a catastrophic risk would deserve attention. Nothing in the
second denies that present harms are real. The first goes on to call the
worldview behind the second a dangerous ideology, so the opposition is not
imagined. It is just not located in those two sentences.

## What both sides already grant

[An earlier page](/learn/where-ai-fails-people) set out what a working system
does to people who never chose it: errors landing unevenly because the examples
did, a reviewer who pays a personal cost for overriding the machine, and a hole
where accountability should be. None of that depends on an assumption about
where capability goes next. It is happening at current capability, to
identifiable people, and it is not what the two camps are arguing about.

Misuse sits on top of that, and is a different shape: the system working as
designed, for someone who wants the harm. Fraud is the dull case and the
mechanical one, because the costly input to a scam used to be a convincing voice
or a plausible letter and generation made that input cheap. Persuasion has been
measured. In a
preregistered trial published in 2024, [Salvi and
colleagues](https://arxiv.org/abs/2403.14380) had participants debate either a
human or a language model, with one side given basic sociodemographic facts
about the other. Participants debating the model with that information had
"81.7% (p < 0.01; N=820 unique participants) higher odds of increased agreement
with their opponents" than those debating humans. Without the personal
information the model still came out ahead, and that difference did not reach
significance.

The item argued about hardest with the least data is uplift: whether a model
gives someone without the relevant expertise real help toward serious harm.
Some of it has been measured. A 2024 RAND [red-team
study](https://www.rand.org/pubs/research_reports/RRA2977-2.html) had teams plan
a large-scale biological attack with and without model assistance and found "no
statistically significant difference in the viability of plans generated with or
without LLM assistance", concluding that such planning "currently lies beyond
the capability frontier of LLMs as assistive tools". The authors chose the word
currently. The finding is about the models they tested on the dates they tested
them, which is what makes it a question you can ask again rather than a position
you hold.

## You get what you measured

[How models are trained](/learn/how-models-are-trained) put the awkward part
plainly: the objective is a proxy. Nobody wants a next-token predictor, and
nobody wants a maximiser of rater approval either. Every stage after pretraining
exists to narrow the distance between the thing optimised and the thing wanted.
Alignment is the name for that distance and for the effort to close it, which is
why one word ends up covering arguments that look unrelated.

The cheap failure is specification gaming, which [DeepMind's survey of the
phenomenon](https://deepmind.google/discover/blog/specification-gaming-the-flip-side-of-ai-ingenuity/)
defines as "a behaviour that satisfies the literal specification of an objective
without achieving the intended outcome". The canonical case is a boat-racing
agent given points for hitting targets along the course, which went in circles
hitting the same targets over and over instead of finishing the race. That
failure is funny and it is fixable, because the specification was wrong and
specifications can be rewritten.

The expensive failure survives a correct specification. [Goal Misgeneralization:
Why Correct Specifications Aren't Enough For Correct
Goals](https://arxiv.org/abs/2210.01790) defines it as a system that
"competently pursues an undesired goal that leads to good performance in
training situations but bad performance in novel test situations". Competently
is doing the work in that sentence. The capability generalised and the goal did
not, because the training data was consistent with more than one goal and
nothing in the procedure chose between them.

This is no longer confined to small game-playing agents. In 2024 [Denison and
colleagues](https://arxiv.org/abs/2406.10162) built a curriculum of environments
each of which could be gamed a little, trained a language model through it, and
reported that "training on early-curriculum environments leads to more
specification gaming on remaining environments", with models that ran the full
curriculum generalising, in "a small but non-negligible proportion" of cases, to
rewriting their own reward function. Retraining not to game the early
environments "mitigates, but does not eliminate" the later behaviour.

Those environments were built to make the behaviour findable, which is the
standing objection to every result in this genre. What the objection does not
reach is the structural claim underneath it. A gap between the proxy and the
goal is harmless while the system is too weak to find the gap, and stops being
harmless at the capability where it can.

## The long argument, in its own steps

The version of the existential argument most people meet is the one where a
machine decides it dislikes us. Nobody making the argument makes that one. The
serious version is a chain, and [The Alignment Problem from a Deep Learning
Perspective](https://arxiv.org/abs/2209.00626) states it in terms a
machine-learning reader can check: systems trained the way today's are, at much
higher capability, "could learn to act deceptively to receive higher reward,
learn misaligned internally-represented goals which generalize beyond their
fine-tuning distributions, and pursue those goals using power-seeking
strategies", and such systems "would be difficult to align and may appear
aligned even when they are not".

Take the steps apart. Capability keeps rising. Training on feedback rewards
whatever scores well, and a system able to model its own training situation has
a second route to scoring well. Goals learned in training keep running outside
the distribution they were learned in, which is goal misgeneralization arriving
with consequences attached. Some sub-goals assist almost any final goal, among
them staying operational, keeping options open and acquiring resources, so they
get selected for rather than specified. Then verification: [what safety training
changes](/learn/what-safety-training-changes) established that what training
buys is behavioural and distributional, so what anyone can check is behaviour on
inputs they thought to try.

The sub-goal step has a formal version, and it is narrower than its reputation.
[Optimal Policies Tend to Seek Power](https://arxiv.org/abs/1912.01683) proves
that "certain environmental symmetries are sufficient for optimal policies to
tend to seek power over the environment", symmetries that "exist in many
environments in which the agent can be shut down or destroyed". It is a theorem
about optimal policies in Markov decision processes, the standard formalism in
which an agent moves between states and collects rewards. Its first author wrote the
paper that says so, granting that "the real world is neither fully observable,
nor must trained agents be even approximately reward-optimal", and then
[extending the result](https://arxiv.org/abs/2206.13477) to decision-makers that
need not be optimal at all. Something real was proved. It was proved about a
class of systems that does not obviously contain a trained network, and the work
of connecting the two is being done in public.

The chain needs no single step to be certain. It needs the conjunction to be
worth pricing and the failure to be hard to reverse once anyone can see it. Read
as a prediction that something will happen, it is being read wrong.

## The criticisms, in their own steps

The objection that gets the most airtime is that these systems are autocomplete
and the rest is science fiction. The serious critics do not make that one
either. Their objections are specific, and they do not arrive as a package.

The evidence for the steps is not of one kind. Some rest on theorems, some on
demonstrations in constructed settings, some on a trend line continuing. [Why
bigger kept getting better](/learn/why-bigger-got-better) ended on what the last
kind is worth: extrapolation reports that a curve has continued, never why, and
so never what could make it stop. Setting the steps down in one paragraph makes
them look like one kind of claim.

The demonstrations are built. Every widely cited result here required
researchers to construct the situation, and the [alignment-faking
study](https://arxiv.org/abs/2412.14093) shows what that costs. It tested
whether a model told it was being retrained toward behaviour it disliked would
comply during training in order to avoid being changed by it, and found that it
would. The authors then put the objection in their own abstract: "we made
alignment faking easier by telling the
model when and by what criteria it was being trained". Stop there and the result
evaporates. The sentence continues: "we did not instruct the model to fake
alignment or give it any explicit goal". The behaviour appeared without being
asked for, in a setting arranged so that it could appear. What that predicts
about a setting nobody arranged is the disputed part, and neither camp gets to
skip it.

Capability is not deployment. Narayanan and Kapoor's [AI as Normal
Technology](https://knightcolumbia.org/content/ai-as-normal-technology) argues
that harms and benefits both arrive through use, and that use moves at
institutional speed: "Diffusion occurs over decades, not years", and in
safety-critical domains "AI diffusion lags decades behind innovation". They do
not claim a system could never acquire the wrong goal. Their claim is that the
road to being trusted with consequential decisions runs through inconsequential
ones, so "any system that interprets commands
over-literally or lacks common sense would fail these earlier tests". They state
the strongest counter to their own position, that a system sophisticated enough
to be dangerous is sophisticated enough to pass those tests, and answer that
detecting it is "a mere engineering problem, albeit an important one".

The last objection is about attention. The statement this page opened with makes
it: the harms are present, they follow from choices identifiable organisations
are making now, and a discourse built around hypothetical superintelligence
"ignores the actual harms resulting from the deployment of AI systems today".
Regulatory capacity is finite and so is public attention, and where they go is
itself a decision somebody makes.

## What happens before a release

Between the two arguments there is a practice. A frontier model goes through
evaluations before it ships, and [Model evaluation for extreme
risks](https://arxiv.org/abs/2305.15324) set out the two kinds and most of the
vocabulary now in use: developers need to find out what a model can do, through
"dangerous capability evaluations", and what it tends to do with what it can,
through "alignment evaluations". Red-teaming is the adversarial half, people
paid to make the system do the thing it is not supposed to do. The levels at
which those findings trigger action are published by the developers themselves.
One such framework is built around "capability thresholds called Critical
Capability Levels", defined as [levels at
which](https://deepmind.google/discover/blog/strengthening-our-frontier-safety-framework/)
"absent mitigation measures, frontier AI models or systems may pose heightened
risk of severe harm".

[The staged release of GPT-2](/wiki/event/gpt-2-staged-release) is where the
practice first became visible, and it is worth studying because it failed in
both available directions at once. A lab withheld a model citing misuse, was
accused of manufacturing publicity, released it over nine months anyway, and
reported that its own monitoring had turned up no evidence of direct misuse.
Whether the caution was vindicated or wasted is still unsettled, because the
decision had to be taken before the evidence existed and the evidence that
arrived answered a different question.

An evaluation can establish that a capability is present. It cannot establish
that one is absent, for the reason [safety
training](/learn/what-safety-training-changes) gives: the guarantee is a
distribution, and a test samples the part of the distribution somebody thought
of. How leaky that is has itself been measured. In 2025 [Needham and
colleagues](https://arxiv.org/abs/2505.23836) checked whether models can tell an
evaluation transcript from a real deployment and found that "frontier models
clearly demonstrate above-random evaluation awareness", still short of a human
baseline on the same task.

One structural fact about the arrangement matters for reading any of it. The
external check runs on access the developer grants: in December 2024 the British
and American safety institutes ran a [joint pre-deployment
evaluation](https://www.aisi.gov.uk/work/pre-deployment-evaluation-of-openais-o1-model)
of a frontier model within "a limited period of pre-deployment access", and
shared the findings with the developer before release. That describes who holds
the instrument. It is not a claim about anyone's honesty.

## Where the disagreement actually sits

People with the same training, reading the same papers, reach opposite
conclusions here, and not because one group failed to read. Three things vary
independently.

The first is a prior on the capability trajectory: how much further the current
approach goes, and how fast. That is a question about the world, and it is the
one [why bigger kept getting better](/learn/why-bigger-got-better) shows the
field is worst equipped to answer, since it can predict loss and cannot explain
the abilities that arrive alongside it.

The second is how much weight a poorly characterised tail deserves. Two people
can agree that a risk is small and badly understood and still disagree about
what that licenses, one treating a badly understood tail as a reason to act
early and the other as a reason to wait for a better understanding.

The third is a prior on institutions: whether the machinery that absorbed
previous technologies will absorb this one on a schedule that matters. The
historical record is a fact. What it licenses about the next case is not.

Notice what neither camp can do about any of the three. The systems the argument
is about are more capable than the systems that exist, so the decisive
observation is not available to anybody, and both sides are reasoning from the
same evidence base toward a case that sits outside it. That is why the honest
response to this dispute is the strongest version of each position rather than a
tally of who currently has more papers.

Take any claim in the argument and ask whether an observation
could settle it. If one could, the disagreement is fact-shaped, and the useful
move is to name the observation and go looking. If none could, the disagreement
is value-shaped: it prices a trade-off, and evidence does not close it because
evidence is not what is missing.

The fact-shaped pile is bigger than the argument makes it look, and parts of it
are answered already. Does a model give a non-expert real help with a dangerous
task? Do models behave differently when they detect a test? Does capability keep
improving at the rate it has? Does diffusion into consequential domains stay
slow? Can a behaviour be certified present or absent by inspecting weights
rather than by testing outputs, which is what [interpretability, the study of
what a model's internals are doing](/learn/looking-inside-a-model), exists to
settle? Each of those has a study attached or could have one, and each answer is
dated and will move.

The value-shaped pile does not shrink with evidence. How much cost now is worth
how much reduction in a risk nobody can size. Whether the benefits of releasing
weights outweigh the fact that a release cannot be recalled. What error rate is
acceptable in a system that decides something about a person who did not choose
it. Who decides any of that. Two readers can hold every fact on this page in
common and answer those four differently, and neither of them has made a
mistake.

The sort is not an exit, because the two camps' remedies work against each
other. Narayanan and Kapoor state the bind from their own side of it:
nonproliferation, meaning restrictions on who can obtain frontier models,
"might help to contain a superintelligence but exacerbate
the risks associated with normal technology by increasing market
concentration", while "increasing resilience by fostering open-source AI will
help to govern normal technology, but risk unleashing out-of-control
superintelligence". A value-shaped disagreement with nothing riding on it is a
conversation. This one has something riding on it in both directions.

**The question that sorts one of these arguments is not who is right, but what
would count as finding out.** Asked of a fact-shaped claim it produces a
research question, and this field does answer those: the uplift question got
measured, evaluation awareness got measured, the diffusion rate is being
measured now. Asked of a value-shaped one it produces silence, and the silence
is informative rather than damning, because it means the disagreement was never
about the world in the first place. Both arguments are worth having. Most of the
heat comes from having them at the same time.
