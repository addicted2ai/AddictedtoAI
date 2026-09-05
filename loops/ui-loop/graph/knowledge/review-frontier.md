# Independent review — `frontier-plan.md`

Reviewer: sealed independent agent. Own view written first and unedited at
`review-independent-view.md`; the plan was not read until that file was closed.
Every number below was re-measured by this reviewer, from the repository, with
scripts in this scratchpad (`review-probe-snapshot.mjs`,
`review-verify-claims.mjs`, `review-census-scan.mjs`). Nothing in
`D:/AddictedtoAI` was created, edited or deleted; no build or test was run.

---

## 1. VERDICT

**Build with changes.**

The single reason: **the plan claims immutability for a file it does not own.**
`data/changes.jsonl` is edited in place, today, by other job types — the
repository's own open proposal records two such edits approved and merged
within twenty-four hours this week — so "an append-only record, never
rewritten" is a property of `pulse/lib/frontier.mjs`'s code path, not of the
timeline. Phases 1 and 3 are sound as written. Phase 2 needs a mechanism
before it ships.

This is a good plan. It is measured rather than asserted, it cites files and
lines that check out, it declares its guesses, and its three or four sharpest
observations are things I did not find in my own sealed pass. The changes
below are corrections to a plan worth correcting, not reasons to abandon it.

---

## 2. CLAIMS VERIFIED

### (a) THE SAFETY CLAIM THE WHOLE FEATURE RESTS ON — **CONFIRMED**

> *"`/frontier` is a `page.tsx` placing a rendered fragment... It is not a
> corpus doc, so `checkSnapshotCensus` never sees it."*

Verified directly, three ways:

- `lib/snapshot-census.mjs:522-524` — `checkSnapshotCensus` returns
  `{scanned: 0, …}` for anything whose `doc.type !== 'entry'`.
- `lib/build-content.mjs:250` — the loop that calls it iterates `corpus.all`,
  which is loaded from `content/`. There is no path by which a `.tsx` file
  becomes a corpus doc. `warnCurrencyLiterals` (`:276`),
  `checkPriceAttribution` (`:251`) and `checkDayGapAttribution` (`:262`) sit
  inside the same loop and inherit the same blindness.
- The precedent the plan cites is real: `app/impossible-routine/page.tsx`
  carries three paragraphs of authored prose and no check reads any of it,
  which `app/sitemap.ts:128-133` states in as many words ("hand-written
  components with no corpus doc, no front matter and no entry in
  `reviewablePieces()`").

**The feature will not turn the build red every midnight.** That is settled.

**But the claim is true in a way that should worry you, and the plan does not
say so.** `/frontier` is not census-safe because it satisfies the guardrail; it
is census-safe because it is *outside* it. The plan's protection against that
is a discipline ("zero authored prose beyond fixed template copy"), and
discipline is the thing this repository refuses to accept everywhere else.
Nothing stops a future editor typing *"111 of the 323 listed base rows carry an
intelligence index"* into `app/frontier/page.tsx`'s lede. That sentence is the
exact defect `snapshot-census.mjs` exists for, it rots within a day (I measured
the eligible count moving 321 → 319 → 318 → 321 → 323 in eight days), and **no
check in this repository can see it.**

Cheap fix, and it belongs in Phase 1: a unit test asserting that the fixed copy
in `lib/render/frontier.mjs` and `app/frontier/page.tsx` contains no digit run
of two or more characters outside interpolated values. Two lines of test, and
it converts the plan's discipline into a mechanism.

### (b) The OpenRouter payload — **CONFIRMED, with one imprecision**

Measured on `data/sources/openrouter-models/latest.json`, 2026-09-04:

| Plan says | Measured | Verdict |
|---|---|---|
| 427 rows | 427 | CONFIRMED |
| `benchmarks` object on 243 rows | 243 | CONFIRMED |
| `benchmarks.artificial_analysis` on 181 rows | 181 | CONFIRMED |
| 164 with a numeric `intelligence_index` | 164 (coding 181, agentic 166) | CONFIRMED |
| `benchmarks` absent from `yields` and `material_fields` | absent from both | CONFIRMED |
| 29 model entries bind it as `source: feed` facts | 29 files, all under `content/wiki/model/`, all with a `facts[].path:` binding | CONFIRMED |
| `design_arena[]` "on 243" | the **key** is on 243; the array is **non-empty on 166** | imprecise |
| 111 of 323 eligible rows carry an intelligence index | 111 of 323 | CONFIRMED |

The `design_arena` imprecision is small but it is the kind that matters here:
77 rows carry an empty array, so "243 rows carry design_arena" overstates the
usable data by 46%. The plan's recommendation to leave it out of Phase 1 is
right regardless.

### (c) The `benchmark` kind exists with zero files — **CONFIRMED**

`lib/schema.mjs:36-47` lists `benchmark` in the closed `KINDS`.
`content/wiki/benchmark/` does not exist at all (`ENOENT`), so: zero files.

### (d) The lead change is recoverable from the eight committed snapshots — **CONFIRMED, exactly**

I replayed all eight blobs myself via `execFileSync('git', ['show', …])` and
applied the plan's own eligibility rule (`:` / `^openrouter/` / `^~` /
`alias_target`):

