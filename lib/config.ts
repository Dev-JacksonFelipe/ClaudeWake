import { getRedis } from "./redis";
import { encrypt, decrypt } from "./crypto";

// Configuração do usuário guardada no Redis (hash "config"):
//   - token: token do Claude (gerado por `claude setup-token`), criptografado
//   - message: mensagem enviada ao Claude para ativar a janela de limites

const CONFIG_KEY = "config";
const DEFAULT_MESSAGE = "oi";

export interface PublicConfig {
  tokenConfigured: boolean;
  message: string;
}

// Retorna a configuração sem expor o token (apenas se está configurado).
export async function getPublicConfig(): Promise<PublicConfig> {
  const redis = getRedis();
  const data = await redis.hgetall<Record<string, string>>(CONFIG_KEY);
  return {
    tokenConfigured: Boolean(data?.token),
    message: data?.message || DEFAULT_MESSAGE,
  };
}

// Retorna o token do Claude em texto puro (uso interno no /api/trigger).
// Remove espaços/quebras de linha por segurança — tokens colados do terminal
// às vezes vêm com \n no meio, o que invalidaria o header de autenticação.
export async function getClaudeToken(): Promise<string | null> {
  const redis = getRedis();
  const encrypted = await redis.hget<string>(CONFIG_KEY, "token");
  if (!encrypted) return null;
  const token = await decrypt(encrypted);
  return token.replace(/\s/g, "");
}

// Retorna a mensagem configurada (ou o padrão).
export async function getMessage(): Promise<string> {
  const redis = getRedis();
  const message = await redis.hget<string>(CONFIG_KEY, "message");
  return message || DEFAULT_MESSAGE;
}

// Salva token (criptografado) e/ou mensagem. Campos ausentes não são alterados.
export async function saveConfig(input: {
  token?: string;
  message?: string;
}): Promise<void> {
  const redis = getRedis();
  const updates: Record<string, string> = {};

  if (typeof input.token === "string" && input.token.trim().length > 0) {
    // Remove qualquer espaço/quebra de linha (tokens colados do terminal
    // costumam vir com \n no meio, o que invalida o header de autenticação).
    updates.token = await encrypt(input.token.replace(/\s/g, ""));
  }
  if (typeof input.message === "string" && input.message.trim().length > 0) {
    updates.message = input.message.trim();
  }

  if (Object.keys(updates).length > 0) {
    await redis.hset(CONFIG_KEY, updates);
  }
}
