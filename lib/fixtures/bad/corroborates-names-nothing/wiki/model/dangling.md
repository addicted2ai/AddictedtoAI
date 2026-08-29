---
id: model/dangling
kind: model
display_name: "Dangling"
status: active
maintenance: stable
aliases:
  - name: "Dangling"
    class: exclusive
facts:
  # `corroborates` names a field no fact on this entry declares. Nothing would
  # ever be compared, and without this failure the declaration would sit here
  # looking like a guardrail while checking nothing — the exact silence the
  # mechanism exists to end. specs/wiki: "The build SHALL fail, naming the entry
  # and the field."
  - field: card_parameters
    source: cited
    value: "304B params"
    source_url: "https://example.com/model-card"
    accessed: "2026-08-28"
    volatility: static
    corroborates: parameters
timeline: []
mentions: []
---
