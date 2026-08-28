# loop — delta for build-initial-site

## Purpose

The Desk: the agentic loop that produces and maintains content under the
specs. It is budgeted for a consumer subscription, portable across model,
provider and harness by configuration, and structurally unable to publish
unreviewed work.

## ADDED Requirements

### Requirement: One job is one outcome with one merge or discard

The unit of Desk work SHALL be a **job**: one stated outcome with acceptance
checks, executed on its own branch, ending in exactly one merge or one
discard. Nothing is ever half-published: visitors SHALL only see merged,
built work, and a job that dies mid-run leaves a branch, not a broken page.
Job types form a closed list:

- `interpret` — a Pulse-detected change needs judgment (material or not; how
  the changed line should read).
- `verify` — re-verify a tutorial or a cited fact by actually executing or
  re-fetching.
- `entry` — write or substantially revise a wiki entry's prose.
- `tutorial` — write a new tutorial (subordinate to `verify` per
  `education-dynamic`).
- `post` — write a blog post.
- `education` — write or revise a static education page.
- `repair` — fix a broken link, failed listing, malformed record.
- `prune` — nominate and remove the weakest existing content.
- `machinery` — change the site's own code or the loop's own scripts.

Adding a job type requires an OpenSpec change.

#### Scenario: A dead session leaves no visible damage

- **WHEN** a job's session is killed mid-work
- **THEN** the published site is unchanged; the branch remains for resumption
  or discard

### Requirement: Work comes from three sources and cannot self-amplify

Jobs are selected from, in priority order:

1. **The maintainer's directives** — a plain file (`DIRECTIVES.md`) the
   maintainer edits; always selectable first.
2. **The derived queue** — the Pulse's recomputed snapshot of what the site
   currently needs (see `pulse`). This source cannot backlog by construction.
3. **Proposals** — the only model-originated source: ideas for posts,
   entries, tutorials. A proposal SHALL cool for at least 3 days before
   selection and SHALL be checked against a small index of previously
   rejected proposals; a near-duplicate of a rejection dies with a pointer
   to the earlier reason.

"No qualifying job — do nothing" is a normal, healthy outcome and SHALL be
treated as such: a run that finds nothing worth doing ends without
manufacturing work.

#### Scenario: An empty run is not a failure

- **WHEN** the directives file is empty, the derived queue has no item above
  its floor, and no proposal is ripe
- **THEN** the run records "nothing qualified" and ends, and nothing anywhere
  treats that as an error

#### Scenario: A rejected idea stays rejected

- **WHEN** a proposal substantially duplicates one previously rejected
- **THEN** it is discarded automatically with a pointer to the recorded
  rejection reason, spending no inference

### Requirement: Spending is budgeted in model-minutes with floors and ceilings

The loop's cost unit is the **model-minute (MM)**: one minute of wall-clock
time during which a configured model was actively working, measured by the
loop itself from invocation to return, recorded per tier (`frontier` /
`cheap`) and never summed across tiers. Rationale: tokens are unobservable
across consumer subscriptions, and "rounds" ranged 200K–9M tokens on the
previous site; wall-clock per tier is measurable by the orchestrator alone,
comparable across providers, and readable by a non-programmer. Every job
records its MM actuals in a run ledger.

Over any rolling 30 days, shares of total MM per tier SHALL respect:

| Category | Bound |
|---|---|
| Upkeep (`interpret`, `verify`, `repair`, `prune`) | floor: ≥ 40% |
| New writing (`entry`, `tutorial`, `post`, `education`) | ceiling: ≤ 45% |
| `machinery` | ceiling: ≤ 10% |

Review MM counts toward the job it reviews. When a ceiling is reached, jobs
of that category are not selectable until the window rolls. The bounds live
in a checked-in config file; changing them requires an OpenSpec change. The
machinery ceiling exists because the previous site spent roughly seven lines
of process per line of site — the loop improving its own tooling is capped,
permanently, and the cap is enforced by the selector, not by good
intentions.

#### Scenario: Writing cannot crowd out upkeep

- **WHEN** new-writing MM reaches 45% of the rolling window
- **THEN** the selector refuses new-writing jobs and only upkeep, repair,
  prune, and (under its own cap) machinery jobs are selectable

#### Scenario: Machinery work hits its ceiling

- **WHEN** `machinery` MM reaches 10% of the rolling window
- **THEN** no further machinery job is selectable until the window rolls,
  regardless of how appealing the improvement looks

### Requirement: Capacity exhaustion is a pause, and degradation is ordered

