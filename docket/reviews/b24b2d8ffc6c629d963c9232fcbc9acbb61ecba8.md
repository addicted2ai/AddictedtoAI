Commit: b24b2d8ffc6c629d963c9232fcbc9acbb61ecba8
Verdict: approve
Reviewer: claude-sonnet-5 (Claude Code subagent)
Round: 170

## Summary

Third pass, scoped to `git diff 6231317..b24b2d8`. Both findings from my
second pass are fixed, and I could not defeat either fix. Attacked the
boundary the way the coordinator asked — the length floor at 11/12, a
whitespace-padding trick, and the bookkeeping call site independent of
live overflow state — and every case held. The corrected residue prose is
now accurate against the actual code, verified directly rather than taken
on trust. I tried to find a fourth thing and didn't; this is a clean
delta. Approving.

## 1. Does the floor actually hold at the boundary?

Ran the shipped test suite first — 15/15, including the four new cases
(the review's own `""` and `"the"` examples rejected, a genuine
12-character match still classifies known, `checkKnownFailureBookkeeping`
independently rejects an empty snippet):

    node scripts/test-check-reflow-known-failures.mjs
    ok    an empty-string snippet ("") does not match unconditionally -- rejected, not a wildcard
    ok    a short, generic snippet ("the") is rejected rather than matching by accident
    ok    a 12-character snippet that genuinely matches still classifies known -- the floor doesn't overreach
    ok    checkKnownFailureBookkeeping also rejects an empty-string snippet, not only classifyKnownFailure
    all check-reflow.mjs KNOWN_FAILURES tests passed

Then wrote my own boundary tests against the real exported functions,
independent of the shipped fixtures:

    snippet11 length: 11
    ok    11-char snippet (length 11) is rejected -- ... minimum 12 characters ...
    snippet12 length: 12
    ok    12-char snippet (length 12) matches and classifies known -- floor is inclusive at exactly 12

The floor sits exactly where the round says: 11 fails, 12 passes. Not
off-by-one in either direction.

**Whitespace-padding.** Tried a snippet that is 12 raw characters of pure
whitespace, and a snippet padded with whitespace around a 3-character real
token (`"     the     "`, raw length 13):

    whitespaceOnly raw length: 12, trimmed length: 0
    ok    a 12-space whitespace-only snippet (raw length 12, trimmed length 0) is rejected
    paddedShort raw length: 13, trimmed length: 3
    ok    a whitespace-padded short snippet (raw length 13, trimmed 3) is rejected

`invalidSnippetReason` calls `.trim()` before measuring length
(`s.trim().length < MIN_SNIPPET_LENGTH`), so padding a degenerate snippet
with spaces to clear the raw-length bar does not work. This is the
specific trick I'd have reached for first and it's closed.

**`checkKnownFailureBookkeeping` on a route that is not currently
overflowing** — the case the round says motivated the second call site.
This function's signature is `(route, entry, { repoRoot, now })`; it never
receives an overflow/probe result at all, so I called it directly with an
arbitrary route name and a malformed entry, no browser, no live overflow
data anywhere in the call:

    ok    checkKnownFailureBookkeeping catches an empty-snippet entry with no overflow result involved at all -- FAIL  /some-route-that-is-currently-clean's KNOWN_FAILURES entry cannot identify a specific failure -- ... minimum 12 characters ...: ""
    ok    checkKnownFailureBookkeeping catches a too-short snippet ("short", 5 chars) with no overflow result involved
    ok    checkKnownFailureBookkeeping raises no problem for a valid entry, confirming the check is additive, not overreaching

And confirmed in `main()` (`scripts/check-reflow.mjs:715-716`) that
bookkeeping runs in a loop over every `KNOWN_FAILURES` entry *before the
browser is even launched* — genuinely independent of which routes happen
to overflow on a given run, which is the actual case that would have let
a bad entry sit undetected. This is the call site least likely to have
been tested properly, per the coordinator's own framing, and it's the one
I could prove requires zero live overflow data to trigger.

## 2. Is the corrected residue prose now true?

Read both corrections — the code comment in `scripts/check-reflow.mjs`
and the changelog paragraph in `CHANGELOG.md` (edited in place with an
explicit "that is false" sentence, not quietly reworded). Both now say:
`offenders` is exhaustive, not top-1 — every element is filtered by its
own `getBoundingClientRect().right` independent of any other element's
size, so a smaller offender that individually exceeds the viewport is
caught exactly like a larger one.

