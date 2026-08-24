// A deterministic RFC 5545 (iCalendar) transform of RETIREMENT_DATES
// (app/lib/retirement-dates.js) -- one VEVENT per row, so a visitor
// subscribes once in their own calendar app and gets every future
// model-shutdown reminder without returning to this site.
// (docket/open/2026-08-22-model-shutdown-ics-feed.md)
//
// Pure function of its input array: no fetch, no Date.now(), no
// environment read. app/model-retirement-calendar.ics/route.js calls this
// exactly once, at module load, so the output is computed at build time and
// only ever served, never recomputed per request -- the non-inference path
// rule 16 requires. scripts/check-model-retirement-ics.mjs imports this
// same function directly and parses its output with ical.js (a real RFC
// 5545 parser), so a bug here that drops, duplicates, or malforms a row
// fails CI rather than silently shipping.

const CRLF = "\r\n";
const FOLD_OCTET_LIMIT = 75;
const UID_DOMAIN = "addictedtoai.net";

// RFC 5545 section 3.1: a content line longer than 75 octets (excluding the
// line break) SHOULD be folded by inserting CRLF followed by a single
// linear-white-space character; the fold is undone by removing that CRLF
// and the space it introduces, which is why the continuation always costs
// one extra octet of its own 75-octet budget. Counted in UTF-8 octets, not
// UTF-16 code units, and split on codepoint boundaries so a surrogate pair
// is never torn in half -- this data is all ASCII today, but the function
// does not assume that stays true.
function foldLine(line) {
  if (Buffer.byteLength(line, "utf8") <= FOLD_OCTET_LIMIT) return line;

  const chunks = [];
  let current = "";
  let currentBytes = 0;
  let isFirstChunk = true;

  for (const codepoint of line) {
    const codepointBytes = Buffer.byteLength(codepoint, "utf8");
    const budget = isFirstChunk ? FOLD_OCTET_LIMIT : FOLD_OCTET_LIMIT - 1;
    if (currentBytes + codepointBytes > budget && current.length > 0) {
      chunks.push(current);
      current = "";
      currentBytes = 0;
      isFirstChunk = false;
    }
    current += codepoint;
    currentBytes += codepointBytes;
  }
  chunks.push(current);

  return chunks.map((chunk, index) => (index === 0 ? chunk : ` ${chunk}`)).join(CRLF);
}

// RFC 5545 section 3.3.11 (TEXT value type escaping). Backslash first, so
// the escaping backslashes just added are never themselves re-escaped by
// the rules that follow.
function escapeText(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

function contentLine(name, value) {
  return foldLine(`${name}:${value}`);
}

function toIcsDate(isoDate) {
  return isoDate.replace(/-/g, "");
}

function nextIsoDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

// DTSTAMP is required on every VEVENT (RFC 5545 3.6.1). It normally records
// when the calendar object was generated; using the row's own `verified`
// date (rather than the build clock) keeps the feed byte-for-byte
// reproducible across rebuilds that touch no retirement data, and ties the
// timestamp to the fact it actually reflects -- when this row was last
// checked against the vendor's page -- rather than to an unrelated deploy
// time.
function toIcsDateTimeUtc(isoDate) {
  return `${toIcsDate(isoDate)}T000000Z`;
}

function slugify(value) {
  const slug = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "row";
}

// UID is keyed on vendor + identifier, not the shutdown date: if a vendor
// revises a date, the same event should update in a subscriber's calendar
// rather than leaving a phantom old-dated entry behind. A trailing counter
// disambiguates the (currently unobserved) case of two rows sharing a
// vendor+identifier slug, so a collision degrades to distinct-but-ugly UIDs
// instead of one row's event silently overwriting another's in a calendar
// client that keys on UID.
function buildUid(row, usedSlugs) {
  const baseSlug = `${slugify(row.vendor)}-${slugify(row.what)}`;
  const occurrence = usedSlugs.get(baseSlug) || 0;
  usedSlugs.set(baseSlug, occurrence + 1);
  const slug = occurrence === 0 ? baseSlug : `${baseSlug}-${occurrence}`;
  return `${slug}@${UID_DOMAIN}`;
}

function buildEventLines(row, usedSlugs) {
  const replacementText = row.replacement ? row.replacement : "none named";
  const summary = `${row.vendor}: ${row.what} retires`;
  const descriptionParts = [
    `Vendor: ${row.vendor}.`,
    `Identifier: ${row.what}.`,
    `Replacement: ${replacementText}.`,
    `Source: ${row.href} (verified ${row.verified}).`,
  ];
  if (row.note) descriptionParts.push(row.note);
  const description = descriptionParts.join(" ");

  return [
    "BEGIN:VEVENT",
    contentLine("UID", buildUid(row, usedSlugs)),
    contentLine("DTSTAMP", toIcsDateTimeUtc(row.verified)),
    contentLine("DTSTART;VALUE=DATE", toIcsDate(row.shutdown)),
    contentLine("DTEND;VALUE=DATE", toIcsDate(nextIsoDate(row.shutdown))),
    contentLine("SUMMARY", escapeText(summary)),
    contentLine("DESCRIPTION", escapeText(description)),
    contentLine("URL", row.href),
    "END:VEVENT",
  ];
}

// Builds the full .ics document: one VEVENT per row, in the order given.
// Deliberately takes `rows` as a parameter rather than importing
// RETIREMENT_DATES itself, so scripts/check-model-retirement-ics.mjs can
// feed it a deliberately mutated array to prove the one-event-per-row
// assertion can fail (see that script's header for the red/green proof).
export function buildRetirementIcsFeed(rows) {
  const usedSlugs = new Map();
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AddictedtoAI.net//Model Retirement Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Model retirement calendar (AddictedtoAI)",
    "X-WR-CALDESC:Dated AI model and API shutdowns from OpenAI's and Anthropic's own deprecation pages -- one event per row, source-linked and vendor-verified.",
    "X-PUBLISHED-TTL:P1D",
  ];

  for (const row of rows) {
    lines.push(...buildEventLines(row, usedSlugs));
  }

  lines.push("END:VCALENDAR");
  return lines.join(CRLF) + CRLF;
}
