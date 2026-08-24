# Repository Guidelines

This site is maintained by an AI loop working inside a written charter. If you
are here to make a change, you are running a **round**, and rounds have a
defined shape.

## Run a round

Three commands. Do not improvise around them — every manual step they replace
has already gone wrong at least once.

```
node scripts/round.mjs start --agent codex   # track, tool scope, branch, prompt
node scripts/round.mjs check                 # every check, right port, no setup
node scripts/round.mjs ship                  # push, open PR, request auto-merge
```

`start` prints a prompt. **Follow it.** It directs you to
`prompts/shared/every-run.md` and then your track's file in `prompts/tracks/`.
Add `--track maintain` to force a track.

`check` runs lint, the docket validator, the track scope, a production-shaped
build, and the route checks against a server it manages on port 3000. A group
reported as SKIPPED counts as a failure: a skipped assertion is not a satisfied
one.

`ship` requests auto-merge; it does not merge. GitHub merges when the checks
pass. Never merge by hand — a run that is both applicant and judge can merge
over a failing check.

## The rules are not advisory

`CHARTER.md` is binding: 22 rules covering truth, the record, and the limits of
this loop's autonomy. That number is typed, but it is not unguarded —
`scripts/check-governance-claims.mjs` compares it against the live file on every
run, and `FRAME.md` fact 14 derives it two independent ways and checks its own
typed heading against them — a checked number, not a third derivation. This
paragraph
said "21 rules" while the charter had 22. The defect was never that a number was
typed; it was that nothing checked the one that was.

A round *may* amend the charter. The charter's own preamble says so: "This file
and `prompts/` are otherwise the loop's to edit under rule 13, the same as the
rest of this repository — `.github/` is not; it is part of what rule 13a
reserves." Rule 13 withdrew the old prohibition on 2026-08-22; this paragraph
said "It cannot be amended from inside a round" until round 177. What rule 13a
holds back is a list of properties — the integrity of the record, the stop
mechanism, repository settings, credentials, spending, installing anything,
destroying history, and rule 13a's own text — not the document. Separately, the
preamble fixes the direction, the two tests and the track charges.

The rules most often relevant:

- Every factual claim about the world comes from a source **fetched this run**
  and cited. This project is never a source about the world.
- Never state a number you did not produce. "Not measured" is always available.
- The record is append-only. Never rewrite a past changelog entry.
- Never push to `main`. Everything goes through a pull request.
- **Producing nothing is a valid outcome.** An empty queue is not a reason to
  invent work.

## Branch and scope

Branch as `loop/<track>/<slug>`. CI reads the track from that name and rejects
changes outside the track's allowed paths — see `prompts/README.md` for the
table. A scout run that edits code has failed its charge even if the code is
good.

## Before you finish

Add one changelog entry in the format `prompts/shared/every-run.md` specifies,
including `Origin: supervised`, `Track:` and `Agent: codex`. The build fails
without `Origin`; the dispatcher needs `Track` for quotas; `Agent` records which
model did the work, because this project's rounds have been produced by three
different ones.

Then move the docket item you worked from to `docket/done/`, or leave it open
with its checklist updated.

## Project layout

- `CHARTER.md` — the direction, the two tests that gate work, six track charges,
  and the rules. The loop's to edit under rule 13, apart from what rule 13a
  reserves.
- `policy.yml` — quotas, staleness windows, publishing limits. Loop-owned.
- `docket/` — the queue. `open/`, `done/`, `dropped/`.
- `prompts/` — one prompt per track plus a shared preamble.
- `CHANGELOG.md` — the record, published at `/log`.
- `app/` — the Next.js site. Plain CSS, no framework.

## Commands

`npm run lint`, `npm run build`, `npm run dev`. Prefer
`node scripts/round.mjs check` over running checks piecemeal — it sets the
environment the assertions need, which running them by hand does not.
