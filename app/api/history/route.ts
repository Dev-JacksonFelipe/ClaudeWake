import { NextResponse } from "next/server";
import { isRedisConfigured } from "@/lib/redis";
import { getHistory } from "@/lib/history";

// GET /api/history — lista as execuções (mais recentes primeiro).

export async function GET() {
  if (!isRedisConfigured()) {
    return NextResponse.json(
      { error: "Redis não configurado", entries: [] },
      { status: 503 },
    );
  }
  try {
    const entries = await getHistory();
    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json(
      { error: "Falha ao ler histórico", entries: [] },
      { status: 500 },
    );
  }
}
