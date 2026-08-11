---
track: meta
filed-by: maintainer
title: Make the local check run everything CI gates on — the link check and the Lighthouse budgets — so a round cannot ship a pull request it has not already seen fail
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 1
---

## Why now

PR #15 shipped a pull request that could not merge, and the round that shipped
it had no way to know. CI's gate runs lychee
(`.github/workflows/pr-checks.yml`, the "Check for broken links" step). The
local gate — `node scripts/round.mjs check` — runs `check-tool-links.mjs` from
`scripts/check-routes.sh`, which resolves Directory hrefs with Node's `fetch`.
The two disagree: lychee's requests from shared GitHub runners get a 403 from
Cloudflare bot protection on `chatgpt.com`, Node's do not. Local said green,
CI said red, and the round had already stopped.

Everything downstream followed from that gap. PR #15 sat unmergeable; PR #16
had to be a separate meta round to edit the workflow, since `.github/` is
outside author's scope; and starting PR #16 needed `--force` twice — once
because the in-flight guard refuses to start while a pull request is open, and
once because the dispatcher chose `author` again.

That episode produced two other items
(`2026-08-11-red-pull-request-is-a-preflight-condition.md` handles the
deadlock). This one is the cheaper half: a round that can see the gate it will
be judged by does not ship the unmergeable pull request in the first place.
Recovery machinery is the ambulance; this is the guardrail on the road.

The general form is the rule worth holding: **whatever CI blocks a merge on,
`round.mjs check` runs first.** Any check that exists only in the workflow is a
way for a round to fail after it has stopped being able to respond.

## It happened again the same day, on a different check

This item was filed on the strength of one instance. Hours later, PR #18 —
the pull request carrying this very item — failed CI on a second one:

```
❌ resource-summary.document.size failure for maxNumericValue assertion
   Expected <= 150000, but found 154019     (http://localhost:3000/log)
```

`node scripts/round.mjs check` had reported every group green on that branch,
because the page-weight budget lives in `lighthouserc.json` and is asserted only
by `treosh/lighthouse-ci-action` in the workflow. Nothing local measures a
rendered page's transfer size. The round shipped a changelog entry that pushed
`/log` over budget and found out from CI, exactly as with lychee.

Measured locally afterwards, against the production build: `/log` is 153,532
bytes gzipped and 707,524 raw; the homepage is 3,976 gzipped. Those numbers
took one `curl` against `next start` — which is the point. The measurement was
never hard, it simply was not wired into the gate the round runs.

So the item covers both, and the Lighthouse half is arguably the more urgent:
a link check fails on a specific bad URL a round can reason about, while a
budget fails on accumulated weight no single round caused and none can see
coming.

**Note for whoever executes this.** The page-weight assertion is the one place
where the local check must not simply be *added* — `CHARTER.md` rule 11 means
a round blocked by the budget may not raise it, so the local check has to
report the same 150,000 the workflow does, read from `lighthouserc.json` rather
than restated. A second copy of that number is a way for a blocked round to
loosen the guardrail while appearing to obey it.

## Evidence

- `.github/workflows/pr-checks.yml` — the "Check for broken links" step invokes
  `lycheeverse/lychee-action@v2` with an `--exclude` list. Nothing local runs it.
- `scripts/check-routes.sh` — runs `node scripts/check-tool-links.mjs`, which is
  a different tool with different network behaviour, and is what `round.mjs
  check` reports as "all route checks passed".
- `CHANGELOG.md`, the entries for PR #15 and PR #16, which record the failure
  and the workaround as they happened.
- `lighthouserc.json` — holds `resource-summary:document:size` at 150,000 with
  `aggregationMethod: median`. Nothing outside CI reads it.
- `.github/workflows/pr-checks.yml` — the `treosh/lighthouse-ci-action@v11` step
  and its `urls:` list. That list is also the reason a new route ships
  unmeasured by default: adding a URL to it is a `.github/` change, which only
  meta may make, so a build round cannot put its own new page under the budget.
- PR #18's failing `build-and-audit` run, which is the second instance and the
  one that produced the numbers above.

## Done when

- [ ] `node scripts/round.mjs check` runs the same link check CI gates on, over
      the same URLs, and fails locally in the case that would fail in CI
- [ ] The exclude list is not restated in two places. Either the workflow and
      the local check read one file, or the local check invokes the workflow's
      configuration — a second copy drifts the first time somebody excludes a
      host and edits only one
- [ ] Proved able to fail before it is trusted: introduce a knowingly dead link,
      confirm the local check goes red, and record what it printed
- [ ] If lychee genuinely cannot run locally on the maintainer's machine — it is
      a Rust binary delivered as a GitHub Action, and this has not been tested —
      the item is closed by saying so in the record and filing the honest
      alternative. A check that is wired up but silently skipped is worse than a
      missing one, because `round.mjs check` treats SKIPPED as failure precisely
      to stop that
- [ ] `node scripts/round.mjs check` also asserts the page-weight budget for
      every URL the workflow measures, reading the threshold from
      `lighthouserc.json` rather than restating it, and reporting the measured
      bytes rather than only pass or fail — a round that can see `/log` at
      148 KB knows what is coming
- [ ] Proved able to fail: lower the threshold in a scratch copy, or point the
      check at a page known to be over, and record what it printed
- [ ] The URL list the budget is asserted against is not a third copy. If it
      stays in `.github/`, the local check reads it from there; if it moves,
      both read the new home
- [ ] The record says whether the full Lighthouse run is feasible locally or
      only the document-size assertion is. Only the second is needed to prevent
      this failure, and claiming more than was built is the failure mode
- [ ] The rule is written where a round will read it: whatever CI blocks a merge
      on, the local check runs first
