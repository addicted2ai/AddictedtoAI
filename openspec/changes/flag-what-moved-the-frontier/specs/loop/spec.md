# loop — delta for flag-what-moved-the-frontier

One requirement modified. The scout's charge, its two-test bar, its docket
discipline, its drop records, its synthesis branch, its blocked-streak witness
and its review gate are all unchanged. What is added is
the standing frontier sweep, the candidate-level flag with the same bar the
post-level flag carries, and the exemption that makes the flag worth carrying —
mechanical at merge, like the cap it lifts.

Transcribed from `loops/ui-loop/graph/knowledge/DESK-ORDER-001.md` §1, keeper-
signed 2026-09-05: *"the daily sweep always looks for F1–F5 events across all
domains, using the radar feeds in §5 as inputs"*, and *"a story flagged
`frontier: true` does not count against the three-candidates-per-day cap; the
new-writing budget share (≤45%) still binds it; the flag must cite its
criterion or the candidate fails filing."*

The budget requirement is untouched: the new-writing ceiling still stands at
≤45% and still refuses `post` and `scout` work over it. The exemption lifts a
count, not a budget, and the reason it needs a budget behind it is that an
exemption with none invites flagging everything.

## MODIFIED Requirements

### Requirement: The scout looks outward, takes the best three, and records the rest

The scout is the Desk job the daily queue item (see `pulse`) triggers. Its
charge, verbatim from the track that carried it on the predecessor site:
**bring back work the site could not have thought of by looking at
itself.**

- The scout SHALL sweep outward — the world beyond this repository and
  beyond the registered sources: vendor announcements and documentation,
  papers, incidents, pricing and licence pages, community signal — and MAY
  use the queue item's assembled feed context as one input among them. A
  scout run in which every filed candidate could have been written without
  leaving the repository SHALL be rejected in review as `spec-violation`
  naming this charge.
- **Every sweep SHALL look for frontier events across every domain**, against
  the criteria F1–F5 that `blog` defines: a first-shown capability with a
  checkable artifact, a lead change or a rescoring on a published index, a
  covered organisation's frontier release, a labelled-unverified vendor claim
  of a new ability, and a material change in access. It is a standing
  question asked on every run, not a mode entered on a good day: the surface
  the flag feeds shows the most recent flagged records per domain, so a domain
  nobody swept goes quiet without anybody deciding it should.
- Radar feeds — open-weights hubs, covered organisations' release feeds,
  preprint listings, source-release feeds — are **inputs to the sweep and are
  never displayed raw**. They exist to tell the scout where to look. Rendered
  directly they would saturate the surface immediately, which is the failure
  that made this a curated surface rather than a feed.
