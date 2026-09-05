# Iteration 4 — work queue: the shared design system

**Scope.** `app/globals.css` and `app/layout.tsx`. **`loops/ui-loop/RULES.md` and `tools/ui-invariants.mjs` are ALWAYS in scope** and never count against a scope line — landing the invariant is part of landing the fix (SKILL.md H3).

**Why these seven together.** The three weakest rubric categories are information density 6.0, family coherence 6.0 and typographic system 7.0. Every item below is a shared-system defect feeding one of those. They are worked as one change because they collide in one file.

**Not in scope, queued for iteration 5:** I5, I11, I8, I9, I23 — page templates.

---

## I16 — impact 6 — shared design system (app/globals.css + app/layout.tsx) and the index page templates

**Problem (authoritative).** Unchanged from the anchor and deferred by scope, not on merit — and re-confirmed live on this iteration's evidence rather than carried on report. Four content right-edges across the property against a 1216px shell with a constant 145px left margin: primary content ends near x=660 on /wiki and /data rows, x=751 on prose templates, x=1005 on /learn, and x=1295 wherever a full-shell rule is drawn. On current/data--light--1440.png every section rule runs to x=1295 over content that stops near x=740, and the right 45% of the shell is empty for the page's full height; /wiki leaves 55% empty across all 85 rows. This is the residue S1 left behind: the anchor's complaint was 950px of dead space inside the row, and R7 moved that dead space outside the row rather than spending it. Against Vercel's benchmark — a grid whose rhythm stays visible across every page of the property — four independent right edges is four grids, not one.

**Invariant.** Every page template shall place its primary content column against one of at most two declared grid tracks, and no template shall leave more than one track's worth of the shell permanently unoccupied along its full height.

**Governing rule.** RULES.md R7 and R10 — checked and binding. R7 pins the list-row label measure and any remedy must keep it; R10 pins rule width to content width and a narrower shell satisfies it more easily. DC2 accepted the decline for a shared-system-only iteration and explicitly invited this re-file for a template-scoped one.

