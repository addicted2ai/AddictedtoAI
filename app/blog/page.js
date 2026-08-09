import { getSiteUrl } from "../lib/site";

export const metadata = {
  title: "How This Site Builds Itself",
  description:
    "AddictedtoAI.net is maintained by a scheduled, hypothesis-driven propose-build-measure loop instead of manual redesigns. Here's how the loop, guardrails, and review process work.",
  alternates: {
    canonical: "/blog",
  },
};

const postJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "How this site builds itself",
  description:
    "AddictedtoAI.net is maintained by a scheduled, hypothesis-driven propose-build-measure loop instead of manual redesigns. Here's how the loop, guardrails, and review process work.",
  datePublished: "2026-08-09",
  author: { "@type": "Organization", name: "AddictedtoAI" },
  publisher: { "@type": "Organization", name: "AddictedtoAI" },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${getSiteUrl()}/blog`,
  },
};

export default function Blog() {
  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }}
      />
      <h1>How this site builds itself</h1>
      <p className="post-meta">Posted 2026-08-09</p>

      <p>
        Nobody manually redesigns AddictedtoAI.net. Instead, a scheduled
        job reads a changelog, picks one thing to try, ships it, and
        writes down what it expected to happen &mdash; every week, in
        public.
      </p>

      <h2>The loop</h2>
      <p>
        A GitHub Action runs on a schedule (and can be triggered by hand
        to test it). Each run reads <code>CHANGELOG.md</code> in full:
        the north-star metric this site is optimized for
        (returning-visitor rate), the per-section metrics for blog,
        directory, projects, and demos, the guardrails that must never
        regress, and the complete log of what's already been tried,
        including what didn't work. From that, it picks exactly one
        small, testable change &mdash; preferring things not yet tried,
        or a revision of something that underperformed &mdash; states a
        hypothesis for what metric should move and why, implements the
        change on a branch, and opens a pull request with that
        hypothesis written into the description.
      </p>

      <h2>The guardrails</h2>
      <p>
        Every pull request, including the loop's own, has to clear the
        same automated gate before it's mergeable: Lighthouse
        performance, accessibility, and SEO scores all at or above
        0.85; zero net-new broken links; no failed deploy or rollback.
        Guardrails passing doesn't mean a PR merges itself, though.
        Anything that touches site copy tone, adds a new top-level
        section, or shifts the design direction gets flagged explicitly
        for a human to look at, on top of the automated checks.
      </p>

      <h2>What's shipped so far</h2>
      <ul>
        <li>
          Real entry points on the homepage &mdash; four section cards
          replacing placeholder copy, so landing on <code>/</code> gives
          visitors an actual reason to click into a section.
        </li>
        <li>
          A curated tool directory &mdash; real AI tools, grouped by
          category, replacing the placeholder note that used to sit at{" "}
          <code>/directory</code>.
        </li>
        <li>
          An interactive Tool Finder on <code>/demos</code> &mdash; a
          small quiz that recommends tools from that same directory, so
          Demos has something to actually finish and replay instead of
          another placeholder.
        </li>
      </ul>
      <p>
        Each of those shipped with a stated hypothesis and a guardrail
        result in the changelog; whether they actually moved their
        metric gets checked and logged the following week, failures
        included.
      </p>

      <h2>Follow along</h2>
      <p>
        The full history &mdash; hypotheses, what shipped, and the
        results once they're measured, failures included &mdash; lives
        in <code>CHANGELOG.md</code>, right next to the code it
        describes. It's the loop's memory: every run reads it before
        deciding what to try next, so it's also the most honest record
        of what's actually worked on this site so far.
      </p>
    </article>
  );
}
