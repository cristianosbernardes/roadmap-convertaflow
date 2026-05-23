import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Middleware Clerk.
 * Rotas publicas (leitura) nao precisam auth.
 * Rotas listadas em isProtectedRoute exigem JWT valido.
 *
 * Detalhes em [[Auth e Multi-domain Clerk]] no Obsidian.
 */
const isProtectedRoute = createRouteMatcher([
  "/nova(.*)",
  "/minhas-sugestoes(.*)",
  "/admin(.*)",
  "/bug-reports/novo(.*)",
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