- The scout SHALL judge everything it found against the two-test bar
  (`editorial`: worth a stranger's attention; true, checkable, current)
  and SHALL file **at most three candidates per run — the most worthy
  three**, as expiring proposals. Each candidate SHALL carry the docket
  discipline: a kebab-case `slug`, a proposed job type from the closed
  list, an `expires:` date — at most 7 days out for an event-driven
  candidate, at most 14 for a synthesis — a why-now, externally retrieved
  evidence with URLs and retrieval dates, and done-when acceptance lines
  written at filing time.
- A candidate MAY additionally declare `frontier: true`, and when it does it
  SHALL carry the same bar a post carries: `frontier_reason`, exactly one of
  F1–F5, and every `domains` value it declares from the closed domain
  vocabulary. `domains` is optional here for the reason it is optional on a
  post — absence is the vocabulary's unmarked "general", not an unfilled field
  — so a frontier event with no modality is a candidate like any other.
  **A candidate declaring the flag with no valid criterion, or with a `domains`
  value outside the vocabulary, SHALL NOT be filed** — the flag is refused at
  filing, not discovered at build, because the flag's whole effect happens
  before any post exists.
- **A candidate carrying a valid `frontier: true` SHALL NOT count against the
  cap of three.** The exemption is from the count and from nothing else: an
  expiring flagged candidate cools, expires, is swept and is judged exactly as
  any other, and the new-writing ceiling in the budget requirement refuses a
  flagged candidate over the ceiling exactly as it refuses an unflagged one.
  The bar on the flag and the ceiling on the spend are both required and
  neither substitutes for the other.
- The cap SHALL be mechanical, not behavioral: at the scout's merge, the
  loop keeps at most three **unflagged** candidate files — by the scout's own
  stated ranking, else by filename — and every excess unflagged candidate is
  moved to the drop record rather than merged (the caps mechanism in the
  work-sources requirement). A candidate whose flag does not hold is not a
  flagged candidate: it is dropped at merge, with the reason named, and it
  does not silently rejoin the unflagged three.
- What the scout declines SHALL be recorded, never silently dropped: each
  considered-and-declined story becomes one record in
  `data/proposals/dropped/`, naming which test it failed and what would
  make it worth refiling. A story considered as a frontier candidate and
  declined SHALL name which criterion it was weighed against and why it
  failed — the surface's own claim is that it shows what other AI news sites
  do not, and the declines are the only record of where that line was drawn.
  Stated honestly, the way this repository states it about
  `would-cite`: the records prove the **form** of the bar, not
  its **rate** — nothing measures how many stories the scout considered,
  so a scout that sweeps forty sources and writes three drop records is
  mechanically indistinguishable from one that considered six. The bar
  itself is an instruction to a model, checked by a model-run review from
  its checklist; the records are what make that check auditable after the
  fact, and that is all they are claimed to do.
- A day with no external story that clears the bar SHALL open the
  **synthesis branch**: the scout considers whether the accumulated
  recorded evidence — the change feed, the snapshots, the corpus's data
  layer — supports a synthesis candidate instead. The branch opens an
  avenue and never lowers the bar: it is an opportunity, not an
  obligation, and a floor reintroduced through it would be the exact
  failure the no-cadence rule exists to prevent.
- When nothing clears the bar on either branch, the scout SHALL end with
  `RESULT.md` first line `blocked: nothing cleared the bar` — an honest
  outcome the ledger records as such, and a success. Zero candidates on a
  quiet day is the bar working; a candidate manufactured to fill a day is
  the failure. A quiet frontier is the same kind of outcome: nothing
  qualified is a finding, and a flag applied to fill a domain is the failure
  the criteria exist to prevent.
- **The blocked streak SHALL have a witness.** A `blocked:` scout outcome
  is a success everywhere it is counted — breakers exclude it, health
  streaks end on it — so nothing in the loop can distinguish a year of
  honest quiet from a bar nothing can clear. The build SHALL therefore
  derive, from `data/ledger.jsonl`, the count of consecutive scout runs
  ending `blocked:` (reset by any scout run that files a candidate) and
  record it in the published `/status.json` alongside the build stamp.
  Observability without obligation: no threshold, no floor, no breaker
  reads it — it exists so that a person or a later job can see the streak
  without excavating the ledger, and it obliges nothing.
- A scout run's diff — candidates and drop records, all model-written —
  SHALL pass the ordinary review gate before it merges, like every other
  Desk job's.

#### Scenario: A burst day is ranked, capped, and recorded

- **WHEN** a scout run finds five stories that each clear the bar
- **THEN** it files the three most worthy as expiring candidates, writes a
  drop record for each of the other two naming the judgment, and the merge
  enforces the cap mechanically if it files more

#### Scenario: A frontier story is filed beside a full docket

- **WHEN** a scout run has already filed three candidates and finds a fourth
  story that qualifies under F1–F5 in a domain the vocabulary carries
- **THEN** it files that story as a fourth candidate declaring `frontier: true`,
  its criterion and its domains, and the merge keeps all four — the cap counts
  the three unflagged ones

#### Scenario: A flag with no criterion is not filed

- **WHEN** a scout run files a candidate declaring `frontier: true` with no
  `frontier_reason`
- **THEN** the candidate is not filed, the merge drops it naming the missing
  criterion, and it does not take one of the three unflagged places

#### Scenario: An inward-looking scout is rejected

- **WHEN** a scout run's three candidates could all have been written from
  the repository's own contents, with no externally retrieved evidence
- **THEN** review rejects the run as `spec-violation` naming the charge —
  bring back what the site could not have thought of by looking at itself

#### Scenario: A quiet day opens the synthesis branch and still publishes nothing

- **WHEN** no external story clears the bar and the accumulated evidence
  supports no synthesis worth a stranger's attention either
- **THEN** the scout ends `blocked: nothing cleared the bar`, the ledger
  records it, no candidate is filed, and nothing anywhere treats the day
  as a failure

#### Scenario: A quiet domain is not filled to look busy

- **WHEN** a domain has had no qualifying event for weeks and the sweep finds
  only routine checkpoints and price moves in it
- **THEN** the scout flags none of them, records the declines against the
  criteria they failed, and the domain stays quiet — a flag applied to fill a
  domain is the failure the criteria exist to prevent

#### Scenario: A long quiet spell is visible without being punished

- **WHEN** fourteen consecutive scout runs end `blocked: nothing cleared
  the bar`
- **THEN** `/status.json` reports the streak of 14, no breaker trips, no
  floor opens, nothing selects differently — and anyone reading the
  published status can see the quiet without opening the ledger

#### Scenario: A quiet day yields a synthesis instead

- **WHEN** no single headline clears the bar but three weeks of recorded
  licence changes show a shape no single event shows
- **THEN** the scout files one synthesis candidate carrying the evidence
  set and an `expires:` at most 14 days out, through the same review gate
