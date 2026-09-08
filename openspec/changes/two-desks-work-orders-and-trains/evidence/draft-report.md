DRAFT DIGEST — addictedtoai-7z07
"Override the Desk budgets by authorisation, and unify the Desk queue with beads"
Draft change: openspec/changes/give-every-job-a-bead-and-let-one-pass-the-bounds/
Branch: impl/spec (worktree D:/addictedtoai-worktrees/impl-spec no longer exists;
files extracted via `git show impl/spec:...` into scratchpad draft-proposal.md,
draft-specs_loop_spec.md, draft-tasks.md). TABLED 2026-09-06, nothing implemented.

================================================================================
A. WHAT THE DRAFT PROPOSES
================================================================================

--- A1. THE OVERRIDE MECHANISM ---

1. New tracked root file `OVERRIDE.md`, added to `RESERVED_PATHS` in
   `loop/lib/brief.mjs` (breaker 4's list) on the same footing as
   `data/config.json` and `runners.yml` — a job's edit to it trips the
   reserved-path breaker and writes `HOLD.md` via the ordinary
   `reservedPathViolations` channel (no new detection code needed because the
   file is tracked, unlike gitignored `STOP`).

2. One override = one line: `- <bead-id>: lift <lift>[, <lift>…][ — prose]`.
   Names exactly one bead id, and through it exactly one job — the candidate
   whose own `bead` field (not its `issues` join list) equals that id.
   Malformed lines (no id, two ids, unknown lift) are ignored with a loud
   warning every run, never guessed at.

3. Closed list of four lifts, each naming the selector rule(s) it maps to
   (`loop/lib/override.mjs`'s `LIFTS` map):
   - `machinery-ceiling` → `budget:machinery-ceiling`
   - `new-writing-ceiling` → `budget:new_writing-ceiling`
   - `upkeep-floor` → `budget:upkeep-floor`
   - `capacity-shed` → `degradation:shed`, `degradation:interpret-material-only`
   Never-lift list (closed by omission from the map, not a separate check):
   review gate, any breaker, build/test gates, reserved paths, lane pause,
   conformance/health refusal, per-invocation wall-clock cap, job's total
   budget. No blog-cap entry because that cap no longer exists.

4. Consumption is at SELECTION, not merge: loop appends
   `[used <local date> <job-id>]` to the line (pattern of `markDirectiveDone`),
   skips marked lines forever, commits the file with the run's records.
   Rationale: spend happens whether or not the job later merges, so a
   discarded attempt has used its authorisation.

5. `.job/source.json` on the branch records `{line, bead, lifts}` so a
   resumed run reproduces the same ledger record without re-reading a file
   the maintainer may have edited meanwhile. Every ledger line of the job
   carries an additive/optional `override` key: `{bead, lifts, lifted, line}`.

6. Reconciliation/exclusion step in `tierShares()` (`loop/lib/budget.mjs`):
   spend on any ledger line whose `override.lifted` names a `budget:*` rule is
   excluded from BOTH the category numerator and the tier's total denominator
   before any share is computed — the drafter measured (worked table in
   proposal.md) that excluding from the numerator alone lets nine 40-MM
   overrides push upkeep to 38.6% (under its 40% floor) while dropping
   machinery to 8.7% (reopening the ceiling to unauthorised work) — a side
   door. Excluding from both leaves every other share exactly where it was.
   A shed-only lift (not a `budget:*` rule) counts as ordinary spend. The
   shares object gains `excluded_mm` / `excluded_lines`; every refusal and the
   run's printed budget line states the excluded amount, so the number shown
   is never smaller than what the subscription actually paid.

7. Selection-time attach: `attachOverrides(candidates, overrides, {beadStatus})`
   in `loop/lib/select.mjs`. Before selection, dry-run included, the loop
   `showBead`s every pending override's target and ignores (with a warning
   naming the close reason) an override on a closed bead. Exactly one matching
   candidate → attaches; zero → "waiting" note, not consumed; more than one →
   warning naming all, attached to none. Attaching changes ELIGIBILITY only,
   never PRIORITY — a candidate ahead of the named one in source order is
   still picked first if eligible. A lifted refusal is still recorded and
   printed (marked `LIFTED by OVERRIDE.md:<line>`) with its full arithmetic.

8. Helper: `node scripts/bd-desk.mjs create --type … --title … --acceptance …`
   prints the minted bead id, a ready-to-paste `[bead <id>]` directive marker,
   and a ready-to-paste `OVERRIDE.md` line — because an override can only name
   a bead that already exists, and a directive/proposal the Desk has never
   selected has none yet. So the maintainer's path to override a job the
   bounds have already refused is "two written acts, no waiting": mint the
   bead, paste the override line (routing it directly is also possible; the
   marker is only needed for the DIRECTIVES.md path).

9. `data/config.json` was explicitly considered and rejected as the
   override's home ("must not be a way to change the bounds... a one-shot
   grant living in the bounds file blurs the line").

10. Open question flagged by the drafter (WHO MAY WRITE OVERRIDE.md): the
    mechanism can't distinguish maintainer from orchestrator commits (both
    land under the maintainer's git account; the reserved-path breaker only
    fires on a JOB's branch diff). Left as a STANDING-AUTHORITY.md policy
    question, not resolved in the draft.

--- A2. THE BEADS UNIFICATION (Part B) ---

1. Every Desk job gets exactly one `bead` field, DISTINCT from the existing
   `issues` list (harvested/declared ids a job merely references in passing).
   Source-dependent resolution order in `resolveBead()`
   (new `loop/lib/beads.mjs`), run in `loop/run.mjs` before `addWorktree`:
   - routed bead → itself
   - directive → `[bead <id>]` marker (bracket form, sibling of `[done …]`),
     else the loop mints and writes the marker back
   - proposal → `bead:` front-matter key, else a single-id `issue:` key, else
     mint and stamp `bead:` via `setFrontMatterKeys`
   - derived-queue item → an existing open/in_progress/deferred bead
     previously minted for the same `desk_subject` (= `reason:subject`,
     exposed by `readQueue`), else mint

2. Minting happens ONLY in the loop AT SELECTION — never in a job (conflict
   of interest: a job filing its own bead is a job declaring its own work),
   never in the Pulse (must stay byte-identical on unchanged state; `bd`
   mints non-deterministic ids).

3. Claim ordering (revised after first review): claim happens AFTER the
   branch/brief/`.job/source.json` are committed, not before — so a claim
   failure leaves a branch with a committed brief and no ledger line, which
   `loop/lib/resume.mjs` already treats as resumable; the next run
   re-asserts the same claim under the same job id. (First draft claimed
   before the branch existed and would have wedged runs on a failure between
   the two steps — fixed per review round 1.)

4. A closed declared bead makes its directive/proposal unselectable — warned
   every run with the close reason — until the marker is removed or bead
   reopened. This narrows (but doesn't fully fix) the `addictedtoai-fa8a`
   starvation: a directive whose job ended `blocked` gets its minted bead
   closed, so the line is warned rather than re-run at full cost every run.

5. Closure at merge, VERIFIED by reading the tracker back, not trusting exit
   codes: `mergeLocal` → pre-read (must be `in_progress` under this job's
   claim) → `bd close` with reason (job id, merge commit, artifacts) + a
   separate `bd update --append-notes "closed by job <id>"` (notes survive a
   reopen; close_reason may not) → post-read (must show `closed` + the note)
   → `recordOutcome`. A bead already closed at the pre-read is "unverified by
   construction" regardless of what the close command then reports.

6. Unverified closure: ledger line gets `signal: bead-unclosed`, no crash,
   outcome stays `done`; the loop's OWN publish step is skipped (measured
   fact, corrected after first review: `pulse/lib/publish.mjs` phase 2 never
   reads `bd`/ledger, is gated only by the `publish` flag/HOLD.md/blocked
   commit, and the next scheduled Pulse run publishes the merge regardless —
   so this withholds exactly one push, not the whole path to the remote).
   `retryUnverifiedClosures()` retries on every later run; `verify-launch.mjs`
   gains a `beads` section that FAILS any `done` ledger line whose bead lacks
   THIS job's `closed by job <id>` note (a self-closed bead by the executor
   is never retried/annotated — fails the gate until the maintainer reopens
   it by hand). Skips loudly if `bd` unreachable (build never depends on it).

