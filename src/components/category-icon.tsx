import { CATEGORIES, type CategorySlug } from "@/lib/constants";

/**
 * Caixa quadrada com icone Lucide colorido por categoria.
 * Cor de fundo: hex da categoria com ~8% opacidade.
 *
 * Exceção: categoria 'ai' usa gradient (definido em CATEGORIES[ai].iconGradient).
 */
export function CategoryIcon({
  category,
  size = "md",
}: {
  category: CategorySlug;
  size?: "sm" | "md" | "lg";
}) {
  const cfg = CATEGORIES[category];
  const Icon = cfg.icon;

  const dimensions = {
    sm: { box: "h-8 w-8", icon: "h-4 w-4", radius: "rounded-[8px]" },
    md: { box: "h-10 w-10", icon: "h-5 w-5", radius: "rounded-[10px]" },
    lg: { box: "h-12 w-12", icon: "h-6 w-6", radius: "rounded-[10px]" },
  }[size];

  const isGradient = !!cfg.iconGradient;

  return (
    <div
      className={`${dimensions.box} ${dimensions.radius} flex items-center justify-center flex-shrink-0`}
      style={
        isGradient
          ? {
              background: cfg.iconGradient,
              color: "#ffffff",
            }
          : {
              background: `${cfg.color}15`,
              color: cfg.color,
            }
      }
      aria-label={cfg.label}
    >
      <Icon className={dimensions.icon} />
    </div>
  );
}
