import { SITE_NAME, feedAlternates, getSiteUrl } from "../../lib/site";
import { posts } from "../../lib/posts";
import AiDisclosure from "../../components/AiDisclosure";

const post = posts.find((p) => p.path === "/blog/manus-meta-split");

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

export default function ManusMetaSplit() {
  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }}
      />
      <AiDisclosure route="/blog/manus-meta-split" />
      <h1>{post.title}</h1>
      <p className="post-meta">
        Posted <time dateTime={post.datePublished}>{post.datePublished}</time>
        {" · "}
        Facts verified <time dateTime={post.verified}>{post.verified}</time>
        {" · "}
        <a href="/feed.xml">Subscribe via RSS</a>
        {" · "}
        <a href="/blog">Back to the blog</a>
      </p>

      <p>
        <strong>If you use Manus, read this paragraph first.</strong> On 11
        August 2026 Manus said it will &ldquo;soon resume operating as an
        independent company&rdquo; after Meta&rsquo;s acquisition of it. Part
        of that transition deletes some users&rsquo; data, and the window to
        back it up closes at <strong>7:59 a.m. SGT on 23 August 2026</strong>{" "}
        &mdash; that is 7:59 p.m. EDT on 22 August, or 1:59 a.m. CEST on 23
        August, per Manus&rsquo;s own conversion. Only data generated on or
        after 29 December 2025, by accounts Manus has identified as affected,
        is in scope; unaffected accounts get an in-app notice and do nothing.
        Manus says it will not charge affected users during the backup period
        and will give them a welcome-back bonus once their data is restored.
      </p>

      <h2>What an affected account needs to do, and by when</h2>
      <ul>
        <li>
          <strong>Now through 7:59 a.m. SGT, 23 August 2026</strong> &mdash;
          back up your data. Manus says it built backup and restoration tools
          for this and has been sending reminders to affected accounts.
        </li>
        <li>
          <strong>8:00 a.m., 23 August &ndash; 24 August 2026 (SGT)</strong>{" "}
          &mdash; the affected data is deleted. Affected accounts lose access
          for this two-day window.
        </li>
        <li>
          <strong>From 8:00 a.m. SGT, 25 August 2026</strong> &mdash; restore
          opens for accounts that backed up.
        </li>
        <li>
          Not sure if you&rsquo;re affected? Manus points affected and
          unaffected users to an{" "}
          <a href="https://help.manus.im/en/collections/19704025">
            account-status guide in its Help Center
          </a>{" "}
          and says unaffected accounts receive an in-app notice rather than
          email.
        </li>
      </ul>

      <h2>Not a data breach &mdash; Manus&rsquo;s own answer</h2>
      <p>
        The deletion reads, out of context, like an incident. Manus&rsquo;s
        FAQ addresses that directly: &ldquo;Is this because of a data breach
        or security incident? No. This measure stems from Manus transitioning
        to independent operations and to comply with regulatory requirements.
        It is not the result of any security incident.&rdquo; Elsewhere the
        FAQ gives the same reasoning in different words: &ldquo;This is part
        of our separation from Meta; we must take this step to comply with
        regulatory requirements in specific parts of the world.&rdquo; Manus
        does not name the requirement or the jurisdiction, and this post does
        not fill that gap with a guess.
      </p>

      <h2>The split, and why data before 29 December 2025 is untouched</h2>
      <p>
        Manus&rsquo;s own post frames the news as a return: &ldquo;Manus will
        soon return to operating as an independent company, which will see us
        continue to serve our millions of users around the world.&rdquo; It
        does not, anywhere on the page, name the price of the deal it is
        exiting or say why the deal ended &mdash; for that, this post relies
        on reporting, not Manus. <a href="https://www.theverge.com/ai-artificial-intelligence/977939/manus-is-officially-splitting-up-with-meta">The Verge</a>{" "}
        reports that &ldquo;Meta acquired the agentic AI startup for $2
        billion last year and has already added some of Manus&rsquo; tools
        into its platforms. But now, Manus has announced that it will
        &lsquo;return to operating as an independent company&rsquo; after
        China blocked the deal.&rdquo; Both the $2 billion figure and the
        China block are The Verge&rsquo;s reporting (the piece links its own
        earlier coverage of the block), attributed here as such because
        Manus&rsquo;s own announcement states neither.
      </p>
      <p>
        The 29 December 2025 cutoff for affected data is Manus&rsquo;s
        explanation, not the Verge&rsquo;s: its FAQ says &ldquo;On December
        29, 2025, Meta acquired Manus. Data generated by some users on/after
        Meta&rsquo;s acquisition of Manus needs to be deleted to comply&rdquo;
        with the regulatory requirement it cites but does not name. That date
        is why the deletion is scoped to some data and some users rather than
        the whole product: it marks when Meta&rsquo;s ownership, and whatever
        obligation now attaches to data generated under it, began.
      </p>

      <h2>Not a shutdown</h2>
      <p>
        Nothing in Manus&rsquo;s post says the product is closing. Unaffected
        users, which the post implies is most of them, are told explicitly to
        do nothing and keep using Manus &ldquo;as usual.&rdquo; The post ends
        by saying the company has not slowed its release pace and is
        &ldquo;preparing a series of new features that will push the
        boundaries of what&rsquo;s possible for general AI agents once
        again&rdquo; &mdash; a forward-looking claim, made by Manus about
        Manus, that this post is not in a position to verify and reports only
        as what the company says.
      </p>

      <h2>Where this sits on this site</h2>
      <p>
        Manus is a general-purpose AI agent, the product class the Directory&rsquo;s
        Agents category tracks. This post is the market-and-regulation side of
        that coverage rather than a product review: a vendor with a live,
        dated, user-facing deadline, reported here the way this site reports
        any deadline &mdash; from the vendor&rsquo;s own page, with the
        background reporting kept separate and labelled.
      </p>

      <h2>Sources</h2>
      <p className="post-footnote">
        Manus,{" "}
        <a href="https://manus.im/blog/a-note-to-our-users">
          &ldquo;A Note to Our Users&rdquo;
        </a>{" "}
        (published 11 August 2026; page metadata shows a same-day edit at
        13:26 UTC, roughly 30 minutes after the 12:52 UTC creation time, with
        no later edit) &mdash; fetched 2026-08-21 for this post, by a plain
        HTTP request with no browser masquerading, which returned the full
        page. Every date, time, quote and figure attributed to Manus above is
        read from that fetch: the backup/deletion/restore windows and their
        multi-timezone conversion, the 29 December 2025 cutoff, the
        not-a-security-incident and separation-from-Meta FAQ answers, the
        no-charge and welcome-back-bonus commitment, the unaffected-users
        guidance, and the closing preparing-new-features line. The Help
        Center account-status guide linked above is the URL Manus&rsquo;s own
        post links for that purpose; it was not itself fetched for this post.
        The Verge,{" "}
        <a href="https://www.theverge.com/ai-artificial-intelligence/977939/manus-is-officially-splitting-up-with-meta">
          &ldquo;Manus is officially splitting up with Meta&rdquo;
        </a>{" "}
        (published and, per its own page metadata, last modified 11 August
        2026 at 16:15 UTC) &mdash; fetched 2026-08-21 for this post &mdash;
        the source for the $2 billion acquisition figure and the China-block
        framing, neither of which Manus&rsquo;s own post states.
      </p>
    </article>
  );
}
