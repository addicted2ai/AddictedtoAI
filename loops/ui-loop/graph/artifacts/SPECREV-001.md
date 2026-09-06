# SPECREV-001 — review of the `separate-a-claim-from-a-fact` delta

```yaml
id: SPECREV-001
version: 1
schema: loops/ui-loop/graph/schemas.md#evidence-note
date: 2026-09-05
depends_on: [SPEC-REVIEW-GUIDE, DESK-ORDER-001, implementer-ledger]
reviews: openspec/changes/separate-a-claim-from-a-fact (all five files)
```

Rubric: guide §4 (all nine rows), DESK-ORDER-001 §4 + K44, ledger 2/4/6/10, RT FM-N3/N5/N6, R13
round-4/5, and the implemented rule in `lib/render/frontier.mjs`.

**Passing all three tests, no correction:** record BESIDE the entry, both mechanisms written out
(wiki:36-51); `verified` tri-state, absent rendering *nothing* (wiki:101-116, 142-160); `verified:
true` fails the build; host stored and gated (wiki:76-81); no surface builds a claim from `facts`
(wiki:96-99); `cause` **computed, never judged** (pulse:98-103); index values gated on registered
*and* cleared rights, empty state computed, with a populate-the-fixture test (pulse:193-208, 234-239
— ledger #6); ties are all leaders (pulse:123-124, K34).

## DIFFERS

**D1 — `publishes_from` instead of `aliases` (wiki:223-249).** §2 and guide row 51 say *"Org entries
list product-brand domains as aliases"*; the delta creates a new field and forbids `aliases`
(wiki:244). The mechanical argument is strong and the author flagged it, but the delta reads as
compliance with §2 when it is a divergence. **KEEPER-CLASS** — not decided here.
*Edit either way:* under wiki:223 name the divergence — "§2 records this as an `alias`; it is a
separate field here because an alias is a name (`lib/schema.mjs:492`) and the alias registry decides
linking (`lib/aliases.mjs:69`)."

**D2 — the vendor test lost half the rule it cites (wiki:216-221).** R13 (v) and `frontier.mjs`
(`orgOwnDomains`, ~310-338) admit a source when its registrable domain is either **one the org entry
records citing itself from** *or* a name-token match. The delta keeps only `publishes_from` ∪ name
tokens and drops the recorded half with no note — a silent narrowing of a live, gate-enforced rule
(S22(e) re-derives both halves).
*Edit:* wiki:216 — restore "or one the subject's own entry records citing itself from
(`facts[].source_url`, `timeline[].source_url`)", or say in the same bullet that `publishes_from`
replaces it and why.

**D3 — the generic-token exclusion is gone (wiki:216-221).** `frontier.mjs` excludes generic
corporate words from name tokens (`GENERIC_NAME_TOKENS`: `ai, labs, cloud, inc, research, …`) so that
"Inception Labs" is `inceptionlabs.ai` and *never anything ending `labs.<anything>`*. The delta says "one of the subject's own name tokens — its `display_name`
and its declared `aliases`" with no tokenisation rule, so a naive implementer admits `labs.com` or
`research.example` for half the corpus. This is FM-N5's shape re-opened one label over.
*Edit:* wiki:216 — add "Name tokens are the whole normalised names and their words, **excluding
generic corporate words** (`ai`, `labs`, `cloud`, `inc`, `research`, `group`, …): a generic word is
not an identity, and admitting one re-opens the lookalike hole from the other side."

**D4 — the attribution clause is one-sided (wiki:309-318).** R13 (v) is two-sided: a name that
overruns the clamp fails, **and so does one taking more than 85% of it**, "since a cell showing its
vendor and none of its claim satisfies 'the name is visible' perfectly". Only the first survives.
*Edit:* wiki:318 — append "and the attribution SHALL NOT consume the clamp: a cell showing its party
and none of its claim satisfies 'the name is visible' and fails the requirement."

## REASON-LOST

Four of the five reasons are present and load-bearing: the founding-dates defect (wiki:22-30, with
the thirteen-of-sixteen and `en.wikipedia.org` measurement); "a field-name test is not a source test"
(wiki:182-197, ledger #10 with FM-N3's two live fields); the source-clock/review-hash reason for
BESIDE (wiki:38-51 and proposal:108-137, both mechanisms with file:line); the eTLD+1 spoof
(wiki:198-215, with both rejected tests named as what a second copy drifts back into).

**RL1 — the brand-alias blank keeps its reason, loses its detectability (wiki:223-229).** FM-N6's
point is that the failure is invisible: a real claim renders as a blank *indistinguishable from
having no claim*, and **no gate checks declaration completeness against the entry's own cited
domains**. The first half is at wiki:227-229; the second is not.
*Edit:* wiki:229 — add "No build check can detect an *absent* declaration, which is why filing one
is part of an org entry's editorial completeness rather than a gate: the blank looks correct."

**RL2 — the review delta judges verbatim-ness well but not why (review:18-26).** Fetch-and-confirm,
the instrument clause, the `false`-as-placeholder rejection (33-39) and the measurement-as-claim
`spec-violation` (40-45) are all correct. Missing: why a reviewer and not a gate does this.
*Edit:* review:17 — add "The build can check every field of this record except the one that matters;
`quote` is checkable only against the source, and only by a reviewer."

## LEDGER

Rows 2/4 (founding facts as claims): encoded, with a scenario (wiki:133-140) and the honest empty
state. Row 10 (field-name allow-list): encoded at wiki:194-197, correctly stronger than the
implementation, which still carries a field allow-list *plus* the source test.

**L1 — row #6 covers the index board but not `frontier.json` itself (pulse:117-124).** The
derivation is a pure function of the latest snapshot and the registry, and an uncleared metric is
still usable for computing a leader. But nothing says what the file holds when **zero metrics are
declared** — the state on the day this lands, and the day both finalists shipped a hard-wired empty
element.
*Edit:* pulse:124 — add "With no declared metric the file SHALL still be written, carrying an empty
leaders map and the snapshot date, and every surface's empty state SHALL be read from it — declaring
a metric populates the surface with no further edit."

## OUT-OF-SCOPE

Scope beyond §4, not defects: closing the kind list and deleting `MATERIAL_KINDS` (pulse:16-59) —
§4 assumes a closed list that does not exist; the metric registry shape (pulse:171-218) — §4 bullet
1, narrow form; seeding (pulse:130-136) — carried by guide row 53; `content/claims/` as a seventh
content type with route carve-outs (tasks 1-11); the display contract (wiki:295-331) — R13
round-4/5, bound before the surface exists rather than after, twice.

**Collisions: none in requirement text.** No shared requirement name; `tag-the-corpus-by-domain`
adds the `domains*` keys and MODIFIES `directory`'s "No placement is ever sold", neither touched
here. Implementation-order coupling only: both add keys to a `.strict()` `entrySchema` and must
extend `PROSE_FIELDS`/`NON_PROSE_FIELDS` (whichever lands second re-runs `assertFieldsClassified`),
and both reason about `MECHANICAL_FRONT_MATTER_KEYS` and agree. `flag-what-moved-the-frontier`'s F2
requirement and pulse:209-213 state the same K44 rule twice — compatible; cross-reference at
pulse:213 so an edit to one is visibly an edit to both.

## AUTHOR'S QUESTIONS

1. **`publishes_from` vs `aliases`** — D1, **KEEPER-CLASS**: the record does say "aliases" and the
   author's three mechanical reasons are all real.
2. **Content record vs `data/` record** — as drafted. K44's reason for BESIDE is the source clock
   and the review hash, and only the content-type reading gets the hash binding — most of the reason
   for filing the record. The carve-outs are the price, named in tasks 5-6.
3. **Store host, compute eTLD+1** — as drafted. K44 says the record "carries the source URL host",
   and a stored reduction would freeze a suffix table that changes (R13 (v)'s `.google` case).
4. **Closing the kind list** — as drafted; the write/build asymmetry follows `readChanges`'s stated
   stance and no round contradicts it.
5. **Including the index registry** — keep the narrow form; a lead change is unspecifiable without
   saying what declares a metric.
6. **Seeding and K24** — the author chose correctly. Guide row 54 and K24 gate what **renders**; a
   history line carrying a value it may not print is not a render. *Edit:* pulse:136 — say so, so it
   is not re-litigated: "Recording a value in a history line is not rendering it; the rights gate
   binds the surface, not the record."
7. **"21 cited facts across 446 model entries"** — the author's measurement is right; §4's sentence
   is a file count read as a field count. Not a defect in the delta, which does not restate it.
   Recorded for §4 v2.

## VERDICT

**Approve with corrections.** Seven edits — D1 (divergence note; the field choice itself is
KEEPER-CLASS), D2, D3, D4, RL1, RL2, L1 — plus one-line additions at pulse:136 and pulse:213. None
touch the change's shape; each is a sentence. D3 is the only one that would ship a defect if left.
