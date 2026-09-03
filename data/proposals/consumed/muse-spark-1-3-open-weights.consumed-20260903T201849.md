---
date: 2026-09-03
slug: muse-spark-1-3-open-weights
type: entry
summary: >
  An entry job updating the meta-superintelligence-labs wiki entry and writing
  prose on the Pulse-minted meta-muse-spark-1-3 and
  meta-muse-spark-1-3-contributor stubs: Meta's Muse Spark 1.3, released
  September 2, 2026 (OpenRouter and llm-releases both date it Sep 2; the
  feed rows landed 2026-09-03) — a multimodal reasoning model for
  long-running agentic, multi-agent and coding workflows over a 1M-token
  (1,048,576) context, $1.25/$4.25 per Mtok standard tier with $0.15 cached
  input and the established lower-cost contributor tier (training-permission
  trade), and the entry's thesis-changing detail: the first Muse Spark
  listed "open weights" under a "Meta license (weights pending)" — against
  the org entry's current "weights kept closed" and "hopes to open-source
  future versions" claims.
evidence: >
  OpenRouter listing, fetched 2026-09-03 — https://openrouter.ai/meta/muse-spark-1.3
  ("Muse Spark 1.3 is a multimodal reasoning model from Meta for
  long-running agentic, multi-agent, and coding workflows. It is designed to
  keep track of information across extended tasks, work through conflicting
  inputs, and request clarification or confirmation when needed, with an
  emphasis on concise execution"; "Released Sep 2, 2026"; "$1.25 / $4.25 per
  1M"; "Context 1M"; audio-understanding-not-fully-supported notice).
  llm-releases catalog page, fetched 2026-09-03 —
  https://llm-releases.com/models/muse-spark-1-3 ("Meta's successor to Muse
  Spark 1.2, released Sep 2, 2026"; "Accepts text and image input over a
  1M-token (1,048,576) context and returns text"; "Standard-tier API pricing
  is $1.25 / $4.25 per 1M input/output tokens ($0.15 cached input)";
  "a lower-cost muse-spark-1.3-contributor tier is offered in exchange for
  permission to train future Meta models on prompts and completions";
  "Open weights · Meta license (weights pending)"; "Weights Not released").
  The site's change feed carries the OpenRouter arrival rows for
  meta/muse-spark-1.3 and meta/muse-spark-1.3-contributor, dated 2026-09-03;
  the llm-releases feed pubDate for the item is Wed, 02 Sep 2026. The
  corpus's own meta-superintelligence-labs entry (written 2026-08-28) states
  Spark's weights as "closed" and quotes the April 2026 announcement that
  Meta "hope[s] to open-source future versions of the model".
expires: 2026-09-09
proposed_by_job: j-20260903-09
proposed_by_type: scout
---

# Muse Spark 1.3 — Meta's flagship listed open-weight for the first time (weights pending)

## Why now

Spark 1.3 is a point release, but it lands on the one axis the site's Meta
entry is built around. The org entry's thesis is that "the company that made
open weights a mainstream expectation stopped shipping them at the frontier"
— Spark closed since April 2026, only the distilled Glimmer 30B open under
Apache-2.0. The llm-releases listing for Spark 1.3 carries "Open weights ·
Meta license (weights pending)" — the first Spark-class flagship listed as
open-weight. If the weights land, the org entry's central claim needs
rewriting; if they don't, the pending state is itself a checkable fact with
a date. Either way the entry is stale by one release and one license signal.

## Would-send test

"Meta's Spark 1.3 is out — and for the first time the Spark line is listed
open-weights (weights pending under a Meta license), 1M context,
$1.25/$4.25, plus the usual contributor tier." For anyone who runs Meta
models or watches the open-weights licensing story, the open-weight flag is
the sendable sentence — it is precisely the development the corpus's own
Meta entry predicted ("hopes to open-source future versions of the model").

## What the job would produce (done-when)

- The meta-superintelligence-labs org entry gains a Spark 1.3 timeline row
  dated 2026-09-02 and its prose is updated: the flagship is now listed
  open-weight with weights pending under a Meta license, stated exactly as
  the source states it, with the "pending" status not overstated into
  "released".
- The meta-muse-spark-1-3 model entry gains prose carrying: the 1M
  (1,048,576) context, $1.25/$4.25 standard pricing with $0.15 cached input,
  the agentic-workflow positioning, the audio-input limitation notice from
  the OpenRouter listing, and the open-weight-pending license status with
  its source URL.
- The meta-muse-spark-1-3-contributor stub records the contributor-tier
  trade (training permission for lower price) consistent with the org
  entry's existing contributor_tier_terms fact, and notes where the price
  gap vs the standard tier stands.
- The entry does not claim weights have shipped; it records the pending
  state with its date and sources.

---

---

## Consumed: this candidate produced merged work

- date: 2026-09-03
- job: j-20260903-12 (entry)
- merged as: `ec04855ab22a733b9c272a4c6016aa7d600eedea`
- produced: `content/wiki/model/meta-muse-spark-1-3-contributor.md`, `content/wiki/model/meta-muse-spark-1-3.md`, `content/wiki/org/meta-superintelligence-labs.md`
- was: `muse-spark-1-3-open-weights.md` (slug `muse-spark-1-3-open-weights`)

A proposal that has been written, reviewed and merged is finished work. It was left selectable, and the run after the first post selected it again — which would have rewritten the same piece on every run until its `expires:` arrived. Retiring it is mechanical: no model was invoked and no inference was spent.

`data/proposals/consumed/` is a record, never a block. This slug does not feed the rejection index, so the subject may be proposed again — being written about once is not a reason it may never be written about again.
