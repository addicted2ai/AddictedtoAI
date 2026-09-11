# pulse — delta for two-desks-work-orders-and-trains

One requirement modified, one added. The Pulse's derive step is untouched and
stays what it is: model-free, byte-identical on unchanged state, reproducible
from a fresh clone. The work queue stays derived and stays authoritative. The
deploy check, its two polling windows, its three classifications, the marked
hold and the read-only re-test all survive word for word.

Three things change in the publish step, and they are one idea. **The push
becomes a push of a verified tree rather than of a branch**: the caller declares
the SHA its gates ran over, and the step pushes that SHA to `main`. A rule that
instead refused whenever the branch carried any commit outside a declared *set*
would deadlock the two publishers against each other permanently — a Pulse commit
landing between a train's fast-forward and its push puts a commit outside the
train's set and the train's commits outside the Pulse's, and neither may widen
its declaration. Pushing a SHA cannot push a commit the gates did not see, needs
no re-comparison at push time because the remote enforces the fast-forward
atomically, and has no deadlock. **The Pulse keeps publishing on its own
schedule**, and a train merges `main` in before its gates run so that both
actors' work is examined together and the loser of a race re-gates rather than
widening anything. And **the step reads the publish flag itself** rather than
trusting a caller to have read it.

An earlier draft routed the Pulse's own commit onto the integration branch so
that `main` would have exactly one writer. That is reversed here, and the reason
is worth stating because the intent behind it was right. Every train trigger is
keyed on **merges**, and a Pulse commit is not a merge — so with the Desk stopped
by `STOP`, by any breaker's `HOLD.md`, by a held train, or simply by having no
qualifying work, the freshness layer would accumulate unpublished and nothing
would say so, because a publish step that is never called never reports that it
published nothing. **The maintainer's own brake on the Desk would have become an
outage on the site.** The intent — no byte reaches the remote in a push whose
declared SHA the pusher's own gates did not examine — is kept in full, and
push-by-SHA is what delivers it for two writers as well as for one.

Today `pulse/lib/publish.mjs:931` is `git(root, ['push','origin','main'])` —
branch-wide, the only push in the codebase, and the Desk routes through the same
file (`loop/lib/publish.mjs:46`). Measured 2026-09-08: five of one session's
seven local commits reached the remote by other sessions' publish steps and none
by any act of its own (`addictedtoai-zuoo`, P1). The compensating control is a
boolean toggled by hand twenty-one times in eleven days and set wrongly at least
once. A flag is a permission; it was never a scope.

## ADDED Requirements

### Requirement: The derived queue is mirrored into the tracker outside the derive step

The derived tree is a pure function of committed state: every run recomputes it
from scratch, and a re-run with no world change is byte-identical. That property
is what makes the queue reproducible from a fresh clone and what makes it
impossible to forget, and it is worth more than the convenience of writing issue
ids into it.

- The derive step SHALL NOT read from or write to the issue tracker, and SHALL
  NOT depend on the tracker being reachable. Minting an issue produces an
  identifier that is not a function of the state being derived, so a derivation
  that minted one would stop being reproducible.
- Mirroring SHALL be a **separate step**, outside the derivation: it opens an
  issue for each derived condition that has none and closes the issue of each
  condition that has cleared.
- The identifier SHALL travel in one direction only: an issue names its condition
  by a stable subject key, and **no issue id SHALL enter `data/derived/`**.
- **Where a mirrored issue and the derived condition disagree, the condition
  wins**, and the disagreement SHALL be reported rather than resolved silently.
  Closing an issue does not clear the condition that produced it; the work that
  clears the condition does.
- Where the tracker is unreachable, the mirror step SHALL be skipped with a
  stated reason and the derivation and the queue SHALL be unaffected.
