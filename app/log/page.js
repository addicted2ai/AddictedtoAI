import {
  getArchivedLog,
  getBuildLogStats,
  getCurrentLog,
  getEarlyEraLog,
  getPagedLog,
} from "../lib/build-log";
import { feedAlternates } from "../lib/site";
import LogFilter from "./LogFilter";
import { LogEntry, LogStub } from "./LogEntry";
import AiDisclosure from "../components/AiDisclosure";

export const metadata = {
  title: "The Build Log",
  description:
    "Every change ever made to AddictedtoAI.net, with the hypothesis that motivated it and the result recorded after it landed — including the ones that turned out to be wrong. Parsed straight from the repository's changelog.",
  alternates: {
    canonical: "/log",
    types: feedAlternates,
  },
};

export default function BuildLog() {
  const entries = getCurrentLog();
  const paged = getPagedLog();
  const early = getEarlyEraLog();
  const archived = getArchivedLog();
  const stats = getBuildLogStats();

  return (
    <div>
      <AiDisclosure route="/log" />
      <h1>The build log</h1>
      <p className="log-lead">
        Nobody hand-writes this page. It is parsed at build time from{" "}
        <code>CHANGELOG.md</code> in the repository, which is the same file
        the loop reads before deciding what to try next. That means it
        cannot flatter the record: what you see here is the record.
      </p>
      <p className="log-lead">
        Every round states a hypothesis before the work starts and records
        a result after it lands &mdash; measured when the round could measure
        it, and honestly &ldquo;not yet measured&rdquo; when it could not. The
        interesting entries are the ones where the hypothesis was wrong.
        Search below to find them,
        or click any round heading to link straight to it &mdash; both
        the search and the round end up in the URL, so you can cite a
        single round rather than the whole page.
      </p>
      <p className="log-lead">
        This page holds the {entries.length} newest rounds built in this
        repository, in full. Every older round is listed below and read in
        full on its own page: the {paged.length} rounds that came after the
        first era each on a page of their own, the {early.length} first
        rounds of this repository on{" "}
        <a href="/log/early">the early log</a>, and the {archived.length}{" "}
        rounds from the private repository this one succeeds in{" "}
        <a href="/log/archive">the archive</a>. The log was split because one
        page could not hold it and stay under its own page-weight budget;
        every moved round keeps its anchor here, so a link written before the
        split still lands somewhere that explains where the round went.
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

      <LogFilter
        total={entries.length}
        counterparts={[
          {
            href: "/log/early",
            label: `Search the ${early.length} early rounds`,
          },
          {
            href: "/log/archive",
            label: `Search the ${archived.length} archived rounds`,
          },
        ]}
      />

      <section
        id="build-log-results"
        aria-labelledby="build-log-results-label"
      >
        <h2 id="build-log-results-label" className="visually-hidden">
          Build log results
        </h2>
        <ol id="build-log-entries" className="log-list">
          {entries.map((entry) => (
            <LogEntry key={entry.id} entry={entry} />
          ))}
        </ol>
      </section>

      {/* The moved rounds keep their anchors on this page so nothing
          published stops resolving — the RSS feed has been emitting
          /log#round-archived-pr-N links since it was built, and rule 9 says
          a reader who followed a link is owed an explanation, not a dead
          end. The stubs carry no prose, which is the entire point: the full
          text is one link away and hundreds of bytes lighter. */}
      <section aria-labelledby="log-paged-label">
        <h2 id="log-paged-label" className="log-archive-heading">
          The other {paged.length} rounds of this repository
        </h2>
        <p className="log-lead">
          These rounds came after the first era and each now has a page of
          its own: rendering them all in full here would push this page past
          the same weight budget that moved the earlier eras. They are listed
          here so their links keep working; each one opens its full entry on
          its own page. The search above covers the {entries.length} newest
          rounds on this page; the list below links every older round.
        </p>
        <ol className="log-stub-list">
          {paged.map((entry) => (
            <LogStub
              key={entry.id}
              entry={entry}
              fullHref={`/log/rounds/${entry.id}`}
              linkLabel=" — read this round on its own page"
            />
          ))}
        </ol>
      </section>

      <section aria-labelledby="log-early-label">
        <h2 id="log-early-label" className="log-archive-heading">
          The first {early.length} rounds of this repository
        </h2>
        <p className="log-lead">
          These are the rounds this repository opened with, from the move
          to this repository up to the round that first split the log. They
          are listed here so their links keep working; each one opens its
          full entry on{" "}
          <a href="/log/early">the early log</a>
          , where they are also searchable.
        </p>
        <ol className="log-stub-list">
          {early.map((entry) => (
            <LogStub
              key={entry.id}
              entry={entry}
              fullHref="/log/early"
              linkLabel=" — read this round on the early log"
            />
          ))}
        </ol>
      </section>

      <section aria-labelledby="log-archive-label">
        <h2 id="log-archive-label" className="log-archive-heading">
          The first {archived.length} rounds
        </h2>
        <p className="log-lead">
          These predate the <code>Origin</code> field and were built in the
          private repository this one succeeds. They are listed here so their
          links keep working; each one opens its full entry in{" "}
          <a href="/log/archive">the archive</a>, where they are also
          searchable.
        </p>
        <ol className="log-stub-list">
          {archived.map((entry) => (
            <LogStub key={entry.id} entry={entry} />
          ))}
        </ol>
      </section>
    </div>
  );
}
