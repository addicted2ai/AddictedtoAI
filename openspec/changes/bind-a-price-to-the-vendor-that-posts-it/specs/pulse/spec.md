# pulse — delta for bind-a-price-to-the-vendor-that-posts-it

One requirement added and one modified. Nothing changes about how a source is
fetched, snapshotted, hashed or diffed, and nothing here re-enables a price event
on the value that is switched off today: `price_input` and `price_output` carry
`event: false` in `data/sources/registry.json` because the top-provider headline
is a rate on a listing whose referent rotates, and that decision stands exactly
as it is until a rate with a named vendor and a named tier exists to replace it.

What is added is the shape of that replacement — what a vendor-posted rate is,
what happens on the many rows that have none, and what a price event may be keyed
to — and the one registry change it needs: a companion fetch, declared, with the
courtesy bar that a 300-fold rise in request volume owes the source.

The rotation is measured, on this corpus, at up to 14.7× across providers on one
row and 4.9× between a reseller's headline and the vendor's own posted rate,
which is why that field carries `event: false` — and why the site has emitted no
price event of any kind since 2026-08-29, eight days as this is written. That is
a gap, not a destination, and it is the reason this change exists rather than a
property of the system it specifies.

`addictedtoai-ak9` carries the three costs this pays and they are transcribed
into the proposal rather than re-decided here. The registry modification exists
because the live requirement's closing sentence — *adding or removing a source is
an ordinary data change, not an OpenSpec change* — would otherwise cover a
declaration that multiplies a source's request rate, and it must not. **That
carve-out is rationale and it stays here**: what the built system does about it
is refuse the declaration until the robots record has been re-checked at the new
volume, and that refusal is the only thing written into the requirement. A
sentence telling a reader how to read another sentence is not a mechanism, and
this repository's guardrails are mechanisms.

## ADDED Requirements

### Requirement: A price event names the vendor that posts the rate, or there is no event

The catalog's price column and every bound price fact read one number:
`pricing.prompt` from the models feed, documented by its publisher as *"pricing
from the top provider for this model"*. The top provider is re-chosen on a
rolling 30-second outage window, so the value is verbatim while its referent
moves, and a movement in it is a routing artifact rather than a repricing.

- A price event SHALL be keyed to a **vendor-posted rate**: the rate posted, on
  the source's per-provider endpoint listing for that row, by the provider whose
  identity matches the row's own author, at the service tier the registry
  declares canonical for that source. **The identity compared SHALL be the
  provider *slug* the source itself publishes for that endpoint, against the
  author segment of the row's own id — the two machine keys, matched by exact
  equality after case-folding and trimming, and nothing else.** A display name is
  not an identity: `provider_name` is a label a source may set to anything,
  several providers may carry the same one, and matching on it makes an
  attribution that a rename or a lookalike can forge. A rate that cannot be
  attributed to the row's author under that comparison is not that vendor's price
  and SHALL NOT be treated as one.
- A price event SHALL NOT be derived from the top-provider headline, at any
  threshold. **No percentage threshold SHALL be used to decide whether a price
  movement is an event**: the measured failures are a 60% scheduled-window flip
  and a 14.7× routing flip, both of which clear any threshold anyone would set,
  against a genuine 2% repricing, which none of them would pass.
- A bound vendor-posted rate SHALL carry the **provider and the service tier** it
  was posted at. One provider commonly lists several tiers for one row —
  measured on this corpus as a flex tier at half the standard rate and a fast
  tier at twice it — so a rate with no tier is under-specified even when the
  vendor is unambiguous, and a sentence naming the vendor and the number would be
  false about which of its prices it names.
- Where the row's author is **absent** from that row's provider listing, or is
  present but posts nothing at the tier the source declares canonical, the
  vendor-posted rate SHALL be **absent**. Absence SHALL produce no event, SHALL
  be carried in the derived catalog row as an absent value with its date rather
  than as a missing field, and SHALL NOT fall back to the headline: a fallback is
  how a listing rate becomes a vendor attribution silently, which is the defect
  this requirement exists to close.
- The vendor-posted rate SHALL sit **beside** the listing rate in the derived
  catalog row, under its own name, and SHALL NOT overwrite it. Replacing the
  column would blank it on every row with no vendor endpoint; both values are
  true statements about different things and the row carries both.
- Every claim above SHALL be false-able from the snapshots alone. The per-row
  provider listing SHALL be snapshotted like any other fetch, so a rate the site
  attributed to a vendor on a date can be checked against what was fetched that
  day, after the vendor has changed it.

#### Scenario: A vendor's own posted rate becomes an event

- **WHEN** a row's author appears in that row's provider listing at a declared
  tier and the rate it posts differs from the previous snapshot's
- **THEN** the changed feed gains one dated, sourced line naming the model, the
  provider, the tier, the old and new values and the source

#### Scenario: A vendor absent from its own row's listing produces nothing

- **WHEN** a row's author does not appear in that row's provider listing
- **THEN** the vendor-posted rate is absent, no price event is emitted for that
  row, and the listing rate is not substituted for it

