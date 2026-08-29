# Design — harden-seed-wave-guardrails

## Context

Six defects, one species: a rule the project relies on that is an instruction
rather than a mechanism. Three have a mechanism worth specifying now (D1–D6).
Three are decisions the maintainer has read and deliberately not made; those are
D7–D9, and the requirement text each would need is drafted here in fenced blocks
marked **DRAFT — NOT ADOPTED** so that adopting one is a copy, not a rewrite. No
draft block is a requirement of this change, none appears in any spec delta, and
none is tasked.

Constraints that shape everything below:

- **`data/derived/` is a pure function of state**, so anything new that the
  Pulse computes has to be recomputable from scratch with no stored history.
- **The Pulse never adjudicates between sources.** It fetches, hashes, diffs. A
  new comparison may report; it may not decide.
- **Fail the build, don't warn** — with two deliberate exceptions already on the
  books, one of which (the currency literal) D5 extends rather than converts.
- **A guardrail that fires on its own machinery is noise**, and noise is how a
  guardrail gets switched off. Two decisions below (D1, D6) are shaped mostly by
  false-positive cost.

## Goals / Non-Goals

**Goals:**

- A review record that is bound to the text it judged, with *missing*,
  *mismatched* and *unbound* reported as the three different findings they are.
- A volatile-literal check whose coverage is visible and whose blind spot cannot
  silently re-open when a content field is added.
- A cheap, declared comparison that turns two disagreeing sources into a
  `verify` job instead of a paragraph built on the wrong number.
- Enough of `pfv`, `tr8` and `o5t` written down that the machinery stops doing
  things this specification does not describe — without settling what the
  maintainer has not settled.

**Non-Goals:**

- Deciding whether the Desk halts when no runner works, what a ceiling's
  denominator is at n=1, or whether a job's total spend is bounded. Drafted, not
  decided.
- A visible on-page disclosure of a source disagreement. `addictedtoai-473`
  raises it — whether a catalog row should carry a note on a cited fact — and
  the content pass correctly declined to invent the schema for it. It is not
  proposed here either; the queue item is the whole of what this change adds.
- Re-reviewing anything, or editing content. This change is machinery.
- Any change to `data/config.json`. Every key it would gain belongs to D7–D9.

## Decisions

### D1. The review hash covers the *reviewed surface*, not the file

**Decision.** Hash the prose body plus the front matter with
mechanically-maintained keys removed, canonically serialised, with the list of
mechanically-maintained keys declared in exactly one place in `lib/`. Today that
list is `timeline` and nothing else.

**Alternatives.**

*(a) Hash whole file bytes.* Simplest and strictest, and wrong here. `pulse`
appends dated lifecycle events to an entry's `timeline` mechanically, under the
review exemption — that is reviewed machinery producing deterministic output, by
design not subject to review. Under (a), the first status change in the world
marks every affected approved entry mismatched. The launch check then fails on
work nobody touched, and the fix a tired maintainer reaches for is to turn the
check off.

*(b) Hash the prose body only.* Immune to every front-matter write, and it
discards real signal: a reviewer of a wiki entry checks facts, aliases and
sources, all of which live in front matter. An entry whose cited `source_url`
was swapped after approval would read as unchanged.

*(c, chosen) Body plus non-mechanical front matter.* Covers what a reviewer
actually judged and excludes exactly what the machinery is licensed to write.
Its cost is that "mechanically maintained" is now a list that has to be kept
true, which is why the requirement puts it in one declared place — the same
pattern as `KINDS` and `SUBJECT_KEYS`, where the single home is what stops two
copies drifting.

**Risk.** If a future Pulse behaviour writes another front-matter key and the
list is not updated, mismatches appear on untouched pieces. The failure is loud
and traceable to one line, which is the trade this project takes over a silent
gap.

### D2. `reviewed:` is a new key; `subject:` keeps its shape

**Decision.** Add `reviewed:` as a mapping from content path to hash, written by
the merge step in the same operation that writes `subject:`, from the same
measurement of the branch. Require the key sets to be equal, and refuse the
record at merge when they are not.

**Alternatives.** Carrying the hash inside `subject:` — `content/x.md@<sha>` —
would mean one field and no cross-check to write. It also breaks the join for
every record that already exists: `subjectsOf()` reads nine accepted key names
and matches values against a piece's file, url, id, slug and rel, and a
hand-written `subject: content/blog/x.md` is a documented, supported form. A
guardrail whose first act is to unbind every existing record is not an
improvement. A second alternative — a sidecar file mapping records to hashes —
loses the property that makes the record evidence: everything a reader needs to
judge the verdict is in the one file they are reading.

