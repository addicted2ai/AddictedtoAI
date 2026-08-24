// What each AI vendor commits to before switching off a model — the shape of
// the promise, not the dates. The comparison that existing retirement trackers
// do not answer: a reader choosing what to build on wants to know what happens
// to them, and how much notice they are promised, not when one specific model
// dies.
//
// Every row carries a `verified` date and every row is read off the vendor's
// own page by the round that published it (CHARTER.md rule 1). A row whose
// source could not be fetched this run is marked `unverified` and says so —
// fetch failure is not absence, and this page never claims "no page" for a
// vendor it could not reach.
//
// The shapes are the axis, redrawn after review so the taxonomy applies itself:
//   floor-dates   — a minimum notice period AND published shutdown dates the
//                   vendor presents as dates (you can plan against a calendar)
//   earliest      — dates are published, but the vendor's own page frames them
//                   as the earliest possible and reserves the right to move
//                   them; a notice floor may still be present, the date is not
//                   a promise
//   ad-hoc        — dates appear per event, no standing policy
//   nothing       — no lifecycle page, or a page that commits to nothing
//   unverified    — the vendor's page was unreachable when the row was written
//
// The original taxonomy had no vendor in `earliest` while two vendors whose
// pages frame their dates as movable (Anthropic's "Not sooner than", Foundry's
// "subject to change") sat in `floor-dates` — an empty bucket whose defining
// members sat elsewhere. Round 88 redraws the definitions and moves those two,
// plus Google (verified this run from the page: "earliest possible dates"), so
// a vendor can publish a notice floor AND dates it reserves the right to move.
//
// Staleness is enforced by the same report that guards the Directory:
// scripts/staleness-report.mjs reads policy.yml's
// staleness_days.directory_entry window over the `verified` dates in this
// file too. A row whose page was unreachable carries `verified: null` plus a
// dated `unverifiedSince` record; the report fails once that record is past
// the window, so an unverified row is never treated as fresh (round 124 wired
// this; its changelog entry argues the shared window).
//
// `minNoticeDays` (round 182, docket/done/2026-08-22-vendor-notice-period-vs-practice.md):
// a small structured number, or `null`, behind
// /promise-vs-practice's comparison of a live RETIREMENT_DATES shutdown's
// remaining runway against the vendor's OWN promised minimum notice floor \u2014
// added so that comparison does not parse `sentence`/`sentenceMore` prose at
// render time. THE CENTRAL RISK this field exists to avoid: the comparison
// publishes a claim of the shape "this shutdown is inside [vendor]'s own
// promised notice window" \u2014 a public, dated, disputable statement that a
// named company is not honouring its own promise. Getting this wrong is a
// false accusation, not a cosmetic bug, so this field is null wherever the
// quoted text does not support a single, safely comparable number \u2014
// scripts/check-notice-floor-comparator.mjs asserts every value here is
// either `null` or a positive number, never silently coerced from a missing
// field. Anthropic is the one vendor whose floor is stated once, in plain
// prose, with no tier or scope qualifier \u2014 the baseline case a number here
// is safe to encode. Every other non-null or null choice below is commented
// at its own entry with the specific reason.
export const RETIREMENT_COMMITMENTS = [
  {
    vendor: "OpenAI",
    href: "https://developers.openai.com/api/docs/deprecations",
    shape: "floor-dates",
    // CORRECTION, round 187 (maintain), 2026-08-24. This quote carried only
    // the first TWO of the three bullets OpenAI's page lists under "minimum
    // notice periods", and stopped at the longer pair. The omitted third
    // bullet is the shortest floor OpenAI states and the only one that is
    // not measured in months. A reader of this page took the quote as the
    // whole commitment -- the page's own words above are "quotes the
    // sentence that establishes the commitment" -- and would have concluded
    // OpenAI promises at least 3 months for everything, which its page does
    // not say. Restored here in full.
    //
    // This was not a change at OpenAI: the bullet is present in the Internet
    // Archive's 2026-08-10 capture of the page
    // (web.archive.org/web/20260810135331/https://developers.openai.com/api/docs/deprecations),
    // four days BEFORE the 2026-08-14 verification this row carried, so the
    // omission was in the reading, not in the vendor's wording. Recorded as
    // a correction rather than a quiet re-quote (CHARTER.md rules 5 and 6).
    sentence:
      "Unless safety or compliance concerns require a faster timeline, we provide the following minimum notice periods before model retirement: Generally available models: At least 6 months. Specialized variants of generally available models: At least 3 months. Preview models: Preview models, identified by preview in the model name, may be retired with much shorter notice, such as 2 weeks.",
    sentenceMore:
      "All deprecated models and endpoints will also have a shut down date. The faster-timeline clause means even these dates can move earlier. The preview tier is not hypothetical here: ten of the OpenAI rows on the model retirement calendar carry “preview” in the identifier, which is exactly how OpenAI's bullet says a preview model is identified — nine of them already switched off, one still upcoming (counted 2026-08-24). For those, the floor OpenAI states is weeks, not months.",
    // null (round 182): two compounding reasons, not one. (1) Two floors \u2014
    // GA models: 180 days; specialized variants: 90 days \u2014 and
    // RETIREMENT_DATES carries no field saying which OpenAI row is which;
    // guessing from a `-preview`/dated-snapshot suffix would be a heuristic
    // this round is inventing, not one OpenAI's page defines. (2) The
    // sentence is scoped to "model retirement" specifically, and several
    // live RETIREMENT_DATES rows for this vendor are not models at all \u2014
    // "Assistants API", "Videos API", "v1/prompts API", "Evals platform",
    // "Agent Builder" \u2014 so even the shorter (90-day) number would risk
    // accusing OpenAI of missing a notice floor its own sentence never
    // promised for those rows. Both reasons independently argue null; a
    // future round with a reliable way to separate GA models, specialized
    // variants, and non-model API rows could revisit this.
    //
    // Round 187 (maintain, 2026-08-24) leaves the null and corrects one
    // premise above. There are THREE floors on that page, not two -- the
    // third is the preview tier now restored to `sentence`. And reason (1)
    // says a `-preview` suffix heuristic would be "a heuristic this round is
    // inventing, not one OpenAI's page defines". OpenAI's page does define
    // it, in the bullet that was missing from the quote: preview models are
    // "identified by preview in the model name". So that specific objection
    // does not hold; the others do, and they are enough on their own. The
    // GA-versus-specialized split still has no page-defined test, the
    // non-model API rows ("Assistants API", "Videos API") are still outside
    // a sentence scoped to "model retirement", and a third floor measured in
    // weeks widens the spread a single number would have to stand in for
    // from 2:1 to roughly 13:1. Null is now better supported than it was,
    // for partly different reasons -- recorded rather than re-argued,
    // because the conclusion that survives a corrected premise should say
    // which premise it lost.
    minNoticeDays: null,
    verified: "2026-08-24",
  },
  {
    vendor: "Anthropic",
    href: "https://platform.claude.com/docs/en/about-claude/model-deprecations",
    shape: "earliest",
    sentence:
      "Anthropic notifies customers with active deployments for models with upcoming retirements, providing at least 60 days' notice before model retirement for publicly released models.",
    sentenceMore:
      "Active models carry a floor rather than a date \u2014 \u201cNot sooner than September 29, 2026\u201d \u2014 so the date is the earliest a model may retire, not a commitment to that day. The 60-day notice is the firm floor; the date can move.",
    // 60 (round 182): the one floor stated once, in plain prose, with no
    // tier ("GA" / "specialized") and no scope qualifier narrower than "all
    // publicly released models" \u2014 the baseline case this file's header
    // comment points at.
    minNoticeDays: 60,
    verified: "2026-08-24",
  },
  {
    vendor: "Mistral",
    href: "https://docs.mistral.ai/inference/model-lifecycle/",
    shape: "floor-dates",
    sentence:
      "During the deprecation period, the model remains accessible. Once retired, requests to its identifiers fail with a 404 error.",
    sentenceMore:
      "The same page's deprecation policy opens with \u201cDeprecation is announced as soon as a replacement model is available\u201d and commits to 6 months' notice for General Availability models; the models page (docs.mistral.ai/models) lists concrete deprecation and retirement dates.",
    // null (round 182): the only number this page states (6 months / 180
    // days) is explicitly scoped to "General Availability models", and
    // RETIREMENT_DATES has no tag for GA-vs-other. Unlike OpenAI or
    // Alibaba below, there is no SECOND stated number for the non-GA case
    // to fall back on \u2014 applying the one known number to an untagged row
    // would risk holding a non-GA model to a promise Mistral's own page
    // never made about it.
    minNoticeDays: null,
    verified: "2026-08-24",
  },
  {
    vendor: "Amazon Bedrock",
    href: "https://docs.aws.amazon.com/bedrock/latest/userguide/model-lifecycle.html",
    shape: "floor-dates",
    sentence:
      "Once a model launches on Amazon Bedrock, it will remain on Amazon Bedrock for at least 12 months before the EOL date.",
    sentenceMore:
      "A model will be in the Legacy state for at least 6 months before the EOL date, and \u201con, or soon after the EOL date\u201d requests to the version will fail \u2014 the EOL date itself is fixed, the failure can slip a little later. The lifecycle table lists each model's EOL date.",
    // null (round 182): read carefully rather than guessed, per the round
    // brief. "At least 12 months ... on Amazon Bedrock" is a MINIMUM
    // LIFETIME since launch, not a notice-before-shutdown floor at all \u2014
    // using it as one would compare the wrong thing entirely. "Legacy state
    // for at least 6 months before the EOL date" describes a state's
    // duration, not a stated customer notification \u2014 the sentence never
    // says entering Legacy state itself notifies anyone, so treating it as
    // "6 months' notice" would be assuming a mechanism the quoted text does
    // not state. Neither number is confidently a notice floor, so both are
    // left uncompared rather than one being guessed.
    minNoticeDays: null,
    verified: "2026-08-24",
  },
  {
    vendor: "Microsoft Foundry",
    href: "https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirements",
    shape: "earliest",
    sentence:
      "GA models have their retirement date set programmatically at launch to 18 months out\u2014there's no separate \"announcement.\"",
    sentenceMore:
      "GA model retirement notice is \u201cat least 60 days before retirement\u201d; at 18 months from launch, all inference returns 410 Gone. But the page says the schedule details \u201care subject to change\u201d \u2014 the published date is not a hard commitment.",
    // null (round 182): the same shape of gap as Mistral \u2014 the only stated
    // notice number ("at least 60 days") is qualified to "GA models" twice
    // in the two sentences captured here, with no non-GA number given and
    // no RETIREMENT_DATES tag to tell GA rows from any other kind, and
    // RETIREMENT_DATES carries no Foundry rows to check this against today
    // regardless.
    minNoticeDays: null,
    verified: "2026-08-24",
  },
  {
    vendor: "Alibaba (Model Studio)",
    href: "https://www.alibabacloud.com/help/en/model-studio/model-depreciation",
    shape: "floor-dates",
    sentence:
      "For snapshot models, which are identified by a specific date in their name (for example, qwen-max-2025-01-25, common for Qwen series models), we issue a sunset notice 30 days before the official sunset date. For mainline models, which are the core versions of a model series, we issue a sunset notice 3 months before the official sunset date.",
    sentenceMore:
      "The page then lists concrete deprecation dates with replacement models.",
    // 30 (round 182): two floors are stated explicitly (snapshot: 30 days;
    // mainline: 90 days), and RETIREMENT_DATES carries no Alibaba rows
    // today to classify at all. Alibaba's own text says snapshot models
    // are "identified by a specific date in their name" \u2014 nominally
    // checkable against a future row's `what` string \u2014 but this round does
    // not implement that per-row classifier (there is no live Alibaba data
    // to prove it against, and the item's own hard requirement asks for a
    // small per-vendor field, not a per-row one). So: the SHORTER of the
    // two known numbers, applied uniformly, as the explicit conservative
    // simplification option 182's brief allows. This is a deliberate
    // departure from that brief's own parenthetical, which labelled the
    // LONGER number "more permissive" \u2014 worked through with concrete
    // numbers in this round's report: if a future mainline row (90-day
    // floor) has 40 days of runway left, a blanket 90-day threshold
    // correctly flags it, but a blanket 30-day threshold wrongly clears it
    // (a false negative \u2014 safe). If a future SNAPSHOT row (30-day floor)
    // has 40 days left, a blanket 90-day threshold wrongly flags it as
    // "inside the notice window" when the vendor's own snapshot promise is
    // fully satisfied (a false positive \u2014 the exact false-accusation risk
    // this file's header warns about); a blanket 30-day threshold correctly
    // clears it. The shorter number is the only one of the two that can
    // never produce a false "inside the window" claim against either
    // tier \u2014 under-flagging some real mainline violations is the safe
    // direction to err in, not over-flagging compliant snapshots.
    minNoticeDays: 30,
    verified: "2026-08-24",
  },
  {
    vendor: "Google (Gemini API)",
    href: "https://ai.google.dev/gemini-api/docs/deprecations",
    shape: "earliest",
    sentence:
      "The shutdown dates listed in the table indicate the earliest possible dates on which a model might be retired.",
    sentenceMore:
      "Recovered with a plain curl User-Agent: webfetch's browser-like UA is redirected into an OAuth login loop. The deprecation table lists dated shutdowns with recommended replacements.",
    // null (round 182): unlike Anthropic, which also uses "earliest
    // possible" framing but separately states a 60-day notice floor,
    // nothing captured on this page states any minimum notice period at
    // all \u2014 there is no number to encode, ambiguous or otherwise.
    minNoticeDays: null,
    verified: "2026-08-24",
  },
  {
    vendor: "DeepSeek",
    href: "https://api-docs.deepseek.com/updates",
    shape: "ad-hoc",
    sentence:
      "The two legacy API model names, deepseek-chat and deepseek-reasoner, will be discontinued in three months (2026-07-24).",
    sentenceMore:
      "Announced in the change log on 2026-04-24; the retirement took effect on 2026-07-24, before this page was written. The docs have no lifecycle-policy page, so notice is announced per event rather than promised up front.",
    // null (round 182): sentenceMore says plainly "the docs have no
    // lifecycle-policy page, so notice is announced per event rather than
    // promised up front" \u2014 there is no standing floor to compare against;
    // the "three months" in `sentence` describes what happened once, not a
    // commitment.
    minNoticeDays: null,
    verified: "2026-08-24",
  },
  {
    vendor: "Meta (Llama)",
    href: "https://www.llama.com/docs/",
    shape: "unverified",
    sentence:
      "Re-checked 2026-08-15 by the maintain round that re-attempted the verification with new techniques, and every block still holds: www.llama.com/docs redirects to developer.meta.com/ai/docs/overview/, which serves no readable content (HTTP 400 to a browser-like User-Agent even with full Accept/Accept-Language headers, HTTP 200 but a client-rendered React shell to a plain one); archive.org's snapshots of the whole developer.meta.com/ai/docs tree show no lifecycle, deprecation, retirement or EOL page anywhere \u2014 the closest is a \u201cVersioning, updates and migration\u201d deployment guide, which is a migration how-to, not a notice commitment; llms.txt was probed at eighteen plausible roots and the only one serving content is developer.meta.com/llms.txt (HTTP 200, 1,769 bytes), which points Llama resources at ai.developer.meta.com, an OAuth-gated site (one other root, the Horizon docs' llmstxt directory, returns HTTP 200 but empty); and the dev.meta.ai Model API docs, fetched in full on 2026-08-14, now answer HTTP 200 with \u201cNot Logged In\u201d \u2014 they moved behind a login since, and the archived index of the same docs contains no lifecycle or deprecation page either. Whether Meta publishes a lifecycle commitment for hosted Llama could not be determined. Re-attempted again on 2026-08-24, and the first of those blocks still holds exactly: www.llama.com/docs redirects to developer.meta.com/ai/docs/overview/, which answers a plain client with HTTP 200 and 302,065 bytes containing 33 characters of readable text — the page title and nothing else. That round re-ran only this one check, not the archive.org sweep or the llms.txt probe recorded above, so those two remain as last established on 2026-08-15 rather than re-confirmed; the row stays unverified either way, and this note says which half was actually re-tested.",
    sentenceMore:
      "The one reachable page recording Llama retirements is not Meta's: the Microsoft Foundry model retirement schedule (learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule), fetched 2026-08-14, lists five Llama models retired 2026-06-13 (Meta-Llama-3.1-405B-Instruct, Meta-Llama-3.1-8B, Meta-Llama-3.1-8B-Instruct, Llama-3.2-11B-Vision-Instruct, Llama-3.2-90B-Vision-Instruct) and three GA without dates (Llama-3.3-70B-Instruct, Llama-4-Maverick-17B-128E-Instruct-FP8, Llama-4-Scout-17B-16E-Instruct) \u2014 Microsoft's page about Foundry, not a commitment Meta published.",
    // null (round 182): this vendor's own lifecycle page could not be read
    // at all (shape "unverified" above) \u2014 there is no commitment text to
    // read a number out of, safely or otherwise.
    minNoticeDays: null,
    verified: null,
    unverifiedSince: "2026-08-15",
  },
  {
    vendor: "xAI (Grok)",
    href: "https://docs.x.ai/developers/migration/may-15-retirement",
    shape: "ad-hoc",
    sentence:
      "Effective May 15, 2026 at 12:00 PM PT, the following models will be retired from the xAI API:",
    sentenceMore:
      "Retirements are announced as per-event migration guides; the docs have no lifecycle-policy page, so notice is given per event without a standing floor.",
    // null (round 182): sentenceMore states plainly "the docs have no
    // lifecycle-policy page, so notice is given per event without a
    // standing floor" \u2014 no floor exists to compare against.
    minNoticeDays: null,
    verified: "2026-08-24",
  },
  {
    vendor: "Cohere",
    href: "https://docs.cohere.com/docs/deprecations",
    shape: "nothing",
    sentence:
      "A shutdown date will be assigned at that time.",
    sentenceMore:
      "Cohere has a deprecations page, but this is the only commitment it makes: no minimum notice period and no published dates for current models.",
    // null (round 182): sentenceMore states plainly "no minimum notice
    // period" \u2014 nothing to encode.
    minNoticeDays: null,
    verified: "2026-08-24",
  },
];

// The two neutral trackers this page links to, and what each does that this
// page does not. Aimodelgraveyard tracks dates and statuses across many
// vendors; endoflife.date tracks one vendor's dates precisely and in
// machine-readable form. Neither compares the shape of the promise.
export const RETIREMENT_TRACKERS = [
  {
    name: "The Model Graveyard",
    href: "https://aimodelgraveyard.com",
    strengths:
      "Multi-vendor, with per-model statuses computed from dates (buried / on borrowed time / living), a methodology page, and countdowns to the next shutdown.",
  },
  {
    name: "endoflife.date \u2014 Anthropic Claude",
    href: "https://endoflife.date/claude",
    strengths:
      "One vendor, precise per-model release and deprecation dates, machine-readable (JSON, RSS, iCalendar), and it records Anthropic's own 60-day notice commitment.",
  },
];
