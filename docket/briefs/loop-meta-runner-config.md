Branch: loop/meta/runner-config
Track: meta

# Round 10 — make the loop model, provider, and harness agnostic

Branch: `loop/meta/runner-config`, created for you at `origin/main` (4b5f5ae).
Track: **meta**. Do not create or switch branches. Work in `D:/AddictedtoAI`.

## Why this round exists

The maintainer put it directly: *"the loop kind of needs to be model, provider,
and harness agnostic, with the exception of how the harness is monitored and
managed (like the OpenCode server and session attachment) and whether or not the
supervisor needs to be running."*

Today none of that is expressible. `scripts/orchestrate.sh` hardcodes
`MODEL="opencode-go/deepseek-v4-flash"` at line 18 and `opencode run` at line
355, so harness, provider and model are welded into one string in one launcher,
with a second copy of the same value in `policy.yml`. Nothing keeps them in
sync, and switching harness means editing the launcher.

The record shows this project has **already** run on three harnesses —
`CHANGELOG.md`'s `Agent:` field carries `opencode`, `codex`, and `claude-code`
values. The capability exists; what is missing is a way to *say which*, and a
consistent way to record which one did the work.

## What to build

**1. A `runners:` block, as data.** Harness, provider, model and variant as
independent fields, not a fused string. The maintainer's sentence should
resolve: *"start the loop using model X through provider Y inside harness Z."*

**2. Per-harness adapters — the only harness-specific part.** Everything the
loop does (briefs, docket, changelog, review artifacts, git) is already
harness-agnostic text. What differs is narrow and enumerable: how you launch it,
how you tell it is alive, how you know it finished, whether a server must be
running. Design that boundary; `orchestrate.sh` should stop hardcoding
`opencode run`.

**3. Supervisor is a property of the launcher, not the harness.** A scheduled
run needs a supervisor process for cadence and restart, whatever the harness. An
orchestrator-launched run does not, because the orchestrator is the supervisor.
The harness then only decides *how* liveness is observed.

**4. A preflight capability check.** Before a round starts, verify the chosen
runner can actually run: the provider is authenticated, the model is in that
provider's catalogue, the model is not excluded, the harness is present. Report
which of those failed by name.

**Two properties that matter more than the mechanism:**

- **Never silently substitute.** If the maintainer asks for a runner and it is
  unavailable, the loop stops and says so. It does not quietly fall back to
  another model. The `Agent:` field is published provenance; a record saying one
  model did work another model did is the exact class of false claim this
  project spent 22 August removing.
- **Remaining credit is not knowable locally.** There is no balance or usage
  endpoint on the local OpenCode server — the paths that look like one return
  the SPA shell. So the preflight can check *configuration*, and a quota
  rejection at first call must be classified as "the chosen runner is
  unavailable", not "the round failed". Those are different facts.

## What you may not do

- **Do not touch `.github/`.** The loop's push credential holds `public_repo`
  only and GitHub refuses any push touching `.github/workflows/`. Wire any check
  into `scripts/check-routes.sh`, which `build-and-audit` already runs.
- **Do not authenticate anything, add a provider, or spend money.** If a runner
  entry would require credentials this machine does not have, write the entry
  and mark it unavailable, or leave it out and say why.
- **Do not run `opencode`.** Read-only `curl` to `127.0.0.1:4097` is fine.

## Verify against CI, not just locally

Round 171 shipped checks that passed locally and failed in CI because they
assumed a long-lived clone. Six review passes missed it. If your check reads
refs or history, construct a CI shape — fresh clone, no local `main`, detached
HEAD — and verify there too.

## Done when

- [ ] Harness, provider, model and variant are independent data in one place
- [ ] `orchestrate.sh` reads them instead of hardcoding, and the duplicate value
      in `policy.yml` is reconciled to a single source
- [ ] Per-harness adapters exist for launch and liveness; supervisor need is
      determined by launcher
- [ ] A preflight check names which precondition failed, and was **proved able
      to fail** — construct each failure, paste the output, revert, confirm clean
- [ ] Silent substitution is impossible, and that is stated where a reader sees it
- [ ] Nothing under `.github/` is modified
- [ ] `node scripts/round.mjs check` green against a freshly restarted server

## Rules

- `Origin: delegated`. One CHANGELOG entry, one shared
  `Origin`/`Track`/`Agent`/`Guardrails`/`Result` block. A `**N. ...**` heading
  must open and close on one line.
- Commit this brief to `docket/briefs/loop-meta-runner-config.md` as part of your
  work, per the convention established last round. Its `## Premises` section
  below is part of it.
- Do **not** push, open a pull request, run `round.mjs ship`, or merge.
- Commit incrementally. Every number in the entry needs a command behind it.
- If you find an error in this brief, **say so explicitly** in your report and in
  the entry. One of last round's two findings was a premise in the
  orchestrator's own brief that cited a real source not supporting its claim.

## Premises

This brief declares 9 premises below.

1. `scripts/orchestrate.sh` hardcodes the model as `opencode-go/deepseek-v4-flash` at line 18 and invokes `opencode run` at line 355, fusing harness, provider and model. [command: grep -n "MODEL=\|opencode run" scripts/orchestrate.sh]
2. `policy.yml` carries a second copy of that same model string, with nothing keeping the two in sync. [command: grep -n "model:" policy.yml]
3. This project has already run rounds on three different harnesses — OpenCode, Codex and Claude Code. [command: grep -h "^- Agent:" CHANGELOG.md | sort | uniq -c]
4. The maintainer wants the loop agnostic to model, provider and harness, excepting how a harness is monitored and whether a supervisor must run. [attested: maintainer, in conversation on 2026-08-22]
5. OpenCode Zen's provider id is `opencode`, and it is not authenticated on this machine, so only its free-tier models are reachable. [command: node -e "const j=require(process.env.HOME+'/.local/share/opencode/auth.json');console.log(Object.keys(j))"]
6. `opencode-go` is a subscription with usage limits that falls back to Zen credits when the maintainer's "Use balance" setting is enabled, which it is. [attested: maintainer, in conversation on 2026-08-22]
7. OpenCode's `-free` model variants are excluded absolutely, by standing instruction. [frame:18]
8. Every OpenCode session must be launched with `--variant max`; omitting it silently runs at default reasoning effort. [attested: maintainer, standing instruction since 2026-08-13]
9. The supervisor has not run since 2026-08-18 and must not be restarted as part of this round. [frame:17]
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
