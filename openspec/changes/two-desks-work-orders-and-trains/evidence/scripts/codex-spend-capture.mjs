/**
 * codex-spend-capture.mjs — emit an IMMUTABLE JSON fixture of the codex lane's
 * token spend for one local day, so the figures cited in proposal.md are
 * reproducible from the change directory alone.
 *
 * WHY THIS EXISTS. `codex-spend.mjs` reads `~/.codex/sessions/<Y>/<M>/<D>/`,
 * which is machine-local, outside the repository, and MUTABLE — it grows as
 * sessions run. A sealed review correctly rated the cited figures
 * "unsupported/unreproducible from evidence/" because the script was present
 * but its input was not. Copying the script satisfied the letter and not the
 * property. This captures the OUTPUT.
 *
 * Usage:
 *   node codex-spend-capture.mjs <sessions-day-dir> <out.json> [cutoff-local-HH:MM]
 *
 * Each rollout-*.jsonl carries repeated `token_count` events; the LAST one's
 * `total_token_usage` is that session's cumulative total. The worktree path in
 * the same file separates the lanes (the `fleet` path segment, the same
 * discriminator the worker guard used).
 *
 * The rollout FILENAME carries the session's LOCAL start time (verified: a file
 * named ...T07-54-02... carries event timestamps at 13:59Z, and the machine is
 * America/Denver, UTC-6 in September). Per CLAUDE.md every date here is the
 * local date of the machine that wrote it, so the filename is the right key.
 *
 * NOTHING BUT COUNTS IS READ. No prose, no prompts, no credentials: only the
 * numeric token fields and the worktree directory name.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [dir, outPath, cutoff] = process.argv.slice(2);
if (!dir || !outPath) {
  console.error('usage: node codex-spend-capture.mjs <sessions-day-dir> <out.json> [HH:MM]');
  process.exit(1);
}

const files = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (e.endsWith('.jsonl')) files.push(p);
  }
})(dir);

const rows = [];
for (const f of files) {
  const name = f.split(/[\\/]/).pop();
  // rollout-2026-09-08T07-54-02-<uuid>.jsonl  -> local start time
  const m = /^rollout-(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-/.exec(name);
  const startLocal = m ? `${m[1]}T${m[2]}:${m[3]}:${m[4]}` : null;

  let last = null;
  let wt = '';
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    if (!line) continue;
    if (!wt) {
      const w = line.match(/addictedtoai-worktrees[\\/]([A-Za-z0-9._-]+)/);
      if (w) wt = w[1];
    }
    if (line.includes('"total_token_usage"')) {
      try {
        const t = JSON.parse(line)?.payload?.info?.total_token_usage;
        if (t) last = t;
      } catch {}
    }
  }
  if (!last) continue;
  rows.push({
    start_local: startLocal,
    lane: /fleet/i.test(wt) ? 'fleet' : wt ? 'desk' : 'unattributed',
    worktree: wt || null,
    input_tokens: last.input_tokens ?? 0,
    cached_input_tokens: last.cached_input_tokens ?? 0,
    output_tokens: last.output_tokens ?? 0,
    total_tokens: last.total_tokens ?? 0,
  });
}
rows.sort((a, b) => String(a.start_local).localeCompare(String(b.start_local)));

const agg = (subset) => {
  const s = (k) => subset.reduce((a, r) => a + r[k], 0);
  const input = s('input_tokens');
  const cached = s('cached_input_tokens');
  const output = s('output_tokens');
  const total = s('total_tokens');
  const byLane = {};
  for (const lane of ['fleet', 'desk', 'unattributed']) {
    const l = subset.filter((r) => r.lane === lane);
    if (!l.length) continue;
    byLane[lane] = {
      sessions: l.length,
      input_tokens: l.reduce((a, r) => a + r.input_tokens, 0),
      cached_input_tokens: l.reduce((a, r) => a + r.cached_input_tokens, 0),
      output_tokens: l.reduce((a, r) => a + r.output_tokens, 0),
      total_tokens: l.reduce((a, r) => a + r.total_tokens, 0),
    };
  }
  return {
    sessions: subset.length,
    input_tokens: input,
    cached_input_tokens: cached,
    uncached_input_tokens: input - cached,
    output_tokens: output,
    total_tokens: total,
    cached_share_of_input: input ? Number((cached / input).toFixed(4)) : null,
    input_to_output_ratio: output ? Number((input / output).toFixed(1)) : null,
    mean_total_tokens_per_session: subset.length ? Math.round(total / subset.length) : null,
    mean_uncached_input_per_session: subset.length ? Math.round((input - cached) / subset.length) : null,
    by_lane: byLane,
  };
};

const cutoffRows = cutoff
  ? rows.filter((r) => r.start_local && r.start_local.slice(11) < cutoff)
  : null;

const now = new Date();
const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  .toISOString()
  .replace('Z', '');

const out = {
  what: 'Captured token spend of the codex lane for one LOCAL day, per session.',
  why:
    'proposal.md cites these figures. Their source (~/.codex/sessions) is machine-local, ' +
    'outside the repository and mutable — it grows as sessions run — so a reader could not ' +
    'reproduce the numbers from the change directory. This file is the captured output.',
  captured_at_local: localIso,
  captured_by: 'A2AI-Luna-Boss-2 (backlog coordinator session)',
  source_dir: dir,
  method: {
    per_session:
      "last `token_count` event's payload.info.total_token_usage in each rollout-*.jsonl",
    lane_attribution:
      "worktree path matched from the same file; the `fleet` path segment separates the " +
      'hand-driven fleet from Desk jobs (a PID or a process count cannot: both run under ' +
      'D:/addictedtoai-worktrees)',
    timestamp:
      'the rollout FILENAME carries the session start in LOCAL time (verified against ' +
      'in-file UTC event timestamps at UTC-6); per CLAUDE.md every date is the local date',
    fields_read: 'numeric token counts and the worktree directory name only — no prose, no credentials',
    script: 'evidence/scripts/codex-spend-capture.mjs',
  },
  caveats: [
    'RAW TOTALS OVERSTATE COST. Cached input bills far below fresh input. The figure that ' +
      'behaves like marginal cost is uncached_input_tokens plus output_tokens, not total_tokens.',
    'No price weighting is applied: the codex price table was not available when this was captured.',
    'The day was still in progress at capture; `all_sessions_at_capture` is a partial day.',
    'Sessions with no worktree path in their transcript are attributed `unattributed` rather ' +
      'than guessed at.',
  ],
  aggregates: {
    all_sessions_at_capture: agg(rows),
    ...(cutoffRows
      ? {
          [`sessions_started_before_${cutoff.replace(':', '')}_local`]: {
            note:
              'The subset matching the figures first reported to the architect, measured earlier ' +
              'the same day. Provided so the numbers cited in proposal.md remain checkable even ' +
              'though the day continued after they were taken.',
            ...agg(cutoffRows),
          },
        }
      : {}),
  },
  sessions: rows,
};

writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
const a = out.aggregates.all_sessions_at_capture;
console.log(`wrote ${outPath}`);
console.log(`  sessions ${a.sessions}, total ${a.total_tokens.toLocaleString()}, output ${a.output_tokens.toLocaleString()}`);
console.log(`  cached share of input ${(a.cached_share_of_input * 100).toFixed(1)}%, input:output ${a.input_to_output_ratio}:1`);
if (cutoffRows) {
  const k = Object.keys(out.aggregates).find((x) => x.startsWith('sessions_started_before'));
  const c = out.aggregates[k];
  console.log(`  ${k}: sessions ${c.sessions}, total ${c.total_tokens.toLocaleString()}, output ${c.output_tokens.toLocaleString()}`);
}
