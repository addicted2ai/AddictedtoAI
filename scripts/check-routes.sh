#!/usr/bin/env bash
# Verify the routes lychee never crawls: the non-HTML ones, plus the
# custom 404. Run against a server already listening on $BASE.
#
#   npm run build && npm run start &
#   bash scripts/check-routes.sh
#
# Exits non-zero on the first failure, printing what it expected.
set -uo pipefail

BASE="${BASE:-http://localhost:3000}"
failures=0
# Skipped checks are reported separately from passing ones. "all route checks
# passed" alongside a silent skip is how a hand-started run comes to believe
# it verified something it never looked at.
skipped=0

# --- sub-check bookkeeping ---------------------------------------------------
#
# Every sub-check below used to be wired up as
#
#     node scripts/check-whatever.mjs#
# at 31 call sites, which SUMS EXIT CODES instead of counting failures. A
# sub-check exiting 127 ("command not found") added 127, so the roll-up read
# "127 check(s) failed" when one command was missing. Reproduced on 2026-08-23
# by replacing one invocation with a name that does not exist: 1,080 lines of
# output, "127 check(s) failed", and not one line beginning with FAIL anywhere
# in it. That last part is the worse half. scripts/round.mjs surfaces route
# failures by filtering this output for /^FAIL/, so a run whose only failure
# was a sub-check's exit code showed the operator a number and nothing else --
# no name, no reason, nothing to act on. A check that cannot say what failed
# trains rounds to ignore it.
#
# So: one failure per failing sub-check, a FAIL line naming it (which is what
# reaches round.mjs), and a roll-up that lists them.
failed_steps=""
# A sub-check that reports UNVERIFIED ran but could not evaluate its claim --
# no network, no `gh`, no local server. That is not a pass, and the roll-up
# must not describe a run containing one as "all route checks passed". It is
# also not a failure: scripts/check-frame.mjs and
# scripts/check-free-model-exclusion.mjs both exit 0 in that state on purpose,
# because CI genuinely cannot evaluate those facts (FRAME.md's own preamble
# says so). The roll-up names them instead of swallowing them.
unverified_steps=""
step_log="${TMPDIR:-/tmp}/check-routes-step.$$"

record_step() {
  step_rc="$1"
  step_label="$2"
  if [ "$step_rc" -ne 0 ]; then
    echo "FAIL  $step_label exited $step_rc"
    failures=$((failures + 1))
    if [ -z "$failed_steps" ]; then
      failed_steps="  - $step_label (exit $step_rc)"
    else
      failed_steps="$failed_steps
  - $step_label (exit $step_rc)"
    fi
  fi
}

# Runs one sub-check. `tee` rather than a captured buffer so a slow check still
# prints as it goes; PIPESTATUS[0] because `set -o pipefail` is on but the
# status wanted here is the sub-check's, not tee's.
run_step() {
  "$@" 2>&1 | tee "$step_log"
  step_rc=${PIPESTATUS[0]}
  record_step "$step_rc" "$*"
  if grep -qiE '^[[:space:]]*unverified' "$step_log"; then
    if [ -z "$unverified_steps" ]; then
      unverified_steps="  - $*"
    else
      unverified_steps="$unverified_steps
  - $*"
    fi
  fi
}

check() {
  local path="$1" want_status="$2" want_type="$3" want_text="$4"
  local url="$BASE$path"
  local headers status ctype body

  headers=$(curl -s -o /dev/null -D - -w '%{http_code}' "$url")
  status="${headers##*$'\n'}"
  ctype=$(printf '%s' "$headers" | tr -d '\r' | grep -i '^content-type:' | head -1 | cut -d' ' -f2-)
  body=$(curl -s "$url")

  local problem=""
  [ "$status" = "$want_status" ] || problem="status $status (want $want_status)"
  case "$ctype" in
    *"$want_type"*) ;;
    *) problem="${problem:+$problem; }content-type '$ctype' (want *$want_type*)" ;;
  esac
  case "$body" in
    *"$want_text"*) ;;
    *) problem="${problem:+$problem; }body missing '$want_text'" ;;
  esac

  if [ -n "$problem" ]; then
    echo "FAIL  $path  -> $problem"
    failures=$((failures + 1))
  else
    echo "ok    $path  ($status, $want_type)"
  fi
}

#     path                     status  content-type  must contain
check /feed.xml                200 "rss+xml"   "<rss"
check /sitemap.xml             200 "xml"       "<urlset"
check /robots.txt              200 "text"      "Sitemap:"
check /manifest.webmanifest    200 "json"      '"start_url"'
check /icon.svg                200 "svg"       "<svg"
# The custom 404 must both report 404 and actually render the recovery
# page -- a soft 404 that returns 200 is its own SEO problem.
check /this-route-does-not-exist 404 "text/html" "Page not found"

# Search is a primary wayfinding control, so keep its named landmarks in the
# server-rendered HTML. Browser checks cover the interaction; these assertions
# catch an accidental revert before a browser ever gets a chance to run.
check /directory 200 "text/html" '<form class="search-control" role="search" aria-label="Search the tool directory"'
check /log       200 "text/html" '<form class="log-filter" role="search" aria-label="Search the build log"'
check /demos     200 "text/html" 'role="group" aria-labelledby="finder-question-label"'
check /directory 200 "text/html" 'id="directory-results" aria-labelledby="directory-results-label"'
check /log       200 "text/html" 'id="build-log-results" aria-labelledby="build-log-results-label"'
# The archive and the early-log pages carry the rest of the record and the
# same search.
check /log/archive 200 "text/html" '<form class="log-filter" role="search" aria-label="Search the build log"'
check /log/archive 200 "text/html" 'id="build-log-results" aria-labelledby="build-log-results-label"'
check /log/early 200 "text/html" '<form class="log-filter" role="search" aria-label="Search the build log"'
check /log/early 200 "text/html" 'id="build-log-results" aria-labelledby="build-log-results-label"'
# The retirement calendar is data-driven: both halves of its promise must
# render (upcoming and past), and a known row must survive the render.
# "gpt-5.2-chat-latest" exists only as a data row, so it cannot be satisfied
# by prose. The past table existing is the "shutdowns stay visible" promise.
check /model-retirement-calendar 200 "text/html" 'data-retirement-table="upcoming"'
check /model-retirement-calendar 200 "text/html" 'data-retirement-table="past"'
check /model-retirement-calendar 200 "text/html" 'gpt-5.2-chat-latest'

# The deprecation checker (docket/open/2026-08-22-model-deprecation-checker.md)
# is entirely client-side, but its input control and its discoverability link
# from the calendar it reuses must render in the server HTML so a crawler --
# and this check -- can see them without executing JS.
check /model-retirement-calendar 200 "text/html" 'href="/model-deprecation-checker"'
check /model-deprecation-checker 200 "text/html" 'id="checker-input"'
check /model-deprecation-checker 200 "text/html" 'Paste an example'

