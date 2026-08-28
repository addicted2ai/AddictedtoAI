# blog — delta for build-initial-site

## Purpose

Dated stories about the technologies, methods, models and companies trying to
advance AI. Posts are true on their date and stay honest about being dated;
they reference the wiki rather than restating its facts.

## ADDED Requirements

### Requirement: Posts are dated and never silently rewritten

Every post SHALL carry its publication date visibly. After publication, a
post's body SHALL NOT be edited except to append a dated correction block
("Correction, <date>: ...") or to fix typos that change no meaning. A post is
true as of its date; aging is not a defect and generates no rework. Volatile
facts inside posts follow the wiki transclusion rule, so the data a post
displays stays current even while its narrative stays dated.

#### Scenario: A correction is appended, not smuggled

- **WHEN** a published post is found to contain a wrong external claim
- **THEN** the fix is a dated correction block appended to the post (and the
  claim struck through or amended inline with the correction referenced),
  never a silent rewrite

### Requirement: Titles and excerpts may not outclaim bodies

A post's title, excerpt, and any summary line SHALL claim no more than the
body demonstrates. Motive attribution, legal characterization ("broke the
law", "lied"), and stronger time or causation claims than the evidence
supports are rejection reasons in review even when every fact in the body is
verified. Summary copy gets more scrutiny than body copy, not less — that is
where overclaims hide.

#### Scenario: Verified body, overclaiming headline

- **WHEN** a draft post's body carefully documents a vendor changing a policy
  but its title asserts why the vendor did it
- **THEN** review rejects it with reason `false-or-unsupported-claim` against
  the title, even though the body passes

### Requirement: External claims meet a sourcing bar

Every externally checkable claim in a post (what a company did, what a model
scored, what a price was, what a person said) SHALL carry a source a reader
can follow. Quotations attributed to named people MUST link a source that
contains the quotation. Claims about a named company's conduct SHALL be held
to a news-fact-checking standard: primary sources over aggregators, dates
explicit, and uncertainty stated as uncertainty rather than resolved toward
the more dramatic reading.

#### Scenario: Unsourced conduct claim is rejected

- **WHEN** a draft asserts a company quietly changed a data-retention promise
  without linking evidence of both the before and after states
- **THEN** review rejects it with reason `false-or-unsupported-claim` naming
  the unsupported half

### Requirement: Publishing is quality-gated, never quota-driven

There SHALL be no minimum posting cadence: zero posts in a week is a normal,
healthy outcome. There SHALL be a ceiling of 3 published posts in any rolling
7 days, so a capacity glut converts to depth rather than volume. A post
exists because something happened worth an enthusiast's time — the editorial
bar (see `editorial`) decides, not a schedule.

#### Scenario: A slow week publishes nothing

- **WHEN** a week passes in which nothing clears the editorial bar
- **THEN** no post is published and nothing anywhere treats that as a failure
