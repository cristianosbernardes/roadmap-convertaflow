import type { MetadataRoute } from "next";
import { MOCK_FEATURES } from "@/lib/mock-data";
import { CATEGORY_LIST } from "@/lib/constants";

const SITE_URL = "https://roadmap.convertaflow.com";

/**
 * Sitemap auto-gerado pra Google descobrir todas as paginas dinamicamente.
 *
 * Inclui:
 *   - Paginas estaticas (home, roadmap, changelog, sobre, nova)
 *   - 1 URL por feature (mock; backend Sprint 4 substitui)
 *   - 1 URL por categoria (14 categorias canonicas)
 *   - 1 URL por entry de changelog (mock; backend Sprint 4 substitui)
 *
 * PRD §8.1 + Milestones v0.9.
 * Atualizado automaticamente a cada build (ISR revalida).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/roadmap`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/changelog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/sobre`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/nova`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // 14 paginas de categoria
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORY_LIST.map((cat) => ({
    url: `${SITE_URL}/categoria/${cat.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // 1 URL por feature (apenas as publicadas — todas mock estao publicas por default)
  const featureRoutes: MetadataRoute.Sitemap = MOCK_FEATURES.map((f) => ({
    url: `${SITE_URL}/feature/${f.slug}`,
    lastModified: new Date(f.updatedAt),
    changeFrequency: "weekly" as const,
    priority: f.isFeatured ? 0.85 : 0.6,
  }));

  // Changelog entries individuais (placeholder — rota /changelog/[id] ainda nao existe)
  // Quando criar a rota, descomentar
  // const changelogRoutes: MetadataRoute.Sitemap = MOCK_CHANGELOG.map((entry) => ({
  //   url: `${SITE_URL}/changelog/${entry.id}`,
  //   lastModified: new Date(entry.releaseDate),
  //   changeFrequency: "monthly" as const,
  //   priority: 0.5,
  // }));

  return [...staticRoutes, ...categoryRoutes, ...featureRoutes];
}
