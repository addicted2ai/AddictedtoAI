Branch: loop/meta/briefs-and-premises
Track: meta

# Round 9 — put the briefs in the record, and make their premises citable

Track: **meta**. Branch: `loop/meta/briefs-and-premises`, created for you at
`origin/main` (7b25c44). Do not create or switch branches. Work in
`D:/AddictedtoAI`.

## Why this round exists

Round 8 built `FRAME.md` so premises have somewhere to be checked **against**.
This round makes the checking happen, and fixes a gap in the record that is
larger than it looks.

On 22 August 2026 three false premises entered this project **through briefs** —
the documents the orchestrator writes to instruct each round. Each was built on
expensively before the maintainer caught it in conversation. Adversarial review
could not catch any of them, because **review validates the work against the
brief**, and the brief carried the error.

The maintainer then pointed out something sharper. They do not read briefs. All
three errors reached them by accident, because the premise happened to surface
in a status message. So the honest description of the current state is: **nobody
validates the brief.** There is no reviewer, no check, and no reader.

And the briefs live in a **temporary scratchpad directory that is deleted**.
This site publishes its charter, its changelog, its docket and every review
artifact — while the documents that actually decide what each round does, and
carry the premises it will build on, are invisible and unversioned. That is a
hole in the traceability story exactly where the failures live.

## 1. Briefs become part of the record

Establish `docket/briefs/` and a convention for what a brief file is called and
what it must contain. Design it yourself; the constraints are:

- A brief must be identifiable to the round it produced, so a reader can put the
  instruction next to the changelog entry and the review artifacts.
- It must be committable **by the round it briefs**, without a chicken-and-egg
  problem about a round number that does not exist yet. Check how `round.mjs`
  and `CHANGELOG.md` allocate round numbers before designing this.

The existing briefs for tonight's rounds are in the orchestrator's scratchpad at
`C:\Users\BadBitch\AppData\Local\Temp\claude\D--AddictedtoAI\b0a0272b-5058-41e7-ac66-431922257ff6\scratchpad\`
as `brief-round6.md` through `brief-round9.md`, plus `brief-review-r6.md`
onward, `reviewer-brief.md`, `brief-design-research.md`,
`brief-scorer-methodology.md` and `brief-site-survey.md`.

**Read them before deciding what to commit.** They were written to be read once
by one agent, not published. Some contain absolute paths, scratchpad
references, and blunt assessments of earlier rounds' failures. Judge what
belongs in a public record: I would rather have them committed as written, with
their bluntness intact, than sanitised into uselessness — but that is your call
to make and defend. If you conclude some should not be committed, say which and
why.

## 2. Premises become citable, and their absence checkable

**The property: every factual claim in a brief carries its source.** One of:

- a `FRAME.md` fact number
- a command whose output supports it
- an explicit marker that the maintainer asserted it and no check exists

A claim with none of these is an assertion the orchestrator invented, which is
what all three of tonight's errors were.

Then make the absence detectable. `scripts/check-briefs.mjs`, wired into
`scripts/check-routes.sh` — **not** into `.github/`, see Scope below.

Two design problems worth thinking about rather than papering over:

- A brief is written **before** its round runs, so CI cannot gate it in advance;
  the check necessarily runs after the fact, on the committed brief. Decide what
  that check can honestly claim, and say so plainly rather than implying
  prevention it does not provide.
- Detecting "a factual claim" in prose is not mechanically decidable. Round 8
  learned the hard way that recognising arbitrary shapes does not converge —
  three fixes, three escaped classes — and stopped only when it switched to a
  **declared** invariant. Consider that precedent seriously. A check that
  requires the brief to declare its own premises, and verifies each declaration
  resolves, is bounded. A check that tries to find unmarked claims in freeform
  English is not.

## 3. File, do not build

Publishing briefs on the site is `app/` work, outside `meta`'s track scope.
File it: a brief should be reachable from its round's log entry, alongside the
changelog entry and the review artifacts, so a reader can see the instruction,
the work, and the review together. Do not attempt it here.

## Scope

`docket/` and `scripts/` are already in `meta`'s scope, so this round should not
need to widen anything. **Do not touch `.github/` at all** — the loop's push
credential holds `public_repo` only and GitHub refuses any push touching
`.github/workflows/`, which would strand this round waiting on the maintainer.
`check-routes.sh` is the wiring point; `build-and-audit` already runs it.

If you find you cannot do this without a workflow change, **stop and say so**
rather than working around it.

## Verify against CI, not just locally

Round 8 shipped checks that passed locally and failed in CI, because they
assumed a long-lived clone with refs a fresh PR checkout does not have. Five
review passes and a green local run missed it. If your check reads git history
or refs, construct a CI-shaped clone — fresh clone, no local `main`, detached
HEAD — and verify there too.

## Done when

- [ ] `docket/briefs/` exists with a stated convention, and tonight's briefs are
      committed or explicitly excluded with reasons
- [ ] Briefs declare their premises, each resolving to a frame fact, a command,
      or a maintainer attestation
- [ ] `scripts/check-briefs.mjs` exists, is wired into `check-routes.sh`, and was
      **proved able to fail** — construct a violation, paste the red output,
      revert, confirm clean
- [ ] The check's honest limits are stated where a reader will see them
- [ ] Site rendering is filed, not built
- [ ] Nothing under `.github/` is modified
- [ ] Verified in a CI-shaped clone as well as locally
- [ ] `node scripts/round.mjs check` green against a freshly restarted server

## Rules

- `Origin: delegated`. One CHANGELOG entry, one shared
  `Origin`/`Track`/`Agent`/`Guardrails`/`Result` block. A `**N. ...**` heading
  must open and close on one line.
- Do **not** push, open a pull request, run `round.mjs ship`, or merge.
- Commit incrementally.
- Every number in the entry needs a command behind it.
- If you find an error in this brief, **say so explicitly** in your report and in
  the entry rather than quietly correcting it. This brief is itself the first
  artifact of the convention it establishes; if its own premises are unsourced,
  that is a finding worth stating.
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

## Premises

This brief declares 5 premises below.

1. Round 8 (`loop/meta/frame`) shipped `FRAME.md` and `scripts/check-frame.mjs` to `origin/main` as PR #136 (squash commit `7b25c44`), giving this round something to cite premises against. [command: git log --oneline origin/main -3]
2. `docket/HOLD.md` is the loop's own self-halt mechanism, not a channel the maintainer uses to intervene — the premise the first of the three 22-August errors got backwards. [frame:2]
3. The loop's push credential cannot land any change under `.github/workflows/`, which is why this round's check is wired into `scripts/check-routes.sh` instead of a new `.github/` job. [frame:4]
4. Three false premises entered this project through briefs on 22 August 2026 and reached the maintainer only by accident, in conversation — not through review, and not through any check. [attested: maintainer, in conversation on 2026-08-22; consistent with FRAME.md's own preamble account of the same date]
5. `scripts/check-frame.mjs`'s completeness guarantee went through three narrower fixes before a fourth replaced shape-recognition with a declared, checkable total — the precedent this round's own `scripts/check-briefs.mjs` follows rather than re-derives. [command: grep -c "COMPLETENESS DOES NOT COME FROM RECOGNISING HEADING SHAPES" scripts/check-frame.mjs]
