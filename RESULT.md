done

Updated `content/wiki/model/minimax-minimax-m2-7-free.md` with the measured
finding: OpenRouter's live models API omitted `minimax/minimax-m2.7:free` on
2026-09-08 and its row-specific endpoint returned an empty `endpoints` array;
MiniMax's own documentation still supports MiniMax-M2.7 but does not establish
a free tier. The page therefore records a router-specific free-tier withdrawal
without claiming model retirement or renaming, and keeps the `feeds:` binding.

The answered vanished-row record was already present at
`data/vanished/answered/openrouter-models--minimax-minimax-m2-7-free.md` and
was left byte-for-byte unchanged. The derived search index changed only to
reflect that the entry now has prose.

Verification:
- focused vanished/freshness/queue tests: 24 passed
- `npm run test`: 1,698 passed
- `npm run build`: passed
- `node scripts/verify-surfaces.mjs`: passed
- `node scripts/verify-design.mjs`: passed
