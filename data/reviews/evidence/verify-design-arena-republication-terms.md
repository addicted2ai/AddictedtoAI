# Evidence — Design Arena republication terms for `benchmarks.design_arena`

Job j-20260905-24 (verify), directive line 94, beads `addictedtoai-c563`
(sibling of `-ego8`), DESK-ORDER-001 §4. **The question:** may this site
republish the Design Arena elo / rank / win_rate values the OpenRouter feed
carries? **The answer found:** yes, on one stated condition — attribution —
and the condition is not met today, so nothing renders and nothing in this
job's diff makes anything render.

Raw transcript: `verify-design-arena-republication-terms.raw.txt` in this
directory (node fetch + strip + keyword-count script, run 2026-09-05 local /
2026-09-06 UTC; every document below was fetched in that run).

## What was fetched (17 requests — 12 documents and 5 probes, all 2026-09-05 local)

The four documents the finding quotes — the ToS, `introduction.md`,
`api-reference/overview.md` and the apply form — are transcribed **whole** in
the `.raw.txt`; a transcript that elided the clause a record quotes would prove
nothing. The others are sampled head-and-tail with the elision marked, and
their keyword counts are printed either way.

| URL | Status | What it gave |
|---|---|---|
| `https://www.designarena.ai/robots.txt` | 200 | `User-Agent: *` / `Allow: /` / `Disallow: /api/` / `Disallow: /admin/` |
| `https://designarena.ai/sitemap.xml` | 200 | 15 URLs, **no legal page listed** — the terms are not in the sitemap |
| `/terms`, `/terms-of-service`, `/tos`, `/legal`, `/privacy` | **404** each | the guessed paths; the 404 body's own footer named the real ones |
| `https://designarena.ai/terms-and-conditions` | 200 | Terms of Service, "Last Updated: June 7, 2026", Arcada Labs Incorporated |
| `https://designarena.ai/privacy-policy` | 200 | privacy notice; nothing on reuse of leaderboard data |
| `https://designarena.ai/about` | 200 | no licence or reuse statement |
| `https://www.designarena.ai/model-terms` | 200 | ToS §18's list of **third-party model providers'** terms — not about leaderboard data |
| `https://notes.designarena.ai/methodology/` | 200 | Bradley–Terry methodology; **no** licence, citation or attribution statement (the one "cite" keyword hit was the word "excited") |
| `https://docs.designarena.ai/llms.txt` | 200 | the docs index, which is how the docs pages below were found |
| `https://docs.designarena.ai/introduction.md` | 200 | **the grant** — section "License & Attribution" |
| `https://docs.designarena.ai/api-reference/overview.md` | 200 | auth requirement; "agree to the attribution requirements" as application step 2 |
| `https://docs.designarena.ai/api-reference/leaderboard.md` | 200 | endpoint shape; no rights statement |
| `https://designarena.ai/developers/apply` | 200 | the application form, whose required checkbox restates the attribution requirement |

Guessing the legal paths would have produced a false "no terms page exists"
finding: five plausible URLs 404, and the real paths (`/terms-and-conditions`,
`/privacy-policy`) appear only in the footer markup of the 404 page itself.
The sitemap does not list them either.

## The grant, quoted

`https://docs.designarena.ai/introduction.md`, section **"License &
Attribution"** (markdown as served):

```
## License & Attribution

Data from the Design Arena API is free to use for personal and commercial projects.

<Warning>
  **Attribution is required.** If you display this data publicly (dashboard, article, application, etc.), you must:

  1. Credit **Design Arena** as the source
  2. Provide a visible link to [designarena.ai](https://designarena.ai)
</Warning>

By applying for API access, you agree to these attribution requirements.
```

The application form's required checkbox says the same thing in the first
person (`/developers/apply`, sentence reassembled across a `<strong>` and an
`<a>` — see "ruling out the instrument" below):

> When displaying data from the Design Arena API publicly (in dashboards,
> articles, applications, or any other format), I will credit Design Arena as
> the source and include a visible link to designarena.ai.