**Why the equality cross-check earns its line.** The two fields are written from
one measurement, so they can only disagree if someone edits one by hand. That is
precisely the case worth refusing: a record whose `subject:` claims one piece
and whose `reviewed:` hashes another is a record that would pass every existing
check while binding an approval to the wrong bytes.

### D3. A mismatch reports; it never de-indexes

**Decision.** `scripts/verify-launch.mjs` fails on a mismatch. The build's
review gate keeps reading the verdict alone, so indexability is unchanged by a
mismatch.

**Rationale.** `lib/reviews.mjs`'s header settles the shape of this argument for
the absence case: suppressing a page on an ambiguous signal "would silently
de-index approved work over a naming mismatch", so absence is reported rather
than acted on. Mismatch is less ambiguous than absence but the asymmetry of
costs is the same — a false mismatch (a mechanical write not yet on the excluded
list, a line-ending change) would unpublish good work with no one watching,
while a missed mismatch is caught by the launch check the next time it runs. The
loud, blocking channel is the one a human reads; the silent, per-page channel is
not.

### D4. Recency, read from the record, breaks a multi-record tie

**Decision.** Where several records name one piece, bind the most recent, taking
recency from a value inside the record — its own date, else its job id, whose
`j-<yyyymmdd>-<seq>` form sorts chronologically as a string. Superseded records
are not reported as orphans or as contended. An unorderable pair keeps today's
behaviour: report the contention, bind nothing by guesswork.

**Why it is necessary rather than nice.** Without it the mismatch finding has no
clearing path, and a gate with no clearing path is a wall. Measured from the
code: `reviewCandidates()` is tried before front-matter subjects, so a seed
record named `seed-<url>.md` claims its piece before any loop-written record is
consulted; and among front-matter subjects `resolveReviews()` builds `bySubject`
with `if (!bySubject.has(s))`, so the first record in `readdirSync` order wins.
A re-review of a seed piece is therefore invisible to the join today, and a
re-review of a loop-written piece binds whichever record sorts first by
filename. Either way the piece would stay mismatched after being genuinely
re-reviewed.

**Why not file mtime.** It is not committed, it differs on every clone and after
every checkout, and a join that depends on it gives different answers on the
maintainer's machine and in a job worktree. The same reasoning that makes lane
pause state computed from the ledger rather than stored applies here.

### D5. Every string field is classified; the date-anchor exemption is mechanical

**Decision.** One declared classification in `lib/` covering every string-valued
field of every content schema, split into author-prose and not-author-prose, and
a build failure when a field is in neither. Author-prose fields are scanned by
the existing currency rules; a hit is exempt when the object directly containing
the field has a sibling key whose value is an ISO date. Severity stays a
warning, matching the body scan.

**The classification, as proposed:**

| Schema | Author prose | Not author prose, and why |
|---|---|---|
| delta | `capability`, `impossible.what`, `impossible.metric`, `routine.what`, `routine.metric` | `title` — a name |
| learn | `outcome` | `title` — a name |
| post | `corrections[].text` | `title` — a name |
| tutorial | — | `title` — a name; `verified_against` values are version strings by design, anchored by `verified_on` |
| tool | `pricing` | `title` — a name; `url` |
| entry | — | `display_name`, `aliases[].name` — names; `facts[].value` is the data layer, which `lib/currency.mjs` already excludes on purpose |

**What that actually scans, measured against the corpus rather than assumed.**
Delta ends carry a required ISO `date` (`lib/schema.mjs`: `deltaEnd.date` is
non-optional and the schema is `.strict()`), so `what` and `metric` are exempt by
construction — the anchoring `addictedtoai-48r` attributes to author convention
is in fact enforced by the schema, and that correction belongs on the record.
Blog corrections carry `date`; tool listings carry `last_verified`. After the
exemption the fields actually scanned are `delta.capability` and `learn.outcome`.

**So why do it.** Because the narrow scan is the consequence, not the mechanism.
The mechanism is the exhaustiveness rule: a new string field cannot arrive
unclassified, which is the vector by which this exact blind spot re-opens — and
the vector `addictedtoai-48r` names when it says the shape may hold anywhere
front matter carries prose-like fields. The second half is the coverage count:
a check that runs on nothing prints the same clean result as a check that runs on
everything, and that indistinguishability is what let a check be vacuous on 23 of
29 documents for a whole seed wave.

