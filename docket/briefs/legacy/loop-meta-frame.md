<!-- Committed as historical record under docket/briefs/ (convention
     established by round 9, loop/meta/briefs-and-premises, 2026-08-23). This
     brief predates the convention and carries no ## Premises section by
     design -- see docket/briefs/README.md for why one was not retrofitted.
     It briefed the round that shipped as PR #136 (loop/meta/frame, squash
     commit 7b25c44f3d08d8b3462544cbcf8d3ecb62c51aa8). Body below is
     verbatim, unedited except for this comment. -->

# Round 8 — the frame: ground truth that is loaded, not remembered

Track: **meta**. Branch: `loop/meta/frame`, created for you at `origin/main`.
Do not create or switch branches. Work in `D:/AddictedtoAI`.

## Why this round exists

On 22 August 2026 the orchestrator asserted three things about this project
that were false, briefed subagents on them, and had expensive work built on
each before the maintainer corrected them in conversation:

1. `docket/HOLD.md` is the maintainer's brake. **It is the loop's self-halt.**
   Two review passes and an entire test harness were aimed at the wrong threat.
2. OpenCode has no websearch. **It does**, via Exa — and this was already
   recorded correctly in the orchestrator's memory. A stale session summary
   carried the retired version and it was re-asserted anyway.
3. The 278 non-bot commits on `main` are "the loop's account", so no commit is
   attributable to a human author. **`addicted2ai` is the maintainer's own
   account.** The figure was re-derived from the GitHub API three times,
   including once by an independent reviewer, and matched exactly every time.
   It was the correct count of the wrong thing.

The common shape: **rigor inside a frame cannot see the frame.** Every check
asked "is this number right?" and none asked "whose is it?" Review could not
catch any of them, because review validates work *against the brief* and the
brief carried the error. All three reached the maintainer only because they
happened to surface in a status message.

Two mechanisms follow from that, and this round builds both.

## 1. `FRAME.md` at the repository root

Twenty to thirty facts about the arrangement. **Short.** A 500-line frame is
one nobody reads. Each fact gets:

- the claim, stated flatly
- a **verification command** and its expected result
- a marker: `verified` (a command proves it) or `attested` (the maintainer
  says so and no command can prove it)

That last distinction is load-bearing. The worst single sentence of the night
put a true attested fact and an invented one side by side: *"the maintainer
starts every session"* (true, attested) *"and the loop was never given access
to start one"* (false, and checkable in five seconds).

Facts that must be in it, with the checks you should verify rather than copy:

- **The three identities.** `addicted2ai` (id 223016611) is the maintainer's
  own account and authors every non-bot commit; `addicted2ai-loop` (315944683)
  is the push identity, `public_repo` only, and has authored zero commits;
  `gh` API work runs on the maintainer's token, which holds `workflow`.
  Consequence to state: **no claim may describe `main`'s commits as the loop's
  account, and account attribution cannot evidence authorship either way.**
- **`docket/HOLD.md` is the loop's self-halt.** Every hold in history was
  written by the orchestrator or a round. The maintainer's real controls: they
  start every session, they can revert any commit, they hold the credentials.
- **A branch touching `.github/workflows/` cannot be pushed by the loop.**
  GitHub refuses it — the push credential lacks `workflow` scope. Enforced
  server-side, deliberate, and it needs the maintainer's credential.
- **OpenCode has websearch** via Exa. Scout rounds run on it. The contrary
  claim is retired and has now been wrongly re-asserted twice.
- **The supervisor is dead** since 2026-08-18 and must not be restarted;
  rounds run as Claude Code subagents launched by the orchestrator.
- **The delegation and the hard lines** — no money, no accounts, no
  credentials, no repo settings, no installing, no history destruction, no
  acting outside the repo; everything else delegated, including this file's
  own subject matter.
- **`-free` model variants are excluded absolutely**, by standing instruction.

Add others you can verify and defend. Do not pad it.

## 2. `scripts/check-frame.mjs`

