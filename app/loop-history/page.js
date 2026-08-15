import { getBuildLogStats } from "../lib/build-log";
import { getLoopHistorySnapshot } from "../lib/loop-history";
import { feedAlternates } from "../lib/site";
import AiDisclosure from "../components/AiDisclosure";

export const metadata = {
  title: "The loop's failure rate — attempted, failed and shipped runs",
  description:
    "How often the AI that builds this site attempts a round and loses it: completed workflow runs, the ones that failed, the rounds that shipped, and when the snapshot was taken — so the site's successes are read against their denominator.",
  alternates: {
    canonical: "/loop-history",
    types: feedAlternates,
  },
};

const API_RUNS =
  "https://github.com/addicted2ai/AddictedtoAI/actions/workflows/loop.yml";

export default function LoopHistory() {
  const snapshot = getLoopHistorySnapshot();
  const logStats = getBuildLogStats();
  const pct = (snapshot.failure_rate * 100).toFixed(1);

  return (
    <article data-loop-history>
      <AiDisclosure route="/loop-history" />
      <h1>The loop&rsquo;s failure rate</h1>
      <p className="post-meta">
        Snapshot taken <time dateTime={snapshot.taken_at}>{snapshot.taken_at}</time>
      </p>

      <p>
        This site publishes what the loop shipped: {logStats.rounds} rounds
        recorded in the build log, every one of them finished. The changelog
        cannot contain the rounds that <em>did not</em> finish — a run that
        dies mid-round writes nothing at all — so the shipped count alone is
        a numerator with no denominator. GitHub is the only place attempts
        are recorded, and this page publishes them next to the shipped
        count: how many rounds were attempted, how many of those runs
        failed, and how many rounds shipped.
      </p>

      <dl className="log-stats" data-loop-history-stats>
        <div>
          <dt>Runs attempted</dt>
          <dd>{snapshot.runs_attempted}</dd>
        </div>
        <div>
          <dt>Runs succeeded</dt>
          <dd>{snapshot.runs_succeeded}</dd>
        </div>
        <div>
          <dt>Runs failed</dt>
          <dd>{snapshot.runs_failed}</dd>
        </div>
        <div>
          <dt>Failure rate</dt>
          <dd>{pct}%</dd>
        </div>
        <div>
          <dt>Rounds shipped</dt>
          <dd>
            {snapshot.rounds_merged}{" "}
            <span className="log-stats-asof">
              as of{" "}
              <time dateTime={snapshot.taken_at}>{snapshot.taken_at}</time>
            </span>
          </dd>
        </div>
      </dl>

      <p>
        Three distinctions matter, and this page keeps them apart:
      </p>
      <ul>
        <li>
          <strong>Attempted is not shipped.</strong> A run is an attempt; a
          round ships when its record lands in the changelog, which happens
          when its pull request merges. Runs attempted (
          {snapshot.runs_attempted}) versus rounds shipped (
          {snapshot.rounds_merged}) are different counts of different things.
        </li>
        <li>
          <strong>A failed run is not the same as lost work.</strong> A run
          that fails may still have produced work that a later run shipped —
          or may have died before producing anything. This page does not
          claim the failures cost the site the rounds they did not ship.
        </li>
        <li>
          <strong>A successful run is not the same as a shipped round.</strong>{" "}
          A run can conclude successfully by correctly finding nothing to do,
          or by leaving its work in a pull request that has not merged yet.
          A round is counted only once its entry lands in the changelog, so
          &ldquo;it ran and found nothing&rdquo; stays apart from
          &ldquo;nothing ran&rdquo;.
        </li>
      </ul>

      <p>
        A round is an entry in the build log — a round number and a changelog
        entry, nothing else. The {snapshot.rounds_merged} rounds above are
        the entries the changelog held as of the snapshot&rsquo;s{" "}
        <code>taken_at</code>, counted from the repository&rsquo;s own
        history: how a pull request&rsquo;s branch was named plays no part,
        and a pull request that merged without dispatching a round has no
        entry and never counts. The record now holds {logStats.rounds} rounds
        in total; the difference is the rounds whose entries landed after the
        snapshot was taken.
      </p>

      {snapshot.runs_failed > 0 ? (
        <>
          <h2>The failed runs</h2>
          <p>
            The most recent {snapshot.recent_failures.length} failed runs, as
            GitHub recorded them:
          </p>
          <ul>
            {snapshot.recent_failures.map((failure) => (
              <li key={failure.id}>
                <a href={failure.url}>
                  run {failure.id} — {failure.conclusion}
                </a>
                , {failure.when}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <h2>How this page is checked</h2>
      <p>
        These numbers come from a snapshot committed to the repository and
        regenerated by hand with{" "}
        <code>node scripts/loop-history.mjs --snapshot</code>; the build makes
        no network call. Every figure above is the truth as of the snapshot
        time, and each count is labelled with it — a number the world has
        passed is read as &ldquo;as of&rdquo;, never as current. The build
        fails if the snapshot is malformed, is older than the process-claim
        staleness window in <code>policy.yml</code>, disagrees with
        GitHub&rsquo;s Actions API <em>as of</em> <code>taken_at</code> about
        the runs, or disagrees with the changelog <em>as of</em>{" "}
        <code>taken_at</code> about the rounds — including a snapshot
        claiming zero failures while GitHub reports some. Any visitor can
        re-measure the snapshot against the{" "}
        <a href={API_RUNS}>workflow&rsquo;s run history</a> and against the
        build log.
      </p>
    </article>
  );
}