**Prescription (hypothesis).** Declare two tracks in globals.css — a text track at --measure and a wide track at --shell — and assign every template to one of them, narrowing --shell to the widest content that actually uses it (roughly 1005px, /learn's edge) rather than leaving it at 1216px with nothing reaching the edge. The catalog table and the home changed-feed are the only surfaces with a genuine claim on the wide track.

---

## I17 — impact 5 — shared design system (app/globals.css, .browse-row)

**Problem (authoritative).** Unchanged from the anchor and deferred by scope. .browse-row is grid-template-columns: minmax(0, var(--measure-list)) auto auto and each row is its own independent grid, so the two trailing tracks size to that row's own content and nothing aligns across rows: the kind column starts at a constant x, the status column starts wherever that row's kind word happens to end. Against Stripe's benchmark of tabular presentation as a first-class surface, a column that starts at a different x on every row is not a column.

**Invariant.** In a row-based list surface, every column shall begin at the same x position on every row of that surface.

**Governing rule.** RULES.md R7 — checked and binding. R7 requires the label column bounded to --measure-list and any remedy keeps it; only the two trailing tracks change. R8 is unaffected since no rule is added.

**Prescription (hypothesis).** Move the grid declaration to the list container with `display: grid; grid-template-columns: minmax(0, var(--measure-list)) max-content max-content` and let rows contribute cells to one shared grid (subgrid where supported, a container-level grid otherwise), so the trailing tracks size to the widest cell in the column rather than to each row's own.

---

## I18 — impact 5 — shared design system (app/globals.css) — consumed by app/page.tsx (home) and app/learn

**Problem (authoritative).** Unchanged from the anchor and deferred by scope. R9 claims one record-link treatment across every index template and it reaches three of five: /wiki, /catalog and /blog are ink with a muted underline, the home changed-feed and rail links are still --accent with an underline, and /learn's tutorial titles are plain ink with no underline at all. A rule that holds on three of five surfaces is a convention, not a system, and the home page — the front door — is one of the two that break it.

**Invariant.** Every link to a record, on every index template including the home changed-feed and /learn, shall use one identical resting treatment in colour and underline.

**Governing rule.** RULES.md R9 — checked and directly binding; this item is R9 not yet being true. R1 also checked: --ink on --paper already clears contrast in both themes, so extending the existing treatment cannot regress it. R6 checked and unaffected.

**Prescription (hypothesis).** Extend the existing record-link rule to the home feed's headline links and /learn's tutorial titles, and widen S6's route list to include / and /learn so the invariant covers the two templates it currently does not visit.

---

## I24 — impact 6 — shared design system (app/globals.css, .site-header)

**Problem (authoritative).** The sticky site header is 129.3px tall at 390x844 — 15.3% of the viewport, held permanently, on every route. I measured it on /, /wiki, /tools and /catalog and all four are identical, and at page scroll 3000 on /catalog it still occupies y 0-129.3. At 1440x900 the same header is 45.8px, 5.1%. It stacks three bands: a wordmark line, a nav that wraps to two lines ('wiki catalog tools learn tutorials blog' then 'impossible -> routine'), and a full-width search field with the theme toggle. Chrome that scrolls away costs a reader once; chrome that persists costs them on every screen, and one screen in every 6.5 of the 103-screen mobile catalog is now spent on it. It is pre-existing rather than introduced this round, but it is newly consequential now that /catalog at 390px is a 103-screen scroll, and it is the largest single contributor to the 776px of preamble in I23. Against Linear's benchmark — structure carried by type and spacing rather than by persistent boxes — a three-band permanent header is the opposite move. It is structurally invisible to the evidence set, which is captured at scroll 0 in every image (JUDGE.md L3), so it is measured rather than read off a screenshot.

**Invariant.** The sticky site header shall occupy no more than 10% of the viewport height at 390x844 on every route.

**Governing rule.** RULES.md R6 — checked and binding: R6 requires changed-feed lines visible above the fold at 390x844, currently 4 of 24 per this run's verify-design output, and a shorter header can only raise that count, never lower it. RULES.md R4 also checked and binding: the search box and the theme toggle must remain reachable AND activatable by keyboard, so they may be collapsed behind a control but never removed from the tab order.

**Prescription (hypothesis).** Hypothesis: at this width keep only the wordmark, the search affordance and the theme toggle on one 44px row, and move the seven nav destinations behind a disclosure that is itself a tab stop and opens on Enter (R4 satisfied by activation, not by presence). An alternative that preserves everything: keep the full header in the document but make only the first band sticky, letting the nav and search bands scroll away — the reader reaches them by scrolling to the top, which is the gesture they already use. Either lands under 84px. Do not solve it by shrinking the type: R1's contrast and target-size floors outrank this item.

---

## I25 — impact 5 — app/globals.css (#catalog-table-wrap, <main> trailing padding, .site-footer margin-top)

**Problem (authoritative).** The remedy for I15 is correct and its governing inequality holds, but the route now reserves 96px of ground that nothing occupies, and the reservation has a second cost the anchor's framing missed. Measured at 1440x900 with the page at its 355px maximum: #catalog-table-wrap bottom 722.7px, .site-footer top 818.7px — a 96px gap, three table rows, held empty at every scroll position because --footer-h (192.7px) must cover the whole distance from the wrap's bottom edge to the document's bottom. That distance is NOT an over-measurement of an 81.1px footer, which is how the previous verdict filed it and where I now depart: --footer-h is measured tightly and correctly, and the 96px is exactly <main>'s trailing padding (3rem) plus .site-footer's margin-top (3rem), both of which genuinely exist in the document. The defect is that this route spends its trailing whitespace twice — once as page padding below the table, and again as headroom subtracted from the scrollport that has to fit above it. Second symptom, and the reason this is worth more than three rows: with the table capped at 661.3px and terminating 96px above the footer over a --panel background on --paper ground, the surface now reads as a floating card rather than as the page's own content field. That is the relocation clause — a geometry fix re-issued as chrome — and it is the one respect in which the shipped remedy moved away from Linear, whose tables are the page rather than a box on it.

**Invariant.** At 1440x900 with the page at maximum scroll, the vertical gap between #catalog-table-wrap's bottom edge and .site-footer's top edge shall not exceed one table row height, and #catalog-table-wrap shall not read as a bounded card: its background shall not differ from the page ground unless a mark is doing work that spacing cannot.

**Governing rule.** RULES.md R11 — checked and binding. The corridor must survive any height change: the governing inequality viewport >= headerOffset + wrapHeight + footerHeight recorded in R11's round-2 addendum must still hold at the new height, and S7's clause 2b must still pass at page-scroll maximum composed with container scroll. RULES.md R8 also checked: the panel background is currently the group's single boundary mark, so if it is removed the record separation must come from rhythm, not from a re-added rule.

**Prescription (hypothesis).** Reduce <main>'s trailing padding-block-end and .site-footer's margin-top on this route (or globally, if the rhythm holds elsewhere) from 3rem each to the row height, then let FOOTER_HEIGHT_SCRIPT re-measure — the token is derived, so it follows automatically and the inequality stays true with the existing 16px buffer. That returns roughly three rows per screen. Do not shrink --footer-h by hand: it is measured correctly, and hand-tuning it is what break (6) in S7's falsifier record already found to fail. On the card reading, the cheapest test is to drop --panel to --paper on .table-wrap and check whether the thead's existing bottom rule and the row rhythm are enough separation; if they are not, keep the panel and record the card reading as accepted with cause.

---

## I20 — impact 4 — app/wiki entry page template and app/colophon (section headings inside a measure-bounded block)

**Problem (authoritative).** Unchanged from the anchor, and now confirmed on a third template. S5 bounded .facts to --measure but a section heading's own rule still spans the full shell: on /wiki/concept/ai-winter the FACTS label sits at x=145 with a rule running to x=1295 while the definition list beneath it stops at x=751 — 2.1 times the width of the block it introduces. current/data--light--1440.png shows the identical shape on /data, where every section rule reaches x=1295 over content ending near x=740. The same pages get it right immediately below, which is what makes it read as an oversight rather than a choice.

**Invariant.** A horizontal rule introducing a content block shall not exceed that block's own rendered width.

**Governing rule.** RULES.md R10 — checked and directly binding; this item is R10 not yet being true for section headings. The enforcing invariant S5 checks the blocks S5 named and not their headings.

**Prescription (hypothesis).** Bound the section-heading rule to the same measure token as the block it introduces rather than to .shell, and widen S5 to assert heading rule width against the following block's width on /wiki/concept/ai-winter, /colophon and /data.

---

## I10 — impact 5 — shared design system (app/globals.css)

**Problem (authoritative).** Unchanged from the anchor. There is no @font-face, no next/font and no bundled face anywhere in app/. Type is a fallback chain — Charter, Bitstream Charter, Sitka Text, Cambria, Georgia, Times New Roman — plus a system mono stack. The serif/mono split is a good domain choice applied with discipline; the defect is that the resolved face differs per platform, so the vertical rhythm the whole system depends on is not the same rhythm on every reader's machine, and no measurement taken here describes what a Windows or Android reader sees. This is precisely Vercel's benchmark mechanism — a typeface chosen for the domain and actually delivered — and it is the one the artifact has not made.

**Invariant.** The resolved body face shall be identical across platforms — either self-hosted, or a stack whose fallbacks are metric-compatible with the primary via size-adjust.

**Governing rule.** RULES.md R3 — checked and binding: first-load payload must stay under 150 KB gzipped, worst route currently 122.9 KB, leaving 27.1 KB of headroom. R3 as written measures JavaScript, so a woff2 face would not count against it as specified; say so explicitly rather than assuming, and prefer a subset under 30 KB either way.

**Prescription (hypothesis).** Self-host one subset woff2 for the serif with font-display: swap and a size-adjust-tuned local fallback, or keep the stack and add size-adjust / ascent-override per named fallback so the rhythm survives substitution. State in the implementer report which reading of R3 was taken.

---

