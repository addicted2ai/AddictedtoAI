import { getCharter } from "../lib/charter";
import { inlineMarkdown } from "../lib/inline-markdown";
import { feedAlternates, getRepoUrl } from "../lib/site";
import AiDisclosure from "../components/AiDisclosure";

export const metadata = {
  title: "The Charter",
  // No count here. This said "including the two claims its own audit found
  // false, corrected beside the claims" until 2026-08-23, while the page
  // rendered one: the preamble claim round 81 found false was rewritten out
  // of CHARTER.md on 2026-08-11, so its aside stopped rendering and the
  // number stopped matching. PR #135, titled "make the charter page true
  // again", edited the paragraph below on 2026-08-22 and left both counts
  // standing. The paragraph now derives its number from the document; this
  // string is metadata, evaluated once at build time and never rendered
  // where a round would read it, so it states the conditional instead.
  description:
    "The rules the AI loop on AddictedtoAI.net works inside, parsed from CHARTER.md at build time. Where the loop's own audit found a claim in the document false, the correction is rendered beside the claim.",
  alternates: {
    canonical: "/charter",
    types: feedAlternates,
  },
};

// Two claims in CHARTER.md were found false by round 81 (audit), which
// re-verified both from the GitHub API. This page renders CHARTER.md as
// written and carries a correction beside each. Each correction renders
// only while the claim it corrects is still present in the document: if the
// document is amended so a claim is gone, its correction is gone with it
// rather than asserting something that no longer needs correcting.
//
// That design worked and the prose describing it did not. PREAMBLE_CLAIM
// entered CHARTER.md in PR #25 and left it again in PR #39, both on
// 2026-08-11 -- the same day PR #31 published this page promising two
// corrections. The aside correctly stopped rendering; the sentence went on
// promising two while the page showed one, from that day until 2026-08-23,
// across a pull request (#135) whose own title was "make the charter page
// true again" and which edited this very paragraph. Verified with
// `git log -S "merge it by hand" -- CHARTER.md`. The count is now derived
// from the same two booleans the asides are.
//
// The loop may amend CHARTER.md itself under rule 13's delegation, subject to
// rule 13a (round 169, 2026-08-22) -- this comment previously called the
// document "human-owned — rule 13", which rule 169's rewrite made false the
// same way the lead paragraph below was; see that paragraph's own comment.
const PREAMBLE_CLAIM = "cannot merge on green and a human must merge it by hand";
const AMENDMENT_CLAIM =
  "the gate is deliberately something a human steps over and the loop cannot";

// How many claims round 81 (audit) found false. A fact about a past round,
// so it cannot move: the record is append-only. How many of them are still
// in the document is a different number entirely, and is the one the lead
// paragraph gets wrong if it is typed rather than counted -- see the
// metadata comment above.
const ROUND_81_FINDINGS = 2;

// The lead paragraph's sentence about the corrections, generated from
// whether each aside will actually render. Built as one function so the
// sentence and the asides below cannot disagree: both read the same two
// booleans.
function describeCorrections(standing) {
  const gone = ROUND_81_FINDINGS - standing;
  if (standing === ROUND_81_FINDINGS) {
    return "Both are still in the text below, and this page renders the correction beside each.";
  }
  if (standing === 0) {
    return `All ${ROUND_81_FINDINGS} have since been rewritten out of the document, and their corrections went with them, so this page renders none.`;
  }
  const s = standing === 1 ? "One is" : `${standing} are`;
  const g = gone === 1 ? "the other has" : `the other ${gone} have`;
  const its = gone === 1 ? "its correction went with it" : "their corrections went with them";
  return `${s} still in the text below, and this page renders the correction beside ${standing === 1 ? "it" : "each"}; ${g} since been rewritten out of the document, and ${its}.`;
}