- Where a run's own commit lands on the integration branch and a later
  recomputation of the derived tree runs over a tree carrying that commit, the
  two derivations SHALL agree byte for byte. They are the same pure function over
  the same committed state. A difference is not a reconciliation problem to be
  resolved: it means an input outside both runs moved, and it SHALL be reported
  as such rather than absorbed.

#### Scenario: A re-run with no world change is still byte-identical

- **WHEN** the engine runs twice with nothing in the world changed and the tracker
  reachable both times
- **THEN** the recomputed `data/derived/` is **non-empty** and hashes identically
  to the derivation the engine itself produced at that commit, file for file, and
  no file under it contains an issue id — a comparison of hashes over a populated
  tree, since two empty trees also match

#### Scenario: A closed issue does not clear a standing condition

- **WHEN** a mirrored issue is closed by hand and the condition it mirrors still
  holds at the next run
- **THEN** the queue still carries the item, the disagreement is reported naming
  the issue and the condition, and the condition governs

#### Scenario: An unreachable tracker does not stop the derivation

- **WHEN** the tracker cannot be reached during a run
- **THEN** the derivation and the queue are computed exactly as they would be
  otherwise, and the mirror step is skipped with its reason stated

#### Scenario: A recomputation over a run's own committed data reproduces it

- **WHEN** a run commits its derived data to the integration branch and a later
  recomputation runs over a tree carrying that commit and no other change to the
  derivation's inputs
- **THEN** the recomputed `data/derived/` is byte-identical to what the first run
  committed, and any difference is reported as an input outside both runs having
  moved

## MODIFIED Requirements

### Requirement: The Pulse publishes what it builds

A local rebuild is not publication. Publishing is a named pipeline step,
controlled by the `publish` flag in `data/config.json`:

- **The step SHALL read the `publish` flag itself**, from `data/config.json`, at
  the moment it runs, and SHALL NOT accept a caller's assertion of it. Two
  engines reach this step and the flag is a reserved-path value either of them
  may find changed since it started; a permission read once and carried is a
  permission that can be stale in the direction that publishes.
- **A run SHALL continue to commit its data and content changes to `main` and to
  publish on its own schedule**, gated by its own rebuild and by nothing the Desk
  does. Its output is deterministic machinery output and is exempt from review on
  the terms `review` already states; and the Desk's brakes are brakes on the Desk.
  `STOP`, a `HOLD.md` from any breaker, a held train or simply no qualifying work
  halt workers and trains — they SHALL NOT halt publication of the freshness
  layer, exactly as today. A brake that froze the live site because the Desk was
  stopped would make the maintainer's own stop button an outage, and it would do it
  silently, since a publish step that is never called never reports that it
  published nothing.
- `main` therefore has **two** writers, and each pushes only a tree its own gates
  ran over: a passing train's fast-forward, and the Pulse's own gated commit. That
  is a narrower claim than "exactly one writer" and it is the true one. The
  property that matters is not that one actor writes, but that **no byte reaches
  the remote in a push whose declared SHA the pusher's own gates did not examine**,
  which the push-by-SHA rule below enforces for both.
- **A train SHALL merge `main` into the integration branch before its gates run**,
  so that the SHA it declares is a descendant of `main` and its gates examine the
  Pulse's work alongside its own. Where a push is refused because the declared SHA
  is no longer a descendant — the Pulse advanced `main` while the train was
  verifying — the train SHALL merge `main` in again and re-run its gates rather
  than widening anything. Two publishers on one branch is a race that the
  fast-forward resolves; re-running the gates is what keeps the resolution honest.
