# Tasks

Every normative sentence in the delta has a task that builds it and a task that
measures it. The mutation proofs are named individually rather than as one
sweep: a mechanism nobody has broken on purpose is a mechanism nobody has
tested.

## The census registry

- [ ] 1. `lib/census.mjs` (new): the closed census registry — one frozen table
      of census ids, each naming its source and exactly one predicate — and the
      five predicate kinds as a second frozen constant: every row; a declared
      dotted path present (neither null nor empty); a declared dotted path
      exactly true; a row id ending in a declared literal; providers whose row
      count is at least a declared number. **One definition in the source
      tree**, beside `lib/units.mjs` and `lib/domains.mjs` and for the same
      reason: two lists of the same predicates drift, and the drift is silent.
      Seed it with the censuses the corpus already states in prose — total
      rows, rows carrying a `hugging_face_id`, rows whose
      `top_provider.is_moderated` is true, rows carrying an `expiration_date`,
      rows whose id ends `:free`, rows whose id ends `:batch`, and providers
      with at least N rows.
- [ ] 2. `lib/census.mjs`: `countCensus(id, scope, dataLayer)` — resolves a
      census id against the registry, applies its predicate over the named
      source's current rows, and returns the count, the snapshot date it was
      counted in, and which of the four outcomes it is: counted, zero, no data
      layer, or scope-matches-nothing. One function, so the fact renderer and
      any later consumer cannot disagree about what a census means.

## The census fact

- [ ] 3. `lib/schema.mjs`: add a third member to the fact union —
      `source: 'census'` with `field`, `feed`, `census` and an optional
      `scope`, `.strict()` like its siblings, so `value`, `source_url`,
      `accessed` and `volatility` are rejected by strictness rather than by a
      hand-written refusal. Confirm by test that strictness is what does it;
      a refusal that depends on a separate branch is a refusal that can be
      deleted without a failing test.
      **Classify the two new string-valued fields in the same edit** or the
      build fails before a file is read: `classificationProblems`
      (`lib/schema.mjs:1025`) rejects any string-valued schema field in neither
      `PROSE_FIELDS` nor `NON_PROSE_FIELDS`, and `assertFieldsClassified` runs at
      `lib/build-content.mjs:97`. Add to `NON_PROSE_FIELDS.entry` (line 852):
      `facts[].census` — 'a census id from the closed registry' — and
      `facts[].scope` — 'a provider prefix — a row-id segment, not a sentence'.
      `facts[].feed` is already classified and needs nothing.
- [ ] 4. `lib/schema.mjs`: a refinement rejecting a census fact whose `census`
      id is absent from the registry and one whose `feed` is not the source
      that census names, each naming the entry, the field and the offending
      value. Schema validation runs in the `content` prebuild step, which
      already reports file and field, so this needs no new step.
- [ ] 5. `lib/facts.mjs`: a `census` branch in `resolveFact` and `renderFact` —
      the count, the source element naming the source and the snapshot date it
      was counted in, no overdue marker and no as-of hedge. `0` renders as `0`;
      no data layer renders absent; a scope the snapshot matches on no row
      renders absent. Every branch emits a source element, as every existing
      branch does.
- [ ] 6. `pulse/lib/queue.mjs`: the repair finding for a scope that matches
      nothing, as a **computed** item class — `censusScopeItems(root)`, beside
      `vanishedRowItems` and `curriculumGapItems` and pushed into
      `computeQueue`'s list the same way, reading each entry's `facts` through
      `pulse/lib/corpus.mjs` (which already carries `facts`) and the provider
      prefixes of each named source's `latest` snapshot. **The derived queue is
      the Pulse's**, recomputed from state every run; `lib/facts.mjs` is the
      build and cannot put an item in it, so the producer lives here and the
      renderer's only job is to render absent. Type `repair` — already in
      `QUEUE_PRODUCIBLE_TYPES`, so **no `pulse` delta is needed** — reason
      `census-scope-unmatched`, with its own `RANKS` entry at **81**, between
      `slug-collision` (82) and `suspect-source` (80): it is the same thing both
      of those are, a corpus/world mismatch measured today, and a page rendering
      absent where it should render a number outranks a source that has merely
      gone quiet. One item per (entry, scope), naming both.
      **Computed, not a durable record, and that is the whole of the choice.**
      `vanishedRowItems` reads `data/vanished/` because a withdrawn row is
      absent from the snapshot forever, so a computed form could never retire
      and re-dispatched finished work at rank 85 (addictedtoai-u0n5). A mistyped
      prefix is the opposite case: the fix is an edit to the entry's own `scope`,
      after which the item must disappear by recomputation with no record to
      delete. Never a silent `0`.

