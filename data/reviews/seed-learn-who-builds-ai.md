---
job: seed-learn-who-builds-ai
verdict: approve
reasons: []
would-cite: >-
  A journalist or analyst asked why so few companies control AI and reaching
  for a market-share chart — this page replaces the chart with five jobs, the
  observation that the supply chain is a pyramid standing on its point, and
  the durable test for any narrow place in it: whether its barrier is a cheque
  or a decade.
reviewer: rec-o — background review job, fresh context, no edit rights on content
date: 2026-08-30
---

Orientation rung, depth 1, 1,286 body words. Unchanged since the rung review;
read fresh.

## The sendable sentence

> "Most supply chains are pyramids: crowds of suppliers at the bottom holding
> up a few famous names. This one is standing on its point."

Bolded by the page. Runner-up: "Whoever holds a chokepoint wants the layer
above it crowded" — which is the sentence that makes NVIDIA's open releases
legible as strategy rather than generosity, and is the least obvious thing on
the page.

## Checked

- Front matter: five keys exactly; `outcome` verbatim from §4;
  `prerequisites: [what-ai-actually-is]`; six `mentions`, all resolving, all
  linked in the body.
- Every must-cover role present and role-first throughout: frontier labs,
  platform companies, the chip layer split into design and fabrication,
  open-weight releasers, academia's changed role, startups on other people's
  models, and the one-sentence chokepoint cause ("It costs a bet. The machines
  run for months and the bill is settled before anyone knows what came out").
- Must-not held: no rankings, no "leading lab" claim (the page defines
  "frontier" as size, not standing), no funding figures in prose, no
  prediction about who wins — the closing move is the opposite, "Every name in
  every layer of this chain will change."

## The 2026 asides — the claims most likely to be fabricated, and they are not

The page's one current-events passage says the American government saw one
lab's newest models before the public did, and that another lab's top tier
left the market for weeks and returned to a limited set of organisations after
a government approval. It cites no URL; it links two org entries. I checked
both entries directly rather than accepting the rung review's finding:

- `org/openai` timeline, 2026-06-26: "GPT-5.6 previewed to roughly 20
  organisations at the US government's request under the June 2026
  frontier-model executive order", sourced. The entry body adds the mechanism —
  an executive order signed 2 June 2026 setting up a voluntary process for up
  to 30 days of pre-release access to "covered frontier models", with no
  licensing requirement, sourced to a WilmerHale client alert.
- `org/anthropic` timeline: 2026-06-12 "access to Claude Fable 5 and Claude
  Mythos 5 suspended"; 2026-07-01 "access restored; Mythos 5 returned to a set
  of US organisations following US government approval", both sourced. Mythos
  is the top of the entry's `model_tiers` field, so "top tier" is exact, and
  19 days renders honestly as "weeks".

Both claims are carried, sourced and dated by the substrate, and the page
states them without a single model name, price or version number reaching the
prose. This is the wiki-as-substrate architecture doing the thing it was
designed for, and it is worth recording as a pass rather than assuming it.

- `org/mistral-ai`: `flagship_license` is "Apache License 2.0" and headquarters
  Paris — so "publish their flagship models this way" is literally true of
  Mistral, which is the half I expected to be loose. `org/deepseek`: owner
  "High-Flyer, a Chinese hedge fund", headquarters Hangzhou. Both of the page's
  claims hold.
- `org/nvidia`: the entry carries "weights, major portions of the pre-training
  and fine-tuning corpora, and the end-to-end training recipe" — which is the
  page's "weights along with much of the material they were trained on and the
  recipe for making them", almost word for word.
- `org/openai` `corporate_form`: "Microsoft holds 27%", which supports "Look at
  who owns a share of OpenAI and a platform company is on the list" without
  the page naming either party.

## Finding: one structural claim the substrate does not carry

"Manufacturing is contracted to a firm in Taiwan, and a plant capable of the
most advanced work costs years and a national-scale investment to build."

`org/nvidia` contains no fact for this — grepped for Taiwan, TSMC, fabless,
foundry and manufacture; no match. Every other current claim on this page is
carried by a linked entry, so this one is the exception rather than the
pattern, and the rung review's verification table does not list it either.

I am not treating it as unsupported. NVIDIA's fabless model and leading-edge
fabrication concentrated in Taiwan are not seriously disputed, the page names
no company for the fabrication half, and the claim is structural rather than
volatile — it is the kind of fact the page's own "cheque or a decade" argument
is about, and it will not rot this year. But the page's architecture is
"link the entry rather than restate the fact", and here it restates a fact no
entry holds. The honest repair is a wiki fact on `org/nvidia`, which is wiki
work and not this page's.

## Taken on trust

That CUDA-shaped tool lock-in is real (the page says "the tools researchers
already know were written for one company's hardware" and names nobody); that
leading-edge fabs cost years and national-scale sums; and the org entries' own
`source_url`s, which I did not re-fetch. I verified the page against the
substrate, not the substrate against the internet.

Approve. The role map is the page's contribution and it survives every
renaming the industry can do to it, which is precisely what §4 asked for.
