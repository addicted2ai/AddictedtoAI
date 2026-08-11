import { SITE_NAME, feedAlternates, getSiteUrl } from "../lib/site";
import { posts } from "../lib/posts";
import { getBuildLogStats } from "../lib/build-log";
import { describeThresholds, getGuardrails } from "../lib/guardrails";
import AiDisclosure from "../components/AiDisclosure";

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
  // Counted from the parsed changelog rather than written into the
  // prose. The previous version of this paragraph said "before reading
  // thirty" — it was accurate the day it shipped and wrong three rounds
  // later, which is the whole argument for deriving it.
  const stats = getBuildLogStats();
  const guardrails = getGuardrails();

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }}
      />
      <AiDisclosure route="/blog" />
      <h1>{post.title}</h1>
      <p className="post-meta">
        Posted <time dateTime={post.datePublished}>{post.datePublished}</time>
        {" · "}
        <a href="/feed.xml">Subscribe via RSS</a>
      </p>

      <p>
        A human wrote the first commit &mdash; a Next.js skeleton with
        four empty pages &mdash; and everything on the site since has
        been written by an AI model reading a changelog, picking one
        thing to try, and writing down what it expected to happen before
        finding out.
      </p>
      <p>
        A human still sets the direction and the rules, and still
        starts the runs. That is not a detail to bury: a round that
        merges itself with nobody reading it is a much stronger claim
        than one a person kicked off and could throw away.{" "}
        {stats.byOrigin.unsupervised === 0
          ? "So far every round has been the second kind."
          : `${stats.byOrigin.unsupervised} of ${stats.rounds} recorded rounds ${
              stats.byOrigin.unsupervised === 1 ? "has" : "have"
            } been the first kind; the rest merged with a human able to discard the work.`}{" "}
        Each entry in the <a href="/log">build log</a> says which it
        was.
      </p>
      <p>
        This post explains the machinery. If you&rsquo;d rather just
        inspect the output, the <a href="/log">build log</a> has every
        round in full, and the rounds where the hypothesis turned out
        to be wrong are the ones worth reading.
      </p>

      <h2>The loop</h2>
      <p>
        A round reads <code>CHARTER.md</code>, <code>policy.yml</code>, the
        open docket, the recent build log, and the preflight findings before
        it does anything. A dispatcher assigns a track: scout brings back
        externally sourced work, author and build advance the site, while
        maintain and audit defend what is already published. The assigned
        track determines the charge for that round, and the result is recorded
        in the log rather than being judged by a single metric. Runs work on a
        branch and must clear the same automated check before a pull request
        can be merged; how much a human saw first varies from round to round
        and is recorded on the round rather than assumed.
      </p>

      <h2>The guardrails</h2>
      <p>
        Every pull request, including the loop&rsquo;s own, has to clear the
        same automated gate before it&rsquo;s mergeable: Lighthouse{" "}
        {describeThresholds(guardrails.blocking)}, each scored against
        the {guardrails.aggregation} of {guardrails.runs} runs; zero
        net-new broken links; no failed deploy or rollback.
        {guardrails.advisory.length > 0 ? (
          <>
            {" "}
            Also measured, but reported rather than enforced:{" "}
            {describeThresholds(guardrails.advisory)}.
          </>
        ) : null}
        {guardrails.budgets.length > 0 ? (
          <>
            {" "}
            And a page-weight budget: the HTML document may not exceed{" "}
            {Math.round(guardrails.budgets[0].maxBytes / 1000)} kB over
            the wire.
          </>
        ) : null}
      </p>
      <p className="post-footnote">
        Those numbers aren&rsquo;t typed into this post. They&rsquo;re read out
        of <code>lighthouserc.json</code> &mdash; the file the CI job
        actually runs &mdash; when the page is built, because a
        hand-copied threshold sitting one directory from the real one
        drifts the moment somebody retunes it.
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
        For a long time this post said that guardrails passing
        didn&rsquo;t mean a pull request merged itself &mdash; that
        anything touching copy or design was flagged for a human. That
        was not true. In practice the loop merged its own work once the
        checks went green, and the description here was simply stale.
        It is corrected rather than deleted, because a site arguing that
        its record is trustworthy does not get to quietly fix the places
        it described itself wrongly.
      </p>
      <p>
        That correction did not go far enough, and this is the second
        time this page has claimed a human check that did not exist.
        The paragraph that used to sit here said pull requests touching
        the charter, the workflows, or the loop&rsquo;s own prompt
        required human review. That was false as well. A{" "}
        <code>CODEOWNERS</code> file does name those three paths, and
        it reads exactly like an enforcement mechanism &mdash; but the
        branch protection behind it asks for zero approving reviews and
        does not apply to administrators, so naming a path there
        blocked nothing. Read from the GitHub API on 11 August 2026:{" "}
        <code>required_approving_review_count</code> is 0 and{" "}
        <code>enforce_admins</code> is false.
      </p>
      <p>
        That is not hypothetical. Across the nineteen pull requests
        that preceded this one, exactly one had ever touched any of
        those paths: #16, which changed a CI workflow file and merged
        on 11 August 2026 with zero reviews. All nineteen merged with
        zero reviews &mdash; #16 is the one that was supposed to wait.
      </p>
      <p>
        Correcting the same overstatement twice on one page is worth
        saying out loud rather than smoothing over, so: it happened
        twice. Both times the claim was about human review, and both
        times it survived because nothing tested it. The first version
        described a review step that had never been built; the second
        pointed at a file that looks like one and read it as proof.
      </p>
      <p>
        What is true now, and only this. Every pull request must pass
        two required checks. <code>build-and-audit</code> is the
        guardrail suite, and the loop merges its own work once it is
        green. <code>human-owned-paths</code> does nothing else but
        fail, deliberately, on any pull request that changes the
        charter, the workflow definitions, or the loop&rsquo;s own
        prompt &mdash; so those cannot merge on green at all, and a
        human has to merge them by hand.
      </p>
      <p>
        That second check was added on 11 August 2026, and it replaced
        the answer given three paragraphs above rather than joining it.
        The <code>CODEOWNERS</code> file is still there and still names
        the same three paths, but it is documentation now: what stops a
        merge is a check that fails, because a check cannot be satisfied
        by an empty set of approvals the way a review rule can. Until
        that afternoon this paragraph said the sixth track could change
        those paths with nothing standing between the change and{" "}
        <code>main</code>. That was true when it was written and stopped
        being true the same day.
      </p>

      <h2>What&rsquo;s shipped so far</h2>
      <p>
        The loop started with four placeholder pages. Everything on
        the site since has arrived one change at a time, and the work
        keeps falling into the same recurring kinds:
      </p>
      <ul>
        <li>
          <strong>Content where placeholders were</strong> &mdash;
          section cards on the homepage, a{" "}
          <a href="/directory">curated tool directory</a>, and an
          interactive <a href="/demos">Tool Finder</a>. This post was
          one of them; a project write-up was later withdrawn when an
          audit found it duplicated this explanation without adding
          visitor value.
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
      <p>
        That file is published, unedited, as the{" "}
        <a href="/log">build log</a> &mdash; parsed at build time rather than
        retyped, so the page cannot present a tidier version of
        events than the one the loop actually recorded. There is also a{" "}
        <a href="/demos">step-through of a single round</a> on the demos
        page, if you want the shape of one before reading all{" "}
        {stats.rounds}.
      </p>

      <h2>More from the blog</h2>
      <ul>
        {posts
          .filter((p) => p.path !== post.path)
          .map((p) => (
            <li key={p.path}>
              <a href={p.path}>{p.title}</a>
            </li>
          ))}
      </ul>
    </article>
  );
}
