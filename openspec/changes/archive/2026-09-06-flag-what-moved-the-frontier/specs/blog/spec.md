# blog — delta for flag-what-moved-the-frontier

Two requirements added and one modified. Nothing here changes what a post must
prove, how it is sourced, how it is anchored, or how it is reviewed: a
frontier-flagged post is an ordinary post that additionally says why it
qualifies and where it lands.

The criteria, the not-qualifying list and the cap clause are transcribed from
`loops/ui-loop/graph/knowledge/DESK-ORDER-001.md` §1, keeper-signed 2026-09-05,
and are not re-decided here. The F2 rule is that order's own K44 amendment,
which resolves F2 against K24: the publisher's act is not the publisher's
numbers.

## ADDED Requirements

### Requirement: A frontier flag is earned, declared, and gated at the build

A post MAY declare that it records something that moved the frontier. When it
does, the flag SHALL carry its bar with it — the criterion it qualifies under
and the domain it lands in — because the flag buys an exemption from the
scout's candidate cap, and an exemption without a bar is a loophole.

What the flag marks is a **record**: something that happened, on a date, with
evidence a reader can check. It is never a position in a ranking. A rank is not
a claim this site states on its own authority (`directory`), and a table of
positions has no motion in it — which is the whole reason a dated record and
not a leaderboard is what a frontier surface is built from.

Three front-matter keys, and only one of them is ever required:

- `frontier: true` — optional; absent means false.
- `frontier_reason` — REQUIRED when `frontier: true`; exactly one of `F1`,
  `F2`, `F3`, `F4`, `F5`.
- `domains` — OPTIONAL, flagged or not; zero or more values from the closed
  domain vocabulary: `coding`, `agents`, `image`, `video`, `audio`, `research`,
  `science-math`, `robotics`. "General" is the unmarked default and is not a
  value; `text` is not a value. **Absence is that default, spelled out**: a
  flagged record carrying no `domains` is a general one, not an untagged one,
  and an empty list means what an absent key means.

The criteria, one of which is cited and only one:

- **F1** — a capability shown for the first time, with an artifact anyone can
  check (executed transcript, paper with code, public demo).
- **F2** — a lead change on a published index, or a rescoring that moved a
  leader.
- **F3** — a release by a covered organisation of a model it positions as its
  frontier, or an open-weights release matching a covered lab's frontier on a
  published measure.
- **F4** — a verbatim vendor claim by a major player about a new ability,
  labelled unverified.
- **F5** — a material change in access: a frontier model withdrawn, gated, or
  opened.

**Not qualifying:** a new checkpoint, a price change, a benchmark post with no
new artifact, a tool release. The test, stated as the test rather than as a
list to be extended: *what every other AI news site already shows does not
qualify on its own.*

The build SHALL fail a post declaring `frontier: true` with no
`frontier_reason`, with a `frontier_reason` outside F1–F5, or with any
`domains` value outside the closed vocabulary — naming the post file and the
offending field, before any page renders. **A post carrying no `domains` SHALL
NOT fail**, flagged or not. The domain vocabulary SHALL have exactly one
definition in the source tree, shared with every other surface that reads a
domain, because two closed lists of the same eight values drift and the drift
is silent.

**That the absent case passes is a decision, and it is recorded here because it
is the kind of bar that gets re-tightened by someone who has forgotten why it
loosened.** An earlier draft of this requirement made `domains` required when
the flag is set, transcribing DESK-ORDER-001 §1 as it then stood. The bar was
withdrawn as ruling K46, taken under the K40 delegation, on the blind arbiter record
`loops/ui-loop/graph/artifacts/BLIND-002.md`, and §1's own gate line was
amended to match. Two reasons, and both are about the vocabulary rather than
about this surface. First, K38 makes "general" the **unmarked** default and
removes `text`, so absence is not a missing value but a stated one — and a gate
that fails a record for carrying the vocabulary's own default contradicts the
vocabulary it is enforcing. Second, the ≥1 bar was written while `text` was
still a value a general story could carry; at that moment it excluded nothing,
and it acquired an editorial effect no ruling ever stated only when K38 removed
the value. The cost is concrete: a court filing, a regulator's enforcement
action, a licence revenue gate and a system card are F4- and F5-shaped events,
and four such posts existed on 2026-09-05 —
`content/blog/doj-statement-of-interest-llm-training-fair-use.md`,
`content/blog/eu-ai-office-first-enforcement-rfis.md`,
`content/blog/glm-5-3-license-revenue-gate.md` and
`content/blog/openai-gpt-6-astra-system-card.md` — none of which maps to any
value in the vocabulary. Under the withdrawn bar not one of them could be
flagged at all, which would make the criteria above unreachable on the one
surface the flag exists to populate.

