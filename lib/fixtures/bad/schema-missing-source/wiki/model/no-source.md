---
id: model/no-source
kind: model
display_name: "No Source"
status: active
maintenance: stable
aliases:
  - name: "No Source"
    class: exclusive
facts:
  # A `cited` fact with no `source_url` and no `accessed` date. specs/wiki:
  # "Fact without a source fails the build ... naming the entry and the field."
  - field: price_input
    source: cited
    value: "3.00"
    volatility: fast
timeline: []
mentions: []
---