- **When `publish` is `true`** (the operating phase): after a successful rebuild
  and a passing train, the publishing caller SHALL declare **the commit SHA its
  gates ran over**, and the step SHALL push that SHA to the remote branch — a
  push of a verified tree, not of whatever the local branch happens to carry
  (deploy = push; the host builds and serves). The step SHALL refuse the push
  when the declared SHA is **neither a descendant of nor equal to** the remote
  tip, naming the declared SHA and the tip. Where it **equals** the tip there is
  nothing new to publish — the remote already serves that tree, whether because
  this run produced nothing or because another actor pushed the identical commit
  — and the run SHALL say so plainly rather than reporting a scope refusal, which
  would name a problem that does not exist. Every commit reachable from a declared
  SHA was in the
  tree the gates examined, by construction; anything committed after it is simply
  not pushed, and the next verified tree carries it. A refusal on this ground is
  a **scope refusal, not a failure**: it writes no `HOLD.md`, halts neither
  engine, and the run SHALL state that it published nothing and why, in the same
  place it would state that it published — "nothing was pushed" is never silence.
  The step SHALL NOT push while `HOLD.md` stands, whatever brake wrote it.
- It SHALL then verify the deploy by fetching the live site's build stamp (see
  `site`) and confirming that the stamp identifies **the commit this run pushed,
  or a commit that contains it** — the pushed SHA read from the repository
  *after* that commit exists, the stamp read as a hexadecimal abbreviation,
  resolved through the local repository to a commit object, and accepted only
  when the pushed commit is that commit or an ancestor of it. The step MAY
  perform one read-only `git fetch origin main` before resolving, so that a stamp
  naming a commit another actor pushed can be resolved at all: a fetch reads the
  git remote it has just pushed to and is neither a hosting-provider call nor a
  GitHub API call, and it changes nothing outside the local object store. A
  stamp still unresolvable after that fetch SHALL fail closed. The question the
  check asks is whether the bytes this run pushed are being served; a later
  commit that contains them serves them. The
  expected value SHALL NOT be read from the local build's own `status.json`:
  that file is written during the rebuild, which happens before the commit, so
  it names the *previous* commit and a check against it confirms the previous
  run's deploy forever. A stamp that merely changed SHALL NOT satisfy the check,
  and neither SHALL one that resolves to no commit the local repository can
  name: an unresolvable stamp is not evidence of anything and the check SHALL
  fail closed on it.
- **The first budget is not the verdict.** The Pulse SHALL poll for at least 10
  minutes, and where that budget elapses with no match it SHALL poll a **second,
  confirmation window of at least three times the first** before treating the
  deploy as failed. A commit that is not live after ten minutes and is live
  after thirty is a slow deploy, not a missed one, and the two SHALL NOT be
  recorded as the same fact. Only when the confirmation window also elapses is
  the deploy a failure: the Pulse SHALL then write
  `HOLD.md` naming the failure (breaker 2 in `loop`) and suspend further publish
  attempts until the hold clears. Detection is by fetching the live page only —
  no hosting-provider API, no GitHub API; the read-only `git fetch` above
  resolves a stamp against the git remote and is not part of that detection.
- **The hold SHALL name which failure it is**, from a closed and exhaustive set
  computed from the stamps the run actually read. A **reading** is one read of
  the live build stamp taken during the two polling windows — that is, after the
  push. The pre-push baseline is not a reading: it is the value the readings are
  compared against, and a run that read the baseline and then read nothing
  afterwards observed nothing at all about its own deploy. The classifications
  are decided in this order: `unreadable` — no reading succeeded; `never-advanced`
  — at least one reading succeeded and every reading that succeeded returned the
  stamp that was live before the push; and `advanced-elsewhere` — every other
  outcome. The third is written as the complement on purpose: a stamp that was
  unreadable before the push and readable after, one that moved to `unknown` or
  a bare timestamp, and a run whose readings disagreed with each other are each
  neither of the first two, and a classification with a gap in it hands its
  reader a hold that says nothing. The hold SHALL carry the pushed commit, the
  last stamp read, both window durations, and the classification. The three have
  different causes and different recoveries, and a hold that does not say which
  one it is makes its reader re-measure what the run already knew.
