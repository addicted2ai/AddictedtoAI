---
track: meta
filed-by: maintainer
title: Teach the preflight that a red pull request is an urgent condition, and make the in-flight guard route instead of refuse
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 1
---

## Why now

The in-flight guard in `scripts/round.mjs` refuses to start a round while any
loop pull request is open. It models "a pull request is open" as "a round is in
progress". But a pull request whose checks can never go green is the opposite of
a round in progress: it is the state in which a new round is most needed, and
the only way out is `--force`, which disables every start-time guard at once.

That is what happened on 2026-08-11. PR #15 could not merge; the fix lived in
`.github/`, which only meta may touch; starting the meta round required
`--force` for the guard and `--track meta` for the dispatcher, which had chosen
`author` on quota. Two overrides, both worked out under time pressure by the
agent rather than offered by the tool.

**The framework already specifies this and never implemented it.**
`prompts/shared/every-run.md` says the preflight outranks the queue and lists "a
failing health check, a dead link, published content past its staleness window,
production not matching `main`". A loop pull request that is red belongs on that
list. Because nobody built it, the condition fell through to the guard, whose
only vocabulary was "no".

The plumbing exists too. `scripts/preflight.mjs` already emits findings carrying
`{ urgency, track, what, detail, why }` on a 0–3 scale and sorts by urgency, and
`scripts/dispatch.mjs` already injects an urgency-0 finding of its own ("preflight
itself failed to run", routed to meta) and routes on `finding.track`. This item
adds one finding and turns the guard into a router. It does not add a track, a
mode, or a new priority level — the escalation concept is built, it is just not
watching GitHub.

**The hard part is not detection, it is telling three states apart.** A rescue
path that cannot distinguish them is worse than none:

1. **Checks red** — the rescue case. Route to the track that owns the file the
   failing check is configured in.
2. **Green, unmerged, waiting on `CODEOWNERS`** — the system working correctly.
   `CHARTER.md` rule 13 makes pull requests touching `CHARTER.md`, `.github/` or
   `prompts/` wait for a human. If this reads as "stuck", a round will be
   dispatched to fix a wait, and the fix a model reaches for under pressure is to
   stop touching the human-owned path — the guardrail dissolving from the inside.
   This must print "waiting for the maintainer, correctly" and stop.
3. **Merge conflict with `main`** — a rebase, not a rescue.

## Evidence

- `scripts/round.mjs` — the in-flight guard, its `bad("a round is already in
  flight")` path, the `--force` override, and the existing `WARN` for when
  GitHub is unreachable ("That is not the same as 'no round is in flight'").
- `scripts/preflight.mjs` — findings carry an `urgency` field and are sorted by
  it; the current scale runs 1–3.
- `scripts/dispatch.mjs` — injects `urgency: 0` with `track: "meta"` when the
  preflight itself fails, with the comment "A broken preflight must not silently
  become 'nothing is wrong'". That is the pattern this item extends.
- `scripts/check-track-scope.mjs` — the `SCOPES` map, which inverted gives
  "which track owns the file this check is configured in" mechanically rather
  than by judgement.
- `CHANGELOG.md`, the PR #15 and PR #16 entries, which record both overrides.

## Done when

- [ ] `scripts/preflight.mjs` emits a finding when an open loop pull request has
      failing required checks, at the top of the urgency scale, naming the
      failing check and the pull request
- [ ] The finding's `track` is derived by inverting `SCOPES` against the file the
      failing check is configured in, not chosen by prose
- [ ] The three states above are distinguished, and the `CODEOWNERS`-wait case
      produces no finding and an explicit "this is correct, stop" message
- [ ] `round.mjs start` consults the preflight before printing "a round is
      already in flight", and routes rather than refusing when the open pull
      request is red
- [ ] GitHub being unreachable does not become "nothing is wrong" — it gets the
      same treatment as the existing in-flight `WARN`, and never silently
      produces a clean preflight
- [ ] Proved able to fail before it is trusted: run it against a pull request
      known to be red (PR #15's failing run is in the history) or a fixture, and
      record that the finding appeared and named the right track. A guardrail
      that cannot be made to go red has not been tested
- [ ] `--force` is no longer the documented escape for this case; whatever
      replaces it is written down where a round will read it
