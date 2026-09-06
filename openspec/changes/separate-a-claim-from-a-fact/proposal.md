# Separate a claim from a fact

## Why

Two independent builds of `/frontier` rendered organisation **founding dates**
and **founders** under the label "claimed · unverified". Not as a near miss —
as the shipped surface, twice, by two builders who never saw each other's work
(`loops/ui-loop/graph/knowledge/implementer-ledger.md` rows 2 and 4; class
`semantic-mislabel`). `SPEC-REVIEW-GUIDE.md` calls it *"the single most repeated
defect of the run."*

Neither builder was careless. The corpus offered them nothing else to wire the
column to. A vendor claim and a founding date are the same shape in this
repository today — both are `source: cited` facts with a `source_url` and an
`accessed` date — so a column that wants "what the vendor says about itself"
has to pick facts by *some* rule, and the rule both builds picked was the
entry's first cited fact.

**Measured on this tree, 2026-09-05, and it is why that rule failed so
completely.** `content/wiki/org/` holds 16 entries; every one carries at least
one cited fact, 92 in all; and **`founded` is the first cited fact on 13 of the
16** (`alibaba-cloud` leads with `model_family`, `inception-labs` with
`product`, `meta-superintelligence-labs` with `flagship_weights`).
`mistral-ai.md` carries a `founders` fact. A board wired to the first cited fact
therefore prints a founding date on thirteen rows out of sixteen and a founder
on one, under a lede promising the vendor's own words. The defect was not a
coin-flip that came up badly; it was the near-certain output of the only
structure available.

**And the sharpest form of it:** every one of those thirteen `founded` facts is
cited from `en.wikipedia.org`. Not one is the vendor's own page. So what shipped,
twice, was an encyclopaedia's account of when a company was incorporated,
presented as that company's verbatim claim about itself. Two requirements below
catch that independently, and the division of labour is worth stating: the vendor
test blanks all thirteen on the source alone, because `wikipedia.org` is nobody's
vendor domain — and the claim record is what gives the column something true to
put there instead of a blank.

The one-sentence statement of what went wrong is RD-004's, and it is worth
keeping verbatim because the change exists to make it mechanically true:

> `source: cited` records that a value **carries a citation**, never that the
> citation is **the vendor's own assertion**.

This site has already learned the same lesson one layer down. `specs/wiki`'s
*"A listed price is a property of a listing, not of a company"* exists because
a perfectly accurate number was being attributed to the wrong party in prose,
and its remedy was never to change the value — it was to make the attribution a
separate, checkable thing. A vendor claim is that requirement applied to the
citation instead of to the sentence.

The order is `loops/ui-loop/graph/knowledge/DESK-ORDER-001.md` §4 (keeper-signed
2026-09-05) with its K44 amendment; the tracking issue is `addictedtoai-eb4l`;
the round-by-round reason for each clause is
`loops/ui-loop/graph/knowledge/SPEC-REVIEW-GUIDE.md` §4, which is the rubric
this draft was written against and which supplied every "why" below that the
repository itself cannot supply.

## What changes

**`specs/wiki`, added — the claim record.** A vendor claim becomes its own
content record, in `content/claims/`, naming its subject entry by declared id.
It carries a verbatim quote, the source URL, that URL's host, an accessed date,
the ability or field the claim is about, and a three-state `verified`. It is not
a fact on the entry and no surface may build one out of an entry's facts.

**`specs/wiki`, added — the vendor test.** A claim renders *as the subject's
own claim* only when the cited source's registrable domain (eTLD+1, from an
explicit public-suffix table) is one the subject publishes from. An org entry
gains an optional `publishes_from` list so a product-brand domain — Moonshot's
`kimi.ai` — can be declared rather than guessed.

**`specs/wiki`, added — the display contract.** The label rides on the claim,
not on a column header. The attributing party renders before the fragment it
attributes, so a clamp cannot eat it. The three verification states render as
three different things, and **absent renders no verification statement at all**.

**`specs/pulse`, added — the kinds are closed and get a home.** The kinds a
`data/changes.jsonl` line may carry become a declared closed list in one place,
with `lead-change` as a member. The Pulse refuses to append an unknown kind; the
build reports one rather than failing.

**`specs/pulse`, added — lead change versus rescoring.** A `lead-change` line
records that a declared metric's leader changed between two consecutive
snapshots, with a **computed** `cause` — `arrival`, `rescored` or `withdrawn`.
`data/derived/frontier.json` becomes a pure function of the latest snapshot and
the registry, and the history is seeded from the committed snapshots so the
surface is not empty on its first day.

