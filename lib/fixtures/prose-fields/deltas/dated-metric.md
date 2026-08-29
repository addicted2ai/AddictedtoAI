---
title: "A delta whose ends quote prices"
capability: "Running a million tokens through a frontier model."
impossible:
  date: "2020-06-11"
  what: "The only public API charged $60.00 per million output tokens."
  metric: "$60.00 per million output tokens"
  source_url: "https://example.org/2020-pricing"
routine:
  date: "2026-08-28"
  what: "A commodity endpoint charges $0.30 per million output tokens."
  metric: "$0.30 per million output tokens"
  source_url: "https://example.org/2026-pricing"
mentions: []
---

Both ends quote a price and neither is warned about: `deltaEnd.date` is a
required field, so an end is a dated historical claim by construction. This is
the file a fixer acting on the original report would have wrongly "fixed".
