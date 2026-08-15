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
// posts.js is ESM in a CommonJS project, so instead of importing it this
// script reads the file and matches post blocks — the same approach
// check-tool-staleness.mjs takes with tool-categories.js. The match must be
// total, not partial: the parser fails loudly unless the number of matched
// blocks is exactly the number of `path:` fields the file holds, because a
// parser that silently finds one post fewer than the file holds is how a
// guardrail goes green forever.

import fs from "fs";
import path from "path";
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

// One match per post: `{ path: ..., ..., datePublished: "YYYY-MM-DD",
// dateModified: ... }`. Matched greedily to the first closing `},` and parsed
// for fields.
function readPosts(source, label) {
  const blocks = [...source.matchAll(/\{\s*path:[\s\S]*?\n\s*\},/g)].map((m) => m[0]);
  const pathCount = (source.match(/^\s*path:\s*"/gm) || []).length;
  if (blocks.length !== pathCount) {
    fail(
      `${label}: matched ${blocks.length} post block(s) but ${POSTS_FILE} holds ${pathCount} path: field(s) — a post block was dropped (its first field is not path:, or it does not end with "},"). A parser that silently sees fewer posts than the file holds cannot guard the quota`
    );
  }
  const posts = [];
  for (const block of blocks) {
    const match = (name) => block.match(new RegExp(`^\\s*${name}:\\s*"([^"]*)"`, "m"))?.[1];
    const postPath = match("path");
    const date = match("datePublished");
    if (!postPath || !date) {
      fail(`${label}: a post block lacks path or datePublished — the parser no longer matches ${POSTS_FILE}`);
    }
    const dateFieldCount = (block.match(/^\s*datePublished:\s*"/gm) || []).length;
    if (dateFieldCount !== 1) {
      fail(`${label}: post ${postPath} holds ${dateFieldCount} datePublished field(s) — exactly one per post`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
      fail(`${label}: post ${postPath} has datePublished "${date}" which is not a real date`);
    }
    posts.push({ path: postPath, date });
  }
  if (posts.length === 0) {
    fail(`${label}: no posts matched in ${POSTS_FILE} — the parser no longer matches the file`);
  }
  if (new Set(posts.map((p) => p.path)).size !== posts.length) {
    fail(`${label}: posts.js contains duplicate paths — posts cannot be told apart for the diff`);
  }
  return posts;
}

const head = readPosts(fs.readFileSync(path.join(root, POSTS_FILE), "utf8"), "branch");

let base;
try {
  base = readPosts(
    execFileSync("git", ["show", `${BASE_REF}:${POSTS_FILE}`], { encoding: "utf8" }),
    BASE_REF
  );
} catch (error) {
  fail(`could not read ${BASE_REF}:${POSTS_FILE} — ${error.message} (fetch origin/main and try again)`);
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
