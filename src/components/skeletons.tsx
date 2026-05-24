import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeletons especificos por componente — Sprint C item S-C-02.
 *
 * Estrategia: cada skeleton mimetiza dimensoes e layout do componente real
 * pra evitar layout shift (CLS) durante o carregamento. Inspiracao:
 * Productlane, Linear, Featurebase usam shimmers especificos por widget.
 *
 * Cores: `bg-muted` herdado de `Skeleton` (shadcn) — neutralidade visual.
 * Border-radius: 10px nos cards (igual aos componentes reais),
 * 7px em itens aninhados (concentric corners) e full em avatares/pills.
 */

// ─── Cards individuais ────────────────────────────────────────────────

/**
 * Mimetiza `FeatureCard` — layout horizontal: icon | conteudo | vote.
 * Altura aproximada: ~104px (4 linhas + paddings).
 */
export function FeatureCardSkeleton() {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-[10px]"
      style={{
        background: "var(--surface-card)",
        border: "1.5px solid var(--border-primary)",
      }}
      aria-hidden="true"
    >
      {/* Categoria icon (40x40) */}
      <Skeleton className="h-10 w-10 rounded-[10px] flex-shrink-0" />

      {/* Conteudo central */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Titulo (1 linha truncada — ~70% width) */}
        <Skeleton className="h-4 w-3/4 rounded-[7px]" />
        {/* Summary (1 linha) */}
        <Skeleton className="h-3 w-full rounded-[7px]" />
        {/* Footer: status pill + comments + categoria */}
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-3 w-10 rounded-[7px]" />
          <Skeleton className="h-3 w-24 rounded-[7px]" />
        </div>
      </div>

      {/* Vote button (chevron + contador, ~48x60) */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <Skeleton className="h-10 w-12 rounded-[10px]" />
      </div>
    </div>
  );
}

/**
 * Mimetiza `KanbanCard` — mais compacto que FeatureCard.
 * Altura aproximada: ~68px.
 */
export function KanbanCardSkeleton() {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-[10px]"
      style={{
        background: "var(--surface-card)",
        border: "1.5px solid var(--border-primary)",
      }}
      aria-hidden="true"
    >
      {/* Icon menor (32x32) */}
      <Skeleton className="h-8 w-8 rounded-[7px] flex-shrink-0" />

      <div className="flex-1 min-w-0 space-y-2">
        {/* Titulo 1 linha truncado */}
        <Skeleton className="h-3.5 w-4/5 rounded-[7px]" />
        {/* Comment count */}
        <Skeleton className="h-2.5 w-12 rounded-[7px]" />
      </div>

      {/* Vote button compacto */}
      <Skeleton className="h-9 w-10 rounded-[10px] flex-shrink-0" />
    </div>
  );
}

/**
 * Mimetiza `CommentThread` (1 comentario top-level com avatar + corpo + footer).
 */
export function CommentThreadSkeleton() {
  return (
    <div
      className="rounded-[10px] p-4"
      style={{
        background: "var(--surface-card)",
        border: "1.5px solid var(--border-primary)",
      }}
      aria-hidden="true"
    >
      {/* Header: avatar + autor + meta */}
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <Skeleton className="h-3.5 w-32 rounded-[7px]" />
          <Skeleton className="h-2.5 w-20 rounded-[7px]" />
        </div>
      </div>

      {/* Corpo (2-3 linhas) */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full rounded-[7px]" />
        <Skeleton className="h-3 w-11/12 rounded-[7px]" />
        <Skeleton className="h-3 w-2/3 rounded-[7px]" />
      </div>

      {/* Footer: Responder + reactions */}
      <div className="flex items-center gap-1.5 mt-3">
        <Skeleton className="h-7 w-24 rounded-[7px]" />
        <Skeleton className="h-7 w-12 rounded-full" />
        <Skeleton className="h-7 w-12 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Mimetiza um item de release no /changelog (data sticky + corpo).
 */
export function ChangelogItemSkeleton() {
  return (
    <article
      className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6"
      aria-hidden="true"
    >
      {/* Coluna esquerda: data + reactions */}
      <aside>
        <div className="flex md:flex-col items-start gap-3">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-24 rounded-[7px]" />
            <Skeleton className="h-3 w-16 rounded-[7px]" />
          </div>
          <div className="flex md:mt-3 items-center gap-1.5">
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>
      </aside>

      {/* Coluna direita: card de conteudo */}
      <div
        className="rounded-[10px] p-6 space-y-3"
        style={{
          background: "var(--surface-card)",
          border: "1.5px solid var(--border-primary)",
        }}
      >
        <Skeleton className="h-6 w-3/4 rounded-[7px]" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-3 w-full rounded-[7px]" />
          <Skeleton className="h-3 w-11/12 rounded-[7px]" />
          <Skeleton className="h-3 w-5/6 rounded-[7px]" />
          <Skeleton className="h-3 w-3/4 rounded-[7px]" />
        </div>
      </div>
    </article>
  );
}

// ─── Listas (multiplos skeletons) ─────────────────────────────────────

interface SkeletonListProps {
  count?: number;
}

/**
 * Lista de N FeatureCardSkeleton com gap consistente — usado em /, /categoria, /status.
 */
export function FeatureListSkeleton({ count = 5 }: SkeletonListProps) {
  return (
    <div
      className="flex flex-col gap-2.5"
      role="status"
      aria-label="Carregando features"
    >
      {Array.from({ length: count }).map((_, i) => (
        <FeatureCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Coluna de N KanbanCardSkeleton — usado em /roadmap dentro de cada coluna.
 */
export function KanbanColumnSkeleton({ count = 4 }: SkeletonListProps) {
  return (
    <div
      className="flex flex-col gap-2"
      role="status"
      aria-label="Carregando coluna"
    >
      {Array.from({ length: count }).map((_, i) => (
        <KanbanCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Thread de N CommentThreadSkeleton — usado em /feature/[slug].
 */
export function CommentsThreadSkeleton({ count = 3 }: SkeletonListProps) {
  return (
    <div
      className="flex flex-col gap-3"
      role="status"
      aria-label="Carregando comentarios"
    >
      {Array.from({ length: count }).map((_, i) => (
        <CommentThreadSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Lista de N ChangelogItemSkeleton — usado em /changelog.
 */
export function ChangelogListSkeleton({ count = 3 }: SkeletonListProps) {
  return (
    <div
      className="flex flex-col gap-10"
      role="status"
      aria-label="Carregando changelog"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ChangelogItemSkeleton key={i} />
      ))}
    </div>
  );
}
