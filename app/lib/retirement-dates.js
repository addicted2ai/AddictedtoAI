// Dated model and API shutdowns, read off the vendors' own deprecation pages
// by the round that published them (CHARTER.md rule 1) — every row carries a
// `verified` date and the vendor page it was read from, so a reader can check
// any row in one click.
//
// This is the complement of /what-vendors-promise (app/lib/retirement-commitments.js):
// that page compares the shape of each vendor's promise and deliberately
// publishes no calendar of dates; this page IS the calendar. The two vendors
// publish this differently — OpenAI's deprecations page lists dated shutdowns
// for models, model families and APIs; Anthropic's page lists hard retirement
// dates only for models already retired or about to be (claude-opus-4-1 etc.)
// and gives every active model a "Not sooner than" floor rather than a date.
// Both differences are stated on the page itself.
//
// Scope: shutdown dates on or after 2026-05-01, so a bounded window of the
// recent past stays visible (a shutdown that passes its date moves from the
// upcoming table to the past table, never disappears) and the page can be
// checked against what it said. Older history is on the vendors' own pages.
//
// Rows were generated this round (2026-08-14) by parsing the fetched markdown
// of OpenAI's deprecations page (71 rows from its shutdown tables, plus the
// three platform shutdowns its prose dates at 2026-11-30) and read off the
// fetched Anthropic page (3 retired models, 10 active-model floors). The
// OpenAI page's `dall-e-2` / `dall-e-3` row reads 2026-05-12; the 2026-12-01
// date belongs to the separate GPT Image family (gpt-image-1-mini,
// gpt-image-1.5, chatgpt-image-latest), which is likely where the
// two-fetch date discrepancy recorded in
// docket/open/2026-08-11-model-retirement-calendar.md came from.
//
// Staleness is enforced by scripts/staleness-report.mjs, which fails the
// build when a row goes unverified past the window in policy.yml's
// staleness_days.retirement_calendar — a key meta owns; until it exists the
// report enforces an interim window and says loudly that it is doing so (see
// docket/open/2026-08-14-retirement-calendar-staleness-window.md).

