# content/wiki/

Wiki entries — the site's cornerstone substrate. One file per entry at
`content/wiki/<kind>/<slug>.md`, whose id is `<kind>/<slug>`, kebab-case,
unique, never reused or renamed (`specs/wiki`).

`kind` comes from this closed list and no other value: `model`, `org`,
`tool`, `concept`, `technique`, `benchmark`, `dataset`, `hardware`, `paper`,
`event`. There is deliberately no `person` kind.

Stub entries minted mechanically by the Pulse (`specs/pulse`) land here too —
data-only, `manual`-classed aliases, no prose.

---

## Choosing the kind

The list above says what the values are. It does not say how to choose between
them, and the first place that gap bit was the catalog-coverage backlog.

### `org` is for organisations, and the absent `person` kind is why that binds

**Ruled 2026-09-05 (beads `addictedtoai-2ok0`).** `/frontier`'s Players Board
joins `content/wiki/org/*.md` to catalog providers by alias
(`lib/render/frontier.mjs:50`), so a provider no org entry matches never
surfaces on it. Replaying that join over `data/derived/catalog.json` on
2026-09-05: 431 rows, all `"source": "openrouter-models"`, carrying 58 distinct
`provider` values; 16 org entries match 24 of them and **34 are unmatched**.
Read the 58 with care — seven of those values are OpenRouter's `~`-prefixed
"latest" twins (`~anthropic`, `~deepseek`, `~google`, `~moonshotai`, `~openai`,
`~x-ai`, `~z-ai`), which the join's normaliser strips, so all seven land on an
org that was already matched. The distinct publishers are 51, matched 17. **The
34 is the figure that does not move**, and it is the one the backlog rests on.
`addictedtoai-2ok0` tracks closing that gap, and its acceptance criteria already
name the second acceptable answer — an org entry with a feeds map, *"or a
recorded decision not to cover them"*. This is that decision, for the part of
the 34 that is not organisations.

> **An `org` entry asserts that an organisation exists. File one only where you
> can source that one does.** Where the only thing sourceable is a publishing
> handle, `org` is the wrong kind, and the honest output is no entry — not a
> thin one.

The reason is not that such an entry would be thin. `specs/wiki` closes the kind
list and then says why one member is absent: *"There is deliberately no `person`
kind. People appear in prose as plain text, optionally with an external link.
This removes the nastiest alias-collision family (person vs. product) and the
defamation-adjacent risk of maintaining claims about living people."* Filing a
person's handle under `org` does not sidestep that decision — it takes both
risks the absent kind was removed to avoid, and adds a third thing the corpus
may not do, which is state that a company exists when nobody has shown one does.
Note which way the burden runs. The test fails for want of evidence, never on a
finding about the publisher: "no organisation is sourceable here" is a statement
about this repository's evidence and a reader can check it, while "this is a
private individual" is a claim about a living person, which is the exact thing
there is no kind for.

**Applying it, on evidence in this repository.** Four of the unmatched providers
are decided by their own feed rows in
`data/sources/openrouter-models/latest.json` (fetched `2026-09-05T06:00:04.599Z`),
which credit a handle and no organisation. Every quotation in this ruling is
from a row's `description` field in that snapshot:

| provider | rows | what the row carries |
|---|---|---|
| `sao10k` | 3 | two descriptions credit the model `from [Sao10k](https://ko-fi.com/sao10k)` — a handle and a donation page, no company; `hugging_face_id` `Sao10K/…` on all three |
| `thedrummer` | 3 | `unslopnemo-12b` reads *"the latest addition from the creator of Rocinante"* — a creator, singular, with no organisation anywhere in the row; `hugging_face_id` is the same handle on all three (`TheDrummer/…` twice, `thedrummer/…` once) |
| `gryphe` | 1 | `mythomax-l2-13b`: *"One of the highest performing and most popular fine-tunes of Llama 2 13B… #merge"*; `hugging_face_id` `Gryphe/MythoMax-L2-13b` |
| `undi95` | 1 | `remm-slerp-l2-13b`: *"A recreation trial of the original MythoMax-L2-B13 but with updated models. #merge"*; `hugging_face_id` `Undi95/…` |

**Four more are not settled by that evidence and are not decided here**, because
the same rows point the other way or say nothing. `cognitivecomputations`'s one
row says its model was *"developed by dphn.ai in collaboration with Venice.ai"*,
which names entities rather than a handle. `dots-studio`'s row describes *"an
open-weight mixture-of-experts model from Dots Studio, with 16B active
parameters out of 280B total"* and *"the lightest model in the Dots 3 family"* —
a family of models from a named studio, not a fine-tune under a handle.
`anthracite-org`'s handle carries `-org` and its row describes *"a series of
models"* while saying nothing about who publishes them. `mancer`'s row carries a
null `hugging_face_id` and identifies no publisher at all. Each needs the source
test run against a page the provider publishes before either an entry or a
decline is filed. **Recording four as undecided is the ruling working**: the
test is a source test, and a handle that merely looks personal is a name test —
the failure mode this corpus keeps catching.

