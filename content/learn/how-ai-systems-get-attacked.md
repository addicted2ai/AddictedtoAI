---
title: How AI systems get attacked
level: mechanics
outcome: >-
  You can explain a prompt injection to someone who has never seen one, say why
  it resists the fix that worked for SQL injection, and name the places a
  defence can actually live.
prerequisites:
  - why-context-is-not-memory
  - what-an-agent-is
mentions:
  - concept/model-context-protocol
---

On 12 September 2022 Simon Willison wrote up a trick Riley Goodside had just
demonstrated in public: text appended to the input of a translation service,
telling the model to ignore its instructions and say something else instead,
and the service saying it. [Willison's
post](https://simonwillison.net/2022/Sep/12/prompt-injection/) gave the thing a
name and reached immediately for the closest thing in security. "The obvious
parallel here is SQL injection," he wrote, and proposed the matching fix along
with it: an API taking the instruction and the data as two separate parameters,
so that data could never be read as instruction.

Seven months later he added an update to the top of that same post. Dated 13
April 2023, it says the parameterised-prompts idea "is extremely difficult, if
not impossible, to implement on the current architecture of large language
models."

The person who named the attack proposed its obvious fix and then, on the same
page, recorded that the fix probably cannot be built. Nothing has replaced it.

## Everyone who can write into the input is an operator

The mechanism is already familiar from [what a context window
is](/learn/why-context-is-not-memory), where it explains conversations. A
model's input is one flat sequence of tokens. The system prompt, your message, a
retrieved document and a tool result all arrive through the same channel with
nothing marking one apart from another once the arithmetic begins, because there
is only one field.

Read that as a security property and it says something sharper. The set of
people who can give this system instructions is the set of authors of
everything it reads. Not the set of people with accounts. Not the set of people
typing into it.

That is prompt injection: an attack in which text the application handled as
data is read by the model as instruction, because the application concatenated
trusted and untrusted text into one input and there was no second place to put
the untrusted half. The researchers who first mapped the remote version of the
attack [put it in one
line](https://arxiv.org/abs/2302.12173v2): "LLM-Integrated Applications blur the
line between data and instructions." Willison's own compressed version, written
[years later](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/), is
mechanical rather than legal: "Everything eventually gets glued together into a
sequence of tokens and fed to the model."

It is worth being exact about what a system prompt is not, because the word
"privilege" gets used here and it is borrowed from a place where it means
something enforceable. In an operating system, privilege is a boundary with a
component sitting on it that refuses. A system prompt has no such component
behind it. Its authority comes from sitting early in the sequence and from the
model having been trained on text where early instructions get followed, and
both of those are statistical tendencies rather than gates.

## What a parameterised query actually does

The analogy holds precisely until it does not, and where it stops holding is
the argument.

A SQL injection happens when an application builds a database query by pasting
user-supplied text into a string of SQL and hands the result to the database.
The database parses what it is given, so text the application meant as a value
becomes grammar: a name field ends the string it was sitting in and starts a
new command. The fix, a parameterised query, sends the query and the values
along separate paths. The database parses the query text first and produces a
plan with holes in it, and only then are the values bound into the holes. A
value cannot become grammar because parsing finished before the value arrived.

Now look for the corresponding structure in a language model and there is
nothing to find. There is no grammar, no parser, and no stage that completes
before the untrusted text shows up. There is one operation, applied uniformly
across the whole sequence, which scores every token in the vocabulary for
plausibility as the next one. Attention is the only thing that moves
information between positions and it compares queries against keys without any
notion of where a span came from, because provenance was never encoded in the
first place. A delimiter is text, sitting in the channel it is supposed to
fence. In Goodside's original thread the first defence tried was an instruction
warning the model that the text below might contain directions designed to
trick it, and a JSON-quoting format was proposed after that. Both were shown
failing in the same thread that proposed them.

Which is where the analogy stops being useful and starts being instructive.
SQL injection was a mistake in how applications assembled queries, and it could
be engineered away because the separation it needed already existed one layer
down. **The reason a language model can follow instructions about a document is
the same reason it follows instructions inside one.** Take away its willingness
to treat arbitrary text in its input as something to act on and you have taken
away the reason anyone wanted it. The capability and the vulnerability are one
mechanism seen from two sides, which makes this a design property rather than a
defect awaiting a patch.

## The attacker does not have to be talking to you

Direct injection is the easy case: the person typing the input is the attacker,
and the target is whatever the application was told to do with that input. It
is bounded by the fact that the attacker has to be a user.

Indirect injection removes that bound. The attacker never touches the system.
They put the text where the system will read it, which the paper that named the
technique described as "strategically injecting prompts into data likely to be
retrieved": a web page an assistant will summarise, a document dropped in a
shared folder, an email sitting in an inbox the agent has been given, an issue
filed on a public tracker. From the model's side nothing distinguishes those
tokens from the operator's. From the attacker's side, no account and no
credential were needed, only the ability to publish something the target's
system will eventually read. That February 2023 paper worked the consequences
out into a taxonomy covering "data theft, worming, information ecosystem
contamination", and concluded in its own abstract that "effective mitigations
of these emerging threats are currently lacking."

One detail changes how the attack surface should be pictured. The text does not
have to be legible to a person looking at the same page. As
[OWASP](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) puts it, in the
entry that lists prompt injection as the first item in its top ten risks for
LLM applications, these inputs "do not need to be human-visible/readable, as
long as the content is parsed by the model". A human reviewing the source
before feeding it in is not a reliable filter, because the human and the model
are not reading the same thing.

## The harness supplies the power

An injected sentence has no powers of its own. [An agent
loop](/learn/what-an-agent-is) is precise about where the powers live: the model
emits a string that looks like a tool call, and a program outside the model, the
harness, decides whether to run it, using that program's permissions. Injected
text inherits exactly that set and nothing more. Which means the interesting
question about any deployment is never how persuadable the model is. It is what
the harness was allowed to do on the model's say-so.

In June 2025 Willison named the combination that turns a persuadable model into
a data breach, calling it the lethal trifecta: "Access to your private data",
"Exposure to untrusted content", and "The ability to externally communicate" in
a way that could be used to steal that data. He calls the last one exfiltration
— the movement of data out of a system to somewhere the attacker can read it —
while noting he is not confident the term is widely understood. Any one of the
three is ordinary. Any two are survivable. All three in one agent is a channel
running from the attacker's text, through the private data, to the attacker, and
every step of it is the system working as designed.

The reason this assembles by accident rather than by negligence is that
harnesses now compose tools from independent sources. The [Model Context
Protocol](/wiki/concept/model-context-protocol) standardises how a harness
discovers what a tool offers, which removes a large amount of per-integration
work and also means no tool author can see what the other tools in the session
can do. The trifecta is a property of the combination, and nobody owns the
combination except the person who assembled it.

One line in the public record of these findings is easy to read past. Willison
collected a long run of them against production systems and observed that they
"were promptly fixed by the vendors, usually by locking down the exfiltration
vector such that malicious instructions no longer had a way to extract any data
that they had stolen." Closing the third leg is the correct engineering response
and it is not the same event as fixing prompt injection. A great many reports
read as though it were.

The agent loop compounds all of this. Every step appends the model's output, the
call, and whatever the tool returned, so an injected instruction that arrived at
step three is still sitting in the sequence at step thirty, competing with an
original task that is by then a small and distant fraction of the input.

## A jailbreak is aimed at something else

These two words are used interchangeably and they name attacks on different
layers. A jailbreak targets the model's trained behaviour, trying to get a
model to produce something its training made unlikely. An injection targets the
application's assembly of text, trying to get a system to act on instructions
its operator did not write. Willison has argued at length that [the two are not
the same
thing](https://simonwillison.net/2024/Mar/5/prompt-injection-jailbreaking/),
defining jailbreaking as the class of attacks "that attempt to subvert safety
filters built into the LLMs themselves", and saying of injection that "the
attack is not against the models themselves".

The distinction earns its keep at the point of buying a defence. A detector
trained on known jailbreaks has learned what attempts to extract prohibited
content look like. An instruction telling an agent to forward a file somewhere
does not look like that at all, and is specific to the application it targets.
In his words, it is "not something that can be protected by systems trained on
known jailbreaking attacks."

The vocabulary is genuinely contested rather than merely misused. The OWASP
entry takes the other position outright, calling jailbreaking "a form of prompt
injection where the attacker provides inputs that cause the model to disregard
its safety protocols entirely." You will meet both usages. What to carry away is
not which word won but the habit of asking which layer a claim is about, because
a claim about the weights and a claim about an application's plumbing are
settled by completely different evidence. What safety training does and does not
change in the weights is [its own
subject](/learn/what-safety-training-changes).

## Some attacks arrive before the model does

Poisoning targets the pile of examples instead of the input. Large models are,
as one attack paper puts it, "often trained on distributed, web-scale datasets
crawled from the internet", and those datasets are frequently distributed as
lists of addresses rather than as content, which is the opening. In February
2023 a group [demonstrated two
attacks](https://arxiv.org/abs/2302.10149v2) exploiting exactly that: split-view
poisoning, which "exploits the mutable nature of internet content to ensure a
dataset annotator's initial view of the dataset differs from the view downloaded
by subsequent clients", and frontrunning poisoning, which targets datasets built
from periodic snapshots of crowd-sourced content, where an attacker needs only a
timed window. They reported both as immediately practical against ten popular
datasets and notified the maintainers. The intuitive defence is size, on the
theory that a handful of bad documents drowns in a large enough corpus;
[a study published in October
2025](https://arxiv.org/abs/2510.07192) reports that the intuition is wrong.
Poisoning attacks, it found, "require a near-constant number of documents
regardless of dataset size", with 250 documents compromising models across the
whole range tested "despite the largest models training on more than 20 times
more clean data". A corpus assembled by [crawling the open
web](/learn/what-models-are-trained-on) is a corpus anybody can write into, and
the attacker's budget does not scale with the defender's.

## Where a defence can live

Four places, and they are worth taking in order of how far they sit from the
weights, because the distance turns out to correlate with how much each one can
promise.

The nearest is inside the weights themselves. The observation behind the
instruction hierarchy is that models "often consider system prompts (e.g., text
from an application developer) to be the same priority as text from untrusted
users and third parties", so [the April 2024
proposal](https://arxiv.org/abs/2404.13208v1) trains a priority ordering into
them, teaching a model to "selectively ignore lower-privileged instructions",
and reports that this "drastically increases robustness". Real, and worth
having. What gets installed is a learned tendency measured against a
distribution of attacks, which shifts the odds rather than adding the missing
second channel. It is a strong default rather than a boundary, and the
difference shows up precisely when someone is trying.

One layer out sit the classifiers that inspect input or output for attacks.
This is the oldest idea here, old enough that the 2022 post already covers a
proposal to detect injections with a second model prompt, alongside a
demonstration that the detector's input is also just text and can be addressed
directly by the content it was asked to judge. Modern detectors are
considerably better and the structural problem is unchanged. [Willison's
warning about the products built on
them](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) is blunt.
They advertise capture rates in the mid-nineties, he notes, "but in web
application security 95% is very much a failing grade." The measured picture is worse than the marketing and also
worse than a fair reading of the research. In February 2025 a team [evaluated
eight published defences](https://arxiv.org/abs/2503.00061v2) against attacks
adapted to each one and bypassed all eight, "consistently achieving an attack
success rate of over 50%". In October 2025 a larger effort, [The Attacker Moves
Second](https://arxiv.org/abs/2510.09023v1), bypassed twelve recent defences with
success "above 90% for most", and recorded the finding that should govern how
anyone reads a defence's published numbers: "the majority of defenses originally
reported near-zero attack success rates." A score is a measurement against the
attacks that existed when it was taken.

Further out again, and structurally different, is the family that gives up on
stopping the model from being persuaded and arranges the system so that a
persuaded model cannot reach anything that matters. [A June 2025
paper](https://arxiv.org/abs/2506.08837) states the principle as a design rule:
"once an LLM agent has ingested untrusted input, it must be constrained so that
it is impossible for that input to trigger any consequential actions." [CaMeL,
from March 2025](https://arxiv.org/abs/2503.18813), is a worked instance. It
extracts the control and data flow from the trusted query before any untrusted
data is fetched, so that "the untrusted data retrieved by the LLM can never
impact the program flow", and attaches capabilities to values so that a tool
call carrying private data somewhere unauthorised is refused by the layer around
the model rather than declined by the model. This is the only family entitled to
use the word "impossible" about anything, and its own abstract prices the
guarantee: 77% of a benchmark's tasks solved with provable security, against 84%
for the same system undefended. The tasks the restricted structure cannot
express are what the security costs.

Furthest out is a person. A human approving each consequential step is the
fallback under all of the above, and its value is bounded by two things that are
usually left unstated. The approver can only check what the approval screen
shows, so a prompt naming a tool without displaying the data that tool is about
to send is a signature on a blank page. And attention is finite, so a gate that
fires on every step trains the person to clear it without reading, which
converts the last line of defence into a click.

Three of those four are probabilistic and carry a false-negative rate. The
fourth buys its guarantee by refusing to express the tasks it cannot make safe,
which is a real defence and a real cost rather than a free one. None of them is
the second channel, because there is no second channel to install. OWASP, which
is a standards body rather than a vendor and has nothing to sell here, writes it
plainly: prompt injection vulnerabilities "are possible due to the nature of
generative AI", and "it is unclear if there are fool-proof methods of prevention".

## What is left to ask

Whether a model can be fooled is the question with no answer coming. Assume it
can, the way you assume a lock can be picked, and nothing is lost, because a
system that was only safe while the model held has no safety margin anyway.

Three questions about a deployment do have answers, and none of them is about
the model. Whose text reaches it, counting everything it reads and not just
everything typed at it. What the harness is permitted to do once it acts on that
text. And where data can travel after it has been read. Those are facts about a
system's construction, which means somebody can look them up, change them, and
write them down. A model's resistance to attack is a moving measurement someone
will invalidate next quarter. A blast radius is a decision, and it stays
decided.
