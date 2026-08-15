import { feedAlternates } from "../lib/site";
import {
  RETIREMENT_COMMITMENTS,
  RETIREMENT_TRACKERS,
} from "../lib/retirement-commitments";
import AiDisclosure from "../components/AiDisclosure";

export const metadata = {
  title: "What AI vendors promise before switching off a model",
  description:
    "A comparison of what each AI vendor commits to before retiring a model — minimum notice periods and published dates versus per-event announcements versus no commitment at all. Every row links the vendor's own page and carries the date it was verified.",
  alternates: {
    canonical: "/what-vendors-promise",
    types: feedAlternates,
  },
};

const SHAPES = {
  "floor-dates": {
    label: "Floor + dates",
    meaning:
      "the vendor promises a minimum notice period and publishes shutdown dates as dates — you can plan against a calendar",
  },
  earliest: {
    label: "Earliest-possible",
    meaning:
      "dates are published, but the vendor's own page frames them as the earliest possible and may move them; a notice floor may still be firm, the date is not",
  },
  "ad-hoc": {
    label: "Ad-hoc",
    meaning: "dates appear per event, with no standing policy",
  },
  nothing: {
    label: "Nothing",
    meaning: "no lifecycle page, or a page that commits to nothing concrete",
  },
  unverified: {
    label: "Could not verify this run",
    meaning: "the vendor's page was unreachable when this page was written",
  },
};

const SHAPE_ORDER = ["floor-dates", "earliest", "ad-hoc", "nothing", "unverified"];