## The two documents that do not agree, and how they were read

The Terms of Service (Last Updated: June 7, 2026) contain **no** republication
grant and, where they speak, they pull the other way:

- §17(a): "Arcada Labs and its licensors exclusively own all right, title, and
  interest in and to the Services, the underlying technology used to develop
  and provide the Services, Service Information, and all Output, including all
  associated intellectual property rights".
- §7 defines the term that matters there: the licence users grant covers, among
  other things, the right "to generate data, derived or aggregated in
  deidentified form, from such User Content or from your use of the Services,
  including without limitation usage data or trends with respect to the
  Services (**"Service Information"**)". An Elo computed from user votes is
  that.
- §8 prohibits: "Use, display, mirror or frame the Services or any individual
  element within the Services … without Arcada Labs' express written consent";
  "Attempt to access or search the Services or download content from the
  Services using any engine, software, tool, agent, device, or mechanism
  (including spiders, robots, crawlers, data mining tools, or the like)…"; and
  "Use the Services, or any portion thereof, for any commercial purpose or for
  the benefit of any third party or in any manner not permitted by these
  Terms".

Read plainly, §8 governs **use of the Site and the App** — the thing the ToS
defines as "the Services" — and says nothing about data received from a third
party. It does not contradict the docs' grant; it declines to extend it. The
docs page is the specific, later, purpose-built statement about the data, so
it is the one that answers the question asked. That reading is recorded rather
than hidden, because a reviewer reading only §8 would reasonably reach the
opposite conclusion and should be able to see why this record did not.

## Why "permitted with attribution" is still not "cleared"

Two things, both from the fetched bytes:

1. **The addressee.** The grant is scoped to "data from the Design Arena API",
   an API where "All API requests require authentication using a Bearer token"
   and a key is issued only through an application whose step 2 is "Describe
   your use case and agree to the attribution requirements". Its closing line
   is "By applying for API access, you agree to these attribution
   requirements." This repository holds no key, has never fetched
   designarena.ai for data, and reads these values third-hand from OpenRouter's
   `benchmarks.design_arena` block. **No fetched document says whether the
   grant reaches a party that never applied.** Applying is an outward-facing
   act with a named human on it — the maintainer's decision, not a job's, and
   not attempted here.
2. **The condition is about display and is unmet.** Nothing on this site
   renders a Design Arena credit or a visible link to designarena.ai, because
   nothing on this site renders a Design Arena value. Rendering one before the
   attribution mechanism exists would be a breach of the stated terms, not a
   cosmetic gap.

## What is actually in the feed (measured, not quoted)

`tools/measure-design-arena.mjs` and `tools/measure-design-arena-history.mjs`,
run 2026-09-05 against the committed snapshots:

| snapshot | rows | carry the key | **non-empty array** | distinct canonical_slugs | arena/category pairs |
|---|---|---|---|---|---|
| 2026-09-05 (`latest.json`, fetched_at 06:00:04.599Z) | 431 | 243 | **165** | 120 | 25 |
| 2026-09-04 (`previous.json`) | 427 | 243 | 166 | 121 | 25 |
| 2026-09-03 | 424 | 241 | 164 | 120 | 25 |
| 2026-09-02 | 421 | 240 | 161 | 118 | 25 |
| 2026-09-01 | 420 | 238 | 161 | 118 | 25 |
| 2026-08-31 | 396 | 221 | 152 | 118 | 25 |
| 2026-08-30 | 396 | 221 | 152 | 118 | 25 |
| 2026-08-29 | 396 | 221 | 152 | 118 | 25 |
| 2026-08-28 | 388 | 212 | 148 | 118 | 25 |

**The 165 in DESK-ORDER-001 §4 and in `addictedtoai-c563` is the non-empty
count, not the carrier count.** 243 rows carry the key; 78 of those carry an
empty array. Both figures are recorded in the registry note so the next reader
does not have to re-derive which one a stated number meant. Entry shape is
`{arena, category, elo, rank, win_rate}`; 1,577 entries in the 2026-09-05
snapshot across two arenas (`models`, `agents`); the pair count has been 25 in
every committed snapshot.

