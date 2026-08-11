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
# The archive carries the other half of the record and the same search.
check /log/archive 200 "text/html" '<form class="log-filter" role="search" aria-label="Search the build log"'
check /log/archive 200 "text/html" 'id="build-log-results" aria-labelledby="build-log-results-label"'

# lychee follows redirects and reports 200, so a Directory link that now
# resolves somewhere else -- runwayml.com -> runway.com -- passes its check
# forever. The href in tool-categories.js is the recorded final URL; this
# resolves each one and fails on any mismatch.
echo
node scripts/check-tool-links.mjs || failures=$((failures + $?))

# Every published HTML route must carry the AI authorship disclosure, visibly
# and machine-readably. A page without one is a page claiming nothing about
# who wrote it -- the exact silence Article 50(4) of the EU AI Act addresses.
# This check walks the rendered routes and asserts the disclosure marker;
# scripts/check-ai-disclosure.mjs separately verifies the producing-round map
# against the build log and git history.
echo
for route in / /blog /blog/frontier-cyber /directory /demos /log /log/archive /projects /disclosure; do
  body=$(curl -s "$BASE$route")
  case "$body" in
    *'data-ai-disclosure'*) echo "ok    $route carries the AI disclosure" ;;
    *) echo "FAIL  $route renders no AI disclosure"; failures=$((failures + 1)) ;;
  esac
done
node scripts/check-ai-disclosure.mjs || failures=$((failures + $?))

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
  for route in / /blog /blog/frontier-cyber /directory /demos /log /log/archive /projects /disclosure; do
    bytes=$(curl -s -H 'Accept-Encoding: gzip' -o /dev/null -w '%{size_download}' "$BASE$route")
    if [ "$bytes" -gt "$ceiling" ]; then
      echo "FAIL  $route is $bytes bytes gzipped, over the local ceiling of $ceiling"
      failures=$((failures + 1))
    else
      echo "ok    $route  $bytes bytes gzipped ($((ceiling - bytes)) to spare)"
    fi
  done
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
# Count the per-entry anchor ids, not the visible "Round N" text: React
# splits interpolated text with comment nodes, so the rendered markup
# reads `Round <!-- -->30` and a naive grep counts one.
all_ids=$(curl -s "$BASE/log" | grep -o 'id="round-[^"]*"')
rounds=$(printf '%s\n' "$all_ids" | sort -u | wc -l | tr -d ' ')
total_ids=$(printf '%s\n' "$all_ids" | wc -l | tr -d ' ')

# Two rounds sharing an anchor look exactly like one round going missing, and
# the first version of this check reported it that way -- "renders 49, has 50"
# when nothing was missing and two rounds were both claiming `round-pr-1`.
# A duplicate permalink is its own failure: a citation resolves to whichever
# the browser reaches first, silently.
if [ "$total_ids" != "$rounds" ]; then
  echo "FAIL  /log has duplicate round anchors — $total_ids ids, $rounds unique:"
  printf '%s\n' "$all_ids" | sort | uniq -d | sed 's/^/        /'
  failures=$((failures + 1))
elif [ "$rounds" = "$expected" ]; then
  echo "ok    /log renders all $rounds rounds, each with a unique anchor"
else
  echo "FAIL  /log renders $rounds rounds, CHANGELOG.md has $expected"
  failures=$((failures + 1))
fi

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
failures=$((failures + $?))

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
failures=$((failures + $?))

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
    ...homeHtml.matchAll(/<a[^>]*href="(\/log(?:\/archive)?)\?q=([a-z]+)"[^>]*>([\s\S]*?)<\/a>/g),
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
  for (const path of ["/log", "/log/archive"]) {
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
failures=$((failures + $?))

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
  failures=$((failures + $?))
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
  echo "      (a new round must declare '- Origin: unsupervised|supervised|maintainer')"
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

echo
if [ "$failures" -gt 0 ]; then
  echo "$failures check(s) failed"
  exit 1
fi
if [ "$skipped" -gt 0 ]; then
  echo "all route checks passed, but $skipped group(s) were SKIPPED — see above"
  echo "(set NEXT_PUBLIC_REPO_URL to exercise them; CI always does)"
else
  echo "all route checks passed"
fi
