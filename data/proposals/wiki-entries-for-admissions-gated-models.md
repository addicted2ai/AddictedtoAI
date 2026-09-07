---
date: 2026-09-07
slug: wiki-entries-for-admissions-gated-models
type: entry
summary: >
  Write wiki model entries for Claude Mythos 5.1 and Gemini 3.8 Flash Cyber,
  the two frontier models released in the first week of September 2026 that
  the corpus currently has no record of at all. Both exist, both are dated,
  both have vendor primary sources, and neither has a wiki entry — because
  model entries in this corpus are minted from gateway catalog rows, and a
  model you have to be admitted to a programme to use never gets a catalog
  row. The entries would be sourced from the vendors' own pages rather than
  from a feed (`feeds:` is optional on the entry schema, so an unfeeded model
  entry is valid), and would carry the access programme, the eligibility
  wording and the dated availability timeline as their substance, with no
  price or context-window facts to bind because the vendor publishes none.
  The generally available twins already have entries
  (`model/anthropic-claude-fable-5-1`, `model/google-gemini-3-8-flash`), so
  the gap is visible from inside the corpus: a reader who follows a link to
  Fable 5.1 finds nothing about the model Anthropic calls identical to it.
evidence: >
  Measured in this worktree on 2026-09-07 while writing
  content/blog/same-weights-two-access-envelopes.md. data/changes.jsonl holds
  186 lines, of which 95 are gateway catalog rows carrying an individual model
  id; zero of those 95 ids contain "mythos" or "cyber", while
  anthropic/claude-fable-5.1 (2026-09-02), google/gemini-3.8-flash
  (2026-09-03) and openai/gpt-6-astra (2026-09-05) all arrived on schedule.
  content/wiki/model/ carries no file matching mythos and none for a Cyber
  variant. The feed does carry editorial rows naming both models — "Claude
  Mythos 5.1 ships to trusted-access programs" (2026-09-03) and "Google
  DeepMind introduces Gemini 3.8 Flash Cyber" (2026-09-04) — so the Pulse saw
  the releases; only the catalog half of the pipeline could not.
  Vendor sources, all fetched 2026-09-07 and confirmed present in the raw
  bytes: https://www.anthropic.com/claude-fable-and-mythos-5-1 ("Claude Fable
  5.1 and Claude Mythos 5.1 are the same model, but with different levels of
  safeguards"; the CVP and LSVP paragraphs);
  https://www.anthropic.com/claude/mythos (the Mythos announcement timeline,
  including "Claude Mythos 5 export controls have been lifted", 1 July 2026);
  https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/
  ("both of today's releases are powered by the same foundational
  intelligence"; the Fairwind Program paragraph).
proposed_by_job: j-20260907-02
proposed_by_type: post
---

# The corpus has no record of two frontier models released last week

Both entries are writable today from vendor primary sources, and neither will
become writable by waiting: the mechanism that mints model entries reads a
gateway catalog, and the whole point of these two releases is that they are
not in one.

## Why an entry and not a note

The blog can date an event; it cannot be the place a reader looks up what
Claude Mythos 5.1 is six months from now. The wiki is that place, and this is
the class of model the wiki is currently blind to as a matter of pipeline
shape rather than editorial choice — which makes it exactly the kind of gap
that gets wider quietly. Anthropic has now shipped a Mythos-class model three
times (5 on 9 June 2026, its suspension and restoration in June and July, 5.1
on 1 September) and the corpus records none of them as a model.

## Done when

- `content/wiki/model/anthropic-claude-mythos-5-1.md` and a Gemini 3.8 Flash
  Cyber entry exist, each with its vendor source fetched at writing time and
  quoted, and each stating the access programme by the vendor's own wording
  rather than a characterisation of it.
- Neither entry invents a price, a context window or a benchmark figure. The
  vendors publish none for the gated models, and an absent value renders as
  absent.
- Each entry's timeline carries the dated availability events the vendor
  states, and says which programme is open and which is described in the
  future tense, as of the entry's own date.
- The generally available twin's entry links to it, so the pair is reachable
  from the side a reader is likelier to land on first.
- If the entry schema turns out to require something a feedless model cannot
  supply, the job reports that as a finding rather than inventing a binding.
