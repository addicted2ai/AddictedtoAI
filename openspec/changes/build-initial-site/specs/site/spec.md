# site — delta for build-initial-site

## Purpose

The site itself: static rendering, the derived home page, navigation, URL
stability, citable assets, the one-page colophon carrying the AI-authorship
record, the design bar, and the rule that no visitor interaction ever spends
inference.

## ADDED Requirements

### Requirement: The site is fully static and spends nothing per visitor

Every page a visitor loads SHALL be fully computed at build time. No page
SHALL call any model service, from server or browser. No visitor action may
consume the maintainer's inference or spend money. Third-party requests from
a visitor's browser SHALL be limited to an explicit allowlist containing
only Google Analytics (see `analytics`); no ads, no other trackers, no
social widgets, no external scripts. The build SHALL fail if a page's output
references a network origin outside the allowlist.

#### Scenario: A stray third-party script fails the build

- **WHEN** a page's rendered output references a script origin not on the
  allowlist
- **THEN** the build fails naming the page and the origin

### Requirement: The home page is a derived view that changes daily at zero inference

The home page SHALL lead with what changed: a dated feed of verified changes
(price moves, status changes, releases, retirements, notable timeline
events) derived from the Pulse's diff history, each line linking into the
owning wiki entry and carrying its source. It SHALL also surface: a recent
deprecations/retirements strip, the latest blog post and tutorial, and clear
doors into each surface. All of it renders from the data layer, so in a week
where no inference runs at all, the home page still changes every day the
world does. The home page serves someone already following AI daily;
education is a door they can take, not the framing of the page.

#### Scenario: The front page moves with zero inference

- **WHEN** the Pulse detects source changes and rebuilds on a day when no
  model was invoked
- **THEN** the home page's changed feed shows the new dated lines

### Requirement: Published URLs never break

No published URL SHALL ever 404. Renames and removals leave permanent
redirects. Removing content is allowed (pruning weak pages is healthy) but
the URL redirects to the nearest surviving parent with a notice. The build
SHALL verify every internal link resolves; a broken internal link fails the
build.

#### Scenario: A pruned page leaves a redirect

- **WHEN** a page is removed as not worth keeping
- **THEN** its URL permanently redirects to its section index and the
  redirect is recorded in a checked-in redirects file

### Requirement: Citable assets are first-class

The site SHALL publish, from day one:

- RSS/Atom feeds for the blog, the tutorials, and the home changed feed,
- a sitemap,
- generic Open Graph metadata (no social handles, no platform widgets),
- **the open dataset**: the entire structured layer (entries, facts,
  timelines, model catalog, deprecations) downloadable as JSON and CSV at a
  stable URL, under the CC BY 4.0 license, with the license stated on the
  page and in the files.

Distribution is citability, not outreach: the system takes no outward action
(no posting, no email, no accounts anywhere) — that is a standing rule, not
a temporary posture.

#### Scenario: The dataset is fetchable and licensed

- **WHEN** a visitor fetches the dataset URL
- **THEN** they receive the structured layer as JSON (and CSV for tabular
  slices) with the CC BY 4.0 license named inside the payload

### Requirement: The AI-authorship record is one page, out of the way

The fact that no human has written a character of the site SHALL be
discoverable on a single colophon page: what the site is, how it is made,
that an AI writes and maintains it under review, with the public commit
history as the record. The colophon SHALL be at most one page, out of primary
navigation, and the site SHALL NOT be organized around its own authorship
anywhere else: self-reference outside the colophon (the site writing about
its own process, governance, or history) is a review rejection. The record
is a bonus a curious visitor finds — never the pitch, never a section, never
a recurring cost.

#### Scenario: Self-referential content is rejected

- **WHEN** a draft blog post is about the site's own machinery or history
- **THEN** review rejects it with reason `not-worth-reading` citing this
  requirement, regardless of its quality

### Requirement: The design meets an enthusiast-grade bar

The site SHALL look and feel deliberately designed, not templated: a
distinctive typographic identity, a data-dense home page (content above the
fold, not hero banners), fast loads (no client-side framework payload where
static markup serves), dark and light themes, and accessible markup (WCAG AA
contrast, keyboard navigation, no reflow breakage at 320px). Pages lead with
their substance; decoration never displaces information.

#### Scenario: The front page is content above the fold

- **WHEN** the home page renders at a common desktop size
- **THEN** actual content (changed-feed lines, entries, posts) is visible
  above the fold, not a full-viewport hero graphic
