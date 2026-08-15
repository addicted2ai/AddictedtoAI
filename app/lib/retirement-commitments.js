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
// Staleness is enforced by the same check as the Directory:
// scripts/check-tool-staleness.mjs reads policy.yml's
// staleness_days.directory_entry window over the `verified` dates in this
// file too. A row whose page was unreachable carries `verified: null` plus a
// dated `unverifiedSince` record; the check fails once that record is past
// the window, so an unverified row is never treated as fresh (round 124 wired
// this; its changelog entry argues the shared window).
export const RETIREMENT_COMMITMENTS = [
  {
    vendor: "OpenAI",
    href: "https://developers.openai.com/api/docs/deprecations",
    shape: "floor-dates",
    sentence:
      "Unless safety or compliance concerns require a faster timeline, we provide the following minimum notice periods before model retirement: Generally available models: At least 6 months. Specialized variants of generally available models: At least 3 months.",
    sentenceMore:
      "All deprecated models and endpoints will also have a shut down date. The faster-timeline clause means even these dates can move earlier.",
    verified: "2026-08-14",
  },
  {
    vendor: "Anthropic",
    href: "https://platform.claude.com/docs/en/about-claude/model-deprecations",
    shape: "earliest",
    sentence:
      "Anthropic notifies customers with active deployments for models with upcoming retirements, providing at least 60 days' notice before model retirement for publicly released models.",
    sentenceMore:
      "Active models carry a floor rather than a date \u2014 \u201cNot sooner than September 29, 2026\u201d \u2014 so the date is the earliest a model may retire, not a commitment to that day. The 60-day notice is the firm floor; the date can move.",
    verified: "2026-08-14",
  },
  {
    vendor: "Mistral",
    href: "https://docs.mistral.ai/inference/model-lifecycle/",
    shape: "floor-dates",
    sentence:
      "During the deprecation period, the model remains accessible. Once retired, requests to its identifiers fail with a 404 error.",
    sentenceMore:
      "The same page's deprecation policy opens with \u201cDeprecation is announced as soon as a replacement model is available\u201d and commits to 6 months' notice for General Availability models; the models page (docs.mistral.ai/models) lists concrete deprecation and retirement dates.",
    verified: "2026-08-14",
  },
  {
    vendor: "Amazon Bedrock",
    href: "https://docs.aws.amazon.com/bedrock/latest/userguide/model-lifecycle.html",
    shape: "floor-dates",
    sentence:
      "Once a model launches on Amazon Bedrock, it will remain on Amazon Bedrock for at least 12 months before the EOL date.",
    sentenceMore:
      "A model will be in the Legacy state for at least 6 months before the EOL date, and \u201con, or soon after the EOL date\u201d requests to the version will fail \u2014 the EOL date itself is fixed, the failure can slip a little later. The lifecycle table lists each model's EOL date.",
    verified: "2026-08-14",
  },
  {
    vendor: "Microsoft Foundry",
    href: "https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirements",
    shape: "earliest",
    sentence:
      "GA models have their retirement date set programmatically at launch to 18 months out\u2014there's no separate \"announcement.\"",
    sentenceMore:
      "GA model retirement notice is \u201cat least 60 days before retirement\u201d; at 18 months from launch, all inference returns 410 Gone. But the page says the schedule details \u201care subject to change\u201d \u2014 the published date is not a hard commitment.",
    verified: "2026-08-14",
  },
  {
    vendor: "Alibaba (Model Studio)",
    href: "https://www.alibabacloud.com/help/en/model-studio/model-depreciation",
    shape: "floor-dates",
    sentence:
      "For snapshot models, which are identified by a specific date in their name (for example, qwen-max-2025-01-25, common for Qwen series models), we issue a sunset notice 30 days before the official sunset date. For mainline models, which are the core versions of a model series, we issue a sunset notice 3 months before the official sunset date.",
    sentenceMore:
      "The page then lists concrete deprecation dates with replacement models.",
    verified: "2026-08-14",
  },
  {
    vendor: "Google (Gemini API)",
    href: "https://ai.google.dev/gemini-api/docs/deprecations",
    shape: "earliest",
    sentence:
      "The shutdown dates listed in the table indicate the earliest possible dates on which a model might be retired.",
    sentenceMore:
      "Recovered with a plain curl User-Agent: webfetch's browser-like UA is redirected into an OAuth login loop. The deprecation table lists dated shutdowns with recommended replacements.",
    verified: "2026-08-14",
  },
  {
    vendor: "DeepSeek",
    href: "https://api-docs.deepseek.com/updates",
    shape: "ad-hoc",
    sentence:
      "The two legacy API model names, deepseek-chat and deepseek-reasoner, will be discontinued in three months (2026-07-24).",
    sentenceMore:
      "Announced in the change log on 2026-04-24; the retirement took effect on 2026-07-24, before this page was written. The docs have no lifecycle-policy page, so notice is announced per event rather than promised up front.",
    verified: "2026-08-14",
  },
  {
    vendor: "Meta (Llama)",
    href: "https://www.llama.com/docs/",
    shape: "unverified",
    sentence:
      "Re-checked 2026-08-15 by the maintain round that re-attempted the verification with new techniques, and every block still holds: www.llama.com/docs redirects to developer.meta.com/ai/docs/overview/, which serves no readable content (HTTP 400 to a browser-like User-Agent even with full Accept/Accept-Language headers, HTTP 200 but a client-rendered React shell to a plain one); archive.org's snapshots of the whole developer.meta.com/ai/docs tree show no lifecycle, deprecation, retirement or EOL page anywhere \u2014 the closest is a \u201cVersioning, updates and migration\u201d deployment guide, which is a migration how-to, not a notice commitment; llms.txt was probed at eighteen plausible roots and the only one serving content is developer.meta.com/llms.txt (HTTP 200, 1,769 bytes), which points Llama resources at ai.developer.meta.com, an OAuth-gated site (one other root, the Horizon docs' llmstxt directory, returns HTTP 200 but empty); and the dev.meta.ai Model API docs, fetched in full on 2026-08-14, now answer HTTP 200 with \u201cNot Logged In\u201d \u2014 they moved behind a login since, and the archived index of the same docs contains no lifecycle or deprecation page either. Whether Meta publishes a lifecycle commitment for hosted Llama could not be determined.",
    sentenceMore:
      "The one reachable page recording Llama retirements is not Meta's: the Microsoft Foundry model retirement schedule (learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule), fetched 2026-08-14, lists five Llama models retired 2026-06-13 (Meta-Llama-3.1-405B-Instruct, Meta-Llama-3.1-8B, Meta-Llama-3.1-8B-Instruct, Llama-3.2-11B-Vision-Instruct, Llama-3.2-90B-Vision-Instruct) and three GA without dates (Llama-3.3-70B-Instruct, Llama-4-Maverick-17B-128E-Instruct-FP8, Llama-4-Scout-17B-16E-Instruct) \u2014 Microsoft's page about Foundry, not a commitment Meta published.",
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
    verified: "2026-08-14",
  },
  {
    vendor: "Cohere",
    href: "https://docs.cohere.com/docs/deprecations",
    shape: "nothing",
    sentence:
      "A shutdown date will be assigned at that time.",
    sentenceMore:
      "Cohere has a deprecations page, but this is the only commitment it makes: no minimum notice period and no published dates for current models.",
    verified: "2026-08-14",
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
