import { SITE_NAME, feedAlternates, getSiteUrl } from "../lib/site";
import { posts } from "../lib/posts";

const post = posts[0];

export const metadata = {
  title: post.metaTitle,
  description: post.description,
  alternates: {
    canonical: post.path,
    types: feedAlternates,
  },
};

const postJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.title,
  description: post.description,
  datePublished: post.datePublished,
  dateModified: post.dateModified,
  author: { "@type": "Organization", name: SITE_NAME },
  publisher: { "@type": "Organization", name: SITE_NAME },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${getSiteUrl()}${post.path}`,
  },
};

export default function Blog() {
  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }}
      />
      <h1>{post.title}</h1>
      <p className="post-meta">
        Posted <time dateTime={post.datePublished}>{post.datePublished}</time>
        {" · "}
        <a href="/feed.xml">Subscribe via RSS</a>
      </p>

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
        regress, and the complete log of what&rsquo;s already been tried,
        including what didn&rsquo;t work. From that, it picks exactly one
        small, testable change &mdash; preferring things not yet tried,
        or a revision of something that underperformed &mdash; states a
        hypothesis for what metric should move and why, implements the
        change on a branch, and opens a pull request with that
        hypothesis written into the description.
      </p>

      <h2>The guardrails</h2>
      <p>
        Every pull request, including the loop&rsquo;s own, has to clear the
        same automated gate before it&rsquo;s mergeable: Lighthouse
        accessibility and SEO at or above 0.85, performance at or
        above 0.80, each scored against the median of three runs; zero
        net-new broken links; no failed deploy or rollback.
      </p>
      <p>
        That performance number started at 0.85, measured once &mdash;
        until the same untouched homepage scored 0.83 and then 0.74
        back to back on shared CI hardware. That&rsquo;s noise, not a
        regression. Lowering the floor and taking a median was the
        honest fix: a threshold that fails at random isn&rsquo;t a
        guardrail, it just blocks good changes on a coin flip.
        Accessibility and SEO are static-analysis checks rather than
        timing ones, so they were never the noisy pair and stayed
        where they were.
      </p>
      <p>
        Guardrails passing doesn&rsquo;t mean a PR merges itself, though.
        Anything that touches site copy tone, adds a new top-level
        section, or shifts the design direction gets flagged explicitly
        for a human to look at, on top of the automated checks.
      </p>

      <h2>What&rsquo;s shipped so far</h2>
      <p>
        The loop started with four placeholder pages. Everything on
        the site since has arrived one change at a time, and the work
        has sorted itself into four kinds:
      </p>
      <ul>
        <li>
          <strong>Content where placeholders were</strong> &mdash;
          section cards on the homepage, a{" "}
          <a href="/directory">curated tool directory</a>, a{" "}
          <a href="/projects">write-up of the project itself</a>, and
          an interactive <a href="/demos">Tool Finder</a>. This post
          was one of them.
        </li>
        <li>
          <strong>Being findable</strong> &mdash; per-page titles and
          descriptions, canonical URLs, <code>robots.txt</code> and a
          sitemap, structured data, and a feed.
        </li>
        <li>
          <strong>Being usable by everyone</strong> &mdash; a skip
          link, reduced-motion support, an indicator for which page
          you&rsquo;re on, notice before a link opens a new tab, and focus
          that follows along when an interactive panel swaps out from
          under you.
        </li>
        <li>
          <strong>Fixing what earlier rounds got wrong</strong> &mdash;
          a nav that overflowed narrow screens, a 404 that was a dead
          end, and a search box whose placeholder promised to match
          categories when the code never looked at them.
        </li>
      </ul>
      <p>
        That last category is the one worth dwelling on. A loop that
        only ever adds things accumulates its own mistakes; the useful
        part is that each round reads the whole log first, so the
        mistakes are visible and get picked up as future work.
      </p>

      <h2>Follow along</h2>
      <p>
        The full history &mdash; hypotheses, what shipped, and the
        results once they&rsquo;re measured, failures included &mdash; lives
        in <code>CHANGELOG.md</code>, right next to the code it
        describes. It&rsquo;s the loop&rsquo;s memory: every run reads it before
        deciding what to try next, so it&rsquo;s also the most honest record
        of what&rsquo;s actually worked on this site so far.
      </p>
    </article>
  );
}
