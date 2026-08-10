# AddictedtoAI.net

A hub site (blog, tool directory, project showcase, interactive demos)
maintained by an AI loop working inside a written charter. Runs are
currently started by hand; the scheduled trigger is off. See `CHARTER.md`
for the rules the loop cannot change, `docket/` for what it plans to do,
and `CHANGELOG.md` for what it has actually done — published at `/log`.

Rounds 1–47 were built in a private predecessor repository. Its history
is preserved here in full; its pull requests could not be, so they are
exported to `archive/prs.json` and `/log` links those rounds to their
commits instead. See `archive/README.md` for why the predecessor stays
private.

## Setup

1. **Push to GitHub.** Use a **public** repo — GitHub Actions minutes
   are free and unlimited there; a private repo works too but draws
   from the 2,000 free minutes/month on the Free plan.

2. **Connect to Vercel.** Import the repo at vercel.com as a new
   project (Hobby/free tier). No config needed — Next.js is
   zero-config on Vercel. Every PR gets its own preview URL
   automatically.
   - Keep this project non-commercial (no ads, no paid product) to
     stay within Hobby plan terms.

3. **Install the Claude GitHub App**, which sets up the
   `anthropic_api_key` secret and workflow permissions the loop needs:
   ```
   claude
   /install-github-app
   ```
   (Run from the repo locally, with Claude Code installed. Full docs:
   https://code.claude.com/docs/en/github-actions)

4. **Set up analytics** (both free):
   - GA4 property → drop the measurement ID into the Vercel project's
     environment variables as `NEXT_PUBLIC_GA_MEASUREMENT_ID`, then
     redeploy (the value is inlined at build time). Leave it unset and
     the site emits no analytics script at all.
     - Cost, measured: `gtag.js` is ~146 KB over the wire, against
       ~97 KB for the whole rest of the page. Note that `pr-checks.yml`
       does *not* set this variable, so the Lighthouse guardrail
       measures the analytics-off build, not what production serves
       once you set it.
   - Search Console → verify the domain, no code changes needed

5. **Run a track by hand.** Actions → "Loop" → Run workflow, and pick a
   track. The schedule is off until a dispatcher exists to choose tracks
   from the docket; see the comment at the top of the workflow.

6. **Protect `main`.** Require `PR checks` to pass before merge, and
   require review from code owners so `CODEOWNERS` takes effect on the
   charter, the workflows, and the prompts.

## Local dev

```
npm install
npm run dev
```

## How the loop is arranged

- **`CHARTER.md`** — the direction, the two tests that gate work, the six
  track charges, and 21 rules the loop cannot amend. Human-owned, enforced
  by `CODEOWNERS`.
- **`policy.yml`** — everything the loop *can* change: track quotas,
  staleness windows, publishing limits.
- **`docket/`** — the queue. Deciding what to do is separated from doing
  it, so work can span runs and a run can legitimately find nothing to do.
- **`prompts/`** — one prompt per track plus a shared preamble. See
  `prompts/README.md` for the tool and path scope each track gets.
- **`CHANGELOG.md`** — the record, published at `/log`. Every entry carries
  an `Origin` saying how much a human saw before it landed.

## Running a track by hand

The scheduled trigger is currently off, so runs are started manually. To start
one locally with Claude Code or Codex:

```
node scripts/round.mjs start --agent claude-code   # or --agent codex
node scripts/round.mjs check
node scripts/round.mjs ship
```

`start` prints the track the dispatcher chose, the branch to use, that track's
tool scope, and the prompt — the same text the workflow builds, so a local
round and a scheduled one get identical instructions. Add `--track maintain` to
force one.

`check` runs lint, the docket validator, the track scope, a production-shaped
build and the full route checks, against a server it starts and stops itself on
the port the assertions expect. Running those by hand is how a check came to
pass against markup containing no badges.

`ship` pushes, opens the pull request and requests auto-merge. It does not
merge; GitHub does that when `build-and-audit` passes.

Claude Code has a `/local-loop` skill for this; Codex reads `AGENTS.md`. Both
drive the same three commands.

`node scripts/dispatch.mjs` shows which track is due and why, without producing
a prompt. `node scripts/loop-history.mjs` shows how many runs have been
attempted and how many failed — the changelog only records the ones that
finished.

Local runs are **supervised** — you are present and can throw the result away.
They also run as you, and you are an admin, so branch protection cannot
constrain them the way it constrains the loop. That difference is recorded per
round as `Origin`.

## Adjusting the loop

- Change cadence: edit the cron in
  `.github/workflows/loop.yml`
- Change guardrail thresholds: edit `lighthouserc.json` — the site reads
  them from there at build time rather than restating them
- Change quotas, staleness windows, or publishing limits: edit `policy.yml`
- Change what the site is *for*: edit `CHARTER.md`. That one is yours, not
  the loop's
