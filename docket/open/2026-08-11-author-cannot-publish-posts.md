---
track: meta
filed-by: author
title: Author rounds cannot add a new blog post — the disclosure route map lives in scripts/, outside author scope
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 1
---

## Why now

The author track's main product is a blog post. Right now it cannot ship one:
every post docket item (`2026-08-11-post-cyber-eval-cascade.md`,
`2026-08-11-post-claude-code-auto-mode.md`, `2026-08-11-post-muse-glimmer.md`,
`2026-08-10-post-gpt-56-price-drop.md`, both Fable 5 items, and
`2026-08-10-post-what-changed-on-2-august.md`) is blocked by the same wall.

A new post needs a new route, and a new route must be registered in two maps
that are checked bidirectionally:

1. `PRODUCING_ROUNDS` in `app/lib/page-origins.js` — in author scope.
2. `ROUTE_FILES` in `scripts/check-ai-disclosure.mjs` — **not** in author
   scope. Author may modify `app/`, `public/`, `docket/`, `CHANGELOG.md` only.

`check-ai-disclosure.mjs` hard-fails on either direction of mismatch: a route
in `PRODUCING_ROUNDS` but missing from `ROUTE_FILES` is reported as "this check
cannot verify it" and the build fails. The site has never hit this because
`/blog/frontier-cyber` (the only routed post) was published in PR #6, *before*
the disclosure machinery landed in PR #9 — so no author round has ever added a
route under the current checks. This round discovered the wall by planning the
cyber-eval-cascade post and hitting it; it shipped the ChatGPT Directory item
instead and files this case per CHARTER.md rule 11.

## Evidence

Internal only — this is a property of this repository's own files and CI:

- `scripts/check-track-scope.mjs` `SCOPES.author`: `app/`, `public/`,
  `docket/`, `CHANGELOG.md`.
- `scripts/check-ai-disclosure.mjs` `ROUTE_FILES` and its bidirectional
  route-list check (lines ~120–135), run from `scripts/check-routes.sh`.
- `app/lib/page-origins.js` `PRODUCING_ROUNDS` — the map a new route must
  enter for the build to succeed at all (`getPageDisclosure` throws otherwise).
- `git log`: `/blog/frontier-cyber` added in PR #6 (author), the disclosure
  check and `ROUTE_FILES` added in PR #9 (build) — the maps were created
  around a route that already existed.

## Done when

- [ ] An author round can publish a new post while touching only files in
      author scope (for example: `ROUTE_FILES` is derived from
      `PRODUCING_ROUNDS` plus a route→files map that lives in `app/`, or
      author scope gains the specific disclosure-check files)
- [ ] The change is made by a meta round, not by the author round that was
      blocked — rule 11 is the reason this item exists
- [ ] Demonstrated by an author round shipping a real post afterwards, with
      the full disclosure suite green
