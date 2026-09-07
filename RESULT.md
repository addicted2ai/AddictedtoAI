done

Added `scripts/no-change-dir-refs.test.mjs`, which scans the requested source
directories and extensions, skips generated/dependency/fixture-output trees,
rejects unarchived change-directory references with file and line details, and
enforces reasoned, non-stale operational allow-list entries. Updated the one
CLAUDE.md Build & Test row to:

`openspec validate build-initial-site --type change --strict --no-interactive`

The initial scan found real references. I allowed the delta checker, its tests,
and the in-flight-change discovery module because their jobs operate on change
directories. I rewrote unrelated prose and a breaker fixture to avoid stale
unarchived references.

Commands and output:

`node --test D:/addictedtoai-worktrees/fleet-2hsy/scripts/no-change-dir-refs.test.mjs`

```text
✔ no source references an unarchived change directory
✔ the check matches a bad literal and ignores an archived literal
✔ every allow-list entry has a reason and is still live
ℹ tests 3
ℹ pass 3
```

`node --test D:/addictedtoai-worktrees/fleet-2hsy/scripts/local-dates.test.mjs`

```text
✔ no file mints a calendar date in the UTC frame
✔ the check actually fires — it is not a regex that matches nothing
✔ comment stripping hides a doc comment about the broken form, and nothing else
✔ every allowlist entry names one of the five categories and a reason
✔ no allowlist entry is stale — an entry that matches nothing must be removed
✔ the three local-date helpers exist and agree with each other
ℹ tests 6
ℹ pass 6
```

Mutation proof: temporarily created `lib/ISSUE-2hsy-mutation.js` containing an
unarchived reference. The test failed and reported
`lib/ISSUE-2hsy-mutation.js:1`, quoting `const broken =
'openspec/changes/foo/bar.md';`. The scratch file was deleted, and the test
then passed.

Stale-entry proof: temporarily changed an allow-list file to
`scripts/ISSUE-2hsy-no-such-file.mjs`. The test failed with
`scripts/ISSUE-2hsy-no-such-file.mjs::openspec/changes/ is stale and must be
removed`. The original entry was restored, and the test passed.

The unrelated pre-existing ` .agent-brief.md` remains unmodified and untracked.
