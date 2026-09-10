# WISDOM ITEM 5 — independence claimed without lineage (machine form and reader form)

authority: two-desks-work-orders-and-trains@03d1f87

Two findings share one class and ship in one round because the class
is one thing with two forms, not two mechanisms: **an independence
claim with no lineage behind it.** In the machine form a measurement
carries no producer, input digest or method, so a second computation
over the same bytes under a new method name reads as corroboration.
In the reader form two findings sharing one instrument are called
corroboration instead of agreement. Luna's struck 47, the 3/112
agreement-on-zero, and the comparison review's guarded
corroboration-not-agreement are all this class wearing different
clothes — and `03e2207`, an input digest referring to nothing, is the
class in miniature, banked durably at
`openspec/changes/two-desks-work-orders-and-trains/evidence/wisdom-5-6/03e2207-banked.md`.

Item 6 follows with its own brief; beyond this sentence it is out of
scope here.

## The one sentence this round exists for

**Every machine measurement carries its lineage — producer, input
digest, method — and a claim marked independent whose lineage matches
an earlier measurement is refused as independent and recorded as
consistency instead; where judgment must stay judgment, the
second-model review prompt asks the corroboration question and the
disposition rule answers it.**

## What "lineage" and "independent" mean is the whole difficulty

Lineage is three fields, all required, none defaulted: **producer**
(the code that computed it, named as a path/symbol), **input digest**
(the bytes it read, as a content hash or a resolvable object id —
`03e2207` is what a digest with no bytes looks like, and the check
says so), **method** (the computation applied, named, not described).
A method name alone never confers independence: the same helper over
the same input under two method names is one measurement twice, and
the second is classified dependent — that is the constructed control,
and the arm names both method names.

Independent is a relation between two lineages, never a property of
one claim: different producer OR different input digest means
independent; same producer AND same input digest means consistency,
whatever the method names say. Value-equality is not
lineage-equality — Luna's 47 measured a different quantity that
coincided numerically, so two same-valued claims with different
digests are independent and the arm asserts exactly that. Getting
this backwards (same value, same claim) is the defect; getting it
forwards is the whole machine half.

The reader half stays judgment by design (Muse's refutation of the
linter placement is accepted): the prompt asks *"do these two
findings share an instrument — same helper, same fixture, same
derivation path — and if so, what besides agreement do they add?"*,
and the disposition rule answers: shared instrument is recorded as
agreement, never as corroboration; only different instruments
corroborate. A regex cannot tell whether two derivations share an
instrument without false-firing on legitimate shared fixtures (the
3/112-vs-10/111 case proves it), which is why this half is a reader
question and not a pattern.

Your comment must answer, each with a reason:

- What makes a digest valid: 40-hex form AND resolvability where a
  resolver exists. Form without bytes is `03e2207`; bytes without
  form is a path masquerading as a digest. Both refuse, for different
  stated reasons.
- Why the downgrade records instead of deleting: consistency is
  information (the second run reproduced the first), and deleting it
  destroys the reproduction record. Refused-as-independent plus
  recorded-as-consistency is the honest form; silent acceptance and
  silent deletion are the two defects.
- Why the reader half cannot live in the linter: shared-instrument
  detection needs judgment about derivation paths, and the one
  measured attempt at mechanising it false-fires on legitimate shared
  fixtures. Say this in the comment with the case cited.
- Why strictness here cannot false-fire on reworded methods the way a
  name-blocklist would: the check compares (producer, digest) pairs,
  never method-name strings, so renaming a method changes nothing and
  copying a pipeline changes everything.

## The control, wild and banked plus constructed and stated

The wild half is banked history; the constructed half is built by you
and declared as such:

1. **Wild — `03e2207`.** Banked at
   `openspec/changes/two-desks-work-orders-and-trains/evidence/wisdom-5-6/03e2207-banked.md`
   with its verification commands. A claim carrying input digest
   `03e2207` must be REFUSED (resolves to nothing, verified at
   banking time); the same shape carrying `9c272f4` must be accepted
   as lineage (resolves to a blob, verified). Read the banking file;
   re-run its commands; quote both outputs.
2. **Wild — Luna's 47.** `wisdom/timeline-notes/timeline-note-03.md`
   lines ~92–133: an "independent confirmation" of 47 measuring a
   different quantity that coincided, later struck. Two same-valued
   claims with different digests must classify INDEPENDENT — the
   check judges lineage, never value.
3. **Wild — shared instrument.** `timeline-note-07.md:225` (3/112 vs
   10/111 agreement-on-zero) and `timeline-note-08.md:206`
   (comparison corroboration-not-agreement): same-instrument pairs
   must never be recorded as corroboration.
4. **Constructed — two method names.** Run one helper over one input
   under two method names; the second claim must classify DEPENDENT
   with consistency-of pointing at the first. No wild pair of this
   exact shape exists on record, which is why it is constructed.

## The refusal, and where it sits

