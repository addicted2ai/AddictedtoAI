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
- (empty — scaffold created, no loop runs yet)

<!--
Entry template for future weeks:

### YYYY-MM-DD
- Hypothesis: <what we expected and why>
- Change: <what was actually shipped> (PR #N)
- Guardrails: pass/fail
- Result (measured the following week): <metric delta, or "not yet measured">
-->
