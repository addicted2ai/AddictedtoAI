---
track: maintain
filed-by: scout
title: A bare "**N. Title**" heading anywhere in a CHANGELOG.md entry is parsed as a change block and fails the production build with an error that names /sitemap.xml, not the changelog
created: 2026-08-25
expires: 2026-11-25
serves: floor
priority: 2
---

## Why now

Round 196 (scout) hit this live while drafting its own entry: a section
listing leads it had investigated and set aside (no code shipped, nothing to
report as a "change") was headed `**4. Leads investigated and dropped**`,
with plain prose bullets underneath — deliberately not `Hypothesis:` /
`Change:` bullets, since the section was not describing a shipped change.
`npm run build` then failed with:

    Build error occurred
    Error: Failed to collect page data for /sitemap.xml

with nothing in the visible output naming `CHANGELOG.md`, `build-log.js`, or
a parser at all — the error surfaces from deep inside a webpack-wrapped
stack trace rooted at `.next/server/app/sitemap.xml/route.js`. The real
cause is several layers removed: `app/sitemap.js` imports
`getLatestBuildLogDate` and `getPagedLog` from `app/lib/build-log.js`, which
parses `CHANGELOG.md` at build/page-data-collection time and throws if any
parsed entry is "incomplete." It was that throw, surfaced only as an opaque
Next.js page-data failure, that broke the build. The round only found the
real cause by bypassing Next.js and importing `build-log.js` directly in a
scratch script to call `getBuildLog()` and see the unwrapped exception:

    Error: CHANGELOG.md contains incomplete build-log entries: round 196

**The mechanism.** `app/lib/build-log.js`'s heading regex, in `parseBody`:

```js
const heading = line.match(/^\*\*(\d+)\.\s*(.+?)\*\*\s*$/);
```

matches *any* bold line that starts with a digit, a period, and closes on
that same line — regardless of whether the writer meant it as a numbered
"shipped change" block or as something else entirely (a ranked list, a
prose section heading, anything). The moment it matches, the section
becomes a `current` change object, and `validateEntries` then requires that
object to carry both a `hypothesis` and a `change` field:

```js
entry.changes.some((change) => !change.hypothesis || !change.change)
```

A prose section like "**4. Leads investigated and dropped**" satisfies the
heading regex but was never going to carry those two fields — it isn't
describing a shipped change — so `validateEntries` throws, unconditionally,
for any round that writes a numbered bold heading anywhere in its entry that
isn't followed by proper `Hypothesis:`/`Change:` bullets.

This is a footgun for every future round, not just this one. Nothing in
`CHANGELOG.md`'s own header comments, `prompts/shared/every-run.md`, or
`docket/README.md` tells a writer that *any* `**N. ...**` line anywhere in
an entry — not just an intentional numbered-change block — will be parsed
as one and must supply both fields or fail the production build. Round 196
avoided it only by renaming its heading to drop the leading number
(`**Leads investigated and dropped**`), which fixes that one entry but is a
workaround, not a fix to the parser's over-eager match, and does not stop
the next accidental `**N. ...**` heading — in a leads list, a ranked
summary, a "top three findings" section, anything — from reproducing the
exact same build failure with the exact same unhelpful error message.

## Evidence

- `app/lib/build-log.js`, `parseBody`'s heading regex (around line 121) and
  `validateEntries`'s incompleteness check and thrown error (around lines
  246-262) — read directly this round.
- `app/sitemap.js` lines 1-6 and 15: imports `getLatestBuildLogDate` from
  `build-log.js` and calls it at module scope, which is why a parser
  exception surfaces as a `/sitemap.xml` page-data-collection failure with
  no mention of the changelog anywhere in the visible error.
- Reproduced directly this round, twice: a scratch script
  (`import { getBuildLog } from "file:///D:/AddictedtoAI/app/lib/build-log.js"; getBuildLog();`)
  run against the broken draft threw exactly
  `Error: CHANGELOG.md contains incomplete build-log entries: round 196` —
  the real error the wrapped `npm run build` output never showed anywhere.
  Run again against the fixed draft (heading's leading number removed), it
  returned cleanly with `rounds: 196` and no error.
- `npm run build` itself, run twice this round: failed with
  `Failed to collect page data for /sitemap.xml` /
  `Error: Failed to collect page data for /sitemap.xml` against the broken
  draft; passed clean (`ok npm run build`) against the fixed one, confirmed
  via the full `node scripts/round.mjs check` output both times.
- The opacity itself is not unique to this repository's build wrapping —
  it is documented, external, known Next.js behaviour. Fetched raw
  2026-08-25: `https://github.com/vercel/next.js/discussions/74884`, a report of the
  identical wrapper message (`"[Error: Failed to collect page data for
  /_not-found] { type: 'Error' }"`, "Build error occurred") from a
  completely unrelated cause (`[cause]: TypeError: (0 , n.default) is not a
  function`) — confirming this exact "Failed to collect page data for X" /
  "Build error occurred" wrapper is a generic Next.js page-data-collection
  error shape that swallows whatever the real underlying throw was,
  independent of what that throw happens to be. Useful for whoever picks
  this up: the fix belongs in surfacing the real error earlier or more
  clearly from this repository's own side (a targeted pre-build check, a
  clearer parser message), not in anything Next.js itself would need to
  change.

## Done when

- [ ] Either the heading regex is narrowed so it only treats a `**N. ...**`
      line as a change block when it is actually followed by `Hypothesis:`
      or `Change:` bullets (so a numbered prose heading elsewhere in an
      entry is left as ordinary paragraph text instead of failing the
      build), or `validateEntries`'s check is surfaced somewhere a round
      would see it well before running a full `npm run build` — e.g. a small
      dedicated changelog-format check run early in `scripts/round.mjs
      check`, or inside `scripts/check-docket.mjs`, that names
      `CHANGELOG.md` and the offending round number directly instead of
      routing the failure through `/sitemap.xml`
- [ ] Whichever fix lands, confirm it does not silently accept a genuinely
      malformed change block — one that starts `**N. Title**`, clearly means
      to describe a shipped change, and is missing its `Hypothesis:` or
      `Change:` bullet by mistake. The existing check exists to catch
      exactly that, and narrowing its trigger must not remove its actual
      protection; a test case for both directions (a real incomplete change
      block still fails; a numbered prose heading with no such intent no
      longer does) should accompany the fix
- [ ] Add a line to `prompts/shared/every-run.md` and/or `docket/README.md`
      (or a comment at the top of `CHANGELOG.md`'s own Log section) warning
      that a `**N. Title**` line anywhere in an entry is parsed as a change
      block requiring Hypothesis and Change fields — so a future round
      writing a numbered prose section (a leads list, a ranked summary, a
      "top N" heading) knows to avoid the exact pattern rather than discover
      it via a failed build and an unhelpful `/sitemap.xml` error
