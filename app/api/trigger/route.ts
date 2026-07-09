import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { isRedisConfigured } from "@/lib/redis";
import { verifyQstashSignature } from "@/lib/qstash";
import { getClaudeToken, getMessage } from "@/lib/config";
import { activateWindow } from "@/lib/claude";
import { addHistory } from "@/lib/history";

// POST /api/trigger — envia a mensagem ao Claude e ativa a janela de limites.
//
// Autorização (dois caminhos):
//  - Sessão logada  -> botão "Testar agora" (origem "manual")
//  - Assinatura QStash válida -> disparo automático agendado (origem "schedule")

// Permite execuções mais longas (cold start + chamada ao Claude).
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  // O middleware deixa esta rota passar (para o QStash), então a autorização
  // é feita aqui: sessão logada OU assinatura válida do QStash.
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const sessionOk = await verifySessionToken(sessionToken);

  let trigger: "manual" | "schedule" = "manual";

  if (!sessionOk) {
    // Sem sessão: precisa ser um disparo assinado pelo QStash.
    const signature = request.headers.get("upstash-signature");
    const body = await request.text();
    const qstashOk = signature
      ? await verifyQstashSignature(signature, body)
      : false;
    if (!qstashOk) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    trigger = "schedule";
  }

  if (!isRedisConfigured()) {
    return NextResponse.json(
      { error: "Redis não configurado" },
      { status: 503 },
    );
  }

  const claudeToken = await getClaudeToken();
  if (!claudeToken) {
    return NextResponse.json(
      { error: "Token do Claude não configurado nas Configurações." },
      { status: 400 },
    );
  }

  const message = await getMessage();
  const result = await activateWindow(claudeToken, message);

  await addHistory({
    at: new Date().toISOString(),
    trigger,
    ok: result.ok,
    model: result.model,
    reply: result.reply,
    error: result.error,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    model: result.model,
    reply: result.reply,
  });
}
