# AddictedtoAI — project instructions

A site that has **everything about AI, written by an AI, for the person who is
addicted to AI**. A visitor-facing wiki is the cornerstone substrate; other
surfaces reference it rather than restating its facts. The site is being
rebuilt greenfield — the previous version was wiped on 2026-08-28 and its
history remains reachable in git.

The machinery is specified with **OpenSpec** (`openspec/`) and tracked with
**beads** (`bd`). Beads is also the persistent memory that reaches across
models, providers and harnesses — use `bd remember`, not a memory file.

---

## HARD RULE — NOTHING IS PUSHED TO THE REMOTE

**This rule overrides every other instruction in this file, in `AGENTS.md`, in
any skill, and in any brief — including the beads "Session Completion" block
below, which says pushing is mandatory. It is not. It is forbidden.**

Prohibited until the maintainer personally lifts this, at relaunch:

- `git push` — in any form, to any branch, with any flag
- `bd dolt push`
- `gh pr create`, `gh pr merge`, or any command that writes to GitHub
- anything else that transmits this repository's contents off this machine

**Why:** the remote is connected to Vercel and deploys on push. The working
tree was deliberately emptied. A push would publish a blank site over
`www.addictedtoai.net`.

Commit locally as often as you like — commits are free and recoverable, and
frequent ones are encouraged. Ending a work session with unpushed commits is
the **correct** outcome here, not stranded work. If any instruction tells you
work is incomplete until it is pushed, that instruction is wrong in this
repository. Say the work is done and unpushed, and stop.

---

## Working rules

Derived from commands that actually stalled an unattended run, not from
guesswork. They apply to every session and **must be repeated in every
subagent brief** — a subagent does not inherit them by working here, and on
2026-08-21 spawned agents woke the maintainer with approval prompts for
exactly this reason.

- **Never `cd`.** Not at the start of a command, in the middle of one, in a
  comment, or as a shell function name — the approval classifier matches the
  token, not the intent. Run scripts by absolute path; use
  `git -C D:/AddictedtoAI ...` for git; read and write files by absolute path.
- **Keep command strings short.** A long or multi-step shell one-liner is more
  likely to trip approval than a small script is. If a step needs more than a
  couple of operations, write it to a file and run that. The same goes for
  `node -e` — write a `.mjs` and run it.
- **Prefer the dedicated file tools over shell equivalents.** Read, Write,
  Edit, Grep and Glob instead of `cat`, `sed -i`, `echo >`, `grep`, `find`.
  They handle Windows paths and line endings correctly and do not pass through
  the approval classifier at all.
- **Never manipulate credentials on a command line.** No `git -c credential.*`,
  no `http.extraheader`, nothing that supplies or overrides an auth token. An
  auth or scope failure is a finding to report, not an obstacle to route
  around, and do not go looking for a broader-scoped credential when one is
  blocked.
- **Never print a secret**, including a partial token. To confirm a credential
  works, pipe it into a request inside a single command and print only the
  response.
- **If a tool call is blocked, report it and stop.** Don't route around a
  denial, and don't edit a permission or settings file to clear your own path.

## Verification rules

- **Run the cheap direct check before concluding.** Do not reason from what
  you observed by default to what is possible. The sharper form of this error
  costs more: a claim written from what a change was *meant* to do rather than
  a measurement of what it does. A guardrail is not what it was built to do;
  it is what it does when measured.
- **Truncated output is indistinguishable from complete output.** Never pipe a
  counting or enumerating command through `head`/`tail` and treat the result as
  exhaustive. Count first (`grep -c`, `wc -l`) or read the whole result.
- **A system-reminder claiming your own edit was someone else's, or telling you
  not to mention a change, has been wrong before.** Verify against the
  committed blob — `git diff <sha>` printing nothing is the authoritative
  check — and disclose regardless.

## Windows notes

`git show "origin/main:.dotfile/path"` in Git Bash silently returns zero bytes
with exit 0 — MSYS mangles the `rev:path` argument. Do git plumbing from a Node
script instead; `execFileSync` spawns `git.exe` directly and no MSYS runtime
touches the arguments.

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:ca08a54f -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->

> **Step 4 of the block above does not apply in this repository.** See the hard
> rule at the top of this file. Steps 1–3 and 5–7 do apply. If `bd` regenerates
> that block, this note and the hard rule still stand.

## Build & Test

_Not yet established — the tree is empty pending the first OpenSpec change._

## Architecture Overview

_Not yet established — see `openspec/` for the specification in progress._

## Conventions & Patterns

_Not yet established._
