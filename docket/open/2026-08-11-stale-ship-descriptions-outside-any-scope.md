---
track: meta
filed-by: build
title: README.md, AGENTS.md and the local-loop SKILL still say ship "requests auto-merge" unconditionally
created: 2026-08-11
expires: 2026-11-11
serves: more-true
priority: 2
blocked-by: 2026-08-11-no-track-can-edit-readme-or-env-example.md, 2026-08-11-agent-docs-in-meta-scope.md
---

## Why now

Round 86 (build) made `ship` arm auto-merge only when the round's declared
Origin permits it, and withholds it — saying so — for a `delegated` round.
Three files that describe `ship` still describe the unconditional behaviour:

- `README.md` says "`ship` pushes, opens the pull request and requests
  auto-merge. It does not merge; GitHub does that when `build-and-audit`
  passes." A `delegated` round's `ship` now opens the pull request and
  withholds auto-merge, so this sentence is false for the very rounds the gate
  exists to cover.
- `.claude/skills/local-loop/SKILL.md` says "`ship` pushes, opens the pull
  request, and requests auto-merge." Same falsehood.
- `AGENTS.md` says "`ship` requests auto-merge; it does not merge." Same.

None of these files is in any track's scope today — `README.md` has no path in
`scripts/check-track-scope.mjs` (see `2026-08-11-no-track-can-edit-readme-or-env-example.md`),
and `AGENTS.md` / `.claude/` likewise (`2026-08-11-agent-docs-in-meta-scope.md`).
Round 86 therefore named them in its entry and filed this item rather than
editing them, because editing them would fail the track-scope check.

## Evidence

- `README.md` (round-86 branch): "`ship` pushes, opens the pull request and
  requests auto-merge. It does not merge; GitHub does that when
  `build-and-audit` passes."
- `.claude/skills/local-loop/SKILL.md`: "`ship` pushes, opens the pull request,
  and requests auto-merge."
- `AGENTS.md`: "`ship` requests auto-merge; it does not merge. GitHub merges
  when the checks pass."
- Round 86's own `ship` output, captured during the round: "auto-merge withheld
  — Origin 'delegated' means this round was reviewed before merge", followed by
  the manual arm command. That is the behaviour the three files do not describe.

## Done when

- [ ] The three files describe `ship` as deciding by Origin: it requests
      auto-merge when the round's Origin permits it and withholds it otherwise
- [ ] The description names the manual arm command as the escape hatch for a
      withheld round, and does not present auto-merge as unconditional
- [ ] The change is made by the rounds that own the scope (or the scope
      widening `2026-08-11-no-track-can-edit-readme-or-env-example.md` /
      `2026-08-11-agent-docs-in-meta-scope.md` has landed), and the track-scope
      check passes on the change
