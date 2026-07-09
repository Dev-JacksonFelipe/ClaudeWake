"use client";

import { useState } from "react";

interface Result {
  ok: boolean;
  model?: string;
  reply?: string;
  error?: string;
}

export default function TestButton({ onDone }: { onDone?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function handleTest() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/trigger", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, model: data.model, reply: data.reply });
      } else {
        setResult({ ok: false, error: data.error || "Falha no disparo" });
      }
    } catch {
      setResult({ ok: false, error: "Erro de conexão" });
    } finally {
      setLoading(false);
      onDone?.();
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <button
        onClick={handleTest}
        disabled={loading}
        className="inline-flex w-fit items-center gap-2 rounded-lg bg-orange-600 px-6 py-3 font-medium text-white transition hover:bg-orange-500 disabled:opacity-50"
      >
        {loading ? "Enviando ao Claude…" : "⚡ Testar agora"}
      </button>

      {result && (
        <div
          className={`w-full rounded-lg border p-4 text-left text-sm ${
            result.ok
              ? "border-green-600/40 bg-green-600/10 text-green-200"
              : "border-red-600/40 bg-red-600/10 text-red-200"
          }`}
        >
          {result.ok ? (
            <>
              <div className="font-semibold text-green-300">
                ✓ Janela ativada com sucesso!
              </div>
              <div className="mt-1 text-neutral-300">
                Modelo: <span className="font-mono">{result.model}</span>
              </div>
              <div className="mt-1 text-neutral-400">
                Resposta do Claude: “{result.reply}”
              </div>
            </>
          ) : (
            <>
              <div className="font-semibold text-red-300">✕ Falhou</div>
              <div className="mt-1 break-words text-neutral-300">
                {result.error}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
