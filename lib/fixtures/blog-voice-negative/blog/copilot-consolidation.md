---
title: "copilot-consolidation"
date: "2026-08-14"
mentions: []
---

Posted
·
Facts verified
·
Subscribe via RSS
·
Back to the blog

If you used Group Chat in Microsoft’s consumer Copilot app, the
advice you were given on 14 August is not the advice on the page
today.

Microsoft is merging its consumer Copilot app and the Microsoft Copilot
app into one app, and retiring Podcasts, Deep Research, Group Chat and
Copilot Labs, with account updates beginning 18 August 2026. Most of
that was reported on 13 August, the day the support pages went up. What
was not reported is what happened to one of those pages afterwards: the
answer to “Will I lose my group chat history or content?”
used to say your own messages would survive. It now begins
“Yes.”

## The answer that reversed

On 14 August 2026, Microsoft’s

“Frequently asked questions about retiring Copilot
features”

answered that question this way, per the

Internet Archive’s capture at 11:34:10 UTC that day

: “Your own Group Chat messages, prompts, and artifacts will
remain available after your account updates. Each Group Chat will
appear as an individual, one to one conversation with Copilot.
Messages, prompts, and artifacts from other participants, including
images or other media they uploaded, will not be accessible in the
migrated chat.” The same capture answers “Do I need to do
anything for Group Chat?” with “No action is required to
retain your own messages, prompts, and artifacts. They will remain
available in an individual chat with Copilot.”

The live page today answers the first question: “Yes. Group chat
threads, messages, and content, including images generated in group
chats, will not carry forward after your account updates. If you would
like to keep any content, save it before your update.” And the
second: “No action is required unless you want to retain content
from a group chat. If so, save it before your Copilot experience
updates.” The sentences promising that your own messages,
prompts and artifacts remain available, and that each group chat
becomes a one-to-one conversation, are gone from the page. So is the
equivalent passage on the main updates page, which said on 17 August
that “Group Chats will be migrated as individual chats. Your
Group Chat history, including your messages and artifacts, will remain
available after your account updates, but each Group Chat will appear
as a one to one conversation with Copilot.”

When it changed is on the page itself. The FAQ carries
a machine-readable updated_at value in its HTML, invisible
to a reader, reading 2026-08-18 03:09 AM — the
day Microsoft says account updates begin. The archive brackets it: the
promise was still present in the capture at 14:41:22 UTC on 15 August
and absent from the capture at 04:03:12 UTC on 18 August. The main
updates page carries updated_at of
2026-08-19 10:39 PM , the day after the date it
describes, and its 17 August capture still carries the old wording.
Neither page prints either value where a reader would see it, and
neither shows a revision date or a change note. Both still advertise
ms.date of 08/10/2026.

Neither states a timezone for those values either — but the
captures rule out the readings that would change the story. The copy
archived at 04:03:12 UTC on 18 August already contains
updated_at of 03:09 AM, so the field cannot be US time:
03:09 PDT is 10:09 UTC and 03:09 EDT is 07:09 UTC, both of them
after the capture that already contains the value. Read as
UTC it falls 54 minutes before that capture. What the arithmetic fixes
whatever the zone is the upper bound: the edit precedes 04:03:12 UTC
on 18 August, the moment the archive first recorded the new wording.

Two more of the page’s own fields fix the other end. In both the
14 and 15 August captures updated_at read
2026-08-13 11:21 PM and word_count read
1136; from the 18 August capture onwards they read 03:09 AM and 1035,
as they still do. So the old answer was demonstrably still live at
14:41:22 UTC on 15 August, and the rewrite is bracketed rather than
merely dated: after that moment, and before 04:03:12 UTC on 18 August.
The Internet Archive’s index lists no capture of the page in
between, which is why 04:03:12 is the first recording of the new
wording and not necessarily the first moment it was live.

Microsoft gives no reason for the change, and this post does not
supply one. A page can be rewritten because the plan changed, or
because the first description was wrong and the second is a
correction. Nothing on either page says which, and the two readings
have very different implications for anyone who read the original,
concluded that no action was required, and did nothing.

## Five days on, none of it is in the past tense

The reason this is checkable at all is that Microsoft’s pages
have not moved on. Five days after 18 August 2026, every one of the
five affected features is still described as retiring rather than
retired. Each of these is quoted from a page fetched for this post:

