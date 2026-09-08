# `bd` CLI measurements — task 26, against a throwaway store only

**Scope discipline, stated up front:** every measurement below ran against an
isolated throwaway store created for this task alone
(`C:/Users/BadBitch/AppData/Local/Temp/claude/D--AddictedtoAI/47a211cc-a047-4474-bb53-9cfe0505f2b9/scratchpad/bdm-store`,
issue prefix `bdmeas`). No `bd create`, `update`, `close`, or `claim` ran
against the real store in `D:/AddictedtoAI`. `bd --help` and `bd <cmd>
--help` (run from the default cwd, which is `D:/AddictedtoAI`) are the only
commands this file records that touched that directory at all, and those are
pure `--help` invocations with no store I/O.

**bd version:** `bd version 1.2.2 (6c124203e)`

**Store creation command** (the exact one `bd init --help` documents):

```
bd init --prefix bdmeas --non-interactive --skip-agents --skip-hooks --sandbox
```

This was run with the process's actual working directory set to the store
directory — **not** via `bd init -C <dir>`. `bd init -C <uninitialized-dir>`
is refused outright:

```
$ bd init -C <bdm-store> --prefix bdm --non-interactive --skip-agents --skip-hooks
Error: cannot use -C directory "<bdm-store>": no beads project found
```

`-C` only works once a store already exists at that path; a fresh store must
be created with the real process cwd inside the target directory. Since the
working rules here forbid the literal token `cd` in any command, the
measurement harness (`bdm-run.mjs`, written to the scratchpad) invoked `bd`
through Node's `child_process.spawnSync(bd.js, args, { cwd: STORE })`, which
sets the real OS process working directory via the `cwd` option — not a
shell `cd` — and passes every argument as a discrete argv entry (never a
shell string), so no prose value below passed through shell parsing.

## SETUP INCIDENT — read this before reusing this method

