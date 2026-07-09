"use client";

import { useEffect, useState, useCallback } from "react";
import TimePicker from "./TimePicker";

interface Schedule {
  id: string;
  time: string;
  enabled: boolean;
  qstashId?: string;
}

export default function ScheduleList() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [qstashConfigured, setQstashConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [newTime, setNewTime] = useState("06:00");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/schedules");
      const data = await res.json();
      if (res.ok) {
        setSchedules(data.schedules || []);
        setQstashConfigured(data.qstashConfigured);
      }
    } catch {
      /* ignora */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addTime(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time: newTime }),
      });
      const data = await res.json();
      if (res.ok) {
        await load();
      } else {
        setError(data.error || "Falha ao adicionar");
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(s: Schedule) {
    setBusy(true);
    try {
      await fetch("/api/schedules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: s.id, enabled: !s.enabled }),
      });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      await fetch(`/api/schedules?id=${id}`, { method: "DELETE" });
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="w-full">
      <h2 className="text-lg font-semibold text-neutral-100">
        Horários automáticos
      </h2>
      <p className="mb-4 mt-1 text-sm text-neutral-400">
        O Claude é ativado automaticamente nos horários abaixo.
      </p>

      {!qstashConfigured && (
        <div className="mb-3 rounded-lg border border-yellow-600/40 bg-yellow-600/10 p-3 text-xs text-yellow-300">
          Os horários estão salvos, mas o disparo automático só liga quando o
          QStash estiver conectado. Enquanto isso, use o botão “Testar agora”.
        </div>
      )}

      {loading ? (
        <p className="text-sm text-neutral-500">Carregando…</p>
      ) : (
        <div className="space-y-2">
          {schedules.length === 0 && (
            <p className="text-sm text-neutral-500">Nenhum horário ainda.</p>
          )}

          {schedules.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950/50 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl text-neutral-100">
                  {s.time}
                </span>
                {s.enabled ? (
                  s.qstashId ? (
                    <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-400">
                      ativo na nuvem
                    </span>
                  ) : (
                    <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-400">
                      pendente
                    </span>
                  )
                ) : (
                  <span className="rounded-full bg-neutral-700/40 px-2 py-0.5 text-xs text-neutral-400">
                    desativado
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggle(s)}
                  disabled={busy}
                  className="text-sm text-neutral-400 transition hover:text-neutral-200 disabled:opacity-50"
                >
                  {s.enabled ? "Desativar" : "Ativar"}
                </button>
                <button
                  onClick={() => remove(s.id)}
                  disabled={busy}
                  className="text-sm text-red-400/80 transition hover:text-red-300 disabled:opacity-50"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={addTime} className="mt-4 flex items-center gap-3">
        <TimePicker value={newTime} onChange={setNewTime} disabled={busy} />
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-500 disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Adicionar horário
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      <p className="mt-2 text-xs text-neutral-500">
        Horários no fuso de Brasília (BRT). Cada janela do Claude dura 5h.
      </p>
    </section>
  );
}
