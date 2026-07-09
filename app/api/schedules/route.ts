import { NextRequest, NextResponse } from "next/server";
import { isRedisConfigured } from "@/lib/redis";
import { isQstashConfigured } from "@/lib/qstash";
import {
  listSchedules,
  addSchedule,
  setEnabled,
  removeSchedule,
  seedDefaults,
} from "@/lib/schedules";

// GET    /api/schedules       -> lista horários (semeia 06:00/14:00 na 1ª vez)
// POST   /api/schedules       -> cria horário   { time: "HH:mm" }
// PATCH  /api/schedules       -> ativa/desativa { id, enabled }
// DELETE /api/schedules?id=.. -> remove horário

function guard(): NextResponse | null {
  if (!isRedisConfigured()) {
    return NextResponse.json({ error: "Redis não configurado" }, { status: 503 });
  }
  return null;
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function GET() {
  const blocked = guard();
  if (blocked) return blocked;
  try {
    await seedDefaults();
    const schedules = await listSchedules();
    return NextResponse.json({
      schedules,
      qstashConfigured: isQstashConfigured(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao listar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const blocked = guard();
  if (blocked) return blocked;
  try {
    const { time } = await request.json();
    if (typeof time !== "string" || !TIME_RE.test(time)) {
      return NextResponse.json(
        { error: "Horário inválido (use HH:mm)" },
        { status: 400 },
      );
    }
    const schedule = await addSchedule(time, true, request.nextUrl.origin);
    return NextResponse.json({ ok: true, schedule });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao criar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const blocked = guard();
  if (blocked) return blocked;
  try {
    const { id, enabled } = await request.json();
    if (typeof id !== "string" || typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }
    const schedule = await setEnabled(id, enabled, request.nextUrl.origin);
    if (!schedule) {
      return NextResponse.json({ error: "Horário não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, schedule });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao atualizar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const blocked = guard();
  if (blocked) return blocked;
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id ausente" }, { status: 400 });
    }
    await removeSchedule(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao remover";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