```
2026-08-28 rows=388 eligible=321  intelligence anthropic/claude-opus-5=63.1 (n=108)
2026-08-29 rows=396 eligible=319  … opus-5=63.1
2026-08-30 rows=396 eligible=319  … opus-5=63.1
2026-08-31 rows=396 eligible=319  … opus-5=63.1
2026-09-01 rows=420 eligible=319  … opus-5=63.1 (n=109)
2026-09-02 rows=421 eligible=318  … anthropic/claude-fable-5.1=65.7 (n=110)
2026-09-03 rows=424 eligible=321  … fable-5.1=65.7
2026-09-04 rows=427 eligible=323  … fable-5.1=65.7
```

Opus 5 led all three indices at 63.1 / 78.0 / 59.2 through 2026-09-01; Fable
5.1 took all three in the 2026-09-02 snapshot at 65.7 / 81.6 / 61.3. **Every
digit in the plan's §0.2 matches.** One lead change in eight days.

The rescoring measurement (§0.3) also matches exactly: between 2026-09-03 and
2026-09-04, exactly one row's indices moved, and it moved down —
`qwen/qwen3.8-max` 58.1→53.4, 71.8→68.9, 58.4→49.9.

The eligibility breakdown (§0.5) matches exactly: 85 colon-suffixed, 13 `~`
rows, 13 rows carrying `alias_target` (the same 13), 6 `openrouter/*`, 323
eligible. Context leaders after exclusion: `x-ai/grok-4.20` and
`x-ai/grok-4.20-multi-agent` tied at 2,000,000 — and `openrouter/auto`,
`openrouter/auto-beta` and `openrouter/pareto-code` all report 2,000,000, so
the plan is right that an unfiltered context table puts a router first.

### (e) Other claims checked

