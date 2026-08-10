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

echo
if [ "$failures" -gt 0 ]; then
  echo "$failures check(s) failed"
  exit 1
fi
echo "all route checks passed"
