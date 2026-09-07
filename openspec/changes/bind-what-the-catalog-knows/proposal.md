# Bind what the catalog knows

## What was re-measured before designing anything

Both beads are claims about a tree as it stood on 2026-09-04. Everything below
was re-measured on 2026-09-06 against the worktree at `impl/spec-wiki`, and the
numbers that moved are named as moved.

**The census check, re-run over the live corpus.** Bound snapshot
`2026-09-05` (`data/derived/sources.json`, `openrouter-models.snapshot_date`),
scanning the 554 files under `content/wiki/`: **22 census claims examined
across 14 entry pages, 18 of them cleared by the hedge, none flagged.**
`data/snapshot-census-debt.json` carries `known: []` — the debt ratchet is at
zero, so every one of those 18 is a live hedge and not a forgiven instance.
Bead `addictedtoai-6nrk` recorded 15 hedged claims across 11 files on
2026-09-04, and `addictedtoai-pxx1` recorded 16 on 2026-08-31. The series is
16 → 15 → 18. The bead's own first trigger — *"the prebuild's hedged count
climbing well past fifteen, meaning the corpus is leaning on the hedge as a
default rather than choosing it"* — has fired.

**What tomorrow's fetch does, measured rather than predicted.** Four of the 22
examined claims are dated to `2026-09-05`, which is exactly the snapshot they
are checked against, so they pass today. Re-running the identical scan with the
snapshot advanced one day — which the 06:00 Pulse does every morning, whether
or not a catalog row changed — turns **two of them into `mismatched` build
errors**: `content/wiki/model/ibm-granite-granite-4-1-8b.md` ("431 rows") and
`content/wiki/org/aion-labs.md` ("four rows"). Both sentences are true as
written. The other two acquire the hedge and start ageing. Nothing in the Pulse
queue or in the Desk's job classes produces the work that would re-anchor any
of them.

**The drift is real, not a worry about drift.** Prose hedged to 31 August 2026
states that the catalog holds 396 rows, that 18 listings are free and that six
rows carry a non-null expiration date. The snapshot the same pages render from
(`data/sources/openrouter-models/latest.json`, `fetched_at`
`2026-09-05T06:00:04.599Z`) holds **431 rows, 19 free listings and 9 rows with
a non-null expiration date**. NVIDIA's row count is 10 and all 10 carry a
Hugging Face id, which is still what `content/wiki/org/nvidia.md` says. Three of
those four counts moved in five days.

**The second trigger has fired too.** `addictedtoai-6nrk` names it as *"a
reader-visible contradiction between a hedged count and a live transclusion on
the same page"*. `content/wiki/org/aion-labs.md` states "four rows in the
catalog snapshot of 5 September 2026" on the line below a live
`{{fact:org/aion-labs#second_product}}`; `content/wiki/org/z-ai.md` states "the
396 rows in the catalog, as observed on 31 August 2026, six carried a non-null
expiration date" in a body whose neighbouring paragraphs render
`{{fact:model/z-ai-glm-5#price_input}}` from the 431-row snapshot.

**A count written as a transclusion is invisible to the check by
construction.** `lib/snapshot-census.mjs` blanks every `{{…}}` marker before
matching, and `CENSUS_RE` needs a number before `rows`/`listings`, so a
transcluded count cannot match. Read in the file, not assumed.

**Part of the census is already computed, and the rest has no reader at all.**
`data/derived/catalog.json` carries `row_count: 431` and one row per catalog row
with `provider`, `expiration_date` and `status`. `hugging_face_id` and
`top_provider.is_moderated` live only in the raw snapshot,
`data/sources/openrouter-models/latest.json` — and **nothing under `lib/` reads
that file.** Grepped on 2026-09-06: thirteen occurrences of the string
`data/sources` across `lib/`, twelve of them in comments and the thirteenth
`lib/declined-fields.mjs`'s `REGISTRY_PATH`, which is the registry, not a
snapshot. `lib/build-content.mjs:215-223` says so in prose, deliberately: the
census gate binds to the data layer's snapshot date *rather than* re-reading
`data/sources/*/latest.json`. Measured today from the snapshot: 431 rows, 179
with a `hugging_face_id`, 125 moderated, 19 ending `:free`, 69 ending `:batch`,
9 with an expiration date, 58 providers, 8 of them with more than ten rows.