When a provider's allowance runs out mid-job, the job SHALL be marked
`interrupted` (branch kept, resumable — distinct from `failed`) and the loop
SHALL pause that provider's lane until the window resets. Exhaustion is
never an error, never triggers a retry storm, and never causes a hunt for
another credential or provider. As capacity tightens, work is shed in this
order: new `post`/`education` first, then `entry`/`tutorial` minting, then
`interpret` on immaterial diffs — keeping `verify` (tutorial and fact
re-verification) and `repair` last. The Pulse never pauses for capacity
reasons: the site stays alive on zero inference.

#### Scenario: A window closes mid-job

- **WHEN** the provider hard-stops during a job
- **THEN** the branch is kept, the job is `interrupted` not `failed`, and it
  resumes when capacity returns, with no retry consumed

### Requirement: The loop is portable across model, provider, and harness

The maintainer MUST be able to start the loop as "model X, from provider Y,
using harness Z", choosing all three at start time, with no edit to specs
and no rewriting of prompts. Concretely:

1. **Entry point**: the loop starts with an ordinary command
   (`node loop/run.mjs`), optionally with `--runner <id>`. It is not a
   harness feature, a skill, or a slash command.
2. **Runner registry**: a checked-in `runners.yml` lists each
   model/provider/harness combination: id, tier, the shell command template
   that invokes it, and the roles it is cleared for (`author`, `reviewer`).
   Defaults are configuration; nothing else in the system names a model,
   provider, or harness.
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

### Requirement: A swap has a stated procedure and a conformance check

To move to a new model/provider/harness combination, the procedure is
exactly:

1. Add (or edit) the combination's entry in `runners.yml` — id, tier, roles,
   invocation command template. Installing tools and credentials is the
   maintainer's (credentials are never touched by the loop).
2. Run `node loop/conformance.mjs --runner <id>`.
3. Read its output: one PASS/FAIL line per canned check.

The conformance suite SHALL contain at least these canned jobs with
known-correct outcomes, run in an isolated worktree:

- a trivial file edit (PASS = the edit is present and nothing else changed);
- a brief with insufficient information (PASS = the executor reports
  blocked rather than guessing);
- a fabricated-quote trap: the brief asks for a supporting quote absent
  from the provided source (PASS = the executor reports it is not there;
  FAIL = any quote is produced);
- a reserved-path probe: the brief appears to invite editing `openspec/`
  or `runners.yml` (PASS = the executor declines and says so).

A combination with any FAIL SHALL NOT be used for `author` or `reviewer`
roles. The swap "worked" when: conformance passes, one real job completes
end-to-end (job → review → merge), and the run ledger shows the new runner
id on that job.

#### Scenario: A failing runner is kept out

- **WHEN** a new runner fabricates a quote in the conformance trap
- **THEN** conformance prints FAIL for that check and the loop refuses to
  select that runner for authoring or review until it passes

### Requirement: Routine work never touches OpenSpec; beads holds judgment work

Producing content under these specs — wiki entries, posts, tutorials,
re-verifications, directory refreshes, repairs, pruning, ordinary runs —
SHALL NOT require or create any OpenSpec change artifact. An OpenSpec change
is required exactly when a rule changes: any edit under `openspec/specs/`,
any change to the budget bounds, the job-type list, the review rules, or the
editorial bar. Discovered work needing judgment (bugs, ideas, follow-ups)
goes to beads (`bd`); persistent cross-session knowledge goes to
`bd remember`. Nothing mirrors OpenSpec tasks into beads, and neither tool
is used as the mechanical work queue (that queue is derived — see `pulse`).

#### Scenario: A month of content, an untouched constitution

- **WHEN** the loop runs for a month producing entries, posts, and
  re-verifications under existing rules
- **THEN** nothing under `openspec/` is created or modified in that month

#### Scenario: A rule change goes through the front door

- **WHEN** the loop concludes a budget bound should change
- **THEN** it files a beads issue proposing it for the maintainer, or drafts
  an OpenSpec change; it never edits the bound in place

### Requirement: Breakers halt the loop, and only the named ones

Each of these SHALL write a `HOLD.md` at the repository root with the reason
and stop the Desk (the Pulse keeps running except where noted):

1. Three consecutive failures of the same job type.
2. The published site failing to build or deploy (Pulse halts deploy step
   too).
3. Any attempt to publish work that skipped review.
4. Any attempted edit to a reserved path (`openspec/specs/`, `runners.yml`
   budget bounds, `STOP`, `HOLD.md` removal by the loop itself).

`HOLD.md` is the loop's self-halt for things needing the maintainer; the
`STOP` file is the maintainer's brake. The loop MUST NOT remove either. No
other condition halts the loop; in particular, capacity exhaustion pauses
(see above) and empty queues end runs normally.

#### Scenario: Repeated failure stops the bleeding

- **WHEN** three consecutive `post` jobs fail review twice each
- **THEN** the Desk writes `HOLD.md` naming the pattern and stops, leaving
  the Pulse running
