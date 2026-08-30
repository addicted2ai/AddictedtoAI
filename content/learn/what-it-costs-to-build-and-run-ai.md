---
title: What it costs to build and run AI
level: advanced
outcome: >-
  You can separate the one-time cost of training from the forever cost of
  serving, say where the electricity actually goes, and read an AI business
  story with the unit economics in view.
prerequisites:
  - the-hardware-that-runs-ai
  - why-bigger-got-better
  - how-inference-is-served
  - who-builds-ai
mentions:
  - concept/scaling-laws
  - concept/distillation
  - technique/quantization
---

Thousands of accelerators training one model do not draw power steadily. They
step through the run in lockstep, so they fall idle in lockstep too, and the
building notices. The team behind a large 2024 model wrote down what that does:
"During training, tens of thousands of GPUs may increase or decrease power
consumption at the same time, for example, due to all GPUs waiting for
checkpointing or collective communications to finish", producing fluctuations
[on the order of "tens of megawatts, stretching the limits of the power
grid"](https://arxiv.org/abs/2407.21783).

Every watt of that was committed before anyone knew what the run would produce.
That is the first of the two bills this subject runs, and the second one behaves
nothing like it.

## The meter runs on hours

A training run costs machines, multiplied by the time they are held, multiplied
by what it takes to power and cool them. The second term does most of the
damage, because nobody rents arithmetic. You rent the machine by the hour, and
what an hour is worth depends entirely on the job you gave it.

[Arithmetic intensity](/learn/the-hardware-that-runs-ai) is where the
difference lives. Training pulls a weight out of memory once and uses it against
every sequence in the batch, which is the regime where an accelerator runs
somewhere near its advertised rate. Generating a token uses each weight once.
The chip is identical and the hourly rate is identical; the useful arithmetic
bought in that hour differs by orders of magnitude.

So training and serving are not a large expense and a small one drawn against
the same account. They are two exchange rates against the same rented hardware,
and most of what looks strange in the economics of this field is the gap between
them.

The hourly meter has a second consequence. A cluster at that scale
[breaks constantly](/learn/the-hardware-that-runs-ai), and the bill is for
elapsed time rather than for useful work, so the share of a run that survives
failure and restart is not an engineering statistic. It is the exchange rate
between the cheque and the model.

## A budget you can calculate for a product you cannot

None of this would concentrate the training layer if the total were merely
large. What concentrates it is that the total is committed up front.

[Scaling laws](/learn/why-bigger-got-better) are what made that survivable. Fit
the curve on cheap runs, read off the loss to expect from a run millions of
times larger, and the frontier stops being a gamble and becomes a budget.

Notice what that does not cover. The quantity anyone can predict is loss. The
thing being bought is capability, and the same measurements that made the
prediction possible came with no account of why the capabilities arrive at all.
The budget is firm and the product is not. That is the precise sense in which a
frontier run is a bet rather than a purchase: the price is known in advance and
the thing bought is not.

What that price is made of is not what the coverage suggests. Cottier and
colleagues assembled cost estimates for the largest published runs and found
[the amortised cost "has grown precipitously at a rate of 2.4x per year since
2016"](https://arxiv.org/abs/2405.21015). Their breakdown puts the weight on
chips and people. "For key frontier models, such as GPT-4 and Gemini, the most
significant expenses are AI accelerator chips and staff costs, each costing tens
of millions of dollars", with server components at 15 to 22 percent of the
total, cluster interconnect at 9 to 13, and "energy consumption (2-6%)".

Electricity is the part of a training run the world writes about and a minor
line in what it costs. That is not an argument that the power does not matter.
It matters earlier: a grid connection, a permit and a substation decide whether
the run can happen at all, and then barely register on the invoice once it has.
Energy is a constraint on the training layer long before it is an expense.

## The ticket is set by whoever is bidding most

[Who builds AI](/learn/who-builds-ai) records that very few organisations sit in
the training layer and gives cost as the reason. The mechanism is more specific
than expense, and it explains something expense alone does not.

A frontier run is indivisible. You cannot buy a tenth of one and get a tenth of
a model, you cannot sell access halfway through, and no revenue arrives until
the run finishes and the result is good. Every other layer of this industry is a
rate that scales down to whatever you can afford: fewer chips, fewer requests, a
smaller bill. This layer has a minimum ticket, and below the ticket you get
nothing at all.

The size of that ticket is then set by no technical threshold. It is set by
whatever the best-funded competitor spent, because the frontier is a position
relative to other people rather than an absolute capability. That is why the
layer has not widened as hardware got cheaper. Cheaper compute lowers the price
of last year's frontier, and last year's frontier is not the frontier. It raises
what this year's costs, because every rival's budget now buys more and the bar
moves with the spending.

A chokepoint made of a factory takes years to reproduce. A chokepoint made of a
minimum bet reproduces itself continuously, at whatever level the bidding has
reached.

## The second answer costs what the first one did

The economics of software has rested for decades on the second copy costing
nothing. Write the program once and the ten-thousandth user costs the vendor
something too small to be worth pricing, which is why so much of the industry
learned to charge by the seat and stop thinking about it.

Inference does not have that property. [Serving a
request](/learn/how-inference-is-served) reads the weights out of memory for
every token of every answer, and the hardware that did it is occupied while it
happens. The second answer costs very nearly what the first one did. The cost of
a product built on a model is proportional to how much people use it,
permanently, and no amount of scale removes the term.

Set that against a flat monthly price and the strain is structural rather than a
pricing mistake. A subscription is a bet on the average customer. While marginal
cost was near zero the shape of the usage distribution did not matter, because a
heavy user of a text editor costs a vendor nothing extra. When marginal cost is
real and usage is skewed, the heaviest few per cent of customers can cost more
than they pay, and the margin depends on the people who subscribe and forget.

Everything awkward in these products comes from there. Message caps, rate
limits, slower answers at busy hours, a cheaper model as the default, extra
thinking sold as its own dial, an enterprise tier billed per unit beside a
consumer tier billed per month. A product that meters you is telling you what
its marginal cost is.

## Serving reaches back and changes the training

The two bills are not independent, and the clearest evidence is a training
decision taken for a serving reason.

[Compute-optimal training](/wiki/concept/scaling-laws) picks the best model a
given budget can train, balancing model size against how much data it sees. The
LLaMA authors declined to optimise that, and
[said why](https://arxiv.org/abs/2302.13971): "given a target level of
performance, the preferred model is not the fastest to train but the fastest at
inference, and although it may be cheaper to train a large model to reach a
certain level of performance, a smaller one trained longer will ultimately be
cheaper at inference."

They overspent on the run on purpose in order to underspend on every request
afterwards. Training a smaller model for longer is the worse deal on the one-off
bill and the better one on the forever bill, and past enough users the forever
bill is the larger number. The optimum moved because the question changed, and
the question changed because of what happens after the run.

## The number depends on where you draw the box

Energy is the one part of this where public figures are abundant and mutually
useless, and the reason is that they rarely state their boundary.

Start with a case where both halves were measured by the same people. The team
who trained BLOOM published its consumption as
["433,195 kWh of electricity during
training"](https://arxiv.org/abs/2211.02001). They then put the finished model
behind an API and measured that too, over "approximately 18 days", during which
it handled "230,768 requests in total" and consumed "914 kWh of electricity".

At that traffic, serving would take something over twenty years to spend what
training spent. Carrying that ratio anywhere else would be a mistake, and the
same paper says why: the requests were "handled in real time (i.e. without any
batching)", so the accelerators "remain idle in between user requests". The
measurement is largely of a machine existing rather than of a model computing,
and [batching is most of the economics](/learn/how-inference-is-served) of a
real deployment.

That training figure has a boundary of its own, and the authors draw it in the
open. It counts power drawn while the code runs, which is why the same run comes
to "approximately 24.7 tonnes" of carbon-dioxide equivalent "if we consider only
the dynamic power consumption, and 50.5 tonnes if we account for all processes
ranging from equipment manufacturing to energy-based operational consumption".
Idle capacity and the building of the hardware roughly double it. Nothing was
hidden and nothing was wrong. The most important quantity attached to any figure
in this area is which processes the person reporting it decided to count.

Google published a measurement of its own production serving in August 2025 and
was unusually explicit about the boundary, counting "active AI accelerator
power, host system energy, idle machine capacity, and data center energy
overhead" and reporting
that ["the median Gemini Apps text prompt consumes 0.24 Wh of
energy"](https://arxiv.org/abs/2508.15734) along with "the equivalent of five
drops of water (0.26 mL)". The same paper reports "a 33x reduction in energy
consumption" for that prompt across a single year.

Two careful measurements, an order of magnitude apart per request, and most of
the distance between them is utilisation and accounting rather than model
efficiency. The energy an answer costs is largely a fact about how busy the
machine was and where somebody drew the box. **Whether training or serving
dominates a model's lifetime cost is not a fact about the model but a fact about
how many people use it.**

Three more properties of these numbers are worth carrying, because each one
travels badly. The task matters enormously: one study measuring ten tasks the same
way found text classification at 0.002 kWh per thousand inferences and image
generation at 2.907, concluding that
[the models examined "can vary by a factor of over
1450"](https://arxiv.org/abs/2311.16863) in energy for the same number of
inferences. "AI's energy use" is not one quantity.

And these numbers reach the public with very unequal standing. Google's
per-prompt figure is a disclosure by the company being measured, with its method
attached, which is the strongest form available and still an interested party
describing itself. The most-quoted water figure is a different kind of object
entirely: researchers estimating that training GPT-3 ["can directly evaporate
700,000 liters of clean freshwater"](https://arxiv.org/abs/2304.03271) note in
the same sentence that "such information has been kept a secret". One number is
a measurement you can argue with. The other exists because there is nothing to
argue with.

The comparison that usually closes an article deserves the same care. Data
centre electricity is the standard yardstick, and the people who publish the
series say what is inside it. It covers ["total data-center electricity use
(including cooling and other support systems), across both general-purpose and
AI-specialized
servers"](https://ourworldindata.org/grapher/data-centers-share-electricity-demand),
and that it "does not allow a separate estimate for AI use". Every headline
share of a country's electricity attributed to AI is a data centre number
carrying streaming and cloud storage along with it, and the custodians of the
series say so on the page.

## What nobody outside can see

The subsidy question gets asked constantly and cannot currently be answered from
outside.

Selling below cost to take a market is an old strategy with a long record in
transport, retail and telecommunications, so the hypothesis is reasonable on its
face. The evidence is what is missing. A closed provider discloses neither its
serving cost per request nor revenue broken out by serving, and a company-level
loss aggregates research, training runs, salaries and serving into a single
figure that cannot be taken apart from the outside. "They lose money on every
query" and "inference carries a comfortable margin" are both consistent with
everything published.

One observable exists, and it is the reason downloadable weights matter to this
page rather than only to the openness argument. When several independent
providers serve the same released weights, they are competing on price for an
identical product, and the floor they converge on is bounded below by what it
costs them to run it. That figure is not the frontier price, which bundles
scarcity and the recovery of a training bet. It is the closest public thing to
the cost of moving those particular bytes through a machine.

## The trailing edge collapses on a schedule

The last thing to hold is that the two bills move in opposite directions at the
same time.

Frontier training costs rise, for the bidding reason above. The cost of any
fixed capability falls, and falls fast, because three forces push it down at
once. Hardware improves. Serving techniques attack the bottleneck directly,
[storing each weight in fewer bytes](/wiki/technique/quantization) so there is
less to move per token. And a capability, once it exists in a large model, can
be [distilled into a smaller one](/wiki/concept/distillation), which is far
cheaper than creating it was.

Epoch AI tracks the result as ["Lowest inference prices at fixed
performance"](https://epoch.ai/data-insights/llm-inference-price-trends) and
finds declines "ranging from 9x to 900x per year", depending on which capability
is being held fixed.

Read what that series measures, because it is the most reliably misquoted number
in the subject. It tracks the cheapest anyone will serve a given benchmark
level, across all providers, and the provider holding that floor rotates. It is
a fact about the market's floor. It is not any company's price list, it is not a
claim that a named vendor cut its own rates by that factor, and a comparison
assembled by reading two such rows against each other can invert the moment a
different provider occupies one of them.

The run that bent the grid was paid for once, by people who knew the price and
not the product. The answers are paid for forever, by whoever is using them, at
a rate that falls every year they keep asking. Nearly every confusing claim
about what this technology costs is a number from one of those two sentences
being used to settle an argument about the other.
