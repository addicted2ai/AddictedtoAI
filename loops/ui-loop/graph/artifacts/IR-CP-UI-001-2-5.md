# IR-CP-UI-001-2-5 — implementer report, Players Board (RD-005)

```yaml
id: IR-CP-UI-001-2-5
version: 1
schema: loops/ui-loop/graph/schemas.md#implementer-report
depends_on: [RD-005, IR-CP-UI-001-2-4, CP-UI-001-2.v5]
branch: ui/concept-2
worktree: D:\AddictedtoAI-c2
head: (this commit)
```

## Gates
- build PASS (log read; warnings all pre-existing — 276 `currency-literal`, 10 `arxiv-pin-debt`; no
  error; JS 103 kB) · verify-design PASS 46/46 (`data/launch.json` restored) · verify-surfaces PASS
- ui-invariants PASS **24/24**. Only S22 clause (e) changed; nothing else touched.

## Fix 1 — the attribution renders FIRST (JV-sys F-sys-5-1) — MET

RD-004 put the vendor's name *after* the fragment inside the one-line clamp, and
`text-overflow: ellipsis` elides at the END of the line box, so the ellipsis reached the
attribution before it reached the quoted words. Only the ORDER moves; the clamp is untouched as a
form (do_not_touch; S22 clause (c) still green). Whatever renders first is the last thing lost, so
the name is now structurally unelidable and the quoted words take the truncation — they survive in
full in the cell's `title` and in the model record. The name is still the link to the cited page and
still DATA (`org.data.display_name`), never authored copy.

**2 claims / 14 blanks, unchanged from v4** (the lede's derived count still reads "today 14 of 16
organisations have none"). Verbatim, identical at 1440 and 390 (server-rendered), both themes:

| org | cell reads |
|---|---|
| Google DeepMind | `Google DeepMind — 54.9%, accessed 2026-09-03` (name → `deepmind.google/models/gemini/flash/`) |
| Tencent | `Tencent — 2.99/4.00 average in a blind, Tencent-internal evaluation of 163 experts over 203 engineering tasks — versus GLM-5.3 at 2.92/4.00 and Kimi K3 at 2.94/4.00, accessed 2026-09-02` (name → `www.tencent.com/…`) |

Measured at 1440: the clamp shows 153.0px, "Google DeepMind" needs 110.3px and starts at the line's
own left edge — 42.7px of headroom, so the ellipsis falls on the value. Tencent's name is shorter.

## Fix 2 — registrable-domain (eTLD+1) matching (RT FM-N5) — MET

The label scan is GONE from both the renderer and the gate. **The rule** (stated once in
`lib/render/frontier.mjs`, re-derived independently in S22(e), documented in RULES.md R13's round-5
addendum): the public suffix is the host's LAST label, except for an explicit two-label table
(`co.uk`, `com.cn`, `github.io`, `pages.dev`, …), where it is the last two; the **registrable
domain** is that suffix plus the one label to its left, and that **registrable label** — the string
the registrant actually bought — is the only label ownership can be read from.

- `www.tencent.com` → `tencent.com` / `tencent`
- `deepmind.google` → `deepmind.google` / `deepmind` — `.google` is a single-label brand TLD, so
  `blog.google` → `blog.google` is a DIFFERENT registrable domain from it, and neither is
  `google.com`. Under a brand TLD each sub-label is separately registrable; collapsing them into one
  party is the same mistake in the other direction.
- `google.attacker.example` → `attacker.example` / `attacker` — refused.

A source is the row vendor's when EITHER its registrable domain equals one the org entry records
citing itself from, OR its registrable label is one of the org's own name tokens (display name +
explicit `aliases`, generic corporate words removed). `endsWith` is gone too: it had FM-N5's shape
from the other side (`anthropic.com.attacker.example`), and eTLD+1 equality already covers every
real subdomain. `blog.google` drops out of Google DeepMind's *recorded* set (its registrable label
names nobody) and its own sources reach the column through the alias half — the two rendered claims
are unchanged, verified against the built HTML.