### OpenRouter is an organisation, and already has an entry of a different kind

**Same ruling, 2026-09-05.** `openrouter` is the ninth unmatched provider, and
it is the opposite case. It is an organisation, and the most load-bearing one in
this data layer: every catalog row in the corpus arrives through it — all 431
rows of `data/derived/catalog.json` carry `"source": "openrouter-models"`.

Its six catalog rows are not the argument for that entry and must not be made
into one. They are routing products: `openrouter/auto` ("Auto Router"),
`auto-beta`, `free` ("Free Models Router"), `pareto-code` ("Pareto Code
Router"), `fusion` and `bodybuilder`. The Pulse has minted a `model/` stub for
each, correctly and mechanically — an undeclared row mints a stub and never
asks what the row is (`specs/pulse`).

**What exists and what does not.** `content/wiki/tool/openrouter.md` covers
OpenRouter as a tool and `content/directory/tools/openrouter.md` lists it; there
is no `org/openrouter`. The board joins **orgs**, so the tool entry does not put
OpenRouter on it. Two entries of different kinds for one company is the corpus
working as designed rather than a duplicate, and nothing collides: the tool
entry claims the alias "OpenRouter" as `manual`, and a name two entries declare
is simply not linkable — not a build failure, which only a doubly-claimed
`exclusive` is (`lib/aliases.mjs:10-13`).

### What carries the independent fine-tuners

Nothing new has to, and no new kind may be created for them — the list is closed
and opening it is an OpenSpec change. Three answers, in the order they apply:

1. **The models are already carried.** All 18 catalog rows across those nine
   providers have a minted `model/` entry — `data/derived/catalog.json` gives
   every one of the 18 a non-null `entry_id`, and the files are in
   `content/wiki/model/`. "They never surface" is true of the Players Board,
   which is an org board, and false of the corpus.
2. **The publishers appear in prose as plain text**, which is what the absent
   `person` kind already prescribes, with an external link where one is
   warranted. That is the whole mechanism, and it needs no new file.
3. **The practice is what deserves an entry, and its kind is `technique`.**
   Merging and community fine-tuning of open-weight base models is a technique
   this corpus does not cover: `content/wiki/technique/` carries
   `low-rank-adaptation.md`, `quantization.md` and `pruning.md`, and nothing on
   merging — while the feed labels two of these very rows `#merge` in its own
   description text. One entry about the practice can name the people who do it
   in prose, which is both the correct kind and the correct treatment.

**Not the directory.** `content/directory/tools/` is curated tool listings, one
file per tool, each declaring `url`, `pricing` and `last_verified`
(`content/directory/tools/README.md`). A person who publishes model weights is
not a tool with a pricing page, and listing one there would restate the same
category error in a second place.

---

## What an `org` entry declares

### The board joins orgs by alias, so an org entry carries no `feeds` map

**Ruled 2026-09-06 (job `j-20260906-11`, from the proposal
`org-directives-demand-a-feeds-map-that-cannot-exist`).** Eight `entry`
directives for uncovered catalog providers each carried the sentence *"WHAT THE
ENTRY MUST CARRY OR THE ROW IS BLANK: its `feeds` map, which is the join the
board relies on, and its product-brand registrable domains in
`publishes_from`"*. **The first half is false against the code and stays false;
the second half was false when it was ruled on and is now true** — `publishes_from`
landed with `separate-a-claim-from-a-fact`, and the section below says what it
is and how to fill it. The ruling stands as written about `feeds`, and the
section above repeats that half in passing — its *"an org entry with a feeds
map"* is `addictedtoai-2ok0`'s wording, quoted, and it is not the answer.

**The join is the alias join.** `matchProviders`
(`lib/render/frontier.mjs:50-61`) builds its provider set from
`org.data.display_name` and `org.data.aliases[].name`, normalises them, and
takes a catalog row whose `provider` value contains one of those names or is
contained by it. `feeds` is not read on that path — the word occurs in that
file only in the board's table caption and in comments. Board membership is
editorial and never feed-gated: every org entry is a row whether or not any
catalog row matches it (K21, `lib/render/frontier.mjs:535-549`).

**A `feeds` map on an org entry would be a wrong join, not a missing one.**
`feeds` binds an entry to a **source row id** — `specs/wiki`: *"using that
source's own id field"* — and neither registered source is keyed on an
organisation. `data/sources/registry.json` gives `openrouter-models` the
`row_id_field` `id`, a model slug, and `llm-releases` the `row_id_field`
`guid`, one release. The only value an org could write is therefore a model's
row id, and the three readers of `feeds` ask no kind question before acting on
it:

| what would read it | what it would do |
|---|---|
| `pulse/lib/corpus.mjs:219-235` — `feedBindings` / `declaredRowIds` scan `corpus.entries` whole | the row reads as already declared, so `pulse/lib/mint.mjs:139-142` mints no `model/` stub for it |
| `pulse/lib/mint.mjs:258-263` builds its status index the same way | the model's mechanical `deprecated` / `retired` timeline events land on the organisation |
| `lib/changes.mjs:60-67` — `feedRowIndex` keys one Map on `${source}\|${rowId}` | of the two entries claiming one row, whichever the loader reaches last silently wins the changed feed's entry link |

Measured 2026-09-06: none of the 24 files in `content/wiki/org/` contains the
string `feeds`, which is the corpus already agreeing with this ruling.

### `publishes_from` — the brand domains, and why omitting one is invisible

**Optional, set-valued, and empty is the common case.** Nothing requires an org
entry to declare a domain. But **omitting one that exists is the single failure
on this surface that nothing can detect**, so this is the paragraph to read
before deciding you have nothing to declare.

**What it is for.** A vendor claim renders as the vendor's own words only when
the claim's source belongs to the vendor. That question is answered off the
**registrable domain** of the source — the string a registrant actually bought —
by one rule, in `lib/vendor-domain.mjs`, with three admission paths and nothing
else: the domain is one the entry declares in `publishes_from`; it is one the
entry already records citing itself from; or its ownership label is one of the
entry's name tokens (`display_name` and `aliases`, minus the generic corporate
words — `ai`, `labs`, `cloud`, `research` and that family name nobody).

