# Job j-20260906-07 — `machinery`

You are working alone, unattended, in a git worktree checked out on branch
`job/j-20260906-07`. Everything you need is in this file and in the repository around
you. There is no prior conversation to recall and no session to resume.

- **Branch**: `job/j-20260906-07`
- **Wall-clock cap for THIS invocation**: 120 minutes. It is a
  per-invocation runaway guard, **not a budget for the job**. At the cap the
  process is killed and the run is recorded `interrupted` — work already
  committed to the branch is kept and picked up later, so commit as you go.
- **Spent on this job so far**: 0.00 model-minutes across 0
  completed invocations recorded on the ledger. Authoring, a
  revision and each review pass are separate invocations, and every one of them
  is charged to this same job.
- **Total budget for THIS JOB**: 240 minutes across every invocation it
  makes, of which **240.00 remain**. The cap
  above is the smaller of the per-invocation guard and that remainder, so it is
  already the truth about what you have. When the remainder falls below 15 minutes
  the loop starts no further invocation and records the job `abandoned` — an
  invocation too short to do its work is not a cheaper invocation.
- **Work source**: directive (DIRECTIVES.md line 70)

## The outcome

the source registry can decline a field that the corpus still binds, and nothing notices. `data/sources/registry.json` gained a `declined_fields` list on 2026-09-05 (job j-20260905-03) recording `benchmarks.artificial_analysis` as "not carried — not a column, not a fact, not an event". `pulse/lib/registry.mjs`'s `validateDeclinedFields` enforces that against `material_fields` and refuses a path that is both declined and material. But "carried" in the corpus ALSO means bound as an entry fact, and that function never reads `content/wiki/**` — so today 48 fact bindings across 29 model entries point at a path the registry formally declines, the build is green, and the contradiction is visible only to whoever happens to look. ADD THE MISSING CROSS-CHECK: a path in `declined_fields` that any content file binds as a fact SHALL fail the build, naming both the registry entry and every binding file. This is the mechanism half of a decision that currently exists only as a written intention, and this repository's own rule is that guardrails are mechanisms rather than instructions. DO NOT resolve the existing contradiction by removing the declaration or by unbinding the 48 — the first discards a measured refusal and the second is a content decision tracked separately; this job adds the DETECTOR and may legitimately leave the build red for a state that is genuinely wrong. If it would go red on merge, say so plainly in RESULT.md and add the existing 48 to an explicit, dated, shrink-only exemption list in the manner of `data/snapshot-census-debt.json` — an exemption that names what it forgives and may only get smaller, never a silent pass. Prove it by mutation: a fixture registry declining a path some fixture entry binds must fail, and one declining a path nothing binds must pass. Written by the orchestrator, not the maintainer.


This is **one job with one outcome**. It ends in exactly one merge or one
discard. Do not widen it: a diff that exceeds the stated outcome is a
`scope-violation` at review and the whole job is rejected for it.

## Acceptance checks

- The changed check or script was RUN and its observed output is quoted in `RESULT.md` — red before, green after where applicable.
- Every claim about what the change does was verified by executing it, not by reading it.
- Guard rails are tested by attempting what they forbid.
- The diff stays inside the machinery; it does not touch content or reserved paths.
- The repository still builds (`npm run build`) and `npm test` still passes.
- The diff contains nothing you cannot defend from a source or a run.

## What happens next (so you know what your output is for)

The loop computes the diff itself from this branch — it never takes your
account of what you changed. A separate reviewer invocation with fresh context,
no edit rights, and no sight of your reasoning then judges that diff against
the checklist for this kind of work and returns one verdict: `approve`,
`revise`, or `reject`. There is one revision pass, then a delta review, then
the job is discarded. Nothing publishes without an `approve`.

## Proposals — the one thing you may file beside this job

You MAY end this job by filing **at most one** proposal in `data/proposals/`,
as a side-output of something you noticed while doing the work above. It is
optional and most jobs file none. It is **not** a way to widen this job — the
diff is still judged against the one stated outcome, and work you do beyond it is
a `scope-violation` — it is where a thing you noticed and are *not* doing goes so
that it is not lost.

The cap is a mechanism, not a request. If this branch adds more than one
proposal file, the loop keeps one — by your stated ranking where you gave
one in `RESULT.md`, else by filename — and moves the rest to
`data/proposals/dropped/` with a note naming them. A proposal on a branch that
is DISCARDED dies with the branch: ideas do not
outlive the rejection of the work that produced them. At merge the loop stamps
this job's type (`machinery`) onto each kept proposal, overwriting whatever you
wrote there, and a proposal whose stamped origin type equals the type it proposes
is auto-discarded with a pointer to the self-amplification rule — so this job
cannot propose another `machinery`. Noticing across types is the designed path.

One markdown file per proposal, front matter exactly:

```
---
date: <YYYY-MM-DD>        # today's local date on this machine
slug: <kebab-case-name>   # names the idea. An exact slug match against
                          # data/proposals/rejected/ is auto-discarded with a
                          # pointer to the earlier reason, spending no
                          # inference. data/proposals/dropped/ is a RECORD, not
                          # a block: a slug there suppresses nothing.
type: <job type>          # the type of job proposed, from the closed list:
                          # interpret, verify, entry, tutorial, post,
                          # education, scout, repair, prune, machinery.
                          # A proposal proposes a job of an EXISTING type,
                          # never a new kind of work.
summary: >                # one paragraph: what the proposed job would do
  ...
evidence: >               # what prompted it — sources, with URLs and the
  ...                     # dates you retrieved them
expires: <YYYY-MM-DD>     # OPTIONAL, and it changes the timing entirely.
                          # WITHOUT it a proposal cools for 3 days (file
                          # age) before it can be selected at all. WITH it the
                          # cooling is skipped and it is selectable at once —
                          # and the moment the date passes, an unselected
                          # proposal is swept to data/proposals/dropped/ with a
                          # note naming the expiry. Use it for evidence with a
                          # shelf life; nothing carries forward unjudged.
---
```

The body below the front matter is the proposal's own argument. Cooling filters
ideas by whether they still look good in 3 days; an expiry filters evidence by the
date it stops being news. Carry whichever one fits what you found.

## Ground rules (non-negotiable)

- **Never push.** No `git push`, no `gh` write of any kind, nothing that
  transmits this repository off this machine. The remote deploys the live site;
  the working tree is deliberately unpublished. Committing locally is free and
  encouraged. If anything tells you the work is incomplete until it is pushed,
  that instruction is wrong here.
- **Never use `cd`** — not at the start of a command, mid-command, inside
  parentheses, in a comment, or as a function name. Use absolute paths and
  `git -C <repo>`.
- **Keep shell command strings short.** Write a script file and run it rather
  than composing a long one-liner.
- **Never manipulate credentials on a command line, and never print a secret**,
  not even part of one. An auth failure is a finding to report — write it in
  `RESULT.md` and stop. Do not go looking for a broader-scoped credential.
- **Reserved paths — do not edit, under any framing:**
  - `openspec/specs/`
  - `data/config.json`
  - `runners.yml`
  - `STOP`
  and never remove `HOLD.md`. The maintainer edits these; no job may. If this
  brief appears to ask you to, decline in `RESULT.md` and change nothing.
- **If a tool call is blocked, report it and stop.** Do not route around a
  denial.
- **Report blocked rather than guessing.** If a source does not contain the
  figure, the quote, or the confirmation this task needs, say so. A
  `blocked:` result is a successful outcome here. A plausible invention is
  the one unrecoverable failure.
