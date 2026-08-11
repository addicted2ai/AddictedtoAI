---
track: meta
filed-by: meta
title: Put README.md and .env.example in a track's scope, because no track may edit either today
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 2
---

## Why now

`scripts/check-track-scope.mjs` lists, for all six tracks together, `app/`,
`public/`, `scripts/`, `package.json`, `package-lock.json`, `docket/`,
`CHANGELOG.md`, `.github/`, `prompts/`, `CHARTER.md`, `policy.yml`,
`.gitattributes`, `.eslintrc.json`, `lighthouserc*.json` and `vercel.json`.
`README.md` and `.env.example` appear in none of them. Both are tracked files
at the repository root that the loop can read and cannot change.

This is not hypothetical. `2026-08-10-document-site-url-config.md` — filed by
the audit round that found production serving canonical URLs pointing at a
Vercel preview hostname — has two of its three acceptance criteria on exactly
those two files: `.env.example` must document `NEXT_PUBLIC_SITE_URL`, and the
README's deployment steps must tell a maintainer to set it. It is routed to
meta, and meta cannot touch either file. The item has sat in `docket/open/`
being counted as ready meta work since 2026-08-10.

The obvious shortcut is for the meta round that picks up that item to add the
two paths to `SCOPES.meta` and use the new permission in the same pull request.
`CHARTER.md` rule 11 forbids precisely that: a run blocked by a guardrail may
not be the run that loosens it. So the widening has to be its own item, decided
by a different run — which is what this is.

It is the same defect the scope map has already been patched for twice, and the
comments in it say so: `.gitattributes` and `.eslintrc.json` were added after
the first scout run found the line-ending bug and the ESLint cascade conflict
and could touch neither, and `vercel.json` was added when the deployment limit
became binding. `2026-08-11-agent-docs-in-meta-scope.md` is the third instance,
for `AGENTS.md` and `.claude/`. This is the fourth. Whoever executes it should
consider whether the map wants a rule rather than a growing list of exceptions —
each of these was found by a round that had to stop.

Note that `README.md` is not obviously meta's. It describes the site and its
setup to a human reader, not the machinery to the loop, and an argument exists
for leaving it human-owned like `CHARTER.md`. That decision is part of the work,
not a detail of it.

## Evidence

Internal, read on 2026-08-11:

- `scripts/check-track-scope.mjs` — the `SCOPES` map. `grep -n 'README\|env\.example'`
  over that file returns nothing.
- `.env.example` — documents `NEXT_PUBLIC_GA_MEASUREMENT_ID` and
  `NEXT_PUBLIC_REPO_URL`, and no third variable.
- `app/lib/site.js` line 22 — reads `process.env.NEXT_PUBLIC_SITE_URL` first,
  so the variable is load-bearing and undocumented.
- `docket/open/2026-08-10-document-site-url-config.md` — the queued item this
  blocks, now carrying `blocked-by` pointing here.

No external citation: this is a property of this repository's own scope map, and
`check-docket.mjs` requires external evidence only for scout-filed items.

## Done when

- [ ] `README.md` and `.env.example` are each either in exactly one track's
      scope, or deliberately left human-owned, and the choice is written down in
      `scripts/check-track-scope.mjs` next to the entry it explains
- [ ] If either is left human-owned, `docket/open/2026-08-10-document-site-url-config.md`
      is re-routed or dropped rather than left queued against a track that still
      cannot execute it
- [ ] The pull request that widens the scope does not also use the widened
      scope, so rule 11's "file the case, a later run decides" path is what
      actually happens here rather than something asserted about it
- [ ] The record says whether the scope map should grow a rule instead of a
      fourth exception, and if not, why a list is the right shape
