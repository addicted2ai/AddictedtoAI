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
// The quota step does not compare fixed policy weights. A track's weight is
// scaled by measured demand first: a consuming track's `queue_budget` turns
// its weight into a servo on its own queue depth (a full queue doubles it, an
// empty one halves it), and scout's `feeds` reads the same measurement with
// the opposite sign (a full fed queue demotes it toward a floor that is never
// zero). Tracks with neither keep their policy weight. The mechanism, the two
// load-bearing constants and the reason the human-readable output prints ready
// counts and budgets are in the "demand" section below — a rotation this file
// no longer runs.
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
import {
  closedGenerativeCount,
  pushMultiplier,
  generativeShare,
  pushApplied,
} from "./generative-push.mjs";

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
const doneFiles = fs.existsSync(doneDir)
  ? fs.readdirSync(doneDir).filter((f) => f.endsWith(".md"))
  : [];
const done = new Set(doneFiles);
// Fields of every closed item -- the generative-push multiplier below is the
// only other reader of docket/done/ in this file, so it reuses this list
// rather than re-scanning the directory.
const doneItems = doneFiles.map((file) => frontmatter(readText(path.join(doneDir, file))));
const ready = open.filter((item) =>
  // An item blocked on the maintainer is real but no round can close it, so
  // it is not available work; check-docket.mjs admits only `maintainer` here.
  !item["blocked-on"] &&
  (item["blocked-by"] || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .every((ref) => done.has(ref))
);

const changelog = readText(path.join(root, "CHANGELOG.md"));
// Newest first, matching the file's order. Each `- Track:` records which track
// shipped the round it belongs to; the ordered list is the history the
// most-owed window and the audit floor read. Only *shipped* work counts: a meta
// run that found nothing to do did not consume meta's share of the site's
// changes.
const history = changelog
  .split("\n")
  .map((line) => /^- Track:\s*(\S+)/.exec(line)?.[1])
  .filter(Boolean)
  .map((track) => track.toLowerCase());

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

// --- demand ------------------------------------------------------------------
//
// A track's weight becomes a function of measured demand rather than a
// constant. The single measurement is queue pressure, ready stock over what the
// track can actually spend:
//
//     pressure(track) = readyCount(track) / queue_budget(track)      // 1.0 = at budget
//
// A **consuming** track (one with a `queue_budget`) reads it directly — the
// fuller its queue, the more it is owed:
//
//     effectiveWeight = weight * min(pressure, 2)
//
// The **supplying** track (one with `feeds`) reads the same number with the
// opposite sign — the more stock it has already delivered, the less it is owed:
//
//     fill  = sum(readyCount(f) for f in feeds with a budget)
//           / sum(queue_budget(f) for f in feeds with a budget)
//     effectiveWeight = weight * clamp(1 - fill, 0.1, 1)
//
// A track with neither a budget nor `feeds` keeps its weight unchanged. `target`
// is effectiveWeight over the candidates, and the most-owed comparison is the
// same one that has always run.
//
// Two constants are load-bearing and must not be tuned casually:
//   - **The 2x pressure ceiling is no longer the whole ceiling.** It combines
//     multiplicatively with the generative push below
//     (docket/open/2026-08-22-model-deprecation-checker.md): a track that is
//     both at 2x pressure AND holds a 100% `worth-a-visit` ready queue reaches
//     weight * 2 * start_multiplier -- 6x at policy.yml's current
//     start_multiplier: 3.0, not 2x. Review on round dbd4fd1 caught this
//     comment still claiming a flat 2x after the push landed, and caught that
//     `policy.yml`'s meta weight comment cited the flat-2x guarantee as why
//     `max_share_of_runs` could be dropped for meta specifically. The
//     combined ceiling is reachable only by `author` and `build`, enforced in
//     two independent places on purpose (defence in depth, not redundancy):
//     `scripts/check-docket.mjs` rejects `worth-a-visit` for every other
//     track at filing time (a required CI check), and
//     `scripts/generative-push.mjs`'s `generativeShare`/`closedGenerativeCount`
//     filter to `VISITOR_FACING` (scripts/visitor-facing-tracks.mjs, the one
//     definition both import) themselves, so every other track's
//     `generativeShare` is genuinely structurally 0 (`pushAppliedFor` always
//     returns 1 for them) *in this function's own arithmetic*, not only
//     because a different script rejected the item earlier. The second layer
//     exists because the first alone is not unconditional: `enforce_admins`
//     is `false` on `main`, and this repository has documented, with real
//     merged pull requests (docket/open/2026-08-11-branch-protection-does-not-require-review.md),
//     that the account this loop merges as can merge past a red required
//     check -- review on round 8d0098e proved this reachable by hand-placing
//     a `track: meta, serves: worth-a-visit` item straight into
//     `docket/open/`, bypassing `check-docket.mjs` entirely, and getting a
//     nonzero share out of the pre-fix counting code. meta is one of the
//     excluded tracks, which is what keeps its dropped share cap safe -- see
//     policy.yml's `meta.weight` comment, which says so explicitly rather
//     than leaving the dependency between the two files implicit.
//   - **The 0.1 floor on scout is deliberate and must never be zero.** External
//     input is the one thing this loop cannot generate for itself, and a scout
//     that can be switched off completely is the rounds-38-48 spiral with a new
//     switch.

function readyCount(track) {
  return ready.filter((item) => item.track === track).length;
}

// --- generative push ---------------------------------------------------------
//
// docket/open/2026-08-22-model-deprecation-checker.md: an initial high weight
// on shipped `worth-a-visit` work (CHARTER.md test 1) that decays to a
// balanced one as it actually ships, not on a clock -- see policy.yml's
// `generative_push` block, the single source for every number here, and
// scripts/generative-push.mjs, the single source for the arithmetic.
const push = policy.generative_push;
const CLOSED_GENERATIVE = closedGenerativeCount(push, doneItems);
const PUSH_MULTIPLIER = pushMultiplier(push, CLOSED_GENERATIVE);

function pushAppliedFor(track) {
  return pushApplied(PUSH_MULTIPLIER, generativeShare(push, ready, track));
}

function effectiveWeight(track) {
  const cfg = tracks[track];
  const weight = cfg?.weight || 0;
  const budget = cfg?.queue_budget;
  if (budget != null) {
    const pressure = readyCount(track) / budget;
    return weight * Math.min(pressure, 2) * pushAppliedFor(track);
  }
  const fed = (cfg?.feeds || []).filter((f) => tracks[f]?.queue_budget != null);
  if (fed.length > 0) {
    const readyTotal = fed.reduce((n, f) => n + readyCount(f), 0);
    const budgetTotal = fed.reduce((n, f) => n + tracks[f].queue_budget, 0);
    const fill = budgetTotal > 0 ? readyTotal / budgetTotal : 0;
    return weight * Math.min(1, Math.max(0.1, 1 - fill));
  }
  return weight;
}

// --- selection --------------------------------------------------------------

function availability(track) {
  const cfg = tracks[track];
  if (!cfg) return { can: false, why: "not in policy.yml" };
  // A preflight finding overrides this whole function: decide() returns the
  // owning track before availability is consulted, so an interrupt is never
  // held back by a track's ordinary selectability.
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

  const candidates = Object.keys(tracks).filter(
    (track) => availability(track).can
  );

  if (candidates.length === 0) {
    return {
      track: null,
      reason: `no track has available work — this run stops (CHARTER.md rule 20)${authorQuotaBlock}`,
    };
  }

  // Most owed: largest gap between the share the policy asks for — after demand
  // weighting — and the share recently delivered. With no history every track
  // is equally owed, so the heaviest effective weight wins, which is the
  // intended cold start.
  const totalWeight = candidates.reduce((n, t) => n + effectiveWeight(t), 0);
  let best = null;
  for (const track of candidates) {
    const target = effectiveWeight(track) / (totalWeight || 1);
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
  console.log();
  if (push?.serves) {
    console.log(
      `generative push (policy.yml generative_push, serves: ${push.serves}): ` +
        `${CLOSED_GENERATIVE} closed -> multiplier ${PUSH_MULTIPLIER.toFixed(2)} ` +
        `(start ${push.start_multiplier}, floor ${push.floor_multiplier}, ` +
        `decay ${push.decay_per_shipped}/shipped)`
    );
    console.log();
  }
  console.log("demand by track (ready / budget = pressure -> effective weight):");
  for (const track of Object.keys(tracks)) {
    const cfg = tracks[track];
    const eff = effectiveWeight(track);
    const mult = eff / (cfg.weight || 0);
    const budget = cfg.queue_budget;
    if (budget != null) {
      const share = generativeShare(push, ready, track);
      const applied = pushApplied(PUSH_MULTIPLIER, share);
      const pushSuffix = push?.serves
        ? `; push share ${share.toFixed(2)} -> applied x${applied.toFixed(2)}`
        : "";
      console.log(
        `  ${track.padEnd(9)} ${String(readyCount(track)).padStart(3)}/${budget} = ` +
          `${(readyCount(track) / budget).toFixed(2)}  ->  weight ${eff.toFixed(2)} ` +
          `(x${mult.toFixed(2)} of ${cfg.weight}${pushSuffix})`
      );
    } else if ((cfg.feeds || []).length > 0) {
      const fed = cfg.feeds.filter((f) => tracks[f]?.queue_budget != null);
      const readyTotal = fed.reduce((n, f) => n + readyCount(f), 0);
      const budgetTotal = fed.reduce((n, f) => n + tracks[f].queue_budget, 0);
      const fill = budgetTotal > 0 ? readyTotal / budgetTotal : 0;
      console.log(
        `  ${track.padEnd(9)} feeds ${fed.join(",")}: ${readyTotal}/${budgetTotal} = ` +
          `${fill.toFixed(2)} fill  ->  weight ${eff.toFixed(2)} ` +
          `(x${mult.toFixed(2)} of ${cfg.weight})`
      );
    } else {
      console.log(
        `  ${track.padEnd(9)} no budget, no feeds  ->  weight ${eff.toFixed(2)} ` +
          `(x${mult.toFixed(2)} of ${cfg.weight})`
      );
    }
  }
  console.log();
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