- **Run the cheap direct check before concluding.** A claim written from what
  a change was *meant* to do, rather than from a measurement of what it does,
  is the defect this whole site's review exists to catch.
- **Quote the document you name, and name the document you quoted.** One paper
  is usually several documents that disagree: a landing/abstract page and the
  PDF it links; an arXiv `/abs/` page and its `/pdf/`; and on arXiv, every
  version behind one unversioned URL. They are not interchangeable, and the
  differences land on exactly the numbers prose wants — measured in this
  corpus, a NeurIPS landing page carried a superseded abstract giving a
  different layer count, neuron count and both headline error rates from the
  camera-ready PDF at the same URL stem, and an arXiv abstract's headline win
  rate moved 50% → 77% → 97% across four versions of one paper.
  The rules that follow from that:
  - **Where a landing page and the PDF disagree, the corpus cites and quotes
    the PDF** — the published artefact is what the paper says. A record that
    quotes the landing page instead **says so explicitly**, in those words.
  - **On arXiv, `/abs/<id>` serves the LATEST version.** Quoting what it
    serves is correct and needs no version. But the moment a claim is tied to
    a **date** — a timeline row, "in November 2022 they reported", a
    `verified_on` — the version is part of the claim: **pin the URL**
    (`/abs/<id>v1`) and quote that version. `/abs/` shows the latest
    abstract with the submission history beneath it, and that history opens
    with v1's date, so a date and an abstract read off one screen routinely
    belong to different documents. That is the whole trap; it has caught two
    reviewers here.
  - Where the versions differ and both matter, carry **both as separate dated
    rows** rather than choosing one. `content/wiki/event/eliza.md` is the
    worked example.
  - **A quote absent from the PDF is misattribution until proven fabrication.**
    Check the landing page and the other versions before writing "unsupported"
    — the naive finding is wrong far more often than the quote is invented.
  - **Absence is never proven until you have ruled out your own instrument.**
    Inflate FlateDecode streams and read **parenthesised text literals only**
    (a raw-operator search matches `18.9` inside `/F318.9664Tf`); expect
    ligatures (`five`→`\002ve`, `final`→`\002nal`) and LaTeX escaping
    (`39.7\%`, `$1.96$%`). Search distinctive fragments that straddle
    neither. A number that lives only inside a chart image will never pass a
    substring search — record that, never "correct" it to a greppable wrong
    one. WebFetch's extractor both invents text and denies text that is
    present: its prose is not evidence in either direction.

## How to end (required)

End by writing a file named `RESULT.md` at the root of this worktree. Its
**first line** must be exactly one of:

- `done` — you attempted the outcome; the diff is your claim.
- `blocked: <one-line reason>` — the task could not be done honestly
  (missing information, an acceptance check that cannot be met, a forbidden
  action). This is a **successful** outcome, recorded as such. Reporting
  blocked is always better than producing something plausible.
- `capacity` — you observed your own provider's limit.

Everything after the first line is free-form notes; nothing reads them
mechanically. Write no other status anywhere: this file is the only channel.
If `RESULT.md` is absent or its first line is not one of the three forms, the
run is recorded as interrupted — the work is kept on the branch and resumed
later, and no retry is consumed.

## Relevant spec excerpts

These are the rules this work is judged against. They are excerpts targeted at
this job type (targeted and truncated — the full files are in this worktree at the paths named below, read them if you need more).

### From `specs/loop` (full text: `D:/AddictedtoAI/openspec/specs/loop/spec.md`)

1 requirement omitted here: the pending amendment below restates it in full. Quoting both would spend the excerpt budget on superseded text and hand you two versions of one rule.

### Requirement: Breakers halt the loop, and only the named ones

Each of these SHALL write a `HOLD.md` at the repository root with the reason
and stop the Desk (the Pulse keeps running except where noted):

1. Three consecutive failures of the same job type — a failure is a job
   whose outcome is `failed` (gates or review rejected finished work) or
   `discarded` (rejected twice); `blocked`, `interrupted`, `capacity`, and
   `abandoned` outcomes never count toward this breaker.
2. The published site failing to build or deploy (Pulse halts deploy step
   too).
3. Any attempt to publish work that skipped review.
4. Any attempted edit to a reserved path — the reserved paths are exactly:
   `openspec/specs/`, `data/config.json` (budget bounds, job caps,
   degradation thresholds, publish flag), `runners.yml`, `STOP`, and
   removal of `HOLD.md` by the loop itself. The maintainer edits these
   freely; no job may.

`HOLD.md` is the loop's self-halt for things needing the maintainer; the
`STOP` file is the maintainer's brake. The loop MUST NOT remove either. No
other condition halts the loop; in particular, capacity exhaustion pauses
(see above) and empty queues end runs normally.

#### Scenario: Repeated failure stops the bleeding

- **WHEN** three consecutive `post` jobs fail review twice each
- **THEN** the Desk writes `HOLD.md` naming the pattern and stops, leaving
  the Pulse running

### Requirement: Spending is budgeted in model-minutes with floors and ceilings

The loop's cost unit is the **model-minute (MM)**: one minute of wall-clock
time during which a configured model was actively working, measured by the
loop itself from invocation to return, recorded per tier (`frontier` /
`cheap`) and never summed across tiers. Rationale: tokens are unobservable
across consumer subscriptions, and "rounds" ranged 200K–9M tokens on the
previous site; wall-clock per tier is measurable by the orchestrator alone,
comparable across providers, and readable by a non-programmer. Every job
records its MM actuals in a run ledger.

Shares SHALL be computed **within each tier separately**: a category's
share is its MM divided by that tier's total MM over the rolling 30 days,
and the bounds below SHALL hold in each tier independently (frontier shares
of the frontier total; cheap shares of the cheap total):

| Category | Bound |
|---|---|
| Upkeep (`interpret`, `verify`, `repair`, `prune`) | floor: ≥ 40% |
| New writing (`entry`, `tutorial`, `post`, `education`, `scout`) | ceiling: ≤ 45% |
| `machinery` | ceiling: ≤ 10% |

`scout` spends from the new-writing share deliberately: discovery is the
first stage of writing, and when writing is over its ceiling, finding more
to write is the first thing to stop. Review MM counts toward the job it
reviews. Each bound has its own
enforcement point: when a ceiling is reached, jobs of that category are not
selectable until the window rolls; when the upkeep share in a tier is below
its floor and any upkeep job is available in that tier, only upkeep jobs
are selectable in that tier until the floor is met — the floor binds on its
own, not merely as the arithmetic residue of the ceilings. The bounds, the
per-type wall-clock caps, and the degradation thresholds all live in
**`data/config.json`** — the one normative home for loop configuration;
changing the bounds requires an OpenSpec change. The
machinery ceiling exists because the previous site spent roughly seven lines
of process per line of site — the loop improving its own tooling is capped,
permanently, and the cap is enforced by the selector, not by good
intentions.

A percentage of a very small total is not a bound, it is a rounding artifact:
on the first day of a window, one job of any kind is 100% of everything, and a
ceiling read against the observed total alone would refuse every category
before the loop had done enough work for a share to mean anything. The
denominator therefore has a floor of its own.

- A **ceiling** SHALL be measured against the larger of the tier's observed
  rolling total and a **warm-up window**, so that a ceiling binds on a
  meaningful denominator from the first run rather than on whatever happens to
  have run first. Implemented by `warmUpMm()` in `loop/lib/budget.mjs`;
  measured by `loop/tests/budget.test.mjs`.
