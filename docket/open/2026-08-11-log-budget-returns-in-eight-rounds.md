---
track: build
filed-by: audit
title: /log will hit the page-weight budget again in about eight rounds — the era split bought a quarter of what round 70 published
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 2
---

## Why now

Round 70 split the record across `/log` and `/log/archive` because `/log` had
crossed the 150,000-byte document budget. Its Result field says the page went
to 73,293 bytes gzipped, "about 73 KB of headroom, or roughly 38 more rounds at
the ~1.9 KB per round the changelog header records."

Three rounds later that projection is spent at four times the rate it assumed.
Measured this round, one production build per commit, `curl -H 'Accept-Encoding:
gzip'` against `next start`:

| commit | rounds | `/log` gzipped | `/log/archive` gzipped |
| --- | --- | --- | --- |
| `0c9a752` (PR #15) | 68 | 145,701 | — |
| `e43e41b` (PR #17) | 69 | 148,687 | — |
| `ed6c991` (PR #19, the split) | 70 | 74,090 | 92,343 |
| `7084dcd` (PR #18) | 71 | 79,716 | 92,341 |
| `5cfa158` (PR #20) | 72 | 85,189 | 92,377 |
| `57ec957` (PR #21, `main`) | 73 | 93,069 | 92,377 |

The three rounds after the split added 18,979 bytes, a mean of 6,326 per round
against the 1,900 the projection used. Headroom on `main` is 53,931 bytes under
the 147,000 local ceiling in `scripts/check-routes.sh`, which is **8.5 rounds**
at the measured rate, not 38.

**The driver is entry length, not round count, and that is why the arithmetic
was wrong rather than merely unlucky.** Counted from `CHANGELOG.md` this round:
the 47 archived rounds average 363 words per entry, the current era averages
677, and the five rounds of 2026-08-11 average 1,235 — with the longest at
1,959 words. A per-round constant cannot describe a series whose per-round cost
tripled inside five rounds, and `~1.9 KB` was itself read off a line in the
changelog preamble written when the page held 34 rounds. Rule 2 says this
project is never a source about the world; the same caution should have applied
to it as a source about its own future.

**The next split cannot use the trick the last one used.** Round 70 split on
`declaredOrigin` and argued, correctly, that splitting on a count would move a
round's anchor every time the log grew and rot citations continuously instead
of once. But there is only one era boundary and it has been spent. Whatever
happens at 147,000 bytes has to keep every existing anchor resolving without
being able to lean on a second natural seam.

The shape that already works here is the stub: round 70 left every archived
round a stub on `/log` carrying its metadata and linking to the full entry, and
`/log#round-archived-pr-12` still resolves. A per-round page generalises that
to the current era and does not move anchors when the log grows.

## Evidence

Internal — this is a property of this repository's own pages and its own
budget, not a claim about the world:

- `lighthouserc.json` — `resource-summary:document:size` at 150,000 bytes,
  `aggregationMethod: median`. The number CI gates on.
- `scripts/check-routes.sh` — reads that budget and asserts a 3,000-byte
  tighter local ceiling per route, printing each route's headroom. Added by
  round 70; it is the check that will fire first.
- `CHANGELOG.md`, round 70's Result field — the "roughly 38 more rounds"
  projection and the `~1.9 KB per round` figure it rests on.
- `CHANGELOG.md` preamble, "Guardrails" — states `/log` "grows by about 1.9 KB
  gzipped every round" and cites 63.5 KB at 34 rounds. Not published, but it is
  what round 70 read. A round that wants a growth rate should measure one.
- The six builds tabulated above, produced by round 74.

## Done when

- [x] `/log` renders under the local ceiling — round 84 (build) froze the first
      era of this repository (rounds 48-70) onto `/log/early`, the same stub
      mechanism round 70 used. Measured that round: `/log` at 91,455 bytes
      gzipped including its entry, 55,545 under the 147,000 local ceiling.
      **The design's cost per round still grows with entry length** — the
      second-era split is a finite reprieve, not the decoupled cost the first
      criterion asks for, so this item stays open with that criterion unmet
- [x] Every anchor that resolves today still resolves — each moved round keeps
      a stub on `/log` with its original `id`, so `/log#round-pr-N` and every
      feed anchor resolve; asserted by `scripts/check-log-pages.mjs`
- [x] The RSS feed's link anchors still resolve against a rendered page —
      asserted as before
- [x] The homepage's advertised mention figures still equal what the page each
      one links to renders — the homepage now advertises all three
      destinations (main log, early log, archive), each counted where it is
      read, and `check-routes.sh` re-derives each figure against its page
- [x] The record measures the new cost per round rather than projecting one,
      and states the measured headroom in rounds — round 84 measured its own
      entry at 5,276 bytes gzipped and stated ~10 rounds of headroom at that
      size
- [x] Nothing in the record is shortened, summarised, or dropped to fit. The
      record's entries were not touched at all; only the rendering moved
- [ ] **Open:** a design whose cost per round does not grow with entry length —
      the per-round page with stubs on the index round 70 proved, or any
      equivalent. The second era split bought ~10 rounds; the wall returns.

## Why the estimate said eight rounds and the answer was two

Round 74's arithmetic was sound at the moment it was made: 53,931 bytes of
headroom on `main` at round 73, divided by a measured 6,326 bytes/round, is
8.5 rounds — and rounds 74-83 actually consumed 5,234/round, so the wall did
arrive in about ten. The estimate's error was not the rate. It was that a
runway stated in rounds reads as durable. The item was filed, its "about
eight rounds" became the standing figure, and nobody re-derived it as rounds
accumulated; CI re-measured `/log` only when it merged each PR, so the last
number anyone saw before the wall was round 83's 145,412 with 1,588 bytes to
spare — two rounds from failure. The same failure mode is in every estimate
this docket carries: a number measured once and published as if it were a
property of the system rather than a point-in-time reading. Any future
headroom/staleness estimate should state the round it was measured at and be
re-measured, not assumed to travel.

## Not in this item

The cheaper half of the fix is editorial: entries that are 1,235 words average
are a readability problem before they are a byte problem, and a reader is the
thing `/log` exists for. That lever is in `prompts/`, which is human-owned
under rule 13 and which no track may merge, so it is named here and left to
the maintainer rather than smuggled into a build round's scope.

## 2026-08-13 — the wall arrived, measured by round 93 (audit)

Round 93's first `node scripts/round.mjs check` failed with
`FAIL /log is 149075 bytes gzipped, over the local ceiling of 147000`. The
entry was trimmed in several passes until the suite went green; the trimmed
state measures 146,993 bytes gzipped, 7 bytes of headroom. Round 84's "~10
rounds" projection held: the wall returned on round 93, nine rounds after 84,
driven by entry length as the item predicted — counted from `CHANGELOG.md`
this round, the largest entries are round 88 (217 lines), round 82 (197),
round 86 (193), round 90 (142), round 91 (115), round 92 (93). The open box
above (a per-round page with stubs, or an equivalent whose cost does not grow
with entry length) is now urgent: the next entry to land will exceed the
ceiling again, whatever its length, because the trimmed page has 7 bytes of
room. The measurement is also recorded in round 93's changelog entry; this
note exists so a build round reading the queue sees the state without opening
the record.
