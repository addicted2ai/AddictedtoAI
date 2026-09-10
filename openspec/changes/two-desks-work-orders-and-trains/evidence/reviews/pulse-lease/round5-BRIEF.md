# ROUND 5 — the trials that read source instead of running the program

authority: two-desks-work-orders-and-trains@a5e873b

The sealed review of round 4 returned **revise** and its findings are correct. I
checked them rather than accepting them, and nothing in this brief is a
correction to it.

**THIS ROUND ENDS IN DISPOSITIONS, NOT IN TESTS.** Every trial named below gets
one of three outcomes, and it is finished when each has one — not when a
sufficiently determined reader runs out of ideas.

## The one sentence this round exists for

Three trials in this suite assert something about `pulse/run.mjs` **as text**. The
review proved, by building and running each, that they can pass while the
property is false **and** — in one case — fail while the property is true.

**A CHECK THAT OVERSTATES ITSELF IN ITS OWN NAME IS THIS DEFECT WEARING THE
UNIFORM OF THE FIX**, because the name is what a later reader trusts and the name
is the part nobody re-derives.

## What the review established, all of it built and run

Take these as measured. Do not re-litigate them; extend the sweep past them.

1. **"A refusal prints one line and writes nothing" is enforced only as
   *queue.json is absent*.** Writing `data/derived/pwned.txt` from inside the
   fresh-refusal arm before the refusal line left the suite **39 pass 0 fail**.
   The "one line" half is real and fires — an extra line turned 11 trials red.
   The "writes nothing" half is a smaller property wearing a larger name.
2. **The stat-failed trial asserts three substrings are present in source.**
   Changing the condition to `lease.state === 'stat-failed' && false` keeps all
   three strings and the arm can never fire: **39 pass 0 fail**. Keeping the
   strings and adding `process.exit(0)` after the WARN flips proceed into
   **refuse-forever** — the precise outcome the design exists to prevent:
   **39 pass 0 fail**.
3. **The display-edge trial extracts a function's bytes and evaluates them.** It
   locates `formatAheadDuration` by `indexOf`, scans for a balanced brace, and
   runs the extracted text through `new Function`. Three results: bypassing the
   call site left extraction **green** while four live trials went red (35/4);
   adding `// {` inside the helper, **changing no behaviour at all**, made
   extraction **fail** while every live trial stayed green (38/1); and a
   duplicate top-level name made **every spawn die with a SyntaxError** while
   extraction stayed green (13 pass 26 fail).
4. **Worse advice on a PROCEED path is silent.** A second advisory line after the
   stale WARN, carrying no `GATE_LEASE` and no lease word, left the suite
   **39 pass 0 fail**. The whole-line pins hold same-line replacement on refusal
   paths and do not reach added lines on proceed paths.

## Your dispositions — three, and there is no fourth

For **every** trial in the class, not only the three above:

1. **RAISE THE COST** — make the trial reach its subject by running the shipped
   program instead of reading it, or make the property it names actually be the
   property it checks. Running beats extracting wherever running is available.
2. **DELETE** — a trial that can pass while the property is false *and* fail
   while the property is true is worse than absent, because it spends a
   reviewer's attention and produces false reds. Deleting it is a real answer and
   costs you nothing here.
3. **RECORD** — with a named owner and a date, saying plainly what it does not
   cover and that review carries the rest.

**Renaming is not a disposition on its own, but a wrong name blocks all three.**
Where a trial keeps a narrower property than its name claims, the name must come
down to the property. `writes nothing` that means `queue.json is absent` is the
worked example: either widen the instrument until the name is true, or narrow the
name until it is.

**Unowned prose is not a fourth option.**

## The sweep is the acceptance criterion

**Enumerate every trial that reaches its subject by reading or extracting source
rather than by running the shipped program.** The review found three; three is
what one reader noticed in one pass, not the list. For each, answer: **what can
change in the program without changing what this trial reads?** Build it and run
it rather than reasoning about it.

**A brief that names N findings gets N fixes; a brief that names the class and
requires a sweep gets the enumeration**, and the enumeration is what is owed.

## Two specific questions I do not know the answer to

Answer them with measurements, and *"I could not"* is an acceptable answer that
costs you nothing.

