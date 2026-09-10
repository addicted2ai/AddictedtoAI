// MY ENV-PIN GUARD IS A CANDIDATE POOL NOBODY WROTE THE BOUNDARY OF.
//
// A2AI-Fable-Arch's generalisation of my zone finding: the selection effect also
// operates on the CANDIDATE POOL, and there it is invisible, because a pool
// nobody wrote down leaves no trace of what it excluded. Applied to my own gate
// harness one line at a time, the worst instance is the env-pin guard.
//
// It checks 18 named variables and says "environment pins: 18 checked". That
// number is the numerator. THE DENOMINATOR — how many variables the process
// actually has — HAS NEVER BEEN PRINTED, and every one of the 18 got onto the
// list because something already went wrong with it. NODE_OPTIONS was added an
// hour ago and ONLY because a peer's bead pointed at it; nothing in my harness
// would ever have proposed it. So the list is a record of past incidents wearing
// the shape of a check, and its silence about variable 19 is indistinguishable
// from variable 19 not existing.
//
// THE REPAIR IS TO INVERT IT. Do not enumerate what I think matters; enumerate
// what is ACTUALLY THERE and diff it against a recorded baseline. A variable I
// never thought of shows up because it is new, not because I predicted it.
//
// SECRETS. Names are printed; VALUES ARE NOT, except for the explicitly-declared
// safe set, because "never print a secret, including a partial token" is not
// negotiable and an unknown variable is exactly the one whose value I cannot
// vouch for. Change detection for unknown variables uses a SHA-256 of the value,
// truncated, which reveals nothing and still distinguishes changed from steady.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const S = 'C:/Users/BadBitch/AppData/Local/Temp/claude/D--AddictedtoAI/b0a0272b-5058-41e7-ac66-431922257ff6/scratchpad';
const BASE = `${S}/gate-runs/env-census-baseline.tsv`;

// The ONLY variables whose values are safe to print, because each is already
// named in the harness and each is a behaviour switch rather than a credential.
const SAFE_TO_PRINT = new Set([
  'TZ', 'NODE_OPTIONS', 'npm_config_node_options', 'NODE_TEST_CONTEXT',
  'PULSE_NOW', 'PULSE_ROOT', 'LOOP_WORKTREE_ROOT', 'SITE_URL',
  'ATAI_VERIFY_DESIGN_NO_RECORD', 'BRIEF_RECORDS_NOW', 'PULSE_GUARD_MIN',
  'ATAI_TEST_LOCK_WAIT_MS', 'ATAI_BUILD_LOCK_WAIT_MS', 'LOOP_VERIFY_DESIGN_PORT',
  'LOOP_DEBUG', 'BD_BIN', 'LANG', 'LC_ALL', 'NODE_ENV',
]);

// Variables that legitimately differ between two runs and would otherwise make
// every census noisy. NAMED AND PRINTED, not silently dropped — an exclusion
// nobody can see is the defect this whole file exists to remove.
const VOLATILE = [/^_$/, /^PWD$/, /^OLDPWD$/, /^SHLVL$/, /^CLAUDE_CODE_/, /^npm_lifecycle/, /^npm_package/, /^TMPDIR$/, /_SESSION_ID$/];

const digest = (v) => createHash('sha256').update(v).digest('hex').slice(0, 12);

// WINDOWS ENVIRONMENT NAMES ARE CASE-INSENSITIVE AND THE INVOKER DECIDES THE
// CASE, SO A CASE-SENSITIVE COMPARISON IS A FALSE-POSITIVE ENGINE.
//
// Measured after the first version shipped, by running this census from
// PowerShell instead of Git Bash: ADDED 13, REMOVED 15, CHANGED 1 — and almost
// all of it is one variable appearing twice under two spellings. PATH/Path,
// SYSTEMROOT/SystemRoot, WINDIR/windir, PROGRAMFILES/ProgramFiles,
// SYSTEMDRIVE/SystemDrive. Git Bash upper-cases the names it inherits; PowerShell
// keeps Windows's own casing. The variables are identical to the operating
// system, which resolves them case-insensitively.
//
// TWENTY-EIGHT PHANTOM DRIFT ENTRIES ON AN UNCHANGED MACHINE is exactly the guard
// that cries wolf and gets switched off — the over-broad arm for the third time
// tonight, and this time caught before it bit anything. So the KEY is folded for
// comparison and the OBSERVED SPELLING is what gets printed, because a census
// that silently renamed what it saw would be lying about its own subject.
const foldKey = (k) => (process.platform === 'win32' ? k.toUpperCase() : k);

const now = new Map();
const spelling = new Map();
for (const [k, v] of Object.entries(process.env)) {
  now.set(foldKey(k), digest(v ?? ''));
  spelling.set(foldKey(k), k);
}