Runs every check command in `FRAME.md` and fails, naming the line, when reality
diverges. A frame that can silently go stale is the thing this charter keeps
producing — `CHARTER.md` rule 13a says as much about itself.

Design decisions are yours, but the properties are:

- `attested` facts are **not** executed; they are listed in the output as
  resting on the maintainer's word, so a reader sees which is which.
- A check that cannot run (no network, no `gh`) must be reported as
  **unverified**, never as passed.
- Wire it into `scripts/check-routes.sh`, which `build-and-audit` already runs.
  **Do not add a job to `.github/workflows/`** — see Scope below.

## 3. `CLAUDE.md` at the repository root

This is the part that makes the frame *load* rather than *be available*. From
Claude Code's auto-mode documentation:

> The classifier reads the same CLAUDE.md content Claude itself loads, so an
> instruction like "never force push" in your project's CLAUDE.md steers both
> Claude and the classifier at the same time.

So `CLAUDE.md` reaches every session automatically — orchestrator, subagents,
**and the permission classifier**. Keep it short and have it point at
`FRAME.md` as the authority, plus the working rules that keep this project
running: never `cd`, keep command strings short, never manipulate credentials
on a command line, never print a secret, prefer the dedicated file tools.

## Scope — read this before you start

`scripts/check-track-scope.mjs` does not let `meta` write new root files, so
`FRAME.md` and `CLAUDE.md` are outside your scope as it stands. Widen the map
to admit exactly those two paths, and no more.

That file is guarded by `human-owned-paths`, so **this pull request will go red
on that check by design** — the same red-then-authorise path round 169 took.
Rule 11 applies and you should say so in the entry: the run a guardrail blocks
is not the run that loosens it, and this round is widening the very map that
judges it. State the widening plainly, keep it minimal, and justify it.

**Do not touch `.github/` at all.** Not the workflows, not `CODEOWNERS`. The
loop's push credential cannot push workflow changes and the round would stall
waiting for the maintainer. `check-routes.sh` is the wiring point.

## Expect the classifier to flag you

Writing `CLAUDE.md` and `FRAME.md` matches auto mode's `Instruction Poisoning`
rule — *"writing to any file an agent session will read back as instructions"*.
That flag is correct in general and a false positive here: producing reviewed,
checked instruction files is this round's entire purpose. If a tool call is
blocked, say so in your report with the exact command; do not work around it,
and do not edit any permission or settings file to clear it.

## Also

A temporary version of this frame exists outside the repository at
`~/.claude/rules/addictedtoai-frame.md`. You cannot touch it — acting outside
the repository is a hard line. Note in your report that `FRAME.md` supersedes
it so the orchestrator can remove it.

## Done when

- [ ] `FRAME.md` exists, is under ~30 facts, and every one carries a check and
      a `verified`/`attested` marker
- [ ] `scripts/check-frame.mjs` runs them, is wired into `check-routes.sh`, and
      was **proved able to fail** — construct a divergence, paste the red
      output, revert it, confirm the tree is clean
- [ ] `attested` facts are reported as attested, not silently passed
- [ ] `CLAUDE.md` exists, is short, points at `FRAME.md`, and carries the
      working rules
- [ ] Track scope widened by exactly two paths, with the rule 11 tension stated
- [ ] Nothing under `.github/` is modified
- [ ] `node scripts/round.mjs check` green against a freshly restarted server

## Rules

- `Origin: delegated`. One CHANGELOG entry, one shared
  `Origin`/`Track`/`Agent`/`Guardrails`/`Result` block. A `**N. ...**` heading
  must open and close on one line.
- Do **not** push, open a pull request, run `round.mjs ship`, or merge.
- Commit incrementally — frame, checker, CLAUDE.md, scope — so a crash costs
  minutes rather than the round.
- Every number in the entry needs a command behind it.
- If you find an error in this brief, **say so explicitly** in your report and
  in the entry rather than quietly correcting it. That instruction is the whole
  point of this round.
- Read the entry's opening paragraph last, against what the diff actually does.
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