**`specs/pulse`, added — an index is registered with its rights.** A metric is
declared with its publisher, direction, label and a recorded republication-terms
decision. No index value renders until a metric is registered *and* its rights
are recorded cleared — and the collapsed state SHALL be the computed result of
that lookup, never a hard-wired string.

**`specs/review`, added — the claim checklist.** A reviewer of a diff carrying
claim records fetches the source and confirms the quote in the bytes, judges the
inputs to the vendor test, and treats a verification state asserting more than
was done as `intent-not-measurement`.

## Why the record sits beside the entry and not on it

The order states this and the guide gives one line of reason for it
(*"Claim ages on the source's clock; a later verification must not dirty prose
(review hash)"*). Both halves are mechanisms in this tree, not preferences, and
both are checkable, so they are written out here.

**The review hash.** `MECHANICAL_FRONT_MATTER_KEYS` is `['timeline']`
(`lib/review-hash.mjs:71`) and `reviewedSurface` filters by key **name** with no
per-kind scoping (`:99-102`). A `claims` key on `entrySchema` would therefore
have exactly two fates and both are defects — the same fork
`tag-the-corpus-by-domain` walked for `domains`, arrived at from the other
direction:

- *On* the mechanical list: a verbatim quote a model transcribed publishes
  unreviewed, and — because the filter is by name across every kind — any other
  content kind that ever declares `claims` is exempted along with it.
- *Off* the mechanical list: a claim arriving on an org entry, or a verification
  landing next month on a claim already filed, changes that entry's reviewed
  surface. Its record reports `mismatched`, and `scripts/verify-launch.mjs`
  fails on a mismatch (`specs/review`, "Missing, unbound, and mismatched are
  three findings"). The remedy is a fresh verdict on prose nobody touched.

Beside the entry, both go away without an exemption. A verification landing on a
claim record dirties *that record's* hash and demands a fresh verdict on it —
which is correct, because the verification is the judgment, and the record is
six fields rather than a page of prose.

**The two clocks.** An entry's facts are re-checked on the entry's own cadence:
`fast` within 14 days, `slow` within 120 (`specs/wiki`; `VOLATILITY_DAYS`,
`lib/schema.mjs:66`), and the Pulse computes overdue facts every run. A vendor
claim is not that kind of statement. *"Anthropic said on 2026-08-27 that Opus 5
does X"* is true forever and re-checking it means nothing; what can change is
whether anyone has **verified** it, and that moves on the verifier's clock, not
the entry's. Putting the claim in the entry's front matter makes one file answer
to two freshness regimes, and the freshness pipeline has no way to say that some
of a file's facts are exempt.

## What a measurement changed: the closed kind list is not closed

The drafting directive and `DESK-ORDER-001` §4 both describe adding `lead-change`
to `changes.jsonl`'s **closed kind list**. That list does not exist.

Read from `data/changes.jsonl` on 2026-09-05 — 182 lines, every line parsed:

| `kind` | lines |
|---|---|
| `arrival` | 77 |
| `release` | 60 |
| `field_change` | 23 |
| `retirement` | 14 |
| `annotation` | 8 |

Those five are the kinds §4 names, so §4's inventory is right. But nothing in
the source tree declares them. They are string literals at four emission sites
(`pulse/lib/diff.mjs:209, 232, 250, 301`) plus the loop's annotation writer, and
every consumer tests equality against a literal of its own
(`lib/changes.mjs:172-173, 196, 202`; `pulse/lib/queue.mjs:323`;
`pulse/lib/diff.mjs:395`). A misspelled kind is written, committed, rendered
through `changedFeed`'s catch-all, and noticed by nobody.

**The one thing that looks like the list is a decoy.** `MATERIAL_KINDS`
(`lib/changes.mjs:35`) is commented *"Material change kinds, in the order
specs/pulse names them"* and is imported **nowhere** — confirmed independently by
`loops/ui-loop/graph/knowledge/review-frontier.md:137` and by a live carried
finding, `data/carried/j-20260905-04-carry-1.md`, which records the same grep
from a reviewer's own run. Worse than dead: its five values are `price`,
`context`, `status`, `release`, `retirement`, and three of them are not kinds at
all. `price`, `context` and `status` are material **field** names — they travel
on a line's `field`, and they appear as a `kind` on **zero of the 182 lines**.
*(Qualified, finding `j-20260905-18-carry-2`, verified and applied 2026-09-06:
`price` and `context` are the spec's and registry's names for material field
**categories**, and what a line actually carries on its `field` is
`price_input`, `price_output`, `context_window` — or, for `status`, the word
itself. Re-parsing all 182 lines on 2026-09-06 gives `price_input` 8,
`price_output` 8, `status` 6, `context_window` 1, unchanged from the reviewer's
own run. The load-bearing half stands exactly as written and was re-measured
with it: all three appear as a `kind` on zero of the 182 lines.)*

`frontier-plan.md` §8 proposed that `MATERIAL_KINDS` *"gains the two kinds if the
feed filters on it"*; it does not filter, so that edit would have added
`lead-change` to a list nothing reads, in a file where `lead-change` was already
rendering through the catch-all.

So this change closes the list before adding to it. Adding a member to a list
nothing consults is the reads-as-present-and-does-nothing shape this repository
keeps catching, and here the decoy is already in the tree wearing the right
comment.

*(`data/carried/j-20260905-04-carry-1.md` is deliberately left in place. It is a
correction to a proposal's sentence, its own file is the queue item, and it
retires by being fixed and deleted in the same diff — not by this one.)*

## Rights, and the question the registry does not currently ask

K24 gates every index value on cleared republication rights, and §4 makes the
index registry the place that records them. Measured from
`data/sources/registry.json` on 2026-09-05: both registered sources
(`openrouter-models`, `llm-releases`) carry a `robots` block with a `checked_on`
date and a `verification` block with a fetch date and result. **Neither carries
any field about republication.** `specs/pulse` requires the registry to record
"robots/terms status", and what is recorded is fetch permission — *may we read
this* — which is a different question from *may we reprint what it says*.

Two other measurements move the design and correct the plan:

- The three Artificial Analysis index paths **are** in `openrouter-models`'
  `yields` today (`benchmarks.artificial_analysis.{agentic,coding,
  intelligence}_index`). `frontier-plan.md` §0.1 recorded them as absent from
  `yields` on 2026-09-04; that is no longer true. They are still in no
  `material_fields` entry, so they produce no change line and no history, which
  is the half of §0.1 that still holds.
- `benchmarks.design_arena[]` is in neither list.

Rights for both publishers are open questions with owners: `addictedtoai-ego8`
(Artificial Analysis; records that 29 live model pages already bind these
indices as facts) and `addictedtoai-c563` (Design Arena). This change registers
no index and clears no terms. It states what a registered index must carry and
what may not render until it does.

## What this change deliberately does not do

- **It builds no surface.** `/frontier`, the players board, its columns and its
  sections are the UI loop's brief. The display contract here binds *any* surface
  that renders a claim or an index value, which is the point of writing it before
  the surface exists rather than after — twice now, after.
- **It migrates nothing.** The 21 model entries that carry at least one cited
  fact, and the 92 cited facts on the 16 org entries, are untouched. Deciding
  which of them are claims, and filing the records, is editorial work through the
  review gate and belongs in a directive line. Until then the claim surface
  renders the honest empty state, which is §4's own instruction.
- **It clears no rights and registers no index.** `addictedtoai-ego8` and
  `addictedtoai-c563` are `verify` work.
- **It does not build the benchmark model.** `frontier-plan.md` §5's
  `benchmark:`/`verification:` blocks on cited facts, the `benchmark/*` entries
  and the evidence-file check are a larger design that overlaps this one at
  `verified` and is deliberately not folded in. Where they meet is named in
  tasks, not resolved here.
- **It does not add a job type or a queue reason.** Both are separately gated
  (`specs/loop`; `specs/pulse`, "Which job types the queue may produce is a
  stated decision") and neither is needed to file a claim record.
- **It does not touch `data/config.json`, `package.json` or
  `openspec/specs/`.**

## What I was least sure about

Six things. Each is a place where I resolved something the artifacts left open,
or resolved it against them; the ui-loop session holds the round that decided it
and I do not. A requirement whose reason is lost gets re-litigated or quietly
dropped by whoever implements it, so each says what I chose and what would
change if the round chose otherwise. **Ranked most to least likely to be wrong.**

1. **Declaring a vendor's brand domains in a new `publishes_from` field rather
   than in `aliases`.** DESK-ORDER-001 §2 and `SPEC-REVIEW-GUIDE.md` row 51 both
   say *"Org entries list product-brand domains as aliases"*, and this draft does
   not do that. Three reasons, and none of them outranks the round if the round
   meant it literally. An alias is a **name**: `NON_PROSE_FIELDS` classifies
   `aliases[].name` as *"a name — the site is about things called 'Claude 4.5'"*
   (`lib/schema.mjs:492`), and a hostname is not one. The alias registry decides
   what the wrap-only linker links (`lib/aliases.mjs:69`: linkable iff exactly one
   entry declares the name and that declaration is `exclusive`), so a domain in
   `aliases` is safe only for as long as nobody promotes its class — a latent
   trap rather than a design. And a board reading `aliases` would have to decide
   which of them are domains, by string shape, which is a field-name test
   standing in for a source test: implementer ledger row 10 exactly. If the round
   meant `aliases` because it wanted no new field, the mechanical consequences
   above are the argument to weigh, and this is the single item I would most want
   re-decided.

   **The strongest argument is not about `aliases` at all — it is about what
   the alternative to a *declared* field is, and this tree answers it.** The
   requirement says `publishes_from` *"SHALL NOT be inferred from the entry's own
   cited source URLs"* and did not say what goes wrong if it is. What goes wrong
   is the change's own motivating defect: every `founded` fact on
   `content/wiki/org/` was cited from `en.wikipedia.org` when this was drafted,
   so every one of those org entries "records citing itself from"
   `wikipedia.org` — and a derived, unfiltered branch run against this corpus
   attributes a Wikipedia-sourced claim to a named lab as that lab's own words.
   Ledger rows 2 and 4, arriving through the repair. That is a stronger argument
   than `aliases[].name` being classified as a name, and it is the one to put in
   front of a session asked to re-decide the field. *(Finding
   `j-20260905-18-carry-1`, verified and applied 2026-09-06. **Re-measured that
   day, and the count has moved:** `content/wiki/org/` now holds 24 entries
   carrying 16 cited `founded` facts, 15 of them from `en.wikipedia.org` and one
   from `github.com` (`org/bytedance-seed`). The argument is unchanged; the
   "thirteen of sixteen" figure elsewhere in this change is a 2026-09-05
   measurement and should be read with its date.)*
2. **Making the claim record a content type rather than a data record.** The
   directive says "a content record type", so `content/claims/` with a
   `claimSchema` in `SCHEMAS` is the literal reading, and it is the one that puts
   the record inside the machinery that matters: schema validation, field
   classification, the reviewed-surface hash, the review join. But every one of
   the six existing content types has a page of its own, and a claim does not —
   so `urlFor` (`lib/corpus.mjs:30-49`, which throws for an unknown type), the
   sitemap, the search index and the internal-link check each need an explicit
   carve-out, and a type that mints no route is new here. The alternative,
   `data/claims/*.md` beside `data/reviews/`, needs no carve-outs and loses the
   hash binding, which is most of the reason for filing the record at all. I took
   the literal reading; the carve-outs are named in tasks so the cost is visible.
3. **Storing the host and computing the registrable domain, rather than storing
   the registrable domain.** The directive says the record carries *"the source
   URL's HOST"*, which is what this draft requires, with the eTLD+1 reduction
   computed in one place. The reason for not storing the reduction is that the
   public-suffix table changes — RD-005's own worked example turns on `.google`
   being a single-label brand TLD — and a stored eTLD+1 would freeze whatever the
   table said on the day the record was filed. The reason for storing the host
   at all, given it is derivable, is that it makes the vendor test's input
   visible in the file a reviewer reads. If the round meant the record to carry a
   comparable domain so a renderer does no computation whatsoever, this is one
   field different.
4. **Closing the kind list, rather than only adding `lead-change` to it.** The
   directive describes the list as already closed. It is not, and the section
   above measures that. Closing it is the reading that makes "adding a member"
   mean something, and I believe it is what the sentence assumed rather than a
   widening — but it is more machinery than the sentence asks for, and the split
   I chose for enforcement (**the writer refuses an unknown kind; the build
   reports one and does not fail**) is a judgment. It follows `readChanges`'s
   existing stance — *"a malformed line is the Pulse's problem to report, not a
   reason for the site to stop rendering the other 59"* (`lib/changes.mjs:52-54`)
   — and it means a corrupt committed line never takes the site down. A reader
   who thinks the build should fail would be arguing with that comment, not with
   me.
5. **Including the index registry at all.** The directive names two artefacts,
   the claim record and the `lead-change` kind; §4 has three bullets and the
   third is the index registry. I included a narrow form of it because a "lead
   change" is *the leader of a declared metric changing* and there is no way to
   specify one without saying what declares a metric. What I deliberately kept
   out is everything downstream: no metric is registered, no column is specified,
   no surface is required. If the reviewing session reads §4's first bullet as
   belonging to the frontier-surface change instead, the metric declaration can
   be cut back to a bare reference and the lead-change requirement still stands.
6. **Requiring the lead-change history to be seeded.** `SPEC-REVIEW-GUIDE.md`
   row 53's build lesson is *"Both finalists' lead-change element was an empty
   state on day one"*, and `frontier-plan.md` §6.3 has the remedy — replay the
   committed snapshot blobs, which contain exactly one lead change (2026-09-02)
   and eight days of history. I made seeding a requirement because the ledger row
   is otherwise unencoded and the element ships empty a third time. But the eight
   days are thin, the baseline line says only *observation began here*, and there
   is a live tension with K24 that I resolved one way: a seeded line **records**
   the values it observed, because `specs/pulse` already requires every material
   change entry to embed its archived source reference, while **rendering** any
   index value stays gated on cleared rights. If the round meant that a line may
   not even carry a value it may not print, the excerpt requirement and the
   rights gate collide and someone should say which wins.

A seventh, smaller, recorded because it is a number rather than a judgment:
**DESK-ORDER-001 §4 says "21 cited facts exist across 446 model entries
today."** Measured 2026-09-05, **21 model entries carry at least one cited
fact**; the number of cited facts on model entries is 86, and the corpus carries
448 cited facts across 89 entries in all. Same shape as the 28-versus-23 listing
count `tag-the-corpus-by-domain` recorded and the 545-versus-544 file count both
siblings recorded: a count of files read as a count of fields. Nothing §4
concludes depends on which of the two numbers is meant — either way the claim
surface is empty until records are filed — but the figure is quoted downstream
and a justification nobody re-checks is how a settled decision gets reopened.

## What the review answered, and the two calls it left to me

`loops/ui-loop/graph/artifacts/SPECREV-001.md` (2026-09-05) returned **approve
with corrections** and answered six of the seven items above in its "AUTHOR'S
QUESTIONS" section: items 2, 3, 4 and 6 stand as drafted; item 5 keeps its
narrow form; item 7 is recorded for §4 v2 and is not a defect here.

**Item 1 the review deliberately did not decide.** D1 ends *"**KEEPER-CLASS** —
not decided here"*, and its answer to the question is *"the record does say
'aliases' and the author's three mechanical reasons are all real."* What
accepted the field was the **directive**, not the review: DESK-ORDER-001 §2 now
records the hosts field as the one to use, *"K48: originally worded 'as
aliases'; an alias is a NAME and the alias registry decides linking, so hosts
get their own field."* The distinction is the whole purpose of D1 — a divergence
has to read as a decision by a named decider rather than as compliance — so the
decider is named here. The requirement text is unchanged; only this sentence
was wrong. *(Finding `j-20260905-22-carry-2`, verified against SPECREV-001 and
DESK-ORDER-001 §2 and applied 2026-09-06.)* The divergence is also named in the
requirement itself rather than left implicit. The seven corrections are applied. Two of them required a judgment the
review's own edit text did not spell out, and both are here rather than in the
spec because they are about how far a correction reaches, not about what the
requirement says.

1. **The restored "records citing itself from" half carries a name-token
   filter, which D2's edit text does not mention.** D2 asks for the half back and
   cites `frontier.mjs`'s `orgOwnDomains` as the live rule; that function keeps a
   cited domain only where its registrable label is one of the org's own name
   tokens (`lib/render/frontier.mjs:317-326`), and R13 (v)'s prose states the
   half without that filter. I wrote the filter in, because the unfiltered
   reading is not merely looser — it admits `en.wikipedia.org` as a subject-owned
   domain for any org entry citing Wikipedia about itself, and measured
   2026-09-05 all thirteen `founded` facts in this corpus do exactly that. The
   unfiltered half would rebuild the founding-date defect inside the test written
   to end it. If the round meant the half without the filter, this is the one
   sentence to cut, and cutting it re-opens that path.
2. **L1 calls the empty derivation an empty `metrics` collection.** The review's
   edit text says "an empty leaders map", the directive says "an empty `metrics`
   array"; the requirement above already describes the file as leaders per
   declared metric plus ranked rows and counts. I wrote it as the metrics
   collection being empty — no leaders and no ranked rows — since with zero
   declared metrics both are empty and naming the outer container is the form
   that survives the file gaining a key. The property that matters, and the one
   ledger row 6 was filed for, is unaffected by which name is chosen: the file
   exists, carries the snapshot date, and is looked up rather than stood in for.
