# Design

Five choices in this change are not obvious from the requirement text, and one
of them replaces a rule that was written deliberately. They are recorded here so
the next reader does not re-litigate them from the symptom.

## D1. Why containment does not reopen the hole equality was closed to plug

The live spec says: *"A stamp that merely changed SHALL NOT satisfy the check."*
That sentence exists because an earlier implementation read the expected value
from the local build's own `status.json` — written before the commit — so the
check confirmed the *previous* run's deploy forever. The fix was to compare
against the SHA read after the commit exists, and to refuse any "something
changed, so it must have deployed" fallback.

Containment keeps every part of that. The expected value is still the SHA read
from the repository after the commit exists. What changes is only the comparison:

| test | passes on the previous run's deploy | passes on an unrelated commit | passes on a commit built on top of this one |
|---|---|---|---|
| "the stamp changed" (refused, and still refused) | yes | yes | yes |
| equality with the pushed SHA (today) | no | no | **no** |
| the pushed commit is an ancestor of the stamp's commit | no | no | yes |

The middle column is the one the old rule was protecting, and containment does
not touch it: a commit that does not contain the pushed commit fails, and the
previous run's commit is by definition an ancestor of the pushed one rather than
a descendant, so it fails in the correct direction. The third column is the case
this change is for, and it is the case the requirement's own purpose sentence
already calls a success.

**Fail closed, in three places.** The stamp must parse as a hex abbreviation of
at least seven characters (unchanged); it must resolve, through the local
repository, to exactly one commit object; and the ancestry test must be answered
by git rather than inferred. If any of the three cannot be answered, the deploy
is not landed. In practice the live commit may have been pushed by another actor
and be absent locally, so the step fetches (`git fetch origin main`, a read-only
operation it already has the credentials for by virtue of having just pushed)
once before resolving, and treats a still-unresolvable stamp as not landed.

**Why not just accept "the stamp is newer than mine".** Because "newer" is a
clock, and a clock cannot tell a descendant from a fork. Ancestry is the only
test that answers the actual question — *are my bytes in what is being served* —
and it is arithmetic on the commit graph, not a judgment.

## D2. Why the re-test appends to `HOLD.md` rather than clearing it

The obvious version of this fix is: when the re-test finds the held commit
served, remove the hold and resume. It is refused, and not on a technicality.

- A run that clears its own halt is precisely the conflict of interest the brake
  exists for. The project's rule — *a run blocked by a guardrail reports it and
  stops; it does not loosen the guardrail to get past it* — has no exception for
  a guardrail that looks obviously stale, because "looks obviously stale" is the
  reading every wrong clearance has had.
- The evidence available to the re-test is the same single reading whose absence
  wrote the hold. One reading was not enough to conclude failure without a
  confirmation window; it is not enough to conclude success either.
- The authority to clear a **diagnosed** halt already exists and already sits
  with a human or with an orchestrator between runs. This change's job is to put
  the diagnosis in front of them, not to take the decision from them.

So the re-test writes a fact and stops. The strongest thing it may say is *the
commit this hold names is now served by <stamp>, observed <date>* — which is the
whole of the diagnosis the maintainer had to perform by hand on 2026-09-01.

## D3. Why the classification is a closed set of three, and computed

`never-advanced`, `advanced-elsewhere`, `unreadable`. Closed, because an open
string is what the current text effectively has — a conditional clause appended
to prose — and nothing can assert on it. Three, because those are the three
outcomes the polling loop can actually distinguish from what it read. **And
exhaustive, which the first draft of this set was not.** Two of the three are
positive tests — `unreadable` when no reading succeeded, `never-advanced` when
every reading succeeded and every one equalled the pre-push baseline — and
`advanced-elsewhere` is deliberately the **residual**: at least one reading
succeeded and they were not all the baseline. Defining it instead as "the stamp
moved to a commit that neither is nor contains the pushed commit" leaves two
holes a real run can fall into — a baseline that was itself unreadable while
later readings succeeded, and a reading that is not a commit at all (`unknown`,
a bare timestamp) — and a run that matches none of three classifications has to
either invent a fourth or write a hold that names none. Computed rather than
judged: each test is a comparison between values the loop already holds, so no
model is involved and the Pulse's zero-model property is untouched.

The third is not decoration. `unreadable` is exactly the case the existing
conditional clause silently drops — when the baseline itself could not be read,
`lastSeen === baseline` compares `null` to `null` and the "unchanged since before
the push" clause fires on a run that saw nothing at all, which is the most
misleading sentence the file can carry.

## D4. Why the hold carries a marker line, and why the re-test keys on it

"On every invocation that finds a deploy hold standing" reads like a condition
the code already has. It is not. `pulse/lib/publish.mjs:498` computes
`held = existsSync(p.hold)` and stops there, and `HOLD.md` has four writers:
this step, and the Desk's consecutive-failure, red-build and reserved-path
breakers (`loop/lib/breakers.mjs:72, 80, 93`). **None of the three Desk breakers
names a commit.** So "whether the commit the hold names is now served" has no
referent on three quarters of the holds that can be standing, and a re-test that
keyed on existence would fetch the live site to ask an unanswerable question
about a reserved-path halt and then append an observation that reads as progress
on it.

The marker is therefore the mechanism and not a convenience: `writeHold` emits
`deploy-hold: <pushed sha> <classification>` as its first body line, the re-test
parses that line, and a hold without one is passed over untouched. Keying on the
line rather than on which module wrote the file also survives the case that
matters most — a `HOLD.md` a human wrote by hand, which gets no observations and
should not.

## D5. Where the observation goes, and why that is a limit rather than a feature

`HOLD.md` is git-ignored (`.gitignore:68`). The appended observations are
therefore local to the machine that ran the Pulse: not committed, not pushed,
invisible to a fresh clone, and unavailable to any other actor. That is the right
home for them — a hold is a property of one deployment attempt on one machine,
and committing it would make a local brake into shared state — but it means the
observations must be treated as diagnostic text and never as a record anything
else reads. Nothing in this change derives queue items, findings, or data-layer
state from them.
