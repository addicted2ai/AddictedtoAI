# Design

Four choices, three of them cost decisions with a measurement behind them.

## D1. Key the companion fetch on `canonical_slug`, not on the row id

Measured 2026-09-06 on the committed snapshot: 404 rows carry a non-zero
`pricing.prompt`, and they span **335 distinct `canonical_slug` values**. Sixty-
nine of the ids are `:free`/`:batch`-style variants of a slug already counted.

Keying on the row id costs 404 requests a day and fetches the same provider
listing up to three times for three variants of one model. Keying on the
canonical slug costs 335, which is also the shape the endpoint path is addressed
by (`.../models/{author}/{slug}/endpoints`). Every variant row of one slug then
reads the same fetched listing.

This is not free of consequence and the consequence should be stated: two
variants of a model can genuinely have different prices (a batch tier is
routinely cheaper), and they are different **rows** with different headline
prices. Sharing one provider listing between them is correct only because the
listing itself enumerates tiers — the variant's price is a tier within the same
listing, not a different listing. That is the same fact D3 rests on.

## D2. Beside, not instead

ak9 asks whether the vendor rate should replace the catalog's price column. It
should not, and the reason is coverage. Every row has a listing rate; an unknown
fraction of rows will have a vendor rate. Replacing the column trades a number
that is true about a listing for a hole on every uncovered row, and a column with
holes is worse than a column that says something narrower than a reader assumed.

Two named fields, both true, neither substituting for the other, is also the only
arrangement in which the no-fallback rule is enforceable: with one field there is
nowhere for an absent vendor rate to go except back to the headline, which is the
defect.

## D3. The tier is part of the value, and which tier is canonical is registry data

The measurement in `data/price-attribution-debt.json` is that one provider lists
several tiers for one row, spanning 0.5×–2× for OpenAI and 1×–3.6× for Google AI
Studio, with regional Azure endpoints at +10%. So matching the author alone is
not a unique match; it is a set.

Two ways to resolve it. Compile a rule ("prefer the tier whose name is
`standard`, else the cheapest") into the code, or declare per source which tier
is canonical. The registry wins, for the reason the registry already wins on row
exclusions in the frontier requirement: *"declared criteria in the registry rather
than a rule compiled into the code, so the exclusions are visible and
reviewable"*. A tier-selection heuristic is a pricing judgment, and a pricing
judgment compiled into a diff module is invisible to everyone who reads the
prices.

**So `canonical_tier` is a required part of a companion declaration, not an
optional one**, and the build refuses a block without it — a companion that
declares no canonical tier can bind nothing, so allowing it would be allowing a
fetch that costs the source hundreds of requests a day and produces no value.
The residual absence is therefore the narrower one: the author is present in the
listing but posts nothing at the declared tier. Guessing another of its tiers
there is how a site ends up printing a fast-tier rate under a sentence about
standard pricing.

**And the author match is on slugs, not on labels.** The obvious implementation
compares the endpoint's `provider_name` — a display string like `OpenAI` — to the
row's author, case-folded. That is a label match, which this repository has
already recorded as spoofable: a display name is settable by whoever writes the
listing, several providers can carry one, and a rename silently makes or breaks
an attribution. The comparison is between the two machine keys — the provider
slug the source publishes for that endpoint and the author segment of the row's
id — by exact equality after trimming and lower-casing. Nothing on this path
reads the display name at all, which is why task 7 says so in the code rather
than only here.

## D4. What a companion snapshot looks like, and why it is snapshotted at all

The requirement says the per-row listing is snapshotted like any other fetch, so
a rate attributed to a vendor on a date can be re-checked after the vendor changes
it. The shape follows the existing one: a single dated JSON document per fetch
cycle, keyed by the slug fetched, holding for each slug only the fields the site
reads — the provider slug, the tier, the posted rates, and the fetch's own status
— not the whole upstream response.

Two reasons for the reduction rather than storing responses verbatim: the
models snapshot is already 1.1 MB per rotation for 431 rows, and a full
per-provider payload for 335 slugs would dwarf it in a repository that commits
its data in full; and the diff that matters is over the fields the site binds, so
storing more would add bytes that no comparison reads. The archived-source-excerpt
rule is satisfied by the same reduction the models feed already satisfies it with:
the row (here, the provider entry) that the event rests on, embedded in the change
line.

Rotation follows the existing rule — `previous` is replaced only when the fetched
rows differ from `latest` — so an unchanged provider listing costs one request and
no bytes.