This matches what I proved directly in my second pass (a synthetic
900px/340px pair, both individually over the viewport, the smaller one
correctly flagged as unexplained) and matches the code, which I re-read
here and confirms nothing about the offender filter changed in this
commit — only the snippet-validity check was added, ahead of it. The
correction is accurate.

The retained residue (block-level overflow invisible to a bounding-rect
scan, `overflow-x: visible` content wider than its own box) is unchanged
in substance from before. Confirmed it still fails closed post-fix, for
the right reason and not accidentally caught by the new floor:

    classifyKnownFailure({snippets: ["a-perfectly-fine-specific-snippet-here"]}, {overflow:true, offenders:[]})
    -> {"known":false,"reason":"page overflows but no individual element was identified as the cause -- nothing to match against the documented signature"}

A valid, long-enough snippet still gets rejected for the *offenders-empty*
reason, not the length-floor reason — the two checks don't interfere with
each other. I verified this exact shape live with a real browser in my
second pass (an `overflow-x: visible` block whose own box stayed at
250px while the page overflowed by 2927px, `offenders` empty); nothing in
this delta touches that code path, so I did not re-run the live browser
construction and relied on confirming the surrounding logic is unchanged
plus this synthetic re-check — the residue this paragraph now claims is
the one I already independently confirmed holds.

No second inaccurate claim in the corrected paragraph that I could find.

## 3. Does 12 overreach in practice?

**Defensible, not arbitrary.** It's not derived from a formal measure of
"specificity" — no such measure exists, and the round says so rather than
pretending otherwise — but it's a reasoned choice, tested against both
concrete attacks and the one real precedent: comfortably above `"the"`
(3 chars) and empty (0), comfortably below the one snippet this file has
actually shipped (58 characters, the docket-path example). The round's
own stated edge case — a 7-character git SHA fragment — is deliberately
rejected on the reasoning that a bare SHA fragment could coincidentally
recur elsewhere and should be paired with context; I find that reasoning
sound rather than an excuse.

On the coordinator's specific concern — that a floor pushes someone
toward padding snippets with surrounding text, which is its own failure —
I think this overstates the cost in this specific application. A
`snippets` value is meant to match against `offender.text`, which is
`(element.textContent || "").trim().slice(0, 200)` — the *rendered text
content of the actual overflowing element*, which in every real case
we've seen (a `<strong>` sentence, a `<div>` full of prose) is already
well over 12 characters on its own. "Padding to reach 12" in practice
means choosing to copy a slightly longer, still-completely-natural
substring from text that already exists at that length, not manufacturing
filler around an isolated token. I could construct a narrower hypothetical
— an offending element whose *entire* text content is genuinely under 12
characters in isolation (a bare version string in its own element, nothing
else) — where no valid snippet could be written at all without matching a
different element instead. I didn't chase this further: it's a real,
narrow edge inherent to any length-based floor rather than a defect in
this one, nothing in the codebase suggests it's a shape `offenders` has
ever actually produced, and manufacturing a live repro for a case this
narrow felt like exactly the "third finding to justify the pass" the
coordinator asked me not to hunt for.

## Other checks

    node scripts/check-track-scope.mjs 986f6c4 loop/build/true-and-reflowable
    ok    all 16 changed file(s) within build's scope

    git diff 6231317 b24b2d8 -- CHANGELOG.md | grep -c '^-### \|^+### '
    0

No changelog heading boundary crossed — this delta stays inside round
170's own still-unmerged entry, same basis as my second pass: not a rule
5 violation. `docket/reviews/` untouched by this commit (confirmed both
earlier review files are unchanged). The stale doc comment referencing
"the real /log entry" (which no longer exists, since the round's own fix
made `/log`'s only entry unnecessary) is gone — grepped the whole tree at
this commit for that phrase, no hits.

    node scripts/round.mjs check
    === Static checks === ok lint / ok docket / ok track scope
    === Build and serve === ok npm run build
    === Route checks ===    ok all route checks passed
    === Ready to ship ===
    exit 0

Green, including the new snippet-floor tests now wired into
`check-routes.sh` via `scripts/test-check-reflow-known-failures.mjs`.

## What I could not check

- The narrow "entire offender text under 12 characters" edge case in
  section 3 — reasoned about, not constructed live, deliberately, per the
  proportionality instruction.

## Verdict

Approve. Three passes, three real findings, all three fixed and verified
— the original route-keyed bypass, the snippet floor, and the false
residue claim. This delta is exactly what it claims to be: a length
constant, two enforcement call sites, and two prose corrections. I
attacked the boundary the ways asked and it held.
