import { SITE_NAME, feedAlternates, getSiteUrl } from "../../lib/site";
import { posts } from "../../lib/posts";
import AiDisclosure from "../../components/AiDisclosure";

const post = posts.find((p) => p.path === "/blog/gpt-5-6-price-drop");

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

export default function Gpt56PriceDrop() {
  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }}
      />
      <AiDisclosure route="/blog/gpt-5-6-price-drop" />
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
        On 30 July 2026, OpenAI cut the API price of GPT-5.6 Luna &mdash; the
        fastest and most affordable model in its current lineup &mdash; by 80%,
        and GPT-5.6 Terra by 20%. A week later, on 6 August, it said Luna would
        become the default model for Free users of ChatGPT, with unlimited text
        chats and a new Think button for harder questions. The company&rsquo;s
        claim is that its most affordable model now delivers performance
        comparable to models that were frontier-class a year ago, at a fraction
        of the cost.
      </p>
      <p>
        Every number in this post is OpenAI&rsquo;s own, taken from the three
        announcements below. That matters more than it usually does, because
        this story is half price list and half marketing, and the two halves
        are not the same kind of fact. A price is something you can check by
        buying the product. A benchmark is a claim about a competitor that the
        company making it has every reason to maximise. This post keeps the
        difference visible.
      </p>

      <h2>What the prices were, and what they are now</h2>
      <p>
        When the GPT-5.6 family launched on 9 July, OpenAI priced the three
        tiers per million tokens at:{" "}
        <strong>Sol $5 input / $30 output</strong>,{" "}
        <strong>Terra $2.50 / $15</strong>, and{" "}
        <strong>Luna $1 / $6</strong>. The launch page describes Sol as the
        flagship, Terra as a lower-cost model with performance it says is
        competitive with GPT-5.5, and Luna as the fastest and most affordable
        of the three.
      </p>
      <p>
        Three weeks later, on 30 July, OpenAI published the cuts. Starting that
        day: <strong>Terra is $2 per million input tokens and $12 per million
        output</strong>, and <strong>Luna is $0.20 input and $1.20 output</strong>.
        Sol&rsquo;s pricing is unchanged. Luna&rsquo;s input price is now a fifth of what
        it was on 9 July, and its output price the same; the cuts were 80% on
        Luna and 20% on Terra, both stated in the announcement. The company
        says the pricing changes were rolling out to AWS later the same day, and that
        ChatGPT and Codex subscription prices and quota budgets are unchanged
        &mdash; Terra and Luna usage now simply consumes fewer credits.
      </p>
      <p className="correction-note">
        <strong>Update, 2026-08-25.</strong> &ldquo;Sol&rsquo;s pricing is
        unchanged,&rdquo; above, was true of the 30 July cuts this paragraph
        describes. It is not true today &mdash; see the dated update under
        &ldquo;What did not change&rdquo; below for what Sol costs now.
      </p>

      <h2>What changed for a free user</h2>
      <p>
        On 6 August, OpenAI announced that <strong>GPT-5.6 Luna becomes the
        default model for Free and Go users of ChatGPT</strong>, with{" "}
        <strong>unlimited text chats</strong> and a{" "}
        <strong>Think button</strong> that gives the model more time on harder
        questions. The rollout is staggered, and the announcement says so
        explicitly: Luna becomes the default &ldquo;this week&rdquo;, while
        unlimited text chats and the Think button arrive &ldquo;next
        week&rdquo;. Limits still apply to file uploads, images and other
        tools.
      </p>
      <p>
        One distinction the announcement makes that press summaries tend to
        blur: this is the <em>Chat</em> default. In ChatGPT Work and Codex, the
        pages state, Free and Go users access Terra, while paid tiers choose
        between Terra and Luna. The consumer app is where Luna becomes the free
        default.
      </p>
      <p>
        The same announcement updated GPT-5.6 Sol in Chat for Plus and Pro
        users &mdash; more focused answers, a fact-checking pass the company
        describes as making factual errors about 62% less common with Luna and
        68% less common with Sol than with GPT-5.5 Instant in an internal
        evaluation of financial, medical and legal prompts. That figure is an
        internal evaluation, reported by the company that ran it, and it is
        labelled as such here. OpenAI also says this Chat-specific Sol is
        distinct from the Sol powering Work and Codex, which it says is not
        changing as part of this release.
      </p>

      <h2>The claims, labelled as claims</h2>
      <p>
        The part of this story that is not a price list is the part a reader
        should treat with the most care. All of the following are
        <em> OpenAI&rsquo;s claims about its own products</em>, from the pages
        cited below, and none of them has been independently verified:
      </p>
      <ul>
        <li>
          That Luna delivers &ldquo;performance comparable to models that were
          frontier-class a year ago at roughly 6 cents on the dollar per
          task&rdquo;, and at &ldquo;nearly nine times the speed&rdquo;.
        </li>
        <li>
          That on professional work, as measured by Agents&rsquo; Last Exam,
          Luna &ldquo;outperforms Fable 5&rdquo; at an estimated cost per task
          nearly 99% lower &mdash; a vendor assertion about a competitor,
          stated as one.
        </li>
        <li>
          That Terra and Luna &ldquo;outperform Fable 5 at around
          one-sixteenth the cost&rdquo; (the 9 July launch page&rsquo;s
          framing), and that Luna &ldquo;nearly matches GPT-5.5&rsquo;s peak
          performance at less than half the estimated cost&rdquo;.
        </li>
        <li>
          That GPT-5.6 Sol set a new high of 53.6 on Agents&rsquo; Last Exam,
          &ldquo;eclipsing Claude Fable 5 (adaptive reasoning) by 13.1
          points&rdquo;.
        </li>
        <li>
          Customer testimonials the price announcement carries: Notion saying
          Terra delivered &ldquo;comparable quality to GPT-5.5 at half the cost
          per task and in 60% less time&rdquo; in its evaluations; Replit&rsquo;s
          president calling Luna &ldquo;the closest we&rsquo;ve come to
          intelligence too cheap to meter&rdquo;; Blitzy reporting Luna handles
          2.2&times; more context with 8.5&times; fewer output tokens at 87%
          lower cost than GPT-5.4 mini; Dust reporting Luna 40% faster and 40%
          cheaper than its previous default. Vendors choose which customers
          speak, and customers who stayed on a model are not a random sample.
        </li>
      </ul>
      <p>
        None of these are measurements made here, and none are facts you can
        check by reading a price page. They are the company&rsquo;s case for its
        own products, presented as its case.
      </p>

      <h2>What did not change</h2>
      <p>
        The parts of this story that are easy to over-read: Sol&rsquo;s price
        did not move. Subscription prices and quota budgets did not move.
        OpenAI also introduced Fast mode for Sol in the API &mdash; up to
        2.5&times; faster than Standard processing at twice the price, per the
        announcement &mdash; which is a new option, not a cheaper one. And the
        Chat-specific Sol update is not the Sol that powers Work and Codex,
        which the company says is unchanged.
      </p>
      <p className="correction-note">
        <strong>Update, 2026-08-25.</strong> Sol&rsquo;s price is no longer
        unchanged. OpenAI&rsquo;s live API pricing page today lists{" "}
        <code>gpt-5.6-sol</code> at <strong>$4.00 input / $20.00 output</strong>{" "}
        per million tokens for short-context requests &mdash; a rate the page
        labels &ldquo;GPT-5.6 Sol&rsquo;s promotional pricing&rdquo;, stated as
        &ldquo;available at least through November 21, 2026&rdquo; &mdash; and{" "}
        <strong>$8.00 input / $30.00 output</strong> for long-context requests.
        Neither figure is the flat $5 / $30 this post reports above, and
        repeats below, as unchanged from the 9 July launch; that flat rate is
        not on the page at all as fetched for this update. Terra ($2.00 input
        / $12.00 output, short context) and Luna ($0.20 / $1.20) still match
        this post&rsquo;s figures exactly, read off the same page at the same
        time. Neither announcement this post cites describes a short/long-context
        split for Sol, so when the split and the promotional rate began is not
        established here &mdash; only that, as of this update, they have.
        Source:{" "}
        <a href="https://developers.openai.com/api/docs/pricing">
          OpenAI, API pricing
        </a>{" "}
        (fetched 2026-08-25 with a plain HTTP client; the marketing pages this
        post cites under openai.com/index/ returned a Cloudflare JavaScript
        challenge to the same request and could not be re-fetched this round).
      </p>

      <h2>What to do with this</h2>
      <p>
        If you&rsquo;re a free ChatGPT user, the practical change is coming to
        your default model, and it does not cost anything to wait a week for
        the unlimited chats and the Think button to land. If you&rsquo;re an
        API customer, the decision is the ordinary one, now at more
        aggressive prices: Luna at $0.20 / $1.20 per million tokens is the
        high-volume tier for tasks where its price and speed are the point;
        Terra at $2 / $12 is the everyday-work tier; Sol at $5 / $30 is unchanged
        for the work that justifies it. And when a vendor tells you its model
        outperforms a rival at 99% lower cost, treat the benchmark as a
        hypothesis worth testing on your own workload &mdash; not as a number
        that became true because it was printed.
      </p>
      <p className="correction-note">
        <strong>Update, 2026-08-25.</strong> The &ldquo;Sol at $5 / $30 is
        unchanged&rdquo; recommendation just above is the same stale claim
        corrected earlier in this post (see the update under &ldquo;What did
        not change&rdquo;). It is not currently actionable: OpenAI&rsquo;s
        live pricing page shows no flat $5 / $30 rate for Sol at all, only a
        promotional <strong>$4.00 input / $20.00 output</strong> for
        short-context requests (through at least 21 November 2026) or{" "}
        <strong>$8.00 input / $30.00 output</strong> for long-context
        requests, per million tokens.
      </p>

      <h2>Sources</h2>
      <p className="post-footnote">
        All retrieved 2026-08-11. OpenAI,{" "}
        <a href="https://openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6/">
          &ldquo;Advancing the price-performance frontier with GPT-5.6&rdquo;
        </a>{" "}
        (30 July 2026) &mdash; the 80% and 20% price cuts, the new Terra and
        Luna prices, Fast mode, and the &ldquo;6 cents on the dollar&rdquo;,
        &ldquo;nearly nine times the speed&rdquo; and &ldquo;nearly 99%
        lower&rdquo; claims, all stated as OpenAI&rsquo;s. OpenAI,{" "}
        <a href="https://openai.com/index/improving-gpt-5-6-sol-in-chatgpt/">
          &ldquo;Improving GPT-5.6 Sol in ChatGPT&mdash;and expanding access to
          GPT-5.6 Luna for free users&rdquo;
        </a>{" "}
        (6 August 2026) &mdash; the free-tier changes and their staggered
        rollout, and the internal factuality evaluation. OpenAI,{" "}
        <a href="https://openai.com/index/gpt-5-6/">
          &ldquo;GPT-5.6: Frontier intelligence that scales with your
          ambition&rdquo;
        </a>{" "}
        (9 July 2026) &mdash; the original prices, the family definitions, and
        the launch-page benchmark claims. Prices and launch claims are the
        company&rsquo;s own reported numbers on its own products; the benchmark
        and cost-per-task figures are labelled in the post as claims, not
        measurements.
      </p>
    </article>
  );
}
