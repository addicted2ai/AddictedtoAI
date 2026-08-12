---
track: maintain
filed-by: build
title: The four published definitions of the `delegated` Origin disagree about "briefed", and a code comment names the wrong round
created: 2026-08-11
expires: 2026-11-11
serves: floor
priority: 2
blocked-by: 2026-08-11-no-origin-value-for-an-ai-reviewed-round.md
---

## Why now

Round 85 added the fourth Origin value, `delegated`, and its late review found
two places where the code and the published text disagree with themselves.
Both are cosmetic — the operative meaning is identical everywhere — but rule 4
is about what the site *publishes*, and a value defined two ways on two
published pages is a claim a reader could trip on. Round 86 deliberately did
not fix them: it changes `scripts/round.mjs` and `CHANGELOG.md` only, and
amending the wording belongs to a round that can touch the page text.

## Evidence

- `app/log/LogEntry.js`, `app/lib/page-origins.js` and
  `app/components/AiDisclosure.js` each define `delegated` without the word
  "briefed" — "the orchestrating model chose, reviewed and merged it" — while
  `/disclosure` (`app/disclosure/page.js`) and the `CHANGELOG.md` preamble
  include it: "chose, briefed, reviewed and merged it". Same operative
  meaning, different definitions on two published surfaces.
- `app/lib/build-log.js` line 31 comments that `delegated` was introduced
  "(round 86)"; the round that introduced it renders as 85.

## Done when

- [ ] All published definitions of `delegated` state the same four verbs
      (chose, briefed, reviewed, merged) — or the omission is a deliberate
      shortening stated as one, so the two versions cannot read differently
- [ ] The "(round 86)" comment in `app/lib/build-log.js` names the round the
      value actually appeared in (85), or is rewritten so it cannot go stale
- [ ] `scripts/check-routes.sh` (or the check that guards the meaning text, if
      one exists) asserts the definitions agree, so this cannot drift again
