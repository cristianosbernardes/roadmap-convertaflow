"use client"

import { useEffect, useState } from "react"
import { Toaster as SonnerToaster, type ToasterProps } from "sonner"

/**
 * Toaster canônico do projeto (padrão shadcn/ui via sonner).
 *
 * Lê o tema atual do `data-theme` no <html> (light|dark) e observa mudanças
 * via MutationObserver para reagir quando o usuário alterna nas configurações.
 *
 * Configuração default:
 *   - position="top-right"
 *   - richColors=true (vermelho pra erro, verde pra sucesso)
 *   - duration=5000
 *
 * Uso em qualquer componente client:
 *   import { toast } from "sonner"
 *   toast.error("Mensagem clara em PT-BR")
 *   toast.success("Operação concluída")
 *
 * Toast global de erro de mutations vem do MutationCache em
 * `lib/query-client.ts` — só dispara para mutations SEM `onError` próprio.
 */
export function Toaster(props: ToasterProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const update = () => {
      const t = document.documentElement.dataset.theme
      setTheme(t === "dark" ? "dark" : "light")
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    })
    return () => observer.disconnect()
  }, [])

  return (
    <SonnerToaster
      theme={theme}
      richColors
      position="top-right"
      duration={5000}
      {...props}
    />
  )
}
