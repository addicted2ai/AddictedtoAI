# WISDOM ITEM 2b — the requirement that never left the issue, and the reason a truncation guard is not the fix

authority: two-desks-work-orders-and-trains@9aaf6fe

Five briefs lost a requirement between an issue and the job that was supposed to
satisfy it. Four lost it to **truncation** — an agent reading a long issue through
an output shortener. The fifth lost nothing to truncation at all, and it is the
one this round is about.

## The one sentence this round exists for

`addictedtoai-x2jl`'s description carries **three numbered requirements and a
fourth imperative written as prose**. The brief that was written from it carried
the three. The fourth was never clipped, never summarised and never argued away —
it was **skipped because it did not look like an item in a list**.

**A CHECK THAT RECONCILES A BRIEF AGAINST AN ISSUE'S ENUMERATED LIST IS NARROWER
THAN THE PROPERTY IT IS NAMED FOR, AND ITS NAME IS "NO REQUIREMENT LEFT THE
BRIEF".** That is this repository's dominant defect class committed by the remedy
for it, which is why the enumerated-list version of this mechanism is refused in
advance rather than built and then found wanting.

## What is in scope, and the half that is not

- **IN — 2b.** The brief generator reconciles a brief against **every imperative**
  in its source issue, not against the issue's enumerated list.
- **IN — the secondary host.** A repository test scanning `scripts/`, `loop/` and
  `pulse/` for the truncation shape **committed into code**. Different population
  from 2a, cheap, and it catches the shape where it is durable rather than where
  it is typed.
- **OUT — 2a, and not because it is unimportant.** 2a is a command guard that
  would refuse an enumerating command piped through an output shortener, and its
  host is a `PreToolUse` hook in the maintainer's own settings file, outside this
  repository. **That file is his.** It is raised with him and is not yours or
  mine to edit. Say nothing about it in your report beyond that it was out of
  scope.

Because 2a is held, **item 2 does not fully ship this round**, and your report
must say so in those words rather than implying the item is closed.

## The control, and the half of it that does not exist

The plan names the x2jl gates brief as the wild control. **THAT BRIEF IS
UNRECOVERABLE, and I measured it rather than assuming it:** no `.job/` directory
survives in the `fleet4-gates` worktree, `data/ledger.jsonl` holds zero
occurrences of `x2jl`, the four history hits for that id are all prose documents,
and **no `*/.job/brief.md` has ever been committed to this repository** — the job
envelope is scratch by contract. Do not spend the round looking for it.

What survives is the half that matters:

- **THE SOURCE IS WILD.** `bd show addictedtoai-x2jl` is intact and readable, and
  the source issue is where the imperatives live. Its description carries the
  three numbered requirements (classify environmental spawn failures; wait and
  retry the records `git add`; re-gate without re-authoring) and then, in the
  closing paragraph and **not** in the list: *"Cause of the process-creation
  failures themselves is OPEN; record the next instance with the free-memory
  figure at the moment it happens."* That sentence is the fourth requirement and
  the whole subject of this round.
- **THE VEHICLE IS CONSTRUCTED.** No brief exists to be refused, so your fixture
  brief is one you write.

**Transcribe the bead's requirement structure; do not paraphrase it.** Inventing
the domain that satisfies a claim proves the domain and not the property — and
here the domain, an issue whose fourth requirement is prose, is transcribed from a
bead nobody wrote for this purpose. **State in your report which half of the
control is wild and which is constructed.** A control whose provenance goes
unstated is read as wild by the next reader, and that has already happened one
item up this same list.

## What "an imperative" means is the whole difficulty

This is a classifier wearing a reconciler's clothes, and an undocumented
classifier is a judgement dressed as a mechanism. **Enumerate what counts,
enumerate what is excluded, and give a reason for every exclusion, in the check's
own comment** — the convention `scripts/brief-lint.mjs` already carries in its
header, including the limit it cannot catch, which is why its rules survive
review.

Your comment must answer, each with a reason:

- What makes a sentence an imperative rather than context. A modal (`SHALL`,
  `should`, `must`), a bare command verb, and a numbered item are candidates;
  measured description of what happened is not.
- Whether an imperative inside a quotation, a fenced block, or a passage
  describing what *another* system does counts, and why.
- What "the brief carries this imperative" means. **It cannot mean substring
  equality** — a brief legitimately rewords — so say what it does mean and what
  that admits. This is the loosest joint in the mechanism and it is where its
  next defect will be.
