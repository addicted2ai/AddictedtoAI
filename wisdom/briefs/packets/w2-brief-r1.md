# ENFORCEMENT CLAIMS MUST BE SUBSTANTIATED, NOT MERELY ADDRESSED

authority: two-desks-work-orders-and-trains@a5e873b

You are extending one check in `scripts/brief-lint.mjs` and its suite. The
linter already refuses a brief whose enforcement claim names no instrument. It
does **not** notice when the named instrument exists and **does not contain the
property being claimed**, and that is the gap you are closing.

## The finding, with a wild instance from the day this was written

The dominant defect class measured across this project's history is **a check
narrower than the property it claims** — roughly twenty instances — with
**artifacts that cannot fail** close behind at ten or more. The two meet in one
sentence shape, and here is a live one, written to be read by the very check you
are extending: **stale references in markdown under `wisdom/` are enforced by
`scripts/no-change-dir-refs.test.mjs`.** Nobody re-reads that file. The sentence
is durable, the reader's confidence in it is durable, and whether the file ever
contained the property gets checked on exactly one occasion, by whoever wrote the
sentence, in the minute they wrote it.

**THAT SENTENCE IS FALSE, AND THE LINTER YOU ARE EXTENDING PASSES IT TODAY.**
It is in this brief deliberately: run the current check against this document and
watch it go green on a claim whose instrument cannot do what the claim says.

**IT IS FALSE BECAUSE I MADE THIS EXACT MISTAKE, HOURS BEFORE WRITING THIS.** I
justified placing a directory of markdown at the repository root on the grounds
that a guard would catch stale references in it. Read that guard's glob: it
collects `**/*.{mjs,ts,tsx,js}`. **It has never read a markdown file and
cannot.** The instrument existed, was correctly named, was relevant-sounding, and
did not contain the property. My conclusion happened to survive on a different
reason entirely — which is worse, not better, because a conclusion that survives
is one nobody re-checks.

That is the shape. It is not exotic and it is not rare.

## The property to enforce

**A claim is substantiated when the instrument it names can be shown to contain
something the claim is about. A claim that names an existing instrument and
nothing else is not substantiated — it is addressed.**

The existing check (`scripts/brief-lint.mjs`, check 3) already distinguishes
three cases: a claim that names an instrument, a claim that delegates the finding
to the reader, and a claim that does neither. **Delegation must keep passing.** A
brief that says *"find what enforces this"* is being honest about handing the
reader the work, and refusing it would push briefs toward naming a file
confidently instead — the exact defect, made worse by the remedy.

## THE CLASS, AND THE SWEEP THAT IS YOUR DELIVERABLE

**THE CLASS: a sentence in a brief that transfers a reader's confidence to a file
without anything connecting the two.**

Do not implement a list of shapes I hand you. **Work out what a claim can name,
what an instrument can contain, and where those can fail to meet** — then decide
what the check reads and report the enumeration. One thing to settle explicitly
and write down either way: a claim's distinctive content may be a backticked
identifier, a quoted string, a path, a numeric literal, a test name, or nothing
at all. **A claim carrying no distinctive content is its own case** — decide what
the linter does with it, and say why.

**State the check's limits in the same breath as the check.** This one cannot
read English, so it cannot know whether an instrument actually contains the
property it is being credited with; the most it can establish is that the
instrument and the claim have something in common. Say so in the code, at the
check, in the words a later reader needs —
because the failure this whole packet exists to prevent is a reader trusting a
check to be wider than it is. **A check that overstates itself in its own comment
is this defect wearing the uniform of the fix.**

## THE NEGATIVE-CONTROL CONTRACT — this packet's real subject, applied to itself

This packet is the negative-control contract. It would be absurd to land it
without one, and the bar it must meet is the bar that was set by defeating the
suite you are extending.

Round 1 of this host shipped a passing vehicle and a failing twin for every
check, 28 for 28, and looked complete. A reviewer with edit rights on a
disposable copy then applied mutations to the checks and found **six that the
suite did not bind at all** — each twin exercised part of its check and left the
rest free. Round 2 took the suite to 66 and every one of those mutations now
turns it red.

**A TWIN PROVES A CHECK CAN FIRE. ONLY A MUTATION PROVES IT MUST.**

So, for every check you add or change:

1. **A vehicle that passes and a twin that fails**, as the file already does.
2. **A mutation of your own check that turns your own twin red** — apply it, run
   it, restore the file, run it again, and record all three states. Name the
   mutation precisely enough that someone else can reapply it.
