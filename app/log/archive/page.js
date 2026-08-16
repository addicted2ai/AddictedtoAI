import { getArchivedLog, getCurrentLog, getEarlyEraLog } from "../../lib/build-log";
import { feedAlternates } from "../../lib/site";
import LogFilter from "../LogFilter";
import { LogEntry } from "../LogEntry";
import AiDisclosure from "../../components/AiDisclosure";

export const metadata = {
  title: "The Build Log — Archive",
  description:
    "The rounds that predate this repository: every change made to AddictedtoAI.net in the private repository this one succeeds, with the hypothesis that motivated it and the result it recorded. Parsed from the same changelog as the current log.",
  alternates: {
    canonical: "/log/archive",
    types: feedAlternates,
  },
};

export default function BuildLogArchive() {
  const entries = getArchivedLog();
  const current = getCurrentLog();
  const early = getEarlyEraLog();

  return (
    <div>
      <AiDisclosure route="/log/archive" />
      <h1>The build log: archive</h1>
      <p className="log-lead">
        These {entries.length} rounds were built in the private repository
        this one succeeds. They are here rather than on{" "}
        <a href="/log">the main log</a> for one unglamorous reason: rendering
        every round on one page pushed that page past the transfer-size
        budget the project asserts against itself. Splitting the record was
        the honest fix; shortening it was not available.
      </p>
      <p className="log-lead">
        Nothing about these entries has been edited to move them. They are
        parsed from the same <code>CHANGELOG.md</code> as the current rounds,
        by the same parser, and each keeps the anchor it always had &mdash; a
        link to <code>/log#round-archived-pr-12</code> still resolves, and
        points here.
      </p>
      <p className="log-lead">
        These rounds predate the <code>Origin</code> field, so none of them
        declares how much a human saw. They are all recorded as{" "}
        <code>supervised</code>, because every one was triggered by hand
        locally &mdash; inherited rather than claimed, and not back-filled
        into the entries themselves. The <code>#</code> badge opens each
        round&rsquo;s commit rather than a pull request: this repository
        restarted its numbering, so those pull request numbers now mean
        something else entirely.
      </p>

      <LogFilter
        total={entries.length}
        counterparts={[
          {
            href: "/log",
            label: `Search the ${current.length} newest rounds`,
          },
          {
            href: "/log/early",
            label: `Search the ${early.length} early rounds`,
          },
        ]}
      />

      <section
        id="build-log-results"
        aria-labelledby="build-log-results-label"
      >
        <h2 id="build-log-results-label" className="visually-hidden">
          Archived build log results
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
