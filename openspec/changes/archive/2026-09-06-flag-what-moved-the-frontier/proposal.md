# Flag what moved the frontier

## Why

The UI loop built `/frontier` twice and both builds hit the same ceiling: the
surface wants "what actually moved" and the corpus has no way to say it. Its
order to the Desk — `loops/ui-loop/graph/knowledge/DESK-ORDER-001.md`, signed
off by the keeper on 2026-09-05 — opens with §1, and §1 is a data and spec
change, not a template change: *"The Frontier's domain section is driven by
scout-flagged, domain-tagged editorial records: the three most recent per
domain, with leaders-by-index secondary where a licensed index exists. Not a
feed, not a ranking."*

The first thing that order rules out is the obvious thing. The keeper first
asked for "top 3 models per domain" (`SPEC-REVIEW-GUIDE.md`, the 9c9t table's
first row, which records the round each clause came from); a ranking was
refused because `directory`
forbids stating a rank as its own claim, because the only ranking data on disk
has unverified republication rights, and because — the reason that actually
decided it — a ranking table has no motion in it. What replaced it is a
record: something happened, on a date, with evidence.

That leaves the question this change answers: **what makes a story frontier,
and who says so.** Without a bar, "frontier" is a flag every candidate would
carry, because it is about to be worth carrying — §1 exempts a flagged story
from the scout's three-candidates-per-day cap. An exemption without a bar is a
loophole, and an exemption without a binding budget behind it invites flagging
everything.

This change transcribes §1's criteria, its not-qualifying list, its build gate
and its cap clause into `specs/blog` and `specs/loop`. It re-decides none of
them. Where §1 and the drafting directive differ in wording, the order's own
words are used, and `loops/ui-loop/graph/knowledge/SPEC-REVIEW-GUIDE.md` — the
row-per-requirement record of which round decided what, and which finding
forced it — is the rubric this draft was written against.

### The collision that is already settled, and must not be re-litigated

F2 qualifies *"a lead change on a published index, or a rescoring that moved a
leader."* K24 forbids rendering an index **value** until republication rights
clear, and Artificial Analysis's terms URL 404'd on 2026-09-05
(DESK-ORDER-001 §4; beads `addictedtoai-ego8`, `-c563`). Read naively, F2
authorises exactly what K24 forbids.

It does not, and the resolution is anchored in K24's own wording: **the
publisher's act is not the publisher's numbers.** An F2 record may describe a
rescoring qualitatively — who published, which index and version, on what
date, in which direction, how far coverage moved as a count of rows scored
before and after, and the fact that a non-uniform rescoring can invert
orderings. It may not carry an index value, a ratio, a rank or a per-model
score. Those are derived from republished numbers; they belong in the review
record, where a reviewer can check the work, and never on the page.

**The permitted list and the forbidden list both go into the spec, and the
reason is a defect this repository has already paid for.** The board's claim
cell was built with an allow-list keyed on field names, and it admitted a
router's measured throughput and a third-party analysis site as "vendor
claims" — recorded as row 10 of
`loops/ui-loop/graph/knowledge/implementer-ledger.md`, dated 2026-09-05,
against red-team finding FM-N3, and summarised there in one line:
*"Field-name test without a source test."* F2 has that shape exactly: a rescoring described by its
numbers becomes a republished value **by accident**, with nobody having
decided to republish anything. A list that says only what is permitted is the
same defect one layer up.

### The worked example is live, and every number in it is permitted

Measured in this repository on 2026-09-05, from the two committed OpenRouter
snapshots — `data/sources/openrouter-models/previous.json` (`fetched_at`
`2026-09-04T06:00:03.738Z`, 427 rows) and `latest.json` (`fetched_at`
`2026-09-05T06:00:04.599Z`, 431 rows):

| measure | 2026-09-04 fetch | 2026-09-05 fetch |
|---|---|---|
| rows carrying a numeric `benchmarks.artificial_analysis.intelligence_index` | 164 | 52 |

Of the 164 scored rows in the earlier snapshot: 113 were still present and had
lost the score, 1 had left the snapshot, and 50 still carried a score — all 50
lower than before, none higher, none unchanged. Two rows new to the later
snapshot carry a score, which is how 50 carried forward becomes 52.

The publisher's act behind it is recorded in `data/sources/registry.json`
(the `declined_fields` note, `decided_on: 2026-09-05`), which cites Artificial
Analysis's own article *"Announcing Artificial Analysis Intelligence Index
v4.2"*, dated September 4, 2026, at
`https://artificialanalysis.ai/articles/artificial-analysis-intelligence-index-v4-2`,
and quotes it: *"Index v4.2 has more complex and realistic tasks, and more
private test sets to prevent gaming."*

