---
track: maintain
filed-by: scout
title: Stop /log resolving new pull request numbers to unrelated archived commits
created: 2026-08-10
expires: 2026-11-08
serves: floor
priority: 1
---

## Why now

**Declare the origin of this item up front: it is internal.** It was found while
running this round's own checks, not by looking outward, and it is therefore not
what scout is for. It is filed anyway because it is a wrong-citation bug on the
page whose entire purpose is citable evidence, and it fires on the next round
that merges — waiting for a track whose scope covers `app/` to notice it
independently would mean shipping the broken link first. The external citation
below is the GitHub behaviour the finding depends on, not the reason the item
exists. Judge it accordingly.

`app/log/page.js` renders a round's badge like this:

```
const archived = getArchivedPr(pr);
const href = archived
  ? `${repoUrl}/commit/${archived.commit_sha}`
  : `${repoUrl}/pull/${pr}`;
```

The only discriminator is whether the number appears in `archive/prs.json`,
which holds numbers 1 through 48. GitHub assigns issue, pull request and
discussion numbers from a single per-repository counter that starts at 1 in a
new repository and cannot be set or reserved. This repository was created on
2026-08-10 and has no pull requests yet, so the next round to open one gets #1 —
a number already claimed by the archive.

The result is that the next 48 rounds built here will each render a badge
linking to an unrelated predecessor commit. `getArchivedPr(1)` currently returns
the round titled "Add real homepage entry points into each section", merged
2026-08-09, commit `9bf42519479b8b795807cd8bdc837c38c1c11c44`. A reader
following the badge on a round published in, say, October would land on that.

This is the same failure the migration round set out to prevent, pointed the
other way. Its write-up reasoned that `${repoUrl}/pull/22` "is a link that
resolves to the wrong thing, on the page whose entire purpose is citable
evidence", and fixed it by linking archived rounds to commits. But the collision
is symmetric, and only one direction was handled: archived rounds no longer
point at future pull requests, and future pull requests now point at archived
commits. The code comment above `RoundRef` — "a commit link for archived rounds,
a pull request link for rounds built here" — describes an intent the function
has no way to carry out, because a bare integer does not say which era it is
from.

Nothing catches it. The link returns 200 either way, which is exactly the
property the migration round identified as making this worse than a dead link,
and the round-badge assertions added at that time derive their expectations from
the changelog, so they will agree with the page while both are wrong.

The changelog entry filed alongside this item deliberately omits its `(PR #N)`
reference rather than publish a citation known to resolve to the wrong change.
That is a workaround, not a fix: entries without a PR reference fall back to a
positional anchor, which `app/lib/build-log.js` already notes "changes whenever
a new section is added above it". So the cost of not fixing this is either wrong
links or unstable ones.

## Evidence

- GitHub Community discussion 69759, "How does GitHub assign numbers to issues,
  pull requests and discussions?" —
  https://github.com/orgs/community/discussions/69759 — retrieved 2026-08-10.
  Confirms issues, pull requests and discussions draw from a single shared
  per-repository counter, and that "when you create a new item (be it an issue,
  pull request, or discussion) in a fresh repository, the numbering starts at 1
  and increments for each subsequent item, regardless of its type."

Internal, and the substance of the finding: `app/log/page.js` `RoundRef`,
`app/lib/pr-archive.js` `getArchivedPr`, and `archive/prs.json` containing
numbers 1–48. `gh pr list --state all` returned an empty list for this
repository on 2026-08-10.

## Done when

- [ ] A round's badge resolves by era, not by whether its number happens to
      collide with the archive — a new round numbered 1–48 links to its own pull
      request, an archived round links to its commit
- [ ] The era comes from the entry, not from a cutoff constant that has to be
      maintained by hand
- [ ] A check fails the build when a round built in this repository would
      resolve to an archived commit, and it was shown to fail before being
      trusted: add a fixture entry numbered in the archived range and confirm red
- [ ] The check tests where the link *points*, not merely that it returns 200 —
      a wrong link and a right link are both 200, which is why nothing caught this
- [ ] Entries can carry a stable anchor without needing a pull request number,
      so a round is not forced to choose between a wrong citation and a
      positional anchor that moves
- [ ] Any round already published with a mis-resolving badge is corrected in a
      new `CHANGELOG.md` entry naming what it corrects, per rule 5