# The migration-chain walker was WITHDRAWN by round 186 (audit): all four rows
# in RETIREMENT_DATES whose replacement chain runs past one hop are models
# switched off in May 2026, so the risk the page taught readers to check could
# not reach anything they were still running. What is asserted now is what
# CHARTER.md rule 9 actually requires of a withdrawal -- the address still
# resolves, and it says it was withdrawn -- not the interactive control, which
# is gone. The two discoverability links this block used to assert are gone
# with it, by design: a live page pointing readers at a retraction notice is
# worse than not pointing at all.
check /model-migration-chains       200 "text/html" 'Withdrawn 2026-08-24'
check /model-migration-chains       200 "text/html" 'This page has been withdrawn'

# The vendor notice-floor comparator was WITHDRAWN by round 186 (audit).
#
# Worth reading before this block is ever restored, because this is the
# specific defect CHARTER.md's audit charge exists to catch and this file is
# where it hid. The six assertions that stood here checked the page's static
# coverage table and its two labelled numbers, and the block's own comment
# said the live comparison table was deliberately NOT asserted because "it is
# legitimately empty some days". That was true and it was the whole problem:
# the table was empty on every single day of the page's published life, and
# this check could not tell the difference between a comparator that worked
# and one that had nothing to compare. Six green assertions, and none of them
# touched the thing the page was for. The audit prompt's "checks that cannot
# fail" watch-item, made concrete -- the check did not lie, it measured the
# frame around the product instead of the product.
#
# The lesson is not "assert the row count" (which really would go stale as the
# data moves). It is that a page whose output can legitimately be empty every
# day needs something else to justify being a route at all.
#
# scripts/check-notice-floor-comparator.mjs below still runs: the comparator
# library is correct code and is kept so restoring this page is small if a
# vendor with a comparable floor ever publishes a dated shutdown.
check /promise-vs-practice          200 "text/html" 'Withdrawn 2026-08-24'
check /promise-vs-practice          200 "text/html" 'This page has been withdrawn'
echo
run_step node scripts/check-notice-floor-comparator.mjs

# The subscribable .ics calendar feed (docket/open/2026-08-22-model-shutdown-ics-feed.md):
# a static route, generated once at build time from RETIREMENT_DATES (see
# app/model-retirement-calendar.ics/route.js's own header for the two ways
# that is enforced). These are the cheap, server-facing half of its
# checking -- right content-type, right body shape, and the Subscribe links
# actually render on both pages that promise them; the deep RFC 5545
# parser validation and the one-event-per-row assertion are
# scripts/check-model-retirement-ics.mjs below, which needs no server.
check /model-retirement-calendar.ics 200 "text/calendar" "BEGIN:VCALENDAR"
check /model-retirement-calendar.ics 200 "text/calendar" "VERSION:2.0"
check /model-retirement-calendar.ics 200 "text/calendar" "BEGIN:VEVENT"
check /model-retirement-calendar.ics 200 "text/calendar" "gpt-5.2-chat-latest"
check /model-retirement-calendar   200 "text/html" 'href="/model-retirement-calendar.ics"'
check /model-deprecation-checker   200 "text/html" 'href="/model-retirement-calendar.ics"'
echo
run_step node scripts/check-model-retirement-ics.mjs

# The parser's own health check: assert it still matches every `what` string
# (and every parenthetical alias) in the live RETIREMENT_DATES export, so a
# future edit to that data cannot silently break matching without a red
# build -- prompts/tracks/build.md's "you fail if you ship a demo with no
# health check", made concrete. See scripts/check-model-deprecation-parser.mjs.
echo
run_step node scripts/check-model-deprecation-parser.mjs
# The migration-chain walker's own health check
# (docket/open/2026-08-22-model-migration-chains.md, requirement 5): walks
# every chain in the live RETIREMENT_DATES data and asserts none of them
# loop and every hop resolves to a data row or an explicit "not in the data"
# leaf, plus the two named parsing cases (dall-e-2's multi-option
# replacement, o1-pro-2025-03-19's parenthetical qualifier) by name. Proved
# able to fail on a planted cycle, a planted malformed replacement, and (this
# round, manually, reverted) a real cycle introduced into the checked-in
# data itself -- see scripts/check-model-migration-chains.mjs's own header
# and this round's CHANGELOG.md entry.
echo
run_step node scripts/check-model-migration-chains.mjs
# The loop-history page is data-driven: its figures come from the committed
# snapshot, and the snapshot's own timestamp must be visible so a stale figure
# reads as stale. The page's claim to checkability is the snapshot date and
# the "attempted is not shipped" distinction — both must survive the render.
# The taken-at date is read from the snapshot file, never restated, so this
# assertion does not need bumping when a later round regenerates it.
loop_snapshot=$(node -e 'const s=require("./app/lib/loop-history.json");process.stdout.write(s.taken_at)')
check /loop-history 200 "text/html" 'data-loop-history-stats'
check /loop-history 200 "text/html" "$loop_snapshot"
check /loop-history 200 "text/html" 'Attempted is not shipped'

