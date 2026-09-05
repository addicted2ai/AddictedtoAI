# Independent view — "The Frontier" on AddictedtoAI

Written BEFORE reading `frontier-plan.md`. Sealed. Not revised afterwards.
Author: independent reviewer, 2026-09-04.

---

## 1. What the surface would have to be, here, to work

The maintainer's brief has three parts: (i) what is currently best / newest /
most capable, (ii) benchmarks "both claimed and verified", (iii) "a nice
immutable timeline that will demonstrate how quickly things are moving."

This repository's constraints decide almost the entire shape:

- **`output: 'export'`.** Nothing is computed at request time. "Currently
  best" therefore means "best as of the build", and every build is a Pulse
  run. The surface is a *derived view* — the same species as the home changed
  feed and `/catalog` — not authored prose.
- **Volatile values are bound, never typed** (`lib/units.mjs`, `lib/facts.mjs`,
  `{{fact:…}}`). A ranking typed into a sentence is the exact defect
  `lib/snapshot-census.mjs` exists to catch. So the Frontier cannot contain a
  prose sentence naming a leader, a score, or a count. It can contain prose
  that explains *the method*, which is invariant.
- **Unsourced claims fail review** (`false-or-unsupported-claim`). "Best" is a
  judgment and the site is not a benchmark lab. The only defensible sentence
  the site can write is a *report of someone else's measurement*: "OpenRouter
  publishes Artificial Analysis's intelligence index at N for X, as of DATE."
  Not "X is the best model."
- **Ordering by an interested party's number is a known trap** — the directory
  sorts categories alphabetically at render time precisely so no one can move
  up the page by editing a list. Artificial Analysis indices are *more*
  influenceable than a category name: a vendor chooses whether to be measured
  at all, and benchmark-targeted training moves the number.

So the honest shape is:

> **The Frontier is a rendering of the data layer that shows several named,
> sourced rankings that disagree with each other, each stating its criterion
> through the existing `sortNote` mechanism, each stamped with the snapshot
> date it was computed from — plus an accumulated, tamper-evident record of
> when the top of each ranking changed hands.**

It never says "best". It says "top of <named index>, as published by <named
party>, on <date>". The disagreement between the indices is the content:
intelligence vs coding vs agentic vs price-per-Mtok rarely agree, and showing
four rankings that pick different winners is both more honest and more
interesting than one ordered list.

Two structural things I would insist on:

1. **Define the ruler before ranking with it.** `benchmark` is already in the
   closed `kind` list (`lib/schema.mjs`) with zero files under
   `content/wiki/benchmark/`. Every metric the Frontier ranks by should link
   to a `benchmark/*` entry saying who runs it, what it measures, what it does
   not, and how a vendor could game it. That is how this repo avoids
   editorialising: the judgment is externalised into a cited entry, not
   embedded in a sort call.
2. **Two provenance classes, and neither is "verified".** The site verifies
   nothing.
   - **Vendor-claimed** — a `source: cited` fact with `source_url` +
     `accessed`, `volatility: dated`. Frozen at the date the vendor said it.
   - **Third-party measured** — a `source: feed` fact from a named aggregator,
     re-fetched daily, rendered with an as-of date.
   The interesting cell is where the two disagree, and the surface's real
   value is showing that gap. Any third state that asserts nothing (a "figure
   exists somewhere" badge) is worse than an empty cell, because an empty cell
   reads as absent and a badge reads as evidence.

---

## 2. The three or four hardest problems IN THIS REPOSITORY

### A. "Immutable timeline" has destroyed inputs and no available mechanism

This is the hardest one and I think it is underrated.

`data/sources/openrouter-models/latest.json` is **overwritten every morning**;
only `latest.json` and `previous.json` exist on disk. The historical series
exists solely as git blobs (8 commits as of today). So:

- The timeline **cannot** be a `data/derived/` file, because `data/derived/`
  is defined as a pure function of present state and the past state is gone.
- It **must not** be recomputed from git history at build time. Vercel builds
  from a checkout whose depth is not this repo's to guarantee; a build step
  that shells out to `git show` for eight-and-growing blobs is both slow and
  a new failure mode on the host. (`CLAUDE.md`'s Windows note already records
  git plumbing being subtly broken here under MSYS.)

Therefore the timeline is **accumulated state at the data root**, like
`changes.jsonl` — and accumulated state is exactly the kind that recomputation
cannot police. "Immutable" then needs an actual mechanism, and a convention
("we only append") is not one. This repo's own open proposal
`settle-what-append-only-means-for-changes-jsonl.md` is direct evidence that
the convention has *already failed twice in twenty-four hours* on the one file
that has it: two approved jobs rewrote existing lines in place.

**My solution:** a hash chain plus a prebuild verifier.

- Each timeline line carries `prev` — the SHA-256 of the previous line's
  canonical JSON — and its own `hash`.
- A prebuild STEP recomputes the chain end to end and **fails the build** on
  the first mismatch, naming the line number. Editing line 40 turns the build
  red; the publish step runs after the rebuild, so a tampered timeline
  publishes nothing.
- The Pulse appends exactly one line per run per event, computed from
  `previous.json` vs `latest.json`, deterministically, with no model involved.
- No Desk job may write the file (add it to the reserved-path list, or at
  minimum make the verifier fail on any line whose `hash` does not match).

That is a mechanism rather than an instruction, which is the standard this
repo holds everywhere else.

### B. "Best" launders an opinion through a computation

Any single ranked list smuggles in the metric-chooser's view. The mitigations
I would require:

- **Never one list.** At least three rankings side by side, chosen so that
  they demonstrably disagree on today's data (intelligence / coding / agentic
  / price). If they ever agree, say so — that is a fact about the world.