**A product-brand domain reaches none of those paths but the first.** It is not
a name token, and it need not appear in any source the entry is cited from.
Moonshot AI publishes from `kimi.ai`; `org/minimax`'s tokens come from
`MiniMax` and `MiniMax Group Inc.`, so `minimax.io` passes on its own while the
product domains `hailuoai.video` and `talkie-ai.com` do not. Undeclared, a real
vendor claim from one of those renders as a blank.

**And the blank is byte-identical to the correct one.** Nothing compares a
declared set against the entry's cited domains for completeness, and nothing
could: the entry validates, the claim validates, the render is well-formed. A
gate can catch a wrong declaration and can never catch a missing one — so the
burden is editorial, it is yours, and *"we declared nothing"* is not the safe
default it looks like. This is red-team finding FM-N6, and it is the failure
mode hardest to notice precisely because absence looks like correctness.

**How to choose a value.** Each one is a **registrable domain** — the public
suffix plus the one label to its left. Reduce before you declare:
`platform.kimi.ai` → **`kimi.ai`**; `www.tencent.com` → **`tencent.com`**;
`deepmind.google` is already registrable, because `.google` is a single-label
brand TLD (and for the same reason `blog.google` is a *different* registrant, not
a subdomain of it). Declaring the registrable domain covers every host under it,
which is what makes the field a statement about a registrant rather than a list
of URLs to keep current. The build fails a value that is not its own reduction,
naming the entry, the value and the reduction to declare instead — and refuses a
value shaped like a public suffix outright, because declaring one would attribute
every registrant under it to this entry.

**It publishes through review.** Asserting that a domain belongs to an
organisation is a judgment about who owns what, and a wrong one attributes a
stranger's words to a named company. `publishes_from` is on the reviewed
surface: adding it to an entry with an approved record marks that record
mismatched until a fresh verdict is recorded. That cost is the point.

**Do not reach for an alias instead.** Adding `hailuoai` to an org's `aliases`
would make the vendor test pass, and would also change the board join above,
the alias registry and every wrap-only link in the corpus — one name declared
for its side effect on a fourth mechanism. An alias is a **name**; a host is
not.

---

## Editorial standards for entry prose

Three rulings that bind every entry, written here because this is the file an
author opens before writing one and a reviewer opens before judging one. Each
was decided against a measurement; each names the mechanism that enforces it,
or says plainly that there is none.

### A cross-row price comparison is about the listings, never the vendors

**Ruled 2026-08-31 (beads `addictedtoai-58o`).** A `price_*` fact is
OpenRouter's headline for a row, and three separate things make that number a
property of the listing rather than of anybody's price list:

1. it is the **top provider's** rate, re-chosen on a rolling 30-second window;
2. **two rows need not be headed by the same provider** — measured spreads of
   4.9x between a headline and the vendor's own rate, and 7.05x across 33
   endpoints on a single row;
3. **one provider lists one row at several service tiers**, and the headline is
   only the standard one — measured live across 22 rows on 2026-08-31:
   `openai/flex` 0.5x, `openai` 1x, `openai/fast` 2x (a 5x spread inside OpenAI
   on one row); Google AI Studio flex/standard/priority at 1x/2x/3.6x; Azure
   regional at +10%.

