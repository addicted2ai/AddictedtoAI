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
- Lighthouse: performance >= 0.80, accessibility / SEO >= 0.85 —
  each asserted against the median of 3 runs (see `lighthouserc.json`).
  Performance's floor was lowered from 0.85 and runs went from 1 to 3
  with median scoring on 2026-08-09 after single-run performance scores
  proved too noisy on shared CI hardware to gate on reliably (the same
  untouched homepage scored 0.83 then 0.74 back to back). Accessibility
  and SEO are static-analysis checks, not timing-based, so they weren't
  the noisy ones and stayed at 0.85.
- Zero net-new broken links
- No failed deploy / rollback

---

## Log

### Unreleased
- Hypothesis: The blog post is this site's pitch — a public, honest
  record of a loop that measures itself — and it has quietly gone out
  of date in the two ways most damaging to that pitch. It states the
  guardrail as "Lighthouse performance, accessibility, and SEO scores
  all at or above 0.85"; performance has been 0.80 against a
  median of 3 since PR #5 lowered it. And its "What's shipped so far"
  list names three changes, frozen at PR #3, while 25 loop PRs have
  merged. A page arguing that the process is trustworthy because
  everything gets written down, which is itself wrong about the
  numbers it quotes, undercuts its own argument. This is Blog's
  read-time and organic-search metric too: a stale post is a weaker
  page.
- Change: Corrected the guardrail paragraph in `app/blog/page.js` to
  the real thresholds, and added the reason the performance floor
  moved (the same untouched homepage scoring 0.83 then 0.74 back to
  back on shared CI hardware) — the "why" is more interesting than
  the number and is exactly the sort of thing the post exists to
  show. Replaced the frozen three-item list with four thematic
  groups: content, findability, accessibility, and fixing what
  earlier rounds got wrong. That last group is the honest one, and
  the post now says so. **Structural point: the list is a summary
  rather than a running log specifically so it stops going stale** —
  restating it round by round is what broke it the first time, and
  `CHANGELOG.md` is already the per-round ledger the "Follow along"
  section points at. (PR #27)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` for all 5 routes, 30 links, zero failures; verified
  against the served page that the "all at or above 0.85" claim is
  gone and that the corrected thresholds render). Prose-only change:
  no CSS, no new components, no routing.
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The north star is returning-visitor rate, and after 25
  rounds the site still offers a visitor no mechanism whatsoever for
  coming back on purpose. Every improvement so far has optimised the
  visit someone is already having. A feed is the oldest and cheapest
  "tell me when there's something new" primitive on the web, it costs
  a returning visitor zero effort after subscribing once, and unlike
  a mailing list it needs no consent flow, no address, and no
  third-party service. One post makes for a thin feed today, but the
  subscribe decision happens on the visit someone is already having —
  the feed has to exist before the second post, not after it.
