# Job j-20260904-39 — `machinery`

You are working alone, unattended, in a git worktree checked out on branch
`job/j-20260904-39`. Everything you need is in this file and in the repository around
you. There is no prior conversation to recall and no session to resume.

- **Branch**: `job/j-20260904-39`
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
- **Work source**: directive (DIRECTIVES.md line 58)

## The outcome

make a gate failure say what kind of failure it was, and stop counting transport failures as defects. THIS HAS NOW COST REAL WORK TWICE IN ONE CHAIN, on 2026-09-04: job `j-20260904-38` authored its repair successfully (7.96 model-minutes, author outcome `done`), then its gate run failed and the whole job was recorded `failed` and its branch left unmerged — and the closing six-gate pass failed the same way minutes later. Neither was a defect. Re-run alone with nothing else on the machine, the same suite passed 1201/1201. `loop/run.mjs:357` ends a failed gate run with the flat note `gates failed`, and `loop/lib/breakers.mjs:64` counts by outcome alone, so three such runs trip breaker 1 and halt the entire Desk on nothing. THE CAUSE IS KNOWN AND SO IS THE SIGNAL: on Windows this machine exhausts ephemeral ports under concurrent load and loopback fetches fail with `connect EADDRINUSE` (`addictedtoai-ar0`); `pulse/tests/helpers.mjs:196` already throws an error whose text contains the literal phrase `This is a TRANSPORT failure, not a logic failure`, and `gateResult.output` is already captured and already passed into `finish`, so the information needed is in hand at the exact point of the decision. THE FIX: when a gate failure's captured output contains that marker, RUN THE GATES ONCE MORE. If the retry passes, the run continues normally and nothing is recorded as a failure. If the retry fails too, record `failed` exactly as today. This deliberately needs no new outcome and no change to breaker semantics, so `specs/loop`'s breaker requirements are untouched — and a real defect still fails twice, which is the property that makes the retry safe. Key on the marker the code actually emits; do NOT pattern-match `EADDRINUSE` or any other guessed error string, because the whole point of the marker is that the emitting code knows what it saw and a downstream string match does not. Retry ONCE, never in a loop. Prove it by mutation as this repository requires: a fixture whose gate output carries the marker must be retried, one whose output does not must not be, and a marked failure that fails its retry must still end `failed`. Written by the orchestrator, not the maintainer.


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

# loop Specification

## Purpose
The Desk: the agentic loop that produces and maintains content under the
specs. It is budgeted for a consumer subscription, portable across model,
provider and harness by configuration, and structurally unable to publish
unreviewed work.

## Requirements

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
