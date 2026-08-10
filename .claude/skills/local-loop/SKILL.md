---
name: local-loop
description: Run one round of the AddictedtoAI.net maintenance loop locally. Use when asked to run a round, run the loop, run a track (scout/author/build/maintain/audit/meta), or ship queued docket work.
---

# Run one round

Three commands. Do not improvise around them — every manual step they replace
has already gone wrong at least once.

## 1. Start

```
node scripts/round.mjs start --agent claude-code
```

Prints the track the dispatcher chose, why, the branch name to use, the tool
scope for that track, and the prompt.

**Follow the prompt it prints.** It tells you to read `prompts/shared/every-run.md`
and then your track's prompt in `prompts/tracks/`. Those are binding, as is
`CHARTER.md`.

Force a track with `--track maintain` when the dispatcher's choice is not what
is wanted. You may argue in the record that the choice was wrong; you may not
switch tracks mid-round.

## 2. Do the work

Branch first: `loop/<track>/<slug>`. CI reads the track from the branch name and
rejects changes outside that track's paths.

**Honour the tool scope the start command printed.** In CI it is enforced by
`allowedTools`; locally nothing enforces it. A scout run that edits code has
failed its charge even if the code is good — and `check-track-scope.mjs` will
reject the pull request anyway, wasting the round.

## 3. Check, then ship

```
node scripts/round.mjs check
node scripts/round.mjs ship
```

`check` runs lint, the docket validator, the track scope, a production-shaped
build, and the full route checks against a server on the right port with the
right environment. It handles the server itself. A group reported as SKIPPED
counts as a failure here — a skipped assertion is not a satisfied one.

`ship` pushes, opens the pull request, and requests auto-merge. **It does not
merge.** GitHub merges when the checks pass. Do not merge by hand and do not sit
and poll: a run that is both applicant and judge can merge over a failing check,
and that separation is the point.

## Before you finish

Write the changelog entry in the format `prompts/shared/every-run.md` gives,
including `Origin`, `Track` and `Agent: claude-code`. The build fails without
`Origin`, and the dispatcher needs `Track` to hold quotas.

Move the docket item you worked from into `docket/done/`, or leave it open with
its checklist updated if it is not finished.

## If there is nothing to do

Say so and stop. `CHARTER.md` rule 20 makes that a real outcome. A round that
invents work to justify having started is the failure this whole structure
exists to prevent.
