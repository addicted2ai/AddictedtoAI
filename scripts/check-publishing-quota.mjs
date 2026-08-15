#!/usr/bin/env node
// Fail the build when a change to app/lib/posts.js would publish more posts
// than the quota in policy.yml allows. Run from the repository root:
//
//   node scripts/check-publishing-quota.mjs
//
// policy.yml commits the loop to a cadence: `publishing.max_posts_per_day`
// and `publishing.max_posts_per_week`, under the comment that "publishing
// often is how it becomes slop". The policy header says anything load-bearing
// should get "a parser and a check that can fail, rather than staying a
// number a prompt is trusted to honour". This is that check.
//
// The check is diff-aware, and that is the whole design. The caps were
// already breached before this check existed — 3 posts on 2026-08-11, 4 on
// 2026-08-14, 8 in the ISO week of 2026-08-10, none of it recorded — and a
// check that failed on the current state would red the tree for overage that
// is already shipped and already in the record. So this check does not judge
// the total; it judges the change. It compares app/lib/posts.js on the
// branch under test against origin/main's copy and fails only when the
// branch adds a post (or re-dates one) into a day or ISO week that would end
// up over its cap. Already-shipped overage stays recorded, not red, and the
// next attempt to over-publish is stopped at the pull request that makes it.
//
// The quota is read from policy.yml rather than copied, because a threshold
// restated in a second file drifts from the one a run is told to honour.
// policy.yml is owned by the meta track; this script never writes it.
//
// The dates come from the module's exports, not from the file's text. The
// site imports `{ posts }` from app/lib/posts.js; so does this check — the
// branch's copy by path, origin/main's copy via `git show` into a dynamic
// import of the same source. A `datePublished:` line inside a description is
// just a string and can never be read as the post's date, and no formatting
// of the file — field order, a duplicated key, a closing brace on the same
// line — can hide a post from the check, because the JavaScript engine
// already resolved all of it into the object the site ships. The check fails
// loudly if the module does not export a posts array, if a post lacks a real
// datePublished, or if the file is not valid JavaScript at all: a check that
// cannot read the posts cannot guard the quota, and silently inventing a
// date from text is how this guardrail previously went green on a lie.

import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { execFileSync } from "child_process";
import { load as parseYaml } from "js-yaml";

const root = process.cwd();
const POSTS_FILE = "app/lib/posts.js";
const BASE_REF = "origin/main";

function fail(message) {
  console.error(`FAIL  ${message}`);
  process.exit(1);
}

const policy = parseYaml(fs.readFileSync(path.join(root, "policy.yml"), "utf8"));
const dayCap = policy.publishing?.max_posts_per_day;
const weekCap = policy.publishing?.max_posts_per_week;
if (!Number.isInteger(dayCap) || dayCap < 1) {
  fail("policy.yml publishing.max_posts_per_day is not a positive integer to enforce");
}
if (!Number.isInteger(weekCap) || weekCap < 1) {
  fail("policy.yml publishing.max_posts_per_week is not a positive integer to enforce");
}

// Read the posts the module actually exports, the same object the site
// ships. `path` tells the posts apart for the diff; `datePublished` is what
// the quota is judged on. A post without a real date fails loudly — it is
// not a published post, and no other text in the file may stand in for one.
// A date is real only if it round-trips as an exact calendar day. The shape
// check alone lets "2026-02-31" through, and Date.parse rolls such dates over
// instead of rejecting them — "2026-02-31" becomes 2026-03-03, "2026-04-31"
// becomes 2026-05-01 — so a shape-and-parse guard accepts dates no calendar
// has, which the site's feed renders as the rolled day. Parsing into a
// UTC-midnight Date and comparing the ISO serialization back to the source
// string accepts exactly the real YYYY-MM-DD dates: a rolled date can never
// equal the string it was rolled from, and the parsed Date's own ISO form is
// the calendar's verdict. A date that does not even parse (2026-13-01) is
// likewise not real; the NaN guard keeps toISOString from throwing on it.
function isRealCalendarDate(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  return date === parsed.toISOString().slice(0, 10);
}

function postsFromModule(mod, label) {
  if (!Array.isArray(mod.posts)) {
    fail(`${label}: ${POSTS_FILE} does not export a "posts" array — the module no longer matches what the site ships`);
  }
  const seen = new Set();
  const posts = [];
  for (const post of mod.posts) {
    const postPath = post?.path;
    if (typeof postPath !== "string" || postPath.length === 0) {
      fail(`${label}: a post in ${POSTS_FILE} has no path — posts cannot be told apart for the diff`);
    }
    if (seen.has(postPath)) {
      fail(`${label}: ${POSTS_FILE} contains duplicate path "${postPath}" — posts cannot be told apart for the diff`);
    }
    seen.add(postPath);
    const date = post?.datePublished;
    if (!isRealCalendarDate(date)) {
      fail(
        `${label}: post ${postPath} has no datePublished, or one that is not a real YYYY-MM-DD date — a post without a real published date is not a post the site ships, and reading a date from any other text in the file would fabricate one`
      );
    }
    posts.push({ path: postPath, date });
  }
  if (posts.length === 0) {
    fail(`${label}: ${POSTS_FILE} exports an empty posts array — nothing to enforce the quota against`);
  }
  return posts;
}