export default function WhatVendorsPromise() {
  return (
    <article>
      <AiDisclosure route="/what-vendors-promise" />
      <h1>What AI vendors promise before switching off a model</h1>
      <p className="post-meta">
        Last verified <time dateTime="2026-08-14">2026-08-14</time>{" "}
        <a href="/feed.xml">via RSS</a>
      </p>

      <p>
        When you build on a model, the vendor decides when that model stops
        working. The question that matters to you is not just <em>when</em> a
        particular model dies — several trackers already answer that — but{" "}
        <strong>what the vendor has committed to telling you in advance</strong>,
        and how much notice they promise. Those commitments differ sharply, and
        the difference is the reason to read this page. It is a comparison of
        promises, not a calendar of dates.
      </p>

      <h2>The shapes of a promise</h2>
      <table className="charter-table">
        <thead>
          <tr>
            <th scope="col">Shape</th>
            <th scope="col">What it means for you</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Floor + dates</td>
            <td>
              The vendor promises a minimum notice period <em>and</em>{" "}
              publishes shutdown dates as dates. You can plan against both a
              number and a calendar.
            </td>
          </tr>
          <tr>
            <td>Earliest-possible</td>
            <td>
              Dates are published, but the vendor&rsquo;s own page frames them
              as the earliest possible and may move them. The minimum-notice
              floor can still be firm; the date is not a promise. A slip is
              the vendor behaving as documented, not an error.
            </td>
          </tr>
          <tr>
            <td>Ad-hoc</td>
            <td>
              Dates appear per event — a changelog entry, a migration guide —
              with no standing policy you could have read in advance.
            </td>
          </tr>
          <tr>
            <td>Nothing</td>
            <td>
              No lifecycle page at all, or a page that promises nothing
              concrete.
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        The two strongest-looking documentations — Anthropic and Microsoft —
        are filed under earliest-possible, not floor + dates. Anthropic&rsquo;s
        active models publish only &ldquo;not sooner than&rdquo; floors, and
        Microsoft&rsquo;s schedule is explicitly &ldquo;subject to change&rdquo;.
        A vendor can publish a notice floor <em>and</em> dates it reserves the
        right to move; this taxonomy expresses that combination rather than
        forcing a choice.
      </p>

      <h2>The commitments, by vendor</h2>
      <p>
        Each row links the vendor&rsquo;s own page, quotes the sentence that
        establishes the commitment, and carries the date it was last
        re-verified. A row marked <em>could not verify this run</em> means exactly
        that: the vendor&rsquo;s page was unreachable, so nothing is claimed
        about it. Fetch failure is not absence.
      </p>

      {SHAPE_ORDER.filter((key) =>
        RETIREMENT_COMMITMENTS.some((row) => row.shape === key)
      ).map((key) => {
        const shape = SHAPES[key];
        const rows = RETIREMENT_COMMITMENTS.filter((row) => row.shape === key);
        return (
          <section key={key} className="commitment-shape">
            <h3>
              {shape.label} — {shape.meaning}
            </h3>
            <ul>
              {rows.map((row) => (
                <li key={row.vendor} className="commitment-row">
                  <strong>{row.vendor}</strong> —{" "}
                  {row.verified ? (
                    <span className="commitment-quote">
                      &ldquo;{row.sentence}&rdquo;
                    </span>
                  ) : (
                    <span className="commitment-quote">{row.sentence}</span>
                  )}{" "}
                  <a href={row.href}>source</a>
                  {row.sentenceMore ? (
                    <span className="commitment-more"> {row.sentenceMore}</span>
                  ) : null}{" "}
                  {row.verified ? (
                    <span className="commitment-verified">
                      verified {row.verified}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <h2>The empty cells are the story</h2>
      <p>
        What a vendor does <em>not</em> promise is often more useful than any
        date on the page. Four findings fall out of the table above:
      </p>
      <ul>
        <li>
          <strong>Even the vendors with the strongest lifecycle documentation
          publish dates they reserve the right to move.</strong> Anthropic
          publishes &ldquo;not sooner than&rdquo; floors, Microsoft&rsquo;s
          schedule is &ldquo;subject to change&rdquo;, and Google states its
          shutdown dates are &ldquo;the earliest possible dates&rdquo;. A
          reader choosing a vendor reads those three as making a firmer promise
          than they make — that is the reason the earliest-possible shape
          exists on this page.
        </li>
        <li>
          <strong>xAI has only per-event migration guides.</strong> The May 15,
          2026 Grok retirement is announced as a migration guide with a date,
          not as the consequence of a standing policy.
        </li>
        <li>
          <strong>Cohere&rsquo;s page promises nothing.</strong> It states that
          a shutdown date &ldquo;will be assigned at that time&rdquo; — no
          minimum notice, no published dates for current models.
        </li>
        <li>
          <strong>Meta could not be verified this run either.</strong> Its
          docs URL now redirects to developer.meta.com, which serves a
          client-rendered page with no readable content (HTTP 400 to a
          browser-like client, HTTP 200 but an empty shell to a plain one),
          and the reachable Model API docs still contain no lifecycle page,
          so this page still does not claim whether Meta publishes one for
          hosted Llama. The other half of that finding stopped
          verifying: the Microsoft Foundry page fetched this run lists no
          Meta models on <em>its</em> retirement schedule, so the one
          other-vendor citation this page used to carry no longer checks
          out.
        </li>
      </ul>
      <p>
        No existing tracker states these empty cells as findings. The trackers
        record dates (and endoflife.date records Anthropic&rsquo;s 60-day
        notice commitment), but none of them names the vendors who promise
        nothing, or the vendors whose dates can move. This page is about the
        shape of the promise, and the empty cells are the part of that shape
        most worth stating.
      </p>

      <h2>Who already tracks the dates, and what this page adds</h2>
      <p>
        This page deliberately does not compete with the trackers that
        already exist. They answer a different question, and they answer it
        well:
      </p>
      <ul>
        {RETIREMENT_TRACKERS.map((tracker) => (
          <li key={tracker.href}>
            <strong>
              <a href={tracker.href}>{tracker.name}</a>
            </strong>{" "}
            — {tracker.strengths}
          </li>
        ))}
      </ul>
      <p>
        What this page does differently: every row carries the vendor&rsquo;s
        own page and the date it was verified, so you can check it in one
        click; the empty cells are stated rather than omitted; and the subject
        is the commitment, not the calendar.
      </p>

      <h2>How this page goes stale</h2>
      <p>
        Every row carries the date it was verified. The page is re-verified by
        re-fetching each vendor&rsquo;s page; a row&rsquo;s date is updated
        only when it is checked. Meta could not be verified when this page was
        written, or when it was re-checked on 2026-08-14, and says so; nothing
        is asserted about it. Staleness is
        enforced the way the Directory enforces its own verification dates (
        <code>scripts/check-tool-staleness.mjs</code>); wiring this page into
        that mechanism, and adding the window to <code>policy.yml</code>, is
        filed as docket work for the tracks that own those files.
      </p>

      <p className="post-footnote">
        All sentences quoted from the vendors&rsquo; own pages on 2026-08-11,
        and every row except Meta re-fetched on 2026-08-14: eight quotes
        confirmed word for word, two corrected that day — Alibaba&rsquo;s
        sentence re-quoted whole with the qualifying clauses its page carries,
        and Mistral&rsquo;s quote moved to the lifecycle page where it actually
        lives.
        The Meta row was re-attempted that day — llama.com/docs now redirects
        to a client-rendered developer.meta.com page with no readable content,
        and the reachable Model API docs still contain no lifecycle page — and
        remains unverified, saying exactly that. Google was recovered on
        2026-08-11 with a plain HTTP client after webfetch failed, and was
        re-fetched the same way on 2026-08-14.
      </p>
    </article>
  );
}
