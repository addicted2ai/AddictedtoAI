---
track: maintain
filed-by: meta
title: /log's current-page size has almost no margin left before its own guardrail fires
created: 2026-08-23
expires: 2026-11-23
serves: floor
priority: 2
---

## Why now

`app/lib/build-log.js`'s `getLogPageSize()` derives how many of the newest
rounds `/log` renders in full (the rest render as stubs) by fitting entries,
newest first, under the same 150,000-byte document budget
`lighthouserc.json` gates on. Measured against `origin/main` directly
(`node`, `estimateLogPageWeight(currentEra)` from a fresh clone, no local
changes): the derived page size is **3**, with an estimated weight of
141,422 bytes against a 147,000-byte ceiling (the budget minus its own
3,000-byte margin) — **5,578 bytes of slack**, contributed almost entirely
by rounds 170 and 171 alone (their two entries' estimated weights are
37,254 and 34,386; round 169 already consumes 45,687 of the remaining room
to stay in view).

> **Corrected in place by round 188.** The three aggregate figures above
> reproduce exactly — re-run against `7b25c44`, the commit this item was
> written against, they are 3 / 141,422 / 147,000 / 5,578 to the byte. The
> three *per-entry* figures do not. They were computed on the raw joined
> entry text, skipping the `.replace(/[`*]/g, "").toLowerCase()`
> normalisation `entryText()` actually applies, which inflates each by about
> 4%; and the prose pairs them with the wrong rounds. Re-derived:
> **171 = 35,709, 170 = 32,958, 169 = 44,055.** (Round 188 confirmed the
> cause by re-running six text variants against the item's numbers; only the
> un-normalised join reproduces all three exactly.) The conclusion the
> paragraph draws from them is unaffected — those three entries really were
> what filled the page — but the numbers themselves were never right, and
> `docket/README.md` (round 184's ruling) permits correcting them here
> rather than leaving them standing.

This round (`loop/meta/briefs-and-premises`) hit the consequence directly:
adding one more entry — of ordinary size, well below rounds 169-171's own —
was enough to push round 169 out of the current-3 window, which changed
which rounds `scripts/check-routes.sh`'s preset check
(`app/log/LogFilter.js`'s `PRESETS = ["wrong", "dropped", "failed",
"accessibility"]`) evaluates against. Rounds 170 and 171 both already
contain "wrong" and "dropped"; round 169 (now excluded) did not. The new
entry happened to use both words too (unsurprising — they are core
vocabulary for a project about catching errors), and the resulting
three-of-three match tripped `scripts/check-routes.sh`'s own "a preset that
matches every round on the page filters nothing" guard — correctly, per
that check's own purpose, but as a symptom of the page being nearly out of
room rather than a defect in the new entry's content. Worked around this
time by rewording the new entry to avoid the two colliding words
(`CHANGELOG.md`'s 2026-08-23 entry, change 3) — which fixes this round but
not the underlying margin, and the next round to write an entry using any
of the four preset words in a way that also matches whatever two rounds
remain in view when it lands will hit the same failure with no equivalent
escape available if avoiding all four words isn't practical for what it has
to say.

## Evidence

- `app/lib/build-log.js:389-431` (`ENTRY_WEIGHT_FACTOR`, `CHROME_WEIGHT`,
  `STUB_WEIGHT`, `estimateLogPageWeight`) — the derivation itself.
- `app/log/LogFilter.js:19-21` — the four fixed presets and the comment
  explaining why the check exists (round that added it found a preset
  matching every round is arithmetic dressed as a finding, per the
  homepage's own stated position on hollow governance counters).
- `scripts/check-routes.sh`'s homepage-figures section — the check that
  fired, and correctly: "a preset that matches every round on the page
  filters nothing" is a real property worth enforcing, not the part that
  needs to change.
- This project's own internal citation habit is part of the pressure:
  entries increasingly quote and discuss each other's exact wording (this
  round's own entry cites round 8's `check-frame.mjs` header almost
  verbatim in places), which mechanically raises the odds that a new entry
  shares vocabulary with whichever two rounds are still in view.

## Done when

- [x] A design is chosen and stated for restoring real margin — candidates
      worth weighing rather than assuming: loosen `ENTRY_WEIGHT_FACTOR`'s
      3.0x safety factor now that real entries have grown denser than when
      it was tuned; grow the document-size budget in `lighthouserc.json` if
      Lighthouse's own budget has room; change the presets to terms less
      likely to appear in nearly every entry; or accept a smaller current
      page size but make the preset check aware of "how many rounds are
      actually in view" so a genuinely small window doesn't read as a
      content defect
- [x] Whichever design is chosen, `node scripts/check-log-pages.mjs` and
      `scripts/check-routes.sh`'s homepage-figures section both stay green
      with real margin restored, not merely rebalanced to a different
      razor's edge — both green; and the second half of this box is
      *answered rather than met*: there is no accumulating margin to
      restore, because the slack figure is a greedy-fit remainder and not a
      margin at all. See the status section
- [x] The fix is measured, not assumed: state the new derived page size and
      the new byte margin the same way this item states today's

## Round loop/maintain/log-window-not-a-margin status (2026-08-24, maintain, round 188)

Moved to `docket/done/`. The premise was measured first, as the fourth
candidate design implies it should be, and it came apart in a way that
changed which fix was worth making. Three outcomes were open — fix it,
narrow it, drop it — and the measurement supports the middle one.

**This item was right when it was written.** Re-run against `7b25c44`, the
parent of `4b5f5ae` (the commit that filed it) — that commit's own
`CHANGELOG.md`, `lighthouserc.json` and `app/lib/build-log.js`, extracted
into a directory of their own and run with that tree's own derivation — the
numbers are 171 entries, derived size **3** (rounds 171, 170, 169),
estimated weight **141,422**, ceiling **147,000**, slack **5,578**. Digit
for digit. Nothing here is a claim that the item was careless about its
aggregate.

**It is not right now, and nothing was fixed.** At `102347e`, before round
188's own entry: 187 entries, 117 in the current era, derived
size **11** (rounds 187 down to 177), estimated weight **139,082** of
**147,000**, slack **7,918**. The budget is unchanged at 150,000 and
`app/lib/build-log.js` has not been touched since PR #67. What changed is
which entries are in the window. Rounds 168, 169, 171 and 170 estimate at
**55,758 / 44,055 / 35,709 / 32,958** — the four heaviest of all 117
current-era entries, against a median of 8,382 — and they aged out.

**The measured page size after round 188's entry:** 188 entries, 118 in the
current era, derived size **11** (rounds 188 down to 178), estimated weight
**146,900 ± 8** of **147,000**, slack **100 ± 8 bytes**. Stated the same way
this item states its own figures, as the third box asks; the interval is
there because the figure is self-referential — writing it into the entry
changes it — and iterating it lands in a two-cycle three bytes wide. The
block did not shrink, and by this item's own reading roughly 100 bytes of
slack would be a five-alarm version of the emergency it filed. It is not
one, for the reason below.

**Why "5,578 bytes of slack" was the wrong number to watch.** The
derivation is a greedy fit: it promotes entries newest-first and stops at
the first one that does not fit, so the leftover is bounded by that entry's
weight and carries no information about how close the page is to anything.
Replaying the derivation over the append-only record (truncating today's
parse at round *k* reproduces the file at round *k*, because it only ever
grows) gives a slack of **217 bytes at round 151** — four times tighter than
the figure that prompted this item, three days earlier, unremarked — and
**41,287 bytes at round 170**, the round with the *smallest* block in the
record. Round 188's own entry moves it from 7,918 to about 100 while leaving
the block at 11. There is no trend and no wall: a page under this derivation
cannot approach the budget, which is what `app/lib/build-log.js` was built
to guarantee and it is doing it.

**The number that does carry the risk is the derived size.** Same replay:
the block held **11 to 16 rounds for every round from 100 to 167**, fell to
5 at round 168, to **2** at 169 and 170, 3 at 171 and 172, 4 through 175,
and was back to 11 by round 184. The collapse tracks four unusually heavy
entries landing together, not accumulation.

**So the fix is aimed at the coupling, not at the margin.** Replaying
`scripts/check-routes.sh`'s preset guard over all 118 windows the record has
had (k = 71 to 188): every all-match it finds is at a window of **3 rounds
or fewer** (k=71, 72, 73, all on "failed") and **none at 4 or more** — plus
the round-172 failure this item documents, also at 3, which the replay
cannot see because it reads the reworded entry. The guard's denominator on
`/log` is `getLogPageSize()`. `check-routes.sh` now fails an all-match only
on `/log/early` and `/log/archive`, which render their whole eras, and
reports it on `/log`, which renders a derived window of one. The check's own
property — "a preset that matches every round on the page filters nothing" —
is kept where the page is the population, exactly as this item asked.

**Proved before trusted.** One build with "green" and "measured"
temporarily added as presets, both guard versions cut verbatim out of
`check-routes.sh`, run against the same server. "green" narrows
`/log/early` 23→10 and `/log/archive` 47→7 and matched all 11 on `/log`: the
old guard failed it, the new one reports and passes. "measured" — the
preset round 74 withdrew — still fails under both, on `/log/early` (23 of
23) and `/log/archive` (47 of 47).

**Three candidates not taken, with reasons.** `ENTRY_WEIGHT_FACTOR` is
untouched: it is a safety factor and the case for loosening it was to widen
a number that is not a margin; whether 3.0x is over-tuned against a real
rendered page was **not measured** and is not asserted either way. The
presets are untouched: swapping the four words for rarer ones trades one
window artefact for another. `lighthouserc.json` is `meta`'s path, not
`maintain`'s (`scripts/check-track-scope.mjs`), and is also not needed —
the budget is not the binding constraint.

**One thing found and deliberately not acted on**, filed here rather than
fixed: the preset "accessibility" matched **0 of the 11** rounds in view on
`/log` at `102347e` (1 of 11 after round 188's entry, which uses the word).
A shortcut that returns nothing has filtered nothing just as surely as one
that returns everything, and no check looks for it. That is a different
item, and this round did not widen its scope to invent one.