- Change: Added `app/feed.xml/route.js`, a Route Handler emitting
  RSS 2.0 at `/feed.xml` with the `atom:link rel="self"` element
  validators expect, served as `application/rss+xml`. Extracted post
  metadata into `app/lib/posts.js` so the page's `<title>`, its
  visible heading, its JSON-LD, and the feed item all read from one
  record instead of four hardcoded copies that can drift — the same
  single-source-of-truth pattern as `lib/sections.js` and
  `lib/tool-categories.js`. Added feed autodiscovery to all five
  routes plus the 404, and a visible "Subscribe via RSS" link in the
  blog byline, since browsers stopped surfacing autodiscovery years
  ago and an invisible feed gets no subscribers. Also wrapped the
  post date in a `<time dateTime="...">` element while it was being
  templated. (PR #26)
- Note for future rounds: `alternates` on a page **replaces** the
  root layout's rather than merging with it — confirmed empirically,
  the same trap the canonical-URL round hit. Setting the feed link
  once at the root put it on the 404 and nowhere else. Hence
  `feedAlternates` in `app/lib/site.js`, spread into each page's
  `alternates` explicitly.
- Guardrails: pass (local `next build` clean, `/feed.xml` compiles to
  a static route, 0 B of client JS; local link check with `linkinator`
  for all 5 routes, 30 links — one more than last round, the new feed
  link — zero failures. Feed parsed and structurally checked rather
  than eyeballed: well-formed XML, `rss version="2.0"`, correct
  `atom:link rel="self"`, one item whose `guid`/`link` resolve to the
  post and whose RFC-822 `pubDate` parses. Verified all 5 routes plus
  a 404 each carry exactly one autodiscovery link, and that every
  route's canonical URL is still its own — the risk in touching five
  `alternates` blocks at once.)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The Tool Finder swaps the category buttons out for the
  result, which destroys the element the visitor just activated —
  and nothing catches the focus. Measured before touching anything,
  by driving it with the keyboard exactly as a keyboard user would:
  after pressing Enter on a category, `document.activeElement` is
  `BODY`. A screen-reader user gets no announcement that anything
  happened at all, and a keyboard user's next Tab restarts from the
  top of the document — the skip link, then all five nav links —
  before it reaches the recommendation they just asked for. The
  "try another category" button had the same problem in reverse.
  Demos' metrics are completion rate and repeat-use rate, and this
  breaks precisely the moment of completion and the replay loop.
- Change: `app/demos/ToolFinder.js` now moves focus to match the
  view swap — to the "For <category>, try:" result line when a
  category is chosen, and back to the "What are you trying to do?"
  question when the visitor restarts. Both targets get
  `tabIndex={-1}` (the same pattern `app/layout.js` already uses for
  the skip link's target). A `hasChosen` ref guards the effect so
  focus is only ever moved in response to a real choice, never
  stolen on first paint. No new CSS: browsers correctly decline to
  paint a focus ring on a programmatically focused paragraph
  (verified — the element reports `:focus-visible` false and a
  computed `outline-style: none`), so there was nothing to suppress.
  (PR #25)
- Guardrails: pass (local `next build` clean, `/demos` chunk 1.26 kB
  → 1.36 kB; local link check with `linkinator` for all 5 routes, 29
  links, zero failures; behaviour verified end-to-end with Puppeteer
  before and after — focus goes `BODY` → the result line on choosing
  and `BODY` → the question line on restart, the next Tab after
  choosing now lands on the first recommended tool card instead of
  the top of the document, and `activeElement` is still `BODY` on
  page load, confirming the guard works)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: Every entry in this log ends with "Result: not yet
  measured," and it always will, because **nothing on this site is
  instrumented at all**. `README.md` step 4 and `.env.example` both
  describe `NEXT_PUBLIC_GA_MEASUREMENT_ID` as the analytics hookup,
  but no code has ever read that variable — grep confirms zero
  references outside those two docs. So the north-star metric
  (returning-visitor rate) and all eleven per-section metrics have no
  mechanism behind them, and 22 rounds of hypotheses have been
  graded on nothing. Wiring up the documented variable is the
  precondition for this loop ever closing its own feedback cycle.
- Change: Added `@next/third-parties` (Vercel's own package, pinned
  to 14.2.35 to match `next`; adds zero transitive dependencies) and
  render `<GoogleAnalytics gaId={...} />` from `app/layout.js`, gated
  on `NEXT_PUBLIC_GA_MEASUREMENT_ID`. Unset — which is the state on
  every environment today — the site emits no analytics script
  whatsoever, so this ships inert and stays inert until a human sets
  the variable in Vercel. Used the officially documented component
  rather than hand-rolling the `gtag` bootstrap with `next/script`,
  which is what Next's own `next-script-for-ga` lint rule exists to
  discourage. Documented the measured cost in `README.md` and
  `.env.example`. (PR #24)
- Guardrails: pass, but with a caveat that matters more than the
  pass. Local `next build` clean both ways; shared JS 87.2 kB →
  87.3 kB with the variable unset (~100 bytes of client-reference
  manifest for a component that never renders). Link check with
  `linkinator` for all 5 routes, 29 links, zero failures. Verified
  both configurations in a real browser: unset → zero
  `googletagmanager` references anywhere in the built output and zero
  third-party requests; set → exactly one tag on each of the 5
  routes. **The cost, measured over the wire with CDP rather than
  guessed: analytics off is 10 requests / 97.4 KB, analytics on is 12
  requests / 243.3 KB. `gtag.js` alone is 145.9 KB — 1.5x the entire
  rest of the page.** Local Lighthouse can't score that difference
  (this machine returns 1.00 on performance either way; the CI
  hardware is what the 0.80 floor was calibrated against), and
  `pr-checks.yml` does not set the variable, so the guardrail is
  currently measuring the analytics-off build and will keep passing
  regardless of what analytics costs in production. That gap is real
  and is the obvious next round: make CI measure the config we
  actually ship.
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: Directory search filters as you type, but nothing ever
  says how many tools matched. A sighted visitor can count cards; a
  screen-reader user gets nothing at all — the results silently swap
  underneath them with no announcement, because there was no live
  region on the page. That's the same class of gap as the last few
  accessibility rounds, and it lands on the one feature Directory's
  "on-site search usage" metric depends on. A visible, announced
  count also tells everyone that a short query narrowed 12 tools to
  3, which is the feedback that makes a search box feel like it's
  working.
- Change: Added a `role="status"` result-count line under the search
  input in `app/directory/DirectorySearch.js` — "3 tools match
  “coding”." / "1 tool matches “claude”." / "No tools match “zzzz”."
  — with the wording centralised in one `countLabel()` helper.
  The element is always in the DOM (empty when there's no query),
  because a live region has to exist *before* its text changes for
  assistive tech to announce it. Removed the now-duplicate "No tools
  match" paragraph from the no-results block, so there's exactly one
  copy of that message; the "Clear search" button added last round
  stays. Added `.directory-result-count` to `app/globals.css`.
  (PR #23)
- Guardrails: pass (local `next build` clean, `/directory` chunk
  1.32 kB → 1.39 kB; local link check with `linkinator` against the
  production build for all 5 routes, 29 links, zero failures;
  verified end-to-end with Puppeteer — the status element is present
  and empty at rest, reports the right singular/plural/zero wording
  for each query, trims whitespace from the echoed query, and there's
  exactly one copy of the no-results message. The reserved
  `min-height` was tuned against a measured layout shift: 1.35em
  still let the tool grid jump 2px when the count appeared, 1.5em —
  exactly one line box at the inherited line-height — measured 0px.)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The Directory search box tells visitors they can
  "Search tools by name or category..." — but the filter only ever
  looked at each tool's name and description, never its category
  name. The promise in the placeholder is simply not implemented.
  Measured before touching anything: of the eight most obvious
  category-shaped queries, five (`coding`, `image`, `assistants`,
  `data`, `audio`) returned *zero* results and two more returned
  partial results that happened to match on description text alone.
  A visitor who types the exact word the UI invited them to type and
  gets an empty page is the worst possible outcome for Directory's
  "on-site search usage" metric — it teaches them the search box
  doesn't work.
- Change: `matches()` in `app/directory/DirectorySearch.js` now
  includes the category name in the haystack alongside name and
  description, so a category query returns every tool in that
  category. One-line-scope fix: no new UI, no data changes, no new
  CSS — the placeholder's existing promise now just holds. (PR #22)
- Guardrails: pass (local `next build` clean, `/directory` chunk
  1.31 kB → 1.32 kB; local link check with `linkinator` against the
  production build for all 5 routes, 29 links, zero failures; the fix
  verified end-to-end in a real browser with Puppeteer — all four
  category names now return their full 3-tool category, the name
  query `claude` still returns exactly 1, and a nonsense query still
  correctly shows the no-results state)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: When a Directory search has no matches, the only way
  back to the full list is manually deleting the typed text — a small
  but real dead end in the exact feature built two rounds ago to give
  Directory's "on-site search usage" metric something to measure. A
  visitor who hits a no-results state and doesn't know how to recover
  is more likely to bounce than to try another search, undermining the
  metric the search box exists to serve.
- Change: Added a "Clear search" button to the no-results state in
  `app/directory/DirectorySearch.js`, reusing the existing
  `.finder-restart` style from the Demos Tool Finder's "try another
  category" button rather than introducing a new near-duplicate class.
  Resets the query to empty and restores all 12 tools. (PR #21)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes; the
  interaction itself verified end-to-end with Puppeteer — typed a
  no-match query, confirmed the button appears, clicked it, confirmed
  the input clears and all 12 tool cards reappear)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The nav gives no indication of which page you're
  currently on — all 5 links always render identically regardless of
  route. That's both a missed visual affordance (helps orient
  visitors, especially now that the nav can wrap to two lines on
  narrow viewports) and an accessibility gap (`aria-current="page"`
  is the standard way assistive tech announces current location in a
  nav).
- Change: Extracted the nav into `app/Nav.js`, a client component
  using `usePathname()` to compare the current route against each
  link's `href`. The matching link gets `aria-current="page"` and a
  `nav-active` class (accent-colored, same accent used for focus/hover
  states elsewhere) instead of the default muted color. `app/layout.js`
  now renders `<Nav />` instead of the hardcoded `<nav>` markup it had
  inline. Kept plain `<a>` tags rather than switching to `next/link`,
  matching the codebase's existing convention (no page in this app
  uses `next/link`) — this change is scoped to adding an active-state
  indicator, not to changing the navigation/prefetching model.
  (PR #20)
- Guardrails: pass (local `next build` clean — the Nav client
  component bundles into the shared JS chunk since it's used in the
  root layout, no per-page size increase; local link check with
  `linkinator` against the production build for all 5 routes; manually
  verified via curl that each route server-renders exactly one
  `aria-current="page"` link, matching that route)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: Every outbound link on the site (12 tool cards in
  Directory, 2 recommended-tool cards per Demos result, the GitHub
  profile link on Projects) opens `target="_blank"` with zero
  indication that a new tab is about to open. For screen-reader users
  especially, a new tab opening unannounced is disorienting — a
  well-established accessibility practice is to signal this
  explicitly rather than silently change context.
- Change: Added a visually-hidden `" (opens in a new tab)"` suffix
  inside every `target="_blank"` link across
  `app/directory/DirectorySearch.js`, `app/demos/ToolFinder.js`, and
  `app/projects/page.js`, using a new `.visually-hidden` utility class
  in `app/globals.css` (standard clip-based sr-only pattern: present
  for assistive tech, not shown visually, doesn't affect layout).
  (PR #19)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes; manually
  verified the hidden text renders in the HTML on Directory (12
  instances, matching all 12 tool links) and Projects)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The site has 7 separate `transition` declarations across
  its cards, buttons, and links, and none of them respected
  `prefers-reduced-motion`. Motion sensitivity is a real accessibility
  need (vestibular disorders, among others), and it's the kind of gap
  a static Lighthouse audit doesn't reliably catch — this only shows
  up if you actually check the OS-level preference.
- Change: Added a single global
  `@media (prefers-reduced-motion: reduce)` rule to
  `app/globals.css` that collapses `transition-duration` and
  `animation-duration` to near-zero for every element, rather than
  patching each of the 7 individual transition rules by hand — more
  robust, and it automatically covers any transition/animation added
  later too. (PR #18)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes; verified
  empirically with Puppeteer's `emulateMediaFeatures`, not just by
  reading the CSS — a `.tool-card`'s computed `transition-duration`
  measured 0.15s under normal conditions and dropped to 0.00001s with
  `prefers-reduced-motion: reduce` emulated)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The site had no web app manifest and no `theme-color`,
  so mobile browser chrome (the address-bar area on Chrome
  Android/Safari iOS) doesn't match the site's dark theme, and there's
  no metadata for "Add to Home Screen" to use. Small, standard PWA-lite
  polish that costs nothing new — reuses the `icon.svg` and colors
  already shipped.
- Change: Added `app/manifest.js` (Next.js's file convention, compiles
  to `/manifest.webmanifest`) with name/short_name/description/
  background_color/theme_color all matching existing site metadata,
  and a single SVG icon entry reusing `/icon.svg`. Added
  `export const viewport = { themeColor: "#0b0d0f" }` to
  `app/layout.js` — `themeColor` lives in a separate `viewport` export
  in this Next.js version, not `metadata` (verified against current
  docs; the older pattern of putting it in `metadata` is deprecated).
  (PR #17)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes; manifest
  JSON validated to parse correctly; theme-color meta tag and manifest
  link tag verified present in rendered HTML)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The site had no custom favicon, so browser tabs and
  bookmarks show Next.js's generic default icon instead of anything
  that identifies AddictedtoAI — a small but real polish/identity gap
  for a site that now has real content across every section.
- Change: Original plan was `app/icon.js` using Next's `next/og`
  `ImageResponse` convention (dynamic PNG generation). That broke
  `next build` outright (exit code 1, not just a warning): the
  bundled `next/og`'s default-font loader
  (`fileURLToPath(new URL("./Geist-Regular.ttf", import.meta.url))`)
  threw `TypeError: Invalid URL` in this environment. Tried supplying
  an explicit custom font to avoid that code path, but every candidate
  static-font URL tested came back 404 — not worth guessing at a
  fetch-at-build-time dependency for a favicon, especially one that
  can fail the *entire* build if the URL ever breaks. Went with a
  static `app/icon.svg` instead: no build-time image generation, no
  font dependency, works identically on every platform, and Next.js
  picks it up automatically via the same file-convention mechanism.
  Simple mark: rounded square in the site's accent color (`#5eead4`)
  with a bold "A". Skipped a matching `apple-icon` for this round —
  Apple requires PNG specifically (SVG isn't supported for home-screen
  icons), which would need the same broken `ImageResponse` path or a
  real image asset I don't have; worth a follow-up once there's a
  proper image-generation path. (PR #16)
- Guardrails: pass (local `next build` clean, exit code 0; local link
  check with `linkinator` against the production build for all 5
  routes; manually verified `/icon.svg` is served with a 200 and
  correct content, and that `<link rel="icon">` points at it)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: `.nav` had no `flex-wrap`, and the nav has grown to 5
  items ("AddictedtoAI" plus the 4 sections). Measured with Puppeteer
  at a 360px mobile viewport (iPhone SE-class width) before touching
  anything: the nav caused 48px of horizontal overflow
  (`document.body.scrollWidth` 408px vs. `window.innerWidth` 360px) —
  a real, confirmed bug, not a hypothetical one. Horizontal overflow
  on mobile is a concrete usability problem (content gets clipped or
  the whole page gains an awkward horizontal scrollbar) that would
  hurt every metric downstream of a mobile visitor actually being able
  to use the site, most directly the north-star returning-visitor rate
  if their first visit is broken.
- Change: Added `flex-wrap: wrap` to `.nav` in `app/globals.css`
  (plus switched `gap` to a row/column shorthand: `0.75rem 1.5rem`)
  so nav items wrap onto a second line on narrow viewports instead of
  overflowing the page horizontally. Re-measured the same way after
  the fix: `document.body.scrollWidth` now matches `window.innerWidth`
  exactly (360px) at the same viewport. (PR #15)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes; the fix
  itself was verified empirically with a Puppeteer before/after
  measurement at a 360px viewport, not just asserted from reading the
  CSS)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: No page declared a canonical URL, and the sitemap
  (shipped a few rounds back) lists routes without a trailing slash
  while Next.js will happily serve the same content whether or not
  one is appended — exactly the kind of ambiguity canonical tags
  exist to resolve. Without one, search engines have to guess which
  URL variant is authoritative for a page, which can dilute ranking
  signal instead of consolidating it on one URL. This completes the
  set of standard technical-SEO levers alongside per-page metadata,
  robots.txt/sitemap.xml, and JSON-LD already shipped.
- Change: Added `metadataBase: new URL(getSiteUrl())` to
  `app/layout.js` (required for relative URLs in `alternates` to
  resolve to absolute ones) and an explicit
  `alternates: { canonical: "<path>" }` to each of the 5 pages'
  existing `metadata` exports. Canonical `alternates` don't inherit
  or auto-derive the way `openGraph`/`twitter` title/description do
  (verified — there's no equivalent fallback mechanism), so each page
  needed its own explicit entry rather than one set at the root.
  (PR #14)
- Guardrails: pass (local `next build` clean, no warnings; local link
  check with `linkinator` against the production build for all 5
  routes; manually verified each page's `<link rel="canonical">`
  resolves to that page's own correct path)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The site has no structured data, so search engines can
  only guess at what the homepage is (a site) and what the blog post
  is (an article) from unstructured HTML. Schema.org JSON-LD is a
  standard, low-effort way to state that explicitly, which can make a
  page eligible for richer search result presentation (e.g. article
  rich results with a byline/date) — a lever for Blog's organic
  search traffic metric, complementing the per-page metadata,
  robots.txt, and sitemap already shipped. This is real, accurate
  markup (not fabricated): every field mirrors content already live
  on the page.
- Change: Added `WebSite` JSON-LD to `app/layout.js` (site-wide, name/
  url/description matching the existing root metadata) and
  `BlogPosting` JSON-LD to `app/blog/page.js` (headline/description
  matching the page's own metadata, `datePublished` matching the
  visible "Posted 2026-08-09" byline, author/publisher as the
  `AddictedtoAI` organization since there's no individual byline on
  the post). Both render as `<script type="application/ld+json">`
  tags per Next.js's documented pattern. (PR #13)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes; both
  JSON-LD blocks verified to parse as valid JSON and appear correctly
  on their respective pages — WebSite site-wide, BlogPosting
  additionally on `/blog`)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: Keyboard and screen-reader users had no way to bypass
  the nav and jump straight to page content — every page load forced
  tabbing through 5 nav links first. That's a real accessibility gap,
  and it's exactly the kind of thing the Lighthouse accessibility
  guardrail (>= 0.85) exists to catch, though a static audit doesn't
  always flag missing skip links specifically. This was originally
  going to be Open Graph + Twitter Card metadata, but building it
  surfaced that Next.js's Metadata API auto-generates Twitter Card
  tags from any `openGraph` object with no documented opt-out —
  confirmed empirically, not just from docs — which conflicts with an
  explicit instruction to keep this site free of
  Twitter/social-platform-specific integration. Open Graph was dropped
  entirely rather than ship the auto-generated Twitter tags, and this
  skip-link fix took its place for this round instead.
- Change: Added a "Skip to content" link as the first focusable
  element in `app/layout.js`, visually hidden until keyboard-focused
  (standard accessible pattern: positioned off-screen, slides into
  view on `:focus`). Points at `id="main-content"` on the `<main>`
  element, with `tabIndex={-1}` so focus actually lands there when
  the link is activated, not just a scroll. Added `.skip-link` styles
  to `app/globals.css`. (PR #12)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes; manually
  verified the skip link and its target render correctly in the HTML)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The homepage's only path into the blog is a generic
  section card ("Blog" / "AI news and commentary.") — the same
  abstract, category-level pitch every section card uses. It doesn't
  say there's an actual post there, let alone what it's about. A
  specific, concrete teaser naming the real post ("How this site
  builds itself") is a stronger, more curiosity-driven reason to
  click than a generic category label, and gives the homepage a
  second, more compelling path into `/blog` on top of the existing
  card. Should increase clicks from `/` into `/blog` beyond what the
  section card alone gets, supporting session depth toward the
  north-star returning-visitor metric.
- Change: Added a "Latest from the blog" teaser to `app/page.js` below
  the existing section grid, linking to `/blog` with the actual post
  title and a one-line hook. Hardcoded to the current single post
  (there's no post collection/CMS to generalize from yet — revisit
  this if a second post ships). Added `latest-post`/`latest-post-label`/
  `latest-post-link` styles to `app/globals.css`, matching the existing
  `section-card` look. (PR #11)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes — no new
  unique links, just a second homepage path to the already-checked
  `/blog` route)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: A mistyped or broken internal/external link (very
  possible now that there are 24+ outbound links plus five internal
  routes) hit Next's generic default 404 page — a dead end with no
  way back into the site except the browser's back button. That's a
  direct hit against the north-star metric: a visitor who lands on a
  bare error page is much less likely to explore further or return
  than one who lands somewhere that still offers a way in. Replacing
  it with a styled 404 that links back into all four sections (same
  `section-grid`/`section-card` pattern as the homepage) should
  recover some of those sessions instead of losing them outright.
- Change: Added `app/not-found.js` — Next's App Router convention for
  a custom 404 — styled to match the site and listing all four
  sections as recovery links. Extracted the `sections` list out of
  `app/page.js` into `app/lib/sections.js` so the homepage and the
  404 page share one source of truth instead of duplicating the same
  four entries. No new CSS needed; reuses `section-grid`/`section-card`
  as-is. (PR #10)
- Guardrails: pass (local `next build` clean — `_not-found` now
  compiles to a lighter custom page instead of Next's default;
  local link check with `linkinator` confirmed all 4 recovery links
  plus every existing route still resolve 200. The 404 test route
  itself correctly reports 404, which is the intended behavior, not a
  broken link, and isn't among the 5 routes CI actually checks)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: The site had no `robots.txt` and no `sitemap.xml` —
  nothing explicitly telling search engines every route is crawlable,
  and no single file listing all five routes for a crawler to
  discover them efficiently. This is a standard, low-effort lever for
  organic search traffic (Blog's metric) and general discoverability
  across every section, complementing last round's per-page metadata:
  metadata makes each page's snippet better once it's found; a
  sitemap and robots.txt make pages easier to find in the first
  place.
- Change: Added `app/robots.js` (allows all crawling, points at the
  sitemap) and `app/sitemap.js` (lists all five routes with
  `lastModified`/`changeFrequency`/`priority`), using Next.js's App
  Router file conventions — both compile to static `/robots.txt` and
  `/sitemap.xml` routes. Added `app/lib/site.js` with a small
  `getSiteUrl()` helper shared by both: prefers an explicit
  `NEXT_PUBLIC_SITE_URL` env var if one is ever set, falls back to
  Vercel's auto-injected `VERCEL_URL` (so it's correct on whatever
  domain is actually live, preview or production, with zero config),
  falls back to `localhost:3000` for local dev. (PR #9)
- Guardrails: pass (local `next build` clean — both new routes show up
  as static output; local link check with `linkinator` against the
  production build for all 5 main routes plus the two new ones;
  manually verified `/robots.txt` and `/sitemap.xml` render correct
  content)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: Every route shared one generic `<title>`/description from
  the root layout ("AddictedtoAI" / "AI news, tools, projects, and
  demos.") — search engines saw the same title and snippet for `/`,
  `/blog`, `/directory`, `/projects`, and `/demos` alike. That directly
  works against Blog's own metric, organic search traffic, and every
  other page's discoverability: duplicate titles/descriptions across a
  site are a well-known ranking and click-through weakness, and a
  generic snippet gives a search result nothing distinctive to show.
  Giving each route its own accurate title and description should
  improve how each page shows up in search results and how likely a
  snippet is to earn a click.
- Change: Added a title template (`"%s | AddictedtoAI"`) to the root
  layout, and a real per-page `metadata` export (title + description)
  to all five routes — the homepage uses an absolute title bypassing
  the template. `/directory` and `/demos` are client components, and
  Next.js doesn't allow a `metadata` export from a Client Component,
  so their interactive parts were extracted into
  `app/directory/DirectorySearch.js` and `app/demos/ToolFinder.js`;
  `page.js` for both is now a plain server component that exports
  metadata and renders the extracted client component — the officially
  documented pattern for this exact situation. No behavior changes to
  either interactive feature. (PR #8)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes; manually
  verified each route's rendered `<title>` and meta description are
  unique and correct; confirmed the Directory search input and Demos
  Tool Finder still render and function identically after the
  extraction)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: All four sections now have real content, so this pass
  looks for a metric with nothing measuring it rather than a
  placeholder. Directory's two documented metrics are "outbound
  clicks to tools" (shipped, PR #2) and "on-site search usage" — but
  there has never been any search or filter UI on the page, so that
  second metric has had zero mechanism to register since the Directory
  existed. Adding a simple client-side search box that filters the
  existing tool cards by name/category as you type gives that metric
  something to actually measure for the first time, and should also
  help entries-browsed-per-session as the list grows past a quick
  scan.
- Change: Converted `app/directory/page.js` to a client component
  (`"use client"`) with a search input; filtering happens client-side
  against the existing `toolCategories` data (name + description
  match, case-insensitive), hiding categories with zero matches and
  showing a "no tools match" message when nothing does. No data or
  routing changes. Added `directory-search`/`directory-no-results`
  styles to `app/globals.css`. (PR #7)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes — the
  default empty-query render still statically includes all 12
  existing tool-card links unchanged, so no new link risk)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: Projects was the last remaining placeholder section.
  Its metrics (inquiry/contact clicks, outbound repo clicks, time on
  page) all need a real write-up with real actions to click, which a
  one-line placeholder can't produce. The only project this loop can
  write about truthfully, without inventing a portfolio, is
  AddictedtoAI.net itself — same reasoning as the blog post.
  Two details needed a human decision first (asked before building):
  the site's own repo is private, so there's nothing to link for
  "outbound repo clicks" without it 404ing for visitors; and there was
  no contact channel yet for "inquiry clicks." Given the answers (link
  the GitHub profile instead of the repo; use a dedicated
  AddictedtoAI@proton.me address rather than the personal email), a
  real write-up with working outbound actions should move time on
  page and give both click metrics something to register for the
  first time.
- Change: Replaced the Projects placeholder in `app/projects/page.js`
  with a write-up of the site itself — the idea, how the loop
  works (linking to the blog post rather than repeating it), and the
  stack — plus a `project-actions` row with two outbound
  actions: a `mailto:AddictedtoAI@proton.me` link and a link to
  github.com/addicted2ai. Reused the `article` typography added for
  the blog post; added `project-actions`/`project-action` styles to
  `app/globals.css` for the CTA row. (PR #6)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes.
  Confirmed via lychee's own docs that mail-address checking is
  opt-in via `--include-mail`, which `pr-checks.yml` doesn't pass, so
  the mailto link isn't validated by CI at all — also confirmed
  proton.me has valid MX records regardless. GitHub profile link
  verified 200.)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: Blog is the last section still showing the placeholder
  note (Projects is too, but picking one at a time). Its metric,
  organic search traffic, needs something indexable and worth reading
  — a one-line placeholder gives search engines and visitors nothing.
  Rather than invent generic "AI news" commentary (stale fast, easy to
  get wrong, not something this loop can responsibly write without a
  human's editorial voice), the more honest and differentiated post is
  a first-person, fully accurate explanation of how this site itself
  gets built: the weekly propose-build-measure loop, the guardrails,
  and what's shipped so far. It's real content this loop can write
  truthfully (it's describing its own documented process), it's a
  genuinely unusual angle for search ("a site that builds itself"),
  and a substantive single post gives Blog's other metrics (avg. read
  time, scroll depth) something to actually measure.
- Change: Replaced the Blog placeholder in `app/blog/page.js` with a
  single real post, "How this site builds itself," covering the loop
  mechanics, the guardrails, and a recap of the three changes shipped
  so far (PR #1-#3). Added minimal typography styles (`post-meta`,
  `article h2/p/ul/li/code/a`) to `app/globals.css` — the site had no
  prose styling yet since every prior page was short fragments or
  cards. First draft linked out to the GitHub repo as "public"; caught
  in the local link check that the repo is actually private (404 for
  an unauthenticated visitor, not just the crawler), so that claim and
  link were removed before opening the PR. (PR #4)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes, including
  the one broken link caught and fixed pre-PR as above)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: Demos is the last of the four sections still showing the
  placeholder note — the same dead-end problem that motivated last
  week's Directory change. Its documented metrics (completion rate,
  repeat-use rate, session length) all require something a visitor can
  actually finish and replay, which a static placeholder can never
  produce. Adding one small, fully client-side interactive demo — a
  "Tool Finder" that asks what you're trying to do and recommends real
  tools from the Directory — gives Demos a real completion event
  (reaching a recommendation), a natural replay loop ("try another
  category"), and a second real cross-section link (Demos to
  Directory) reinforcing the session-depth bet from two weeks ago. This
  should move Demos' completion rate and repeat-use rate, and modestly
  add to Directory's outbound-click numbers.
- Change: Extracted the tool data from `app/directory/page.js` into a
  shared `app/lib/tool-categories.js` module (single source of truth so
  Demos and Directory can never recommend different tools). Replaced
  the Demos placeholder with a client component (`"use client"`) quiz:
  pick a category, see two recommended tools plus a link to the full
  category in the Directory, with a "try another category" reset.
  Added matching `finder`/`finder-option`/`finder-result` styles to
  `app/globals.css`. No new external links: the tool-card recommendations
  only render after a click, so they never appear in the static HTML
  the guardrail crawls. (PR #3)
- Guardrails: pass (local `next build` clean; local link check with
  `linkinator` against the production build for all 5 routes — the
  Demos page's static HTML has zero new outbound links, only the
  page's own JS chunk, so this change carries none of the external-link
  risk the last two did)
- Result (measured the following week): not yet measured

### 2026-08-09
- Hypothesis: Last week's change sends real clicks from `/` into
  `/directory`, but the Directory page was still a placeholder note —
  visitors who followed that new entry point landed on a dead end with
  nothing to click. The Directory page's own metric (outbound clicks to
  tools) can't move at all without real tools on the page, and a dead
  end right after the homepage funnel undercuts the session-depth gain
  that change was betting on. Replacing the placeholder with a real
  curated list of AI tools, grouped by category, with outbound links,
  should increase outbound clicks to tools and entries browsed per
  session, both leading indicators for returning-visitor rate.
- Change: Replaced the Directory placeholder with 12 real tools across
  4 categories (Chat & Assistants, Coding, Image/Video/Audio, Workflow
  & Data), each an outbound link opened in a new tab
  (`target="_blank"`) so browsing the directory doesn't cost the
  session. Added matching `tool-category`/`tool-grid`/`tool-card` styles
  to `app/globals.css`. (PR #2)
- Guardrails: pass after one round-trip through CI (local `next build`
  clean; all 12 outbound links plus every existing internal link
  verified 200 with a local link check against the production build
  before opening the PR — one candidate, Notion, was dropped locally
  after it came back 403 from bot protection and was swapped for
  Zapier). The actual CI Lychee run then failed on Gemini
  (`gemini.google.com`) with an HTTP/2 protocol error — a known lychee
  quirk on Google-fronted domains that a local link check couldn't
  reproduce (curl and Node-based checkers negotiate HTTP/2 differently
  and don't trip it). Swapped Gemini for You.com and re-pushed.
- Result (measured the following week): not yet measured

### 2026-08-09
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
  theme. (PR #1)
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
