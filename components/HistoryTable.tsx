"use client";

import { useEffect, useState, useCallback } from "react";

interface HistoryEntry {
  at: string;
  trigger: "manual" | "schedule";
  ok: boolean;
  model?: string;
  reply?: string;
  error?: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// Componente exposto para o pai poder forçar recarga após um disparo.
export default function HistoryTable({ reloadKey }: { reloadKey?: number }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      setEntries(data.entries || []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  return (
    <section className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-200">Histórico</h2>
        <button
          onClick={load}
          className="text-xs text-neutral-500 transition hover:text-neutral-300"
        >
          ↻ Atualizar
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Carregando…</p>
      ) : entries.length === 0 ? (
        <p className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 text-sm text-neutral-500">
          Nenhuma execução ainda. Clique em “Testar agora” ou aguarde um horário
          agendado.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-900/60 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-2 font-medium">Quando</th>
                <th className="px-4 py-2 font-medium">Origem</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Detalhe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {entries.map((e, i) => (
                <tr key={i} className="align-top">
                  <td className="whitespace-nowrap px-4 py-2 text-neutral-300">
                    {formatDate(e.at)}
                  </td>
                  <td className="px-4 py-2 text-neutral-400">
                    {e.trigger === "manual" ? "Manual" : "Agendado"}
                  </td>
                  <td className="px-4 py-2">
                    {e.ok ? (
                      <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-400">
                        ✓ ok
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-400">
                        ✕ erro
                      </span>
                    )}
                  </td>
                  <td className="max-w-xs px-4 py-2 text-neutral-400">
                    <span className="line-clamp-2 break-words">
                      {e.ok ? e.reply : e.error}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
