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
        window.dispatchEvent(new Event("schedules-changed"));
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
      window.dispatchEvent(new Event("schedules-changed"));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      await fetch(`/api/schedules?id=${id}`, { method: "DELETE" });
      await load();
      window.dispatchEvent(new Event("schedules-changed"));
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
        <div className="space-y-2.5">
          <div className="h-[68px] animate-pulse rounded-xl bg-neutral-900/60" />
          <div className="h-[68px] animate-pulse rounded-xl bg-neutral-900/40" />
        </div>
      ) : schedules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-950/40 px-4 py-8 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-neutral-800/60 text-neutral-400">
            <ClockIcon />
          </div>
          <p className="text-sm font-medium text-neutral-300">
            Nenhum horário ainda
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Adicione abaixo o horário em que o Claude deve ser ativado.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {schedules.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3 transition hover:border-neutral-700"
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={
                    "flex h-11 w-11 items-center justify-center rounded-lg " +
                    (s.enabled
                      ? "bg-orange-500/10 text-orange-400"
                      : "bg-neutral-800/60 text-neutral-500")
                  }
                >
                  <ClockIcon />
                </span>
                <div>
                  <div className="font-mono text-2xl font-semibold leading-none text-neutral-100">
                    {s.time}
                  </div>
                  <StatusLabel
                    enabled={s.enabled}
                    pending={s.enabled && !s.qstashId}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  role="switch"
                  aria-checked={s.enabled}
                  onClick={() => toggle(s)}
                  disabled={busy}
                  title={s.enabled ? "Desativar" : "Ativar"}
                  className={
                    "relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 " +
                    (s.enabled ? "bg-orange-600" : "bg-neutral-700")
                  }
                >
                  <span
                    className={
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all " +
                      (s.enabled ? "left-[22px]" : "left-0.5")
                    }
                  />
                </button>
                <button
                  type="button"
                  onClick={() => remove(s.id)}
                  disabled={busy}
                  title="Remover"
                  aria-label="Remover horário"
                  className="text-neutral-500 transition hover:text-red-400 disabled:opacity-50"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Adicionar novo horário */}
      <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
        <label className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          Adicionar horário
        </label>
        <form
          onSubmit={addTime}
          className="mt-2.5 flex flex-wrap items-center gap-3"
        >
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
            Adicionar
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      <p className="mt-3 text-xs text-neutral-500">
        Horários no fuso de Brasília (BRT). Cada janela do Claude dura 5h.
      </p>
    </section>
  );
}

function StatusLabel({
  enabled,
  pending,
}: {
  enabled: boolean;
  pending: boolean;
}) {
  if (!enabled) {
    return (
      <span className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
        desativado
      </span>
    );
  }
  if (pending) {
    return (
      <span className="mt-1 flex items-center gap-1.5 text-xs text-yellow-400">
        <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
        pendente
      </span>
    );
  }
  return (
    <span className="mt-1 flex items-center gap-1.5 text-xs text-green-400">
      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
      ativo na nuvem
    </span>
  );
}

function ClockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}
