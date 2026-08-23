Branch: loop/build/first-screenful-density
Track: build

# Round 174 — the first screenful

Branch: `loop/build/first-screenful-density`, created for you at
`origin/main` (`9749013`). Track: **build**. Do not create or switch
branches. Work in `D:/AddictedtoAI`.

## Why this round exists

The maintainer's oldest standing complaint about this site is that it
talks to itself. Last round's design survey measured that complaint and
found a specific, mechanical form of it, filed as

    docket/open/2026-08-22-first-screenful-density.md

**Read that item first. It is the specification for this round** — its
"Why now", its Evidence, and its four "Done when" checkboxes. This brief
does not restate it, because a restatement is a second copy that can drift
from the first.

The short version: fifteen reference sites people return to for
consultation all show enumerable content — `tr` or `li` — above an 800px
fold, median 11. This site shows **zero on five of seven pages**, and
`/model-retirement-calendar` puts 672px of prose between its `h1` and the
first of 87 data rows, so **0 of 87 are visible before scrolling**.

## The two properties that matter more than any mechanism

**1. Measured, not estimated.** Whatever ships is measured the same way
the finding was found — content units intersecting the first 800px of a
1280-wide viewport, against a real render. The item it closes was filed
partly *because* the design rubric that preceded it got two different
numbers wrong by computing them from CSS instead of rendering them. Do not
repeat that. `scripts/check-reflow.mjs` already drives Chrome over CDP for
a different measurement and is the nearest working example of the
technique in this repository.

**2. The editorial tradeoff is stated, not assumed away.** The survey was
explicit that this is *not* a claim the prose is bad — "the framing on this
site is often the interesting part" — only a claim about where it sits. A
reader arriving at a table of dates and a reader arriving to understand
what the table means are different readers, and the item deliberately
declines to prescribe a word count. **So does this brief.** Whether context
moves below the table, beside it, behind a disclosure, gets shortened, or
stays exactly where it is with a stated reason, is yours to decide and
defend. An explicit "we kept it and here is why" is an acceptable outcome
for any given page; an unstated one is not.

## Scope

`build` track: `app/`, `public/`, `docket/`, `scripts/`, `package.json`,
`CHANGELOG.md`. The five zero-unit pages are `/`, `/directory`, `/blog`,
`/blog/*` and `/charter`; `/model-retirement-calendar` (1 unit) and
`/what-vendors-promise` (4) are the two that already show something.

You do not have to fix all seven to close the item — you have to make a
decision about each and record it. Fixing the retirement calendar well is
worth more than touching all seven shallowly.

## What you may not do

- **Do not touch `.github/`.** The loop's push credential holds
  `public_repo` only; GitHub refuses server-side any push touching
  `.github/workflows/`. Wire any new check into `scripts/check-routes.sh`,
  which the `build-and-audit` job already runs.
- Do not widen a track's scope map to fit your work. If something belongs
  outside `build`, file it instead.
- Do not edit past changelog entries (`CHARTER.md` rule 5).

## Done when

- [ ] Every checkbox in `docket/open/2026-08-22-first-screenful-density.md`
      is satisfied or explicitly answered
- [ ] The before and after are measured on a real render, both numbers in
      the changelog entry, with the command that produced them
- [ ] If you ship a check, it is **proved able to fail** before it is
      trusted — construct the failure, paste the output, revert, confirm
      clean
- [ ] Nothing under `.github/` is modified
- [ ] `node scripts/round.mjs check` green

## Rules

- `Origin: delegated`. One CHANGELOG entry, one shared
  `Origin`/`Track`/`Agent`/`Guardrails`/`Result` block. A `**N. ...**`
  heading must open and close on one line.
- Commit this brief to
  `docket/briefs/loop-build-first-screenful-density.md`, including its
  `## Premises` section, and confirm `node scripts/check-briefs.mjs`
  passes.
- Do **not** push, open a pull request, run `round.mjs ship`, or merge.
- Commit incrementally. Every number in the entry needs a command behind
  it.
- **If you find an error in this brief, say so explicitly** in your report
  and in the changelog entry. Two of the last five rounds found one. A
  premise that cites a real source which does not actually support its
  claim is the specific shape to watch for — `check-briefs.mjs` cannot
  catch it and says so itself.

## Premises

This brief declares 6 premises below.