const isVolatile = (k) => VOLATILE.some((re) => re.test(k));
const stable = [...now.keys()].filter((k) => !isVolatile(k)).sort();

console.log(`environment census`);
console.log(`  variables present ...... ${now.size}   <- THE DENOMINATOR my harness has never printed`);
console.log(`  volatile (excluded) .... ${now.size - stable.length}  [${VOLATILE.map(String).join(' ')}]`);
console.log(`  stable (compared) ...... ${stable.length}`);

// THE BASELINE IS INVOKER-SPECIFIC AND MUST SAY SO ON ITS FACE. Measured after
// case-folding removed the phantom rows: a baseline taken under Git Bash and
// compared under PowerShell still reports ADDED 6, REMOVED 8, CHANGED 2, and
// every one of those sixteen is REAL — MSYSTEM, EXEPATH, SHELL, TERM and HOME
// exist only under one, PSModulePath and PSExecutionPolicyPreference only under
// the other, and PATH genuinely differs because Git Bash prepends its own
// directories. So a comparison across invokers is a valid measurement of the
// invoker and an invalid measurement of drift, and NOTHING IN THE OUTPUT SAID
// WHICH ONE IT WAS. An anchor whose validity rests on context nobody recorded is
// exactly as durable as that context.
// ORDER IS LOAD-BEARING AND THE FIRST VERSION HAD IT BACKWARDS, WHICH IS THE
// NIGHT'S FIRST FAILURE CLASS IN A DETECTOR TWO MINUTES OLD. It tested
// PSModulePath first and reported "powershell" from inside a Git Bash call —
// because PSModulePath is INHERITED by every descendant of the PowerShell that
// launched this session, so it answers "was an ancestor PowerShell", not "is this
// shell PowerShell". The detector's true and false answers were the same
// observation. MSYSTEM is set by Git Bash for its own children and is absent
// under PowerShell (measured: it appears in the REMOVED list of a cross-invoker
// comparison), so it discriminates and is tested FIRST.
const invoker = () => {
  if (process.env.MSYSTEM) return `msys:${process.env.MSYSTEM}`;
  if (process.env.PSModulePath) return 'powershell';
  return 'unknown';
};
const STAMP = `#invoker\t${invoker()}\t${process.platform}`;

if (!existsSync(BASE)) {
  const rows = stable.map((k) => `${k}\t${now.get(k)}`).join('\n');
  writeFileSync(BASE, `${STAMP}\n${rows}\n`, 'utf8');
  console.log(`  invoker ................ ${invoker()} (recorded on the baseline)`);
  console.log('');
  console.log(`  NO BASELINE — established one at ${BASE} with ${stable.length} names.`);
  console.log('  A first run cannot detect drift and must not pretend to. Re-run to compare.');
  process.exit(0);
}

const base = new Map();
let baseInvoker = '(not recorded)';
for (const line of readFileSync(BASE, 'utf8').split('\n')) {
  if (!line.trim()) continue;
  if (line.startsWith('#invoker\t')) { baseInvoker = line.split('\t')[1]; continue; }
  const [k, d] = line.split('\t');
  base.set(k, d);
}
const sameInvoker = baseInvoker === invoker();
console.log(`  invoker ................ ${invoker()}   baseline taken under: ${baseInvoker}`);
if (!sameInvoker) {
  console.log('  *** DIFFERENT INVOKER — the drift below measures the SHELL, not the machine.');
  console.log('  *** This is a valid reading of the invoker and an INVALID reading of drift.');
}

const added = stable.filter((k) => !base.has(k));
const removed = [...base.keys()].filter((k) => !now.has(k)).sort();
const changed = stable.filter((k) => base.has(k) && base.get(k) !== now.get(k));

// Printed under the spelling actually observed, matched against the safe list
// case-insensitively for the same reason the comparison is folded.
const safe = new Set([...SAFE_TO_PRINT].map(foldKey));
const show = (k) => {
  const seen = spelling.get(k) ?? k;
  return safe.has(k)
    ? `${seen}=${process.env[seen]}`
    : `${seen} (value withheld; digest ${now.get(k) ?? '-'})`;
};

console.log(`  baseline names ......... ${base.size}`);
console.log(`  ADDED since baseline ... ${added.length}`);
console.log(`  REMOVED since baseline . ${removed.length}`);
console.log(`  CHANGED value .......... ${changed.length}`);
console.log('');
for (const k of added) console.log(`    + ${show(k)}`);
for (const k of removed) console.log(`    - ${k}`);
for (const k of changed) console.log(`    ~ ${show(k)}`);
if (!added.length && !removed.length && !changed.length) {
  console.log('    (no drift — and the three counts above are what makes that statement checkable)');
}
