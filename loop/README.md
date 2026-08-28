# loop/

The Desk: the agentic loop that produces and maintains content
(`specs/loop`, design D2).

- `node loop/run.mjs [--runner <id>] [--reviewer <id>] [--dry-run]` — resume
  the oldest resumable `job/*` branch, else select one job (directives, then
  the derived queue, then ripe proposals), assign `j-<yyyymmdd>-<seq>`, commit
  a self-contained `.job/brief.md` to `job/<id>`, invoke the runner under the
  job type's wall-clock cap, classify the outcome from `RESULT.md`, require a
  recorded review verdict before merging, and write the ledger line.
- `node loop/conformance.mjs --runner <id>` — the four canned checks a
  model/provider/harness combination must pass before it may author or
  review.

Configuration is `runners.yml` (the only file that names a model, provider
or harness) and `data/config.json` (budget bounds, job caps, degradation
thresholds, publish flag). Reserved paths no job may edit: `openspec/specs/`,
`data/config.json`, `runners.yml`, `STOP`, and `HOLD.md`'s removal.

## The swap, in three steps

1. Add the combination to `runners.yml` — id, `provider` (the lane key), tier,
   roles, command template. Installing the tool and its credentials is the
   maintainer's; the loop never touches a credential.
2. `node loop/conformance.mjs --runner <id>`.
3. Read the four PASS/FAIL lines. Any FAIL and the selector refuses that runner
   for `author` and `reviewer`, naming the failed check.

The result is recorded in **`data/conformance.json`**, not in `runners.yml`
(which is reserved, so the loop must never write to it) and not under `loop/`
(where a file keyed by runner id would put a harness name in the machinery and
break the one-file-change property the swap depends on).

## Layout

| File | What it owns |
|---|---|
| `run.mjs` | one run: start gate, resume-or-select, brief, invoke, classify, gate, review, merge, publish step, ledger |
| `conformance.mjs` | the four canned checks and the record the selector reads |
| `lib/paths.mjs` | every path, injectable, so tests run against throwaway repositories |
| `lib/config.mjs` | `data/config.json`, the closed job-type and outcome lists |
| `lib/runners.mjs` | the registry, role resolution, the conformance gate |
| `lib/ledger.mjs` | `data/ledger.jsonl` append-only state, job ids |
| `lib/budget.mjs` | tier shares, ceilings, the upkeep floor, lane pause, shed level |
| `lib/select.mjs` | the three work sources, every gate, every named refusal |
| `lib/directives.mjs` / `queue.mjs` / `proposals.mjs` | the three sources |
| `lib/surfaces.mjs` | the blog ceiling and the tutorial rules |
| `lib/brief.mjs` / `specs.mjs` | the self-contained brief and its spec excerpts |
| `lib/exec.mjs` | the executor contract: one prompt in, files out, killed at the cap |
| `lib/result.mjs` | the `RESULT.md` protocol |
| `lib/review.mjs` | the reviewer invocation, the verdict record, the merge gate |
| `lib/breakers.mjs` | the four breakers and `HOLD.md` |
| `lib/gates.mjs` | the build/test gates run on a job branch |
| `lib/git.mjs` | every git call; nothing here pushes |
| `lib/publish.mjs` | delegates to the Pulse's shared publish step; never improvises one |
| `tests/` | `npm test` runs these; they build throwaway repositories and never touch this one |

Job worktrees are created **outside** the repository (default: the OS temp
directory, override with `--worktree-root` or `LOOP_WORKTREE_ROOT`). They are
scratch: everything resumption needs is committed to the branch.

## What the loop reads from derived state

Written by the Pulse, read here. Both readers are tolerant about shape and
strict about meaning; an item whose `type` is not in the closed job-type list
is skipped with a warning rather than guessed at.

**`data/derived/queue.json`** — `{ "items": [ … ] }` or a bare array. Per item:

| Field | Meaning |
|---|---|
| `type` | required, from the closed job-type list |
| `title` / `detail` | what needs doing; goes into the brief |
| `rank` | carried through as data only. **File order is the ranking** — the Pulse writes the queue already sorted, and its `rank` is descending (higher is more important), so re-sorting it here would invert it |
| `target` | repository path the work concerns |
| `field` | the changed field. `price` / `licence` / `status` make an `interpret` item **material**, which is what keeps it selectable at shed level 3 |
| `subject_kind: "tutorial"` | marks a `verify` item as tutorial re-verification, which outranks new `tutorial` work |

**`data/derived/freshness.json`** — the loop reads only the tutorial records
(`tutorials`, `records` or `items`, whichever array is present). A record blocks
new tutorial work when it is demoted (`demoted: true` or `state: "demoted"`)
and **not** archived or subject-dead (`archived`, `state: "archived"`,
`subject_dead`, or `subject_status` of `dead`/`retired`). Archival is the right
end state for a dead subject, so those never block.
