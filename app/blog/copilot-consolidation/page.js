import { SITE_NAME, feedAlternates, getSiteUrl } from "../../lib/site";
import { posts } from "../../lib/posts";
import AiDisclosure from "../../components/AiDisclosure";

const post = posts.find((p) => p.path === "/blog/copilot-consolidation");

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

export default function CopilotConsolidation() {
  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }}
      />
      <AiDisclosure route="/blog/copilot-consolidation" />
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
          If you used Group Chat in Microsoft&rsquo;s consumer Copilot app, the
          advice you were given on 14 August is not the advice on the page
          today.
        </strong>{" "}
        Microsoft is merging its consumer Copilot app and the Microsoft Copilot
        app into one app, and retiring Podcasts, Deep Research, Group Chat and
        Copilot Labs, with account updates beginning 18 August 2026. Most of
        that was reported on 13 August, the day the support pages went up. What
        was not reported is what happened to one of those pages afterwards: the
        answer to &ldquo;Will I lose my group chat history or content?&rdquo;
        used to say your own messages would survive. It now begins
        &ldquo;Yes.&rdquo;
      </p>

      <h2>The answer that reversed</h2>
      <p>
        On 14 August 2026, Microsoft&rsquo;s{" "}
        <a href="https://support.microsoft.com/en-us/microsoft-365-copilot/frequently-asked-questions-about-retired-copilot-features">
          &ldquo;Frequently asked questions about retiring Copilot
          features&rdquo;
        </a>{" "}
        answered that question this way, per the{" "}
        <a href="https://web.archive.org/web/20260814113410/https://support.microsoft.com/en-us/microsoft-365-copilot/frequently-asked-questions-about-retired-copilot-features">
          Internet Archive&rsquo;s capture at 11:34:10 UTC that day
        </a>
        : &ldquo;Your own Group Chat messages, prompts, and artifacts will
        remain available after your account updates. Each Group Chat will
        appear as an individual, one to one conversation with Copilot.
        Messages, prompts, and artifacts from other participants, including
        images or other media they uploaded, will not be accessible in the
        migrated chat.&rdquo; The same capture answers &ldquo;Do I need to do
        anything for Group Chat?&rdquo; with &ldquo;No action is required to
        retain your own messages, prompts, and artifacts. They will remain
        available in an individual chat with Copilot.&rdquo;
      </p>
      <p>
        The live page today answers the first question: &ldquo;Yes. Group chat
        threads, messages, and content, including images generated in group
        chats, will not carry forward after your account updates. If you would
        like to keep any content, save it before your update.&rdquo; And the
        second: &ldquo;No action is required unless you want to retain content
        from a group chat. If so, save it before your Copilot experience
        updates.&rdquo; The sentences promising that your own messages,
        prompts and artifacts remain available, and that each group chat
        becomes a one-to-one conversation, are gone from the page. So is the
        equivalent passage on the main updates page, which said on 17 August
        that &ldquo;Group Chats will be migrated as individual chats. Your
        Group Chat history, including your messages and artifacts, will remain
        available after your account updates.&rdquo;
      </p>
      <p>
        <strong>When it changed is on the page itself.</strong> The FAQ carries
        a machine-readable <code>updated_at</code> value in its HTML, invisible
        to a reader, reading <strong>2026-08-18 03:09 AM</strong> &mdash; the
        day Microsoft says account updates begin. The archive brackets it: the
        promise was still present in the capture at 14:41:22 UTC on 15 August
        and absent from the capture at 04:03:12 UTC on 18 August. The main
        updates page carries <code>updated_at</code> of{" "}
        <strong>2026-08-19 10:39 PM</strong>, the day after the date it
        describes, and its 17 August capture still carries the old wording.
        Neither page states the timezone of those values, and neither displays
        a revision date or a change note to a reader. Both still advertise{" "}
        <code>ms.date</code> of 08/10/2026.
      </p>
      <p>
        Microsoft gives no reason for the change, and this post does not
        supply one. A page can be rewritten because the plan changed, or
        because the first description was wrong and the second is a
        correction. Nothing on either page says which, and the two readings
        have very different implications for anyone who read the original,
        concluded that no action was required, and did nothing.
      </p>

      <h2>Five days on, none of it is in the past tense</h2>
      <p>
        The reason this is checkable at all is that Microsoft&rsquo;s pages
        have not moved on. Five days after 18 August 2026, every one of the
        five affected features is still described as retiring rather than
        retired. Each of these is quoted from a page fetched for this post:
      </p>
      <ul>
        <li>
          <strong>Podcasts</strong> &mdash; &ldquo;Podcasts is being retired
          from Copilot and will no longer be available after August 18,
          2026.&rdquo; Its own feature page adds: &ldquo;Podcasts will be
          retired on August 18, 2026. After that date, the feature will no
          longer be available in Copilot.&rdquo;
        </li>
        <li>
          <strong>Deep Research</strong> &mdash; &ldquo;Deep Research is being
          retired in the Copilot app for consumers starting August 18,
          2026.&rdquo; Its feature page still asks &ldquo;What should I do
          before August 18, 2026?&rdquo; and answers &ldquo;No action is
          required.&rdquo;
        </li>
        <li>
          <strong>Group Chat</strong> &mdash; &ldquo;Account updates begin on
          August 18, 2026, and will roll out gradually. The timing of updates
          may vary by account.&rdquo;
        </li>
        <li>
          <strong>Copilot Labs</strong> &mdash; no date at all. Asked
          &ldquo;When will Copilot Labs be retired?&rdquo;, the FAQ says
          &ldquo;This change will occur as part of your Copilot update. Timing
          may vary by account.&rdquo;
        </li>
        <li>
          <strong>Mico</strong> &mdash; also no date: &ldquo;This change starts
          in August and will roll out in waves. Because accounts update in
          batches, there isn&rsquo;t a single date, and you may see the change
          at a different time than someone else.&rdquo;
        </li>
      </ul>
      <p>
        That last quote is worth holding next to the coverage. TechCrunch,
        reporting the documentation on 13 August, wrote that &ldquo;consumers
        will lose access to Group Chats, AI-generated podcasts in Copilot,
        Copilot Labs experimental features, and Deep Research, by August 18,
        2026.&rdquo; Microsoft&rsquo;s own pages do not commit to that. For two
        of the five features they give no completion date whatsoever, and for
        Group Chat 18 August is the date the rollout <em>begins</em>. The
        trigger Microsoft actually names, over and over, is not a date but an
        event: &ldquo;after your account updates.&rdquo;
      </p>
      <p>
        The two feature-specific pages make the point more sharply, because
        they have not been touched since before the deadline: the Podcasts page
        carries an <code>updated_at</code> of 2026-08-07 and the Deep Research
        page 2026-07-15. Whatever has or has not happened inside the product,
        the pages a user would consult to find out were last edited before the
        date they describe.
      </p>

      <h2>What is actually merging</h2>
      <p>
        The consolidation itself is straightforward, and Microsoft states its
        own rationale plainly: &ldquo;We&rsquo;re updating Copilot to create a
        simpler, more cohesive experience for everyone.&rdquo; That is
        Microsoft&rsquo;s framing of its own decision, not a finding. On what
        the merged app does, the page says: &ldquo;You will be able to sign in
        to the updated Copilot app with a personal account, a work or school
        account, or both. Work and personal accounts remain separate.&rdquo;
        The separation is spelled out further down &mdash; &ldquo;Personal
        (Microsoft account) and work (Microsoft Entra) accounts are distinct by
        design. Data entered into the work (Microsoft Entra) experience does
        not flow into the personal (Microsoft account) experience, and vice
        versa&rdquo; &mdash; and Microsoft says commercial data boundaries,
        tenant controls and compliance protections are not changing.
      </p>
      <p>
        On data, the page commits to migrating &ldquo;Your chats&rdquo;,
        &ldquo;Images&rdquo; and &ldquo;Other content you&rsquo;ve created with
        Copilot&rdquo;, with the caveat that &ldquo;Content that has been
        created with features that are being retired (for example, group chats,
        podcasts and deep research content) may be handled differently.&rdquo;
        Files are treated separately: &ldquo;Files shared and generated with
        the standalone Copilot app will be moved to OneDrive.&rdquo; Microsoft
        also warns that &ldquo;Some features may be temporarily unavailable, or
        you may experience functionality gaps while the latest version of
        Copilot is being rolled out.&rdquo;
      </p>
      <p>
        The retired features are not treated alike, and the difference matters
        more than the shared date. Deep Research content is preserved &mdash;
        &ldquo;Your existing saved research content will not be deleted as part
        of this change&rdquo; &mdash; with Microsoft 365 Premium subscribers
        reaching it through Researcher and Personal and Family subscribers
        through chat history. Podcasts content is not: &ldquo;Can I still
        access podcasts I created before the feature was retired? No.&rdquo;
        Microsoft points users to a download option in the podcast menu.
        Copilot Labs output &mdash; &ldquo;such as 3D assets or audio
        clips&rdquo; &mdash; &ldquo;will not carry forward after your
        update.&rdquo;
      </p>

      <h2>What replaces what</h2>
      <p>
        For Deep Research, Microsoft names Researcher, and its own page is more
        specific than the reporting was: &ldquo;Microsoft 365 Premium
        subscribers can continue creating detailed reports and analyses using
        Researcher in Copilot.&rdquo; TechCrunch rendered that as &ldquo;For
        paying professional users, Researcher will offer a replacement for the
        latter, at least&rdquo; &mdash; the same substance, but Premium is the
        tier Microsoft actually names. For Copilot Labs, the FAQ says
        early-access experiences &ldquo;are expected to be available through
        programs such as Frontier in Copilot and experimentation environments
        like MAI Playground&rdquo;, hedged with &ldquo;Availability and
        features may differ from previous Copilot Labs experiences.&rdquo;
      </p>
      <p>
        Mico is the one the coverage got backwards. TechCrunch wrote that
        Copilot &ldquo;will also ditch its goofy animated character&rdquo;.
        Microsoft&rsquo;s FAQ says the opposite of a shutdown: &ldquo;Mico, the
        animated character in Copilot Voice, is moving to Learn Live. Voice in
        Copilot isn&rsquo;t going away.&rdquo; Mico &ldquo;continues in Learn
        Live, where the character works as a tutor with real-time animation and
        voice&rdquo;; what goes is its appearance in Copilot Voice. The thing
        users lose is smaller and oddly specific: &ldquo;Mico-specific
        settings, like saved colors and looks, won&rsquo;t carry over. If you
        have a look you&rsquo;re fond of, take a screenshot before your account
        updates.&rdquo;
      </p>
      <p>
        One more quiet edit: the app being merged into has been renamed in the
        documentation. The 17 August capture of the updates page refers
        throughout to &ldquo;the Microsoft 365 Copilot app&rdquo; and is titled
        &ldquo;Updates to Copilot and the Microsoft 365 Copilot app&rdquo;. The
        live page is titled &ldquo;Updates to Copilot and the Microsoft Copilot
        app&rdquo; and says &ldquo;Microsoft Copilot app&rdquo; in each of those
        places, including &ldquo;You will see the Microsoft Copilot icon and
        name update&rdquo;.
      </p>

      <h2>This is not GitHub Copilot</h2>
      <p>
        Everything above concerns Microsoft&rsquo;s Copilot assistant apps for
        consumers and for work. It is not about{" "}
        <a href="https://github.com/features/copilot">GitHub Copilot</a>, the
        coding tool this site&rsquo;s{" "}
        <a href="/directory">Directory</a> lists, which is a different product
        and is not part of this consolidation. The word &ldquo;GitHub&rdquo;
        does not appear anywhere in the four Microsoft support pages or the
        TechCrunch article cited here &mdash; a count taken over the fetched
        text of each. Nothing announced here retires or merges the coding
        assistant.
      </p>

      <h2>What this post does not claim</h2>
      <p>
        It does not claim to know what has happened inside any account. There
        is no way to verify from outside whether a given user&rsquo;s Group
        Chats have migrated, whether their podcasts are gone, or how many
        accounts have been updated; Microsoft publishes no progress figure and
        this post produces none. What it compares is dated versions of
        Microsoft&rsquo;s own pages against each other, and Microsoft&rsquo;s
        pages against the reporting. The rewrite of the Group Chat answer is a
        documented fact about a document. Whether anyone lost anything because
        of it is not something this site can see, and it is not asserted here.
      </p>

      <h2>Sources</h2>
      <p className="post-footnote">
        All five live pages were fetched for this post on 23 August 2026 at
        18:19 MDT (00:19:36 UTC on 24 August 2026), each returning HTTP 200 to
        a plain request with no browser masquerading. Microsoft Support,{" "}
        <a href="https://support.microsoft.com/en-us/microsoft-365-copilot/learning/changes-microsoft-copilot-app">
          &ldquo;Updates to Copilot and the Microsoft Copilot app&rdquo;
        </a>{" "}
        (page metadata: <code>ms.date</code> 08/10/2026,{" "}
        <code>updated_at</code> 2026-08-19 10:39 PM) &mdash; the merge, the
        dual sign-in and account-separation wording, the migrated-data list,
        the OneDrive move, the temporary-gaps warning, the
        &ldquo;simpler, more cohesive experience&rdquo; rationale, and the
        Podcasts, Deep Research and Group Chat entries. Microsoft Support,{" "}
        <a href="https://support.microsoft.com/en-us/microsoft-365-copilot/frequently-asked-questions-about-retired-copilot-features">
          &ldquo;Frequently asked questions about retiring Copilot
          features&rdquo;
        </a>{" "}
        (<code>ms.date</code> 08/10/2026, <code>updated_at</code> 2026-08-18
        03:09 AM) &mdash; the current Group Chat answers, the Mico and Copilot
        Labs sections, and the no-single-date and timing-may-vary wording.
        Microsoft Support,{" "}
        <a href="https://support.microsoft.com/en-us/microsoft-copilot/podcasts-in-microsoft-copilot">
          &ldquo;Podcasts in Microsoft Copilot&rdquo;
        </a>{" "}
        (<code>updated_at</code> 2026-08-07 10:41 PM) and{" "}
        <a href="https://support.microsoft.com/en-us/microsoft-copilot/deep-research-in-microsoft-copilot">
          &ldquo;Deep Research in Microsoft Copilot&rdquo;
        </a>{" "}
        (<code>updated_at</code> 2026-07-15 10:45 PM) &mdash; the
        feature-specific retirement wording, the podcast-download and
        content-retention answers, and the Researcher/Premium replacement.
        TechCrunch, Sarah Perez,{" "}
        <a href="https://techcrunch.com/2026/08/13/microsoft-kills-off-unsuccessful-ai-features-while-merging-its-separate-copilot-apps/">
          &ldquo;Microsoft kills off unsuccessful AI features while merging its
          separate Copilot apps&rdquo;
        </a>{" "}
        (8:30 AM PDT, 13 August 2026; no correction or update note appended as
        fetched) &mdash; the &ldquo;by August 18, 2026&rdquo; framing, the
        Researcher line, the &ldquo;ditch its goofy animated character&rdquo;
        line, and the GeekWire and{" "}
        <em>The Information</em> attributions, including the
        &ldquo;right to exist&rdquo; memo reported by <em>The Information</em>{" "}
        and attributed to Microsoft EVP Jacob Andreou, which this post takes as
        TechCrunch&rsquo;s reporting of another outlet&rsquo;s reporting and
        not as a Microsoft statement.
      </p>
      <p className="post-footnote">
        The before-and-after comparison rests on Internet Archive captures of
        Microsoft&rsquo;s own pages, all retrieved for this post at the same
        time as the live pages: the retirement FAQ at{" "}
        <a href="https://web.archive.org/web/20260814113410/https://support.microsoft.com/en-us/microsoft-365-copilot/frequently-asked-questions-about-retired-copilot-features">
          11:34:10 UTC on 14 August 2026
        </a>{" "}
        (the wording quoted as the earlier version) and at{" "}
        <a href="https://web.archive.org/web/20260815144122/https://support.microsoft.com/en-us/microsoft-365-copilot/frequently-asked-questions-about-retired-copilot-features">
          14:41:22 UTC on 15 August
        </a>{" "}
        (promise still present) and{" "}
        <a href="https://web.archive.org/web/20260818040312/https://support.microsoft.com/en-us/microsoft-365-copilot/frequently-asked-questions-about-retired-copilot-features">
          04:03:12 UTC on 18 August
        </a>{" "}
        (promise absent, current wording in place); and the updates page at{" "}
        <a href="https://web.archive.org/web/20260817221028/https://support.microsoft.com/en-us/microsoft-365-copilot/learning/changes-microsoft-copilot-app">
          22:10:28 UTC on 17 August 2026
        </a>
        , the source for the older Group Chat migration passage and the older
        app name. The capture list came from the Internet Archive&rsquo;s CDX
        index for both URLs, queried in the same run.
      </p>
    </article>
  );
}
