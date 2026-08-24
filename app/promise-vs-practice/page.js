import { feedAlternates } from "../lib/site";
import { RETIREMENT_COMMITMENTS } from "../lib/retirement-commitments";
import { RETIREMENT_DATES } from "../lib/retirement-dates";
import {
  computeLiveNoticeFloorRows,
  summarizeCoverage,
  STATUS,
} from "../lib/notice-floor-check";
import AiDisclosure from "../components/AiDisclosure";

export const metadata = {
  title: "Promise vs. practice — is a live shutdown inside the vendor's own notice window?",
  description:
    "For every shutdown that has not happened yet, compares the runway remaining against the vendor's own promised minimum notice period — and states plainly, for the vendors whose promise is too tiered or ambiguous to check safely, why it is left uncompared rather than guessed.",
  alternates: {
    canonical: "/promise-vs-practice",
    types: feedAlternates,
  },
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

const STATUS_LABEL = {
  [STATUS.HELD]: "promise currently held",
  [STATUS.INSIDE_WINDOW]: "inside the vendor's own promised notice window",
  [STATUS.NO_FLOOR]: "no comparable floor",
};

export default function PromiseVsPractice() {
  const todayIso = today();
  const coverage = summarizeCoverage(RETIREMENT_DATES, RETIREMENT_COMMITMENTS, todayIso);
  const comparableVendors = coverage.filter((c) => c.minNoticeDays !== null);
  const uncomparableVendors = coverage.filter((c) => c.minNoticeDays === null);
  const commitmentByVendor = new Map(RETIREMENT_COMMITMENTS.map((c) => [c.vendor, c]));

  const liveRows = computeLiveNoticeFloorRows(RETIREMENT_DATES, RETIREMENT_COMMITMENTS, todayIso);
  const checkedRows = liveRows.filter((row) => row.status !== STATUS.NO_FLOOR);
  const heldRows = checkedRows.filter((row) => row.status === STATUS.HELD);
  const violatingRows = checkedRows.filter((row) => row.status === STATUS.INSIDE_WINDOW);
  const uncheckedLiveRows = liveRows.filter((row) => row.status === STATUS.NO_FLOOR);

  return (
    <article>
      <AiDisclosure route="/promise-vs-practice" />
      <h1>Does a live shutdown honour the vendor&rsquo;s own promised notice floor?</h1>
      <p className="post-meta">
        Last verified <time dateTime="2026-08-14">2026-08-14</time>{" "}
        <a href="/feed.xml">via RSS</a>
      </p>

      <p className="log-lead">
        <a href="/what-vendors-promise">What vendors promise</a> states each
        one&rsquo;s minimum notice period as prose.{" "}
        <a href="/model-retirement-calendar">The retirement calendar</a> lists
        dated shutdowns. Neither page does the arithmetic that puts them
        together: for a shutdown that has not happened yet, is there still at
        least as much runway left as the vendor&rsquo;s own promised floor?
        This page computes that, live, from data already on both — and states
        plainly which vendors&rsquo; own wording is too tiered or ambiguous to
        check safely, rather than guessing a number for them.
      </p>

      <h2>Right now</h2>
      {checkedRows.length === 0 ? (
        <p>
          Of the {liveRows.length} live (not-yet-passed) shutdown
          {liveRows.length === 1 ? "" : "s"} in{" "}
          <a href="/model-retirement-calendar">the retirement calendar</a>{" "}
          today, {uncheckedLiveRows.length} carry{" "}
          {uncheckedLiveRows.length === 1 ? "a vendor" : "vendors"} with no
          comparable floor (see below for why, vendor by vendor) — so this
          page currently has nothing to compare against. That is not the same
          as a clean bill of health: it means the one vendor whose floor is
          safely comparable, Anthropic, has no live shutdown in the data
          right now to check it against — its own three tracked shutdowns
          have already passed. This section recomputes on every build, so a
          new Anthropic shutdown, or a future round resolving one of the
          vendors below, changes what appears here without anyone rewriting
          this page.
        </p>
      ) : (
        <>
          <p>
            {heldRows.length} of {checkedRows.length} comparable live
            shutdown{checkedRows.length === 1 ? "" : "s"} currently{" "}
            {heldRows.length === 1 ? "holds" : "hold"} the vendor&rsquo;s own
            promised floor; {violatingRows.length}{" "}
            {violatingRows.length === 1 ? "does" : "do"} not.
          </p>
          <div
            className="table-scroll"
            role="region"
            tabIndex={0}
            aria-label="Live notice-floor comparison table"
          >
            <table className="charter-table" data-notice-floor-table="live">
              <thead>
                <tr>
                  <th scope="col">Shutdown</th>
                  <th scope="col">Vendor</th>
                  <th scope="col">What</th>
                  <th scope="col">Runway left</th>
                  <th scope="col">Vendor&rsquo;s floor</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {checkedRows.map((row) => (
                  <tr key={`${row.vendor}-${row.shutdown}-${row.what}`}>
                    <td>
                      <time dateTime={row.shutdown}>{row.shutdown}</time>
                    </td>
                    <td>{row.vendor}</td>
                    <td>
                      <code>{row.what}</code>
                    </td>
                    <td>{row.remainingDays} days</td>
                    <td>{row.minNoticeDays} days</td>
                    <td>
                      {row.status === STATUS.INSIDE_WINDOW ? (
                        <strong className="notice-floor-violation">
                          {STATUS_LABEL[row.status]}
                        </strong>
                      ) : (
                        STATUS_LABEL[row.status]
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2>What the three labels mean</h2>
      <p>
        Every live shutdown resolves to exactly one of three labels, computed
        from <code>remaining runway = shutdown date − today</code> against
        the vendor&rsquo;s own <code>minNoticeDays</code>:
      </p>
      <ul>
        <li>
          <strong>{STATUS_LABEL[STATUS.HELD]}</strong> — the remaining runway
          is at or above the vendor&rsquo;s own promised floor.
        </li>
        <li>
          <strong className="notice-floor-violation">
            {STATUS_LABEL[STATUS.INSIDE_WINDOW]}
          </strong>{" "}
          — the remaining runway is below it: as of today, this shutdown
          would not clear the notice the vendor promises, stated plainly
          rather than euphemised.
        </li>
        <li>
          <strong>{STATUS_LABEL[STATUS.NO_FLOOR]}</strong> — this
          vendor&rsquo;s own wording does not support a single, safely
          comparable number (see below), so nothing is claimed either way.
        </li>
      </ul>

      <h2>Which vendors this can even check</h2>
      <p>
        A floor here is a plain number derived once, in{" "}
        <code>app/lib/retirement-commitments.js</code>, from the vendor&rsquo;s
        own sentence quoted in full on{" "}
        <a href="/what-vendors-promise">what vendors promise</a> — never
        parsed from prose at render time. Of the {coverage.length} vendors
        whose promise is tracked there, {comparableVendors.length} have a
        floor safely comparable this way.
      </p>
      <div
        className="table-scroll"
        role="region"
        tabIndex={0}
        aria-label="Vendor notice-floor coverage table"
      >
        <table className="charter-table" data-notice-floor-table="coverage">
          <thead>
            <tr>
              <th scope="col">Vendor</th>
              <th scope="col">Notice floor used here</th>
              <th scope="col">Live shutdowns now</th>
            </tr>
          </thead>
          <tbody>
            {coverage.map((row) => (
              <tr key={row.vendor}>
                <td>{row.vendor}</td>
                <td>
                  {row.minNoticeDays === null ? (
                    <span className="commitment-more">no comparable floor</span>
                  ) : (
                    `${row.minNoticeDays} days`
                  )}
                </td>
                <td>{row.hasLiveRow ? "yes" : "none right now"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Why most vendors are marked &ldquo;no comparable floor&rdquo;</h2>
      <p>
        {uncomparableVendors.length} of {coverage.length} vendors are marked
        this way, and each reason is specific to that vendor&rsquo;s own
        wording, not a blanket caution. The four this round examined most
        carefully because their promise genuinely differs by model category:
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong> promises 6 months&rsquo; notice for
          generally-available models and 3 months for specialized variants —
          two different floors, and{" "}
          <a href="/model-retirement-calendar">the retirement calendar</a>{" "}
          carries no field saying which OpenAI row is which. Guessing from a
          model name (a <code>-preview</code> suffix, a dated snapshot) would
          be a rule this page invented, not one OpenAI&rsquo;s own page
          states precisely enough to apply with confidence. A second,
          separate problem compounds it: OpenAI&rsquo;s promise is scoped to
          &ldquo;model retirement&rdquo;, and several of its live rows —
          the Assistants API, the Videos API, the Evals platform, Agent
          Builder, the <code>v1/prompts</code> API — are not models at all.
          Both reasons argue the same way, so OpenAI is left uncompared
          entirely rather than applying even the shorter of the two model
          floors to rows its own sentence may never have covered.
        </li>
        <li>
          <strong>Alibaba (Model Studio)</strong> also states two floors —
          30 days for &ldquo;snapshot&rdquo; models, 3 months for
          &ldquo;mainline&rdquo; ones — but unlike OpenAI, both numbers are
          known and the calendar carries no Alibaba rows to classify at all
          today. Alibaba&rsquo;s own page says snapshot models are
          &ldquo;identified by a specific date in their name&rdquo;, which is
          nominally checkable against a future row&rsquo;s identifier — this
          round does not build that per-row classifier (nothing here yet to
          test it against), so the coverage table above uses the shorter,
          30-day floor uniformly as an explicit simplification: it can only
          under-flag a real mainline violation, never wrongly flag a
          compliant snapshot model as breaking a promise it never made.
        </li>
        <li>
          <strong>Mistral</strong> and <strong>Microsoft Foundry</strong>{" "}
          each state exactly one notice number, and each states it scoped to
          &ldquo;General Availability&rdquo; models specifically — with no
          second number given for anything else and no tag in the calendar
          to tell which rows are GA. Unlike Alibaba, there is no known
          fallback number here; applying the one stated figure to an
          untagged row would risk holding a model to a promise that
          sentence never scoped to it.
        </li>
        <li>
          <strong>Amazon Bedrock</strong> states two numbers in one policy —
          &ldquo;at least 12 months&rdquo; a model stays available after
          launch, and &ldquo;Legacy state for at least 6 months before the
          EOL date&rdquo;. Read carefully rather than assumed: the first is a
          minimum lifetime since launch, not notice before shutdown, and the
          second describes how long a state lasts, not that entering it
          notifies anyone. Neither is confidently a notice-before-shutdown
          floor, so neither is used.
        </li>
      </ul>
      <p>
        The remaining five are simpler, and each says so on its own page:
        Google (Gemini API) states no minimum notice period at all;{" "}
        DeepSeek and xAI (Grok) each say plainly their docs have no
        lifecycle-policy page, so notice is announced per event rather than
        promised up front; Cohere states outright that it makes no minimum
        notice commitment; and Meta (Llama)&rsquo;s lifecycle page could not
        be read this run or the last, so there is no commitment text to read
        a number from. Every one of these sentences is quoted in full on{" "}
        <a href="/what-vendors-promise">what vendors promise</a>.
      </p>

      <h2>How this page goes stale</h2>
      <p>
        The floor for each vendor changes only when a round re-reads that
        vendor&rsquo;s page and edits{" "}
        <code>app/lib/retirement-commitments.js</code> — the same
        verification and the same staleness window (
        <code>scripts/staleness-report.mjs</code>) that governs{" "}
        <a href="/what-vendors-promise">what vendors promise</a>. The
        comparison itself — which live shutdowns currently clear each
        floor — recomputes on every build from{" "}
        <code>app/lib/retirement-dates.js</code>, so this page changes
        automatically as shutdowns arrive and pass, without a round having to
        revisit it.{" "}
        <code>scripts/check-notice-floor-comparator.mjs</code> fails the
        build if either data file&rsquo;s shape changes in a way that would
        silently break this comparison — a renamed field, a vendor removed
        from one file while the other still names it.
      </p>
      <p className="post-footnote">
        Every floor above is read from the same sentences quoted in full,
        with their own verification dates, on{" "}
        <a href="/what-vendors-promise">what vendors promise</a>; nothing on
        this page is fetched or re-derived independently of that page&rsquo;s
        own sourcing. The comparison logic lives in{" "}
        <code>app/lib/notice-floor-check.js</code>.
      </p>
    </article>
  );
}
