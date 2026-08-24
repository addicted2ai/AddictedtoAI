import { RETIREMENT_DATES } from "../lib/retirement-dates";
import { buildRetirementIcsFeed } from "../lib/retirement-ics";

// docket/open/2026-08-22-model-shutdown-ics-feed.md, done/ once this ships:
// a static .ics calendar of RETIREMENT_DATES, one VEVENT per row, so a
// visitor subscribes once and gets every future model-shutdown reminder in
// their own calendar app without returning to this site.
//
// Entirely static, provably so two ways:
//   1. `force-static` below opts this route out of per-request rendering --
//      Next.js 14's default for a GET() that reads no dynamic API is
//      already static, but Next 15 flips that default (a GET route handler
//      is no longer cached by default), so this is pinned explicitly rather
//      than relying on the version currently installed staying installed.
//   2. ICS_BODY is computed once, at module load, not inside GET(). GET()
//      only returns the string that already exists -- there is no
//      per-request call to buildRetirementIcsFeed for a request to reach.
// This is rule 16's non-inference path, the same argument
// app/model-deprecation-checker/page.js's docket item made and this
// project's CHANGELOG proved for that page; see this round's entry for the
// RFC 5545 parser validation and the health check's red/green proof.
export const dynamic = "force-static";

const ICS_BODY = buildRetirementIcsFeed(RETIREMENT_DATES);

export function GET() {
  return new Response(ICS_BODY, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition":
        'inline; filename="model-retirement-calendar.ics"',
    },
  });
}
