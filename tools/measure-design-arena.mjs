/**
 * Measure the `benchmarks.design_arena` block in the committed OpenRouter
 * snapshots. Read-only: prints counts, never writes.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// The repository root is derived from this file's own location (tools/ sits
// directly under it), so the script survives the deletion of the worktree it
// was written in and runs from any working directory. `process.argv[2]`
// overrides it for a checkout elsewhere.
const root = process.argv[2] ?? dirname(dirname(fileURLToPath(import.meta.url)));

for (const which of ['latest', 'previous']) {
  const snap = JSON.parse(readFileSync(`${root}/data/sources/openrouter-models/${which}.json`, 'utf8'));
  // A snapshot's `rows` is an object keyed by row id.
  const rowEntries = Object.entries(snap.rows ?? {});
  const rows = rowEntries.map(([id, row]) => ({ id, ...row }));
  let carrying = 0;
  let entries = 0;
  const pairs = new Set();
  const arenas = new Set();
  const keys = new Set();
  let sample = null;
  for (const row of rows) {
    const block = row?.benchmarks?.design_arena;
    if (block === undefined || block === null) continue;
    carrying += 1;
    if (!Array.isArray(block)) {
      console.log('NON-ARRAY design_arena on', row.id, JSON.stringify(block).slice(0, 200));
      continue;
    }
    for (const item of block) {
      entries += 1;
      pairs.add(`${item.arena}\u0000${item.category}`);
      arenas.add(item.arena);
      for (const k of Object.keys(item)) keys.add(k);
      if (!sample) sample = { id: row.id, item };
    }
  }
  console.log(`--- ${which} (fetched_at ${snap.fetched_at ?? '?'}, row_count ${snap.row_count ?? rows.length}) ---`);
  console.log('rows total:', rows.length);
  console.log('rows carrying benchmarks.design_arena:', carrying);
  console.log('total arena entries:', entries);
  console.log('distinct arena/category pairs:', pairs.size);
  console.log('distinct arenas:', [...arenas].sort().join(', '));
  console.log('item keys:', [...keys].sort().join(', '));
  console.log('sample:', JSON.stringify(sample));
}
