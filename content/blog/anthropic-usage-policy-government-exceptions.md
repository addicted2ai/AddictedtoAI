---
title: "Anthropic publishes one government exception to its usage policy. Weapons and domestic surveillance are not in it."
date: "2026-08-31"
anchor:
  url: "https://www.notus.org/courts/judge-says-pentagon-illegally-blacklisted-anthropic"
  date: "2026-08-28"
mentions:
  - org/anthropic
---

On 28 August 2026 U.S. District Judge Rita F. Lin vacated Defense Secretary Pete
Hegseth's designation of Anthropic as a national-security supply chain risk and
barred the administration from enforcing the measures the company had challenged.
NOTUS, reporting that morning, quotes the opinion: "The empty invocation of
national security is not a blank check to punish and retaliate against government
critics." Lin found that Anthropic's public criticism was a substantial factor in
the government's actions, and that officials sought to "make a public example out
of Anthropic" after the dispute became public. Reason and Fortune both put the
ruling at 59 pages.

That much ran everywhere. The part that did not is the policy itself, which is
two pages on Anthropic's own websites, both dated, both quotable, and neither of
them saying what the argument about them implies.

## Anthropic already bends the policy for governments, and says so in the policy

The Usage Policy at `anthropic.com/legal/aup` carries an effective date of
15 September 2025 and was retrieved on 31 August 2026. At the end of its
Universal Usage Standards, in italics, ahead of the high-risk section, it says:

> Anthropic may enter into contracts with certain governmental customers that
> tailor use restrictions to that customer's public mission and legal authorities
> if, in Anthropic's judgment, the contractual use restrictions and applicable
> safeguards are adequate to mitigate the potential harms addressed by this Usage
> Policy.

So the question of whether Anthropic will move its usage restrictions for a
government has a published answer, and the answer is yes.

## One named use, five factors, and ASL-2 only

What the tailoring buys is on a separate Anthropic Help Center page, "Exceptions
to our Usage Policy", which states that it was last updated on 16 March 2026 and
was retrieved on 31 August 2026. It gives one example, and then draws a line:

> For example, with carefully selected government entities, we may allow foreign
> intelligence analysis in accordance with applicable law. All other use
> restrictions in our Usage Policy, including those prohibiting use for
> disinformation campaigns, the design or use of weapons, censorship, domestic
> surveillance, and malicious cyber operations, remain.

Read the second sentence again. Anthropic named weapons and domestic
surveillance as things a government contract does not unlock, on a public page,
five months before a judge ruled on a fight about weapons and domestic
surveillance.

The same page sets out the eligibility test as five factors:

> Our assessment of the models' suitability for the proposed use cases.
>
> The legal authorities of the agency in question.
>
> The extent of the agency's willingness to engage in ongoing dialogue with
> Anthropic.
>
> The safeguards in place to prevent misuse and mitigate risks of mistakes.
>
> The degree of independent and democratic oversight of the organizations and
> their uses of AI technologies, including legislative or regulatory constraints
> and other relevant public commitments.

And then a one-sentence scope limit:

> At this time, this policy only applies to models that are at AI Safety Level 2
> (ASL-2) under our Responsible Scaling Policy (RSP).

The exceptions regime, in other words, is scoped to Anthropic's lowest deployed
safety tier. What a government gets above ASL-2 is not stated on the page. It
does not say "no"; it says nothing, which for anyone drafting a procurement
schedule against a frontier model is the more awkward of the two.

## The phrases in the coverage are not the phrases in the policy

NOTUS writes that Anthropic "resisted demands to remove restrictions on using its
Claude models for mass domestic surveillance of Americans and fully autonomous
weapons." That is NOTUS's sentence describing the company's litigation position.
Neither "fully autonomous weapons" nor "mass domestic surveillance" appears
anywhere in the Usage Policy.

What appears, under "Do Not Develop or Design Weapons", includes:

> Design or develop weaponization and delivery processes for the deployment of
> weapons

And under "Do Not Use for Criminal Justice, Censorship, Surveillance, or
Prohibited Law Enforcement Purposes":

> Target or track a person's physical location, emotional state, or communication
> without their consent, including using our products for facial recognition,
> battlefield management applications or predictive policing

> Utilize models as part of any law enforcement application that violates or
> impairs the liberty, civil liberties, or human rights of natural persons

The middle bullet is the one worth slowing down on. "Battlefield management
applications" is not filed under weapons. It sits inside a consent-based tracking
prohibition, in the section about law enforcement and surveillance, alongside
facial recognition and predictive policing. A Pentagon lawyer reading for the
weapons heading would find the clause that touches battlefield software three
headings away, attached to a consent requirement that a battlefield does not
supply.

As for what was actually demanded: Reason reports from the case that Anthropic
"refused to acquiesce to Hegseth's demand that Anthropic's model be 'free from
usage policy constraints that may limit lawful military applications.'" That
demand is written at the level of the whole document. The policy is written at
the level of the bullet. No source retrieved on 31 August 2026 maps one onto the
other clause by clause, and the opinion itself was not retrieved, so which
specific bullets the Pentagon wanted gone is not something these documents
settle.

## If you negotiate AI terms, the carve-out clause is no longer hypothetical

Anthropic is a party to this case with an obvious interest, and both documents
quoted above are its own. The ruling is a district court decision that NOTUS
reports the government is expected to challenge; NOTUS also notes a separate
Anthropic case pending in the D.C. Circuit over a different supply chain risk
designation. None of that is settled law and none of it is a verdict on whether
Anthropic is right about autonomous weapons.

What is settled is what the paperwork says, and that has readers with something
to do about it.

If you buy AI under an enterprise agreement, the vendor's public acceptable-use
policy is not the whole instrument. Anthropic's carries an explicit clause
letting contract terms diverge from it, and the divergence is governed by a
second document that lives on a support site rather than in the legal section.
Ask which document your agreement incorporates, and ask what happens to your
carve-out when the model you are buying moves past ASL-2.

If you sell AI into government, the five factors are the closest thing to a
published rubric any frontier lab offers, and one of them is "the degree of
independent and democratic oversight" of the buying agency. That is a criterion a
vendor applies to a customer, which is an unusual direction for a procurement
requirement to run, and it is now attached to a case where refusing the customer
was found to be protected speech.

## The documents

All five were retrieved on 31 August 2026.

- Anthropic, *Usage Policy*, effective 15 September 2025 —
  [anthropic.com/legal/aup](https://www.anthropic.com/legal/aup)
- Anthropic Help Center, *Exceptions to our Usage Policy*, page states last
  updated 16 March 2026 —
  [support.claude.com](https://support.claude.com/en/articles/9528712-exceptions-to-our-usage-policy)
- NOTUS, *Judge Says Pentagon Illegally Blacklisted Anthropic*, published
  28 August 2026 10:19 a.m. —
  [notus.org](https://www.notus.org/courts/judge-says-pentagon-illegally-blacklisted-anthropic)
- Reason, *Judge says Trump's clampdown on Anthropic violates the First
  Amendment*, published 28 August 2026 —
  [reason.com](https://reason.com/2026/08/28/judge-says-trumps-clampdown-on-anthropic-violates-the-first-amendment/)
- Fortune, *Judge: Pentagon punished Anthropic for 'arrogance,' and that's
  illegal*, published 28 August 2026 —
  [fortune.com](https://fortune.com/2026/08/28/anthropic-pentagon-ruling-rita-lin-arrogance/)

NBC News's account of the ruling returned HTTP 403 to direct retrieval on
31 August 2026, as did Axios's. Nothing above rests on either. The 59-page figure
and the "public example" quotation each appear in two of the three fetched
accounts.
