# Tasks: group-tool-listings-by-category

## 1. Implementation

- [x] **1.1 — The closed category list.** Add `TOOL_CATEGORIES` to
  `lib/schema.mjs` beside `KINDS`, with a header stating that the array's order
  carries no authority and that the value is declared, never inferred.
- [x] **1.2 — The required field.** Add `category: closedList('tool category',
  TOOL_CATEGORIES)` to `toolSchema`. Required — no `.optional()`, no
  `.default()`.
- [x] **1.3 — Classify the new field.** Add `category: 'a closed-list value'`
  to `NON_PROSE_FIELDS.tool`, so the exhaustiveness gate
  (`assertFieldsClassified`) stays clean rather than failing the build on an
  unclassified string field.
- [x] **1.4 — The category notes and the check that keeps them in step.**
  `CATEGORY_NOTES` in `lib/listings.mjs`, plus `categoryProblems()` /
  `assertCategoriesDescribed()` in the shape of `classificationProblems()` —
  pure, injectable, naming every offender rather than the first.
- [x] **1.5 — The second stated criterion.** `LISTINGS_GROUPED_SORT` in
  `lib/listings.mjs`, naming both halves of the order.
- [x] **1.6 — The grouping function.** `listingGroups()`: sorts categories by
  name, inherits the A-to-Z order inside each group by stable filter, drops
  empty groups, calls `assertCategoriesDescribed`, and throws on a listing
  whose category is outside the closed list.
- [x] **1.7 — Assign all 35 categories, editorially.** Read every file under
  `content/directory/tools/` and its linked wiki entry, then declare one
  `category` per file. No assignment derived from a title, URL or blurb by
  rule.
- [x] **1.8 — Render the grouped body.** `lib/render/tools.mjs`: one
  `<section>` per non-empty category, `<h2 class="section-title"
  id="tools-<category>">`, the category note, then the existing listing rows
  unchanged.
- [x] **1.9 — Render the category index.** A `<nav aria-label="Tool
  categories">` of jump links with per-category counts. The count is displayed
  and never sorted on.
- [x] **1.10 — Keep alphabetical, on the page, without JavaScript.** A
  `<details>` holding the complete A-to-Z list of every listing with its own
  `sortNote(LISTINGS_SORT)`.
- [x] **1.11 — State the grouped criterion first.**
  `sortNote(LISTINGS_GROUPED_SORT)` is the page's first `[data-sort-note]`,
  because `scripts/verify-surfaces.mjs` reads the first one and it must be the
  order the body is actually in.
- [x] **1.12 — The listing's own page shows its category** and links back to
  that group on the directory.
- [x] **1.13 — Page chrome.** `app/tools/page.tsx` metadata and lede say the
  directory is grouped by job.
- [x] **1.14 — No CSS change.** Reuse `.section`, `.section-title`, `.browse`,
  `.browse-row`, `.browse-name`, `.browse-kind`, `.listings`.

## 2. Fixtures and tests

- [x] **2.1 — Fixture listings gain a category** (`lib/fixtures/corpus`,
  `lib/fixtures/prose-fields`, `lib/fixtures/surfaces` ×3). The three surfaces
  listings deliberately span two categories, so the existing fixture exercises
  grouping rather than a single group.
- [x] **2.2 — A bad fixture for the real build.**
  `lib/fixtures/bad/unknown-tool-category/` — one listing carrying `category:
  seo`.
- [x] **2.3 — Extend `lib/schema.test.mjs`:** every declared category is
  accepted; an unknown one is rejected naming the value and the alternatives; a
  missing one is rejected; the unknown value stops the **real build**; the new
  field is walked and classified.
- [x] **2.4 — New `lib/listings.test.mjs`** for the grouping and both
  orderings, rendered through the real `surfaces` fixture wherever three
  listings suffice and through synthetic listings where they do not.
- [x] **2.5 — Run the targeted tests.** `lib/listings.test.mjs` 16/16,
  `lib/schema.test.mjs` 28/28, and the neighbours that touch listings —
  `lib/surfaces.test.mjs`, `lib/currency.test.mjs`, `lib/assets.test.mjs`,
  `lib/build-gates.test.mjs`, `lib/mentions.test.mjs` — all green.
- [x] **2.6 — Measure the real corpus.** Build the real content root in memory
  (`getSite()`, `write: false`) and render the directory: 35 listings, 12
  groups, counts summing to 35, 0 build errors, both sort notes present in the
  right order.

## 3. Verification this change could not run itself

Authored under a no-builds constraint (eight agents share one `.next/`;
addictedtoai-6s7). These are the orchestrator's, serially:

- [ ] **3.1** `npm test`
- [ ] **3.2** `npm run build`
- [ ] **3.3** `node scripts/verify-launch.mjs` — the tool floor and the seed
  review records
