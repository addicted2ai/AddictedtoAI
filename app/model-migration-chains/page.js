import { feedAlternates, getRepoUrl } from "../lib/site";
import { RETIREMENT_DATES } from "../lib/retirement-dates";
import AiDisclosure from "../components/AiDisclosure";
import ModelMigrationChains from "./ModelMigrationChains";

export const metadata = {
  title: "Model migration chains — where a retiring model actually lands",
  description:
    "RETIREMENT_DATES' replacement field sometimes points at another model that is itself retiring. This follows that chain hop by hop to wherever it actually stops, or flags that it doesn't, using the same data behind the retirement calendar and the deprecation checker.",
  alternates: {
    canonical: "/model-migration-chains",
    types: {
      ...feedAlternates,
      "text/calendar": [
        { url: "/model-retirement-calendar.ics", title: "Model retirement calendar" },
      ],
    },
  },
};

export default function ModelMigrationChainsPage() {
  const repoUrl = getRepoUrl();

  return (
    <article>
      <AiDisclosure route="/model-migration-chains" />
      <h1>Model migration chains</h1>
      <p>
        <a href="/model-retirement-calendar">The retirement calendar</a>{" "}
        lists a replacement for each dying model or API &mdash; but a
        replacement can itself be a row on that same calendar. Migrate off{" "}
        <code>gpt-4o-mini-realtime-preview</code> onto its named replacement,{" "}
        <code>gpt-realtime-mini</code>, and you have moved onto a model that
        is <em>also</em> dated &mdash; you would only find that out by
        hitting a second retirement later. This follows the{" "}
        <code>replacement</code> field hop by hop until it actually stops, or
        tells you that it doesn&rsquo;t.
      </p>
      <p>
        Some rows name more than one option (
        <code>dall-e-2</code>&rsquo;s replacement reads &ldquo;gpt-image-2,
        gpt-image-1, or gpt-image-1-mini&rdquo;) or a qualifier alongside the
        identifier (<code>o1-pro-2025-03-19</code> reads &ldquo;gpt-5.6-sol
        (reasoning.mode: pro)&rdquo;). Both are parsed, not treated as one
        opaque string, so which option you&rsquo;d actually pick is not lost.
      </p>

      <ModelMigrationChains />

      <p className="checker-callout">
        Want to check your own config instead of one identifier at a time?{" "}
        <a href="/model-deprecation-checker">
          Paste it into the deprecation checker
        </a>{" "}
        to see every identifier it recognizes, then bring anything retiring
        back here to see where it actually leads.
      </p>

      <p className="post-footnote">
        Reads the same {RETIREMENT_DATES.length}-row{" "}
        <a href="/model-retirement-calendar">retirement calendar</a> data as
        the other two pages here, entirely in your browser &mdash; nothing
        you type is sent anywhere.{" "}
        {repoUrl ? (
          <a href={`${repoUrl}/blob/main/scripts/check-model-migration-chains.mjs`}>
            A CI check
          </a>
        ) : (
          "A CI check"
        )}{" "}
        walks every chain in the live data on every build and asserts none of
        them loop or fail to resolve.
      </p>
    </article>
  );
}
