import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  checkCredentials,
  createSessionToken,
} from "@/lib/auth";
import { isRedisConfigured } from "@/lib/redis";
import {
  checkRateLimit,
  registerFailure,
  resetRateLimit,
  getClientIp,
} from "@/lib/rateLimit";

// POST /api/auth  -> valida usuário + senha e cria o cookie de sessão.
// DELETE /api/auth -> logout (apaga o cookie).

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);

  // Anti-força bruta (best-effort: só atua se o Redis estiver configurado).
  if (isRedisConfigured()) {
    try {
      const state = await checkRateLimit(ip);
      if (state.blocked) {
        const minutes = Math.ceil(state.retryAfterSeconds / 60);
        return NextResponse.json(
          {
            error: `Muitas tentativas. Tente novamente em ${minutes} min.`,
          },
          { status: 429 },
        );
      }
    } catch {
      // Se o Redis falhar, não bloqueia o login (degradação segura).
    }
  }

  let username: string | undefined;
  let password: string | undefined;
  try {
    const body = await request.json();
    username = body?.username;
    password = body?.password;
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  if (
    typeof username !== "string" ||
    username.length === 0 ||
    typeof password !== "string" ||
    password.length === 0
  ) {
    return NextResponse.json(
      { error: "Informe usuário e senha" },
      { status: 400 },
    );
  }

  let ok = false;
  try {
    ok = checkCredentials(username, password);
  } catch {
    return NextResponse.json(
      { error: "Servidor sem credenciais configuradas" },
      { status: 500 },
    );
  }

  if (!ok) {
    // Registra a falha para o limite de tentativas.
    if (isRedisConfigured()) {
      try {
        await registerFailure(ip);
      } catch {
        /* ignora falha do Redis */
      }
    }
    // Mensagem genérica de propósito: não revela se errou o usuário ou a senha.
    return NextResponse.json(
      { error: "Usuário ou senha incorretos" },
      { status: 401 },
    );
  }

  // Login OK: zera o contador de tentativas.
  if (isRedisConfigured()) {
    try {
      await resetRateLimit(ip);
    } catch {
      /* ignora falha do Redis */
    }
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
