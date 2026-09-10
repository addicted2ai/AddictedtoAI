// TAKE THE DELIBERATE EARLY SNAPSHOT — §7m, mechanised.
//
// §7m: "a report is finished when the process that writes it has left the
// process table, and the file's own contents can never establish this." The
// corollary that costs one file copy: a coordinator who copies the review file
// ONCE, EARLY — the moment it first appears — holds a cheap independent anchor
// against which "section 1 was never edited afterwards" becomes a MEASUREMENT
// rather than an attestation.
//
// Doing that by hand worked once (05:16:47, REVIEW3.md at 731 bytes) but it
// worked because I happened to look at the right moment. A RULE THAT NEEDS ME TO
// GLANCE AT THE RIGHT MINUTE IS A RULE THAT DECAYS TO ITS CHEAPER HALF — so the
// glance became a poll.
//
// ---------------------------------------------------------------------------
// THE HOLE THAT POLLING INTRODUCED, named by A2AI-Orch at 05:42 and real.
//
// The first version copied at "first sighting" and could not tell a file that
// APPEARED AFTER ARMING from one that WAS ALREADY THERE. Those are opposite
// facts wearing the same observation. An anchor taken from a file that predates
// the watch is not an early copy of this round's report — it is a copy of
// whatever the previous round left behind, and it would later "prove" section 1
// unchanged by comparing a stale document against itself, or produce a diff so
// wrong it discredits the instrument.
//
// It nearly bit at 05:31:33. The lease watcher fired thirty seconds after
// dispatch, which is fast for a written section 1, and the only thing that
// established the anchor was genuine was that I OPENED IT AND READ IT. That is
// the manual glance again, one level up, in the mechanism built to remove it.
//
// Orch's framing is the general one and it is 7r pointed at my own verifier:
// this watcher had fired twice, both times on files that appeared normally, so
// its entire proof pool was the shape that passes. THE BRANCH THAT MATTERS IS
// THE ONE NOBODY HAS RUN.
//
// So arming is now a DECISION with four outcomes, made before any polling, and
// `armDecision` is exported so the decoy can reach every branch directly rather
// than by arranging the world and hoping.
import { existsSync, copyFileSync, statSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/**
 * Decide whether this watch may arm. Pure with respect to everything except the
 * two paths, which it reads itself — passing in booleans would leave the
 * existsSync wiring untested, and the wiring is half of what can be wrong.
 *
 * @returns {{ok: boolean, code: number, message: string}}
 */
export function armDecision(watchPath, snapPath) {
  const watchThere = existsSync(watchPath);
  const snapThere = existsSync(snapPath);
  if (snapThere) {
    return {
      ok: false,
      code: 3,
      message: `REFUSED: ${snapPath} already exists.\n`
        + 'This never overwrites an anchor — a second copy is a later draft wearing the\n'
        + 'anchor\'s name, which is the precise failure the anchor exists to rule out.',
    };
  }
  if (watchThere) {
    const { size, mtime } = statSync(watchPath);
    return {
      ok: false,
      code: 5,
      message: `REFUSED: ${watchPath} ALREADY EXISTS at arm time — ${size} bytes, last written ${mtime.toLocaleString()}.\n`
        + 'There is no first sighting left to catch: whatever this file is, it predates the\n'
        + 'watch. Copying it now would produce an "early anchor" that is either the previous\n'
        + 'round\'s leftover or a draft already in progress, and both would later be read as\n'
        + 'evidence about ordering that they cannot support.\n'
        + 'Remove or rename the existing file first, then arm. If it cannot be removed, the\n'
        + 'honest position is that THIS ROUND HAS NO ORDERING ANCHOR — say so rather than\n'
        + 'banking one that looks like it does.',
    };
  }
  return { ok: true, code: 0, message: `armed: ${watchPath} absent, ${snapPath} absent — a first sighting is still ahead` };
}

// RUN THE CLI ONLY WHEN EXECUTED DIRECTLY. Without this the module could not be
// imported at all — the decoy's very first run died on this file's own usage
// message. That is not an incidental bug: A MECHANISM THAT CANNOT BE IMPORTED
// CANNOT BE TESTED EXCEPT BY RUNNING THE WHOLE THING, AND A CHECK THAT COSTS A
// THREE-HOUR WATCH TO EXERCISE IS ONE NOBODY EXERCISES. The untestability and
// the untested branch were the same fact.
if (import.meta.url !== pathToFileURL(process.argv[1] ?? '').href) {
  // imported, not run — export surface only
} else {
  main();
}

function main() {
const [, , watchPath, snapPath] = process.argv;
if (!watchPath || !snapPath) {
  console.error('usage: node arch-early-snapshot.mjs <file-to-watch> <snapshot-destination>');
  process.exit(2);
}

const decision = armDecision(watchPath, snapPath);
if (!decision.ok) {
  console.error(decision.message);
  process.exit(decision.code);
}

const stamp = () => new Date().toLocaleTimeString('en-GB', { hour12: false });
const started = Date.now();
const DEADLINE_MS = 3 * 60 * 60 * 1000;
const POLL_MS = 5000;

let taken = null;
const log = [];
const note = (s) => { console.log(s); log.push(s); };

note(`watching ${watchPath} from ${stamp()} — ${decision.message}`);

const tick = () => {
  if (existsSync(watchPath)) {
    const size = statSync(watchPath).size;
    if (!taken) {
      // Copy FIRST, measure after. Measuring first and copying second leaves a
      // window in which the bytes recorded are not the bytes copied.
      copyFileSync(watchPath, snapPath);
      const snapped = statSync(snapPath).size;
      taken = { at: stamp(), sawBytes: size, snapBytes: snapped };
      note(`SNAPSHOT ${taken.at} — file first seen at ${size} bytes, copied ${snapped} bytes to ${snapPath}`);
      if (snapped !== size) note(`  (the two differ: the writer was mid-write. That is fine and is the point — the anchor is whatever existed at ${taken.at}, not a clean draft.)`);
      return;
    }
    if (size !== taken.sawBytes) {
      note(`  ${stamp()} still growing: ${size} bytes (anchor holds ${taken.snapBytes})`);
      taken.sawBytes = size;
    }
  }
  if (Date.now() - started > DEADLINE_MS) {
    note(`${stamp()} deadline reached; ${taken ? 'anchor taken' : 'FILE NEVER APPEARED — no anchor, and the ordering claim stays an attestation'}`);
    writeFileSync(`${snapPath}.watch-log.txt`, log.join('\n') + '\n', 'utf8');
    process.exit(taken ? 0 : 4);
  }
  setTimeout(tick, POLL_MS);
};
tick();
}