| Claim | Verdict | Evidence |
|---|---|---|
| The census check "discriminates nothing on today's corpus" (16/16 hedged) | **CONFIRMED and stronger** | I re-ran `scanSnapshotCensus` over all of `content/wiki/` against snapshot `2026-09-04`: **18 scanned, 18 hedged, 0 hits, 10 docs.** Two more since the plan measured. Note the plan's framing is tendentious: the check discriminates nothing *because it already forced every census into the hedged form*, which is it working, not it idling. |
| `uncoveredEvents` hands the scout every uncovered line "with no code change" | **CONFIRMED** | `pulse/lib/queue.mjs:321-328` filters out only `kind === 'annotation'`. Any new kind flows through. This is the plan's strongest single argument and it is correct. |
| `uninterpretedChanges` filters `kind === 'field_change'`, so no `interpret` job is spawned | **CONFIRMED** | `pulse/lib/diff.mjs:392-404`. |
| `appendChanges` is idempotent by key | **CONFIRMED** | `diff.mjs:334-345` — reads existing keys, skips known, appends only. It never rewrites. |
| `isEngineWrite` already covers `data/derived/` and `data/changes.jsonl` | **CONFIRMED** | `pulse/lib/publish.mjs:196-201`. |
| `MATERIAL_KINDS` "gains the two kinds if the feed filters on it" | **CONFIRMED that it does not filter** | `MATERIAL_KINDS` is exported at `lib/changes.mjs:35` and imported **nowhere**. `changedFeed` (`:200`) filters only `kind !== 'annotation'`. So the new lines reach the home page and `/catalog/changed` automatically — which is what the plan wants, but it happens whether or not anyone decides it should. |
| Adding a job type is expensive; a queue reason is cheap | **CONFIRMED** | `JOB_TYPES` closed at `loop/lib/config.mjs:24-35`; `verify` and `entry` are both in `QUEUE_PRODUCIBLE_TYPES` (`queue.mjs:87-94`). |
| `verify` acceptance already requires executed re-fetching and evidence under `data/reviews/evidence/` | **CONFIRMED** | `loop/lib/brief.mjs`, `ACCEPTANCE_BY_TYPE.verify`; the directory exists with five records in it. |
| The substring-verification house norm | **CONFIRMED** | `brief.mjs` GROUND_RULES: "A number that lives only inside a chart image will never pass a substring search — record that, never 'correct' it"; "WebFetch's extractor... is not evidence in either direction." The plan's `text`/`figure` split encodes this faithfully. |
| Derived outputs are exempt from per-run review | **CONFIRMED** | `openspec/specs/review/spec.md:26-30`. |
| A new surface requires an OpenSpec change | **CONFIRMED** | `specs/loop`, "Routine work never touches OpenSpec": a change is required "exactly when a rule changes: any edit under `openspec/specs/`…". |
| `specs/education-static` forbids benchmark scores as literal prose on learn pages | **CONFIRMED** | "No model names, prices, versions, vendor rankings, or benchmark scores as literal prose." The plan's risk #8 is right. |
| `created` is an epoch integer needing an adapter | **CONFIRMED** | `typeof created === 'number'` (1771881306); `pulse/lib/core.mjs` `daysSince` parses ISO strings or `new Date(text)`, and `new Date("1771881306")` is not a date. The plan named this itself. |
| `getPath` exists and is what `materialValue` uses | **CONFIRMED** | `pulse/lib/core.mjs:230-239`. |
| Missing feed values render absent, never fail | **CONFIRMED** | `lib/facts.mjs:143-152` — an unresolvable path returns `state: 'absent'` with **no diagnostic of any kind**. |
| The alphabetical-fallback ordering rule applies to a fourth standing table | **REFUTED** | `specs/directory`'s alphabetical-alternative requirement is scoped to the **tools directory** ("The tools directory is grouped by the job each tool does"), not to standing tables. `/catalog` ranks without one. I had expected this to be a conformance gap in the plan; it is not. The plan is right and my sealed view over-applied the rule. |
| The `frontier` registry block is "maintainer / orchestrator" owned | **REFUTED as a mechanism** | `RESERVED_PATHS` (`loop/lib/brief.mjs:19-24`) is exactly `openspec/specs/`, `data/config.json`, `runners.yml`, `STOP`. **`data/sources/registry.json` is not reserved.** Any Desk job may edit it. See §5.6. |
| `TABLE_SCHEMA_VERSION` stays 1 because a new payload is a new file | **CONFIRMED on the letter, strained in spirit** | `lib/asset-routes.mjs:129-157` — the additive rule is exactly as the plan states. But one number already stamps three differently-shaped payloads, and `specs/directory` says "Payloads describing different shapes SHALL carry independent version numbers." Inherited tension, not created by this plan; the frontier payload's nested `metrics[]` shape strains it further than the three catalog-like tables do. Worth one line in the `directory` delta. |

