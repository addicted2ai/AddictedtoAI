// The codex lane's spend, per session, for a given day — fleet vs Desk.
// Each rollout-*.jsonl carries repeated `token_count` events; the LAST one's
// total_token_usage is that session's cumulative total. The worktree it ran in
// appears in the session metadata / cwd, which is how fleet and Desk are told
// apart (the same discriminator f4-run-one.ps1 uses: the `fleet` path segment).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
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
  const text = readFileSync(f, 'utf8');
  let last = null;
  let cwd = '';
  for (const line of text.split('\n')) {
    if (!line) continue;
    if (!cwd) {
      const m = line.match(/addictedtoai-worktrees[\\/]([A-Za-z0-9._-]+)/);
      if (m) cwd = m[1];
    }
    if (line.includes('"total_token_usage"')) {
      try {
        const o = JSON.parse(line);
        const t = o?.payload?.info?.total_token_usage;
        if (t) last = t;
      } catch {}
    }
  }
  if (!last) continue;
  rows.push({
    file: f.split(/[\\/]/).pop().slice(8, 27),
    wt: cwd || '(unknown)',
    lane: /fleet/i.test(cwd) ? 'FLEET' : cwd ? 'desk' : '?',
    inp: last.input_tokens ?? 0,
    cached: last.cached_input_tokens ?? 0,
    out: last.output_tokens ?? 0,
    total: last.total_tokens ?? 0,
  });
}

rows.sort((a, b) => a.file.localeCompare(b.file));
console.log('session              lane   worktree              input     cached      output      TOTAL');
for (const r of rows) {
  console.log(
    `${r.file}  ${r.lane.padEnd(5)}  ${r.wt.slice(0, 20).padEnd(20)} ${String(r.inp).padStart(9)} ${String(r.cached).padStart(10)} ${String(r.out).padStart(10)} ${String(r.total).padStart(10)}`,
  );
}

const sum = (f, pred = () => true) => rows.filter(pred).reduce((a, r) => a + r[f], 0);
console.log(`\nsessions: ${rows.length}`);
for (const lane of ['FLEET', 'desk', '?']) {
  const p = (r) => r.lane === lane;
  const n = rows.filter(p).length;
  if (!n) continue;
  console.log(
    `${lane}: ${n} session(s), input ${sum('inp', p).toLocaleString()} (cached ${sum('cached', p).toLocaleString()}), output ${sum('out', p).toLocaleString()}, TOTAL ${sum('total', p).toLocaleString()}`,
  );
}
console.log(`ALL: total ${sum('total').toLocaleString()} tokens, output ${sum('out').toLocaleString()}`);
