# Tasks

Twelve normative bullets are added in `specs/pulse` — eight in the added
requirement, four in the modified registry requirement (26 SHALL/MUST clauses
when counted clause by clause, since several bullets state a rule and its refusal
together — two more than the round before this one: the `provider_field` split
rule in the registry bullet, and the per-key-unaffected clause in the failures
bullet, both added on this review round, once the round's own evidence showed
the source publishes no bare provider-slug field and that a companion failure
was being described as per-row while the fetch beneath it is per-key).
Each has an implementing task and a testing task below, and every testing task
names the mutation that proves it measures something.

Nothing in this change registers the companion source, re-checks a robots file,
or clears `event: false`. Those are registry data changes made on the day the
fetch is switched on; the tasks below build the shape and the bar.

## The companion fetch, and the bar in front of it

- [x] 1. `pulse/lib/registry.mjs`: validate a `companion` block on a source entry
      — a URL template, a cadence, a rule for which rows it covers, the snapshot
      it writes, `declared_on` (a local date), `canonical_tier` (the service tier
      of the companion listing this source's rates are read at), `provider_field`
      (the field of a companion-listing row that carries the provider identity —
      on this source, `tag`, since the row carries no bare provider-slug field:
      measured on the source's own `/endpoints` response,
      `data/reviews/j-20260902-01.md:93`, an endpoint is
      `{"provider_name":"Anthropic","tag":"anthropic/fast", ...}` with no field
      naming a slug alone), and `provider_identities` (the author-identity map:
      one entry per author segment this source's row ids use, each giving the
      provider slug that author posts under in the companion listing — as read
      from `provider_field` by task 2's split rule — and the local date that
      entry was declared on). Each of the **eight** is required and a block
      missing any of them throws naming the source **and the missing field**;
      write the required-field check as one list so a field added later cannot
      be validated by accident on seven of eight. Both sides of a
      `provider_identities` entry are machine keys — validation rejects an entry
      whose value is not a slug-shaped string — and nothing reads a display
      name. The covered set is expressed as a rule over the snapshot (a field
      test and a key), never as a list of ids, and validation refuses a
      hand-maintained list. Two more fields are validated separately from the
      eight, because each fails on its own argument rather than the shared
      "declaration is incomplete" one: `rates` (required — a non-empty map from
      the field name a bound rate is carried under to the path it is read from
      in a companion-listing row; a companion that binds no rate makes the same
      hundreds-of-requests-a-day cost for no value, the argument design D3
      already makes for a companion with no canonical tier) and `rows_path`
      (optional — a string naming where the listing's rows sit in the response;
      absent means the response body is itself the array). Implements: *a companion fetch SHALL declare: its URL
      template, its cadence, the rule …, `declared_on` …, which service tier … is
      canonical, the field of a companion-listing row that carries the provider
      identity (`provider_field`), and an author-identity map …*, *a declaration
      missing any of these SHALL fail the build naming the source and the
      missing field*, *both sides of every map entry SHALL be machine keys*, and
      *the covered set SHALL be computable from the snapshot alone … The build
      SHALL refuse a declaration that enumerates row ids*.
- [x] 2. `pulse/lib/registry.mjs`: export the `provider_field` split as one
      function — given a companion-listing row and the declared `provider_field`
      name, split that row's value on its first `/`: the text before is the
      provider slug; the text after, when there is one, is the tier; when there
      is no `/` the whole value is the provider slug and the tier is the fixed
      string `standard` — the reading the site's own `residual_hazard`
      measurement already uses the word for (`openai` bare at 1×, `openai/flex`
      at 0.5×, `openai/fast` at 2×). One function, so the registry's own
      validation (task 1's slug-shape check) and `derive.mjs`'s resolution
      (task 9) read a value the same way and cannot drift apart. Implements: *a
      `provider_field` value SHALL be read as the provider slug and the tier by
      splitting it on its first `/`: the text before the `/` is the provider
      slug and the text after it is the tier; a value with no `/` names the
      provider slug alone and denotes that provider's own standard tier*.
- [x] 3. `pulse/lib/registry.mjs`: refuse a `companion` declaration on three
      independent, separately-named conditions — `robots.checked_on` earlier than
      the block's `declared_on`; `robots.requests_per_day` absent; and
      `robots.requests_per_day` less than the number of **distinct keys** the
      block's own coverage rule yields when run over the source's latest
      snapshot — one companion request per key, which is what the site will
      actually spend, not the larger count of rows those keys cover.
      Nothing here reads `robots.detail`: the volume claim is the integer,
      because a build can compare an integer to a measured count and cannot tell
      a true sentence from a stale one. The refusal is a `throw` in the same
      family as the existing `declined_fields` refusals, so it fails the build
      naming the source and which condition tripped. Implements: *a companion
      fetch SHALL NOT be enabled until the source's robots/terms record has been
      re-checked at the new volume … the build SHALL refuse*.
- [x] 4. `pulse/lib/sources.mjs`: fetch the companion once per covered key, keyed
      on `canonical_slug` rather than row id (design D1 — 335 keys against 404
      rows on the committed snapshot), writing one dated snapshot per cycle
      holding only the fields the site binds. Rotation follows the existing rule:
      `previous` is replaced only when the fetched rows differ from `latest`.
      Implements: *the per-row provider listing SHALL be snapshotted like any
      other fetch*.
- [x] 5. `pulse/lib/sources.mjs`: a companion failure is per **key** — an error,
      a timeout or a refusal on one key's fetch yields an absent value, recorded
      with its date, for every row that key covers, and rows under every other
      key are unaffected. A refusal is recorded as a refusal under the existing
      rule. Implements: *a companion fetch's failures SHALL be per key and SHALL
      NOT fail the run: a key whose companion fetch errors or refuses SHALL
      yield an absent value … for every row that key covers … and every row
      under a different key SHALL be unaffected*.
- [x] 6. `pulse/tests/registry.test.mjs`: fourteen cases over one companion
      declaration. It validates when every required field is present,
      `robots.checked_on` is on or after `declared_on`, and
      `robots.requests_per_day` is at least the distinct-key count. It is
      refused, naming the source and the condition, when:
      **each of the eight required fields is omitted in turn** — the URL
      template, the cadence, the coverage rule, the snapshot, `declared_on`,
      `canonical_tier`, `provider_field`, `provider_identities` — each case
      asserting the thrown message names *that* field, so the eight are eight
      refusals and not one loop asserted once; the robots record is dated before
      `declared_on`; `robots.requests_per_day` is absent; `robots.requests_per_day`
      is one less than the number of distinct keys the coverage rule yields from
      the fixture snapshot; the block expresses its coverage as a list of row ids
      rather than a rule; and — the fourteenth — a `provider_identities` entry
      whose **value is a display name rather than a slug** (`OpenAI`, carrying a
      capital and a space), refused naming the source **and that entry**, which
      is the only test of *both sides of every map entry SHALL be machine keys*
      and the reason a rename or a lookalike cannot forge an attribution.
      Mutations: drop the date comparison and confirm only that
      refusal stops refusing; drop the count comparison and confirm only that one
      does; shorten the required-field list to `canonical_tier` alone and confirm
      exactly the other seven omission cases fail — which is the assertion that
      the eight are independent rather than one condition described eight times;
      drop the slug-shape check on map values and confirm only the display-name
      case stops refusing. Tests tasks 1 and 3.
- [x] 7. `pulse/tests/registry.test.mjs`: the split function on its own —
      `tag: "anthropic/fast"` splits to provider slug `anthropic` and tier
      `fast`; a bare `tag: "openai"` splits to provider slug `openai` and tier
      `standard`; a `tag` with leading/trailing whitespace around the slash still
      splits on the first `/` alone. Mutation: drop the no-`/` branch so a bare
      value returns no tier and confirm this test fails on the bare case while
      the tiered case still passes. Tests task 2.
- [x] 8. `pulse/tests/sources.test.mjs`: a fixture whose snapshot holds four
      priced rows over three canonical slugs issues **three** companion fetches,
      not four; one of the three errors and only the rows it covers report an
      absent value while the other two resolve; the run exits 0. The snapshot
      half, which is what makes the claim false-able later: a dated companion
      snapshot is written under the source's own snapshot directory holding
      **only** the bound fields — asserted on the written file's key set, not on
      its existence — and `previous` is replaced only when the fetched rows
      differ from `latest`, asserted by running the fixture twice unchanged and
      reading `previous` both times. Mutations: key the fetch on row id and
      confirm only the count assertion fails; rotate `previous` unconditionally
      and confirm only the rotation assertion fails. Tests tasks 1, 4 and 5.

## The vendor-posted rate

- [x] 9. `pulse/lib/derive.mjs`: resolve a vendor-posted rate for a row — split
      every entry in that row's companion listing's declared `provider_field`
      value using task 2's function, keep the entries whose tier equals the
      source's declared `canonical_tier`, and among those the one whose provider
      slug equals the slug that the source's `provider_identities` map gives for
      the **author segment of the row's id** (the text before the first `/`),
      compared by exact equality after trimming and lower-casing both, and by
      nothing else. Nothing on this path reads `provider_name`, and nothing
      reads any field but the declared `provider_field` — there is no second
      identity or tier field consulted. An author segment the map does not name
      resolves absent: **there is no branch that compares the author segment to
      a provider slug directly**, because raw equality is the coincidence test
      that measured absent on `google`, `mistralai`, `x-ai` and `amazon`
      (design D3). Write both of those down in the code, because they are the
      two edits a later change will make by accident and each turns an
      attribution into something weaker. The resolved value carries the provider
      slug and the tier alongside the number. Implements: *a price event SHALL
      be keyed to a vendor-posted rate … the identity and the tier compared
      SHALL both be read from the endpoint's declared `provider_field` by the
      registry's stated split rule … not from any other field the listing may
      also carry*, *an author segment whose declared provider slug the map does
      not give SHALL resolve absent … and SHALL NOT be matched by raw string
      equality as a fallback*, and *a bound vendor-posted rate SHALL carry the
      provider and the service tier it was posted at*.
- [x] 10. `pulse/lib/derive.mjs`: absence, with no fallback path in the code at
      all — author absent from the listing, author present only at tiers other
      than the canonical one, author with no declared provider slug, or a listing
      that did not fetch, each resolves to absent. There is no branch that reads
      `pricing.prompt` when the vendor rate is missing. Every absent value
      carries a **reason** from that closed set of four, and the other-tiers
      reason names the tiers the listing actually held (read via task 2's split,
      so a tier name in the reason is always one the split rule actually
      produced), so a reader can tell a gap in this site's declarations from a
      fact about the vendor. Implements: *the vendor-posted rate SHALL be
      absent … SHALL NOT fall back to the headline* and *an absent vendor-posted
      rate SHALL carry the reason it is absent … and in that last case the
      reason SHALL name the tiers it found*.
- [x] 11. `pulse/lib/derive.mjs`: the derived catalog row carries the vendor rate
      under its own name beside the listing rate, and the listing rate's own
      value and name are unchanged from today. Implements: *the vendor-posted
      rate SHALL sit beside the listing rate … and SHALL NOT overwrite it*.
- [x] 12. `pulse/lib/diff.mjs`: emit the price event from the vendor-posted rate
      — the model, the provider, the tier, both values, the source — and from
      nothing else. No threshold appears anywhere on this path. Implements: *a
      price event SHALL NOT be derived from the top-provider headline, at any
      threshold* and *no percentage threshold SHALL be used*.
- [x] 13. `pulse/tests/derive.test.mjs`: seven rows, each row's companion
      listing entries given as literal `provider_field` values in the shape this
      source actually publishes (a `tag` string), never as pre-split fields —
      the split under test is task 2's, not the fixture's. Two resolve: an
      author segment `openai` whose companion listing carries a bare
      `tag: "openai"` entry, with `canonical_tier` declared `standard` (the
      bare-tag-is-standard-tier reading, task 2); and — the case raw equality
      gets wrong — an author segment `google` whose declaration maps it to
      `google-ai-studio`, with a listing entry `tag: "google-ai-studio"` at the
      canonical tier, which resolves and carries that provider slug and that
      tier. Five are absent, each asserted on its **reason** as well as its
      absence: author present with `tag: "openai/flex"` and `tag: "openai/fast"`
      entries but no bare `tag: "openai"` entry, so nothing splits to the
      canonical tier `standard` (reason names the two tiers found, `flex` and
      `fast`); author absent from the listing; author present but the listing
      failed to fetch; an author segment the map does not name, **with a listing
      entry whose `tag` is that same raw string at the canonical tier** — the
      control that proves there is no raw-equality fallback; and the spoof
      control, a listing entry whose `tag`'s provider slug differs from the
      declared one, at the canonical tier, under a **`provider_name` equal to
      the author's**. In every absent case assert the row's vendor field is
      present as a **dated absent value** rather than missing, **and** that the
      listing rate is unchanged, which is the assertion that catches a fallback.
      Mutations: add a fallback to `pricing.prompt` on the absent path and
      confirm exactly the five absent cases fail; compare `provider_name`
      instead of the split slug and confirm only the spoof control fails;
      compare the raw author segment instead of the declared slug and confirm
      exactly two fail — the `google` row, which stops resolving, and the
      unmapped row, which starts — which is the pair that measures the identity
      map itself. Tests tasks 9 and 10.
- [x] 14. `pulse/tests/derive.test.mjs`: the catalog row carries both fields with
      their own names and the listing field is byte-identical to what the same
      fixture produces today. Mutation: overwrite the listing field with the
      vendor rate and confirm only this test fails. Tests task 11.
- [x] 15. `pulse/tests/diff.test.mjs`: a 2% move in a vendor-posted rate emits an
      event; a 60% move in the **headline** with the vendor rate unchanged emits
      none; a row with no vendor rate emits none however far its headline moved.
      The first and second together are the threshold proof: any threshold
      implementation fails at least one of them. Mutation: gate emission on a 5%
      change and confirm the 2% test fails while the other two pass. Tests task
      12.
- [x] 16. `pulse/tests/diff.test.mjs`: the emitted line carries the provider and
      the tier, and a line missing either is refused at the append point rather
      than written — the same stance `A change line's kind comes from a closed
      list with one home` takes on kinds. Tests task 9's second half.
- [x] 17. `pulse/tests/registry.test.mjs` (a source-scanning assertion, not a
      behavioural fixture): grep `pulse/lib/**/*.mjs` for the property accesses
      `.provider_identities` and `.provider_field` and assert the set of files
      that read either is exactly `{registry.mjs, derive.mjs}` — task 1's
      validation and task 9's resolution, and nothing else. Mutation: add a
      third read of `.provider_identities` in any other file under `pulse/lib/`
      (a throwaway line in a copy of `diff.mjs` for the test fixture, not the
      real module) and confirm the file-set assertion fails. Implements: *the
      map SHALL NOT be consulted for anything but that comparison*.

## Gates

- [x] 18. `openspec validate bind-a-price-to-the-vendor-that-posts-it --type
      change --strict --no-interactive`, and `node
      scripts/check-spec-deltas.mjs --strict`. Run at drafting time.
- [x] 19. `npm test`, `npm run build`, `verify-launch`, `verify-design`,
      `verify-surfaces`, `verify-analytics` on merged `main`. The orchestrator's,
      not a job's.

## Not tasks of this change, recorded so they are not read as omissions

- **Registering the companion source row, and re-fetching `robots.txt` at the
  new volume**, are ordinary registry data changes made on the day the fetch is
  switched on. Task 3 is what makes the second one unskippable.
- **Populating `provider_identities`** — the author-to-provider-slug pairs
  themselves, 58 distinct author segments on the committed snapshot — is registry
  data written on that same day, one dated entry at a time, and reviewable as
  data. Task 1 is what makes it unskippable, and the absent-with-a-reason rule is
  what makes an author nobody has declared yet visible instead of silent.
- **Clearing `event: false`** on `price_input`/`price_output` is one registry
  edit, and `pulse/lib/diff.mjs:408–411` already documents that there is no
  second switch to find. It happens after these tasks land, not inside them.
- **`addictedtoai-pfc` and `addictedtoai-k7d`** are blocked on this issue and
  are downstream prose-and-check work. This change makes their fix possible.
- **Naming the two price fields on a rendered surface** belongs to `directory`
  and `site`. No delta here touches either.