1. `docket/open/2026-08-22-first-screenful-density.md` exists, is filed on the `build` track with `serves: worth-a-visit`, and carries the measurements this brief summarises. [command: head -20 docket/open/2026-08-22-first-screenful-density.md]
2. `app/model-retirement-calendar/page.js` places several paragraphs and a callout between its `<h1>` and the first rendered table, and its table component is `data-retirement-table`-keyed. [command: grep -n "<h1\|<p\|<table" app/model-retirement-calendar/page.js]
3. `scripts/check-reflow.mjs` already drives a headless Chrome over CDP against a local production build, so the measurement technique this round needs is present in the repository rather than new. [command: grep -n "cdp\|CDP\|Page.navigate\|Runtime.evaluate" scripts/check-reflow.mjs]
4. A branch touching `.github/workflows/` cannot be pushed by the loop's credential. [frame:4]
5. `CHARTER.md` rule 5 makes the record append-only: no past entry is rewritten, deleted, softened or quietly amended. [command: grep -n "The record is append-only" CHARTER.md]
6. The maintainer's standing complaint is that the site talks to itself, and visitor-facing work is their stated priority over further loop machinery. [attested: maintainer, in conversation on 2026-08-22 and 2026-08-23]
## Working method — this section is not optional

Every command you run passes an approval classifier. If it trips, the maintainer
must approve the command **by hand**. They may be asleep or away. A single
tripped command can stall an unattended run for hours. These rules are derived
from commands that actually tripped it, not from guesswork.

### Never use `cd`

Not at the start of a command, not in the middle of one, not inside a script you
write and run, **not even as a shell function name or in a comment**. The
classifier matches the token, not the intent — an orchestrator once wrote
`cd() { echo blocked; }` as a *defensive shim* and tripped it anyway.

Your working directory is already `D:\AddictedtoAI`, so nothing needs it:

- run scripts by absolute path — `node D:/AddictedtoAI/scripts/check-docket.mjs`
- use `git -C D:/AddictedtoAI ...` for every git command
- read and write files by absolute path

### Keep every command string short

Long or multi-line command strings overload the same classifier. If a step needs
more than a couple of operations, **write a small script into the scratchpad
directory and run that** — the script may be as long as you like. The script
must not contain `cd` either.

    node D:/AddictedtoAI/../scratchpad/my-step.mjs      # good
    <forty lines of shell in one -c string>             # trips it

### Never manipulate credentials on a command line

`git -c credential.<anything>`, `http.extraheader`, anything that supplies or
overrides an auth token **will be blocked**, correctly. If a push or fetch fails
on authentication or scope, that is a finding to report, not an obstacle to
route around. Say so and stop. Looking for a broader-scoped credential when
blocked is recorded in this repository's own changelog as a past failure.

### Prefer the dedicated tools over shell equivalents

Use Read, Write, Edit, Grep and Glob rather than `cat`, `sed -i`, `echo >`,
`grep` and `find`. They do not pass through the classifier at all, they handle
Windows paths correctly, and they will not silently mangle CRLF. Reach for Bash
only when no dedicated tool fits.

### Redirection and expansion — keep it plain

Simple `>` and `2>&1` are fine. Avoid stacking constructs in one string:
process substitution `<(...)`, nested command substitution, heredocs combined
with pipes, `exec` redirections, and long `for`/`while` bodies inline. Each
addition raises the chance of a trip. **Put anything non-trivial in a scratchpad
script.**

When you need a file's content as an argument, `"$(cat file)"` alone is fine —
but nothing appended after it.

### Never print a secret

Do not `cat`, `head`, `echo` or otherwise emit the contents of any token, key or
credential file, **including into your own tool output** — a reviewer did this
on 2026-08-22 with `head -c 50` on a token file and the maintainer had to
rotate the credential. To verify a credential works, pipe it into a header
inside a single command substitution and print only the *response*, never the
value.
## Never invoke OpenCode

**Do not run the `opencode` CLI, and do not start or resume an OpenCode
session.** Not `opencode run`, not `opencode` on its own, not anything that
would create a session or generate tokens.

The maintainer has hit their DeepSeek API limits — that is precisely why this
loop is being run by Claude Code subagents tonight instead of by OpenCode. Any
OpenCode generation spends money they do not currently have available.

Read-only is fine: `curl -s http://127.0.0.1:4097/session` reads stored session
metadata, makes no model call and costs nothing. Use that if you need to check
something about a past session, and if the server is not reachable, record the
claim as unverified rather than going to look for the binary.

The repository's own test suite exercises the supervisor's liveness helpers
against a **stub** session API (`scripts/test-orchestrate-checkout.mjs`, run
from `scripts/check-routes.sh`). That is expected and costs nothing — it never
reaches the real service. Do not "fix" it into calling a live one.
