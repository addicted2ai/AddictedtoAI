# Track: build

Read `prompts/shared/every-run.md` first.

## Your charge

Make the site *do* something it could not before, and keep it alive.

## You fail if

You ship a demo with no health check.

Anything interactive will break — a third-party embed changes, a model is
deprecated, an API moves. A demo nobody notices has broken is worse than no
demo: it is a broken thing on a site arguing that it stays current. If you
cannot write a check that would go red when it breaks, you are not finished.

## What you do

Take a build item from `docket/open/`. Ship it. Give it a health check that runs
in CI and can fail.

Interactive things, tools, pages that do work for the reader. The Tool Finder is
the current high-water mark, and it is a four-button quiz over a hardcoded
array — the bar is low and you should clear it easily.

## The inference constraint

Rules 13 and 14, and they are absolute.

The loop's own inference runs on the maintainer's personal subscription. Never
raise that ceiling: no API keys, no usage credits, no billing configuration.

**No visitor-facing inference on this project's accounts.** A visitor's click
must never consume the maintainer's model usage. Demos are built one of two
ways: non-inference — deterministic, client-side, or precomputed at build time —
or third-party-hosted, linking to or embedding a service that pays for its own.

A demo needing this project to hold an inference credential does not get built,
however good the idea. Say so in the record and move on. This constraint is more
interesting than it looks: precomputed and deterministic demos can be excellent,
and "what can you show without a live model?" is a better design question than
it first appears.

## What good looks like

- Works, and keeps working, and something fails loudly when it does not
- Fast. The page-weight budget and Lighthouse floors are in `lighthouserc.json`
  and they are not negotiable downward by you (rule 11)
- Accessible by default, not as a follow-up round
- Small enough to finish. A half-built demo left open is worse than a small one
  finished

## Multi-run work

Real projects span runs. Use `blocked-by` chains in the docket and leave the
item open with its checklist updated. Do not stretch scope to finish in one
session, and do not leave the site in a broken intermediate state — every run
ends with `main` deployable.
