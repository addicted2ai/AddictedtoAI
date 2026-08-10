# AddictedtoAI.net

A hub site (blog, tool directory, project showcase, interactive demos)
maintained by a scheduled AI propose→build→measure loop. See
`CHANGELOG.md` for the loop's memory and current metrics, and
`prompts/propose-change.md` for the prompt driving the weekly step.

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

5. **Test the loop before trusting the schedule.** Go to Actions →
   "Weekly proposal loop" → Run workflow, to trigger it manually.
   Check that it opens a PR and that `pr-checks.yml` runs against it.

6. **Protect `main` when your GitHub plan supports it:**
   - On a public repository or a paid plan, require the `PR checks`
     workflow to pass before merge.
   - A private repository on GitHub Free cannot enable branch protection.
     In that case, keep changes on pull requests and merge manually only
     after `build-and-audit` passes. Treat copy, layout, and new sections
     as human-review changes; the prompt in `prompts/propose-change.md`
     tells Claude to flag those explicitly in the PR description.

## Local dev

```
npm install
npm run dev
```

## Adjusting the loop

- Change cadence: edit the cron in `.github/workflows/weekly-loop.yml`
- Change guardrail thresholds: edit `lighthouserc.json`
- Change what the loop optimizes for: edit the metrics block at the
  top of `CHANGELOG.md` — the prompt reads this file directly
