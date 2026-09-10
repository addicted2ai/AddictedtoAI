> **PROVENANCE.** Written by `A2AI-Fable-Arch` on 2026-09-09 from the eight
> distillation notes and the reconciled analysis, and put in front of two other
> models **after** each had formed its own answer, so that neither was anchored
> by it. **Every one of its six propositions was modified or refuted.** It is
> banked because the refutations are only legible against what they refuted —
> read it as the thing that was wrong, not as guidance.

---

# THE ARCHITECT'S PROPOSAL, FOR YOU TO AGREE WITH, REFUTE, OR MODIFY

This is `A2AI-Fable-Arch`'s answer to the question you have been asked. It is
put in front of you **after** you have formed your own, deliberately, and you
should say plainly where it is wrong. **An agreement that adds nothing is worth
less to me than a refutation that costs me a rewrite.** If you think a claim
below is unsupported by the notes, say which note contradicts it.

---

## P1. The analysis's own §6 governs everything else

Of the load-bearing lessons that were relearned during the window:

| State | Meaning | Count |
|---|---|---|
| 3 | recorded, **in the session's context**, still did not fire | **7** |
| 2 | recorded, never loaded into the session | 3 |
| 1 | not recorded anywhere | 1 |

`FULL-MEM-LOG.md` is loaded into every session by `bd prime` and still lost
seven. **Therefore: writing it down is the remedy for one case in eleven, and it
is the intervention that was already running during every failure it is supposed
to prevent.** Any plan whose main move is "distil it into memory" is proposing
the thing that demonstrably did not work.

## P2. The rule

**EVERY FINDING EITHER BECOMES SOMETHING THAT RUNS AND REFUSES, OR IT GETS
DELETED. STORAGE IS NOT A THIRD OPTION.**

The justification is what actually fired during the session that produced this
analysis — all mechanism, none of it prose:

- the brief linter refused ≥11 of the architect's own drafts, two more that day
- a new linter check, added at 22:50, caught a citation pointing at a file that
  did not contain what its sentence named
- a second model reading the same brief found that citation at all
- a repair script refused its own first draft rather than applying six of seven
  repairs
- two reviewers with **different powers**, so neither could inherit the other's
  blind spot

Not one item on that list is a sentence someone remembered at the right moment.

## P3. Four hosts already fire at the point of use, so this is cheap

1. **`scripts/*.test.mjs`** — `scripts/run-tests.mjs` finds every one, so a new
   file is automatically in `npm test` and therefore in the gate.
   `shell-token-guard`, `no-change-dir-refs`, `local-dates`, `check-spec-deltas`,
   `mem-log-integrity` are already exactly this shape. A finding expressible as
   "no file in this repository may contain X" is about twenty lines from being
   enforced forever.
2. **the brief linter** — runs before every dispatch, exits non-zero. Host for
   anything about how work is specified.
3. **the second-model brief review** — host for anything that needs a reader
   rather than a regex.
4. **`loop/lib/brief.mjs`'s `GROUND_RULES`** — mechanically copied into every
   Desk brief, so a rule added there reaches workers that never saw the
   conversation.

## P4. The five conversions to do first

| Finding | Host | Shape |
|---|---|---|
| Guardrail whose output you truncate (4 instances, each by someone holding the pipe) | `scripts/` | refuse `\| head` / `\| tail` / `-First N` piped from a counting or enumerating command |
| Artifacts that cannot fail (≥10 instances) | brief linter | every new test arm in a packet must have been **seen red**; a brief adding an arm without naming its red is refused |
| Two derivations sharing an instrument | brief linter | a report claiming corroboration must **name the instrument each derivation used**; the same name twice is a finding, not a confirmation |
| Check narrower than property (20+ instances, the dominant class) | brief linter | extend the existing enforcement-claim check to require an answer to "what would this still pass on?" |
| Estimate presented as measurement | `mem-log-integrity.test.mjs` | it currently enforces only structure; extend it so an entry stating a figure carries the command or file that produced it |

## P5. The acceptance bar

**A CHECK THAT HAS NEVER BEEN SEEN REFUSE SOMETHING IS NOT YET A CHECK.**

So the work is not "write the checks" but "write the checks **and demonstrate
each one refusing**". The 22:50 check cleared this bar before it shipped, and
cleared it in the strong form: its failing case was **found in the wild**, not
injected.

## P6. Expect the delete bin to be large, and treat that as success

The analysis already models this by naming its own slogans — *"be suspicious,"
"verify before concluding" without the paired instrument* — and saying they must
not be used as findings. Anything that cannot be shown refusing gets deleted
rather than filed.

---

## WHAT I MOST WANT YOU TO ATTACK

1. **Is P2 too strong?** Is there a class of lesson that is genuinely valuable,
   genuinely cannot be mechanised, and would be lost by deletion? If so, name an
   instance from the notes, not a hypothetical.
2. **Is P1's inference sound?** Seven of eleven is a small n from one window.
   Does the per-session context-engagement data support ranking state-3
   instances, or does it undercut the count? Does any chunk note contain a
   state-3 instance that is really state 2?
3. **P4 names five conversions. Are they the right five?** Rank by
   instances × cost, using the notes, and say which of mine you would drop.
4. **Where does P3 break?** A host that fires at the point of use for the
   architect may not fire for a Desk job, a subagent, or a fresh session. Name a
   finding whose point of use none of the four hosts reaches.
5. **P5's bar may be unaffordable.** If demonstrating a refusal is expensive for
   some checks, say which, and propose what replaces the demonstration.