Read that table against the two lists. Publisher, index, version, date,
direction, coverage before and after — every cell of it is on the permitted
side. Not one index value appears. That is the point of the worked example: the
compression-of-cadence story is fully tellable inside the constraint, and it is
precisely not the benchmark history the keeper feared this surface would
collapse into.

## What changes

**`specs/blog`, added.** A post may declare `frontier: true`. When it does it
SHALL declare `frontier_reason` — exactly one of F1–F5. `domains` is optional,
flagged or not; every value it carries must come from the closed vocabulary,
and carrying none means "general" (K46, below). The build fails a flag with no
criterion, a criterion outside F1–F5, or a domain outside the vocabulary — and
does not fail an absent one. F1–F5, the not-qualifying list and its test are
transcribed verbatim.

**`specs/blog`, added.** The F2 rule: what an F2 record's copy may say and what
it may not, both listed, with the publisher's own changelog as the anchor.

**`specs/blog`, modified.** "Publishing is quality-gated, never quota-driven"
gains the cap exemption, and states its bound in the same breath: the flag
lifts a count, never a budget.

**`specs/loop`, modified.** "The scout looks outward, takes the best three, and
records the rest" gains the standing F1–F5 sweep, the candidate-level flag with
the same bar as the post-level one, and the mechanical exemption at merge — a
flagged candidate is not counted against the three, and a candidate whose flag
cites no valid criterion, or a domain outside the vocabulary, is not filed at
all.

## The mechanism the order does not mention, and this change must not walk into

A post's reviewed surface is its front matter minus
`MECHANICAL_FRONT_MATTER_KEYS`, and that list is `['timeline']` and nothing
else (`lib/review-hash.mjs:71`). The list is flat: `reviewedSurface` filters
keys by name across every content file, with no per-kind scoping
(`lib/review-hash.mjs:99-102`).

Two consequences, and both are load-bearing.

**Tagging a published post is a review event, and the cost is the correct
one.** Adding any of these three keys to a post that already carries a bound
review record changes the hash, so the record reports `mismatched`, and
`mismatched` fails the launch minimums (`scripts/verify-launch.mjs:681-683`).
Measured 2026-09-05: all 14 posts under `content/blog/` are named by at least
one review record carrying a `reviewed:` hash, so every one of them is in that
position. This is not a problem to route around — these three keys are
editorial judgments about what a story is and where it lands, and an editorial
judgment that publishes unreviewed is the thing `review` exists to stop. They
do **not** join the mechanical list. The backfill is therefore a `verify`
directive that goes back through the review gate, exactly as DESK-ORDER-001's
appendix already files it.

*(DESK-ORDER-001 §1 says 15 existing posts on 2026-09-05. The measured count of
post files is 14; `content/blog/` holds 15 `.md` files, of which
`content/blog/README.md` is the directory's own README and carries no front
matter. The discrepancy is a file count, not a missing post.)*

**A constraint this change places on the §3 change, because §3 could silently
undo it.** DESK-ORDER-001's K44 amendment puts machine-seeded `domains` values
on wiki entries "beside `timeline` in `MECHANICAL_FRONT_MATTER_KEYS`". Because
that list is matched by key name across all content kinds, adding the literal
key `domains` to it would also exempt a **post's** `domains` from the reviewed
surface — quietly deleting the review requirement this change just wrote,
without any change to `specs/blog` and without any error anywhere. The
seeded-values field on entries must therefore carry a name of its own, distinct
from any key a post declares. Recorded here rather than left for whoever
implements §3 to discover, and named as a task below.

## What this change deliberately does not do