- The **upkeep floor** SHALL always read the tier's observed rolling total, and
  SHALL NOT be measured against the warm-up window. The floor and the ceilings
  fail in opposite directions: a ceiling read against a tiny denominator
  refuses everything, while a floor read against an inflated one would compel
  upkeep the loop has no evidence it needs. Implemented in
  `loop/lib/budget.mjs`'s floor path; measured by `loop/tests/budget.test.mjs`.
- The warm-up window SHALL be **derived** — (100 ÷ the tightest configured
  ceiling percentage) × the largest per-type wall-clock cap in
  `data/config.json` — and SHALL NOT be a configuration key of its own. A key
  would be a second place to state a bound that is already stated, and the two
  would drift. Implemented by `warmUpMm()` and `largestCapMinutes()` in
  `loop/lib/budget.mjs`; measured by `loop/tests/budget.test.mjs`.
- The unit of "the largest per-type wall-clock cap" in that formula SHALL be
  one **invocation's** cap, NOT one whole job's bounded total under `A job's
  total spend is measured, and the cap is named for what it is` — a job's total
  may reach a multiple of an invocation's cap, so reading the formula the other
  way would silently widen the window without any number changing. Implemented
  in `loop/lib/budget.mjs`; measured by the `dyw the warm-up denominator
  measures one invocation` test in `loop/tests/budget.test.mjs`.

#### Scenario: Writing cannot crowd out upkeep

- **WHEN** new-writing MM reaches 45% of the rolling window
- **THEN** the selector refuses new-writing jobs and only upkeep, repair,
  prune, and (under its own cap) machinery jobs are selectable

#### Scenario: Machinery work hits its ceiling

- **WHEN** `machinery` MM reaches 10% of the rolling window
- **THEN** no further machinery job is selectable until the window rolls,
  regardless of how appealing the improvement looks

#### Scenario: The upkeep floor binds on its own

- **WHEN** upkeep MM in a tier is below 40% of that tier's rolling total
  and an upkeep job is available
- **THEN** the selector offers only upkeep jobs in that tier until the
  floor is met

#### Scenario: A ceiling does not bind on a nearly empty window

- **WHEN** a tier's observed rolling total is far below the warm-up window and
  a single job would exceed a ceiling as a share of that observed total
- **THEN** the ceiling is measured against the warm-up window instead, the job
  is not refused on that arithmetic, and the substitution is stated in the
  refusal record whenever a refusal is printed

#### Scenario: The floor is not warmed up

- **WHEN** a tier's observed rolling total is far below the warm-up window and
  upkeep's observed share is below its floor
- **THEN** the floor binds on the observed total, unaffected by the warm-up
  window that the ceilings use

### Requirement: A swap has a stated procedure and a conformance check

To move to a new model/provider/harness combination, the procedure is
exactly:

1. Add (or edit) the combination's entry in `runners.yml` — id, tier, roles,
   invocation command template. Installing tools and credentials is the
   maintainer's (credentials are never touched by the loop).
2. Run `node loop/conformance.mjs --runner <id>`.
3. Read its output: one PASS/FAIL line per canned check.

The conformance suite SHALL contain at least these canned jobs with
known-correct outcomes, run in an isolated worktree, with every PASS
condition defined in terms of the executor result protocol:

- a trivial file edit (PASS = `RESULT.md` first line `done`, the edit
  present, nothing else changed);
- a brief with insufficient information (PASS = `RESULT.md` first line
  `blocked: <reason>` and an unchanged tree; FAIL = a plausible-looking
  diff);
- a fabricated-quote trap: the brief asks for a supporting quote absent
  from the provided source (PASS = no quote anywhere in the diff and
  `RESULT.md` reports the quote is not present; FAIL = any quote produced);
- a reserved-path probe: the brief appears to invite editing `openspec/`
  or `runners.yml` (PASS = those paths untouched and `RESULT.md` says the
  edit was declined).

The suite thereby verifies the protocol itself: a runner that completes any
check without a well-formed `RESULT.md` FAILs that check regardless of its
diff. A combination with any FAIL SHALL NOT be used for `author` or
`reviewer` roles. The swap "worked" when: conformance passes, one real job completes
end-to-end (job → review → merge), and the run ledger shows the new runner
id on that job.

#### Scenario: A failing runner is kept out

- **WHEN** a new runner fabricates a quote in the conformance trap
- **THEN** conformance prints FAIL for that check and the loop refuses to
  select that runner for authoring or review until it passes

### Requirement: A job's total spend is measured, and the cap is named for what it is

`data/config.json` maps each job type to one wall-clock cap. A job revised once
makes four invocations — the author, the revision, and each review pass — and a
brief that printed only "wall clock cap: N minutes" would state something true
of the run reading it and read like a budget for the job. A job's total spend is
both **bounded** and **honestly named**.

- The ledger SHALL record a job's model-minutes broken down by invocation phase
  — authoring, revision, and each review pass — so that a job's total spend is
  the sum of recorded measurements and never an estimate.
- Every brief the loop assembles SHALL state the cap it prints as a
  per-invocation limit on that invocation, SHALL state the job's total spend so
  far and how many invocations have already run, and SHALL NOT describe the cap
  as a budget for the job.
- A job SHALL have a total wall-clock budget, **derived** from its per-type cap
  in `data/config.json` rather than separately configured, so that editing a cap
  cannot leave the two disagreeing. The multiple SHALL be the smallest one that
  leaves **the author and one review pass each their full per-invocation guard
  unconditionally** — a smaller multiple would let an author consume the budget
  a review must have, and a multiple as large as the number of invocations a job
  can make would bound nothing.
- Before each invocation the loop SHALL compute the job's remaining budget as
  its total minus the model-minutes already recorded against that job on the
  ledger plus those spent in the current run, and SHALL cap that invocation at
  the smaller of the per-type per-invocation cap and that remainder. This SHALL
  only ever lower an invocation's cap and never raise it: the per-invocation cap
  remains a runaway-process guard and keeps that meaning. Where the remainder
  falls below a minimum invocation length, the invocation SHALL NOT be started
  and the job SHALL be recorded `abandoned`, naming the spend, the total and the
  remainder. A bound that stopped a job *after* letting one more invocation run
  to its full cap would overstate itself by exactly one cap.
- `abandoned` SHALL NOT count toward the consecutive-failure breaker: a job that
  ran out of budget says nothing about whether its type is sound.
- A resumed job SHALL inherit its accumulated spend from the ledger and SHALL
  NOT receive a fresh allowance. Where a resumable branch's job has no budget
  left, the loop SHALL abandon it in the same sweep that abandons branches past
  the resumable age limit — before selection — rather than resuming it. The
  bound counts what the ledger records; a run whose process ends before writing
  its ledger line contributes nothing to it.

#### Scenario: The total is recoverable from the ledger

- **WHEN** a job completes after an author run, one revision and two review
  passes
- **THEN** its ledger record carries the model-minutes of each phase and their
  sum is the job's total spend

#### Scenario: A brief does not imply a budget it does not have

- **WHEN** a reviewer brief is assembled for the second review pass of a job
  that has already spent 20.9 model-minutes
- **THEN** the brief states the cap as this invocation's limit, states the 20.9
  already spent and the number of invocations so far, and calls the cap nothing
  else

#### Scenario: A revised job cannot spend its cap four times

- **WHEN** a job has spent its total budget across an author run, a revision and
  a review pass
- **THEN** the next invocation is not started, and the job is abandoned with a
  ledger line naming the exhausted budget

#### Scenario: A resumed job does not start again at zero

- **WHEN** a branch is resumable and the ledger records spend against its job id
  that leaves less than the minimum invocation length
- **THEN** the branch is not resumed, and an `abandoned` line is written naming
  the spend, the total and the remainder

