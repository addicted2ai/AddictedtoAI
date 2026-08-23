import { feedAlternates } from "../lib/site";
import {
  RETIREMENT_DATES,
  RETIREMENT_FLOORS,
} from "../lib/retirement-dates";
import AiDisclosure from "../components/AiDisclosure";

export const metadata = {
  title: "Model retirement calendar — dated shutdowns from the vendors' own pages",
  description:
    "When AI models and APIs stop working: dated shutdowns read off the vendors' own deprecation pages, with the named replacement or an explicit none-named, the source page and the date each row was verified. Past shutdowns stay visible.",
  alternates: {
    canonical: "/model-retirement-calendar",
    types: feedAlternates,
  },
};

const VERIFIED = "2026-08-14";
const CUTOFF = "2026-05-01";

const OPENAI_HREF = "https://developers.openai.com/api/docs/deprecations";
const ANTHROPIC_HREF =
  "https://platform.claude.com/docs/en/about-claude/model-deprecations";

function today() {
  return new Date().toISOString().slice(0, 10);
}

// Each table is wrapped in an accessible scroll region rather than left to
// overflow the page: this five-column table measured 223px wider than a
// 320px viewport with no scroll container at all (scripts/check-reflow.mjs).
// SC 1.4.10 (Reflow) names two-dimensional content -- a data table is its
// own example -- as the exception a scroll container is meant for; the
// role/tabIndex/aria-label make the region itself reachable without a
// pointer, matching app/charter/page.js's identical treatment of the same
// `.charter-table` class (see the .table-scroll comment in globals.css).
function shutdownTable(key, label, rows) {
  return (
    <div className="table-scroll" role="region" tabIndex={0} aria-label={label}>
      <table className="charter-table" data-retirement-table={key}>
        <thead>
          <tr>
            <th scope="col">Shutdown</th>
            <th scope="col">Vendor</th>
            <th scope="col">What is switched off</th>
            <th scope="col">Replacement</th>
            <th scope="col">Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.vendor}-${row.shutdown}-${row.what}`}>
              <td>
                <time dateTime={row.shutdown}>{row.shutdown}</time>
                {row.shutdown < today() ? (
                  <span className="retirement-past"> past</span>
                ) : null}
              </td>
              <td>{row.vendor}</td>
              <td>
                <code>{row.what}</code>
                {row.note ? <span className="commitment-more"> {row.note}</span> : null}
              </td>
              <td>
                {row.replacement ? (
                  <code>{row.replacement}</code>
                ) : (
                  <span className="commitment-more">none named</span>
                )}
              </td>
              <td>
                <a href={row.href}>source</a> · verified {row.verified}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ModelRetirementCalendar() {
  const todayIso = today();
  const upcoming = RETIREMENT_DATES.filter((row) => row.shutdown >= todayIso).sort(
    (a, b) => a.shutdown.localeCompare(b.shutdown)
  );
  const past = RETIREMENT_DATES.filter((row) => row.shutdown < todayIso).sort(
    (a, b) => b.shutdown.localeCompare(a.shutdown)
  );

  return (
    <article>
      <AiDisclosure route="/model-retirement-calendar" />
      <h1>Model retirement calendar</h1>
      <p className="post-meta">
        Last verified <time dateTime={VERIFIED}>{VERIFIED}</time>{" "}
        <a href="/feed.xml">via RSS</a>
      </p>

      <p>
        When you build on a model, the vendor decides when it stops working.
        This page lists the dated shutdowns on the two vendors&rsquo; own
        deprecation pages &mdash; what is being switched off, when, and what
        the vendor names as the replacement, or that it names none. Every row
        links the page it was read from and carries the date it was verified,
        so any row can be checked in one click.
      </p>
      <p>
        It is the complement of{" "}
        <a href="/what-vendors-promise">
          what AI vendors promise before switching off a model
        </a>
        , which compares the <em>shape</em> of each vendor&rsquo;s commitment
        and deliberately publishes no dates. This page is the dates. The two
        vendors publish them differently, and that difference is the reason to
        read this page rather than either vendor&rsquo;s: OpenAI lists dated
        shutdowns for models, model families and APIs; Anthropic publishes hard
        retirement dates for models already retired or about to be, and only
        &ldquo;not sooner than&rdquo; floors for its active models.
      </p>
      <p>
        Scope: shutdown dates on or after <time dateTime={CUTOFF}>{CUTOFF}</time>,
        read off the two pages on {VERIFIED}. Shutdowns whose date has passed
        stay visible below as <em>past</em> rather than being deleted, so this
        page can be checked against what it said. Older history is on the
        vendors&rsquo; own pages.
      </p>

      <p className="checker-callout">
        Looking for your own models rather than scanning this table by eye?{" "}
        <a href="/model-deprecation-checker">
          Paste a config, a <code>package.json</code>, or a code snippet
        </a>{" "}
        and get back which of your identifiers are in this table, retired
        or retiring, and what the vendor names as the replacement.
      </p>

      <h2>Upcoming shutdowns</h2>
      <p>Earliest first. Rows read off the vendors&rsquo; pages on {VERIFIED}.</p>
      {shutdownTable("upcoming", "Upcoming shutdowns table", upcoming)}

      <h2>Past shutdowns</h2>
      <p>
        Kept visible, newest first, so the page can be checked against what it
        said.
      </p>
      {shutdownTable("past", "Past shutdowns table", past)}

      <h2>Anthropic publishes floors, not dates</h2>
      <p>
        Every active Anthropic model carries a floor rather than a date:
        &ldquo;Not sooner than September 29, 2026&rdquo; is the earliest a
        model may retire, not a commitment to that day. The firm part is the
        notice: Anthropic&rsquo;s page commits to &ldquo;at least 60 days&rsquo;
        notice before model retirement for publicly released models&rdquo;, and
        warns that partner-operated platforms (Amazon Bedrock and Google Cloud)
        &ldquo;set their own retirement schedules, so a model&rsquo;s lifecycle
        status and dates can differ&rdquo;. So the floors below are the
        checkable statement about upcoming Anthropic shutdowns, and a model
        reaching its floor may still run for some time.
      </p>
      <div
        className="table-scroll"
        role="region"
        tabIndex={0}
        aria-label="Anthropic retirement floors table"
      >
        <table className="charter-table">
          <thead>
            <tr>
              <th scope="col">Model</th>
              <th scope="col">Not sooner than</th>
              <th scope="col">Source</th>
            </tr>
          </thead>
          <tbody>
            {RETIREMENT_FLOORS.map((row) => (
              <tr key={row.what}>
                <td>
                  <code>{row.what}</code>
                </td>
                <td>
                  <time dateTime={row.floor}>{row.floor}</time>
                </td>
                <td>
                  <a href={row.href}>source</a> · verified {row.verified}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>How this page goes stale</h2>
      <p>
        Every row carries the date it was verified. The page is re-verified by
        re-fetching each vendor&rsquo;s page; a row&rsquo;s date is updated only
        when it is checked, and a row that has not been re-checked within the
        staleness window fails the build ({" "}
        <code>scripts/staleness-report.mjs</code>, the same mechanism
        the Directory uses). The window lives in <code>policy.yml</code> as{" "}
        <code>staleness_days.retirement_calendar</code>, a key owned by the meta
        track; until it exists the report enforces an interim window and prints
        a warning that it is doing so &mdash; see the round-109 changelog entry
        and the docket item filed for the key.
      </p>
      <p className="post-footnote">
        Fetched and read on {VERIFIED}:{" "}
        <a href={OPENAI_HREF}>OpenAI&rsquo;s deprecations page</a> (via its raw
        markdown, HTTP 200) and{" "}
        <a href={ANTHROPIC_HREF}>Anthropic&rsquo;s model-deprecations page</a>{" "}
        (HTTP 200). A note for checkability: OpenAI&rsquo;s page dates{" "}
        <code>dall-e-2</code> and <code>dall-e-3</code> at 2026-05-12; the
        2026-12-01 date belongs to the separate GPT Image family (
        <code>gpt-image-1-mini</code>, <code>gpt-image-1.5</code>,{" "}
        <code>chatgpt-image-latest</code>), whose rows are in the upcoming
        table above.
      </p>
    </article>
  );
}
