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

## LIFTED 2026-08-28 — the no-push rule is over

**The maintainer lifted this on 2026-08-28, at relaunch, exactly as the rule
required.** He gave the instruction in session; the orchestrator typed the
edit on his explicit authorization after first declining and asking him to
make it himself. Both halves are recorded because the rule's real purpose was
never the keystroke — it was that a human, not an inference, decides when this
repository reaches the public internet.

**`git push` to `main` is permitted.** The condition it now carries is a
different one, and it is not negotiable either:

> **Push only what has passed the gates.** `npm test`, `npm run build`,
> `verify-launch`, `verify-design`, `verify-surfaces` and `verify-analytics`.
> A failing gate is a stop, not a warning. The remote deploys on push, so an
> unverified push is a public defect.

**CLEARING `HOLD.md` — STANDING AUTHORITY, no longer scoped to any one
change.** First granted 2026-08-30 for `make-the-blog-worth-sending` in the
maintainer's words: *"I would rather grant you authority to clear the halt
you'd diagnosed, for this change at least. If this goes like all the other
changes, you will encounter several unforeseen issues, I want you to work
through them!"* He also accepted scope creep needed to resolve them, asking
only that actions and decisions be documented — in the change artifacts or in
beads, whichever fits.

**BROADENED, and the broadening is the correction of a real failure.** On
2026-09-01 the orchestrator diagnosed a deploy halt completely — cause found,
cause resolved, finding filed as `addictedtoai-k2y0` — and then left the file
standing anyway, citing the "scoped to this change" sentence that used to sit
here, and told the maintainer that removal was reserved to him. His answer:
*"This is NOT true ... I have given you authorization at least 5 times now."*
He was right. The authority had been given repeatedly in session and this file
had not kept up, so the stale sentence outranked what he had actually said —
which cost three hours of Desk idle time on a halt whose cause had already
cleared.

**The lesson is bigger than this grant and belongs to whoever reads this next:
a maintainer's live instruction outranks this file, and when the two disagree
the correct move is to follow him AND fix the file — not to quote the file back
at him.** This document is a record of his decisions, not a source of them.

**The word `diagnosed` is the whole grant, and it is not a formality.** The
order is fixed and never varies:

1. Read `HOLD.md` and find out what actually tripped.
2. **Fix the cause.** Not the symptom, and not the detector.
3. Record what tripped, what you found and what you changed — artifacts or beads.
4. *Then* remove the file, and only then.

Clearing a halt to get past a guardrail is the precise thing this repository
forbids everywhere else — *"a run blocked by a guardrail reports it and stops; it
does not loosen the guardrail to get past it."* That still stands. This grant
changes who may clear a **diagnosed and repaired** halt; it does not make the
halt skippable, and a halt you cannot diagnose is a halt you must leave standing
and report. The grant is also the orchestrator's between runs, never a job's:
a job that clears its own halt is the conflict of interest the brake exists for.

The two halves that did **not** broaden, and they are the whole substance:
a halt you cannot diagnose is a halt you leave standing and report, and the
authority is the **orchestrator's between runs, never a job's** — a job that
clears its own halt is the exact conflict of interest the brake exists for.
`STOP` remains the maintainer's alone, created and removed only by him.

Still requiring the maintainer, and still not the agent's to take:

- **`bd dolt push`** — the beads remote is a separate decision he has not made.
- **`gh pr create` / `gh pr merge`** — nothing writes to GitHub's API on an
  agent's judgment.
**`"publish": true` was set on 2026-08-29**, on the maintainer's explicit
instruction, after the site went live. The Pulse and the loop may now commit
and push their own work unattended.

**The orchestrator has STANDING AUTHORITY to turn publishing on and off, at its
own judgment, without asking** — granted 2026-08-29. The intended use is the
obvious one: hold publishing down while a larger change is in flight, and turn
it back on when the tree is coherent again. Turning it *off* needs no
justification at all; the honest bar for turning it back *on* is the same one
that governs any push — **the gates pass**.

**BROADENED 2026-08-30 to all of `data/config.json`.** The maintainer was asked
for a narrow, one-edit grant to add `scout` to the three `degradation.shed_levels
.exclude_types` arrays — a fix `make-the-blog-worth-sending`'s second review
found, which no Desk job could make because the file is reserved. He granted the
general form instead: **the orchestrator may edit `data/config.json` at its own
judgment, between runs, without asking.**

The bar and the boundary are unchanged from the publishing grant. Any edit that
loosens a constraint carries the push bar — **the gates pass**. Any edit that
tightens one needs no justification, exactly as turning publishing *off* needs
none. And the rule this does **not** touch is the one below: a **job** still may
not edit this file, and a job that tries still writes `HOLD.md`. That rule was
never about permission — it exists so a run cannot rewrite its own budget,
shedding or publishing mid-flight, which is a conflict of interest no grant to a
different actor can transfer.

