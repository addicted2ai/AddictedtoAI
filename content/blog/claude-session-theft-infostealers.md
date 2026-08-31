---
title: "Anthropic emailed Claude users about stolen sessions. What was taken was not a password."
date: "2026-08-31"
anchor:
  url: "https://www.bleepingcomputer.com/news/artificial-intelligence/anthropic-warns-infostealer-malware-is-hijacking-claude-sessions-to-drain-usage/"
  date: "2026-08-30"
mentions:
  - org/anthropic
---

On 30 August 2026
[BleepingComputer](https://www.bleepingcomputer.com/news/artificial-intelligence/anthropic-warns-infostealer-malware-is-hijacking-claude-sessions-to-drain-usage/)
published the text of an email Anthropic has been sending to Claude users whose
accounts somebody else was using. The notice, as quoted there:

> We have recently become aware of a bad actor that is using common infostealer
> malware to steal Claude login sessions from people's computers, then using
> those login sessions to access Claude accounts and consume their usage.

Login sessions. Not passwords, and the difference decides what a recipient should
actually do.

A session cookie is the receipt for an authentication that already succeeded.
Replaying it presents no password and raises no second-factor prompt, because as
far as the server is concerned the login happened days ago and this is the same
browser coming back.
[CyberPress](https://cyberpress.org/infostealer-malware-steals-claude-session-cookies/),
on 31 August 2026, states the consequence: stealing "already-authenticated
session cookies rather than passwords" means "the theft bypasses two-factor
authentication and single sign-on entirely, letting attackers replay a victim's
session." Switching on 2FA afterwards guards a door the intruder is not using.

Anthropic's remedy is the right one and it is not a password reset. From the
email as reproduced by
[Search Engine Journal](https://www.searchenginejournal.com/anthropic-warns-hackers-are-stealing-claude-sessions-to-hijack-accounts/587566/),
retrieved 31 August 2026: "We recently signed you out of Claude and removed the
payment method saved on your account, so you'll need to log back in and re-add
your card." On why the sign-out is the operative act rather than a precaution:
"Signing you out cancels that session everywhere, so the stolen copy stops
working." Anthropic also refunded charges it identified as unauthorized.

Then the sentence worth forwarding, which BleepingComputer carries:

> Signing you out of Claude stops the stolen sessions, but it doesn't remove the
> malware. If it's still on your computer, your next login session could be
> stolen the same way.

Those two instructions have an order, and it is not the order they arrive in. The
revocation already happened, so the account is not where the remaining exposure
sits. Logging back in on a machine you have not cleaned issues a fresh cookie
into the same collection, and re-adding the card gives the next session something
to spend. Clean the machine first.

If you are wondering whether this was you, the notice offers a symptom: "If your
usage limits looked like they refilled and then drained while you weren't using
Claude, this was likely the cause."

The malware is unremarkable, which is the interesting part. Anthropic named
Vidar, LummaC2, StealC, RedLine and Acreed on Windows, plus Atomic Stealer (AMOS)
on a small number of Macs. Not one of them was built for this. They are commodity
credential thieves that arrive, in BleepingComputer's description, through
ordinary downloads and malicious apps, and sweep up "browser passwords, login
cookies, and credentials belonging to other apps." A Claude cookie is a line item
in that haul, not the objective. What is new sits on the other side: a
subscription that converts into inference is now worth stealing on the same terms
as a bank login.

Two limits on all of the above. Anthropic has published nothing of its own.
`status.claude.com` listed no incident of this kind for August 2026 when checked
on 31 August 2026, and none of the outlets carrying the story links an Anthropic
page, so the chain runs entirely through one user's email, screenshotted on
Reddit and reproduced by reporters. And there are no figures: not how many
accounts, not how much usage, not who the bad actor is. The notice does not say,
and nobody outside Anthropic is positioned to.

All four accounts below were retrieved on 31 August 2026, and the malware list
and the three response actions appear in every one.
[BleepingComputer](https://www.bleepingcomputer.com/news/artificial-intelligence/anthropic-warns-infostealer-malware-is-hijacking-claude-sessions-to-drain-usage/)
published on 30 August 2026.
[Cybersecurity News](https://cybersecuritynews.com/hackers-steal-claude-login-sessions/)
and
[CyberPress](https://cyberpress.org/infostealer-malware-steals-claude-session-cookies/)
both published on 31 August 2026.
[Search Engine Journal](https://www.searchenginejournal.com/anthropic-warns-hackers-are-stealing-claude-sessions-to-hijack-accounts/587566/)
carries more of the email text than the others and shows a relative timestamp
rather than a date.
