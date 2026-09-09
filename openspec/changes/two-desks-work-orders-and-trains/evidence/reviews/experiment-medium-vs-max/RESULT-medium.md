# Result

## Changes

- `loop/tests/portability.test.mjs`: `scan` now reports the number of files it
  actually read; both scans assert a positive floor. The runner-id scan now
  covers `loop/`, `pulse/`, `scripts/`, `lib/`, `app/`, `tools/`, and
  `data/config.json`. A temporary fixture test plants the registered runner id
  under each of `lib/`, `app/`, and `tools/` and requires all three hits. The
  model/provider/harness scan scope was not widened.
- `scripts/no-change-dir-refs.test.mjs`: allow-list entries now match the
  generic construction forms (plus the existing `live-one` test fixture), and
  matching uses regular expressions rather than blanket file permission.
- `loop/lib/specs.mjs`: the line-23 example now uses the archive form
  `openspec/changes/archive/<YYYY-MM-DD>-<name>/...`.

## Red proofs

Each mutation was applied, the targeted test was run, the mutation was
restored, and the restored file hash was checked. The temporary fixture tree
was deleted by the test's `finally` block.

1. Removed the `lib/` runner target. Portability output: `not ok 5`, `1..13`,
   `# tests 13`, `# pass 12`, `# fail 1`, exit 1. Mutated SHA-256:
   `339B11921043E51A73DD11B6DBEC96AB6624A4074E5B9834758CB195CFDE272E`.
   Restored SHA-256: `CEF427BE348007E680270362B9D06F0B4FA50D43B779DF31294E71B0A90EB128`.
2. Removed the `app/` runner target. Portability output: `not ok 5`, `1..13`,
   `# tests 13`, `# pass 12`, `# fail 1`, exit 1. Mutated SHA-256:
   `259823EE8B8B1F16F481F2CFA626B24A0C3A068E1A4DFE5E9F17B4545830D4E7`.
   Restored SHA-256: `CEF427BE348007E680270362B9D06F0B4FA50D43B779DF31294E71B0A90EB128`.
3. Removed the `tools/` runner target. Portability output: `not ok 5`, `1..13`,
   `# tests 13`, `# pass 12`, `# fail 1`, exit 1. Mutated SHA-256:
   `86F323F1F08F6489C5E2131C11AA1E268C5ECB5EEF1476DCD16527BC5B658C21`.
   Restored SHA-256: `CEF427BE348007E680270362B9D06F0B4FA50D43B779DF31294E71B0A90EB128`.
4. Replaced each target list in turn with an empty list: the model scan output
   was `not ok 3`, `# tests 13`, `# pass 12`, `# fail 1`, exit 1, with
   `the model/provider/harness scan must read at least one file`; the runner
   scan output was `not ok 4` and `not ok 5`, `# tests 13`, `# pass 11`,
   `# fail 2`, exit 1, with `the runner-id scan must read at least one file`.
   Mutated SHA-256 values were respectively
   `6C8C98C2249C6B06AC669441BFBBDF3E566EB40E9257E65EE4A2DCD1D138E7DD` and
   `8C65BC356704BC3A55B14EA9B005919A7544F086A963ED36E4685A1D93BAB03D`.
   Both restored to `CEF427BE348007E680270362B9D06F0B4FA50D43B779DF31294E71B0A90EB128`.
5. Changed the allow-listed fixture name from `live-one` to `round-four`.
   No-change output: `not ok 1`, `1..3`, `# tests 3`, `# pass 2`, `# fail 1`,
   exit 1, identifying `scripts/check-spec-deltas.test.mjs`; mutated SHA-256:
   `21F5D1D5A1CA9F8EB5A5DDCB9356938BE2A868EA63CC2200081028E5644EFFA2`.
   Restored SHA-256: `B26A974F0F4D54A367F566C9F509945B23070054A73B879C72BFBCFA42BD55D2`.

## Clean targeted runs

- `node --test --test-reporter=tap loop/tests/portability.test.mjs`: `1..13`,
  `# tests 13`, `# pass 13`, `# fail 0`, exit 0.
- `node --test --test-reporter=tap scripts/no-change-dir-refs.test.mjs`:
  `1..3`, `# tests 3`, `# pass 3`, `# fail 0`, exit 0.

No full suite, build, verify script, Pulse, bead update/close, merge, or push
was run. No required work was left undone.