**The data layer cannot enumerate rows, and that is the seam this change has to
cut.** `makeDataLayer` (`lib/data-layer.mjs:70-78`) returns exactly three
members — `present`, `source(id)` and `row(id, rowId)`. There is no row
enumeration anywhere in it. Its only row store, `data/derived/feed-rows.json`,
is written from `feedBindings(corpus)` (`pulse/lib/derive.mjs:116-145`):
**declared row ids only, with `$vanished` rows retained.** Measured today: 437
keys, 6 of them `$vanished`, against 431 rows in the snapshot, of which 0 are
undeclared. So a count taken over `feed-rows.json` is "every row some entry
declares", which equals the snapshot only for as long as every row mints — and a
row held out by a `slug-collision` would be undercounted with no error anywhere.
A census counts the **snapshot**, so this change adds the accessor and the
derived file that make the snapshot's own rows readable from the build. That is
one derive write, not a `specs/pulse` delta: `data/derived/` is a pure function
of state, and adding a file the Pulse recomputes every run is a code change with
a test.

**The timeline half.** `addictedtoai-l8x` was triaged at
`lib/schema.mjs:201-207`; the block is now at **`lib/schema.mjs:206-212`** and
is otherwise unchanged — `.strict()` over exactly `{date, event, source_url}`
with `source_url` a required `httpUrl`. `pulse/lib/mint.mjs:248-250` states the
same constraint from the writing side: *"the entry schema's timeline shape is
strict, so a richer event … would fail the build."*

**How much of the corpus is in that position.** 285 timeline events across 99
entries. 58 cite `openrouter.ai`. Of those, 42 resolve to a row in the current
snapshot and **35 carry exactly that row's own `created`**, converted in UTC —
35 hand-transcriptions of a field the snapshot already carries, revalidated by
nothing. A further **16 cite `https://openrouter.ai/api/v1/models`**, the API
endpoint, which is evidence that the feed exists and states no date for any
particular row. That 16 is the complement of the 42 and not a direct count; a
direct count of events whose `source_url` is exactly that endpoint returns
**21** across 17 files, re-measured with the repository's own YAML parser on
2026-09-06. The two numbers count different sets and neither changes the design
— the endpoint dates nothing either way — but the direct count is the one a
later reader can reproduce. 437 entries declare `feeds['openrouter-models']` and 431 of
those resolve to a row with a numeric `created`, so the population that could
carry a bound listing date is 431 entries; exactly 4 record the listing as a
timeline event today, and all 4 agree with the feed.

**The date convention is already settled in code.**
`lib/day-gap-attribution.mjs:220-237` reads feed instants as UTC calendar dates
and records the measurement that settled it. That is the convention a bound
timeline date follows, and it is not the local-date rule being broken: the
local-date rule governs dates authored on this machine.

**What a bound date would break if it were not resolved early.**
`lib/render/entry.mjs:114` sorts events on `b.date.localeCompare(a.date)`;
`lib/dataset.mjs:87-101` exports `date` and `source_url` per event;
`lib/facts.mjs:297-304` takes the maximum of `timeline[].date` for the dormant
stamp; `lib/indexability.mjs:54` counts events. An event with no front-matter
`date` reaches all four, and the first would throw. Hence the resolve-before-
consume rule in the delta.

**Two smaller corrections to what was assumed.**
`MECHANICAL_FRONT_MATTER_KEYS` is `['timeline', 'domains_seeded']` today, not
`['timeline']` alone — `timeline` is still exempt from the reviewed surface, so
binding a date is not a review event and no post-hoc review directive is needed
for the timeline half. And `openspec/changes/` in this worktree holds only
`archive/`, so no other unarchived change here touches a wiki requirement.

## The findings

**A hedge is a way of being honest about a number, not a way of keeping one.**
The snapshot-census check and its hedge branch did what they were built to do:
an undated census is refused, a dated one is checked against the snapshot the
page's own transclusions render from, and a claim its author explicitly framed
as a past observation is allowed to age. What that leaves is a page whose prose
is dated and whose numbers are live — honest, and not the same as right. On the
measurements above it also leaves a check that clears 18 of the 22 claims it
examines, which is a check that discriminates almost nothing, and two claims one
Pulse run from failing a build for no content reason at all.

