# directory — delta for tag-the-corpus-by-domain

One requirement added and one modified. The tools directory keeps every rule it
has: `category` is still required, still exactly one per listing, still a
closed list, and still the thing the default grouping is built from. `domain`
is a second, optional axis beside it — not a replacement, not a rename, and not
a reason to touch a single existing listing.

The listing count used below was measured on 2026-09-05: `content/directory/`
`tools/` holds 36 `.md` files, one of which is the directory's own README and
is not a listing, giving 35 curated listings.

## ADDED Requirements

### Requirement: A tool listing may declare the domains it serves

A listing's `category` is **the job the tool is for** — `inference`,
`observability`, `training`. A listing's `domains` are **the fields of AI it
serves**. These are different questions and neither answers the other, which is
why the facet is added rather than folded into the category list.

The measurement that settles it: of the 35 curated listings under
`content/directory/tools/` on 2026-09-05, **28 map to no domain at all**.
Their categories — `local`, `inference`, `training`, `observability`, `data`,
`frameworks`, `evaluation` — describe jobs that are performed across every
domain and belong to none. An inference server is not less of an inference
server for being domain-neutral.

Therefore:

- `domains` on a tool listing SHALL be **optional**, and the empty set SHALL be
  the common case rather than an omission to be chased. A required field here
  would force a wrong answer onto four listings in five.
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

## MODIFIED Requirements

### Requirement: No placement is ever sold

The directory SHALL contain no paid placement, no affiliate links, no
sponsored ordering, and no field whose value depends on payment. Ordering is
by objective, stated criteria only (name, date, price, status, category,
domain). This
is the trust position every surveyed competitor forfeits; it is not adjustable
without an OpenSpec change.

A category ordering is not objective the way an alphabet is — someone chooses
which category leads, and that choice is exactly the placement this requirement
forbids selling. So where a directory surface orders by category:

- The order SHALL be a **pure function of the category names**, and SHALL NOT
  be derived from the order in which the categories are declared. A
  hand-ordered list of categories is a placement decision wearing a
  configuration file's clothes.
- The order SHALL NOT be by listing count. Ordering by count moves whenever a
  listing is added, so a tool's placement would depend on how many neighbours
  it has — a quantity an interested party can change by asking for more
  listings beside it.
- The closed list of categories SHALL live in the build's schema, so changing
  it is a reviewed schema change rather than a front-matter edit.
- Where a page presents more than one ordering, **each ordering SHALL state its
  own criterion** on the page, through the same mechanism every other ordered
  surface uses, and the criterion the page is actually ordered by SHALL be
  stated first.

**A domain grouping is a category ordering by another name, and it inherits
every clause above.** Wherever any surface on this site groups or sections by
domain — the directory's own pages, and equally the frontier surface, which is
where the pressure will actually come from — then:

- Sections SHALL be ordered by a **pure function of the domain ids**, computed
  from the ids themselves. Not the order the closed vocabulary happens to be
  written in, not the number of members a domain holds, and not any index
  score, ranking, recency or measure of a domain's importance.
- The closed vocabulary SHALL live in the build's source tree in exactly one
  place, so changing it is a reviewed change rather than a front-matter edit.
- The ordering criterion SHALL be stated on the page, in the same form every
  other ordered surface uses.

The last of those bullets is the one with a live temptation behind it, so it is
written as a prohibition rather than left to inference. "Order the domains by
how important they are" is not a sort; it is a placement decision, made by
whoever holds the pen, about which field of AI a reader sees first. That it
would be made in good faith by someone with no money involved does not change
what it is, and a surface that has quietly established an importance order is a
surface that has something to sell later.

#### Scenario: Ordering is explainable

- **WHEN** any directory listing page renders
- **THEN** its sort order is one of the stated objective criteria and the
  page says which

#### Scenario: Both orderings on one page say which they are

- **WHEN** the tools directory renders its grouped default and its
  alphabetical alternative
- **THEN** both carry a stated criterion in the site's standard sort-note form,
  and the grouped criterion — the one the page body is in — comes first

#### Scenario: The category order cannot be hand-arranged

- **WHEN** someone reorders the closed category list to move a category up the
  page
- **THEN** the page is unchanged, because the render sorts by name

#### Scenario: Reordering the domain vocabulary changes nothing

- **WHEN** the closed domain vocabulary is rewritten in a different order —
  even reversed — to move a domain's section up a page
- **THEN** every domain-grouped surface renders in exactly the same order as
  before, because the render sorts by domain id

#### Scenario: A busy domain does not lead the page

- **WHEN** one domain accumulates more tagged records than every other
- **THEN** its section stays in the same position, because member count is not
  a permitted ordering criterion

#### Scenario: A domain's section order is not a ranking of domains

- **WHEN** a domain-grouped surface renders
- **THEN** the page states that its sections are ordered by domain id, so that
  the first section is not read as the most important domain