#### Scenario: An untiered rate is not a vendor price

- **WHEN** the row's author posts several tiers and none of them is the tier the
  source declares canonical
- **THEN** the vendor-posted rate is absent rather than guessed, and the
  ambiguity is reported rather than resolved

#### Scenario: A matching display name is not a matching vendor

- **WHEN** a provider whose slug differs from the row's author segment posts a
  rate on that row's listing under a display name equal to the author's
- **THEN** it does not resolve as the vendor-posted rate, because the comparison
  is on the two slugs

#### Scenario: The headline stays, and stays what it is

- **WHEN** a row has both a listing rate and a vendor-posted rate
- **THEN** the derived catalog row carries both under distinct names, and the
  listing rate is unchanged from what it is today

#### Scenario: A movement is an event or it is not, and no threshold decides

- **WHEN** a vendor-posted rate moves by 2%
- **THEN** it is an event, on the same terms as a movement of 200% — the test is
  whose rate moved, never how far

## MODIFIED Requirements

### Requirement: Sources live in a registry and refusals are data

Every external source the Pulse fetches SHALL be declared in a checked-in
source registry recording: URL, what fields it yields, which of its fields
is the row id (the join key entries declare — see `wiki`), fetch cadence
(`fetch_every_days`), expected change cadence (`expected_change_days` — how
often the source's content actually changes, the input to the
suspect-source computation), and its robots/terms status (checked before
the source entered the set). A source
that refuses (403, 429, terms) SHALL be recorded as refusing with the date —
never routed around, never retried aggressively, never scraped through a
side door. The registry at launch SHALL include at least the OpenRouter
models API and one release/retirement tracker; adding or removing a source is
an ordinary data change, not an OpenSpec change.

A source entry MAY additionally declare a **companion fetch**: a second URL,
templated from a row of that source's own snapshot and fetched once per covered
**key** — the value the template is keyed on, which may cover several rows —
with its own cadence, its own snapshot, under the source's robots/terms record
re-checked as the third bullet requires. It exists for the case where the
row-level feed carries a value whose referent is only recoverable per row.

- A companion fetch SHALL declare: its URL template, its cadence, the rule that
  computes which rows it covers, the snapshot it writes, **the local date it was
  declared on (`declared_on`)**, and **which service tier of the companion
  listing is canonical for this source**. A declaration missing any of these
  SHALL fail the build naming the source. `declared_on` is what the robots
  re-check is dated against; the canonical tier is what a bound rate is resolved
  at, and a companion with none declared can bind nothing.
- A companion fetch SHALL declare its covered rows as a rule over the source's
  own snapshot — a field test and a key — and the covered set SHALL be
  computable from the snapshot alone rather than being a list somebody maintains
  by hand. The build SHALL refuse a declaration that enumerates row ids: a
  hand-maintained list silently stops covering rows the feed adds, and a coverage
  gap that nothing can detect is how an absent value becomes indistinguishable
  from an unasked question.
- A companion fetch SHALL NOT be enabled until the source's robots/terms record
  has been **re-checked at the new volume**: re-fetched, re-dated, and stating
  the request rate the site will actually make as a number the build can compare
  — `robots.requests_per_day`, an integer. The build SHALL refuse a companion
  declaration whose source's `robots.checked_on` is earlier than the
  declaration's `declared_on`, whose `robots.requests_per_day` is absent, or
  whose `robots.requests_per_day` is less than the number of companion requests
  the coverage rule yields from the latest snapshot — one per distinct key, not
  one per covered row. A number no smaller than what the site will actually
  request is the only form of this claim a build can check; prose in
  `robots.detail` stating a volume is a sentence, and no test can tell a true
  one from a stale one.
- A companion fetch's failures SHALL be per row and SHALL NOT fail the run: a
  row whose companion fetch errors or refuses SHALL yield an absent value for
  that row, recorded with its date, on the same terms as any other absence.

#### Scenario: A refusal is recorded, not routed around

- **WHEN** a registered source starts returning 403
- **THEN** the Pulse marks it refusing with the date, stops fetching it at
  normal cadence (retrying at most daily), keeps serving its last snapshot
  with the snapshot's date visible, and files a repair finding in the
  derived queue

#### Scenario: A companion fetch cannot be switched on behind an old robots check

- **WHEN** a source declares a companion fetch and its robots record's
  `checked_on` is earlier than the declaration's `declared_on`, or carries no
  `robots.requests_per_day`, or carries one smaller than the number of distinct
  keys the coverage rule yields from the latest snapshot
- **THEN** the build fails, naming the source and which of the three it failed,
  and no companion request is made

#### Scenario: A hand-maintained coverage list is refused

- **WHEN** a companion declaration expresses its covered rows as a list of row
  ids rather than as a rule over the snapshot
- **THEN** the build fails, naming the source, and no companion request is made

#### Scenario: One row's companion failure is one row's absence

- **WHEN** a companion fetch returns an error for one covered row and succeeds
  for the rest
- **THEN** that row's companion value is absent with its date, every other row is
  unaffected, and the run completes
