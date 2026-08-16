#!/usr/bin/env node
// Choose which track runs next. From the repository root:
//
//   node scripts/dispatch.mjs            # human-readable
//   node scripts/dispatch.mjs --github   # writes track= and reason= to $GITHUB_OUTPUT
//
// The model does not choose its own track. "What kind of work should I do?" is
// the lever that produced ten rounds of this site refining its own scaffolding:
// given the choice, a run picks work it can see, and what it can see is its own
// repository. So selection happens here, before the run starts, from the docket
// and the quotas in policy.yml.
//
// Order of precedence:
//
//   1. Preflight  — something is broken or rotting; that is the run
//   2. Audit floor — audit has not run enough this week
//   3. Quota      — the track most owed a run, among those that can run
//   4. Nothing    — no track has work; the run stops, which is rule 20
//
// Track history comes from CHANGELOG.md `- Track:` fields, so it counts
// *shipped* work. That is the right denominator: a meta run that found nothing
// to do did not consume meta's share of the site's changes.
//
// One availability check is not about the docket: the publishing quota. An
// author round publishes on the day it runs, so a post it writes can only be
// honestly dated today, and policy.yml caps how many posts a day and an ISO
// week may hold. The check that enforces those caps runs as part of the
// production build — after the round has done its work — so dispatch reads
// the same policy section and the same module the check reads, and treats the
// author track as unavailable when a post dated today would push the current
// day or ISO week over its cap.

import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { execFileSync } from "child_process";
import { load as parseYaml } from "js-yaml";

// See the note in check-docket.mjs: CRLF makes the frontmatter regex match
// nothing, and the `- Track:` history scan below is line-anchored too.
function readText(file) {
  return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
}

const root = process.cwd();
const asGithub = process.argv.includes("--github");

const policy = parseYaml(fs.readFileSync(path.join(root, "policy.yml"), "utf8"));
const tracks = policy.tracks || {};

// --- inputs -----------------------------------------------------------------

function frontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return {};
  const fields = {};
  for (const line of match[1].split("\n")) {
    const colon = line.indexOf(":");
    if (colon > 0) fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return fields;
}

const openDir = path.join(root, "docket", "open");
const open = fs.existsSync(openDir)
  ? fs
      .readdirSync(openDir)
      .filter((f) => f.endsWith(".md"))
      .map((file) => frontmatter(readText(path.join(openDir, file))))
  : [];