3. **The twin must fail for the reason it names.** Confirm the fixture is not
   tripping a different check on its way past yours; a twin that fails for the
   wrong reason stays green when its own check is deleted.

**Wild controls, in preference to invented ones.** Two are available and both are
real:

- the `no-change-dir-refs.test.mjs` claim above — an existing, correctly-named,
  relevant-sounding instrument that does not contain the property. **Must be
  refused.**
- a delegating claim of the shape this project's review briefs actually use —
  the property stated, the mapping handed to the reader. **Must stay green**,
  and it is the control that proves the check is not a blanket ban on naming
  files. **The failure mode this control exists to prevent is the one that gets
  a guard switched off within a week.**

**If you cannot bind something, say so and say why.** Do not construct a fixture
whose only purpose is to make a claim true; inventing the domain that satisfies
a claim proves the domain, not the property. An honest "not bound, here is what
a vehicle would have to look like" is worth more than a green test that means
nothing.

## TWO RECORDS SIT ON THE ARMS YOU ARE EDITING, AND THEY DISAGREE WITH EACH OTHER

Added 2026-09-10, after the record wall's round 3 landed at `2c3d026`. This is
not background — it is a second deliverable, and it carries a live measurement
rather than a worry.

The wall (`scripts/brief-lint-records.test.mjs`) holds 22 records that pin arms
of the linter you are about to change. **Two of them are anchored directly on
check 3 of `scripts/brief-lint.mjs`**, which is your subject — find both records
in the wall before you touch either arm:

- **`C5i`** — anchor `/enforced by|enforces/i`, expiry 2026-10-10. Its recorded
  reason keeps the `i` flag because *"upper-case enforcement sentences are
  plausible in headers and emphasis"*.
- **`C6lines`** — anchor `const instLines = prose.filter`, expiry 2026-10-10. Its
  recorded reason keeps the SENTENCE model over the physical-line model, because
  a claim that wraps across two lines lost its delegation to the line break, and
  that defect has already been repaired here on an earlier occasion.

**Both reasons are about the same question and they point in opposite
directions**, which nobody noticed while they were being written separately.
`C5i` names headings as a place matches come from and treats that as a reason to
match MORE. `C6lines` joins lines into sentences so a wrapped claim keeps its
delegation. Put together, they mean a heading is welded to the paragraph beneath
it and the pair is read as one claim.

**That is measured, not predicted.** On 2026-09-10 check 3 of
`scripts/brief-lint.mjs` refused a brief of mine and named this, and you can find
the same behaviour by running it against any brief whose heading carries the
matched word:

    NO INSTRUMENT: ## Three properties, and you locate what enforces each I am
    naming properties and deliberately not n...

The heading carried the matched word; the sentence it was glued to named no
instrument and did not delegate; the delegation sat in the *next* sentence and so
did not count. The author's repair was to reword the heading to contain the word
`find` — a slightly worse heading, written to satisfy a check that was reading a
heading as a sentence. **That is the check shaping the artifact rather than
guarding it.**

### What you owe on this, and the order matters

1. **A heading is not a claim.** It is a label for the section that makes one.
   Decide what check 3 does with non-claim text and say why — but decide it for
   the CLASS, not for headings. A heading is one member of a class of text the
   sentence model can weld to a claim; block quotes, list-item labels, table
   cells and fenced code are candidates and are **not** a complete list, which is
   exactly why the enumeration is owed rather than the fix.
2. **Do not repair this by reverting to the physical-line model.** That trades
   today's false refusal for the wrapped-claim hole `C6lines` exists to prevent,
   and swapping a defect for its opposite is a round trip, not a repair. This
   host has already made that trip on an earlier attempt.
3. **Re-decide both records against the arm, not against their previous
   reasons.** Read what the arm does now, decide KEEP or DELETE or REWRITE on
   that basis, and transcribe the re-decided reason in full into your report. A
   reason rewritten from the previous reason is a copy with a fresh date on it.
4. **Say whether an undisturbed anchor was your edit's natural shape or the
   anchor's doing.** If you finish and both anchors still resolve at their
   expected counts, that is either because the edit genuinely did not need to
   move them or because you steered around them. **AN ANCHOR THAT SHAPES THE EDIT
   IS WORSE THAN NO ANCHOR**, and only you can tell me which happened. Answer it
   explicitly; "the anchors still pass" is not an answer to the question asked.

If your work does move an arm an anchor sits on, that is allowed and expected —
update the record and say so. What is not allowed is choosing a worse
implementation to leave an anchor undisturbed.

