import { getSiteUrl } from "./lib/site";

export default function sitemap() {
  const siteUrl = getSiteUrl();
  const routes = ["", "/blog", "/directory", "/projects", "/demos"];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
