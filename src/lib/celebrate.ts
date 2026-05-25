/**
 * Confetti sutil de celebração (S-D-12).
 *
 * Por que existe:
 *   Quando um usuário vota positivo pela PRIMEIRA vez na sessão, dispara um
 *   micro-momento de celebração — sinal de feedback positivo "registramos seu
 *   voto, obrigado". Inspirado no Productlane, mas calibrado pra ficar SUTIL
 *   (não infantil): poucas partículas, paleta brand, duração curta.
 *
 * Decisões de design (cláusulas pétreas):
 *   - particleCount 30 (default da lib é 50) — menos partículas, mais elegante
 *   - colors: paleta brand ConvertaFlow (#1e7fd4, #fc9e1c, #1a6bbf) — NUNCA
 *     rainbow aleatório (parece app de criança)
 *   - ticks 100 (default 200) — animação ~1s, não polui viewport
 *   - scalar 0.7 — partículas menores que o default
 *   - disableForReducedMotion: true — a11y OBRIGATÓRIO, respeita
 *     prefers-reduced-motion (alguns usuários têm tontura/náusea com motion)
 *
 * Limite de frequência:
 *   1x por sessão (sessionStorage). NÃO localStorage — confetti não deve
 *   persistir cross-aba/dia; é momento, não memória. Se sessionStorage
 *   estiver indisponível (Safari privado, iframe restrito), degrada silenciosa
 *   pra "nunca dispara" — zero impacto funcional, nunca quebra o voto.
 *
 * Origem:
 *   Aceita um DOMRect opcional do botão clicado pra ancorar o cone de
 *   partículas no contexto visual do gesto. Sem rect, cai pra origem padrão
 *   (centro-baixo da viewport) — funciona OK mas é menos contextual.
 */

import confetti from "canvas-confetti";

const CONFETTI_FIRED_KEY = "cf_roadmap_confetti_fired";

/**
 * Verifica se já disparamos o confetti nesta sessão.
 * Retorna false em SSR (sem window) ou se sessionStorage estiver bloqueado.
 */
function shouldFireConfetti(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(CONFETTI_FIRED_KEY) !== "true";
  } catch {
    return false;
  }
}

/**
 * Marca o confetti como já disparado nesta sessão.
 * Silenciosamente engole exceções (storage cheio, modo privado etc).
 */
function markConfettiFired(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(CONFETTI_FIRED_KEY, "true");
  } catch {
    // sessionStorage indisponível — sem problema, o confetti só não persiste
  }
}

/**
 * Dispara confetti sutil de voto positivo.
 *
 * No-op silencioso se:
 *   - SSR (sem window)
 *   - já disparou nesta sessão
 *   - sessionStorage indisponível (Safari privado)
 *   - usuário tem prefers-reduced-motion (canvas-confetti lida internamente)
 *
 * @param originRect — bounding rect opcional do elemento que disparou
 *                     (ex: botão de voto). Usado pra posicionar o cone de
 *                     partículas perto do gesto. Sem rect, usa centro-baixo
 *                     da viewport como fallback.
 */
export function fireVoteConfetti(originRect?: DOMRect): void {
  if (!shouldFireConfetti()) return;

  // Calcula origem normalizada (0..1) a partir do rect do botão clicado.
  // canvas-confetti espera coordenadas relativas à viewport.
  const origin =
    originRect && typeof window !== "undefined"
      ? {
          x: (originRect.left + originRect.width / 2) / window.innerWidth,
          y: (originRect.top + originRect.height / 2) / window.innerHeight,
        }
      : { y: 0.6 };

  confetti({
    particleCount: 30, // sutil — menos é mais
    spread: 50, // cone estreito (default é 45)
    origin,
    colors: [
      "#1e7fd4", // brand-primary (azul ConvertaFlow)
      "#fc9e1c", // brand-cta (laranja CTA)
      "#1a6bbf", // brand-deeper (azul gradiente)
    ],
    ticks: 100, // ~1s de duração (default 200 = 2s)
    gravity: 1.2, // partículas caem um pouco mais rápido que default
    decay: 0.92, // fade-out suave
    scalar: 0.7, // partículas menores (default 1)
    disableForReducedMotion: true, // a11y — NUNCA remover
  });

  markConfettiFired();
}
