# The Frontier — a design plan

Written 2026-09-04 against the tree at `cfa2bec`-and-later (the working tree
was live and read-only while this was written; every line number below was
read from the file on disk that day). Beads: `addictedtoai-s8gz` carries the
idea; `addictedtoai-6nrk` is the derived-census-fact proposal this plan is
asked to judge its dependence on.

Every claim about existing machinery cites a file and line. Every number about
the data was measured by reading the committed snapshots with three throwaway
scripts (`frontier-probe-*.mjs`, beside this file), never inferred. Where I am
guessing I say GUESS.

---

## 0. The measurements the design rests on

These were not known when the brief was written, and each one moves the design.

1. **The independent benchmark data is already in the feed.** The OpenRouter
   `models` payload carries an undocumented `benchmarks` object on 243 of the
   427 rows in `data/sources/openrouter-models/latest.json` (2026-09-04):
   `benchmarks.artificial_analysis.{intelligence_index, coding_index,
   agentic_index}` on 181 rows (164 with a numeric intelligence index), and
   `benchmarks.design_arena[]` (entries shaped `{arena, category, elo, rank,
   win_rate}`) on 243. Neither key appears in the registry's `yields` list
   (`data/sources/registry.json:12-38`) nor in `material_fields`
   (`registry.json:43-58`), so today they produce **no catalog column, no
   change line, no interpret job and no history**. Yet 29 hand-authored model
   entries already bind them as `source: feed` facts — e.g.
   `content/wiki/model/openai-gpt-5-6-sol.md:34-48` binds all three under the
   field names `intelligence_index`, `coding_index`, `agentic_index` — and
   `lib/units.mjs:49-52` already records the decision that a named index has
   no unit. The site knows about this data; it just has no surface for it.

2. **A leader change is real and recoverable.** Replaying the eight committed
   daily snapshots (2026-08-28 through 2026-09-04, one commit of `latest.json`
   per day) over the eligible rows (see §2 for eligibility): Claude Opus 5 led
   all three indices from 2026-08-28 to 2026-09-01 (63.1 / 78.0 / 59.2); the
   2026-09-02 snapshot shows Claude Fable 5.1 taking all three (65.7 / 81.6 /
   61.3). One lead change in eight days, dated to the snapshot that carried it.
   Only two snapshots are retained on disk (`pulse/lib/sources.mjs:12-18,
   296-297`), so this history exists **only in git** — and only back to
   2026-08-28, when the first snapshot was committed.

3. **The indices are revised, not only extended.** Between the 2026-09-03 and
   2026-09-04 snapshots exactly one row's indices changed, and it went down:
   `qwen/qwen3.8-max` 58.1 → 53.4 intelligence, 71.8 → 68.9 coding, 58.4 →
   49.9 agentic. So a leader can lose the lead without anything shipping. A
   timeline that says "X overtook Y" when Y was re-scored downward is lying;
   the event kind has to distinguish the two.

4. **The `benchmark` kind exists and is empty.** `lib/schema.mjs:36-47` lists
   `benchmark` in the closed `KINDS`; `content/wiki/benchmark/` contains zero
   files. Every vendor-claimed score in the corpus is a free-text `cited` fact
   with an ad-hoc field name — `terminalbench_score`, `cybergym_score`,
   `deepswe_score`, `frontiercode_score`, `capture_the_flag_score`,
   `harveys_legal_agent_benchmark` (grep over `content/wiki/`) — every one
   `volatility: dated`, with values like `"91.91% on TerminalBench 2.1 in
   ultra thinking mode, and 88.76% in max mode"`
   (`openai-gpt-5-6-sol.md:66-71`). Not one is machine-comparable across
   models, and nothing joins "TerminalBench" on one entry to "Terminal Bench
   (2.1)" on another.

5. **The catalog is not a list of models.** Of 427 rows, 85 carry a variant
   suffix (`:batch`, `:free`, ...; `anthropic/claude-fable-5.1:batch` carries
   the same indices as its base row), 13 are `~vendor/x-latest` alias rows
   carrying `alias_target`, and 6 are `openrouter/*` router pseudo-rows
   (`openrouter/auto` reports a 2,000,000 context window it does not have).
   Base rows after excluding those: 323. Any ranking that does not exclude them
   lists the same model twice and puts a router at the top of the context table.

6. **The census check cannot see a derived page.** `lib/snapshot-census.mjs:523`
   scans only `doc.type === 'entry'`; `CENSUS_RE` (`:189-192`) fires on a
   number within three words of `row(s)`/`listing(s)` in a section that
   mentions `snapshot`/`catalog` (`:205`). `/impossible-routine` is a
   `page.tsx` with no corpus doc at all (`app/sitemap.ts:130-133`). A surface
   rendered from derived JSON has no authored sentence for the regex to read.
   Measured 2026-09-03: the hedge branch now clears 16 of 16 claims
   (`bd show addictedtoai-6nrk`, note), so the check discriminates nothing on
   today's corpus — the class is contained by prose convention, not closed.

7. **Adding a job type is expensive; adding a queue reason is not.**
   `loop/lib/config.mjs:24-35` closes `JOB_TYPES`; `loadConfig` throws unless
   `data/config.json` carries a cap for every listed type (`:293-299`);
   `data/config.json:41-78` names types in three shedding arrays;
   `loop/lib/brief.mjs:183-195` throws without an acceptance list;
   `loop/lib/review.mjs:207-220` throws without a checklist; specs/loop:52
   requires an OpenSpec change. A new **reason** for an existing type is one
   entry in `RANKS` (`pulse/lib/queue.mjs:96-183`) plus a producer, provided the
   type is already in `QUEUE_PRODUCIBLE_TYPES` (`:87-94`) — `verify` and
   `entry` both are.

---

## 1. What it is

**The Frontier** is a fourth standing table in the sense of specs/directory
(`openspec/specs/directory/spec.md:36-51`): one page, `/frontier`, that is the
complete answer to one recurring question — *which listed models currently lead
each independently published capability index, which listings are newest, and
when did the lead last change* — generated from the data layer at build time,
with a JSON sibling `/frontier.json`, a stated sort criterion per table, and
zero authored prose beyond fixed template copy.

It has three parts, in increasing cost:

- **The live view** (`/frontier`): per declared metric, the current leader and
  the top N eligible rows, each linked to its wiki entry, each value carrying
  the publisher's name and the snapshot date it was read on; plus the newest
  eligible listings in a trailing window. Pure function of the latest snapshot
  and the registry. Changes every day the world does, at zero inference.
- **The timeline** (`/frontier#timeline`, and the same lines in the home
  changed feed): an append-only record of lead changes — *on this snapshot
  date, on this metric, the lead passed from A (value) to B (value)* — with the
  distinction between a new leader arriving and the old leader being re-scored.
  Seeded once from the eight days of committed snapshots, then written forward
  by the Pulse. Never rewritten.
- **The benchmarks** (per leader row, and on entry pages): vendor-claimed scores
  carried as structured cited facts with a declared provenance and a mechanical
  verification state, grouped under `benchmark/*` wiki entries, displayed in a
  separate column from the independent indices and never averaged with them.

**Proven capabilities** are not a new thing: they are the `Impossible → Routine`
deltas whose routine end is recent (`lib/deltas.mjs:78-87`) and the blog news
notes whose `mentions` include an entry currently at the frontier — two joins
over content that already exists, rendered as a strip on `/frontier`.

