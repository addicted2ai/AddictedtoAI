# pulse — delta for tell-a-missed-deploy-from-a-slow-one

One requirement modified. Nothing about the publish step's ordering, its
commit half, its `publish: false` line, or the fact that a deploy that does not
land halts the engine is changed. What changes is the question the deploy check
asks — *are the bytes this run pushed being served* rather than *is my exact SHA
the stamp* — the addition of a second, longer confirmation window before the
halt, the naming of which of three deploy failures a hold records, and a
read-only re-test of a standing hold that takes no outward action and clears
nothing.

The halt itself is untouched, deliberately. `addictedtoai-k2y0` lists "leave the
halt exactly as it is" among its options and the reason it is defensible: this
is the failure mode the brake exists for, and it fired once in about forty
publishes. What was not defensible was the halt outliving its cause by three
hours with nothing in the system able to discover that, and a hold text that
could not tell a reader which of three different conditions they were in.

## MODIFIED Requirements

### Requirement: The Pulse publishes what it builds

A local rebuild is not publication. Publishing is a named pipeline step,
controlled by the `publish` flag in `data/config.json`:

- **When `publish` is `true`** (the operating phase): after a successful
  rebuild, the Pulse SHALL commit its data and content changes and push
  `main` to the remote (deploy = push; the host builds and serves). It SHALL
  then verify the deploy by fetching the live site's build stamp (see `site`)
  and confirming that the stamp identifies **the commit this run pushed, or a
  commit that contains it** — the pushed SHA read from the repository *after*
  that commit exists, the stamp read as a hexadecimal abbreviation, resolved
  through the local repository to a commit object, and accepted only when the
  pushed commit is that commit or an ancestor of it. The step MAY perform one
  read-only `git fetch origin main` before resolving, so that a stamp naming a
  commit another actor pushed can be resolved at all: a fetch reads the git
  remote it has just pushed to and is neither a hosting-provider call nor a
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
  attempts until the hold clears. Observation of the deploy is by fetching the
  live page only — no hosting-provider API, no GitHub API; the read-only
  `git fetch` above resolves a stamp against the git remote and is not an
  observation of the deploy.
- **The hold SHALL name which failure it is**, from a closed and exhaustive set
  computed from the stamps the run actually read: `unreadable` — no reading
  succeeded at all; `never-advanced` — every reading succeeded and every one
  returned the stamp that was live before the push; and `advanced-elsewhere` —
  the residual, meaning at least one reading succeeded and the readings were not
  all the pre-push baseline, whether or not the value they carry names a commit
  at all. The residual is written as a residual on purpose: a stamp that was
  unreadable before the push and readable after, or one that moved to `unknown`
  or a bare timestamp, is neither of the first two, and a classification with a
  gap in it hands its reader a hold that says nothing. The hold SHALL carry the
  pushed commit, the last stamp read, both window durations, and the
  classification. The three have different causes and different recoveries, and
  a hold that does not say which one it is makes its reader re-measure what the
  run already knew.
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
  another brake, about something else.
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

#### Scenario: The re-test does not resume publishing

- **WHEN** the re-test observes that the held commit is now served
- **THEN** nothing is pushed, the hold is not removed or altered apart from the
  appended observation, and the Desk still refuses to start

#### Scenario: Build phase publishes nothing

- **WHEN** the Pulse runs with `publish: false`
- **THEN** no push occurs, and the run log contains one line stating
  publishing is disabled
