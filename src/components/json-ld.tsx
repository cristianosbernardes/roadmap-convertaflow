import type { Feature } from "@/types/roadmap";
import { STATUSES, CATEGORIES } from "@/lib/constants";

/**
 * Structured data (JSON-LD) pra Google + redes sociais entenderem o conteudo.
 * Inserido via <script type="application/ld+json"> no &lt;head>.
 *
 * Padroes schema.org usados:
 *   - SoftwareApplication (no layout — descreve a ConvertaFlow)
 *   - Article (em /feature/[slug] — cada feature vira artigo indexavel)
 *
 * PRD §8.1 + Sprint A.7.
 */

export function SoftwareApplicationLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ConvertaFlow",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Plataforma omnichannel + IA para atendimento e conversão pelo WhatsApp, Instagram e Facebook.",
    url: "https://convertaflow.com",
    image: "https://convertaflow.com/og-image.png",
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
    },
    publisher: {
      "@type": "Organization",
      name: "ConvertaFlow",
      url: "https://convertaflow.com",
      logo: {
        "@type": "ImageObject",
        url: "https://convertaflow.com/icon.svg",
      },
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FeatureArticleLd({ feature }: { feature: Feature }) {
  const status = STATUSES[feature.status];
  const category = CATEGORIES[feature.category];

  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: feature.title,
    description: feature.descriptionShort || feature.description.slice(0, 200),
    datePublished: feature.publishedAt || feature.createdAt,
    dateModified: feature.updatedAt,
    author: {
      "@type": "Organization",
      name: "ConvertaFlow",
      url: "https://convertaflow.com",
    },
    publisher: {
      "@type": "Organization",
      name: "ConvertaFlow",
      logo: {
        "@type": "ImageObject",
        url: "https://convertaflow.com/icon.svg",
      },
    },
    image: `https://roadmap.convertaflow.com/feature/${feature.slug}/opengraph-image`,
    url: `https://roadmap.convertaflow.com/feature/${feature.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://roadmap.convertaflow.com/feature/${feature.slug}`,
    },
    articleSection: category.label,
    keywords: [
      category.label,
      status.label,
      "ConvertaFlow",
      "roadmap",
      ...feature.tags.map((t) => t.slug),
    ].join(", "),
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/LikeAction",
      userInteractionCount: feature.voteCount,
    },
    commentCount: feature.commentCount,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
