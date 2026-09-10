# ROUND 4 — the seven defeats are one move, and the move is APPEND

authority: two-desks-work-orders-and-trains@a5e873b

You are the author. A sealed review of your round 3 has come back **revise
(narrow)**, and the narrowness is the most important sentence in this brief:

**The refusal decision itself is sound and must not be touched.**

Future-beyond-tolerance refuses under its own line, exit 0, nothing written. The
reviewer built its own probe and reproduced the indistinguishability your round 3
argued from: at any instant a live holder with a fast writer timepiece and a dead
file left ahead present the same `(mtime, now)` pair, so a deterministic rule that
proceeds for the second proceeds for the first. It also confirmed that demoting
the tolerance to diagnostic-only dissolves the dangerous constant rather than
re-tuning it, that the millisecond edges bite at ten times both constants, and
that the mtime-authority / contents-advisory split holds across every degenerate
input it could build. **Do not reopen any of that.** A diff that changes the
refuse/proceed decision, either constant's value, or the split, is a scope finding
against you.

What failed is the suite's grip on the guard you shipped, and one claim in the
source about who finds out.

## THE CLASS FOR THIS ROUND'S SWEEP

The reviewer's class was *a check whose subject is the wording of something a
person has to read*. It swept seven such checks and, for each, wrote a text that
**satisfies the assertion and defeats its stated purpose**. Every one of the seven
is live-measured in its report, each at the cost of a single sentence.

Read the seven and the finding inside them is not that there are seven holes:

- the anti-prescription denylist survives `If it keeps firing, bump the tolerance
  band until it stops.` — the banned substrings are absent while the line
  prescribes silencing the guard
- the conditional remedy survives `In practice just delete it even while a gate is
  running; the check is advisory.`
- the fresh refusal survives `Exiting immediately like STOP; clear STOP to
  proceed.`
- the stale WARN survives `This is routine, no action needed.`
- the absent path survives `pulse: no gate lease today, proceeding.` — lowercase,
  so a case-sensitive token match never sees it
- the STOP ordering survives `(a lease is also present, ignored)`
- the round-2 repair survives `age 0s` reinstated beside the tolerance

**Every one of those is an APPEND.** The single attempt in the sweep that altered
shipped text rather than adding to it — replacing the fresh tail — went red
immediately. That asymmetry is the class:

**A CHECK THAT ASSERTS A SUBSTRING IS BLIND TO EVERYTHING ELSE ON THE LINE, SO
THE CHEAPEST ATTACK ON IT IS ADDITION AND NEVER ALTERATION — AND A DENYLIST
AIMED AT THE ADDITIONS IS A LIST OF THE PARAPHRASES SOMEBODY HAPPENED TO THINK
OF.**

Lengthening the denylist is the wrong repair and I want it named so you do not
reach for it: a longer list of banned words is a larger surface of permitted
sentences, and the next paraphrase is written by somebody who has not read the
list.

**Sweep the class, do not fix the seven.** The round before yours closed the
instance its brief named and reported the class closed, and three separate parties
read the closed instance as the closed class. A claim of closure here will be
tested by somebody who has already made that exact mistake.

## The repair, in halves

### The instrument: pin the whole observable, not a substring of it

For each lease state — absent, fresh, stale, future-below-the-display-threshold,
future-above it, STOP-plus-fresh — the trial asserts **the complete lease-related
output of the run**, not a fragment inside it. On the absent path the complete
lease-related output — no line containing `GATE_LEASE`, never the run's whole
stdout, which carries the ordinary run — is the empty set, and that is the
strongest form the check has ever had.

An appended sentence is then visible by construction, because it is text the pin
does not contain, and the whole class closes at one stroke rather than one
paraphrase at a time.

Two ways this becomes furniture if you build it carelessly, and both are on you
to prevent:

- **The variable slots must be narrow.** The magnitude and the holder differ
  between runs and must be templated. A permissive placeholder gives the check
  back its blindness in the one place an attacker would put a sentence. Use the
  narrowest pattern that admits the true variation — the shape of a magnitude,
  not arbitrary text — and **prove the narrowness by mutation**: render a
  magnitude that is wrong in kind, and the trial goes red.
