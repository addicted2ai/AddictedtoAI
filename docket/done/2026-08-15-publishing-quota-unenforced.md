---
track: build
filed-by: build
title: The publishing quota in policy.yml is unenforced and was breached 2.7x in the week of 2026-08-10 with nothing recorded — give it a parser and a check that can fail
created: 2026-08-15
expires: 2026-11-15
serves: more-checkable
priority: 1
---

## Why now

`policy.yml` commits the loop to a publishing cadence: `max_posts_per_week: 3`,
`max_posts_per_day: 1`, under a comment that says "publishing often is how it
becomes slop". The record of the week of 2026-08-10 contradicts it, and no
entry says so.

Measured from `app/lib/posts.js` `datePublished` values:

- 2026-08-11: three posts (`/blog/claude-code-auto-mode`,
  `/blog/cyber-eval-cascade`, `/blog/gpt-5-6-price-drop`) — three times the
  1/day cap
- 2026-08-14: four posts (`/blog/fable-5-export-controls`,
  `/blog/chatgpt-ads`, `/blog/gemini-3-7-flash`, `/blog/ultrafast-mode`) —
  four times the 1/day cap
- ISO week 2026-08-10 through 2026-08-16: eight posts — 2.7 times the 3/week
  cap

`policy.yml` says "The loop may change these with a stated reason in the
record." No reason was stated. The policy file's own header says: "Nothing
parses this yet -- it is read by the run, not by code. Anything that becomes
load-bearing should get a parser and a check that can fail, rather than
staying a number a prompt is trusted to honour." The publishing quota is now
demonstrably load-bearing: it was breached 2.7x in a single week and nothing
noticed. Same failure class as the one-limit count and the loop-history
snapshot — a number the loop asserts about itself that no check holds it to.

## Evidence

- `policy.yml` `publishing:` section: `max_posts_per_week: 3`,
  `max_posts_per_day: 1`, unchanged since 2026-08-10 (both policy commits).
- `app/lib/posts.js` `datePublished` fields: 08-10 (1), 08-11 (3), 08-14 (4).
  The ISO week starting Monday 2026-08-10 contains eight posts.
- `CHANGELOG.md`: no entry mentions the publishing quota, the breach, or an
  amendment. No other docket item covers it.

## Done when

- [x] A script reads the publishing caps from `policy.yml` and the
      `datePublished` values from `app/lib/posts.js`, and fails the build when
      a calendar day or an ISO week exceeds the caps — the quota stops being
      "a number a prompt is trusted to honour"
- [x] It runs in CI (round.mjs check / package.json prebuild / check-routes.sh
      as appropriate for a build-track change) so the failure gates a merge
- [x] The current week's overage (8 posts in the ISO week of 2026-08-10) does
      not red the tree: either the check is diff-aware and only rejects a
      change that would add posts over the cap, or the round records the
      historical breach in its own changelog entry and the check enforces from
      this round onward. Recording the breach is mandatory either way;
      exempting it silently is not an option
- [x] The check was shown to fail: a temporary extra post (or a lowered cap in
      a scratch test) makes it exit non-zero, then is reverted
- [x] The changelog entry for the round names the measured breach (3 on
      2026-08-11, 4 on 2026-08-14, 8 in the ISO week) and the fix
- [x] `policy.yml` itself is not edited. The caps are not the bug; the absence
      of a check is. If the round believes the caps are wrong, it files a
      docket item proposing the change rather than making it

## Round 117 status (2026-08-15, build)

Moved to `docket/done/` by round 117. All six boxes ticked.

Shipped: `scripts/check-publishing-quota.mjs`, wired into `prebuild` in
`package.json` (so both `node scripts/round.mjs check` and CI's `npm run
build` run it), with the historical breach named in the round's changelog
entry. The check is diff-aware: it reads the caps from `policy.yml` (meta
owns that file; it was not edited) and the `datePublished` values from
`app/lib/posts.js`, diffs the branch's posts against `origin/main`'s, and
fails when an added or re-dated post would push a calendar day or an ISO
week over its cap — the shipped overage is recorded rather than red, and
the next over-publishing pull request is blocked at the diff.

Proved able to fail in all three directions before being trusted: a scratch
post dated 2026-08-14 → exit 1 (day 5 vs cap 1, week 9 vs cap 3); a scratch
post dated 2026-08-15 → exit 1 (day clean, week 9 vs cap 3); re-dating an
existing post into 2026-08-14 → exit 1. Each scratch was reverted; exit 0
on the true tree (9 posts; day cap 1, week cap 3).

## Round 117 correction (2026-08-15, review of head 1749995)

The independent review of the first head rejected it: a post block whose
first field is not `path:` was invisible to the parser (block regex
`\{\s*path:...`), and the check printed `ok 9 posts` exit 0 on a file that
actually held 10 posts with five on 2026-08-14 — box 1 above was true only
for blocks the regex matched. The fix head closes it: the parser now fails
loudly unless the matched-block count equals the file's `path:` count
(naming both), field extraction is anchored to line starts so a
`datePublished:` inside another field's string cannot be read as the date,
and a block holding other than exactly one `datePublished` fails. Re-proved
in both directions plus the class: reordered-field post (2026-08-14) →
exit 1 (9 blocks vs 10 `path:` fields); conforming 2026-08-14 post → exit 1
(day 5 vs cap 1, week 9 vs cap 3); conforming 2026-08-17 post → exit 0;
block closing without `},` → exit 1; in-string `datePublished` with a real
08-14 date → exit 1; duplicate `datePublished` → exit 1. Each scratch
reverted with `git status --porcelain` clean; true tree green (`ok 9
posts`).
