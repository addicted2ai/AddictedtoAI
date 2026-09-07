# Design

Six choices that are not obvious, each with the alternatives that were
rejected and why. Everything else follows the shapes the specification already
has.

## 1. A census has no owning row, so what owns it

A price belongs to a row: the entry declares `feeds: {openrouter-models:
"anthropic/claude-opus-5"}` and the fact names a path inside that row. A count
has no such anchor — "how many rows carry a Hugging Face id" is a property of
the snapshot, not of any row in it. Four candidates:

- **A new `kind`** (`source/openrouter-models` as an entry). Rejected: the
  `kind` list is closed and deliberately small, a source is not a thing in AI
  the way a model or a paper is, and it would give every census one owner
  regardless of what it is about — so `org/nvidia`'s row count would live on a
  page about OpenRouter.
- **A new marker** (`{{census:openrouter-models#free_rows}}`). Rejected: the
  transclusion syntax is closed on purpose, a second marker doubles the surface
  every prose check has to know about, and the linker, the unresolved-marker
  error and the wants registry would all need a second branch for no gain.
- **A file of derived values** that prose reads by some other route. Rejected:
  it re-invents transclusion beside transclusion, and the "correcting a fact
  corrects every surface" property would not extend to it.
- **The entry the count is about** — chosen. A provider's row count is a fact
  about that provider and lives on its `org` entry; a whole-snapshot count is a
  fact about the catalog and lives on the entry of the catalog's publisher or
  product. Nothing new is introduced: the ordinary `{{fact:…}}` syntax, the
  ordinary fact list, the ordinary rendering. `content/wiki/org/aion-labs.md`
  and `content/wiki/org/nvidia.md` are the two worked cases, and both are org
  entries with no row of their own — which is exactly why `scope` exists and
  why it is declared rather than inferred.

The cost of the choice, stated so nobody rediscovers it as a defect: two
entries may declare censuses over the same predicate with different scopes, and
nothing makes them one fact. That is the same property `feeds` already has and
it is the right one — a count is about a subject, and the subject is what the
entry is.

## 2. `scope` is a declared literal, never derived from the entry

An `org` entry has no `feeds` map to join through, so a provider-scoped census
needs the prefix from somewhere. Inferring it from `display_name`, the entry id
or an alias would work for `nvidia` and fail for `z-ai` (id `org/z-ai`, prefix
`z-ai`, display name `Z.ai`), for `mistral-ai` (prefix `mistralai`) and for
`bytedance-seed`. Measured in the snapshot today: 58 provider prefixes, several
of which match no entry id and no display name. Name matching is guessing, and
the specification already refuses it for row ids for exactly this reason. The
prefix is declared, and a prefix that matches no row is a repair finding rather
than a silent `0`.

## 3. Zero and absent must not be the same rendering

A census that matches nothing is `0`, and that is a claim worth rendering: no
row of this provider carries an expiration date is a fact. A census with no
data layer behind it is not `0`; it is unknown. Conflating them would let a
page assert "0 free listings" on a machine that has simply never run the Pulse
— the same defect the directory rule already names as "never guessed, never
filled by a model". The scope case sits between the two: a scope the snapshot
matches on no row renders absent and files a repair finding, because a mistyped
prefix and a vanished provider are indistinguishable from the count alone, and
of the two the mistyped prefix is far likelier.

## 4. Where the predicates are defined

Two homes were possible: `data/sources/registry.json`, where the sources and
their `mints` mappings already live, or the source tree beside the units table
and the domain vocabulary.

The source tree wins on the rule the corpus already follows. `pulse` says
adding a source is not a specification change, because a source is *where a
value comes from*. A census is not that — it is a **shape of claim the site
makes**, and every other shape of claim here is closed in code: the `kind`
list, the volatility classes, the alias classes, the domain vocabulary, the
declared units. A predicate in a data file is a small query language nobody
tests; a predicate in the source tree gets a test per predicate and a mutation
proof. The registry keeps naming where the rows come from, which is what it is
for.

The closure line is drawn between the two operations rather than around the
whole file: a **census** over an existing predicate kind is an ordinary code
change with a test, and a new predicate **kind** is a specification change. The
five kinds were taken from the claims the corpus already makes, not designed in
the abstract.

**Where the rows a census counts come from, because today there is nowhere.**
The requirement says a census counts *every row in the source's current
snapshot*, and the build cannot currently read that. `makeDataLayer`
(`lib/data-layer.mjs:70-78`) exposes `present`, `source(id)` and
`row(id, rowId)` and nothing else — no enumeration. Its only row store,
`data/derived/feed-rows.json`, is written from `feedBindings(corpus)`
(`pulse/lib/derive.mjs:116-145`) and therefore holds **declared row ids only,
`$vanished` rows included**: 437 keys against a 431-row snapshot on 2026-09-06,
6 of them vanished. Three routes were possible:

- **Count `feed-rows.json`.** Rejected, and it is the tempting one because it
  needs no new code at all. It answers a different question — "every row some
  entry declares" — which equals the snapshot only while every row mints. It is
  equal today (0 undeclared rows) and would stop being equal the first time a
  row is held out by a `slug-collision`, undercounting **silently**, with no
  error and no date to notice. It also carries `$vanished` rows, so a census of
  the current snapshot would count rows the catalog no longer has.