# lychee follows redirects and reports 200, so a Directory link that now
# resolves somewhere else -- runwayml.com -> runway.com -- passes its check
# forever. The href in tool-categories.js is the recorded final URL; this
# resolves each one and fails on any mismatch.
echo
run_step node scripts/check-tool-links.mjs
# The overflow fallback in check-tool-links.mjs only ever fires on
# gemini.google.com, which sends ~24 KiB of response headers -- so the
# real-directory run above cannot tell a working fallback from a silently
# disabled one. Re-run the checker against a loopback server that sends the
# same oversized headers, and against a port nothing listens on, so both
# directions of the fallback are asserted without reaching the internet.
echo
run_step node scripts/test-tool-links-overflow.mjs
# The review-artifact gate's three invariants, on scratch git repositories:
# a covering approve passes, a branch with only stale artifacts fails for the
# right reason, and a covering reject fails. The middle case is the one that
# would regress silently -- a checker made permissive enough to ignore absent
# commits could also stop requiring a covering approve, and this test holds
# it to all three at once.
echo
run_step node scripts/test-review-artifact.mjs
# The shared-checkout guard's two directions and its two boundaries: an
# attributed session that is still advancing defers the checkout (bounded,
# so a session that never stops cannot halt the loop), and a session that
# predates the supervisor's launch -- the maintainer's own, or an
# orchestrator session that outlived its iteration -- never blocks it. The
# test drives scripts/orchestrate-liveness.sh against a stub session API
# that serves crafted GET /session payloads.
echo
run_step node scripts/test-orchestrate-checkout.mjs
# CHARTER.md rule 13a's stop-mechanism reservation: "a present, non-empty
# docket/HOLD.md stops the loop." scripts/check-hold-mechanism.mjs (the
# PR-diff check, not required yet -- see .github/workflows/pr-checks.yml)
# only checks the shape of a diff; this is the behavioural half, and it runs
# here because it needs no diff at all -- it actually runs the real
# scripts/orchestrate.sh in an isolated sandbox and reads what it did.
# Landing it in build-and-audit (a required check today) gives the
# behavioural half of rule 13a's stop-mechanism reservation real enforcement
# immediately, unlike the two new PR-diff checks alongside it.
echo
run_step node scripts/test-orchestrate-hold.mjs
# Round loop/meta/runner-config: harness/provider/model/variant are now
# scripts/runners.yml's job, not a hardcoded string in scripts/orchestrate.sh, and
# policy.yml's former second copy is now a `runner:` reference into that
# file. scripts/check-runner-config.mjs asserts the reference still resolves
# and still names an `opencode` harness -- the only harness this pricing
# card applies to.
echo
run_step node scripts/check-runner-config.mjs
# scripts/runner-preflight.mjs's own seven preconditions -- unknown runner,
# unknown harness, harness absent from PATH, an excluded model, an
# unreachable harness server, the SPA-shell content-type guard, an
# unauthenticated provider, a model absent from the provider's live
# catalogue, and the "UNVERIFIED is not a guessed PASS" case for a harness
# with no local catalogue endpoint -- proved able to fail against a stub
# /provider server and synthetic scripts/runners.yml fixtures, never the real
# OpenCode server or a real binary beyond `node`. These same failures were
# also constructed by hand against the real local server this round;
# CHANGELOG.md and docket/briefs/loop-meta-runner-config.md record that
# proof, which is not repeatable in CI (no server, no credentials there) --
# this is the CI-safe version.
echo
run_step node scripts/test-runner-preflight.mjs
# The wiring between scripts/orchestrate.sh and the runner system, not just
# scripts/runner-preflight.mjs in isolation: that the supervisor actually
# calls it, actually reads HARNESS/PROVIDER/MODEL/VARIANT off its RUNNER_OK
# line, actually sources the named harness adapter and calls its `launch`,
# and that a failed preflight skips the pass -- logged, never counted as a
# failed iteration, never launching anything -- rather than falling back to
# a different runner. Drives the real scripts/orchestrate.sh in an isolated
# sandbox, the same technique scripts/test-orchestrate-hold.mjs uses for the
# HOLD.md stop mechanism, against a synthetic test-only harness adapter --
# never opencode, codex or claude, and never a real session.
echo
run_step node scripts/test-orchestrate-runner-launch.mjs
# Adversarial review on this same round found scripts/runners.yml's
# excluded_model_patterns (`-free$`) missed every `:free`- and
# `/free`-suffixed model reachable on this account's connected providers --
# 17 of 23, including a live reproduction with `openai/gpt-oss-20b:free` --
# while the file's own comment called the exclusion "absolute". Two checks,
# not one: a fixed-table regression guard against the real pattern data
# (works anywhere, no live server needed) and a live re-derivation against
# the actual catalogue whenever one is reachable (PASS/FAIL/UNVERIFIED, the
# same convention FRAME.md's own checks use -- never a silent PASS when it
# cannot be evaluated). See scripts/runners.yml's own header for the fix and
# the residue it does not close.
echo
run_step node scripts/test-free-model-pattern.mjs
echo
run_step node scripts/check-free-model-exclusion.mjs
# The DeepSeek peak-hour guard (docket/open/2026-08-17-deepseek-peak-hour-pricing.md):
# scripts/peak-window.mjs at every boundary the two half-open UTC windows
# define, and scripts/orchestrate-peak.sh's peak_guard() -- the function
# scripts/orchestrate.sh calls before every iteration start -- exercised
# directly for both a skipped and an authorised iteration inside the same
# window, plus the fail-closed and self-expiring-authorisation cases.
echo
run_step node scripts/test-peak-window.mjs
# The generative-push multiplier (docket/open/2026-08-22-model-deprecation-checker.md,
# CHARTER.md's 2026-08-22 amendment): scripts/generative-push.mjs's pure
# functions at the boundaries that matter -- zero generative stock (no boost
# can fire), the decay landing exactly on the floor, and a shipped count high
# enough that the unclamped value would go below it -- plus a round-trip
# against the real policy.yml so a future retune of its numbers stays
# exercised.
echo
run_step node scripts/test-dispatch-generative-push.mjs
# The prebuild chain must pass in a checkout shaped like Vercel's production
# clone: one branch, no remote refs. CI clones the full history, so a prebuild
# check that shells out to git for origin/main passes here while Vercel's
# checkout kills the whole build -- which froze the site twice on 15 August,
# both times with CI green. The script builds the shaped checkout, runs
# prebuild in it, and then deletes the origin/main fallback on purpose to
# prove the guard can go red. See scripts/check-prebuild-single-branch.sh.
echo
run_step bash scripts/check-prebuild-single-branch.sh
# Every published HTML route must carry the AI authorship disclosure, visibly
# and machine-readably. A page without one is a page claiming nothing about
# who wrote it -- the exact silence Article 50(4) of the EU AI Act addresses.
# This check walks the rendered routes and asserts the disclosure marker;
# scripts/check-ai-disclosure.mjs separately verifies the producing-round map
# against the build log and git history.
echo
  for route in / /blog /blog/frontier-cyber /directory /demos /log /log/early /log/archive /projects /disclosure /charter /what-vendors-promise /model-retirement-calendar /model-deprecation-checker /model-migration-chains /promise-vs-practice /loop-history; do
  body=$(curl -s "$BASE$route")
  case "$body" in
    *'data-ai-disclosure'*) echo "ok    $route carries the AI disclosure" ;;
    *) echo "FAIL  $route renders no AI disclosure"; failures=$((failures + 1)) ;;
  esac
