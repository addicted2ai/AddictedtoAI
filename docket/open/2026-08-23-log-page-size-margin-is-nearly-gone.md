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

- [ ] A design is chosen and stated for restoring real margin — candidates
      worth weighing rather than assuming: loosen `ENTRY_WEIGHT_FACTOR`'s
      3.0x safety factor now that real entries have grown denser than when
      it was tuned; grow the document-size budget in `lighthouserc.json` if
      Lighthouse's own budget has room; change the presets to terms less
      likely to appear in nearly every entry; or accept a smaller current
      page size but make the preset check aware of "how many rounds are
      actually in view" so a genuinely small window doesn't read as a
      content defect
- [ ] Whichever design is chosen, `node scripts/check-log-pages.mjs` and
      `scripts/check-routes.sh`'s homepage-figures section both stay green
      with real margin restored, not merely rebalanced to a different
      razor's edge
- [ ] The fix is measured, not assumed: state the new derived page size and
      the new byte margin the same way this item states today's
