---
track: maintain
filed-by: maintain
title: Re-check GPT-5.6 Sol's promotional price after 21 November 2026, when OpenAI's own page says it may end
created: 2026-08-25
expires: 2026-12-05
serves: floor
priority: 2
---

## Why now

Round 194 (maintain) found that `/blog/gpt-5-6-price-drop` no longer matches
OpenAI's live pricing: the post reports Sol at a flat $5 input / $30 output
per million tokens and calls that "unchanged" from the 9 July 2026 launch.
OpenAI's API pricing page (`developers.openai.com/api/docs/pricing`, fetched
2026-08-25) now shows `gpt-5.6-sol` at $4.00 input / $20.00 output for
short-context requests — a rate the page's own footnote calls "GPT-5.6 Sol's
promotional pricing," stated as "available at least through November 21,
2026" — and $8.00 input / $30.00 output for long-context requests. Neither
figure is $5/$30. This was corrected in place in the post (a dated
correction-note, original text left standing) rather than silently rewritten;
see `app/blog/gpt-5-6-price-drop/page.js` and the round-194 `CHANGELOG.md`
entry.

The page's own wording — "at least through" — states a floor, not a fixed
end date, so it is not certain anything changes on 21 November. But it is the
one date OpenAI's own page names, so it is the date a future check should not
miss. Ordinary 90-day blog staleness would not catch a mid-window price
change like this one (the post was inside its staleness window with a green
`verified` stamp the whole time this round found it wrong), so this item
exists to put a specific date in front of a future maintain round rather than
rely on the window alone.

## Evidence

- `developers.openai.com/api/docs/pricing`, fetched 2026-08-25: `gpt-5.6-sol`
  row reads (short context) Input $4.00, Cached input $0.40, Cache writes
  $5.00, Output $20.00; (long context) Input $8.00, Cached input $0.80, Cache
  writes $10.00, Output $30.00. Footnote: "GPT-5.6 Sol's promotional pricing
  is available at least through November 21, 2026."
- `app/blog/gpt-5-6-price-drop/page.js`, "What did not change" section
  (pre-existing text, not edited) — the $5/$30-unchanged claim this
  contradicts.

## Done when

- [ ] A maintain round on or after 22 November 2026 re-fetches OpenAI's
      pricing page and records what Sol costs then, correcting the post
      again (in place, dated) if the promotional rate has changed or lapsed.
- [ ] If OpenAI extends the promotional window past 21 November, that is
      recorded too — this item is satisfied by a genuine re-check either way,
      not by a particular outcome.