done
run_step node scripts/check-ai-disclosure.mjs
# WCAG SC 1.4.10 (Reflow): no route may need horizontal scrolling of the
# page itself at a 320px viewport. Walks the same route list as the AI
# disclosure loop above.
#
# This exists because a check the design rubric proposed for exactly this --
# `document.documentElement.scrollWidth <= window.innerWidth + 1` -- would
# have shipped green on the two routes that were failing it:
# `window.innerWidth` expands to match overflowing content under mobile
# emulation, so it never disagrees with `scrollWidth`. Measured on
# /model-retirement-calendar before this round's fix: clientWidth 320,
# scrollWidth 543, innerWidth 543 -- `543 <= 543 + 1` passes while the page
# overflows by 223px. scripts/check-reflow.mjs uses
# `documentElement.clientWidth` instead, which stayed pinned to 320
# regardless of the mobile-emulation flag in every measurement this round
# took. See that script's own header for why it speaks WebSocket by hand
# rather than importing a browser-automation package (Node's global
# `WebSocket` does not exist before v21, and this workflow's Node is pinned
# to 20) and for KNOWN_FAILURES, a route that is measured and printed every
# run but does not fail the build because it is a real, separately filed
# defect this check found rather than one it exists to fix.
echo
run_step node scripts/check-reflow.mjs "$BASE"
# First-screenful content density (docket/open/2026-08-22-first-screenful-density.md,
# closed by round loop/build/first-screenful-density): how many <tr>/<li>
# content units intersect the first 800px of a 1280-wide viewport, on a real
# CDP render -- not a computation from CSS, the specific trap the docket item
# names as the reason a previous design rubric got two numbers wrong. Only
# /model-retirement-calendar carries a blocking minimum (this round moved its
# intro prose below both tables so >=1 row is visible instead of 0 of 87);
# the other six routes it measured are printed every run but not asserted
# against a floor, because four of them (/, /blog, /blog/*, /charter) were a
# deliberate editorial decision to leave as prose-first pages, not a defect
# pending a fix -- see scripts/check-first-screenful.mjs's own header and
# this round's CHANGELOG.md entry for why.
echo
run_step node scripts/check-first-screenful.mjs "$BASE"
# SC 1.4.1 (Use of Color) and SC 1.4.11 (Non-text Contrast) on the nav's
# current-page indicator (docket/open/2026-08-22-nav-active-colour-only-indicator.md,
# closed by round loop/build/nav-cue-and-line-length): `.nav-active` used to
# mark the current page by colour alone at a measured 2.20:1 contrast,
# distinguished from the other eight links by nothing but hue. Real CDP
# render, not a computed style diff -- see scripts/check-nav-active-cue.mjs's
# own header for exactly what is and is not asserted, including why it does
# not require the active/inactive text colours themselves to be 3:1 apart.
echo
run_step node scripts/check-nav-active-cue.mjs "$BASE"
# `article p` line length (docket/open/2026-08-22-article-p-line-length.md,
# closed by round loop/build/nav-cue-and-line-length): ran 100-103 characters
# per full rendered line at the median, up to 122 at the max, across five
# long-form pages -- measured character-by-character on a real render, the
# same method this check repeats, because the item was filed specifically
# after a design rubric got two numbers wrong by computing them from `ch`
# units instead. `article p` is now capped at `80ch`; this guards the cap
# against being silently loosened or removed. See
# scripts/check-article-line-length.mjs's own header for the ceiling's
# derivation.
echo
run_step node scripts/check-article-line-length.mjs "$BASE"
# KNOWN_FAILURES's own regression test. Adversarial review demonstrated
# live that the first version keyed an exemption on the route name alone,
# so an injected, unrelated +580px overflow on /log -- a route already
# excused for a documented ~180px bug -- printed KNOWN instead of FAIL. The
# fix pins each entry to the offending content, not the route; this test
# exercises that pinning directly with synthetic inputs modelled on the
# review's own demonstration, so the defect cannot come back silently. See
# scripts/test-check-reflow-known-failures.mjs and the KNOWN_FAILURES
# comment in scripts/check-reflow.mjs for the full account.
echo
run_step node scripts/test-check-reflow-known-failures.mjs
# The four Origin values' published definitions each appear on several
# surfaces -- the /log badge tooltips, the per-page disclosure sentences,
# the /disclosure enumeration, the homepage prose, the changelog preamble
# and the parser's own comment. Round 111 corrected the `delegated` wording
# after three of its six copies drifted apart; this asserts the
# distinguishing content of every Origin on every surface that defines it,
# so a third drift fails the build. See scripts/check-origin-definitions.mjs.
echo
run_step node scripts/check-origin-definitions.mjs
# How a round was DISPATCHED and WHAT RAN IT, checked against policy.yml and
# scripts/runners.yml. Round 185 exists because scripts/round.mjs:327 is the
# only caller of scripts/dispatch.mjs in this repository, so a round briefed
# by hand never consults the dispatcher at all -- which is how every round
# from 2026-08-18 on was run, and how the two heaviest tracks in policy.yml
# (scout 30, maintain 25) came to ship zero rounds out of twenty while the
# lightest (meta 5) shipped nine. A guardrail enforced at launch is
# advisory; only a merge-time check binds, and the check for "did this round
# come through the launcher" cannot live in the launcher. It runs here
# because build-and-audit is a required status check -- with the standing
# caveat that `enforce_admins` is false on `main`
# (docket/open/2026-08-11-branch-protection-does-not-require-review.md), so
# this makes a forced or starved round visible and deliberate rather than
# impossible.
echo
run_step node scripts/check-changelog-provenance.mjs
# ...and the proof that the check above can go red, on 12 planted defects
# across two kinds of sandbox. The composition half needs a GENERATED record:
# its assertion arms only once the whole window sits at or above the round
# that introduced the Dispatch field, and the real changelog's newest round
# is that round -- so the armed path is unreachable by editing the real file
# and would otherwise ship never having been seen either red or green.
echo
run_step node scripts/test-changelog-provenance.mjs
# FRAME.md's own claims about who controls what -- the identities, the
# HOLD.md self-halt, the .github/ push rejection, the required-checks list,
# and the rest -- checked against the current tree and (where reachable)
# live GitHub state, not trusted because a prior round wrote them down.
# scripts/check-frame.mjs exits non-zero only on a real divergence; a check
# that could not run (no network, no `gh`) is reported UNVERIFIED and does
# not fail this build on its own. See FRAME.md and that script's own header
# for why: round 8 (loop/meta/frame) exists because three false claims about
# this exact territory reached the maintainer only by accident.
echo
run_step node scripts/check-frame.mjs
# Briefs committed under docket/briefs/ -- the instructions the orchestrator
# wrote before each round ran. Round 9 (loop/meta/briefs-and-premises) exists
# because three false premises reached this project through briefs on 22
# August 2026, and nothing validated a brief before it was built on: not
# review (review checks work against a brief, and the brief carried the
# error), not a check (none existed), not the maintainer (briefs lived only
# in a temporary scratchpad directory nobody reads). This checks that every
# current brief (docket/briefs/legacy/ is archive and exempt, see its own
# README) declares each factual premise's source -- a FRAME.md fact, a
# command, or a maintainer attestation -- and that a declared FRAME.md
# citation still resolves. It runs after a brief is already committed and
# cannot gate one in advance; see scripts/check-briefs.mjs's own header for
# exactly what it does and does not verify.
echo
run_step node scripts/check-briefs.mjs
# The site's hand-written claims about its own governance, pinned to the
# facts in the tree that make them true. Round 176 exists because six of
# them were false at once: three went false on 2026-08-22 when CHARTER.md
# rule 13 withdrew the loop's merge prohibition and the human-owned-paths
# job was narrowed underneath the sentences describing it, one was the
# project's own origin story in three files, one was a metadata constant
# search engines were being shown, and one was a privacy promise the next
# deploy's analytics would have falsified.
#
# /charter and /log cannot drift -- they are parsed from CHARTER.md and
# CHANGELOG.md. Every one of the six lived in the places that are not
# generated. This registry is the substitute for generation where prose
# genuinely has to be prose: it fails when a registered claim's supporting
# fact moves, when a registered claim is silently reworded, when a phrase
# with a history of being wrong here turns up somewhere new, or when a
# tracked analytics event exists that /disclosure does not name.
#
# READ ITS OWN HONEST-LIMIT LINE. Its reach is its registry and its phrase
# list and nothing wider; a false governance claim in unfamiliar words on
# an unregistered page passes it silently, and that is most of them.
#
# --rendered adds the other direction: /blog must actually serve the paths
# the gate guards, and /disclosure must serve exactly one of its two
# analytics branches. A page can derive a list correctly and then fail to
# render it, which no amount of reading source files would show.
echo
run_step node scripts/check-governance-claims.mjs --rendered "$BASE"
# ...and the proof that the check above can go red, against six planted
# defects in a sandbox copy of this tree. A registry check is unusually
# easy to ship broken -- a needle that matches nothing and a predicate that
# is accidentally true both look exactly like a pass.
echo
run_step node scripts/test-governance-claims.mjs
# Document transfer size, against the same budget CI gates on.
#
# lighthouserc.json holds `resource-summary:document:size` at 150,000 bytes,
# and until now only the Lighthouse action in .github/workflows/pr-checks.yml
# ever asserted it. So a round could pass every local check, ship, and be told
# by CI that the page it had just grown was over budget -- which is exactly
# what happened to PR #18, on a page no single round had made heavy. The
# measurement was never hard; it simply was not wired into the gate the round
# runs. See docket/open/2026-08-11-local-check-must-match-ci-gate.md.
#
# The threshold is READ from lighthouserc.json, never restated. CHARTER.md
# rule 11 forbids a run blocked by a guardrail from loosening it, and a second
# copy of the number is precisely how a blocked round would loosen this one
# while appearing to obey it.
#
# The local ceiling is deliberately *tighter* than CI's by MARGIN bytes.
# Measured on the same commit, curl reported 153,532 where CI's median of 3
# reported 154,019 -- so a local check that failed at exactly the budget would
# still let through a page CI then rejects, which is the whole failure this
# check exists to stop. Tightening is always allowed; loosening never is.
echo
budget=$(node -e 'const rc=require("./lighthouserc.json");const a=rc.ci.assert.assertions["resource-summary:document:size"];const v=a&&a[1]&&a[1].maxNumericValue;process.stdout.write(Number.isFinite(v)?String(v):"")')
if [ -z "$budget" ]; then
  echo "FAIL  lighthouserc.json has no resource-summary:document:size budget to read"
  failures=$((failures + 1))
