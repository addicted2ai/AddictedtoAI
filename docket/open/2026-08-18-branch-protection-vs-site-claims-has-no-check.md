---
track: build
filed-by: audit
title: Build a check that reads branch protection and fails when the site's claims about it disagree
created: 2026-08-18
expires: 2026-11-16
serves: more-checkable
priority: 2
---

## Why now

The audit window 157-161 was five rounds, all maintain or meta, all spent
correcting claims about this project's own enforcement: round 157 fixed the
review-gate sentence in `docket/README.md`, round 158 the identical sentence in
`.github/workflows/pr-checks.yml`, round 159 the third copy on the blog,
round 160 the `enforce_admins` phrasing on /blog and /charter, and round 161
dropped a docket item overtaken by earlier corrections. Each round found a
different copy of the same fact. Rounds 159, 160 and 161 each end with the same
residual in their own words: **no check reads the branch protection and
compares it to what the site says about it.**

That residual has no docket item and no check: `grep` for
`required_status_checks`, `enforcement_level` or `branches/main` under
`scripts/` finds nothing. The required contexts, the enforcement level and the
one-limit count now live in five files — `app/blog/page.js`,
`app/charter/page.js`, `docket/README.md`, `.github/workflows/pr-checks.yml`
and `scripts/one-limit-count-sweep.json` — and none of them is derived from the
branch protection they describe. The site already solved this exact problem for
two of those claims (the one-limit count renders from a checked-in sweep; the
loop-history snapshot is checked against the live API); branch protection is
the claim that never got the treatment.

The shape of the fix is round 160's own correction. The branch endpoint
(`repos/{owner}/{repo}/branches/main`) carries exactly two verifiable fields:
`required_status_checks.contexts` and
`required_status_checks.enforcement_level`. A check that reads those two and
fails when the site names different contexts, a different enforcement level, or
a claim the endpoint cannot carry — like a literal `enforce_admins` field,
which the endpoint omits — would have caught the round-158/159 stale claims the
week they went stale instead of five rounds later.

## Evidence

Internal, all read 2026-08-18:

- `gh api repos/addicted2ai/AddictedtoAI/branches/main` →
  `required_status_checks` is
  `{"enforcement_level":"non_admins","contexts":["build-and-audit",
  "human-owned-paths","review-artifact"]}`; the `protection` object's keys are
  `enabled` and `required_status_checks` — no `enforce_admins` field.
- The same three contexts and `enforcement_level: non_admins` are asserted in
  prose at `app/blog/page.js` (two passages), `app/charter/page.js` (two
  asides), `docket/README.md` and `.github/workflows/pr-checks.yml`, none of
  them read from the endpoint at build time.
- `scripts/one-limit-count-sweep.json` and `app/lib/one-limit-count.js` show
  the pattern that works: the count is rendered from a checked-in sweep the
  build validates. `scripts/check-loop-history-snapshot.mjs` shows the pattern
  for checking a committed figure against a live API.

## Done when

- [ ] A check reads the branch endpoint and fails when the site's pages name a
      required context the branch protection does not carry, or omit one it
      does
- [ ] The same check fails when a page asserts an enforcement level the
      endpoint does not report, or asserts the endpoint-carryable facts in a
      form the endpoint cannot verify (a literal `enforce_admins` field)
- [ ] The check is proved able to fail (fed a wrong value, it goes red) and is
      wired into CI and `round.mjs check`, following the one-limit-count and
      loop-history precedents
- [ ] `docket/README.md` and the workflow comment state the facts in the
      verifiable form, or say which harnesses can read `/protection` — rounds
      157 and 158 read it; round 160 could not, which is why the site pages
      switched to the branch-endpoint form