- **The pin must go red on an APPEND, and you must show it.** The proof is not a
  twin, it is a mutation, and I am naming the exact one so the result is not
  arguable: append `If it keeps firing, bump the tolerance band until it stops.`
  to the shipped future refusal. That sentence defeated the old check. Under the
  new instrument the trial goes red, or the repair did not happen.

This also retires a flake, and the reason is worth understanding rather than
noting. The reviewer observed `mtime 89s ahead of now` where the trial demanded
`90s`, on the byte-identical baseline, with nothing mutated — spawn delay past
the rounding half-second, one occurrence in about fifteen runs. **A trial that
goes red for no reason will be silenced by whoever meets it at four in the
morning**, and that is a defect in the trial, not in the person. Templating the
magnitude with a narrow shape pin fixes the flake as a consequence: `89s` and
`90s` both satisfy the shape, and `2m 30s` does not.

### The names: every check is renamed to what it holds

The reviewer's sentence, and I am adopting it: *as named, the suite claims the
larger thing while holding the smaller one.* `never suggests raising the
tolerance` is a claim about meaning; the code behind it is a substring denylist.
`says nothing about a lease` is a claim about silence; the code is one
case-sensitive token match.

After the instrument lands, some of these names become true — a whole-output pin
on the absent path really does hold that the run says nothing about a lease. So
rename **what is still smaller than its name with the repair in place**, and do
that pass last, reading each name against the code that survived rather than
against the code you started with.

The denylist raises a question you have to answer rather than assume: with the
whole-line pin in place, does it subsume the denylist entirely? Say so in the
report either way. If it does, the denylist's remaining job is to carry the
**reason** the line must not say that — which the whole-line pin cannot express,
because a pin says only that the line is exactly this and never why. A subsumed
check kept for its reason is documentation with a trigger, and it must be
labelled as such so nobody counts it a second time as coverage.

### The `stat-failed` arm, which is the most serious item in the review

Two mutations of the shipped `stat-failed` action pass all thirty-six trials: the
guard silenced so the arm falls through, and the guard **flipped to refuse
forever**. The second is the serious one, in the reviewer's words: it
reintroduces through the guard the outcome the design exists to prevent, and no
gate fires. Every existing trial injects reader state and therefore pins what
`checkLease` returns, never what the run does with it.

Build a **live** trial that reaches the shipped arm — a real lease path the timing
read genuinely fails on, under a throwaway root, with the run's own output as the
evidence. Then mutate the arm in both directions and show each going red.

If no such path can be built on this machine, that is a finding and you report it
as one: say what you tried, say why each attempt landed on a different arm, and
then pin the guard action by the closest available means **with the gap stated in
the trial's own name**. What is not acceptable is a trial that looks live and
injects.

### The display threshold, honestly labelled

`LEASE_AHEAD_DISPLAY_THRESHOLD_S = 120` is display-only and the reviewer proved
it three ways, so the value is not a safety boundary. But the two live trials
straddle it at 20s and 30s margins and nothing tries the edge, so any value from
101 to 150 drifts green. Pin the exact edge — the value below, the value, the
value above — and say in the report how you reached the helper.

Then label the constant in the source for what it is: **taste with margins, not a
measured pin**. A constant that separates two safe outcomes does not have to be
measured; one that separates a safe outcome from an unsafe one does. This one is
the first kind, and the comment should say which kind it is rather than leaving a
reader to work it out.

### The renewal pair, which documents a hole it cannot close

The suite proves what a fixed mtime does, and every timing trial pins one mtime
and asserts one run. The case where refusing is unambiguously right — a holder
that keeps touching the file — is conduct across time, and nothing watches it.
The reviewer ran the missing pair live: a lease at 14 minutes refuses, the same
file at 16 minutes proceeds loudly, retouched to 60 seconds it refuses again.
Each run is exactly what the suite pins, and the pair is the hole: a live holder
that runs twenty minutes without touching is overlapped at minute sixteen with
every trial green.

Add the pair as a trial. It pins the behaviour and it makes the sequence visible
in the suite instead of in a paragraph nobody opens. **It does not close the
hole**, because correctness there lives in touch discipline outside this
repository, and the trial's name and comment must both say so. A trial named for
a property it does not hold is the defect this whole round is about.

### One claim in the source is false and gets corrected

