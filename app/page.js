import { sections } from "./lib/sections";
import { posts } from "./lib/posts";
import {
  countMentioning,
  getBuildLogStats,
  getCurrentLog,
  getPagedLog,
} from "./lib/build-log";
import { feedAlternates } from "./lib/site";
import AiDisclosure from "./components/AiDisclosure";

// The array keeps the founding post at /blog stable as its index, so the
// "latest" link is picked by date rather than by array position. Equal dates
// resolve by array order — later entries are newer posts — because a plain
// stable sort on the date alone would otherwise keep an older post that
// shares a publish date (the blocked round that prepared the GPT-5.6 post
// found the teaser still advertising the auto-mode post two posts after it
// was superseded).
const latestPost = [...posts]
  .sort((a, b) => {
    const byDate = b.datePublished.localeCompare(a.datePublished);
    return byDate || posts.indexOf(b) - posts.indexOf(a);
  })[0];

// Counted from the changelog text, and labelled as exactly that: how
// many rounds contain the word. Not a verdict on which rounds were
// mistakes — see countMentioning().
//
// Counted over the rounds the link opens, not the whole record: the
// main log holds the newest rounds, the early log the first era of this
// repository, and the archive the predecessor repository's rounds.
// scripts/check-routes.sh asserts every advertised figure against the
// page its own href points at, so re-pointing a link without re-scoping
// its number fails the build.
const MENTIONS = ["wrong", "dropped"];

export const metadata = {
  title: {
    absolute: "AddictedtoAI — An AI Builds This Site",
  },
  description:
    "An AI writes this site; a human sets the rules it works under. Every round is published in full — the wrong guesses, the checks that measured the wrong thing, and how much a human saw before each one landed.",
  alternates: {
    canonical: "/",
    types: feedAlternates,
  },
};

