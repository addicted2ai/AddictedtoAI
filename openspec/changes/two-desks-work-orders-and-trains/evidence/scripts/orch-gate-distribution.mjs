/**
 * orch-gate-distribution.mjs — turn ONE gate's single-sample calibration into a
 * distribution, for packet A task 1's new requirement that a calibration record
 * the number of runs behind each figure.
 *
 * ONLY verify-surfaces. Verified first that neither verify-surfaces nor
 * verify-design references buildLock / BUILD_LOCK / TEST_LOCK, so this takes no
 * machine-wide lock and cannot collide with Luna-Boss-2's revision worker.
 * verify-design is excluded anyway because it binds a port; npm test and
 * npm run build are excluded because they DO take the lock.
 *
 * It reads the existing out/ and does not build. If out/ is stale the checks may
 * fail — that is a fact about this export, not about the gate, and the runtimes
 * are still the measurement being taken.
 */
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

const ROOT = 'D:/AddictedtoAI';
const RUNS = 5;
const RECORDED = 3.7; // seconds, the single sample the calibration currently rests on

const runs = [];
for (let i = 0; i < RUNS; i += 1) {
  const t0 = performance.now();
  const r = spawnSync(process.execPath, ['scripts/verify-surfaces.mjs', 'out'], {
    cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  });
  const secs = (performance.now() - t0) / 1000;
  runs.push({ secs, status: r.status });
  console.log(`  run ${i + 1}: ${secs.toFixed(2)}s  exit ${r.status}`);
}

const secs = runs.map((r) => r.secs).sort((a, b) => a - b);
const statuses = [...new Set(runs.map((r) => r.status))];
const min = secs[0];
const max = secs[secs.length - 1];
const median = secs[Math.floor(RUNS / 2)];
const mean = secs.reduce((a, b) => a + b, 0) / RUNS;

console.log(`\nverify-surfaces over ${RUNS} runs, exit codes ${JSON.stringify(statuses)}`);
console.log(`  min ${min.toFixed(2)}s  median ${median.toFixed(2)}s  mean ${mean.toFixed(2)}s  max ${max.toFixed(2)}s`);
console.log(`  spread max/min ${(max / min).toFixed(2)}x`);
console.log(`  the single recorded sample was ${RECORDED}s — that is ${(RECORDED / min).toFixed(2)}x the observed MINIMUM`);
console.log(`\n  a floor at 25% of the recorded sample = ${(RECORDED * 0.25).toFixed(2)}s`);
console.log(`  as a fraction of the observed MINIMUM that is ${((RECORDED * 0.25) / min * 100).toFixed(0)}% — the margin actually in hand`);
