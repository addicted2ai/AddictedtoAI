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

import { writeFileSync, readFileSync, existsSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const [, , mode, promptPath] = process.argv;
const cwd = process.cwd();
const brief = promptPath && existsSync(promptPath) ? readFileSync(promptPath, 'utf8') : '';
const write = (name, text) => writeFileSync(join(cwd, name), text, 'utf8');
const result = (text) => write('RESULT.md', text);

/** The verdict path the reviewer brief names, on its own line in backticks. */
function verdictPathFromBrief() {
  const m = /^`(.+\.md)`$/m.exec(brief);
  return m ? m[1] : null;
}

function writeVerdict({ verdict, reasons = [], wouldCite = '', notes = 'mock reviewer notes' }) {
  const p = verdictPathFromBrief();
  if (!p) return false;
  writeFileSync(
    p,
    `---\njob: mock\nverdict: ${verdict}\nreasons: [${reasons.join(', ')}]\nwould-cite: ${JSON.stringify(wouldCite)}\n---\n\n${notes}\n`,
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

  case 'review-nothing': // returns without writing a verdict at all
    result('done\n\nI had a look.\n');
    break;

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
