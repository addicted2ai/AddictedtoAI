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

`addictedtoai-ak9` carries the three costs this pays and they are transcribed
into the proposal rather than re-decided here. The registry modification exists
because the live requirement's closing sentence — *adding or removing a source is
an ordinary data change, not an OpenSpec change* — would otherwise cover a
declaration that multiplies a source's request rate, and it must not.

## ADDED Requirements

### Requirement: A price event names the vendor that posts the rate, or there is no event

The catalog's price column and every bound price fact read one number:
`pricing.prompt` from the models feed, documented by its publisher as *"pricing
from the top provider for this model"*. The top provider is re-chosen on a
rolling 30-second outage window, so the value is verbatim while its referent
moves — measured on this corpus at up to 14.7× across providers on one row, and
4.9× between a reseller's headline and the vendor's own posted rate. A movement
in it is a routing artifact, which is why it produces no changed-feed event
today, and why the site has had no price event of any kind since 2026-08-29. That
is a gap, not a destination.

- A price event SHALL be keyed to a **vendor-posted rate**: the rate posted, on
  the source's per-provider endpoint listing for that row, by the provider whose
  identity matches the row's own author, at a named service tier. A rate that
  cannot be attributed to the row's author is not that vendor's price and SHALL
  NOT be treated as one.
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
- Where the row's author is **absent** from that row's provider listing, or posts
  several tiers with none of them declared canonical in the registry, the
  vendor-posted rate SHALL be **absent**. Absence SHALL produce no event, SHALL
  render as absent, and SHALL NOT fall back to the headline: a fallback is how a
  listing rate becomes a vendor attribution silently, which is the defect this
  requirement exists to close.
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

- **WHEN** the row's author posts several tiers and the registry declares none of
  them canonical for that source
- **THEN** the vendor-posted rate is absent rather than guessed, and the
  ambiguity is reported rather than resolved

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
row, with its own cadence, its own snapshot, and its own robots/terms record.
It exists for the case where the row-level feed carries a value whose referent is
only recoverable per row.

- A companion fetch SHALL declare which rows it covers, and the covered set
  SHALL be computable from the snapshot alone rather than being a list somebody
  maintains by hand.
- **Declaring a companion fetch, or widening the set of rows it covers, is NOT
  an ordinary data change.** It multiplies the source's request rate by the size
  of that set, and the closing sentence above SHALL NOT be read to cover it.
- A companion fetch SHALL NOT be enabled until the source's robots/terms record
  has been **re-checked at the new volume**: re-fetched, re-dated, and rewritten
  to state the request rate the site will actually make. The build SHALL refuse
  a companion declaration whose source's robots record is dated before that
  declaration or does not state a request volume. This is a courtesy question at
  least as much as a compliance one, and a check made for one request a day is
  not evidence about three hundred.
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

- **WHEN** a source declares a companion fetch and its robots record predates
  that declaration or states no request volume
- **THEN** the build fails, naming the source and the missing re-check, and no
  companion request is made

#### Scenario: One row's companion failure is one row's absence

- **WHEN** a companion fetch returns an error for one covered row and succeeds
  for the rest
- **THEN** that row's companion value is absent with its date, every other row is
  unaffected, and the run completes
