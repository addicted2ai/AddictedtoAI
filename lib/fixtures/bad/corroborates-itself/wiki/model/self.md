---
id: model/self
kind: model
display_name: "Self"
status: active
maintenance: stable
aliases:
  - name: "Self"
    class: exclusive
facts:
  # A fact naming itself. It resolves, so a "does the field exist" check alone
  # would accept it, and it would then compare a value with itself and agree
  # forever.
  - field: parameters
    source: cited
    value: "304B params"
    source_url: "https://example.com/model-card"
    accessed: "2026-08-28"
    volatility: static
    corroborates: parameters
timeline: []
mentions: []
---
