# directory — delta for correct-wordings-the-archive-carried

Wording only. This delta changes no requirement, no gate, no field and no
behaviour: the MODIFIED block below is the live requirement copied whole, with
one sentence corrected. It exists because the sentence sat INSIDE a requirement
block when `tag-the-corpus-by-domain` was archived on 2026-09-06, so the archive merged it into
this constitution, and a live spec is only editable through a change.

The finding, the re-measurement and why each correction is wording rather than
substance are in this change's `proposal.md`.

**The correction:** "onto at least two listings in three" becomes "onto 23 of
the 35". At the lower of the two readings the same requirement prints, 23 of 35
is 0.6571, and two in three of 35 is 23.33 — so the "at least" floor is breached
by a third of a listing. It holds at the 26 reading (0.7429), and both exact
counts are printed alongside, so nothing was hidden; the qualifier was simply
doing work it did not quite earn. The exact form is true under either reading,
and the requirement's substance — `domains` is optional on a tool listing — is
untouched.

## MODIFIED Requirements

### Requirement: A tool listing may declare the domains it serves

A listing's `category` is **the job the tool is for** — `inference`,
`observability`, `training`. A listing's `domains` are **the fields of AI it
serves**. These are different questions and neither answers the other, which is
why the facet is added rather than folded into the category list.

The measurement that settles it: of the 35 curated listings under
`content/directory/tools/` on 2026-09-05, **23 map to no domain at all**.
Their categories — `local` (5), `inference` (5), `training` (3),
`observability` (3), `data` (3), `frameworks` (2), `evaluation` (2) — describe
jobs that are performed across every domain and belong to none. That count
follows `loops/ui-loop/graph/knowledge/EN-domain-facet.md` §4's own mapping,
under which `retrieval` (3) → `research`; treating `retrieval` as unmapped gives
26 instead. An inference server is not less of an inference server for being
domain-neutral.

*(The upstream artifacts all state 28 here — DESK-ORDER-001 §3,
`loops/ui-loop/graph/knowledge/EN-domain-facet.md` §4, and
`loops/ui-loop/graph/knowledge/SPEC-REVIEW-GUIDE.md` row 36. Recounted from the
tree on 2026-09-05, the seven domain-neutral categories hold 23 listings; 28 is
35 minus the seven category names. The conclusion those artifacts draw is
unaffected.)*

Therefore:

- `domains` on a tool listing SHALL be **optional**, and the empty set SHALL be
  the common case rather than an omission to be chased. A required field here
  would force a wrong answer onto 23 of the 35.
- It SHALL be **set-valued**, drawing on the same closed vocabulary, with the
  same single definition in the source tree and the same build-time gate, as
  the domain facet in `wiki`. There is not a second vocabulary for tools.
- It SHALL be **editorial and declared**, never inferred from the listing's
  title, URL, pricing or blurb, and never derived from its `category` by a
  lookup table. A category-to-domain mapping is a heuristic wearing a
  configuration file's clothes: `coding` the category and `coding` the domain
  agree by coincidence of naming, and `retrieval` → `research` is a judgment
  someone has to make and be accountable for.
- It SHALL NOT change what `category` means, how many a listing carries, or
  that a listing with no `category` fails the build.

A listing's `domains` SHALL NOT be exempted from its reviewed surface, for the
reason the `wiki` delta gives at length: no feed seeds a tool listing, so every
value here is a judgment, and a judgment publishes through review.

#### Scenario: A domain-neutral tool needs no domain

- **WHEN** a listing in the `inference` category declares no `domains`
- **THEN** it validates and renders exactly as before, and nothing marks the
  absence as incomplete

#### Scenario: A domain does not replace the category

- **WHEN** a listing declares `category: retrieval` and `domains: [research]`
- **THEN** both validate, the listing appears under `retrieval` in the
  category grouping exactly as it did before, and the counts of the category
  grouping still sum to the number of listings

#### Scenario: An unknown domain stops the build

- **WHEN** a listing declares a `domains` value outside the closed vocabulary
- **THEN** the build fails naming the file, the field, the offending value and
  the allowed values — the same treatment an unknown `category` receives

#### Scenario: The category list is not a domain list

- **WHEN** a listing in the `image` category declares no `domains`
- **THEN** the build does not infer `image`, because a domain is declared and
  never derived — the category and the domain having the same spelling is a
  coincidence of naming, not a mapping
