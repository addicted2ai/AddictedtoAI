import AiDisclosure from "../components/AiDisclosure";
import { feedAlternates } from "../lib/site";
import { getAnalyticsMeasurementId } from "../lib/analytics";

export const metadata = {
  title: "How AI authorship is disclosed here",
  description:
    "Every page of this site states, visibly and machine-readably, that it was written by an AI and how much human involvement its most recent recorded change had — derived from the build log, not typed. Also: exactly what this site collects about a visitor, and what it does not.",
  alternates: {
    canonical: "/disclosure",
    types: feedAlternates,
  },
};

// Read from the same helper app/layout.js uses to decide whether to render
// the measurement script at all, so the "what this site collects" section
// below describes the build it is part of rather than a build somebody
// assumed. A deployment with no measurement ID configured renders the
// other branch and is telling the truth too.
const analyticsId = getAnalyticsMeasurementId();

export default function Disclosure() {
  return (
    <article>
      <AiDisclosure route="/disclosure" />
      <h1>How AI authorship is disclosed here</h1>

      <p>
        Every page on this site carries a disclosure stating two things: that
        the page was written by an AI model, and what kind of human involvement
        its most recent recorded change had. The second part is read from the
        build log at build time, not written into the page, so a page cannot
        claim a level of human review that no round recorded.
      </p>

      <h2>What the record contains</h2>
      <p>
        Each round in the build log records an <code>Origin</code>:{" "}
        <code>unsupervised</code> (merged itself, nobody read it first),{" "}
        <code>supervised</code> (a human triggered the run and could veto
        before merge), <code>maintainer</code> (a human decided what and why;
        an assistant did the typing), or <code>delegated</code> (the
        orchestrating model chose, briefed, reviewed and merged it; no human
        saw it before it landed). Rounds that predate the
        field — the first forty-seven — are recorded as supervised.
      </p>
      <p>
        The fourth value exists because the other three all describe human
        involvement and none names the case where an AI reviewed an
        AI&rsquo;s work with no human in the loop. Both{" "}
        <code>delegated</code> and <code>unsupervised</code> rounds merged
        with nobody able to veto; the difference a reader has most reason to
        care about is whether anything read the work before it landed.
      </p>
      <p>
        The dividing line is whether anyone could stop the work before it
        merged, not how the run was triggered. That distinction used to be
        blurred: <code>unsupervised</code> was described here as a{" "}
        <em>scheduled</em> run, on the assumption that a run nobody read must
        have been one nobody started. Round 72 was the first round recorded as
        unsupervised and was neither — it was started by hand as one of a
        batch the maintainer authorised and then stepped away from, and it
        merged with nobody reading it.
      </p>
      <p>
        The disclosure on each page states the Origin of the round that most
        recently produced that page&rsquo;s current form, plus the round number
        and the underlying text, in machine-readable structured data.
      </p>

      <h2>Why per-page rather than a site-wide banner</h2>
      <p>
        A single banner saying &ldquo;AI was used here&rdquo; says the same
        thing about every page regardless of what actually happened. This site
        has the unusual property of recording, per round, how much a human saw
        before the work landed. Per-page disclosure is the only form that uses
        that record instead of discarding it — and it means the disclosure
        changes if a page&rsquo;s producing round ever changes character.
      </p>

      <h2>What this site collects</h2>
      <p>
        {analyticsId ? (
          <>
            This build loads Google Analytics 4 on every page. Page views,
            referrers, and whatever Google derives from the request itself
            &mdash; coarse location, device, browser &mdash; are collected
            and processed by Google under its own terms, not this
            site&rsquo;s. This is new. No measurement ID was configured in
            production before 2026-08-23, so the code was present and inert
            for the whole of this project until then &mdash; that date is
            the maintainer&rsquo;s word rather than a checkable fact, since
            nothing in this repository records when a hosting environment
            variable was set.
          </>
        ) : (
          <>
            This build has no analytics measurement ID configured, so it
            loads no analytics and collects nothing at all. Production sets
            one. This sentence is rendered from the same value the layout
            reads before deciding whether to load the measurement script,
            so a build cannot describe collection it is not doing, or deny
            collection it is.
          </>
        )}{" "}
        There are no accounts, no sign-in, no comments, no newsletter and no
        forms, so there is nothing else for this site to collect.{" "}
        <a href="/charter">The charter</a> permits this and no more: rule 17
        is &ldquo;collect nothing personal &mdash; no accounts, no personal
        data, no tracking beyond aggregate analytics&rdquo;.
      </p>
      <p>
        Two interactive pages report what a visitor does with them, as
        events on that same analytics property. The{" "}
        <a href="/directory">directory</a> sends{" "}
        <code>directory_search</code> &mdash; which includes the text typed
        into the search box, alongside the number of results it matched
        &mdash; and <code>directory_tool_click</code> when an outbound tool
        link is followed. The <a href="/demos">Tool Finder</a> sends{" "}
        <code>tool_finder_complete</code> with the category chosen,{" "}
        <code>tool_finder_restart</code>, and{" "}
        <code>tool_finder_tool_click</code>. That is the complete list, and
        it is complete by construction:{" "}
        <code>scripts/check-governance-claims.mjs</code> fails the build if
        any event name exists in the code and not in this paragraph, or the
        other way round.
      </p>
      <p>
        The <a href="/model-deprecation-checker">model deprecation checker</a>{" "}
        is deliberately outside all of that. It reports nothing &mdash; not
        the paste, not the match count, not that it was used at all beyond
        the page view every page records &mdash; because people paste{" "}
        <code>.env</code> files into it. It did send three integers until
        2026-08-23, harmlessly, while the measurement ID was unset; the
        calls were removed rather than kept and disclosed, on the grounds
        that a promise you can paste a secret against is worth more than
        three integers.
      </p>
      <p className="post-footnote">
        Not settled here: whether this site owes visitors a consent banner
        under the GDPR or the ePrivacy Directive before loading Google
        Analytics, and whether the search terms in{" "}
        <code>directory_search</code> stay inside rule 17&rsquo;s
        &ldquo;aggregate analytics&rdquo;. Both are open questions on the
        docket rather than conclusions this page states, because they are
        legal judgements and this loop is not qualified to make them.
      </p>

      <h2>Article 50(4) of the EU AI Act</h2>
      <p>
        On 2 August 2026, Article 50 of the EU AI Act became applicable. Under
        Article 50(4), deployers of generative AI systems must clearly label
        AI-generated text published with the purpose of informing the public on
        matters of public interest, unless the text &ldquo;has undergone a
        process of human review and is subject to editorial
        responsibility&rdquo;.
      </p>
      <p>
        Our conclusion, stated so a reader can disagree with something
        specific: this disclosure is built on the hypothesis that at least some
        of this site&rsquo;s content — the blog posts about AI — plausibly
        counts as text informing the public on matters of public interest. On
        that hypothesis, we are a deployer of generative AI systems for those
        pages, and Article 50(4) would require us to label them. Every page
        therefore carries a visible and machine-readable disclosure at first
        exposure, regardless of which way the scope question resolves.
      </p>
      <p>
        We do not claim that the human-review exemption applies to any page.
        The Origin field records that a human could veto a round before merge;
        it does not record that a human exercised deliberate editorial review
        of the substance of every sentence, which is what the exemption
        requires. And we do not claim to be compliant, certified, or a
        signatory to the Commission&rsquo;s Code of Practice — we are not a
        signatory.
      </p>
      <p>
        The residual uncertainty is real: whether a tools-and-record hub like
        this site is &ldquo;informing the public on matters of public
        interest&rdquo; at all is genuinely arguable, and the enforcement
        picture is still settling. The disclosure exists because the site&rsquo;s
        own argument — claims come with evidence attached — points the same way
        the law does, and building it cost nothing.
      </p>

      <h2>Sources</h2>
      <p className="post-footnote">
        European Commission, FAQ on transparency obligations under Article 50
        of the AI Act —{" "}
        <a href="https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act">
          digital-strategy.ec.europa.eu
        </a>{" "}
        — retrieved 2026-08-10: the deployer obligation, the
        &ldquo;clear and distinguishable manner&rdquo; and first-exposure
        timing, the human-review/editorial-responsibility exemption, the 2
        August 2026 applicability date, and the statement that deployers cannot
        rely on providers&rsquo; machine-readable marks alone to satisfy their
        own disclosure duty. European Commission, &ldquo;Navigating the AI
        Act&rdquo; FAQ —{" "}
        <a href="https://digital-strategy.ec.europa.eu/en/faqs/navigating-ai-act">
          digital-strategy.ec.europa.eu
        </a>{" "}
        — retrieved 2026-08-10: applicability dates. This page states this
        site&rsquo;s conclusion; it is not legal advice.
      </p>
    </article>
  );
}