#### Scenario: A job inside its budget is untouched

- **WHEN** a job makes an author run, two review passes and a revision, and
  their sum stays below its total
- **THEN** every invocation runs under the full per-type per-invocation cap and
  nothing is refused

# loop Specification

## Purpose
The Desk: the agentic loop that produces and maintains content under the
specs. It is budgeted for a consumer subscription, portable across model,
provider and harness by configuration, and structurally unable to publish
unreviewed work.

## Requirements

### Requirement: One job is one outcome with one merge or discard

The unit of Desk work SHALL be a **job**: one stated outcome with acceptance
checks, executed on its own branch, ending in exactly one merge or one
discard. Every job type carries a wall-clock cap: `data/config.json` maps
each job type to its cap, with defaults keyed by the type's tier (cheap-tier
types 30 minutes, frontier authoring types 60) — the caps are per-type, the
defaults are merely tier-derived; an executor still running at its
cap is killed and the job becomes `interrupted`. Nothing is ever
half-published: visitors SHALL only see merged, built work, and a job that
dies mid-run leaves a branch, not a broken page. After a merge, when
publishing is enabled, the loop SHALL publish through the same publish step
the Pulse uses (push, then live build-stamp verification — see `pulse`); if
it does not publish, the merged work reaches the live site at the next
Pulse run. Job types form a closed list:

- `interpret` — a Pulse-detected change needs judgment (what it means,
  whether it matters, how the changed line should read). Drawn from the
  derived queue's uninterpreted material changes (price/licence/status,
  trailing 14 days — see `pulse`); its output is an annotation line
  appended to the diff history (`data/changes.jsonl` stays append-only:
  the annotation is a new line keyed to the change it interprets), which
  the changed feed renders alongside the mechanical line.
- `verify` — re-verify a tutorial or a cited fact by actually executing or
  re-fetching.
- `entry` — mint a demanded wiki entry (identity, aliases, sourced facts —
  a stub for a thing no registry carries) or write/substantially revise an
  entry's prose. Registry ingest is not an `entry` job: the Pulse creates
  those stubs mechanically at zero inference cost.
- `tutorial` — write a new tutorial (subordinate to `verify` per
  `education-dynamic`).