## The tests that make the census a mechanism

- [ ] 7. Tests beside `lib/census.mjs`, one per predicate kind, over a pinned
      fixture snapshot: a known count for each of the five kinds, and each kind
      again with a provider scope (except the providers kind, which takes
      none). Pinned fixtures, not the live snapshot — a test that reads
      `data/sources/` changes its own expected values every morning. One of the
      scoped cases MUST use a provider whose prefix matches neither the
      entry's id nor its display name — `z-ai` on an entry displayed as `Z.ai`,
      or `mistralai` on `org/mistral-ai`, both real today — so that a later
      implementation that quietly infers the prefix from the entry fails here
      rather than on the corpus.
- [ ] 8. Tests beside `lib/schema.mjs`, one per refusal, each asserting the
      field named in the error: a census fact carrying `value`; one carrying
      `accessed`; one carrying `volatility: fast`; one naming an unregistered
      census id; one whose `feed` disagrees with the census's own source. Plus
      the controls without which those prove nothing: a valid census fact
      validates and round-trips, and a `cited` and a `feed` fact each validate
      exactly as before. Plus the control the existing "A new field cannot
      arrive unclassified" requirement asks for: `classificationProblems()`
      returns `[]` after the schema change.
- [ ] 9. Tests beside `lib/facts.mjs` for the four render outcomes, asserted on
      the rendered markup rather than on the resolver's return: counted (value
      plus source plus snapshot date), zero (`0`, not absent), no data layer
      (absent, not `0`), scope-matches-nothing (absent). The zero-versus-absent
      pair is the point of the test and must be two separate assertions. The
      queue item is **not** asserted here: this test sits beside `lib/facts.mjs`,
      which cannot observe the derived queue — task 10 is where that is measured.
- [ ] 10. A test in `pulse/tests/queue.test.mjs` for `censusScopeItems`, over a
      pinned fixture corpus and snapshot: one `census-scope-unmatched` item per
      (entry, scope) whose prefix no row carries, naming the entry and the scope;
      **none** once the scope matches a row, which is the retirement condition
      and the half a durable-record route could not have; and none for a census
      declaring no scope at all.
- [ ] 11. Mutation proof, three mutations run separately: make
      scope-matches-nothing return `0`, and confirm only the scope test fails;
      make the no-data-layer branch return `0`, and confirm only that test
      fails; drop the snapshot date from the census source element, and confirm
      the source-reachability test fails. Three mutations failing disjoint sets
      is the evidence these are three mechanisms rather than one described
      three times. Restore and verify each file byte-identical by hash.
- [ ] 12. An end-to-end test that a census transclusion renders in prose through
      `{{fact:<kind>/<slug>#<field>}}` with no change to `lib/transclude.mjs`,
      and that advancing the fixture snapshot changes the rendered number with
      no file edited and no build error. That second half is the requirement's
      whole claim; without it the change is untested where it matters.

## The timeline binding

- [ ] 13. `lib/schema.mjs`: the two timeline forms. `source` optional, absent
      meaning `cited`, so all 285 existing events validate untouched — see
      `design.md` §6 for the `discriminatedUnion` hazard this walks into if the
      discriminator is assumed present. The feed form declares `event`,
      `source`, `feed` and `path` and **no `date`**; strictness rejects a
      `date` beside a binding, and the error names the entry and the event.
      **Classify the three new string-valued fields in the same edit**, for the
      reason task 3 gives: add to `NON_PROSE_FIELDS.entry` `timeline[].source`
      ('a discriminator literal'), `timeline[].feed` ('a source id') and
      `timeline[].path` ('a dotted path into a feed row'). `timeline[].date`,
      `timeline[].event` and `timeline[].source_url` are already classified.
- [ ] 14. `lib/schema.mjs` or the corpus loader: reject a feed-bound event whose
      `feed` is absent from the entry's own `feeds` map, naming the entry and
      the event. The join is declared or it does not exist.
