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
        Last verified <time dateTime="2026-08-24">2026-08-24</time>{" "}
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

      <p className="correction-note">
        <strong>Correction, 2026-08-24.</strong> Until this date the OpenAI row
        above quoted only the first <em>two</em> of the three bullets
        OpenAI&rsquo;s page lists under &ldquo;minimum notice periods&rdquo;,
        and stopped at the longer pair. The missing third bullet is the
        shortest floor OpenAI states and the only one not measured in months:
        preview models, &ldquo;identified by <code>preview</code> in the model
        name&rdquo;, &ldquo;may be retired with much shorter notice, such as 2
        weeks&rdquo;. A reader of this page &mdash; which says above that it
        quotes &ldquo;the sentence that establishes the commitment&rdquo;
        &mdash; would reasonably have taken 3 months as OpenAI&rsquo;s floor
        for everything. It is not, and it was never the whole sentence.
      </p>
      <p className="correction-note">
        The OpenAI quote above is now the whole passage: the lead-in, all
        three bullets, and both of the vendor&rsquo;s own &ldquo;Examples
        include &hellip;&rdquo; sentences, with nothing omitted and no
        elision. That is deliberate rather than tidy &mdash; those examples
        are what name which models OpenAI counts as specialized variants and
        which as previews, and an earlier draft of this very correction cut
        them, which would have left the quotation marks around a sentence
        OpenAI never wrote in that form.
      </p>
      <p className="correction-note">
        This was not a change at OpenAI. The bullet appears in the Internet
        Archive&rsquo;s{" "}
        <a href="https://web.archive.org/web/20260810135331/https://developers.openai.com/api/docs/deprecations">
          2026-08-10 capture of the page
        </a>
        , four days before the 2026-08-14 verification this row carried, so
        the omission was in this site&rsquo;s reading, not in the
        vendor&rsquo;s wording &mdash; which makes it the kind of error a
        re-verification is supposed to catch and had already missed once.
      </p>

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
          hosted Llama. The other half of that finding, corrected again on
          2026-08-14: the Microsoft Foundry model retirement schedule
          <em>does</em> list Meta models — five Llama models (Meta-Llama-3.1
          and Llama-3.2 families) retired 2026-06-13, and three more
          (Llama-3.3-70B-Instruct, Llama-4-Maverick-17B-128E-Instruct-FP8,
          Llama-4-Scout-17B-16E-Instruct) listed as generally available with
          no retirement date — so the round-88 citation was right in
          substance, and Foundry&rsquo;s schedule is the one reachable page
          recording Llama retirements, even though Meta&rsquo;s own docs
          still cannot be read. The count of three was independently
          verified against the Foundry schedule during the round&rsquo;s
          review.
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

      {/* A callout stood here until round 186 (audit), pointing at
          /promise-vs-practice — "see which live shutdowns currently clear the
          vendor's own promised notice floor". That page was withdrawn that
          round because on every day of its published life, none did and none
          could: of the two vendors on this page with a comparable notice
          floor, Alibaba has never had a dated row in the calendar and
          Anthropic's three all passed before the page shipped. The address
          still resolves and explains itself; the invitation is removed rather
          than left pointing at a retraction notice. */}

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
        enforced the way the Directory enforces its own verification dates, by
        the same report over both files (
        <code>scripts/staleness-report.mjs</code>), which judges this
        page&rsquo;s rows against the Directory&rsquo;s own window; the
        retirement-calendar window key in <code>policy.yml</code> remains
        filed as docket work for the track that owns it.
      </p>

      <p className="post-footnote">
        Re-verified 2026-08-24: all ten reachable vendor pages re-fetched with
        a plain HTTP client (all HTTP 200), and every quoted sentence checked
        as a contiguous run of words in the page it cites &mdash; punctuation
        and markup discarded, word order and completeness not. All ten hold on
        that test; no vendor has changed the sentence this page quotes, and no
        quote here omits vendor text without saying so. The OpenAI quote is the
        longest at 115 words and was re-tested at 115 of 115 after the
        correction above, because the first draft of that correction failed
        this same test at 36 of 58 and the failure had to be found by review
        rather than by the check that was supposed to catch it. Meta was
        re-attempted the same day and is still unreadable, so
        its row remains unverified and claims nothing; the row itself now
        records which of its checks were re-run that day and which were not.
        The OpenAI correction above came out of that pass: the quote was
        accurate as far as it went, which is exactly why a substring check had
        never flagged it, and why the omission survived a prior
        re-verification.
      </p>
      <p className="post-footnote">
        All sentences quoted from the vendors&rsquo; own pages on 2026-08-11,
        and every row except Meta re-fetched on 2026-08-14: six quotes held
        word for word as originally published (OpenAI, Anthropic, Bedrock,
        Google, DeepSeek, Cohere); four were corrected that day —
        Alibaba&rsquo;s sentence re-quoted whole with the qualifying clauses
        its page carries, Mistral&rsquo;s quote moved to the lifecycle page
        where it actually lives, Foundry&rsquo;s quote re-quoted with the
        page&rsquo;s unspaced em dash, and xAI&rsquo;s quote re-quoted with
        the page&rsquo;s colon. Every quoted sentence was verified as a
        contiguous substring of its page&rsquo;s rendered text, fetched this
        run; all ten now hold word for word.
        The Meta row was re-attempted that day — llama.com/docs now redirects
        to a client-rendered developer.meta.com page with no readable content,
        and the reachable Model API docs still contain no lifecycle page — and
        remains unverified, saying exactly that. Google was recovered on
        2026-08-11 with a plain HTTP client after webfetch failed, and was
        re-fetched the same way on 2026-08-14. The Foundry half of the Meta
        finding was re-checked on 2026-08-14 and found the round-113
        correction to have overreached: the Foundry model retirement schedule
        does list Meta models — five Llama models retired 2026-06-13, three
        more GA — so this page now says so instead of claiming no Meta
        models appear on it.
      </p>
    </article>
  );
}
