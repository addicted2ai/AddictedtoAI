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
181 across the same rebase. *(Re-measured over the same two snapshots for this
revision: all three presence counts reproduce exactly. The flat 181 is itself a
net — 2 rows lost `coding_index` and 2 gained it — so even the stable row is not
stationary, which sharpens the point rather than softening it.)* "Index
presence" is not uniformly stable or uniformly unstable, which is why the rule
is stated as a property of seeding rather than left to whichever field someone
tests first.

### The recommendation that came back with the ratification, and the decision on it

The review that ratified append-only seeding as **K47**
(`loops/ui-loop/graph/knowledge/DESK-ORDER-001.md`, "Amendments from the 1hjf
draft review", 2026-09-05) left one thing to the author: when a seeding signal
disappears for an entry, the Pulse *could* write a `field_change` line to
`data/changes.jsonl` so the disappearance is visible rather than silent.
**This change decides against it**, and the `wiki` delta says so in a sentence
rather than leaving it implied.

The offer is a real one and it is cheap — the kind already exists, so it needs
no new machinery — and append-only seeding does hide something: an entry keeps
a tag whose evidence has left the feed, and no page says so. But what the
record buys is visibility, not safety; nothing is lost either way. Three
findings, each checkable in this tree, decide it against.

1. **The registry has already ruled on this exact block, and this would be a
   fourth door into it.** `data/sources/registry.json` carries
   `benchmarks.artificial_analysis` under `declined_fields` with
   `decided_on: "2026-09-05"` and the decision *"not carried"* — *"Not a
   column, not a fact, not an event"* — on a measurement stated in the same
   note: across the 2026-09-04 and 2026-09-05 fetches *"181 values went
   number->null with 0 going null->number"*, and *"56 of the carrying row ids
   are `:batch`/`:free` twins of a canonical_slug already counted, so a per-row
   line would emit that one act more than once per model."* A disappearance
   line writes precisely the lines that decision refuses, from a code path that
   never consults `declined_fields`. `pulse/lib/diff.mjs` states the principle
   it would break, in its own words and from the last time this split bit: a
   field *"is an event in one place or in neither"* (`diff.mjs:377-378`).

2. **The volume is not 67 lines; it is 71, against a history of 182.** The
   166→99 figure in the table above is the *net* change in how many rows carry
   `agentic_index`, and an emitter fires on transitions rather than on a net.
   Counted directly over the same two snapshots, for the two fields task 11
   proposes as seeding signals: `agentic_index` went number→absent on **69**
   rows (and absent→number on 2, which is why the net is 67), and
   `coding_index` — whose presence "held" at 181→181 — went number→absent on
   **2** and absent→number on **2** underneath that flat total. So one night's
   rebase writes **71 lines**. `data/changes.jsonl` holds **182 lines**,
   counted in this tree on 2026-09-05 and the same total the
   `separate-a-claim-from-a-fact` delta measures independently: one publisher
   act would enlarge the site's entire recorded history by two fifths
   overnight, in the feed that renders on the home page. Some fraction of those
   lines restates a sibling: the registry's own note on the same event counts
   *"56 of the carrying row ids"* as `:batch`/`:free` twins of a canonical slug
   already counted. (The registry note's aggregate — *"181 values went
   number->null"* — is over all three indices under its own method; counting
   number→absent over every row in the earlier snapshot gives 185 for the same
   three. The instruments differ slightly and the conclusion does not; the 71
   above is this change's own count, over only the fields it proposes to seed
   from.)

3. **The argument that would have outweighed volume does not apply, and it cuts
   the other way.** These lines would not turn into model spend:
   `uninterpretedChanges` selects `field_change` lines whose `field` is in
   `INTERPRET_FIELDS` — `price_input`, `price_output`, `price`, `license`,
   `licence`, `status` (`pulse/lib/diff.mjs:110`, applied at `:399`) — and no
   domain-seeding field is among them, so no `interpret` job would be queued
   and no budget consumed. The record would be cheap. Cheap is not a reason to
   put 71 lines in front of a reader scrolling for the ones that are events; a
   feed nobody trusts is the more expensive failure, and it is the one
   `declined_fields` was written to avoid.

What is genuinely lost is worth naming rather than waving away: an entry can
carry a seeded `agents` whose only evidence has since vanished from the
snapshot, and nothing renders that. The place for that is not the append-only
history — it is `data/derived/`, which is recomputed from current state on
every run and is already where "what the snapshot says right now" lives. This
change does not build it and does not add a requirement for it here.

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
same value fails the build, and so does excluding a value that appears in
neither `domains_seeded` nor `domains`: an exclusion that removes nothing is a
stale edit, and the gate is what stops one sitting on an entry reading as a
decision while enacting nothing. The gate is safe precisely because seeding is
append-only — it reads two fields of the file it is validating, never the
feed's current contents, so a publisher dropping a signal cannot turn a green
build red on an entry nobody touched.

**`specs/directory`, added.** A tool listing MAY declare `domains`, optional,
from the same vocabulary, editorial and declared — never derived from
`category` by a lookup table. `category` is untouched: still required, still
exactly one, still the default grouping.

**`specs/directory`, modified.** "No placement is ever sold" gains `domain` in
its list of objective criteria and extends its ordering guarantee to domain
groupings: pure function of the domain ids, never declaration order, never
member count, never an index score or a measure of a domain's importance.

*The check that the MODIFIED block clobbers nothing.* A `MODIFIED` block
replaces the live requirement wholesale, so the question is not what it adds
but what it silently drops. Measured against
`openspec/specs/directory/spec.md` on 2026-09-05, splitting the live
requirement into units — its two paragraphs, the four bullets of its category
list, and its three scenarios, nine in all — **8 of the 9 are byte-identical**
in the MODIFIED block, and the ninth is the opening paragraph. Normalising
whitespace, that paragraph differs from the live one by exactly one inserted
word: `(name, date, price, status, category)` becomes
`(name, date, price, status, category, domain)`. Everything the modification
adds — the domain-grouping bullets, the paragraph naming the temptation, and
three new scenarios — is new units beside the nine, not edits to them.

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

*(DESK-ORDER-001 §3's implementation note and the drafting directive both said
545 wiki files. The measured count of files under `content/wiki/` is 545 and
the measured count of **entries** is 544; the difference is the root README.
Same shape as the 15-versus-14 post discrepancy `flag-what-moved-the-frontier`
recorded, and a file count rather than a missing entry. The order now carries
both, from the same 2026-09-05 amendment: "Counts: 544 wiki entries (545 files
incl. the README); 14 blog posts (15 files incl. the README)".)*

## What this change deliberately does not do

- **It does not seed anything.** Which feed fields seed which domains, and the
  Pulse code that writes `domains_seeded`, are implementation and are listed as
  tasks, not as requirements. The spec constrains the *regime* — append-only,
  from named feed fields, presence or contents never a republished value — and
  leaves the field list to the change that writes it, because adding a source
  is not an OpenSpec change (`specs/pulse`).
- **It does not put a seeding signal's disappearance in the changed feed.** The
  decision and the three measurements behind it are above; the `wiki` delta
  states the prohibition so that it is a rule rather than an omission somebody
  later reads as an oversight.
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

## What the reviewing session settled

Four things this draft resolved from the artifacts available and could not
confirm against the rounds that produced them. The ui-loop session read them on
2026-09-05 and **ratified all four rather than overturning any**; the outcome is
recorded in `loops/ui-loop/graph/knowledge/DESK-ORDER-001.md` §3 under
"Amendments from the 1hjf draft review". They are settled. Each is kept below
with its outcome attached, because a requirement whose reason is lost gets
re-litigated or quietly dropped by whoever implements it — and a decision
recorded without the doubt it resolved is the same defect from the other side.

1. **Which kinds may bear the facet.** DESK-ORDER-001 §3 names "models, orgs,
   tools, techniques and frontier indices". This draft makes it optional on
   **every** wiki kind instead. Two reasons: `entrySchema` is one schema for
   all kinds with no per-kind branching, so restricting it is new machinery
   rather than less; and the restriction would refuse obviously-correct uses —
   a `benchmark` entry for FrontierMath is `science-math` by any reading of the
   vocabulary, and `benchmark` is not on §3's list. Because the facet is
   optional and empty is legal, a kind that should not bear it simply never
   declares one. This was a **widening of §3 as written** and was flagged as
   the single thing in this draft most likely to be wrong. **Ratified**, with
   the draft's own reasoning adopted as the order's: *"the facet is optional on
   EVERY wiki kind (widened from §3's list; a `benchmark` entry for
   FrontierMath is `science-math` by any reading; one `entrySchema` for all
   kinds means restricting is more machinery, not less)."*
2. **Which "tools" §3 meant.** `EN-domain-facet.md` §0 is explicit that the 35
   curated listings under `content/directory/tools/` and the 38 entries under
   `content/wiki/tool/` are different sets. §3 says "tools" without
   distinguishing. This draft gives the facet to both, on the same reasoning as
   (1). **Ratified**: *"Both tool sets carry it: directory listings and wiki
   tool entries."*
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
   and on a post; the round may have decided otherwise. **Ratified**, in the
   order's own listing of the three field names and their shape:
   *"`domains_seeded` (machine, append-only, in `MECHANICAL_FRONT_MATTER_KEYS`),
   `domains` (editorial additions), `domains_excluded` (editorial removals);
   rendered set = (seeded ∪ domains) − excluded"*. The same bullet adds the one
   requirement this draft did not have — *"a gate fails an excluded value that
   is in neither seeded nor domains"* — which is the stale-edit gate above. It
   is what makes the third key defensible rather than merely permitted: an
   `override` that overrides nothing was the exact failure the third key was
   introduced to avoid, and until the gate existed the draft's own rules
   allowed one to sit on an entry indefinitely.
4. **Whether the seeding coverage §3 cites still holds after K38.**
   DESK-ORDER-001 §3 justifies choosing this vocabulary over the alternatives
   partly on coverage: "431/446 models partially via feed modalities".
   Measured on the 2026-09-05 snapshot, that figure counted `text`, which K38
   then removed from the vocabulary. Excluding it, **265 of 431 rows take at
   least one modality domain and 166 take none** — those 166 are text-or-file
   only, and under K38 they are correctly general and correctly untagged. The
   design is working as decided; the number quoted for it was stale. Flagged
   because it is the stated justification for option B over the alternatives in
   `EN-domain-facet.md` §5, and a justification nobody re-checks is how a
   settled decision gets reopened later. This draft did not reopen it and does
   not now. **Corrected upstream** rather than ratified: §3 was amended the same
   day to carry the recount instead of the stale figure — *"(measured 2026-09-05
   excluding `text`, which K38 removed: 265 of 431 feed rows take ≥1 modality
   domain and 166 take none and are correctly general/untagged; 181 carry an AA
   index for coding/agents)"* — so the order and this draft now state the same
   numbers.
