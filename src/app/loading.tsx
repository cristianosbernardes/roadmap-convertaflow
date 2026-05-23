import { Loader2 } from "lucide-react";
import { Header } from "@/components/header";

/**
 * Loading skeleton global para rotas em SSR.
 */
export default function Loading() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#faf8ff" }}
    >
      <Header />
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="flex items-center gap-3">
          <Loader2
            className="h-5 w-5 animate-spin"
            style={{ color: "var(--brand-primary)" }}
          />
          <span
            className="text-[14px]"
            style={{ color: "var(--text-secondary)" }}
          >
            Carregando...
          </span>
        </div>
      </main>
    </div>
  );
}
