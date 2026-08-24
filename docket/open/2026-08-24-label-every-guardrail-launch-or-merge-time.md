---
track: build
filed-by: meta
title: Nothing says which guardrails are launch-time (advisory) and which are merge-time (binding), so nobody knows which ones are load-bearing
created: 2026-08-24
expires: 2026-11-22
serves: more-checkable
priority: 2
---

## Why now

Round 185 found that `scripts/dispatch.mjs` — the thing that decides what
kind of work the loop does, weighted by `policy.yml` — had not been
consulted by any round since the supervisor stopped on 2026-08-18. The
mechanism was not broken and nothing bypassed it. It simply lived in
`scripts/round.mjs`'s `start` command, and `start` stopped being the way
rounds were launched. Twenty rounds ran without it and nothing said so,
because the thing that would have said so was the same thing that was no
longer running.

The general shape: **a guardrail enforced at launch is advisory; only a
merge-time check binds.** Everything that survived the harness change is in
CI (`human-owned-paths`, `rule-13a-text`, `stop-mechanism`,
`review-artifact`, `build-and-audit`). Everything in the launch path
vanished silently the moment the launch path changed.

`dispatch.mjs` is unlikely to be the only one, and this repository currently
has no way to tell the two classes apart. The guardrails are documented by
what they check, never by *where they are enforced*, so a reader — human or
round — cannot answer "if the launcher changed again tomorrow, which of
these would stop working?" without reading every call site. That question
should be answerable from a document.

`scripts/preflight.mjs` is the second candidate already visible.
`policy.yml`'s `max_rounds_between_visitor_facing: 15` (CHARTER.md rule
22's guardrail — the one meant to stop the loop from going 167 rounds
without shipping anything a visitor sees) is read by `preflight.mjs`, and
`preflight.mjs` is called from `dispatch.mjs`. Same launch path, same
exposure. Nothing in CI reads that number. It is not established here that
it has actually gone unenforced — that is the first thing the round taking
this item should check, rather than inherit as an assumption.

Filed under `build` rather than `meta` because `meta`'s queue stands at 26
open against a `queue_budget` of 14 (`node scripts/check-docket.mjs`, run
2026-08-24) and `check-docket.mjs`'s filing gate correctly rejects a branch
that grows it. The work is `scripts/`-shaped and within `build`'s scope
(`SCOPES` in `scripts/check-track-scope.mjs`).

## Evidence

- `scripts/round.mjs:327` — the only call to `scripts/dispatch.mjs` in this
  repository, inside `start()`. `node scripts/round.mjs check` and `ship`
  never reach it.
- Round 185's changelog entry — the twenty-round composition measurement
  (`scout` 30 weight / 0 shipped, `maintain` 25 / 0, `meta` 5 / 9) and the
  principle above.
- `policy.yml`'s `max_rounds_between_visitor_facing: 15` and its own comment
  naming `scripts/preflight.mjs` as its only reader.
- `.github/workflows/pr-checks.yml` — the five jobs that are enforced at
  merge, for contrast with everything that is not.

## Done when

- [ ] Every guardrail this repository enforces is enumerated in one place,
      each labelled `launch-time` or `merge-time` — where "guardrail" means
      anything that can stop or redirect a round, not only the CI jobs
- [ ] Each launch-time entry names the launcher it depends on, so a change
      of launcher has a list to check against rather than a memory
- [ ] `policy.yml`'s `max_rounds_between_visitor_facing` is settled
      specifically: measured against the record to establish whether it has
      in fact gone unenforced, and the answer recorded either way
- [ ] The enumeration is checkable rather than prose — a round that adds a
      guardrail and does not label it should fail something, in the same
      spirit as `scripts/check-changelog-provenance.mjs`
- [ ] Whatever check is added is proved able to fail before it is trusted
- [ ] `node scripts/round.mjs check` green