**Alternatives.** *Scan every string field with a denylist* inverts the default
and is worse in exactly the way that matters: a new field is scanned by accident
rather than classified on purpose, and the first false positive is on a model
name containing a version number, which is most of this site's subject matter.
*Infer from the field name* is guessing. *Fail instead of warn* was considered
and declined: the body scan warns because a legitimately quoted historical price
in a sentence is not a defect, and after the date exemption the front-matter case
is the same case. If the maintainer later wants a failure here, the change is one
severity argument and the coverage count is already there to show what it would
have caught.

**Names are excluded on purpose.** `title`, `display_name` and `aliases[].name`
are identifiers of things the site is about, and things in this field are named
`Claude 4.5` and `GPT-5.2`. The version rule in `lib/currency.mjs` matches
`[A-Z][A-Za-z0-9]* v?\d+\.\d+`, so scanning names would warn on a large fraction
of the corpus for stating a name correctly — the definition of noise.

### D6. Corroboration is declared, compared exactly, and never adjudicated

**Decision.** A fact may carry `corroborates: <field>` naming another fact on the
same entry. The Pulse compares declared pairs every run and files a `verify`
queue item on disagreement. No tolerance. Both sides have to resolve or there is
no comparison. Nothing is edited and nothing fails.

**Why declared.** Field names differ by necessity — the repair for the observed
case named its cited facts `card_parameters` and `preview_parameters` precisely
so they would not collide with the feed-bound `parameters` — so a same-name join
finds nothing. Normalising names to find pairs is the fuzzy matching this design
refuses everywhere else, for the reason `wiki` gives about feed binding: name
matching is guessing.

**Why no tolerance.** A tolerance is a policy nobody has set, and the observed
disagreement (`284B` against `304B`) needs none. Numeric normalisation already
absorbs the formatting differences that would otherwise dominate false positives
(`$3` against `$3.00`). A false positive costs one `verify` job; a tolerance
picked without evidence costs a missed disagreement, permanently and silently.

**Why absence is not disagreement.** A vanished declared row already renders its
last-known value with an as-of date and files a repair finding. Reporting the
same state a second time under a second name makes both findings less legible,
and a queue item that appears whenever a snapshot is missing would fire on every
first run of a new source.

**Cost.** One extra comparison per declared pair per run, over values the run has
already resolved. There are no declared pairs today; the first will be the entry
that surfaced this.

### D7. OPEN — should a Desk with no usable runner halt? (`addictedtoai-pfv`)

**Status: the maintainer's decision. Not adopted, not tasked.**

`specs/loop` names four breakers and closes the list: *"No other condition halts
the loop; in particular, capacity exhaustion pauses and empty queues end runs
normally."* A dead credential now produces a printed refusal on every run, which
is stated rather than silent — the original complaint. What it is not is
*delivered*: the Desk keeps running, produces nothing, and nothing reaches the
maintainer unless they read the output.

**Option A — refusal only (status quo).** Nothing further. Cheapest, and it
leaves a Desk that appears to run while doing nothing until someone reads a log.

**Option B — a fifth breaker, fired only when no cleared runner remains
(recommended).** `HOLD.md` is written when every runner cleared for `author` is
refused — by conformance, by runtime health, or both. This is the narrowest form
that means what "cannot run at all" says: it cannot fire while any runner works,
so a single dead credential in a multi-runner registry still only refuses that
runner. Everything it needs exists: `health.mjs` exports `noOutputStreak()` and
`NO_OUTPUT_STREAK_LIMIT`, `breakers.mjs` exports `writeHold(ctx, breaker,
reason)`, and the runner registry already declares roles.

**Option C — amend breaker 1 to count no-output runs as failures.** Reuses an
existing breaker instead of adding one. It is the wrong shape: breaker 1 is
per-job-type and explicitly excludes `interrupted`, and a no-output run is
evidence about a *runner*, not about a job type. Counting it there would halt the
Desk over a dead credential while reporting a content-failure pattern that did
not happen.

**Recommended: B.** It is the only option under which "the Desk cannot do
anything" reaches the maintainer without a log read, and its firing condition is
tight enough that it cannot become the breaker that cries wolf.

