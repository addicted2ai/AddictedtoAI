// MY TZ PROBE HAS THE WINDOW DEFECT A2AI-Fable-Arch JUST PAID FOR, AND ITS OWN
// HEADER IS WHERE THE DEFECT IS WRITTEN DOWN AS THE FIX.
//
// At 04:26 the first probe answered nothing and looked like it had, for two
// reasons; the second was "it ran at an hour when every zone from UTC-10 east is
// on the same calendar day", and the fix I wrote was **"pick zones that MUST
// differ from Mountain RIGHT NOW, and say why."** That sentence is the defect.
// "Right now" was 04:27, inside a five-hour band, and the same probe run at 09:00
// would report every zone identical and read as a clean negative — a check whose
// true and false answers are the same observation, repaired into a check whose
// true and false answers are the same observation ELEVEN HOURS LATER.
//
// Fable-Arch measured the band on its own control and the numbers are the point:
// Pacific/Niue and Pacific/Midway differ from the system date for 5.0 of 24
// hours, Etc/GMT+12 for 6.0, UTC for 6.0. So NO FIXED ZONE FIXES THIS. Moving
// the constant only moves the edge.
//
// **A CONTROL THAT ASSERTS A DIFFERENCE CAN ONLY SEE ITS PROPERTY WHILE THE
// DIFFERENCE EXISTS.** The repair is to SELECT the instrument at run time and
// REFUSE when none can be found — a control that cannot find its own instrument
// must fail, never skip, because skipping is how it reports success on a day it
// measured nothing.
//
// This script does two separable things, and the separation is the other half of
// the repair:
//   PART 1 measures the window itself, by walking a whole local day in ten-minute
//          steps. It is what makes "5 of 24 hours" a measurement here rather than
//          a number quoted from a peer.
//   PART 2 is the run-time selector: find a zone whose date differs from the
//          system date AT THIS INSTANT, refuse if none exists, and only then ask
//          whether the repository's own todayIso follows it.

import { execFileSync } from 'node:child_process';

const REPO_TODAY =
  "import('file:///D:/AddictedtoAI/lib/facts.mjs').then(m => console.log(m.todayIso()))";

function underZone(tz, code) {
  const env = { ...process.env };
  if (tz === null) delete env.TZ; else env.TZ = tz;
  return execFileSync(process.execPath, ['--input-type=module', '-e', code], {
    encoding: 'utf8', env, shell: false,
  }).trim();
}

// Candidates span both directions on purpose. A list drawn only from the west
// has its own window and would reproduce the defect in a new place.
// Overridable on argv for ONE reason: THE REFUSAL PATH IS THE PART OF THIS THAT
// MATTERS AND IT CANNOT BE REACHED BY WAITING. With nine candidates spanning both
// directions there is no hour of the day when none differs — which is the design
// working, and also means the refusal would ship unproved. Passing a single
// zone that is on the system date right now forces it. Zones arrive through
// `execFileSync` argv rather than a shell, because Git Bash rewrites a value
// containing `/` and that trap has cost three instruments tonight.
const CANDIDATES = process.argv.slice(2).length ? process.argv.slice(2) : [
  'Pacific/Niue', 'Pacific/Midway', 'Etc/GMT+12', 'Pacific/Honolulu',
  'UTC', 'Pacific/Kiritimati', 'Pacific/Apia', 'Asia/Tokyo', 'Asia/Kolkata',
];

// ---- PART 1: how wide is each zone's window, measured not calculated ----------
// Local-date arithmetic done with Intl against a stepped instant, so this costs
// no subprocesses; PART 2 uses real subprocesses because it must observe the
// repository's own code rather than a re-implementation of it.
const dateIn = (tz, at) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(at);
const SYSTEM_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

const start = new Date();
start.setHours(0, 0, 0, 0);
console.log(`window measured over the local day beginning ${start.toString()}`);
console.log(`system zone: ${SYSTEM_TZ}`);
console.log('');
console.log('  zone                 differs from the system date   as hours of 24');
for (const tz of CANDIDATES) {
  let hits = 0, total = 0, first = null, last = null;
  for (let m = 0; m < 24 * 60; m += 10) {
    const at = new Date(start.getTime() + m * 60000);
    total++;
    if (dateIn(tz, at) !== dateIn(SYSTEM_TZ, at)) {
      hits++;
      const hhmm = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      if (first === null) first = hhmm;
      last = hhmm;
    }
  }
  const hours = (hits / total * 24).toFixed(1);
  const span = hits ? `${first}-${last}` : '(never today)';
  console.log(`  ${tz.padEnd(20)} ${span.padEnd(30)} ${hours}`);
}

// ---- PART 2: select an instrument NOW, or refuse ------------------------------
console.log('');
const now = new Date();
const systemDate = dateIn(SYSTEM_TZ, now);
const usable = CANDIDATES.filter((tz) => dateIn(tz, now) !== systemDate);
console.log(`at ${now.toTimeString().slice(0, 8)} the system date is ${systemDate}`);
console.log(`zones whose date differs RIGHT NOW: ${usable.length} of ${CANDIDATES.length}${usable.length ? ` — ${usable.join(' ')}` : ''}`);

if (usable.length === 0) {
  console.error('');
  console.error('REFUSING: no candidate zone is on a different calendar date at this instant,');
  console.error('  so there is no instrument with which to ask the question. A control that');
  console.error('  cannot find its own instrument must FAIL, not skip — skipping is how it');
  console.error('  reports success on a day it measured nothing.');
  process.exit(3);
}

const probe = usable[0];
const repoUnderSystem = underZone(null, REPO_TODAY);
const repoUnderProbe = underZone(probe, REPO_TODAY);
console.log('');
console.log(`  repository todayIso, TZ deleted ....... ${repoUnderSystem}`);
console.log(`  repository todayIso, TZ=${probe.padEnd(20)} ${repoUnderProbe}`);
console.log('');
if (repoUnderSystem === repoUnderProbe) {
  console.log('The zone does NOT reach the repository\'s date. That is a real negative,');
  console.log(`because ${probe} is demonstrably on ${dateIn(probe, now)} at this instant.`);
} else {
  console.log('TZ CHANGES THE DATE THIS REPOSITORY WRITES. Every date-bearing artifact a');
  console.log('run produces inherits it silently, and the two answers here are both');
  console.log('well-formed, so nothing downstream can adjudicate between them.');
}
