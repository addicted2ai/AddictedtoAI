#!/usr/bin/env bash
# Run the prebuild chain in a checkout shaped like Vercel's production clone:
# one branch, no remote refs, and only the recent history the clone actually
# carries. Run from anywhere; the repository root is derived from this
# script's own location:
#
#   bash scripts/check-prebuild-single-branch.sh
#
# On 15 August 2026 the site stopped publishing twice in one day because a
# prebuild check read git history that Vercel's checkout does not have. CI
# clones the full history with origin/main present, so every check passed
# there; Vercel clones a single branch, so `git log origin/main` and
# `git show origin/main:...` threw `fatal: invalid object name 'origin/main'`
# and the whole prebuild died. Ten merged pull requests and then five more
# never reached a visitor, and nothing in the loop noticed, because the loop
# watches checks and the checks all passed.
#
# The two offending checks now have guarded fallbacks (PR #83 for
# scripts/check-publishing-quota.mjs, PR #90 for scripts/count-changelog-rounds.mjs),
# but the class is not fixed by fixing the two instances: any check reachable
# from prebuild that shells out to git for a remote ref, a base branch, or
# history depth will do it again, and a full clone will not catch it.
#
# Round 135 built this script and it still did not catch the third freeze
# (round 137, PR #96): its shaped checkout carried the *full* history, and
# Vercel's clone does not. The 0-count fallback in
# scripts/count-changelog-rounds.mjs worked in the full-history shape and
# returned 0 on Vercel, where the clone holds only the newest ~11 commits —
# by 04:18Z on 16 August the changelog record the snapshot is anchored to
# (taken_at 2026-08-15T18:46:41.179Z) had been pushed past that window by the
# merges in between, so the fallback counted "0 round entries" and froze the
# site a third time across `756a58a`, `19cb78d` and `993f006`.
#
# This script is the shape difference made visible in CI. It builds a fresh
# repository containing the history of the commit under test back to the
# snapshot's own taken_at and nothing earlier -- `--shallow-since` takes the
# boundary from the committed snapshot, so the shaped checkout can *never*
# see the changelog record the snapshot claims, whatever the snapshot's age
# -- and no remotes at all. It installs the dependencies there and runs
# `npm run prebuild`. A check that needs origin/main, or that returns 0 when
# the record predates the clone's depth, dies in that checkout exactly as it
# dies on Vercel, and CI goes red on the pull request instead of finding out
# at the deploy.
#
# It then proves the guard in both directions, on every run:
#
#   green  - the prebuild chain passes in the shaped checkout, with the
#            guards printing their degradation warnings; the snapshot check
#            must have verified rounds_merged (from git or the public GitHub
#            API) or degraded loudly — a check that silently skips is not a
#            check
#   red    - the origin/main fallback in count-changelog-rounds.mjs is deleted
#            on purpose and the same chain is re-run; it must fail with the
#            exact historical failure (`fatal: bad revision 'origin/main'`).
#            A guard that cannot go red is not a guard, so this step fails the
#            check when the fallback's shape stops matching or when prebuild
#            still passes without it.
#
# The commit under test is whatever the caller has checked out: in CI that is
# the pull request's merge commit (what would be deployed), locally it is the
# round's own branch. Both are the tree whose prebuild the deploy would run.
set -uo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
sha=$(git -C "$ROOT" rev-parse HEAD)

dest=""
green=""
red=""
trap 'rm -rf "$dest" "$green" "$red"' EXIT

# --- Build the Vercel shape: a fresh repo, shallow history, no remote refs. ---
dest=$(mktemp -d "${TMPDIR:-/tmp}/prebuild-single-branch.XXXXXX") || exit 1
takenAt=$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')).taken_at)" "$ROOT/app/lib/loop-history.json") || exit 1
git -C "$dest" init -q || exit 1
git -C "$dest" fetch -q --shallow-since="$takenAt" "$ROOT" HEAD || exit 1
git -C "$dest" checkout -q FETCH_HEAD || exit 1

