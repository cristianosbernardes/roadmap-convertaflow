/**
 * Helpers canônicos de toast (S-D-09).
 *
 * Por que existem
 * ---------------
 * Antes desta lib, cada componente chamava `toast.success(...)` /
 * `toast.error(...)` direto com durations e descriptions arbitrários:
 * - reactions-bar usava 1500ms; vote-button usava 2500ms ou 3000ms;
 *   new-feature-form usava 5000ms; share-button caía no default 4000ms.
 * - Algumas chamadas tinham description, outras não, sem critério.
 *
 * Esses 4 presets resolvem isso:
 *
 *  | Preset            | Duração | Quando usar                                     |
 *  |-------------------|---------|-------------------------------------------------|
 *  | toastSuccess      | 2500ms  | Confirmação leve (voto, reação, atualização,    |
 *  |                   |         | "link copiado"). Microação reversível.          |
 *  | toastSuccessLong  | 5000ms  | Ação com impacto duradouro (formulário enviado, |
 *  |                   |         | sugestão em moderação). Usuário precisa ler.    |
 *  | toastError        | 4000ms  | Falha (rate limit, validação, network).         |
 *  |                   |         | Tempo suficiente pra ler retry hint.            |
 *  | toastInfo         | 2000ms  | Estado neutro (progresso, dica). Sem cor.       |
 *
 * Position
 * --------
 * Toaster vive em `src/app/layout.tsx` com `position="bottom-right"
 * richColors`. Todos os toasts saem do mesmo canto inferior direito —
 * NÃO sobrescrever position em call sites.
 *
 * Microcopy
 * ---------
 * - Title: frase curta no infinitivo passado ou particípio
 *   ("Voto registrado", "Link copiado", "Erro ao enviar").
 * - Description: opcional, contextualiza ou orienta próximo passo
 *   ("Tente de novo.", "Está em moderação.").
 * - PT-BR com acentos corretos sempre (cláusula pétrea §8).
 */

import { toast as sonnerToast } from "sonner";

/**
 * Sucesso curto (2500ms) — votos, reações, "link copiado", updates simples.
 * Use quando a ação é reversível e o usuário não precisa parar pra ler.
 */
export function toastSuccess(title: string, description?: string) {
  return sonnerToast.success(title, {
    description,
    duration: 2500,
  });
}

/**
 * Sucesso longo (5000ms) — sugestões enviadas, formulários, ações com
 * impacto duradouro (ex.: "está em moderação", "email enviado").
 * Use quando o usuário precisa ler a description pra entender o próximo passo.
 */
export function toastSuccessLong(title: string, description?: string) {
  return sonnerToast.success(title, {
    description,
    duration: 5000,
  });
}

/**
 * Erro (4000ms) — rate limit, validação, falha de network.
 * Duração maior que sucesso pra usuário conseguir ler o motivo + retry hint.
 */
export function toastError(title: string, description?: string) {
  return sonnerToast.error(title, {
    description,
    duration: 4000,
  });
}

/**
 * Info neutro (2000ms) — progresso, dica, status intermediário.
 * Usa `toast.message` (sem cor) em vez de `toast.info` pra não competir
 * com success (verde) e error (vermelho) na hierarquia visual.
 */
export function toastInfo(title: string, description?: string) {
  return sonnerToast.message(title, {
    description,
    duration: 2000,
  });
}
