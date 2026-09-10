// A SUITE RUNNER THAT CANNOT BE SILENTLY NARROWED.
//
// Built 2026-09-10 05:07 after A2AI-Orch measured the hole in the shape every
// verifier I have written tonight relies on. Three facts, its measurements:
//
//   * `NODE_OPTIONS=--test-name-pattern=alpha` is honoured by the Node test
//     runner and is INDISTINGUISHABLE from the CLI form. A process that inspects
//     its own command line sees a clean command line. `npm test` shells through
//     npm, so `npm_config_node_options` is a second door to the same room.
//   * THE EXCLUDED TEST IS NOT COUNTED AS SKIPPED. `cancelled`, `skipped` and
//     `todo` all stay at zero. A filtered run is not a run with skips — it is a
//     run that never collected the test, and the two differ at the counter.
//   * Therefore every guard built on those three counters is blind to it.
//
// MY OWN AGREEMENT CHECK WAS BLIND FOR A REASON WORTH KEEPING. I asserted that
// `pass === tests` whenever nothing failed, which catches a test that was
// collected and did not run. Under a filter `tests` FALLS TOO, so the equality
// holds perfectly on a suite that looked at one test out of twenty-five. The
// check compared the run against itself.
//
//   A DENOMINATOR TAKEN FROM THE SAME RUN AS THE NUMERATOR CANNOT SEE A RUN
//   THAT WAS NARROWED BEFORE IT STARTED.
//
// So the denominator has to come from OUTSIDE the run: `expectTests` is passed
// in by the caller from a number it read at a moment it can name, and a run that
// collects a different count REFUSES rather than reporting.
//
// The environment pins are fatal rather than merely reported, and the argument
// is TZ's: unset is the only correct state for a measurement, so any value at
// all is fatal. A pin that is "usually harmless" is one nobody checks.
import { execFileSync } from 'node:child_process';

const FATAL_PINS = ['NODE_OPTIONS', 'npm_config_node_options', 'NODE_TEST_NAME_PATTERN'];

export function requireCleanEnv(extra = []) {
  const checked = [...FATAL_PINS, ...extra];
  const set = checked.filter((k) => process.env[k] !== undefined && process.env[k] !== '');
  if (set.length > 0) {
    throw new Error(
      `REFUSED: behaviour-altering environment pin(s) set — ${set.map((k) => `${k}=${process.env[k]}`).join(', ')}\n`
      + 'Unset is the only correct state for a measurement. A filtered run reports success and counts nothing as skipped.',
    );
  }
  // THE DENOMINATOR, added 05:19 after A2AI-Orch found the same defect in its
  // own version. This used to print "3 pins checked, none set" — a NUMERATOR
  // WITH NO DENOMINATOR, whose silence about variable four is indistinguishable
  // from variable four not existing.
  //
  // The provenance is what condemns a hand-written pin list: every name on it
  // is there because something already went wrong with that name, and
  // NODE_OPTIONS arrived tonight only because a peer measured it. A list built
  // that way is a record of past incidents wearing the shape of a check, and it
  // is the candidate-pool defect exactly — nobody wrote down what it excluded,
  // so nothing shows what is missing.
  //
  // Printing the population does not close that. It makes the gap VISIBLE,
  // which is the most an enumerated list can honestly offer, and it is why the
  // line says "of" rather than stopping at the count.
  const population = Object.keys(process.env).length;
  console.error(`env check: ${checked.length} pins checked of ${population} variables present, none set — the other ${population - checked.length} are unexamined, not known-clean`);
}

/**
 * @param {object} o
 * @param {string} o.tree        working directory for the run
 * @param {string} o.file        the test file
 * @param {number} o.expectTests the collected count, read from OUTSIDE this run
 */
export function makeRunner({ tree, file, expectTests }) {
  if (!Number.isInteger(expectTests) || expectTests <= 0) {
    throw new Error('REFUSED: expectTests must be a positive integer read from outside the run — without it a narrowed suite is invisible');
  }
  return function run(extra = [], env = {}, { allowCountChange = false } = {}) {
    let out = '';
    try {
      out = execFileSync(process.execPath, ['--test', '--test-reporter=tap', ...extra, file], {
        cwd: tree, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: { ...process.env, ...env },
      });
    } catch (e) { out = `${e.stdout ?? ''}${e.stderr ?? ''}`; }
    const num = (n) => {
      const m = out.match(new RegExp(`^# ${n} (\\d+)$`, 'm'));
      if (!m) throw new Error(`REFUSED: no "${n}" counter — nothing was measured.\n${out.slice(0, 400)}`);
      return Number(m[1]);
    };
    const tests = num('tests'); const pass = num('pass'); const fail = num('fail');
    // The outside denominator. A mutation that legitimately adds or removes a
    // test passes `allowCountChange` and says so in its own output, so the
    // exception is visible rather than built into the runner.
    if (!allowCountChange && tests !== expectTests) {
      throw new Error(`REFUSED: collected ${tests} tests, expected ${expectTests}. A narrowed suite reports success and counts nothing as skipped.`);
    }
    if (fail === 0 && pass !== tests) throw new Error(`REFUSED: ${tests} collected, ${pass} passed, 0 failed`);
    return { tests, pass, fail, failed: [...out.matchAll(/^not ok \d+ - (.+?)(?:\s*#.*)?$/gm)].map((m) => m[1].trim()) };
  };
}