else
  MARGIN=3000
  ceiling=$((budget - MARGIN))
  echo "      document budget $budget bytes; local ceiling $ceiling (margin $MARGIN)"
for route in / /blog /blog/frontier-cyber /directory /demos /log /log/early /log/archive /projects /disclosure /charter /what-vendors-promise /model-retirement-calendar /model-deprecation-checker /model-migration-chains /promise-vs-practice /loop-history; do
    bytes=$(curl -s -H 'Accept-Encoding: gzip' -o /dev/null -w '%{size_download}' "$BASE$route")
    if [ "$bytes" -gt "$ceiling" ]; then
      echo "FAIL  $route is $bytes bytes gzipped, over the local ceiling of $ceiling"
      failures=$((failures + 1))
    else
      echo "ok    $route  $bytes bytes gzipped ($((ceiling - bytes)) to spare)"
    fi
  done
fi

# The blog's "one limit" count — pull requests that merged over a failing
# human-owned-paths check — is rendered from the checked-in sweep output
# scripts/one-limit-count-sweep.json, not typed into the prose. It has
# drifted three times as prose (two -> five -> seven -> eight), so the
# rendered page is asserted against the file: the count word and every
# member of the failing set must appear in the HTML the visitor gets.
# scripts/check-one-limit-count.mjs also validates the file's internal
# shape at build time (prebuild); this half checks the rendered direction.
echo
run_step node scripts/check-one-limit-count.mjs --rendered "$BASE/blog"
# /charter is generated by parsing CHARTER.md at build time. If the parser
# silently drops a rule — a heading shape it stops understanding, a rule that
# stops matching its regex — the page still renders, it just publishes a
# shorter charter. Assert the rule count so that failure is loud.
#
# Counted from the file over the rule sections only (I–V): the two tests under
# "The direction" are numbered in the source but are not charter rules, and
# the count has to match what the page calls a rule. The rendered side counts
# the page's `data-rule` markers, deduplicated because the RSC payload repeats
# rendered markup.
echo
file_rules=$(sed -n '/^## I\. Truth/,/^## Amendment/p' CHARTER.md | grep -c '^[0-9][0-9]*\. ')
rendered_rules=$(curl -s "$BASE/charter" | grep -o 'data-rule="[0-9]*"' | sort -u | wc -l | tr -d ' ')
# Zero must fail in its own right. This check keys on the literal headings
# `## I. Truth` / `## Amendment` while the parser keys on `/^[IVX]+\.\s/`,
# so the two disagree in most drift cases and the count mismatch fires — but
# if the roman-numeral headings stopped matching on BOTH sides at once, 0 = 0
# would pass and the page would silently publish no rules at all. A check that
# cannot tell "correct" from "measured nothing" is the same shape as the ones
# this repository has already had to fix; this is the fourth. The comparison
# on the rendered count alone catches it: the both-zero case necessarily has
# rendered = 0.
if [ "$rendered_rules" -eq 0 ] || [ "$file_rules" -eq 0 ]; then
  echo "FAIL  rule count came back 0 (file $file_rules, rendered $rendered_rules) — nothing matched, which must not pass"
  failures=$((failures + 1))
elif [ "$rendered_rules" != "$file_rules" ]; then
  echo "FAIL  /charter renders $rendered_rules rules, CHARTER.md has $file_rules"
  failures=$((failures + 1))
else
  echo "ok    /charter renders all $rendered_rules rules from CHARTER.md"
fi

