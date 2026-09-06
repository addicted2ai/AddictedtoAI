# blog — delta for correct-wordings-the-archive-carried

Wording only. This delta changes no requirement, no gate, no field and no
behaviour: the MODIFIED block below is the live requirement copied whole, with
one sentence corrected. It exists because the sentence sat INSIDE a requirement
block when `flag-what-moved-the-frontier` was archived on 2026-09-06, so the archive merged it into
this constitution, and a live spec is only editable through a change.

The finding, the re-measurement and why each correction is wording rather than
substance are in this change's `proposal.md`.

**The correction:** "withdrawn as keeper ruling K46" becomes "withdrawn as
ruling K46, taken under the K40 delegation". K46 was not a keeper ruling.
`loops/ui-loop/state.md:59` records it as "**K46** (BLIND-002)" with no keeper
attribution, in a list that marks keeper decisions explicitly ("K23 keeper,
K24–K29 delegated"; "**K43** (keeper, 2026-09-05)"; "**K45** (keeper via
orchestrator)"), and BLIND-002's own "Scope of the ruling" says it in as many
words: *"This is not escalated: under K40 it is far short of 'insane
catastrophic project threatening'."* The passage exists to tell a later reader
who decided this and on what authority, which is exactly what the wrong
attribution destroys.

## MODIFIED Requirements

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
withdrawn as ruling K46, taken under the K40 delegation, on the blind
arbiter record
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
