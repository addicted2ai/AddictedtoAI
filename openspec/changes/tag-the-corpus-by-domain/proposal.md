# Tag the corpus by domain

## Why

The UI loop built `/frontier` twice and both builds hit the same ceiling. Its
order to the Desk — `loops/ui-loop/graph/knowledge/DESK-ORDER-001.md`,
keeper-signed 2026-09-05 — puts the reason in §3: the corpus can say what a
thing **is** and cannot say what it is **for**.

`kind` is a partition — exactly one value, closed, permanent — and that is the
right shape for identity and the wrong shape for the question a reader arrives
with. "What is happening in video generation" has no answer inside any
partition by kind, because the answer is a model, an org, a tool and a
technique at once. The keeper's words for the gap (K22) were *"a new meta type
of 'domain' … to tie things together (tools, frontier, wiki)"*.

The obvious place to put it is the place that is already taken. A tool
listing's `category` is *"the job it is for"* (`directory`), which sounds like
the same question and is not. Measured on 2026-09-05: of the 35 curated
listings under `content/directory/tools/`, **23 map to no domain at all** —
`local` (5), `inference` (5), `training` (3), `observability` (3), `data` (3),
`frameworks` (2) and `evaluation` (2) are jobs performed across every domain
and belonging to none. That is the count under `EN-domain-facet.md` §4's own
mapping, which sends `retrieval` (3) → `research`; leaving `retrieval` unmapped
instead gives 26. An axis that leaves at least two listings in three with
nothing to say is a different axis, not a refinement of the existing one.

*(The upstream artifacts state 28 here — `EN-domain-facet.md` §4,
DESK-ORDER-001 §3 and `SPEC-REVIEW-GUIDE.md` row 36 all say "28 of 35 listings
map to no domain". Recounted from the tree on 2026-09-05, the seven categories
§4 itself lists as mapping to nothing hold 5+5+3+3+3+2+2 = 23 listings, and §4's
mapping accounts for the other twelve — coding (3), agents (2), image (2),
audio (2), retrieval (3). 28 is 35 minus the seven category **names**. The
conclusion §4 draws is untouched by the recount: most listings map to nothing,
so `domains` is optional on tools.)*

This change adds that second axis to `wiki` and to `directory`. It re-decides
nothing: the vocabulary, the closure, the two-field split and the ordering rule
are all §3 and its K44 amendment, and where §3 and the drafting directive
differ in wording the order's own words are used.
`loops/ui-loop/graph/knowledge/SPEC-REVIEW-GUIDE.md` — the row-per-requirement
record of which round decided what and which finding forced it — is the rubric
this draft was written against.

### The three open questions are closed, and this change treats them as closed

`EN-domain-facet.md` §6 left ten questions for the keeper. Three of them
blocked this change and all three are answered in §3:

1. **`text` is out and "general" is the unmarked default** (K38). The
   vocabulary is therefore eight tagged values: `coding`, `agents`, `image`,
   `video`, `audio`, `research`, `science-math`, `robotics`.
2. **No Artificial Analysis value renders until republication rights clear**
   (K24/K34; beads `addictedtoai-ego8`, `-c563`).
3. **Domain sections order by domain id**, a pure function of names — which is
   already what `directory` requires of the tool categories (K34, BLIND-001).

### The vocabulary gets exactly one home, and it already exists

`flag-what-moved-the-frontier` — the §1 change, drafted 2026-09-05 — needs the
same eight values for its post-level frontier gate, and its task 1 creates
`lib/domains.mjs` for them, with the note that *"the §3 wiki facet reads this
file when it lands rather than restating the list."* This change takes that
offer. It creates no second constant.

That is not tidiness. Two independent copies of eight strings drift, and the
moment they do, §1's gate and §3's gate are two different checks wearing one
name — a vocabulary that reads as present and does nothing, which is a shape
this repository keeps catching. The repo already has the pattern to copy:
`TOOL_CATEGORIES` was split out of `schema.mjs` into `lib/tool-categories.mjs`
(beads `addictedtoai-bju`) precisely so that a second consumer could read the
closed list without a second copy of it, and that file says in its own header:
*"nothing else should declare a second copy."*

### What a measurement changed about the seeding rule

DESK-ORDER-001 §3's K44 amendment says seeded values are machine-maintained and
sit beside `timeline` in `MECHANICAL_FRONT_MATTER_KEYS`. It does not say what
happens when a seeding signal **disappears**, and the artifacts do not settle
it. The obvious reading — recompute the seeded set from the current snapshot on
every run — is the one this change rejects, on evidence gathered while drafting
it.