- [ ] **3.4** `node scripts/verify-surfaces.mjs` — `/tools` states its sort
  criterion (reads the **first** `[data-sort-note]`)
- [ ] **3.5** `node scripts/verify-design.mjs` — contrast, keyboard traversal
  and no horizontal scroll at 320px, now that `/tools` has a `<details>`, a
  `<nav>` and twelve `<h2>`s it did not have
- [ ] **3.6** `node scripts/measure-payload.mjs` — unchanged expectation: this
  change ships **zero** additional JavaScript

## 4. Traceability — every normative sentence, its task and its check

A requirement with no implementing task is invisible twice over: a literal
implementer never builds it and the integrated verification passes without it.
A full audit of this project's founding spec found 6 such clauses in 168, so
each SHALL below names both.

### Requirement: Every tool listing declares the job it is for

| Normative clause | Task | Check that measures it |
|---|---|---|
| every listing SHALL declare `category` | 1.2, 1.7 | `schema.test` *"a tool listing must declare url, pricing, last_verified, its entry link and a category"*; 2.6 measures all 35 |
| the set SHALL be a closed list; an outside value SHALL fail naming file, field, value and alternatives | 1.1, 1.2, 2.2 | `schema.test` *"an unknown category stops the REAL build, naming the file and the value"* and *"...naming the value and the alternatives"* |
| the field SHALL be required, no default, no catch-all | 1.2 | `schema.test` *"a missing category is rejected — there is no default and no catch-all"* |
| the category SHALL be declared data and SHALL NOT be inferred | 1.1, 1.7 | Structural: no code path derives it. `lib/render/tools.mjs` and `lib/listings.mjs` read `doc.data.category` only; `listingGroups` **throws** rather than guessing — `listings.test` *"a listing whose category is outside the closed list throws, naming both"* |
| a listing SHALL carry exactly one category; counts sum | 1.2 (scalar field), 1.6 | `listings.test` *"every listing appears exactly once in the grouped body"*; 2.6 prints the sum |
| every category SHALL carry a note; a category without one SHALL fail the build | 1.4, 1.6 | `listings.test` *"a category with no note fails, naming every offender"*, *"grouping refuses to run at all while a category has no note"*, *"the real category list and its notes agree"* |

### Requirement: The tools directory is grouped by the job each tool does

| Normative clause | Task | Check that measures it |
|---|---|---|
| the default order SHALL be by category | 1.8, 1.11 | `listings.test` *"every category present gets a heading, a note and a working jump link"*; the grouped `sortNote` is first |
| categories SHALL be A-to-Z by name, computed from the names — not declaration order, not count | 1.6 | `listings.test` *"the category order is a function of the NAMES, not of the declared list order"* (reverses `TOOL_CATEGORIES`) and *"the order is not by listing count"* |
| within a category, A-to-Z by listing name | 1.6 | `listings.test` *"A to Z still holds INSIDE each category"* |
| an empty category SHALL render no heading, note or jump link | 1.6, 1.8 | `listings.test` *"empty categories dropped"* and *"an empty directory ... renders no empty category headings"* |
| every listing SHALL appear exactly once, dead ones included and marked | 1.8 | `listings.test` *"every listing appears exactly once in the grouped body, dead ones included"* (also asserts both dead markers survive) |
| alphabetical SHALL remain reachable, complete, without JavaScript | 1.10 | `listings.test` *"the A-to-Z order is still on the page, whole and alphabetical"* (asserts the count equals the listing count); no-JS is structural — `<details>` with no script on the route, confirmed by 3.6 |

### Requirement: No placement is ever sold (modified)

| Normative clause | Task | Check that measures it |
|---|---|---|
| no paid placement, affiliate links, sponsored ordering, payment-dependent field *(pre-existing)* | — | Unchanged: no such field exists in `toolSchema`, and the exhaustiveness gate `assertFieldsClassified` fails the build on any new unclassified one |
| ordering by objective, stated criteria only — now including `category` *(list extended)* | 1.5, 1.11 | `listings.test` *"the page states BOTH criteria, the grouped one first"* |
| the order SHALL be a pure function of the names, never of declaration order | 1.6 | `listings.test` *"the category order is a function of the NAMES"* — the closed list is reversed and the page order is asserted unchanged |
| the order SHALL NOT be by listing count | 1.6, 1.9 | `listings.test` *"the order is not by listing count — adding a listing never moves a category"* |
| the closed list SHALL live in the build's schema | 1.1 | `schema.test` *"an unknown category stops the REAL build"* — the list is only enforceable because it is in the schema |
| each ordering SHALL state its own criterion, the page's actual order first | 1.10, 1.11 | `listings.test` *"the page states BOTH criteria, the grouped one first"* (asserts the exact sequence of `data-sort-note` values); 3.4 asserts it on the exported page |