No new content kind. No new job type. One new derived file, one new line kind
in the append-only history, one optional structured block on the existing
`cited` fact shape.

---

## 2. The mechanical definition of "frontier"

"Best" and "most capable" never appear as words the site asserts. What the page
asserts is *leads metric M as published by P, in the snapshot of date D*, and
every part of that is computed.

### 2.1 Declared in the registry, never inferred

A new block on the `openrouter-models` source in `data/sources/registry.json`
(adding source semantics is an ordinary data change per specs/pulse:101-114,
though the surface itself needs the OpenSpec change in §8):

```jsonc
"frontier": {
  "metrics": [
    { "field": "intelligence_index", "path": "benchmarks.artificial_analysis.intelligence_index",
      "direction": "max", "label": "Intelligence Index", "publisher": "Artificial Analysis",
      "publisher_url": "https://artificialanalysis.ai/", "republished_by": "OpenRouter" },
    { "field": "coding_index",  "path": "benchmarks.artificial_analysis.coding_index",  ... },
    { "field": "agentic_index", "path": "benchmarks.artificial_analysis.agentic_index", ... },
    { "field": "context_window", "path": "context_length", "direction": "max",
      "label": "Context window", "publisher": null, "republished_by": null }
  ],
  "eligible": {
    "exclude_id_patterns": [":", "^openrouter/", "^~"],
    "exclude_when_present": ["alias_target"],
    "note": "A ':' suffix is a service variant of a base row and carries the base row's values (measured: 85 rows on 2026-09-04); 'openrouter/*' are router pseudo-rows; '~vendor/x-latest' rows carry alias_target and redirect to another row (13 rows). Listing them would rank one model several times and a router first."
  },
  "top_n": 10,
  "newest_days": 30
}
```

The field names deliberately equal the ones the 29 entries already bind
(`openai-gpt-5-6-sol.md:34-48`), so a leader row's index on `/frontier` and the
`{{fact:model/x#intelligence_index}}` on its own page are one value.

### 2.2 The computation (`pulse/lib/frontier.mjs`, new)

For a snapshot `S` and the registry block:

- **eligible(S)** = rows of `S.rows` whose id matches none of
  `exclude_id_patterns` and which carry none of `exclude_when_present`.
- For each metric `m`: **scored(S, m)** = eligible rows where
  `getPath(row, m.path)` is a finite number (`pulse/lib/core.mjs:231-239` is
  the path reader `materialValue` already uses, `diff.mjs:135-140`).
- **leaders(S, m)** = every scored row whose value equals the extreme in
  `m.direction`. Ties are all leaders; the page says so. No tie-break invents
  an order.
- **top(S, m)** = scored rows sorted by value (direction), then by row id for
  determinism, first `top_n`.
- **newest(S)** = eligible rows with `created` within `newest_days` of
  `S.date`, sorted by `created` descending then id. Labelled on the page as
  **"newest listings on OpenRouter"**, never "newest models": `created` is the
  router's listing timestamp (measured: `meta/muse-spark-1.3` created
  2026-09-02 with no index; `anthropic/claude-fable-5.1` created 2026-09-01 and
  first indexed in the 2026-09-02 snapshot).
- **frontier set(S)** = the union of `top(S, m)` over metrics — the rows the
  benchmark work in §5 is bounded to.

Every value carries `{ source: 'openrouter-models', snapshot_date: S.date,
publisher, republished_by }`. Nothing reads a clock: `S.date` is the local
date the Pulse minted on the fetch (`sources.mjs:217, 268`), so the file is
byte-identical on a re-run with no world change — the `data/derived/` property
(`data/derived/README.md:3-6`).

Measured against 2026-09-04: intelligence leader `anthropic/claude-fable-5.1`
65.7; coding 81.6 (same row); agentic 61.3 (same row); context leader
`x-ai/grok-4.20` and `x-ai/grok-4.20-multi-agent` tied at 2,000,000 once the
router rows are excluded. 111 of 323 eligible rows carry an intelligence index.

### 2.3 What is derived and what is authored — the line

| DERIVED (Pulse, zero inference, exempt from review per specs/review:26-30) | AUTHORED (reviewed prose or reviewed facts, existing kinds) |
|---|---|
| leaders, top-N, newest, the frontier set | which `benchmark/*` entries exist and what each says it measures |
| every index value and its snapshot date | a vendor-claimed score on a model entry (a `cited` fact) |
| lead-change and rescored lines in the history | the `provenance` and `verification` declared on that fact, and the evidence file |
| the capability strip's membership (a join) | the deltas and blog notes it joins |
| the sort criteria, printed | nothing on `/frontier` itself |

The page's fixed copy states the criterion in the site's `[data-sort-note]`
form (`scripts/verify-surfaces.mjs:93-109` asserts it) and states plainly what
"leads" does not mean: *this site ran no benchmark; an index is one publisher's
aggregate, republished by one router, read on one day.*

**The order of the metric tables is alphabetical by `label`**, never registry
order — specs/directory:86-90 forbids an ordering that a configuration file's
arrangement decides, and choosing which index leads the page is exactly the
placement decision it names. The one editorial choice that remains — which
metrics are declared at all — is in the registry, reviewed like any data change.

---

## 3. Data model — what lives where

| Path | Kind | Written by | Notes |
|---|---|---|---|
| `data/sources/registry.json` → `sources[openrouter-models].frontier` | state (declared) | maintainer / orchestrator | §2.1. Also add `benchmarks` to `yields` so the registry stops under-describing the payload. |
| `data/derived/frontier.json` | derived | `pulse/lib/frontier.mjs`, called from the data-layer step beside `deriveDataLayer` (`pulse/run.mjs:156`) | `{ snapshot_date, source, metrics: [{field,label,publisher,republished_by,direction,leaders:[...],top:[...]}], newest:[...], eligible_count, scored_counts }`. Rows carry `row_id, display_name, provider, entry_id, value, created`. `entry_id` is the declared join `derive.mjs:52-55` already computes — never a name match. Attributed to the engine by `isEngineWrite` (`pulse/lib/publish.mjs:198`, `data/derived/` prefix) with no change. |
| `data/changes.jsonl` | state, append-only | `pulse/lib/frontier.mjs` via the existing `appendChanges` (`diff.mjs:334-345`) | New line kinds `lead-change` and `leader-rescored` (§6). Already an engine write (`publish.mjs:197`). |
| `content/wiki/benchmark/<slug>.md` | content, existing kind | seed wave by the orchestrator, then `entry` jobs | The grouping key for claimed scores (§5). Same schema as every entry; `facts` hold what the benchmark measures, its version history in `timeline`, its publisher URL. |
| `content/wiki/model/*.md` → `facts[]` | content | `verify` jobs, review-gated | Optional `benchmark:` and `verification:` blocks on a `cited` fact (§5.2). |
| `data/reviews/evidence/benchmarks/<entry-slug>--<field>.md` | state | `verify` jobs | The evidence record a `verification:` block points at (§5.3). Directory already exists with this purpose (`data/reviews/evidence/README.md`). |
| `public/frontier.json` | build output | `lib/site-assets.mjs` via `tablePayload` (`:97-109`) | New entry in `TABLE_JSON_ROUTES` (`lib/asset-routes.mjs:28-32`); `TABLE_SCHEMA_VERSION` stays 1 — a new payload is a new file, not a renamed key (`asset-routes.mjs:129-155`). |

