import { feedAlternates, getRepoUrl } from "../lib/site";
import { RETIREMENT_DATES } from "../lib/retirement-dates";
import AiDisclosure from "../components/AiDisclosure";
import ModelDeprecationChecker from "./ModelDeprecationChecker";

export const metadata = {
  title: "Model deprecation checker — paste a config, get back what's retired",
  description:
    "Paste a config file, a package.json, an .env, code, or a plain list of model IDs, and see which identifiers are retired or retiring, when, and what the vendor names as the replacement. Runs entirely in your browser against the same data behind the model retirement calendar.",
  alternates: {
    canonical: "/model-deprecation-checker",
    types: feedAlternates,
  },
};

export default function ModelDeprecationCheckerPage() {
  const repoUrl = getRepoUrl();

  return (
    <article>
      <AiDisclosure route="/model-deprecation-checker" />
      <h1>Model deprecation checker</h1>
      <p>
        A model you depend on just started 404ing. Paste whatever you have —
        a config file, a <code>package.json</code>, an <code>.env</code>,
        a code snippet, or a bare list of model IDs — and this checks it
        against the {RETIREMENT_DATES.length} dated OpenAI and Anthropic
        shutdowns behind{" "}
        <a href="/model-retirement-calendar">the retirement calendar</a>. No
        sign-up, no configuration, and nothing you paste is sent anywhere:
        matching runs in your browser against data already shipped to the
        page, and this tool reports nothing about your paste, not even a
        match count. The site counts page views like any other page &mdash;
        see <a href="/disclosure">the disclosure page</a>.
      </p>
      <p>
        It reads the vendors&rsquo; own aliases, not just the dated snapshot
        name — OpenAI&rsquo;s deprecations page lists{" "}
        <code>gpt-3.5-turbo-0125</code> as retiring, and separately says that
        name is &ldquo;also&rdquo; <code>gpt-3.5-turbo</code>, the form
        almost everyone actually has in a config. The checker matches
        either.
      </p>

      <ModelDeprecationChecker />

      <p className="post-footnote">
        Matches only what is in{" "}
        <a href="/model-retirement-calendar">the retirement calendar</a> —
        currently {RETIREMENT_DATES.length} OpenAI and Anthropic shutdowns
        with a dated shutdown, each read off the vendor&rsquo;s own page. An
        identifier this checker does not flag may still be a model you
        should not build on for other reasons; it only answers &ldquo;is this
        one of the shutdowns this site has verified&rdquo;.{" "}
        {repoUrl ? (
          <a
            href={`${repoUrl}/blob/main/scripts/check-model-deprecation-parser.mjs`}
          >
            A CI check
          </a>
        ) : (
          "A CI check"
        )}{" "}
        re-verifies, on every build, that this matching still finds every
        identifier and alias currently in the data.
      </p>
    </article>
  );
}
