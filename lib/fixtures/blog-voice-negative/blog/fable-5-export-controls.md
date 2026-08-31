---
title: "fable-5-export-controls"
date: "2026-08-14"
mentions: []
---

Posted
·
Facts verified
·
Subscribe via RSS
·
Back to the blog

On Friday 12 June 2026, the US government applied export controls to
Claude Fable 5 and Claude Mythos 5 — Anthropic’s newest
models, and the company says the most capable it has ever made
generally available. The order required Anthropic to restrict access
to foreign nationals, whether inside or outside the United States.
Because the order took effect immediately and Anthropic says it had
no reliable way to verify nationality in real time, it

suspended access to both models for all users

, everywhere. The controls were lifted on 30 June — eighteen
days later — and Fable 5 came back the following day, 1 July.
A government order had taken a frontier model away from the entire
world, and on the public record, the reason is almost entirely the
vendor’s own account of it.

## What happened, in dates

The episode sits in a short, well-dated record. Three sources carry
it, and nothing else was needed to write this post:

2 June — President Trump signs

Executive Order 14409

, “Promoting Advanced Artificial Intelligence Innovation and
Security”. Its Section 3 orders a classified benchmarking
process to assess models’ advanced cyber capabilities and set
a threshold for designating a “covered frontier model”,
and designs a voluntary framework under which developers would give
the federal government access to such models for up to 30 days
before releasing them to other trusted partners. The order states
explicitly that nothing in it “shall be construed to authorize
the creation of a mandatory governmental licensing, preclearance,
or permitting requirement” for AI models.

9 June — Anthropic

launches Claude Fable 5 and Claude Mythos 5

together. Fable 5 “is available everywhere today”;
Mythos 5 goes only to a small set of Project Glasswing partners.

12 June, Friday — export controls are
applied; Anthropic suspends both models for all users. The
suspension exists on the record as an update block appended to the
launch post: “We are suspending access to Claude Fable 5 and
Claude Mythos 5.”

26 June — the US government approves
restoring Mythos 5 to a set of US organizations.

30 June — the controls are lifted, per
Anthropic’s redeployment post, which links a post from
Commerce Secretary Howard Lutnick as the notice.

1 July, Wednesday — Fable 5 is available
again globally on the Claude Platform, Claude.ai, Claude Code and
Claude Cowork, with AWS, Google Cloud and Microsoft Foundry to
follow “as quickly as possible”.

The arithmetic is simple, and worth being exact about: the controls
ran from 12 June to 30 June — eighteen days. Fable 5, the model
everyone had, was dark for those eighteen days plus one more, coming
back on 1 July. Mythos 5, which had never been generally available,
began returning to approved US organizations five days earlier. The
“everyone, everywhere” part of the story is the Fable 5
part.

## The trigger was a research finding, not an attack

Anthropic’s account of what prompted the directive is specific.
The government became aware of a report in which Amazon researchers
had found a method of bypassing Fable 5’s safeguards: prompting
it so that it identified a number of software vulnerabilities, and in
one case producing code demonstrating how the relevant vulnerability
could be exploited.

What makes the episode strange is what Anthropic says its own testing
then found. Many less capable models — including Claude Opus
4.8, GPT-5.5 and Kimi K2.7 — could identify the same
vulnerabilities Fable 5 identified in the report. And every model it
tested could produce the same exploit demonstration, from Claude
Haiku 4.5 upward. The reported technique, Anthropic says,
“did not expose any unique Mythos-level cyber capabilities”
— it was routine defensive cybersecurity work that Fable
5’s deliberately broad safeguards blocked out of an abundance
of caution.

So the reported sequence is this: the government applied export
controls to the most capable generally available model in the world
— per Anthropic’s own launch claims — over a
technique that, on the vendor’s own account, less capable
models already had.

## The response: a classifier, “over 99% of cases”

Anthropic says it worked closely with the government and, during the
suspension, trained an improved safety classifier that targets and
blocks the behavior the Amazon report described. Users whose requests
are blocked are notified, and the request is sent to Claude Opus 4.8
instead. The specific technique from the report is now blocked,
Anthropic states, “in over 99% of cases”. That figure is
the company’s own measurement, not an independent one, and it is
stated here as exactly that. Researchers at the US Department of
Commerce’s Center for AI Standards and Innovation (CAISI) tested
both the prior and the new safeguards and, per Anthropic, agree they
are “extraordinarily strong”.

The fix has a price, and Anthropic names it: the new classifier flags
benign requests more often during routine coding and debugging. The
company says it will keep refining the classifier to distinguish
genuine misuse from legitimate requests and reduce false positives.
The post that announced the restoration is the same post that
announced the classifier — the model came back with the fix in
place.

