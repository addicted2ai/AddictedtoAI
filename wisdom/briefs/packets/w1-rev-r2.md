# WISDOM PHASE 0, ROUND 2 — bind the checks the suite does not bind

authority: two-desks-work-orders-and-trains@a5e873b

Your round-1 work was reviewed by a second model with edit rights on a disposable
copy, so it could **apply** mutations rather than describe them. The verdict is
`revise`, and the reason is the best possible one: the linter is correct and the
**test does not bind it**.

## The CLASS, and it is one class

**A NEGATIVE CONTROL THAT PASSES FOR A REASON OTHER THAN THE PROPERTY IT NAMES.**

Every finding below is the same shape. A check has a passing vehicle and a
failing twin, both go the right colour, and the twin differs from the vehicle in
a way that exercises *part* of the check. Break the untested part and **the suite
stays 28/28 green.**

Do a sweep of all the twins in `scripts/brief-lint.test.mjs` for this class, not
only the eight named below — the eight are what one reviewer found in one
session, and the enumeration is yours to complete. For each check ask: *which sub-
expression of this check does my twin actually exercise, and which does it leave
untouched?*

## What is NOT wrong, and must not be "fixed"

**`scripts/brief-lint.mjs` IS CORRECT AND YOU MAY NOT EDIT IT.** Every behaviour
the reviewer probed was verified to work on the unmutated linter. The gap is
entirely in the test. If you find yourself changing the linter to make a test
pass, stop — that is the fix-the-detector move, and here it would also destroy a
check that currently works.

Round 1's move and its two parameterisations were re-diffed independently and are
sound: three hunks, every other line byte-identical, every comment and stated
limit intact. The wild fixture was verified banked-and-not-reconstructed. None of
that is reopened.

## The acceptance test, and it is unusually concrete

The reviewer handed over **six mutations that the suite currently does not
catch**. They are your acceptance criteria. **The job is done when every one of
them turns the suite RED**, and when the unmutated suite is still green.

For each, apply it, run `node --test` on your own file, record the counts, then
restore and confirm green again. **Keep the untouched original under the OS temp
directory and restore from it** — a mutation result from an un-restored file is
two mutations reported as one.

| | mutation to `scripts/brief-lint.mjs` (apply, then RESTORE) | currently |
|---|---|---|
| M3 | `:223` — remove `rewrite\|` from `EDIT_VERB` | 28/28 green |
| M4 | `:259` — remove the `i` flag from the first `/i.test` | 28/28 green |
| M5 | `:259` — delete ` && !/never\|token/i.test(l)` | 28/28 green |
| M6 | `:124` — `changed >= 5` becomes `changed >= 3` | 28/28 green |
| M7 | `:264` — reduce `hasClass` to only `/\bclass\b/i` | 28/28 green |
| M8 | `:297` — `pf(numbered && !bareResult)` becomes `pf(numbered)` | 28/28 green |

Two mutations the suite **already** catches — check 5 (the iteration/attempt
scan) emptied to a constant at `:250`, and the exit status no longer carried at
`:60` — must **still** be caught afterwards. Adding coverage must not remove any.

## The eight findings, each naming the fixture to add

The reviewer named the missing twin in every case. You are not being asked to
diagnose, only to build them and prove them red.

1. **F1 — scope verbs are one verb deep.** `brief-lint.mjs:223` lists many edit
   verbs; the test exercises only `Edit`. Add twins for **at least two more
   verbs** (for example `Rewrite`, `Modify`).
2. **F2 — check 6 has no upper-case twin.** The check carries an `i` flag; the
   twin uses only the lower-case form. Add an **upper-case** twin. Assemble the
   guarded literal at runtime from character codes exactly as the existing twin
   does — **neither the test file nor your report may spell it**.
3. **F3 — check 6's exemption has no passing twin.** The check exempts lines
   matching `never|token`; no green vehicle carries the token inside a
   prohibition line, so deleting the exemption changes nothing. Add **two green
   vehicles** — one using `never`, one using the word `token`.
4. **F4 — the packet diff threshold has no boundary twin.** `:124` is
   `changed >= 5`; the test uses 6 green and 2 red. Add **5 green and 4 red**.
