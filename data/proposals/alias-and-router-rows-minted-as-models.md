---
date: 2026-09-05
slug: alias-and-router-rows-minted-as-models
type: verify
summary: >
  Measure how many `content/wiki/model/` entries are minted from feed rows that
  the source's own `description` says are not models — redirect pointers and
  routing products — and record the population, row by row, with the sentence
  from each row that says so. Nineteen are already visible without looking hard:
  thirteen `~`-prefixed "latest" rows whose descriptions read "This model always
  redirects to the latest model in the … family", and six `openrouter/*` rows
  that are routers. The job's output is a recorded count with its evidence, not
  a change to any entry: whether a pointer deserves a `model` record is a
  decision, and nobody can take it before somebody knows how many there are.
evidence: >
  All from `data/sources/openrouter-models/latest.json`, the Pulse's snapshot of
  https://openrouter.ai/api/v1/models, `fetched_at`
  2026-09-05T06:00:04.599Z, and from `data/derived/catalog.json` rebuilt against
  it (431 rows, all `"source": "openrouter-models"`). `~anthropic/claude-opus-latest`
  reads "This model always redirects to the latest model in the Claude Opus
  family"; `~openai/gpt-latest` reads "This model always redirects to the latest
  model in the OpenAI GPT family". Thirteen rows carry a `~` prefix and every one
  has a minted entry — `model/anthropic-claude-opus-latest`,
  `model/z-ai-glm-latest` and eleven more, all present as files in
  `content/wiki/model/`. Separately, all six rows under the `openrouter`
  provider are routing products by the feed's own `name` field — "Auto Router",
  "Auto Router (Beta)", "Free Models Router", "Pareto Code Router", "OpenRouter:
  Fusion", "Body Builder (beta)" — and each has a minted entry too. This
  repository has already reasoned from the same premise once, in
  `data/proposals/rejected/zai-glm-flash-latest-alias.md` (2026-09-02): "An
  alias row is a router convenience: it names a pointer that already resolves to
  a live model." That declination was about a blog note; nothing has ever
  measured the population inside the wiki.
---

# What this is, and what it is not

It is not a bug in the Pulse. `specs/pulse` says minting is deterministic and
row-driven, and a rule that mints from row ids **cannot ask what a row is** —
that is the property that makes it safe to run unattended, and it is doing
exactly what it was specified to do. So the finding is not "minting is wrong";
it is that a mechanical rule has a knowable blind spot and nobody has measured
how wide it is.

It is also not the same question as coverage. `addictedtoai-2ok0` asks which
catalog providers deserve an `org` entry; the ruling recorded in
`content/wiki/README.md` on 2026-09-05 answers part of it by holding that a kind
asserts something about its subject, so `org` may not be used for a thing no
source shows is an organisation. The `model` kind makes an assertion of exactly
the same shape. `model/anthropic-claude-opus-latest` says a model exists called
"Claude Opus Latest"; the feed says the row is a redirect to whatever is newest.
Those are different statements, and one of them is the site's.

# Why a `verify` job and not a `repair`

Because the fix is not obvious and picking one now would be the error this
proposal is about. There are at least three defensible endings — leave the
entries and have them render what they are, bind them as aliases of their
targets, or stop minting from rows whose description declares a redirect — and
they trade off against the alias registry, the catalog, and the rule that an
entry id is never reused or renamed. All three need the same input first: the
list, with each row's own words beside it, and the count. Nineteen is what a
single afternoon's grep surfaced across two obvious patterns; the job's actual
question is whether there is a third pattern nobody has looked for.

# What would make it not worth doing

If the sweep finds the population is exactly the nineteen already named here and
no third pattern exists, the job still ends usefully — it converts "nineteen
that we noticed" into "nineteen, measured" — but it should say so plainly rather
than inflating a clean result. And if a later change closes the kind question
some other way, this proposal is spent and should be dropped rather than run.
