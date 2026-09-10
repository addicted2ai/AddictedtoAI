# WISDOM ITEM 3, ROUND 1 OF 2 — the required text, carried completely and uncontradicted

authority: two-desks-work-orders-and-trains@f1e75c2

Item 2b refuses a brief that drops an imperative. This round refuses the
three quieter ways required text dies: **missing** (the block never
arrives), **truncated** (it arrives cut off mid-sentence), and
**contradicted** (it arrives with its meaning reversed). A reconciler
that checks only "is every imperative mentioned somewhere" passes all
three — the mention is there, the requirement is not.

This is the first of two rounds for item 3, and the split is deliberate
rather than a narrowing: file-list closure against the merge-base diff
(the B2/E wild catch controls and the F wild pass control) is enforced
at the review gate, which is a different mechanism at a different point
in the run with different wiring, and bundling it here would make one
round unreviewable. It follows next with its own brief; say nothing
about it in your report beyond that sentence.

## The one sentence this round exists for

**A dispatch-time check that the brief carries its required source text
COMPLETELY — every content word present, no sentence cut mid-way, no
sentence negated — and refuses before the brief is written anywhere.**

## What "required" and "complete" mean is the whole difficulty

Required text here is the work source: the job's title plus detail (the
same source 2b reconciles, under a stricter property — see below).
"Carries" here does NOT mean 2b's token coverage and must not reuse it:
2b answers "is the imperative accounted for" loosely so rewording
passes; this answers "is the required sentence carried whole"
strictly, so a reworded requirement is carried only if every content
word survives. Two different properties, two instruments, one shared
sentence splitter at most — a shared strictness would collapse them
into one check wearing two names.

Your comment must answer, each with a reason:

- What makes a required sentence missing (no content word present at
  all) versus truncated (its opening content words present in order,
  then cut). A prefix present with the tail gone is the truncation
  shape; scattered words are something else.
- What counts as contradiction. A required sentence's content words
  co-occurring in a brief sentence carrying a negation ("not",
  "never", "no", "n't", "refuses to", "declines to") is the shape.
  Name what escapes: hedged negations, double negatives, and scope
  ambiguity ("not only") are beyond it, and the check says so.
- What happens when the required text is empty. Like 2b: pass by
  asserted choice, and the arm asserts the choice.
- Why strictness here cannot false-fire on legitimate rewording the
  way it would in 2b's position: assembly embeds title+detail
  verbatim, so in production the strict property holds trivially and
  this acts as a tripwire against the day a template edit or a future
  brief diet stops embedding source. Say this in the comment, and mean
  it: a tripwire whose production can never fire is decoration unless
  a mutation proves the wire live, which yours do.

## The control, constructed and therefore stated

There is no wild generated-brief instance of this class on record —
B2/E/F round-1 briefs quoted their tasks faithfully, which is why the
wild controls belong to round 2. So the control is constructed, from
an authority fixture in the shape of a bead: a description with three
numbered requirements and an ACCEPTANCE block placed AFTER a marked
truncation boundary. The truncated brief (cut before the boundary)
must be refused as missing; the mid-sentence cut must be refused as
truncated; the negated brief must be refused as contradicted; the
complete brief must pass. State in your report that the control is
constructed and why no wild one exists.

## The refusal, and where it sits

A pure exported function taking the required text and the assembled
brief and returning `{ missing, truncated, contradicted }` arrays of
the offending required sentences. The dispatch refusal calls it
inside `assembleBrief` before the return — the same placement as 2b's,
for its reason: `run.mjs` writes `.job/brief.md` only after assembly
returns, and a guard placed after the write is decoration.

## Files

- `loop/lib/brief.mjs` — (existing) the reconciliation function and the refusal.
- `loop/tests/brief-required.test.mjs` — (new) this round's arms.