5. **F5 — the packet header threshold has the same gap.** `:127` is
   `proseLines.length >= 20`; the test uses 22 green and 5 red. Add boundary
   twins **on the header's own prose-line count** — not on the diff's
   changed-line count, which is F4's separate argument.
6. **F6 — the revision check's second arm has no twin.** `:264` allows `class`
   **or** `every ... in this file`; both vehicles use `CLASS`. Add a **green twin
   of the `every ... in this file` form carrying no `class` word**.
7. **F7 — the result-name conjunction has no twin.** `:297` requires
   `numbered && !bareResult`; the test has numbered-only green and bare-only red.
   Add a **red twin naming both forms**.
8. **F8 — round 1's "shared logic" argument was convenient, not sound, and this
   is the one to read carefully.** Round 1 excused two branches on the grounds
   that their logic was already proven red elsewhere. It is not the same logic:
   the packet-header bare refusal has header-only input and no `numbered`
   requirement, and the zero-claims-under-`--review` branch is
   `instLines.length === 0`, a different branch from the proven
   `instBad > 0`. **Add both reds.** Note that the reviewer confirmed both
   branches genuinely work — so these twins are provable, and the round-1
   argument was wrong about coverage rather than about behaviour.

## Two things the reviewer could not settle, and what to do with them

Do **not** silently resolve these. Answer them in your report.

- **The authority check's 7-character prefix equality** (`brief-lint.mjs:138`).
  The reviewer could not tell whether prefix-matching is intended or accidental,
  because the twin uses an all-zero sha that fails under either reading, and a
  same-prefix-different-sha pair cannot be built from this tree without inventing
  history. **Say which behaviour the code implements, and say whether the twin
  distinguishes it. If it does not, say so — do not add a fixture that invents a
  collision.**
- **The pointer check's 20-character phrase filter** (`:339-342`). Both pointer
  reds use one italic phrase; backtick-only and multi-phrase shapes are
  unexercised. If you can build a twin for those shapes, do. If a shape cannot be
  made to refuse, **say which and why** — that is a finding about the check and
  is worth more than a contrived fixture.

## Files

Work only in these. A diff touching any other path is a scope finding.

- `scripts/brief-lint.test.mjs` — the only file you may change; every new twin lands here
- `RESULT2.md` — (new) your report for this round, in the working directory

**Do not edit** `scripts/brief-lint.mjs`, `brief-lint.source.mjs`,
`package.json`, `runners.yml`, anything under `data/`, `CLAUDE.md`, `AGENTS.md`,
or any file under `openspec/`.

Build fixtures as files under the OS temp directory, a fresh directory per test,
cleaned up after. **Do not write a fixture into the repository.** There is no
`node_modules` here and that is correct — built-ins only, no `npm install`, no
`npm test`.

## Ground rules (non-negotiable, and they do not carry over from anywhere)

- **Never use the token `cd` anywhere** — not in a command, not in a comment, not
  as a shell function name. A guard matches the token, not the intent. Absolute
  paths, and `git -C <dir>` for git.
- Keep command strings short; write a `.mjs` and run it rather than `node -e`.
- **Never manipulate or print a credential**, including a partial token.
- **A blocked or refused command is REPORTED, not routed around.**
- **Do not truncate the output of anything you use as evidence.** No `| head`, no
  `| tail`, no `-First N` on a counting or enumerating command. Truncated output
  cannot be told apart from complete output — and this file exists to mechanise
  findings of exactly that class.
- Never run `npm run build`, the whole `npm test`, any `verify-*` script whole,
  the Pulse or the Desk. `node --test` on your own file is exactly right.
- Every date you write is this machine's LOCAL date.
- No `git push`, no `gh`, no `bd` write commands, no commits.

## Your report — `RESULT2.md`

    # WISDOM PHASE 0 — RESULT2

    ## 1. The six mutations, before and after
    | mutation | suite before | suite after | the twin that now catches it |
    ## 2. Every twin added, and the red observed for each
    ## 3. The unmutated suite, final counts, verbatim and untruncated
    ## 4. The two unsettled questions (prefix equality; the phrase filter)
    ## 5. Other twins I found carrying the same class, beyond the eight
    ## 6. Any check I could NOT bind, and why
    ## 7. Blocked or refused calls

Section 6 is not a failure. A check that genuinely cannot be bound by a fixture
is a finding about the check, and it is worth more than a fixture contrived until
it goes red.
