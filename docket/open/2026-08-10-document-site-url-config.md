---
track: meta
filed-by: audit
title: Document NEXT_PUBLIC_SITE_URL in .env.example so the production canonical host is configurable
created: 2026-08-10
expires: 2026-11-10
serves: more-checkable
priority: 2
blocked-by: 2026-08-11-no-track-can-edit-readme-or-env-example.md
---

## Why now

The audit round of 2026-08-10 found the production site serving canonicals,
sitemap and JSON-LD URLs pointing at a Vercel preview hostname
(`addictedto-a-idotnet-*.vercel.app`) instead of the production domain. The
code fix (prefer `VERCEL_PROJECT_PRODUCTION_URL`) shipped in that round, but
the audit noted a structural gap while fixing it: `.env.example` documents
`NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_REPO_URL` but not
`NEXT_PUBLIC_SITE_URL` — the one variable that would have let the project pin
its canonical host explicitly, instead of relying on Vercel's deployment
variables at all. The audit round could not edit `.env.example` (out of its
track scope).

This is a documentation gap with a real consequence: the site's canonical
host had no configured source of truth, and the failure was invisible to
every check because all checks verify that a URL *resolves*, not that it is
the *right* host.

## Evidence

Internal: `app/lib/site.js` reads `NEXT_PUBLIC_SITE_URL` first (and still
does, after the audit fix), yet the audit round found no documentation of it
anywhere in the repository. The two documented site variables live in
`.env.example` at the repository root.

External, for framing: Vercel's system-environment-variables reference
(https://vercel.com/docs/environment-variables/system-environment-variables,
retrieved 2026-08-10) defines `VERCEL_URL` as "the generated deployment URL"
and `VERCEL_PROJECT_PRODUCTION_URL` as "a production domain name of the
project", which is what prompted the code fix.

## Done when

- [ ] `.env.example` documents `NEXT_PUBLIC_SITE_URL`, saying what it is for,
      what it must be set to in production (the canonical host), and why
      relying on Vercel's deployment variables alone is not enough
- [ ] The README's deployment steps tell a maintainer to set it alongside the
      other `NEXT_PUBLIC_*` variables, or explains why it is optional
- [ ] A reader setting up the project fresh could discover the variable from
      the repository itself, without needing the audit round's changelog entry