These three keys are **editorial judgment and not machine-maintained data**.
They SHALL NOT be exempted from a post's reviewed surface: adding or changing
any of them on a published post is an edit to what was reviewed, it makes that
post's review record report `mismatched`, and it is corrected by review rather
than by exemption. Tagging a post is a review event, and paying that cost is
the point — what a story is, and where it lands, is exactly the kind of
judgment this site does not let publish unreviewed.

#### Scenario: A flag with no criterion fails the build

- **WHEN** a post declares `frontier: true` and no `frontier_reason`
- **THEN** the build fails naming the post file and the missing field, before
  any page renders

#### Scenario: A flag with a domain outside the vocabulary fails the build

- **WHEN** a post declares `frontier: true`, a valid `frontier_reason`, and
  `domains: [text]`
- **THEN** the build fails naming the post file and the invalid value — the
  vocabulary is closed, `text` is the value K38 removed from it rather than one
  it forgot, and a domain the section cannot group by is not a domain

#### Scenario: A flagged story with no domain is general, not invalid

- **WHEN** a post covering a court filing declares `frontier: true` and a valid
  `frontier_reason`, and declares no `domains` at all
- **THEN** the build passes and the post is flagged — its absent `domains` is
  the vocabulary's unmarked "general", not an unfilled field, and nothing
  treats the absence as a defect to be repaired

#### Scenario: A price change is not a frontier story

- **WHEN** a draft note covers a vendor cutting a headline price and declares
  `frontier: true` citing F5
- **THEN** review rejects the flag as `spec-violation` naming the
  not-qualifying list — a price change is what every other AI news site
  already shows, and F5 is a change in access, not in price

#### Scenario: Tagging a published post goes back through review

- **WHEN** `frontier`, `frontier_reason` and `domains` are added to a post that
  already carries an approved review record
- **THEN** that record reports `mismatched` and the post is not cleared until a
  new verdict is recorded against the changed bytes

### Requirement: An F2 record carries the publisher's act, never the publisher's numbers

An index rescoring is a real event and one of the most consequential a
frontier surface can report — a leader can lose the lead without anything
shipping. It is also the one criterion whose natural telling is a republication
of somebody else's numbers, which the rights rule forbids until republication
terms are cleared and recorded.

Both halves hold at once, and the seam between them is stated as two lists
rather than one. **Permitted in an F2 record's copy:**

- the publisher;
- the index name and its version;
- the date;
- the direction of the rescoring;
- the coverage change, as a count of rows scored before and after;
- the fact that a non-uniform rescoring can invert orderings.

**Forbidden in an F2 record's copy:** any index value, any ratio, any rank, any
per-model score. These are derived from republished numbers. They belong in the
review record, where a reviewer can check the author's work, and never on a
rendered page.

Both lists are normative and neither may be dropped as redundant. A list that
says only what is permitted is not a source test — it is a field-name test, and
a field-name test has already failed in this corpus: an allow-list keyed on
field names admitted a router's measured throughput and a third-party analysis
site as vendor claims, because the names matched and the sources did not. F2
has that shape exactly. A rescoring described by its numbers becomes a
republished value **by accident**, with nobody having decided to republish
anything.

