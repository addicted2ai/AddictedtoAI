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
 *
 * D7 — RULED 2026-08-31 (beads addictedtoai-pfv, the maintainer's delegated
 * decision). The question this file's own header leaves open ("is a refusal
 * enough?") is decided: no, not fully — a fifth breaker (design.md's Option B,
 * the narrowest form: `HOLD.md` when EVERY runner cleared for `author` is
 * refused, by conformance or by this module) remains the right target, for
 * the reason design.md gives — it is the only option under which total Desk
 * paralysis reaches the maintainer without a log read, and its firing
 * condition (measured 2026-08-31: 3 of 4 registered runners currently pass
 * conformance) is nowhere close to live today. It is NOT implemented here:
 * specs/loop's breaker list is closed ("No other condition halts the loop")
 * and `openspec/specs/` is reserved — writing the breaker into code before
 * the spec names it would make the code violate the CURRENT spec, which this
 * repository's guardrails exist to prevent regardless of direction. The
 * requirement text and the whole-registry usable-runner predicate (this
 * refusal is scoped to the two runners ONE invocation was given, not every
 * `author`-cleared entry in `runners.yml`) are filed as their own beads
 * issue, addictedtoai-8wm0, to be built once that spec change lands.
 *
 * What DID land, without waiting on the spec: `loop/run.mjs`'s `exitCodeFor()`
 * gives a refusal from this gate a distinct exit code (2) instead of the 0
 * every other outcome — including "nothing qualified" and a merged job — used
 * to share. It is a strictly narrower claim than the fifth breaker would be
 * (it says nothing about whether some OTHER runner in the registry is
 * healthy), but it needs no OpenSpec change, writes no `HOLD.md`, and is real
 * today: whatever schedules `node loop/run.mjs` and watches its exit code can
 * now tell a refusal apart from a working run without reading the log —
 * which was exactly the residual complaint this file's own header describes.
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
 * THE RESIDUAL GAP (beads addictedtoai-g8a, found by the clause-by-clause
 * audit that opened addictedtoai-pfv). A ledger LINE's own `runner` field
 * always names the AUTHOR of that Desk run — `run.mjs` writes it from the
 * `runner` variable, never the `reviewer` one — so a runner configured ONLY
 * as a reviewer never once appears as `l.runner`. Filtering on that field
 * alone, as this function used to, meant such a runner accrued no evidence at
 * all: its streak was permanently zero and the refusal specs/loop promises
 * "for the `author` and `reviewer` roles" could never fire for it.
 *
 * MEASURED before this fix, on a ledger with a healthy author and three lines
 * whose `phases` each carried a `review1` entry naming a reviewer id that
 * never appears at the line level: `noOutputStreak(ledger,
 * reviewerId).count === 0`.
 *
 * THE FIX READS `phases` TOO, which already carries what was missing —
 * per-invocation `runner` and `outcome` — because `phases` was added for an
 * unrelated reason (per-invocation budget caps, beads addictedtoai-59s) and
 * happens to be exactly the record this needed. Only the writer
 * (`run.mjs`'s `phase()`) needed one addition: a per-invocation `signal`
 * field, set on a `review*`-role phase the same way the line-level `signal`
 * is set for the author (see `reviewProducedNothing` in `result.mjs`) — the
 * reader below was the only other thing that had to change.
 *
 * WHY ONLY `review*`-ROLE PHASES ARE READ, not `author` or `revision` ones.
 * The author's own streak is, and remains, computed purely from the LINE
 * level (`l.runner` / `l.outcome` / `l.signal`) exactly as before — that is
 * the "author-side behaviour must be unchanged" bar, and it is met by never
 * touching that code path. Also reading the `author` and `revision` phase
 * entries for the author's own id would add a SECOND record per line for a
 * runner that already gets one from the line itself, changing what a streak
 * of "3" means for the author role. `review*` entries carry no such
 * duplicate: nothing else in a ledger line ever represents a reviewer
 * invocation, so adding them is pure gap-filling, not double-counting.
 *
 * WHY A MALFORMED VERDICT RECORD DOES NOT COUNT. `reviewProducedNothing`
 * (`result.mjs`) requires an ABSENT record, not merely a bad one: a
 * malformed `verdict:` field means a file was written, which is output, and
 * proves the runner ran. The streak exists to catch a runner that CANNOT run
 * at all (see the parent issue, addictedtoai-pfv) — a runner that writes a
 * bad verdict is a quality problem, and `mergeGate`'s `malformed-verdict`
 * code already fails that job, honestly, every time. Counting it toward this
 * streak would let one poorly-formed review start disabling a runner that
 * plainly works, which is a heavier and stickier consequence than the
 * quality problem it would be punishing.
 *
 * Only this runner's records are considered — a line-level one when this
 * runner served as author, plus any `review*`-role phase whose own `runner`
 * matches, in the order they actually happened (line order, and within a
 * line, phase order, since `phases` is pushed chronologically). Records
 * carrying a NON_RUN_OUTCOMES outcome are skipped (see its doc comment); any
 * remaining record without the signal ends the streak — a runner that
 * produced anything, in any role, is working, whatever the outcome of the
 * job was.
 */
function invocationsFor(ledger, runnerId) {
  const out = [];
  for (const l of ledger) {
    if (l.runner === runnerId) {
      out.push({ id: l.id, outcome: l.outcome, signal: l.signal });
    }
    if (Array.isArray(l.phases)) {
      for (const p of l.phases) {
        if (!/^review/.test(p.role ?? '')) continue; // author/revision: see doc comment above
        if (p.runner !== runnerId) continue;
        out.push({ id: l.id, outcome: p.outcome, signal: p.signal });
      }
    }
  }
  return out;
}

export function noOutputStreak(ledger, runnerId) {
  const mine = invocationsFor(ledger, runnerId);
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