Measured from the two committed OpenRouter snapshots,
`data/sources/openrouter-models/previous.json` (`fetched_at`
`2026-09-04T06:00:03.738Z`, `row_count` 427) and `latest.json` (`fetched_at`
`2026-09-05T06:00:04.599Z`, `row_count` 431):

| rows carrying a numeric field | 2026-09-04 fetch | 2026-09-05 fetch |
|---|---|---|
| `benchmarks.artificial_analysis.coding_index` | 181 | 181 |
| `benchmarks.artificial_analysis.agentic_index` | 166 | 99 |
| `benchmarks.artificial_analysis.intelligence_index` | 164 | 52 |

One publisher rebased one index overnight — Artificial Analysis's v4.2, the
same event `flag-what-moved-the-frontier` uses as its worked example, and this
table's third row reproduces that change's measurement independently. Under a
recomputing rule, that rebase would have **silently deleted an `agents` tag
from 67 entries**, with no editorial decision anywhere and nothing on any page
saying so. So seeding is append-only in this change, exactly as `timeline`
already is, and removal is an editorial act that goes through review.

The first row matters as much as the second: `coding_index` presence held at
181 across the same rebase. "Index presence" is not uniformly stable or
uniformly unstable, which is why the rule is stated as a property of seeding
rather than left to whichever field someone tests first.

## What changes

**`specs/wiki`, added — the facet.** An entry MAY declare domains from the
closed eight-value vocabulary. Set-valued, optional, empty legal and common,
orthogonal to `kind`. A value outside the vocabulary fails the build naming the
file, the field, the value and the allowed values — the treatment an unknown
`kind` already receives. The vocabulary has one definition in the source tree.
Domains are declared, never inferred from prose.

**`specs/wiki`, added — the two-field split.** `domains_seeded`
(machine-written, on `MECHANICAL_FRONT_MATTER_KEYS`, append-only),
`domains` (editorial, reviewed) and `domains_excluded` (editorial, reviewed,
suppresses a seeded value). The effective set is
`(domains_seeded ∪ domains) − domains_excluded`. Asserting and excluding the
same value fails the build; excluding a value nothing has seeded is legal and
inert.

**`specs/directory`, added.** A tool listing MAY declare `domains`, optional,
from the same vocabulary, editorial and declared — never derived from
`category` by a lookup table. `category` is untouched: still required, still
exactly one, still the default grouping.

**`specs/directory`, modified.** "No placement is ever sold" gains `domain` in
its list of objective criteria and extends its ordering guarantee to domain
groupings: pure function of the domain ids, never declaration order, never
member count, never an index score or a measure of a domain's importance.

## The mechanism this change must not walk into, named by the change that found it

`flag-what-moved-the-frontier`'s proposal contains a constraint addressed
directly at this one, and it is load-bearing:

> Because that list is matched by key name across all content kinds, adding the
> literal key `domains` to it would also exempt a **post's** `domains` from the
> reviewed surface — quietly deleting the review requirement this change just
> wrote, without any change to `specs/blog` and without any error anywhere. The
> seeded-values field on entries must therefore carry a name of its own,
> distinct from any key a post declares.

Verified rather than taken on trust: `MECHANICAL_FRONT_MATTER_KEYS` is
`['timeline']` (`lib/review-hash.mjs:71`) and `reviewedSurface` filters by key
name with no per-kind scoping (`lib/review-hash.mjs:99-102`). The machine key
in this change is therefore `domains_seeded`, which no post schema accepts, and
the editorial keys `domains` and `domains_excluded` stay inside the reviewed
surface on every kind that carries them. `flag-what-moved-the-frontier`'s task
6 makes the violation a red build; this change is the one that would have
tripped it, and does not.

The cost is real and is the correct one. Measured 2026-09-05, `content/wiki/`
holds **544 entry files** across six kinds (`model` 446, `tool` 38, `concept`
18, `org` 16, `technique` 15, `event` 11), plus `content/wiki/README.md`, which
is the directory's own README and carries no entry front matter. Every
editorial domain assignment on an already-reviewed entry rebinds that entry's
review record. Splitting the fields is what keeps that cost attached to the
judgments and off the machine's re-seeds.

*(DESK-ORDER-001 §3's implementation note and the drafting directive both say
545 wiki files. The measured count of files under `content/wiki/` is 545 and
the measured count of **entries** is 544; the difference is the root README.
Same shape as the 15-versus-14 post discrepancy `flag-what-moved-the-frontier`
recorded, and a file count rather than a missing entry.)*

