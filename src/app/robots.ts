import type { MetadataRoute } from "next";

/**
 * robots.txt auto-gerado pelo Next 15 file route.
 *
 * Permite todos os bots em tudo, EXCETO rotas autenticadas (/admin, /minhas-sugestoes).
 * Aponta pro sitemap.
 *
 * PRD §8.1 + Milestones v0.9.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/minhas-sugestoes",
          "/bug-reports/*",
          "/api/*",
        ],
      },
    ],
    sitemap: "https://roadmap.convertaflow.com/sitemap.xml",
    host: "https://roadmap.convertaflow.com",
  };
}