```text
DRAFT — NOT ADOPTED. Requirement text for Option B, as an amendment to
`Breakers halt the loop, and only the named ones` (a fifth numbered item, and
the closing sentence adjusted to admit it):

5. No runner cleared for the `author` role is usable — every one of them is
   refused, by a conformance FAIL, by the runtime no-output refusal, or both.
   The loop SHALL write `HOLD.md` naming each refused runner and the reason
   each was refused, and SHALL NOT write it while any cleared runner remains
   usable.

Scenario: A Desk with nothing to run with stops and says so
- WHEN every runner cleared for `author` is refused
- THEN `HOLD.md` is written naming each runner and its refusal reason, and the
  Desk stops
```

**If B is adopted it needs**: a task amending the breaker requirement, a task
adding the usable-runner predicate at the start-gate, and a test that a
single-runner registry with a dead runner writes `HOLD.md` while a two-runner
registry with one dead runner does not.

### D8. OPEN — what denominator does a ceiling bind against at low n? (`addictedtoai-tr8`)

**Status: the maintainer's decision. Not adopted, not tasked.**

`specs/loop` says a category's share is its MM over that tier's total MM across
the rolling 30 days. Taken literally, one 12-minute entry job was 100% of new
writing and locked the category for a month. `loop/lib/budget.mjs` now measures
**ceilings** against `max(observed total, warm-up)`, where warm-up is
`(100 / tightest ceiling percentage) × largest per-type wall-clock cap` — 1200 MM
under today's config. The floor is untouched. Above the warm-up the denominator
is the observed total and the specification's arithmetic is exactly restored.
Note that the code took a smaller version of the same reading from the start:
`budgetGate` returned ok at `total_mm === 0` on the grounds that 0/0 is
undefined. The specification has been silent on low n since day one.

**Option A — adopt the implemented reading (recommended).** State that a ceiling
is measured against the larger of the tier's rolling total and a warm-up window,
and state where the warm-up number comes from.

**Option B — state the literal arithmetic and revert the code.** Honest to the
text and reintroduces the defect `addictedtoai-3on` fixed: one job saturates its
category for thirty days.

**Option C — suspend ceilings until the window holds N jobs.** Simpler to state
and introduces a cliff: the ceiling binds on nothing, then binds fully at job
N+1. The warm-up denominator has no cliff, which is why it was chosen.

**Sub-decision, either way: where the warm-up number lives.** Derived from
`job_caps_minutes` and the tightest configured ceiling (as implemented), or a
key in `data/config.json`. Derived is recommended: both inputs are already
configuration, so a maintainer who edits a cap or a ceiling gets a coherent
warm-up without editing a third number, and `budget.mjs` already treats a
hard-coded `10` as the drift it eliminated. A `data/config.json` key would also
add a fifth key group to a file that `build-initial-site` task 1.3 verifies as
four, so adopting it means amending that task's check as well.

```text
DRAFT — NOT ADOPTED. Requirement text for Option A, as an amendment to
`Spending is budgeted in model-minutes with floors and ceilings`:

A CEILING SHALL be measured against the larger of the tier's observed rolling
total and a warm-up window, where the warm-up window is the number of
full-length jobs a share must be a share of — `100` divided by the tightest
configured ceiling percentage — multiplied by the largest per-type wall-clock
cap in `data/config.json`. Above the warm-up the denominator IS the observed
total and the arithmetic above is unchanged. The upkeep FLOOR SHALL continue to
be measured against the observed rolling total alone: a floor measured on a
thin window errs toward doing upkeep, which is the safe direction.

Scenario: One job does not saturate a category
- WHEN a tier's rolling window contains one 12-minute new-writing job
- THEN new writing is not refused, because the ceiling is measured against the
  warm-up window rather than against 12 minutes
```

**If A is adopted it needs**: a task amending the budget requirement, and a test
asserting that one job below the warm-up does not trip a ceiling while the same
category above the warm-up does.

### D9. OPEN — is a job's total spend bounded? (`addictedtoai-o5t`)

**Status: the maintainer's decision. Not adopted, not tasked.**

`capMinutes` is one value per job type and `run.mjs` passes it unchanged to the
author, the revision, and each review pass. A job revised once makes four
invocations, each entitled to the full cap. Measured against today's
`data/config.json`, where every type is 120 minutes: 480 minutes for one job,
which is 40% of the 1200 MM warm-up denominator — one job, on a 45% new-writing
ceiling. Budget ceilings bind at selection time and nothing checks spend during a
run, so the overshoot is only counted after it is over. Observed for real:
`j-20260829-01` spent 20.87 MM across an author run, two reviews and a revision
against a nominal 30-minute cap; nothing was wrong with that run, and it is the
demonstration that the total is a multiple of the number everyone reads.

