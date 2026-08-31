---
job: seed-learn-how-ai-systems-get-attacked
verdict: approve
reasons: []
would-cite: >-
  Someone told that a vendor's classifier has solved prompt injection at a
  capture rate in the mid-nineties — this page supplies the reason no filter can
  be the fix, that the capability and the vulnerability are one mechanism seen
  from two sides, alongside the security answer that ninety-five per cent is a
  failing grade and the 2025 evaluations that bypassed every published defence
  they adapted an attack to.
reviewer: independent record reviewer, seven-page set (fresh context, no edit rights)
date: 2026-08-30
---

Checklist: education page (mechanics, Area E), against `openspec/curriculum/learn.md`
§2, §3 and the §4 entry, plus the `teach-the-whole-subject` delta for
`specs/education-static`. Seventeen quoted sources; I fetched twelve of them to
disk and probed by literal substring 2026-08-30.

**Sendable sentence, verbatim** — the page's bolded line:

> The reason a language model can follow instructions about a document is the
> same reason it follows instructions inside one.

That sentence is the page. It converts an open security problem from a bug
awaiting a patch into a design property, and it does so in one clause a reader
can repeat to someone who has never seen an injection.

## The operational-content question — my explicit judgment

**The page supplies nothing operational, and it is clean by construction rather
than by luck.** I read every paragraph specifically for this and enumerate what
I found, because a bare assurance is worth nothing here:

- **No attack string exists anywhere on the page.** The Goodside demonstration
  is described by its *shape* — "text appended to the input of a translation
  service, telling the model to ignore its instructions and say something else
  instead" — and the famous payload itself is not reproduced. There is no
  prompt, no template, no delimiter trick, no encoding, and nothing a reader
  could copy.
- **The indirect-injection section names locations, not techniques**: a web page
  to be summarised, a document in a shared folder, an email, an issue on a
  public tracker. That is the threat model §4 asked for, and it is what a
  defender needs in order to enumerate their own inputs. It contains no guidance
  on constructing or placing anything.
- **The nearest approach to the line is the hidden-text observation**, quoting
  OWASP that such inputs "do not need to be human-visible/readable, as long as
  the content is parsed by the model". The page stops there. It names no
  concealment method — no white-on-white, no zero-width characters, no comments,
  no metadata field. The defensive payload (human review of a source is not a
  filter, because the human and the model are not reading the same thing) is
  delivered without the offensive one.
- **The poisoning section is the strongest evidence of deliberate restraint,
  and I can point at it.** The page stays at the level of the papers' own
  abstracts. I have arXiv 2302.10149's abstract on disk, and it contains
  operational specifics the page had in hand and did not use: the cost figure
  for poisoning a stated fraction of two named datasets. None of that appears
  on the page. A writer indifferent to the line would have quoted it — it is
  the most quotable sentence in the abstract.
- **The defences section reports bypass *rates*, never bypass *methods*.**
  "Attacks adapted to each one" is as specific as it gets.
- **The lethal trifecta is a defender's checklist**, three properties of a
  deployment, published as one.

So: it explains why every class of attack works, and a reader finishes it able
to audit a system and unable to attack one. That is the editorial line this page
was set, and it holds.

## What I verified at source

- **Willison, 12 September 2022** — "The obvious parallel here is SQL injection"
  present; Goodside credited in the post as the page says; the 13 April 2023
  update present, reading that the parameterised-prompts idea "is extremely
  difficult, if not impossible, to implement on the current architecture of
  large language models". The page's framing — the person who named the attack
  proposed the fix and then recorded on the same page that it probably cannot be
  built — is exactly what the bytes show.
- **arXiv 2302.12173** — all four spans verbatim: "LLM-Integrated Applications
  blur the line between data and instructions"; "strategically injecting prompts
  into data likely to be retrieved"; "data theft, worming, information ecosystem
  contamination"; "effective mitigations of these emerging threats are currently
  lacking".
- **Willison, 16 June 2025** — all three trifecta legs verbatim; "Everything
  eventually gets glued together into a sequence of tokens and fed to the
  model"; "but in web application security 95% is very much a failing grade";
  the vendor-fix line "were promptly fixed by the vendors, usually by locking
  down the exfiltration vector"; and the page's careful note that he is not
  confident the term exfiltration is widely understood is supported by "I'm not
  confident that term is widely understood" in the post.
- **OWASP LLM01** — all four spans verbatim, including both halves of the
  vocabulary dispute the page reports honestly: OWASP's "a form of prompt
  injection where the attacker provides inputs that cause the model to disregard
  its safety protocols entirely", and its own concession that these
  vulnerabilities "are possible due to the nature of generative AI" and "it is
  unclear if there are fool-proof methods of prevention".
- **Willison, 5 March 2024** — all three jailbreak-distinction quotes verbatim,
  including "the attack is not against the models themselves".
- **arXiv 2302.10149** — "often trained on distributed, web-scale datasets
  crawled from the internet" and the split-view definition verbatim; the
  abstract's own count is "10 popular datasets", supporting the page's "ten".
- **arXiv 2510.07192** — "require a near-constant number of documents regardless
  of dataset size", "250 poisoned documents", and "20 times more clean data" all
  present.
