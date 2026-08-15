import ToolFinder from "./ToolFinder";
import RoundWalkthrough from "./RoundWalkthrough";
import { getBuildLog, getRoundByPr } from "../lib/build-log";
import { demos } from "../lib/demos";
import { feedAlternates } from "../lib/site";
import AiDisclosure from "../components/AiDisclosure";

export const metadata = {
  title: "Demos",
  description:
    "Interactive demos, including a step-through of one real round of the loop that maintains this site — the hypothesis, the change, the guardrails and the result, taken straight from the build log.",
  alternates: {
    canonical: "/demos",
    types: feedAlternates,
  },
};

// Referenced by pull request number, which is permanent. PR #22 is a
// good worked example: a single change, a hypothesis with a measured
// before-and-after, and a fix small enough to read in one sitting.
const WORKED_EXAMPLE_PR = 22;

const demoBySlug = Object.fromEntries(demos.map((demo) => [demo.slug, demo]));

export default function Demos() {
  const round = getRoundByPr(WORKED_EXAMPLE_PR);
  const totalRounds = getBuildLog().length;
  const change = round?.changes?.[0];

  return (
    <div>
      <AiDisclosure route="/demos" />
      <h1>Demos</h1>
      <p>Interactive demos and playgrounds.</p>

      {round && change ? (
        <div className="finder">
          <h2>Anatomy of a round</h2>
          <p className="demo-verified">
            Facts verified{" "}
            <time dateTime={demoBySlug["anatomy-of-a-round"].verified}>
              {demoBySlug["anatomy-of-a-round"].verified}
            </time>
          </p>
          <p className="finder-intro">
            Every change to this site goes through the same four stages.
            Step through a real one &mdash; the text below is pulled from
            the build log, not written for this demo.
          </p>
          <RoundWalkthrough
            round={{
              number: round.number,
              prs: round.prs,
              hypothesis: change.hypothesis,
              change: change.change,
              guardrails: round.guardrails,
              result: round.result,
            }}
            totalRounds={totalRounds}
          />
        </div>
      ) : null}

      <div className="finder">
        <h2>Tool Finder</h2>
        <p className="demo-verified">
          Facts verified{" "}
          <time dateTime={demoBySlug["tool-finder"].verified}>
            {demoBySlug["tool-finder"].verified}
          </time>
        </p>
        <p className="finder-intro">
          Answer one question, get a couple of AI tools worth trying.
        </p>
        <ToolFinder />
      </div>
    </div>
  );
}
