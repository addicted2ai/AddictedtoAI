# Agent Instructions

## LIFTED 2026-08-28 — the no-push rule is over

The maintainer lifted it at relaunch, as the rule required. He gave the
instruction in session; the orchestrator typed the edit on his explicit
authorization, having first declined and asked him to make it himself. Both
halves are recorded, because the point was never the keystroke — it was that a
human decides when this repository reaches the public internet.

**`git push` to `main` is permitted, and carries one condition:**

> **Push only what has passed the gates** — `npm test`, `npm run build`,
> `verify-launch`, `verify-design`, `verify-surfaces`, `verify-analytics`.
> A failing gate is a stop, not a warning. The remote deploys on push, so an
> unverified push is a public defect.

**Still the maintainer's, not an agent's:** `bd dolt push`; `gh pr create` and
`gh pr merge`; and `"publish": true` in `data/config.json`, which stays
`false` — that flag arms the Pulse's and the loop's *own* unattended publish
step, a far larger grant than one reviewed launch push, and it belongs with
task 9.5.

**Why the rule existed:** the remote deploys to `www.addictedtoai.net` through
Vercel on push, and the tree was deliberately emptied for the greenfield
rebuild, so a push would have published a blank site. The tree is no longer
empty. That hazard is gone; the unverified-push hazard is not, which is why
the gate condition replaced it.

Commit locally and often. See `CLAUDE.md` for the full working rules, which
apply to every agent in this repository.

---

## Operating the site

Harness-neutral. Every command below is a plain Node script (Node ≥ 20.11) run
from the repository root by any agent under any harness — nothing here is a
feature of one tool. Run them by absolute path; never `cd`.

### The two engines

The site has exactly two moving parts, separated by whether a model is
involved at all (design D2):

| | Command | What it is |
|---|---|---|
| **The Pulse** | `node pulse/run.mjs` | Deterministic and model-free. Stop-file check → fetch sources → snapshot/hash/diff → data layer (incl. stub minting) → rolling link check → freshness → the derived queue → rebuild → publish step. Safe on a schedule, idempotent between world changes, never prompts. |
| **The Desk** | `node loop/run.mjs` | The agentic loop. One job per run: resume-or-select → brief → executor → gates → review → merge → publish step → ledger line. |

`pulse/README.md` and `loop/README.md` document the contracts each depends on;
read the relevant one before changing either.

