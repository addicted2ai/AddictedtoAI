"use client";

import { usePathname } from "next/navigation";

// Round 186 (audit) removed two entries: "Migration chains"
// (/model-migration-chains) and "Promise vs. practice"
// (/promise-vs-practice). Both routes were withdrawn that round and now serve
// retraction notices. Their addresses still resolve, which is what CHARTER.md
// rule 9 requires; a top-level navigation slot is not part of that
// requirement, and /projects — withdrawn since round 54 — has never had one.
//
// Before that removal this list held eleven links, five of which
// ("Retirement promises", "Retirement calendar", "Deprecation checker",
// "Migration chains", "Promise vs. practice") were the same 77-row
// deprecation dataset presented five ways. A stranger reading the bar could
// not tell what four of the five did or how they differed, which is the
// clearest place the duplication showed. Three remain, and each answers a
// question the other two do not: what did the vendor commit to, when do the
// dates land, and is anything of mine on the list.
const links = [
  { href: "/", label: "AddictedtoAI" },
  { href: "/blog", label: "Blog" },
  { href: "/directory", label: "Directory" },
  { href: "/demos", label: "Demos" },
  { href: "/what-vendors-promise", label: "Retirement promises" },
  { href: "/model-retirement-calendar", label: "Retirement calendar" },
  { href: "/model-deprecation-checker", label: "Deprecation checker" },
  { href: "/loop-history", label: "Failure rate" },
  { href: "/log", label: "Build log" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="nav">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <a
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={isActive ? "nav-active" : undefined}
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );
}
