"use client";

import { useEffect, useState, useCallback } from "react";

interface Schedule {
  id: string;
  time: string;
  enabled: boolean;
}

// Formata "06:00" -> "6h", "08:30" -> "8h30".
function fmt(time: string): string {
  const [h, m] = time.split(":");
  const hh = parseInt(h, 10);
  return m === "00" ? `${hh}h` : `${hh}h${m}`;
}

// Card do topo que mostra, de forma resumida, os horários que o usuário definiu.
// Atualiza sozinho quando a lista de horários muda (evento "schedules-changed").
export default function ScheduleSummaryCard() {
  const [times, setTimes] = useState<string[] | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/schedules");
      const data = await res.json();
      if (res.ok) {
        const enabled = (data.schedules || [])
          .filter((s: Schedule) => s.enabled)
          .map((s: Schedule) => s.time)
          .sort();
        setTimes(enabled);
      }
    } catch {
      /* ignora */
    }
  }, []);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("schedules-changed", handler);
    return () => window.removeEventListener("schedules-changed", handler);
  }, [load]);

  let title = "—";
  let subtitle = "nenhum horário ativo";

  if (times === null) {
    title = "…";
    subtitle = "carregando";
  } else if (times.length > 0) {
    const labels = times.map(fmt);
    if (labels.length === 1) title = labels[0];
    else if (labels.length === 2) title = `${labels[0]} e ${labels[1]}`;
    else if (labels.length <= 3) title = labels.join(" · ");
    else title = `${labels.length} horários`;
    subtitle = times.length === 1 ? "horário ativo" : "horários ativos";
  }

  return (
    <div className="panel flex flex-col gap-2 p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-lg">
        🕕
      </div>
      <div className="text-lg font-semibold text-neutral-100">{title}</div>
      <div className="text-sm text-neutral-400">{subtitle}</div>
    </div>
  );
}
