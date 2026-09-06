---
date: 2026-09-05
slug: org-directives-demand-a-feeds-map-that-cannot-exist
type: interpret
summary: >
  All eight `entry` directives written so far for the uncovered catalog
  providers — seven of them still unrun — carry the sentence "WHAT THE ENTRY
  MUST CARRY OR THE ROW IS BLANK: its `feeds` map, which is the join the board
  relies on", and the population they are drawn from is 34. Measured
  against the code, that premise is false in both halves: the board joins an
  org to its catalog rows by ALIAS (`matchProviders`,
  `lib/render/frontier.mjs:50`), not by `feeds`, and no registered source
  yields organisation-keyed rows for an org `feeds` map to bind to
  (`data/sources/registry.json` — both sources are keyed on a model id). A job
  that complies literally writes a wrong join, which the same directive
  forbids in its next sentence. This job would settle the question in the
  record and correct the remaining directive lines: state what the board's org
  join actually is, state that an org entry carries no `feeds` map, and say
  where the brand-domain half belongs now that `publishes_from` is specified
  but unimplemented.
evidence: >
  Measured in this worktree on 2026-09-05 while writing `org/minimax`.
  (1) `lib/render/frontier.mjs:50-61`, `matchProviders(org, catalogRawRows)`:
  the provider set is built from `org.data.display_name` and
  `org.data.aliases[].name`, normalised, matched against `row.provider` by
  containment. `feeds` is never read. (2) `grep -rn "feeds"
  content/wiki/org/*.md` returns nothing — not one of the 16 existing org
  entries carries a `feeds` map, and every one of them renders a filled
  frontier row. (3) `org/minimax` was written with no `feeds` map, and
  `out/frontier.txt` after `npm run build` renders its row joined to
  `MiniMax: MiniMax M3` with price and context filled. (4)
  `data/sources/registry.json`: `openrouter-models` keys its rows on a model
  `id`, `llm-releases` on a per-release `guid`; no registered source is keyed
  on an organisation, so an org `feeds` value could only name a model row —
  which
  `lib/changes.mjs:63` and `pulse/lib/mint.mjs:261` would then treat as that
  row's owning entry, colliding with the model entry that already declares it.
  (5) The same directives require `publishes_from`; `entrySchema` is
  `.strict()` (`lib/schema.mjs:209-223`) and does not define it, so an entry
  carrying it fails the build. That half is already scheduled as tasks 12 and
  15 of `openspec/changes/separate-a-claim-from-a-fact/tasks.md` and is not
  what this proposal asks for.
expires: 2026-09-20
---

The cost is per-job and it accrues on a schedule, which is why this carries an
expiry rather than cooling. Seven `entry` directives for uncovered catalog
providers are still queued in `DIRECTIVES.md`, each repeating the same two
instructions verbatim, and 26 more providers have no directive written yet —
so the sentence will be copied again unless it is corrected at the source. A
job that reads it literally has three exits and two of them are bad: invent an
org `feeds` entry pointing at one of its own model rows (a wrong join, and one
that two other subsystems act on); add `publishes_from` and fail the build; or
work out for itself, as this one did, that the sentence describes a mechanism
the repository does not have — which costs a chunk of every job's budget to
rediscover, once per job.

The ruling worth recording is narrow and mechanical. The board's org join is
the alias join; an org entry declares no `feeds`; and the brand-domain
requirement is real but currently unlandable, so until
`separate-a-claim-from-a-fact` tasks 12 and 15 land, an org's own domain
reaches the vendor test only through the name-token half of `isVendorSourced`.
That half works for `minimax.io` and fails for `hailuoai.video` and
`talkie-ai.com`, both linked from MiniMax's own front page — so the FM-N6 gap
the directives correctly worry about is real, it is just not addressable from
an entry today.

Where the ruling should live is part of the job, exactly as it was for
`j-20260905-25`: the directive text itself is the place the next author meets
it, and `lib/render/frontier.mjs`'s block comment is the place the next
implementer does.
