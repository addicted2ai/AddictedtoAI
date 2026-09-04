# Tasks

- [x] 1. `pulse/lib/queue.mjs`: `carriedFindingItems` groups the files it reads
      by `subject:` and emits one item per group. A subject-less finding keys
      on its own path, so it never groups.
- [x] 2. A group of one is byte-identical to what it produced before grouping
      existed — same title, same detail, the generated sections included. Its
      body already reads correctly on its own.
- [x] 3. A batched `detail` states each finding under its own heading, names
      the carried file holding it, and closes with ONE retirement instruction
      listing every path. The two sections `loop/lib/carry.mjs` generates into
      every file are dropped from a batch: repeated four times they are noise,
      and each says "delete **this** file" without naming it — unambiguous in a
      one-finding brief, exactly ambiguous in a four-finding one.
- [x] 4. Leave the total order in `computeQueue` alone. Ordering the carried
      block by batch size would put the largest batch permanently at its head,
      which is `addictedtoai-5hn`'s failure.
- [x] 5. Update the `gatherCandidates` doc comment in `loop/lib/select.mjs`,
      which states the 76%-onto-an-already-carried-file measurement as an
      unacted-on observation.
- [x] 6. Tests in `pulse/tests/carry-queue.test.mjs`: several findings on one
      subject are one job; a lone finding is unchanged; subject-less findings
      never group; a batch retires finding by finding; a reviewer's own use of
      the `## Origin` heading survives the strip.
- [x] 7. Mutation test, three factors reverted separately.
- [x] 8. `openspec validate batch-carried-findings-by-subject --type change --strict --no-interactive`
      and `node scripts/check-spec-deltas.mjs --strict`.
- [x] 9. Gates: `npm test`, `npm run build`, verify-launch, verify-design,
      verify-surfaces, verify-analytics.
- [ ] 10. Drive it end to end: one Desk run against the four-finding subject,
      and read what the brief actually contained rather than what it was meant
      to contain.

## Mutation test (2026-09-03)

Each factor reverted separately in `pulse/lib/queue.mjs`, the file verified
byte-identical afterwards by sha256. Every mutation failed, and each failed the
test written to catch it:

```
grouping off (one item per file again)
  FAILS  several findings on ONE subject become ONE job, not one job each
  FAILS  a batch retires finding by finding
  FAILS  a batched finding whose own prose contains an "## Origin" heading keeps it
  FAILS  multiple carried findings sort deterministically by subject
  FAILS  a carried-finding file becomes a queue item with its own title

singleton passthrough off (a lone finding gets batch furniture)
  FAILS  a lone finding is unchanged by grouping — same title, same detail
  FAILS  a carried-finding file becomes a queue item with its own title
  FAILS  computeQueue includes carried findings alongside everything else
  passes findings with NO subject never group together

boilerplate stripping off (the generated sections survive into a batch)
  FAILS  several findings on ONE subject become ONE job, not one job each
  FAILS  a batched finding whose own prose contains an "## Origin" heading keeps it
  passes a lone finding is unchanged by grouping
  passes findings with NO subject never group together
```

The three mutations fail overlapping but distinct sets, and the
subject-less-findings control passes in two of the three worlds — which is what
makes it a control rather than a restatement.

## What was measured, and when

Read out of `data/carried/` on 2026-09-03 after `j-20260903-14` merged: **27
findings on 16 subjects**; largest subject `content/blog/glm-5-3-license-revenue-gate.md`
with 4; top seven subjects holding 18 of 27. Earlier the same evening, before
that job, it was 26 on 15.
