---
track: build
filed-by: build
title: A backtick span nested inside **bold** changelog prose renders as an unbroken literal string, not <code> -- no longer overflows, but still wrong
created: 2026-08-22
expires: 2026-11-20
serves: more-checkable
priority: 3
---

## Update, same round (2026-08-22, adversarial-review response)

The overflow this item was filed for is fixed, as a side effect of a
different fix, not of anything below. Verifying a separate change
(`scripts/check-reflow.mjs`'s `KNOWN_FAILURES` identity-pinning, requested
by adversarial review) surfaced a second, unrelated overflow on `/log`
(`docket/open/2026-08-22-changelog-fenced-code-blocks-unparsed.md`), fixed
by adding `overflow-wrap: break-word` to `.log-field` and `.log-note`
directly (matching `.log-entry code`'s existing treatment). Because the
`<strong>` this item is about sits inside a `.log-note` paragraph, it
inherits that same `overflow-wrap` from its parent — `/log` re-measured
clean (`clientWidth 320, scrollWidth 320`) with no changes to
`app/lib/inline-markdown.js` at all. The `KNOWN_FAILURES` entry citing this
item is removed from `scripts/check-reflow.mjs` accordingly (checkbox 3).

**This does not close the item.** The markup defect itself is untouched:
the text below still renders as plain text, not `<code>` — it merely no
longer overflows while doing so. Checkbox 1 (teach the tokeniser to
recurse into a matched span) is the actual fix and remains open; a cosmetic
defect that happens not to break layout is still a defect CHARTER.md rule 4
would call a claim rendered incorrectly, and the render *looks* like plain
prose making no code claim at all rather than looking broken, which makes
it easy to miss precisely because it no longer visibly fails anything.

## Why now

This round built `scripts/check-reflow.mjs` (WCAG SC 1.4.10 Reflow: no route
may need horizontal scrolling of the page itself at a 320px viewport) and
wired it against every route `scripts/check-routes.sh` already walks for the
AI-disclosure and document-size checks — a wider net than the two routes this
round was scoped to fix. It caught a third, previously unmeasured failure:
`/log` overflows a 320px viewport by 180px (`scrollWidth 500 > clientWidth
320`), which neither this round's brief nor the design-rubric survey it cites
tested for, because neither included `/log` in its sample.

The cause is a real markup-correctness bug, not a missing CSS rule. `CHANGELOG.md`'s
2026-08-14 entry (round 104) reads:

    **Two findings from independent review at `d45a8c9`
    (`docket/reviews/d45a8c9a01c97f877004429cc4160de3c5e382f5.md`), fixed here
    rather than left in a clean draft:**

`app/lib/inline-markdown.js`'s tokeniser matches backtick-code spans,
`**bold**` spans and `*italic*` spans as three alternatives in one non-recursive regex pass
(`TOKEN = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g`). The outer `**...**` here
matches first and swallows everything between the delimiters — including the
two backtick-quoted spans — as one literal string; the backticks inside are
never re-tokenised into `<code>`, so `docket/reviews/d45a8c9a01c97f877004429cc4160de3c5e382f5.md`
(62 characters, no spaces) renders as plain text inside a `<strong>` with the
default `overflow-wrap: normal`. `.log-entry code` already carries
`overflow-wrap: break-word` (added for an earlier, unrelated fix) — the string
never reaches that rule because it never becomes a `<code>` element at all.

This is not the same defect as either of the two this round fixed
(`/model-retirement-calendar`'s table with no scroll container;
`/charter`'s `article code` missing `overflow-wrap`) and fixing it properly
means teaching the tokeniser to recurse into a matched bold/italic span rather
than adding another CSS rule, which is a change to a shared parser used for
both `CHANGELOG.md` and `CHARTER.md` rendering — outside this round's "two
CSS defects" scope and worth its own round rather than a rushed addition here.

`scripts/check-reflow.mjs` records `/log` as a `KNOWN_FAILURES` entry citing
this item, so the route is still measured and printed on every run (not
silently dropped) but does not fail the build until this item closes it.

## Evidence

- `CHANGELOG.md:1052-1054` — the literal source of the offending entry
  (round 104, 2026-08-14), quoted above.
- `app/lib/inline-markdown.js:7` — `TOKEN`'s single-pass, non-recursive
  regex; the root cause.
- `app/globals.css` — `.log-entry code` (added earlier, unrelated round)
  already carries `overflow-wrap: break-word`; this string never reaches it
  because it is never tokenised as `<code>`.
- Measured this round with `scripts/check-reflow.mjs` against a local
  production build (320px viewport, `documentElement.clientWidth`
  denominator — see that script's header for why not `window.innerWidth`):

      FAIL  /log  scrollWidth 500 > clientWidth 320 (+180px at 320px)
              widest: <strong class=""> right edge 500px

## Done when

- [ ] `inlineMarkdown` (or an equivalent fix) recurses into a matched
      `**bold**`/`*italic*` span so a nested backtick-code span still
      becomes a `<code>` element, on both `/log` (via `CHANGELOG.md`) and
      `/charter` (via `CHARTER.md`), which share the same renderer
- [x] `/log` passes `scripts/check-reflow.mjs` at a 320px viewport --
      true as of 2026-08-22, via the unrelated `.log-field`/`.log-note` fix
      above, not via anything this item's own checkbox 1 still requires
- [x] The `/log` entry in `scripts/check-reflow.mjs`'s `KNOWN_FAILURES` is
      removed, restoring `/log` to a real (not merely reported) assertion
- [ ] `node scripts/round.mjs check` green -- true today; re-check when
      checkbox 1 lands, since a tokeniser change could move or remove this
      exact text