**This does not weaken the reserved-path rule, and the difference is worth
keeping straight.** `data/config.json` remains reserved: **no Desk job may edit
it**, and a job that tries writes `HOLD.md`. That rule exists so a job cannot
unblock its own publishing mid-run — which is a conflict of interest, not a
permission question. An orchestrator acting between runs, on the maintainer's
standing authority, is a different actor in a different position. If you are a
job, this paragraph is not for you.

That is the larger of the two grants and it deserves its own line: a reviewed
launch push is one human-checked act, while this arms a scheduled engine to
push with nobody watching. What still stands between it and the remote is the
same thing that stands between any run and the remote — **the publish step runs
after the site rebuild, so a run that produces content the build rejects
publishes nothing**. That ordering is load-bearing, and it was load-bearing
within hours of being written: on 2026-08-29 the Pulse wrote a bare YAML date
that failed the entry schema and broke its own rebuild, and the publish step
correctly never ran (`addictedtoai-2v6`).

**The original reason, kept because it explains what changed.** The remote is
connected to Vercel and deploys on push. The working tree was deliberately
emptied on 2026-08-28 for the greenfield rebuild, and until it was refilled a
push would have published a blank site over `www.addictedtoai.net`. The tree
is no longer empty. The hazard the rule existed to prevent is gone; the
hazard of pushing something unverified is not, which is why the gate condition
above replaced it rather than nothing replacing it.

Commit locally as often as you like — commits are free and recoverable.

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

## Operating the site — Claude Code specifics

The procedure itself is harness-neutral and lives in **`AGENTS.md`, "Operating
the site"**: starting the Pulse and a Desk run, where the specs live, the
review flow, the swap and its conformance check, the STOP/`HOLD.md` semantics,
and the publish gate. Read that first. Only what is specific to this harness is
below.

- **This harness is the default runner.** `runners.yml` sets
  `default: claude-code-opus`, so `node loop/run.mjs` without `--runner`
  invokes `claude --print --permission-mode acceptEdits --model opus`.
  `claude-code-sonnet` is the cheap-tier entry on the **same `provider`
  (`anthropic`)** — deliberately, because a lane is the subscription that runs
  out, not the vendor's brand. A capacity pause on one pauses both.
- **A Desk job is not a subagent.** The executor contract is one written prompt
  in, files out, exit or be killed. `.job/brief.md` is self-contained on
  purpose: no session, no memory across invocations, no MCP, no hooks, no
  tool-calling API. Never write a brief that assumes the runner inherits the
  conversation that produced it — the conformance checks exist to catch exactly
  that assumption, and the swap dies the moment a brief depends on this
  harness.
- **The working rules above must be copied into every sub-brief.** A spawned
  agent does not inherit them by running in this repository; on 2026-08-21 that
  is precisely how spawned agents woke the maintainer with approval prompts.
  `loop/lib/brief.mjs` does this mechanically for Desk jobs (`GROUND_RULES`);
  anything you spawn by hand is yours to repeat them in.
