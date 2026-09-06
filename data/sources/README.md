# data/sources/

The source registry and its snapshots (`specs/pulse`).

`registry.json` declares every external source the Pulse fetches: URL, the
fields it yields, which field is the **row id** (the join key entries declare
in their `feeds` map), `fetch_every_days`, `expected_change_days`, an
optional `mints` mapping, its robots/terms check result, the date that
check was made, and the optional `declined_fields` refusals — a path this
repo has looked at and deliberately does not carry, each with its
`decided_on` date and the measurement behind it. Adding or removing a source
is an ordinary data change, not an OpenSpec change.

Each source gets a directory `sources/<source-id>/` holding `latest.json`
(newest snapshot) and `previous.json` (the diff base). Only those two are
retained, which is why every material change in `changes.jsonl` embeds its
own source-row excerpt — the archived source reference outlives the vendor's
page.

## `radar` — the scout's inputs, which this engine never fetches

`registry.json` holds a second array, `radar`, and it is **not** a list of
sources. `sources` is what the Pulse fetches, snapshots, diffs and derives
from; every row of it can reach a rendered page. `radar` is DESK-ORDER-001 §5
(keeper ruling K30): open-weights hubs, covered organisations' release feeds,
preprint listings and source-release feeds that the **scout** reads to decide
where to look. They are *inputs to the sweep and are never displayed raw*
(`specs/loop`) — nothing from them renders, seeds a fact, mints a stub or
appears in the changed feed or the queue.

**Why a separate array and not a flag on a source.** A flag would have to be
honoured, separately and correctly, by every consumer that iterates
`registry.sources` — `pulse/run.mjs`'s ingest loop, `derive.mjs`, `mint.mjs`,
`diff.mjs`, `freshness.mjs`, and whatever is written next year. A consumer that
forgot it would not fail; it would quietly fetch and publish a radar feed.
There is also no existing field that already means "do not ingest this":
`material_fields: []` is the nearest, and it does not do it. Measured —
`derive.mjs` writes every `sources[]` row's `id`, `title` and `url` into
`data/derived/sources.json` **before** the `material_fields` check that skips
catalog rows, and `lib/data-layer.mjs` hands that file to `lib/site.mjs` as
`sourceUrl(id)`. So a radar row in `sources[]` would render even with no
material fields. A separate array needs nobody to remember anything:
`sortedSources()` and `findSource()` cannot see a radar row at all.

**Reading them.** `pulse/lib/registry.mjs` exports `radarFeeds(registry)` —
the rows in a stable order — and `radarReadableUrls(registry)`, the flat list
of URLs the scout is cleared to read. Those two are the only way into the
array.

**What a row records.** The bar the registry sets everywhere, plus the one §5
names explicitly: `robots` with a `checked_on` date and a result, `terms` with
a `read_on` date and a result, and a `verified_on` date. A row may carry a
`feeds` array where one row covers several URLs — each feed entry carries its
own `robots`, `terms`, `verified_on` and a boolean `registered`.

**A URL a site forbids is recorded, never registered.** `registered: false`
plus a `not_registered_because` sentence is the honest outcome when robots or
terms refuse the read, and `radarReadableUrls()` never returns it. Two of the
four launch rows exist partly in that shape, because the obvious URL was the
forbidden one: `export.arxiv.org/robots.txt` is `Disallow: /` for every
user-agent, and `github.com/robots.txt` disallows `/*.atom$` — so each row
registers the permitted alternative (arXiv's `rss.arxiv.org` feeds, GitHub's
`api.github.com` releases endpoint) and records the refusal beside it.

**A row's own `url` is usually repeated as one of its `feeds` entries** — three
of the four launch rows do exactly that — so refusing that feed is the shape a
real refusal will be written in when a publisher's terms turn. Both halves
honour it: `radarReadableUrls()` filters the row url through its own row's
refused feed urls, and `loadRegistry` refuses a row whose `url` is declared as
a `registered: false` feed outright, because a row that both refuses a URL and
offers it is a contradiction the file should name rather than resolve in
favour of reading. Refuse the row itself (`registered: false` on the row) or
register the feed; the registry will not accept both at once.

`loadRegistry` refuses a radar row that carries any field meaning "the data
layer carries this" (`material_fields`, `mints`, `seeds`, `rows_path`,
`row_id_field`, `status_rule`, `schedule_rule`, `fetch_every_days`, …), and
refuses an id that appears in both arrays. Adding a radar feed, like adding a
source, is an ordinary data change and not an OpenSpec change.
