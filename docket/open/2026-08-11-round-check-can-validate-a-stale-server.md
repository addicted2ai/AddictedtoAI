---
track: meta
filed-by: meta
title: round.mjs check can run its whole route suite against a server it did not start
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 1
---

## Why now

`node scripts/round.mjs check` validated a stale build three times in a row
during round 75 and reported the results as if they described the branch.

What was observed, in order:

1. The route checks failed with `/log renders 74 rounds, CHANGELOG.md has 75`,
   `feed link anchor #round-pr-23 is missing from /log`, and two more of the
   same shape — all saying the newest round was absent from the page.
2. A separate production build served by hand on another port rendered all 75,
   `round-pr-23` included. The branch was fine.
3. `curl http://localhost:3000/` answered `200`. A `node` process from an
   earlier round was still listening there.
4. Killing that process and re-running `check` unchanged turned every group
   green.

So the suite had been describing a build from a previous round. Every green it
printed in that state was worthless, and — this is the part that matters — a
*red* it printed was equally worthless, which is how this was found at all.

`check` is supposed to refuse exactly this. `scripts/round.mjs` calls
`portFree(PORT)` and, when the port is taken, prints `port 3000 is already in
use` and exits 1. That message never appeared, so `portFree` returned true
while something was listening.

The mechanism is not confirmed and should be established before it is fixed.
The plausible chain is that `portFree` binds `127.0.0.1` specifically, the
squatting server was bound to a different interface or address family closely
enough that both binds could succeed on Windows, `npm run start` then failed to
bind and died silently because the spawn uses `stdio: "ignore"`, and
`waitFor(BASE)` was satisfied by the squatter answering. Each link there is
guessable and none of it was verified.

This is the third defect of one kind found in two days: a check that passes or
fails against something other than what it claims to measure. The other two
were the local link check that disagreed with CI's, and the page-weight budget
that only CI asserted. The `CHANGELOG.md` preamble already records an earlier
one — "a check that passed while measuring the wrong build entirely". The
pattern is not carelessness in any single check; it is that nothing verifies
that a check's *subject* is what it thinks it is.

## Evidence

- `scripts/round.mjs` — `portFree()` binds to `127.0.0.1`; the `check` command
  exits 1 with `port ${PORT} is already in use` when it returns false; the
  server is spawned with `stdio: "ignore"` and its exit status is never
  inspected; `waitFor(BASE)` treats any answer on the port as success.
- Round 75's own transcript: three identical failing runs, a hand-served build
  on port 3260 rendering 75 ids, `Get-NetTCPConnection -LocalPort 3000` showing
  a listening `node` process, and a green run immediately after killing it.
- `CHANGELOG.md` preamble, which lists "one that passed while measuring the
  wrong build entirely" among the failures this project already knows about.

## Done when

- [ ] The mechanism is established before anything is changed — reproduce the
      false positive and say in the record what actually made `portFree` return
      true, rather than fixing the guess above
- [ ] `check` cannot proceed against a server it did not start. Whichever way
      that is done — binding check, a startup handshake the spawned server must
      answer, inspecting the spawn's exit — the record says which and why
- [ ] The spawned server's failure to start is loud. `stdio: "ignore"` hides
      the one message that would have explained this in seconds
- [ ] Proved able to fail: leave a server on the port, run `check`, and confirm
      it refuses rather than reporting results. Do it in both directions —
      a stale server present, and absent
- [ ] Consider whether the same hole exists in CI, where the workflow runs
      `npm run start & npx wait-on http://localhost:3000` with no port check at
      all. A fresh runner makes a squatter unlikely rather than impossible, and
      the reasoning belongs in the record either way
- [ ] `check` cleans up its own server on abnormal exit — a round that dies
      mid-check leaves no `next start` behind. The cleanup in `round.mjs` only
      runs when the `check` process itself completes normally; a killed session
      orphaning the spawned server is now observed three times
- [ ] A preflight fails when a `next start` from this repository is already
      running on any port, not just port 3000 — orphaned servers have been
      found on 3000, 3250 and 3260, and none of them ever printed the "already
      in use" message `check` relies on

## 2026-08-11 — observed: three orphaned servers at once

Appended by round 82's rescue session. The failure mode this item predicted is
now observed rather than predicted. During round 82, three orphaned servers from
three different dead sessions were found running at the same time, on ports:

- **3000** — the `next start` spawned by the round 82 writing session's
  `node scripts/round.mjs check`. That session hung after committing (task list
  frozen at 5 of 9, no file writes, roughly 40 minutes), never pushed, and was
  aborted by the orchestrating model. It died mid-check and the server it had
  started kept running.
- **3250** — an orphaned `next start` from an earlier dead session.
- **3260** — an orphaned `next start` from a different earlier dead session,
  hours before the others.

All three were invisible to every check in this repository. Lint, the docket
validator, track scope, the build, and the route suite all measure something,
and none of them enumerates running `node`/`next start` processes or looks at
any port other than the one `check` itself intends to use. Nothing in the
repository would have reported them; the orchestrating model found them only
because it was diagnosing why the round 82 session had hung, and it swept the
ports. None of the three ever produced the `port 3000 is already in use`
message that `check` relies on as its guard — the one this item says failed in
round 75. The orchestrator killed all three before starting the rescue session;
ports 3000, 3001, 3250 and 3260 were confirmed free, and no `next start` from
this repository was left running. When the rescue session runs `check`, it will
measure the server it itself spawns, which is the condition this item exists to
protect — but it will be protected by the orchestrator having cleared the ports
by hand, not by mechanism.