- [ ] 15. Resolve the timeline once, in `lib/build-content.mjs` **phase 2** —
      after `loadDataLayer()` (line 106) and before the `for (const doc of
      corpus.entry)` loop (line 130), so `indexability` (153), `renderTimeline`,
      `dataset.timelineRows` and `dormantAsOf` all read resolved events. **Not
      in `loadCorpus`**: its options are `{contentRoot, diags, checkReferences}`
      (`lib/corpus.mjs:347`), it has no data layer, the layer is loaded six lines
      after it, and it has 22 other callers — `scripts/verify-launch.mjs`,
      `scripts/check-post-voice.mjs`, `lib/arxiv-pin.mjs`, `lib/anchors.mjs`,
      `lib/declined-fields.mjs` and the fixture tests among them — that build no
      data layer at all. Resolution rewrites `doc.data.timeline` in place, which
      is what carries it to `site-assets.mjs:181`'s `timelineRows(site.corpus)`
      without a signature change anywhere. Each event becomes `date`, `event` and
      a reachable source, the feed-bound date computed as the UTC calendar date
      of the instant at `path`. **A feed-bound event's source is the named
      source's registry `url`** (`data/sources/registry.json`, e.g.
      `openrouter-models` → `https://openrouter.ai/api/v1/models`) written to
      `source_url`, so `lib/dataset.mjs:95` reads a filled column for both forms
      and the export gains no column. A vanished row resolves to its last-known
      instant, marked as-of, and the event stays on the timeline. No consumer is
      taught the two forms.
      If a later caller genuinely needs resolution without phase 2, give
      `loadCorpus` an **optional** `dataLayer` and state in this task what a
      feed-bound event resolves to when none is passed — do not change the
      signature's required shape.
- [ ] 16. Confirm by reading, not by assuming, that the four consumers measured
      in the proposal — `lib/render/entry.mjs`'s sort, `lib/dataset.mjs`'s
      export, `lib/facts.mjs`'s dormant stamp and `lib/indexability.mjs`'s
      count — need no edit once resolution runs first, and record in the task
      list which of them did need one if any do.

## The tests for the timeline binding

- [ ] 17. Tests beside `lib/schema.mjs`: a cited event with no `source` key
      validates unchanged (the backward-compatibility control, and the most
      important test here); a feed-bound event validates; a feed-bound event
      carrying `date` is refused naming the event; an event naming a source the
      entry does not join is refused naming the event. And the same
      classification control as task 8: `classificationProblems()` returns `[]`
      after the timeline schema change.
- [ ] 18. A resolution test over a pinned fixture: a feed-bound event resolves
      to the UTC calendar date of the row's instant, and the same instant read
      in a non-UTC zone resolves to the same date — run with `TZ` set either
      side of UTC, because a zone-dependent date is the defect this convention
      exists to prevent.
- [ ] 19. A vanished-row test: the event keeps its last-known date, renders the
      as-of marker, and is still present in the rendered timeline and in the
      exported dataset row — asserting that row's `source_url` **column value**
      is the source's registry `url`, not merely that the row is present. The
      repair finding here is the **existing** `vanished-feed-row` item the
      entry's own `feeds` declaration already produces through
      `data/vanished/`; this change files no second item for it, and the test
      asserts no new queue item.
- [ ] 20. Mutation proof, two mutations run separately: resolve the instant in
      local time instead of UTC and confirm only the zone test fails; drop the
      event from the timeline when its row has vanished and confirm only the
      vanished-row test fails. Restore and verify byte-identical by hash.

## The reviewer's checklist

- [ ] 21. `loop/lib/review.mjs`: the prose checklist item gains the census case
      — a row count typed as a numeral where a census fact could carry it is
      rejected as `spec-violation` naming the census that would have carried
      it, and a date beside the numeral does not clear it. A reviewer receives
      no spec text of its own, so a rule that is not in the checklist is a rule
      no reviewer applies. Tested in `loop/tests/` by the same shape the blog
      bar tests use.
- [ ] 22. `loop/lib/brief.mjs`: the authoring brief for entry and prose work
      names the two bindings and when each applies — a count is a census fact,
      a catalog listing date is a bound timeline event — because a Desk job is
      one written prompt in and files out, and an untold job cannot know.

## Gates

- [ ] 23. `openspec validate bind-what-the-catalog-knows --type change --strict
      --no-interactive`, and `node scripts/check-spec-deltas.mjs --strict`. Run
      at drafting time.
- [ ] 24. `npm test`, `npm run build`, `verify-launch`, `verify-design`,
      `verify-surfaces`, `verify-analytics`.

## Not tasks here, recorded so they are not read as omissions

- **Migrating the 18 hedged census claims** measured in the proposal. Prose
  work against a built mechanism, and it belongs to whoever takes it with the
  census facts in hand — including the two claims that fail the build at the
  next snapshot advance, which are a repair either way.
- **The Pulse's mechanical lifecycle appends** stay cited and go on citing the
  source's own URL; their date is an observation, not a row field. That 16 of
  them cite an endpoint that states no date is a finding needing its own issue.
- **The retirement and arrival event kinds** are `addictedtoai-4lrp`.
- **The check's regex blind spots** are `addictedtoai-3liq` and
  `addictedtoai-gd28`; the unbound cross-row price ratio is
  `addictedtoai-r4m`. None is closed by anything here.
