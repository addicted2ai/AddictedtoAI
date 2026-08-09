# Changelog & Loop Log

This file is the loop's memory. Every entry records a hypothesis, what
shipped, and — the following week — whether it actually moved the metric.
The weekly proposal step reads this file before deciding what to try next,
so keep entries short and honest, including the failures.

## North star
Returning-visitor rate (site-wide).

## Section metrics
- Blog: organic search traffic, avg. read time, scroll depth
- Directory: outbound clicks to tools, on-site search usage
- Projects: inquiry/contact clicks, outbound repo clicks, time on page
- Demos: completion rate, repeat-use rate, session length

## Guardrails (never regress these)
- Lighthouse performance / accessibility / SEO: all >= 0.85
- Zero net-new broken links
- No failed deploy / rollback

---

## Log

### Unreleased
- Hypothesis: The homepage was a placeholder with no real entry points
  into the four sections (nav links only). Visitors landing on `/` had
  no on-page reason to explore more than one section, and session depth
  (sections visited per session) is a leading indicator for the
  north-star metric, returning-visitor rate. Replacing the placeholder
  copy with four clickable section cards (title + one-line value prop)
  should increase clicks from `/` into `/blog`, `/directory`,
  `/projects`, and `/demos`, which should in turn lift returning-visitor
  rate.
- Change: Replaced the placeholder homepage body with a `section-grid`
  of four `section-card` links (one per section, matching the metrics
  already documented per-section), styled to match the existing dark
  theme. (PR #TBD)
- Guardrails: pass (local `next build` clean; no new links beyond the
  four existing section routes, all already covered by nav)
- Result (measured the following week): not yet measured

<!--
Entry template for future weeks:

### YYYY-MM-DD
- Hypothesis: <what we expected and why>
- Change: <what was actually shipped> (PR #N)
- Guardrails: pass/fail
- Result (measured the following week): <metric delta, or "not yet measured">
-->