Podcasts — “Podcasts is being retired
from Copilot and will no longer be available after August 18,
2026.” Its own feature page adds: “Podcasts will be
retired on August 18, 2026. After that date, the feature will no
longer be available in Copilot.”

Deep Research — “Deep Research is being
retired in the Copilot app for consumers starting August 18,
2026.” Its feature page still asks “What should I do
before August 18, 2026?” and answers “No action is
required.”

Group Chat — “Account updates begin on
August 18, 2026, and will roll out gradually. The timing of updates
may vary by account.”

Copilot Labs — no date at all. Asked
“When will Copilot Labs be retired?”, the FAQ says
“This change will occur as part of your Copilot update. Timing
may vary by account.”

Mico — also no date: “This change starts
in August and will roll out in waves. Because accounts update in
batches, there isn’t a single date, and you may see the change
at a different time than someone else.”

That last quote is worth holding next to the coverage. TechCrunch,
reporting the documentation on 13 August, wrote that “consumers
will lose access to Group Chats, AI-generated podcasts in Copilot,
Copilot Labs experimental features, and Deep Research, by August 18,
2026.” Microsoft’s own pages do not commit to that. For two
of the five features they give no completion date whatsoever, and for
Group Chat 18 August is the date the rollout begins . The
trigger Microsoft actually names, over and over, is not a date but an
event: “after your account updates.”

The two feature-specific pages make the point more sharply, because
they have not been touched since before the deadline: the Podcasts page
carries an updated_at of 2026-08-07 and the Deep Research
page 2026-07-15. Whatever has or has not happened inside the product,
the pages a user would consult to find out were last edited before the
date they describe.

## What is actually merging

The consolidation itself is straightforward, and Microsoft states its
own rationale plainly: “We’re updating Copilot to create a
simpler, more cohesive experience for everyone.” That is
Microsoft’s framing of its own decision, not a finding. On what
the merged app does, the page says: “You will be able to sign in
to the updated Copilot app with a personal account, a work or school
account, or both. Work and personal accounts remain separate.”
The separation is spelled out further down — “Personal
(Microsoft account) and work (Microsoft Entra) accounts are distinct by
design. Data entered into the work (Microsoft Entra) experience does
not flow into the personal (Microsoft account) experience, and vice
versa” — and Microsoft says commercial data boundaries,
tenant controls and compliance protections are not changing.

On data, the page commits to migrating “Your chats”,
“Images” and “Other content you’ve created with
Copilot”, with the caveat that “Content that has been
created with features that are being retired (for example, group chats,
podcasts and deep research content) may be handled differently.”
Files are treated separately: “Files shared and generated with
the standalone Copilot app will be moved to OneDrive.” Microsoft
also warns that “Some features may be temporarily unavailable, or
you may experience functionality gaps while the latest version of
Copilot is being rolled out.”

The retired features are not treated alike, and the difference matters
more than the shared date. Deep Research content is preserved —
“Your existing saved research content will not be deleted as part
of this change” — with Microsoft 365 Premium subscribers
reaching it through Researcher and Personal and Family subscribers
through chat history. Podcasts content is not: “Can I still
access podcasts I created before the feature was retired? No.”
Microsoft points users to a download option in the podcast menu.
Copilot Labs output — “such as 3D assets or audio
clips” — “will not carry forward after your
update.”

## What replaces what

For Deep Research, Microsoft names Researcher, and its own page is more
specific than the reporting was: “Microsoft 365 Premium
subscribers can continue creating detailed reports and analyses using
Researcher in Copilot.” TechCrunch rendered that as “For
paying professional users, Researcher will offer a replacement for the
latter, at least” — the same substance, but Premium is the
tier Microsoft actually names. For Copilot Labs, the FAQ says
early-access experiences “are expected to be available through
programs such as Frontier in Copilot and experimentation environments
like MAI Playground”, hedged with “Availability and
features may differ from previous Copilot Labs experiences.”

Mico is the one the coverage got backwards. TechCrunch wrote that
Copilot “will also ditch its goofy animated character”.
Microsoft’s FAQ says the opposite of a shutdown: “Mico, the
animated character in Copilot Voice, is moving to Learn Live. Voice in
Copilot isn’t going away.” Mico “continues in Learn
Live, where the character works as a tutor with real-time animation and
voice”; what goes is its appearance in Copilot Voice. The thing
users lose is smaller and oddly specific: “Mico-specific
settings, like saved colors and looks, won’t carry over. If you
have a look you’re fond of, take a screenshot before your account
updates.”

