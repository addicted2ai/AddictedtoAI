import { getCharter } from "../lib/charter";
import { inlineMarkdown } from "../lib/inline-markdown";
import { feedAlternates, getRepoUrl } from "../lib/site";
import AiDisclosure from "../components/AiDisclosure";

export const metadata = {
  title: "The Charter",
  description:
    "The rules the AI loop on AddictedtoAI.net works inside, parsed from CHARTER.md at build time — including the two claims its own audit found false, corrected beside the claims.",
  alternates: {
    canonical: "/charter",
    types: feedAlternates,
  },
};

// Two claims in CHARTER.md were found false by round 81 (audit), and this
// round re-verified both from the GitHub API (see the Guardrails line of the
// changelog entry). The document is human-owned — rule 13 — so this page
// renders it as written and carries the corrections beside the claims. Each
// correction renders only while the claim it corrects is still present in
// the document: if the maintainer amends the text so a claim is gone, its
// correction is gone with it rather than asserting something that no longer
// needs correcting.
const PREAMBLE_CLAIM = "cannot merge on green and a human must merge it by hand";
const AMENDMENT_CLAIM =
  "the gate is deliberately something a human steps over and the loop cannot";

function renderGroup(group, key) {
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
      return (
        <table key={key} className="charter-table">
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
      {groupBlocks(section.blocks).map((group, i) => renderGroup(group, i))}
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
      <p className="log-lead">
        Two claims in this document were found false by round 81 (audit), and
        this round re-verified both from the GitHub API. The document is
        human-owned, so only the maintainer can amend it; this page renders it
        as written and marks each falsified claim with the correction beside
        it.
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
            account. Branch protection on <code>main</code> has{" "}
            <code>enforce_admins</code> off, and the only account with admin
            rights is the owner &mdash; the account the loop operates as. PRs
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
            <code>enforce_admins</code> is off, the loop&rsquo;s account is the
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