// An item blocked on something not yet done is not available work.
const doneDir = path.join(root, "docket", "done");
const done = new Set(
  fs.existsSync(doneDir) ? fs.readdirSync(doneDir).filter((f) => f.endsWith(".md")) : []
);
const ready = open.filter((item) =>
  (item["blocked-by"] || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .every((ref) => done.has(ref))
);

const changelog = readText(path.join(root, "CHANGELOG.md"));
// Newest first, matching the file's order. Each `- Track:` is paired with the
// `### YYYY-MM-DD` heading above it, so a per-day cap can count the rounds that
// shipped on a given calendar date rather than only their order.
const dated = [];
{
  let date = null;
  for (const line of changelog.split("\n")) {
    const heading = /^### (\d{4}-\d{2}-\d{2})/.exec(line);
    if (heading) {
      date = heading[1];
      continue;
    }
    const track = /^- Track:\s*(\S+)/.exec(line);
    if (track) dated.push({ track: track[1].toLowerCase(), date });
  }
}
const history = dated.map((entry) => entry.track);

// A per-day cap counts dates, so it fails open if the pairing ever stops
// working: entries with no date match nothing, shippedToday() returns 0, and
// every cap silently stops applying. Say so rather than letting the loop drift
// back to bursting while the policy file still claims a cap.
if (dated.length > 0 && dated.every((entry) => entry.date === null)) {
  console.error(
    "WARN  no `### YYYY-MM-DD` heading was paired with any `- Track:` line in CHANGELOG.md"
  );
  console.error(
    "      per-day caps in policy.yml cannot be enforced against an undated history"
  );
}

const WINDOW = 20;
const recent = history.slice(0, WINDOW);

// --- publishing room ---------------------------------------------------------

// The calendar date of the day the round runs, in the environment that runs
// dispatch. A local round and a scheduled one each publish on the day *their*
// clock says it is, and dispatch shares that clock, so the date the round
// would write into a post is the date dispatch must judge.
function localDate(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ISO weeks run Monday to Sunday; group by the Monday of each date. The same
// definition as check-publishing-quota.mjs's mondayOf, so dispatch and the
// check count the same week and the same day.
function mondayOf(isoDate) {
  const t = new Date(`${isoDate}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7));
  return t.toISOString().slice(0, 10);
}

function isRealDate(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  return date === parsed.toISOString().slice(0, 10);
}

// Why author cannot run today, or null when it can. Fails closed: if the caps
// or the published dates cannot be read, author is not selectable — a
// dispatch that cannot tell room from no room is the round-127 failure
// repeating, because the round would write the post and the build would
// refuse it either way.
async function publishingRoom() {
  const dayCap = policy.publishing?.max_posts_per_day;
  const weekCap = policy.publishing?.max_posts_per_week;
  if (!Number.isInteger(dayCap) || dayCap < 1 || !Number.isInteger(weekCap) || weekCap < 1) {
    return "policy.yml publishing caps are not positive integers — author cannot be selected while the caps cannot be read";
  }
  let posts;
  try {
    posts = (await import(pathToFileURL(path.join(root, "app/lib/posts.js")).href)).posts;
  } catch (error) {
    return "app/lib/posts.js could not be read — author cannot be selected while the published dates cannot be read";
  }
  if (!Array.isArray(posts)) {
    return "app/lib/posts.js does not export a posts array — author cannot be selected while the published dates cannot be read";
  }
  const bad = posts.find((post) => !isRealDate(post?.datePublished));
  if (bad) {
    return `app/lib/posts.js has a post without a real datePublished${
      bad?.path ? ` (${bad.path})` : ""
    } — author cannot be selected while the published dates cannot be read`;
  }
  const today = localDate();
  const week = mondayOf(today);
  const weekCount = posts.filter((post) => mondayOf(post.datePublished) === week).length;
  const dayCount = posts.filter((post) => post.datePublished === today).length;
  const full = [];
  if (weekCount + 1 > weekCap) {
    full.push(
      `the ISO week of ${week} already holds ${weekCount} post${weekCount === 1 ? "" : "s"} (cap ${weekCap})`
    );
  }
  if (dayCount + 1 > dayCap) {
    full.push(`${today} already holds ${dayCount} post${dayCount === 1 ? "" : "s"} (cap ${dayCap})`);
  }
  if (full.length === 0) return null;
  const nextMonday = new Date(`${week}T00:00:00Z`);
  nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
  return `no honest publish date before ${nextMonday.toISOString().slice(0, 10)} — ${full.join("; ")}`;
}

const publishingBlock = await publishingRoom();

let preflight = { findings: [] };
try {
  preflight = JSON.parse(
    execFileSync("node", ["scripts/preflight.mjs", "--json"], { encoding: "utf8" })
  );
} catch (error) {
  // A broken preflight must not silently become "nothing is wrong". Surface it
  // and route to meta, which is the track that fixes broken machinery.
  preflight = {
    findings: [
      {
        urgency: 0,
        track: "meta",
        what: "preflight itself failed to run",
        detail: [String(error.message).split("\n")[0]],
        why: "The interrupt cannot be trusted until this is fixed.",
      },
    ],
  };
}

// --- selection --------------------------------------------------------------

// Rounds that shipped today, by the same clock the publishing quota uses. The
// count is of *shipped* rounds — a round dispatched and not yet merged does not
// appear — which is safe only because rounds are serial: the in-flight guard
// stops a second dispatch while one is open, so by the time this is read again
// the previous round has landed. If rounds ever run concurrently, this becomes
// a race and the cap will let one extra through.
function shippedToday(track) {
  const today = localDate();
  return dated.filter((entry) => entry.date === today && entry.track === track)
    .length;
}

function availability(track) {
  const cfg = tracks[track];
  if (!cfg) return { can: false, why: "not in policy.yml" };
  // A hard per-day cap, checked before anything else: a track at its cap is not
  // selectable no matter how owed it is or how much work is queued. Weights
  // spread runs out over a window and cannot bound a burst — scout shipped four
  // rounds on 16 August, three of them inside two hours, while sitting at its
  // policy share, because "most owed" is a ratio and says nothing about when.
  //
  // A preflight finding still overrides this: decide() returns the owning track
  // before availability is consulted, which is intended. A cap on routine
  // cadence should not stop the loop reacting to something that is wrong now.
  const perDay = cfg.max_runs_per_day;
  if (perDay != null) {
    const n = shippedToday(track);
    if (n >= perDay) {
      return {
        can: false,
        why: `already shipped ${n} round(s) today (cap ${perDay}/day)`,
      };
    }
  }
  if (cfg.needs_docket_item) {
    const n = ready.filter((item) => item.track === track).length;
    if (n === 0) return { can: false, why: "no ready docket item" };
    if (track === "author" && publishingBlock) {
      return { can: false, why: `publishing quota: ${publishingBlock}` };
    }
    return { can: true, why: `${n} ready item(s)` };
  }
  return { can: true, why: "does not need a queued item" };
}

// The clause naming the publishing-quota block, attached to the decision's
// reason so the run prompt carries it. Only when the block is what stands
// between author and selection: an author with no ready docket item is a
// queue state, not a quota state.
const authorQuotaBlock =
  publishingBlock && ready.some((item) => item.track === "author")
    ? `; author was not selectable: ${publishingBlock}`
    : "";

function decide() {
  if (preflight.findings.length > 0) {
    const top = preflight.findings[0];
    return {
      track: top.track,
      reason: `preflight: ${top.what}`,
      preflight: top,
    };
  }

  // Audit is due when a gap has opened, rather than on a rate. A rate floor
  // ("N per week") fires on a cold start and forces consecutive audit runs
  // with nothing yet to audit; a gap can only open once other work has
  // shipped, which is also the only time auditing means anything.
  const gap = tracks.audit?.max_rounds_between_runs;
  if (gap) {
    const window = recent.slice(0, gap);
    const sinceAudit = window.filter((t) => t !== "audit").length;
    const auditInWindow = window.some((t) => t === "audit");
    if (!auditInWindow && sinceAudit >= gap && availability("audit").can) {
      return {
        track: "audit",
        reason: `audit due: ${sinceAudit} shipped round(s) since the last audit (max ${gap})`,
      };
    }
  }

  // Meta is capped by share of recent shipped rounds. It is the only track with
  // infinite available work, which is why it won for ten straight rounds.
  const metaCap = tracks.meta?.max_share_of_runs;
  const metaShare = recent.length
    ? recent.filter((t) => t === "meta").length / recent.length
    : 0;

  const candidates = Object.keys(tracks).filter((track) => {
    if (!availability(track).can) return false;
    if (track === "meta" && metaCap != null && metaShare >= metaCap) return false;
    return true;
  });

  if (candidates.length === 0) {
    return {
      track: null,
      reason: `no track has available work — this run stops (CHARTER.md rule 20)${authorQuotaBlock}`,
    };
  }

  // Most owed: largest gap between the share the policy asks for and the share
  // recently delivered. With no history every track is equally owed, so the
  // heaviest weight wins, which is the intended cold start.
  const totalWeight = candidates.reduce((n, t) => n + (tracks[t].weight || 0), 0);
  let best = null;
  for (const track of candidates) {
    const target = (tracks[track].weight || 0) / (totalWeight || 1);
    const actual = recent.length
      ? recent.filter((t) => t === track).length / recent.length
      : 0;
    const owed = target - actual;
    if (!best || owed > best.owed) best = { track, owed, target, actual };
  }

  return {
    track: best.track,
    reason:
      `quota: target ${(best.target * 100).toFixed(0)}%, ` +
      `recent ${(best.actual * 100).toFixed(0)}% over last ${recent.length} shipped round(s)` +
      authorQuotaBlock,
  };
}

const decision = decide();

// --- output -----------------------------------------------------------------

if (asGithub) {
  const out = process.env.GITHUB_OUTPUT;
  const lines = [
    `track=${decision.track || ""}`,
    `reason=${decision.reason.replace(/\n/g, " ")}`,
    `run=${decision.track ? "true" : "false"}`,
  ];
  if (out) fs.appendFileSync(out, lines.join("\n") + "\n");
  else process.stdout.write(lines.join("\n") + "\n");
} else {
  console.log(`track:  ${decision.track || "(none — stop)"}`);
  console.log(`reason: ${decision.reason}`);
  console.log();
  console.log(`ready docket items: ${ready.length} of ${open.length} open`);
  for (const track of Object.keys(tracks)) {
    const a = availability(track);
    const n = recent.filter((t) => t === track).length;
    console.log(
      `  ${track.padEnd(9)} ${a.can ? "available" : "blocked  "}  ` +
        `(${a.why}; ${n} of last ${recent.length} shipped)`
    );
  }
  if (decision.preflight) {
    console.log();
    console.log("preflight finding that decided this run:");
    for (const line of decision.preflight.detail) console.log(`  ${line}`);
  }
}
