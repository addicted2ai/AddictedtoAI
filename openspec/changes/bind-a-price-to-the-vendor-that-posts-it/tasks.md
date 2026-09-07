# Tasks

Ten normative bullets are added in `specs/pulse` — six in the added requirement,
four in the modified registry requirement (18 SHALL/MUST clauses when counted
clause by clause, since several bullets state a rule and its refusal together).
Each has an implementing task and a testing task below, and every testing task
names the mutation that proves it measures something.

Nothing in this change registers the companion source, re-checks a robots file,
or clears `event: false`. Those are registry data changes made on the day the
fetch is switched on; the tasks below build the shape and the bar.

## The companion fetch, and the bar in front of it

- [ ] 1. `pulse/lib/registry.mjs`: validate a `companion` block on a source entry
      — a URL template, a cadence, a rule for which rows it covers, the snapshot
      it writes, `declared_on` (a local date), and `canonical_tier` (the service
      tier of the companion listing this source's rates are read at). Each of the
      six is required and a block missing any of them throws naming the source
      and the field. The covered set is expressed as a rule over the snapshot (a
      field test and a key), never as a list of ids, and validation refuses a
      hand-maintained list. Implements: *a companion fetch SHALL declare: its URL
      template, its cadence, the rule …, `declared_on` …, and which service tier
      … is canonical* and *the covered set SHALL be computable from the snapshot
      alone … The build SHALL refuse a declaration that enumerates row ids*.
- [ ] 2. `pulse/lib/registry.mjs`: refuse a `companion` declaration on three
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
- [ ] 3. `pulse/lib/sources.mjs`: fetch the companion once per covered key, keyed
      on `canonical_slug` rather than row id (design D1 — 335 keys against 404
      rows on the committed snapshot), writing one dated snapshot per cycle
      holding only the fields the site binds. Rotation follows the existing rule:
      `previous` is replaced only when the fetched rows differ from `latest`.
      Implements: *the per-row provider listing SHALL be snapshotted like any
      other fetch*.
- [ ] 4. `pulse/lib/sources.mjs`: a companion failure is per key — an error, a
      timeout or a refusal yields an absent value for the rows that key covers,
      recorded with its date, and the run continues. A refusal is recorded as a
      refusal under the existing rule. Implements: *a companion fetch's failures
      SHALL be per row and SHALL NOT fail the run*.
- [ ] 5. `pulse/tests/registry.test.mjs`: six cases over one companion
      declaration. It validates when `robots.checked_on` is on or after
      `declared_on` and `robots.requests_per_day` is at least the distinct-key
      count. It is refused, naming the source and the condition, when: the robots
      record is dated before `declared_on`; `robots.requests_per_day` is absent;
      `robots.requests_per_day` is one less than the number of distinct keys the
      coverage rule yields from the fixture snapshot; the block names no
      `canonical_tier`; and the block
      expresses its coverage as a list of row ids rather than a rule. Mutations:
      drop the date comparison and confirm only the first refusal passes;
      drop the count comparison and confirm only the third does — five refusals
      with independent causes, not one condition described five times. Tests
      tasks 1 and 2.
- [ ] 6. `pulse/tests/sources.test.mjs`: a fixture whose snapshot holds four
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
      and confirm only the rotation assertion fails. Tests tasks 1, 3 and 4.

## The vendor-posted rate

- [ ] 7. `pulse/lib/derive.mjs`: resolve a vendor-posted rate for a row — the
      entry in that row's companion listing posted at the source's declared
      `canonical_tier` whose **provider slug** equals the **author segment of the
      row's id** (the text before the first `/`), compared by exact equality
      after trimming and lower-casing both, and by nothing else. The endpoint's
      display name is not read on this path at all; write that down in the code,
      because reading it is the change a later edit will make by accident and it
      is the one that turns an attribution into a label match. The resolved value
      carries the provider slug and the tier alongside the number. Implements: *a
      price event SHALL be keyed to a vendor-posted rate … the identity compared
      SHALL be the provider slug … matched by exact equality* and *a bound
      vendor-posted rate SHALL carry the provider and the service tier it was
      posted at*.
- [ ] 8. `pulse/lib/derive.mjs`: absence, with no fallback path in the code at
      all — author absent from the listing, or several tiers with none declared
      canonical, resolves to absent. There is no branch that reads
      `pricing.prompt` when the vendor rate is missing. Implements: *the
      vendor-posted rate SHALL be absent … SHALL NOT fall back to the headline*.
- [ ] 9. `pulse/lib/derive.mjs`: the derived catalog row carries the vendor rate
      under its own name beside the listing rate, and the listing rate's own
      value and name are unchanged from today. Implements: *the vendor-posted
      rate SHALL sit beside the listing rate … and SHALL NOT overwrite it*.
- [ ] 10. `pulse/lib/diff.mjs`: emit the price event from the vendor-posted rate
      — the model, the provider, the tier, both values, the source — and from
      nothing else. No threshold appears anywhere on this path. Implements: *a
      price event SHALL NOT be derived from the top-provider headline, at any
      threshold* and *no percentage threshold SHALL be used*.
- [ ] 11. `pulse/tests/derive.test.mjs`: five rows — author present at the
      canonical tier (resolves, carrying the provider slug and the tier); author
      present at three other tiers but not the canonical one (absent); author
      absent from the listing (absent); author present but the listing failed to
      fetch (absent); and the spoof control, a provider whose slug differs from
      the author segment posting at the canonical tier under a **display name
      equal to the author's** (absent — it must not resolve). In every absent
      case assert the row's vendor field is present as a **dated absent value**
      rather than missing, **and** that the listing rate is unchanged, which is
      the assertion that catches a fallback. Mutations: add a fallback to
      `pricing.prompt` on the absent path and confirm exactly the four absent
      cases fail; compare display names instead of slugs and confirm only the
      spoof control fails. Tests tasks 7 and 8.
- [ ] 12. `pulse/tests/derive.test.mjs`: the catalog row carries both fields with
      their own names and the listing field is byte-identical to what the same
      fixture produces today. Mutation: overwrite the listing field with the
      vendor rate and confirm only this test fails. Tests task 9.
- [ ] 13. `pulse/tests/diff.test.mjs`: a 2% move in a vendor-posted rate emits an
      event; a 60% move in the **headline** with the vendor rate unchanged emits
      none; a row with no vendor rate emits none however far its headline moved.
      The first and second together are the threshold proof: any threshold
      implementation fails at least one of them. Mutation: gate emission on a 5%
      change and confirm the 2% test fails while the other two pass. Tests task
      10.
- [ ] 14. `pulse/tests/diff.test.mjs`: the emitted line carries the provider and
      the tier, and a line missing either is refused at the append point rather
      than written — the same stance `A change line's kind comes from a closed
      list with one home` takes on kinds. Tests task 7's second half.

## Gates

- [ ] 15. `openspec validate bind-a-price-to-the-vendor-that-posts-it --type
      change --strict --no-interactive`, and `node
      scripts/check-spec-deltas.mjs --strict`. Run at drafting time.
- [ ] 16. `npm test`, `npm run build`, `verify-launch`, `verify-design`,
      `verify-surfaces`, `verify-analytics` on merged `main`. The orchestrator's,
      not a job's.

## Not tasks of this change, recorded so they are not read as omissions

- **Registering the companion source row, and re-fetching `robots.txt` at the
  new volume**, are ordinary registry data changes made on the day the fetch is
  switched on. Task 2 is what makes the second one unskippable.
- **Clearing `event: false`** on `price_input`/`price_output` is one registry
  edit, and `pulse/lib/diff.mjs:408–411` already documents that there is no
  second switch to find. It happens after these tasks land, not inside them.
- **`addictedtoai-pfc` and `addictedtoai-k7d`** are blocked on this issue and
  are downstream prose-and-check work. This change makes their fix possible.
- **Naming the two price fields on a rendered surface** belongs to `directory`
  and `site`. No delta here touches either.
