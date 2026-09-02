# wiki — delta for catch-the-constitution-up-to-the-code

This change adds no behaviour. Every clause below describes something the build
already enforces and something an existing test already measures.

Added as its own requirement rather than as a third severity under `Volatile
facts travel by transclusion, never by restatement`. That requirement is about
where a value comes from; this one is about what a value MEANS once it has
arrived, and it has its own remedy, its own debt list and its own prohibition.
Folding it in would have made a requirement about binding also be a requirement
about attribution.

## ADDED Requirements

### Requirement: A listed price is a property of a listing, not of a company

A `price_*` transclusion carries OpenRouter's headline rate for a row. That
number is documented as the **top listed provider's** rate for that row, and the
top provider is re-chosen on a rolling 30-second window. It is a property of a
listing at an instant, not a statement about what any company charges. Prose
that makes some party the setter or receiver of it is false about a number that
is itself perfectly accurate — which is why the repair is never to change the
value.

Two independent causes were measured. The top provider rotates: a headline of
`0.000000045` belonged to a reseller while the vendor's own endpoint posted
`0.00000022`, a factor of 4.9, and two rows compared on their headlines can
therefore invert. Separately, one provider lists a single row at several tier
prices — a flex tier at half, a fast tier at double — so even a row whose
endpoints are all the vendor's own can carry three different numbers.

- The build SHALL FAIL when a `price_*` transclusion appears in a sentence that
  makes some party the setter or receiver of the rate — *charges*, *billed*,
  *priced*, *asks*, *costs*, *sells*, *pays* — unless the surrounding section
  mentions the provider layer. Implemented by `lib/price-attribution.mjs`, wired
  into `lib/build-content.mjs`; measured by `lib/price-attribution.test.mjs`.
- Row-attributing verbs — *lists at*, *heads at*, *carries*, *sits at* — are the
  compliant form and SHALL NOT be flagged. The corpus's remedy idiom must not be
  the thing the check fires on.
- The exemption SHALL BE the remedy, not a suppression marker: the only way to
  silence the check is to write the clause that makes the sentence true. There
  is deliberately no ignore comment, because an ignore comment would make the
  cheapest response to a true finding be to hide it.
- Prose SHALL NOT name the top provider, because it rotates. A sentence naming
  it is accurate for as long as a thirty-second window and false afterwards,
  and nothing in the corpus would ever revisit it.
- The **fact itself SHALL NOT be edited** to resolve any of this. A fact records
  what the feed said at a stated moment and binds at build time; rewriting it
  would trade a true record and a false sentence for two false ones.
- Instances predating the check SHALL be recorded in
  `data/price-attribution-debt.json` and SHALL warn rather than fail. That list
  SHALL only ever shrink, and the build SHALL report its length and name entries
  that no longer fire, so a debt that has been repaid cannot sit in the file
  looking like a debt. Implemented in `lib/price-attribution.mjs`.

#### Scenario: An attributed price fails the build

- **WHEN** a page states that a named company *charges* the rate a `price_*`
  transclusion resolves, and its section says nothing about the provider layer
- **THEN** the build fails, naming the file and the sentence

#### Scenario: The hedge is the remedy

- **WHEN** the same sentence is rewritten to attribute the number to the row —
  or its section explains that the headline is the top listed provider's rate
  rather than necessarily the vendor's own
- **THEN** the build passes, and the fact's value is unchanged

#### Scenario: Pre-existing debt warns and only shrinks

- **WHEN** the build encounters an instance recorded in
  `data/price-attribution-debt.json`
- **THEN** it warns rather than failing, reports how many such instances remain,
  and names any recorded entry that no longer fires