Reason 3 is why the house hedge is not enough on its own. "These are top listed
provider's rates" answers reason 2 and leaves 1 and 3 standing. So:

> **Compare listings, never vendors and never models.** Say what the catalog
> shows — "this row lists X against that row's Y", "heads at", "carries" — and
> never say what the difference *means*: not "a surcharge", not "a premium",
> not "an introductory rate", not "X is twice Y".

The repair is grammatical, not parenthetical. A caveat appended to a comparison
between two models leaves the comparison asserting a relation between the
models; only changing the subject to the listings repairs it. Two real
sentences were withdrawn for exactly this and both were false: `z-ai.md`'s "the
closed price is exactly double the open one" (1.2x at Z.ai's own rates, not 2x)
and `nvidia.md`'s "this one is a surcharge" (NVIDIA has no endpoint on either
row, so the gap is two unrelated hosts).

**Mechanised in part.** `lib/price-attribution.mjs` fails the build on a
sentence carrying price transclusions from two or more different entries with
no listing verb in it. It fires zero times on the corpus today and caught the
`nvidia.md` sentence in the pre-repair tree. **It cannot reach an UNBOUND
ratio** — a multiple computed from the snapshot and typed into prose with no
transclusion beside it, which is the shape `z-ai.md` had. That half is yours to
get right; a lexical detector for it was built, measured against the corpus,
and rejected because all seven of its hits were legitimate prose
(`addictedtoai-r4m`).

### A quotation names its version; a reference does not

**Ruled 2026-08-31 (beads `addictedtoai-2xh`).** `arxiv.org/abs/<id>` serves the
**latest** version. Quoting a paper against that URL names a document that
moves: this corpus already carries a sentence that is in `2211.04325`'s v1
abstract and gone from its v2, and `2211.00241`'s headline win rate went 50% →
77% → 97% across v1–v4.

> **Quoting pins. Referring does not.** If you reproduce words from a paper,
> cite `/abs/<id>vN` — the version you took them from. If you are pointing a
> reader at the paper without quoting it, leave the URL unversioned, because
> there the citation's job is to track the live document and freezing it
> defeats that job.

A versioned `/abs/` page is a full landing page — it renders that version's
abstract, lists every version, and links the latest — so pinning costs a reader
one click and buys a quotation that stays attributable.

**Mechanised.** `lib/arxiv-pin.mjs` runs as its own prebuild step and fails on a
verbatim quotation (five words or more, in a sentence with the link, or inside a
`facts[].value`) cited to an unversioned `/abs/` URL. A quoted *term* is below
the floor; a timeline event quoting a paper's **title** is out of scope, because
a title is not a quotation from the document.

### A timeline is an argument's spine, not a changelog

**Ruled 2026-08-31 (beads `addictedtoai-9df`).** A `timeline:` **may be
selective, and every one in this corpus already is** — nothing lists every event
of a company's year. Selection is what makes a timeline readable, and copying an
upstream changelog into the corpus would create a second source that rots, which
is the thing "volatile values are bound, never typed" exists to prevent.

> **Include an event when it changes something the entry argues about. What is
> forbidden is not selecting — it is selecting silently.**

The rule bites in one specific place, and only there: **when the subject
publishes its own canonical, enumerable revision list** — a spec, a standard, a
licence — a reader can count the entries, find fewer than the upstream has, and
reasonably read the timeline as complete. For those subjects the entry must

- bind or link **where the complete history lives**, and
- **say in the body that the timeline is selective**, so a gap reads as a choice
  rather than as an omission.

Everywhere else no disclosure is possible or needed, because there is no
canonical list to be measured against.

`concept/model-context-protocol.md` is the worked example. Its three-entry
timeline named two of the specification's revisions; the versioning page lists
`2024-11-05`, `2025-03-26`, `2025-06-18`, `2025-11-25` and `2026-07-28`
(fetched 2026-08-31, each confirmed by literal substring match against the
page's bytes), and the `2026-07-28` changelog opens *"lists changes made to the
Model Context Protocol (MCP) specification since the previous revision,
2025-11-25"*. Nothing the entry said was false — the two it names are in fact
the two that removed the handshake and the sessions. The repair was therefore
not a correction but a disclosure, and the entry now says so in prose while
pointing at the versioning page rather than reproducing the list, so it cannot
rot when a sixth revision lands.

**Not mechanised, deliberately.** Deciding whether an omitted event "carries the
entry's argument" is a judgment about what the entry is arguing, and no regex
reads that. The nearest buildable check — *this entry's subject publishes a
revision list, therefore its timeline must be complete* — enforces the rule this
ruling rejects. A weak detector here would fail the build on correct entries,
which is worse than no detector at all. This standard is enforced by review.
