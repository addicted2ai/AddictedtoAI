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
// The four shapes are the axis:
//   floor-dates   — a minimum notice period AND published shutdown dates
//   earliest      — dates published as the earliest possible, may be extended
//   ad-hoc        — dates appear per event, no standing policy
//   nothing       — no lifecycle page, or a page that commits to nothing
//   unverified    — the vendor's page was unreachable when the row was written
//
// Staleness follows the Directory's mechanism (scripts/check-tool-staleness.mjs
// reads policy.yml's window over `verified` dates). Extending that check to
// this file, and adding a window to policy.yml, is filed as
// docket/open/2026-08-11-retirement-commitments-staleness.md — both live
// outside author scope.
export const RETIREMENT_COMMITMENTS = [
  {
    vendor: "OpenAI",
    href: "https://developers.openai.com/api/docs/deprecations",
    shape: "floor-dates",
    sentence:
      "Unless safety or compliance concerns require a faster timeline, we provide the following minimum notice periods before model retirement: Generally available models: At least 6 months. Specialized variants of generally available models: At least 3 months.",
    sentenceMore:
      "All deprecated models and endpoints will also have a shut down date.",
    verified: "2026-08-11",
  },
  {
    vendor: "Anthropic",
    href: "https://platform.claude.com/docs/en/about-claude/model-deprecations",
    shape: "floor-dates",
    sentence:
      "Anthropic notifies customers with active deployments for models with upcoming retirements, providing at least 60 days' notice before model retirement for publicly released models.",
    sentenceMore:
      "Active models carry a floor rather than a date — \u201cNot sooner than September 29, 2026\u201d — and retired models have a concrete retirement date.",
    verified: "2026-08-11",
  },
  {
    vendor: "Mistral",
    href: "https://docs.mistral.ai/inference/model-lifecycle",
    shape: "floor-dates",
    sentence:
      "Deprecation is announced as soon as a replacement model is available. During the deprecation period, the model remains accessible. Once retired, requests to its identifiers fail with a 404 error.",
    sentenceMore:
      "The notice-period table commits to 6 months for General Availability models, 1 month for Labs, Public Preview and third-party models. The deprecated-models table lists concrete deprecation and retirement dates.",
    verified: "2026-08-11",
  },
  {
    vendor: "Amazon Bedrock",
    href: "https://docs.aws.amazon.com/bedrock/latest/userguide/model-lifecycle.html",
    shape: "floor-dates",
    sentence:
      "Once a model launches on Amazon Bedrock, it will remain on Amazon Bedrock for at least 12 months before the EOL date.",
    sentenceMore:
      "A model will be in the Legacy state for at least 6 months before the EOL date, and \u201con, or soon after the EOL date\u201d requests to the version will fail. The lifecycle table lists each model's EOL date.",
    verified: "2026-08-11",
  },
  {
    vendor: "Microsoft Foundry",
    href: "https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirements",
    shape: "floor-dates",
    sentence:
      "GA models have their retirement date set programmatically at launch to 18 months out \u2014 there's no separate \u201cannouncement.\u201d",
    sentenceMore:
      "GA model retirement notice is \u201cat least 60 days before retirement\u201d; at 18 months from launch, all inference returns 410 Gone. The retirement-schedule page lists each model's date.",
    verified: "2026-08-11",
  },
  {
    vendor: "Alibaba (Model Studio)",
    href: "https://www.alibabacloud.com/help/en/model-studio/model-depreciation",
    shape: "floor-dates",
    sentence:
      "For snapshot models, we issue a sunset notice 30 days before the official sunset date. For mainline models, we issue a sunset notice 3 months before the official sunset date.",
    sentenceMore:
      "The page then lists concrete deprecation dates with replacement models.",
    verified: "2026-08-11",
  },
  {
    vendor: "Google (Gemini API)",
    href: "https://ai.google.dev/gemini-api/docs/deprecations",
    shape: "unverified",
    sentence:
      "Could not verify this run: ai.google.dev returned a transport error on every fetch attempt on 2026-08-11, so no claim is made about the shape of Google's commitment.",
    verified: null,
  },
  {
    vendor: "DeepSeek",
    href: "https://api-docs.deepseek.com/updates",
    shape: "ad-hoc",
    sentence:
      "The two legacy API model names, deepseek-chat and deepseek-reasoner, will be discontinued in three months (2026-07-24).",
    sentenceMore:
      "The date appears in the API change log; the docs have no lifecycle-policy page, so notice is announced per event rather than promised up front.",
    verified: "2026-08-11",
  },
  {
    vendor: "Meta (Llama)",
    href: "https://www.llama.com/docs/",
    shape: "unverified",
    sentence:
      "Could not verify this run: llama.com and docs.llama.com returned HTTP 400 or transport errors on every fetch attempt on 2026-08-11, so no claim is made about whether Meta publishes a lifecycle page.",
    verified: null,
  },
  {
    vendor: "xAI (Grok)",
    href: "https://docs.x.ai/developers/migration/may-15-retirement",
    shape: "ad-hoc",
    sentence:
      "Effective May 15, 2026 at 12:00 PM PT, the following models will be retired from the xAI API.",
    sentenceMore:
      "Retirements are announced as per-event migration guides; the docs have no lifecycle-policy page, so notice is given per event without a standing floor.",
    verified: "2026-08-11",
  },
  {
    vendor: "Cohere",
    href: "https://docs.cohere.com/docs/deprecations",
    shape: "nothing",
    sentence:
      "A shutdown date will be assigned at that time.",
    sentenceMore:
      "Cohere has a deprecations page, but this is the only commitment it makes: no minimum notice period and no published dates for current models.",
    verified: "2026-08-11",
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
