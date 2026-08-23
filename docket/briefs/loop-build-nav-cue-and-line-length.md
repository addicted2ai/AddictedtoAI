Branch: loop/build/nav-cue-and-line-length
Track: build

# Round 175 — how the site reads

Branch: `loop/build/nav-cue-and-line-length`, created for you at `origin/main`
(`ddffff7`). Track: **build**. Do not create or switch branches. Work in
`D:/AddictedtoAI`.

## Why this round exists

Last round put content on the first screenful. This one is about what happens
after the visitor starts reading. Two filed items, both measured, both from the
same design survey:

    docket/open/2026-08-22-nav-active-colour-only-indicator.md   (priority 2)
    docket/open/2026-08-22-article-p-line-length.md              (priority 3)

**Read both in full first. They are the specification for this round** — their
Evidence and their "Done when" checkboxes. This brief does not restate them,
because a restatement is a second copy that can drift from the first.

The short version. `.nav-active` marks the current page **by colour alone, at
2.20:1**, failing two WCAG success criteria at once: 1.4.1 (Use of Color),
because no weight, underline, border or icon distinguishes the current page
from the eight others; and 1.4.11 (Non-text Contrast), because 2.20:1 is under
the 3:1 minimum for a UI-state indicator. Separately, `article p` runs
**100–103 characters per line, up to 122**.

## The trap in the second item — read this before you touch line length

The line-length item **deliberately prescribes no number**, and neither does
this brief, because the rubric that preceded it got this wrong twice in one
sentence:

- It claimed capping `article p` at `68ch` would take the site "from ~90
  characters to ~68". Rendered, `68ch` produces **81** characters, and the
  baseline it claimed to reduce was already **100**. Both numbers wrong. `1ch`
  is the width of the `0` glyph — about 18% wider than this font's mean
  character advance — so `Nch` renders as roughly `1.18 × N` characters.
- Its other rule capped prose at `90ch`, which is a **no-op**: `main` is
  already `max-width: 780px` = 84.9ch, so any cap at or above ~85ch never
  binds.

So: **choose a value, justify it against a rendered character count, and state
what it costs.** The survey measured that cost for four candidates — `68ch`
made `/blog/chatgpt-ads` 13% longer, `62ch` made it 24% longer. Narrower lines
are not free, and the corpus median across fifteen successful reference sites
is 91 characters with Wikipedia at 103, so this site's 100–103 is above the
guidance but inside the range of sites people actually use. An explicit "we
narrowed it to X and here is the page-length cost" and an explicit "we left it
and here is why" are both acceptable. An unstated choice is not.

One fact worth having before you start: `app/globals.css` **already** caps
several elements in `ch` — `62ch` at lines 507, 813 and 1002, `68ch` at 745 and
774 — alongside `main`'s `780px`. So this is not a greenfield decision, and
whatever you choose should be consistent with, or deliberately different from,
what is already there. Find out what those rules apply to before you add
another.

`scripts/lib/cdp-browser.mjs` landed last round and drives Chrome over CDP;
`scripts/check-first-screenful.mjs` is the worked example of using it.

## On the nav cue

This one has a right answer available — a non-colour cue at 3:1 or better —
but the item is explicit that picking the treatment is a design decision that
should fit the site's existing register, not a one-line contrast bump. Whatever
you choose, the check that guards it must fail when the cue is removed, and you
must prove that by removing it.

## A third, small thing

Round 174's review surfaced an ambiguity in `CHARTER.md` rule 5 that the loop
should not resolve on its own. Rule 5 says "The record is append-only." Rule
13a's Reserved list, around line 321, ties rule 5 specifically to *the
append-only changelog*. Round 174 declined to correct a wrong number in a
`docket/open/` item on rule 5 grounds, while simultaneously editing that same
file to close it.

**File a docket item** stating the ambiguity and asking for a maintainer
ruling on whether rule 5 reaches `docket/`. Do not amend `CHARTER.md`, do not
decide it, and do not correct the number in question. `docket/` is inside
`build`'s scope, so filing is in bounds; ruling is not.