export const RETIREMENT_DATES = [
  { vendor: "OpenAI", what: "gpt-4o-realtime-preview", shutdown: "2026-05-07", replacement: "gpt-realtime-1.5", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-4o-realtime-preview-2025-06-03", shutdown: "2026-05-07", replacement: "gpt-realtime-1.5", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-4o-realtime-preview-2024-12-17", shutdown: "2026-05-07", replacement: "gpt-realtime-1.5", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-4o-mini-realtime-preview", shutdown: "2026-05-07", replacement: "gpt-realtime-mini", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-4o-audio-preview", shutdown: "2026-05-07", replacement: "gpt-audio-1.5", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-4o-mini-audio-preview", shutdown: "2026-05-07", replacement: "gpt-audio-mini", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "dall-e-2", shutdown: "2026-05-12", replacement: "gpt-image-2, gpt-image-1, or gpt-image-1-mini", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "dall-e-3", shutdown: "2026-05-12", replacement: "gpt-image-2, gpt-image-1, or gpt-image-1-mini", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "OpenAI-Beta: realtime=v1", shutdown: "2026-05-12", replacement: "Realtime API", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "computer-use-preview-2025-03-11 (also computer-use-preview)", shutdown: "2026-07-23", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-4o-mini-search-preview-2025-03-11", shutdown: "2026-07-23", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-4o-search-preview-2025-03-11", shutdown: "2026-07-23", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-5-chat-latest", shutdown: "2026-07-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-5-codex", shutdown: "2026-07-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-5.1-chat-latest", shutdown: "2026-07-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-5.1-codex", shutdown: "2026-07-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-5.1-codex-max", shutdown: "2026-07-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-5.1-codex-mini", shutdown: "2026-07-23", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-audio-mini-2025-10-06", shutdown: "2026-07-23", replacement: "gpt-audio-1.5", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-realtime-mini-2025-10-06", shutdown: "2026-07-23", replacement: "gpt-realtime-2.1-mini", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "o3-deep-research-2025-06-26 (also o3-deep-research)", shutdown: "2026-07-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "o4-mini-deep-research-2025-06-26 (also o4-mini-deep-research)", shutdown: "2026-07-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-5.2-codex", shutdown: "2026-07-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-5.2-chat-latest", shutdown: "2026-08-10", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-5.3-chat-latest", shutdown: "2026-08-10", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "Assistants API", shutdown: "2026-08-26", replacement: "Responses API and Conversations API", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "Videos API", shutdown: "2026-09-24", replacement: null, href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "sora-2", shutdown: "2026-09-24", replacement: null, href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "sora-2-pro", shutdown: "2026-09-24", replacement: null, href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "sora-2-2025-10-06", shutdown: "2026-09-24", replacement: null, href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "sora-2-2025-12-08", shutdown: "2026-09-24", replacement: null, href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "sora-2-pro-2025-10-06", shutdown: "2026-09-24", replacement: null, href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-3.5-turbo-instruct", shutdown: "2026-09-28", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "babbage-002", shutdown: "2026-09-28", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "davinci-002", shutdown: "2026-09-28", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-3.5-turbo-1106", shutdown: "2026-09-28", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-3.5-turbo-0125 (also gpt-3.5-turbo, gpt-3.5-turbo-completions)", shutdown: "2026-10-23", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-4-0613 (also gpt-4, gpt-4-0613-completions, gpt-4-completions)", shutdown: "2026-10-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-4-1106-preview", shutdown: "2026-10-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-4-turbo (also gpt-4-turbo-2024-04-09, gpt-4-turbo-completions)", shutdown: "2026-10-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-4.1-nano (also gpt-4.1-nano-2025-04-14)", shutdown: "2026-10-23", replacement: "gpt-5.6-luna", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-4o-2024-05-13", shutdown: "2026-10-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-image-1", shutdown: "2026-10-23", replacement: "gpt-image-2", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "o1-2024-12-17 (also o1)", shutdown: "2026-10-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "o1-pro-2025-03-19 (also o1-pro)", shutdown: "2026-10-23", replacement: "gpt-5.6-sol (reasoning.mode: pro)", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "o3-mini-2025-01-31 (also o3-mini)", shutdown: "2026-10-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "ft-o4-mini-2025-04-16", shutdown: "2026-10-23", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "o4-mini-2025-04-16 (also o4-mini)", shutdown: "2026-10-23", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "ft-gpt-3.5-turbo", shutdown: "2026-10-23", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "ft-gpt-4", shutdown: "2026-10-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "ft-gpt-4.1-nano-2025-04-14", shutdown: "2026-10-23", replacement: "gpt-5.6-luna", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "ft-babbage-002", shutdown: "2026-10-23", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "ft-davinci-002", shutdown: "2026-10-23", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "v1/prompts API and reusable prompt objects", shutdown: "2026-11-30", replacement: null, note: "The page's migration path: move reusable prompt content into your application code (migration guide linked).", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "Evals platform (dashboard and API)", shutdown: "2026-11-30", replacement: null, note: "The page links a migration path: Moving from OpenAI Evals to Promptfoo.", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "Agent Builder", shutdown: "2026-11-30", replacement: null, note: "ChatKit remains available; the page links a migration guide to the Agents SDK or ChatGPT Workspace Agents.", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-image-1-mini", shutdown: "2026-12-01", replacement: "gpt-image-2", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-image-1.5", shutdown: "2026-12-01", replacement: "gpt-image-2", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "chatgpt-image-latest", shutdown: "2026-12-01", replacement: "gpt-image-2", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-5-2025-08-07", shutdown: "2026-12-11", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-5-mini-2025-08-07", shutdown: "2026-12-11", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-5-nano-2025-08-07", shutdown: "2026-12-11", replacement: "gpt-5.6-luna", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-5-pro-2025-10-06", shutdown: "2026-12-11", replacement: "gpt-5.6-sol (reasoning.mode: pro)", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "o3-2025-04-16", shutdown: "2026-12-11", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "o3-pro-2025-06-10", shutdown: "2026-12-11", replacement: "gpt-5.6-sol (reasoning.mode: pro)", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-realtime", shutdown: "2027-01-20", replacement: "gpt-realtime-2.1", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-audio", shutdown: "2027-01-20", replacement: "gpt-audio-1.5", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-4o-audio", shutdown: "2027-01-20", replacement: "gpt-audio-1.5", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-4o-realtime", shutdown: "2027-01-20", replacement: "gpt-realtime-2.1", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-realtime-mini", shutdown: "2027-01-20", replacement: "gpt-realtime-2.1-mini", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-audio-mini", shutdown: "2027-01-20", replacement: "gpt-audio-1.5", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-4o-mini-realtime", shutdown: "2027-01-20", replacement: "gpt-realtime-2.1-mini", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-4o-mini-audio", shutdown: "2027-01-20", replacement: "gpt-audio-1.5", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "OpenAI", what: "gpt-4o-mini-transcribe-2025-03-20", shutdown: "2027-01-20", replacement: "gpt-4o-mini-transcribe-2025-12-15", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-14" },
  { vendor: "Anthropic", what: "claude-sonnet-4-20250514", shutdown: "2026-06-15", replacement: "claude-sonnet-4-6", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-14" },
  { vendor: "Anthropic", what: "claude-opus-4-20250514", shutdown: "2026-06-15", replacement: "claude-opus-4-8", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-14" },
  { vendor: "Anthropic", what: "claude-opus-4-1-20250805", shutdown: "2026-08-05", replacement: "claude-opus-4-8", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-14" },
];

// Anthropic's active models carry a floor rather than a date — "Not sooner
// than September 29, 2026" — so the earliest a model may retire, not a
// commitment to that day. The 60-day notice commitment is the firm part. Kept
// in their own array so the page can present them as what they are, and the
// staleness check covers their verified dates too.
export const RETIREMENT_FLOORS = [
  { vendor: "Anthropic", what: "claude-fable-5", floor: "2027-06-09", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-14" },
  { vendor: "Anthropic", what: "claude-opus-5", floor: "2027-07-24", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-14" },
  { vendor: "Anthropic", what: "claude-opus-4-8", floor: "2027-05-28", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-14" },
  { vendor: "Anthropic", what: "claude-opus-4-7", floor: "2027-04-16", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-14" },
  { vendor: "Anthropic", what: "claude-opus-4-6", floor: "2027-02-05", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-14" },
  { vendor: "Anthropic", what: "claude-opus-4-5-20251101", floor: "2026-11-24", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-14" },
  { vendor: "Anthropic", what: "claude-sonnet-5", floor: "2027-06-30", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-14" },
  { vendor: "Anthropic", what: "claude-sonnet-4-6", floor: "2027-02-17", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-14" },
  { vendor: "Anthropic", what: "claude-sonnet-4-5-20250929", floor: "2026-09-29", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-14" },
  { vendor: "Anthropic", what: "claude-haiku-4-5-20251001", floor: "2026-10-15", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-14" },
];
