/**
 * The direct check behind "no value renders": count Design Arena tokens in the
 * whole built site. Reads every file under out/ as bytes — no `head`, no
 * sampling, so a zero here is exhaustive rather than truncated.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// Root derived from this file's own location (tools/ sits directly under it),
// so the default outlives the worktree it was written in; argv[2] overrides.
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = process.argv[2] ?? `${ROOT}/out`;
const TOKENS = ['design_arena', 'designarena', 'Design Arena', 'DesignArena', 'win_rate', 'winRate'];

const counts = Object.fromEntries(TOKENS.map((t) => [t, 0]));
const files = Object.fromEntries(TOKENS.map((t) => [t, new Set()]));
let scanned = 0;
let bytes = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = `${dir}/${name}`;
    const st = statSync(p);
    if (st.isDirectory()) {
      walk(p);
      continue;
    }
    scanned += 1;
    bytes += st.size;
    const text = readFileSync(p, 'latin1');
    for (const t of TOKENS) {
      const n = text.split(t).length - 1;
      if (n > 0) {
        counts[t] += n;
        files[t].add(p);
      }
    }
  }
}

walk(OUT);
console.log(`scanned ${scanned} files, ${bytes} bytes under ${OUT}`);
for (const t of TOKENS) {
  console.log(`  "${t}": ${counts[t]} occurrence(s) in ${files[t].size} file(s)`);
  for (const f of [...files[t]].slice(0, 10)) console.log(`      ${f}`);
}