7. Non-merge outcome mapping into the bead, split by WHO filed it:
   - Routed (`desk-job`, person-filed): `blocked` → bead status `blocked`
     (drops out of `bd ready` until a person acts — matches "blocked" meaning)
   - Minted (`desk-run`, loop's own record): `blocked` → bead CLOSED with the
     outcome line as reason (a scout's routine `blocked: nothing cleared the
     bar` must not leave one open bead per quiet day)
   - Both kinds: `failed`/`discarded`/`abandoned` → reopened `open`, reasons
     appended, `--defer +3d` (matches discarded-proposal spacing);
     `interrupted`/`capacity` → claim left in place, branch resumes it.
   - Both abandon sweeps (14-day stale-branch, and a new orphaned-claim sweep
     for `desk-run` beads `in_progress` with no live branch/ledger line) write
     the bead themselves since they bypass the normal outcome tail.

8. Beads as a fourth work source: label `desk-job` (deliberately NOT `desk`,
   which already means "about the Desk" on a triage bead and would
   accidentally route bug reports). Required fields: metadata `desk_type`
   (closed job-type list), non-empty description, non-empty
   `acceptance_criteria`, optional `desk_target`. Missing/invalid fields →
   skipped with a loud warning naming bead+field, never guessed. Ranked in
   the band directly below directives, above expiring proposals (see B
   below). Gated by the SAME gate list as directives/queue items (ceiling,
   floor, shed, tutorial gates) — a routed `machinery` bead needs an override
   exactly like a machinery directive would. Claimed via `bd update --claim`
   (atomic; `bd ready` excludes in_progress so two runs can't double-take).

9. New helper script `scripts/bd-desk.mjs`: `create` (validates through
   `JOB_TYPES` and the shared `routedBeadDefects()` predicate before calling
   `bd create`, then prints id + `[bead <id>]` marker + override line) and
   `lint` (lists every `desk-job` bead the selector would refuse and why).
   Explicitly NOT a `bd formula`/`bd mol` (those template multi-step
   molecules; a Desk job is one issue) and NOT `bd lint` (checks description
   sections by issue type, can't validate a metadata value against a closed
   list). The exported predicate `routedBeadDefects()` in `loop/lib/beads.mjs`
   is shared by both the selector and the helper so "the selector's predicate
   is the gate, and nothing else is" — a bead filed by hand or by another
   agent, without the helper, is selectable exactly when it satisfies the
   same predicate.

10. `loop/lib/beads.mjs` (new) is declared the ONE module that ever invokes
    `bd` — moves the spawn-without-shell resolver out of
    `scripts/verify-issue-links.mjs`, passes `--sandbox` on every call
    (disables Dolt auto-push — belt-and-braces alongside the rule that
    nothing in the loop runs `bd dolt push`). A static test asserts no file
    under `lib/` or `scripts/prebuild.mjs` imports it or spawns `bd` — keeps
    the build (Vercel, no `bd` binary) untouched. `loop/lib/issues.mjs`
    (pure, format-only) is explicitly left untouched and does not import
    from the new module.

11. `bd` unreachable at minting/claim time → the run selects NOTHING, exits
    with the same refusal code a refused runner gets (exit 2), no `HOLD.md`
    — a refusal, not a halt.

12. Drafter measured `bd`'s actual CLI surface before designing (via
    `--help` and a dry-run create) rather than assuming: confirmed
    `--sandbox`, `--claim`, `--defer`, `metadata` (free-form JSON but reads
    back as a STRING — `"metadata": "{}"` on 81/266 beads, absent on 185),
    no `defer_until` in any observed JSON, no formulas defined in this repo.
    Several `bd` semantics (does `--claim --actor` key the actor; does a
    second claim under a different actor fail; does `close` on an
    already-closed issue fail or no-op; does `close_reason` survive a
    reopen; does non-empty `metadata` round-trip through `ready --json`)
    are flagged UNMEASURED and deferred to task 9 ("measure first" against a
    real `bd` in a throwaway store, before the mock used by tests is built).

================================================================================
B. REQUIREMENT HEADINGS THE DELTA ADDS / MODIFIES / REMOVES (specs/loop/spec.md)
================================================================================

ADDED (6):
1. "An authorised override spends once outside the bounds and moves none of
   them" — the whole OVERRIDE.md mechanism: reserved path, one-line format,
   closed lift list, never-lift list, consumed-at-selection, ledger `override`
   key, dry-run reporting.
2. "Every Desk job is the work of exactly one bead" — bead resolution order
   per source, closed-bead-blocks-selection rule, minted-bead metadata shape,
   write-back to directive/proposal, claim-after-branch-commit ordering,
   orphaned-claim sweep, `bd`-unreachable refusal, single-module (`beads.mjs`)
   invocation rule.
3. "A merged job closes its bead, and closure is verified" — close-at-merge
   with pre/post read verification, `signal: bead-unclosed` on failure to
   verify + no self-publish, retry-on-later-runs, outcome→bead-status mapping
   split by routed vs minted label, `verify-launch.mjs` closure-note gate, a
   job may never close/reopen/relabel its own bead.
4. "A routed bead is a work source, filed through one helper" — `desk-job`
   label semantics, required-field predicate `routedBeadDefects`, same gate
   list as a directive, retires nothing else on merge, `scripts/bd-desk.mjs`
   as the (non-exclusive) filing helper.
5. "Work comes from four sources and cannot self-amplify" — re-added under a
   truthful heading (see REMOVED below); same body as live "three sources"
   requirement plus the new routed-bead band inserted as priority band 2
   (between directives and expiring proposals), cross-references renumbered,
   one scenario WHEN widened ("An empty run is not a failure" now also
   requires no routed bead ready).
6. "The ledger line carries the bead, and the join beside it" — re-added
   under a truthful heading (see REMOVED below); requires ledger lines that
   record any invocation to carry a REQUIRED `bead` key (single id) in
   addition to the existing optional `issues` list, with the bead also
   appearing inside `issues`; `LEDGER_FIELDS` deliberately NOT extended
   (so the schema stays additive and old lines stay valid); a sweep line
   for a pre-beads branch may still omit `bead`.

REMOVED (2) — both renamed via the REMOVED+ADDED device because
`check-spec-deltas.mjs --strict` cannot resolve a same-delta RENAMED-TO
target for a MODIFIED heading (a tooling limitation the drafter documents
explicitly, see section D below):
1. "Work comes from three sources and cannot self-amplify" — reason: a
   fourth source (routed beads) makes the heading's count false; re-added as
   item 5 above, every scenario kept, one WHEN widened.
2. "The ledger line carries the join, as a list, additively" — reason: the
   live body's "Routine upkeep writes no key" scenario asserts the opposite
   of the new required-`bead` rule; re-added as item 6 above, every other
   clause carried over.

MODIFIED (6):
1. "Spending is budgeted in model-minutes with floors and ceilings" — gains
   the override-exclusion arithmetic: `budget:*`-lifted spend excluded from
   both numerator and denominator of `tierShares()`; shed-only-lifted spend
   counts normally; warm-up comparison reads the excluded total; shares
   object carries `excluded_mm`/`excluded_lines`, printed on the budget line.
   Two new scenarios (authorised job spends outside the shares; shed-only
   override still inside budget).
2. "Breakers halt the loop, and only the named ones" — breaker 4's reserved-
   path list gains `OVERRIDE.md`; clarifies the loop's own `[used …]` marker
   write is not a job's write and doesn't trip the breaker; the "no other
   condition halts" sentence now also names a `bd`-unreachable refusal as a
   pause-not-halt. New scenario: a job editing OVERRIDE.md trips breaker 4.
3. "Routine work never touches OpenSpec; beads holds judgment work" — drops
   the live sentence "neither tool is used as the mechanical work queue
   (that queue is derived — see pulse)"; replaces it with: the derived queue
   stays the mechanical queue; a bead becomes Desk work only when a person
   routes it (routing label + required fields); a loop-minted bead is a
   record of its job and never a queue of its own. New scenario: an unrouted
   bead is not selected however high its priority.
4. "A budget refusal states the arithmetic it refused on" — gains: excluded
   spend (amount + line count) stated in a refusal so it reconciles against
   the raw ledger; a lifted refusal is printed with full arithmetic, marked
   lifted, naming the override line (so a lifted bound isn't the one budget
   event with no arithmetic beside it).
5. "The machine's work is joinable to the issue tracker" — replaces the live
   "nothing SHALL create, close, or synchronise a beads issue as a side
   effect of a run" prohibition with an enumerated list of the SPECIFIC named
   points at which the loop now does exactly that (status reads pre-
   selection, mint-or-reuse, claim at commit + at resumption, close at
   merge, non-merge outcome writes, retry of unverified closures, orphaned-
   claim release) — "never otherwise" — plus: nothing runs `bd dolt push`,
   every referenced id (ledger `bead`/`issues`, directive markers, proposal
   `bead:`/`issue:`, OVERRIDE.md lines) is format-checked at read and
   existence-checked by `verify-issue-links.mjs`. New scenario: "Only the
   named points touch the tracker."
6. "An issue id declared in front matter is format-checked; prose is
   harvested" — gains: a proposal MAY declare `bead:` (exactly one id,
   malformed/multi → unselectable); a directive line MAY declare
   `[bead <id>]` (bracket form matching `[done …]`, malformed → skipped
   loudly); both markers stripped from directive task text; harvest survives
   both markers; harvested prose ids remain the join and NEVER the bead
   (new scenario: a precedent cited in prose is not mistaken for the job's
   bead — job's `bead` and its `issues` join list can differ).

Untouched requirements confirmed by grep of the live spec but not touched by
this delta: "One job is one outcome...", "Jobs have identities...",
"Capacity exhaustion is a pause...", "The loop is portable...", "The
executor result protocol...", "A swap has a stated procedure...", "A runner
proven unable to run is refused...", "A job's total spend is measured...",
"A job's ledger line is written before anything recomputes the queue from
it...", "A proposal a merged job consumed is retired...", "The scout looks
outward...", "A gate failure is retried once...".

================================================================================
C. TASKS.MD — VERBATIM HEADINGS AND TICK STATE
================================================================================

All 26 numbered tasks are UNCHECKED (`- [ ]`) except task 25, which is
CHECKED (`- [x]`). Verbatim section headings:

  # Tasks
  ## Part A — the override         (tasks 1–8, all unchecked)
  ## Part B — one bead per job      (tasks 9–21, all unchecked)
  ## Proof by mutation, both parts  (tasks 22–23, both unchecked)
  ## Gates                          (tasks 24–26; 24 unchecked, 25 CHECKED,
                                      26 unchecked)
  ## Not tasks of this change, recorded so they are not read as omissions
                                      (bulleted list, not tasks)
  ## The count                      (measurement paragraph, not a task)

Task 25 (checked) reads: "`openspec validate ... --strict --no-interactive`
and `node scripts/check-spec-deltas.mjs --strict`. Run at drafting time and
again after the first review's fixes, 2026-09-06; both pass." — i.e. only
the OpenSpec artifact validation has actually been run; no code, no tests
(`npm test`/`npm run build`/verify-launch/etc., task 26) have been executed.
Task count: "132 SHALL clauses... 76 are new," per the file's own count.

Notable task content: task 9 is "measure first" against a real `bd` in a
throwaway store before building the mock; tasks 22–23 are "proof by
mutation" — each names a specific code mutation and which test must fail as
a result, for 5 (Part A) + 7 (Part B) = 12 disjoint mutation/test pairs.

================================================================================
D. OPEN MUST-FIX ITEMS FROM REVIEW ROUND 2, VERBATIM FROM THE BEAD
================================================================================

"OPEN MUST-FIX FROM REVIEW ROUND 2 (to resolve when reopened):

1. A claim refused for a STATE reason (bead deferred/blocked/closed/claimed
elsewhere) leaves a resumable branch with a committed brief and no
ledger line; the next run resumes it and re-wedges. Needs a self-clearing
path.
2. A job's own proposal file may declare a bead: key, so a waiting override
whose target no candidate carries could be redirected by a job. The
authorisation's home is protected but its target is not; close the
channel.
3. verify-launch would fail every pre-mechanism done ledger line on day one;
it needs a grandfather date."

Tooling note from the drafter, verbatim: "check-spec-deltas.mjs cannot
resolve a same-delta RENAMED TO for a MODIFIED heading, so no delta can
rename-and-modify a requirement under --strict."

================================================================================
E. THE MAINTAINER'S ANSWERS AND CLARIFIED END GOAL, VERBATIM FROM THE BEAD
================================================================================

"THE MAINTAINER'S ANSWERS (2026-09-06):

1. Loop-minted per-job beads are ORDINARY beads, not ephemeral wisps.
2. ORDERING — agreed logic: map the bead's own priority to the selector's
existing bands (select.mjs: 1 directives, 2 preempting dated-news
proposals, 3 the derived queue by rank, 4 cooled proposals). P0/P1 join
band 1 beside directives; P2 sits between dated news and the queue; P3/P4
go below cooled proposals. The order stays a pure function of a declared
field. A band decides who goes first among the AFFORDABLE; the budget
rules still filter afterwards, so routing buys no budget — only the
override does.
3. WHO MAY WRITE OVERRIDE.md — discussed, not ruled. The mechanism cannot
tell the maintainer from the orchestrator (every commit is under the
maintainer's account; the reserved-path breaker fires only on a JOB's
branch diff), so this is a STANDING-AUTHORITY.md policy line either way.
Recommended: the maintainer's by default, with per-instance "you type
it" delegation (the push-rule precedent), the line carrying an
authorised-by clause quoting the instruction, and a mechanical cap of at
most ONE override in flight so a mistaken delegation cannot become a
standing bypass. Orchestrator-writable-at-will was argued against: the
orchestrator is the party that wants the machinery built, and the spec's
"regardless of how appealing the improvement looks" was written against
exactly that judgment."

NOTE: the maintainer's answer #2 above ("map the bead's own priority to the
selector's existing bands... P0/P1 join band 1... P2 sits between dated
news and the queue... P3/P4 go below cooled proposals") describes a
FOUR-WAY priority split by the bead's own priority field. The draft as
actually written implements something narrower: ALL routed beads land in
one single new band (priority 2, between directives and expiring
proposals), ordered within that band by "bd's priority then creation time"
— it does not split P0/P1 into the directive band itself, nor push P3/P4
below cooled proposals. The drafter flags this himself as
"What I was least sure about" item 1: "Where routed beads sit in the
order... A two-band variant (P0–P1 above expiring proposals, P2–P4 below
them and above the queue) was considered and set aside as more rule than
the evidence supports... If the maintainer's routing habit turns out to be
'file lots at P3', this is the clause to revisit." So the draft's ordering
is a simplification of, not an exact implementation of, the maintainer's
stated answer #2 — worth flagging to the architect explicitly.

"THE CLARIFIED END GOAL, and the point-blank verdict. The maintainer's real
intent: 'I want the beads issues and the desk queue to essentially be the
same thing.' Asked point blank whether beads should be the ONLY work source,
the orchestrator's answer was NO as the only source of TRUTH, YES as the one
place to look. Reasons: the derived queue is a pure function of committed
state (byte-identical on every Pulse run, reproducible from a fresh clone,
cannot drift or be forgotten) and is the autonomy engine — it mints work
from measured reality with nobody filing anything; beads is mutable state in
a dolt store outside git, never pushed, whose export the tool itself calls
'not the source of truth', and this repository's own record
(issue-claims-decay) shows issue text decaying faster than the code. Making
beads the truth would mean the repository no longer describes the system's
state and every dolt hiccup becomes a Desk outage."

THE RECOMMENDED SHAPE (the unification that is a good idea), verbatim:

"• The relation is SUBSET, not identity: beads is the one backlog; the Desk
queue is the subset that is typed (job type from the closed list, a brief,
acceptance criteria) and unblocked. Most existing beads are not Desk jobs
and stay untyped; that is correct.
• Every Desk job carries a bead, minted by the loop at selection, closed by
the loop at merge, read back and verified; failed/blocked outcomes map to
bead states.
• Directives move into beads (human intent belongs in the tracker; they gain
priority and dependencies); DIRECTIVES.md retires after migration.
• The derived queue STAYS AUTHORITATIVE and is MIRRORED into beads: the
Pulse derives conditions exactly as now (its derive step never calls bd —
that would break determinism), then a separate reconciliation step opens a
bead per condition that has none and closes the bead of each condition that
cleared. The bead id never enters data/derived/; the link is a stable
subject key on the bead. When a mirrored bead and the derived condition
disagree, THE CONDITION WINS. A wontfix close is honoured as a visible,
reported suppression (same shape as the build's debt ratchets).
• Proposals stay files (a job filing its own bead is the conflict of
interest the draft refuses); the loop mints the bead at merge pointing at
the file; consumed/dropped/rejected become bead states with reasons.
• Routed beads are a real work source, ranked by their own priority into the
existing bands.
• bd outages: select nothing, exit 2, say why; never HOLD.md.
• Migration: carry files, proposals and directive lines get beads once."

"RECOMMENDED SPLIT when reopened: land the override as its own small change
FIRST (it is the mechanism that lets the unification be implemented through
the Desk under the machinery ceiling), then draft the unification as its own
change carrying the shape above, the migration plan, and the three decisions
(derived-bead lifecycle ownership, bd as a runtime dependency, migration)."

================================================================================
F. WHAT THE DRAFT DOES NOT ADDRESS, RELEVANT TO AN EFFICIENCY REDESIGN
================================================================================

1. BATCHING MULTIPLE ITEMS INTO ONE JOB. Not addressed at all — the draft
   explicitly reaffirms "one job is one outcome" ("A Desk job is one
   outcome, and one bead is what the tracker calls one outcome. Every job
   therefore has exactly one bead"). This is a structural assumption baked
   into the new "Every Desk job is the work of exactly one bead" requirement
   — a job that batched several beads into one work order would not fit the
   1:1 bead-per-job model as specified. VERDICT: HINDERS. The draft
   deliberately tightens the 1-job:1-bead ratio (via the required `bead`
   ledger key and the "exactly one" language), which is the opposite
   direction a "work orders of several coherent items" design would need to
   move; someone would have to loosen this back to a list/set before
   batching could be layered on.

2. REVIEW PER PIECE VS PER JOB. Not addressed — review still happens once
   per job (unchanged review-gate requirement, no delta). Since jobs stay
   1:1 with beads under this draft, this question doesn't even arise inside
   it; it's deferred entirely to whatever mechanism would introduce
   multi-item jobs. VERDICT: NEUTRAL (the draft doesn't touch review at all;
   "No review delta" is stated explicitly in "What changes").

3. GATE AMORTISATION (spreading gate/build cost over several pieces of work
   in one job). Not addressed. The draft's "A gate failure is retried once"
   requirement (untouched, pre-existing) and the per-job wall-clock/budget
   requirements are unmodified. Since batching isn't there, amortisation
   has nothing to amortise over. VERDICT: NEUTRAL-TO-HINDERS — the new
   required-`bead`-per-invocation-line rule in "The ledger line carries the
   bead" is written against a "one job, one bead" mental model; if gate
   amortisation later meant one job's ledger line covering several
   deliverables/beads, that requirement's "issues SHALL be a list, bead
   SHALL be one id" split would need rework, though the underlying `issues`
   list mechanism (already a list) is closer to reusable for that.

4. THE FLEET (hand-driven codex sessions outside the loop). Not mentioned
   anywhere in the draft, proposal, or tasks. The draft's mechanisms
   (OVERRIDE.md, bead-per-job, `bd-desk.mjs`) are all scoped to `loop/`
   (the Desk) exclusively — there is no provision for a human-driven,
   loop-external agent session to mint/claim/close beads, use the override,
   or participate in the four-source selection at all. VERDICT: NEUTRAL,
   with a mild ENABLING side-note — `scripts/bd-desk.mjs create` and the
   routed-bead work source are both usable independent of the Desk's own
   run loop (a fleet session could file a `desk-job` bead by hand or via the
   helper and have the Desk later pick it up), and `routedBeadDefects()` is
   explicitly designed to gate "a bead filed by any means... not just the
   helper." So while the fleet isn't addressed as a concept, the routed-bead
   channel is a pre-built on-ramp a fleet-aware design could reuse without
   modification.

5. INFLOW CONTROL ON BEAD FILING (i.e., is there any check on flooding beads
   in / rate-limiting what becomes a `desk-job` bead). Not addressed as a
   volume control — the closest things are (a) `routedBeadDefects` as a
   FORMAT/completeness gate (does the bead have the required fields), not a
   volume or priority-quality gate, and (b) the drafter's own flagged
   uncertainty #11 ("The volume of minted beads" — roughly 19 `desk-run`
   beads/day expected, cluttering `bd list` though excluded from `bd ready`
   under the routing label; `--ephemeral` was considered and rejected
   because a compacted id would fail the existence gate). No rate limit,
   priority floor, or backlog-size cap on ROUTED (`desk-job`) beads is
   proposed; a maintainer or job could route unlimited beads into the queue
   with only the existing selector budget/ceiling mechanics as a brake.
   VERDICT: MOSTLY NEUTRAL but a latent gap — the draft solves "does a
   routed bead have what a job needs" but not "should this many beads be
   entering Desk-selectable state at all," which an intake-control design
   would need to add on top, likely as a filing-time policy (label
   permissions, a per-day routed-bead cap, or a review-first gate before the
   `desk-job` label is added) rather than anything this draft blocks.

================================================================================
G. ASSESSMENT — REUSABLE AS-IS VS CONFLICTS WITH A "BEADS IS THE ONE INTAKE,
   DESK EXECUTES WORK ORDERS OF SEVERAL COHERENT ITEMS" DESIGN
================================================================================

REUSABLE AS-IS (mechanism-level, orthogonal to batching):

- The OVERRIDE.md mechanism (Part A) in its entirety. It targets one BEAD,
  not one JOB directly — the drafter was explicit that the bead is "the one
  identity every work source can carry," which is exactly the kind of stable
  handle a multi-item work-order design would still want. If a future job
  became "the execution of N beads," the override could point at any one of
  them, or the mechanism could be trivially extended to a list without
  touching its core exclusion arithmetic. The exclusion-from-both-numerator-
  and-denominator arithmetic, the closed lift list, the reserved-path
  treatment, and the two-act (mint-then-paste) maintainer workflow are all
  independent of how many items a job executes and should reuse directly.

- `loop/lib/issues.mjs`'s pre-existing split (format-check vs existence-
  check) and the `issues` (list, optional, additive) ledger key — already
  built for "a job may serve several issues," which is structurally closer
  to a multi-item work order than the draft's own NEW `bead` (singular,
  required) field is. This part of the substrate the draft builds on, not
  the part it adds, is what a batching-friendly design would extend.

- `loop/lib/beads.mjs` as a single choke point for all `bd` invocation
  (mint, claim, close, sweep orphans, retry unverified closures), with the
  `--sandbox` discipline and the static import-boundary test keeping `bd`
  out of the Vercel build path. This is good infrastructure regardless of
  job shape and should survive a redesign essentially unchanged.

- The "loop mints/claims/closes, job never touches its own bead" conflict-
  of-interest boundary, and the verify-by-reading-back-before-and-after
  pattern for closure. Both are shape-agnostic — they work the same whether
  a job closes one bead or iterates closing several.

- `routedBeadDefects()` as a shared predicate between the selector and the
  filing helper ("the selector's predicate is the gate, and nothing else
  is") is a good general pattern for "beads is the one intake": any actor
  (hand-typed `bd create`, the fleet, another agent) can file a bead that
  becomes Desk-selectable the moment it satisfies one predicate, with no
  privileged path. This is very close to the maintainer's stated end goal
  and to "beads are the one intake."

CONFLICTS WITH A MULTI-ITEM WORK-ORDER DESIGN:

- The core structural bet of Part B — "Every Desk job is the work of exactly
  one bead" — is a 1:1 job:bead cardinality, enforced by (a) a REQUIRED
  singular `bead` ledger key (distinct from the plural, optional `issues`
  list) and (b) close-at-merge logic that closes exactly one bead per merge.
  A "work orders of several coherent items" design needs N:1 (several beads,
  one job/merge) at minimum, and arguably N:M if items can be reviewed or
  merged independently. Every place the draft hard-codes singularity —
  `resolveBead()` returning one id, `closeBead(id, …)` taking one id,
  `verifyClosed(id, jobId)` reading one bead's status, the
  `signal: bead-unclosed` gate checking one note per `done` line — would
  need to become "close the set of beads this job's merge settles" and the
  verification/retry/sweep logic re-derived for a set rather than a scalar.
  This is real rework, not a config toggle: the delta explicitly rejected
  the scalar-vs-list question for `bead` on the grounds that the existing
  `issues` list already covers "several issues in passing" and the new
  field is deliberately narrower ("the bead is distinct from the join").

- "A routed bead's job SHALL NOT retire anything on merge beyond its own
  bead: no proposal moves, no directive is marked" and the merge-path
  closure logic assume one bead = one unit of settled work. A batched job
  merging several coherent beads' worth of work would need this rule
  rewritten to iterate.

- The four-source, single-linear-priority selection model (`gatherCandidates`
  now producing one flat, priority-sorted list of single-item candidates)
  has no notion of "select and bundle N compatible candidates into one job."
  Bundling would need a new pre-selection step (group candidates by
  compatibility/type/subject before they enter this list) that this draft
  does not build toward and, per the maintainer's own answer #2, wasn't
  asked to — the ordering discussion is entirely about where ONE bead sits
  in a flat priority list, not about grouping.

- Review-per-job assumption threads through the closure and gate logic
  ("the loop closes, not the job", the single reviewer worktree, breaker 1's
  per-job-type consecutive-failure counting). None of this explicitly
  forbids per-piece review inside a batched job, but nothing in the draft
  was designed with that split in mind, and the failure/discard→bead-state
  mapping ("failed/discarded/abandoned → open, deferred 3 days") would need
  to decide whether a partially-successful batched job reopens ALL its
  beads or only the failed ones — an ambiguity this draft's single-bead
  model never has to resolve.

WHY THIS MATTERS FOR THE ARCHITECT: the draft is a faithful, carefully
measured, well-reviewed implementation of the maintainer's LITERAL 2026-09-06
ask (one bead per job, mechanically) and of the override he asked for
separately. But the maintainer's own CLARIFIED end goal in this same bead
("beads and the desk queue... essentially the same thing," subset not
identity, derived queue stays authoritative and mirrored) already goes
further than what got drafted, and an efficiency redesign toward "the Desk
executes work orders of several coherent items" goes further still, in a
DIFFERENT direction (cardinality of job:bead) than the mirroring recommendation
does (cardinality of tracked-condition:bead, which is closer to what the
draft already does 1:1). Recommend the architect treat Part A (override) as
adoptable close to verbatim, Part B's plumbing (beads.mjs, verify-launch
integration, the predicate-sharing pattern, the mint/claim/close/sweep
lifecycle) as a reusable toolkit, but treat the "exactly one bead" job
model as the one piece that must be redesigned — not merely extended — if
jobs are to become multi-item work orders. The recommended-shape mirroring
idea (derived queue → beads, condition wins on disagreement) is a separate,
still-undrafted piece of work that neither this draft nor a batching
redesign automatically delivers; both would need it drafted fresh.

================================================================================
Items marked "unverified": none — every deliverable section above was
checked directly against `bd show addictedtoai-7z07`, the three extracted
draft files (draft-proposal.md, draft-specs_loop_spec.md, draft-tasks.md),
the live `openspec/specs/loop/spec.md`, `loop/lib/select.mjs`, and
`loop/lib/issues.mjs`.
================================================================================
