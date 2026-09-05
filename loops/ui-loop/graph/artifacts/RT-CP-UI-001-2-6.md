# RT-CP-UI-001-2-6 — red team on Players Board (anchored re-run, RD-005, FINAL)

```yaml
id: RT-CP-UI-001-2-6
version: 1
schema: loops/ui-loop/graph/schemas.md#red-team-report
depends_on: [CP-UI-001-2.v6, IR-CP-UI-001-2-5, RT-CP-UI-001-2-5, RD-005]
anchor: RT-CP-UI-001-2-5
```

Ground truth checked read-only in `D:\AddictedtoAI-c2` (head `2227ef9`): `registrable`/`orgOwnDomains`/
`isVendorSourced` in `lib/render/frontier.mjs`, S22(e)'s `registrableOf`/`namedReg`/`isVendorHost` in
`tools/ui-invariants.mjs`, `urlHost` (both files' own host-extraction), RULES.md R13 round-5 addendum.

## FM-N5 — MITIGATED

The label scan and `endsWith` are both gone; every case run against `registrable()`/`registrableOf()`
agrees between the two files and matches the stated rule:

- `tencent.com.attacker.example` → `attacker.example`/`attacker` — refused (IR e-vi's live falsifier,
  confirmed by re-reading the diff rather than re-run).
- `deepmind.google.evil.example` → `evil.example`/`evil` — refused; `deepmind` never reaches
  candidacy because it isn't the label left of the suffix.
- `bbc.co.uk` → suffix `co.uk` (table hit) → `bbc.co.uk`/`bbc`; a bare `co.uk` → `labels.length(2) <=
  suffix(2)` → `null`, refused, not "everyone's."
- IP host (`192.168.1.1`) → label `'1'`, `.length>=3` guard in both `orgOwnDomains`/`isVendorSourced`
  and S22's `namedReg` refuses it before token comparison — dead end, not a foothold.
- Uppercase host: `new URL(...).hostname` (frontier) and the WHATWG parser both lower-case ASCII
  hosts before either file ever sees a label — no divergence possible here.
- No-scheme source (`tencent.com/foo`, no `https://`): frontier's `new URL()` throws → `null`; S22's
  `hostOf` regex requires `^https?:\/\/` → no match → `null`. Both null, both refuse — consistent.

**S22(e) re-derives the same rule and fires on the spoof.** Its own suffix table
(`TWO_LABEL_SUFFIXES`) is byte-identical to `frontier.mjs`'s `MULTI_LABEL_SUFFIXES`; `namedReg`/
`isVendorHost` mirror `registrable`/`isVendorSourced` exactly, and IR's e-vi/e-vii falsifiers
(recorded, not re-run here per rule 5) already caught the spoof on the harness's own derivation, not
the render module's.

**Name-first ordering at 390, both themes.** S22's `srcFit` (offsetFromStart/headroom/width) is
geometry — box widths and font-size come from fixed rem tokens (`--board-claim-max`,
`.src{font-size:…}`); grep of `app/globals.css`'s `:root`/`@media (prefers-color-scheme:dark)`/
`[data-theme=dark]` blocks shows only color tokens (`--paper`, `--ink`, `--accent`, …) vary by theme —
none of the tokens the clamp or the name's box depend on. The check itself only stamps viewport, not
theme, but nothing theme-conditional can move the measured rects, so this is not a gap: IR's captures
(`frontier--*--1440/390.png`, both themes) confirm the same order visually where the automated check
does not loop themes to prove it.

## New finding

**Host-parsing divergence: S22(e)'s "independent" re-derivation is not parsing the same string
frontier.mjs parses, on a URL shape neither side tests.** `frontier.mjs`'s `urlHost` takes
`new URL(url).hostname` — the WHATWG parser strips userinfo (`user:pass@`) and port before either file
sees a label. `ui-invariants.mjs`'s `hostOf` (line ~2023) is `^https?:\/\/([^/?#]+)`: it captures the
WHOLE authority — userinfo and port included. For a 2-label vendor domain (the common shape here:
`tencent.com`, `deepmind.google`), `https://x@tencent.com/path` makes frontier compute label `tencent`
(correctly Tencent's own) while S22(e) computes `x@tencent` (a compound string that can't equal a
clean org token) — a FALSE-REJECT of a legitimate citation. Checked the opposite direction too: no
construction found where the merge coincidentally equals an org token, so this fails safe, never open.
Dormant — no `source_url` today carries userinfo or a port, and nothing gates against adding one. Not
FM-N5's shape (ownership-by-position); this is the harness disagreeing with the code it audits, on an
untested URL form.

```json
{"failure_modes": [
  {"id":"FM-N7","mode":"unseen surface","scenario":"S22(e)'s hostOf (regex `^https?:\\/\\/([^/?#]+)`) captures the full authority — userinfo and port included — while frontier.mjs's urlHost uses `new URL(url).hostname`, which strips both. On a 2-label vendor domain a userinfo/port source_url makes the two derive different labels: frontier correctly recognises the vendor, S22(e) builds a compound label (`x@tencent`) that can't equal a clean org token. Fail-safe direction only (false-reject), never spoof-admission — no construction found where the merge coincidentally matches a token. Dormant: no source_url today carries userinfo or a port","probability":2,"severity":2,"detectability":3,"mitigation_exists":false,"element":"tools/ui-invariants.mjs hostOf (~2023-2026) vs lib/render/frontier.mjs urlHost (~268-274)"}
]}
```

Smallest fix (below 50, recorded not mandatory): change `hostOf` to `new URL(u).hostname` (null on
throw) — the primitive `urlHost` already uses — instead of the authority-capturing regex.

## Standing questions

**Wrong in a week:** the same shape flagged twice now — a string standing in for verified ownership —
recurring one layer down, in how a URL gets cut into a host before ownership is even asked; the fix
keeps moving one mechanism right of the last spoof found.

**What every other site shows:** none derive vendor-citation identity from public-suffix arithmetic
hand-implemented twice; they skip the distinction or use a maintained public-suffix-list library
rather than a 30-line table kept in sync by convention across two files.
