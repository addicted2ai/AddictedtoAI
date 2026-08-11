import { inlineMarkdown } from "../lib/inline-markdown";
import { getArchivedPr } from "../lib/pr-archive";
import { getRepoUrl } from "../lib/site";

// One round, rendered. Extracted from app/log/page.js when the log split
// across two pages: /log renders the current era and /log/archive renders
// the rounds that predate the Origin field. Both pages render a round the
// same way, and the markup is load-bearing — scripts/check-routes.sh counts
// `<li class="log-entry"` to recount the homepage's round-mention figures,
// and LogFilter.js searches `[data-log-entry]`. One copy, so the two pages
// cannot drift into rendering the record differently.

// Every round's PR numbers are real, and linking them is the strongest
// evidence on the page. Where that link points depends on when the round
// was built: rounds from the private predecessor repository link to their
// commit, because their pull requests could not be migrated and the same
// number here will eventually mean a different pull request entirely.
// See app/lib/pr-archive.js. Without a configured repo URL both render as
// plain badges, as they did while the project was private.
const repoUrl = getRepoUrl();

export const ORIGIN_LABELS = {
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
export function RoundRef({ pr, archivedEra }) {
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

// The round's date and origin badge, shared by the full entry and the stub
// so a reader gets the same header either way. `check-routes.sh` requires
// every dated round to expose a <time dateTime> on /log, which is why the
// stub carries this too rather than a plain string.
function RoundMeta({ entry, headingHref, linkLabel }) {
  return (
    <div className="log-meta">
      {/* A real heading, so screen-reader heading navigation
          walks the log round by round rather than landing in a
          flat list of change titles. The heading is also the
          round's permalink: the anchor ids already existed, but
          nothing exposed them, so citing one round meant sending
          someone the whole page and telling them to scroll. */}
      <h2 className="log-round">
        <a className="log-round-link" href={headingHref}>
          Round {entry.number}
          <span className="visually-hidden">{linkLabel}</span>
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
  );
}

export function LogEntry({ entry }) {
  return (
    <li
      className="log-entry"
      id={entry.id}
      data-log-entry
      // Exposed so the route checks can assert each round links to the
      // right kind of target. Without it the two eras are
      // indistinguishable in the rendered markup, and the wrong-link
      // failure is silent by construction.
      data-era={entry.declaredOrigin ? "current" : "archive"}
    >
      <RoundMeta
        entry={entry}
        headingHref={`#${entry.id}`}
        linkLabel=" — copy link to this round"
      />

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
  );
}

// An archived round's placeholder on /log. It exists so that a citation
// written before the split — `/log#round-archived-pr-12`, which the RSS feed
// has been emitting since the feed was built — still resolves to something
// that explains itself and points at the full entry. CHARTER.md rule 9:
// nothing published disappears silently, and a reader who followed a link is
// owed an explanation rather than a dead end.
//
// Deliberately NOT `class="log-entry"` and NOT `data-log-entry`: the stub
// carries no prose, so counting it as a searchable round would make the
// homepage's "N rounds say X" figure disagree with what the search finds.
// check-routes.sh recounts those figures by splitting on `<li class="log-entry"`
// and would silently include stubs if they shared the class.
export function LogStub({ entry }) {
  return (
    <li className="log-stub" id={entry.id}>
      <RoundMeta
        entry={entry}
        headingHref={`/log/archive#${entry.id}`}
        linkLabel=" — read this round in the archive"
      />
    </li>
  );
}