## What you may not do

- **Do not touch `.github/`.** The loop's push credential holds `public_repo`
  only; GitHub refuses server-side any push touching `.github/workflows/`.
  Wire checks into `scripts/check-routes.sh`, which `build-and-audit` runs.
- Do not widen a track's scope map to fit your work.
- Do not edit past changelog entries.
- **Do not leave a server running on port 3000.** `scripts/round.mjs` refuses
  to run when that port is in use, and last round stalled twice on exactly
  that — waiting on a check that could never complete. Check the port before
  you run the round check, and stop anything you start.

## Done when

- [ ] Every checkbox in both docket items is satisfied or explicitly answered
- [ ] The nav cue satisfies SC 1.4.1 (a non-colour cue) and SC 1.4.11 (≥3:1),
      both measured on a real render
- [ ] The line-length decision is justified against a **rendered** character
      count and its page-length cost is stated
- [ ] Any check you ship is **proved able to fail** — construct the failure,
      paste the output, revert, confirm clean. Do this against the tree you
      actually ship, not an earlier one
- [ ] The rule 5 ambiguity is filed, not resolved
- [ ] Nothing under `.github/` is modified
- [ ] `node scripts/round.mjs check` green, observed by you

## Rules

- `Origin: delegated`. One CHANGELOG entry, one shared
  `Origin`/`Track`/`Agent`/`Guardrails`/`Result` block. A `**N. ...**`
  heading must open and close on one line, and **every item needs its `- Change:`
  bullet** — a missing one broke `app/lib/build-log.js` and failed the build
  last round.
- If you touch a route's files, check whether `PRODUCING_ROUNDS` in
  `app/lib/page-origins.js` still describes it. Last round left two entries
  stale and the check caught only one, because it compares track rather than
  round recency.
- Commit this brief to
  `docket/briefs/loop-build-nav-cue-and-line-length.md`, including its
  `## Premises` section, and confirm `node scripts/check-briefs.mjs` passes.
- Do **not** push, open a pull request, run `round.mjs ship`, or merge.
- Commit incrementally. Every number in the entry needs a command behind it.
- **If you find an error in this brief, say so explicitly** in your report
  and in the changelog entry. A premise citing a real source that does not
  actually support its claim is the shape to watch for — `check-briefs.mjs`
  cannot catch it and says so itself.

## Premises

This brief declares 7 premises below.

1. `docket/open/2026-08-22-nav-active-colour-only-indicator.md` is filed on the `build` track at priority 2 and records a measured 2.20:1 contrast for `.nav-active`. [command: head -20 docket/open/2026-08-22-nav-active-colour-only-indicator.md]
2. `docket/open/2026-08-22-article-p-line-length.md` is filed on the `build` track and deliberately prescribes no fix width, giving the rendered-versus-computed reason. [command: head -20 docket/open/2026-08-22-article-p-line-length.md]
3. `app/globals.css` sets `main { max-width: 780px }`, which is the ancestor constraint making any `article p` cap at or above roughly 85ch a no-op. [command: grep -n "max-width" app/globals.css]
4. `scripts/lib/cdp-browser.mjs` exists on `main` as a reusable CDP driver, and `scripts/check-first-screenful.mjs` imports it. [command: grep -n "cdp-browser" scripts/check-first-screenful.mjs]
5. `CHARTER.md` rule 5 states the record is append-only, and rule 13a's Reserved list ties that rule specifically to the append-only changelog — the ambiguity this round is to file, not resolve. [command: grep -n "The record is append-only" CHARTER.md]
6. A branch touching `.github/workflows/` cannot be pushed by the loop's credential. [frame:4]
7. `scripts/round.mjs` refuses to run its check when port 3000 is already in use, which stalled round 174 twice. [command: grep -n "already in use" scripts/round.mjs]
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
