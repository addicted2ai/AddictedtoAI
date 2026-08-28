---
id: tool/fresh-subject
kind: tool
display_name: "Fresh Subject"
status: active
maintenance: living
aliases:
  - name: "Fresh Subject"
    class: manual
facts:
  # The tutorial fixtures compare their `verified_against` version to this
  # field. A subject with no `version` fact makes no moved-on claim at all —
  # that is the point of the rule in tutorials.mjs.
  - field: version
    source: cited
    value: "0.32"
    source_url: "https://example.org/fresh-subject/releases"
    accessed: "2026-08-27"
    volatility: fast
timeline:
  - date: "2026-08-01"
    event: "0.32 released"
    source_url: "https://example.org/fresh-subject/releases"
mentions: []
---
