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

// A round's badge: a commit link for archived rounds, a pull request link
// for rounds built here, a plain badge when no repository is configured.
function RoundRef({ pr }) {
  if (!repoUrl) return <span className="log-pr">#{pr}</span>;

  const archived = getArchivedPr(pr);
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
            <li key={entry.id} className="log-entry" id={entry.id} data-log-entry>
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
              {entry.prs.map((pr) => (
                <RoundRef key={pr} pr={pr} />
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
