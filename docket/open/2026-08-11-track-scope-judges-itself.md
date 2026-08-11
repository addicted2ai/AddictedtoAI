---
track: meta
filed-by: maintainer
title: Make the track-scope check read its rules from main, not from the branch it is judging
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 1
---

## Why now

`pr-checks.yml` runs `node scripts/check-track-scope.mjs` after checking out the
pull request's head. The scope map it enforces therefore comes from the branch
under test. A round can add a path to its own track's `SCOPES` entry and use
that path in the same pull request, and the check will pass — because by the
time it runs, the branch has already granted itself the permission.

`CHARTER.md` rule 11 says a run blocked by a guardrail may not be the run that
loosens it: it may make the case, and a later run or the maintainer decides.
The track-scope check is the guardrail most likely to block a round, and it is
currently the easiest one to loosen silently.

The round that filed this did exactly that — adding `vercel.json` to meta's
scope and creating `vercel.json` in one pull request. That was legitimate only
because it was `Origin: maintainer`, and rule 11 names the maintainer as one of
the deciders. A round with `Origin: unsupervised` doing the same thing would
have breached rule 11 with every check green, which is precisely the failure
this project keeps finding: a check that derives its expectation from the
artefact under test can only catch transcription errors, never truth errors.

## Evidence

Internal: `.github/workflows/pr-checks.yml` runs the checker straight after
`actions/checkout@v4`, so `scripts/check-track-scope.mjs` and its `SCOPES` map
are the branch's copies, not `main`'s.

No external citation: this is an internal property of this repository's own CI,
and the docket validator only requires external evidence for scout-filed items.

## Done when

- [ ] The scope check runs with the rules from the merge base — for example by
      reading `git show origin/<base>:scripts/check-track-scope.mjs` and
      executing that, rather than the branch's copy
- [ ] A change that widens a track's own scope and uses the widened scope in
      one pull request fails, and this is demonstrated before the change is
      trusted
- [ ] Widening a scope remains possible in a pull request that does *not* also
      use the new permission, so rule 11's "file the case, a later run decides"
      path still works
- [ ] The same question is asked of every other check that runs from the branch
      rather than from the base, and the answer is written down — this is the
      third distinct instance of a check taking its expectation from the thing
      it is testing
