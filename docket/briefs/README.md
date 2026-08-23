# Briefs

The instructions the orchestrator writes before a round runs, committed here
by the round they briefed — the third leg of the record alongside
`CHANGELOG.md` (what happened) and `docket/reviews/` (what a reviewer checked
about it).

## Why this exists

On 22 August 2026 three false premises entered this project through briefs,
and each was built on — expensively — before the maintainer caught it by
accident, in a status message. Adversarial review could not catch any of
them: review checks work *against* a brief, and the brief carried the error.
So the honest description of the state before this convention was: nobody
validated a brief, and briefs themselves lived only in a temporary scratchpad
directory that gets deleted, invisible to the record even after the fact.

This directory fixes the second half. `scripts/check-briefs.mjs`, wired into
`scripts/check-routes.sh`, fixes a bounded piece of the first half — see
"What the check can honestly claim" below.

## Layout

```
docket/briefs/
  README.md            this file
  loop-<track>-<slug>.md   a brief filed under this convention; must declare
                            its premises (see below); checked by
                            scripts/check-briefs.mjs
  legacy/               briefs from before this convention existed, committed
                         as historical record; exempt from the premise check
```

## Naming, and the problem it avoids

A brief is written *before* its round runs, which means it is written before
the round has a round number or a pull request number — both are assigned
later, the round number informally by whoever is counting and the PR number
by GitHub at `gh pr create` time. Naming brief files after either would mean
the round that commits its own brief has to guess a number that does not
exist yet.

The one identifier that *does* exist before the round starts is the branch
name: this round's own setup names it (`Branch: loop/meta/briefs-and-premises,
created for you at origin/main`) before a line of work happens, and
`scripts/round.mjs` reads the track out of it. Branch names are also
collision-proof for free — git refuses two branches with the same name — the
same reasoning `docket/reviews/` already applies by naming its files after a
commit SHA rather than a sequential ID, and `docket/open/` applies by dating
its filenames instead of numbering them.

So: **a brief is filed at `docket/briefs/loop-<track>-<slug>.md`**, where
`<track>-<slug>` is the round's branch (`loop/<track>/<slug>`) with `/`
replaced by `-`. A reader who has the branch name — visible on the merged
pull request — has the filename with no lookup. A reader who has the
changelog entry finds the brief because the entry's prose cites the path
directly (see "Linking a brief to its round" below) — there is no shared
schema field to keep in sync, just a sentence.

## What a brief must contain

Two plain lines, in this order, before anything else:

```
Branch: loop/<track>/<slug>
Track: <track>
```

Then the brief itself — the instruction as written, prose intact. This
convention does not require rewriting a brief's voice into a template; the
maintainer was explicit that bluntness should survive committing these, not
get sanded off.

Then, at the end, a `## Premises` section:

```
## Premises

This brief declares 3 premises below.

1. <the claim, stated flatly> [frame:2]
2. <the claim, stated flatly> [command: git log --oneline origin/main -3]
3. <the claim, stated flatly> [attested: maintainer, in conversation on 2026-08-22]
```

Every premise ends with exactly one bracketed tag naming its source:

- `[frame:N]` — the claim is fact N of `FRAME.md`.
- `[command: ...]` — the claim is supported by the output of the given
  command; write a command a reader could actually run.
- `[attested: ...]` — the maintainer asserted this directly and no command
  run from inside this repository can prove or disprove it; name who and
  roughly when.

Not every sentence in a brief needs a premise — only the load-bearing factual
claims, the kind that, if wrong, are exactly what produced 22 August's three
failures: a claim about who decided what, who controls what, or what this
project's own history shows. Procedural instructions ("branch: X", "do not
push") are not premises and do not need one.

## What the check can honestly claim

`scripts/check-briefs.mjs` runs *after* a brief is already committed — a
brief is written before its round runs, so nothing here could have gated it
in advance. What it verifies is narrower than "this brief is correct": that
every premise **declares** a source, that a declared `frame:N` reference
still resolves to a fact in `FRAME.md` today, and that the premise numbering
is complete (the same declared-total-plus-set-equality technique
`scripts/check-frame.mjs` converged on after three narrower fixes each
closed one shape of the completeness gap and left another — see that
script's own header for the full account, and its opening comment for why
this script does not attempt to re-derive that lesson from scratch).

It does **not** run a `[command: ...]` tag and check the output supports the
claim, and it does **not**, and cannot, verify a `[attested: ...]` tag
actually happened. Doing either would mean deciding whether a piece of
freeform prose is true — the exact problem this convention exists to avoid
re-attempting, per the brief that established it. A premise sourced to a
command that prints something irrelevant, or an attestation that never
happened, still passes. The property this buys is narrower but real: a brief
that asserts something with **no** stated source at all — which is what all
three of 22 August's failures were — now fails a build instead of reaching
the maintainer by accident.

## `legacy/`

Briefs written before this convention existed. They predate `## Premises`
entirely and are not retrofitted with one: the round each one briefed has
already run, so a declaration added now would not catch anything — the round
it might have stopped is over, and inventing citations after the fact for
claims that were never actually checked against them at the time would be
its own small dishonesty. Each legacy file carries one added line, in an
HTML comment so it reads as clearly not part of the original text, naming
which round it briefed and where that round shipped; the body below it is
otherwise verbatim.

`scripts/check-briefs.mjs` does not check anything about files under
`legacy/` — not the header lines, not a premises section, nothing. They are
archive, not live convention.

## Linking a brief to its round

The `Origin`/`Track`/`Agent`/`Guardrails`/`Result` block in `CHANGELOG.md`
does not carry a branch or a brief path — this convention does not ask it to.
Instead, a round that commits its own brief cites the brief's path directly
in its entry's prose, the same way an entry already cites a docket item or a
review artifact by path. A reader assembling "the instruction, the work, and
the review together" for one round follows: the changelog entry (what
happened) → the path it names under `docket/briefs/` (what it was asked to
do) → `docket/reviews/<sha>.md` if the round declared `Origin: delegated`
(what a reviewer checked). Publishing that chain as a linked trail on the
site itself is `app/` work, outside this track's scope — filed, not built;
see the docket item this round filed for it.