- **arXiv 2404.13208** — the observation about system prompts, "selectively
  ignore lower-privileged instructions", and "drastically increases robustness",
  all verbatim.
- **arXiv 2503.00061** — "we evaluate eight different defenses and bypass all of
  them using adaptive attacks, consistently achieving an attack success rate of
  over 50%". The page's "eight published defences … bypassed all eight" is
  exact, and February 2025 is right.
- **arXiv 2510.09023** — "12 recent defenses", "above 90% for most", and the
  finding the page rightly says should govern how a reader reads any published
  defence number: "the majority of defenses originally reported near-zero attack
  success rates".
- **arXiv 2506.08837** — the design rule "once an LLM agent has ingested
  untrusted input, it must be constrained so that it is impossible for that
  input to trigger any consequential actions" is present verbatim **in the paper
  body**, not the abstract. My first probe returned ABSENT purely because I had
  fetched the abstract; against the full text it is exact.
- **arXiv 2503.18813 (CaMeL)** — "the untrusted data retrieved by the LLM can
  never impact the program flow" verbatim, and the cost the page prints
  alongside the guarantee is the abstract's own: "solving $77\%$ of tasks with
  provable security (compared to $84\%$ with an undefended system)". My probe
  for "77%" returned ABSENT because the abstract encodes it as LaTeX; reading
  the surrounding bytes resolved it. The page quoting the *cost* next to the
  guarantee is the honest choice and it is the paper's own framing.

## A finding the earlier review missed — a term of art, aggravated by a collision

The mechanics review's jargon finding named only `how-models-are-trained` and
`what-a-benchmark-measures`. There is a smaller one here.

In the paragraph beginning "Now look for the corresponding structure in a
language model", the page writes: *"Attention is the only thing that moves
information between positions and it compares **queries** against **keys**
without any notion of where a span came from."* Neither noun is defined and
neither is wiki-linked. I checked the closure by counting rather than
recollecting: across all eight pages in this page's transitive closure, `key` in
this sense occurs **zero** times, and the declared prerequisite
`how-a-language-model-works` deliberately teaches the identical operation in
plain words — "what it is looking for and what it has to offer" — never using
either term. So the mechanics admission test ("defining each term of art at
first use") and §3's audit exit (c) are both missed.

What makes it worth writing down rather than shrugging at is the collision. The
*immediately preceding* paragraph spends four sentences carefully teaching that
a query is a database query, in the SQL sense, at length and by design. A reader
who has just been handed that noun meets "compares queries against keys" in the
next breath, with nothing signalling that the word has changed meaning.

I did not treat this as a rejection, and the reasoning matters. The sentence's
load is carried entirely by the clause after it — "without any notion of where a
span came from, because provenance was never encoded in the first place" — so it
stands for a reader who skips the two nouns, and nothing downstream depends on
them. This repository has already adjudicated exactly this shape: the curriculum
records that `how-inference-is-served`'s undeclared "accelerator" is "a missing
noun rather than a missing assumption", to be fixed with a gloss and explicitly
not with a rejection. Six words would close this one too, and the fix belongs to
whoever edits the page, not to me.

## Coverage, bounds, rot, references

Every §4 must-cover is present: the one-channel problem read as a security
property ("The set of people who can give this system instructions is the set of
authors of everything it reads"); direct versus indirect; the
parameterised-query contrast, which teaches real SQL mechanics to a lay reader
in one paragraph and then spends them; exfiltration through tool use with the
harness supplying the blast radius; jailbreaks and injections kept distinct with
the contested vocabulary reported rather than adjudicated; poisoning; and
defences ordered by distance from the weights.

The page adds a fourth defence family the entry did not list — the instruction
hierarchy, which lives *inside* the weights — and characterises it correctly as
"a strong default rather than a boundary". That is an addition that improves the
section rather than drifting from it, and it is not the refusal-training
internals the must-not reserves for `what-safety-training-changes`, to which the
page correctly defers in one sentence.

Must-nots held: no vendor security claims — the page goes out of its way to note
OWASP "is a standards body rather than a vendor and has nothing to sell here",
and names no product as vulnerable.

Rot: no model names, no prices, no version numbers, no benchmark scores. Every
figure is a quotation from a dated paper, and the page states the reason a score
decays — "A score is a measurement against the attacks that existed when it was
taken" — which is the most rot-aware sentence I have read on this surface.

Front matter matches §4: level, both prerequisites, outcome verbatim. The single
mention and all four internal links resolve on disk. `what-safety-training-changes`
and `what-models-are-trained-on` sit outside the closure and are both deferrals
whose sentences stand alone; the crawl premise the second one links is supplied
on the page by the attack paper's own words.

## Taken on trust

The sequence of defences tried in Goodside's original thread — a warning
instruction first, then a JSON-quoting format — I did not probe independently;
the linked 2022 post covers the thread and the stakes are low. The
`concept/model-context-protocol` entry was confirmed to exist but not read.

Approve. This is the hardest editorial line on the surface and the page walks it
without visible strain, mostly by reaching for the mechanism at each point where
a source offered a recipe. The closing move is the payload: a model's resistance
is a moving measurement someone will invalidate next quarter, and a blast radius
is a decision that stays decided — which tells a reader where to spend attention
on a system this page has never seen.
