---
id: model/cited-fresh
kind: model
display_name: "Cited Fresh"
status: active
maintenance: stable
aliases:
  - name: "Cited Fresh"
    class: exclusive
facts:
  # Checked 3 days before the tests' pinned clock (2026-08-28): inside the
  # 14-day `fast` interval, so no overdue marker.
  - field: license
    source: cited
    value: "Apache-2.0"
    source_url: "https://example.org/cited-fresh/license"
    accessed: "2026-08-25"
    volatility: fast
  # `dated` is true as of its date and is never re-checked, so it can never
  # be overdue however old it gets.
  - field: release_date
    source: cited
    value: "2024-01-15"
    source_url: "https://example.org/cited-fresh/release"
    accessed: "2024-01-16"
    volatility: dated
timeline:
  - date: "2024-01-15"
    event: released
    source_url: "https://example.org/cited-fresh/release"
mentions: []
---
