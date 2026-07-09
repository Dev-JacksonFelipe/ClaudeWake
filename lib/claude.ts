// Envia uma mensagem ao Claude usando o token da assinatura (gerado por
// `claude setup-token`). Isso consome a assinatura do usuário e, portanto,
// inicia a janela de limites de 5 horas — que é o objetivo do app.
//
// O token OAuth do Claude Code é enviado como `Authorization: Bearer` junto
// com o header `anthropic-beta: oauth-2025-04-20`, e o system prompt precisa
// identificar o Claude Code. Essa é uma chamada HTTP simples, então funciona
// bem em funções serverless (Vercel) — sem depender do binário do Claude Code.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

// Modelo usado para o "ping" de ativação. Haiku é o mais econômico em cota;
// como a mensagem é mínima, o consumo é irrelevante. Pode ser trocado via env.
const DEFAULT_MODEL = process.env.CLAUDE_MODEL || "claude-haiku-4-5";

export interface ActivationResult {
  ok: boolean;
  model?: string;
  reply?: string;
  error?: string;
}

export async function activateWindow(
  token: string,
  message: string,
): Promise<ActivationResult> {
  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "oauth-2025-04-20",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        max_tokens: 32,
        system: "You are Claude Code, Anthropic's official CLI for Claude.",
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        ok: false,
        error: `HTTP ${res.status}: ${text.slice(0, 300)}`,
      };
    }

    const data = await res.json();
    const reply = Array.isArray(data?.content)
      ? data.content
          .filter((b: { type?: string }) => b.type === "text")
          .map((b: { text?: string }) => b.text ?? "")
          .join(" ")
          .trim()
      : "";

    return {
      ok: true,
      model: data?.model || DEFAULT_MODEL,
      reply: reply || "(resposta sem texto)",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro desconhecido",
    };
  }
}
