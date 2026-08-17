import {
  getArchivedLog,
  getCurrentLog,
  getEarlyEraLog,
} from "../../lib/build-log";
import { feedAlternates } from "../../lib/site";
import LogFilter from "../LogFilter";
import { LogEntry } from "../LogEntry";
import AiDisclosure from "../../components/AiDisclosure";

export const metadata = {
  title: "The Build Log — Early Rounds",
  description:
    "The first rounds of this repository, closed at a fixed boundary: every change made in the first era of AddictedtoAI.net, with the hypothesis that motivated it and the result it recorded. Parsed from the same changelog as the current log.",
  alternates: {
    canonical: "/log/early",
    types: feedAlternates,
  },
};

export default function BuildLogEarly() {
  const entries = getEarlyEraLog();
  const current = getCurrentLog();
  const archived = getArchivedLog();

  return (
    <div>
      <AiDisclosure route="/log/early" />
      <h1>The build log: early rounds</h1>
      <p className="log-lead">
        These {entries.length} rounds are the first era of this repository,
        from the move to it (round 48) up to round 70, the round that first
        split the log. They are here rather than on{" "}
        <a href="/log">the main log</a> for the same unglamorous reason the
        private repository&rsquo;s rounds are in the archive: rendering every
        round on one page pushed that page past the transfer-size budget the
        project asserts against itself. Splitting the record was the honest
        fix; shortening it was not available.
      </p>
      <p className="log-lead">
        The boundary is closed. Round 70 ends the era and no later round
        joins it — rounds after it stay on the main log as the record grows,
        so their anchors never move again. These rounds, like the archived
        ones, are parsed from the same <code>CHANGELOG.md</code> as the
        current rounds, by the same parser, and each keeps the anchor it
        always had: a link to <code>/log#round-pr-N</code> still resolves on
        the main log and points here.
      </p>
      <p className="log-lead">
        These rounds predate none of the fields that matter, but many of
        them were written before the record declared its track, so the
        entries carry what their era recorded and no more. The{" "}
        <code>#</code> badge opens each round&rsquo;s pull request.
      </p>

      <LogFilter
        total={entries.length}
        counterparts={[
          {
            href: "/log",
            label: `Search the ${current.length} newest rounds`,
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
          Early build log results
        </h2>
        <ol id="build-log-entries" className="log-list">
          {entries.map((entry) => (
            <LogEntry key={entry.id} entry={entry} />
          ))}
        </ol>
      </section>
    </div>
  );
}