- What happens when the source issue has no imperative at all. Refusing every
  such job would ban a whole class of work; passing silently would make the
  check unfalsifiable on that class. Choose, and say which.

## The refusal, and where it sits

The reconciliation is a **pure exported function** taking the source text and the
assembled brief and returning the imperatives it could not account for. Pure
means no process, no filesystem, no network — so it is testable without running
the Desk, which is the property §7s says a mechanism usually lacks precisely
where it matters.

The dispatch refusal is then a call to that function at the point the brief is
assembled, **before** the brief is written anywhere. A guard placed after the
thing it guards is decoration.

## The secondary host

A test that scans `scripts/`, `loop/` and `pulse/` for a counting or enumerating
command whose output is piped into a shortener, and fails naming the file and the
line. It is a **different population** from 2a: 2a catches the shape as it is
typed, this catches it where it was committed and will be re-run forever.

**IT MUST NOT BE A BLANKET BAN, and this is the arm that decides whether the
guard survives its first week.** A deliberately non-exhaustive one-line
diagnostic — a preview, a sample, an excerpt that says it is an excerpt — must
stay **green**, while a count or an enumeration read through a shortener goes
**red**. A detector that cannot tell those apart gets disabled by the first
person it inconveniences, and then the property is unguarded and everyone
believes it is guarded.

## Files

- `loop/lib/brief.mjs` — (existing) the reconciliation function and the refusal.
- `loop/tests/brief-reconcile.test.mjs` — (new) 2b's arms.
- `scripts/tests/truncation-shape.test.mjs` — (new) the secondary host and its
  arms.

Everything else is read-only for this round. Do not edit `loop/run.mjs`,
`scripts/brief-lint.mjs`, `scripts/prebuild.mjs` or anything under
`openspec/changes/` — several are named here as measurements, and a measurement
you edited is not a measurement.

## Tests

Fixtures are files your test writes under the OS temporary directory, in the
shape `loop/tests/` already uses. Required arms, each with its baseline colour
recorded **before** any mutation:

1. A brief carrying all three numbered requirements and **not** the prose fourth
   is **refused**, naming the missing imperative. This is the wild-sourced arm.
2. The same brief with the fourth imperative accounted for **passes**.
3. An imperative reworded rather than quoted still counts as carried — the arm
   that proves the check is not substring equality.
4. A source issue with no imperatives behaves as your documented choice says,
   and the arm asserts that choice rather than the absence of an error.
5. **Mutation A** — reconcile against the enumerated list only. Arm 1 must go
   green, and that green is the defect. Show it.
6. **Mutation B** — the refusal is moved to after the brief is written. The arm
   that catches it is the one asserting nothing was written on a refusal, so
   write that arm.
7. Secondary host: an enumerating command through a shortener goes **red**; a
   declared non-exhaustive diagnostic stays **green**; and a mutation that drops
   the non-exhaustive exemption turns the green arm red, proving the exemption
   is load-bearing rather than decorative.

Every mutation is applied, run, and reverted, and the revert is verified
byte-identical. State collected/pass/fail for the baseline and for each mutation.

## Verification

Run your own files by absolute path with `node --test`. **Do not run `npm test`
here** — this worktree has no `node_modules`, so the full suite cannot collect,
and a total from a run that could not collect every file is a measurement of a
different suite. The whole-suite total is mine to take on the merge target.

Read counts from the runner's own summary lines. It prints `ℹ tests N` when
stdout is not a terminal and `# tests N` when it is; if your parse returns
nothing, report **nothing was measured** rather than zero.

Every property above is enforced by an arm you are writing rather than by an
instrument that already exists, so a reviewer must find each arm and run it. Name
each property and its arm in `RESULT1.md` so that finding is a lookup rather than
a search.

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

Write it to `RESULT1.md` at the root of your worktree, carrying in this order:
the baseline and post-mutation colour of every assertion; which half of the
control is wild and which is constructed; the enumeration-and-exclusions comment
you wrote, quoted from the file; the sentence saying item 2 does not fully ship
because 2a is held; and anything you found that this brief got wrong.

That last one is not a courtesy. The brief immediately before this one carried
three defects its review caught — a quotation that stopped before the authority's
own correction, a false claim that two scripts read the same fields, and an
assertion that would have been **red at baseline** for a reason unrelated to its
mutation. Assume this brief carries something similar and look for it.

If any part is blocked, finish every part that is not, and say plainly what you
left out and why. Do not narrow the scope on your own judgement; a scope decision
is mine, and an unstated one is a defect on every attempt.
