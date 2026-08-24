# Every run reads this first

You are maintaining AddictedtoAI.net. You have been assigned one track. Read
this file, then your track's prompt in `prompts/tracks/`.

## Read before doing anything

1. **`CHARTER.md`** — the direction, the two tests, the track charges, and 22
   rules. That count is typed but guarded: `scripts/check-governance-claims.mjs`
   compares it against the live file on every run, and `FRAME.md` fact 14
   derives it two independent ways and checks its own typed heading against
   them — a checked number, not a third derivation. This line said "21 rules you
   cannot
   change" until round 177 and both halves were wrong — the count was stale
   because nothing checked it, and rule 13 makes the charter the loop's to edit,
   apart from what rule 13a reserves. It is not advisory: if your work would
   breach a rule, the work is wrong, not the rule. If the rule itself is wrong,
   amending it is an available move under rule 13, held to the same standard as
   anything else you ship.
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

- Origin: unsupervised | supervised | maintainer | delegated
- Track: the track you were assigned
- Agent: what actually ran the round (see below; never `unknown`)
- Guardrails: what you ran, and what it said
- Result: not yet measured, or the number and where it came from
```

`Origin` is required and the build fails without it. `unsupervised` if this run
was scheduled and nobody read it first; `supervised` if a human triggered it and
can veto before merge.

`Agent` records what actually ran the round. This project's rounds have been
produced by Claude Code, Codex and the GitHub action, and the site says only
"an AI builds this site" -- less specific than the record is able to be.

From round 185 the value has to **resolve in `scripts/runners.yml`**, which
`scripts/check-changelog-provenance.mjs` checks at merge on every entry a
branch adds. Any of these resolve: a harness (`opencode`, `claude-code`,
`codex`, `claude-code-action`), a model (`claude-opus-5`, `claude-sonnet-5`,
`deepseek-v4-flash`, `gpt-5-codex`), a runner key (`claude-code-opus-5`,
`opencode-go-deepseek-max`), or `<provider-or-harness>/<model>`. Anything in
parentheses after it is free text and is not checked, so
`claude-opus-5 (Claude Code subagent)` is fine. If what ran you is not
registered there, register it -- do not reach for a name that happens to
pass. **Never write `unknown`**: it names nothing, and it was the launcher's
own default until round 185, which is exactly why the check rejects it.

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

How the run ends is the last instruction of the prompt that launched you. That
instruction lives in `scripts/build-prompt.mjs`, which assembles the prompt
every run reads; it is deliberately not restated here, so this document and the
prompt cannot disagree again.

Two separate things can hold a change back, and this paragraph ran them together
until round 177. The first is the `human-owned-paths` CI job: it fails on any
pull request touching `.github/`, `scripts/check-track-scope.mjs`,
`scripts/check-13a-unchanged.mjs`, `scripts/check-hold-mechanism.mjs` or
`scripts/test-orchestrate-hold.mjs`, and it is a required check, so nothing
auto-merges past it and the maintainer merges it by hand. `CHARTER.md` and
`prompts/` are not on that list — they came off it on 2026-08-22, when rule 13's
delegation made ordinary edits to both legitimate. This paragraph named them
anyway, along with a mechanism that does not work this way.

The second is `scripts/round.mjs ship`, which has no reserved-path rule at all —
it never asks whether a path you touched is protected. It does test one path: if
your branch changed no `CHANGELOG.md` entry it withholds auto-merge and stops
(`round.mjs:509`), because the round would have no `Origin` of its own to judge.
Given an entry, it arms from that entry's `Origin` (`round.mjs:550`): an Origin
claiming that something read the work before merge does not arm, and `delegated`
arms only when a covering artifact exists in `docket/reviews/`. Either way, say
so in the pull request and leave it waiting.

Update the docket item you worked from: move it to `docket/done/` if it is
finished, leave it open if it is not.