## Fable 5 and Mythos 5 are the same model

The thing most accounts of this episode get wrong is the relationship
between the two models. Claude Fable 5 and Claude Mythos 5 are the
same underlying model. At launch, Anthropic shipped Fable 5 with the
strongest safeguards it has ever applied to a model —
classifiers that detect potential misuse, including jailbreak
attempts, and route flagged requests to the less capable Opus 4.8
— while Mythos 5, “with the safeguards lifted in some
areas”, went only to a small group of cyberdefenders and
infrastructure providers in Project Glasswing, in collaboration with
the US government, for defensive cybersecurity.

That distinction is the key to the June story. The model with unique
offensive capability — Anthropic describes Mythos 5 as able to
“find and exploit software vulnerabilities more effectively
than any other model” — was never generally available: it
did not disappear for “everyone”, because it was never
there. The model that disappeared for everyone was Fable 5, which
Anthropic says provides no unique offensive capabilities precisely
because of its safeguards. And the directive, which came after the
government learned of the Fable 5 bypass report, suspended both
models at once: the trade-control order took down the unsafeguarded
partner model alongside the safeguarded one it was triggered by.

The capability claim about Mythos 5 is the vendor’s own, quoted
because it explains what the episode was about — not as an
independently established measurement.

## The aftermath: a proposal, and four commitments

The redeployment post pairs the restoration with two forward-looking
moves.

The first is a proposal . Anthropic says it is partnering
with Amazon, Microsoft, Google and other Glasswing partners to draft
a consensus industry framework for assessing the severity of AI
jailbreaks — techniques that bypass a model’s safeguards
— so developers can triage new findings and governments can
know when to act. Its current proposal scores a jailbreak on four
criteria: capability gain (how far beyond existing
tools it takes the user), breadth (how many distinct
offensive tasks the same technique works for),
ease of weaponization (how much effort turns it into
an attack), and discoverability (how easy it is to
obtain). Anthropic is explicit that this is a work in progress, not a
standard. It also says it is launching a

HackerOne program

where security researchers can submit potential Fable 5 cyber
jailbreaks for review.

The second is a set of four commitments to the US government:
pre-release government access and evaluation for models that
materially advance the capability frontier in national
security-relevant areas; rapid information sharing on safeguards, including
through the interagency vulnerability clearinghouse the 2 June
executive order established; dedicated teams and compute for joint
research; and work toward a common voluntary security and evaluation
standard for frontier model providers.

Read together with the executive order, the shape is consistent: the
order sketched a voluntary framework — classified benchmarks, a
“covered frontier model” threshold, pre-release access
— and the aftermath moves Anthropic toward it on its own.
Whether that direction is right or safe is not something these
sources answer; the record only shows the commitment.

## The record is the story

The strangest thing about this episode is how thin the record is. The
12 June directive itself is not linked anywhere in Anthropic’s
posts; the account of what it was and why it came is the
company’s own. The lifting is documented by a link to a post
from the Commerce Secretary. The suspension exists as an update block
on the launch post. And the executive order the episode is anchored
to — the one Anthropic says it spent the preceding ten weeks
working with the government as it was developed — never
mentions export controls, and contains an explicit line that nothing
in its deployment section authorizes mandatory licensing,
preclearance or permitting of AI models. Ten days after that order
was signed, export controls were applied to the two most capable
models in the country anyway. Nothing in the fetched sources resolves
that tension; it is simply where the public record ends.

If you follow “Fable 5” on a benchmark table this month,
this is the episode behind the name: an eighteen-day global blackout
of the model Anthropic called the most capable it had ever made
generally available — triggered by a research finding, ended by
a classifier, and followed by a proposal for how the industry should
talk about jailbreaks. The whole story, as currently documented,
rests essentially on the account of the company that makes the model
— which is itself the thing worth remembering when the next
Fable 5 headline shows up.

## Sources

All retrieved 2026-08-14. Anthropic,

“Redeploying Claude Fable 5”

(30 June 2026, updated 1 July) — the suspension and restoration
dates, the export-controls directive, the Amazon research finding,
the classifier response, the jailbreak-severity framework proposal
and the four government commitments. Anthropic,

“Introducing Claude Fable 5 and Mythos 5”

(9 June 2026) — the launch date, the shared-model relationship
between Fable 5 and Mythos 5, the safeguards, and the 12 June
suspension notice. Executive Order 14409,

“Promoting Advanced Artificial Intelligence Innovation and
Security”

(2 June 2026), whitehouse.gov — the covered-frontier-model
framework and its disclaimer of mandatory licensing. The “over
99% of cases” figure, the capability claims about Mythos 5 and
the CAISI agreement are Anthropic’s own reported statements,
attributed as such above.
