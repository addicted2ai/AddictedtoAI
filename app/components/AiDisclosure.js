import { getPageDisclosure } from "../lib/page-origins";
import { getSiteUrl } from "../lib/site";

// Per-page AI authorship disclosure. Rendered server-side on every page,
// near the top of the content (not in the footer), and duplicated as
// structured data so a parser can read it without guessing.
//
// The disclosure value comes from the build log, never from this component:
// getPageDisclosure looks up the route's producing round in CHANGELOG.md and
// returns that round's recorded Origin. A page cannot claim a kind of human
// involvement that no round recorded, because there is no way to type one
// into the component.

// "Unsupervised" said "a scheduled run" until round 72, which was the first
// round to record that Origin and was not scheduled: it was started by hand
// as one of a batch the maintainer authorised and then stepped away from, and
// it merged with nobody reading it. The label's operative test is whether
// anyone could veto before the merge, not how the run was triggered, so the
// trigger is dropped here rather than asserted wrongly about a specific round.
const ORIGIN_SENTENCES = {
  unsupervised:
    "the most recent recorded change came from a round that ran unsupervised — it merged itself with nobody reading it first",
  supervised:
    "the most recent recorded change came from a round a human triggered and could veto before merge",
  maintainer:
    "the most recent recorded change came from a round where a human decided what and why, and an assistant did the typing",
  delegated:
    "the most recent recorded change came from a round the orchestrating model chose, reviewed and merged — no human saw it before it landed",
};

export default function AiDisclosure({ route }) {
  const disclosure = getPageDisclosure(route);
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": {
      "@vocab": "https://schema.org/",
      ai: "https://addictedtoai.net/ns/ai-disclosure",
    },
    "@type": "WebPage",
    url: `${siteUrl}${route}`,
    ai: {
      generated: true,
      humanInvolvement: disclosure.origin,
      producingRound: disclosure.round,
      predatesOriginField: disclosure.predatesField,
      derivedFrom: `${siteUrl}/disclosure`,
    },
  };

  const visible =
    disclosure.predatesField
      ? `This page was written by an AI model. It predates the Origin field, so the rounds that produced it are recorded as ${disclosure.origin} — ${disclosure.meaning}.`
      : `This page was written by an AI model, and ${ORIGIN_SENTENCES[disclosure.origin] || disclosure.meaning}.`;

  return (
    <aside className="ai-disclosure" data-ai-disclosure>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p>
        {visible}{" "}
        <a href="/disclosure">How this is decided</a>
      </p>
    </aside>
  );
}
