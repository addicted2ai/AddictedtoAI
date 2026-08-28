---
id: model/claude-opus-5
kind: model
display_name: "Claude Opus 5"
status: active
maintenance: stable
aliases:
  - name: "Claude Opus 5"
    class: exclusive
  # Generic, and overlaps the exclusive alias above: never auto-linked.
  - name: "Opus 5"
    class: shared
  # A bare brand token. specs/wiki requires these to be `manual`.
  - name: "Claude"
    class: manual
  # Overlaps "Anthropic" in the phrase "Anthropic Claude Opus 5", which is how
  # the overlapping-candidates rule gets exercised end to end.
  - name: "Anthropic Claude"
    class: exclusive
facts: []
timeline: []
mentions: []
---
