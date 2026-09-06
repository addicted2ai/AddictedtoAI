---
date: 2026-09-06
slug: covered-designation-misses-the-batch-and-alias-cohort
type: repair
summary: >
  Propagate Anthropic's Covered Models designation from
  `model/anthropic-claude-fable-5` and `model/anthropic-claude-fable-5-1` to the
  three sibling entries that address the same weights through a different access
  envelope — `model/anthropic-claude-fable-5-batch`,
  `model/anthropic-claude-fable-5-1-batch` and
  `model/anthropic-claude-fable-latest` — and decide, once and in writing, what
  the general rule is for a per-model policy fact when the corpus carries a
  model several times. The Covered Models page says "These policies follow the
  model. They apply wherever Covered Models are offered", so a reader who lands
  on the batch entry of Fable 5.1 and sees no designation and no retention
  posture is reading a page that is silent about the one term of service that
  distinguishes this model from its predecessors. The repair is either three
  entries gaining the four designation facts, or a declared relation from an
  access-envelope entry to its canonical model that lets a policy fact render
  once and appear on all of them; the job's first output should be the choice
  and its reason, not the edit.
evidence: >
  Measured in this worktree on 2026-09-06, while adding the designation facts
  the entry job `j-20260906-16` was scoped to.
  https://support.claude.com/en/articles/15425695-covered-models (retrieved
  2026-09-06, embedded dateModified 2026-09-01T17:59:45Z; every sentence below
  confirmed present in the fetched HTML bytes, not in a summariser's rendering)
  — "These policies follow the model. They apply wherever Covered Models are
  offered, including third-party cloud platforms." and "Accordingly, zero data
  retention is not available in workspaces, Claude Enterprise organizations, or
  third-party platforms (e.g., Azure Subscriptions) where Covered Models can be
  accessed."
  The corpus side: `content/wiki/model/anthropic-claude-fable-5-batch.md`,
  `anthropic-claude-fable-5-1-batch.md` and `anthropic-claude-fable-latest.md`
  each declare a `feeds.openrouter-models` row id of `anthropic/claude-fable-5:batch`,
  `anthropic/claude-fable-5.1:batch` and `~anthropic/claude-fable-latest`
  respectively, carry four feed-bound facts and nothing else, and after
  `j-20260906-16` they are the only Fable entries with no `covered_model_designated`,
  `covered_model_status`, `covered_model_availability` or `zero_data_retention`
  fact. Read from the files on 2026-09-06.
  The related but distinct proposal is
  `data/proposals/same-weights-two-access-envelopes.md` (2026-09-06, type
  `post`), which argues the Fable/Mythos gating as a story; this one is about
  the corpus rendering a policy on two of five pages that describe one model.
---

The designation is the first fact this corpus has carried that is a property of
the *weights* rather than of a listing, and the batch cohort is where that
distinction stops being academic. A price is genuinely per-listing: the batch
endpoint costs less, so a batch entry carrying its own `price_input` is correct
and the duplication is not duplication at all. A retention policy is not
per-listing. Anthropic's page says so in four words — "These policies follow the
model" — and a customer routing Fable 5.1 through the batch endpoint has exactly
the same zero-data-retention answer as one calling it synchronously.

So the corpus is now in a state where five pages describe two models and two of
them say what the terms are. That is worse than none of them saying it, because
a reader who checks the batch page and finds nothing has been told, by the
site's own conventions, that there is nothing to tell.

Two shapes are available and the job should pick deliberately rather than take
the first.

**Copy the four facts onto the three entries.** Cheapest, needs no machinery,
and consistent with how every other fact in this corpus works: an entry is a
self-contained record and two entries citing one source is normal. The cost is
that the next designation change edits five files instead of two, and the
failure mode when someone edits three of five is silent.

**Declare the relation and render through it.** An access-envelope entry names
its canonical model, and a policy fact declared on the canonical one renders on
all of them with the canonical entry named. This is the shape the repository
already reaches for — `feeds` binds on a declared row id, `corroborates` binds
one fact to another by declaration, and neither infers anything from a name. It
is also more work than this repair needs on its own, and it would want to be
justified by more than one policy fact.

There is a third answer worth ruling out explicitly rather than by omission:
leave the batch entries alone on the grounds that they are stubs. They are not
stubs by accident — they render, they are in the catalog, and they are what a
reader searching "Fable 5.1 batch" lands on.

Whichever is chosen, the durable output is the rule written down, because the
next vendor policy that attaches to weights rather than to a listing will hit
the same fork, and `anthropic-claude-opus-*` already carries the same
canonical/batch/fast/latest fan-out that Fable does.
