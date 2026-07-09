"use client";

import { useState } from "react";
import TestButton from "./TestButton";
import HistoryTable from "./HistoryTable";
import ScheduleList from "./ScheduleList";

// Junta o botão de teste, os horários e o histórico — cada um em seu painel,
// para dar equilíbrio visual (todos com a mesma largura e alinhamento).
export default function DashboardPanel() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="flex flex-col gap-6">
      <section className="panel p-6">
        <h2 className="text-lg font-semibold text-neutral-100">
          Testar ativação
        </h2>
        <p className="mt-1 text-sm text-neutral-400">
          Envie uma mensagem ao Claude agora para abrir a janela manualmente,
          sem esperar um horário agendado.
        </p>
        <div className="mt-4">
          <TestButton onDone={() => setReloadKey((k) => k + 1)} />
        </div>
      </section>

      <section className="panel p-6">
        <ScheduleList />
      </section>

      <section className="panel p-6">
        <HistoryTable reloadKey={reloadKey} />
      </section>
    </div>
  );
}
