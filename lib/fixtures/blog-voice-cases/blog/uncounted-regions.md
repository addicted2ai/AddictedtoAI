---
title: "A note whose marks are all outside the counted scope"
date: "2026-08-28"
mentions: []
---

The voice document counts outside code fences, blockquotes, and dated
correction blocks. Everything below sits in one of those three, so a lint that
counted it would report marks no author of prose ever wrote.

```js
const a = 1; const b = 2; const c = 3; const d = 4; const e = 5;
const f = 6; const g = 7; const h = 8; // — — — — — — — — — — — —
```

> A quoted source may write however it writes; this post; this piece; deep
> dive; only time will tell; delve; pivotal; robust; seamless; crucial;
> — — — — — — — — — — — — — —

**Update, 2026-08-29:** a correction is appended and dated rather than folded
into the body; its punctuation belongs to the correction — — — — — — — — — —
— — — and not to the prose it corrects; moreover; furthermore; additionally.

The prose the author wrote is this paragraph and the one at the top, and
neither of them carries a mark on the list.
