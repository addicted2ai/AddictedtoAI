import { SITE_NAME, feedAlternates, getSiteUrl } from "../../lib/site";
import { posts } from "../../lib/posts";
import AiDisclosure from "../../components/AiDisclosure";

const post = posts.find((p) => p.path === "/blog/ultrafast-mode");

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

export default function UltrafastMode() {
  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }}
      />
      <AiDisclosure route="/blog/ultrafast-mode" />
      <h1>{post.title}</h1>
      <p className="post-meta">
        Posted <time dateTime={post.datePublished}>{post.datePublished}</time>
        {" · "}
        <a href="/feed.xml">Subscribe via RSS</a>
        {" · "}
        <a href="/blog">Back to the blog</a>
      </p>

      <p>
        On 13 August 2026, OpenAI previewed <strong>Ultrafast</strong>, a new
        service tier in the OpenAI API that runs{" "}
        <strong>GPT-5.6 Sol up to 14&times; faster than Standard
        processing</strong> &mdash; the model the announcement calls
        OpenAI&rsquo;s &ldquo;most intelligent model&rdquo;. Powered by
        Cerebras, it generates <strong>up to 750 output tokens per second</strong>.
        Ultrafast is <strong>not a general release</strong>: the page says it is
        &ldquo;available in a limited preview today to a select group of
        customers&rdquo;, that OpenAI will &ldquo;expand access as capacity
        grows&rdquo;, and that anyone interested can sign up to be notified when
        access expands. Every figure in this post is OpenAI&rsquo;s own, read
        off that page, which was fetched for this post.
      </p>

      <h2>The speed axis of the GPT-5.6 story</h2>
      <p>
        This site already covered the other half of the GPT-5.6 price-performance
        story:{" "}
        <a href="/blog/gpt-5-6-price-drop">
          the 30 July price cuts that made Luna the free default
        </a>
        . That post is the price axis &mdash; what the family costs. Ultrafast is
        the speed axis &mdash; how fast the flagship can be made to answer &mdash;
        and the two announcements share a line of reasoning. The price
        announcement argued that frontier performance has become affordable;
        the Ultrafast announcement argues that frontier speed has stopped
        requiring a tradeoff: &ldquo;Until now, getting real-time speed
        typically meant choosing a smaller or more specialized model.&rdquo;
        The page adds: &ldquo;Ultrafast points to progress in a new direction:
        more useful work per second.&rdquo;
      </p>
      <p>
        Both figures carry OpenAI&rsquo;s own &ldquo;up to&rdquo;. &ldquo;Up to
        14&times; faster&rdquo; and &ldquo;up to 750 output tokens per
        second&rdquo; are performance ceilings the company asserts for a
        preview running on its own stack with its own chosen customers; they
        are not measurements made here, and there is no published benchmark
        methodology on the page to reproduce them against.
      </p>

      <h2>OpenAI&rsquo;s flagship on a third party&rsquo;s chips</h2>
      <p>
        The structural change is where the inference runs. Cerebras &mdash; the
        wafer-scale chip company &mdash; is the inference provider for the tier:
        &ldquo;Ultrafast marks the next step in our partnership with
        Cerebras to bring ultra-low-latency inference to OpenAI&rsquo;s
        platform,&rdquo; the page says, and &ldquo;now, with GPT-5.6 Sol on
        Ultrafast mode, Cerebras is supporting OpenAI&rsquo;s most intelligent
        model, delivering up to 750 output tokens per second&rdquo;. A
        partnership history is implied by the phrase &ldquo;next step&rdquo;
        &mdash; this is not the first step of the two companies&rsquo;
        collaboration, and the post should not be read as if it were &mdash;
        but it is the first time OpenAI has said, in its own announcement,
        that a third party&rsquo;s hardware is serving its flagship model in
        its API.
      </p>

      <h2>The announcement states no price</h2>
      <p>
        One thing the page does not say: what Ultrafast costs. This is worth
        stating rather than skipping past, because this is a paid API tier,
        the company already sells a slower &ldquo;Fast mode&rdquo; for Sol at a
        premium over Standard, and a reader who has seen the price-drop post
        knows this family&rsquo;s price moves fast. There is no price, no
        per-token rate, and no billing detail anywhere in the announcement
        &mdash; only the limited-preview status and the signup link. That is
        what OpenAI chose to publish, so this post publishes no price either.
      </p>

      <h2>Who is in the preview</h2>
      <p>
        The page names four early customers, each with a quote. These are
        OpenAI&rsquo;s claims about its preview &mdash; the words of companies
        it chose to feature, presented as it chose to present them, not
        independent verification of the tier&rsquo;s performance:
      </p>
      <ul>
        <li>
          <strong>Jane Street</strong> &mdash; John Crepezzi, AI Assistants:
          &ldquo;The increase in speed brought by Cerebras is impressive. It
          enables different ways of using the models, and makes it practical
          for developers to work in a more focused and productive way alongside
          them.&rdquo;
        </li>
        <li>
          <strong>Podium</strong> &mdash; Courtland Lykins, Product Lead
          &mdash; Voice AI: &ldquo;For us the Ultrafast has been invaluable in
          our voice stack. The speed completely changes the call experience
          for the more complex work.&rdquo;
        </li>
        <li>
          <strong>Basis</strong> &mdash; Mitch Troyanovsky, Co-Founder:
          &ldquo;Ultrafast allows us to create synchronous experiences for
          users that were previously limited by intelligence. Oftentimes the
          barrier to truly fast products is not just tokens per second, but
          also model intelligence, and ultrafast combines both.&rdquo;
        </li>
        <li>
          <strong>Rogo</strong> &mdash; Alex Wang, Applied AI: &ldquo;Speed
          doesn&rsquo;t just make the product feel better. It changes what
          people can realistically use it for. Ultrafast makes complex
          financial research feel like a real-time interaction.&rdquo;
        </li>
      </ul>
      <p>
        The announcement suggests the intended uses: incident response,
        financial research and security, customer support and voice,
        commerce, and live research and experimentation. Inside OpenAI, the
        page says, its own developers have been testing the tier for incident
        response and for research workflows that used to run as overnight
        batches.
      </p>

      <h2>What to make of this</h2>
      <p>
        For an API builder, the honest summary is a preview, not a product
        decision: a select group of customers, capacity-gated expansion, no
        price and no timeline. The reasons to watch it are the two claims that
        outrank the numbers. First, the tradeoff OpenAI itself describes &mdash;
        speed or intelligence, choose one &mdash; is the assumption this tier
        is aimed at, and the announcement is the company&rsquo;s own statement
        that it no longer holds. Second, the tier runs the flagship on
        Cerebras hardware: frontier inference, even for OpenAI, is no longer
        tied to whose stack it was trained on. Both are the company&rsquo;s
        claims about its own product, and both will be checkable only when the
        preview opens up.
      </p>

      <h2>Sources</h2>
      <p className="post-footnote">
        Retrieved 2026-08-14. OpenAI,{" "}
        <a href="https://openai.com/index/previewing-ultrafast/">
          &ldquo;Previewing Ultrafast mode: GPT-5.6 Sol at up to 14X the
          speed&rdquo;
        </a>{" "}
        (13 August 2026) &mdash; the announcement date, the &ldquo;up to
        14&times; faster than Standard processing&rdquo; and &ldquo;up to 750
        output tokens per second&rdquo; figures, the Cerebras attribution and
        the &ldquo;next step in our partnership with Cerebras&rdquo; phrasing,
        the limited-preview status and access signup, the use-case scenarios,
        and the four named early customers and their quotes. The absence of a
        price is the page&rsquo;s own: the full announcement text was read this
        round and contains no price, rate, or billing detail. The{" "}
        <a href="/blog/gpt-5-6-price-drop">GPT-5.6 price-drop post</a> is this
        site&rsquo;s coverage of the price axis of the same family; its claims
        about the world are sourced to the announcements it fetched on
        2026-08-11, and are not relied on for any figure here.
      </p>
    </article>
  );
}