let head;
try {
  head = postsFromModule(
    await import(pathToFileURL(path.join(root, POSTS_FILE)).href),
    "branch"
  );
} catch (error) {
  fail(`could not import ${POSTS_FILE} — ${error.message} (the file must be valid JavaScript the site can ship)`);
}

// This check is diff-aware, so it needs the base branch in the checkout. Not
// every checkout has one: a single-branch or shallow clone has no origin/main
// to diff against, and Vercel's build checkout is exactly that. Between
// 15 August 06:54Z and the commit carrying this comment, every production
// deployment failed here — `fatal: invalid object name 'origin/main'` — while
// CI stayed green, because CI clones the full history. The site published
// nothing for ten and a half hours and nine merged pull requests, and nothing
// in the loop noticed, because the loop watches checks and not deployments.
//
// A missing base ref is therefore a fact about the checkout, not a defect in
// the branch, and it degrades to a warning — the same shape as front 3 of
// check-loop-history-snapshot.mjs when the API is unreachable. A base ref that
// exists but whose copy of the file cannot be read is still a failure: that is
// a broken tree, not a partial clone.
//
// What the degradation gives up is real and is not hidden: with no base there
// is no way to tell an added or re-dated post from one that was already there,
// and treating every post as changed would fail any build where a day or week
// is already at cap — a state this check exists to record rather than punish.
// The quota is enforced where the full history is: in CI, on every pull
// request, before anything can merge.
let base;
let baseSource;
try {
  baseSource = execFileSync("git", ["show", `${BASE_REF}:${POSTS_FILE}`], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
} catch {
  let refPresent = true;
  try {
    execFileSync("git", ["rev-parse", "--verify", "--quiet", `${BASE_REF}^{commit}`], {
      stdio: "ignore",
    });
  } catch {
    refPresent = false;
  }
  if (refPresent) {
    fail(
      `could not read ${BASE_REF}:${POSTS_FILE} — the ref is present, so this is a broken checkout rather than a partial clone`
    );
  }
  console.error(
    `WARN  ${BASE_REF} is not in this checkout — the diff-aware comparison is skipped this run`
  );
  console.error(
    "      a single-branch or shallow clone has no base to diff against; the quota is"
  );
  console.error(
    "      enforced in CI, which clones the full history, on every pull request"
  );
  console.log(
    `ok    ${head.length} posts; no ${BASE_REF} in this checkout, so no change was compared`
  );
  process.exit(0);
}
try {
  base = postsFromModule(
    await import(`data:text/javascript;base64,${Buffer.from(baseSource).toString("base64")}`),
    BASE_REF
  );
} catch (error) {
  fail(`could not import ${BASE_REF}:${POSTS_FILE} — ${error.message}`);
}

// ISO weeks run Monday to Sunday; group by the Monday of each post's date.
// 2026-08-09 is a Sunday, so it belongs to the previous week — the docket's
// "ISO week 2026-08-10 through 2026-08-16" is exactly the Monday-start week.
function mondayOf(isoDate) {
  const t = new Date(`${isoDate}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7));
  return t.toISOString().slice(0, 10);
}

const byDay = new Map();
const byWeek = new Map();
for (const post of head) {
  byDay.set(post.date, (byDay.get(post.date) || 0) + 1);
  const week = mondayOf(post.date);
  byWeek.set(week, (byWeek.get(week) || 0) + 1);
}

const baseByPath = new Map(base.map((p) => [p.path, p.date]));
const changed = head.filter((post) => {
  const baseDate = baseByPath.get(post.path);
  return baseDate === undefined || baseDate !== post.date;
});

const problems = [];
for (const post of changed) {
  const dayCount = byDay.get(post.date);
  if (dayCount > dayCap) {
    const others = head
      .filter((p) => p.date === post.date)
      .map((p) => p.path);
    problems.push(
      `${post.path} lands on ${post.date}, which would hold ${dayCount} posts that day (cap ${dayCap}): ${others.join(", ")}`
    );
  }
  const week = mondayOf(post.date);
  const weekCount = byWeek.get(week);
  if (weekCount > weekCap) {
    const others = head
      .filter((p) => mondayOf(p.date) === week)
      .map((p) => p.path);
    problems.push(
      `${post.path} lands in the ISO week of ${week}, which would hold ${weekCount} posts that week (cap ${weekCap}): ${others.join(", ")}`
    );
  }
}

if (problems.length > 0) {
  const unique = [...new Set(problems)];
  for (const problem of unique) console.log(`FAIL  publishing quota: ${problem}`);
  console.log(`\n${unique.length} change(s) would breach the publishing quota`);
  console.log("      policy.yml caps: max_posts_per_day " + dayCap + ", max_posts_per_week " + weekCap);
  console.log("      a day or week already over the cap in origin/main is recorded, not this");
  console.log("      check's failure — only a change that pushes one further over fails here");
  process.exit(1);
}

console.log(
  `ok    ${head.length} posts; day cap ${dayCap}, week cap ${weekCap}; no added or re-dated post pushes a day or week over its cap`
);