# /log is generated by parsing CHANGELOG.md at build time. If a future
# entry is written in a shape the parser doesn't understand, the page
# still renders -- it just quietly loses rounds. Assert the round count
# so that failure is loud. Bump this when rounds are added.
echo
# Derive the expected count from the changelog itself rather than
# hardcoding a number that needs bumping every round -- a stale constant
# here would be the same "goes out of date" failure the log page exists
# to avoid.
#
# Counted by subtracting the template placeholder heading rather than by
# deleting the HTML comment block with a sed range: an entry that merely
# *mentions* "<!--" in its prose opens that range early and swallows the
# rest of the file. Which is exactly what happened -- this round's own
# entry quotes some rendered markup, and the first version of this check
# reported 1 round instead of 31.
all_headings=$(grep -c '^### ' CHANGELOG.md)
template_headings=$(grep -c '^### YYYY-MM-DD' CHANGELOG.md)
expected=$((all_headings - template_headings))
# The record now spans three pages, so "renders the right number of anchors"
# is no longer the assertion that protects it: a round could vanish between
# pages, or be rendered in full on two of them, and the total would still add
# up. scripts/check-log-pages.mjs asserts the partition instead -- each page
# renders in full exactly the rounds the parser assigns it, the pages together
# account for every round exactly once, and every moved round keeps a stub on
# /log so its anchor still resolves. The parser's own total is checked against
# this heading count, so a parser that stops understanding a heading shape
# fails against the file rather than against itself.
echo
run_step node scripts/check-log-pages.mjs
# RSS should carry one compact build-log item per parsed round. The guid
# prefix is deliberately distinct from the blog's permalink guid, so this
# remains true if the blog gains more posts later.
feed_rounds=$(curl -s "$BASE/feed.xml" | grep -c '<guid isPermaLink="false">addictedtoai:round:')
if [ "$feed_rounds" = "$expected" ]; then
  echo "ok    /feed.xml contains all $feed_rounds build-log rounds"
else
  echo "FAIL  /feed.xml contains $feed_rounds build-log rounds, CHANGELOG.md has $expected"
  failures=$((failures + 1))
fi

# Feed descriptions are consumed outside the site, so the changelog's
# presentation syntax must not leak into them as literal Markdown markers.
# This keeps the feed summary readable without making RSS readers understand
# the site's private inline-markdown subset.
echo
BASE_URL="$BASE" node <<'NODE'
const base = process.env.BASE_URL;
(async () => {
  const feed = await fetch(`${base}/feed.xml`).then((response) => response.text());
  const descriptions = [
    ...feed.matchAll(/<description>([^<]*)<\/description>/g),
  ].map(([, description]) => description);
  const bad = descriptions.filter(
    (description) => description.includes("`") || description.includes("**")
  );
  if (bad.length === 0) {
    console.log(`ok    RSS descriptions contain no raw Markdown markers (${descriptions.length} checked)`);
  } else {
    console.log(`FAIL  RSS contains ${bad.length} description(s) with raw Markdown markers`);
    process.exitCode = 1;
  }
})();
NODE
record_step $? "RSS descriptions carry no raw Markdown markers (inline node)"

# Dated rounds expose their date as machine-readable HTML, while the current
# Unreleased round intentionally remains text until it receives a date.
dated_rounds=$(grep -c '^### 20[0-9][0-9]-[0-9][0-9]-[0-9][0-9]$' CHANGELOG.md)
log_dates=$(curl -s "$BASE/log" | grep -o '<time[^>]*dateTime="20[0-9-]*"' | wc -l | tr -d ' ')
if [ "$log_dates" = "$dated_rounds" ]; then
  echo "ok    /log exposes all $log_dates dated rounds as <time>"
else
  echo "FAIL  /log exposes $log_dates dated rounds as <time>, CHANGELOG.md has $dated_rounds"
  failures=$((failures + 1))
fi

# Counting feed items is not enough: a feed can contain the right number of
# links while every anchor points at the wrong round. Resolve each round link
# against the rendered Log ids so a citation in an RSS reader cannot silently
# drift.
echo
BASE_URL="$BASE" node <<'NODE'
const base = process.env.BASE_URL;
(async () => {
  const [feed, log] = await Promise.all([
    fetch(`${base}/feed.xml`).then((response) => response.text()),
    fetch(`${base}/log`).then((response) => response.text()),
  ]);
  const ids = new Set(
    [...log.matchAll(/id="(round-[^"]+)"/g)].map(([, id]) => id)
  );
  const anchors = [
    ...feed.matchAll(/<link>[^<]*#(round-[^<]+)<\/link>/g),
  ].map(([, anchor]) => anchor);
  let bad = 0;
  for (const anchor of anchors) {
    if (ids.has(anchor)) {
      console.log(`ok    feed link anchor #${anchor} resolves in /log`);
    } else {
      console.log(`FAIL  feed link anchor #${anchor} is missing from /log`);
      bad++;
    }
  }
  if (anchors.length === 0) {
    console.log("FAIL  feed contains no round link anchors");
    bad++;
  }
  process.exitCode = bad ? 1 : 0;
})();
NODE
record_step $? "feed link anchors resolve in /log (inline node)"

# Every figure the homepage advertises is a link, and the number has to
# match the page that link opens.
#
# The previous version of this check summed BOTH log pages and compared the
# total to the homepage. That is the arithmetic the site can defend and not
# the number a reader sees: after round 70 split the record, the homepage
# said "28 rounds say wrong", the link opened /log, and /log reported 15.
# The check passed the whole time, because it was asserting the figure
# against the record rather than against the destination. A green check that
# measures something other than what a visitor experiences is this project's
# oldest recurring bug, and this is one more instance of it.
#
# So: read every `<a href="/log...?q=TERM">N ...</a>` on the homepage, fetch
# the page that href names, and recount there. Re-pointing a link without
# re-scoping its number now fails.
#
# Only the rendered list on each page -- everything after </ol> includes the
# RSC payload, which repeats every entry and would match every term. The
# archived stubs on /log are `<li class="log-stub"`, so they are not picked
# up: they carry no prose, and counting them would credit a round with a
# mention that is not on the page. Text inside `.visually-hidden` is dropped
# because LogFilter.js drops it too, and the count has to be the search's.
echo
if node -e '
const [home, base] = process.argv.slice(1);
const fetchText = async (url) => (await fetch(url)).text();

function entriesOf(html) {
  const start = html.search(/<ol\b[^>]*class="log-list"/);
  if (start === -1) return null;
  const list = html.slice(start, html.indexOf("</ol>", start));
  return list
    .split(`<li class="log-entry"`)
    .slice(1)
    .map((e) =>
      e
        .replace(/<span class="visually-hidden">[\s\S]*?<\/span>/g, " ")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<[^>]*>/g, " ")
        .toLowerCase()
    );
}

