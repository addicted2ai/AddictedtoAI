<!-- Committed as historical record under docket/briefs/ (convention
     established by round 9, loop/meta/briefs-and-premises, 2026-08-23). This
     brief predates the convention and carries no ## Premises section by
     design -- see docket/briefs/README.md for why one was not retrofitted.
     It briefed the round that shipped as PR #135
     (loop/build/true-and-reflowable, squash commit
     f465b0c2b34398b9ec5250561d9284d7b0118b38). Body below is verbatim,
     unedited except for this comment. -->

# Round 7 — make the site true again, and usable at 320px

Track: **build**. Branch: `loop/build/true-and-reflowable`, to be created at
`origin/main` **after round 169 has merged** — see Sequencing below. Work in
`D:/AddictedtoAI`.

**Scope discipline.** Three things, all small, all measurable: one paragraph of
text, two CSS defects, one check. Round 167 cost ~800k tokens because its
problem had an unbounded input space. This one does not. If you find something
adjacent that wants fixing, file it rather than doing it.

## Sequencing — read this first

This round depends on round 169 (`loop/meta/charter-reconciliation`) being
merged to `main` before your branch is created. Confirm it:

    git -C D:/AddictedtoAI log --oneline origin/main -3

You should see round 169's squash commit. If you do not, **stop and report**
rather than proceeding. The reason is not procedural: item 1 below rewrites a
sentence so it describes the charter *as amended by round 169*. Land it first
and the page states the opposite falsehood from the one it states today.

## 1. The false claim on `/charter` (priority 1)

Executes `docket/open/2026-08-22-charter-page-claims-only-maintainer-can-amend.md`.

`app/charter/page.js:203` currently reads, in the page's own lead paragraph:

    The document is human-owned, so only the maintainer can amend it; this
    page renders it as written and marks each falsified claim with the
    correction beside it.

Round 169 made "human-owned, so only the maintainer can amend it" false. Rule 4
forbids publishing a claim about this project's own process that is not
currently true.

Replace it with what is now true. Read rule 13, rule 13a and the reconciled
Amendment section in `CHARTER.md` on `main` and describe *that*, in the page's
existing register — short, plain, no marketing. The interesting part is not
"the loop may edit the charter"; it is that the boundary moved from **which
files** to **what must survive any edit**, and that one clause reserves its own
amendment. A reader who only ever sees this paragraph should come away with the
right model.

Do not overcorrect into a claim of total autonomy: the reserved surface in 13a
is real, and two mechanical checks now enforce parts of it.

## 2. Two routes overflow their viewport at 320px

Measured in a real browser, not inferred: `/model-retirement-calendar`
overflows by **223px** and `/charter` by **221px** at a 320px viewport. Both
fail WCAG SC 1.4.10 (Reflow). Full measurements and method:
`scratchpad/site-survey.md` §7 and §9.

Two different causes, and the second is not the one anyone would have guessed:

- `/model-retirement-calendar` — the 5-column table has no scroll container.
- `/charter` — a **489px unbreakable `<code>` string** inside a `<p>`:
  `` `{"admin":true,"maintain":true,"pull":true,"push":true,"triage":true}` ``
  at `CHARTER.md:442`, with `overflow-wrap: normal`. The table on that page is
  not the problem.

**The property to hold: no route may overflow its viewport at 320px.** How you
get there is your call. Consider what a horizontal scroll container does to
keyboard and screen-reader users before reaching for one — a scrollable region
generally needs to be focusable and labelled, and "it stopped overflowing" is
not the same as "it became usable". If you conclude the honest fix for the
table is a layout change rather than a container, do that instead and say why.

Do not edit `CHARTER.md` to shorten the string. It is a quotation of real API
output, `CHARTER.md` is outside `build`'s track scope, and editing a document
to fit a stylesheet is the wrong direction.

## 3. The check that would have certified the bug

The design rubric proposed a reflow check asserting:

    document.documentElement.scrollWidth <= window.innerWidth + 1

Under mobile emulation `window.innerWidth` **expands to match overflowing
content**. Measured on `/model-retirement-calendar` at a 320px viewport:

    clientWidth 320   scrollWidth 543   innerWidth 543

