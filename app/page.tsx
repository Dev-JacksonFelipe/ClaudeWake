import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import DashboardPanel from "@/components/DashboardPanel";
import ScheduleSummaryCard from "@/components/ScheduleSummaryCard";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Barra de topo */}
      <header className="sticky top-0 z-20 border-b border-neutral-800/60 bg-neutral-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white shadow-sm shadow-orange-900/40">
              <BellIcon />
            </span>
            <span className="text-sm font-semibold tracking-tight text-neutral-100">
              ClaudeWake
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/60 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-neutral-600 hover:text-neutral-100"
            >
              <GearIcon />
              <span className="hidden sm:inline">Configurações</span>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col gap-10 px-6 pb-20 pt-12">
        {/* Hero */}
        <section className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            ClaudeWake
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-neutral-400">
            Ativa automaticamente a janela de limites do seu Claude nos horários
            que você definir — direto da nuvem, sem depender do seu computador
            ligado.
          </p>
        </section>

        {/* Destaques */}
        <section className="grid gap-4 sm:grid-cols-3">
          <ScheduleSummaryCard />
          <StatCard icon="☁️" title="Na nuvem" subtitle="PC pode ficar desligado" />
          <StatCard icon="🔑" title="Sua assinatura" subtitle="usa seu login do Claude" />
        </section>

        {/* Painéis (teste, horários, histórico) */}
        <DashboardPanel />
      </main>
    </div>
  );
}

function StatCard({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="panel flex flex-col gap-2 p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-lg">
        {icon}
      </div>
      <div className="text-lg font-semibold text-neutral-100">{title}</div>
      <div className="text-sm text-neutral-400">{subtitle}</div>
    </div>
  );
}

function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
