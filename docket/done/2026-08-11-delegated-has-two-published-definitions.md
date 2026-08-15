---
track: build
filed-by: maintainer
title: The delegated Origin value has two different published definitions
created: 2026-08-11
expires: 2026-11-11
serves: more-true
priority: 3
---

## Why now

A late review of commit `8cec1ef` found the fourth Origin value's meaning
written in six places, and the six do not agree. A reader who hovers the badge
on `/log` and then reads `/disclosure` is given two definitions of the same
word.

Nothing published is false — the operative half, *no human saw it before it
landed*, is identical everywhere. This is drift, not a falsehood. It is filed
because drift is how every falsehood this project has published started: two
descriptions of one thing, edited separately, one of them later updated.

## Evidence

| Where | Wording |
|---|---|
| `CHANGELOG.md` preamble, published on `/log` | chose, **briefed**, reviewed and merged it |
| `app/disclosure/page.js`, published on `/disclosure` | chose the work, **briefed** it, reviewed it and merged it |
| `app/lib/build-log.js` (source comment) | chose, **briefed**, reviewed and merged it |
| `app/log/LogEntry.js`, badge tooltip on `/log` | chose this work, reviewed it and merged it |
| `app/lib/page-origins.js` | chose this work, reviewed it and merged it |
| `app/components/AiDisclosure.js`, per-page sentence | chose, reviewed and merged |

"Briefed" is not decorative. It is the word that separates `delegated` from
`unsupervised`: the difference between a round something chose and directed and
a round that merely ran. The three definitions that omit it describe less
oversight than actually occurred, which is the safe direction to be wrong in and
still wrong.

Separately, `app/lib/build-log.js` ends its comment for the value with
"(round 86)". That round renders as 85; 86 was conditional on PR #33 landing
first, and it did not. A stale number in a source comment, in the file whose
numbering that round was otherwise careful about.

## Done when

- [x] One wording for `delegated` is chosen deliberately and appears in all six
      places listed above, identically.
- [x] The six copies are replaced by a single source every surface reads, or a
      check exists that fails when they diverge. Six hand-maintained copies of
      one sentence will desynchronise a second time; decide which fix and say
      why in the entry.
- [x] The other three Origin values are checked for the same drift, since
      nothing has ever compared them either.
- [x] The stale "(round 86)" comment in `app/lib/build-log.js` is corrected.

## Shipped 2026-08-14 (round 111)

Round 111 (maintain) chose the four-verb form including "briefed" — the
word that separates `delegated` from `unsupervised` — and made the chain
"chose, briefed, reviewed and merged" identical in all six published places
plus the parser's source comment. It chose a check over a single source:
the preamble is markdown and cannot import code, and the other surfaces are
grammatically different frames (a badge tooltip, a per-page sentence, an
enumeration) that one shared string would flatten into worse prose, so the
enforcement is `scripts/check-origin-definitions.mjs` — wired into
`scripts/check-routes.sh` — which asserts the distinguishing content of all
four Origins on every surface that defines them (supervised: "triggered"
and "veto"; maintainer: "decided what and why"; unsupervised: "nobody
read"; delegated: the full four-verb chain). The other three Origins were
read across all their surfaces this round and agreed everywhere. The check
was proven able to fail by removing "briefed" from `app/log/LogEntry.js`
(exit 1, "the delegated definition is missing /chose, briefed, reviewed and
merged/") and restored (exit 0). The "(round 86)" comment was corrected to
"(round 85)", verified with `git log`. See the round-111 changelog entry.

Do not open a round for this alone. `CHARTER.md` rule 21: volume is never a
goal. It rides along with the next round that touches these files.