- **It does not add the display contract.** §1's display contract is the UI's
  next brief and belongs to `site`, not to `blog` or `loop`. It is quoted here
  so that it is not lost between the two: *"per domain, the three most recent
  flagged records by `anchor.date`, each with kind, title verbatim, source,
  date; a domain with none shows its last dated record and its age ('nothing
  flagged in N days'), never feed arrivals as filler. Optional muted machine
  line per domain: catalog arrivals this week (count from `changes.jsonl`),
  visibly separate."* The empty-state half of that clause is not decoration:
  the red team's rot-within-a-week finding and Dated Ledger's 32 identical
  empty cells reading as a broken page (JV-sys v2) are what produced it.
- **It does not settle date semantics or title handling on the rendered
  section.** Two rules from the same round belong with the display contract and
  are recorded here so they travel with it rather than being lost between
  changes: **one date meaning per record kind, labelled** — a release date is
  the publication date, an arrival date is the catalog listing date, a claim
  date is the accessed date, and mixing them silently is the rot mode this was
  written against; and **news titles are carried verbatim and attributed, with
  any hype check applied to fixed copy only**, because release notes are hype
  by trade and rewriting a vendor's headline is not this site's job.
- **It does not register the radar feeds.** Hugging Face Hub, covered
  organisations' release RSS, arXiv listings and GitHub releases are §5, and
  §5 is ordinary registry data — `specs/pulse` says adding a source is not an
  OpenSpec change. This change states only that they are the scout's inputs and
  never display, which is the part that is a rule.
- **It does not touch the budget bounds.** The new-writing ceiling is unchanged
  at ≤45% and still refuses `post` and `scout` work over it, flag or no flag.
  Changing a bound requires an OpenSpec change, and this is not one.
- **It does not define the `lead-change` event kind or the vendor-claim
  record.** Both are §4, and §4 is its own change.
- **It does not decide who assigns a domain to an existing post.** The backfill
  is a directive line the keeper already has; this change supplies the rule the
  backfill is judged against.

## What the reviewing session settled, and what it left open

The draft this revises asked three questions it could not resolve from the
artifacts in this repository. The reviewing session answered the first, and the
answer changed the requirement rather than its wording — so the reason is
recorded here as well as in the delta, because a requirement whose reason is
lost gets re-tightened later by someone who never saw it.

**Settled: a frontier story with no domain.** The draft transcribed §1's
"at least one `domains` value" bar as written and named the cost it could not
resolve: §3 makes `text` not a value and "general" the unmarked default, so a
genuinely general story could not be flagged at all. Resolved as ruling K46,
taken under the K40 delegation, on the blind arbiter record
`loops/ui-loop/graph/artifacts/BLIND-002.md` — *"RESOLVABLE from the record:
option A. `domains` is optional on a flagged record; absent means general by
K38's own rule"* — and carried into DESK-ORDER-001 §1 the same day, whose
front-matter line now reads
`domains: [coding, agents]      # OPTIONAL (K46, BLIND-002): values from the closed vocabulary (§3); absent = general`
and whose gate line now reads *"`domains` may be absent: by K38 absence IS the
value 'general'"*. The gate that remains is `frontier_reason` ∈ F1–F5 required,
and any `domains` value outside the vocabulary fails; absence is not a failure.

BLIND-002 also records why this overturns no keeper decision, which is the part
worth keeping: K30's bar was spoken while the recommended vocabulary still held
`text`, so at that moment every general story had a value to carry and the bar
excluded nothing. K38 removed the value and nobody restated the bar, which left
it with an editorial effect no ruling states. The four posts this draft named —
`content/blog/doj-statement-of-interest-llm-training-fair-use.md` (a court
filing), `content/blog/eu-ai-office-first-enforcement-rfis.md` (a regulator's
enforcement action), `content/blog/glm-5-3-license-revenue-gate.md` (a licence
revenue gate) and `content/blog/openai-gpt-6-astra-system-card.md` (a system
card) — are F4- and F5-shaped events that map to no value in the vocabulary,
and under the amended gate every one of them is flaggable, undomained.

**One reading this revision had to make, and it is not the order's words.**
The amended gate names absence and says nothing about an empty list. The blog
delta states that `domains: []` means what an absent key means, on the ground
that K38 makes "general" a value rather than an omission — so the two spellings
cannot be made to differ without inventing a distinction no ruling draws. It is
a reading, not a transcription, and an implementer who disagrees should say so
before task 3 is written rather than after.

**Not this change's, and named so the absence is not read as an oversight.**
DESK-ORDER-001 §1 says the section renders a "general" lane under the same
three-most-recent rule. Where that lane sits relative to the domain-id ordering
is a presentation question — BLIND-002's "Scope of the ruling" assigns it to
BRIEF-UI-002, because §4.8 of `EN-domain-facet` orders sections by domain id
and "general" has no id — and this change writes no display rule at all.

Two questions the reviewing session left where the draft put them:

- **Where the domain vocabulary is defined.** §6 sequences §1 before §3, so
  the post gate needs the closed list before the wiki facet exists. This draft
  has the list defined once, in `lib/`, by this change, and read by §3 when it
  lands — one definition rather than two that drift.
- **Whether the exemption needs a numeric bound of its own.** §1 gives it
  none, and the budget ceiling is the stated brake. The draft adds none.