**UNVERIFIABLE:** whether Artificial Analysis permits fetching (the plan's own
§5.3 flags this; I was forbidden network access, so I confirm only that the
plan is right to call it unverified). Whether `next build` behaves identically
on Vercel for a page reading `data/derived/frontier.json` — I did not build,
for the same reason the plan did not. Whether the AA indices carry a
measurement date anywhere upstream (the plan's GUESS in §9.2): I confirm the
**feed** carries no such field, which is as far as this repository can settle
it.

---

## 3. WHAT MY SEALED VIEW FOUND THAT THE PLAN MISSED

These are the highest-value items in this review. Five, in order of severity.

### 3.1 Immutability is asserted, not mechanised — and the file is shared

The plan's §6.2 offers four guarantees. Read closely, none of them prevents a
line being rewritten:

1. *"Keys are a function of state alone"* — prevents **duplicates**, not edits.
   Verified: `appendChanges` skips known keys. Correct, and irrelevant to
   immutability.
2. *"No code path edits or deletes a line."* This is true **of
   `pulse/lib/frontier.mjs`** and false of the file. `interpret` jobs write
   into `data/changes.jsonl`, and `data/proposals/settle-what-append-only-
   means-for-changes-jsonl.md` — which the plan cites, in this very section —
   records that on 2026-09-04 two approved repair jobs **rewrote existing
   annotation lines in place**, one of them at `changes.jsonl:164`, and that
   merged practice now contains both shapes with no written rule separating
   them. The plan's response is to propose a *sentence* for `specs/pulse`. A
   sentence is the thing this repository says is not a guardrail.
3. *"Committed every run"* / *"Git is the audit."* Auditability after the fact
   is not immutability. Nobody diffs `changes.jsonl` line-by-line across 174
   lines every morning, and the plan's own evidence is that two in-place edits
   passed **review** without anyone treating them as violations.
4. *Test (f) — "deleting the appended line and re-running restores it."* This
   only holds for the line derivable from the **current** `previous`/`latest`
   pair. Delete a line from five days ago and re-run: nothing is restored,
   nothing fails, and the timeline is silently shorter. I state this as a
   prediction from reading `appendChanges` and `runSource`, not a measurement —
   but it follows directly from `appendChanges` writing only what the standing
   diff produces.

**The fix, and it is small.** Give each frontier line a `prev` field carrying
the SHA-256 of the previous frontier line's canonical JSON, and add one
prebuild STEP that walks the chain and **fails the build** naming the first
line that does not verify. Editing line 40 then turns the build red, and the
publish step runs after the rebuild, so a tampered timeline publishes nothing.
That is a mechanism. Roughly forty lines and one test.

If the chain is judged too heavy, the alternative is my sealed view's original
answer — put the timeline in its own file (`data/frontier.jsonl`) that only the
Pulse writes and that is added to `RESERVED_PATHS`. That costs the scout join
(see §4.2), which is a real loss. **The chain is better, because it keeps the
join and gets the mechanism.**

### 3.2 Observation gaps collapse the timeline, silently, and it is dated wrong

I read `pulse/lib/sources.mjs:277-300`: `previous.json` is written **only when
`rowsHash(latest) !== rowsHash(snapshot)`**. So `previous` is not "yesterday" —
it is *the last fetch whose rows differed*. A run can be skipped entirely: a
`STOP` file exits at `pulse/run.mjs:79-80`, the machine can be off, the source
can refuse.

Concrete failure. The lead passes A→B on day D-2 and B→C on day D-1. The Pulse
does not run on D-2 or D-1 (STOP present for a maintainer's weekend). On day D
it fetches: `previous` is the D-3 snapshot, `latest` is D. The frontier module
emits **one** `lead-change` line, `A → C`, dated **D**.

Three things are then wrong at once, permanently, in a file whose selling point
is that it is never rewritten: B's tenure as leader never existed; the change
is dated two days after it happened; and the timeline's *pace* — the exact
thing the maintainer asked the surface to demonstrate — is understated by a
factor of two. Nothing anywhere records that days D-2 and D-1 were not
observed.

**The fix, also small.** Every line carries `observed_between: ["<previous.date>",
"<latest.date>"]`, and the renderer says *"between 2 and 4 September"* whenever
those are not adjacent days instead of *"on 4 September"*. Optionally, a
per-source observation ledger so the page can state its own coverage. This
costs two fields and one branch and it is the difference between a timeline
that measures pace and one that measures the Pulse's uptime.

### 3.3 The lines will move wiki entries' `lastmod` and `dateModified` — which contradicts the plan's own decision to keep `benchmarks` out of `material_fields`

`lib/sitemap-dates.mjs:52-66`, `buildChangedOnMap`, builds `entry id → newest
changed-feed line date` from **every** line the home feed carries with an
`entry.id`. `factsMovedOn` then uses that as "the newest material change in
anything this page renders." And `scripts/verify-surfaces.mjs:631-638` asserts
`dateModified === <lastmod>` on every indexable page — labelled, in the
codebase's own words, *"one definition of 'changed' (addictedtoai-8ho), two
surfaces."*

The plan sets `row_id: "anthropic/claude-fable-5.1"` on every `lead-change`
line. Consequence:

- Take the plan's own `cause: withdrawn` case. A leaves the snapshot; B becomes
  leader without B's own values moving at all. A `lead-change` line is written
  with `row_id: B`. **B's wiki entry gets a fresh `<lastmod>` and a fresh
  `dateModified` for an event in which nothing about B changed.** That is
  precisely the lie `app/sitemap.ts`'s own header says the file exists to
  refuse.
- More structurally: the plan deliberately does **not** add `benchmarks` to
  `material_fields`, which is the site's single declaration of what counts as a
  material change (the registry's `material_fields_note` says so explicitly).
  Routing an index-derived event through `changes.jsonl` makes it material via
  the back door, for the sitemap and the JSON-LD, while the registry says it is
  not. The site would then hold two answers to "did this page change" and
  `verify-surfaces` would enforce the wrong one.
- And the line is about **two** models. Only the winner's entry is touched; the
  entry that *lost* the lead — the more newsworthy half — gets nothing.

**The fix:** either omit `row_id` on frontier lines (accepting that they render
without an entry link, which `lib/changes.mjs` already supports — "a change
whose row no entry declares still renders"), or exclude the derived kinds from
`buildChangedOnMap`. Either is a one-line change, but it is a change the plan
does not budget and a `sitemap.test.mjs` assertion it will trip.

### 3.4 `cause` conflates two opposite events under one word

The plan's §0.3 motivation is exactly right: *"A timeline that says 'X overtook
Y' when Y was re-scored downward is lying."* Its own remedy re-creates a
smaller version of the same lie.

`cause: rescored` is defined as *"the old leader's value fell **or** the new
one's rose, with both present."* Those are opposite events:

- A stays at 65, B rises 60 → 66. Emitted as `rescored`. A reader sees "the
  lead changed because of a rescoring" and infers A was marked down. **A never
  moved.**
- A falls 65 → 59, B stays at 60. Also `rescored`. Now the inference is right.
- Both move. Undecidable, and one label is asserted anyway.

**The fix:** stop encoding a cause as a three-value enum and record the
arithmetic instead — `from: {row, before, after}`, `to: {row, before, after}` —
and let the renderer describe what the four numbers show. `arrival` and
`withdrawn` stay, because those are facts about presence rather than judgments
about causation.

### 3.5 The dependency can vanish and nothing anywhere will say so

`lib/facts.mjs:143-152`: a `source: feed` fact whose path does not resolve
returns `state: 'absent'` and produces **no diagnostic**. `benchmarks` is not
in the registry's `yields`, is not in `material_fields`, and the registry's
`verification` block (dated 2026-08-28) does not mention it.

So: if OpenRouter removes `benchmarks` tomorrow, 29 wiki entries silently lose
three facts each, `scored(S, m)` is empty for three of the four metrics, and
`/frontier` renders "no listed row currently carries this index" — which the
plan presents in §7 as graceful degradation. It is not graceful; it is
undetectable. The site's newest headline surface goes blank and nothing turns
red, nothing warns, and no queue item is filed.

**The fix:** a prebuild coverage floor. Record the current scored count per
metric in the registry (`"expected_scored_min": 90`); fail the build — or at
minimum file a `refusing-source`-rank queue item — when the count falls below
it. The plan's §5.4 already prints a coverage line for benchmark *facts*; this
is the same discipline applied to the thing the whole surface stands on. It is
also the natural place to hang the registry `verification` re-run the plan
should schedule anyway.

### 3.6 (Minor) The registry block's ownership is a convention

`RESERVED_PATHS` = `openspec/specs/`, `data/config.json`, `runners.yml`,
`STOP`. `data/sources/registry.json` is **not** among them, so any Desk job may
edit it. The plan's §2.3 rests its entire anti-editorialising argument on the
metric declaration being "in the registry, reviewed like any data change" and
its §3 attributes the block to "maintainer / orchestrator". Nothing enforces
that, and no review checklist asks a reviewer whether a metric set was changed.
A job could add or drop a metric — which is *choosing what the site ranks the
field by* — under the ordinary prose review gate.

I do not recommend reserving the whole registry (adding a source is meant to be
an ordinary data change). I recommend the narrow form: the `frontier` block is
covered by a build assert that its metric list matches a checked-in digest, so
changing it is a deliberate two-file act.

---

## 4. WHERE THE PLAN BEAT MY VIEW

Four places, and the first two are not close.

### 4.1 The catalog is not a list of models — §0.5

I did not think about this at all. My sealed design would have shipped a
context-window table with `openrouter/auto` at the top claiming a 2,000,000
context window it does not have, and an intelligence table listing
`anthropic/claude-fable-5.1` and `anthropic/claude-fable-5.1:batch` as two
different models with identical scores. I verified the plan's numbers (85 / 13
/ 6 / 323) and they are exact. This is the single most load-bearing measurement
in the document and it is one I missed entirely.

### 4.2 `changes.jsonl` over a separate ledger — §6.1 and §7

My sealed view argued for `data/frontier.jsonl` specifically to avoid
contaminating downstream consumers. The plan found that one of those
"consumers" is the biggest prize on offer: `uncoveredEvents`
(`queue.mjs:321-328`) filters out only annotations, so a `lead-change` line
reaches the scout's assembled context, and a post anchoring on it via `covers:`
passes the anchor check, **with no code change at all.** I verified this. It is
a genuinely better argument than mine, and it closes the loop from "the world
moved" to "someone wrote about it" for free.

My §3.3 finding shows the contamination is real too — the same decision buys
the scout join and the sitemap problem. But the plan's side of that trade is
stronger than I gave it credit for, and the sitemap problem is a one-line fix
while the scout join would have had to be rebuilt.

### 4.3 Rescoring — §0.3

"A leader can lose the lead without anything shipping" did not occur to me. It
is a genuine property of this data (measured: one row rescored downward, on all
three indices, in a single day), it changes the event vocabulary, and the plan
found it by measuring rather than reasoning. My §3.4 objection is a refinement
of an insight that is entirely the plan's.

### 4.4 The verification model — §5.3

My sealed view said a three-state verification badge whose middle state asserts
nothing is worse than an empty cell, because readers skim badges. **I have
changed my mind, partly.** The plan's `figure` is not a badge: it is a labelled
statement that the number lives in an image, with an evidence file naming the
page, caption and image URL and the verifier's own words. That is the honest
handling, it matches the house norm at `brief.mjs` verbatim, and the build check
behind `method: text` (the evidence file must exist, name the same
`source_url`, carry a `fetched:` date, contain `matched` verbatim, and
`matched` must contain the digit-run of `benchmark.score`) is a real mechanism
that I did not propose anything as good as.

**Residual objection, narrowed:** a `figure` row still publishes a structured
numeric `benchmark.score` that no mechanism ever checked, and `verification.
matched` is by definition absent for it. For `method: figure`, publish the
verbatim `value` string and the evidence link and leave `score` unset —
excluding the row from anything sortable or comparable. Then the structured
number means "checked" everywhere it appears, which is a much easier promise to
keep than a number that means "checked" in one column and "someone looked at a
chart" in another.

### 4.5 Also better than mine, briefly

- The `benchmark/*` entries as the grouping key for claimed scores: I proposed
  the same thing independently ("define the ruler before ranking with it"),
  which I take as convergence rather than a win either way — but the plan's
  version is more concrete, names the nine seed entries, and correctly routes
  them through `seed-<slug>.md` review records.
- Three provenances rather than my two, and naming the unchecked
  AA→OpenRouter hop explicitly in §5.3, is better than my two-class scheme.
- The job-type-vs-queue-reason cost analysis (§0.7) is a mechanical constraint I
  did not know and it correctly shapes §7.
- The phasing, where each phase ships alone and leaves the site coherent, is
  better articulated than my sequencing.

---

## 5. THE MOST SERIOUS DEFECT, AS A CONCRETE FAILURE

Stated as input → wrong outcome, because that is the only form worth arguing
about.

> **Input.** It is 2026-11-14. `data/changes.jsonl` holds nine months of
> frontier lines. A `repair` job is dispatched from a carried finding that a
> `lead-change` line dated 2026-09-02 names the wrong `display_name` for the
> outgoing leader. The job edits that line in place — one `-`, one `+` — exactly
> as commit `dffa630` and job `j-20260904-32` did to annotation lines on
> 2026-09-04, both of which were reviewed and merged.
>
> **What happens.** `appendChanges` is not involved, so its idempotence does not
> apply. No prebuild step reads the line. `verify-launch`, `verify-design`,
> `verify-surfaces` and `verify-analytics` do not read it. The build is green.
> The reviewer approves — the diff is one line, the correction is factually
> right, and no checklist item asks whether the line was allowed to be edited.
> The Pulse publishes.
>
> **The wrong outcome.** The surface the site advertises as *"an append-only
> record of lead changes… never rewritten"* has been rewritten, in production,
> by an approved job, with no signal of any kind. And because the plan's own
> Phase 2 test (f) only restores the line derivable from the current
> `previous`/`latest` pair, re-running the Pulse does not restore the original
> and does not detect the divergence. The record's only remaining defence is
> that someone will read the git history — which, per the proposal file, is how
> the last two in-place edits were found: by a reviewer noticing, months late,
> that the spec sentence and merged practice disagreed.

The failure is not hypothetical in its mechanism: every step of it has already
happened this week on this exact file, twice, with approval. The only thing
that has not happened yet is that the edited line was one the site had promised
never to edit.

A `prev`-hash chain and one prebuild verifier turns this same input into a red
build naming the line. That is the change I would make a condition of Phase 2.

---

## 6. WHAT I COULD NOT DETERMINE

1. **Whether Artificial Analysis permits fetching or republication.** No network
   access. The plan flags the fetch question; I add that *republication* — using
   a third party's benchmark indices as the organising spine of a public
   ranking page with a `/frontier.json` sibling under `CC BY 4.0` — is a
   distinct question from robots-allowed fetching, and the registry's
   `robots` block answers only the latter. Settle this before Phase 1, not
   after, because it decides whether the surface can exist at all.
2. **Whether Phase 2's line volume is tolerable.** One lead change in eight
   days is the only sample that exists. The plan's own §9.3 says measure for two
   weeks; I agree and cannot shorten it.
3. **Whether `next build` on Vercel handles the new derived read identically.**
   The tree was read-only and a concurrent build is forbidden; the plan is in
   the same position and says so.
4. **The exact `RANKS` numbers for the new queue reasons.** The plan marks them
   GUESS; I have no basis to improve on the ordering argument, which is sound.
5. **Whether the eligibility `:` heuristic will hold.** The plan's §9.5 is
   honest that it is a pattern in declared clothing. I confirmed it is exactly
   right on all eight committed snapshots (85 colon rows on the newest, and the
   leaders are stable across the exclusion in every one), which is eight days of
   evidence and not more.

---

## 7. RECOMMENDED CHANGES, CONSOLIDATED

**Conditions of Phase 1:**
- A test asserting no digit runs in `/frontier`'s fixed copy (§2a).
- A benchmark-coverage floor check in the prebuild (§3.5).
- Settle AA republication rights (§6.1).
- Correct `design_arena` to "166 rows carry a non-empty array" (§2b).

**Conditions of Phase 2:**
- `prev`-hash chain + prebuild verifier on the frontier lines (§3.1). **This is
  the one I would not ship without.**
- `observed_between` on every line, and a renderer branch for non-adjacent days
  (§3.2).
- Omit `row_id`, or exclude derived kinds from `buildChangedOnMap` (§3.3).
- Replace the `cause` enum with the four numbers (§3.4).

**Conditions of Phase 3:**
- `method: figure` publishes no structured `score` (§4.4).
- A build assert pinning the registry's declared metric list (§3.6).

**Also worth one line each in the OpenSpec change:** the independent-version
question for `/frontier.json` (§2e, `TABLE_SCHEMA_VERSION`), and the plan's own
risk #8 (`education-static`) which is correct and should be in the delta rather
than only in the checklist.
