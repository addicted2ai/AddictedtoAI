---
track: maintain
filed-by: maintain
title: Confirm whether the retirement calendar's "past"/"upcoming" split refreshes without a rebuild
created: 2026-08-25
expires: 2026-11-25
serves: floor
priority: 2
---

## Why now

Round 193 (maintain) swept the site for claims that go false with the
passage of time alone -- the calendar's hand-typed milestone-count prose was
one instance, fixed that round by deriving it from
`RETIREMENT_EXCLUDED_MILESTONES` and `today()` (CHANGELOG.md, 2026-08-25).
While tracing where `today()` actually runs, a second, more structural
question surfaced and was deliberately left unresolved rather than acted on
under uncertainty.

`app/model-retirement-calendar/page.js` has neither `export const dynamic`
nor `export const revalidate`. Next.js 14's default for a Server Component
page that calls no dynamic API (no `cookies()`, `headers()`, `searchParams`,
no `fetch` with `cache: "no-store"`) is static rendering: the component
function runs once, at build time, and the HTML it produces is served
unchanged until the next deploy. `new Date()` does not opt a page out of
this. The project's own `app/model-retirement-calendar.ics/route.js` states
this exact default explicitly and pins it with `export const dynamic =
"force-static"` "rather than relying on the version currently installed
staying installed" (Next 15 flips the route-handler default). The page
component carries no equivalent pin either way.

This is no longer just reasoned from Next.js's documented defaults: `npm run
build`'s own route table, produced while verifying this round's other
changes, marks the page `○ (Static) prerendered as static content` (the
build's own legend: "prerendered as static content"), with no `dynamic` or
`revalidate` export anywhere in the file. So `today()`'s upcoming/past
split -- both tables, the `retirement-past` marker, and the
milestone-paragraph derivation round 193 just added -- is confirmed computed
once, at build time, not live per visitor. What is still unconfirmed is
Vercel-side: whether this project's deployment settings apply any
request-time revalidation on top of what `next build` marks static (some
configurations do), and how long the gap actually runs in practice between
merges. In practice this project deploys on most merges, so the staleness
window is probably short, but "probably short, because we usually ship
often" is exactly the kind of claim
`docket/done/2026-08-15-nothing-watches-whether-the-site-deployed.md` found
the loop had been making without evidence, about a different failure mode on
this same page. Nothing currently distinguishes "the label is correct
because it was recomputed today" from "the label is correct because the
last build happened to be recent."

## Evidence

- `app/model-retirement-calendar/page.js` -- no `dynamic` or `revalidate`
  export, `today()` called directly in the Server Component body (round 193
  read the whole file).
- `npm run build` (round 193, 2026-08-25) -- route table marks
  `/model-retirement-calendar` as `○ (Static) prerendered as static content`,
  confirming the default applies to this specific page rather than assuming
  it from the framework's documented behavior alone.
- `app/model-retirement-calendar.ics/route.js:9-22` -- the project's own
  comment on this exact default, for the sibling route that DOES pin it.
- `grep -rn "export const revalidate" app/` -- zero matches anywhere in the
  app, confirmed 2026-08-25; this project has never used time-based ISR.
- `docket/done/2026-08-15-nothing-watches-whether-the-site-deployed.md` --
  the closest precedent: a real ten-hour gap between what merged and what a
  visitor saw, on this same site, caught only because the maintainer looked.
  That item's fix (`scripts/check-deployments.mjs`) watches whether the
  newest deployment *succeeded*; it does not watch how long ago it ran.

## Done when

- [x] Confirmed the page is static at build time, not reasoned from
      Next.js's documented defaults alone: `npm run build`'s route table
      marks it `○ (Static)` (round 193)
- [ ] Confirmed, against the real deployment, whether Vercel's serving layer
      applies any revalidation on top of that build-time static output --
      e.g. by checking the page's response headers/cache behavior in
      production, or by finding an authoritative statement of this project's
      Vercel project settings
- [ ] If it is frozen at build time: a decision, argued in the round's
      CHANGELOG entry, on whether `export const revalidate = <n>` (time-based
      ISR) is the right fix, what `<n>` should be, and whether the same
      question applies to any other page computing a date comparison (`/log`,
      `/what-vendors-promise`'s Meta-unverified staleness framing, anywhere
      else `today()` or `new Date()` appears in a Server Component)
- [ ] If it is not frozen at build time, or the maintainer's Vercel
      configuration already handles this some other way (e.g. revalidation on
      every request by default for this project's plan/settings): that finding
      recorded here and the item dropped, citing what was checked
