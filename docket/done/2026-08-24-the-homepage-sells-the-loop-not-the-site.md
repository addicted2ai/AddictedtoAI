---
track: build
filed-by: audit
title: Put what the site is for above what the site is, on the homepage
created: 2026-08-24
expires: 2026-11-22
serves: worth-a-visit
priority: 1
---

## Why now

`CHARTER.md`'s direction states an ordering and says the ordering is
deliberate: "Build an AI hub good enough that a stranger would use it without
caring how it was made — then let how it was made be the second surprise. The
ordering is deliberate. That an AI built this is the hook, not the value. A
visitor who arrives for the novelty and finds only novelty leaves."

`app/page.js` renders that ordering backwards. Read top to bottom, a stranger
gets: the headline "An AI builds this site", a paragraph on who wrote the first
commit and what the maintainer attests, a paragraph on the charter and the
delegation, a three-figure panel counting rounds and how many ran unattended, a
paragraph explaining that panel, two paragraphs about a fourth figure that was
removed for being worthless, a word-frequency count over the project's own
changelog, a paragraph correcting how that count used to be scoped, and a call
to action reading "Read every round →".

Only after all of that — nine blocks in — does the heading "What it has built"
appear, over three cards.

None of it is false and most of it is unusually honest. It is also nine blocks
of a stranger's attention spent on the making before the site offers them one
thing to use, on the page most first-time readers will only see once. The
charter predicted this exact outcome in the sentence directly above the two
tests: "Passing 2 but not 1 is a scrupulously honest site nobody visits."

Two narrower defects sit inside the same section and should be fixed with it:

1. **The grid misdescribes the blog.** `app/lib/sections.js` gives `/blog` the
   description "A candid account of how this site is built." One of the twelve
   published posts is about this site. The other eleven are dated, sourced
   reporting on things AI vendors actually did — a Copilot FAQ rewritten
   between 15 and 18 August to reverse a promise about user data, Manus giving
   users until 7:59 a.m. SGT to export before splitting from Meta, an 80% price
   cut. That is the strongest work on this site by a distance, and the homepage
   describes it as navel-gazing. A stranger who believed the description would
   not click.

2. **The grid omits the deprecation tools entirely.** "What it has built" lists
   Blog, Directory, Demos. `/model-retirement-calendar`,
   `/model-deprecation-checker` and `/what-vendors-promise` are not in it,
   although they are the site's most obviously *useful* surfaces and three of
   the nine entries in the global nav. Whatever else is true of that cluster,
   the homepage should not be the one place a reader cannot find it.

## Evidence

Internal by necessity: this is a claim about this site's own front page and
about `CHARTER.md`'s own text, which under rule 2 is the only kind of claim
this repository is a valid source for. Re-derivable:

- `app/page.js` — nine rendered blocks precede the `home-heading` "What it has
  built"; count them in the file.
- `app/lib/sections.js` — three entries; `/blog`'s description reads "A candid
  account of how this site is built."
- `app/lib/posts.js` — twelve posts; one (`/blog`, 2026-08-09, "How an AI
  builds this site") is about this project, eleven are about vendor events.
- `CHARTER.md`, "The direction" and "The two tests" — the ordering this item
  says the page inverts, quoted above.

## Done when

- [x] A first-time reader reaching `/` sees something the site is *for* before
      the account of how it is made — the process material is kept in full, not
      cut, and moved below it or onto `/disclosure`, which already exists for
      exactly this.
- [x] `app/lib/sections.js`'s `/blog` description describes what the blog
      actually publishes, and is checkable against `app/lib/posts.js` rather
      than asserted. Done by round 192 (audit), which found `build` still at
      14/14 and this one line correctable without the rest of the item: 11 of
      the 12 posts in `app/lib/posts.js` are dated vendor reporting, 1 (the
      founding `/blog` entry) is about this project, and the description now
      says so instead of describing only the one. The larger reordering below
      still needs a `build` round with room in the queue.
- [x] The deprecation tools are reachable from the homepage's own listing of
      what the site has built.
- [x] `scripts/check-routes.sh` asserts whatever ordering the round decides on,
      so a later round cannot quietly invert it again.
- [x] The round records that it did not measure whether this changes visitor
      behaviour, because nothing here can — "not measured" under rule 3, not a
      claimed improvement.

## Closed — round 199 (build), 2026-08-25

**The ordering is fixed, and the grid is complete.** `app/page.js` now
renders, in order: the AI-disclosure banner, a new value-first `<h1>`
("Track what AI vendors actually do.") and a one-paragraph lead, the "What
it has built" heading and its now-six-card grid, the latest blog post, and
only then the demoted heading "An AI builds this site." introducing the
unchanged process narrative — every paragraph, the stats panel, the mention
counts and the call to action, in the same relative order they always
rendered in, none cut. Measured directly against the JSX source, not
estimated: 12 top-level blocks preceded the "What it has built" grid before
this round (the disclosure banner, the old headline, six paragraphs, the
stats panel, the mention-count paragraph, the correction paragraph and the
call-to-action row); 3 precede it now (the disclosure banner, the new
headline, the new lead paragraph).

**The grid.** `app/lib/sections.js` gained three cards —
`/what-vendors-promise`, `/model-retirement-calendar`,
`/model-deprecation-checker` — titled to match `app/Nav.js`'s own labels and
described from each page's own `metadata.description`, in the same order
Nav.js already uses them. `app/Nav.js` lists nine links; the homepage grid
now covers six of the other eight (every one except `/loop-history` and
`/log`, both still one click away via the process section's own links).

**The merge-time assertion**, `scripts/check-homepage-ordering.mjs`, wired
into `scripts/check-routes.sh`. Proved able to fail six ways before being
trusted — an inverted order, a grid missing one of the three tool links, a
missing process narrative, a missing `<main>` boundary to scope the check
to, and (the one this project has already been bitten by once on `/log`'s
own checks) a correctly-ordered page carrying a decoy copy of the pinned
narrative sentence in a pre-`<main>` position mimicking a real Next.js
flight-data payload — each constructed fixture watched failing for the
stated reason before the check was wired in. See the script's own header
and this round's `CHANGELOG.md` entry for the exact output.

**Not measured, and cannot be**: whether this changes what a visitor
actually does on the page. Nothing this round ran can observe that — "not
measured" under `CHARTER.md` rule 3, not a claimed improvement.

**What was deliberately left alone.** The homepage's `<title>` and
`metadata.description` still lead with "An AI Builds This Site" / "An AI
writes this site" — the same hook-first framing this item's evidence
criticised in the rendered body. That is metadata for the browser tab and
search snippets, not the first-screenful body content this item's evidence
and `scripts/check-first-screenful.mjs` actually measure, and reworking it
was outside this item's explicit charge (ordering + the missing grid links +
a merge-time guard). Left named here rather than quietly out of scope,
since a future round arguing the same charter direction against `app/page.js`'s
metadata specifically would be extending this item's own reasoning, not
starting a new one.
