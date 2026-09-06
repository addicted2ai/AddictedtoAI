/**
 * Count `benchmarks.design_arena` carriers across every committed revision of
 * the OpenRouter snapshot, to locate where a stated figure came from.
 * Read-only. Git plumbing runs through execFileSync (Windows note in CLAUDE.md).
 */
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// Root derived from this file's own location (tools/ sits directly under it),
// so the script outlives the worktree it was written in; argv[2] overrides.
const root = process.argv[2] ?? dirname(dirname(fileURLToPath(import.meta.url)));
const file = 'data/sources/openrouter-models/latest.json';

const log = execFileSync('git', ['-C', root, 'log', '--format=%H %ad', '--date=short', '--', file], {
  encoding: 'utf8',
  maxBuffer: 1 << 28,
});

for (const line of log.trim().split('\n')) {
  const [sha, date] = line.split(' ');
  let snap;
  try {
    const blob = execFileSync('git', ['-C', root, 'show', `${sha}:${file}`], { encoding: 'utf8', maxBuffer: 1 << 28 });
    snap = JSON.parse(blob);
  } catch (err) {
    console.log(`${sha.slice(0, 8)} ${date} unreadable: ${err.message.split('\n')[0]}`);
    continue;
  }
  const rows = Object.entries(snap.rows ?? {});
  let carrying = 0;
  let nonEmpty = 0;
  const slugs = new Set();
  const pairs = new Set();
  for (const [, row] of rows) {
    const block = row?.benchmarks?.design_arena;
    if (block === undefined || block === null) continue;
    carrying += 1;
    if (Array.isArray(block) && block.length > 0) {
      nonEmpty += 1;
      slugs.add(row.canonical_slug ?? '');
      for (const item of block) pairs.add(`${item.arena}\u0000${item.category}`);
    }
  }
  console.log(
    `${sha.slice(0, 8)} ${date} fetched_at=${snap.fetched_at ?? '?'} rows=${rows.length} carrying=${carrying} nonEmpty=${nonEmpty} distinctCanonicalSlugs=${slugs.size} pairs=${pairs.size}`,
  );
}
