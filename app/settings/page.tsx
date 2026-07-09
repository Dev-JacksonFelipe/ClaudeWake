"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ConfigState {
  tokenConfigured: boolean;
  message: string;
  redisConfigured: boolean;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<ConfigState | null>(null);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [savedToken, setSavedToken] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);
  const [editingToken, setEditingToken] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      if (res.ok) {
        setConfig(data);
        setMessage(data.message ?? "");
      } else {
        setConfig({
          tokenConfigured: false,
          message: "",
          redisConfigured: data.redisConfigured ?? false,
        });
      }
    } catch {
      setConfig({ tokenConfigured: false, message: "", redisConfigured: false });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function revealToken() {
    if (savedToken) {
      // já revelado -> esconder de novo
      setSavedToken(null);
      return;
    }
    setRevealing(true);
    try {
      const res = await fetch("/api/config?reveal=1");
      const data = await res.json();
      setSavedToken(data.token || "");
    } catch {
      setSavedToken("");
    } finally {
      setRevealing(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const payload: { token?: string; message?: string } = {};
      if (token.trim()) payload.token = token.trim();
      if (message.trim()) payload.message = message.trim();

      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "ok", text: "Configuração salva com sucesso!" });
        setToken("");
        setSavedToken(null);
        setEditingToken(false);
        setConfig(data);
      } else {
        setFeedback({ type: "error", text: data.error || "Falha ao salvar" });
      }
    } catch {
      setFeedback({ type: "error", text: "Erro de conexão" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-neutral-800/60 bg-neutral-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white shadow-sm shadow-orange-900/40">
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
            </span>
            <span className="text-sm font-semibold tracking-tight text-neutral-100">
              ClaudeWake
            </span>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/60 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-neutral-600 hover:text-neutral-100"
          >
            ← Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 pb-20 pt-10">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Token do Claude e mensagem de ativação.
          </p>
        </div>

      {loading ? (
        <p className="text-neutral-500">Carregando…</p>
      ) : !config?.redisConfigured ? (
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/10 text-3xl">
            🗄️
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-neutral-100">
              Falta conectar o banco de dados
            </h2>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-neutral-400">
              O ClaudeWake guarda seu token e seus horários num banco de dados
              gratuito (Upstash Redis). Assim que ele estiver conectado, esta
              tela libera as configurações.
            </p>
          </div>

          <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 text-left text-sm text-neutral-400">
            <p className="font-medium text-neutral-300">Como conectar:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>
                Crie um banco grátis em{" "}
                <a
                  href="https://upstash.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-400 underline underline-offset-2"
                >
                  upstash.com
                </a>
              </li>
              <li>
                Copie a <span className="text-neutral-300">URL</span> e o{" "}
                <span className="text-neutral-300">token</span> da seção REST API
              </li>
              <li>
                Cole nas variáveis de ambiente e reinicie (o passo a passo está
                no README)
              </li>
            </ol>
          </div>

          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-500"
          >
            ↻ Verificar novamente
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="panel flex flex-col gap-6 p-6">
          {/* Token do Claude */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center justify-between text-sm font-medium">
              <span>Token do Claude</span>
              {config.tokenConfigured ? (
                <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-400">
                  ✓ configurado
                </span>
              ) : (
                <span className="rounded-full bg-neutral-700/40 px-2 py-0.5 text-xs text-neutral-400">
                  não configurado
                </span>
              )}
            </label>
            {!config.tokenConfigured || editingToken ? (
              // Modo edição: campo para colar/trocar o token.
              <>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder={
                    config.tokenConfigured
                      ? "Cole o novo token (em branco = mantém o atual)"
                      : "Cole aqui o token (claude setup-token)"
                  }
                  autoComplete="off"
                  autoFocus={editingToken}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 font-mono text-sm text-neutral-100 outline-none focus:border-orange-500"
                />
                <p className="text-xs text-neutral-500">
                  Gere com o comando{" "}
                  <code className="text-neutral-300">claude setup-token</code> no
                  seu terminal. Ele é criptografado antes de ser salvo.
                </p>
                {config.tokenConfigured && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingToken(false);
                      setToken("");
                    }}
                    className="w-fit text-xs text-neutral-500 transition hover:text-neutral-300"
                  >
                    Cancelar edição
                  </button>
                )}
              </>
            ) : (
              // Modo visualização: mostra o token salvo (oculto) + ações.
              <>
                <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
                  <code className="flex-1 break-all font-mono text-sm text-neutral-300">
                    {savedToken === null
                      ? "••••••••••••••••••••••••"
                      : savedToken || "(vazio)"}
                  </code>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={revealToken}
                    disabled={revealing}
                    className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 transition hover:border-neutral-500 hover:text-neutral-100 disabled:opacity-50"
                  >
                    👁{" "}
                    {savedToken !== null
                      ? "Ocultar"
                      : revealing
                        ? "Carregando…"
                        : "Ver"}
                  </button>
                  {savedToken && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(savedToken);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 transition hover:border-neutral-500 hover:text-neutral-100"
                    >
                      {copied ? "✓ Copiado" : "Copiar"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingToken(true);
                      setSavedToken(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-orange-600/50 bg-orange-600/10 px-3 py-1.5 text-xs font-medium text-orange-300 transition hover:bg-orange-600/20"
                  >
                    ✏ Editar
                  </button>
                </div>
                <p className="text-xs text-neutral-500">
                  Este é o token do Claude que está salvo agora. Use{" "}
                  <span className="text-neutral-300">Ver</span> para conferir ou{" "}
                  <span className="text-neutral-300">Editar</span> para trocar.
                </p>
              </>
            )}
          </div>

          {/* Mensagem de ativação */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Mensagem de ativação</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="oi"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-neutral-100 outline-none focus:border-orange-500"
            />
            <p className="text-xs text-neutral-500">
              Mensagem enviada ao Claude nos horários agendados. Mantenha curta
              para economizar sua cota.
            </p>
          </div>

          {feedback && (
            <p
              className={`text-sm ${
                feedback.type === "ok" ? "text-green-400" : "text-red-400"
              }`}
              role="alert"
            >
              {feedback.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="self-start rounded-lg bg-orange-600 px-5 py-2.5 font-medium text-white transition hover:bg-orange-500 disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </form>
      )}
      </main>
    </div>
  );
}