Everything else is read-only for this round. Do not edit `loop/run.mjs`,
`loop/lib/review.mjs`, `scripts/brief-lint.mjs` or anything under
`openspec/changes/` — brief-lint's verbatim-quote rules check HAND
briefs statically while this checks GENERATED briefs at assembly;
different subjects, different times, not duplicates, and a measurement
you edited is not a measurement.

## Tests

Fixtures are strings (and, for the order arm, files your test writes
under the OS temporary directory), in the shape `loop/tests/` already
uses. Required arms, each with its baseline colour recorded **before**
any mutation:

1. A brief carrying everything except the ACCEPTANCE block is
   **refused** as missing, naming the block.
2. A brief cut mid-sentence inside a required sentence is **refused**
   as truncated, naming the sentence. A brief carrying the complete
   block **passes**.
3. A brief negating a required sentence is **refused** as
   contradicted, naming the sentence.
4. Required text with no content sentences behaves as your documented
   choice says, and the arm asserts that choice.
5. **Mutation A** — completeness reduced to any-token presence (the
   bag check). The truncated arm must go green, and that green is the
   defect. Show it.
6. **Mutation B** — the reconcile call moved dead (whole block, not
   one line: neutralizing only the binding crashes on the use, which
   is a finding recorded in round 2b's report, not a discovery here).
   Your arm mirrors production order (assemble, write to a temporary
   file only on success) against a detail-dropped assembly and asserts
   the file lands under the mutation and never under the correct
   order. The `run.mjs` write stays read-only; the harness lives in
   your test.
7. Liveness: dropping the detail embed from the template makes
   assembly throw, proving the wire live rather than dead code.

Every mutation is applied, run, and reverted, and the revert is
verified byte-identical. State collected/pass/fail for the baseline
and for each mutation. Node caches modules: re-import under a
cache-busting query for mutation observations, documented in the test
— measuring the old code and calling it the mutation is the failure
round 2b recorded.

## Verification

Run your own files by absolute path with `node --test`. **Do not run
`npm test` here** — this worktree will carry no `node_modules`, so the
full suite cannot collect, and a total from a run that could not
collect every file is a measurement of a different suite. The
whole-suite total is mine to take on the merge target.

Read counts from the runner's own summary lines. It prints `ℹ tests N`
when stdout is not a terminal and `# tests N` when it is; if your
parse returns nothing, report **nothing was measured** rather than
zero.

Every property above is enforced by an arm you are writing rather than
by an instrument that already exists, so a reviewer must find each arm
and run it. Name each property and its arm in `RESULT1.md`.

## Ground rules — these apply to you and are not inherited by working here

- **Never use the token `cd`**, in a command, in a comment, or as a shell function
  name; the approval classifier matches the token and not the intent. Run scripts
  by absolute path and use `git -C D:/AddictedtoAI` for git.
- Keep command strings short. A step needing more than a couple of operations goes
  into a file that you then run.
- Prefer the file tools over shell equivalents for reading, writing, editing and
  searching.
- **Never manipulate or print a credential**, including a partial token. An
  authentication failure is a finding you report, not an obstacle to route around.
- **If a tool call is blocked, report it and stop.** Do not route around a denial
  and do not edit a permission or settings file to clear your own path.
- Never edit `package.json`. Never run two builds at the same time.
- Every date you write is the local date of this machine.

## Your report

Write it to `RESULT1.md` at the root of your worktree, carrying in this
order: the baseline and post-mutation colour of every assertion; which
half of the control is wild and which is constructed (with the reason
no wild one exists); the enumeration-and-exclusions comment you wrote,
quoted from the file; the sentence saying file-list closure follows in
round 2; and anything you found that this brief got wrong.

That last one is not a courtesy. The two briefs before this one each
carried defects their reviews caught. Assume this brief carries
something similar and look for it.

If any part is blocked, finish every part that is not, and say plainly
what you left out and why. Do not narrow the scope on your own
judgement; a scope decision is mine, and an unstated one is a defect on
every attempt.
