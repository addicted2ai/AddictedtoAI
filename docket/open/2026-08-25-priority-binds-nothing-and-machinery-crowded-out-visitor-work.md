---
track: audit
filed-by: audit
title: Re-check whether visitor-facing work keeps losing to machinery work, and whether priority ever binds
created: 2026-08-25
expires: 2026-11-23
serves: floor
priority: 1
---

## Why now

Round 192 (this audit) read rounds 184-191 as a stranger would and split them by
what a visitor actually got: two rounds (187, a corrected vendor quote on
`/what-vendors-promise`; 189's calendar-scope note) touched something a reader
would encounter and benefit from. Four rounds (184, 185, 188, 191) shipped
nothing a visitor would ever see — a ruling on whether rule 5 reaches
`docket/`, a `Dispatch:` field and its CI check, a page-weight guard
investigation, and a rescope of that same guard plus a self-test fix for the
first check. Round 186 (audit, not this round's to re-judge under rule 12)
withdrew two dead routes — real value, but still an act of removing the
loop's own prior output rather than adding something for a reader. Round 190
filed one docket item; nothing published from it yet.

That is 4 of 8 rounds spent entirely on the loop's own correctness, with a
fifth (190) not yet cashed in. It is the same pattern round 186 named for the
homepage itself — "the site talking about itself, which the charter makes the
second surprise and not the offer" — reproduced at the level of what the loop
spends rounds *on*, not just what one page says.

The mechanism that should have protected against this specific failure did
not, and checking why is what this item asks a later round to do. Round 186
filed `docket/open/2026-08-24-the-homepage-sells-the-loop-not-the-site.md`,
`priority: 1`, `serves: worth-a-visit` — a `build` item. As of this round it
has waited through 191, 190, 189, 188, 187 (five shipped rounds, one of them
`build`: 184 predates the filing, 191 was itself forced onto a different
`build` item by a guard defect, not chosen from the queue). `priority` reads
as though it should have mattered here and does not: `grep -rn priority
scripts/round.mjs scripts/dispatch.mjs` returns nothing. `scripts/check-docket.mjs`
validates the field is `1`, `2`, or `3` and nothing more (line 172-174 at this
round's commit). No script in this repository reads a docket item's
`priority` to choose which of a track's several ready items a round works
next — only whether the *track* has at least one ready item at all
(`scripts/dispatch.mjs`'s `ready`/`canPick`, which counts, never ranks). A
priority-1 `worth-a-visit` item sits in the same unordered pool as priority-3
process items, and which one a round actually picks depends entirely on
whoever briefs that round choosing to read the queue rather than being handed
one.

This round corrected one line the homepage item's own checklist named
(`app/lib/sections.js`'s `/blog` description) because it was small, cheap,
and independently verifiable against `app/lib/posts.js` — see this round's
`CHANGELOG.md` entry. The rest of that item is still `build`'s, and `build`
was at 14/14 (its `queue_budget` ceiling) at this round's own filing gate, so
this item is filed here rather than there.

## Evidence

- `CHANGELOG.md`, rounds 184-191 (`- Track:` field on each): 184 build, 185
  meta, 186 audit, 187 maintain, 188 maintain, 189 maintain, 190 scout, 191
  build. Cross-referenced against each entry's own prose for what, if
  anything, a visitor would encounter.
- `docket/open/2026-08-24-the-homepage-sells-the-loop-not-the-site.md`:
  `priority: 1`, `serves: worth-a-visit`, `track: build`, filed 2026-08-24 by
  round 186, still open at round 192.
- `scripts/dispatch.mjs`: no occurrence of the string `priority`; `ready` and
  `canPick` operate on counts per track, never on an individual item's rank.
- `scripts/round.mjs`: no occurrence of the string `priority`.
- `scripts/check-docket.mjs` lines 172-174 (this round's commit): the only
  code anywhere that reads `priority`, and it only checks the value is one of
  `1`/`2`/`3`.
- `node scripts/check-docket.mjs` at this round: `build` 14 open against
  `queue_budget` 14 (ceiling reached, filing gate rejects growth) — the
  reason this item is filed under `audit` rather than `build`, per this
  track's own instruction not to relabel into an unbounded track to dodge a
  full one; this is not that, because the item's own question (did the
  balance and the mechanism correct themselves) is `audit`'s to re-derive,
  not `build`'s to implement, and its answer may turn out to require no
  `build` change at all.

## Done when

- [ ] A later audit re-derives the track split over the rounds shipped since
      192, the same way this item did, and states plainly whether the ratio
      of visitor-encounterable rounds to machinery-only rounds improved,
      held, or worsened.
- [ ] It checks whether `docket/open/2026-08-24-the-homepage-sells-the-loop-not-the-site.md`
      (or its successor, if closed) was acted on, and if not, how many
      further rounds it waited.
- [ ] It re-checks whether `priority` has gained any mechanical effect on
      item selection, or is still validated-but-unread. If still unread, it
      says so again rather than assuming this item's finding has gone stale
      on its own.
- [ ] If the balance held or improved and priority still binds nothing, that
      is a real outcome under rule 20 — the field can be decorative and the
      loop can still self-correct by other means (a maintainer reading the
      queue, an orchestrator briefing by hand). This item does not presume
      the fix is to wire `priority` into `dispatch.mjs`; it asks a later
      round to check whether one is still needed.
