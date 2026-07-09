import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// Protege todas as páginas e APIs, exceto:
// - /login (a própria tela de login)
// - /api/auth (endpoint que valida a senha)
// - /api/trigger (chamado pelo QStash com assinatura própria, sem cookie)
const PUBLIC_PATHS = ["/login", "/api/auth", "/api/trigger"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const authenticated = await verifySessionToken(token);

  if (authenticated) {
    return NextResponse.next();
  }

  // Requisições de API não autenticadas recebem 401.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Páginas redirecionam para o login.
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Aplica o middleware a tudo, menos arquivos estáticos do Next e ícones.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
