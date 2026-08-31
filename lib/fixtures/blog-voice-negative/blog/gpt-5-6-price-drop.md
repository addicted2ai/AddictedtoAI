---
title: "gpt-5-6-price-drop"
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

On 30 July 2026, OpenAI cut the API price of GPT-5.6 Luna — the
fastest and most affordable model in its current lineup — by 80%,
and GPT-5.6 Terra by 20%. A week later, on 6 August, it said Luna would
become the default model for Free users of ChatGPT, with unlimited text
chats and a new Think button for harder questions. The company’s
claim is that its most affordable model now delivers performance
comparable to models that were frontier-class a year ago, at a fraction
of the cost.

Every number in this post is OpenAI’s own, taken from the three
announcements below. That matters more than it usually does, because
this story is half price list and half marketing, and the two halves
are not the same kind of fact. A price is something you can check by
buying the product. A benchmark is a claim about a competitor that the
company making it has every reason to maximise. This post keeps the
difference visible.

## What the prices were, and what they are now

When the GPT-5.6 family launched on 9 July, OpenAI priced the three
tiers per million tokens at:
Sol $5 input / $30 output ,
Terra $2.50 / $15 , and
Luna $1 / $6 . The launch page describes Sol as the
flagship, Terra as a lower-cost model with performance it says is
competitive with GPT-5.5, and Luna as the fastest and most affordable
of the three.

Three weeks later, on 30 July, OpenAI published the cuts. Starting that
day: Terra is $2 per million input tokens and $12 per million
output , and Luna is $0.20 input and $1.20 output .
Sol’s pricing is unchanged. Luna’s input price is now a fifth of what
it was on 9 July, and its output price the same; the cuts were 80% on
Luna and 20% on Terra, both stated in the announcement. The company
says the pricing changes were rolling out to AWS later the same day, and that
ChatGPT and Codex subscription prices and quota budgets are unchanged
— Terra and Luna usage now simply consumes fewer credits.

Update, 2026-08-25. “Sol’s pricing is
unchanged,” above, was true of the 30 July cuts this paragraph
describes. It is not true today — see the dated update under
“What did not change” below for what Sol costs now.

## What changed for a free user

On 6 August, OpenAI announced that GPT-5.6 Luna becomes the
default model for Free and Go users of ChatGPT , with
unlimited text chats and a
Think button that gives the model more time on harder
questions. The rollout is staggered, and the announcement says so
explicitly: Luna becomes the default “this week”, while
unlimited text chats and the Think button arrive “next
week”. Limits still apply to file uploads, images and other
tools.

One distinction the announcement makes that press summaries tend to
blur: this is the Chat default. In ChatGPT Work and Codex, the
pages state, Free and Go users access Terra, while paid tiers choose
between Terra and Luna. The consumer app is where Luna becomes the free
default.

The same announcement updated GPT-5.6 Sol in Chat for Plus and Pro
users — more focused answers, a fact-checking pass the company
describes as making factual errors about 62% less common with Luna and
68% less common with Sol than with GPT-5.5 Instant in an internal
evaluation of financial, medical and legal prompts. That figure is an
internal evaluation, reported by the company that ran it, and it is
labelled as such here. OpenAI also says this Chat-specific Sol is
distinct from the Sol powering Work and Codex, which it says is not
changing as part of this release.

## The claims, labelled as claims

The part of this story that is not a price list is the part a reader
should treat with the most care. All of the following are
OpenAI’s claims about its own products , from the pages
cited below, and none of them has been independently verified:

That Luna delivers “performance comparable to models that were
frontier-class a year ago at roughly 6 cents on the dollar per
task”, and at “nearly nine times the speed”.

That on professional work, as measured by Agents’ Last Exam,
Luna “outperforms Fable 5” at an estimated cost per task
nearly 99% lower — a vendor assertion about a competitor,
stated as one.

That Terra and Luna “outperform Fable 5 at around
one-sixteenth the cost” (the 9 July launch page’s
framing), and that Luna “nearly matches GPT-5.5’s peak
performance at less than half the estimated cost”.

That GPT-5.6 Sol set a new high of 53.6 on Agents’ Last Exam,
“eclipsing Claude Fable 5 (adaptive reasoning) by 13.1
points”.