(async () => {
  const homeHtml = await fetchText(home);
  const pages = new Map();
  const load = async (path) => {
    if (!pages.has(path)) pages.set(path, entriesOf(await fetchText(base + path)));
    return pages.get(path);
  };

  let bad = 0;

  // Anchor text, not a fixed <strong> shape: the homepage states one figure
  // as "<strong>15</strong> rounds say ..." and another as "13 for ...", and
  // an assertion that only understood one of them would silently stop
  // covering the other.
  const links = [
    ...homeHtml.matchAll(/<a[^>]*href="(\/log(?:\/early|\/archive)?)\?q=([a-z]+)"[^>]*>([\s\S]*?)<\/a>/g),
  ];
  if (links.length === 0) {
    console.log("FAIL  homepage advertises no round-mention counts");
    process.exitCode = 1;
    return;
  }

  for (const [, path, term, inner] of links) {
    const text = inner.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]*>/g, " ");
    const claimed = (text.match(/\d+/) || [])[0];
    if (claimed === undefined) {
      console.log(`FAIL  homepage link to ${path}?q=${term} advertises no number`);
      bad++;
      continue;
    }
    const entries = await load(path);
    if (entries === null) {
      console.log(`FAIL  ${path} renders no <ol class="log-list">`);
      bad++;
      continue;
    }
    const actual = entries.filter((e) => e.includes(term)).length;
    if (Number(claimed) !== actual) {
      console.log(
        `FAIL  homepage advertises ${claimed} for "${term}" and links to ${path}, which has ${actual}`
      );
      bad++;
      continue;
    }
    // A count equal to every round on the page is not a signal, it is the
    // page size wearing a number. The homepage explains at length why it
    // deleted a "guardrail failures: 0" counter for being arithmetic that
    // looked like evidence; printing "N rounds say X" where N is every
    // round would be the same thing in the same panel.
    if (actual === entries.length) {
      console.log(
        `FAIL  homepage advertises "${term}", which matches all ${actual} rounds on ${path} — that is the page size, not a finding`
      );
      bad++;
      continue;
    }
    console.log(`ok    homepage advertises ${claimed} for "${term}"; ${path} has ${actual} of ${entries.length}`);
  }

  // The search presets are the same promise in a different control: a
  // shortcut that returns everything has filtered nothing. "measured" was
  // one -- it matched 73 of 73 rounds, because the entry format ends in a
  // Result line and almost all of them say "not measured" -- and round 74
  // withdrew it.
  for (const path of ["/log", "/log/early", "/log/archive"]) {
    const html = await fetchText(base + path);
    const entries = await load(path);
    const presets = [
      ...html.matchAll(/<button[^>]*class="log-preset"[^>]*>([a-z]+)<\/button>/g),
    ].map(([, term]) => term);
    if (presets.length === 0) {
      console.log(`FAIL  ${path} renders no search presets`);
      bad++;
      continue;
    }
    for (const term of presets) {
      const actual = entries.filter((e) => e.includes(term)).length;
      if (actual === entries.length) {
        console.log(
          `FAIL  ${path} offers the preset "${term}", which matches all ${actual} rounds — it filters nothing`
        );
        bad++;
      } else {
        console.log(`ok    ${path} preset "${term}" narrows ${entries.length} rounds to ${actual}`);
      }
    }
  }

  // Setting exitCode rather than calling process.exit(): exiting from
  // inside this async callback while fetch sockets are still open trips
  // a libuv assertion on Windows and reports a false failure.
  process.exitCode = bad ? 1 : 0;
})();
' "$BASE/" "$BASE"; then
  :
else
  failures=$((failures + 1))
fi

# Every route in the sitemap must actually resolve. This is the check
# that would have caught a sitemap listing a page that no longer exists.
echo
for loc in $(curl -s "$BASE/sitemap.xml" | grep -o '<loc>[^<]*</loc>' | sed 's|</\?loc>||g'); do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$loc")
  if [ "$code" = "200" ]; then
    echo "ok    sitemap entry $loc ($code)"
  else
    echo "FAIL  sitemap entry $loc -> $code"
    failures=$((failures + 1))
  fi
done

# The homepage, Blog, Demos, and Log all expose changelog-derived content.
# Their sitemap lastmod and the RSS channel's lastBuildDate should therefore
# agree with the newest dated changelog entry, not with the deploy clock.
echo
latest_date=$(grep '^### 20[0-9][0-9]-[0-9][0-9]-[0-9][0-9]$' CHANGELOG.md | head -1 | sed 's/^### //')
expected_freshness=$(node -e 'process.stdout.write(new Date(process.argv[1]).toISOString())' "$latest_date")
sitemap_body=$(curl -s "$BASE/sitemap.xml")
SITEMAP="$sitemap_body" BASE_URL="$BASE" EXPECTED="$expected_freshness" node <<'NODE'
const sitemap = process.env.SITEMAP;
const base = process.env.BASE_URL;
const expected = process.env.EXPECTED;
const paths = [base, `${base}/blog`, `${base}/demos`, `${base}/log`];
let failures = 0;
for (const path of paths) {
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = sitemap.match(
    new RegExp(`<url>\\s*<loc>${escaped}</loc>\\s*<lastmod>([^<]+)</lastmod>`)
  );
  if (match?.[1] === expected) {
    console.log(`ok    sitemap freshness ${path} (${expected})`);
  } else {
    console.log(`FAIL  sitemap freshness ${path} -> ${match?.[1] || "missing"} (want ${expected})`);
    failures++;
  }
}
process.exitCode = failures ? 1 : 0;
NODE
record_step $? "sitemap lastmod freshness (inline node)"

feed_last_build=$(curl -s "$BASE/feed.xml" | grep -o '<lastBuildDate>[^<]*</lastBuildDate>' | head -1)
if [ "$feed_last_build" = "<lastBuildDate>$(node -e 'process.stdout.write(new Date(process.argv[1]).toUTCString())' "$latest_date")</lastBuildDate>" ]; then
  echo "ok    feed freshness $feed_last_build"
else
  echo "FAIL  feed freshness $feed_last_build"
  failures=$((failures + 1))
fi

# Round badges link to the change itself. Rounds carried over from the
# private predecessor repository link to a commit rather than a pull
# request: their PR numbers now belong to *this* repository, so
# `/pull/22` would resolve to an unrelated future pull request. That is a
# citation that is wrong rather than merely dead, which is worse, and no
# HTTP check would ever catch it -- the link returns 200 either way.
#
# So resolve each rendered SHA against this repository's own history.
# Stricter than a request, and immune to GitHub rate-limiting CI.
echo
if curl -s "$BASE/log" | grep -q '<a class="log-pr"'; then
  BASE_URL="$BASE" python <<'PY'
import json, os, re, subprocess, sys
from urllib.request import urlopen

