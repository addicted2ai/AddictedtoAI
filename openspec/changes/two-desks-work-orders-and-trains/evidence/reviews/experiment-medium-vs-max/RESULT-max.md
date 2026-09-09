# Result

Date: 2026-09-08 22:18 local

## Changes

- loop/tests/portability.test.mjs
  - Lines 16-18 add temporary-fixture helpers.
  - Lines 31-32 define the two-file scan floor and the three newly covered
    runner roots.
  - Lines 34-44 let the runner scan exclude legitimate test-source fixtures.
  - Lines 77-107 make scan report both hits and the number of existing files
    read, keep the model scan at loop plus data/config.json, and extend only
    the runner-id scan to lib, app, and tools.
  - Lines 131-165 enforce the floor in both production scans.
  - Lines 174-201 create one runner-id fixture under each of lib, app, and
    tools, and assert each hit independently as a named mutation arm. The
    temporary fixture tree is removed in finally.
- scripts/no-change-dir-refs.test.mjs
  - Lines 33-48 replace the blanket CHANGE_DIR permission with regexes for
    the generic variable/template constructions. The existing live-one
    temporary fixture remains a specific legitimate fixture alternative.
  - Lines 70 and 92 use the regex matchers rather than substring matching.
- loop/lib/specs.mjs
  - Lines 23-24 describe the archive form:
    openspec/changes/archive/<YYYY-MM-DD>-<name>/...

The model/provider/harness scan was not widened.

## Red proofs

The following are TAP output excerpts copied from real failing runs. Every run
had the stated test total and a nonzero exit. Each source mutation was restored
before the next proof.

1. Runner-id fixture under lib

Mutation: remove the lib spread from runnerTargets.

    not ok 5 - the runner-id scan catches a fixture under each newly covered root
    error: |-
      mutation runner-id target lib/ must be scanned and rejected
    1..13
    # tests 13
    # pass 12
    # fail 1

Portability SHA-256 before: 1D6F6CA2C93F8699D625E95A66016C25816883BAAB033B8B2ED2E3128ACC4D0C
Portability SHA-256 after restoration: 1D6F6CA2C93F8699D625E95A66016C25816883BAAB033B8B2ED2E3128ACC4D0C
Byte-identical: yes.

2. Runner-id fixture under app

Mutation: remove the app spread from runnerTargets.

    not ok 5 - the runner-id scan catches a fixture under each newly covered root
    error: |-
      mutation runner-id target app/ must be scanned and rejected
    1..13
    # tests 13
    # pass 12
    # fail 1

Portability SHA-256 before: 1D6F6CA2C93F8699D625E95A66016C25816883BAAB033B8B2ED2E3128ACC4D0C
Portability SHA-256 after restoration: 1D6F6CA2C93F8699D625E95A66016C25816883BAAB033B8B2ED2E3128ACC4D0C
Byte-identical: yes.

3. Runner-id fixture under tools

Mutation: remove the tools spread from runnerTargets.

    not ok 5 - the runner-id scan catches a fixture under each newly covered root
    error: |-
      mutation runner-id target tools/ must be scanned and rejected
    1..13
    # tests 13
    # pass 12
    # fail 1

Portability SHA-256 before: 1D6F6CA2C93F8699D625E95A66016C25816883BAAB033B8B2ED2E3128ACC4D0C
Portability SHA-256 after restoration: 1D6F6CA2C93F8699D625E95A66016C25816883BAAB033B8B2ED2E3128ACC4D0C
Byte-identical: yes.

4. Files-scanned floor

Mutation: insert an early return in filesUnder so every recursive target
list is empty, while the explicit data/config.json target remains.

    not ok 3 - the loop and the loop config name no model, provider or harness at all
    error: 'the model/provider/harness scan must read at least 2 files; read 1'
    not ok 4 - no machinery path references a runner by id
    error: 'the runner-id scan must read at least 2 files; read 1'
    not ok 5 - the runner-id scan catches a fixture under each newly covered root
    error: |-
      mutation runner-id target lib/ must be scanned and rejected
    not ok 7 - the loop imports no model SDK and runs no push
    1..13
    # tests 13
    # pass 9
    # fail 4

Portability SHA-256 before: 1D6F6CA2C93F8699D625E95A66016C25816883BAAB033B8B2ED2E3128ACC4D0C
Portability SHA-256 after restoration: 1D6F6CA2C93F8699D625E95A66016C25816883BAAB033B8B2ED2E3128ACC4D0C
Byte-identical: yes.

5. Named path in an allow-listed fixture file

Mutation: change the existing scripts/check-spec-deltas.test.mjs fixture path
at line 468 from live-one to named-mutation.

    not ok 1 - no source references an unarchived change directory
    + file: 'scripts/check-spec-deltas.test.mjs'
    + line: 468
    + reference: 'openspec/changes/'
    + text: "  await write('openspec/changes/named-mutation/specs/demo/spec.md', deltaFile({ modified: [req(GATE)] }));"
    1..3
    # tests 3
    # pass 2
    # fail 1

Fixture SHA-256 before: A8435A86D164CDCC859E47C790BF8C3AF35D45E4647C5F1DB7F729A19D115E1D
Fixture SHA-256 after restoration: A8435A86D164CDCC859E47C790BF8C3AF35D45E4647C5F1DB7F729A19D115E1D
Byte-identical: yes.

## Clean targeted runs

node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-exp-max/loop/tests/portability.test.mjs

    1..13
    # tests 13
    # pass 13
    # fail 0

node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-exp-max/scripts/no-change-dir-refs.test.mjs

    1..3
    # tests 3
    # pass 3
    # fail 0

No full suite, build, verifier, or Pulse was run, per the request. No task
artifact was edited, including the enabled:false half of task 22. No new test
file or package file was created. The temporary runner fixture trees are
deleted by the test cleanup, and the temporary named-path mutation was
restored and hash-checked.
