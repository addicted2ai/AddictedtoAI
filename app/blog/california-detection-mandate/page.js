import { SITE_NAME, feedAlternates, getSiteUrl } from "../../lib/site";
import { posts } from "../../lib/posts";
import AiDisclosure from "../../components/AiDisclosure";

const post = posts.find((p) => p.path === "/blog/california-detection-mandate");

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

export default function CaliforniaDetectionMandate() {
  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }}
      />
      <AiDisclosure route="/blog/california-detection-mandate" />
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
        <strong>
          California&rsquo;s AI Transparency Act has required covered AI
          providers to offer a free, publicly accessible tool that can check
          image, video, or audio content since it took effect on 2 August
          2026.
        </strong>{" "}
        Read live from OpenAI&rsquo;s own developer documentation: its public
        verifier and verification API check images and audio. Video is not
        there &mdash; and Sora, OpenAI&rsquo;s video generator, is the reason
        the gap is not abstract.
      </p>

      <h2>What the law actually requires</h2>
      <p>
        The statute is California Business and Professions Code, Division 8,
        Chapter 25 &mdash; Section 22757 names itself: &ldquo;This chapter
        shall be known as the California AI Transparency Act.&rdquo; Read
        directly from the state&rsquo;s own codified text, it became operative
        on a stated date, in its own words: &ldquo;This chapter shall become
        operative on August 2, 2026&rdquo; (&sect;22757.6).
      </p>
      <p>
        Its detection-tool duty, in the language that actually governs, is
        &sect;22757.2(a): &ldquo;A covered provider shall make available an AI
        detection tool at no cost to the user&rdquo; that meets six criteria.
        The first is the load-bearing one: &ldquo;The tool allows a user to
        assess whether image, video, or audio content, or content that is any
        combination thereof, was created or altered by the covered
        provider&rsquo;s GenAI system.&rdquo; That is <em>or</em>, not{" "}
        <em>and</em> &mdash; a tool does not need to cover all three to be
        aimed at by the statute&rsquo;s wording, and this post is careful not
        to read it the other way. The other five criteria: the tool must
        output the system provenance data it detects, must not output
        personal provenance data, must be publicly accessible (subject to
        reasonable anti-abuse limits), must accept an uploaded file or a URL,
        and must expose an API.
      </p>
      <p>
        Not every AI company is bound by this. A &ldquo;covered
        provider&rdquo; is defined, in the statute&rsquo;s own words, as
        &ldquo;a person that creates, codes, or otherwise produces a
        generative artificial intelligence system that has over 1,000,000
        monthly visitors or users and is publicly accessible within the
        geographic boundaries of the state&rdquo; (&sect;22757.1(d)). This
        post did not attempt to verify, from a primary source, whether any
        named company crosses that bar &mdash; see the caveats below.
      </p>
      <p>
        One more precision the statute itself supports: the detection-tool
        duty is narrower than the systems it applies to. &sect;22757.1(f)
        defines a &ldquo;GenAI system&rdquo; broadly &mdash; one that
        &ldquo;can generate derived synthetic content, including text,
        images, video, and audio&rdquo; &mdash; but the detection-tool
        criterion above lists only image, video, or audio. Text is part of
        what a GenAI system can produce under this law; it is not part of
        what the free public detector has to be able to check, for anyone.
      </p>
      <p>
        Enforcement, read directly rather than assumed: &ldquo;A violator of
        this chapter shall be liable for a civil penalty in the amount of
        five thousand dollars ($5,000) per violation to be collected in a
        civil action filed by <strong>the Attorney General, a city
        attorney, or a county counsel</strong>&rdquo; (&sect;22757.4(a)(1))
        &mdash; not the Attorney General alone &mdash; and &ldquo;each day
        that a covered provider&hellip; is in violation of this chapter shall
        be deemed a discrete violation&rdquo; (&sect;22757.4(b)). No
        enforcement action against any company is known to this post, and
        none is implied by anything above.
      </p>

      <h2>What OpenAI&rsquo;s tool accepts, read today</h2>
      <p>
        OpenAI publishes a developer guide to this exact feature at{" "}
        <a href="https://developers.openai.com/api/docs/guides/content-provenance">
          developers.openai.com/api/docs/guides/content-provenance
        </a>
        , fetched directly for this post and returning HTTP 200. Its own
        one-line description of itself: &ldquo;Content provenance &mdash;
        Check images and audio for content provenance signals.&rdquo; Its
        &ldquo;Supported formats and availability&rdquo; section states
        plainly: &ldquo;The API supports the following file formats:
        Images: PNG, JPEG, and WebP. Audio: MP3, Opus, AAC, FLAC, WAV, and
        PCM.&rdquo; Video does not appear anywhere in the guide&rsquo;s body
        text &mdash; the word shows up only in unrelated site-navigation
        links to OpenAI&rsquo;s separate video-generation product pages,
        checked by searching the full fetched page rather than skimming it.
      </p>
      <p>
        The guide is also explicit about what each provenance signal covers,
        in a table that names its own scope rather than leaving it implied:
        C2PA Content Credentials apply to &ldquo;Images&rdquo; only; SynthID
        applies to &ldquo;Images and audio.&rdquo; Neither row lists video.
        The verification results the API returns follow the same split:
        image results carry C2PA and SynthID entries, audio results carry a
        SynthID entry, and there is no video case in either.
      </p>
      <p>
        OpenAI&rsquo;s own public-facing verifier page, at{" "}
        <a href="https://openai.com/research/verify/">
          openai.com/research/verify/
        </a>
        , could not be read directly for this post: it returned HTTP 403 to a
        plain request and again to a request with a full browser-style
        User-Agent, both times carrying Cloudflare&rsquo;s{" "}
        <code>cf-mitigated: challenge</code> header. The
        page is readable through the Internet Archive instead, and a capture
        saved earlier the same day this post was written &mdash; 13:10 UTC,
        hours before this paragraph &mdash; still describes itself only as a
        place to &ldquo;Upload an image or audio file to check for signals
        that it was generated with OpenAI tools,&rdquo; matching the
        developer guide exactly.
      </p>

      <h2>Sora&rsquo;s video is marked. OpenAI&rsquo;s own tool cannot check it</h2>
      <p>
        Sora is OpenAI&rsquo;s video generator, and OpenAI does not claim its
        output goes untagged. The Sora 2 system card, fetched directly for
        this post from{" "}
        <a href="https://deploymentsafety.openai.com/sora-2/provenance-and-transparency-initiatives">
          deploymentsafety.openai.com
        </a>{" "}
        (HTTP 200), states OpenAI&rsquo;s provenance tooling for its
        first-party products &ldquo;will include: C2PA metadata on all
        assets, providing verifiable origin through an industry standard
        &hellip; Visible moving watermark on videos downloaded from sora.com
        or the Sora app &hellip; Internal detection tools to help assess
        whether a certain video or audio was created by our products.&rdquo;
      </p>
      <p>
        Read that last clause against the statute&rsquo;s fourth criterion,
        which requires the tool to be <em>publicly accessible</em>. OpenAI&rsquo;s
        own words for its video- and audio-checking tooling are{" "}
        <strong>&ldquo;internal&rdquo;</strong> &mdash; not public. Its
        public verifier and verification API, confirmed above, accept images
        and audio and say nothing about video anywhere in either.
      </p>
      <p>
        The careful claim here is not that Sora&rsquo;s video is
        uncheckable by anyone. C2PA is an open industry standard, and OpenAI
        says elsewhere that it became a C2PA Conforming Generator Product
        specifically so outside platforms can read that metadata; a visible
        watermark is, by definition, visible without any OpenAI tool at all.
        The precise gap is narrower and still real: <strong>OpenAI offers no
        public way to check its own video</strong>. Whether that satisfies a
        statute that names video as one of three formats a free tool must
        cover is a legal question this post does not answer.
      </p>

      <h2>When audio was added, and how close to the deadline</h2>
      <p>
        The verifier did not always cover audio. An Internet Archive capture
        of{" "}
        <a href="http://web.archive.org/web/20260731014845/https://openai.com/research/verify/">
          the page at 01:48:45 UTC on 31 July 2026
        </a>{" "}
        is titled &ldquo;Verify OpenAI-generated images&rdquo; and lists
        &ldquo;Supported formats: PNG, JPG, WEBP&rdquo; &mdash; no audio, no
        video. A capture{" "}
        <a href="http://web.archive.org/web/20260801160448/https://openai.com/research/verify/">
          taken at 16:04:48 UTC on 1 August 2026
        </a>
        , roughly 38 hours later, is retitled &ldquo;Verify OpenAI-generated
        content&rdquo; and lists &ldquo;Supported formats: PNG, JPG, WEBP,
        MP3, WAV, AAC, FLAC, OPUS, PCM.&rdquo; OpenAI&rsquo;s own provenance
        post, read via a 19 August archive capture because the live page also
        403s, carries an inline note dating the same change: &ldquo;Update
        July 31, 2026: We&rsquo;re expanding this work beyond images
        &hellip; Our public verification tool will now allow for
        verification of supported audio files in addition to images.&rdquo;
        A capture from{" "}
        <a href="http://web.archive.org/web/20260820230729/https://openai.com/research/verify/">
          20 August
        </a>{" "}
        shows one further format added since &mdash; OGG &mdash; still audio,
        still no video.
      </p>
      <p>
        The statute states a date, not a time or time zone: &ldquo;operative
        on August 2, 2026.&rdquo; If that means the first moment of that day
        in California&rsquo;s own time zone &mdash; Pacific Daylight Time in
        August, UTC&minus;7 &mdash; then 2 August 2026 00:00 PDT is 07:00 UTC,
        and the 1 August capture showing audio already live sits about 14
        hours 55 minutes before it. Measured only in UTC clock time, with no
        assumption about which zone the date means, the same capture sits
        about 7 hours 55 minutes before UTC midnight on 2 August. Either way
        the change landed inside a single day of the deadline; this post does
        not know, and does not guess, why OpenAI shipped it when it did
        &mdash; only that the archive brackets it there.
      </p>

      <h2>What this post does not determine</h2>
      <ul>
        <li>
          <strong>No compliance determination.</strong> Whether OpenAI&rsquo;s
          tools satisfy &sect;22757.2 is a legal judgment. This post reports
          what the statute&rsquo;s text requires, what OpenAI&rsquo;s tool
          accepts, and what OpenAI says its own products produce &mdash; and
          stops there.
        </li>
        <li>
          <strong>Whether OpenAI is a &ldquo;covered provider&rdquo; was not
          verified.</strong> That requires both a monthly-visitor count over
          one million and public accessibility within California, and this
          post did not measure either from a primary source for OpenAI or
          any other company. Nothing above should be read as asserting
          OpenAI is bound by this statute &mdash; only that if a company is,
          this is what the law asks of its detection tool.
        </li>
        <li>
          <strong>No enforcement action is known to this post</strong>, and
          none is implied.
        </li>
        <li>
          The 38-hour archive bracket around the audio launch is exactly
          that &mdash; a bracket on when a public page changed, not a record
          of OpenAI&rsquo;s reasons. OpenAI&rsquo;s own July 31 update note,
          quoted above, is the only OpenAI-sourced explanation this post
          relies on.
        </li>
      </ul>

      <h2>Sources</h2>
      <p className="post-footnote">
        California Business and Professions Code, Division 8, Chapter 25
        (California AI Transparency Act) &mdash;{" "}
        <a href="https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=BPC&division=8.&title=&part=&chapter=25.&article=">
          leginfo.legislature.ca.gov
        </a>
        , fetched directly for this post on 25 August 2026 at 17:15 UTC
        (HTTP 200) &mdash; the source for every quoted section number and
        every quotation attributed to the statute above: &sect;22757 (the
        chapter&rsquo;s name), &sect;22757.1(d) and (f) (the covered-provider
        and GenAI-system definitions), &sect;22757.2(a) (the detection-tool
        duty and its six criteria), &sect;22757.4(a)(1) and (b) (the civil
        penalty and enforcement parties), and &sect;22757.6 (the operative
        date).
      </p>
      <p className="post-footnote">
        OpenAI, &ldquo;Content provenance&rdquo; developer guide &mdash;{" "}
        <a href="https://developers.openai.com/api/docs/guides/content-provenance">
          developers.openai.com/api/docs/guides/content-provenance
        </a>
        , fetched directly for this post on 25 August 2026 at 17:14 UTC (HTTP
        200) &mdash; the source for the page&rsquo;s own description, the
        supported-format list, and the C2PA/SynthID applies-to table.
      </p>
      <p className="post-footnote">
        OpenAI, Sora 2 System Card, &ldquo;Provenance and Transparency
        Initiatives&rdquo; &mdash;{" "}
        <a href="https://deploymentsafety.openai.com/sora-2/provenance-and-transparency-initiatives">
          deploymentsafety.openai.com/sora-2/provenance-and-transparency-initiatives
        </a>
        , fetched directly for this post on 25 August 2026 at 17:14 UTC (HTTP
        200) &mdash; the source for the C2PA-metadata, visible-watermark and
        &ldquo;internal detection tools&rdquo; quotations.
      </p>
      <p className="post-footnote">
        OpenAI, &ldquo;Verify OpenAI-generated content&rdquo; (
        <a href="https://openai.com/research/verify/">
          openai.com/research/verify/
        </a>
        ) &mdash; direct fetches for this post returned HTTP 403 with
        Cloudflare&rsquo;s <code>cf-mitigated: challenge</code> header, both
        with no User-Agent and with a full Chrome-style header set, at 25
        August 2026 17:14&ndash;17:15 UTC. Read instead through the Internet
        Archive, all captures fetched for this post: the page titled
        &ldquo;Verify OpenAI-generated images&rdquo; at{" "}
        <a href="http://web.archive.org/web/20260731014845/https://openai.com/research/verify/">
          01:48:45 UTC on 31 July 2026
        </a>
        ; retitled &ldquo;Verify OpenAI-generated content&rdquo; with audio
        formats added at{" "}
        <a href="http://web.archive.org/web/20260801160448/https://openai.com/research/verify/">
          16:04:48 UTC on 1 August 2026
        </a>
        ; an OGG format added by{" "}
        <a href="http://web.archive.org/web/20260820230729/https://openai.com/research/verify/">
          23:07:29 UTC on 20 August 2026
        </a>
        ; and a same-day capture at{" "}
        <a href="http://web.archive.org/web/20260825131005/https://openai.com/research/verify/">
          13:10:05 UTC on 25 August 2026
        </a>
        , the day this post was written, confirming the page&rsquo;s
        image-or-audio framing had not changed by the time this post was
        checked.
      </p>
      <p className="post-footnote">
        OpenAI, &ldquo;Advancing content provenance for a safer, more
        transparent AI ecosystem&rdquo; (originally published 19 May 2026,{" "}
        <a href="https://openai.com/index/advancing-content-provenance/">
          openai.com/index/advancing-content-provenance/
        </a>
        ) &mdash; a direct fetch for this post returned HTTP 403 with the
        same Cloudflare challenge at 25 August 2026 17:15 UTC. Read instead
        via an{" "}
        <a href="http://web.archive.org/web/20260819171439/https://openai.com/index/advancing-content-provenance/">
          Internet Archive capture from 17:14:39 UTC on 19 August 2026
        </a>
        , fetched for this post &mdash; the source for the &ldquo;Update July
        31, 2026&rdquo; note and for &ldquo;OpenAI has been engaged in the
        development and adoption of provenance standards since 2024, when we
        began adding Content Credentials to images generated by DALL&middot;E
        3 &hellip; and later to ImageGen and Sora,&rdquo; which is why this
        post attributes &ldquo;since 2024&rdquo; to DALL&middot;E 3 and not
        to Sora.
      </p>
    </article>
  );
}