## What this change deliberately does not do

- **It does not seed anything.** Which feed fields seed which domains, and the
  Pulse code that writes `domains_seeded`, are implementation and are listed as
  tasks, not as requirements. The spec constrains the *regime* — append-only,
  from named feed fields, presence or contents never a republished value — and
  leaves the field list to the change that writes it, because adding a source
  is not an OpenSpec change (`specs/pulse`).
- **It does not tag a single entry or listing.** The backfill is editorial work
  through the review gate, and it is a directive line, not a task here.
- **It does not create the index registry or give an index a domain.**
  DESK-ORDER-001 §3 names "frontier indices" among the facet's bearers, but the
  registry those indices would live in is §4 and does not exist — `specs/pulse`
  has no index-registry concept and `data/derived/frontier.json` is not in the
  tree. When §4 lands, a registered index declares its domain from this same
  vocabulary and reads the same constant. Recorded so it is not lost between
  two changes.
- **It does not render anything.** No surface is required to group by domain by
  this change. The ordering rule in `directory` is written so that it binds
  whenever such a surface appears — which is the point of putting it in the
  spec before the surface exists rather than after.
- **It does not clear anyone's republication terms, and does not let an index
  value onto a page.** Seeding reads whether a row carries an index, which is
  not what the index says. K24 is untouched.
- **It does not touch `themes`.** `content/wiki` entries already carry an
  optional set-valued `themes` array (`lib/schema.mjs:221`), which is an
  **open** vocabulary with no closed list and no build gate. It is a different
  mechanism for a different job and this change neither closes it, merges it,
  nor deprecates it. Naming it here so a reviewer does not read the omission as
  an oversight — and flagging that two adjacent free-form-versus-closed
  faceting mechanisms on one record type is a thing worth someone's judgment
  later.

## What is not settled, and is for the reviewing session

Four things this draft resolved from the artifacts available and cannot confirm
against the rounds that produced them. A requirement whose reason is lost gets
re-litigated or quietly dropped by whoever implements it, so each is named.

1. **Which kinds may bear the facet.** DESK-ORDER-001 §3 names "models, orgs,
   tools, techniques and frontier indices". This draft makes it optional on
   **every** wiki kind instead. Two reasons: `entrySchema` is one schema for
   all kinds with no per-kind branching, so restricting it is new machinery
   rather than less; and the restriction would refuse obviously-correct uses —
   a `benchmark` entry for FrontierMath is `science-math` by any reading of the
   vocabulary, and `benchmark` is not on §3's list. Because the facet is
   optional and empty is legal, a kind that should not bear it simply never
   declares one. This is a **widening of §3 as written** and is the single
   thing in this draft most likely to be wrong.
2. **Which "tools" §3 meant.** `EN-domain-facet.md` §0 is explicit that the 35
   curated listings under `content/directory/tools/` and the 38 entries under
   `content/wiki/tool/` are different sets. §3 says "tools" without
   distinguishing. This draft gives the facet to both, on the same reasoning as
   (1).
3. **Whether `domains_excluded` should exist at all.** The drafting directive
   names "any override of a seeded value" as an editorial judgment, and the
   guide's K44 row says "editorial assignments **and overrides** are a separate
   field". A third key is the least speculative reading that leaves "override"
   meaning something — with only two additive fields there is no way to
   suppress a wrong seed, and a requirement naming an override with no
   mechanism behind it is the reads-as-present-and-does-nothing shape again.
   But the alternative reading is that one editorial field carrying per-value
   include/exclude state was meant, in the shape `aliases: [{name, class}]`
   already uses. Three plain string lists were chosen over one list of objects
   so that `domains` means the same thing and has the same shape on an entry
   and on a post; the round may have decided otherwise.
4. **Whether the seeding coverage §3 cites still holds after K38.**
   DESK-ORDER-001 §3 justifies choosing this vocabulary over the alternatives
   partly on coverage: "431/446 models partially via feed modalities".
   Measured on the 2026-09-05 snapshot, that figure counted `text`, which K38
   then removed from the vocabulary. Excluding it, **265 of 431 rows take at
   least one modality domain and 166 take none** — those 166 are text-or-file
   only, and under K38 they are correctly general and correctly untagged. The
   design is working as decided; the number quoted for it is stale. Flagged
   because it is the stated justification for option B over the alternatives in
   `EN-domain-facet.md` §5, and a justification nobody re-checks is how a
   settled decision gets reopened later. This draft does not reopen it.