What is deliberately **not** created: a `data/frontier.jsonl`; a `frontier`
content type in `CONTENT_TYPES` (`lib/paths.mjs:42-49`); a `frontier` job type;
any front-matter field on model entries that says "frontier" (the set is
computed, and a hand-set flag would be the drifting parallel corpus the brief
warns about).

---

## 4. How it avoids the daily-red-build class

The class is: *a sentence typed by an author states a fact about one day's
snapshot, and the snapshot advances every morning* (`snapshot-census.mjs:5-20,
62-68`). The design closes it four ways, each mechanical.

1. **No authored number exists on the surface.** `/frontier` is a `page.tsx`
   placing a rendered fragment from `data/derived/frontier.json`, exactly as
   `app/impossible-routine/page.tsx:21-38` places `renderDeltasIndex`. It is not
   a corpus doc, so `checkSnapshotCensus` never sees it
   (`snapshot-census.mjs:523`), `warnCurrencyLiterals` never sees it
   (`build-content.mjs:276` iterates `corpus.all`), and there is no
   `bodyStartLine` for either to report. There is nothing to re-date because
   nothing was dated by hand.

2. **Every number on the surface is bound, and the binding is dated by the
   snapshot, not the build.** `frontier.json` carries `snapshot_date` from
   `latest.date`; the page prints it beside every value ("in the snapshot of
   2026-09-04"). This is the exact shape `facts.mjs:198-208` already renders
   for a feed fact — `fetched <date>` — and the freshness pipeline's
   `display_date_label` flips it to "last changed" when the source is suspect
   (`freshness.mjs:123-126`), which the frontier renderer must read rather than
   restate.

3. **The timeline's claims are dated observations by construction.** A
   `lead-change` line carries the snapshot date it was observed in, the same
   way a delta end carries a required `date` — the property specs/wiki:422-429
   states ("a field with a dated sibling is a record of that date rather than a
   claim about now") and `lib/schema.mjs:439-449` records the measurement
   behind, exempting a dated observation from the volatile-literal scan. A line that says *on 2026-09-02 the lead passed
   to Fable 5.1* is true forever.

4. **No build clock anywhere in the new files.** `status-tables.json` writes
   `generated_on: today()` (`derive.mjs:163`) and was the reason
   `+dirty` stamps appeared on clean builds (`scripts/prebuild.mjs:60-77`).
   `frontier.json` uses `snapshot_date` only. A `pulse/tests/frontier.test.mjs`
   fixture pins `PULSE_NOW` on two consecutive days over an unchanged snapshot
   and asserts byte-identical output and zero appended lines — the same
   assertion `queue.json` makes of itself (`queue.mjs:15-22`).

**Where the class can still enter, and the rule that keeps it out.** An author
writing a model entry or a blog post will want to type "the current leader".
That sentence is the defect, whatever page it is on. The rule for authored
prose — to be written into `content/wiki/README.md` beside the three existing
rulings — is: *link to `/frontier`, or transclude the bound index
(`{{fact:model/x#intelligence_index}}`); never state a rank as a literal.* A
blog **note** about a lead change is dated and never rewritten (specs/blog:
10-24), so "Fable 5.1 took the lead today" is honest in a post dated
2026-09-02 and ages as a post is meant to.

**Dependence on `addictedtoai-6nrk`: none for Phases 1–3, and a shared design
for Phase 4.** 6nrk proposes a derived, entry-less `{{fact:...}}` — "how many
rows satisfy predicate P". The Frontier does not need any derived value inside
prose to exist; its numbers live on a derived page. Where the two meet is a
future `{{frontier:intelligence_index#leader}}` marker that would let entry
prose say "the current leader" without typing it — that is precisely 6nrk's
"derived fact with no owning entry" design question, and it should be decided
once, for both, when 6nrk is taken. Until then the Frontier reduces 6nrk's
pressure rather than adding to it: the fifteen hedged censuses exist because
prose had nowhere to point; `/frontier` is somewhere to point.

---

## 5. The benchmark model — claimed, independent, and what "verified" means

### 5.1 Three provenances, one hard rule

| Provenance | Mechanical meaning | Where it comes from | How displayed |
|---|---|---|---|
| **independent** | a `source: feed` fact whose registry metric declares a `publisher` that is not the row's vendor | Artificial Analysis indices via OpenRouter, today | "Artificial Analysis Intelligence Index 65.7 — as republished by OpenRouter, snapshot 2026-09-04" |
| **vendor-claimed** | a `source: cited` fact declaring `benchmark.provenance: vendor` | the model card / launch post | "TerminalBench 2.1 — 91.91% (vendor-claimed; ultra thinking mode)" plus its verification state |
| **third-party-claimed** | a `cited` fact declaring `benchmark.provenance: third-party` | a paper, a lab's own eval of someone else's model | as above, labelled third-party |

**The hard rule:** an independent index and a claimed score are different
kinds of claim and never share a column, a sort, or an average. The frontier
tables rank on independent metrics only. Claimed scores appear per row, grouped
by benchmark entry, in their own block, and the page's fixed copy says why.

Provenance is **declared, never inferred from the URL host**
(specs/directory:187-192's rule for categories, `lib/units.mjs` for units: a
heuristic that is right most of the time is silently wrong the rest).

### 5.2 The structured shape — one optional block on the existing fact

Extend `citedFact` (`lib/schema.mjs:174-184`) with an optional `benchmark`
object rather than adding a fourth `source` discriminant:

```yaml
- field: terminalbench_score
  source: cited
  value: "91.91% on TerminalBench 2.1 in ultra thinking mode, and 88.76% in max mode"   # unchanged, still the verbatim record
  source_url: "https://..."
  accessed: "2026-08-28"
  volatility: dated
  benchmark:
    id: benchmark/terminal-bench          # an entry id; the build resolves it like `mentions`
    version: "2.1"
    score: 91.91                          # a number
    unit: percent                         # closed list: percent | points | elo | seconds | tokens | ratio
    conditions: "ultra thinking mode"     # author prose — classified PROSE
    provenance: vendor                    # closed list: vendor | third-party
  verification:
    method: text                          # closed list: text | figure | unconfirmed
    evidence: data/reviews/evidence/benchmarks/openai-gpt-5-6-sol--terminalbench_score.md
    matched: "91.91%"                     # the literal substring found in the fetched bytes
```

Every new string field gets a row in `PROSE_FIELDS`/`NON_PROSE_FIELDS`
(`schema.mjs:467-562`) or `assertFieldsClassified` fails the build
(`:663-671`): `benchmark.id` an entry id; `benchmark.version` a version
string; `benchmark.unit`, `benchmark.provenance`, `verification.method`
closed-list values; `verification.evidence` a path; `verification.matched` a
verbatim quotation (NON_PROSE, same reason as `facts[].value`, `:502-504`);
`benchmark.conditions` **PROSE** — it is the one author sentence.

`value` stays as it is. The 12 existing free-text scores remain valid facts;
they simply do not appear on `/frontier` until a `verify` job structures them.
Adoption is incremental and bounded (§7).

### 5.3 What "verified" means, mechanically — and the figure-only case

The house norm is stated in `loop/lib/brief.mjs:82-90`: a decisive figure is
confirmed by literal substring against fetched bytes; a number that lives only
inside a chart image will never pass; WebFetch's extractor is evidence in
neither direction. The verification block encodes exactly that norm and no
more:

- `method: text` — the reviewer/verify job fetched `source_url` during the job
  and found `matched` as a literal substring of the fetched bytes (after the
  inflate/ligature handling the ground rules describe). **Build check** (new
  `lib/benchmark-facts.mjs`, wired beside the other gates in
  `build-content.mjs:250-301`): the evidence file exists; its front matter
  names the same `source_url` and a `fetched:` date; its body contains
  `matched` verbatim; and `matched` contains the digit-run of `benchmark.score`
  (`91.91`). A `text` claim whose evidence fails any of these **fails the
  build** naming the entry and field — the same treatment an unresolved
  transclusion gets.
- `method: figure` — the figure exists only in an image or a rendered chart. The
  evidence file names where (page, caption, alt text, the image URL) and
  carries the verifier's own words for what they read. **Displayed as its own
  state**: "read from a figure in the source — not text-checkable", with a link
  to the evidence. It is **not** counted as verified and **not** counted as
  unconfirmed; the build's coverage line prints it as its own number. This is
  the honest handling the brief asks for: the site says exactly what it could
  and could not check.
- `method: unconfirmed` (or no `verification:` block) — the claim is carried
  from the source as the author read it, with no fetched-bytes confirmation
  recorded. Displayed "vendor-claimed, unconfirmed here". A `verify` job that
  fetched and did **not** find the figure records `method: unconfirmed` with an
  evidence file saying so and what was searched — recorded absence, per the
  ground rule that absence is not proven until the instrument is ruled out
  (`brief.mjs:82-84`).

What "verified" **never** means here: that this site ran the benchmark. The
page's fixed copy says so in one sentence. The strongest claim the site can
make is *the publisher's page says this*, and the strongest independent claim
is *a third party's index says that*.

**Independent values are not "verified" either, and the page says which hop
is unchecked.** The AA indices reach the site through OpenRouter; the site has
never compared OpenRouter's copy against Artificial Analysis's own page. The
existing corroboration mechanism is the mechanical path to doing so: a `cited`
fact from `artificialanalysis.ai` declaring `corroborates: intelligence_index`
(`schema.mjs:169-172`; specs/pulse:279-339) makes the Pulse compare the two
every run and file a `verify` item on disagreement. **Unverified:** whether AA's
pages are fetchable under the registry's robots/terms rule and this machine's
port hazard — a registry-verification task, not an assumption. Until then the
label is "as republished by OpenRouter" and nothing stronger.

### 5.4 Coverage is printed, so a vacuum is visible

`prebuild: benchmark facts — N structured (M entries); N independent; N
text-confirmed; N figure-read; N unconfirmed; N free-text scores not yet
structured` — the same discipline `build-content.mjs:434-473` applies to every
other gate, for the reason its comments give: a check that runs on nothing
prints the same clean line as one that runs on everything.

---

## 6. The timeline — what makes it immutable, and what guarantees that

### 6.1 The lines go in `data/changes.jsonl`, not a new ledger

The brief suggests the answer may already be in the architecture. It is:
`data/changes.jsonl` is the append-only, deterministically keyed, engine-owned
history (`diff.mjs:12-31`; `publish.mjs:197`), and everything downstream of it
already exists — the home changed feed (`lib/changes.mjs:192-224`), the
`covers:` anchor a blog note declares (`schema.mjs:316-323`; specs/blog:144-186),
the sitemap's `lastModified` join (`lib/sitemap-dates.mjs:58-66`), the scout's
assembled context (`queue.mjs:321-328`), the RSS feed, and the seeded-history
precedent (`diff.mjs:270-315`; specs/pulse:151-172).

Two new line kinds, emitted by `pulse/lib/frontier.mjs` from the standing diff
between `previous` and `latest` — the same two snapshots and the same
`rowsHash` pair `diffSnapshots` keys on (`diff.mjs:194-200`):

```jsonc
{ "kind": "lead-change", "date": "<latest.date>", "source": "openrouter-models",
  "source_url": "https://openrouter.ai/api/v1/models",
  "key": "frontier|<from-hash>|<to-hash>|<metric field>|lead-change",
  "field": "intelligence_index", "metric_label": "Intelligence Index", "publisher": "Artificial Analysis",
  "row_id": "anthropic/claude-fable-5.1", "display_name": "Anthropic: Claude Fable 5.1",
  "old": "anthropic/claude-opus-5=63.1", "new": "anthropic/claude-fable-5.1=65.7",
  "cause": "arrival" | "rescored" | "withdrawn",
  "excerpt": { "from": { ...previous leader row, benchmarks + created + name... },
               "to":   { ...new leader row... } } }
{ "kind": "leader-rescored", ... "old": "58.1", "new": "53.4", ... }   // same leader, its value moved
```

`cause` is computed, not judged: `arrival` when the new leader was absent from
`previous` or unscored in it; `rescored` when the old leader's value fell (or
the new one's rose) between the two snapshots with both present; `withdrawn`
when the old leader left the snapshot. The 2026-09-02 event is `arrival`; the
qwen event would have been `leader-rescored` had qwen been leading.

Only **leader** identity and leader value changes are recorded. Top-N
membership churn stays in the derived file: measured base-row counts moved
321 → 319 → 318 → 321 → 323 across eight days, so entries and exits of the tenth
place would be noise the front page does not need, and the history's job is
"when did the lead change", which is what the maintainer asked to see.

`lib/changes.mjs:171-182` `describeChange` gains one branch so the feed line
reads *"Intelligence Index lead: Claude Opus 5 63.1 → Claude Fable 5.1 65.7
(Artificial Analysis, via OpenRouter)"* with no adjective. `uninterpretedChanges`
(`diff.mjs:392-404`) filters `kind === 'field_change'`, so these lines spawn no
`interpret` job by construction.

### 6.2 The guarantees

1. **Keys are a function of state alone** — two row hashes, the metric, the
   kind — so a re-run recomputes the identical standing diff and
   `appendChanges` writes nothing (`diff.mjs:334-345`). A clock rollover with
   no fetch appends nothing. Measured behaviour of the existing feed, reused.
2. **No code path edits or deletes a line.** The frontier module has one write
   call and it is `appendChanges`. Its header states the append-only rule in
   the terms `data/proposals/settle-what-append-only-means-for-changes-jsonl.md`
   asks the spec to settle: *no line produced from a source diff is ever
   edited or deleted; a correction is a new line keyed to the corrected one.*
   The OpenSpec change for this surface should carry that sentence into
   specs/pulse, which resolves that proposal's ambiguity for the frontier lines
   at least.
3. **Committed every run.** `publish.mjs:196-202` already attributes
   `data/changes.jsonl` to the engine; the publish step commits whether or not
   it pushes (specs/pulse:341-391).
4. **Tests.** `pulse/tests/frontier.test.mjs`: (a) unchanged fixture → zero
   lines, byte-identical `frontier.json`; (b) a fixture where a new row takes
   the lead → exactly one `lead-change` with `cause: arrival`; (c) the old
   leader's value lowered → `lead-change` with `cause: rescored`; (d) the same
   leader's value lowered → `leader-rescored`; (e) re-running (b) appends
   nothing; (f) deleting the appended line and re-running restores it — which
   is the property that makes deletion not a retirement path, the lesson
   `pulse/lib/vanished.mjs:62-79` records.
5. **Git is the audit.** Every Pulse run commits the file; a rewrite would show
   as a `-` line in history, and the 174 existing lines have never had one
   except the annotation edits that proposal names.

### 6.3 Seeding the eight days that exist

A one-time `scripts/seed-frontier-history.mjs`, run by the orchestrator (not
by a job, not by the Pulse): replay the committed `latest.json` blobs via
`execFileSync('git', ['show', '<sha>:data/sources/openrouter-models/latest.json'])`
— Node plumbing, per the CLAUDE.md Windows note about MSYS mangling `rev:path` —
compute leaders per day, and append `seeded: true` lines with keys
`seed|frontier|<snapshot date>|<metric>|lead-change` plus one `baseline` line
per metric for 2026-08-28 stating who led when observation began. Rendered with
the same `data-seeded` marker the feed already uses (`lib/render/home.mjs:34`).

Honest limits: eight days; one lead change; the baseline says *observation
began here*, not *this model became the leader here*. The value of this
surface compounds with time and was never going to be there on day one.

### 6.4 The live view and the timeline cannot disagree about the past

The live view reads only `latest`. The timeline reads only history. Neither is
derived from the other. The one join between them is the current leader's
`lead-change` line, which the live view links to ("leading since 2026-09-02")
— read from the history, never recomputed, so the live page cannot quietly
re-date the past. When a leader is re-scored downward and loses the lead, the
timeline says `rescored`, and the live view shows the new leader; nothing is
rewritten.

---

## 7. How it gets written and kept current

| Part | Machinery | Job type | Budget category | Inference |
|---|---|---|---|---|
| live view, `frontier.json`, `/frontier.json` | Pulse data-layer step; prebuild | none | none | zero |
| lead-change lines | Pulse diff step | none | none | zero |
| seeding eight days | one-time orchestrator script | none | none | zero |
| `benchmark/*` entries | orchestrator seed wave with `seed-<slug>.md` review records (`lib/reviews.mjs:121-132` naming), then `entry` jobs | `entry` (existing) | new_writing | reviewed |
| structuring + verifying a claimed score | `verify` job (existing; its acceptance already requires executed re-fetching and evidence under `data/reviews/evidence/`, `brief.mjs:98-103`) | `verify` (existing) | upkeep | reviewed |
| a note about a lead change | scout → expiring proposal → `post` (existing path) | `scout`, `post` | new_writing | reviewed |
| an entry body for a bare leader stub | `entry` job | `entry` | new_writing | reviewed |

**One new queue reason, on an existing producible type.** `frontier-score-
unstructured`: for each entry joined to a row in the current frontier set that
carries a `cited` fact whose field name ends `_score` or `_benchmark`
(measured: those are the two shapes in the corpus today) and no `benchmark:`
block, one `verify` item — subject the entry, target the file, detail naming
the fields. Rank **35**: below every breakage and every timer, because nothing
on the page is wrong — the site has declared a surface and not yet structured
what it shows, which is the `curriculum-gap` shape (`queue.mjs:150-170`) — and
just above `want-eligible-mint` (30), because a frontier row is on a page
readers reach today while a wanted name is a gap three pages point at. GUESS on
the exact number; the ordering argument is what matters. Bounded by `top_n × metrics` entries, retires by recomputation the
moment the block is added, and `verify` is already in `QUEUE_PRODUCIBLE_TYPES`
(`:87-94`), so `pulse/tests/curriculum-queue.test.mjs`'s closed-list assertion
is untouched. A second reason, `frontier-leader-stub` (an `entry` item for a
leader row whose entry has no prose body), is worth considering and is a
GUESS on value: leaders today are Fable 5.1 and Grok 4.20, both stubs
(`content/wiki/model/anthropic-claude-fable-5-1.md` has no body and one
`manual` alias). Rank below `want-eligible-mint`.

**The scout gets the frontier lines for free.** `uncoveredEvents`
(`queue.mjs:321-328`) already hands the scout every uncovered change-feed line
from the trailing seven days; a `lead-change` line arrives in that join with
no code change, and a note anchored on it via `covers:` passes the anchor check
(`lib/anchors.mjs`) because the key resolves in `changes.jsonl`. This is the
strongest argument for §6.1 over a separate ledger.

**Review.** `verify` jobs are reviewed against the `tutorial` checklist today
(`review.mjs:159-170`), which asks for evidence of execution but not for the
substring discipline. Add a `benchmark-verify` checklist keyed from the queue
reason (or extend `tutorial`'s with two lines): *the evidence file's `matched`
is present in the bytes you fetch yourself; a `figure` method names the figure
and never a number you could not read from text.* The merge gate's
`would-cite` requirement applies as today.

**Nothing on the frontier can go stale silently.** The live view is a pure
function of the latest snapshot; if OpenRouter stops publishing `benchmarks`,
`scored(S, m)` is empty and the page renders "no listed row currently carries
this index" — an absent value, never a guess (specs/directory:20-33). If the
source goes suspect, the label flips to "last changed" through the existing
`display_date_label`. Claimed scores are `dated` facts and never re-check
(`schema.mjs:66`), which is correct: a launch-day score is a fact about a day.

---

## 8. What it costs

**OpenSpec change** (required: a new surface, a new line kind, a fact-shape
extension — specs/loop:539-549 says exactly when). One change, deltas to:
- `site` — a standing surface beside the showpiece (specs/site:45-74 is the
  template for how a surface is specified).
- `directory` — a fourth standing table with a JSON sibling (`:36-51`) and the
  alphabetical-metric-order rule (`:76-101`).
- `pulse` — the frontier derivation, the two line kinds, the seeded-history
  extension, the append-only sentence (§6.2), the new queue reason(s).
- `wiki` — the `benchmark:`/`verification:` blocks; the provenance rule; the
  "link, never rank in prose" rule.
- `review` — the benchmark-verify checklist and what `text`/`figure`/
  `unconfirmed` require of a reviewer.

**Code, by file (estimates are GUESSES; the file list is not):**
- new `pulse/lib/frontier.mjs` (~200 lines) + `pulse/tests/frontier.test.mjs`
  with a fixture tree under the OS temp dir per the test convention.
- `pulse/run.mjs` — two calls (derive after `deriveDataLayer` at `:156`; emit
  lines inside the per-source loop beside `diffSnapshots` at `:104`).
- `pulse/lib/diff.mjs` — none if `appendChanges` is reused as is;
  `describeChange` in `lib/changes.mjs:171-182` gains one branch; `MATERIAL_KINDS`
  (`:35`) gains the two kinds if the feed filters on it.
- `lib/frontier.mjs` (view: join `frontier.json` rows to `corpus.byId`, gather
  each row's structured benchmark facts, the capability strip join) and
  `lib/render/frontier.mjs` (HTML fragment in the `render/common.mjs`
  vocabulary; tables, sort notes, the `data-seeded` marker).
- `app/frontier/page.tsx` — placement only, no client component: `/catalog`
  measures 123.2 KB of the 150 KB budget with `CatalogFilter.tsx` loaded
  (`data/launch.json:21-27`); a static table stays near `/`'s 110.7.
- `lib/asset-routes.mjs:28-32` (`TABLE_JSON_ROUTES.frontier`),
  `lib/site-assets.mjs:139-148`, `lib/catalog.mjs:29-33` (`SORT_CRITERIA`), and
  the hard-coded name→page map in `scripts/verify-surfaces.mjs:115-118`.
- Registration points a new surface touches, measured by grepping
  `impossible-routine`: `app/layout.tsx:70-78` NAV; `lib/render/home.mjs:
  168-181` DOORS; `app/sitemap.ts:184-195` (`lastModified` = newest
  `lead-change` date, the `/catalog/changed` rule at `:171-173`) **and
  `app/sitemap.test.mjs:76`, which pins the index→date map**; `lib/crawlers.mjs:
  202` llms.txt; `scripts/verify-surfaces.mjs:95-101` sort notes;
  `scripts/verify-design.mjs:72-76` SAMPLES (optional).
- `lib/schema.mjs` — the two optional blocks, six-plus classification rows,
  a `superRefine` that `benchmark.id` starts with `benchmark/`; `lib/corpus.mjs:
  162-219` `checkReferences` resolves `benchmark.id` like `mentions`.
- new `lib/benchmark-facts.mjs` + test — the evidence check (§5.3) and the
  coverage line.
- `pulse/lib/queue.mjs` — one reason in `RANKS`, one producer, a test.
- `loop/lib/review.mjs:110-170` — one checklist entry.
- `content/wiki/README.md` — the fourth ruling (link, never rank).
- `data/sources/registry.json` — the `frontier` block; `yields` gains
  `benchmarks`.
- `scripts/seed-frontier-history.mjs` — run once by the orchestrator.
- Seed content: ~8 `benchmark/*` entries for the benchmarks the corpus already
  cites (TerminalBench, CyberGym, DeepSWE, FrontierCode, MATH, GPQA, MMLU-Pro,
  SWE-bench) plus one for the AA Intelligence Index itself — the place to
  record what the index aggregates and link its methodology, so the table
  header links to an entry instead of a footnote; and their `seed-*.md`
  review records.

**Not changed:** `data/config.json`, `JOB_TYPES`, `ACCEPTANCE_BY_TYPE`,
`package.json`, `openspec/specs/` directly (archive does that),
`MECHANICAL_FRONT_MATTER_KEYS` (`lib/review-hash.mjs:71` — nothing mechanical
writes into an entry here), `TABLE_SCHEMA_VERSION`.

**Build-time impact:** one O(rows × metrics) pass over 427 rows in the Pulse;
one more static route in `next build`; one JSON asset. Negligible against the
0.3 s corpus load `lib/site.mjs:11-12` measures.

---

## 9. Risks, and what I could not verify

1. **The `benchmarks` field is undocumented and could vanish.** It is absent
   from the registry's `yields` and from OpenRouter's documented schema as the
   registry records it. The design tolerates absence (§7) but the surface's
   whole first table would go blank. Mitigation: the corroborating AA source
   (§5.3) would make the site's copy of the indices independent of one router —
   **unverified** whether AA permits fetching.
2. **Two-hop provenance.** "Artificial Analysis via OpenRouter" is what the
   site can honestly say. GUESS: the indices are AA's published aggregates with
   no timestamp of measurement in the feed; I found no field saying when AA
   measured. The page must not imply a measurement date it does not have.
3. **Rescoring.** One downward revision in one day on one row. If revisions
   are frequent among leaders, `leader-rescored` lines could dominate the
   timeline. Measure for two weeks before deciding whether to render them in
   the home feed or only on `/frontier`.
4. **"Newest" is a listing date.** `created` is OpenRouter's listing time. A
   model released elsewhere weeks earlier lists "new". The label must say
   "listed on OpenRouter", and the `llm-releases` seeded lines
   (`registry.json:96-133`) are the site's actual release dates — a join
   between the two is a later refinement, not assumed.
5. **Eligibility patterns are a heuristic wearing declared clothes.** The `:`
   suffix rule was measured on 85 rows today; a vendor using `:` in a base id
   would be wrongly excluded, and a variant with a different scheme wrongly
   included. It is declared in the registry so it is visible and reviewable,
   but it is still a pattern. `alias_target` (13 rows) is a real field and safe.
6. **Vendor pages block fetches.** `data/proposals/primary-source-fetch-route-
   for-blocked-vendor-pages.md` already records this. Many claimed scores will
   sit at `unconfirmed` for a long time. That is the honest state, not a bug,
   but the maintainer should expect the "verified" column to fill slowly.
7. **The leaders are stubs.** `anthropic-claude-fable-5-1.md` has no body, one
   `manual` alias, and no index facts bound. `/frontier` will link its top row
   to a `noindex` stub page. Correct per specs/wiki:329-346, and it will make
   the thinness of the leader entries visible — which is work the surface
   generates rather than a defect in it.
8. **A ranking surface and the education rule.** specs/education-static:15
   forbids vendor rankings and benchmark scores on learn pages. Learn pages
   must link `/frontier`, never restate it. Worth one sentence in the change's
   `education-static` delta, or at least in the review checklist.
9. **"No placement is ever sold."** Ranking by a third party's index is an
   objective, stated criterion. Choosing which indices are declared is not.
   Alphabetical metric order (§2.3) removes the ordering half; the declaration
   half stays a reviewed data change, and the page should say the metrics were
   chosen because they are the ones a registered source publishes for every
   listed model, not because of what they show.
10. **Spec ambiguity on append-only** (the proposal in §6.2). If the eventual
    ruling forbids even annotation edits, nothing here changes; if it permits
    them, the frontier lines should be named as the class that never edits.
11. **Unverified in this session:** that `next build` on Vercel behaves
    identically for a page reading `data/derived/frontier.json` (it should —
    `/catalog` reads `catalog.json` the same way — but I did not run a build;
    the tree was read-only). That `design_arena` is worth surfacing at all — I
    recommend leaving it out of Phase 1 and recording the decision. The exact
    rank numbers for the new queue reasons. Whether `daysSince` on `created`
    (a Unix epoch integer, not an ISO date) needs a small adapter — `core.mjs:
    210-223` parses strings; the epoch needs `new Date(created * 1000)` first.
12. **What I did not do:** run `npm test` or `npm run build` (forbidden while
    the tree is live); fetch anything (forbidden); write any file into the
    repository.

---

## 10. Phased build order — smallest useful thing first

**Phase 0 — decide and specify (no code).**
Write the OpenSpec change (§8) with the `frontier` registry block as its worked
example. Decide the three open questions in the summary below. Add
`benchmarks` to the registry's `yields`. File the beads issues for anything
deferred here as their own ids (the CLAUDE.md rule).

**Phase 1 — the live view, zero authoring.** *Useful on its own.*
`pulse/lib/frontier.mjs` → `data/derived/frontier.json`; `lib/frontier.mjs`,
`lib/render/frontier.mjs`, `app/frontier/page.tsx`; `/frontier.json`; nav,
door, sitemap (+ the pinned test), llms.txt, verify-surfaces sort-note entry
and JSON-sibling map. Metrics: the three AA indices and context window,
alphabetical. Tests for byte-identity and exclusions. Gates pass; ship.
A reader can now see who leads what, on which day's snapshot, with the
publisher and router named.

**Phase 2 — the timeline.**
`lead-change`/`leader-rescored` lines from the standing diff; `describeChange`
branch; the timeline section on `/frontier` reading the feed filtered by kind;
"leading since" on the live view; the seed script run once by the orchestrator
for 2026-08-28 → today; `data-seeded` rendering. Tests (a)–(f) in §6.2. The
scout's context now carries lead changes with no further work.

**Phase 3 — the benchmark model.**
Schema blocks and classification; `lib/benchmark-facts.mjs` evidence check and
coverage line; nine `benchmark/*` seed entries with review records; the
`frontier-score-unstructured` queue reason; the review checklist; per-row
claimed-score blocks on `/frontier` with provenance and verification states;
the fourth ruling in `content/wiki/README.md`. The first `verify` jobs
structure the twelve existing scores.

**Phase 4 — capabilities and closing the loop.**
The capability strip (recent-routine deltas + notes mentioning frontier
entries); the `frontier-leader-stub` reason if Phase 1 shows the leaders
staying stubs; the AA corroboration source if its terms allow; and — jointly
with `addictedtoai-6nrk`, not before — a derived `{{frontier:...}}` marker so
entry prose can name the leader without typing it.

Each phase passes every gate on its own and leaves the site coherent if the
next never happens.

---

## 11. Addendum (2026-09-04, after independent review) — tools, capabilities, and two findings

**What this supersedes.** §1's description of proven capabilities as "a strip
on `/frontier`" and §10's placement of the capability strip in Phase 4 are
superseded by §11.3 and §11.5 below: capabilities become a full section and
move to Phase 1. §2.3's derived/authored table is **extended**, not replaced,
by §11.2. Nothing else above is rewritten; the reviewer's findings stand
against the text as it was. The measurements here come from a fourth probe,
`frontier-probe-tools.mjs`, beside this file.

**Two review findings this addendum honours.** (1) The safety of `/frontier`
rests on being *outside* `checkSnapshotCensus`'s scope, not on satisfying it;
a rotting census sentence typed into the page's own lede is invisible to every
check in the repository. §11.4 adds the guardrail that puts the page inside a
fence. (2) `data/changes.jsonl` is edited in place by approved repair jobs
(annotation `text`, twice this week), so §6.2's "immutability" wording
overstates what the file guarantees. Nothing in this addendum relies on that
file being immutable; the tools and capabilities limbs read no ledger at all.
For §6, the honest restatement — left for the change author, since I am not
rewriting in place — is: *the frontier module never edits or deletes a line;
what the file as a whole permits is the open question
`data/proposals/settle-what-append-only-means-for-changes-jsonl.md` asks the
spec to settle, and the frontier lines should be named there as the class that
is never edited.* The tests in §6.2(4) measure the module, not the file.

### 11.1 Why tools were dropped, and what is actually there

Models rank because a feed row carries numbers. Tools carry none. What the
corpus records about a tool, measured on the tree today:

- **35 listings** in `content/directory/tools/`, schema
  `lib/schema.mjs:359-381`: `title, url, pricing (prose), last_verified,
  entry, category, mentions, discontinued`. **No listing date, no version, no
  metric.** All 35 carry the same `last_verified: 2026-08-28` — the seed date
  — and all 35 read `ok` in `data/derived/freshness.json`.
- **38 `tool/*` wiki entries**, **zero with a prose body**, 29 cited facts in
  total (7 are `license`; `version` and `latest_release` appear once each),
  **4 timeline events across 3 entries, all dated 2023** (`tool/sglang`
  2023-12-12, `tool/vllm` 2023-09-12, `tool/llama-cpp` 2023-06-05).
- **No registered source yields tool rows** (`data/sources/registry.json`
  has two sources, both about models), so no change line and no lifecycle
  append will ever mention a tool. specs/education-dynamic:3-7 says this in so
  many words: the surface for "the newest tools" is the one that "has no free
  feed behind it".
- **4 tutorials**, all `fresh`, every one pinning a tool at an exact version
  or dated state in `verified_against` (`transformers-js: 4.2.0`,
  `onnx-runtime-web: 1.26.0-dev.20260416-b7804b056c`, `llama-cpp: GGUF version
  3`, `openrouter: /api/v1/models as served 2026-08-28, total_count 398`),
  with `verified_on` and a `reverify_days` of 30 or 60 — seven distinct tool
  ids across them.
- **The 28 deltas mention 5 model ids and 0 tool ids.**

The directory also forbids the two shortcuts a "tools frontier" would reach
for: ordering by count (`lib/listings.mjs:114-118`; specs/directory:92-95),
and any order that is not a pure function of stated names
(specs/directory:86-90). A `pricing` string is prose and cannot be compared. So
there is no computed ranking of tools waiting to be used, and inventing a
score — GitHub stars, download counts, a model's opinion — would be a fabricated
metric that an interested party can move, which is the placement the directory
refuses to sell.

**The honest conclusion: tools belong on The Frontier in a different shape
than a leaderboard.** What the frontier of tools *is*, in this corpus's own
terms, is *what a tool was most recently proven to do, at which version, on
which date, with evidence* — and that record already exists: it is the
tutorial (specs/education-dynamic:11-27, "verified means the steps were
actually run"). The rest is either honestly empty today or authored.

### 11.2 The tools limb — what is computable, what is authored

Extending §2.3's table:

| DERIVED, from committed state | Today's measured value | AUTHORED, through the review gate |
|---|---|---|
| **Proven in practice**: every tutorial, newest `verified_on` first, each subject joined to its `tool/*` entry, showing `verified_against` version, `verified_on`, `state` from freshness (`fresh/stale/demoted`, `lib/tutorials.mjs` via `site.tutorials`), and a link to its evidence under `data/reviews/evidence/` | 4 tutorials, 7 tools, all verified 2026-08-28 | the tutorials themselves (`tutorial` jobs; proposal-initiated by decision, `pulse/lib/queue.mjs:59-70`) |
| **Recently changed**: `tool/*` entries whose newest `timeline[].date` falls in a trailing window (365 days, GUESS), newest first, each event with its `source_url` | **empty** — the newest event on any tool entry is 2023-12-12; the section renders the honest empty notice, the way `renderDeltasIndex` does (`lib/render/delta.mjs:80-91`) | dated, sourced timeline events on tool entries (`entry` jobs) |
| **Newly listed**: listings by a listing date, trailing 90 days (GUESS) | **not computable today** — the schema carries no listing date; see below | nothing — the date is data |
| **Proven capability with a tool as its subject**: deltas and blog notes whose `mentions` include a `tool/*` id | **empty** — 0 deltas mention a tool | deltas and notes (existing kinds, existing gates) |
| **Verified alive**: listing `state` from freshness, discontinued/could-not-verify markers | 35 `ok` | nothing |

Three decisions inside that table:

1. **A listing date is a one-line schema addition, deferred until it is not
   vacuous.** `listed_on: isoDate` on `toolSchema`, classified NON_PROSE ("an
   ISO date"), backfilled once by the orchestrator from each file's first
   commit date via Node `execFileSync('git', ['log', '--diff-filter=A',
   '--format=%as', '--', path])` (plumbing, per the Windows note). Today every
   listing would read 2026-08-28 and "newest" would be the whole directory —
   the vacuous check `build-content.mjs:187-191` warns against. Add the field
   when a second wave of listings exists; until then the section is absent and
   the page does not pretend otherwise.
2. **A release feed per tool is the one genuinely mechanical frontier for
   tools, and it is a registry question, not a design question here.**
   specs/education-dynamic:52-54 already anticipates "a newer version in a
   feed" moving a tutorial's banner; no such feed is registered. A per-project
   releases feed (GitHub serves `releases.atom` for public repositories,
   unauthenticated — GUESS that this holds for the 30-odd listed open-source
   tools; robots/terms **unverified**, and 30+ daily fetches meet this
   machine's port hazard) would give release recency as a dated, sourced,
   seedable history exactly as `llm-releases` does for models
   (`registry.json:96-133`; `diff.mjs:270-315`). Cost beyond the registry:
   `extractRows` parses RSS `<item>` only (`sources.mjs:83-103`) and Atom uses
   `<entry>`, so a small parser extension. This is filed as its own beads issue
   in the list below, not assumed by any phase.
3. **What makes a tool "frontier" in the maintainer's sense — a new class of
   capability, the first tool to do X — cannot be mechanical and must be
   authored.** The corpus already has the two shapes for it: a **delta**
   (specs/site:45-74 — two dated, sourced ends, "curated, never
   auto-generated") with the tool in `mentions`, and a **blog note**
   (specs/blog:144-186 — anchored evidence, dated, never rewritten). The
   Frontier joins them; it never writes them. This is the extension of §2.3's
   line the coordinator asked to have said plainly: the tools limb's *judgment*
   lives entirely in reviewed content of existing kinds, and the surface
   contributes only the dated joins.

The tools section therefore has three stated sort criteria, one per rail, each
a date the corpus already records (`verified_on`, newest `timeline.date`,
`listed_on` when it exists), and the page prints them in the
`[data-sort-note]` form (`scripts/verify-surfaces.mjs:93-109`). No rail orders
tools against each other on anything but a date.

### 11.3 Capabilities — a section, not a strip

The maintainer named capabilities twice. A strip under-weights them, and the
corpus can carry more than a strip at zero authoring cost, because it already
holds three kinds of dated, sourced, reviewed proof:

| Proof | Date it is ordered by | Evidence the reader can follow | Kind on the page |
|---|---|---|---|
| a delta (Impossible → Routine) | `routine.date` (`lib/deltas.mjs:78-87`) | both ends' `source_url` | "became routine" |
| a tutorial | `verified_on` | `verified_against` versions + `data/reviews/evidence/` | "proven by execution" |
| a blog news note | its `date`, with a `covers:`/`anchor:` that resolves | the anchor | "reported" |

**The capabilities section is one merged date rail** — the site's recurring
shape (`lib/render/home.mjs:16-19`) — newest first, each item typed by its
proof kind and linked to the entries it mentions, with a stated criterion:
*the date each record says it became true, newest first.* Membership is a
join and nothing else: every delta; every listed tutorial (`state.listed`,
not demoted — the same rule `renderLatest` uses, `home.mjs:110`); every note
that declares an anchor (a synthesis declares none and is judged as one,
specs/blog:103-118 — it is not a dated proof and stays off this rail). No
window is needed on the section itself; the home-page door shows the newest
three.

This is "a posting of new proven capabilities" in the corpus's own vocabulary:
a *proven* capability is one with a source at each end, an executed
transcript, or an anchor the build resolved — and the rail refuses anything
without one because the three source kinds' own schemas already refuse it
(`deltaSchema` requires both `source_url`s, `schema.mjs:390-418`;
`tutorialSchema` requires `verified_against`/`verified_on`, `:289-298`; the
anchor check fails the build on an unresolved `covers:`, specs/blog:159-162).

What this does **not** do: derive a capability from a model's index moving.
A lead change is a fact about a ranking; a capability is a claim about what a
thing can do, and the corpus's rule is that such a claim is authored with
receipts (specs/editorial:114-130, "awe as a finding"). The two sit in
different sections and the fixed copy says why.

**Rate.** `tutorial` and `post` are proposal-initiated by decision
(`queue.mjs:59-70`) and deltas have no producer at all, so the rail fills at
the rate the editorial bar admits work. That is the correct rate. The scout's
brief already carries the change feed; nothing here adds a cadence, and the
section renders an honest count rather than a target.

### 11.4 The lede hazard — putting the page inside a fence

The reviewer is right that `/frontier`'s own fixed copy is unchecked prose.
Every sentence the tools and capabilities sections add to that copy inherits
the hazard. The guardrail, mechanical and cheap:

- `lib/render/frontier.mjs` emits every derived rail inside an element carrying
  `data-derived="frontier-<rail>"`. The page template's own copy lives
  outside those elements.
- `scripts/verify-surfaces.mjs` gains one assertion for `/frontier` (beside
  `checkSortNotes`): after removing every `[data-derived]` subtree, the site
  header, and the footer (whose build stamp is digits by design), **the
  remaining text of `main` contains no digit**. A number in the lede is the
  only way a census can be typed there, and a page whose fixed copy has no
  number cannot state one. Dates, counts and values then exist on the page
  only where the build put them from data.
- The same assertion should be offered to `/impossible-routine`, which shares
  the exposure and today appears to pass it (its lede has no digit), so the
  rule is a site rule rather than a frontier exception — GUESS, since I did
  not render the page; the check would say.

This does not make the page satisfy `checkSnapshotCensus`; it makes the class
of sentence that check exists for unwritable on the page. Where the two differ
is that this one is a measurement of the export, which is where the reviewer
said the exposure was.

### 11.5 What changes in §10

- **Phase 1 grows** by two derived sections with no authoring: the tools
  section (proven-in-practice rail from tutorials; recently-changed rail from
  tool timelines, rendering its honest empty state; alive/dead markers from
  freshness) and the capabilities section (the merged rail of §11.3). Both are
  joins over `site.tutorials`, `site.deltas`, `site.posts` and `corpus.entry`,
  all of which `lib/site.mjs:104-119` already builds. Phase 1 also adds the
  no-digit fence of §11.4 to `verify-surfaces`.
- **Phase 4 loses** the capability strip (now Phase 1) and **gains** two
  deferred, separately filed items: the `listed_on` schema field with its
  git backfill, taken when a second wave of listings exists; and the
  release-feed registry investigation of §11.2(2), whose first step is a
  robots/terms verification and a port-budget measurement, not a design.
- Phases 2 and 3 are unchanged, and neither depends on the tools limb.

### 11.6 Beads issues this addendum implies (each its own id, per CLAUDE.md)

- `listed_on` on `toolSchema` + one-time git backfill — deferred until it is
  not vacuous.
- Per-tool release feeds as registry sources: verify robots/terms for the
  listed projects' release feeds; measure fetch count against the
  ephemeral-port hazard; extend `extractRows` for Atom `<entry>`.
- The no-digit fence for derived-page ledes, offered site-wide.
- Restating §6.2's guarantee (2) in the frontier module's terms, and naming
  frontier lines in the append-only ruling the existing proposal asks for.
- The tool timelines carry nothing after 2023 while the directory re-verifies
  every URL every 45 days (`lib/listings.mjs:27-28`) — a directory that knows
  a tool is alive but not that it changed. Whether `entry` jobs should be
  queued to bring tool timelines current is an editorial decision worth its
  own issue, not a queue producer to add quietly.
