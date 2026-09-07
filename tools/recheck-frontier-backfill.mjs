/**
 * recheck-frontier-backfill.mjs — job j-20260906-18's re-execution of the
 * DESK-ORDER-001 §1 backfill check, captured to a transcript.
 *
 * It does not re-implement the check. It SPAWNS
 * `tools/check-frontier-backfill.mjs` — the gate j-20260906-17 committed, which
 * hands every post's front matter to the real `postSchema` — and writes its
 * stdout, stderr and exit status verbatim into
 * `data/reviews/evidence/verify-frontier-backfill-recheck.raw.txt`, so the
 * record in the evidence file beside it is a transcription of a run.
 *
 * It then answers, from the tree rather than from memory, the two questions
 * this re-judgment turned on that the first pass did not print: how many post
 * files exist now (a backfill is only complete against the corpus it ran on),
 * and whether `content/blog/` has changed since the backfill commit.
 *
 * Run: node D:/AddictedtoAI/tools/recheck-frontier-backfill.mjs
 * Exit 1 if the spawned check fails.
 */
import { spawnSync } from 'node:child_process';
import { readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = [];
const say = (s = '') => {
  out.push(s);
  console.log(s);
};

const run = (label, cmd, args) => {
  say(`$ ${label}`);
  const r = spawnSync(cmd, args, { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  say((r.stdout ?? '').trimEnd());
  if (r.stderr && r.stderr.trim()) say(`[stderr] ${r.stderr.trim()}`);
  say(`exit=${r.status}`);
  say('');
  return r.status;
};

say('# job j-20260906-18 — re-execution of the DESK-ORDER-001 §1 backfill check');
say(`# node ${process.version}, ${new Date().toISOString()}`);
say('');

const code = run(
  'node tools/check-frontier-backfill.mjs',
  process.execPath,
  [path.join(root, 'tools/check-frontier-backfill.mjs')],
);

// The corpus the backfill ran on, re-counted. A decision table that matched a
// 16-file corpus says nothing about a 17th file.
const posts = readdirSync(path.join(root, 'content/blog'))
  .filter((f) => f.endsWith('.md') && f !== 'README.md')
  .sort();
say(`# content/blog/ holds ${posts.length} post file(s) (README.md excluded)`);
say(posts.join('\n'));
say('');

// Has anything under content/blog/ moved since the backfill landed? If it has,
// the committed decision table is a claim about a corpus that no longer exists.
run('git log --oneline 78625a5..HEAD -- content/blog', 'git', [
  '-C', root, 'log', '--oneline', '78625a5..HEAD', '--', 'content/blog',
]);
run('git diff --stat 78625a5..HEAD -- content/blog', 'git', [
  '-C', root, 'diff', '--stat', '78625a5..HEAD', '--', 'content/blog',
]);

writeFileSync(
  path.join(root, 'data/reviews/evidence/verify-frontier-backfill-recheck.raw.txt'),
  out.join('\n') + '\n',
  'utf8',
);
process.exit(code === 0 ? 0 : 1);