- **Read `data/sources/<id>/latest.json` from `lib/`.** Rejected: nothing under
  `lib/` reads a snapshot file today, deliberately (`lib/build-content.mjs:215-223`
  states the reason for the census gate), and a second reader of the raw
  snapshot beside the data layer is a second place for the build's idea of
  "current" to diverge from the Pulse's.
- **Give the data layer a `rows(sourceId)` accessor over a derived file the
  Pulse writes from the snapshot — chosen.** `pulse/lib/derive.mjs` already
  holds `loadSnapshot(root, id, 'latest')` at line 119; writing the source's
  full current rows to `data/derived/` beside `feed-rows.json` is one more write
  from state the Pulse has already loaded. `countCensus` reads through the
  accessor and never touches a file, so it stays unit-testable against a fake
  layer exactly as the fact renderer is. This is a **derive write, not a
  `specs/pulse` delta**: `data/derived/` is a pure function of state, recomputed
  every run and byte-identical when the world has not moved, so a new file in it
  is a code change with a test.

The accessor's contract is the requirement's own words: the source's **current**
snapshot, so never a `$vanished` row and never only the declared bindings.

## 5. A feed instant is read as a UTC calendar date

Every date in this repository is the local date of the machine that wrote it.
That rule exists because `reverify_days`, the overdue sweep and the freshness
layer subtract authored dates from each other, and two conventions make the
interval wrong by a day for no recoverable reason. A publisher's timestamp is
not an authored date: nobody on this machine wrote it, it is an instant rather
than a calendar day, and which calendar day it falls on depends entirely on the
zone it is read in.

The corpus already answered this once. `lib/day-gap-attribution.mjs` truncates
both catalog rows' `created` in UTC before differencing, and its header records
the measurement that settled the convention: `openai/gpt-4` to
`openai/gpt-4.1-nano` is 687 calendar days, not the 687.72 the raw timestamps
differ by. A bound timeline date follows that convention, so the two numbers
stay comparable. Reading a feed instant in local time instead would move a
listing date by a day for every row published after 18:00 local, which is the
same class of defect `addictedtoai-aw6` fixed on the rendering side — and it
would put the day-gap checker and the timeline a day apart on the same row.

## 6. Resolve the date before anything consumes the timeline

A feed-bound event has no `date` key in front matter, and four consumers read
`timeline[].date` today: the entry page sorts on
`b.date.localeCompare(a.date)` and would throw on `undefined`; the published
dataset exports `date` and `source_url` per row; the dormant stamp takes the
maximum of the dates; indexability counts events. Two ways to handle it:

- **Teach every consumer both forms.** Rejected: four call sites today, an
  unbounded number tomorrow, and each one is an independent chance to get the
  zone or the vanished-row case wrong.
- **Resolve once, early — chosen.** The timeline is resolved to one shape
  (`date`, `event`, and a reachable source) so no consumer learns that binding
  exists and the exported dataset's columns do not change. This is the same move
  `currentStatusOf` made for a different question and for the same reason: one
  resolution, or one defect per call site.

**Where "early" actually is, because the obvious answer is wrong.** Not
`loadCorpus`: resolution needs the data layer, and `loadCorpus`
(`lib/corpus.mjs:347`) takes `{contentRoot, diags, checkReferences}` and has no
layer to read — `lib/build-content.mjs` loads the corpus at line 100 and the
data layer at 106, and 22 other callers of `loadCorpus` (`verify-launch`,
`check-post-voice`, `arxiv-pin`, `anchors`, `declined-fields`, the fixture
tests) never build one. Putting resolution there would mean a required signature
change across all of them, or a corpus whose timeline shape depends on who
loaded it. The seam is **`build-content.mjs` phase 2**, between `loadDataLayer()`
and the `corpus.entry` loop at 130: `indexability` runs at 153 and
`renderTimeline`, `timelineRows` and `dormantAsOf` all read the same docs later,
so resolving in place there reaches every consumer — including
`site-assets.mjs:181`'s `timelineRows(site.corpus)`, which is handed the same
mutated corpus `buildContent` returns. `currentStatusOf` is computed at exactly
this point (line 152) for exactly this reason.

The feed form's reachable source is the **named source's registry `url`**, so
`lib/dataset.mjs:95`'s `source_url` column is filled for both forms and the
published dataset gains no column: a cited event keeps the URL its author read,
a bound event carries the endpoint the instant came from.

One consequence of that, recorded so it is not rediscovered as a defect: after
in-place resolution a feed-bound event's `source_url` is a registry URL, and
`lib/vendor-domain.mjs:288`'s `recordedDomains` reads `timeline[].source_url`.
It is harmless as the code stands — that function's name-token filter admits
`openrouter` only for an entry whose own name token is `openrouter` — but it is
a reader of the field this change starts writing, and the implementer should
confirm it stays harmless rather than assume it.

**The schema hazard, named because it will bite the implementer.** The fact
union is a `discriminatedUnion` on `source`, which works because every fact
declares one. Timeline events do not: absence means `cited`, and that is
deliberate — 285 events exist and none would be migrated. A
`discriminatedUnion` reads the discriminator before parsing, so the missing key
has to be supplied (a preprocess that defaults `source` to `cited`) or the
union has to be a plain one with a refinement. Either is fine; discovering it
after writing the strict variants is not.
