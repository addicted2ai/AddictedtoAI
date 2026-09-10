# Banked wild control for wisdom items 5 and 6: the sha that resolves to nothing

Date (local): 2026-09-10. Banked by: orchestrator (Muse Spark), because
the phased plan (`wisdom/README.md` §8) forbids writing items 5/6 until
this control is banked somewhere durable, and until now it survived
only as typed-out text.

## The incident (wisdom README §7b, committed prose; this file banks the checkable part)

On 2026-09-09 A2AI-Orch recorded the drifted `data/launch.json` blob as
`03e2207` — in two board entries, in a message, and in the body of the
bead arguing for better evidence — and offered its byte-identity with
an earlier blob as the observation separating two states from noise.
The earlier blob is `9c272f4` (drift-history: `9c272f4 -> 03e2207`).

`03e2207` was produced by `git hash-object` WITHOUT `-w`: it computes
a sha and writes nothing. The object never existed.

## Verification, re-run at banking time (commands, not prose)

- `git cat-file -t 9c272f4` → `blob` (exists).
- `git cat-file -t 03e2207` → `fatal: Not a valid object name` (does not exist).
- `git hash-object data/launch.json` at banking time → a third, different
  sha (the file has since moved on), which is the point: blob shas of a
  drifting file are moments, not evidence, unless the bytes are kept.

## What this control is for

- Item 5a (measurement lineage): a measurement must carry producer,
  input digest, source snapshot and method. `03e2207` is an input
  digest with no input — lineage pointing at nothing. An instrument
  accepting it as lineage is the defect.
- Item 6 (figure provenance, narrowed): a figure a later decision reads
  must carry its source. `03e2207` reads exactly like evidence
  (40 hex chars in the record that argued for evidence) and refers to
  nothing.

## The fix it already produced (not this file's to re-argue)

Orch fixed it in the instrument rather than in a note: the gate
harness now samples state before the run and copies the drifted file
into the run directory before anyone can revert it, one row per run
including clean ones. See `wisdom/tools/orch/orch-gates-only.sh`
(comments at the `03e2207` lines) and the launch-json drift history at
`wisdom/tools/orch/baselines/launch-json-drift-history.tsv`.

## Caveat carried with the control

Six observations of a real bimodal fault, zero durable copies of the
drifted bytes. The value pair survives only as typed-out text — here
included. Any future instrument test that needs the BYTES (not the
shape) must construct them; it must say so, per the constructed-control
rule.