- **The page spine is chronological or alphabetical; the metrics are
  columns.** `specs/directory` already requires that where a page presents
  more than one ordering, each states its criterion via `sortNote` and the
  complete alphabetical ordering stays reachable on the same page. The
  Frontier should honour that requirement voluntarily even though it is not
  formally a directory surface.
- **Ties and nulls are visible.** On today's snapshot only 164 of 181
  `artificial_analysis` blocks carry a non-null `intelligence_index`. A model
  absent from the index is not worse than one in it; it is unmeasured. A
  ranking that silently omits the unmeasured asserts something false about
  them.
- **State who chose the metrics, in the colophon voice.** "This page ranks by
  three indices published by Artificial Analysis via OpenRouter, because they
  are the only machine-readable capability numbers this site ingests. That is
  a limitation of the site, not a statement about which benchmarks matter."

### C. Rot when the Pulse stops, and rot in the present tense

A "currently best" surface is a claim about *now*, and it is the only surface
on the site whose entire content is a present-tense assertion. If the Pulse
stops for a week the page keeps asserting a leader that may have changed. This
is precisely the failure `snapshot-census.mjs` was built for, relocated into a
new surface where that check cannot see it.

**My solution:** the surface carries the snapshot's as-of date in its own DOM,
verified by a `verify-surfaces` DOM check; and past a staleness threshold
(reuse `data/derived/freshness.json`'s existing notion) the page's framing
degrades from present tense to the corpus's established past-observation
form — "as observed on DATE". That degradation must be *rendered from the
date arithmetic*, not a human remembering to change the wording.

### D. Upstream dependency that is undeclared, unverified, and can vanish

`benchmarks.artificial_analysis.*` is **not in the source registry's `yields`**
and not in `material_fields`. `data/sources/registry.json`'s `verification`
block was taken on 2026-08-28 and does not mention the field at all. Yet 29
model entries already bind three facts each off it. So the site already has an
undeclared upstream dependency, and the Frontier would make it load-bearing
for a whole surface.

Consequences if it disappears (OpenRouter drops the key, or AA's licence
changes):
- every bound fact renders absent — by design, correctly — and the Frontier
  silently becomes an empty table with no error anywhere.
- the timeline stops accruing and nothing says so.

**My solution:** declare it in `yields` and in `material_fields` with the
event semantics decided explicitly (I would set `event: false` at first — an
index moving by a point is not a change worth a feed line, and AA re-scores in
bulk); re-run the registry `verification` block and date it; and add a
**floor check** to the prebuild — if the count of rows carrying a non-null
`intelligence_index` falls below some fraction of the last recorded count, the
build fails naming the source. A dependency you cannot notice losing is not a
dependency you have.

There is also a redistribution question I cannot resolve from inside this repo:
the robots/terms check in the registry covers *fetching* OpenRouter's API. It
says nothing about republishing a third party's (Artificial Analysis's)
benchmark indices as the organising spine of a public ranking page. That
should be checked before, not after.

### E. (Fourth-and-a-half) It overlaps three surfaces that already exist

