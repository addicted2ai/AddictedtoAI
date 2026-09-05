# Contract: judge-system

Dimensions owned: **TYPE — typographic system (10)**, **COLR — colour discipline (5)**, **FAM — family
coherence (10)**, **ALLR — identity and allure (20)**. Model: Opus (K13). The ALLR dimension is the
brief's centre (K10) and the one never to downgrade.

Reads (exactly): the packet under evaluation (its `design_moves`, `elements.provenance_label`,
`reuses`), `state.md` K10 only, `openspec/specs/site` design-bar requirement, `RULES.md` R7, R9, R16,
`app/globals.css` — ONLY the `:root` custom-property blocks (tokens), not the rules — and the evidence
below. You do NOT read DOM measurements or the invariants report. You never see a sibling's verdict.
Writes: `graph/artifacts/JV-sys-<packet>-<v>.json`.

## Required evidence (rig coverage gate reads the `coverage:` line)

coverage: labels=home,wiki-entry,table-catalog; themes=light,dark; viewports=1440,390; files=contact-sheet--light--1440.png,contact-sheet--dark--1440.png,contact-sheet--light--390.png

`evidence/<set>/contact-sheet--light--1440.png` and `contact-sheet--dark--1440.png` (every label at
1440, one sheet per theme, built by `graph/contact-sheet.py`), `contact-sheet--light--390.png`, and
the individual captures for `home`, `frontier` (when built), `wiki-entry`, `table-catalog` in both
themes at 1440 and 390. The family is judged from the SHEET (lesson: judge the system, not the
part); a single page is never sufficient evidence for FAM.

## Questions

1. `[TYPE]` One scale, deliberate weights, a controlled measure (about 65 characters for prose), one
   vertical rhythm, held across every template on the sheet? Name the outlier if any.
2. `[TYPE]` **(critical)** Is the typeface a decision made for this domain (site spec: "distinctive
   typographic identity"), self-hosted with no external origin, rather than an inherited default
   stack? Cite the token and the face.
3. `[COLR]` Colour reserved for state and meaning; accent never at rest on a border, rule or
   divider (R9); light, dark and the un-stamped state each read as a considered set on the sheets?
4. `[FAM]` Do all templates read as one system: one radii vocabulary, one spacing scale, one
   treatment of headers and lists? Name the template that breaks the family, if one does.
5. `[ALLR]` **(critical)** Would a first-time human visitor want to keep reading this site, rather
   than finding it mechanical (K10)? Name the specific move on the home and Frontier surfaces that
   produces the pull, or the absence that prevents it. "Looks nice" is not an answer; a mechanism is.
6. `[ALLR]` Does the design convey the field's pace, its cadence, recency and change, through
   structure and data rather than adjectives or decoration (constitution: no hype; site spec:
   decoration never displaces information)?
7. `[ALLR]` Is there one signature move (a layout, a type gesture, a data-driven graphic) a visitor
   would remember and no template site has, with restraint everywhere else? Or is boldness spent in
   several places at once?
8. `[ALLR]` Do claimed-versus-verified presentations read honestly at a glance: a verbatim vendor
   claim unmistakably labelled unverified, an empty cell reading as absent rather than as evidence?
9. `(meta)` Self-check for order and verbosity bias: did the longer packet, or the one you read
   first, get the benefit of the doubt on 5–7? Excluded from scoring.

Concept round (no pixels, discipline rule 10): number 2 (declared face and hosting), 5–8 from the
packet's declared moves and provenance labels, and record 1, 3, 4 as deferred in `diagnosis`.
Benchmark citations (Linear, Stripe, Vercel, or better ones you name) must state the property of
the exemplar's CONTENT that makes its treatment transfer here, not just the treatment.
