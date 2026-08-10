# Changelog & Loop Log

This file is the loop's memory **and the site's most important page.**
It is parsed at build time and published at `/log`, so every entry below
is public, permanent, and the primary evidence for what this project
claims. Write accordingly: honestly, and including the failures.

## What this project is
An AI builds this site. A human sets the rules it builds under, and the
record says which rounds were which.

A human wrote the first commit — a bare Next.js skeleton with four empty
pages. Everything on the site since has been written by a model. But the
direction, the charter it operates inside, and the machinery that runs it
are human-set, and rounds differ in how much a human saw before they
landed. That is recorded per round rather than asserted, because it is the
part a reader has most reason to doubt.

Each entry carries an **Origin**:

- `unsupervised` — scheduled, merged itself, nobody read it first
- `supervised` — a human triggered the run and could veto before merge
- `maintainer` — a human decided what and why; an assistant did the typing

Rounds 1–47 predate the field and were all `supervised`: every one was
hand-triggered locally. Their entries are not edited to say so — amending
past entries is what `CHARTER.md` rule 5 forbids — so an absent Origin
means exactly that, and the number of entries without one is asserted in
CI so it cannot quietly grow.

The evidence is the product. An entry recording a hypothesis that turned
out to be wrong, or a check that passed while measuring the wrong thing,
is worth more here than another entry saying something went fine — those
are the ones a sceptical reader believes. Never write an entry that
flatters the work.

## Direction
See `CHARTER.md`. The short form: build an AI hub good enough that a
stranger would use it without caring how it was made, then let how it was
made be the second surprise. Work that advances the site must pass both
tests in the charter; the track charges there say what each kind of run is
for.

This replaced a north-star metric — returning-visitor rate — that never
had a data source. Analytics has never been configured in production, so
all 47 rounds recorded "Result: not yet measured" against a number nothing
could read. Metrics will return once they can be observed, and will be
published rather than optimised.

## Guardrails (never regress these)
- Lighthouse: performance >= 0.80, accessibility / SEO >= 0.85 —
  each asserted against the median of 3 runs (see `lighthouserc.json`).
  Performance's floor was lowered from 0.85 and runs went from 1 to 3
  with median scoring on 2026-08-09 after single-run performance scores
  proved too noisy on shared CI hardware to gate on reliably (the same
  untouched homepage scored 0.83 then 0.74 back to back). Accessibility
  and SEO are static-analysis checks, not timing-based, so they weren't
  the noisy ones and stayed at 0.85.
- Page weight: the HTML document must stay under 150,000 bytes over the
  wire, asserted per URL against the median of 3 runs. Only `/log` is
  anywhere near it (63.5 KB at 34 rounds); the budget exists because
  that page grows by about 1.9 KB gzipped every round and nothing else
  would have said so until it was already slow.
- Zero net-new broken links
- No failed deploy / rollback

---

## Log

### 2026-08-10
The first loop run on GitHub's own infrastructure did real work for six minutes
and then hit a turn limit and vanished, leaving nothing behind at all.

**1. Remove the turn limit**
- Hypothesis: `--max-turns 40` was inherited from the old single-prompt loop,
  which made one small change per round. A maintain round has to fetch twelve
  vendor pages before it can compare anything, so the limit guaranteed that any
  research-shaped track failed — scout, maintain and audit all fetch external
  sources by design, which is the entire reason they have web access. The first
  real maintain run spent 41 turns and $2.42 and was cut off before it could
  commit. Removing the limit and relying on the 45-minute job timeout should let
  those tracks finish, with inference still bounded by the maintainer's
  subscription under rule 15.
- Change: `--max-turns` removed. The runaway guard is now wall-clock only.

**2. Make a failed run visible**
- Hypothesis: a run that dies mid-round produces no branch, no pull request and
  no changelog entry, so "no round shipped" is indistinguishable from "no round
  was attempted". The record therefore contains only the runs that worked, which
  is a numerator with no denominator and flatters the work in exactly the way
  rule 7 forbids. The site publishes rounds shipped and cannot see any of this.
- Change: the workflow now reports its outcome on every run, including failures,
  and says plainly that a failed round wrote nothing. Added
  `scripts/loop-history.mjs`, which reads the Actions API — the only place
  attempts are recorded — and reports attempted, succeeded, failed and merged.
  Run against live data at the time of writing it says: 2 attempted, 0
  succeeded, 1 round merged. None of that is currently on the site, and a docket
  item is filed to put it there.

- Origin: maintainer
- Track: meta
- Guardrails: `loop.yml` parses and the run job's steps are in the expected
  order; `loop-history.mjs` runs against the live API and reports the numbers
  above. One thing was caught while writing it: the reporting step was first
  given `continue-on-error` so it could read the outcome, which would have made
  a failed round report success — masking a failure in order to describe it. It
  reads the outcome under `if: always()` instead, which does not swallow it.
- Result: not measured. The observable outcome is that the failure rate is now
  computable at all; it was not before.

### 2026-08-10
The entry below broke the build by describing the bug it was fixing.

**1. Writing about a citation counted as making one**
- Hypothesis: `getBuildLog()` scans an entry's whole body for `(PR #N)` to
  decide which pull requests it cites. The entry documenting the anchor
  collision quoted that exact string twice while explaining it, so the parser
  read the quotation as a citation, handed that entry pull request 1, and gave
  it the same anchor as the round that actually shipped as #1 — reintroducing
  the duplicate permalink the entry was written to record fixing. Excluding
  code spans should separate quoting a citation from making one.
- Change: inline code spans are stripped before pull request numbers are
  extracted. Verified three ways: an entry that only quotes a citation now
  claims nothing, one that makes a citation still claims it, and one that does
  both claims only the real one.

This is the second time the record's habit of writing about its own markup has
broken a parser reading entry prose. `check-routes.sh` already carries the
same note about round 30, whose write-up quotes a URL while explaining that it
404s — a lesson recorded hours earlier, in a comment, and then walked into
again from the other direction. Anything that scans this file for a pattern the
file also discusses has to exclude quotation, and that is now written next to
both parsers rather than in one comment.

- Origin: maintainer
- Track: meta
- Guardrails: reproduced the CI state locally — an entry quoting a citation
  alongside a round genuinely citing `#1` — and confirmed both anchors are
  distinct and every round links to the target its era has.
- Result: not measured. Four consecutive pull request failures now, each a
  different genuine defect, none of which reached `main`.

### 2026-08-10
Three more defects in the same machinery, found by trying to merge the round
that found the first four. Each blocked a pull request that was correct.

The pattern across all seven is now clear enough to name: every one was a
collision between the predecessor repository's pull request numbers and this
one's, and each fix addressed a single surface — the link target, then the
anchor, then the check — while leaving the others keyed on a bare integer that
had stopped being unique. Fixing one layer and shipping it green, three times.

**1. Two rounds claimed the same permalink**
- Hypothesis: the badge fix keyed the link target on era but left the anchor id
  keyed on a bare pull request number. Archived round 1 and the first round
  shipped here both cite `(PR #1)`, so both wanted `round-pr-1` — two rounds
  sharing a permalink, with a citation resolving to whichever the browser
  reaches first. Marking the archived ones should keep `round-pr-N` meaning
  "pull request N in this repository", which is what anyone building a link by
  hand would assume.
- Change: archived rounds now use `round-archived-pr-N`. This renames 47
  anchors, a breaking change to a published surface, taken now because the site
  is hours old and its only consumer is a feed that regenerates from the same
  parse.

**2. The duplicate looked like a missing round**
- Hypothesis: the round-count assertion compared unique anchors against the
  changelog's round count, so a duplicate anchor and a dropped round produce an
  identical message. CI reported "renders 49 rounds, CHANGELOG.md has 50" when
  nothing was missing, which sends a reader looking in the wrong place.
  Comparing total anchors against unique ones should distinguish them.
- Change: the check now reports the duplicated id by name. Proved by reverting
  the anchor fix with a colliding round present: "duplicate round anchors — 50
  ids, 49 unique: id=round-pr-1".

**3. A check that fired on correct output**
- Hypothesis: a "belt and braces" assertion flagged any `/pull/N` link whose N
  appeared in the archive. It predated the era distinction and collected hrefs
  from the whole page, so it could not tell which round a link came from — only
  that the number also existed in the archive. Once a round could legitimately
  cite this repository's own #1, it began failing on correct output, and it
  blocked the first real round for citing its own pull request. The per-round
  era check already asserts both directions with the information this one
  lacked.
- Change: removed rather than repaired. A second check over strictly less
  context could only ever disagree with the first, and a check that fires on a
  correct state costs more than the one it duplicates.

- Origin: maintainer
- Track: meta
- Guardrails: the CI scenario was reproduced locally before and after —
  a current-era round citing `(PR #1)` alongside archived round 1 — and now
  passes with unique anchors and both link targets correct. `check-routes.sh`
  also reports skipped groups separately from passing ones: the badge
  assertions correctly skip when `NEXT_PUBLIC_REPO_URL` is unset, but the
  summary still said "all route checks passed", so a hand-started run could
  read that as covering links it never examined.
- Result: not measured. Observable outcome: three consecutive pull request
  failures, each on a different genuine defect, none of which reached `main`.

### 2026-08-10
The first real run of the new machinery found four bugs in it, all mine, and
one of them had broken every pull request the system could ever produce. This
round fixes them. The run itself is PR #1 and is still open; this entry is
about the machinery it ran on, not the work it did.

Worth stating plainly: every one of these shipped with a green check beside it.
The checks were real and I had proved each could fail — against inputs I chose,
in a working copy I had written by hand. None of them had ever seen a fresh
checkout, a second repository's numbering, or a changelog entry wrapped the way
every other entry in the file is wrapped.

**1. Line endings broke every docket parse on Windows**
- Hypothesis: `check-docket.mjs`, `preflight.mjs` and `dispatch.mjs` all match
  frontmatter with a regex anchored on a bare newline. Git for Windows checks
  out CRLF by default, so on any Windows working copy the frontmatter block
  matches nothing and every docket item reads as malformed. CI runs on Linux
  with LF and is unaffected — meaning the checks pass exactly where they are
  tested and fail on the machine where rounds are started by hand. Forcing LF
  at checkout and normalising on read should make the parsers independent of
  how the file arrived.
- Change: Added `.gitattributes` with `* text=auto eol=lf`, and a `readText()`
  helper in all three scripts. Verified against genuinely CRLF copies of the
  real docket items, which now parse.

**2. Round badges would have cited the wrong change for 48 rounds**
- Hypothesis: `RoundRef` decided commit-link versus pull-request-link solely by
  whether the number appears in `archive/prs.json`, which holds 1–48. This
  repository restarted numbering at 1, so every new round from #1 to #48 would
  have rendered a link to an unrelated predecessor commit. Both URLs return
  200, and the existing assertion only checked that archived rounds do not link
  to pull requests — the other direction, which is the one that bites. Deciding
  era from whether the round declares an `Origin` should be correct, because
  rounds predating that field are exactly the 47 archived ones and CI already
  pins that count.
- Change: `RoundRef` consults the archive only for rounds that predate the
  Origin field. Each round now carries `data-era`, and the route checks assert
  both directions. The first round through the system shipped as #1 and would
  have hit this immediately.

**3. A wrapped change heading silently lost the change**
- Hypothesis: the parser requires `**N. Title**` to open and close on one line,
  while everything else in this file hard-wraps at about 76 columns. A wrapped
  heading is absorbed as prose, the round ships with fewer changes than it
  describes, and `validateEntries` cannot see it because it only checks that
  changes which already parsed are complete. PR #48 set out to make "a quiet
  incomplete public record" an actionable failure; this is the same defect one
  level up. Counting headings that *start* and comparing against those that
  parse should make the loss loud.
- Change: `getBuildLog()` now fails the build naming the round and both counts.
  The first version of this check did not fire: a failed heading leaves its
  bullets at entry level, where the normalisation for pre-heading entries folds
  them into one unnamed change, so the totals matched. It compares against
  named changes now, and was re-proved against both a wrapped heading and a
  dropped one.

**4. A broken lockfile failed CI on every pull request**
- Hypothesis: adding `js-yaml` from Windows wrote a `package-lock.json` whose
  platform-specific optional dependencies do not resolve on Linux, so `npm ci`
  exits before any check runs. Nothing caught it because no pull request had
  existed on this repository until now — the lockfile was committed and pushed
  straight to `main`, which is precisely what branch protection now prevents
  the loop from doing. A clean reinstall should produce a consistent lockfile.
- Change: Regenerated `package-lock.json` from a clean install; `npm ci` now
  agrees with `package.json`. Also added `"root": true` to `.eslintrc.json`,
  which was causing an ESLint cascade conflict for any checkout nested inside
  another, and added `.gitattributes` and `.eslintrc.json` to the meta track's
  path scope — the scout run could see both problems and was allowed to touch
  neither.

- Origin: maintainer
- Track: meta
- Guardrails: `npm run lint`, `npm run build`, docket check, preflight,
  dispatcher and all route checks pass. Each new assertion was proved able to
  fail: reverting the era fix produced "current round links to …/commit/…,
  expected a pull request"; a wrapped heading and a dropped heading each
  produced the expected build error; the CRLF fix was verified against real
  CRLF copies rather than synthetic strings.
- Result: not measured. The observable outcome is that `npm ci` succeeds, so
  pull requests can now reach their checks at all.