- **A deploy hold SHALL be machine-identifiable as one.** The publish step SHALL
  write into `HOLD.md`, on its own line, a marker naming the commit the hold is
  about and the classification. `HOLD.md` has other writers — the Desk's
  consecutive-failure, red-build, review-bypass and reserved-path breakers all
  write it and not one of the four is about a commit — and a re-test that could
  not tell them apart would be asking whether a commit is served on a hold that
  names no commit.
- **A standing deploy hold SHALL be re-tested, and the re-test SHALL take no
  outward action.** On every invocation of the publish step that finds a standing
  hold **carrying that marker**, the Pulse SHALL read the live build stamp once —
  no push, no commit to the remote, nothing that changes the world beyond the
  read-only resolution above — and SHALL append one dated observation to
  `HOLD.md` recording whether the commit the marker names is now served, under
  the same containment test the check uses. It SHALL append at most one
  observation per invocation and SHALL NOT rewrite an earlier one, so the file
  records how long the condition persisted. A standing hold carrying no such
  marker SHALL NOT be re-tested and SHALL NOT be appended to: it was written by
  another brake, about something else. **A dry run SHALL append nothing.** Where
  the publish step is invoked in dry-run mode and a marked hold stands, it SHALL
  read the live build stamp and print the observation it would otherwise append,
  and SHALL leave `HOLD.md` byte-identical — a dry run that mutates a guardrail
  file has contradicted the only thing it promises, and the hold branch is
  reached before the dry-run branch, so the exemption has to be stated where the
  re-test is. Under `publish: false` no re-test is performed and nothing is
  printed or appended for the hold: the disabled line is the whole of that run's
  report, and the re-test is part of deploy verification, which that mode
  performs none of.
- **The re-test SHALL NOT clear, weaken or rewrite the hold**, and SHALL NOT
  resume publishing. Breaker 2 keys on the file's existence and this appends to
  it; a brake that releases itself is not a brake, and clearing a diagnosed halt
  stays what it already is — a decision taken by the maintainer, or by an
  orchestrator between runs, on the record the file now carries.
- **When `publish` is `false`** — a local-only mode: the flag stood at `false`
  for the whole build phase, the launch checklist flipped it to `true` on
  2026-08-29, and the maintainer may hold it down at any time while a larger
  change is in flight. The Pulse SHALL push nothing, SHALL perform no deploy
  verification, and SHALL print **exactly one line** stating that publishing is
  disabled. That line SHALL be printed on every such run, including a run that
  also had to refuse something else, so a stray dirty file cannot suppress it.
  Nothing else in the pipeline changes — **and the commit is part of "nothing
  else"**: it is a separately governed step which this flag does not gate (see
  "A run's computed state is committed whether or not it is published").

Without this step the site would rebuild locally forever while the live
domain stayed frozen; a Pulse run that completes without the live site
changing is not a success when publishing is enabled.

#### Scenario: An operating-phase run reaches the live site

- **WHEN** the Pulse runs with `publish: true` and the rebuild succeeds
- **THEN** the changes are committed and pushed, and the run's final step
  confirms the live build stamp now carries the commit this run pushed

#### Scenario: A verified tree is pushed and a later commit is not

- **WHEN** the caller declares a verified SHA, a further commit lands on the
  local branch after that SHA, and the push runs
- **THEN** the declared SHA is pushed to the remote branch, the later commit is
  not pushed, and the next verified tree carries it

#### Scenario: A declared SHA that is not a descendant of the remote tip is refused

- **WHEN** the caller declares a SHA that the remote tip is not an ancestor of
- **THEN** the push is refused naming the declared SHA and the tip, no `HOLD.md`
  is written, and the run reports that it published nothing and why

#### Scenario: STOP stops the scheduled run entirely

- **WHEN** `STOP` stands at the repository root
- **THEN** the scheduled run exits immediately before fetching,
  committing, or pushing, and the Desk starts no worker and no train

#### Scenario: A standing hold stops the push but not the commit

- **WHEN** a breaker's `HOLD.md` stands, and a scheduled run rebuilds
  successfully with publishing enabled