One more change, in the documentation rather than the product: the app
being merged into is named differently now. The 17 August capture of
the updates page uses “the Microsoft 365 Copilot app” eight
times in its body; the live page uses that name nowhere, saying
“Microsoft Copilot app” in each of those places, including
“You will see the Microsoft Copilot icon and name update”.
The page title is not part of this, and an earlier draft of this post
had it wrong: the 17 August capture was already titled “Updates
to Copilot and the Microsoft Copilot app”, exactly as the live
page is. The title carried the new name while the body still carried
the old one.

## This is not GitHub Copilot

Everything above concerns Microsoft’s Copilot assistant apps for
consumers and for work. It is not about
GitHub Copilot , the
coding tool this site’s
Directory lists, which is a different product
and is not part of this consolidation. The word “GitHub”
does not appear anywhere in the four Microsoft support pages or the
TechCrunch article cited here — a count taken over the fetched
text of each. Nothing announced here retires or merges the coding
assistant.

## What this post does not claim

It does not claim to know what has happened inside any account. There
is no way to verify from outside whether a given user’s Group
Chats have migrated, whether their podcasts are gone, or how many
accounts have been updated; Microsoft publishes no progress figure and
this post produces none. What it compares is dated versions of
Microsoft’s own pages against each other, and Microsoft’s
pages against the reporting. The rewrite of the Group Chat answer is a
documented fact about a document. Whether anyone lost anything because
of it is not something this site can see, and it is not asserted here.

## Sources

All five live pages were fetched for this post on 23 August 2026 at
18:19 MDT (00:19:36 UTC on 24 August 2026), each returning HTTP 200 to
a plain request with no browser masquerading. Microsoft Support,

“Updates to Copilot and the Microsoft Copilot app”

(page metadata: ms.date 08/10/2026,
updated_at 2026-08-19 10:39 PM) — the merge, the
dual sign-in and account-separation wording, the migrated-data list,
the OneDrive move, the temporary-gaps warning, the
“simpler, more cohesive experience” rationale, and the
Podcasts and Deep Research retirement notices. Its Group Chat entry is
the source for “will not be carried forward after August 18,
2026” only; the “Account updates begin on August 18,
2026” sentence quoted above appears on the FAQ and not on this
page. Microsoft Support,

“Frequently asked questions about retiring Copilot
features”

( ms.date 08/10/2026, updated_at 2026-08-18
03:09 AM, word_count 1035) — the current Group Chat
answers including the “Account updates begin on August 18,
2026” timing answer, the Mico and Copilot Labs sections, and the
no-single-date and timing-may-vary wording.
Microsoft Support,

“Podcasts in Microsoft Copilot”

( updated_at 2026-08-07 10:41 PM) and

“Deep Research in Microsoft Copilot”

( updated_at 2026-07-15 10:45 PM) — the
feature-specific retirement wording, the podcast-download and
content-retention answers, and the Researcher/Premium replacement.
TechCrunch, Sarah Perez,

“Microsoft kills off unsuccessful AI features while merging its
separate Copilot apps”

(8:30 AM PDT, 13 August 2026; no correction or update note appended as
fetched) — the “by August 18, 2026” framing, the
Researcher line, the “ditch its goofy animated character”
line, and the GeekWire and
The Information attributions, including the
“right to exist” memo reported by The Information
and attributed to Microsoft EVP Jacob Andreou, which this post takes as
TechCrunch’s reporting of another outlet’s reporting and
not as a Microsoft statement.

The before-and-after comparison rests on Internet Archive captures of
Microsoft’s own pages, all retrieved for this post at the same
time as the live pages: the retirement FAQ at

11:34:10 UTC on 14 August 2026

(the wording quoted as the earlier version) and at

14:41:22 UTC on 15 August

(promise still present) and

04:03:12 UTC on 18 August

(promise absent, current wording in place); and the updates page at

22:10:28 UTC on 17 August 2026

, the source for the older Group Chat migration passage and for the
eight body uses of the older app name. The capture list came from the
Internet Archive’s CDX index for both URLs, queried in the same
run; the 18 August capture time is also fixed by the archive’s
own in-document stamp, “FILE ARCHIVED ON 04:03:12 Aug 18,
2026”. The updated_at and word_count
values quoted above are read from the captures and the live pages
themselves.
