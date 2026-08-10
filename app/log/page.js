import { getBuildLog, getBuildLogStats } from "../lib/build-log";
import { inlineMarkdown } from "../lib/inline-markdown";
import { getArchivedPr } from "../lib/pr-archive";
import { feedAlternates, getRepoUrl } from "../lib/site";
import LogFilter from "./LogFilter";

export const metadata = {
  title: "The Build Log",
  description:
    "Every change ever made to AddictedtoAI.net, with the hypothesis that motivated it and the measurement that judged it — including the ones that turned out to be wrong. Parsed straight from the repository's changelog.",
  alternates: {
    canonical: "/log",
    types: feedAlternates,
  },
};

// Every round's PR numbers are real, and linking them is the strongest
// evidence on the page. Where that link points depends on when the round
// was built: rounds from the private predecessor repository link to their
// commit, because their pull requests could not be migrated and the same
// number here will eventually mean a different pull request entirely.
// See app/lib/pr-archive.js. Without a configured repo URL both render as
// plain badges, as they did while the project was private.
const repoUrl = getRepoUrl();

const ORIGIN_LABELS = {
  unsupervised: "Scheduled run, merged itself, nobody read it first",
  supervised: "A human triggered this run and could veto before merge",
  maintainer: "A human decided what and why; an assistant did the typing",
};

// A round's badge: a commit link for archived rounds, a pull request link
// for rounds built here, a plain badge when no repository is configured.
//
// Which era a round belongs to cannot be decided from its PR number. This
// repository restarted numbering at 1, so #1..#48 now mean two different
// things, and looking the number up in the archive would send the next
// forty-eight rounds to an unrelated predecessor commit -- a link returning
// 200 and pointing at the wrong change, which is worse than a dead one and
// invisible to any HTTP check. The first real round shipped as #1 and would
// have hit this immediately.
//
// `declaredOrigin` is the partition that actually holds: rounds predating the
// Origin field are exactly the 47 archived ones, and check-routes.sh pins that
// count so it cannot drift.
function RoundRef({ pr, archivedEra }) {
  if (!repoUrl) return <span className="log-pr">#{pr}</span>;

  const archived = archivedEra ? getArchivedPr(pr) : null;
  const href = archived
    ? `${repoUrl}/commit/${archived.commit_sha}`
    : `${repoUrl}/pull/${pr}`;

  return (
    <a className="log-pr" href={href} target="_blank" rel="noopener noreferrer">
      #{pr}
      <span className="visually-hidden">
        {archived
          ? " — commit for this round (opens in a new tab)"
          : " — pull request (opens in a new tab)"}
      </span>
    </a>
  );
}

function Field({ label, children }) {
  if (!children) return null;
  return (
    <p className="log-field">
      <span className="log-field-label">{label}</span>
      {inlineMarkdown(children)}
    </p>
  );
}

export default function BuildLog() {
  const entries = getBuildLog();
  const stats = getBuildLogStats();

  return (
    <div>
      <h1>The build log</h1>
      <p className="log-lead">
        Nobody hand-writes this page. It is parsed at build time from{" "}
        <code>CHANGELOG.md</code> in the repository, which is the same file
        the loop reads before deciding what to try next. That means it
        cannot flatter the record: what you see here is the record.
      </p>
      <p className="log-lead">
        Every round states a hypothesis before the work starts and a
        measured result after it lands. The interesting entries are the
        ones where the hypothesis was wrong. Search below to find them,
        or click any round heading to link straight to it &mdash; both
        the search and the round end up in the URL, so you can cite a
        single round rather than the whole page.
      </p>
      <p className="log-lead">
        The <code>#</code> badge on each round opens the change itself.
        Rounds built in this repository link to their pull request; rounds
        from the private repository this one succeeds link to their commit,
        because those pull requests could not be migrated and the same
        number here would eventually point at something else entirely.
        Their original descriptions, hypotheses included, are archived in{" "}
        <code>archive/prs.json</code>.
      </p>

      <dl className="log-stats">
        <div>
          <dt>Rounds shipped</dt>
          <dd>{stats.rounds}</dd>
        </div>
        <div>
          <dt>Distinct changes</dt>
          <dd>{stats.changes}</dd>
        </div>
        <div>
          <dt>Pull requests</dt>
          <dd>{stats.prs}</dd>
        </div>
      </dl>

      <LogFilter total={entries.length} />

      <section
        id="build-log-results"
        aria-labelledby="build-log-results-label"
      >
        <h2 id="build-log-results-label" className="visually-hidden">
          Build log results
        </h2>
        <ol id="build-log-entries" className="log-list">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="log-entry"
              id={entry.id}
              data-log-entry
              // Exposed so the route checks can assert each round links to the
              // right kind of target. Without it the two eras are
              // indistinguishable in the rendered markup, and the wrong-link
              // failure is silent by construction.
              data-era={entry.declaredOrigin ? "current" : "archive"}
            >
            <div className="log-meta">
              {/* A real heading, so screen-reader heading navigation
                  walks the log round by round rather than landing in a
                  flat list of change titles. The heading is also the
                  round's permalink: the anchor ids already existed, but
                  nothing exposed them, so citing one round meant sending
                  someone the whole page and telling them to scroll. */}
              <h2 className="log-round">
                <a className="log-round-link" href={`#${entry.id}`}>
                  Round {entry.number}
                  <span className="visually-hidden"> — copy link to this round</span>
                </a>
              </h2>
              <span className="log-date">
                {entry.unreleased ? (
                  "Unreleased"
                ) : (
                  <time dateTime={entry.date}>{entry.date}</time>
                )}
              </span>
              {/* How much of this round a human saw before it landed. Rounds
                  that predate the field inherit "supervised" and say so with
                  a title, rather than being edited to claim they declared it. */}
              <span
                className={`log-origin log-origin-${entry.origin}`}
                title={
                  entry.declaredOrigin
                    ? ORIGIN_LABELS[entry.origin]
                    : `${ORIGIN_LABELS[entry.origin]} (predates the Origin field)`
                }
              >
                {entry.origin}
              </span>
              {entry.prs.map((pr) => (
                <RoundRef key={pr} pr={pr} archivedEra={!entry.declaredOrigin} />
              ))}
            </div>

            {entry.intro ? (
              <p className="log-intro">{inlineMarkdown(entry.intro)}</p>
            ) : null}

            {entry.changes.map((change, index) => (
              <div className="log-change" key={index}>
                {change.title ? (
                  <h3 className="log-change-title">
                    {inlineMarkdown(change.title)}
                  </h3>
                ) : null}
                <Field label="Hypothesis">{change.hypothesis}</Field>
                <Field label="Change">{change.change}</Field>
                {(change.notes || []).map((note, noteIndex) => (
                  <p className="log-note" key={noteIndex}>
                    {inlineMarkdown(note)}
                  </p>
                ))}
              </div>
            ))}

            {entry.notes.map((note, index) => (
              <p className="log-note" key={index}>
                {inlineMarkdown(note)}
              </p>
            ))}

            <div className="log-outcome">
              <Field label="Guardrails">{entry.guardrails}</Field>
              <Field label="Result">{entry.result}</Field>
            </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
