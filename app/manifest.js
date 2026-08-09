export default function manifest() {
  return {
    name: "AddictedtoAI",
    short_name: "AddictedtoAI",
    description: "AI news, tools, projects, and demos.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0d0f",
    theme_color: "#0b0d0f",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