While finding the right way to target the store directory, one `bd init`
invocation was run with `--db <path-inside-scratchpad>/bdm.db` but **without**
changing the process's actual cwd away from `D:/AddictedtoAI` (a git
repository with a real GitHub remote). bd detected that ambient git remote
and **auto-bootstrapped from it** — it printed `Retrieving remote
information...` and `Synced database from git+https://github.com/...`,
downloading 25,021 Dolt chunks (the real project's own beads history) into a
**new, differently-named** local database (`bdm`) under the global embedded
store `~/.beads/embeddeddolt/bdm`. The `--db` flag did not prevent this — it
only names the new local database; it does not stop bd from discovering and
cloning a remote via the ambient git context of the process's cwd.

**No command in this incident wrote to `D:/AddictedtoAI/.beads`** (verified:
every file under it retained its pre-session mtime, and `git status` on
`D:/AddictedtoAI` showed no new files from this action) — the write landed
entirely under `~/.beads/embeddeddolt/bdm`, a location this session created
and was therefore free to delete. It was deleted (`rm -rf
~/.beads/embeddeddolt/bdm`) before any further measurement. This satisfies
"delete nothing you did not create" — that directory did not exist before
this session's mistaken command created it. Recorded here in full because it
is exactly the hazard task 67's "single `bd` invocation choke point" exists
to prevent, and it reproduces on a stock `bd init`, not on anything specific
to this measurement's flags.

---

## 1. Two issues created; `bd list --json` / `bd show --json` field survey

| Command | Exit | Result |
|---|---|---|
| `bd create "Measurement issue A..." --type task --description "..." --notes "Initial note on A." --priority P2 --json --sandbox` | 0 | Created `bdmeas-g28` |
| `bd create "Measurement issue B..." --type bug --description "..." --priority P3 --json --sandbox` | 0 | Created `bdmeas-wis` |
| `bd list --all --json --sandbox` | 0 | Array of both issues |
| `bd show bdmeas-g28 --json --sandbox` | 0 | **Array of one** object (not a bare object) |

`bd create --json` response for A:

```json
{
  "created_at": "2026-09-08T15:48:59.3934988Z",
  "created_by": "unknown",
  "description": "This is issue A. It has a multi-line description used to check\nhow prose round-trips through bd create --description and bd show --json.",
  "id": "bdmeas-g28",
  "issue_type": "task",
  "notes": "Initial note on A.",
  "owner": "223016611+addicted2ai@users.noreply.github.com",
  "priority": 2,
  "schema_version": 1,
  "status": "open",
  "title": "Measurement issue A: prose body test",
  "updated_at": "2026-09-08T15:48:59.3934988Z"
}
```

`bd list --all --json` entry for the same issue (after a comment was added,
see §3):

```json
{
  "id": "bdmeas-g28", "title": "Measurement issue A: prose body test",
  "description": "...", "notes": "Initial note on A.",
  "status": "open", "priority": 2, "issue_type": "task",
  "owner": "223016611+addicted2ai@users.noreply.github.com",
  "created_at": "2026-09-08T15:48:59Z", "created_by": "unknown",
  "updated_at": "2026-09-08T15:48:59Z",
  "dependency_count": 0, "dependent_count": 0, "comment_count": 1
}
```

Field observations:
- `--priority P2` on the command line round-trips as the **integer** `2` in
  every JSON response, never the string `"P2"`.
- Fields are **omitted when empty**, never emitted as `null`: issue B (no
  `--notes`) has no `notes` key at all; an unclaimed issue has no `assignee`
  key; an unlabeled issue has no `labels` key; an issue with no metadata has
  no `metadata` key.
- `created_by` was `"unknown"` for every issue created here (no `--actor` was
  passed to any `create` call) — it did **not** fall back to git
  `user.name`/`user.email` the way `--actor`'s documented default chain
  implies for actor-bearing commands. `owner`, a separate field, **did** pick
  up an ambient value (`223016611+addicted2ai@users.noreply.github.com`) —
  this is the machine's global git `user.email`, not anything read from the
  real project's data.
- `bd show <id> --json` always wraps its result in a **JSON array**, even for
  one id — a caller must index `[0]`, not assume a bare object.
- Neither `list --json` nor the default `show --json` includes comment
  bodies — see §3 for the exact flag that does.

## 2. `bd update --claim`: actor keying

| Command | Exit | Result |
|---|---|---|
| `bd update bdmeas-g28 --claim --actor measurer-one --json --sandbox` | 0 | `status: in_progress`, `assignee: "measurer-one"`, `started_at` set |
| `bd update bdmeas-g28 --claim --actor measurer-two --json --sandbox` | **1** | stderr: `Error claiming bdmeas-g28: issue already claimed by measurer-one` |
| `bd show bdmeas-g28 --json --sandbox` (after the failed second claim) | 0 | unchanged: still `assignee: "measurer-one"`, `status: in_progress` |
| `bd update bdmeas-wis --claim --json --sandbox` with env `BEADS_ACTOR=measurer-envvar`, no `--actor` flag | 0 | `assignee: "measurer-envvar"` |

**A second `--claim` under a different actor is a hard failure (exit 1),
naming the current holder — it neither overwrites nor silently no-ops.** The
`$BEADS_ACTOR` environment variable is honored as the actor source when
`--actor` is omitted, consistent with `--help`'s documented order
(`$BEADS_ACTOR` → git `user.name` → `$USER`). (`--claim`'s own `--help` text
says re-claiming as the *same* actor is idempotent; that specific case —
same actor, second claim — was not exercised here, only the differing-actor
case, which is the one the task asked about.)

## 3. `bd close` on an already-closed issue; `close_reason` and `reopen`

| Command | Exit | Result |
|---|---|---|
| `bd close bdmeas-g28 --reason "First close: measurement pass complete." --json --sandbox` | 0 | `status: closed`, `closed_at` set, `close_reason: "First close: measurement pass complete."` |
| `bd close bdmeas-g28 --reason "Second close attempt: should be no-op/error/re-close." --json --sandbox` | 0 | **`close_reason` and `closed_at` unchanged from the first close** — the new reason text is silently discarded |
| `bd reopen bdmeas-g28 --reason "Reopening to check close_reason survival." --json --sandbox` | 0 | `status: open`; `closed_at` and `close_reason` are **absent** from the record afterward |

**Closing an already-closed issue is exit 0 with no error, but a silent
no-op on the fields that matter**: the second `--reason` never lands
anywhere — the response returns the *original* `close_reason` string
verbatim, not the new one, and `closed_at` keeps its first timestamp. A
caller that assumes a repeat `close --reason` updates anything will lose
that text with no error signal to catch it.

**`close_reason` does not survive `bd reopen`** — the field is cleared
outright (not merely blanked; the JSON key disappears), along with
`closed_at`. Anything needing that history must capture it before reopening
(e.g. as a comment or note), or read `bd history <id>`, which was not
exercised here.

`--reason` **does** round-trip exactly into `close_reason` on a close that
actually applies (first close above): the stored string is byte-identical to
what `--reason` was given.

## 4. Metadata round-trip

| Command | Exit | Result |
|---|---|---|
| `bd create "..." --type task --metadata '{"subject":"lib/beads.mjs","risk":"low","count":3}' --json --sandbox` | 0 | Created `bdmeas-8q8`, `metadata` returned as a nested JSON object in the create response |
| `bd show bdmeas-8q8 --json --sandbox` | 0 | `metadata` present as an object, same three keys/types |
| `bd list --id bdmeas-8q8 --json --sandbox` | 0 | same |
| `bd ready --json --sandbox` | 0 | `bdmeas-8q8` appears with the same `metadata` object |
| `bd list --has-metadata-key subject --json --sandbox` | 0 | returns exactly `[bdmeas-8q8]` |
| `bd update bdmeas-8q8 --set-metadata team=platform --json --sandbox` | 0 | `metadata` now has **four** keys: `risk`, `team`, `count`, `subject` |

**Metadata round-trips as a genuine JSON object, never a string and never
dropped**, through every read path tried (`show`, `list`, `list --id`,
`ready`, `list --has-metadata-key`). Value types are preserved (`count: 3`
stays a JSON number). `--set-metadata key=value` (the `update`-only,
single-key flag, distinct from `create --metadata '<json>'`) **merges**
into existing metadata rather than replacing it — the three original keys
survived the `--set-metadata` call untouched. `--has-metadata-key` filtering
on `list` works correctly.

## 5. Argv width on Windows: `bd show` with many ids in one call

Ran `bd show <N nonexistent ids> --json --sandbox` for N = 10, 50, 200,
using fabricated ids of the store's own shape (`bdmeas-000000`,
`bdmeas-000001`, …) so no real issue could accidentally match.

