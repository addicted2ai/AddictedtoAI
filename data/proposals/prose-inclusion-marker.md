---
slug: prose-inclusion-marker
type: machinery
date: 2026-09-02
summary: >
  Add an explicit prose-inclusion marker to the transclusion machinery so a
  passage shared between sibling entries is authored once and rendered on
  every page that includes it. Two reviews in two days offered "make it a
  shared transclusion" as the cure for a paragraph duplicated verbatim across
  the two fast-page model entries, and the machinery has no such mechanism:
  `{{fact:...}}` renders a fact value, `{{want:...}}` renders a name, and any
  other `{{...}}` marker is a build error. A proposed machinery job would add
  a marker (e.g. `{{include:<path>}}`) resolved from the corpus at build time,
  following the existing explicit-marker philosophy — no scanning, no fuzzy
  matching — so that structural sharing is a real option the next time a
  reviewer prefers it, and the uniform-block finding stays meaningful because
  a transcluded block is one authored passage, not two copy-pasted ones.
evidence: >
  The review record for job j-20260902-05 (data/reviews/j-20260902-05.md,
  written 2026-09-02) carried the finding that the identical ~55-word
  endpoints caveat on anthropic-claude-opus-4-8-fast.md and
  anthropic-claude-opus-5-fast.md was "the uniform-block shape the voice bar
  exists to catch", and named two cures: reword one, "or bind the shared half
  as a `{{fact:…}}`-style transclusion so the duplication is structural rather
  than authored". The revision review for job j-20260902-08 repeated the same
  option. lib/transclude.mjs (lines 24-25) defines only FACT_RE and WANT_RE,
  and lines 123-131 make any other `{{...}}` marker a build error named
  bad-marker, so the second cure is not implementable; this job reworded the
  paragraph instead, which is what the machinery can do today.
proposed_by_job: j-20260902-08
proposed_by_type: repair
---