- **THEN** the Desk starts no worker and no train, and the run still
  commits its own gated tree, but does not push it: the run reports
  the hold, and the live site keeps serving the last published tree
  until the hold clears

#### Scenario: A train that fell behind merges and re-gates rather than widening

- **WHEN** a train's push is refused because a scheduled run advanced the remote
  tip while the train was verifying
- **THEN** the train merges the remote branch in and re-runs its gates, and no
  declaration is widened to get the refused push through

#### Scenario: Nothing new to publish is not a refusal

- **WHEN** the declared SHA equals the remote tip
- **THEN** the run reports that there was nothing to publish, and does not report
  a scope refusal

#### Scenario: The step reads the flag rather than being told it

- **WHEN** a caller invokes the publish step asserting that publishing is enabled
  and `data/config.json` reads `publish: false` at that moment
- **THEN** nothing is pushed and the run prints the one disabled line

#### Scenario: A later commit that contains this one is a landed deploy

- **WHEN** the live build stamp resolves to a commit that has the pushed commit
  as an ancestor — another publisher pushed on top while this run was polling
- **THEN** the check passes, because the bytes this run pushed are being served,
  and no hold is written

#### Scenario: The stamp has to name the commit, not merely differ

- **WHEN** the live build stamp changes to a value that is not a hexadecimal
  abbreviation of the pushed commit or of any commit containing it — an
  unrelated commit, `unknown` from a builder with no git, or a bare timestamp
- **THEN** the check does not pass, and the run treats the deploy as not landed

#### Scenario: A slow deploy is not a missed one

- **WHEN** the live stamp does not carry the pushed commit within the first
  polling budget and does carry it during the confirmation window
- **THEN** the deploy is reported as landed, no `HOLD.md` is written, and the run
  records that it took the confirmation window

#### Scenario: A deploy that does not land is a halt, not a shrug

- **WHEN** the push succeeds and neither the first budget nor the confirmation
  window sees a stamp carrying the pushed commit
- **THEN** the Pulse writes `HOLD.md` naming the deploy failure and makes
  no further publish attempts until the hold is cleared

#### Scenario: The hold says which failure it is

- **WHEN** every stamp read during both windows is the value that was live
  before the push
- **THEN** the hold records the classification `never-advanced`, the pushed
  commit and the last stamp read — distinguishably from a hold whose stamp moved
  to some other commit

#### Scenario: A run that read nothing after the push says so

- **WHEN** the stamp live before the push was read, and every reading taken
  during both polling windows failed
- **THEN** the hold records the classification `unreadable`, and does not report
  the stamp as unchanged since before the push

#### Scenario: A standing hold records that its cause has passed

- **WHEN** a deploy hold stands, a later push by another actor has deployed, and
  the publish step is invoked again
- **THEN** the step takes no outward action, appends one dated observation to
  `HOLD.md` saying the held commit is now served, and the hold file is still
  there afterwards

#### Scenario: A hold another brake wrote is left alone

- **WHEN** the Desk's reserved-path breaker has written `HOLD.md`, that file
  carries no deploy marker, and the publish step is invoked
- **THEN** no live stamp is read for it, nothing is appended, and the file is
  byte-identical afterwards

#### Scenario: A dry run observes a standing hold without touching it

- **WHEN** the publish step is invoked in dry-run mode while a marked deploy
  hold stands
- **THEN** the observation is printed, `HOLD.md` is byte-identical afterwards,
  and nothing is pushed

#### Scenario: The re-test does not resume publishing

- **WHEN** the re-test observes that the held commit is now served
- **THEN** nothing is pushed, the hold is not removed or altered apart from the
  appended observation, and the Desk still refuses to start

#### Scenario: Build phase publishes nothing

- **WHEN** the Pulse runs with `publish: false`
- **THEN** no push occurs, and the run log contains one line stating
  publishing is disabled
