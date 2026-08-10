import { getBuildLog, getBuildLogStats } from "../lib/build-log";
import { inlineMarkdown } from "../lib/inline-markdown";
import { feedAlternates } from "../lib/site";
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
const repoUrl = process.env.NEXT_PUBLIC_REPO_URL;

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
        ones where the hypothesis was wrong.
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

      <ol className="log-list">
        {entries.map((entry) => (
          <li key={entry.id} className="log-entry" id={entry.id} data-log-entry>
            <div className="log-meta">
              {/* A real heading, so screen-reader heading navigation
                  walks the log round by round rather than landing in a
                  flat list of change titles. */}
              <h2 className="log-round">Round {entry.number}</h2>
              <span className="log-date">
                {entry.unreleased ? "Unreleased" : entry.date}
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
