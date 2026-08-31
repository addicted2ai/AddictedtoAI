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