So `543 <= 544` passes while the page overflows by 223px. The check would have
gone green forever while certifying the defect it was written to catch.

The survey's conclusion is that the denominator must be
`documentElement.clientWidth`. **Verify that yourself rather than taking it from
this brief** — a mechanism prescribed in a brief is what produced round 167's
worst defect. Confirm the corrected form actually fails on today's tree before
you fix anything, then passes after.

Add it as a real check, wired the way the existing route checks are. A fix with
no check regresses the moment someone adds a wide table.

`scratchpad/survey/` contains the harness the survey used — `cdp.mjs`,
`reflow.mjs`, `measure.mjs` — driving the `chrome-headless-shell` already
present in the Puppeteer cache. Reuse it rather than rebuilding it. Nothing may
be installed.

## 4. File, do not fix

The survey found more than this round should spend. File these as docket items
and stop:

- `.nav-active` is a **colour-only** active-state indicator at **2.20:1**
  (verified including `::before`/`::after`) — fails both SC 1.4.1 and 1.4.11.
- `article p` measures **100–103 characters per line, up to 122**. Note in the
  item that the rubric's proposed `68ch` fix was measured and yields **81**
  characters, and that its `90ch` cap would be a **no-op** because `main`'s
  780px already caps the column at 84.9ch — so the item must not prescribe
  either number.
- **First-screenful density.** Corpus median is 11 content units (`tr`+`li`)
  above the fold across 15 sites; this site shows **0** on five of seven pages.
  On `/model-retirement-calendar` the first data row starts at **958px** —
  158px below the fold, 0 of 87 rows visible — behind **672px of prose** between
  the `h1` and the table. endoflife.date reaches its first row at 570px after a
  26px intro. File this as `serves: worth-a-visit`.

Check the filing gate's budget before filing (`node scripts/check-docket.mjs`)
and file fewest-first by value if `build` would exceed it. If an item will not
fit, say which one you dropped and why — do not relabel it into another track.

## 5. Do not commit the research

`scratchpad/design-rubric-draft.md`, `scratchpad/scoring-methodologies.md` and
`scratchpad/site-survey.md` stay in the scratchpad. They are working notes, not
site content, and the rubric in particular was **wrong in four places that only
rendering caught**. Cite them in the changelog entry by name and finding; do not
add them to the repository.

## Done when

- [ ] `/charter`'s lead paragraph describes the charter as it now stands, and
      the priority-1 docket item is moved to `docket/done/`
- [ ] Neither route overflows at 320px — proved by measurement, before and
      after, with the numbers pasted
- [ ] The corrected reflow check exists, was proved to fail on today's tree
      before the fix, and passes after
- [ ] Whatever accessibility cost the overflow fix carries is stated, not
      assumed away
- [ ] Three items filed, or fewer with the omission named
- [ ] `node scripts/round.mjs check` green against a freshly restarted server

## Rules

- `Origin: delegated`. One CHANGELOG entry, one shared
  `Origin`/`Track`/`Agent`/`Guardrails`/`Result` block. A `**N. ...**` heading
  must open and close on one line.
- Do **not** push, open a pull request, run `round.mjs ship`, or merge.
- Commit incrementally — item 1, item 2, item 3, the filings — so a crash costs
  minutes, not the round.
- Every number in the entry needs a command behind it.
- If you find an error in this brief, **say so explicitly** in your report and
  in the entry rather than quietly correcting it. Five of the orchestrator's six
  errors on 22 August reached the record because nobody said them out loud.
- Read the entry's opening paragraph last, against what the diff actually does.
## Working method — this one is not optional

**Never use `cd`.** Not at the start of a command, not in the middle of one, not
inside a script you write and run. This environment's approval classifier stops
on `cd` and forces the maintainer to approve the command by hand. They are
asleep. A single `cd` wakes them up.

Your working directory is already `D:\AddictedtoAI`, so nothing in this repo
needs it:

- run scripts by absolute path — `node D:/AddictedtoAI/scripts/check-docket.mjs`
- use `git -C D:/AddictedtoAI ...` for every git command
- read and write files by absolute path

**Keep each command string short.** Long or multi-line command strings overload
the same classifier and cause the same problem. If a step needs many commands,
write a small script into the scratchpad directory and run that — and the script
must not contain `cd` either.

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

