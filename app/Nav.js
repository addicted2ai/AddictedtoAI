"use client";

import { usePathname } from "next/navigation";

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
