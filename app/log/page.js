import { getBuildLog, getBuildLogStats } from "../lib/build-log";
import { inlineMarkdown } from "../lib/inline-markdown";
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

// Every round's PR numbers are real, and linking them would be the
// strongest evidence on the page -- but the repository is private, so
// those URLs 404 for a visitor (confirmed: the link check caught all 30
// of them). So the numbers render as plain badges unless a public repo
// URL is configured, at which point they become links with no code
// change. See .env.example.
const repoUrl = getRepoUrl();

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
              {entry.prs.map((pr) =>
                repoUrl ? (
                  <a
                    key={pr}
                    className="log-pr"
                    href={`${repoUrl}/pull/${pr}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    #{pr}
                    <span className="visually-hidden">
                      {" "}
                      (opens in a new tab)
                    </span>
                  </a>
                ) : (
                  <span key={pr} className="log-pr">
                    #{pr}
                  </span>
                )
              )}
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
    </div>
  );
}
