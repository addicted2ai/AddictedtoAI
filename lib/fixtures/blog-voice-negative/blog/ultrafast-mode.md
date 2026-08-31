---
title: "ultrafast-mode"
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

On 13 August 2026, OpenAI previewed Ultrafast , a new
service tier in the OpenAI API that runs
GPT-5.6 Sol up to 14× faster than Standard
processing — the model the announcement calls
OpenAI’s “most intelligent model”. Powered by
Cerebras, it generates up to 750 output tokens per second .
Ultrafast is not a general release : the page says it is
“available in a limited preview today to a select group of
customers”, that OpenAI will “expand access as capacity
grows”, and that anyone interested can sign up to be notified when
access expands. Every figure in this post is OpenAI’s own, read
off that page, which was fetched for this post.

## The speed axis of the GPT-5.6 story

This site already covered the other half of the GPT-5.6 price-performance
story:

the 30 July price cuts that made Luna the free default

. That post is the price axis — what the family costs. Ultrafast is
the speed axis — how fast the flagship can be made to answer —
and the two announcements share a line of reasoning. The price
announcement argued that frontier performance has become affordable;
the Ultrafast announcement argues that frontier speed has stopped
requiring a tradeoff: “Until now, getting real-time speed
typically meant choosing a smaller or more specialized model.”
The page adds: “Ultrafast points to progress in a new direction:
more useful work per second.”

Both figures carry OpenAI’s own “up to”. “Up to
14× faster” and “up to 750 output tokens per
second” are performance ceilings the company asserts for a
preview running on its own stack with its own chosen customers; they
are not measurements made here, and there is no published benchmark
methodology on the page to reproduce them against.

## OpenAI’s flagship on a third party’s chips

The structural change is where the inference runs. Cerebras — the
wafer-scale chip company — is the inference provider for the tier:
“Ultrafast marks the next step in our partnership with
Cerebras to bring ultra-low-latency inference to OpenAI’s
platform,” the page says, and “now, with GPT-5.6 Sol on
Ultrafast mode, Cerebras is supporting OpenAI’s most intelligent
model, delivering up to 750 output tokens per second”. A
partnership history is implied by the phrase “next step”
— this is not the first step of the two companies’
collaboration, and the post should not be read as if it were —
but it is the first time OpenAI has said, in its own announcement,
that a third party’s hardware is serving its flagship model in
its API.

## The announcement states no price

One thing the page does not say: what Ultrafast costs. This is worth
stating rather than skipping past, because this is a paid API tier,
and a reader who has seen the price-drop post knows this family’s
price moves fast. There is no price, no
per-token rate, and no billing detail anywhere in the announcement
— only the limited-preview status and the signup link. That is
what OpenAI chose to publish, so this post publishes no price either.

## Who is in the preview

The page names four early customers, each with a quote. These are
OpenAI’s claims about its preview — the words of companies
it chose to feature, presented as it chose to present them, not
independent verification of the tier’s performance:

Jane Street — John Crepezzi, AI Assistants:
“The increase in speed brought by Cerebras is impressive. It
enables different ways of using the models, and makes it practical
for developers to work in a more focused and productive way alongside
them.”

Podium — Courtland Lykins, Product Lead
— Voice AI: “For us the Ultrafast has been invaluable in
our voice stack. The speed completely changes the call experience
for the more complex work.”

Basis — Mitch Troyanovsky, Co-Founder:
“Ultrafast allows us to create synchronous experiences for
users that were previously limited by intelligence. Oftentimes the
barrier to truly fast products is not just tokens per second, but
also model intelligence, and ultrafast combines both.”

Rogo — Alex Wang, Applied AI: “Speed
doesn’t just make the product feel better. It changes what
people can realistically use it for. Ultrafast makes complex
financial research feel like a real-time interaction.”

The announcement suggests the intended uses: incident response,
financial research and security, customer support and voice,
commerce, and live research and experimentation. Inside OpenAI, the
page says, its own developers have been testing the tier for incident
response and for research workflows that used to run as overnight
batches.

## What to make of this

For an API builder, the honest summary is a preview, not a product
decision: a select group of customers, capacity-gated expansion, no
price and no timeline. The reasons to watch it are the two claims that
outrank the numbers. First, the tradeoff OpenAI itself describes —
speed or intelligence, choose one — is the assumption this tier
is aimed at, and the announcement is the company’s own statement
that it no longer holds. Second, the tier runs the flagship on
Cerebras hardware: frontier inference, even for OpenAI, is no longer
tied to whose stack it was trained on. Both are the company’s
claims about its own product, and both will be checkable only when the
preview opens up.

## Sources

Retrieved 2026-08-14. OpenAI,

“Previewing Ultrafast mode: GPT-5.6 Sol at up to 14X the
speed”

(13 August 2026) — the announcement date, the “up to
14× faster than Standard processing” and “up to 750
output tokens per second” figures, the Cerebras attribution and
the “next step in our partnership with Cerebras” phrasing,
the limited-preview status and access signup, the use-case scenarios,
and the four named early customers and their quotes. The absence of a
price is the page’s own: the full announcement text was read this
round and contains no price, rate, or billing detail. The
GPT-5.6 price-drop post is this
site’s coverage of the price axis of the same family; its claims
about the world are sourced to the announcements it fetched on
2026-08-11, and are not relied on for any figure here.
