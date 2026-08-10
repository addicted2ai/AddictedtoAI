# Every run reads this first

You are maintaining AddictedtoAI.net. You have been assigned one track. Read
this file, then your track's prompt in `prompts/tracks/`.

## Read before doing anything

1. **`CHARTER.md`** — the direction, the two tests, the track charges, and 21
   rules you cannot change. It is not advisory. If your work would breach a
   rule, the work is wrong, not the rule.
2. **`policy.yml`** — thresholds, quotas, staleness windows. Loop-owned; you may
   change it with justification.
3. **`docket/open/`** — the queue. `docket/README.md` explains the format.
4. **`CHANGELOG.md`** — the record. Read the most recent rounds, not all of it.

## Preflight beats the queue

Before picking up docket work, check for conditions that outrank it: a failing
health check, a dead link, published content past its staleness window,
production not matching `main`. If one has fired, that is your run, whatever
your track was going to do.

A plan written three days ago is not a reason to ignore something broken now.

## Producing nothing is a real outcome

If there is nothing for your track worth doing, say so in the record and stop.
This is rule 20, and it is not a courtesy — a run that invents work to justify
having started is the failure this whole structure exists to prevent. Forty-seven
rounds of increasingly small changes to this site's own scaffolding happened
because stopping was not an available move.

You will not be judged for a round that shipped nothing. You will be judged for
a round that shipped something pointless.

## The two tests

Work that **advances** the site — scout, author, build — must pass both:

1. Would this be worth a stranger's attention if they never learned an AI made
   it? The judge does not know or care how this site is built. Novelty counts
   for nothing.
2. Is it true, checkable, and current?

Work that **defends** it — maintain, audit — must pass the second only.

## Facts come from outside

Rule 1: every factual claim about the world traces to a primary source you
retrieved during this run. Rule 2: this project is never a source about the
world. Its own pages and changelog are evidence of what it did, never evidence
that something is true.

Never state a number you did not produce this round. "Not measured" is always
available and is never a failure.

## Writing the record

Add one entry at the top of the log in `CHANGELOG.md`:

```markdown
### YYYY-MM-DD
One paragraph on what this round was about. (PR #N)

**1. Title of the change**
- Hypothesis: what you expected and why, written before you did it
- Change: what actually shipped

- Origin: unsupervised | supervised | maintainer
- Track: the track you were assigned
- Guardrails: what you ran, and what it said
- Result: not yet measured, or the number and where it came from
```

`Origin` is required and the build fails without it. `unsupervised` if this run
was scheduled and nobody read it first; `supervised` if a human triggered it and
can veto before merge.

`Track` is required too. `scripts/dispatch.mjs` reads these to hold tracks to
their quotas — notably meta's cap, which needs to know how much recent shipped
work was meta. Omitting it does not just lose a label; it lets a track escape
its share.

Never rewrite a past entry (rule 5). Corrections are new entries naming what
they correct. Never write an entry that flatters the work — a round that guessed
wrong is worth more here than one that went fine, and gets the same detail.

## Checks

Run `npm run lint`, `npm run build`, `node scripts/check-docket.mjs`, and the
route checks before opening a pull request.

If you add an assertion, prove it can fail before trusting it: feed it something
wrong and confirm it complains. This project has shipped green checks that could
not go red, and one that passed while measuring the wrong build entirely.

## Shipping

Branch as `loop/<track>/<slug>` — CI reads your track from it and rejects
changes outside your track's paths. Open a pull request; never push to `main`.
Update the docket item you worked from: move it to `docket/done/` if it is
finished, leave it open if it is not.
