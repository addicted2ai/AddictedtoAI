# Design: group-tool-listings-by-category

## D1 — The whole problem is that a category order is a placement decision

`name, A to Z` needs no defence. Nobody can buy a different alphabet, so the
disclosure `LISTINGS_SORT = 'name, A to Z'` is a complete answer to *"why is
this tool above that one?"*.

A category order is not like that. Whoever decides that `agents` comes before
`inference` has made a placement decision, and *"no placement is ever sold"* is
this capability's trust position — the one the proposal says every surveyed
competitor forfeits. A change that quietly introduces a hand-ordered list of
categories does not break the promise on the day it lands; it breaks it the
first time somebody has a reason to want their category near the top, and by
then the ordering looks like a settled convention rather than a decision.

So the requirement is not "group by category". It is **group by category with
an ordering that nobody is in a position to sell.**

## D2 — Three candidate criteria, and why alphabetical-by-name wins

| Criterion | Objective? | Stable? | Verdict |
|---|---|---|---|
| **Alphabetical by category name** | Yes — a function of the names | Yes — never moves when listings are added | **Chosen** |
| By listing count | Arguably | **No** | Rejected |
| A fixed order stated in the spec | No | Yes | Rejected |

**By listing count** is the tempting one, and it is the worst of the three. It
sounds objective — a count is a number nobody argues with — but it makes a
tool's placement depend on **how many neighbours it has**, which is a quantity
an interested party can move by asking for more listings in its category. And
it is unstable in the ordinary course of business: every listing added
potentially reorders the page, so a returning reader's spatial memory of the
directory is worthless.

**A fixed order stated in the spec** is the honest version of a hand-ordered
list: the ordering is written down and reviewed. It is still somebody's
judgment about which job matters most, and the spec then has to defend that
judgment forever. Rejected as the *primary* criterion; it remains available if
a future change wants, say, a deliberate beginner-to-expert progression, and
that change should argue for it in the open.

**Alphabetical by category name** is a pure function of the names. It never
moves when listings are added. It is the same kind of criterion as the one it
sits beside, so the page's two disclosures are consistent with each other.

## D3 — Making it a mechanism instead of a convention

*"Guardrails are mechanisms, not instructions"* (`CLAUDE.md`). Three of them,
each measured in `lib/listings.test.mjs`:

1. **The render sorts by name.** `listingGroups` does
   `[...categories].sort((a, b) => a.localeCompare(b))` before mapping. The
   declaration order of `TOOL_CATEGORIES` therefore cannot reach the page. The
   test reverses the array and asserts the rendered order is byte-identical —
   so a future editor who "tidies" the list into a preferred order changes
   nothing, and learns that from a passing test rather than from a reviewer.
2. **Within-category order is inherited, not reimplemented.**
   `listingGroups` takes the array `listingStates` already sorted A-to-Z and
   filters it, and `Array.prototype.filter` is stable. So the within-group
   order is *the same guarantee* the flat page has always made, not a second
   implementation of it that could drift from the first.
3. **The count is displayed and never sorted on.** The category index shows how
   many listings each group holds, because that is useful; the ordering
   function never reads it. A test adds listings until one category is the
   largest and asserts nothing moved.

**The residue, stated rather than hidden.** Naming a category fixes where it
sits: renaming `inference` to `apis` would move it up the page. There is no
ordering of named groups that is independent of their names, so this cannot be
designed away. What it can be is *expensive and visible*: the closed list lives
in `lib/schema.mjs`, so changing it is a reviewed schema change that fails the
build for every listing carrying the old value. That is disclosed in the
module header, in this document, and in the spec delta's modified requirement.

## D4 — Closed list, single category, no catch-all

Three decisions the beads issue left open, settled here.

**Closed, like `KINDS`.** An open field drifts into `coding` / `code` /
`Coding`, three groups appear where one was meant, and the grouping stops being
a partition. The build already fails on an unknown `kind` with a message that
names the file, the value and the alternatives; `category` gets exactly that
treatment, and the failure is measured on a real build rather than asserted
about the schema.

**Exactly one category per listing.** Several tools have a defensible second
home — Unstructured is document extraction *and* the front of a RAG pipeline;
LangChain ships an agent runtime. Multiple categories would put a tool on the
page twice, and the group counts would stop summing to the number of listings,
which is the cheapest available check that nothing was dropped. The primary
job wins.