**Option A — a job total budget, per-invocation caps derived from what is left
(recommended, with a floor).** `data/config.json` gains a per-type job total;
each invocation is capped at the smaller of the per-invocation cap and the
remaining total. The data is already at hand — the review brief prints `mmSoFar`.
The wrinkle that has to be designed rather than discovered: a late review pass
could inherit a uselessly small remainder, and a truncated review is the worst
possible place to save minutes. So A needs a minimum-invocation floor: when the
remainder is below it, the job is abandoned with a ledger line rather than given
a stub review.

**Option B — keep per-invocation caps, add a job-total ceiling that abandons on
exceed.** Simpler, and it spends the overshoot before noticing it: the abandon
fires after the invocation that crossed the line has already run to its own full
cap.

**Option C — per-role caps (a smaller cap for the reviewer).** One of the options
weighed in `addictedtoai-5z9`, and it does not bound the total at all — it only
lowers the multiplier. It also collides with `specs/loop` fixing caps by job
type, which is the same conflict `addictedtoai-pfv` names; adopting it means caps
keyed by type *and* role.

**Option D — disclosure only.** What this change already specifies: the total is
recorded per phase and every brief states the cap as a per-invocation guard.
Leaves the 480-minute worst case in place.

**Recommended: A with a minimum-invocation floor**, because it is the only option
where the number the brief prints and the number the budget spends are the same
number.

```text
DRAFT — NOT ADOPTED. Requirement text for Option A, as an addition to
`One job is one outcome with one merge or discard`:

Every job type SHALL additionally carry a TOTAL wall-clock budget in
`data/config.json`, covering every invocation the job makes — authoring,
revision, and every review pass. Before each invocation the loop SHALL compute
the remaining budget as the total minus the model-minutes already recorded for
that job, and SHALL cap that invocation at the smaller of the per-type
per-invocation cap and the remainder. Where the remainder is below the
configured minimum invocation length, the loop SHALL abandon the job with a
ledger line naming the exhausted budget rather than start an invocation too
short to do its work — a truncated review is not a cheaper review.

Scenario: A revised job cannot spend its cap four times
- WHEN a job has spent its total budget across an author run, a revision and a
  review pass
- THEN the next invocation is not started, and the job is abandoned with a
  ledger line naming the exhausted budget
```

**If A is adopted it needs**: a task adding `job_total_minutes` and
`min_invocation_minutes` to `data/config.json` (a reserved path — the maintainer
edits it), a task deriving each invocation's cap, a task on the abandon path, and
tests for the derived cap, the floor and the abandon ledger line. Note that
`data/config.json` is a reserved path under breaker 4, so no job may make that
edit.

## Risks / Trade-offs

- **The mismatch check turns every post-approval content edit into a launch
  failure until re-review.** That is the intent — it is the `org/moonshot-ai`
  case — and it is only survivable because D4 gives a re-review a way to
  supersede the old record. If D4 is dropped, D3's failure becomes unclearable
  and the check has to be dropped with it. They land together or not at all.
- **The mechanically-maintained key list is a new thing that can go stale.** A
  future Pulse write to a front-matter key not on the list produces mismatches on
  untouched pieces. Loud, traceable to one line, and preferable to hashing
  nothing.
- **`unbound` is a real weakening for as long as it lasts.** Every seed record is
  unbound and nothing fails on it, so the seed corpus keeps exactly today's
  guarantee until each piece is next reviewed. The alternative — failing on
  unbound — would mean this change could not land without re-reviewing 83
  pieces. The mitigation is the count, and that the count can only fall.
- **The front-matter scan is narrow after the date exemption**, currently two
  fields. Judged worth it for the exhaustiveness rule and the coverage count, not
  for the two fields; a reader who expects a wide net will be disappointed by the
  measurement, which is why the measurement is in the requirement.
- **Corroboration costs inference on a false positive.** A disagreement files a
  `verify` job. With no tolerance and exact normalisation the expected rate is
  low, but the first pair declared is the honest test of that and the count is
  worth watching before more are declared.
- **Three decisions stay open**, which means three known gaps stay open: a Desk
  that spins on a dead credential without halting, a specification whose budget
  arithmetic its code does not follow, and a job that can spend four caps. Each
  now has a floor that makes the gap visible — a printed refusal, a stated
  denominator, a recorded total — and none is closed.