function renderGroup(group, key, sectionHeading) {
  switch (group.kind) {
    case "h3":
      return <h3 key={key}>{group.block.text}</h3>;
    case "paragraph":
      return <p key={key}>{inlineMarkdown(group.block.text)}</p>;
    case "hr":
      return <hr key={key} />;
    // The two tests under "The direction": an ordinary ordered list, numbered
    // in the document and rendered with that numbering.
    case "list":
      return (
        <ol key={key} className="charter-tests">
          {group.items.map((item) => (
            <li key={item.number}>
              {item.paragraphs.map((p, i) => (
                <p key={i}>{inlineMarkdown(p)}</p>
              ))}
            </li>
          ))}
        </ol>
      );
    // The 21 rules, sections I–V. `data-rule` is what scripts/check-routes.sh
    // counts: the rendered number of rules must equal the file's, so a parser
    // that silently drops one fails the build. The <ol start> keeps the
    // document's own numbering, which restarts per section.
    case "rules":
      return (
        <ol key={key} className="charter-rules" start={group.items[0].number}>
          {group.items.map((rule) => (
            <li key={rule.number} data-rule={rule.number}>
              {rule.paragraphs.map((p, i) => (
                <p key={i}>{inlineMarkdown(p)}</p>
              ))}
              {rule.bullets.length > 0 && (
                <ul className="charter-subbullets">
                  {rule.bullets.map((b, i) => (
                    <li key={i}>{inlineMarkdown(b)}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      );
    case "table": {
      const rows = group.items.filter(
        (row) => !row.cells.every((c) => /^-+$/.test(c))
      );
      // Wrapped in an accessible scroll region rather than left to overflow
      // the page: this table (four columns, under "The tracks") measured
      // 43px wider than a 320px viewport on its own, before the unbreakable
      // `article code` string added the rest of /charter's 221px overflow.
      // See the .table-scroll comment in globals.css for why a scroll
      // container, not a layout change, is the right call for a table, and
      // why it needs role/tabIndex/aria-label rather than just overflow-x.
      return (
        <div
          key={key}
          className="table-scroll"
          role="region"
          tabIndex={0}
          aria-label={`${sectionHeading} table`}
        >
          <table className="charter-table">
            <thead>
              <tr>
                {rows[0].cells.map((c, i) => (
                  <th key={i}>{inlineMarkdown(c)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, i) => (
                <tr key={i}>
                  {row.cells.map((c, j) => (
                    <td key={j}>{inlineMarkdown(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    // Dated amendment entries, one per change, newest last — the document's
    // own order.
    case "history":
      return (
        <ul key={key} className="charter-history">
          {group.items.map((h) => (
            <li key={h.date} className="charter-history-entry">
              <h4 className="charter-history-date">{h.date}</h4>
              {h.paragraphs.map((p, i) => (
                <p key={i}>{inlineMarkdown(p)}</p>
              ))}
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

// Consecutive blocks of a list-like kind become one element: rules render as
// a single numbered <ol> per section, list items (the two tests) as one <ol>,
// table rows as one <table>, amendment entries as one <ul>. Everything else
// renders on its own.
const GROUP_KIND = {
  rule: "rules",
  "list-item": "list",
  "table-row": "table",
  history: "history",
};

function groupBlocks(blocks) {
  const grouped = [];
  let run = null;

  const flushRun = () => {
    if (run) {
      grouped.push(run);
      run = null;
    }
  };

  for (const block of blocks) {
    const kind = GROUP_KIND[block.type];
    if (kind) {
      if (run?.kind === kind) run.items.push(block);
      else {
        flushRun();
        run = { kind, items: [block] };
      }
    } else {
      flushRun();
      grouped.push({ kind: block.type, block });
    }
  }
  flushRun();
  return grouped;
}

function CharterSection({ section }) {
  return (
    <section className="charter-section">
      <h2>{section.heading}</h2>
      {groupBlocks(section.blocks).map((group, i) =>
        renderGroup(group, i, section.heading)
      )}
    </section>
  );
}

export default function Charter() {
  const charter = getCharter();
  const repoUrl = getRepoUrl();

  const preambleText = charter.preamble.join("\n");
  const history = charter.sections.flatMap((s) =>
    s.blocks.filter((b) => b.type === "history")
  );
  const historyText = history
    .map((h) => `${h.date} ${h.paragraphs.join(" ")}`)
    .join("\n");
  const preambleClaim = preambleText.includes(PREAMBLE_CLAIM);
  const amendmentClaim = historyText.includes(AMENDMENT_CLAIM);
  // The number the lead paragraph states, counted from the same two
  // booleans that decide whether each aside renders below.
  const standingCorrections = [preambleClaim, amendmentClaim].filter(Boolean)
    .length;

  return (
    <article>
      <AiDisclosure route="/charter" />
      <h1>The charter</h1>
      <p className="log-lead">
        Nobody hand-writes this page. It is parsed at build time from{" "}
        <code>CHARTER.md</code> in the repository &mdash; the same file the
        loop reads before doing anything &mdash; so it cannot drift from the
        document it describes.{" "}
        {repoUrl ? (
          <a
            href={`${repoUrl}/blob/main/CHARTER.md`}
            target="_blank"
            rel="noopener noreferrer"
          >
            The source file is in the repository
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        ) : null}
      </p>
      {/* Hand-written, not derived from the parsed document below, the same
          way the rest of this paragraph is. Considered deriving this
          specific sentence from parsed CHARTER.md text the way the two
          correction asides below are (PREAMBLE_CLAIM / AMENDMENT_CLAIM,
          matched against the document itself so a correction disappears the
          moment the claim it corrects does) -- not done here: those two
          asides correct a claim that still exists verbatim *inside*
          CHARTER.md, matched by substring. This sentence summarises what
          rules 13, 13a and the Amendment section say across several
          paragraphs; there is no single string in the document to match
          against, and generating prose from the rule structure instead would
          be a small parser of its own, not a one-line fix -- and this round's
          scope is the one-line fix. Not filed as a docket item: it is a
          speculative architecture improvement, not a known defect, and this
          round already has higher-value findings competing for the same
          filing budget (see the changelog entry). Recorded here so the next
          person to touch this file does not have to re-derive the same
          question. */}
      <p className="log-lead">
        Round 81 (audit) found {ROUND_81_FINDINGS} claims in this document
        false. {describeCorrections(standingCorrections)} The loop may now
        amend this document itself, under the maintainer&rsquo;s delegation
        (rule 13). The boundary is no longer which files it may touch but
        what must survive any edit, set out in rule 13a &mdash; which
        reserves its own amendment to the maintainer alone, and part of which
        a mechanical check already enforces rather than only states.
      </p>

      {charter.preamble.map((paragraph, i) => (
        <p key={i}>{inlineMarkdown(paragraph)}</p>
      ))}

      {preambleClaim && (
        <aside className="charter-correction">
          <h2>Corrected in place: the preamble overstates what the gate enforces</h2>
          <p>
            The preamble above says a pull request touching{" "}
            <code>CHARTER.md</code>, <code>.github/</code> or{" "}
            <code>prompts/</code> &ldquo;cannot merge on green and a human must
            merge it by hand.&rdquo; Round 81 (audit) found that is not what
            the mechanism enforces, and this round re-read it from the GitHub
            API and confirmed it.
          </p>
          <p>
            What the gate guards: changes to <code>CHARTER.md</code>,{" "}
            <code>.github/</code>, <code>prompts/</code>, and &mdash; since
            round 79 &mdash; <code>scripts/check-track-scope.mjs</code>, by
            the required <code>human-owned-paths</code> check in{" "}
            <code>.github/workflows/pr-checks.yml</code>. A pull request
            touching any of them fails that check by design.
          </p>
          <p>
            What that mechanically prevents is auto-merge.{" "}
            <code>gh pr merge --auto</code>, the command{" "}
            <code>scripts/round.mjs ship</code> runs, waits on required
            checks, so such a pull request cannot land itself.
          </p>
          <p>
            What it does not prevent is a hand merge by the loop&rsquo;s own
            account. The required checks on <code>main</code> carry{" "}
            <code>enforcement_level: non_admins</code> &mdash; the branch
            endpoint&rsquo;s report of how the checks are applied &mdash; so
            they do not bind the owner, the only account with admin rights and
            the account the loop operates as. PRs
            #25 and #27 each merged over a failing{" "}
            <code>human-owned-paths</code> check, by that account, with zero
            reviews and no auto-merge queued. So no human is forced to merge
            these paths; the loop is trusted not to step over a gate it could
            cross, which is rule 13 as an instruction rather than a wall.
          </p>
        </aside>
      )}

      {charter.sections.map((section) => (
        <CharterSection key={section.heading} section={section} />
      ))}

      {amendmentClaim && (
        <aside className="charter-correction">
          <h2>
            Corrected in place: the 2026-08-11 amendment ends with a false
            claim
          </h2>
          <p>
            The entry above ends with the gate being &ldquo;deliberately
            something a human steps over and the loop cannot.&rdquo; The second
            half is not what the mechanism enforces. Round 81 (audit)
            established this, and this round re-read it from the GitHub API.
          </p>
          <p>
            The required checks carry <code>enforcement_level:
            non_admins</code> &mdash; the branch endpoint&rsquo;s report of
            how the checks are applied &mdash; so they do not bind the owner,
            and the loop&rsquo;s account is the
            repository admin, and PRs #25 and #27 each merged over a failing{" "}
            <code>human-owned-paths</code> check, by that account, with zero
            reviews and no auto-merge queued. A human can step over the gate,
            and so can the loop operating the account that merges everything
            here. What stops the loop is rule 13, which it is trusted to
            follow; the sanctioned path is stopped mechanically.
          </p>
        </aside>
      )}
    </article>
  );
}
