import { getArchivedLog, getCurrentLog, getEarlyEraLog, getPagedLog } from "../../../lib/build-log";
import { LogEntry } from "../../LogEntry";
import AiDisclosure from "../../../components/AiDisclosure";

// One round, one page. /log renders only the newest rounds that fit its
// derived page-size block in full; the rest of the current era each live
// here, at a URL that is permanent for that round's life — the stub on /log
// links here, the anchor id is the round's own, and no future growth moves
// it. This is the shape round 70's stub mechanism generalises to: a
// citation never needs to know how much has been published since.

export function generateMetadata({ params }) {
  const entry = getPagedLog().find((e) => e.id === params.id);
  return {
    title: entry
      ? `Build log — Round ${entry.number}`
      : "The Build Log — One Round",
    description:
      "One round of AddictedtoAI.net in full: the hypothesis that motivated it, the change that shipped, and the result it recorded. Parsed straight from the repository's changelog.",
  };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getPagedLog().map((entry) => ({ id: entry.id }));
}

export default function LogRound({ params }) {
  const entry = getPagedLog().find((e) => e.id === params.id);
  if (!entry) return null; // dynamicParams=false makes this unreachable

  const current = getCurrentLog();
  const early = getEarlyEraLog();
  const archived = getArchivedLog();

  return (
    <div>
      <AiDisclosure route="/log/rounds/[id]" />
      <h1>
        Round {entry.number} in full
      </h1>
      <p className="log-lead">
        <a href="/log">The build log</a> holds the {current.length} newest
        rounds and lists every older one; this page is the full entry for
        round {entry.number}. The whole record is parsed from{" "}
        <code>CHANGELOG.md</code> in the repository: the{" "}
        {early.length} first rounds of this repository are on{" "}
        <a href="/log/early">the early log</a> and the {archived.length}{" "}
        predecessor rounds are in <a href="/log/archive">the archive</a>.
      </p>

      <ol className="log-list">
        <LogEntry entry={entry} />
      </ol>
    </div>
  );
}
