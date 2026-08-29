/**
 * health.mjs — runtime evidence that a runner cannot run at all.
 *
 * THE DEFECT THIS EXISTS FOR (beads addictedtoai-h5k, found by running the
 * loop, not by testing it). An expired credential made an executor exit in
 * seconds with `401 token_expired` and no `RESULT.md`. That classifies
 * `interrupted` — correctly, per specs/loop — and `interrupted` is not a
 * failure: the branch is kept, it is resumable, it is picked up oldest-first
 * before new work, no retry is consumed, and breaker 1 counts only `failed`
 * and `discarded`. So the Desk would resume the same branch forever, halting
 * nothing and telling nobody, until the 14-day abandon rule eventually
 * discarded it. The mechanism green, the outcome absent.
 *
 * WHAT THIS DOES, AND WHAT IT DELIBERATELY DOES NOT DO.
 *
 * It does not reclassify the run: specs/loop says an absent `RESULT.md` after
 * the process exited IS `interrupted`, and a guardrail is not relaxed to make a
 * symptom go away. It does not write `HOLD.md` either, and that is the one
 * thing a reader might expect: specs/loop names exactly four breakers and says
 * "No other condition halts the loop". A fifth breaker would need an OpenSpec
 * change, so this stops short of one and the conflict is reported rather than
 * quietly taken.
 *
 * What it does is the thing specs/loop ALREADY does for a runner that cannot be
 * trusted: refuse it. "A combination with any FAIL SHALL NOT be used for
 * `author` or `reviewer` roles" — conformance's consequence is refusal, not a
 * halt, and this is the same consequence from runtime evidence rather than from
 * a suite the maintainer has to remember to run. The issue's own note is that
 * conformance already catches this and is simply not on a schedule; a
 * credential that expires AFTER a passing conformance run reaches the spin.
 * After this, it reaches a printed refusal naming the cause and the command
 * that clears it, on every subsequent run, instead of an invisible loop.
 *
 * The state is computed from `data/ledger.jsonl`, like every other predicate in
 * this design. Nothing is stored.
 */

/**
 * How many consecutive runs a runner may produce nothing at all before it is
 * refused. Three, matching specs/loop's own "three consecutive" idiom for
 * breaker 1: enough to tell a dead credential from one bad invocation, few
 * enough that a dead one is caught the same day.
 */
export const NO_OUTPUT_STREAK_LIMIT = 3;

/** The ledger `signal` value a run that produced nothing carries. */
export const NO_OUTPUT_SIGNAL = 'no-output';

/**
 * Outcomes whose ledger line records no invocation at all.
 *
 * `abandoned` is written by the 14-day sweep in `run.mjs`, not by a run: it
 * carries the last line's runner id, zero model-minutes and no signal, because
 * no process was started. The streak below asks "did this runner produce
 * anything?", and the honest answer for a sweep line is "this line is not
 * evidence either way" — the sweep produced it; the runner did not.
 *
 * MEASURED before this was added: `noOutputStreak` on a ledger of
 * `[no-output, no-output, no-output, abandoned]` for one runner returned 0.
 * A dead runner leaves a resumable branch; after fourteen days the sweep writes
 * that line with the dead runner's own id, which reset the streak and bought
 * the dead runner roughly three more empty runs before the refusal re-fired.
 * Bounded and loudly logged, but it contradicted this module's own rule.
 *
 * These lines are SKIPPED — they neither count toward the streak nor end it.
 * That is the same treatment breaker 1 gives the outcomes that are not
 * failures ("they neither count nor reset", budget.mjs), and it is the strictly
 * STICKIER reading: refusal now survives a sweep instead of being cleared by
 * it. A guardrail is only ever moved in that direction.
 */
export const NON_RUN_OUTCOMES = Object.freeze(['abandoned']);

/**
 * Consecutive trailing runs on this runner that produced nothing at all.
 *
 * Only this runner's lines are considered, lines recording no invocation are
 * skipped (see NON_RUN_OUTCOMES), and any remaining line without the signal
 * ends the streak — a runner that produced anything is working, whatever the
 * outcome of the job was.
 */
export function noOutputStreak(ledger, runnerId) {
  const mine = ledger.filter((l) => l.runner === runnerId);
  let n = 0;
  const ids = [];
  for (let i = mine.length - 1; i >= 0; i--) {
    if (NON_RUN_OUTCOMES.includes(mine[i].outcome)) continue;
    if (mine[i].signal === NO_OUTPUT_SIGNAL) {
      n++;
      ids.push(mine[i].id);
    } else break;
  }
  return { count: n, ids };
}

/**
 * The runner-health gate. Same shape as conformanceGate(), and used in the same
 * two places, so a runner that cannot run is refused before a model is invoked
 * and before a branch is resumed.
 *
 * @returns {{ok: true, streak: number} | {ok: false, streak: number, rule: string, reason: string}}
 */
export function runnerHealthGate(ledger, runnerId) {
  const { count, ids } = noOutputStreak(ledger, runnerId);
  if (count < NO_OUTPUT_STREAK_LIMIT) return { ok: true, streak: count };
  return {
    ok: false,
    streak: count,
    rule: 'runner:produced-nothing',
    reason:
      `runner "${runnerId}" produced nothing at all on its last ${count} runs ` +
      `(${[...new Set(ids)].join(', ')}): no RESULT.md, no output, and no diff on the branch. ` +
      `That is what a dead credential, a mis-assembled command template or an uninstalled ` +
      `harness looks like from here, and it is NOT a job failure — those runs classify ` +
      `\`interrupted\`, keep their branches resumable, and would otherwise be retried forever ` +
      `without halting anything. The runner is refused for this run. Verify it with ` +
      `\`node loop/conformance.mjs --runner ${runnerId}\`, fix what that reports, and the ` +
      `streak clears as soon as one run on this runner produces anything.`,
  };
}
