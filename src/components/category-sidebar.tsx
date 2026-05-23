import Link from "next/link";
import { Inbox } from "lucide-react";
import { CATEGORY_LIST } from "@/lib/constants";

/**
 * Sidebar direita com lista de categorias.
 * Inspirado em [[01 - ZDG (Upvoty white-label)]] §10.
 *
 * "Todas" no topo + 14 categorias canonicas com icone Lucide colorido.
 */
export function CategorySidebar({
  activeSlug = "all",
}: {
  activeSlug?: string;
}) {
  return (
    <aside className="w-full lg:w-[280px] flex-shrink-0">
      <h2
        className="text-[11px] uppercase tracking-wider mb-3 px-2"
        style={{ color: "var(--text-muted)" }}
      >
        Categorias
      </h2>
      <nav className="flex flex-col gap-0.5">
        <CategoryLink
          href="/"
          label="Todas"
          slug="all"
          isActive={activeSlug === "all"}
          icon={<Inbox className="h-4 w-4" />}
          color="var(--text-secondary)"
        />
        {CATEGORY_LIST.map((cat) => {
          const Icon = cat.icon;
          return (
            <CategoryLink
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              label={cat.label}
              slug={cat.slug}
              isActive={activeSlug === cat.slug}
              icon={<Icon className="h-4 w-4" />}
              color={cat.color}
            />
          );
        })}
      </nav>
    </aside>
  );
}

function CategoryLink({
  href,
  label,
  isActive,
  icon,
  color,
}: {
  href: string;
  label: string;
  slug: string;
  isActive: boolean;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 h-9 px-2.5 rounded-[8px] text-[13px] transition-colors"
      style={{
        background: isActive ? "rgba(30, 127, 212, 0.08)" : "transparent",
        color: isActive
          ? "var(--brand-primary)"
          : "var(--text-secondary)",
        fontWeight: isActive ? 600 : 500,
      }}
    >
      <span style={{ color: isActive ? "var(--brand-primary)" : color }}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}