## Scope, and what is deliberately not in it

**This packet is the BRIEF-side half only.** The finding it comes from also names
a reviewer-side half — mutation of the merge-base diff inside the review gate, so
a control is generated from the diff rather than copied from an author-maintained
table. **That is a separate packet and it is not yours.** If you find something
about it while working, put it in your report; do not build it.

**Do not loosen any existing check to make room.** If an existing check gets in
your way, that is a finding for your report, not an edit. The suite you are
extending exists because the last three briefs this host refused were all wrong
in the way the host said they were.

## Files

Work only in these; a diff touching any other path is a scope finding.

- `scripts/brief-lint.mjs` — the check itself, at the existing check 3
- `scripts/brief-lint.test.mjs` — the vehicles, the twins and the mutation record
- `scripts/brief-lint-records.test.mjs` — the two records anchored on check 3, re-decided against the arm; and the count, identity list and identity-to-arm map if a re-decision retires one
- `RESULT1.md` — (new) your report, in the repository root

**Do not edit** `package.json`, `runners.yml`, anything under `data/`,
`CLAUDE.md`, `AGENTS.md`, or any file under `openspec/`.

## Ground rules (non-negotiable, and they do not carry over from anywhere)

- **Never use the token `cd` anywhere** — not in a command, not in a comment, not
  as a shell function name. A guard matches the token, not the intent. Absolute
  paths, and `git -C <dir>` for git.
- Keep command strings short; write a `.mjs` under the OS temp directory and run
  it rather than `node -e`.
- **Never manipulate or print a credential**, including a partial token.
- **A blocked or refused command is REPORTED, not routed around.**
- **Do not truncate the output of anything you use as evidence.** No `| head`, no
  `| tail`, no `-First N` on a counting or enumerating command.
- **Restore any file you mutate, and prove it by digest, not by memory.**
- Never run `npm run build`, the whole `npm test`, any `verify-*` script, the
  Pulse or the Desk. `node --test` on `scripts/brief-lint.test.mjs`, and direct
  `node scripts/brief-lint.mjs` runs, are exactly right.
- **State the collected test count beside every result.** A name filter on the
  Node test runner hides a genuine failure completely and **counts nothing as
  skipped**, and the filter arrives through the environment as readily as through
  the command line — `NODE_OPTIONS` and `npm_config_node_options` are both live
  doors. A run that collects fewer tests than the baseline is not a passing run.
- **Your baselines, measured on this tree at 06:01 local, before you start.**
  `scripts/brief-lint.test.mjs` collects **80** and passes 80.
  `scripts/brief-lint-records.test.mjs` collects **27** and passes 27, and the
  wall holds **22** records. Say what your baselines were before you start and
  what they are at the end. **If either is not what this brief says it is, stop
  and report that** — it means the tree moved under one of us, and every count
  below would be measured against the wrong thing.
- Every date you write is this machine's LOCAL date.
- No `git push`, no `gh`, no `bd` write commands.

## Your report — `RESULT1.md`

    # ENFORCEMENT-CLAIM SUBSTANTIATION — RESULT1

    ## 1. The check, by line, and what it reads
    ## 2. THE ENUMERATION — what a claim can name, what an instrument can
    ##    contain, and where they fail to meet; including every case I decided
    ##    needed no code, with the reason
    ## 3. The limits I wrote into the check's own comment, quoted
    ## 4. Vehicles and twins, each with the check it names
    ## 5. THE MUTATIONS — one per check added or changed
    | mutation | file:line | suite before | suite mutated | suite restored | digest identical |
    ## 6. What I could not bind, and what a vehicle would have to look like
    ## 7. NON-CLAIM TEXT — the enumeration of what the sentence model can weld
    ##    to a claim, what I decided for each, and why the physical-line model is
    ##    not the remedy
    ## 8. THE TWO RECORDS — each re-decided against the arm, with the re-decided
    ##    reason transcribed in full
    ## 9. Did an undisturbed anchor come from the edit's natural shape, or from
    ##    the anchor? Answered explicitly, per anchor
    ## 10. Anything I found about the reviewer-side half, which I did not build
    ## 11. Blocked or refused calls

Section 5 is the acceptance criterion. A check with no mutation recorded against
it is a check nobody has shown must fire, and this packet exists to end that.

**Section 9 is the one that will be read with the most suspicion, and you should
know why.** Two rounds of this packet have now closed the instance a brief named
and reported the class closed, and each time three separate parties read the
closed instance as the closed class. "The anchors still pass" is the answer that
looks like success and settles nothing.
