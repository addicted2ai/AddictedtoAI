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
