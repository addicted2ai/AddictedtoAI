# site — delta for make-the-site-machine-readable

Everything below is written as permanent constitution text, because that is
what it becomes: `openspec archive` replaces a `MODIFIED` requirement's **whole
body** with what is written here. Nothing in a requirement block narrates an
edit or refers to a change directory; the reasoning for the edit lives in this
preamble, which is never archived.

## Why the citable-assets requirement is being modified rather than extended

Its closing sentence reads *"Distribution is citability, not outreach: the
system takes no outward action (no posting, no email, no accounts anywhere) —
that is a standing rule, not a temporary posture."*

An IndexNow submission is an outward action. It is not any of the three the
parenthetical names, and it is the opposite of what the rule exists to prevent
— it makes no statement, addresses no person, and represents the site nowhere a
human is expected to be speaking — but pretending the sentence does not reach it
would be reading a constitution for convenience. So the rule is restated with
the distinction it was always drawing made explicit, and the carve-out is
written narrowly enough that it authorises exactly one mechanism and nothing
adjacent to it.

The two `ADDED` requirements are genuinely new capabilities, not clarifications:
before them the site published no structured data at all, and its crawler
policy existed only as the default behaviour of a six-line generator.

## MODIFIED Requirements

### Requirement: Citable assets are first-class

The site SHALL publish, from day one:

- RSS/Atom feeds for the blog, the tutorials, and the home changed feed,
- a sitemap,
- generic Open Graph metadata (no social handles, no platform widgets),
- **the open dataset**: the entire structured layer (entries, facts,
  timelines, model catalog, deprecations) downloadable as JSON and CSV at a
  stable URL, under the CC BY 4.0 license, with the license stated on the
  page and in the files,
- **structured data** on every page whose subject the corpus can describe from
  its own front matter, and
- **an `llms.txt`** at the root, pointing at the structured layer, the pages
  behind it, and the licence — what a model retrieving this site actually
  needs, never a restatement of what the site would say about itself.

Distribution is citability, not outreach. The system SHALL take no outward
action that speaks for the site: no posting, no comment, no email, no account
anywhere, no submission to a directory, and nothing that puts words in the
site's name where a human is expected to be the one speaking. That is a
standing rule, not a temporary posture, and it holds regardless of how
effective the forbidden action would be.

**Announcing that a URL changed is not speaking for the site**, and is the one
exception, permitted under all of the following conditions and no others:

- it SHALL carry no content, opinion or description — only URLs the site
  already publishes, and only URLs that are already live;
- it SHALL be sent to a machine-readable indexing protocol that requires no
  account and no credential issued by anyone;
- the set of URLs SHALL be derived from the site's own published freshness
  signal, so that a page the sitemap omits can never be submitted and no second
  definition of "changed" exists; and
- it SHALL be gated on the same publish flag that gates deployment, and SHALL
  run only after the deploy is confirmed live.

A failure of such an announcement SHALL NOT be treated as a failure of the
deploy: it SHALL be reported and the run SHALL continue.

#### Scenario: The dataset is fetchable and licensed

- **WHEN** a visitor fetches the dataset URL
- **THEN** they receive the structured layer as JSON (and CSV for tabular
  slices) with the CC BY 4.0 license named inside the payload

#### Scenario: A changed URL is announced, and nothing else is

- **WHEN** a deploy is confirmed live and the sitemap records that pages
  changed that day
- **THEN** exactly those URLs are submitted to the indexing protocol, carrying
  no text about them, and a page the sitemap omits is not submitted

#### Scenario: An indexing service is unreachable

- **WHEN** the submission fails or returns anything other than success
- **THEN** the failure is reported, the deploy stands, and no halt is written

#### Scenario: Publishing is held down

- **WHEN** the publish flag is off, or the run is a dry run
- **THEN** no submission is attempted and the reason is stated in the log

## ADDED Requirements

### Requirement: Structured data is derived from the corpus, never asserted

Pages whose subject the corpus already describes in typed, dated, sourced front
matter SHALL publish that description as machine-readable structured data, and
every property in it SHALL be derived from something the page itself renders.

- A property that cannot be sourced from the corpus SHALL be **omitted**. It
  SHALL NOT be inferred, summarised, parsed out of prose, or filled with a
  plausible default. A graph asserting something the page does not is the same
  defect as a stale value in prose, and it is harder to notice because no
  reader ever proof-reads it.
- A page's structured `dateModified` SHALL be the **same value** the sitemap
  publishes as that page's last-modified date, resolved by the same shared
  code. A second definition of "changed" SHALL NOT be introduced, and neither
  value SHALL be derived from a build clock, a filesystem timestamp or a commit
  date.
- Structured data SHALL NOT be emitted on a page the site marks `noindex`. The
  decision to describe a page and the decision to have it indexed are one
  decision.
- A description carried in structured data SHALL be text the page itself
  contains, quoted, or a front-matter field written to be exactly that.
- The build SHALL verify all of the above against the **exported** site, and a
  violation SHALL fail the check rather than warn.

#### Scenario: A field the corpus does not carry

- **WHEN** a page's structured data would need a value the corpus does not
  record
- **THEN** the property is absent from the output entirely

#### Scenario: The graph and the sitemap disagree

- **WHEN** a page's structured last-modified date differs from the date the
  sitemap publishes for the same URL
- **THEN** verification fails naming the page and both dates

#### Scenario: A noindex page

- **WHEN** a page renders with `noindex` — a data-only stub, a demoted
  tutorial, a discontinued listing
- **THEN** it carries no structured data at all

### Requirement: The crawler stance is a recorded decision

`robots.txt` SHALL state the site's position on crawlers as a decision that was
made, not as a default that was inherited.

- It SHALL name explicitly, one rule each, the AI training and retrieval
  crawlers the site has taken a position on, and SHALL carry, in the served
  file, the reasoning for that position and what each named token actually
  governs. A rule whose reasoning lives only in source is not a recorded
  decision to anyone who reads the file.
- Reversing the position for a crawler SHALL be a single-word change to
  declared data.
- `robots.txt` SHALL contain no `Disallow`. Pages the site does not want
  indexed express that in their own per-page directive; disallowing a crawler
  prevents it fetching the page and therefore reading that directive, which
  makes the site's indexability rules unenforceable.

#### Scenario: A reader opens robots.txt

- **WHEN** anyone fetches `robots.txt`
- **THEN** they find each named crawler with its rule and a note saying what
  that token governs, and the reason the site allows or refuses it

#### Scenario: A Disallow is introduced

- **WHEN** any `Disallow` line appears in `robots.txt`
- **THEN** verification fails, because per-page `noindex` can no longer be read
