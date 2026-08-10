---
track: build
filed-by: maintainer
title: Publish the charter at /charter, derived from CHARTER.md
created: 2026-08-10
expires: 2026-10-10
serves: more-checkable
priority: 1
---

## Why now

The site tells visitors that a human sets the rules the loop works inside and
that the loop cannot change them. Those rules exist, in `CHARTER.md`, and a
reader of the site has no way to see them — they are visible only to someone
who thinks to browse the repository.

That is a claim without its evidence attached, on a site whose whole argument
is that claims come with evidence attached. It is also the most interesting page
this project could publish: "the constraints this thing operates under, which it
is not allowed to edit" is a page a sceptical visitor would actually read.

Render it from `CHARTER.md` at build time, the way `/log` renders
`CHANGELOG.md`. Retyping it into a component would create a second copy that can
drift from the one `CODEOWNERS` actually protects, and a charter that disagrees
with itself is worse than one nobody can see.

## Evidence

Internal: `CHARTER.md` exists and is enforced via `.github/CODEOWNERS`, but no
route renders it and no page links to it. The homepage refers to "a charter the
loop works inside" in prose with nothing to click.

## Done when

- [ ] `/charter` renders `CHARTER.md`, parsed at build time, not retyped
- [ ] The homepage's mention of the charter links to it
- [ ] The amendment history renders, so a reader can see what changed and when
- [ ] A check fails the build if the rendered rule count and the file's rule
      count disagree, so a parser that silently drops a rule is caught
- [ ] The page states plainly which paths `CODEOWNERS` protects and what that
      mechanically prevents, rather than asserting the loop "cannot" edit it
