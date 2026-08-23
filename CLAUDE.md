# CLAUDE.md

Facts about this project's arrangement — the identities, `docket/HOLD.md`,
credentials, the delegation, who controls what — live in `FRAME.md` at the
repository root. Read it before asserting anything in that territory; do not
rely on a prior session's summary or memory for it, however confident it
sounds. Run `node scripts/check-frame.mjs` to check any of its claims
against the current tree.

`AGENTS.md` covers how to run a round. `CHARTER.md` is the binding ruleset —
21 rules, human-owned. This file is the one Claude Code's own approval
classifier reads alongside everything else here, so the rules below reach
every session automatically, not only the ones that remember to look for
them.

## Working rules

Derived from commands that actually stalled an unattended run, not from
guesswork. All of them apply to every session in this repository.

- **Never `cd`.** Not at the start of a command, in the middle of one, in a
  comment, or as a shell function name — the approval classifier matches the
  token, not the intent. Run scripts by absolute path; use
  `git -C <path> ...` for git commands; read and write files by absolute
  path.
- **Keep command strings short.** A long or multi-step shell one-liner is
  more likely to trip approval than a small script is. If a step needs more
  than a couple of operations, write it to a file and run that instead.
- **Never manipulate credentials on a command line.** No
  `git -c credential.*`, no `http.extraheader`, nothing that supplies or
  overrides an auth token. A push or fetch that fails on authentication or
  scope is a finding to report, not an obstacle to route around — and do not
  go looking for a broader-scoped credential when one is blocked (see
  `FRAME.md`; this has happened before and is recorded as a failure, not a
  technique).
- **Never print a secret.** Not with `cat`, `head`, `echo`, or into your own
  tool output — including a partial token. To confirm a credential works,
  pipe it into a request inside a single command and print only the
  response, never the value.
- **Prefer the dedicated file tools over shell equivalents.** Read, Write,
  Edit, Grep, and Glob instead of `cat`, `sed -i`, `echo >`, `grep`, `find`.
  They handle Windows paths and line endings correctly and do not pass
  through the approval classifier at all.
- **If a tool call is blocked, report it and stop.** Don't route around a
  denial, and don't edit a permission or settings file to clear your own
  path — that decision belongs to the maintainer, not to the run it would
  have blocked.
