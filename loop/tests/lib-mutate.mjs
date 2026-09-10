/**
 * lib-mutate.mjs — mutual exclusion for tests that mutate
 * `loop/lib/brief.mjs` on disk and revert it byte-identical.
 *
 * Why this exists: `node --test` runs test FILES in parallel
 * subprocesses, and two files (`brief-reconcile.test.mjs` since item
 * 2b, `brief-required.test.mjs` since item 3a) read-modify-write-revert
 * the SAME tree file. One file's mutation window deletes the other
 * file's anchor string, so the other file's `anchor present` assertion
 * fails — a red that reads as a real defect and is not (measured on
 * the 3a merge gate: 2032/2033, the single red `mutation anchor
 * present` at 1.3ms). Within one file tests run sequentially, so only
 * the cross-file window needs the lock; every file-mutation block in
 * both files holds it from the pre-mutation read to the reverted
 * byte-identical assert.
 *
 * The lock is a directory under the OS temp dir (mkdir is atomic: one
 * holder wins, the rest see EEXIST). A holder runs for ~2s at most, so
 * a lock older than STALE_MS is a dead holder's and is reclaimed
 * rather than waited on forever.
 */
import { mkdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const LOCK_DIR = join(tmpdir(), 'atai-brief-lib-mutation-lock');
const STALE_MS = 120_000;
const WAIT_MS = 25;

export async function withLibMutation(fn) {
  const start = Date.now();
  for (;;) {
    let acquired = false;
    try {
      await mkdir(LOCK_DIR);
      acquired = true;
    } catch (err) {
      if (err && err.code !== 'EEXIST') throw err;
    }
    if (!acquired) {
      try {
        const st = await stat(LOCK_DIR);
        if (Date.now() - st.mtimeMs > STALE_MS) {
          await rm(LOCK_DIR, { recursive: true, force: true });
          continue;
        }
      } catch {
        continue; // vanished between calls — retry immediately
      }
      if (Date.now() - start > STALE_MS) {
        throw new Error(
          'withLibMutation: lock not acquired within budget — a holder is stuck',
        );
      }
      await new Promise((r) => setTimeout(r, WAIT_MS));
      continue;
    }
    try {
      return await fn();
    } finally {
      await rm(LOCK_DIR, { recursive: true, force: true });
    }
  }
}