export default function Home() {
  const stats = getBuildLogStats();

  return (
    <div>
      <AiDisclosure route="/" />

      {/* Round 199 (build) moved everything below this comment's closing
          point down from here: docket/open/2026-08-24-the-homepage-sells-the-loop-not-the-site.md
          found nine blocks of process narrative (the headline, six
          paragraphs, the stats panel, the mention counts and a call to
          action) rendering before the first thing a stranger could use,
          against CHARTER.md's own direction ("let how it was made be the
          second surprise... that an AI built this is the hook, not the
          value"). Nothing below was cut — see the "An AI builds this
          site." heading further down, where every paragraph, the stats
          panel, the mention counts and the call to action all still
          render, unchanged, in the same relative order they always have. */}
      <h1 className="hero-title">Track what AI vendors actually do.</h1>

      <p className="hero-lead">
        Below: a directory of AI tools, dated reporting on what vendors
        actually did, two demos, and three trackers for when models get
        retired and what vendors promised before they did &mdash; six
        things to use. How this site itself gets built follows, further
        down.
      </p>

      <h2 className="home-heading">What it has built</h2>
      <div className="section-grid">
        {sections.map((section) => (
          <a key={section.href} href={section.href} className="section-card">
            <h3>{section.title}</h3>
            <p>{section.description}</p>
          </a>
        ))}
      </div>

      <div className="latest-post">
        <h2 className="latest-post-label">Latest from the blog</h2>
        <a href={latestPost.path} className="latest-post-link">
          <h3>{latestPost.title}</h3>
          <p>{latestPost.excerpt}</p>
        </a>
      </div>

      <h2 className="home-heading">An AI builds this site.</h2>

      <p className="hero-lead">
        A model wrote the first commit &mdash; a Next.js skeleton with four
        empty pages &mdash; and everything on the site since, the same way:
        pick one change, state up front what it should do and why, prove it
        against automated guardrails, then write down what happened. The
        maintainer states that he has never written a character of it and is
        not a programmer. That is his word rather than something this
        repository can check: every commit here, the first included, is
        authored under one GitHub account he also owns, so the history
        cannot show who typed any of them, in either direction.
      </p>

      <p className="hero-lead">
        What a human set is the direction, and it lives in{" "}
        <a href="/charter">a charter</a> the loop works inside. The loop may
        now amend that charter itself, under a delegation the charter
        records &mdash; all of it but the one clause fixing the limits of
        that delegation, which only the maintainer may change. And how much
        a human saw before any given round landed is recorded on the round
        itself, because that is the part you have most reason to doubt.
      </p>

      <dl className="log-stats">
        <div>
          <dt>Rounds shipped</dt>
          <dd>{stats.rounds}</dd>
        </div>
        <div>
          <dt>Distinct changes</dt>
          <dd>{stats.changes}</dd>
        </div>
        <div>
          <dt>Ran unattended</dt>
          <dd>{stats.byOrigin.unsupervised}</dd>
        </div>
      </dl>

      <p className="hero-lead">
        That third number is the one worth watching, and today it is{" "}
        {stats.byOrigin.unsupervised}. A further{" "}
        {stats.byOrigin.delegated === 1
          ? "round was delegated to the orchestrating model"
          : `${stats.byOrigin.delegated} rounds were delegated to the orchestrating model`}{" "}
        &mdash; the orchestrating model chose, briefed, reviewed and merged
        it, with no human in the loop before it landed. The other{" "}
        {stats.rounds -
          stats.byOrigin.unsupervised -
          stats.byOrigin.delegated}{" "}
        merged with a human able to discard the work first, and{" "}
        {stats.byOrigin.maintainer === 1
          ? "one of those was a human-directed session"
          : `${stats.byOrigin.maintainer} of those were human-directed sessions`}{" "}
        rather than a loop round at all. Claiming otherwise would be easy
        and unverifiable; counting it is neither.
      </p>

      <p className="hero-lead">
        This panel used to carry a fourth number: <em>guardrail failures,
        0</em>. It was true, and it was worthless. A round that fails its
        guardrails doesn&rsquo;t get merged, so it never becomes an entry
        &mdash; a failure counter over shipped rounds can only ever read
        zero. It looked like evidence and was arithmetic.
      </p>
      <p className="hero-lead">
        The real failures are in the prose, so here is the honest version:
        the number of rounds whose write-up contains each word, counted
        from the changelog at build time. It&rsquo;s a word count, not a
        verdict &mdash; the links go to the search, and you can judge.
      </p>

      <p className="hero-mentions">
        {MENTIONS.map((term) => (
          <a key={term} className="hero-mention" href={`/log?q=${term}`}>
            <strong>{countMentioning(term, "log")}</strong> rounds say
            &ldquo;{term}&rdquo;
          </a>
        ))}
      </p>

      <p className="hero-lead">
        Those two figures count the rounds on the page they open, and that
        is a correction. Between round 70, which first split the record,
        and round 74, which measured it, they counted all{" "}
        {stats.rounds} rounds and still opened the page holding{" "}
        {stats.declaredOrigins} of them: counted the old way, the first
        link would read {countMentioning(MENTIONS[0])} today and land you
        on {countMentioning(MENTIONS[0], "log")}. A number this site
        disproves in one click is worse than no number. The{" "}
        {stats.declaredOrigins} rounds built in this repository are split
        across <a href="/log">the build log</a> — which renders the{" "}
        {getCurrentLog().length} newest in full — the{" "}
        {getPagedLog().length} older rounds of this era on pages of their
        own, and <a href="/log/early">the early log</a>; the other{" "}
        {stats.rounds - stats.declaredOrigins} rounds are in{" "}
        <a href="/log/archive">the archive</a>. Every page is counted
        where it is read:{" "}
        {MENTIONS.map((term, index) => (
          <span key={term}>
            {index > 0 ? " and " : ""}
            <a href={`/log/early?q=${term}`}>
              {countMentioning(term, "early")} early
            </a>{" "}
            and{" "}
            <a href={`/log/archive?q=${term}`}>
              {countMentioning(term, "archive")} archived
            </a>{" "}
            for &ldquo;{term}&rdquo;
          </span>
        ))}
        .
      </p>

      <p className="hero-cta-row">
        <a href="/log" className="hero-cta">
          Read every round &rarr;
        </a>
      </p>
    </div>
  );
}
