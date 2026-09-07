# education-static — delta for keep-the-map-describing-the-territory

One requirement added. Nothing existing is touched: the publish gate that
refuses an undeclared page, the ladder, the rung tests and the beats-the-
alternative bar all stand exactly as written.

What is added is the other direction of the same contract. The existing
requirement binds a page to the **existence** of an entry; nothing binds a page
to the **content** of its entry, so a page enumerated in the map may quietly
stop being the page the map describes. Measured 2026-09-06 in
`openspec/curriculum/learn.md`: four clauses across four entries describe pages
that do not exist as described — line 411 (`who-builds-ai`, chip-layer
structure), line 435 (`where-ai-fails-people`, the hiring case, which the
published page does not contain), line 392 (`what-ai-is-used-for`,
recommendation, which the published page does not contain) and line 947
(`prompt-injection`, training-time poisoning). Each departure was defensible on
the merits and each was disclosed by its writer in a job report, which is a
finished document.

The root is measurable and is why the last bullet below is normative rather than
left to an implementer: `ACCEPTANCE_BY_TYPE.education` in `loop/lib/brief.mjs`
and `CHECKLISTS.education` in `loop/lib/review.mjs` are three lines each and
neither mentions the curriculum of record. The map reaches the build
(`checkCurriculumCoverage` in `lib/learn.mjs`) and the queue
(`curriculumGapItems` in `pulse/lib/queue.mjs`) and reaches neither the writer
who could amend it nor the reviewer who could require it.

Serves `addictedtoai-c29`.

## ADDED Requirements

### Requirement: A departure from a page's entry amends the entry in the same diff

The curriculum of record enumerates each page with its outcome, its
prerequisites, what it must cover and what it must not drift into. Those
clauses are the page's brief, and a page SHALL be written to them.

- Where a job judges one of its page's clauses wrong, it SHALL amend that entry
  in the same diff as the page — visibly, carrying the local date and one
  sentence of reasoning — and SHALL then write the page to the clause as it now
  stands. A departure and its amendment travel together or the departure does
  not travel.
- A departure recorded **only** in a job's `RESULT.md`, a commit message, a
  verdict record's prose, or a report to a person SHALL NOT satisfy the sentence
  above. Each of those is a finished document, and a note that exists only
  inside something finished is unreachable to the next reader of the map. The
  map is the artifact that must change.
- Review of a diff touching a learn page SHALL compare the page against its
  curriculum entry clause by clause, and SHALL reject as `spec-violation` —
  naming the clause and the page — a page that departs from a clause where the
  same diff leaves that entry untouched. The rejection SHALL NOT depend on
  whether the departure was a good idea: a defensible departure and an
  indefensible one are refused alike, because what is being enforced is the
  correspondence between map and corpus and not the writer's judgment.
- Where the departure implies a change to an entry **other than the page's
  own** — a re-division of coverage between two entries, a prerequisite that
  belongs elsewhere, a bound that should move to a neighbouring page — the
  reviewer SHALL record it as a carried finding (`review`, "A reviewer's
  non-blocking finding reaches work without editing anything") whose `subject`
  is the curriculum of record. That work is outside the diff under review, and
  a rule that forced it inside would trade a stale map for an unbounded one.
- The author's brief for a job that writes or edits a learn page SHALL carry the
  curriculum of record's path and the obligation above — and, where the job
  names the page it is about, that page's curriculum entry verbatim — and the
  reviewer's checklist for such a job SHALL carry the clause-by-clause
  comparison and the two outcomes it can produce. A job is one written prompt in
  and files out, with no session and no memory: an obligation no actor is told
  about is not a mechanism. A job reaching this surface from a proposal or a
  directive names no page, which is why the path and the obligation are owed
  unconditionally and the entry is owed wherever the page is named.

#### Scenario: A defensible departure amends the map beside the page

- **WHEN** a job writing a declared learn page concludes that a "must cover"
  clause belongs on a different page and writes the page without it
- **THEN** its diff also amends that clause in the curriculum of record, dated
  and with its reasoning, and review judges the amendment on its merits like any
  other editorial choice

#### Scenario: A departure disclosed only in the report is refused

- **WHEN** a job departs from a clause and records the departure in `RESULT.md`
  alone, leaving the curriculum entry untouched
- **THEN** review rejects the diff as `spec-violation` naming the clause and the
  page, and the disclosure in the report does not satisfy the requirement

#### Scenario: A well-argued departure is refused on the same terms as a bad one

- **WHEN** a reviewer agrees that the departure produced a better page than the
  clause described, and the diff still leaves the entry untouched
- **THEN** the verdict is `spec-violation` naming the clause, and the reviewer's
  agreement is recorded as the reason to amend rather than as a reason to pass

#### Scenario: A departure that re-scopes a neighbouring page becomes work

- **WHEN** a page's departure implies that a clause should move to a different
  entry, which the diff under review has no business editing
- **THEN** the reviewer carries a finding whose subject is the curriculum of
  record, the next queue run holds one item for that subject carrying every such
  finding, and the item retires when a job's diff deletes the finding files

#### Scenario: A page written to its entry amends nothing

- **WHEN** a job writes a declared page that covers every "must cover" clause and
  drifts into none of the "must not" ones
- **THEN** the diff touches no curriculum entry, review raises nothing under
  this requirement, and no finding is carried