- **Can the stat-failed arm be reached at all on this machine?** Ten approaches
  were tried in an earlier round and recorded; the review did not retry them. If
  it cannot be reached, then no trial can bind it, and the honest disposition is
  RECORD with the gap in the trial's own name — which is close to where it
  already is. **That the tenth approach failed is not a finding. An eleventh that
  works is.**
- **Is there a cheap check that a refused run wrote nothing?** The review
  suggests a directory-tree comparison across the refusal. If that is cheap,
  RAISE THE COST. If it is not, narrow the name.

## Scope

- **`pulse/run.mjs` is a MUTATION SUBJECT, not an edit target.** Mutate it to
  test a trial, restore it by hash, and prove the restore. If a repair genuinely
  requires changing `run.mjs`, **stop and report it** rather than making it — the
  shipped program's behaviour is not this round's to change.
- **The refuse/proceed decision, both constants' values, and the
  mtime-authority / contents-advisory split are settled.** Re-measured twice, not
  reopened here.
- **The live whole-line pins are sound and the review said so explicitly.** They
  failed 11 on an added refusal line, 6 on a replaced remedy, 4 on a rendering
  change. **Do not loosen or widen them to make room for anything.** The two
  source-text trials are the place to narrow.
- **Do not run the Pulse against this repository, the Desk, a build, any
  `verify-*` script, or the whole suite.** `node --test` on
  `pulse/tests/lease.test.mjs` and throwaway roots under the OS temp area are
  exactly right.
- **The baseline is 39 collected, 39 pass, 0 fail**, measured on this tree.
  State the collected count beside every result, and say what your baseline was
  at the start and at the end. **If it is not 39, stop and report that** — a name
  filter hides a genuine failure completely and **counts nothing as skipped**,
  and it arrives through `NODE_OPTIONS` or `npm_config_node_options` as readily
  as through the command line.
- Keep an untouched copy of every file you mutate under the OS temp area, restore
  between mutations, and **report whether the suite was green again after each
  restore, with the file's hash.**
- **Report every mutation, including the ones that changed nothing.** An arm that
  cannot go red is furniture, and furniture that reads as coverage is the class
  this packet exists to refuse.
- Every date you write is this machine's LOCAL date.

## Files

Work only in these; a diff touching any other path is a scope finding.

- `pulse/tests/lease.test.mjs` — the suite under review, and the only edit target
- `pulse/run.mjs` — mutation subject only; restore by hash and prove it
- `pulse/lib/core.mjs` — read only
- `RESULT5.md` — (new) your report, at the worktree root

**Do not edit** anything else, and do not commit.

## Ground rules (non-negotiable, and they do not carry over from anywhere)

- **Never use the token `cd` anywhere** — not in a command, not in a comment, not
  as a shell function name. A guard matches the token and not the intent.
  Absolute paths, and `git -C <dir>` for git.
- Keep command strings short; write a `.mjs` under the OS temp area and run it
  rather than passing a program on the command line.
- **Never manipulate or print a credential**, including a partial token.
- **A blocked or refused command is REPORTED, not routed around.**
- **Do not truncate the output of anything you use as evidence.** Nothing piped
  into a pager, and no count limit on a command whose job is to enumerate.
- No `git push`, no `gh`, no `bd` write commands, no commits.

## Your report — `RESULT5.md`

    # THE PULSE GATE LEASE — RESULT5

    ## 1. THE DISPOSITION TABLE — every source-reading trial, and which of three
    | trial | disposition | what it now costs to defeat | ran |
    ## 2. THE SWEEP — every trial that reads or extracts source, including any the
    ##    review did not find
    ## 3. Names brought down to properties, quoted before and after
    ## 4. The two open questions, answered or explicitly not
    ## 5. THE MUTATIONS — every one, including those that changed nothing
    | arm | mutation | before | mutated | restored | went red |
    ## 6. What this suite still cannot say, with a constructed example
    ## 7. What I could not determine
    ## 8. Blocked or refused calls

**Section 1 is graded on completeness, not on how many rows say RAISE THE COST.**
A row reading *recorded, cost is one edit, review carries it* is a complete
answer. A row claiming a bind it did not build costs the round.

**A fix aimed at the named instance leaves the class open, and everyone involved
reads the closed instance as the closed class.** Three rounds of this packet have
now closed an instance and reported the class closed.