### 2026-08-10
A scout round. Nothing was built and nothing was published; the output is five
docket items. Four came from outside the repository — the EU AI Act's
transparency obligations became applicable eight days ago and land squarely on
what this site is, and half the Directory now describes products that have moved
since it was written. The fifth did not, and is disclosed as such below. (PR #1)

**1. File the 2 August transparency deadline as build and author work**
- Hypothesis: The site's charge is to be current about AI, and the largest thing
  that changed in the field recently is regulatory rather than technical. I
  expected the EU AI Act's August milestone to be either already handled or too
  diffuse to act on. It was neither: Article 50's transparency obligations became
  applicable on 2 August 2026, and the obligation on deployers publishing
  AI-generated text turns on whether the publication had human review and
  editorial responsibility — the exact distinction this site already records per
  round in its `Origin` field. That coincidence is the item; a compliance chore
  would not have been worth filing.
- Change: Two items. A build item to give every page a disclosure that is
  machine-readable and derived from the record rather than hardcoded, and an
  author item for a post that separates what actually applied on 2 August from
  the high-risk obligations the Digital Omnibus deferred to 2 December 2027 —
  a distinction most coverage runs together — using this site as the worked
  example. Both cite the Commission's own FAQs and its Code of Practice on
  Transparency of AI-generated Content, retrieved this round. Neither item
  asserts that the site is in scope; both require the run that executes them to
  reach and publish its own conclusion.

**2. Check the Directory against the vendors' own pages**
- Hypothesis: The seeded scout item asks what the Directory is missing. I
  expected the answer to be missing tools. Fetching each entry's link instead
  suggested the descriptions were the problem, so I checked them one at a time.
- Change: Of the twelve entries, seven were re-fetched against the vendor's own
  page on 2026-08-10 and six of those had moved: n8n, You.com, Ollama,
  HuggingChat, ElevenLabs and Runway. Five are staleness. One is a false claim —
  the site calls n8n "open-source", and n8n's documentation says "we do not call
  ourselves open source", with a licence restricting commercial use. Every link
  still returns 200, so nothing here could have noticed; `runwayml.com` now
  308-redirects to `runway.com` and a redirect-following link checker will report
  it green forever. Filed as a maintain item naming each correction, plus a build
  item on the structural half: the four categories predate agents and MCP, the
  words "agent" and "MCP" appear nowhere in `app/`, and the six repositionings
  all point the same way. Five entries were not re-verified and are recorded as
  not asserted either way, rather than being padded into findings.

**3. Record two /log bugs found while running this round's checks**
- Hypothesis: None — this was not sought. While checking what number this
  round's pull request would get, I expected the migration round's badge fix to
  cover it.
- Change: It does not. `/log` decides between a commit link and a pull request
  link solely by whether the number appears in `archive/prs.json`, which holds
  1–48. This repository was created today with no pull requests, so GitHub will
  number the next one 1, and the next 48 rounds built here will each render a
  badge pointing at an unrelated predecessor commit. The migration round fixed
  the collision in one direction and the code comment describes an intent the
  function cannot carry out, because a bare integer does not say which era it is
  from. Both return 200, so no existing check can see it.
  The same pass surfaced a second one. The changelog parser recognises a
  numbered change heading only when the whole bold heading sits on one line, so
  a heading that hard-wraps is silently dropped as a change and absorbed as a
  note. Two of this entry's three headings did exactly that on the first
  attempt, and the entry still validated, because the round that added entry
  validation checked for missing fields rather than for change blocks that fail
  to parse at all. It was caught only by inspecting the parser's output instead
  of trusting a green check — the failure the record has already made twice.
  Both are filed as one maintain item. This entry first omitted its own
  `(PR #N)` rather than publish a citation known to resolve to the wrong
  change; the maintainer fixed both on `main` before this round merged — a
  round’s era now comes from whether it declares an `Origin`, and a heading
  that starts but fails to parse now fails the build — so the citation is
  restored and the workaround is gone. The item is honest in its own text that its origin is
  internal, which means one of the five items filed this round could have been
  written without leaving the repository — a partial miss against scout's stated
  failure condition, disclosed rather than dressed up.

- Origin: supervised
- Track: scout
- Guardrails: Run twice, and the difference is the point. As this round first
  ran, four things were broken. `npm ci` could not install at all — the
  committed lockfile was missing `@emnapi/wasi-threads`. `npm run lint` exited
  1 on an `@next/next` plugin conflict. `node scripts/check-docket.mjs`
  rejected all four pre-existing items, because it parsed frontmatter with an
  LF-only regex against a CRLF working copy, so no docket item validated on a
  Windows checkout. And `/log` would have cited the wrong change for the next
  48 rounds. Only the last of those was found by looking for it; the other
  three were found by the checks themselves failing, which is the argument for
  running them on a machine that is not CI. The maintainer fixed all four on
  `main` in a separate round before this one merged. After merging `main` into
  this branch: `npm ci` exits 0, `npm run lint` reports no warnings or errors,
  `check-docket.mjs` passes 9 items natively on Windows, and
  `node scripts/check-track-scope.mjs main
  loop/scout/transparency-rules-and-directory-drift` passes with six files, all
  inside `docket/` and this one. Three assertions were then checked for whether
  they can actually go red, rather than trusted for being green: stripping the
  external links from one new docket item produced the expected evidence-rule
  failure; wrapping a change heading in a copy of this file produced `round 49
  (3 heading(s) written, 2 parsed)`; and replaying the badge logic over the real
  log confirmed that round 49 resolves `#1` to `/pull/1` while archived round 1
  resolves the same number to its commit. No code was changed by this round.
- Result: not measured. A round that files queue items has nothing to measure
  until something acts on them; the only checkable output is whether the items
  are still true when picked up, and whether any of them turn out to have been
  written without leaving the repository.

### 2026-08-10
A human-directed session, not a loop round. The site moved to a public
repository, the loop gained a written charter it cannot amend, and the
north-star metric was replaced with a direction. It is recorded here because
`CHARTER.md` rule 8 says the record's completeness is never traded against the
site's quality, and this is precisely the work that would otherwise go
unwritten: it does not feel like a round, so it slips out of the log.

Nothing here went through a pull request. Every change was pushed straight to
`main` — which rule 10 forbids the loop from doing, and which a maintainer round
is not entitled to either. It was possible only because the branch is not
protected yet. That is a gap, and it closes when protection goes on.

**1. Publish from a new repository, and archive the old one**
- Hypothesis: The repository was private because 48 `refs/pull/*` refs carry a
  personal email address in commit metadata, and neither a force-push nor a
  history rewrite can clear them — GitHub keeps those refs permanently, and
  deleting the repository does not remove them either. Seeding a *new* public
  repository with the same history, email-scrubbed, should make the record
  publicly verifiable while exposing nothing, because a new repository starts
  with no pull refs at all.
- Change: Rewrote author and committer emails across all 129 commits with
  `git filter-repo` and pushed to a new public repository. The migrated `HEAD`
  tree hash is byte-identical to the pre-migration one, so nothing but metadata
  changed. The predecessor is archived and stays private permanently.

**2. Link archived rounds to commits rather than pull request numbers**
- Hypothesis: Pull requests cannot be migrated, so numbers 1–47 are unclaimed in
  the new repository and will be reused by unrelated pull requests. Pointing
  `/log` at `/pull/22` would produce a link that resolves to the wrong change —
  worse than a dead one, and invisible to any HTTP check, since it returns 200
  either way. Linking archived rounds to their commit should make every citation
  resolve to the thing it claims.
- Change: Exported all 48 predecessor pull requests to `archive/prs.json`, with
  merge commits translated through the rewrite, and `/log` now resolves each
  round's badge by era. Which rounds are archived is derived from that file, not
  from a cutoff constant.

**3. Adopt a charter the loop cannot amend**
- Hypothesis: The loop is about to run every few hours and merge its own work.
  Guardrails it can retune are not a boundary. Putting the fixed rules in a file
  that requires human review under `CODEOWNERS` should make the boundary
  mechanical rather than honour-based, because auto-merge waits on required
  reviews as well as required checks.
- Change: Added `CHARTER.md` — 21 rules covering truth, the record, the limits of
  autonomy, inference, and restraint — and `.github/CODEOWNERS` covering the
  charter, the workflows, the prompts, and itself.

**4. Replace the north-star metric with a direction**
- Hypothesis: Returning-visitor rate never had a data source. Analytics has never
  been configured in production, so every round's "not yet measured" was measured
  against a number nothing could read. A metric is also a hill, and hill-climbing
  on the only reachable terrain is what produced 47 rounds of refining this
  site's own scaffolding. A direction that can reject work should do what a
  metric could not.
- Change: The charter now carries a direction, two tests that gate work, and six
  track charges, each with the condition that makes it a failure. Ownership of
  what this site is for moved from the loop to the maintainer.

**5. Record how much a human saw**
- Hypothesis: The site claimed every change since the first commit was proposed,
  built, measured and shipped by a model given "no further instructions". That
  was never quite true — every round so far was hand-triggered — and this session
  made it plainly false. Recording an origin per round should replace an
  unfalsifiable boast with a figure a reader can check, and give the project an
  arc: the share of rounds that ran unattended is currently zero.
- Change: Entries now carry an `Origin` of `unsupervised`, `supervised`, or
  `maintainer`. Rounds 1–47 predate the field and were all supervised; their
  entries are *not* edited to say so, because rule 5 forbids amending past
  entries. An absent Origin means exactly that, and CI asserts the number of
  entries without one never grows.

**6. Date two rounds that had shipped but still said Unreleased**
- Hypothesis: Rounds 42 and 48 were merged but still rendered as "Unreleased",
  because the step that converts the label to a date was silently dropped after
  round 42 and no check noticed — every assertion derives its expectation from
  the changelog, so page and file agreed while both were wrong. A check that
  takes its expected value from the artefact under test can only catch
  transcription errors, never truth errors.
- Change: Dated both to their merge commits (42 → 2026-08-09, 48 → 2026-08-10).
  This is an amendment to past entries and is disclosed rather than made
  quietly: only the status label moved, which is the transition the format
  always intended, and no entry text was altered.

- Origin: maintainer
- Guardrails: `npm run lint`, `npm run build` and all route checks pass. The
  three new assertions covering commit links were each confirmed able to fail
  before being trusted — a corrupted SHA and a deliberately broken era map both
  produced the expected red. The first draft of one of them was wrong in a way
  worth recording: it scanned the whole document for `/pull/` and failed on round
  30, whose write-up *quotes* that string as prose while explaining the URL 404s.
  It reads badge hrefs only now. Separately, CI was building with no repository
  URL configured, so every assertion about round badges would have passed against
  markup no visitor sees — the same failure as the analytics build measured on
  the wrong server. Fixed at job level.
- Result: not measured, and not measurable in the usual sense: this session
  changed what the project is for, so there is no before-and-after to compare.
  What is observable is that `/log` now resolves 47 commit links that previously
  rendered as inert badges, and that the site's claims about its own autonomy
  now match what happened.

### 2026-08-10
Search inputs identify their counts and controls, but their result targets
are still anonymous containers, and the changelog parser can render an
incomplete entry without failing the build. (PR #48)

**1. Give Directory results a named region**
- Hypothesis: Directory search declares `aria-controls="directory-results"`,
  but that id currently points to a generic `div` with no accessible name.
  Making the target a labelled section should tell assistive technology what
  content the search changes without altering the existing filtered cards.
- Change: Wrapped Directory results in a named `<section>` with a visually
  hidden heading and kept the existing result id so the input relationship
  remains stable.

**2. Give Log results a named region**
- Hypothesis: The Build Log search has the same anonymous result target, and
  its input points directly at the ordered list rather than a named region.
  A labelled section around the list should make the relationship explicit
  while preserving the list semantics and existing filter behavior.
- Change: Added a named Log results section around the ordered list and
  pointed `aria-controls` at that region; the list keeps its original id for
  filtering code and round counting.

**3. Fail fast on incomplete build-log entries**
- Hypothesis: The parser currently counts a round even if a malformed
  changelog shape silently loses a hypothesis, change, guardrail, or result.
  Validating those required evidence fields during the build should turn a
  quiet incomplete public record into an actionable failure before deploy.
- Change: `getBuildLog()` now rejects any entry without at least one complete
  change and all required outcome fields, identifying the affected PR or
  positional round in the build error.

- Guardrails: pass locally. `npm run lint`, `npm run build`, and route checks
  pass; the route checker asserts both named result regions, and a temporary
  malformed changelog entry made the build fail with the affected round before
  the entry was restored. (PR #48)
- Result: not yet measured.

### 2026-08-10
The build log is now a useful RSS source, but its summaries can expose the
changelog's inline Markdown literally, and its dates are only visual text.
(PR #47)

**1. Keep RSS round summaries readable**
- Hypothesis: RSS descriptions currently reuse changelog prose directly, so
  a summary containing backticks or emphasis can show raw Markdown markers in
  a feed reader that does not render the site's inline syntax. Stripping the
  supported inline formatting before XML escaping should keep the evidence
  readable without duplicating the full Log entry.
- Change: Added a shared `stripInlineMarkdown()` helper and applied it to
  build-log RSS summaries. The feed still escapes the resulting plain text as
  XML and leaves the full formatted record on `/log`.

**2. Mark dated Log rounds as dates**
- Hypothesis: The Log currently displays dated headings as plain text, so
  assistive technology and crawlers have to infer their meaning from a class
  and a string. Rendering dated entries as `<time dateTime="YYYY-MM-DD">`
  should expose the same date semantically while leaving the Unreleased state
  honest and unchanged.
- Change: Dated round labels now render inside `<time>`; the current
  Unreleased label remains a plain span because it has no calendar date.

**3. Keep feed and Log evidence formats under the route gate**
- Hypothesis: Existing checks prove RSS item count and Log round count, but
  neither would catch Markdown leaking into feed descriptions or a dated
  round losing its machine-readable date. Assertions derived from the
  changelog and rendered output should make both regressions fail before a
  deployment.
- Change: Extended `scripts/check-routes.sh` to reject raw Markdown markers in
  RSS descriptions and to require one rendered `<time>` for every dated
  changelog heading.

- Guardrails: pass locally. `npm run lint`, `npm run build`, and route checks
  pass; the feed contains plain-text summaries, the Log exposes every dated
  round as `<time>`, and the assertions were exercised against deliberately
  malformed local output before restoration. (PR #47)
- Result: not yet measured.

### 2026-08-10
The two shareable searches write their state into the URL, but browser
history could change that URL without changing the visible filter, and a
Log permalink conflict still compared against hidden assistive copy. (PR
#46)

**1. Let Directory search follow browser history**
- Hypothesis: Directory search persists `?q=` so a filtered view can be
  shared, but the component only reads that query on mount. If a visitor
  uses browser history to return to a previous Directory URL, the address
  bar can change while the visible tool list stays filtered to the old
  query. Listening for `popstate` should keep the shareable URL and the
  displayed results synchronized.
- Change: Directory search now adopts the query from the URL on browser
  history changes, while preserving the existing replace-state behavior for
  typing and the hydration-safe empty first render.

**2. Let Log search follow browser history**
- Hypothesis: The Build Log has the same URL-backed state gap, but its
  filter also hides server-rendered entries and has a permalink/hash rule.
  Applying a history query through the same filter and hash-handling path
  should make Back/Forward restore the visible rounds and the matching
  permalink behavior together.
- Change: Log search now listens for `popstate`, reapplies the URL query to
  the existing entries, updates the result count, and re-runs the hash
  reconciliation without adding history entries of its own.

**3. Make Log permalink conflicts use visible copy**
- Hypothesis: Filtering deliberately excludes `.visually-hidden` labels, but
  the rule that decides whether a permalinked round matches the active query
  still reads raw `textContent`. A query that only matches a hidden "copy
  link" instruction could therefore keep a permalinked round hidden. Using
  the same cleaned text as filtering should make the conflict rule truthful.
- Change: The permalink/hash reconciliation now uses the cached searchable
  text with hidden nodes removed, so it agrees with the result set it is
  meant to reveal.

- Guardrails: pass locally. `npm run lint`, `npm run build`, and route checks
  pass; browser checks cover Directory and Log URL adoption, history changes,
  and a hidden-only permalink query. (PR #46)
- Result: not yet measured.

### 2026-08-10
The public links and measurement script are optional configuration, but a
trailing slash can corrupt repository permalinks, whitespace can load a
malformed analytics tag, and RSS currently checks item count without
checking that each citation lands on a real round. (PR #45)

**1. Keep configured repository links single-slash safe**
- Hypothesis: When `NEXT_PUBLIC_REPO_URL` ends with `/`, the Log appends
  `/pull/N` directly and emits a double slash. Normalizing the optional base
  once should keep public PR citations valid for the common trailing-slash
  configuration without touching the private-repository default.
- Change: Added `getRepoUrl()` and routed Log PR links through it, trimming
  whitespace and trailing slashes before appending the pull-request path.

**2. Refuse malformed analytics measurement IDs**
- Hypothesis: The optional GA value is currently loaded whenever it is
  truthy, so whitespace or a mistyped value can emit a script that cannot
  collect useful data and can make the production build differ for a typo.
  Trimming and accepting only the documented `G-...` shape should make an
  invalid setting fail closed while preserving the configured path.
- Change: Added a shared measurement-ID validator. The layout now emits
  Google Analytics only for a trimmed, case-insensitive `G-` identifier;
  event tracking remains the existing no-op when no script is present.

**3. Make RSS citations resolve to the Log**
- Hypothesis: The feed already checks that it has one item per parsed round,
  but a correctly sized feed can still link to an anchor that no longer
  exists after permalink changes. Comparing every RSS round anchor with the
  rendered Log ids should catch a broken citation at build time.
- Change: Extended `scripts/check-routes.sh` to resolve every feed round link
  against the rendered `/log` anchor set and fail if any target is missing.

- Guardrails: pass locally. `npm run lint`, `npm run build`, and all route
  checks pass; the feed-anchor assertion was also made deliberately wrong
  and failed before restoration. Configured builds were checked with a
  trailing-slash repository URL and with both invalid and valid analytics
  IDs; only the valid ID emitted the analytics marker.
- Result: not yet measured.

### 2026-08-10
The Tool Finder already moved focus and recorded completion, but its result
state did not name itself to assistive technology, its handoff to Directory
discarded the selected category, and recommendation clicks were invisible
to the interaction metrics. (PR #44)

**1. Give the Finder states named boundaries**
- Hypothesis: Selecting a Tool Finder category replaces the question with a
  result, but the two states are generic containers. A named group for the
  question and a named result region should make the current state easier to
  identify when navigating by landmarks or reading order, while preserving
  the existing focus move.
- Change: Added explicit group and region relationships to the question and
  result states, using the visible question/result text as their labels.

**2. Preserve the selected category into Directory**
- Hypothesis: The Finder's "See all" link says it opens all tools in the
  selected category, but it currently lands on an unfiltered Directory. A
  category query in the handoff URL should let a visitor continue from the
  recommendation to the complete matching list without retyping anything.
- Change: The handoff now links to `/directory?q=` using the selected
  category's encoded name. Directory's existing category matching handles
  the filter; no new search behavior is introduced.

**3. Measure recommendation click-through**
- Hypothesis: The Demos metrics now record Finder completion and restart,
  but the two recommended tool cards are the action the completed state is
  meant to produce and currently have no event. A `tool_finder_tool_click`
  event with the tool and category should make that continuation measurable
  without changing the external link behavior.
- Change: Added the optional click event to each Finder recommendation card.
  It remains a no-op when analytics is not configured.

- Guardrails: pass locally. `npm run lint`, `npm run build`, and route checks
  pass; the route checker asserts the server-rendered Finder group, and the
  browser verified the named result state, the category query handoff, and
  the expected event names in the client bundle.
- Result: not yet measured.

### 2026-08-10
Search already shared its state and announced its counts, but the controls
were still anonymous layout wrappers and Log matching included text that
only exists for screen readers. (PR #43)

**1. Give Directory search a real search landmark**
- Hypothesis: Directory search is an important section metric, but its
  input currently sits in a generic `div`, so landmark navigation cannot
  take a visitor directly to it and pressing Enter has no form semantics.
  A named search form that handles submit without navigation should make
  the control easier to discover and safer to use from the keyboard.
- Change: Wrapped the Directory control in a named `role="search"` form
  and prevent its submit action from reloading the page. Existing query
  and URL replacement behavior is unchanged.

**2. Give Log search the same keyboard contract**
- Hypothesis: The Build Log has the same missing landmark and submit
  behavior, which makes its primary wayfinding control inconsistent with
  the Directory search. Giving it the same named search form should make
  both searchable pages predictable for keyboard and assistive-technology
  users.
- Change: Wrapped the Log input, presets, count, and status in a named
  `role="search"` form that prevents accidental navigation on Enter.

**3. Search visible Log copy, not assistive affordances**
- Hypothesis: Log filtering currently matches `textContent`, which also
  includes repeated screen-reader-only link labels.
  Searching for a phrase a visitor cannot see can return every round and
  make the result count misleading. Matching a cached copy with those
  labels removed should keep search aligned with the visible record.
- Change: Log filtering now removes `.visually-hidden` nodes before caching
  each entry's searchable text, so hidden link instructions do not become
  accidental search hits.

- Guardrails: pass. `npm run lint`, `npm run build`, and all route checks
  pass; the route checker now asserts both server-rendered search landmarks.
  In the browser, pressing Enter preserves the Directory and Log URLs, and
  a screen-reader-only link-label query returns zero visible rounds while a
  visible query still returns its expected matches.

- Result: not yet measured.

### 2026-08-10
Three numbers this site publishes about itself. One was flattering and
structurally incapable of being anything else, one was a hand-typed copy
of a config file, and one was fine but growing without anything watching
it. (PR #36)

**1. Deleted the stat that could only ever say zero**
- Hypothesis: The homepage showed "Guardrail failures: 0" directly under
  a paragraph promising the record includes the rounds that went wrong.
  The number was true. It was also incapable of being anything else: a
  round that fails its guardrails never gets merged, so it never becomes
  an entry, so a failure counter over shipped rounds reads zero forever.
  Presented as evidence, it was arithmetic — and on a page whose entire
  argument is "check the record," a stat that can't move is worse than
  no stat.
- Change: The stat is gone, and the homepage now says plainly why it was
  removed. In its place, two counts that can move: how many rounds
  contain the word "wrong", and how many contain "dropped", computed
  from the changelog at build time and linked to `/log?q=wrong` so the
  reader lands on those entries and judges for themselves. Deliberately
  not quoting the figures here — writing this entry moved both of them,
  which is the point.
- Labelled as a word count, not a verdict. Classifying rounds as
  mistakes would mean running a keyword heuristic over prose and
  publishing whatever it decided — the same thing last round's search
  deliberately refused to do. A count of a word is a fact about text.
- New guardrail in `scripts/check-routes.sh`: the homepage computes
  these counts from the parsed changelog, the browser search recomputes
  them from the rendered DOM, and two implementations of one number is
  two chances to be wrong. The check recounts from the rendered log and
  requires agreement. Confirmed it can fail by making the build-time
  count return one less: both lines went red and the script exited 1.

**2. The blog's guardrail numbers now come from the config**
- Hypothesis: The blog stated "accessibility and SEO at or above 0.85,
  performance at or above 0.80, each scored against the median of three
  runs." That is a hand-typed copy of `lighthouserc.json` sitting one
  directory from the real thing, and nothing but a reader checking would
  ever catch the two drifting. This site's standing rule is that a
  stated fact is either derived at build time or can't drift; this was
  neither, and it is the same failure the "reading thirty" line was
  corrected for last round.
- Change: `app/lib/guardrails.js` reads `lighthouserc.json` — the file
  the CI job actually runs — and the sentence is assembled from it,
  including which categories block a merge versus which are only
  reported. Retuning a threshold now rewrites the post.

**3. A budget for the page that grows every round**
- Hypothesis: `/log` is the site's heaviest page and the only one that
  grows without bound — one entry per round, forever. Suspected it was
  already a problem.
- Change: Measured first, and the suspicion was wrong: `/log` scores
  0.99 performance with a 63.5 KB document and 2.0 s LCP. Nothing to
  fix, so nothing was fixed. What shipped instead is the thing that
  will notice: a `resource-summary:document:size` budget of 150,000
  bytes in `lighthouserc.json`. At the measured growth rate of ~1.9 KB
  gzipped per round that fires somewhere around round 80, which is
  early enough to decide deliberately rather than discover in a
  Lighthouse regression.
- Worth recording what the measurement turned up: the page ships its
  content twice. 108 KB of rendered HTML for the entries, plus a 164 KB
  React Server Component payload carrying the same prose again as
  escaped JSON — 59% of the raw page. Every distinctive phrase appears
  exactly twice in the delivered bytes, confirmed by counting. That is
  inherent to how the App Router hydrates a server-rendered page, not a
  mistake here, and the alternatives (rendering entries through
  `dangerouslySetInnerHTML`) trade a documented cost for an injection
  surface this site removed on purpose. Recorded rather than acted on.

- Guardrails: pass. Lint clean, build clean, all route checks pass
  including the new count-agreement assertion, and last round's 12
  browser checks still pass unchanged. Lighthouse `/` 1.00 / 1.00 /
  1.00 / 1.00, `/blog` 1.00 across the board, `/log` 0.99 / 1.00 /
  1.00 / 1.00. Documents measured at 3.8 KB, 5.5 KB and 63.5 KB
  against the new 150 KB budget.
- The budget assertion was checked in both directions before shipping,
  against a real Lighthouse report: at a 40 KB limit `lhci assert`
  reports `resource-summary.document.size failure`, at 150 KB it
  passes. A budget that cannot fail is not a budget.
- Result: not yet measured.

### 2026-08-10
Three operational edges found by reading the loop itself: overlapping
runs, a setup instruction this repository cannot use, and absolute URLs
that break when a conventional trailing slash is configured. (PR #37)

**1. Give the weekly loop an overlap and runtime guard**
- Hypothesis: The weekly loop has no protection against overlapping
  scheduled/manual runs, and no upper bound on a stuck Claude job. Adding
  a concurrency group that queues one run at a time plus a 45-minute job
  timeout should prevent duplicate proposals and bound the action's
  worst-case runtime without changing the weekly cadence.
- Change: Added a `weekly-proposal` concurrency group with
  `cancel-in-progress: false` to `.github/workflows/weekly-loop.yml`, so
  a manual test cannot run beside the scheduled job and discard one of
  the proposals. Added a 45-minute timeout to the propose job so a stuck
  run cannot consume a runner indefinitely.

**2. Make the branch-protection instructions match the repository**
- Hypothesis: README step 6 tells users to set branch protection on
  `main` even though this private repository on GitHub Free cannot enable
  it. That instruction sends a maintainer to an unavailable setting and
  hides the real merge gate; documenting the plan-dependent paths should
  reduce setup dead ends without changing the app.
- Change: Rewrote step 6 to distinguish public/paid-plan repositories,
  where branch protection can require `PR checks`, from private GitHub
  Free repositories, where the documented gate is a passing
  `build-and-audit` check followed by manual merge. Kept the prompt's
  human-review warning for copy, layout, and new sections.

**3. Keep configured absolute URLs single-slash safe**
- Hypothesis: A trailing slash in `NEXT_PUBLIC_SITE_URL` makes generated
  canonical, sitemap, and feed URLs contain a double slash because the
  code appends route paths directly. Normalising the base once should
  make all generated absolute URLs exactly one slash apart and remove a
  silent SEO/feed failure for deployments configured with a conventional
  trailing slash.
- Change: `getSiteUrl()` now trims whitespace and trailing slashes from
  `NEXT_PUBLIC_SITE_URL` and `VERCEL_URL` before the rest of the app uses
  them. No caller needs its own URL cleanup, so metadata, robots, sitemap,
  and RSS all inherit the same fix.

- Guardrails: pass locally. Baseline proof for the URL issue was a
  production build with `NEXT_PUBLIC_SITE_URL=https://example.test/`:
  `/feed.xml`, `/sitemap.xml`, `/robots.txt`, and the feed self-link all
  contained `https://example.test//...`; after the change the generated
  files contain only `https://example.test/...`. Workflow and README
  checks were verified by inspecting the committed keys and current
  private-repository API response. `npm run lint` and `npm run build`
  pass.
- Result: not yet measured.

### 2026-08-10
Three search refinements, each about making an existing control keep its
place: a Directory filter can be shared, clearing it returns focus, and
Log presets report their active state consistently. (PR #38)

**1. Make a filtered Directory view shareable**
- Hypothesis: Directory search filters the tools in place but leaves no
  query in the URL, so a visitor cannot send someone the useful result of
  a search. Persisting the trimmed query as `?q=` should make a filtered
  view shareable and make the Directory's on-site search more useful to
  returning visitors without adding another navigation surface.
- Change: `app/directory/DirectorySearch.js` now adopts `?q=` after
  hydration and mirrors subsequent edits with `history.replaceState`,
  preserving the existing no-history-entry-per-keystroke behavior of the
  Log search. The initial empty render is kept server/client identical so
  URL adoption does not create a hydration mismatch.

**2. Return focus after clearing Directory search**
- Hypothesis: When a Directory search has no matches, the Clear search
  button is the only recovery control, but activating it leaves focus on
  a button that disappears from the result state. Moving focus back to the
  search input should keep keyboard and screen-reader users at the place
  where they can immediately try the next query.
- Change: Kept a ref to the Directory input and focus it after the clear
  button resets the query. The clear action still removes `q` from the URL
  through the same state path.

**3. Keep Log preset pressed state case-insensitive**
- Hypothesis: The Log search compares preset text with the raw query when
  deciding `aria-pressed`, so typing `WRONG` applies the same filter as the
  `wrong` preset but leaves every preset visually and semantically
  unpressed. Comparing normalized queries should make the active control
  truthful without changing search matching.
- Change: Log preset buttons now compare the trimmed, lowercased query
  before setting `aria-pressed` or toggling the matching preset. Search
  input text remains exactly what the visitor typed.

- Guardrails: pass locally. `npm run lint` and `npm run build` pass;
  the rendered code keeps the server/client initial Directory markup
  identical, writes only `?q=` with `replaceState`, focuses the retained
  search input from the no-results clear path, and treats `WRONG` as the
  active `wrong` preset.
- Result: not yet measured.

### 2026-08-10
The build log is now a recurring update source, its crawl hints match
what actually changes, and round links no longer move when another round
is added above them. (PR #39)

**1. Let RSS subscribers receive build-log updates**
- Hypothesis: The site advertises RSS, but the feed has only the one blog
  post; the build log is the project's only recurring content, so a
  subscriber receives no notice when a new round lands. Adding one compact
  RSS item per parsed build-log entry should provide a machine-readable
  update stream without duplicating the full log prose into every item.
- Change: `/feed.xml` now keeps the existing blog item and adds one short
  item per parsed build-log round, with a stable guid, a link to the round,
  and its intro or first hypothesis as the summary. The full entry remains
  on `/log`; the feed item is deliberately an update and a link, not a
  second copy of the page.

**2. Make sitemap freshness hints evidence-based**
- Hypothesis: The sitemap labels every route `weekly`, but Directory and
  Projects do not change when the loop adds a round while the homepage,
  Blog, Demos, and Log all expose build-log-derived counts. Giving static
  pages a monthly hint and changing pages a weekly hint should make the
  crawl guidance match the content instead of claiming a cadence the code
  does not support.
- Change: Added an explicit `changeFrequency` per route in
  `app/sitemap.js`: Directory and Projects are `monthly`; the homepage,
  Blog, Demos, and Log remain `weekly`. The existing `/blog` last-modified
  date is untouched because it describes the post, not the crawl hint.

**3. Make round permalinks stable as the log grows**
- Hypothesis: The Log's round anchors are positional (`round-N`), but the
  parser numbers newest-first, so inserting a new round changes every old
  round's id. A link that silently moves to a different entry is not a
  permalink; deriving the anchor from the first permanent PR number should
  keep old citations attached to the same round.
- Change: Build-log entries with a PR now use `round-pr-N` ids based on
  that PR, with the positional id retained only as a fallback for legacy
  entries without a PR reference. Updated the route check to count the
  stable anchor shape and added the RSS round-item assertion, so both the
  page and feed fail loudly if a parsed round disappears.

- Guardrails: pass locally. `npm run lint` and `npm run build` pass;
  the generated feed contains one `addictedtoai:round:` item per parsed
  changelog round, the generated sitemap emits monthly only for Directory
  and Projects, and generated Log anchors include permanent PR-based ids.
  The route check now asserts both the rendered round count and the feed's
  round-item count.
- Result: not yet measured.

### 2026-08-10
The public freshness signals now come from the same dated changelog that
drives the build log, so a deploy cannot claim a page changed merely
because the server clock moved. (PR #40)

**1. Give the freshness signals one dated source**
- Hypothesis: The sitemap and feed need to know when the site's changing
  content was last updated, but deriving that separately in each route
  would invite the same drift this project has already found in copied
  thresholds and counts. A small build-log helper returning the newest
  dated entry should make the source explicit and reusable.
- Change: Added `getLatestBuildLogDate()`, which skips an `Unreleased`
  entry and returns the newest dated changelog heading. It returns `null`
  rather than inventing a timestamp if a changelog has no dated entry.

**2. Make sitemap lastmod describe content, not deploy time**
- Hypothesis: The homepage, Blog, Demos, and Log all expose data derived
  from the build log, so a new round changes them even when their prose
  files do not. Adding the newest dated build-log entry as their
  `lastModified` should give crawlers a truthful freshness hint while
  leaving the static Directory and Projects pages untouched.
- Change: Sitemap entries for `/`, `/blog`, `/demos`, and `/log` now use
  the shared latest build-log date; the Blog keeps its existing post date
  as a fallback if the log has no dated entry.

**3. Tell feed readers when the build stream last changed**
- Hypothesis: The RSS feed now contains a recurring item for each build
  round, but its channel has no `lastBuildDate`. Adding one from the same
  dated source should let feed readers refresh based on actual content
  freshness rather than an absent or hand-typed value.
- Change: Added an RSS `lastBuildDate` for the newest dated build-log
  entry. Extended the non-HTML route checks to require the four dynamic
  sitemap dates and the feed channel date to match that same source.

- Guardrails: pass locally. `npm run lint`, `npm run build`, and all route
  checks pass; the new freshness assertion was also fed a deliberately
  wrong expected date and failed before the real date was restored.
- Result: not yet measured.

### 2026-08-10
The site already claims to optimize search usage, tool click-through, and
demo completion, but the optional analytics layer was only recording page
views. These three events make those interactions observable without
loading analytics when no measurement id is configured. (PR #41)

**1. Make Directory search usage measurable**
- Hypothesis: Directory search is a documented section metric, but page
  views cannot distinguish a visitor who types a query from one who only
  scans the list. Sending one event after a paused, non-empty query should
  make search usage measurable without emitting one event per keystroke.
- Change: Added an optional `directory_search` event after the existing
  500ms announcement delay, including the normalized term and visible
  result count. Repeating the same query does not emit another event until
  the query is cleared.

**2. Make Directory outbound clicks measurable**
- Hypothesis: The Directory's primary metric is outbound tool clicks, but
  the current page only provides generic pageview data. Tracking a click
  with the tool name and category should identify which directory content
  produces the action without changing the external link behavior.
- Change: Directory tool cards now emit `directory_tool_click` with the
  clicked tool and category when analytics is available. The handler is
  attached to the existing cards, so no new links or navigation behavior
  are introduced.

**3. Make Tool Finder completion and replay measurable**
- Hypothesis: Demos documents completion and repeat use as its metrics, but
  selecting a category and restarting the Finder currently leave no event
  evidence. Emitting one completion event per category selection and one
  restart event should make both actions visible while keeping the existing
  focus behavior and recommendation UI unchanged.
- Change: Tool Finder now emits `tool_finder_complete` with the selected
  category and `tool_finder_restart` when a visitor chooses another
  category. The shared helper is a no-op when GA is not configured.

- Guardrails: pass locally. `npm run lint` and `npm run build` pass; the
  analytics-off build contains no measurement script, and the event helper
  returns before touching `window` during server rendering.
- Result: not yet measured.

### 2026-08-09
Both search controls could recover from a no-match state, but only after
the visitor searched for nothing and found a conditional button. The next
pass makes clearing available whenever a query exists and tells assistive
technology exactly which content and status the control owns. (PR #42)

**1. Keep Directory search recovery beside the query**
- Hypothesis: Directory search only rendered a Clear button after a query
  hid every tool, so a visitor with valid matches had to edit the field by
  keyboard or select its contents manually. A persistent clear action while
  the field is non-empty should make trying a second query faster without
  changing the URL replacement or focus behavior.
- Change: Added a visible Clear button inside the Directory search control
  for every non-empty query. It clears the URL-backed state and returns
  focus to the search input; the old no-match-only button is no longer
  needed.

**2. Keep Log search recovery beside the query**
- Hypothesis: The Build Log had the same recovery gap: Clear appeared only
  when the current query matched zero rounds, even though changing from one
  useful filter to another is a common browse path. Showing the same clear
  action for every non-empty query should reduce friction while preserving
  the existing preset and permalink behavior.
- Change: Added the same focus-restoring Clear action to Log search and
  removed the duplicate no-results-only control. The summary still states
  when no rounds match.

**3. Connect search controls to their changing content**
- Hypothesis: The search inputs update a visible count and hide or show
  existing content, but their relationships are implicit: assistive
  technology is not told which region is controlled or that the delayed
  status is the complete announcement. Explicit `aria-controls`,
  `aria-describedby`, `aria-live`, and `aria-atomic` wiring should make the
  same interaction understandable without adding a client-side rerender.
- Change: Added stable result-region and status ids for Directory and Log,
  connected each input to both, and marked the existing delayed status
  announcements as polite and atomic.

- Guardrails: the first local browser pass was green, but CI initially
  caught a real test fragility: adding the result id before the existing
  class made the route checker look for an exact `<ol class="log-list"`
  prefix and count zero matching rounds. Changed the checker to find the
  log list by its class regardless of attribute order; the rerun passes.
  `npm run lint`, `npm run build`, all route checks, and the search behavior
  checks now pass, and both inputs expose the declared result/status
  relationships in the rendered DOM.
- Result: not yet measured.

### 2026-08-10
The log became searchable last round, which made it browsable but not
citable: there was still no way to point someone at one round. This round
makes a single round addressable, puts the search in the URL so a
filtered view can be shared, and removes the last hand-counted number
from the blog. (PR #35)

**1. Every round has a permalink**
- Hypothesis: The anchor ids (`id="round-12"`) have existed since the log
  was built, but nothing on the page exposed them. Citing one round meant
  sending someone 254 KB of HTML and telling them to scroll. If the
  argument for this site is "don't take our word for it, read the
  record," the smallest useful unit of that record has to be linkable.
- Change: The `Round N` heading is now a link to its own anchor, with a
  `#` affordance on hover and focus. Padded to 96x27 px so it clears the
  24x24 minimum target size in WCAG 2.5.8 — measured in the browser, not
  eyeballed — and offset by the same amount so adding the target moved
  nothing.

**2. The search lives in the URL**
- Hypothesis: A filtered view was unshareable, which undercut the search
  added last round: "search for 'wrong' and read those seven rounds" is a
  worse instruction than a link that does it.
- Change: The query syncs to `?q=`, and `/log?q=wrong` filters on
  arrival. `replaceState`, not `pushState` — the search is a view
  control, and pushing would put one history entry per keystroke between
  the visitor and wherever they came from. Verified: `history.length`
  does not move while typing. The trade-off is that Back leaves the page
  instead of clearing the search.
- The two features collide in a case worth writing down. A URL can carry
  both a search and a permalink, and the search can hide the very round
  the permalink points at — a link that silently resolves to nothing. The
  rule is that the permalink wins: the search is dropped, the URL is
  rewritten to match, and the round is scrolled into view.

**3. Copy that counts things counts them from the data**
- Hypothesis: The blog post ended with "if you want the shape of one
  before reading thirty." That was accurate the day it shipped and wrong
  three rounds later. The standing rule here is that a stated fact is
  either derived at build time or can't drift; this was neither.
- Change: The count is read from the parsed changelog. The neighbouring
  "sorted itself into four kinds" was rewritten to "the same recurring
  kinds" — the honest fix for a hand-maintained list isn't always to
  derive it, sometimes it's to stop asserting a number nobody needs.

Notes on the verification, since one part of it was wrong first:
- The check for "permalink beats search" passed, then failed, then passed
  for the wrong reason. The first version picked round 2 as its target
  without checking whether round 2 actually matched the query — it did,
  so nothing was being tested. The second version picked a genuinely
  hidden round and went red. The cause was in the *test*: navigating
  between two URLs that differ only by their hash is a same-document
  navigation, so React never re-mounted and the page under test was still
  the previous one.
- That turned out to be a real bug rather than only a test artifact.
  Pasting a `#round-N` onto an already-filtered page changes only the
  hash, so nothing re-mounts and the permalink rule never ran. Fixed with
  a `hashchange` listener, and both paths — cold load and same-document
  hash change — are now checked separately.
- The whole harness was then run against a deliberately disabled version
  of the rule to confirm it could still go red: 10/12 instead of 12/12,
  with the two conflict checks failing and nothing else moving.

- Guardrails: pass. Lint clean, 12/12 browser checks, all route checks
  pass. Lighthouse `/log` 0.99 / 1.00 / 1.00 / 1.00 and `/blog` 1.00
  across the board, CLS 0 on both. `/log` transfer 155 KiB → 156 KiB;
  route JS 914 B → 1.22 kB.
- Result: not yet measured. Whether anyone actually cites a round is the
  test, and that needs traffic.

### 2026-08-10
Third round under the showcase brief. PR #32 built the evidence, PR #33
pointed the site at it, this one makes it navigable and shows the method
rather than describing it. (PR #34)

**1. The build log is searchable**
- Hypothesis: The homepage promises that the record includes the rounds
  where the hypothesis was wrong. Delivering on that promise currently
  requires reading 31 rounds to find them, which nobody will do. A
  promise a visitor can't check is the same as no promise.
- Change: A search field on `/log` plus preset chips for the queries
  that surface the interesting entries. Searching "wrong" returns 7
  rounds; "dropped" returns 5.
- Deliberately a *search* rather than an editorial tag. Classifying
  entries as "this one was a mistake" would mean running a keyword
  heuristic over prose and publishing whatever it decided — on a site
  whose entire argument is "don't take our word for it, read the
  record." Search makes no claim; it just finds.
- The filter toggles `hidden` on the server-rendered entries instead
  of passing 31 rounds of prose into a client component and
  re-rendering them. That keeps the parsed log out of the JavaScript
  payload entirely: the route's client JS went 155 B → 914 B, and the
  page's transfer size 144 KB → 152 KB. Re-rendering it client-side
  would have roughly doubled the page. Lighthouse on `/log` still
  measures performance 0.99 / accessibility 1.00 / SEO 1.00.

**2. "Anatomy of a round" on Demos**
- Hypothesis: Describing a hypothesis-and-measurement loop in prose
  asks the reader to imagine it. A worked example of one real round,
  steppable, shows it in about fifteen seconds — and Demos' own
  metrics (completion rate, repeat use) want something finishable.
- Change: `app/demos/RoundWalkthrough.js`, a four-step walkthrough —
  Hypothesis, Change, Guardrails, Result — whose content is pulled
  from the parsed build log rather than written for the demo. The
  round is referenced by *pull request number*, not position, because
  round numbers shift as entries are added and a positional reference
  would silently start pointing at a different round. Tool Finder
  stays; this is added alongside it, not in place of it.
- Two things the browser check caught: the quoted text rendered raw
  markdown backticks until `inlineMarkdown` was applied client-side,
  and each step button's accessible name read "1Hypothesis" until the
  decorative number was marked `aria-hidden` (the ordering is already
  carried by the list and `aria-current="step"`). Verified after:
  zero raw backticks or asterisks in the panel, 5 `code` elements and
  1 `em`. `/demos` measures performance 1.00 / accessibility 1.00 /
  SEO 1.00 at 103 KB.

**3. The blog post points at the evidence instead of duplicating it**
- Hypothesis: The post was written when it was the only account of how
  the site works. It now sits alongside a homepage making the same
  claim and a build log proving it, so its job has changed: explain
  the machinery, then get out of the way.
- Change: Opening rewritten to state the human-wrote-the-first-commit
  fact plainly, an early pointer to `/log` for readers who'd rather
  inspect output than read prose, and a closing note that the log is
  published unedited and parsed rather than retyped — plus a link to
  the new walkthrough for anyone wanting the shape of one round
  before reading thirty.

- Guardrails: pass (`next build` clean; `npm run lint` clean;
  `linkinator` across all 6 routes, 32 links, zero failures;
  `scripts/check-routes.sh` green including the round-count
  assertion; `/log` and `/demos` both re-measured with Lighthouse.)
- Note, not a guardrail failure: Vercel began rejecting deploys
  mid-round with "Deployment rate limited — retry in 24 hours." That
  is the Hobby plan's daily build cap, hit after 33 pull requests in
  one day, not a defect — `build-and-audit` passed on every one of
  them. The consequence is that the live site lags the repository
  until the window resets.
- Result (measured the following week): not yet measured

### 2026-08-10
Second round under the showcase brief. PR #32 built the evidence; this
one points the site at it. (PR #33)

**1. The homepage now leads with the claim, and backs it with data**
- Hypothesis: The homepage described the site as "a hub for AI news, a
  curated tool directory, project write-ups, and interactive demos" —
  an accurate description of a thousand other sites, and one that
  buried the only genuinely unusual thing about this one in a
  subordinate clause. A visitor had no reason to look further.
- Change: Rewrote `app/page.js` around the actual claim, with a stats
  strip and a primary route into `/log`.
- Every number on it is derived from `getBuildLogStats()` at build
  time, not typed in: rounds, distinct changes, pull requests, and
  guardrail failures. That last one currently reads 0 because it is
  *counted* from entries whose guardrail line starts with "fail" — if
  a future round fails, the homepage will say so on its own. A
  hardcoded "0 failures" would be exactly the kind of claim this site
  shouldn't make.
- Accuracy check that changed the copy: the draft said every line of
  the site was written by AI. `git log` says otherwise — the initial
  commit, 18 files and 385 lines of Next.js skeleton, was authored by
  a human. The copy now says so plainly. It is a smaller claim and a
  much more credible one, and a reader can verify it.

**2. Projects reframed around the experiment**
- Hypothesis: The Projects write-up described the loop as a
  maintenance strategy for a small site. Under the new framing it's
  the subject, not the method.
- Change: Rewrote the opening and "The idea" section in
  `app/projects/page.js` to state what makes this a harder
  demonstration than a transcript — continuous rather than one-shot,
  nobody curating which attempts get shown, an automated quality gate
  before anything ships, and hypotheses committed in writing before
  results are known — and to link to the build log for the rounds
  that went wrong.

**3. Redirect the loop itself, so future rounds inherit this**
- Hypothesis: Repositioning the pages without repositioning the prompt
  would last exactly one round. `prompts/propose-change.md` is what
  actually steers every future run, and it still described a hub site.
- Change: Rewrote the prompt with the showcase framing, an explicit
  instruction never to write a changelog entry that flatters the work,
  and a "standards this loop is held to" section distilled from what
  the last 30 rounds actually learned: measure rather than assert;
  check that your check can fail; drop changes that measurement kills
  and say so; never let a stated fact go stale by hand. Also rewrote
  the header of this file, which is now a published page rather than
  a private note, and added the build log to the section metrics.
- While here: gave `/log` a real heading structure. Round labels are
  now `h2` and change titles `h3`, so heading navigation walks the
  page round by round instead of landing in a flat list of 17 change
  titles under a single `h1`.
- Guardrails: pass (`next build` clean; `npm run lint` clean;
  `linkinator` across all 6 routes zero failures;
  `scripts/check-routes.sh` green including the round-count assertion,
  which now reads 31; heading outlines re-dumped for `/`, `/projects`
  and `/log` and all three nest correctly; 360px viewport still zero
  horizontal overflow.)
- Result (measured the following week): not yet measured

### 2026-08-10
First round under a redirected brief. The maintainer has reframed what
this site is for: not a hub site that happens to be maintained by a
loop, but a showcase of what a current AI model does when it's handed a
continual-improvement loop and left to run. This PR is the foundation
for that, and it takes the position that the strongest possible version
of that claim is evidence rather than assertion. (PR #32)

**1. Parse the changelog into structured data**
- Hypothesis: This project's genuinely unusual asset is not the tool
  directory or the quiz — those exist on a thousand sites. It's that
  30 rounds of work each carry a hypothesis stated *before* the work,
  a measurement taken after, and an honest record of the times the
  hypothesis was wrong. That asset is currently invisible: it lives in
  a markdown file in the repository, where no visitor will ever read
  it. Any showcase framing that doesn't surface it is just a claim.
- Change: `app/lib/build-log.js` reads `CHANGELOG.md` at build time and
  parses it into entries, each with a date, PR numbers, and one or more
  changes carrying hypothesis / change / notes, plus the round's
  guardrail and result. Handles both formats the file has used: the
  early single-change entries and the later bundled `**N. Title**`
  ones.
- The deliberate choice here is *parsing* rather than maintaining a
  second copy for the website. A hand-written showcase page would be
  free to flatter the record; a parsed one cannot, because it is the
  record. It also can't go stale, which is the failure PR #27 had to
  fix by hand.
- Verified against known counts before building any UI: 30 entries, 39
  distinct changes, 30 pull requests, and zero entries missing a
  hypothesis, change, guardrail or result.

**2. `/log` — the record, rendered**
- Hypothesis: A visitor who is told "an AI built this site" has no
  reason to believe anything follows from that. A visitor who can read
  30 rounds of hypothesis-and-measurement, including "the prediction
  that gating on this would fail was wrong" and two changes dropped
  after measuring showed there was nothing to fix, can judge for
  themselves. Show the work.
- Change: A new top-level `/log` route rendering every round as a
  timeline — round number, date, links to the real pull requests, each
  change's hypothesis and outcome, and the guardrail result. New
  `app/lib/inline-markdown.js` tokenises the three inline constructs
  the changelog actually uses (`code`, bold, italic) into React nodes
  rather than pulling in a markdown dependency or setting innerHTML
  from a file — so there is no HTML-injection surface at all. Added to
  the nav, the sitemap at priority 0.9, and its own metadata.
- Measured, because a 30-round page is a lot of HTML: 222 KB of markup,
  49.8 KB gzipped, 144 KB transferred. Lighthouse on `/log`,
  median of 3: performance 0.99, accessibility 1.00, SEO 1.00. Well
  clear of the guardrails, so the whole record stays on one page
  instead of being paginated.

**3. Put the new route under the guardrails**
- Hypothesis: PR #29's lesson was that shipped code nothing checks is
  shipped code that breaks silently. A new top-level route added
  without touching CI would repeat exactly that.
- Change: `/log` added to both the Lighthouse URL list and the lychee
  crawl in `pr-checks.yml`, and a new assertion in
  `scripts/check-routes.sh` that the page renders every round the
  changelog contains.
- That assertion derives its expected count from `CHANGELOG.md` itself
  rather than hardcoding a number, so it can't go stale — a constant
  needing a bump every round would be the same rot the log page exists
  to prevent. It guards the real failure mode: a future entry written
  in a shape the parser doesn't understand would still render a page,
  just quietly missing rounds.
- Also caught by verification rather than review: the first version of
  that assertion counted the visible "Round N" text and reported 1
  round instead of 30. React splits interpolated text with comment
  nodes, so the rendered markup separates the label from the number.
  Counting the entry anchor ids instead.
- And the check then failed a second time, on the count *it derived*.
  Deriving it by deleting the changelog's HTML comment block with a
  `sed` range broke as soon as an entry's prose happened to quote an
  HTML comment — which this very entry does, describing the bug above.
  The range opened early and swallowed the rest of the file, so the
  expected count came back as 1. Now counted by subtracting the
  template placeholder heading, with no range matching involved. Two
  self-inflicted bugs in one check, both found by running it rather
  than by reading it.

**4. The PR links were all broken, which the link check caught**
- Hypothesis: rendering each round's real PR numbers as links to the
  actual pull requests would be the strongest evidence on the page.
- What actually happened: `linkinator` failed the build with 30 broken
  links. The repository is private, so every one of those URLs returns
  404 to a visitor who isn't signed in — the same trap PR #4 hit when
  it first described the repo as public. Confirmed directly: both the
  repo page and `/pull/1` return 404 unauthenticated.
- Change: PR numbers render as plain badges, and become links only
  when `NEXT_PUBLIC_REPO_URL` is set — the same env-gated pattern used
  for the site URL and the analytics ID, documented in `.env.example`.
  Both paths were verified rather than assumed: unset gives 30 badges
  and zero anchors; set gives 30 anchors pointing at the right PRs.
- **For the maintainer:** making the repository public would turn this
  on with a single environment variable and no code change. It is the
  single biggest upgrade available to the showcase framing — right now
  the page asks you to take its word for 30 pull requests, when it
  could link you to all of them. That's a call only you can make.
- Guardrails: pass (`next build` clean; `npm run lint` clean;
  `linkinator` zero failures; `scripts/check-routes.sh` green
  including the new round-count assertion; `/log` measured at
  performance 0.99 / accessibility 1.00 / SEO 1.00; the 6-item nav
  re-checked at a 360px viewport, still exactly zero horizontal
  overflow.)
- Result (measured the following week): not yet measured

### 2026-08-10
Three content-plumbing fixes in one PR, bundled at the maintainer's
request. (PR #31)

**1. The homepage teaser was the last hardcoded copy of post metadata**
- Hypothesis: PR #26 pulled post metadata into `lib/posts.js` so the
  page title, heading, JSON-LD and feed item couldn't drift — but
  missed the homepage teaser, which still hardcoded the post's title
  and hook. PR #11's own changelog entry flagged this: "revisit this
  if a second post ships." A second post would now silently leave the
  homepage advertising the first one.
- Change: Added an `excerpt` field to the post record (deliberately
  distinct from `description`, which has to work as a search-result
  snippet) and pointed `app/page.js` at `posts[0]` for title, path
  and excerpt.
- Caught in verification, not review: moving the hook out of JSX into
  a JS string silently downgraded its `&rsquo;` to a straight
  apostrophe, since entities don't work inside JS strings — the
  homepage rendered `&#x27;` where it used to render U+2019. Fixed by
  using the literal curly character in `posts.js`, and confirmed at
  the byte level that both the teaser and the meta description now
  emit U+2019 again.

**2. `dateModified` — the post has been edited since it was published**
- Hypothesis: The post carries `datePublished: 2026-08-09` and
  nothing else, but its content was rewritten in PR #27 and touched
  again in PR #29. The `BlogPosting` JSON-LD therefore told search
  engines the current text was the text published on the 9th, and
  last round's sitemap work made it worse by deriving `lastmod` from
  `datePublished` — the sitemap's *last modified* field was reporting
  the publish date. That's the same class of inaccuracy the sitemap
  round set out to fix, introduced by the fix.
- Change: A `dateModified` field on the post record, set from the
  actual commit date of the last content change (`git log` on
  `app/blog/page.js`: 2026-08-10 UTC — not guessed). JSON-LD now
  emits both dates, and the sitemap's `lastmod` reads `dateModified`.
  The RSS `pubDate` correctly still reads `datePublished`, which is
  what that field means.

**3. Projects had a flat heading outline**
- Hypothesis: Dumping every page's headings from the served HTML,
  `/projects` was the only one that came back wrong: `h1 Projects`,
  then `h2 AddictedtoAI.net`, then `h2 The idea` / `h2 How it works`
  / `h2 Stack`. Those three are subsections *of* the write-up, but
  they're marked up as its siblings, so anyone navigating by heading
  gets four peers and no structure. Every other page nests correctly.
- Change: Demoted the three subsections to `h3` and added an
  `article h3` rule to `globals.css`. Verified the served outline is
  now `h1 > h2 > h3 h3 h3`, and re-dumped the other four pages to
  confirm nothing else moved.

- Guardrails: pass (`next build` clean; `npm run lint` clean;
  `linkinator` 30 links zero failures; `scripts/check-routes.sh`
  green; feed still parses as valid RSS 2.0. Regressions re-run:
  Directory result count at 0px layout shift, nav still 61px with
  zero horizontal overflow at 360px.)
- Result (measured the following week): not yet measured

### 2026-08-10
Three interaction fixes in one PR, bundled at the maintainer's
request. (PR #30)

**1. Controls whose border is the only thing marking them**
- Hypothesis: The search input and the Finder/CTA buttons have a
  transparent background, so the 1px border is the *only* visual
  information identifying them as controls at all. Measured, that
  border is `#22262b` on `#0b0d0f` — 1.28:1, against the 3:1 WCAG
  1.4.11 asks for exactly this case. Lighthouse's accessibility audit
  doesn't catch it, which is why it survived six rounds of
  accessibility work.
- Change: A second token, `--border-interactive: #5b6470` (3.25:1,
  the smallest step off the existing hue that clears the bar),
  applied to `.directory-search`, `.finder-option`, `.finder-restart`
  and `.project-action`. Decorative card borders keep `--border`
  deliberately: a tool card is identified by the heading and text
  inside it, not by its frame, so 1.4.11 doesn't apply and changing
  them would be a visual redesign rather than a fix.
- Verified from the browser's computed styles rather than the
  stylesheet: all three control types report 3.25:1, both card types
  still report 1.28:1 by design.

**2. Nav tap targets were 23px tall**
- Hypothesis: The nav links had no vertical padding, so their hit
  area was just the text box — measured at 23px tall for all five.
  Honest framing: this is **not** a WCAG 2.5.8 failure. That rule's
  spacing exception applies here (24px circles centred on each link
  don't intersect — nearest centres are ~69px apart horizontally,
  ~35px vertically when wrapped). But 23px is under every touch
  guideline there is, and this is the one control on every page that
  every visitor uses.
- Change: `min-height: 44px` on `.nav a` with `inline-flex` centring,
  and the nav's own vertical padding reduced from 1.25rem to 0.5rem
  to compensate.
- Measured after: targets 23px → 44px tall, while the header actually
  got *shorter*, 64px → 61px. Re-checked the 360px mobile viewport
  that PR #15 fixed: still exactly zero horizontal overflow.

**3. The result count announced on every keystroke**
- Hypothesis: PR #23's live region put the visible count and the
  announcement in the same element, so typing a six-character query
  queued six announcements — a screen reader talking over someone who
  is still typing.
- Change: Split them. The visible count stays instant and is now
  `aria-hidden`, and a `visually-hidden` `role="status"` region
  carries the announcement on a 500 ms debounce after typing stops.
- Measured: 80 ms after typing "coding" the visible text reads
  "3 tools match “coding”." while the live region is still empty;
  780 ms after, both match. Exactly one live region on the page, and
  it's still present when empty so the first announcement fires.

**Dropped after measuring — two candidates that turned out not to be
real.** Nav links were going to get an explicit `:focus-visible` style
as a fourth fix, on the theory that they were the only interactive
element without one. Screenshotting a focused nav link showed the
browser's default ring is perfectly clear (and `color-scheme: dark`
from PR #28 is what makes it render light against this background), so
there was nothing to fix. Separately, `--muted` text was going to be
darkened for contrast until it measured 5.99:1 against the background —
comfortably past the 4.5:1 it needs. Both would have been changes that
looked diligent and fixed nothing.

- Guardrails: pass (`next build` clean; `npm run lint` clean;
  `linkinator` 30 links zero failures; `scripts/check-routes.sh` green
  on all 11 assertions; `/directory` chunk 1.39 kB → 1.47 kB. Tool
  Finder focus regression check still passes.)
- Result (measured the following week): not yet measured

### 2026-08-10
Three changes in one PR, all about the gate rather than the site.
Bundled at the maintainer's request. (PR #29)

**1. Let CI see what analytics actually costs**
- Hypothesis: PR #24 wired up analytics and measured it at +145.9 KB
  over the wire, then noted the gap it left: `pr-checks.yml` never
  sets `NEXT_PUBLIC_GA_MEASUREMENT_ID`, so the Lighthouse gate scores
  the analytics-*off* build while production, once the variable is
  set, serves the analytics-*on* one. The guardrail would pass
  forever no matter how expensive analytics got.
- Change: A second Lighthouse pass after the blocking one, against a
  rebuild with the variable set, using `lighthouserc.analytics.json`
  where every assertion is `warn` rather than `error`. It reports the
  real number on every PR and cannot block a merge.
- Why informational rather than blocking: the honest version of this
  change gates on the analytics build, and it was very likely to fail
  — the performance floor is 0.80, CI hardware already scored an
  untouched homepage 0.83 then 0.74, and analytics adds 1.5x the
  page's entire weight. Turning a gate red on a third-party script's
  bad day blocks unrelated work. Reporting the number every time
  gives the maintainer the data to decide, which is what was actually
  missing.

- **And the answer, first time it ran for real: analytics is
  affordable.** On CI hardware, median of 3: performance 0.98
  (0.97/0.98/0.99), accessibility 1.00, best-practices 1.00, SEO
  1.00, 244 KB transferred versus 97 KB without. That 244 KB matches
  the 243.3 KB measured independently over CDP in PR #24. So the
  prediction that gating on this would fail — the reason it was built
  informational — was wrong: 0.98 clears the 0.80 floor with room to
  spare. Worth keeping it warn-level anyway, since the cost is a
  third party's to change and the point is to see the number when it
  moves; but the maintainer can now enable analytics knowing what it
  costs rather than guessing.

**2. Check the routes nothing was checking**
- Hypothesis: lychee crawls the five HTML pages. `/feed.xml`,
  `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` and the
  custom 404 are shipped code that no check has ever touched — the
  feed and the truthful-sitemap work of the last two rounds landed
  with zero CI coverage. A feed that 500s or a manifest that stops
  being valid JSON would ship silently.
- Change: `scripts/check-routes.sh`, run in CI and locally the same
  way. Asserts status, content-type and a content marker for each,
  requires the 404 to actually return 404 (a soft 404 returning 200
  is its own SEO problem), and resolves every URL the sitemap
  advertises.
- Verified the check can fail, not just pass: fed it two deliberately
  wrong expectations and confirmed it reported both and exited 1. A
  green check that cannot go red is not a check.

**3. `npm run lint` was a broken script**
- Hypothesis: `package.json` has had a `lint` script since the first
  commit, but eslint was never installed and no config existed, so
  `next lint` would drop into an interactive setup prompt — it
  cannot have run successfully in CI or locally, ever.
- Change: Added `eslint` + `eslint-config-next` (dev only, pinned to
  the installed `next`), an `.eslintrc.json` extending
  `next/core-web-vitals`, and a `npm run lint` step in CI ahead of
  the build.
- Landing the gate meant clearing the 22 existing violations. All 22
  were the same rule and the same character: a raw `'` in JSX prose.
  Converted to `&rsquo;`, which matches the `&mdash;` and
  `&ldquo;`/`&rdquo;` these files already use, so it's a small
  typographic improvement rather than a suppression. Verified the
  rendered bytes are U+2019 and that no word was mangled. Zero
  violations of any other rule.

- Then the step reported the wrong number, which was worse than
  reporting none: it printed 97 KB — the analytics-*off* figure —
  while claiming to measure analytics on. Cause, from the CI log:
  `lsof -ti:3000 | xargs -r kill -9 || true` silently did nothing,
  the new server died with `EADDRINUSE`, `wait-on` then succeeded
  against the *old* analytics-off server still holding the port, and
  Lighthouse measured that and passed. Exactly the failure this
  round's other two changes are about — a check that looks green
  while measuring the wrong thing. Fixed by deleting the race rather
  than tuning it: the analytics build is served on port 3001, so
  there is nothing to kill. Added a verification gate — `curl` the
  new server and grep for the measurement ID — so that if this ever
  breaks again it fails loudly instead of quietly measuring the wrong
  build. Both directions tested locally: the gate passes against the
  analytics build on :3001 and exits 1 against the analytics-off
  build on :3000.
- The informational Lighthouse step needed a second pass of its own,
  because the first version of it reported nothing. Two faults, both
  visible only by reading the CI log rather than the green tick:
  the step uploaded its artifact under the same name as the blocking
  run and got `409 Conflict: an artifact with this name already
  exists` — swallowed by `continue-on-error`, so the report was never
  actually saved — and warn-level assertions print nothing when they
  pass, so the score this whole sequence exists to surface appeared
  nowhere at all. Fixed with a distinct `artifactName`, an `rm -rf
  .lighthouseci` before the analytics build so the summary reads only
  that run, and `scripts/report-lh-scores.mjs`, which prints the
  median scores plus total transfer size to the log *and* the GitHub
  job summary. Smoke-tested against three real local Lighthouse runs:
  it reported 97 KB transferred, matching the 97.4 KB measured
  independently over CDP in PR #24 — two different tools agreeing is
  the reason to believe the number.
- Failed CI on the first attempt, and the cause is worth recording:
  `npm ci` errored with `EUSAGE`, "package.json and package-lock.json
  are not in sync," missing several `@emnapi/*` entries. Adding
  eslint on Windows produced a lockfile that omitted optional
  platform-specific transitive deps that Linux needs — nothing to do
  with the workflow edits themselves, which is what the cascade of
  six red route checks and a `next: not found` made it look like at
  first glance. Fixed by deleting `package-lock.json` and
  `node_modules` and regenerating from scratch: 6 `@emnapi` entries
  before, 11 after. Verified by running `npm ci` locally against a
  wiped `node_modules`, which is the thing that actually failed, not
  just `npm install`.
- Guardrails: pass (local `next build` clean; `npm ci` clean from a
  wiped `node_modules`; `npm run lint` clean; `linkinator` for all 5
  routes, 30 links, zero failures; `scripts/check-routes.sh` green on
  all 11 assertions. Re-ran the earlier rounds' Puppeteer checks as
  regressions — Directory's result count still correct at 0px layout
  shift, Tool Finder focus still lands on the result.)
- Result (measured the following week): not yet measured

### 2026-08-09
Four small changes shipped together in one PR at the maintainer's
request, rather than as four separate rounds. Each keeps its own
hypothesis, since each is testing something different. (PR #28)

**1. Declare `color-scheme: dark`**
- Hypothesis: The site is dark-themed in CSS but never told the
  browser so — `getComputedStyle(document.documentElement).colorScheme`
  reported `normal`. Everything the UA paints for itself rather than
  from our stylesheet therefore came from the *light* palette:
  scrollbars, the search field's clear button, form-control and
  autofill defaults. On a `#0b0d0f` page that's visibly wrong, and
  the search box it most affects is the one Directory's on-site
  search metric depends on.
- Change: One declaration, `color-scheme: dark` on `:root` in
  `app/globals.css`.
- Verified by measuring what the UA actually paints, not by reading
  the spec: an unstyled control injected into the page renders
  `rgb(255,255,255)` on black text with the old `normal` value and
  `rgb(59,59,59)` on white text as shipped. Same probe, same page,
  one declaration apart.

**2. Stop lying in the sitemap**
- Hypothesis: `app/sitemap.js` set `lastModified: new Date()` on all
  five routes, so every deploy told crawlers all five pages had just
  changed. This site deploys once per shipped change, and a change
  almost always touches one page — so the claim was wrong nearly
  every time. Google treats `lastmod` as a hint and discounts it when
  a site's values look unreliable, which means an always-now value is
  worse than none: it burns the signal for the one page where the
  date is actually known.
- Change: `lastModified` is now set only where it can be
  substantiated — `/blog`, from the post's own `datePublished` in
  `lib/posts.js` — and omitted elsewhere. `lastmod` is optional in
  the sitemap spec; `changeFrequency` and `priority` are unchanged.
- Verified against the served `/sitemap.xml`: exactly one `<lastmod>`,
  on `/blog`, reading 2026-08-09.

**3. Link the blog post into the sections it describes**
- Hypothesis: The post names the directory, the projects write-up and
  the Tool Finder, and links to none of them. It's the site's best
  organic-search landing page and its longest read, and it dead-ends.
  Session depth feeds the north-star returning-visitor rate.
- Change: Three inline links in the "What's shipped so far" list.
  Existing words, now clickable — no new copy.

**4. One source of truth for the site's identity**
- Hypothesis: `"AddictedtoAI"` appeared in five places and
  `"AI news, tools, projects, and demos."` in four — root metadata,
  the `WebSite` JSON-LD, the web app manifest, the RSS channel, the
  blog post's author/publisher — with nothing keeping them in sync.
  Nothing was broken yet; last round was spent fixing a page that had
  drifted out of date, and this is the same failure mode waiting to
  happen in structured data, where it's invisible.
- Change: `SITE_NAME` / `SITE_DESCRIPTION` in `app/lib/site.js`, used
  everywhere. Also deleted `.placeholder-note` from `globals.css` —
  dead since the last placeholder page was replaced, confirmed by
  grep across `app/`.
- Verified byte-for-byte that the rendered output is unchanged:
  same `<title>` on `/` and `/blog`, same manifest JSON, same feed
  channel title and description.

- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` for all 5 routes, 30 links, zero failures; feed still
  parses as well-formed RSS 2.0 with a correct `atom:link rel="self"`.
  Re-ran the previous rounds' Puppeteer checks as regression tests —
  the Directory result count still reports correctly with 0px layout
  shift, and Tool Finder focus still moves to the result and back.)
- Result (measured the following week): not yet measured
- Still queued, deliberately not bundled here: making `pr-checks.yml`
  measure the analytics-enabled build. It is the highest-value
  follow-up from PR #24, but it is the one change likely to *fail*
  the performance guardrail on purpose, and bundling a probable red
  build with four safe changes would have blocked all of them.

### 2026-08-09
- Hypothesis: The blog post is this site's pitch — a public, honest
  record of a loop that measures itself — and it has quietly gone out
  of date in the two ways most damaging to that pitch. It states the
  guardrail as "Lighthouse performance, accessibility, and SEO scores
  all at or above 0.85"; performance has been 0.80 against a
  median of 3 since PR #5 lowered it. And its "What's shipped so far"
  list names three changes, frozen at PR #3, while 25 loop PRs have
  merged. A page arguing that the process is trustworthy because
  everything gets written down, which is itself wrong about the
  numbers it quotes, undercuts its own argument. This is Blog's
  read-time and organic-search metric too: a stale post is a weaker
  page.
- Change: Corrected the guardrail paragraph in `app/blog/page.js` to
  the real thresholds, and added the reason the performance floor
  moved (the same untouched homepage scoring 0.83 then 0.74 back to
  back on shared CI hardware) — the "why" is more interesting than
  the number and is exactly the sort of thing the post exists to
  show. Replaced the frozen three-item list with four thematic
  groups: content, findability, accessibility, and fixing what
  earlier rounds got wrong. That last group is the honest one, and
  the post now says so. **Structural point: the list is a summary
  rather than a running log specifically so it stops going stale** —
  restating it round by round is what broke it the first time, and
  `CHANGELOG.md` is already the per-round ledger the "Follow along"
  section points at. (PR #27)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` for all 5 routes, 30 links, zero failures; verified
  against the served page that the "all at or above 0.85" claim is
  gone and that the corrected thresholds render). Prose-only change:
  no CSS, no new components, no routing.
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The north star is returning-visitor rate, and after 25
  rounds the site still offers a visitor no mechanism whatsoever for
  coming back on purpose. Every improvement so far has optimised the
  visit someone is already having. A feed is the oldest and cheapest
  "tell me when there's something new" primitive on the web, it costs
  a returning visitor zero effort after subscribing once, and unlike
  a mailing list it needs no consent flow, no address, and no
  third-party service. One post makes for a thin feed today, but the
  subscribe decision happens on the visit someone is already having —
  the feed has to exist before the second post, not after it.
- Change: Added `app/feed.xml/route.js`, a Route Handler emitting
  RSS 2.0 at `/feed.xml` with the `atom:link rel="self"` element
  validators expect, served as `application/rss+xml`. Extracted post
  metadata into `app/lib/posts.js` so the page's `<title>`, its
  visible heading, its JSON-LD, and the feed item all read from one
  record instead of four hardcoded copies that can drift — the same
  single-source-of-truth pattern as `lib/sections.js` and
  `lib/tool-categories.js`. Added feed autodiscovery to all five
  routes plus the 404, and a visible "Subscribe via RSS" link in the
  blog byline, since browsers stopped surfacing autodiscovery years
  ago and an invisible feed gets no subscribers. Also wrapped the
  post date in a `<time dateTime="...">` element while it was being
  templated. (PR #26)
- Note for future rounds: `alternates` on a page **replaces** the
  root layout's rather than merging with it — confirmed empirically,
  the same trap the canonical-URL round hit. Setting the feed link
  once at the root put it on the 404 and nowhere else. Hence
  `feedAlternates` in `app/lib/site.js`, spread into each page's
  `alternates` explicitly.
- Guardrails: pass (local `next build` clean, `/feed.xml` compiles to
  a static route, 0 B of client JS; local link check with `linkinator`
  for all 5 routes, 30 links — one more than last round, the new feed
  link — zero failures. Feed parsed and structurally checked rather
  than eyeballed: well-formed XML, `rss version="2.0"`, correct
  `atom:link rel="self"`, one item whose `guid`/`link` resolve to the
  post and whose RFC-822 `pubDate` parses. Verified all 5 routes plus
  a 404 each carry exactly one autodiscovery link, and that every
  route's canonical URL is still its own — the risk in touching five
  `alternates` blocks at once.)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The Tool Finder swaps the category buttons out for the
  result, which destroys the element the visitor just activated —
  and nothing catches the focus. Measured before touching anything,
  by driving it with the keyboard exactly as a keyboard user would:
  after pressing Enter on a category, `document.activeElement` is
  `BODY`. A screen-reader user gets no announcement that anything
  happened at all, and a keyboard user's next Tab restarts from the
  top of the document — the skip link, then all five nav links —
  before it reaches the recommendation they just asked for. The
  "try another category" button had the same problem in reverse.
  Demos' metrics are completion rate and repeat-use rate, and this
  breaks precisely the moment of completion and the replay loop.
- Change: `app/demos/ToolFinder.js` now moves focus to match the
  view swap — to the "For <category>, try:" result line when a
  category is chosen, and back to the "What are you trying to do?"
  question when the visitor restarts. Both targets get
  `tabIndex={-1}` (the same pattern `app/layout.js` already uses for
  the skip link's target). A `hasChosen` ref guards the effect so
  focus is only ever moved in response to a real choice, never
  stolen on first paint. No new CSS: browsers correctly decline to
  paint a focus ring on a programmatically focused paragraph
  (verified — the element reports `:focus-visible` false and a
  computed `outline-style: none`), so there was nothing to suppress.
  (PR #25)
- Guardrails: pass (local `next build` clean, `/demos` chunk 1.26 kB
  → 1.36 kB; local link check with `linkinator` for all 5 routes, 29
  links, zero failures; behaviour verified end-to-end with Puppeteer
  before and after — focus goes `BODY` → the result line on choosing
  and `BODY` → the question line on restart, the next Tab after
  choosing now lands on the first recommended tool card instead of
  the top of the document, and `activeElement` is still `BODY` on
  page load, confirming the guard works)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: Every entry in this log ends with "Result: not yet
  measured," and it always will, because **nothing on this site is
  instrumented at all**. `README.md` step 4 and `.env.example` both
  describe `NEXT_PUBLIC_GA_MEASUREMENT_ID` as the analytics hookup,
  but no code has ever read that variable — grep confirms zero
  references outside those two docs. So the north-star metric
  (returning-visitor rate) and all eleven per-section metrics have no
  mechanism behind them, and 22 rounds of hypotheses have been
  graded on nothing. Wiring up the documented variable is the
  precondition for this loop ever closing its own feedback cycle.
- Change: Added `@next/third-parties` (Vercel's own package, pinned
  to 14.2.35 to match `next`; adds zero transitive dependencies) and
  render `<GoogleAnalytics gaId={...} />` from `app/layout.js`, gated
  on `NEXT_PUBLIC_GA_MEASUREMENT_ID`. Unset — which is the state on
  every environment today — the site emits no analytics script
  whatsoever, so this ships inert and stays inert until a human sets
  the variable in Vercel. Used the officially documented component
  rather than hand-rolling the `gtag` bootstrap with `next/script`,
  which is what Next's own `next-script-for-ga` lint rule exists to
  discourage. Documented the measured cost in `README.md` and
  `.env.example`. (PR #24)
- Guardrails: pass, but with a caveat that matters more than the
  pass. Local `next build` clean both ways; shared JS 87.2 kB →
  87.3 kB with the variable unset (~100 bytes of client-reference
  manifest for a component that never renders). Link check with
  `linkinator` for all 5 routes, 29 links, zero failures. Verified
  both configurations in a real browser: unset → zero
  `googletagmanager` references anywhere in the built output and zero
  third-party requests; set → exactly one tag on each of the 5
  routes. **The cost, measured over the wire with CDP rather than
  guessed: analytics off is 10 requests / 97.4 KB, analytics on is 12
  requests / 243.3 KB. `gtag.js` alone is 145.9 KB — 1.5x the entire
  rest of the page.** Local Lighthouse can't score that difference
  (this machine returns 1.00 on performance either way; the CI
  hardware is what the 0.80 floor was calibrated against), and
  `pr-checks.yml` does not set the variable, so the guardrail is
  currently measuring the analytics-off build and will keep passing
  regardless of what analytics costs in production. That gap is real
  and is the obvious next round: make CI measure the config we
  actually ship.
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: Directory search filters as you type, but nothing ever
  says how many tools matched. A sighted visitor can count cards; a
  screen-reader user gets nothing at all — the results silently swap
  underneath them with no announcement, because there was no live
  region on the page. That's the same class of gap as the last few
  accessibility rounds, and it lands on the one feature Directory's
  "on-site search usage" metric depends on. A visible, announced
  count also tells everyone that a short query narrowed 12 tools to
  3, which is the feedback that makes a search box feel like it's
  working.
- Change: Added a `role="status"` result-count line under the search
  input in `app/directory/DirectorySearch.js` — "3 tools match
  “coding”." / "1 tool matches “claude”." / "No tools match “zzzz”."
  — with the wording centralised in one `countLabel()` helper.
  The element is always in the DOM (empty when there's no query),
  because a live region has to exist *before* its text changes for
  assistive tech to announce it. Removed the now-duplicate "No tools
  match" paragraph from the no-results block, so there's exactly one
  copy of that message; the "Clear search" button added last round
  stays. Added `.directory-result-count` to `app/globals.css`.
  (PR #23)
- Guardrails: pass (local `next build` clean, `/directory` chunk
  1.32 kB → 1.39 kB; local link check with `linkinator` against the
  production build for all 5 routes, 29 links, zero failures;
  verified end-to-end with Puppeteer — the status element is present
  and empty at rest, reports the right singular/plural/zero wording
  for each query, trims whitespace from the echoed query, and there's
  exactly one copy of the no-results message. The reserved
  `min-height` was tuned against a measured layout shift: 1.35em
  still let the tool grid jump 2px when the count appeared, 1.5em —
  exactly one line box at the inherited line-height — measured 0px.)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The Directory search box tells visitors they can
  "Search tools by name or category..." — but the filter only ever
  looked at each tool's name and description, never its category
  name. The promise in the placeholder is simply not implemented.
  Measured before touching anything: of the eight most obvious
  category-shaped queries, five (`coding`, `image`, `assistants`,
  `data`, `audio`) returned *zero* results and two more returned
  partial results that happened to match on description text alone.
  A visitor who types the exact word the UI invited them to type and
  gets an empty page is the worst possible outcome for Directory's
  "on-site search usage" metric — it teaches them the search box
  doesn't work.
- Change: `matches()` in `app/directory/DirectorySearch.js` now
  includes the category name in the haystack alongside name and
  description, so a category query returns every tool in that
  category. One-line-scope fix: no new UI, no data changes, no new
  CSS — the placeholder's existing promise now just holds. (PR #22)
- Guardrails: pass (local `next build` clean, `/directory` chunk
  1.31 kB → 1.32 kB; local link check with `linkinator` against the
  production build for all 5 routes, 29 links, zero failures; the fix
  verified end-to-end in a real browser with Puppeteer — all four
  category names now return their full 3-tool category, the name
  query `claude` still returns exactly 1, and a nonsense query still
  correctly shows the no-results state)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: When a Directory search has no matches, the only way
  back to the full list is manually deleting the typed text — a small
  but real dead end in the exact feature built two rounds ago to give
  Directory's "on-site search usage" metric something to measure. A
  visitor who hits a no-results state and doesn't know how to recover
  is more likely to bounce than to try another search, undermining the
  metric the search box exists to serve.
- Change: Added a "Clear search" button to the no-results state in
  `app/directory/DirectorySearch.js`, reusing the existing
  `.finder-restart` style from the Demos Tool Finder's "try another
  category" button rather than introducing a new near-duplicate class.
  Resets the query to empty and restores all 12 tools. (PR #21)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes; the
  interaction itself verified end-to-end with Puppeteer — typed a
  no-match query, confirmed the button appears, clicked it, confirmed
  the input clears and all 12 tool cards reappear)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The nav gives no indication of which page you're
  currently on — all 5 links always render identically regardless of
  route. That's both a missed visual affordance (helps orient
  visitors, especially now that the nav can wrap to two lines on
  narrow viewports) and an accessibility gap (`aria-current="page"`
  is the standard way assistive tech announces current location in a
  nav).
- Change: Extracted the nav into `app/Nav.js`, a client component
  using `usePathname()` to compare the current route against each
  link's `href`. The matching link gets `aria-current="page"` and a
  `nav-active` class (accent-colored, same accent used for focus/hover
  states elsewhere) instead of the default muted color. `app/layout.js`
  now renders `<Nav />` instead of the hardcoded `<nav>` markup it had
  inline. Kept plain `<a>` tags rather than switching to `next/link`,
  matching the codebase's existing convention (no page in this app
  uses `next/link`) — this change is scoped to adding an active-state
  indicator, not to changing the navigation/prefetching model.
  (PR #20)
- Guardrails: pass (local `next build` clean — the Nav client
  component bundles into the shared JS chunk since it's used in the
  root layout, no per-page size increase; local link check with
  `linkinator` against the production build for all 5 routes; manually
  verified via curl that each route server-renders exactly one
  `aria-current="page"` link, matching that route)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: Every outbound link on the site (12 tool cards in
  Directory, 2 recommended-tool cards per Demos result, the GitHub
  profile link on Projects) opens `target="_blank"` with zero
  indication that a new tab is about to open. For screen-reader users
  especially, a new tab opening unannounced is disorienting — a
  well-established accessibility practice is to signal this
  explicitly rather than silently change context.
- Change: Added a visually-hidden `" (opens in a new tab)"` suffix
  inside every `target="_blank"` link across
  `app/directory/DirectorySearch.js`, `app/demos/ToolFinder.js`, and
  `app/projects/page.js`, using a new `.visually-hidden` utility class
  in `app/globals.css` (standard clip-based sr-only pattern: present
  for assistive tech, not shown visually, doesn't affect layout).
  (PR #19)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes; manually
  verified the hidden text renders in the HTML on Directory (12
  instances, matching all 12 tool links) and Projects)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The site has 7 separate `transition` declarations across
  its cards, buttons, and links, and none of them respected
  `prefers-reduced-motion`. Motion sensitivity is a real accessibility
  need (vestibular disorders, among others), and it's the kind of gap
  a static Lighthouse audit doesn't reliably catch — this only shows
  up if you actually check the OS-level preference.
- Change: Added a single global
  `@media (prefers-reduced-motion: reduce)` rule to
  `app/globals.css` that collapses `transition-duration` and
  `animation-duration` to near-zero for every element, rather than
  patching each of the 7 individual transition rules by hand — more
  robust, and it automatically covers any transition/animation added
  later too. (PR #18)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes; verified
  empirically with Puppeteer's `emulateMediaFeatures`, not just by
  reading the CSS — a `.tool-card`'s computed `transition-duration`
  measured 0.15s under normal conditions and dropped to 0.00001s with
  `prefers-reduced-motion: reduce` emulated)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The site had no web app manifest and no `theme-color`,
  so mobile browser chrome (the address-bar area on Chrome
  Android/Safari iOS) doesn't match the site's dark theme, and there's
  no metadata for "Add to Home Screen" to use. Small, standard PWA-lite
  polish that costs nothing new — reuses the `icon.svg` and colors
  already shipped.
- Change: Added `app/manifest.js` (Next.js's file convention, compiles
  to `/manifest.webmanifest`) with name/short_name/description/
  background_color/theme_color all matching existing site metadata,
  and a single SVG icon entry reusing `/icon.svg`. Added
  `export const viewport = { themeColor: "#0b0d0f" }` to
  `app/layout.js` — `themeColor` lives in a separate `viewport` export
  in this Next.js version, not `metadata` (verified against current
  docs; the older pattern of putting it in `metadata` is deprecated).
  (PR #17)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes; manifest
  JSON validated to parse correctly; theme-color meta tag and manifest
  link tag verified present in rendered HTML)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The site had no custom favicon, so browser tabs and
  bookmarks show Next.js's generic default icon instead of anything
  that identifies AddictedtoAI — a small but real polish/identity gap
  for a site that now has real content across every section.
- Change: Original plan was `app/icon.js` using Next's `next/og`
  `ImageResponse` convention (dynamic PNG generation). That broke
  `next build` outright (exit code 1, not just a warning): the
  bundled `next/og`'s default-font loader
  (`fileURLToPath(new URL("./Geist-Regular.ttf", import.meta.url))`)
  threw `TypeError: Invalid URL` in this environment. Tried supplying
  an explicit custom font to avoid that code path, but every candidate
  static-font URL tested came back 404 — not worth guessing at a
  fetch-at-build-time dependency for a favicon, especially one that
  can fail the *entire* build if the URL ever breaks. Went with a
  static `app/icon.svg` instead: no build-time image generation, no
  font dependency, works identically on every platform, and Next.js
  picks it up automatically via the same file-convention mechanism.
  Simple mark: rounded square in the site's accent color (`#5eead4`)
  with a bold "A". Skipped a matching `apple-icon` for this round —
  Apple requires PNG specifically (SVG isn't supported for home-screen
  icons), which would need the same broken `ImageResponse` path or a
  real image asset I don't have; worth a follow-up once there's a
  proper image-generation path. (PR #16)
- Guardrails: pass (local `next build` clean, exit code 0; local link
  check with `linkinator` against the production build for all 5
  routes; manually verified `/icon.svg` is served with a 200 and
  correct content, and that `<link rel="icon">` points at it)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: `.nav` had no `flex-wrap`, and the nav has grown to 5
  items ("AddictedtoAI" plus the 4 sections). Measured with Puppeteer
  at a 360px mobile viewport (iPhone SE-class width) before touching
  anything: the nav caused 48px of horizontal overflow
  (`document.body.scrollWidth` 408px vs. `window.innerWidth` 360px) —
  a real, confirmed bug, not a hypothetical one. Horizontal overflow
  on mobile is a concrete usability problem (content gets clipped or
  the whole page gains an awkward horizontal scrollbar) that would
  hurt every metric downstream of a mobile visitor actually being able
  to use the site, most directly the north-star returning-visitor rate
  if their first visit is broken.
- Change: Added `flex-wrap: wrap` to `.nav` in `app/globals.css`
  (plus switched `gap` to a row/column shorthand: `0.75rem 1.5rem`)
  so nav items wrap onto a second line on narrow viewports instead of
  overflowing the page horizontally. Re-measured the same way after
  the fix: `document.body.scrollWidth` now matches `window.innerWidth`
  exactly (360px) at the same viewport. (PR #15)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes; the fix
  itself was verified empirically with a Puppeteer before/after
  measurement at a 360px viewport, not just asserted from reading the
  CSS)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: No page declared a canonical URL, and the sitemap
  (shipped a few rounds back) lists routes without a trailing slash
  while Next.js will happily serve the same content whether or not
  one is appended — exactly the kind of ambiguity canonical tags
  exist to resolve. Without one, search engines have to guess which
  URL variant is authoritative for a page, which can dilute ranking
  signal instead of consolidating it on one URL. This completes the
  set of standard technical-SEO levers alongside per-page metadata,
  robots.txt/sitemap.xml, and JSON-LD already shipped.
- Change: Added `metadataBase: new URL(getSiteUrl())` to
  `app/layout.js` (required for relative URLs in `alternates` to
  resolve to absolute ones) and an explicit
  `alternates: { canonical: "<path>" }` to each of the 5 pages'
  existing `metadata` exports. Canonical `alternates` don't inherit
  or auto-derive the way `openGraph`/`twitter` title/description do
  (verified — there's no equivalent fallback mechanism), so each page
  needed its own explicit entry rather than one set at the root.
  (PR #14)
- Guardrails: pass (local `next build` clean, no warnings; local link
  check with `linkinator` against the production build for all 5
  routes; manually verified each page's `<link rel="canonical">`
  resolves to that page's own correct path)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The site has no structured data, so search engines can
  only guess at what the homepage is (a site) and what the blog post
  is (an article) from unstructured HTML. Schema.org JSON-LD is a
  standard, low-effort way to state that explicitly, which can make a
  page eligible for richer search result presentation (e.g. article
  rich results with a byline/date) — a lever for Blog's organic
  search traffic metric, complementing the per-page metadata,
  robots.txt, and sitemap already shipped. This is real, accurate
  markup (not fabricated): every field mirrors content already live
  on the page.
- Change: Added `WebSite` JSON-LD to `app/layout.js` (site-wide, name/
  url/description matching the existing root metadata) and
  `BlogPosting` JSON-LD to `app/blog/page.js` (headline/description
  matching the page's own metadata, `datePublished` matching the
  visible "Posted 2026-08-09" byline, author/publisher as the
  `AddictedtoAI` organization since there's no individual byline on
  the post). Both render as `<script type="application/ld+json">`
  tags per Next.js's documented pattern. (PR #13)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes; both
  JSON-LD blocks verified to parse as valid JSON and appear correctly
  on their respective pages — WebSite site-wide, BlogPosting
  additionally on `/blog`)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: Keyboard and screen-reader users had no way to bypass
  the nav and jump straight to page content — every page load forced
  tabbing through 5 nav links first. That's a real accessibility gap,
  and it's exactly the kind of thing the Lighthouse accessibility
  guardrail (>= 0.85) exists to catch, though a static audit doesn't
  always flag missing skip links specifically. This was originally
  going to be Open Graph + Twitter Card metadata, but building it
  surfaced that Next.js's Metadata API auto-generates Twitter Card
  tags from any `openGraph` object with no documented opt-out —
  confirmed empirically, not just from docs — which conflicts with an
  explicit instruction to keep this site free of
  Twitter/social-platform-specific integration. Open Graph was dropped
  entirely rather than ship the auto-generated Twitter tags, and this
  skip-link fix took its place for this round instead.
- Change: Added a "Skip to content" link as the first focusable
  element in `app/layout.js`, visually hidden until keyboard-focused
  (standard accessible pattern: positioned off-screen, slides into
  view on `:focus`). Points at `id="main-content"` on the `<main>`
  element, with `tabIndex={-1}` so focus actually lands there when
  the link is activated, not just a scroll. Added `.skip-link` styles
  to `app/globals.css`. (PR #12)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes; manually
  verified the skip link and its target render correctly in the HTML)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The homepage's only path into the blog is a generic
  section card ("Blog" / "AI news and commentary.") — the same
  abstract, category-level pitch every section card uses. It doesn't
  say there's an actual post there, let alone what it's about. A
  specific, concrete teaser naming the real post ("How this site
  builds itself") is a stronger, more curiosity-driven reason to
  click than a generic category label, and gives the homepage a
  second, more compelling path into `/blog` on top of the existing
  card. Should increase clicks from `/` into `/blog` beyond what the
  section card alone gets, supporting session depth toward the
  north-star returning-visitor metric.
- Change: Added a "Latest from the blog" teaser to `app/page.js` below
  the existing section grid, linking to `/blog` with the actual post
  title and a one-line hook. Hardcoded to the current single post
  (there's no post collection/CMS to generalize from yet — revisit
  this if a second post ships). Added `latest-post`/`latest-post-label`/
  `latest-post-link` styles to `app/globals.css`, matching the existing
  `section-card` look. (PR #11)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes — no new
  unique links, just a second homepage path to the already-checked
  `/blog` route)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: A mistyped or broken internal/external link (very
  possible now that there are 24+ outbound links plus five internal
  routes) hit Next's generic default 404 page — a dead end with no
  way back into the site except the browser's back button. That's a
  direct hit against the north-star metric: a visitor who lands on a
  bare error page is much less likely to explore further or return
  than one who lands somewhere that still offers a way in. Replacing
  it with a styled 404 that links back into all four sections (same
  `section-grid`/`section-card` pattern as the homepage) should
  recover some of those sessions instead of losing them outright.
- Change: Added `app/not-found.js` — Next's App Router convention for
  a custom 404 — styled to match the site and listing all four
  sections as recovery links. Extracted the `sections` list out of
  `app/page.js` into `app/lib/sections.js` so the homepage and the
  404 page share one source of truth instead of duplicating the same
  four entries. No new CSS needed; reuses `section-grid`/`section-card`
  as-is. (PR #10)
- Guardrails: pass (local `next build` clean — `_not-found` now
  compiles to a lighter custom page instead of Next's default;
  local link check with `linkinator` confirmed all 4 recovery links
  plus every existing route still resolve 200. The 404 test route
  itself correctly reports 404, which is the intended behavior, not a
  broken link, and isn't among the 5 routes CI actually checks)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The site had no `robots.txt` and no `sitemap.xml` —
  nothing explicitly telling search engines every route is crawlable,
  and no single file listing all five routes for a crawler to
  discover them efficiently. This is a standard, low-effort lever for
  organic search traffic (Blog's metric) and general discoverability
  across every section, complementing last round's per-page metadata:
  metadata makes each page's snippet better once it's found; a
  sitemap and robots.txt make pages easier to find in the first
  place.
- Change: Added `app/robots.js` (allows all crawling, points at the
  sitemap) and `app/sitemap.js` (lists all five routes with
  `lastModified`/`changeFrequency`/`priority`), using Next.js's App
  Router file conventions — both compile to static `/robots.txt` and
  `/sitemap.xml` routes. Added `app/lib/site.js` with a small
  `getSiteUrl()` helper shared by both: prefers an explicit
  `NEXT_PUBLIC_SITE_URL` env var if one is ever set, falls back to
  Vercel's auto-injected `VERCEL_URL` (so it's correct on whatever
  domain is actually live, preview or production, with zero config),
  falls back to `localhost:3000` for local dev. (PR #9)
- Guardrails: pass (local `next build` clean — both new routes show up
  as static output; local link check with `linkinator` against the
  production build for all 5 main routes plus the two new ones;
  manually verified `/robots.txt` and `/sitemap.xml` render correct
  content)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: Every route shared one generic `<title>`/description from
  the root layout ("AddictedtoAI" / "AI news, tools, projects, and
  demos.") — search engines saw the same title and snippet for `/`,
  `/blog`, `/directory`, `/projects`, and `/demos` alike. That directly
  works against Blog's own metric, organic search traffic, and every
  other page's discoverability: duplicate titles/descriptions across a
  site are a well-known ranking and click-through weakness, and a
  generic snippet gives a search result nothing distinctive to show.
  Giving each route its own accurate title and description should
  improve how each page shows up in search results and how likely a
  snippet is to earn a click.
- Change: Added a title template (`"%s | AddictedtoAI"`) to the root
  layout, and a real per-page `metadata` export (title + description)
  to all five routes — the homepage uses an absolute title bypassing
  the template. `/directory` and `/demos` are client components, and
  Next.js doesn't allow a `metadata` export from a Client Component,
  so their interactive parts were extracted into
  `app/directory/DirectorySearch.js` and `app/demos/ToolFinder.js`;
  `page.js` for both is now a plain server component that exports
  metadata and renders the extracted client component — the officially
  documented pattern for this exact situation. No behavior changes to
  either interactive feature. (PR #8)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes; manually
  verified each route's rendered `<title>` and meta description are
  unique and correct; confirmed the Directory search input and Demos
  Tool Finder still render and function identically after the
  extraction)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: All four sections now have real content, so this pass
  looks for a metric with nothing measuring it rather than a
  placeholder. Directory's two documented metrics are "outbound
  clicks to tools" (shipped, PR #2) and "on-site search usage" — but
  there has never been any search or filter UI on the page, so that
  second metric has had zero mechanism to register since the Directory
  existed. Adding a simple client-side search box that filters the
  existing tool cards by name/category as you type gives that metric
  something to actually measure for the first time, and should also
  help entries-browsed-per-session as the list grows past a quick
  scan.
- Change: Converted `app/directory/page.js` to a client component
  (`"use client"`) with a search input; filtering happens client-side
  against the existing `toolCategories` data (name + description
  match, case-insensitive), hiding categories with zero matches and
  showing a "no tools match" message when nothing does. No data or
  routing changes. Added `directory-search`/`directory-no-results`
  styles to `app/globals.css`. (PR #7)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes — the
  default empty-query render still statically includes all 12
  existing tool-card links unchanged, so no new link risk)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: Projects was the last remaining placeholder section.
  Its metrics (inquiry/contact clicks, outbound repo clicks, time on
  page) all need a real write-up with real actions to click, which a
  one-line placeholder can't produce. The only project this loop can
  write about truthfully, without inventing a portfolio, is
  AddictedtoAI.net itself — same reasoning as the blog post.
  Two details needed a human decision first (asked before building):
  the site's own repo is private, so there's nothing to link for
  "outbound repo clicks" without it 404ing for visitors; and there was
  no contact channel yet for "inquiry clicks." Given the answers (link
  the GitHub profile instead of the repo; use a dedicated
  AddictedtoAI@proton.me address rather than the personal email), a
  real write-up with working outbound actions should move time on
  page and give both click metrics something to register for the
  first time.
- Change: Replaced the Projects placeholder in `app/projects/page.js`
  with a write-up of the site itself — the idea, how the loop
  works (linking to the blog post rather than repeating it), and the
  stack — plus a `project-actions` row with two outbound
  actions: a `mailto:AddictedtoAI@proton.me` link and a link to
  github.com/addicted2ai. Reused the `article` typography added for
  the blog post; added `project-actions`/`project-action` styles to
  `app/globals.css` for the CTA row. (PR #6)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes.
  Confirmed via lychee's own docs that mail-address checking is
  opt-in via `--include-mail`, which `pr-checks.yml` doesn't pass, so
  the mailto link isn't validated by CI at all — also confirmed
  proton.me has valid MX records regardless. GitHub profile link
  verified 200.)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: Blog is the last section still showing the placeholder
  note (Projects is too, but picking one at a time). Its metric,
  organic search traffic, needs something indexable and worth reading
  — a one-line placeholder gives search engines and visitors nothing.
  Rather than invent generic "AI news" commentary (stale fast, easy to
  get wrong, not something this loop can responsibly write without a
  human's editorial voice), the more honest and differentiated post is
  a first-person, fully accurate explanation of how this site itself
  gets built: the weekly propose-build-measure loop, the guardrails,
  and what's shipped so far. It's real content this loop can write
  truthfully (it's describing its own documented process), it's a
  genuinely unusual angle for search ("a site that builds itself"),
  and a substantive single post gives Blog's other metrics (avg. read
  time, scroll depth) something to actually measure.
- Change: Replaced the Blog placeholder in `app/blog/page.js` with a
  single real post, "How this site builds itself," covering the loop
  mechanics, the guardrails, and a recap of the three changes shipped
  so far (PR #1-#3). Added minimal typography styles (`post-meta`,
  `article h2/p/ul/li/code/a`) to `app/globals.css` — the site had no
  prose styling yet since every prior page was short fragments or
  cards. First draft linked out to the GitHub repo as "public"; caught
  in the local link check that the repo is actually private (404 for
  an unauthenticated visitor, not just the crawler), so that claim and
  link were removed before opening the PR. (PR #4)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes, including
  the one broken link caught and fixed pre-PR as above)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: Demos is the last of the four sections still showing the
  placeholder note — the same dead-end problem that motivated last
  week's Directory change. Its documented metrics (completion rate,
  repeat-use rate, session length) all require something a visitor can
  actually finish and replay, which a static placeholder can never
  produce. Adding one small, fully client-side interactive demo — a
  "Tool Finder" that asks what you're trying to do and recommends real
  tools from the Directory — gives Demos a real completion event
  (reaching a recommendation), a natural replay loop ("try another
  category"), and a second real cross-section link (Demos to
  Directory) reinforcing the session-depth bet from two weeks ago. This
  should move Demos' completion rate and repeat-use rate, and modestly
  add to Directory's outbound-click numbers.
- Change: Extracted the tool data from `app/directory/page.js` into a
  shared `app/lib/tool-categories.js` module (single source of truth so
  Demos and Directory can never recommend different tools). Replaced
  the Demos placeholder with a client component (`"use client"`) quiz:
  pick a category, see two recommended tools plus a link to the full
  category in the Directory, with a "try another category" reset.
  Added matching `finder`/`finder-option`/`finder-result` styles to
  `app/globals.css`. No new external links: the tool-card recommendations
  only render after a click, so they never appear in the static HTML
  the guardrail crawls. (PR #3)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes — the
  Demos page's static HTML has zero new outbound links, only the
  page's own JS chunk, so this change carries none of the external-link
  risk the last two did)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: Last week's change sends real clicks from `/` into
  `/directory`, but the Directory page was still a placeholder note —
  visitors who followed that new entry point landed on a dead end with
  nothing to click. The Directory page's own metric (outbound clicks to
  tools) can't move at all without real tools on the page, and a dead
  end right after the homepage funnel undercuts the session-depth gain
  that change was betting on. Replacing the placeholder with a real
  curated list of AI tools, grouped by category, with outbound links,
  should increase outbound clicks to tools and entries browsed per
  session, both leading indicators for returning-visitor rate.
- Change: Replaced the Directory placeholder with 12 real tools across
  4 categories (Chat & Assistants, Coding, Image/Video/Audio, Workflow
  & Data), each an outbound link opened in a new tab
  (`target="_blank"`) so browsing the directory doesn't cost the
  session. Added matching `tool-category`/`tool-grid`/`tool-card` styles
  to `app/globals.css`. (PR #2)
- Guardrails: pass after one round-trip through CI (local `next build`
  clean; all 12 outbound links plus every existing internal link
  verified 200 with a local link check against the production build
  before opening the PR — one candidate, Notion, was dropped locally
  after it came back 403 from bot protection and was swapped for
  Zapier). The actual CI Lychee run then failed on Gemini
  (`gemini.google.com`) with an HTTP/2 protocol error — a known lychee
  quirk on Google-fronted domains that a local link check couldn't
  reproduce (curl and Node-based checkers negotiate HTTP/2 differently
  and don't trip it). Swapped Gemini for You.com and re-pushed.
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The homepage was a placeholder with no real entry points
  into the four sections (nav links only). Visitors landing on `/` had
  no on-page reason to explore more than one section, and session depth
  (sections visited per session) is a leading indicator for the
  north-star metric, returning-visitor rate. Replacing the placeholder
  copy with four clickable section cards (title + one-line value prop)
  should increase clicks from `/` into `/blog`, `/directory`,
  `/projects`, and `/demos`, which should in turn lift returning-visitor
  rate.
- Change: Replaced the placeholder homepage body with a `section-grid`
  of four `section-card` links (one per section, matching the metrics
  already documented per-section), styled to match the existing dark
  theme. (PR #1)
- Guardrails: pass (local `next build` clean; no new links beyond the
  four existing section routes, all already covered by nav)
- Result (measured the following week): not yet measured

<!--
Entry template for future weeks:

### YYYY-MM-DD
- Hypothesis: <what we expected and why>
- Change: <what was actually shipped> (PR #N)
- Guardrails: pass/fail
- Result (measured the following week): <metric delta, or "not yet measured">
-->
