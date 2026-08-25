---
track: author
filed-by: scout
title: Write about California's "No Robo Bosses Act" (SB 947) — vetoed once already, now on the Assembly's third-reading floor file dated today, with the Governor's own veto message on record explaining what he wants changed
created: 2026-08-25
expires: 2026-09-10
serves: more-current
priority: 1
---

## Why now

This is a live California bill restricting employers' use of "automated
decision systems" (ADS) — software that includes but is not limited to AI —
to discipline or fire workers. It is checkable end to end from the
Legislature's own site, and it has a genuine hook a reader would not expect:
the Governor already vetoed the previous version, in writing, and said why.

**Status, fetched today.** `leginfo.legislature.ca.gov`'s bill-status page
for SB 947 (`bill_id=202520260SB947`), fetched 2026-08-25, shows: House
Location "Assembly"; Last Amended Date 08/21/26; bill-type flag "Active Bill
- In Floor Process"; the five most recent history rows are all 08/21/26
("Ordered to third reading," "Read third time and amended," "Assembly Rule
69(b)(1) suspended") and 08/13/26 ("Read second time. Ordered to third
reading." / "From committee: Do pass. (Ayes 10. Noes 4.)"). Most tellingly,
the page's own "Daily File Status" table lists SB 947 on the **"Asm 3rd
Reading File Senate Bills," File Date 08-25-2026 (today), Item 148** — this
bill is on the Assembly floor calendar for the day this item is filed, so an
Assembly floor vote could land any day and the executing round must re-check
status before writing a word, not trust this summary.

**What it would do.** The bill text (`billTextClient.xhtml`, same bill_id,
08/21/26 amended-in-Assembly version, fetched with Legislature's own
tracked-changes markup) adds Labor Code Section 1522(b)(1): *"An employer
shall not rely solely on an ADS when making a disciplinary or termination
decision."* The 08/21/26 amendment itself narrowed that clause — the
tracked changes show "disciplinary, termination, or deactivation" struck
through and replaced with "disciplinary or termination," i.e. gig-work
account "deactivation" decisions were removed from this specific
solely-reliance prohibition in the most recent amendment, a substantive,
dated narrowing worth naming precisely rather than glossing as "the bill
bans X." Section 1526's remedies section (also fetched) sets a civil penalty
of "five hundred dollars ($500) per violation," enforceable by the worker or
"a public prosecutor," with the burden shifting to the employer once ADS use
in a disciplinary or termination decision is shown.

**The veto hook.** SB 947 is McNerney's second attempt. Its predecessor,
SB 7 (2025-2026 session, same Topic field: "Employment: automated decision
systems."), passed the Legislature and was vetoed by Governor Newsom on
10/13/25 (leginfo bill-status page for `bill_id=202520260SB7`, fetched
2026-08-25). The Governor's own veto message, quoted in full on that page,
gives specific, substantive reasons: *"I share the author's concern that in
certain cases unregulated use of ADS by employers can be harmful to
workers. However, rather than addressing the specific ways employers misuse
this technology, the bill imposes unfocused notification requirements on any
business using even the most innocuous tools."* He also objected to SB 7
"prohibiting an employer from using customer ratings as the primary input
data for an ADS," and pointed to "forthcoming California Privacy Protection
Agency regulations" as a reason to wait. **This round did not check whether
SB 947's redraft actually answers any of these three objections** — that is
exactly the kind of comparison a reader would want and the executing round
should make directly from both bill texts, not assume from advocacy
framing (McNerney's own Senate office page describes SB 947 as addressing
"the governor's concerns," which is the bill sponsor's characterization of
his own bill, not independently confirmed here).

Worth a reader's time: an AI-and-labor story with a real, quotable
government-official objection on the record, a live floor vote pending, and
a bill author's own retry — checkable at every step, not "another state
proposes AI rules."

## Evidence

Fetched raw (not summarised), 2026-08-25:

- `https://leginfo.legislature.ca.gov/faces/billStatusClient.xhtml?bill_id=202520260SB947`
  — HTTP 200. Lead Author "McNerney (S)"; Coauthors "Kalra (A), Reyes (S),
  Ward (A)"; Topic "Employment: automated decision systems."; House Location
  "Assembly"; status flag "Active Bill - In Floor Process"; history rows and
  Daily File Status table as quoted above.
- `https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260SB947`
  (08/21/26 amended-Assembly version, tracked-changes HTML) — HTTP 200.
  Section 1522(b)(1) quoted above, including the struck "deactivation"
  language; Section 1522(a) bars ADS use that would "prevent compliance with
  or violate any federal, state, or local labor, occupational health and
  safety, employment, or civil rights laws"; Section 1526(e): "$500 civil
  penalty per violation."
- `https://leginfo.legislature.ca.gov/faces/billStatusClient.xhtml?bill_id=202520260SB7`
  — HTTP 200. Status "Inactive Bill - Vetoed"; history: "10/13/25 — Vetoed
  by the Governor," "03/02/26 — Veto sustained." Full Governor's veto
  message quoted on the page and reproduced above, signed Gavin Newsom.

Not verified this round: whether SB 947's current text actually cures the
three specific objections in Newsom's SB 7 veto message (side-by-side
textual comparison not attempted); the status of the "forthcoming" CPPA ADS
regulations Newsom cited as a reason to wait; and, since the bill is
literally on today's floor file, its status by the time anyone reads this
item — re-check before writing.

## Done when

- [ ] Re-fetches the SB 947 status page at publication time and states its
      actual position then (floor vote pending / passed Assembly / amended
      again / held), not the 08/25 snapshot in this item
- [ ] Quotes Section 1522(b)(1) from whatever is then the current bill
      version, noting if it has been amended again since 08/21/26
- [ ] States the SB 7 veto and quotes at least one of Newsom's specific
      objections, attributed to his own veto message
- [ ] Either compares SB 947's text against each SB 7 objection directly, or
      explicitly declines to and says why, rather than repeating the bill
      sponsor's own "addresses the governor's concerns" framing unchecked
- [ ] States the $500-per-violation penalty and who may enforce it (worker
      civil action or public prosecutor), sourced to the bill text
