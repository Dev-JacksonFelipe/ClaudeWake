import { NextRequest, NextResponse } from "next/server";
import { isRedisConfigured } from "@/lib/redis";
import { getPublicConfig, getClaudeToken, saveConfig } from "@/lib/config";

// GET /api/config          -> estado da configuração (sem o token).
// GET /api/config?reveal=1 -> inclui o token em texto puro (só para o dono
//                             logado poder consultar sua própria key).
// PUT /api/config          -> salva token e/ou mensagem.

export async function GET(request: NextRequest) {
  if (!isRedisConfigured()) {
    return NextResponse.json(
      { error: "Redis não configurado", redisConfigured: false },
      { status: 503 },
    );
  }
  try {
    const config = await getPublicConfig();
    const reveal = request.nextUrl.searchParams.get("reveal") === "1";
    const token = reveal ? await getClaudeToken() : undefined;
    return NextResponse.json({ ...config, token, redisConfigured: true });
  } catch {
    return NextResponse.json(
      { error: "Falha ao ler configuração" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!isRedisConfigured()) {
    return NextResponse.json(
      { error: "Redis não configurado" },
      { status: 503 },
    );
  }

  let body: { token?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  try {
    await saveConfig({ token: body.token, message: body.message });
    const config = await getPublicConfig();
    return NextResponse.json({ ok: true, ...config });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Falha ao salvar configuração";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
