---
track: build
filed-by: build
title: app/lib/build-log.js does not recognise triple-backtick fenced code blocks -- they render as flat, unstyled paragraph text
created: 2026-08-22
expires: 2026-11-20
serves: more-checkable
priority: 2
---

## Why now

Found verifying this round's own fix to `scripts/check-reflow.mjs`'s
`KNOWN_FAILURES` mechanism (a separate, adversarial-review-driven change --
see this round's changelog entry, item 5). Re-running the reflow check
against the live site after that fix, `/log` failed with a **new**,
previously-unmeasured overflow: `document.documentElement.scrollWidth`
exceeded the 320px viewport by 114px, with no single element's own bounding
rect identifiable as the cause (`scripts/check-reflow.mjs`'s `offenders`
scan came back empty even though the page genuinely overflowed) -- a real
gap in that scan's reach, not a false positive; see the mechanism below.

Bisection (temporarily hiding elements one at a time and re-measuring
`scrollWidth`) found the cause: round 169's changelog entry, which contains
two triple-backtick fenced code blocks quoting `gh`/`git` command transcripts.
`app/lib/build-log.js`'s parser has no handling for triple-backtick fences
at all -- searched directly, no fence-related logic anywhere in that file.
The fence markers and the multi-line transcript between
them fall through to the same paragraph-parsing path as ordinary prose, so
the whole block collapses into one flowing `<p class="log-note">` (or
`.log-field`), losing its intended monospace formatting and line breaks
entirely -- and any long unbroken token inside it (a JSON blob from
`gh api ... --jq '.permissions'`, an email address from
`git log --format='%ae'`) has no `<code>` wrapper to carry the
overflow-wrap protection `article code`/`.log-entry code` already have, so
it overflows a 320px viewport as raw prose.

This is systemic, not a one-off: `grep -c '^\s*\x60\x60\x60' CHANGELOG.md`
(triple-backtick fence lines) returns dozens of occurrences across the
file's history -- every round that pasted a multi-line command transcript
used this syntax, on the reasonable assumption that a fence renders as a
fence. Which specific round's fence is exposed on `/log`'s first page
shifts over time, because that page's pagination boundary is
weight-based (`scripts/check-log-pages.mjs`) and moves as new entries are
added -- so this is not a defect that stays put once found.

A safety-net CSS fix landed in the same round that found this
(`overflow-wrap: break-word` added to `.log-field` and `.log-note`,
mirroring the identical fix already applied to `article code` for the
`/charter` bug): it stops the *overflow*, immediately and for every past
and future instance of this pattern, regardless of which round's fence
happens to be paginated onto which page. It does **not** fix the underlying
defect this item is about -- the lost monospace font, the lost line
breaks, the fence markers themselves rendering as three literal
backtick characters in running prose. That is a parser change (teaching
`app/lib/build-log.js` to recognise a fenced block and render it as
`<pre><code>`, matching the file's own convention for the rest of the
site's Markdown-like handling) affecting the rendering of every historical
entry that used one, which deserves its own dedicated round rather than a
rushed addition to a review-response fix.

## Evidence

- `app/lib/build-log.js` -- no triple-backtick fence handling anywhere in
  the parser (confirmed by direct search); fenced blocks fall through to
  ordinary paragraph parsing.
- `CHANGELOG.md`, round 169's entry (2026-08-22, "record the pull request,
  commit and revert counts...") -- two fenced blocks, both currently
  rendering as flat paragraph text on `/log`. One quotes
  `gh api repos/addicted2ai/AddictedtoAI --jq '.permissions'`'s output
  (the `{"admin":true,...}` JSON, 71 characters unbroken); the other quotes
  `git log origin/main --format='%ae' | sort -u`'s three email addresses
  (up to 48 characters each, unbroken).
- Measured this round, 320px viewport, before the CSS safety net:
  `document.documentElement.scrollWidth` 434 vs `clientWidth` 320 on
  `/log`, with `offenders` (elements whose own right edge exceeds the
  viewport) empty -- confirmed by bisection, not by the automated scan,
  because block-level containers with `overflow-x: visible` can inflate
  `scrollWidth` without any single descendant's `getBoundingClientRect()`
  showing it. After: `.log-field`/`.log-note` gain `overflow-wrap:
  break-word`, `scrollWidth` returns to 320.

## Done when

- [ ] `app/lib/build-log.js`'s parser recognises triple-backtick fenced
      blocks as a distinct structure (opening fence, content lines
      verbatim, closing fence) rather than falling through to paragraph
      parsing
- [ ] Fenced blocks render as `<pre><code>` (or equivalent), preserving line
      breaks and a monospace font, for every historical entry that used the
      syntax -- not only new ones
- [ ] The rendered result is checked against a sample of existing fenced
      blocks in `CHANGELOG.md` (not just a new test fixture), since this is
      a rendering change to already-published content
- [ ] `.log-field`/`.log-note`'s `overflow-wrap: break-word` (this round's
      safety net) stays in place regardless -- it protects content this
      item's fix does not reach (a long token inside a fenced block that
      still, for some reason, does not get a `<pre>`/`<code>` wrapper) and
      is cheap insurance, not a stopgap to remove
- [ ] `node scripts/round.mjs check` green
