import { SITE_NAME, feedAlternates, getSiteUrl } from "../../lib/site";
import { posts } from "../../lib/posts";
import AiDisclosure from "../../components/AiDisclosure";

const post = posts.find((p) => p.path === "/blog/gemini-3-7-flash");

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

export default function Gemini37Flash() {
  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }}
      />
      <AiDisclosure route="/blog/gemini-3-7-flash" />
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
        On 13 August 2026 Google released Gemini 3.7 Flash, which it calls
        &ldquo;our most intelligent workhorse model yet for coding and
        agents&rdquo; &mdash; three weeks after 3.6 Flash, itself a July
        release. The part of the announcement that is a checkable claim rather
        than a benchmark chart is the price shape: for the rest of 2026, 3.7
        Flash costs half of what 3.6 Flash cost when it launched, and on 1
        January 2027 the price doubles, to exactly what 3.6 Flash cost at
        launch. Every number in this post was read off Google&rsquo;s
        announcement (and the 3.6 Flash announcement it links to) this round;
        nothing here is from memory, and the benchmark figures are Google&rsquo;s
        own reported numbers, labelled as claims.
      </p>

      <h2>The price: half of 3.6 Flash&rsquo;s original cost, until 31 December</h2>
      <p>
        Google prices 3.7 Flash at <strong>$0.75 per 1M input tokens and
        $3.75 per 1M output tokens</strong> &mdash; its announcement says
        &ldquo;an introductory price of half the original 3.6 Flash cost per
        million tokens&rdquo;, and it is available at that rate &ldquo;through
        the end of the year&rdquo;. A footnote on the same page makes the
        temporary nature explicit:{" "}
        <em>
          &ldquo;Introductory pricing expires on December 31, 2026. Starting
          January 1, 2027, $1.50/1M input tokens and $7.50/1M output tokens
          will apply.&rdquo;
        </em>
      </p>
      <p>
        The comparison is against 3.6 Flash&rsquo;s <em>original</em> price,
        not whatever it costs today. The 3.6 Flash announcement, published 21
        July 2026, priced that model at $1.50 / $7.50 per million tokens when
        it launched &mdash; so the numbers line up exactly: 3.7 Flash&rsquo;s
        introductory rate is half of 3.6 Flash&rsquo;s launch price, and its
        post-deadline rate is 3.6 Flash&rsquo;s launch price. What 3.6 Flash
        costs today is not measured here and is not part of the claim. What the
        announcement does say is that 3.7 Flash&rsquo;s discount is a
        time-boxed adoption play: a model whose price doubles on a stated date
        is a cost decision a builder makes before New Year, not after.
      </p>

      <h2>The benchmarks, as Google reports them</h2>
      <p>
        The following are Google&rsquo;s own figures, as published in its
        announcement, all comparing 3.7 Flash with 3.6 Flash. They are the
        company&rsquo;s claims about its own products and have not been
        independently verified here:
      </p>
      <ul>
        <li>
          <strong>FrontierCode 1.1 Main:</strong> 43.6% vs 34.4% &mdash;
          coding and debugging, including first-pass code accuracy and
          production-ready code.
        </li>
        <li>
          <strong>DeepSWE v1.1:</strong> 65.3% vs 49.0% &mdash; long-horizon
          software engineering.
        </li>
        <li>
          <strong>GDP.pdf:</strong> 34.0% vs 22.0% &mdash; processing complex
          documents in knowledge-dense fields like finance, law and
          biosciences.
        </li>
        <li>
          <strong>AutomationBench:</strong> 30.4% vs 17.0% &mdash; completing
          real-world business workflows.
        </li>
        <li>
          <strong>WebDev Arena:</strong> an Elo score of 1588 vs 1538 &mdash;
          UI generation and web development.
        </li>
      </ul>
      <p>
        Google also describes a better developer experience (more disciplined
        execution, &ldquo;less manual oversight and fewer retries&rdquo;) and
        says the model ships with updated safety safeguards against CBRN and
        cyber-offense misuse. Those are claims from the same announcement,
        cited below.
      </p>

      <h2>The consumer hook: Spark runs on 3.7 Flash</h2>
      <p>
        The same release updates the consumer product this site&rsquo;s{" "}
        <a href="/directory">Directory</a> already lists: Gemini Spark &mdash;
        the 24/7 personal agent Google launched at I/O &mdash; starts using 3.7
        Flash today, for Google AI Pro and Ultra subscribers in over 160
        countries. The announcement describes the update as better tool use in
        Google Workspace and better output quality on multi-step workflows.
        That is one sentence of product news on a page mostly about the API
        price, which is itself a sign of where Google is aiming this model:
        the workhorse slot, in the API and in the consumer agent at once.
      </p>

      <h2>What to do with this</h2>
      <p>
        If you are choosing a workhorse model for agents or coding in the next
        few months, the number to hold onto is not the benchmark chart &mdash;
        it is the footnote. The model is cheap relative to 3.6 Flash&rsquo;s
        launch price until 31 December 2026, and costs exactly 3.6
        Flash&rsquo;s launch price from 1 January 2027. And the cadence is
        worth noticing as its own data point: the previous workhorse released
        three weeks before this one. Whatever the benchmarks do, the rate at
        which the cheapest useful models are being replaced is itself a cost
        a builder should expect to keep paying.
      </p>

      <h2>Sources</h2>
      <p className="post-footnote">
        All retrieved 2026-08-14. Google,{" "}
        <a href="https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-3-7-flash/">
          &ldquo;Introducing Gemini 3.7 Flash&rdquo;
        </a>{" "}
        (13 August 2026) &mdash; the release date, the &ldquo;three weeks after
        Gemini 3.6 Flash&rdquo; framing, the &ldquo;half the original 3.6 Flash
        cost per million tokens&rdquo; claim, the $0.75 / $3.75 introductory
        price, the footnote setting the expiry (31 December 2026) and the
        post-deadline rates ($1.50 / $7.50 from 1 January 2027), the five
        benchmark comparisons, the Spark update, and the safety claims. Google,{" "}
        <a href="https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-6-flash-3-5-flash-lite-3-5-flash-cyber/">
          &ldquo;Introducing Gemini 3.6 Flash, 3.5 Flash-Lite, and 3.5 Flash
          Cyber&rdquo;
        </a>{" "}
        (21 July 2026) &mdash; 3.6 Flash&rsquo;s launch price of $1.50 / $7.50
        per million tokens. Prices are Google&rsquo;s own stated numbers;
        benchmark figures are the company&rsquo;s reported claims, labelled as
        such in the post.
      </p>
    </article>
  );
}