- `post` — write a blog post.
- `education` — write or revise a static education page.
- `repair` — fix a broken link, failed listing, malformed record.
- `prune` — nominate and remove the weakest existing content.
- `machinery` — change the site's own code or the loop's own scripts.
- `scout` — the daily outward sweep (see "The scout looks outward, takes
  the best three, and records the rest"): find candidate stories in the
  world, rank them against the editorial bar, file at most three as
  expiring proposals, and record what was declined.

Adding a job type requires an OpenSpec change.

#### Scenario: A dead session leaves no visible damage

- **WHEN** a job's session is killed mid-work
- **THEN** the published site is unchanged; the branch remains for resumption
  or discard

### Requirement: Work comes from three sources and cannot self-amplify

Jobs are selected from, in priority order — with one stated exception,
below, for evidence that expires:

1. **The maintainer's directives** — a plain file (`DIRECTIVES.md`) the
   maintainer edits; always selectable first. Completion semantics: on
   completing a directive's job, the loop SHALL append a
   `[done <date> <job-id>]` marker to that directive's line and SHALL skip
   directives carrying one; removing finished lines is the maintainer's,
   at leisure. A directive is never silently re-run.
2. **The derived queue** — the Pulse's recomputed snapshot of what the site
   currently needs (see `pulse`). This source cannot backlog by construction.
3. **Proposals** — the only model-originated source. A proposal is one
   markdown file in `data/proposals/`, with front matter declaring: a date,
   a kebab-case `slug` naming the idea, the job type it proposes (from the
   closed list — a proposal proposes a job of an existing type, never a new
   kind of work), a one-paragraph summary, the evidence that prompted
   it, and optionally an `expires:` date for evidence that decays.
   Proposals come into existence three ways: a Desk run MAY end by
   writing at most one proposal as a side-output of whatever it noticed
   (the `scout` job is the exception: filing candidates is its outcome,
   governed by its own requirement and its own mechanical cap); a
   reviewer MAY note one in its verdict record (the loop transcribes it);
   the maintainer MAY drop one in directly. A proposal SHALL cool for at
   least 3 days (file age) before selection. A rejected proposal moves to
   `data/proposals/rejected/` with the rejection reason appended — that
   directory is the rejection index. Duplicate suppression is deterministic
   and exact: a new proposal whose `slug` equals a rejected proposal's
   `slug` SHALL be auto-discarded with a pointer to the earlier reason,
   spending no inference. That is the whole automatic mechanism —
   differently-worded resubmissions of a rejected idea are caught by the
   reviewer (the rejection index travels in the review checklist), not by
   fuzzy matching, because fuzzy matching is guessing.

"No qualifying job — do nothing" is a normal, healthy outcome and SHALL be
treated as such: a run that finds nothing worth doing ends without
manufacturing work.

**The producing side of source 3 is wired, not merely permitted:**

- Every brief the loop assembles SHALL state the proposal rule that binds
  its job — at most one, or the scout's own — restating the front-matter
  contract above, because a self-contained brief is the only channel a job
  has and an untold job cannot know.
- The review brief SHALL ask the reviewer to note a proposal where its
  review surfaced one, and the loop SHALL transcribe a noted proposal into
  `data/proposals/` as a well-formed proposal file naming the reviewing
  job as its origin.
- The caps SHALL be mechanisms: where a merged branch adds more proposal
  files than its job's rule allows, the loop SHALL keep the allowed number
  — by the job's own stated ranking where one exists, else by filename —
  and discard the rest with a note naming them. A proposal on a branch
  that is discarded dies with the branch: ideas do not outlive the
  rejection of the work that produced them.
- At merge, the loop SHALL stamp the proposing job's type onto each kept
  proposal, overwriting any value the executor wrote, and a proposal whose
  stamped origin type equals the type it proposes SHALL be auto-discarded
  on the same terms as a rejected-slug duplicate — with a pointer to this
  rule, spending no inference. The guard closes the tight loop, not every
  loop: a two-type cycle (`post` → `interpret` → `post`) remains possible,
  bounded by cooling at each hop and caught, where it is a re-tread, by
  the reviewer holding the rejection index. Cross-type noticing — an
  `interpret` job that has read three weeks of licence churn proposing a
  synthesis `post` — is the designed path. The maintainer's route is
  untouched: a file he drops in has no proposing job, so the rule cannot
  apply to it.
- A proposal declaring `expires:` SHALL be selectable without the 3-day
  cooling and SHALL NOT be selectable after its expiry; at expiry, an
  unselected expiring proposal SHALL be swept to `data/proposals/dropped/`
  mechanically, with a note naming the expiry. Cooling filters ideas by
  whether they survive three days; an expiry filters evidence by the date
  it stops being news — both are time-based honesty checks, and a
  candidate carries whichever one fits its evidence. No backlog carries
  forward: the sweep is what keeps the candidate directory from becoming
  the ten-weeks-of-backlog queue the predecessor's author track named as
  its own bottleneck.
- An expiring proposal SHALL outrank the derived queue: it is selected
  before source 2 and after the maintainer's directives. The reason is that
  an expiry is a **deadline the site set itself**, and source 2 has none —
  the derived queue is recomputed from current state, so an item it drops
  today it recomputes tomorrow, while expiring evidence that is not written
  before its date is swept and gone. Ordering the deadline-free source ahead
  of the deadline-bearing one spends the only thing that cannot be recovered.
  This SHALL NOT extend to proposals generally: a proposal with no `expires:`
  stays at source 3, behind the queue, because without a deadline there is
  nothing to preempt for. The upkeep floor and the new-writing ceiling are
  unchanged and still bind, so this reorders **which** work is reached first
  and never how much of each kind may run — an expiring proposal that would
  breach the new-writing ceiling is still refused.
- **That precedence is spent by a discarded attempt.** An expiring proposal
  whose last attempt was discarded SHALL rank at source 3 with the undated
  proposals, behind the derived queue, until it expires. It is a demotion and
  never a deletion: the candidate stays selectable, its expiry still sweeps it
  on time, and nothing about it reaches the rejection index — what a reviewer
  refused was the writing, not the idea. The reason is that a discarded job
  does **not** consume its proposal (a separate requirement, and correct), so
  without this the same candidate returns to the front of the queue on every
  run, unchanged, until it expires or three consecutive discards trip breaker
  1 and halt the Desk. Ranking proposals below the queue was what made a
  refused candidate self-limiting before this band existed; this restores
  exactly that spacing, and only for a candidate that has actually failed.

- `data/proposals/dropped/` is a **record, never a block**: unlike
  `rejected/`, it SHALL NOT feed automatic slug suppression, so a story
  declined today may be refiled when its stated refile condition arrives.

#### Scenario: An empty run is not a failure

- **WHEN** the directives file is empty, the derived queue has no item above
  its floor, and no proposal is ripe
- **THEN** the run records "nothing qualified" and ends, and nothing anywhere
  treats that as an error

#### Scenario: A rejected idea stays rejected

- **WHEN** a new proposal file carries the same `slug` as a proposal in
  `data/proposals/rejected/`
- **THEN** it is discarded automatically with a pointer to the recorded
  rejection reason, spending no inference

#### Scenario: A job's noticing becomes ripe work

- **WHEN** an `interpret` job's merged branch includes one proposal for a
  synthesis `post`, with slug, summary and evidence and no `expires:`
- **THEN** the proposal is stamped with the interpret job's type, lands in
  `data/proposals/`, and is selectable once it has cooled 3 days

#### Scenario: A job cannot propose more of itself

- **WHEN** a `post` job's merged branch includes a proposal whose type is
  `post`
- **THEN** the proposal is auto-discarded with a pointer to the
  self-amplification rule, spending no inference, and the job's merge is
  otherwise unaffected

#### Scenario: Expired news is swept, not queued

- **WHEN** a scout-filed candidate's `expires:` date passes with the
  candidate unselected
- **THEN** the next run sweeps it to `data/proposals/dropped/` with a note
  naming the expiry, and nothing anywhere treats that as a failure

#### Scenario: Dated news is written before routine upkeep

- **WHEN** the derived queue holds a repair item and a ripe proposal carrying
  an `expires:` date is also selectable
- **THEN** the expiring proposal is selected first, and the queue item is
  selected on a later run — the queue recomputes it, the expiry does not

#### Scenario: A proposal without an expiry does not jump the queue

- **WHEN** the derived queue holds a repair item and a ripe proposal carrying
  no `expires:` is also selectable
- **THEN** the queue item is selected first, exactly as before

#### Scenario: A refused candidate stops preempting the queue

- **WHEN** a job selected from an expiring proposal is discarded, and on the
  next run the derived queue holds a repair item and that same proposal is
  still ripe and unexpired
- **THEN** the queue item is selected first and the proposal is still a
  candidate, merely a later one — it was demoted, not dropped

#### Scenario: A refused candidate does not block the ones behind it

- **WHEN** two expiring proposals are ripe, the one with the sooner expiry has
  a discarded attempt recorded on it and the other has none
- **THEN** the one with no discarded attempt is selected first, even though its
  deadline is later

### Requirement: The loop is portable across model, provider, and harness

The maintainer MUST be able to start the loop as "model X, from provider Y,
using harness Z", choosing all three at start time, with no edit to specs
and no rewriting of prompts. Concretely:

1. **Entry point**: the loop starts with an ordinary command
   (`node loop/run.mjs`), optionally with `--runner <id>`. It is not a
   harness feature, a skill, or a slash command.
2. **Runner registry**: a checked-in `runners.yml` lists each
   model/provider/harness combination: id, `provider` (the subscription it
   spends — the lane key for capacity pausing), tier, the shell command
   template that invokes it, the roles it is cleared for (`author`,
   `reviewer`), and optionally `capacity_stderr_pattern`. Defaults are
   configuration; nothing else in the system names a model, provider, or
   harness.
3. **Executor contract**: an executor is anything that can (a) run to
   completion from one written prompt with no human input, (b) read and
   write files in a given directory, (c) run shell commands there, (d) stop
   on its own or be killed on a timeout, (e) leave its output as files. The
   loop MUST NOT require: memory across invocations, subagents, MCP, hooks,
   tool-calling APIs, structured output, a minimum context window, or any
   vendor's file layout.
4. **Briefs are self-contained plain markdown**: every brief carries the
   full task, acceptance checks, and the relevant spec excerpts; no brief
   references a prior conversation, a session, or harness-specific syntax.
5. **The loop computes the diff itself** from the branch state and never
   trusts an executor's account of what it changed.
6. **Instructions live in `AGENTS.md`** (the cross-harness convention);
   harness-specific files (`CLAUDE.md`, `.opencode/`) mirror it and never
   own content it lacks.
7. If a harness feature would improve a step, it MUST be layered as an
   optimization over a path that works without it.

#### Scenario: The advertised swap

- **WHEN** the loop ran yesterday as Claude Code + Anthropic + Opus and the
  maintainer starts it today with a runner entry for OpenCode + OpenCode
  Go + DeepSeek
- **THEN** the same command with a different `--runner` runs the same jobs
  under the same specs, with no file edited other than `runners.yml`

---

### PENDING AMENDMENT to `specs/loop` — in-flight change `flag-what-moved-the-frontier`
(full text: `D:/AddictedtoAI/openspec/changes/flag-what-moved-the-frontier/specs/loop/spec.md`)

This is a **delta**, not a capability spec: `## ADDED Requirements` and `## MODIFIED Requirements` blocks, restating only the requirements the change touches. It is not archived into the constitution above and does not replace it. Treat it as the pending intent for the requirements it names — where it MODIFIES one that also appears above, the amendment is the newer text.

### Requirement: The scout looks outward, takes the best three, and records the rest

The scout is the Desk job the daily queue item (see `pulse`) triggers. Its
charge, verbatim from the track that carried it on the predecessor site:
**bring back work the site could not have thought of by looking at
itself.**

- The scout SHALL sweep outward — the world beyond this repository and
  beyond the registered sources: vendor announcements and documentation,
  papers, incidents, pricing and licence pages, community signal — and MAY
  use the queue item's assembled feed context as one input among them. A
  scout run in which every filed candidate could have been written without
  leaving the repository SHALL be rejected in review as `spec-violation`
  naming this charge.
- **Every sweep SHALL look for frontier events across every domain**, against
  the criteria F1–F5 that `blog` defines: a first-shown capability with a
  checkable artifact, a lead change or a rescoring on a published index, a
  covered organisation's frontier release, a labelled-unverified vendor claim
  of a new ability, and a material change in access. It is a standing
  question asked on every run, not a mode entered on a good day: the surface
  the flag feeds shows the most recent flagged records per domain, so a domain
  nobody swept goes quiet without anybody deciding it should.
- Radar feeds — open-weights hubs, covered organisations' release feeds,
  preprint listings, source-release feeds — are **inputs to the sweep and are
  never displayed raw**. They exist to tell the scout where to look. Rendered
  directly they would saturate the surface immediately, which is the failure
  that made this a curated surface rather than a feed.
- The scout SHALL judge everything it found against the two-test bar
  (`editorial`: worth a stranger's attention; true, checkable, current)
  and SHALL file **at most three candidates per run — the most worthy
  three**, as expiring proposals. Each candidate SHALL carry the docket
  discipline: a kebab-case `slug`, a proposed job type from the closed
  list, an `expires:` date — at most 7 days out for an event-driven
  candidate, at most 14 for a synthesis — a why-now, externally retrieved
  evidence with URLs and retrieval dates, and done-when acceptance lines
  written at filing time.
- A candidate MAY additionally declare `frontier: true`, and when it does it
  SHALL carry the same bar a post carries: `frontier_reason`, exactly one of
  F1–F5, and every `domains` value it declares from the closed domain
  vocabulary. `domains` is optional here for the reason it is optional on a
  post — absence is the vocabulary's unmarked "general", not an unfilled field
  — so a frontier event with no modality is a candidate like any other.
  **A candidate declaring the flag with no valid criterion, or with a `domains`
  value outside the vocabulary, SHALL NOT be filed** — the flag is refused at
  filing, not discovered at build, because the flag's whole effect happens
  before any post exists.
- **A candidate carrying a valid `frontier: true` SHALL NOT count against the
  cap of three.** The exemption is from the count and from nothing else: an
  expiring flagged candidate cools, expires, is swept and is judged exactly as
  any other, and the new-writing ceiling in the budget requirement refuses a
  flagged candidate over the ceiling exactly as it refuses an unflagged one.
  The bar on the flag and the ceiling on the spend are both required and
  neither substitutes for the other.
- The cap SHALL be mechanical, not behavioral: at the scout's merge, the
  loop keeps at most three **unflagged** candidate files — by the scout's own
  stated ranking, else by filename — and every excess unflagged candidate is
  moved to the drop record rather than merged (the caps mechanism in the
  work-sources requirement). A candidate whose flag does not hold is not a
  flagged candidate: it is dropped at merge, with the reason named, and it
  does not silently rejoin the unflagged three.
- What the scout declines SHALL be recorded, never silently dropped: each
  considered-and-declined story becomes one record in
  `data/proposals/dropped/`, naming which test it failed and what would
  make it worth refiling. A story considered as a frontier candidate and
  declined SHALL name which criterion it was weighed against and why it
  failed — the surface's own claim is that it shows what other AI news sites
  do not, and the declines are the only record of where that line was drawn.
  Stated honestly, the way this repository states it about
  `would-cite`: the records prove the **form** of the bar, not
  its **rate** — nothing measures how many stories the scout considered,
  so a scout that sweeps forty sources and writes three drop records is
  mechanically indistinguishable from one that considered six. The bar
  itself is an instruction to a model, checked by a model-run review from
  its checklist; the records are what make that check auditable after the
  fact, and that is all they are claimed to do.
- A day with no external story that clears the bar SHALL open the
  **synthesis branch**: the scout considers whether the accumulated
  recorded evidence — the change feed, the snapshots, the corpus's data
  layer — supports a synthesis candidate instead. The branch opens an
  avenue and never lowers the bar: it is an opportunity, not an
  obligation, and a floor reintroduced through it would be the exact
  failure the no-cadence rule exists to prevent.
- When nothing clears the bar on either branch, the scout SHALL end with
  `RESULT.md` first line `blocked: nothing cleared the bar` — an honest
  outcome the ledger records as such, and a success. Zero candidates on a
  quiet day is the bar working; a candidate manufactured to fill a day is
  the failure. A quiet frontier is the same kind of outcome: nothing
  qualified is a finding, and a flag applied to fill a domain is the failure
  the criteria exist to prevent.
- **The blocked streak SHALL have a witness.** A `blocked:` scout outcome
  is a success everywhere it is counted — breakers exclude it, health
  streaks end on it — so nothing in the loop can distinguish a year of
  honest quiet from a bar nothing can clear. The build SHALL therefore
  derive, from `data/ledger.jsonl`, the count of consecutive scout runs
  ending `blocked:` (reset by any scout run that files a candidate) and
  record it in the published `/status.json` alongside the build stamp.
  Observability without obligation: no threshold, no floor, no breaker
  reads it — it exists so that a person or a later job can see the streak
  without excavating the ledger, and it obliges nothing.
- A scout run's diff — candidates and drop records, all model-written —
  SHALL pass the ordinary review gate before it merges, like every other
  Desk job's.

#### Scenario: A burst day is ranked, capped, and recorded

- **WHEN** a scout run finds five stories that each clear the bar
- **THEN** it files the three most worthy as expiring candidates, writes a
  drop record for each of the other two naming the judgment, and the merge
  enforces the cap mechanically if it files more

#### Scenario: A frontier story is filed beside a full docket

- **WHEN** a scout run has already filed three candidates and finds a fourth
  story that qualifies under F1–F5 in a domain the vocabulary carries
- **THEN** it files that story as a fourth candidate declaring `frontier: true`,
  its criterion and its domains, and the merge keeps all four — the cap counts
  the three unflagged ones

#### Scenario: A flag with no criterion is not filed

- **WHEN** a scout run files a candidate declaring `frontier: true` with no
  `frontier_reason`
- **THEN** the candidate is not filed, the merge drops it naming the missing
  criterion, and it does not take one of the three unflagged places

#### Scenario: An inward-looking scout is rejected

- **WHEN** a scout run's three candidates could all have been written from
  the repository's own contents, with no externally retrieved evidence
- **THEN** review rejects the run as `spec-violation` naming the charge —
  bring back what the site could not have thought of by looking at itself

#### Scenario: A quiet day opens the synthesis branch and still publishes nothing

- **WHEN** no external story clears the bar and the accumulated evidence
  supports no synthesis worth a stranger's attention either
- **THEN** the scout ends `blocked: nothing cleared the bar`, the ledger
  records it, no candidate is filed, and nothing anywhere treats the day
  as a failure

#### Scenario: A quiet domain is not filled to look busy

- **WHEN** a domain has had no qualifying event for weeks and the sweep finds
  only routine checkpoints and price moves in it
- **THEN** the scout flags none of them, records the declines against the
  criteria they failed, and the domain stays quiet — a flag applied to fill a
  domain is the failure the criteria exist to prevent

#### Scenario: A long quiet spell is visible without being punished

- **WHEN** fourteen consecutive scout runs end `blocked: nothing cleared
  the bar`
- **THEN** `/status.json` reports the streak of 14, no breaker trips, no
  floor opens, nothing selects differently — and anyone reading the
  published status can see the quiet without opening the ledger

#### Scenario: A quiet day yields a synthesis instead

- **WHEN** no single headline clears the bar but three weeks of recorded
  licence changes show a shape no single event shows
- **THEN** the scout files one synthesis candidate carrying the evidence
  set and an `expires:` at most 14 days out, through the same review gate

# loop — delta for flag-what-moved-the-frontier

One requirement modified. The scout's charge, its two-test bar, its docket
discipline, its drop records, its synthesis branch, its blocked-streak witness
and its review gate are all unchanged. What is added is
the standing frontier sweep, the candidate-level flag with the same bar the
post-level flag carries, and the exemption that makes the flag worth carrying —
mechanical at merge, like the cap it lifts.

Transcribed from `loops/ui-loop/graph/knowledge/DESK-ORDER-001.md` §1, keeper-
signed 2026-09-05: *"the daily sweep always looks for F1–F5 events across all
domains, using the radar feeds in §5 as inputs"*, and *"a story flagged
`frontier: true` does not count against the three-candidates-per-day cap; the
new-writing budget share (≤45%) still binds it; the flag must cite its
criterion or the candidate fails filing."*

The budget requirement is untouched: the new-writing ceiling still stands at
≤45% and still refuses `post` and `scout` work over it. The exemption lifts a
count, not a budget, and the reason it needs a budget behind it is that an
exemption with none invites flagging everything.

## MODIFIED Requirements

---

### From `specs/review` (full text: `D:/AddictedtoAI/openspec/specs/review/spec.md`)

### Requirement: Nothing model-written publishes unreviewed, and no run reviews its own output

Every job whose diff contains model-written or model-edited content (prose,
entry data changes beyond feed binding, machinery code) SHALL be reviewed
before merge. The reviewer SHALL be a separate invocation with a fresh
context and no edit rights — a different model where `runners.yml` clears
one for `reviewer`, otherwise the same model freshly invoked. "No edit
rights" is a mechanism, not an instruction: the loop SHALL discard any
change a reviewer invocation makes to the reviewed tree, and the only
output it accepts from a reviewer is the verdict record, written to a
designated path outside the reviewed worktree. The authoring run and the
reviewing run are never the same session; self-review is not review.

**The one exemption:** deterministic outputs of already-reviewed machinery —
Pulse feed refreshes, derived tables, computed banners, the derived queue —
publish without per-run review, because the machinery that produces them was
reviewed when it merged and they contain no model judgment. Anything a model
wrote in the run is never inside this exemption.

#### Scenario: Fresh eyes or no merge

- **WHEN** a job finishes with a diff containing model-written prose
- **THEN** the merge is blocked until a separate reviewer invocation returns
  an explicit verdict on that diff

#### Scenario: The Pulse publishes data without review

- **WHEN** the Pulse's scheduled run updates the model catalog from a feed
  and rebuilds
- **THEN** no review is required, because no model wrote anything in that
  run

### Requirement: What is checked depends on what the work is

The reviewer SHALL work from the checklist for the job's kind — reviewing a
wiki entry, a tutorial, and a machinery change are not the same job:

- **Wiki entry**: every cited fact has a reachable source and the source
  says what the fact says (fetch and confirm — do not assume); volatile
  values are transclusions or feed-bound, not literals; aliases sanely
  classed; prose adds something beyond the data.
- **Tutorial**: evidence the steps were actually executed (transcript or
  reproduced outputs) — plausibility is not verification; `subjects`,
  `verified_against`, `verified_on` complete and honest; unexecuted steps
  disclosed; perishables all declared.
- **Blog post**: every external claim source-checked by fetching; title and
  excerpt read against the body for overclaim; company-conduct claims held
  to the news-fact-checking standard; dates explicit. Additionally, the
  reviewer SHALL identify the post's form (news note or synthesis — see
  `blog`) and apply that form's finish line: for a note, the declared
  anchor holds (external anchors fetched and confirmed to document the
  event and its date), the affected party is named where one exists, and
  brevity alone is never a defect; for a synthesis, the derivation method
  is stated and the evidence enumerable. The reviewer SHALL judge the
  prose against the voice document `blog` names, rejecting
  `reads-as-generated` where it reads machine-made — the advisory voice
  lint's build warnings MAY be cited as evidence, but the judgment is the
  reviewer's, not the count's — and SHALL answer the
  send question in the record's `would-cite` field — who would send this,
  and to whom — in its own words.
- **Scout run**: the charge's failure condition applied first — a run
  whose candidates could all have been written without leaving the
  repository fails it; evidence URLs spot-checked by fetching; every
  candidate carries slug, type, `expires:`, why-now, retrieval-dated
  evidence, and done-when lines; every declined story has a drop record
  naming the failed test and a refile condition; at most three candidates
  filed.
- **Education page**: no perishable literals; prerequisites and the
  "after this you will understand" statement honest; beats the obvious
  alternative.
- **Directory/curated data**: spot-check changed rows against their sources.
- **Machinery change**: run the changed check or script and confirm the
  claimed behavior — red before, green after where applicable; every claim
  about what the change does verified by executing, not by reading; guard
  rails tested by attempting what they forbid.

For a job that originated from a proposal, the checklist additionally
includes the rejection index (`data/proposals/rejected/`): the reviewer
confirms the piece is not a differently-worded re-tread of a rejected
proposal — this is the judgment half of duplicate suppression, whose
mechanical half is the exact slug match in `loop`.

In every kind, the reviewer's standing instruction is: **for every claim
about what something does, run the cheap direct check; for every sourced
claim, confirm the source supports it.** The defect class this review exists
to catch is the claim written from intent rather than measurement — found
repeatedly by skeptical readers on the previous site and never once by an
automated check.

#### Scenario: The reviewer measures instead of reading

- **WHEN** a machinery diff claims "this makes X impossible"
- **THEN** the reviewer attempts X against the changed code and the verdict
  cites the attempt's observed result, not the diff's description

#### Scenario: A scout run is checked against its charge

- **WHEN** a scout run's diff arrives for review with three candidates and
  two drop records
- **THEN** the reviewer verifies the candidates carry externally retrieved,
  retrieval-dated evidence, spot-fetches it, and rejects the run as
  `spec-violation` if everything filed could have been written from the
  repository alone

### Requirement: A review record names the bytes it reviewed

A record that named only a *piece*, and never the *text* it judged, would leave
an approval surviving the thing it approved. The join in `lib/reviews.mjs`
matches a record to a piece by the canonical URL-derived filename, three
accepted alternates, or a front-matter subject key, and the merge gate then
checks that the record carries a verdict from the closed list and a non-empty,
non-duplicated `would-cite`. Every one of those checks would pass unchanged
after the reviewed text had been edited. Binding the record to the bytes is
what closes that gap.

Binding is done by the one step that already knows what landed — the loop's
merge step, which writes `subject:` for exactly this reason:

- On merging a job, the loop SHALL write into that job's verdict record a
  `reviewed:` mapping from each merged content path to the SHA-256 of that
  file's **reviewed surface**, derived from the same measurement of the branch
  that produces `subject:` — one measurement, two fields, so the two can never
  describe different diffs.
- A piece's **reviewed surface** SHALL be its prose body together with its front
  matter with every mechanically-maintained key removed, and the list of
  mechanically-maintained keys SHALL live in exactly one declared place in
  `lib/`. The exclusion is not a convenience: `pulse` appends dated lifecycle
  events to an entry's `timeline` mechanically, under the review exemption, so a
  hash over whole file bytes would mark every entry mismatched the first time
  the world changed a status — a guardrail that fires on its own machinery is
  noise, and noise is how a guardrail gets switched off.
- The set of paths in `reviewed:` SHALL equal the set of joinable content paths
  written to `subject:`, and the merge SHALL refuse a record where they differ,
  in the same place and on the same terms it refuses an `approve` with an empty
  `would-cite`.
- The value shape of `subject:` SHALL NOT change. It is read by nine accepted
  key names in `lib/reviews.mjs` and by hand-written records; carrying the hash
  inside it would break the join for every record that already exists, which is
  the opposite of the outcome this requirement is for.

A record with no `reviewed:` key is not invalid — every record written before
the merge began writing that key is one. It is a distinct, reported state,
defined in the next requirement.

#### Scenario: The merge binds the record to what it merged

- **WHEN** a job merges `content/wiki/org/moonshot-ai.md` with an approving
  verdict
- **THEN** the verdict record carries both `subject:` naming that path and
  `reviewed:` giving that path's reviewed-surface hash, written from the same
  branch measurement

#### Scenario: A mechanical timeline append is not an edit to reviewed text

- **WHEN** the Pulse appends a dated status event to an approved entry's
  `timeline` and nothing else in the file changes
- **THEN** the entry's reviewed-surface hash is unchanged and the record still
  reads as bound

#### Scenario: A record that names one thing and hashes another does not merge

- **WHEN** a verdict record's `reviewed:` paths differ from the joinable paths
  the merge measured for `subject:`
- **THEN** the merge refuses the record and names both sets

### Requirement: A reviewer's non-blocking finding reaches work without editing anything

The reviewer has no edit rights, as a mechanism rather than as an instruction:
its worktree is discarded unconditionally, so it cannot fix what it finds. That
is the property that makes review trustworthy, and it is also what puts every
finding the reviewer does not block on at risk of dying in a file nobody reads
again. Measured before either mechanism below existed: **19.5%** of `approve`
verdict records carried a finding the reviewer recorded but did not block on,
and roughly **30%** of those were never rescued by any means at all.

A finding therefore travels as **data written into the verdict record**, which
is the one artifact the reviewer both produces and is trusted to produce.

- A verdict record MAY carry a `carry:` block of zero or more entries, each with
  a `title`, a `detail`, and an optional `subject` naming the file the finding
  is about. Implemented by `parseCarry` in `loop/lib/verdict.mjs`; measured by
  the verdict parser's tests.
- A verdict record MAY carry a reviewer-noted **proposal**, on the same terms
  and for the same reason. This mechanism predates `carry:` and is what `carry:`
  was modelled on. Implemented by `transcribeNotedProposal` in
  `loop/lib/proposals.mjs`.
- Neither `carry:` nor a noted proposal SHALL affect the verdict itself. A
  reviewer that could turn a finding into a rejection by writing it in a
  different field would have been given, through the back door, the editorial
  power the discarded worktree exists to withhold. The verdict remains exactly
  the value drawn from the closed list, decided on the reasons the review
  requirement already names. Implemented by `parseVerdict` in
  `loop/lib/verdict.mjs`, which reads the two independently; measured by the
  verdict parser's tests.
- The reviewer's brief SHALL document both fields, because a mechanism a
  reviewer is not told about is a mechanism that does not run. Implemented in
  `loop/lib/review.mjs`; measured by the brief-text tests.
- A carried finding SHALL NOT be a second route to publication. It becomes a
  queue item and is then subject to every rule an item from any other source
  is: selection, budget, the review gate on whatever job takes it.

#### Scenario: An approval carries a finding it did not block on

- **WHEN** a reviewer approves a piece and records a finding it judged not worth
  blocking on
- **THEN** the verdict is `approve`, unchanged, and the finding is written into
  the record as a `carry:` entry rather than lost with the discarded worktree

#### Scenario: A finding cannot become a rejection by another name

- **WHEN** a verdict record carries `carry:` entries alongside an `approve`
- **THEN** the merge treats the verdict as `approve` and the entries change
  nothing about it

# review Specification

## Purpose
Mandatory review: every change the loop proposes and every piece of content
it produces is reviewed before it publishes. Review was the highest-value
part of the previous machinery — on one representative day nine review rounds
each found something real that no automated check had caught — and it is
designed here to be light enough that it never becomes the bottleneck that
stops entries shipping.

## Requirements

---

### PENDING AMENDMENT to `specs/review` — in-flight change `separate-a-claim-from-a-fact`
(full text: `D:/AddictedtoAI/openspec/changes/separate-a-claim-from-a-fact/specs/review/spec.md`)

This is a **delta**, not a capability spec: `## ADDED Requirements` and `## MODIFIED Requirements` blocks, restating only the requirements the change touches. It is not archived into the constitution above and does not replace it. Treat it as the pending intent for the requirements it names — where it MODIFIES one that also appears above, the amendment is the newer text.

### Requirement: A claim record is judged against the bytes of the source it quotes

A claim record is a verbatim quotation, a host, a date and a verification state,
transcribed by a model from a page the reviewer can fetch. Every one of those is
checkable, and each has a failure mode that a reader of the diff alone would
miss. Where a diff contains claim records, the reviewer SHALL additionally:

**The build can check every field of this record except the one that matters.**
`source_host` is a string comparison, `subject` is a corpus lookup, `accessed` is
a date, `verified: true` is a shape — all of them gates. `quote` is none of them:
verbatim-ness is a comparison against a document the build never fetches, and a
build that did fetch it would make every rebuild depend on a third party's
uptime and on the page not having changed since. So this one clause belongs to
the reviewer and to nobody else, and there is no gate to fall back on if the
reviewer skips it.

- **Fetch `source_url` and confirm `quote` is present in the fetched bytes,
  verbatim.** Plausibility is not verification. The instrument SHALL be ruled out
  before absence is concluded — inflate compressed streams and read
  parenthesised text literals, expect ligatures and escaping, and search
  fragments that straddle neither. A quote that is genuinely absent from the
  document is `false-or-unsupported-claim`; a quote absent from one representation
  of a document is a misattribution to be traced before it is called anything
  worse.
- **Confirm `source_host` equals the host of `source_url`,** and judge the vendor
  test's *input* rather than its output: is this host really a place the subject
  publishes from? The check itself is mechanical, but what it compares against is
  a declaration somebody made, and a wrong `publishes_from` value attributes a
  stranger's words to a named company. Where the diff adds a `publishes_from`
  value, the reviewer SHALL confirm the domain independently and say how.
- **Read `verified` for what it asserts.** A record claiming more than was done
  is `intent-not-measurement`: `verified: {by, url, date}` requires that the named
  document actually supports the confirmation, fetched and confirmed, not
  described. A `verified: false` requires that a check happened and failed, and
  the reviewer SHALL reject a `false` written as a placeholder for "nobody
  looked" — absence is how that is spelled, and the difference is the whole point
  of the three states.
- **Check that nothing in the diff turns a fact into a claim.** A cited fact
  moved into a claim record, or a claim record filed for a value that is a
  measurement by a third party rather than an assertion by the subject, is
  `spec-violation` against the requirements in `wiki` — and it is the specific
  defect this record type was created to end, found twice in shipped work by two
  independent builders.

The standing instruction is unchanged and applies here in its sharpest form: for
every claim about what something does, run the cheap direct check; for every
sourced claim, confirm the source supports it. A claim record is the one content
shape in this corpus whose entire content is a sourced claim.

#### Scenario: The quote is confirmed against the document, not the diff

- **WHEN** a diff files a claim record quoting a vendor's launch post
- **THEN** the reviewer fetches that post and the verdict cites the fetch and
  what was found in it, not the record's own description of the source

#### Scenario: A verification state that outruns the work is rejected

- **WHEN** a record declares `verified: {by, url, date}` and the named URL does
  not support the claim
- **THEN** the reviewer returns a non-approval citing `intent-not-measurement`,
  naming the record and the URL

#### Scenario: A placeholder negative is not a finding

- **WHEN** a record declares `verified: false` and nothing in the diff or the
  job's evidence shows that a check was attempted
- **THEN** the reviewer requires the key removed rather than left, because absent
  means nobody looked and `false` means somebody looked and failed

#### Scenario: A measurement filed as a claim is a spec violation

- **WHEN** a diff files a claim record whose source is a third party's
  measurement of the subject's product rather than the subject's own statement
- **THEN** the reviewer returns a non-approval citing `spec-violation`, naming
  the requirement in `wiki` that a claim is the subject's own only when the
  source is
