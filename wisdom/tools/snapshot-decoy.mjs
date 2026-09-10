// THE NEGATIVE CONTROL THE WATCHER SHIPPED WITHOUT.
//
// A2AI-Orch, 05:42, after finding the same thing in its own verifier: "a
// verifier run only against artifacts a generator just produced correctly has a
// proof pool of exactly one shape, and it is the shape that passes." My watcher
// had fired twice, both on files that appeared normally after arming. That is
// one shape. The branch that decides whether the anchor means anything — the
// file ALREADY BEING THERE when the watch arms — had never been run.
//
// Four arms, and the two that refuse are the point. A TWIN PROVES A CHECK CAN
// FIRE, ONLY A MUTATION PROVES IT MUST, so arm E re-runs the pre-existing-file
// arm with the check removed and shows the old code accepting it — otherwise
// "it refuses" is a claim about a branch nobody has watched go the other way.
import { mkdtempSync, writeFileSync, rmSync, existsSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { armDecision } from './early-snapshot.mjs';

const arms = [];
const arm = (name, setup, want) => arms.push({ name, setup, want });

arm('A  both absent — a first sighting is still ahead, so it arms',
  (d) => ({ watch: join(d, 'REVIEW.md'), snap: join(d, 'anchor.md') }),
  { ok: true });

arm('B  WATCHED FILE ALREADY EXISTS — the branch that had never run',
  (d) => {
    const watch = join(d, 'REVIEW.md');
    writeFileSync(watch, '# stale REVIEW3 left by the previous round\n', 'utf8');
    return { watch, snap: join(d, 'anchor.md') };
  },
  { ok: false, code: 5 });

arm('C  anchor already banked — never overwrite an anchor',
  (d) => {
    const snap = join(d, 'anchor.md');
    writeFileSync(snap, '# an anchor taken earlier\n', 'utf8');
    return { watch: join(d, 'REVIEW.md'), snap };
  },
  { ok: false, code: 3 });

arm('D  BOTH present — the anchor refusal must win, it is the older commitment',
  (d) => {
    const watch = join(d, 'REVIEW.md');
    const snap = join(d, 'anchor.md');
    writeFileSync(watch, '# stale\n', 'utf8');
    writeFileSync(snap, '# anchor\n', 'utf8');
    return { watch, snap };
  },
  { ok: false, code: 3 });

let pass = 0;
let fail = 0;
for (const a of arms) {
  const dir = mkdtempSync(join(tmpdir(), 'arch-snap-'));
  const { watch, snap } = a.setup(dir);
  const got = armDecision(watch, snap);
  const ok = got.ok === a.want.ok && (a.want.code === undefined || got.code === a.want.code);
  if (ok) pass++; else fail++;
  console.log(`${ok ? 'ok  ' : 'NOT OK'} ${a.name}`);
  console.log(`       -> ok=${got.ok} code=${got.code}  ${got.message.split('\n')[0]}`);
  // An anchor must never be written by a refusal. Checked rather than assumed,
  // because a refusal that has already copied the file has not refused anything.
  const wroteAnchor = existsSync(snap) && !a.name.startsWith('C') && !a.name.startsWith('D');
  if (!got.ok && wroteAnchor) { console.log('       NOT OK — a refusal left an anchor behind'); fail++; pass--; }
  rmSync(dir, { recursive: true, force: true });
}

// ARM E — THE MUTATION. Reimplement arming WITHOUT the pre-existing-file check
// and show that the stale file from arm B sails straight through and gets
// copied. This is what the watcher did until 05:45 and it is why arm B's
// refusal is load-bearing rather than decorative.
{
  const dir = mkdtempSync(join(tmpdir(), 'arch-snap-'));
  const watch = join(dir, 'REVIEW.md');
  const snap = join(dir, 'anchor.md');
  writeFileSync(watch, '# stale REVIEW3 left by the previous round\n', 'utf8');
  const withoutTheCheck = (w, s) => (existsSync(s) ? { ok: false, code: 3 } : { ok: true, code: 0 });
  const old = withoutTheCheck(watch, snap);
  const now = armDecision(watch, snap);
  const demonstrated = old.ok === true && now.ok === false;
  console.log(`${demonstrated ? 'ok  ' : 'NOT OK'} E  MUTATION — arming with the pre-existing-file check removed`);
  console.log(`       without the check: ok=${old.ok} -> would have copied ${statSync(watch).size} stale bytes and called them the anchor`);
  console.log(`       with the check:    ok=${now.ok} code=${now.code}`);
  if (demonstrated) pass++; else fail++;
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\narms ${arms.length + 1}  pass ${pass}  fail ${fail}`);
if (fail > 0) process.exit(1);
