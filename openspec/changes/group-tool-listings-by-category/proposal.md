# Proposal: group-tool-listings-by-category

## Why

The maintainer asked for this on 2026-08-29 (`addictedtoai-0eg`). His reasoning,
in his words: someone arriving at the Tools directory is looking for a tool to
do a **job**, and an A-to-Z list of 35 names does not help them find one.
Grouping by what a tool is *for* does. He named image, video, audio, research
and coding, and asked for category to be the default with alphabetical still
available.

Three facts about the tree shaped the work, each confirmed before designing:

1. **There is no category field.** A listing carries `title`, `url`, `pricing`,
   `last_verified`, `entry` and `mentions`. This repository fails the build on
   unknown front-matter keys *by design* — "adding a content field means editing
   `lib/schema.mjs` by design", because `alias:` where `aliases:` was meant
   parses cleanly into an entry with no aliases and nothing downstream notices.
   So this is a schema change, not a render change.

2. **The alphabetical sort is a deliberate guarantee.** `lib/listings.mjs` says
   so in the code, quoting this capability: *"No placement is ever sold ... its
   sort order is one of the stated objective criteria and the page says which"*.
   `LISTINGS_SORT = 'name, A to Z'` is printed on the page as that disclosure.
   **Category order is not self-evidently objective the way A-to-Z is** —
   someone chooses which category leads, and that choice is precisely the
   placement the capability promises is never sold. This is the interesting
   constraint, and satisfying it is most of this change.

3. **Category assignment is editorial.** It is declared in front matter and
   never inferred from a title or a blurb — the rule `lib/units.mjs` already
   states for units and the alias registry already states for alias classes.
   All 35 assignments were made by reading each listing and its linked entry.

## What Changes

**A closed `category` field on tool listings.** Required, validated against a
closed list in `lib/schema.mjs`, with an unknown value failing the build naming
the file, the field, the value and the alternatives — the same treatment an
unknown `kind` gets. No default and no catch-all: a default is a catch-all by
another name, and a catch-all collecting a third of the directory would defeat
the point. Twelve categories cover the 35 listings with **no category holding
fewer than two**: `agents` 2, `audio` 2, `coding` 3, `data` 3, `evaluation` 2,
`frameworks` 2, `image` 2, `inference` 5, `local` 5, `observability` 3,
`retrieval` 3, `training` 3.

**The category order is made objective by a mechanism, not a promise.** It is
alphabetical by category name, computed from the names at render time — never
read from the order the closed list is written in, and never from listing
counts. Ordering by count is the tempting alternative and is worse: it moves
whenever a listing is added, so a tool's position would depend on how many
neighbours it has. A test reverses the closed list and measures that the page
does not change.

**Alphabetical stays, on the same page, stated.** The complete A-to-Z list of
every listing sits in a `<details>` element: no JavaScript, no CSS dependency,
no second URL, keyboard-operable and screen-reader-announced by the browser
itself, and it degrades to "everything visible". Category is the default
because it is what is open. Both orderings print their criterion through the
same `sortNote` the rest of the site uses, and the grouped one — the order the
page body is actually in — comes first, because the DOM check reads the first
one.

**`video` and `research` are deliberately not in the list.** The maintainer
named five categories; the corpus supports three of them. No listing's primary
job is video (ComfyUI does image and video and is filed under `image`), and no
listing is a research tool. An empty category is a promise the directory does
not keep. Adding either is one line in the closed list plus its note, and the
mechanism that keeps those two in step is itself checked.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `directory`: two added requirements — every listing declares the job it is
  for, from a closed list; the directory is grouped by that job with both
  orderings stated. One modified requirement — *"No placement is ever sold"*
  now names `category` among the objective criteria and states the three
  mechanisms that make a category order objective, because its current text
  enumerates `(name, date, price, status)` and would otherwise contradict this
  change on the day it is archived.

No other capability is touched. `wiki` in particular is not: the wiki's `tool`
**entry** kind is a different thing from a directory **listing**, and whether
entries want the same treatment is a separate decision that should be made
deliberately rather than by reflex (filed separately).

## Impact

- **Machinery**: `lib/schema.mjs` (the closed list, the required field, its
  classification), `lib/listings.mjs` (the grouping, the second stated
  criterion, the category notes and the check that keeps them in step with the
  list), `lib/render/tools.mjs` (the grouped body, the category index, the
  A-to-Z `<details>`, the category row on a listing's own page),
  `app/tools/page.tsx` (metadata and lede). No new dependency; no edit to
  `package.json`; **no CSS change** — the new markup reuses `.section`,
  `.section-title`, `.browse`, `.browse-row`, `.browse-name`, `.browse-kind`
  and `.listings`, which already exist.
- **Content**: all 35 files under `content/directory/tools/` gain one line.
  Every assignment is editorial and listed in the beads issue and this change's
  report; none was derived from a name.
- **Tests**: `lib/schema.test.mjs` extended for the closed list, including a
  real-build failure on an unknown value; a new `lib/listings.test.mjs` for the
  grouping and both orderings; five fixture listings and one new bad fixture.
- **Data**: none. Nothing in `data/` changes shape.
- **Specs**: written as a delta against `directory` as it stands in
  `openspec/changes/build-initial-site/specs/`. Archiving order matters:
  `build-initial-site` must archive first, or this delta has no baseline.
- **Deployment**: nothing here pushes. The gate condition in `CLAUDE.md`
  stands, and this change was authored without running a build.