| N | Exit | Command length (chars) | `Error fetching …` lines on stderr |
|---|---|---|---|
| 10 | 1 | 164 | 10 |
| 50 | 1 | 724 | 50 |
| 200 | 1 | 2824 | 200 |

Every size ran the **full** command and reported one `Error fetching
bdmeas-NNNNNN: no issue found matching "bdmeas-NNNNNN"` line per id on
stderr (counts match exactly — 10/50/200, confirmed by counting, not
sampling) and one JSON error object on stdout: `{"error":"no issues found
matching the provided IDs","schema_version":1}`. **No truncation and no
argv-related failure at any of the three sizes.** 200 ids produced a
2,824-character command line, far short of Windows' `CreateProcess` ~32,767
character ceiling (this measurement bypassed the `.cmd` shim's cmd.exe
~8,191-character line limit — see the note at the end of this file — so that
lower ceiling was never in play either). No practical limit was found up to
200; nothing here suggests loop/lib/beads.mjs's set-valued call sites would
approach any Windows argv ceiling at realistic batch sizes.

## 6. `--sandbox`

Exists as a persistent global flag on every subcommand. `--help` text (both
top-level `bd --help` and every subcommand's `--help`, verbatim):

> `--sandbox   Sandbox mode: disables Dolt auto-push`

Behavioral verification was **not possible** in this throwaway store: no
Dolt remote was ever configured (`bd dolt remote add` was deliberately never
run, to avoid any real network push target), so there is nothing to push
regardless of `--sandbox`. One `create` was run with `--sandbox` and one
without (`bd create "Measurement issue D..." --type task --json`, no
`--sandbox`); both exited 0 with identical output shape and no push-related
message on either stdout or stderr. This does not confirm or refute the
documented behavior — it only confirms `--sandbox`'s absence caused no
observable difference in a store with no push target. Confirming the actual
push-suppression would require a store with a configured remote, out of
scope for an isolated throwaway store.

## 7. Labels

| Command | Exit | Result |
|---|---|---|
| `bd label add bdmeas-8q8 measurement-label --sandbox` | 0 | stdout: `✓ Added label 'measurement-label' to bdmeas-8q8` |
| `bd list --label measurement-label --json --sandbox` | 0 | returns `[bdmeas-8q8]`, with `"labels": ["measurement-label"]` in its JSON |
| `bd list --label no-such-label --json --sandbox` | 0 | returns `[]` |

Label filtering on `list --label` works correctly for both a matching and a
non-matching label.

## 8. stdout cleanliness on `--json` calls

Captured stdout and stderr **separately** (never merged) for every call
above. Every `--json` invocation's stdout was **exactly one JSON value**
(object or array) that `JSON.parse` accepted directly with no leading or
trailing content to strip — verified programmatically on
`bd list --all --json --sandbox`'s captured stdout. Every advisory/hint
message observed (`warning: beads.role not configured (GH#2950). Fix: git
config beads.role maintainer / Or: git config beads.role contributor`)
appeared on **stderr**, consistently, across `create`, `list`, `close`, and
`reopen` — never on stdout. `show`, `update`, `comment`, and `label add`
calls printed no such warning at all once an issue existed. **A parser
reading only stdout needs no banner-skipping logic, provided stdout and
stderr are captured separately** (a naive `2>&1` merge would corrupt the
JSON stream on the calls that print the `beads.role` warning).

One exception, seen only during the SETUP INCIDENT above (a Dolt
remote-clone operation, not any of the 8 measured operations): that
progress display printed ANSI cursor-control sequences (`\x1b[1A\x1b[J`)
interleaved with plain text on stdout while chunks downloaded. That path is
not `--json` output and was never going to be machine-parsed; noted only so
nobody is surprised if a future `bd init`/bootstrap-from-remote path is ever
invoked without `--json`.

---

## Bonus observation: embedded-mode storage is not cwd-scoped by default

Not one of the eight numbered measurements, but discovered while verifying
store isolation and directly relevant to task 67's "single invocation choke
point": `bd init --prefix bdmeas ...` created **no local `.beads/` marker
file at all** in the throwaway project directory — `ls -la` on it after init
shows it completely empty. The real project (`D:/AddictedtoAI/.beads`) does
have such a local marker (`config.yaml`, `metadata.json`, etc.). Running
`bd -C <bdm-store> where` and, separately, `bd -C <an unrelated sibling
scratchpad directory, not bdm-store> where` (neither is the real repo — this
was checked only in scratchpad-adjacent directories, never against
`D:/AddictedtoAI`) **both** resolved to the same `bdmeas` database:

```
C:\Users\BadBitch\.beads
  prefix: bdmeas
  database: C:\Users\BadBitch\.beads\embeddeddolt
```

That is: with no local `.beads/config.yaml` marker present, discovery did
not appear to be cwd-scoped at all — it resolved to what looks like a
global "last-active embedded database" pointer, from directories that have
nothing to do with the store. This was verified only among scratchpad
directories and never against the real store, so it is reported as an
observation about this bd version's embedded mode in general, not a claim
about how the real project currently resolves (which was not tested, per
the task's restriction).

---

## Consequences for the design (facts only)

- Comment bodies are **not** in `list --json` under any flag; a separate
  `show <id> --json --include-comments` read is required per issue to get
  comment text.
- `bd show --json` always returns a JSON **array**, even for a single id;
  callers must unwrap `[0]`.
- A second `--claim` by a different actor is a **hard failure** (exit 1,
  stderr names the current holder) — not an overwrite, not a no-op. Code
  must branch on exit code / stderr text, not assume success.
- `bd close` on an already-closed issue is exit 0 but a **silent no-op**:
  the new `--reason` is discarded and the original `close_reason`/`closed_at`
  survive unchanged. A caller that always calls `close --reason <text>` on
  merge and assumes the text lands will lose it silently on a re-close.
- `bd reopen` **clears** `close_reason` and `closed_at` outright (absent
  from the JSON afterward) — no history of the prior close is retained by
  the issue record itself.
- `--metadata` (create) and `--set-metadata key=value` (update) both
  round-trip as real JSON objects through `show`, `list`, `list --id`,
  `ready`, and `list --has-metadata-key`; `--set-metadata` **merges**,
  it does not replace.
- No practical Windows argv-length ceiling was found up to 200 ids in one
  `bd show` call (2,824 characters observed); loop/lib/beads.mjs's
  "every call site set-valued" design has large headroom before argv width
  becomes a concern at any realistic batch size.
- `--sandbox`'s push-suppressing effect could not be behaviorally confirmed
  here — no remote was configured in the throwaway store, so there was
  nothing to push either way. Only its `--help` text was verified. If task
  67 needs behavioral certainty, that requires a store with a Dolt remote
  configured, which this measurement deliberately did not create.
- Label filtering (`list --label <x> --json`) and metadata-key filtering
  (`list --has-metadata-key <k> --json`) both work as documented.
- `--json` stdout is clean JSON with no banner; all advisory text goes to
  stderr — safe for a parser **only if stdout and stderr are captured
  separately**, never merged with `2>&1`.
- **Safety-critical:** running `bd init` (and, it should be assumed until
  disproven, other bd commands relying on auto-discovery) with process cwd
  inside a git repository that has a real remote can trigger an
  **unsolicited full clone/sync from that remote** into a differently-named
  local database, regardless of an unrelated `--db` value. `loop/lib/beads.mjs`'s
  single invocation choke point must never run with cwd ambiguous between
  the real repository and any other store — every call needs an explicit,
  unambiguous store scope (an already-initialized directory reached via a
  cwd that was never inside a different git remote's tree, or an explicit
  `--db`/`--database` known to be safe).
- `bd init -C <uninitialized-dir>` is refused ("no beads project found");
  a fresh store must be created with the real process cwd inside the target
  directory, which on Windows without a shell `cd` means spawning `bd`
  (or, to dodge the `.cmd` shim's `shell:true` requirement entirely, the
  underlying `node .../@beads/bd/bin/bd.js`) with an explicit `cwd` option
  rather than a shell working-directory change.
- Embedded-mode storage does not appear to be strictly cwd-scoped when no
  local `.beads/config.yaml` marker exists in the target directory (see the
  bonus observation above) — a design relying on "run bd from the right
  directory" alone for isolation should instead pass an explicit
  `--db`/`--database`, or only operate against directories that already
  carry their own local marker.
- On Windows, npm's `bd.cmd` shim requires `shell:true` under Node's
  `spawnSync`/`spawn`, and Node's own deprecation warning
  (`DEP0190`) says shell-mode args are concatenated rather than escaped —
  real risk for prose containing quotes. This measurement's harness invoked
  `node <npm-global>/node_modules/@beads/bd/bin/bd.js <args>` directly
  instead, keeping every argument (including all prose: descriptions,
  notes, comment text, close/reopen reasons) as a true argv array element
  with no shell parsing anywhere. Any Node-based automation on Windows
  (`loop/lib/beads.mjs` included, if it ever runs there) should do the same
  rather than shelling out to `bd.cmd`.

---

No repository file other than this one
(`openspec/changes/two-desks-work-orders-and-trains/evidence/bd-measurements.md`)
was written or modified by this task. All scratch files (the measurement
harness, its raw JSON log, and the throwaway store itself) live under the
scratchpad directory and were not committed anywhere.