# The shape must hold before it is tested: if the test checkout somehow has
# origin/main, or can still see the changelog record at taken_at, every run
# below is vacuous and the check is lying. The second is the half round 135's
# full-history shape missed — it is the exact precondition of the count-0
# freeze that round's green run did not exercise.
if git -C "$dest" rev-parse --verify --quiet "origin/main^{commit}" >/dev/null 2>&1; then
  echo "FAIL  the single-branch test checkout still has origin/main — the shape did not hold"
  exit 1
fi
if [ -n "$(git -C "$dest" log --before="$takenAt" --format=%H -1 -- CHANGELOG.md 2>/dev/null)" ]; then
  echo "FAIL  the single-branch test checkout can still see the changelog record at taken_at"
  echo "      ($takenAt) — the shape is not as shallow as Vercel's, and the count-0 fallback"
  echo "      cannot be exercised. The shape must hold before the shape is tested."
  exit 1
fi

# --- The green direction: prebuild must pass where Vercel builds. ----------
if ! npm --prefix "$dest" ci --no-audit --no-fund >/dev/null 2>&1; then
  echo "FAIL  npm ci failed in the single-branch checkout — the shape cannot be tested"
  exit 1
fi

green=$(mktemp "${TMPDIR:-/tmp}/prebuild-green.XXXXXX") || exit 1
if npm --prefix "$dest" run prebuild >"$green" 2>&1; then
  # The interesting parts of a passing run are the degradation warnings: the
  # guards saying "no origin/main here, no record at taken_at here, degrading
  # as designed".
  grep -E "^WARN|^FAIL" "$green" | sort -u | sed 's/^/      /' || true
  if ! grep -Eq "rounds_merged matches the changelog|rounds_merged not verified this build" "$green"; then
    echo "FAIL  prebuild passed in the shaped checkout but the snapshot check neither verified"
    echo "      rounds_merged nor degraded loudly — a check that silently skips is not a check"
    exit 1
  fi
  echo "ok    prebuild passes in a single-branch shallow checkout with no remote refs (head ${sha:0:7})"
else
  echo "FAIL  prebuild fails in a single-branch shallow checkout with no remote refs"
  echo "      this is the exact checkout Vercel builds from. A prebuild check that"
  echo "      needs a remote ref, or that depends on history depth, passes in a full"
  echo "      clone and freezes production; the full output is:"
  cat "$green"
  exit 1
fi

# --- The red direction: delete the fallback and watch the same chain die. ---
guard="$dest/scripts/count-changelog-rounds.mjs"
if [ "$(grep -c 'return "HEAD";' "$guard" 2>/dev/null)" -ne 1 ]; then
  echo "FAIL  scripts/count-changelog-rounds.mjs no longer has the fallback shape this"
  echo "      check must prove — the red direction cannot be tested, and a guard that"
  echo "      cannot go red is not a guard"
  exit 1
fi
# Make the fallback unreachable: always use origin/main, exactly what the
# unguarded version did when it froze the site on 15 August.
sed -i 's/return "HEAD";/return "origin\/main";/' "$guard"

red=$(mktemp "${TMPDIR:-/tmp}/prebuild-red.XXXXXX") || exit 1
if npm --prefix "$dest" run prebuild >"$red" 2>&1; then
  echo "FAIL  prebuild still passes after the origin/main fallback was deleted — the guard cannot go red"
  exit 1
fi
if grep -q "bad revision 'origin/main'" "$red"; then
  echo "ok    deleting the origin/main fallback makes the same prebuild fail — the guard is real, not assumed"
else
  echo "FAIL  prebuild failed in the single-branch checkout for an unexpected reason after"
  echo "      the fallback was deleted — the red direction did not reproduce the historical"
  echo "      failure. The output was:"
  tail -30 "$red" | sed 's/^/      /'
  exit 1
fi
