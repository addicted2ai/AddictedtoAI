# IR-CP-UI-001-2-5 — implementer report, Players Board (RD-005)

```yaml
id: IR-CP-UI-001-2-5
version: 1
schema: loops/ui-loop/graph/schemas.md#implementer-report
depends_on: [RD-005, IR-CP-UI-001-2-4, CP-UI-001-2.v5]
branch: ui/concept-2
worktree: D:\AddictedtoAI-c2
head: 2227ef9
```

## Gates
build PASS (log read; warnings all pre-existing — 276 `currency-literal`, 10 `arxiv-pin-debt`; no
error; JS 103 kB) · verify-design PASS 46/46 (`data/launch.json` restored) · verify-surfaces PASS ·
ui-invariants PASS **24/24**, only S22 clause (e) changed.

## Fix 1 — the attribution renders FIRST (JV-sys F-sys-5-1) — MET

RD-004 put the name *after* the fragment inside the one-line clamp, and `text-overflow: ellipsis`
elides at the END of the line box, so the ellipsis reached the attribution first. Only the ORDER
moves; the clamp is untouched as a form (do_not_touch; S22 (c) still green). Whatever renders first
is the last thing lost, so the name is now structurally unelidable and the quoted words take the
truncation — surviving in full in the cell's `title` and in the model record. The name is still the
link to the cited page, still DATA (`org.data.display_name`), never authored copy.

**2 claims / 14 blanks, unchanged from v4** (the lede's derived count still reads "today 14 of 16
organisations have none"). Verbatim, identical at 1440/390 (server-rendered) and both themes:

| org | cell reads |
|---|---|
| Google DeepMind | `Google DeepMind — 54.9%, accessed 2026-09-03` (→ `deepmind.google/models/gemini/flash/`) |
| Tencent | `Tencent — 2.99/4.00 average in a blind, Tencent-internal evaluation of 163 experts over 203 engineering tasks — versus GLM-5.3 at 2.92/4.00 and Kimi K3 at 2.94/4.00, accessed 2026-09-02` (→ `www.tencent.com/…`) |

Measured at 1440: clamp 153.0px, "Google DeepMind" 110.3px starting at the line's own left edge —
42.7px of headroom, so the ellipsis falls on the value. Tencent's name is shorter.

## Fix 2 — registrable-domain (eTLD+1) matching (RT FM-N5) — MET

The label scan is GONE from renderer and gate alike. **The rule** (stated once in
`lib/render/frontier.mjs`, re-derived independently in S22(e), in RULES.md R13's round-5 addendum):
the public suffix is the host's LAST label, except for an explicit two-label table (`co.uk`,
`com.cn`, `github.io`, `pages.dev`, …), where it is the last two; the **registrable domain** is that
suffix plus the one label left of it, and that **registrable label** — what the registrant actually
bought — is the only label ownership can be read from.

- `www.tencent.com` → `tencent.com` / `tencent`
- `deepmind.google` → `deepmind.google` / `deepmind` — `.google` is a single-label brand TLD, so
  `blog.google` → `blog.google` is a DIFFERENT registrable domain, and neither is `google.com`:
  under a brand TLD each sub-label is separately registrable.
- `google.attacker.example` → `attacker.example` / `attacker` — refused.

A source is the row vendor's when EITHER its registrable domain equals one the org entry records
citing itself from, OR its registrable label is one of the org's own name tokens (display name +
explicit `aliases`, minus generic corporate words). `endsWith` is gone too — it had FM-N5's shape
from the other side (`anthropic.com.attacker.example`) — and eTLD+1 equality covers every real
subdomain. `blog.google` drops out of Google DeepMind's *recorded* set (its label names nobody); its
own sources reach the column through the alias half. Both claims unchanged, verified in the built HTML.

## rule_changes (paired) — RULES.md R13 round-5 addendum + S22 clause (e)

(iv) an attribution inside a clamp goes where the clamp cannot eat it; (v) ownership is read off the
registrable domain, never off a host's labels. S22(e) measures the `.src` rect against the clamp's
visible box at both viewports — name starts the line, ends ≥4px inside the visible edge while the
line overflows — and re-derives vendor-ness with its own table.

## Falsifiers — all fired, both ends

- **(e-iv) name truncated**: `--break "….board-claim .src{font-size:2.6rem}"` → FIRED, *"…is
  truncated: it needs 353.0px and ends 200.0px past the 153.0px the clamp shows"*. Fires from the
  box side too, at `max-width:122px` (headroom 2.1px).
- **(e-v) other end, the name crowding out the claim**: `--break "….src{font-size:16px}"` → FIRED,
  *"takes 88.7% of the clamp (135.8px of 153.0px), leaving 17.2px for the quoted value"*.
- **(e-vi) FM-N5 made live** (render-logic + rebuild): the old label scan restored AND one
  `source_url` rewritten to the spoof shape `tencent.com.attacker.example` → FIRED, *"renders a fact
  cited to a THIRD PARTY … source tencent.com.attacker.example"*. Both halves are needed: the fixed
  renderer refuses the spoof alone, so nothing reaches a cell. Spoof left in, renderer restored →
  that row blanks, board renders one claim, S22 green.
- **(e-vii) other end of the vendor test**: alias half dropped → FIRED, *"the VENDOR CLAIM column
  renders ZERO claims across 16 rows"*.

**Falsifier honesty — one clause REMOVED rather than kept green.** That second end was first
written as the quoted value's own visible run, via a Range starting after the `.src` link. Measured,
that range's left edge IS the link's right edge (both 110.33px in a 153.0px clamp), so the number
was `headroom` again — one quantity at two thresholds, unfalsifiable alone (at 122px headroom's own
4px floor fired first; at 126px neither fired, 0 of 1). Replaced with a PROPORTION, which falsifies
alone at (e-v) — the treatment S22b's width clause got in RD-003. Two render-logic breaks (RD-004's
order restored; the fragment dropped) fired on the *attribution-order* test next door instead:
observations, not falsifiers. All breaks restored; `content/`, `data/` byte-identical after.

## Declines / Desk
- **None declined.** Nothing in `do_not_touch` edited: clamp, grid, columns, hatch, READ cell, fetch
  line, door, nav, tokens, lede WORDS, catalog, tutorials all stand. No CSS change at all; no
  content, data, public, copy or route change.
- **Desk data item, not fixed here (RT FM-N6):** a product-brand domain is recognised only where the
  org record's `aliases` carry that brand. Moonshot's own `platform.kimi.ai` is cited today and its
  aliases are "Moonshot AI"/"Moonshot"/"月之暗面", never "Kimi", so a future Kimi benchmark cited
  there blanks by omission with nothing failing. eTLD+1 neither causes nor fixes it: a data gap.

## Files
Changed: `lib/render/frontier.mjs`, `tools/ui-invariants.mjs`, `loops/ui-loop/RULES.md`; new: this
report. Untouched: rig, `evidence/`, `content/`, `data/`, `public/`, `app/`.

## Notes for verify
Δ `frontier--*--1440/390.png`, both themes: both claim cells READ VENDOR-FIRST (table above) — the
organisation name whole and linked at the cell's left edge, the ellipsis landing on the quoted
value. Counts, blanks, lede and every other column unchanged.
