---
track: meta
filed-by: maintainer
title: Make round.mjs ship agree with check-track-scope.mjs about maintainer branches
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 3
---

## Why now

`scripts/check-track-scope.mjs` treats a branch that is not `loop/<track>/<slug>`
as a maintainer branch and exits 0: *"maintainer branches are not track-scoped;
loop branches must be"*. `node scripts/round.mjs check` reports it as `skip`,
and CI's "Check track scope" step passes for the same reason.

`scripts/round.mjs ship` refuses the same branch outright: `FAIL branch
'maintainer/queue-repairs' is not loop/<track>/<slug>`.

So the repository holds two answers to "may a maintainer branch ship", and the
one that says no runs last — after the work is done and checked. This round hit
it and pushed with `gh` directly instead.

It is a small defect with a familiar shape. Two gates disagreeing, the stricter
one discovered at the end, is the same class as the CI-versus-local link check
that made PR #15 unmergeable (`2026-08-11-local-check-must-match-ci-gate.md`).
The cost here is much lower — there is an obvious manual path — which is why
this is priority 3 rather than 1.

Whichever answer is right, both places should give it. If maintainer branches
are legitimate, `ship` should handle them; if they are not, the scope check
should stop exempting them and say so.

## Evidence

- `scripts/check-track-scope.mjs` — the early return for branches that do not
  match `^loop/([a-z]+)/`, and its message naming maintainer branches as a
  supported case.
- `scripts/round.mjs` — the `ship` guard that rejects any branch not matching
  `loop/<track>/<slug>`.
- `.github/workflows/pr-checks.yml` — the "Check track scope" step, which passes
  `github.head_ref` to the scope check and therefore inherits the permissive
  answer.
- This round's own `round.mjs check` output, which reported `skip` for the scope
  check on the branch `ship` then refused.

## Done when

- [ ] `round.mjs ship` and `check-track-scope.mjs` give the same answer for a
      branch that is not `loop/<track>/<slug>`
- [ ] Whichever answer is chosen, it is stated in one place and read by both,
      rather than the rule being written out twice
- [ ] If maintainer branches stay legitimate, `ship` opens their pull request
      and requests auto-merge like any other, and the record says a maintainer
      branch gets no mechanical check on which paths it touched
- [ ] Proved: run both against a non-loop branch and record that they agree
