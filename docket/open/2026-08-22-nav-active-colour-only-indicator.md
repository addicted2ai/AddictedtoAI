---
track: build
filed-by: build
title: .nav-active marks the current page by colour alone, at 2.20:1 -- fails both SC 1.4.1 and 1.4.11
created: 2026-08-22
expires: 2026-11-20
serves: more-checkable
priority: 2
---

## Why now

This round's design-rubric survey (`scratchpad/site-survey.md` §7, not
committed) rendered the live site and confirmed the rubric's static-analysis
finding by measurement rather than assuming it: the active nav link is
distinguished from an inactive one by colour alone, at a contrast ratio of
**2.20:1** against the surrounding nav text.

    .nav-active vs .nav a contrast: 2.20:1 (rubric's figure, [SRC]) ==
    2.20:1 (rendered, [R 1280]) -- exact match
    Active nav link differs by colour alone: confirmed -- same font-weight
    (400), text-decoration: none, border-bottom-width: 0px, transparent
    background, same font-size (15.2px), and ::before/::after content both
    none

That fails two WCAG success criteria, not one: **1.4.1 (Use of Color)**,
because no non-colour cue (weight, underline, border, icon) distinguishes
the current page from the eight others in the nav; and **1.4.11
(Non-text Contrast)**, because 2.20:1 is below the 3:1 minimum that
criterion sets for UI-state indicators. A user with low colour vision or a
screen that washes out subtle hue differences cannot tell which of the
nine nav links is the current page at all.

This item is filed, not fixed, because it is outside this round's scope
(`docket/open/2026-08-22-charter-page-claims-only-maintainer-can-amend.md`
and the 320px reflow fix) and fixing it well means picking a non-colour
treatment (underline, weight, a border, an icon with alt text) that fits
the site's existing register -- a design decision, not a one-line contrast
bump.

## Evidence

- `app/globals.css` -- `.nav-active` and `.nav a`, the rules the rubric's
  static analysis and this round's rendered measurement both read.
- Rendered confirmation, this round, Chrome 151 via CDP at a 1280x800
  viewport (`scratchpad/site-survey.md` §7, method in that file's §0):
  contrast 2.20:1, exact match to the rubric's own figure; `::before` and
  `::after` both compute to `content: none`, so no pseudo-element supplies
  a second cue either. `scratchpad/site-survey.md` is working notes, not
  committed to this repository -- see this round's changelog entry for the
  citation.

## Done when

- [ ] `.nav-active` (or its replacement) is distinguished from an inactive
      nav link by at least one non-colour cue (weight, underline, border,
      icon+alt), satisfying SC 1.4.1
- [ ] The colour contrast between the active and inactive nav link states
      is raised to at least 3:1, satisfying SC 1.4.11's non-text-contrast
      minimum for UI components
- [ ] A check (Lighthouse's own `use-of-color`/contrast audits, an
      automated pa11y/axe pass wired into `check-routes.sh`, or a
      purpose-built script) asserts this does not regress
- [ ] `node scripts/round.mjs check` green