- `/catalog` is already the comparison surface with the objective columns.
- `/catalog/changed` is already a dated feed of observed changes.
- `/impossible-routine` is already, *by spec* (`specs/site`, "The dated-delta
  showpiece demonstrates the pace of the field"), the surface whose stated job
  is "to demonstrate the field's pace with receipts instead of asserting it."

The maintainer's third clause — a timeline demonstrating how quickly things
are moving — is a restatement of that requirement's own rationale. So a
Frontier proposal has to answer: is this a fourth surface, or is it
`/impossible-routine` with a machine-generated tier beside its curated one?
Either answer is defensible; not answering means two surfaces claiming the
same job and neither owning it.

And structurally: adding a standing surface means an **OpenSpec change** with
an `## ADDED` requirement under `specs/site`, archived by the orchestrator.
`openspec/specs/` is a reserved path. **This is not a thing one Desk job can
ship**, and any plan that budgets it as one job is wrong about the process,
not just the estimate.

---

## 3. What would make it unbuildable, or make it rot

1. **Any leader, score, or count typed into prose.** Either the census check
   catches it (red build every morning as the snapshot advances) or — worse —
   it is on a `.tsx` page where no check can see it, and the site quietly
   publishes a false superlative forever. Moving census-shaped claims off
   Markdown and into a React page is *evading* the guardrail, not satisfying
   it, and it should be named as such if anyone proposes it.
2. **Desk jobs appending to the timeline.** The moment a model writes a
   timeline line, "immutable" and "mechanical" are both fiction and the
   surface becomes editorial content with none of the review record that
   editorial content carries.
3. **Build-time dependence on git history.** Shallow clones, MSYS path
   mangling, and a build step whose cost grows without bound.
4. **A "verified" badge that verifies nothing.** The single most damaging
   possible outcome: a reader believing the site checked a number it merely
   relayed. If there are three states and one of them means "a figure exists",
   that state will be read as verification by every reader who is not reading
   carefully, which is all of them.
5. **A wide ranking table.** `verify-design` asserts no horizontal scroll at
   320px; a 6-column ranking table is the canonical way to fail that. And a
   client-side sortable table eats into a 150 KB gzipped first-load budget
   already at 123.2 KB on `/catalog`.
6. **Unbounded Desk load.** The "claimed" half of "claimed and verified" is
   authored, cited, reviewed prose — one job per model, through the review
   gate with a non-empty non-duplicate `would-cite`. The measured half is free
   (it is a feed). So the claimed column will be sparse for months and will
   look like vendors made no claims. Better to ship the measured half alone,
   labelled honestly, than a half-empty two-column table.

---

## 4. What I would build, concretely, if it were mine

- `data/frontier.jsonl` — accumulated, hash-chained, Pulse-written only.
  One line per lead change per index: `{date, index, snapshot_date, from,
  to, from_value, to_value, source, prev, hash}`. No prose. No `kind`
  vocabulary shared with `changes.jsonl` — **a different file**, because a
  derived lead change is not an observed source diff and putting it in
  `changes.jsonl` would mean the home feed, `/catalog/changed`, the seeded
  history and the loop's `interpret` job all inherit a line kind none of them
  were designed for.
- `scripts/prebuild.mjs` STEP: verify the chain; fail on mismatch.
- `scripts/prebuild.mjs` STEP: the benchmark-coverage floor check.
- `app/frontier/page.tsx` + `lib/render/frontier.mjs` — rendering only, every
  number from the data layer, as-of date in the DOM, `sortNote` on every
  ordering, alphabetical fallback reachable.
- `content/wiki/benchmark/artificial-analysis-intelligence-index.md` (and
  siblings) — the rulers, defined and cited, before anything is ranked by them.
- An OpenSpec change adding one `## ADDED` requirement to `specs/site` that
  says what the surface is *for* and how it differs from
  `/impossible-routine`, plus deltas to `specs/pulse` for the new writer.
- Registry: declare `benchmarks.artificial_analysis.*` in `yields` and
  `material_fields`, re-date `verification`.

Sequencing: rulers first, registry second, timeline writer + verifier third,
surface last. If the project stops after step three it has lost nothing —
the timeline is accruing and the site is unchanged.

---

## 5. The single thing I would most expect a plan to get wrong

That "immutable" is a property you can get by deciding to only append. It
isn't. In this repository it has already failed on `changes.jsonl`, in
writing, twice, this week — and that file is the closest existing analogue.