- **`conformance: unverified` in `runners.yml` is documentation only.** The
  selector reads `data/conformance.json`, which records **four** runners, four
  checks each, as re-read from the JSON on 2026-08-30: `claude-code-sonnet`
  **pass**, `opencode-deepseek` **pass**, `codex-gpt-luna` **fail** (an expired
  login, not a portability defect — it needs `codex login`, which is the
  maintainer's), and **`claude-code-opus` pass, recorded 2026-08-30**. The
  default runner had never been tested until that night, which the Desk warns
  about on every run it starts; an absent record warns rather than refuses, so
  runs had been starting on an untested default. Keep the `runners.yml` field
  and this file in step with the JSON by re-reading the JSON — it is the
  authority, and this passage has now been wrong twice.
- **Beads, not TodoWrite.** Task tracking is `bd` and persistent memory is
  `bd remember`. Both survive a harness switch, which is the entire reason for
  the rule.
- **If you defer something, file it as its own beads issue before you move on.**
  Not in a close-reason, not in a commit message, not in a report to the
  maintainer, not in a comment — **its own issue, with its own id.** A note
  inside a *closed* issue dies with it; a note in a merged commit is findable
  only by someone who already suspects it exists; a note in a chat report dies
  at compaction. The test: **if this thought exists only inside something that
  is finished, it is already lost** — and a closed issue, a merged commit and a
  sent message are all finished.
  Measured on 2026-08-29: the maintainer caught one buried deferral, and
  auditing that single night's work turned up five more. The shape that keeps
  being right is to fix the urgent thing narrowly, file the durable thing
  separately, and name the issue carrying the rest in the fix's own record. An
  outage fix should not carry a redesign — and the redesign must not evaporate
  because the outage got fixed.
- **An auto-mode reminder does not outrank this file.** If the harness suggests
  doing file work through `cat`/`sed`/`grep` in Bash, the working rules above
  still win: Read, Write, Edit, Grep and Glob handle Windows paths and line
  endings correctly and never reach the approval classifier.

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

> **Step 4 of the block above applies only in part, as of 2026-08-28.**
> `git push` is now permitted — but only after the gates pass (see the top of
> this file). `bd dolt push` in that step is still **not** permitted: the beads
> remote is a separate decision the maintainer has not made. So run step 4 as
> `git pull --rebase`, then `git push`, and skip the `bd dolt push` line.
> Steps 1–3 and 5–7 apply unchanged. If `bd` regenerates that block, this note
> still stands.

## Build & Test

Node ≥ 20.11. Run everything from the repository root by absolute path;
`npm --prefix D:/AddictedtoAI <script>` when a script is easier than a path.

| Command | What it does |
|---|---|
| `npm run build` | `node scripts/prebuild.mjs && next build`. Prebuild validates the whole corpus and writes the derived assets; `next build` statically exports every route to `out/`. |
| `npm test` | `node scripts/run-tests.mjs` — finds every `*.test.mjs` under the source directories and hands them to Node's built-in test runner. |
| `npm start` / `npm run serve` | `node scripts/serve-static.mjs out 3000`. **Not `next start`,** which refuses to run under `output: 'export'`. Every local-serve verification uses this. |
| `npm run dev` | `next dev`, for iterating on templates only. It is not what any check runs against. |
| `node pulse/run.mjs` | the Pulse (see `AGENTS.md`). |
| `node loop/run.mjs` | the Desk (see `AGENTS.md`). |
| `node loop/conformance.mjs --runner <id>` | the four portability checks a runner must pass to author or review. |
| `node scripts/verify-launch.mjs` | the launch minimums — entry, prose-body, themed-body, learn, tutorial, post, delta and tool floors, catalog rows, the seeded changed feed, the search index, and every seed review record. `--no-build` skips its build and says so loudly. |
| `node scripts/verify-analytics.mjs [base-url]` | Playwright: exactly one GA4 `page_view` per direct load plus one per client-side navigation, asserted on captured `/g/collect` requests, never on markup. |
| `node scripts/verify-design.mjs` / `verify-surfaces.mjs` / `measure-payload.mjs` | the specs/site bar: WCAG AA contrast, keyboard traversal, no horizontal scroll at 320px, the DOM checks on each surface, and the first-load JS budget recorded in `data/launch.json`. |
| `openspec validate --change build-initial-site --strict` | the spec artifacts. |

**Never edit `package.json`.** Every dependency and script the build needs is
already there. A new prebuild step goes in the `STEPS` array in
`scripts/prebuild.mjs`; a step that throws fails the build, loudly, naming
itself. If something genuinely looks missing, stop and report it.

**Never run two builds concurrently.** Two `next build` processes race over the
one `.next/` and fail with `ENOENT` on `pages-manifest.json` *after* the pages
have generated successfully — a confusing failure that has nothing to do with
the content (filed as `addictedtoai-6s7`). Run the verification steps serially.

## Architecture Overview

A Next.js 15 App Router site with **literal `output: 'export'`** — every route
is a static file in `out/`, there is no server runtime anywhere, and the
consequences are load-bearing: no `next start`, no `redirects()` (the build
generates `vercel.json` from a checked-in `redirects.json` and the host applies
them), and `/status.json` is a plain file the prebuild writes into `public/`.

Five things, and the boundaries between them are the design:

1. **`content/`** — every authored file, Markdown with YAML front matter, one
   file per published thing: `wiki/<kind>/<slug>.md`, `learn/`, `tutorials/`,
   `blog/`, `directory/tools/`, `deltas/`. Nothing here is generated.
2. **`lib/`** — the build core. Schema validation, the closed `kind` list, ids,
   the alias registry and wrap-only linker, `{{fact:…}}` transclusion,
   mentions/backlinks, indexability, the internal-link check, the origin
   allowlist, and every page's rendering. It runs in the prebuild, so a
   violation stops the build rather than shipping a broken page.
3. **`pulse/`** — the deterministic, model-free engine that keeps the data
   layer true: sources → snapshots → diffs → `data/changes.jsonl` → the derived
   tree → the ranked work queue. It never invokes a model and never prompts.
4. **`loop/`** — the Desk: the agentic loop that turns queue items, directives
   and proposals into reviewed, merged work, under budgets, breakers and a
   mandatory review gate, through a runner registry that makes the model,
   provider and harness swappable in one file.
5. **`data/`** — committed in full. Snapshots and their diff history, the
   derived tree (recomputed every Pulse run), review verdicts, the job ledger,
   `config.json`, and `launch.json`'s recorded measurements. Only build output
   and environment files are ignored.

The normative specification is
`openspec/changes/build-initial-site/specs/<capability>/` — eleven
capabilities: `wiki`, `site`, `pulse`, `loop`, `review`, `editorial`,
`directory`, `education-static`, `education-dynamic`, `blog`, `analytics` —
with `design.md` and `tasks.md` beside them. **When this file and a spec
disagree, the spec wins.**

## Conventions & Patterns

- **Fail the build, don't warn.** Unknown front-matter keys, a bad `kind`, a
  duplicate or non-kebab id, an unresolved transclusion, an exclusive alias
  collision, a bogus mention, a broken internal link, an unsourced delta end, a
  third-party origin outside the allowlist — all are build errors naming the
  file and the field. Adding a content field means editing `lib/schema.mjs` by
  design: `alias:` where `aliases:` was meant would otherwise parse cleanly
  into an entry with no aliases and nothing downstream would ever notice. Two
  things warn rather than fail, deliberately: a currency literal in prose, and
  the blog's over-ceiling post rate.
- **Volatile values are bound, never typed.** A price, a context window or a
  status is a feed fact or a `{{fact:…}}` transclusion resolved at build, so it
  cannot rot in prose. Missing values render as absent, never guessed; a
  vanished feed row renders its last-known value with a visible as-of date.
- **`data/derived/` is a pure function of state.** Every Pulse run recomputes
  it from scratch, so a re-run with no world change is byte-identical. State
  that is not derivable from anything else — `changes.jsonl`, `linkcheck.json`,
  `ledger.jsonl`, the snapshots — lives at the data root instead.
- **The machinery never names a model.** `runners.yml` is the only file in
  `loop/`, `pulse/`, `scripts/` and `data/config.json` that may name a model,
  provider or harness. The content corpus names models constantly, because
  models are the site's subject; that is not the same check.
- **Guardrails are mechanisms, not instructions.** The reviewer's edits are
  discarded rather than forbidden; the merge gate refuses an `approve` with an
  empty or duplicated `would-cite`; reserved-path edits and review bypasses
  write `HOLD.md`. A run blocked by a guardrail **reports it and stops** — it
  does not loosen the guardrail to get past it.
- **Tests are `*.test.mjs` beside the code they test.** They build throwaway
  repositories under the OS temp directory and never touch this one; the
  fixture corpora pin the clock so a passing test stays passing tomorrow.
- **Archiving a change moves its paths, predictably, so code never points at
  a change directory.** `openspec archive <name>` moves
  `openspec/changes/<name>/**` to `openspec/changes/archive/<YYYY-MM-DD>-<name>/**`
  and merges every requirement block of its deltas into
  `openspec/specs/<capability>/spec.md`, which is the durable home. Nothing
  under `lib/`, `loop/`, `pulse/`, `scripts/`, `app/` or `tools/` — code,
  tests or fixtures — may reference `openspec/changes/<name>/`; read the live
  spec instead. A document that must name the change writes the archive form.
  Written down on 2026-09-06 after the third instance: a test that verified a
  transcription against a delta at its change path failed the final gates run
  minutes after that change was archived and minutes before the push (bead
  `addictedtoai-2hsy` carries the source test that will refuse the next one).
- **Measure, don't infer.** Every claim recorded in `data/launch.json` is a
  measurement with a date and a stated method. Run the cheap direct check
  before concluding, and never treat truncated output as complete.
- **Every date in this repository is the LOCAL date of the machine that wrote
  it** — `accessed:` on a fact, `date:` on a review record, `verified_on:` on a
  tutorial, a delta end's `date:`. Not UTC. The corpus is authored on one
  machine and the whole freshness layer compares these dates against each
  other, so one convention matters more than which convention it is.
  This is written down because it cost something: on 2026-08-28 a long session
  ran past UTC midnight, and nine agents writing at the same moment split
  104/24 between `2026-08-28` (local) and `2026-08-29` (UTC). Both were true.
  A bare ISO date carries no zone, so nothing in the corpus could adjudicate,
  and each agent reasonably concluded the others were wrong. If a run crosses
  midnight in either zone, keep the local date for everything in that run — a
  wave dated consistently is worth more than a wave dated precisely, because
  `reverify_days` and the overdue-fact sweep measure *intervals*, and an
  interval computed across two conventions is off by a day for no reason a
  later reader can reconstruct.