## rule_changes (paired) — RULES.md R13 round-5 addendum + S22 clause (e)

(iv) an attribution inside a clamp is placed where the clamp cannot eat it; (v) ownership is read off
the registrable domain, never off a host's labels. S22(e) now measures the `.src` rect against the
clamp's own visible box at both viewports — the name starts the line, and its rect ends ≥4px inside
the visible edge while the line overflows (the ellipsis is painted at that edge) — and re-derives
vendor-ness with its own suffix table, never importing `frontier.mjs`.

## Falsifiers — every clause fired, both ends

- **(e-iv) name truncated**: `--break "#frontier-board .board-claim .src{font-size:2.6rem}"` → FIRED,
  *"…"Google DeepMind" is truncated: it needs 353.0px and ends 200.0px past the 153.0px the clamp
  shows"*. Also fires from the box side at `max-width:122px` (headroom 2.1px).
- **(e-v) other end, the name crowding the claim out**: `--break "….src{font-size:16px}"` → FIRED,
  *"takes 88.7% of the clamp (135.8px of 153.0px), leaving 17.2px for the quoted value"*.
- **(e-vi) FM-N5 made live** (render-logic + rebuild): the old label scan restored AND one
  `source_url` rewritten to the spoof shape `tencent.com.attacker.example` → FIRED, *"a vendor-claim
  cell renders a fact cited to a THIRD PARTY … source tencent.com.attacker.example"*. Both halves
  are needed — the fixed renderer refuses the spoof alone, so nothing would reach a cell. Confirmed
  the pair: spoof left in, renderer restored → that row blanks, board renders one claim, S22 green.
- **(e-vii) other end of the vendor test**: alias half dropped → FIRED, *"the VENDOR CLAIM column
  renders ZERO claims across 16 rows"*.

**Falsifier honesty — one clause REMOVED rather than kept green.** The second end of the
name-visibility clause was first written as the quoted value's own visible run, measured with a
Range starting after the `.src` link. Measured, that range's left edge IS the link's right edge
(both 110.33px in a 153.0px clamp), so the number it produced was `headroom` again — one quantity at
two thresholds, unfalsifiable alone (at `max-width:122px` headroom's 4px floor fired first; at 126px
neither fired, 0 of 1). Replaced with a PROPORTION, which falsifies alone at (e-v). Same treatment
S22b's own width clause got in RD-003. Separately, two render-logic breaks (RD-004's order restored;
the fragment dropped entirely) fired on the *attribution-order* test next door rather than on the
clause they were aimed at — recorded as observations, not as this clause's falsifiers. All breaks
restored; `content/` and `data/` are byte-identical afterwards.

## Declines / Desk items
- **None declined.** Nothing in `do_not_touch` edited: clamp, grid, columns, hatch, READ cell, fetch
  line, door, nav, tokens, lede WORDS, catalog and tutorials all stand; no CSS change at all; no
  content, data, public, copy or route change.
- **Desk data item, not fixed here (RT FM-N6):** vendor-domain recognition can only see a
  product-brand domain where the org record's `aliases` carry that brand. Moonshot's own
  `platform.kimi.ai` is cited today and Moonshot's aliases are "Moonshot AI"/"Moonshot"/"月之暗面",
  never "Kimi", so a future Kimi benchmark cited there blanks by omission with nothing failing
  anywhere. The eTLD+1 rule neither causes nor fixes it — it is an alias-completeness gap in data.

## Files
Changed: `lib/render/frontier.mjs`, `tools/ui-invariants.mjs`, `loops/ui-loop/RULES.md`.
New: this report. Untouched: rig, `evidence/`, `content/`, `data/`, `public/`, `app/`.

## Notes for verify
Δ `frontier--*--1440/390.png`, both themes: each of the two claim cells now READS VENDOR-FIRST —
`Google DeepMind — 54.9%, accessed 2026-09-03` and `Tencent — 2.99/4.00 average in a blind…` — with
the organisation name whole and linked at the cell's left edge, and the ellipsis, where it falls,
landing on the quoted value. Counts, blanks, lede and every other column are unchanged.