An F2 record SHALL anchor on the **publisher's own changelog or announcement**
for the rescoring, cited and quoted verbatim, under the ordinary anchor rules.
Where the publisher's page states the act but not its shape, the record SHALL
say so and rest its shape on its own measurement of what it observed — an
anchor is evidence of the act, not a substitute for measuring the effect.

This requirement governs an F2 record's copy. It does not license an index
value anywhere else, and it does not clear anyone's republication terms; index
values render only where a registry index exists and its rights are recorded as
cleared.

#### Scenario: A rescoring is told without a single score

- **WHEN** a publisher rebases its index and the note reports the publisher,
  the index and version, the date, that scores moved down and none up, and that
  the count of scored rows fell from one number to another
- **THEN** the record is within the permitted list, its anchor is the
  publisher's own announcement quoted verbatim, and it publishes

#### Scenario: A median is a value

- **WHEN** an F2 draft states the median ratio by which the rescored index fell
- **THEN** review rejects it as `spec-violation` naming the forbidden list —
  a ratio derived from republished numbers is a value however it is aggregated,
  and it belongs in the review record instead

#### Scenario: A leaderboard position is a rank

- **WHEN** an F2 draft names which model took the lead and which it displaced
  by citing their positions on the published index
- **THEN** review rejects it as `spec-violation` — a rank is on the forbidden
  list, and the lead change is reported as the publisher's act, attributed and
  dated, without the table it came from

## MODIFIED Requirements

### Requirement: Publishing is quality-gated, never quota-driven

There SHALL be no minimum posting cadence: zero posts in a week is a
normal, healthy outcome — and, on the measured event supply, a rare one. A
day with no qualifying headline opens the scout's synthesis branch (see
`loop`); it never lowers the bar.

There SHALL be no count ceiling on published posts, and no selector gate or
build warning SHALL count them. What bounds volume, each bound enforced at
its own named point:

- the scout's cap of three candidates per day, mechanical at its merge
  (see `loop`), from which a candidate flagged `frontier: true` is exempt —
  the flag carries its own bar (the frontier requirement in this
  specification), and a flag citing no valid criterion, or a domain outside
  the vocabulary, is not filed at all;
- the editorial bar, applied by the author (an honest `blocked:` is a
  success) and by review's kill discipline, with declined candidates
  recorded rather than deferred;
- the new-writing model-minute ceiling and the capacity-shedding order in
  `loop`, which bound volume from outside the blog's own rules and are
  owned by `loop`, not by anything here.

**The frontier exemption lifts a count, never a budget.** `post` and `scout`
work over the new-writing ceiling is refused whether or not a candidate carries
the flag, and nothing about the flag changes the ceiling, the upkeep floor or
the shedding order. Both halves are required and neither substitutes for the
other: a bar with no budget behind it makes flagging everything the rational
move, and a budget with no bar in front of it spends the whole ceiling on
stories that did not qualify.

A post exists because something happened worth an enthusiast's time, or
because accumulated evidence shows a shape worth a stranger's attention —
the editorial bar decides, never a schedule and never a quota.

#### Scenario: A slow week publishes nothing

- **WHEN** a week passes in which nothing clears the editorial bar
- **THEN** no post is published and nothing anywhere treats that as a
  failure

#### Scenario: A busy day is judged, not rationed

- **WHEN** five distinct stories all clear the scout's bar on one day
- **THEN** the scout files the three most worthy, records why the other two
  were declined, and every filed candidate that clears review publishes —
  no count gate refuses any of them

#### Scenario: A capacity glut does not become a glut of posts

- **WHEN** new-writing model-minutes reach their budget ceiling in a tier
- **THEN** the selector refuses further `post` and `scout` work in that
  tier until the window rolls, exactly as the budget requirement in `loop`
  specifies

#### Scenario: A frontier flag buys no budget

- **WHEN** new-writing model-minutes are at their ceiling in a tier and a ripe
  candidate carries `frontier: true` with a valid criterion and domain
- **THEN** the selector refuses it exactly as it refuses any other `post` or
  `scout` work in that tier — the exemption is from the candidate cap and from
  nothing else
