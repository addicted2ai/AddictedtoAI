---
id: model/cited-overdue
kind: model
display_name: "Cited Overdue"
status: deprecated
maintenance: dormant
aliases:
  - name: "Cited Overdue"
    class: exclusive
facts:
  # 45 days before the tests' pinned clock (2026-08-28) with a 14-day `fast`
  # interval: the build must inject a visible overdue marker.
  - field: price_input
    source: cited
    value: "3.00 USD per million input tokens"
    source_url: "https://example.org/cited-overdue/pricing"
    accessed: "2026-07-14"
    volatility: fast
  # 45 days old against a 120-day `slow` interval: in date.
  - field: license
    source: cited
    value: "proprietary"
    source_url: "https://example.org/cited-overdue/license"
    accessed: "2026-07-14"
    volatility: slow
timeline:
  - date: "2026-07-01"
    event: deprecated
    source_url: "https://example.org/cited-overdue/deprecation"
mentions: []
---
