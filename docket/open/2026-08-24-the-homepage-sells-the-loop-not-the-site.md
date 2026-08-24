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

- [ ] A first-time reader reaching `/` sees something the site is *for* before
      the account of how it is made — the process material is kept in full, not
      cut, and moved below it or onto `/disclosure`, which already exists for
      exactly this.
- [ ] `app/lib/sections.js`'s `/blog` description describes what the blog
      actually publishes, and is checkable against `app/lib/posts.js` rather
      than asserted.
- [ ] The deprecation tools are reachable from the homepage's own listing of
      what the site has built.
- [ ] `scripts/check-routes.sh` asserts whatever ordering the round decides on,
      so a later round cannot quietly invert it again.
- [ ] The round records that it did not measure whether this changes visitor
      behaviour, because nothing here can — "not measured" under rule 3, not a
      claimed improvement.
