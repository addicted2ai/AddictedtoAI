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

`CHARTER.md` is binding: 21 rules covering truth, the record, and the limits of
this loop's autonomy. It cannot be amended from inside a round. The ones most
often relevant:

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
  and the rules. Human-owned.
- `policy.yml` — quotas, staleness windows, publishing limits. Loop-owned.
- `docket/` — the queue. `open/`, `done/`, `dropped/`.
- `prompts/` — one prompt per track plus a shared preamble.
- `CHANGELOG.md` — the record, published at `/log`.
- `app/` — the Next.js site. Plain CSS, no framework.

## Commands

`npm run lint`, `npm run build`, `npm run dev`. Prefer
`node scripts/round.mjs check` over running checks piecemeal — it sets the
environment the assertions need, which running them by hand does not.