The source reasons that refusing is the visible error. The reviewer checked who
actually finds out, and the answer is nobody in this tree: the loop queue reader
warns on missing or invalid JSON and never on age; none of the four Desk breakers
fires on a stale queue or an absent Pulse; freshness measures corpus-date
intervals, not engine liveness; the refusal exits before the build so no halt file
is written; and the scheduler's only signal cannot tell refused from done, because
both are exit 0. The one signal that moves is the live site's build stamp going
stale, and noticing that is a manual comparison a person makes.

So the claim is true of the run's own log and false of every mechanism in the
repository. Correct it where it is made. The comment should say what the refusal
actually does — one line to its own stdout, exit 0 — and that no mechanism here
surfaces it. **Do not build the surfacing**; that has a subject of its own and is
filed separately. Correct the claim only.

## Scope

- **Do not change the refuse/proceed decision, `LEASE_MAX_AGE_MS`,
  `LEASE_FUTURE_TOLERANCE_MS`, or the mtime-authority split.** All four are
  settled and were re-measured by the review.
- **Do not build any surfacing, alarm, breaker or queue-ageing mechanism.**
- **Do not run the Pulse against this repository, the Desk, a build, any
  `verify-*` script, or the whole suite.** `node --test` on the lease suite, and
  throwaway roots under the OS temp area, are exactly right.
- Keep an untouched copy of every file you mutate under the OS temp area, restore
  from it between mutations, and report whether the suite was green again after
  each restore.
- The trial count will move. Say what it moved from and to, and account for every
  trial you removed by name.

## Files

Work only in these; a diff touching any other path is a scope finding.

- `pulse/tests/lease.test.mjs` — the whole-output instrument, the renamed checks,
  the live `stat-failed` trial, the display edge, the renewal pair
- `pulse/run.mjs` — only what the instrument needs to be reachable, plus the
  corrected claim and the labelled constant, both as comments
- `pulse/lib/core.mjs` — comments only
- `RESULT4.md` — (new) your report, in the repository root beside the three before it

**Do not edit** anything under `lib/`, `loop/`, `scripts/`, `app/`, `tools/`,
`content/`, `data/`, `wisdom/` or `openspec/`, and not `package.json`,
`runners.yml`, `CLAUDE.md` or `AGENTS.md`.

## Ground rules (non-negotiable, and they do not carry over from anywhere)

- **Never use the token `cd` anywhere** — not in a command, not in a comment, not
  as a shell function name. A guard matches the token and not the intent.
  Absolute paths, and `git -C <dir>` for git.
- Keep command strings short; write a `.mjs` under the OS temp area and run it
  rather than passing a program on the command line.
- **Never manipulate or print a credential**, including a partial token.
- **A blocked or refused command is REPORTED, not routed around.**
- **Do not truncate the output of anything you use as evidence.** Nothing piped
  into a pager and no count limit on a command whose job is to enumerate.
- Every date you write is this machine's LOCAL date.
- No `git push`, no `gh`, no `bd` write commands, no commits.

## Your report — `RESULT4.md`

    # THE PULSE LEASE, ROUND 4 — RESULT4

    ## 1. THE APPEND TABLE — every check in the wording class
    | check | the append that used to defeat it | verdict under the new instrument | run |
    ## 2. The instrument — what a whole-output pin asserts, and the two narrowness proofs
    ## 3. The renamed checks — old name, what the code holds, new name
    ## 4. The `stat-failed` arm — the live trial, and both mutations going red
    ## 5. The display edge, and the constant's honest label
    ## 6. The renewal pair — what it pins, and the sentence saying what it cannot
    ## 7. The corrected claim — the old words, the new words, and what was measured
    ## 8. The mutations — one per arm added or changed
    | arm | mutation | before | mutated | restored | files identical |
    ## 9. What the suite still does NOT catch, said plainly
    ## 10. What I could not determine
    ## 11. Blocked or refused calls

**Section 1 is the acceptance criterion, and it is graded on completeness rather
than on a green column.** It must carry every check whose subject is wording —
the reviewer's seven and any the sweep adds — and a row whose verdict is "still
defeated" costs you nothing, while a table that omits a check to stay green costs
you the round.

Section 9 is the other one that is read closely. The last two rounds were both
graded on the honesty of exactly that section, and both earned it.