Customer testimonials the price announcement carries: Notion saying
Terra delivered “comparable quality to GPT-5.5 at half the cost
per task and in 60% less time” in its evaluations; Replit’s
president calling Luna “the closest we’ve come to
intelligence too cheap to meter”; Blitzy reporting Luna handles
2.2× more context with 8.5× fewer output tokens at 87%
lower cost than GPT-5.4 mini; Dust reporting Luna 40% faster and 40%
cheaper than its previous default. Vendors choose which customers
speak, and customers who stayed on a model are not a random sample.

None of these are measurements made here, and none are facts you can
check by reading a price page. They are the company’s case for its
own products, presented as its case.

## What did not change

The parts of this story that are easy to over-read: Sol’s price
did not move. Subscription prices and quota budgets did not move.
OpenAI also introduced Fast mode for Sol in the API — up to
2.5× faster than Standard processing at twice the price, per the
announcement — which is a new option, not a cheaper one. And the
Chat-specific Sol update is not the Sol that powers Work and Codex,
which the company says is unchanged.

Update, 2026-08-25. Sol’s price is no longer
unchanged. OpenAI’s live API pricing page today lists
gpt-5.6-sol at $4.00 input / $20.00 output
per million tokens for short-context requests — a rate the page
labels “GPT-5.6 Sol’s promotional pricing”, stated as
“available at least through November 21, 2026” — and
$8.00 input / $30.00 output for long-context requests.
Neither figure is the flat $5 / $30 this post reports above, and
repeats below, as unchanged from the 9 July launch; that flat rate is
not on the page at all as fetched for this update. Terra ($2.00 input
/ $12.00 output, short context) and Luna ($0.20 / $1.20) still match
this post’s figures exactly, read off the same page at the same
time. Neither announcement this post cites describes a short/long-context
split for Sol, so when the split and the promotional rate began is not
established here — only that, as of this update, they have.
Source:

OpenAI, API pricing

(fetched 2026-08-25 with a plain HTTP client; the marketing pages this
post cites under openai.com/index/ returned a Cloudflare JavaScript
challenge to the same request and could not be re-fetched this round).

## What to do with this

If you’re a free ChatGPT user, the practical change is coming to
your default model, and it does not cost anything to wait a week for
the unlimited chats and the Think button to land. If you’re an
API customer, the decision is the ordinary one, now at more
aggressive prices: Luna at $0.20 / $1.20 per million tokens is the
high-volume tier for tasks where its price and speed are the point;
Terra at $2 / $12 is the everyday-work tier; Sol at $5 / $30 is unchanged
for the work that justifies it. And when a vendor tells you its model
outperforms a rival at 99% lower cost, treat the benchmark as a
hypothesis worth testing on your own workload — not as a number
that became true because it was printed.

Update, 2026-08-25. The “Sol at $5 / $30 is
unchanged” recommendation just above is the same stale claim
corrected earlier in this post (see the update under “What did
not change”). It is not currently actionable: OpenAI’s
live pricing page shows no flat $5 / $30 rate for Sol at all, only a
promotional $4.00 input / $20.00 output for
short-context requests (through at least 21 November 2026) or
$8.00 input / $30.00 output for long-context
requests, per million tokens.

## Sources

All retrieved 2026-08-11. OpenAI,

“Advancing the price-performance frontier with GPT-5.6”

(30 July 2026) — the 80% and 20% price cuts, the new Terra and
Luna prices, Fast mode, and the “6 cents on the dollar”,
“nearly nine times the speed” and “nearly 99%
lower” claims, all stated as OpenAI’s. OpenAI,

“Improving GPT-5.6 Sol in ChatGPT—and expanding access to
GPT-5.6 Luna for free users”

(6 August 2026) — the free-tier changes and their staggered
rollout, and the internal factuality evaluation. OpenAI,

“GPT-5.6: Frontier intelligence that scales with your
ambition”

(9 July 2026) — the original prices, the family definitions, and
the launch-page benchmark claims. Prices and launch claims are the
company’s own reported numbers on its own products; the benchmark
and cost-per-task figures are labelled in the post as claims, not
measurements.
