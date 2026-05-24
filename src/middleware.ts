import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Middleware Clerk.
 * Rotas publicas (leitura) nao precisam auth.
 * Rotas listadas em isProtectedRoute exigem JWT valido.
 *
 * Detalhes em [[Auth e Multi-domain Clerk]] no Obsidian.
 */
// Rotas /nova e /bug-reports/novo NÃO entram aqui — gate é in-page via
// <PermissionGate> pra UX paywall melhor (visitante vê página com modal CTA,
// não redirect 404). Apenas rotas que NUNCA fazem sentido pra visitante:
const isProtectedRoute = createRouteMatcher([
  "/minhas-sugestoes(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip arquivos estaticos e _next
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Inclui API e tRPC
    "/(api|trpc)(.*)",
  ],
};
