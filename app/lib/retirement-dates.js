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
// Rows were generated on 2026-08-14 by parsing the fetched markdown
// of OpenAI's deprecations page (71 rows from its shutdown tables, plus the
// three platform shutdowns its prose dates at 2026-11-30) and read off the
// fetched Anthropic page (3 retired models, 10 active-model floors).
//
// Re-verified in full on 2026-08-24 (round 187, maintain). Both pages were
// re-fetched with a plain curl User-Agent (HTTP 200; OpenAI 36,252 bytes of
// markdown, Anthropic 13,415) and every row compared to them mechanically
// rather than by eye: identifier, shutdown date, alias list and named
// replacement. Nothing moved -- 0 dates changed, 0 rows dropped, 0
// replacements changed, and 0 rows on either page that fall inside the
// 2026-05-01 scope window above are absent from this file. That last
// qualifier is load-bearing: rows dated before the window are correctly
// absent (`chatgpt-4o-latest`, 2026-02-17, is the nearest one), so a
// reader comparing this file to the vendors' pages line by line will find
// entries here that are not defects. The
// 71 + 3 split above still holds exactly, and OpenAI's most recent
// announcement heading is still 2026-07-20, Anthropic's still 2026-06-05,
// so neither vendor has announced a dated shutdown since this file was
// built. The comparison is not reproduced here as a script because it
// needs the fetched pages; the round's CHANGELOG.md entry records the
// method and the two traps it had to get past (escaped pipes inside a
// table cell, and the page's prose "Date | Update" tables).
//
// THE INCLUSION RULE, decided by round 189 (maintain) on 2026-08-24 and
// stated here so a re-verification applies it instead of re-deriving it.
// Previously this was an unwritten scope call, which meant every
// re-verification silently re-decided it; that is what
// docket/done/2026-08-24-dated-milestones-that-are-not-shutdowns.md asked to
// end, and it asked for a decision to be recorded, not for rows to be added.
//
//   A row is a date on which something stops working. A dated milestone that
//   RESTRICTS a capability, while what is already running keeps running, is
//   not a row.
//
// So these four dated OpenAI milestones stay out, and the page now says so in
// its own Scope section rather than leaving readers to infer it from an
// absence:
//
//   2026-05-07  fine-tuning job creation closed to orgs that never fine-tuned
//   2026-07-02  ... and to orgs with no fine-tuned inference in 60 days
//   2026-10-31  "existing evals become read-only"
//   2027-01-06  "active existing customers will no longer be able to create
//               new fine-tuning jobs on this date"
//
// Verified against https://developers.openai.com/api/docs/deprecations on
// 2026-08-24 (round 189): the page states "inference on fine-tuned models
// will continue to be available until the base models are deprecated" and
// "inference on fine-tuned models will be disabled only when the underlying
// base model is deprecated" -- so none of these four milestones switches an
// identifier off. A read-only eval still opens.
//
// Careful with 2026-05-07: it is BOTH a milestone above AND a genuine
// shutdown date, and this comment said "nothing goes dark on any of those
// dates" until review caught it. Six rows below (the gpt-4o realtime and
// audio previews) really do switch off that day. They are unrelated to the
// fine-tuning milestone that happens to share the date -- which is exactly
// why the rule is stated per-milestone and not per-date.
//
// The rule is drawn where it is because of the .ics feed, not for tidiness:
// /model-retirement-calendar.ics emits one event per row, and the
// deprecation checker answers "is anything of mine being switched off". A
// capability milestone rendered as either would tell a reader a model shuts
// down on a day it does not, which is worse than the omission. The Evals
// platform's actual shutdown (2026-11-30) is a row and stays one -- the rule
// separates the milestone from the shutdown, it does not drop the product.
//
// If a future round wants these visible, the rule above is what it has to
// change, in the open, along with the Scope paragraph that publishes it and
// a column or marker distinguishing a capability milestone from a shutdown.
//
// The
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
  { vendor: "OpenAI", what: "gpt-4o-realtime-preview", shutdown: "2026-05-07", replacement: "gpt-realtime-1.5", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-4o-realtime-preview-2025-06-03", shutdown: "2026-05-07", replacement: "gpt-realtime-1.5", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-4o-realtime-preview-2024-12-17", shutdown: "2026-05-07", replacement: "gpt-realtime-1.5", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-4o-mini-realtime-preview", shutdown: "2026-05-07", replacement: "gpt-realtime-mini", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-4o-audio-preview", shutdown: "2026-05-07", replacement: "gpt-audio-1.5", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-4o-mini-audio-preview", shutdown: "2026-05-07", replacement: "gpt-audio-mini", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "dall-e-2", shutdown: "2026-05-12", replacement: "gpt-image-2, gpt-image-1, or gpt-image-1-mini", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "dall-e-3", shutdown: "2026-05-12", replacement: "gpt-image-2, gpt-image-1, or gpt-image-1-mini", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "OpenAI-Beta: realtime=v1", shutdown: "2026-05-12", replacement: "Realtime API", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "computer-use-preview-2025-03-11 (also computer-use-preview)", shutdown: "2026-07-23", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-4o-mini-search-preview-2025-03-11", shutdown: "2026-07-23", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-4o-search-preview-2025-03-11", shutdown: "2026-07-23", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-5-chat-latest", shutdown: "2026-07-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-5-codex", shutdown: "2026-07-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-5.1-chat-latest", shutdown: "2026-07-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-5.1-codex", shutdown: "2026-07-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-5.1-codex-max", shutdown: "2026-07-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-5.1-codex-mini", shutdown: "2026-07-23", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-audio-mini-2025-10-06", shutdown: "2026-07-23", replacement: "gpt-audio-1.5", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-realtime-mini-2025-10-06", shutdown: "2026-07-23", replacement: "gpt-realtime-2.1-mini", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "o3-deep-research-2025-06-26 (also o3-deep-research)", shutdown: "2026-07-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "o4-mini-deep-research-2025-06-26 (also o4-mini-deep-research)", shutdown: "2026-07-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-5.2-codex", shutdown: "2026-07-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-5.2-chat-latest", shutdown: "2026-08-10", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-5.3-chat-latest", shutdown: "2026-08-10", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "Assistants API", shutdown: "2026-08-26", replacement: "Responses API and Conversations API", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "Videos API", shutdown: "2026-09-24", replacement: null, href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "sora-2", shutdown: "2026-09-24", replacement: null, href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "sora-2-pro", shutdown: "2026-09-24", replacement: null, href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "sora-2-2025-10-06", shutdown: "2026-09-24", replacement: null, href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "sora-2-2025-12-08", shutdown: "2026-09-24", replacement: null, href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "sora-2-pro-2025-10-06", shutdown: "2026-09-24", replacement: null, href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-3.5-turbo-instruct", shutdown: "2026-09-28", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "babbage-002", shutdown: "2026-09-28", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "davinci-002", shutdown: "2026-09-28", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-3.5-turbo-1106", shutdown: "2026-09-28", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-3.5-turbo-0125 (also gpt-3.5-turbo, gpt-3.5-turbo-completions)", shutdown: "2026-10-23", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-4-0613 (also gpt-4, gpt-4-0613-completions, gpt-4-completions)", shutdown: "2026-10-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-4-1106-preview", shutdown: "2026-10-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-4-turbo (also gpt-4-turbo-2024-04-09, gpt-4-turbo-completions)", shutdown: "2026-10-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-4.1-nano (also gpt-4.1-nano-2025-04-14)", shutdown: "2026-10-23", replacement: "gpt-5.6-luna", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-4o-2024-05-13", shutdown: "2026-10-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-image-1", shutdown: "2026-10-23", replacement: "gpt-image-2", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "o1-2024-12-17 (also o1)", shutdown: "2026-10-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "o1-pro-2025-03-19 (also o1-pro)", shutdown: "2026-10-23", replacement: "gpt-5.6-sol (reasoning.mode: pro)", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "o3-mini-2025-01-31 (also o3-mini)", shutdown: "2026-10-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "ft-o4-mini-2025-04-16", shutdown: "2026-10-23", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "o4-mini-2025-04-16 (also o4-mini)", shutdown: "2026-10-23", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "ft-gpt-3.5-turbo", shutdown: "2026-10-23", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "ft-gpt-4", shutdown: "2026-10-23", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "ft-gpt-4.1-nano-2025-04-14", shutdown: "2026-10-23", replacement: "gpt-5.6-luna", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "ft-babbage-002", shutdown: "2026-10-23", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "ft-davinci-002", shutdown: "2026-10-23", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "v1/prompts API and reusable prompt objects", shutdown: "2026-11-30", replacement: null, note: "The page's migration path: move reusable prompt content into your application code (migration guide linked).", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "Evals platform (dashboard and API)", shutdown: "2026-11-30", replacement: null, note: "The page links a migration path: Moving from OpenAI Evals to Promptfoo.", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "Agent Builder", shutdown: "2026-11-30", replacement: null, note: "ChatKit remains available; the page links a migration guide to the Agents SDK or ChatGPT Workspace Agents.", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-image-1-mini", shutdown: "2026-12-01", replacement: "gpt-image-2", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-image-1.5", shutdown: "2026-12-01", replacement: "gpt-image-2", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "chatgpt-image-latest", shutdown: "2026-12-01", replacement: "gpt-image-2", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-5-2025-08-07", shutdown: "2026-12-11", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-5-mini-2025-08-07", shutdown: "2026-12-11", replacement: "gpt-5.6-terra", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-5-nano-2025-08-07", shutdown: "2026-12-11", replacement: "gpt-5.6-luna", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-5-pro-2025-10-06", shutdown: "2026-12-11", replacement: "gpt-5.6-sol (reasoning.mode: pro)", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "o3-2025-04-16", shutdown: "2026-12-11", replacement: "gpt-5.6-sol", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "o3-pro-2025-06-10", shutdown: "2026-12-11", replacement: "gpt-5.6-sol (reasoning.mode: pro)", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-realtime", shutdown: "2027-01-20", replacement: "gpt-realtime-2.1", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-audio", shutdown: "2027-01-20", replacement: "gpt-audio-1.5", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-4o-audio", shutdown: "2027-01-20", replacement: "gpt-audio-1.5", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-4o-realtime", shutdown: "2027-01-20", replacement: "gpt-realtime-2.1", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-realtime-mini", shutdown: "2027-01-20", replacement: "gpt-realtime-2.1-mini", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-audio-mini", shutdown: "2027-01-20", replacement: "gpt-audio-1.5", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-4o-mini-realtime", shutdown: "2027-01-20", replacement: "gpt-realtime-2.1-mini", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-4o-mini-audio", shutdown: "2027-01-20", replacement: "gpt-audio-1.5", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "OpenAI", what: "gpt-4o-mini-transcribe-2025-03-20", shutdown: "2027-01-20", replacement: "gpt-4o-mini-transcribe-2025-12-15", href: "https://developers.openai.com/api/docs/deprecations", verified: "2026-08-24" },
  { vendor: "Anthropic", what: "claude-sonnet-4-20250514", shutdown: "2026-06-15", replacement: "claude-sonnet-4-6", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-24" },
  { vendor: "Anthropic", what: "claude-opus-4-20250514", shutdown: "2026-06-15", replacement: "claude-opus-4-8", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-24" },
  { vendor: "Anthropic", what: "claude-opus-4-1-20250805", shutdown: "2026-08-05", replacement: "claude-opus-4-8", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-24" },
];

// Anthropic's active models carry a floor rather than a date — "Not sooner
// than September 29, 2026" — so the earliest a model may retire, not a
// commitment to that day. The 60-day notice commitment is the firm part. Kept
// in their own array so the page can present them as what they are, and the
// staleness check covers their verified dates too.
export const RETIREMENT_FLOORS = [
  { vendor: "Anthropic", what: "claude-fable-5", floor: "2027-06-09", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-24" },
  { vendor: "Anthropic", what: "claude-opus-5", floor: "2027-07-24", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-24" },
  { vendor: "Anthropic", what: "claude-opus-4-8", floor: "2027-05-28", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-24" },
  { vendor: "Anthropic", what: "claude-opus-4-7", floor: "2027-04-16", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-24" },
  { vendor: "Anthropic", what: "claude-opus-4-6", floor: "2027-02-05", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-24" },
  { vendor: "Anthropic", what: "claude-opus-4-5-20251101", floor: "2026-11-24", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-24" },
  { vendor: "Anthropic", what: "claude-sonnet-5", floor: "2027-06-30", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-24" },
  { vendor: "Anthropic", what: "claude-sonnet-4-6", floor: "2027-02-17", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-24" },
  { vendor: "Anthropic", what: "claude-sonnet-4-5-20250929", floor: "2026-09-29", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-24" },
  { vendor: "Anthropic", what: "claude-haiku-4-5-20251001", floor: "2026-10-15", href: "https://platform.claude.com/docs/en/about-claude/model-deprecations", verified: "2026-08-24" },
];
