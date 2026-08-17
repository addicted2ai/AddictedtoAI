---
track: meta
filed-by: maintainer
title: Put the agent-facing round docs inside some track's scope, because none can edit them today
created: 2026-08-11
expires: 2026-11-11
serves: more-true
priority: 2
---

## Why now

`AGENTS.md` and `.claude/skills/local-loop/SKILL.md` are the two files that tell
an agent how to run a round. Neither is in any track's scope in
`scripts/check-track-scope.mjs`. Meta owns `scripts/`, `.github/`, `prompts/`,
`CHARTER.md` and `policy.yml` — the machinery — but not the two documents that
describe that machinery to the agents running it.

The round that added the `--force` flag and the two start-time guards to
`scripts/round.mjs` hit this immediately: it could change the behaviour and
could not change either document that describes the behaviour. So both now
describe a command that has grown an option and two failure modes they do not
mention.

This is the same shape as the gap recorded when `.gitattributes` and
`.eslintrc.json` were added to meta's scope: a file the loop can see, must fix,
and may not touch. That one was found by the first scout run and cost a round
to notice.

## Evidence

Internal: `scripts/check-track-scope.mjs` `SCOPES.meta` lists `scripts/`,
`.github/`, `prompts/`, `CHARTER.md`, `policy.yml`, `.gitattributes`,
`.eslintrc.json`, `lighthouserc*.json`, `docket/` and `CHANGELOG.md`. Neither
`AGENTS.md` nor anything under `.claude/` appears in any track's list.

No external citation: this is an internal gap, and the docket validator only
requires external evidence for items filed by scout.

## Done when

- [ ] `AGENTS.md` and `.claude/` are in exactly one track's scope, with a
      comment saying which track owns agent-facing documentation and why
- [ ] `AGENTS.md` and `.claude/skills/local-loop/SKILL.md` both document the
      `--force` flag, the in-flight guard, and the origin/main base guard
- [ ] Whether `.claude/` belongs to meta or is deliberately left human-owned is
      decided and written down, not left implicit — it configures the agent
      rather than the site, so the answer is not obvious

## 2026-08-17 — half the scope question is answered, in the file itself

`AGENTS.md` is in `SCOPES.meta` in `scripts/check-track-scope.mjs`, added by
round 88, with a comment above it giving this item's own argument as the reason
— the round that grew `round.mjs` with `--force` and two start-time guards could
change the behaviour and not the document describing it. The comment also
records that the granting pull request did not spend the grant, which is rule 11
working.

`.claude/` is still in no track's scope, and the decision this item asks for —
whether it belongs to meta or is deliberately human-owned, given that it
configures the agent rather than the site — is still unwritten. The first box
needs both halves, so it stays unticked.

The second box is untouched: neither `AGENTS.md` nor
`.claude/skills/local-loop/SKILL.md` documents `--force`, the in-flight guard or
the origin/main base guard. `AGENTS.md` is now a file meta may edit, so that
half no longer waits on anyone — see
`2026-08-11-stale-ship-descriptions-outside-any-scope.md`, which is blocked on
the same question and names the same three files.