**No catch-all.** A default value is a catch-all wearing a different hat: the
first listing added without thinking lands in it, then the tenth, and the beads
issue's own warning — a bucket collecting a third of the directory defeats the
point — arrives by accretion rather than by decision. `category` is required,
and a listing without one does not build.

## D5 — The category set, and the one place it departs from the request

The maintainer named image, video, audio, research, coding "etc". The corpus
supports three of the five. Categories were chosen by reading all 35 listings
and their linked entries, then asking of each group: *is this a job a visitor
arrives with?*

| Category | n | The job |
|---|---|---|
| `agents` | 2 | let a model take actions on its own |
| `audio` | 2 | speech in and speech out |
| `coding` | 3 | write and edit code with a model in the loop |
| `data` | 3 | find, extract and label what a model works from |
| `evaluation` | 2 | test output before shipping, constrain it while running |
| `frameworks` | 2 | compose model calls, tools and retrieval into a program |
| `image` | 2 | generate an image, or read what is in one |
| `inference` | 5 | call a model over an API, or serve one under load |
| `local` | 5 | run a model on hardware you already own |
| `observability` | 3 | see what your calls cost and what they returned |
| `retrieval` | 3 | search your own documents so a model can answer from them |
| `training` | 3 | fine-tune on your own data and keep the record |

Twelve groups over 35 listings averages under three. That is small, and it is
the right trade: the alternative is four or five large buckets in which
"grouped by job" degrades back into a list you have to read all of.
**No category has a single member**, which the beads issue flags as a smell.

**`video` and `research` are absent, deliberately.** No listing's primary job
is video — ComfyUI is a node graph for image *and* video generation and is
filed under `image` — and no listing in the corpus is a research tool. An empty
category renders no heading, so declaring one would be a value the schema
accepts, the page never shows, and a reader never benefits from. Adding either
later is one line in `TOOL_CATEGORIES` plus its note in `CATEGORY_NOTES`, and
the check that refuses a category without a note means the two cannot drift.

**Two assignments worth arguing with, recorded so a reader can.** *Hugging Face
Hub* is filed under `data` rather than a category of its own: its job is
finding and downloading the weights and datasets a model works from, and a
category with one member is the smell this set otherwise avoids. *Ultralytics*
sits beside ComfyUI under `image` although one generates images and the other
reads them; both are what a visitor scanning for "a tool for images" is
scanning for, and the blurbs distinguish them in one line.

## D6 — Keeping alphabetical, under `output: 'export'`

There is no server, so "switch the sort" has four shapes. Chosen: **a
`<details>` element containing the complete A-to-Z list, on the same page.**

- **A second route (`/tools/a-z`)** — clean, but it collides with the
  `/tools/[slug]` dynamic segment (no listing could ever have the slug `a-z`),
  it needs the sitemap and the indexability layer to know about a duplicate of
  the same content, and it is a second URL for one directory.
- **A client-side toggle** — the site's one precedent, `CatalogFilter`, exists
  because 400 rows genuinely need filtering. Thirty-five listings do not
  justify shipping JavaScript, and a first-load JS budget is a recorded
  measurement in `data/launch.json`.
- **A CSS-only toggle** — needs a rule in `app/globals.css` and breaks with CSS
  disabled.
- **`<details>`** — native HTML. No JavaScript, no CSS, no second URL,
  keyboard-operable and announced by the browser, and it degrades to
  "everything visible". Category is the default because it is the part that is
  open.

It lists **names**, not a second copy of all 35 rows. The reader who wants
alphabetical order is the reader who already knows the name and wants to reach
it; repeating every row would roughly double the page's HTML to serve that. Each
name links to the listing's own page, and carries its category, so scanning
A-to-Z also tells you where a tool lives. The list is complete — every listing
is in it — which a test measures against the listing count rather than by
eyeballing.

## D7 — What was deliberately not changed

- **`listingStates` still returns A-to-Z.** Its contract, and the
  `LISTINGS_SORT` string that `lib/site-assets.mjs` prints for it, stay true.
  `listingGroups` is a separate pure function over its output. Changing the
  array's order would have made a build-log line quietly wrong.
- **The wiki's `tool` entry kind is untouched.** A wiki entry and a directory
  listing are different things; whether entries want categories is a separate
  decision and is filed as one.
- **No CSS.** The new markup reuses classes that already exist. The one
  exception is `.category-note`, which has no rule and therefore renders as an
  ordinary paragraph — legible, but not the mono/muted treatment its siblings
  get. That is a one-line addition to a selector list in `app/globals.css`, out
  of scope here and filed separately.