html = urlopen(os.environ["BASE_URL"] + "/log").read().decode("utf-8", "replace")
archive = {
    p["number"]
    for p in json.load(open("archive/prs.json", encoding="utf-8"))
    if p.get("commit_sha")
}
cited = {int(n) for n in re.findall(r"\(PR #(\d+)\)", open("CHANGELOG.md", encoding="utf-8").read())}
failures = 0

# Read the badge links, not the page text. The first version of this check
# scanned the whole document and failed on round 30, whose write-up quotes
# the string "/pull/1" while explaining that the URL 404s -- prose, inside a
# <code> element, not a link. The record discusses URLs, so any assertion
# about this page's links has to look at hrefs specifically.
hrefs = {
    m.group(1)
    for tag in re.findall(r'<a[^>]*class="log-pr"[^>]*>', html)
    for m in [re.search(r'href="([^"]*)"', tag)]
    if m
}

# 1. Every archived round the changelog cites renders a commit link.
rendered = {m.group(1) for h in hrefs for m in [re.search(r"/commit/([0-9a-f]{40})$", h)] if m}
expected = cited & archive
if len(rendered) == len(expected):
    print(f"ok    /log renders {len(rendered)} archived-round commit links")
else:
    print(f"FAIL  /log renders {len(rendered)} archived-round commit links, expected {len(expected)}")
    failures += 1

# 2. Each one resolves to a commit we actually have.
unresolved = [
    sha for sha in sorted(rendered)
    if subprocess.run(["git", "cat-file", "-e", sha + "^{commit}"],
                      capture_output=True).returncode != 0
]
if not unresolved:
    print(f"ok    all {len(rendered)} commit links resolve in this repository")
else:
    for sha in unresolved:
        print(f"FAIL  commit link {sha} does not resolve in this repository")
    failures += len(unresolved)

# 3. Each round links to the kind of target its era actually has.
#
# The first version of this only checked one direction -- that an archived
# round does not link to a pull request. The other direction is the one that
# bit: this repository restarted PR numbering at 1, so a new round's #1..#48
# collide with the archive, and looking the number up would send them to an
# unrelated predecessor commit. Both URLs return 200, so nothing else here
# would ever have noticed. The very first round shipped as #1.
eras = re.findall(
    r'<li[^>]*class="log-entry"[^>]*data-era="(archive|current)"[^>]*>(.*?)</li>',
    html,
    re.S,
)
if not eras:
    print("FAIL  /log exposes no data-era on its rounds; era cannot be checked")
    failures += 1
for era, body in eras:
    for tag in re.findall(r'<a[^>]*class="log-pr"[^>]*>', body):
        href = re.search(r'href="([^"]*)"', tag)
        if not href:
            continue
        target = href.group(1)
        if era == "archive" and "/commit/" not in target:
            print(f"FAIL  archived round links to {target}, expected a commit")
            failures += 1
        if era == "current" and "/pull/" not in target:
            print(f"FAIL  current round links to {target}, expected a pull request")
            failures += 1
if failures == 0:
    print(f"ok    all {len(eras)} rounds link to the target their era has")

# There was a "belt and braces" check here that flagged any `/pull/N` link
# whose N appeared in the archive. It predated the era distinction, and once
# rounds could legitimately cite this repository's own #1..#48 it started
# failing on correct output: it collected hrefs from the whole page, so it
# could not tell which round a link came from, only that the number also
# existed in the archive. It blocked the first real round for citing its own
# pull request.
#
# Removed rather than repaired. The per-round check above already asserts both
# directions using data-era, which is the information this one was missing; a
# second check over strictly less context could only ever disagree with it, and
# a check that fires on a correct state costs more than the one it duplicates.

sys.exit(1 if failures else 0)
PY
  record_step $? "round badge links and eras on /log (inline python)"
else
  echo "skip  round badges render unlinked (NEXT_PUBLIC_REPO_URL unset)"
  echo "      every badge assertion above is skipped, not satisfied — a local"
  echo "      build without that variable verifies nothing about round links"
  skipped=$((skipped + 1))
fi

# Rounds 1-47 predate the Origin field and are treated as supervised. That
# default is only safe while it means "legacy" -- the moment a new round can
# omit Origin and silently inherit it, the site starts publishing a claim
# about human involvement that nobody wrote. Rounds without one are a fixed
# historical set, so pin the count. A new entry that forgets fails here.
echo
LEGACY_ROUNDS_WITHOUT_ORIGIN=47
all_rounds=$(( $(grep -c '^### ' CHANGELOG.md) - $(grep -c '^### YYYY-MM-DD' CHANGELOG.md) ))
declared=$(grep -c '^- Origin:' CHANGELOG.md)
undeclared=$(( all_rounds - declared ))
if [ "$undeclared" = "$LEGACY_ROUNDS_WITHOUT_ORIGIN" ]; then
  echo "ok    $undeclared rounds predate the Origin field, as expected"
else
  echo "FAIL  $undeclared rounds have no Origin, expected exactly $LEGACY_ROUNDS_WITHOUT_ORIGIN"
  echo "      (a new round must declare '- Origin: unsupervised|supervised|maintainer|delegated')"
  failures=$((failures + 1))
fi

# And the badge has to reach the page. getBuildLog folds origin into the text
# the /log search matches on, so an origin that is counted at build time but
# never rendered would make the homepage's figures and the search box's
# figures disagree -- the exact class of split this file already guards
# elsewhere.
rendered_origins=$(curl -s "$BASE/log" | grep -o 'class="log-origin log-origin-[a-z]*"' | wc -l | tr -d ' ')
if [ "$rendered_origins" = "$all_rounds" ]; then
  echo "ok    /log renders an origin badge on all $rendered_origins rounds"
else
  echo "FAIL  /log renders $rendered_origins origin badges, expected $all_rounds"
  failures=$((failures + 1))
fi

rm -f "$step_log"

echo
if [ "$failures" -gt 0 ]; then
  # One per failure. This number was a sum of exit codes until 2026-08-23, so
  # it could read 127 for a single missing command.
  echo "$failures check(s) failed"
  if [ -n "$failed_steps" ]; then
    echo "sub-checks that failed:"
    echo "$failed_steps"
  fi
  echo "(every failure above is a line beginning FAIL; assertions made inline in this"
  echo " script report there rather than in the list)"
  exit 1
fi
if [ -n "$unverified_steps" ]; then
  echo "sub-check(s) reported UNVERIFIED — they ran but could not evaluate their claim,"
  echo "which is not a pass:"
  echo "$unverified_steps"
fi
if [ "$skipped" -gt 0 ]; then
  echo "all route checks passed, but $skipped group(s) were SKIPPED — see above"
  echo "(set NEXT_PUBLIC_REPO_URL to exercise them; CI always does)"
elif [ -n "$unverified_steps" ]; then
  echo "every route check that could be evaluated passed; the UNVERIFIED one(s) above did not"
else
  echo "all route checks passed"
fi
