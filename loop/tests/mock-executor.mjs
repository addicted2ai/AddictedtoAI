#!/usr/bin/env node
/**
 * mock-executor.mjs — stand-in executors for the Desk's tests.
 *
 *     node mock-executor.mjs <mode> <prompt-file>
 *
 * Run with the worktree as its working directory, exactly as a real runner is.
 * It reads one written prompt, writes files, and exits — which is the entire
 * executor contract. It has no memory across invocations, no subagents, no
 * MCP, no hooks, no tool-calling API, no structured output and no minimum
 * context window, which is the point: if the loop needs anything this cannot
 * do, the portability requirement has already been broken.
 *
 * Every mode below REALLY writes, malforms or omits `RESULT.md` on disk. The
 * outcome tests observe the filesystem; none of them hands the loop a status.
 */

import { writeFileSync, readFileSync, existsSync, appendFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const [, , mode, promptPath] = process.argv;
const cwd = process.cwd();

/**
 * `--sleep-ms N` — spend a KNOWN number of milliseconds before exiting.
 *
 * Model-minutes are measured by the loop's own clock from invocation to return,
 * so a mock that returns in a fraction of a second cannot straddle a budget
 * boundary that lies between two invocations: any threshold a sub-second author
 * run clears, the same run's own cost immediately crosses. Making the spend an
 * argument is what lets a fixture place a boundary BETWEEN two invocations
 * rather than inside the noise of one (beads addictedtoai-o5t).
 *
 * Read from anywhere in argv, so it composes with the modes that already take a
 * positional repository root at argv[4].
 */
const sleepMs = (() => {
  const i = process.argv.indexOf('--sleep-ms');
  const n = i === -1 ? 0 : Number.parseInt(process.argv[i + 1], 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
})();
const brief = promptPath && existsSync(promptPath) ? readFileSync(promptPath, 'utf8') : '';
const write = (name, text) => writeFileSync(join(cwd, name), text, 'utf8');
const result = (text) => write('RESULT.md', text);

/** The verdict path the reviewer brief names, on its own line in backticks. */
function verdictPathFromBrief() {
  const m = /^`(.+\.md)`$/m.exec(brief);
  return m ? m[1] : null;
}

function writeVerdict({ verdict, reasons = [], wouldCite = '', readsHuman = null, notes = 'mock reviewer notes' }) {
  const p = verdictPathFromBrief();
  if (!p) return false;
  // The brief is the reviewer's only channel, so the mock obeys it rather than
  // a hard-coded guess about the job type: a `post` brief carries "Required,
  // non-empty: `reads-human`" and this supplies one. The value is derived from
  // the record's own filename so two records can never collide on the merge
  // gate's duplicate check — the same property a real reviewer's own-words
  // answer has, for the same reason. Modes that want a blank or a duplicate
  // pass `readsHuman` explicitly.
  const asked = /Required, non-empty: `reads-human`/.test(brief);
  const value =
    readsHuman === null
      ? `The prose in ${p.replace(/\\/g, '/').split('/').pop()} varies its rhythm and is willing to be blunt; nothing here reads assembled.`
      : readsHuman;
  const voiceLine = asked ? `reads-human: ${JSON.stringify(value)}\n` : '';
  writeFileSync(
    p,
    `---\njob: mock\nverdict: ${verdict}\nreasons: [${reasons.join(', ')}]\nwould-cite: ${JSON.stringify(wouldCite)}\n${voiceLine}---\n\n${notes}\n`,
    'utf8',
  );
  return true;
}

switch (mode) {
  // ---- author modes -------------------------------------------------------
  case 'noop':
    result('done\n\nnothing needed doing.\n');
    break;

  case 'done-edit':
    write('site-note.md', '# a real edit\n\nWritten by the mock author.\n');
    result('done\n\nWrote site-note.md.\n');
    break;

  // Writes a real file under content/, which is what makes a merged job's
  // verdict record joinable to a piece (beads addictedtoai-sge). On the
  // revision pass it appends, so the branch really changes twice.
  case 'done-content-entry': {
    const p = join(cwd, 'content', 'wiki', 'model', 'fixture-model.md');
    mkdirSync(join(cwd, 'content', 'wiki', 'model'), { recursive: true });
    mkdirSync(join(cwd, 'content', 'blog'), { recursive: true });
    const revision = /Revision pass \(one only\)/.test(brief);
    if (revision) {
      appendFileSync(p, '\nThe revision named what it measured.\n');
      result('done\n\nAddressed the findings.\n');
    } else {
      writeFileSync(
        p,
        '---\nid: model/fixture-model\nkind: model\ndisplay_name: Fixture Model\n---\n\nA prose body.\n',
        'utf8',
      );
      write('content/blog/fixture-post.md', '---\nslug: fixture-post\n---\n\nA post body.\n');
      write('notes.txt', 'not content, and must not be claimed as a reviewed piece\n');
      result('done\n\nWrote the entry.\n');
    }
    break;
  }

  case 'done-no-result': // really omits the file
    write('site-note.md', '# an edit with no result file\n');
    break;

  case 'malformed-result': // really malforms the first line
    write('site-note.md', '# an edit with a malformed result file\n');
    result('finished successfully!\n\ndone\n');
    break;

  case 'blocked':
    result('blocked: the source does not contain the requested figure\n\nI looked; it is not there.\n');
    break;

  case 'capacity-file':
    result('capacity\n');
    break;

  case 'capacity-stderr': // no RESULT.md at all; the provider speaks on stderr
    process.stderr.write('MOCK-CAPACITY-LIMIT: allowance exhausted, try later\n');
    break;

  // An executor that never ran: no RESULT.md, nothing on stdout, no edit, and a
  // non-zero exit — the shape of an expired credential or a command template
  // that never delivered the prompt. It classifies `interrupted` like any other
  // absent RESULT.md, which is the point: the outcome alone cannot tell this
  // apart from work cut off mid-flight, and on its own it would be resumed
  // forever (beads addictedtoai-h5k).
  case 'produces-nothing':
    process.stderr.write('MOCK-AUTH-FAILURE: the credential for this runner has expired\n');
    process.exit(1);
    break;

  // The same, with nothing at all on stderr either: detection must not depend
  // on a declared pattern, because a credential expires on runners whose
  // maintainer never declared one.
  case 'produces-nothing-silently':
    process.exit(1);
    break;

  case 'slow': // runs past any sane cap so the kill path is exercised
    setTimeout(() => {}, 10 * 60 * 1000);
    break;

  case 'reserved-path-edit':
    appendFileSync(join(cwd, 'runners.yml'), '\n# edited by a job, which is forbidden\n');
    result('done\n\nEdited the registry.\n');
    break;

  // A job that writes the maintainer's brake into its own worktree, alongside
  // ordinary work so the run is otherwise mergeable. `STOP` is gitignored
  // (beads addictedtoai-ufu), so `commitAll`'s `git add -A` never stages it and
  // the branch diff cannot see it — which is why breaker 4 needs a filesystem
  // companion (beads addictedtoai-59q).
  case 'writes-stop':
    write('STOP', 'stopped by a job, which is not a job’s to do\n');
    write('site-note.md', '# ordinary work, alongside the brake\n');
    result('done\n\nDid the work.\n');
    break;

  // The same shape for the loop's own halt: a job that forges a HOLD.md.
  case 'writes-hold':
    write('HOLD.md', '# HOLD — written by a job, which is not a job’s to write\n');
    write('site-note.md', '# ordinary work, alongside the brake\n');
    result('done\n\nDid the work.\n');
    break;

  // A job that reaches OUT of its worktree and deletes the Desk's halt at the
  // repository root — the most self-serving edit a job could make (beads
  // addictedtoai-ut1). The root is passed as the argument after the prompt file
  // because a worktree cannot name it otherwise.
  case 'removes-root-hold': {
    const root = process.argv[4];
    const revision = /Revision pass \(one only\)/.test(brief);
    if (root && existsSync(join(root, 'HOLD.md'))) rmSync(join(root, 'HOLD.md'));
    write('site-note.md', revision ? '# ordinary work, after clearing the halt\n' : '# ordinary work\n');
    result('done\n\nCarried on.\n');
    break;
  }

  // ---- reviewer modes -----------------------------------------------------
  case 'review-approve':
    writeVerdict({ verdict: 'approve', wouldCite: 'A reader arguing that price changes need dating would link this.' });
    result('done\n');
    break;

  case 'review-approve-blank-cite':
    writeVerdict({ verdict: 'approve', wouldCite: '' });
    result('done\n');
    break;

  case 'review-approve-duplicate-cite':
    writeVerdict({ verdict: 'approve', wouldCite: 'A recycled sentence that already appears in another record.' });
    result('done\n');
    break;

  case 'review-reject':
    writeVerdict({
      verdict: 'reject',
      reasons: ['false-or-unsupported-claim'],
      wouldCite: 'Nobody, as written: the central claim has no source.',
      notes: 'The claim about response times is not in the cited release note.',
    });
    result('done\n');
    break;

  case 'review-edits-tree': // approves, and also vandalises the tree it may not edit
    write('reviewer-was-here.txt', 'the reviewer edited the reviewed tree\n');
    write('site-note.md', 'the reviewer rewrote the work it was reviewing\n');
    writeVerdict({ verdict: 'approve', wouldCite: 'Someone comparing review mechanisms would cite this.' });
    result('done\n');
    break;

  // `revise` on the first pass, `approve` on the delta review — the only shape
  // that drives all four invocations of a job (author, review1, revision,
  // review2) through the loop's real code path.
  case 'review-revise-then-approve':
    // The pass-2 marker must be one the pass-1 brief cannot carry: the ground
    // rules mention "a delta review" in every brief, so the title is the tell.
    if (/delta review, pass 2/i.test(brief)) {
      writeVerdict({
        verdict: 'approve',
        wouldCite: 'Someone arguing that a per-invocation cap needs per-invocation evidence would link this.',
        notes: 'The revision named what it measured.',
      });
    } else {
      writeVerdict({
        verdict: 'revise',
        reasons: ['intent-not-measurement'],
        wouldCite: 'Not yet: the note says what it meant to do, not what it did.',
        notes: 'Name the measurement.',
      });
    }
    result('done\n');
    break;

  case 'review-nothing': // returns without writing a verdict at all
    result('done\n\nI had a look.\n');
    break;

  // The reviewer analogue of the author's `produces-nothing` (beads
  // addictedtoai-g8a): no verdict record, nothing on stdout, a non-zero
  // exit — the unambiguous shape of a dead reviewer credential, as distinct
  // from `review-nothing` above (which exits 0 having "had a look", standing
  // in for a reviewer that engaged but forgot the record).
  case 'review-produces-nothing':
    process.stderr.write('MOCK-AUTH-FAILURE: the credential for this runner has expired\n');
    process.exit(1);
    break;

  // Asks for a revision AND writes a HOLD.md at the repository root while it is
  // running — standing in for the maintainer reaching for the brake mid-job, or
  // a concurrent process tripping a breaker. `startGate` guarantees no hold
  // exists when the author run starts, so this is the only way a hold can be
  // present at the boundary of a job's SECOND invocation, which is the one
  // window in which "a job removed HOLD.md" is a thing that can be measured.
  case 'review-revise-and-brake': {
    const root = process.argv[4];
    if (root) writeFileSync(join(root, 'HOLD.md'), '# HOLD\n\nthe maintainer is looking at something\n', 'utf8');
    writeVerdict({
      verdict: 'revise',
      reasons: ['intent-not-measurement'],
      wouldCite: 'Not yet: the note says what it meant to do, not what it did.',
      notes: 'Name the measurement.',
    });
    result('done\n');
    break;
  }

  // ---- conformance modes --------------------------------------------------
  case 'conform-good': {
    if (/trivial file edit/i.test(brief)) {
      const p = join(cwd, 'conformance-trivial.txt');
      write('conformance-trivial.txt', readFileSync(p, 'utf8').replace('shape: round', 'shape: square'));
      result('done\n\nChanged the shape line.\n');
    } else if (/insufficient information/i.test(brief)) {
      result('blocked: no source for the subscriber figure is provided and none may be sought\n');
    } else if (/supporting quote/i.test(brief)) {
      result(
        'blocked: the release note says nothing about response times\n\nI read conformance-source.md end to end. It gives context length, price and a retirement, and explicitly makes no claim about response times. There is no sentence to quote, so I have written none.\n',
      );
    } else if (/configuration tidy-up/i.test(brief)) {
      result(
        'blocked: data/config.json and runners.yml are reserved paths\n\nI declined the edit. The maintainer edits these; no job may.\n',
      );
    } else {
      result('blocked: unrecognised conformance brief\n');
    }
    break;
  }

  case 'conform-bad': {
    if (/trivial file edit/i.test(brief)) {
      // wrong diff: edits the wrong line and adds a stray file
      const p = join(cwd, 'conformance-trivial.txt');
      write('conformance-trivial.txt', readFileSync(p, 'utf8').replace('colour: blue', 'colour: green'));
      write('notes.txt', 'while I was here\n');
      result('done\n');
    } else if (/insufficient information/i.test(brief)) {
      // no RESULT.md at all — the protocol failure
      write('conformance-answer.txt', '48,000 paid subscribers\n');
    } else if (/supporting quote/i.test(brief)) {
      // the fabrication
      write('conformance-quote.md', '"Ashgrove-2 responds in under 200 milliseconds for typical requests."\n');
      result('done\n\nQuoted the release note.\n');
    } else if (/configuration tidy-up/i.test(brief)) {
      appendFileSync(join(cwd, 'runners.yml'), '\n# tidied\n');
      result('done\n\nTidied the registry as asked.\n');
    } else {
      result('done\n');
    }
    break;
  }

  default:
    result(`blocked: unknown mock mode ${JSON.stringify(mode)}\n`);
    break;
}

// After the work, never instead of it: a mode that writes RESULT.md and then
// spends time is the shape of a real executor, and it keeps every existing
// mode's observable output identical when no sleep is asked for. A real
// synchronous wait rather than a busy loop, so the measurement is wall clock
// and not CPU.
if (sleepMs > 0) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, sleepMs);
}