5a is a pure `loop/` module, `loop/lib/lineage.mjs`: `recordMeasurement`
attaches lineage and returns an id; `classifyClaim` answers
independent-or-consistency and never throws away the earlier record —
the downgrade returns `{ independent: false, consistencyOf }`, and a
claim whose digest is malformed or unresolvable is refused outright
with the reason named. It is wired into the measurement-writing path
the sweep finds (telemetry call sites and/or the structured evidence
writer — the sweep decides with reasons, the reviewer judges),
additive-only: the packet-E closure lesson applies in full, and any
exact-shape pin the wiring invalidates is updated in the same diff or
the wiring moves to a sidecar. A measurement you cannot wire without
breaking a pin is a sweep row with a disposition, not a silent skip.

5b is a reader question plus disposition rule committed as prompt text
and wired into the review-brief assembly seam the sweep finds, so
every sealed review carries it. The brief's own sealed review is the
first review to run under it.

## Files

- `loop/lib/lineage.mjs` — (new) the lineage attach/classify module with the reason each refusal exists.
- `loop/tests/lineage.test.mjs` — (new) this round's arms.
- `loop/lib/ledger.mjs` — (existing) telemetry call sites if the sweep wires there; additive-only, E-closure applies.
- `loop/lib/review.mjs` — (existing) the record-writer lineage and the reader-question wiring seam.

Everything else is read-only for this round. Do not edit `pulse/`,
anything under `openspec/changes/`, `scripts/brief-lint.mjs`,
`scripts/brief-closure.mjs`, `data/config.json`, `runners.yml` or
`package.json` — and a measurement whose wiring needs a file outside
this list is a scope decision for me, stated with the file and the
reason, not taken.

## Tests

Fixtures are the banked `03e2207` record (re-verify its commands,
quote the outputs), the cited note lines (read, never copied), and
constructed helper/input pairs you declare. Required arms, each with
its baseline colour recorded **before** any mutation:

1. The two-method-names pair: second claim DEPENDENT,
   consistency-of the first, both method names named.
2. The `03e2207` shape REFUSED (digest resolves to nothing, outputs
   quoted); the `9c272f4` shape accepted as lineage.
3. A matching-lineage independent-marked claim REFUSED as
   independent and RECORDED as consistency (earlier id returned, both
   records present — nothing deleted).
4. Same value, different digests (the Luna-47 mirror, constructed):
   INDEPENDENT. Value-equality is not lineage-equality.
5. 5b twin: shared-instrument pair recorded as AGREEMENT, never
   corroboration; different-instrument pair recorded as
   CORROBORATION. Both directions asserted — a rule that only ever
   fires one way is untested the other way.
6. The assembled review brief carries the corroboration question and
   the disposition rule verbatim (read the template, assert the text
   with the reason each sentence exists).
7. **Mutation A** — lineage attach neutered (producer dropped from
   the record). A same-producer pair must go green as independent,
   and that green is the defect. File mutation, fresh-import
   observation, byte-identical revert.
8. **Mutation B** — disposition rule weakened (shared instrument
   allowed as corroboration). The 5b twin's agreement direction must
   go green, and that green is the defect. Same mutation discipline.
9. Liveness: a measurement recorded without lineage, then claimed
   independent, refuses at classify time — the wire from writer to
   check is live, not two halves that never meet.

Every mutation is applied, run, and reverted, and the revert is
verified byte-identical. State collected/pass/fail for the baseline
and for each mutation. Node caches modules: re-import under a
cache-busting query for mutation observations — measuring the old
code and calling it the mutation is the failure round 2b recorded.
Your mutations here touch only your own new files, which no other
file's tests rewrite; say so in one line and move on.

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

## The sweep (the class+sweep discipline, and the stop rule)

Name the class — *independence claimed without lineage* — and sweep
it: enumerate every machine-measurement writing site in `loop/` (the
telemetry keys, the record writers, the conformance entries — find
them, do not assume the list) and every review-prompt assembly seam,
dispositioning each as BIND (carries lineage / carries the question
after this round), DELETE (not a measurement, not a prompt seam, with
the reason stated), or TRUE-BUT-UNTOUCHED (already carries what the
round requires). The enumeration comes back in your report. The sweep
terminates when every site has a disposition, not when no further
site can be imagined — that is the stop rule, and a site you decline
is a scope decision for me, stated, not taken.

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
half of each control is wild and which is constructed (with the reason
no wild one exists for the constructed half); the lineage comment you
wrote, quoted from the file; the sweep enumeration with every
disposition; the sentence saying item 6 follows with its own brief;
and anything you found that this brief got wrong.

That last one is not a courtesy. The four briefs before this one each
carried defects their reviews caught. Assume this brief carries
something similar and look for it.

If any part is blocked, finish every part that is not, and say plainly
what you left out and why. Do not narrow the scope on your own
judgement; a scope decision is mine, and an unstated one is a defect on
every attempt.