**The repair for a rotting number in this repository is always the same one.**
A price is not re-dated every morning; it is bound, and the binding renders
today's value with today's source. Volatile values are bound, never typed. A
row count is a volatile value of the corpus's own data layer, and it is the one
volatile value the corpus has no way to bind — not because binding is hard, but
because a count has no owning row the way a price has. That is the whole of the
design question, and the answer is that a count's owner is the entry it is
about: a provider's row count belongs on that provider's entry, and a
whole-snapshot count belongs on the entry of the thing being counted.

**The timeline defect is the same defect in a different field.** A timeline row
can express only a typed date plus a URL. So a listing date — a value the
snapshot carries as a field on the row the entry already declares a join to — is
transcribed by hand, and the citation that is supposed to evidence it is, for
16 events, the API endpoint. A reader cannot check a date against a URL that
states no date, and nothing revalidates the number against the field it came
from.

## The decision

Two bindings, both in the shape the specification already uses:

**A census fact.** `source: census`, naming a registered Pulse source and a
census id from a closed registry with exactly one definition in the source
tree, with an optional declared provider `scope`. Its value is a count computed
at build time from the same data layer every `{{fact:…}}` on the page renders
from, so it cannot rot, carries no date and needs no hedge. It declares no
value, no `source_url`, no `accessed` date and no volatility class, and a build
that finds one of those fails. Five predicate kinds, taken from the claims the
corpus actually makes rather than invented: every row; a declared path present;
a declared path exactly true; a row id ending in a declared literal; providers
with at least N rows. Adding a census over an existing kind is a code change
with a test; adding a kind is a specification change.

**A feed-bound timeline event.** An optional `source` key gives the timeline
two forms. Absent, it is the cited form that exists today, so all 285 existing
events stay valid unchanged and nothing is migrated. Present as `feed`, the
event declares the source and the path instead of a date, the join goes through
the entry's own `feeds` map, and the date is the UTC calendar date of the
instant at that path. Declaring both a binding and a date fails the build.

Both bindings render their source, and both keep the closed transclusion
syntax exactly as it is — no new marker, no new `kind`, no new content
directory.

## What this deliberately does not do

- **It does not retire the snapshot-census check, and it repairs no existing
  sentence.** The check is what catches a count someone types tomorrow, and it
  keeps that job for every count no census can carry. Migrating the 18 hedged
  claims is prose work against the built mechanism, and it belongs to whoever
  takes it with the census facts in hand.
- **It does not touch the recorded debt ratchet.**
  `data/snapshot-census-debt.json` is empty and stays empty; nothing here
  forgives an instance.
- **It does not weaken `CENSUS_RE` or widen the hedge marker.** The three
  findings filed against the check's blind spots — a date's own year matching
  as a row count, cross-sentence anaphora and number-less superlatives, and the
  unbound cross-row price ratio — are their own beads and are untouched here.
  A census fact removes work from the check by removing claims from prose, not
  by loosening what the check matches.
- **It does not change the Pulse's mechanical lifecycle appends.** A status
  flip's date is the date the diff was observed, and no row field carries it, so
  those events stay cited and go on citing the source's own URL. That those 16
  citations evidence the feed rather than the date is a real finding and it is
  not repaired here; it needs its own issue.
- **It does not add a retirement or arrival event kind.** That is
  `addictedtoai-4lrp`, deliberately independent, and the reason it is
  independent is recorded there.
- **It does not put census definitions in the source registry.** A census is a
  shape of claim the corpus makes, and the corpus's claim shapes are closed in
  the source tree — the `kind` list, the volatility classes, the alias classes,
  the domain vocabulary. Registry rows stay what `pulse` says they are:
  ordinary data about where values come from.
- **It does not add a `person` kind, a `source` kind, or any other entry kind.**
  A census is owned by the entry it is about, which is the point of the design
  and the reason no new kind is needed.

## The beads this serves

- `addictedtoai-6nrk` — derived catalog-census fact type: close the census
  class instead of dating it. This is shape (a) as the bead states it, with the
  predicates taken from the bead's own list of what the fifteen live claims
  needed.
- `addictedtoai-l8x` — timeline rows cannot bind a date to a feed; only a cited
  URL is expressible.

Named but not served, and named so the absence is not read as an oversight:
`addictedtoai-3liq`, `addictedtoai-gd28` and `addictedtoai-r4m` are recorded as
blocked on `addictedtoai-6nrk`. A census fact reduces the population the check
has to reason about; it does not fix a regex blind spot, and none of those three
is closed by anything here.