## The direct check: does any value render today?

Run after the registry edit, on the built site:

- `benchmarks.design_arena` appears in neither the source's `yields` nor its
  `material_fields`, so no catalog column, entry-page fact or changed-feed line
  exists for it.
- `npm run build` (exit 0), then `tools/scan-out-for-design-arena.mjs`, which
  reads **every** file under `out/` — 1,412 files, 32,009,793 bytes, no
  sampling and no `head`, so the zeros are exhaustive:

  | token | occurrences | files |
  |---|---|---|
  | `design_arena` | 0 | 0 |
  | `designarena` | 0 | 0 |
  | `Design Arena` | 0 | 0 |
  | `DesignArena` | 0 | 0 |
  | `winRate` | 0 | 0 |
  | `win_rate` | **19** | 6 |

  The 19 `win_rate` hits are **not** this feed and are reported rather than
  filtered: they are two hand-authored cited facts —
  `technique/proximal-policy-optimization#win_rate` ("175B InstructGPT outputs
  are preferred to 175B GPT-3 outputs 85 ± 3% of the time", cited to
  arXiv 2203.02155) and `event/alphago-lee-sedol#cyclic_adversary_win_rate` —
  rendered as `data-field="win_rate"` and `data-field="cyclic_adversary_win_rate"`
  in the two pages plus the dataset exports. `elo` was deliberately **not**
  scanned as a token: it is a substring of "below", "develop" and "modelo", so
  it would have produced hits that mean nothing, and the four Design-Arena-
  specific tokens answer the question without it.
- The values *are* present verbatim in `data/derived/feed-rows.json` (245
  occurrences of the key), which is a committed derived file and not a served
  one. Noted because "not rendered" and "not present in the repository" are
  different claims and only the first is true.

## Ruling out the instrument

Required before any absence is reported (`CLAUDE.md`):

- Every quotation recorded in the registry row was checked back against the
  **fetched bytes**, not against a stripped rendering, by
  `tools/check-quotes.mjs` — 19 fragments, all PRESENT.
- One fragment first read as ABSENT: the apply form's checkbox sentence. It is
  in the document, split by `<strong> Design Arena</strong>` and an `<a
  href="https://designarena.ai">designarena.ai</a>`, so the whole sentence
  never occurs as one run of bytes. Two fragments that straddle no markup carry
  it, and the check now uses those. **The instrument was wrong, not the
  document** — recorded because the naive finding here would have been
  "unsupported quote".
- WebFetch's extractor was not used as evidence in either direction; every
  document was fetched by `node:fetch` and searched locally.

## What changed in the repository

- `data/sources/registry.json` — a new `field_rights` list on the
  `openrouter-models` source (with a `field_rights_note` saying what the list
  is and, more importantly, what it is **not**: a rights answer is not a
  carriage decision, and `material_fields` remains the only list that makes
  anything render), carrying one entry for `benchmarks.design_arena` with the
  publisher, the `checked_on` date, the result, the two conditions, the four
  documents with their fetch dates and quotes, and the measurement above.
- `data/reviews/evidence/verify-design-arena-republication-terms.md` — this
  narrative; `.raw.txt` — the run transcript.
- `tools/measure-design-arena.mjs`, `tools/measure-design-arena-history.mjs`,
  `tools/check-quotes.mjs`, `tools/fetch-design-arena-terms.mjs`,
  `tools/strip-body.mjs` — the scripts that produced every number and every
  quote check above, kept so the run is reproducible rather than described.

No value was registered as material and nothing was made to render. The next
step, if the maintainer wants these numbers on the board, is stated in the
registry note: a key (or a written statement that the grant covers relayed
data), then an attribution mechanism, and only then the materiality question
that `benchmarks.artificial_analysis` answered "no" to on its own measurements.
