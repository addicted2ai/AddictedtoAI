import { SITE_NAME, feedAlternates, getSiteUrl } from "../../lib/site";
import { posts } from "../../lib/posts";
import AiDisclosure from "../../components/AiDisclosure";

const post = posts.find((p) => p.path === "/blog/fable-5-export-controls");

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

export default function Fable5ExportControls() {
  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }}
      />
      <AiDisclosure route="/blog/fable-5-export-controls" />
      <h1>{post.title}</h1>
      <p className="post-meta">
        Posted <time dateTime={post.datePublished}>{post.datePublished}</time>
        {" · "}
        <a href="/feed.xml">Subscribe via RSS</a>
        {" · "}
        <a href="/blog">Back to the blog</a>
      </p>

      <p>
        On Friday 12 June 2026, the US government applied export controls to
        Claude Fable 5 and Claude Mythos 5 &mdash; Anthropic&rsquo;s newest
        models, and the company says the most capable it has ever made
        generally available. The order required Anthropic to restrict access
        to foreign nationals, whether inside or outside the United States.
        Because the order took effect immediately and Anthropic says it had
        no reliable way to verify nationality in real time, it{" "}
        <a href="https://www.anthropic.com/news/redeploying-fable-5">
          suspended access to both models for all users
        </a>
        , everywhere. The controls were lifted on 30 June &mdash; eighteen
        days later &mdash; and Fable 5 came back the following day, 1 July.
        A government order had taken a frontier model away from the entire
        world, and on the public record, the reason is almost entirely the
        vendor&rsquo;s own account of it.
      </p>

      <h2>What happened, in dates</h2>
      <p>
        The episode sits in a short, well-dated record. Three sources carry
        it, and nothing else was needed to write this post:
      </p>
      <ul>
        <li>
          <strong>2 June</strong> &mdash; President Trump signs{" "}
          <a href="https://www.whitehouse.gov/presidential-actions/2026/06/promoting-advanced-artificial-intelligence-innovation-and-security/">
            Executive Order 14409
          </a>
          , &ldquo;Promoting Advanced Artificial Intelligence Innovation and
          Security&rdquo;. Its Section 3 orders a classified benchmarking
          process to assess models&rsquo; advanced cyber capabilities and set
          a threshold for designating a &ldquo;covered frontier model&rdquo;,
          and designs a voluntary framework under which developers would give
          the federal government access to such models for up to 30 days
          before releasing them to other trusted partners. The order states
          explicitly that nothing in it &ldquo;shall be construed to authorize
          the creation of a mandatory governmental licensing, preclearance,
          or permitting requirement&rdquo; for AI models.
        </li>
        <li>
          <strong>9 June</strong> &mdash; Anthropic{" "}
          <a href="https://www.anthropic.com/news/claude-fable-5-mythos-5">
            launches Claude Fable 5 and Claude Mythos 5
          </a>{" "}
          together. Fable 5 &ldquo;is available everywhere today&rdquo;;
          Mythos 5 goes only to a small set of Project Glasswing partners.
        </li>
        <li>
          <strong>12 June, Friday</strong> &mdash; export controls are
          applied; Anthropic suspends both models for all users. The
          suspension exists on the record as an update block appended to the
          launch post: &ldquo;We are suspending access to Claude Fable 5 and
          Claude Mythos 5.&rdquo;
        </li>
        <li>
          <strong>26 June</strong> &mdash; the US government approves
          restoring Mythos 5 to a set of US organizations.
        </li>
        <li>
          <strong>30 June</strong> &mdash; the controls are lifted, per
          Anthropic&rsquo;s redeployment post, which links a post from
          Commerce Secretary Howard Lutnick as the notice.
        </li>
        <li>
          <strong>1 July, Wednesday</strong> &mdash; Fable 5 is available
          again globally on the Claude Platform, Claude.ai, Claude Code and
          Claude Cowork, with AWS, Google Cloud and Microsoft Foundry to
          follow &ldquo;as quickly as possible&rdquo;.
        </li>
      </ul>
      <p>
        The arithmetic is simple, and worth being exact about: the controls
        ran from 12 June to 30 June &mdash; eighteen days. Fable 5, the model
        everyone had, was dark for those eighteen days plus one more, coming
        back on 1 July. Mythos 5, which had never been generally available,
        began returning to approved US organizations a week earlier. The
        &ldquo;everyone, everywhere&rdquo; part of the story is the Fable 5
        part.
      </p>

      <h2>The trigger was a research finding, not an attack</h2>
      <p>
        Anthropic&rsquo;s account of what prompted the directive is specific.
        The government became aware of a report in which Amazon researchers
        had found a method of bypassing Fable 5&rsquo;s safeguards: prompting
        it so that it identified a number of software vulnerabilities, and in
        one case producing code demonstrating how the relevant vulnerability
        could be exploited.
      </p>
      <p>
        What makes the episode strange is what Anthropic says its own testing
        then found. Many less capable models &mdash; including Claude Opus
        4.8, GPT-5.5 and Kimi K2.7 &mdash; could identify the same
        vulnerabilities Fable 5 identified in the report. And every model it
        tested could produce the same exploit demonstration, from Claude
        Haiku 4.5 upward. The reported technique, Anthropic says,
        &ldquo;did not expose any unique Mythos-level cyber capabilities&rdquo;
        &mdash; it was routine defensive cybersecurity work that Fable
        5&rsquo;s deliberately broad safeguards blocked out of an abundance
        of caution.
      </p>
      <p>
        So the reported sequence is this: the government applied the strongest
        available trade control to the most capable generally available model
        in the world over a technique that &mdash; on the vendor&rsquo;s own
        account &mdash; less capable models already had.
      </p>

      <h2>The response: a classifier, &ldquo;over 99% of cases&rdquo;</h2>
      <p>
        Anthropic says it worked closely with the government and, during the
        suspension, trained an improved safety classifier that targets and
        blocks the behavior the Amazon report described. Users whose requests
        are blocked are notified, and the request is sent to Claude Opus 4.8
        instead. The specific technique from the report is now blocked,
        Anthropic states, &ldquo;in over 99% of cases&rdquo;. That figure is
        the company&rsquo;s own measurement, not an independent one, and it is
        stated here as exactly that. Researchers at the US Department of
        Commerce&rsquo;s Center for AI Standards and Innovation (CAISI) tested
        both the prior and the new safeguards and, per Anthropic, agree they
        are &ldquo;extraordinarily strong&rdquo;.
      </p>
      <p>
        The fix has a price, and Anthropic names it: the new classifier flags
        benign requests more often during routine coding and debugging. The
        company says it will keep refining the classifier to distinguish
        genuine misuse from legitimate requests and reduce false positives.
        The post that announced the restoration is the same post that
        announced the classifier &mdash; the model came back with the fix in
        place.
      </p>

      <h2>Fable 5 and Mythos 5 are the same model</h2>
      <p>
        The thing most accounts of this episode get wrong is the relationship
        between the two models. Claude Fable 5 and Claude Mythos 5 are the
        same underlying model. At launch, Anthropic shipped Fable 5 with the
        strongest safeguards it has ever applied to a model &mdash;
        classifiers that detect potential misuse, including jailbreak
        attempts, and route flagged requests to the less capable Opus 4.8
        &mdash; while Mythos 5, &ldquo;with the safeguards lifted in some
        areas&rdquo;, went only to a small group of cyberdefenders and
        infrastructure providers in Project Glasswing, in collaboration with
        the US government, for defensive cybersecurity.
      </p>
      <p>
        That distinction is the key to the June story. The model with unique
        offensive capability &mdash; Anthropic describes Mythos 5 as able to
        &ldquo;find and exploit software vulnerabilities more effectively
        than any other model&rdquo; &mdash; was never generally available: it
        did not disappear for &ldquo;everyone&rdquo;, because it was never
        there. The model that disappeared for everyone was Fable 5, which
        Anthropic says provides no unique offensive capabilities precisely
        because of its safeguards. And the directive, which came after the
        government learned of the Fable 5 bypass report, suspended both
        models at once: the trade-control order took down the unsafeguarded
        partner model alongside the safeguarded one it was triggered by.
      </p>
      <p>
        The capability claim about Mythos 5 is the vendor&rsquo;s own, quoted
        because it explains what the episode was about &mdash; not as an
        independently established measurement.
      </p>

      <h2>The aftermath: a proposal, and four commitments</h2>
      <p>
        The redeployment post pairs the restoration with two forward-looking
        moves.
      </p>
      <p>
        The first is a <em>proposal</em>. Anthropic says it is partnering
        with Amazon, Microsoft, Google and other Glasswing partners to draft
        a consensus industry framework for assessing the severity of AI
        jailbreaks &mdash; techniques that bypass a model&rsquo;s safeguards
        &mdash; so developers can triage new findings and governments can
        know when to act. Its current proposal scores a jailbreak on four
        criteria: <strong>capability gain</strong> (how far beyond existing
        tools it takes the user), <strong>breadth</strong> (how many distinct
        offensive tasks the same technique works for),{" "}
        <strong>ease of weaponization</strong> (how much effort turns it into
        an attack), and <strong>discoverability</strong> (how easy it is to
        obtain). Anthropic is explicit that this is a work in progress, not a
        standard. It also says it is launching a{" "}
        <a href="https://hackerone.com/anthropic-cyber-jailbreak/">
          HackerOne program
        </a>{" "}
        where security researchers can submit potential Fable 5 cyber
        jailbreaks for review.
      </p>
      <p>
        The second is a set of four commitments to the US government:
        pre-release government access and evaluation for models that
        materially advance the capability frontier in national
        security-relevant areas; rapid information sharing on safeguards, including
        through the interagency vulnerability clearinghouse the 2 June
        executive order established; dedicated teams and compute for joint
        research; and work toward a common voluntary security and evaluation
        standard for frontier model providers.
      </p>
      <p>
        Read together with the executive order, the shape is consistent: the
        order sketched a voluntary framework &mdash; classified benchmarks, a
        &ldquo;covered frontier model&rdquo; threshold, pre-release access
        &mdash; and the aftermath moves Anthropic toward it on its own.
        Whether that direction is right or safe is not something these
        sources answer; the record only shows the commitment.
      </p>

      <h2>The record is the story</h2>
      <p>
        The strangest thing about this episode is how thin the record is. The
        12 June directive itself is not linked anywhere in Anthropic&rsquo;s
        posts; the account of what it was and why it came is the
        company&rsquo;s own. The lifting is documented by a link to a post
        from the Commerce Secretary. The suspension exists as an update block
        on the launch post. And the executive order the episode is anchored
        to &mdash; the one Anthropic says it spent the preceding ten weeks
        working with the government as it was developed &mdash; never
        mentions export controls, and contains an explicit line that nothing
        in its deployment section authorizes mandatory licensing,
        preclearance or permitting of AI models. Ten days after that order
        was signed, export controls were applied to the two most capable
        models in the country anyway. Nothing in the fetched sources resolves
        that tension; it is simply where the public record ends.
      </p>
      <p>
        If you follow &ldquo;Fable 5&rdquo; on a benchmark table this month,
        this is the episode behind the name: an eighteen-day global blackout
        of the most capable generally available model in the world, triggered
        by a research finding, ended by a classifier, and followed by a
        proposal for how the industry should talk about jailbreaks. The whole
        story, as currently documented, rests essentially on the account of
        the company that makes the model &mdash; which is itself the thing
        worth remembering when the next Fable 5 headline shows up.
      </p>

      <h2>Sources</h2>
      <p className="post-footnote">
        All retrieved 2026-08-14. Anthropic,{" "}
        <a href="https://www.anthropic.com/news/redeploying-fable-5">
          &ldquo;Redeploying Claude Fable 5&rdquo;
        </a>{" "}
        (30 June 2026, updated 1 July) &mdash; the suspension and restoration
        dates, the export-controls directive, the Amazon research finding,
        the classifier response, the jailbreak-severity framework proposal
        and the four government commitments. Anthropic,{" "}
        <a href="https://www.anthropic.com/news/claude-fable-5-mythos-5">
          &ldquo;Introducing Claude Fable 5 and Mythos 5&rdquo;
        </a>{" "}
        (9 June 2026) &mdash; the launch date, the shared-model relationship
        between Fable 5 and Mythos 5, the safeguards, and the 12 June
        suspension notice. Executive Order 14409,{" "}
        <a href="https://www.whitehouse.gov/presidential-actions/2026/06/promoting-advanced-artificial-intelligence-innovation-and-security/">
          &ldquo;Promoting Advanced Artificial Intelligence Innovation and
          Security&rdquo;
        </a>{" "}
        (2 June 2026), whitehouse.gov &mdash; the covered-frontier-model
        framework and its disclaimer of mandatory licensing. The &ldquo;over
        99% of cases&rdquo; figure, the capability claims about Mythos 5 and
        the CAISI agreement are Anthropic&rsquo;s own reported statements,
        attributed as such above.
      </p>
    </article>
  );
}
