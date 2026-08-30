---
title: Who builds AI
level: orientation
outcome: >-
  You can name the kinds of organisations that make modern AI, what each
  contributes, and why a handful of companies sit at every chokepoint.
prerequisites:
  - what-ai-actually-is
mentions:
  - org/nvidia
  - org/openai
  - org/anthropic
  - org/google-deepmind
  - org/deepseek
  - org/mistral-ai
---

A meeting app writes up your call. Ask who built the part that listens and the
answer is a company whose name is nowhere on your screen.

The company you bought from wrote the product: the interface, the calendar
hook, the place your notes land. Someone else did the
[training](/learn/what-ai-actually-is), and what came out of it is a model, one
large file of settings that a program runs. Someone else again owns the
building full of machines it runs in and pays the power bill. A fourth company
designed the chips in those machines. A fifth manufactured them, on another
continent, in one of the few plants that can. The one you would write to
about a bad transcript is the first, and it is the only one of the five a
competitor could replace next week without anything else in the chain noticing.

"Builds AI" is doing a great deal of work as a phrase. It names at least five
jobs, and hardly anyone does more than two of them.

## The price of a seat

The question worth asking about each job is not who is winning it. It is what
it costs to sit down at all, because that price decides how many organisations
are there to win anything.

Building a product on a model somebody else trained costs an account and a bill
that grows with use. Almost anyone can pay that, and by now almost everyone
has. Owning the datacentres, the buildings full of machines, is a different
order of commitment: land, power, and chip orders placed a year before the
chips arrive. Training a model at the frontier — one of the largest ones,
against which the others get measured — costs more than money. It costs a bet.
The machines run for months and the bill is settled before anyone knows what
came out. That is why so few organisations are in that layer, and what the bet
costs is a subject of its own.

Then the floor, which has a surprise in it. Chip design has concentrated into
very few hands, and the one whose name you know does not make chips.
[NVIDIA](/wiki/org/nvidia) is a design company. Manufacturing is contracted to
a firm in Taiwan, and a plant capable of the most advanced work costs years and
a national-scale investment to build. The narrowest part of the chain is two
organisations thick rather than one. Nor is the advantage all silicon. The
tools researchers already know were written for one company's hardware, and a
habit is harder to displace than a part.

**Most supply chains are pyramids: crowds of suppliers at the bottom holding up
a few famous names. This one is standing on its point.**

A place in the chain where everything above it has to pass through very few
hands is called a chokepoint. Counting the hands is most of the analysis.

## Who can afford to train

A training run is a single enormous act. Everything else in this chain is a
rate: chips per quarter, answers per second, a bill every month. A run happens
once, costs what it costs, and produces one file. [OpenAI](/wiki/org/openai)
and [Anthropic](/wiki/org/anthropic) are companies built around performing that
act and around the decisions that come with it, including what the finished
model will refuse to do.

Nobody performs it alone. A lab that does not own datacentres rents them, and a
landlord at that scale rarely settles for rent. Look at who owns a share of
[OpenAI](/wiki/org/openai) and a platform company is on the list.

Platform companies own the buildings and the customers, and several train their
own models as well, which makes them supplier and rival to the labs at once.
[Google DeepMind](/wiki/org/google-deepmind) is a research lab inside a company
that also sells the cloud capacity other labs rent and reaches an enormous
number of people directly. One organisation, several of the five jobs, which is
why a list of company names explains so little. The same name appears in rows
that have nothing to do with each other, and the rows are the part that lasts.

The ticket into the training layer is machines rather than a software pedigree,
so whoever has enough of them for some other reason is already a candidate.
[DeepSeek](/wiki/org/deepseek) came out of a hedge fund.

A layer this small has a property none of the others has. It can be convened.
In 2026 the American government saw [one lab's](/wiki/org/openai) newest models
before the public did, and [another lab's](/wiki/org/anthropic) top tier left
the market for weeks and returned to a limited set of organisations after a
government approval. Neither came from a rule that applies to everybody. Both
were arrangements with a particular company, which is possible because the list
of companies is short.

## The ones who publish

Not everyone who trains a model keeps it. Some organisations release the
trained settings themselves for anyone to download, run and alter. Those
settings are called weights, and a model released that way is called open.
[Mistral AI](/wiki/org/mistral-ai) in Paris and [DeepSeek](/wiki/org/deepseek)
in Hangzhou both publish their flagship models this way, which says that the
expensive layer is not confined to one country, and that the organisations
inside it do not all make the same choice about what to keep.

The organisation that goes furthest is not a model company at all.
[NVIDIA](/wiki/org/nvidia) publishes its models' weights along with much of the
material they were trained on and the recipe for making them, which is more of
the process than most companies whose only product is models. That is strategy
rather than generosity. A hardware business has no reason to keep models
scarce, because every model anyone runs is demand for the thing it actually
sells. Whoever holds a chokepoint wants the layer above it crowded.

Universities have a particular stake in that practice. Most of the ideas
underneath all of this came out of academic and government-funded labs
[over several decades](/learn/where-ai-came-from), and the expensive part has
since moved behind budgets no department holds. What is left to them is not
small: the people who go and do the work elsewhere, the measurement of what
these systems actually do, and the criticism that is awkward to publish from
inside a company. Downloadable weights matter here for a reason unrelated to
price. A model an outsider can hold is a model an outsider can take apart.

## Standing on somebody else's floor

By count, almost every organisation that says it builds AI is in the topmost
layer, building products on models other people trained. Being dismissive about
that is fashionable and it misses the work: what a radiologist or a shipping
clerk will not tolerate is not something the model knows. What is true is the
exposure. This layer's floor is somebody else's release schedule, and
the model underneath can improve until it absorbs the product built on top of
it, or be retired out from under it, with no amount of good work preventing
either.

So the question to ask about an organisation that says it builds AI is which of
the jobs it is doing, and what it would cost somebody else to do that job
instead.

Then a second question, because the narrow places are not narrow in the same
way. Some are made of money. A training run is expensive rather than
impossible, and what was hard last year gets cheaper to match as the hardware
improves. Others are made of factories, and no cheque builds a plant in a
hurry. Every name in every layer of this chain will change. What decides who is
admitted to a layer at all is whether its barrier is a cheque or a decade.