**Starting the Pulse.** `node pulse/run.mjs`. Flags: `--offline` (no network
request at all), `--force` (ignore each source's `fetch_every_days`),
`--no-build`, `--no-mint`, `--dry-run` (the publish step prints what it would
do and executes nothing). `PULSE_ROOT` points a whole run at another tree —
this is how the fixture tests exercise the real program — and `PULSE_NOW`
fixes the clock. **No model-related environment variable is read anywhere**;
`node pulse/verify-zero-model.mjs` and `pulse/tests/zero-model.test.mjs`
enforce that structurally.

**Starting a Desk run.** `node loop/run.mjs [--runner <id>] [--reviewer <id>]
[--dry-run]`. Do the dry run first: it prints the selected (or resumed) job and
the assembled brief and invokes nothing.

A run resumes the oldest resumable `job/*` branch before selecting anything
new. Otherwise it takes work in a fixed order: `DIRECTIVES.md` (the
maintainer's, first in line — lines already carrying `[done <date> <job-id>]`
are skipped), then `data/derived/queue.json` (written by the Pulse, already
ranked — file order *is* the ranking), then ripe proposals in
`data/proposals/`. It assigns `j-<yyyymmdd>-<seq>`, commits a self-contained
`.job/brief.md` to `job/<job-id>`, invokes the runner under that job type's
wall-clock cap from `data/config.json`, and classifies the outcome from the
first line of `RESULT.md` — `done` / `blocked: <reason>` / `capacity`, with
absent-or-malformed meaning `interrupted`. Every run appends one line to
`data/ledger.jsonl`, which is the only state the 30-day budget is computed
from. Job worktrees are created **outside** the repository; they are scratch,
and everything resumption needs is committed to the branch.

### Where the specs live

`openspec/changes/build-initial-site/specs/<capability>/` holds the eleven
capability specs — `analytics`, `blog`, `directory`, `editorial`,
`education-dynamic`, `education-static`, `loop`, `pulse`, `review`, `site`,
`wiki` — with `proposal.md`, `design.md` and `tasks.md` beside them. They move
to `openspec/specs/` only when the change is archived, which has not happened
yet, so **the change directory is the constitution today**. Validate with
`openspec validate --change build-initial-site --strict`.

### The review flow

No prose reaches `main` without a recorded verdict (`specs/review`). Three of
the steps are mechanisms rather than instructions, which is the whole design.

1. The diff, the checklist for the piece's kind, and **nothing of the author's
   reasoning** go to a separate invocation with fresh context. The authoring
   run and the reviewing run are never the same session.
2. The reviewer runs in a **disposable worktree**. Whatever it edits there is
   discarded and the reviewed branch is asserted unchanged afterwards — "no
   edit rights" is enforced by throwing the tree away, not by asking.
3. The verdict is written to `data/reviews/<job-id>.md` (seed content uses
   `seed-<slug>.md`): a verdict from `approve` / `revise` / `reject`, reasons
   from the closed list in `loop/lib/review.mjs`, and — for prose — a
   **non-empty `would-cite`**.
4. The merge step refuses without an `approve`; refuses an `approve` whose
   `would-cite` is empty; and refuses one whose `would-cite`, after trimming,
   duplicates an existing record's. None of this can compel judgment. Its job
   is to make the question get asked.
5. Revise once. A piece that fails a second time is discarded and the record
   kept.

**Dates are the local date of the machine that wrote them, never UTC** — a
record's `date:`, a fact's `accessed:`, a tutorial's `verified_on:`, a delta
end's `date:`. A bare ISO date carries no zone, and on 2026-08-28 a session
running past UTC midnight had nine agents split 104/24 between the two, each
correctly, with nothing in the corpus able to adjudicate. Freshness measures
*intervals* between these dates, so one convention beats a more precise one.
A run that crosses midnight keeps the local date throughout.

### The swap — a different model, provider or harness

`runners.yml` is the only file in the machinery that names a model, a provider
or a harness. `loop/`, `pulse/`, `scripts/` and `data/config.json` never do,
and a harness name found in those paths is a bug — the swap is only real while
this file is the single point of change.

1. Add the combination to `runners.yml`: `id`, `provider` (**the lane key** —
   runners sharing a subscription share a `provider`, so a `capacity`
   classification on one pauses all of them; it is the thing that runs out, not
   the vendor's brand), `tier` (`frontier` | `cheap`), `roles`, the `command`
   template, and an optional `capacity_stderr_pattern`. Installing the tool and
   holding its credentials is the maintainer's work: the loop never reads,
   writes, passes or prints a credential.
2. `node loop/conformance.mjs --runner <id>` — four canned checks: a trivial
   edit, an insufficient-information job that must come back `blocked`, a
   fabricated-quote trap, and a reserved-path probe. Each PASS condition is
   defined in terms of the executor result protocol, so a check finished
   **without a well-formed `RESULT.md` FAILs regardless of how good the diff
   looks**.
3. Read the four PASS/FAIL lines. The machine-readable result is recorded in
   `data/conformance.json` — never in `runners.yml`, which is reserved — and
   `loop/run.mjs` refuses a runner carrying any recorded FAIL for `author` or
   `reviewer`, naming the failed check. A runner with *no* record is warned
   about, not refused; that is deliberate, so a fresh clone can run at all.

The executor contract is the entire interface: **one written prompt in, files
out, exit or be killed**. No session, no memory across invocations, no
subagents, no MCP, no hooks, no tool-calling API, no structured output, no
minimum context window, no vendor file layout.

### STOP and HOLD.md

Two different brakes. Neither is the loop's to release.

- **`STOP`** at the repository root is the **maintainer's** brake. `node
  pulse/run.mjs` exits immediately saying so, and the Desk refuses to start.
  The maintainer creates it; the maintainer removes it.
- **`HOLD.md`** at the repository root is the loop's **self-halt**, written
  with its reason when a breaker trips: three consecutive same-type failures
  (counting only `failed` and `discarded` — never `blocked`, `interrupted`,
  `capacity` or `abandoned`), build or deploy red, a review-bypass attempt, or
  an attempt to edit a reserved path. The Desk refuses to start while it
  exists.

**Removing `HOLD.md` is itself a reserved-path violation.** A halted Desk is
waiting for a person; clearing the file is not the repair.

Reserved paths, which no job may edit: `openspec/specs/`, `data/config.json`,
`runners.yml`, `STOP`, and the removal of `HOLD.md`.

### Publishing

`data/config.json` is the one normative loop config: the `publish` flag, the
budget bounds (upkeep floor 40%, new-writing ceiling 45%, machinery ceiling
10%), the per-type wall-clock job caps, and the capacity-degradation
thresholds. Both engines call the same publish step (`pulse/lib/publish.mjs`),
so there is exactly one implementation of deploy and exactly one gate on it.

**`publish` is `true`** as of 2026-08-29, set on the maintainer's explicit
instruction once the site was live. The Pulse and the loop now commit and push
their own work, unattended.

This was deliberately a separate decision from lifting the no-push rule the day
before: a reviewed launch push is one human-checked act, while this arms a
scheduled engine to push with nobody watching. The guard that remains is
structural rather than procedural — **the publish step runs after the site
rebuild, so a run that produces content the build rejects publishes nothing.**
That ordering earned its keep immediately: on 2026-08-29 the Pulse wrote a bare
YAML date that failed the entry schema and broke its own rebuild, and publish
correctly never ran (`addictedtoai-2v6`).

Verify it the way task 9.5 specifies — **by observing the live site change, not
by runs completing**. Two consecutive scheduled runs whose `/status.json` build
stamps are identical mean publishing is broken, whatever the logs say.

---

This project uses **bd** (beads) for issue tracking. Run `bd prime` for full workflow context.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work atomically
bd close <id>         # Complete work
bd dolt push          # Push beads data to remote
```

## Non-Interactive Shell Commands

**ALWAYS use non-interactive flags** with file operations to avoid hanging on confirmation prompts.

Shell commands like `cp`, `mv`, and `rm` may be aliased to include `-i` (interactive) mode on some systems, causing the agent to hang indefinitely waiting for y/n input.

**Use these forms instead:**
```bash
# Force overwrite without prompting
cp -f source dest           # NOT: cp source dest
mv -f source dest           # NOT: mv source dest
rm -f file                  # NOT: rm file

# For recursive operations
rm -rf directory            # NOT: rm -r directory
cp -rf source dest          # NOT: cp -r source dest
```

**Other commands that may prompt:**
- `scp` - use `-o BatchMode=yes` for non-interactive
- `ssh` - use `-o BatchMode=yes` to fail instead of prompting
- `apt-get` - use `-y` flag
- `brew` - use `HOMEBREW_NO_AUTO_UPDATE=1` env var

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
- **File every deferral as its own issue, before moving on.** Not in a
  close-reason, not in a commit message, not in a report — its own issue, with
  its own id. **If a thought exists only inside something that is finished, it
  is already lost**, and a closed issue, a merged commit and a sent message are
  all finished. Fix the urgent thing narrowly, file the durable thing
  separately, and name the issue that carries the rest.

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
