# directory — delta for make-the-site-machine-readable

One added requirement, and nothing modified. `Standing tables answer recurring
questions` already says *"Each standing table SHALL have a stable URL and a
machine-readable counterpart (JSON) at a sibling URL"*, which is true and stays
exactly as it is. What it does not say is what a consumer of that JSON may rely
on — and a file somebody builds against without that answer is a file they will
be broken by, silently, on a day nobody notices.

Written as a separate requirement rather than as a `MODIFIED` body for two
reasons: an archive replaces a modified requirement's whole body, so restating
a correct three-table requirement in order to append a paragraph puts a working
sentence at risk for no gain; and the contract governs the dataset payload too,
which that requirement is not about.

## ADDED Requirements

### Requirement: The machine-readable payloads are a published contract

Every machine-readable payload the site publishes SHALL be usable as a
dependency by someone who did not write it, which requires saying what may be
depended on.

- Each payload SHALL carry a **schema version** and a URL pointing at the
  written statement of what the version means. Payloads describing different
  shapes SHALL carry independent version numbers, so a change to one is not
  reported as a change to the other.
- The written statement SHALL say what is stable **and what is not**, in that
  order. Stating only what is stable produces a promise the site cannot keep,
  because the values in these files are expected to move.
- **Stable** SHALL mean: the URL, the licence and its presence inside the
  payload, the top-level key names, every existing field name on a row and its
  meaning, that the stated row count equals the number of rows, and that rows
  are in the order the payload's stated sort criterion names.
- **Not stable, and never claimed to be** SHALL mean: which rows are present,
  their values, how many there are, and the generation date.
- A **new** key MAY be added to a payload or a row without the version
  changing. The version SHALL increase only when an existing key is renamed or
  removed; that is the only thing it means.
- Every such payload SHALL be served with a permissive cross-origin header, so
  a page in a browser can read it directly. The set of routes carrying that
  header SHALL be derived from the set of assets the build writes, never
  maintained by hand.

#### Scenario: A consumer reads an unfamiliar key

- **WHEN** a payload gains a field a reader does not recognise
- **THEN** the schema version is unchanged and a reader that ignores unknown
  keys is unaffected

#### Scenario: A field is renamed

- **WHEN** an existing key on a payload or a row is renamed or removed
- **THEN** the schema version increases

#### Scenario: A new machine-readable asset is published

- **WHEN** the build begins writing an asset it did not write before
- **THEN** that asset is served with the cross-origin header without anyone
  adding it to a list

#### Scenario: A browser fetches the catalog from another origin

- **WHEN** a page on an unrelated origin fetches a standing table's JSON
- **THEN** the request succeeds and the payload states its schema version and
  where the contract is written
