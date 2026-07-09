"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginBackground from "@/components/LoginBackground";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Não foi possível entrar");
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-neutral-950 md:grid-cols-[1.15fr_1fr]">
      {/* ============ Painel esquerdo: "quarto do Claude" ============ */}
      <aside className="relative hidden overflow-hidden md:block">
        <LoginBackground />

        {/* Marca */}
        <div className="absolute left-6 top-6 z-10 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white shadow-sm shadow-orange-900/40">
            <BellIcon />
          </span>
          <span className="text-sm font-semibold tracking-tight text-neutral-100">
            ClaudeWake
          </span>
        </div>

        {/* Chamada no rodapé */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-neutral-950 via-neutral-950/85 to-transparent p-8 pt-24 lg:p-12 lg:pt-28">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-50">
            Seu Claude, sempre acordado.
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-neutral-400">
            Abrimos a janela de uso da sua assinatura no horário certo — mesmo
            com o computador desligado.
          </p>
        </div>
      </aside>

      {/* ============ Painel direito: formulário ============ */}
      <main className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          {/* Marca (só no mobile, já que o painel esquerdo some) */}
          <div className="mb-10 flex items-center gap-2.5 md:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white">
              <BellIcon />
            </span>
            <span className="text-sm font-semibold tracking-tight text-neutral-100">
              ClaudeWake
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">Entrar no painel</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Use seu usuário e senha para acessar.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="username"
                className="text-xs font-medium uppercase tracking-wide text-neutral-400"
              >
                Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="seu usuário"
                autoFocus
                autoComplete="username"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-neutral-100 outline-none transition focus:border-orange-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium uppercase tracking-wide text-neutral-400"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="sua senha"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 pr-12 text-neutral-100 outline-none transition focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-neutral-200"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-lg bg-orange-600 px-4 py-3 font-medium text-white transition hover:bg-orange-500 disabled:opacity-50"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>

            <button
              type="button"
              onClick={() => setShowHint((v) => !v)}
              className="self-end text-sm text-neutral-400 transition hover:text-neutral-200"
            >
              Esqueceu a senha?
            </button>
            {showHint && (
              <p className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3 text-xs leading-relaxed text-neutral-400">
                A senha é definida no servidor, na variável de ambiente{" "}
                <code className="text-neutral-300">APP_PASSWORD</code> (no painel
                da Vercel). Ajuste-a por lá se precisar trocá-la.
              </p>
            )}
          </form>

          {/* Rodapé: status do agendamento */}
          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-neutral-800 pt-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              agendamento ativo
            </span>
            <span className="text-xs text-neutral-500">
              janela de uso abre automaticamente
            </span>
          </div>
        </div>
      </main>
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

function EyeIcon() {
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
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
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
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
