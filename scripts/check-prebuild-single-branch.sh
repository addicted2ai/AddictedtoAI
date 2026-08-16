#!/usr/bin/env bash
# Run the prebuild chain in a checkout shaped like Vercel's production clone:
# one branch, no remote refs, full history. Run from anywhere; the repository
# root is derived from this script's own location:
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
# This script is the shape difference made visible in CI. It builds a fresh
# repository containing the full history of the commit under test and nothing
# else -- no remotes, so no refs/remotes/* at all -- installs the dependencies
# there, and runs `npm run prebuild`. A check that needs origin/main dies in
# that checkout exactly as it dies on Vercel, and CI goes red on the pull
# request instead of finding out at the deploy.
#
# It then proves the guard in both directions, on every run:
#
#   green  - the prebuild chain passes in the shaped checkout, with the two
#            guards printing their degradation warnings
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

# --- Build the Vercel shape: a fresh repo, full history, no remote refs. ---
dest=$(mktemp -d "${TMPDIR:-/tmp}/prebuild-single-branch.XXXXXX") || exit 1
git -C "$dest" init -q || exit 1
git -C "$dest" fetch -q "$ROOT" HEAD || exit 1
git -C "$dest" checkout -q FETCH_HEAD || exit 1

# The shape must hold before it is tested: if the test checkout somehow has
# origin/main, every run below is vacuous and the check is lying.
if git -C "$dest" rev-parse --verify --quiet "origin/main^{commit}" >/dev/null 2>&1; then
  echo "FAIL  the single-branch test checkout still has origin/main — the shape did not hold"
  exit 1
fi

# --- The green direction: prebuild must pass where Vercel builds. ----------
if ! npm --prefix "$dest" ci --no-audit --no-fund >/dev/null 2>&1; then
  echo "FAIL  npm ci failed in the single-branch checkout — the shape cannot be tested"
  exit 1
fi

green=$(mktemp "${TMPDIR:-/tmp}/prebuild-green.XXXXXX") || exit 1
if npm --prefix "$dest" run prebuild >"$green" 2>&1; then
  # The only interesting part of a passing run is the degradation warnings:
  # they are the guards saying "no origin/main here, degrading as designed".
  grep -E "^WARN|^FAIL" "$green" | sort -u | sed 's/^/      /' || true
  echo "ok    prebuild passes in a single-branch checkout with no remote refs (head ${sha:0:7})"
else
  echo "FAIL  prebuild fails in a single-branch checkout with no remote refs"
  echo "      this is the exact checkout Vercel builds from. A prebuild check that"
  echo "      needs a remote ref or history depth passes in a full clone and freezes"
  echo "      production; the full output is:"
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
