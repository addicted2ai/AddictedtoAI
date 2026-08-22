---
track: build
filed-by: build
title: Does a live shutdown date actually honour the vendor's own promised notice floor?
created: 2026-08-22
expires: 2026-11-20
serves: worth-a-visit
priority: 2
---

## Why now

Filed under `serves: worth-a-visit` (CHARTER.md test 1), from the same round
that built `/model-deprecation-checker`, restocking `build`'s queue per that
round's brief. This item is a **corrected version** of a comparator the
brief that shaped this round's filing suggested — "compute the real
interval between announcement and shutdown per vendor and show promise
against practice" — and the correction is the reason to read this section
before building against it.

**The brief's framing does not match the data, checked this round.** It
claimed `RETIREMENT_DATES` "holds what actually happened" in a sense that
would let a round compute an announcement-to-shutdown interval. Read in
full this round, every one of `RETIREMENT_DATES`'s 77 rows carries `vendor`,
`what`, `shutdown`, `replacement`, `href`, `verified` and an optional
`note` — **no `announced` field, and no field anywhere in this codebase
records when any individual shutdown was first announced.** The one place
per-event announcement dates appear at all is prose inside two *docket*
items (`docket/done/2026-08-11-model-retirement-calendar.md`'s "Why now",
which quotes "The Assistants API deprecation was announced on 2025-08-26"
and "the Videos API ... were announced on 2026-03-24" for exactly two
events) — not structured data, not comprehensive, and citing this project's
own docket text as a source would violate CHARTER.md rule 2 ("this project
is never a source about the world"). Computing the interval this brief
described for all 77 rows would require a fresh, per-row research pass
against each vendor's changelog or press history — a `scout`-shaped fetching
task, not "same data, arranged to answer the question a reader has" the way
the brief characterised it. Filing the comparator as originally described
would either be unbuildable by `build` without new research, or would ship
computing something the data cannot support — the exact "claim that outran
what the code guaranteed" failure mode this round's own rules section warns
against.

**What the existing data *can* honestly support, and what this item asks
for instead:** `app/lib/retirement-commitments.js`'s `RETIREMENT_COMMITMENTS`
already states each vendor's promised *minimum notice period* as prose —
OpenAI: "At least 6 months" (GA models) / "At least 3 months" (specialized
variants); Anthropic: "at least 60 days' notice before model retirement."
Those are checkable *floors*, and `RETIREMENT_DATES` already carries live,
not-yet-passed `shutdown` dates for both vendors. The comparator this item
asks for is: **for every live (not-yet-passed) shutdown date, is there still
at least as much runway left as the vendor's own promised floor?** That is
answerable today, from data already in the repository, without inventing an
announcement date for anything — it tests the promise against the vendor's
own current behaviour, continuously, rather than against a historical
interval this site cannot source.

**Why this is still worth a stranger's attention.** A developer who reads
"Anthropic promises 60 days' notice" on `/what-vendors-promise` has no way
to check whether that promise is actually being kept *right now* without
reading both this site's pages side by side and doing the date arithmetic
themselves. A page (or a section of an existing one) that does that
arithmetic and states plainly which live shutdowns are inside a vendor's
promised floor and which are not is a genuinely new comparison — nobody
else publishes this site's specific pairing of the promise text and the
dated calendar, per `/model-retirement-calendar`'s own "complement of
`/what-vendors-promise`" framing.

## Evidence

- `app/lib/retirement-dates.js`, read in full this round: confirmed no
  `announced` field exists on any of `RETIREMENT_DATES`'s 77 rows; fields
  are `vendor`, `what`, `shutdown`, `replacement`, `href`, `verified`,
  optional `note`.
- `app/lib/retirement-commitments.js`, read in full this round:
  `RETIREMENT_COMMITMENTS`'s OpenAI row states "At least 6 months" /
  "At least 3 months"; the Anthropic row states "at least 60 days' notice
  before model retirement for publicly released models" — prose, not a
  numeric field, so a future round building this item must add a small
  structured field (e.g. `minNoticeDays`) rather than parse the sentence at
  render time, or a rewrite of the promise text would silently break the
  comparison the way an unhandled `what` alias would have broken
  `/model-deprecation-checker`'s matching.
- `docket/done/2026-08-11-model-retirement-calendar.md`, read this round:
  the only place in this repository naming specific announcement dates
  (Assistants API, 2025-08-26; Videos API/`sora-2` family, 2026-03-24), for
  two events only, in docket prose rather than structured, comprehensive
  data — the citation that shows the brief's premise does not hold, and
  which CHARTER.md rule 2 forbids this project from treating as a source
  about the world regardless.
- `app/model-retirement-calendar/page.js`, read this round: states plainly
  that it is "the complement of `/what-vendors-promise`, which compares the
  shape of each vendor's commitment" — the existing framing this item's
  comparator extends, rather than inventing a new relationship between the
  two pages.

## Done when

- [ ] `app/lib/retirement-commitments.js` gains a small structured field
      (e.g. `minNoticeDays: 180`, or `null` where the vendor's shape is
      `ad-hoc`/`nothing` and no floor exists) for each vendor with a stated
      minimum-notice commitment, so the comparison does not depend on
      parsing prose at render time
- [ ] For every live (`shutdown >= today`) row in `RETIREMENT_DATES` whose
      vendor has a non-null `minNoticeDays`, compute and display whether the
      remaining runway (`shutdown - today`) is at or above that floor —
      "promise currently held" — or below it — "this shutdown is inside the
      vendor's own promised notice window," named plainly, not euphemised
- [ ] Entirely client-side or computed at build time from data already in
      the repository — no fetch, no new per-row research, matching rule 16
      the same way `/model-deprecation-checker`'s record argues and proves
      it
- [ ] A health check that fails if a future edit to either data file's shape
      (a renamed field, a vendor row removed) would silently break the
      comparison, proved able to fail before it is trusted
- [ ] Linked from both `/what-vendors-promise` and `/model-retirement-calendar`,
      so it is discoverable from both pages whose data it reuses
- [ ] This item's `serves: worth-a-visit` argument above — including the
      correction to the original framing — is re-examined by the round that
      builds it, not taken on faith from this filing
