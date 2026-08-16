import { SITE_NAME, feedAlternates, getSiteUrl } from "../../lib/site";
import { posts } from "../../lib/posts";
import AiDisclosure from "../../components/AiDisclosure";

const post = posts.find((p) => p.path === "/blog/chatgpt-ads");

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

export default function ChatgptAds() {
  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }}
      />
      <AiDisclosure route="/blog/chatgpt-ads" />
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
        On 9 February 2026, OpenAI began testing ads in ChatGPT in the United
        States. Six months and two days later, on 11 August, the same page
        announced the test had launched in the United Kingdom, Mexico, Brazil,
        Japan and South Korea. Add the US, Canada, Australia and New Zealand,
        and a pilot that started in one country now runs in nine &mdash; with
        more &ldquo;this year&rdquo;, per the page. The product at the centre
        of it is the one OpenAI describes as used by hundreds of millions of
        people, and that its own{" "}
        <a href="https://openai.com/index/improving-gpt-5-6-sol-in-chatgpt/">
          6 August announcement
        </a>{" "}
        says a billion people turn to every week. Its free tier is now the
        ad-funded tier.
      </p>
      <p>
        This post reads that page &mdash;{" "}
        <a href="https://openai.com/index/testing-ads-in-chatgpt/">
          &ldquo;Testing ads in ChatGPT&rdquo;
        </a>
        &mdash; and separates what it states from what it promises. Every date,
        market, tier and control below is on the page, fetched for this post on
        14 August 2026. The claims about independence and privacy are
        OpenAI&rsquo;s own commitments, labelled as such, because they are
        exactly the claims a reader should not take on the company&rsquo;s word
        alone. And what the page does not say &mdash; revenue, usage impact,
        any measurement that ads did not change answers &mdash; is part of the
        story too.
      </p>

      <h2>The arc, in the page&rsquo;s own dates</h2>
      <p>
        The page is one post with three dated updates appended to a 9 February
        original. The dates matter because they show how a cautious test became
        a product:
      </p>
      <ul>
        <li>
          <strong>9 February 2026</strong> &mdash; the original post: ads
          appear &ldquo;for logged-in adult users on the Free and Go
          subscription tiers&rdquo; in the US. &ldquo;Plus, Pro, Business,
          Enterprise, and Education tiers will not have ads.&rdquo;
        </li>
        <li>
          <strong>26 March 2026</strong> &mdash; OpenAI calls the early results
          &ldquo;encouraging&rdquo; &mdash; &ldquo;no impact on consumer trust
          metrics, low dismissal rates of ads&rdquo; &mdash; and says it will
          begin expanding &ldquo;starting with pilots in Canada, Australia, and
          New Zealand.&rdquo;
        </li>
        <li>
          <strong>7 May 2026</strong> &mdash; the plan goes further: expansion
          to &ldquo;the United Kingdom, Mexico, Brazil, Japan, and South
          Korea&rdquo; &ldquo;in the coming weeks.&rdquo;
        </li>
        <li>
          <strong>11 August 2026</strong> &mdash; those five markets launch:
          &ldquo;ChatGPT Ads has now launched in the United Kingdom, Mexico,
          Brazil, Japan, and South Korea.&rdquo;
        </li>
      </ul>
      <p>
        That is nine markets: the US, the three announced in March, and the
        five that went live on 11 August. The page never totals them &mdash;
        the count is arithmetic on its own lists. The page itself is dated 11
        August; its dates are the ones used here.
      </p>

      <h2>Who sees ads, and who does not</h2>
      <p>
        The tier split has not changed since the original post: ads run
        &ldquo;for logged-in adult users on the Free and Go subscription
        tiers,&rdquo; and &ldquo;Plus, Pro, Business, Enterprise, and Education
        tiers will not have ads.&rdquo; Two exclusions are stated as part of
        the test: OpenAI says it &ldquo;will not show ads in accounts where the
        user tells us or we predict that they are under 18,&rdquo; and that ads
        &ldquo;are not eligible to appear near sensitive or regulated topics
        like health, mental health or politics.&rdquo;
      </p>
      <p>
        For a Free-tier user who does not want ads, the page offers a trade
        rather than a setting: &ldquo;you can upgrade to our Plus or Pro plans,
        or opt out of ads in the Free tier in exchange for fewer daily free
        messages.&rdquo; What &ldquo;fewer&rdquo; means is not quantified
        anywhere on the page &mdash; and the page does not say how that sits
        with the{" "}
        <a href="https://openai.com/index/improving-gpt-5-6-sol-in-chatgpt/">
          6 August announcement
        </a>
        , five days earlier, that Free and Go users would get unlimited text
        chats.
      </p>

      <h2>The claims, as OpenAI&rsquo;s claims</h2>
      <p>
        The page makes three commitments worth naming, because each is the kind
        of claim only the company could verify, and none is verified on the
        page:
      </p>
      <ul>
        <li>
          <strong>Answers are independent.</strong> &ldquo;Ads do not influence
          the answers ChatGPT gives you. Answers are optimized based on
          what&rsquo;s most helpful to you.&rdquo; Ads are &ldquo;always clearly
          labeled as sponsored and visually separated from the organic
          answer.&rdquo;
        </li>
        <li>
          <strong>Advertisers never see the conversation.</strong>
          &ldquo;Advertisers do not have access to your chats, chat history,
          memories, or personal details. Advertisers only receive aggregate
          information about how their ads perform such as number of views or
          clicks.&rdquo;
        </li>
        <li>
          <strong>Matching runs on the conversation, not on you.</strong> During
          the test, &ldquo;we decide which ad to show by matching ads submitted
          by advertisers with the topic of your conversation, your past chats,
          and past interactions with ads&rdquo; &mdash; the page&rsquo;s own
          example: research recipes, &ldquo;you may see ads for meal kits or
          grocery delivery.&rdquo;
        </li>
      </ul>
      <p>
        These are OpenAI&rsquo;s commitments, stated as commitments. Nothing on
        the page shows its work: no audit, no measurement, no third party
        named. The rest of the page&rsquo;s promises are about control &mdash;
        dismissing ads, sharing feedback, seeing why an ad was shown, deleting
        ad data with one tap, managing ad personalization &mdash; and those,
        too, are described rather than demonstrated.
      </p>

      <h2>What the page does not say</h2>
      <p>
        Three things a reader might look for are absent. The page publishes no
        ad revenue figures &mdash; nothing on what the pilot earns. It
        publishes no usage data behind its March report of &ldquo;no impact on
        consumer trust metrics, low dismissal rates of ads&rdquo;: those are
        qualitative assertions with no numbers attached. And it offers no
        measurement that ads did not change answers &mdash; the independence
        claim is asserted, not demonstrated. &ldquo;Fewer daily free
        messages&rdquo; is undefined too. On a page whose whole value is
        checkability, the uncheckable parts are the ones worth noticing.
      </p>

      <h2>Where this sits on this site</h2>
      <p>
        The site already covers the other side of this tier&rsquo;s economics.
        The{" "}
        <a href="/blog/gpt-5-6-price-drop">GPT-5.6 price-drop post</a> records
        that OpenAI made Luna the free default on 6 August, with unlimited text
        chats &mdash; the tier the ads pilot runs on, five days before the
        five-market launch. The Directory&rsquo;s{" "}
        <a href="/directory">ChatGPT entry</a> describes the free
        tier&rsquo;s current model. This post is the third corner: where the
        money comes from. OpenAI&rsquo;s own framing is that the two are
        connected &mdash; ads &ldquo;help fund&rdquo; the Free and Go tiers,
        &ldquo;supporting broader access to AI through higher quality free and
        low cost options.&rdquo;
      </p>

      <h2>Sources</h2>
      <p className="post-footnote">
        Both fetched 2026-08-14 for this post. OpenAI,{" "}
        <a href="https://openai.com/index/testing-ads-in-chatgpt/">
          &ldquo;Testing ads in ChatGPT&rdquo;
        </a>{" "}
        (originally published 9 February 2026; updated 11 August 2026) &mdash;
        every date, market list, tier, exclusion, opt-out and commitment quoted
        above, plus the page&rsquo;s link to the advertising principles OpenAI
        says it previously shared. OpenAI,{" "}
        <a href="https://openai.com/index/improving-gpt-5-6-sol-in-chatgpt/">
          &ldquo;Improving GPT-5.6 Sol in ChatGPT&mdash;and expanding access to
          GPT-5.6 Luna for free users&rdquo;
        </a>{" "}
        (6 August 2026) &mdash; the &ldquo;1 billion people&rdquo;
        weekly-usage claim and the unlimited text chats announced for Free and
        Go users. The independence and privacy commitments quoted are
        OpenAI&rsquo;s own claims, labelled as such in the post.
      </p>
    </article>
  );
}
